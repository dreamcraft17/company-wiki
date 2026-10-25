# dnFinance — VPS Deploy Guide (Nginx + PM2)

> **Status:** Active · **Last updated:** 2026-10-25 · **Author:** Dozer

## Summary

How to run dnFinance on a plain VPS (no Docker, no managed cloud) using **PM2** for process management and **Nginx** as reverse proxy / TLS terminator. Two public domains, two PM2 processes, one Nginx config per domain.

Complements [`DEPLOY.md`](./DEPLOY.md) (local dev + Cloud Run staging) — this doc is the VPS-specific path.

## Topology

| Domain | Serves | PM2 process | Internal port |
|--------|--------|--------------|----------------|
| `finance.dntech.id` | Frontend (React/Vite static build) | `finance-web` | `4173` |
| `api.finance.dntech.id` | Backend API (NestJS) | `finance-api` | `3000` |

Nginx terminates TLS on both domains and reverse-proxies to the two internal ports above. Only Nginx (80/443) is exposed publicly; `3000` and `4173` stay bound to `127.0.0.1`.

> **Future consolidation:** if backend and frontend are later merged into a single deployable (e.g. NestJS serving the built frontend as static files from one process), collapse this to **one** PM2 process named `dnfinance` and **one** Nginx server block. Keep `finance.dntech.id` and `api.finance.dntech.id` as separate `server_name` entries pointing at the same upstream, or redirect the API subdomain to `/api` on the main domain — decide at merge time, not before.

## Prerequisites

On the VPS:

```bash
# Node 20 LTS (matches CI: .github/workflows/ci.yml)
node -v   # expect v20.x

# PM2 (global)
npm install -g pm2

# Nginx + certbot
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

DNS: `finance.dntech.id` and `api.finance.dntech.id` both pointed (A record) at the VPS IP before running certbot.

## 1. Clone & build

```bash
cd /var/www
git clone https://github.com/dreamcraft17/dnfinance.git
cd dnfinance
npm ci
cp .env.dev .env
# edit .env — see "Environment variables" below
npm run build
```

`npm run build` builds `shared` → `apps/backend` → `apps/frontend` in order (root `package.json` script), producing:
- `apps/backend/dist/main.js` — backend entry point
- `apps/frontend/dist/` — static frontend build

## 2. Environment variables (production values)

Set these in `/var/www/dnfinance/.env` before building/starting (see [`DEPLOY.md`](./DEPLOY.md#environment-variables) for the full variable reference):

```bash
PORT=3000
FRONTEND_URL=https://finance.dntech.id
JWT_SECRET=<rotate-to-a-real-secret>
# DATABASE_URL=postgresql://user:pass@host:5432/dnfinance   # optional, enables Postgres sync
# REDIS_URL=redis://localhost:6379                           # optional, Bull queue + cache
# GMAIL_USER / GMAIL_APP_PASSWORD                             # optional, real email delivery
```

`FRONTEND_URL` drives CORS (`apps/backend/src/main.ts` calls `app.enableCors({ origin: process.env.FRONTEND_URL, credentials: true })`) — it **must** be the exact frontend origin or browser requests from `finance.dntech.id` to `api.finance.dntech.id` will be rejected.

The frontend needs its own build-time variable pointing at the API:

```bash
# apps/frontend/.env.production
VITE_API_URL=https://api.finance.dntech.id/api/v1
```

Rebuild the frontend after setting this (`VITE_API_URL` is baked in at build time, not read at runtime):

```bash
npm run build -w apps/frontend
```

## 3. PM2 — backend (`finance-api`)

```bash
pm2 start apps/backend/dist/main.js \
  --name finance-api \
  --cwd /var/www/dnfinance \
  --env production
```

## 4. PM2 — frontend (`finance-web`)

The frontend is a static Vite build; serve it with `serve` under PM2 so it gets the same process management/monitoring as the backend:

```bash
npm install -g serve

pm2 start serve \
  --name finance-web \
  -- -s apps/frontend/dist -l 4173
```

> If you'd rather not run a Node process for static files, skip this step and point Nginx's `root` directly at `apps/frontend/dist` instead (see commented alternative in the Nginx config below). The PM2-managed `serve` approach is what's documented here since it keeps both services visible in `pm2 list`/`pm2 monit`.

## 5. Persist PM2 across reboots

```bash
pm2 save
pm2 startup   # run the printed command once (adds a systemd/init service)
```

## 6. Nginx — `api.finance.dntech.id`

`/etc/nginx/sites-available/api.finance.dntech.id`:

```nginx
server {
    listen 80;
    server_name api.finance.dntech.id;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 7. Nginx — `finance.dntech.id`

`/etc/nginx/sites-available/finance.dntech.id`:

```nginx
server {
    listen 80;
    server_name finance.dntech.id;

    location / {
        proxy_pass http://127.0.0.1:4173;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Alternative if NOT running `finance-web` under PM2 (static root instead):
    # root /var/www/dnfinance/apps/frontend/dist;
    # try_files $uri /index.html;
}
```

Enable both sites and reload:

```bash
sudo ln -s /etc/nginx/sites-available/api.finance.dntech.id /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/finance.dntech.id /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 8. TLS (certbot)

```bash
sudo certbot --nginx -d finance.dntech.id -d api.finance.dntech.id
```

Certbot rewrites both server blocks to redirect 80→443 and adds the `ssl_certificate` directives. Confirm auto-renewal:

```bash
sudo certbot renew --dry-run
```

## 9. Deploy updates

```bash
cd /var/www/dnfinance
git pull origin main
npm ci
npm run build
pm2 restart finance-api finance-web
```

## Known gotcha — `relation "app_snapshots" does not exist`

If `DATABASE_URL` is set, `apps/backend/src/database/database.config.ts` sets `synchronize: process.env.NODE_ENV !== 'production'` — so with `NODE_ENV=production`, TypeORM will **not** auto-create its tables, and none of `database/migrations/001-004*.sql` create them either (those are hand-written reference SQL, not TypeORM migrations). The app crashes on boot with `QueryFailedError: relation "app_snapshots" does not exist`.

One-time fix — create the three TypeORM-backed tables manually:

```bash
psql "$DATABASE_URL" <<'SQL'
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS app_snapshots (
  id INT PRIMARY KEY DEFAULT 1,
  snapshot JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS journal_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  approver_id UUID NOT NULL,
  approval_order INT NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  comments TEXT,
  approved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  frequency VARCHAR(20) NOT NULL DEFAULT 'weekly',
  time VARCHAR(50) NOT NULL DEFAULT '08:00',
  timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Jakarta',
  recipients TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID
);
SQL
```

Only `app_snapshots` is actually read/written at runtime (via `PostgresStoreService`); `journal_approvals`/`scheduled_reports` are registered entities with no repository calls yet, created here only so the app never hits this again if that changes. Restart after: `pm2 restart dnfinance` (or `finance-api` if still split).

## Production checklist

- [ ] DNS for both domains resolves to the VPS before running certbot
- [ ] `JWT_SECRET` rotated from the dev default
- [ ] `FRONTEND_URL` set to `https://finance.dntech.id` (exact origin, no trailing slash)
- [ ] `apps/frontend/.env.production` has `VITE_API_URL=https://api.finance.dntech.id/api/v1`, frontend rebuilt after any change
- [ ] `pm2 save` + `pm2 startup` done so both processes survive a reboot
- [ ] `sudo certbot renew --dry-run` passes
- [ ] `pm2 list` shows `finance-api` and `finance-web` both `online`
- [ ] Decide the merge plan to a single `dnfinance` PM2 process/Nginx block if/when backend+frontend are combined (see Topology note above) — not done yet, this doc still describes the two-process setup

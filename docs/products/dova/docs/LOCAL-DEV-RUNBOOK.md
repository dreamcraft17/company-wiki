# DOVA — Local Development Runbook

> **Author:** Dozer  
> **Service:** DOVA marketplace (NestJS API + Next.js storefront)  
> **Environment:** Localhost / developer machine  
> **Last verified:** 2026-08-29  
> **App repo:** [`dreamcraft17/dova`](https://github.com/dreamcraft17/dova)

**Related:** [RUNBOOK.md](./RUNBOOK.md) (production VPS) · [ENV-SETUP.md](./ENV-SETUP.md) · [PAYSTACK-TEST-MODE.md](./PAYSTACK-TEST-MODE.md) · [DEMO-ACCOUNTS.md](./DEMO-ACCOUNTS.md)

---

## Overview

Run the full DOVA stack on a laptop or workstation for feature work, QA, and debugging. Two modes:

| Mode | When to use | Postgres | Redis |
|------|-------------|----------|-------|
| **In-memory (default)** | Fast UI demo, auth flows, cart/checkout mock pay | Not required | Not required |
| **PostgreSQL** | Migrations, seed data parity with prod, persistence | Required | Optional |

| Component | Dev command | URL |
|-----------|-------------|-----|
| API (NestJS) | `npm run dev -w apps/backend` | http://localhost:3000/api/v1 |
| Storefront (Next.js) | `npm run dev -w apps/frontend` | http://localhost:3001 |
| Health | — | http://localhost:3000/api/v1/health |

Both run together via root `npm run dev`.

---

## Preconditions

- **Node.js 20+** and **npm** (monorepo workspaces)
- **Git** clone: `git clone https://github.com/dreamcraft17/dova.git`
- **Ports free:** `3000` (API), `3001` (frontend dev)
- **Optional:** PostgreSQL 14+ and Redis 7+ (only if `USE_IN_MEMORY=false`)

```bash
node -v    # v20.x or v22.x
npm -v
lsof -i :3000 -i :3001   # should be empty before start
```

---

## First-time setup

From repo root:

```bash
cd dova
npm install
cp .env.dev .env
cp apps/backend/.env.dev apps/backend/.env
cp apps/frontend/.env.dev apps/frontend/.env.local
```

### Required env alignment (CORS)

`npm run dev` serves the storefront on **port 3001**. Backend CORS must match:

```env
# apps/backend/.env
FRONTEND_URL=http://localhost:3001
PAYSTACK_CALLBACK_URL=http://localhost:3001/checkout/verify
```

Root `.env.dev` already uses `FRONTEND_URL=http://localhost:3001`. If registration or cookies fail with CORS errors, check this value first.

---

## Start procedure

### Path A — In-memory (recommended for first run)

No Docker, no Postgres.

```bash
cd dova
npm run dev
```

**Expected output**

- Terminal shows `BE` and `FE` processes (concurrently)
- API log: `DOVA API listening on :3000`
- Next.js: `Local: http://localhost:3001`

**Verify**

```bash
curl -sf http://localhost:3000/api/v1/health
# {"status":"ok"} or similar

curl -sfI http://localhost:3001 | head -1
# HTTP/1.1 200 OK
```

Open http://localhost:3001 — catalog and demo login should load.

### Path B — PostgreSQL (persistent data)

1. Create database:

```bash
createdb dova   # or: psql -c "CREATE DATABASE dova;"
```

2. Set env:

```env
# apps/backend/.env and root .env
USE_IN_MEMORY=false
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dova
```

3. Migrate and seed:

```bash
npm run db:migrate
npm run db:seed
```

4. Start:

```bash
npm run dev
```

**Verify:** same health checks as Path A; login with demo accounts below.

---

## Stop procedure

1. In the terminal running `npm run dev`, press **Ctrl+C** once (stops both BE + FE).
2. Confirm ports released:

```bash
lsof -i :3000 -i :3001
```

3. If a process remains:

```bash
kill $(lsof -t -i :3000) 2>/dev/null
kill $(lsof -t -i :3001) 2>/dev/null
```

---

## Health checks

| Check | Command | Pass |
|-------|---------|------|
| API up | `curl -sf http://localhost:3000/api/v1/health` | JSON with ok status |
| Frontend up | `curl -sfI http://localhost:3001 \| head -1` | `200` |
| Auth (admin) | Login at `/auth/login` with demo admin | Redirect to `/admin` |
| Register OTP | Send code on `/auth/register` | Backend logs `[Reg OTP] email: ######` |
| Register success | Complete signup | Center **Account created** modal → `/products` |

---

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@dova.local` | `admin1234` |
| Supplier | `supplier@dova.local` | `supplier1234` |

Reset demo passwords (Postgres mode):

```bash
npm run db:reset-logins
```

---

## Registration OTP (local)

Email provider (**Resend**) is **optional** in development.

1. Open http://localhost:3001/auth/register
2. Enter email → **Send code**
3. Read OTP from **API terminal**:

```
[Reg OTP] you@example.com: 123456
```

4. Enter code + password → **Create account** → success modal

**Production note:** Resend (or SMTP) is required on VPS; see [ENV-SETUP.md](./ENV-SETUP.md).

**QA fixed OTP (smoke):** email `qa.softlaunch.N@example.com` + env `DOVA_QA_FIXED_OTP=123456`.

---

## Payments (local)

| `PAYSTACK_SECRET_KEY` | Behavior |
|-----------------------|----------|
| Empty | **Mock pay** — checkout completes without Paystack UI |
| `sk_test_...` | Real Paystack test checkout — see [PAYSTACK-TEST-MODE.md](./PAYSTACK-TEST-MODE.md) |

Frontend public key (optional for test UI): `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...` in `apps/frontend/.env.local`.

---

## Common commands

```bash
npm run dev              # API + frontend (watch mode)
npm run build            # shared → backend → frontend
npm run test:unit        # Jest unit tests (shared + backend specs)
npm run test             # unit + backend compile test
npm run db:migrate       # apply SQL migrations (Postgres)
npm run db:seed          # demo catalog + accounts
npm run smoke:week4      # local API smoke (set API_URL=http://localhost:3000/api/v1)
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| CORS error on login/register | `FRONTEND_URL` wrong port | Set `FRONTEND_URL=http://localhost:3001` in `apps/backend/.env`, restart dev |
| `EADDRINUSE :3000` or `:3001` | Previous dev server still running | Stop with Ctrl+C or `kill` (see Stop procedure) |
| Register: “Could not send verification email” | Only in **production** mode | Ensure `NODE_ENV=development` locally |
| OTP never arrives | No Resend in dev | Read `[Reg OTP]` line in **backend** terminal |
| Blank catalog | In-memory not seeded | Use demo login; or run `db:seed` in Postgres mode |
| `shared` import errors | Stale build | `npm run build -w shared` then `npm run dev` |
| Paystack redirect fails | Callback URL mismatch | `PAYSTACK_CALLBACK_URL=http://localhost:3001/checkout/verify` |

---

## Reset / clean slate

**In-memory mode:** restart `npm run dev` — data resets on API restart.

**Postgres mode:**

```bash
npm run db:migrate   # idempotent
npm run db:seed      # refresh catalog + demo users
npm run db:reset-logins
```

**Nuclear (drop DB):**

```bash
dropdb dova && createdb dova
npm run db:migrate && npm run db:seed
```

---

## Rollback (local)

If a pull breaks dev:

```bash
git stash
git checkout main
git pull
npm ci
npm run build -w shared
cp .env.dev .env
cp apps/backend/.env.dev apps/backend/.env
cp apps/frontend/.env.dev apps/frontend/.env.local
npm run dev
```

Restore stashed env if needed: `git stash pop`.

---

## Escalation

| Issue | Contact |
|-------|---------|
| Local env / runbook | Dozer (CTO, DN Tech) |
| Production incident | [RUNBOOK.md](./RUNBOOK.md) — DN Tech infra |

---

## Quarterly validation

- [ ] Fresh clone + Path A start on macOS/Linux
- [ ] Register flow + modal success (Bug-016)
- [ ] Admin + supplier demo login
- [ ] Mock checkout completes
- [ ] `npm run test:unit` passes
- [ ] Update **Last verified** date above

---

*Author: Dozer · Local dev runbook · 2026-08-29*

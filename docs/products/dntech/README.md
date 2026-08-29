# DN Tech Company Profile

> **Author:** Dozer  
> **Updated:** 2026-08-29

Production company profile for **DN Tech** (PT. Dozer Napitupulu Technology): public marketing site, admin CMS, lead capture, email notifications, and SEO foundations.

| | |
|---|---|
| Live | https://www.dntech.id · https://api.dntech.id |
| Repo | [github.com/dreamcraft17/dntech](https://github.com/dreamcraft17/dntech) |
| Latest | `1da8191` |

## What it does

- **Public site** — Homepage, services, products (dnPeople + first-party catalog), blog, about, contact, FAQ, careers, portfolio/case studies. Content is admin-driven; empty states are honest (no fake testimonials or client counts).
- **Admin CMS** — JWT + RBAC. CRUD for content, leads, media, analytics, branding, email logs, settings, users.
- **Leads & email** — Contact form, newsletter, transactional SMTP (nodemailer), retry/logging.
- **SEO** — Sitemap, robots, canonical metadata, JSON-LD, Indonesian copy.

Detailed history: [`docs/CHANGELOG.md`](docs/CHANGELOG.md) · bug register: [`docs/BUG_FIXES.md`](docs/BUG_FIXES.md)

## Current status

| Area | Status |
|------|--------|
| Public + admin | Implemented |
| Public SSR API resolver | Implemented (`server-api.ts`, BF-016–BF-020) |
| Product module (V6/V7) | Implemented; production seed may still be pending on VPS |
| Relaunch anti-slop pass | Implemented (Aug 2026) — honest copy, skip link, CSP headers, deferred third-party JS |
| Unit tests | **99 passing** (50 backend + 49 frontend) |
| CI | Lint + test + build on `main` (`.github/workflows/ci.yml`) |
| Frontend build | Passing (Next.js 16.2.9, React 19.2.4, standalone output) |
| Lighthouse baseline | Recorded — see [`docs/frontend/LIGHTHOUSE-BASELINE.md`](docs/frontend/LIGHTHOUSE-BASELINE.md) |

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| Backend | Node.js, Express 5, TypeScript, Prisma 6 |
| Database | PostgreSQL |
| Auth | JWT + role-based access control |
| Email | SMTP via nodemailer (`mx8.mailspace.id:465`) |
| Deploy | Docker Compose (local) or PM2 + Nginx (VPS) |

## Prerequisites

- Node.js **20** (matches CI)
- PostgreSQL **13+**
- npm

Optional: Docker, Playwright browsers (for E2E), k6 (for performance scripts), Chrome (for Lighthouse).

## Quick start

### Docker (all services)

```bash
docker compose up -d
```

| URL | Service |
|-----|---------|
| http://localhost:3000 | Website |
| http://localhost:4000 | API |
| http://localhost:3000/admin/login | Admin |

### Local development

Start PostgreSQL:

```bash
docker compose up -d db
```

Backend:

```bash
cd backend
cp .env.example .env
npm install
npx prisma db push
npm run db:seed
npm run db:seed-products
npm run dev
```

Frontend:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

**Local admin login** (development seed): email `admin@dntech.id`, password from `LOCAL_DEV_ADMIN_PASSWORD` in `backend/src/utils/adminPassword.ts` (`DevOnly-LocalBootstrap-ChangeMe!`). Production requires a strong `ADMIN_PASSWORD` (min 12 chars; defaults like `Admin@123456` are rejected).

## Scripts

### Backend (`backend/`)

| Command | Purpose |
|---------|---------|
| `npm run dev` | API with hot reload |
| `npm run build` | TypeScript compile (+ `prisma generate`) |
| `npm run start` | Run compiled API |
| `npm run test` | All Jest tests |
| `npm run test:unit` | Unit tests only |
| `npm run test:integration` | Integration tests (needs Postgres) |
| `npm run lint` | ESLint |
| `npm run db:push` | Push Prisma schema |
| `npm run db:seed` | Base seed |
| `npm run db:seed-products` | Seed 7 first-party products |
| `npm run db:vps:seed` | VPS seed helper (see runbook) |
| `npm run validate:env` | Check required env vars |
| `npm run perf:homepage` | k6 homepage script (requires `k6` installed) |

### Frontend (`frontend/`)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build (`validate:env` runs first) |
| `npm run start` | Standalone server (after build) |
| `npm run lint` | ESLint |
| `npm run test` | Jest unit tests |
| `npm run test:e2e` | Playwright smoke tests |
| `npm run lighthouse` | Lighthouse on `/`, `/products/dnpeople`, `/contact` |
| `npm run storybook` | Component docs (Button, Card, SectionHeading) |

## Configuration

Copy examples — never commit real secrets.

### Backend (`.env`)

From `backend/.env.example`:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `PORT` | API port (default `4000`) |
| `FRONTEND_URL` | Allowed CORS origin(s) |
| `TRUST_PROXY` | Set `1` behind Nginx |
| `ADMIN_EMAIL` | Bootstrap admin email |
| `ADMIN_PASSWORD` | Bootstrap password (required in production) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | SMTP server |
| `SMTP_USER` / `SMTP_PASSWORD` | SMTP credentials |
| `SMTP_FROM_NAME` / `SMTP_FROM_EMAIL` | Sender identity |
| `EMAIL_RETRY_ATTEMPTS` / `EMAIL_RATE_LIMIT` | Mail queue tuning |

Legacy SendGrid vars exist but SMTP is preferred.

### Frontend (`.env.local`)

From `frontend/.env.example`:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Public API base (browser + SSR fallback) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (required for build + sitemap) |
| `API_INTERNAL_URL` | **Production SSR:** loopback to PM2 API, e.g. `http://127.0.0.1:4000/api/v1` |
| `NEXT_PUBLIC_ENABLE_EXIT_MODAL` | Set `false` to disable exit-intent modal |
| `NEXT_PUBLIC_CRISP_WEBSITE_ID` | Optional Crisp chat ID |

`NEXT_PUBLIC_*` values are baked in at build time — rebuild after changing them.

## Production SSR

Server Components must use helpers in `frontend/src/lib/server-api.ts`, not raw `fetch` to `localhost`.

| Helper | Use |
|--------|-----|
| `fetchPublicApiList` | Lists (services, FAQ, team, …) |
| `fetchPublicApiSafe` | Detail by slug |
| `fetchPublicApiPaginated` | Paginated lists (blog) |

Resolver chain: `API_INTERNAL_URL` → `http://127.0.0.1:4000/api/v1` → `NEXT_PUBLIC_API_URL`.

After `git pull` on VPS, run `npm run build` in `frontend/` — SSR changes are not live with PM2 restart alone.

## Project structure

```text
dntech/
├── backend/           # Express API, Prisma, email, uploads
│   ├── prisma/
│   ├── src/routes/
│   └── performance/k6/
├── frontend/          # Next.js App Router
│   ├── src/app/(public)/   # Marketing pages
│   ├── src/app/admin/      # CMS
│   ├── src/components/
│   └── e2e/                # Playwright
├── docs/              # PRDs, deployment, testing, launch checklists
├── scripts/           # VPS DB helpers
├── docker-compose.yml
└── README.md
```

## Testing

```bash
# Backend (unit + integration; integration needs Postgres)
cd backend && npm run test

# Frontend unit
cd frontend && npm run test

# Frontend E2E (starts dev server locally or use CI pattern)
cd frontend && npm run test:e2e
```

CI runs backend lint/test/build, frontend lint/test/build, and Playwright smoke tests. See [`docs/TESTING.md`](docs/TESTING.md).

## Deployment

**Full guide:** [`docs/DEPLOYMENT-PRODUCTION.md`](docs/DEPLOYMENT-PRODUCTION.md)  
**VPS Postgres seed:** [`docs/runbooks/vps-postgres-seed.md`](docs/runbooks/vps-postgres-seed.md)

PM2-style update on VPS:

```bash
git pull --rebase origin main

cd backend && npm ci && npx prisma generate && npm run build && pm2 restart dntech-api

cd ../frontend && npm ci && npm run build && pm2 restart dntech-web
```

Production frontend env (in `frontend/.env.local` on server):

```env
NEXT_PUBLIC_API_URL=https://api.dntech.id/api/v1
NEXT_PUBLIC_SITE_URL=https://www.dntech.id
API_INTERNAL_URL=http://127.0.0.1:4000/api/v1
```

Docker alternative:

```bash
docker compose down
docker compose build
docker compose up -d
```

## API overview

Base URL (local): `http://localhost:4000/api/v1`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/services` | Active services |
| `GET` | `/products` | Active products |
| `GET` | `/blog` | Blog posts |
| `GET` | `/settings` | Public site settings |
| `POST` | `/leads` | Submit lead |
| `POST` | `/newsletter/subscribe` | Newsletter signup |
| `GET` | `/search?q=` | Sitewide search |

Admin routes: `/admin/*` (Bearer token required).

## Documentation

| Document | Purpose |
|----------|---------|
| [`docs/PROJECT-OVERVIEW.md`](docs/PROJECT-OVERVIEW.md) | Technical overview |
| [`docs/DEPLOYMENT-PRODUCTION.md`](docs/DEPLOYMENT-PRODUCTION.md) | VPS deploy steps |
| [`docs/TESTING.md`](docs/TESTING.md) | Test layers and CI |
| [`docs/IMPLEMENTATION-STATUS.md`](docs/IMPLEMENTATION-STATUS.md) | Feature status |
| [`docs/frontend/LIGHTHOUSE-BASELINE.md`](docs/frontend/LIGHTHOUSE-BASELINE.md) | Perf/a11y baseline |
| [`docs/launch/`](docs/launch/) | Relaunch checklists and plans |
| [`docs/QA-CHECKLIST-V8.md`](docs/QA-CHECKLIST-V8.md) | Pre/post deploy QA |

## License

Proprietary — DN Tech © 2026. Property of PT. Dozer Napitupulu Technology.

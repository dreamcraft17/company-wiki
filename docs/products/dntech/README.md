# DN Tech Company Profile

> **Author:** Dozer  
> **Updated:** 2026-09-27

Production company profile for **DN Tech** (PT. Dozer Napitupulu Technology): public marketing site, admin CMS, lead capture, email notifications, and SEO foundations.

**Founded by:** Dozer Napitupulu (Founder & Tech Lead) — credited on `/about`.

| | |
|---|---|
| Live | https://www.dntech.id · https://api.dntech.id |
| Repo | [github.com/dreamcraft17/dntech](https://github.com/dreamcraft17/dntech) |
| Latest | `9c69cf3` |

## What it does

- **Public site** — Homepage, services, products (dnPeople + first-party catalog), blog, about (Founded by Dozer Napitupulu), contact, FAQ, careers, portfolio/case studies, privacy, terms. Content is admin-driven; empty states are honest (no fake testimonials or client counts).
- **Admin CMS** — JWT + RBAC. CRUD for content, leads, media, analytics, branding, email logs, settings, users.
- **Leads & email** — Contact form, newsletter, transactional SMTP (nodemailer), retry/logging.
- **SEO** — Sitemap, robots, canonical metadata, JSON-LD, Indonesian copy.

Detailed history: [`CHANGELOG.md`](https://github.com/dreamcraft17/company-wiki/blob/main/docs/products/dntech/docs/CHANGELOG.md) · bug register: [`BUG_FIXES.md`](https://github.com/dreamcraft17/company-wiki/blob/main/docs/products/dntech/docs/BUG_FIXES.md) · **all docs:** [`DOCS.md`](./DOCS.md)

## Current status

| Area | Status |
|------|--------|
| Public + admin | Implemented |
| Public SSR API resolver | Implemented (`server-api.ts`, BF-016–BF-020) |
| Product module (V6/V7) | Implemented; 7 first-party products seeded on VPS |
| About — Founded by | Implemented (`DEFAULT_FOUNDER` + CMS `aboutContent.founder`) |
| Legal pages | Implemented — Kebijakan Privasi + Syarat & Ketentuan (`db:seed-legal`) |
| Relaunch anti-slop pass | Implemented (Aug 2026) — honest copy, skip link, CSP headers, deferred third-party JS |
| Homepage visual refresh | Implemented — hero asset retained; project brief, workflow register, and pricing register added |
| Site-wide visual system | Implemented — editorial surfaces, compact controls, shared public/admin shells, and route-wide legacy class normalization |
| Mekari-inspired information architecture | Implemented — solution-led navigation, modular product catalog, proof/resources grouping, and package decision surfaces; see `docs/research/mekari-inspired-design-2026/` |
| Blog automation | Implemented — scheduled generation queue, max 4 publishes/day, random Indonesian/English/Mandarin output |
| Targeted worker tests | **5 passing** — verified 2026-09-27 |
| CI | Lint + test + build on `main` (`.github/workflows/ci.yml`) |
| Frontend build | Passing locally (Next.js 16.3.4, React 19.2.4, standalone output) — verified 2026-09-27 |
| Lighthouse baseline | Recorded — see [wiki LIGHTHOUSE-BASELINE](https://github.com/dreamcraft17/company-wiki/blob/main/docs/products/dntech/docs/frontend/LIGHTHOUSE-BASELINE.md) |

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
| `npm run worker:blog` | Run the opt-in blog generation queue and daily publish worker |
| `npm run blog:backfill-translations` | Add the missing id/en version to existing blog posts (run `-- --dry-run` first) |
| `npm run services:backfill-translations` | Add the missing id/en version to existing services (run `-- --dry-run` first) |
| `npm run test` | All Jest tests |
| `npm run test:unit` | Unit tests only |
| `npm run test:integration` | Integration tests (needs Postgres) |
| `npm run lint` | ESLint |
| `npm run db:push` | Push Prisma schema |
| `npm run db:seed` | Base seed |
| `npm run db:seed-branding` | About/brand copy including Founded by |
| `npm run db:seed-legal` | Kebijakan Privasi + Syarat & Ketentuan (UU PDP / UU ITE) |
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
| `npm run storybook` | Component docs (Button, Card, SectionHeading, HomeProducts) |

## Languages (`/id` and `/en`)

The public site is served under a locale prefix; `/admin` is not prefixed and stays Indonesian.

**Which language a visitor gets.** `frontend/src/proxy.ts` redirects an unprefixed URL to a locale, in this order: the `NEXT_LOCALE` cookie (a manual choice in the navbar switcher), then the country header from the edge (`cf-ipcountry` on Cloudflare, with the Vercel/Netlify equivalents as fallbacks) — Indonesia gets `id`, everywhere else gets `en` — then `Accept-Language`, then `id`. **If production traffic stops going through Cloudflare, geo detection silently degrades to `Accept-Language`.**

**UI copy** lives in `frontend/src/messages/{id,en}/*.json` (next-intl). Metadata emits a per-locale canonical plus `hreflang` alternates, and the sitemap lists both variants of every route.

**Blog posts and services are bilingual.** Each is one base row written in its own `locale` column (`BlogPost.locale` / `Service.locale`), plus a `*Translation` row per other language (its own title/name, slug, body/description and SEO fields — services also carry `features`). Public endpoints take `?locale=`, resolve either language's slug, and fall back to the original language when a translation is missing — the blog page then shows a notice. Automated blog posts are written in Indonesian and translated to English in the same run; if translation fails the Indonesian post still publishes. Editors can review, fix, regenerate or delete a translation from the admin blog/services screen, and a human-edited translation (`isMachine: false`) is never overwritten by automation.

**Deploying this change.** Push the schema, then backfill the existing content:

```bash
cd backend
npm run db:push
npm run blog:backfill-translations -- --dry-run       # check the plan first
npm run blog:backfill-translations
npm run services:backfill-translations -- --dry-run
npm run services:backfill-translations
```

The blog script's first pass repairs `BlogPost.locale` from the old `language:<code>` tag — automation used to write posts in Indonesian, English or Mandarin at random — so posts are translated from their real language. Services have no such history (every one was written by an admin in Indonesian), so the services script skips straight to translating. Both need `OPENAI_API_KEY` or `GEMINI_API_KEY`; without one, content stays single-language.

**Running a backfill on the VPS**, where the backend is installed without dev dependencies (`tsx` is missing and the npm script fails with `tsx: not found`):

```bash
cd ~/dntech/backend
npm i tsx --no-save        # installs tsx into backend/node_modules
npx prisma generate        # regenerate the client npm just reset
npx tsx scripts/backfill-blog-translations.ts --dry-run
```

Do **not** use `npx -y tsx` — it resolves packages from npm's own cache directory rather than `backend/node_modules`, so `dotenv` and `@prisma/client` are not reachable from there and the script crashes before it can even report `DATABASE_URL` as missing. Installing `tsx` locally (above) is what makes `dotenv/config` pick up `.env` automatically. Afterwards, restore the production-only install and restart: `npm ci --omit=dev && pm2 restart dntech-api`.

**Never run `prisma migrate dev` or `migrate deploy` in this repo** — there is no `prisma/migrations/` directory, so Prisma treats the whole production database as drift and offers to reset it (data loss). Schema changes always go through `prisma db push`, which `scripts/deploy.sh` already runs before restarting the API.

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
| `SENTRY_DSN` | Optional error monitoring (no-op if unset) |
| `GEMINI_API_KEY` | Blog/service text generation and translation (primary) |
| `OPENAI_API_KEY` | Blog cover images (required for covers); optional text fallback |
| `BLOG_AUTOMATION_ENABLED` | Set `true` to run the blog worker |
| `BLOG_AUTOMATION_POSTS_PER_DAY` | Maximum automation articles published per local day; default `4` |
| `BLOG_AUTOMATION_QUEUE_TARGET` | Scheduled automation queue target; default `12` |
| `BLOG_AUTOMATION_SLOTS` / `BLOG_AUTOMATION_TIMEZONE` | Publish slots and local timezone; defaults to `09:00,12:00,15:00,18:00` / `Asia/Jakarta` |
| `BLOG_AUTOMATION_PUBLISH_MODE` / `BLOG_AUTOMATION_DRY_RUN` | Scheduled/direct mode and validation-only mode |
| `BLOG_AUTOMATION_AUTHOR_EMAIL` | Optional active admin/content author for generated posts |

Blog automation is intentionally opt-in. Set `BLOG_AUTOMATION_ENABLED=true` only after configuring an active admin author, `GEMINI_API_KEY` (drafts/translations), and `OPENAI_API_KEY` (cover images). The worker keeps a scheduled generation queue (default target: 12 articles), randomly writes each article in Bahasa Indonesia, English, or Mandarin, and publishes no more than four automation articles per local calendar day at the configured slots. It retries drafts that fail the quality guard or do not receive an OpenAI cover image, skips a topic for the current day after all retries fail so it cannot block the remaining queue, rejects short/placeholder drafts, creates a context-aware cover image with OpenAI only, and defaults to `scheduled` status. If OpenAI image generation is unavailable, the worker does not create the article without a cover and will retry/skip the topic. `BLOG_AUTOMATION_DRY_RUN=true` validates content without writing posts or generating images. Run it as a separate PM2 process with `npm run worker:blog`.

On the VPS, after the first backend build, register the process once: `pm2 start backend/dist/workers/blog-content.worker.js --name dntech-blog-worker --cwd backend`. Future `scripts/deploy.sh` runs restart it automatically when registered.

Legacy SendGrid vars exist but SMTP is preferred.

### Frontend (`.env.local`)

From `frontend/.env.example`:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Public API base (browser + SSR fallback) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (required for build + sitemap) |
| `API_INTERNAL_URL` | **Production SSR:** loopback to PM2 API, e.g. `http://127.0.0.1:4000/api/v1` |
| `NEXT_PUBLIC_ENABLE_EXIT_MODAL` | Set `false` to disable exit-intent modal (code-supported; not in `.env.example`) |
| `NEXT_PUBLIC_CRISP_WEBSITE_ID` | Optional Crisp chat ID |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | Optional error monitoring (no-op if unset) |

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
│   ├── lighthouse-reports/ # Lighthouse JSON (local/CI artifact)
│   └── e2e/                # Playwright
├── scripts/           # VPS DB helpers + deploy.sh
├── legal/             # Privacy + terms HTML (seeded via db:seed-legal)
├── DOCS.md            # Pointer → company-wiki (no docs/ in this repo)
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

CI runs backend lint/test/build, frontend lint/test/build, and Playwright smoke tests. See [TESTING.md (wiki)](https://github.com/dreamcraft17/company-wiki/blob/main/docs/products/dntech/docs/TESTING.md).

## Deployment

**Full guide:** [DEPLOYMENT-PRODUCTION.md (wiki)](https://github.com/dreamcraft17/company-wiki/blob/main/docs/products/dntech/docs/DEPLOYMENT-PRODUCTION.md)  
**VPS Postgres seed:** [vps-postgres-seed.md (wiki)](https://github.com/dreamcraft17/company-wiki/blob/main/docs/products/dntech/docs/runbooks/vps-postgres-seed.md)

**Recommended:** on the VPS, run `./scripts/deploy.sh` — it does `git pull`, rebuilds backend + frontend, and restarts both PM2 processes, aborting on the first failure.

Under the hood (what `scripts/deploy.sh` runs), for reference / manual fallback:

```bash
git pull --rebase origin main

cd backend && npm ci && npx prisma generate && npm run build && pm2 restart dntech-api

cd ../frontend && npm ci && npm run build && pm2 restart dntech-web
```

Production frontend env (in `frontend/.env.local` on server):

```env
NEXT_PUBLIC_API_URL=https://api.dntech.id/api/v1
NEXT_PUBLIC_SITE_URL=https://dntech.id
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

All product documentation lives in **[company-wiki](https://github.com/dreamcraft17/company-wiki/tree/main/docs/products/dntech)** — see [`DOCS.md`](./DOCS.md).

| Document | Purpose |
|----------|---------|
| [00_INDEX](https://github.com/dreamcraft17/company-wiki/blob/main/docs/products/dntech/00_INDEX.md) | Wiki doc index |
| [PROJECT-OVERVIEW](https://github.com/dreamcraft17/company-wiki/blob/main/docs/products/dntech/docs/PROJECT-OVERVIEW.md) | Technical overview |
| [DEPLOYMENT-PRODUCTION](https://github.com/dreamcraft17/company-wiki/blob/main/docs/products/dntech/docs/DEPLOYMENT-PRODUCTION.md) | VPS deploy steps |
| [TESTING](https://github.com/dreamcraft17/company-wiki/blob/main/docs/products/dntech/docs/TESTING.md) | Test layers and CI |
| [CURRENT-IMPLEMENTATION](https://github.com/dreamcraft17/company-wiki/blob/main/docs/products/dntech/docs/CURRENT-IMPLEMENTATION.md) | Living snapshot |
| [LIGHTHOUSE-BASELINE](https://github.com/dreamcraft17/company-wiki/blob/main/docs/products/dntech/docs/frontend/LIGHTHOUSE-BASELINE.md) | Perf/a11y baseline |
| [launch/](https://github.com/dreamcraft17/company-wiki/tree/main/docs/products/dntech/docs/launch) | Relaunch checklists and plans |

## License

Proprietary — DN Tech © 2026. Property of PT. Dozer Napitupulu Technology.

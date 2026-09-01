# DOVA — Engineer Onboarding

> **Status:** Active · **Last updated:** 2026-08-30 · **Author:** Dozer

Get a new engineer from clone to first PR. For deploy/ops procedures see [RUNBOOK.md](./RUNBOOK.md) and [Dova RunBook for localhost.md](./Dova%20RunBook%20for%20localhost.md) — this doc covers codebase orientation, not step-by-step local setup (already documented there).

---

## 1. What DOVA is

A food/agricultural supply marketplace for Nigeria (NGN currency, Paystack payments) connecting buyers, suppliers, and admins. **Production live** at https://dova.dntech.id. See [current-phase.md](./current-phase.md) for live status and [All-features.md](../All-features.md) for the full feature list (101 features, 10 modules, ~67 API routes).

## 2. Repo shape

```
dova/
├─ apps/
│  ├─ backend/    NestJS 11 API (Express platform) — apps/backend/src/
│  └─ frontend/   Next.js 16 / React 19 — apps/frontend/src/
├─ shared/        Types + pure logic shared by both apps (OTP, product units, images)
├─ database/migrations/   Sequential .sql migrations (001_init.sql → 007_password_reset.sql)
├─ scripts/       migrate.js, seed.js, smoke-production-api.js, reset-demo-logins.js
└─ ops/logs/      Smoke-test log output (empty at rest — see note below)
```

npm workspaces: `shared`, `apps/backend`, `apps/frontend`. Both apps depend on `dova-shared` (the `shared/` package) and rebuild it before their own build/dev (`predev` / `prepare` scripts).

**Backend is a single controller.** All ~67 routes live in one file: `apps/backend/src/app.controller.ts`, dispatching into one `AppService` (`app.service.ts`, ~57KB — the largest source file in the repo). There's no per-module controller split yet; when navigating, grep the controller for the route path, then follow into `AppService`.

**Frontend is flat file-based routing.** `apps/frontend/src/pages/*.tsx` — one file per top-level route (`admin.tsx`, `supplier.tsx`, `customer.tsx`, `checkout.tsx`, `cart.tsx`, `products.tsx`), plus subfolders for `auth/`, `checkout/`, `feedback/`, `customer/`, `products/`. Shared logic lives in `src/lib/` (API client, auth-session, payment helpers) and `src/context/`.

## 3. Local setup (quick path)

```bash
npm install                 # installs all 3 workspaces
cp .env.example .env        # defaults already work for local dev — see below
npm run dev                 # runs backend (:3000) + frontend (:3001) concurrently
```

Full env var reference: [ENV-SETUP.md](./ENV-SETUP.md). The two defaults worth knowing on day one:

- **`USE_IN_MEMORY=true`** (the `.env.example` default) — the backend runs against an in-memory fake data store instead of Postgres. No DB setup needed to start developing. Flip to `false` + set `DATABASE_URL` to exercise the real Postgres path (`database.service.ts`).
- **Redis is optional** — `redis.service.ts` only activates when `REDIS_URL` is set *and* `USE_IN_MEMORY` is not `true`. Local dev runs with neither DB nor Redis by default.

Demo accounts (seeded or in-memory): admin `admin@dova.local` / `admin1234` · supplier `supplier@dova.local` / `supplier1234`.

## 4. Where things live (backend)

| File | What it owns |
|------|---------------|
| `app.controller.ts` | All HTTP routes — the entry point for "where does this endpoint live" |
| `app.service.ts` | All business logic: auth, cart, checkout, payments, supplier, admin, feedback |
| `database.service.ts` | Real Postgres queries (raw SQL via `pg`) — only used when `USE_IN_MEMORY=false` |
| `jwt-auth.guard.ts` + `roles.guard.ts` | Auth: Bearer-or-cookie token extraction, `@Public()`/`@Roles()` decorators |
| `paystack.service.ts` | Paystack integration — init, verify, webhook HMAC signature check |
| `feedback.service.ts` | Feedback board (votes, comments, changelog, official replies) |
| `mail.util.ts` / `email-templates.ts` | Transactional email (SMTP or Resend, see `mail.util.spec.ts`) |
| `env-guard.ts` | Fails fast on boot if required prod secrets are missing |
| `main.ts` | Bootstrap: `helmet`, global `ValidationPipe`, `/api/v1` prefix, CORS |

**Testing note:** the large `app.service.spec.ts` suite (1090 lines) runs entirely against the in-memory fake, not real Postgres — `database.service.spec.ts` is the one that exercises real SQL, and it currently covers far fewer of `DatabaseService`'s ~70 methods. Keep that in mind before assuming a passing `npm test` proves the DB-backed path works — see [ENGINEERING-HEALTH-2026-08-30.md](./ENGINEERING-HEALTH-2026-08-30.md) for the current gap analysis.

## 5. Where things live (frontend)

| Path | What it owns |
|------|---------------|
| `src/pages/*.tsx` | One file per route (Next.js Pages Router, not App Router) |
| `src/lib/api.ts` | Fetch wrapper — token attach, refresh-on-401 retry, error normalization |
| `src/lib/auth-session.ts` | Access/refresh token storage (session vs local storage) |
| `src/lib/payment.ts` | Paystack checkout client helpers |
| `src/context/` | React context providers (cart, auth, etc.) |
| `src/components/auth/*` | Shared auth UI (login/register forms, OTP input) |

## 6. Common tasks

```bash
npm run test               # unit tests (jest, all 3 workspaces) — 160 tests as of 2026-08-30
npm run test:coverage      # coverage report (~52% global; see engineering-health doc)
npm run typecheck          # tsc --noEmit across shared + both apps
npm run db:migrate         # apply database/migrations/*.sql
npm run db:seed            # seed demo data
npm run smoke:production   # hit the live production API (needs SMOKE_OTP_CODE env)
```

CI: `.github/workflows/ci.yml` (test/build) and `database-migrate.yml` (migration check).

## 7. Docs map — where to look next

| Need | Doc |
|------|-----|
| Full feature inventory | [FEATURE-CATALOG.md](./FEATURE-CATALOG.md), [All-features.md](../All-features.md) |
| API reference | [API Documention.md](./API%20Documention.md), [DOVA-API-QA-POSTMAN.md](./DOVA-API-QA-POSTMAN.md) |
| Current known issues / triage | [DOVA-BUG-TRIAGE.md](./DOVA-BUG-TRIAGE.md) |
| Test/QA gaps & CTO priorities | [ENGINEERING-HEALTH-2026-08-30.md](./ENGINEERING-HEALTH-2026-08-30.md) |
| Deploy / rollback | [RUNBOOK.md](./RUNBOOK.md), [VPS-DEPLOY.md](./VPS-DEPLOY.md) |
| Env vars (full list) | [ENV-SETUP.md](./ENV-SETUP.md) |
| Manual test scenarios | [TEST-CASES.md](./TEST-CASES.md) |
| Everything else | [00_INDEX.md](../00_INDEX.md) |

## 8. First-week guardrails

- Don't assume `npm test` passing means the Postgres path works — it mostly tests the in-memory fake (see §4).
- The auth guard's `@Public()` and optional-auth branches aren't covered by tests — read `jwt-auth.guard.ts` directly rather than trusting its spec file to document all behavior.
- `GET payments/verify` has a side effect (marks orders paid) — don't treat it as a safe/cacheable GET when reasoning about client code.
- Production deploys are single-server (PM2 on a VPS), not containerized — see [VPS-DEPLOY.md](./VPS-DEPLOY.md) before assuming Docker/k8s conventions apply.

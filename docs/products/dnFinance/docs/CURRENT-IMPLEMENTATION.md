# dnAccounting — Current Implementation Baseline

| Metadata | Value |
|----------|-------|
| Snapshot date | 2 August 2026 |
| Purpose | Baseline setelah implementasi V2 Phase 2 |
| Spec baseline | PRD/SRS/SDD V2.0 |
| Owner | Dozer |
| Phase | **V2 ~78% → staging prep** |

## One-line status

**MVP + V2 P1 fitur lengkap di codebase.** Demo client siap. Production penuh butuh Postgres/Redis/Gmail live + GCP deploy secrets.

## Product baseline

| Area | Implementation |
|------|----------------|
| Product | Multi-tenant cloud accounting (Indonesia SME) |
| Frontend | React 19 + Vite + Redux + Tailwind (`apps/frontend`, :5173) |
| Backend | NestJS 11 API (`apps/backend`, :3000 `/api/v1`) |
| Shared | COA templates, PPN/PPh helpers (`shared/`) |
| Persistence | JSON file `.data/store.json` + optional Postgres JSONB snapshot |
| Auth | JWT + refresh token · roles: admin / accountant / manager / viewer |
| Email | Nodemailer (simulated or Gmail) + Bull/in-memory queue |
| Cache | Redis or in-memory Map |
| Tests | 78 (22 unit + 56 integration) |
| API docs | Swagger `/api/docs` v2.0 |

## Backend modules (V2)

| Module | Path | Purpose |
|--------|------|---------|
| Database | `database/` | TypeORM optional Postgres JSONB snapshot |
| Email | `email/` | Templates + Nodemailer |
| Queue | `queue/` | Bull or in-memory jobs |
| Cache | `cache/` | Redis or in-memory TTL |
| Approval | `approval/` | 24h JWT approval tokens |
| Scheduler | `scheduler/` | Cron overdue + scheduled reports |
| Logger | `logger/` | Winston structured logs |
| Middleware | `middleware/` | Rate limiting |

## Available now (code)

| Journey | Status |
|---------|--------|
| Register → COA template → journal → post GL | Available |
| Invoice + PPN → send → AR aging | Available |
| Bill + PPh 23 → approval (UI + email token) → GL | Available |
| Journal approval workflow | Available |
| Reports TB/P&L/BS/CF + department filter | Available |
| Scheduled reports CRUD + cron | Available |
| Import COA / opening / customers / vendors | Available |
| Inventory stock in/out + valuation | Available |
| PDF invoice + CSV e-Faktur + GL export | Available |
| Demo seed + reset | Available |

## Conditional (env)

| Item | Env | Fallback |
|------|-----|----------|
| PostgreSQL | `DATABASE_URL` | JSON file store |
| Redis / Bull | `REDIS_URL` | In-memory queue/cache |
| Gmail | `GMAIL_USER`, `GMAIL_APP_PASSWORD` | Simulated email log |
| Staging deploy | GCP secrets in GitHub Actions | Manual deploy |

## Frontend pages

Dashboard · Accounts · Journal · General Ledger · Reports · Customers · Invoices · Vendors · Bills · Inventory · Import · Admin · Audit · **Approve** (public token)

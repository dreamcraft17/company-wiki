# dnAccounting — Phase 2 Implementation Status

**Date:** August 2026  
**Baseline:** MVP V1 (~92% PRD must-haves)  
**Target:** PRD_V2 / SRS_V2 / SDD_V2 production hardening

---

## Summary

| Area | V1 MVP | V2 Target | V2 Status |
|------|--------|-----------|-----------|
| Core accounting (COA, GL, AR/AP, tax, inventory) | ✅ 92% | Maintain | ✅ |
| Production stack (Postgres, Gmail, Bull, Redis) | ❌ Simulated | P0 | ⚠️ Optional env wiring + fallbacks |
| Journal approval workflow | ❌ | P1 | ✅ |
| Email approval tokens (24h JWT) | ❌ | P1 | ✅ |
| Scheduled reports (cron) | ❌ | P1 | ✅ |
| Department dimension + P&L filter | ❌ | P1 | ✅ |
| Vendor CSV import | ❌ | P1 | ✅ |
| Rate limiting (100 req/min) | ❌ | P1 | ✅ |
| Winston structured logging | ❌ | P0 | ✅ |
| Integration tests (50+) | 16 unit | 50+ | ✅ 55 integration + 22 unit |
| CI/CD staging deploy | ❌ | P0 | ✅ Workflow stub (GCP secrets required) |
| Frontend V2 (approve page, schedules, dept) | Partial | P1 | ✅ |
| Full relational TypeORM schema | ❌ | P0 | ⚠️ JSONB snapshot bridge (not full migration) |
| Report / GL Redis cache (P2) | ❌ | P2 | ⚠️ Cache service wired; TB/P&L invalidation partial |
| Cloud Storage PDFs (P2) | ❌ | P2 | ❌ Deferred |

**Overall V2 readiness:** ~78% — demo + staging-ready with optional infra; full production requires `DATABASE_URL`, `REDIS_URL`, Gmail, and GCP secrets.

---

## P0 — Production Infrastructure

| Requirement | Status | Notes |
|-------------|--------|-------|
| PostgreSQL + TypeORM | ⚠️ | `DATABASE_URL` → JSONB snapshot in `app_snapshots`; dual-write with file store |
| Gmail + Nodemailer | ⚠️ | Real send when `GMAIL_USER` + `GMAIL_APP_PASSWORD`; simulates locally |
| Bull job queue | ⚠️ | Bull when `REDIS_URL`; in-memory queue fallback |
| Redis cache | ⚠️ | Redis when `REDIS_URL`; in-memory Map fallback |
| Winston logging | ✅ | Structured JSON; Datadog-ready fields |
| Rate limiting | ✅ | 100 req/min per IP (`RateLimitMiddleware`) |
| Staging CI/CD | ✅ | `.github/workflows/deploy-staging.yml` + `Dockerfile` |
| 50+ integration tests | ✅ | `integration.spec.ts` (55) + unit (22) = 77 total |
| Health endpoint stack probe | ✅ | `GET /health` reports postgres/email/redis flags |

---

## P1 — Feature Completeness

| Feature | API | Frontend |
|---------|-----|----------|
| Journal entry approval | `POST /journal-entries/:id/submit-for-approval`, `POST /journal-approvals/:id/approve` | Journal page toggle + submit |
| Email approval tokens | `GET/POST /approvals/token/:token` | `/approve/:token` public page |
| Scheduled reports | `POST/GET /scheduled-reports`, cron 6/8/9 AM Jakarta | Reports page scheduler UI |
| Department dimension | `department` on accounts, `GET /departments`, P&L filter | Accounts + Reports |
| Vendor CSV import | `POST /import/vendors` | Import page |
| AR/AP overdue cron | Scheduler service registered | Backend only |

---

## Running Locally (no Docker)

```bash
cd dnFinance
cp .env.dev .env
npm install
npm run dev
```

Demo: `demo@dnaccounting.id` / `demo123456`

**With production stack (optional):**

```bash
export DATABASE_URL=postgresql://...
export REDIS_URL=redis://...
export GMAIL_USER=...
export GMAIL_APP_PASSWORD=...
```

---

## Tests

```bash
npm run test          # 77 tests (unit + integration)
npm run test:coverage
npm run build
```

---

## Remaining for Full Production (Q1 2027)

1. **Full relational migration** — replace JSONB snapshot with SDD §4 normalized entities
2. **100% Postgres reads** — remove file store as source of truth
3. **Datadog APM** — trace instrumentation (P2)
4. **GCS PDF storage** — move exports off local disk (P2)
5. **Load test + security audit** — per PRD launch checklist
6. **Configure GCP secrets** for staging workflow to deploy

---

## Key Files (V2)

- Backend modules: `database/`, `email/`, `queue/`, `cache/`, `approval/`, `scheduler/`, `middleware/`, `logger/`
- Migration ref: `database/migrations/003_departments.sql`
- CI: `.github/workflows/deploy-staging.yml`, `Dockerfile`
- Tests: `apps/backend/src/integration.spec.ts`, `app.service.spec.ts`

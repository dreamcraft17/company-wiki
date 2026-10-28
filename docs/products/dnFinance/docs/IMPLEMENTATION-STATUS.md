# dnFinance — Implementation Status (V2)

> Terakhir diperbarui: **2 August 2026**  
> Referensi: PRD/SRS/SDD **V2.0** (+ V1 MVP baseline)  
> Owner: Dozer · DN Tech · Local: `dnFinance/`

## Ringkasan

| Phase | Target | Status |
|-------|--------|--------|
| V1 MVP | COA, GL, AR/AP, inventory, tax, reports, demo | **Done (~92%)** |
| V2 P0 — Production stack | Postgres, Gmail, Bull, Redis, CI, 50+ tests | **~78%** |
| V2 P1 — Features | JE approval, email tokens, scheduler, departments | **Done** |
| V2 P2 — Optimization | Report cache, GCS, Datadog APM | **Roadmap** |

**Overall V2 readiness:** ~78% — demo + staging-ready dengan optional infra; full production butuh `DATABASE_URL`, `REDIS_URL`, Gmail, GCP secrets.

## Matriks vs spek V2

| Area | Requirement | Kode | Catatan |
|------|-------------|------|---------|
| PostgreSQL + TypeORM | P0 | Conditional | JSONB snapshot saat `DATABASE_URL` set; fallback file store |
| Gmail + Nodemailer | P0 | Conditional | Real jika `GMAIL_*`; simulasi lokal |
| Bull + Redis queue | P0 | Conditional | Bull jika `REDIS_URL`; in-memory fallback |
| Redis cache | P0 | Conditional | In-memory Map fallback |
| Winston logging | P0 | Available | Structured JSON |
| Rate limit 100/min | P1 | Available | `RateLimitMiddleware` |
| Journal approval | P1 | Available | Submit → pending → approve → post |
| Email approval tokens | P1 | Available | JWT 24h, `/approve/:token` |
| Scheduled reports | P1 | Available | Cron + CRUD + UI |
| Department + P&L filter | P1 | Available | COA tag + report param |
| Vendor CSV import | P1 | Available | `POST /import/vendors` |
| Integration tests 50+ | P0 | Available | 56 integration + 22 unit = **78** |
| Staging CI/CD | P0 | Conditional | Workflow + Dockerfile; GCP secrets required |
| Full relational schema | P0 | Roadmap | Migration ref only |

## Verifikasi lokal

```bash
cd dnFinance
npm install
cp .env.dev .env
npm run test      # 78 tests
npm run build
npm run dev
# UI http://localhost:5173 · API http://localhost:3000/api/v1
# Swagger http://localhost:3000/api/docs
```

Demo: `demo@dnaccounting.id` / `demo123456` — lihat [DEMO-ACCOUNTS.md](./DEMO-ACCOUNTS.md)

## Spek

- [PRD/PRD-V2.md](./PRD/PRD-V2.md)
- [PRD/SRS-V2.md](./PRD/SRS-V2.md)
- [PRD/SDD-V2.md](./PRD/SDD-V2.md)
- V1 status: [../docs/STATUS.md](../docs/STATUS.md)

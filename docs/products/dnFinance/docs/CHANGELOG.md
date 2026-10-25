# dnAccounting — Changelog (living docs)

## 2026-08-02 — V2 Phase 2 implementation

### Added
- Production infra modules: database, email, queue, cache, approval, scheduler, logger, rate-limit
- Journal entry approval workflow + tenant setting
- Email approval tokens (24h JWT) + public `/approve/:token` page
- Scheduled reports (API + cron + Reports UI)
- Department dimension on COA + P&L filter
- Vendor CSV import
- 56 integration tests (78 total with unit)
- `Dockerfile` + `.github/workflows/deploy-staging.yml`
- `docs2/` living documentation suite
- `docs/PRD_V2.md`, `SRS_V2.md`, `SDD_V2.md`, `STATUS_V2.md`

### Changed
- Swagger version 2.0
- Health endpoint reports stack flags (postgres, email, redis)
- `.env.dev` expanded with optional production vars
- Frontend: Accounts, Journal, Reports, Import pages (V2 features)

### Notes
- Local dev still works without Docker (file store + simulated email)
- Full production requires Postgres, Redis, Gmail env + GCP secrets

---

## 2026-08-01 — MVP demo-ready (~92%)

### Added
- Full MVP: COA, GL, AR/AP, inventory, tax, reports
- Demo seed + file persistence
- PDF invoice, e-Faktur CSV, GL export
- Frontend polish + `DEMO.md`
- `docs/STATUS.md` vs PRD/SRS/SDD
- 16 unit tests

---

## Earlier

- Initial monorepo: NestJS + React + shared package
- PRD/SRS/SDD v1.0 specs in `docs/`

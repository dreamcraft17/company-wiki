# dnCore Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/).

---

## [2026-07-19] — dnCore PRD v1.0 implementation

### Added
- Plan tiers **FREE / STARTER / PROFESSIONAL / ENTERPRISE** (legacy STARTUP retained)
- `ModuleAccessInterceptor` — module access by subscription plan
- Sales **DRAFT → confirm** with inventory reservation (`reserveStock`)
- Real retention purge (`DataRetentionService` + `POST /compliance/retention/purge`)
- Outbound webhooks: HMAC dispatch consumer + domain event fan-out
- Ops: `scripts/setup-dev.sh`, `db-migrate.sh`, `purge-old-data.sh`, `restore-drill.sh`
- `Docs/incident-response.md`, Helm `hpa.yaml` / `pdb.yaml`, Terraform Phase-5 stubs
- Migration `0015` — plan enum FREE/STARTER
- Spec package `Docs/prd/` (PRD/SDD/SRS dnCore v1.0)

### Changed
- Product brand surfaces → **dnCore** (Swagger, health, UI title, TOTP issuer, RabbitMQ exchange)
- README / CURRENT-IMPLEMENTATION / FEATURE-CATALOG aligned to dnCore

### Verified
- Backend unit tests: **393 passed / 84 suites** (19 Jul 2026)

---

## [2026-07-19] — Docs baseline sync (CURRENT-IMPLEMENTATION + FEATURE-CATALOG)

### Added
- `Docs/CURRENT-IMPLEMENTATION.md`, `FEATURE-CATALOG.md`, `00_INDEX.md`

### Verified
- Backend unit tests: **392 passed / 84 suites**

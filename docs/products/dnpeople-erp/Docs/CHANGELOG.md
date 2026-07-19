# dnCore Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/).

---

## [2026-07-19] — Docs metric sync to HEAD `2aaf9f9`

### Changed
- README, CURRENT-IMPLEMENTATION, PRD/SDD/SRS headers, Doc 12/25, V3 status — live metrics **397** tests / **85** suites · HEAD `2aaf9f9`

---

## [2026-07-19] — Phase 5 go-live hardening (retry, digest, k6, security)

### Added
- Stripe `payment_failed` → retry queue (3× backoff) + `/billing/payment-retry`
- Digest emails wired to `EmailService` + `POST /notifications/digest/send-now`
- `scripts/load-test/k6-authenticated.js`, `scripts/security-acceptance.sh`
- Cypress `role-uat.cy.ts` + dnCore smoke rebrand

### Verified
- Backend unit tests: **397 passed / 85 suites**

---

## [2026-07-19] — dnCore remaining gaps closed (Shopify SO, shipping, quota, ops)

### Added
- Shopify sync/webhook → Sales Order DRAFT + customer upsert
- Shipping carrier adapters (JNE/Sicepat) + `POST /integrations/shipping/label`
- Webhook **3× retry + DLQ** (`webhook.dlq`)
- Per-tenant hourly **API quota** interceptor
- Grafana provisioned dashboards (system + SLA)
- Terraform Phase-5 bodies (S3/EKS/CloudFront/IAM/monitoring)
- Ops restore-test UI, `scripts/load-test.sh`, mobile dnCore rebrand

### Verified
- Backend unit tests: **394 passed / 84 suites**

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

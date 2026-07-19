# dnCore — Current Implementation Baseline

**Snapshot date:** 19 July 2026  
**HEAD:** `fdc12c2`  
**Purpose:** source baseline after **dnCore PRD/SRS/SDD v1.0** + mobile-first web + V3 module-page wiring (Expo on hold)  
**Specification:** [`Docs/prd/01-PRD-dnCore-v1.md`](./prd/01-PRD-dnCore-v1.md) · [`02-SDD`](./prd/02-SDD-dnCore-v1.md) · [`03-SRS`](./prd/03-SRS-dnCore-v1.md)  
**Owner:** Dozer (CEO + Tech Lead) · **Company:** DN Tech · **Brand:** dnCore  
**UpdatedAt:** July 19, 2026  

> Komplementer ke **dnPeople** (HRIS). Repo ini = NestJS ERP monolit modular di [github.com/dreamcraft17/erp](https://github.com/dreamcraft17/erp).

## How to use

1. **Available now** = perilaku kode yang harus tetap kompatibel kecuali PRD baru mengubahnya.  
2. **Conditional** = coded tapi butuh AWS/keys/vendor/App Store.  
3. **Roadmap** = belum dijanjikan sebagai existing.  
4. Live status matrix V3: [`Docs/v3/IMPLEMENTATION-STATUS.md`](./v3/IMPLEMENTATION-STATUS.md).

## Product & architecture

| Area | Current implementation |
|------|------------------------|
| Product | **dnCore** — multi-tenant SaaS ERP (GL, sales, supply chain, HR/payroll subset, manufacturing, CRM, workflow, reporting) |
| Frontend | React 19 + Vite + Redux Toolkit + MUI + Tailwind; **30** pages; hub `/enterprise` |
| Backend | NestJS 10 + TypeORM + PostgreSQL 15; **27** domain modules + `platform/` |
| Data | **86** TypeORM entities; **18** migrations (`0000`–`0017`) |
| Auth | JWT access/refresh, 2FA TOTP (issuer `dnCore`), Google SSO, portal JWT, throttling |
| Plans | **FREE / STARTER / PROFESSIONAL / ENTERPRISE** (+ legacy `STARTUP` alias) — module + storage quota enforced |
| Tenant | Row-level `tenantId`; optional schema-per-tenant |
| Webhooks | Outbound HMAC (`X-dnCore-Signature`) + 3× retry/DLQ for sales/PO/invoice/GL/workflow events |
| Infra deps | Redis, RabbitMQ (`dnCore.events`), Elasticsearch, Prometheus, Grafana |
| Mobile web | Responsive SPA shell (drawer + scroll tables) · Expo native **on hold** |
| Automated evidence | **408** unit tests · **88** suites · coverage gate ≥60% |

## Phase 8 in-repo close-out (19 Jul 2026)

| Area | Change |
|------|--------|
| Marketplace revenue share | Purchase + split ledger · Stripe Connect when keyed else MOCK |
| Reseller admin | `/platform/reseller` + `/reseller` page |
| Copilot depth | Executes SQL · optional OpenAI pattern hint |
| ETL | Real COUNT via DataSource (allowlist) |
| E-sign / OCR | DocuSign env adapter · optional tesseract CLI |
| Migration | `0017` |

## Module pages V3 wiring (19 Jul 2026)

| Page | Wired |
|------|-------|
| Analytics | Cash-flow forecast + AR risk (+ existing sales/churn/anomalies) |
| Documents | Search, OCR, e-sign request |
| Workflows | Inbox detail drawer |
| Integrations | OAuth URL, shipping label, marketplace list |
| Enterprise hub | Scrollable tax/backup tables |

## Mobile-first web UI (19 Jul 2026)

| Area | Change |
|------|--------|
| Shell | Temporary drawer + hamburger &lt; `md`; permanent sidebar on desktop |
| Tables | `CrudTable` + `ScrollableTable` horizontal scroll |
| KPI grids | Sales / Inventory / Manufacturing / HR / Projects / Dashboard responsive |
| Expo native | **On hold** — Phase 6 foundation remains in `/mobile` but not actively expanded |

## Phase 6 mobile foundation (19 Jul 2026) — Expo **ON HOLD**

| Area | Change |
|------|--------|
| Push devices | `mobile_device_tokens` + `/notifications/devices/*` + Expo fan-out on `send()` |
| Mobile tabs | Home · Approvals · Orders · Settings |
| Offline | AsyncStorage cache for dashboard / orders / approvals |
| Biometric | Face ID / fingerprint unlock gate |
| Migration | `0016` Phase6MobileDeviceTokens |

## Phase 5 go-live hardening (19 Jul 2026)

| Area | Change |
|------|--------|
| Stripe payment retry | `invoice.payment_failed` → schedule 3× backoff + `/billing/payment-retry` |
| Daily digest | Cron + `POST /notifications/digest/send-now` → EmailService |
| k6 authenticated | `scripts/load-test/k6-authenticated.js` (P95 &lt;500ms stages to 100 VU) |
| Security acceptance | `scripts/security-acceptance.sh` |
| Cypress | dnCore smoke + `role-uat.cy.ts` |

## dnCore v1.0 completion (19 Jul 2026 — full in-repo)

| Area | Change |
|------|--------|
| Billing | PRD tiers Free/Starter/Pro/Enterprise; seat/module/storage + **hourly API quota** |
| Module access | `ModuleAccessInterceptor` |
| Sales | DRAFT → confirm + inventory reserve |
| Retention | Real purge + scripts |
| Webhooks | HMAC dispatch + **3× retry + DLQ** |
| Shopify | Sync/webhook → **create Sales Orders** (DRAFT) |
| Shipping | JNE/Sicepat adapters + label API (live when keyed) |
| Slack | Block Kit approve button |
| Ops UI | Restore-test PASS/FAIL on Enterprise hub |
| Grafana | Provisioned system + SLA dashboards |
| Terraform | S3/EKS/CloudFront/IAM/monitoring resources (gated) |
| Mobile | dnCore brand + refresh/error on dashboard |
| Load smoke | `scripts/load-test.sh` |

## Conditional / external (not blocked on code)

| Item | Notes |
|------|-------|
| AWS apply | Terraform ready; needs credentials |
| Stripe / Slack / Shopify / JNE live keys | Adapters coded · Connect revenue share MOCK/live |
| App Store submit | **On hold** (Expo native paused); use mobile-first web |
| SOC 2 Type II | Process Phase 8 |

## Ops scripts (SDD §11)

| Script | Path |
|--------|------|
| Dev bootstrap | `scripts/setup-dev.sh` |
| Migrations | `scripts/db-migrate.sh` |
| Retention purge | `scripts/purge-old-data.sh` |
| Restore drill | `scripts/restore-drill.sh` |
| Smoke / checklist | `scripts/production-smoke.sh`, `production-checklist.sh` |
| Load smoke | `scripts/load-test.sh` · `scripts/load-test/k6-authenticated.js` |
| Security acceptance | `scripts/security-acceptance.sh` |
| Incident runbook | `Docs/incident-response.md` |

Property of DN Tech — PT. Dozer Napitupulu Technology · 2026

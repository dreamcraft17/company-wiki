# dnCore — Current Implementation Baseline

**Snapshot date:** 19 July 2026  
**Purpose:** source baseline after **dnCore PRD/SRS/SDD v1.0** implementation  
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
| Data | **83** TypeORM entities; **16** migrations (`0000`–`0015`) |
| Auth | JWT access/refresh, 2FA TOTP (issuer `dnCore`), Google SSO, portal JWT, throttling |
| Plans | **FREE / STARTER / PROFESSIONAL / ENTERPRISE** (+ legacy `STARTUP` alias) — module + storage quota enforced |
| Tenant | Row-level `tenantId`; optional schema-per-tenant |
| Webhooks | Outbound HMAC (`X-dnCore-Signature`) for sales/PO/invoice/GL/workflow events |
| Infra deps | Redis, RabbitMQ (`dnCore.events`), Elasticsearch, Prometheus, Grafana |
| Mobile | Expo MVP scaffold (`/mobile`) |
| Automated evidence | **394** unit tests · **84** suites · coverage gate ≥60% |

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
| Stripe / Slack / Shopify / JNE live keys | Adapters coded |
| App Store submit | EAS profiles ready |
| SOC 2 Type II | Process Phase 8 |

## Ops scripts (SDD §11)

| Script | Path |
|--------|------|
| Dev bootstrap | `scripts/setup-dev.sh` |
| Migrations | `scripts/db-migrate.sh` |
| Retention purge | `scripts/purge-old-data.sh` |
| Restore drill | `scripts/restore-drill.sh` |
| Smoke / checklist | `scripts/production-smoke.sh`, `production-checklist.sh` |
| Incident runbook | `Docs/incident-response.md` |

Property of DN Tech — PT. Dozer Napitupulu Technology · 2026

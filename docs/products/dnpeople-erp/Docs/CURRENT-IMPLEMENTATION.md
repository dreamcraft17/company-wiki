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
| Automated evidence | **393** unit tests · **84** suites · coverage gate ≥60% |

## dnCore v1.0 deltas (19 Jul 2026)

| Area | Change |
|------|--------|
| Billing | PRD tiers Free/Starter/Pro/Enterprise; seat/module/storage limits |
| Module access | `ModuleAccessInterceptor` blocks path by plan |
| Sales | Create = **DRAFT**; confirm reserves inventory then publishes event |
| Retention | Real SQL soft/hard purge + `POST /compliance/retention/purge` + `scripts/purge-old-data.sh` |
| Webhooks | Consumer `webhook.dispatch` + domain event fan-out |
| Ops | `setup-dev.sh`, `db-migrate.sh`, `restore-drill.sh`, `Docs/incident-response.md`, Helm HPA/PDB |
| Brand | Product surfaces renamed **dnCore** (API title, health, UI, TOTP issuer) |

## Available now (module inventory)

Lihat [`FEATURE-CATALOG.md`](./FEATURE-CATALOG.md). Ringkas: Auth, Tenants, Finance, Sales, Supply Chain, HR, Manufacturing, Projects, CRM, Fixed Assets, Enterprise, Reporting, Workflow, Analytics, Documents, Integrations, Portal, Billing, GDPR, Compliance, Ops, LMS, Platform, Industry, Notifications, Scheduler, Users, Health.

## Conditional / external

| Item | Notes |
|------|-------|
| AWS EKS/RDS live | Terraform stubs + Helm ready; credentials Conditional |
| Stripe / Slack / Shopify / JNE | Coded; live keys Conditional |
| Mobile App Store | Expo MVP only |
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

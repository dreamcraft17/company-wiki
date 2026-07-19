# dnPeople ERP — Current Implementation Baseline

**Snapshot date:** 19 July 2026  
**HEAD:** `9bf15e2`  
**Purpose:** source baseline for the next PRD / SRS / roadmap (Doc 25 successor)  
**Specification baseline:** Docs 01–03 (Phase 0–4) + Docs/v3 PRD/SRS/SDD (Phase 5–8)  
**Owner:** Dozer (CEO + Tech Lead) · **Company:** DN Tech (PT. Dozer Napitupulu Technology) · **Brand:** dnPeople ERP  
**UpdatedAt:** July 19, 2026  

> **Bukan** sama dengan produk HRIS `dnpeople` (Express + Next.js). Repo ini = NestJS ERP monolit modular di [github.com/dreamcraft17/erp](https://github.com/dreamcraft17/erp).

## How to use

1. **Available now** = perilaku kode yang harus tetap kompatibel kecuali PRD baru mengubahnya.  
2. **Conditional** = coded tapi butuh AWS/keys/vendor/App Store.  
3. **Roadmap** = belum dijanjikan sebagai existing.  
4. Live status matrix V3: [`Docs/v3/IMPLEMENTATION-STATUS.md`](./v3/IMPLEMENTATION-STATUS.md).

## Product & architecture

| Area | Current implementation |
|------|------------------------|
| Product | Multi-tenant SaaS ERP untuk SME → mid-market Indonesia (GL, sales, supply chain, HR/payroll, manufacturing, CRM, …) |
| Frontend | React 19 + Vite + Redux Toolkit + MUI + Tailwind; **30** page components; hub `/enterprise` (V3) |
| Backend | NestJS 10 + TypeORM + PostgreSQL 15; **27** domain modules + `platform/` |
| Data | **83** TypeORM entities; **15** migrations (`1730000000000`–`0014`) |
| Auth | JWT access/refresh, 2FA TOTP, Google SSO, portal JWT terpisah, login throttling |
| Tenant | Row-level `tenantId`; optional schema-per-tenant (`TENANT_SCHEMA_MODE`) |
| Infra deps | Redis, RabbitMQ, Elasticsearch, Prometheus, Grafana (Docker Compose) |
| Mobile | Expo MVP scaffold (`/mobile`) |
| Automated evidence | **392** unit tests · **84** suites · coverage gate ≥60% (verified 19 Jul 2026) |

### Local ports

| Service | Port |
|---------|------|
| API (`/api/v1`, Swagger `/api/docs`, `/metrics`) | 3000 |
| Frontend (Vite) | 5173 |
| PostgreSQL / Redis / RabbitMQ / ES | 5432 / 6379 / 5672 / 9200 |
| Prometheus / Grafana | 9090 / 3001 |

## Available now (module inventory)

| Module | Path | Capabilities (summary) | Status |
|--------|------|------------------------|--------|
| Auth | `modules/auth` | Register, login, JWT, 2FA, password reset, Google SSO | Available |
| Tenants | `modules/tenants` | Provisioning, subscription plan | Available |
| Finance | `modules/finance` | GL, COA, JE, AP/AR, statements, e-Faktur, bank recon, GL events | Available |
| Sales | `modules/sales` | Orders, quotations, credit limit, volume pricing | Available |
| Supply chain | `modules/supply-chain` | Products, warehouses, PO, GR, MRP, barcode | Available |
| HR | `modules/hr` | Employees, attendance, leave, PPh 21 payroll, ATS, 360°, THR/bonus | Available |
| Manufacturing | `modules/manufacturing` | BOM, MO, scrap, capacity | Available |
| Projects | `modules/projects` | Projects, tasks, time, budget | Available |
| CRM | `modules/crm` | Leads, opportunities, pipeline | Available |
| Fixed assets | `modules/fixed-assets` | Register, depreciation, maintenance | Available |
| Enterprise | `modules/enterprise` | RFQ, cycle count, FX, QC, multi-company | Available |
| Reporting | `modules/reporting` | Custom reports, dashboard builder, KPI alerts, OLAP | Available |
| Workflow | `modules/workflow` | Approvals, SLA, escalations | Available |
| Analytics | `modules/analytics` | Forecast, churn, anomaly (rule/ensemble MVP) | Available · Conditional depth |
| Documents | `modules/documents` | Upload, e-sign stub | Available · Conditional vendor |
| Integrations | `modules/integrations` | Stripe/Slack/Zapier/Shopify/JIRA/shipping gallery | Available · Conditional keys |
| Portal | `modules/portal` | Customer/vendor portal JWT | Available |
| Billing | `modules/billing` | Plan limits, Stripe checkout | Available · Conditional live Stripe |
| GDPR | `modules/gdpr` | Export, consent, erasure | Available |
| Compliance | `modules/compliance` | Tax XML export, retention, audit (V3) | Available · MVP+ |
| Ops | `modules/ops` | Backup monitor, restore-test log (V3) | Available · Conditional AWS |
| LMS | `modules/lms` | Courses, enrollments, certificates (V3) | Available · MVP+ |
| Platform | `platform/` | Partner, white-label, ETL, registry | Available · MVP+ |
| Industry | `modules/industry` | Industry packs scaffold | Available · MVP |
| Notifications / Scheduler / Users / Health | respective modules | In-app notify, cron, admin users, health | Available |

## Frontend surfaces

30 pages including Dashboard, Finance, Sales, Inventory, HR, Manufacturing, Projects, CRM, Fixed Assets, Reports, Report/Dashboard Builder, Analytics, Documents, Workflows, Integrations, Notifications, Settings/Users/Audit/2FA/GDPR, Portal, Auth flows, and **Enterprise V3 hub** (`/enterprise`).

## Completion summary

| Dimensi | Status |
|---------|--------|
| Phase 0–4 (core ERP) | **~95% coded** — production-ready *code* |
| V3 Phase 5–8 | **~85% coded (MVP+)** — compliance, ops, LMS, AI/enterprise depth |
| Production live AWS | Conditional — templates ready, not live |
| Mobile App Store | Conditional — Expo scaffold only |
| SOC 2 Type II | External audit |

## Production / UAT gates

- AWS credentials + live RDS/S3 backup lifecycle  
- Live payment / DocuSign / OCR / shipping API keys  
- Authenticated load test on production-sized data  
- Signed browser UAT per role  
- Mobile store submission  

## Not implemented / roadmap boundary

- Full FastAPI/Prophet microservice (analytics optional)  
- Production-grade microservices split (platform registry is scaffold)  
- Native store-ready mobile feature parity  
- Guaranteed 99.9% SLA without ops stack live  

## Source references

- [FEATURE-CATALOG.md](./FEATURE-CATALOG.md)  
- [v3/IMPLEMENTATION-STATUS.md](./v3/IMPLEMENTATION-STATUS.md)  
- [12-PROJECT-STATUS.md](./12-PROJECT-STATUS.md) (Phase 1–4 era — see V3 delta)  
- [25-PRD-BASELINE-CURRENT-STATE.md](./25-PRD-BASELINE-CURRENT-STATE.md) (pre-V3 baseline — supersede metrics with this doc)  
- [00_INDEX.md](./00_INDEX.md)  

Property of DN Tech — PT. Dozer Napitupulu Technology · 2026

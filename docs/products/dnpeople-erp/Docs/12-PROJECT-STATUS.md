# dnPeople — Project Status & Current Specs

**Terakhir diperbarui:** 7 Juli 2026 — **Phase 1–4 COMPLETE · Production-Ready (code)**  
**Branch aktif:** `main`  
**Repository:** [github.com/dreamcraft17/erp](https://github.com/dreamcraft17/erp)  
**Versi implementasi:** Enterprise Pass v1.0 + Phase 1–4 + Production Hardening  
**Estimasi coverage Docs 01–10:** **~95%** (core SRS); sisa = live ops + full microservice split  
**Latest commit:** `e2f46fc` — production hardening, industry module, 15 locales

> Dokumen ini adalah **single source of truth** untuk kondisi proyek saat ini.  
> Executive tracking: [`update/CEO-TRACKING-SHEET.md`](../update/CEO-TRACKING-SHEET.md)

---

## Ringkasan Eksekutif

| Dimensi | Target (Docs) | Kondisi Saat Ini | Estimasi |
|---------|---------------|------------------|----------|
| Modul backend | 15+ | **24 modul** (23 domain + platform + industry) | ✅ 100% |
| Fitur bisnis (SRS) | 150+ | Phase 1–4 shipped | **~95%** |
| API endpoints | 200+ | REST v1 + Swagger | **~90%** |
| Frontend pages | 20+ | **29 halaman** React SPA | ✅ 100% |
| CRUD UI | Full per modul | Semua modul major | **~95%** |
| Unit tests | 60%+ coverage | **390 tests** (83 suites) · **≥60%** | ✅ |
| E2E tests | Cypress | 15+ spec files (auth, portal, Phase 1–3 flows) | **~70%** |
| i18n | 15+ languages | **15 locales** (EN/ID full, others EN fallback) | ✅ Phase 4 |
| Arsitektur SDD | 12 microservices | Modular monolith + registry scaffold | MVP ✅ |
| Multi-tenant | Schema-per-tenant | Row-level + optional `TENANT_SCHEMA_MODE=schema` | ✅ |
| Production deploy | AWS + K8s + Helm | Templates + scripts ready | 🟡 needs AWS secrets |

**Kesimpulan:** Semua pekerjaan **coding Phase 1–4 selesai**. Proyek **production-ready** sebagai modular monolith. Satu-satunya blocker live deploy = **AWS credentials + live API keys** (Stripe, SMTP).

---

## Phase Roadmap — Status

| Phase | Fokus | Status | Commit |
|-------|-------|--------|--------|
| **Phase 0** | Scaffolding, Docs 00–06, 16 modul MVP | ✅ | awal |
| **Phase 1** | Custom reports, workflow, integrations, portal JWT | ✅ | `af202eb` · `5d10ce3` |
| **Phase 2** | Dashboard builder, KPI alerts, OLAP, documents, workflow SLA | ✅ | `177ef96` |
| **Phase 3** | Analytics, e-sign, HR 360°, mobile Expo, platform registry | ✅ | `c933d0e` |
| **Phase 4** | 15 locales, industry templates, prod Docker/Helm/Terraform, smoke scripts | ✅ | `e2f46fc` |

---

## Metrik Live

| Metrik | Nilai |
|--------|-------|
| Unit tests | **390** (83 suites) |
| Coverage | **≥60%** (CI gate) |
| Migrations | `0005`–`0013` |
| Locales | **15** |
| Industry templates | **5** (retail, mfg, services, hospitality, healthcare) |
| Frontend build | ✅ green |
| Mobile | ✅ Expo + SecureStore + EAS profiles |

---

## Backend — Modul & Status

Path: `backend/src/modules/` + `backend/src/platform/`

| Modul | Path | Status |
|-------|------|--------|
| Auth | `auth/` | ✅ JWT, 2FA, SSO Google, throttling, refresh |
| Tenants | `tenants/` | ✅ Provisioning, quota |
| Finance | `finance/` | ✅ GL, AP/AR, SAK-EP, e-Faktur, dunning, intercompany |
| Sales | `sales/` | ✅ Orders, quotations, credit limit, delivery |
| Supply Chain | `supply-chain/` | ✅ PO, MRP, barcode, transfer |
| HR | `hr/` | ✅ Payroll PPh 21, ATS, **360° feedback** |
| Manufacturing | `manufacturing/` | ✅ BOM versioning, scrap, capacity |
| Projects | `projects/` | ✅ Billable time, deps, budget |
| CRM | `crm/` | ✅ Pipeline, communications |
| Fixed Assets | `fixed-assets/` | ✅ Depreciation, maintenance |
| Enterprise | `enterprise/` | ✅ RFQ, PR, cycle count, QC |
| Reporting | `reporting/` | ✅ Custom reports, **dashboard builder**, KPI alerts, OLAP |
| Workflow | `workflow/` | ✅ Engine, inbox, **SLA dashboard**, reorder |
| Analytics | `analytics/` | ✅ Forecast, churn, anomalies |
| Documents | `documents/` | ✅ Upload, **e-signature** |
| Integrations | `integrations/` | ✅ Stripe/Slack/Zapier/Shopify/JIRA/shipping |
| Portal | `portal/` | ✅ JWT auth, statement, tickets, PDF, vendor upload |
| Industry | `industry/` | ✅ **5 industry templates** (Phase 4) |
| Platform | `platform/` | ✅ Microservice registry scaffold |
| Billing | `billing/` | ✅ Stripe checkout |
| GDPR | `gdpr/` | ✅ Export, erasure |
| Health | `health/` | ✅ **Live/ready probes** (DB + Redis) |
| Scheduler | `scheduler/` | ✅ Dunning, KPI alerts, report cron |

**Production hardening:** env validation, graceful shutdown, Prometheus text metrics, `docker-compose.prod.yml`

---

## Frontend — Halaman (29)

| Halaman | Route | Status |
|---------|-------|--------|
| Dashboard | `/` | ✅ |
| Finance / Sales / Inventory / HR / Mfg / Projects / CRM / Fixed Assets | `/:section` | ✅ |
| Reports + Report Builder + Dashboard Builder | `/reports`, `/report-builder`, `/dashboard-builder` | ✅ |
| Analytics | `/analytics` | ✅ Phase 3 |
| Documents | `/documents` | ✅ |
| Workflows | `/workflows` | ✅ |
| Integrations | `/integrations` | ✅ |
| Portal | `/portal`, `/portal/login` | ✅ |
| Settings / Users / Audit / 2FA / GDPR | `/settings/*` | ✅ |

i18n: **15 locales** via `LocaleSelector` — `frontend/src/i18n/supportedLocales.ts`

---

## Infrastructure & DevOps

| Komponen | Lokasi | Status |
|----------|--------|--------|
| Docker Compose (dev) | `docker-compose.yml` | ✅ |
| Docker Compose (prod) | `docker-compose.prod.yml` | ✅ |
| Kubernetes / Helm | `k8s/helm/` | ✅ staging + **production values** |
| Terraform | `terraform/` | ✅ VPC, RDS, Redis + **prod.tfvars** |
| CI | `.github/workflows/ci.yml` | ✅ test + coverage gate + E2E |
| Deploy staging | `deploy-staging.yml` | ✅ smoke post-deploy |
| Deploy production | `deploy-production.yml` | ✅ helm lint + smoke |
| Scripts | `scripts/` | ✅ `production-smoke.sh`, `db-backup.sh`, `production-checklist.sh` |
| Monitoring | `monitoring/prometheus.yml` | ✅ scrape `/api/v1/metrics` |
| Migrations | `backend/src/database/migrations/` | ✅ 14 files (`0000`–`0013`) |
| E2E | `frontend/cypress/e2e/` | ✅ 15 spec files |

---

## Yang Masih Belum (ops only — bukan coding)

| Item | Status |
|------|--------|
| AWS staging/prod live deploy | 🟡 Set GitHub Secrets → `terraform apply` |
| Live Stripe / Slack / SMTP keys | 🟡 Fill `backend/.env.production` |
| RDS migrations verified on live | 🟡 After staging deploy |
| App Store / Play Store submit | 🟡 EAS profiles ready |
| Full microservice split | 📋 Scaffold only — still monolith |
| SOC 2 certification | 📋 Doc 24 scaffold |

---

## Cara Menjalankan

```bash
# Dev
npm run infra:up
cd backend && npm run db:migrate && npm run db:seed && npm run start:dev
cd frontend && npm run dev

# Production stack (local)
npm run infra:prod
npm run smoke:prod
npm run checklist:prod

# Login: admin@demo.com / Demo1234!
# Portal: customer@demo.com / Demo1234!
```

---

## Changelog Dokumen Ini

| Tanggal | Perubahan |
|---------|-----------|
| 3 Jul 2026 | Initial — Enterprise Pass + Deep Module Pass |
| 5 Jul 2026 | Phase 1 Tier-1 + coverage 60% |
| 7 Jul 2026 | **Phase 2–4 complete, production-ready, 390 tests, 15 locales, industry module** |

---

*Maintainer: update setiap milestone deploy atau release major.*

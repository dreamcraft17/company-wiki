# Product Requirements Document (PRD) — dnCore v1.0

**Product Name:** dnCore  
**Version:** 1.0  
**Date:** 19 July 2026  
**Owner:** Dozer (CEO + Tech Lead) · PT. Dozer Napitupulu Technology (DN Tech) · [dntech.id](https://dntech.id)  
**Repository:** [github.com/dreamcraft17/erp](https://github.com/dreamcraft17/erp)  
**Branch:** `main` · HEAD `3cff9ac`  
**Status:** Phase 0–4 production code ✅ · Phase 5–8 MVP+ ✅ · Live deploy conditional 🟡  

---

## 1. Executive Summary

**dnCore** adalah enterprise SaaS ERP multi-tenant untuk SME → mid-market di Indonesia, melengkapi produk **dnPeople** (HRIS) dalam ekosistem DN Tech.

| Dimensi | Deskripsi |
|---------|-----------|
| **Produk inti** | Finance + Supply Chain + Manufacturing + HR (payroll subset) + CRM + Workflow + Reporting + Analytics |
| **Pasar target** | SME (50–500 employees), mid-market yang ingin unified business system + Indonesia compliance |
| **Positioning** | "Core of your business" — modular, honest pricing, no fake metrics, production-grade architecture |
| **Scope** | 27 domain modules · 30 frontend pages · 84 database entities · 404 unit tests · 15 locales |
| **Go-to-market** | Q3 2026 soft launch + Q4 2026 public (conditional AWS live credentials) |

**Key differentiator vs Mekari Talenta / SAP S/4HANA:**
- Modular monolith (not rigid microservices complexity)
- Transparent, honest pricing (IDR 20–25K/employee/month entry tier, free tier 100 employees)
- Indonesia-first compliance built-in (e-Faktur, PPh 21, SAK-EP)
- Modern stack (NestJS + React + TypeORM, not legacy Java/ABAP)

---

## 2. Product Identity & Positioning

### 2.1 Produk & Scope

| Attribute | Value |
|-----------|-------|
| **Tipe** | SaaS, multi-tenant, cloud-first |
| **Kategori** | Integrated ERP system |
| **Deployment** | AWS (Terraform + Helm + Docker) · on-prem Docker Compose supported |
| **Tenant model** | Row-level `tenantId` (default) · optional schema-per-tenant `TENANT_SCHEMA_MODE=schema` |
| **Compliance** | SAK-EP · e-Faktur · PPh 21 · UU PDP GDPR-aligned · audit log built-in |
| **Konteks bisnis** | Komplementer ke **dnPeople** — dnPeople handle HR/payroll, dnCore handle finance/operations/workflow |

### 2.2 Brand Architecture

```
DN Tech (Platform umbrella)
├── dnPeople (HRIS + Payroll + Talent) — Express + Next.js
└── dnCore (ERP: Finance + Supply Chain + Manufacturing + CRM + Workflow) — NestJS + React
```

**Messaging:** "dnPeople for your people · dnCore for your business."

---

## 3. Market Opportunity

### 3.1 Target Market

**Primary:** Indonesia SMEs (50–500 emp), secondary mid-market (500–2000 emp)  
**Verticals:** Retail, Manufacturing, Professional Services, Hospitality, Healthcare  
**Pain points they have:**
- Fragmented systems (spreadsheets + QuickBooks + manual GL reconciliation)
- No real-time visibility (sales → AR → GL takes days)
- Compliance overhead (e-Faktur, PPh 21, depreciation, intercompany)
- No workflow enforcement (approval queues are email-based)
- High manual effort (no MRP, no capacity planning, no integrated reporting)

**What dnCore solves:**
- Single, integrated GL ↔ Sales ↔ Supply Chain ↔ Manufacturing ↔ HR payroll
- Real-time dashboards + custom reports + OLAP analytics
- Automated compliance exports (e-Faktur, SPT stubs, audit trail)
- Workflow engine with SLA + escalation
- Industry templates (retail, mfg, services, hospitality, healthcare)

### 3.2 Competitive Landscape

| Competitor | Strengths | Dncore edge |
|------------|-----------|------------|
| **Mekari Talenta** | HR-focused, existing SME base | dnCore: integrated operations (GL, SC, Mfg), modern stack, transparent pricing |
| **SAP S/4HANA** | Enterprise-grade, powerful | dnCore: modular, simpler, Indonesia SME price point (1/100 cost) |
| **Odoo** | Modular, open-source | dnCore: cloud-first, better UX, Indonesia compliance out-of-box, managed SaaS |
| **Accurate Online** | Indonesia-native, GL focus | dnCore: modular depth (SC, Mfg, analytics), workflow engine, modern UX |

---

## 4. Product Features & Capabilities

### 4.1 Core Modules — Inventory & Status

**Legend:** ✅ Available (coded, UI/API exists) · 🟡 Conditional (coded, needs vendor/keys) · 📋 Roadmap (not yet)

| # | Module | Scope | Status | Highlights |
|---|--------|-------|--------|------------|
| **1** | **Auth & Identity** | Register, login, JWT, 2FA TOTP, Google SSO, password reset, throttling | ✅ Available | Refresh token rotation, audit log per login |
| **2** | **Tenants** | Provisioning, plan management, quota enforcement | ✅ Available | Self-service signup, plan limits per module |
| **3** | **Finance** | GL, COA, JE, AP/AR, statements (BS/P&L/CF), e-Faktur, bank recon, intercompany, dunning | ✅ Available | SAK-EP compliant, multi-currency GL, dunning automation |
| **4** | **Sales** | Orders, quotations, credit limit, volume pricing, delivery tracking, confirm→AR | ✅ Available | Credit limit enforcement, shipping integration (JNE, Sicepat) |
| **5** | **Supply Chain** | Products, warehouses, PO, GR, inventory, MRP, barcode scanning, transfers | ✅ Available | Barcode tracking, MRP for demand forecast, multi-warehouse |
| **6** | **Manufacturing** | BOM (versioned), MO, scrap tracking, capacity planning, QC | ✅ Available | BOM explosion, capacity check before MO confirm |
| **7** | **HR** | Employees, attendance, leave mgmt, recruitment ATS, 360° feedback, payroll PPh 21, THR/bonus | ✅ Available | PPh 21 tax calc, leave accrual, ATS pipeline |
| **8** | **Projects** | Project creation, tasks, billable time tracking, budget, dependencies | ✅ Available | Time sheet integration, budget variance alerts |
| **9** | **CRM** | Leads, opportunities, pipeline, communications history | ✅ Available | Opportunity scoring, sales pipeline dashboard |
| **10** | **Fixed Assets** | Asset register, depreciation (SL/DB), maintenance schedule | ✅ Available | Depreciation methods per asset class |
| **11** | **Enterprise** | RFQ, purchase requisitions, cycle count, FX, QC workflow, multi-company | ✅ Available | RFQ to PO workflow, cycle count audit |
| **12** | **Reporting** | Custom reports, report builder, dashboard builder (drag-drop widgets), KPI alerts | ✅ Available | OLAP queries, scheduled reports, export to Excel/PDF |
| **13** | **Workflow** | Approval engine, inbox, SLA dashboard, escalation, reorder | ✅ Available | Condition-based routing, escalation rules, SLA breach alerts |
| **14** | **Analytics** | Forecast (rule-based), churn detection, anomaly detection, what-if scenario | ✅ Available · Conditional | Rule-based MVP; advanced ML optional Phase 6 |
| **15** | **Documents** | Upload, versioning, e-sign workflow (stub), archive | ✅ Available · Conditional | Stub certificate; DocuSign integration Phase 6 |
| **16** | **Integrations** | Stripe, Slack, Zapier, Shopify, JIRA, shipping (JNE/Sicepat), email | ✅ Available · Conditional | Gallery UI, OAuth stubs; live keys conditional |
| **17** | **Portal** | Customer & vendor portal, JWT separate auth, payment history, tickets, document upload | ✅ Available | Self-service vendor invoice upload, statement viewing |
| **18** | **Billing** | Plan management, Stripe checkout, quota enforcement | ✅ Available · Conditional | Live Stripe account required for checkout |
| **19** | **GDPR & Privacy** | Export, consent tracking, data erasure, retention policies | ✅ Available | UU PDP (Indonesia) compliant, audit trail retained |
| **20** | **Compliance & Audit** | Audit log, tax export (e-Faktur XML), retention rules, purge cron | ✅ Available | Immutable audit trail, tax compliance exports |
| **21** | **Ops & Monitoring** | Backup monitor, restore-test log, Prometheus metrics, health probes | 🟡 Conditional | AWS RDS backups, live S3 restore-test required |
| **22** | **LMS** | Courses, enrollments, certificates, completion tracking | ✅ Available · MVP+ | Phase 5; basic content types |
| **23** | **Notifications** | In-app alerts, email notifications, scheduled digest | ✅ Available | SLA escalation, approval pending, workflow updates |
| **24** | **Scheduler** | Cron jobs, dunning automation, report scheduling, KPI alerts, batch exports | ✅ Available | Native scheduler, RabbitMQ consumer for async |
| **25** | **Industry Templates** | 5 vertical packs: retail, mfg, services, hospitality, healthcare | ✅ Available | Preset module configs, sample COA, dashboards per vertical |
| **26** | **Platform & ISV** | Partner registration, white-label hooks, ETL framework, registry | ✅ Available · MVP+ | Scaffold ready; full microservices split Phase 7 |
| **27** | **Users & Access** | Admin console, role management, team management, 2FA enforcement | ✅ Available | RBAC, IP whitelist, session timeout |

### 4.2 Frontend Pages (30 total)

| Category | Pages | Status |
|----------|-------|--------|
| **Dashboard & core ERP** | Dashboard, Finance module, Sales, Inventory, HR, Manufacturing, Projects, CRM, Fixed Assets | ✅ 9 pages |
| **Reporting & BI** | Reports list, Report Builder, Dashboard Builder, Analytics | ✅ 4 pages |
| **Automation & integration** | Workflows, Integrations, Documents | ✅ 3 pages |
| **Admin & settings** | Settings hub, Users mgmt, Audit log, 2FA setup, GDPR tools | ✅ 5 pages |
| **Auth flows** | Login, Register, Email verify, Forgot password, Reset password | ✅ 5 pages |
| **Portal (separate)** | Portal login, Portal dashboard, Statement view, Tickets, Vendor upload | ✅ 3 pages |
| **New v3 Enterprise hub** | `/enterprise` — unified operations command center | ✅ 1 page |

### 4.3 Non-Functional Capabilities

| Capability | Status | Details |
|-----------|--------|---------|
| **Multi-tenancy** | ✅ Available | Row-level `tenantId` default; schema mode optional |
| **Localization** | ✅ Available | 15 locales (ID + EN full; 13 others EN fallback) |
| **Security** | ✅ Available | JWT + refresh, 2FA, SSO Google, Helmet, CORS, rate limit, audit log |
| **Performance** | ✅ Available | Redis caching, Elasticsearch full-text, async RabbitMQ |
| **Reliability** | ✅ Available | Health probes (DB, Redis), graceful shutdown, error boundary UI |
| **Compliance** | ✅ Available | SAK-EP, e-Faktur, PPh 21, UU PDP, GDPR export/erasure, audit trail |
| **Scalability** | ✅ Available (infra-ready) | K8s Helm templates, Terraform IaC, load test scripts ready |
| **Testing** | ✅ Available | 404 unit tests (86 suites), E2E Cypress 15 specs, ≥60% coverage gate |
| **Mobile web** | ✅ Available | Responsive SPA (drawer, scroll tables, KPI) |
| **Mobile Expo** | ⏸️ On hold | Foundation in `/mobile`; native expansion paused |

---

## 5. Phase Roadmap & Delivery Timeline

### 5.1 Phase Recap (0–4: Delivered)

| Phase | Period | Deliverables | Status |
|-------|--------|--------------|--------|
| **Phase 0** | Early 2026 | NestJS scaffold, 16-modul MVP, Docker Compose, Docs 00–06 | ✅ Complete |
| **Phase 1** | Late Q1 2026 | Custom reports, workflow engine, integrations gallery, portal JWT | ✅ Complete |
| **Phase 2** | Q2 2026 | Dashboard builder, KPI alerts, OLAP, documents, workflow SLA | ✅ Complete |
| **Phase 3** | Q2–Q3 2026 | Analytics, e-sign, HR 360°, Expo mobile, platform registry, shipping | ✅ Complete |
| **Phase 4** | Q3 2026 | 15 locales, industry templates, prod Docker/Helm/Terraform, smoke scripts | ✅ Complete |

### 5.2 Phase 5–8 Roadmap (Next: 2026–2027)

| Phase | Timeline | Focus | Effort | Status |
|-------|----------|-------|--------|--------|
| **Phase 5: Go-Live & Production Hardening** | Q3 2026 (Aug–Sep) | AWS credentials + live deploy, Stripe/DocuSign/SMTP keys, load test prod-size data, UAT per role, mobile App Store | 2–3 weeks | 🟡 Conditional |
| **Phase 6: Mobile Native GA** | Q4 2026 (Oct–Dec) | Full module parity Expo, offline sync, push, biometric, App Store | 6–8 weeks | ⏸️ **On hold** (use mobile-first web) |
| **Phase 7: Advanced Analytics & AI** | Q1 2027 (Jan–Mar) | FastAPI microservice (Prophet forecasting), what-if scenarios, anomaly root cause, AI dashboard, copilot queries | 8–12 weeks | 📋 Planned |
| **Phase 8: Enterprise Tier-2** | Q2 2027 (Apr–Jun) | Full microservices split, OCR documents, LMS depth, Azure AD/SAML SSO, white-label partner portal, multi-region | 12–16 weeks | 📋 Planned |

### 5.3 Release Cadence

- **Current (19 Jul 2026):** `v1.0.0-beta` (code complete, pre-production)
- **Phase 5 (Aug 2026):** `v1.0.0` production launch
- **Phase 6 (Dec 2026):** `v1.1.0` mobile GA
- **Phase 7 (Mar 2027):** `v2.0.0` advanced analytics
- **Phase 8 (Jun 2027):** `v2.1.0` enterprise

---

## 6. Pricing & Go-to-Market

### 6.1 Pricing Tiers (Proposal — subject to go-live validation)

| Tier | Target | Price/employee/month | Seats limit | Modules included | Status |
|------|--------|----------------------|-------------|------------------|--------|
| **Free** | Micro (trial) | IDR 0 | 100 | Core ERP (GL, Sales, Inventory, HR basic, Reports) | Planned |
| **Starter** | SME growth | IDR 20K | 500 | Free + Manufacturing, Projects, CRM, Workflow, Analytics | Planned |
| **Professional** | Mid-market | IDR 25K | 2000 | Starter + Advanced analytics, LMS, Portal, Integrations, e-Signatures | Planned |
| **Enterprise** | Large org | Custom | Unlimited | All modules + dedicated support, white-label, custom development | Planned |

**Notes:**
- Per-module add-ons possible (e.g., +10% for LMS, +5% for advanced analytics)
- Annual billing: 20% discount
- Non-profit / education: 50% discount

### 6.2 Go-to-Market Strategy

| Phase | Activity | Timeline |
|-------|----------|----------|
| **Beta** | Private beta with 5–10 pilot customers (Jakarta, Bandung, Surabaya) | Aug 2026 |
| **Soft Launch** | Public availability, community/LinkedIn marketing, founding customer pricing | Sep 2026 |
| **Public GA** | Full web presence, integrator partner outreach, channel partnerships | Oct 2026 |
| **Expansion** | Regional expansion (Bandung, Medan, Yogya), localization (Thai, Vietnamese) | Q1 2027 |

**Channels:**
- B2B SaaS communities (Startup Lokal, Komunitas Teknologi Indonesia)
- Accountant/bookkeeper partnerships (referral revenue share)
- Integrator network (Zapier, shipping, banking partners)
- Direct sales to mid-market (500–2K emp)

---

## 7. Success Metrics & KPIs

### 7.1 Product Metrics

| Metric | Target (Year 1) | Target (Year 2) | Notes |
|--------|-----------------|-----------------|-------|
| **Monthly Active Users (MAU)** | 500 (across 50 companies) | 2000 (across 200 companies) | Paying customers + trial |
| **Net Revenue Retention (NRR)** | 95%+ | 110%+ | Expansion + upsell |
| **Churn rate** | <5%/month | <3%/month | Gross logo churn |
| **Customer Acquisition Cost (CAC)** | <3M IDR | <2M IDR | Including all channels |
| **Lifetime Value (LTV)** | >50M IDR | >80M IDR | Assuming 36mo average customer lifetime |
| **Feature adoption** | 70% of users use 5+ modules | 80%+ | Depth of usage = retention |
| **Support ticket SLA** | 95% <24h | 98% <12h | Tiered by priority |

### 7.2 Technical Metrics

| Metric | Target | Status (19 Jul 2026) |
|--------|--------|---------------------|
| **API uptime** | 99.5%+ | Infra-ready, pending live deploy |
| **P95 API response time** | <500ms | Benchmarked at 200–400ms (dev) |
| **DB query P95** | <100ms | Indexed, monitored via Prometheus |
| **Frontend build size** | <500KB gzip | Currently ~450KB |
| **Unit test coverage** | ≥60% | ✅ 60%+ (404 tests, 86 suites) |
| **E2E test pass rate** | 100% | ✅ 15 Cypress specs green |
| **Deployment frequency** | Weekly | CI ready, pending live credentials |
| **Mean time to recovery (MTTR)** | <30 min | Runbooks ready, health probes active |

---

## 8. Constraints & Assumptions

### 8.1 Assumptions

1. **Market:** Indonesia SME landscape continues digitalization trend (true post-2020)
2. **Pricing:** IDR 20–25K/emp/mo is sustainable for SME target (comparable to Talenta, cheaper than SAP)
3. **Compliance:** e-Faktur, PPh 21, SAK-EP requirements remain stable (no major regulation change)
4. **Tech stack:** NestJS + React ecosystem remains mature and supportable (true; widely adopted)
5. **Deployment:** AWS availability in Indonesia region (Jakarta) guaranteed (true; `ap-southeast-3`)
6. **Customer support:** Founding customers tolerant of beta-phase bugs (managed via SLA tiers)

### 8.2 Constraints

| Constraint | Impact | Mitigation |
|-----------|--------|-----------|
| **AWS credentials** | Live production blocked | Secure AWS setup + IAM; target end-Aug 2026 |
| **Stripe/DocuSign keys** | Payment + e-signature UX blocked | Partner onboarding; fallback to manual workflows |
| **Mobile App Store** | iOS/Android distribution blocked | EAS profiles ready; submission after Phase 6 |
| **i18n depth** | 13 locales fallback to EN | Professional translation planned Q1 2027 |
| **Microservices split** | Optional, not blocking | Registry scaffold available; monolith sufficient for Phase 5–6 |
| **SOC 2 certification** | Non-blocking for MVP | Process audit Phase 8 (not revenue-critical) |
| **Regional availability** | Single region only | Multi-region Phase 8 roadmap |

### 8.3 Dependencies

| Dependency | Owner | Status |
|-----------|-------|--------|
| **AWS account + RDS + S3** | Dozer | Pending setup (target end-Aug) |
| **Stripe live account** | Dozer / Finance | Pending activation |
| **SMTP provider** (SendGrid/AWS SES) | DevOps | Ready (env-configurable) |
| **JNE/Sicepat API keys** | Logistics partner | Pending partnerships |
| **Google OAuth creds** | Dozer | Ready (dev keys, prod pending) |
| **Doctrine/DocuSign** | Legal | Optional Phase 6; fallback available |

---

## 9. Risk & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **Slow customer acquisition** | Medium | Revenue miss | Pre-sales pipeline building now; accountant partnerships; free tier to drive adoption |
| **High churn (SME dynamics)** | Medium | LTV shortening | Strong onboarding, in-app support, industry templates, proactive support |
| **Competitor feature parity** | High | Lost differentiation | Focus on Indonesia compliance + workflow automation depth; roadmap transparency |
| **AWS region instability** | Low | Production downtime | Multi-region Phase 8; disaster recovery runbook Q4 2026 |
| **Regulatory change (e-Faktur, tax)** | Low–Medium | Compliance rework | Monitor KEMENKEU announcements; compliance team on retainer |
| **Tech debt accrual** | Medium | Velocity slow-down | Refactor budget 20% per quarter; regular architecture review |

---

## 10. Success Criteria (Phase 5: Go-Live)

- ✅ Production AWS deployment live (RDS, EKS, S3)
- ✅ 5+ pilot customers onboarded, 2+ in production use
- ✅ Zero critical bugs in pilot production (P1 SLA <4 hours)
- ✅ Uptime ≥99.5% measured over 30 days
- ✅ Support ticket volume <5/day for pilot cohort
- ✅ Mobile Expo deployed to TestFlight/internal testing
- ✅ Revenue tracking active (Stripe + accounting reconciliation)
- ✅ Roadmap + Q4 2026 commitments communicated to customers

---

## 11. Document & Artifact References

| Artifact | Purpose | Status |
|----------|---------|--------|
| [SDD dnCore v1.0](02-SDD-dnCore-v1.md) | System design & architecture | ✅ This package |
| [SRS dnCore v1.0](03-SRS-dnCore-v1.md) | Functional & non-functional requirements | ✅ This package |
| [CURRENT-IMPLEMENTATION.md](../CURRENT-IMPLEMENTATION.md) | Implementation baseline (19 Jul 2026) | Source of truth |
| [FEATURE-CATALOG.md](../FEATURE-CATALOG.md) | Available/Conditional/Roadmap features | Reference |
| [GitHub repo](https://github.com/dreamcraft17/erp) | Source code · tests · infra-as-code | Truth |

---

## 12. Changelog

| Version | Date | Changes |
|---------|------|---------|
| **1.0** | 19 Jul 2026 | Initial PRD — Phase 0–4 recap, Phase 5–8 roadmap, pricing proposal, go-to-market |
| **1.0.1** | 19 Jul 2026 | Implementation closed in repo: plans Free–Enterprise, SO inventory reserve, retention purge, outbound webhooks, ops scripts, dnCore brand surfaces |
| **1.0.2** | 19 Jul 2026 | Phase 5 hardening (`2aaf9f9`): Stripe payment retry, digest email, k6 authenticated, security acceptance, Cypress role UAT — **397** tests |
| **1.0.3** | 19 Jul 2026 | Phase 6 mobile foundation: push tokens, biometric, offline cache, Approvals/Orders tabs — **404** tests |
| **1.0.4** | 19 Jul 2026 | Mobile-first web UI (`63b43df`); Expo native **on hold** |
| **1.0.5** | 19 Jul 2026 | Wire V3 endpoints into Analytics/Documents/Workflows/Integrations (`a4b63c9`) |

---

**Owner:** Dozer (CEO + Tech Lead) · PT. Dozer Napitupulu Technology  
**Last Updated:** 19 July 2026  
**Implementation status:** V3 module wiring ✅ · Mobile-first web ✅ · Expo ⏸️ on hold · AWS/Stripe Conditional · HEAD `3cff9ac`  

---

*Produk dnCore adalah bagian dari ekosistem DN Tech, dilengkapi produk dnPeople (HRIS). Semua metrik di dokumen ini bersifat honest dan non-inflated.*

# Product Portfolio

**Document Version**: 1.1  
**Last Updated**: July 10, 2026  
**Status**: Published  
**Owner**: Dozer

---

## 📋 Table of Contents

- [Overview](#overview)
- [Product Map](#product-map)
- [Company Profile Website](#company-profile-website)
- [Careers Module](#careers-module)
- [dnPeople HRIS](#dnpeople-hris)
- [Future Products / In Development](#future-products--in-development)
- [Product Lifecycle](#product-lifecycle)

---

## Overview

DN Tech membangun dan mengoperasikan produk digital internal yang juga menjadi showcase kapabilitas engineering perusahaan. Semua produk mengikuti standar dokumentasi: PRD → SDD → Implementation → Wiki.

### Product Principles

1. **Production-first** — Tidak ada fake/demo data di production
2. **CMS-driven** — Konten dikelola via admin dashboard
3. **Documented** — Setiap produk memiliki PRD dan technical spec
4. **Measurable** — Success metrics didefinisikan sebelum launch

---

## Product Map

```
DN Tech Products
├── 🌐 Company Profile Website (Compro)     → docs/products/dntech/
│   ├── Public marketing site (dntech.id)
│   ├── Admin CMS dashboard
│   ├── Lead generation & analytics
│   └── Email automation system (v5)
│
├── 💼 Careers Module                         → (part of dntech)
│   ├── Job listings page
│   ├── Application form
│   └── Admin career management
│
├── 👥 dnPeople HRIS                          → docs/products/dnPeople/
│   ├── Employee DB, org, attendance, leave
│   ├── Payroll Indonesia (BPJS + PPh 21)
│   └── Repo: dnpeople (Express + Next.js)
│
├── 🏢 DN People ERP                          → docs/products/dnpeople-erp/
│   ├── Full ERP (HR + Finance + Inventory…)
│   └── Repo: ERP (NestJS) — produk terpisah
│
├── 📍 Nearwork                               → docs/products/nearwork/
│   ├── Location-based platform
│   ├── Billing & subscriptions
│   └── Monorepo architecture
│
├── 🤖 Threads Automation                     → docs/products/threads-automation/
│   └── Social media automation tool
│
└── ⚖️ Trusted Jurist (TJ)                     → docs/products/tj/
    └── Law firm company profile website
```

---

## Company Profile Website

### Ringkasan

| Aspek | Detail |
|-------|--------|
| Nama | DN Tech Company Profile Website |
| URL | https://dntech.id |
| Status | **Production** |
| Version | v5 (Email System) |
| Stack | Next.js 16 + Express 5 + PostgreSQL |

### Fitur Utama

**Public Website:**
- Homepage dengan hero tipografi (`HeroBrand`) + section branding penuh (stats, story, values, advantages, team, testimonials)
- Logo resmi `rlogo2.png` + wordmark **DN Tech.id** di navbar
- Halaman about — visi/misi dari CMS `aboutContent` (client fetch)
- Services listing & detail pages
- Portfolio / case studies
- Blog dengan SEO metadata & JSON-LD
- About, team, contact, FAQ, careers
- Multi-step contact form dengan validasi
- Solution quiz, ROI calculator, newsletter
- Exit intent modal, Calendly integration
- Sitewide search

**Admin Dashboard:**
- JWT login dengan RBAC (4 roles)
- CRUD: services, portfolio, blog, team, testimonials, FAQ, careers + branding CRUD penuh (`/admin/branding`, `/admin/branding/values`, `/admin/branding/advantages`, `/admin/branding/stats`)
- Lead management dengan status workflow & CSV export
- Media library upload
- Analytics dashboard
- Email log monitoring
- Site settings (company info, SEO, legal, integrations)
- User management (SuperAdmin)

### Success Metrics

| Metric | Target |
|--------|--------|
| Monthly unique visitors | 1.000+ |
| Contact form submissions | 20+/bulan |
| Page load (P75) | < 2 detik |
| Lighthouse SEO score | 90+ |
| Uptime | 99.5% |

### Dokumentasi

| Dokumen | File |
|---------|------|
| PRD Summary | [09_COMPRO_PRD.md](../products/09_COMPRO_PRD.md) |
| Spec Summary | [10_COMPRO_SPEC.md](../products/10_COMPRO_SPEC.md) |
| **Source Docs (37 files)** | [dntech/00_INDEX.md](./products/dntech/00_INDEX.md) |
| Design summary | [DESIGN_SUMMARY.md](./products/dntech/docs/DESIGN_SUMMARY.md) |
| Design system (V2.1) | [design/IMPLEMENTATION.md](./products/dntech/design/IMPLEMENTATION.md) |

### Version History

| Version | Date | Focus |
|---------|------|-------|
| v1 | Jun 2026 | Initial spec & implementation |
| v2 | Jul 2026 | Design system, SEO, remove fake data |
| v3 | Jul 2026 | UX refinement |
| v4 | Jul 2026 | Performance optimization |
| v5 | Jul 2026 | Email system (SMTP) |

---

## Careers Module

### Ringkasan

| Aspek | Detail |
|-------|--------|
| Nama | DN Tech Careers Module |
| URL | https://dntech.id/careers |
| Status | **Production** |
| Integration | Part of Company Profile Website |

### Fitur Utama

**Public:**
- Job listings dengan filter (department, location, type)
- Job detail dengan requirements & benefits
- Application form dengan file upload
- Email confirmation ke applicant
- Admin notification ke info@dntech.id

**Admin:**
- CRUD lowongan kerja
- Field: title, department, location, type, level, benefits, description, requirements
- Status management (active/inactive)
- Application tracking via leads module

### Success Metrics

| Metric | Target |
|--------|--------|
| Active job postings | 2–5 |
| Monthly applications | 10+ |
| Application-to-interview rate | 20% |
| Time-to-fill position | < 30 hari |

### Dokumentasi

| Dokumen | File |
|---------|------|
| PRD | [11_CAREERS_PRD.md](../products/11_CAREERS_PRD.md) |
| Technical Spec | [12_CAREERS_SPEC.md](../products/12_CAREERS_SPEC.md) |

---

## dnPeople HRIS

### Ringkasan

| Aspek | Detail |
|-------|--------|
| Nama | dnPeople HRIS |
| Status | **MVP 1–4 core implemented** |
| Target | Startup & UMKM Indonesia (30–200 karyawan) |
| Stack | Next.js 16 + Express 5 + Prisma + PostgreSQL |
| Repository | `dnpeople` |
| Docs | [12 files →](./products/dnPeople/00_INDEX.md) |

### Fitur (MVP 1–4 core)

- **MVP 1:** Employee DB, org, absensi, cuti/izin, payroll (BPJS + PPh 21), dashboard, RBAC, audit
- **MVP 2:** Shift, lembur, klaim, pinjaman, geofence, dokumen, kalender, approval inbox
- **MVP 3:** ATS, onboarding, performance/KPI, training, aset, offboarding, helpdesk, AI assistant
- **MVP 4:** Multi-company, workflows, API keys/integrations, SSO config, white-label, custom reports, AI docs/screening, row-level security

### Dokumentasi

| Dokumen | File |
|---------|------|
| Index | [dnPeople/00_INDEX.md](./products/dnPeople/00_INDEX.md) |
| PRD | [dnpeople-prd.md](./products/dnPeople/PRD/dnpeople-prd.md) |
| SRS | [dnpeople-srs.md](./products/dnPeople/PRD/dnpeople-srs.md) |
| SDD | [dnpeople-sdd.md](./products/dnPeople/PRD/dnpeople-sdd.md) |
| Implementation Status | [IMPLEMENTATION-STATUS.md](./products/dnPeople/docs/IMPLEMENTATION-STATUS.md) |
| API | [API.md](./products/dnPeople/docs/API.md) |
| Supabase | [SUPABASE.md](./products/dnPeople/docs/SUPABASE.md) |
| VPS install | [VPS.md](./products/dnPeople/docs/VPS.md) |

> **Catatan:** Berbeda dari DN People ERP di bawah — produk & repo terpisah.

---

## Future Products / In Development

### DN People ERP

| Aspek | Detail |
|-------|--------|
| Status | **In Development** — V3 Phase 5–8 ~85% coded |
| Target | SME & Enterprise di Indonesia |
| Modules | HR, Payroll, Finance, Inventory, Project Mgmt, Compliance, LMS, Platform |
| Tests | 392 unit tests · 27 backend modules · Enterprise V3 hub |
| Docs | [48 files →](./products/dnpeople-erp/00_INDEX.md) |
| Blocker | Live AWS deploy, SOC 2, production API keys |

**Key documents:**
- [PRD](./products/dnpeople-erp/Docs/01-PRD-ERP-System.md)
- [SRS](./products/dnpeople-erp/Docs/02-SRS-ERP-System.md)
- [SDD](./products/dnpeople-erp/Docs/03-SDD-ERP-System.md)
- [V3 Enterprise PRD](./products/dnpeople-erp/Docs/v3/PRD-V3-DNPEOPLE-ENTERPRISE.md)
- [Phase 1 Checklist](./products/dnpeople-erp/update/PHASE-1-EXECUTION-CHECKLIST.md)

### Nearwork

| Aspek | Detail |
|-------|--------|
| Status | **In Development** |
| Type | Location-based platform |
| Security | Audit Jul 2026 — auth baik; critical: public credentials, webhook signatures |
| Docs | [32 files →](./products/nearwork/00_INDEX.md) |

**Key documents:**
- [V2 PRD](./products/nearwork/docs/NEARWORK_V2_PRD.md)
- [V2 SRS](./products/nearwork/docs/NEARWORK_V2_SRS.md)
- [V2 SDD](./products/nearwork/docs/NEARWORK_V2_SDD.md)
- [Design System](./products/nearwork/docs/NEARWORK_V2_DESIGN_SYSTEM.md)
- [Security Audit 2026-07-08](./products/nearwork/SECURITY_AUDIT_2026-07-08.md)

### Threads Automation

| Aspek | Detail |
|-------|--------|
| Status | **Planned** |
| Type | Social media automation |
| Docs | [4 files →](./products/threads-automation/00_INDEX.md) |

### Trusted Jurist (TJ)

| Aspek | Detail |
|-------|--------|
| Nama | Trusted Jurist Law Firm — Company Profile |
| URL | https://trustedjurist.co.id |
| Status | **Go-live readiness** (v0.2.0) — design system ✅ |
| Type | Law firm marketing / company profile |
| Stack | Next.js 16 + React 19 + Tailwind v4 + Resend |
| Docs | [12 files →](./products/tj/00_INDEX.md) |
| PRD | [docs/PRD.md](./products/tj/docs/PRD.md) |
| Features | [docs/FEATURES.md](./products/tj/docs/FEATURES.md) |
| Design system | [design/IMPLEMENTATION.md](./products/tj/design/IMPLEMENTATION.md) |
| Current impl | [current-implementation.md](./products/tj/current-implementation.md) |

---

## Product Lifecycle

### Stage Definitions

| Stage | Description | Documentation Required |
|-------|-------------|----------------------|
| **Ideation** | Problem identified, initial research | Problem statement |
| **Planning** | PRD written, scope defined | PRD document |
| **Design** | SDD/Spec written, architecture decided | Technical spec |
| **Development** | Implementation in progress | Dev guidelines followed |
| **Testing** | QA, performance audit | Test checklist |
| **Launch** | Deployed to production | Deployment guide |
| **Maintenance** | Bug fixes, updates | Wiki kept current |
| **Sunset** | Deprecated, archived | Moved to `archive/` |

### New Product Checklist

- [ ] PRD created using [PRD Template](../templates/PRD_TEMPLATE.md)
- [ ] Technical spec created using [SDD Template](../templates/SDD_TEMPLATE.md)
- [ ] Added to this product portfolio page
- [ ] Success metrics defined
- [ ] Wiki documentation updated

---

## 📄 Related Documents

- [Product Docs Index](./products/README.md) — All ~151 source documents
- [dnPeople HRIS Index](./products/dnPeople/00_INDEX.md)
- [Company Overview](./02_COMPANY_OVERVIEW.md)
- [Tech Stack](./05_TECH_STACK.md)
- [Architecture](./06_ARCHITECTURE.md)
- [Compro PRD](../products/09_COMPRO_PRD.md)
- [Careers PRD](../products/11_CAREERS_PRD.md)

---

*Last Updated: July 10, 2026*

# Product Portfolio

> **Author:** Dozer  
> **Date:** 2026-09-05

**Document Version**: 1.7  
**Last Updated**: September 5, 2026  
**Status**: Published  
**Owner**: Dozer (CEO + Tech Lead + PM)  
**Company**: DN Tech (PT. Dozer Napitupulu Technology)  
**Brand**: DN Tech (DN Tech.id)  
**UpdatedAt**: September 5, 2026

---

## 📋 Table of Contents

- [Overview](#overview)
- [Product Map](#product-map)
- [Company Profile Website](#company-profile-website)
- [Careers Module](#careers-module)
- [dnPeople HRIS](#dnpeople-hris)
- [Future Products / In Development](#future-products--in-development)
- [Personal / Dozer-only](#personal--dozer-only)
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
├── 🏢 dnCore (ERP)                           → docs/products/dnpeople-erp/
│   ├── Finance, SC, Mfg, CRM, Workflow…
│   └── Repo: ERP (NestJS) — brand dnCore
│
├── 🛒 dnShop Finance                         → docs/products/dnShopee/
│   ├── Shopee seller dashboard + pembukuan bonus
│   ├── SOPI v2.1 + UI2 + **v2.2.1** accounting depth
│   └── Repo: dnShopee · prod shop.dntech.id
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
| URL | https://dntech.id · https://api.dntech.id |
| Status | **Production** + **Relaunch (Aug 2026)** — **v0.10.0** living docs · HEAD `da52085`; VPS branding + products seeded; homepage below-fold stream; SMTP + admin rotate + frontend rebuild pending |
| Version | v7 + relaunch gate (see [launch pack](./products/dntech/docs/launch/README.md)) |
| Stack | Next.js 16.2.9 + React 19.2.4 + Express 5 + PostgreSQL |
| Owner | Dozer (CEO + Tech Lead + PM) |
| Brand | DN Tech (DN Tech.id) |

### Fitur Utama

**Public Website:**
- Homepage Indonesia Edition (`components/homepage/*`, `homeContent` CMS) — hero, layanan, proses, keunggulan, portfolio, testimoni, FAQ, harga, CTA
- Tech stack & tim **hidden** di beranda (tetap di `/team`, `/careers`); newsletter tidak di footer
- Logo resmi `rlogo2.png` + wordmark **DN Tech.id** di navbar / footer
- Halaman about — visi/misi dari CMS `aboutContent`
- Services listing & detail pages
- Products listing & detail (`/products`, V7 dnPeople flagship fields)
- Portfolio / case studies
- Blog dengan SEO metadata & JSON-LD
- About, team, contact, FAQ, careers
- Multi-step contact form dengan validasi
- Solution quiz, ROI calculator, newsletter (bukan di footer)
- Exit intent modal, Calendly integration
- Sitewide search + global loading UX (Jul 13)

**Admin Dashboard:**
- JWT login dengan RBAC (4 roles)
- CRUD: services, **products**, portfolio, blog, team, testimonials, FAQ, careers + branding CRUD (`/admin/branding/*`)
- Lead management dengan status workflow & CSV export
- Media library upload
- Analytics dashboard
- Email log monitoring (SMTP V5)
- Site settings (company info, SEO, legal, integrations, homepage copy)
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
| **Source Docs (71 markdown)** | [dntech/00_INDEX.md](./products/dntech/00_INDEX.md) |
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
| v6 | Jul 12, 2026 | Modul Produk (`/products`, admin CRUD) |
| v7 | Jul 12, 2026 | Product Section PRD — dnPeople flagship |
| Jul 13–16 | 2026 | Loading UX, product API hotfix, seed copy refresh |

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
| Brand | DnPeople |
| Owner | Dozer (CEO + Tech Lead + PM) |
| Company | DN Tech (PT. Dozer Napitupulu Technology) |
| Status | **MVP 1–5 + PRD v5–v15.0** implemented · **Release v1.1.0** (Aug 2026) · production [hris.dntech.id](https://hris.dntech.id) |
| Target | Startup & UMKM Indonesia (FREE 30 → Enterprise) |
| Stack | Next.js 16 + Express 5 + Prisma 6 + PostgreSQL (Supabase) |
| Codebase | ~96 halaman · ~60 route modules · **130** model Prisma · **123/123** tests · **16** a11y |
| Repository | `dnpeople` |
| Docs | [→](./products/dnPeople/00_INDEX.md) |
| UpdatedAt | August 22, 2026 |

### Fitur

- **MVP 1:** Employee DB, org, absensi, cuti/izin, payroll (BPJS + PPh 21 + THR), dashboard, RBAC, audit
- **MVP 2:** Shift/swap, lembur, klaim, pinjaman, geofence/WiFi, koreksi bulk, dokumen, kalender, approval inbox
- **MVP 3:** ATS + careers, onboarding, performance/KPI, training, aset, offboarding, helpdesk, AI assistant
- **MVP 4:** Multi-company, workflows, API keys/integrations, SSO+JIT, white-label, custom reports, AI docs/screening, row-level security
- **PRD v4 Talent:** Competency, assessment, IDP, LMS dasar (`/talent`, `/idp`, `/lms`)
- **PRD v5–v6:** Subscription/billing (`/billing`), tenant policy, SCIM, quota, staff-accounts, seamless login discovery
- **PRD v7.0:** Attendance Excel manual import (template, dry-run, confirm, history); admin UI Excel-first
- **Ops extras:** MFA TOTP, employee Excel import, offline attendance sync, admin payslip preview

### Dokumentasi

| Dokumen | File |
|---------|------|
| Index | [dnPeople/00_INDEX.md](./products/dnPeople/00_INDEX.md) |
| PRD | [dnpeople-prd.md](./products/dnPeople/PRD/dnpeople-prd.md) |
| SRS | [dnpeople-srs.md](./products/dnPeople/PRD/dnpeople-srs.md) |
| SDD | [dnpeople-sdd.md](./products/dnPeople/PRD/dnpeople-sdd.md) |
| Implementation Status | [IMPLEMENTATION-STATUS.md](./products/dnPeople/docs/IMPLEMENTATION-STATUS.md) |
| Feature Catalog | [FEATURE-CATALOG.md](./products/dnPeople/docs/FEATURE-CATALOG.md) |
| API | [API.md](./products/dnPeople/docs/API.md) |
| Supabase | [SUPABASE.md](./products/dnPeople/docs/SUPABASE.md) |
| VPS install | [VPS.md](./products/dnPeople/docs/VPS.md) |

> **Catatan:** Berbeda dari **dnCore (ERP)** di bawah — produk & repo terpisah. Messaging: "dnPeople for your people · dnCore for your business."

---

## Future Products / In Development

### dnShop Finance

| Aspek | Detail |
|-------|--------|
| Nama | dnShop Finance |
| Brand | dnShop · DN Tech |
| Owner | Dozer (CEO + Tech Lead + PM) |
| Status | **v2.2.1** accounting depth shipped (5 Sep 2026) · next **v3.0 Multi-marketplace** |
| Target | Seller UMKM Shopee Indonesia |
| Stack | Next.js 15 + NestJS 10 + Postgres/Supabase · Redis opsional |
| Prod | `https://shop.dntech.id` · API `https://api.shop.dntech.id` |
| Repository | `dnShopee` |
| Docs | [→](./products/dnShopee/00_INDEX.md) |
| UpdatedAt | September 5, 2026 |

### Fitur (ringkas)

- Dashboard Shopee + charts · orders/payments/tax/bank
- **Pembukuan bonus seller** + **v2.2** cash flow, COGS, export, e-Faktur, tutup buku
- Live OAuth / webhook / income sync (mock tanpa partner key)
- Tier Free 100 lifetime / Starter 5000/mo · onboarding wizard · email OTP
- UI2 ops desk (theme dark/light)

### Dokumentasi

| Dokumen | File |
|---------|------|
| Index | [dnShopee/00_INDEX.md](./products/dnShopee/00_INDEX.md) |
| Status | [STATUS.md](./products/dnShopee/docs/STATUS.md) |
| Feature catalog | [FEATURE-CATALOG.md](./products/dnShopee/docs/FEATURE-CATALOG.md) |
| SOPI PRD | [PRD/sopi/](./products/dnShopee/PRD/sopi/) |
| UI2 Design | [PRD/v2/…_Design.md](./products/dnShopee/PRD/v2/dnShop_Finance_v2.1_Design.md) |
| Changelog | [CHANGELOG.md](./products/dnShopee/docs/CHANGELOG.md) |
| v2.2 spec | [PRD/v2.2/](./products/dnShopee/PRD/v2.2/) |
| Next PRD brief | [NEXT-PRD-BRIEF.md](./products/dnShopee/docs/NEXT-PRD-BRIEF.md) → **v3.0** |

---

### dnCore (ERP)

| Aspek | Detail |
|-------|--------|
| Status | **Express + Remix refactor implemented** · PM2/Nginx VPS ready · Expo on hold |
| Brand | dnCore · complementary to dnPeople HRIS |
| Target | SME & mid-market Indonesia |
| Modules | 27 domain modules (Finance, Sales, SC, Mfg, HR subset, CRM, Workflow, LMS, …) |
| Tests | **408** unit tests · **88** suites · Remix SSR routes · **86** entities · **18** migrations |
| Docs | [Index →](./products/dnpeople-erp/00_INDEX.md) |
| Blocker | Live AWS deploy, production vendor keys, SOC 2 · App Store on hold with Expo |

**Key documents:**
- [PRD dnCore v1.0](./products/dnpeople-erp/Docs/prd/01-PRD-dnCore-v1.md)
- [SDD dnCore v1.0](./products/dnpeople-erp/Docs/prd/02-SDD-dnCore-v1.md)
- [SRS dnCore v1.0](./products/dnpeople-erp/Docs/prd/03-SRS-dnCore-v1.md)
- [CURRENT-IMPLEMENTATION](./products/dnpeople-erp/Docs/CURRENT-IMPLEMENTATION.md)
- [FEATURE-CATALOG](./products/dnpeople-erp/Docs/FEATURE-CATALOG.md)
- [V3 Enterprise PRD (legacy)](./products/dnpeople-erp/Docs/v3/PRD-V3-DNPEOPLE-ENTERPRISE.md)

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

## Personal / Dozer-only

Situs **personal** (bukan SKU penjualan DN Tech). Company-wiki hanya pointer; body di `private-wiki/`.

### Porto

| Aspek | Detail |
|-------|--------|
| Nama | Porto — personal portfolio + Laravel CMS |
| Status | Live personal site · proprietary license |
| Repository | `porto` (`dreamcraft17/porto`) |
| Team wiki | Pointer [porto/](./products/porto/README.md) |
| SSOT | `private-wiki/porto/` (Dozer-only) |
| UpdatedAt | September 5, 2026 |

Bukan company profile: compro tim tetap [dntech](./products/dntech/00_INDEX.md).

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

*Last Updated: September 5, 2026*

| | |
|---|---|
| Owner | Dozer (CEO + Tech Lead + PM) |
| Company | DN Tech (PT. Dozer Napitupulu Technology) |
| Brand | DN Tech (DN Tech.id) |
| UpdatedAt | September 5, 2026 |

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026

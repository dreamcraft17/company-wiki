# dnPeople — Project Overview

**Product:** dnPeople HRIS  
**Version:** PRD **v14.0** Tutorial/KB + **v13.0** Talent Matrix + **v12.1** FREE 50-emp complete in repo · external go-live gates Conditional  
**Status:** MVP 1–5 + PRD v5–**v14.0** / v11.1 **Done in repo**; Datadog/DNS/pen-test/beta UAT Conditional  
**Repository:** [github.com/dreamcraft17/dnpeople](https://github.com/dreamcraft17/dnpeople)  
**Owner:** Dozer (CEO + Tech Lead)  
**Company:** DN Tech (PT. Dozer Napitupulu Technology)  
**Brand:** DnPeople  
**Contact:** info@dntech.id  
**UpdatedAt:** July 25, 2026  

---

## Apa itu dnPeople?

dnPeople adalah **HRIS multi-tenant** untuk startup, UMKM, dan perusahaan menengah Indonesia. Satu aplikasi web untuk:

1. **Operasi HR** — karyawan, organisasi, dokumen, absensi, cuti, shift, approval  
2. **Payroll lokal** — BPJS, PPh 21, payslip, bank/tax export  
3. **Talent** — kompetensi, IDP, LMS, **9-box kalibrasi**, succession & readiness (PRD v13.0)  
4. **Rekrutmen & siklus kerja** — ATS, onboarding, performance, training, offboarding, helpdesk  
5. **Onboarding in-app** — Help menu, 5 interactive tutorials, knowledge base (PRD v14.0; no video library)  
6. **Kontrol SaaS** — lima tier berlangganan, nav/API gating jujur, billing, enterprise (SSO/SCIM/multi-company)

Landing publik: `/welcome` (logo brand `logo1.png` di header & footer; favicon mark resmi). Demo sandbox seed = **FREE** agar menu sesuai paket gratis.

Codebase snapshot: **~73** halaman · **~55** route modules · **~114** model Prisma · **47/47** backend tests.  
**Mulai PRD berikutnya:** [Current Implementation](./CURRENT-IMPLEMENTATION.md) · [NEXT-PRD-BRIEF](./NEXT-PRD-BRIEF.md) · [Launch Gate](./LAUNCH-GATE-CHECKLIST.md)

> **Bukan** sama dengan DN People ERP (`ERP/` — NestJS). dnPeople = HRIS SaaS (Express + Next.js).

## Visi

Menjadi platform HRIS terpercaya yang mempermudah perusahaan Indonesia mengelola SDM secara digital, dari recruitment hingga offboarding — dengan compliance lokal (UU PDP, PPh 21, BPJS) dan jalur upgrade yang transparan.

## Target Launch

| Milestone | Target | Status |
|-----------|--------|--------|
| MVP 1–5 (core + talent foundation) | — | **Done** |
| PRD v11.1 landing + v12.1 FREE 50-emp | Jul 2026 | **Done (repo)** |
| PRD v13.0 Talent Matrix & Succession | Jul 2026 | **Done (repo)** |
| External go-live (1 Aug 2026) | Aug 2026 | **Conditional** — Datadog, pen-test, DNS, beta UAT |
| PRD v4 Module 4–8 (marketplace, EWA, verticals) | next | **Recommended product PRD** |

## Stack (ringkas)

Detail arsitektur: [ARCHITECTURE.md](./ARCHITECTURE.md). Dev ports: frontend **3001**, API **4100**. Stack: Next.js 16 · Express 5 · Prisma 6 · PostgreSQL 16 · JWT/RBAC.

## Struktur Repo

```
dnpeople/
├── backend/          # API /api/v1 + Prisma
├── frontend/         # App shell + marketing /welcome
├── docs/             # Living product & eng docs
├── scripts/          # Smoke, backup, k6
└── README.md         # Product-first overview
```

## Dokumentasi kunci

| Dokumen | Kegunaan |
|---------|----------|
| [../README.md](../README.md) | Apa itu dnPeople + fitur + quick start |
| [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) | Inventori fitur |
| [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md) | Baseline PRD berikutnya |
| [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md) | Status per PRD |
| [DEMO-ACCOUNTS.md](./DEMO-ACCOUNTS.md) | Kredensial sandbox FREE |
| [CHANGELOG.md](./CHANGELOG.md) | Riwayat |

## Lisensi

Proprietary — DN Tech © 2026 · PT. Dozer Napitupulu Technology

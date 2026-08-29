# dnPeople — Project Overview

**Product:** dnPeople HRIS  
**Version:** PRD **v15.0** Admin + **Xendit PG** + **Legal ToS/PP MVP** (Aug 2026) + v14 Tutorial + v13 Talent  
**Status:** MVP 1–5 + PRD v5–**v15.0** **Done in repo**; deployed `https://hris.dntech.id`; go-live gates Conditional  
**Repository:** [github.com/dreamcraft17/dnpeople](https://github.com/dreamcraft17/dnpeople)  
**Owner:** Dozer (CEO + Tech Lead + PM)  
**Company:** DN Tech (PT. Dozer Napitupulu Technology)  
**Brand:** DnPeople  
**Contact:** info@dntech.id  
**UpdatedAt:** August 10, 2026  

---

## Apa itu dnPeople?

dnPeople adalah **HRIS multi-tenant** untuk startup, UMKM, dan perusahaan menengah Indonesia. Satu aplikasi web untuk:

1. **Operasi HR** — karyawan, organisasi, dokumen, absensi, cuti, shift, approval  
2. **Payroll lokal** — BPJS, PPh 21, payslip, bank/tax export  
3. **Talent** — kompetensi, IDP, LMS, **9-box kalibrasi**, succession & readiness (PRD v13.0)  
4. **Rekrutmen & siklus kerja** — ATS, onboarding, performance, training, offboarding, helpdesk  
5. **Onboarding in-app** — Help menu, 5 interactive tutorials, knowledge base (PRD v14.0; no video library)  
6. **Admin Console (internal)** — SUPER_ADMIN `/admin`: customers, billing, analytics, support, content, flags, health (PRD v15.0)  
7. **Billing & payment** — tier gating, trial, **Xendit** hosted checkout, pay-during-trial, invoice PDF, polished `/billing` UI (Aug 2026)  
8. **Legal compliance (MVP)** — ToS + Privacy Policy acceptance at signup (Aug 2026)  
9. **Kontrol enterprise** — SSO/SCIM/multi-company, API keys, branding  
10. **Navigation UX** — grouped sidebar (8 sections), tier-honest menu filtering (Aug 2026)

Landing publik: `/welcome` · Docs hub: `/docs` · Production: `hris.dntech.id`

Codebase snapshot: **~96** halaman · **~60** route modules · **129** model Prisma · **81/81** backend tests.  
**Mulai PRD berikutnya:** [NEXT-PRD-BRIEF](./NEXT-PRD-BRIEF.md) · [CURRENT-IMPLEMENTATION](./CURRENT-IMPLEMENTATION.md) · [FEATURE-CATALOG](./FEATURE-CATALOG.md)

> **Bukan** sama dengan DN People ERP (`ERP/` — NestJS). dnPeople = HRIS SaaS (Express + Next.js).

## Visi

Menjadi platform HRIS terpercaya yang mempermudah perusahaan Indonesia mengelola SDM secara digital, dari recruitment hingga offboarding — dengan compliance lokal (UU PDP, PPh 21, BPJS) dan jalur upgrade yang transparan.

## Target Launch

| Milestone | Target | Status |
|-----------|--------|--------|
| Code complete MVP 1–5 + v5–v15 | Jul 2026 | **Done** |
| Xendit payment + legal ToS/PP | Aug 2026 | **Done in repo** |
| Soft launch / beta | Aug 2026 | **In progress** — `hris.dntech.id` live |
| PRD v16.0 Module 4 (career marketplace) | TBD | **Not started** |
| Full go-live (dnpeople.id, live payment, beta cohort) | TBD | **Conditional** |

## Roadmap singkat

| Versi | Fokus | Status |
|-------|-------|--------|
| v13.0 | Talent matrix & succession | Done |
| v14.0 | Tutorial & KB | Done |
| v15.0 | Admin Console | Done |
| Aug 2026 | Xendit PG, Legal ToS/PP, trial pay UX | Done in repo |
| **v16.0** | **Module 4 — Internal career marketplace** | **Next PRD** |
| v17+ | EWA, salary bench, verticals (Modules 5–8) | Roadmap |

## Struktur repo

```
dnpeople/
├── backend/          Express API, Prisma, services
├── frontend/         Next.js app + marketing
├── docs/             Living documentation (start: NEXT-PRD-BRIEF.md)
├── ops/              Runbooks, Datadog stubs, alerting
└── prisma/           Schema + migrations
```

## Kontak

- Produk: info@dntech.id  
- Wiki mirror: `company-wiki/docs/products/dnPeople/`

# dnPeople — Project Overview

**Product:** dnPeople HRIS  
**Version:** PRD **v12.1** complete in repo · external go-live gates Conditional  
**Status:** MVP 1–5 + PRD v5–**v12.1** / v11.1 **Done in repo**; Datadog/DNS/pen-test/beta UAT Conditional  
**Repository:** [github.com/dreamcraft17/dnpeople](https://github.com/dreamcraft17/dnpeople)  
**Owner:** Dozer (CEO + Tech Lead)  
**Company:** DN Tech (PT. Dozer Napitupulu Technology)  
**Brand:** DnPeople  
**UpdatedAt:** July 24, 2026  
**Last Updated:** July 24, 2026

---

## Apa itu dnPeople?

dnPeople adalah **HRIS (Human Resource Information System)** untuk startup, UMKM, dan perusahaan menengah di Indonesia. Cakupan implementasi saat ini: core HR (MVP 1), operasi lanjutan (MVP 2), strategic HR (MVP 3), enterprise (MVP 4: multi-company, integrations, SSO, white-label, custom reports, AI docs/screening), serta fondasi Talent Development (MVP 5: competency, assessment, gap analysis, IDP, dan LMS dasar).

Codebase saat ini: **61 halaman web**, **53 modul route backend**, **102 model Prisma**, **36/36** backend tests. Login auto tenant discovery; session httpOnly cookie; marketing landing v11.1 (`/welcome`, `/pricing`, `/faq`, `/contact`, `/about`, `/demo`, `/blog`, `/legal/dpa`); tier pricing SSOT `subscriptionCatalog.ts`; FREE/STARTER hard **50** karyawan (PRD v12.1); lead capture API.  
**Mulai PRD berikutnya:** [Current Implementation](./CURRENT-IMPLEMENTATION.md) · [Launch Gate Checklist](./LAUNCH-GATE-CHECKLIST.md)

> **Bukan** sama dengan DN People ERP (`ERP/` — NestJS full ERP). dnPeople adalah produk HRIS terpisah (Express + Next.js) sesuai PRD/SRS/SDD **v3.1** di company-wiki.

## Visi

Menjadi platform HRIS terpercaya yang mempermudah perusahaan Indonesia mengelola SDM secara digital, dari recruitment hingga offboarding — dengan compliance lokal (UU PDP, PPh 21, BPJS).

## Target Launch

| Milestone | Target | Status |
|-----------|--------|--------|
| MVP 1 | Q3 2026 | **Done** |
| MVP 2 | Q4 2026 | **Done** |
| MVP 3 | Q1 2027 | **Done (core)** |
| MVP 4 | Q2 2027 | **Done (core)** |
| MVP 5 — PRD v4 Module 1–2 | Q3 2027 | **Done (foundation)** |
| PRD v10.0 ops artefacts | Jul 2026 | **Done (repo)** |
| PRD v11.0 go-live execution | Jul 2026 | **Done (repo)** — marketing routes, leads API, k6 suite, launch runbooks |
| PRD v11.1 landing page | Jul 2026 | **Done (repo)** — full `/welcome`, SEO/JSON-LD, pricing SSOT, beta form |
| PRD v12.0 tier consolidation | Jul 2026 | **Done (repo)** |
| PRD v12.1 FREE 50-emp final | Jul 2026 | **Done (repo)** — hard limits, capacity emails, storage, `/upgrade` |
| External go-live (1 Aug 2026) | Aug 2026 | **Conditional** — Datadog, pen-test, DNS, beta UAT |
| PRD v4 Module 3–8 | Q4 2027+ | **Recommended next product PRD** |

## Stack

| Layer | Teknologi | Port (dev) |
|-------|-----------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 | 3001 |
| Backend | Express 5, TypeScript, Zod | 4100 |
| ORM | Prisma 6 | — |
| Database | PostgreSQL 16 | 5433 |
| Cache | — (removed unused Redis) | — |
| Auth | JWT + API keys + RBAC (6 roles) | — |

## Struktur Repo

```
dnpeople/
├── backend/
│   ├── prisma/schema.prisma
│   ├── prisma/seed.ts
│   └── src/
│       ├── routes/          # auth … platform, integrations, workflows, ai
│       ├── services/        # attendance, leave, payroll, audit
│       ├── lib/             # payroll, apiKey, screening, documents
│       └── middleware/auth.ts  # JWT + API key
├── frontend/
│   └── src/
│       ├── app/(app)/       # dashboard … platform, integrations, branding
│       ├── app/login/
│       ├── components/
│       └── lib/api.ts
├── docker-compose.yml
├── docs/
└── README.md
```

## Persona & Role

| Role | Akses utama |
|------|-------------|
| SUPER_ADMIN | Multi-company platform (`/platform`) |
| COMPANY_ADMIN | Full company HR + settings + enterprise modules |
| HR | Employee lifecycle, HR operations, recruitment, dan talent; tanpa payroll/salary |
| MANAGER | Approval, view team, workflows:view |
| FINANCE | Payroll, claims, loans, reports |
| EMPLOYEE | Self-service absensi, cuti, slip gaji |

## Dokumentasi Terkait

| Doc | Path |
|-----|------|
| Baseline | [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md) |
| Status matrix | [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md) |
| Feature catalog | [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) |
| Release ready | [RELEASE-READY.md](./RELEASE-READY.md) |
| Index | [00_INDEX.md](./00_INDEX.md) |
| Wiki | `company-wiki/docs/products/dnPeople/` |

---

*Last Updated: July 24, 2026*

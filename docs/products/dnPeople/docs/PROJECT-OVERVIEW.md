# dnPeople — Project Overview

**Product:** dnPeople HRIS  
**Version:** PRD v10.0 complete · baseline frozen for v11+  
**Status:** MVP 1–5 + PRD v5–v10.0 **Done in repo**; ops go-live Conditional  
**Repository:** [github.com/dreamcraft17/dnpeople](https://github.com/dreamcraft17/dnpeople)  
**Owner:** Dozer (CEO + Tech Lead)  
**Company:** DN Tech (PT. Dozer Napitupulu Technology)  
**Brand:** DnPeople  
**UpdatedAt:** July 22, 2026  
**HEAD:** `ce80640`  
**Last Updated:** July 22, 2026

---

## Apa itu dnPeople?

dnPeople adalah **HRIS (Human Resource Information System)** untuk startup, UMKM, dan perusahaan menengah di Indonesia. Cakupan implementasi saat ini: core HR (MVP 1), operasi lanjutan (MVP 2), strategic HR (MVP 3), enterprise (MVP 4: multi-company, integrations, SSO, white-label, custom reports, AI docs/screening), serta fondasi Talent Development (MVP 5: competency, assessment, gap analysis, IDP, dan LMS dasar).

Codebase saat ini: **54 halaman web**, **52 modul route backend**, **101 model Prisma**, **32/32** backend tests. Login auto tenant discovery; session httpOnly cookie; global redirect saat session expired; marketing MVP `/welcome`.  
**Mulai PRD berikutnya:** [Current Implementation](./CURRENT-IMPLEMENTATION.md) · [Feature Catalog](./FEATURE-CATALOG.md)

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
| **PRD baseline freeze** | Jul 2026 | **Done** — HEAD `ce80640` |
| PRD v4 Module 3–8 | Q4 2027+ | **Recommended next PRD** |

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

| Dokumen | Lokasi |
|---------|--------|
| PRD v3.1 | `company-wiki/docs/products/dnPeople/PRD/dnpeople-prd.md` |
| SRS v3.1 | `company-wiki/docs/products/dnPeople/PRD/dnpeople-srs.md` |
| SDD v3.1 | `company-wiki/docs/products/dnPeople/PRD/dnpeople-sdd.md` |
| Implementation Status | [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md) |
| Current Implementation | [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md) |
| Feature Catalog | [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) |
| API Reference | [API.md](./API.md) |
| Architecture | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Deployment | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| Changelog | [CHANGELOG.md](./CHANGELOG.md) |
| PRD v8.0 | [PRD/dnpeople-prd-v8.0-security-stability-fixes-id.md](./PRD/dnpeople-prd-v8.0-security-stability-fixes-id.md) |

---

*Last Updated: July 19, 2026*

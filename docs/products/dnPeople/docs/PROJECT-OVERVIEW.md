# dnPeople — Project Overview

**Product:** dnPeople HRIS  
**Version:** MVP 4.0 (enterprise core)  
**Status:** Active Development  
**Repository:** `dnpeople`  
**Owner:** Dozer  
**Last Updated:** July 10, 2026

---

## Apa itu dnPeople?

dnPeople adalah **HRIS (Human Resource Information System)** untuk startup, UMKM, dan perusahaan menengah di Indonesia. Cakupan implementasi saat ini: core HR (MVP 1), operasi lanjutan (MVP 2), strategic HR (MVP 3), dan enterprise (MVP 4: multi-company, integrations, SSO config, white-label, custom reports, AI docs/screening).

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

## Stack

| Layer | Teknologi | Port (dev) |
|-------|-----------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 | 3001 |
| Backend | Express 5, TypeScript, Zod | 4100 |
| ORM | Prisma 6 | — |
| Database | PostgreSQL 16 | 5433 |
| Cache | Redis 7 (reserved) | 6380 |
| Auth | JWT + API keys + RBAC (5 roles) | — |

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
| API Reference | [API.md](./API.md) |
| Architecture | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Deployment | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| Changelog | [CHANGELOG.md](./CHANGELOG.md) |

---

*Last Updated: July 10, 2026*

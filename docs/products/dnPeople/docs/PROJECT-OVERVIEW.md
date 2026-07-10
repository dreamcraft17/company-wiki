# dnPeople — Project Overview

**Product:** dnPeople HRIS  
**Version:** MVP 1.0 (scaffold)  
**Status:** Active Development  
**Repository:** `dnpeople`  
**Owner:** Dozer  
**Last Updated:** July 10, 2026

---

## Apa itu dnPeople?

dnPeople adalah **HRIS (Human Resource Information System)** untuk startup, UMKM, dan perusahaan menengah di Indonesia. Fokus MVP 1: database karyawan, absensi, cuti/izin, payroll lokal (BPJS + PPh 21), dashboard HR, RBAC, dan audit trail.

> **Bukan** sama dengan [DN People ERP](../../dnpeople-erp/00_INDEX.md) (`ERP/` — NestJS full ERP). dnPeople adalah produk HRIS terpisah (Express + Next.js) sesuai PRD/SRS/SDD v3.0.

## Visi

Menjadi platform HRIS terpercaya yang mempermudah perusahaan Indonesia mengelola SDM secara digital, dari recruitment hingga offboarding — dengan compliance lokal (UU PDP, PPh 21, BPJS).

## Target Launch

| Milestone | Target | Status |
|-----------|--------|--------|
| MVP 1 | Q3 2026 | Core implemented |
| MVP 2 | Q4 2026 | Not started |
| MVP 3 | Q1 2027 | Not started |
| MVP 4 | Q2 2027 | Not started |

## Stack

| Layer | Teknologi | Port (dev) |
|-------|-----------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 | 3001 |
| Backend | Express 5, TypeScript, Zod | 4100 |
| ORM | Prisma 6 | — |
| Database | PostgreSQL 16 | 5433 |
| Cache | Redis 7 (reserved) | 6380 |
| Auth | JWT + RBAC (5 roles) | — |

## Struktur Repo

```
dnpeople/
├── backend/
│   ├── prisma/schema.prisma
│   ├── prisma/seed.ts
│   └── src/
│       ├── routes/          # auth, employees, attendance, leave, …
│       ├── services/        # attendance, leave, payroll, audit
│       ├── lib/payroll.ts   # BPJS + PPh 21
│       └── middleware/auth.ts
├── frontend/
│   └── src/
│       ├── app/(app)/       # dashboard, employees, attendance, leave, …
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
| SUPER_ADMIN | Multi-company (planned) |
| COMPANY_ADMIN | Full company HR + settings |
| MANAGER | Approval cuti/izin, view team |
| FINANCE | Payroll & reports |
| EMPLOYEE | Self-service absensi, cuti, slip gaji |

## Dokumentasi Terkait

| Dokumen | Lokasi |
|---------|--------|
| PRD v3.0 | [../PRD/dnpeople-prd.md](../PRD/dnpeople-prd.md) |
| SRS v3.0 | [../PRD/dnpeople-srs.md](../PRD/dnpeople-srs.md) |
| SDD v3.0 | [../PRD/dnpeople-sdd.md](../PRD/dnpeople-sdd.md) |
| Implementation Status | [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md) |
| API Reference | [API.md](./API.md) |
| Architecture | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Deployment | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| Changelog | [CHANGELOG.md](./CHANGELOG.md) |
| Index | [../00_INDEX.md](../00_INDEX.md) |

---

*Last Updated: July 10, 2026*

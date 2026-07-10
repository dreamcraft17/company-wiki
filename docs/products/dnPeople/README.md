# dnPeople HRIS

Sistem HRIS untuk perusahaan Indonesia — implementasi **MVP 1** berdasarkan PRD, SRS, dan SDD v3.0.

| | |
|---|---|
| Status | MVP 1 core implemented |
| Repository | `dnpeople` |
| Index | [00_INDEX.md](./00_INDEX.md) |
| Last Updated | July 10, 2026 |

## Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | Express 5, TypeScript, Prisma |
| Database | PostgreSQL 16 |
| Cache | Redis 7 (reserved) |
| Auth | JWT + RBAC |

## Fitur MVP 1

- Auth & RBAC (5 role)
- Database karyawan + org structure
- Absensi clock in/out
- Cuti & izin + approval
- Payroll Indonesia (BPJS + PPh 21)
- Dashboard HR & laporan dasar
- Audit trail

## Quick Start

Kode sumber ada di repo/folder **`dnpeople/`** (sibling dari `company-wiki`).

```bash
cd dnpeople
docker compose up -d

cd backend && cp .env.example .env && npm install
npx prisma db push && npm run db:seed && npm run dev   # :4100

cd ../frontend && cp .env.example .env.local && npm install && npm run dev  # :3001
```

## Akun Demo

| Role | Email | Password |
|------|-------|----------|
| Company Admin | admin@dnpeople.id | Admin123! |
| Employee | budi@dnpeople.id | Employee123! |

## Dokumentasi

| Dokumen | File |
|---------|------|
| **Index** | [00_INDEX.md](./00_INDEX.md) |
| PRD | [PRD/dnpeople-prd.md](./PRD/dnpeople-prd.md) |
| SRS | [PRD/dnpeople-srs.md](./PRD/dnpeople-srs.md) |
| SDD | [PRD/dnpeople-sdd.md](./PRD/dnpeople-sdd.md) |
| Implementation Status | [docs/IMPLEMENTATION-STATUS.md](./docs/IMPLEMENTATION-STATUS.md) |
| Architecture | [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) |
| API | [docs/API.md](./docs/API.md) |
| Deployment | [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) |
| Current snapshot | [current-implementation.md](./current-implementation.md) |

## Catatan

dnPeople **bukan** sama dengan [DN People ERP](../dnpeople-erp/00_INDEX.md) (`ERP/` NestJS). Produk terpisah dengan fokus HRIS.

---

*Last Updated: July 10, 2026*

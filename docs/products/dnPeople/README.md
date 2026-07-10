# dnPeople

Sistem HRIS (Human Resource Information System) untuk perusahaan Indonesia — implementasi **MVP 1** berdasarkan PRD, SRS, dan SDD v3.0.

| | |
|---|---|
| Status | MVP 1 + MVP 2 core implemented |
| Spec | [company-wiki/dnPeople](../company-wiki/docs/products/dnPeople/00_INDEX.md) |
| Docs | [docs/](./docs/) |
| Last Updated | July 10, 2026 |

## Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | Express 5, TypeScript, Prisma |
| Database | PostgreSQL 16 |
| Cache | Redis 7 (siap, belum dipakai di MVP 1) |
| Auth | JWT + RBAC |

## Fitur

### MVP 1
- Auth & RBAC, employee DB, org structure
- Absensi, cuti, izin, payroll (BPJS + PPh 21), dashboard, audit

### MVP 2
- Shift & overtime (masuk payroll)
- Klaim/reimbursement & pinjaman (kasbon)
- Geofence attendance + koreksi absensi
- Dokumen, pengumuman, kalender HR, holiday
- Approval inbox terpadu
- Laporan lanjutan (turnover, lembur, cuti)

## Quick Start

### 1. Database

```bash
cd dnpeople
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma db push
npm run db:seed
npm run dev
```

API: `http://localhost:4100`

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

App: `http://localhost:3001`

## Akun Demo (setelah seed)

| Role | Email | Password |
|------|-------|----------|
| Company Admin | admin@dnpeople.id | Admin123! |
| Employee | budi@dnpeople.id | Employee123! |

## Dokumentasi

| Dokumen | File |
|---------|------|
| Project Overview | [docs/PROJECT-OVERVIEW.md](./docs/PROJECT-OVERVIEW.md) |
| Architecture | [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) |
| API Reference | [docs/API.md](./docs/API.md) |
| Deployment | [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) |
| Implementation Status | [docs/IMPLEMENTATION-STATUS.md](./docs/IMPLEMENTATION-STATUS.md) |
| Changelog | [docs/CHANGELOG.md](./docs/CHANGELOG.md) |
| PRD / SRS / SDD | [company-wiki dnPeople](../company-wiki/docs/products/dnPeople/00_INDEX.md) |

## Catatan Produk

dnPeople **bukan** sama dengan repo `ERP/` (DN People ERP NestJS). Ini produk HRIS terpisah sesuai spesifikasi di `company-wiki/docs/products/dnPeople/PRD/`.

## Lisensi

Proprietary — DN Tech / Dozer

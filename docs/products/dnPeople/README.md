# dnPeople

Sistem HRIS (Human Resource Information System) untuk perusahaan Indonesia — implementasi **MVP 1–4** berdasarkan PRD, SRS, dan SDD v3.1.

| | |
|---|---|
| Status | MVP 1–4 implemented |
| Spec | [00_INDEX.md](./00_INDEX.md) · [PRD/](./PRD/) |
| Docs | [docs/](./docs/) |
| Last Updated | July 10, 2026 |

## Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | Express 5, TypeScript, Prisma |
| Database | PostgreSQL 16 |
| Cache | Redis 7 (reserved, belum dipakai runtime) |
| Auth | JWT + API keys + RBAC |

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

### MVP 3
- Rekrutmen ATS + portal karir publik `/careers`
- Onboarding checklist, performance review + KPI/OKR
- Training, career path, aset
- Resign/offboarding, helpdesk, kebijakan & disiplin
- AI HR assistant (LLM + rule-based) + analytics

### MVP 4
- Multi-company platform + org hierarchy
- Custom workflows & advanced approval rules
- API keys, webhooks/integrations
- SSO Google/Microsoft/SAML + JIT, white-label branding
- Custom reports builder, row-level security
- AI document generator + AI recruitment screening

## Quick Start (tanpa Docker)

Database = **Supabase Session pooler**. Tidak perlu Docker.

### 1. Backend `.env`

```bash
cd dnpeople/backend
cp .env.example .env
```

Isi password di `DATABASE_URL` (lihat [docs/SUPABASE.md](./docs/SUPABASE.md)):

```env
DATABASE_URL="postgresql://postgres.bikhnyqslizcckusiyrg:YOUR_PASSWORD@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require&schema=public"
```

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

API: `http://localhost:4100`

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

App: `http://localhost:3001`

> Opsional saja: `docker compose up -d` jika ingin Postgres lokal di port `5433` — bukan requirement.
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
| **Supabase (DB)** | [docs/SUPABASE.md](./docs/SUPABASE.md) |
| **Install VPS** | [docs/VPS.md](./docs/VPS.md) |
| Implementation Status | [docs/IMPLEMENTATION-STATUS.md](./docs/IMPLEMENTATION-STATUS.md) |
| Changelog | [docs/CHANGELOG.md](./docs/CHANGELOG.md) |
| PRD / SRS / SDD | [00_INDEX.md](./00_INDEX.md) · [PRD/](./PRD/) |

## Catatan Produk

dnPeople **bukan** sama dengan repo `ERP/` (DN People ERP NestJS). Ini produk HRIS terpisah sesuai spesifikasi di `company-wiki/docs/products/dnPeople/PRD/`.

## Lisensi

Proprietary — DN Tech / Dozer

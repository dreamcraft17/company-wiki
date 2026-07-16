# dnPeople

Sistem HRIS (Human Resource Information System) untuk perusahaan Indonesia — implementasi **MVP 1–4** berdasarkan PRD, SRS, dan SDD v3.1, plus fondasi Talent Development dari PRD v4 (competitive alignment).

| | |
|---|---|
| Status | MVP 1–4 implemented + PRD v4 Talent Development foundation (Module 1–2) |
| Spec | [company-wiki/dnPeople](../company-wiki/docs/products/dnPeople/00_INDEX.md) |
| Docs | [docs/](./docs/) |
| Last Updated | July 16, 2026 |

## Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | Express 5, TypeScript, Prisma |
| Database | PostgreSQL 16 |
| Cache | Redis 7 (reserved, belum dipakai runtime) |
| Auth | JWT + API keys + RBAC |

## Fitur

Snapshot codebase saat ini mencakup **46 halaman web**, **45 modul route backend**, dan **88 model Prisma**. Status detail setiap kapabilitas—termasuk dependency production dan batas roadmap—tersedia di [Feature Catalog](./docs/FEATURE-CATALOG.md).

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
- Rekrutmen ATS + portal karir `/careers`
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

### PRD v4 — Talent Development (foundation)
- Competency framework, competency library, role-competency mapping, versioning
- Competency assessment (self/manager/peer/360), gap analysis per employee
- Individual Development Plan (IDP) dengan auto-generate goal dari competency gap, review progress
- LMS dasar: course/program, module, enrollment, completion tracking, sertifikat otomatis, transcript
- Belum termasuk: 9-box matrix, succession planning, internal career marketplace, earned wage access, salary benchmarking, paket industri (roadmap Q4 2026+)

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
| **Feature Catalog** | [docs/FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md) — daftar lengkap fitur existing, conditional, dan roadmap |
| Changelog | [docs/CHANGELOG.md](./docs/CHANGELOG.md) |
| PRD / SRS / SDD | [company-wiki dnPeople](../company-wiki/docs/products/dnPeople/00_INDEX.md) |

## Catatan Produk

dnPeople **bukan** sama dengan repo `ERP/` (DN People ERP NestJS). Ini produk HRIS terpisah sesuai spesifikasi di `company-wiki/docs/products/dnPeople/PRD/`.

## Lisensi

Proprietary — DN Tech / Dozer

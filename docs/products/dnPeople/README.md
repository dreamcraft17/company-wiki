# dnPeople

Sistem HRIS multi-tenant untuk perusahaan Indonesia — MVP 1–5 + PRD v5–**v11.0** (go-live execution artefacts).

| | |
|---|---|
| Owner | Dozer (CEO + Tech Lead) |
| Company | DN Tech (PT. Dozer Napitupulu Technology) |
| Brand | DnPeople |
| Status | Active — PRD v11.0 **complete in repo**; external go-live gates Conditional |
| Spec | [company-wiki/dnPeople](../company-wiki/docs/products/dnPeople/00_INDEX.md) |
| Docs | [docs/](./docs/) — start at [CURRENT-IMPLEMENTATION](./docs/CURRENT-IMPLEMENTATION.md) |
| UpdatedAt | July 22, 2026 |
| Inventory | **61** pages · **53** routes · **102** models · **32/32** tests |

## Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | Express 5, TypeScript, Prisma |
| Database | PostgreSQL 16 |
| Cache | — (Redis removed; unused) |
| Auth | JWT + API keys + RBAC |

## Fitur

Snapshot codebase saat ini mencakup **~61 halaman web**, **~53 modul route backend**, **102 model Prisma**, dan **32** backend tests. Login auto-discover tenant; session httpOnly cookie; marketing site di `/welcome` (+ pricing, FAQ, contact, demo, blog). Status detail: [Feature Catalog](./docs/FEATURE-CATALOG.md), [Current Implementation](./docs/CURRENT-IMPLEMENTATION.md), [Launch Gate Checklist](./docs/LAUNCH-GATE-CHECKLIST.md).

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

### PRD v5–v6 — Subscription & Enterprise Multi-Tenant

- Lima subscription tier, billing, invoice, payment adapter, server-side feature gating, dan grace/freeze mode
- POOL/SILO/BRIDGE tenant policy, verified-domain discovery, isolation guard, dan tenant audit
- Per-tenant SSO/JIT, SCIM 2.0 Users/Groups, organization hierarchy, dan scoped RBAC
- Tenant quota/usage monitoring serta white-label custom-domain metadata
- Admin UI `/billing`, `/platform`, dan `/tenant-management`
- Menu `/staff-accounts` untuk membuat akun login staff standalone/linked employee, role, status aktif, dan reset password

### PRD v7.0 — Attendance Excel manual import

- Panel admin/HR di `/attendance`: download template `.xlsx`, dry-run validation, preview, confirm import, histori upload
- API `/attendance/template/download`, `/attendance/import`, `/attendance/imports` — company isolation, role guard, `MANUAL_UPLOAD` source
- UI admin Excel-first; generator QR kantor di halaman admin disembunyikan (API `GET /attendance/qr/today` tetap ada untuk kompatibilitas employee QR scan)

### PRD v8.0 — Security & stability

- Auth file downloads (`/api/v1/files`), enforced API-key scopes, atomic/idempotent payroll finalize, batched payroll adjustments
- httpOnly session cookie (SSO tanpa JWT di URL); MFA QR di `/settings/mfa`; Slip Gaji untuk semua role
- Attendance import Idempotency-Key; report export cap + async jobs; signed payslip links; email outbox
- Detail: [CURRENT-IMPLEMENTATION.md](./docs/CURRENT-IMPLEMENTATION.md) · [IMPLEMENTATION-STATUS.md](./docs/IMPLEMENTATION-STATUS.md)

### PRD v9–v10 — Launch readiness

- Tenant API quota hard-limit, password reset, billing pay-now, OpenAPI/Swagger
- Ops: `/alive` + enriched health/ready/metrics, backup verify/restore-drill, k6 auth loadtest, Datadog stub + alert runbooks
- Privacy export + legal templates; marketing `/welcome`

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
npm run db:migrate
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
| **Current Implementation** | [docs/CURRENT-IMPLEMENTATION.md](./docs/CURRENT-IMPLEMENTATION.md) |
| **Audit (fitur/bug/perf)** | [docs/AUDIT-FEATURE-BUG-PERFORMANCE.md](./docs/AUDIT-FEATURE-BUG-PERFORMANCE.md) |
| **Feature Catalog** | [docs/FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md) — daftar lengkap fitur existing, conditional, dan roadmap |
| Changelog | [docs/CHANGELOG.md](./docs/CHANGELOG.md) |
| PRD / SRS / SDD | [company-wiki dnPeople](../company-wiki/docs/products/dnPeople/00_INDEX.md) |

## Catatan Produk

dnPeople **bukan** sama dengan repo `ERP/` (DN People ERP NestJS). Ini produk HRIS terpisah sesuai spesifikasi di `company-wiki/docs/products/dnPeople/PRD/`.

## Lisensi

Proprietary — DN Tech © 2026

Property of DN Tech — PT. Dozer Napitupulu Technology · 2026

| | |
|---|---|
| Owner | Dozer (CEO + Tech Lead) |
| Company | DN Tech (PT. Dozer Napitupulu Technology) |
| Brand | DnPeople |
| UpdatedAt | July 19, 2026 |

# dnPeople

**dnPeople** adalah HRIS (Human Resource Information System) multi-tenant untuk startup, UMKM, dan perusahaan menengah di Indonesia. Satu platform untuk mengelola SDM dari rekrutmen sampai resign — absensi, cuti, payroll BPJS/PPh 21, talent & succession, hingga kontrol enterprise — dengan paket berlangganan yang jelas (Gratis → Enterprise).

| | |
|---|---|
| Owner | Dozer (CEO + Tech Lead + PM) |
| Company | DN Tech (PT. Dozer Napitupulu Technology) |
| Brand | DnPeople |
| Production | App [hris.dntech.id](https://hris.dntech.id) · API [api.hris.dntech.id](https://api.hris.dntech.id) |
| Release | **[v1.1.0](https://github.com/dreamcraft17/dnpeople/releases/tag/v1.1.0)** — billing hardening, a11y CI, SUPER_ADMIN routing, ops |
| Status | Active — v15 Admin + v14 Tutorial + v13 Talent + **Xendit PG** + billing UI + grouped nav; next **PRD v16.0** Module 4 |
| Docs living | [docs/](./docs/) — **[Overview](./docs/DNPEOPLE-HRIS-OVERVIEW.md)** · [A11Y](./docs/A11Y-TESTING.md) · [Chaos](./docs/CHAOS-ENGINEERING.md) · [CHANGELOG](./docs/CHANGELOG.md) · [NEXT-PRD-BRIEF](./docs/NEXT-PRD-BRIEF.md) |
| UpdatedAt | August 22, 2026 |

> **Bukan** produk yang sama dengan repo `ERP/` (DN People ERP NestJS). dnPeople = HRIS SaaS (Express + Next.js) sesuai PRD/SRS/SDD di company-wiki.

---

## Apa yang diselesaikan dnPeople?

| Masalah HR sehari-hari | Jawaban di dnPeople |
|------------------------|---------------------|
| Data karyawan tersebar di Excel/WhatsApp | Database karyawan + organisasi, dokumen, kebijakan, pengumuman |
| Absensi & cuti sulit diaudit | Clock-in, shift, koreksi, cuti/izin, approval inbox |
| Slip gaji & pajak manual | Payroll Indonesia (BPJS, PPh 21, payslip PDF) |
| Rekrutmen & onboarding tidak terhubung | ATS + portal karir + checklist onboarding |
| Talenta & suksesi “di kepala manajer” | Kompetensi, IDP, LMS, **9-box matrix**, succession & readiness |
| User bingung mulai dari mana | Help menu + tutorial interaktif + knowledge base (tanpa video) |
| Tim DN Tech kelola seluruh tenant | Admin Console `/admin` (customers, billing, flags, support, health) |
| Fitur terlihat padahal belum dibayar | Tier gating jujur — nav hanya menampilkan fitur paket aktif |
| Bayar subscription ribet | **Xendit** hosted checkout, riwayat metode bayar, **unduh invoice PDF** |
| Menu aplikasi terlalu panjang | **Grouped sidebar** (8 section) + flat mode untuk karyawan |

**Untuk siapa:** HR, manager, finance, karyawan, dan admin perusahaan (6 role RBAC).  
**Untuk skala mana:** FREE hingga **30** karyawan; STARTER hingga **50**; Professional hingga **300**; Business/Enterprise untuk multi-cabang & kontrol lanjutan.

---

## Fitur produk (ringkas)

Detail status Available / Conditional / Roadmap: **[FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md)**.

### Core HR (Gratis / FREE)
- Dashboard (KPI + diagram absensi/departemen), master karyawan, struktur organisasi
- Dokumen karyawan & perusahaan, kebijakan, pengumuman, kalender
- Helpdesk / tiket dukungan
- **Help & onboarding (PRD v14.0):** menu `?`, tutorial interaktif, knowledge base
- Paket & billing (upsell jujur) + MFA keamanan akun

### Operasi harian (Starter+)
- Absensi (termasuk import Excel), koreksi, geofence/QR sesuai konfigurasi
- Cuti & izin, shift, approval terpadu
- Payroll dasar + slip gaji karyawan
- Laporan dasar absensi/cuti/payroll

### HR strategis (Professional+)
- Lembur, klaim/reimbursement, pinjaman (kasbon)
- Rekrutmen ATS + portal `/careers`, onboarding
- Performance review, KPI/OKR, training
- **Talent:** kompetensi & gap analysis, IDP, LMS
- **Talent Matrix (PRD v13.0):** kalibrasi 9-box, lock/unlock, succession/readiness, development proposals → IDP/LMS, laporan Excel/PDF/HTML
- Survei, laporan lanjutan, webhook dasar

### Enterprise & platform (Business / Enterprise)
- Aset, offboarding lanjutan, audit advanced, custom reports, workflows
- API/REST, SSO/SAML, SCIM, white-label branding, multi-company
- AI assistant & AI dokumen (Enterprise)

### Billing, legal & go-live (Agustus 2026)
- **Xendit Invoice v2** — bayar dari `/billing`, webhook + return sync, bayar saat trial
- Invoice PDF export, metode bayar (JeniusPay, QRIS, ShopeePay, dll.) di riwayat
- ToS + Privacy Policy acceptance (signup + compliance banner)
- Landing `/welcome`, `/docs` hub, pricing, FAQ, demo, lead/beta API
- Demo sandbox publik (`@demo.dnpeople.id`) — tier FREE, nav jujur; kredensial tampil di `/login`

---

## Paket berlangganan (SSOT)

| Tier | Headcount | Inti nilai |
|------|-----------|------------|
| **FREE** | Hard **30** | Core HR + helpdesk — nav hanya fitur FREE |
| **STARTER** | Hard **50** | + absensi, cuti, shift, payroll dasar, laporan dasar |
| **PROFESSIONAL** | Hard **300** | + talent matrix, rekrutmen, performance, LMS, OT/klaim/loans |
| **BUSINESS** | Soft @1000 | + API, workflows, aset, audit, custom reports |
| **ENTERPRISE** | Custom | + SSO, branding, multi-company, AI |

Harga UI: `frontend/src/lib/subscriptionCatalog.ts` · gate server: `backend/src/lib/subscriptionFeatures.ts`.

---

## Inventori codebase (snapshot)

| Area | Angka |
|------|-------|
| Halaman frontend (app + marketing + admin) | ~**96** |
| Modul route API | ~**60** (+ SCIM) |
| Model Prisma | **130** |
| Backend unit tests | **123/123** |
| A11y tests (Playwright + axe) | **16** public pages |
| Baseline PRD | v3.1 → **v15.0** / v14.0 / v13.0 / v12.1 / v11.1 |

Status implementasi: [IMPLEMENTATION-STATUS.md](./docs/IMPLEMENTATION-STATUS.md) · baseline PRD berikutnya: [NEXT-PRD-BRIEF.md](./docs/NEXT-PRD-BRIEF.md).

---

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind — mobile-first, light/dark theme |
| Backend | Express 5, TypeScript, Prisma 6, PostgreSQL (Supabase) |
| Auth | JWT httpOnly cookie, RBAC 6 roles, MFA TOTP, SSO/SAML |
| Payment | Xendit Invoice v2 (primary) · Midtrans SNAP (legacy / admin switch) |
| Deploy | VPS + PM2 + Nginx — lihat [DEPLOYMENT.md](./docs/DEPLOYMENT.md) |
| CI | GitHub Actions — schema migrate, typecheck, unit tests, load smoke, a11y |

Brand asset canonical: **`frontend/public/logo3.png`** (AppShell, marketing, login, JSON-LD).

---

## Prerequisites

- **Node.js 22+**
- PostgreSQL via **Supabase Session pooler** (tanpa Docker) — panduan [SUPABASE.md](./docs/SUPABASE.md)
- Copy env sebelum jalan: `backend/.env.example` → `.env`, `frontend/.env.example` → `.env.local`

---

## Quick start (tanpa Docker)

### Backend

```bash
cd backend
cp .env.example .env
# isi DATABASE_URL — lihat docs/SUPABASE.md
npm ci
npm run db:migrate
npm run db:seed
npm run dev
```

API: `http://localhost:4100`

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm ci
npm run dev
```

App: `http://localhost:3001` · Landing: `http://localhost:3001/welcome`

Payment lokal: set `XENDIT_SECRET_KEY` di backend — [xendit/XENDIT-PAYMENT-SETUP.md](./docs/xendit/XENDIT-PAYMENT-SETUP.md).

---

## Environment variables

### Backend (wajib lokal)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Supabase Session pooler connection string |
| `JWT_SECRET` | Yes | Auth signing secret |
| `PORT` | No | Default `4100` |
| `FRONTEND_URL` | Yes | CORS + cookie origin (e.g. `http://localhost:3001`) |

### Backend (wajib production)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` |
| `JWT_SECRET` | Yes | Long random string |
| `FIELD_ENCRYPTION_KEYS` | Yes | Salary / sensitive field encryption |
| `METRICS_TOKEN` | Yes | Bearer token for `/metrics` (503 if unset) |
| `COOKIE_SECURE` | Yes | `true` behind HTTPS |
| `XENDIT_SECRET_KEY` | For billing | Xendit API key |
| `XENDIT_WEBHOOK_TOKEN` | For billing | Webhook verification |

Lengkap: [backend/.env.example](./backend/.env.example) · [SECURITY.md](./docs/SECURITY.md)

### Frontend

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | e.g. `http://localhost:4100/api/v1` |
| `NEXT_PUBLIC_SHOW_DEMO_CREDS` | No | Default shown; set `false` to hide demo login hints |

Marketing opsional: `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_ZAPIER_WEBHOOK`, `NEXT_PUBLIC_CALENDLY_URL`, `NEXT_PUBLIC_DEMO_VIDEO_URL` — lihat [frontend/.env.example](./frontend/.env.example).

---

## Project structure

```
dnpeople/
├── backend/          # Express API, Prisma, migrations
├── frontend/         # Next.js app (:3001)
├── docs/             # Product & ops documentation
├── scripts/          # Deploy, backup, smoke test, commit lint
└── .github/workflows/  # CI, a11y, backup
```

---

## Testing & verifikasi

```bash
# Backend unit tests (123)
cd backend && npm test

# Database constraints + audit immutability (butuh DATABASE_URL)
cd backend && npm run test:database

# Frontend accessibility (Playwright + axe, 16 public pages)
cd frontend && npm run test:a11y

# Post-deploy smoke
bash scripts/smoke-test.sh
```

CI menjalankan migrate deploy, typecheck, unit tests, load smoke (p95), dan a11y pada push/PR ke `main`.

---

## Akun demo (setelah seed)

Sandbox demo = tier **FREE** (nav jujur: core HR saja; data sample boleh lengkap).  
Kredensial ditampilkan di `/login` kecuali `NEXT_PUBLIC_SHOW_DEMO_CREDS=false`.  
Password semua akun: **`Demo123!`**

| Role | Email |
|------|-------|
| Company Admin | dina.wijaya@demo.dnpeople.id |
| HR | maya.putri@demo.dnpeople.id |
| Manager | raka.pratama@demo.dnpeople.id |
| Finance | sinta.wijaya@demo.dnpeople.id |
| Employee | budi.santoso@demo.dnpeople.id |

Lengkap: [docs/DEMO-ACCOUNTS.md](./docs/DEMO-ACCOUNTS.md)

---

## Dokumentasi

| Dokumen | Isi |
|---------|-----|
| [CHANGELOG.md](./docs/CHANGELOG.md) | Riwayat release (**v1.1.0** latest) |
| [NEXT-PRD-BRIEF.md](./docs/NEXT-PRD-BRIEF.md) | Brief PRD v16.0 (1 halaman) |
| [PRD v16 prep](./docs/PRD/dnpeople-prd-v16.0-prep-id.md) | Persiapan Module 4 career marketplace |
| [FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md) | Daftar fitur Available / Conditional / Roadmap |
| [CURRENT-IMPLEMENTATION.md](./docs/CURRENT-IMPLEMENTATION.md) | Baseline implementasi |
| [IMPLEMENTATION-STATUS.md](./docs/IMPLEMENTATION-STATUS.md) | Status per MVP/PRD |
| [LAUNCH-GATE-CHECKLIST.md](./docs/LAUNCH-GATE-CHECKLIST.md) | Gerbang go-live eksternal |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) · [API.md](./docs/API.md) | Teknis |
| [SUPABASE.md](./docs/SUPABASE.md) · [VPS.md](./docs/VPS.md) · [DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Deploy |
| [A11Y-TESTING.md](./docs/A11Y-TESTING.md) · [CHAOS-ENGINEERING.md](./docs/CHAOS-ENGINEERING.md) | Quality & resilience |
| [xendit/XENDIT-PAYMENT-SETUP.md](./docs/xendit/XENDIT-PAYMENT-SETUP.md) | Setup pembayaran Xendit |

---

## Kontak & lisensi

- Produk / umum: **info@dntech.id**
- Proprietary — DN Tech © 2026 · PT. Dozer Napitupulu Technology · Jakarta

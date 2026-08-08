# dnPeople

**dnPeople** adalah HRIS (Human Resource Information System) multi-tenant untuk startup, UMKM, dan perusahaan menengah di Indonesia. Satu platform untuk mengelola SDM dari rekrutmen sampai resign — absensi, cuti, payroll BPJS/PPh 21, talent & succession, hingga kontrol enterprise — dengan paket berlangganan yang jelas (Gratis → Enterprise).

| | |
|---|---|
| Owner | Dozer (CEO + Tech Lead) |
| Company | DN Tech (PT. Dozer Napitupulu Technology) |
| Brand | DnPeople |
| Status | Active — PRD **v15.0** Admin Console + **v14.0** Tutorial/KB + v13.0 Talent Matrix; **Xendit payment** in repo; FREE hard **30** emp · STARTER **50** **complete in repo**; sandbox E2E Conditional |
| Produk di web | [Landing `/welcome`](./frontend) · Spec [company-wiki/dnPeople](../company-wiki/docs/products/dnPeople/00_INDEX.md) |
| Docs living | [docs/](./docs/) — mulai dari [CURRENT-IMPLEMENTATION](./docs/CURRENT-IMPLEMENTATION.md) · [FEATURE-CATALOG](./docs/FEATURE-CATALOG.md) |
| UpdatedAt | August 8, 2026 |

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

### Marketing & go-live
- Landing `/welcome`, pricing, FAQ, demo, blog, legal (privacy/terms/DPA)
- Lead & beta signup API; demo sandbox publik (`@demo.dnpeople.id`)

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
| Halaman frontend (app + marketing + admin) | ~**86** |
| Modul route API | ~**56** (+ SCIM) |
| Model Prisma | ~**120** |
| Backend unit tests | **53/53** |
| Baseline PRD | v3.1 → **v15.0** / v14.0 / v13.0 / v12.1 / v11.1 |

Status implementasi: [IMPLEMENTATION-STATUS.md](./docs/IMPLEMENTATION-STATUS.md) · baseline PRD berikutnya: [NEXT-PRD-BRIEF.md](./docs/NEXT-PRD-BRIEF.md).

---

## Quick start (tanpa Docker)

Database = **Supabase Session pooler**. Tidak wajib Docker.

### Backend

```bash
cd dnpeople/backend
cp .env.example .env
# isi DATABASE_URL — lihat docs/SUPABASE.md
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

API: `http://localhost:4100`

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

App: `http://localhost:3001` · Landing: `http://localhost:3001/welcome`

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXX
NEXT_PUBLIC_ZAPIER_WEBHOOK=https://...
NEXT_PUBLIC_CALENDLY_URL=https://...
NEXT_PUBLIC_DEMO_VIDEO_URL=https://...
LEADS_NOTIFY_EMAIL=info@dntech.id
```

---

## Akun demo (setelah seed)

Sandbox demo = tier **FREE** (nav jujur: core HR saja; data sample boleh lengkap).  
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
| [FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md) | Daftar fitur Available / Conditional / Roadmap |
| [CURRENT-IMPLEMENTATION.md](./docs/CURRENT-IMPLEMENTATION.md) | Baseline untuk PRD berikutnya |
| [IMPLEMENTATION-STATUS.md](./docs/IMPLEMENTATION-STATUS.md) | Status per MVP/PRD |
| [PROJECT-OVERVIEW.md](./docs/PROJECT-OVERVIEW.md) | Visi, milestone, struktur repo |
| [LAUNCH-GATE-CHECKLIST.md](./docs/LAUNCH-GATE-CHECKLIST.md) | Gerbang go-live eksternal |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) · [API.md](./docs/API.md) | Teknis (detail stack & endpoint) |
| [SUPABASE.md](./docs/SUPABASE.md) · [VPS.md](./docs/VPS.md) · [DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Deploy |
| [xendit/XENDIT-PAYMENT-SETUP.md](./docs/xendit/XENDIT-PAYMENT-SETUP.md) | Setup pembayaran Xendit (test mode) |
| [CHANGELOG.md](./docs/CHANGELOG.md) | Riwayat perubahan |
| [company-wiki dnPeople](../company-wiki/docs/products/dnPeople/00_INDEX.md) | PRD / SRS / SDD |

Verifikasi cepat: `cd backend && npm test` (80 tests) · `bash scripts/smoke-test.sh`

---

## Kontak & lisensi

- Produk / umum: **info@dntech.id**
- Proprietary — DN Tech © 2026 · PT. Dozer Napitupulu Technology · Jakarta

| | |
|---|---|
| Owner | Dozer (CEO + Tech Lead) |
| Company | DN Tech (PT. Dozer Napitupulu Technology) |
| Brand | DnPeople |
| UpdatedAt | August 8, 2026 |

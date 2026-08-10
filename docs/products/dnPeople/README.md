# dnPeople

**dnPeople** adalah HRIS (Human Resource Information System) multi-tenant untuk startup, UMKM, dan perusahaan menengah di Indonesia. Satu platform untuk mengelola SDM dari rekrutmen sampai resign — absensi, cuti, payroll BPJS/PPh 21, talent & succession, hingga kontrol enterprise — dengan paket berlangganan yang jelas (Gratis → Enterprise).

| | |
|---|---|
| Owner | Dozer (CEO + Tech Lead) |
| Company | DN Tech (PT. Dozer Napitupulu Technology) |
| Brand | DnPeople |
| Production | App [hris.dntech.id](https://hris.dntech.id) · API [api.hris.dntech.id](https://api.hris.dntech.id) |
| Repo | [github.com/dreamcraft17/dnpeople](https://github.com/dreamcraft17/dnpeople) |
| Status | Active — v15 Admin + v14 Tutorial + v13 Talent + **Xendit PG** + billing UI + grouped nav; next **PRD v16.0** Module 4 |
| Spec PRD/SRS/SDD | [00_INDEX.md](./00_INDEX.md) · [PRD/](./PRD/) |
| Docs living (mirror) | [docs/](./docs/) — [NEXT-PRD-BRIEF](./docs/NEXT-PRD-BRIEF.md) · [PRD v16 prep](./docs/PRD/dnpeople-prd-v16.0-prep-id.md) |
| UpdatedAt | August 10, 2026 |

> **Bukan** produk yang sama dengan [dnCore ERP](../dnpeople-erp/00_INDEX.md) (NestJS). dnPeople = HRIS SaaS (Express + Next.js).

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
- Demo sandbox publik (`@demo.dnpeople.id`) — tier FREE, nav jujur

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
| Model Prisma | **129** |
| Backend unit tests | **81/81** |
| Baseline PRD | v3.1 → **v15.0** / v14.0 / v13.0 / v12.1 / v11.1 |

Status implementasi: [IMPLEMENTATION-STATUS.md](./docs/IMPLEMENTATION-STATUS.md) · baseline PRD berikutnya: [NEXT-PRD-BRIEF.md](./docs/NEXT-PRD-BRIEF.md).

---

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind — mobile-first, light/dark theme |
| Backend | Express 5, TypeScript, Prisma 6, PostgreSQL (Supabase) |
| Auth | JWT httpOnly cookie, RBAC 6 roles, MFA TOTP, SSO/SAML |
| Payment | Xendit Invoice v2 (primary) |
| Deploy | VPS + PM2 + Nginx — lihat [DEPLOYMENT.md](./docs/DEPLOYMENT.md) |

Brand asset canonical: **`frontend/public/logo3.png`** (AppShell, marketing, login, JSON-LD).

---

## Quick start (repo `dnpeople`)

Database = **Supabase Session pooler**. Tidak wajib Docker.

```bash
git clone https://github.com/dreamcraft17/dnpeople.git
cd dnpeople/backend && cp .env.example .env && npm install && npm run db:migrate && npm run db:seed && npm run dev
cd ../frontend && cp .env.example .env.local && npm install && npm run dev
```

- API: `http://localhost:4100`
- App: `http://localhost:3001` · Landing: `/welcome`
- Payment lokal: `XENDIT_SECRET_KEY` — [xendit/XENDIT-PAYMENT-SETUP.md](./docs/xendit/XENDIT-PAYMENT-SETUP.md)

---

## Akun demo (setelah seed)

Sandbox demo = tier **FREE** (nav jujur: core HR saja). Password: **`Demo123!`**

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
| [00_INDEX.md](./00_INDEX.md) | Index PRD/SRS/SDD company-wiki |
| [NEXT-PRD-BRIEF.md](./docs/NEXT-PRD-BRIEF.md) | Brief PRD v16.0 |
| [PRD v16 prep](./docs/PRD/dnpeople-prd-v16.0-prep-id.md) | Persiapan Module 4 career marketplace |
| [FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md) | Fitur Available / Conditional / Roadmap |
| [CURRENT-IMPLEMENTATION.md](./docs/CURRENT-IMPLEMENTATION.md) | Baseline implementasi |
| [LAUNCH-GATE-CHECKLIST.md](./docs/LAUNCH-GATE-CHECKLIST.md) | Gerbang go-live |
| [CHANGELOG.md](./docs/CHANGELOG.md) | Riwayat perubahan |

Verifikasi cepat (di repo): `cd backend && npm test` (81 tests) · `bash scripts/smoke-test.sh`

---

## Kontak & lisensi

- Produk / umum: **info@dntech.id**
- Proprietary — DN Tech © 2026 · PT. Dozer Napitupulu Technology · Jakarta

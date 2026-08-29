# dnPeople HRIS — Penjelasan Produk (Satu Dokumen)

| | |
|---|---|
| **Produk** | dnPeople — Human Resource Information System (HRIS) SaaS |
| **Pemilik** | Dozer (CEO + Tech Lead + PM) · **DN Tech** (PT. Dozer Napitupulu Technology) |
| **Brand** | DnPeople |
| **Production** | App [hris.dntech.id](https://hris.dntech.id) · API [api.hris.dntech.id](https://api.hris.dntech.id) |
| **Marketing** | [dnpeople.id](https://dnpeople.id) (DNS go-live conditional) |
| **Kontak** | info@dntech.id |
| **Diperbarui** | 17 Agustus 2026 |
| **Repo** | `dnpeople/` — Express + Next.js (bukan `ERP/` NestJS) |

> Dokumen ini merangkum **apa itu dnPeople**, **untuk siapa**, **fitur per paket**, **billing/admin**, dan **cara deploy** dalam satu file. Detail teknis panjang tetap di dokumen terpisah (lihat §12).

---

## 1. Apa itu dnPeople?

**dnPeople** adalah HRIS **multi-tenant** untuk startup, UMKM, dan perusahaan menengah di **Indonesia**. Satu platform web untuk mengelola siklus SDM:

- **Rekrutmen → onboarding → operasi harian → payroll → talent → offboarding**
- Compliance lokal: **BPJS, PPh 21, UU PDP**
- Paket berlangganan transparan: **Gratis → Starter → Professional → Business → Enterprise**

Setiap **perusahaan (tenant)** punya data terisolasi. Satu instalasi platform melayani banyak customer; tim **DN Tech** mengoperasikan platform lewat **Vendor Admin Console** (`/admin`).

**Bukan** produk yang sama dengan folder `ERP/` (DN People ERP NestJS). dnPeople = HRIS SaaS sesuai PRD/SRS/SDD di repo ini.

---

## 2. Untuk siapa?

| Persona | Peran di sistem | Kebutuhan utama |
|---------|-----------------|-----------------|
| **HR / People Ops** | `HR`, `COMPANY_ADMIN` | Master karyawan, absensi, cuti, payroll, rekrutmen, talent |
| **Manager** | `MANAGER` | Approval tim, laporan departemen |
| **Finance** | `FINANCE` | Payroll, klaim, pinjaman, laporan keuangan HR |
| **Karyawan** | `EMPLOYEE` | Self-service: absensi, cuti, slip gaji, training, helpdesk |
| **Admin perusahaan** | `COMPANY_ADMIN` | Billing, tier, staff account, SSO |
| **Tim DN Tech** | `SUPER_ADMIN` | Kelola semua customer, revenue, support, flags, health |

**Skala headcount (hard limit per tier):**

| Tier | Batas karyawan |
|------|----------------|
| FREE | 30 |
| STARTER | 50 |
| PROFESSIONAL | 300 |
| BUSINESS | Soft limit ~1.000 |
| ENTERPRISE | Custom |

---

## 3. Masalah yang diselesaikan

| Pain point HR | Solusi dnPeople |
|---------------|-----------------|
| Data karyawan di Excel/WhatsApp | Database karyawan + org chart + dokumen + kebijakan |
| Absensi & cuti sulit diaudit | Clock-in, shift, koreksi, leave, approval inbox |
| Payroll & pajak manual | Payroll Indonesia (BPJS, PPh 21, slip PDF) |
| Rekrutmen terpisah dari HRIS | ATS + portal karir `/careers` + onboarding |
| Talent & suksesi informal | Kompetensi, IDP, LMS, **9-box matrix**, succession |
| User bingung pakai sistem | Help menu, tutorial interaktif, knowledge base |
| Fitur tampil padahal belum bayar | **Tier gating jujur** — menu hanya fitur paket aktif |
| Bayar subscription ribet | Billing in-app, invoice PDF, **Xendit** / **Midtrans SNAP** |
| Tim vendor kelola banyak client | Admin Console: customers, billing, trial, gateway, flags |

---

## 4. Modul & fitur (ringkas per tier)

### FREE — Core HR
- Dashboard, master karyawan, organisasi, dokumen, pengumuman, kalender, kebijakan
- Helpdesk, help & tutorial dasar, MFA
- Paket & billing (upsell), API quota dasar

### STARTER — Operasi harian (+ trial 2 bulan)
- Semua FREE +
- Absensi (manual/GPS/QR/geofence sesuai config), koreksi, shift
- Cuti & izin, approval, payroll **dasar**, laporan dasar

### PROFESSIONAL — HR strategis (+ trial 2 bulan)
- Semua STARTER +
- Payroll lanjutan, lembur, klaim, pinjaman
- Rekrutmen ATS, onboarding, performance, training
- **Talent:** competency, gap analysis, IDP, LMS
- **9-box talent matrix**, succession & readiness (PRD v13)
- Survei, webhook, laporan lanjutan

### BUSINESS — Platform scale
- Semua PROFESSIONAL +
- Multi-cabang, API REST, workflow lanjutan, security advanced
- Custom reports, asset, offboarding, audit advanced

### ENTERPRISE — Kontrol penuh
- Semua BUSINESS +
- Multi-company, SSO/SAML, SCIM, white-label branding
- AI assistant & AI dokumen (conditional provider)

**Katalog lengkap:** [FEATURE-CATALOG.md](./FEATURE-CATALOG.md)

---

## 5. Paket, harga & trial

### Harga per karyawan/bulan (default — bisa diubah admin)

| Tier | Harga default | Min. tagihan | Trial |
|------|---------------|--------------|-------|
| FREE | Rp 0 | — | 4 bulan |
| STARTER | Rp 20.000/karyawan | Rp 20.000 | 2 bulan |
| PROFESSIONAL | Rp 25.000/karyawan | Rp 25.000 | 2 bulan |
| BUSINESS | Rp 20.000/karyawan (volume) | Rp 6.000.000 | 2 bulan |
| ENTERPRISE | Harga khusus | — | — |

**Sumber harga (SSOT runtime):**
- Database: tabel `subscription_tier_plans`
- Admin: **dnPeople → Harga Paket** (`/admin/tier-pricing`)
- API public: `GET /api/v1/subscription/plans` (billing & marketing)
- Fallback kode: `backend/src/lib/subscriptionFeatures.ts`

### Perilaku trial (customer)
- Selama trial: **fitur tier penuh** aktif
- Customer bisa **bayar kapan saja** dari `/billing` (tidak harus tunggu trial habis)
- Countdown trial di UI billing + badge status
- Scheduler sistem: reminder H-5/H-1, auto-charge atau downgrade saat trial habis (kecuali trial **dibekukan** admin)

### Kelola trial (Vendor Admin)
**Menu:** Admin → **Customers** → klik nama perusahaan → section **Kelola trial**

| Aksi | Fungsi |
|------|--------|
| +7 / +30 hari | Perpanjang trial |
| −7 / −30 hari | Kurangi trial |
| Custom hari | Tambah/kurangi bebas (1–365) |
| Set tanggal | Set `trialEndsAt` ke tanggal tertentu |
| **Freeze** | Pause countdown — customer tetap trial meski tanggal lewat |
| **Unfreeze** | Lanjutkan countdown |
| **Akhiri trial** | Trial berakhir sekarang |

API: `PATCH /api/v1/admin/customers/:id/trial` · Audit: admin log + subscription audit log.

---

## 6. Billing & payment gateway

### Alur customer (perusahaan)
1. Signup → tier default **FREE** (setuju ToS + Privacy)
2. Upgrade tier di **`/billing`** → sistem buat **invoice** (pro-rata)
3. Bayar via gateway aktif → webhook → invoice **PAID** → subscription aktif
4. Recurring: scheduler bulanan + email link bayar

### Gateway yang didukung
| Gateway | Mode | Admin switch |
|---------|------|--------------|
| **Xendit Invoice** | Hosted checkout page | `/admin/payment-gateway` |
| **Midtrans SNAP** | Modal checkout | `/admin/payment-gateway` |

Satu gateway **aktif** untuk checkout baru (flag DB: `platform:active-payment-provider`).

**Midtrans production:** `MIDTRANS_IS_PRODUCTION=true` + production keys · webhook: `POST /api/v1/webhooks/midtrans` · setup: [PG/MIDTRANS-PRODUCTION-SETUP.md](./PG/MIDTRANS-PRODUCTION-SETUP.md)

**Xendit:** [xendit/XENDIT-PAYMENT-SETUP.md](./xendit/XENDIT-PAYMENT-SETUP.md)

### Fitur billing UI
- Stat cards paket, filter invoice (Semua / Perlu bayar / Lunas)
- Unduh **invoice PDF**, riwayat metode bayar
- Return URL sync setelah bayar di gateway

---

## 7. Vendor Admin Console (`/admin`)

Hanya **`SUPER_ADMIN`** (tim DN Tech). Tenant operator DN Tech (`isPlatformOperator`) **tidak** masuk analytics customer/MRR.

| Menu | Path | Fungsi |
|------|------|--------|
| Dashboard | `/admin` | Revenue summary, at-risk, health |
| **Customers** | `/admin/customers` | Daftar client, detail, **kelola trial**, notes, block, impersonate |
| **Harga Paket** | `/admin/tier-pricing` | Edit harga per tier, min charge, headcount limit |
| **Payment Gateway** | `/admin/payment-gateway` | Switch Xendit ↔ Midtrans |
| Revenue & Billing | `/admin/billing` | MRR/ARR, refunds |
| Payment Management | `/admin/payments` | Transaksi payment |
| Analytics | `/admin/analytics/*` | Feature usage, churn, cohort, support |
| Support | `/admin/support/tickets` | Tiket customer |
| Content | `/admin/content/*` | Tutorial & KB CRUD |
| Feature Flags | `/admin/flags` | Toggle + rollout |
| Health / Logs | `/admin/health` | Monitoring, alerts |
| Audit Log | `/admin/audit-log` | Jejak aksi admin |

Panduan operasional: [ADMIN-GUIDE.md](./ADMIN-GUIDE.md)

---

## 8. Role, auth & keamanan

### 6 role RBAC
`SUPER_ADMIN` · `COMPANY_ADMIN` · `HR` · `MANAGER` · `FINANCE` · `EMPLOYEE`

- **Backend** selalu enforce permission (menyembunyikan menu saja **bukan** otorisasi)
- Row-level scope: `all`, `organization`, `department`, `location`, `self`, `custom`
- Login: email + password, **tanpa** Company ID di form (tenant auto-discover)
- MFA TOTP, SSO Google/Microsoft/SAML, API keys scoped, SCIM `/scim/v2`
- Session: JWT httpOnly cookie + Bearer; fail-closed on 401

Detail: [SECURITY.md](./SECURITY.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 9. Tech stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind — mobile-first, light/dark theme |
| Backend | Express 5, TypeScript, Prisma 6 |
| Database | PostgreSQL (Supabase Session pooler) |
| Auth | JWT, RBAC, MFA, SSO/SAML, SCIM |
| Payment | Xendit + Midtrans (switchable) |
| Storage | Local disk atau S3-compatible |
| Email | SMTP + outbox retry |
| Deploy | VPS + Nginx + PM2 |
| Observability | `/health`, `/metrics` (Prometheus), optional Sentry/Datadog |

**Snapshot codebase (Agustus 2026):**

| Metrik | Nilai |
|--------|-------|
| Halaman frontend | ~96 (app + marketing + admin) |
| Modul API route | ~60 (+ SCIM) |
| Model Prisma | 129+ |
| Backend tests | 103 pass |
| Migrations | 18+ |

Brand asset: **`/logo3.png`**

---

## 10. Production & deploy

### URL
| Layanan | URL |
|---------|-----|
| App customer + admin shell | https://hris.dntech.id |
| API | https://api.hris.dntech.id |
| Webhook Midtrans | `POST https://api.hris.dntech.id/api/v1/webhooks/midtrans` |
| Webhook Xendit | `POST https://api.hris.dntech.id/api/v1/webhooks/xendit` |

### Deploy singkat (VPS)
```bash
cd ~/dnpeople
git pull

cd backend
npx prisma migrate deploy
npm run build
pm2 restart dnpeople-api --update-env

cd ../frontend
npm run build
pm2 restart dnpeople-web
```

Env penting backend: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `API_PUBLIC_URL`, gateway keys (`XENDIT_*` / `MIDTRANS_*`).

Panduan lengkap: [DEPLOYMENT.md](./DEPLOYMENT.md) · [VPS.md](./VPS.md) · [SUPABASE.md](./SUPABASE.md)

---

## 11. Demo & onboarding developer

### Akun demo (setelah `npm run db:seed`)
Password: **`Demo123!`** · Tier demo: **FREE** (nav jujur — hanya fitur gratis)

| Role | Email |
|------|-------|
| Company Admin | dina.wijaya@demo.dnpeople.id |
| HR | maya.putri@demo.dnpeople.id |
| Manager | raka.pratama@demo.dnpeople.id |
| Finance | sinta.wijaya@demo.dnpeople.id |
| Employee | budi.santoso@demo.dnpeople.id |

Lengkap: [DEMO-ACCOUNTS.md](./DEMO-ACCOUNTS.md)

### Quick start lokal
```bash
# Backend
cd dnpeople/backend && cp .env.example .env
npm install && npm run db:migrate && npm run db:seed && npm run dev
# → http://localhost:4100

# Frontend
cd dnpeople/frontend && cp .env.example .env.local
npm install && npm run dev
# → http://localhost:3001
```

Verifikasi: `cd backend && npm test`

---

## 12. Roadmap & status (Agustus 2026)

### Sudah selesai di repo (jangan rebuild)
| Versi | Fokus |
|-------|-------|
| v12–v12.1 | Tier consolidation, FREE 30 / STARTER 50 |
| v13.0 | 9-box talent matrix & succession |
| v14.0 | Tutorial interaktif + knowledge base |
| v15.0 | Admin Console |
| Agustus 2026 | Xendit PG, legal ToS/PP, grouped nav, invoice PDF, tier pricing admin, gateway switch, trial admin, Midtrans production path |

### Conditional (ops / go-live)
- Xendit/Midtrans **live money** E2E penuh
- SMTP production, rotate leaked keys
- DNS `dnpeople.id`, beta cohort 10–20, pen-test sign-off

Checklist: [LAUNCH-GATE-CHECKLIST.md](./LAUNCH-GATE-CHECKLIST.md)

### Berikutnya (PRD)
**v16.0 — Internal Career Marketplace** (Module 4): lowongan internal, apply, pipeline HR.

Brief: [NEXT-PRD-BRIEF.md](./NEXT-PRD-BRIEF.md) · Prep: [PRD/dnpeople-prd-v16.0-prep-id.md](./PRD/dnpeople-prd-v16.0-prep-id.md)

---

## 13. Dokumen terkait (detail)

| Topik | File |
|-------|------|
| **Index semua docs** | [00_INDEX.md](./00_INDEX.md) |
| Baseline implementasi panjang | [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md) |
| Status per MVP/PRD | [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md) |
| Katalog fitur | [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) |
| API reference | [API.md](./API.md) |
| Arsitektur | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Admin operasional | [ADMIN-GUIDE.md](./ADMIN-GUIDE.md) |
| User guide | [USER-GUIDE.md](./USER-GUIDE.md) |
| Midtrans production | [PG/MIDTRANS-PRODUCTION-SETUP.md](./PG/MIDTRANS-PRODUCTION-SETUP.md) |
| Xendit setup | [xendit/XENDIT-PAYMENT-SETUP.md](./xendit/XENDIT-PAYMENT-SETUP.md) |
| Changelog | [CHANGELOG.md](./CHANGELOG.md) |
| README repo | [../README.md](../README.md) |

---

## 14. Satu kalimat penutup

> **dnPeople** adalah HRIS Indonesia siap produksi untuk UMKM–enterprise: core HR gratis, operasi & payroll berbayar, talent matrix & admin console vendor — dengan billing, trial, harga paket, dan payment gateway yang bisa dikontrol tim DN Tech tanpa deploy ulang kode.

---

*Dokumen ini digabung dari README, PROJECT-OVERVIEW, NEXT-PRD-BRIEF, CURRENT-IMPLEMENTATION, dan increment Agustus 2026 (tier pricing admin, payment gateway switch, trial management, Midtrans production). Perbarui file ini saat ada perubahan produk mayor.*

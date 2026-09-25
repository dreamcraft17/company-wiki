---
owner: Dozer
status: review-required
canonical: false
last_reviewed: 2026-09-15
review_cadence: annual
---

# dnPeople — Bisnis, Fitur, dan Layanan

> **Status:** Active · **Last updated:** 2026-09-13 · **Author:** Dozer  
> **Audience:** sales, partner, onboarding, PM  
> **Sumber:** katalog & baseline wiki `company-wiki/docs/products/dnPeople/` (mirror `dnpeople/docs/`)  
> **Bukan janji go-live:** status **Available** = ada di codebase; **Conditional** = butuh provider/UAT; **Roadmap** = jangan dijual sebagai existing

Dokumen ini menjelaskan **model bisnis**, **siapa yang dilayani**, **paket & layanan operasional**, dan **fitur per modul** secara rinci. Tabel baris-per-baris (surface API, role, status): [FEATURE-CATALOG.md](./FEATURE-CATALOG.md). Baseline teknik: [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md). Ringkas satu file lama: [DNPEOPLE-HRIS-OVERVIEW.md](./DNPEOPLE-HRIS-OVERVIEW.md).

---

## 1. Identitas bisnis

| | |
|---|---|
| **Produk** | dnPeople (brand **DnPeople**) — HRIS SaaS multi-tenant |
| **Perusahaan** | DN Tech (PT. Dozer Napitupulu Technology) |
| **Owner produk** | Dozer (CEO + Tech Lead) |
| **App produksi** | [hris.dntech.id](https://hris.dntech.id) |
| **API** | [api.hris.dntech.id](https://api.hris.dntech.id) |
| **Marketing in-app** | `/welcome`, `/pricing`, `/docs`, `/faq`, `/demo` |
| **Domain pemasaran** | [dnpeople.id](https://dnpeople.id) — DNS go-live **Conditional** |
| **Kontak** | info@dntech.id · sales: sales@dnpeople.id (kebijakan support) |
| **Release** | Tag **v1.1.0** · PRD v5–**v15.0** + v13 talent + v14 tutorial + v17 assistant di repo |
| **Bukan** | Repo `ERP/` (DN People ERP NestJS). dnPeople = Express + Next.js |

**Visi (dari project overview):** platform HRIS untuk perusahaan Indonesia mengelola SDM digital — recruitment sampai offboarding — dengan compliance lokal (UU PDP, PPh 21, BPJS) dan jalur upgrade paket yang transparan.

**Snapshot codebase (wiki 9 Sep 2026):** ~96 halaman frontend · ~60 modul route · **130** model Prisma · **161** unit tests (angka di README produk bisa berbeda snapshot; verifikasi `npm test` sebelum kutip ke pihak luar).

---

## 2. Masalah yang dijual (nilai bisnis)

| Pain point | Jawaban produk |
|------------|----------------|
| Data karyawan di Excel/WhatsApp | Master karyawan, org, dokumen, kebijakan, pengumuman |
| Absensi & cuti sulit diaudit | Clock-in (GPS/QR/WiFi/manual), shift, koreksi, leave, approval inbox |
| Payroll & pajak manual | Payroll Indonesia: BPJS, PPh 21, slip PDF, export bank/pajak (bukan transfer bank / e-filing DJP) |
| Rekrutmen terpisah dari HRIS | ATS + portal `/careers` + offer digital + onboarding |
| Talent & suksesi informal | Kompetensi, IDP, LMS, **9-box**, succession |
| User bingung | Help, 5 tutorial interaktif, knowledge base (tanpa video library) |
| Fitur terlihat padahal belum bayar | Tier gating server + nav hanya paket aktif |
| Bayar langganan ribet | `/billing`, invoice PDF, **DOKU** checkout (Midtrans/Xendit alternatif) |
| Vendor kelola banyak klien | Admin Console `/admin` (SUPER_ADMIN) |

---

## 3. Siapa pelanggan dan pengguna

**Segmen:** startup, UMKM, perusahaan menengah Indonesia.

| Persona | Role sistem | Kebutuhan |
|---------|-------------|-----------|
| HR / People Ops | `HR`, `COMPANY_ADMIN` | Master SDM, absensi, cuti, rekrutmen, talent |
| Manager | `MANAGER` | Approval tim, laporan departemen; **tanpa payroll** |
| Finance | `FINANCE` | Payroll, klaim, pinjaman, laporan keuangan HR |
| Karyawan | `EMPLOYEE` | Self-service: absensi, cuti, slip, training, helpdesk |
| Admin perusahaan | `COMPANY_ADMIN` | Billing, akun staff, SSO, kuota |
| Tim DN Tech | `SUPER_ADMIN` | Semua tenant, harga, gateway, flags, health |

Akses baris: `all` / `organization` / `department` / `location` / `self` / `custom`. **Menyembunyikan menu bukan otorisasi** — backend enforce permission.

---

## 4. Model pendapatan & paket

Lima tier. Headcount **hard limit** FREE **30**, STARTER **50**, PROFESSIONAL **300**; BUSINESS soft ~1.000; ENTERPRISE custom.

| Tier | Harga default (bisa diubah admin) | Inti nilai |
|------|-----------------------------------|------------|
| FREE | Rp 0 · trial 4 bulan (overview) | Core HR + helpdesk + MFA + billing upsell |
| STARTER | Rp 10.000/karyawan · min Rp 150.000 · trial **4 bulan** (promo, dapat dimatikan dnPeople) | + absensi basic, cuti, shift, payroll basic, laporan basic |
| PROFESSIONAL | Rp 15.000/karyawan · min Rp 20.000 · trial **2 bulan** | + absensi/payroll advanced, review/evidence payroll, lokasi kerja & aturan per lokasi, OT/klaim/pinjaman, ATS, performance, talent 9-box |
| BUSINESS | Rp 20.000/karyawan (volume) · min Rp 6.000.000 · trial 2 bulan | + workflow approval cuti/klaim per lokasi, API, aset, offboarding, audit, custom reports |
| ENTERPRISE | Harga khusus | + SSO/SCIM, branding, multi-company, dedicated support |

**SSOT harga runtime:** tabel `subscription_tier_plans` · `/admin/tier-pricing` · `GET /api/v1/subscription/plans` · fallback `subscriptionFeatures.ts` / `subscriptionCatalog.ts`.

**Kuota (katalog):** FREE storage **5 GB** hard-block; API key harian Jakarta FREE 1.000 / STARTER 10.000 / PROF 50.000; warning kapasitas 80%+ email 7 hari.

**Trial:** Starter **4 bulan** (promo — `STARTER_TRIAL_PROMO=false` atau `TIER_STARTER_TRIAL_MONTHS=0` mematikannya); Professional **2 bulan**; FREE 4 bulan overview; BUSINESS 2 bulan. Fitur tier penuh selama trial; bayar kapan saja dari `/billing`; reminder H-5/H-1. Admin vendor dapat **akhiri trial kapan saja** (`end_now`), freeze, atau ubah tanggal.

**Alur bayar:** signup FREE (ToS + Privacy) → upgrade `/billing` → invoice pro-rata → **DOKU** → webhook → PAID. Recurring scheduler + email. Grace/freeze read-only jika overdue.

---

## 5. Layanan di sekitar produk (bukan hanya fitur UI)

| Layanan | Isi | Catatan |
|---------|-----|---------|
| **Aplikasi HRIS** | Multi-tenant web mobile-first | Light theme default + dark/system |
| **API REST + OpenAPI** | `/api/v1`, Swagger `/api/v1/docs` | Kunci `dnp_…` scoped |
| **SCIM 2.0** | Users/Groups per tenant | Enterprise; UAT IdP |
| **SSO** | Google, Microsoft, SAML + JIT | Conditional kredensial IdP |
| **Pembayaran langganan** | **DOKU Checkout live**; DOKU SNAP/Midtrans/Xendit sebagai jalur alternatif | Production live; rekonsiliasi dan monitoring tetap wajib |
| **Legal** | ToS + Privacy v1.1 (UU PDP / ITE), DPA template, consent signup | Bukan CMS legal penuh |
| **Privasi** | Export data, deletion request, daftar processor | PRD v10 |
| **Support** | Email + helpdesk in-app; SLA draft | Soft launch 99.5% uptime target; Critical &lt;1 jam respons |
| **Onboarding pelanggan** | Playbook, demo sandbox `@demo.dnpeople.id` FREE | [CUSTOMER-ONBOARDING-PLAYBOOK.md](./CUSTOMER-ONBOARDING-PLAYBOOK.md) |
| **Marketing / lead** | `/welcome`, beta signup, `POST /api/v1/public/leads` | Convertkit/GA4/Zapier Conditional |
| **Vendor ops** | `/admin` customers, impersonation, MRR, flags, health | PRD v15.0 |
| **Keamanan** | MFA, lockout, AES-256-GCM field gaji/NPWP/rekening, audit append-only | SILO DB fisik = langkah ops |
| **Observability** | `/alive` `/health` `/ready` `/metrics` | Datadog/Sentry Conditional |

**Support (draft operasional):** Critical (outage, data loss, PII) · High (login, payroll finalize, absensi) · Medium/Low. Jam 09:00–18:00 WIB. Escalation L1 → L2 → Dozer.

**Di luar layanan:** native Android/iOS; transfer bank langsung; e-filing DJP/BPJS; ledger akuntansi named; e-sign tersertifikasi; prediksi HR otomatis; video tutorial.

---

## 6. Fitur per modul (rinci)

Status mengikuti [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) per 9 Sep 2026.

### 6.1 Identitas & akses

Login email/password **tanpa Company ID**; tenant discovery (domain terverifikasi → hostname → riwayat user → picker). Session cookie `dnpeople_session`. Forgot/reset token 1 jam. MFA TOTP. OAuth Google/Microsoft **Conditional**. SAML + JIT **Conditional**. SCIM available (UAT IdP). API key `dnp_…` (deny default). 6 role + staff accounts. Isolasi POOL/SILO/BRIDGE; SILO fisik ops.

### 6.2 Perusahaan, organisasi, karyawan

Profil perusahaan, jam kerja, departemen, jabatan, grade, lokasi (geofence, SSID). Org tree + legal org units. Employee CRUD, import Excel/CSV, filter, soft delete. Family, pendidikan, emergency, bank/pajak, kontrak/probation, status history. Enkripsi field sensitif.

### 6.3 Absensi, shift, cuti, izin, lembur

Clock-in/out: manual, GPS, QR, selfie, WiFi; geofence; work mode office/WFH; late/early; offline queue (PRD v8). Import Excel absensi (dry-run, idempotency). Koreksi + bukti + bulk. Shift CRUD, assignment, rotasi, swap (STARTER+). Leave types, saldo, overlap, sick auto-approve, carry-forward, handover. Permission (terlambat, pulang awal, WFH, dinas). Overtime + masuk payroll. Approval inbox terpadu.

Selfie/liveness **Conditional** (provider). Panel QR admin UI dihapus Jul 18; API QR tetap ada.

### 6.4 Payroll, pajak, benefit, keuangan karyawan

Konfigurasi divisor, metode pajak, BPJS, OT, klaim/pinjaman. Komponen gaji + template. PPh 21 (PTKP, bracket, gross/net/gross-up). BPJS Kes/JHT/JP. Batch monthly, preview, **atomic finalize**, proration, THR, bonus/komisi/KPI bonus. Portal slip + PDF password + link TTL 24 jam + verifikasi. Klaim + limit + receipt. Pinjaman (satu aktif, simulasi, potong gaji). Export bank/pajak **bukan** eksekusi transfer.

### 6.5 Rekrutmen & onboarding

Job posting, portal `/careers`, apply + CV, ATS pipeline, interview, komunikasi bulk **Conditional SMTP**. AI screening **Conditional LLM**. Offer digital + accept/reject + auto-hire. Onboarding plan, checklist, buddy.

### 6.6 Performance, kompetensi, IDP, LMS, talent matrix

Cycle review, KPI/OKR. Training program. Competency framework, assessment (self/manager/peer/360), gap, IDP auto dari gap. LMS dasar (program, enroll, progress, sertifikat). **PRD v13:** 9-box, lock, succession, proposal → IDP/LMS, laporan Excel/PDF/HTML (`talent:matrix` PROFESSIONAL+).

### 6.7 Operasi tempat kerja

Aset CRUD, assignment/return. Resign + offboarding checklist. Dokumen company/employee. Reminder kontrak **Conditional SMTP**. Kebijakan + disiplin (SP). Helpdesk (FREE+).

### 6.8 Komunikasi

Pengumuman, survei, poll, kalender HR. Notification center. Browser push & email **Conditional**.

### 6.9 Dashboard & laporan

KPI role-aware, donut/bar SVG. Laporan absensi/cuti/payroll (cap 1000 baris), job async bank/tax, turnover heuristic (wajib review manusia). Custom reports (Enterprise).

### 6.10 Workflow, AI, integrasi

Approval rules + custom workflow. **Assistant** (`/assistant`): tools Prisma self-scope + RAG FAQ/policy + sitasi; flag `ai:assistant` Professional+; LLM opsional. Generator dokumen AI **Conditional**. Registry webhook. Upload local/S3 via auth file route. Email outbox retry.

### 6.11 Platform & pemasaran

White-label, custom domain (DNS/TLS ops). Quota & isolation audit. Audit trail immutable. Admin Console: customers, impersonate, revenue, analytics, support, content tutorial/KB, flags, health, audit. Landing v11.1, `/docs` hub, tema, grouped sidebar 8 seksi, logo `/logo3.png`.

---

## 7. Apa yang tidak dijual sebagai existing (roadmap)

| Item | Catatan katalog |
|------|-----------------|
| Internal career marketplace | PRD v4 Module 4 → **v16.0** next |
| Rotasi lintas fungsi | Beda dari rotasi shift yang sudah ada |
| Earned wage access | Module 5 + partner bank |
| Salary benchmarking eksternal | Module 6 + data pasar |
| Paket vertikal manufaktur / ritel | Module 7–8 |
| Native mobile app | Mobile-first **web** saja |
| Video tutorial | Keluar dari v14 |
| Transfer bank / e-filing DJP-BPJS / ledger akuntansi / e-sign tersertifikasi | Belum |

---

## 8. Cara baca status ke pelanggan

1. **Available** — boleh didemo di `hris.dntech.id` setelah UAT tenant; tetap butuh deploy & data.
2. **Conditional** — sebutkan syarat (SMTP, IdP, biometric, Sentry, DNS `dnpeople.id`, atau channel pembayaran alternatif).
3. **Roadmap** — jangan masuk SOW tanpa PRD baru.

Go-live eksternal (Datadog, pen-test, beta cohort, payment live E2E) tetap **Conditional** di [LAUNCH-GATE-CHECKLIST.md](./LAUNCH-GATE-CHECKLIST.md).

---

## 9. Referensi

| Dokumen | Isi |
|---------|-----|
| [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) | Inventori fitur + status |
| [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md) | Matrix MVP/PRD |
| [USER-GUIDE.md](./USER-GUIDE.md) | Panduan pengguna |
| [ADMIN-GUIDE.md](./ADMIN-GUIDE.md) | Vendor / implementer |
| [SLA-SUPPORT-POLICY.md](./SLA-SUPPORT-POLICY.md) | Channel & SLA |
| [INTEGRATIONS.md](./INTEGRATIONS.md) | API key, webhook, SCIM |
| [COMPLIANCE.md](./COMPLIANCE.md) | BPJS / PPh / UU PDP |
| [NEXT-PRD-BRIEF.md](./NEXT-PRD-BRIEF.md) | Scope v16.0 |

---

*Author: Dozer · 2026-09-13 · DN Tech — dnPeople HRIS*

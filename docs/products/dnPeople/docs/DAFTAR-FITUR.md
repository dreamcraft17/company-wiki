# dnPeople — Daftar Fitur

> **Author:** Dozer  
> **Date:** 2026-10-02

Satu halaman **list fitur** buat cepat lihat “dnPeople bisa apa aja”. Detail status (Available / Conditional / Roadmap), role, dan surface: [FEATURE-CATALOG.md](./FEATURE-CATALOG.md). Paket & bisnis: [DNPEOPLE-BISNIS-FITUR-LAYANAN.md](./DNPEOPLE-BISNIS-FITUR-LAYANAN.md).

**Produksi:** [hris.dntech.id](https://hris.dntech.id) · **Tier:** FREE (≤30 HC) → STARTER (≤50) → PROFESSIONAL (≤300) → BUSINESS → ENTERPRISE

---

## Login, keamanan & akses

- Login email/password (tanpa Company ID) + lupa/reset password
- Tenant discovery (domain, hostname, riwayat user, company picker)
- MFA TOTP
- OAuth Google / Microsoft *(butuh kredensial IdP)*
- SAML SSO + JIT provisioning *(UAT IdP)*
- SCIM 2.0 Users/Groups per tenant
- API key `dnp_…` dengan scope ketat
- 6 role: Super Admin, Company Admin, HR, Manager, Finance, Employee
- Staff accounts terpusat + RBAC + row-level scope (org/dept/lokasi/self)
- Isolasi multi-tenant (POOL/SILO/BRIDGE)

---

## Data perusahaan & karyawan

- Profil perusahaan, jam kerja, kalender kerja
- Departemen, jabatan, grade, lokasi kerja (geofence, SSID WiFi)
- Struktur organisasi + legal org units
- Master karyawan: CRUD, import Excel/CSV, filter, soft delete
- Data personal: keluarga, pendidikan, kontak darurat, bank & pajak (NPWP, PTKP)
- Kontrak & probation + riwayat status
- Enkripsi field sensitif (gaji, NPWP, rekening)

---

## Absensi, shift, cuti, izin, lembur

- Clock-in/out: manual, GPS, QR, WiFi, selfie *(biometrik = conditional)*
- Geofence, mode office/WFH, terlambat/pulang cepat
- Absensi offline (queue + sync)
- Import absensi Excel (dry-run, idempotency)
- Koreksi absensi + bukti + bulk approval
- Shift: master, assignment, rotasi, tukar shift *(STARTER+)*
- Cuti: tipe, saldo, overlap, carry-forward, pengganti/handover
- Izin (terlambat, pulang awal, WFH, dinas, dll.)
- Lembur + approval → masuk payroll
- Inbox approval terpadu

---

## Payroll Indonesia

- Setting payroll: divisor hari kerja, BPJS, PPh 21, OT, klaim/pinjaman
- Komponen gaji, template, komponen per karyawan
- PPh 21 (PTKP, bracket, gross/net/gross-up)
- BPJS Kesehatan, JHT, JP
- Run bulanan: kalkulasi batch, **preview**, finalize atomik
- Proration join/exit, THR, bonus/komisi, KPI bonus
- Portal slip gaji + PDF + link signed 24 jam + verifikasi
- Bukti potong PPh 21
- Klaim reimbursement + kebijakan limit
- Pinjaman karyawan (simulasi, satu aktif, potong gaji)
- Export bank & pajak *(bukan transfer bank / e-filing DJP)*

---

## Rekrutmen & onboarding

- Job posting + portal karir publik `/careers`
- Lamaran online + upload CV
- Pipeline ATS + interview
- Offer digital + terima/tolak + auto-hire
- Onboarding: rencana, checklist, buddy, task per owner
- AI screening kandidat *(LLM optional)*

---

## Performance, talent & belajar

- Siklus performance review, KPI/OKR
- Program training & career path
- Framework kompetensi, assessment (360), gap analysis
- IDP manual + auto dari gap kompetensi
- LMS dasar: program, modul, enroll, progress, sertifikat
- **9-box talent matrix** + lock kalibrasi *(PROFESSIONAL+)*
- Succession planning + readiness
- Proposal development → IDP/LMS
- Laporan talent Excel/PDF/HTML
- Tutorial in-app (5 walkthrough) + knowledge base *(tanpa video library)*

---

## Operasi HR sehari-hari

- Inventori aset + serah terima / return
- Resign + offboarding checklist
- Dokumen perusahaan & karyawan
- Kebijakan + disiplin (SP, dll.)
- Helpdesk / tiket *(FREE+)*
- Pengumuman, survei, poll
- Kalender HR
- Notifikasi in-app *(email/browser = butuh SMTP/izin browser)*

---

## Dashboard & laporan

- Dashboard role-aware (workforce, operasional, payroll)
- Grafik donut/bar native (tanpa lib chart pihak ketiga)
- Laporan absensi, cuti, payroll (Excel/PDF, cap baris)
- Job export async bank/pajak
- Analitik turnover *(heuristic — review manusia)*
- Custom reports *(Enterprise)*

---

## Workflow, AI & integrasi

- Aturan approval per modul
- Custom workflow multi-step *(Enterprise)*
- **Asisten HR** (`/assistant`): fakta self-scope + RAG kebijakan/FAQ + sitasi *(PROFESSIONAL+, flag `ai:assistant`)*
- Generator dokumen AI (offer, SP, SK, resign) *(LLM)*
- Registry webhook / integrasi
- Upload file aman (local/S3, magic-byte, unduh via auth)

---

## Langganan & billing

- 5 tier + trial (Starter 4 bln promo, Prof 2 bln, dll.)
- Hard limit headcount & kuota storage/API
- Feature gating server + nav jujur per tier
- Invoice, bayar **DOKU** live, PDF invoice, riwayat channel
- Cancel/reactivate, grace/freeze overdue
- Upgrade `/billing` + halaman `/upgrade`

---

## Legal, privasi & compliance

- ToS & Privacy versi (UU PDP/ITE, klausul AI) + consent signup
- Export data pribadi & permintaan hapus (UU PDP)
- DPA template (marketing)

---

## Situs publik & GTM (engineering)

- Landing `/welcome`, pricing, FAQ, demo, blog, contact
- Hub dokumentasi `/docs`
- Beta signup & lead API
- Checklist bukti payroll `/resources/payroll-evidence-checklist`
- Template industri *(mis. retail/F&B multi-outlet — beta)*
- Early release / design partner flow
- Admin: north-star analytics, marketing leads, web traffic, assistant quality

---

## Platform & vendor (DN Tech)

- Admin Console `/admin`: customers, impersonate, MRR/refund, flags, health, audit
- Tier pricing SSOT, content tutorial/KB, support tickets
- White-label & custom domain *(DNS/TLS ops)*
- Quota tenant, audit isolasi, audit trail immutable
- Multi-company console *(Super Admin)*
- OpenAPI + Swagger UI
- Health `/alive` `/ready` `/metrics` Prometheus
- Tema light/dark, sidebar grouped, mobile-first web

---

## Belum dijanjikan sebagai “sudah ada” (roadmap)

- Career marketplace internal (PRD v16 — **freeze** sampai pilot GTM)
- Native app Android/iOS
- Earned wage access, salary benchmarking eksternal
- Paket vertikal manufaktur penuh
- Transfer bank langsung, e-filing DJP/BPJS, ledger akuntansi named
- E-sign tersertifikasi pihak ketiga
- Video tutorial library
- Keputusan HR prediktif otomatis

---

*Ringkas dari FEATURE-CATALOG · snapshot Oct 2026 · DN Tech / dnPeople*

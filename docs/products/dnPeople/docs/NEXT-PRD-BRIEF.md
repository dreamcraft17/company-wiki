# dnPeople — Briefing Dasar PRD Berikutnya

| | |
|---|---|
| **Dokumen** | Satu file utuh untuk menulis PRD produk berikutnya |
| **Tanggal** | 24 Juli 2026 |
| **Baseline kode** | Setelah PRD **v12.1** + soft-launch release-ready |
| **HEAD referensi** | `61d956f` (docs sync) · fitur v12.1 di `4e91727` / follow-ups |
| **Owner** | Dozer (CEO + Tech Lead) |
| **Company** | DN Tech · Brand: DnPeople |
| **Ganti dokumen ini?** | Update saat PRD berikutnya di-sign-off atau HEAD baseline berubah |

> **Cara pakai:** Baca file ini dari atas ke bawah. Jangan janjikan ulang yang ada di §3 sebagai “fitur baru”. Tulis PRD hanya untuk §5–§6 (atau pecahan Module). Setiap story wajib memenuhi §8.

---

## 1. Keputusan singkat: PRD berikutnya tentang apa?

Ada **dua jalur** yang valid. Pilih salah satu sebagai judul PRD, atau pecah jadi dua dokumen berurutan.

| Jalur | Isi | Kapan |
|-------|-----|--------|
| **A — Ops go-live** | Bukan fitur produk baru: DNS, Datadog/PagerDuty, pen-test, restore drill bertanda tangan, beta 10–20, payment keys live | Jika soft launch Agustus masih open |
| **B — Produk greenfield (disarankan setelah / paralel ops)** | **PRD v4 Module 3–8** — talent lanjutan di atas fondasi Module 1–2 yang sudah Done | Setelah (atau sementara) ops Conditional |

**Rekomendasi produk P0:** **Module 3 — 9-box talent matrix + succession planning**  
(Models competency/IDP/LMS sudah ada; UI/workflow 9-box & succession **belum**.)

Nomor versi PRD produk berikutnya yang wajar: **v13.0** (lanjutan setelah v12.1), dengan subtitle Module 3 (atau “Talent Advancement”).

---

## 2. Snapshot produk saat ini (jangan di-rebuild)

| Item | Nilai |
|------|--------|
| Produk | HRIS multi-tenant Indonesia |
| Frontend | Next.js · ~**61** halaman · mobile-first |
| Backend | Express `/api/v1` · ~**53** route modules · SCIM `/scim/v2` |
| Data | PostgreSQL + Prisma · **102** models · migrasi wajib deploy |
| Tests | Backend **36/36** |
| Tier | FREE/STARTER hard **50** emp · Prof **300** · Business soft@1000 · Enterprise custom |
| Pricing SSOT | `frontend/src/lib/subscriptionCatalog.ts` ↔ backend `subscriptionFeatures.ts` |

**Roles:** `SUPER_ADMIN` · `COMPANY_ADMIN` · `HR` · `MANAGER` · `FINANCE` · `EMPLOYEE`  
HR **tanpa** payroll/salary · Finance **payroll** · isolasi tenant + row scope wajib.

---

## 3. Yang sudah Done di repo (backward compatible)

Anggap **tersedia** kecuali PRD baru **eksplisit** mengubahnya.

### Platform & auth
- JWT + httpOnly cookie `dnpeople_session`, MFA TOTP, API-key scopes, tenant discovery (domain/hostname/history/picker)
- SSO Google/Microsoft/SAML (IdP interoperability = Conditional per customer)
- Staff account admin, RBAC, audit append-only + redaction

### Core HR & ops
- Employee lifecycle, org, dokumen, kalender, pengumuman, helpdesk (**FREE+** v12.1)
- Attendance + koreksi + Excel import + geofence/QR/selfie adapter (fail-closed prod)
- Leave + carry-forward, shift (**STARTER+**), OT, klaim, pinjaman
- Payroll BPJS/PPh/gross-net-gross-up, batch run, finalize atomic, payslip PDF + signed URL 24h
- Recruitment ATS + careers, onboarding, performance, training, assets, offboarding
- Reports + async export cap 1000, approval inbox, surveys

### Talent foundation (PRD v4 Module 1–2) — Done
- Competency library + versioning + bulk import
- Role-competency mapping
- Assessment (self/manager/peer/360) + gap analysis
- IDP + auto-goals dari gap
- LMS modules/enroll/progress/certificate/transcript

### Enterprise & billing
- Multi-company, branding, workflows, custom reports, webhooks, tenant quota/usage
- Subscription tiers v12.1: trial, headcount hard limit, storage hard-block, Jakarta API quota (API keys), capacity email 7d, `/upgrade`
- Marketing `/welcome` v11.1, leads/beta API

### Hardening (v8–v10 + release-ready)
- Secrets fail-closed prod, demo creds **public by default** (opt-out `NEXT_PUBLIC_SHOW_DEMO_CREDS=false`)
- Metrics `/alive` `/health` `/ready` `/metrics`, smoke, k6 scripts, privacy export, legal templates

---

## 4. Conditional (bukan “belum dikode”, tapi belum accepted ops/UAT)

Jangan tulis sebagai “build from scratch”. Tulis sebagai **acceptance / ops gate** jika masuk PRD.

- DNS `dnpeople.id` + TLS API
- Datadog agent + PagerDuty on-call live
- Pen-test eksternal + remediasi
- Restore drill bertanda tangan + RPO/RTO terukur
- Beta 10–20 + GA4/demo video/Zapier bila dipakai
- Stripe/Xendit **auto-charge** verified (kode siap; live Conditional)
- Biometric vendor contract, SAML per-customer UAT, SMTP deliverability, S3 lifecycle
- Bank file acceptance per bank; DJP/BPJS **direct API** (belum ada — ini roadmap, bukan Conditional wiring)

Checklist: `docs/LAUNCH-GATE-CHECKLIST.md` · `docs/RELEASE-READY.md`

---

## 5. Roadmap produk — kandidat scope PRD berikutnya

| Priority | Module | Scope | Ketergantungan / catatan |
|----------|--------|-------|---------------------------|
| **P0** | **v4 Mod 3** | **9-box matrix** + **succession / readiness scoring** | Bertumpu competency + performance + IDP yang sudah ada; UI + workflow + RBAC baru |
| **P1** | v4 Mod 4 | Internal **career marketplace**, rotation / mobility (bukan rotasi shift) | Butuh posting internal, apply, approval HR |
| **P1** | v4 Mod 5–6 | **EWA** (earned wage access) + **salary benchmarking** | Partner bank / market data = Conditional eksternal |
| **P2** | v4 Mod 7–8 | Vertical **manufacturing** & **retail** packages | Config package: shift incentive kompleks, tips, high-volume hiring |

### Di luar Module 3–8 (jangan campur ke PRD Module 3 kecuali sengaja)
- Native iOS/Android (sekarang mobile-first web saja)
- Direct bank transfer execution / full accounting ledger posting
- Certified third-party e-sign provider
- Predictive HR “auto-fire” (turnover risk tetap human-reviewed)
- Physical SILO DB provisioning (policy SILO ≠ isolasi fisik)

---

## 6. Outline disarankan untuk PRD v13.0 (Module 3) — draft skeleton

Gunakan struktur ini saat menulis PRD penuh (+ SRS/SDD terpisah setelahnya).

### 6.1 Problem & outcome
- HR sulit visualisasi talent grid (performance × potential) dan pipeline successor untuk critical roles.
- Outcome: 9-box terisi dari data existing; succession plan per posisi kritis; readiness score; audit trail.

### 6.2 Personas
- HR / COMPANY_ADMIN: konfigurasi axis, jalankan kalibrasi, kelola succession
- MANAGER: usulan box untuk direct report (jika diizinkan)
- EMPLOYEE: **default tidak** melihat box peer (privacy); opsional lihat development hint sendiri
- FINANCE: **tidak** akses 9-box/succession kecuali override eksplisit

### 6.3 In scope (Module 3)
1. Definisi axis 9-box (performance source: cycle/KPI; potential source: competency gap / manager rating — tentukan SSOT di PRD)
2. Kalibrasi session (draft → locked) per periode
3. Placement employee ke box + justification + history
4. Critical role flag + succession slate (1–N candidates) + readiness (Ready now / 1–2 yr / …)
5. Gap → usulan IDP/LMS (reuse Module 1–2; jangan rebuild LMS)
6. Report export (Excel/PDF) + tier gating (usulkan: minimum **PROFESSIONAL** atau **BUSINESS** — putuskan di PRD)
7. RBAC + tenant isolation + audit before/after

### 6.4 Out of scope (Module 3)
- Career marketplace (Mod 4), EWA/benchmark (5–6), vertical packs (7–8)
- Mengubah payroll engine / PPh / BPJS
- Native mobile app

### 6.5 Data yang sudah bisa di-reuse (jangan invent ulang)
- `Competency*`, assessments, gap analysis, IDP goals
- Performance cycles / KPI
- Employee + Position + Organization
- Subscription feature flags (`FEATURE_MINIMUM_TIER`)

### 6.6 Acceptance themes (isi detail di SRS)
- Kalibrasi lock mencegah edit diam-diam tanpa audit
- Successor tidak leak salary ke role yang tidak berhak
- Soft-delete / inactive employee keluar dari slate aktif
- Import/export tidak formula-injection
- Mobile: list/detail usable; kalibrasi matrix boleh horizontal scroll

---

## 7. Invariants yang PRD baru wajib jaga

Kutip di bagian NFR/Security PRD:

1. Tidak ada salary/NPWP/rekening/password/token di log/telemetry plaintext  
2. Temp password staff hanya sekali di response create/reset — tidak ke audit  
3. HR ≠ payroll/salary; Finance ≠ mutate employee master tanpa permission baru  
4. Audit append-only DB; payload sensitif di-redact  
5. Tenant isolation + row scope; hide nav ≠ authorization  
6. Spreadsheet anti formula injection  
7. Tier/feature gate server-side (`featureAccess` / `subscriptionService`)  
8. Migrasi Prisma wajib; tidak ada “ubah schema diam-diam di prod”

---

## 8. Template wajib per user story / FR

Setiap FR di PRD/SRS harus menjawab:

| # | Pertanyaan |
|---|------------|
| 1 | Role + row scope + apakah salary/PII terlihat? |
| 2 | Tenant isolation + audit before/after? |
| 3 | Model data, effective dating, migrasi/backfill, rollback? |
| 4 | Kontrak API + state UI + perilaku mobile + export? |
| 5 | Dampak payroll/tax/BPJS? (Module 3: biasanya **tidak** — nyatakan eksplisit) |
| 6 | Notifikasi, idempotency, retry? |
| 7 | Ancaman keamanan, retention/consent, enkripsi? |
| 8 | Bukti test: unit / integration / browser UAT / performance? |
| 9 | Dependensi provider/ops + owner? |

---

## 9. Tier & feature flag (ingat saat menambah fitur)

| Tier | Headcount | Catatan relevan Module 3+ |
|------|-----------|---------------------------|
| FREE | 50 hard | Core HR + helpdesk; **tanpa** payroll/attendance/leave |
| STARTER | 50 hard | + attendance, leave, shift, payroll dasar |
| PROFESSIONAL | 300 hard | + recruitment, performance, training, competency/IDP/LMS |
| BUSINESS | unlimited (soft 1000) | + API, workflow, assets, offboarding |
| ENTERPRISE | custom | + SSO, branding, AI, multi-company |

**Usulan default:** 9-box/succession = **PROFESSIONAL+** (satu paket dengan talent). Ubah hanya jika pricing strategy beda — tulis di PRD.

---

## 10. Definition of Done untuk PRD dokumen (sebelum coding)

- [ ] Problem, personas, in/out scope jelas  
- [ ] Tidak menduplikasi §3 sebagai deliverable baru  
- [ ] Tier minimum + permission matrix  
- [ ] Data model draft + migrasi  
- [ ] Daftar FR dengan AC yang bisa diuji  
- [ ] NFR + invariants §7  
- [ ] Ops dependencies (jika ada) terpisah dari fitur  
- [ ] SRS + SDD menyusul (atau satu paket v13.0 seperti v12.1)  
- [ ] Link balik ke file ini + `CURRENT-IMPLEMENTATION.md` di header PRD

---

## 11. Referensi cepat (opsional baca dalam)

| Butuh | File |
|-------|------|
| Baseline panjang | `docs/CURRENT-IMPLEMENTATION.md` |
| Katalog Available/Conditional/Roadmap | `docs/FEATURE-CATALOG.md` |
| Matrix MVP/PRD | `docs/IMPLEMENTATION-STATUS.md` |
| Soft launch ops | `docs/RELEASE-READY.md` · `LAUNCH-GATE-CHECKLIST.md` |
| Tier locked | `docs/PRD/dnpeople-prd-v12.1-free-tier-50-emp-final.md` |
| Talent foundation (sudah dibangun) | competency / IDP / LMS di codebase + status MVP 5 |
| Wiki mirror | `company-wiki/docs/products/dnPeople/docs/` |

---

## 12. Kalimat penutup untuk penulis PRD

> dnPeople **sudah lengkap** untuk soft-launch HRIS (MVP 1–5 + v5–v12.1). PRD berikutnya **bukan** “selesaikan HRIS”, melainkan **maju ke talent advancement (Module 3+)** dan/atau **tutup gerbang ops go-live**. Satu PRD = satu fokus. Module 3 dulu; Module 4–8 menyusul sebagai PRD terpisah kecuali ada alasan bundling yang eksplisit.

---

*Generated 24 Jul 2026 sebagai briefing utuh untuk PRD berikutnya. Update seiring sign-off PRD v13+.*

# dnPeople — Briefing Dasar PRD Berikutnya

| | |
|---|---|
| **Dokumen** | Satu file utuh untuk menulis PRD produk berikutnya |
| **Tanggal** | 10 Agustus 2026 |
| **Baseline kode** | `main` @ `e462db7` — grouped nav, billing UI polish, logo3, invoice PDF, payment labels |
| **Production URL** | App `https://hris.dntech.id` · API `https://api.hris.dntech.id` |
| **Owner** | Dozer (CEO + Tech Lead + PM) |
| **Company** | DN Tech · Brand: DnPeople |
| **Prep lengkap** | [PRD/dnpeople-prd-v16.0-prep-id.md](./PRD/dnpeople-prd-v16.0-prep-id.md) |
| **Ganti dokumen ini?** | Update saat PRD berikutnya di-sign-off atau HEAD baseline berubah |

> **Cara pakai:** Baca file ini dari atas ke bawah. Detail user stories & open questions → **prep doc** §5–§14. Jangan janjikan ulang yang ada di §3 sebagai “fitur baru”.

---

## 1. Keputusan singkat: PRD berikutnya tentang apa?

| Jalur | Isi | Kapan |
|-------|-----|--------|
| **A — Ops go-live** | Xendit sandbox→live E2E, webhook prod, SMTP, rotate leaked keys, beta 10–20, Datadog/pen-test/DNS | **P0 bisnis** — ~68% launch ready |
| **B — Produk greenfield** | **PRD v16.0 Module 4** — internal career marketplace | **P0 produk** setelah payment gate clear |

**Rekomendasi produk P0:** **Module 4 — Internal career marketplace**  
(Module 3 9-box **Done** v13.0; tutorial/KB **Done** v14.0; Admin Console **Done** v15.0; payment collection **Done in repo** Aug 2026.)

Nomor versi PRD produk berikutnya: **v16.0** — subtitle *Career Mobility*.

---

## 2. Snapshot produk saat ini (Agustus 2026)

| Item | Nilai |
|------|--------|
| Produk | HRIS multi-tenant Indonesia |
| Frontend | Next.js · **~96** halaman · mobile-first · light theme default + dark/system toggle |
| Backend | Express `/api/v1` · **~60** route modules · SCIM `/scim/v2` |
| Data | PostgreSQL (Supabase) + Prisma · **129** models · **17** migrations deployed |
| Tests | Backend **81/81** pass · Prisma validate ✅ |
| Tier | FREE hard **30** · STARTER hard **50** · Prof **300** · Business soft@1000 · Enterprise custom |
| Trial | Countdown badge; fitur penuh selama trial; **bayar kapan saja** |
| Payment | **Xendit Invoice v2** — test mode on VPS; live E2E ⬜ |
| Legal (MVP) | ToS + Privacy Policy: signup consent, `/legal/*`, `ComplianceBanner` |
| Talent | competency / IDP / **matrix** / succession / LMS @ PROFESSIONAL+ |
| Billing UX | Stat cards, filter invoice, metode bayar Xendit, **Unduh PDF** |
| Nav | **Grouped sidebar** (8 section); flat untuk employee short list |
| Brand | Logo **`/logo3.png`** (AppShell, marketing, login, JSON-LD) |
| Admin | `/admin` SUPER_ADMIN |
| Public docs | `/docs` hub |

**Roles:** `SUPER_ADMIN` · `COMPANY_ADMIN` · `HR` · `MANAGER` · `FINANCE` · `EMPLOYEE`

---

## 3. Yang sudah Done (jangan di-rebuild)

### Core (MVP 1–5 + PRD v5–v14.0)
Semua seperti baseline — lihat [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md).

### PRD v15.0 — Admin Console ✅
`/admin`, impersonation, MRR/refunds, analytics, tickets, content CRUD, feature flags, health, audit.

### Agustus 2026 — Post-v15 increments ✅

| Deliverable | Catatan |
|-------------|---------|
| Xendit PG v1.0 | Hosted checkout, webhook fail-closed, pay-during-trial |
| Legal ToS/PP MVP | Bukan full legal CMS |
| Invoice payment method | Xendit provider/method di `/billing` |
| Export invoice PDF | Logo dnPeople, footer same-page fix |
| Auth/SSO hardening | Company search picker, directory leak fix, SAML fail-closed |
| Grouped sidebar nav | `navigationMenu.ts` + `AppShell` section headers |
| Billing UI polish | Stat cards, tier bullets, invoice filters, trial preview hide |
| Brand logo | `/logo3.png` site-wide (replaces `logo1.png`) |

**Out of honest 100% (ops):** Xendit live money, SMTP prod, secret key rotation, beta cohort, pen-test.

**Jangan rebuild:** 9-box, tutorials, admin console, Xendit checkout, grouped nav.

---

## 4. Conditional (ops / UAT eksternal)

| Gate | Status Agustus 2026 |
|------|---------------------|
| Xendit test keys on VPS | ✅ |
| Xendit webhook E2E (1× bayar → PAID) | ⬜ |
| Xendit production keys + KYC | ⬜ |
| Rotate key (`docs/xendit/secret_api_key.csv` in git) | 🔴 **urgent** |
| SMTP production (forgot-password) | ⬜ |
| `NEXT_PUBLIC_SHOW_DEMO_CREDS=false` prod | 🟡 recommended |
| Datadog/PagerDuty live | ⬜ |
| Pen-test sign-off | ⬜ |
| DNS `dnpeople.id` | ⬜ |
| Beta 10–20 customers | ⬜ |

Detail: [LAUNCH-GATE-CHECKLIST.md](./LAUNCH-GATE-CHECKLIST.md) · penilaian ~68% di [prep doc §4](./PRD/dnpeople-prd-v16.0-prep-id.md).

---

## 5. Greenfield berikutnya — PRD v16.0

| Prioritas | Module | Fokus |
|-----------|--------|--------|
| **P0** | **v4 Mod 4** | Internal career marketplace — post, apply, HR pipeline |
| **P1** | Mod 4.2 + v16.1 | Rotation programs, succession link |
| **P2** | Mod 5–8 | EWA, salary bench, verticals |

**Draft lengkap:** user stories CM-1…CM-52, data model, API sketch, open questions → [prep doc §5–§14](./PRD/dnpeople-prd-v16.0-prep-id.md).

### Out of scope kecuali PRD eksplisit
Full legal CMS · video library · Midtrans · Xendit payouts · native mobile · payroll rewrite · marketing landing rewrite

---

## 6. Outline PRD v16.0 (skeleton)

**Outcome:** karyawan lihat & apply lowongan internal; HR pipeline; optional link competency/succession.

| Area | Keputusan draft |
|------|-----------------|
| Arsitektur | Modul terpisah `InternalJob` (bukan extend recruitment MVP) |
| Tier | `career:marketplace` @ PROFESSIONAL+ |
| RBAC | HR manage; EMPLOYEE apply; MANAGER read scoped |
| Integration | Onboarding on accept; succession suggest = v16.1 |
| DoD | migration, API, UI, tests, FEATURE-CATALOG sync |

---

## 7. Checklist story (wajib)

Pola v13/v14/v15: acceptance, RBAC, tenant isolation, audit, tier gate, mobile, export cap.

Agustus 2026+: payment stories = Xendit; legal = no full CMS assumption.

---

## 8. Satu kalimat penutup

> dnPeople punya talent matrix, admin console, Xendit billing + invoice PDF, grouped nav. **PRD berikutnya = v16.0 Module 4** + **ops go-live paralel** — lihat [prep doc](./PRD/dnpeople-prd-v16.0-prep-id.md) sebelum menulis PRD final.

---

## 9. Referensi cepat

| Doc | Path |
|-----|------|
| **Prep PRD v16.0 (lengkap)** | [PRD/dnpeople-prd-v16.0-prep-id.md](./PRD/dnpeople-prd-v16.0-prep-id.md) |
| Baseline panjang | [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md) |
| Katalog fitur | [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) |
| Matrix status | [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md) |
| Xendit setup | [xendit/XENDIT-PAYMENT-SETUP.md](./xendit/XENDIT-PAYMENT-SETUP.md) |
| Launch gates | [LAUNCH-GATE-CHECKLIST.md](./LAUNCH-GATE-CHECKLIST.md) |

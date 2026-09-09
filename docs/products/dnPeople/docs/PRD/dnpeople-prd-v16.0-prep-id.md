# dnPeople — Dokumen Persiapan PRD v16.0

## Internal Career Marketplace (PRD v4 Module 4) + Dual Track Ops Go-Live

| | |
|---|---|
| **Versi dokumen** | Prep v1.0 |
| **Tanggal** | 10 Agustus 2026 |
| **Owner** | Dozer (CEO + Tech Lead) |
| **Company** | DN Tech · Brand: DnPeople |
| **Baseline kode** | `main` @ `e462db7` (sidebar grouped nav, billing UI polish, logo3, invoice PDF, payment labels, auth/SSO fixes) |
| **Production** | App `https://hris.dntech.id` · API `https://api.hris.dntech.id` |
| **Status** | **Draft persiapan** — belum PRD sign-off |
| **Output berikutnya** | `dnpeople-prd-v16.0-career-marketplace-id.md` → SRS → SDD |

> **Cara pakai:** Dokumen ini adalah **input lengkap** sebelum menulis PRD resmi. Baca §1–§4 untuk konteks; tulis PRD hanya dari §5–§9. Jangan ulangi fitur yang sudah Done di §3.

**Companion:** [NEXT-PRD-BRIEF.md](../NEXT-PRD-BRIEF.md) (ringkas, 1 halaman keputusan)

---

## 1. Keputusan: PRD berikutnya tentang apa?

Dua jalur paralel — pilih prioritas sprint, bukan mutually exclusive:

| Track | PRD / tema | Outcome | Prioritas rekomendasi |
|-------|------------|---------|------------------------|
| **A — Ops go-live** | v11.0 gates + Xendit live | Uang masuk production, beta 10–20 tenant, monitoring | **P0 bisnis** jika target revenue Q3 2026 |
| **B — Produk greenfield** | **v16.0 Module 4** | Internal career marketplace & mobility | **P0 produk** jika beta sudah jalan tanpa blocker payment |

### Rekomendasi sequencing

```
Minggu 1–2 (ops)     → Xendit webhook E2E, SMTP prod, rotate leaked keys, demo creds off
Minggu 2–4 (product) → Draft PRD v16.0 → review → SRS/SDD → implement
```

**Nomor versi produk berikutnya:** **PRD v16.0** — subtitle *Career Mobility* (internal job marketplace + apply pipeline).

**Alternatif jika ops belum siap:** tunda v16.0 implementasi; tetap tulis PRD sekarang agar scope terkunci sebelum coding.

---

## 2. Snapshot produk (10 Agustus 2026)

| Dimensi | Nilai |
|---------|--------|
| Frontend | Next.js · **~96** halaman · mobile-first · light default + dark/system |
| Backend | Express `/api/v1` · **~60** route modules · SCIM `/scim/v2` |
| Data | PostgreSQL (Supabase) + Prisma · **129** models · **17** migrations |
| Tests | Backend **81/81** pass · Prisma validate ✅ · frontend build ✅ |
| Tier | FREE hard **30** · STARTER hard **50** · PRO **300** · Business soft@1000 · Enterprise custom |
| Trial | Countdown badge; fitur penuh; **bayar kapan saja** (early pay clears `trialEndsAt`) |
| Payment | **Xendit Invoice v2** hosted checkout (test mode on VPS) |
| Legal | ToS + Privacy MVP — signup consent, `/legal/*`, `ComplianceBanner` |
| Talent | Competency · IDP · **9-box matrix** · succession · LMS @ PROFESSIONAL+ |
| Help | 5 tutorials + KB via Help menu (`tutorials` @ FREE+) |
| Admin | `/admin` SUPER_ADMIN — customers, MRR, tickets, flags, health, audit |
| Nav UX | **Grouped sidebar** — 8 section labels; flat mode untuk ≤8 item (employee) |
| Brand | Logo canonical **`/logo3.png`** (AppShell, marketing, login, careers, JSON-LD) |
| Billing UX | Stat cards, tier bullets, invoice filter tabs, trial preview hide, mobile invoice cards |

**Roles:** `SUPER_ADMIN` · `COMPANY_ADMIN` · `HR` · `MANAGER` · `FINANCE` · `EMPLOYEE`

---

## 3. Yang sudah Done — jangan di-rebuild

### Core (MVP 1–5 + PRD v5–v14.0)
Lihat [CURRENT-IMPLEMENTATION.md](../CURRENT-IMPLEMENTATION.md) dan [FEATURE-CATALOG.md](../FEATURE-CATALOG.md).

### PRD v15.0 — Admin Console ✅
`/admin`, impersonation, refunds, analytics, tickets, content CRUD, feature flags, health, audit.

### Agustus 2026 — Post-v15 increments ✅

| Deliverable | Surface | Commit / catatan |
|-------------|---------|------------------|
| Xendit PG v1.0 | `/billing`, webhooks, public invoice pay | `7911ec9` fail-closed webhook |
| Trial early-pay + light theme | Billing UX, `ThemeToggle` | Aug 2026 |
| Legal ToS/PP MVP | Signup, `/settings/legal` | Aug 2026 |
| Invoice payment method | Kolom metode bayar Xendit di riwayat invoice | `83468f8` |
| Export invoice PDF | `GET /subscription/invoices/:id.pdf`, tombol **Unduh PDF** | `d770f0a`, footer fix `7397f1b` |
| Auth hardening | Company picker search; no directory leak; SSO fail-closed | `943be30`–`f2ffda3` |
| Grouped sidebar nav | `navigationMenu.ts` groups + `AppShell` section headers | `bd67414` |
| Billing UI polish | Stat cards, filters, tier feature bullets | `64b9146` |
| Brand logo logo3 | `/logo3.png` replaces `/logo1.png` site-wide | Aug 2026 |

### Explicit non-goals (tetap out of scope v16.0 kecuali PRD baru)

- Full legal CMS (AUP, admin legal editor, dynamic DPA)
- Video tutorial library
- Midtrans re-activation
- Xendit payouts / native recurring subscriptions
- WebSocket real-time calibration
- Native mobile app
- Re-write payroll/tax engine
- Marketing landing rewrite (reverted ke design pre-Aug `b666094`)

---

## 4. Launch readiness — penilaian jujur

**Estimasi kesiapan commercial launch:** ~**68%** (Agustus 2026)

| Area | Status | Blocker / action |
|------|--------|------------------|
| Core HRIS code | ✅ ~95% | Browser UAT signed masih perlu |
| Subscription & billing UI | ✅ | Xendit **live** money belum verified |
| Xendit webhook E2E prod | ⬜ | 1× bayar test → invoice PAID → tier aktif |
| Xendit production keys + KYC | ⬜ | Ganti test keys di VPS |
| **Secret in git** | 🔴 | `docs/xendit/secret_api_key.csv` — **rotate key**, hapus dari repo |
| SMTP production | ⬜ | Forgot-password & lead notify |
| Demo creds di UI | 🟡 | Set `NEXT_PUBLIC_SHOW_DEMO_CREDS=false` untuk prod |
| Datadog / PagerDuty live | ⬜ | Agent + 5+ monitors |
| Pen-test sign-off | ⬜ | Staging prep ada di `ops/pen-test-staging-prep.md` |
| Beta 10–20 customers | ⬜ | Playbook: `CUSTOMER-ONBOARDING-PLAYBOOK.md` |
| DNS `dnpeople.id` | ⬜ | vs `hris.dntech.id` |
| IdP/SCIM production UAT | ⬜ | Enterprise tier |

**Go/no-go checklist:** [LAUNCH-GATE-CHECKLIST.md](../LAUNCH-GATE-CHECKLIST.md)

---

## 5. PRD v16.0 — Problem & outcome (draft untuk PRD final)

### 5.1 Problem statement

HR Indonesia sudah punya data karyawan, competency gap, succession slate, dan modul rekrutmen **eksternal** — tapi **mobilitas internal** masih manual (email, spreadsheet, WhatsApp). Akibatnya:

- High-performer tidak lihat peluang internal → flight risk
- Succession candidate tidak punya jalur apply formal ke role target
- HR tidak punya pipeline terpusat untuk internal transfer/promosi
- Tidak ada metrik time-to-fill internal vs eksternal

### 5.2 Desired outcome (Module 4)

```
✓ HR/Manager posting lowongan INTERNAL (bukan public careers page)
✓ Karyawan browse + apply dengan profil existing (competency, performance summary)
✓ Pipeline: Applied → Screening → Interview → Offer → Accepted/Rejected
✓ Optional: link ke succession readiness & competency gap
✓ Notifikasi in-app (+ email jika SMTP ready)
✓ Laporan: applicants per role, time-to-fill, source internal vs external
✓ Audit trail semua status change
```

### 5.3 Business impact (hypothesis — validasi di PRD)

| Metrik | Target awal |
|--------|-------------|
| Internal fill rate | Baseline → +15% dalam 6 bulan pilot |
| Time-to-fill internal | < 30 hari median |
| Employee engagement | NPS internal mobility survey (manual Q1) |
| Upsell | Feature gate PROFESSIONAL+ atau BUSINESS |

---

## 6. Integrasi dengan modul existing

PRD v16.0 **harus** mendefinisikan boundary dengan modul yang sudah ada:

| Modul existing | Integrasi Module 4 | Pertanyaan PRD |
|----------------|-------------------|----------------|
| **Recruitment** (`/recruitment`) | External ATS vs internal-only | Satu pipeline atau terpisah? Share `JobPosting` model? |
| **Public careers** (`/careers`) | Hanya external; internal **tidak** di public | Confirm: internal jobs never on public URL |
| **Talent / Succession** (`/talent/succession`) | Pre-fill successor interest | Auto-suggest internal jobs untuk readiness "Ready Now"? |
| **Competency** (`/talent`) | Gap analysis on apply | Block apply jika gap kritis? Warning only? |
| **Performance** (`/performance`) | Manager endorsement | Require latest review score? |
| **Onboarding** (`/onboarding`) | Trigger plan on internal hire | Reuse offer→onboarding flow dari recruitment? |
| **Org** (`/org`) | Dept/position on job | FK ke `Position` / `Department` |
| **Notifications** | Apply/status events | Reuse `/notifications` + email outbox |
| **Audit** | Status transitions | Reuse global audit pattern |
| **Tier gating** | Feature key baru | `career:marketplace` atau extend `recruitment`? |

### Rekomendasi arsitektur (untuk dibahas di PRD)

**Opsi A — Extend recruitment:** tambah `visibility: INTERNAL | EXTERNAL | BOTH` pada job posting existing.  
**Pro:** satu pipeline, less duplication. **Con:** recruitment module sudah kompleks (offer, e-sign).

**Opsi B — Modul terpisah:** `InternalJob` + `InternalApplication` domain baru, link ke employee/org.  
**Pro:** scope jelas, tier gate mudah. **Con:** duplikasi pipeline UI sebagian.

**Rekomendasi prep:** **Opsi B untuk v16.0 MVP**, evaluasi merge di v16.1 jika adoption tinggi.

---

## 7. Personas & RBAC (draft)

| Role | Capabilities |
|------|--------------|
| **COMPANY_ADMIN / HR** | CRUD internal jobs, manage pipeline, export, link succession |
| **MANAGER** | Post job untuk tim (optional), view applicants direct reports, recommend |
| **EMPLOYEE** | Browse internal jobs, apply, withdraw, track status own applications |
| **FINANCE** | Read-only job list (no salary on posting unless scoped) |
| **SUPER_ADMIN** | N/A (tenant-scoped only) |

**Row scope:** strict `companyId`; employee hanya lihat jobs `status=PUBLISHED` + own applications.

**Privacy:** applicant tidak lihat applicant lain; manager hanya lihat apply ke job yang mereka own/post.

---

## 8. User story backlog (draft — prioritas untuk PRD)

### Epic 1 — Internal job posting

| ID | Story | Acceptance hint |
|----|-------|-----------------|
| CM-1 | Sebagai HR, saya buat lowongan internal dengan title, dept, position, deskripsi, deadline | Draft → Published → Closed |
| CM-2 | Sebagai HR, saya set visibility tier minimum (optional) | Hanya role eligible |
| CM-3 | Sebagai HR, saya duplicate job dari template / job lama | Idempotent duplicate |
| CM-4 | Sebagai Manager, saya submit draft job untuk HR approval (optional v16.0) | Out of MVP jika scope ketat |

### Epic 2 — Employee apply

| ID | Story | Acceptance hint |
|----|-------|-----------------|
| CM-10 | Sebagai karyawan, saya lihat daftar lowongan internal aktif | Mobile-first list + filter dept |
| CM-11 | Sebagai karyawan, saya apply dengan cover note + auto-attach profil | One active apply per job |
| CM-12 | Sebagai karyawan, saya lihat status apply saya | Timeline status |
| CM-13 | Sebagai karyawan, saya withdraw sebelum offer | Audit logged |

### Epic 3 — Pipeline & HR ops

| ID | Story | Acceptance hint |
|----|-------|-----------------|
| CM-20 | Sebagai HR, saya pindahkan applicant antar stage | Kanban or table + audit |
| CM-21 | Sebagai HR, saya reject dengan reason code | Required reason |
| CM-22 | Sebagai HR, saya generate internal offer letter | Reuse recruitment offer pattern? |
| CM-23 | Sebagai HR, accepted → trigger position change / onboarding | Link employee master |

### Epic 4 — Talent integration (stretch / v16.1)

| ID | Story | Acceptance hint |
|----|-------|-----------------|
| CM-30 | Tampilkan competency gap vs job requirements | Read-only badge |
| CM-31 | Succession slate → suggest apply | Notification to successor |

### Epic 5 — Reports & export

| ID | Story | Acceptance hint |
|----|-------|-----------------|
| CM-40 | Export applicants Excel/PDF per job | Cap 1000 rows |
| CM-41 | Dashboard: open jobs, avg time-to-fill | Admin/HR only |

### Epic 6 — Platform

| ID | Story | Acceptance hint |
|----|-------|-----------------|
| CM-50 | Feature gate `career:marketplace` @ PROFESSIONAL+ | Nav item + route guard |
| CM-51 | Notifications on apply/status change | In-app minimum |
| CM-52 | API OpenAPI documented | `/api/v1/internal-jobs` |

---

## 9. Data model sketch (untuk SDD — bukan final)

```prisma
model InternalJob {
  id            String   @id @default(cuid())
  companyId     String
  title         String
  departmentId  String?
  positionId    String?
  description   String   @db.Text
  requirements  String?  @db.Text
  status        InternalJobStatus // DRAFT | PUBLISHED | CLOSED | FILLED
  publishedAt   DateTime?
  closesAt      DateTime?
  createdById   String
  // relations...
}

model InternalApplication {
  id            String   @id @default(cuid())
  companyId     String
  jobId         String
  employeeId    String
  status        InternalApplicationStatus // APPLIED | SCREENING | INTERVIEW | OFFER | ACCEPTED | REJECTED | WITHDRAWN
  coverNote     String?
  appliedAt     DateTime @default(now())
  // audit via existing AuditLog or dedicated ApplicationStatusHistory
}
```

**Indexes:** `(companyId, status)`, `(jobId, employeeId)` unique for active apply.

---

## 10. API surface sketch

| Method | Path | Role |
|--------|------|------|
| GET | `/internal-jobs` | HR list; EMPLOYEE filtered published |
| POST | `/internal-jobs` | HR create |
| PATCH | `/internal-jobs/:id` | HR update / publish / close |
| GET | `/internal-jobs/:id/applications` | HR pipeline |
| POST | `/internal-jobs/:id/apply` | EMPLOYEE |
| PATCH | `/internal-applications/:id/status` | HR stage transition |
| POST | `/internal-applications/:id/withdraw` | EMPLOYEE own |
| GET | `/internal-jobs/reports/summary` | HR export meta |

Pattern: mirror `recruitment` routes structure di `backend/src/routes/`.

---

## 11. UI / navigation

| Surface | Path | Nav group |
|---------|------|-----------|
| Job list (HR) | `/career/jobs` atau `/internal-jobs` | **People** atau **Talent & learning** |
| Job detail + pipeline | `/career/jobs/[id]` | same |
| Employee browse | `/career` atau `/career/browse` | **Utama** or **Talent** |

**Nav SSOT:** tambah item di `frontend/src/lib/navigationMenu.ts` dengan `group: 'talent'` atau `'people'`.

**Mobile:** list + detail drawer; pipeline table horizontal scroll (pattern existing).

---

## 12. Tier & feature flag

| Opsi | Feature key | Tier |
|------|-------------|------|
| A (recommended) | `career:marketplace` | PROFESSIONAL+ |
| B | Bundled dengan `recruitment` | STARTER+ (lebih murah positioning) |

Tambah ke `TIER_FEATURES` backend + `subscriptionFeatures.ts` + nav filter.

---

## 13. Definition of Done (PRD v16.0)

Sama pola v13/v14/v15:

- [ ] Prisma migration + seed sample jobs (demo tenant)
- [ ] Backend routes + service + unit tests (target +10 tests)
- [ ] RBAC + tenant isolation tests
- [ ] Frontend pages + mobile QA
- [ ] Nav + tier gate + route guard
- [ ] Audit log on status changes
- [ ] OpenAPI snippet updated
- [ ] [FEATURE-CATALOG.md](../FEATURE-CATALOG.md) + [IMPLEMENTATION-STATUS.md](../IMPLEMENTATION-STATUS.md) sync
- [ ] Help/KB: 1 tutorial "Internal career" (optional v16.0 atau v16.0.1)
- [ ] No regression payroll/talent matrix tests

---

## 14. Open questions — wajib dijawab sebelum PRD sign-off

| # | Pertanyaan | Owner | Default recommendation |
|---|------------|-------|------------------------|
| 1 | Opsi A (extend recruitment) vs B (modul baru)? | Dozer | **B untuk MVP** |
| 2 | Tier gate: PRO vs STARTER? | Dozer | **PROFESSIONAL+** |
| 3 | Internal offer reuse recruitment e-sign? | Dozer | Reuse jika < 3 hari extra; else manual accept |
| 4 | Manager can post without HR approval? | Dozer | **HR only MVP** |
| 5 | Show competency gap on apply? | Dozer | **Warning badge v16.0; hard block v16.1** |
| 6 | Rotation program (4.2) in v16.0 or separate PRD? | Dozer | **Separate v16.1** |
| 7 | Parallel ops go-live owner & date? | Dozer | Target: webhook E2E before beta invoice |

---

## 15. Roadmap setelah v16.0

| Versi | Scope |
|-------|--------|
| **v16.0** | Internal job marketplace MVP (post, apply, pipeline, export basic) |
| **v16.1** | Rotation programs + succession auto-suggest + competency hard rules |
| **v17.0** | Module 5 — Earned Wage Access (partner bank required) |
| **v18.0** | Module 6 — Salary benchmarking (data vendor required) |
| **v19+** | Module 7–8 vertical packages |

---

## 16. Checklist menulis PRD final

Gunakan template dari [dnpeople-prd-v13.0-talent-matrix-succession.md](./dnpeople-prd-v13.0-talent-matrix-succession.md):

1. [ ] Executive summary (1 halaman)
2. [ ] Problem & business outcome
3. [ ] Personas & permissions (matrix)
4. [ ] User stories dengan acceptance criteria (Given/When/Then)
5. [ ] Out of scope explicit
6. [ ] Tier & pricing impact
7. [ ] Data model (Prisma draft)
8. [ ] API contract table
9. [ ] UI wireframe notes / page list
10. [ ] NFR: performance, audit, mobile, export caps
11. [ ] Rollout: feature flag, migration, demo seed
12. [ ] Success metrics & pilot plan
13. [ ] Dependencies (SMTP, ops gates)
14. [ ] Sign-off block

**Setelah PRD approved:**

```
PRD v16.0 → SRS v16.0 (acceptance) → SDD v16.0 (implementation) → sprint
```

---

## 17. Referensi

| Dokumen | Path |
|---------|------|
| Brief ringkas | [NEXT-PRD-BRIEF.md](../NEXT-PRD-BRIEF.md) |
| Baseline implementasi | [CURRENT-IMPLEMENTATION.md](../CURRENT-IMPLEMENTATION.md) |
| Katalog fitur | [FEATURE-CATALOG.md](../FEATURE-CATALOG.md) |
| Matrix compliance | [PRD-COMPLIANCE-MATRIX.md](../PRD-COMPLIANCE-MATRIX.md) |
| Launch gates | [LAUNCH-GATE-CHECKLIST.md](../LAUNCH-GATE-CHECKLIST.md) |
| Xendit setup | [xendit/XENDIT-PAYMENT-SETUP.md](../xendit/XENDIT-PAYMENT-SETUP.md) |
| Talent matrix PRD ( pola ) | [dnpeople-prd-v13.0-talent-matrix-succession.md](./dnpeople-prd-v13.0-talent-matrix-succession.md) |
| Nav SSOT | `frontend/src/lib/navigationMenu.ts` |
| Recruitment routes | `backend/src/routes/recruitment.ts` |

---

## 18. Satu kalimat penutup

> dnPeople **siap untuk PRD v16.0** (internal career marketplace) dengan baseline talent matrix, billing Xendit, admin console, dan nav grouped — **asalkan** ops go-live (webhook live, SMTP, secret rotation) dijalankan paralel agar pilot beta bisa monetize.

---

| | |
|---|---|
| Owner | Dozer (CEO + Tech Lead) |
| UpdatedAt | August 10, 2026 |
| Next action | Jawab §14 open questions → tulis `dnpeople-prd-v16.0-career-marketplace-id.md` |

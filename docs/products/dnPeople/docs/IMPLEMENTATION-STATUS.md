# dnPeople — Implementation Status

> Terakhir diperbarui: **18 Juli 2026** (PRD v8.0 security & stability)  
> Referensi: PRD/SRS/SDD **v3.1** + PRD **v4–v8.0** · Repo version **1.0.0**
>
> **Owner:** Dozer (CEO + Tech Lead) · **Company:** DN Tech (PT. Dozer Napitupulu Technology) · **Brand:** DnPeople · **UpdatedAt:** July 18, 2026  
>
> **Audit:** [AUDIT-FEATURE-BUG-PERFORMANCE.md](./AUDIT-FEATURE-BUG-PERFORMANCE.md) · **PRD v8.0:** [PRD/dnpeople-prd-v8.0-security-stability-fixes-id.md](./PRD/dnpeople-prd-v8.0-security-stability-fixes-id.md)

## Ringkasan

| MVP | Target | Status |
|-----|--------|--------|
| MVP 1 | Core HR (employee, attendance, leave, payroll) | **Done** (v8.0: atomic finalize + batch payroll) |
| MVP 2 | Extended ops (shift, OT, claim, loan, calendar…) | **Done** |
| MVP 3 | Strategic HR (recruitment, performance, training…) | **Done** |
| MVP 4 | Enterprise (multi-company, SSO, integrations) | **Done** (v8.0: API-key scopes + secured uploads) |
| MVP 5 (PRD v4 Module 1–2) | Talent Development foundation (competency, IDP, LMS basic) | **Done** |
| PRD v5 | Subscription tier gating & billing | **Done** (ops acceptance Conditional) |
| PRD v6 / v6.1 | Enterprise multi-tenant + seamless login discovery | **Done** (IdP/SCIM Conditional) |
| PRD v7.0 | Attendance Excel manual import | **Done** (v8.0: idempotency key) |
| PRD v8.0 | Security & stability (audit P0/P1) | **Done** |
| PRD v4 Module 3–8 | 9-box, succession, career marketplace, EWA, salary benchmarking, industry verticals | **Not started** (roadmap) |

**Typecheck:** Backend ✅ · Frontend ✅ · Backend tests **28/28** ✅ · Prisma validate ✅ · npm audit **0 vulnerability** ✅  
**Production go-live:** Conditional — code P0s from Jul 18 audit addressed; still need ops UAT (IdP/SMTP/S3/biometric) + signed UAT.

### PRD completion hardening — baseline 12 Juli 2026, diaudit ulang 18 Juli 2026

| Area | Implementasi terbaru |
|------|----------------------|
| Employee lifecycle | Family, education, contact, bank/tax, status history, contract/probation review, reminders, auto-conversion |
| Payroll | Configuration UI/API, templates, tax-rate versions, complete PTKP, BPJS, gross/net/gross-up, variable compensation, employer contribution |
| Payslip | Inline Company/Super Admin preview, landscape tabel pendapatan/potongan, rincian proration, password PDF, branding, signature + verification |
| Attendance | Early-leave detection, provider adapter liveness/face-match, production fail-closed, correction evidence + before/after audit |
| Leave | Carry-forward/expiry, annual processing, replacement/coverage assignment, notifications |
| Reports | Attendance/leave/payroll detail, Excel/PDF, bank upload, tax, turnover trend/risk |
| Recruitment | Bulk pipeline action, digital offer, accept/reject e-sign, auto employee + onboarding |
| Security | AES-256-GCM salary/NPWP/bank, key rotation, salary RBAC, global redacted audit, immutable audit DB trigger |
| Operations | Baseline migration, daily backup workflow, restore script, readiness, Prometheus metrics |
| RBAC | Role HR tanpa payroll, Finance khusus payroll, pengelolaan role akun teraudit, navigasi role-aware |
| NFR | Sentry redacted, database constraint test, load CI 1.000 concurrent users dengan p95 <2 detik |

### Frontend mobile-first

| Area | Status | Implementasi |
|------|--------|--------------|
| Application shell | Done | Mobile header + navigation drawer; sidebar persisten mulai breakpoint `md` |
| Content spacing | Done | Padding konten dan card responsif dari mobile ke desktop |
| Forms & actions | Done | Grid menjadi satu kolom dan action row membungkus pada layar kecil |
| Data tables | Done | 17 tabel di 16 halaman memenuhi lebar card pada desktop; horizontal scrolling lokal pada mobile |
| Public careers | Done | Listing dan application form responsif |
| Accessibility dasar | Done | Label navigasi, overlay dismiss, dan target sentuh mobile |

Verifikasi 18 Juli 2026: TypeScript ✅ · backend tests 24/24 ✅ · frontend production build 49 routes ✅. Codebase memiliki **49 page frontend**, **49 modul route backend**, dan **99 model Prisma**.

---

## MVP 1 — Core HR

| Fitur | Status |
|-------|--------|
| Auth JWT + RBAC 6 roles | Done | `SUPER_ADMIN`, `COMPANY_ADMIN`, `HR`, `MANAGER`, `FINANCE`, `EMPLOYEE` |
| Central staff account management | Done | Standalone/linked account, role, activation, reset password, audit |
| Company register / profile | Done |
| Org (dept, position, level, location) | Done |
| Employee master + tax info | Done |
| Attendance clock in/out | Done | Manual / GPS / QR / Selfie |
| Attendance Excel import | Done | Template download, dry-run validation/preview, confirm import, audit-backed recent uploads |
| Leave types, balance, approve | Done |
| Permissions (WFH/izin) | Done |
| Payroll BPJS + PPh 21 | Done |
| Dashboard + basic reports | Done |
| Audit trail | Done |

Frontend: `/dashboard` `/employees` `/attendance` `/leave` `/permissions` `/payroll`

---

## MVP 2 — Extended Ops

| Fitur | Status |
|-------|--------|
| Shift + assignment | Done |
| Shift swap + rotation + pay differential | Done | Swap request, `/assignments/rotate`, `payMultiplier` |
| WiFi check-in | Done | `allowedWifiSsids` on work location |
| Bulk attendance corrections | Done | `POST /corrections/bulk`, `/bulk-approve` |
| Contract email reminders | Done | Scheduler + manual trigger |
| Payroll on calendar | Done | Scheduled day + payroll runs |
| Polling (surveys) | Done | `kind: poll` + choice questions |
| Overtime (+ payroll) | Done |
| Claims / reimbursement | Done |
| Loans (kasbon) | Done |
| Company / org settings | Done | UI `/org` — dept, posisi, level, lokasi (geofence + WiFi) |
| Employee CRUD | Done | UI create/edit di `/employees` |
| Pay differential in payroll | Done | `payMultiplier` → tunjangan shift di payroll run |
| Attendance/leave payroll deduction | Done | Potongan absen + cuti unpaid |
| Leave/permission → attendance | Done | Auto-sync saat approve |
| Employee documents UI | Done | Tab karyawan di `/documents` |
| Attendance report UI | Done | Ringkasan + export CSV di `/reports` |
| Bulk employee import | Done | `POST /employees/import` + Excel UI |
| Auto-approve sick leave | Done | `maxAutoApproveDays` (SICK default 2 hari) |
| THR payroll | Done | `POST /payroll/thr/run` |
| Bukti potong PPh 21 | Done | `GET /payroll/bukti-potong/:employeeId` |
| Payroll proration | Done | Mid-month join/exit |
| MFA (TOTP) | Done | `/auth/mfa/*` + Security page |
| Session timeout | Done | `SESSION_MAX_AGE_MINUTES=30` |
| Workflow multi-step | Done | Leave + claims approval |
| Offline attendance | Done | Local queue + sync API |
| Audit trail UI | Done | `/audit` |
| CI/CD + tests | Done | GitHub Actions + unit tests |
| Attendance corrections | Done |
| Documents + announcements | Done |
| Surveys API | Done | Dedicated UI `/surveys` |
| Calendar / holidays | Done |
| Approval inbox + rules | Done |
| Advanced reports | Done |
| File upload | Done | Local disk **atau** S3/MinIO (`S3_*`) |
| Payslip preview + PDF | Done | `/payroll` preview untuk employee (own) + admin; PDF auth; signed link 24 jam |
| MFA TOTP | Done | API `/auth/mfa/*` + UI `/settings/mfa` (semua role) + QR |
| Email notifications | Done | SMTP atau console log |

Frontend: `/org` `/audit` `/shifts` `/overtime` `/claims` `/loans` `/corrections` `/documents` `/announcements` `/calendar` `/approvals` `/reports` `/surveys`

### Verifikasi MVP 2 (10 Juli 2026)

| Fitur gap audit | API | UI | Verdict |
|-----------------|-----|-----|---------|
| Shift swap | `/shifts/swap-requests` | `/shifts` | ✅ Full |
| Shift rotation | `/shifts/assignments/rotate` | `/shifts` | ✅ Full |
| Pay differential | `payMultiplier` on shift | `/shifts` | ✅ Full |
| WiFi check-in | `WIFI` + `wifiSsid` | `/attendance` | ✅ Full |
| Bulk corrections | `/corrections/bulk` | `/corrections` | ✅ Full |
| Contract reminders | `/documents/contracts/send-reminders` | `/documents` | ✅ Full |
| Payroll calendar | `/calendar` payroll events | `/calendar` | ✅ Full |
| Quick polling | `kind: poll` | `/surveys` | ✅ Full |

**Kesimpulan MVP 2:** **Done (full)** — semua gap audit tertutup dengan API + UI.

---

## MVP 3 — Strategic HR

| Fitur | Status | Catatan |
|-------|--------|---------|
| Recruitment & ATS | Done | Jobs, candidates, pipeline, status workflow, AI screen (MVP 4) |
| Public careers portal | Done | `/careers` — kandidat apply tanpa login |
| Onboarding | Done | Plan + checklist default + complete task |
| Performance / KPI | Done | Cycles, generate reviews, self/manager score, KPI/OKR |
| Training & career | Done | Programs, enroll, career paths |
| Assets | Done | CRUD, assign / return |
| Offboarding | Done | Resign request → approve → complete + auto return assets |
| Policies / disciplinary | Done | Kebijakan + SP/warning/suspension |
| Helpdesk | Done | Ticket create, assign, resolve |
| AI HR Assistant | Done | LLM + rule-based fallback |
| Advanced analytics | Done | `/reports/analytics` + UI cards |

Frontend: `/recruitment` `/onboarding` `/performance` `/training` `/assets` `/offboarding` `/helpdesk` `/policies` `/assistant` `/careers`

### Verifikasi MVP 3 (10 Juli 2026)

| Modul PRD | API | UI | Verdict |
|-----------|-----|-----|---------|
| Recruitment & ATS | `/recruitment` | `/recruitment` | ✅ Full |
| Employee Onboarding | `/onboarding` | `/onboarding` | ✅ Full |
| Performance Management | `/performance` | `/performance` | ✅ Full |
| KPI & OKR | `/performance/kpis` | `/performance` | ✅ Full |
| Training & Development | `/training` | `/training` | ✅ Full |
| Career Path | `/training/career-paths` | `/training` | ✅ Full |
| Disciplinary Action | `/policies/disciplinary` | `/policies` | ✅ Full |
| Company Policy | `/policies` | `/policies` | ✅ Full |
| Asset Management | `/assets` | `/assets` | ✅ Full |
| Resignation & Offboarding | `/offboarding` | `/offboarding` | ✅ Full |
| HR Helpdesk | `/helpdesk` | `/helpdesk` | ✅ Full |
| AI HR Assistant | `/assistant/ask` | `/assistant` | ✅ Full |
| Advanced Analytics | `/reports/analytics` | `/reports` | ✅ Full |

**Kesimpulan MVP 3:** **Done (full)** — semua modul PRD punya API + halaman UI + alur CRUD/approval inti. Pinjaman/kasbon ada di MVP 2 (`/loans`).

---

## MVP 4 — Enterprise

| Fitur | Status | Catatan |
|-------|--------|---------|
| Multi-company support | Done | `/platform` SUPER_ADMIN + org links |
| Custom Workflows | Done | Multi-step + activate per module |
| Advanced Approval Rules | Done | Amount-based + workflow resolve |
| API & Integrations | Done | API keys `dnp_…` + webhooks + test |
| SSO (SAML/OAuth) | Done | Google + Microsoft OAuth + SAML ACS/JIT; login auto-routes active-SSO tenants without Company ID input |
| Login tenant discovery v6.1 | Done | `/login` only asks email/password; `/auth/login` resolves verified domain/custom hostname/user history and returns SSO redirect, password token, or company picker |
| Custom Reports Builder | Done | Save + run |
| AI Document Generator | Done | Offer, SP, SK, resign |
| AI Recruitment Screening | Done | Single + batch |
| Advanced Security (row RBAC) | Done | Rules + list enforce (employees, attendance, leave, claims, loans, OT, corrections, permissions, payroll) |
| White-label | Done | Branding + public endpoint |

### Frontend routes MVP 4

`/platform` `/integrations` `/workflows` `/branding` `/sso` `/security` `/custom-reports` `/ai-docs`
(+ AI Screen di `/recruitment`)

### API surface MVP 4

```
/platform/companies|org-tree|org-links
/integrations (+ /api-keys, /:id/test)
/workflows (+ /:id/activate, /resolve/:module)
/branding (+ /public/:companyId)
/sso (+ /google|microsoft|saml start+callback/acs, config)
/custom-reports (+ /sources, /:id/run)
/security/access-rules (+ /effective-scope/:resource)
/ai/documents/generate
/ai/recruitment/screen|screen-batch
/assistant/ask  (llm | rule-based)
/uploads → local disk | S3 (unduh hanya via /api/v1/files + auth)
```

Auth: JWT Bearer **atau** API key `dnp_…` (Bearer).

---

## MVP 5 — Talent Development (PRD v4 Module 1–2 foundation)

| Fitur | Status | Catatan |
|-------|--------|---------|
| Competency framework + versioning | Done | Clone framework/competency/role-mapping via `new-version` |
| Competency library + bulk import | Done | Excel/CSV import, proficiency-level JSON per skala |
| Role-competency mapping | Done | Required level, importance weight, development priority |
| Competency assessment (self/manager/peer/360) | Done | Draft → submit → approve; employee self-service dibuka (`talent:self`) |
| Gap analysis | Done | Priority-ranked (`gap × importanceWeight`), dipakai employee & untuk auto-generate IDP |
| Individual Development Plan (IDP) | Done | Idempotent auto-generate goal dari gap, goal tracking, review recompute completion |
| LMS dasar | Done | Program + module, enroll (self/assigned), completion tracking, sertifikat otomatis, transcript |
| 9-box matrix & succession planning | Not started | PRD v4 Module 3 — butuh data performance matang, roadmap Q4 2026 |
| Internal career marketplace & rotation | Not started | PRD v4 Module 4 |
| Earned wage access (EWA) | Not started | PRD v4 Module 5 — butuh partner bank |
| Salary benchmarking | Not started | PRD v4 Module 6 — butuh sumber data market eksternal |
| Industry-specific package (manufaktur/retail) | Not started | PRD v4 Module 7–8 |

Frontend: `/talent` `/idp` `/lms`

### Catatan implementasi

- Model data (`CompetencyFramework`, `Competency`, `RoleCompetency`, `CompetencyAssessment(+Item)`, `IndividualDevelopmentPlan`, `IdpGoal`, `IdpLearningPath`, `IdpReview`, `LearningProgram(+Competency)`, `LearningModule`, `LearningEnrollment`, `LearningModuleCompletion`) sudah ada di `schema.prisma` dari upaya sebelumnya; pass ini menyelesaikan pemasangan router (`competencies.ts` di-mount, `idp.ts`/`lms.ts` baru dibuat), memperbaiki akses self-service `EMPLOYEE` yang sebelumnya selalu 403, dan menambahkan halaman frontend.
- RBAC `talent:*`/`lms:*`/`talent:self`/`lms:self` per role sudah didefinisikan di `utils/auth.ts` sejak sebelumnya; tidak ada perubahan permission matrix pada pass ini.
- Migrasi tabel talent belum dijalankan oleh assistant di database dev bersama (Supabase) — dijalankan langsung oleh pemilik repo (`prisma db push`) di VPS/lingkungan masing-masing sebelum endpoint ini bisa dipakai.
- Backend `tsc --noEmit` bersih dan server boot-tested lokal; frontend `next build` sukses dengan 49 route (termasuk `/talent`, `/idp`, `/lms`, `/staff-accounts`, `/billing`).

---

## Audit 18 Juli 2026 — remediation (PRD v8.0)

Sumber: [AUDIT-FEATURE-BUG-PERFORMANCE.md](./AUDIT-FEATURE-BUG-PERFORMANCE.md) · Spec: [PRD v8.0](./PRD/dnpeople-prd-v8.0-security-stability-fixes-id.md)

### P0 — Fixed in v8.0

| ID | Area | Fix |
|----|------|-----|
| B01 | Security | Public `express.static('/uploads')` dihapus; `GET /api/v1/files/*` + `GET /payroll/:id/payslip.pdf` ber-auth + audit |
| B02 | Security | API key `scopes` di-enforce (default deny; `*` = admin) |
| B03 | Payroll | Finalize atomic via `updateMany({ status: DRAFT })` dalam transaksi |
| P01 | Performance | Payroll run batch OT/claims/loans/variables (bukan N+1) |

### P1 — Fixed in v8.0

| ID | Area | Fix |
|----|------|-----|
| B04 | UX | Nav “Slip Gaji” (`/payroll`) untuk semua role; employee → `/payroll/my` |
| B05 | UX | `/settings/mfa` untuk semua user |
| B06–B08 | Attendance / upload | Import idempotency-key; offline sync tidak overwrite clock; upload magic-byte + MIME |
| P02 | Performance | Report export capped 1000 rows |

### Masih conditional (ops / UAT)

- IdP/SCIM production, SMTP, S3 malware/lifecycle, biometric vendor UAT, signed browser UAT

---

## External production dependencies

- Set `BIOMETRIC_VERIFIER_URL` dan token provider untuk liveness/face-match production.
- Simpan `FIELD_ENCRYPTION_KEYS` di secret manager dan jalankan `npm run security:migrate-fields` sekali untuk data legacy.
- Konfigurasikan `BACKUP_DATABASE_URL` dan, bila digunakan, `BACKUP_S3_URI`; lakukan restore drill berkala.
- Native mobile app tetap roadmap terpisah; web saat ini mobile-first dan attendance memiliki offline queue/sync.
- Ops UAT gates tetap wajib sebelum klaim production-accepted.


---

*Last Updated: July 18, 2026*

| | |
|---|---|
| Owner | Dozer (CEO + Tech Lead) |
| Company | DN Tech (PT. Dozer Napitupulu Technology) |
| Brand | DnPeople |
| UpdatedAt | July 18, 2026 |
| Audit | [AUDIT-FEATURE-BUG-PERFORMANCE.md](./AUDIT-FEATURE-BUG-PERFORMANCE.md) |

Property of DN Tech — PT. Dozer Napitupulu Technology · 2026

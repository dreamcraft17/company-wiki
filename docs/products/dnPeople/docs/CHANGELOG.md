# dnPeople Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/).

---

## [2026-07-19] — PRD v10.0 operations & launch readiness (code/docs)

### Added
- `/alive`, enriched `/health` (version/uptime) + `/ready` checks object
- Prometheus metrics: histogram, rate_limit, payroll_jobs, labeled requests
- Privacy API: `/privacy/export`, `/deletion-request`, `/processors`
- Backup `verify-backup.sh` + `restore-drill.sh`; k6 authenticated loadtest
- Ops: Datadog compose profile, alert-rules.yaml, incident runbooks
- Legal templates (Privacy/Terms/DPA), pen-test scope, incident response
- Marketing `/welcome` + `/legal/*`; expanded FAQ/troubleshooting/compliance docs
- Spec PRD/SRS/SDD v10.0 mirrored into `docs/PRD/`

### Note
- Datadog/PagerDuty account wiring, live pen-test, and domain DNS remain ops Conditional

## [2026-07-19] — PRD v9.0 launch-readiness code pass

### Added
- Tenant daily API hard-limit (default 10k) enforced on every authenticated request
- Self-service forgot/reset password (token TTL 1 jam) + UI `/reset-password`
- Billing pay-now (Xendit / Stripe / Manual) di `/billing`
- OpenAPI JSON + Swagger UI (`/api/v1/openapi.json`, `/api/v1/docs`)
- Customer docs: USER-GUIDE, ADMIN-GUIDE, FAQ, onboarding playbook, SLA, UU PDP checklist, restore drill runbook

### Changed
- Planning docs v9.0 di company-wiki diselaraskan (v8.0 marked done)

## [2026-07-19] — Docs sync: feature / current / implementation baseline

### Changed
- `FEATURE-CATALOG.md`, `CURRENT-IMPLEMENTATION.md`, `IMPLEMENTATION-STATUS.md` diselaraskan ke HEAD `a8b1882` (50 pages · 51 routes · 101 models · 31 tests)
- Index, PROJECT-OVERVIEW, README mencantumkan PRD v8.0 acceptance wiring dan inventory akurat

## [2026-07-19] — PRD v8.0 acceptance wiring (UI + SSO + idempotent finalize)

### Fixed
- SSO sets httpOnly cookie (JWT tidak lagi di query URL)
- Token/user tidak lagi di localStorage (sessionStorage + cookie)
- Finalize idempotent: sudah FINALIZED → 200 (bukan 409)
- Import attendance membutuhkan `attendance:*` (bukan view)
- Audit payslip action = `PAYSLIP_DOWNLOAD`

### Added
- UI: bagikan signed payslip link; report job list + poll + unduh
- MFA QR code di `/settings/mfa`; `/security` mengarahkan ke sana
- Employee “Lihat Slip” preview
- Acceptance unit tests v8

## [2026-07-19] — PRD v8.0 complete remaining (P1-P02 + P2)

### Added
- Async report export jobs (`POST /reports/jobs`, status + download) + email when ready
- Signed payslip links (`POST /payroll/:id/payslip-link`, `GET /payroll/signed-payslip/:token`, TTL 24h)
- Email outbox + retry scheduler (`email_outbox`, 3 immediate retries then queue)
- httpOnly session cookie `dnpeople_session` + Next.js `/api/v1` rewrite for same-origin cookies
- Shared `Alert` UI component; MFA/login/reports use it
- DB indexes (payroll status, audit action/createdAt, payslip, OT/claim/loan) + migration

### Changed
- Report Excel streams to response; bank/tax exports capped at 1000 rows
- JWT token stored in `sessionStorage` (not `localStorage`); cookie is primary auth
- Removed unused Redis service from `docker-compose.yml`

### Fixed
- P1-P02 / P2-B09 / P2-P05 / P2-B10 / P2-B11 / P2-R02 / AC-1.4 signed URL

## [2026-07-18] — PRD v8.0 follow-up (B06 UI + P01 adjustments batch)

### Fixed
- Attendance import UI mengirim `Idempotency-Key` (hash file); backend selalu derive key dari file bila header kosong
- Payroll run batch attendance/leave/shift adjustments (hilangkan sisa N+1 per karyawan)

## [2026-07-18] — PRD v8.0 security & stability

### Fixed
- **B01:** Hapus public `express.static('/uploads')`; file via `GET /api/v1/files/*` (auth + company scope); payslip download diaudit
- **B02:** Enforce API key `scopes` (default deny; `*` = admin); `requirePermission` memanggil `assertApiKeyScope`
- **B03:** Payroll finalize atomic (`updateMany` status DRAFT → FINALIZED) — cegah double loan installment
- **P01:** Payroll run batch query OT/claims/loans/variables
- **B04/B05:** Nav Slip Gaji untuk employee; halaman `/settings/mfa` untuk semua user
- **B06–B08:** Attendance import `Idempotency-Key`; offline sync tidak overwrite jam; upload validasi magic byte + MIME
- **P02:** Cap export laporan 1000 baris

### Added
- Spec PRD/SRS/SDD v8.0 (repo + company-wiki mirror)
- Unit tests API scopes + upload validation (28 total)

### Changed
- Frontend `fileUrl()` mengarah ke `/api/v1/files/...` dengan `access_token`
- Docs: IMPLEMENTATION-STATUS, CURRENT-IMPLEMENTATION, AUDIT, indexes

## [2026-07-18] — PRD v7.0 attendance Excel + docs sync

### Added
- `/attendance` HR/Admin Excel panel: template download, `.xlsx` upload, dry-run validation, summary/preview, confirm import, recent upload history
- Backend `/attendance/template/download`, `/attendance/import`, `/attendance/imports` with company isolation, role guard, 5 MB `.xlsx` validation, duplicate checks, all-or-nothing import, `MANUAL_UPLOAD` source marker, and audit log metadata
- Excel template sheets: `Attendance`, `Instructions`, `Employee List`

### Changed
- Admin attendance UI is Excel-first; office QR **generator card removed** from admin `/attendance` (employee QR scan + API `GET /attendance/qr/today` remain)
- Documentation aligned to codebase HEAD `a345e4b`: **49** pages, **49** routes, **99** models, **24** tests
- Architecture / feature catalog updated for PRD v5 billing surfaces and v7.0 attendance import
- Payslip verify path documented as `GET /payroll/verify/:payslipId`

### Previously shipped on this date (folded from Unreleased)
- PRD v6.1 seamless tenant discovery login
- Payroll admin inline payslip preview
- Central `/staff-accounts` administration

## [2026-07-18] — Docs & inventory sync (earlier)

### Changed
- Documentation aligned to **49** frontend pages, **49** route modules, **99** Prisma models, **24** backend tests, package **1.0.0**
- Architecture rewritten for PRD v5–v6.1 (SSO+JIT implemented; discovery login; MFA; staff-accounts)

## Unreleased

_(empty — ship notes go under dated releases)_

## Previous release notes

### Added — Talent Development (PRD v4 Module 1–2 foundation)

- Mounted competency framework/library/role-mapping/assessment API
- IDP auto-generation from competency gaps; LMS basic (`/talent`, `/idp`, `/lms`)

### Added — PRD completion hardening

- Employee lifecycle, configurable payroll, landscape payslip PDF, Excel/PDF exports, digital offer e-sign, leave carry-forward, notifications, CI/backup/metrics, HR role, optional Sentry

### Security

- AES-256-GCM field encryption, append-only audit, biometric fail-closed adapter, correction evidence

### Verification

- Backend automated suite **24/24**; frontend production build **49** routes; `npm audit` 0 known vulnerabilities

---

## Older Planned (reclassified)

Items below were marked Planned before Jul 18 and are now **Done** or **Conditional**:

| Item | Status now |
|------|------------|
| Survey dedicated UI | Done (`/surveys`) |
| Binary file upload | Conditional — local/S3 |
| QR/selfie camera capture UI | Done (employee); admin QR panel removed |
| Payslip PDF | Done |
| LLM assistant + careers portal | Conditional / Done |
| Full SSO + JIT | Done (IdP Conditional) |
| Unit tests + CI/CD | Done (24 tests + `ci.yml`) |

Still planned / polish:

- Enforce row-level filters on **all** list queries
- Redis session/cache wiring
- Native mobile app
- Full facial recognition
- Full XML-DSig SAML

---

*Last Updated: July 18, 2026*

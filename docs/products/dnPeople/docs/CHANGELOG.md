# dnPeople Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/).

---

## [2026-07-18] — Docs & inventory sync

### Changed
- Documentation aligned to current codebase: **49** frontend pages, **49** route modules, **99** Prisma models, **24** backend tests, package **1.0.0**
- Architecture rewritten for PRD v5–v6.1 (SSO+JIT implemented; discovery login; MFA; staff-accounts)

## Unreleased

### Added — PRD v7.0 attendance Excel manual import

- `/attendance` now includes an HR/Admin Excel attendance panel: template download, `.xlsx` upload, dry-run validation, summary/preview, confirm import, and recent upload history
- Backend adds `/attendance/template/download`, `/attendance/import`, and `/attendance/imports` with company isolation, role guard, 5 MB `.xlsx` validation, duplicate checks, all-or-nothing import, `MANUAL_UPLOAD` source marker, and audit log metadata
- Excel template contains `Attendance`, `Instructions`, and `Employee List` sheets with status dropdown and tenant employee references

### Added — PRD v6.1 seamless tenant discovery login

- `/auth/login` now discovers tenant automatically from verified email domain, custom hostname, or user history without requiring visible Company ID input
- Active SSO tenants return `status: "sso_required"` with provider start redirect; password tenants return `status: "success"` with dashboard redirect metadata
- Unresolved domains return `status: "company_not_found"` plus a company picker payload for rare fallback flows
- `/login` now shows only email/password, handles SSO redirects from the backend, and opens the fallback company picker only when discovery cannot resolve the tenant
- Login discovery, SSO redirect, success, and failure paths write tenant audit metadata without password/token payloads

### Added — Payroll admin payslip preview

- Company/Super Admin can open an inline payslip preview from `/payroll` for finalized or paid payroll records without downloading the PDF
- Preview groups earning/employer contribution and deduction components while preserving the existing password-protected PDF download for official archive/distribution

### Added — Central staff account administration

- Separate `/staff-accounts` navigation and administration page for company owners
- Tenant-scoped account list/search and standalone or employee-linked login creation
- HR/Manager/Finance/Employee role assignment, activation/deactivation, and password reset
- Generated temporary passwords are displayed once; administrator/self-protection and audit logging are enforced

### Added — Talent Development (PRD v4 Module 1–2 foundation)

- Mounted the previously-built but never-registered competency framework/library/role-mapping/assessment API (`/competency-frameworks`, `/competencies`, `/role-competencies`, `/competency-assessments`)
- Fixed employee self-service access: self-assessment, own gap analysis, and own draft submit/edit no longer require `talent:view`/`talent:assess` and work under `talent:self`
- New Individual Development Plan API (`/idps`) with idempotent auto-generation of goals from competency gaps, goal status tracking, and progress review that recomputes plan completion
- New basic LMS API (`/lms`) — course/program with ordered modules, self or manager-assigned enrollment, per-module completion tracking, automatic completion percentage/final score, certificate issuance, and personal transcript
- New frontend pages `/talent`, `/idp`, `/lms` and matching navigation entries

### Added — PRD completion hardening

- Employee lifecycle data: family, education, contacts, bank/tax information, status history, contract/probation review, and automatic permanent conversion
- Configurable payroll settings, templates, versioned tax rates, variable compensation, employer contributions, PTKP variants, BPJS, and gross/net/gross-up methods
- Landscape password-protected payslip with earning/deduction tables, detailed proration, branding, digital signature, and verification endpoint
- Server-side Excel/PDF exports for attendance, leave, payroll, bank upload, tax, and turnover analysis
- Digital recruitment offer acceptance/rejection with e-signature and automatic employee/onboarding creation
- Leave carry-forward/expiry processing, replacement assignment, persistent notification center, and browser notifications
- Daily database backup workflow, restore tooling, readiness probe, Prometheus metrics, and clean Prisma baseline migration
- First-class HR role without payroll access, audited employee account-role management, and role-aware navigation
- KPI achievement to pending payroll bonus generation with duplicate prevention
- CI database constraint verification and 1,000-concurrent-user performance gate
- Optional Sentry error tracking with credential, salary, NPWP, bank, cookie and token redaction

### Security

- AES-256-GCM field encryption with key rotation for salary, NPWP, and bank information; legacy migration script included
- Salary values are separated by RBAC and encrypted payloads are never returned by employee APIs
- Global mutation/sensitive-access audit middleware with redaction and CSV export
- PostgreSQL audit records are append-only through an update/delete prevention trigger
- Selfie attendance uses a provider-neutral liveness/face-match adapter and fails closed in production when no verifier is configured
- Attendance correction requires evidence and records original/corrected values plus approver in the audit trail
- Clock-out records early leave against company or assigned-shift schedule

### Verification

- Backend TypeScript and frontend TypeScript checks pass
- Backend automated suite passes 24/24 tests covering payroll, tax, proration, encryption, encrypted salary, signatures, RBAC, telemetry redaction, safe spreadsheet parsing/export, metrics, and biometric verification
- Prisma schema validation and client generation pass
- Production dependency audit passes with 0 known vulnerabilities after replacing vulnerable SheetJS/XLSX
- Load acceptance passes 5,000 requests at 1,000 logical concurrent users: 0 failures and p95 55.71 ms on the verification host

### Changed — Mobile-first frontend

- Application shell kini menggunakan mobile header dan navigation drawer pada layar kecil; sidebar tetap persisten di desktop
- Spacing konten, card, form, action row, dan grid disesuaikan secara responsif untuk viewport mobile
- Seluruh tabel aplikasi dapat digeser horizontal tanpa membuat halaman melebar
- Audit 17 tabel pada 16 halaman: tabel kembali memenuhi lebar card di desktop dan scroll tetap dibatasi pada area tabel di mobile
- Wrapper overflow ditambahkan pada tabel Dashboard dan Reports; aturan global `display: block` yang membuat tabel menyusut telah dihapus
- Target sentuh tombol utama diperbesar dan overflow horizontal global dicegah
- Halaman portal karier publik ikut dioptimalkan untuk layar kecil

### Validation

- Frontend TypeScript check lulus
- Next.js production build lulus untuk seluruh 49 route
- ESLint configuration diperbaiki; lint berjalan tanpa error
- Verifikasi ulang 12 Juli 2026: TypeScript, ESLint, dan production build 49 route lulus

---

## [0.4.0] — 2026-07-10

### Added — MVP 4 Enterprise

- Multi-company platform console (`/platform`) + organization links
- Custom workflows + advanced approval rules resolve
- API keys (`dnp_…`) with Bearer auth + integrations/webhooks
- SSO config (OAuth Google/Microsoft, SAML) + Google OAuth handshake + JIT
- Custom reports builder (save + run)
- AI document generator (HR letter templates)
- AI recruitment screening (single + batch)
- Row-level data access rules + effective scope (employees, attendance, leave)
- White-label company branding (incl. public endpoint)
- Frontend pages for all MVP 4 modules above

### Added — Polish (post-MVP core)

- Survey dedicated UI (`/surveys`)
- Local file upload (`POST /uploads`) + documents wiring
- Payslip PDF download
- Email notifications (SMTP / console fallback) on leave + payroll
- Public careers portal (`/careers`, `GET/POST /careers/...`)
- Attendance QR (daily office token) + selfie + GPS clock-in UI
- Login Google SSO callback (`?sso=` / `?sso_error=`)

### Added — MVP 4 complete

- Microsoft OAuth handshake + JIT
- SAML 2.0 AuthnRequest / ACS / SP metadata + JIT
- Row-level list filters: claims, loans, overtime, corrections, permissions, payroll
- LLM assistant (OpenAI-compatible) with rule-based fallback
- Optional S3/MinIO object storage for uploads

---

## [0.3.0] — 2026-07-10

### Added — MVP 3 Strategic HR

- Recruitment ATS (jobs, candidates, application pipeline)
- Onboarding plans with default checklist
- Performance cycles, reviews, KPI/OKR
- Training programs, enrollments, career paths
- Asset assign/return
- Resignation & offboarding (auto return assets)
- Company policies + disciplinary actions
- HR helpdesk tickets
- Rule-based AI HR assistant
- Advanced analytics report endpoint + UI cards
- Frontend pages for all MVP 3 modules

---

## [0.2.0] — 2026-07-10

### Added — MVP 2 Extended Operations

- Shift management & employee assignment
- Overtime (rate 1.5x/2x/3x) + payroll integration
- Reimbursement/claims + loan (kasbon) with payroll deduction
- Geofence attendance validation + check-in methods
- Attendance correction workflow
- Company documents + contract expiry reminders
- Announcements, surveys API, HR calendar, holidays
- Unified approval inbox + approval rules
- Advanced reports: turnover, overtime by dept, leave usage
- Frontend pages for all MVP 2 modules above

---

## [0.1.0] — 2026-07-10

### Added — MVP 1 scaffold

- Monorepo `backend/` + `frontend/` + `docker-compose.yml`
- Prisma schema: company, user, employee, org, attendance, leave, permissions, payroll, audit
- JWT auth, register company, RBAC 5 roles, account lockout
- API modules: employees, org, attendance, leave, permissions, payroll, dashboard, reports, audit
- Payroll Indonesia: BPJS Kesehatan, BPJS Ketenagakerjaan, PPh 21 (PTKP + progressive)
- Frontend: login, dashboard (admin/employee), karyawan, absensi, cuti, izin, payroll
- Seed demo: `admin@dnpeople.id` / `budi@dnpeople.id`
- Docs: PROJECT-OVERVIEW, ARCHITECTURE, API, DEPLOYMENT, IMPLEMENTATION-STATUS

### Notes

- Redis container reserved; belum dipakai di runtime
- Bukan fork dari `ERP/` (DN People ERP NestJS)

---

## Previous Unreleased Notes

### Docs
- Panduan koneksi Supabase (`docs/SUPABASE.md`) — default **tanpa Docker** + Session pooler
- Panduan instalasi VPS Nginx/PM2/TLS (`docs/VPS.md`)
- Quick start README / DEPLOYMENT mengutamakan Supabase `.env`

### Planned
- Survey dedicated UI page
- Binary file upload (S3/MinIO)
- QR/selfie camera capture UI
- Payslip PDF + email notifications
- LLM-powered assistant + public careers portal
- Full SSO IdP handshake + JIT provisioning
- Enforce row-level filters on all list queries
- Unit / integration tests + CI/CD

---

*Last Updated: July 11, 2026*

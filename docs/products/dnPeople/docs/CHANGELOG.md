# dnPeople Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/).

---

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

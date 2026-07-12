# dnPeople PRD/SRS/SDD Compliance Matrix

> Living implementation gate. A row is `Done` only when data model, API/service, UI, authorization/audit, and automated verification exist.

| PRD story / requirement | Status | Remaining completion gate |
|---|---|---|
| 1.1 Employee database | In progress | Contact/bank CRUD UI, location filter, integration tests |
| 1.2 Employee status tracking | In progress | Lifecycle schema/API/UI added; contract/probation scheduler tests pending |
| 2.1 Basic attendance | In progress | Early-leave detection and offline sync implemented; integration evidence pending |
| 2.2 Advanced attendance | In progress | Provider-neutral liveness/face-match with production fail-closed implemented; provider UAT pending |
| 2.3 Attendance correction | In progress | Evidence and before/after approval audit implemented; integration test pending |
| 2.4 Shift management | Partial | Scheduling-conflict enforcement and tests |
| 3.1 Leave request/approval | Partial | Expiration automation and notification coverage |
| 3.2 Permission management | Partial | Realtime/mobile notification delivery |
| 3.3 Leave calendar/report | Partial | Filters, peak analysis, export, replacement assignments |
| 4.1 Payroll setup | Partial | Tax/BPJS settings, templates, commission/bonus rules |
| 4.2 Monthly payroll | Partial | Breakdown tests and proration edge-case hardening |
| 4.3 Tax/BPJS compliance | Partial | Complete PTKP, annual reconciliation/export, versioned rates |
| 4.4 Payslip | Partial | E-signature, PDF password, 12-month portal, full branding |
| 4.5 Overtime/bonus | Partial | Bonus input/rules and KPI integration |
| 4.6 Claims | Partial | Category policy limits and receipt-required enforcement |
| 4.7 Employee loans | Partial | Affordability policy and simulation UI |
| 5.1 HR dashboard | Partial | Full breakdown, reminders, charts |
| 5.2 Attendance report | Partial | Employee/date filters, pattern analysis, Excel/PDF |
| 5.3 Payroll report | Partial | Components, tax/BPJS, department, bank/YTD exports |
| 5.4 Leave report | Partial | Peak/future analysis and Excel/PDF |
| 5.5 Turnover analysis | Partial | Department/reason/trend/predictive views |
| 6.1 RBAC | In progress | Salary separation implemented; complete access-matrix tests pending |
| 6.2 Security/privacy | In progress | Salary/NPWP/bank encryption, key rotation, backup/restore tooling implemented; production drills pending |
| 6.3 Audit/compliance | In progress | Redacted global audit, CSV export, and immutable DB trigger implemented; retention/export integration tests pending |
| 7.1 Recruitment | Partial | Bulk actions and offer workflow/document delivery |
| 7.2 Onboarding | Partial | E-sign, probation linkage, automatic conversion workflow |
| SRS testing | In progress | 13 backend unit/security tests pass; integration, system, performance, UAT evidence pending |
| SDD deployment/NFR | Partial | Backup, restore drill, metrics/Sentry, load test, scaling evidence |

## Mandatory completion evidence

- Prisma schema validates and deployment migration applies on a clean PostgreSQL database.
- Backend and frontend typecheck/build pass.
- Unit, integration, security, and performance suites pass in CI.
- Every PRD acceptance criterion is traceable to code and an automated or documented UAT check.
- Security controls include secret redaction, encryption/key rotation, audit retention/export, backup and restore drill.
- Documentation reflects observed behavior rather than planned status.

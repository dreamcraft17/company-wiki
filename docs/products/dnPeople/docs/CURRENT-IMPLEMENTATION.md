# dnPeople — Current Implementation Baseline

**Snapshot date:** 12 July 2026
**Purpose:** source baseline for the next PRD, SRS, roadmap, estimation, and gap analysis
**Specification baseline:** PRD/SRS/SDD v3.1

## How to use this document

When writing the next PRD:

1. Treat items under **Available now** as existing behavior that must remain backward compatible unless the PRD explicitly changes it.
2. Treat items under **Production/UAT gates** as implemented capabilities that still require environment-specific acceptance.
3. Treat items under **Not implemented / roadmap boundary** as new scope requiring product, design, engineering, security, migration, and test acceptance criteria.
4. Reference API and data behavior, not only page names. A UI mockup alone must not override payroll, audit, tenant, or RBAC invariants.

## Product and architecture baseline

| Area | Current implementation |
|------|------------------------|
| Product | Multi-tenant Indonesian HRIS covering employee lifecycle, HR operations, payroll, recruitment, strategic HR, and enterprise controls |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind; 44 production routes; mobile-first shell and locally scrollable data tables |
| Backend | Express 5 + TypeScript REST API under `/api/v1` |
| Data | PostgreSQL 16 + Prisma; deployment migrations are mandatory |
| Authentication | JWT, API key, TOTP MFA, Google/Microsoft OAuth, SAML configuration/JIT |
| Storage | Local upload or S3-compatible object storage |
| Email | SMTP with development fallback |
| Observability | `/health`, `/ready`, Prometheus `/metrics`, optional redacted Sentry telemetry |
| Deployment | VPS/container compatible, Nginx/PM2 guidance, daily database backup workflow |

## Roles and access boundary

| Role | Current access intent |
|------|-----------------------|
| `SUPER_ADMIN` | Platform-wide administration |
| `COMPANY_ADMIN` | Full administration within one company, including role assignment and payroll |
| `HR` | Employee lifecycle and HR operations without payroll/salary access |
| `MANAGER` | Department/team views and operational approvals; no payroll |
| `FINANCE` | Payroll, claims, loans, finance reports and related employee references |
| `EMPLOYEE` | Self-service records, requests, attendance, documents, payslips, training and helpdesk |

Row-level access supports `all`, `department`, `self`, and `custom` scopes. Company isolation and employee ownership checks are backend requirements; hiding navigation is not considered authorization.

## Available now

### Core employee lifecycle

- Company, department, position, level, work location, manager hierarchy and organization tree.
- Employee CRUD/import with department, position, location, employment type, contract and probation filters.
- Family, dependants, education, regular/emergency contacts, tax information and bank accounts.
- Status history, contract transition, probation review, reminders and approved conversion to permanent.
- Audited employee account creation and role assignment; random temporary password is displayed once.
- Salary, NPWP and account number stored using AES-256-GCM field encryption with key rotation support.

### Attendance, shift, leave and permission

- Manual, GPS/geofence, QR, selfie/liveness-provider and office-WiFi clock-in.
- Clock-out, work mode, lateness, early-leave marker, offline queue and synchronization.
- Attendance correction with mandatory evidence, approval, bulk operations and before/after audit.
- Shift CRUD, one assignment per employee/day, active-company validation, rotation, swap approval and pay multiplier.
- Leave type/balance, paid/unpaid leave, automatic sick-leave policy, overlap/balance validation and approval.
- Carry-forward, expiry scheduler, annual processing, colleague replacement and handover acknowledgement.
- Permission workflows for late arrival, early leave, WFH, business trip and other reasons.
- Persistent notification center, browser notifications and email notifications for supported workflows.

### Payroll and employee finance

- Salary components, employee components and department/position payroll templates.
- Idempotent template application with component effective dates.
- Configurable BPJS health/JHT/JP employee and employer rates/caps.
- Versioned PTKP/tax brackets and `GROSS`, `NET`, `GROSS_UP` tax methods.
- Monthly payroll using attendance, unpaid leave, overtime, shift premium, claims, loans and variable compensation.
- Mid-period join/exit proration with explicit divisor, eligible days and full-month cap.
- THR, bonus, commission and KPI-to-pending-payroll-bonus generation.
- Claim category limits, daily/monthly policies and mandatory receipt rules.
- Loan simulation, affordability/active-loan validation, Manager/Finance approval and payroll deduction.
- Landscape password-protected payslip with earning/deduction tables, branding, proration explanation and tamper-evident signature verification.
- Employee payslip portal and payroll, tax, bank upload and YTD reporting.

### Recruitment, onboarding and strategic HR

- Job postings, public career pages, candidate application/CV upload and ATS pipeline.
- Candidate screening/ranking, bulk status communication and interview data.
- Digital offer creation, public accept/reject, consent/signature evidence and automatic employee/onboarding creation.
- Onboarding plans/checklists for documents, training, equipment, culture and probation; task ownership is plan-scoped.
- Performance cycles, self/manager reviews, KPI/OKR tracking and payroll bonus handoff.
- Training programs/enrolment, career paths, asset assignment/return, policies and disciplinary actions.
- Resignation/offboarding, helpdesk, surveys/polls, announcements, HR calendar and AI assistant/document helpers.

### Dashboard, reporting and enterprise

- Role-aware dashboards with headcount, attendance, approvals, contracts, birthdays and payroll status.
- Attendance, leave, payroll and turnover detail/analysis with safe Excel and PDF export.
- Multi-company platform console and organization links.
- API keys, webhooks/integration configuration, custom approval workflows and custom reports.
- White-label branding, SSO configuration and row-level data access rules.
- Mobile navigation drawer; notification and logout actions are in the right-side header/navbar, not the sidebar.

## Security, compliance and NFR invariants

The next PRD must preserve these unless it supplies an explicit replacement and migration plan:

- No plaintext salary, NPWP, account number, password, token, secret or API key in API logs/telemetry.
- HR cannot access payroll or salary; Finance cannot mutate employee master data without an explicit new permission.
- Audit records are append-only at PostgreSQL level and sensitive audit payloads are redacted.
- Attendance correction evidence is mandatory at API and database levels.
- Selfie attendance fails closed in production when a biometric verifier is not configured.
- Spreadsheet input/output must resist formula injection and known vulnerable parsers must not be reintroduced.
- Liveness remains independent of database readiness; readiness verifies database connectivity.
- Production dependency audit currently reports zero known runtime vulnerabilities.
- CI gates TypeScript, backend tests, clean migration, DB controls and load performance.

Current automated evidence: 21/21 backend tests pass; frontend production build covers 44 routes; acceptance load profile uses 5,000 requests and 1,000 logical concurrent users with a p95 threshold below two seconds.

## Production/UAT gates

These are not safe to mark “production accepted” solely from repository code:

- Biometric provider selection, consent, retention, false-match and liveness UAT.
- SAML identity-provider metadata/signature interoperability per customer.
- SMTP deliverability, sender reputation and bounce handling.
- Object-storage lifecycle, malware scanning/CDN policy and regional residency.
- Sentry project delivery and final payload review.
- Encryption-key rotation and legacy sensitive-field migration drill.
- Backup restore drill with measured RPO/RTO.
- Bank file/API acceptance by each target bank and accounting integration acceptance.
- Authenticated database-heavy load test against production-sized data and chosen database tier.
- Signed browser UAT by HR, Manager, Finance and Employee representatives.

## Not implemented / roadmap boundary

- Native iOS/Android application; current delivery is mobile-first web.
- A specific production biometric vendor contract/model; only the adapter and enforcement contract exist.
- Direct production bank transfer execution; current implementation provides reconciliation/bank-upload data.
- Full accounting ledger posting to a named accounting provider.
- Government submission directly to DJP/BPJS provider APIs.
- Legally certified third-party e-sign provider; current signatures are consent-based and tamper-evident.
- Guaranteed 99.9% SLA without production infrastructure, monitoring, incident response and support operations.
- Fully automated predictive HR decisions; turnover risk is heuristic and must remain human-reviewed.

## Requirements for the next PRD

Every new or changed story should state:

- affected roles, row scope and salary/PII visibility;
- tenant isolation and audit before/after requirements;
- data model, effective dating, migration/backfill and rollback behavior;
- API contract, UI states, mobile behavior and export implications;
- payroll/tax/BPJS/proration impact where relevant;
- notification channels, idempotency and retry behavior;
- security threats, retention/consent, encryption and redaction;
- unit, integration, browser UAT and performance acceptance evidence;
- production provider/deployment dependencies and operational owner.

## Source references

- [Implementation status](./IMPLEMENTATION-STATUS.md)
- [PRD compliance matrix](./PRD-COMPLIANCE-MATRIX.md)
- [Security & NFR evidence](./SECURITY-NFR-EVIDENCE.md)
- [API reference](./API.md)
- [Architecture](./ARCHITECTURE.md)
- [Deployment](./DEPLOYMENT.md)
- Specifications: `company-wiki/docs/products/dnPeople/PRD/`

# dnPeople — Current Implementation Baseline

| Metadata | Value |
|----------|-------|
| Snapshot date | 22 July 2026 |
| HEAD | `90cdf08` |
| Purpose | **Baseline** after PRD v11.1 landing page + pricing SSOT |
| Specification baseline | PRD/SRS/SDD v3.1 through **v11.1** complete in repo; **v4 Module 3–8** = primary greenfield scope |
| Owner | Dozer (CEO + Tech Lead) |
| Company | DN Tech (PT. Dozer Napitupulu Technology) |
| Brand | DnPeople |
| Updated at | July 22, 2026 |

> **PRD v11.1 (22 Jul 2026):** Full marketing landing at `/welcome` (hero, features, pricing, FAQ, beta signup, JSON-LD, `/legal/dpa`). Pricing cards share `frontend/src/lib/subscriptionCatalog.ts` with in-app `/billing` — Gratis, Rp20.000/25.000 per karyawan, Business 301+, Enterprise 500+ (PRD v5 tier matrix). External gates (Convertkit/Zapier, demo video URL, DNS, GA4) remain Conditional.

> **PRD v11.0:** Marketing routes, lead capture API, Datadog-ready metrics, k6 suite, launch runbooks. Go-live gates (Datadog account, pen-test, DNS, beta UAT) remain Conditional until 1 Aug 2026 launch window.

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
| Frontend | Next.js 16.2.9, React 19.2.4, TypeScript, Tailwind; **~61** production routes (marketing `/welcome` `/pricing` `/faq` `/contact` `/about` `/demo` `/blog/*`, `/legal/*`, app routes); mobile-first shell |
| Backend | Express 5 + TypeScript REST API under `/api/v1`; **~53** route modules plus tenant-scoped SCIM `/scim/v2` |
| Data | PostgreSQL 16 + Prisma 6 with **102** models; deployment migrations are mandatory |
| Authentication | JWT via httpOnly cookie `dnpeople_session` (+ sessionStorage Bearer); API key enforced scopes; TOTP MFA; tenant discovery; SSO cookie (no JWT in URL); frontend auto-redirects expired/invalid sessions to `/login`; **forgot/reset password (1h)** |
| Storage | Local or S3; files via authenticated `GET /api/v1/files/...`; upload magic-byte + MIME |
| Email | SMTP + email outbox retry queue |
| Observability | `/alive`, `/health` (version/uptime), `/ready` (checks), Prometheus `/metrics` (histogram, rate_limit, payroll_jobs, payment_webhook_*, postgresql_connections, attendance_records_today); optional Sentry; Datadog agent script + compose stub in `ops/datadog/` |
| Ops artefacts | Backup verify + restore-drill (integrity SQL), k6 baseline/ramp/spike/stress, smoke-test, alert-rules + incident/launch runbooks; legal Privacy/Terms/DPA templates; launch gate + SLA docs |
| Privacy | `GET /api/v1/privacy/export`, deletion-request, processors list |
| Marketing | Public site at `/welcome` (LandingPage sections, sticky mobile CTA, FAQ accordion) + `/pricing` `/faq` `/contact` `/about` `/demo` `/blog` `/legal/dpa`; tier pricing via `subscriptionCatalog.ts` (mirrors backend `TIER_PRICE_PER_EMPLOYEE` + PRD v5 headcount); `POST /api/v1/public/leads` and `/beta-interest`; optional GA4 (`NEXT_PUBLIC_GA_ID`), Zapier webhook, Calendly, demo video env |
| Deployment | VPS/container; Redis removed; `/` redirects to `/welcome` for anonymous visitors |
| Automated evidence | Backend **32/32** unit tests; TypeScript clean |

## Roles and access boundary

| Role | Current access intent |
|------|-----------------------|
| `SUPER_ADMIN` | Platform-wide administration |
| `COMPANY_ADMIN` | Full administration within one company, including role assignment and payroll |
| `HR` | Employee lifecycle and HR operations without payroll/salary access |
| `MANAGER` | Department/team views and operational approvals; no payroll |
| `FINANCE` | Payroll, claims, loans, finance reports and related employee references |
| `EMPLOYEE` | Self-service records, requests, attendance, documents, payslips (`/payroll` nav + `/payroll/my`), training and helpdesk, plus self competency assessment/gap analysis, own IDP, and LMS enrollment; MFA via `/settings/mfa` |

Row-level access supports `all`, `organization`, `department`, `location`, `self`, and `custom` scopes. Company isolation and employee ownership checks are backend requirements; hiding navigation is not considered authorization.

## Login and tenant discovery baseline

The login surface is intentionally minimal for end users. `/login` asks for email and password only;
Company ID is not a normal input. `/auth/login` performs server-side tenant discovery in this order:

1. Verified email domain from `Company.verifiedDomains`.
2. Verified custom hostname from tenant branding metadata.
3. Existing active user history for the submitted email.
4. Fallback company picker payload when no tenant can be resolved.

Current `/auth/login` response modes:

| Mode | Trigger | Response intent |
|------|---------|-----------------|
| `success` | Tenant resolved and no active SSO policy | Return JWT, user payload, and `/dashboard` redirect metadata |
| `mfa_required` | Password valid and user MFA is enabled | Return pending MFA token; final token is issued after MFA verification |
| `sso_required` | Tenant has active SSO policy | Return IdP start redirect and provider metadata |
| `company_not_found` | Discovery cannot resolve a tenant | Return picker-safe company list; frontend retries login with selected `companyId` |

Login audit records store tenant discovery method, email domain, provider/reason metadata, and
blocked state only. Passwords, JWTs, raw IdP payloads, client secrets, and temporary passwords must
never be written to audit logs or telemetry.

Frontend session handling is fail-closed: when any authenticated page receives `401`, `UNAUTHORIZED`,
`Authentication required`, `invalid token`, or `jwt expired` from API helpers or manual `fetch()` calls,
the web shell clears cached auth state and redirects to `/login?reason=session_expired` while preserving
the attempted path in `next`.

## Available now

### Feature inventory by module

| Module | Available features | Main API surface | Web UI | Status |
|--------|--------------------|------------------|--------|--------|
| Authentication | Login without Company ID, verified-domain/user-history/custom-domain tenant discovery, SSO/password auto-routing, company picker fallback, registration, current session, account lockout, TOTP MFA + QR, Google/Microsoft OAuth, SAML/JIT, API-key with enforced scopes, httpOnly session cookie | `/auth`, `/sso`, `/tenants/discover`, `/integrations/api-keys` | `/login`, `/sso`, `/integrations`, `/settings/mfa` | Available |
| Company & organization | Company profile/work schedule, departments, positions, levels, work locations, geofence, WiFi SSID, organization tree | `/companies`, `/org` | `/org` | Available |
| Employee master | CRUD, search, pagination, Excel/CSV import, department/position/location/type/status filters, soft delete | `/employees` | `/employees` | Available |
| Employee lifecycle | Family, dependant, education, emergency contact, bank, tax, contract/probation dates, status history, probation review | `/employees/:id/*` | Employee lifecycle panel | Available |
| Account & roles | Central account list/search, standalone or linked account creation, HR/Manager/Finance/Employee role, activation, reset password, one-time temporary password, audited changes | `/staff-accounts`, `/employees/:id/access` | `/staff-accounts`, employee lifecycle panel | Available |
| Enterprise tenant administration | POOL/SILO/BRIDGE policy, tenant discovery, organization units, scoped roles, quota/usage and isolation audit | `/tenants` | `/tenant-management` | Available; physical SILO provisioning is operational |
| SCIM provisioning | Tenant-token-scoped Users and Groups provisioning/deactivation | `/scim/v2/:tenantId` | IdP integration | Available; IdP conformance UAT required |
| Attendance | Clock-in/out, manual/GPS/QR/selfie/WiFi, geofence, work mode, late/early leave, today/history/summary, offline sync (fill-empty), Excel template/dry-run/confirm import with Idempotency-Key and import history | `/attendance` | `/attendance` | Available |
| Attendance correction | Mandatory evidence, original/corrected values, submit, approve/reject, bulk correction/approval | `/corrections` | `/corrections` | Available |
| Shift | Shift CRUD, daily assignment, company/employee validation, rotation, swap request/approval, pay multiplier | `/shifts` | `/shifts` | Available |
| Leave | Types, balances, request, overlap/balance validation, approval, auto-sick policy, carry-forward/expiry, replacement/handover | `/leave` | `/leave` | Available |
| Permission | Late arrival, early leave, WFH, business trip/other request, approval and attendance synchronization | `/permissions` | `/permissions` | Available |
| Approval inbox | Consolidated leave, permission, overtime, correction, claim and loan approvals with role/department scope | `/approvals` | `/approvals` | Available |
| Payroll configuration | Tax methods, BPJS/JHT/JP rates/caps, working-day divisor, overtime policy, loan ratio, claim policy | `/payroll-settings/configuration` | `/payroll-settings` | Available |
| Salary components/templates | Earnings, deductions, employer contributions, effective-dated employee items, department/position templates | `/payroll-settings/components`, `/templates` | `/payroll-settings` | Available |
| Payroll processing | Batched monthly calculation (OT/claims/loans/variables/attendance/leave/shift), preview/detail, atomic finalize (idempotent if already FINALIZED), paid status, admin + employee payslip preview | `/payroll` | `/payroll` | Available |
| Tax & BPJS | Complete PTKP variants, progressive/versioned tax brackets, gross/net/gross-up, employee/employer contribution breakdown | `/payroll-settings/tax-rates`, `/payroll` | `/payroll-settings`, `/payroll` | Available |
| Proration & THR | Join/exit proration, configurable divisor, eligible-day explanation, full-month cap, annual THR generation | `/payroll`, `/payroll/thr/run` | `/payroll` | Available |
| Payslip | 12-month employee portal, in-app preview, landscape password PDF (auth + `PAYSLIP_DOWNLOAD` audit), signed link TTL 24h, branding, proration, signature verification | `/payroll/my`, `/payroll/:id/payslip.pdf`, `/payroll/:id/payslip-link`, `/payroll/signed-payslip/:token`, `/payroll/verify/:payslipId` | `/payroll` | Available |
| Overtime | Employee request, configurable weekday/weekend/holiday multiplier, approval, automatic payroll inclusion | `/overtime` | `/overtime` | Available |
| Variable compensation | Bonus, commission, KPI bonus, approval, pay-period assignment and paid tracking | `/payroll-settings/variable-compensations` | `/payroll-settings` | Available |
| Claims | Categories, receipt upload/enforcement, daily/monthly limits, multi-step approval and payroll inclusion | `/claims` | `/claims` | Available |
| Employee loans | Simulation, affordability ratio, one-active-loan policy, Manager/Finance approval, installments/payroll deduction | `/loans` | `/loans` | Available |
| Dashboard | Role-aware headcount, department/type/status breakdowns, attendance, pending approvals, payroll, contract/probation and birthdays | `/dashboard` | `/dashboard` | Available |
| Reports | Attendance/leave/payroll detail, pattern/peak analysis, turnover trend/risk, Excel/PDF (1000-row cap), async bank/tax export jobs with poll/download UI, email when ready | `/reports`, `/reports/jobs*` | `/reports` | Available |
| Recruitment/ATS | Jobs, public publication, online application/CV, candidates, ranking, pipeline, interviews, bulk communication | `/recruitment`, `/careers` | `/recruitment`, `/careers` | Available |
| Digital offer | Offer creation/delivery, expiry, public view, accept/reject, consent signature, tamper evidence, auto-hire | `/recruitment`, `/careers/offer/:token` | `/recruitment`, `/careers/offer/:token` | Available |
| Onboarding | Auto/default/custom plans, document/training/equipment/culture/probation tasks, buddy, scoped completion | `/onboarding` | `/onboarding` | Available |
| Performance & KPI | Cycles, generated reviews, self/manager/final score, KPI/OKR progress, idempotent KPI bonus generation | `/performance` | `/performance` | Available |
| Training & career | Programs, enrollments/completion and career-path records | `/training` | `/training` | Available |
| Assets | Asset inventory, assignment, return and offboarding return support | `/assets` | `/assets` | Available |
| Offboarding | Resignation request/approval/completion and asset-return workflow | `/offboarding` | `/offboarding` | Available |
| Documents | Company/employee documents, version metadata, upload/download (auth file route) and contract reminders | `/documents`, `/uploads`, `/files` | `/documents` | Available |
| Policy & discipline | Company policies, publication/acknowledgement-related records and disciplinary actions | `/policies` | `/policies` | Available |
| Helpdesk | Employee ticket, assignment, status and resolution workflow | `/helpdesk` | `/helpdesk` | Available |
| Communication | Announcements, surveys, polls, HR calendar/holidays, persistent/email/browser notifications | `/announcements`, `/surveys`, `/calendar`, `/notifications` | Matching pages + header notification center | Available |
| AI helpers | HR assistant with LLM/rule fallback, HR document generation and recruitment screening | `/assistant`, `/ai` | `/assistant`, `/ai-docs`, `/recruitment` | Available with provider configuration |
| Workflow engine | Module-specific multi-step workflows, approval rules, amount/role resolution and activation | `/workflows`, `/approvals/rules` | `/workflows`, `/approvals` | Available |
| Multi-company platform | Company console, organization tree/links and platform visibility | `/platform` | `/platform` | Available |
| Subscription & billing | Tier catalog, invoices, upgrade/cancel/reactivate, feature gating, grace/freeze | `/subscription` | `/billing` | Available; payment provider Conditional |
| Tenant management | Isolation policy, org units, quota, SCIM tokens, tenant audit | `/tenants` | `/tenant-management` | Available |
| Staff accounts | Standalone/linked login create, role, activate, password reset | `/staff-accounts` | `/staff-accounts` | Available |
| Integrations | Scoped API keys, webhook/custom integrations, test delivery and synchronization status | `/integrations` | `/integrations` | Available framework |
| Branding | App name, logo, colors and public company branding | `/branding` | `/branding` | Available |
| Custom reports | Source definitions, saved report configuration and report execution | `/custom-reports` | `/custom-reports` | Available |
| Security administration | Row-level rules, effective-scope inspection, audit filters/export and MFA controls (`/settings/mfa`) | `/security`, `/audit`, `/auth/mfa` | `/security` → `/settings/mfa`, `/audit` | Available |
| Operations/NFR | Health/readiness, Prometheus, Sentry, backup/restore, clean migrations, DB verification and load-test CI | `/health`, `/ready`, `/metrics` | Operational tooling | Available; production acceptance required |
| Competency framework & assessment | Framework/competency library with versioning, role-competency mapping, self/manager/peer/360 assessment, submit/approve workflow, gap analysis, bulk import | `/competency-frameworks`, `/competencies`, `/role-competencies`, `/competency-assessments` | `/talent` | Available (PRD v4 Module 1) |
| Individual Development Plan (IDP) | IDP CRUD, idempotent auto-generate goals from competency gap, goal tracking, progress review | `/idps` | `/idp` | Available (PRD v4 Module 2) |
| Learning Management System (LMS) | Course/program + module CRUD, self/manager enrollment, module completion tracking, automatic certificate, transcript | `/lms` | `/lms` | Available (PRD v4 Module 2, basic) |

### Core employee lifecycle

- Company, department, position, level, work location, manager hierarchy and organization tree.
- Employee CRUD/import with department, position, location, employment type, contract and probation filters.
- Family, dependants, education, regular/emergency contacts, tax information and bank accounts.
- Status history, contract transition, probation review, reminders and approved conversion to permanent.
- Central tenant-scoped staff account administration plus employee-linked account creation, activation, role assignment, and password reset; generated temporary passwords are displayed once.
- Salary, NPWP and account number stored using AES-256-GCM field encryption with key rotation support.

### Attendance, shift, leave and permission

- Manual, GPS/geofence, QR, selfie/liveness-provider and office-WiFi clock-in.
- Clock-out, work mode, lateness, early-leave marker, offline queue and synchronization.
- PRD v7.0 Excel/manual attendance flow for SUPER_ADMIN, COMPANY_ADMIN and HR: admin attendance UI is Excel-first, with server-generated `.xlsx` template, employee list/instructions, upload dry-run validation, preview summary, all-or-nothing confirmed import, `MANUAL_UPLOAD` source marker and audit-backed recent upload history. Legacy QR/mobile attendance APIs remain available for compatibility but are not the primary admin UI.
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
- Monthly payroll using attendance, unpaid leave, overtime, shift premium, claims, loans and variable compensation — **batched** queries (PRD v8.0 P01), not N+1 per employee.
- Mid-period join/exit proration with explicit divisor, eligible days and full-month cap.
- THR, bonus, commission and KPI-to-pending-payroll-bonus generation.
- Claim category limits, daily/monthly policies and mandatory receipt rules.
- Loan simulation, affordability/active-loan validation, Manager/Finance approval and payroll deduction.
- **Atomic finalize** claims `DRAFT` rows via `updateMany` in a transaction; concurrent finalize conflicts; already-`FINALIZED` is idempotent HTTP 200.
- In-app payslip preview for Company/Super Admin **and** employees (own slips); landscape password-protected PDF with earning/deduction tables, branding, proration explanation and tamper-evident signature verification; authenticated download audited as `PAYSLIP_DOWNLOAD`.
- **Signed payslip URLs** (24h TTL) for shareable download without long-lived session in the link.
- Employee payslip portal; payroll/tax/bank/YTD reporting with **1000-row export caps** and **async report jobs** (`ReportExportJob`) with UI poll/download and email-outbox notification.
### Recruitment, onboarding and strategic HR

- Job postings, public career pages, candidate application/CV upload and ATS pipeline.
- Candidate screening/ranking, bulk status communication and interview data.
- Digital offer creation, public accept/reject, consent/signature evidence and automatic employee/onboarding creation.
- Onboarding plans/checklists for documents, training, equipment, culture and probation; task ownership is plan-scoped.
- Performance cycles, self/manager reviews, KPI/OKR tracking and payroll bonus handoff.
- Training programs/enrolment, career paths, asset assignment/return, policies and disciplinary actions.
- Resignation/offboarding, helpdesk, surveys/polls, announcements, HR calendar and AI assistant/document helpers.

### Talent development (PRD v4 foundation)

- Competency framework versioning (`new-version` clones competencies + role mappings), competency library with proficiency-level JSON, Excel/CSV bulk import.
- Role-competency mapping with required level, importance weighting and development-priority flag.
- Self/manager/peer/360 competency assessment with draft/submit/approve lifecycle; employees can self-assess and view their own gap analysis (`talent:self` scope), managers/HR/admin see team-wide data (`talent:view`/`talent:*`).
- Gap analysis is priority-ranked (`gap × importanceWeight`) and reused to auto-generate IDP goals.
- IDP creation with idempotent auto-generation of goals from the top competency gaps for an employee's position, goal status/progress tracking, and periodic review that recomputes plan completion.
- LMS course/program with ordered modules, self-enroll or manager-assigned enrollment, per-module completion, automatic completion percentage/final score, certificate code and expiry, and a personal transcript endpoint.
- Not yet built: 9-box matrix, succession planning, internal career marketplace/rotation programs, earned wage access, salary benchmarking, and manufacturing/retail vertical packages — these remain PRD v4 roadmap items (Q4 2026 and later).

### Dashboard, reporting and enterprise

- Role-aware dashboards with headcount, attendance, approvals, contracts, birthdays and payroll status.
- Attendance, leave, payroll and turnover detail/analysis with safe Excel and PDF export.
- Multi-company platform console and organization links.
- API keys, webhooks/integration configuration, custom approval workflows and custom reports.
- White-label branding, SSO configuration and row-level data access rules.
- Mobile navigation drawer; notification and logout actions are in the right-side header/navbar, not the sidebar.
- PRD v6 adds verified-domain tenant discovery, POOL/SILO/BRIDGE control-plane policy,
  per-tenant SSO/JIT configuration, organization hierarchy, user-specific organization/department/
  location scopes, tenant-scoped SCIM Users/Groups, quota/usage monitoring, isolation breach audit,
  custom-domain branding metadata, and `/tenant-management`.
- PRD v6.1 refines login UX: end users enter only email and password; backend discovers the
  tenant automatically from verified domain, custom hostname, or user history, routes active-SSO
  tenants to the IdP, validates password tenants directly, and shows a company picker only when
  tenant discovery cannot resolve the company.

## Security, compliance and NFR invariants

The next PRD must preserve these unless it supplies an explicit replacement and migration plan:

- No plaintext salary, NPWP, account number, password, token, secret or API key in API logs/telemetry.
- Generated staff temporary passwords are returned only on creation/reset and never written to audit payloads.
- Company/Super Admin accounts and the acting admin account cannot be modified through staff-account administration.
- HR cannot access payroll or salary; Finance cannot mutate employee master data without an explicit new permission.
- Audit records are append-only at PostgreSQL level and sensitive audit payloads are redacted.
- Attendance correction evidence is mandatory at API and database levels.
- Selfie attendance fails closed in production when a biometric verifier is not configured.
- Spreadsheet input/output must resist formula injection and known vulnerable parsers must not be reintroduced.
- Liveness remains independent of database readiness; readiness verifies database connectivity.
- Production dependency audit currently reports zero known runtime vulnerabilities.
- CI gates TypeScript, backend tests, clean migration, DB controls and load performance.

Current recorded automated evidence: **32/32** backend tests pass; frontend **61** pages; backend **53** route modules; Prisma **102** models. Re-run build and test suites before treating figures as release evidence.

## Suggested scope for PRD v12+ (from this baseline)

| Priority | Theme | Source | Notes |
|----------|-------|--------|-------|
| **P0 product** | PRD v4 Module 3 — 9-box + succession | [PRD v4 competitive](./PRD/dnpeople-prd-v4-competitive.md) | Models partially exist; UI/workflows not built |
| **P1 product** | PRD v4 Module 4 — internal career marketplace | PRD v4 | Roadmap |
| **P1 product** | PRD v4 Modules 5–6 — EWA + salary benchmarking | PRD v4 | External data/providers Conditional |
| **P2 product** | PRD v4 Modules 7–8 — manufacturing/retail verticals | PRD v4 | Configuration packages |
| **P0 ops** | External go-live gates (PRD v11.0) | [LAUNCH-GATE-CHECKLIST.md](./LAUNCH-GATE-CHECKLIST.md) | Datadog live, pen-test sign-off, DNS dnpeople.id, beta UAT |
| **Out of scope** | Re-implementing MVP 1–5 core HR | This doc § Available now | Backward-compat unless PRD explicitly changes |

## Audit remediation (PRD v8.0) — Jul 18–19, 2026

Full detail: [AUDIT-FEATURE-BUG-PERFORMANCE.md](./AUDIT-FEATURE-BUG-PERFORMANCE.md) · Spec: [PRD/dnpeople-prd-v8.0-security-stability-fixes-id.md](./PRD/dnpeople-prd-v8.0-security-stability-fixes-id.md).

| ID | Sev | Summary | Status |
|----|-----|---------|--------|
| B01 | P0 | Public `/uploads` static — payslips may be guessable | **Fixed** — auth file route + payslip PDF audit |
| B02 | P0 | API key scopes not enforced (always COMPANY_ADMIN) | **Fixed** — scope assert; `resource:*` required for wildcard action |
| B03 | P0 | Payroll finalize race can double-apply loan installments | **Fixed** — atomic `updateMany` claim; re-finalize → 200 |
| P01 | P0 | Payroll run N+1 queries per employee | **Fixed** — batched OT/claims/loans/variables + attendance/leave/shift |
| B04 | P1 | Employee nav hides payslip portal | **Fixed** — Slip Gaji nav for all + employee preview |
| B05 | P1 | MFA UI admin-only | **Fixed** — `/settings/mfa` + QR; `/security` redirects |
| B06–B08 | P1 | Import concurrency, offline-sync race, upload MIME spoof | **Fixed** — Idempotency-Key / file hash; fill-empty sync; magic bytes |
| P02 | P1 | Unbounded report exports | **Fixed** — 1000-row cap + async jobs + stream XLSX |
| P2 | — | Cookie session, email outbox, signed payslip, indexes, Alert UI, Redis removal | **Fixed** — Jul 19 commits |

Ops UAT gates below remain required before production-accepted.

## PRD v9.0 / v10.0 — launch readiness (repo)

| Area | Status |
|------|--------|
| Tenant daily API hard-limit (10k) + RPM | **Done** in `authenticate` |
| Password reset 1h + billing pay-now + OpenAPI | **Done** (v9.0) |
| `/alive` `/health` `/ready` enriched metrics | **Done** (v10.0) |
| Backup verify + restore-drill + k6 auth script | **Done** (scripts) |
| Privacy export + legal templates + incident plan | **Done** (docs + API) |
| Marketing `/welcome` MVP | **Done** — v11.1 full landing; DNS Conditional |
| Datadog/PagerDuty live accounts | **Conditional** (ops) |
| Signed restore drill + external pen-test | **Conditional** (ops) |

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
- 9-box talent matrix and succession planning/readiness scoring (PRD v4 Module 3).
- Internal career marketplace, rotation and cross-functional mobility programs (PRD v4 Module 4).
- Earned wage access (EWA) and salary benchmarking against external market data (PRD v4 Modules 5–6).
- Manufacturing/retail vertical configuration packages — complex shift incentives, tips/service charge handling, high-volume hiring flows (PRD v4 Modules 7–8).
- Physical SILO database provisioning, tenant data copy/cutover, secret rotation, restore drill, and failback remain infrastructure operations; selecting SILO policy alone is not proof of physical isolation.

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

- [Feature / bug / performance audit (18 Jul 2026)](./AUDIT-FEATURE-BUG-PERFORMANCE.md)
- [Complete feature catalog](./FEATURE-CATALOG.md)
- [Implementation status](./IMPLEMENTATION-STATUS.md)
- [PRD compliance matrix](./PRD-COMPLIANCE-MATRIX.md)
- [Security & NFR evidence](./SECURITY-NFR-EVIDENCE.md)
- [API reference](./API.md)
- [Architecture](./ARCHITECTURE.md)
- [Deployment](./DEPLOYMENT.md)
- Specifications: `company-wiki/docs/products/dnPeople/PRD/`

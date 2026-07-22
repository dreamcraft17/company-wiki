# dnPeople PRD/SRS/SDD Compliance Matrix

> Living implementation gate. A row is `Done` only when data model, API/service, UI, authorization/audit, and automated verification exist.

| PRD story / requirement | Status | Remaining completion gate |
|---|---|---|
| 1.1 Employee database | Implemented | Contact/bank/tax/family/education UI, filters, encrypted salary, and account-role management implemented; API integration evidence pending |
| 1.2 Employee status tracking | Implemented | Lifecycle schema/API/UI, reminders, probation review and auto-conversion implemented; scheduler integration test pending |
| 2.1 Basic attendance | In progress | Early-leave detection and offline sync implemented; integration evidence pending |
| 2.2 Advanced attendance | In progress | Provider-neutral liveness/face-match with production fail-closed implemented; provider UAT pending |
| 2.3 Attendance correction | In progress | Evidence and before/after approval audit implemented; integration test pending |
| 2.4 Shift management | Implemented | Unique daily assignment, tenant/active-employee validation, rotation, swap approval and pay differential implemented; route integration test pending |
| 3.1 Leave request/approval | Implemented | Balance checks, approval, auto-sick policy, carry-forward/expiry scheduler and notifications implemented |
| 3.2 Permission management | Implemented | Approval, attendance sync, persistent/browser notifications implemented; native push remains mobile-app scope |
| 3.3 Leave calendar/report | Implemented | Filters, peak analysis, Excel/PDF and replacement/coverage assignment implemented |
| 4.1 Payroll setup | Implemented | Tax/BPJS settings, idempotent templates, versioned rates, bonus/commission implemented |
| 4.2 Monthly payroll | Implemented | Attendance/leave/overtime/claim/loan/variable compensation and proration implemented with unit tests |
| 4.3 Tax/BPJS compliance | Implemented | Complete PTKP, versioned rates, annual/YTD and tax exports implemented |
| 4.4 Payslip | Implemented | Landscape table PDF, password, 12-month portal, branding and signature verification implemented |
| 4.5 Overtime/bonus | Implemented | Configurable overtime, bonus/commission and idempotent KPI-to-payroll bonus workflow implemented |
| 4.6 Claims | Implemented | Per-category daily/monthly limits and receipt-required enforcement implemented |
| 4.7 Employee loans | Implemented | Affordability, active-loan policy, simulation UI and dual approval implemented |
| 5.1 HR dashboard | Implemented | Headcount breakdown, attendance, approvals, contracts and birthdays implemented |
| 5.2 Attendance report | Implemented | Employee/date filters, patterns and Excel/PDF implemented |
| 5.3 Payroll report | Implemented | Component/tax/BPJS/department detail, bank upload and YTD exports implemented |
| 5.4 Leave report | Implemented | Peak/future analysis and Excel/PDF implemented |
| 5.5 Turnover analysis | Implemented | Department/reason/trend and heuristic risk views implemented |
| 6.1 RBAC | Implemented | HR role without payroll, Finance payroll access, centralized staff-account role/status/password workflow, salary separation and automated access-matrix tests implemented |
| 6.2 Security/privacy | In progress | Salary/NPWP/bank encryption, key rotation, backup/restore tooling implemented; production drills pending |
| 6.3 Audit/compliance | In progress | Redacted global audit, CSV export, and immutable DB trigger implemented; retention/export integration tests pending |
| 7.1 Recruitment | Implemented | Bulk actions, digital offer delivery, public accept/reject and tamper-evident e-sign implemented |
| 7.2 Onboarding | Implemented | Auto-plan from accepted offer, docs/training/equipment checklist, scoped task completion, probation review and conversion implemented |
| SRS testing | In progress | 21 backend unit/security tests, clean-schema DB verification and 1,000-user load test implemented; full browser UAT evidence pending |
| SDD deployment/NFR | Implemented | Backup/restore tooling, Prometheus, Sentry redaction, readiness/liveness, CI migration verification and 1,000-concurrent p95 gate implemented |

### PRD v4 (competitive alignment) — Module 1–2

| PRD v4 story / requirement | Status | Remaining completion gate |
|---|---|---|
| 1.1 Competency framework management | Implemented | Framework/competency CRUD, versioning, role mapping, bulk import implemented; migration to shared dev DB pending (owner runs `prisma db push`) |
| 1.2 Competency assessment | Implemented | Self/manager/peer/360 assessment, draft/submit/approve, gap analysis implemented; employee self-service permission gap fixed this pass |
| 2.1 IDP creation & management | Implemented | Template-free manual + auto-generate-from-gap creation, goal tracking, review with idempotent generation key implemented |
| 2.2 Learning path & skill building (LMS basic) | Implemented | Program/module CRUD, enrollment, module completion, certificate, transcript implemented; mandatory-course enforcement and bonus-eligibility tie-in not implemented |
| 3.1 Automated 9-box matrix | Not started | Roadmap — PRD v4 Module 3, needs mature performance-review history |
| 3.2 Succession planning & readiness | Not started | Roadmap — PRD v4 Module 3 |
| 4.1 Internal career marketplace | Not started | Roadmap — PRD v4 Module 4 |
| 4.2 Rotation & cross-functional programs | Not started | Roadmap — PRD v4 Module 4 |
| 5.1 Earned wage access | Not started | Roadmap — PRD v4 Module 5, needs banking partner |
| 6.1 Salary benchmarking | Not started | Roadmap — PRD v4 Module 6, needs external market data source |
| 7–8 Industry-specific (manufacturing/retail) | Not started | Roadmap — PRD v4 Module 7–8 |

### PRD v6.1 — Seamless tenant discovery login

| PRD v6.1 requirement | Status | Remaining completion gate |
|---|---|---|
| Zero Company ID login | Implemented | `/login` hides Company ID and `/auth/login` resolves tenant server-side |
| SSO/password auto-routing | Implemented | Active SSO tenants return `sso_required`; password tenants return JWT success response |
| Company picker fallback | Implemented | Unresolved domains return picker payload and UI selection replays login with selected tenant |
| Login audit redaction | Implemented | Tenant audit metadata stores domain/method/provider/reason without password/token payloads |

### PRD v11.0 — Go-live execution

| PRD v11 requirement | Status | Remaining completion gate |
|---|---|---|
| Marketing website (welcome/pricing/faq/contact/demo/blog) | Implemented in repo | DNS/TLS dnpeople.id Conditional |
| Lead capture API (`/public/leads`, `/public/beta-interest`) | Implemented in repo | SMTP notify + production migration |
| Datadog-ready metrics (webhook, DB connections, attendance gauge) | Implemented in repo | Datadog agent + PagerDuty account Conditional |
| k6 load test suite (baseline/ramp/spike/stress) | Implemented in repo | Run against staging/production-sized data |
| Backup restore drill + integrity SQL | Implemented in repo | Signed drill on production Conditional |
| Launch runbooks + gate checklist + SLA RPO/RTO doc | Implemented in repo | CEO sign-off Conditional |
| Beta customer recruitment (10–20) | Conditional | GTM outreach — template in `ops/onboarding/` |
| External penetration test | Conditional | Firm engaged + staging access per `ops/pen-test-staging-prep.md` |

### PRD v11.1 — Landing page website

| PRD v11.1 requirement | Status | Remaining completion gate |
|---|---|---|
| Full landing at `/welcome` (hero, features, pricing, FAQ, beta form) | Implemented in repo | DNS/TLS dnpeople.id Conditional |
| Pricing 5 tiers aligned to billing/PRD v5 (`subscriptionCatalog.ts`) | Implemented in repo | — |
| SEO metadata + JSON-LD (Organization, FAQPage, SoftwareApplication) | Implemented in repo | GA4 property Conditional |
| FAQ accordion + sticky mobile CTA | Implemented in repo | — |
| `/legal/dpa` page | Implemented in repo | Legal review Conditional |
| Beta signup → Zapier/ConvertKit webhook | Implemented in repo | `NEXT_PUBLIC_ZAPIER_WEBHOOK` live Conditional |
| Demo video embed | Implemented in repo | `NEXT_PUBLIC_DEMO_VIDEO_URL` Conditional |

## Mandatory completion evidence

- Prisma schema validates and deployment migration applies on a clean PostgreSQL database.
- Backend and frontend typecheck/build pass.
- Unit, integration, security, and performance suites pass in CI.
- Every PRD acceptance criterion is traceable to code and an automated or documented UAT check.
- Security controls include secret redaction, encryption/key rotation, audit retention/export, backup and restore drill.
- Documentation reflects observed behavior rather than planned status.

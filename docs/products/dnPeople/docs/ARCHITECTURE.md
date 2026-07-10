# dnPeople — Architecture

**Version:** 4.0  
**Last Updated:** July 10, 2026  
**Referensi:** SDD v3.1 · Status: MVP 1–4 core

---

## High-Level

```
┌─────────────┐   JWT / API key   ┌─────────────┐     Prisma     ┌────────────┐
│  Next.js    │ ────────────────► │  Express    │ ─────────────► │ PostgreSQL │
│  :3001      │ ◄──────────────── │  API :4100  │                │  :5433     │
└─────────────┘     JSON/REST     └─────────────┘                └────────────┘
                                         │
                                         │ (reserved)
                                         ▼
                                   ┌──────────┐
                                   │  Redis   │
                                   │  :6380   │
                                   └──────────┘
```

## Multi-Tenancy

Setiap request authenticated membawa `companyId` (JWT atau API key). Semua query data bisnis di-scope ke `companyId`. Soft-delete via `deletedAt` pada entity kritis (company, user, employee).

**MVP 4:** SUPER_ADMIN dapat mengelola banyak company via `/platform` + `OrganizationLink` (parent/child). White-label per company via `CompanyBranding`.

## Auth Flow

1. `POST /auth/login` → bcrypt → JWT (`sub`, `email`, `role`, `companyId`)
2. Client menyimpan token di `localStorage` (`dnpeople_token`)
3. Middleware `authenticate`:
   - Bearer JWT → load user + employeeId
   - Bearer `dnp_…` → verify API key hash → company-scoped `COMPANY_ADMIN` context
4. `requirePermission` / `requireRole` enforce RBAC
5. Account lockout setelah 5 failed login (30 menit)
6. SSO: config IdP disimpan (`SsoConfig`); full OAuth/SAML handshake masih stub

## Domain Modules

### MVP 1 — Core HR
| Module | Responsibility |
|--------|----------------|
| Auth | Login, register company, `/me` |
| Companies | Company profile & work hours |
| Org | Departments, positions, levels, work locations |
| Employees | Master data + tax info |
| Attendance | Clock in/out, LATE/PRESENT, summary |
| Leave | Types, balances, request + approve |
| Permissions | WFH / late / early leave / trip |
| Payroll | Batch run, BPJS, PPh 21, finalize, payslip |
| Dashboard | Admin KPIs / employee self summary |
| Reports | Headcount, attendance, payroll summary |
| Audit | Append-only activity log |

### MVP 2 — Extended Ops
Shift, overtime (+ payroll), claims, loans, geofence, corrections, documents, announcements, surveys API, calendar/holidays, approval inbox, advanced reports.

### MVP 3 — Strategic HR
Recruitment ATS, onboarding, performance/KPI, training/career, assets, offboarding, policies/disciplinary, helpdesk, rule-based AI assistant, analytics.

### MVP 4 — Enterprise
| Module | Responsibility |
|--------|----------------|
| Platform | Multi-company console, org links |
| Integrations | API keys, webhooks, provider configs |
| Workflows | Multi-step approval definitions + resolve |
| Branding | White-label colors/name/logo |
| SSO | IdP config (OAuth/SAML) |
| Custom Reports | Builder + run against data sources |
| Security | Row-level `DataAccessRule` + effective scope |
| AI Enterprise | Document templates + recruitment screening |

## Payroll Engine

Lokasi: `backend/src/lib/payroll.ts` + `services/payroll.service.ts`

```
gross = baseSalary + salary components (earnings)
bpjsKesehatan = min(gross, 12jt) × 1%
bpjsTK = JHT 2% + JP 1% (capped)
taxable = gross − bpjs
pph21 = progressive annual brackets ÷ 12 (after monthly PTKP)
net = gross − bpjs − pph21
```

## Frontend Architecture

- App Router (`src/app`)
- Route group `(app)` dengan `AppShell` (sidebar + auth gate)
- API client thin wrapper (`lib/api.ts`)
- Role-aware nav: admin melihat payroll, platform, integrations, workflows, dll.

## Security

- Helmet, CORS allowlist, rate limit API & login
- Password hashed bcrypt (cost 12); API keys hashed bcrypt
- Zod validation on write endpoints
- RBAC permission matrix di `utils/auth.ts` (MVP 1–4 permissions)
- Row-level rules (`/security`) — resolver ready; enforce per-query bertahap

## Still planned / polish

- Redis session / cache
- Refresh token rotation
- File storage (S3/MinIO) untuk dokumen & payslip PDF
- Full SSO IdP handshake + JIT provisioning
- Enforce row-level filters on all list queries
- Email / WebSocket notifications
- LLM-powered assistant (saat ini rule-based)

---

*Last Updated: July 10, 2026*

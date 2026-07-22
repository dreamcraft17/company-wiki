# dnPeople — Architecture

**Version:** 11.0 (go-live execution)  
**Owner:** Dozer (CEO + Tech Lead)  
**Company:** DN Tech (PT. Dozer Napitupulu Technology)  
**Brand:** DnPeople  
**UpdatedAt:** July 22, 2026  
**Referensi:** SDD v3.1 · PRD v4–v11.0 · Status: MVP 1–5 + subscription + enterprise + v11 marketing/go-live artefacts

---

## High-Level

```
┌─────────────┐   cookie/JWT/API key  ┌─────────────┐     Prisma     ┌────────────┐
│  Next.js    │ ─────────────────────► │  Express    │ ─────────────► │ PostgreSQL │
│  :3001      │ ◄───────────────────── │  API :4100  │                │ (Supabase) │
└─────────────┘     JSON/REST         └─────────────┘                └────────────┘
   │ rewrite /api/v1 ───────────────────────────────────┘
```

**Codebase snapshot:** 61 frontend pages · 53 backend route modules · 102 Prisma models · 32 backend tests · CI (`.github/workflows/ci.yml`).

## Multi-Tenancy

Setiap request authenticated membawa `companyId` (JWT atau API key). Semua query data bisnis di-scope ke `companyId`. Soft-delete via `deletedAt` pada entity kritis.

| Layer | Fitur |
|-------|-------|
| MVP 4 | `SUPER_ADMIN` multi-company via `/platform` + `OrganizationLink`; white-label `CompanyBranding` |
| PRD v5 | Subscription tier, billing, feature gating server-side, grace/freeze |
| PRD v6 | POOL/SILO/BRIDGE policy, verified-domain discovery, isolation guard, SCIM, tenant audit, quota |
| PRD v6.1 | Seamless login discovery (email domain / custom hostname / user history); SSO redirect atau company picker fallback |

## Auth Flow

1. `POST /auth/login` → tenant discovery → bcrypt → optional MFA TOTP → JWT + httpOnly cookie `dnpeople_session`
2. Discovery: verified domain, custom hostname, atau user history; unresolved → `company_not_found` + picker payload
3. SSO tenants: `status: "sso_required"` + provider start URL (Google / Microsoft / SAML + JIT)
4. Primary session: httpOnly cookie; client may keep short-lived token in `sessionStorage` for Bearer fallback
5. Middleware `authenticate`: Bearer JWT, session cookie, query `access_token`, atau API key `dnp_…`
6. `requirePermission` / `requireRole` + API-key scopes + row-scope rules (`/security`)
7. Account lockout setelah 5 failed login (30 menit)
8. Staff accounts: `/staff-accounts` untuk create/link/reset password akun login

## Domain Modules

### MVP 1 — Core HR
Auth, companies, org (dept/position/level/locations), employees (+ Excel import), attendance, leave, permissions, payroll (BPJS + PPh 21 + THR + bukti potong), dashboard, reports, audit.

### MVP 2 — Extended Ops
Shift (+ swap/rotate), overtime, claims, loans, geofence/WiFi check-in, corrections (bulk), documents, announcements, surveys/polls, calendar/holidays, approval inbox, advanced reports.

### MVP 3 — Strategic HR
Recruitment ATS + careers portal, onboarding, performance/KPI, training/career, assets, offboarding, policies/disciplinary, helpdesk, AI assistant, analytics.

### MVP 4 — Enterprise
Platform, integrations (API keys/webhooks), workflows (multi-step), branding, SSO+JIT, custom reports, row-level security, AI docs + recruitment screening.

### PRD v4 — Talent Development (foundation)
Competency framework/library/role-mapping/assessment, gap analysis, IDP, LMS basic (`/talent`, `/idp`, `/lms`).

### PRD v5–v6 — Subscription & Multi-Tenant
Billing UI (`/billing`), platform/tenant-management, SCIM, quota, custom domain metadata.

### PRD v7.0 — Attendance Excel
Admin/HR Excel import pipeline (`/attendance/template/download`, `/import`, `/imports`); `MANUAL_UPLOAD` records; admin UI Excel-first (office QR generator UI removed).

## Payroll Engine

Lokasi: `backend/src/lib/payroll.ts` + `services/payroll.service.ts` + `lib/payrollExtras.ts` (THR/proration)

```
gross = baseSalary + salary components (earnings)
bpjsKesehatan = min(gross, 12jt) × 1%
bpjsTK = JHT 2% + JP 1% (capped)
taxable = gross − bpjs
pph21 = progressive annual brackets ÷ 12 (after monthly PTKP)
net = gross − bpjs − pph21 ± THR / proration / unpaid leave
```

## Frontend Architecture

- App Router (`src/app`)
- Route group `(app)` dengan responsive `AppShell` (mobile header + drawer; sidebar dari `md`)
- API client (`lib/api.ts`)
- Role-aware nav; dense tables pakai `overflow-x-auto`

## Security

- Helmet, CORS allowlist, rate limit API & login
- Password + API keys hashed bcrypt; optional MFA TOTP
- AES-256-GCM field encryption (salary/NPWP/bank) where enabled
- Zod validation; RBAC matrix; row-level `DataAccessRule`
- Append-only audit trail (+ `/audit` UI)

## Implemented with conditional production deps

| Area | Code status | Production note |
|------|-------------|-----------------|
| SSO Google/Microsoft/SAML + JIT | Done | Needs IdP credentials |
| File uploads / documents | Done | Local disk; S3/MinIO optional |
| LLM assistant | Done | Rule-based always; LLM if API key set |
| Email / notifications | Done | SMTP + outbox retry |
| Biometric attendance | Adapter ready | Fail-closed without provider |
| Redis | Removed | Not used (PRD v8.0) |

## Still planned / polish

- Refresh token rotation
- Enforce row-level filters on **all** list queries
- Native mobile app
- Full facial recognition (selfie photo only today)
- Full XML-DSig SAML (basic signature check today)

---

| | |
|---|---|
| Owner | Dozer (CEO + Tech Lead) |
| Company | DN Tech (PT. Dozer Napitupulu Technology) |
| Brand | DnPeople |
| UpdatedAt | July 18, 2026 |

Property of DN Tech — PT. Dozer Napitupulu Technology · 2026

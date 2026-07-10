# dnPeople — Current Implementation Snapshot

**Date:** July 10, 2026  
**Repo:** `dnpeople`  
**Version:** 0.4.0 (MVP 1–4)  
**Typecheck:** Backend ✅ · Frontend ✅

## Status

| MVP | Status | Catatan |
|-----|--------|---------|
| 1 Core HR | **Done** | Auth, employee, org, attendance, leave, payroll, dashboard, audit |
| 2 Extended Ops | **Done** | Shift, OT, claims, loans, geofence, docs, calendar, approvals |
| 3 Strategic HR | **Done (core)** | ATS, onboarding, performance, training, assets, offboarding, helpdesk, AI assistant |
| 4 Enterprise | **Done (core)** | Multi-company, workflows, API/integrations, SSO config, white-label, custom reports, AI docs/screening, row RBAC |

## MVP 4 modules live

| Area | Surface |
|------|---------|
| Multi-company | `/platform` (SUPER_ADMIN) |
| Integrations | `/integrations` + API keys `dnp_…` |
| Workflows | `/workflows` + approval rules |
| Branding | `/branding` (+ public) |
| SSO | `/sso` (config + initiate stub) |
| Custom reports | `/custom-reports` |
| Security | `/security/access-rules` |
| AI | `/ai/documents/generate`, `/ai/recruitment/screen` |

Frontend: `/platform` `/integrations` `/workflows` `/branding` `/sso` `/security` `/custom-reports` `/ai-docs`

## Partial / next polish

- Full OAuth/SAML IdP handshake + JIT provisioning
- Enforce row-level filters on every list query
- Survey dedicated UI, binary uploads, payslip PDF/email
- LLM-powered assistant (saat ini rule-based)

## Demo

- `admin@dnpeople.id` / `Admin123!`
- `budi@dnpeople.id` / `Employee123!`

## Sync

```bash
cp dnpeople/docs/*.md company-wiki/docs/products/dnPeople/docs/
cp dnpeople/README.md company-wiki/docs/products/dnPeople/README.md
```

*Last Updated: July 10, 2026*

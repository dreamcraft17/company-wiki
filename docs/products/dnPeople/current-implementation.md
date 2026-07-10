# dnPeople — Current Implementation Snapshot

**Date:** July 10, 2026  
**Repo:** `dnpeople`  
**Version:** 0.4.0 (MVP 1–4)  
**Typecheck:** Backend ✅ · Frontend ✅

## Status

| MVP | Status | Catatan |
|-----|--------|---------|
| 1 Core HR | **Done** | Auth, employee, org, attendance, leave, payroll, dashboard, audit |
| 2 Extended Ops | **Done** | Shift, OT, claims, loans, geofence, docs, surveys UI, calendar, approvals |
| 3 Strategic HR | **Done** | ATS + careers portal, onboarding, performance/KPI, training, assets, offboarding, helpdesk, policies, LLM assistant, analytics |
| 4 Enterprise | **Done** | Multi-company, workflows, API/integrations, SSO (Google/Microsoft/SAML), white-label, custom reports, AI docs/screening, row RBAC |

## MVP 3 — verified modules

| Modul | API | UI |
|-------|-----|-----|
| Recruitment & ATS | `/recruitment` | `/recruitment` |
| Careers portal | `/careers` | `/careers` |
| Onboarding | `/onboarding` | `/onboarding` |
| Performance + KPI | `/performance` | `/performance` |
| Training + career paths | `/training` | `/training` |
| Assets | `/assets` | `/assets` |
| Offboarding | `/offboarding` | `/offboarding` |
| Policies + disciplinary | `/policies` | `/policies` |
| Helpdesk | `/helpdesk` | `/helpdesk` |
| AI assistant | `/assistant/ask` | `/assistant` |
| Analytics | `/reports/analytics` | `/reports` |

## MVP 4 modules live

| Area | Surface |
|------|---------|
| Multi-company | `/platform` (SUPER_ADMIN) |
| Integrations | `/integrations` + API keys `dnp_…` |
| Workflows | `/workflows` + approval rules |
| Branding | `/branding` (+ public) |
| SSO | `/sso` Google + Microsoft + SAML ACS |
| Custom reports | `/custom-reports` |
| Security | `/security/access-rules` |
| AI | `/ai-docs`, `/ai/recruitment/screen` |

## Optional next

- SAML XML-DSig verification
- Unit / integration tests + CI/CD

## Demo

- `admin@dnpeople.id` / `Admin123!`
- `budi@dnpeople.id` / `Employee123!`

## Sync

```bash
cp dnpeople/docs/*.md company-wiki/docs/products/dnPeople/docs/
cp dnpeople/README.md company-wiki/docs/products/dnPeople/README.md
cp dnpeople/docs/IMPLEMENTATION-STATUS.md company-wiki/docs/products/dnPeople/current-implementation.md
```

*Last Updated: July 10, 2026*

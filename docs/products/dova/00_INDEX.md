# DOVA — Documentation Index

> **Author:** Dozer · [@dreamcraft17](https://github.com/dreamcraft17)  
> **Updated:** 2026-09-01 · **App HEAD:** `8c5f4ca` (`stg`) · **Tag:** `v0.5.4`

**Product:** DOVA — agricultural / food supply marketplace (Nigeria · NGN · Paystack)  
**Repository:** [`dreamcraft17/dova`](https://github.com/dreamcraft17/dova)  
**Production:** [dova.dntech.id](https://dova.dntech.id) · API [api.dova.dntech.id](https://api.dova.dntech.id/api/v1/health)  
**Tests:** 180 unit (Jest, 2026-09-01) · smoke **not logged** (`ops/logs` empty)

> **Start here:** [All-features.md](./All-features.md) · [code/FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md) · [code/FULL-TECH-STATUS.md](./docs/FULL-TECH-STATUS.md) · [operations/current-phase.md](./docs/current-phase.md)

---

## Operations (`operations/`)

Deploy, environment, runbooks, release checks, and stakeholder operational updates.

| File | Description |
|------|-------------|
| [current-phase.md](./docs/current-phase.md) | Production phase snapshot |
| [HANDOFF.md](./docs/HANDOFF.md) | Latest session handoff briefing |
| [RUNBOOK.md](./docs/RUNBOOK.md) | Deploy, rollback, troubleshoot |
| [Dova RunBook for localhost.md](./docs/Dova%20RunBook%20for%20localhost.md) | Run DOVA on localhost / dev machine · [PDF](./docs/Dova%20RunBook%20for%20Localhost.pdf) |
| [VPS-DEPLOY.md](./docs/VPS-DEPLOY.md) | Single-server VPS deploy |
| [ENV-SETUP.md](./docs/ENV-SETUP.md) | Production / VPS environment variables |
| [vps-backend.env.example](./docs/vps-backend.env.example) | Backend env template (VPS) |
| [vps-frontend.env.example](./docs/vps-frontend.env.example) | Frontend env template (VPS) |
| [VERCEL-DEPLOYMENT-OVERRIDE.md](./docs/VERCEL-DEPLOYMENT-OVERRIDE.md) | Vercel vs VPS notes |
| [STAGING-GO-LIVE.md](./docs/STAGING-GO-LIVE.md) | Go-live checklist (legacy) |
| [SMOKE-PRODUCTION-RESULT.md](./docs/SMOKE-PRODUCTION-RESULT.md) | Latest production smoke log |
| [DOVA-RELEASE-READINESS-AUDIT.md](./docs/DOVA-RELEASE-READINESS-AUDIT.md) | Release readiness audit |
| [DEMO-ACCOUNTS.md](./docs/DEMO-ACCOUNTS.md) | Seed demo logins |
| [PHASE-UPDATE-BD.md](./docs/PHASE-UPDATE-BD.md) | BD / non-technical update |
| [MVP-STATUS.md](./docs/MVP-STATUS.md) | Stakeholder status (legacy) |
| [MVP-PROGRESS-UPDATE.md](./docs/MVP-PROGRESS-UPDATE.md) | Progress update (legacy) |
| [REPLY-PAYSTACK-AND-MIN-ORDER.md](./docs/REPLY-PAYSTACK-AND-MIN-ORDER.md) | Stakeholder reply — Paystack |
| [REPLY-SUPPLIER-VERIFICATION-DOCS.md](./docs/REPLY-SUPPLIER-VERIFICATION-DOCS.md) | Stakeholder reply — supplier docs |

---

## Code & QA (`code/`)

Features, implementation baseline, API reference, and test documentation.

| File | Description |
|------|-------------|
| [All-features.md](./All-features.md) | **Master list of all 101 features** (by role + module) |
| [ONBOARDING.md](./docs/ONBOARDING.md) | New engineer onboarding — repo shape, setup, common tasks |
| [FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md) | Complete feature inventory (API/UI detail) |
| [FULL-TECH-STATUS.md](./docs/FULL-TECH-STATUS.md) | Full technical status |
| [CURRENT-IMPLEMENTATION.md](./docs/CURRENT-IMPLEMENTATION.md) | PRD / ops baseline snapshot |
| [API Documention.md](./docs/API%20Documention.md) | Integrator REST guide (`/api/v1`) · [PDF](./docs/API%20Documention.pdf) |
| [DOVA-API-QA-POSTMAN.md](./docs/DOVA-API-QA-POSTMAN.md) | QA Postman endpoint list |
| [DOVA-SECURITY-CHECKLIST-ASSESSMENT.md](./docs/DOVA-SECURITY-CHECKLIST-ASSESSMENT.md) | QA Security section — 4-item assessment |
| [DOVA-BUG-TRIAGE.md](./docs/DOVA-BUG-TRIAGE.md) | Bug triage + fingerprints |
| [DOVA-QA-REVIEW-2026-09-01.md](./docs/DOVA-QA-REVIEW-2026-09-01.md) | Jest smell / testability review |
| [TEST-CASES.md](./docs/TEST-CASES.md) | Manual UAT scenarios |
| [GUIDE.md](./docs/GUIDE.md) | QA workflow |
| [SPEC-COMPLIANCE.md](./docs/SPEC-COMPLIANCE.md) | PRD/SRS/SDD vs code |
| [CHANGELOG.md](./docs/CHANGELOG.md) | Version history |
| [BUG_FIXES.md](./docs/BUG_FIXES.md) | Bugfix log |
| [UAT-BUG-FIXES.md](./docs/UAT-BUG-FIXES.md) | UAT defect log + verification |
| [PAYSTACK-TEST-MODE.md](./docs/PAYSTACK-TEST-MODE.md) | Paystack test mode setup |

---

## Specs (`specs/PRD/`)

| File | Topic |
|------|-------|
| [dova-prd-aggressive-4w.md](./specs/PRD/dova-prd-aggressive-4w.md) | PRD — 4-week MVP |
| [dova-srs-aggressive-4w.md](./specs/PRD/dova-srs-aggressive-4w.md) | SRS |
| [dova-sdd-aggressive-4w.md](./specs/PRD/dova-sdd-aggressive-4w.md) | SDD |
| [dova-summary-4w.md](./specs/PRD/dova-summary-4w.md) | Executive summary |
| [dova-tech-stack-monorepo.md](./specs/PRD/dova-tech-stack-monorepo.md) | Tech stack / monorepo |

---

## Mirror to DN Tech

```bash
# From dozer/ workspace root
bash dova-comp-wiki/scripts/sync-to-company-wiki.sh
```

**SSOT:** this wiki repo — not the app repo. **No private files** — see [README.md](./README.md#what-not-to-add).

**DN Tech mirror:** `company-wiki/docs/products/dova/` (see sync block in company-wiki `00_INDEX.md`).

---

## Quick links

| | |
|---|---|
| GitHub app | https://github.com/dreamcraft17/dova |
| GitHub wiki | https://github.com/dreamcraft17/dova-com-wiki |
| Storefront | https://dova.dntech.id |
| Admin demo | `admin@dova.local` / `admin1234` |
| Supplier demo | `supplier@dova.local` / `supplier1234` |

---

*Author: Dozer · [@dreamcraft17](https://github.com/dreamcraft17)*

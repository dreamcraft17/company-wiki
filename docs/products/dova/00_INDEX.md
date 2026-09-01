# DOVA — Documentation Index

> **Author:** Dozer · [@dreamcraft17](https://github.com/dreamcraft17)  
> **Updated:** 2026-08-29 · **App HEAD:** `129ba96` · **Wiki HEAD:** `32d19f3` · **Tag:** `v0.5.4`

**Product:** DOVA — agricultural / food supply marketplace (Nigeria · NGN · Paystack)  
**Repository:** [`dreamcraft17/dova`](https://github.com/dreamcraft17/dova)  
**Production:** [dova.dntech.id](https://dova.dntech.id) · API [api.dova.dntech.id](https://api.dova.dntech.id/api/v1/health)  
**Tests:** 158 unit · smoke **29+10** (`npm run smoke:production`)

> **Start here:** [All-features.md](./All-features.md) · [code/FEATURE-CATALOG.md](./code/FEATURE-CATALOG.md) · [code/FULL-TECH-STATUS.md](./code/FULL-TECH-STATUS.md) · [operations/current-phase.md](./operations/current-phase.md)

---

## Operations (`operations/`)

Deploy, environment, runbooks, release checks, and stakeholder operational updates.

| File | Description |
|------|-------------|
| [current-phase.md](./operations/current-phase.md) | Production phase snapshot |
| [HANDOFF.md](./operations/HANDOFF.md) | Latest session handoff briefing |
| [RUNBOOK.md](./operations/RUNBOOK.md) | Deploy, rollback, troubleshoot |
| [Dova RunBook for localhost.md](./operations/Dova%20RunBook%20for%20localhost.md) | Run DOVA on localhost / dev machine · [PDF](./operations/Dova%20RunBook%20for%20Localhost.pdf) |
| [VPS-DEPLOY.md](./operations/VPS-DEPLOY.md) | Single-server VPS deploy |
| [ENV-SETUP.md](./operations/ENV-SETUP.md) | Production / VPS environment variables |
| [vps-backend.env.example](./operations/vps-backend.env.example) | Backend env template (VPS) |
| [vps-frontend.env.example](./operations/vps-frontend.env.example) | Frontend env template (VPS) |
| [VERCEL-DEPLOYMENT-OVERRIDE.md](./operations/VERCEL-DEPLOYMENT-OVERRIDE.md) | Vercel vs VPS notes |
| [STAGING-GO-LIVE.md](./operations/STAGING-GO-LIVE.md) | Go-live checklist (legacy) |
| [SMOKE-PRODUCTION-RESULT.md](./operations/SMOKE-PRODUCTION-RESULT.md) | Latest production smoke log |
| [DOVA-RELEASE-READINESS-AUDIT.md](./operations/DOVA-RELEASE-READINESS-AUDIT.md) | Release readiness audit |
| [DEMO-ACCOUNTS.md](./operations/DEMO-ACCOUNTS.md) | Seed demo logins |
| [PHASE-UPDATE-BD.md](./operations/PHASE-UPDATE-BD.md) | BD / non-technical update |
| [MVP-STATUS.md](./operations/MVP-STATUS.md) | Stakeholder status (legacy) |
| [MVP-PROGRESS-UPDATE.md](./operations/MVP-PROGRESS-UPDATE.md) | Progress update (legacy) |
| [REPLY-PAYSTACK-AND-MIN-ORDER.md](./operations/REPLY-PAYSTACK-AND-MIN-ORDER.md) | Stakeholder reply — Paystack |
| [REPLY-SUPPLIER-VERIFICATION-DOCS.md](./operations/REPLY-SUPPLIER-VERIFICATION-DOCS.md) | Stakeholder reply — supplier docs |

---

## Code & QA (`code/`)

Features, implementation baseline, API reference, and test documentation.

| File | Description |
|------|-------------|
| [All-features.md](./All-features.md) | **Master list of all 101 features** (by role + module) |
| [ONBOARDING.md](./code/ONBOARDING.md) | New engineer onboarding — repo shape, setup, common tasks |
| [FEATURE-CATALOG.md](./code/FEATURE-CATALOG.md) | Complete feature inventory (API/UI detail) |
| [FULL-TECH-STATUS.md](./code/FULL-TECH-STATUS.md) | Full technical status |
| [CURRENT-IMPLEMENTATION.md](./code/CURRENT-IMPLEMENTATION.md) | PRD / ops baseline snapshot |
| [API Documention.md](./code/API%20Documention.md) | Integrator REST guide (`/api/v1`) |
| [DOVA-API-QA-POSTMAN.md](./code/DOVA-API-QA-POSTMAN.md) | QA Postman endpoint list |
| [DOVA-SECURITY-CHECKLIST-ASSESSMENT.md](./code/DOVA-SECURITY-CHECKLIST-ASSESSMENT.md) | QA Security section — 4-item assessment |
| [DOVA-BUG-TRIAGE.md](./code/DOVA-BUG-TRIAGE.md) | Bug triage + fingerprints |
| [TEST-CASES.md](./code/TEST-CASES.md) | Manual UAT scenarios |
| [GUIDE.md](./code/GUIDE.md) | QA workflow |
| [SPEC-COMPLIANCE.md](./code/SPEC-COMPLIANCE.md) | PRD/SRS/SDD vs code |
| [CHANGELOG.md](./code/CHANGELOG.md) | Version history |
| [BUG_FIXES.md](./code/BUG_FIXES.md) | Bugfix log |
| [UAT-BUG-FIXES.md](./code/UAT-BUG-FIXES.md) | UAT defect log + verification |
| [PAYSTACK-TEST-MODE.md](./operations/PAYSTACK-TEST-MODE.md) | Paystack test mode setup |

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

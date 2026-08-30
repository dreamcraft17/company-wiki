# DOVA — Documentation Index

> **Author:** Dozer · [@dreamcraft17](https://github.com/dreamcraft17)  
> **Updated:** 2026-08-30 · **App HEAD:** `ebd71bd` · **Wiki HEAD:** `b3e8377` · **Tag:** `v0.5.4`

**Product:** DOVA — agricultural / food supply marketplace (Nigeria · NGN · Paystack)  
**Repository:** [`dreamcraft17/dova`](https://github.com/dreamcraft17/dova)  
**Production:** [dova.dntech.id](https://dova.dntech.id) · API [api.dova.dntech.id](https://api.dova.dntech.id/api/v1/health)  
**Tests:** 158 unit · smoke **29+10** (`npm run smoke:production`)

**Canonical wiki:** [`dova-comp-wiki`](https://github.com/dreamcraft17/dova-com-wiki) (team repo)  
**This folder:** DN Tech `company-wiki` mirror — flat `docs/` layout

> **Start here:** [All-features.md](./All-features.md) · [docs/FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md) · [docs/FULL-TECH-STATUS.md](./docs/FULL-TECH-STATUS.md) · [current-phase.md](./current-phase.md)

---

## Product root

| File | Description |
|------|-------------|
| [All-features.md](./All-features.md) | **Master list — all 101 features** (by role + module) |
| [README.md](./README.md) | Product overview (from app README) |
| [current-phase.md](./current-phase.md) | Production phase snapshot |

---

## Living docs (`docs/`)

### Ops & deploy

| File | Description |
|------|-------------|
| [RUNBOOK.md](./docs/RUNBOOK.md) | Deploy, rollback, troubleshoot |
| [Dova RunBook for localhost.md](./docs/Dova%20RunBook%20for%20localhost.md) | Run DOVA on localhost · [PDF](./docs/Dova%20RunBook%20for%20Localhost.pdf) |
| [VPS-DEPLOY.md](./docs/VPS-DEPLOY.md) | Single-server VPS deploy |
| [ENV-SETUP.md](./docs/ENV-SETUP.md) | Production / VPS environment variables |
| [VERCEL-DEPLOYMENT-OVERRIDE.md](./docs/VERCEL-DEPLOYMENT-OVERRIDE.md) | Vercel vs VPS notes |
| [STAGING-GO-LIVE.md](./docs/STAGING-GO-LIVE.md) | Go-live checklist (legacy) |
| [SMOKE-PRODUCTION-RESULT.md](./docs/SMOKE-PRODUCTION-RESULT.md) | Latest production smoke log |
| [DOVA-RELEASE-READINESS-AUDIT.md](./docs/DOVA-RELEASE-READINESS-AUDIT.md) | Release readiness audit |
| [DEMO-ACCOUNTS.md](./docs/DEMO-ACCOUNTS.md) | Seed demo logins |
| [PAYSTACK-TEST-MODE.md](./docs/PAYSTACK-TEST-MODE.md) | Paystack test mode setup |
| [PHASE-UPDATE-BD.md](./docs/PHASE-UPDATE-BD.md) | BD / non-technical update |
| [MVP-STATUS.md](./docs/MVP-STATUS.md) | Stakeholder status (legacy) |
| [MVP-PROGRESS-UPDATE.md](./docs/MVP-PROGRESS-UPDATE.md) | Progress update (legacy) |
| [REPLY-PAYSTACK-AND-MIN-ORDER.md](./docs/REPLY-PAYSTACK-AND-MIN-ORDER.md) | Stakeholder reply — Paystack |
| [REPLY-SUPPLIER-VERIFICATION-DOCS.md](./docs/REPLY-SUPPLIER-VERIFICATION-DOCS.md) | Stakeholder reply — supplier docs |
| [ENGINEERING-HEALTH-2026-08-30.md](./docs/ENGINEERING-HEALTH-2026-08-30.md) | Combined bug-triage / test-quality / API-design / CTO review |
| [HANDOFF.md](./docs/HANDOFF.md) | Latest session handoff briefing |

### Code, QA & status

| File | Description |
|------|-------------|
| [ONBOARDING.md](./docs/ONBOARDING.md) | New engineer onboarding — repo shape, setup, common tasks |
| [FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md) | Complete feature inventory (API/UI detail) |
| [FULL-TECH-STATUS.md](./docs/FULL-TECH-STATUS.md) | Full technical status |
| [CURRENT-IMPLEMENTATION.md](./docs/CURRENT-IMPLEMENTATION.md) | PRD / ops baseline snapshot |
| [API.md](./docs/API.md) | MVP API reference |
| [DOVA-API-QA-POSTMAN.md](./docs/DOVA-API-QA-POSTMAN.md) | QA Postman endpoint list |
| [DOVA-SECURITY-CHECKLIST-ASSESSMENT.md](./docs/DOVA-SECURITY-CHECKLIST-ASSESSMENT.md) | QA Security section — 4-item assessment |
| [DOVA-BUG-TRIAGE.md](./docs/DOVA-BUG-TRIAGE.md) | Bug triage + fingerprints |
| [TEST-CASES.md](./docs/TEST-CASES.md) | Manual UAT scenarios |
| [GUIDE.md](./docs/GUIDE.md) | QA workflow |
| [SPEC-COMPLIANCE.md](./docs/SPEC-COMPLIANCE.md) | PRD/SRS/SDD vs code |
| [CHANGELOG.md](./docs/CHANGELOG.md) | Version history |
| [BUG_FIXES.md](./docs/BUG_FIXES.md) | Bugfix log |
| [UAT-BUG-FIXES.md](./docs/UAT-BUG-FIXES.md) | UAT defect log + verification |

---

## Specs (`PRD/`)

| File | Topic |
|------|-------|
| [dova-prd-aggressive-4w.md](./PRD/dova-prd-aggressive-4w.md) | PRD — 4-week MVP |
| [dova-srs-aggressive-4w.md](./PRD/dova-srs-aggressive-4w.md) | SRS |
| [dova-sdd-aggressive-4w.md](./PRD/dova-sdd-aggressive-4w.md) | SDD |
| [dova-summary-4w.md](./PRD/dova-summary-4w.md) | Executive summary |
| [dova-tech-stack-monorepo.md](./PRD/dova-tech-stack-monorepo.md) | Tech stack / monorepo |

---

## Sync from canonical wiki

```bash
# From dozer/ workspace root
bash dova-comp-wiki/scripts/sync-to-company-wiki.sh  # dova-comp-wiki → this mirror
```

**SSOT:** [`dova-comp-wiki`](https://github.com/dreamcraft17/dova-com-wiki) — the app repo has no markdown docs.

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

*Last Updated: August 30, 2026 · **Author:** Dozer · [@dreamcraft17](https://github.com/dreamcraft17)*

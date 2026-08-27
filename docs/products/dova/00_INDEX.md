# DOVA — Documentation Index

**Product**: DOVA — agricultural / food supply marketplace (Nigeria)  
**Market**: NGN · Paystack  
**Repository**: [`dreamcraft17/dova`](https://github.com/dreamcraft17/dova)  
**Status**: MVP complete · **v0.5.2 production live**  
**Owner**: Dozer  
**Company**: DN Tech  
**UpdatedAt**: August 27, 2026  
**App HEAD**: `dcb5c2f` · **Tag:** `v0.5.2`  

**Canonical wiki:** workspace folder `dova-company-wiki/`  
**Mirrors:** this path (`company-wiki/docs/products/dova/`) · `dova/docs/` (local, gitignored)

> **Start here:** [STATUS-LENGKAP.md](./docs/STATUS-LENGKAP.md) · [current-phase.md](./current-phase.md)  
> **BD:** [docs/PHASE-UPDATE-BD.md](./docs/PHASE-UPDATE-BD.md) · **CEO:** [docs/CEO-PROGRESS-UPDATE.md](./docs/CEO-PROGRESS-UPDATE.md)  
> **Baseline:** [docs/CURRENT-IMPLEMENTATION.md](./docs/CURRENT-IMPLEMENTATION.md)  
> **Specs:** [PRD/](./PRD/)  
> **Sync:** from workspace root → `./dova-company-wiki/scripts/sync-docs.sh`

**Production:** [dova.dntech.id](https://dova.dntech.id) · API [api.dova.dntech.id](https://api.dova.dntech.id/api/v1/health)  
**Tests:** 127 unit · production smoke automated (`npm run smoke:production`)

---

## Living docs (`docs/`)

| File | Deskripsi |
|------|-----------|
| [STATUS-LENGKAP.md](./docs/STATUS-LENGKAP.md) | **Dokumen status teknis lengkap** — stack, fitur, pekerjaan, v0.5.0 |
| [PHASE-UPDATE-BD.md](./docs/PHASE-UPDATE-BD.md) | **Kirim ke BD / non-teknis** (+ WhatsApp) |
| [CEO-PROGRESS-UPDATE.md](./docs/CEO-PROGRESS-UPDATE.md) | **Kirim ke CEO** (+ WhatsApp) |
| [CURRENT-IMPLEMENTATION.md](./docs/CURRENT-IMPLEMENTATION.md) | Baseline codebase vs ops |
| [FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md) | Available / Conditional / Out of MVP |
| [CHANGELOG.md](./docs/CHANGELOG.md) | Riwayat versi (0.5.0, 0.4.0, …) |
| [MVP-PROGRESS-UPDATE.md](./docs/MVP-PROGRESS-UPDATE.md) | Update non-teknis (legacy long form) |
| [MVP-STATUS.md](./docs/MVP-STATUS.md) | Status report stakeholder |
| [SPEC-COMPLIANCE.md](./docs/SPEC-COMPLIANCE.md) | PRD/SRS/SDD vs code |
| [API.md](./docs/API.md) | Referensi API MVP |
| [DOVA-API-QA-POSTMAN.md](./docs/DOVA-API-QA-POSTMAN.md) | **API endpoint list for QA** (Postman / Insomnia) |
| [DOVA-RELEASE-READINESS-AUDIT.md](./docs/DOVA-RELEASE-READINESS-AUDIT.md) | **Release audit** — 100% production |
| [SMOKE-PRODUCTION-RESULT.md](./docs/SMOKE-PRODUCTION-RESULT.md) | Production API smoke pass log |
| [TEST-CASES.md](./docs/TEST-CASES.md) | Manual UAT / UI test scenarios |
| [GUIDE.md](./docs/GUIDE.md) | QA testing workflow |
| [RUNBOOK.md](./docs/RUNBOOK.md) | Deploy, rollback, troubleshoot |
| [VPS-DEPLOY.md](./docs/VPS-DEPLOY.md) | Deploy single-server |
| [VERCEL-DEPLOYMENT-OVERRIDE.md](./docs/VERCEL-DEPLOYMENT-OVERRIDE.md) | Override Docker → Vercel/VPS |
| [DEMO-ACCOUNTS.md](./docs/DEMO-ACCOUNTS.md) | Akun demo seed |
| [BUG_FIXES.md](./docs/BUG_FIXES.md) | Log bugfix |
| [REPLY-PAYSTACK-AND-MIN-ORDER.md](./docs/REPLY-PAYSTACK-AND-MIN-ORDER.md) | Stakeholder reply |
| [REPLY-SUPPLIER-VERIFICATION-DOCS.md](./docs/REPLY-SUPPLIER-VERIFICATION-DOCS.md) | Stakeholder reply |

## Specs (`PRD/`)

| File | Topic |
|------|-------|
| [dova-prd-aggressive-4w.md](./PRD/dova-prd-aggressive-4w.md) | **PRD** — 4-week aggressive MVP |
| [dova-srs-aggressive-4w.md](./PRD/dova-srs-aggressive-4w.md) | **SRS** |
| [dova-sdd-aggressive-4w.md](./PRD/dova-sdd-aggressive-4w.md) | **SDD** |
| [dova-summary-4w.md](./PRD/dova-summary-4w.md) | Summary 4W |
| [dova-tech-stack-monorepo.md](./PRD/dova-tech-stack-monorepo.md) | Tech stack / monorepo notes |

## Phase snapshot

| File | Topic |
|------|-------|
| [current-phase.md](./current-phase.md) | Current phase — production live |

## Private (DN Tech / Dozer)

> Not in `dova-company-wiki`. Do not copy these files into the DOVA team wiki.

| File | Isi |
|------|-----|
| [private/README.md](./private/README.md) | Index — equity, counter-proposal, launch budget |

---

## Notes

- **Canonical:** workspace `dova-company-wiki/` (own git repo).  
- **This folder / company-wiki path:** mirror — keep in sync with `./dova-company-wiki/scripts/sync-docs.sh`.  
- App repo `dova/docs/` stays **gitignored**; do not rely on it as the shared source of truth.

## Quick links

| | |
|---|---|
| GitHub app | https://github.com/dreamcraft17/dova |
| **Production** | https://dova.dntech.id |
| API health | https://api.dova.dntech.id/api/v1/health |
| Local frontend | http://localhost:3001 |
| Demo admin | `admin@dova.local` / `admin1234` |
| Demo supplier | `supplier@dova.local` / `supplier1234` |

---

*Last Updated: August 27, 2026*

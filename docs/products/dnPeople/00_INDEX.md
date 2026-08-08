# dnPeople HRIS — Documentation Index

**Product**: dnPeople — Human Resource Information System  
**Repository**: `dnpeople` → [github.com/dreamcraft17/dnpeople](https://github.com/dreamcraft17/dnpeople)  
**Status**: MVP 1–5 + PRD v5–**v15.0** / v14.0 / v13.0 / v12.1 / v11.1 complete · **Xendit payment in repo** · sandbox E2E Conditional · ops gates Conditional  
**Owner**: Dozer (CEO + Tech Lead)  
**Company**: DN Tech (PT. Dozer Napitupulu Technology)  
**Brand**: DnPeople  
**UpdatedAt**: August 8, 2026  
**Spec Version**: PRD/SRS/SDD v3.1 + PRD v4–**v15.0** / v11.1  
**Codebase**: ~86 frontend pages · ~56 backend route modules · ~120 Prisma models · **80/80** tests  
**HEAD**: see `dnpeople` main after Xendit payment migration (`77aa51b`)

> **Soft launch:** [docs/RELEASE-READY.md](./docs/RELEASE-READY.md) · [docs/LAUNCH-GATE-CHECKLIST.md](./docs/LAUNCH-GATE-CHECKLIST.md)  
> **Baseline:** [docs/CURRENT-IMPLEMENTATION.md](./docs/CURRENT-IMPLEMENTATION.md) — next product scope PRD v4 Module 4–8 (product PRD **v16.0**)  
> **Demo accounts:** [docs/DEMO-ACCOUNTS.md](./docs/DEMO-ACCOUNTS.md) — public demo sandbox **FREE** tier  
> **Xendit setup (test mode):** [docs/xendit/XENDIT-PAYMENT-SETUP.md](./docs/xendit/XENDIT-PAYMENT-SETUP.md)

---

## Core Specs (PRD folder)

| File | Topik |
|------|-------|
| [PRD/dnpeople-prd.md](./PRD/dnpeople-prd.md) | **PRD** — Product Requirements Document v3.1 |
| [PRD/dnpeople-srs.md](./PRD/dnpeople-srs.md) | **SRS** — Software Requirements Specification v3.1 |
| [PRD/dnpeople-sdd.md](./PRD/dnpeople-sdd.md) | **SDD** — Software Design Document v3.1 |
| [PRD/dnpeople-prd-v15.0-admin-dashboard.md](./PRD/dnpeople-prd-v15.0-admin-dashboard.md) | **PRD v15.0** — Internal admin console |
| [PRD/dnpeople-prd-v14.0-tutorial-onboarding.md](./PRD/dnpeople-prd-v14.0-tutorial-onboarding.md) | **PRD v14.0** — In-app tutorial & onboarding (no video) |
| [PRD/dnpeople-srs-v14.0-tutorial-requirements.md](./PRD/dnpeople-srs-v14.0-tutorial-requirements.md) | **SRS v14.0** — Tutorial/KB acceptance |
| [PRD/dnpeople-sdd-v14.0-tutorial-implementation.md](./PRD/dnpeople-sdd-v14.0-tutorial-implementation.md) | **SDD v14.0** — Tutorial/KB technical |
| [PRD/dnpeople-prd-v13.0-talent-matrix-succession.md](./PRD/dnpeople-prd-v13.0-talent-matrix-succession.md) | **PRD v13.0** — Talent matrix & succession |
| [PRD/dnpeople-prd-v11.1-landing-page-website-id.md](./PRD/dnpeople-prd-v11.1-landing-page-website-id.md) | **PRD v11.1** — Landing page website |
| [PRD/dnpeople-prd-v11.0-go-live-execution-id.md](./PRD/dnpeople-prd-v11.0-go-live-execution-id.md) | **PRD v11.0** — Go-live execution & beta launch |
| [PRD/dnpeople-prd-v12.1-free-tier-50-emp-final.md](./PRD/dnpeople-prd-v12.1-free-tier-50-emp-final.md) | **PRD v12.1** — FREE tier 50 emp final (LOCKED) |
| [PRD/dnpeople-srs-v12.1-free-tier-50-emp-final.md](./PRD/dnpeople-srs-v12.1-free-tier-50-emp-final.md) | **SRS v12.1** — FREE 50 emp acceptance |
| [PRD/dnpeople-sdd-v12.1-free-tier-50-emp-final.md](./PRD/dnpeople-sdd-v12.1-free-tier-50-emp-final.md) | **SDD v12.1** — FREE 50 emp technical |
| [PRD/dnpeople-prd-v12.0-tier-consolidation-id.md](./PRD/dnpeople-prd-v12.0-tier-consolidation-id.md) | **PRD v12.0** — Tier consolidation |
| [PRD/dnpeople-prd-v10.0-operations-launch-readiness-id.md](./PRD/dnpeople-prd-v10.0-operations-launch-readiness-id.md) | **PRD v10.0** — Ops & launch readiness |
| [PRD/dnpeople-prd-v8.0-security-stability-fixes-id.md](./PRD/dnpeople-prd-v8.0-security-stability-fixes-id.md) | **PRD v8.0** — Security & stability |

## Payment gateway

| File | Topik |
|------|-------|
| [docs/xendit/XENDIT-PAYMENT-SETUP.md](./docs/xendit/XENDIT-PAYMENT-SETUP.md) | **Setup operasional** — test mode, env, webhook, checklist |
| [docs/xendit/dnpeople-prd-xendit-payment-v1.0-id.md](./docs/xendit/dnpeople-prd-xendit-payment-v1.0-id.md) | **PRD Xendit v1.0** (+ [SRS](./docs/xendit/dnpeople-srs-xendit-payment-v1.0-id.md) / [SDD](./docs/xendit/dnpeople-sdd-xendit-payment-v1.0-id.md)) |
| [docs/PG/README.md](./docs/PG/README.md) | **Midtrans legacy** — diganti Xendit Agustus 2026 |

## Implementation docs (`docs/`)

| File | Deskripsi |
|------|-----------|
| [docs/NEXT-PRD-BRIEF.md](./docs/NEXT-PRD-BRIEF.md) | **Dasar utuh PRD berikutnya** (v16.0 Module 4) |
| [docs/CURRENT-IMPLEMENTATION.md](./docs/CURRENT-IMPLEMENTATION.md) | **Baseline kanonik** — setelah v15.0 + Xendit |
| [docs/RELEASE-READY.md](./docs/RELEASE-READY.md) | Soft-launch Agustus — kode vs ops |
| [docs/FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md) | Katalog fitur existing / conditional / roadmap |
| [docs/IMPLEMENTATION-STATUS.md](./docs/IMPLEMENTATION-STATUS.md) | Matrix status per MVP/PRD |
| [docs/DEMO-ACCOUNTS.md](./docs/DEMO-ACCOUNTS.md) | Akun demo seed (FREE tier) |
| [docs/LAUNCH-GATE-CHECKLIST.md](./docs/LAUNCH-GATE-CHECKLIST.md) | Go/no-go Agustus 2026 |
| [docs/SLA-COMMITMENT-RPO-RTO.md](./docs/SLA-COMMITMENT-RPO-RTO.md) | RPO/RTO commitments |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | Riwayat versi |
| [docs/00_INDEX.md](./docs/00_INDEX.md) | Index mirror repo `dnpeople/docs/` |

## Ops (`ops/`)

| File | Deskripsi |
|------|-----------|
| [ops/runbooks/launch-day.md](./ops/runbooks/launch-day.md) | Prosedur launch day |
| [ops/datadog/](./ops/datadog/) | Agent / scrape config |
| [ops/alerting/alert-rules.yaml](./ops/alerting/alert-rules.yaml) | Alert monitor stubs |
| [ops/pen-test-staging-prep.md](./ops/pen-test-staging-prep.md) | Persiapan pen-test |

## Sync dari repo

```bash
# Dari root monorepo / sibling folders:
cp dnpeople/docs/*.md company-wiki/docs/products/dnPeople/docs/
cp -R dnpeople/docs/xendit company-wiki/docs/products/dnPeople/docs/
cp -R dnpeople/docs/PG company-wiki/docs/products/dnPeople/docs/
cp dnpeople/README.md company-wiki/docs/products/dnPeople/README.md
cp dnpeople/docs/CURRENT-IMPLEMENTATION.md company-wiki/docs/products/dnPeople/current-implementation.md
# Update 00_INDEX.md di wiki jika status berubah
```

---

*Last Updated: August 8, 2026*

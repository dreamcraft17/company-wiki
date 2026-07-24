# dnPeople HRIS — Documentation Index

**Product**: dnPeople — Human Resource Information System  
**Repository**: `dnpeople` → [github.com/dreamcraft17/dnpeople](https://github.com/dreamcraft17/dnpeople)  
**Status**: MVP 1–5 + PRD v5–**v12.1** / v11.1 complete · **code release-ready** (Agustus soft launch) · ops gates Conditional  
**Owner**: Dozer (CEO + Tech Lead)  
**Company**: DN Tech (PT. Dozer Napitupulu Technology)  
**Brand**: DnPeople  
**UpdatedAt**: July 24, 2026  
**Spec Version**: PRD/SRS/SDD v3.1 + PRD v4–v12.1 / v11.1  
**Codebase**: 61 frontend pages · 53 backend route modules · 102 Prisma models · **36/36** tests  
**HEAD**: `61d956f` (PRD v12.1 FREE 50-emp final)

> **Soft launch:** [docs/RELEASE-READY.md](./docs/RELEASE-READY.md) · [docs/LAUNCH-GATE-CHECKLIST.md](./docs/LAUNCH-GATE-CHECKLIST.md)  
> **Baseline:** [docs/CURRENT-IMPLEMENTATION.md](./docs/CURRENT-IMPLEMENTATION.md) — next product scope PRD v4 Module 3–8 after launch  
> **Demo accounts:** [docs/DEMO-ACCOUNTS.md](./docs/DEMO-ACCOUNTS.md) — UI shows seed creds only if `NEXT_PUBLIC_SHOW_DEMO_CREDS=true`

---

## Core Specs (PRD folder)

| File | Topik |
|------|-------|
| [PRD/dnpeople-prd.md](./PRD/dnpeople-prd.md) | **PRD** — Product Requirements Document v3.1 |
| [PRD/dnpeople-srs.md](./PRD/dnpeople-srs.md) | **SRS** — Software Requirements Specification v3.1 |
| [PRD/dnpeople-sdd.md](./PRD/dnpeople-sdd.md) | **SDD** — Software Design Document v3.1 |
| [PRD/dnpeople-prd-v11.1-landing-page-website-id.md](./PRD/dnpeople-prd-v11.1-landing-page-website-id.md) | **PRD v11.1** — Landing page website |
| [PRD/dnpeople-prd-v11.0-go-live-execution-id.md](./PRD/dnpeople-prd-v11.0-go-live-execution-id.md) | **PRD v11.0** — Go-live execution & beta launch |
| [PRD/dnpeople-prd-v12.1-free-tier-50-emp-final.md](./PRD/dnpeople-prd-v12.1-free-tier-50-emp-final.md) | **PRD v12.1** — FREE tier 50 emp final (LOCKED) |
| [PRD/dnpeople-srs-v12.1-free-tier-50-emp-final.md](./PRD/dnpeople-srs-v12.1-free-tier-50-emp-final.md) | **SRS v12.1** — FREE 50 emp acceptance |
| [PRD/dnpeople-sdd-v12.1-free-tier-50-emp-final.md](./PRD/dnpeople-sdd-v12.1-free-tier-50-emp-final.md) | **SDD v12.1** — FREE 50 emp technical |
| [PRD/dnpeople-prd-v12.0-tier-consolidation-id.md](./PRD/dnpeople-prd-v12.0-tier-consolidation-id.md) | **PRD v12.0** — Tier consolidation |
| [PRD/dnpeople-prd-v10.0-operations-launch-readiness-id.md](./PRD/dnpeople-prd-v10.0-operations-launch-readiness-id.md) | **PRD v10.0** — Ops & launch readiness |
| [PRD/dnpeople-prd-v8.0-security-stability-fixes-id.md](./PRD/dnpeople-prd-v8.0-security-stability-fixes-id.md) | **PRD v8.0** — Security & stability |

## Implementation docs (`docs/`)

| File | Deskripsi |
|------|-----------|
| [docs/CURRENT-IMPLEMENTATION.md](./docs/CURRENT-IMPLEMENTATION.md) | **Baseline kanonik** — mulai PRD berikutnya di sini |
| [docs/RELEASE-READY.md](./docs/RELEASE-READY.md) | Soft-launch Agustus — kode vs ops |
| [docs/FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md) | Katalog fitur existing / conditional / roadmap |
| [docs/IMPLEMENTATION-STATUS.md](./docs/IMPLEMENTATION-STATUS.md) | Matrix status per MVP/PRD |
| [docs/DEMO-ACCOUNTS.md](./docs/DEMO-ACCOUNTS.md) | Akun demo seed (Professional tier) |
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

---

*Last Updated: July 24, 2026*

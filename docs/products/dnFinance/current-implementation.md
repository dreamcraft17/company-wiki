# dnAccounting — current implementation (PRD baseline)

> **Author:** Dozer  
> **Date:** 2026-10-25

| Field | Value |
|-------|--------|
| Snapshot date | October 25, 2026 |
| HEAD | `3dfb2d1` (`main`) — product docs SSOT: this wiki folder |
| Updated at | October 25, 2026 |
| Tests | **224** passing (Jest, `npm run test`) |
| Product | Multi-tenant cloud accounting — Indonesia SME |
| Stack | NestJS 11 + React 19/Vite · monorepo `dnfinance` |
| Persistence | JSON file store dev · optional Postgres JSONB snapshot |
| Status | MVP ~92% features · V2 production hardening ~78% · **demo-ready** |

## Shipped (product)

- COA templates (5 industries), journal/GL, AR/AP, inventory, tax (PPN/PPh), reports, e-Faktur CSV export
- Bill & journal approval (UI + email token), scheduled reports, departments on P&L
- Demo tenant seed · Swagger `/api/docs`
- UI: unified module pages (header, tabs, badges, stat cards) — per recent app commits

## Production gates (open)

- Managed PostgreSQL + Redis + Gmail + GCP staging secrets for full V2 stack
- Relational schema runtime (SQL migrations = reference only)

## Docs SSOT

- **Product docs:** edit only under [./docs/](./docs/00_INDEX.md) (this wiki folder). App repo `dnFinance/` = code + root README — no tracked PRD/docs.
- **V1 spek:** [./docs/v1/](./docs/v1/PRD.md)
- **Competitive research:** [./docs/research/accurate-comparison/](./docs/research/accurate-comparison/plan.md)

Detail: [FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md) · [FITUR-LENGKAP.md](./docs/FITUR-LENGKAP.md) · [REPO-SNAPSHOT.md](./docs/REPO-SNAPSHOT.md)

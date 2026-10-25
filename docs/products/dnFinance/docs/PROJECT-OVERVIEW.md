# dnAccounting — Project Overview

| | |
|---|---|
| **Product** | dnAccounting — Cloud Accounting SaaS for Indonesian SME |
| **Folder / package** | `dnFinance/` · `dnfinance` |
| **Owner** | Dozer Fernando Saroha Daniel Napitupulu |
| **Company** | DN Tech (PT. Dozer Napitupulu Technology) |
| **UpdatedAt** | 2 August 2026 |
| **Spec** | PRD/SRS/SDD **V2.0** (Phase 2 production hardening) |
| **License** | Private — commercial SaaS |

---

## Apa itu dnAccounting?

Multi-tenant **cloud accounting** untuk UMKM Indonesia: Chart of Accounts, General Ledger, AR/AP, inventory, PPN/PPh, laporan keuangan, dan workflow approval — dengan UI modern dan API-first.

**Masalah:** UMKM pakai Excel/spreadsheet; PPN/PPh manual; tidak ada audit trail; sulit scale ke beberapa user.  
**Jawaban:** SaaS accounting dengan COA template per industri, auto-posting GL, e-Faktur export, approval bills/journal via email, dan laporan real-time.

## Visi

- Accounting Indonesia-compliant (PPN 11%, PPh 23, e-Faktur CSV)
- Self-service onboarding + COA template (retail, F&B, jasa, trading, manufaktur kecil)
- Approval workflow untuk kontrol internal (manager approve bills & journal)
- Production stack: PostgreSQL, Redis, Bull, Gmail — dengan fallback lokal tanpa Docker
- Tiered SaaS: Starter → Growth → Pro → Plus

## Siapa penggunanya?

| Persona | Kebutuhan | Baca |
|---------|-----------|------|
| Owner UMKM | Dashboard KPI, laporan P&L, cash position | [USER-GUIDE.md](./USER-GUIDE.md) |
| Accountant | Journal, invoice, bill, import COA, e-Faktur | [USER-GUIDE.md](./USER-GUIDE.md) |
| Manager | Approve bills & journal entries | [USER-GUIDE.md](./USER-GUIDE.md) |
| Ops / engineer | Deploy staging, env, monitoring | [DEPLOY.md](./DEPLOY.md) |

## Milestone

| Phase | Target | Status |
|-------|--------|--------|
| **V1 MVP** | COA, GL, AR/AP, inventory, tax, reports, demo seed | **Done (~92%)** |
| **V2 P0** | Postgres wiring, email, queue, cache, CI, 50+ tests | **~78% Done** |
| **V2 P1** | JE approval, email tokens, scheduled reports, departments | **Done** |
| **V2 P2** | Report cache, GCS PDFs, Datadog APM | Roadmap |
| **Phase 3** | OCR invoice, bank sync, mobile, multi-currency | Planned Q2 2027 |

## Repo structure

```
dnFinance/
├── apps/backend/     NestJS API
├── apps/frontend/    React + Vite
├── shared/           COA templates, tax helpers
├── database/         SQL migrations (reference + departments)
├── docs/             Spek V1 + V2 source
├── docs2/            Living docs (this folder)
└── .github/workflows deploy-staging.yml
```

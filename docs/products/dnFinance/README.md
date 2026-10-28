# dnAccounting — MVP Implementation

> **Author:** Dozer · **SSOT:** folder ini · **App repo:** `dnFinance/` (README + code only) · **UpdatedAt:** 2026-10-28

Cloud accounting SaaS for Indonesian businesses of every type and size — from sole proprietors and SMEs to multi-branch companies. Engineering onboarding: [00_INDEX.md](./00_INDEX.md).

## Stack

| Layer | Tech |
|-------|------|
| Backend | NestJS 11 · JWT · multi-tenant in-memory store (Postgres-ready) |
| Frontend | React 19 · Vite 6 · Redux Toolkit · Tailwind CSS 3.4 |
| Shared | Tax (PPN 11%, PPh 23), COA templates, validators |

## Quick start (no Docker)

```bash
cd dnFinance
npm install
cp .env.dev .env
npm run dev
```

- API: http://localhost:3000/api/v1  
- Web: http://localhost:5173  

Register a company → COA template auto-applied by industry.

**Client demo:** see [`DEMO.md`](./DEMO.md) — one-click login `demo@dnaccounting.id` / `demo123456` with pre-seeded data.

## MVP modules implemented

| Module | API prefix | Status |
|--------|------------|--------|
| Auth + multi-tenant | `/auth/*` | ✅ |
| Chart of accounts + 5 templates + import/export | `/accounts/*` | ✅ |
| Journal + GL posting + recurring | `/journal-entries/*`, `/recurring-templates` | ✅ |
| General Ledger view + filter | `/general-ledger` | ✅ |
| Reports (TB, P&L, BS, CF, tax, AR/AP aging, budget) | `/reports/*` | ✅ |
| Customers + Invoices + AR aging + batch + reminders | `/customers`, `/invoices` | ✅ |
| Vendors + Bills + approval + schedule + mark paid | `/vendors`, `/bills`, `/approvals` | ✅ |
| Inventory + stock in/out + aging + low-stock alert | `/items`, `/stock-movements` | ✅ |
| Admin users + tier limits + audit log | `/admin/*` | ✅ |
| PDF invoice/reports + e-Faktur CSV + GL export | `/invoices/:id/pdf`, `/reports/export/*` | ✅ |
| Import COA / opening balances / customers | `/accounts/import`, `/import/*` | ✅ |
| Demo seed + file persistence | `/demo`, `.data/store.json` | ✅ |
| Swagger API docs | `/api/docs` | ✅ |

## Accurate Online parity modules

Built to bring dnFinance to feature parity with Accurate Online (all modules except POS/Trade Portal). Each is a self-contained NestJS module posting through the real GL/ledger.

| Module | API prefix | Status |
|--------|------------|--------|
| Multi-currency + branch/cost-center dimensions | `/currencies`, `/exchange-rates`, `/branches`, `/cost-centers` | ✅ |
| 2FA (TOTP, Google Authenticator compatible) | `/auth/2fa/*` | ✅ |
| Fixed assets (book + fiscal depreciation, disposal, revaluation) | `/fixed-assets/*`, `/fixed-asset-categories`, `/tax-asset-categories` | ✅ |
| Bank reconciliation (statement import + auto-match) | `/bank/*` | ✅ |
| Multi-warehouse (transfers, stock opname) | `/warehouses/*` | ✅ |
| Sales pipeline (quotation → order → delivery → invoice) | `/sales/*` | ✅ |
| Purchasing pipeline (PO → goods receipt → bill) | `/purchasing/*` | ✅ |
| Inventory extras + manufacturing (FIFO/average costing, BOM, production orders) | `/inventory-extras/*` | ✅ |
| Company (payment terms, employees/payroll, period close) + GL extras (budget monitor) | `/company/*`, `/ledger-extras/*` | ✅ |
| SmartLink Tax (e-Faktur CTAS/Legacy, SPT PPN) | `/tax/*` | ✅ |
| Report catalog + deterministic insights ("Analisa AI" — rule-based, not a live LLM call) | `/reporting/*` | ✅ |
| POS / Trade Portal | — | ❌ out of scope |

## Tests

```bash
npm run test           # Jest unit (shared + backend)
npm run test:coverage
cd apps/backend && npm run test   # smoke after build
```

Manual UAT matrix: [`docs/TEST-CASES.md`](./docs/TEST-CASES.md)

**App repo:** https://github.com/dreamcraft17/dnfinance (kode + [README singkat](https://github.com/dreamcraft17/dnfinance/blob/main/README.md) saja — jangan commit PRD di sana).

## Docs (SSOT — folder ini)

- [00_INDEX.md](./00_INDEX.md) — hub navigasi
- [DEMO.md](./DEMO.md) — script demo client
- [docs/FITUR-LENGKAP.md](./docs/FITUR-LENGKAP.md) · [docs/REPO-SNAPSHOT.md](./docs/REPO-SNAPSHOT.md)
- [docs/IMPLEMENTATION-STATUS.md](./docs/IMPLEMENTATION-STATUS.md) · [docs/FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md)
- Spek V2: [docs/PRD/PRD-V2.md](./docs/PRD/PRD-V2.md) · [SRS-V2.md](./docs/PRD/SRS-V2.md) · [SDD-V2.md](./docs/PRD/SDD-V2.md)
- Spek V1: [docs/v1/PRD.md](./docs/v1/PRD.md) · [docs/v1/STATUS.md](./docs/v1/STATUS.md)
- Riset Accurate: [docs/research/accurate-comparison/plan.md](./docs/research/accurate-comparison/plan.md)

## Deployment notes

- **No Docker required** for local dev (same as DOVA path).
- Production: Node host (PM2) + managed PostgreSQL + Vercel/Cloudflare for frontend.
- Phase 2 (production): TypeORM + managed PostgreSQL, Redis, Bull email queue, real Gmail delivery.

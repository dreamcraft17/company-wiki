# dnAccounting — MVP Implementation

> **Author:** Dozer · **SSOT:** folder ini · **App repo:** `dnFinance/` (README + code only) · **UpdatedAt:** 2026-10-25

Cloud accounting SaaS for Indonesian SME. Engineering onboarding: [00_INDEX.md](./00_INDEX.md).

## Stack

| Layer | Tech |
|-------|------|
| Backend | NestJS 11 · JWT · multi-tenant in-memory store (Postgres-ready) |
| Frontend | React 19 · Vite 5 · Redux Toolkit · Tailwind CSS 3.4 |
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

Manual UAT matrix: [`tests/TEST-CASES.md`](./tests/TEST-CASES.md)

## Docs

- [`docs/PRD.md`](./docs/PRD.md) — MVP v1.0
- [`docs/STATUS.md`](./docs/STATUS.md) — MVP status (~92%)
- [`docs2/00_INDEX.md`](./docs2/00_INDEX.md) — **V2 living docs hub**
- [`docs2/IMPLEMENTATION-STATUS.md`](./docs2/IMPLEMENTATION-STATUS.md) — V2 status (~78%)
- [`DEMO.md`](./DEMO.md) — client demo script
- Spek V2: [`docs/PRD_V2.md`](./docs/PRD_V2.md) · [`docs/SRS_V2.md`](./docs/SRS_V2.md) · [`docs/SDD_V2.md`](./docs/SDD_V2.md)

## Deployment notes

- **No Docker required** for local dev (same as DOVA path).
- Production: Node host (PM2) + managed PostgreSQL + Vercel/Cloudflare for frontend.
- Phase 2 (production): TypeORM + managed PostgreSQL, Redis, Bull email queue, real Gmail delivery.
# dnfinance

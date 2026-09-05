# dnShop Finance — Implementation Status

**Updated:** 10 Agustus 2026  
**Baseline specs (shipped):** PRD / SRS / SDD **v1.0 + v2.0** di `prd/`  
**Go-live Shopee (SOPI v2.1):** [`prd/sopi/`](../PRD/sopi/) — **Implemented**  
**UI2 ops desk:** [`prd/v2/dnShop_Finance_v2.1_Design.md`](../PRD/v2/dnShop_Finance_v2.1_Design.md) — **Implemented**  
**Accounting depth (v2.2):** [`prd/v2.2/`](../PRD/v2.2/) — **Implemented** (commit `6b27974`+)  
**Living brief:** [docs.md](./docs.md) · **PRD berikutnya (v3.0):** [NEXT-PRD-BRIEF.md](./NEXT-PRD-BRIEF.md)  
**Deploy:** [DEPLOY-VPS.md](./DEPLOY-VPS.md) · **v2.2 go-live:** [V22-PRODUCTION-CHECKLIST.md](./V22-PRODUCTION-CHECKLIST.md)  
**Prep arsip v2.2:** [PRD-v2.2-Accounting-Depth-PREP.md](./PRD-v2.2-Accounting-Depth-PREP.md)

## Ringkasan

| Area | Status |
|------|--------|
| Backend NestJS API | **Done** — v1.0 + v2.0 + SOPI v2.1 + **v2.2** |
| Frontend Next.js | **Done** — UI2 · Pembukuan · charts · theme · **v2.2 journal tabs** |
| Demo DB seed | **Done** — `isDemo` · `POST /shops/demo/enable` |
| SOPI v2.1 / v2.1.1 Local vs CB | **Done** |
| Order / income sync + webhook | **Done** |
| Tier / onboarding / email / alerts / realtime | **Done** |
| **v2.2 Accounting depth** | **Done** — Cash Flow · Auto-COGS · export · e-Faktur · close-period |
| Multi-marketplace | **Not started** → v3.0 |

## Endpoint coverage

### Auth & health
`/auth/*` · `GET /health` · `GET /shopee/status` · `GET /shopee/orders` (JWT)

### Pembukuan v2.0
`/shops/:shopId/journals/*` — overview · CoA · entries · GL · TB · P&L · BS · notes · audit · bank-match · settings · backfill

### Pembukuan v2.2
| | |
|---|---|
| Cash flow | `GET …/journals/cash-flow` · `POST …/journals/cash-flow/export` |
| Close period | `GET/POST …/journals/close-period` |
| COGS | `GET/POST …/inventory/costing` · `POST …/cogs/sync` · `POST …/cogs/reverse/:orderSn` |
| Accounting export | `GET/POST …/accounting-export/mapping` · `POST …/accounting-export/export-gl` |
| e-Faktur journal | `POST …/tax/e-faktur/generate` · `GET …/tax/e-faktur` |

### Dashboard
`/shops/:shopId/dashboard?period=7d|30d` atau `?date_from=&date_to=` · `/dashboard/aggregate`

## Frontend routes (pembukuan)

`/journal` · `/entries` · `/pl` · **`/cf`** · `/tb` · `/bs` · `/notes` · **`/cogs`** · **`/export`** · **`/efaktur`** · **`/close`** · `/coa` · `/gl` · `/audit` · `/recon`

## Demo lokal

| | |
|---|---|
| Web | http://localhost:6000 |
| Pembukuan | http://localhost:6000/journal |
| API | http://localhost:6001/api/v1 |
| Health | http://localhost:6001/api/v1/auth/health · `/health` · `/shopee/status` |
| Email / password | `seller@dnshop.id` / `Seller123!` |

## Demo production (DN Tech)

| | |
|---|---|
| Web | https://shop.dntech.id |
| API | https://api.shop.dntech.id/api/v1 |
| Health | https://api.shop.dntech.id/api/v1/auth/health · https://shop.dntech.id/api/v1/health |

## Cara jalan

Lihat [README.md](../README.md). Setelah Postgres/Supabase up: `cd apps/backend && npm run seed` (atau `seed:force`).

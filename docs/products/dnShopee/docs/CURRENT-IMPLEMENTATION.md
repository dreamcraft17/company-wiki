# dnShop Finance — Current Implementation

**Updated:** 10 Agustus 2026  
**Path:** `dnShopee/`  
**Status:** v1.0 + v2.0 + UI2 + SOPI v2.1 + **v2.2 Accounting depth** shipped

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 · React 19 · Tailwind · Recharts · Syne + Plus Jakarta Sans + IBM Plex · port 6000 |
| Backend | NestJS 10 · TypeORM · JWT · Socket.io · ExcelJS · pdfkit · port 6001 |
| DB | PostgreSQL 15 / Supabase (`DB_SSL=true`) |
| Cache/queue | Redis optional (inline fallback) |

## Layout repo

```
dnShopee/
├── apps/frontend/     # UI2 + pembukuan (+ v2.2 tabs) + auth
├── apps/backend/      # Nest API + SOPI + v22-accounting
├── docs/              # STATUS, DEPLOY, V22 checklist, NEXT-PRD
├── sopi/              # partner remediation (ops)
└── prd/
    ├── sopi/          # v2.1 (Implemented)
    ├── v2/            # UI2 design
    └── v2.2/          # Accounting depth (Implemented)
```

## Key modules (backend)

- `auth.ts` — JWT, OTP, health
- `sopi-public.ts` — `GET /health`, `/shopee/status`, `/shopee/orders`
- `shopee-client.ts` / `shopee-sync.ts` — OAuth, order/income cron, COGS hook (non-breaking)
- `journal.ts` — CoA, entries, FS, **period lock**, `postSystemEntry`
- **`v22-accounting.ts`** — CashFlow · Cogs (+ 4h cron) · AccountingExport · e-Faktur · ClosePeriod
- `tier.ts` · `v21.ts` — tier, observability, daily crons
- Migration `1723040000000-AddV22AccountingDepth.ts`

## Key modules (frontend)

- `app-shell.tsx` — nav Pembukuan + theme
- **`journal.tsx`** — tabs cf / cogs / export / efaktur / close + existing GL/P&L/…
- `journal-onboarding.tsx` · `shopee-integration.tsx` · `brand-logo.tsx`
- `globals.css` — UI2 tokens · landing

## Verification

```bash
cd dnShopee/apps/backend && npm test && npm run build
cd ../frontend && npm run build
```

## Prod (DN Tech)

| | |
|---|---|
| Web | https://shop.dntech.id |
| API | https://api.shop.dntech.id/api/v1 |
| pm2 | `dnshop-web` · `dnshop-api` |

Deploy: [DEPLOY-VPS.md](./DEPLOY-VPS.md) · [V22-PRODUCTION-CHECKLIST.md](./V22-PRODUCTION-CHECKLIST.md)

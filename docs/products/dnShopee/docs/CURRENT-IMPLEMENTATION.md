# dnShop Finance — Current Implementation

**Updated:** 6 Agustus 2026  
**Path:** `dnShopee/`  
**Status:** v1.0 + v2.0 pembukuan + UI2 + **SOPI v2.1.1 Local/CB 100%** shipped in repo

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 · React 19 · Tailwind · Recharts · Syne + IBM Plex · port 6000 |
| Backend | NestJS 10 · TypeORM · JWT · Socket.io · port 6001 |
| DB | PostgreSQL 15 / Supabase (`DB_SSL=true`) |
| Cache/queue | Redis optional (inline fallback) · dashboard in-process cache |

## Layout repo

```
dnShopee/
├── apps/frontend/     # UI2 ops desk + pembukuan + auth OTP
├── apps/backend/      # Nest API + SOPI sync/webhook/mail/tier
├── docs/              # living STATUS, DEPLOY, NEXT-PRD-BRIEF
└── prd/
    ├── sopi/          # canonical v2.1 / v2.1.1 PRD/SRS/SDD (Implemented)
    └── v2/            # Design UI2 + related v2.1 drafts
```

## Key modules (backend)

- `auth.ts` — JWT, OTP, forgot rate-limit
- `mail.ts` + `templates/` — HTML inject + unsubscribe + `email_log`
- `shopee-client.ts` / `shopee-sync.ts` — OAuth, order/income/payout cron, auto-journal
- `shopee-journal.ts` — Local (2-line) / CB (3-line + FX 5140) builders
- `tier.ts` — Free 100 lifetime / Starter 5000
- `v21.ts` — observability + ops alerts + backfill progress
- journals / shops onboarding pembukuan · `PATCH /shops/:id/mode`
- webhooks Shopee + email bounce

## Key modules (frontend)

- `app-shell.tsx` — nav Pembukuan + theme toggle + Demo DB
- Settlements — Shopee payout reconcile + income + discrepancy summary
- `journal.tsx` + `journal-onboarding.tsx` — wizard + quota remaining
- `shopee-integration.tsx` — Local/CB toggle + auth status
- `globals.css` — UI2 design tokens

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

Detail deploy: [DEPLOY-VPS.md](./DEPLOY-VPS.md)

# dnShop Finance — Implementation Status

**Updated:** 6 Agustus 2026  
**Baseline specs (shipped):** PRD / SRS / SDD **v1.0 + v2.0** di `prd/`  
**Go-live Shopee (SOPI v2.1):** [`PRD/sopi/`](../PRD/sopi/) — **Implemented**  
**UI2 ops desk:** [`PRD/v2/dnShop_Finance_v2.1_Design.md`](../PRD/v2/dnShop_Finance_v2.1_Design.md) — **Implemented**  
**Living brief:** [docs.md](./docs.md) · **PRD berikutnya (v2.2):** [NEXT-PRD-BRIEF.md](./NEXT-PRD-BRIEF.md)  
**Deploy:** [DEPLOY-VPS.md](./DEPLOY-VPS.md) · **Index:** [../00_INDEX.md](../00_INDEX.md)

## Ringkasan

| Area | Status |
|------|--------|
| Backend NestJS API (`apps/backend`) | **Done** — v1.0 + **v2.0 pembukuan** + **SOPI go-live** |
| Frontend Next.js (`apps/frontend`) | **Done** — **UI2 ops desk** · Pembukuan · charts · theme · OTP/wizard |
| Live Shopee OAuth | **Done** — Redis/memory state TTL 10m · `/auth/shopee-callback` |
| Order sync + cursor pagination | **Done** — cron 06:00 WIB · `ShopeeSyncService` |
| Income `get_income_detail` + auto-journal | **Done** — cron 08:00 WIB · escrow fallback |
| Webhook `/api/v1/webhooks/shopee` | **Done** — SOPI HMAC · DLQ + admin replay |
| Tier Free 100 lifetime / Starter 5000/mo | **Done** — `TIER_ENFORCE` + `tier_enforcement_log` |
| Onboarding pembukuan step-1/2/3 | **Done** — API + wizard UI |
| Reset password + OTP verify UI | **Done** |
| HTML email templates + `email_log` | **Done** — `src/templates/` · bounce webhook |
| Ops alerts (email &lt;90%, DLQ &gt;10, Redis, 5xx) | **Done** |
| Socket.io realtime | **Done** — `/realtime` namespace |
| Observability | **Done** — health sync timestamps, metrics, alerts |
| Beta UAT | **Done** — admin invite + checklist + feedback |

## Endpoint coverage

### Auth
`/auth/register` · `login` · `refresh` · `logout` · `me` · `verify-email` · `send-otp` · `forgot-password` · `reset-password` · `resend-verification` · **`health`**

### Pembukuan (v2.0)
`/shops/:shopId/journals/*` — overview · CoA apply/list/create · entries CRUD · submit/approve/reject/post/reverse · import CSV · GL · trial-balance · income-statement · balance-sheet · audit-logs · audit-export PDF · bank-match · settings · auto-journal backfill

### Dashboard
`/shops/:shopId/dashboard?period=7d|30d` atau `?date_from=&date_to=`  
`/dashboard/aggregate` — query periode yang sama

## Demo lokal

| | |
|---|---|
| Web | http://localhost:6000 |
| Pembukuan | http://localhost:6000/journal |
| API | http://localhost:6001/api/v1 |
| Health | http://localhost:6001/api/v1/auth/health |
| Email | `seller@dnshop.id` |
| Password | `Seller123!` |

## Demo production (DN Tech)

| | |
|---|---|
| Web | https://shop.dntech.id |
| API | https://api.shop.dntech.id/api/v1 |
| Health | https://api.shop.dntech.id/api/v1/auth/health |

## Cara jalan

Lihat [README.md](../README.md). Setelah Postgres/Supabase up: `cd apps/backend && npm run seed` (atau `seed:force`).

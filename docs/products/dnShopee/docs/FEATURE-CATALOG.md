# dnShop Finance — Feature Catalog

**Updated:** 10 Agustus 2026  
**Canonical:** [`STATUS.md`](./STATUS.md) · [`docs.md`](./docs.md) · [`README.md`](../README.md)

## Available (shipped)

| Area | Notes |
|------|--------|
| Auth JWT | register/login/refresh · OTP · verify-email · forgot/reset |
| Public health | `GET /health` · `GET /shopee/status` (reviewer-friendly) |
| Shopee OAuth | mock / live · Redis or memory state · callback alias |
| Order + income sync | cron WIB · cursor · `get_income_detail` · auto-journal |
| Webhook SOPI | HMAC · DLQ · admin replay · FE realtime subscribe |
| Dashboard + charts | 7d / 30d / custom |
| Orders / products / inventory / payments / settlements / returns | v1.0 |
| Reports CSV/PDF + orders Excel export | v1 + SOPI proof |
| Tax PPh/PPN + e-Faktur (TaxRecord) | v1.0 |
| Bank CSV + match | + journal match |
| **Pembukuan v2.0** | CoA SAK EMKM · journal · GL · TB · P&L · BS · audit PDF |
| Onboarding wizard | pembukuan step-1/2/3 |
| Tier gate | Free 100 lifetime · Starter 5000/mo · Pro/Ent unlimited |
| Email | HTML templates · `email_log` · bounce |
| Observability | health extended · metrics · ops alerts |
| Realtime | Socket.io `/realtime` |
| Beta UAT | invite · checklist · feedback |
| **UI2 ops desk** | tokens · wizard · upsell · theme · OTP UI |
| **v2.2 Accounting depth** | Cash Flow (CSV/PDF) · Auto-COGS avg + cron 4h · inventory costing · Accurate/Jurnal/MYOB export + mapping edit · e-Faktur dari journal · close-period + period lock |

## Conditional (ops, bukan gap kode)

| Item | Condition |
|------|-----------|
| Live Shopee API | `SHOPEE_PARTNER_ID` + `KEY` + webhook portal |
| Partner verification | NIB/NPWP/trial — lihat `sopi/` |
| SMTP send | `SMTP_HOST` set |
| Redis / Bull | `REDIS_HOST` set |
| Tier hard block | `TIER_ENFORCE=true` |
| COGS cron | default on; `COGS_CRON_DISABLED=true` untuk debug |
| Accurate/DJP UAT | manual import/validate |

## Roadmap

| Version | Focus |
|---------|--------|
| **v2.1** | ✅ SOPI go-live + UI2 |
| **v2.2** | ✅ Accounting depth — **Implemented** |
| **v3.0** | Tokopedia · unified multi-marketplace |

Brief berikutnya: [NEXT-PRD-BRIEF.md](./NEXT-PRD-BRIEF.md)  
v2.2 checklist: [V22-PRODUCTION-CHECKLIST.md](./V22-PRODUCTION-CHECKLIST.md)

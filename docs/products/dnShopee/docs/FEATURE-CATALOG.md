# dnShop Finance — Feature Catalog

**Updated:** 6 Agustus 2026  
**Canonical:** `dnShopee/docs/STATUS.md` · `dnShopee/docs/docs.md`

## Available (shipped)

| Area | Notes |
|------|--------|
| Auth JWT | register/login/refresh · OTP · verify-email · forgot/reset password |
| Shopee OAuth | mock / live · Redis or memory state · callback alias |
| Order + income sync | cron WIB · cursor pagination · `get_income_detail` · auto-journal |
| Webhook SOPI | HMAC · DLQ · admin replay |
| Dashboard + charts | 7d / 30d / custom |
| Orders / products / inventory / payments / settlements / returns | v1.0 |
| Tax PPh/PPN + e-Faktur XML (existing) | v1.0 |
| Bank CSV + match | + journal match |
| **Pembukuan v2.0** | CoA SAK EMKM · journal · GL · TB · P&L · BS · audit PDF |
| Onboarding wizard | pembukuan step-1/2/3 |
| Tier gate | Free 100 lifetime · Starter 5000/mo · Pro/Ent unlimited |
| Email | HTML templates · `email_log` · bounce webhook |
| Observability | health extended · metrics · ops alerts |
| Realtime | Socket.io `/realtime` |
| Beta UAT | invite · checklist · feedback |
| **UI2 ops desk** | tokens · wizard · upsell · theme dark/light · OTP UI |

## Conditional (ops, bukan gap kode)

| Item | Condition |
|------|-----------|
| Live Shopee API | `SHOPEE_PARTNER_ID` + `KEY` + webhook portal |
| SMTP send | `SMTP_HOST` set |
| Redis / Bull | `REDIS_HOST` set |
| Tier hard block | `TIER_ENFORCE=true` |
| Beta cohort metrics | jalankan UAT playbook |

## Roadmap

| Version | Focus |
|---------|--------|
| **v2.2** | Cash Flow · COGS inventori · sync MYOB/Jurnal/Accurate · e-Faktur dari jurnal |
| **v3.0** | Tokopedia · unified multi-marketplace |

Brief: [NEXT-PRD-BRIEF.md](./NEXT-PRD-BRIEF.md)

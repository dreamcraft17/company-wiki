# dnShop Finance v2.2 — Production Go-Live Checklist

**Updated:** 10 Agustus 2026  
**Goal:** 100% production-done untuk Accounting Depth  
**Spec:** [`prd/v2.2/`](../PRD/v2.2/) · Status: [`STATUS.md`](./STATUS.md) · README: [`../README.md`](../README.md)

## Code (repo) — harus hijau

- [x] Cash Flow API + UI + CSV + **PDF**
- [x] Auto-COGS + inventory costing + reverse + sync hook
- [x] COGS cron setiap **4 jam WIB** (`0/4/8/12/16/20`)
- [x] Accounting export Accurate/Jurnal/MYOB + **edit mapping UI**
- [x] e-Faktur XML dari journal posted + validasi tag
- [x] Tutup buku checklist + **period lock enforce** + unlock owner
- [x] Migration `1723040000000-AddV22AccountingDepth`
- [x] Backend/frontend build
- [x] Docs + README updated (commit `77aa084`+)

## Deploy VPS

```bash
cd ~/dnShopee   # atau path repo di VPS
git pull
cd apps/backend && npm ci && npm run build && pm2 restart dnshop-api
cd ../frontend && npm ci && npm run build && pm2 restart dnshop-web
# Pastikan migrationsRun=true di prod — migration v2.2 jalan saat boot API
```

Smoke setelah deploy:

```bash
curl -s https://shop.dntech.id/api/v1/health | head -c 200
# Login demo → /journal/cf → export PDF
# /journal/cogs → Sync Auto-COGS
# /journal/export → edit mapping → Export XLSX
# /journal/efaktur → Generate XML
# /journal/close → checklist → Close Period → coba buat jurnal di bulan locked (harus ditolak)
```

## UAT manual (ops — bukan gap kode)

| # | Uji | Pass? |
|---|-----|-------|
| 1 | Import XLSX Accurate/Jurnal sandbox | [ ] |
| 2 | e-Faktur XML buka di validator DJP / tool internal | [ ] |
| 3 | Demo seed: cash flow + COGS muncul | [ ] |
| 4 | Shopee webhook/sync smoke (tidak regress) | [ ] |

Env opsional:

```bash
COGS_CRON_DISABLED=false   # set true hanya untuk debug
EFAKTUR_SCHEMA_VERSION=3.0
```

# dnShop Finance — Kondisi Saat Ini & Persiapan PRD Berikutnya

| | |
|---|---|
| **Dokumen** | Baseline living + briefing PRD berikutnya |
| **Tanggal** | 10 Agustus 2026 |
| **Produk** | dnShop Finance — dashboard seller Shopee + **pembukuan sebagai bonus seller** |
| **Baseline kode** | v1.0 + v2.0 + UI2 + SOPI v2.1 + **v2.2 Accounting depth** |
| **Spec shipped** | [`prd/`](../PRD/) v1–v2.0 · [`prd/sopi/`](../PRD/sopi/) v2.1 · [`prd/v2/`](../PRD/v2/) UI2 · **[`prd/v2.2/`](../PRD/v2.2/) Accounting** |
| **Spec berikutnya** | **v3.0** Multi-marketplace — [`NEXT-PRD-BRIEF.md`](./NEXT-PRD-BRIEF.md) |
| **Owner** | Dozer (CEO + Tech Lead) · DN Tech |
| **Path** | `dnShopee/` |
| **Prod** | `https://shop.dntech.id` · `https://api.shop.dntech.id` |

> **Cara pakai:** Jangan janjikan ulang §3 sebagai fitur baru. Tulis PRD berikutnya hanya dari §5.

---

## 1. Keputusan singkat: PRD berikutnya tentang apa?

| Jalur | Isi | Status |
|-------|-----|--------|
| **A — Go-live ops (v2.1 / SOPI)** | Partner Shopee live, SMTP, Redis, onboarding, tier, observability | **Shipped** |
| **B — Accounting depth (v2.2)** | Cash flow, COGS, Accurate/Jurnal/MYOB, e-Faktur dari jurnal, tutup buku | **Shipped** 10 Agu 2026 |
| **C — Multi-marketplace** | Tokopedia + unified orders | **P0 berikutnya → v3.0** |

**Rekomendasi:** **Jalur C → v3.0**. Detail: [`NEXT-PRD-BRIEF.md`](./NEXT-PRD-BRIEF.md).

---

## 2. Snapshot produk saat ini

| Item | Nilai |
|------|--------|
| Frontend | Next.js 15 · React 19 · Tailwind · Recharts · port **6000** |
| UI | UI2 ops desk · landing Plus Jakarta Sans headline · theme dark/light |
| Backend | NestJS 10 · TypeORM · JWT · Socket.io · ExcelJS · port **6001** |
| Pembukuan | `/journal/*` — bonus seller (bukan software akuntansi terpisah) |
| v2.2 surfaces | `/journal/cf` · `/cogs` · `/export` · `/efaktur` · `/close` |
| Shopee | Mock jika key kosong · live OAuth + webhook + cron jika key set |
| Tier | Free **100 lifetime** · Starter **5000/bulan** |
| Health publik | `GET /api/v1/health` · `GET /api/v1/shopee/status` |
| Demo | [DEMO-ACCOUNTS.md](./DEMO-ACCOUNTS.md) |
| Go-live v2.2 | [V22-PRODUCTION-CHECKLIST.md](./V22-PRODUCTION-CHECKLIST.md) |

---

## 3. Yang sudah Done (jangan diulang)

### 3.1–3.4
v1.0 · v2.0 pembukuan · UI2 · SOPI v2.1 — lihat [`STATUS.md`](./STATUS.md)

### 3.5 v2.2 Accounting depth (10 Agustus 2026) — **shipped**
- Cash Flow statement (indirect) + export CSV/PDF
- Auto-COGS average (DR 5100 / CR 1300) · inventory costing · reverse · cron 4 jam WIB
- Export GL Accurate / Jurnal / MYOB (XLSX/CSV) + mapping editable
- e-Faktur XML dari journal posted
- Tutup buku checklist + period lock enforce + unlock owner
- Non-gangguan OpenAPI: hook COGS setelah order di DB; tidak rewrite OAuth/webhook
- Spec: [`prd/v2.2/`](../PRD/v2.2/) · prep: [`PRD-v2.2-Accounting-Depth-PREP.md`](./PRD-v2.2-Accounting-Depth-PREP.md)

### 3.6 Ops / deploy DN Tech
- VPS tanpa Docker · pm2 · `shop.dntech.id` / `api.shop.dntech.id`
- Migration prod termasuk `172304…AddV22AccountingDepth`

---

## 4. Conditional ops (bukan gap kode)

| Item | Catatan |
|------|---------|
| Live Shopee partner | `SHOPEE_PARTNER_ID` / `KEY` + webhook portal; kosong = mock |
| Partner verification | Ops — [`sopi/…remediation-plan…`](../sopi/dnshop-shopee-partner-remediation-plan-id.md) |
| SMTP / Redis / TIER_ENFORCE | Via env |
| UAT Accurate import / DJP XML | Manual — checklist V22 |

---

## 5. Greenfield PRD berikutnya

### 5.1 v3.0 — Multi-marketplace (Jalur C — **P0 berikutnya**)
Tokopedia connector · unified order model · settlement lintas channel

### 5.2 Ops parallel (bukan epic coding v3.0)
Partner Shopee profile + trial account + proof PDF

---

## 6. Checklist story (wajib)

1. AC Given/When/Then · 2. RBAC + `shopId` · 3. Audit finansial · 4. Mock Shopee tetap jalan · 5. Regresi seed · 6. Update STATUS.md · 7. **Tidak merusak** OAuth/webhook/cron Shopee

---

## 7. Satu kalimat penutup

> dnShop Finance **v2.1 go-live + v2.2 accounting depth sudah di repo**. PRD berikutnya = **v3.0 multi-marketplace** — jangan ulangi cash flow / COGS / export / e-Faktur / OAuth sebagai fitur baru.

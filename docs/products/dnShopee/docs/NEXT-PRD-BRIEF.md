# dnShop Finance — Briefing Dasar PRD Berikutnya

| | |
|---|---|
| **Dokumen** | Brief untuk menulis PRD / SRS / SDD **berikutnya** |
| **Tanggal** | 10 Agustus 2026 |
| **Baseline kode** | v1.0 + v2.0 + UI2 + SOPI v2.1 + **v2.2 Accounting depth** |
| **Spec terakhir (shipped)** | [`prd/v2.2/`](../PRD/v2.2/) · [`prd/sopi/`](../PRD/sopi/) · [`prd/`](../PRD/) |
| **Spec berikutnya** | **v3.0 Multi-marketplace** (belum ada draft formal) |
| **Owner** | Dozer (CEO + Tech Lead) · DN Tech |
| **Prod** | `https://shop.dntech.id` · `https://api.shop.dntech.id` |
| **Arsip v2.2 prep** | [`PRD-v2.2-Accounting-Depth-PREP.md`](./PRD-v2.2-Accounting-Depth-PREP.md) |

> **Cara pakai:** Jangan janjikan ulang §3. Tulis story hanya untuk §5–§6.

---

## 1. Keputusan singkat

| Jalur | Isi | Status |
|-------|-----|--------|
| **A — SOPI v2.1** | Live Shopee ops, tier, email, UI2 | **Shipped** |
| **B — Accounting v2.2** | Cash flow, COGS, export, e-Faktur, tutup buku | **Shipped** 10 Agu 2026 |
| **C — Multi-marketplace** | Tokopedia + unified orders | **P0 berikutnya → v3.0** |

**Rekomendasi P0:** **Jalur C — PRD v3.0**.

Versi:
- **v2.1** — Go-live / SOPI ← shipped  
- **v2.2** — Accounting depth ← **shipped**  
- **v3.0** — Multi-marketplace ← **sekarang**

---

## 2. Snapshot produk (jangan di-rebuild)

| Item | Nilai |
|------|--------|
| Produk | Dashboard Shopee + pembukuan bonus + accounting depth |
| Stack | Next 15 / Nest 10 / Postgres / Socket.io / ExcelJS |
| Shopee | Mock atau live · cron order/income · webhook HMAC |
| Accounting | Cash flow · auto-COGS · GL export · e-Faktur journal · period lock |
| Tier | Free 100 lifetime · Starter 5000/mo |
| Deploy | VPS pm2 · [DEPLOY-VPS.md](./DEPLOY-VPS.md) · [V22-PRODUCTION-CHECKLIST.md](./V22-PRODUCTION-CHECKLIST.md) |

Detail: [STATUS.md](./STATUS.md) · [docs.md](./docs.md)

---

## 3. Yang sudah Done (jangan ulangi)

### v1.0 + v2.0 + UI2 + SOPI v2.1
Auth · orders/tax/bank/reports · CoA/journal/GL/P&L/BS · OAuth/webhook/cron · tier · email · wizard · realtime

### v2.2 Accounting depth
- Cash Flow indirect + CSV/PDF (`/journal/cf`)
- Auto-COGS average + costing + reverse + cron 4h WIB
- Accurate / Jurnal / MYOB export + mapping UI
- e-Faktur dari journal posted
- Close-period checklist + lock enforce
- Constraint: **tidak mengganggu** Shopee OpenAPI contracts

---

## 4. Conditional ops (bukan backlog coding v3.0)

| Item | Catatan |
|------|---------|
| Partner Shopee credentials / verification | Ops + [`sopi/`](../sopi/) |
| SMTP / Redis / beta cohort | Ops |
| UAT Accurate import / DJP | Ops checklist V22 |

---

## 5. Greenfield valid untuk PRD v3.0

| Prioritas | Tema | Catatan |
|-----------|------|---------|
| **P0** | Tokopedia OAuth + order sync | Adapter terpisah; jangan pecah model Shopee |
| **P0** | Unified order / settlement model | Channel-agnostic di DB |
| **P1** | Dashboard multi-channel | Filter by marketplace |
| **P2** | Lazada / TikTok Shop | Setelah dual-channel stabil |

### Out of scope v3.0
- Rework cash flow / COGS / e-Faktur / period lock (sudah v2.2)
- Rewrite Shopee OAuth/webhook (sudah v2.1)
- Mobile app / white-label firm accounting

---

## 6. Outline disarankan PRD v3.0

### Outcome
Seller kelola **lebih dari satu marketplace** dengan order/settlement terpadu dan pembukuan yang sama.

### In scope
1. Tokopedia connector  
2. Unified order schema + UI channel badge  
3. Settlement lintas channel (minimal report)  
4. Regresi: Shopee path + v2.2 reports tetap hijau  

### Risks
- Dual OAuth complexity · rate limits · mapping CoA per channel

---

## 7. Checklist story (wajib)

| # | Pertanyaan |
|---|------------|
| 1 | AC testable? |
| 2 | Isolasi `shopId` + channel? |
| 3 | Shopee sync/webhook **tidak regress**? |
| 4 | v2.2 cash flow / COGS tetap jalan? |
| 5 | Mock mode per connector? |
| 6 | Update STATUS.md + FEATURE-CATALOG? |

---

## 8. Satu kalimat penutup

> **v2.2 accounting depth sudah shipped**; PRD berikutnya **bukan** “laporan arus kas lagi”, melainkan **multi-marketplace v3.0** (mulai Tokopedia) tanpa merusak jalur Shopee + pembukuan yang ada.

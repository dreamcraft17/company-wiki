# dnShop Finance — Briefing Dasar PRD Berikutnya

| | |
|---|---|
| **Dokumen** | Satu file utuh untuk menulis PRD / SRS / SDD **v2.2** |
| **Tanggal** | 6 Agustus 2026 |
| **Baseline kode** | v1.0 + v2.0 Pembukuan + UI2 ops desk + **SOPI v2.1 go-live** — semuanya di repo |
| **Spec terakhir (shipped)** | [`prd/`](../PRD/) v1.0+v2.0 · [`prd/sopi/`](../PRD/sopi/) v2.1 · Design [`prd/v2/…_Design.md`](../PRD/v2/dnShop_Finance_v2.1_Design.md) |
| **Spec berikutnya** | **v2.2 Accounting depth** (belum ada draft file — tulis dari outline §6) |
| **Owner** | Dozer (CEO + Tech Lead + PM) · DN Tech |
| **Path** | `dnShopee/` |
| **Prod (DN Tech)** | Web `https://shop.dntech.id` · API `https://api.shop.dntech.id` |
| **Ganti dokumen ini?** | Setelah PRD v2.2 di-sign-off atau baseline berubah |

> **Cara pakai:** Baca atas → bawah. Jangan janjikan ulang §3 sebagai fitur baru. Tulis story hanya untuk §5–§6. Setiap story wajib memenuhi §7.

---

## 1. Keputusan singkat: PRD berikutnya tentang apa?

| Jalur | Isi | Status |
|-------|-----|--------|
| **A — Go-live ops (v2.1 / SOPI)** | Live Shopee, SMTP, Redis, onboarding, tier, observability, UI2 | **Shipped** 6 Agu 2026 |
| **B — Pembukuan Phase 3** | Cash flow, COGS, sync MYOB/Jurnal/Accurate, e-Faktur dari jurnal | **P0 berikutnya → v2.2** |
| **C — Multi-marketplace** | Tokopedia + unified orders | Setelah B atau adopsi stabil → v3.0 |

**Rekomendasi P0:** **Jalur B** sebagai **PRD v2.2 — Accounting Depth**.

Alasan: go-live stack sudah di kode (OAuth, webhook, income sync, email templates, OTP, tier 100/5000, wizard, alerts). Gap berikutnya adalah **kedalaman akuntansi** yang dijanjikan Phase 3 PRD v2.0 — bukan rework integrasi Shopee.

Nomor versi:
- **v2.1** — Go-live ops / SOPI ← **shipped**
- **v2.2** — Accounting depth (Jalur B) ← **sekarang**
- **v3.0** — Multi-marketplace (Jalur C)

---

## 2. Snapshot produk saat ini (jangan di-rebuild)

| Item | Nilai |
|------|--------|
| Produk | Dashboard keuangan Shopee + **pembukuan bonus seller** |
| Frontend | Next.js 15 · React 19 · Tailwind · Recharts · port **6000** |
| UI | UI2 ops desk — Syne + IBM Plex · signal orange · theme dark/light |
| Backend | NestJS 10 · TypeORM · JWT · Socket.io · port **6001** |
| Shopee | Mock / live · order cron 06:00 WIB · income 08:00 WIB · webhook HMAC + DLQ |
| Tier | Free 100 lifetime · Starter 5000/mo · `TIER_ENFORCE` |
| Email | HTML templates · `email_log` · bounce · OTP · reset password |
| Deploy | VPS tanpa Docker · pm2 · Supabase/Postgres |
| Tests | Backend **26** pass |
| Demo | [DEMO-ACCOUNTS.md](./DEMO-ACCOUNTS.md) |

Detail: [STATUS.md](./STATUS.md) · [docs.md](./docs.md) · [DEPLOY-VPS.md](./DEPLOY-VPS.md).

---

## 3. Yang sudah Done (jangan ulangi di PRD sebagai “baru”)

### v1.0 + v2.0
Auth · orders/payments/tax/bank/reports · pembukuan CoA/journal/GL/P&L/BS/audit · dashboard charts

### UI2 ops desk
Design tokens · wizard · upsell · Shopee connect panel · theme toggle · auth OTP/reset UI

### SOPI / v2.1 go-live
- OAuth Redis state · callback alias · order/income sync · auto-journal
- Webhook SOPI + DLQ replay · tier 100/5000 + enforcement log
- Onboarding step-1/2/3 · email templates + bounce · ops alerts
- Realtime socket · beta invite/UAT playbook

### Ops DN Tech
`shop.dntech.id` / `api.shop.dntech.id` · health · DEPLOY-VPS · RUNBOOK

---

## 4. Conditional ops (bukan backlog coding v2.2)

| Item | Catatan |
|------|---------|
| Partner Shopee credentials | Ops: isi env + daftar webhook |
| SMTP / DKIM | Ops: deliverability |
| Redis | Ops: aktifkan untuk queue load |
| Beta 10–50 seller | Ops: jalankan [UAT-PLAYBOOK-v2.1.md](./UAT-PLAYBOOK-v2.1.md) |

---

## 5. Greenfield / baru valid untuk PRD v2.2

| Prioritas | Tema | Catatan |
|-----------|------|---------|
| **P0** | Cash Flow Statement (indirect) | Dari posted journals |
| **P0** | COGS dari inventori | FIFO / average — taut ke stock movements |
| **P1** | Export / sync MYOB · Jurnal · Accurate | Mapping CoA + CSV/API |
| **P1** | e-Faktur XML dari posted journals | Extend tax module existing |
| **P2** | Multi-currency / kurs | Hanya jika seller cross-border muncul |
| **P2** | In-app help pembukuan lanjutan | Copy seller-friendly |

### Out of scope v2.2
- Rebuild OAuth / webhook / email / onboarding / tier (sudah v2.1)
- Redesign UI dasar (sudah UI2)
- Tokopedia / multi-marketplace → v3.0
- Mobile app

---

## 6. Outline disarankan PRD v2.2 — skeleton

### 6.1 Outcome
Seller dengan pembukuan aktif mendapat **laporan arus kas**, **HPP otomatis**, dan jalur **ekspor ke software akuntansi / e-Faktur** tanpa double entry manual.

### 6.2 In scope
1. Cash Flow Statement  
2. COGS automation dari inventori  
3. Connector/export MYOB · Jurnal · Accurate (minimal CSV + mapping)  
4. e-Faktur dari jurnal posted  
5. Uji regresi seed + mock Shopee  

### 6.3 Out of scope
- Marketplace baru  
- Rework go-live ops  
- White-label firm accounting  

### 6.4 Risks
- COGS salah → laba rugi menyesatkan  
- Mapping CoA ke Accurate/Jurnal tidak 1:1  
- e-Faktur compliance DJP berubah  

### 6.5 Success metrics (contoh)
| Metric | Target | Timeline |
|--------|--------|----------|
| Seller generate Cash Flow | ≥40% toko dengan ≥20 entri/bln | +8 minggu |
| COGS entries auto | ≥80% order delivered punya HPP | +8 minggu |
| Export Accurate/Jurnal sukses | ≥10 toko uji | +12 minggu |

---

## 7. Checklist story (wajib)

| # | Pertanyaan |
|---|------------|
| 1 | Acceptance Criteria Given/When/Then testable? |
| 2 | RBAC toko + permission `journal`? |
| 3 | Isolasi `shopId`? |
| 4 | Audit trail mutasi finansial? |
| 5 | Mock Shopee tetap jalan? |
| 6 | Regresi seed `seller@dnshop.id`? |
| 7 | Failure path + retry? |
| 8 | Env & deploy doc di-update? |
| 9 | Update STATUS.md setelah ship? |

---

## 8. Definition of Done dokumen PRD (sebelum coding)

- [ ] Fokus Jalur B jelas (bukan campur Tokopedia)  
- [ ] In/out scope  
- [ ] Mapping ke baseline (file ini + STATUS.md + docs.md)  
- [ ] NFR: latency laporan, akurasi COGS  
- [ ] Security: export credentials, shop isolation  
- [ ] Test strategy  
- [ ] Runbook update  

---

## 9. Preview v3.0 (Multi-marketplace) — PRD terpisah

| Fitur | Catatan |
|-------|---------|
| Tokopedia connector | OAuth + order sync |
| Unified order model | Channel-agnostic |
| Settlement lintas channel | Setelah dual-channel stabil |

Prasyarat: go-live Shopee cohort sehat + (ideal) v2.2 cash flow/COGS dipakai.

---

## 10. Satu kalimat penutup

> dnShop Finance **sudah go-live ops (SOPI v2.1) + UI2**; PRD berikutnya **bukan** “hubungkan Shopee / email lagi”, melainkan **accounting depth v2.2** (cash flow, COGS, sync akuntansi, e-Faktur).

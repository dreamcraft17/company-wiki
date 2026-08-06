# dnShop Finance — Kondisi Saat Ini & Persiapan PRD Berikutnya

| | |
|---|---|
| **Dokumen** | Baseline living + briefing PRD berikutnya |
| **Tanggal** | 6 Agustus 2026 |
| **Produk** | dnShop Finance — dashboard seller Shopee + **pembukuan sebagai bonus seller** |
| **Baseline kode** | v1.0 + **v2.0 Pembukuan** + dashboard charts + **UI2 ops desk** + **SOPI go-live (v2.1)** |
| **Spec shipped** | PRD / SRS / SDD **v1.0 + v2.0** di [`prd/`](../PRD/) · **v2.1 SOPI** di [`prd/sopi/`](../PRD/sopi/) · Design UI2 di [`prd/v2/…_Design.md`](../PRD/v2/dnShop_Finance_v2.1_Design.md) |
| **Spec berikutnya** | **v2.2** Accounting depth — [`NEXT-PRD-BRIEF.md`](./NEXT-PRD-BRIEF.md) |
| **Owner** | Dozer (CEO + Tech Lead) · DN Tech |
| **Path** | `dnShopee/` |
| **Prod (DN Tech)** | Web `https://shop.dntech.id` · API `https://api.shop.dntech.id` |

> **Cara pakai:** Jangan janjikan ulang §3 sebagai fitur baru. Tulis PRD berikutnya hanya dari §5–§6.

---

## 1. Keputusan singkat: PRD berikutnya tentang apa?

| Jalur | Isi | Kapan |
|-------|-----|--------|
| **A — Go-live ops (v2.1 / SOPI)** | Partner Shopee live, SMTP, Redis, onboarding, tier, observability | **Shipped** — 6 Agustus 2026 |
| **B — Pembukuan Phase 3** | Cash flow statement, COGS inventory automation, MYOB/Jurnal/Accurate sync, e-Faktur dari jurnal | **Berikutnya → v2.2** |
| **C — Multi-marketplace** | Tokopedia connector + unified orders | Setelah B atau cohort adopsi stabil |

**Rekomendasi:** **Jalur B → v2.2**. Detail: [`NEXT-PRD-BRIEF.md`](./NEXT-PRD-BRIEF.md).

---

## 2. Snapshot produk saat ini

| Item | Nilai |
|------|--------|
| Frontend | Next.js 15 · React 19 · Tailwind · Recharts · port **6000** |
| UI | **UI2 ops desk** — Syne + IBM Plex · signal orange · panel tajam · theme dark/light |
| Backend | NestJS 10 · TypeORM · JWT · Socket.io `/realtime` · port **6001** |
| Pembukuan API | `/api/v1/shops/:shopId/journals/...` |
| Posisi fitur | Nav **Pembukuan** — **bonus seller**, bukan produk akuntansi terpisah |
| Dashboard | KPI + tren + pie/bar · filter **7 hari / 30 hari / custom** |
| Shopee | Mock jika key kosong · live OAuth + webhook + cron order/income jika key set |
| Tier | Free **100 lifetime** · Starter **5000/bulan** · Pro/Ent unlimited (`TIER_ENFORCE`) |
| Feature flag | `ENABLE_JOURNALING` (default true) |
| DB prod | Supabase Postgres (`DB_SSL=true`) atau Postgres native |
| Demo | Seed CoA + 100+ entries — [DEMO-ACCOUNTS.md](./DEMO-ACCOUNTS.md) |
| Tests | Backend **26** pass (tax · shopee · phase2 · journal · v21/SOPI) |

---

## 3. Yang sudah Done (jangan diulang)

### 3.1 v1.0 (tetap)
Auth · Shopee OAuth mock/live · sync · products/orders/payments · dashboard agregat · reports PDF · tax · bank CSV · team RBAC · notifications

### 3.2 v2.0 Pembukuan seller (bukan modul terpisah)
- **Posisi produk:** bonus di akun seller — Dashboard / Laporan / Pajak / Bank / menu **Pembukuan**
- Chart of Accounts template **SAK EMKM 45 akun** + custom 4-digit
- Manual journal · auto-journal Shopee · GL · TB · P&L · BS · audit PDF · bank match
- Frontend `/journal/*` (label UI: **Pembukuan**) · permission `journal`

### 3.3 Dashboard & UI2 ops desk (Agustus 2026)
- Chart tren, komposisi, status, metode bayar, produk terlaris, per-toko
- Filter periode unlimited · angka + % pada pie
- Design system UI2: tokens dark ops desk, wizard, upsell, Shopee connect, theme toggle
- Spec: [`prd/v2/dnShop_Finance_v2.1_Design.md`](../PRD/v2/dnShop_Finance_v2.1_Design.md)

### 3.4 SOPI go-live / v2.1 (6 Agustus 2026) — **shipped**
- Live Shopee OAuth (Redis/memory state TTL 10m) · `/auth/shopee-callback`
- Order sync cursor ~06:00 WIB · income `get_income_detail` ~08:00 WIB + auto-journal
- Webhook `POST /api/v1/webhooks/shopee` · HMAC SOPI · DLQ + admin replay
- Tier Free 100 lifetime / Starter 5000/mo · `tier_enforcement_log`
- Onboarding pembukuan step-1/2/3 + wizard UI
- HTML email templates + `email_log` · bounce webhook · forgot rate-limit 3/jam
- OTP verify UI · reset password
- Ops alerts (email &lt;90%/1h, DLQ &gt;10, Redis, 5xx) · health extended
- Socket.io realtime · beta invite + UAT checklist
- Spec: [`prd/sopi/`](../PRD/sopi/) · status: [`STATUS.md`](./STATUS.md)

### 3.5 Ops / deploy DN Tech
- VPS **tanpa Docker** · pm2 `dnshop-api` / `dnshop-web`
- Domain: `shop.dntech.id` · `api.shop.dntech.id`
- Cloudflare: `api.shop.*` → **DNS only** + LE origin (bukan Proxied Universal SSL)
- Health: `GET /api/v1/auth/health`

---

## 4. Conditional ops (bukan gap kode)

| Item | Catatan |
|------|---------|
| Live Shopee partner | Butuh `SHOPEE_PARTNER_ID` / `KEY` + webhook di portal Shopee; kosong = mock |
| SMTP | Kirim jika SMTP set; tanpa itu log + `email_log` status |
| Redis | Queue/Bull jika `REDIS_HOST` set; fallback inline / memory state |
| Beta cohort | Playbook siap — eksekusi 10–50 seller = ops, bukan coding |

---

## 5. Greenfield PRD berikutnya

> **Brief:** [`NEXT-PRD-BRIEF.md`](./NEXT-PRD-BRIEF.md)

### 5.1 v2.2 — Accounting depth (Jalur B — **P0 berikutnya**)
Cash Flow Statement · COGS dari inventori · sync MYOB/Jurnal/Accurate · e-Faktur dari posted journals

### 5.2 v3.0 — Multi-marketplace (Jalur C)
Tokopedia adapter · unified order model · settlement lintas channel

---

## 6. Checklist story (wajib)

1. Acceptance Given/When/Then  
2. RBAC toko + `journal` permission  
3. Isolasi `shopId`  
4. Audit pada mutasi finansial  
5. Mock Shopee tetap jalan  
6. Regresi seed `seller@dnshop.id`  
7. Update STATUS.md  

---

## 7. Satu kalimat penutup

> dnShop Finance **v2.0 pembukuan + UI2 ops desk + SOPI v2.1 go-live sudah di repo**. PRD berikutnya = **v2.2 accounting depth** — jangan ulangi OAuth/webhook/email/onboarding/tier/UI dasar.

# dnShop Finance v2.1 — Production Go-Live & Seller Scale

**Document ID:** `dnShop_Finance_v2.1_PRD.md`  
**Version:** 2.1.0  
**Date:** August 2026  
**Owner:** Dozer (CEO + Tech Lead + PM, DN Tech)  
**Status:** **Implemented** (6 Agustus 2026) — lihat `docs/STATUS.md`  
**Related:** [v2.1 SRS](./dnShop_Finance_v2.1_SRS.md) · [v2.1 SDD](./dnShop_Finance_v2.1_SDD.md) · Living brief [`docs/docs.md`](../../docs/docs.md) · Next [`docs/NEXT-PRD-BRIEF.md`](../../docs/NEXT-PRD-BRIEF.md) (v2.2)

---

## 1. Executive Summary

dnShop Finance **v2.0 pembukuan** adalah fitur bonus di dashboard seller Shopee — CoA SAK EMKM, manual journal, auto-journal, GL, P&L, dan audit. Produk sudah live di prod DN Tech.

**v2.1 fokus Go-live ops** — menghubungkan Shopee seller nyata, email transaksional, onboarding terpandu, dan tier enforcement. Tanpa ini, pembukuan tidak teruji di lapangan, revenue lock tidak bekerja, dan tim ops buta terhadap health produk.

**Outcome:** 10–50 seller Shopee nyata connect toko, selesaikan onboarding pembukuan (apply CoA template, auto-journal backfill), dan punya email terverifikasi — semuanya dalam 8 minggu.

---

## 2. Problem Statement

### 2.1 Current state
> **Addendum (6 Agustus 2026):** Item go-live di bawah sudah **diimplementasikan** di repo. Checklist historis problem statement tetap untuk konteks PRD.

- ✅ Pembukuan MVP sudah di repo (v2.0) + prod DN Tech jalan
- ✅ Dashboard dengan chart + filter periode
- ✅ Shopee OAuth live (mock jika key kosong) + Redis/memory state
- ✅ Webhook order/payment + HMAC SOPI + DLQ
- ✅ SMTP + HTML templates + `email_log` + bounce (fallback log tanpa SMTP)
- ✅ Onboarding pembukuan wizard step-1/2/3
- ✅ Tier enforcement Free 100 lifetime / Starter 5000/mo
- ✅ UAT playbook + beta invite API
- ✅ Observability — health extended, metrics, ops alerts

### 2.2 Why it matters
Tanpa **live Shopee + email + onboarding**, fitur pembukuan adalah sandbox demo. Seller nyata tidak bisa:
- Sync order/payment otomatis
- Verifikasi akun (forget password, re-invite, dll.)
- Memahami langkah pertama setup pembukuan
- Percaya sistem (jika observability tidak ada, breakdown tidak terdeteksi)

Tanpa **tier enforcement**, revenue model "free lock at 100 entries" tidak berlaku. Model ini adalah upsell gate untuk Starter/Pro.

---

## 3. Goals & Success Metrics

### 3.1 Product Goals
1. **Live Shopee integration** — Seller connect toko OAuth live, order/payment auto-sync harian
2. **Email transaksional** — Verifikasi email, reset password, settlement notifikasi
3. **Onboarding pembukuan** — Empty state → wizard CoA → auto-journal → ready to use
4. **Revenue gating** — Free lock at 100 entries; Starter/Pro unlock; paid tier enforcement hidup
5. **Operational visibility** — Tim ops bisa monitor sync latency, email delivery, error count

### 3.2 Success Metrics (8 weeks)
| Metric | Target | Measurement |
|--------|--------|-------------|
| Live Shopee sellers connected | ≥10 toko | Analytics + DB query |
| Email verification rate | ≥95% delivered to inbox | SMTP delivery log |
| Onboarding completion (pembukuan wizard) | ≥60% beta users | Funnel: clicked wizard → applied template → auto-journal ON |
| Order sync latency p95 | <5 menit order placed → visible dashboard | Cloud logs + timestamp delta |
| Zero P0 incidents without runbook response | ≥7 consecutive days | Incident log + post-mortem |
| Tier enforcement block (free→100 entry cap) | 100% accuracy | Test case + prod validation |

---

## 4. In Scope (v2.1)

### 4.1 Shopee Live Integration
- **OAuth flow** — Seller click "Hubungkan Toko Shopee" → redirect Shopee Open API auth → code exchange → token store
- **Credentials management** — Partner ID, Partner Key, access_token, refresh token; rotation + expiry handling
- **Order sync** — `GET /api/v2/order/get_order_list` (15-day windows) + `get_order_detail` (batch 50) → daily scheduled task
- **Payment sync** — `GET /api/v2/payment/get_income_detail` (14-day windows) → order-level escrow + release
- **Auto-journal from income** — DR bank / DR komisi → CR penjualan untuk setiap order release
- **Webhook listener** — Shopee push order/payment events (async, retry, HMAC verify)
- **Token refresh** — Cron every 3h to refresh access_token before 4h expiry
- **Reconciliation** — Match payout dari Shopee vs bank match jurnal (P1, dapat backlog ke v2.2)

### 4.2 SMTP Production
- **Email verifikasi** — OTP atau magic link di signup/login
- **Forget password** — Reset email dengan token
- **Settlement notifikasi** — "Dana masuk Rp X dalam waktu Y"
- **Template system** — HTML templates + variable inject (seller name, amount, date)
- **Bounce handling** — Log undeliverable, retry logic

### 4.3 Onboarding Pembukuan
- **Empty state UX** — Dashboard Pembukuan kosong → "Mulai sekarang" button
- **Wizard 3-step** — 
  1. Select CoA template (SAK EMKM / custom)
  2. Review setup (autofill dari Shopee toko)
  3. Enable auto-journal + backfill 30 hari terakhir
- **Auto-journal backfill** — Fetch Shopee orders/payments 30 hari lalu, create GL entries via `/api/v2/payment/get_income_detail`
- **Result confirmation** — "Berhasil import N transaksi, ready to review"

### 4.4 Tier Enforcement
- **Free tier** — 100 manual + auto journal entries; pembukuan read-only setelah hit
- **Starter tier** — 5000 entries/month; upsell banner di dashboard
- **Pro tier** — Unlimited; full feature access
- **Gating logic** — API reject POST `/journals/entries` if `journal_count >= tier_limit`
- **UI upsell** — "Unlock pembukuan unlimited dengan upgrade ke Starter"

### 4.5 Observability (Minimum)
- **Structured logging** — JSON log format (timestamp, level, service, shopId, action, duration, error)
- **Health endpoint extended** — `/api/v1/auth/health` + sync status (last order sync, last payment sync, latency)
- **Metrics endpoint** — `/api/v1/admin/metrics` (internal) — sync count/min, email sent/failed, journal entries created
- **Alert threshold** — Email delivery <90% in 1h, sync latency >10min, 5xx error rate >1%, Redis down
- **Error tracking** — Log semua webhook miss, sync retry, tier enforcement trigger

### 4.6 Beta UAT Playbook
- **Seller recruitment** — 10–50 seller via invite link + early-access perks
- **Checklist UAT** — 12-point form (sync works, email arrives, tier lock works, journal import OK, etc.)
- **Feedback channel** — In-app form + Telegram/email support
- **Rollback plan** — Tier enforcement flag `TIER_ENFORCE=false` untuk fast revert

### 4.7 Documentation & Deploy
- **SRS + SDD** — Detailed spec + architecture (next docs)
- **DEPLOY-VPS.md update** — Shopee credentials setup, SMTP config, webhook URL, cron schedule
- **Runbook** — Emergency: sync restart, email queue clear, tier enforcement reset
- **Dev setup** — Mock Shopee OAuth + test token flow locally

---

## 5. Out of Scope (→ v2.2 or later)

- **Cash Flow Statement** — post-v2.1 (v2.2)
- **COGS inventory automation** — post-v2.1 (v2.2)
- **e-Faktur XML export** — post-v2.1 (v2.2)
- **MYOB/Jurnal/Accurate sync** — post-v2.1 (v2.2)
- **Tokopedia integration** — v3.0 (multi-marketplace)
- **White-label accounting** — future (if revenue model changes)
- **Mobile app** — future
- **Webhook redundancy (dead-letter queue)** — v2.2 (P1, not P0)
- **UI redesign** — already done (Agustus 2026, ops desk)

---

## 6. Key Features Breakdown

### 6.1 Shopee Live OAuth & Token Management
**User story:** As a seller, I want to click "Hubungkan Shopee" and authorize my shop, so my orders and payments sync automatically.

**Acceptance:**
- Seller redirected to Shopee OAuth portal → approves → redirected back with `code`
- Backend exchanges `code` → `access_token` + `refresh_token` + expiry
- Tokens stored encrypted in DB; not logged
- Token refresh cron runs every 3h, before 4h expiry; retry on fail
- New seller sees "Toko terhubung ✓" in dashboard after OAuth

**Shopee API:** `GET /api/v2/order/get_order_list`, `GET /api/v2/order/get_order_detail`, `GET /api/v2/payment/get_income_detail`

---

### 6.2 Order Sync Pipeline
**User story:** As a seller, I want orders placed on Shopee to appear in dnShop Finance dashboard automatically each day.

**Acceptance:**
- Daily cron (6am UTC+7) calls `get_order_list` (15-day window sliding)
- Fetches READY_TO_SHIP, PROCESSED, SHIPPED, COMPLETED orders
- Batches `order_sn` list, calls `get_order_detail` (max 50/call)
- Upserts order record (idempotent key: shop_id + order_sn)
- Dashboard KPI refreshed within 5min of sync
- Sync failure triggers alert + retry in 1h

**Data stored:** order_sn, order_status, item_list (name, price, qty), total_amount, buyer_username, recipient_address, payment_method, create_time, update_time

---

### 6.3 Payment/Income Sync & Auto-Journal
**User story:** As a seller, I want payout amounts from Shopee to auto-journal so I don't manually enter every transaction.

**Acceptance:**
- Daily cron (8am UTC+7) calls `get_income_detail` (14-day window sliding)
- Filters `income_status=1` (Released) to capture settled income
- For each released order:
  - Create GL entry: DR Bank / DR Komisi Shopee → CR Penjualan (SAK EMKM acct mapping)
  - Amount = `released_amount`; date = `actual_payout_time`
  - Status: AUTO; reference: order_sn
  - Can be reversed by seller if dispute
- Auto-journal entries immutable at GL level but reversible via UI
- Backfill on first onboarding: fetch 30-day history, bulk insert

**Shopee mapping to GL:**
- Bank acct: 1110 (Kas di Bank)
- Komisi acct: 5120 (Komisi & Biaya Marketplace)
- Penjualan acct: 4110 (Penjualan Produk) — or sub-account per category if multi-seller toko
- Kurs loss/gain: 5140 (if cross-border + FX)

---

### 6.4 Webhook Listener for Real-time Updates
**User story:** As a seller, I want my orders to appear in dashboard within seconds of purchase, not wait for daily cron.

**Acceptance:**
- Webhook endpoint: `POST /api/v1/webhooks/shopee`
- Verify HMAC-SHA256 signature using partner_key
- Parse order/payment event → upsert DB → emit WebSocket event to frontend
- Retry on 5xx: exponential backoff (1s, 2s, 4s, 8s, 16s)
- Max 5 retries; after fail, log to dead-letter queue for manual inspection
- Webhook response must be `{ code: 0 }` within 5s, or Shopee retry

**Events:** order.create, order.ship, payment.escrow, payment.release

---

### 6.5 SMTP Setup & Email Verification
**User story:** As a seller, I want to receive a verification email on signup, and reset my password via email.

**Acceptance:**
- On signup: generate OTP (6-digit) or JWT token
- Send email: `[seller name], verify your email: [link or OTP]`
- Link expires in 24h; OTP expires in 10min
- Resend available after 60s of prev attempt
- On click/OTP, mark `verified=true` in user record
- Forget password: email reset link → POST new password (no old pwd needed)
- Settlement email (triggered by payout webhook): "Dana Anda Rp X berhasil ditransfer [date]"
- All templates in `templates/` folder; injectable variables `{{ seller_name }}`, `{{ amount }}`, etc.

**SMTP config env vars:**
```
SMTP_HOST=smtp.gmail.com (or SendGrid, Brevo, etc.)
SMTP_PORT=587
SMTP_USER=noreply@dntech.id
SMTP_PASS=(app-specific pwd)
SMTP_FROM=noreply@dntech.id
```

---

### 6.6 Onboarding Wizard for Pembukuan
**User story:** As a new seller, I want a guided setup for pembukuan so I don't get lost.

**Acceptance:**
- Endpoint: `GET /api/v1/shops/:shopId/onboarding/pembukuan` → returns wizard state (step 1/2/3, progress)
- **Step 1 — Template selection:**
  - Radio: SAK EMKM (default) vs Custom
  - If custom: user can add/remove accounts; preview final CoA
  - POST → save selected template
- **Step 2 — Review & auto-journal:**
  - Show: "Toko Anda sejak 30 hari lalu: N order, Rp Y total"
  - Toggle: "Auto-import journal entries? (Rekomendasi: Ya)"
  - POST → apply CoA + trigger backfill sync
- **Step 3 — Confirmation:**
  - "Berhasil! Pembukuan siap digunakan. Lihat GL sekarang" → redirect `/journal/ledger`
  - Show: "N transaksi sudah di-import. Review & approve dalam 7 hari."
- Seller dapat skip → empty state tetap, trigger onboarding reminder setelah 3 hari

---

### 6.7 Tier Enforcement
**User story:** As a business, I want free tier capped at 100 entries so upsell to Starter tier works.

**Acceptance:**
- User tier stored in shop record: free / starter / pro / enterprise
- On each POST `/journals/entries`:
  - Count existing journal entries (manual + auto)
  - If `tier == 'free' && count >= 100` → return `403 Forbidden` with message "Pembukuan unlimited tersedia di Starter"
  - Log tier enforcement trigger (for analytics)
- Starter tier: cap 5000/month (soft limit, can be exceeded with email warning)
- Pro/Enterprise: unlimited
- UI shows "Unlimited entries dengan upgrade ke Starter — Rp 99k/bulan" banner below entry form
- Dev flag `TIER_ENFORCE=false` to bypass (for testing / demo)

---

### 6.8 Observability & Health Monitoring
**User story:** As an ops engineer, I want to know if sync is running, latency, and email delivery rate.

**Acceptance:**
- **Endpoint `/api/v1/auth/health` extended:**
  ```json
  {
    "ok": true,
    "timestamp": "2026-08-05T10:00:00Z",
    "services": {
      "db": "healthy",
      "redis": "healthy (if enabled)",
      "shopee_sync": "last_run: 2026-08-05T06:00:00Z, latency: 2.5s, orders_synced: 42",
      "email": "sent: 150, failed: 2, delivered_rate: 98.7%"
    }
  }
  ```
- **Endpoint `/api/v1/admin/metrics` (internal only, IP-gated):**
  - `sync_order_count_total`, `sync_payment_count_total` (prometheus format)
  - `email_sent_total`, `email_bounce_total`
  - `journal_entry_count_by_tier` (free, starter, pro)
  - `webhook_received_total`, `webhook_failed_total`
- **JSON logs (all services):**
  ```json
  {
    "timestamp": "2026-08-05T10:00:00Z",
    "level": "info",
    "service": "order-sync",
    "shop_id": "600001",
    "action": "fetch_order_list",
    "duration_ms": 2500,
    "orders_fetched": 42,
    "error": null
  }
  ```
- **Alert thresholds (Slack/email to ops):**
  - Email delivery rate <90% over 1h window
  - Order sync latency p95 >10min
  - Webhook failure rate >5% over 1h
  - Redis unavailable
  - DB connection pool exhausted

---

## 7. Data Model Changes

### 7.1 New tables / columns
```sql
-- User verification
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN verification_token_expires_at TIMESTAMP;

-- Shop Shopee credentials (encrypted)
ALTER TABLE shops ADD COLUMN shopee_partner_id BIGINT;
ALTER TABLE shops ADD COLUMN shopee_partner_key VARCHAR(255) ENCRYPTED;
ALTER TABLE shops ADD COLUMN shopee_access_token VARCHAR(255) ENCRYPTED;
ALTER TABLE shops ADD COLUMN shopee_refresh_token VARCHAR(255) ENCRYPTED;
ALTER TABLE shops ADD COLUMN shopee_token_expires_at TIMESTAMP;
ALTER TABLE shops ADD COLUMN shopee_auth_status VARCHAR(50) DEFAULT 'pending'; -- pending, authorized, expired

-- Order sync state
CREATE TABLE shopee_orders (
  id BIGINT PRIMARY KEY,
  shop_id BIGINT REFERENCES shops(id),
  order_sn VARCHAR(50) UNIQUE NOT NULL,
  order_status VARCHAR(50),
  total_amount NUMERIC(12,2),
  payment_method VARCHAR(100),
  buyer_username VARCHAR(255),
  create_time TIMESTAMP,
  update_time TIMESTAMP,
  sync_status VARCHAR(50) DEFAULT 'synced', -- synced, journal_pending, journal_posted
  synced_at TIMESTAMP,
  UNIQUE(shop_id, order_sn)
);

-- Payment/Income sync state
CREATE TABLE shopee_income_entries (
  id BIGINT PRIMARY KEY,
  shop_id BIGINT REFERENCES shops(id),
  order_sn VARCHAR(50),
  released_amount NUMERIC(12,2),
  income_status VARCHAR(50),
  actual_payout_time TIMESTAMP,
  journal_entry_id BIGINT REFERENCES journal_entries(id),
  sync_status VARCHAR(50) DEFAULT 'pending', -- pending, auto_journaled, manual_review
  synced_at TIMESTAMP
);

-- Webhook log
CREATE TABLE webhooks_log (
  id BIGINT PRIMARY KEY,
  shop_id BIGINT REFERENCES shops(id),
  event_type VARCHAR(100),
  payload JSONB,
  signature_valid BOOLEAN,
  processed BOOLEAN,
  retry_count INT DEFAULT 0,
  last_retry_at TIMESTAMP,
  error TEXT,
  created_at TIMESTAMP
);

-- Onboarding state
ALTER TABLE shops ADD COLUMN onboarding_step INT DEFAULT 0; -- 0=not started, 1/2/3=wizard, 4=completed
ALTER TABLE shops ADD COLUMN onboarding_template_selected VARCHAR(50);
ALTER TABLE shops ADD COLUMN onboarding_auto_journal_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE shops ADD COLUMN onboarding_completed_at TIMESTAMP;

-- Tier
ALTER TABLE shops ADD COLUMN pricing_tier VARCHAR(50) DEFAULT 'free'; -- free, starter, pro, enterprise
ALTER TABLE shops ADD COLUMN tier_enforced_at TIMESTAMP;
```

### 7.2 Audit & immutability
- New column `journal_entries.auto_journal_flag` (auto-journal entries marked TRUE; manual FALSE)
- All journal mutations logged to `audit_log` (existing)
- Cannot delete auto-journal entries; can only reverse (post inverse entry)

---

## 8. Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Shopee partner approval delay | Blocks live OAuth 4+ weeks | Early sandbox testing; fallback: mock OAuth stays active for demo |
| Webhook miss → order/payment gap | Reconciliation manual burden | Daily cron catch-up; webhook retry + DLQ; reconciliation runbook |
| Email deliverability (spam filter) | Users can't verify or reset pwd | SPF/DKIM setup; warm-up period; monitor bounce rate; resend option |
| Tier enforcement breaks demo seed | Demo account can't journal anymore | `TIER_ENFORCE=false` dev flag; demo account exemption list |
| Redis unavailable (single VPS) | Queue backup, email queue bloat | Fallback: inline queue (already in code); alert on Redis down; upgrade plan for HA |
| Sync latency >10min during peak | User perceives stale data | Rate limit Shopee API calls; batch processing; async notification |
| HMAC verification fail | Webhook forgery risk | Use `partner_key` for HMAC; verify timestamp (replay attack); log all invalid signatures |

---

## 9. Timeline & Milestones (8 weeks)

| Week | Milestone | Deliverable |
|------|-----------|-------------|
| 1–2 | Setup + Shopee sandbox + email infra | SRS/SDD finalized; SMTP service live; Shopee sandbox creds |
| 3–4 | OAuth flow + order/payment sync | OAuth live; order sync cron working; payment sync + auto-journal |
| 5–6 | Webhook + onboarding wizard | Webhook listener online; wizard UI + backfill working |
| 7 | Tier enforcement + observability | Tier blocking active; health + metrics endpoints live; alerts configured |
| 8 | UAT + hardening | Beta cohort 10–50 seller; checklist validation; rollback runbook |

**Go-live:** Week 9 (soft launch with beta cohort)

---

## 10. Success Criteria Recap

✅ Shopee OAuth live for ≥10 sellers  
✅ Order sync latency p95 <5min  
✅ Email verification >95% inbox delivery  
✅ Onboarding completion ≥60% of beta users  
✅ Tier enforcement blocking correctly (100 entry cap on free)  
✅ Health endpoint responding + metrics populated  
✅ Zero P0 production incidents for ≥7 consecutive days  
✅ Runbook playbook documented + tested  

---

## 11. Glossary

- **SAK EMKM** — Standar Akuntansi Keuangan Entitas Mikro Kecil Menengah (45 account template)
- **CoA** — Chart of Accounts (daftar akun pembukuan)
- **GL** — General Ledger (buku besar)
- **Auto-journal** — Entri jurnal otomatis dari sync Shopee payment
- **Order SN** — Shopee order serial number (unique identifier)
- **Escrow** — Dana pembeli di hold di Shopee sebelum release ke seller
- **Tier enforcement** — Pembatasan fitur berdasarkan subscription tier
- **Webhook** — Push notification dari Shopee ke dnShop Finance untuk event real-time
- **Token refresh** — Renewal access_token sebelum expiry (Shopee: 4h expiry)
- **DLQ** — Dead-letter queue (failed webhook attempts backup)

---

## 12. Approval & Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | Dozer | — | — |
| Tech Lead | Dozer | — | — |
| Design | — | — | — |
| QA | — | — | — |

---

**Next:** [v2.1 SRS](./dnShop_Finance_v2.1_SRS.md)

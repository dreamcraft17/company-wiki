# dnShop Finance v2.1 — Production Go-Live & Seller Scale (REVISED)

**Document ID:** `dnShop_Finance_v2.1_PRD_v2.md`  
**Version:** 2.1.1  
**Date:** August 2026  
**Owner:** Dozer (CEO + Tech Lead, DN Tech)  
**Status:** **Implemented 100%** (6 Agustus 2026) — Local/CB + FX 5140 + payout reconcile; living `docs/STATUS.md`  
**Related:** [v2.1 SRS](./dnShop_Finance_v2.1_SRS_v2.md) · [v2.1 SDD](./dnShop_Finance_v2.1_SDD_v2.md)

---

## 1. Executive Summary

dnShop Finance v2.1 adalah **production go-live milestone** untuk seller accounting di Shopee. Fokus: menghubungkan Shopee seller nyata, auto-sync orders + payments, onboarding terpandu, dan revenue tier enforcement.

**Key differentiator v2.1:** Comprehensive payment sync dengan dukungan **Local Shop** (order payout direct) dan **Cross Border (CB) Shop** (multi-stage escrow → to-release → payout). Auto-journal mapping SAK EMKM, tier gating, dan operational observability.

**Outcome (8 weeks):** 10–50 seller Shopee nyata terhubung, order/payment auto-sync berjalan, pembukuan siap pakai, revenue model terkunci via tier enforcement.

---

## 2. Problem Statement & Opportunity

### 2.1 Current Gaps
- ✅ Pembukuan v2.0 live di repo + prod DN Tech
- ❌ Shopee OAuth hanya mock, tidak live dengan Shopee Open API
- ❌ Order sync belum terintegrasi dengan payout flow
- ❌ Payment sync tidak handle Local vs Cross-Border shop differences
- ❌ No payout reconciliation (bank transfer vs Shopee settlement gap)
- ❌ Tier enforcement tidak active (revenue lock tidak berlaku)
- ❌ Email + onboarding masih placeholder
- ❌ No operational visibility (sync health, payout tracking, error handling)

### 2.2 Market Opportunity
- **DNI Market:** 2M+ Shopee sellers Indonesia → target penetration 100–500 dalam 12 bulan
- **Revenue model:** Freemium (100 entries) → Starter/Pro unlock (Rp 99k–499k/bulan)
- **Competitive advantage:** Native Shopee payment integration + SAK EMKM (akuntansi standar UMKM)
- **Expansion path:** Tokopedia, Lazada, TikTok Shop (v3.0+)

---

## 3. Goals & Success Metrics

### 3.1 Product Goals
1. **Live Shopee integration** — Seller OAuth → shop connected → orders/payments auto-sync daily
2. **Dual-mode payment sync** — Handle Local shop (direct payout) + CB shop (escrow → release workflow)
3. **Payout reconciliation** — Match Shopee settlement vs bank transfer, catch discrepancies
4. **Auto-journal at scale** — Create GL entries for 1000+ orders/month per seller, no manual entry
5. **Revenue lock** — Free tier 100-entry cap working, upsell conversion funnel active
6. **Operational excellence** — Health monitoring, incident runbook, <5min sync latency p95

### 3.2 Success Metrics (8 weeks)
| Metric | Target | Rationale |
|--------|--------|-----------|
| Live sellers connected (Shopee OAuth) | ≥10 | Real toko, real orders |
| Order sync latency p95 | <5 min | Dashboard reflects orders within reasonable time |
| Payment sync completion | ≥95% orders matched | Accurate payout reconciliation |
| Auto-journal accuracy | 100% GL debit=credit | No unbalanced entries |
| Email delivery rate | ≥95% inbox | Verification, reset pwd, settlement notify |
| Onboarding completion rate | ≥60% beta users | Wizard UX works |
| Tier enforcement blocking | 100% accuracy | Free tier cap 100 entries |
| Zero P0 incidents | ≥7 consecutive days | Production stability |
| Webhook success rate | ≥99% | Real-time event processing |

---

## 4. In Scope (v2.1)

### 4.1 Shopee OAuth & Credential Management
- OAuth 2.0 authorization flow (partner_id → auth code → token exchange)
- Encrypted credential storage (access_token, refresh_token)
- Token refresh every 3h (before 4h expiry)
- Support both sandbox + live Shopee environment (via .env)

### 4.2 Order Sync Pipeline (Daily Cron)
- **Endpoint:** `GET /api/v2/order/get_order_list` (15-day window, sliding)
- Fetch order list with status filter (READY_TO_SHIP, PROCESSED, SHIPPED, COMPLETED, CANCELLED)
- Batch detail fetch via `GET /api/v2/order/get_order_detail` (max 50 per call)
- Upsert to `shopee_orders` table (idempotent)
- Dashboard aggregates update (revenue KPI, order status breakdown, items sold)

### 4.3 Payment Sync & Auto-Journal (Daily Cron)

#### 4.3.1 Local Shop Flow
**For shops with `is_cross_border = false`:**
- Fetch income detail: `GET /api/v2/payment/get_income_detail` (income_status=1 Released only)
- Per order: released_amount (seller receives after Shopee komisi)
- Auto-create GL entry:
  - DR Bank (1110) / CR Penjualan (4110) [no komisi line]
- Komisi already deducted in released_amount (Shopee side)

#### 4.3.2 Cross-Border (CB) Shop Flow
**For shops with `is_cross_border = true`:**
- Fetch income detail: income_status=1 (Released)
- Also optional: income_status=0 (ToRelease) + status=2 (Pending) for visibility
- Per order: released_amount (in seller's currency after FX)
- Auto-create GL entry:
  - DR Bank (1110) / DR Komisi (5120) / CR Penjualan (4110)
  - Komisi = buyer_total - released_amount
- Track exchange rate (FX gain/loss in 5140)
- Optional: Use `get_payout_info` for payout-level aggregation + reconciliation

#### 4.3.3 Payout Reconciliation (P1, not blocking v2.1)
- Match Shopee payout timestamp vs bank transfer log
- Flag discrepancies (missing, delayed, amount mismatch)
- Generate reconciliation report for accountant review

### 4.4 Webhook Listener for Real-time Updates
- Endpoint: `POST /api/v1/webhooks/shopee`
- Events: order_create, order_ship, payment_release (+ others)
- HMAC-SHA256 signature verification (using partner_key)
- Async queue (Bull/Redis) with retry (5 attempts, exponential backoff)
- Dead-letter queue for failed webhooks (manual replay)

### 4.5 Email Transactional
- Email verification (OTP 6-digit, expires 10min)
- Password reset (JWT token, expires 1h)
- Settlement notification (order payout confirmation)
- SMTP production config (Gmail/Brevo/SendGrid)
- Bounce/delivery tracking

### 4.6 Onboarding Wizard (Pembukuan Setup)
- **Step 1:** Select CoA template (SAK EMKM 45 acct vs custom)
- **Step 2:** Review order/payment stats + enable auto-journal backfill (30 days)
- **Step 3:** Confirmation + redirect to GL
- Backfill creates auto-journal entries for historical orders (async)

### 4.7 Tier Enforcement & Revenue Lock
- **Free tier:** 100 lifetime manual + auto-journal entries; read-only after limit
- **Starter tier:** 5000 entries/month; Rp 99k/bulan
- **Pro tier:** Unlimited entries; Rp 299k/bulan
- **Enterprise:** Custom
- API reject POST journal entries if tier limit exceeded
- UI show upsell banner ("Unlock unlimited dengan upgrade")

### 4.8 Observability & Health Monitoring
- **Health endpoint:** `/api/v1/auth/health` (DB, Redis, sync latency, email stats)
- **Metrics endpoint:** `/api/v1/admin/metrics` (Prometheus format)
- **JSON structured logging** (timestamp, level, service, shop_id, action, duration)
- **Alert thresholds:** Email delivery <90%, sync latency >10min, webhook fail >5%, Redis down
- **Runbook:** Incident response + rollback procedures

### 4.9 Beta UAT & Feedback Loop
- Seller invitation via invite link (early access perks)
- UAT checklist (12-point form: sync works, email arrives, tier lock works, etc.)
- Feedback channel (in-app form + Telegram/email support)
- Rollback flag (`TIER_ENFORCE=false`) for quick revert

---

## 5. Out of Scope (→ v2.2 or later)

- **Cash Flow Statement** — v2.2 (requires 3-month data, complex GL filtering)
- **COGS & Inventory** — v2.2 (separate module, depends on product tracking)
- **e-Faktur/Pajak integration** — v2.2 (Indonesia tax API integration)
- **MYOB/Jurnal/Accurate sync** — v2.2 (third-party accounting software bridge)
- **Multi-marketplace (Tokopedia, Lazada)** — v3.0
- **White-label accounting** — Future (if B2B-to-accountant model)
- **Mobile app** — Future
- **Webhook DLQ redundancy (multi-region)** — v2.2

---

## 6. Feature Deep-Dive

### 6.1 Local vs Cross-Border Shop Distinction

| Aspect | Local Shop | CB Shop |
|--------|-----------|---------|
| **Shopee region** | Single country (ID, VN, TH, etc.) | International (cross-border sellers) |
| **Income status enum** | 1=Released, 2=Pending | 0=ToRelease, 1=Released, 2=Pending |
| **Currency** | Single (IDR, VND, THB, etc.) | Seller's currency (SGD, USD, etc.); Shopee converts |
| **Komisi handling** | Implicit in released_amount | Explicit (buyer_total - released_amount = komisi) |
| **GL lines** | DR Bank / CR Penjualan (2 lines) | DR Bank / DR Komisi / CR Penjualan (3 lines) |
| **Payout API** | `get_income_detail` only | `get_income_detail` + optional `get_payout_info` |
| **FX risk** | N/A | Track exchange_rate (for FX gain/loss acct 5140) |

### 6.2 Auto-Journal GL Mapping (SAK EMKM)

**Chart of Accounts (45 standard):**
- 1110 — Kas di Bank (Bank account, asset)
- 1120 — Kas Toko (POS cash, asset)
- 1130 — Piutang Usaha (Receivable)
- 4110 — Penjualan Produk (Revenue, top-level)
- 5120 — Komisi & Biaya Marketplace (Expense, commission)
- 5140 — Selisih Kurs (FX gain/loss, only for CB)

**Auto-journal transaction (Local shop example):**
```
Order: SN001, Buyer pays Rp 1,000,000, Shopee komisi Rp 100,000
Released to seller: Rp 900,000

GL Entry (POSTED):
Date: [actual_payout_time]
Description: "Auto-journal dari Shopee: Order SN001"
DR 1110 (Kas di Bank)     900,000
  CR 4110 (Penjualan)               900,000

(Komisi tidak dicatat — Shopee side)
```

**Auto-journal transaction (CB shop example):**
```
Order: CB001, Buyer pays SGD 100, Shopee komisi SGD 10
Released to seller: SGD 90 (= USD 67 after FX 1.343)

GL Entry (POSTED):
Date: [actual_payout_time]
Description: "Auto-journal dari Shopee: Order CB001 (FX: 1.343)"
DR 1110 (Kas di Bank)      67 USD
DR 5120 (Komisi Shopee)    10 SGD (or equiv. in seller's currency)
  CR 4110 (Penjualan)                77 SGD
```

### 6.3 Tier Enforcement Logic

**Check at POST /api/v1/shops/:shopId/journals/entries:**

```
tier = shop.pricing_tier
entry_count = COUNT(journal_entries WHERE shop_id = :shopId)

IF tier == 'free':
  IF entry_count >= 100:
    RETURN 403 { error: 'tier_limit_exceeded', message: 'Upgrade ke Starter' }
  
ELSE IF tier == 'starter':
  monthly_entry_count = COUNT(...WHERE created_at >= start_of_month)
  IF monthly_entry_count >= 5000:
    RETURN 429 { error: 'tier_soft_limit', message: 'Akan diisi ulang bulan depan' }

ELSE IF tier == 'pro' OR 'enterprise':
  // Unlimited

IF TIER_ENFORCE == false:  // Demo bypass
  ALLOW (for testing)
```

---

## 7. Data & API Design

### 7.1 New Database Tables

```sql
-- Shop Shopee credentials + sync state
ALTER TABLE shops ADD COLUMN (
  is_cross_border BOOLEAN DEFAULT FALSE,
  shopee_auth_status VARCHAR(50) DEFAULT 'pending',
  shopee_access_token VARCHAR(255) ENCRYPTED,
  shopee_refresh_token VARCHAR(255) ENCRYPTED,
  shopee_token_expires_at TIMESTAMP,
  last_order_sync_at TIMESTAMP,
  last_payment_sync_at TIMESTAMP,
  pricing_tier VARCHAR(50) DEFAULT 'free',
  onboarding_step INT DEFAULT 0
);

-- Order sync denormalized
CREATE TABLE shopee_orders (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT NOT NULL REFERENCES shops(id),
  order_sn VARCHAR(50) NOT NULL,
  order_status VARCHAR(50),
  total_amount NUMERIC(14, 2),
  currency VARCHAR(3),
  payment_method VARCHAR(100),
  buyer_username VARCHAR(255),
  create_time TIMESTAMP,
  update_time TIMESTAMP,
  synced_at TIMESTAMP,
  UNIQUE(shop_id, order_sn),
  INDEX idx_shop_create (shop_id, create_time)
);

-- Income entries (payment sync)
CREATE TABLE shopee_income_entries (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT NOT NULL REFERENCES shops(id),
  order_sn VARCHAR(50),
  released_amount NUMERIC(14, 2),
  currency VARCHAR(3),
  exchange_rate NUMERIC(10, 6),  -- for CB shops
  income_status INT,  -- 0=ToRelease, 1=Released, 2=Pending
  actual_payout_time TIMESTAMP,
  journal_entry_id BIGINT REFERENCES journal_entries(id),
  sync_status VARCHAR(50) DEFAULT 'pending',  -- pending, auto_journaled
  synced_at TIMESTAMP,
  UNIQUE(shop_id, order_sn, actual_payout_time),
  INDEX idx_shop_payout (shop_id, actual_payout_time)
);

-- Payout tracking (for reconciliation)
CREATE TABLE shopee_payouts (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT NOT NULL REFERENCES shops(id),
  encrypted_payout_id VARCHAR(255),  -- from Shopee
  payout_amount NUMERIC(14, 2),
  from_amount NUMERIC(14, 2),
  payout_currency VARCHAR(3),
  from_currency VARCHAR(3),
  exchange_rate NUMERIC(10, 6),
  payout_time TIMESTAMP,
  pay_service VARCHAR(50),  -- payoneer, pingpong, lianlian
  bank_transfer_date TIMESTAMP,  -- when bank confirmed receipt
  reconciled BOOLEAN DEFAULT FALSE,
  INDEX idx_shop_payout_time (shop_id, payout_time)
);

-- Email log
CREATE TABLE email_log (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  recipient_email VARCHAR(255),
  email_type VARCHAR(50),  -- verification, reset_pwd, settlement_notification
  status VARCHAR(50),  -- sent, delivered, bounced, failed
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  retry_count INT DEFAULT 0,
  INDEX idx_recipient_status (recipient_email, status)
);

-- Webhook log + DLQ
CREATE TABLE webhooks_log (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT REFERENCES shops(id),
  event_type VARCHAR(100),  -- order_create, payment_release, etc.
  payload JSONB,
  signature_valid BOOLEAN,
  processed BOOLEAN,
  retry_count INT DEFAULT 0,
  error TEXT,
  created_at TIMESTAMP,
  INDEX idx_processed (processed)
);

-- Tier enforcement log
CREATE TABLE tier_enforcement_log (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT REFERENCES shops(id),
  action VARCHAR(100),  -- entry_post_denied, tier_upgrade
  current_count INT,
  limit INT,
  triggered_at TIMESTAMP,
  INDEX idx_shop_time (shop_id, triggered_at DESC)
);
```

### 7.2 Key API Endpoints

#### OAuth & Auth
- `POST /auth/shopee-authorize` — Initiate OAuth
- `GET /auth/shopee-callback?code=...&state=...` — Handle callback
- `POST /auth/verify-email` — Email verification (OTP)
- `POST /auth/forget-password` — Password reset flow
- `GET /auth/health` — Health check (extended with sync status)

#### Onboarding
- `GET /api/v1/shops/:shopId/onboarding/pembukuan` — Get state
- `POST /api/v1/shops/:shopId/onboarding/pembukuan/step-1` — Select CoA
- `POST /api/v1/shops/:shopId/onboarding/pembukuan/step-2` — Enable auto-journal + backfill
- `POST /api/v1/shops/:shopId/onboarding/pembukuan/step-3` — Confirm completion

#### Journal (with tier check)
- `POST /api/v1/shops/:shopId/journals/entries` — Create entry (tier gated)
- `GET /api/v1/shops/:shopId/journals/ledger` — GL view

#### Observability
- `GET /api/v1/admin/metrics` — Prometheus metrics
- `POST /admin/webhooks/replay/:id` — Manual replay failed webhook

#### Webhooks
- `POST /api/v1/webhooks/shopee` — Receive Shopee events

---

## 8. Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Shopee partner approval delays | Blocks live OAuth 4+ weeks | Early sandbox testing + mock OAuth fallback |
| Webhook misses → order/payment gap | Manual reconciliation burden | Daily cron catch-up; webhook retry + DLQ |
| Email spam filter | Users can't verify/reset pwd | SPF/DKIM warmup; resend option |
| Tier enforcement breaks demo | Demo account locked | `TIER_ENFORCE=false` flag + exemption list |
| Local vs CB mapping errors | GL out of balance | Comprehensive test matrix (both shop types) |
| Redis unavailable | Queue backup | Inline fallback; alert on down |
| Payout reconciliation gap | Unmatched orders | Reconciliation report + manual review (P1) |

---

## 9. Timeline & Milestones (8 weeks)

| Week | Milestone | Deliverables |
|------|-----------|-------------|
| 1–2 | Setup + Shopee integration | SRS/SDD finalized; SMTP service live; OAuth sandbox working |
| 3–4 | Order sync + payment sync | Order sync cron live (15-day window); payment sync + auto-journal working |
| 5–6 | Webhook + onboarding wizard | Webhook listener online; onboarding UI + backfill async |
| 7 | Tier enforcement + observability | Tier blocking active; health + metrics endpoints live |
| 8 | UAT + hardening | Beta cohort 10–50 seller; checklist validation |
| 9 | Soft launch | Go-live with beta group; monitor incidents |

---

## 10. Success Criteria Summary

✅ Shopee OAuth live for ≥10 sellers  
✅ Order sync <5min latency p95  
✅ Payment sync 95%+ order matching  
✅ Auto-journal GL entries balanced (debit=credit 100%)  
✅ Email delivery >95% inbox  
✅ Onboarding completion ≥60%  
✅ Tier enforcement blocking correctly  
✅ Health endpoint + metrics live  
✅ Zero P0 incidents ≥7 days  
✅ Runbook tested + ops team trained  

---

**Next:** [v2.1 SRS Revised](./dnShop_Finance_v2.1_SRS_v2.md)

# dnShop Finance v2.1 — System Requirements Specification (REVISED)

**Document ID:** `dnShop_Finance_v2.1_SRS_v2.md`  
**Version:** 2.1.1  
**Date:** August 2026  
**Owner:** Dozer (CEO + Tech Lead, DN Tech)  
**Status:** **Implemented 100%** (6 Agustus 2026) — lihat `docs/STATUS.md`  
**Related:** [PRD v2](./dnShop_Finance_v2.1_PRD_v2.md) · [SDD v2](./dnShop_Finance_v2.1_SDD_v2.md)

---

## 1. Functional Requirements

### 1.1 Shopee OAuth & Token Lifecycle

#### FR1.1.1 Initiate OAuth Authorization
**User story:** As a seller, I click "Hubungkan Toko Shopee" and authorize my shop.

**Flow:**
1. Frontend button → `GET /api/v1/auth/shopee-authorize`
2. Backend generates state token (random 32-char, CSRF protection)
3. Store in Redis: key `oauth_state:{state}`, TTL 10min
4. Redirect to Shopee:
   ```
   https://partner.shopeemobile.com/api/auth/authorize
   ?partner_id={PARTNER_ID}
   &redirect={REDIRECT_URI}
   &state={STATE}
   ```
   - `REDIRECT_URI` = `https://api.shop.dntech.id/api/v1/auth/shopee-callback`
   - `PARTNER_ID` from `.env`

**Acceptance Criteria:**
- [ ] State token random + unique
- [ ] State stored in Redis (no DB query on hot path)
- [ ] Redirect uses sandbox/live Shopee depending on `SHOPEE_ENV`
- [ ] Frontend shows loading state during redirect

---

#### FR1.1.2 Handle OAuth Callback
**Trigger:** Shopee redirects with code + state

**Flow:**
1. Validate state from Redis (exists, not expired)
2. Delete state (one-time use, prevent replay)
3. POST to Shopee: `https://partner.shopeemobile.com/api/auth/token`
   ```json
   {
     "partner_id": 1234567890,
     "partner_key": "sk_...",
     "code": "auth_code_from_shopee"
   }
   ```
4. Shopee response:
   ```json
   {
     "access_token": "c09222e3...",
     "refresh_token": "refresh_...",
     "expire_in": 14400
   }
   ```
5. Encrypt & store in DB:
   - `shops.shopee_access_token` (AES-256-GCM encrypted)
   - `shops.shopee_refresh_token` (encrypted)
   - `shops.shopee_token_expires_at = now + 14400s`
   - `shops.shopee_auth_status = 'authorized'`
6. Fetch shop info from Shopee to populate:
   - `shops.is_cross_border` (CB vs Local)
   - `shops.default_currency`
7. Redirect user → Dashboard with "Toko berhasil terhubung ✓" toast

**Acceptance Criteria:**
- [ ] Tokens never logged to console/files
- [ ] Encryption key from secure env var (DB master key)
- [ ] Tokens encrypted before any DB insert
- [ ] Code exchange timeout 10s (fail fast on network error)
- [ ] On code expired (>5min), show "Kode auth expired, mulai ulang"
- [ ] On exception, log error + alert ops (not exposed to seller)
- [ ] On success, seller can immediately sync orders

---

#### FR1.1.3 Token Refresh Cron Job
**Trigger:** Every 3 hours (configurable: `TOKEN_REFRESH_INTERVAL_HOURS=3`)

**Flow:**
1. Query shops: WHERE `shopee_token_expires_at < now + 30min` AND `shopee_auth_status = 'authorized'`
2. For each shop:
   - POST to Shopee: `/api/auth/refresh_token`
     ```json
     {
       "partner_id": shop.partner_id,
       "partner_key": PARTNER_KEY,
       "refresh_token": shop.shopee_refresh_token (decrypted)
     }
     ```
   - On success: update shops (access_token, refresh_token, expires_at)
   - Log: `{ shop_id, action: 'token_refresh', success: true, new_expiry }`
   - On failure (3 retries with backoff): set `shopee_auth_status = 'token_refresh_failed'`, alert ops

**Acceptance Criteria:**
- [ ] Cron runs every 3h (configurable)
- [ ] Only refreshes tokens expiring in <30min (avoid excessive calls)
- [ ] Decryption/encryption happens in-memory (no log)
- [ ] Atomic transaction (all-or-nothing)
- [ ] Failure logged with shop_id for debugging
- [ ] Alert sent to ops if refresh fails 3x
- [ ] Refresh does NOT block order/payment sync (async)

---

#### FR1.1.4 Token Expiry Fallback
**Trigger:** Order/payment sync attempt with expired token (401 error_auth)

**Flow:**
1. Sync code calls Shopee, gets `401 error_auth`
2. Catch exception → attempt one-time refresh (inline)
3. If refresh succeeds: retry original sync call
4. If refresh fails: set `shopee_auth_status = 'expired'`, notify seller, halt sync
5. Seller sees UI: "Hubungkan Toko Shopee Lagi" button
6. Click → restart OAuth flow (FR1.1.1)

**Acceptance Criteria:**
- [ ] Inline refresh attempted before failing sync
- [ ] Retry original sync if refresh succeeds
- [ ] Notify seller within 1min of auth failure
- [ ] Don't loop endlessly on refresh fail (max 1 retry)

---

### 1.2 Order Sync Pipeline

#### FR1.2.1 Fetch Order List (Daily Cron)
**Trigger:** 06:00 UTC+7 (configurable: `ORDER_SYNC_TIME=06:00`)

**Shopee API:** `GET /api/v2/order/get_order_list`

**Flow:**
```
For each shop WHERE shopee_auth_status = 'authorized':
  time_from = max(shop.last_order_sync_at, now - 15 days)
  time_to = now
  
  DO (paginated):
    GET /api/v2/order/get_order_list
      partner_id, timestamp, access_token, shop_id, sign
      time_range_field=create_time
      time_from, time_to (timestamps in seconds)
      page_size=100
      cursor=next_cursor (empty on first call)
      response_optional_fields=order_status
    
    Extract: more, order_list[], next_cursor
    
    For batch of order_sn (collect up to 100):
      Call FR1.2.2 (fetch details)
  
  WHILE more = true
  
  Update: shops.last_order_sync_at = now
  Log: { shop_id, orders_fetched: N, time_range, duration_ms }
```

**HMAC Signature:** All params sorted + signed with HMAC-SHA256(partner_key)

**Acceptance Criteria:**
- [ ] Time window 15-day sliding (Shopee max)
- [ ] Pagination loop until `more = false` (no infinite loop)
- [ ] Cron fires exactly once per day (idempotent)
- [ ] HMAC computed correctly (use Shopee reference)
- [ ] Rate-limit respected (backoff on 429)
- [ ] Failed sync doesn't reset `last_order_sync_at` (retry next cycle)
- [ ] Sync latency <5min p95 (50–200 orders typical)
- [ ] Empty result handled gracefully (0 orders = success)

---

#### FR1.2.2 Fetch & Upsert Order Details
**Shopee API:** `GET /api/v2/order/get_order_detail`

**Flow:**
```
For each batch of order_sn (max 50 per call):
  GET /api/v2/order/get_order_detail
    order_sn_list=SN1,SN2,...,SN50 (comma-separated)
    response_optional_fields=order_status,total_amount,item_list,payment_method,recipient_address,buyer_username
  
  Extract response.order_list[]
  
  For each order:
    Parse:
      order_sn, order_status, total_amount, currency
      payment_method, buyer_username, create_time, update_time
      item_list (array of { item_id, item_name, qty, price, ... })
    
    Upsert to shopee_orders (key: shop_id + order_sn):
      ON CONFLICT DO UPDATE (idempotent)
      Set: order_status, total_amount, update_time, synced_at=now
      
    Validate:
      - order_status in [READY_TO_SHIP, PROCESSED, SHIPPED, COMPLETED, CANCELLED, IN_CANCEL]
      - total_amount is numeric, >= 0
      - currency is 3-char code

Log: { shop_id, batch_num, orders_upserted, failed, duration_ms }
```

**Acceptance Criteria:**
- [ ] Batch size exactly 50 (Shopee max)
- [ ] Upsert atomic per batch (all-or-nothing)
- [ ] Duplicate order_sn updates existing record (not duplicate insert)
- [ ] order_status only updated if newer (compare update_time)
- [ ] total_amount non-negative
- [ ] Missing fields (recipient_address, etc.) handled as NULL
- [ ] Log all upserts for audit trail

---

#### FR1.2.3 Dashboard Update from Orders
**Trigger:** After order upsert complete

**Flow:**
```
Recalculate dashboard aggregates:
  total_orders = COUNT(shopee_orders) WHERE status in [READY_TO_SHIP, PROCESSED, SHIPPED, COMPLETED]
  total_revenue = SUM(total_amount) WHERE status = COMPLETED
  order_by_status = GROUP BY order_status, COUNT(*)
  payment_method_breakdown = GROUP BY payment_method, COUNT(*)
  top_10_items = GROUP BY item_name, SUM(qty), ORDER BY qty DESC
  daily_trend = GROUP BY DATE(create_time), SUM(total_amount)

Cache in Redis: dashboard:{shop_id}:aggregates, TTL 1h

Emit WebSocket: { type: 'order_sync_complete', shop_id, orders_synced: N }
```

**Acceptance Criteria:**
- [ ] Aggregates computed within 30s of sync completion
- [ ] Cache invalidated on any order upsert (not just TTL)
- [ ] WebSocket broadcast only to authenticated users of that shop
- [ ] Fallback to DB query if cache miss (graceful)
- [ ] Chart data returned in both raw (N values) + cumulative format

---

### 1.3 Payment Sync & Auto-Journal

#### FR1.3.1 Fetch Income Detail (Daily Cron)
**Trigger:** 08:00 UTC+7 (2h after order sync), configurable

**Shopee API:** `GET /api/v2/payment/get_income_detail`

**Key distinction: Local vs Cross-Border shop**

**For Local shops (is_cross_border = false):**
```
GET /api/v2/payment/get_income_detail
  date_from, date_to (YYYY-MM-DD, max 14 days)
  income_status=1  // Released only
  page_size=30
  cursor="" (pagination)

Response fields:
  - order_sn (unique order identifier)
  - released_amount (seller receives, after Shopee komisi deducted)
  - actual_payout_time (when Shopee released funds)
  - payment_method (COD, e-wallet, card, etc.)
  - currency (IDR, VND, THB, etc. — single per shop)
  - description (e.g., "Order Income")
  - status (translated, e.g., "Dana telah dilepaskan")
```

**For CB shops (is_cross_border = true):**
```
Same API, but also include:
  - income_status=0 (ToRelease) for visibility
  - income_status=2 (Pending) for visibility
  - exchange_rate (if payout in different currency)
  - to_release_amount (amount waiting for payout)
```

**Flow (both types):**
```
date_from = max(shop.last_payment_sync_at, today - 14 days)
date_to = today

DO (paginated):
  GET /api/v2/payment/get_income_detail
    date_from, date_to (YYYY-MM-DD)
    income_status=1 (Released only)
    page_size=30
    cursor=next_cursor
  
  For each income_detail_list_item:
    Parse:
      order_sn, released_amount, currency, exchange_rate
      actual_payout_time, income_status, payment_method
    
    Validate:
      - released_amount > 0
      - actual_payout_time is valid Unix timestamp
      - order_sn matches existing order in DB (or orphan)
    
    Upsert to shopee_income_entries:
      Key: shop_id + order_sn + actual_payout_time
      Fields: released_amount, currency, exchange_rate, sync_status='pending'
  
  WHILE cursor not empty

Update: shops.last_payment_sync_at = today
Log: { shop_id, income_entries_fetched, date_range, duration_ms }
```

**Acceptance Criteria:**
- [ ] Date range 14-day max (Shopee limit)
- [ ] Date format strictly YYYY-MM-DD
- [ ] income_status=1 only (Released, not Pending/ToRelease for auto-journal)
- [ ] Pagination loop via cursor (not page_no)
- [ ] Orphan orders (order_sn not in DB) logged separately
- [ ] Duplicate detection: check if income entry already exists (natural key)
- [ ] Sync latency <3min p95

---

#### FR1.3.2 Auto-Journal Creation from Income
**Trigger:** Async job after FR1.3.1 completes

**Flow:**
```
Query shopee_income_entries WHERE sync_status = 'pending' AND shop_id = :shop_id

For each income entry:
  Fetch shop: is_cross_border, default_currency
  
  CASE is_cross_border:
    FALSE (Local shop):
      Create GL entry (2 lines):
        date = actual_payout_time
        description = "Auto-journal dari Shopee: Order ${order_sn}"
        auto_journal_flag = true
        status = POSTED  // No approval needed for auto-journal
        lines:
          - { account: 1110 (Kas di Bank), debit: released_amount, credit: 0 }
          - { account: 4110 (Penjualan), debit: 0, credit: released_amount }
    
    TRUE (CB shop):
      Create GL entry (3 lines):
        Komisi = (Fetch order from shopee_orders) buyer_total_amount - released_amount
        date = actual_payout_time
        description = "Auto-journal dari Shopee: Order ${order_sn} (FX: ${exchange_rate})"
        auto_journal_flag = true
        status = POSTED
        lines:
          - { account: 1110 (Kas di Bank), debit: released_amount, credit: 0 }
          - { account: 5120 (Komisi Shopee), debit: 0, credit: komisi }
          - { account: 4110 (Penjualan), debit: 0, credit: released_amount + komisi }
  
  // Validate
  IF SUM(debit) != SUM(credit):
    LOG error + skip (fail-safe, don't corrupt GL)
  
  // Insert
  INSERT journal_entries (...)
  INSERT audit_log (action='auto_journal_created', ...)
  UPDATE shopee_income_entries SET sync_status='auto_journaled', journal_entry_id=:new_entry_id
  
  EMIT WebSocket: { type: 'auto_journal_created', shop_id, order_sn }
```

**Komisi Calculation:**
```
ORDER: buyer_total = Rp 1,000,000
SHOPEE PAYOUT: released_amount = Rp 900,000
KOMISI = 1,000,000 - 900,000 = Rp 100,000

For CB: match order_sn with shopee_orders to get buyer_total
```

**Acceptance Criteria:**
- [ ] Auto-journal entries marked with `auto_journal_flag = true`
- [ ] Entries created with POSTED status (no approval workflow)
- [ ] Account mapping correct (1110, 5120, 4110 per CoA)
- [ ] Debit/credit always balanced (before insert)
- [ ] Komisi calculation: buyer_total - released_amount (not hardcoded)
- [ ] No duplicate journals (check if journal_entry_id NOT NULL)
- [ ] Audit trail logged for each auto-journal
- [ ] Entries are reversible (seller can reverse via UI)

---

#### FR1.3.3 Backfill Auto-Journal on Onboarding
**Trigger:** User completes onboarding step 2 (applies template + enables auto-journal)

**Flow:**
```
// Same as FR1.3.1 + FR1.3.2, but for 30-day historical window
date_from = now - 30 days
date_to = now

Call FR1.3.1 (fetch income 30 days)
Call FR1.3.2 (create auto-journals)

Return to UI:
  "Berhasil import N transaksi dari 30 hari terakhir"
  Show GL preview (new entries, all POSTED)
```

**Acceptance Criteria:**
- [ ] Backfill is async (don't block onboarding completion)
- [ ] Idempotent: re-running doesn't duplicate
- [ ] Show progress in UI ("Processing... 50/100")
- [ ] On completion, notify seller + show GL link

---

### 1.4 Webhook Listener

#### FR1.4.1 Webhook Endpoint & Signature Verification
**Endpoint:** `POST /api/v1/webhooks/shopee` (public, no auth)

**Request body:**
```json
{
  "shop_id": 600001,
  "event_type": "order_create | order_ship | payment_release",
  "timestamp": 1722854400,
  "data": { ... },
  "sign": "HMAC-SHA256 signature"
}
```

**Flow:**
```
1. Receive POST
2. Extract: shop_id, timestamp, data, sign
3. Fetch shop.shopee_partner_key (decrypt)
4. Reconstruct message: "${shop_id}${timestamp}${JSON.stringify(data)}"
5. Compute HMAC-SHA256(message, partner_key)
6. Constant-time compare computed_sign vs sign
   IF NOT equal:
     LOG warning (fraud detection)
     RETURN 400 { code: 1, msg: "Invalid signature" }
7. Validate timestamp:
   IF (now - timestamp) > 5 min:
     LOG (replay attack detected)
     RETURN 400 { code: 1, msg: "Timestamp expired" }
8. Respond immediately: { code: 0 } (HTTP 200, <5s)
9. Enqueue to Bull queue async
```

**Acceptance Criteria:**
- [ ] HMAC verification is constant-time (use `crypto.timingSafeEqual`)
- [ ] Webhook response <5s (Shopee retry if timeout)
- [ ] Signature verified BEFORE processing
- [ ] Invalid signatures logged (audit trail)
- [ ] Timestamp validation (replay protection)
- [ ] Response to Shopee always 200 (even if async processing fails)

---

#### FR1.4.2 Async Processing & Retry
**Queue:** Bull (Redis-backed) or inline fallback

**Job definition:**
```json
{
  "event_type": "order_create | order_ship | payment_release",
  "shop_id": 600001,
  "data": { order_sn, ... },
  "attempts": 5,
  "backoff": { type: "exponential", delay: 1000 }  // [1, 2, 4, 8, 16]s
}
```

**Processing:**
```
TRY:
  IF event_type == 'order_create' OR 'order_ship':
    Sync that order via FR1.2.2
    Emit WebSocket: { type: 'order_updated', shop_id }
  
  ELSE IF event_type == 'payment_release':
    Fetch income detail for order_sn
    Create auto-journal via FR1.3.2
    Emit WebSocket: { type: 'auto_journal_created', shop_id }
  
  Log: { shop_id, event_type, success: true }
  
CATCH error:
  IF attempt < max_attempts:
    RETRY (exponential backoff)
  ELSE:
    MOVE to DLQ (webhooks_dlq table)
    LOG: { shop_id, event_type, error, dlq: true }
    ALERT ops: "Webhook DLQ has N items"
```

**DLQ Monitoring:**
```
Alert threshold: IF DLQ size > 10 for >1h, alert ops
Manual replay: POST /admin/webhooks/replay/:id (ops only)
```

**Acceptance Criteria:**
- [ ] Queue processing async (webhook response sent before processing)
- [ ] Exponential backoff [1, 2, 4, 8, 16]s
- [ ] Max 5 attempts
- [ ] Failed jobs moved to DLQ after 5 attempts
- [ ] DLQ monitoring alert
- [ ] Replay endpoint (admin only, IP-gated)
- [ ] All webhook processing logged

---

### 1.5 Email Verification & Transactional

#### FR1.5.1 Email Verification (Signup)
**Trigger:** User completes signup form

**Flow:**
```
1. Generate OTP: random 6-digit code
2. Store Redis: key `verify_otp:{user_id}`, value { otp, attempts: 0 }, TTL 10min
3. Send email:
   - Recipient: user.email
   - Subject: "Verifikasi Email - dnShop Finance"
   - Body: HTML with OTP + magic link (JWT)
   - Also include alternative: JWT link (expires 24h)
4. User receives email → enters OTP or clicks link
5. Frontend POST /api/v1/auth/verify-email:
   { "otp": "123456" } OR { "token": "eyJhbGc..." }
6. Backend:
   - Validate OTP (exact match, not expired, attempts < 3)
   - OR validate JWT (signature, expiry)
   - Set users.email_verified = true
   - Delete OTP from Redis
   - Return: { ok: true }
```

**Rate limiting:**
```
- Resend available after 60s of prev attempt
- Max 3 OTP attempts before locked (must request new)
```

**Acceptance Criteria:**
- [ ] OTP is 6-digit random
- [ ] OTP expires in 10min
- [ ] Max 3 attempts
- [ ] Magic link expires in 24h
- [ ] Email sent within 5s of signup
- [ ] Resend rate-limited (60s)
- [ ] Verified flag prevents login until email_verified=true

---

#### FR1.5.2 Forget Password
**Trigger:** User clicks "Lupa Password" on login screen

**Flow:**
```
1. User enters email → POST /api/v1/auth/forget-password
2. Lookup user by email
3. Generate reset token (JWT, sub=user_id, exp=1h, algorithm=HS256)
4. Store Redis: key `reset_token:{user_id}`, value { token_hash }, TTL 1h
5. Send email:
   - Subject: "Reset Password - dnShop Finance"
   - Link: "https://shop.dntech.id/reset-password?token=<JWT>"
   - Expires in: 1h
6. User clicks link → POST /api/v1/auth/reset-password:
   { "token": "<JWT>", "new_password": "..." }
7. Backend:
   - Validate JWT (signature, expiry, sub=user_id)
   - Validate new password (min 8 char, 1 uppercase, 1 number, 1 special)
   - Update users.password_hash
   - Delete reset_token from Redis
   - Send confirmation email
   - Redirect: login page
```

**Rate limiting:**
```
- Max 3 forget-password requests per hour per email
```

**Acceptance Criteria:**
- [ ] JWT expires in 1h
- [ ] Token one-time use (deleted after reset)
- [ ] Password validation enforced
- [ ] Email sent within 5s
- [ ] Rate-limit prevents abuse
- [ ] Confirmation email sent after success

---

#### FR1.5.3 Settlement Notification Email
**Trigger:** Webhook payment_release event

**Flow:**
```
1. Extract from webhook: order_sn, released_amount, currency, actual_payout_time
2. Fetch seller: shops.owner_email, shops.name
3. Send email:
   Subject: "Dana Masuk - Order #<order_sn>"
   Body (template):
     "Halo {{ seller_name }},
      Dana dari penjualan Anda sebesar {{ amount_formatted }}
      untuk order #{{ order_sn }} berhasil ditransfer.
      Tanggal transfer: {{ payout_date_formatted }}
      Lihat detail → {{ dashboard_link }}"
4. Log email_log: { user_id, recipient_email, email_type: 'settlement_notification', status: 'sent', sent_at }
```

**Template variables:**
```
- {{ seller_name }} — from shops.name
- {{ amount_formatted }} — released_amount with thousand separator (Rp 1.234.567)
- {{ order_sn }} — order identifier
- {{ payout_date_formatted }} — actual_payout_time in locale (ID: "5 Agustus 2026")
- {{ dashboard_link }} — https://shop.dntech.id/dashboard
```

**Acceptance Criteria:**
- [ ] Email sent within 30s of webhook event
- [ ] Seller name + email correct (not hardcoded)
- [ ] Amount formatted with thousand separator
- [ ] Date formatted in locale
- [ ] Delivery tracked (>95% success)
- [ ] Unsubscribe link included (optional compliance)

---

#### FR1.5.4 SMTP Production Config
**Env vars:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@dntech.id
SMTP_PASS=<app-specific-password>
SMTP_FROM=noreply@dntech.id
SMTP_DEBUG=false
```

**Retry logic:**
```
TRY:
  Connect to SMTP + authenticate
  Send email
CATCH:
  IF transient error (timeout, temp connection fail):
    RETRY 3x with backoff (1s, 2s, 4s)
  ELSE IF auth fail:
    Fail fast (don't retry)
  
  IF all retries fail:
    Log error + queue to failed email queue for manual retry
```

**Monitoring:**
```
- Track: sent_total, bounced_total, failed_total
- Alert if delivery_rate < 90% over 1h
```

**Acceptance Criteria:**
- [ ] SMTP connection tested at startup
- [ ] Auth failures logged (credentials not exposed)
- [ ] Retry only transient errors
- [ ] Fallback to console log (dev mode)
- [ ] All sent emails logged

---

### 1.6 Onboarding Wizard

#### FR1.6.1 Empty State & Wizard Entry
**Trigger:** Seller navigates to `/dashboard/pembukuan` (first time)

**Frontend logic:**
```
IF shops.onboarding_step == 0:
  Show empty state card:
    "Kelola Pembukuan Bisnis Anda"
    "Mulai setup pembukuan dalam 3 menit"
    Button: "Mulai Sekarang" → /onboarding/pembukuan/step-1
```

**Backend:**
```
GET /api/v1/shops/:shopId/onboarding/pembukuan
RETURN:
{
  "current_step": 0,
  "completed_steps": [],
  "coa_templates": [
    { "id": "sak_emkm", "name": "SAK EMKM 45 Akun", "description": "..." },
    { "id": "custom", "name": "Custom", "description": "..." }
  ]
}
```

**Acceptance Criteria:**
- [ ] Empty state shown only if onboarding_step = 0
- [ ] Wizard can be skipped (no force completion)
- [ ] Can restart wizard later via button

---

#### FR1.6.2 Step 1 — CoA Template Selection
**URL:** `/onboarding/pembukuan/step-1`

**Frontend:**
```
Show radio options:
  ○ SAK EMKM (45 akun standard) — preview + description
  ○ Custom (user adds/removes akun)

IF SAK EMKM selected:
  Show collapsible table (45 accounts by type)

IF Custom selected:
  Show form: add account (code 4-digit, name, type)

Button: "Lanjutkan ke Step 2"
```

**Backend:**
```
POST /api/v1/shops/:shopId/onboarding/pembukuan/step-1
BODY: { "template_selected": "sak_emkm" | "custom", "custom_accounts": [...] }

VALIDATE:
  - Account codes unique + 4-digit numeric
  - Account names not empty
  - Account type valid (asset, liability, equity, income, expense)
  - At least 1 debit acct + 1 credit acct (for GL balance)

STORE:
  shops.onboarding_template_selected = "sak_emkm"
  shops.onboarding_step = 1
  Create CoA accounts in chart_of_accounts table

RETURN: { ok: true, step: 1, coa_count: 45 }
```

**Acceptance Criteria:**
- [ ] SAK EMKM preview shows 45 accounts
- [ ] Custom allows add/remove/reorder
- [ ] Validation: unique codes, valid types
- [ ] Submit idempotent
- [ ] CoA created in DB on submit

---

#### FR1.6.3 Step 2 — Review & Auto-Journal Toggle
**URL:** `/onboarding/pembukuan/step-2`

**Frontend:**
```
Show stats card:
  "Toko Anda sejak 30 hari lalu:"
  "📦 N pesanan"
  "💰 Rp Y total revenue"
  "📊 Z transaksi pembayaran"

Toggle: "Auto-import transaksi pembayaran? (Rekomendasi: Ya)"
  Info: Akan fetch 30 hari history + create GL entries otomatis

Button: "Lanjutkan ke Step 3"
```

**Backend:**
```
GET /api/v1/shops/:shopId/onboarding/pembukuan/step-2
RETURN:
{
  "total_orders": 42,
  "total_revenue": "50000000",
  "total_income_entries": 15,
  "period_days": 30
}

---

POST /api/v1/shops/:shopId/onboarding/pembukuan/step-2
BODY: { "auto_journal_enabled": true | false }

STORE:
  shops.onboarding_auto_journal_enabled = true|false
  shops.onboarding_step = 2

IF auto_journal_enabled = true:
  Enqueue async job: backfill auto-journal (30 days)
  RETURN: { status: 'processing', job_id }
  
  // Frontend polls:
  GET /api/v1/shops/:shopId/onboarding/job/:job_id
  RETURN: { status: 'processing', progress: 60%, items_processed: 9, items_total: 15 }
```

**Acceptance Criteria:**
- [ ] Stats fetched in real-time (accurate)
- [ ] Backfill async (don't block submission)
- [ ] Progress endpoint for monitoring
- [ ] Backfill failure handled gracefully (show error + retry option)
- [ ] Idempotent (re-running doesn't duplicate)

---

#### FR1.6.4 Step 3 — Confirmation
**URL:** `/onboarding/pembukuan/step-3`

**Frontend:**
```
Show success:
  "✅ Pembukuan siap digunakan!"
  IF auto_journal enabled: "N transaksi berhasil di-import. Review di GL"
  
Buttons:
  "Lihat GL Sekarang" → /dashboard/pembukuan/ledger
  "Kembali ke Dashboard" → /dashboard
```

**Backend:**
```
POST /api/v1/shops/:shopId/onboarding/pembukuan/step-3
VALIDATE: all steps completed
STORE:
  shops.onboarding_step = 4
  shops.onboarding_completed_at = now
RETURN: { ok: true }
```

**Acceptance Criteria:**
- [ ] Completion timestamp recorded
- [ ] User can navigate GL immediately
- [ ] Wizard cannot be retriggered if completed

---

### 1.7 Tier Enforcement

#### FR1.7.1 Tier Check on Journal Entry POST
**Endpoint:** `POST /api/v1/shops/:shopId/journals/entries`

**Flow:**
```
tier = shop.pricing_tier
entry_count = COUNT(journal_entries) for this shop

CHECK:
  IF tier == 'free' AND entry_count >= 100:
    RETURN 403 { 
      error: 'tier_limit_exceeded',
      message: 'Pembukuan unlimited tersedia di Starter — Rp 99k/bulan',
      limit: 100,
      current: 100,
      upsell_url: '/dashboard/pricing'
    }
  
  ELSE IF tier == 'starter':
    monthly_count = COUNT(...WHERE created_at >= start_of_month)
    IF monthly_count >= 5000:
      RETURN 429 { 
        error: 'tier_soft_limit',
        message: 'Akan direset bulan depan',
        monthly_limit: 5000,
        current: 5000
      }
  
  ELSE IF tier == 'pro' OR 'enterprise':
    ALLOW (unlimited)
  
  IF TIER_ENFORCE == false (dev flag):
    ALLOW (bypass for testing)
  
  LOG: { shop_id, tier, action: 'entry_post', enforced: true|false, current_count }
```

**Acceptance Criteria:**
- [ ] Tier check BEFORE entry creation (fail-fast)
- [ ] Entry count includes manual + auto-journal
- [ ] Monthly reset on 1st of month (Starter)
- [ ] `TIER_ENFORCE=false` completely bypasses (demo)
- [ ] Enforcement trigger logged

---

#### FR1.7.2 Upsell UI
**Trigger:** Free tier at 90 entries

**Frontend:**
```
IF tier == 'free' AND entry_count >= 90:
  Show banner:
    "Pembukuan Anda sudah 90% penuh (90/100 entri)"
    "Upgrade ke Starter untuk unlimited — Rp 99k/bulan"
    Button: "Upgrade Sekarang"
  
  Dismissible (don't show for 7 days if closed)

IF POST fails with tier_limit_exceeded:
  Show modal:
    "Limit entri tercapai"
    "Upgrade ke Starter untuk melanjutkan"
    Link: /dashboard/pricing
```

**Acceptance Criteria:**
- [ ] Banner shows at 90%+
- [ ] Modal on failure
- [ ] Dismissible banner
- [ ] Link to pricing page

---

### 1.8 Observability

#### FR1.8.1 Extended Health Endpoint
**Endpoint:** `GET /api/v1/auth/health` (public)

**Response:**
```json
{
  "ok": true,
  "timestamp": "2026-08-05T10:00:00Z",
  "uptime_seconds": 86400,
  "services": {
    "db": {
      "status": "healthy",
      "latency_ms": 5
    },
    "redis": {
      "status": "healthy | degraded | down",
      "latency_ms": 2
    },
    "shopee_sync": {
      "status": "healthy | degraded",
      "last_order_sync": "2026-08-05T06:00:00Z",
      "last_payment_sync": "2026-08-05T08:00:00Z",
      "order_sync_latency_ms": 2500,
      "payment_sync_latency_ms": 1800,
      "orders_synced_last_run": 42,
      "income_entries_synced_last_run": 15
    },
    "email": {
      "status": "healthy",
      "sent_total": 1250,
      "failed_total": 3,
      "delivered_rate": "99.76%"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] DB health: SELECT 1, <10ms
- [ ] Redis health: PING, <5ms (if enabled)
- [ ] Shopee sync: read from cron log + recent sync metric
- [ ] Email: aggregate from email_log
- [ ] Endpoint responds <100ms p99

---

#### FR1.8.2 Metrics Endpoint
**Endpoint:** `GET /api/v1/admin/metrics` (internal only, IP-gated)

**Format:** Prometheus text format

**Metrics:**
```
# Orders synced
sync_order_total{shop_id="600001"} 42

# Income entries synced
sync_payment_total{shop_id="600001"} 15

# Emails sent/failed
email_sent_total{type="verification"} 250
email_sent_total{type="settlement"} 500
email_bounce_total 3

# Journal entries by tier
journal_entry_total{tier="free"} 100
journal_entry_total{tier="starter"} 500

# Webhooks received/failed
webhook_received_total{event_type="order_create"} 1250
webhook_failed_total{event_type="order_create"} 5
webhook_dlq_size 3

# Tier enforcement
tier_enforcement_total{action="entry_post_denied"} 15
```

**Acceptance Criteria:**
- [ ] IP-gated (ops only)
- [ ] Prometheus-compatible format
- [ ] No sensitive data (shop_id OK, email NOT OK)
- [ ] Real-time or 60s batch update

---

#### FR1.8.3 JSON Structured Logging
**All logs format:**
```json
{
  "timestamp": "2026-08-05T10:00:00.000Z",
  "level": "info",
  "service": "order-sync",
  "shop_id": "600001",
  "action": "fetch_order_list",
  "duration_ms": 2500,
  "orders_fetched": 42,
  "error": null,
  "trace_id": "abc123xyz"
}
```

**Acceptance Criteria:**
- [ ] All logs valid JSON (parseable with `jq`)
- [ ] No console.log in production (all JSON)
- [ ] No secrets exposed (auth tokens, passwords)
- [ ] Trace ID propagated (for debugging)
- [ ] Log rotation configured (don't fill disk)

---

#### FR1.8.4 Alert Rules
| Condition | Threshold | Action |
|-----------|-----------|--------|
| Email delivery rate | <90% over 1h | Slack alert #ops-alerts |
| Order sync latency p95 | >10 min | Slack warning |
| Webhook failure rate | >5% over 1h | Slack alert |
| Redis unavailable | N/A | Slack critical + page ops |
| DB connection pool exhausted | N/A | Slack critical |
| 5xx error rate | >1% over 5min | Slack alert |
| Tier enforcement trigger | >100x in 1h | Log + investigate |

**Acceptance Criteria:**
- [ ] Alerts sent to #ops-alerts Slack
- [ ] Alert includes: metric, threshold, timestamp, action
- [ ] No duplicate alerts within 5min
- [ ] Runbook link in alert message

---

## 2. Non-Functional Requirements

### 2.1 Performance
| Component | Target | Measurement |
|-----------|--------|-------------|
| Order sync latency p95 | <5 min | Cron start → dashboard update |
| Payment sync latency p95 | <3 min | Cron start → auto-journal complete |
| Webhook response time | <5 sec | Receive → HTTP 200 |
| Dashboard load time | <2 sec | Login → dashboard rendered |
| Email send latency | <5 sec | Trigger → SMTP submission |
| Health endpoint p99 | <100 ms | Even under high load |

### 2.2 Reliability
- Uptime SLA: 99.5% (30min downtime/month)
- Sync retry logic: exponential backoff, max 5 attempts
- Email retry: 3x with backoff (transient errors only)
- Webhook retry: 5x with backoff → DLQ on final fail

### 2.3 Security
- All credentials encrypted at rest (AES-256-GCM)
- HMAC-SHA256 for Shopee webhook verification
- JWT for password reset + magic links
- Rate limiting: 100 req/min API, 3 forget-password/hour
- CORS: only `https://shop.dntech.id` (prod)
- SQL injection: parameterized queries (TypeORM)
- XSS: sanitize input, CSP headers
- CSRF: state token in OAuth

### 2.4 Compliance
- Email: SPF/DKIM/DMARC for noreply@dntech.id
- Data retention: logs deleted 90 days
- GDPR: right to delete user data (cascade)
- Indonesia PDP: seller data not shared 3rd party

---

## 3. Test Strategy

### 3.1 Unit Tests
- OAuth token refresh logic
- HMAC signature verification
- Tier enforcement checks
- Komisi calculation (Local vs CB)
- Email template rendering
- Account validation (CoA)

### 3.2 Integration Tests
- OAuth flow end-to-end (mock Shopee)
- Order sync: API mock → DB → dashboard
- Payment sync: income detail → auto-journal
- Webhook: signature → queue → auto-journal
- Email: template → SMTP mock
- Onboarding: step 1/2/3 → DB state
- Tier enforcement: POST with free tier at 100

### 3.3 E2E Tests (Selenium/Playwright)
- Signup + email verification
- OAuth connect shop
- Onboarding wizard 1–3
- Manual entry + auto-journal visibility
- Dashboard update after sync
- Tier limit blocking
- Webhook real-time update

### 3.4 Load Tests (k6)
- 100 shops syncing concurrently
- 1000 webhooks/min sustained
- Dashboard load with 1000 orders
- Health endpoint <100ms p99

---

**Next:** [v2.1 SDD Revised](./dnShop_Finance_v2.1_SDD_v2.md)

# dnShop Finance v2.1 — System Requirements Specification

**Document ID:** `dnShop_Finance_v2.1_SRS.md`  
**Version:** 2.1.0  
**Date:** August 2026  
**Owner:** Dozer (CEO + Tech Lead + PM, DN Tech)  
**Status:** **Implemented** (6 Agustus 2026) — lihat `docs/STATUS.md`  
**Related:** [PRD](./dnShop_Finance_v2.1_PRD.md) · [SDD](./dnShop_Finance_v2.1_SDD.md)

---

## 1. Functional Requirements by Feature

### 1.1 Shopee OAuth Flow

#### FR1.1.1 Initiate OAuth
**Trigger:** User clicks button "Hubungkan Toko Shopee" (Dashboard → Settings → Marketplace)

**Flow:**
1. Frontend redirects to: `https://partner.shopeemobile.com/api/auth/authorize?partner_id=<PARTNER_ID>&redirect=<REDIRECT_URI>&state=<STATE>`
   - `PARTNER_ID` from `.env.production`
   - `REDIRECT_URI` = `https://api.shop.dntech.id/api/v1/auth/shopee-callback`
   - `STATE` = random 32-char token (CSRF protection)
2. Backend stores `STATE` in Redis with TTL 10min (key: `oauth_state:{state}`)
3. Seller redirected to Shopee, approves scopes (read orders, payments)
4. Shopee redirects back to `REDIRECT_URI?code=<CODE>&state=<STATE>`

**Acceptance Criteria:**
- [ ] State token validated (must exist in Redis, within 10min)
- [ ] State token deleted after validation (can't reuse)
- [ ] Redirect URI matches registered partner app URI on Shopee console
- [ ] User sees "Menghubungkan ke Shopee..." loading state
- [ ] On error (invalid state, code expired), show "Koneksi gagal, coba lagi"

#### FR1.1.2 Code Exchange
**Trigger:** Shopee callback with `code` param

**Flow:**
1. Backend validates `state` from Redis
2. POST to Shopee: `GET https://partner.shopeemobile.com/api/auth/token`
   ```
   partner_id=<PARTNER_ID>
   partner_key=<PARTNER_KEY>
   code=<CODE>
   ```
3. Response:
   ```json
   {
     "access_token": "c09222e3fc40ffb25fc947f738b1abf1",
     "refresh_token": "...",
     "expire_in": 14400  // seconds (4h)
   }
   ```
4. Encrypt & store in DB:
   - `shops.shopee_access_token` (encrypted)
   - `shops.shopee_refresh_token` (encrypted)
   - `shops.shopee_token_expires_at` = now + 14400s
   - `shops.shopee_auth_status` = "authorized"
5. Redirect user to Dashboard with "Toko berhasil terhubung ✓" toast

**Acceptance Criteria:**
- [ ] Tokens encrypted before storage (AES-256-GCM with DB key)
- [ ] Tokens never logged to console/files
- [ ] `token_expires_at` calculated correctly (now + 14400s)
- [ ] On code exchange fail (network error), retry 3x exponential backoff (1s, 2s, 4s)
- [ ] On code expired (>5min), show "Kode auth expired, mulai lagi"
- [ ] All token fields are non-null in DB before user can do sync

#### FR1.1.3 Token Refresh Cron
**Trigger:** Every 3 hours (configurable via `TOKEN_REFRESH_INTERVAL_HOURS`)

**Flow:**
1. Query shops where `shopee_token_expires_at < now + 30min` AND `shopee_auth_status = 'authorized'`
2. For each shop:
   - POST to Shopee: `GET https://partner.shopeemobile.com/api/auth/refresh_token`
     ```
     partner_id=<PARTNER_ID>
     partner_key=<PARTNER_KEY>
     refresh_token=<REFRESH_TOKEN>
     ```
   - Response: `{ access_token, refresh_token, expire_in }`
   - Update: `shopee_access_token`, `shopee_refresh_token`, `shopee_token_expires_at`
   - Log: `{ shop_id, action: 'token_refresh', success: true, new_expiry }`
3. On failure: retry up to 3x; if all fail, set `shopee_auth_status = 'token_refresh_failed'` + alert ops

**Acceptance Criteria:**
- [ ] Runs every 3h (cron: `0 */3 * * *`)
- [ ] Only refreshes if token expires in <30min (avoid refresh storm)
- [ ] Transactions atomic (all-or-nothing token update)
- [ ] Failures logged with shop_id for debugging
- [ ] Alert sent if refresh fails 3x (to Slack/email)
- [ ] Refresh does NOT block order/payment sync (async)

#### FR1.1.4 Token Expiry Fallback
**Trigger:** Order/payment sync attempt with expired token

**Flow:**
1. Call Shopee API returns `401 error_auth` or `error_partner_key_expired`
2. Catch exception → attempt refresh once
3. If refresh fails → set `shopee_auth_status = 'expired'` + notify seller "Autentikasi ulang diperlukan"
4. UI shows "Hubungkan Toko Shopee Lagi" button in Settings
5. User clicks → restart OAuth flow (FR1.1.1)

**Acceptance Criteria:**
- [ ] Refresh attempted inline (before failing sync)
- [ ] If refresh succeeds, retry original sync call
- [ ] If refresh fails, sync halted gracefully (not retry loop)
- [ ] Seller notification sent within 1min of auth failure

---

### 1.2 Order Sync Pipeline

#### FR1.2.1 Fetch Order List (Daily Cron)
**Trigger:** 06:00 UTC+7 (daily), configurable via `ORDER_SYNC_TIME`

**Flow:**
1. For each authorized shop (where `shopee_auth_status = 'authorized'`):
   - Calculate time window: `time_from = max(last_sync_timestamp, now - 15 days)`; `time_to = now`
   - GET `https://partner.shopeemobile.com/api/v2/order/get_order_list`
     ```
     partner_id, timestamp, access_token, shop_id, sign (HMAC-SHA256)
     time_range_field=create_time
     time_from, time_to
     page_size=100
     cursor=""
     response_optional_fields=order_status
     ```
   - Handle pagination: loop via `next_cursor` until `more = false`
2. For each page of orders:
   - Collect `order_sn` list (batch up to 50)
   - Call FR1.2.2 (fetch order detail)
3. Update `shops.last_order_sync_at = now`
4. Log: `{ shop_id, orders_fetched, time_window, duration_ms }`

**Acceptance Criteria:**
- [ ] Cron fires exactly once per day (idempotent, can re-run same hour)
- [ ] Time window uses 15-day sliding window (Shopee max)
- [ ] Pagination loop until `more = false` (no infinite loop)
- [ ] HMAC signature computed correctly (all params sorted)
- [ ] Rate-limit respected (Shopee may have QPS limit, add backoff if `429`)
- [ ] Failed sync does NOT reset `last_order_sync_at` (retry next cycle)
- [ ] Sync duration <5min p95 for typical shop (50–200 orders/day)

#### FR1.2.2 Fetch & Upsert Order Details
**Trigger:** Called by FR1.2.1 for each batch of order_sn

**Flow:**
1. Batch order_sn into groups of 50 (Shopee limit)
2. For each batch:
   - GET `https://partner.shopeemobile.com/api/v2/order/get_order_detail`
     ```
     order_sn_list=SN1,SN2,...,SN50 (comma-separated)
     response_optional_fields=order_status,total_amount,item_list,payment_method,recipient_address
     ```
   - Response: array of order objects
3. For each order in response:
   - Parse: `order_sn`, `order_status`, `total_amount`, `payment_method`, `currency`, `create_time`, `update_time`, `item_list`, `buyer_username`, `recipient_address`
   - Upsert to DB (key: shop_id + order_sn):
     ```sql
     INSERT INTO shopee_orders (...) 
     ON CONFLICT (shop_id, order_sn) DO UPDATE SET
       order_status = EXCLUDED.order_status,
       total_amount = EXCLUDED.total_amount,
       update_time = EXCLUDED.update_time,
       synced_at = now()
     ```
   - Track sync_status: `synced` → ready for FR1.3 (payment sync)

**Acceptance Criteria:**
- [ ] Batch size exactly 50 per API call
- [ ] Upsert is atomic (all-or-nothing per batch)
- [ ] Duplicate order_sn updates existing record (not duplicate insert)
- [ ] order_status only updated if newer than DB record (compare update_time)
- [ ] total_amount is numeric (Rp, SGD, VND, etc.) and non-negative
- [ ] Missing optional fields (e.g., recipient_address) handled gracefully (nullable in DB)
- [ ] Log: `{ shop_id, batch_num, orders_upserted, batch_duration_ms }`

#### FR1.2.3 Dashboard Update from Orders
**Trigger:** On order upsert completion

**Flow:**
1. Recalculate dashboard aggregates:
   - Total orders: COUNT(orders) with status in [READY_TO_SHIP, PROCESSED, SHIPPED, COMPLETED]
   - Total revenue: SUM(total_amount) where status = COMPLETED
   - Top 10 items: GROUP BY item_name, SUM(qty), ORDER BY qty DESC
   - Payment method breakdown: GROUP BY payment_method, COUNT(*)
   - Daily trend: GROUP BY DATE(create_time), SUM(total_amount)
2. Cache result in Redis key: `dashboard:{shop_id}:aggregates` with TTL 1h
3. Emit WebSocket event to connected frontend: `{ type: 'order_sync_complete', shop_id, orders_synced }`

**Acceptance Criteria:**
- [ ] Aggregates computed within 30s of sync completion
- [ ] Cache invalidation on any order upsert (don't rely on TTL alone)
- [ ] WebSocket broadcast only to authenticated users of that shop
- [ ] Fallback to DB query if cache miss (not hard fail)

---

### 1.3 Payment/Income Sync & Auto-Journal

#### FR1.3.1 Fetch Income Detail (Daily Cron)
**Trigger:** 08:00 UTC+7 (daily), 2h after order sync, configurable via `PAYMENT_SYNC_TIME`

**Flow:**
1. For each authorized shop:
   - Calculate time window: `date_from = max(last_payment_sync_date, today - 14 days)`, `date_to = today`
   - GET `https://partner.shopeemobile.com/api/v2/payment/get_income_detail`
     ```
     income_status=1  // Released only
     date_from, date_to (YYYY-MM-DD format)
     cursor="" (start)
     page_size=30
     ```
   - Paginate via `next_cursor` until `cursor = ""`
2. For each income detail record:
   - Parse: `order_sn`, `released_amount`, `currency`, `payment_method`, `actual_payout_time`, `description`
   - Validate:
     - `released_amount > 0`
     - `actual_payout_time` is valid timestamp
     - `order_sn` matches existing order in DB (or orphan, flag for manual review)
3. Insert to `shopee_income_entries` table
4. Log: `{ shop_id, income_entries_fetched, date_range, duration_ms }`

**Acceptance Criteria:**
- [ ] Time window uses 14-day sliding (Shopee max for income detail)
- [ ] Date range format strictly YYYY-MM-DD
- [ ] Only income_status=1 (Released) fetched (ignore Pending/ToRelease)
- [ ] Pagination loop with cursor (no infinite loop)
- [ ] Orphan orders (no matching order_sn) logged separately for manual reconciliation
- [ ] Duplicate income entries handled: check natural key (order_sn + actual_payout_time), skip if exists
- [ ] Sync duration <3min p95

#### FR1.3.2 Auto-Journal Creation from Income
**Trigger:** Called after FR1.3.1 completes, for each shopee_income_entries record

**Flow:**
1. Query `shopee_income_entries` where `sync_status = 'pending'` AND `shop_id = :shop_id`
2. For each income entry:
   - Fetch CoA mapping for shop (already configured in v2.0)
   - Create journal entry (POSTED status, not DRAFT):
     ```
     {
       shop_id,
       date: actual_payout_time,
       description: "Auto-journal dari Shopee: Order ${order_sn}",
       status: "POSTED",
       auto_journal_flag: true,
       lines: [
         { account_id: 1110 (Kas di Bank), debit: released_amount, credit: 0 },
         { account_id: 5120 (Komisi Shopee), debit: 0, credit: komisi_amount },  // calculated
         { account_id: 4110 (Penjualan), debit: 0, credit: penjualan_amount }   // released_amount - komisi
       ]
     }
     ```
   - Validate: total debit = total credit
   - Insert to `journal_entries` with audit_log
   - Update: `shopee_income_entries.sync_status = 'auto_journaled'`, `shopee_income_entries.journal_entry_id = <new_entry_id>`
3. Emit WebSocket: `{ type: 'auto_journal_created', shop_id, entry_count }`

**Komisi calculation logic:**
- Parse `order_sn` from income entry
- Fetch original order from `shopee_orders` table
- Komisi = `order_total_amount - released_amount`
- Penjualan = `released_amount - komisi` (net to seller)

**Acceptance Criteria:**
- [ ] Auto-journal entries marked with `auto_journal_flag = true` (immutable at GL level)
- [ ] Entries created with POSTED status (not DRAFT, no approval needed)
- [ ] Account mapping (1110, 5120, 4110) matches CoA template setup
- [ ] Debit/credit always balanced (sanity check before insert)
- [ ] Komisi calculation correct (order_total - released_amount)
- [ ] Entries are reversible (seller can reverse via UI if dispute)
- [ ] No duplicate journals for same income entry (check journal_entry_id NOT NULL)
- [ ] Audit trail logged for each auto-journal + reverse

#### FR1.3.3 Backfill Auto-Journal on First Onboarding
**Trigger:** User completes onboarding wizard step 2 (applies template + selects "enable auto-journal")

**Flow:**
1. Calculate backfill window: `date_from = now - 30 days`, `date_to = now`
2. Call FR1.3.1 (fetch income detail for 30-day window)
3. Call FR1.3.2 (create auto-journal entries for all fetched income)
4. Return to UI: "Berhasil import N transaksi dari 30 hari terakhir"
5. Show: GL list with new entries (all POSTED)
6. Recommendation: "Review dan lanjutkan dengan entri manual jika ada"

**Acceptance Criteria:**
- [ ] Backfill is NOT a bulk sync, but calls same FR1.3.1/1.3.2 (DRY)
- [ ] Idempotent: re-running backfill doesn't duplicate entries (check if journals already exist)
- [ ] Runs async (don't block onboarding completion, show "Processing..." then notify)
- [ ] UI shows import count + "Lihat GL" link on completion

---

### 1.4 Webhook Listener

#### FR1.4.1 Webhook Endpoint Setup
**Endpoint:** `POST /api/v1/webhooks/shopee` (public, no auth)

**Request body (Shopee webhook format):**
```json
{
  "shop_id": 600001,
  "event_type": "order_create | order_ship | payment_escrow | payment_release",
  "timestamp": 1722854400,
  "data": { ... },
  "sign": "HMAC-SHA256 signature"
}
```

**Flow:**
1. Receive POST request
2. Extract `shop_id` from body
3. Fetch `shops.shopee_partner_key` from DB (needed for HMAC verification)
4. Verify HMAC:
   - Reconstruct message: `${shop_id}${timestamp}${JSON.stringify(data)}`
   - Compute HMAC-SHA256(message, partner_key)
   - Compare to `sign` (constant-time comparison to prevent timing attack)
5. If verification fails: log warning + return `{ code: 1, msg: "Invalid signature" }` (HTTP 400)
6. If verification passes: enqueue to async queue (FR1.4.2)
7. Respond immediately: `{ code: 0 }` (HTTP 200, within 5s)

**Acceptance Criteria:**
- [ ] HMAC verification is constant-time (use `crypto.timingSafeEqual`)
- [ ] Webhook response <5s (Shopee retry if timeout)
- [ ] Signature verification happens BEFORE processing (fail-fast)
- [ ] Log all invalid signatures (fraud detection)
- [ ] Shop ID validated (must exist in DB)
- [ ] Timestamp validation (reject if >5min old, replay protection)

#### FR1.4.2 Async Processing & Retry
**Trigger:** After webhook signature validated

**Flow:**
1. Enqueue webhook payload to Bull queue (or inline if Redis unavailable):
   - Key: `webhook_queue:{shop_id}`
   - Job: `{ event_type, data, shop_id }`
   - Retry: `{ attempts: 5, backoff: exponential [1s, 2s, 4s, 8s, 16s] }`
   - TTL: 24h
2. Process job:
   - Call FR1.2.3 (if order_create/order_ship event)
   - Call FR1.3.2 (if payment_release event)
   - On success: log + emit WebSocket event
   - On failure: retry per backoff; after 5 fails, move to DLQ
3. DLQ processing:
   - Log to dead-letter queue: `webhooks_dlq`
   - Alert ops: "Webhook DLQ has N items for shop_id"
   - Ops can manually replay via API endpoint `POST /admin/webhooks/replay/{id}`

**Acceptance Criteria:**
- [ ] Queue processing async (webhook response sent before processing)
- [ ] Exponential backoff (1s, 2s, 4s, 8s, 16s)
- [ ] Max 5 retry attempts
- [ ] Failed webhooks moved to DLQ after 5 attempts
- [ ] DLQ monitoring: alert if >10 items in queue for 1h
- [ ] Replay endpoint (admin only, IP-gated) to reprocess DLQ items
- [ ] Log all webhook processing with shop_id, event_type, success/fail

#### FR1.4.3 Event-Specific Handlers
**order_create event:**
- Sync that specific order via FR1.2.2
- Dashboard updated immediately

**order_ship event:**
- Update order status to SHIPPED in DB
- Notify seller: "Order ${order_sn} sedang dalam pengiriman"

**payment_escrow event:**
- Update order: escrow status PENDING
- No journal entry yet (waiting for release)

**payment_release event:**
- Fetch income detail via FR1.3.1 (for that order_sn)
- Create auto-journal via FR1.3.2
- Notify seller: "Dana Rp X untuk order ${order_sn} berhasil ditransfer"

**Acceptance Criteria:**
- [ ] Each event handler is idempotent (safe to retry)
- [ ] Handlers don't modify auth/user records (shop_id isolation)
- [ ] Webhook data validated before processing (not trusted)

---

### 1.5 Email Verification & Transactional Email

#### FR1.5.1 Email Verification on Signup
**Trigger:** User completes signup form + clicks "Daftar"

**Flow:**
1. Generate OTP: random 6-digit code
2. Store in Redis: key `verify_otp:{user_id}`, value `{ otp, created_at, attempts: 0 }`, TTL 10min
3. Send email:
   - To: user.email
   - Subject: "Verifikasi Email - dnShop Finance"
   - Body: HTML template with OTP + link `https://shop.dntech.id/verify?otp=<OTP>&user_id=<USER_ID>`
   - Also include: magic link (JWT token) as alternative to OTP
4. User gets email → enters OTP or clicks link
5. Frontend POST `/api/v1/auth/verify-email`:
   ```json
   { "otp": "123456" }
   // OR
   { "token": "eyJhbGc..." }
   ```
6. Backend:
   - Validate OTP from Redis (exact match, not expired, attempts <3)
   - OR validate token JWT signature
   - Set `users.email_verified = true`
   - Delete OTP from Redis
   - Return: `{ ok: true, message: "Email terverifikasi" }`

**Acceptance Criteria:**
- [ ] OTP is 6-digit random, no predictable pattern
- [ ] OTP expires in exactly 10min
- [ ] Max 3 attempts before OTP locked (must request new)
- [ ] Magic link token expires in 24h
- [ ] Email sent within 5s of signup
- [ ] Resend available after 60s of prev attempt (rate-limit)
- [ ] Verified flag prevents login until email_verified=true (configurable per env)

#### FR1.5.2 Forget Password Email
**Trigger:** User clicks "Lupa Password" on login screen

**Flow:**
1. User enters email → POST `/api/v1/auth/forget-password`
2. Backend:
   - Lookup user by email
   - Generate reset token (JWT, sub=user_id, exp=1h)
   - Store in Redis: key `reset_token:{user_id}`, value `{ token_hash, created_at }`, TTL 1h
   - Send email:
     - Subject: "Reset Password - dnShop Finance"
     - Link: `https://shop.dntech.id/reset-password?token=<TOKEN>`
3. User clicks link → frontend POST `/api/v1/auth/reset-password`:
   ```json
   { "token": "eyJhbGc...", "new_password": "..." }
   ```
4. Backend:
   - Validate JWT token (signature, expiry)
   - Hash match check
   - Update: `users.password_hash = hash(new_password)`
   - Delete reset token from Redis
   - Send confirmation email: "Password berhasil direset"
   - Redirect: login page

**Acceptance Criteria:**
- [ ] Reset token is JWT (RS256 or HS256), expires in 1h
- [ ] Token can only be used once (deleted after reset)
- [ ] New password validated: min 8 char, 1 uppercase, 1 number, 1 special char
- [ ] Email sent within 5s of forget request
- [ ] Rate-limit: max 3 forget-password requests per hour per email (prevent spam)
- [ ] Confirmation email sent after successful reset

#### FR1.5.3 Settlement Notification Email
**Trigger:** Webhook payment_release event (FR1.4.3)

**Flow:**
1. Extract from webhook: `order_sn`, `released_amount`, `currency`, `actual_payout_time`
2. Fetch seller: `shops.owner_email`, `shops.name`
3. Send email (template: settlement-notification.html):
   ```
   Subject: Dana Masuk - Order #${order_sn}
   Body:
   Halo ${seller_name},
   
   Dana dari penjualan Anda sebesar Rp ${released_amount} 
   untuk order #${order_sn} berhasil ditransfer ke rekening Anda.
   
   Tanggal transfer: ${actual_payout_time}
   Lihat detail → https://shop.dntech.id/dashboard
   ```
4. Log email sent: `{ shop_id, email, event: 'settlement_notification', amount, timestamp }`

**Acceptance Criteria:**
- [ ] Email sent within 30s of webhook event
- [ ] Seller name + email populated correctly (not hardcoded)
- [ ] Amount formatted with thousand separator (Rp 1.234.567)
- [ ] Date formatted in locale (ID: "5 Agustus 2026, 10:00")
- [ ] Email delivered to inbox (not spam, >95% success rate)
- [ ] Unsubscribe link included (optional, for compliance)

#### FR1.5.4 SMTP Configuration & Fallback
**Env vars:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@dntech.id
SMTP_PASS=<app-specific-password>
SMTP_FROM=noreply@dntech.id
SMTP_DEBUG=false  // log all SMTP transactions
```

**Flow:**
1. On startup: test SMTP connection (ping)
2. If SMTP unavailable: log warning + fallback to console log (dev mode)
3. Each email send attempt:
   - Try SMTP first
   - If fail (network error, auth fail): retry 3x exponential backoff (1s, 2s, 4s)
   - If all fail: log error + queue to failed queue for manual retry
4. Monitoring:
   - Track: sent_total, bounced_total, failed_total
   - Alert if delivery rate <90% over 1h

**Acceptance Criteria:**
- [ ] SMTP connection tested at startup (early fail detection)
- [ ] Auth failures logged (but credentials not exposed)
- [ ] Retry only for transient errors (timeout, temp connection fail), not auth fail
- [ ] Fallback to console log clear (for dev, labeled as "MOCK EMAIL")
- [ ] All sent emails logged with timestamp, recipient, subject, status

---

### 1.6 Onboarding Wizard for Pembukuan

#### FR1.6.1 Empty State & Wizard Entry
**Trigger:** Seller navigates to `/dashboard/pembukuan` for first time

**Frontend logic:**
1. Check: `shops.onboarding_step`
2. If `== 0`: show empty state card:
   - "Kelola Pembukuan Bisnis Anda"
   - "Mulai setup pembukuan dalam 3 menit"
   - Button: "Mulai Sekarang"
3. Click → redirect `/onboarding/pembukuan/step-1`

**Backend:**
- GET `/api/v1/shops/:shopId/onboarding/pembukuan` → returns:
  ```json
  {
    "current_step": 0,
    "completed_steps": [],
    "coa_templates": [
      { "id": "sak_emkm", "name": "SAK EMKM 45 Akun", "description": "Template standar untuk UMKM" },
      { "id": "custom", "name": "Custom", "description": "Buat sendiri" }
    ]
  }
  ```

**Acceptance Criteria:**
- [ ] Empty state shows only if onboarding_step = 0
- [ ] Wizard can be skipped (don't force completion)
- [ ] If skipped, user can restart wizard later via button "Setup Pembukuan"
- [ ] Each step URL only accessible if prior steps completed (or allow re-do)

#### FR1.6.2 Step 1 — CoA Template Selection
**URL:** `/onboarding/pembukuan/step-1`

**Frontend:**
1. Show radio options:
   - SAK EMKM (45 akun standard) — description + preview icon
   - Custom (user adds/removes akun)
2. User selects option
3. If SAK EMKM: show preview (collapsible table: account code, name, type)
4. If Custom: show form to add accounts (code 4-digit, name, type, balance opening)
5. Button: "Lanjutkan ke Step 2"

**Backend:**
- POST `/api/v1/shops/:shopId/onboarding/pembukuan/step-1`:
  ```json
  { "template_selected": "sak_emkm" | "custom", "custom_accounts": [...] }
  ```
- Validate:
  - All required accounts exist (debit & credit accounts for journal balance)
  - Account codes 4-digit numeric
  - Account names not empty
- Store: `shops.onboarding_template_selected = "sak_emkm"` (or "custom")
- Update: `shops.onboarding_step = 1`
- Return success + preview of applied accounts

**Acceptance Criteria:**
- [ ] SAK EMKM preview shows 45 accounts (collapsible by type)
- [ ] Custom allows add/remove/reorder accounts
- [ ] Validation: account code must be unique within shop
- [ ] Validation: account type (asset, liability, equity, income, expense) valid
- [ ] Submit idempotent (re-selecting same template doesn't error)

#### FR1.6.3 Step 2 — Review & Auto-Journal Toggle
**URL:** `/onboarding/pembukuan/step-2`

**Frontend:**
1. Show info card:
   - "Toko Anda sejak 30 hari lalu:"
   - "📦 N pesanan" (fetch from shopee_orders count)
   - "💰 Rp Y total revenue" (sum from orders)
   - "📊 Z transaksi pembayaran" (count from shopee_income_entries)
2. Toggle: "Auto-import transaksi pembayaran? (Rekomendasi: Ya)"
   - If ON: will fetch 30-day history + create auto-journal entries automatically
   - If OFF: user must manually add entries later
3. Button: "Lanjutkan ke Step 3"

**Backend:**
- GET `/api/v1/shops/:shopId/onboarding/pembukuan/step-2` → returns stats
- POST `/api/v1/shops/:shopId/onboarding/pembukuan/step-2`:
  ```json
  { "auto_journal_enabled": true | false }
  ```
- Store: `shops.onboarding_auto_journal_enabled = true|false`
- Update: `shops.onboarding_step = 2`
- If auto_journal_enabled = true:
  - Trigger async job: FR1.3.1 + FR1.3.2 (30-day backfill)
  - Return: `{ status: 'processing', job_id }` + show "Processing..." UI
  - Poll endpoint: GET `/api/v1/shops/:shopId/onboarding/job/:job_id` → returns progress
  - On completion: emit WebSocket event

**Acceptance Criteria:**
- [ ] Stats fetched in real-time (accurate order/payment count)
- [ ] Auto-journal backfill runs async (don't block step 2 submission)
- [ ] Backfill can be monitored via progress endpoint (% complete)
- [ ] If backfill fails: show error + option to retry
- [ ] Backfill idempotent (re-running doesn't duplicate journals)

#### FR1.6.4 Step 3 — Confirmation & Redirect
**URL:** `/onboarding/pembukuan/step-3`

**Frontend:**
1. Show success message:
   - "✅ Pembukuan siap digunakan!"
   - If auto_journal enabled: "N transaksi berhasil di-import. Silakan review di Pembukuan > GL"
   - If auto_journal disabled: "Mulai dengan menambah entri manual atau import nanti"
2. Buttons:
   - "Lihat GL Sekarang" (redirect `/dashboard/pembukuan/ledger`)
   - "Kembali ke Dashboard" (redirect `/dashboard`)

**Backend:**
- POST `/api/v1/shops/:shopId/onboarding/pembukuan/step-3`:
  - Validate all steps completed
  - Update: `shops.onboarding_step = 4`, `shops.onboarding_completed_at = now`
  - Return: success

**Acceptance Criteria:**
- [ ] Completion timestamp recorded for analytics
- [ ] User can navigate GL immediately after step 3
- [ ] Wizard cannot be retriggered if completed (but can view summary via button)

---

### 1.7 Tier Enforcement

#### FR1.7.1 Tier Limits Configuration
**Env var:**
```
TIER_ENFORCE=true  // false to bypass (demo/dev)
TIER_FREE_LIMIT=100  // entries per shop lifetime
TIER_STARTER_LIMIT=5000  // entries per month
```

**Tier limits in DB:**
```sql
ALTER TABLE shops ADD COLUMN pricing_tier VARCHAR(50) DEFAULT 'free';
ALTER TABLE shops ADD COLUMN tier_enforced_at TIMESTAMP;
```

**Default shop tier: `free`**

#### FR1.7.2 Tier Check on Journal Entry POST
**Trigger:** User attempts to create manual journal entry (or auto-journal creation)

**Flow:**
1. GET `/api/v1/shops/:shopId/journals/entries` (POST request handler)
2. Fetch shop: `shops.pricing_tier`
3. Query: count existing entries `journal_entries` for this shop
4. Check limit:
   - If tier = `free` AND entry_count >= 100: return `403 Forbidden`
     ```json
     { 
       "error": "tier_limit_exceeded", 
       "message": "Pembukuan unlimited tersedia di Starter — Rp 99k/bulan",
       "limit": 100,
       "current": 100,
       "upsell_url": "/dashboard/pricing"
     }
     ```
   - If tier = `starter` AND monthly_entry_count >= 5000: return `429 Too Many Requests` (soft limit, warning)
   - If tier = `pro` or `enterprise`: allow unlimited
5. If allowed: continue to create entry (FR in pembukuan SDD)
6. Log: `{ shop_id, tier, action: 'entry_post', enforced: true|false, entry_count }`

**Acceptance Criteria:**
- [ ] Tier check happens BEFORE entry creation (fail-fast)
- [ ] Entry count includes both manual + auto-journal
- [ ] Monthly reset for Starter tier (count resets on 1st of month)
- [ ] `TIER_ENFORCE=false` completely bypasses all checks (for demo)
- [ ] Tier enforcement trigger logged (for analytics / upsell funnel)

#### FR1.7.3 Tier Upsell UI
**Trigger:** When free tier hits 90 entries

**Frontend logic:**
1. On dashboard load: check `shop.pricing_tier` + entry_count
2. If `free && entry_count >= 90`:
   - Show banner: "Pembukuan Anda sudah 90% penuh (90/100 entri)"
   - "Upgrade ke Starter untuk unlimited entri — Rp 99k/bulan"
   - Button: "Upgrade Sekarang"
3. On entry POST fail with `tier_limit_exceeded`:
   - Show modal: "Limit entri tercapai"
   - "Upgrade ke Starter untuk melanjutkan"
   - Link to `/dashboard/pricing`

**Acceptance Criteria:**
- [ ] Banner shows only if tier = free AND entry_count >= 90
- [ ] Banner dismissible (user can close, dismiss for 7 days)
- [ ] Modal on failure is clear and action-oriented

---

### 1.8 Observability & Health Monitoring

#### FR1.8.1 Extended Health Endpoint
**Endpoint:** `GET /api/v1/auth/health`

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
      "status": "healthy",
      "latency_ms": 2
    },
    "shopee_sync": {
      "status": "healthy",
      "last_run": "2026-08-05T06:00:00Z",
      "next_run": "2026-08-06T06:00:00Z",
      "latency_ms": 2500,
      "orders_synced": 42,
      "income_entries_synced": 15
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
- [ ] DB health check: simple query (SELECT 1), latency <10ms
- [ ] Redis health check: PING command, latency <5ms (if enabled)
- [ ] Shopee sync status: read from cron log, last_run timestamp + latency
- [ ] Email status: aggregate from email log, delivery rate = (sent - failed) / sent

#### FR1.8.2 Metrics Endpoint
**Endpoint:** `GET /api/v1/admin/metrics` (internal only, IP-gated)

**Response format:** Prometheus text format
```
# HELP sync_order_total Total orders synced from Shopee
# TYPE sync_order_total counter
sync_order_total{shop_id="600001"} 42

# HELP sync_payment_total Total payment entries synced
# TYPE sync_payment_total counter
sync_payment_total{shop_id="600001"} 15

# HELP email_sent_total Total emails sent
# TYPE email_sent_total counter
email_sent_total{type="verification"} 250
email_sent_total{type="settlement"} 500
email_sent_total{type="reset_password"} 50

# HELP email_bounce_total Total emails bounced/failed
# TYPE email_bounce_total counter
email_bounce_total 3

# HELP journal_entry_total Total journal entries created
# TYPE journal_entry_total counter
journal_entry_total{shop_id="600001",tier="free"} 100
journal_entry_total{shop_id="600002",tier="starter"} 500

# HELP webhook_received_total Total webhooks received
# TYPE webhook_received_total counter
webhook_received_total{event_type="order_create"} 1250
webhook_received_total{event_type="payment_release"} 800

# HELP webhook_failed_total Total webhook processing failures
# TYPE webhook_failed_total counter
webhook_failed_total{event_type="order_create"} 5
webhook_failed_total{event_type="payment_release"} 2
```

**Acceptance Criteria:**
- [ ] IP-gated access (only internal networks + ops)
- [ ] Metrics updated in real-time (or every 60s batch update)
- [ ] Format follows Prometheus standard (can scrape into Prometheus/Grafana)
- [ ] No sensitive data exposed (shop_id OK, email addresses NOT OK)

#### FR1.8.3 Structured JSON Logging
**All services must log in JSON format:**
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

**Fields:**
- `timestamp` — ISO 8601 UTC
- `level` — info, warn, error, debug
- `service` — order-sync, payment-sync, email, webhook, auth, etc.
- `shop_id` — optional, for data plane logs
- `action` — specific operation being logged
- `duration_ms` — for performance tracking
- `error` — error message (if applicable), NOT stack trace
- `trace_id` — for distributed tracing (same ID across request + all sub-calls)

**Log sinks:**
- File: `/var/log/dnshop/app.log` (rotated daily)
- CloudWatch / ELK (if available)
- Console (dev, with colors)

**Acceptance Criteria:**
- [ ] All logs are valid JSON (can parse `| jq`)
- [ ] No console.log in production (all JSON)
- [ ] Error logs don't expose secrets (no auth tokens, DB passwords)
- [ ] Trace ID propagated across service calls (for debugging)
- [ ] Log rotation configured (don't fill disk)

#### FR1.8.4 Alert Rules
**Alert conditions:**
1. Email delivery rate <90% over 1h window → Slack alert
2. Order sync latency p95 >10min → Slack alert (warning)
3. Webhook failure rate >5% over 1h → Slack alert
4. Redis unavailable → Slack alert (critical)
5. DB connection pool exhausted → Slack alert (critical)
6. 5xx error rate >1% over 5min window → Slack alert
7. Tier enforcement triggered >100x in 1h (DDoS?) → log + investigate

**Acceptance Criteria:**
- [ ] Alert sent to #ops-alerts Slack channel (or ops email)
- [ ] Alert includes: metric value, threshold, timestamp, action (restart sync, check email queue, etc.)
- [ ] No duplicate alerts within 5min window (deduplicate)
- [ ] Runbook link included in alert message

---

## 2. Non-Functional Requirements

### 2.1 Performance
| Requirement | Target | Measurement |
|-------------|--------|-------------|
| Order sync latency p95 | <5min | Time from cron start to dashboard update |
| Payment sync latency p95 | <3min | Time from sync start to auto-journal complete |
| Webhook response time | <5s | Time to return 200 OK to Shopee |
| Dashboard load time | <2s | Time to first paint (after login) |
| Email send latency | <5s | Time from trigger to SMTP submission |
| Health endpoint p99 | <100ms | Even under high load |

### 2.2 Scalability
- Support 100+ shops concurrently syncing (no blocking)
- Queue system (Bull) handles 1000+ jobs/hour
- Redis cache not required for core function (graceful fallback)
- DB connection pool: min 5, max 20 (configurable per env)

### 2.3 Reliability & Availability
- Uptime SLA: 99.5% (30min downtime/month acceptable)
- RTO (Recovery Time Objective): <30min (manual ops intervention)
- RPO (Recovery Point Objective): <5min (last sync checkpoint)
- Graceful degradation: if Redis down, use inline queue; if SMTP down, log to console

### 2.4 Security
- All credentials encrypted at rest (AES-256-GCM)
- HMAC verification for all Shopee webhooks (SHA256)
- JWT tokens: RS256 or HS256, exp in token
- Rate-limiting: 100 req/min per IP (API), 10 forget-password/hour per email
- CORS: only `https://shop.dntech.id` (prod)
- SQL injection: use parameterized queries (TypeORM)
- XSS: sanitize all user input, CSP headers
- CSRF: state token in OAuth (FR1.1.1)

### 2.5 Compliance
- Email: SPF/DKIM/DMARC configured for noreply@dntech.id
- Data retention: logs deleted after 90 days
- GDPR: right to delete user data (cascade to shops, orders, journals)
- Indonesia PDP (Personal Data Protection): seller data not shared with 3rd party without consent

---

## 3. Test Strategy

### 3.1 Unit Tests
- OAuth token refresh logic
- HMAC signature verification
- Tier enforcement checks
- Email template rendering
- Komisi calculation logic
- Account validation (CoA)

### 3.2 Integration Tests
- OAuth flow end-to-end (mock Shopee)
- Order sync: Shopee API mock → DB upsert → dashboard aggregates
- Payment sync: income detail mock → auto-journal creation → GL balance check
- Webhook: signature verify → queue → auto-journal
- Email: template rendering → SMTP mock send
- Onboarding: step 1/2/3 → DB state transitions
- Tier enforcement: manual entry POST with free tier limit

### 3.3 E2E Tests (Selenium/Playwright)
- Signup + email verification
- OAuth connect shop
- Onboarding wizard 1–3
- Manual journal entry + auto-journal visibility
- Dashboard chart updates after sync
- Tier limit enforcement (free tier at 100 entries)

### 3.4 Load Tests (k6)
- 100 concurrent shops syncing (spawn 100 cron jobs)
- 1000 webhook events/min (sustained 5min)
- Dashboard load with 1000 orders cached
- Health endpoint under load (p95 <100ms)

### 3.5 Smoke Tests (post-deploy)
- Health endpoint returns 200
- OAuth flow works (with test shop)
- Order sync cron triggered
- Email verification email received
- Tier enforcement blocking correctly
- Metrics endpoint populated

---

## 4. Glossary

- **SAK EMKM** — Standar Akuntansi Keuangan untuk Entitas Mikro Kecil Menengah
- **Escrow** — Uang pembeli di hold oleh Shopee sebelum di-release ke seller
- **Komisi** — Potongan Shopee dari transaksi (buyer total - seller receives)
- **DLQ** — Dead-letter queue (failed jobs archive)
- **HMAC** — Hash-based Message Authentication Code (for signature verification)
- **JWT** — JSON Web Token (for reset password, verification links)
- **OTP** — One-Time Password (for email verification)
- **Tier** — Subscription level (free, starter, pro, enterprise)
- **Webhook** — Push notification from Shopee to dnShop (real-time)
- **Backfill** — Historical data sync (30 days on first onboarding)

---

**Next:** [v2.1 SDD](./dnShop_Finance_v2.1_SDD.md)

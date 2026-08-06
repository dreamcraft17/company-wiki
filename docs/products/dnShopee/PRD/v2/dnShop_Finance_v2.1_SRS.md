# dnShop Finance v2.1 — System Requirements Specification
## Functional Requirements & Acceptance Criteria

**Document:** SRS v2.1  
**Date:** 5 Agustus 2026  
**Owner:** Dozer (Tech Lead), DN Tech  
**Baseline:** v2.0 pembukuan + dashboard + ops desk UI  
**Status:** **Implemented** (6 Agustus 2026) — lihat `docs/STATUS.md`  
**Purpose:** Define detailed features, acceptance criteria (Gherkin-style), and edge cases for sprint planning

---

## 1. Overview

SRS v2.1 breakdown:
- **Section 2:** Live Shopee OAuth + webhook integration (P0)
- **Section 3:** SMTP production + email flow (P0)
- **Section 4:** Pembukuan onboarding wizard (P0)
- **Section 5:** Tier enforcement & gating (P0)
- **Section 6:** Observability & monitoring (P0)
- **Section 7:** Beta cohort UAT playbook (P1)
- **Section 8:** Redis queue + Bull (P1)
- **Section 9:** Security requirements
- **Section 10:** Test strategy

> **Acceptance Criteria format:** `Given [state] / When [action] / Then [outcome]`. Testable, binary pass/fail.

---

## 2. Live Shopee OAuth + Webhook Integration

### 2.1 Feature: Shopee partner credentials management

**Background:** Sistem butuh store Shopee partner ID + secret key, accessible hanya oleh admin.

#### R2.1.1 — Admin manage Shopee credentials
**Story:** Admin dapat set/update Shopee partner ID dan secret key tanpa deploy ulang.

**Acceptance Criteria:**
```gherkin
Scenario: Admin update Shopee credentials di ops desk
Given admin logged in dengan role "admin"
When POST /api/v1/admin/config/shopee dengan payload:
  { "partner_id": "abc123", "secret_key": "xyz789" }
Then response status 200 + { "ok": true, "updated_at": "2026-08-05T10:00:00Z" }
And nilai tersimpan di env runtime (bukan restart)
And audit log entry: "admin@dntech.id updated Shopee config"

Scenario: Admin view Shopee credentials (masked)
Given admin di ops desk
When GET /api/v1/admin/config/shopee
Then response { "partner_id": "abc123", "secret_key": "xyz***" }
And tidak log plaintext secret ke stdout

Scenario: Non-admin tidak bisa set Shopee config
Given user role "seller"
When POST /api/v1/admin/config/shopee
Then response 403 Forbidden
```

**Implementation notes:**
- Store di `shopee_config` table atau env override
- Decrypt saat runtime, don't log value
- Fallback ke env var `SHOPEE_PARTNER_ID` jika DB kosong

---

### 2.2 Feature: OAuth 2.0 Shopee callback flow

**Background:** Seller klik "Connect Shopee" → Shopee login → redirect kembali ke dnShop dengan auth code.

#### R2.2.1 — Initiate Shopee OAuth login
**Story:** Seller klik button, diarahkan ke Shopee OAuth page.

**Acceptance Criteria:**
```gherkin
Scenario: Seller klik "Connect Shopee" di dashboard
Given seller logged in, belum connect Shopee
When click button "Koneksikan Shopee" di settings / onboarding
Then redirect ke:
  https://auth.shopee.io/oauth2/auth?
    client_id={PARTNER_ID}
    &redirect_uri=https://api.shop.dntech.id/auth/shopee/callback
    &response_type=code
    &state={random_uuid}
And state stored di Redis dengan TTL 10 menit

Scenario: Shopee OAuth page load
Given user telah diklik button connect
When browser load Shopee auth page
Then Shopee page show (tidak redirected back ke dnShop)
```

**Implementation notes:**
- State untuk CSRF protection (RFC 6749)
- TTL 10 menit (Shopee auth code biasanya 5 menit)
- Redirect URI harus whitelist di Shopee partner admin

#### R2.2.2 — Handle OAuth callback
**Story:** Shopee redirect balik ke dnShop dengan `code` + `state`. Sistem exchange code untuk token.

**Acceptance Criteria:**
```gherkin
Scenario: Shopee redirect dengan code + state valid
Given state tersimpan di Redis
When GET /auth/shopee/callback?code=auth_code&state=uuid
Then:
  1. Verify state match
  2. POST to Shopee API: /oauth2/token dengan code → receive access_token + refresh_token
  3. Store token terenkripsi di DB (shopee_tokens table)
  4. Set shopee_connected = true di shop record
  5. Redirect ke /journal dengan success toast

Response:
  redirect: /journal?connected=true
  Set cookie: session (refresh token)

Scenario: State mismatch (CSRF)
Given state tidak ada atau tidak match
When GET /auth/shopee/callback?code=...&state=wrong
Then response 400 + { "error": "invalid_state" }
And log: "CSRF attempt from IP"

Scenario: Code exchange failed (invalid code)
Given code sudah expired atau invalid
When POST to Shopee /oauth2/token dengan code
Then Shopee return error
And response 400 + { "error": "invalid_code", "retry_after": 30 }
And show UI: "Koneksi gagal, coba lagi dalam 30 detik"

Scenario: Network timeout saat exchange token
Given Shopee API tidak respond
When timeout terjadi (>10s)
Then response 500 + { "error": "oauth_timeout" }
And retry logic: queue job dengan exponential backoff
And user dapat retry dari settings
```

**Implementation notes:**
- Token encrypt di DB menggunakan Node.js `crypto.encrypt()` (AES-256)
- Store: `access_token`, `refresh_token`, `expires_at`, `created_at`
- Shopee token valid ~30 hari (baca dari `expires_in` response)

#### R2.2.3 — Token refresh cron
**Story:** Sistem refresh token sebelum expired, atau refresh saat diminta.

**Acceptance Criteria:**
```gherkin
Scenario: Cron refresh token setiap 6 jam
Given access_token ada dan expires_at dalam 6 jam
When cron job run (schedule: */360 * * * * — setiap 6 jam)
Then:
  1. Read refresh_token dari DB
  2. POST Shopee /oauth2/refresh dengan refresh_token
  3. Update DB: new access_token, new refresh_token, expires_at
  4. Log success: "Shopee token refreshed for shop_id=123"

If refresh failed:
  1. Retry exponential (1s, 2s, 4s, 8s)
  2. After 3 failed: alert ops, set flag shopee_needs_reconnect = true
  3. User see warning di dashboard: "Koneksi Shopee perlu diperbarui"

Scenario: Seller access Shopee resource saat token nearly expired
Given token expires_at dalam 10 menit
When GET /api/v1/shops/:shopId/orders (call Shopee API)
Then:
  1. Middleware detect token nearly expired
  2. Synchronously refresh token (wait 2s)
  3. Proceed dengan new token
  Or if refresh fail: return 503 + { "error": "shopee_temporarily_unavailable" }

Scenario: Token sudah expired
Given token expired_at < now
When seller try access journal atau orders
Then response 401 + { "error": "shopee_connection_expired", "action": "reconnect" }
And show UI button: "Reconnect Shopee"
```

**Implementation notes:**
- Refresh token punya lifetime ~30 hari juga, perlu handle refresh_token rotation
- Store refresh_token sebagai secret (encrypt di DB)
- Token expiry buffer: refresh jika <10 menit remaining

---

### 2.3 Feature: Webhook listener & HMAC verification

**Background:** Shopee kirim order/payment event ke webhook listener. Sistem verify HMAC signature.

#### R2.3.1 — Receive & verify webhook
**Story:** Webhook payload dari Shopee di-verify HMAC sebelum process.

**Acceptance Criteria:**
```gherkin
Scenario: Shopee send order.created webhook dengan HMAC valid
Given webhook URL registered di Shopee: https://api.shop.dntech.id/webhooks/shopee/orders
When Shopee POST dengan header X-Shopee-Signature (HMAC-SHA256)
Then:
  1. Read X-Shopee-Signature header
  2. Compute HMAC-SHA256(body, secret_key)
  3. If signature match:
       - Return 202 Accepted instantly
       - Queue job: process_shopee_order
       - Parse order data, create order record
     Else:
       - Return 401 Unauthorized
       - Log: "Invalid webhook signature from IP"
       - Don't process data

Scenario: Webhook timeout (queue jangan timeout)
Given job di queue
When Bull worker processing order
Then response 202 returned ke Shopee instantly
And job run in background (tidak tergantung Shopee timeout)

Scenario: Duplicate webhook (Shopee send 2x)
Given job_id sudah processed
When Shopee retry send yang sama
Then idempotency check:
  1. Check DB: WHERE shopee_event_id = X
  2. If exist: return 202 (processed already)
  3. If not: queue job
```

**Implementation notes:**
- Webhook signature header: `X-Shopee-Signature`
- HMAC computed: `SHA256(body, secret_key)`
- Return 202 (Accepted) sebelum process, jangan tunggu
- Log body (no PII): `{ timestamp, event_type, shop_id, status }`

#### R2.3.2 — Process order webhook
**Story:** Setelah HMAC verify, queue job untuk create/update order record.

**Acceptance Criteria:**
```gherkin
Scenario: Order webhook processed, order created
Given webhook verified + queued
When Bull worker execute job:
  {
    "event_type": "order:created",
    "order_id": "shop123_order456",
    "shop_id": "shop123",
    "amount": 150000,
    "currency": "IDR",
    "created_at": "2026-08-05T10:00:00Z"
  }
Then:
  1. Create order record (if not exist)
  2. Isolate by shop_id (WHERE shop_id = ...)
  3. Log to audit: "Order sync from Shopee webhook"
  4. Trigger auto-journal (jika payment.created juga datang)

Scenario: Payment webhook received, auto-journal created
Given order sudah ada di DB
When webhook payment:created dengan status "completed"
Then auto-journal entry:
  DR bank.shopee | 150000 IDR
  CR revenue.product.shopee | 150000 IDR
  Description: "Shopee order #shop123_order456"
  Status: POSTED (atau DRAFT jika approval mode manual)
  shopee_sync_id: event_id (untuk idempotency)

Scenario: Webhook retry (failed first time)
Given job failed saat process order
When Bull retry (exponential 1s, 2s, 4s, 8s — max 3x)
Then:
  1. Attempt 1: fail (network error)
  2. Attempt 2 (2s later): success, order created
  Or after 3 failed: move to dead-letter queue, alert ops

Scenario: Order webhook miss (gap detection)
Given webhook tidak terima (network down, Shopee error)
When cron sync run (hourly)
Then:
  1. Query Shopee API: GET /orders?created_after=lastSyncTime
  2. Compare dengan local orders
  3. If gap detected: create order record dari API response
  4. Log reconciliation: "Recovered 5 missing orders from Shopee"
```

**Implementation notes:**
- Queue name: `shopee-sync`
- Store `shopee_event_id` unique (constraint jangan duplicate)
- Auto-journal trigger: saat payment.created webhook
- Gap reconciliation: cron every 1 hour, query Shopee API last 24h

---

### 2.4 Feature: Reconciliation & gap handling

**Background:** Jika webhook miss, cron sync reconcile order data.

#### R2.4.1 — Hourly reconciliation cron
**Story:** Setiap jam, sistem check Shopee API untuk order yang tidak terima webhook.

**Acceptance Criteria:**
```gherkin
Scenario: Reconciliation run, no gap
Given webhook terima semua order
When cron reconciliation run
Then:
  1. Query Shopee: GET /orders?created_after={1h ago}
  2. Compare dengan local orders
  3. No gap found
  4. Log: "Reconciliation: 0 gap, 10 orders verified"

Scenario: Reconciliation detect gap (missing order)
Given Shopee punya order_id=999, local DB tidak punya
When cron run
Then:
  1. Get order detail dari Shopee
  2. Create order record + auto-journal if completed
  3. Log audit: "Recovered missing order #999 from Shopee API"
  4. Alert ops (P1): "1 order recovered via reconciliation"

Scenario: Reconciliation fail (Shopee API timeout)
Given Shopee API tidak respond
When timeout >5s
Then:
  1. Stop reconciliation (jangan retry dalam loop)
  2. Schedule retry setelah 1 jam
  3. Alert ops (P2): "Reconciliation delayed, will retry"
  4. Continue normal webhook processing (tidak block)
```

**Implementation notes:**
- Cron: `0 * * * * *` (every hour)
- Reconciliation window: last 24 hours (not just 1h)
- Batch size: 100 orders per API call (respect rate limit)
- Alerting: Slack / email untuk ops

---

## 3. SMTP Production + Email Flow

### 3.1 Feature: Email provider setup & fallback

**Background:** Sistem send transactional email via SMTP provider (SendGrid / Mailgun). Fallback: console log jika provider down.

#### R3.1.1 — SMTP provider configuration
**Story:** SMTP credentials stored secara aman, dapat di-test dari admin panel.

**Acceptance Criteria:**
```gherkin
Scenario: Admin set SMTP provider di ops desk
Given admin logged in
When POST /api/v1/admin/config/smtp dengan:
  {
    "provider": "sendgrid",  // atau "mailgun"
    "api_key": "sg_...",
    "from_email": "noreply@dntech.id",
    "from_name": "dnShop"
  }
Then response 200 + { "ok": true }
And credentials stored encrypted
And audit log: "admin updated SMTP config"

Scenario: Test email send (admin feature)
Given SMTP config set
When POST /api/v1/admin/test-email dengan { "to": "admin@dntech.id" }
Then:
  1. Send test email via SMTP
  2. If success (2xx): response { "ok": true, "message_id": "..." }
     If fail: response 400 + { "error": "smtp_failed", "detail": "..." }
  3. Test email received dalam 2 menit (jika provider ok)

Scenario: SMTP provider down, fallback to console
Given SMTP API error atau timeout
When send email triggered (verification, notification)
Then:
  1. Log ke console + file: { "type": "email", "to": "...", "subject": "...", "body": "..." }
  2. Return 200 (treat as success)
  3. Alert ops (P1): "SMTP fallback active"
  4. User: tidak paham sistem fallback, assume email sent (ok untuk fallback temporary)
```

**Implementation notes:**
- Provider options: SendGrid atau Mailgun (rate limit 100 req/sec)
- Credentials: env vars atau ops desk config
- Fallback: log ke `/var/log/dnshop/email-fallback.log` + stdout
- Timeout: 5 second untuk SMTP call (kalau lewat, fallback)

---

### 3.2 Feature: Email verification flow

**Background:** Seller account belum verified sampai confirm email address.

#### R3.2.1 — Send verification email
**Story:** Saat register, sistem kirim verification email dengan link 24h valid.

**Acceptance Criteria:**
```gherkin
Scenario: Seller register akun baru
Given email: seller@gmail.com
When POST /auth/register { "email": "seller@gmail.com", "password": "..." }
Then:
  1. Create user record dengan email_verified = false
  2. Generate token (uuid, 32 char random) dengan TTL 24h
  3. Store token di DB (verification_token table)
  4. Send email:
     Subject: "Verifikasi email dnShop"
     Body: "Klik link untuk verifikasi: https://shop.dntech.id/verify?token={token}"
     From: noreply@dntech.id
  5. Response 201 + { "ok": true, "message": "Check your email" }

Scenario: Email verify link clicked (dev mode, email optional)
Given env: DEV / SANDBOX
When register
Then email_verified skip (auto true)
And no email sent

Scenario: Email verify link clicked (prod, email mandatory)
Given env: PRODUCTION
When register
Then email_verified = false (required)
And email sent
And user tidak bisa login sampai verified

Scenario: User klik verify link
Given token valid + not expired
When GET /verify?token={token}
Then:
  1. Lookup user via token
  2. Set email_verified = true
  3. Delete token dari DB
  4. Redirect to login page dengan message: "Email verified, you can login"
  5. User bisa login sekarang

Scenario: Verify link expired (>24 jam)
Given token TTL expired
When GET /verify?token={token}
Then response 400 + { "error": "token_expired" }
And show UI: "Link expired, request new one" dengan button resend

Scenario: Resend verification email
Given user email_verified = false
When POST /auth/resend-verification { "email": "seller@gmail.com" }
Then:
  1. Generate new token
  2. Send email lagi
  3. Response 200 + { "ok": true }
  And rate limit: max 3x per hour (prevent spam)
```

**Implementation notes:**
- Token: 32-char random alphanumeric, stored hashed (SHA256) di DB
- TTL: 24 jam
- Rate limit: 3 resend per hour per email
- Email in dev: can be skipped (feature flag `SKIP_EMAIL_VERIFICATION` in dev)

---

### 3.3 Feature: Transactional email templates

**Background:** Sistem kirim email untuk verifikasi, reset password, notifikasi.

#### R3.3.1 — Email template library
**Story:** Admin dapat manage email template (subject, body, variables) tanpa code deploy.

**Acceptance Criteria:**
```gherkin
Scenario: View email templates di ops desk
Given admin logged in
When GET /api/v1/admin/email-templates
Then response:
  [
    {
      "id": "verify_email",
      "subject": "Verifikasi email dnShop",
      "body_html": "Klik link: {{verify_link}}",
      "variables": ["verify_link", "email"],
      "created_at": "..."
    },
    ...
  ]

Scenario: Update email template
Given admin want change subject
When POST /api/v1/admin/email-templates/verify_email dengan:
  { "subject": "Confirm your email", "body_html": "..." }
Then response 200
And audit log: "admin updated template verify_email"
And template effective immediately (next send)

Scenario: Send email dengan template
Given template stored
When event trigger (register, password reset, order notification)
Then:
  1. Lookup template by key
  2. Inject variables: {{verify_link}} → actual URL
  3. Send email via SMTP
  4. Log: { "template": "verify_email", "to": "...", "status": "sent" }

Scenario: Email send fail, log dan retry
Given SMTP error
When send email
Then:
  1. Log to email-failed queue
  2. Retry exponential: 1min, 5min, 1hour (max 3x)
  3. After 3 failed: move to dead-letter, alert ops
```

**Implementation notes:**
- Template engine: Handlebars (double-brace syntax: `{{variable}}`)
- Built-in templates: verify_email, reset_password, settlement_notification, journal_approval
- Store in DB or as JSON config file
- Fallback: if template not found, use hardcoded default

---

### 3.4 Feature: Settlement notification email

**Background:** Saat payment dari Shopee settle, sistem send email + in-app notification.

#### R3.4.1 — Settlement event trigger
**Story:** Webhook atau cron detect settlement complete, send email.

**Acceptance Criteria:**
```gherkin
Scenario: Shopee settlement webhook received
Given payment settled (status = completed, settlement_time = 2026-08-05)
When webhook payment:settled diterima
Then:
  1. Queue job: send_settlement_notification
  2. Email template settlement_notification dengan:
     - Seller name
     - Settlement amount (IDR)
     - Settlement date
     - Link: https://shop.dntech.id/dashboard?period=7d
  3. In-app notification: bell icon, notification list
  4. Log audit: "Settlement notification sent to seller@..."

Scenario: Email notif settlement
Given email sent
When seller buka email
Then content simple + clear:
  "Penjualan Anda sebesar Rp 250.000 sudah diterima ke rekening.
   Lihat detail dashboard: [link]"

Scenario: Settlement notification batch (end of day)
Given multiple settlement dalam 1 hari
When cron run (21:00)
Then:
  1. Aggregate settlement per seller
  2. Send 1 email per seller (not multiple emails)
  3. E.g. "Total penjualan hari ini: Rp 1.250.000"
```

**Implementation notes:**
- Trigger: webhook atau cron batch daily
- Email: send immediately (or batch at end of day to reduce volume)
- In-app notification: store di `notifications` table, expire after 30 days

---

## 4. Pembukuan Onboarding Wizard

### 4.1 Feature: Wizard UI flow

**Background:** Seller pertama kali akses `/journal`, show wizard untuk setup pembukuan.

#### R4.1.1 — Wizard display & navigation
**Story:** Empty state → wizard step 1–5 → completion.

**Acceptance Criteria:**
```gherkin
Scenario: Seller first time access /journal
Given seller email_verified = true
And onboarded_at = NULL
When navigate to http://localhost:6000/journal
Then display wizard overlay:
  - Title: "Setup Pembukuan dalam 5 Menit"
  - Progress: Step 1/5
  - Content based on step
  - Buttons: Back (disabled on step 1), Next

Scenario: Wizard step 1 — Welcome
Given overlay displayed
When render step 1
Then show:
  - Icon: calculator / bookkeeping
  - Title: "Selamat datang di Pembukuan dnShop"
  - Benefit list:
    * Lacak penjualan harian
    * Laporan pajak otomatis
    * Rekonsiliasi bank mudah
  - Button: "Mulai Setup" (next)
  - Button: "Lewati" (close wizard, set onboarded_at anyway)

Scenario: Wizard step 2 — Choose template
Given step 1 complete
When click Next
Then render step 2:
  - Title: "Pilih Template Chart of Accounts"
  - Option 1: SAK EMKM (45 akun standar Indonesia)
    Preview: show akun list (Kas, Bank, Piutang, etc)
  - Option 2: Custom Lite (basic 10 akun)
    Preview: show basic akun
  - Radio selection (default SAK EMKM)
  - Button: Back, Next

Scenario: Wizard step 3 — Configuration
Given step 2 complete + template selected
When click Next
Then render step 3:
  - Title: "Konfigurasi Pembukuan"
  - Form fields:
    * Mata uang (dropdown): IDR (default), USD, SGD
    * Periode penutupan (dropdown): Monthly (default), Quarterly
    * Mode persetujuan (radio): Auto-post, Manual approval
  - Button: Back, Next

Scenario: Wizard step 4 — Auto-journal setup
Given step 3 complete
When click Next
Then render step 4:
  - Title: "Setup Auto-Jurnal Shopee"
  - Checkbox: "Aktifkan auto-journal dari Shopee" (checked)
  - Text: "Kami akan otomatis mencatat pendapatan penjualan Shopee Anda"
  - Progress bar: "Processing... 0%" (akan mulai backfill)
  - Button: Back, Next (inactive sampai backfill selesai)

Scenario: Auto-journal backfill in progress
Given step 4 running
When backfill_job queue running
Then:
  - Poll /api/v1/wizard/backfill-status setiap 2 detik
  - Update progress bar: "Processing... 25%"
  - Show count: "Processed 10 entries out of 40"

Scenario: Wizard step 5 — Complete
Given backfill done
When step 4 next
Then render step 5:
  - Title: "Selesai! 🎉"
  - Summary: "Setup pembukuan berhasil"
  - Action button: "Lihat Jurnal"
  - Set DB: onboarded_at = now()
  - Redirect: /journal (GL overview)

Scenario: Skip wizard
Given at any step
When click "Lewati"
Then:
  - Close wizard
  - Set onboarded_at = now()
  - Redirect to /journal
  - Can come back later? (no, one-time only)
```

**Implementation notes:**
- Wizard component: React, overlay/modal dengan step state
- Store wizard state di component (not DB) during flow
- Backfill job async (Bull queue), poll via REST endpoint
- Step 4 progress: call `GET /api/v1/wizard/backfill-status` every 2s

---

### 4.2 Feature: CoA template apply

**Background:** Setelah pilih template, sistem copy CoA akun ke chart of accounts table.

#### R4.2.1 — Apply template
**Story:** Template dipilih → akun list created.

**Acceptance Criteria:**
```gherkin
Scenario: Apply SAK EMKM template
Given template "sak_emkm" selected
When POST /api/v1/shops/:shopId/journals/apply-template
  { "template": "sak_emkm" }
Then:
  1. Read akun list dari template
  2. Create ChartOfAccount record untuk setiap akun (if not exist)
  3. Set default mapping: Shopee payment → account "Bank.Shopee"
  4. Response 200 + { "ok": true, "accounts_created": 45 }

Scenario: Akun already exist (idempotent)
Given CoA sudah ada (dari previous setup atau manual)
When apply template lagi
Then:
  1. Check existing akun (by account_code)
  2. Skip create jika already exist
  3. Response 200 + { "ok": true, "accounts_created": 0, "skipped": 45 }

Scenario: Custom template
Given user choose "Custom Lite" template
When apply
Then:
  1. Create 10 basic akun (Kas, Bank, Pendapatan, dll)
  2. Setup payment mapping manual
  3. Response 200 + { "ok": true, "accounts_created": 10 }
```

**Implementation notes:**
- Template stored di `chart_of_accounts_templates` table
- Apply logic: idempotent (upsert by account_code)
- Default mapping: payment methods → bank akun (e.g., Shopee → Bank.Shopee)

---

### 4.3 Feature: Auto-journal backfill dari Shopee

**Background:** Wizard step 4, sistem fetch 30 hari order/payment terakhir dari Shopee, create journal entries.

#### R4.3.1 — Backfill logic
**Story:** Ambil payment Shopee last 30 hari, bikin journal entry otomatis.

**Acceptance Criteria:**
```gherkin
Scenario: Backfill started
Given wizard step 4
When POST /api/v1/shops/:shopId/journals/backfill-shopee
  { "days_back": 30 }
Then:
  1. Queue job: backfill_shopee_journal
  2. Return 202 + { "job_id": "uuid", "status": "queued" }
  3. Job start immediately atau dalam 1 detik

Scenario: Backfill fetch payment dari Shopee
Given job running
When fetch data
Then:
  1. Call Shopee API: GET /payments?created_after={30 days ago}
  2. For each payment (status = completed):
     - Amount, date, method, order_id
  3. Create JournalEntry record:
     DR bank.shopee | amount
     CR revenue.product.shopee | amount
     Description: "Shopee order #{order_id}"
     shopee_sync_id: {payment_id} (idempotent)

Scenario: Backfill progress tracking
Given backfill running
When GET /api/v1/wizard/backfill-status?job_id=uuid
Then response:
  {
    "job_id": "uuid",
    "status": "in_progress",
    "progress_percent": 45,
    "entries_processed": 18,
    "entries_total": 40
  }

Scenario: Backfill complete
Given all 30 days processed
When job finish
Then:
  1. Set backfill_complete_at = now()
  2. Mark job status = "completed"
  3. Log: "Backfill completed: 40 entries created"
  4. Response GET /backfill-status:
     { "status": "completed", "entries_created": 40 }

Scenario: Backfill failed (Shopee API error)
Given Shopee API return error
When job retry
Then retry exponential (1s, 2s, 4s, 8s), max 3 attempt
And if all failed:
  - Move to dead-letter queue
  - Alert ops (P1): "Backfill failed for shop_id"
  - User see message: "Setup sempat gagal, retry manually"

Scenario: No payment data (new seller)
Given seller baru, belum punya penjualan Shopee
When backfill run
Then:
  1. Fetch return 0 payment
  2. Job complete normally
  3. Response: { "entries_created": 0 }
  4. User proceed step 5
```

**Implementation notes:**
- Backfill: async job di Bull queue (worker concurrency = 2, jangan overload Shopee API)
- Idempotency key: `shopee_sync_id` di journal entry (prevent duplicate if retry)
- Account mapping: hardcode untuk sekarang (Shopee → Bank.Shopee, Revenue.Shopee)

---

## 5. Tier Enforcement & Gating

### 5.1 Feature: Tier pricing model

**Background:** Free tier lock journal, Starter cap 50/mo, Pro unlimited.

#### R5.1.1 — Tier definition & storage
**Story:** Setiap shop punya tier, API gate akses berdasarkan tier.

**Acceptance Criteria:**
```gherkin
Scenario: Shop have tier attribute
Given shop created
When POST /shops atau GET /shops/:shopId
Then response include:
  {
    "id": "shop123",
    "name": "Toko Saya",
    "tier": "free",  // enum: free, starter, pro, enterprise
    "tier_since": "2026-08-05T10:00:00Z"
  }

Scenario: Tier limit definition
Given tier model
Then:
  - Free: journal_limit = 0 (locked), features = [dashboard]
  - Starter: journal_limit = 50, features = [dashboard, journal, reports]
  - Pro: journal_limit = null (unlimited), features = [all]
  - Enterprise: journal_limit = null, features = [all + api access]

Scenario: Demo seed set to Pro
Given seed job run (npm run seed)
Then seller@dnshop.id shop.tier = "pro"
And tidak terpengaruh tier enforcement test
```

**Implementation notes:**
- Store `tier` column di `shops` table
- Default tier: "free" saat shop created
- Tier metadata di `shop_tiers` table (limit definition)

---

### 5.2 Feature: API gate — journal access

**Background:** Saat akses `/journals/*` endpoint, check tier + usage.

#### R5.2.1 — Journal access gating
**Story:** Free tier tidak bisa akses journal, Starter enforce limit 50/mo.

**Acceptance Criteria:**
```gherkin
Scenario: Free tier user access /journal
Given shop.tier = "free"
When GET /api/v1/shops/:shopId/journals/overview
Then response 403 + { "error": "feature_locked", "tier": "free", "upsell": {...} }
And show UI modal: "Pembukuan tersedia di Starter ⭐"
  - Message: "Upgrade sekarang untuk akses pembukuan & laporan"
  - Button: "Upgrade ke Starter" (link ke billing page)

Scenario: Starter tier user create journal entry
Given shop.tier = "starter"
And used_entries = 50 (monthly quota)
When POST /journals/entries { ... }
Then:
  1. Check monthly usage: COUNT(entries WHERE created_at >= month_start)
  2. If count >= 50: response 402 + { "error": "quota_exceeded", "tier": "starter", "limit": 50 }
  3. Show UI: "Anda sudah maksimal 50 entri bulan ini"
     Button: "Upgrade ke Pro untuk unlimited"
  4. If count < 50: process normally, response 201

Scenario: Starter tier — near limit warning
Given entry count = 45/50
When create next entry (akan jadi 46/50)
Then:
  1. Return 201 (success)
  2. Response include warning: { "warning": "quota_near_limit", "remaining": 4 }
  3. UI show toast: "5 entri tersisa bulan ini"

Scenario: Pro tier — no limit
Given shop.tier = "pro"
When create many entries (100+)
Then semua accepted 201
And no warning, no quota message

Scenario: Monthly reset
Given tier = "starter", used = 50
When month rollover (e.g., Aug 31 → Sep 1)
Then:
  1. Usage reset (COUNT dari September saja)
  2. Seller dapat create entri lagi
  3. System tidak explicit notif (implisit bekerja)
```

**Implementation notes:**
- Middleware `TierGuard` di NestJS (apply ke journal routes)
- Usage count: `SELECT COUNT(*) FROM journal_entries WHERE shop_id=? AND created_at >= month_start`
- Monthly quota reset: automatic (query-based, no cron needed)
- UI modal for upsell: component library ready di Figma

---

### 5.3 Feature: Upsell & upgrade flow

**Background:** Jika tier-locked, show upsell modal dengan upgrade CTA.

#### R5.3.1 — Upsell modal
**Story:** User lihat upsell jika tier tidak support fitur.

**Acceptance Criteria:**
```gherkin
Scenario: Free user click journal menu
Given shop.tier = "free"
When click menu "Pembukuan" di sidebar
Then modal display:
  - Title: "Buka Pembukuan untuk Bisnis Anda"
  - Feature list:
    * Jurnal otomatis dari penjualan Shopee
    * Laporan pajak real-time
    * Rekonsiliasi bank mudah
  - Pricing badge: "Mulai dari Rp 99.000/bulan"
  - Button: "Lihat Paket" (navigate to /pricing page)
  - Button close: back to dashboard

Scenario: Starter tier — near limit, see Pro upsell
Given remaining = 5 entries
When create next entry (would be 46/50)
Then response 201 + warning
And UI toast show upgrade option: "Pro unlimited — click untuk lihat"
And analytics log: "upsell_impression", tier: "starter"

Scenario: Upgrade flow (future, not v2.1)
Given user click upgrade button
Then navigate to /billing/upgrade (placeholder untuk v2.2)
And payment flow: Stripe / Midtrans (to-do)
```

**Implementation notes:**
- Upsell modal component: reusable, configurable per tier/feature
- Copy & pricing: to-be-determined (v2.2)
- Analytics: track upsell impressions + clicks

---

## 6. Observability & Monitoring

### 6.1 Feature: Health check endpoint (extended)

**Background:** Sistem health check include DB, Redis, SMTP, Shopee API status.

#### R6.1.1 — Health endpoint
**Story:** `/auth/health` return detailed status.

**Acceptance Criteria:**
```gherkin
Scenario: Health check all services green
Given all services up
When GET /api/v1/auth/health
Then response 200 + :
  {
    "ok": true,
    "timestamp": "2026-08-05T10:00:00Z",
    "services": {
      "database": { "status": "ok", "latency_ms": 15 },
      "redis": { "status": "ok", "latency_ms": 5 },
      "smtp": { "status": "ok", "latency_ms": 50 },
      "shopee_api": { "status": "ok", "latency_ms": 200 }
    }
  }

Scenario: Health check — Redis down
Given Redis tidak accessible
When GET /api/v1/auth/health
Then response 200 + (not 500!):
  {
    "ok": true,  // system still ok (redis fallback)
    "services": {
      "database": { "status": "ok", "latency_ms": 15 },
      "redis": { "status": "degraded", "error": "connection timeout" },
      "smtp": { "status": "ok", "latency_ms": 50 },
      "shopee_api": { "status": "ok", "latency_ms": 200 }
    }
  }
  And note: overall "ok" = true karena Redis bukan critical

Scenario: Health check — Database down
Given DB not accessible
When GET /api/v1/auth/health
Then response 500 + :
  {
    "ok": false,
    "services": {
      "database": { "status": "error", "error": "connection refused" }
    }
  }

Scenario: Health check timeout (>1 second)
Given service respond slowly
When health check run
Then:
  1. Timeout setiap service ke 1 second
  2. If service timeout: status = "timeout"
  3. Don't wait untuk semua service
  4. Return fast (overall response <2 second)
```

**Implementation notes:**
- Health endpoint: `/api/v1/auth/health`
- Ping timeout: 1 second per service
- Critical services (DB): if down → response 500
- Non-critical (Redis, SMTP): if down → status "degraded", response 200 ok

---

### 6.2 Feature: Structured logging

**Background:** Sistem log event ke file + stdout dalam JSON format.

#### R6.2.1 — JSON logging
**Story:** Setiap request, error, event log dalam format JSON.

**Acceptance Criteria:**
```gherkin
Scenario: Log successful order sync
Given webhook received + processed
When journal entry created
Then log entry (JSON):
  {
    "timestamp": "2026-08-05T10:00:00.123Z",
    "level": "info",
    "service": "dnshop-api",
    "event": "order_synced",
    "shop_id": "shop123",
    "order_id": "order456",
    "journal_entry_id": "entry789",
    "duration_ms": 145
  }

Scenario: Log error (e.g., Shopee API fail)
Given Shopee API return 500
When sync retry fail
Then log entry:
  {
    "timestamp": "2026-08-05T10:00:00.123Z",
    "level": "error",
    "service": "dnshop-api",
    "event": "shopee_api_error",
    "shop_id": "shop123",
    "error": "Shopee returned 500",
    "retry_attempt": 2,
    "next_retry_ms": 4000,
    "stack_trace": "..."
  }

Scenario: Request log
Given HTTP request
When /api/v1/journals GET received
Then log:
  {
    "timestamp": "2026-08-05T10:00:00.123Z",
    "level": "info",
    "service": "dnshop-api",
    "event": "http_request",
    "method": "GET",
    "path": "/api/v1/shops/shop123/journals",
    "status": 200,
    "duration_ms": 125,
    "user_id": "user123"
  }

Scenario: Log output location
Given app running
Then logs written to:
  1. stdout (console, for container/pm2)
  2. /var/log/dnshop/app.log (file, rolling)
  3. /var/log/dnshop/error.log (error only)
```

**Implementation notes:**
- Logger library: winston (NestJS logger)
- Format: JSON, no colors
- Rotation: daily or 100MB per file, keep 30 days
- Don't log: plaintext token, password, credit card

---

### 6.3 Feature: Error alerting

**Background:** Saat 5xx error rate >1%, alert ops.

#### R6.3.1 — Alert logic
**Story:** Monitor 5xx error, send alert ke Slack/email.

**Acceptance Criteria:**
```gherkin
Scenario: 5xx error rate exceed threshold
Given app running
When 5xx error rate > 1% dalam 5 menit window
Then:
  1. Check: COUNT(5xx) / COUNT(total) > 0.01
  2. If true: send alert via Slack / email
  3. Alert message:
     "⚠️ High 5xx error rate (2.5%) di api.shop.dntech.id
      Last 10 errors: [list]
      Response: Check logs, restart if needed"
  4. Alert sent once per incident (not spam)

Scenario: Alert resolve (error rate drop)
Given error rate was high
When error rate drop <0.5% over 10 minutes
Then:
  1. Send resolve alert: "✅ Error rate normal again"
  2. Incident log close
```

**Implementation notes:**
- Error tracking: in-memory counter (reset every 5 min)
- Alert: Slack webhook atau email (configurable)
- Threshold tuning: 1% initially, adjust based on traffic

---

### 6.4 Feature: Metrics collection

**Background:** Collect latency, queue size, tier gate rate untuk monitoring.

#### R6.4.1 — Metrics endpoint
**Story:** `/metrics` expose key metrics untuk monitoring.

**Acceptance Criteria:**
```gherkin
Scenario: Metrics endpoint (Prometheus format)
Given app running
When GET /metrics
Then response Prometheus format:
  # HELP shopee_sync_latency_ms Order sync latency
  # TYPE shopee_sync_latency_ms gauge
  shopee_sync_latency_ms{shop_id="shop123"} 245
  shopee_sync_latency_ms{shop_id="shop456"} 312

  # Email delivery rate
  email_delivered_total{template="verify_email"} 450
  email_bounced_total{template="verify_email"} 5

  # Tier gate denials
  tier_gate_deny_total{tier="free",feature="journal"} 23

Scenario: Metrics collection
Given request handling
When /journals endpoint processed
Then:
  1. Collect latency (start_time - end_time)
  2. Record to metrics store (in-memory)
  3. At /metrics endpoint: aggregate + export
  4. Metrics reset hourly (or configurable)
```

**Implementation notes:**
- Metrics library: prom-client (Prometheus Node.js client)
- Export format: Prometheus text format
- Endpoint: `/metrics` (no auth, internal access only)
- Storage: in-memory (ephemeral), export to Prometheus scraper later

---

## 7. Beta Cohort UAT Playbook

### 7.1 Feature: Beta seller invite & onboarding

**Background:** Admin invite 10–50 seller untuk UAT, track checklist, collect feedback.

#### R7.1.1 — Invite flow
**Story:** Admin generate invite link, send ke seller, seller create account via link.

**Acceptance Criteria:**
```gherkin
Scenario: Admin invite seller
Given admin panel
When POST /api/v1/admin/beta/invites { "email": "seller@business.com" }
Then:
  1. Generate unique invite_code (32-char)
  2. Create invite record (status: pending)
  3. Send email:
     Subject: "Invited to dnShop Beta"
     Body: "Join our beta: https://shop.dntech.id/join?code={code}"
  4. Response 201 + { "invite_id": "...", "status": "sent" }

Scenario: Seller click invite link
Given email received
When click link https://shop.dntech.id/join?code=abc123
Then:
  1. Verify code valid + not expired
  2. Redirect to registration page (pre-filled code)
  3. Seller fill name, email, password
  4. Create account + set shop.tier = "starter"
  5. Mark invite: status = "accepted"

Scenario: Invite management di admin
Given admin dashboard
When GET /api/v1/admin/beta/invites
Then response:
  [
    { "id": "...", "email": "seller@business.com", "status": "sent", "sent_at": "...", "accepted_at": null },
    { "id": "...", "email": "seller2@...", "status": "accepted", "sent_at": "...", "accepted_at": "..." }
  ]
```

**Implementation notes:**
- Invite code: URL-safe random 32-char
- Expire: 7 days (can extend if needed)
- Tier set to "starter" (not free) for beta
- Track acceptance rate

---

### 7.2 Feature: UAT checklist & feedback

**Background:** Beta seller follow checklist. Feedback collected di audit log / form.

#### R7.2.1 — UAT checklist
**Story:** Show checklist di onboarding or beta panel.

**Acceptance Criteria:**
```gherkin
Scenario: Beta seller see UAT checklist
Given seller accepted invite
When navigate to /beta/checklist
Then display:
  - [ ] Email verification diterima (click to verify)
  - [ ] Shopee OAuth connect berhasil (click to connect)
  - [ ] Auto-journal backfill 30 hari ok (check when done)
  - [ ] Pembukuan wizard completed (check when done)
  - [ ] Dashboard chart render benar (visual test)
  - [ ] Tier upsell modal terlihat (check when trigger)
  - [ ] PDF export lancar (download test)
  
Scenario: Check off completed tasks
Given checklist open
When click checkbox for "Email verification"
Then:
  1. Mark as complete (backend set timestamp)
  2. Log audit: "beta_seller/email_verified" for shop_id
  3. Update progress % (e.g., 2/7 complete)

Scenario: Feedback submission
Given UAT progress
When click "Berikan feedback" button
Then show simple form:
  - What works well? (textarea)
  - What needs improvement? (textarea)
  - NPS score (1-10 slider)
  - Submit
  
After submit:
  1. Save to feedback table
  2. Alert ops (Slack): "New beta feedback from shop_id"
  3. Show thank you message
```

**Implementation notes:**
- Checklist: UI component, state tracked in DB
- Feedback: form submit to `/api/v1/beta/feedback`
- Ops notification: Slack webhook

---

## 8. Redis Queue & Bull Integration

### 8.1 Feature: Queue activation

**Background:** Jika `REDIS_HOST` set, activate Bull queue. Fallback: sync (no queue).

#### R8.1.1 — Queue setup
**Story:** System start with queue or sync mode based on config.

**Acceptance Criteria:**
```gherkin
Scenario: Redis available, Bull activated
Given env REDIS_HOST = "localhost"
When app start
Then:
  1. Connect to Redis
  2. Initialize Bull queues: shopee-sync, email, journal-backfill, report-generate
  3. Start workers (concurrency 5)
  4. Log: "Bull queue activated"

Scenario: Redis not available, fallback to sync
Given env REDIS_HOST empty
When app start
Then:
  1. Log warning: "Redis not configured, using sync mode (fallback)"
  2. Queue.add() execute immediately (sync)
  3. No Bull worker
  4. App still functional (no Redis dependency)

Scenario: Queue monitoring
Given queue active
When GET /api/v1/admin/queues/status
Then response:
  {
    "mode": "redis",
    "redis_status": "connected",
    "queues": [
      { "name": "shopee-sync", "pending": 3, "active": 1, "completed": 150 },
      { "name": "email", "pending": 0, "active": 0, "completed": 500 },
      { "name": "dead-letter", "pending": 2 }
    ]
  }
```

**Implementation notes:**
- Bull library: `bull` package
- Redis client: `ioredis`
- Fallback mode: simple `Promise.resolve()` instead of queue
- Monitoring endpoint: `/api/v1/admin/queues/status` (admin only)

---

## 9. Security Requirements

### 9.1 Authentication & Authorization
- OAuth 2.0 Shopee: PKCE recommended, state verification mandatory
- JWT: RS256 signing key, HS256 verification
- Permission model: `journal` flag for RBAC (owner/accountant/cashier roles)
- Session timeout: 1 hour (refresh token valid 7 days)

### 9.2 Data isolation & multi-tenancy
- Shop isolation: ALL queries wajib filter `shop_id` di WHERE clause
- Audit trail: every financial mutation logged (append-only)
- Encryption: token + secrets encrypted di DB (AES-256)
- HTTPS: all prod endpoints enforce TLS 1.3

### 9.3 Webhook & API security
- Webhook HMAC: SHA-256 verify, log unverified requests
- Rate limiting: 100 req/min per shop (per IP or session)
- CORS: prod only allow `https://shop.dntech.id`
- Secret rotation: env vars, no hardcode

### 9.4 Email & PII
- Email body: no PII in plaintext, use variables
- Template validation: sanitize variables (no XSS)
- Log audit: store attempts, not content

---

## 10. Test Strategy

### 10.1 Unit tests (backend)
- OAuth token refresh logic
- HMAC webhook verification
- Tier gate enforcement
- Journal entry validation

### 10.2 Integration tests
- End-to-end OAuth flow (mock Shopee)
- Email send + template rendering
- Webhook receive + async processing
- Backfill logic (mock API)

### 10.3 UAT tests (manual)
- Live Shopee sandbox connection
- Real email delivery (test inbox)
- Tier upsell UX (free/starter transition)
- 10–50 beta seller real-world usage

### 10.4 Performance tests
- Sync latency <5 min p95 (under load)
- Email send <500ms p95
- Health check <1s always

---

## Acceptance Criteria Summary

| Feature | # AC | Complexity | Owner |
|---------|------|-----------|-------|
| Shopee OAuth | 6 | High | Backend |
| SMTP production | 8 | Medium | Backend + Infra |
| Wizard | 10 | High | Frontend + Backend |
| Tier enforcement | 6 | Medium | Backend |
| Observability | 8 | Medium | Backend + DevOps |
| Beta playbook | 4 | Low | DevOps + CS |
| Queue integration | 3 | Medium | Backend + DevOps |
| **Total** | **45** | — | — |

**Target test pass rate:** ≥95% before GA.

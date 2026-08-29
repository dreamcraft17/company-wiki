# dnShop Finance v2.1 — Software Design Document

**Document ID:** `dnShop_Finance_v2.1_SDD.md`  
**Version:** 2.1.0  
**Date:** August 2026  
**Owner:** Dozer (CEO + Tech Lead + PM, DN Tech)  
**Status:** **Implemented** (6 Agustus 2026) — lihat `docs/STATUS.md`  
**Related:** [PRD](./dnShop_Finance_v2.1_PRD.md) · [SRS](./dnShop_Finance_v2.1_SRS.md)

---

## 1. System Architecture

### 1.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Next.js 15)                  │
│  shop.dntech.id - Dashboard, Pembukuan, Onboarding Wizard       │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API GATEWAY (nginx reverse proxy)             │
│              api.shop.dntech.id (port 6001)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐
│  NestJS API     │  │  Job Queue      │  │  WebSocket       │
│  (6001)         │  │  (Bull/Redis)   │  │  (socket.io)     │
│                 │  │                 │  │                  │
│ • Auth          │  │ • Order sync    │  │ • Real-time      │
│ • Pembukuan     │  │ • Payment sync  │  │   updates        │
│ • Dashboard     │  │ • Email send    │  │ • Webhook events │
│ • Webhook       │  │ • Auto-journal  │  │                  │
│ • Onboarding    │  └─────────────────┘  └──────────────────┘
│ • Observability │        │
└─────────────────┘        ▼
        │          ┌─────────────────────┐
        │          │   Redis (5.0+)      │
        │          │                     │
        │          │ • Session store     │
        │          │ • OAuth state       │
        │          │ • Queue (Bull)      │
        │          │ • Cache (Dashboard) │
        │          │ • Email DLQ         │
        │          └─────────────────────┘
        │
        ├──────────────┬──────────────┬──────────────┐
        ▼              ▼              ▼              ▼
    ┌────────┐   ┌──────────┐   ┌────────┐   ┌──────────┐
    │ Postgres│   │  Shopee  │   │  SMTP  │   │ CloudFL  │
    │  (15)  │   │   API    │   │(Gmail) │   │(DNS/CDN) │
    │        │   │          │   │        │   │          │
    │ • Shops│   │ Orders   │   │ Email  │   │ Caching  │
    │ • Users│   │ Payments │   │ Send   │   │ Protection
    │ • Orders   │ OAuth    │   │        │   │          │
    │ • Income   │ Webhook  │   │        │   │          │
    │ • Journals │          │   │        │   │          │
    │ • CoA      │          │   │        │   │          │
    └────────┘   └──────────┘   └────────┘   └──────────┘

External: Shopee Open API, SMTP, Cloudflare DNS
```

### 1.2 Request Flow — Order Sync

```
1. User authenticates
   └─> Session stored in Redis (JWT + httpOnly cookie)

2. Frontend loads Dashboard
   └─> GET /api/v1/shops/:shopId/dashboard
       └─> Check cache (Redis key: dashboard:{shop_id}:aggregates)
       └─> If miss: query GL + orders, compute aggregates, cache 1h
       └─> Return chart data

3. Daily cron (6am UTC+7) triggers
   └─> OrderSyncService.syncOrdersForAllShops()
       └─> For each shop where shopee_auth_status = 'authorized':
           └─> Call FR1.2.1: fetchOrderList (15-day window)
           └─> Paginate via cursor
           └─> Batch order_sn into 50-item groups
           └─> Call FR1.2.2: fetchOrderDetails + upsert to DB
           └─> Upsert shopee_orders (idempotent)
           └─> Emit WebSocket: 'order_sync_complete'
           └─> Update shop.last_order_sync_at

4. Frontend receives WebSocket event
   └─> Invalidate cache (delete Redis key)
   └─> Refetch dashboard
   └─> Show "✓ Data tersinkronisasi"
```

### 1.3 Request Flow — Payment Sync & Auto-Journal

```
1. Daily cron (8am UTC+7) triggers
   └─> PaymentSyncService.syncPaymentsForAllShops()
       └─> For each shop:
           └─> Call FR1.3.1: fetchIncomeDetail (14-day window)
           └─> Upsert shopee_income_entries (sync_status = 'pending')

2. AutoJournalService processes income entries
   └─> Query shopee_income_entries where sync_status = 'pending'
   └─> For each entry:
       └─> Fetch CoA mapping (already configured in v2.0)
       └─> Create GL journal entry (POSTED):
           {
             date: actual_payout_time,
             description: "Auto-journal dari Shopee: Order ${order_sn}",
             lines: [
               { account: 1110 (Bank), debit: released_amount },
               { account: 5120 (Komisi), credit: komisi_amount },
               { account: 4110 (Penjualan), credit: penjualan_amount }
             ],
             auto_journal_flag: true
           }
       └─> Validate debit = credit
       └─> Insert to journal_entries + audit_log
       └─> Update: shopee_income_entries.sync_status = 'auto_journaled'
       └─> Emit WebSocket: 'auto_journal_created'

3. Frontend receives event
   └─> Refresh GL list
   └─> Show "N transaksi berhasil di-import"
```

### 1.4 Request Flow — Webhook Processing

```
1. Shopee sends POST /api/v1/webhooks/shopee
   {
     shop_id, event_type, timestamp, data, sign (HMAC-SHA256)
   }

2. Backend receives:
   └─> Verify HMAC signature (constant-time compare)
   └─> Validate timestamp (reject if >5min old)
   └─> Respond immediately: { code: 0 } (HTTP 200, <5s)
   └─> Enqueue to Bull queue:
       {
         event_type: 'order_create' | 'order_ship' | 'payment_release',
         data: { order_sn, ... },
         shop_id
       }
       Retry: { attempts: 5, backoff: 'exponential [1,2,4,8,16]s' }

3. Bull worker processes asynchronously:
   └─> If order_create/order_ship:
       └─> Sync that order via FR1.2.2
       └─> Emit WebSocket: 'order_updated'
   └─> If payment_release:
       └─> Fetch income detail for that order
       └─> Create auto-journal via FR1.3.2
       └─> Emit WebSocket: 'auto_journal_created'
   └─> On failure: retry per backoff schedule
   └─> On 5 failures: move to DLQ (webhooks_dlq table)

4. DLQ monitoring:
   └─> Alert ops if DLQ size >10 for >1h
   └─> Manual replay via: POST /admin/webhooks/replay/:id
```

---

## 2. Database Schema

### 2.1 New Tables

```sql
-- OAuth credentials & sync state
ALTER TABLE shops ADD COLUMN (
  shopee_partner_id BIGINT,
  shopee_partner_key VARCHAR(255) ENCRYPTED,
  shopee_access_token VARCHAR(255) ENCRYPTED,
  shopee_refresh_token VARCHAR(255) ENCRYPTED,
  shopee_token_expires_at TIMESTAMP,
  shopee_auth_status VARCHAR(50) DEFAULT 'pending',
  last_order_sync_at TIMESTAMP,
  last_payment_sync_at TIMESTAMP,
  onboarding_step INT DEFAULT 0,
  onboarding_template_selected VARCHAR(50),
  onboarding_auto_journal_enabled BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMP,
  pricing_tier VARCHAR(50) DEFAULT 'free',
  tier_enforced_at TIMESTAMP
);

-- Email verification
ALTER TABLE users ADD COLUMN (
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  verification_token_expires_at TIMESTAMP
);

-- Shopee orders (denormalized for quick access)
CREATE TABLE shopee_orders (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  order_sn VARCHAR(50) NOT NULL,
  order_status VARCHAR(50),  -- READY_TO_SHIP, SHIPPED, COMPLETED, etc.
  total_amount NUMERIC(14, 2),  -- seller receives
  buyer_total_amount NUMERIC(14, 2),  -- include shipping
  currency VARCHAR(3),
  payment_method VARCHAR(100),
  buyer_username VARCHAR(255),
  buyer_user_id BIGINT,
  recipient_address JSONB,  -- { name, phone, city, district, state, full_address }
  item_list JSONB,  -- [{ item_id, item_name, model_name, qty, price, ... }]
  create_time TIMESTAMP,
  update_time TIMESTAMP,
  sync_status VARCHAR(50) DEFAULT 'synced',
  synced_at TIMESTAMP,
  UNIQUE(shop_id, order_sn),
  INDEX idx_shop_order_sn (shop_id, order_sn),
  INDEX idx_shop_create_time (shop_id, create_time),
  INDEX idx_order_status (shop_id, order_status)
);

-- Shopee income entries (from payment sync)
CREATE TABLE shopee_income_entries (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  order_sn VARCHAR(50),  -- may be NULL if orphan
  released_amount NUMERIC(14, 2),
  currency VARCHAR(3),
  income_status VARCHAR(50),  -- Released, Pending, ToRelease
  payment_method VARCHAR(100),
  actual_payout_time TIMESTAMP,
  estimated_payout_time TIMESTAMP,
  journal_entry_id BIGINT REFERENCES journal_entries(id),
  sync_status VARCHAR(50) DEFAULT 'pending',  -- pending, auto_journaled, manual_review
  synced_at TIMESTAMP,
  UNIQUE(shop_id, order_sn, actual_payout_time),
  INDEX idx_shop_sync_status (shop_id, sync_status),
  INDEX idx_shop_payout_time (shop_id, actual_payout_time)
);

-- Webhook event log
CREATE TABLE webhooks_log (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  event_type VARCHAR(100),  -- order_create, order_ship, payment_release, etc.
  payload JSONB,
  signature VARCHAR(255),
  signature_valid BOOLEAN,
  processed BOOLEAN DEFAULT FALSE,
  retry_count INT DEFAULT 0,
  last_retry_at TIMESTAMP,
  error TEXT,
  created_at TIMESTAMP DEFAULT now(),
  INDEX idx_shop_event_type (shop_id, event_type),
  INDEX idx_processed (processed, created_at)
);

-- Dead-letter queue
CREATE TABLE webhooks_dlq (
  id BIGSERIAL PRIMARY KEY,
  webhook_id BIGINT REFERENCES webhooks_log(id),
  shop_id BIGINT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  event_type VARCHAR(100),
  payload JSONB,
  error TEXT,
  retry_attempted INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  manually_replayed BOOLEAN DEFAULT FALSE,
  replay_result TEXT,
  INDEX idx_shop_created (shop_id, created_at)
);

-- Email log
CREATE TABLE email_log (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT REFERENCES shops(id) ON DELETE SET NULL,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  recipient_email VARCHAR(255),
  email_type VARCHAR(50),  -- verification, reset_password, settlement_notification, etc.
  subject VARCHAR(255),
  status VARCHAR(50),  -- sent, delivered, bounced, failed
  smtp_response TEXT,
  sent_at TIMESTAMP DEFAULT now(),
  delivered_at TIMESTAMP,
  bounce_reason TEXT,
  retry_count INT DEFAULT 0,
  INDEX idx_recipient_status (recipient_email, status),
  INDEX idx_user_type (user_id, email_type),
  INDEX idx_sent_at (sent_at DESC)
);

-- Sync metrics (for observability)
CREATE TABLE sync_metrics (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  sync_type VARCHAR(50),  -- order, payment, webhook, etc.
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  duration_ms INT,
  items_processed INT,
  items_failed INT,
  error TEXT,
  INDEX idx_shop_time (shop_id, start_time DESC)
);

-- Tier enforcement log
CREATE TABLE tier_enforcement_log (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  pricing_tier VARCHAR(50),
  action VARCHAR(100),  -- entry_post_denied, limit_warning, tier_upgrade, etc.
  limit INT,
  current_count INT,
  triggered_at TIMESTAMP DEFAULT now(),
  INDEX idx_shop_triggered (shop_id, triggered_at DESC)
);

-- Existing table modifications (from v2.0)
ALTER TABLE journal_entries ADD COLUMN (
  auto_journal_flag BOOLEAN DEFAULT FALSE
);
```

### 2.2 Indexes for Query Performance

```sql
-- Order sync queries
CREATE INDEX idx_shopee_orders_shop_created ON shopee_orders(shop_id, create_time DESC);
CREATE INDEX idx_shopee_orders_status ON shopee_orders(shop_id, order_status);

-- Income sync queries
CREATE INDEX idx_shopee_income_shop_payout ON shopee_income_entries(shop_id, actual_payout_time DESC);
CREATE INDEX idx_shopee_income_sync_status ON shopee_income_entries(shop_id, sync_status);

-- Journal queries (existing, ensure coverage)
CREATE INDEX idx_journal_shop_date ON journal_entries(shop_id, date DESC);
CREATE INDEX idx_journal_shop_status ON journal_entries(shop_id, status);
CREATE INDEX idx_journal_auto_flag ON journal_entries(shop_id, auto_journal_flag);

-- Webhook queries
CREATE INDEX idx_webhooks_shop_type ON webhooks_log(shop_id, event_type);
CREATE INDEX idx_webhooks_processed ON webhooks_log(processed, created_at DESC);

-- Email log queries
CREATE INDEX idx_email_user_type ON email_log(user_id, email_type);
CREATE INDEX idx_email_sent_at ON email_log(sent_at DESC);
```

---

## 3. API Specification

### 3.1 Auth Endpoints

#### POST /api/v1/auth/shopee-authorize
Initiate Shopee OAuth

**Request:**
```json
{}
```

**Response (redirect):**
```
HTTP 302 Location: https://partner.shopeemobile.com/api/auth/authorize?partner_id=...&redirect=...&state=...
```

---

#### GET /api/v1/auth/shopee-callback
Shopee OAuth callback

**Query params:**
- `code` (string)
- `state` (string)

**Response:**
```json
{
  "ok": true,
  "message": "Toko berhasil terhubung ✓"
}
```

Redirect: `/dashboard` on success, `/auth/error?msg=...` on fail

---

#### POST /api/v1/auth/verify-email
Verify email with OTP or token

**Request:**
```json
{
  "otp": "123456"  // OR
  "token": "eyJhbGc..."
}
```

**Response:**
```json
{
  "ok": true,
  "email_verified": true
}
```

---

#### POST /api/v1/auth/forget-password
Initiate password reset

**Request:**
```json
{
  "email": "seller@example.com"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Email reset password sudah dikirim"
}
```

---

#### POST /api/v1/auth/reset-password
Reset password with token

**Request:**
```json
{
  "token": "eyJhbGc...",
  "new_password": "NewPassword123!"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Password berhasil direset"
}
```

---

### 3.2 Onboarding Endpoints

#### GET /api/v1/shops/:shopId/onboarding/pembukuan
Get onboarding state

**Response:**
```json
{
  "current_step": 0,
  "completed_steps": [],
  "coa_templates": [
    {
      "id": "sak_emkm",
      "name": "SAK EMKM 45 Akun",
      "description": "Template standar untuk UMKM"
    },
    {
      "id": "custom",
      "name": "Custom",
      "description": "Buat sendiri"
    }
  ]
}
```

---

#### POST /api/v1/shops/:shopId/onboarding/pembukuan/step-1
Select CoA template

**Request:**
```json
{
  "template_selected": "sak_emkm",
  "custom_accounts": [
    {
      "code": "1110",
      "name": "Kas di Bank",
      "type": "asset"
    }
  ]
}
```

**Response:**
```json
{
  "ok": true,
  "step": 1,
  "coa_count": 45
}
```

---

#### GET /api/v1/shops/:shopId/onboarding/pembukuan/step-2
Get order/payment stats for step 2

**Response:**
```json
{
  "total_orders": 42,
  "total_revenue": "50000000",
  "total_income_entries": 15,
  "period_days": 30
}
```

---

#### POST /api/v1/shops/:shopId/onboarding/pembukuan/step-2
Enable auto-journal + trigger backfill

**Request:**
```json
{
  "auto_journal_enabled": true
}
```

**Response:**
```json
{
  "ok": true,
  "step": 2,
  "job_id": "abc123xyz",
  "status": "processing"
}
```

---

#### GET /api/v1/shops/:shopId/onboarding/job/:jobId
Poll backfill job progress

**Response:**
```json
{
  "job_id": "abc123xyz",
  "status": "processing",  // processing, completed, failed
  "progress": 60,  // 0-100
  "items_processed": 9,
  "items_total": 15,
  "error": null
}
```

---

### 3.3 Journal Endpoints (from v2.0, with tier check)

#### POST /api/v1/shops/:shopId/journals/entries
Create manual journal entry (tier-checked)

**Tier enforcement:**
- FREE: max 100 lifetime entries (reject if >= 100)
- STARTER: max 5000/month (warn if >= 5000)
- PRO: unlimited

**Request:**
```json
{
  "date": "2026-08-05",
  "description": "Penerimaan kas penjualan",
  "lines": [
    { "account_id": 1110, "debit": 1000000, "credit": 0 },
    { "account_id": 4110, "debit": 0, "credit": 1000000 }
  ]
}
```

**Response (success):**
```json
{
  "ok": true,
  "entry_id": 123,
  "status": "DRAFT"
}
```

**Response (tier limit exceeded, free tier):**
```json
{
  "error": "tier_limit_exceeded",
  "status": 403,
  "message": "Pembukuan unlimited tersedia di Starter — Rp 99k/bulan",
  "limit": 100,
  "current": 100,
  "upsell_url": "/dashboard/pricing"
}
```

---

### 3.4 Observability Endpoints

#### GET /api/v1/auth/health
Health check (public)

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
      "orders_synced": 42
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

---

#### GET /api/v1/admin/metrics
Prometheus metrics (internal, IP-gated)

**Response (text format):**
```
sync_order_total{shop_id="600001"} 42
sync_payment_total{shop_id="600001"} 15
email_sent_total{type="verification"} 250
email_bounce_total 3
journal_entry_total{tier="free"} 100
webhook_received_total{event_type="order_create"} 1250
webhook_failed_total{event_type="order_create"} 5
```

---

#### POST /admin/webhooks/replay/:id
Replay failed webhook (ops only)

**Response:**
```json
{
  "ok": true,
  "webhook_id": 123,
  "replay_status": "processing"
}
```

---

## 4. Job Queue Design (Bull)

### 4.1 Queue Types

```typescript
// 1. Order Sync Queue
const orderSyncQueue = new Queue('order-sync', redisConnection);
orderSyncQueue.process('sync-all-shops', async (job) => {
  // FR1.2.1 + FR1.2.2
  for (const shop of authorizedShops) {
    await fetchAndUpsertOrders(shop);
  }
});
orderSyncQueue.add(
  'sync-all-shops',
  {},
  { repeat: { cron: '0 6 * * *' } }  // 6am daily
);

// 2. Payment Sync Queue
const paymentSyncQueue = new Queue('payment-sync', redisConnection);
paymentSyncQueue.process('sync-all-payments', async (job) => {
  // FR1.3.1 + FR1.3.2
  for (const shop of authorizedShops) {
    await fetchAndUpsertIncome(shop);
    await createAutoJournals(shop);
  }
});
paymentSyncQueue.add(
  'sync-all-payments',
  {},
  { repeat: { cron: '0 8 * * *' } }  // 8am daily
);

// 3. Webhook Processing Queue
const webhookQueue = new Queue('webhook', redisConnection);
webhookQueue.process(5, async (job) => {  // 5 concurrent workers
  const { event_type, data, shop_id } = job.data;
  if (event_type === 'order_create') {
    await syncOrder(shop_id, data.order_sn);
  } else if (event_type === 'payment_release') {
    await createAutoJournal(shop_id, data.order_sn);
  }
});
webhookQueue.on('failed', async (job, err) => {
  if (job.attemptsMade >= job.opts.attempts) {
    // Move to DLQ
    await moveToDLQ(job, err);
  }
});

// 4. Email Queue
const emailQueue = new Queue('email', redisConnection);
emailQueue.process(2, async (job) => {  // 2 concurrent SMTP connections
  const { recipient, subject, body } = job.data;
  await sendEmail(recipient, subject, body);
});

// 5. Token Refresh Queue
const tokenRefreshQueue = new Queue('token-refresh', redisConnection);
tokenRefreshQueue.process('refresh-all-tokens', async (job) => {
  // FR1.1.3
  for (const shop of authorizedShops) {
    if (shouldRefreshToken(shop)) {
      await refreshAccessToken(shop);
    }
  }
});
tokenRefreshQueue.add(
  'refresh-all-tokens',
  {},
  { repeat: { cron: '0 */3 * * *' } }  // Every 3 hours
);
```

### 4.2 Queue Monitoring

```typescript
// Alert on DLQ buildup
webhookQueue.on('failed', async (job, err) => {
  const dlqSize = await getWebhookDLQSize();
  if (dlqSize > 10) {
    await alertOps(`Webhook DLQ has ${dlqSize} items`);
  }
});

// Log queue stats every 10min
setInterval(async () => {
  const stats = {
    order_sync_pending: await orderSyncQueue.count(),
    payment_sync_pending: await paymentSyncQueue.count(),
    webhook_pending: await webhookQueue.count(),
    email_pending: await emailQueue.count(),
    dlq_size: await getWebhookDLQSize()
  };
  logger.info('queue-stats', stats);
}, 10 * 60 * 1000);
```

---

## 5. Error Handling Strategy

### 5.1 Shopee API Errors

```typescript
async function fetchOrderListWithRetry(shop, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await shopeeAPI.getOrderList({
        shop_id: shop.id,
        access_token: shop.shopee_access_token
      });
    } catch (error) {
      if (error.code === 'error_auth' || error.code === 'error_partner_key_expired') {
        // Token expired, try refresh
        await refreshAccessToken(shop);
        if (attempt === maxRetries) throw error;
        continue;
      }
      if (error.code === 'error_rate_limit' || error.status === 429) {
        // Rate limit, exponential backoff
        const backoff = Math.pow(2, attempt - 1) * 1000;
        await sleep(backoff);
        if (attempt < maxRetries) continue;
        throw error;
      }
      // Other errors, fail fast
      throw error;
    }
  }
}
```

### 5.2 Webhook Retry Logic

```typescript
webhookQueue.process(async (job) => {
  const { event_type, data } = job.data;
  try {
    await processWebhookEvent(event_type, data);
    return { success: true };
  } catch (error) {
    if (isTransientError(error)) {
      // Retry
      throw error;  // Bull will retry per job options
    } else {
      // Non-transient, move to DLQ
      await moveWebhookToDLQ(job.id, error);
      return { success: false, dlq: true };
    }
  }
});

// Webhook job config
webhookQueue.add(
  payload,
  {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 1000  // 1s base, then 2s, 4s, 8s, 16s
    },
    removeOnComplete: true,
    removeOnFail: false  // Keep failed jobs for inspection
  }
);
```

### 5.3 Email Retry Logic

```typescript
emailQueue.process(async (job) => {
  const { recipient, subject, body } = job.data;
  try {
    const response = await sendEmailViaSMTP(recipient, subject, body);
    await logEmailSent({
      recipient,
      subject,
      status: 'sent',
      smtp_response: response,
      sent_at: new Date()
    });
    return { success: true, message_id: response.messageId };
  } catch (error) {
    if (isTransientSMTPError(error)) {
      // Retry transient errors (connection timeout, temp fail)
      throw error;
    } else {
      // Non-transient (auth fail, invalid recipient), skip retry
      await logEmailFailed({
        recipient,
        subject,
        status: 'failed',
        error: error.message,
        sent_at: new Date()
      });
      return { success: false, skip_retry: true };
    }
  }
});

emailQueue.add(
  { recipient, subject, body },
  {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000  // 5s base
    }
  }
);
```

---

## 6. Cron Job Scheduler

### 6.1 Cron Configuration

```typescript
// In NestJS ScheduleModule

import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SyncService {
  constructor(
    private orderSyncQueue: Queue,
    private paymentSyncQueue: Queue,
    private tokenRefreshQueue: Queue
  ) {}

  @Cron('0 6 * * *', { timeZone: 'Asia/Jakarta' })  // 6am UTC+7 daily
  async syncOrders() {
    await this.orderSyncQueue.add('sync-all-shops', {});
  }

  @Cron('0 8 * * *', { timeZone: 'Asia/Jakarta' })  // 8am UTC+7 daily
  async syncPayments() {
    await this.paymentSyncQueue.add('sync-all-payments', {});
  }

  @Cron('0 */3 * * *', { timeZone: 'Asia/Jakarta' })  // Every 3 hours
  async refreshTokens() {
    await this.tokenRefreshQueue.add('refresh-all-tokens', {});
  }

  @Cron('*/10 * * * *', { timeZone: 'Asia/Jakarta' })  // Every 10 minutes
  async monitorQueues() {
    // Check DLQ size, alert if needed
  }
}
```

### 6.2 Cron Monitoring

```typescript
// Log each cron execution
@Cron('0 6 * * *')
async syncOrders() {
  const startTime = Date.now();
  try {
    await this.orderSyncQueue.add('sync-all-shops', {});
    const duration = Date.now() - startTime;
    logger.info('sync-orders-triggered', {
      duration_ms: duration,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('sync-orders-failed', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    await alertOps(`Order sync cron failed: ${error.message}`);
  }
}

// Health check: ensure cron ran recently
@Get('/admin/health/cron')
async cronHealth() {
  const lastOrderSync = await getLastCronExecution('order-sync');
  const lastPaymentSync = await getLastCronExecution('payment-sync');
  
  const orderSyncOK = lastOrderSync && (Date.now() - lastOrderSync.getTime()) < 25 * 60 * 1000;  // <25min
  const paymentSyncOK = lastPaymentSync && (Date.now() - lastPaymentSync.getTime()) < 25 * 60 * 1000;

  if (!orderSyncOK || !paymentSyncOK) {
    return { ok: false, status: 'cron-missed' };
  }
  return { ok: true };
}
```

---

## 7. Encryption & Security

### 7.1 Field-Level Encryption

```typescript
// Use DB encryption for sensitive fields
import { encrypt, decrypt } from '@/utils/crypto';

@Entity()
export class Shop {
  @Column({ type: 'text', transformer: {
    to: (value: string) => value ? encrypt(value) : null,
    from: (value: string) => value ? decrypt(value) : null
  }})
  shopee_access_token: string;

  @Column({ type: 'text', transformer: {
    to: (value: string) => value ? encrypt(value) : null,
    from: (value: string) => value ? decrypt(value) : null
  }})
  shopee_refresh_token: string;

  @Column({ type: 'text', transformer: {
    to: (value: string) => value ? encrypt(value) : null,
    from: (value: string) => value ? decrypt(value) : null
  }})
  shopee_partner_key: string;
}
```

### 7.2 HMAC Verification

```typescript
import * as crypto from 'crypto';

function verifyWebhookSignature(
  partnerId: string,
  timestamp: number,
  data: any,
  signature: string,
  partnerKey: string
): boolean {
  const message = `${partnerId}${timestamp}${JSON.stringify(data)}`;
  const expectedSignature = crypto
    .createHmac('sha256', partnerKey)
    .update(message)
    .digest('hex');
  
  // Constant-time comparison (prevent timing attack)
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### 7.3 Rate Limiting

```typescript
import { RateLimitGuard } from '@/guards/rate-limit.guard';

// Per-endpoint rate limits
@Post('/auth/forget-password')
@UseGuards(RateLimitGuard)
@RateLimit({ windowMs: 60 * 60 * 1000, max: 3 })  // 3 per hour per email
async forgetPassword(@Body('email') email: string) {
  // ...
}

@Post('/api/v1/auth/verify-email')
@UseGuards(RateLimitGuard)
@RateLimit({ windowMs: 60 * 1000, max: 5 })  // 5 attempts per minute
async verifyEmail(@Body('otp') otp: string) {
  // Check attempts in Redis
  const attempts = await redis.incr(`verify_otp_attempts:${userId}`);
  if (attempts > 5) throw new TooManyAttemptsError();
  // ...
}
```

---

## 8. Deployment Architecture

### 8.1 VPS Layout (no Docker)

```
/opt/dnshop/
├── backend/
│   ├── dist/
│   ├── node_modules/
│   ├── .env.production
│   └── package.json
├── frontend/
│   ├── .next/
│   ├── node_modules/
│   ├── .env.production
│   └── package.json
├── logs/
│   ├── dnshop-api.log
│   ├── dnshop-web.log
│   └── app.log (JSON)
├── redis/ (if local Redis)
└── ssl/
    ├── shop.dntech.id.crt
    └── shop.dntech.id.key
```

### 8.2 PM2 Config

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'dnshop-api',
      script: './dist/main.js',
      cwd: '/opt/dnshop/backend',
      instances: 2,  // 2 workers
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 6001,
        LOG_LEVEL: 'info',
        DB_SSL: true
      },
      error_file: '/opt/dnshop/logs/dnshop-api.err.log',
      out_file: '/opt/dnshop/logs/dnshop-api.out.log',
      log_file: '/opt/dnshop/logs/dnshop-api.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      restart_delay: 4000,
      max_memory_restart: '500M',
      listen_timeout: 5000
    },
    {
      name: 'dnshop-web',
      script: 'npm run start',  // Next.js standalone mode
      cwd: '/opt/dnshop/frontend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 6000,
        NEXT_PUBLIC_API_URL: 'https://api.shop.dntech.id'
      },
      error_file: '/opt/dnshop/logs/dnshop-web.err.log',
      out_file: '/opt/dnshop/logs/dnshop-web.out.log',
      max_memory_restart: '400M'
    }
  ]
};
```

### 8.3 nginx Config

```nginx
# /etc/nginx/sites-available/dnshop.conf

upstream backend {
  server 127.0.0.1:6001;
  server 127.0.0.1:6001;  # Load balance across 2 workers
  keepalive 32;
}

upstream frontend {
  server 127.0.0.1:6000;
  server 127.0.0.1:6000;
  keepalive 32;
}

# HTTP redirect to HTTPS
server {
  listen 80;
  server_name shop.dntech.id api.shop.dntech.id;
  return 301 https://$server_name$request_uri;
}

# API backend
server {
  listen 443 ssl http2;
  server_name api.shop.dntech.id;

  ssl_certificate /opt/dnshop/ssl/shop.dntech.id.crt;
  ssl_certificate_key /opt/dnshop/ssl/shop.dntech.id.key;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;

  access_log /opt/dnshop/logs/api-access.log;
  error_log /opt/dnshop/logs/api-error.log;

  client_max_body_size 10M;

  location / {
    proxy_pass http://backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    # WebSocket upgrade
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }

  # Rate limit
  limit_req_zone $binary_remote_addr zone=api:10m rate=100r/s;
  limit_req zone=api burst=200 nodelay;
}

# Frontend
server {
  listen 443 ssl http2;
  server_name shop.dntech.id;

  ssl_certificate /opt/dnshop/ssl/shop.dntech.id.crt;
  ssl_certificate_key /opt/dnshop/ssl/shop.dntech.id.key;

  access_log /opt/dnshop/logs/web-access.log;
  error_log /opt/dnshop/logs/web-error.log;

  location / {
    proxy_pass http://frontend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
  }

  # Cache static assets
  location /_next/static {
    proxy_cache STATIC;
    proxy_cache_valid 200 60d;
    proxy_pass http://frontend;
  }
}
```

---

## 9. Monitoring & Alerting Setup

### 9.1 Prometheus Scrape Config

```yaml
# /etc/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'dnshop-api'
    static_configs:
      - targets: ['api.shop.dntech.id:443/api/v1/admin/metrics']
    scheme: https

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']
```

### 9.2 Alert Rules

```yaml
# /etc/prometheus/rules.yml
groups:
  - name: dnshop
    interval: 1m
    rules:
      - alert: EmailDeliveryRateLow
        expr: email_delivered_rate < 0.90
        for: 1h
        annotations:
          summary: "Email delivery rate below 90%"
          
      - alert: SyncLatencyHigh
        expr: sync_latency_p95_ms > 10000
        for: 5m
        annotations:
          summary: "Order sync latency >10s"

      - alert: WebhookFailureRate
        expr: webhook_failed_total / webhook_received_total > 0.05
        for: 1h
        annotations:
          summary: "Webhook failure rate >5%"

      - alert: DLQBacklog
        expr: webhooks_dlq_size > 10
        for: 1h
        annotations:
          summary: "{{ $value }} webhooks in DLQ"
```

### 9.3 Slack Alerting

```typescript
// In NestJS logger
import { slack } from '@/services/slack';

logger.on('error', async (entry) => {
  if (entry.level === 'error') {
    await slack.send({
      channel: '#ops-alerts',
      text: `:warning: ${entry.service} error`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Error in ${entry.service}*\n\`\`\`${entry.error}\n${entry.stack}\`\`\``
          }
        }
      ]
    });
  }
});
```

---

## 10. Testing Strategy

### 10.1 Unit Tests (Jest)

```typescript
// test/shopee-oauth.spec.ts
describe('Shopee OAuth', () => {
  it('should verify HMAC signature correctly', () => {
    const sign = verifyWebhookSignature(
      'partner123',
      1722854400,
      { order_sn: '123' },
      'expected_sig',
      'partner_key'
    );
    expect(sign).toBe(true);
  });

  it('should reject invalid signature', () => {
    const sign = verifyWebhookSignature(
      'partner123',
      1722854400,
      { order_sn: '123' },
      'wrong_sig',
      'partner_key'
    );
    expect(sign).toBe(false);
  });

  it('should enforce tier limits', () => {
    const shop = { pricing_tier: 'free', journal_count: 100 };
    expect(() => createJournalEntry(shop, {})).toThrow('tier_limit_exceeded');
  });
});
```

### 10.2 Integration Tests (with mock Shopee)

```typescript
// test/e2e/order-sync.e2e.ts
describe('Order Sync E2E', () => {
  beforeAll(async () => {
    app = await Test.createTestingModule(AppModule).compile().createNestApplication();
    await app.init();
    
    // Seed: create test shop with mock Shopee creds
    testShop = await createShop({
      shopee_access_token: 'mock_token_123',
      shopee_auth_status: 'authorized'
    });
  });

  it('should sync orders and update dashboard', async () => {
    // Mock Shopee API
    mock.onGet(/\/api\/v2\/order\/get_order_list/).reply(200, {
      response: {
        order_list: [{ order_sn: 'SN123' }],
        more: false
      }
    });

    // Trigger sync
    await orderSyncService.syncOrdersForAllShops();

    // Verify DB
    const orders = await orderRepo.find({ shop_id: testShop.id });
    expect(orders).toHaveLength(1);
    expect(orders[0].order_sn).toBe('SN123');
  });
});
```

---

## 11. Env Variables (Production)

```bash
# .env.production

# Database
DATABASE_URL=postgresql://user:pwd@localhost:5432/dnshop?sslmode=require
DB_SSL=true

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
# If Redis unavailable, queue falls back to inline processing

# Shopee
SHOPEE_PARTNER_ID=1234567890
SHOPEE_PARTNER_KEY=sk_live_xxx...
SHOPEE_REDIRECT_URI=https://api.shop.dntech.id/api/v1/auth/shopee-callback

# OAuth
JWT_SECRET=<long_random_string_min_32_chars>
JWT_REFRESH_SECRET=<different_random_string>
SESSION_SECRET=<another_random_string>

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@dntech.id
SMTP_PASS=<app-specific-password>
SMTP_FROM=noreply@dntech.id

# Features
TIER_ENFORCE=true
TIER_FREE_LIMIT=100
TIER_STARTER_LIMIT=5000

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
LOG_FILE=/opt/dnshop/logs/app.log

# Slack
SLACK_WEBHOOK_OPS_ALERTS=https://hooks.slack.com/services/...

# Cron timezones
TZ=Asia/Jakarta

# Node
NODE_ENV=production
PORT=6001
```

---

## 12. Rollback & Incident Playbook

### 12.1 Rollback Procedures

**Scenario: Order sync broken**
```bash
# 1. Stop sync cron
pm2 stop dnshop-api

# 2. Check last successful sync
SELECT * FROM sync_metrics WHERE sync_type = 'order' ORDER BY end_time DESC LIMIT 1;

# 3. If data corrupted, restore from backup
pg_restore -d dnshop /backups/dnshop.backup

# 4. Restart
pm2 start dnshop-api
pm2 logs dnshop-api
```

**Scenario: Email queue overloaded**
```bash
# 1. Clear queue
redis-cli DEL bull:email:*

# 2. Manually replay from DLQ
curl -X POST https://api.shop.dntech.id/admin/webhooks/replay-dlq

# 3. Monitor
watch -n5 'redis-cli LLEN bull:email:* | tail -1'
```

### 12.2 Incident Runbook

| Scenario | Action |
|----------|--------|
| Redis down | Fallback to inline queue; no new features until Redis online |
| DB connection pool exhausted | Increase pool size, restart API, check for connection leaks |
| Sync latency >10min | Check Shopee API status, rate limits; consider batching |
| Webhook DLQ >10 items | Check webhook logs, verify Shopee signatures, replay manually |
| Email delivery <90% | Check SMTP logs, verify SPF/DKIM, contact email provider |
| Tier enforcement broken | `TIER_ENFORCE=false`, investigate in logs, fix + test, re-enable |

---

## 13. Checklists (Pre-deployment)

### 13.1 Security Checklist
- [ ] All secrets encrypted at rest (AES-256)
- [ ] HMAC verification in webhook handler
- [ ] Rate limiting on auth endpoints (3 forget-password/hour)
- [ ] SQL injection tests (parameterized queries)
- [ ] XSS tests (sanitize user input)
- [ ] CORS headers set correctly
- [ ] SSL certificate valid + auto-renew configured
- [ ] No credentials in logs

### 13.2 Functionality Checklist
- [ ] OAuth flow tested (sandbox + live Shopee)
- [ ] Order sync cron runs at 6am, fetches orders
- [ ] Payment sync cron runs at 8am, creates auto-journal
- [ ] Webhook handler verifies signature
- [ ] Email verification OTP sent + verified correctly
- [ ] Onboarding wizard completes end-to-end
- [ ] Tier enforcement blocks free tier at 100 entries
- [ ] Health endpoint returns all services
- [ ] Metrics endpoint populated + Prometheus scrapes

### 13.3 Performance Checklist
- [ ] Order sync latency p95 <5min (load test 100 shops)
- [ ] Webhook processing <5s response time
- [ ] Dashboard load <2s (50 shops + cache)
- [ ] Email send latency <5s
- [ ] Health endpoint p99 <100ms

### 13.4 Monitoring Checklist
- [ ] Prometheus scrape working
- [ ] Slack alerts configured + test alert fires
- [ ] JSON logs written to file + rotated
- [ ] Metrics endpoint IP-gated
- [ ] DLQ monitoring alert set
- [ ] Runbook accessible to ops team

---

## Glossary

- **NestJS** — Framework for backend (Node.js + TypeScript)
- **Bull** — Queue library for Node.js + Redis
- **PM2** — Process manager (cluster mode, auto-restart)
- **nginx** — Reverse proxy + load balancer
- **Let's Encrypt** — Free SSL/TLS certificates
- **Prometheus** — Metrics collection + alerting
- **Grafana** — Metrics visualization
- **DLQ** — Dead-letter queue (failed jobs archive)
- **RPO** — Recovery Point Objective (data loss tolerance)
- **RTO** — Recovery Time Objective (downtime tolerance)

---

**End of SDD**  
**Total documents:** PRD + SRS + SDD (3 files)  
**Next step:** Implementation in dnShop Finance repo

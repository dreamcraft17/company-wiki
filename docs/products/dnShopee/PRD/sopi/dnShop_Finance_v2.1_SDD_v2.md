# dnShop Finance v2.1 — Software Design Document (REVISED)

**Document ID:** `dnShop_Finance_v2.1_SDD_v2.md`  
**Version:** 2.1.1  
**Date:** August 2026  
**Owner:** Dozer (CEO + Tech Lead, DN Tech)  
**Status:** **Implemented 100%** (6 Agustus 2026) — lihat `docs/STATUS.md`  
**Related:** [PRD v2](./dnShop_Finance_v2.1_PRD_v2.md) · [SRS v2](./dnShop_Finance_v2.1_SRS_v2.md)

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js 15)                      │
│     shop.dntech.id - Dashboard, Pembukuan, Wizard, Upsell      │
└─────────────────────────────────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API Gateway (nginx reverse proxy)             │
│              api.shop.dntech.id (port 6001)                     │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
    ┌─────────┐         ┌──────────┐        ┌──────────────┐
    │ NestJS  │         │ Bull/    │        │  WebSocket   │
    │ API     │         │ Redis    │        │  (socket.io) │
    │ (6001)  │         │ Queues   │        │              │
    │         │         │          │        │ Real-time:   │
    │ • Auth  │         │ • Order  │        │ • Order      │
    │ • Shops │         │   sync   │        │   updates    │
    │ • OAuth │         │ • Payment│        │ • Auto-      │
    │ • Webhook         │   sync   │        │   journal    │
    │ • Journal         │ • Email  │        │ • Webhook    │
    │ • Onboard         │ • Auto-  │        │   events     │
    │ • Health          │   journal│        └──────────────┘
    └─────────┘         └──────────┘
         │                    │
         │         ┌──────────┴───────────┐
         │         ▼                      ▼
         │    ┌──────────────┐    ┌────────────────┐
         │    │ Redis (5.0)  │    │  PostgreSQL    │
         │    │              │    │  (12+)         │
         │    │ • Session    │    │                │
         │    │ • OAuth state│    │ • Shops        │
         │    │ • Queue (Bull)   │ • Users        │
         │    │ • Cache      │    │ • Orders       │
         │    │ • Email DLQ  │    │ • Income       │
         │    │ • OTP tokens │    │ • Payouts      │
         │    │ • Reset pwd  │    │ • Journals     │
         │    └──────────────┘    │ • CoA          │
         │                        │ • Email log    │
         │                        │ • Webhooks     │
         │                        └────────────────┘
         │
    ┌────┴─────┬──────────┬────────┐
    ▼          ▼          ▼        ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌─────────┐
│Shopee  │ │ SMTP   │ │Cloud-  │ │Stripe/ │
│ API    │ │(Gmail) │ │flare   │ │Midtrans│
│ (OAuth │ │        │ │(CDN)   │ │(Payment│
│ Orders │ │ Email  │ │        │ │option) │
│ Income)│ │ Send   │ │Caching │ │        │
└────────┘ └────────┘ └────────┘ └─────────┘

External APIs: Shopee Open API, SMTP, Cloudflare DNS, (optional) Stripe
```

---

## 2. Comprehensive Database Schema

### 2.1 Shop-Related Tables (Extensions)

```sql
-- shops table extensions (from v2.0)
ALTER TABLE shops ADD COLUMN (
  -- Shopee OAuth
  is_cross_border BOOLEAN DEFAULT FALSE,
  shopee_auth_status VARCHAR(50) DEFAULT 'pending',  -- pending, authorized, token_refresh_failed, expired
  shopee_access_token VARCHAR(255) ENCRYPTED,
  shopee_refresh_token VARCHAR(255) ENCRYPTED,
  shopee_token_expires_at TIMESTAMP,
  
  -- Sync state
  last_order_sync_at TIMESTAMP,
  last_order_sync_status VARCHAR(50),  -- success, failed, partial
  last_payment_sync_at TIMESTAMP,
  last_payment_sync_status VARCHAR(50),
  
  -- Onboarding
  onboarding_step INT DEFAULT 0,  -- 0=not started, 1/2/3=wizard, 4=completed
  onboarding_template_selected VARCHAR(50),  -- sak_emkm, custom
  onboarding_auto_journal_enabled BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMP,
  
  -- Tier & revenue
  pricing_tier VARCHAR(50) DEFAULT 'free',  -- free, starter, pro, enterprise
  tier_enforced_at TIMESTAMP,
  tier_reset_at TIMESTAMP,  -- for monthly Starter reset
  
  -- Shopee shop details
  shopee_shop_id BIGINT UNIQUE,
  shopee_shop_name VARCHAR(255),
  shopee_region VARCHAR(10),  -- ID, VN, TH, SG, MY, BR, etc.
  default_currency VARCHAR(3)  -- IDR, VND, THB, SGD, etc.
);

-- Users email verification (from v2.0)
ALTER TABLE users ADD COLUMN (
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  verification_token_expires_at TIMESTAMP
);
```

### 2.2 Order & Income Tables (New)

```sql
-- Shopee orders (denormalized for quick access)
CREATE TABLE shopee_orders (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  order_sn VARCHAR(50) NOT NULL,
  order_status VARCHAR(50),  -- READY_TO_SHIP, SHIPPED, COMPLETED, CANCELLED, etc.
  total_amount NUMERIC(14, 2),  -- seller receives (after Shopee komisi)
  buyer_total_amount NUMERIC(14, 2),  -- what buyer paid (for komisi calculation)
  currency VARCHAR(3),  -- IDR, VND, THB, SGD, etc.
  payment_method VARCHAR(100),  -- COD, Card, e-wallet, etc.
  buyer_username VARCHAR(255),
  buyer_user_id BIGINT,
  recipient_address JSONB,  -- { name, phone, city, district, state, full_address, zipcode }
  item_list JSONB,  -- [{ item_id, item_name, model_name, qty, model_discounted_price, ... }]
  create_time TIMESTAMP,  -- Shopee order creation time
  update_time TIMESTAMP,  -- Last Shopee update time
  sync_status VARCHAR(50) DEFAULT 'synced',  -- synced, journal_pending, journal_posted
  synced_at TIMESTAMP,  -- When we last pulled this from Shopee
  
  UNIQUE(shop_id, order_sn),
  INDEX idx_shop_sn (shop_id, order_sn),
  INDEX idx_shop_create (shop_id, create_time DESC),
  INDEX idx_shop_status (shop_id, order_status)
);

-- Shopee income entries (from payment sync)
CREATE TABLE shopee_income_entries (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  order_sn VARCHAR(50),  -- may be NULL for orphan/adjustment entries
  released_amount NUMERIC(14, 2),  -- seller receives (in seller's currency)
  currency VARCHAR(3),
  exchange_rate NUMERIC(10, 6),  -- for CB shops (FX rate applied by Shopee)
  income_status INT,  -- 0=ToRelease (CB), 1=Released (Local/CB), 2=Pending
  payment_method VARCHAR(100),  -- COD, Card, e-wallet, etc.
  description VARCHAR(255),  -- "Order Income", "Adjustment", "Refund", etc.
  actual_payout_time TIMESTAMP,  -- When Shopee released funds (Unix timestamp)
  estimated_payout_time TIMESTAMP,  -- When payout is expected (Pending/ToRelease)
  journal_entry_id BIGINT REFERENCES journal_entries(id) ON DELETE SET NULL,
  sync_status VARCHAR(50) DEFAULT 'pending',  -- pending, auto_journaled, manual_review
  synced_at TIMESTAMP,
  
  UNIQUE(shop_id, order_sn, actual_payout_time),
  INDEX idx_shop_sync (shop_id, sync_status),
  INDEX idx_shop_payout (shop_id, actual_payout_time DESC)
);

-- Payout tracking (for reconciliation, especially CB)
CREATE TABLE shopee_payouts (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  encrypted_payout_id VARCHAR(255),  -- from Shopee get_payout_info API
  from_amount NUMERIC(14, 2),  -- settlement amount (in settlement currency)
  from_currency VARCHAR(3),  -- settlement currency
  payout_amount NUMERIC(14, 2),  -- actual payout amount (after FX)
  payout_currency VARCHAR(3),  -- payout currency (seller's payment method currency)
  exchange_rate NUMERIC(10, 6),  -- FX rate applied (from_currency → payout_currency)
  payout_time TIMESTAMP,  -- When Shopee payout occurred
  pay_service VARCHAR(50),  -- payoneer, pingpong, lianlian, bank_transfer, etc.
  payee_id VARCHAR(255),  -- seller's account ID with pay_service
  
  -- Reconciliation fields
  bank_transfer_date TIMESTAMP,  -- When seller confirmed bank received funds
  bank_amount_received NUMERIC(14, 2),  -- Amount that actually landed in bank
  bank_currency VARCHAR(3),
  reconciled BOOLEAN DEFAULT FALSE,
  reconciliation_notes TEXT,  -- e.g., "Amount matched", "Missing Rp 50k", etc.
  
  created_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(shop_id, encrypted_payout_id),
  INDEX idx_shop_payout_time (shop_id, payout_time DESC),
  INDEX idx_reconciled (shop_id, reconciled)
);
```

### 2.3 Webhook & Communication Tables

```sql
-- Webhook event log
CREATE TABLE webhooks_log (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  event_type VARCHAR(100),  -- order_create, order_ship, payment_release, etc.
  payload JSONB,  -- full Shopee webhook payload
  signature VARCHAR(255),
  signature_valid BOOLEAN,
  processed BOOLEAN DEFAULT FALSE,
  retry_count INT DEFAULT 0,
  last_retry_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT now(),
  
  INDEX idx_shop_type (shop_id, event_type),
  INDEX idx_processed (processed, created_at DESC)
);

-- Dead-letter queue (failed webhooks)
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
  
  INDEX idx_shop_created (shop_id, created_at DESC)
);

-- Email log
CREATE TABLE email_log (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT REFERENCES shops(id) ON DELETE SET NULL,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  recipient_email VARCHAR(255),
  email_type VARCHAR(50),  -- verification, reset_password, settlement_notification, etc.
  subject VARCHAR(255),
  body_preview TEXT,  -- first 200 chars for debugging
  status VARCHAR(50),  -- queued, sent, delivered, bounced, failed
  smtp_response TEXT,  -- SMTP server response (for debugging)
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  bounce_reason TEXT,  -- "Mailbox full", "User unknown", etc.
  retry_count INT DEFAULT 0,
  last_retry_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT now(),
  
  INDEX idx_recipient_status (recipient_email, status),
  INDEX idx_user_type (user_id, email_type),
  INDEX idx_sent_at (sent_at DESC)
);
```

### 2.4 Monitoring & Audit Tables

```sql
-- Sync metrics (observability)
CREATE TABLE sync_metrics (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  sync_type VARCHAR(50),  -- order, payment, webhook_process, email_send, etc.
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  duration_ms INT,
  items_processed INT,
  items_failed INT,
  error_message TEXT,
  
  created_at TIMESTAMP DEFAULT now(),
  
  INDEX idx_shop_time (shop_id, start_time DESC)
);

-- Tier enforcement log
CREATE TABLE tier_enforcement_log (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  pricing_tier VARCHAR(50),
  action VARCHAR(100),  -- entry_post_denied, tier_upgrade_clicked, limit_warning, etc.
  limit_applied INT,  -- 100 (free), 5000 (starter), etc.
  current_count INT,
  triggered_at TIMESTAMP DEFAULT now(),
  
  INDEX idx_shop_time (shop_id, triggered_at DESC),
  INDEX idx_action (action)
);

-- Modified existing journal_entries table
ALTER TABLE journal_entries ADD COLUMN (
  auto_journal_flag BOOLEAN DEFAULT FALSE,  -- true if auto-generated from Shopee
  shopee_order_sn VARCHAR(50),  -- reference to order_sn for tracing
  shopee_income_entry_id BIGINT REFERENCES shopee_income_entries(id)
);

-- Existing audit_log (from v2.0) applies to all journal mutations
```

### 2.5 Indexes for Performance

```sql
-- Order queries
CREATE INDEX idx_shopee_orders_shop_created ON shopee_orders(shop_id, create_time DESC);
CREATE INDEX idx_shopee_orders_status ON shopee_orders(shop_id, order_status);
CREATE INDEX idx_shopee_orders_updated ON shopee_orders(shop_id, update_time DESC);

-- Income/payout queries
CREATE INDEX idx_shopee_income_shop_payout ON shopee_income_entries(shop_id, actual_payout_time DESC);
CREATE INDEX idx_shopee_income_sync ON shopee_income_entries(shop_id, sync_status);
CREATE INDEX idx_shopee_income_journal ON shopee_income_entries(journal_entry_id) WHERE journal_entry_id IS NOT NULL;

CREATE INDEX idx_shopee_payouts_shop_time ON shopee_payouts(shop_id, payout_time DESC);
CREATE INDEX idx_shopee_payouts_reconcile ON shopee_payouts(shop_id, reconciled);

-- Journal queries (existing, ensure coverage)
CREATE INDEX idx_journal_shop_date ON journal_entries(shop_id, date DESC);
CREATE INDEX idx_journal_auto_flag ON journal_entries(shop_id, auto_journal_flag);
CREATE INDEX idx_journal_order_sn ON journal_entries(shopee_order_sn) WHERE shopee_order_sn IS NOT NULL;

-- Webhook queries
CREATE INDEX idx_webhooks_shop_type ON webhooks_log(shop_id, event_type);
CREATE INDEX idx_webhooks_processed ON webhooks_log(processed, created_at DESC);

-- Email queries
CREATE INDEX idx_email_user_type ON email_log(user_id, email_type);
CREATE INDEX idx_email_status ON email_log(status, sent_at DESC);
```

---

## 3. Core Services Architecture

### 3.1 OAuth Service

```typescript
// src/services/shopee-oauth.service.ts

class ShopeeOAuthService {
  async initiateAuthorization(shop_id: string) {
    const state = generateRandomString(32);
    await redis.setex(`oauth_state:${state}`, 600, JSON.stringify({
      shop_id,
      created_at: Date.now()
    }));
    
    return {
      redirect_url: `https://partner.shopeemobile.com/api/auth/authorize?partner_id=${PARTNER_ID}&redirect=${REDIRECT_URI}&state=${state}`
    };
  }
  
  async handleCallback(code: string, state: string): Promise<ShopCredentials> {
    // Validate state
    const stateData = await redis.get(`oauth_state:${state}`);
    if (!stateData) throw new OAuthError('Invalid or expired state');
    
    await redis.del(`oauth_state:${state}`);  // One-time use
    
    // Exchange code for token
    const response = await shopeeAPI.post('/api/auth/token', {
      partner_id: PARTNER_ID,
      partner_key: PARTNER_KEY,
      code
    });
    
    const { access_token, refresh_token, expire_in } = response.data;
    
    // Encrypt and store
    const shop = await shopRepository.findOne(JSON.parse(stateData).shop_id);
    shop.shopee_access_token = encrypt(access_token, DB_ENCRYPTION_KEY);
    shop.shopee_refresh_token = encrypt(refresh_token, DB_ENCRYPTION_KEY);
    shop.shopee_token_expires_at = new Date(Date.now() + expire_in * 1000);
    shop.shopee_auth_status = 'authorized';
    
    await shopRepository.save(shop);
    return shop;
  }
  
  async refreshTokenIfNeeded(shop: Shop) {
    if (new Date() < new Date(shop.shopee_token_expires_at.getTime() - 30 * 60 * 1000)) {
      return;  // Token still valid for >30 min
    }
    
    try {
      const response = await shopeeAPI.post('/api/auth/refresh_token', {
        partner_id: PARTNER_ID,
        partner_key: PARTNER_KEY,
        refresh_token: decrypt(shop.shopee_refresh_token, DB_ENCRYPTION_KEY)
      });
      
      shop.shopee_access_token = encrypt(response.data.access_token, DB_ENCRYPTION_KEY);
      shop.shopee_refresh_token = encrypt(response.data.refresh_token, DB_ENCRYPTION_KEY);
      shop.shopee_token_expires_at = new Date(Date.now() + response.data.expire_in * 1000);
      
      await shopRepository.save(shop);
    } catch (error) {
      shop.shopee_auth_status = 'token_refresh_failed';
      await shopRepository.save(shop);
      await alertOps(`Token refresh failed for shop ${shop.id}: ${error.message}`);
      throw error;
    }
  }
}
```

### 3.2 Order Sync Service

```typescript
// src/services/order-sync.service.ts

class OrderSyncService {
  @Cron('0 6 * * *')  // 6am UTC+7
  async syncOrdersForAllShops() {
    const shops = await shopRepository.find({ shopee_auth_status: 'authorized' });
    
    for (const shop of shops) {
      try {
        await this.syncOrdersForShop(shop);
      } catch (error) {
        logger.error('order_sync_failed', { shop_id: shop.id, error: error.message });
        await alertOps(`Order sync failed for shop ${shop.id}`);
      }
    }
  }
  
  private async syncOrdersForShop(shop: Shop) {
    // Ensure token is fresh
    await oauthService.refreshTokenIfNeeded(shop);
    
    const timeFrom = shop.last_order_sync_at || new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    const timeTo = new Date();
    
    let cursor = '';
    let totalSynced = 0;
    
    do {
      const response = await this.fetchOrderList(shop, {
        time_from: Math.floor(timeFrom.getTime() / 1000),
        time_to: Math.floor(timeTo.getTime() / 1000),
        page_size: 100,
        cursor
      });
      
      // Batch detail fetch (max 50 per call)
      const orderSns = response.order_list.map(o => o.order_sn);
      for (let i = 0; i < orderSns.length; i += 50) {
        const batch = orderSns.slice(i, i + 50);
        await this.fetchAndUpsertOrderDetails(shop, batch);
      }
      
      totalSynced += response.order_list.length;
      cursor = response.next_cursor;
    } while (cursor);
    
    shop.last_order_sync_at = new Date();
    shop.last_order_sync_status = 'success';
    await shopRepository.save(shop);
    
    // Update dashboard + emit WebSocket
    await this.updateDashboardAggregates(shop);
    this.emitWebSocket(shop.id, { type: 'order_sync_complete', orders_synced: totalSynced });
    
    logger.info('order_sync_complete', { shop_id: shop.id, orders: totalSynced });
  }
  
  private async fetchOrderList(shop: Shop, params: any) {
    const token = decrypt(shop.shopee_access_token, DB_ENCRYPTION_KEY);
    const sign = this.computeHMAC(PARTNER_ID, '/api/v2/order/get_order_list', params, token);
    
    return shopeeAPI.get('/api/v2/order/get_order_list', {
      params: { ...params, partner_id: PARTNER_ID, access_token: token, shop_id: shop.shopee_shop_id, sign }
    });
  }
  
  private computeHMAC(partnerId: string, path: string, params: any, accessToken: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const sortedParams = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
    const message = `${partnerId}${path}${timestamp}${accessToken}${sortedParams}`;
    return crypto.createHmac('sha256', PARTNER_KEY).update(message).digest('hex');
  }
}
```

### 3.3 Payment Sync & Auto-Journal Service

```typescript
// src/services/payment-sync.service.ts

class PaymentSyncService {
  @Cron('0 8 * * *')  // 8am UTC+7 (2h after order sync)
  async syncPaymentsForAllShops() {
    const shops = await shopRepository.find({ shopee_auth_status: 'authorized' });
    
    for (const shop of shops) {
      try {
        await this.syncPaymentsForShop(shop);
        await this.createAutoJournals(shop);
      } catch (error) {
        logger.error('payment_sync_failed', { shop_id: shop.id, error: error.message });
      }
    }
  }
  
  private async syncPaymentsForShop(shop: Shop) {
    const token = decrypt(shop.shopee_access_token, DB_ENCRYPTION_KEY);
    
    const dateFrom = shop.last_payment_sync_at 
      ? formatDate(new Date(shop.last_payment_sync_at))
      : formatDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000));
    const dateTo = formatDate(new Date());
    
    let cursor = '';
    do {
      const response = await shopeeAPI.get('/api/v2/payment/get_income_detail', {
        params: {
          partner_id: PARTNER_ID,
          access_token: token,
          shop_id: shop.shopee_shop_id,
          income_status: 1,  // Released only
          date_from: dateFrom,
          date_to: dateTo,
          page_size: 30,
          cursor
        }
      });
      
      // Upsert income entries
      for (const item of response.income_detail_list) {
        const existing = await incomeEntryRepo.findOne({
          shop_id: shop.id,
          order_sn: item.order_sn,
          actual_payout_time: item.actual_payout_time
        });
        
        if (!existing) {
          await incomeEntryRepo.save({
            shop_id: shop.id,
            order_sn: item.order_sn,
            released_amount: item.released_amount,
            currency: item.currency,
            exchange_rate: item.exchange_rate || 1,
            income_status: 1,  // Released
            actual_payout_time: new Date(item.actual_payout_time * 1000),
            sync_status: 'pending'
          });
        }
      }
      
      cursor = response.next_page?.cursor || '';
    } while (cursor);
    
    shop.last_payment_sync_at = new Date();
    await shopRepository.save(shop);
  }
  
  private async createAutoJournals(shop: Shop) {
    const pendingEntries = await incomeEntryRepo.find({
      shop_id: shop.id,
      sync_status: 'pending'
    });
    
    for (const entry of pendingEntries) {
      try {
        // Fetch order for komisi calculation (CB shops)
        const order = await orderRepo.findOne({
          shop_id: shop.id,
          order_sn: entry.order_sn
        });
        
        let glLines: GLLine[] = [];
        
        if (!shop.is_cross_border) {
          // Local shop: 2 lines (Bank / Penjualan)
          glLines = [
            { account_id: 1110, debit: entry.released_amount, credit: 0 },
            { account_id: 4110, debit: 0, credit: entry.released_amount }
          ];
        } else {
          // CB shop: 3 lines (Bank / Komisi / Penjualan)
          const komisi = order ? (order.buyer_total_amount - entry.released_amount) : 0;
          glLines = [
            { account_id: 1110, debit: entry.released_amount, credit: 0 },
            { account_id: 5120, debit: 0, credit: komisi },
            { account_id: 4110, debit: 0, credit: entry.released_amount + komisi }
          ];
        }
        
        // Validate balance
        const totalDebit = glLines.reduce((sum, l) => sum + l.debit, 0);
        const totalCredit = glLines.reduce((sum, l) => sum + l.credit, 0);
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
          throw new Error(`GL entry imbalance: D=${totalDebit} C=${totalCredit}`);
        }
        
        // Create journal entry
        const journalEntry = await journalService.createEntry({
          shop_id: shop.id,
          date: entry.actual_payout_time,
          description: `Auto-journal dari Shopee: Order ${entry.order_sn}`,
          lines: glLines,
          status: 'POSTED',  // Auto-journal is posted immediately
          auto_journal_flag: true,
          shopee_order_sn: entry.order_sn
        });
        
        // Update entry
        entry.journal_entry_id = journalEntry.id;
        entry.sync_status = 'auto_journaled';
        await incomeEntryRepo.save(entry);
        
      } catch (error) {
        logger.error('auto_journal_failed', {
          shop_id: shop.id,
          order_sn: entry.order_sn,
          error: error.message
        });
      }
    }
  }
}
```

### 3.4 Webhook Service

```typescript
// src/services/webhook.service.ts

@Controller('webhooks')
class WebhookController {
  @Post('shopee')
  async handleShopeeWebhook(@Body() payload: any) {
    const { shop_id, timestamp, sign, event_type, data } = payload;
    
    // Verify signature
    const shop = await shopRepository.findOne(shop_id);
    const partnerKey = PARTNER_KEY;  // or shop-specific if needed
    const message = `${shop_id}${timestamp}${JSON.stringify(data)}`;
    const expectedSign = crypto.createHmac('sha256', partnerKey)
      .update(message)
      .digest('hex');
    
    if (!crypto.timingSafeEqual(Buffer.from(sign), Buffer.from(expectedSign))) {
      logger.warn('webhook_signature_invalid', { shop_id, event_type });
      return { code: 1, msg: 'Invalid signature' };
    }
    
    // Verify timestamp
    if (Math.abs(Date.now() / 1000 - timestamp) > 300) {
      logger.warn('webhook_timestamp_expired', { shop_id, timestamp });
      return { code: 1, msg: 'Timestamp expired' };
    }
    
    // Log webhook
    const webhookLog = await webhookLogRepo.save({
      shop_id,
      event_type,
      payload: data,
      signature_valid: true
    });
    
    // Respond immediately to Shopee
    this.response.status(200).json({ code: 0 });
    
    // Async processing
    await webhookQueue.add({
      webhook_id: webhookLog.id,
      event_type,
      shop_id,
      data
    }, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 1000 }
    });
  }
}

// Async webhook processor
class WebhookProcessor {
  @Process()
  async process(job: Job) {
    const { event_type, shop_id, data } = job.data;
    
    try {
      switch (event_type) {
        case 'order_create':
        case 'order_ship':
          // Sync single order
          const shop = await shopRepository.findOne(shop_id);
          await orderSyncService.fetchAndUpsertOrderDetails(shop, [data.order_sn]);
          break;
        
        case 'payment_release':
          // Create auto-journal for order
          const incomeEntry = await incomeEntryRepo.findOne({
            shop_id,
            order_sn: data.order_sn
          });
          if (incomeEntry && incomeEntry.sync_status !== 'auto_journaled') {
            await paymentSyncService.createAutoJournals(shop);
          }
          break;
      }
      
      // Mark as processed
      await webhookLogRepo.update(job.data.webhook_id, {
        processed: true
      });
      
    } catch (error) {
      // On failure, will retry per job config
      throw error;  // Bull will retry
    }
  }
  
  @OnFailed()
  async onFailed(job: Job, err: Error) {
    logger.error('webhook_processing_failed', {
      webhook_id: job.data.webhook_id,
      attempts: job.attemptsMade,
      error: err.message
    });
    
    if (job.attemptsMade >= job.opts.attempts) {
      // Move to DLQ
      await webhookDLQRepo.save({
        webhook_id: job.data.webhook_id,
        shop_id: job.data.shop_id,
        event_type: job.data.event_type,
        error: err.message
      });
      
      const dlqSize = await webhookDLQRepo.count({ shop_id: job.data.shop_id });
      if (dlqSize > 10) {
        await alertOps(`Webhook DLQ for shop ${job.data.shop_id} has ${dlqSize} items`);
      }
    }
  }
}
```

---

## 4. Cron Job Orchestration

```typescript
// src/scheduler/sync-scheduler.ts

@Injectable()
export class SyncScheduler {
  constructor(
    private orderSyncService: OrderSyncService,
    private paymentSyncService: PaymentSyncService,
    private oauthService: ShopeeOAuthService,
    private healthService: HealthService
  ) {}
  
  @Cron('0 */3 * * *', { timeZone: 'Asia/Jakarta' })  // Every 3h
  async refreshTokens() {
    const shops = await shopRepository.find({ shopee_auth_status: 'authorized' });
    
    for (const shop of shops) {
      try {
        await this.oauthService.refreshTokenIfNeeded(shop);
      } catch (error) {
        logger.warn('token_refresh_error', { shop_id: shop.id });
      }
    }
  }
  
  @Cron('0 6 * * *', { timeZone: 'Asia/Jakarta' })  // 6am
  async syncOrders() {
    const startTime = Date.now();
    try {
      await this.orderSyncService.syncOrdersForAllShops();
      const duration = Date.now() - startTime;
      logger.info('sync_orders_triggered', { duration_ms: duration });
    } catch (error) {
      logger.error('sync_orders_failed', { error: error.message });
      await alertOps('Order sync cron failed');
    }
  }
  
  @Cron('0 8 * * *', { timeZone: 'Asia/Jakarta' })  // 8am
  async syncPayments() {
    const startTime = Date.now();
    try {
      await this.paymentSyncService.syncPaymentsForAllShops();
      const duration = Date.now() - startTime;
      logger.info('sync_payments_triggered', { duration_ms: duration });
    } catch (error) {
      logger.error('sync_payments_failed', { error: error.message });
    }
  }
  
  @Cron('*/10 * * * *', { timeZone: 'Asia/Jakarta' })  // Every 10min
  async monitorQueues() {
    const healthData = await this.healthService.getExtendedHealth();
    
    // Check alert conditions
    if (healthData.email.delivered_rate < 0.9) {
      await alertOps('Email delivery rate <90%');
    }
  }
}
```

---

## 5. Local vs Cross-Border Shop Implementation

### 5.1 Shop Detection

```typescript
class ShopService {
  async detectShopType(shop_id: BIGINT) {
    const token = decrypt(shop.shopee_access_token, DB_ENCRYPTION_KEY);
    
    // Call Shopee API to get shop info
    const response = await shopeeAPI.get('/api/v2/shop/get_shop_info', {
      params: {
        partner_id: PARTNER_ID,
        access_token: token,
        shop_id: shop_id,
        sign: computeHMAC(...)
      }
    });
    
    const shopInfo = response.data;
    shop.is_cross_border = shopInfo.shop_type === 'cross_border';
    shop.shopee_region = shopInfo.region;
    shop.default_currency = shopInfo.currency;
    
    await shopRepository.save(shop);
    return shop;
  }
}
```

### 5.2 GL Mapping Strategy

```typescript
class GLMappingService {
  async createAutoJournalEntry(shop: Shop, incomeEntry: ShopeeIncomeEntry) {
    const coaMapping = await this.getCoAMapping(shop.id);
    
    if (!shop.is_cross_border) {
      // LOCAL SHOP: 2-line entry
      // DR 1110 (Kas di Bank) / CR 4110 (Penjualan)
      return {
        lines: [
          { 
            account_code: coaMapping.find(a => a.name === 'Kas di Bank').code,
            debit: incomeEntry.released_amount,
            credit: 0
          },
          { 
            account_code: coaMapping.find(a => a.name === 'Penjualan Produk').code,
            debit: 0,
            credit: incomeEntry.released_amount
          }
        ]
      };
    } else {
      // CB SHOP: 3-line entry
      // DR 1110 (Bank) / DR 5120 (Komisi) / CR 4110 (Penjualan)
      const order = await orderRepo.findOne({ shop_id: shop.id, order_sn: incomeEntry.order_sn });
      const komisi = order ? (order.buyer_total_amount - incomeEntry.released_amount) : 0;
      
      return {
        lines: [
          { 
            account_code: '1110',
            debit: incomeEntry.released_amount,
            credit: 0
          },
          { 
            account_code: '5120',
            debit: 0,
            credit: komisi
          },
          { 
            account_code: '4110',
            debit: 0,
            credit: incomeEntry.released_amount + komisi
          }
        ]
      };
    }
  }
}
```

---

## 6. Error Handling & Retry Strategy

### 6.1 Shopee API Retry Logic

```typescript
async function callShopeeAPIWithRetry(
  method: 'GET' | 'POST',
  endpoint: string,
  params: any,
  maxRetries: number = 3
) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await shopeeAPI[method.toLowerCase()](endpoint, { params });
    } catch (error) {
      lastError = error;
      
      if (error.code === 'error_auth' || error.code === 'error_partner_key_expired') {
        // Auth failed, don't retry
        throw new AuthError(error.message);
      } else if (error.code === 'error_rate_limit' || error.status === 429) {
        // Rate limit, exponential backoff
        const backoff = Math.pow(2, attempt - 1) * 1000;
        if (attempt < maxRetries) {
          await sleep(backoff);
          continue;
        }
      } else if (error.code === 'error_network' || error.status >= 500) {
        // Transient error, retry
        const backoff = Math.pow(2, attempt - 1) * 1000;
        if (attempt < maxRetries) {
          await sleep(backoff);
          continue;
        }
      }
      
      // Other errors, fail fast
      throw error;
    }
  }
  
  throw lastError;
}
```

### 6.2 Email Retry with Fallback

```typescript
async function sendEmailWithRetry(
  recipient: string,
  subject: string,
  body: string,
  maxRetries: number = 3
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await smtpService.send({ recipient, subject, body });
      
      // Log success
      await emailLogRepo.save({
        recipient_email: recipient,
        email_type: 'settlement_notification',
        status: 'sent',
        sent_at: new Date(),
        smtp_response: result.message_id
      });
      
      return result;
    } catch (error) {
      if (error.code === 'EAUTH') {
        // Auth error, don't retry
        throw error;
      } else if (error.code === 'ECONNREFUSED') {
        // Connection error, retry
        await sleep(Math.pow(2, attempt - 1) * 1000);
        if (attempt < maxRetries) continue;
      }
      
      // Final failure, log and queue for manual retry
      await emailLogRepo.save({
        recipient_email: recipient,
        email_type: 'settlement_notification',
        status: 'failed',
        error: error.message,
        retry_count: attempt
      });
      
      throw error;
    }
  }
}
```

---

## 7. Deployment & Configuration

### 7.1 Environment Variables

```bash
# Shopee OAuth
SHOPEE_PARTNER_ID=1234567890
SHOPEE_PARTNER_KEY=sk_live_xxx...
SHOPEE_REDIRECT_URI=https://api.shop.dntech.id/api/v1/auth/shopee-callback
SHOPEE_ENV=live  # or sandbox

# Database encryption
DB_ENCRYPTION_KEY=<64-char-hex-AES-key>

# Features
TIER_ENFORCE=true
TIER_FREE_LIMIT=100
TIER_STARTER_LIMIT=5000

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@dntech.id
SMTP_PASS=<app-specific-password>

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

### 7.2 PM2 Ecosystem Config

```javascript
module.exports = {
  apps: [
    {
      name: 'dnshop-api',
      script: './dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 6001
      },
      max_memory_restart: '500M'
    }
  ]
};
```

---

## 8. Monitoring & Alerts

### 8.1 Key Metrics to Track

```typescript
// Prometheus metrics exposed at /api/v1/admin/metrics

sync_order_total{shop_id} = 42
sync_payment_total{shop_id} = 15
email_sent_total{type} = 1250
email_bounce_total = 3
journal_entry_total{tier} = 100
webhook_received_total{event_type} = 1250
webhook_failed_total{event_type} = 5
webhook_dlq_size = 3
tier_enforcement_total{action} = 15
```

### 8.2 Alert Conditions

```yaml
alerts:
  - name: EmailDeliveryLow
    condition: email_delivered_rate < 0.90
    duration: 1h
    action: Slack #ops-alerts

  - name: SyncLatencyHigh
    condition: sync_latency_p95_ms > 10000
    duration: 5m
    action: Slack warning

  - name: WebhookFailureRate
    condition: webhook_failed / webhook_received > 0.05
    duration: 1h
    action: Slack #ops-alerts

  - name: RedisDown
    condition: redis_health == down
    action: Page ops, restart Redis

  - name: DLQBacklog
    condition: webhook_dlq_size > 10
    duration: 1h
    action: Slack #ops-alerts
```

---

## 9. Testing Strategy

### 9.1 Unit Tests

```typescript
describe('Auto-Journal GL Mapping', () => {
  it('should create 2-line entry for Local shop', async () => {
    const shop = { is_cross_border: false, id: 1 };
    const income = { released_amount: 1000, order_sn: 'SN001' };
    
    const glEntry = await glMappingService.createAutoJournalEntry(shop, income);
    
    expect(glEntry.lines).toHaveLength(2);
    expect(glEntry.lines[0].account_code).toBe('1110');  // Bank
    expect(glEntry.lines[1].account_code).toBe('4110');  // Penjualan
    expect(glEntry.lines.reduce((s, l) => s + l.debit, 0)).toBe(1000);
    expect(glEntry.lines.reduce((s, l) => s + l.credit, 0)).toBe(1000);
  });
  
  it('should create 3-line entry for CB shop', async () => {
    const shop = { is_cross_border: true, id: 2 };
    const order = { buyer_total_amount: 1000, released_amount: 900 };
    const income = { released_amount: 900, order_sn: 'CB001' };
    
    const glEntry = await glMappingService.createAutoJournalEntry(shop, income);
    
    expect(glEntry.lines).toHaveLength(3);
    expect(glEntry.lines[0].account_code).toBe('1110');  // Bank
    expect(glEntry.lines[1].account_code).toBe('5120');  // Komisi
    expect(glEntry.lines[2].account_code).toBe('4110');  // Penjualan
    expect(glEntry.lines.reduce((s, l) => s + l.debit, 0)).toBe(900);
    expect(glEntry.lines.reduce((s, l) => s + l.credit, 0)).toBe(900);
  });
});
```

### 9.2 Integration Tests

```typescript
describe('Order Sync E2E', () => {
  it('should sync orders and update dashboard', async () => {
    // Mock Shopee API
    mock.onGet(/\/api\/v2\/order\/get_order_list/).reply(200, {
      response: {
        order_list: [{ order_sn: 'SN001' }],
        more: false
      }
    });
    
    const shop = await createTestShop();
    await orderSyncService.syncOrdersForShop(shop);
    
    const orders = await orderRepo.find({ shop_id: shop.id });
    expect(orders).toHaveLength(1);
    expect(orders[0].order_sn).toBe('SN001');
  });
});
```

---

## Glossary

- **SAK EMKM** — Standard accounting for SMEs (45-account template)
- **GL** — General Ledger
- **Komisi** — Marketplace commission deducted by Shopee
- **Escrow** — Funds held by Shopee before release
- **CB** — Cross-Border (international seller)
- **Local Shop** — Single-country seller
- **DLQ** — Dead-Letter Queue (failed jobs)
- **HMAC** — Message authentication code
- **JWT** — JSON Web Token
- **OTP** — One-Time Password

---

**End of SDD v2**

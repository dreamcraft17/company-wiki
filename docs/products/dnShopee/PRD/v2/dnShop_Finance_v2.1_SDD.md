# dnShop Finance v2.1 — System Design Document
## Technical Architecture, API Design, Data Model, Deployment

**Document:** SDD v2.1  
**Date:** 5 Agustus 2026  
**Owner:** Dozer (Tech Lead), DN Tech  
**Baseline:** NestJS 10 + Next.js 15 + PostgreSQL 15 + Supabase  
**Purpose:** Technical design decisions, API contract, schema changes, deployment runbook

---

## 1. Architecture Overview

### 1.1 System components (no major changes from v2.0)

```
┌─────────────────────────────────────────────────────────────────┐
│ Client Layer (Next.js 15, React 19, Tailwind)                  │
│ - Web: http://localhost:6000                                   │
│ - Wizard UI, dashboard, journal, observability                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTPS / TLS 1.3
┌──────────────────────┴──────────────────────────────────────────┐
│ API Gateway (Nginx reverse proxy)                               │
│ - CORS: https://shop.dntech.id only (prod)                     │
│ - Rate limit: 100 req/min per shop                             │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────────┐
│ Backend API (NestJS 10, port 6001)                             │
│ - Modules: auth, shops, journals, webhooks, admin              │
│ - Middleware: ErrorHandler, Logger, TierGuard, CORS            │
│ - External: Shopee OAuth, SMTP, Redis/Bull                     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
    ┌────┴─────┐ ┌────┴────┐ ┌─────┴──────┐
    │ Database  │ │  Redis  │ │ Shopee API │
    │ Postgres  │ │ Queue   │ │ OAuth/Sync │
    │ Supabase  │ │ Bull    │ │ Webhooks   │
    └───────────┘ └─────────┘ └────────────┘

    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ SendGrid │   │ File Log │   │ Metrics  │
    │ SMTP     │   │ /var/log │   │ Exporter │
    └──────────┘   └──────────┘   └──────────┘
```

### 1.2 Key additions v2.1

| Component | v2.0 | v2.1 | Change |
|-----------|------|------|--------|
| Shopee OAuth | Mock hardcoded | Live partner + refresh | New |
| SMTP | Console log | SendGrid/Mailgun | New |
| Redis/Bull | Optional, inline | Activated if REDIS_HOST | New |
| Observability | /health + console | Structured log + metrics | Enhanced |
| Wizard UI | N/A | React component | New |
| Tier enforce | Enum only | API gate + middleware | New |

### 1.3 Deployment topology (PM2 + Nginx)

```
VPS (dntech.id)
├── Nginx (reverse proxy, SSL)
│   ├── shop.dntech.id → localhost:6000 (web)
│   └── api.shop.dntech.id → localhost:6001 (API)
├── PM2 (process manager)
│   ├── dnshop-web (Next.js dev/prod server)
│   ├── dnshop-api (NestJS, with Bull worker threads)
│   └── dnshop-redis (optional, if Redis self-hosted)
└── Log files
    ├── /var/log/dnshop/app.log (combined)
    ├── /var/log/dnshop/error.log (5xx only)
    └── /var/log/dnshop/email-fallback.log (SMTP fallback)
```

---

## 2. Module & Feature Integration

### 2.1 Backend module structure

```
src/
├── auth/
│   ├── auth.service.ts
│   │   - register, login, logout, refresh
│   │   + NEW: shopee OAuth callback, token refresh cron
│   ├── shopee-oauth.service.ts (NEW)
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   └── controller/
│       └── auth.controller.ts (+ new OAuth routes)
│
├── shops/
│   ├── shops.service.ts
│   │   + NEW: tier enforcement logic
│   ├── shop-tier.entity.ts (NEW)
│   ├── shops.controller.ts
│   └── guards/
│       └── tier.guard.ts (NEW, @UseGuards(TierGuard))
│
├── journals/
│   ├── journal.service.ts
│   │   + NEW: onboarding wizard, backfill, tier gate
│   ├── wizard.service.ts (NEW)
│   ├── backfill.service.ts (NEW)
│   └── controller/
│       ├── journals.controller.ts
│       └── wizard.controller.ts (NEW)
│
├── webhooks/
│   ├── shopee-webhook.service.ts (NEW)
│   ├── shopee-webhook.controller.ts (NEW, POST /webhooks/shopee/*)
│   ├── hmac.service.ts (NEW, webhook verify)
│   └── jobs/
│       ├── process-shopee-order.job.ts (NEW)
│       └── process-shopee-payment.job.ts (NEW)
│
├── email/
│   ├── email.service.ts (NEW, sendgrid/mailgun)
│   ├── templates/
│   │   ├── verify-email.template.ts
│   │   ├── reset-password.template.ts
│   │   └── settlement-notification.template.ts
│   └── queue/
│       └── email.queue.ts (NEW, Bull)
│
├── queue/ (NEW)
│   ├── queue.service.ts
│   ├── queues/
│   │   ├── shopee-sync.queue.ts
│   │   ├── email.queue.ts
│   │   ├── journal-backfill.queue.ts
│   │   └── report-generate.queue.ts
│   └── workers/
│       └── queue.worker.ts (Bull processor)
│
├── observability/ (NEW)
│   ├── logger.service.ts (JSON logging)
│   ├── metrics.service.ts (Prometheus)
│   ├── health.service.ts (extended)
│   └── alerts.service.ts (Slack/email)
│
├── admin/ (NEW)
│   ├── admin.service.ts
│   ├── admin.controller.ts
│   ├── endpoints/
│   │   ├── config.controller.ts (Shopee/SMTP setup)
│   │   ├── queues.controller.ts (queue status)
│   │   └── beta.controller.ts (invite, checklist)
│   └── guards/
│       └── admin.guard.ts
│
├── common/
│   ├── decorators/
│   │   ├── @ShopId()
│   │   └── @CurrentUser()
│   ├── filters/
│   │   └── http-exception.filter.ts (error log)
│   ├── interceptors/
│   │   ├── logging.interceptor.ts (request log)
│   │   └── tier-enforcement.interceptor.ts
│   └── guards/
│       ├── jwt.guard.ts
│       ├── tier.guard.ts
│       └── admin.guard.ts
│
└── app.module.ts (integrate all)
```

### 2.2 Frontend module structure

```
app/
├── layout.tsx (root layout, shell)
├── page.tsx (landing / dashboard redirect)
├── dashboard/
│   ├── page.tsx
│   └── components/
│       ├── ChartCard.tsx
│       ├── FilterPeriod.tsx
│       └── OrderList.tsx
│
├── journal/
│   ├── page.tsx
│   ├── wizard/
│   │   ├── page.tsx
│   │   ├── components/
│   │   │   ├── WizardOverlay.tsx
│   │   │   ├── WizardStep1Welcome.tsx
│   │   │   ├── WizardStep2Template.tsx
│   │   │   ├── WizardStep3Config.tsx
│   │   │   ├── WizardStep4AutoJournal.tsx
│   │   │   └── WizardStep5Complete.tsx
│   │   └── hooks/
│   │       ├── useWizardStep.ts
│   │       └── useBackfillProgress.ts
│   ├── list/
│   │   └── page.tsx
│   └── entry/
│       ├── [id]/
│       │   └── page.tsx
│       └── new/
│           └── page.tsx
│
├── settings/
│   ├── page.tsx
│   └── components/
│       ├── ShopeeConnect.tsx (NEW OAuth button)
│       └── TierInfo.tsx (NEW tier badge + upsell)
│
├── beta/
│   ├── checklist/
│   │   └── page.tsx (NEW)
│   └── feedback/
│       └── page.tsx (NEW)
│
├── components/
│   ├── UpsellModal.tsx (NEW tier lock)
│   ├── SettlementNotification.tsx (NEW)
│   └── ...
│
└── hooks/
    ├── useShop.ts
    ├── useTier.ts (NEW)
    └── ...
```

---

## 3. Data Model Changes

### 3.1 New / modified tables

#### 3.1.1 Users (modified)
```sql
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP;
ALTER TABLE users ADD COLUMN verification_token_hash VARCHAR(64); -- SHA256 hash
ALTER TABLE users ADD COLUMN password_reset_token_hash VARCHAR(64);
ALTER TABLE users ADD COLUMN password_reset_at TIMESTAMP;
```

#### 3.1.2 Shops (modified)
```sql
ALTER TABLE shops ADD COLUMN tier VARCHAR(20) DEFAULT 'free';
-- Enum: free, starter, pro, enterprise
ALTER TABLE shops ADD COLUMN tier_since TIMESTAMP DEFAULT now();
ALTER TABLE shops ADD COLUMN shopee_connected BOOLEAN DEFAULT false;
ALTER TABLE shops ADD COLUMN shopee_connected_at TIMESTAMP;
ALTER TABLE shops ADD COLUMN onboarded_at TIMESTAMP; -- wizard complete
```

#### 3.1.3 Shopee tokens (NEW)
```sql
CREATE TABLE shopee_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL UNIQUE REFERENCES shops(id),
  access_token_encrypted TEXT NOT NULL, -- AES-256 encrypted
  refresh_token_encrypted TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  refresh_token_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);
CREATE INDEX idx_shopee_tokens_shop_id ON shopee_tokens(shop_id);
```

#### 3.1.4 Email verification tokens (NEW)
```sql
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA256 hash
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX idx_verification_tokens_expires_at ON email_verification_tokens(expires_at);
```

#### 3.1.5 Shopee webhooks (NEW)
```sql
CREATE TABLE shopee_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_id VARCHAR(255) NOT NULL, -- Shopee unique event ID
  payload JSONB NOT NULL,
  hmac_verified BOOLEAN DEFAULT false,
  processed_at TIMESTAMP,
  job_id UUID, -- Reference to Bull job
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(shop_id, event_id) -- Prevent duplicate processing
);
CREATE INDEX idx_shopee_webhooks_shop_id ON shopee_webhooks(shop_id);
CREATE INDEX idx_shopee_webhooks_event_id ON shopee_webhooks(event_id);
```

#### 3.1.6 Shop config (NEW)
```sql
CREATE TABLE shop_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL UNIQUE REFERENCES shops(id),
  key VARCHAR(100) NOT NULL,
  value TEXT NOT NULL,
  -- Examples:
  -- key: "coA_template", value: "sak_emkm"
  -- key: "closing_period", value: "monthly"
  -- key: "approval_mode", value: "auto"
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(shop_id, key)
);
```

#### 3.1.7 Admin config (NEW)
```sql
CREATE TABLE admin_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  -- Examples:
  -- key: "shopee_partner_id", value: "..."
  -- key: "shopee_secret_key", value: "..." (encrypted)
  -- key: "smtp_provider", value: "sendgrid"
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### 3.1.8 Journal entries (modified)
```sql
ALTER TABLE journal_entries 
ADD COLUMN shopee_sync_id VARCHAR(255) UNIQUE; -- Shopee webhook event ID for idempotency
ALTER TABLE journal_entries 
ADD COLUMN synced_from ENUM('manual', 'shopee_webhook', 'shopee_api', 'backfill');
```

#### 3.1.9 Beta invites (NEW)
```sql
CREATE TABLE beta_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  invite_code VARCHAR(32) NOT NULL UNIQUE,
  status ENUM('pending', 'accepted', 'expired') DEFAULT 'pending',
  invited_by_user_id UUID REFERENCES users(id),
  accepted_by_shop_id UUID REFERENCES shops(id),
  sent_at TIMESTAMP DEFAULT now(),
  accepted_at TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (now() + INTERVAL 7 DAY)
);
CREATE INDEX idx_beta_invites_code ON beta_invites(invite_code);
```

#### 3.1.10 Beta feedback (NEW)
```sql
CREATE TABLE beta_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id),
  what_works_well TEXT,
  what_improve TEXT,
  nps_score INT CHECK (nps_score BETWEEN 1 AND 10),
  created_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);
```

#### 3.1.11 Audit logs (modified/existing)
```sql
-- Extend existing audit_logs table
ALTER TABLE audit_logs ADD COLUMN financial_action BOOLEAN DEFAULT false;
-- Mark entries yang berhubungan finansial (untuk peraturan)
ALTER TABLE audit_logs ADD COLUMN tier_action VARCHAR(50);
-- Track tier changes: "tier_upgraded", "tier_downgraded", etc
```

### 3.2 Database migration strategy
- New tables: run via migration script (`npm run migration:create` → up/down)
- Seed: add admin_configs untuk Shopee partner ID, SMTP settings (env-driven)
- Backup: pre-deployment backup VPS database (weekly automatic)

---

## 4. API Contract Changes

### 4.1 New endpoints (v2.1)

#### Auth & OAuth
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/auth/shopee` | Public | Initiate Shopee OAuth redirect |
| GET | `/auth/shopee/callback` | Public | Shopee callback + token exchange |
| POST | `/auth/verify` | Public | Verify email token |
| GET | `/auth/health` | Public | Health check (extended) |

#### Webhooks
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/webhooks/shopee/orders` | HMAC | Shopee order webhook |
| POST | `/webhooks/shopee/payments` | HMAC | Shopee payment webhook |

#### Pembukuan (Wizard)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/shops/:shopId/journals/apply-template` | JWT | Apply CoA template |
| POST | `/shops/:shopId/journals/backfill-shopee` | JWT | Start backfill job |
| GET | `/wizard/backfill-status` | JWT | Poll backfill progress |

#### Admin endpoints (NEW)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/admin/config/shopee` | Admin | Set Shopee credentials |
| GET | `/admin/config/shopee` | Admin | View Shopee config (masked) |
| POST | `/admin/test-email` | Admin | Test SMTP |
| GET | `/admin/queues/status` | Admin | View queue status |
| POST | `/admin/beta/invites` | Admin | Invite beta seller |
| GET | `/admin/beta/invites` | Admin | List invites |
| GET | `/admin/email-templates` | Admin | View email templates |
| POST | `/admin/email-templates/:id` | Admin | Update template |

#### Beta endpoints (NEW)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/beta/checklist` | JWT | Get UAT checklist |
| PATCH | `/beta/checklist/:task` | JWT | Mark task complete |
| POST | `/beta/feedback` | JWT | Submit feedback |

#### Metrics
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/metrics` | Admin | Prometheus metrics export |

### 4.2 Response contract examples

#### Successful Shopee OAuth callback
```json
{
  "status": 200,
  "data": {
    "user_id": "uuid",
    "shop_id": "uuid",
    "shopee_connected": true,
    "redirect_url": "https://shop.dntech.id/journal?connected=true"
  }
}
```

#### Health check response
```json
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
```

#### Tier gate error (Free user accessing journal)
```json
{
  "status": 403,
  "error": "feature_locked",
  "tier": "free",
  "message": "Pembukuan tersedia di Starter",
  "upsell": {
    "upgrade_url": "/billing/upgrade",
    "features": ["unlimited_entries", "advanced_reports"]
  }
}
```

#### Wizard backfill progress
```json
{
  "job_id": "uuid",
  "status": "in_progress",
  "progress_percent": 45,
  "entries_processed": 18,
  "entries_total": 40,
  "estimated_completion_sec": 120
}
```

---

## 5. Security & Encryption

### 5.1 Secrets management

**Sensitive data:**
- Shopee partner secret key
- SMTP API key
- JWT signing key
- Database password
- Redis password

**Storage:**
- Env vars (`.env` file, not in repo)
- Runtime config in `admin_configs` table (encrypted at rest via Supabase/Postgres native encryption)
- Never log plaintext values

**Rotation:**
- Manual (admin update via ops desk)
- Alert if secret older than 90 days (log)

### 5.2 Token encryption

**In database:**
- Shopee access/refresh token: AES-256-GCM encrypted
- Encryption key: derived from master key (env `SECRET_KEY`)

**Implementation (Node.js):**
```typescript
import crypto from 'crypto';

const encryptToken = (token: string, masterKey: string) => {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(masterKey, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return { iv: iv.toString('hex'), encrypted, authTag: authTag.toString('hex') };
};

const decryptToken = (encrypted: any, masterKey: string) => {
  const key = crypto.scryptSync(masterKey, 'salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(encrypted.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(encrypted.authTag, 'hex'));
  let decrypted = decipher.update(encrypted.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
```

### 5.3 Webhook security
- HMAC-SHA256 verification: Shopee secret key + request body
- Timing-safe compare (prevent timing attack)
- Log unverified requests (security audit)

```typescript
import crypto from 'crypto';

const verifyShopeeHmac = (body: string, signature: string, secretKey: string) => {
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(body);
  const computed = hmac.digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computed));
};
```

### 5.4 Rate limiting & DDoS
- Per-shop rate limit: 100 req/min (via Nginx or middleware)
- Webhook endpoint: 1000 req/min (high threshold, webhook from Shopee)
- Health check: no limit (internal monitoring)

---

## 6. Deployment & Infrastructure

### 6.1 Environment setup

#### Production (.env.production)
```bash
# Database
DATABASE_URL=postgresql://user:pass@db.supabase.co/dnshop
DB_SSL=true

# Redis (if using external)
REDIS_HOST=redis.provider.com
REDIS_PORT=6379
REDIS_PASSWORD=...

# Shopee OAuth
SHOPEE_PARTNER_ID=${admin_config.shopee_partner_id}
SHOPEE_SECRET_KEY=${admin_config.shopee_secret_key}
SHOPEE_CALLBACK_URL=https://api.shop.dntech.id/auth/shopee/callback

# SMTP (if using hardcoded)
SMTP_PROVIDER=sendgrid
SENDGRID_API_KEY=${admin_config.sendgrid_api_key}

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/dnshop/app.log

# Features
SKIP_EMAIL_VERIFICATION=false
ENABLE_JOURNALING=true

# Secrets
JWT_SECRET=... (keep in .env, don't expose)
SECRET_KEY=... (for token encryption)
```

#### Development (.env.development)
```bash
DATABASE_URL=postgresql://localhost/dnshop_dev
REDIS_HOST=localhost
REDIS_PORT=6379

SHOPEE_PARTNER_ID=mock
SHOPEE_SECRET_KEY=mock

SMTP_PROVIDER=console (fallback)

SKIP_EMAIL_VERIFICATION=true
LOG_LEVEL=debug
```

### 6.2 PM2 configuration

**pm2.ecosystem.config.js:**
```javascript
module.exports = {
  apps: [
    {
      name: 'dnshop-api',
      script: './dist/main.js', // NestJS compiled
      cwd: '/app/apps/backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 6001,
      },
      error_file: '/var/log/dnshop/api-error.log',
      out_file: '/var/log/dnshop/api.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '1G',
      watch: false,
    },
    {
      name: 'dnshop-web',
      script: 'npm',
      args: 'run start',
      cwd: '/app/apps/frontend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 6000,
      },
      error_file: '/var/log/dnshop/web-error.log',
      out_file: '/var/log/dnshop/web.log',
      max_memory_restart: '512M',
    },
  ],
};
```

**PM2 commands:**
```bash
pm2 start ecosystem.config.js              # Start all
pm2 stop dnshop-api                        # Stop API
pm2 restart dnshop-api                     # Restart API
pm2 logs dnshop-api                        # View logs
pm2 monit                                  # Monitor resources
pm2 save                                   # Save startup list
```

### 6.3 Nginx configuration

**sites-available/shop.dntech.id:**
```nginx
upstream dnshop_api {
  server localhost:6001;
}

upstream dnshop_web {
  server localhost:6000;
}

server {
  listen 80;
  server_name shop.dntech.id api.shop.dntech.id;
  
  # Redirect HTTP → HTTPS
  location / {
    return 301 https://$server_name$request_uri;
  }
}

server {
  listen 443 ssl http2;
  server_name shop.dntech.id;
  
  ssl_certificate /etc/letsencrypt/live/shop.dntech.id/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/shop.dntech.id/privkey.pem;
  ssl_protocols TLSv1.3 TLSv1.2;
  ssl_ciphers HIGH:!aNULL:!MD5;
  
  # Security headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "DENY" always;
  
  location / {
    proxy_pass http://dnshop_web;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

server {
  listen 443 ssl http2;
  server_name api.shop.dntech.id;
  
  ssl_certificate /etc/letsencrypt/live/shop.dntech.id/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/shop.dntech.id/privkey.pem;
  ssl_protocols TLSv1.3 TLSv1.2;
  
  # Rate limiting
  limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
  limit_req zone=api_limit burst=10 nodelay;
  
  # CORS headers (allow only shop.dntech.id)
  add_header 'Access-Control-Allow-Origin' 'https://shop.dntech.id' always;
  add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
  add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
  
  location / {
    proxy_pass http://dnshop_api;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Timeouts
    proxy_connect_timeout 10s;
    proxy_send_timeout 30s;
    proxy_read_timeout 30s;
  }
}
```

### 6.4 Logging setup

**Log directory structure:**
```
/var/log/dnshop/
├── app.log (combined app + API logs)
├── app-error.log (5xx only)
├── api.log (API per PM2)
├── api-error.log (API error per PM2)
├── web.log (web server per PM2)
├── email-fallback.log (SMTP fallback)
└── access.log (Nginx)
```

**Rotation (logrotate):**
```bash
cat > /etc/logrotate.d/dnshop << EOF
/var/log/dnshop/*.log {
  daily
  rotate 30
  compress
  missingok
  notifempty
  create 0640 www-data www-data
  postrotate
    pm2 reload all > /dev/null 2>&1 || true
  endscript
}
EOF
```

---

## 7. Testing Strategy

### 7.1 Unit tests (NestJS)

**Coverage targets:**
- Shopee OAuth logic: 90%
- HMAC verification: 100%
- Tier enforcement: 95%
- Journal entry validation: 85%

**Test files:**
```
src/__tests__/
├── auth/
│   ├── shopee-oauth.service.spec.ts
│   └── jwt.strategy.spec.ts
├── shops/
│   ├── tier.guard.spec.ts
│   └── shops.service.spec.ts
├── journals/
│   ├── wizard.service.spec.ts
│   ├── backfill.service.spec.ts
│   └── journal.service.spec.ts
├── webhooks/
│   ├── shopee-webhook.service.spec.ts
│   └── hmac.service.spec.ts
└── email/
    └── email.service.spec.ts
```

**Example test (HMAC verification):**
```typescript
describe('HmacService', () => {
  let service: HmacService;
  
  beforeEach(() => {
    service = new HmacService();
  });
  
  it('should verify valid Shopee HMAC', () => {
    const body = JSON.stringify({ order_id: '123' });
    const secret = 'test_secret';
    const expectedHmac = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    
    expect(service.verify(body, expectedHmac, secret)).toBe(true);
  });
  
  it('should reject invalid HMAC', () => {
    const body = JSON.stringify({ order_id: '123' });
    const secret = 'test_secret';
    const invalidHmac = 'invalid';
    
    expect(service.verify(body, invalidHmac, secret)).toBe(false);
  });
});
```

### 7.2 Integration tests

**Test scenarios:**
1. **OAuth flow:** initiate → callback → token store → refresh
2. **Webhook flow:** receive → HMAC verify → async process → journal create
3. **Email flow:** register → send verification → verify token → user enabled
4. **Wizard flow:** start → choose template → apply → backfill → complete
5. **Tier gate:** free user denies journal, Starter enforces limit

**Test database:** PostgreSQL test instance (or SQLite for unit tests)

### 7.3 UAT / Manual testing

**Test environments:**
- **Dev:** localhost:6000 (web), localhost:6001 (API)
  - Shopee: mock
  - Email: console log
  - Redis: optional (inline fallback)
- **Sandbox:** `shop-sandbox.dntech.id`
  - Shopee: sandbox OAuth
  - Email: Mailgun test domain
  - Redis: DigitalOcean test
- **Prod:** `shop.dntech.id`
  - Shopee: live partner
  - Email: SendGrid prod
  - Redis: prod VPS or managed service

**UAT checklist (beta seller):**
- [ ] Email verification email received
- [ ] Shopee OAuth connect successful
- [ ] Auto-journal backfill 30 hari completed
- [ ] Pembukuan wizard UX smooth
- [ ] Dashboard chart render correct
- [ ] Tier upsell modal triggered (if Free)
- [ ] PDF export & download work
- [ ] Sync latency <5 min p95
- [ ] No 5xx errors

### 7.4 Load testing (k6)

**Scenario:** 100 concurrent users, 30 sec duration, Shopee sync spike

```javascript
// load-test.js (k6 script)
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '30s',
};

export default function () {
  let res = http.get('https://api.shop.dntech.id/api/v1/auth/health');
  check(res, {
    'health OK': (r) => r.status === 200,
    'response time <1s': (r) => r.timings.duration < 1000,
  });
  
  res = http.get('https://api.shop.dntech.id/api/v1/shops/shop123/journals');
  check(res, {
    'journal list OK': (r) => r.status === 200,
    'response time <500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}

// Run: k6 run load-test.js
```

**Success criteria:**
- P95 latency <500ms
- Error rate <1%
- No 5xx responses

---

## 8. Migration & Rollout Plan

### 8.1 Pre-deployment checklist
- [ ] All unit tests pass (100% pass rate)
- [ ] Integration tests on sandbox (UAT flow)
- [ ] Load test: 100 concurrent, p95 <500ms
- [ ] Admin config Shopee + SMTP validated
- [ ] Runbook + incident response reviewed
- [ ] Database backup taken
- [ ] Feature flags ready (ENABLE_JOURNALING=true)
- [ ] Log rotation setup verified
- [ ] SSL certificate valid & renewed

### 8.2 Deployment steps

**Phase 1: Code deploy (0 downtime)**
```bash
# 1. On VPS, stop background jobs (preserve queue jobs)
pm2 reload dnshop-api --update-env

# 2. Run migrations (if any new table)
cd /app/apps/backend && npm run migration:run

# 3. Seed data (admin configs, if first time)
npm run seed:admin-config

# 4. Restart API + web with new code
pm2 restart dnshop-api dnshop-web

# 5. Verify health
curl https://api.shop.dntech.id/api/v1/auth/health

# 6. Smoke test (quick sanity check)
./scripts/smoke-test.sh
```

**Phase 2: Ops setup (5–15 min)**
- Admin login → set Shopee partner ID + secret
- Admin login → set SMTP provider (SendGrid API key)
- Test SMTP (send test email)
- Verify Redis connection (if using)

**Phase 3: Soft-launch (10 sellers, 4 weeks)**
- Admin invite 10 sellers via beta invite link
- Monitor: latency, email delivery, sync success rate
- Collect feedback via form
- Fix issues before GA

**Phase 4: GA (public availability)**
- Admin invite broader seller group
- Launch marketing (if applicable)
- Monitor SLA: uptime ≥99.5%, latency p95 <5min

### 8.3 Rollback plan

**If critical issue post-deploy:**
```bash
# 1. Revert code to previous version
git checkout v2.0
cd /app/apps/backend && npm install
npm run build

# 2. Run rollback migration (if needed)
npm run migration:revert

# 3. Restart services
pm2 reload dnshop-api --update-env

# 4. Verify health
curl https://api.shop.dntech.id/api/v1/auth/health

# 5. Notify stakeholders
# - Alert: deployment rolled back
# - Root cause analysis (post-mortem)
```

---

## 9. Runbook & Incident Response

### 9.1 Common issues & fixes

| Issue | Symptom | Fix |
|-------|---------|-----|
| Shopee token expired | 401 on Shopee API call | Cron refresh triggered; user see warning in dashboard, can reconnect |
| Webhook miss → data gap | Order not in dashboard | Hourly reconcile cron fetches from Shopee API |
| SMTP down | Email not sent, fallback log | Monitor SendGrid status; fallback active, no blocking |
| Redis down | Queue jobs queue-ly | Fallback to sync (process immediately); monitor & restart Redis |
| Database connection pool exhausted | Timeout on queries | Scale pool size (TypeORM default 20); check active connections |
| Nginx rate limit hit | 429 Too Many Requests | Adjust limit or implement per-user quota (not v2.1, future) |

### 9.2 Alert escalation

**P0 (Critical — page ops):**
- Database down (5xx on all requests)
- API crash (PM2 restart loop)
- Shopee OAuth fail (>50% fail rate)

**P1 (High — within 1 hour):**
- 5xx error rate >1%
- Webhook fail rate >5%
- Email bounce rate >20%
- Sync latency p95 >10 min

**P2 (Medium — within 4 hours):**
- Feature flag toggle needed
- Non-critical service degraded (Redis, optional)
- Log disk space <10%

**Alerting channels:**
- Critical: Slack #incidents + SMS to Dozer
- High: Slack #incidents
- Medium: Slack #ops

### 9.3 Postmortem template

```markdown
## Incident Postmortem: [Issue name]

**Date:** 2026-08-05
**Duration:** 15 min (14:30–14:45 UTC)
**Impact:** 50 sellers, unable to sync orders

### Timeline
- 14:30 — Alert: 5xx rate 5%
- 14:32 — Dozer investigates, finds Shopee API timeout
- 14:35 — Escalate to ops, restart nginx
- 14:45 — Resolved, health check green

### Root Cause
Shopee API endpoint (`/orders`) rate-limited due to spike (bug in cron sync)

### Action Items
- [ ] Add exponential backoff to Shopee sync cron (fix by next sprint)
- [ ] Set up alerting on Shopee API response latency (owner: devops)
- [ ] Document rate limit handling in runbook
```

---

## 10. Monitoring & Observability

### 10.1 Dashboards & metrics

**Internal ops dashboard (future Grafana):**
- Real-time API latency (p50, p95, p99)
- Error rate (5xx %)
- Queue size & dead-letter count
- Shopee sync latency & success rate
- Email delivery rate & bounce rate
- Tier enforcement gate denials
- Active users & sessions

**Status page (public):**
- API uptime (5 min refresh)
- Last incident log
- Service status: green/yellow/red

### 10.2 Alerting rules (for future Prometheus)

```yaml
groups:
  - name: dnshop
    rules:
      - alert: HighErrorRate
        expr: rate(http_request_duration_seconds_count{status=~"5.."}[5m]) > 0.01
        for: 5m
        annotations:
          summary: "High 5xx error rate on {{ $labels.service }}"
      
      - alert: ShopeeWebhookFailRate
        expr: rate(shopee_webhook_failed_total[5m]) > 0.05
        annotations:
          summary: "Shopee webhook failure rate >5%"
      
      - alert: EmailBounceRate
        expr: rate(email_bounced_total[1h]) / rate(email_delivered_total[1h]) > 0.2
        annotations:
          summary: "Email bounce rate >20%"
```

---

## 11. Deployment Checklist

Before GA sign-off:

- [ ] **Code**
  - [ ] All PR reviewed & merged
  - [ ] Test pass rate ≥95%
  - [ ] No console.log or debug code
  - [ ] Environment variables documented

- [ ] **Infrastructure**
  - [ ] Nginx config valid (test reload)
  - [ ] SSL certificate valid (check expiry)
  - [ ] Log rotation configured
  - [ ] Monitoring alerts active
  - [ ] Backup schedule confirmed

- [ ] **Security**
  - [ ] HTTPS enforced (no HTTP fallback)
  - [ ] CORS whitelist correct
  - [ ] Secrets not in code or logs
  - [ ] Rate limiting active
  - [ ] RBAC tested

- [ ] **Database**
  - [ ] Migration run successfully
  - [ ] Backup taken pre-deploy
  - [ ] DB indexes created
  - [ ] Connection pool configured

- [ ] **Ops**
  - [ ] Runbook written & reviewed
  - [ ] Incident response team briefed
  - [ ] On-call rotation setup
  - [ ] Alert channels configured

- [ ] **Documentation**
  - [ ] API docs updated (OpenAPI / Swagger)
  - [ ] Architecture diagram updated
  - [ ] Deployment steps documented
  - [ ] Rollback procedure tested

---

## 12. Tech Stack Summary (v2.1)

| Layer | Technology | Version | Note |
|-------|-----------|---------|------|
| **Frontend** | Next.js | 15 | React 19, Tailwind CSS |
| **Backend** | NestJS | 10 | TypeORM, JWT auth |
| **Database** | PostgreSQL | 15 | Supabase or native |
| **Cache/Queue** | Redis | 7+ | Bull for async jobs |
| **Email** | SendGrid | API v3 | SMTP fallback console |
| **OAuth** | Shopee Open API | v2 | Partner OAuth + webhook |
| **Logging** | Winston | — | JSON format, file + stdout |
| **Metrics** | prom-client | — | Prometheus export (future) |
| **Server** | Nginx | 1.20+ | Reverse proxy, SSL |
| **Process manager** | PM2 | 5+ | Node process management |

---

## Appendix A: Quick Start (Development)

```bash
# 1. Setup database
npm run db:migrate:dev
npm run db:seed

# 2. Start Backend (dev mode with hot reload)
cd apps/backend
npm run start:dev

# 3. Start Frontend (dev mode)
cd apps/frontend
npm run dev

# 4. Visit
# Frontend: http://localhost:6000
# API: http://localhost:6001/api/v1
# Demo user: seller@dnshop.id / Seller123!

# 5. Test endpoints
curl http://localhost:6001/api/v1/auth/health
```

## Appendix B: Production Deployment Checklist

See section 11 above for full checklist before GA.

---

**Document signed:** Awaiting PRD v2.1 sign-off  
**Next review:** Post-UAT feedback (Week 8)  
**Next update:** SDD v2.2 (accounting depth — separate document)

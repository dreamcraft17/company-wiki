# dnPeople Midtrans Payment Integration (Comprehensive)
## System Design Document (SDD) v2.0

**Bahasa:** Bahasa Indonesia  
**Mata Uang:** IDR (Rp)  
**Tanggal:** 26 Juli 2026  
**Status:** Comprehensive Architecture & Implementation  

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────┐
│              CUSTOMER BROWSER / APP               │
│       (React 19 Frontend, Next.js 16)            │
└────────────┬─────────────────────────────────────┘
             │ HTTPS JWT
             │
    ┌────────▼────────────────────────────────────┐
    │        dnPeople Backend (Express 5)          │
    │     ┌────────────────────────────────────┐  │
    │     │   Payment Service Layer            │  │
    │     │  (15+ payment methods)             │  │
    │     │  (SNAP, Core, Recurring, etc)     │  │
    │     └────────────────────────────────────┘  │
    │                                              │
    │     ┌────────────────────────────────────┐  │
    │     │  Midtrans Client (SDK + HTTP)      │  │
    │     │  • Snap, Core, Recurring           │  │
    │     │  • Refund, Disbursement, Iris     │  │
    │     └────────────────────────────────────┘  │
    │                                              │
    │     ┌────────────────────────────────────┐  │
    │     │  Admin Dashboard Service           │  │
    │     │  • Customer mgmt                   │  │
    │     │  • Subscription mgmt               │  │
    │     │  • Analytics                       │  │
    │     │  • Disbursement tracker            │  │
    │     └────────────────────────────────────┘  │
    │                                              │
    └────────────┬──────────────────────────────┘
                 │ HTTPS API Key
                 │
      ┌──────────▼────────────────────┐
      │  Midtrans API Gateway          │
      │ (app.sandbox / production)     │
      │ - SNAP v1                      │
      │ - Core API v2                  │
      │ - Status/Refund v2             │
      │ - Recurring v2                 │
      │ - Disbursement v1              │
      │ - Iris v1                      │
      └────────────┬────────────────────┘
                   │ Webhook POST
                   │
        Backend /api/v1/webhooks/midtrans
        (payment settlement notifications)

    ┌─────────────────────────────────────┐
    │   PostgreSQL 16 Database            │
    │   (Prisma 6 ORM)                   │
    │                                     │
    │   Tables:                           │
    │   • payment (all transactions)      │
    │   • subscription (recurring)        │
    │   • saved_payment_method (tokens)   │
    │   • payment_refund (refunds)        │
    │   • disbursement (payouts)          │
    │   • payment_audit_log (immutable)   │
    │   • webhook_log (delivery log)      │
    │   • invoice (from dnPeople)         │
    └─────────────────────────────────────┘

    ┌─────────────────────────────────────┐
    │   Redis + Bull Queue                │
    │   (async webhook processing)        │
    └─────────────────────────────────────┘

    ┌─────────────────────────────────────┐
    │   Email Service (SendGrid/SES)      │
    │   (receipt, notifications)          │
    └─────────────────────────────────────┘
```

---

## 2. Service Layer Architecture

### 2.1 PaymentService (Master Service)

**File:** `backend/src/services/PaymentService.ts`

**Responsibilities:**
- Route payment method to appropriate handler
- Snap, Core API, Payment Link dispatch
- Webhook processing
- Status reconciliation
- Refund management

**Methods:**
```typescript
class PaymentService {
  // SNAP Checkout
  async initiateSnap(companyId, amount, method_list): Promise<{snap_token, transaction_id}>
  
  // Core API
  async chargeCard(companyId, amount, card_token, installment?): Promise<{transaction_id, status}>
  async chargeBankTransfer(companyId, amount, bank): Promise<{transaction_id, va_number}>
  async chargeEWallet(companyId, amount, ewallet_type): Promise<{transaction_id, redirect_url}>
  
  // Payment Link
  async createPaymentLink(companyId, amount, ref_id, description): Promise<{url}>
  
  // Subscription
  async initiateRecurring(companyId, amount, card_token): Promise<{subscription_id, transaction_id}>
  async chargeRecurring(subscription_id, amount): Promise<{transaction_id, status}>
  async pauseSubscription(subscription_id, months): Promise<void>
  async resumeSubscription(subscription_id): Promise<void>
  async cancelSubscription(subscription_id): Promise<void>
  
  // Status & Refund
  async getPaymentStatus(transaction_id): Promise<{status, fraud_status, settlement_time}>
  async refund(payment_id, amount, reason, admin_id): Promise<{refund_id, status}>
  
  // Webhook
  async processWebhook(body, signature): Promise<void>
  
  // Account Linking
  async savePaymentMethod(company_id, payment_id, name): Promise<{saved_method_id}>
  async chargeViaToken(company_id, amount, saved_method_id): Promise<{transaction_id, status}>
  
  // Disbursement
  async disburse(company_id, amount, bank_code, account_number, name): Promise<{disbursement_id}>
  async getDisbursementStatus(disbursement_id): Promise<{status, settlement_time}>
}
```

---

### 2.2 SubscriptionService

**File:** `backend/src/services/SubscriptionService.ts`

**Responsibilities:**
- Subscription CRUD
- Auto-charge scheduling
- Pause/resume logic
- Churn prediction

**Methods:**
```typescript
class SubscriptionService {
  async createSubscription(company_id, tier, employee_count, payment_method): Promise<{subscription_id}>
  async getSubscription(subscription_id): Promise<{...}>
  async updateSubscription(subscription_id, updates): Promise<void>
  async pauseSubscription(subscription_id, months): Promise<void>
  async resumeSubscription(subscription_id): Promise<void>
  async cancelSubscription(subscription_id): Promise<void>
  async triggerAutoCharge(subscription_id): Promise<{transaction_id}>
  async syncSubscriptionStatus(subscription_id): Promise<void>
}
```

---

### 2.3 DisbursementService

**File:** `backend/src/services/DisbursementService.ts`

**Responsibilities:**
- Single & batch disbursement
- Payout tracking
- Affiliate commission calculation

**Methods:**
```typescript
class DisbursementService {
  async disburse(company_id, amount, bank, account, name): Promise<{disbursement_id}>
  async batchDisburse(disbursements: []): Promise<{batch_id, results}>
  async getDisbursementStatus(disbursement_id): Promise<{status, settled_at}>
  async calculateAffiliateCommission(referrer_id, period): Promise<{amount, details}>
  async processPayoutQueue(): Promise<void>
}
```

---

### 2.4 AdminService

**File:** `backend/src/services/AdminService.ts`

**Responsibilities:**
- Admin dashboard data aggregation
- Analytics calculation
- Feature flags

**Methods:**
```typescript
class AdminService {
  // Customer Management
  async listCustomers(filters, pagination): Promise<{data, pagination}>
  async getCustomerDetail(company_id): Promise<{...}>
  async impersonateCustomer(company_id): Promise<{impersonate_token}>
  async blockCustomer(company_id, reason): Promise<void>
  
  // Billing Analytics
  async getMRR(month?): Promise<{amount, breakdown_by_tier}>
  async getARR(): Promise<{amount}>
  async getChurnRate(): Promise<{percentage, details}>
  async getRevenueByTier(): Promise<{STARTER, PROF, BIZ, ENT}>
  
  // Payment Analytics
  async getPaymentSuccessRate(): Promise<{rate_percent, by_method}>
  async getAverageSettlementTime(): Promise<{hours, by_method}>
  
  // Feature Adoption
  async getTutorialCompletion(tutorial_id): Promise<{percent, users_completed}>
  async getFeatureAdoption(feature_name): Promise<{active_users, adoption_percent}>
  
  // Feature Flags
  async getFeatureFlags(): Promise<{flags[]}>
  async toggleFeatureFlag(flag_name, enabled, reason): Promise<void>
  async rolloutFeature(flag_name, percentage): Promise<void>
}
```

---

## 3. Payment Method Handlers

### 3.1 SnapHandler

**File:** `backend/src/handlers/SnapHandler.ts`

```typescript
class SnapHandler {
  private snap: Snap;
  
  async createTransaction(payload): Promise<{snap_token, transaction_id}> {
    const response = await this.snap.createTransaction(payload);
    
    // Save to DB
    const payment = await db.payment.create({
      company_id: payload.company_id,
      order_id: payload.order_id,
      transaction_id: response.transaction_id,
      snap_token: response.token,
      payment_status: 'pending',
      enabled_methods: payload.enabled_payments,
      ...
    });
    
    return {snap_token: response.token, transaction_id: response.transaction_id};
  }
}
```

---

### 3.2 CoreAPIHandler (Card, Bank, E-Wallet)

**File:** `backend/src/handlers/CoreAPIHandler.ts`

```typescript
class CoreAPIHandler {
  // CARD CHARGE
  async chargeCard(companyId, amount, cardToken, installment): Promise<{transaction_id, status}> {
    const payload = {
      payment_type: "credit_card",
      order_id: `ORDER-${companyId}-${Date.now()}`,
      gross_amount: amount,
      credit_card: {
        token_id: cardToken,
        authenticated: true,
        ...(installment && {installment: {type: "oflw_installment", term_detail: {month_to_pay: installment, gross_amount: amount}}})
      },
      ...
    };
    
    const response = await snap.charge(payload);
    await db.payment.create({...response, payment_type: 'credit_card'});
    return {transaction_id: response.transaction_id, status: response.transaction_status};
  }
  
  // BANK TRANSFER CHARGE
  async chargeBankTransfer(companyId, amount, bank): Promise<{transaction_id, va_number}> {
    const payload = {
      payment_type: "bank_transfer",
      order_id: `ORDER-${companyId}-${Date.now()}`,
      gross_amount: amount,
      bank_transfer: {bank}
    };
    
    const response = await snap.charge(payload);
    const va = response.va_numbers[0];
    await db.payment.create({...response, payment_method_bank: bank});
    return {transaction_id: response.transaction_id, va_number: va.va_number};
  }
  
  // E-WALLET CHARGE (GoPay, OVO, ShopeePay)
  async chargeEWallet(companyId, amount, walletType): Promise<{transaction_id, redirect_url}> {
    const payload = {
      payment_type: walletType, // "gopay" | "ovo" | "shopeepay"
      order_id: `ORDER-${companyId}-${Date.now()}`,
      gross_amount: amount,
      ...
    };
    
    const response = await snap.charge(payload);
    await db.payment.create({...response, payment_type: walletType});
    return {transaction_id: response.transaction_id, redirect_url: response.redirect_url};
  }
}
```

---

### 3.3 PaymentLinkHandler

**File:** `backend/src/handlers/PaymentLinkHandler.ts`

```typescript
class PaymentLinkHandler {
  async createPaymentLink(companyId, amount, refId, description): Promise<{url}> {
    const payload = {
      reference_id: refId,
      amount: amount,
      description: description,
      expiry_duration: 3600, // 1 hour
      currency: "IDR"
    };
    
    const response = await fetch('https://app.sandbox.midtrans.com/v1/payment_links', {
      method: 'POST',
      headers: {Authorization: `Basic ${btoa(serverKey + ':')}`},
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    // Save to DB
    await db.paymentLink.create({
      company_id: companyId,
      payment_link_id: data.payment_link_id,
      url: data.url,
      reference_id: refId,
      status: 'active',
      expires_at: new Date(Date.now() + 3600000)
    });
    
    return {url: data.url};
  }
}
```

---

## 4. Webhook Processing

### 4.1 Webhook Controller

**File:** `backend/src/controllers/WebhookController.ts`

```typescript
export class WebhookController {
  async handleMidtransWebhook(req: Request, res: Response) {
    try {
      // 1. Verify signature
      const signature = req.headers['x-midtrans-signature'] as string;
      if (!this.verifySignature(req.body, signature)) {
        return res.status(400).json({error: 'Invalid signature'});
      }
      
      // 2. Extract key fields
      const {transaction_id, order_id, transaction_status, fraud_status, gross_amount} = req.body;
      
      // 3. Add to Bull queue (async processing)
      await webhookQueue.add({
        transaction_id,
        order_id,
        transaction_status,
        fraud_status,
        body: req.body
      });
      
      // 4. Immediate 200 OK response (Midtrans requirement)
      return res.status(200).json({status: 'ok'});
      
    } catch (error) {
      console.error('[WebhookController] Error:', error);
      return res.status(500).json({error: 'Internal error'});
    }
  }
  
  private verifySignature(body: any, receivedSignature: string): boolean {
    const {order_id, status_code, gross_amount} = body;
    const serverKey = process.env.MIDTRANS_SERVER_KEY_SANDBOX;
    const data = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const computed = crypto.createHash('sha512').update(data).digest('hex');
    return computed === receivedSignature;
  }
}
```

---

### 4.2 Webhook Job Handler

**File:** `backend/src/jobs/ProcessWebhookJob.ts`

```typescript
webhookQueue.process(async (job) => {
  const {transaction_id, order_id, transaction_status, fraud_status, body} = job.data;
  
  try {
    // 1. Find payment in DB
    const payment = await db.payment.findUnique({where: {transaction_id}});
    if (!payment) {
      console.warn('Payment not found:', transaction_id);
      return; // Skip if not found
    }
    
    // 2. Idempotency check - skip if already processed
    if (payment.payment_status === transaction_status) {
      console.log('Webhook already processed, idempotent skip');
      return;
    }
    
    // 3. Map status
    let newStatus = 'pending';
    if (transaction_status === 'settlement') newStatus = 'settlement';
    else if (transaction_status === 'deny') newStatus = 'deny';
    else if (transaction_status === 'refund') newStatus = 'refund';
    else if (transaction_status === 'partial_refund') newStatus = 'partial_refund';
    
    // 4. Update payment in transaction (SERIALIZABLE)
    await db.$transaction(async (tx) => {
      await tx.payment.update({
        where: {id: payment.id},
        data: {
          payment_status: newStatus,
          fraud_status: fraud_status === 'accept' ? 'accept' : fraud_status === 'deny' ? 'deny' : null,
          settled_at: newStatus === 'settlement' ? new Date(body.settlement_time) : null,
          midtrans_response_full: body
        }
      });
      
      // 5. Create audit log
      await tx.paymentAuditLog.create({
        data: {
          payment_id: payment.id,
          action: newStatus,
          actor_type: 'webhook',
          before_state: {status: payment.payment_status},
          after_state: {status: newStatus}
        }
      });
    });
    
    // 6. Post-processing by status
    if (newStatus === 'settlement') {
      // Mark invoice as paid
      if (payment.invoice_id) {
        await db.invoice.update({
          where: {id: payment.invoice_id},
          data: {status: 'paid', paid_at: new Date()}
        });
      }
      
      // Send receipt email
      await emailService.sendPaymentReceipt(payment);
      
    } else if (newStatus === 'deny') {
      // Send failure notification
      await emailService.sendPaymentFailed(payment);
    }
    
    console.log('Webhook processed:', transaction_id, '→', newStatus);
    
  } catch (error) {
    console.error('[ProcessWebhookJob] Error:', error);
    throw error; // Bull retry
  }
});
```

---

## 5. Database Schema (Prisma)

**File:** `prisma/schema.prisma`

```prisma
model Payment {
  id                    String      @id @default(cuid())
  company_id            String
  order_id              String      @unique
  transaction_id        String      @unique
  snap_token            String?
  
  payment_type          String? // credit_card, bank_transfer, gopay, ovo, qris, etc
  payment_method_bank   String? // bca, mandiri, bni, etc (for VA)
  
  gross_amount          Decimal     @db.Decimal(19, 2)
  settlement_amount     Decimal?    @db.Decimal(19, 2)
  
  payment_status        String      @default("pending") // pending, settlement, deny, refund, partial_refund
  fraud_status          String? // accept, deny
  
  created_at            DateTime    @default(now())
  settled_at            DateTime?
  expires_at            DateTime?
  
  customer_name         String
  customer_email        String
  customer_phone        String?
  
  subscription_id       String?
  invoice_id            String?
  description           String?
  notes                 String?
  
  midtrans_response_full Json?
  
  created_by            String?
  updated_at            DateTime    @updatedAt
  
  @@index([company_id])
  @@index([payment_status])
  @@index([created_at])
  @@index([settled_at])
  @@index([transaction_id])
}

model Subscription {
  id                    String      @id @default(cuid())
  company_id            String
  
  tier                  String // STARTER, PROFESSIONAL, BUSINESS, ENTERPRISE
  employee_count        Int
  
  status                String      @default("active") // active, paused, cancelled
  start_date            DateTime
  next_billing_date     DateTime
  pause_until           DateTime?
  total_paid            Decimal     @db.Decimal(19, 2) @default(0)
  
  payment_method        String? // credit_card, gopay, etc
  saved_token_id        String?
  midtrans_subscription_id String?
  
  created_at            DateTime    @default(now())
  updated_at            DateTime    @updatedAt
  
  @@index([company_id])
  @@index([status])
}

model SavedPaymentMethod {
  id                    String      @id @default(cuid())
  company_id            String
  
  payment_type          String // credit_card, gopay, ovo, etc
  token                 String // Midtrans token_id
  masked_data           Json // {last4, brand, phone, etc}
  payment_method_name   String? // User-given label
  
  is_default            Boolean     @default(false)
  created_at            DateTime    @default(now())
  
  @@index([company_id])
}

model PaymentRefund {
  id                    String      @id @default(cuid())
  payment_id            String
  
  refund_amount         Decimal     @db.Decimal(19, 2)
  refund_status         String      @default("requested") // requested, processed, failed
  
  midtrans_refund_id    String?
  
  initiated_by          String
  reason                String
  
  created_at            DateTime    @default(now())
  processed_at          DateTime?
  
  @@index([payment_id])
  @@index([refund_status])
}

model Disbursement {
  id                    String      @id @default(cuid())
  company_id            String
  
  disbursement_id       String
  amount                Decimal     @db.Decimal(19, 2)
  bank_code             String // 014, 008, 009, etc
  account_number        String
  account_holder_name   String
  
  status                String      @default("pending") // pending, success, failed
  
  created_at            DateTime    @default(now())
  settled_at            DateTime?
  
  @@index([company_id])
  @@index([status])
}

model PaymentAuditLog {
  id                    String      @id @default(cuid())
  payment_id            String
  
  action                String // initiated, settled, deny, refund, etc
  actor_id              String?
  actor_type            String // admin, webhook, system
  
  before_state          Json?
  after_state           Json?
  
  timestamp             DateTime    @default(now())
  
  @@index([payment_id])
  @@index([timestamp])
}

model WebhookLog {
  id                    String      @id @default(cuid())
  
  webhook_type          String // payment, refund, subscription, etc
  payload               Json
  delivered             Boolean
  response_status       Int?
  retries               Int         @default(0)
  last_retry_at         DateTime?
  
  created_at            DateTime    @default(now())
  
  @@index([webhook_type])
  @@index([created_at])
}
```

---

## 6. Security Implementation

### 6.1 Environment Variables

**`.env.sandbox`:**
```bash
# Midtrans Credentials
MIDTRANS_SERVER_KEY_SANDBOX=SB-Mid-server-xxx
MIDTRANS_CLIENT_KEY_SANDBOX=SB-Mid-client-xxx

# API URLs
MIDTRANS_API_BASE_URL=https://app.sandbox.midtrans.com
MIDTRANS_API_STATUS_URL=https://api.sandbox.midtrans.com

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dnpeople_dev

# Email
SENDGRID_API_KEY=SG-xxx
SENDGRID_FROM_EMAIL=noreply@dnpeople.id

# Redis
REDIS_URL=redis://localhost:6379

# Environment
NODE_ENV=development
```

### 6.2 PII Masking

**`backend/src/utils/LogUtils.ts`:**
```typescript
export function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  return name.substring(0, 3) + '***@' + domain;
}

export function maskPhone(phone: string): string {
  return phone.substring(0, 3) + '****' + phone.substring(phone.length - 2);
}

export function maskCardNumber(card: string): string {
  return card.substring(0, 4) + '****' + card.substring(card.length - 4);
}

// Usage in logging
console.log('[Payment]', {
  customer_email: maskEmail(payment.customer_email),
  customer_phone: maskPhone(payment.customer_phone),
  card_number: maskCardNumber(card)
});
```

### 6.3 Webhook Signature Verification

**Already implemented in section 4.1**

---

## 7. Testing Strategy

### 7.1 Unit Tests

```typescript
// backend/src/services/__tests__/PaymentService.test.ts
describe('PaymentService', () => {
  describe('initiateSnap', () => {
    it('should generate snap_token', async () => {
      const result = await paymentService.initiateSnap('company-1', 600000, ['credit_card', 'bank_transfer']);
      expect(result.snap_token).toBeDefined();
      expect(result.transaction_id).toBeDefined();
    });
    
    it('should throw if amount <= 0', async () => {
      await expect(paymentService.initiateSnap('company-1', 0, [])).rejects.toThrow();
    });
  });
  
  describe('chargeCard', () => {
    it('should charge card successfully', async () => {
      const result = await paymentService.chargeCard('company-1', 600000, 'token-xxx');
      expect(result.transaction_id).toBeDefined();
      expect(result.status).toBe('capture');
    });
  });
  
  describe('processWebhook', () => {
    it('should update payment status on webhook', async () => {
      // Create payment in DB
      // Call processWebhook with settlement status
      // Assert: payment status updated
    });
    
    it('should be idempotent - duplicate webhook returns early', async () => {
      // Call processWebhook twice
      // Assert: only one audit log entry
    });
    
    it('should verify signature', async () => {
      const invalidSignature = 'fake-sig';
      await expect(paymentService.processWebhook({...}, invalidSignature)).rejects.toThrow();
    });
  });
});
```

### 7.2 Integration Tests

**Sandbox simulator test flows:**
1. SNAP checkout → all 15 payment methods
2. Core API → Card + Bank + E-Wallet
3. Payment Link → Generate + share + pay
4. Subscription → First charge + recurring + pause/resume/cancel
5. Webhook → Settlement + refund + all status transitions
6. Account Linking → Save token + one-click charge
7. Disbursement → Single payout + batch payout
8. Admin Dashboard → All modules functional

---

## 8. Deployment Checklist

### Pre-Production (Sandbox)
- [ ] All 15 payment methods tested with sandbox simulators
- [ ] SNAP + Core API + Payment Link working
- [ ] Webhook signature verification passed security review
- [ ] Refund, subscription pause/resume, account linking tested
- [ ] Admin dashboard fully functional (15 modules)
- [ ] No critical security findings
- [ ] Performance baseline met
- [ ] Documentation complete
- [ ] Load testing passed (100 concurrent transactions)
- [ ] Incident response plan documented

### Production Migration
- [ ] Midtrans production account activated
- [ ] Production API keys configured
- [ ] Webhook endpoint updated to production domain
- [ ] Email service (SendGrid/SES) production credentials
- [ ] Database backup strategy confirmed
- [ ] Monitoring + alerting setup (Datadog)
- [ ] On-call rotation established
- [ ] Customer communication plan

---

## 9. Monitoring & Logging

### Metrics
```
- Payment success rate (%) by method
- Payment initiation latency (ms)
- Webhook delivery latency (ms)
- Failed webhook count
- Refund success rate (%)
- Average settlement time (hours)
- Subscription churn rate (%)
- Disbursement success rate (%)
```

### Alerts
```
- Payment success rate < 95% → Page on-call
- Webhook latency > 2s → Alert
- Failed webhooks > 10 in 1h → Alert
- Midtrans API down → Auto-escalate
- Database replication lag > 5s → Alert
```

---

## 10. Runbook (Operations)

### Incident: Midtrans API Down
1. Alert triggered (Midtrans status check failed)
2. On-call checks Midtrans status page
3. Notify customers via in-app banner: "Payments temporarily unavailable"
4. Manual payment instructions provided (bank transfer details)
5. Reconcile when service restored
6. Post-incident review

### Incident: Webhook Delivery Failing
1. Alert triggered (failed webhooks > 10)
2. On-call checks:
   - Webhook endpoint accessible?
   - Database connection OK?
   - Bull queue running?
3. Check Midtrans webhook history
4. Manually replay failed webhooks
5. Fix root cause

---

**Version:** 2.0 (Comprehensive)  
**Last Updated:** 26 Juli 2026  
**Target:** Sandbox Aug 31 QA, Production Oct 1 Launch

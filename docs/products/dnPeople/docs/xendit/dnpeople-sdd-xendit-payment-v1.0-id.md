# dnPeople Xendit Payment Integration
## System Design Document (SDD) v1.0

**Bahasa:** Bahasa Indonesia  
**Tanggal:** 8 Agustus 2026  
**Status:** Implemented in repo (Aug 2026) — align with actual paths below  

> **File paths aktual:** `backend/src/lib/xendit.ts`, `backend/src/services/payment.service.ts`, `backend/src/routes/payments.ts`  
> **Setup:** [XENDIT-PAYMENT-SETUP.md](./XENDIT-PAYMENT-SETUP.md)

---

## 1. ARCHITECTURE OVERVIEW

```
┌──────────────────────────────────────────────┐
│   Frontend (React 19)                        │
│   ├─ Payment Request Redirect                │
│   ├─ Payment Session (iframe embed)          │
│   ├─ Admin Dashboard                         │
│   └─ Subscription Management UI              │
└─────────────┬──────────────────────────────┘
              │ HTTPS JWT
              │
┌─────────────▼──────────────────────────────┐
│   Backend (Express 5)                       │
│   ├─ PaymentService (Xendit API calls)      │
│   ├─ SubscriptionService (recurring)        │
│   ├─ RefundService (manual/auto)            │
│   ├─ WebhookService (Xendit notifications)  │
│   ├─ PayoutService (disbursement)           │
│   └─ ReportService (admin analytics)        │
└─────────────┬──────────────────────────────┘
              │
      ┌───────┼───────────┐
      │       │           │
      ▼       ▼           ▼
   ┌────┐ ┌─────┐ ┌──────────┐
   │ DB │ │Redis│ │  Xendit  │
   └────┘ └─────┘ │  API GW  │
                  └──────────┘
                  ↑
            [Webhook POST]
                  │
         /api/v1/webhooks/xendit
```

---

## 2. SERVICE LAYER DESIGN

### 2.1 PaymentService

**File:** `backend/src/services/PaymentService.ts`

```typescript
class PaymentService {
  private xenditClient: XenditClient;
  private db: PrismaClient;
  
  // Payment Request (hosted checkout)
  async createPaymentRequest(companyId, amount, tier, employeeCount): Promise<{
    payment_request_id,
    hosted_url,
    expires_at
  }> {
    const request = {
      reference_id: `ORDER-${companyId}-${Date.now()}`,
      amount: amount,
      currency: "IDR",
      description: `${tier} subscription - ${employeeCount} emp`,
      customer: await this.getCustomerDetails(companyId),
      items: this.buildItemList(tier, employeeCount),
      success_redirect_url: "https://dnpeople.id/dashboard?status=success",
      failure_redirect_url: "https://dnpeople.id/dashboard?status=failed",
      metadata: {company_id: companyId, tier: tier}
    };
    
    const response = await this.xenditClient.createPaymentRequest(request);
    
    // Save to DB
    await db.payment.create({
      company_id: companyId,
      order_id: request.reference_id,
      payment_request_id: response.id,
      payment_status: "pending",
      gross_amount: amount,
      xendit_response_full: response
    });
    
    return {
      payment_request_id: response.id,
      hosted_url: response.actions[0].url,
      expires_at: response.expires_at
    };
  }
  
  // Direct charge API (custom UI)
  async chargeCard(companyId, amount, tokenId, cvv?): Promise<{transaction_id, status}> {
    const request = {
      reference_id: `CHARGE-${companyId}-${Date.now()}`,
      currency: "IDR",
      amount: amount,
      payment_method: "CARD",
      card_data: {
        token_id: tokenId,
        ...(cvv && {cvv: cvv})
      },
      metadata: {company_id: companyId}
    };
    
    const response = await this.xenditClient.createCharge(request);
    await this.savePayment(companyId, response);
    
    return {transaction_id: response.id, status: response.status};
  }
  
  async chargeBankTransfer(companyId, amount, bankCode): Promise<{transaction_id, va_number}> {
    const request = {
      reference_id: `BT-${companyId}-${Date.now()}`,
      currency: "IDR",
      amount: amount,
      payment_method: "BANK_TRANSFER",
      bank_transfer_data: {
        bank_code: bankCode
      }
    };
    
    const response = await this.xenditClient.createCharge(request);
    await this.savePayment(companyId, response);
    
    return {
      transaction_id: response.id,
      va_number: response.bank_transfer_data.virtual_account_number
    };
  }
  
  async chargeEWallet(companyId, amount, channelCode): Promise<{transaction_id, redirect_url}> {
    const request = {
      reference_id: `EW-${companyId}-${Date.now()}`,
      currency: "IDR",
      amount: amount,
      payment_method: "EWALLET",
      ewallet_data: {
        channel_code: channelCode
      }
    };
    
    const response = await this.xenditClient.createCharge(request);
    await this.savePayment(companyId, response);
    
    return {
      transaction_id: response.id,
      redirect_url: response.actions[0].url
    };
  }
  
  async getPaymentStatus(paymentId): Promise<{status, fraud_status, settlement_time}> {
    const response = await this.xenditClient.getCharge(paymentId);
    return {
      status: response.status,
      fraud_status: response.fraud_status,
      settlement_time: response.updated_at
    };
  }
  
  async refund(paymentId, amount, reason): Promise<{refund_id, status}> {
    const response = await this.xenditClient.refund(paymentId, {
      amount: amount,
      reason: reason,
      reference_id: `REFUND-${Date.now()}`
    });
    
    await db.paymentRefund.create({
      payment_id: paymentId,
      refund_amount: amount,
      refund_status: response.status,
      reason: reason,
      midtrans_refund_id: response.id
    });
    
    return {refund_id: response.id, status: response.status};
  }
  
  private async savePayment(companyId, xenditResponse) {
    await db.payment.create({
      company_id: companyId,
      order_id: xenditResponse.reference_id,
      transaction_id: xenditResponse.id,
      payment_status: xenditResponse.status,
      gross_amount: xenditResponse.amount,
      fraud_status: xenditResponse.fraud_status,
      payment_method: xenditResponse.payment_method,
      xendit_response_full: xenditResponse
    });
  }
}
```

---

### 2.2 SubscriptionService

```typescript
class SubscriptionService {
  async createSubscription(companyId, tier, employeeCount, paymentMethodId): Promise<{subscription_id}> {
    const plan = this.getSubscriptionPlan(tier, employeeCount);
    
    const response = await this.xenditClient.createRecurringPayment({
      reference_id: `SUB-${companyId}-${Date.now()}`,
      customer_id: companyId,
      amount: plan.amount,
      interval: "MONTH",
      interval_count: 1,
      total_recurrence: 12,
      payment_method_id: paymentMethodId,
      description: `${tier} subscription`,
      metadata: {company_id: companyId, tier: tier, employee_count: employeeCount}
    });
    
    await db.subscription.create({
      company_id: companyId,
      tier: tier,
      employee_count: employeeCount,
      subscription_plan_id: response.id,
      status: "active",
      amount: plan.amount,
      next_billing_date: new Date(response.next_execute_date)
    });
    
    return {subscription_id: response.id};
  }
  
  async pauseSubscription(subscriptionId, months): Promise<void> {
    const pauseUntil = new Date();
    pauseUntil.setMonth(pauseUntil.getMonth() + months);
    
    await this.xenditClient.pauseRecurringPayment(subscriptionId, {
      pause_at: pauseUntil
    });
    
    await db.subscription.update({
      where: {subscription_plan_id: subscriptionId},
      data: {status: "paused", pause_until: pauseUntil}
    });
  }
  
  async resumeSubscription(subscriptionId): Promise<void> {
    const resumeDate = new Date();
    resumeDate.setDate(1);  // Resume on 1st of next month
    
    await this.xenditClient.resumeRecurringPayment(subscriptionId, {
      resume_at: resumeDate
    });
    
    await db.subscription.update({
      where: {subscription_plan_id: subscriptionId},
      data: {status: "active", pause_until: null}
    });
  }
  
  async cancelSubscription(subscriptionId): Promise<void> {
    await this.xenditClient.stopRecurringPayment(subscriptionId);
    
    await db.subscription.update({
      where: {subscription_plan_id: subscriptionId},
      data: {status: "stopped"}
    });
  }
  
  private getSubscriptionPlan(tier, employeeCount) {
    const prices = {
      STARTER: 20000,
      PROFESSIONAL: 25000,
      BUSINESS: 20000,
      ENTERPRISE: 15000
    };
    const pricePerEmployee = prices[tier] || 20000;
    return {
      amount: pricePerEmployee * employeeCount,
      tier: tier
    };
  }
}
```

---

### 2.3 WebhookService

```typescript
class WebhookService {
  async processWebhook(body, signature): Promise<void> {
    // 1. Verify signature
    if (!this.verifySignature(body, signature)) {
      throw new Error("Invalid webhook signature");
    }
    
    // 2. Extract event details
    const {event, data} = body;
    
    // 3. Route to handler
    switch (event) {
      case "payment.succeeded":
        await this.handlePaymentSucceeded(data);
        break;
      case "payment.failed":
        await this.handlePaymentFailed(data);
        break;
      case "refund.succeeded":
        await this.handleRefundSucceeded(data);
        break;
      case "subscription.cycle_succeeded":
        await this.handleSubscriptionChargeSucceeded(data);
        break;
      case "subscription.cycle_failed":
        await this.handleSubscriptionChargeFailed(data);
        break;
      default:
        console.log(`[Webhook] Unknown event: ${event}`);
    }
  }
  
  private async handlePaymentSucceeded(data) {
    // Idempotency check
    const existing = await db.payment.findUnique({
      where: {transaction_id: data.id}
    });
    if (existing?.payment_status === "completed") {
      console.log("[Webhook] Idempotent - payment already processed");
      return;
    }
    
    // Update payment status
    await db.payment.update({
      where: {transaction_id: data.id},
      data: {
        payment_status: "settlement",
        settled_at: new Date(data.updated_at),
        xendit_response_full: data
      }
    });
    
    // Mark invoice as paid (if exists)
    const payment = await db.payment.findUnique({where: {transaction_id: data.id}});
    if (payment.invoice_id) {
      await db.invoice.update({
        where: {id: payment.invoice_id},
        data: {status: "paid", paid_at: new Date()}
      });
    }
    
    // Send receipt email
    await this.emailService.sendPaymentReceipt(payment);
  }
  
  private async handleSubscriptionChargeSucceeded(data) {
    // Update subscription cycle
    await db.subscription.update({
      where: {subscription_plan_id: data.subscription_id},
      data: {
        next_billing_date: new Date(data.data.next_execute_date)
      }
    });
    
    await this.emailService.sendSubscriptionReceiptEmail(data);
  }
  
  private verifySignature(body, receivedToken) {
    const data = JSON.stringify(body);
    const computed = crypto
      .createHmac('sha256', process.env.XENDIT_WEBHOOK_TOKEN)
      .update(data)
      .digest('hex');
    return computed === receivedToken;
  }
}
```

---

## 3. DATABASE SCHEMA (Prisma)

```prisma
model Payment {
  id                    String      @id @default(cuid())
  company_id            String
  order_id              String      @unique
  transaction_id        String      @unique
  payment_request_id    String?
  
  gross_amount          Decimal     @db.Decimal(19, 2)
  settlement_amount     Decimal?    @db.Decimal(19, 2)
  
  payment_status        String      @default("pending")
  fraud_status          String?
  payment_method        String?
  payment_channel       String?     // VISA, BCA, ID_GOPAY, etc
  
  created_at            DateTime    @default(now())
  settled_at            DateTime?
  expires_at            DateTime?
  
  customer_name         String
  customer_email        String
  
  subscription_id       String?
  invoice_id            String?
  
  xendit_response_full  Json?
  
  @@index([company_id])
  @@index([payment_status])
  @@index([created_at])
}

model Subscription {
  id                    String      @id @default(cuid())
  company_id            String
  subscription_plan_id  String      @unique  // Xendit recurring ID
  
  tier                  String      // STARTER, PROFESSIONAL, BUSINESS
  employee_count        Int
  amount                Decimal     @db.Decimal(19, 2)
  
  status                String      @default("active")  // active, paused, stopped
  start_date            DateTime
  next_billing_date     DateTime
  pause_until           DateTime?
  
  payment_method_id     String?
  
  created_at            DateTime    @default(now())
  updated_at            DateTime    @updatedAt
  
  @@index([company_id])
  @@index([status])
}

model PaymentToken {
  id                    String      @id @default(cuid())
  company_id            String
  token_id              String      // Xendit payment method ID
  payment_type          String      // CARD, EWALLET, etc
  masked_data           Json        // {last4, brand, phone}
  payment_method_name   String?
  is_default            Boolean     @default(false)
  is_active             Boolean     @default(true)
  created_at            DateTime    @default(now())
  
  @@index([company_id])
}

model PaymentRefund {
  id                    String      @id @default(cuid())
  payment_id            String
  refund_amount         Decimal     @db.Decimal(19, 2)
  refund_status         String
  xendit_refund_id      String
  initiated_by          String
  reason                String
  created_at            DateTime    @default(now())
  processed_at          DateTime?
  
  @@index([payment_id])
}

model Payout {
  id                    String      @id @default(cuid())
  company_id            String
  payout_id             String
  amount                Decimal     @db.Decimal(19, 2)
  bank_code             String
  account_number        String
  account_holder_name   String
  status                String
  created_at            DateTime    @default(now())
  settled_at            DateTime?
  
  @@index([company_id])
}

model WebhookLog {
  id                    String      @id @default(cuid())
  event_type            String
  payload               Json
  delivered             Boolean
  response_status       Int?
  retries               Int         @default(0)
  last_retry_at         DateTime?
  created_at            DateTime    @default(now())
  
  @@index([event_type])
  @@index([created_at])
}
```

---

## 4. CONTROLLERS & ROUTES

### PaymentController

```typescript
export class PaymentController {
  async createPaymentRequest(req: Request, res: Response) {
    const {tier, employee_count} = req.body;
    const company_id = req.user.company_id;
    
    const plan = this.getSubscriptionPlan(tier, employee_count);
    const result = await paymentService.createPaymentRequest(
      company_id, plan.amount, tier, employee_count
    );
    
    return res.status(201).json(result);
  }
  
  async processWebhook(req: Request, res: Response) {
    const signature = req.headers['x-xendit-callback-token'];
    
    try {
      await webhookService.processWebhook(req.body, signature);
      return res.status(200).json({status: 'ok'});
    } catch (error) {
      console.error('[Webhook Error]', error);
      return res.status(400).json({error: error.message});
    }
  }
  
  async getPaymentStatus(req: Request, res: Response) {
    const {payment_id} = req.params;
    const status = await paymentService.getPaymentStatus(payment_id);
    return res.status(200).json(status);
  }
  
  async refund(req: Request, res: Response) {
    const {payment_id} = req.params;
    const {amount, reason} = req.body;
    const admin_id = req.user.id;
    
    const result = await paymentService.refund(payment_id, amount, reason);
    
    // Log to audit
    await auditService.logAction('refund', admin_id, 'payment', payment_id, ...);
    
    return res.status(201).json(result);
  }
}
```

---

## 5. CRON JOBS (Bull Queue)

```typescript
// Check subscription deadlines, auto-charge, etc
subscriptionQueue.add('process-subscriptions', null, {
  repeat: {cron: '0 10 1 * *'}  // 1st of month at 10 AM
});

subscriptionQueue.process('process-subscriptions', async (job) => {
  const subscriptions = await db.subscription.findMany({
    where: {status: 'active', next_billing_date: {lte: new Date()}}
  });
  
  for (const sub of subscriptions) {
    try {
      // Force charge via Xendit
      await subscriptionService.forceCharge(sub.subscription_plan_id);
    } catch (error) {
      console.error('[Cron] Subscription charge failed:', error);
      // Xendit handles retry automatically
    }
  }
});
```

---

## 6. FRONTEND COMPONENTS

### Payment Request Redirect

```typescript
export function PaymentRequestButton({tier, employeeCount}) {
  const [loading, setLoading] = useState(false);
  
  const handleCheckout = async () => {
    setLoading(true);
    
    const response = await fetch('/api/v1/payments/request', {
      method: 'POST',
      body: JSON.stringify({tier, employee_count: employeeCount}),
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    // Redirect to Xendit hosted checkout
    window.location.href = data.hosted_url;
  };
  
  return (
    <Button onClick={handleCheckout} disabled={loading}>
      {loading ? 'Loading...' : 'Proceed to Checkout'}
    </Button>
  );
}
```

---

## 7. DEPLOYMENT CHECKLIST

- [ ] Xendit sandbox account setup
- [ ] API keys configured (.env)
- [ ] Database migrations (Prisma)
- [ ] Webhook URL registered in Xendit Dashboard
- [ ] All endpoints tested (Postman collection)
- [ ] Webhook signature verification tested
- [ ] All 10+ payment methods tested
- [ ] Subscription monthly charge tested
- [ ] Refund flow tested
- [ ] Admin dashboard deployed
- [ ] Monitoring & alerts set up
- [ ] Incident response plan documented

---

## 8. TESTING STRATEGY

```typescript
describe('PaymentService', () => {
  it('should create payment request', async () => {
    const result = await paymentService.createPaymentRequest('company-1', 600000);
    expect(result.payment_request_id).toBeDefined();
    expect(result.hosted_url).toContain('checkout.xendit.co');
  });
  
  it('should charge card', async () => {
    const result = await paymentService.chargeCard('company-1', 600000, 'token-xxx');
    expect(result.transaction_id).toBeDefined();
  });
  
  it('should process webhook idempotently', async () => {
    const webhook = {...webhookPayload};
    
    await webhookService.processWebhook(webhook, signature);
    await webhookService.processWebhook(webhook, signature);  // Same webhook
    
    const payments = await db.payment.findMany({
      where: {transaction_id: webhook.data.id}
    });
    
    expect(payments.length).toBe(1);  // Only 1, not 2
  });
});
```

---

**Version:** 1.0 (Complete)  
**Last Updated:** 8 Agustus 2026


# dnPeople Midtrans Payment Integration (Sandbox)
## System Design Document (SDD) v1.0

**Bahasa:** Bahasa Indonesia  
**Mata Uang:** IDR (Rp)  
**Tanggal:** 26 Juli 2026  
**Status:** Sandbox Testing Phase  

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CUSTOMER BROWSER                          │
│  (React 19 Frontend, Next.js 16)                                │
└─────────────┬───────────────────────────────────────────────────┘
              │ HTTPS
              │ (JWT Auth)
              │
    ┌─────────▼──────────────────────────────────────────────────┐
    │                    dnPeople Backend                         │
    │  (Express 5, Node.js, TypeScript)                          │
    │                                                             │
    │  ┌──────────────────────────────────────────────────┐     │
    │  │ Payment Service Layer                             │     │
    │  │  • initiate-payment()                             │     │
    │  │  • process-webhook()                              │     │
    │  │  • refund()                                       │     │
    │  │  • get-payment-status()                           │     │
    │  └──────────────────────────────────────────────────┘     │
    │                      │                                     │
    │  ┌──────────────────▼──────────────────────────────┐     │
    │  │ Midtrans Client (npm: midtrans-client)         │     │
    │  │  • new Snap({serverKey, clientKey})            │     │
    │  │  • snap.createTransaction()                     │     │
    │  │  • snap.transaction.status()                    │     │
    │  │  • snap.transaction.refund()                    │     │
    │  └──────────────────────────────────────────────────┘     │
    │                      │                                     │
    └──────────────────────┼─────────────────────────────────────┘
                           │ HTTPS
                           │ (API Key Auth via Header)
                           │
            ┌──────────────▼───────────────────┐
            │   Midtrans Sandbox API            │
            │  (SNAP + Status + Refund)        │
            │  https://app.sandbox.midtrans.com│
            │  https://api.sandbox.midtrans.com│
            └──────────────┬────────────────────┘
                           │
                      Webhook (HTTP POST)
                           │
                           └──→ /api/v1/webhooks/midtrans
                               (our backend receive payment status)

    ┌─────────────────────────────────────────────────────────┐
    │           PostgreSQL 16 Database                        │
    │  (Prisma 6 ORM)                                         │
    │                                                         │
    │  Tables:                                                │
    │   • payment (transaction log)                           │
    │   • payment_refund (refund records)                     │
    │   • payment_audit_log (immutable audit trail)           │
    └─────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────┐
    │           Email Service (SendGrid/SES)                  │
    │  (Payment receipt, refund notification)                │
    └─────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────┐
    │           Bull Queue (Redis-backed)                     │
    │  (Future: async webhook processing)                    │
    └─────────────────────────────────────────────────────────┘
```

---

## 2. Component Design

### 2.1 Frontend Component: SNAP Checkout

**File:** `frontend/src/components/Payment/SnapCheckout.tsx`

```typescript
import { FC, useEffect, useState } from 'react';

interface SnapCheckoutProps {
  snapToken: string;
  orderId: string;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  onPending?: (result: any) => void;
}

export const SnapCheckout: FC<SnapCheckoutProps> = ({
  snapToken,
  orderId,
  onSuccess,
  onError,
  onPending,
}) => {
  useEffect(() => {
    // 1. Load Midtrans SNAP script dari CDN
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_SANDBOX);
    document.head.appendChild(script);

    // 2. Cleanup on unmount
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    // 3. Trigger SNAP popup setelah script loaded & snapToken ready
    if (snapToken && window.snap) {
      window.snap.pay(snapToken, {
        onSuccess: (result) => {
          console.log('Payment Success:', result);
          onSuccess?.(result);
        },
        onPending: (result) => {
          console.log('Payment Pending:', result);
          onPending?.(result);
        },
        onError: (error) => {
          console.error('Payment Error:', error);
          onError?.(error);
        },
        onClose: () => {
          console.log('Customer close SNAP dialog');
        },
      });
    }
  }, [snapToken, onSuccess, onError, onPending]);

  return <div id="snap-container" />;
};
```

**Usage in Page:**
```typescript
// pages/payment/[orderId].tsx
import { SnapCheckout } from '@/components/Payment/SnapCheckout';

export default function PaymentPage() {
  const { orderId } = useRouter().query;
  const [snapToken, setSnapToken] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch snap_token from backend
    fetch(`/api/v1/payments/${orderId}`)
      .then(r => r.json())
      .then(data => {
        setSnapToken(data.snap_token);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch snap token:', err);
        setLoading(false);
      });
  }, [orderId]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1>Pembayaran Invoice #{orderId}</h1>
      <SnapCheckout
        snapToken={snapToken}
        orderId={orderId}
        onSuccess={(result) => {
          // Redirect to success page
          router.push(`/payment/success?order_id=${orderId}`);
        }}
        onError={(error) => {
          // Show error message
          alert(`Pembayaran gagal: ${error.message}`);
        }}
      />
    </div>
  );
}
```

---

### 2.2 Backend Service: PaymentService

**File:** `backend/src/services/PaymentService.ts`

```typescript
import Snap from 'midtrans-client';
import { Prisma } from '@prisma/client';
import crypto from 'crypto';

export class PaymentService {
  private snap: Snap.Snap;
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    this.snap = new Snap.Snap({
      isProduction: false, // Sandbox mode
      serverKey: process.env.MIDTRANS_SERVER_KEY_SANDBOX,
      clientKey: process.env.MIDTRANS_CLIENT_KEY_SANDBOX,
    });
  }

  /**
   * FR1: Initiate Payment - Generate snap_token
   */
  async initiatePayment(
    companyId: string,
    grossAmount: number,
    invoiceId?: string,
    subscriptionId?: string,
  ): Promise<{ snap_token: string; transaction_id: string; payment_id: string }> {
    try {
      // 1. Generate unique order_id
      const orderId = `ORDER-${companyId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // 2. Fetch customer & company info
      const company = await this.prisma.company.findUnique({
        where: { id: companyId },
      });
      if (!company) throw new Error(`Company ${companyId} not found`);

      // 3. Fetch admin user for email
      const admin = await this.prisma.user.findFirst({
        where: { company_id: companyId, role: 'COMPANY_ADMIN' },
      });

      // 4. Prepare transaction payload for Midtrans
      const transactionPayload = {
        transaction_details: {
          order_id: orderId,
          gross_amount: grossAmount,
        },
        customer_details: {
          first_name: company.name.split(' ')[0],
          last_name: company.name.split(' ')[1] || '',
          email: admin?.email || company.email,
          phone: company.phone || '',
        },
        item_details: [
          {
            id: invoiceId || subscriptionId || 'SUBSCRIPTION',
            name: invoiceId ? `Invoice ${invoiceId}` : `Subscription - ${company.name}`,
            price: grossAmount,
            quantity: 1,
            category: invoiceId ? 'invoice' : 'subscription',
          },
        ],
        enabled_payments: [
          'credit_card',
          'bank_transfer',
          'gopay',
          'qris',
          'shopeepay',
          'indomaret',
          'alfamart',
        ],
        expiry: {
          start_time: new Date().toISOString(),
          unit: 'minutes',
          duration: 30, // 30 min expiry
        },
      };

      // 5. Call Midtrans SNAP API
      const snapResponse = await this.snap.createTransaction(transactionPayload);
      console.log('[PaymentService] Midtrans Response:', {
        order_id: orderId,
        transaction_id: snapResponse.transaction_id,
        snap_token: snapResponse.token.substring(0, 20) + '...',
      });

      // 6. Save payment record in DB
      const payment = await this.prisma.payment.create({
        data: {
          company_id: companyId,
          order_id: orderId,
          transaction_id: snapResponse.transaction_id,
          snap_token: snapResponse.token,
          payment_type: null, // Will be set after customer choose method in SNAP
          gross_amount: grossAmount,
          payment_status: 'pending',
          customer_name: company.name,
          customer_email: admin?.email || company.email,
          customer_phone: company.phone || '',
          subscription_id: subscriptionId || null,
          invoice_id: invoiceId || null,
          description: invoiceId ? `Invoice ${invoiceId}` : 'Subscription payment',
          midtrans_response_full: snapResponse,
          created_by: admin?.id || null,
        },
      });

      // 7. Log audit trail
      await this.prisma.paymentAuditLog.create({
        data: {
          payment_id: payment.id,
          action: 'initiated',
          actor_id: admin?.id || null,
          actor_type: 'admin',
          after_state: { snap_token: snapResponse.token, transaction_id: snapResponse.transaction_id },
        },
      });

      return {
        snap_token: snapResponse.token,
        transaction_id: snapResponse.transaction_id,
        payment_id: payment.id,
      };
    } catch (error) {
      console.error('[PaymentService.initiatePayment] Error:', error);
      throw error;
    }
  }

  /**
   * FR2: Process Webhook from Midtrans
   */
  async processWebhook(webhookBody: any, signature: string): Promise<void> {
    try {
      // 1. Verify signature
      if (!this.verifyWebhookSignature(webhookBody, signature)) {
        throw new Error('Invalid webhook signature');
      }

      const { order_id, transaction_id, transaction_status, fraud_status, settlement_time, gross_amount } = webhookBody;

      console.log('[PaymentService.processWebhook]', {
        order_id,
        transaction_status,
        fraud_status,
      });

      // 2. Find payment in DB (idempotency check)
      let payment = await this.prisma.payment.findUnique({
        where: { transaction_id },
      });

      if (!payment) {
        console.warn('[PaymentService.processWebhook] Payment not found:', { transaction_id });
        throw new Error(`Payment ${transaction_id} not found`);
      }

      // 3. Determine new status
      let newStatus: 'pending' | 'settlement' | 'deny' | 'refund' | 'partial_refund' = 'pending';
      if (transaction_status === 'settlement') {
        newStatus = 'settlement';
      } else if (transaction_status === 'deny') {
        newStatus = 'deny';
      } else if (transaction_status === 'refund') {
        newStatus = 'refund';
      } else if (transaction_status === 'partial_refund') {
        newStatus = 'partial_refund';
      }

      // 4. Skip if status already updated (idempotency)
      if (payment.payment_status === newStatus && payment.settled_at !== null) {
        console.log('[PaymentService.processWebhook] Payment already processed, skipping:', { transaction_id });
        return;
      }

      // 5. Update payment status
      payment = await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          payment_status: newStatus,
          fraud_status: fraud_status === 'accept' ? 'accept' : fraud_status === 'deny' ? 'deny' : null,
          settled_at: newStatus === 'settlement' ? new Date(settlement_time) : null,
          midtrans_response_full: {
            ...payment.midtrans_response_full,
            ...webhookBody,
          },
        },
      });

      // 6. Log audit trail
      await this.prisma.paymentAuditLog.create({
        data: {
          payment_id: payment.id,
          action: newStatus,
          actor_type: 'webhook',
          before_state: { status: payment.payment_status },
          after_state: { status: newStatus, settled_at: payment.settled_at },
        },
      });

      // 7. Send email notification
      if (newStatus === 'settlement') {
        await this.sendPaymentSuccessEmail(payment);
        
        // Mark invoice as paid if this is invoice payment
        if (payment.invoice_id) {
          await this.prisma.invoice.update({
            where: { id: payment.invoice_id },
            data: { status: 'paid', paid_at: new Date() },
          });
        }
      } else if (newStatus === 'deny') {
        await this.sendPaymentFailedEmail(payment);
      }
    } catch (error) {
      console.error('[PaymentService.processWebhook] Error:', error);
      throw error;
    }
  }

  /**
   * Verify Midtrans webhook signature
   */
  private verifyWebhookSignature(body: any, receivedSignature: string): boolean {
    const { order_id, status_code, gross_amount } = body;
    const serverKey = process.env.MIDTRANS_SERVER_KEY_SANDBOX;
    
    const rawString = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const expectedSignature = crypto
      .createHash('sha512')
      .update(rawString)
      .digest('hex');

    const isValid = expectedSignature === receivedSignature;
    console.log('[PaymentService.verifyWebhookSignature]', {
      expected: expectedSignature.substring(0, 20) + '...',
      received: receivedSignature.substring(0, 20) + '...',
      valid: isValid,
    });
    return isValid;
  }

  /**
   * FR4: Get Payment Status
   */
  async getPaymentStatus(paymentId: string, companyId?: string): Promise<any> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) throw new Error('Payment not found');

    // Authorization check: customer can only see own payment
    if (companyId && payment.company_id !== companyId) {
      throw new Error('Access denied');
    }

    return {
      payment_id: payment.id,
      order_id: payment.order_id,
      transaction_id: payment.transaction_id,
      status: payment.payment_status,
      fraud_status: payment.fraud_status,
      gross_amount: payment.gross_amount,
      payment_method: payment.payment_type,
      settled_at: payment.settled_at,
      customer_name: payment.customer_name,
      customer_email: payment.customer_email,
    };
  }

  /**
   * FR5: Manual Refund
   */
  async refund(paymentId: string, amount: number, reason: string, adminId: string): Promise<any> {
    try {
      // 1. Get payment
      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) throw new Error('Payment not found');
      if (payment.payment_status !== 'settlement') {
        throw new Error(`Cannot refund payment with status ${payment.payment_status}`);
      }
      if (amount > payment.gross_amount) {
        throw new Error('Refund amount exceeds payment amount');
      }

      // 2. Call Midtrans refund API
      const refundResponse = await this.snap.transaction.refund(payment.transaction_id, {
        refund_amount: amount,
        reason: reason,
      });

      console.log('[PaymentService.refund] Midtrans Refund Response:', {
        transaction_id: payment.transaction_id,
        refund_amount: amount,
        refund_status: refundResponse.refund_status,
      });

      // 3. Create refund record
      const paymentRefund = await this.prisma.paymentRefund.create({
        data: {
          payment_id: paymentId,
          refund_amount: amount,
          refund_status: refundResponse.refund_status === 'pending' ? 'requested' : 'processed',
          midtrans_refund_id: refundResponse.refund_key,
          initiated_by: adminId,
          reason: reason,
        },
      });

      // 4. Update payment status if full refund
      if (amount === payment.gross_amount) {
        await this.prisma.payment.update({
          where: { id: paymentId },
          data: { payment_status: 'refund' },
        });
      } else {
        await this.prisma.payment.update({
          where: { id: paymentId },
          data: { payment_status: 'partial_refund' },
        });
      }

      // 5. Log audit
      await this.prisma.paymentAuditLog.create({
        data: {
          payment_id: paymentId,
          action: 'refund',
          actor_id: adminId,
          actor_type: 'admin',
          after_state: { refund_amount: amount, reason },
        },
      });

      // 6. Send email
      await this.sendRefundInitiatedEmail(payment, amount);

      return {
        refund_id: paymentRefund.id,
        payment_id: paymentId,
        refund_amount: amount,
        status: 'processed',
        message: 'Refund initiated, customer will receive within 1-3 business days',
      };
    } catch (error) {
      console.error('[PaymentService.refund] Error:', error);
      throw error;
    }
  }

  // Email helper methods
  private async sendPaymentSuccessEmail(payment: any): Promise<void> {
    // Send via SendGrid/SES
    console.log('[PaymentService] Sending payment success email to:', payment.customer_email);
  }

  private async sendPaymentFailedEmail(payment: any): Promise<void> {
    console.log('[PaymentService] Sending payment failed email to:', payment.customer_email);
  }

  private async sendRefundInitiatedEmail(payment: any, amount: number): Promise<void> {
    console.log('[PaymentService] Sending refund email to:', payment.customer_email, 'Amount:', amount);
  }
}
```

---

### 2.3 Backend Controller: PaymentController

**File:** `backend/src/controllers/PaymentController.ts`

```typescript
import { Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

export class PaymentController {
  private paymentService = new PaymentService();

  /**
   * POST /api/v1/payments/initiate-payment
   */
  async initiatePayment(req: Request, res: Response): Promise<void> {
    try {
      const { invoice_id, subscription_id, gross_amount } = req.body;
      const companyId = req.user?.company_id; // From JWT token
      const adminId = req.user?.id;

      // Validation
      if (!companyId) throw new Error('Company ID not found');
      if (!gross_amount || gross_amount <= 0) throw new Error('Invalid amount');

      // Call service
      const result = await this.paymentService.initiatePayment(
        companyId,
        gross_amount,
        invoice_id,
        subscription_id,
      );

      res.json({
        status: 'ok',
        data: result,
      });
    } catch (error) {
      console.error('[PaymentController.initiatePayment]', error);
      res.status(400).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  /**
   * POST /api/v1/webhooks/midtrans
   * No authentication required (public endpoint)
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['x-midtrans-signature'] as string;
      await this.paymentService.processWebhook(req.body, signature);
      
      res.status(200).json({
        status: 'ok',
        message: 'Webhook processed',
      });
    } catch (error) {
      console.error('[PaymentController.handleWebhook]', error);
      res.status(400).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  /**
   * GET /api/v1/payments/:payment_id
   */
  async getPayment(req: Request, res: Response): Promise<void> {
    try {
      const { payment_id } = req.params;
      const companyId = req.user?.company_id;
      const isAdmin = req.user?.role === 'SUPER_ADMIN';

      const result = await this.paymentService.getPaymentStatus(
        payment_id,
        isAdmin ? undefined : companyId,
      );

      res.json({
        status: 'ok',
        data: result,
      });
    } catch (error) {
      console.error('[PaymentController.getPayment]', error);
      res.status(404).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  /**
   * POST /api/v1/payments/:payment_id/refund
   * Admin only
   */
  async refund(req: Request, res: Response): Promise<void> {
    try {
      const { payment_id } = req.params;
      const { refund_amount, reason } = req.body;
      const adminId = req.user?.id;
      const isAdmin = req.user?.role === 'SUPER_ADMIN';

      if (!isAdmin) throw new Error('Admin access required');
      if (!refund_amount || refund_amount <= 0) throw new Error('Invalid refund amount');
      if (!reason) throw new Error('Reason required');

      const result = await this.paymentService.refund(
        payment_id,
        refund_amount,
        reason,
        adminId,
      );

      res.json({
        status: 'ok',
        data: result,
      });
    } catch (error) {
      console.error('[PaymentController.refund]', error);
      res.status(400).json({
        status: 'error',
        message: error.message,
      });
    }
  }
}
```

---

### 2.4 Backend Routes

**File:** `backend/src/routes/payment.ts`

```typescript
import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { authMiddleware } from '../middleware/AuthMiddleware';
import { adminMiddleware } from '../middleware/AdminMiddleware';

const router = Router();
const controller = new PaymentController();

// Payment initiation (auth required)
router.post('/payments/initiate-payment', authMiddleware, (req, res) => {
  controller.initiatePayment(req, res);
});

// Webhook (public, signature verified)
router.post('/webhooks/midtrans', (req, res) => {
  controller.handleWebhook(req, res);
});

// Get payment detail (auth required)
router.get('/payments/:payment_id', authMiddleware, (req, res) => {
  controller.getPayment(req, res);
});

// Refund (admin only)
router.post('/payments/:payment_id/refund', authMiddleware, adminMiddleware, (req, res) => {
  controller.refund(req, res);
});

export default router;
```

---

## 3. Implementation Details

### 3.1 Idempotency Pattern

**Problem:** Webhook retried by Midtrans → duplicate payment entry

**Solution:**

```typescript
async processWebhook(webhookBody: any, signature: string): Promise<void> {
  // 1. Find by transaction_id (unique in Midtrans)
  const existingPayment = await this.prisma.payment.findUnique({
    where: { transaction_id: webhookBody.transaction_id },
  });

  // 2. If found AND status already updated → skip
  if (existingPayment && existingPayment.payment_status === this.mapStatus(webhookBody.transaction_status)) {
    console.log('Payment already processed, idempotent return');
    return; // No error, just skip
  }

  // 3. Otherwise, update (this is first webhook or status change)
  // ...update logic...
}
```

---

### 3.2 Webhook Signature Verification

**Midtrans Formula:** `SHA512(order_id + status_code + gross_amount + server_key)`

```typescript
import crypto from 'crypto';

function verifySignature(body: any, receivedSignature: string): boolean {
  const { order_id, status_code, gross_amount } = body;
  const serverKey = process.env.MIDTRANS_SERVER_KEY_SANDBOX;
  
  const data = `${order_id}${status_code}${gross_amount}${serverKey}`;
  const computed = crypto.createHash('sha512').update(data).digest('hex');
  
  return computed === receivedSignature;
}
```

---

### 3.3 Error Handling & Retry

**Payment Initiation Fail (Midtrans down):**
```typescript
try {
  const snapResponse = await this.snap.createTransaction(payload);
} catch (error) {
  if (error.statusCode === 503 || error.message.includes('Connection')) {
    // Midtrans API timeout/unavailable
    throw new PaymentProviderError('Midtrans temporarily unavailable', 503);
  }
  throw error;
}
```

**Webhook Processing Fail:**
- Return non-200 → Midtrans retry auto (5× over 24h)
- Our side: log error, alert ops, reconcile later

---

### 3.4 Database Transactions

**Scenario:** Update payment status + create audit log

```typescript
await this.prisma.$transaction(async (tx) => {
  // 1. Update payment
  await tx.payment.update({
    where: { id: paymentId },
    data: { payment_status: 'settlement', settled_at: new Date() },
  });

  // 2. Create audit log (same transaction)
  await tx.paymentAuditLog.create({
    data: {
      payment_id: paymentId,
      action: 'settlement',
      actor_type: 'webhook',
      after_state: { status: 'settlement' },
    },
  });
});
```

---

## 4. Security Implementation

### 4.1 Environment Variables

**Sandbox (.env.sandbox):**
```bash
# Midtrans Sandbox Credentials
MIDTRANS_SERVER_KEY_SANDBOX=SB-Mid-server-xxx
MIDTRANS_CLIENT_KEY_SANDBOX=SB-Mid-client-xxx

# API Endpoints
MIDTRANS_API_BASE_URL=https://app.sandbox.midtrans.com
MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/v1/transactions

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dnpeople_dev

# Email Service
SENDGRID_API_KEY=SG-xxx
SENDGRID_FROM_EMAIL=noreply@dnpeople.id
```

**Never commit this file!**

### 4.2 PII Masking in Logs

```typescript
function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  const masked = name.substring(0, 3) + '***' + '@' + domain;
  return masked;
}

function maskPhone(phone: string): string {
  return phone.substring(0, 3) + '****' + phone.substring(phone.length - 2);
}

// Usage
console.log('[Payment]', {
  customer_email: maskEmail('john@company.com'), // john***@company.com
  customer_phone: maskPhone('62812345678'), // 628****78
});
```

### 4.3 Webhook Signature Verification

Already implemented in PaymentService.verifyWebhookSignature()

---

## 5. Testing Strategy

### 5.1 Unit Tests

**File:** `backend/src/services/__tests__/PaymentService.test.ts`

```typescript
describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(() => {
    service = new PaymentService();
  });

  describe('initiatePayment', () => {
    it('should generate snap_token', async () => {
      const result = await service.initiatePayment('company-1', 600000);
      expect(result.snap_token).toBeDefined();
      expect(result.transaction_id).toBeDefined();
    });

    it('should throw error if amount <= 0', async () => {
      await expect(service.initiatePayment('company-1', 0)).rejects.toThrow();
    });
  });

  describe('processWebhook', () => {
    it('should update payment status on webhook', async () => {
      // Setup: create payment with order_id
      // Call processWebhook with settlement status
      // Assert: payment status updated
    });

    it('should be idempotent - duplicate webhook returns early', async () => {
      // Call processWebhook twice with same webhook
      // Assert: only one audit log entry
    });

    it('should verify signature', async () => {
      const invalidSignature = 'fake-sig';
      await expect(
        service.processWebhook({...}, invalidSignature)
      ).rejects.toThrow('Invalid signature');
    });
  });

  describe('refund', () => {
    it('should call Midtrans refund API', async () => {
      // ...
    });

    it('should not refund if payment status != settlement', async () => {
      // ...
    });
  });
});
```

### 5.2 Integration Tests

**Sandbox Payment Flow:**
1. Initiate payment → get snap_token ✓
2. Customer submit payment (using simulator)
3. Midtrans send webhook
4. Backend process webhook → update status ✓
5. Verify payment marked as settlement ✓

---

## 6. Deployment Checklist

### Pre-Production (Sandbox)
- [ ] Midtrans sandbox account created
- [ ] Server Key & Client Key configured in env
- [ ] Database schema migrated (Prisma)
- [ ] Webhook endpoint configured in Midtrans dashboard
- [ ] Email service tested (SendGrid/SES)
- [ ] All 5 payment methods tested with simulators
- [ ] Admin dashboard filtering tested
- [ ] Error handling tested
- [ ] Security review passed
- [ ] Documentation complete

### Production Migration (Future)
- [ ] Switch to Midtrans production API keys
- [ ] Update webhook endpoint URL (prod domain)
- [ ] Load testing (concurrent payments)
- [ ] Incident response plan documented
- [ ] Monitoring & alerting setup
- [ ] Rollback plan ready

---

## 7. Monitoring & Logging

### Metrics to Monitor
```
- Payment success rate (%)
- Payment initiation latency (ms)
- Webhook delivery latency (ms)
- Failed webhook processing count
- Refund success rate (%)
- Average settlement time (hours)
```

### Logging Standards
```
[Component] [Function] [Level] Message

Example:
[PaymentService] [initiatePayment] [INFO] Snap token generated: ORDER-comp-123-...
[PaymentService] [processWebhook] [ERROR] Webhook signature invalid: SB-001
```

---

## 8. Performance Optimization

### Database Indexes
```sql
CREATE INDEX idx_payment_company_id ON payment(company_id);
CREATE INDEX idx_payment_status_created ON payment(payment_status, created_at DESC);
CREATE INDEX idx_payment_transaction_id ON payment(transaction_id);
```

### Caching (Future)
- Cache snap_token (30 min TTL)
- Cache payment status (1 min TTL)

---

**Version:** 1.0  
**Last Updated:** 26 Juli 2026

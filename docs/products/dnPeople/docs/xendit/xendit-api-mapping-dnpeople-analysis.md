# Xendit API Reference Mapping untuk dnPeople
## API Endpoints yang Diperlukan - Analysis & Recommendation

**Tanggal:** 8 Agustus 2026  
**Status:** Migration Analysis (Midtrans → Xendit)  
**Document:** Reference mapping untuk engineering team  

---

## EXECUTIVE SUMMARY

**Midtrans vs Xendit Capability Mapping:**

Midtrans punya:
- ✅ SNAP (pre-built UI semua payment methods)
- ✅ Core API (per-method custom checkout)
- ✅ Recurring (native subscription)
- ✅ Disbursement (affiliate payout)
- ✅ 15+ payment methods built-in

Xendit punya:
- ✅ Payment Request (similar SNAP - pre-built)
- ✅ Payment API (custom checkout)
- ✅ Payment Token (tokenization / account linking)
- ✅ Subscriptions (recurring)
- ✅ Payouts (disbursement)
- ❓ Payment method coverage: **LIMITED** (lihat detail bawah)
- ❓ Hosted checkout UI: **Tidak standard SNAP-like**

---

## 1. XENDIT APIS YANG KITA BUTUH (Ranked by Priority)

### 🔴 PRIORITY 0 (CRITICAL - Must Have)

#### 1.1 Payment Request API ⭐
**Reference:** `/apidocs/payment-request` (Xendit docs)

**Purpose:** Equivalent Midtrans SNAP
**Use Case:** Pre-built UI untuk semua payment methods sekaligus

```bash
POST https://api.xendit.co/payment_requests

Authorization: Basic {base64(secret_key:)}
Content-Type: application/json

Request:
{
  "reference_id": "ORDER-2026-001",
  "amount": 600000,
  "currency": "IDR",
  "description": "Subscription STARTER 30 emp",
  
  "payment_method": {
    "type": "QR_CODE",  // atau BANK_TRANSFER, EWALLET, CARD, OTC_BANK_TRANSFER
    "reusability": "MULTI_USE"
  },
  
  "customer": {
    "reference_id": "company-123",
    "name": "PT. ABC",
    "email": "hr@abc.com",
    "phone_number": "+628123456789"
  },
  
  "metadata": {
    "company_id": "company-123",
    "tier": "STARTER",
    "employee_count": 30
  },
  
  "items": [{
    "reference_id": "ITEM-001",
    "name": "Subscription STARTER 30 emp",
    "quantity": 1,
    "price": 600000
  }],
  
  "success_redirect_url": "https://dnpeople.id/payment/success",
  "failure_redirect_url": "https://dnpeople.id/payment/failed"
}

Response (200):
{
  "id": "pr-xxxxxx",
  "reference_id": "ORDER-2026-001",
  "status": "PENDING",
  "amount": 600000,
  "currency": "IDR",
  "payment_method": {...},
  "actions": [
    {
      "action": "REDIRECT",
      "url": "https://checkout.xendit.co/..." // Customer redirect here
    }
  ],
  "created_at": "2026-08-08T10:00:00Z",
  "expires_at": "2026-08-08T10:30:00Z"
}
```

**Status:** ✅ CRITICAL - This is gateway to checkout
**Limitation:** Xendit's hosted checkout might not support ALL payment methods like Midtrans SNAP (need to verify availability per market/region)

---

#### 1.2 Payment API ⭐
**Reference:** `/apidocs/payment` (Xendit docs)

**Purpose:** Direct charge API (custom UI checkout)
**Use Case:** Custom checkout untuk advanced users, installment, specific payment methods

```bash
POST https://api.xendit.co/payments

Authorization: Basic {base64(secret_key:)}

# FOR CARD PAYMENT
Request:
{
  "reference_id": "ORDER-2026-002",
  "currency": "IDR",
  "amount": 600000,
  "payment_method": {
    "type": "CARD",
    "card": {
      "token_id": "token-xxx",  // dari Payment Token endpoint
      "cvv": "123"
    }
  },
  "description": "Subscription payment",
  "metadata": {...}
}

# FOR BANK TRANSFER PAYMENT
Request:
{
  "reference_id": "ORDER-2026-003",
  "currency": "IDR",
  "amount": 600000,
  "payment_method": {
    "type": "BANK_TRANSFER",
    "bank_transfer": {
      "bank_code": "BCA",
      "channel_properties": {}
    }
  }
}

# FOR EWALLET (GoPay, OVO, etc)
Request:
{
  "reference_id": "ORDER-2026-004",
  "currency": "IDR",
  "amount": 600000,
  "payment_method": {
    "type": "EWALLET",
    "ewallet": {
      "channel_code": "ID_GOPAY"  // or ID_OVO, ID_DANA, ID_LINKAJA
    }
  },
  "channel_properties": {
    "success_redirect_url": "https://dnpeople.id/success"
  }
}

Response (200):
{
  "id": "py-xxxxxx",
  "reference_id": "ORDER-2026-002",
  "status": "SUCCEEDED|PENDING",
  "amount": 600000,
  "currency": "IDR",
  "payment_method": {...},
  "channel_properties": {
    "reference": "VA_NUMBER_xxxx",  // For bank transfer
    "qr_code": "url_to_qr",  // For QRIS/Ewallet
    "redirect_url": "..."  // For 3DS card
  },
  "created_at": "2026-08-08T10:00:00Z"
}
```

**Status:** ✅ CRITICAL
**Note:** This is Xendit Core API equivalent (replace Midtrans /v2/charge)

---

#### 1.3 Subscriptions API ⭐
**Reference:** `/apidocs/subscriptions` (Xendit docs)

**Purpose:** Native recurring payment (like Midtrans recurring)
**Use Case:** Auto-charge monthly subscription

```bash
POST https://api.xendit.co/recurring_payments

Authorization: Basic {base64(secret_key:)}

Request:
{
  "reference_id": "SUB-2026-001",
  "amount": 600000,
  "currency": "IDR",
  "payment_method": {
    "type": "CARD",
    "card": {
      "token_id": "token-xxx",
      "3ds": true
    }
  },
  "interval": "MONTH",  // WEEK, MONTH, QUARTER, SEMI_ANNUAL, ANNUAL
  "interval_count": 1,
  "total_recurrence": 12,  // 12 bulan subscription
  "failed_attempt_notifications": 3,
  "description": "STARTER subscription",
  "metadata": {
    "subscription_id": "sub-123",
    "company_id": "company-123"
  }
}

Response (201):
{
  "id": "rp-xxxxxx",
  "reference_id": "SUB-2026-001",
  "status": "ACTIVE|COMPLETED|STOPPED",
  "amount": 600000,
  "interval": "MONTH",
  "total_recurrence": 12,
  "recurrence_progress": 1,  // Current charge number
  "next_execute_date": "2026-09-08T10:00:00Z",
  "created_at": "2026-08-08T10:00:00Z"
}
```

**Status:** ✅ CRITICAL
**Alternative:** If Xendit recurring is limited, use Cron job + Payment API to charge monthly

---

#### 1.4 Refund API ⭐
**Reference:** `/apidocs/refund` (Xendit docs)

**Purpose:** Reverse payment
**Use Case:** Admin manual refund (full atau partial), auto-refund rules

```bash
POST https://api.xendit.co/refunds

Authorization: Basic {base64(secret_key:)}

Request:
{
  "payment_id": "py-xxxxxx",  // atau reference_id
  "amount": 600000,  // Full refund (optional untuk partial)
  "reason": "ADMIN_INITIATED",  // ADMIN_INITIATED, PAYMENT_FAILED, REQUESTED_BY_CUSTOMER, OTHERS
  "notes": "Customer request"
}

Response (201):
{
  "id": "rf-xxxxxx",
  "payment_id": "py-xxxxxx",
  "amount": 600000,
  "status": "SUCCEEDED|PENDING|FAILED",
  "reason": "ADMIN_INITIATED",
  "created_at": "2026-08-08T10:00:00Z"
}
```

**Status:** ✅ CRITICAL
**Note:** Replace Midtrans /v2/refund

---

#### 1.5 Webhook API ⭐
**Reference:** `/apidocs/webhook-behavior` (Xendit docs)

**Purpose:** Receive real-time payment status updates
**Use Case:** Update payment status, send receipt, trigger next step

**Xendit will POST to your endpoint:**
```bash
POST https://dnpeople.id/api/v1/webhooks/xendit

Headers:
  X-Xendit-Callback-Token: {callback_token}
  Content-Type: application/json

Body:
{
  "event": "payment.completed|payment.failed|payment.expired",
  "data": {
    "id": "py-xxxxxx",
    "reference_id": "ORDER-2026-001",
    "status": "SUCCEEDED|FAILED|EXPIRED",
    "amount": 600000,
    "currency": "IDR",
    "payment_method": {...},
    "completed_at": "2026-08-08T10:15:00Z"
  }
}
```

**Status:** ✅ CRITICAL
**Note:** Setup webhook URL in Xendit Dashboard + verify token signature (like Midtrans)

---

### 🟠 PRIORITY 1 (HIGH - Should Have)

#### 1.6 Payment Token API ⭐
**Reference:** `/apidocs/payment-token` (Xendit docs)

**Purpose:** Tokenization / Account Linking (one-click payment)
**Use Case:** Save card, ewallet untuk customer untuk one-click payment next time

```bash
POST https://api.xendit.co/payment_methods/tokenize

Request:
{
  "type": "CARD",
  "properties": {
    "public_token": "token-from-frontend",  // Tokenized on frontend
    "reference_id": "card-saved-001"
  }
}

Response (201):
{
  "id": "token-xxxxxx",
  "reference_id": "card-saved-001",
  "type": "CARD",
  "status": "ACTIVE",
  "created_at": "2026-08-08T10:00:00Z"
}
```

**Status:** ✅ HIGH (for save card / one-click)
**Note:** Replace Midtrans tokenization

---

#### 1.7 Payouts API ⭐
**Reference:** `/apidocs/payout` (Xendit docs)

**Purpose:** Disbursement (send money to bank account)
**Use Case:** Pay affiliate commission, referral bonus, seller payout

```bash
POST https://api.xendit.co/payouts

Authorization: Basic {base64(secret_key:)}

Request:
{
  "reference_id": "PAYOUT-2026-001",
  "amount": 500000,
  "currency": "IDR",
  "channel_code": "ID_BCA",  // ID_BCA, ID_MANDIRI, ID_BNI, ID_BRI, etc
  
  "channel_properties": {
    "bank_account_holder_name": "John Doe",
    "bank_account_number": "1234567890"
  },
  
  "receipt": {
    "email": "john@example.com"
  }
}

Response (201):
{
  "id": "po-xxxxxx",
  "reference_id": "PAYOUT-2026-001",
  "amount": 500000,
  "currency": "IDR",
  "channel_code": "ID_BCA",
  "status": "PENDING|COMPLETED|FAILED",
  "created_at": "2026-08-08T10:00:00Z",
  "completed_at": null
}
```

**Status:** ✅ HIGH
**Note:** Replace Midtrans disbursement (for affiliate program)

---

#### 1.8 Balance & Reports API
**Reference:** `/apidocs/balance`, `/apidocs/reports` (Xendit docs)

**Purpose:** Check account balance, transaction history
**Use Case:** Admin dashboard finance overview, reconciliation

```bash
GET https://api.xendit.co/balance

Response (200):
{
  "balance": 50000000,  // Available balance in IDR
  "currency": "IDR"
}

GET https://api.xendit.co/reports/transactions?type=PAYMENT&limit=100

Response (200):
{
  "data": [
    {
      "id": "py-xxxxxx",
      "reference_id": "ORDER-2026-001",
      "type": "PAYMENT",
      "amount": 600000,
      "status": "COMPLETED",
      "created_at": "2026-08-08T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

**Status:** ✅ HIGH
**Note:** For admin dashboard analytics & reconciliation

---

### 🟡 PRIORITY 2 (MEDIUM - Nice to Have)

#### 2.1 Bill Payments API
**Reference:** `/apidocs/bill-payments` (Xendit docs)

**Purpose:** Pay bills (utility, telecom, etc) - NOT primary for dnPeople
**Status:** ❌ NOT NEEDED (not payment processing, this is outgoing bills)

---

#### 2.2 Foreign Exchange API
**Reference:** `/apidocs/foreign-exchange` (Xendit docs)

**Purpose:** Currency conversion
**Use Case:** If expand to multi-currency (future)
**Status:** ❌ NOT NEEDED NOW (IDR only v2.0)

---

#### 2.3 xenPlatform / Customers API
**Reference:** `/apidocs/customers` (Xendit docs)

**Purpose:** Centralized customer management
**Status:** ⚠️ OPTIONAL (we can manage in our DB, but Xendit customer storage simplifies)

---

#### 2.4 Session API (for Web Checkout)
**Reference:** `/apidocs/session` (if available in Xendit docs)

**Purpose:** Create checkout session (like Midtrans SNAP)
**Status:** ❓ Need to check if Xendit provides "Embedded Checkout" session management
**Alternative:** Use Payment Request API instead

---

## 2. XENDIT PAYMENT METHODS COVERAGE ⚠️

### Available Payment Methods (Verify with Xendit)

**Need to CHECK dari Xendit Dashboard / API docs:**

| Method | Midtrans | Xendit | Status |
|--------|----------|--------|--------|
| **Card** (Visa, MC, AMEX) | ✅ | ✅ | AVAILABLE |
| **GoPay** | ✅ | ✅ | AVAILABLE |
| **OVO** | ✅ | ✅ | AVAILABLE |
| **Dana** | ❌ | ✅ | New option |
| **LinkAja** | ❌ | ✅ | New option |
| **ShopeePay** | ✅ | ❓ | NEED TO VERIFY |
| **QRIS** (unified) | ✅ | ✅ | AVAILABLE |
| **Bank Transfer (8 banks)** | ✅ | ✅ | Partial (verify all 8) |
| **Indomaret / Alfamart** | ✅ | ❓ | NEED TO VERIFY |
| **Akulaku / Kredivo** | ✅ | ❓ | NEED TO VERIFY |
| **Google Pay** | ✅ | ❓ | NEED TO VERIFY |
| **Installment** | ✅ | ❓ | NEED TO VERIFY |

**⚠️ KEY QUESTION:** Does Xendit support ALL same payment methods as Midtrans?
- If NOT: We need to either (a) negotiate with Xendit untuk add missing methods, (b) Keep Midtrans for specific methods, (c) Use different provider per method

---

## 3. XENDIT API ENDPOINTS REQUIRED (Complete List)

### For Subscription Billing (Payment Processing)

| Endpoint | Method | Purpose | Priority | Status |
|----------|--------|---------|----------|--------|
| `/payment_requests` | POST | Create pre-built checkout | P0 | ✅ REQUIRED |
| `/payment_requests/{id}` | GET | Get payment request status | P0 | ✅ REQUIRED |
| `/payments` | POST | Direct charge (custom UI) | P0 | ✅ REQUIRED |
| `/payments/{id}` | GET | Get payment status | P0 | ✅ REQUIRED |
| `/payment_methods/tokenize` | POST | Tokenize card/ewallet | P1 | ✅ REQUIRED |
| `/recurring_payments` | POST | Create subscription | P0 | ✅ REQUIRED |
| `/recurring_payments/{id}` | GET | Get subscription status | P0 | ✅ REQUIRED |
| `/recurring_payments/{id}/pause` | PATCH | Pause subscription | P1 | ✅ REQUIRED |
| `/recurring_payments/{id}/resume` | PATCH | Resume subscription | P1 | ✅ REQUIRED |
| `/recurring_payments/{id}/stop` | PATCH | Cancel subscription | P1 | ✅ REQUIRED |
| `/refunds` | POST | Create refund | P0 | ✅ REQUIRED |
| `/refunds/{id}` | GET | Get refund status | P0 | ✅ REQUIRED |
| `/webhooks` | Setup | Webhook configuration | P0 | ✅ REQUIRED |

### For Disbursement (Payout)

| Endpoint | Method | Purpose | Priority | Status |
|----------|--------|---------|----------|--------|
| `/payouts` | POST | Create payout | P1 | ✅ REQUIRED |
| `/payouts/{id}` | GET | Get payout status | P1 | ✅ REQUIRED |

### For Admin Dashboard

| Endpoint | Method | Purpose | Priority | Status |
|----------|--------|---------|----------|--------|
| `/balance` | GET | Account balance | P2 | ✅ OPTIONAL |
| `/reports/transactions` | GET | Transaction history | P2 | ✅ OPTIONAL |
| `/customers` | POST/GET | Customer management | P2 | ❓ OPTIONAL |

---

## 4. CRITICAL GAPS (Xendit vs Midtrans)

### ❌ Things Midtrans Has That Xendit May NOT Have

1. **SNAP-like Pre-built UI**
   - Midtrans: Fully hosted SNAP modal dengan ALL payment methods
   - Xendit: Hosted checkout page (might need to verify feature parity)
   - **Mitigation:** Use Payment Request API + possibly custom integration per method

2. **Bulk Disbursement (Iris)**
   - Midtrans: Iris API untuk batch payout (up to 500 recipients)
   - Xendit: Single payout + loop for bulk
   - **Mitigation:** Use `/payouts` in loop atau negotiate for batch endpoint

3. **Payment Method Coverage**
   - Midtrans: 15+ methods including convenience stores
   - Xendit: Need to verify which methods supported per region
   - **Mitigation:** Check Xendit availability early, plan fallback

4. **3D Secure Handling**
   - Midtrans: Auto 3DS for high-risk cards
   - Xendit: Need to check if automatic or manual parameter
   - **Mitigation:** Verify Xendit 3DS flow

---

## 5. IMPLEMENTATION STRATEGY

### Phase 1: Core Payment API (Aug 15-31)
1. ✅ Payment Request API (checkout page)
2. ✅ Payment API (direct charge)
3. ✅ Refund API
4. ✅ Webhook setup & verification
5. ✅ Payment Token API (tokenization)

### Phase 2: Subscriptions & Recurring (Sep 1-15)
1. ✅ Subscriptions API (recurring charges)
2. ✅ Pause/Resume/Cancel subscription
3. ✅ Auto-charge monthly via subscription or cron

### Phase 3: Disbursement (Sep 16-30)
1. ✅ Payouts API (affiliate payout)
2. ✅ Batch payout simulation (loop)

### Phase 4: Admin Dashboard (Oct 1-15)
1. ✅ Balance API
2. ✅ Reports / Transactions API
3. ✅ Analytics dashboard

---

## 6. XENDIT QUICK START CHECKLIST

### Before Implementation

- [ ] Register Xendit account (https://dashboard.xendit.co/)
- [ ] Generate API keys (sandbox + live)
- [ ] Check payment method availability per region (crucial!)
- [ ] Verify 3DS implementation
- [ ] Verify recurring payment implementation
- [ ] Test webhook delivery
- [ ] Read Xendit SDK documentation (if available)

### After Implementation

- [ ] Sandbox testing (all payment methods)
- [ ] Webhook testing (signature verification)
- [ ] Refund testing
- [ ] Subscription testing (mock recurring charge)
- [ ] Performance baseline (API latency)
- [ ] Migration from Midtrans (if applicable)

---

## 7. COMPARISON: Midtrans vs Xendit

| Aspect | Midtrans | Xendit |
|--------|----------|--------|
| **Payment Methods** | 15+ (comprehensive) | ❓ (need verification) |
| **Pre-built Checkout** | SNAP (excellent) | Payment Request (good?) |
| **Core API** | Mature | Available |
| **Recurring** | Native, reliable | Available |
| **Disbursement** | Single + Bulk (Iris) | Single only (?) |
| **3DS** | Automatic | ❓ |
| **Pricing** | Standard MDR | Check with Xendit |
| **Indonesia Focus** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Support** | Good | Good |

---

## RECOMMENDATION

### Scenario A: Full Migration to Xendit
✅ **If Xendit supports:**
- All 15 payment methods (or close)
- Good SNAP equivalent
- Bulk disbursement
- Competitive pricing

→ Full switch (simplify to single provider)

### Scenario B: Hybrid (Xendit + Midtrans)
⚠️ **If Xendit missing features:**
- Primary: Xendit (subscription, core payments)
- Secondary: Midtrans for convenience store / specific methods
- Complexity: Manage 2 providers

### Scenario C: Stick with Midtrans
❌ **If Xendit doesn't meet needs**
- Keep current Midtrans v2.0 (already documented)
- Explore Xendit again in future

---

## NEXT STEPS

1. **Contact Xendit Sales** - Confirm all payment methods availability
2. **Sandbox Testing** - Set up test account, run through payment flows
3. **Decision** - Commit to timeline for migration/integration
4. **Documentation** - Create Xendit PRD/SRS/SDD (similar to Midtrans docs we just made)
5. **Implementation** - Start development (Aug 15)

---

**Important:** Before full commitment, verify with Xendit that they support:
- ✅ ShopeePay
- ✅ Convenience Store (Indomaret, Alfamart)
- ✅ Installment
- ✅ Bulk Payout / Batch Disbursement

If ANY of these are missing, have a contingency plan!


# dnPeople Midtrans Payment Integration (Comprehensive)
## Software Requirements Specification (SRS) v2.0

**Bahasa:** Bahasa Indonesia  
**Mata Uang:** IDR (Rp)  
**Tanggal:** 26 Juli 2026  
**Status:** Comprehensive - All APIs, All Payment Methods  

---

## 1. Functional Requirements Breakdown

### 1.1 Payment Initiation (FR1-FR5)

#### FR1: SNAP Checkout Initiation
**Description:** Backend generate SNAP token untuk pre-built Midtrans UI
**Priority:** P0
**Acceptance Criteria:**
- Input: order_id, gross_amount, customer_details, enabled_payments list
- Output: snap_token, transaction_id
- API: POST /snap/v1/transactions
- Idempotency: same order_id → same token (30 min valid)
- Error handling: 503 if Midtrans down
- Log: all request/response (PII sanitized)

**API Endpoint:**
```
POST https://app.sandbox.midtrans.com/snap/v1/transactions
Authorization: Basic {base64(serverKey:)}
Content-Type: application/json

Request:
{
  "transaction_details": {
    "order_id": "ORDER-2026-001",
    "gross_amount": 600000
  },
  "customer_details": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@company.com",
    "phone": "62812345678",
    "billing_address": {...},
    "shipping_address": {...}
  },
  "item_details": [
    {
      "id": "ITEM-001",
      "name": "Subscription STARTER 30 emp",
      "price": 20000,
      "quantity": 30,
      "category": "subscription"
    }
  ],
  "enabled_payments": ["credit_card", "bank_transfer", "gopay", "qris", "ovo", "shopeepay", "indomaret", "alfamart"],
  "expiry": {
    "start_time": "2026-08-15T10:00:00+07:00",
    "unit": "minutes",
    "duration": 30
  }
}

Response (200):
{
  "snap_token": "SNAP-{token}",
  "redirect_url": "https://app.sandbox.midtrans.com/snap/...",
  "transaction_id": "2026081500000001"
}
```

---

#### FR2: Core API - Charge Endpoint (Card/Bank/E-Wallet)
**Description:** Custom checkout via Core API endpoints per payment method
**Priority:** P0
**Acceptance Criteria:**
- Card charge: tokenized or direct (3DS required)
- Bank VA charge: auto-generate VA number
- E-Wallet charge: return redirect_url to app/payment page
- Installment support (card only)
- All sandbox test numbers work

**API Endpoints:**
```
POST https://app.sandbox.midtrans.com/v2/charge
Authorization: Basic {base64(serverKey:)}

--- CARD CHARGE (Direct) ---
Request:
{
  "payment_type": "credit_card",
  "order_id": "ORDER-2026-001",
  "gross_amount": 600000,
  "credit_card": {
    "token_id": "{token_from_frontend}" | "tokenize": true,
    "authenticated": true,
    "installment": {
      "type": "oflw_installment",
      "term_detail": {"month_to_pay": 12, "gross_amount": 600000}
    }
  },
  "customer_details": {...},
  "items": [...]
}

Response (200): {transaction_id, status: "capture"|"settlement"|"pending",...}

--- BANK TRANSFER CHARGE ---
Request:
{
  "payment_type": "bank_transfer",
  "order_id": "ORDER-2026-002",
  "gross_amount": 500000,
  "bank_transfer": {
    "bank": "bca",
    "va_number": "auto-generate"
  },
  "customer_details": {...}
}

Response (200): {transaction_id, status: "pending", va_numbers: [{bank:"bca",va_number:"xxx"}]}

--- E-WALLET CHARGE (GoPay/OVO/ShopeePay) ---
Request:
{
  "payment_type": "gopay|ovo|shopeepay",
  "order_id": "ORDER-2026-003",
  "gross_amount": 400000,
  "{payment_type}": {...},
  "customer_details": {...}
}

Response (200): {transaction_id, status: "pending", redirect_url: "..."}
```

---

#### FR3: Payment Link API
**Description:** Generate shareable payment link
**Priority:** P1
**Acceptance Criteria:**
- Input: reference_id, amount, description, expiry
- Output: shareable URL
- No-code integration (share URL via email)
- Webhook when paid
- Auto-expire after X hours

**API Endpoint:**
```
POST https://app.sandbox.midtrans.com/v1/payment_links
Authorization: Basic {base64(serverKey:)}

Request:
{
  "reference_id": "INV-2026-001",
  "amount": 5000000,
  "description": "Invoice payment",
  "expiry_duration": 3600,
  "currency": "IDR"
}

Response (200):
{
  "payment_link_id": "pl-xxx",
  "url": "https://pay.midtrans.com/...",
  "reference_id": "INV-2026-001",
  "status": "active",
  "expires_at": "2026-08-15T11:00:00Z"
}
```

---

#### FR4: Get Card Token (Frontend)
**Description:** Tokenize card on frontend (PCI compliance)
**Priority:** P0
**Acceptance Criteria:**
- No Server Key required (Client Key only)
- Return token safe for storage
- Stored token used in subsequent charges

**API Endpoint:**
```
GET https://api.sandbox.midtrans.com/v2/token
Query Params:
  client_key={CLIENT_KEY}
  card_number={card}
  card_cvv={cvv}
  card_exp_month={mm}
  card_exp_year={yy}
  gross_amount={amount}
  currency=IDR

Response (200):
{
  "token_id": "token-xxx",
  "hash": "hash-xxx",
  "status_code": "200"
}
```

---

#### FR5: Subscription - Recurring API
**Description:** Enable recurring payment (native Midtrans)
**Priority:** P0
**Acceptance Criteria:**
- First charge with `save_card: true`
- Midtrans return subscription_id
- Charge via subscription_id in future
- Webhook on each charge
- Support pause, resume, cancel

**API Endpoints:**
```
POST /v2/charge (with subscription creation):
{
  "payment_type": "credit_card",
  "order_id": "SUB-2026-001",
  "gross_amount": 600000,
  "currency": "IDR",
  "credit_card": {
    "token_id": "...",
    "save_card": true
  },
  "customer_details": {...},
  "custom_expiry": {
    "expiry_type": "absolute",
    "expiry_time": "2027-08-15 10:00:00"
  }
}

Response (200): {transaction_id, subscription_id: "sub-xxx", ...}

--- SUBSEQUENT CHARGE (via subscription) ---
POST /v2/recurring/{subscription_id}/charge
{
  "amount": 600000,
  "order_id": "SUB-2026-001-AUG"
}

Response (200): {transaction_id, subscription_id, status: "pending"|"settlement"|"deny"}

--- PAUSE SUBSCRIPTION ---
PATCH /v2/subscription/{subscription_id}
{
  "skip_cycle": 1
}

--- CANCEL SUBSCRIPTION ---
DELETE /v2/subscription/{subscription_id}
```

---

### 1.2 Payment Status & Management (FR6-FR10)

#### FR6: Get Payment Status (Reconciliation)
**Description:** Query current status from Midtrans (reconcile DB vs Midtrans)
**Priority:** P1
**Acceptance Criteria:**
- Query by transaction_id or order_id
- Return: status, fraud_status, settlement_time, payment_method
- Daily reconciliation job runs

**API Endpoint:**
```
GET https://api.sandbox.midtrans.com/v2/{transaction_id}/status
Authorization: Basic {base64(serverKey:)}

Response (200):
{
  "transaction_id": "2026081500000001",
  "order_id": "ORDER-2026-001",
  "transaction_status": "settlement",
  "fraud_status": "accept",
  "gross_amount": "600000.00",
  "payment_type": "credit_card",
  "settlement_time": "2026-08-15T10:35:00Z",
  "status_code": "200"
}
```

---

#### FR7: List Payments (Admin Dashboard)
**Description:** Admin query payment history
**Priority:** P1
**Acceptance Criteria:**
- Filter: status, date_range, customer, payment_method, amount
- Sort: settled_at DESC
- Pagination: limit 20-100
- Performance: < 3s (10K records)

**API Endpoint:**
```
GET /api/v1/payments?status=settlement&from_date=2026-08-01&limit=20&offset=0
Authorization: Bearer {admin_jwt}

Query Params:
  status: pending|settlement|deny|refund|all
  from_date, to_date: ISO 8601
  payment_method: credit_card|bank_transfer|gopay|...
  customer_name: string
  amount_min, amount_max: number
  limit: 1-100
  offset: number

Response (200):
{
  "data": [{payment_id, order_id, customer_name, gross_amount, payment_method, status, settled_at}, ...],
  "pagination": {total, limit, offset, has_more}
}
```

---

#### FR8: Refund - Manual
**Description:** Admin-initiated refund
**Priority:** P1
**Acceptance Criteria:**
- Only settlement status → can refund
- Log: admin_id, timestamp, reason
- Midtrans API called
- DB updated to refund/partial_refund status
- Email sent to customer

**API Endpoint:**
```
POST /api/v1/payments/{payment_id}/refund
Authorization: Bearer {admin_jwt}

Request:
{
  "refund_amount": 600000,
  "reason": "Customer request"
}

Response (200):
{
  "refund_id": "REFUND-xxx",
  "status": "processed",
  "message": "Refund initiated, customer will receive within 1-3 business days"
}
```

---

#### FR9: Auto-Refund Rules (Future)
**Description:** Automatic refund based on conditions
**Priority:** P3 (v2.1)
**Acceptance Criteria:**
- Trigger: failed payment after 3 retries, chargeback
- Auto-execute refund via API
- Send notification to customer

---

#### FR10: Subscription Status Tracking
**Description:** Admin view subscription status, manage pause/resume/cancel
**Priority:** P1
**Acceptance Criteria:**
- Get subscription by customer_id
- Show: status, next_billing, saved_method, total_paid
- Action: pause, resume, cancel, manual charge

---

### 1.3 Webhook Handling (FR11-FR14)

#### FR11: Webhook Receiver (All Payment Methods)
**Description:** Midtrans POST to our endpoint on payment events
**Priority:** P0
**Acceptance Criteria:**
- Verify signature (HMAC-SHA512)
- Extract status, fraud_status, settlement_time
- Idempotent (duplicate webhook = no double entry)
- Async processing (use queue if needed)
- Response 200 within 5s

**Webhook Endpoint:**
```
POST /api/v1/webhooks/midtrans
X-Midtrans-Signature: {signature}
Content-Type: application/json

Body (from Midtrans):
{
  "transaction_id": "2026081500000001",
  "order_id": "ORDER-2026-001",
  "gross_amount": "600000.00",
  "payment_type": "credit_card",
  "transaction_status": "settlement"|"pending"|"deny"|"cancel"|"refund"|"partial_refund",
  "fraud_status": "accept"|"deny",
  "settlement_time": "2026-08-15T10:35:00Z",
  "status_code": "200",
  "signature_key": "{signature}"
}

Response (200):
{
  "status": "ok",
  "message": "Webhook processed"
}
```

---

#### FR12: Webhook Signature Verification
**Description:** Verify webhook authenticity
**Priority:** P0 (Critical)
**Formula:** SHA512(order_id + status_code + gross_amount + server_key)
**Acceptance Criteria:**
- Signature mismatch → reject (400)
- Log all webhook attempts
- No processing without valid signature

---

#### FR13: Webhook Status Transitions
**Description:** Handle all transaction status changes
**Priority:** P0
**Status Flow:**
```
pending → settlement (happy path)
pending → deny (rejected)
pending → cancel (expired)
settlement → refund (full refund)
settlement → partial_refund (partial refund)
```

---

#### FR14: Webhook Retry & Idempotency
**Description:** Handle Midtrans retry safely
**Priority:** P0
**Acceptance Criteria:**
- Midtrans retry 5× over 24h if non-200 response
- Our side: check transaction_id in DB, skip if already processed
- Log: all webhook attempts (success + retry)
- No double credit

---

### 1.4 Account Linking / Tokenization (FR15-FR17)

#### FR15: Save Payment Method
**Description:** Customer save card/e-wallet for one-click
**Priority:** P1
**Acceptance Criteria:**
- Request token from Midtrans (from charged transaction)
- Store in saved_payment_method table
- Customer can name it ("My Visa", "GoPay", etc.)
- Customer can delete

**API Endpoint:**
```
POST /api/v1/payment-methods
Authorization: Bearer {customer_jwt}

Request:
{
  "payment_id": "PAY-xxx",
  "name": "My Visa Card",
  "is_default": true
}

Response (200):
{
  "saved_method_id": "...",
  "payment_type": "credit_card",
  "masked_data": {card_number: "****1114", bank: "VISA"},
  "is_default": true
}
```

---

#### FR16: List Saved Payment Methods
**Description:** Customer view all saved methods
**Priority:** P1
**Acceptance Criteria:**
- Show: type, masked data, last used, is_default

---

#### FR17: One-Click Charge
**Description:** Charge using saved token
**Priority:** P1
**Acceptance Criteria:**
- POST /v2/charge with saved token_id
- No re-entry of card details
- 3DS may still trigger (bank rules)

---

### 1.5 Disbursement (FR18-FR20)

#### FR18: Single Disbursement
**Description:** Payout to bank account (affiliate commission)
**Priority:** P1
**Acceptance Criteria:**
- Input: amount, bank_code, account_number, account_holder_name
- API call to Midtrans
- Webhook on settlement
- Email confirmation to beneficiary

**API Endpoint:**
```
POST https://api.sandbox.midtrans.com/v1/disbursements
Authorization: Basic {base64(serverKey:)}

Request:
{
  "reference_id": "PAYOUT-2026-001",
  "amount": 500000,
  "bank_account": {
    "bank_code": "014",
    "account_number": "1234567890",
    "account_holder_name": "John Doe"
  }
}

Response (200):
{
  "disbursement_id": "...",
  "reference_id": "PAYOUT-2026-001",
  "amount": 500000,
  "status": "queued",
  "created_at": "2026-08-15T10:00:00Z"
}
```

---

#### FR19: Batch Disbursement
**Description:** Payout to multiple recipients
**Priority:** P2
**Acceptance Criteria:**
- Array of disbursements (up to 500 per request)
- Single webhook for entire batch

---

#### FR20: Get Disbursement Status
**Description:** Track payout progress
**Priority:** P1
**Acceptance Criteria:**
- Query by disbursement_id or reference_id
- Show: amount, status (queued, sent, failed), settlement_time

**API Endpoint:**
```
GET https://api.sandbox.midtrans.com/v1/disbursements/{disbursement_id}
Authorization: Basic {base64(serverKey:)}

Response (200):
{
  "disbursement_id": "...",
  "status": "sent"|"failed",
  "settlement_time": "2026-08-16T10:00:00Z"
}
```

---

### 1.6 Admin Dashboard (FR21-FR28)

#### FR21: Customer Management
**FR:** List all dnPeople customers, detail, impersonate, block, extend trial

#### FR22: Subscription Management
**FR:** View all subscriptions, pause/resume/cancel, manual charge trigger

#### FR23: Payment Analytics
**FR:** MRR/ARR, revenue by tier, churn rate, payment success rate by method

#### FR24: Support Tickets
**FR:** Queue payment-related support tickets, message thread, KB suggestions

#### FR25: Feature Flags
**FR:** Toggle features per merchant, rollout %, audit history

#### FR26: Webhook Monitoring
**FR:** View all webhooks, delivery status, retry history, payload inspection

#### FR27: Disbursement Tracker
**FR:** View payouts, affiliate commission, status

#### FR28: System Health
**FR:** API latency, error rate, database health, Midtrans connectivity

---

## 2. Non-Functional Requirements (NFR)

### NFR1: Security
- **Server Key:** env variable only, never hardcode
- **Client Key:** frontend env, public is OK
- **Webhook Signature:** HMAC-SHA512 verification
- **PII Masking:** logs mask email/phone after 3 chars
- **Audit Trail:** immutable log of refunds + admin actions
- **Refund Logging:** admin_id + timestamp + reason

### NFR2: Reliability
- **Uptime Target:** 99.5% (18 min/month acceptable)
- **Idempotency:** Duplicate webhook → no double entry
- **Retry Logic:** 3× exponential backoff for Midtrans calls
- **Fallback:** Manual payment instructions if Midtrans down > 1h
- **Webhook Retry:** Midtrans auto-retry 5× in 24h

### NFR3: Performance
- **Payment Init:** < 2s
- **Webhook Processing:** < 1s
- **Admin Dashboard:** < 3s (10K+ records)
- **Payment List Load:** < 3s (with filters)

### NFR4: Recoverability
- **Daily Backup:** Encrypted to S3
- **RTO:** 4h from backup
- **Database Transaction:** SERIALIZABLE for payment updates
- **Webhook Log:** Queryable for manual replay

### NFR5: Auditability
- **payment_audit_log:** Append-only, immutable
- **webhook_log:** All attempts logged
- **refund_log:** Admin + timestamp + reason
- **Retention:** 7 years for audit

---

## 3. Integration Requirements

### IR1: Midtrans SNAP API
- **URL:** `https://app.sandbox.midtrans.com/snap/v1/transactions`
- **Auth:** Basic Auth (Server Key)
- **Idempotency:** order_id unique per 30 min

### IR2: Midtrans Core API
- **URL:** `https://app.sandbox.midtrans.com/v2/charge`
- **Auth:** Basic Auth (Server Key)
- **Methods:** Card, Bank Transfer, E-Wallet per endpoint

### IR3: Midtrans Status API
- **URL:** `https://api.sandbox.midtrans.com/v2/{transaction_id}/status`
- **Auth:** Basic Auth (Server Key)
- **Use:** Daily reconciliation

### IR4: Midtrans Webhook
- **Endpoint:** Our `/api/v1/webhooks/midtrans`
- **Auth:** X-Midtrans-Signature header
- **Configure:** Midtrans Dashboard → Settings → Webhook URLs
- **Retry:** Auto 5× over 24h

### IR5: Midtrans Recurring API
- **URL:** `https://app.sandbox.midtrans.com/v2/recurring/{subscription_id}/charge`
- **Auth:** Basic Auth (Server Key)
- **Subscription Management:** PATCH, DELETE

### IR6: Midtrans Disbursement API
- **URL:** `https://api.sandbox.midtrans.com/v1/disbursements`
- **Auth:** Basic Auth (Server Key)
- **Bank Codes:** BCA (014), Mandiri (008), BNI (009), BRI (002), CIMB (022)

### IR7: Midtrans Iris API
- **URL:** `https://app.sandbox.midtrans.com/v1/iris/payouts/api/...`
- **Auth:** Basic Auth (Server Key)
- **Bulk Payout:** Up to 500 recipients per request

---

## 4. Sandbox Testing Checklist

### 4.1 Card Payment Tests
- [ ] Visa Accept (3DS 2 frictionless)
- [ ] Visa Deny (bank reject)
- [ ] MC Accept + Deny
- [ ] AMEX Accept + Deny
- [ ] 3DS Challenge (OTP required)
- [ ] Installment (6, 12 months)
- [ ] Bank-specific cards (Mandiri, CIMB, BCA, BNI, BRI)

### 4.2 E-Wallet Tests
- [ ] GoPay (QR code simulator)
- [ ] OVO (success + error test numbers)
- [ ] ShopeePay (QR code)
- [ ] QRIS (unified QR)
- [ ] GoPay Tokenization (save + one-click)

### 4.3 Bank Transfer Tests
- [ ] BCA VA (simulator)
- [ ] Mandiri VA (simulator)
- [ ] BNI VA (simulator)
- [ ] BRI VA (simulator)
- [ ] Permata, CIMB, BSI, Danamon VAs

### 4.4 Convenience Store Tests
- [ ] Indomaret (payment code)
- [ ] Alfamart (payment code)
- [ ] Kioson (payment code)

### 4.5 Checkout Interface Tests
- [ ] SNAP: All 15 methods loaded correctly
- [ ] Core API: Card endpoint
- [ ] Core API: Bank Transfer endpoint
- [ ] Core API: E-Wallet endpoint
- [ ] Payment Link: Link generation + shareable

### 4.6 Subscription Tests
- [ ] First charge with save_card: true
- [ ] Subsequent charge via subscription_id
- [ ] Pause subscription (skip_cycle: 1)
- [ ] Resume subscription
- [ ] Cancel subscription

### 4.7 Webhook Tests
- [ ] Webhook signature verification (pass)
- [ ] Webhook signature verification (fail) → reject
- [ ] Duplicate webhook → idempotent (no double entry)
- [ ] All status transitions (pending → settlement → refund)
- [ ] Webhook delivery latency < 1s

### 4.8 Refund Tests
- [ ] Manual refund (full amount)
- [ ] Manual refund (partial amount)
- [ ] Refund status tracking
- [ ] Cannot refund deny status
- [ ] Admin audit log created

### 4.9 Disbursement Tests
- [ ] Single payout to BCA
- [ ] Single payout to Mandiri
- [ ] Batch payout (5 recipients)
- [ ] Disbursement status tracking
- [ ] Webhook on settlement

### 4.10 Admin Dashboard Tests
- [ ] Payment list filtering (status, date, customer, method)
- [ ] Payment detail view
- [ ] Subscription list + manage
- [ ] Refund button (manual refund flow)
- [ ] Analytics dashboard (MRR, ARR, churn)
- [ ] Feature flags toggle
- [ ] Webhook log inspection
- [ ] Disbursement tracker

### 4.11 Error Handling Tests
- [ ] Invalid JWT → 401
- [ ] Missing amount → 400
- [ ] Payment not found → 404
- [ ] Cannot refund (wrong status) → 400
- [ ] Midtrans API down → 503

### 4.12 Security Tests
- [ ] Server Key not hardcoded
- [ ] Client Key safe in frontend env
- [ ] Webhook signature verified
- [ ] PII masked in logs
- [ ] Admin audit trail logged

---

## 5. Sandbox Configuration

**Credentials (.env.sandbox):**
```
MIDTRANS_SERVER_KEY_SANDBOX=SB-Mid-server-xxx
MIDTRANS_CLIENT_KEY_SANDBOX=SB-Mid-client-xxx
MIDTRANS_API_BASE_URL=https://app.sandbox.midtrans.com
MIDTRANS_API_STATUS_URL=https://api.sandbox.midtrans.com
MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/v1/transactions
DATABASE_URL=postgresql://user:pass@localhost:5432/dnpeople_dev
SENDGRID_API_KEY=SG-xxx
```

**Webhook Configuration:**
- Dashboard → Settings → Webhook URLs
- POST `https://our-server.com/api/v1/webhooks/midtrans`

**Enabled Payment Methods:**
- ✓ Credit Card (Visa, MC, AMEX)
- ✓ GoPay, OVO, ShopeePay, QRIS
- ✓ Bank Transfer (all 8 banks)
- ✓ Convenience Store
- ✓ Cardless Credit
- ✓ Google Pay (production only)

---

## 6. Tier Visibility Matrix

```
FREE:
  ✗ No payments

STARTER:
  ✓ SNAP (Card, GoPay, OVO, ShopeePay, QRIS, Bank VA)
  ✓ Core API (Card, Bank, E-Wallet)
  ✓ Payment Link
  ✓ Subscription (recurring)
  ✓ Account Linking (tokenization)
  ✗ Convenience Store
  ✗ Cardless Credit
  ✗ Installment
  ✗ Disbursement

PROFESSIONAL:
  ✓ All STARTER +
  ✓ Convenience Store
  ✓ Cardless Credit
  ✗ Installment
  ✗ Google Pay
  ✗ Disbursement

BUSINESS:
  ✓ All PROFESSIONAL +
  ✓ Installment
  ✓ Google Pay
  ✓ Disbursement (affiliate)

ENTERPRISE:
  ✓ All BUSINESS +
  ✓ Iris API (bulk payout)
  ✓ Custom features
```

---

## 7. API Reference Summary

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/snap/v1/transactions` | POST | Generate SNAP token | Server Key |
| `/v2/charge` | POST | Core API charge | Server Key |
| `/v2/{transaction_id}/status` | GET | Get payment status | Server Key |
| `/v2/{transaction_id}/refund` | POST | Refund payment | Server Key |
| `/v2/token` | GET | Tokenize card (frontend) | Client Key |
| `/v2/recurring/{id}/charge` | POST | Charge subscription | Server Key |
| `/v2/subscription/{id}` | PATCH/DELETE | Manage subscription | Server Key |
| `/v1/disbursements` | POST | Single payout | Server Key |
| `/v1/disbursements/{id}` | GET | Payout status | Server Key |
| `/api/v1/webhooks/midtrans` | POST | Webhook receiver | Signature |

---

**Version:** 2.0 (Comprehensive)  
**Last Updated:** 26 Juli 2026

# dnPeople Midtrans Payment Integration (Sandbox)
## Software Requirements Specification (SRS) v1.0

**Bahasa:** Bahasa Indonesia  
**Mata Uang:** IDR (Rp)  
**Tanggal:** 26 Juli 2026  
**Status:** Sandbox Testing Phase  

---

## 1. Requirement Breakdown

### 1.1 Functional Requirements (FR)

#### FR1: Initialize Payment Transaction
**Description:** Backend generate payment request ke Midtrans & get snap_token  
**Priority:** P0 (Critical)  
**Acceptance Criteria:**
- Input: {order_id, gross_amount, customer_name, customer_email, customer_phone, items, payment_method_preference}
- Output: {snap_token, transaction_id, expires_at}
- Idempotency: same order_id + amount → same snap_token (valid for 30 min)
- Error handling: if Midtrans down → return 503 with retry_after header
- Logging: log all Midtrans requests/responses (PII sanitized)

**API Endpoint:**
```
POST /api/v1/payments/initiate-payment
Authorization: Bearer {jwt_token}
Content-Type: application/json

Request Body:
{
  "invoice_id": "INV-2026-001" | null,
  "subscription_id": "SUB-2026-001" | null,
  "gross_amount": 600000,
  "customer_details": {
    "email": "admin@company.com",
    "phone": "62812345678",
    "first_name": "John",
    "last_name": "Doe"
  },
  "items": [
    {
      "id": "STARTER-30EMP",
      "name": "Subscription STARTER - 30 employees",
      "price": 20000,
      "quantity": 30,
      "category": "subscription"
    }
  ]
}

Response (200):
{
  "payment_id": "PAY-20260815-abc123",
  "snap_token": "SNAP-{long_token_string}",
  "transaction_id": "TRX-2026-001",
  "gross_amount": 600000,
  "expires_at": "2026-08-15T10:30:00Z"
}

Response (400 - Validation Error):
{
  "error_code": "INVALID_AMOUNT",
  "message": "Amount must be > 0"
}

Response (401 - Unauthorized):
{
  "error_code": "UNAUTHORIZED",
  "message": "Invalid or expired JWT token"
}

Response (503 - Provider Down):
{
  "error_code": "PROVIDER_UNAVAILABLE",
  "message": "Payment provider temporarily unavailable",
  "retry_after": 60
}
```

---

#### FR2: Receive & Process Webhook
**Description:** Midtrans send payment status update via HTTP POST  
**Priority:** P0 (Critical)  
**Acceptance Criteria:**
- Verify webhook signature (HMAC-SHA512)
- Extract transaction_id, status, fraud_status
- Update Payment table status
- Idempotent: duplicate webhook = no double entry
- Async processing (use queue if needed)
- Response immediately with 200 OK (within 5s)

**Webhook Endpoint:**
```
POST /api/v1/webhooks/midtrans
Content-Type: application/json
X-Midtrans-Signature: {hmac_sha512_signature}

Request Body (from Midtrans):
{
  "transaction_id": "2026081500000001",
  "order_id": "ORDER-2026-001",
  "merchant_id": "G123456789",
  "gross_amount": "600000.00",
  "currency": "IDR",
  "payment_type": "credit_card",
  "transaction_time": "2026-08-15 10:30:00",
  "transaction_status": "settlement" | "pending" | "deny",
  "fraud_status": "accept" | "deny",
  "settlement_time": "2026-08-15 10:35:00",
  "status_code": "200",
  "signature_key": "...",
  "va_numbers": [...],
  "expiry_time": "2026-08-15 11:00:00"
}

Response (200 OK):
{
  "status": "ok",
  "message": "Webhook processed"
}

Response (400 - Invalid Signature):
{
  "status": "error",
  "message": "Invalid signature"
}
```

---

#### FR3: Get Payment Status
**Description:** Frontend/Admin query payment status  
**Priority:** P1 (High)  
**Acceptance Criteria:**
- Lookup by payment_id, transaction_id, or order_id
- Return: status, fraud_status, settled_at, customer_name, amount
- Admin can see all, customer see only own

**API Endpoint:**
```
GET /api/v1/payments/{payment_id}
Authorization: Bearer {jwt_token}

Response (200):
{
  "payment_id": "PAY-20260815-abc123",
  "order_id": "ORDER-2026-001",
  "transaction_id": "2026081500000001",
  "status": "settlement",
  "fraud_status": "accept",
  "gross_amount": 600000,
  "payment_method": "credit_card",
  "payment_method_detail": {
    "type": "credit_card",
    "card_number": "1111",
    "bank": "BCA"
  },
  "settled_at": "2026-08-15T10:35:00Z",
  "customer_name": "John Doe",
  "customer_email": "john@company.com"
}
```

---

#### FR4: List Payments (Admin Dashboard)
**Description:** Admin see payment list with filtering  
**Priority:** P1 (High)  
**Acceptance Criteria:**
- Filter: status, date_range, customer_name, payment_method, amount_range
- Sort: settled_at DESC, created_at DESC
- Pagination: limit 20, offset/cursor
- Performance: < 3s even with 10K+ records

**API Endpoint:**
```
GET /api/v1/payments?status=settlement&from_date=2026-08-01&to_date=2026-08-31&limit=20&offset=0
Authorization: Bearer {admin_jwt}

Query Params:
- status: pending | settlement | deny | refund | all
- from_date: ISO 8601 date
- to_date: ISO 8601 date
- payment_method: credit_card | bank_transfer | gopay | ovo | qris | cstore | all
- customer_name: string (search)
- amount_min: number
- amount_max: number
- limit: 1-100 (default 20)
- offset: number (default 0)

Response (200):
{
  "data": [
    {
      "payment_id": "PAY-20260815-abc123",
      "order_id": "ORDER-2026-001",
      "customer_name": "John Doe",
      "company_name": "PT ABC",
      "gross_amount": 600000,
      "payment_method": "credit_card",
      "status": "settlement",
      "settled_at": "2026-08-15T10:35:00Z"
    },
    ...
  ],
  "pagination": {
    "total": 245,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

---

#### FR5: Manual Refund (Admin)
**Description:** Admin trigger refund untuk specific payment  
**Priority:** P1 (High)  
**Acceptance Criteria:**
- Only settlement status → can refund
- Log: admin_id, timestamp, reason, amount
- Call Midtrans API to process refund
- Update DB status → refund/partial_refund
- Send email to customer

**API Endpoint:**
```
POST /api/v1/payments/{payment_id}/refund
Authorization: Bearer {admin_jwt}
Content-Type: application/json

Request Body:
{
  "refund_amount": 600000,
  "reason": "Customer request" | "Billing error" | "Duplicate payment" | "Other"
}

Response (200):
{
  "refund_id": "REFUND-20260815-xyz",
  "payment_id": "PAY-20260815-abc123",
  "refund_amount": 600000,
  "status": "processed",
  "processed_at": "2026-08-15T10:40:00Z",
  "message": "Refund initiated, customer will receive within 1-3 business days"
}

Response (400 - Cannot Refund):
{
  "error_code": "CANNOT_REFUND",
  "message": "Payment status is 'deny', cannot refund"
}
```

---

#### FR6: Subscription Auto-Charge
**Description:** Cron job auto-charge subscription setiap bulan  
**Priority:** P0 (Critical)  
**Acceptance Criteria:**
- Runs on 1st of month @ 00:00 UTC
- For each active subscription: generate payment + send email
- If fail: retry 3× (with exponential backoff), send alert to finance

**Implementation Detail:**
- Scheduled job: `0 0 1 * *` (cron)
- Query: `SELECT * FROM Subscription WHERE status='active' AND pause_until < NOW()`
- For each: call FR1 (initiate payment) + send email
- If FR1 fails: create JobRetry record, retry after 1h, 3h, 24h
- If all retry fail: create FinanceAlert

---

#### FR7: Invoice Payment Link (Customer)
**Description:** Customer click "Pay Now" on unpaid invoice  
**Priority:** P1 (High)  
**Acceptance Criteria:**
- Landing page with invoice detail: INV-#, amount, due_date
- Click "Pay Now" → call FR1 + load SNAP
- Success → send receipt + mark invoice paid
- Fail/Pending → show status, allow retry

**Page: `/payment/invoice/{invoice_id}`**
- Public link (no login required, but customer can only access own invoice via token)
- Show: invoice detail, amount, breakdown
- Button: "Pay Now" → load SNAP modal
- After payment: show receipt, email sent confirmation

---

#### FR8: Refund Status Tracking
**Description:** Track refund progress after initiated  
**Priority:** P2 (Medium)  
**Acceptance Criteria:**
- Webhook from Midtrans when refund processed
- Update PaymentRefund table: status → processed
- Send email to customer: refund confirmation

**Webhook for Refund:**
```
POST /api/v1/webhooks/midtrans (same endpoint)
{
  "transaction_id": "2026081500000001",
  "order_id": "ORDER-2026-001",
  "transaction_status": "refund",
  "refund_amount": 600000,
  "settlement_time": "2026-08-17T10:00:00" (2 days later)
}
```

---

### 1.2 Non-Functional Requirements (NFR)

#### NFR1: Security
**Requirement:** Protect API keys, verify webhook signature, prevent fraud  
**Details:**
- Server Key: env variable `MIDTRANS_SERVER_KEY_SANDBOX` (never hardcode)
- Client Key: env variable `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_SANDBOX` (frontend)
- Webhook signature: HMAC-SHA512 using Server Key
  - Formula: `SHA512(order_id + settlement_status + gross_amount + SERVER_KEY)`
  - Extract from X-Midtrans-Signature header, compare
- PII in logs: mask email/phone after 3 chars (e.g., `john***@company.com`)
- Refund logging: log admin_id + timestamp + reason (immutable audit trail)

#### NFR2: Reliability
**Requirement:** High availability for payment system  
**Details:**
- Uptime target: 99.5% (18 min down/month acceptable)
- Idempotency: duplicate webhook → no double entry
  - Check `Payment.transaction_id` in DB before updating
  - Use DB transaction (SERIALIZABLE isolation)
- Retry logic:
  - API call to Midtrans fail → retry 3× with exponential backoff (1s, 3s, 9s)
  - Webhook delivery fail (return non-200) → Midtrans retry auto (5× in 24h)
- Fallback: if Midtrans down > 1h, send manual payment instructions to customer

#### NFR3: Performance
**Requirement:** Fast payment experience  
**Details:**
- Payment initiation: < 2s (API call + DB write)
- Webhook processing: < 1s (sync), < 5s (if async)
- Admin dashboard query: < 3s (even 10K+ records, use DB index on status, created_at)
- SNAP load time: < 2s (Midtrans manages, we just embed)

#### NFR4: Recoverability
**Requirement:** Recover from failures  
**Details:**
- Webhook delivery fail → Midtrans retry, plus we reconcile daily vs API
- Payment initiation fail → customer retry (click Pay again)
- Database backup: daily encrypted backup to S3
- Disaster recovery: restore from backup within 4h

#### NFR5: Auditability
**Requirement:** Full audit trail  
**Details:**
- Immutable log table: `PaymentAuditLog` (append-only)
  - Log: payment_id, action (initiated, settled, deny, refund), actor_id, timestamp, before/after state
- Refund approval: log admin_id, reason, amount
- All Midtrans API response: store in `Payment.midtrans_response_full` (JSON)

---

### 1.3 Integration Requirements

#### IR1: Midtrans SNAP
**API:** POST `https://app.sandbox.midtrans.com/snap/v1/transactions`  
**Authentication:** Basic Auth (Server Key + empty password, base64 encoded)  
**Request:**
```json
{
  "transaction_details": {
    "order_id": "ORDER-2026-001",
    "gross_amount": 600000
  },
  "customer_details": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@company.com",
    "phone": "62812345678"
  },
  "item_details": [
    {
      "id": "ITEM-001",
      "name": "Subscription STARTER",
      "price": 600000,
      "quantity": 1
    }
  ],
  "enabled_payments": ["credit_card", "bank_transfer", "gopay", "qris"],
  "expiry": {
    "start_time": "2026-08-15T10:00:00+07:00",
    "unit": "minutes",
    "duration": 30
  }
}
```
**Response:** `{snap_token, redirect_url, transaction_id, ...}`

#### IR2: Midtrans Webhook
**Endpoint:** Our `/api/v1/webhooks/midtrans`  
**Auth:** X-Midtrans-Signature header (HMAC-SHA512)  
**Configure in:** Midtrans Dashboard → Settings → Webhook URLs  
**Retry:** Midtrans retry 5× in 24h if we return non-200  
**Signature Verification:**
```javascript
const crypto = require('crypto');
const serverKey = process.env.MIDTRANS_SERVER_KEY_SANDBOX;
const receivedSignature = req.headers['x-midtrans-signature'];
const body = JSON.stringify(req.body); // raw body, not parsed
const hash = crypto.createHmac('sha512', serverKey).update(body).digest('hex');
if (hash !== receivedSignature) throw new Error('Invalid signature');
```

#### IR3: Midtrans Get Status API
**API:** GET `https://api.sandbox.midtrans.com/v2/{transaction_id}/status`  
**Use case:** Reconcile payment status daily  
**Response:** current transaction_status, fraud_status, settlement_time, etc

#### IR4: Midtrans Refund API
**API:** POST `https://api.sandbox.midtrans.com/v2/{transaction_id}/refund`  
**Request:**
```json
{
  "refund_amount": 600000,
  "reason": "Customer request"
}
```
**Response:** refund_key, refund_amount, refund_status (pending/completed)

---

## 2. API Reference

### 2.1 Payment Endpoints Summary

| HTTP | Endpoint | Auth | Role | Description |
|------|----------|------|------|-------------|
| POST | `/api/v1/payments/initiate-payment` | JWT | CUSTOMER, ADMIN | Start payment process |
| GET | `/api/v1/payments/{payment_id}` | JWT | CUSTOMER, ADMIN | Get payment detail |
| GET | `/api/v1/payments` | JWT | ADMIN | List payments (filter+sort) |
| POST | `/api/v1/payments/{payment_id}/refund` | JWT | ADMIN | Initiate refund |
| GET | `/api/v1/payments/{payment_id}/refund-status` | JWT | ADMIN, CUSTOMER | Get refund status |
| POST | `/api/v1/webhooks/midtrans` | Signature | PUBLIC | Receive webhook from Midtrans |

### 2.2 Error Codes & Responses

| HTTP | Code | Scenario | Message |
|------|------|----------|---------|
| 200 | OK | Success | Request processed |
| 400 | INVALID_AMOUNT | Amount ≤ 0 or invalid | "Amount must be > 0" |
| 400 | INVALID_INVOICE | Invoice not found or already paid | "Invoice not found" |
| 400 | INVALID_SIGNATURE | Webhook signature mismatch | "Invalid signature" |
| 400 | CANNOT_REFUND | Payment status not settlement | "Payment status is {status}, cannot refund" |
| 401 | UNAUTHORIZED | Invalid JWT or expired | "Invalid or expired token" |
| 403 | FORBIDDEN | Customer trying to access other customer's payment | "Access denied" |
| 404 | NOT_FOUND | Payment ID doesn't exist | "Payment not found" |
| 500 | INTERNAL_ERROR | Server error | "Internal server error" |
| 503 | PROVIDER_UNAVAILABLE | Midtrans API down | "Payment provider unavailable, retry after 60s" |

---

## 3. Payment Methods (Sandbox)

### 3.1 Credit Card (Visa/MC/AMEX)

| Card Type | Card Number | Status | OTP | Expires |
|-----------|-------------|--------|-----|---------|
| VISA | 4811111111111114 | ACCEPT (full auth) | 112233 | any future |
| VISA | 4911111111111113 | DENY (bank) | 112233 | any future |
| MC | 5211111111111117 | ACCEPT (full auth) | 112233 | any future |
| MC | 5111111111111118 | DENY (bank) | 112233 | any future |
| AMEX | 3701921697224585 | ACCEPT (full auth) | 112233 | any future |
| AMEX | 3742963544008815 | DENY (bank) | 112233 | any future |

**CVV:** 123 (any 3 digits OK)  
**Expiry:** 02/2030 (month/year, any future month/year OK)

### 3.2 Bank Transfer / Virtual Account

**Supported Banks (Sandbox):**
- BCA Virtual Account → Simulator: `simulator.sandbox.midtrans.com/bca/va/index`
- Mandiri Bill Payment → Simulator: `simulator.sandbox.midtrans.com/openapi/va?bank=mandiri`
- BNI Virtual Account → Simulator: `simulator.sandbox.midtrans.com/bni/va/index`
- Permata Virtual Account → Simulator: `simulator.sandbox.midtrans.com/openapi/va?bank=permata`

**Flow:**
1. We generate VA (auto-generated by Midtrans)
2. Customer see VA number in SNAP
3. Customer login to bank (netbanking/ATM/SMS)
4. Customer input VA number + amount
5. Midtrans webhook → we update status

### 3.3 E-Wallet (GoPay, OVO, ShopeePay)

**GoPay (Desktop):**
- Show QR code image in SNAP
- Customer scan QR with GoPay app
- Simulator: `simulator.sandbox.midtrans.com/v2/gopay/ui/index`

**GoPay (Mobile):**
- Auto-redirect to GoPay app (deeplink)

**OVO:**
- Phone number required
- Test numbers:
  - `+628123456789` → ACCEPT
  - `+628249134000` → ERROR (phone not registered)

**ShopeePay:**
- Show QR code → scan with ShopeePay app
- Simulator: `simulator.sandbox.midtrans.com/v2/qris/index`

### 3.4 QRIS (Unified QR)

- Midtrans generate QR image (static per transaction)
- Customer scan with any QRIS-compatible app (GoPay, OVO, LinkAja, etc)
- Simulator: `simulator.sandbox.midtrans.com/v2/qris/index`

### 3.5 Convenience Store (Indomaret, Alfamart)

**Indomaret:**
- Generate payment code (e.g., `P-2026081500000001`)
- Customer go to Indomaret → input code at counter
- Cashier receive payment
- Simulator: `simulator.sandbox.midtrans.com/indomaret/phoenix/index`

**Alfamart:**
- Generate payment code
- Customer go to Alfamart → input code at terminal
- Simulator: `simulator.sandbox.midtrans.com/alfamart/index`

---

## 4. Transaction Status Transitions

```
┌─────────────────────────────────────────────────────────────┐
│ PENDING (customer dalam payment gateway, belum selesai)      │
│   ↓                                                          │
│   ├─→ SETTLEMENT (payment clear, dana aman) ← (target)      │
│   ├─→ DENY (rejected by bank/FDS/customer cancel)           │
│   └─→ EXPIRED (customer tidak selesai dalam waktu)          │
└─────────────────────────────────────────────────────────────┘

SETTLEMENT:
  └─→ REFUND (admin initiate refund)
      └─→ PARTIAL_REFUND (partial refund processed)
```

**Status Definitions:**
- **pending:** Transaction registered, awaiting payment action by customer
- **settlement:** Payment received & cleared, 100% safe
- **deny:** Rejected (fraud, insufficient funds, bank decline, customer cancel)
- **expired:** Customer timeout (usually 30 min)
- **refund:** Full refund processed back to customer
- **partial_refund:** Partial refund (customer receive partial amount back)

---

## 5. Database Schema

### Table: Payment
```sql
CREATE TABLE payment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  order_id VARCHAR(100) NOT NULL UNIQUE,
  transaction_id VARCHAR(100) UNIQUE,
  snap_token VARCHAR(500),
  
  payment_type VARCHAR(50), -- 'credit_card', 'bank_transfer', 'gopay', 'ovo', 'qris', 'cstore'
  payment_method_bank VARCHAR(50), -- 'bca', 'mandiri', 'bni', etc (for VA)
  
  gross_amount DECIMAL(19,2) NOT NULL,
  settlement_amount DECIMAL(19,2),
  
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, settlement, deny, refund, partial_refund
  fraud_status VARCHAR(50), -- accept, deny, challenge
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  settled_at TIMESTAMP,
  expires_at TIMESTAMP,
  
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  
  subscription_id UUID REFERENCES subscription(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoice(id) ON DELETE SET NULL,
  
  description TEXT,
  notes TEXT,
  
  midtrans_response_full JSONB,
  
  created_by UUID REFERENCES "user"(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT order_id_unique UNIQUE(order_id),
  INDEX idx_company_id (company_id),
  INDEX idx_order_id (order_id),
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_payment_status (payment_status),
  INDEX idx_created_at (created_at DESC),
  INDEX idx_settled_at (settled_at DESC)
);

CREATE TABLE payment_refund (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payment(id) ON DELETE CASCADE,
  
  refund_amount DECIMAL(19,2) NOT NULL,
  refund_status VARCHAR(50) NOT NULL DEFAULT 'requested', -- requested, processed, failed
  
  midtrans_refund_id VARCHAR(100) UNIQUE,
  
  initiated_by UUID NOT NULL REFERENCES "user"(id),
  reason TEXT NOT NULL,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP,
  
  notes TEXT,
  
  INDEX idx_payment_id (payment_id),
  INDEX idx_refund_status (refund_status),
  INDEX idx_created_at (created_at DESC)
);

CREATE TABLE payment_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payment(id) ON DELETE CASCADE,
  
  action VARCHAR(100) NOT NULL, -- initiated, settled, denied, refunded, etc
  actor_id UUID REFERENCES "user"(id), -- null for webhook
  actor_type VARCHAR(50), -- 'admin', 'system', 'webhook'
  
  before_state JSONB,
  after_state JSONB,
  
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  
  INDEX idx_payment_id (payment_id),
  INDEX idx_timestamp (timestamp DESC)
);
```

---

## 6. Sandbox Testing Checklist

**Payment Methods:**
- [ ] Credit Card (Visa accept + deny)
- [ ] Credit Card (MC accept + deny)
- [ ] Bank Transfer (BCA VA)
- [ ] Bank Transfer (Mandiri VA)
- [ ] E-Wallet (GoPay via QR)
- [ ] E-Wallet (OVO accept + error)
- [ ] QRIS (unified QR)
- [ ] Convenience Store (Indomaret)

**Status Transitions:**
- [ ] pending → settlement (happy path)
- [ ] pending → deny (bank reject)
- [ ] settlement → refund (manual refund)
- [ ] settlement → partial_refund

**Webhook Handling:**
- [ ] Webhook signature verification (pass)
- [ ] Webhook signature verification (fail/invalid)
- [ ] Duplicate webhook → no double entry
- [ ] Webhook processing < 1s
- [ ] Email sent after settlement

**Admin Dashboard:**
- [ ] List payments (filter by status)
- [ ] List payments (filter by date range)
- [ ] List payments (search customer)
- [ ] Payment detail view
- [ ] Refund action
- [ ] Refund status tracking

**Error Handling:**
- [ ] Invalid JWT → 401
- [ ] Missing amount → 400
- [ ] Non-existent payment → 404
- [ ] Cannot refund (wrong status) → 400
- [ ] Midtrans API down → 503 with retry_after

**Security:**
- [ ] Server Key not hardcoded
- [ ] Client Key not hardcoded
- [ ] Webhook signature verified
- [ ] PII masked in logs
- [ ] Admin audit trail logged

---

## 7. Sandbox Configuration

**Midtrans Account Setup:**
```
Environment: Sandbox
URL: https://dashboard.sandbox.midtrans.com
Credentials: [provided by Midtrans during onboarding]

API Keys:
  Server Key: SB-Mid-server-xxx (keep secret)
  Client Key: SB-Mid-client-xxx (safe to expose in frontend)

Webhook URL Configuration:
  POST https://our-server.com/api/v1/webhooks/midtrans

Payment Methods Enabled:
  ✓ Credit Card
  ✓ Bank Transfer (BCA, Mandiri, BNI, etc)
  ✓ GoPay
  ✓ QRIS
  ✓ Convenience Store
  ✓ OVO
  ✓ ShopeePay

Notification Methods:
  ✓ Webhook (to our endpoint)
  ✓ Email (from Midtrans)
```

**Environment Variables (.env.sandbox):**
```
MIDTRANS_SERVER_KEY_SANDBOX=SB-Mid-server-xxx
MIDTRANS_CLIENT_KEY_SANDBOX=SB-Mid-client-xxx
MIDTRANS_API_BASE_URL=https://app.sandbox.midtrans.com
MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/v1/transactions
MIDTRANS_STATUS_URL=https://api.sandbox.midtrans.com/v2/{transaction_id}/status
MIDTRANS_WEBHOOK_PATH=/api/v1/webhooks/midtrans
```

---

**Version:** 1.0  
**Last Updated:** 26 Juli 2026

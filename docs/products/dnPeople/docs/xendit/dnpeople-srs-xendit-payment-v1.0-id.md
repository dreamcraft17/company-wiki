# dnPeople Xendit Payment Integration
## Software Requirements Specification (SRS) v1.0

**Bahasa:** Bahasa Indonesia  
**Mata Uang:** IDR (Rp)  
**Tanggal:** 8 Agustus 2026  
**Status:** Implemented in repo (Aug 2026) — FR1–FR2 core done; full PRD scope partial  

> **Kode aktual:** Invoice API v2 (bukan Payment Request API). Setup: [XENDIT-PAYMENT-SETUP.md](./XENDIT-PAYMENT-SETUP.md)

---

## 1. FUNCTIONAL REQUIREMENTS (FR)

### FR1: Create Payment Request (Hosted Checkout)
**Description:** Backend create payment request, customer redirect to Xendit hosted page
**Priority:** P0
**Acceptance Criteria:**
- Input: order_id, amount, customer details, payment methods, redirect URLs
- Output: payment_request_id, hosted_checkout_url
- Idempotency: same order_id returns same request (30 min window)
- Expiry: default 30 min (configurable)
- Webhook notification when completed

**API Endpoint:**
```
POST https://api.xendit.co/payment_requests
Authorization: Basic {base64(api_key:)}
Content-Type: application/json

Request:
{
  "reference_id": "ORDER-2026-001",
  "amount": 600000,
  "currency": "IDR",
  "description": "Subscription STARTER 30 emp",
  
  "customer": {
    "reference_id": "company-123",
    "name": "PT. ABC Indonesia",
    "email": "billing@abc.com",
    "phone_number": "+628123456789",
    "addresses": [{
      "country": "ID",
      "street": "Jl. Gatot Subroto 123",
      "city": "Jakarta",
      "postal_code": "12000",
      "state": "DKI Jakarta"
    }]
  },
  
  "items": [{
    "reference_id": "ITEM-STARTER-30",
    "name": "Subscription STARTER (30 karyawan)",
    "quantity": 1,
    "price": 600000,
    "category": "subscription",
    "url": "https://dnpeople.id/pricing/starter"
  }],
  
  "fees": [{
    "type": "ADMIN",
    "value": 0
  }],
  
  "payment_method": {
    "reusability": "SINGLE_USE"
  },
  
  "success_redirect_url": "https://dnpeople.id/dashboard?payment=success",
  "failure_redirect_url": "https://dnpeople.id/dashboard?payment=failed",
  "cancel_redirect_url": "https://dnpeople.id/dashboard?payment=cancelled",
  
  "metadata": {
    "company_id": "company-123",
    "tier": "STARTER",
    "employee_count": "30",
    "subscription_type": "monthly"
  },
  
  "expires_at": "2026-08-08T10:30:00Z"
}

Response (201):
{
  "id": "pr-eb55e8f2-79e7-4d56-a18b-cde521e20b54",
  "reference_id": "ORDER-2026-001",
  "business_id": "business-xxx",
  "customer": {...},
  "amount": 600000,
  "country": "ID",
  "currency": "IDR",
  "description": "Subscription STARTER 30 emp",
  "status": "PENDING",
  "payment_method": {...},
  "actions": [
    {
      "action": "REDIRECT",
      "url": "https://checkout.xendit.co/payment/..." // Customer redirect here
    }
  ],
  "created_at": "2026-08-08T10:00:00.000Z",
  "expires_at": "2026-08-08T10:30:00.000Z",
  "items": [...],
  "metadata": {...}
}
```

---

### FR2: Get Payment Request Status
**Description:** Query payment request status (admin dashboard, polling)
**Priority:** P1

**API Endpoint:**
```
GET https://api.xendit.co/payment_requests/{payment_request_id}
Authorization: Basic {base64(api_key:)}

Response (200):
{
  "id": "pr-eb55e8f2-79e7-4d56-a18b-cde521e20b54",
  "reference_id": "ORDER-2026-001",
  "status": "PENDING|COMPLETED|FAILED|EXPIRED",
  "amount": 600000,
  "payment": {
    "id": "py-xxx",
    "amount": 600000,
    "payment_method": "CARD|BANK_TRANSFER|EWALLET|INSTALLMENT",
    "payment_channel": "VISA|BCA|ID_GOPAY|ID_OVO",
    "status": "SUCCEEDED|FAILED|PENDING",
    "reference_id": "PAY-2026-001",
    "receipt_notification": {
      "email_to": "billing@abc.com",
      "cc_emails": ["finance@abc.com"]
    },
    "created_at": "2026-08-08T10:05:00Z",
    "updated_at": "2026-08-08T10:15:00Z"
  },
  "created_at": "2026-08-08T10:00:00Z",
  "expires_at": "2026-08-08T10:30:00Z"
}
```

---

### FR3: Cancel Payment Request
**Description:** Cancel payment request (before expiry or completion)
**Priority:** P1

**API Endpoint:**
```
PATCH https://api.xendit.co/payment_requests/{payment_request_id}/cancel
Authorization: Basic {base64(api_key:)}

Request:
{
  "reason": "REASON_FOR_CANCELLATION"
}

Response (200):
{
  "id": "pr-xxx",
  "status": "CANCELLED",
  "cancelled_at": "2026-08-08T10:10:00Z"
}
```

---

### FR4: Create Payment (Direct Charge)
**Description:** Direct charge API (custom UI, no redirect)
**Priority:** P0

**Card Charge:**
```
POST https://api.xendit.co/charges
Authorization: Basic {base64(api_key:)}

Request:
{
  "reference_id": "ORDER-2026-002",
  "currency": "IDR",
  "amount": 600000,
  "payment_method": "CARD",
  "card_data": {
    "token_id": "token-xxxx",  // From tokenize endpoint
    "cvv": "123"  // Optional jika token sudah tersimpan
  },
  "description": "Subscription payment",
  "metadata": {
    "company_id": "company-123",
    "tier": "STARTER"
  }
}

Response (200):
{
  "id": "ch-xxx",
  "reference_id": "ORDER-2026-002",
  "status": "SUCCEEDED|PENDING|FAILED|CAPTURED|NEEDS_ACTION",
  "amount": 600000,
  "currency": "IDR",
  "payment_method": "CARD",
  "card_data": {
    "token_id": "token-xxxx",
    "masked_card_number": "****1234",
    "card_brand": "VISA",
    "cardholder_name": "JOHN DOE"
  },
  "action": {
    "action_type": "REDIRECT|OTP|URL_REDIRECT",
    "url": "https://..."  // For 3DS redirect
  },
  "receipt_notification": {
    "email_to": "billing@abc.com"
  },
  "created_at": "2026-08-08T10:00:00Z"
}
```

**Bank Transfer Charge:**
```
POST https://api.xendit.co/charges
Authorization: Basic {base64(api_key:)}

Request:
{
  "reference_id": "ORDER-2026-003",
  "currency": "IDR",
  "amount": 600000,
  "payment_method": "BANK_TRANSFER",
  "bank_transfer_data": {
    "bank_code": "BCA|MANDIRI|BNI|BRI|CIMB|PERMATA|BSI|DANAMON|SEABANK|SAQU",
    "channel_properties": {
      "transfer_amount": 600000
    }
  },
  "description": "Subscription via bank transfer"
}

Response (200):
{
  "id": "ch-xxx",
  "status": "PENDING",
  "payment_method": "BANK_TRANSFER",
  "bank_transfer_data": {
    "bank_code": "BCA",
    "reference": "VA_xxxx_12345",  // Virtual account number
    "virtual_account_number": "1234567890",
    "account_holder_name": "PT ABC",
    "amount": 600000,
    "has_fixed_amount": true
  }
}
```

**E-Wallet Charge:**
```
POST https://api.xendit.co/charges
Authorization: Basic {base64(api_key:)}

Request:
{
  "reference_id": "ORDER-2026-004",
  "currency": "IDR",
  "amount": 600000,
  "payment_method": "EWALLET",
  "ewallet_data": {
    "channel_code": "ID_GOPAY|ID_OVO|ID_DANA|ID_LINKAJA|ID_SHOPEE_PAY",
    "channel_properties": {
      "success_redirect_url": "https://dnpeople.id/success",
      "mobile_number": "+628123456789"
    }
  }
}

Response (200):
{
  "id": "ch-xxx",
  "status": "PENDING",
  "payment_method": "EWALLET",
  "ewallet_data": {
    "channel_code": "ID_GOPAY",
    "digital_wallet_type": "GOPAY",
    "digital_wallet_id": "...",
    "phone_number": "+628123456789",
    "digital_wallet_status": "PENDING|AWAITING_PAYMENT"
  },
  "actions": [{
    "action_type": "REDIRECT",
    "url": "https://...",  // Customer redirect to GoPay
    "method": "GET"
  }]
}
```

---

### FR5: Get Payment Status
**Description:** Query payment charge status
**Priority:** P1

**API Endpoint:**
```
GET https://api.xendit.co/charges/{charge_id}
Authorization: Basic {base64(api_key:)}

Response (200):
{
  "id": "ch-xxx",
  "reference_id": "ORDER-2026-002",
  "status": "SUCCEEDED|PENDING|FAILED",
  "amount": 600000,
  "currency": "IDR",
  "payment_method": "CARD|BANK_TRANSFER|EWALLET",
  "payment_channel": "VISA|BCA|ID_GOPAY",
  "receipt_number": "receipt-xxx",
  "fraud_status": "ACCEPT|REJECT|CHALLENGE",
  "description": "Subscription payment",
  "metadata": {...},
  "created_at": "2026-08-08T10:00:00Z",
  "updated_at": "2026-08-08T10:15:00Z"
}
```

---

### FR6: Cancel Payment
**Description:** Cancel pending payment (before settlement)
**Priority:** P1

**API Endpoint:**
```
PATCH https://api.xendit.co/charges/{charge_id}/cancel
Authorization: Basic {base64(api_key:)}

Response (200):
{
  "id": "ch-xxx",
  "status": "CANCELLED",
  "cancelled_at": "2026-08-08T10:10:00Z"
}
```

---

### FR7: Capture Payment
**Description:** Capture hold (for authorized card payments)
**Priority:** P2

**API Endpoint:**
```
POST https://api.xendit.co/charges/{charge_id}/capture
Authorization: Basic {base64(api_key:)}

Request:
{
  "amount": 600000  // Partial capture (optional)
}

Response (200):
{
  "id": "ch-xxx",
  "status": "CAPTURED",
  "amount_captured": 600000,
  "captured_at": "2026-08-08T10:10:00Z"
}
```

---

### FR8: Create Payment Token
**Description:** Tokenize card (save untuk one-click)
**Priority:** P1

**API Endpoint:**
```
POST https://api.xendit.co/payment_methods/create_authorization
Authorization: Basic {base64(api_key:)}

Request:
{
  "reference_id": "card-saved-001",
  "card_data": {
    "token_id": "token-from-frontend"  // Generated on frontend
  },
  "amount": 600000,  // First charge amount (optional)
  "currency": "IDR",
  "auth_id": "auth-xxx"  // From frontend tokenization
}

Response (201):
{
  "id": "payment_method_id",
  "reference_id": "card-saved-001",
  "payment_method": "CARD",
  "status": "ACTIVE|ACTIVE_REQUIRES_UPGRADE",
  "card": {
    "token_id": "token-xxxx",
    "last_four": "1234",
    "card_brand": "VISA",
    "issuer": "BANK BCA",
    "country": "ID",
    "card_type": "CREDIT|DEBIT"
  },
  "created_at": "2026-08-08T10:00:00Z",
  "updated_at": "2026-08-08T10:00:00Z"
}
```

---

### FR9: Get Payment Token
**Description:** Retrieve saved payment method details
**Priority:** P1

**API Endpoint:**
```
GET https://api.xendit.co/payment_methods/{payment_method_id}
Authorization: Basic {base64(api_key:)}

Response (200):
{
  "id": "payment_method_id",
  "reference_id": "card-saved-001",
  "payment_method": "CARD",
  "status": "ACTIVE",
  "card": {
    "last_four": "1234",
    "card_brand": "VISA",
    "issuer": "BANK BCA"
  }
}
```

---

### FR10: Cancel Payment Token
**Description:** Delete saved payment method (user revoke)
**Priority:** P1

**API Endpoint:**
```
DELETE https://api.xendit.co/payment_methods/{payment_method_id}
Authorization: Basic {base64(api_key:)}

Response (200):
{
  "id": "payment_method_id",
  "status": "DELETED",
  "deleted_at": "2026-08-08T10:10:00Z"
}
```

---

### FR11: Create Session (Embedded Checkout)
**Description:** Create checkout session untuk embedded iframe checkout
**Priority:** P2

**API Endpoint:**
```
POST https://api.xendit.co/session
Authorization: Basic {base64(api_key:)}

Request:
{
  "reference_id": "SESSION-2026-001",
  "amount": 600000,
  "currency": "IDR",
  "order_data": {
    "amount": 600000,
    "description": "Subscription STARTER",
    "reference_id": "ORDER-2026-001",
    "items": [{
      "id": "item-1",
      "name": "Subscription STARTER",
      "price": 600000,
      "quantity": 1
    }],
    "customer": {
      "reference_id": "company-123",
      "name": "PT. ABC",
      "email": "billing@abc.com",
      "phone_number": "+628123456789"
    },
    "metadata": {...}
  },
  "callback_data": {
    "return_url": "https://dnpeople.id/dashboard"
  }
}

Response (201):
{
  "session_id": "session-xxx",
  "reference_id": "SESSION-2026-001",
  "status": "PENDING",
  "payment_methods": [{
    "code": "CARD",
    "name": "Credit/Debit Card",
    "icon_url": "..."
  }, {
    "code": "BANK_TRANSFER",
    "name": "Bank Transfer",
    "available_banks": [...]
  }],
  "checkout_url": "https://checkout.xendit.co/...",  // Embed in iframe
  "client_key": "xnd_public_...",
  "expires_at": "2026-08-08T10:30:00Z"
}
```

---

### FR12: Get Session
**Description:** Query session status
**Priority:** P2

**API Endpoint:**
```
GET https://api.xendit.co/session/{session_id}
Authorization: Basic {base64(api_key:)}

Response (200):
{
  "session_id": "session-xxx",
  "status": "PENDING|COMPLETED|FAILED|EXPIRED",
  "payment": {
    "id": "charge-xxx",
    "status": "SUCCEEDED|FAILED|PENDING",
    "amount": 600000
  }
}
```

---

### FR13: Refund Payment
**Description:** Create refund (full atau partial)
**Priority:** P0

**API Endpoint:**
```
POST https://api.xendit.co/charges/{charge_id}/refunds
Authorization: Basic {base64(api_key:)}

Request:
{
  "reference_id": "REFUND-2026-001",
  "amount": 600000,  // Full refund (optional, default full)
  "notes": "Admin request - customer duplicate charge",
  "reason": "ADMIN_INITIATED",  // Reason dari customer/admin
  "email_to": ["billing@abc.com"]  // Send refund notification
}

Response (201):
{
  "id": "refund-xxx",
  "charge_id": "charge-xxx",
  "reference_id": "REFUND-2026-001",
  "amount": 600000,
  "reason": "ADMIN_INITIATED",
  "status": "PENDING|SUCCEEDED|FAILED",
  "notes": "Admin request - customer duplicate charge",
  "created_at": "2026-08-08T10:15:00Z",
  "completed_at": null
}
```

---

### FR14: Create Subscription Plan
**Description:** Create recurring payment plan (monthly auto-charge)
**Priority:** P0

**API Endpoint:**
```
POST https://api.xendit.co/recurring_payments
Authorization: Basic {base64(api_key:)}

Request:
{
  "reference_id": "SUB-2026-001",
  "customer_id": "cust-123",  // Or customer reference
  "currency": "IDR",
  "amount": 600000,
  "interval": "MONTH",  // WEEK, MONTH, QUARTER, SEMI_ANNUAL, ANNUAL
  "interval_count": 1,  // Charge every 1 month
  "total_recurrence": 12,  // 12 months subscription
  "start_date": "2026-08-08T10:00:00Z",
  "payment_method_id": "payment_method_xxx",  // Saved card token
  "description": "STARTER subscription",
  "webhook_url": "https://dnpeople.id/webhooks/subscription",  // Optional
  "notification_details": {
    "recurring_notification_frequency": "DAILY",  // Notify before charge
    "recurring_notification_days": 2  // 2 days before
  },
  "failed_attempt_notifications": 3,  // Retry 3x
  "metadata": {
    "company_id": "company-123",
    "tier": "STARTER",
    "employee_count": "30"
  },
  "items": [{
    "name": "Subscription STARTER",
    "quantity": 1,
    "price": 600000
  }]
}

Response (201):
{
  "id": "rp-xxx",
  "reference_id": "SUB-2026-001",
  "customer_id": "cust-123",
  "status": "ACTIVE|PAUSED|STOPPED|COMPLETED",
  "amount": 600000,
  "currency": "IDR",
  "interval": "MONTH",
  "interval_count": 1,
  "total_recurrence": 12,
  "recurrence_progress": 0,
  "start_date": "2026-08-08T10:00:00Z",
  "next_execute_date": "2026-09-08T10:00:00Z",
  "created_at": "2026-08-08T10:00:00Z"
}
```

---

### FR15: Get Subscription Plan
**Description:** Query subscription details
**Priority:** P1

**API Endpoint:**
```
GET https://api.xendit.co/recurring_payments/{subscription_id}
Authorization: Basic {base64(api_key:)}

Response (200):
{
  "id": "rp-xxx",
  "reference_id": "SUB-2026-001",
  "status": "ACTIVE|PAUSED|STOPPED|COMPLETED",
  "amount": 600000,
  "recurrence_progress": 3,  // Charged 3 times so far
  "total_recurrence": 12,
  "next_execute_date": "2026-11-08T10:00:00Z",
  "failed_attempts": 0,
  "paused_at": null,
  "stopped_at": null,
  "created_at": "2026-08-08T10:00:00Z"
}
```

---

### FR16: Update Subscription Plan
**Description:** Change subscription amount (tier upgrade/downgrade)
**Priority:** P1

**API Endpoint:**
```
PATCH https://api.xendit.co/recurring_payments/{subscription_id}
Authorization: Basic {base64(api_key:)}

Request:
{
  "amount": 750000,  // New amount (PROFESSIONAL tier)
  "description": "Upgraded to PROFESSIONAL"
}

Response (200):
{
  "id": "rp-xxx",
  "amount": 750000,  // Updated
  "status": "ACTIVE",
  "updated_at": "2026-08-08T10:20:00Z"
}
```

---

### FR17: Pause Subscription
**Description:** Pause recurring charges (customer on hold)
**Priority:** P1

**API Endpoint:**
```
PATCH https://api.xendit.co/recurring_payments/{subscription_id}/pause
Authorization: Basic {base64(api_key:)}

Request:
{
  "pause_at": "2026-08-08T10:00:00Z"  // Optional, default immediate
}

Response (200):
{
  "id": "rp-xxx",
  "status": "PAUSED",
  "paused_at": "2026-08-08T10:00:00Z"
}
```

---

### FR18: Resume Subscription
**Description:** Resume paused subscription
**Priority:** P1

**API Endpoint:**
```
PATCH https://api.xendit.co/recurring_payments/{subscription_id}/resume
Authorization: Basic {base64(api_key:)}

Request:
{
  "resume_at": "2026-09-08T10:00:00Z"  // When to resume
}

Response (200):
{
  "id": "rp-xxx",
  "status": "ACTIVE",
  "resumed_at": "2026-09-08T10:00:00Z",
  "next_execute_date": "2026-09-08T10:00:00Z"
}
```

---

### FR19: Deactivate/Stop Subscription
**Description:** Stop subscription (cancel, no more charges)
**Priority:** P1

**API Endpoint:**
```
PATCH https://api.xendit.co/recurring_payments/{subscription_id}/stop
Authorization: Basic {base64(api_key:)}

Request:
{
  "stop_at": "2026-08-31T23:59:59Z"  // Optional
}

Response (200):
{
  "id": "rp-xxx",
  "status": "STOPPED",
  "stopped_at": "2026-08-31T23:59:59Z"
}
```

---

### FR20: Get Subscription Cycles
**Description:** List all billing cycles for a subscription
**Priority:** P2

**API Endpoint:**
```
GET https://api.xendit.co/recurring_payments/{subscription_id}/cycles?limit=10&offset=0
Authorization: Basic {base64(api_key:)}

Response (200):
{
  "data": [{
    "id": "cycle-xxx",
    "subscription_id": "rp-xxx",
    "cycle_number": 1,
    "amount": 600000,
    "status": "SUCCEEDED|FAILED|PENDING",
    "payment_id": "charge-xxx",
    "execute_at": "2026-09-08T10:00:00Z",
    "executed_at": "2026-09-08T10:05:00Z",
    "failed_reason": null
  }],
  "pagination": {
    "total": 12,
    "limit": 10,
    "offset": 0
  }
}
```

---

### FR21: Force Subscription Cycle
**Description:** Manually trigger charge immediately (don't wait for schedule)
**Priority:** P1

**API Endpoint:**
```
POST https://api.xendit.co/recurring_payments/{subscription_id}/force_attempt
Authorization: Basic {base64(api_key:)}

Response (200):
{
  "id": "cycle-xxx",
  "subscription_id": "rp-xxx",
  "cycle_number": 5,
  "status": "PENDING|SUCCEEDED|FAILED",
  "payment_id": "charge-xxx",
  "executed_at": "2026-08-08T10:15:00Z"
}
```

---

### FR22: Webhook - Payment Notification
**Description:** Xendit POST payment status updates to our webhook URL
**Priority:** P0

**Xendit sends to:** `POST https://dnpeople.id/api/v1/webhooks/xendit`

**Headers:**
```
X-Xendit-Callback-Token: {callback_token}  // Verify signature
Content-Type: application/json
```

**Body:**
```json
{
  "event": "payment.succeeded|payment.failed|payment.expired|payment.cancelled",
  "data": {
    "id": "charge-xxx",
    "reference_id": "ORDER-2026-001",
    "business_id": "business-xxx",
    "amount": 600000,
    "currency": "IDR",
    "payment_method": "CARD|BANK_TRANSFER|EWALLET",
    "payment_channel": "VISA|BCA|ID_GOPAY",
    "status": "SUCCEEDED|FAILED|EXPIRED|PENDING",
    "failure_code": "VERIFICATION_ERROR",  // If failed
    "description": "Subscription payment",
    "receipt_number": "receipt-xxx",
    "fraud_status": "ACCEPT|REJECT|CHALLENGE",
    "card_data": {...},  // If card payment
    "bank_transfer_data": {...},  // If bank transfer
    "ewallet_data": {...},  // If e-wallet
    "created_at": "2026-08-08T10:00:00.000Z",
    "updated_at": "2026-08-08T10:15:00.000Z",
    "metadata": {
      "company_id": "company-123"
    }
  }
}
```

**Response (must be 200):**
```json
{
  "status": "ok"
}
```

---

### FR23: Webhook - Refund Notification
**Description:** Xendit notify refund completion
**Priority:** P1

**Body:**
```json
{
  "event": "refund.succeeded|refund.failed",
  "data": {
    "id": "refund-xxx",
    "charge_id": "charge-xxx",
    "reference_id": "REFUND-2026-001",
    "amount": 600000,
    "status": "SUCCEEDED|FAILED",
    "reason": "ADMIN_INITIATED",
    "failure_reason": null,  // If failed
    "created_at": "2026-08-08T10:15:00Z",
    "completed_at": "2026-08-08T10:20:00Z"
  }
}
```

---

### FR24: Webhook - Subscription Notification
**Description:** Xendit notify subscription events
**Priority:** P1

**Events:**
```json
{
  "event": "subscription.created|subscription.activated|subscription.cycle_created|subscription.cycle_succeeded|subscription.cycle_failed|subscription.paused|subscription.resumed|subscription.stopped",
  "data": {
    "id": "rp-xxx",
    "reference_id": "SUB-2026-001",
    "customer_id": "cust-123",
    "status": "ACTIVE|PAUSED|STOPPED",
    "amount": 600000,
    "recurrence_progress": 3,
    "total_recurrence": 12,
    "next_execute_date": "2026-11-08T10:00:00Z",
    "cycle": {
      "cycle_number": 3,
      "amount": 600000,
      "status": "SUCCEEDED|FAILED|PENDING",
      "charge_id": "charge-xxx",
      "failure_reason": null
    },
    "created_at": "2026-08-08T10:00:00Z"
  }
}
```

---

### FR25: Get Balance
**Description:** Query current account balance
**Priority:** P2

**API Endpoint:**
```
GET https://api.xendit.co/balance
Authorization: Basic {base64(api_key:)}

Response (200):
{
  "balance": 50000000,
  "currency": "IDR"
}
```

---

### FR26: Generate Report
**Description:** Request report generation (payment, refund, subscription report)
**Priority:** P2

**API Endpoint:**
```
POST https://api.xendit.co/reports/generate
Authorization: Basic {base64(api_key:)}

Request:
{
  "report_type": "PAYMENT|REFUND|SUBSCRIPTION",
  "filters": {
    "start_date": "2026-08-01",
    "end_date": "2026-08-31",
    "payment_method": "CARD|BANK_TRANSFER|EWALLET",  // Optional
    "status": "SUCCEEDED|FAILED|PENDING"  // Optional
  },
  "email_to": ["finance@dnpeople.id"]
}

Response (201):
{
  "id": "report-xxx",
  "type": "PAYMENT",
  "status": "PENDING|COMPLETED|FAILED",
  "start_date": "2026-08-01",
  "end_date": "2026-08-31",
  "created_at": "2026-08-08T10:00:00Z",
  "download_url": null  // Available when completed
}
```

---

### FR27: Get Report
**Description:** Query report generation status / download
**Priority:** P2

**API Endpoint:**
```
GET https://api.xendit.co/reports/{report_id}
Authorization: Basic {base64(api_key:)}

Response (200):
{
  "id": "report-xxx",
  "type": "PAYMENT",
  "status": "PENDING|COMPLETED|FAILED",
  "download_url": "https://...",  // When completed
  "created_at": "2026-08-08T10:00:00Z"
}
```

---

### FR28: Check Installment Plans
**Description:** Get available installment options for transaction
**Priority:** P1

**API Endpoint:**
```
GET https://api.xendit.co/installment_plans?amount=600000&currency=IDR
Authorization: Basic {base64(api_key:)}

Response (200):
{
  "amount": 600000,
  "currency": "IDR",
  "plans": [{
    "plan_id": "plan-xxx",
    "bank": "BCA",
    "tenor": 3,
    "monthly_amount": 206000,
    "admin_fee": 18000,
    "interest_amount": 0,
    "interest_rate": 0,
    "total_amount": 618000
  }, {
    "plan_id": "plan-yyy",
    "bank": "MANDIRI",
    "tenor": 6,
    "monthly_amount": 102000,
    "admin_fee": 12000,
    "interest_amount": 0,
    "total_amount": 612000
  }, {
    "plan_id": "plan-zzz",
    "bank": "BCA",
    "tenor": 12,
    "monthly_amount": 52000,
    "admin_fee": 24000,
    "interest_amount": 0,
    "total_amount": 624000
  }]
}
```

---

### FR29: Simulate Payment (Test Mode)
**Description:** Simulate payment success/failure for testing
**Priority:** P1

**API Endpoint:**
```
POST https://api.xendit.co/simulation/charges/{charge_id}/simulate
Authorization: Basic {base64(api_key:)}

Request:
{
  "status": "SUCCEEDED|FAILED",
  "failure_code": "VERIFICATION_ERROR"  // If failed
}

Response (200):
{
  "id": "charge-xxx",
  "status": "SUCCEEDED|FAILED",
  "updated_at": "2026-08-08T10:15:00Z"
}
```

---

### FR30: Webhook Signature Verification
**Description:** Verify webhook authenticity
**Priority:** P0

**Verification Logic:**
```
Algorithm: HMAC-SHA256
Data: {X-Xendit-Callback-Token from request}
Secret: Xendit webhook token
Expected: Same as X-Xendit-Callback-Token header
```

**Implementation (Node.js):**
```typescript
function verifyWebhookSignature(body, receivedToken) {
  const data = JSON.stringify(body);
  const hash = crypto
    .createHmac('sha256', WEBHOOK_TOKEN)
    .update(data)
    .digest('hex');
  return hash === receivedToken;
}
```

---

## 2. NON-FUNCTIONAL REQUIREMENTS

### NFR1: Performance
- Payment Request creation: < 2s
- Webhook processing: < 1s
- Payment status query: < 500ms (cached)
- Report generation: < 5s
- Load test: 100 concurrent requests

### NFR2: Security
- API key in env variables only
- Webhook signature verification
- TLS 1.2+ for all HTTPS
- PII masking in logs
- Audit trail for sensitive operations

### NFR3: Reliability
- 99.5% uptime
- Webhook retry (Xendit 5x in 24h)
- Idempotency (same reference_id = same result)
- Database transaction SERIALIZABLE level

### NFR4: Compliance
- PCI DSS (no card storage on our side)
- UU ITE (electronic transaction)
- Data retention (7 years for payment records)

---

## 3. Acceptance Test Cases

| Test | Scenario | Expected Result |
|------|----------|-----------------|
| 1 | Create Payment Request | PR created, customer redirect works |
| 2 | Payment Request timeout | Expired status after 30 min |
| 3 | Card charge success | Charge succeeded, webhook received |
| 4 | Card charge fail | Charge failed, error returned |
| 5 | Bank transfer charge | VA number generated, customer can transfer |
| 6 | E-wallet charge | Redirect to GoPay/OVO, payment completes |
| 7 | Tokenization | Card token saved, one-click works |
| 8 | Subscription monthly | Auto-charge triggered on schedule |
| 9 | Subscription pause | Charge paused, resumed on date |
| 10 | Refund full | Amount refunded to customer within 2 days |
| 11 | Refund partial | Partial amount refunded |
| 12 | Webhook success | Webhook received, signature verified, status updated |
| 13 | Webhook retry | Failed webhook retried, eventually succeeds |
| 14 | Installment plans | Available plans shown with tenor/fee |
| 15 | Payout | Affiliate payout initiated, settlement within 1 day |

---

**Version:** 1.0 (Complete)  
**Last Updated:** 8 Agustus 2026


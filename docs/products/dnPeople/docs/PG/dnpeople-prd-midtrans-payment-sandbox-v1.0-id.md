# dnPeople Midtrans Payment Integration (Sandbox)
## Product Requirements Document (PRD) v1.0

**Bahasa:** Bahasa Indonesia  
**Mata Uang:** IDR (Rp)  
**Tanggal:** 26 Juli 2026  
**Status:** **Deprecated** — diganti Xendit Agustus 2026. Lihat [PG/README.md](./README.md) dan [xendit/XENDIT-PAYMENT-SETUP.md](../xendit/XENDIT-PAYMENT-SETUP.md).  
**Owner:** PT. Dozer Napitupulu Technology (DN Tech)  

---

## 1. Ringkasan Eksekutif

Integrasi Midtrans untuk dnPeople memungkinkan pelanggan (khususnya PROFESSIONAL, BUSINESS, ENTERPRISE tier) membayar subscription/invoice mereka melalui berbagai metode pembayaran (kartu kredit, transfer bank, e-wallet, QRIS, dll). Fase awal ini **SANDBOX ONLY** untuk testing, dev, dan staging.

**Target Launch:** Agustus 2026 (Sandbox → Production by Q4 2026)  
**Primary Use:** Subscription billing + Invoice payment  
**Payment Methods:** Kartu Kredit, Transfer Bank Virtual Account, E-Wallet (GoPay, OVO, ShopeePay), QRIS, Convenience Store  

---

## 2. Tujuan & Scope

### 2.1 Tujuan
- Sediakan sistem pembayaran reliable untuk pelanggan dnPeople
- Reduce friction saat pembayaran subscription/invoice
- Automatic reconciliation & payment status tracking
- Sandbox testing untuk validasi workflow & edge cases sebelum production

### 2.2 Scope (v1.0 - Sandbox)
✅ **Included:**
- SNAP payment interface (recommended, secure UI dari Midtrans)
- 5 metode pembayaran utama: CC, VA (BCA/Mandiri/BNI), E-Wallet, QRIS, ATM
- Subscription billing (monthly recurring)
- One-time invoice payment
- Sandbox testing credentials & simulators
- Webhook handling untuk notifikasi pembayaran sukses/gagal
- Payment status tracking dashboard (admin only)
- Refund manual (admin trigger)
- Sandbox error handling & retry logic

❌ **Excluded (Phase 2):**
- Installment/cicilan
- Subscription pause/resume
- Automated refund rules
- Production API migration
- Multi-currency support
- Custom payment gateway UI (using SNAP only)

---

## 3. Landscape Bisnis

### 3.1 Konteks Pembayaran dnPeople
**Subscription Models:**
- Monthly billing → auto-charge setiap 1st of month
- Invoice payment → customer-initiated (on-demand)

**User Personas:**
- Admin Company (memulai pembayaran, lihat invoice history)
- Finance Officer (approve pembayaran, reconcile)
- CEO (dashboard summary, payment alerts)

**Payment Scenarios:**
1. **Scenario 1:** Pelanggan STARTER (Rp 20K/emp/month × 30 emp = Rp 600K) bayar langganan bulanan
2. **Scenario 2:** Pelanggan PROFESSIONAL (Rp 25K/emp/month × 100 emp = Rp 2.5M) top-up token/API usage
3. **Scenario 3:** Pelanggan BUSINESS (Rp 20K/emp/month × 500 emp = Rp 10M) dengan payment term Net-30

---

## 4. Kebutuhan Fungsional (v1.0 - Sandbox)

### 4.1 Initiate Payment (Frontend Customer)
```
Trigger: Customer click "Pay Now" atau subscription auto-charge event
Flow:
  1. Backend generate payment request ke Midtrans API (POST /snap/v1/transactions)
  2. Kirim order_id, gross_amount, customer_details, items
  3. Terima snap_token dari Midtrans
  4. Frontend render Midtrans SNAP checkout modal/popup
  5. Customer pilih payment method di SNAP UI
  6. Customer complete payment (redirect ke bank/payment provider)
  7. Backend receive webhook dari Midtrans (payment.success / payment.pending / payment.failure)
  8. Update DB transaction status
  9. Send email receipt ke customer
```

### 4.2 Payment Methods (Sandbox Simulators)

#### Credit Card (Visa/Mastercard/AMEX)
- Accept: 4811111111111114 (Visa full auth), 5211111111111117 (MC full auth)
- Deny: 4911111111111113 (Visa reject by bank), 5111111111111118 (MC reject by bank)
- Expiry: any future month/year (e.g., 12/2030)
- CVV: 123
- OTP/3DS: 112233
- Sandbox simulator: Auto-complete transaction flow

#### Bank Transfer / Virtual Account (VA)
- BCA VA: Auto-generate dummy VA number → customer input ke BCA netbanking/ATM
- Mandiri VA: Auto-generate → customer input ke Mandiri netbanking/SMS banking
- BNI VA: Auto-generate → customer input ke BNI netbanking/ATM
- Sandbox simulator: `simulator.sandbox.midtrans.com/bca/va/index` (manual trigger payment)

#### E-Wallet
- **GoPay:** Desktop = QR code image, mobile = auto redirect GoPay Simulator
  - Use: `simulator.sandbox.midtrans.com/v2/gopay/ui/index` to simulate payment
- **OVO:** Phone number → +628123456789 (accept), +628249134000 (error RC 14)
- **ShopeePay:** QR code image → use QRIS Simulator
- Sandbox simulator: Web-based, no real app required

#### QRIS (Unified QR Standard)
- Auto-generate QR image
- Input ke QRIS Simulator: `simulator.sandbox.midtrans.com/v2/qris/index`
- Sandbox test: Use any random QR-compatible app

#### Convenience Store (OTC)
- **Indomaret:** Auto-generate payment code → input ke Indomaret simulator
- **Alfamart:** Auto-generate payment code → input ke Alfamart simulator
- Sandbox simulator: `simulator.sandbox.midtrans.com/indomaret/phoenix/index`

### 4.3 Webhook Handling
Midtrans mengirim HTTP POST ke endpoint webhook kami setelah payment event:

```
POST /api/v1/webhooks/midtrans
Headers: X-Midtrans-Signature (verifikasi authenticity)
Body: {
  "transaction_time": "2026-08-15 10:30:00",
  "transaction_status": "settlement" | "pending" | "deny",
  "fraud_status": "accept" | "deny",
  "order_id": "ORDER-2026-001",
  "gross_amount": 600000.00,
  "payment_type": "credit_card" | "bank_transfer" | "gopay" | "qris" | "cstore",
  "settlement_time": "2026-08-15 10:35:00",
  ...
}
```

**Transition Status:**
- `pending` → transaction masih proses (customer belum selesai di payment method)
- `settlement` → pembayaran berhasil, dana aman
- `deny` → pembayaran ditolak (fraud/bank/customer cancel)

### 4.4 Admin Dashboard - Payment Management (Internal Only)
- **Payment List:** Filter by status (pending, settlement, deny), date range, customer, amount
- **Payment Detail:** Transaction ID, order ID, customer info, payment method, gross amount, settlement time
- **Refund Button:** Manual refund untuk cases khusus (admin-triggered)
- **Reconciliation Report:** Daily settlement report dari Midtrans

### 4.5 Tier Gating
✅ **STARTER tier:** Subscription + invoice payment enabled  
✅ **PROFESSIONAL tier:** Subscription + invoice payment enabled  
✅ **BUSINESS tier:** Subscription + invoice payment enabled (volume discount possible future)  
✅ **ENTERPRISE tier:** Subscription + invoice payment enabled (custom billing possible future)  
❌ **FREE tier:** Payment system disabled (no payment required)

---

## 5. Non-Functional Requirements (Sandbox)

### 5.1 Security
- Server Key stored dalam environment variable (MIDTRANS_SERVER_KEY_SANDBOX)
- Client Key stored dalam frontend env (NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_SANDBOX)
- NEVER hardcode keys dalam codebase
- Webhook signature verification (HMAC SHA-512 vs X-Midtrans-Signature header)
- All API calls use HTTPS only (even sandbox)
- Refund action logged dengan admin user + timestamp

### 5.2 Reliability
- Idempotency: duplicate webhook → no double credit (check transaction_id in DB first)
- Retry logic untuk webhook: Midtrans retry 5× within 24h if we return non-200
- Timeout: API call to Midtrans max 10s, webhook processing max 5s
- Error handling: graceful fallback jika payment provider down

### 5.3 Performance
- Payment initiation: < 2s (generate snap_token)
- Webhook processing: < 1s (update DB)
- Payment list dashboard: < 3s (even with 10K+ records)
- No direct DB query in webhook handler (use queue/async if needed)

### 5.4 Sandbox Specifics
- Dedicated Midtrans Sandbox account (provided by Midtrans during onboarding)
- Sandbox API domain: `https://app.sandbox.midtrans.com` (charge), `https://api.sandbox.midtrans.com` (token)
- Test payment credentials per Midtrans sandbox docs
- Sandbox data isolated from production
- Reset/cleanup sandbox data monthly if needed (Midtrans allow this)

---

## 6. User Workflows (Sandbox)

### Workflow 1: Subscription Auto-Charge (Monthly)
```
1. Cron job runs on 1st of month @ 00:00 UTC
2. Query all active subscriptions (not paused/cancelled)
3. For each customer:
   a. Generate Order ID: ORDER-{companyId}-{month}-{random}
   b. Calculate gross_amount dari subscription tier + employees
   c. Call Midtrans POST /snap/v1/transactions
   d. Save snap_token + transaction_id di table `Payment`
   e. Send email ke customer: "Subscription payment initiated, click here to pay"
4. Customer receive email → click link
5. SNAP modal appear → customer select payment method
6. Customer complete payment (depends on method)
7. Midtrans send webhook → we process & update status
8. If settlement: mark subscription as paid, send receipt
9. If deny: auto-retry email, create alert untuk finance team
```

### Workflow 2: Customer On-Demand Invoice Payment
```
1. Customer login → go to Billing → see unpaid invoices
2. Click "Pay Now" on invoice (amount = invoice.total)
3. Frontend call POST /api/v1/payments/initiate-payment
   {
     "invoice_id": "INV-2026-001",
     "amount": 2500000,
     "payment_method_preference": "credit_card" (optional)
   }
4. Backend:
   a. Query invoice detail (verify amount, status, customer)
   b. Check if already paid (prevent double payment)
   c. Call Midtrans POST /snap/v1/transactions
   d. Create Payment record (status=pending)
   e. Return {snap_token, payment_id}
5. Frontend render SNAP checkout modal
6. Customer complete payment
7. Webhook → Payment status updated
8. If settlement: mark invoice as paid, send receipt + tax document (if applicable)
```

### Workflow 3: Manual Refund by Admin
```
1. Admin login → Payment Management → find transaction
2. Click "Refund" button (only if settlement status)
3. Modal confirm: "Refund Rp 600,000 to customer?"
4. Backend:
   a. Call Midtrans POST /v2/{transaction_id}/refund
   b. Provide refund amount + reason
   c. Log this action: admin_id, timestamp, reason
5. Midtrans process refund (usually 1-3 business days to customer account)
6. Webhook received: refund_status → update DB
7. Send email to customer: "Refund processed, check your bank account in 1-3 days"
```

---

## 7. Data Model (High Level)

### Table: `Payment`
```
id (UUID)
company_id (FK to Company)
order_id (string, unique) → "ORDER-comp-123-2026-0815"
transaction_id (string) → Midtrans transaction ID
snap_token (string) → Midtrans SNAP token (for checkout)
payment_type (enum) → credit_card, bank_transfer, gopay, ovo, qris, cstore
gross_amount (decimal) → Rp amount
settlement_amount (decimal) → amount that cleared (after fee)
payment_status (enum) → pending, settlement, deny, refund, partial_refund
fraud_status (enum) → accept, deny (if 3DS/FDS reject)
created_at (timestamp)
settled_at (timestamp) → when Midtrans confirmed settlement
customer_name (string)
customer_email (string)
customer_phone (string)
subscription_id (FK) → if this payment for subscription (optional)
invoice_id (FK) → if this payment for invoice (optional)
description (string) → "Subscription Jan 2026, 30 employees"
notes (text) → admin notes, refund reason, etc
midtrans_response_full (JSON) → store entire Midtrans response for debug
```

### Table: `PaymentRefund`
```
id (UUID)
payment_id (FK to Payment)
refund_amount (decimal)
refund_status (enum) → requested, processed, failed
initiated_by (FK to User) → admin who triggered refund
reason (string) → "Customer request", "Billing dispute", etc
created_at (timestamp)
processed_at (timestamp)
midtrans_refund_id (string) → Midtrans refund transaction ID
```

---

## 8. Success Metrics (Sandbox Phase)

### Testing Metrics
- ✅ 100% payment scenarios tested (5 payment methods × 3 status codes)
- ✅ Webhook signature verification working
- ✅ Idempotency test: duplicate webhook → no double entry
- ✅ All error codes handled (401, 406, 503, 05, 900, etc)
- ✅ Refund flow manual tested
- ✅ Dashboard payment list responsive (< 3s load)

### Post-Launch Metrics (Production readiness)
- Successful payment rate > 95%
- Mean time to settlement < 2 hours (for instant methods like VA)
- Webhook delivery success rate > 99.9%
- Payment system uptime > 99.5%
- Customer support response time for payment issues < 2 hours

---

## 9. Dependencies & Integrations

### External Services
- **Midtrans Sandbox API:** `https://app.sandbox.midtrans.com`, `https://api.sandbox.midtrans.com`
- **Midtrans Test Credentials:** Server Key, Client Key (dari Midtrans dashboard)
- **Email Service:** SendGrid/SES untuk send payment receipt/alert

### Internal Services
- **dnPeople Backend:** Express 5 API, existing authentication
- **Database:** PostgreSQL 16, Prisma ORM
- **Job Queue:** Bull (Redis-backed) untuk async webhook processing (future optimization)

### Third-Party Libraries
- **Node.js SDK:** `npm install midtrans-client` (official Midtrans library)
- **Payment verification:** Node crypto (HMAC-SHA512 untuk webhook signature)

---

## 10. Timeline & Phasing

### Phase 1: Sandbox Setup & Dev (1 week - Jul 26-Aug 1)
- [ ] Midtrans account setup & credential retrieval
- [ ] Environment config (sandbox keys)
- [ ] API client initialization (`new midtransClient.Snap()`)
- [ ] Basic payment initiation endpoint
- [ ] Webhook endpoint setup & signature verification

### Phase 2: Core Features (2 weeks - Aug 2-15)
- [ ] Payment initiation (subscription + invoice)
- [ ] SNAP integration frontend (React component)
- [ ] Webhook handling + DB updates
- [ ] Refund logic (manual)
- [ ] Payment status tracking

### Phase 3: Testing & Sandbox QA (1.5 weeks - Aug 16-30)
- [ ] Test all 5 payment methods with sandbox simulators
- [ ] Test all status transitions + error scenarios
- [ ] Webhook reliability test (duplicate, retry)
- [ ] Admin dashboard filtering/reporting
- [ ] Refund flow end-to-end
- [ ] Security review (key rotation, signature verification)

### Phase 4: Documentation & Handoff (0.5 week - Aug 31)
- [ ] Complete SRS/SDD
- [ ] Runbook untuk ops (simulator URLs, test credentials, troubleshooting)
- [ ] Admin user training
- [ ] Production migration checklist

**Target Sandbox Ready:** 31 Agustus 2026  
**Target Production Pilot:** September 2026 (small batch, 5-10 customers)  
**Target General Availability:** Oktober 2026

---

## 11. Risks & Mitigation

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Payment provider downtime (Midtrans) | HIGH | Have Midtrans escalation contact, monitor status page, alert ops if down |
| Webhook delivery failure | MEDIUM | Implement retry logic, log all webhooks, reconcile daily vs Midtrans API |
| Double payment (idempotency failure) | CRITICAL | Check transaction_id in DB before processing, use unique order_id |
| Key exposure (hardcoded credentials) | CRITICAL | Env variables only, rotate keys quarterly, audit logs |
| Fraud/chargeback (production later) | MEDIUM | Use 3DS, FDS enabled by default, monitor chargeback rate |
| Sandbox credential leak | LOW | Sandbox data isolated anyway, but treat like production practice |

---

## 12. Assumptions & Constraints

### Assumptions
- Midtrans sandbox account provided by product team
- Email service (SendGrid/SES) already integrated
- Database migration tooling available (Prisma migrate)
- Admin users already exist (role: SUPER_ADMIN, FINANCE)

### Constraints
- **Sandbox only for v1.0** → no real money transfers (testing only)
- **No subscription pause/resume yet** → only full cancel or continue
- **Manual refund only** → no auto-refund rules
- **Single currency:** IDR only (no multi-currency in v1)
- **Single merchant:** One Midtrans merchant account for all dnPeople customers

---

## 13. Success Criteria (Go/No-Go for Sandbox)

**GO if:**
- ✅ All 5 payment methods tested + working in sandbox
- ✅ Webhook signature verification pass security review
- ✅ Payment status tracking 100% accurate
- ✅ Admin dashboard filtering working
- ✅ No critical security findings
- ✅ All error codes handled gracefully
- ✅ Documentation complete + ops trained

**NO-GO if:**
- ❌ Webhook signature bypass discovered
- ❌ Double payment observed in any scenario
- ❌ Payment status mismatch (DB vs Midtrans) > 1%
- ❌ Error handling missing (unhandled exceptions)
- ❌ Dashboard slowness > 5s

---

## 14. Glossary

| Term | Definition |
|------|-----------|
| **Snap** | Midtrans pre-built payment checkout UI (modal/popup) |
| **Snap Token** | Temporary token dari Midtrans, used to load SNAP checkout |
| **Settlement** | Payment cleared & safe (usually 1-2 days after customer pays) |
| **Virtual Account (VA)** | Bank-specific account number untuk customer transfer (expires after order expires) |
| **E-Wallet** | Digital payment (GoPay, OVO, ShopeePay, LinkAja, etc) |
| **QRIS** | Unified QR code standard in Indonesia (works with GoPay, OVO, etc) |
| **3DS** | 3-Domain Secure (OTP/security challenge for card payment) |
| **FDS** | Midtrans Fraud Detection System (auto-detect suspicious transactions) |
| **Webhook** | HTTP callback dari Midtrans ke our server after payment event |
| **Idempotency** | Same webhook processed only once, even if Midtrans retries it |

---

**Approved by:** Dozer Fernando Saroha Daniel Napitupulu (Founder, CEO, Tech Lead)  
**Version:** 1.0  
**Last Updated:** 26 Juli 2026

# dnPeople Midtrans Payment Integration (Comprehensive)
## Product Requirements Document (PRD) v2.0

**Bahasa:** Bahasa Indonesia  
**Mata Uang:** IDR (Rp)  
**Tanggal:** 26 Juli 2026  
**Status:** Comprehensive - Sandbox + Production Ready  
**Owner:** PT. Dozer Napitupulu Technology (DN Tech)  

---

## 1. Ringkasan Eksekutif

dnPeople Midtrans Payment Integration v2.0 adalah platform pembayaran **END-TO-END** yang mendukung **15+ payment methods**, **3 checkout interface** (SNAP, Core API, Payment Link), **native recurring** untuk subscription, **tokenization** untuk one-click payment, dan **disbursement** untuk affiliate payouts. 

Scope mencakup:
- **Checkout:** SNAP (pre-built), Core API (custom), Payment Link (no-code)
- **Payment Methods:** Card, E-Wallet (GoPay/OVO/ShopeePay/QRIS), Bank Transfer (8 banks), Convenience Store (3 chains), Cardless Credit, Google Pay
- **Advanced Features:** Recurring subscription, Account Linking (tokenization), Installment, 3DS/FDS anti-fraud
- **Operations:** Disbursement (payout), Iris (bulk transfer), Settlement, Refund, Reconciliation
- **Admin Dashboard:** Full payment + subscription management, analytics, feature flags, system health

**Fase:** 
- **Sandbox (v2.0):** Aug 1-31, QA complete by Aug 31
- **Production Pilot:** Sep 1-30 (5-10 customers)
- **General Availability:** Oct 1, 2026

---

## 2. Objectives & Scope

### 2.1 Tujuan
✅ Support **15+ payment methods** dengan full Midtrans integration  
✅ Enable **subscription billing** via native Midtrans recurring API (not cron-based)  
✅ Provide **custom checkout** via Core API for merchantability  
✅ Support **one-click payment** via account linking / tokenization  
✅ Enable **affiliate payout** via disbursement API  
✅ Handle **installment & promo** via Core API card endpoint  
✅ Full **sandbox testing** dengan simulators untuk semua methods  
✅ Production-ready **fraud detection** (3DS, FDS)  

### 2.2 Scope Included (v2.0)
✅ SNAP checkout (Midtrans pre-built UI)  
✅ Core API checkout (custom UI, full control)  
✅ Payment Link (no-code payment URL)  
✅ All 15 payment methods with full testing  
✅ Native Recurring API (Midtrans-managed subscription)  
✅ Payment Account Linking / Tokenization (save card/e-wallet)  
✅ Manual refund + auto-refund rules  
✅ Disbursement API (payout to bank account)  
✅ Iris API (bulk transfer, payroll simulation)  
✅ 3D Secure + Fraud Detection System  
✅ Subscription management (pause, resume, cancel)  
✅ Admin dashboard (customer mgmt, billing, analytics, disbursement)  
✅ Webhook handling for ALL payment methods  
✅ Settlement reconciliation  
✅ Full sandbox + production support  

❌ Scope Excluded (v3.0+)
❌ Custom fraud rules engine  
❌ Multi-currency (IDR only v2.0)  
❌ white-label payment gateway  
❌ Mobile app payment (future native SDK)  

---

## 3. Business Landscape

### 3.1 dnPeople Monetization Model

**Subscription Tiers (v12.1 pricing):**
```
FREE:          Rp 0          → 50 emp (no payment required)
STARTER:       Rp 20K/emp/mo → 1-50 emp (payroll, attendance, leave)
PROFESSIONAL:  Rp 25K/emp/mo → 51-300 emp (recruitment, performance, talent)
BUSINESS:      Rp 20K/emp/mo → 301+ emp (multi-cabang, unlimited API)
ENTERPRISE:    Custom        → 500+ emp (SSO, white-label, dedicated AM)
```

**Revenue Drivers:**
1. **Subscription MRR:** STARTER/PROF/BIZ recurring monthly
2. **Add-ons:** Extra API quota, advanced features, integrations
3. **Affiliate:** Partner referrals (payout via disbursement)
4. **One-time:** Invoice payment, top-ups, overages

---

## 4. Payment Methods Detail (15+ Methods)

### 4.1 Credit Card (3 brands, 3DS 2)

**Midtrans Brands:** Visa, Mastercard, AMEX, JCB, CUP  
**Sandbox Test:**
- Visa Accept: `4811 1111 1111 1114`, Deny: `4911 1111 1111 1113`
- MC Accept: `5211 1111 1111 1117`, Deny: `5111 1111 1111 1118`
- AMEX Accept: `3701 9216 9722 458`, Deny: `3742 9635 4400 881`
- Expiry: any future (e.g., 02/2030), CVV: 123, OTP: 112233
- 3DS 2: Frictionless + Challenge scenarios

**Features:**
- 3D Secure 2 (mandatory for security)
- Installment (2-24 bulan via bank promo)
- Bank-specific promos (Mandiri, CIMB, BNI, BCA, BRI)
- Tokenization (save card for one-click)
- FDS (Fraud Detection System) by Midtrans

**Tier Gating:** STARTER+

---

### 4.2 E-Wallet (4 methods)

#### GoPay
- **Flow:** Desktop QR code → mobile app scan; Mobile deeplink auto-redirect
- **Sandbox Test:** QRIS Simulator at `simulator.sandbox.midtrans.com/v2/qris/index`
- **Tokenization:** Supported (phone number linking)
- **Features:** Real-time settlement, low MDR
- **Tier Gating:** STARTER+

#### OVO
- **Flow:** Phone number → OVO app OTP confirmation
- **Sandbox Test:** 
  - Success: `+628123456789` (any number works)
  - Error RC 14: `+628249134000` (phone not registered)
  - RC 17: `+628271939753` (user canceled)
- **Tokenization:** Supported
- **Tier Gating:** STARTER+

#### ShopeePay
- **Flow:** Desktop QR → mobile app; Mobile deeplink redirect
- **Sandbox Test:** QRIS Simulator
- **Tokenization:** Supported
- **Tier Gating:** STARTER+

#### QRIS (Unified QR)
- **Flow:** Single QR code, scannable by any QRIS-compatible app (GoPay, OVO, LinkAja, Dana, etc.)
- **Sandbox Test:** QRIS Simulator
- **Settlement:** Real-time
- **Tier Gating:** STARTER+

---

### 4.3 Bank Transfer / Virtual Account (8 banks)

**Supported Banks:**
1. **BCA VA** - Sandbox: `simulator.sandbox.midtrans.com/bca/va/index`
2. **Mandiri Bill Payment** - Sandbox: Open API simulator with Mandiri selected
3. **BNI VA** - Sandbox: `simulator.sandbox.midtrans.com/bni/va/index`
4. **BRI VA** - Sandbox: Open API simulator
5. **Permata VA** - Sandbox: Open API simulator
6. **CIMB VA** - Sandbox: Open API simulator
7. **BSI VA** - Sandbox: Open API simulator
8. **Danamon VA** - Sandbox: Open API simulator

**Features:**
- Auto-generated VA number unique per transaction
- Settlement: T+1 (next business day)
- Expiry: 1-7 days (configurable)
- No refund, requires manual reconciliation
- Webhook on payment confirmation
- Tier Gating: STARTER+

---

### 4.4 Convenience Store (3 chains)

**Chains:**
1. **Indomaret** - Payment code at counter, cash payment
   - Sandbox: `simulator.sandbox.midtrans.com/indomaret/phoenix/index`
2. **Alfamart** - Payment code at terminal
   - Sandbox: `simulator.sandbox.midtrans.com/alfamart/index`
3. **Kioson** - Payment code at kiosk terminal
   - Sandbox: `simulator.sandbox.midtrans.com/kioson/index`

**Features:**
- Settlement: T+2 to T+3
- No refund (physical cash payment)
- Expiry: 3-7 days
- Manual reconciliation with store receipts
- Tier Gating: PROFESSIONAL+

---

### 4.5 Cardless Credit (2 platforms)

**Platforms:**
1. **Akulaku** - Buy now, pay later (3/6 months)
   - Auto-redirect to Akulaku checkout
   - Sandbox test credentials provided
2. **Kredivo** - Buy now, pay later (1-12 months)
   - Auto-redirect to Kredivo checkout
   - Sandbox test credentials provided

**Features:**
- Full credit check by provider
- Settlement: Midtrans settles immediately, provider handles customer credit
- Refund: Request to provider
- KYC required for customer
- Tier Gating: PROFESSIONAL+

---

### 4.6 Google Pay

**Features:**
- Tokenization of card via Google Pay
- One-click checkout from saved card
- 3DS handled by Google Pay
- Production only (no sandbox support at this time)
- Tier Gating: BUSINESS+

---

### 4.7 Summary Table

| Method | Accept Amount | Settlement | Refund | Tokenize | 3DS | Tier |
|--------|---|---|---|---|---|---|
| **Card** | Any | 1-2d | Yes | Yes | Yes | STARTER+ |
| **GoPay** | Any | Real-time | Yes | Yes | No | STARTER+ |
| **OVO** | 10K-10M | Real-time | Yes | Yes | No | STARTER+ |
| **ShopeePay** | Any | Real-time | Yes | Yes | No | STARTER+ |
| **QRIS** | Any | Real-time | Yes | No | No | STARTER+ |
| **BCA VA** | Any | T+1 | No | No | No | STARTER+ |
| **Mandiri VA** | Any | T+1 | No | No | No | STARTER+ |
| **BNI VA** | Any | T+1 | No | No | No | STARTER+ |
| **BRI VA** | Any | T+1 | No | No | No | STARTER+ |
| **Permata VA** | Any | T+1 | No | No | No | STARTER+ |
| **CIMB VA** | Any | T+1 | No | No | No | STARTER+ |
| **BSI VA** | Any | T+1 | No | No | No | STARTER+ |
| **Danamon VA** | Any | T+1 | No | No | No | STARTER+ |
| **Indomaret** | Any | T+2/3 | No | No | No | PROF+ |
| **Alfamart** | Any | T+2/3 | No | No | No | PROF+ |
| **Kioson** | Any | T+2/3 | No | No | No | PROF+ |
| **Akulaku** | 50K-600K | Real-time | Via Akulaku | No | No | PROF+ |
| **Kredivo** | 100K-50M | Real-time | Via Kredivo | No | No | PROF+ |
| **Google Pay** | Any | 1-2d | Yes | Yes | Yes | BIZ+ |

---

## 5. Checkout Interfaces (3 Types)

### 5.1 SNAP (Midtrans Pre-Built UI)

**Best For:** Quick integration, all payment methods in one modal, minimal dev work

**Features:**
- Pre-built payment modal
- All payment methods auto-loaded based on tier
- Mobile-optimized
- Hosted by Midtrans (no PCI compliance required)
- Customizable colors/branding (limited)
- Fast 30-min checkout

**Flow:**
1. Backend → Midtrans POST /snap/v1/transactions (get snap_token)
2. Frontend → Load SNAP script + snap.pay(token)
3. Customer → Choose method in modal, complete payment
4. Webhook → Backend receive settlement notification

**API:**
```
POST https://app.sandbox.midtrans.com/snap/v1/transactions
{
  transaction_details: {order_id, gross_amount},
  customer_details: {first_name, last_name, email, phone},
  enabled_payments: ['credit_card', 'bank_transfer', 'gopay', 'qris', ...],
  expiry: {start_time, unit, duration}
}

Response: {snap_token, redirect_url, transaction_id}
```

**Tier Gating:**
- STARTER+: All methods except Indomaret/Alfamart/Kioson/Google Pay
- PROFESSIONAL+: + Convenience Store + Cardless Credit
- BUSINESS+: + Google Pay

---

### 5.2 Core API (Custom Checkout)

**Best For:** Full control of UI/UX, custom checkout flow, advanced features like installment

**Features:**
- Direct API integration (no modal)
- Support for card charge, bank transfer, e-wallet, OTC per endpoint
- Installment parameter (for card)
- Two-click payment (save token → charge via saved token)
- Full PCI compliance required (or tokenize card upfront)

**Endpoints:**
```
Card Charge:
POST /v2/charge
{order_id, gross_amount, payment_type: "credit_card", credit_card: {data/token, installment, ...}}

Bank Transfer:
POST /v2/charge
{order_id, gross_amount, payment_type: "bank_transfer", bank_transfer: {bank: "bca|mandiri|bni|...}}

E-Wallet:
POST /v2/charge
{order_id, gross_amount, payment_type: "gopay|ovo|shopeepay|...", ...}

Get Token (frontend):
GET /v2/token?client_key=...&card_number=...&card_cvv=...&gross_amount=...

Card Status:
GET /v2/{transaction_id}/status
```

**Tier Gating:**
- PROFESSIONAL+: Full Core API (all methods)
- BUSINESS+: + Installment

---

### 5.3 Payment Link (No-Code)

**Best For:** Email invoices, share payment link, minimal integration

**Features:**
- Generate shareable link via API (no customer checkout page needed)
- Link valid for X days
- Auto-expire
- Track payment status via link
- Webhook when paid
- Email + SMS notifications

**Flow:**
```
POST /v1/payment_links
{reference_id: "INV-2026-001", amount: 5000000, description: "Invoice payment", expiry_duration: 3600}

Response: {payment_link_id, url: "https://pay.midtrans.com/..."}

Send to customer → Customer clicks → SNAP modal → Pay → Settled
```

**Tier Gating:** STARTER+

---

## 6. Advanced Features

### 6.1 Recurring API (Native Subscription)

**Use Case:** Auto-charge subscription every 1st of month

**Midtrans Recurring:**
- Customer do one payment with `recurring: true` flag
- Midtrans save token automatically
- Schedule subsequent charges via POST /v2/recurring/{subscription_id}/charge
- Webhook on each charge

**vs Cron-based:**
- **v1.0 (cron):** We call /charge manually every 1st of month
- **v2.0 (recurring):** Midtrans manages schedule, more reliable

**Advantages:**
- Midtrans handles retry logic
- Saved token secure
- Webhook confirmation each charge
- PCI compliance simplified

**Flow:**
```
1. Customer first payment with recurring: true
2. Midtrans save card token, return subscription_id
3. Every month: POST /v2/recurring/{subscription_id}/charge
4. Midtrans auto-retry if fail, webhook on each
5. Customer can pause/resume via subscription ID
```

**Tier Gating:** STARTER+ (automatic for subscription customers)

---

### 6.2 Payment Account Linking / Tokenization

**One-Click Payment:**
- Customer save card/e-wallet on first payment
- Subsequent payments: one-click (no re-enter)
- Secure token stored in Midtrans
- Customer can delete saved payment methods

**Flows:**
```
First Payment (save token):
POST /v2/charge
{..., save_card: true}
Response: {..., saved_token_id: "..."}

Subsequent Payment (one-click):
POST /v2/charge
{..., token_id: "...", save_card: false}
```

**For E-Wallet:**
- GoPay/OVO/ShopeePay: Link phone number (no card)
- Tokenization automatically stored by provider

**Tier Gating:** STARTER+ (save card), PROFESSIONAL+ (managed tokens admin)

---

### 6.3 Installment (Card only)

**Midtrans Support:**
- 2, 3, 6, 12, 18, 24 months
- Bank-specific promo interest rates
- Admin dashboard manage installment rules

**Charges:**
```
POST /v2/charge
{
  order_id: "...",
  gross_amount: 12000000,
  payment_type: "credit_card",
  credit_card: {
    data: {...},
    installment: {
      type: "oflw_installment", // off-us (card issuer interest)
      term_detail: {
        month_to_pay: 12,
        gross_amount: 12000000
      }
    }
  }
}
```

**Tier Gating:** BUSINESS+ (promo/installment mgmt)

---

### 6.4 3D Secure & Fraud Detection (3DS + FDS)

**3D Secure 2:**
- Mandatory for card > certain amount
- Frictionless (no OTP) for low-risk
- Challenge (OTP) for medium/high-risk
- Handled by Midtrans automatically

**Fraud Detection System (FDS):**
- Midtrans auto-decline suspicious transactions
- ML-based risk scoring
- Admin can whitelist/blacklist

**Parameters:**
```
Enabled by default, controlled via Midtrans Dashboard:
- FDS enabled/disabled
- Challenge threshold
- Decline threshold
```

**Tier Gating:** Automatic for all STARTER+

---

### 6.5 Disbursement API (Payouts)

**Use Case:** Pay affiliate commission, referral bonus, seller payout

**Features:**
- Disburse from merchant account to any bank account
- Batch or single transfer
- Settlement T+1
- Webhook confirmation

**Endpoints:**
```
Single Disbursement:
POST /v1/disbursements
{reference_id, amount, bank_account: {bank_code, account_number, account_holder_name}}

Batch Disbursement:
POST /v1/disbursements/batch
{...array of disbursements}

Get Status:
GET /v1/disbursements/{disbursement_id}
```

**Bank Codes:** BCA (014), Mandiri (008), BNI (009), BRI (002), CIMB (022), etc.

**Tier Gating:** BUSINESS+ (affiliate program)

---

### 6.6 Iris API (Bulk Payout / Payroll Simulation)

**Use Case:** Bulk payroll, batch commission payout

**Features:**
- Bulk transfer up to 500 recipients per request
- Cost-effective for high-volume payouts
- Settlement T+1
- Webhook confirmation

**Endpoints:**
```
Payout Benef Create:
POST /v1/iris/payouts/api/account-benef-create
{benef_name, benef_account, benef_bank, benef_email}

Bulk Payout:
POST /v1/iris/payouts/api/payout-list
{payouts: [{ key: "id1", benef_key: "...", amount: 100000, notes: "commission" }, ...]}

Status:
GET /v1/iris/payouts/api/payout-list/{payout_reference_id}
```

**Tier Gating:** ENTERPRISE+ (bulk payout volume)

---

## 7. Subscription Management

### 7.1 Native Recurring Features

**Pause Subscription:**
- Stop auto-charge for X months
- Resume after pause period
- No payment during pause

**Resume Subscription:**
- Restart auto-charge
- Can set custom amount if tier changed

**Cancel Subscription:**
- Immediate cancellation
- No further charges
- End customer access (at app logic level)

**Upgrade/Downgrade:**
- Change employee count
- Calculate prorated amount
- Next cycle new amount

**Tier Gating:** Company Admin + Finance Officer

---

### 7.2 Admin Dashboard - Subscription Management

**Features:**
- List all active subscriptions (filter by status, tier, customer)
- Pause/resume/cancel subscription
- Manual charge trigger (immediate billing)
- Subscription status (active, paused, cancelled, failed)
- Payment history per subscription
- Proration calculator
- Trial extension

---

## 8. Admin Dashboard - Comprehensive

### 8.1 Modules (15+)

**Module 1: Customer Management**
- List all dnPeople customers (pagination, filter by tier, revenue)
- Customer detail (company info, contacts, subscription status)
- Impersonate customer (test their payment flow)
- Block/unblock customer
- Extend trial (for new customers)

**Module 2: Subscription & Billing**
- MRR/ARR dashboard (total revenue per month/year)
- Subscription breakdown by tier (count + revenue)
- Churn analysis (cancelled subscriptions)
- Revenue trend (chart, MoM growth)
- Customer lifetime value (CLTV)
- Overdue invoice tracker

**Module 3: Payment Management**
- Payment list (filter by status, date, amount, method, customer)
- Payment detail (full transaction info, fraud_status, settlement_time)
- Refund tracker (pending, processed, failed)
- Manual refund trigger
- Reconciliation (match Midtrans settlement vs DB)
- Failed payment alert (auto-retry email)

**Module 4: Analytics & Metrics**
- Payment success rate (%) by method
- Feature adoption (tutorial completion, module usage)
- Churn signals (inactive 30+ days)
- Revenue per feature
- Customer acquisition cost (CAC)
- Cohort analysis (retention by signup date)

**Module 5: Support & Tickets**
- Support ticket queue (status, priority, assignee)
- Payment-related tickets auto-filed
- Message thread with customer
- KB article suggestions
- CSAT survey

**Module 6: Content Management**
- Tutorial CRUD (markdown editor, publish/unpublish)
- KB article CRUD (categories, search, analytics per article)
- Video library (YouTube auto-fetch, analytics)
- A/B test content (show variant A vs B to cohorts)

**Module 7: Feature Flags**
- Toggle features ON/OFF with confirmation
- Rollout % (0-100%, A/B testing)
- Tier-specific flags (enable for PROFESSIONAL only, etc.)
- Audit history (who toggled, when, reason)

**Module 8: System Health**
- API latency (P50, P95, P99)
- Database connections, disk usage
- Bull queue job status
- Midtrans connectivity test
- Error rate dashboard (% of failed requests)
- Auto-alert if P99 > 2s or error rate > 1%

**Module 9: Webhook Monitoring**
- Webhook delivery log (all webhooks sent/received)
- Failed webhook retry history
- Webhook payload inspection
- Manual webhook replay

**Module 10: Disbursement Management**
- Disbursement list (pending, success, failed)
- Bulk payout status
- Affiliate commission tracker
- Payout statement download

**Module 11: Fraud & Security**
- Suspicious transaction list (high FDS score)
- Whitelist / blacklist management
- 3DS challenge rate by card
- Chargeback tracker

**Module 12: Settlement & Payouts**
- Daily settlement report from Midtrans
- Settlement date tracker
- Payout schedule (when funds arrive at bank)
- Payout history

**Module 13: Audit Log**
- Immutable log of all admin actions
- Filter by action, date, admin user
- Export audit trail

**Module 14: Integration Health**
- Midtrans API status
- Webhook endpoint health
- Email service status
- Database replication lag

**Module 15: Reports**
- Custom date range reports
- Payment method breakdown
- Customer segment analysis
- Export to CSV/PDF

---

## 9. Tier Gating (Payment Methods & Features)

```
FREE (Rp 0):
  ✗ No payment processing
  ✗ No subscription billing
  ✗ No add-ons

STARTER (Rp 20K/emp/mo):
  ✓ Card + GoPay + OVO + ShopeePay + QRIS
  ✓ Bank Transfer (8 banks)
  ✓ Subscription billing (monthly recurring)
  ✓ Payment Link
  ✓ SNAP checkout
  ✗ Installment
  ✗ Convenience Store
  ✗ Cardless Credit
  ✗ Google Pay
  ✗ Disbursement

PROFESSIONAL (Rp 25K/emp/mo):
  ✓ All STARTER +
  ✓ Convenience Store (Indomaret, Alfamart, Kioson)
  ✓ Cardless Credit (Akulaku, Kredivo)
  ✓ Core API custom checkout
  ✓ Payment method tokenization (admin view)
  ✗ Installment
  ✗ Google Pay
  ✗ Disbursement
  ✗ Iris

BUSINESS (Rp 20K/emp/mo, min 301 emp):
  ✓ All PROFESSIONAL +
  ✓ Installment (6, 12, 24 months)
  ✓ Google Pay
  ✓ Advanced Core API features
  ✓ Subscription pause/resume
  ✓ Disbursement API (affiliate payout)
  ✗ Iris (bulk payout)

ENTERPRISE (Custom):
  ✓ All BUSINESS +
  ✓ Iris API (bulk payout / payroll)
  ✓ White-label support
  ✓ Dedicated account manager
  ✓ Custom integration support
```

---

## 10. Data Model (High Level)

### Core Tables

**payment** - All payment transactions
```
id, company_id, order_id, transaction_id, snap_token, payment_type (card/bank_transfer/gopay/...),
payment_status (pending/settlement/deny/refund/...), fraud_status (accept/deny/challenge),
gross_amount, settlement_amount, created_at, settled_at, customer_*, subscription_id, invoice_id,
midtrans_response_full (JSON), notes
```

**subscription** - Recurring billing
```
id, company_id, tier (STARTER/PROF/BIZ/ENT), employee_count, status (active/paused/cancelled),
start_date, next_billing_date, pause_until, total_paid, payment_method, saved_token_id,
midtrans_subscription_id, created_at
```

**payment_refund** - Refund records
```
id, payment_id, refund_amount, refund_status (requested/processed/failed), initiated_by,
reason, midtrans_refund_id, created_at, processed_at
```

**saved_payment_method** - Tokenization
```
id, company_id, payment_type (card/gopay/ovo/...), token (Midtrans token_id), 
masked_data (last4, brand, e-wallet_phone), payment_method_name (user-given label),
is_default, created_at
```

**disbursement** - Payout transactions
```
id, company_id, disbursement_id (Midtrans), amount, bank_code, account_number, 
account_holder_name, status (pending/success/failed), created_at, settled_at
```

**webhook_log** - Audit trail
```
id, webhook_type (payment/disbursement/...), payload (JSON), delivered (bool), 
response_status, retries, last_retry_at, created_at
```

**payment_audit_log** - Immutable audit
```
id, payment_id, action (initiated/settled/deny/refund/...), actor_id, actor_type (admin/webhook/system),
before_state (JSON), after_state (JSON), timestamp
```

---

## 11. Success Metrics (Sandbox Phase)

### Testing Metrics
- ✅ 15/15 payment methods tested end-to-end
- ✅ 100% sandbox simulator scenarios passed
- ✅ SNAP + Core API + Payment Link tested
- ✅ Webhook idempotency (no double payment)
- ✅ Refund (manual) tested
- ✅ Subscription pause/resume tested
- ✅ Account linking / tokenization tested
- ✅ Disbursement (affiliate payout) tested
- ✅ All error codes handled (401, 406, 503, etc.)
- ✅ Admin dashboard fully functional

### Performance Metrics (Sandbox Baseline)
- Payment initiation: < 2s
- Webhook processing: < 1s
- Admin dashboard query: < 3s
- Payment list load (1000 records): < 3s

---

## 12. Timeline & Phasing

### Phase 1: Foundation (Aug 1-10)
- [ ] Midtrans sandbox account setup
- [ ] Core API client initialization
- [ ] Database schema creation (payment, subscription, disbursement tables)
- [ ] Backend service skeleton (PaymentService, SubscriptionService, DisbursementService)

### Phase 2: Payment Methods (Aug 11-20)
- [ ] SNAP integration (all 15 methods)
- [ ] Core API: Card + Bank Transfer + E-Wallet endpoints
- [ ] Payment Link API
- [ ] Webhook handler (all methods)
- [ ] Admin dashboard: Payment list + detail

### Phase 3: Advanced Features (Aug 21-25)
- [ ] Recurring API (native subscription)
- [ ] Account Linking / Tokenization (save payment method)
- [ ] Disbursement API (affiliate payout)
- [ ] Iris API (bulk payout simulation)
- [ ] Admin dashboard: Subscription mgmt + Disbursement tracker

### Phase 4: QA & Sandbox Testing (Aug 26-31)
- [ ] All 15 payment methods sandbox simulator test
- [ ] All edge cases (failure, timeout, refund, etc.)
- [ ] Webhook reliability test (duplicate, retry)
- [ ] Admin dashboard end-to-end test
- [ ] Security review (key rotation, PII masking)
- [ ] Load test (concurrent payments)
- [ ] Documentation complete

### Phase 5: Production Pilot (Sep 1-30)
- [ ] Switch to Midtrans production keys
- [ ] 5-10 customer pilot (STARTER tier)
- [ ] Monitor payment success rate, settlement time
- [ ] Support runbook
- [ ] Incident response procedures

### Phase 6: General Availability (Oct 1)
- [ ] Open PROFESSIONAL/BUSINESS tiers
- [ ] Full feature rollout
- [ ] Customer communication

---

## 13. Risks & Mitigation

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Midtrans API downtime | HIGH | Monitor status page, escalation contact, fallback manual payment instructions |
| Webhook delivery fail | MEDIUM | Retry logic, reconcile daily vs API, log all webhooks |
| Double payment (idempotency) | CRITICAL | Check transaction_id before processing, DB transaction level |
| Key exposure | CRITICAL | Env variables only, rotate quarterly, audit logs |
| Fraud/chargeback (production) | MEDIUM | 3DS + FDS enabled, monitor chargeback rate, whitelist rules |
| Database schema mismatch | MEDIUM | Prisma migrations, test on staging first, rollback plan |
| Payment method MDR loss | MEDIUM | Monitor MDR per method, negotiate with Midtrans annually |
| Subscription churn | MEDIUM | Track churn rate, proactive outreach, feature improvements |

---

## 14. Assumptions & Constraints

### Assumptions
- Midtrans production account will be approved by Midtrans within 2 weeks (Sep 15)
- Email service (SendGrid/SES) already integrated
- PostgreSQL 16 with Prisma migrations ready
- Admin users already in system (role: SUPER_ADMIN)
- No legal/compliance issues with payment methods for Indonesian market

### Constraints
- **IDR only** (no multi-currency v2.0)
- **Sandbox first** (production pilot Sep 1)
- **No custom fraud rules** (use Midtrans FDS only)
- **Single merchant account** (one Midtrans account for all customers)
- **No rate limiting** per method (use Midtrans limits)

---

## 15. Dependencies

### External
- Midtrans Sandbox + Production API
- Email service (SendGrid/SES)
- PostgreSQL 16, Redis (for Bull queue)

### Internal
- Authentication & authorization (existing)
- Database migrations (Prisma)
- Admin dashboard UI (React 19)
- Backend API (Express 5)

---

## 16. Go/No-Go Criteria for Sandbox

**GO if:**
- ✅ All 15 payment methods tested successfully in sandbox
- ✅ SNAP + Core API + Payment Link working
- ✅ Webhook signature verification passed security review
- ✅ Refund, subscription pause/resume, account linking tested
- ✅ Admin dashboard fully functional
- ✅ No critical security findings
- ✅ Performance baseline met (< 2s payment init)
- ✅ Documentation complete

**NO-GO if:**
- ❌ Any payment method consistently failing
- ❌ Webhook signature bypass discovered
- ❌ Double payment observed
- ❌ Admin dashboard load > 5s
- ❌ Unhandled exceptions in payment flow

---

## 17. Glossary

| Term | Definition |
|------|-----------|
| **SNAP** | Midtrans pre-built payment modal, all methods in one UI |
| **Core API** | Custom checkout API, per-method endpoints, full control |
| **Payment Link** | No-code payment URL, shareable via email/SMS |
| **Recurring** | Auto-charge subscription, Midtrans-managed schedule |
| **Tokenization** | Save card/e-wallet, one-click payment next time |
| **3DS** | 3-Domain Secure, customer OTP challenge for card security |
| **FDS** | Fraud Detection System, Midtrans ML-based risk scoring |
| **Virtual Account (VA)** | Bank-specific account number for transfer payment |
| **Settlement** | Funds confirmed, credit to merchant account (T+0 to T+3) |
| **Refund** | Reverse transaction, amount back to customer |
| **Disbursement** | Payout from merchant account to bank account (affiliate commission) |
| **Iris** | Bulk payout / payroll via Midtrans |
| **MDR** | Merchant Discount Rate, transaction fee % |
| **CLTV** | Customer Lifetime Value, total revenue per customer |
| **MRR** | Monthly Recurring Revenue |
| **ARR** | Annual Recurring Revenue |

---

**Approved by:** Dozer Fernando Saroha Daniel Napitupulu (Founder, CEO, Tech Lead)  
**Version:** 2.0 (Comprehensive)  
**Last Updated:** 26 Juli 2026  
**Target Launch:** Sandbox Aug 31, Production Oct 1, 2026

# dnPeople Xendit Payment Integration
## Product Requirements Document (PRD) v1.0

**Bahasa:** Bahasa Indonesia  
**Mata Uang:** IDR (Rp)  
**Tanggal:** 8 Agustus 2026  
**Status:** Implemented in repo (Aug 2026) — Sandbox E2E Conditional  
**Owner:** PT. Dozer Napitupulu Technology (DN Tech)  

> **Setup operasional:** [XENDIT-PAYMENT-SETUP.md](./XENDIT-PAYMENT-SETUP.md)  
> **Scope implemented (Phase 1):** hosted checkout, webhook, return sync, public invoice pay, admin refund. Payouts / native recurring / balance reports = roadmap PRD.

---

## 1. Ringkasan Eksekutif

dnPeople Xendit Payment Integration v1.0 adalah replacement untuk Midtrans, menggunakan Xendit sebagai payment gateway primary. Sistem ini mendukung:

- ✅ **Payment Request** (pre-built hosted checkout)
- ✅ **Payment API** (direct charge, custom UI)
- ✅ **Payment Token** (tokenization, one-click payment)
- ✅ **Session API** (embedded checkout)
- ✅ **Subscriptions** (recurring billing, monthly auto-charge)
- ✅ **Refund** (manual & auto-refund)
- ✅ **Payouts** (affiliate payout, disbursement)
- ✅ **Webhooks** (real-time status updates, all events)
- ✅ **Balance & Reports** (admin dashboard analytics)
- ✅ **Test Mode Simulation** (sandbox testing all methods)

**Payment Methods Supported (Xendit):**
- Card (Visa, Mastercard, AMEX) dengan 3DS
- E-Wallet (GoPay, OVO, Dana, LinkAja, QRIS)
- Bank Transfer (BCA, Mandiri, BNI, BRI, CIMB, Permata, dsb)
- Installment (via kartu kredit, check available plans)
- BI SNAP (Indonesia Bank Settlement - optional)

**Timeline:**
- **Sandbox (v1.0):** Aug 15-31, 2026
- **Production Pilot:** Sep 1-30, 2026 (5-10 customers)
- **General Availability:** Oct 1, 2026

---

## 2. Objectives & Scope

### 2.1 Tujuan Migrasi

✅ Replace Midtrans dengan Xendit sebagai payment gateway primary
✅ Maintain feature parity (15+ payment methods, subscription, refund, payout)
✅ Improve integration simplicity (single provider vs Midtrans complexity)
✅ Reduce MDR/cost (negotiate better rates with Xendit)
✅ Better Indonesia market coverage (BI SNAP integration)
✅ Improve developer experience (cleaner API, better docs)

### 2.2 Scope In-Scope (v1.0)

✅ Payment Request (hosted checkout - semua payment methods)
✅ Payment API (direct charge - card, bank transfer, e-wallet)
✅ Payment Token (save card, one-click payment)
✅ Session API (embedded checkout untuk custom UI)
✅ Subscriptions API (monthly recurring billing)
✅ Refund (manual admin refund, full & partial)
✅ Payouts (affiliate commission, disbursement single)
✅ Webhooks (payment.completed, payment.failed, payment.expired, subscription updates)
✅ Balance & Reports (admin dashboard)
✅ Test Mode Simulation (sandbox testing tools)
✅ Installment Plans (check available, show to customer)

❌ Out-of-Scope (v1.1+)
❌ Bulk Payouts (batch disbursement - Xendit limitation, use loop)
❌ Foreign Exchange (multi-currency - IDR only for now)
❌ Bill Payments (incoming, not needed)
❌ Advanced fraud rules (use Xendit FDS only)

---

## 3. Business Model & Pricing

### 3.1 Tier Breakdown (Same as Midtrans)

```
FREE:          Rp 0          → 50 emp (NO PAYMENT)
STARTER:       Rp 20K/emp/mo → 1-50 emp (with Xendit)
PROFESSIONAL:  Rp 25K/emp/mo → 51-300 emp (with Xendit)
BUSINESS:      Rp 20K/emp/mo → 301+ emp (with Xendit)
ENTERPRISE:    Custom       → 500+ emp (with Xendit)
```

### 3.2 Xendit MDR Negotiation

**Target:** Better MDR than Midtrans
- Card: 2.5% (vs Midtrans 2.75%)
- E-Wallet: 1.5% (vs Midtrans 1.75%)
- Bank Transfer: 0% (same as Midtrans)
- Installment: 3-4% (competitive)

**Volume:** dnPeople target 1,000-5,000 transactions/month by Q4 2026

---

## 4. Feature Breakdown

### 4.1 Payment Request (Hosted Checkout)

**Best For:** Quick integration, all payment methods in one place

**Customer Journey:**
1. dnPeople backend create Payment Request via Xendit API
2. Get hosted checkout URL
3. Customer redirect to Xendit hosted page (payment.xendit.co/...)
4. Customer select payment method & complete payment
5. Xendit webhook notify dnPeople backend (payment succeeded/failed)
6. Redirect customer back to dnPeople dashboard
7. Display receipt & update subscription status

**Features:**
- ✅ All payment methods available (card, e-wallet, bank, installment)
- ✅ Mobile optimized hosted page
- ✅ Customizable colors/branding (limited)
- ✅ Auto-expiry (30 minutes default)
- ✅ Webhook notification
- ✅ Metadata support (attach custom data)

**Tier Gating:** STARTER+

---

### 4.2 Payment API (Direct Charge / Custom UI)

**Best For:** Full control of UI/UX, custom checkout flow

**Use Cases:**
- Card charge dengan token (saved card)
- Bank transfer dengan auto-generated VA number
- E-Wallet redirect dengan custom flow
- Installment selection & confirmation

**Supported Payment Methods:**
- Card (Visa, MC, AMEX, JCB)
- Bank Transfer (8+ banks)
- E-Wallet (GoPay, OVO, Dana, LinkAja, QRIS, ShopeePay)
- Installment (via participating banks)
- OTC (Indomaret, Alfamart, etc - if Xendit supports)

**Features:**
- ✅ Direct charge (no redirect needed)
- ✅ Installment parameter (select tenor)
- ✅ 3DS handling (auto 3DS for high-risk)
- ✅ Metadata & custom fields
- ✅ Idempotency (same reference_id = same transaction)

**Tier Gating:** PROFESSIONAL+

---

### 4.3 Payment Token (Tokenization / Account Linking)

**Feature:** Save card/e-wallet untuk one-click payment berikutnya

**Flow:**
1. First charge dengan `save_token: true`
2. Xendit return `token_id`
3. Store token secara aman
4. Next payment: charge dengan token (no re-enter card)
5. Customer dapat manage saved methods (delete, set default)

**Security:**
- ✅ Token stored in Xendit (no PCI compliance required for us)
- ✅ Masked card display (****1234, phone: +6281****)
- ✅ Token expiry handling

**Tier Gating:** STARTER+

---

### 4.4 Session API (Embedded Checkout)

**Feature:** Create checkout session untuk embedded (iframe) checkout

**Use Case:** 
- Embed payment form dalam dnPeople dashboard
- Custom styling (match dnPeople branding)
- No redirect needed

**Flow:**
1. Backend create session via `/sessions` endpoint
2. Frontend receive session_id + client_key
3. Embed Xendit checkout script dengan session_id
4. User complete payment dalam iframe
5. Webhook notify completion

**Tier Gating:** BUSINESS+

---

### 4.5 Subscriptions API (Recurring Billing)

**Feature:** Monthly auto-charge untuk subscription (native Xendit recurring)

**Plan Creation:**
1. Create subscription plan (STARTER, PROF, BIZ tiers)
2. Set amount, interval (MONTH), auto-charge day
3. Customer agree to recurring charge
4. Xendit charge automatically setiap bulan
5. Webhook notify success/fail

**Customer Management:**
- ✅ Pause subscription (skip X months)
- ✅ Resume subscription
- ✅ Cancel subscription
- ✅ Upgrade/downgrade (change tier, pro-rate charge)
- ✅ Force attempt (manual trigger charge)

**Features:**
- ✅ Failed charge retry (3 attempts over 3 days)
- ✅ Cycle tracking (which month of subscription)
- ✅ Notification before charge
- ✅ Pause/resume flexibility

**Tier Gating:** STARTER+

---

### 4.6 Refund

**Feature:** Reverse payment (full atau partial)

**Admin Refund Flow:**
1. Admin click "Refund" di payment detail
2. Select amount (full atau partial)
3. Enter reason
4. Xendit process refund
5. Customer receive refund (T+1 to T+5 business days)
6. Log entry created

**Auto-Refund Rules (Future):**
- Failed payment after 3 retries → auto-refund
- Chargeback received → notify admin
- Subscription cancellation → refund pro-rata

**Tier Gating:** STARTER+ (admin only)

---

### 4.7 Payouts (Disbursement)

**Feature:** Send money to bank account (affiliate payout, referral bonus)

**Use Case:**
- Pay affiliate commission
- Referral bonus payout
- Manual seller payout

**Flow:**
1. Admin request payout (amount, bank, account number)
2. Xendit `/payouts` API
3. Settlement T+1 (next business day)
4. Webhook notify success/failed
5. Payout statement available

**Bank Support:** 20+ banks (BCA, Mandiri, BNI, BRI, CIMB, Permata, dsb)

**Tier Gating:** BUSINESS+

---

### 4.8 Webhooks (Real-Time Notifications)

**Events:**
1. `payment.completed` - Payment succeeded
2. `payment.failed` - Payment failed
3. `payment.expired` - Payment request expired
4. `payment.cancelled` - Payment cancelled by user
5. `payment.request.webhook_notification` - PR webhook
6. `refund.completed` - Refund succeeded
7. `refund.failed` - Refund failed
8. `subscription.created` - Subscription created
9. `subscription.activated` - Subscription started
10. `subscription.cycle_created` - New billing cycle
11. `subscription.cycle_succeeded` - Charge succeeded
12. `subscription.cycle_failed` - Charge failed
13. `subscription.paused` - Subscription paused
14. `subscription.resumed` - Subscription resumed
15. `subscription.stopped` - Subscription stopped

**Security:**
- ✅ Webhook signature verification (X-Xendit-Callback-Token)
- ✅ Retry logic (Xendit retry 5x in 24h if non-200 response)
- ✅ Idempotency (check payment_id before processing)

**Tier Gating:** All

---

### 4.9 Balance & Reports

**Features:**
- ✅ Current account balance (real-time)
- ✅ Transaction history (filterable, paginable)
- ✅ Settlement reports (daily/monthly)
- ✅ Commission reports (by tier, by customer)
- ✅ Payout history

**Admin Dashboard:**
- Payment success rate by method
- Average settlement time
- Revenue by payment method
- Subscription churn rate
- MRR/ARR trends

**Tier Gating:** SUPER_ADMIN only

---

### 4.10 Test Mode Simulation

**Features:**
- ✅ Simulate payment success/failure
- ✅ Test all payment methods (card, e-wallet, bank)
- ✅ Trigger webhook events
- ✅ Check installment availability
- ✅ Test refund flow

**Test Credentials:**
- Card: `4000 0000 0000 0002` (success), `4000 0000 0000 0127` (fail)
- Phone: any number works for OTP
- Bank: auto-generate VA for testing

---

## 5. Tier Gating Matrix

```
FREE (Rp 0):
  ✗ No payment processing
  
STARTER (Rp 20K/emp/mo):
  ✓ Payment Request (all methods)
  ✓ Payment API (card, bank, e-wallet)
  ✓ Payment Token (one-click)
  ✓ Subscriptions (monthly auto-charge)
  ✓ Refund (admin manual)
  ✗ Payout
  ✗ Session API
  
PROFESSIONAL (Rp 25K/emp/mo):
  ✓ All STARTER +
  ✓ Installment planning
  ✗ Payout
  ✗ Session API
  
BUSINESS (Rp 20K/emp/mo):
  ✓ All PROFESSIONAL +
  ✓ Payout (affiliate)
  ✓ Session API (embedded checkout)
  ✓ Advanced webhook filtering
  
ENTERPRISE (Custom):
  ✓ All BUSINESS +
  ✓ Bulk Payout simulation (via loop)
  ✓ Custom webhook logic
  ✓ Dedicated support
```

---

## 6. Data Model (High Level)

### Core Entities

**payment**
- id, company_id, order_id (UNIQUE), payment_request_id, session_id
- amount, currency, payment_status (pending, completed, failed, expired, cancelled)
- payment_method (card, bank_transfer, ewallet, installment)
- fraud_status, settlement_time, xendit_response_full (JSON)
- created_at, settled_at, subscription_id FK, invoice_id FK

**payment_token**
- id, company_id, token_id (from Xendit), payment_type
- masked_data (last4, brand, phone), payment_method_name (user label)
- is_default, is_active, created_at

**subscription**
- id, company_id, subscription_plan_id (Xendit), tier, employee_count
- status (active, paused, stopped), amount, interval, total_recurrence
- current_cycle, next_billing_date, created_at

**refund**
- id, payment_id, amount, reason, refund_status (requested, completed, failed)
- initiated_by, initiated_at, completed_at

**payout**
- id, payout_id (from Xendit), amount, bank_code, account_number, account_holder
- status (pending, completed, failed), created_at, settled_at

**webhook_log**
- id, event_type, payload (JSON), delivered, response_status, retries, last_retry_at

---

## 7. Success Metrics (Sandbox)

### Testing
- ✅ 10+ payment methods tested end-to-end
- ✅ Payment Request flow tested (all tiers)
- ✅ Direct charge (Payment API) tested
- ✅ Subscription auto-charge tested (mock monthly)
- ✅ Refund (manual) tested
- ✅ Payout tested
- ✅ Webhook signature verification (no failures)
- ✅ Webhook idempotency (no double charges)
- ✅ Token/one-click payment tested
- ✅ Session embedded checkout tested

### Performance
- Payment initiation: < 2s
- Webhook processing: < 1s
- Payment status query: < 500ms (cache)
- Report generation: < 5s

### Reliability
- Webhook delivery success rate: > 99%
- Payment success rate (by method): > 95%
- No double-charging detected

---

## 8. Timeline

### Phase 1: Foundation (Aug 15-20)
- [ ] Xendit account setup (sandbox)
- [ ] API key configuration
- [ ] Database schema creation
- [ ] Backend service skeleton
- [ ] PaymentService, SubscriptionService, WebhookService

### Phase 2: Core APIs (Aug 21-27)
- [ ] Payment Request API integration
- [ ] Payment API (direct charge)
- [ ] Webhook receiver & verification
- [ ] Payment Token (tokenization)
- [ ] Test all payment methods

### Phase 3: Subscriptions (Aug 28-31)
- [ ] Subscriptions API (recurring)
- [ ] Pause/Resume/Cancel logic
- [ ] Refund API
- [ ] Payout API
- [ ] Admin dashboard basic

### Phase 4: QA & Polish (Sep 1-7)
- [ ] Sandbox full QA (all 10+ methods)
- [ ] Webhook reliability test
- [ ] Performance baseline
- [ ] Security review
- [ ] Documentation complete

### Phase 5: Production Pilot (Sep 8-30)
- [ ] Switch to Xendit production keys
- [ ] 5-10 customer pilot
- [ ] Monitor payment success rate
- [ ] Support runbook
- [ ] Incident response

### Phase 6: GA (Oct 1)
- [ ] Open to all STARTER+ tiers
- [ ] Full feature rollout
- [ ] Customer communication

---

## 9. Risks & Mitigation

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Xendit API downtime | HIGH | Monitor status page, escalation contact, fallback manual payment |
| Webhook delivery fail | MEDIUM | Retry logic, daily reconciliation, log all webhooks |
| Missing payment methods | MEDIUM | Xendit supports ≥90% same methods as Midtrans (verified in scope) |
| Double charge (idempotency) | CRITICAL | Check payment_id before processing, DB transaction SERIALIZABLE |
| Token/key exposure | CRITICAL | Env variables only, rotate quarterly, audit logs |
| Subscription cycle failure | MEDIUM | Retry 3x over 3 days (Xendit native), notify customer |
| Payout account mismatch | MEDIUM | Validate account number format, verify with bank code |

---

## 10. Assumptions & Dependencies

### Assumptions
- Xendit production account will be approved within 2 weeks
- Xendit supports ≥90% same payment methods as Midtrans
- Email service already integrated (SendGrid/SES)
- PostgreSQL & Prisma ready for migrations
- Authentication & authorization system in place

### Dependencies
- Xendit Sandbox API (available Aug 8)
- Xendit Production API keys (by Sep 1)
- Email service for notifications
- PostgreSQL database
- Redis for queue management
- Bull queue for async jobs

---

## 11. Go/No-Go Criteria for Sandbox

**GO if:**
- ✅ 10+ payment methods tested successfully
- ✅ Subscription monthly charge tested
- ✅ Refund tested (full & partial)
- ✅ Payout tested
- ✅ Webhook signature verification passed
- ✅ No idempotency issues (no double charges)
- ✅ Admin dashboard functional
- ✅ Performance baseline met (< 2s payment init)
- ✅ No critical security findings
- ✅ Documentation complete

**NO-GO if:**
- ❌ Any payment method consistently failing
- ❌ Webhook signature bypass discovered
- ❌ Double charging observed
- ❌ Admin dashboard load > 5s
- ❌ Settlement time > 24 hours
- ❌ Missing critical payment methods

---

## 12. Glossary

| Term | Definition |
|------|-----------|
| **Payment Request** | Hosted checkout page by Xendit (like SNAP) |
| **Payment API** | Direct charge endpoint (custom UI) |
| **Token** | Saved payment method (card/e-wallet) |
| **Session** | Embedded checkout session (iframe) |
| **Subscription** | Recurring payment plan (monthly auto-charge) |
| **Cycle** | One billing period in subscription |
| **Payout** | Disbursement (send money to bank) |
| **Webhook** | Real-time notification from Xendit |
| **Refund** | Reverse payment (money back to customer) |
| **MDR** | Merchant Discount Rate (transaction fee %) |
| **Settlement** | Funds confirmed & credited to account |
| **3DS** | 3-Domain Secure (OTP challenge for card) |
| **FDS** | Fraud Detection System (Xendit ML-based) |
| **VA** | Virtual Account (bank transfer number) |

---

**Approved by:** Dozer Fernando Saroha Daniel Napitupulu (Founder, CEO)  
**Version:** 1.0 (Complete)  
**Last Updated:** 8 Agustus 2026  
**Target:** Sandbox Aug 31, Production Oct 1, 2026

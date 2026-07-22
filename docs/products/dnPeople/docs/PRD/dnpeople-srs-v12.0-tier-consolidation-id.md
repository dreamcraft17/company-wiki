# dnPeople — SRS v12.0
## Subscription Tier Consolidation - Requirements & Acceptance Criteria

**Versi:** 12.0  
**Tanggal:** 22 Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Status:** Detailed requirements untuk implementation

---

## FR-TIER-001: Tier Definitions Enforcement

**ID:** FR-TIER-001  
**Priority:** P0 (Critical)  
**Owner:** Backend Engineer

### Requirement

```
Database HARUS memiliki tier configuration yang seragam.
Tier limits HARUS enforce di backend (tidak hanya UI).
Trial duration HARUS otomatis expire per tier.

Acceptance Criteria:

AC-1.1: Tier Constants Defined
  Given backend configured
  When application starts
  Then:
    - TIER_FEATURES object contains all 5 tiers (FREE, STARTER, PROF, BUS, ENT)
    - Each tier has properties:
      [ ] maxEmployees (50, 50, 300, unlimited, unlimited)
      [ ] pricePerEmployee (0, 20k, 25k, 20k, custom)
      [ ] trialMonths (4, 2, 2, 2, N/A)
      [ ] apiCallsPerDay (1k, 10k, 50k, unlimited, unlimited)
      [ ] features: [] array of feature names
      [ ] restrictions: {} object of disabled features
    - Values match PRD v12.0 exactly (no discrepancies)
    
Test case:
  T1.1: Verify tier constants
    - console.log(TIER_FEATURES['STARTER'])
    - ✓ maxEmployees === 50
    - ✓ pricePerEmployee === 20000
    - ✓ trialMonths === 2
    - ✓ apiCallsPerDay === 10000

AC-1.2: Tier Configuration in Database
  Given application initialized
  When database schema verified
  Then:
    - Subscription table has tier ENUM field
    - Subscription table has createdAt, trialEndsAt fields
    - FeatureAccess table exists (tier, feature, enabled)
    - Data seeded with default features per tier
    - All 5 tiers have full feature matrix defined
    
Test case:
  T1.2: Query database
    - SELECT DISTINCT tier FROM subscription;
    - ✓ Returns: FREE, STARTER, PROFESSIONAL, BUSINESS, ENTERPRISE
    - SELECT * FROM feature_access WHERE tier='STARTER';
    - ✓ Returns 20+ features with enabled=true/false per tier

AC-1.3: Environment Variables Match PRD
  Given .env file configured
  When environment loaded at startup
  Then:
    - TIER_FREE_MAX_EMPLOYEES=50
    - TIER_STARTER_MAX_EMPLOYEES=50
    - TIER_PROFESSIONAL_MAX_EMPLOYEES=300
    - TIER_BUSINESS_MAX_EMPLOYEES=unlimited
    - TIER_STARTER_PRICE=20000
    - TIER_PROFESSIONAL_PRICE=25000
    - All other env vars match PRD v12.0
    - No hardcoded numbers in code (all from env)
    
Test case:
  T1.3: Check environment at startup
    - console.log(process.env.TIER_STARTER_MAX_EMPLOYEES)
    - ✓ Equals 50 (from .env)
    - app.config.tiers.STARTER.maxEmployees === 50
    - ✓ No hardcoded values in code

AC-1.4: Tier Backward Compatibility
  Given existing customers
  When migration runs
  Then:
    - Existing subscriptions NOT changed
    - Trial dates recalculated based on createdAt
    - Features assigned based on existing tier
    - No data loss during migration
    
Test case:
  T1.4: Verify backward compatibility
    - Run migration on test database with sample data
    - ✓ All 100 existing subscriptions still present
    - ✓ Trial end dates calculated correctly
    - ✓ Feature access matches current tier
```

---

## FR-TIER-002: Employee Count Limit Enforcement

**ID:** FR-TIER-002  
**Priority:** P0 (Critical)  
**Owner:** Backend Engineer

### Requirement

```
Employee creation MUST be blocked if tier limit exceeded.
Employee count enforcement MUST be checked before create/import.
Soft limit (warning) → Hard limit (blocked).

Acceptance Criteria:

AC-2.1: Hard Limit Enforcement on Create
  Given user on STARTER tier (max 50)
  When trying to create 51st employee
  Then:
    - API returns 403 Forbidden
    - Error message: "Employee limit reached: 50/50 in STARTER plan"
    - Employee NOT created
    - Suggests: "Upgrade to PROFESSIONAL for 300 employees"
    
Test case:
  T2.1: Create employee at limit
    - POST /api/v1/employees { name: 'John' }
    - Company has 50 employees (at limit)
    - ✓ Response status: 403
    - ✓ Error message contains "limit reached"
    - ✓ Employee count still 50 (not created)

AC-2.2: Hard Limit Enforcement on Bulk Import
  Given user on PROFESSIONAL tier (max 300)
  When importing CSV with 350 employees
  Then:
    - Import validation fails
    - Returns: "Cannot import 350 employees. Your plan supports 300 max."
    - Suggests bulk import mode: import in batches
    - Dry-run shows: "Will import first 300, skip remaining 50"
    - Import does NOT proceed without confirmation
    
Test case:
  T2.2: Bulk import at limit
    - POST /api/v1/employees/import (CSV with 350 rows)
    - Company has 0 employees, PROFESSIONAL tier
    - ✓ Dry-run shows: "Can import 300 of 350"
    - ✓ Proceed requires confirmation
    - ✓ Import completes successfully (inserts 300)

AC-2.3: Soft Limit Warning
  Given user on STARTER (max 50)
  When employee count reaches 40 (80% of limit)
  Then:
    - Warning email sent to admin
    - In-app banner shows: "40/50 employees. Upgrade to add more."
    - Warning triggers at 80%+ of limit
    - Repeats every 7 days while at warning level
    
Test case:
  T2.3: Soft limit warning triggered
    - Company STARTER tier, 40 employees
    - Check admin email: warning received
    - ✓ Email subject: "Employee limit warning"
    - ✓ In-app banner visible (hardcoded check)
    - Repeat 7 days later: warning sent again
    - ✓ Email sent on day 7 again

AC-2.4: Employee Limit in Different Tiers
  Given customers in different tiers
  When checking limits
  Then:
    - FREE: Can create 50, blocked at 51
    - STARTER: Can create 50, blocked at 51
    - PROFESSIONAL: Can create 300, blocked at 301
    - BUSINESS: Can create unlimited (warn at 1000)
    - ENTERPRISE: Can create unlimited (no warning)
    
Test case:
  T2.4: Verify all tier limits
    - Create 50 employees as FREE → success
    - Try 51st → 403 error
    - Create 50 employees as STARTER → success
    - Try 51st → 403 error
    - (etc for all tiers)
    - ✓ All limits enforced correctly
```

---

## FR-TIER-003: Trial Duration Enforcement

**ID:** FR-TIER-003  
**Priority:** P0 (Critical)  
**Owner:** Backend Engineer

### Requirement

```
Trial period MUST expire automatically per tier configuration.
Trial dates MUST be calculated from createdAt.
FREE tier MUST have 4-month trial (permanent).
PAID tiers MUST have 2-month trial.

Acceptance Criteria:

AC-3.1: Trial Duration Calculation
  Given user creates subscription on 2026-07-22
  When subscription created with tier
  Then:
    - FREE tier: trialEndsAt = 2026-07-22 + 120 days = 2026-11-20 (4 months)
    - STARTER: trialEndsAt = 2026-07-22 + 60 days = 2026-09-20 (2 months)
    - PROFESSIONAL: trialEndsAt = 2026-07-22 + 60 days = 2026-09-20
    - BUSINESS: trialEndsAt = 2026-07-22 + 60 days = 2026-09-20
    - ENTERPRISE: N/A (no trial, custom negotiation)
    
Test case:
  T3.1: Calculate trial dates
    - Create subscription: tier='STARTER', createdAt='2026-07-22'
    - Query subscription.trialEndsAt
    - ✓ Equals 2026-09-20 (60 days later)
    - Create subscription: tier='FREE', createdAt='2026-07-22'
    - ✓ trialEndsAt equals 2026-11-20 (120 days later)

AC-3.2: Trial Active Status
  Given subscription in active trial
  When checking trial status
  Then:
    - isTrialing = true
    - daysRemaining calculated as: trialEndsAt - today
    - Example: trialEndsAt=2026-09-20, today=2026-07-25
      daysRemaining = 57 days
    - After trial end date: isTrialing = false
    
Test case:
  T3.2: Check trial status
    - API: GET /api/v1/subscription/status
    - Response: { isTrialing: true, daysRemaining: 57, trialEndsAt: '2026-09-20' }
    - Advance system date to 2026-09-21 (after trial)
    - ✓ isTrialing becomes false

AC-3.3: Trial Expiration Actions
  Given trial expiration date reached
  When daily cron job runs (checks for expired trials)
  Then:
    For FREE tier:
      - Trial "expires" but user stays FREE indefinitely
      - No action needed
    
    For PAID tiers WITHOUT payment method:
      - Trial expired
      - Subscription status changes to "trial_expired"
      - User downgraded to FREE tier
      - Email sent: "Your trial has ended"
      - Cannot access paid features anymore
    
    For PAID tiers WITH payment method:
      - Trial expired
      - AUTO-CHARGE for first month
      - Subscription status changes to "active"
      - Invoice generated
      - Confirmation email sent
    
Test case:
  T3.3: Trial expiration handling
    - Create STARTER subscription: 2026-05-22
    - Trial ends: 2026-07-20
    - Today: 2026-07-21
    - Run daily cron: checkTrialExpirations()
    - If NO payment: subscription.tier = 'FREE', status = 'trial_expired'
    - If payment present: auto-charge runs, status = 'active'
    - ✓ Email sent (verify Sendgrid)

AC-3.4: Trial Reminders
  Given trial ending soon
  When trial has < 5 days remaining
  Then:
    - Email sent to company admin: "Trial ending in X days"
    - Email subject: "2 months free trial ending soon"
    - Email content shows:
      [ ] Days remaining
      [ ] Upcoming charge amount (Rp X/month)
      [ ] Link to update payment
      [ ] Link to upgrade tier
      [ ] Link to downgrade / cancel
    - Email sent when 5 days remain, AND when 1 day remains
    
Test case:
  T3.4: Trial reminder emails
    - Set trial to end 2026-09-20
    - Run cron daily
    - On 2026-09-15 (5 days before): email sent
    - ✓ Email received in test inbox
    - On 2026-09-19 (1 day before): email sent
    - ✓ Email received again
```

---

## FR-TIER-004: API-Level Feature Gating

**ID:** FR-TIER-004  
**Priority:** P0 (Critical)  
**Owner:** Backend Engineer

### Requirement

```
API endpoints MUST be gated by tier.
Unauthorized feature access MUST return 403 Forbidden.
Feature matrix MUST be enforced at middleware level.

Acceptance Criteria:

AC-4.1: Payroll Endpoint Gating
  Given user on FREE tier (payroll disabled)
  When calling POST /api/v1/payroll/run
  Then:
    - Returns 403 Forbidden
    - Error: "Feature payroll requires STARTER tier or higher"
    - Suggests: "Upgrade to STARTER to enable payroll"
    
Test case:
  T4.1: FREE user access payroll
    - GET /api/v1/payroll (logged in as FREE user)
    - ✓ Response status: 403
    - ✓ Error message mentions STARTER tier

AC-4.2: Attendance Endpoint Gating
  Given user on FREE tier
  When calling GET /api/v1/attendance
  Then:
    - Returns 403 Forbidden
    - Error: "Attendance not available in FREE plan"
    
Test case:
  T4.2: FREE user access attendance
    - GET /api/v1/attendance
    - ✓ Status: 403

AC-4.3: Recruitment Endpoint Gating
  Given user on STARTER tier (recruitment disabled)
  When calling POST /api/v1/recruitment/jobs
  Then:
    - Returns 403 Forbidden
    - Suggests: "Upgrade to PROFESSIONAL for recruitment"
    
Test case:
  T4.3: STARTER user access recruitment
    - POST /api/v1/recruitment/jobs { title: 'Engineer' }
    - ✓ Status: 403

AC-4.4: API Endpoints Allow for Gated Tier
  Given user on PROFESSIONAL tier
  When calling POST /api/v1/recruitment/jobs
  Then:
    - Returns 200 OK (allowed)
    - Job created successfully
    
Test case:
  T4.4: PROFESSIONAL user access recruitment
    - POST /api/v1/recruitment/jobs { title: 'Engineer' }
    - ✓ Status: 201 (created)
    - ✓ Job appears in list

AC-4.5: API Rate Limiting
  Given user with API key (STARTER: 10k calls/day limit)
  When making API calls in one day
  Then:
    - Calls 1-9,999: Success (200 OK)
    - Call 10,000: Success (last allowed)
    - Call 10,001: Returns 429 Too Many Requests
    - Error message: "Daily API limit exceeded: 10,000 calls"
    - Rate limit header shows: X-RateLimit-Remaining: 0
    
Test case:
  T4.5: API rate limit enforcement
    - Loop: make 10,001 API calls
    - First 10,000: ✓ Status 200
    - Call 10,001: ✓ Status 429
    - Response header includes rate limit info
```

---

## FR-TIER-005: UI-Level Feature Gating

**ID:** FR-TIER-005  
**Priority:** P1 (High)  
**Owner:** Frontend Engineer

### Requirement

```
UI navigation MUST reflect tier permissions.
Disabled features MUST be hidden or show unlock prompts.
Tier-restricted pages MUST redirect or prompt upgrade.

Acceptance Criteria:

AC-5.1: Navigation Items Hidden Per Tier
  Given user on FREE tier
  When viewing navigation menu
  Then:
    - Available items: Employees, Org, Dashboard, Settings
    - Hidden items: Payroll, Attendance, Leave, Recruitment, Training, Reports
    - No broken links to hidden features
    - Navigation rebuilds when subscription changes
    
Test case:
  T5.1: FREE tier navigation
    - Login as FREE user
    - View left navigation
    - ✓ "Employees" visible
    - ✓ "Payroll" NOT visible (hidden)
    - ✓ "Attendance" NOT visible
    - ✓ "Recruitment" NOT visible

AC-5.2: Page Redirection for Restricted Features
  Given user on FREE tier
  When navigating to /payroll (direct URL)
  Then:
    - Redirects to /upgrade?feature=payroll
    - Shows upgrade prompt with:
      [ ] Reason: "Payroll requires STARTER tier"
      [ ] Current tier: FREE
      [ ] Recommended tier: STARTER
      [ ] Button: "Upgrade to STARTER"
      [ ] Button: "Learn more"
    
Test case:
  T5.2: Direct URL to restricted page
    - Navigate to /payroll as FREE user
    - ✓ Redirects to /upgrade?feature=payroll
    - ✓ Upgrade prompt shows

AC-5.3: Inline Upgrade Prompts
  Given user on STARTER tier
  When trying to access recruitment feature
  Then:
    - Feature section visible but disabled
    - Shows locked icon + overlay
    - Message: "Recruitment available in PROFESSIONAL tier"
    - Button: "Upgrade to PROFESSIONAL"
    - Lists benefits of PROFESSIONAL (300 employees, recruitment, etc)
    
Test case:
  T5.3: Inline upgrade prompt for recruitment
    - Login as STARTER user
    - Navigate to /recruitment (if accessible)
    - ✓ See disabled overlay
    - ✓ "Upgrade" button present + clickable

AC-5.4: Tier Badge in UI
  Given user viewing account info
  When checking profile/settings
  Then:
    - Current tier displayed (e.g., "PROFESSIONAL")
    - Employee count shown (e.g., "45/300")
    - Trial status shown if applicable (e.g., "Trial: 15 days left")
    - Link to upgrade or manage subscription
    
Test case:
  T5.4: Tier info in settings
    - Open /settings or /billing
    - ✓ Current tier shows: "PROFESSIONAL"
    - ✓ Employee count shows: "45/300"
    - ✓ Trial countdown shows if applicable
```

---

## FR-TIER-006: Billing & Charging Logic

**ID:** FR-TIER-006  
**Priority:** P0 (Critical)  
**Owner:** Backend Engineer + Payments Team

### Requirement

```
Billing MUST calculate correctly per tier/employees.
Auto-charge MUST trigger after trial ends.
Invoices MUST be generated for each billing cycle.

Acceptance Criteria:

AC-6.1: Monthly Charge Calculation
  Given STARTER subscription with 30 employees
  When trial ends and billing begins
  Then:
    - Monthly charge = 30 employees × Rp 20.000 = Rp 600.000
    - Invoice generated with line items:
      [ ] Description: "dnPeople STARTER - July 2026"
      [ ] Quantity: 30 (employees)
      [ ] Unit price: Rp 20.000
      [ ] Total: Rp 600.000
    - Charge processed through Xendit/Stripe
    - Invoice marked as "Paid" if charge successful
    
Test case:
  T6.1: Calculate monthly charge
    - Subscription: STARTER, 30 employees
    - Trial ends, billing starts
    - Check invoice: amount = Rp 600.000
    - ✓ Matches 30 × 20.000

AC-6.2: Auto-Charge After Trial
  Given STARTER subscription with payment method on file
  When trial end date reached (60 days after signup)
  Then:
    - Auto-charge triggered
    - Amount = employees × price per employee
    - Payment processor called (Xendit)
    - Charge marked as "pending" until receipt
    - Confirmation email sent if successful
    - Retry email sent if failed
    - Subscription remains "active" during charge
    
Test case:
  T6.2: Auto-charge on trial end
    - Create subscription: STARTER, 30 emp, July 22
    - Trial ends: September 20
    - On Sept 20, run billing.chargeAllExpiredTrials()
    - ✓ Xendit API called
    - ✓ Invoice created for Rp 600K
    - ✓ Email sent to admin

AC-6.3: Pro-Rata Charge on Upgrade
  Given subscription on STARTER (Rp 600K/month for 30 emp)
  When user upgrades to PROFESSIONAL on day 15 of month
  Then:
    - Days used: 15/30
    - Days remaining: 15
    - Current charge (daily rate): Rp 600K / 30 = Rp 20K/day
    - Credit from current month: Rp 20K × 15 = Rp 300K
    
    - New tier: PROFESSIONAL (Rp 25K/emp)
    - New monthly charge: 30 emp × Rp 25K = Rp 750K
    - Daily rate for new tier: Rp 750K / 30 = Rp 25K/day
    - Charge for 15 remaining days: Rp 25K × 15 = Rp 375K
    
    - Upgrade charge: Rp 375K - Rp 300K = Rp 75K
    - Billed immediately (credit card)
    - Next full billing date stays same (same day each month)
    
Test case:
  T6.3: Pro-rata upgrade charge
    - Create STARTER on day 1 of month (100K)
    - Upgrade to PROFESSIONAL on day 15
    - ✓ Charge calculated: Rp 75K (prorated difference)
    - ✓ Charged immediately to payment method
    - ✓ Next billing date unchanged (same day)

AC-6.4: Invoice Generation
  Given monthly billing cycle
  When subscription billed
  Then:
    - Invoice generated with:
      [ ] Invoice number (unique per company)
      [ ] Date (billing date)
      [ ] Period (month/year)
      [ ] Company name + address
      [ ] Line items (tier, quantity, price, total)
      [ ] Tax (if applicable)
      [ ] Payment status
      [ ] Payment method used
    - Invoice stored in system
    - Email sent to admin (PDF attachment)
    - Invoice accessible in /billing/invoices
    
Test case:
  T6.4: Invoice generation
    - View /billing/invoices
    - ✓ Invoices list shows all past invoices
    - ✓ Each invoice has PDF link
    - ✓ Email received with PDF
```

---

## FR-TIER-007: Upgrade & Downgrade Flow

**ID:** FR-TIER-007  
**Priority:** P1 (High)  
**Owner:** Backend Engineer

### Requirement

```
Upgrade/downgrade MUST process cleanly.
Pro-rata charges MUST be calculated correctly.
Features MUST be enabled/disabled immediately.

Acceptance Criteria:

AC-7.1: Upgrade Flow
  Given user on STARTER (50 employees max)
  When user clicks "Upgrade to PROFESSIONAL"
  Then:
    - Shows upgrade preview:
      [ ] Current tier: STARTER
      [ ] New tier: PROFESSIONAL
      [ ] Current price: Rp X/month
      [ ] New price: Rp Y/month
      [ ] Upgrade fee (pro-rata): Rp Z
      [ ] New features unlocked: recruitment, performance, etc
    - User confirms upgrade
    - Charge processed (pro-rata amount)
    - Tier updated in database
    - Features enabled immediately
    - Email confirmation sent
    
Test case:
  T7.1: Upgrade to higher tier
    - Click "Upgrade to PROFESSIONAL"
    - ✓ Preview shows pro-rata fee
    - Confirm upgrade
    - ✓ Charge processed
    - ✓ Navigation updated (recruitment now visible)

AC-7.2: Downgrade Restrictions
  Given user on PROFESSIONAL (100 employees)
  When trying to downgrade to STARTER (50 max)
  Then:
    - Shows warning: "Cannot downgrade: you have 100 employees"
    - Options:
      [ ] Delete 50 employees, then downgrade
      [ ] Keep current tier
      [ ] Contact sales for custom solution
    - No charge until confirmed by user
    
Test case:
  T7.2: Downgrade with too many employees
    - Try to downgrade PROFESSIONAL → STARTER
    - ✓ Warning shown (100 emp > 50 limit)
    - ✓ No charge processed yet

AC-7.3: Downgrade Allowed
  Given user on PROFESSIONAL (30 employees)
  When downgrading to STARTER
  Then:
    - Allowed (30 < 50 limit)
    - Downgrade effective: end of current billing period
    - No refund for current period
    - Next month: lower price charged
    - Confirmation email sent
    
Test case:
  T7.3: Downgrade to lower tier
    - PROFESSIONAL with 30 employees
    - Downgrade to STARTER (allowed)
    - ✓ Confirmation: "Changes effective next billing cycle"
    - ✓ Email sent
    - Next month: STARTER charge applied
```

---

## FR-TIER-008: Grace Period & Suspension

**ID:** FR-TIER-008  
**Priority:** P1 (High)  
**Owner:** Backend Engineer

### Requirement

```
Payment failures MUST trigger grace period.
Suspended subscriptions MUST go read-only.
Recovery MUST be possible within 30 days.

Acceptance Criteria:

AC-8.1: Payment Failure Handling
  Given charge fails (card declined, insufficient funds)
  When first charge attempt fails
  Then:
    - Email sent: "Payment failed"
    - Link to update payment method
    - Retry scheduled for 3 days later
    - Subscription status: "active" (grace period)
    - Features still accessible
    - Banner in app: "Payment required"
    
Test case:
  T8.1: First payment failure
    - Simulate Xendit charge failure
    - ✓ Email sent to admin
    - ✓ Admin can update payment in /billing
    - ✓ App still functional (no 403s)
    - ✓ Banner shows payment warning

AC-8.2: Grace Period Exhaustion
  Given payment failed 3 days ago
  When retry date reached and charge fails again
  Then:
    - Subscription status changes to "grace_period"
    - Email sent: "Subscription will be suspended in 3 days"
    - Urgent banner shown in app
    - Features still accessible (read/write)
    - Example: payroll still runs, but "payment overdue" warning
    
Test case:
  T8.2: Grace period warning
    - First charge fails (day 1)
    - Retry fails (day 4)
    - ✓ Status: "grace_period"
    - ✓ Urgent email sent

AC-8.3: Subscription Suspension
  Given grace period has expired (7 days after initial failure)
  When suspension date reached
  Then:
    - Subscription status: "suspended"
    - Company switched to READ-ONLY mode
    - API endpoints blocked for mutations (POST, PUT, DELETE)
    - GET endpoints still work (view data)
    - Payroll cannot be run
    - Leave cannot be approved
    - Email sent: "Subscription suspended"
    - Link to update payment + reactivate
    
Test case:
  T8.3: Suspension activated
    - Charge fails (day 1)
    - Retry fails (day 4)
    - Suspend date reached (day 7)
    - Try POST /api/v1/payroll/run
    - ✓ Status: 403 Forbidden
    - ✓ Error: "Subscription suspended. Update payment to continue."
    - GET /api/v1/payroll
    - ✓ Status: 200 (can view data)

AC-8.4: Reactivation After Suspension
  Given subscription suspended
  When user updates payment method
  Then:
    - User clicks "Reactivate"
    - Pending charge + current prorated amount charged
    - Subscription status: "active"
    - All features restored
    - Banner removed
    - Email confirmation sent
    - History logged in audit
    
Test case:
  T8.4: Reactivate after suspension
    - Update payment in /billing
    - Click "Reactivate"
    - ✓ Charge processed (overdue + current)
    - ✓ Status: "active"
    - ✓ Payroll accessible again
    - ✓ Email confirmation sent
```

---

## NFR-TIER: Performance & Data Consistency

```
NFR-1: Tier Checks Low Latency
  - Tier gate middleware: < 10ms per request
  - Employee count check: < 50ms (with caching)
  - Feature access lookup: < 5ms (in-memory array)

NFR-2: Trial & Billing Accuracy
  - Trial expiration dates accurate to the second
  - Billing calculations match manual calculation exactly
  - No double-charging (idempotent)
  - All timestamps in UTC

NFR-3: Data Consistency
  - Subscription and FeatureAccess in sync
  - No orphaned records
  - Audit trail for all tier/billing changes
  - Backup includes Subscription + FeatureAccess

NFR-4: Tier Changes Atomic
  - Upgrade/downgrade: all-or-nothing
  - If charge fails, tier NOT changed
  - If tier changed, features updated
  - No partial updates
```

---

## Launch Gate Checklist (Tier Consolidation)

```
TIER STRUCTURE:
  [ ] All 5 tiers defined (FREE, STARTER, PROF, BUS, ENT)
  [ ] Employee limits set: 50, 50, 300, unlimited, unlimited
  [ ] Prices correct: Rp 0, 20k, 25k, 20k, custom
  [ ] Trial durations: 4 months, 2 months, 2 months, 2 months, N/A
  [ ] API limits: 1k, 10k, 50k, unlimited, unlimited
  [ ] All features documented in matrix

ENFORCEMENT:
  [ ] Employee count hard limits working (can't exceed)
  [ ] Soft limit warnings sent (80% threshold)
  [ ] Trial expiration automatic (per tier)
  [ ] API rate limits enforced (hard block at limit)
  [ ] Feature gating working (403 for unauthorized access)

BILLING:
  [ ] Monthly charges calculated correctly
  [ ] Auto-charge on trial end (with payment method)
  [ ] Pro-rata charges on upgrade
  [ ] Invoices generated + emailed
  [ ] Failed charge retry logic working
  [ ] Grace period + suspension working

UI/UX:
  [ ] Navigation reflects tier permissions
  [ ] Upgrade prompts clear + conversion-focused
  [ ] Tier badge shows in settings
  [ ] Employee count shown (current/limit)
  [ ] Trial countdown visible if applicable

TESTING:
  [ ] All acceptance criteria tested
  [ ] Free tier → Paid tier upgrade tested
  [ ] Paid tier downgrade tested
  [ ] Payment failure scenarios tested
  [ ] Employee limit enforcement tested
  [ ] Trial expiration tested
  [ ] Backward compatibility verified (existing customers)

DEPLOYMENT:
  [ ] Database migrations ready
  [ ] Environment variables updated
  [ ] Backup strategy includes Subscription table
  [ ] Rollback plan documented
  [ ] Support team trained
  [ ] Customer communication sent

✅ ALL ITEMS GREEN? DEPLOY v12.0 🚀
```

---

*Last Updated: 22 Juli 2026 | Owner: Dozer | Status: Requirements Complete*

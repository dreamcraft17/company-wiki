# dnPeople — PRD v12.1
## FREE Tier Standardized to 50 Employees

**Versi:** 12.1  
**Tanggal:** 22 Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Status:** Final specification (LOCKED IN)  
**Change from v12.0:** FREE tier = 50 employees (was 100)

---

## Executive Summary

**Decision Made:** FREE tier employee limit = **50 employees** (permanent, hard limit)

This PRD v12.1 is the **FINAL SPEC** for FREE tier enforcement. All tier definitions locked based on strategic recommendation.

```
FREE TIER = 50 EMPLOYEES (HARD LIMIT)
├─ Max employees: 50 (cannot exceed)
├─ Trial: 4 months, then permanent free
├─ Features: Core HR only (no payroll, no recruitment)
├─ Upgrade trigger: Natural at 50 emp → STARTER
├─ Support: Email only
├─ API calls: 1,000/day
├─ Storage: 5GB
└─ Price: Rp 0 forever (selamanya gratis)

STARTER TIER = 50-50 EMPLOYEES
├─ Max employees: 50 (hard limit)
├─ Price: Rp 20.000/emp/bulan
├─ Trial: 2 months free, then charge
├─ Features: Full (payroll, attendance, leave, shift)
└─ Conversion: Natural at 50 emp limit (from FREE)
```

---

## Part 1: Tier Structure (FINAL - LOCKED)

```
TIER        │ MAX EMPLOYEES │ PRICE/EMP      │ TRIAL    │ FEATURES
────────────┼───────────────┼────────────────┼──────────┼──────────────
FREE        │ 50 (HARD)     │ Rp 0 forever   │ 4 months │ Core HR only
            │               │ (permanent)    │ (then ∞) │
────────────┼───────────────┼────────────────┼──────────┼──────────────
STARTER     │ 50 (HARD)     │ Rp 20.000      │ 2 months │ Full HRIS
            │               │ /emp/bulan     │ free     │ (payroll+)
────────────┼───────────────┼────────────────┼──────────┼──────────────
PROF.       │ 300 (HARD)    │ Rp 25.000      │ 2 months │ Full + recruit
            │               │ /emp/bulan     │ free     │ +perf+training
────────────┼───────────────┼────────────────┼──────────┼──────────────
BUSINESS    │ Unlimited     │ Rp 20.000      │ 2 months │ All features
            │ (soft@1000)   │ /emp/bulan     │ free     │ +integrations
────────────┼───────────────┼────────────────┼──────────┼──────────────
ENTERPRISE  │ Unlimited     │ Custom         │ Custom   │ Everything
            │               │ (negotiated)   │          │ + white-label
```

**CHANGE FROM v12.0:**
```
v12.0: FREE = 100 employees
v12.1: FREE = 50 employees ← LOCKED IN

Reason: Strategic recommendation (Option A = goldilocks choice)
Impact: Natural conversion trigger at 50 emp
```

---

## Part 2: FREE Tier Details (50 Employees)

### Features Included in FREE (50 emp max)

```
✅ ENABLED:
  - Employee CRUD + import (up to 50)
  - Organization structure (dept, position, location)
  - Staff account management
  - Employee documents
  - HR calendar & holidays
  - Basic dashboard
  - Announcements & communications
  - Helpdesk (basic)

❌ DISABLED:
  - Payroll (hardcoded disabled)
  - Attendance (hardcoded disabled)
  - Leave (hardcoded disabled)
  - Recruitment (hardcoded disabled)
  - Performance management (hardcoded disabled)
  - Training/LMS (hardcoded disabled)
  - API keys/webhooks (hardcoded disabled)
  - SAML/SSO (hardcoded disabled)
  - Custom domain (hardcoded disabled)
  - White-label (hardcoded disabled)
```

### API Limits

```
FREE tier: 1,000 API calls per day
├─ Hard block at 1,000 (return 429)
├─ Rate limit reset: midnight Jakarta time (UTC+7)
├─ Does NOT include UI requests (only API)
└─ Tracked in APIUsage table (companyId, date)
```

### Storage

```
FREE tier: 5 GB total storage
├─ Documents: 2 GB
├─ Attachments/Uploads: 2 GB
├─ Backups: 1 GB
├─ Soft warning: 80% (4 GB used)
├─ Hard block: 100% (5 GB used, cannot upload more)
```

### Support

```
FREE tier: Email support only
├─ Channel: support@dnpeople.id
├─ Response time: 24 business hours (best effort)
├─ No phone support
├─ No chat support
├─ No dedicated account manager
├─ Self-serve docs + FAQ
```

---

## Part 3: STARTER Tier Details (50 employees, PAID)

### Why STARTER = 50 emp also?

```
FREE:     0-50 employees (free, limited features)
STARTER:  50-50 employees (Rp 20K/emp, full features)

At 50 emp:
  - User hits FREE limit → BLOCKED
  - Can upgrade to STARTER → UNLOCKED
  - Same employee capacity (50), but features unlock
  - Payment: Rp 20.000 × 50 = Rp 1.000.000/bulan

This is the UPGRADE TRIGGER → Natural conversion point
```

### Features Included in STARTER

```
✅ ALL FREE features
✅ PAYROLL (core calculations, BPJS, PPh 21, slips)
✅ ATTENDANCE (clock in/out, GPS, QR, manual)
✅ LEAVE (request, balance, approval workflow)
✅ SHIFT (management, swap requests)
✅ Basic reports (PDF/Excel export)
✅ Approval inbox (consolidated)

❌ NOT INCLUDED:
  - Recruitment
  - Performance management
  - Training/LMS
  - API/webhooks
  - SSO/SAML
  - Custom domain
  - White-label
```

### Pricing & Billing

```
Price: Rp 20.000 per employee per month
Example: 30 employees = Rp 600.000/month
Example: 50 employees = Rp 1.000.000/month

Trial: 2 months FREE
├─ Month 1-2: Rp 0 charge
├─ Month 3 onwards: Rp 20K × emp auto-charge
├─ Day 55 (of trial): Email reminder "Trial ends in 5 days"
└─ Day 61: Auto-charge (if payment method exists)

Billing: Monthly auto-renew (same day each month)
Payment: Xendit (transfer bank, e-wallet, card, cicilan)
```

---

## Part 4: Conversion Flow (FREE → STARTER)

### User Journey

```
STEP 1: User at 48/50 employees
├─ App shows: "48/50 employees"
├─ Email (daily): "You're close to FREE tier limit"
└─ Action: Prepare to upgrade or downgrade

STEP 2: User tries to create 51st employee
├─ API returns 403: "You've reached 50 employee limit"
├─ Message: "Upgrade to STARTER to add more employees"
├─ Button: "View STARTER Plan" → /billing/upgrade?tier=STARTER
└─ No employee created (blocked at API level)

STEP 3: User clicks "View STARTER Plan"
├─ Shows STARTER details
│  ├─ Price: Rp 20.000/emp/bulan
│  ├─ Features: Payroll, attendance, leave, reports
│  ├─ Trial: 2 months free
│  └─ Example: "30 employees = Rp 600.000/month"
├─ Shows current: "You have 50 employees"
├─ Charge preview: "Rp 1.000.000/month starting month 3"
└─ Button: "Start 2-Month Trial"

STEP 4: User clicks "Start Trial"
├─ Requires payment method setup (first time only)
│  ├─ Xendit integration
│  ├─ CVV verification (not charged yet)
│  └─ Save for future billing
├─ Subscription created (status: trial)
├─ Tier changed: FREE → STARTER
├─ Payroll feature ENABLED immediately
├─ Email: "Welcome to STARTER! Trial starts now."
└─ Features unlocked: Payroll, attendance, etc.

STEP 5: After 2 months (day 61)
├─ Trial expires
├─ Email: "Your 2-month trial ends today. First charge tonight."
├─ If payment method on file: Auto-charge Rp 1.000.000
├─ If payment fails: 3-day grace period, then suspension
└─ Subscription continues (if charge successful)
```

### Messaging (Copy)

```
WHEN USER AT 48/50 EMPLOYEES:
  Subject: "You're almost at capacity"
  Body: "You have 48 of 50 employees in your FREE plan.
         Ready to scale? Upgrade to STARTER to add unlimited
         employees + unlock payroll."

WHEN USER TRIES TO ADD 51ST:
  Error: "Employee limit reached
          Your FREE plan supports up to 50 employees.
          
          Ready to scale your team? Upgrade to STARTER:
          • Unlimited employees
          • Full payroll & attendance
          • 2 months trial FREE
          
          [Upgrade to STARTER] [Maybe later]"

UPGRADE FLOW:
  "Upgrade to STARTER
   
   Current: 50 employees
   Plan: Rp 20.000/employee/month
   Your monthly cost: Rp 1.000.000
   
   Includes:
   ✓ Payroll (BPJS, PPh 21)
   ✓ Attendance (GPS, QR, manual)
   ✓ Leave management
   ✓ Reports
   ✓ Email support
   
   Trial: 2 months FREE
   Then: Rp 1.000.000/month (auto-renew)
   
   [Start Free Trial]"
```

---

## Part 5: Feature Gating (Code Level)

### Environment Variables (LOCKED)

```bash
# .env (v12.1)

# FREE TIER (50 employees, hardcoded)
TIER_FREE_MAX_EMPLOYEES=50
TIER_FREE_TRIAL_MONTHS=4
TIER_FREE_API_CALLS_PER_DAY=1000
TIER_FREE_STORAGE_GB=5
TIER_FREE_PRICE=0

# STARTER TIER (50 employees, Rp 20K)
TIER_STARTER_MAX_EMPLOYEES=50
TIER_STARTER_TRIAL_MONTHS=2
TIER_STARTER_API_CALLS_PER_DAY=10000
TIER_STARTER_STORAGE_GB=50
TIER_STARTER_PRICE=20000

# ... other tiers
```

### Database Constraints (HARDCODED)

```sql
-- Employee creation blocked at database level
CREATE CONSTRAINT trigger on employees table:

IF employee_count >= tier_max_employees
  AND tier = 'FREE'
THEN
  RAISE EXCEPTION 'Employee limit reached for FREE tier';
END IF;

-- This ensures: even if middleware fails, DB catches it
-- Defense in depth
```

### API Routes (BLOCKED)

```
GET /api/v1/payroll              → 403 if tier = FREE
POST /api/v1/payroll/run         → 403 if tier = FREE
GET /api/v1/attendance           → 403 if tier = FREE
POST /api/v1/attendance/checkin  → 403 if tier = FREE
GET /api/v1/leave                → 403 if tier = FREE
POST /api/v1/leave/request       → 403 if tier = FREE
GET /api/v1/recruitment          → 403 if tier = FREE
POST /api/v1/recruitment/jobs    → 403 if tier = FREE
POST /api/v1/integrations/keys   → 403 if tier = FREE
```

### UI Routes (HIDDEN)

```
Navigation (for FREE tier users):
  ✓ /employees (visible)
  ✓ /org (visible)
  ✓ /dashboard (visible)
  ✓ /staff-accounts (visible)
  ✓ /settings (visible)
  ✓ /documents (visible)
  
  ✗ /payroll (hidden/redirected)
  ✗ /attendance (hidden/redirected)
  ✗ /leave (hidden/redirected)
  ✗ /recruitment (hidden/redirected)
  ✗ /performance (hidden/redirected)
  ✗ /training (hidden/redirected)
  ✗ /integrations (hidden/redirected)

Redirect: /payroll → /upgrade?feature=payroll
  Shows: "Payroll requires STARTER tier. [Upgrade]"
```

---

## Part 6: Enforcement & Monitoring

### Employee Count Enforcement

```
Soft limit (Warning):
  - At 80% (40/50 employees)
  - Email to admin: "You have 40/50 employees"
  - In-app banner: "40/50 - Ready to grow?"
  - Repeats every 7 days (until at limit)

Hard limit (Block):
  - At 50/50 employees
  - Cannot create 51st employee
  - API returns 403 Forbidden
  - Message: "You've reached 50 employee limit"
  - Option: Upgrade to STARTER
  - OR: Delete/archive employee (make space)
```

### Monitoring & Alerts

```
Daily reports:
  - Total FREE users: X
  - FREE users at 80%+ capacity: Y
  - FREE users at 100% capacity: Z
  - FREE → STARTER conversions: X conversions/day

Alert thresholds:
  - If FREE user at capacity > 1 week: Send conversion email
  - If FREE user churn rate > 5%/month: Alert (feature issue?)
  - If STARTER conversion rate < 20%: Alert (upgrade flow broken?)
```

---

## Part 7: Backward Compatibility (Migration)

### Existing Customers

```
Current free users with > 50 employees:
  - Few exist (product is new)
  - Action: Email 1 week before enforcement
  - Message: "Your FREE plan limited to 50 emp (coming Aug 1)"
  - Option 1: Delete employees to get under 50
  - Option 2: Upgrade to STARTER
  - Option 3: Let system auto-downgrade (read-only mode)

Action taken at enforcement:
  - If > 50 emp: Status = "over_capacity"
  - Features locked (payroll disabled even more)
  - Email daily: "Upgrade or delete employees to continue"
  - After 14 days: Suspension (read-only mode)
  - After 30 days: Option to export data and leave
```

### Existing STARTER Customers

```
No change (already at 50 emp limit, already paying)
STARTER features remain unlocked
Billing continues as-is
```

---

## Part 8: Marketing & Messaging

### Website Copy

```
Pricing page:

"FREE Plan
 Perfect for small teams

 Up to 50 employees
 Rp 0/month

 ✓ Employee database
 ✓ Organization structure
 ✓ Documents & files
 ✓ HR calendar
 ✓ Announcements
 ✗ Payroll (upgrade to STARTER)
 ✗ Attendance (upgrade to STARTER)
 ✗ Leave management (upgrade to STARTER)

 [Create Free Account] [View All Features]"

---

"STARTER Plan
 For growing businesses

 1-50 employees
 Rp 20.000/employee/month

 Everything in FREE, plus:
 ✓ Payroll & BPJS
 ✓ Attendance tracking
 ✓ Leave management
 ✓ Shift management
 ✓ Basic reports

 [Start 2-Month Trial]"
```

### Onboarding Flow

```
Step 1: Sign up email capture
  "Free account (up to 50 employees)"

Step 2: Org setup
  "Add employees (free up to 50)"
  "Max 50 in FREE plan. Upgrade for more."

Step 3: Feature unlock prompts
  "Payroll available in STARTER plan"
  "2 months free, then Rp 20K/emp/month"
  "[Explore STARTER]"
```

---

## Part 9: Launch Timeline

### Pre-Launch (Aug 1-15)
```
[ ] Customer email: "FREE tier limit now 50 employees"
[ ] Website updated: Pricing page shows 50 emp
[ ] Support docs: FAQ updated
[ ] Sales training: New tier messaging
[ ] Database prepared: Migration script ready
```

### Launch (Aug 1)
```
[ ] Deploy backend changes (feature gating, hard limits)
[ ] Deploy frontend changes (navigation hiding, prompts)
[ ] Deploy database migrations
[ ] Monitor: Check for errors, complaints
[ ] Support: On standby for issues
```

### Post-Launch (Aug 1-7)
```
[ ] Day 1-3: Monitor closely (error rate, complaints)
[ ] Day 3: Analysis (how many FREE at 40+? conversion rate?)
[ ] Day 7: Send first "you're at capacity" emails
[ ] Week 2: Review conversion metrics
[ ] Week 3: Adjust if needed (email timing, messaging)
```

---

## Success Criteria

```
✅ TECHNICAL:
  - Employee count hard limit enforced at 50
  - API returns 403 when exceeded
  - UI hides restricted features
  - Feature gating working per tier
  - Zero data loss in migration

✅ BUSINESS:
  - Sign-ups: 10+/day (baseline)
  - FREE users at 40+: 20%+ (growing)
  - Conversion rate: 25-30% (FREE → STARTER)
  - LTV: Rp 24M+ per converting user
  - Churn: < 5%/month (on STARTER)

✅ CUSTOMER:
  - No complaints about 50 emp limit
  - Upgrade prompts clear & helpful
  - Support questions: manageable
  - Conversion process smooth
```

---

## Rollback Plan (If Needed)

```
If 50 emp limit causes major issues:

Option 1: Expand to 100 emp (cost: quick change)
  - Update TIER_FREE_MAX_EMPLOYEES=100
  - Re-test enforcement
  - No data migration needed
  - Minimum downtime (seconds)

Option 2: Move to Option F (unlimited for 4 weeks)
  - More complex (requires frontend changes)
  - Requires new feature (trial timer)
  - Minimum downtime (hours for full test)

Trigger: If conversion rate < 10% for 2 weeks
         Or if churn rate > 15%/month
         Or if major customer complaint
```

---

# SUMMARY: FREE TIER v12.1 (FINAL, LOCKED)

```
FREE TIER = 50 EMPLOYEES

Configuration:
  Max employees: 50 (HARD limit, enforced at API+DB)
  Price: Rp 0 forever (permanent free tier)
  Trial: 4 months → then permanent free
  Features: Core HR only (no payroll, no recruitment)
  Support: Email only (24h response target)
  API: 1,000 calls/day
  Storage: 5 GB

Conversion Trigger:
  User tries to add 51st employee → Blocked
  Offered: Upgrade to STARTER (Rp 20K/emp, 2 mo trial)
  Natural upgrade point (no resentment)

Business Impact:
  Acquisition: Good (50 emp = attractive)
  Conversion: Medium (30%, realistic)
  LTV: Rp 24M (solid)
  Sustainable: Yes (profitable)

Status: Ready to deploy (Aug 1, 2026)
```

---

*Last Updated: 22 Juli 2026 | Version: 12.1 (FINAL, LOCKED) | Owner: Dozer*

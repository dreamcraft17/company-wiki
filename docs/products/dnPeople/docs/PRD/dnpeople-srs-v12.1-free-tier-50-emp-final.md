# dnPeople — SRS v12.1
## FREE Tier 50 Employee Enforcement - Requirements & Acceptance Criteria

**Versi:** 12.1  
**Tanggal:** 22 Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Status:** Requirements ready to QA

---

## FR-FREE-001: Hard Employee Limit Enforcement (50 emp)

**ID:** FR-FREE-001  
**Priority:** P0 (Critical)  
**Owner:** Backend Engineer

### Requirement

```
FREE tier users CANNOT create more than 50 employees.
Hard block at API + Database level.
Soft warning at 80% (40 employees).

Acceptance Criteria:

AC-1.1: Soft Warning at 80%
  Given FREE user with 40/50 employees
  When user views employee list
  Then:
    - Banner displays: "You have 40/50 employees"
    - Email sent to admin: "You're approaching capacity"
    - In-app prompt: "Ready to scale? Upgrade to STARTER"
    - Repeats: Every 7 days while at 80%+
    
Test case:
  T1.1: Soft warning trigger
    - Create FREE subscription
    - Add 40 employees
    - ✓ Banner visible on dashboard
    - ✓ Email received (check inbox)
    - ✓ Email repeats on day 7
    - ✓ Email repeats on day 14

AC-1.2: Hard Limit Block at 50 emp
  Given FREE user with 50/50 employees
  When trying to create 51st employee via API
  Then:
    - Request returns 403 Forbidden
    - Error response:
      {
        "error": "employee_limit_reached",
        "message": "Your FREE plan supports up to 50 employees",
        "current": 50,
        "limit": 50,
        "upgrade": "STARTER"
      }
    - Employee NOT created
    - Transaction rolled back
    
Test case:
  T1.2: Create employee at hard limit
    - POST /api/v1/employees { name: 'John' }
    - Company: FREE tier, 50/50 employees
    - ✓ Response status: 403
    - ✓ Error message includes "50 employee limit"
    - ✓ Employee count still 50 (not 51)

AC-1.3: Hard Limit on Bulk Import
  Given FREE user importing CSV with 60 employees
  When uploading import file
  Then:
    - Validation error before import
    - Message: "Cannot import 60 employees. Limit is 50."
    - Suggests: "Delete existing 10 employees first, or upgrade to STARTER"
    - Dry-run shows: "Would import first 50, skip remaining 10"
    - Import does NOT proceed
    
Test case:
  T1.3: Bulk import exceeding limit
    - POST /api/v1/employees/import (CSV 60 rows)
    - Company: FREE, currently 0 employees
    - ✓ Dry-run returns: "Can import 50 of 60"
    - ✓ No import proceeds without confirmation
    - Confirm import
    - ✓ Imports exactly 50, skips 10
    - ✓ Employee count = 50 (capped)

AC-1.4: Soft Delete Doesn't Count
  Given FREE user with 50/50 active employees
  When soft-deleting (archiving) 1 employee
  Then:
    - Employee marked as deleted (soft delete)
    - Employee count becomes 49/50
    - Can now add 1 more employee
    - Deleted employee not in list, but recoverable
    
Test case:
  T1.4: Soft delete frees capacity
    - 50 employees active
    - DELETE /api/v1/employees/{id} (soft delete)
    - ✓ Employee count becomes 49
    - Can now POST /api/v1/employees (success)
    - GET /api/v1/employees (archived employees not shown)
    - GET /api/v1/employees?archived=true (shows archived)

AC-1.5: Database Constraint (Defense in Depth)
  Given application with database constraint
  When trying to insert 51st employee directly (bypass app)
  Then:
    - Database constraint triggers
    - Insert fails at DB level
    - Error: CHECK constraint violation
    - Application catches error, returns 403
    
Test case:
  T1.5: Direct database insert (bypass app)
    - Connect to database directly
    - Try: INSERT INTO employees (...) [51st employee]
    - ✓ Database constraint blocks insert
    - ✓ Error message clear (constraint violation)
    - ✓ App continues working (error handled)
```

---

## FR-FREE-002: Feature Gating (Payroll, Attendance, Leave)

**ID:** FR-FREE-002  
**Priority:** P0 (Critical)  
**Owner:** Backend Engineer

### Requirement

```
FREE tier CANNOT access payroll, attendance, leave, recruitment, etc.
API endpoints return 403 Forbidden.
UI hides navigation items.

Acceptance Criteria:

AC-2.1: Payroll Endpoint Blocked
  Given FREE tier user
  When calling GET /api/v1/payroll
  Then:
    - Returns 403 Forbidden
    - Error: "Feature payroll requires STARTER tier or higher"
    - Suggests: "Upgrade to STARTER to enable payroll"
    
Test case:
  T2.1: Payroll blocked for FREE
    - GET /api/v1/payroll (as FREE user)
    - ✓ Status: 403
    - ✓ Error mentions STARTER tier

AC-2.2: Attendance Endpoint Blocked
  Given FREE tier user
  When calling GET /api/v1/attendance
  Then:
    - Returns 403 Forbidden
    - Error: "Attendance not available in FREE plan"
    
Test case:
  T2.2: Attendance blocked for FREE
    - GET /api/v1/attendance
    - ✓ Status: 403

AC-2.3: Leave Endpoint Blocked
  Given FREE tier user
  When calling POST /api/v1/leave/request
  Then:
    - Returns 403 Forbidden
    
Test case:
  T2.3: Leave blocked for FREE
    - POST /api/v1/leave/request
    - ✓ Status: 403

AC-2.4: Recruitment Endpoint Blocked
  Given FREE tier user
  When calling POST /api/v1/recruitment/jobs
  Then:
    - Returns 403 Forbidden
    - Message: "Recruitment requires PROFESSIONAL tier"
    
Test case:
  T2.4: Recruitment blocked for FREE
    - POST /api/v1/recruitment/jobs
    - ✓ Status: 403
    - ✓ Mentions PROFESSIONAL tier

AC-2.5: Navigation Hidden (Frontend)
  Given FREE user viewing app
  When viewing main navigation
  Then:
    - Visible items: Employees, Org, Dashboard, Documents, Settings
    - Hidden items: Payroll, Attendance, Leave, Recruitment, Training, Performance
    - No broken links (no hidden buttons)
    - Hover over hidden item: Shows "Requires STARTER tier"
    
Test case:
  T2.5: Navigation items hidden for FREE
    - Login as FREE user
    - View left navigation
    - ✓ "Employees" visible
    - ✓ "Payroll" NOT visible (hidden)
    - ✓ "Attendance" NOT visible
    - ✓ "Recruitment" NOT visible
    - ✓ No 404 errors if try direct URL
```

---

## FR-FREE-003: API Rate Limiting (1,000 calls/day)

**ID:** FR-FREE-003  
**Priority:** P1 (High)  
**Owner:** Backend Engineer

### Requirement

```
FREE tier API: 1,000 calls per day (hard limit).
Rate limit resets at midnight Jakarta time (UTC+7).
Returns 429 Too Many Requests when exceeded.

Acceptance Criteria:

AC-3.1: Rate Limit Tracking
  Given FREE user making API calls
  When making API requests
  Then:
    - Each API call counted (except UI requests)
    - Count stored in APIUsage table
    - Date scoped (companyId, date)
    - Resets at midnight (+7 UTC)
    
Test case:
  T3.1: API calls tracked
    - Make 50 API calls
    - Check APIUsage table: { companyId, date='2026-07-22', callsToday=50 }
    - ✓ Count is 50

AC-3.2: Hard Block at 1,000
  Given FREE user who made 1,000 API calls today
  When making 1,001st call
  Then:
    - Returns 429 Too Many Requests
    - Headers include: X-RateLimit-Remaining: 0
    - Headers include: X-RateLimit-Reset: (midnight time)
    - Error message: "Daily API limit exceeded: 1,000 calls"
    - Request NOT processed
    
Test case:
  T3.2: Rate limit enforcement
    - Make 1,000 API calls (batch script)
    - Call 1,000: ✓ 200 OK
    - Call 1,001: ✓ 429 Too Many Requests
    - Response header: X-RateLimit-Remaining: 0

AC-3.3: Rate Limit Reset
  Given FREE user at 1,000 calls today
  When advancing time to next day (midnight +7)
  Then:
    - Counter resets to 0
    - Next API call succeeds (new day)
    - APIUsage record created for new date
    
Test case:
  T3.3: Daily reset
    - Today: 1,000 calls (at limit)
    - Tomorrow (same time): Make 1st call
    - ✓ Call succeeds (200 OK)
    - ✓ New APIUsage record for tomorrow's date

AC-3.4: Rate Limit Headers
  Given any API call
  When response returned
  Then:
    - Headers include: X-RateLimit-Limit: 1000
    - Headers include: X-RateLimit-Used: (current count)
    - Headers include: X-RateLimit-Remaining: (1000 - count)
    - Headers include: X-RateLimit-Reset: (midnight UTC+7)
    
Test case:
  T3.4: Rate limit headers
    - Make API call with 500 calls already used
    - Response headers:
      X-RateLimit-Limit: 1000
      X-RateLimit-Used: 500
      X-RateLimit-Remaining: 500
      X-RateLimit-Reset: 1658 (unix timestamp)
    - ✓ All headers present and correct
```

---

## FR-FREE-004: UI Upgrade Prompts

**ID:** FR-FREE-004  
**Priority:** P1 (High)  
**Owner:** Frontend Engineer

### Requirement

```
When FREE user tries to access restricted feature, show upgrade prompt.
Prompts should be helpful, not aggressive.
Clear path to upgrade.

Acceptance Criteria:

AC-4.1: Upgrade Prompt on Blocked Feature
  Given FREE user navigating to /payroll
  When page loads
  Then:
    - Redirects to /upgrade?feature=payroll
    - Shows prompt:
      "Payroll available in STARTER
       
       Your plan: FREE (0 employees - organize only)
       Next tier: STARTER (Payroll unlocked!)
       
       STARTER includes:
       ✓ Payroll & BPJS calculation
       ✓ Attendance tracking
       ✓ Leave management
       ✓ Rp 20.000/employee/month
       ✓ 2 months trial FREE
       
       [Start 2-Month Trial]"
    - Not aggressive (feels helpful)
    
Test case:
  T4.1: Upgrade prompt for payroll
    - Navigate to /payroll (as FREE user)
    - ✓ Redirects to /upgrade?feature=payroll
    - ✓ Prompt shows STARTER benefits
    - ✓ "Start Trial" button present

AC-4.2: Capacity Warning Prompt
  Given FREE user at 45+ employees
  When viewing employee list or dashboard
  Then:
    - Prompt shows: "You have X/50 employees"
    - Button: "Explore STARTER (unlimited employees)"
    - Friendly tone: "Ready to scale?"
    - Repeats: Every page load while 45+
    
Test case:
  T4.2: Capacity warning
    - 47/50 employees
    - ✓ Banner shows "47/50"
    - ✓ "Upgrade" button present
    - ✓ Repeats on page reload

AC-4.3: Direct URL Block + Helpful Redirect
  Given FREE user trying to access /recruitment directly
  When typing URL /recruitment
  Then:
    - Redirects to /upgrade?feature=recruitment
    - Shows: "Recruitment available in PROFESSIONAL"
    - Suggests: "PROFESSIONAL tier includes recruitment + performance"
    - No 404 error (user not confused)
    
Test case:
  T4.3: Direct URL redirect
    - Try to navigate to /recruitment (FREE user)
    - ✓ Redirects to upgrade page
    - ✓ Error message clear, helpful
```

---

## FR-FREE-005: Upgrade Flow (FREE → STARTER)

**ID:** FR-FREE-005  
**Priority:** P1 (High)  
**Owner:** Backend Engineer + Frontend Engineer

### Requirement

```
Upgrade flow: Clear, simple, 2-month trial included.
No surprises.
Trial → Charge clearly communicated.

Acceptance Criteria:

AC-5.1: Upgrade Button Opens Flow
  Given FREE user
  When clicking "Start 2-Month Trial" (for STARTER)
  Then:
    - Modal opens: "Upgrade to STARTER"
    - Shows calculation:
      "Your company: 50 employees
       Plan: STARTER (Rp 20.000/emp/month)
       Monthly cost: Rp 1.000.000
       
       Trial: 2 months FREE
       Then: Rp 1.000.000/month (auto-renew)
       
       Trial starts: Today
       Trial ends: [Date in 60 days]
       First charge: [Date in 61 days]"
    - Button: "I understand, start trial"
    - Button: "Maybe later"
    
Test case:
  T5.1: Upgrade dialog shows calculation
    - Click "Start Trial" button
    - ✓ Modal shows breakdown
    - ✓ Dates calculated correctly (60 days from today)
    - ✓ Monthly cost correct (50 × Rp 20K)

AC-5.2: Payment Method Required
  Given user starting trial
  When clicking "Start trial"
  Then:
    - If no payment method: Prompt to add one
      "We need a payment method for your 2-month trial.
       You won't be charged during trial."
      [Add payment method via Xendit]
    - If payment method exists: Proceed directly
    
Test case:
  T5.2: Payment method setup
    - First trial: Xendit form opens
    - ✓ CVV verification (not charged yet)
    - ✓ Card saved for future billing

AC-5.3: Trial Confirmation & Feature Unlock
  Given user confirmed trial
  When trial starts
  Then:
    - Subscription changed: FREE → STARTER (status: trial)
    - Trial end date calculated: +60 days
    - Email sent: "Welcome to STARTER! Trial starts now."
    - Payroll feature ENABLED immediately
    - Attendance feature ENABLED immediately
    - Leave feature ENABLED immediately
    - User sees: "Trial ends [date], first charge [date]"
    - Can still upload employees (no new limit change)
    
Test case:
  T5.3: Trial activation
    - Start trial
    - ✓ Subscription tier changed to STARTER
    - ✓ Payroll navigation appears
    - ✓ Email received
    - ✓ Can access payroll immediately

AC-5.4: Trial Countdown (Final Week)
  Given trial 7-10 days remaining
  When user views app
  Then:
    - Banner visible: "Your STARTER trial ends in 7 days"
    - Shows charge date: "First charge: [date]"
    - Button: "Update payment method" (if needed)
    - Email sent on day 5: "Trial ending soon"
    - Email sent on day 1: "Trial ends today, charge tonight"
    
Test case:
  T5.4: Trial countdown
    - Day 56 of trial (4 days left)
    - ✓ Banner shows "4 days left"
    - ✓ Email sent (check inbox)
    - Day 61 (charge date)
    - ✓ Email sent: "First charge tonight"
    - ✓ Auto-charge happens (check Xendit)
```

---

## FR-FREE-006: Database Consistency

**ID:** FR-FREE-006  
**Priority:** P0 (Critical)  
**Owner:** Backend Engineer

### Requirement

```
Database stays consistent.
No data loss.
All employee counts accurate.

Acceptance Criteria:

AC-6.1: Employee Count Accurate
  Given various employee states
  When querying employee count
  Then:
    - Active employees: counted
    - Soft-deleted employees: NOT counted
    - Deactivated employees: NOT counted (or counted, but clear)
    - Count matches enforcement logic
    
Test case:
  T6.1: Employee count accuracy
    - Add 50 active employees
    - SELECT COUNT(*) WHERE deletedAt IS NULL
    - ✓ Returns 50
    - Soft-delete 1 employee
    - ✓ Returns 49
    - Deactivate 1 employee (separate field)
    - ✓ Returns 48 (if deactivated = not counted)

AC-6.2: Subscription Tier Consistency
  Given subscription created
  When querying subscription
  Then:
    - Tier is either: FREE, STARTER, PROFESSIONAL, BUSINESS, ENTERPRISE
    - No NULL tiers
    - No typos/mismatches
    - Matches employee limit config
    
Test case:
  T6.2: Subscription data valid
    - Create subscription
    - ✓ Tier is one of 5 valid values
    - ✓ createdAt present
    - ✓ trialEndsAt calculated (if FREE/STARTER)

AC-6.3: Trial Dates Accurate
  Given FREE subscription
  When querying trialEndsAt
  Then:
    - trialEndsAt = createdAt + 4 months (120 days)
    - Accurate to the second
    - In UTC (consistent timezone)
    
Test case:
  T6.3: Trial dates
    - Create FREE subscription at: 2026-07-22 14:30:00 UTC
    - trialEndsAt should be: 2026-11-20 14:30:00 UTC
    - ✓ Date matches exactly

AC-6.4: No Orphaned Records
  Given deleted subscription
  When subscription deleted
  Then:
    - Related APIUsage records cleaned up (or marked)
    - No orphaned references
    - Audit trail preserved
    
Test case:
  T6.4: Cascade delete works
    - Delete subscription
    - ✓ Related APIUsage records deleted
    - ✓ Audit table still has history
```

---

## NFR-FREE: Performance & Security

```
NFR-1: Employee Limit Check Fast
  - Validation: < 50ms
  - No N+1 queries
  - Cached employee count

NFR-2: Rate Limiting Accurate
  - Counter increments atomically
  - No race conditions
  - Reset happens exactly at midnight UTC+7

NFR-3: Feature Gating Consistent
  - API level: Always blocks
  - UI level: Always hides
  - No inconsistencies (one blocks, one doesn't)

NFR-4: No Data Loss
  - Migration: 100% employee data preserved
  - No silent failures
  - Clear error messages
```

---

## Launch Gate Checklist (FREE Tier v12.1)

```
ENFORCEMENT:
  [ ] Employee limit 50 enforced at API level (403 when exceeded)
  [ ] Employee limit 50 enforced at DB level (constraint)
  [ ] Feature gating blocks payroll/attendance/leave for FREE
  [ ] API rate limit 1,000/day enforced (429 when exceeded)
  [ ] Soft warning at 80% (40 employees)

FEATURE GATING:
  [ ] Navigation hidden for restricted features
  [ ] Direct URL redirect to upgrade page
  [ ] All 403 errors return clear messages
  [ ] Upgrade prompts helpful (not aggressive)

BILLING:
  [ ] Trial flow: FREE → STARTER (2 months free)
  [ ] Payment method setup working
  [ ] Auto-charge on day 61 (if payment method)
  [ ] Trial countdown emails sent

DATA:
  [ ] No data loss in migration
  [ ] Employee counts accurate
  [ ] Subscription tiers consistent
  [ ] Trial dates calculated correctly

UI/UX:
  [ ] Prompts appear at right time
  [ ] Upgrade buttons clickable
  [ ] Redirect flows smooth
  [ ] No confusion about limits/features

TESTING:
  [ ] All AC tested (6 FRs × 4 ACs each = 24 tests minimum)
  [ ] Employee limit tested at 49, 50, 51
  [ ] Rate limit tested at 999, 1000, 1001 calls
  [ ] Soft limit tested at 40 emp
  [ ] Hard limit tested at 50 emp
  [ ] Feature gating tested per endpoint (payroll, attendance, leave, recruitment, performance, training, api_keys)
  [ ] UI tested on desktop + mobile
  [ ] Upgrade flow tested end-to-end

✅ ALL GREEN? DEPLOY v12.1 🚀
```

---

*Last Updated: 22 Juli 2026 | Version: 12.1 (FINAL) | Owner: Dozer*

# dnPeople — SRS v15.0
## Admin Dashboard & Control Panel: Requirements & Acceptance Criteria

**Versi:** 15.0  
**Tanggal:** 24 Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Status:** **Implemented in repo** (26 Jul 2026); live latency metrics Conditional

---

## FR-ADMIN-001: Admin Authentication & Access Control

**ID:** FR-ADMIN-001  
**Priority:** P0 (Critical)  
**Owner:** Backend Engineer

### Requirement

```
Admin panel is restricted to ROLE_SUPERADMIN only.
Access requires JWT token + 2FA TOTP.
Sessions timeout after 30 min inactivity.
All admin actions logged to audit trail.
```

### Acceptance Criteria

```
AC-1.1: Admin login requires email + password + TOTP
  Given: Admin (ROLE_SUPERADMIN) at /admin/login
  When: Entering credentials
  Then:
    - Email: "dozer@dntech.id"
    - Password: entered
    - 2FA: "Enter 6-digit code from authenticator app"
    - Success: Redirect to /admin/dashboard
    - Failure: "Invalid credentials or TOTP code"
    
Test case:
  T1.1: Valid admin login
    - Navigate to /admin/login
    - Enter email + password
    - ✓ TOTP prompt shown
    - Enter valid 6-digit code
    - ✓ Logged in, redirect to dashboard

AC-1.2: Non-superadmin cannot access admin panel
  Given: Regular user (ROLE_EMPLOYEE) trying /admin
  When: Accessing admin URL
  Then:
    - Redirect to /401 (unauthorized)
    - Log attempt: "User X tried to access /admin at timestamp"
    - Alert (optional): Notify Dozer of unauthorized attempt
    
Test case:
  T1.2: Block non-admin access
    - Login as EMPLOYEE user
    - Try /admin/dashboard
    - ✓ Redirect to /401
    - ✓ Audit log records attempt

AC-1.3: Session timeout after 30 min inactivity
  Given: Admin logged in
  When: No activity for 30 minutes
  Then:
    - Session expires automatically
    - Redirect to login screen
    - Message: "Session expired. Please log in again"
    
Test case:
  T1.3: Inactivity timeout
    - Admin logs in
    - Wait 30 min (or mock time)
    - Make API call
    - ✓ Returns 401 (unauthorized)
    - ✓ Redirect to login

AC-1.4: All admin actions logged
  Given: Admin performs action (e.g., impersonate, toggle feature)
  When: Action completes
  Then:
    - CompanyAuditLog entry created
    - Fields: adminId, action, details, timestamp, ipAddress
    - Audit log queryable: GET /api/v1/admin/audit-log
    - Searchable by: Admin, action, date range
    
Test case:
  T1.4: Audit logging
    - Admin impersonates customer X
    - ✓ CompanyAuditLog created
    - View /admin/audit-log
    - ✓ See "Admin Y impersonated Company X" at time Z
    - Click entry → See details (IP address, etc)

AC-1.5: IP whitelist (optional, for extra security)
  Given: Admin configured with IP whitelist
  When: Admin tries to login from different IP
  Then:
    - Login attempt blocked (optional feature)
    - Message: "Login from this IP not allowed"
    - Require 2FA email confirmation
    
Test case (if implemented):
  T1.5: IP whitelist
    - Admin IP: 192.168.1.1
    - Try login from 203.0.113.5
    - ✓ Blocked or requires email confirmation
```

---

## FR-ADMIN-002: Customer Management Dashboard

**ID:** FR-ADMIN-002  
**Priority:** P1 (High)  
**Owner:** Frontend Engineer

### Requirement

```
Admin can view all customers, filter/sort, view details, impersonate.
Customer list shows: name, email, tier, employees, status, joined date, MRR.
Customer detail shows: subscription, usage, support tickets, actions.
```

### Acceptance Criteria

```
AC-2.1: Customer list loads
  Given: Admin at /admin/customers
  When: Page loads
  Then:
    - List shows all customers (paginated, 50 per page)
    - Columns: Company | Email | Tier | Employees | Status | Joined | MRR
    - Each row clickable → customer detail
    - Total count: "Showing 1-50 of 251 customers"
    
Test case:
  T2.1: Customer list
    - Navigate to /admin/customers
    - ✓ See list of customers (at least 10)
    - ✓ Each row has all columns populated
    - ✓ Total count at bottom

AC-2.2: Filter customers by tier
  Given: Customer list
  When: Click filter dropdown "Tier"
  Then:
    - Options: All | FREE | STARTER | PROFESSIONAL | BUSINESS | ENTERPRISE
    - Selecting tier filters list
    - Example: "STARTER" shows only STARTER customers
    
Test case:
  T2.2: Tier filter
    - Click "Tier" dropdown
    - Select "PROFESSIONAL"
    - ✓ List updates to show only PROFESSIONAL tier
    - Count updates: "Showing 1-20 of 20 customers"

AC-2.3: Filter customers by status
  Given: Customer list
  When: Click "Status" filter
  Then:
    - Options: Active | Trial | Churn | Inactive
    - Filter: Only show selected status
    
Test case:
  T2.3: Status filter
    - Filter: "Trial"
    - ✓ Show only trial customers
    - Filter: "Churn"
    - ✓ Show only churned customers

AC-2.4: Sort customers
  Given: Customer list
  When: Click column header (e.g., "MRR")
  Then:
    - Sort ascending/descending (toggle on each click)
    - Arrow indicator shows sort direction (↑ or ↓)
    
Test case:
  T2.4: Sorting
    - Click "MRR" column
    - ✓ Sort by MRR descending (highest first)
    - Click again
    - ✓ Sort ascending (lowest first)
    - Arrow changes direction

AC-2.5: Search customers
  Given: Customer list
  When: Typing in search box
  Then:
    - Real-time search (< 500ms response)
    - Search by: Company name, email, phone
    - Highlight matching text
    
Test case:
  T2.5: Customer search
    - Type "PT ABC" in search
    - ✓ Results filtered to matching companies
    - Type "dozer@" in search
    - ✓ Shows companies with that email domain

AC-2.6: View customer detail
  Given: Click customer row
  When: Customer detail page opens
  Then:
    - Show: Company info, subscription, usage, tickets, actions
    - Breadcrumb: Customers > [Company Name]
    - Back button → return to list
    
Test case:
  T2.6: Customer detail
    - Click "PT ABC" row
    - ✓ Load detail page
    - ✓ See company name, email, employees, tier
    - ✓ See subscription info (trial status, MRR)
    - ✓ See usage: employees (30/50), API calls (etc)
    - Click [Back] → return to list

AC-2.7: View customer subscription detail
  Given: Customer detail page open
  When: Viewing subscription section
  Then:
    - Show: Current tier, trial status, MRR/ARR, auto-renewal, history
    - Example: "STARTER · Trial ends in 5 days · Rp 600,000/month"
    - History: Timeline of upgrades/downgrades
    
Test case:
  T2.7: Subscription detail
    - On customer detail
    - Subscription section shows:
      ✓ "STARTER"
      ✓ "Trial active, ends 29 Jul 2026"
      ✓ "Rp 600,000/month (30 employees × Rp 20,000)"
      ✓ History: "Upgraded from FREE on 25 Jul 2026"

AC-2.8: View customer support tickets
  Given: Customer detail page
  When: Viewing "Support Tickets" section
  Then:
    - Show: Open tickets, recent interactions
    - Columns: Subject | Status | Priority | Updated | Action
    - Click: Opens ticket detail
    
Test case:
  T2.8: Customer tickets
    - On customer detail
    - See "Open Tickets: 2"
    - List: "Payroll not calculating" (High priority, open)
    - Click → View ticket detail

AC-2.9: Customer actions (impersonate, extend trial, add note)
  Given: Customer detail page
  When: Clicking action button
  Then:
    - Actions available:
      1. Impersonate: "Become this user"
      2. Extend trial: Add 7/14/30 days
      3. Add note: Internal note (not visible to customer)
      4. Block: Disable customer (in case of abuse)
    
Test case:
  T2.9: Customer actions
    - Click [Impersonate] button
    - ✓ Logged in as that company admin
    - See banner: "You are logged in as PT ABC"
    - Click [End impersonation] → Back to admin
    
    - Click [Extend trial] → "Add 7 days"
    - ✓ Trial extended, show new end date
    
    - Click [Add note] → Text input
    - Type: "Follow up tomorrow"
    - ✓ Note saved, visible in future
```

---

## FR-ADMIN-003: Revenue & Billing Dashboard

**ID:** FR-ADMIN-003  
**Priority:** P1 (High)  
**Owner:** Frontend Engineer + Backend Engineer

### Requirement

```
Admin can see MRR, ARR, churn rate, revenue trend.
Tier breakdown: How much revenue from each tier.
Revenue chart: MRR over time (daily, weekly, monthly view).
```

### Acceptance Criteria

```
AC-3.1: Revenue dashboard loads
  Given: Admin at /admin/billing
  When: Page loads
  Then:
    - Show key metrics: MRR, ARR, New customers, Churn rate, CLTV, CAC
    - Example: "MRR: Rp 9.2M | ARR: Rp 110M | Churn: 3%"
    - Charts: Tier breakdown (pie/bar), MRR trend (line)
    
Test case:
  T3.1: Revenue dashboard
    - Navigate to /admin/billing
    - ✓ See MRR card: "Rp 9.2M"
    - ✓ See ARR card: "Rp 110M"
    - ✓ See churn rate: "3%"
    - ✓ Charts visible (may take 1-2 sec to render)

AC-3.2: Tier breakdown
  Given: Revenue dashboard open
  When: Viewing "Revenue by tier"
  Then:
    - Show: FREE | STARTER | PROFESSIONAL | BUSINESS | ENTERPRISE
    - For each: Number of customers, MRR contribution
    - Example: "STARTER: 45 customers, Rp 4.5M/month (49%)"
    - Chart type: Pie or bar (stacked)
    
Test case:
  T3.2: Tier breakdown
    - See pie chart: Revenue by tier
    - STARTER: 49% (largest slice)
    - PROFESSIONAL: 38%
    - BUSINESS: 13%
    - Click slice → Drill down to customers in that tier

AC-3.3: Revenue trend chart
  Given: Revenue dashboard open
  When: Viewing MRR trend
  Then:
    - X-axis: Date (daily granularity)
    - Y-axis: MRR (Rp)
    - View options: Last 30 days, 90 days, YTD
    - Line shows MRR over time (stacked by tier)
    - Can hover on point → See exact MRR + breakdown
    
Test case:
  T3.3: MRR trend
    - See line chart: MRR last 30 days
    - X-axis: Date (Jul 1-31)
    - Y-axis: Rp 0-10M
    - Line trending up: Good!
    - Hover on Jul 24 point
    - ✓ Tooltip: "Rp 9.2M (STARTER: Rp 4.5M, PROF: Rp 3.5M, ...)"

AC-3.4: Churn analysis
  Given: Revenue dashboard open
  When: Viewing churn signals
  Then:
    - Show: Customers churned this month (list)
    - Columns: Customer | Tier | MRR | Reason | Date
    - Reason: Auto-categorized (trial expired, downgrade, payment failed, etc)
    
Test case:
  T3.4: Churn list
    - See "Churned this month: 3 customers"
    - PT XYZ: STARTER, Rp 300K, "Payment failed 3x"
    - PT ABC: FREE → STARTER (not churn, upgrade)
    - Click customer → Go to detail to follow up

AC-3.5: Payment history
  Given: Admin at /admin/billing
  When: Viewing "Payments"
  Then:
    - Show: All payments (list, paginated)
    - Columns: Date | Customer | Amount | Status | Method | Invoice
    - Status: Successful, Failed, Pending
    - Filter: By status, date range, payment method
    
Test case:
  T3.5: Payment list
    - Click "Payments" tab
    - See list of payments (date, customer, amount)
    - Filter: "Failed" status
    - ✓ Show only failed payments
    - Click payment → See details (invoice, retry button)

AC-3.6: Manual refund
  Given: Payment detail view
  When: Clicking "Refund" button
  Then:
    - Prompt: "Full or partial refund?"
    - Input: Amount (pre-filled with full payment)
    - Reason: Dropdown (customer requested, billing error, etc)
    - Process: Via payment gateway
    - Result: "Refund initiated" + refund ID
    
Test case:
  T3.6: Initiate refund
    - Click payment → Detail
    - Click [Refund]
    - ✓ Modal opens: "Refund Rp 600,000?"
    - Change to "Partial: Rp 300,000"
    - Reason: "Billing error"
    - Click [Confirm]
    - ✓ "Refund processed, ID: RF-123456"
    - Audit log: "Admin X initiated refund"
```

---

## FR-ADMIN-004: Impersonation Feature

**ID:** FR-ADMIN-004  
**Priority:** P0 (Critical)  
**Owner:** Backend Engineer + Frontend Engineer

### Requirement

```
Admin can click "Impersonate" → Logged in as that company.
Banner shows: "You are logged in as [Company]. [End impersonation]"
Actions logged: Who impersonated whom, when, for how long.
Auto-logout after 30 min, or click [End] to exit.
Admin cannot modify customer data while impersonating.
```

### Acceptance Criteria

```
AC-4.1: Start impersonation
  Given: Admin on customer detail
  When: Click [Impersonate] button
  Then:
    - API: POST /api/v1/admin/customers/{id}/impersonate
    - Create session as that customer
    - Redirect to /dashboard (customer view)
    - Banner top: "You are impersonating PT ABC · [End impersonation]"
    
Test case:
  T4.1: Impersonate customer
    - On customer detail (PT ABC)
    - Click [Impersonate]
    - ✓ Logged in as PT ABC admin
    - ✓ See dashboard (their data)
    - ✓ Banner visible

AC-4.2: Perform customer actions while impersonating
  Given: Impersonating customer
  When: Browsing as them
  Then:
    - Can view: Employees, payroll, attendance (tier-based access)
    - Can test: Features, workflows
    - Cannot create: New employees? (depends on tier)
    - Can trigger: Test notifications, scheduled jobs
    
Test case:
  T4.2: Test customer feature
    - Impersonate STARTER customer
    - Click Payroll
    - ✓ Can view payroll (not blocked)
    - Click "Create cycle"
    - ✓ Can test payroll workflow
    - (Does not actually charge customer or create real data)

AC-4.3: Impersonation logged
  Given: Admin impersonates customer
  When: Session starts and ends
  Then:
    - Audit log entry: "Admin X impersonated Company Y"
    - Fields: adminId, companyId, startTime, endTime, ipAddress
    - Entry created at start, updated at end
    
Test case:
  T4.3: Audit log
    - Impersonate customer
    - Logout
    - Admin view audit log
    - ✓ See "Admin Dozer impersonated PT ABC at Jul 24 14:30-14:45"
    - Click entry → See details

AC-4.4: Auto-logout after 30 min
  Given: Admin impersonating customer for 30 min
  When: Timer expires
  Then:
    - Session auto-terminates
    - Redirect to /login (admin)
    - Message: "Session expired"
    - Audit log: End time recorded
    
Test case:
  T4.4: Impersonation timeout
    - Start impersonating at 14:00
    - Do nothing for 30 min (or mock time)
    - Make any action at 14:31
    - ✓ Auto-logout, redirect to /login
    - View audit log
    - ✓ End time: 14:30 (30 min duration)

AC-4.5: End impersonation manually
  Given: Impersonating customer
  When: Click [End impersonation] in banner
  Then:
    - Session ends immediately
    - Redirect back to /admin/customers/{id} (customer detail)
    - Audit log: End time recorded
    
Test case:
  T4.5: Manual exit
    - Impersonating customer
    - Click [End impersonation]
    - ✓ Redirect to customer detail
    - ✓ Back as admin (see "Impersonate" button again)

AC-4.6: Cannot modify customer billing while impersonating
  Given: Impersonating customer
  When: Trying to access billing settings (if possible)
  Then:
    - 403 Forbidden (no access to admin features)
    - Or feature hidden (not in nav)
    
Test case:
  T4.6: Protect admin features
    - Impersonate customer
    - Try direct URL: /subscription/manage
    - ✓ 403 Forbidden or redirect to /
    - Cannot access /settings/billing
    - (Only customer-facing features available)
```

---

## FR-ADMIN-005: Analytics & Metrics Dashboard

**ID:** FR-ADMIN-005  
**Priority:** P1 (High)  
**Owner:** Backend Engineer + Frontend Engineer

### Requirement

```
Admin can view feature usage, tutorial analytics, article ratings.
Support ticket trends: Which features cause most support requests.
Churn signals: At-risk customers, why they might churn.
```

### Acceptance Criteria

```
AC-5.1: Feature usage dashboard
  Given: Admin at /admin/analytics/features
  When: Page loads
  Then:
    - Show adoption % per feature, per tier
    - Example STARTER:
      ├─ Payroll: 92% adoption
      ├─ Attendance: 88% adoption
      ├─ Leave: 95% adoption
      └─ Shift: 35% adoption (low, alert?)
    
Test case:
  T5.1: Feature adoption
    - Navigate to /admin/analytics/features
    - ✓ See table: Feature | STARTER % | PROF % | BUS %
    - Payroll: 92%, 98%, 100% (adoption increases per tier)
    - Shift: 35%, 45%, 60% (underutilized feature)

AC-5.2: Tutorial completion analytics
  Given: Admin at /admin/analytics/tutorials
  When: Page loads
  Then:
    - Show each tutorial: Views, Completions, Avg time, Rating
    - Columns: Title | Views | Completions (%) | Avg time | Rating
    - Example: "Employee Creation: 150 views, 120 completions (80%), 3.2 min, 4.5/5 ⭐"
    
Test case:
  T5.2: Tutorial metrics
    - Navigate to /admin/analytics/tutorials
    - ✓ See table of all tutorials
    - Employee Creation: 150 views, 80% completion
    - Payroll Setup: 45 views, 60% completion (lower)
    - Click tutorial → See detail (drop-off by step, helpful votes)

AC-5.3: Article ratings
  Given: Admin at /admin/analytics/articles
  When: Page loads
  Then:
    - Show: Articles sorted by helpful %
    - Columns: Title | Views | Helpful % | Rating trend
    - Alert: Articles < 50% helpful (red indicator)
    
Test case:
  T5.3: Article ratings
    - Navigate to /admin/analytics/articles
    - Top: "What is Payroll?" - 500 views, 96% helpful (green)
    - Bottom: "Why Talent Matrix?" - 20 views, 35% helpful (red alert)
    - Click red article → Review content, flag for rewrite

AC-5.4: Support ticket trends
  Given: Admin at /admin/analytics/support
  When: Page loads
  Then:
    - Show: Total tickets, open, resolved
    - By category: Feature requests, bugs, billing, other
    - By feature: Which feature causes most tickets
    - Example: "Payroll calculations: 12 tickets (40%)"
    - Trend: Tickets trending up/down
    
Test case:
  T5.4: Support trends
    - See: "Total tickets (30 days): 45 open, 120 resolved"
    - By feature: Payroll (12), Attendance (8), Leave (5)
    - Payroll causing most issues → investigate
    - Trend chart: Tickets per week (up or down?)

AC-5.5: Churn signals
  Given: Admin at /admin/analytics/churn
  When: Page loads
  Then:
    - Show: At-risk customers (list)
    - Signals: Inactivity (30+ days), feature not used, trial ending soon
    - Columns: Customer | Tier | Risk | Signal | Days until action
    - Actions: Email or override trial extension
    
Test case:
  T5.5: Churn prediction
    - See "At-risk customers: 8"
    - PT ABC: STARTER, High risk, "No login 45 days"
    - PT XYZ: FREE, Medium risk, "Trial ending in 3 days"
    - Click customer → Open detail to follow up
    - Button: [Send retention email] or [Extend trial]

AC-5.6: Cohort analysis
  Given: Admin at /admin/analytics/cohort
  When: Selecting cohort (by sign-up month)
  Then:
    - Show: Retention rate over time
    - Columns: Cohort | Retention 30d | 60d | 90d | MRR
    - Example: "Jul 2026: 45 customers → 42 (93%), 39 (87%), 37 (82%)"
    
Test case:
  T5.6: Cohort retention
    - See cohort table
    - Jul 2026 cohort: 45 customers
    - After 30 days: 42 remain (93% retention)
    - After 90 days: 37 remain (82% retention)
    - Trend: Helps identify at what point customers churn
```

---

## FR-ADMIN-006: Support Ticket Queue

**ID:** FR-ADMIN-006  
**Priority:** P1 (High)  
**Owner:** Frontend Engineer

### Requirement

```
Admin can view support tickets, filter by status/priority.
Add internal notes to ticket.
Close ticket with resolution.
Quick actions: Impersonate customer, send KB article link.
```

### Acceptance Criteria

```
AC-6.1: Ticket queue loads
  Given: Admin at /admin/support/tickets
  When: Page loads
  Then:
    - Show all tickets (paginated)
    - Columns: Customer | Subject | Status | Priority | Updated | Actions
    - Total count: "Showing 1-20 of 45 tickets"
    
Test case:
  T6.1: Ticket list
    - Navigate to /admin/support/tickets
    - ✓ See list of open/all tickets
    - ✓ Each row has customer, subject, status

AC-6.2: Filter by status
  Given: Ticket list
  When: Click "Status" filter
  Then:
    - Options: All | Open | Waiting | Resolved | Closed
    - Filter updates list
    
Test case:
  T6.2: Filter status
    - Click "Open"
    - ✓ Show only open tickets (10 of 45)
    - Click "Waiting"
    - ✓ Show waiting tickets (5 of 45)

AC-6.3: View ticket detail
  Given: Click ticket
  When: Detail page opens
  Then:
    - Show: Customer info, ticket messages, internal notes section
    - Thread: All messages (customer + admin responses)
    - Add message: Input + send button
    - Add internal note: Separate from thread (not shown to customer)
    
Test case:
  T6.3: Ticket detail
    - Click "Payroll not calculating"
    - ✓ See customer message: "Payroll is wrong"
    - ✓ See context: Company (STARTER, 30 emp), usage
    - Add note: "Checked, looks like component XYZ bug"
    - ✓ Note saved (admin-only view)

AC-6.4: Quick actions on ticket
  Given: Ticket detail open
  When: Looking at action buttons
  Then:
    - [Impersonate]: Log in as customer
    - [Send KB article]: Quick link
    - [Escalate]: Mark high priority
    - [Close]: Finish ticket
    
Test case:
  T6.4: Ticket actions
    - Click [Impersonate]
    - ✓ Logged in as that company
    - Test payroll workflow
    - [End impersonation]
    - Back to ticket
    - Click [Send KB article]
    - ✓ Modal: Suggest related KB article
    - "How to fix payroll calculation"
    - Click send → Article link added to response

AC-6.5: Close ticket
  Given: Ticket resolved
  When: Click [Close] button
  Then:
    - Prompt: Resolution (text), Category (bug, feature, billing, other)
    - Send: CSAT survey to customer (optional)
    - Mark: Status = "Closed"
    
Test case:
  T6.5: Close ticket
    - Click [Close]
    - Popup: "Briefly explain resolution"
    - Type: "Deployed fix for payroll formula"
    - Category: "Product bug"
    - Send CSAT: Yes
    - ✓ Ticket closed
    - ✓ Customer gets CSAT survey email
```

---

## FR-ADMIN-007: Feature Flags Toggle

**ID:** FR-ADMIN-007  
**Priority:** P1 (High)  
**Owner:** Backend Engineer + Frontend Engineer

### Requirement

```
Admin can toggle feature flags ON/OFF without code push.
Rollout %: Gradual rollout to percentage of users.
Tier-specific: Feature only for PROFESSIONAL+, for example.
All toggles logged with reason.
```

### Acceptance Criteria

```
AC-7.1: Feature flags list
  Given: Admin at /admin/flags
  When: Page loads
  Then:
    - Show all flags (sortable, filterable)
    - Columns: Feature | Status (ON/OFF) | Rollout % | Tier | Last updated
    - Example: "talent_matrix | ON | 100% | PROFESSIONAL+ | Today"
    
Test case:
  T7.1: Flags list
    - Navigate to /admin/flags
    - ✓ See all feature flags
    - talent_matrix: ON, 100%, PROFESSIONAL+
    - attendance_geofence: ON, 50% (A/B test)
    - recruitment_ai: OFF

AC-7.2: Toggle feature ON/OFF
  Given: Feature flag listed
  When: Click toggle switch
  Then:
    - Prompt: "Are you sure? This affects [X] customers"
    - Reason: Dropdown (why toggling?)
    - Options: "Testing", "Rolled out", "Bug found", "Customer request"
    - Confirm: Toggle updates immediately
    - Audit log: "Admin X toggled talent_matrix ON at time Z"
    
Test case:
  T7.2: Toggle feature
    - Click toggle for "talent_matrix"
    - ✓ Confirmation modal
    - Reason: "Rolled out to production"
    - Click [Confirm]
    - ✓ Toggle switches to OFF (or ON)
    - Audit log shows action

AC-7.3: Rollout % (gradual rollout)
  Given: Feature flag detail
  When: Click "Edit rollout"
  Then:
    - Slider: 0-100% (who gets this feature)
    - Example: 50% = half of users in tier get feature
    - Save: Update rollout %, log action
    - Analytics: Track % of users with feature
    
Test case:
  T7.3: Gradual rollout
    - Click "attendance_geofence"
    - Current: 50% rollout (A/B test)
    - Slider to 75%
    - Click [Save]
    - ✓ Updated to 75%
    - Next week: Increase to 100%
    - Audit log tracks each change

AC-7.4: Tier-specific flags
  Given: Feature flag detail
  When: Viewing tier assignment
  Then:
    - Show: Which tiers have access
    - Example: "talent_matrix" → PROFESSIONAL+ (not STARTER, FREE)
    - Can toggle: Add/remove feature per tier
    - Sync with backend: Updated in tierFeatures.ts
    
Test case:
  T7.4: Tier gating
    - talent_matrix: Assigned to PROFESSIONAL, BUSINESS, ENTERPRISE
    - Not assigned to: FREE, STARTER
    - Try to change: Add to STARTER?
    - ✓ Can change, but risk: "This changes pricing tier"
    - Confirm: Yes, proceed
    - Backend updated

AC-7.5: Feature flag audit history
  Given: Feature flag detail
  When: Clicking "History" tab
  Then:
    - Show all changes to this flag
    - Columns: Admin | Action | From → To | Reason | Timestamp
    - Example: "Dozer | Toggle ON → OFF | Bug found | Jul 24 14:30"
    
Test case:
  T7.5: Flag history
    - View "talent_matrix" history
    - See: Dozer toggled ON (rolled out), then OFF (bug), then ON again
    - Each entry shows reason
    - Searchable, exportable for compliance
```

---

## FR-ADMIN-008: System Health Monitoring

**ID:** FR-ADMIN-008  
**Priority:** P1 (High)  
**Owner:** Backend Engineer

### Requirement

```
Admin can view: API status, latency, error rates, database health.
Alerts: Auto-notify if P99 latency > 2s or error rate > 1%.
Logs: Searchable application logs + audit trail.
```

### Acceptance Criteria

```
AC-8.1: Health dashboard
  Given: Admin at /admin/health
  When: Page loads
  Then:
    - Show status cards: API | Database | Queue | Backup
    - Each shows: UP/DEGRADED/DOWN + last 24h uptime %
    - Green: UP, Yellow: DEGRADED, Red: DOWN
    
Test case:
  T8.1: Health dashboard
    - See cards:
      ✓ API: UP (99.9% uptime)
      ✓ Database: UP (99.95% uptime)
      ✓ Queue: UP (100%)
      ✓ Backup: Last 2 hours ago

AC-8.2: API metrics
  Given: API status card
  When: Click to expand
  Then:
    - Show: P50, P95, P99 latencies (ms)
    - Error rate: % (4xx, 5xx)
    - Requests/sec: Current throughput
    - Trend: Is latency increasing?
    
Test case:
  T8.2: API latency
    - Click "API" card
    - ✓ P50: 45ms | P95: 120ms | P99: 280ms (normal)
    - Error rate: 0.2% (low)
    - Trend chart: Last 24h (stable)

AC-8.3: Alerts
  Given: Metric exceeds threshold
  When: P99 latency > 2s (2000ms)
  Then:
    - Auto-alert to Dozer (email/Slack)
    - Alert visible in admin UI: "⚠️ High latency detected"
    - Can acknowledge/snooze alert
    
Test case:
  T8.3: Alert trigger
    - If P99 > 2s, alert fires
    - Admin sees: "API latency P99: 2100ms (ALERT)"
    - Investigate: View slow queries, connected issues
    - Acknowledge: "Issue resolved" → Alert dismissed

AC-8.4: Database health
  Given: Database card expanded
  When: Viewing database metrics
  Then:
    - Connections: Current / Max
    - Disk space: Used / Available
    - Query latency: Slow queries logged
    - Replication lag: If applicable
    
Test case:
  T8.4: Database metrics
    - Connections: 45 / 100
    - Disk: 250GB / 500GB (50% used)
    - Slow queries: None (last 24h)
    - Replication lag: 0.5s (normal)

AC-8.5: Job health
  Given: Queue (Bull) status
  When: Viewing queue metrics
  Then:
    - Pending jobs: Count
    - Failed jobs: Count
    - Job latency: Avg time to process
    - Example: "Trial expiry: 12 pending, 0 failed"
    
Test case:
  T8.5: Queue metrics
    - Trial expiry job: 0 pending (ran at 2 AM)
    - Payment job: 3 pending (runs hourly)
    - Backup job: 0 failed
    - Can manually trigger: [Run now]

AC-8.6: Logs viewer
  Given: Admin at /admin/health/logs
  When: Viewing logs
  Then:
    - Search bar: By level, source, keyword
    - Columns: Timestamp | Level | Source | Message
    - Filter: Error, Warning, Info (default: Error + Warning)
    - Export: CSV for analysis
    
Test case:
  T8.6: Logs search
    - Search: "payroll"
    - ✓ Show errors related to payroll
    - Level: "Error"
    - ✓ Show last 50 errors
    - Click entry → See full message + stack trace
    - Export → Download CSV
```

---

## Launch Gate Checklist

```
FEATURES:
  [ ] Customer management (list, detail, filter, sort, search)
  [ ] Impersonation (start, end, audit log)
  [ ] Revenue dashboard (MRR, ARR, tier breakdown, trend)
  [ ] Analytics (feature usage, tutorial metrics, churn signals)
  [ ] Support tickets (queue, detail, close)
  [ ] Feature flags (toggle, rollout %, tier gating)
  [ ] System health (status, latency, error rates, alerts)

SECURITY:
  [ ] ROLE_SUPERADMIN only (no other roles access)
  [ ] 2FA required (TOTP)
  [ ] Session timeout: 30 min
  [ ] Audit log: All actions logged
  [ ] Impersonation: Cannot modify customer billing

TESTING:
  [ ] Unit: Auth, impersonation, feature flags
  [ ] Integration: End-to-end workflows
  [ ] E2E: Admin creates customer, impersonates, checks health
  [ ] Security: Try accessing as non-superadmin, verify blocked
  [ ] Performance: Customer list < 500ms, analytics < 2s

DEPLOYMENT:
  [ ] Database migrations (CompanyAuditLog, FeatureFlag, etc)
  [ ] Backend API endpoints working
  [ ] Frontend pages deployed
  [ ] Dozer can login to admin panel

✅ ALL GREEN? DEPLOY v15.0 🚀
```

---

*Last Updated: 24 Juli 2026 | Version: 15.0 (FINAL SRS) | Owner: Dozer*

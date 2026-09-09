# dnPeople — PRD v15.0
## Admin Dashboard & Control Panel (Internal)

**Versi:** 15.0  
**Tanggal:** 24 Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Baseline:** Post v14.0 (Tutorial system complete)  
**Status:** **Implemented in repo** (26 Jul 2026) — live latency P50/P95/P99 Conditional until Datadog/Prometheus

---

## Executive Summary

**Admin Dashboard** is internal SaaS management panel for DN Tech team to manage all dnPeople customers, subscriptions, billing, analytics, and system operations.

**MVP Scope:** 7 core modules
1. Customer Management (view, edit, manage)
2. Subscription & Billing (tiers, trials, revenue)
3. Analytics & Metrics (usage, engagement, churn)
4. Support Tools (impersonation, ticket history)
5. Content Management (tutorials, KB articles, videos)
6. Feature Flags & Toggles (control what's live per tier)
7. System Health (monitoring, logs, alerts)

**Access:** Restricted to DN Tech team only (`ROLE_SUPERADMIN`)

---

## 1. Problem & Motivation

### Current State (Without Admin Dashboard)
```
✗ How many customers active? → Check production DB manually
✗ Customer churn? → Parse logs + spreadsheet
✗ Monthly revenue? → Aggregate from Xendit/Midtrans API
✗ Which feature causing support tickets? → Scroll Slack
✗ Need to help customer? → Ask them for password (security risk)
✗ Want to enable feature flag for beta test? → Push code + deploy
✗ Tutorial performance? → No data
```

### Desired State (With Admin Dashboard)
```
✓ Dashboard: "45 active customers, Rp 9.2M MRR, 3% churn"
✓ Customer list: Sortable, filterable, one-click impersonation
✓ Revenue tracking: Per customer, per tier, trend chart
✓ Support tools: View customer tickets, auto-escalate
✓ Feature flags: Toggle feature ON/OFF per tier (no code push)
✓ Analytics: Tutorial views/completions, article ratings, video engagement
✓ System health: API latency, error rates, database connections
✓ Audit trail: Who did what, when (GDPR-friendly)
```

### Business Impact
- **Speed:** -50% time managing customers (no manual DB queries)
- **Revenue visibility:** Real-time MRR + ARR tracking
- **Churn prevention:** Early warning system (see churn signals)
- **Support:** Faster issue resolution (impersonation + context)
- **Growth:** Data-driven decisions on features, pricing
- **Risk:** System health monitoring (prevent downtime)

---

## 2. Personas & Use Cases

### Dozer (Founder/CEO)
```
Goal: Business overview, revenue, customer health
Need:
  - Dashboard: "Today's stats" (new signups, MRR, active customers)
  - Revenue: Total, per tier, trend (daily, monthly, yearly)
  - Churn alerts: Who left, why (if feedback available)
  - Customer detail: One-click to view customer profile
  
Workflow:
  1. Login to admin dashboard
  2. See: 45 active customers, Rp 9.2M MRR, 3% churn
  3. Click churn alert: "PT ABC downgraded to STARTER"
  4. Notes: "Compliance concerns, offered custom SSO"
  5. Next: Follow up or mark resolved
```

### Support Team (Future, or Dozer's time)
```
Goal: Resolve customer issues quickly
Need:
  - Customer lookup: Search by name/email
  - Impersonation: "Become customer" to test their issue
  - Ticket history: All support interactions (form submissions)
  - Notes: Add internal notes ("Already explained 2x, waiting client")
  - Escalation: Mark high-priority
  
Workflow:
  1. Customer emails: "Tutorial not working"
  2. Open admin → Search customer
  3. Click "Impersonate" → Logged in as them
  4. Reproduce issue (tutorial broken?)
  5. Fix or escalate → Note: "Widget bug in Safari, deployed fix"
```

### Product Manager (Future)
```
Goal: Understand product usage + make data-driven decisions
Need:
  - Feature usage: Which features used per tier
  - Tutorial analytics: Views, completions, completion time
  - Article ratings: Most helpful / least helpful
  - Support trends: Which features most support tickets
  - Churn drivers: What causes downgrade/churn
  
Workflow:
  1. Open analytics
  2. See: "Performance review completion only 20% (PROFESSIONAL tier)"
  3. Hypothesis: "Complex workflow, needs tutorial"
  4. Action: Commission tutorial for performance reviews
  5. Measure: Track completion rate post-launch
```

---

## 3. In Scope

### 3.1 Customer Management Module

```
List View:
  ├─ All customers (sortable, filterable)
  ├─ Columns: Company name | Email | Tier | Employees | Status | Joined | MRR
  ├─ Filter: By tier, status (active/trial/churn), date range
  ├─ Sort: By MRR, employees, join date, activity
  ├─ Search: Company name, email, phone
  └─ Actions: View detail, impersonate, resend invite, manage subscription

Customer Detail:
  ├─ Company info
  │  ├─ Name, email, phone
  │  ├─ Industry, employees
  │  ├─ Location, logo
  │  └─ Notes (internal)
  │
  ├─ Subscription
  │  ├─ Current tier (FREE/STARTER/PROFESSIONAL/BUSINESS/ENTERPRISE)
  │  ├─ Trial status (started, ends in X days, expired)
  │  ├─ Billing: Monthly / Annual
  │  ├─ MRR / ARR
  │  ├─ Auto-renewal status
  │  └─ History: Upgrade/downgrade timeline
  │
  ├─ Usage
  │  ├─ Employees: Current / Limit
  │  ├─ API calls: This month / Limit
  │  ├─ Storage: Used / Limit
  │  ├─ Last login: Company admin
  │  └─ Active users: Last 7 days
  │
  ├─ Support tickets
  │  ├─ Open tickets: Count + list
  │  ├─ Recent: Last 5 interactions
  │  └─ Escalation status
  │
  └─ Actions
     ├─ Impersonate (become this user)
     ├─ Resend invite (if trial not started)
     ├─ Force upgrade (emergency, if billing issue)
     ├─ Force downgrade (if compliance issue)
     ├─ Extend trial (by X days)
     ├─ Add internal note
     ├─ Block (in case of abuse)
     └─ Export data (GDPR request)

Impersonation:
  ├─ Click "Impersonate" → Logged in as company admin
  ├─ Banner: "You are logged in as [Company]. Click here to exit"
  ├─ Can do: Browse app, test features, reproduce issues
  ├─ Cannot do: Edit billing, delete company (guarded)
  ├─ Audit: "Admin X impersonated Company Y on [date]"
  └─ Auto-logout after 30 min
```

### 3.2 Subscription & Billing Module

```
Revenue Dashboard:
  ├─ Key Metrics (top)
  │  ├─ MRR (Monthly Recurring Revenue): Rp 9.2M
  │  ├─ ARR (Annual): Rp 110M
  │  ├─ New customers (this month): 12
  │  ├─ Churn rate: 3%
  │  ├─ CLTV (Customer Lifetime Value): Rp 5.2M
  │  └─ CAC (Customer Acquisition Cost): Rp 800K
  │
  ├─ Tier Breakdown
  │  ├─ FREE: 180 customers, Rp 0
  │  ├─ STARTER: 45 customers, Rp 4.5M MRR
  │  ├─ PROFESSIONAL: 20 customers, Rp 3.5M MRR
  │  ├─ BUSINESS: 5 customers, Rp 1.2M MRR
  │  └─ ENTERPRISE: 1 customer, Rp 0 (custom pricing)
  │
  ├─ Revenue Trend (chart)
  │  ├─ Daily, Weekly, Monthly view
  │  ├─ X-axis: Date
  │  ├─ Y-axis: MRR (Rp)
  │  └─ Breakdown: Stacked by tier
  │
  └─ Cohort Analysis
     ├─ By sign-up month
     ├─ Retention: % still active after 30/60/90 days
     └─ Revenue per cohort

Billing Management:
  ├─ Payment history (by customer)
  │  ├─ All payments (list)
  │  ├─ Columns: Date | Amount | Status | Invoice | Payment method
  │  ├─ Filter: By payment gateway (Xendit, Midtrans), status, date
  │  └─ Manual retry (if failed payment)
  │
  ├─ Invoices
  │  ├─ Auto-generated for each billing cycle
  │  ├─ Download: PDF
  │  ├─ Resend: To customer email
  │  └─ Manual: Create one-off invoice
  │
  ├─ Trial Management
  │  ├─ Active trials: List with "ends in X days"
  │  ├─ Extend trial: Add 7/14/30 days (admin action)
  │  ├─ Trial to paid: Trigger payment (if credit card on file)
  │  └─ Trial expire: Auto-downgrade to FREE
  │
  └─ Refunds
     ├─ Initiate refund: Full/partial
     ├─ Reason: Refund reason (logged)
     ├─ Process: Via payment gateway
     └─ Audit: Logged for compliance
```

### 3.3 Analytics & Metrics Module

```
Feature Usage:
  ├─ By tier
  │  ├─ STARTER users:
  │  │  ├─ Payroll: 92% adoption
  │  │  ├─ Attendance: 88% adoption
  │  │  ├─ Leave: 95% adoption
  │  │  └─ Shift: 35% adoption (low)
  │  │
  │  └─ PROFESSIONAL users:
  │     ├─ Recruitment: 65% adoption
  │     ├─ Performance: 45% adoption (low)
  │     ├─ Training: 55% adoption
  │     └─ Talent Matrix: 20% adoption (new feature)
  │
  ├─ Daily active users: Trend
  ├─ Feature drop-off: Where users abandon workflows
  └─ Performance by feature: API latency, error rates

Tutorial Analytics:
  ├─ Views: Total views per tutorial
  ├─ Completions: % who finish tutorial
  ├─ Completion time: Avg time per tutorial
  ├─ Helpful rating: % who rated helpful
  ├─ Tier breakdown: Which tier views most
  └─ Trend: New user tutorials trending down? (issue)

Article Analytics:
  ├─ Views: Most viewed articles
  ├─ Helpful %: Highest rated articles
  ├─ Search keywords: What users search for
  ├─ Low-rated articles: Alert if < 50% helpful
  └─ Click-through: Article → tutorial conversion

Video Analytics:
  ├─ Views: Total views per video
  ├─ Completion rate: How much of video watched
  ├─ Helpful rating: Users' feedback
  └─ Source: Where clicked (tutorial → video, KB → video)

API Usage:
  ├─ By company: Who uses API most
  ├─ Calls/day: Total API calls trending
  ├─ Rate limits: Who's hitting limits (needs upgrade?)
  ├─ Error rates: Which endpoints most errors
  └─ Latency: API response time trend

Support Tickets:
  ├─ Total: Open, closed, by status
  ├─ By category: Which features need help most
  ├─ Response time: Avg time to first response
  ├─ Resolution time: Avg time to close
  └─ Trending issues: Common topics

Churn Signals:
  ├─ Downgrades: Who downgraded (track reason)
  ├─ Inactivity: Who hasn't logged in 30+ days
  ├─ Trial expiry: Trials ending soon
  ├─ Feature alerts: "No one using Talent Matrix (PROFESSIONAL)" → investigate
  └─ Action: Auto-email at risk customers
```

### 3.4 Support Tools Module

```
Ticket Queue:
  ├─ Status: Open | Waiting | Resolved | Closed
  ├─ Priority: Low | Medium | High | Urgent
  ├─ Columns: Customer | Subject | Status | Priority | Updated | Assignee
  ├─ Filter: By status, priority, category, customer
  ├─ Action: View detail, add note, escalate, close
  └─ Assignment: Assign to team member (future)

Ticket Detail:
  ├─ Customer context
  │  ├─ Company name, employees, tier
  │  ├─ Usage: Last 7 days activity
  │  ├─ Subscription: Current tier, trial status
  │  └─ Support history: Previous tickets
  │
  ├─ Ticket thread
  │  ├─ All messages (customer + admin)
  │  ├─ Timestamps
  │  ├─ Attachments
  │  └─ Internal notes (visible only to admin)
  │
  ├─ Quick actions
  │  ├─ Impersonate customer
  │  ├─ Impersonate admin (test as company admin to see issue)
  │  ├─ View customer's data (with permission)
  │  └─ Send follow-up email
  │
  └─ Close ticket
     ├─ Resolution: Brief summary
     ├─ Category: Product bug | Feature request | Billing | Other
     └─ CSAT: Send survey link to customer

Knowledge Base Integration:
  ├─ When ticket created, auto-search KB for related articles
  ├─ Suggest article: "Did you know we have an article on this?"
  ├─ One-click: Send article link to customer
  └─ Learning: If customer resolves via article, mark helpful

Chat History:
  ├─ View all communications per customer
  ├─ Email, form submissions, in-app chat
  ├─ Filter: By type, date, keyword
  └─ Export: For GDPR
```

### 3.5 Content Management Module

```
Tutorial Management:
  ├─ List view
  │  ├─ All tutorials (sortable, filterable)
  │  ├─ Columns: Title | Category | Min Tier | Views | Completions | Rating | Status
  │  ├─ Filter: By tier, category, status (published/draft)
  │  └─ Actions: Edit, publish, unpublish, analytics
  │
  ├─ Edit Tutorial
  │  ├─ Title, description, category
  │  ├─ Steps (add/edit/remove)
  │  │  ├─ Step title, instruction (markdown)
  │  │  ├─ Screenshot upload
  │  │  ├─ Video URL (YouTube embed)
  │  │  ├─ Element selector (CSS)
  │  │  └─ Success message
  │  │
  │  ├─ Metadata
  │  │  ├─ Expected minutes
  │  │  ├─ Difficulty level
  │  │  ├─ Min tier required
  │  │  └─ Modules (tags)
  │  │
  │  ├─ Preview: See how tutorial looks
  │  └─ Publish/Draft toggle
  │
  └─ Analytics
     ├─ Views over time
     ├─ Completion rate
     ├─ Helpful rating
     └─ Drop-off by step (where do users abandon)

Knowledge Base Article Management:
  ├─ List view
  │  ├─ All articles
  │  ├─ Columns: Title | Category | Views | Helpful % | Status
  │  ├─ Search: By title, content
  │  └─ Actions: Edit, publish, analytics
  │
  ├─ Edit Article
  │  ├─ Title, excerpt, content (markdown editor)
  │  ├─ Category, tags
  │  ├─ Related articles, related tutorials
  │  ├─ Preview (rendered markdown)
  │  └─ Publish/Draft toggle
  │
  └─ Analytics
     ├─ Views, helpful votes, search keywords that led here
     └─ Alert: Article < 50% helpful (needs review?)

Video Library Management:
  ├─ Add video: YouTube URL → auto-fetch metadata
  ├─ Edit: Title, description, category, tags
  ├─ Manage: Publish/unpublish, reorder
  └─ Analytics: Views, completion rate, helpful rating

Bulk Actions:
  ├─ Publish multiple tutorials
  ├─ Change category for multiple articles
  ├─ Archive old videos
  └─ Export: Content audit (for compliance)
```

### 3.6 Feature Flags & Toggles Module

```
Feature Flags:
  ├─ List view
  │  ├─ All flags (sortable)
  │  ├─ Columns: Feature name | Status (ON/OFF) | % Rollout | Affected tier | Last updated
  │  └─ Actions: Toggle, edit, analytics
  │
  ├─ Toggle Feature
  │  ├─ Feature: Which feature to toggle
  │  ├─ Status: ON or OFF (global)
  │  ├─ Rollout %: Gradual rollout (e.g., 50% of users)
  │  ├─ Tier: Apply to specific tier (or all)
  │  ├─ Notes: Why toggling (for audit)
  │  └─ Confirm: Require manual confirmation (risk management)
  │
  ├─ Examples
  │  ├─ talent_matrix: Toggle ON for PROFESSIONAL+ (beta test)
  │  ├─ attendance_geofence: 50% rollout (A/B test)
  │  ├─ recruitment_ai_matching: OFF (feature not ready)
  │  └─ tutorial_system: ON (full rollout)
  │
  └─ Audit log
     ├─ Who toggled what, when
     ├─ Previous value → new value
     └─ Reason/notes

Tier-Specific Toggles:
  ├─ Feature available per tier
  ├─ E.g., "Talent Matrix" → PROFESSIONAL+ only
  ├─ Edit: Add/remove feature per tier
  └─ Sync with backend (tierFeatures.ts)

A/B Tests:
  ├─ Define variant: Feature ON vs OFF
  ├─ Assign cohort: % of users in test
  ├─ Track: Completion rate, adoption, churn
  ├─ Winner: Based on data, roll out to 100% or kill
  └─ History: Past tests + results
```

### 3.7 System Health Module

```
API Monitoring:
  ├─ Status
  │  ├─ API status: UP / DEGRADED / DOWN
  │  ├─ Green / Yellow / Red indicator
  │  └─ Last 24 hours: Uptime %
  │
  ├─ Latency
  │  ├─ P50, P95, P99 latencies (ms)
  │  ├─ Trend: Is getting slower?
  │  └─ By endpoint: Which endpoints slow?
  │
  ├─ Error rates
  │  ├─ Total errors/sec
  │  ├─ By error type: 4xx, 5xx, timeouts
  │  ├─ Trending: Error rate up/down?
  │  └─ Top errors: Which errors most common?
  │
  └─ Alerts
     ├─ Auto-alert: P99 > 2s? Alert
     ├─ Auto-alert: Error rate > 1%? Alert
     ├─ Email/Slack: Notify Dozer

Database Monitoring:
  ├─ Status: UP / DOWN
  ├─ Connections: Current / Max
  ├─ Query latency: Slow queries logged
  ├─ Disk space: Used / Available
  ├─ Replication: Lag (if multi-region)
  └─ Backups: Last backup time, status

Queue (Redis + Bull):
  ├─ Status: UP / DOWN
  ├─ Jobs pending: How many jobs waiting
  ├─ Jobs failed: Retrying or dead-lettered?
  ├─ Job latency: Avg time to process
  └─ Manual retry: Retry failed job (e.g., failed email)

Scheduled Jobs:
  ├─ Cron health: Last run time
  ├─ Trial expiry job: "Runs daily at 2 AM"
  ├─ Payment job: "Runs every 24h for billing"
  ├─ Backup job: "Runs daily at 3 AM"
  └─ Manual trigger: Force run (for testing)

Logs & Audit
  ├─ Application logs: Errors, warnings (searchable)
  ├─ Audit log: Who did what, when (all admin actions)
  ├─ Security log: Login attempts, permission changes
  ├─ Filter: By level, source, date range
  └─ Export: For compliance

Alerts Management:
  ├─ Define alert: Condition + action
  ├─ E.g., "API P99 > 2s → Email Dozer"
  ├─ E.g., "Error rate > 1% → Slack #ops"
  ├─ Escalation: If alert not acknowledged in 15 min, escalate
  └─ Silence: Temporarily silence alert (e.g., during maintenance)
```

### 3.8 Access Control

```
Roles (Internal):
  ├─ ROLE_SUPERADMIN (Dozer)
  │  ├─ Full access: Everything
  │  ├─ Can impersonate: Yes
  │  ├─ Can toggle features: Yes
  │  └─ Can modify billing: Yes
  │
  ├─ ROLE_ADMIN (Support team, future)
  │  ├─ Can view: Customers, tickets, analytics
  │  ├─ Can impersonate: Yes (but logged)
  │  ├─ Cannot: Modify billing, toggle features
  │  └─ Cannot: View sensitive data (encryption keys, etc)
  │
  └─ ROLE_ANALYST (Product team, future)
     ├─ Can view: Analytics + metrics only
     ├─ Cannot: Customer details, billing, impersonation
     └─ Cannot: Any destructive actions

Audit Trail:
  ├─ Log all admin actions
  ├─ Who: Admin ID + name
  ├─ What: Action description
  ├─ When: Timestamp
  ├─ Result: Success/failure
  └─ Data: What changed (before/after)

Sensitive Data Protection:
  ├─ Encryption keys: Never shown in admin UI
  ├─ Passwords: Never shown (hash only)
  ├─ Payment info: Last 4 digits only (PCI DSS)
  ├─ PII: Redacted in logs (email: x***x@domain.com)
  └─ GDPR: Ability to view/export/delete per request
```

---

## 4. Out of Scope

```
❌ Customer portal (separate from admin)
❌ Invoice generation UI (auto-generated only)
❌ Refund processing (admin initiates, gateway processes)
❌ Multi-region replication (monitoring only)
❌ Mobile app (web-only)
❌ Custom reporting UI (export only)
❌ AI-powered churn prediction (future)
❌ Automated support response (future)
```

---

## 5. Data Model & API

### 5.1 New Tables Needed

```typescript
// Mostly existing, just new "admin" tables:

CompanyAuditLog {
  id: string
  companyId: string
  adminId: string
  action: string // "impersonate", "extend_trial", "toggle_feature"
  details: JSON // Before/after state
  timestamp: DateTime
  ipAddress: string
}

FeatureFlag {
  id: string
  name: string // "talent_matrix", "attendance_geofence"
  status: boolean // ON/OFF
  rolloutPercent: number // 0-100
  minTierRequired: string // "FREE", "STARTER", etc
  notes: string
  lastUpdatedBy: string (admin ID)
  lastUpdatedAt: DateTime
}

AdminNotification {
  id: string
  adminId: string
  type: string // "error_rate_high", "trial_expiring", "payment_failed"
  message: string
  severity: string // "info", "warning", "critical"
  actionUrl: string // e.g., /admin/customer/123
  isRead: boolean
  createdAt: DateTime
}

SupportTicket {
  id: string
  companyId: string
  subject: string
  status: string // "open", "waiting", "resolved", "closed"
  priority: string // "low", "medium", "high", "urgent"
  category: string // "bug", "feature_request", "billing", "other"
  messages: TicketMessage[]
  assignedTo: string (admin ID, nullable)
  createdAt: DateTime
  updatedAt: DateTime
  resolvedAt: DateTime
  resolution: string
}

TicketMessage {
  id: string
  ticketId: string
  sender: string // "customer", "admin"
  senderEmail: string
  message: string
  attachments: string[] // File URLs
  isInternal: boolean // Only visible to admin
  createdAt: DateTime
}
```

### 5.2 API Routes (New)

```
ADMIN CUSTOMERS
GET    /api/v1/admin/customers                   — list all customers (paginated)
GET    /api/v1/admin/customers/{id}              — customer detail
POST   /api/v1/admin/customers/{id}/impersonate  — become this user
POST   /api/v1/admin/customers/{id}/extend-trial — extend trial by X days
POST   /api/v1/admin/customers/{id}/notes        — add internal note

ADMIN BILLING & REVENUE
GET    /api/v1/admin/analytics/revenue           — MRR, ARR, tier breakdown
GET    /api/v1/admin/analytics/revenue/trend     — MRR over time
GET    /api/v1/admin/payments                    — all payments
GET    /api/v1/admin/invoices                    — all invoices
POST   /api/v1/admin/refunds                     — initiate refund

ADMIN ANALYTICS
GET    /api/v1/admin/analytics/features          — feature adoption
GET    /api/v1/admin/analytics/tutorials         — tutorial views/completions
GET    /api/v1/admin/analytics/articles          — article ratings/views
GET    /api/v1/admin/analytics/api-usage         — API calls/errors
GET    /api/v1/admin/analytics/churn-signals     — at-risk customers

ADMIN SUPPORT TICKETS
GET    /api/v1/admin/tickets                     — all tickets (paginated)
GET    /api/v1/admin/tickets/{id}                — ticket detail + messages
POST   /api/v1/admin/tickets/{id}/message        — add message/note
POST   /api/v1/admin/tickets/{id}/close          — close ticket

ADMIN CONTENT
GET    /api/v1/admin/tutorials                   — all tutorials (admin view)
POST   /api/v1/admin/tutorials                   — create tutorial
PUT    /api/v1/admin/tutorials/{id}              — edit tutorial
POST   /api/v1/admin/tutorials/{id}/publish      — publish tutorial

ADMIN FEATURE FLAGS
GET    /api/v1/admin/feature-flags               — all flags
POST   /api/v1/admin/feature-flags/{name}/toggle — toggle feature
PUT    /api/v1/admin/feature-flags/{name}        — edit rollout %, tier

ADMIN SYSTEM HEALTH
GET    /api/v1/admin/health/api                  — API status + metrics
GET    /api/v1/admin/health/database             — DB status
GET    /api/v1/admin/health/queue                — Queue status
GET    /api/v1/admin/health/alerts               — Active alerts
GET    /api/v1/admin/health/logs                 — System logs (searchable)

ADMIN AUDIT
GET    /api/v1/admin/audit-log                   — all admin actions (paginated)
```

---

## 6. Frontend Structure

```
/admin
  ├─ /                        (dashboard)
  ├─ /customers               (customer list)
  ├─ /customers/[id]          (customer detail)
  ├─ /billing                 (revenue dashboard)
  ├─ /analytics/features      (feature adoption)
  ├─ /analytics/tutorials     (tutorial metrics)
  ├─ /analytics/articles      (article metrics)
  ├─ /support/tickets         (support queue)
  ├─ /support/tickets/[id]    (ticket detail)
  ├─ /content/tutorials       (tutorial management)
  ├─ /content/articles        (KB management)
  ├─ /content/videos          (video management)
  ├─ /flags                   (feature flags)
  ├─ /health                  (system monitoring)
  ├─ /audit-log               (audit trail)
  └─ /settings                (admin settings)
```

---

## 7. Security & Compliance

```
Access Control:
  ✓ ROLE_SUPERADMIN only
  ✓ IP whitelist (optional, for extra security)
  ✓ 2FA required (TOTP)
  ✓ Session timeout: 30 min inactivity

Data Protection:
  ✓ All admin actions logged + audit trail
  ✓ PII redacted in logs (email, phone)
  ✓ Encryption keys never shown in UI
  ✓ Payment info: Last 4 digits only
  ✓ GDPR: Data export/delete on request

Impersonation:
  ✓ Logged per action
  ✓ Auto-logout after 30 min
  ✓ Cannot modify customer data (guard)
  ✓ Banner: "You are impersonating [Company]"
  ✓ Audit: Full trail of what admin did while impersonating

Compliance:
  ✓ SOC 2: Audit logs retained 2 years
  ✓ GDPR: Data subject requests handled
  ✓ PCI DSS: Payment data never stored plaintext
  ✓ ISO 27001: Access controls documented
```

---

## 8. Non-Functional Requirements

```
NFR-1: Performance
  - Dashboard load: < 1 sec
  - Customer list: < 500ms (1000 customers)
  - Analytics queries: < 2 sec (cached where possible)
  - Charts: Render within 1 sec

NFR-2: Availability
  - Admin panel: 99.9% uptime (separate from main app)
  - Graceful degradation: If metrics delayed, show "cached" indicator
  - Backup admin panel: SSH into server if web UI down

NFR-3: Scalability
  - Support: 100+ support tickets/month
  - Customers: 500+ customers initially
  - Logs: Retain 2 years (archival to cold storage)

NFR-4: Usability
  - Clean, minimal UI (admin, not consumer)
  - Dark mode optional
  - Keyboard nav: Tab through components
  - Responsive: Desktop-first (tablet OK, mobile secondary)

NFR-5: Security
  - HTTPS only
  - CSRF tokens on all forms
  - SQL injection protection: Parameterized queries
  - XSS protection: Sanitize all user input
  - Rate limiting: On login (5 attempts/min)
```

---

## 9. Implementation Plan

```
Timeline: Sep-Oct 2026 (parallel with v14.0 final testing)

Phase 1 (Sep 1-15): Core
  [ ] Customer management
  [ ] Subscription overview
  [ ] Basic analytics dashboard
  [ ] Admin auth (ROLE_SUPERADMIN)

Phase 2 (Sep 16-30): Operations
  [ ] Support ticket queue
  [ ] Impersonation feature
  [ ] Content management (tutorials, KB)
  [ ] Feature flags

Phase 3 (Oct 1-15): Monitoring
  [ ] System health dashboard
  [ ] Alerts + notifications
  [ ] Audit log viewer
  [ ] Admin settings

Phase 4 (Oct 16-31): Polish
  [ ] Analytics refinement
  [ ] Export/reporting features
  [ ] Performance tuning
  [ ] QA + UAT

Launch: Nov 1, 2026 (internal use)
```

---

## 10. Success Criteria

```
✅ FEATURE:
  - All 7 modules functional (customers, billing, analytics, support, content, flags, health)
  - Impersonation works (log in as customer, reproduce issue)
  - Feature flags can toggle without code push
  - Analytics queries < 2 sec
  - Audit log captures all admin actions

✅ OPERATIONAL:
  - Dozer can see MRR + churn in < 30 sec (dashboard)
  - Support tickets can be resolved 50% faster (impersonation)
  - Zero unauthorized admin access (logs + alerts)
  - Can toggle feature for beta test in < 2 min (no code push)

✅ BUSINESS:
  - -50% time on manual customer management
  - Real-time revenue visibility
  - Faster issue resolution (impersonation = faster fix)
  - Data-driven feature decisions (usage analytics)
```

---

# SUMMARY: PRD v15.0 (Admin Dashboard)

```
Feature: Internal Admin & Control Panel
Scope: 7 modules (customers, billing, analytics, support, content, flags, health)
Access: ROLE_SUPERADMIN only (dntech team)
Timeline: Sep-Oct 2026 (parallel with v14.0)
Launch: Nov 1 (internal use)
Status: Ready for SRS + SDD
```

**Next Step: SRS → Detailed requirements + acceptance criteria** ✅

---

*Last Updated: 24 Juli 2026 | Version: 15.0 (FINAL PRD) | Owner: Dozer*

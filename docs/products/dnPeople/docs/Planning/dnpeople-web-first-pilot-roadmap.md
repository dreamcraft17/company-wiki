# dnPeople — Web-First MVP Launch Strategy & Roadmap
## Pilot Phase (Q3 2026, 8 Weeks)

**Owner:** Dozer (CEO + Tech Lead)  
**Date:** July 18, 2026  
**Strategy:** Web-only launch, mobile deferred to Phase 2  
**Timeline:** 8 weeks (Now → September 2026)  
**Target:** 50-100 early adopter customers  
**Investment:** $35-40K

---

## Executive Summary

**Decision:** Web-first MVP launch. Mobile app deferred to Q1 2027 (Phase 3).

**Why:**
- ✅ Faster to launch (8 vs 16 weeks)
- ✅ Cheaper ($35-40K vs $115-180K)
- ✅ Easier to iterate (web = instant updates)
- ✅ Real customer feedback loop (don't build what they don't need)
- ✅ Revenue sooner (fund mobile development)
- ✅ Learn exactly what mobile features matter

**Roadmap:**
```
PHASE 1 (Q3 2026, 8 weeks):  Web-only MVP → 50-100 customers
PHASE 2 (Q4 2026, 12 weeks): Scale & iterate → 200-300 customers
PHASE 3 (Q1 2027, 8 weeks):  Mobile MVP (React Native)
PHASE 4 (Q2+ 2027):          Enterprise features
```

---

## Part 1: What Launches in 8 Weeks (Web MVP)

### ✅ INCLUDED IN PILOT

**Core Features (Already Done):**
```
✅ Employee management
✅ Attendance tracking (web + mobile browser)
✅ Payroll calculation (BPJS, PPh 21, THR)
✅ Payslips (PDF download)
✅ Leave management
✅ Permission requests
✅ Overtime tracking
✅ Claims & loans
✅ Dashboard
✅ Reports (Excel/PDF)
✅ Multi-tenant isolation
✅ RBAC (6 roles)
✅ SAML/OAuth SSO
✅ API framework
✅ Webhooks
✅ Feature tiers (Free/Starter/Professional)
```

**Must Finish Before Launch:**
```
✅ Data migration tools (Excel/CSV/Talenta export)
✅ Admin dashboard (basic tenant management)
✅ Monitoring setup (Datadog)
✅ Load testing (1000 concurrent users)
✅ Security audit (penetration testing)
✅ Backup verification (restore drill)
✅ Documentation (user guides, API docs)
✅ Support materials (FAQ, troubleshooting)
```

### ❌ DEFERRED (Phase 2+)

```
❌ Mobile native app (Phase 3, Q1 2027)
❌ Bank integrations (Phase 2, when customer demand clear)
❌ Accounting sync (Phase 2)
❌ 9-box matrix (Phase 2, v4 module 3)
❌ Succession planning (Phase 2)
❌ Internal career marketplace (Phase 3)
❌ EWA (Phase 3)
❌ Advanced compliance dashboard (Phase 2)
❌ TypeScript SDK (Phase 2)
❌ Custom vertical packages (Phase 3+)
```

---

## Part 2: 8-Week Detailed Roadmap

### WEEK 1-2: Feature Finalization & Testing

**Goal:** Freeze features, comprehensive testing, identify critical bugs

**Tasks:**
```
Backend:
[ ] Payroll calculation verification
  - Test all tax methods (GROSS, NET, GROSS_UP)
  - Test BPJS calculations (all variants)
  - Test proration + THR
  - Test with 1000+ employees (performance)
  
[ ] Attendance edge cases
  - Geofence validation
  - WiFi SSID detection
  - QR code scanning
  - GPS accuracy
  
[ ] Leave/Permission workflows
  - Overlap detection
  - Balance validation
  - Auto-sick policy
  - Carry-forward/expiry
  
[ ] Multi-tenant isolation
  - Verify WHERE companyId filter on all queries
  - Cross-tenant access attempts = 403
  - Audit trail per tenant
  
[ ] API error handling
  - All 400/401/403/500 responses consistent
  - Error messages helpful (not exposing internals)

Frontend:
[ ] Mobile responsiveness audit
  - Login page (mobile)
  - Attendance page (mobile, must be fast)
  - Payslip view (mobile)
  - Dashboard (mobile)
  
[ ] Performance
  - Page load < 3 seconds (mobile)
  - Dashboard load < 2 seconds
  - List pagination working (100+ items)
  
[ ] Accessibility
  - Keyboard navigation
  - Screen reader compatible
  - Color contrast WCAG AA

[ ] Browser compatibility
  - Chrome, Firefox, Safari (latest 2 versions)
  - Mobile Safari (iOS)
  - Mobile Chrome (Android)

QA:
[ ] 200+ test cases created
[ ] All 200 tests passing
[ ] No critical bugs remaining
[ ] Load test: 1000 concurrent users → p95 < 1s

Test Data:
[ ] 1000 employee fixture created
[ ] 3000 attendance records
[ ] 2 years of historical payroll
[ ] Mix of roles: SUPER_ADMIN, COMPANY_ADMIN, HR, MANAGER, FINANCE, EMPLOYEE
```

**Deliverables:**
- Test report (200+ cases, all green)
- Known issues list (only minor/cosmetic)
- Performance profile (latency, memory, CPU)
- Browser compatibility matrix

**Owner:** QA Lead + Backend Engineers  
**Time:** 10 days  
**Status:** ⏳ In Progress

---

### WEEK 3: Data Migration Tools

**Goal:** Enable customers to import from current systems (Excel, CSV, Talenta)

**Tasks:**

#### Excel/CSV Import (Enhance existing)
```
Backend:
[ ] Importer service
  - Accept .xlsx, .csv
  - Parse sheet tabs (employees, attendance, etc)
  - Validate columns + data types
  - Detect + merge duplicates
  - Generate error report (what failed + why)
  - Dry-run mode (preview before commit)
  - Transaction-based (all-or-nothing)

[ ] Field mapping
  - Auto-detect common headers (Name, Email, Salary, Dept)
  - Allow manual mapping if headers differ
  - Preserve formatting (dates, numbers)
  - Handle missing required fields

[ ] Validation rules
  - Email unique per company
  - Salary > 0
  - Department exists
  - Hire date <= today
  - Generate clear error messages

Frontend:
[ ] Import wizard (5 steps)
  1. File upload (.xlsx/.csv)
  2. Preview (show first 10 rows)
  3. Field mapping (match headers)
  4. Validation (show errors before commit)
  5. Confirm + import
  
[ ] Progress bar (% imported)
[ ] Error report (download)
[ ] Undo button (within 24h)

Test:
[ ] Sample files (20 employees, 50, 100, 1000)
[ ] Error cases (bad email, negative salary, missing dept)
[ ] Large files (10,000 employees)
[ ] Special characters (Indonesian names, accents)
```

#### Talenta CSV Export → Import
```
Backend:
[ ] Talenta importer
  - Accept Talenta CSV export format
  - Map Talenta fields → dnPeople schema
  - Handle Talenta-specific data (division, position level)
  - Preserve employee status (ACTIVE, PROBATION, etc)
  
Field mappings:
  - Talenta "Name" → dnPeople "name"
  - Talenta "Email" → dnPeople "email"
  - Talenta "Department" → dnPeople "department"
  - Talenta "Position" → dnPeople "position"
  - Talenta "Basic Salary" → dnPeople "salary"
  - Talenta "Status" → dnPeople "status"
  - Talenta "Join Date" → dnPeople "hire_date"

[ ] Test with real Talenta exports
[ ] Handle edge cases (empty fields, special chars)

Frontend:
[ ] Pre-configured template for Talenta
  - One-click import (no field mapping needed)
  - Recognizes Talenta format automatically
```

**Deliverables:**
- Excel/CSV importer (tested with 1000+ rows)
- Talenta CSV importer (auto-field mapping)
- Error handling + reporting
- Frontend wizard UI

**Owner:** 1 Full-Stack Engineer  
**Time:** 5 days  
**Status:** ⏳ Not Started

---

### WEEK 4: Monitoring & Infrastructure

**Goal:** Know if system is down, respond to incidents, verify backups work

**Tasks:**

#### Monitoring Setup (Datadog or New Relic)
```
[ ] Datadog/New Relic agent installed
[ ] Metrics collection
  - Request latency (p50, p95, p99)
  - Error rate (4xx, 5xx)
  - Database connection pool
  - CPU/Memory utilization
  - Disk space
  - API call rate per tenant
  
[ ] Dashboards created
  - Overview: Request rate, errors, latency
  - Database: Connection pool, query time
  - Tenant: API calls per tenant, storage usage
  
[ ] Alerts configured
  - Error rate > 1% (page Dozer)
  - Server CPU > 80% (page Dozer)
  - Database lag > 5 seconds (page Dozer)
  - Disk space < 10% (alert, not urgent)
  - Latency p95 > 1 second (alert)
```

#### Backup Verification
```
[ ] Daily backup script running
[ ] Backup location: S3 or offsite
[ ] Backup retention: 30 days full, 7 days incremental

[ ] Restore drill
  - Simulate database corruption
  - Restore from latest backup
  - Verify: RPO < 1 hour (max data loss)
  - Verify: RTO < 4 hours (recovery time)
  - Run test restore weekly

[ ] Document backup procedure
  - How to restore
  - Recovery time estimate
  - What data is lost (max)
```

#### Incident Response
```
[ ] On-call schedule (Dozer + engineer)
[ ] Escalation procedure (who to call)
[ ] Postmortem template (what happened, why, fix)
[ ] Runbook for common issues:
  - Server down
  - Database down
  - High latency
  - Disk full
  - Memory leak
```

**Deliverables:**
- Monitoring dashboard (live)
- Alert notifications working
- Backup verified (restore drill passed)
- Incident response playbook

**Owner:** 1 DevOps/Backend Engineer  
**Time:** 5 days  
**Status:** ⏳ Not Started

---

### WEEK 5: Admin Dashboard (Basic)

**Goal:** SUPER_ADMIN can manage tenants, see usage, support customers

**Tasks:**

```
Backend API:
[ ] GET /api/v1/platform/tenants
  Response:
  {
    "tenants": [
      {
        "id": "46a3bcb5...",
        "name": "Company A",
        "domain": "company-a.com",
        "tier": "PROFESSIONAL",
        "employeeCount": 150,
        "apiCallsToday": 8000,
        "storageUsedGb": 25,
        "lastLogin": "2026-07-18T10:15:00Z",
        "status": "ACTIVE",
        "createdAt": "2026-07-01T00:00:00Z"
      }
    ],
    "total": 1,
    "limit": 50,
    "offset": 0
  }

[ ] GET /api/v1/platform/tenants/:id
  Response: Full tenant details
  {
    "id": "46a3bcb5...",
    "name": "Company A",
    "domain": "company-a.com",
    "subscription": {
      "tier": "PROFESSIONAL",
      "monthlyUsers": 150,
      "monthlyRate": 3750000,
      "nextBillingDate": "2026-08-01",
      "status": "ACTIVE"
    },
    "usage": {
      "employeeCount": 150,
      "apiCallsMonth": 245000,
      "apiCallsLimit": 300000,
      "storageUsedGb": 25,
      "storageLimitGb": 50
    },
    "sso": {
      "enabled": true,
      "type": "SAML",
      "domain": "company-a.com"
    },
    "auditLog": [
      {
        "action": "LOGIN",
        "userId": "user_001",
        "timestamp": "2026-07-18T10:15:00Z"
      }
    ]
  }

[ ] POST /api/v1/platform/tenants/:id/impersonate
  (Support can login as COMPANY_ADMIN of tenant for debugging)

[ ] POST /api/v1/platform/tenants/:id/message
  (Send message to tenant admin)

Frontend Pages:
[ ] /platform/tenants
  - Table: Company name, tier, employee count, API usage, last login
  - Sort: by name, by usage, by revenue
  - Filter: tier, status (active/suspended)
  - Actions: click row → view detail, click button → impersonate

[ ] /platform/tenants/:id
  - Overview tab: subscription, usage metrics, SSO config
  - Analytics tab: API calls trend, storage trend
  - Support tab: send message, impersonate, view logs
  - Billing tab: invoice, renewal date
  
[ ] /platform/analytics
  - Total customers
  - Total employees managed
  - MRR
  - Customer growth chart (last 30 days)
  - Top features used
```

**Deliverables:**
- Tenant list API + UI
- Tenant detail API + UI
- Impersonate feature (for support)
- Basic analytics

**Owner:** 1 Full-Stack Engineer  
**Time:** 5 days  
**Status:** ⏳ Not Started

---

### WEEK 6: Testing & Bug Fixes

**Goal:** Harden code, fix bugs, achieve >99% uptime target

**Tasks:**

```
Security Testing:
[ ] SQL injection tests (all inputs)
[ ] Cross-site scripting (XSS) tests
[ ] CSRF protection verified
[ ] Rate limiting working
[ ] Password reset tokens expire
[ ] API key auth working
[ ] JWT validation working
[ ] SAML signature validation working

Integration Testing:
[ ] SAML login with Okta
[ ] SAML login with Azure AD
[ ] Google OAuth working
[ ] Microsoft OAuth working
[ ] API key authentication
[ ] Webhook delivery (test)

Performance Testing:
[ ] 1000 concurrent users
  - p50 latency < 500ms
  - p95 latency < 1000ms
  - p99 latency < 2000ms
  - Error rate < 0.1%
  
[ ] Database connection pool
  - No connections exhausted
  - No timeout errors
  
[ ] Memory profiling
  - No memory leaks
  - Memory stable over 24h

Bug Fixes:
[ ] All critical bugs fixed (blocking launch)
[ ] High priority bugs fixed (affecting UX)
[ ] Medium priority logged for Phase 2
[ ] Known issues documented

Regression Testing:
[ ] All 200 test cases still passing
[ ] No new bugs introduced
```

**Deliverables:**
- Security test report (all passed)
- Load test results (metrics shown)
- Bug fix list (critical + high)
- Test automation suite

**Owner:** QA Lead + Backend Engineers  
**Time:** 5 days  
**Status:** ⏳ Not Started

---

### WEEK 7: Documentation & Support Materials

**Goal:** Users can self-serve, support team can help customers

**Tasks:**

#### User Documentation
```
[ ] Getting started guide (5 pages)
  1. Login
  2. Import employees
  3. Setup departments
  4. Configure payroll
  5. Run first payroll

[ ] Feature guides (5-10 pages each)
  - Attendance: How to clock in, correct, late policy
  - Payroll: How to run, understand payslip, export
  - Leave: How to request, approve, view balance
  - Reports: How to generate, export, understand
  
[ ] Video tutorials (2-3 min each)
  - Login + navigate dashboard
  - Import employees from Excel
  - Clock in (mobile browser)
  - Run payroll
  - Approve leave request
  
[ ] FAQ (50+ Q&A)
  - Account creation
  - Password reset
  - SSO setup
  - Import issues
  - Payroll questions
  - Leave balance questions
```

#### Support Documentation
```
[ ] Onboarding playbook
  - Welcome email template
  - Setup checklist (10 items)
  - Common questions + answers
  - Video links
  
[ ] Troubleshooting guide
  - "Can't login" → steps to debug
  - "Import failed" → error codes + solutions
  - "Payroll not calculating" → checklist
  - "Attendance missing" → data validation
  
[ ] Admin reference
  - User management (add/remove/reset password)
  - Department management
  - Payroll configuration
  - SSO setup per IdP (Okta, Azure, Google)
  
[ ] API documentation
  - OpenAPI spec (Swagger)
  - Code examples (curl, Python, Node.js)
  - Error codes + meanings
  - Rate limits
  
[ ] SLA + Support policy
  - Response time: 24h (during business hours)
  - Support channels: email, chat
  - Escalation: critical issues (outage) → 1h response
```

#### Marketing Materials
```
[ ] 30-second product video (for website)
[ ] Use case templates (manufacturing, retail, startup)
[ ] Feature comparison table
[ ] Pricing page (clear, honest)
[ ] Case study template (for first customers)
```

**Deliverables:**
- User guides (PDF)
- Video tutorials (YouTube)
- FAQ knowledge base
- Support playbook
- API docs (Swagger UI)

**Owner:** 1 Technical Writer + Product  
**Time:** 5 days  
**Status:** ⏳ Not Started

---

### WEEK 8: Soft Launch & Go-Live

**Goal:** 10-20 beta customers, gather feedback, fix critical issues, prepare for public launch

**Tasks:**

#### Soft Launch
```
[ ] Select 10-20 beta customers
  - Mix: startup, manufacturing, retail
  - Size: 20-500 employees
  - Willingness: accept some bugs, provide feedback
  
[ ] Onboarding call with each
  - 30 min: walk through setup
  - Answer questions
  - Collect initial feedback
  
[ ] Daily check-ins (Week 8)
  - "How's it going?"
  - "Any blockers?"
  - "What's your #1 wish feature?"
  
[ ] Monitor
  - Error rate (should be <0.5%)
  - System uptime (>99%)
  - Response times (p95 <1s)
  - Support tickets (log + fix)
  
[ ] Feedback collection
  - Survey (20 questions, net promoter score)
  - Feature requests (log for Phase 2)
  - Bug reports (log severity)
  
[ ] Critical bug hotfix
  - If critical blocker found, fix within 24h
  - Re-test with customer
  - Deploy same day

#### Go-Live Prep
```
[ ] Website ready
  - Pricing clear + honest
  - Features listed (no BS)
  - FAQ visible
  - Email signup form
  
[ ] Email sequences ready
  - Welcome email (with setup link)
  - Day 3: "How's it going?"
  - Day 7: "Feature tips"
  - Day 14: "Success story" or "help"
  
[ ] Sales materials
  - 1-pager (what is dnPeople)
  - ROI calculator (payroll hours saved)
  - Demo video link
  
[ ] Support ticket system
  - Email-to-ticket (support@dnpeople.id)
  - Response template
  - Escalation procedure
  
[ ] Monitoring live
  - Dashboards visible
  - Alerts firing correctly
  - Backup working

[ ] Launch announcement
  - LinkedIn post
  - Email to network
  - Join beta customer communities
```

**Go-Live Checklist:**
```
✅ Website live
✅ Signup working
✅ Monitoring live
✅ Support email setup
✅ Documentation published
✅ Video tutorials published
✅ FAQs published
✅ Beta feedback incorporated
✅ Critical bugs fixed
✅ System tested (1000 concurrent users)
✅ Backup verified (restore drill)
✅ On-call schedule active
✅ Incident runbook ready
```

**Deliverables:**
- Soft launch completed (10-20 beta users)
- Feedback report (what's working, what needs fix)
- Critical bug list (fixed)
- Website live
- Public launch ready

**Owner:** Product + Dozer + Team  
**Time:** 5 days  
**Status:** ⏳ Not Started

---

## Part 3: Launch Checklist (Week 8)

### ✅ Features
```
[x] Login (email, password, SSO)
[x] Employee management
[x] Attendance tracking
[x] Payroll calculation
[x] Payslips
[x] Leave management
[x] Permissions
[x] Overtime
[x] Claims & loans
[x] Dashboard
[x] Reports
[x] Multi-tenant isolation
[x] RBAC
[x] Feature tiers
[x] API + webhooks
[ ] Data import (Excel/CSV/Talenta)
[ ] Admin dashboard
```

### ✅ Infrastructure
```
[ ] Monitoring live (Datadog)
[ ] Alerts configured
[ ] Backup working + verified
[ ] Load tested (1000 users)
[ ] No critical bugs
[ ] Performance: p95 < 1s
[ ] Uptime: >99%
```

### ✅ Security
```
[ ] SQL injection tests passed
[ ] XSS tests passed
[ ] CSRF protection working
[ ] Rate limiting working
[ ] SAML/OAuth tested
[ ] Penetration test done (or scheduled)
[ ] No secrets in logs
[ ] Encryption at-rest + in-transit
```

### ✅ Documentation
```
[ ] User guides published
[ ] Video tutorials published
[ ] FAQ published
[ ] API docs (Swagger)
[ ] Support playbook ready
[ ] Onboarding checklist ready
```

### ✅ Marketing
```
[ ] Website live
[ ] Pricing page live
[ ] Blog post announcing launch
[ ] LinkedIn announcement
[ ] Email to network
[ ] Product Hunt submission
[ ] BetaList submission
```

### ✅ Support
```
[ ] Support email setup (support@dnpeople.id)
[ ] Ticket system working
[ ] Response template ready
[ ] FAQ knowledge base ready
[ ] Escalation procedure documented
[ ] On-call schedule active
```

---

## Part 4: Success Metrics & KPIs

### PILOT TARGETS (Q3 2026)

```
Customer Acquisition:
✅ Signups: 100+
✅ Paying customers: 50+
✅ Active usage: >80% (run payroll 1x)
✅ MRR: IDR 5-10M

Customer Satisfaction:
✅ NPS: >40
✅ Support tickets/customer: <2/month
✅ Feature requests logged: 20+
✅ Churn: <5% (acceptable for pilot)

Technical:
✅ Uptime: >99%
✅ Latency (p95): <1 second
✅ Error rate: <0.1%
✅ Data import success: >95%
✅ Backup verified: weekly
```

### PHASE 2 TARGETS (Q4 2026)

```
Customers: 200-300
MRR: IDR 30-50M
NPS: >50
Churn: <3%
Feature: Bank integrations live
Roadmap: Mobile MVP designed
```

---

## Part 5: Resource & Investment

### TEAM REQUIREMENT

```
Week 1-8: 3 engineers (2 backend/full-stack, 1 frontend)
          1 QA engineer (part-time)
          1 technical writer (part-time)
          Dozer (CEO, oversight + decisions)

Total effort: ~25 engineer-weeks
```

### COST BREAKDOWN

```
Engineering time:       $25-30K (3 engineers × 8 weeks)
Infrastructure:         $2-3K (Datadog, backups, testing)
Security audit:         $3-5K (or defer to Phase 2)
Documentation tools:    $1-2K (Figma, video editing)
Marketing:              $2-3K (website, landing page)
──────────────────────────────
TOTAL:                  $33-43K
```

### TOOLS NEEDED

```
Development:
  ✅ Node.js, Express, React (already have)
  ✅ PostgreSQL (already have)
  ✅ GitHub (already have)
  
Monitoring:
  ⬜ Datadog or New Relic ($500-1000/month)
  ⬜ PagerDuty (optional, $200/month)
  
Testing:
  ✅ Jest, Cypress (free)
  ✅ k6 for load testing (free)
  
Documentation:
  ⬜ Swagger/OpenAPI (free)
  ⬜ Docs site (Docusaurus, free)
  ⬜ Video hosting (YouTube, free)
  
Support:
  ⬜ Email ticketing (Helpscout $25/month or free alternative)
  ⬜ Knowledge base (Notion, free)
```

---

## Part 6: Risk & Mitigation

### RISKS

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Critical bug found post-launch | Medium | High | 1-week buffer for fixes, on-call team |
| Security vulnerability | Low | Critical | Penetration test week 6-7 |
| Data migration fails | Medium | High | Test with 10K+ employee files, rollback capability |
| Server down/outage | Low | High | Monitoring + alerts, backup verified |
| Integration issues (Okta, Azure) | Medium | Medium | Test each IdP week 6 |
| Churn rate high (>10%) | Medium | Medium | Daily feedback, iterate feature priorities |
| Customer doesn't pay | Low | Low | Start with credit card upfront |

### MITIGATION STRATEGY

```
1. Feature freeze (Week 1-2)
   → No new features after day 10
   → Only bug fixes + hardening
   
2. Buffer time (1 week)
   → Week 7 for unexpected issues
   → Slip Week 8 if needed (soft launch delay OK)
   
3. Daily standup
   → Check critical path progress
   → Unblock dependencies same day
   
4. On-call readiness
   → Dozer + engineer on-call week 8+
   → Runbook + escalation path defined
   
5. Communication
   → Weekly update to team
   → Transparent about delays
```

---

## Part 7: Phase 2 (Q4 2026) Sneak Peek

**Once you have 50-100 customers, what's next:**

### PHASE 2: SCALE & ITERATE (12 weeks, Q4 2026)

```
Goal: Reach 200-300 customers, incorporate feedback

Week 1-4: Most-requested features (from beta feedback)
  - Possibly: Better reporting, advanced leave policies, shifts
  - Maybe: Bank preview/integration if 20+ customers ask
  
Week 5-8: Operational improvements
  - Better audit logs
  - Batch operations (bulk update employees)
  - Advanced filters/search
  
Week 9-12: Mobile design + planning
  - UX research: what do users actually need on mobile?
  - Design React Native MVP (attendance + payslip)
  - Plan architecture for Phase 3 launch
  
Plus ongoing:
  - Bug fixes (from support tickets)
  - Performance improvements
  - Customer training + onboarding
```

### PHASE 3: MOBILE (Q1 2027, 8 weeks)

```
Goal: iOS + Android MVP (attendance + payslip viewing)

Stack: React Native (code-share with web)
Timeline: 6-8 weeks (1 engineer)
Cost: $15-20K

Features:
  ✅ Clock-in (GPS, QR, WiFi, selfie optional)
  ✅ Payslip viewing
  ✅ Leave request
  ✅ Basic dashboard
  ✅ Offline sync (queue requests)
  
Not included:
  ❌ Biometric (phase 4)
  ❌ Full feature parity (phase 4)
```

---

## Part 8: Decision Gates (Go/No-Go)

### END OF WEEK 4: Decision Point
```
Decision: Continue to launch, or delay?

Go criteria:
✅ All Week 1-3 tasks complete
✅ 0 critical bugs
✅ Load test passed (1000 users, p95 < 1s)
✅ No security vulnerabilities found

No-go if:
❌ Critical bug found (payroll miscalculation, data loss)
❌ Performance fails (p95 > 2s)
❌ Security issue (SQL injection, data exposure)

Action: If no-go, delay 1-2 weeks + fix
```

### END OF WEEK 7: Final Go-Live Check
```
Decision: Launch to public?

Go criteria:
✅ Soft launch successful (10-20 beta users OK with it)
✅ All critical + high bugs fixed
✅ Backup verified + restore drill passed
✅ Monitoring live + dashboards working
✅ Documentation complete

No-go if:
❌ >5 critical bugs remain
❌ Backup restore failed
❌ Customer blockers not resolved

Action: If no-go, delay public launch to September 15
        (but beta continues)
```

---

## Part 9: Communication Plan

### INTERNAL (Team)

```
Weekly standup: Monday 10am
  - Progress: what's done, what's next
  - Blockers: what's slowing us down
  - Metrics: velocity, test coverage
  
Daily async: Slack #dnpeople-launch
  - Quick updates (done/blocked/help needed)
  - No long meetings
  
Dozer review: Friday 4pm
  - Week summary
  - Next week priorities
  - Go/no-go decision if needed
```

### EXTERNAL (Customers)

```
Pre-launch: Signups page
  "Launching in September 2026!
   Join waitlist for early access → free 3 months"
  
Beta phase: Weekly email
  "Week X update: [feature launched] [bugs fixed]"
  
Launch: Announcement
  "dnPeople is live! 🎉
   Free tier: up to 100 employees
   Starter: IDR 20K/emp/month"
   
Post-launch: Weekly tips
  "Feature tip: How to use X"
  "Success story: Company Y increased productivity by Z%"
```

---

## Part 10: After Launch (Ongoing)

### WEEK 9+: PHASE 2 BEGINS

```
Daily:
  [ ] Monitor system (uptime, errors, latency)
  [ ] Support: respond to tickets <24h
  [ ] Bug fixes: critical same day, high next day
  
Weekly:
  [ ] Customer feedback review
  [ ] Feature request prioritization
  [ ] Roadmap adjustment (based on real usage)
  
Monthly:
  [ ] Customer survey (NPS, satisfaction)
  [ ] Metrics review (users, MRR, churn)
  [ ] Roadmap planning (Phase 2 priorities)
```

### CUSTOMER SUCCESS METRICS (Ongoing)

```
Track:
  - Signups/day
  - Paying customers
  - MRR (monthly recurring revenue)
  - Churn rate (% customers lost/month)
  - NPS (net promoter score)
  - Feature usage (which features used most)
  - Support tickets/customer
  - Time to first payroll run
  
Dashboard: Internal metrics view (visible to team)
```

---

## Summary: 8-Week Path to Launch

```
Week 1-2:   ✅ Testing + feature freeze
Week 3:     ✅ Data import tools
Week 4:     ✅ Monitoring + backups
Week 5:     ✅ Admin dashboard
Week 6:     ✅ Bug fixes + hardening
Week 7:     ✅ Documentation + support
Week 8:     ✅ Soft launch → go-live

Result: Web-first MVP, 50-100 customers, Q3 2026 ✅
Next: Phase 2 scaling + Phase 3 mobile
```

---

## Appendix: Deferred to Phase 2+

**These are NOT in web MVP (be honest about roadmap):**

```
Mobile app           → Phase 3 (Q1 2027)
Bank integrations    → Phase 2 (based on customer demand)
Accounting sync      → Phase 2 (Jurnal, Xero)
9-box matrix         → Phase 2 (talent module)
Succession planning  → Phase 2-3 (enterprise)
Internal marketplace → Phase 3
EWA                  → Phase 3
Developer SDK        → Phase 2
Biometric auth       → Phase 3-4 (if needed)
Custom vertical PKG  → Phase 3+ (manufacturing, retail)
```

**Why defer:**
- ✅ Faster to launch (8 vs 16+ weeks)
- ✅ Learn what customers actually need first
- ✅ Build based on real usage, not guesses
- ✅ Get revenue to fund these features

---

*Last Updated: July 18, 2026 | Owner: Dozer | Status: Ready for Execution*

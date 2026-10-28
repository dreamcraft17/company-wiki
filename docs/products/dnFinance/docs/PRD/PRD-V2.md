# dnFinance Product Requirements Document (PRD) — Phase 2
**Version:** 2.0  
**Date:** August 2026  
**Author:** Dozer Fernando Saroha Daniel Napitupulu  
**Status:** Production Hardening & Phase 2 Features  
**Baseline:** MVP V1.0 (92% feature coverage, demo-ready)

---

## 1. EXECUTIVE SUMMARY

### Current State (MVP V1.0 — Q4 2026 Launch)
- ✅ **Feature completeness:** 92% (COA, GL, AR/AP, inventory, tax, reports all working)
- ✅ **Demo-ready:** End-to-end workflows functional in-memory + JSON file persistence
- ❌ **Production-ready:** Database/email/cache still simulated; no staging deployment
- ✅ **Frontend:** React + Tailwind complete
- ⚠️ **Testing:** 16 unit tests (~40% of SRS target)

### Phase 2 Goals (Production Launch — Q1 2027)
1. **Production Stack:** Wire PostgreSQL 15, real Gmail, Bull queue, Redis cache
2. **Stability:** >80% test coverage, staging deployment, CI/CD automation
3. **Scale:** Multi-instance deployment, rate limiting, monitoring/alerts
4. **Features:** P1 completeness (approval workflows, scheduled reports, departments)
5. **Revenue:** Move from demo tier to paying customers (Growth/Pro/Plus)

---

## 2. PHASE 2 SCOPE (Weeks 17-48, Q4 2026 → Q1 2027)

### Phase 2.1: Production Infrastructure (Weeks 17-32, 4 months)

#### Tier: CRITICAL (P0) — Required Before Production Launch
- **Database Migration:** PostgreSQL 15 + TypeORM wiring (replace JSON file store)
- **Real Email:** Gmail API + Nodemailer (replace in-memory log)
- **Async Jobs:** Bull queue for email, PDF generation, scheduled reports
- **Staging Environment:** Cloud Run staging + dedicated Cloud SQL dev instance
- **CI/CD Automation:** GitHub Actions pipeline for staging/prod deploy
- **Integration Tests:** 50+ integration tests (approval flow, GL posting, invoice lifecycle)
- **Monitoring Baseline:** Winston structured logging + basic Datadog setup

**Success Metrics:**
- Database: 100% queries via PostgreSQL (zero JSON file reads)
- Email: 100% real Gmail delivery (zero in-memory simulation)
- Tests: Integration tests >80%, E2E smoke tests on staging
- Deploy: Staging fully automated via GitHub Actions on PR
- Monitoring: All errors logged + alertable in Datadog

---

#### Tier: HIGH (P1) — Required for MVP Launch Readiness
- **Journal Entry Approval:** Workflow for manual GL posting (currently bypassed)
- **Email Approval Tokens:** 24h JWT for bill approval links (one-click approve)
- **Scheduled Reports:** Cron jobs for daily/weekly/monthly report emails
- **AR/AP Overdue Automation:** Daily cron check + email notification
- **Department Dimension:** GL accounts tagged to departments; P&L by department
- **Vendor CSV Import:** Missing from current scope
- **Inventory FIFO Costing:** Basic quantity tracking works; cost tracking deferred
- **Rate Limiting:** Redis-backed rate limiting (100 req/min per IP)

**Success Metrics:**
- Approval workflows: All transactions require correct approvals
- Scheduled reports: 95%+ on-time delivery
- Rate limiting: Bots/scrapers blocked at 100 req/min threshold

---

#### Tier: MEDIUM (P2) — Post-Launch Optimization
- **Redis GL Balance Cache:** 5-min TTL on GL account balances (reduce DB queries)
- **Report Caching:** 5-min TTL on trial balance/P&L/BS (refresh on GL posting)
- **Cloud Storage:** Move PDF exports to Google Cloud Storage (not local disk)
- **Datadog APM:** Full instrumentation for request tracing, error tracking
- **Mobile App Prep:** API-first readiness (already done; just marketing)
- **Industry Templates:** Multi-tenant pre-built COA for 5 verticals (already done)

---

### Phase 2.2: Customer Acquisition & Launch (Weeks 33-40)

#### Marketing & Sales Prep
- **Documentation:** User guide, admin guide, API docs (Swagger already live)
- **Pricing Page:** Live pricing calculator (Starter/Growth/Pro/Plus tiers)
- **Customer Onboarding:** Setup wizard, video tutorials (3-5 min per feature)
- **Support System:** Help desk system (Zendesk or Freshdesk)
- **Partner Program:** Accounting firm reseller sign-up (white-label ready?)

#### Launch Checklist
- Beta test with 50 SME users (collect NPS, feedback)
- Fix top 20 reported bugs
- Load test: 100 concurrent users for 2 hours
- Security audit: OWASP Top 10 review + penetration test
- SLA documentation: 99.5% uptime target, incident response

---

### Phase 2.3: Post-Launch (Weeks 41-48)

#### Monitoring & Iteration
- First 30 days: On-call support (4h response time for critical bugs)
- Analyze usage: Which features used, which abandoned
- NPS tracking: Target 40+; adjust messaging based on feedback
- Performance tuning: Identify slow queries, add missing indexes

#### Phase 3 Planning (Roadmap for Q2 2027)
- **OCR Invoice:** Photo/scan → auto-extract vendor, amount, tax
- **Bank Sync:** OKE file import → auto-reconcile GL
- **Mobile App:** React Native or PWA (API-first ready)
- **POS Integration:** Kidzania, NCR systems integration
- **Multi-Currency:** Support IDR/USD/SGD (roadmap only)

---

## 3. DETAILED REQUIREMENTS

### P0: Production Stack (CRITICAL)

#### Requirement 3.1: PostgreSQL 15 Database Wiring
**Why:** JSON file persistence not scalable, no ACID transactions, no concurrent access

**Requirements:**
- [ ] Migrate TypeORM entities to PostgreSQL (copy from SDD §4 schema)
- [ ] Run migrations: 001_init (tenants, users, accounts, etc), 002_extensions (indexes, triggers)
- [ ] Connection pooling: Managed PostgreSQL (Cloud SQL) with 20-connection pool
- [ ] Data migration: Export current JSON → import to Postgres (preserving IDs, timestamps)
- [ ] Validation: All GL accounts balanced before/after migration
- [ ] Rollback plan: Keep JSON backup for 30 days post-migration
- [ ] Performance check: GL posting <100ms (P50), <300ms (P95)

**Acceptance Criteria:**
- All API endpoints query PostgreSQL exclusively (zero JSON file reads)
- Unit tests pass with test PostgreSQL instance
- Data integrity: Trial balance balances before/after migration
- Concurrent tests: 10 simultaneous GL postings atomic

---

#### Requirement 3.2: Real Email (Gmail API)
**Why:** Overdue reminders, approval notifications, scheduled reports must reach customer email

**Requirements:**
- [ ] Gmail API setup: Service account with SMTP.SEND permission
- [ ] Nodemailer configuration: TLS/STARTTLS, retry logic (exponential backoff)
- [ ] Email templates: TypeScript template engine (Handlebars or EJS)
  - Invoice sent notification (PDF attachment, due date)
  - Bill approval request (2-level sequential approval)
  - Overdue reminder (AR/AP aging, due in 3 days)
  - Scheduled report (P&L/BS/trial balance PDF)
  - Admin: user invitation, password reset
- [ ] Delivery tracking: Email log (recipient, template, timestamp, status)
- [ ] Bounce handling: Mark invalid emails, notify admin
- [ ] Rate limiting: 100 emails/min per tenant (prevent spam)

**Acceptance Criteria:**
- Email delivery: >95% success rate (test with real email)
- Attachments: PDF invoices + reports sent with email
- Recovery: Retry failed emails 3x with 5/15/60min intervals

---

#### Requirement 3.3: Bull Job Queue (Async Tasks)
**Why:** Email, PDF generation, scheduled reports block API without queue

**Requirements:**
- [ ] Bull setup: Redis-backed job queue with process workers
- [ ] Jobs:
  - `sendEmail` (invoice sent, approval request, overdue reminder)
  - `generateReportPdf` (P&L, balance sheet, trial balance)
  - `scheduledReportEmail` (daily/weekly/monthly cron)
  - `arAgingReminder` (daily check, email overdue invoices)
  - `apPaymentDueNotification` (daily, remind of due bills)
- [ ] Failure handling: Max retry 3x, dead-letter queue for failed jobs
- [ ] Monitoring: Job queue depth logged, alert if >1000 pending
- [ ] Scaling: Multiple workers possible (currently single)

**Acceptance Criteria:**
- Async email: Sent within 5 seconds (queued, not waited)
- Job recovery: Failed jobs logged and retryable via admin panel
- Queue resilience: Job persisted before processing (no data loss)

---

#### Requirement 3.4: Staging Deployment (CI/CD Automation)
**Why:** Test production code before shipping; ensure migrations work; catch bugs early

**Requirements:**
- [ ] GitHub Actions: Trigger on PR branch push
  - Run linter + tests
  - Build Docker image
  - Deploy to Cloud Run staging (auto-destroy after 24h? or keep)
  - Run smoke tests (register, login, create invoice, GL post)
  - Post PR comment: "Deployed to staging: https://staging-pr-123.dnaccounting.app"
- [ ] Staging environment:
  - Separate Cloud Run instance + Cloud SQL database
  - Seeded with demo tenant (for QA testing)
  - Email sends to staging email only (not real users)
  - Logs forwarded to Datadog
- [ ] Promotion to production:
  - Require 2 approvals on PR
  - Manual "Deploy to Prod" button in GitHub Actions
  - Blue-green deployment (old version stays running)
  - Auto-rollback if 5xx error rate >5% in first hour

**Acceptance Criteria:**
- PR deployments: Auto-deploy to staging in <5 min
- Smoke tests: Pass 100% before marking green
- Rollback: Revert to previous version in <2 min if errors spike

---

#### Requirement 3.5: Integration Test Suite (80% Coverage)
**Why:** Unit tests cover functions; integration tests verify workflows end-to-end

**Requirements:**
- Target: 50+ integration tests covering:
  1. **Auth flow** (3 tests): register tenant → login → create user → invite email
  2. **GL flow** (8 tests):
     - Create COA from template → GL accounts exist
     - Post journal → GL account balance updated
     - Post invoice → AR/revenue/tax GL all correct
     - Post payment → AR reduced, bank increased
     - Trial balance: always balanced
     - Multi-entry GL: 1000 entries → <1s trial balance
     - Approval workflow: draft → pending → approved → posted
  3. **AR workflow** (6 tests):
     - Create invoice → PDF generated → email queued
     - Record payment (partial) → AR aging buckets updated
     - Overdue mark → email triggered
     - Customer master → invoice linked correctly
  4. **AP workflow** (6 tests):
     - Create bill → PPh 23 calculated
     - Multi-level approval: 2 approvers → sequential
     - Approval token email: one-click approval link works
     - GL posting on approval
  5. **Inventory workflow** (4 tests):
     - Stock in → inventory asset GL posted
     - Stock out → COGS GL posted
     - Low-stock alert → triggered
     - Valuation report: total matches GL
  6. **Reporting** (6 tests):
     - P&L: revenue - COGS - expenses = net income
     - Balance sheet: assets = liabilities + equity
     - Trial balance: debit = credit
     - Date filters: P&L for Jan only vs full year
     - AR/AP aging: buckets sum correctly
     - Cash flow: receipts - payments
  7. **Tax** (3 tests):
     - PPN invoice → GL account debited
     - PPh bill → GL account debited
     - Tax summary: PPN in/out net correct
  8. **Import/Export** (4 tests):
     - COA import CSV → accounts created
     - GL export CSV → transactions match
     - Fixture data: seed consistent test data
  9. **Multi-tenant** (2 tests):
     - Tenant A data isolated from B
     - RBAC: viewer cannot POST
  10. **Performance** (2 tests):
      - GL posting 100x concurrently → all atomic
      - Report generation: P&L 1000 txns <500ms

**Test Framework:** Jest + database test fixtures (fresh DB per test)
**CI:** Run on every PR, must pass to merge

---

### P1: Feature Completeness (HIGH)

#### Requirement 3.6: Journal Entry Approval Workflow
**Currently:** Journals post immediately (no approval required)  
**Target:** Optional 2-level approval before posting (like bills)

**Requirements:**
- [ ] Bill approval workflow already built (reuse same pattern)
- [ ] Extend for journal entries: admin can enforce approval on JE creation
- [ ] Email approval link: "Approve journal entry: [link]"
- [ ] GL posting only after all approvals
- [ ] Audit: Log who approved, when, any comments

---

#### Requirement 3.7: Email Approval Deep Links (24h Tokens)
**Currently:** Bill approvals via web UI only  
**Target:** Click link in email → approve without login

**Requirements:**
- [ ] Token format: JWT { approval_id, approver_id, exp: NOW + 24h }
- [ ] Endpoint: `GET /approvals/:token/approve?decision=approved`
- [ ] One-time use: Token deleted after use (or expires after 24h)
- [ ] UX: Link opens page with: "Approve bill INV-001 for Rp 1,000,000?" [Approve] [Reject]
- [ ] Fallback: If token expired, prompt login + link to bill page

---

#### Requirement 3.8: Scheduled Report Email + Cron Jobs
**Currently:** Reports only downloadable via UI  
**Target:** Auto-email P&L/BS/trial balance daily/weekly/monthly

**Requirements:**
- [ ] UI: Report → "Schedule email" → frequency (daily, weekly, Monday 8 AM, etc)
- [ ] Cron job: Bull job runs at scheduled time
- [ ] Email: P&L table in email + PDF attachment
- [ ] Admin: Can cancel scheduled reports
- [ ] Timezone: Respect tenant timezone (default: Asia/Jakarta)

---

#### Requirement 3.9: AR/AP Overdue Automation
**Currently:** Manual "check overdue" or overdue marked when viewing  
**Target:** Daily cron check → email reminder to customer/vendor

**Requirements:**
- [ ] Cron job (daily, 6 AM): Check for invoices due_date < today
- [ ] Email: "Invoice INV-001 for Rp 500k due 3 days ago. Please pay now."
- [ ] AP: "Bill BILL-001 for Rp 1M due 2 days ago. Schedule payment."
- [ ] Frequency: 1x per day (not multiple reminders per invoice)
- [ ] Opt-out: Customer/vendor can disable reminders

---

#### Requirement 3.10: Department Dimension on Reports
**Currently:** P&L aggregates all expenses  
**Target:** P&L by department (GL accounts tagged to departments)

**Requirements:**
- [ ] COA enhancement: Add department field (optional) to each GL account
- [ ] P&L: Filter by department (dropdown)
- [ ] Report: Show P&L with/without department filter
- [ ] Example: 
  - Department "Marketing": all marketing GL accounts → subtotal
  - Department "Operations": all ops accounts → subtotal

---

### P2: Scale & Optimization (MEDIUM)

#### Requirement 3.11: Redis GL Balance Cache
**Why:** GL balance queries hit DB; cache reduces load

**Requirements:**
- [ ] Cache key: `gl_balance:${tenantId}:${accountId}`
- [ ] TTL: 5 minutes (invalidate on GL posting)
- [ ] Fallback: If Redis down, query DB directly
- [ ] Monitoring: Cache hit ratio logged (target >80%)

---

#### Requirement 3.12: Rate Limiting (Redis-backed)
**Why:** Prevent brute force, API scraping

**Requirements:**
- [ ] 100 requests/min per IP (global)
- [ ] 1000 requests/min per authenticated user
- [ ] Response: 429 Too Many Requests after limit
- [ ] Exception: Whitelist internal IPs (Cloudflare, webhooks)

---

#### Requirement 3.13: Cloud Storage for PDFs
**Why:** Local disk not scalable; Cloud Storage = reliable + CDN

**Requirements:**
- [ ] Move PDF generation: local buffer → Google Cloud Storage
- [ ] Signed URL: PDF accessible for 1 hour (auto-expire)
- [ ] Cleanup: Delete PDFs after 7 days (cost savings)

---

## 4. RELEASE TIMELINE

### Phase 2.1: Production Infrastructure (Weeks 17-32)
- **Weeks 17-20:** PostgreSQL wiring + data migration + integration tests (50 tests)
- **Weeks 21-24:** Real email (Gmail) + Bull queue + staging deployment
- **Weeks 25-28:** CI/CD automation + monitoring baseline (Winston + Datadog)
- **Weeks 29-32:** P1 features: approvals, email tokens, scheduled reports, overdue cron

### Phase 2.2: Launch Prep (Weeks 33-40)
- **Weeks 33-36:** Beta test (50 SME users) + support setup
- **Weeks 37-40:** Fix bugs + load test + security audit + launch

### Phase 2.3: Post-Launch (Weeks 41-48)
- **Weeks 41-44:** Monitor + iterate + gather feedback
- **Weeks 45-48:** Plan Phase 3 (OCR, bank sync, mobile)

---

## 5. SUCCESS METRICS

### Production Stability
- **Uptime:** 99.5%+ (SLA: max 3.6h downtime/month)
- **Error rate:** <0.1% 5xx errors
- **Latency:** P95 <500ms, P99 <1s
- **Data integrity:** Trial balance always balanced (audit nightly)

### Testing & Quality
- **Test coverage:** >80% (50+ integration tests passing)
- **Bug escape rate:** <5 bugs per 100 deployed features (post-launch)
- **Deployment frequency:** Once per week (stable)

### User Growth & Revenue
- **Active users (30d):** 100+ → 300 by end of Q1 2027
- **MRR:** Rp 50M (50 Growth tier @ Rp 199k/mo)
- **Churn:** <5% monthly
- **NPS:** >40 (after month 1 launch)

### Customer Satisfaction
- **Support ticket time:** <4h first response (critical), <24h resolve (non-critical)
- **Feature adoption:** 70%+ of users use GL posting monthly
- **Onboarding:** <15 min from register to first invoice

---

## 6. RISKS & MITIGATION

### Risk: Database Migration Data Loss
**Severity:** P0  
**Mitigation:**
- Backup JSON data before migration
- Validation script: Verify GL balances match before/after
- Staging test: Run migration on staging first
- Rollback plan: Keep backup for 30 days

### Risk: Email Delivery Failures
**Severity:** P1  
**Mitigation:**
- Retry logic: 3x with exponential backoff
- Dead-letter queue: Manually investigate failed emails
- Monitoring: Alert if email success rate <90%

### Risk: Staging Secrets Exposed
**Severity:** P1  
**Mitigation:**
- GitHub Actions: Use GITHUB_SECRETS for sensitive vars (never in code)
- Rotation: Change staging DB password monthly
- Audit: Log all staging access

### Risk: PostgreSQL Connection Pool Exhaustion
**Severity:** P2  
**Mitigation:**
- Pool size: 20 connections (adjust if needed)
- Monitoring: Alert if >80% pool utilization
- Timeout: Kill idle connections after 30 min

---

## 7. APPENDIX: Roadmap Phase 3 (Q2 2027)

### Deferred Features (Scope-Cut for MVP)
- **OCR Invoice:** Photo/scan invoice → auto-extract vendor, amount, tax (requires ML model)
- **Bank Sync:** OKE file upload → auto-reconcile GL (requires bank data parsing)
- **POS Integration:** Kidzania, NCR → daily sales auto-post to GL
- **Multi-Currency:** Support USD, SGD (complex: requires forex rates, translation)
- **Mobile App:** React Native or PWA (API already mobile-ready; UI layer only)
- **Advanced Inventory:** FIFO/FEFO costing, lot tracking, expiry management

---

**END OF PRD V2**

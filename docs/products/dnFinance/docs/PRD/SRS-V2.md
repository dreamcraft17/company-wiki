# dnFinance Software Requirements Specification (SRS) — Phase 2
**Version:** 2.0  
**Date:** August 2026  
**Sprint Duration:** 2 weeks × 16 sprints = 32 weeks (Q4 2026 → Q1 2027)
**Timeline:** Weeks 17-48 (Phase 2 continuation)

---

## SPRINT OVERVIEW

| Phase | Sprints | Weeks | Focus | Tickets |
|-------|---------|-------|-------|---------|
| **2.1** | 1-8 | 17-32 | Production infrastructure (P0) | DEV-015–035 |
| **2.2** | 9-10 | 33-40 | Launch prep + beta testing | DEV-036–045 |
| **2.3** | 11-16 | 41-48 | Post-launch + Phase 3 planning | DEV-046–060 |

---

## PHASE 2.1: PRODUCTION INFRASTRUCTURE (WEEKS 17-32, SPRINTS 1-8)

### SPRINT 1-2: Database Migration (Weeks 17-20)

#### DEV-015: PostgreSQL Connection Setup
**Story:** As a backend engineer, I want to configure TypeORM to connect to Cloud SQL PostgreSQL so that all data persists in production database

**Estimation:** 12 hours  
**Acceptance Criteria:**
- [ ] TypeORM configuration file (database.config.ts) complete
- [ ] Cloud SQL connection pooling: 20 connections
- [ ] Connection string via environment variable (secrets)
- [ ] Test: Connection pool tested with 10 concurrent connections
- [ ] Fallback: If Cloud SQL unavailable, log and retry

**Implementation Details:**
```typescript
// src/config/database.config.ts
TypeOrmModuleOptions: {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Tenant, User, ChartOfAccount, JournalEntry, ...],
  synchronize: false, // Use migrations only
  migrations: ['src/database/migrations/*.ts'],
  migrationsRun: true, // Auto-run on startup
  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  }
}
```

---

#### DEV-016: Database Schema & Migrations
**Story:** As a DBA, I want all database schemas to be version-controlled via TypeORM migrations so that we can audit changes and rollback if needed

**Estimation:** 20 hours  
**Acceptance Criteria:**
- [ ] Migration 001_init.ts: Create all tables (tenants, users, chart_of_accounts, journal_entries, invoices, bills, items, stock_movements, approvals, audit_logs, customers, vendors, email_logs)
- [ ] Migration 002_extensions.ts: Add indexes, triggers, constraints
- [ ] Each migration is reversible (down() method)
- [ ] Test: Fresh database created from migrations matches prod schema
- [ ] Performance: Migration completes <5 min on test DB

**Key Indexes:**
```sql
CREATE INDEX idx_journal_entries_tenant_date ON journal_entries(tenant_id, entry_date);
CREATE INDEX idx_invoices_tenant_status ON invoices(tenant_id, status);
CREATE INDEX idx_bills_tenant_approval ON bills(tenant_id, approval_status);
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id, created_at DESC);
```

---

#### DEV-017: JSON to PostgreSQL Data Migration
**Story:** As a data engineer, I want to import existing JSON data to PostgreSQL while preserving all data integrity so that we can seamlessly transition from file storage to database

**Estimation:** 24 hours  
**Acceptance Criteria:**
- [ ] Migrate tenants, users, accounts, journal entries, invoices, bills, items to Postgres
- [ ] Preserve all IDs and timestamps
- [ ] Validation: Trial balance matches before/after migration
- [ ] Rollback: JSON backup kept for 30 days
- [ ] Test: Run migration on staging first, verify with smoke tests
- [ ] Performance: Migration <30 min for 100k records

**Algorithm:**
```typescript
async migrateJsonToPostgres() {
  const jsonData = loadJsonData('./data/persistence.json');
  
  for (const tenant of jsonData.tenants) {
    // 1. Insert tenant
    // 2. Insert related users
    // 3. Insert COA accounts
    // 4. Insert journal entries + lines
    // 5. Insert invoices + line items + payments
    // 6. Insert bills + approvals
    // 7. Validate GL balance for this tenant
  }
  
  return { migrated: X, errors: [] };
}
```

---

#### DEV-018: GL Balance Validation Test Suite
**Story:** As a QA engineer, I want automated tests to verify GL balances before/after migration so that we have confidence in data integrity

**Estimation:** 16 hours  
**Acceptance Criteria:**
- [ ] Test: For each tenant, trial balance before = after migration
- [ ] Test: All GL account balances match (debit sum, credit sum)
- [ ] Test: Invoice GL postings correct (AR, revenue, tax)
- [ ] Test: Bill GL postings correct (expense, payable, PPh)
- [ ] Test: Stock GL postings correct (inventory asset, COGS)
- [ ] Report: Summary of any mismatches with remediation

**Test Coverage:**
```typescript
describe('GL Balance Validation', () => {
  it('Trial balance before = after migration', async () => {
    const beforeTb = await getTb JournalEntriesbefore Migration();
    await migrateJsonToPostgres();
    const afterTb = await getTrialBalance();
    expect(afterTb.totalDebit).toBe(beforeTb.totalDebit);
    expect(afterTb.totalCredit).toBe(beforeTb.totalCredit);
  });
  
  it('All GL account balances match', async () => {
    // Test each account separately
  });
});
```

---

### SPRINT 3-4: Real Email & Bull Queue (Weeks 21-24)

#### DEV-019: Gmail API Setup & Nodemailer Integration
**Story:** As a backend engineer, I want to integrate Gmail API + Nodemailer so that emails are actually delivered to customers instead of just logged

**Estimation:** 16 hours  
**Acceptance Criteria:**
- [ ] Gmail service account configured (gcloud CLI)
- [ ] Nodemailer transporter created with SMTP config
- [ ] Environment variables: GMAIL_SERVICE_ACCOUNT_EMAIL, GMAIL_PRIVATE_KEY
- [ ] Test: Send test email successfully to test account
- [ ] Error handling: Retry on SMTP failure, log to database
- [ ] Delivery tracking: Email log table records all sends/failures

**Implementation:**
```typescript
// src/email/email.service.ts
async sendEmailRealGmail(template: EmailTemplate, recipient: string) {
  const result = await this.transporter.sendMail({
    from: 'noreply@dnaccounting.id',
    to: recipient,
    subject: template.subject,
    html: template.body,
    attachments: template.attachments || [],
  });
  
  // Log success
  await this.emailLogService.save({
    recipient,
    template: template.type,
    status: 'sent',
    messageId: result.messageId,
    sentAt: new Date(),
  });
}
```

---

#### DEV-020: Email Template System (Handlebars)
**Story:** As a product manager, I want all email templates to be maintainable and consistent so that customers receive professional, branded emails

**Estimation:** 12 hours  
**Acceptance Criteria:**
- [ ] Templates: Invoice sent, bill approval request, overdue reminder, scheduled report, user invitation, password reset
- [ ] Handlebars templating: Variables like {{invoice_number}}, {{amount_formatted}}
- [ ] Attachments: PDF invoices + reports embedded
- [ ] Branding: dnFinance logo, colors, footer
- [ ] Testing: Email preview page (dev only)
- [ ] i18n: Template support for Indonesian/English (Phase 3)

**Templates:**
```typescript
// src/email/templates.ts
export const TEMPLATES = {
  INVOICE_SENT: {
    subject: 'Invoice {{invoice_number}} from {{company_name}}',
    body: `...`, // HTML + Handlebars
    attachments: ['invoice.pdf'],
  },
  BILL_APPROVAL: {
    subject: 'Action Required: Approve Bill {{bill_number}}',
    body: `...`,
    attachments: [],
  },
  // ... others
};
```

---

#### DEV-021: Bull Queue Setup & Email Job Worker
**Story:** As a backend engineer, I want email sending to be asynchronous so that API requests don't wait for email delivery

**Estimation:** 14 hours  
**Acceptance Criteria:**
- [ ] Bull queue configured with Redis
- [ ] Email job type defined: { template, recipient, tenantId }
- [ ] Worker process: dequeue, send via Nodemailer, log result
- [ ] Retry logic: Max 3x with 5/15/60 min intervals
- [ ] Monitoring: Queue depth logged, alert if >1000 pending jobs
- [ ] Scaling: Multiple workers possible (configure via env)
- [ ] Test: Job successfully processed and email sent

**Implementation:**
```typescript
// src/queues/email.queue.ts
export const emailQueue = new Bull('email', {
  redis: { host: REDIS_HOST, port: REDIS_PORT },
});

emailQueue.process(async (job) => {
  const { template, recipient } = job.data;
  await this.emailService.sendEmailRealGmail(template, recipient);
  return { success: true, messageId: '...' };
});

emailQueue.on('failed', async (job, err) => {
  console.error(`Email job ${job.id} failed:`, err.message);
  // Retry up to 3x automatically
});

// Enqueue email (don't wait)
async queueEmail(template: EmailTemplate, recipient: string) {
  await emailQueue.add(
    { template, recipient },
    { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
  );
}
```

---

#### DEV-022: Scheduled Jobs (Cron) with Bull Repeat
**Story:** As a platform engineer, I want scheduled reports and overdue reminders to automatically run at specified times so that customers don't have to manually trigger them

**Estimation:** 12 hours  
**Acceptance Criteria:**
- [ ] Bull job repeat syntax: `{ pattern: '0 8 * * *' }` (8 AM daily)
- [ ] Job types: scheduledReportEmail, arAgingReminder, apPaymentDueNotification
- [ ] Timezone-aware: Respect tenant timezone (default: Asia/Jakarta)
- [ ] Monitoring: Scheduled job runs logged, alert if job fails
- [ ] Testing: Simulate time advance to test job execution
- [ ] Flexibility: Admin can disable/reschedule jobs

**Implementation:**
```typescript
// src/queues/scheduled.queue.ts
// Run daily at 8 AM (Asia/Jakarta)
await scheduledReportQueue.add(
  { tenantId, reportType: 'balance_sheet' },
  {
    repeat: {
      pattern: '0 8 * * *', // Daily 8 AM
      tz: 'Asia/Jakarta',
    },
  }
);
```

---

### SPRINT 5-6: Staging Deployment & CI/CD (Weeks 25-28)

#### DEV-023: Cloud Run Staging Setup (Terraform + GitHub Actions)
**Story:** As a DevOps engineer, I want automated staging deployments so that every PR is testable before merge

**Estimation:** 16 hours  
**Acceptance Criteria:**
- [ ] Terraform: Cloud Run service, Cloud SQL instance, Redis instance (staging)
- [ ] GitHub Actions: Deploy on PR branch push
- [ ] Staging URL: https://staging-pr-123.dnaccounting.app (auto-generated)
- [ ] Database: Fresh DB seeded with demo data
- [ ] Email: Redirected to staging email (not real customers)
- [ ] Logs: Forwarded to Datadog
- [ ] Cleanup: Staging instance destroyed after 24h (optional)

**Workflow:**
```yaml
# .github/workflows/deploy-staging.yml
- Build Docker image
- Push to GCR
- Deploy to Cloud Run staging
- Run smoke tests
- Post PR comment with staging link
```

---

#### DEV-024: Production Blue-Green Deployment
**Story:** As a DevOps engineer, I want zero-downtime deployments so that customers experience no service interruption during releases

**Estimation:** 12 hours  
**Acceptance Criteria:**
- [ ] Blue-green setup: Two Cloud Run instances (green = current, blue = new)
- [ ] Deploy to blue, run smoke tests
- [ ] If tests pass: Switch traffic green → blue
- [ ] If tests fail: Destroy blue, keep green, alert on-call
- [ ] Auto-rollback: If 5xx error rate >5% in first hour
- [ ] Traffic split: Gradual rollout possible (10% → 50% → 100%)

---

#### DEV-025: Smoke Test Suite (Automated Post-Deployment)
**Story:** As a QA engineer, I want automated smoke tests after each deployment so that we catch breaking changes before they reach customers

**Estimation:** 10 hours  
**Acceptance Criteria:**
- [ ] Test: Register new tenant → login → create invoice → GL posting → generate report
- [ ] Test: Invoice creation, GL posting, invoice aging
- [ ] Test: Bill approval workflow (2 levels)
- [ ] Test: Stock in/out, inventory valuation report
- [ ] Test: Customer/vendor master CRUD
- [ ] Timeframe: All tests complete <2 min
- [ ] Failure: Post alert to Slack, block production deployment

**Test Code:**
```typescript
// tests/smoke.test.ts
describe('Smoke Tests', () => {
  it('Complete invoice workflow', async () => {
    const tenant = await registerTenant();
    await login(tenant.email, tenant.password);
    const invoice = await createInvoice({ amount: 1000000 });
    const glEntry = await queryGl(invoice.ar_account_id);
    expect(glEntry.balance).toBe(1000000);
  });
});
```

---

### SPRINT 7-8: Monitoring & Integration Tests (Weeks 29-32)

#### DEV-026: Winston Structured Logging
**Story:** As an operations engineer, I want structured logs so that errors can be debugged and monitored via Datadog

**Estimation:** 8 hours  
**Acceptance Criteria:**
- [ ] Winston logger configured (console + file)
- [ ] JSON format: { timestamp, level, message, context, tenant_id, user_id, requestId }
- [ ] Log levels: debug, info, warn, error
- [ ] Test: All error paths logged with context
- [ ] Example: GL posting → log debit_total, credit_total, status

---

#### DEV-027: Datadog Integration (APM + Error Tracking)
**Story:** As a platform engineer, I want full visibility into application performance so that we can identify and fix bottlenecks

**Estimation:** 12 hours  
**Acceptance Criteria:**
- [ ] Datadog API key configured
- [ ] Custom metrics: Request latency, error rate, queue depth
- [ ] Traces: Full request flow (API → Service → DB)
- [ ] Logs: Forwarded from Winston
- [ ] Alerts: 5xx >1%, latency p95 >1s, queue >1000
- [ ] Dashboard: Real-time monitoring of key metrics

---

#### DEV-028–032: Integration Test Suite (50+ Tests)
**Story:** As a QA engineer, I want comprehensive integration tests so that the entire product is verified before launch

**Estimation:** 40 hours (5 tickets × 8 hours each)

**Test Categories:**

**DEV-028: Auth + Multi-Tenant Tests (8 tests)**
- Register tenant → auto-create default COA
- Login with credentials
- Tenant A data invisible to Tenant B
- User creation + RBAC (admin vs accountant vs manager vs viewer)
- Session expiry + refresh token
- Password reset flow

**DEV-029: GL + Journal Tests (12 tests)**
- Create COA from template
- Post journal entry (single + multi-line)
- GL account balance updates
- Trial balance always balances
- GL posting 100x concurrently (atomicity)
- Recurring journal entry auto-posts
- Approval workflow: draft → pending → approved → posted

**DEV-030: AR Workflow Tests (10 tests)**
- Create invoice (with PPN calculation)
- Send invoice email → email queued
- Record payment (full + partial)
- AR aging: 0-30d, 30-60d, 60+ buckets
- Overdue invoice marked
- Aging email triggered
- AR GL postings correct

**DEV-031: AP Workflow Tests (10 tests)**
- Create bill (with PPh 23)
- Multi-level approval (2–3 approvers)
- Approval email sent
- Payment scheduled
- AP GL postings correct
- AP aging calculation
- PPh 23 withholding correct

**DEV-032: Inventory + Reports Tests (10 tests)**
- Stock in → inventory asset GL
- Stock out → COGS GL
- Inventory valuation report matches GL
- Low-stock alert triggered
- P&L: revenue - COGS - expenses = net income
- Balance sheet: assets = liabilities + equity
- Trial balance: debit = credit

**Test Framework:**
- Jest + database fixtures (fresh DB per test)
- Fixtures: Pre-populated demo data (tenants, COA, invoices, etc.)
- Parallelization: Run 4 tests concurrently (CI optimization)
- Coverage: Target >80%

---

## PHASE 2.2: LAUNCH PREP (WEEKS 33-40, SPRINTS 9-10)

### SPRINT 9: P1 Features (Weeks 33-36)

#### DEV-033: Journal Entry Approval Workflow
**Story:** As an accountant, I want to require approval for manual journal entries so that GL posting is controlled

**Estimation:** 12 hours  
**Acceptance Criteria:**
- [ ] Admin config: Enable/disable approval for manual JE
- [ ] Approval levels: 1–3 sequential
- [ ] Email: Approval request with bill details
- [ ] Workflow: Draft → pending → approved → posted
- [ ] GL posting only after all approvals

---

#### DEV-034: Email Approval Deep Links (24h JWT Tokens)
**Story:** As an approver, I want to approve bills by clicking a link in email without logging in so that workflow is frictionless

**Estimation:** 10 hours  
**Acceptance Criteria:**
- [ ] Token: JWT { approval_id, approver_id, exp: NOW + 24h }
- [ ] Endpoint: `GET /approvals/:token/approve?decision=approved`
- [ ] One-time use: Token deleted after approval
- [ ] UX: Link opens: "Approve Bill INV-001 for Rp 1M?" [Approve] [Reject]
- [ ] Fallback: Expired token → prompt login

---

#### DEV-035: Scheduled Report Email + Cron Jobs
**Story:** As a business owner, I want daily P&L emailed automatically so that I don't have to manually check

**Estimation:** 12 hours  
**Acceptance Criteria:**
- [ ] UI: Report → "Schedule email" → frequency/recipients
- [ ] Cron: Bull repeat job (daily 8 AM, timezone-aware)
- [ ] Email: P&L table + PDF attachment
- [ ] Admin: Can view/cancel scheduled reports
- [ ] Test: Job runs at scheduled time, email delivered

---

### SPRINT 10: Beta Testing & Security (Weeks 37-40)

#### DEV-036: Beta Testing Program
**Story:** As a product manager, I want to collect feedback from 50 real SME users so that we can iterate before GA launch

**Acceptance Criteria:**
- [ ] Recruit 50 SME beta testers (across 5 industries: retail, F&B, jasa, trading, manufac)
- [ ] Demo + onboarding session with each group
- [ ] NPS survey weekly
- [ ] Bug tracking: Jira board for beta bugs
- [ ] Feedback synthesis: Top 10 feature requests, top 10 bugs
- [ ] Iteration: Fix P0 bugs daily, P1 bugs within 48h

---

#### DEV-037: Security Audit (OWASP Top 10)
**Story:** As a security engineer, I want a professional security audit so that we comply with banking/financial standards

**Estimation:** 20 hours (external vendor)  
**Acceptance Criteria:**
- [ ] Penetration test (cross-site scripting, SQL injection, etc.)
- [ ] Code review (OWASP Top 10 checklist)
- [ ] Password policy: Bcrypt 12 rounds, enforce strong passwords
- [ ] TLS 1.3 enforced on all APIs
- [ ] Rate limiting: 100 req/min per IP
- [ ] Report: Audit results + remediation plan

---

#### DEV-038–040: Fix Top 20 Beta Bugs
**Story:** As a QA engineer, I want all critical bugs fixed before GA launch

**Estimation:** 24 hours (3 tickets × 8 hours)  
**Acceptance Criteria:**
- [ ] P0 bugs: 100% fixed (crashes, data loss, GL imbalance)
- [ ] P1 bugs: 90% fixed (UI glitches, slow pages, email failures)
- [ ] Regression test: No new bugs introduced by fixes
- [ ] Deployment: All fixes in staging first, then prod

---

## PHASE 2.3: POST-LAUNCH (WEEKS 41-48, SPRITS 11-16)

### SPRINT 11-12: Post-Launch Monitoring & Iteration

#### DEV-041: Production Monitoring Dashboard
**Story:** As an on-call engineer, I want real-time visibility into production so that I can respond to incidents quickly

**Acceptance Criteria:**
- [ ] Dashboard: Request latency, error rate, queue depth, DB CPU
- [ ] Alerts: 5xx >1%, latency spike, queue backlog
- [ ] Incident response: Runbook for common issues (DB connection pool, queue stuck, etc.)

---

#### DEV-042–045: Fix Post-Launch Bugs
**Story:** As a product team, I want to fix bugs reported by production users

**Estimation:** 32 hours (4 tickets × 8 hours)  
**Acceptance Criteria:**
- [ ] P0 bugs: <1h response, <24h fix
- [ ] P1 bugs: <4h response, <48h fix
- [ ] Root cause analysis for each bug
- [ ] Monitoring: Alert if same bug happens again

---

### SPRINT 13–16: Phase 3 Planning & Long-term Roadmap

#### DEV-046–060: Deferred Features (Roadmap Q2 2027)
- **OCR Invoice:** Photo/scan → auto-extract vendor, amount
- **Bank Sync:** OKE file → auto-reconcile GL
- **Mobile App:** React Native or PWA
- **POS Integration:** Kidzania, NCR systems
- **Multi-Currency:** Support USD, SGD
- **Advanced Inventory:** FIFO/FEFO costing, lot tracking

---

## DEFINITION OF DONE (Updated)

For P2 tickets:
- [ ] Code reviewed (2 approvals for infrastructure, 1 for features)
- [ ] Unit + integration tests passing (>80% coverage)
- [ ] Tested on staging environment
- [ ] Database migrations reversible
- [ ] No secrets in code (use env vars)
- [ ] Linter + Prettier passing
- [ ] Datadog monitored (if applicable)
- [ ] Documented in API docs / user guide
- [ ] Deployed to production (if applicable)
- [ ] QA sign-off

---

## TESTING STRATEGY (Phase 2)

### Test Levels
| Level | Count | Tool | Target |
|-------|-------|------|--------|
| Unit Tests | 50+ | Jest | >80% coverage |
| Integration Tests | 50+ | Jest + DB fixtures | End-to-end workflows |
| E2E Tests | 20+ | Puppeteer/Playwright | Critical paths |
| Load Tests | 3 | k6 | 100 concurrent users, 2h soak |
| Security Tests | OWASP | External vendor | Top 10 vulnerabilities |

### Regression Testing
- Before each prod deployment: Run full test suite (~30 min)
- After each prod deployment: Smoke tests + monitoring (~5 min)
- Weekly: Load test on staging

---

## DEPLOYMENT CHECKLIST (Week 40, Pre-Launch)

### Infrastructure
- [ ] PostgreSQL 15 (prod): HA + backups + read replicas
- [ ] Redis (prod): Managed Memorystore, cluster mode
- [ ] Cloud Run (prod): 3+ instances, auto-scaling 2–50 instances
- [ ] Cloudflare: DDoS protection, CDN caching, DNS
- [ ] Backups: Hourly DB snapshots, 30-day retention

### Software
- [ ] All tests passing (unit + integration + load)
- [ ] Code coverage >80%
- [ ] Security audit passed (no P0/P1 vulnerabilities)
- [ ] Performance targets met (P95 <500ms)
- [ ] API docs complete (Swagger)
- [ ] User guide + admin guide published

### Processes
- [ ] On-call rotation established
- [ ] Incident response runbooks ready
- [ ] Support email/Slack monitoring
- [ ] NPS survey setup
- [ ] Monitoring dashboards live (Datadog)
- [ ] Alert thresholds configured

---

**END OF SRS V2**

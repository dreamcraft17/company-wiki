# dnAccounting System Design Document (SDD) — Phase 2
**Version:** 2.0  
**Date:** August 2026  
**Author:** Dozer Fernando Saroha Daniel Napitupulu  
**Baseline:** MVP V1.0 (in-memory store + JSON persistence)

---

## 1. OVERVIEW: FROM MVP TO PRODUCTION

### Current State (MVP V1.0)
```
API Layer:        NestJS (routes, services, guards)
Persistence:      JSON file (./data/persistence.json)
Email:            Simulated (emailLog[] array)
Async:            Sync (no queue)
Cache:            None
Staging:          None
CI/CD:            Basic (linter + tests only)
```

### Phase 2 Target (Production V2.0)
```
API Layer:        NestJS (no change)
Persistence:      PostgreSQL 15 + Cloud SQL
Email:            Real Gmail API + Nodemailer
Async:            Bull queue + Redis
Cache:            Redis (GL balance, sessions, reports)
Staging:          Cloud Run + separate Cloud SQL
CI/CD:            GitHub Actions → staging → prod (blue-green)
Monitoring:       Winston + Datadog (APM + error tracking)
```

---

## 2. DATA MIGRATION STRATEGY (JSON → PostgreSQL)

### Current Data Structure (JSON)
```json
{
  "tenants": [
    { "id": "uuid-1", "company_name": "PT Acme", "tier": "growth", ... }
  ],
  "journal_entries": [
    { "id": "uuid-2", "tenant_id": "uuid-1", "entry_date": "2026-01-15", ... }
  ],
  "invoices": [...],
  "bills": [...],
  ...
}
```

### Migration Steps

#### Step 1: Backup (Week 17, Day 1)
```bash
# Export JSON to backup file
cp data/persistence.json backups/persistence_2026-08-15.json

# Backup size: ~50MB per 10k tenants (OK for MVP scale)
```

#### Step 2: TypeORM Migration Setup
```typescript
// Already designed in SDD V1 §4
// Entities: Tenant, User, ChartOfAccount, JournalEntry, Invoice, etc.
// Migrations: 
//   001_init.ts → Create all tables
//   002_extensions.ts → Indexes + triggers
//   003_add_departments.ts → Add department column to GL (P1 feature)
```

#### Step 3: Data Import Logic
```typescript
// src/database/migrate.service.ts
async importJsonToPostgres() {
  const jsonData = JSON.parse(fs.readFileSync('./data/persistence.json'));
  
  for (const tenant of jsonData.tenants) {
    await this.tenantRepository.insert(tenant);
    
    // Import related data
    for (const user of jsonData.users.filter(u => u.tenant_id === tenant.id)) {
      await this.userRepository.insert(user);
    }
    
    for (const account of jsonData.chart_of_accounts.filter(a => a.tenant_id === tenant.id)) {
      await this.chartOfAccountRepository.insert(account);
    }
    
    // Continue for all entities...
  }
  
  // Validation: Check GL balances match
  await this.validateGlBalances();
}
```

#### Step 4: Validation Script
```typescript
// Verify trial balance before/after migration
async validateGlBalances() {
  const tenants = await this.tenantRepository.find();
  
  for (const tenant of tenants) {
    const trialBalance = await this.reportService.getTrialBalance(tenant.id);
    
    const totalDebit = trialBalance.accounts
      .reduce((sum, acc) => sum + acc.debit_balance, 0);
    const totalCredit = trialBalance.accounts
      .reduce((sum, acc) => sum + acc.credit_balance, 0);
    
    if (totalDebit !== totalCredit) {
      throw new Error(`Trial balance mismatch for tenant ${tenant.id}`);
    }
  }
}
```

#### Step 5: Rollback Plan
```bash
# If migration fails:
# 1. Restore database to pre-migration state
# 2. Keep JSON file backup for 30 days
# 3. Use backup to re-run migration

# Rollback command:
gcloud sql backups restore BACKUP_ID --backup-instance=dnaccounting-prod
```

---

## 3. POSTGRES 15 + CLOUD SQL ARCHITECTURE

### Connection Architecture
```
NestJS App (3 instances)
    ↓ (TypeORM + pg driver)
Google Cloud Load Balancer
    ↓
Cloud SQL Proxy (local sidecar)
    ↓
Cloud SQL PostgreSQL 15 (managed)
    ├─ Primary (read/write)
    ├─ Replica 1 (read-only, for reports)
    └─ Replica 2 (read-only, failover)
```

### Connection Pooling
```typescript
// src/database/database.module.ts
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST, // Cloud SQL Proxy: 127.0.0.1
  port: 5432,
  username: process.env.DB_USER, // service account
  password: process.env.DB_PASSWORD, // from GITHUB_SECRETS
  database: process.env.DB_NAME,
  entities: ['src/**/*.entity.ts'],
  synchronize: false, // Use migrations only
  migrations: ['src/database/migrations/*.ts'],
  migrationsRun: true, // Auto-run on startup
  
  // Connection pooling
  extra: {
    max: 20, // Max pool connections
    idleTimeoutMillis: 30000, // Close idle after 30s
    connectionTimeoutMillis: 5000, // Timeout if cannot connect
  },
});
```

### Cloud SQL Setup
```bash
# Create Cloud SQL instance (staging)
gcloud sql instances create dnaccounting-staging \
  --database-version POSTGRES_15 \
  --tier db-f1-micro \
  --region us-central1 \
  --backup-start-time 03:00 \
  --enable-bin-log

# Create production instance (larger)
gcloud sql instances create dnaccounting-prod \
  --database-version POSTGRES_15 \
  --tier db-n1-standard-2 \
  --region us-central1 \
  --backup-start-time 02:00 \
  --enable-bin-log \
  --high-availability

# Create database
gcloud sql databases create dnaccounting --instance dnaccounting-prod
gcloud sql users create app_user --instance dnaccounting-prod --password=<random>

# Enable Cloud SQL Auth proxy
gcloud compute ssh INSTANCE --zone=ZONE -- \
  cloud_sql_proxy -instances=PROJECT:REGION:INSTANCE=tcp:5432
```

---

## 4. REAL EMAIL ARCHITECTURE (Gmail API)

### Gmail Setup
```bash
# 1. Enable Gmail API in GCP Console
# 2. Create service account:
#    - Project: dnaccounting
#    - Role: Google Workspace Domain Administrator (for delegated auth)
# 3. Download JSON key (KEEP SECURE)
# 4. Add to .env / GitHub Secrets

GMAIL_SERVICE_ACCOUNT_EMAIL=dnaccounting@PROJECT.iam.gserviceaccount.com
GMAIL_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...
GMAIL_DELEGATED_USER=noreply@dnaccounting.id  # G Workspace account
```

### Email Service Architecture
```typescript
// src/email/email.service.ts
@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  
  constructor(
    private emailQueue: EmailQueue,
    private emailLogService: EmailLogService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // TLS
      auth: {
        user: process.env.GMAIL_DELEGATED_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Use app-specific password
      },
    });
  }
  
  async sendEmail(template: EmailTemplate, recipient: string): Promise<void> {
    // Queue email (don't wait)
    await this.emailQueue.add('send-email', { template, recipient });
  }
  
  async sendEmailSync(template: EmailTemplate, recipient: string): Promise<void> {
    const html = this.renderTemplate(template);
    const pdf = template.attachments?.pdf ? 
      await this.generatePdf(template.attachments.pdf) : null;
    
    try {
      const result = await this.transporter.sendMail({
        from: `dnAccounting <${process.env.GMAIL_FROM_EMAIL}>`,
        to: recipient,
        subject: template.subject,
        html: html,
        attachments: pdf ? [{ filename: 'attachment.pdf', content: pdf }] : [],
      });
      
      // Log successful send
      await this.emailLogService.log({
        recipient,
        template: template.type,
        status: 'sent',
        messageId: result.messageId,
        timestamp: new Date(),
      });
    } catch (error) {
      // Log failure → retry via queue
      await this.emailLogService.log({
        recipient,
        template: template.type,
        status: 'failed',
        error: error.message,
        timestamp: new Date(),
      });
      throw error;
    }
  }
  
  private renderTemplate(template: EmailTemplate): string {
    // Use Handlebars or EJS to render HTML email
    const handlebars = require('handlebars');
    const compiledTemplate = handlebars.compile(template.body);
    return compiledTemplate(template.variables);
  }
  
  private async generatePdf(data: any): Promise<Buffer> {
    // Use html2pdf or similar to generate PDF attachment
  }
}
```

### Email Templates (TypeScript + Handlebars)
```typescript
// src/email/templates/
export const INVOICE_SENT = {
  type: 'invoice_sent',
  subject: 'Invoice {{invoice_number}} from {{company_name}}',
  body: `
    <h2>Invoice #{{invoice_number}}</h2>
    <p>Dear {{customer_name}},</p>
    <p>Thank you for your business. Please find your invoice attached.</p>
    <table>
      <tr>
        <td>Invoice Date:</td>
        <td>{{invoice_date}}</td>
      </tr>
      <tr>
        <td>Due Date:</td>
        <td>{{due_date}}</td>
      </tr>
      <tr>
        <td>Amount:</td>
        <td>Rp {{amount_formatted}}</td>
      </tr>
    </table>
    <p><a href="{{payment_link}}">Pay Now</a></p>
  `,
  attachments: { pdf: true },
};

export const BILL_APPROVAL_REQUEST = {
  type: 'bill_approval_request',
  subject: 'Action Required: Approve Bill {{bill_number}}',
  body: `
    <h2>Bill Approval Needed</h2>
    <p>Hi {{approver_name}},</p>
    <p>{{creator_name}} has submitted bill {{bill_number}} for Rp {{amount_formatted}} for your approval.</p>
    <p>
      <a href="{{approval_link}}?decision=approved" style="background: green; color: white; padding: 10px;">
        Approve
      </a>
      <a href="{{approval_link}}?decision=rejected" style="background: red; color: white; padding: 10px;">
        Reject
      </a>
    </p>
  `,
  attachments: { pdf: false },
};

export const OVERDUE_REMINDER = {
  type: 'overdue_reminder',
  subject: 'Payment Reminder: Invoice {{invoice_number}} is {{days_overdue}} days overdue',
  body: `
    <p>Dear {{customer_name}},</p>
    <p>We noticed that invoice {{invoice_number}} for Rp {{amount_formatted}} is {{days_overdue}} days overdue.</p>
    <p>Please pay as soon as possible to avoid late fees.</p>
  `,
  attachments: { pdf: true },
};
```

### Email Queue (Bull + Redis)
```typescript
// src/queues/email.queue.ts
import Bull from 'bull';

export const emailQueue = new Bull('email', {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

// Process jobs
emailQueue.process(async (job) => {
  const { template, recipient } = job.data;
  await this.emailService.sendEmailSync(template, recipient);
});

// Error handling
emailQueue.on('failed', async (job, err) => {
  console.error(`Email job ${job.id} failed:`, err);
  // Retry up to 3x with exponential backoff
});
```

---

## 5. BULL QUEUE JOBS (Async Processing)

### Job Types & Schedule

#### 1. sendEmail (On-Demand)
```typescript
// Triggered by: invoice sent, bill approval requested, etc.
Job: { template, recipient, tenantId }
Retry: 3x (5min, 15min, 60min intervals)
Timeout: 30s
Success: Log to email_logs table
Failed: Log error → admin dashboard alert
```

#### 2. generateReportPdf (On-Demand)
```typescript
// Triggered by: User downloads report, or scheduled job
Job: { report_type, tenant_id, date_range, recipient_email }
Timeout: 60s (large reports may take time)
Output: PDF file → Cloud Storage signed URL
```

#### 3. scheduledReportEmail (Cron)
```typescript
// Daily 8 AM (timezone-aware)
Bull Repeat: { pattern: '0 8 * * *' }
Job: { tenant_id, report_type, frequency }
Action: Generate PDF → send email
```

#### 4. arAgingReminder (Cron)
```typescript
// Daily 6 AM
Job: Check invoices where due_date < today - 0 days
Action: Email customer: "Invoice INV-001 due today"
Filter: Only if invoice.status NOT 'paid'
```

#### 5. apPaymentDueNotification (Cron)
```typescript
// Daily 9 AM
Job: Check bills where due_date < today + 3 days
Action: Email approver: "Bill BILL-001 due in 3 days. Schedule payment."
```

---

## 6. REDIS CACHING LAYER

### Cache Keys & TTL

```typescript
// GL Balance (invalidate on posting)
gl_balance:${tenantId}:${accountId} = DECIMAL
TTL: 5 min
Invalidate trigger: AccountService.postGl()

// Trial Balance (invalidate on GL posting)
trial_balance:${tenantId}:${asOfDate} = JSON { accounts: [...], debit, credit }
TTL: 5 min

// Report Cache (invalidate on GL posting)
report_cache:${tenantId}:${reportType}:${dateRange} = JSON
TTL: 5 min (P&L, BS, CF, tax summary)

// Session (user login)
session:${sessionId} = JSON { user_id, tenant_id, role }
TTL: 24 hours

// Rate limit (per IP)
rate_limit:${ip} = { count: 0, reset_at: timestamp }
TTL: 60 seconds
```

### Implementation

```typescript
// src/services/accounting.service.ts
async getGlBalance(tenantId: UUID, accountId: UUID): Promise<DECIMAL> {
  const cacheKey = `gl_balance:${tenantId}:${accountId}`;
  
  // Try cache first
  const cached = await this.redisService.get(cacheKey);
  if (cached) return parseDecimal(cached);
  
  // Cache miss: query database
  const balance = await this.getGlBalanceFromDb(tenantId, accountId);
  
  // Store in cache (5 min TTL)
  await this.redisService.setEx(cacheKey, 300, balance.toString());
  
  return balance;
}

async postGl(tenantId: UUID, journalEntryId: UUID): Promise<void> {
  // ... GL posting logic ...
  
  // Invalidate caches
  const affectedAccounts = await this.getAffectedAccounts(journalEntryId);
  for (const accountId of affectedAccounts) {
    const cacheKey = `gl_balance:${tenantId}:${accountId}`;
    await this.redisService.del(cacheKey);
  }
  
  // Invalidate report caches
  await this.redisService.del(`trial_balance:${tenantId}:*`);
  await this.redisService.del(`report_cache:${tenantId}:*`);
}
```

---

## 7. STAGING ENVIRONMENT (Cloud Run + Cloud SQL)

### Infrastructure as Code (Terraform)

```hcl
# infrastructure/staging.tf
resource "google_cloud_run_service" "staging" {
  name     = "dnaccounting-staging"
  location = "us-central1"
  
  template {
    spec {
      containers {
        image = "gcr.io/PROJECT/dnaccounting:${var.image_tag}"
        env {
          name  = "DATABASE_URL"
          value = "postgresql://${google_sql_database_instance.staging.connection_name}"
        }
        env {
          name  = "REDIS_URL"
          value = google_redis_instance.staging.host
        }
      }
    }
  }
}

resource "google_sql_database_instance" "staging" {
  name             = "dnaccounting-staging"
  database_version = "POSTGRES_15"
  region           = "us-central1"
  
  settings {
    tier = "db-f1-micro"
    backup_configuration {
      enabled = true
    }
  }
}

resource "google_redis_instance" "staging" {
  name           = "dnaccounting-staging"
  tier           = "basic"
  memory_size_gb = 1
  region         = "us-central1"
}
```

### Staging Deployment Flow

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging
on:
  push:
    branches: [develop, feature/*]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Tests
        run: npm run test
        
      - name: Build Docker Image
        run: docker build -t gcr.io/PROJECT/dnaccounting:${{ github.sha }} .
        
      - name: Push to GCR
        run: docker push gcr.io/PROJECT/dnaccounting:${{ github.sha }}
      
      - name: Deploy to Cloud Run (Staging)
        run: |
          gcloud run deploy dnaccounting-staging \
            --image gcr.io/PROJECT/dnaccounting:${{ github.sha }} \
            --region us-central1 \
            --set-env-vars DATABASE_URL=${{ secrets.STAGING_DATABASE_URL }}
      
      - name: Run Smoke Tests
        run: npm run test:smoke -- --url https://staging.dnaccounting.app
      
      - name: Post PR Comment
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ Deployed to staging: https://staging.dnaccounting.app'
            })
```

---

## 8. CI/CD PIPELINE (GitHub Actions → Production)

### Blue-Green Deployment

```yaml
# .github/workflows/deploy-prod.yml
name: Deploy to Production
on:
  workflow_dispatch: # Manual trigger
    inputs:
      version:
        description: 'Version to deploy'
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Require Approvals
        run: |
          # Check: PR has 2+ approvals
          # Enforce: Merge to main only with 2 reviews
      
      - name: Deploy Blue-Green
        run: |
          # 1. Current traffic → green instance
          # 2. Deploy new code to blue instance
          # 3. Run smoke tests on blue
          # 4. If tests pass: switch traffic green → blue
          # 5. If tests fail: keep green, destroy blue
          
          gcloud run deploy dnaccounting-blue \
            --image gcr.io/PROJECT/dnaccounting:${{ github.event.inputs.version }}
          
          # Smoke tests
          npm run test:smoke -- --url https://blue.dnaccounting.app
          
          # Traffic switch
          gcloud run services update-traffic dnaccounting \
            --to-revisions LATEST=100
      
      - name: Monitor
        run: |
          # Wait 5 min, monitor error rate
          # If 5xx > 5%: Auto-rollback
          sleep 300
          ERROR_RATE=$(gcloud monitoring read --filter '...' | grep error_rate)
          if [ $ERROR_RATE -gt 5 ]; then
            gcloud run services update-traffic dnaccounting --to-revisions PREVIOUS=100
            exit 1
          fi
```

---

## 9. MONITORING & LOGGING (Winston + Datadog)

### Structured Logging

```typescript
// src/logger/logger.ts
import * as winston from 'winston';
import * as Datadog from 'datadog-api-client';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.json(),
    }),
  ],
});

// Structured log example
logger.info('GL posting', {
  tenant_id: 'uuid-123',
  journal_id: 'uuid-456',
  debit_total: 1000000,
  credit_total: 1000000,
  status: 'posted',
  timestamp: new Date().toISOString(),
});

// Forward to Datadog
const datadogTransport = new DatadogWinstonTransport({
  hostname: 'dnaccounting-api',
  service: 'dnaccounting',
  env: process.env.NODE_ENV,
  apiKey: process.env.DATADOG_API_KEY,
});
```

### Datadog Integration

```typescript
// Key metrics to track:
// - Request latency (p50, p95, p99)
// - Error rate (4xx, 5xx)
// - Database query time
// - Redis hit ratio
// - Email delivery success rate
// - Job queue depth

// Alerts:
// - 5xx error rate > 1%: Page engineer
// - P95 latency > 1s: Investigate
// - Email delivery <90%: Check Gmail
// - Queue depth >1000: Restart workers
```

---

## 10. PERFORMANCE TARGETS (Updated)

| Operation | Target P50 | Target P95 | Strategy |
|-----------|-----------|-----------|----------|
| GL posting | 50ms | 150ms | Transaction + indexed by tenant_id + date |
| GL balance (with cache) | 5ms | 20ms | Redis cache, 5-min TTL |
| Trial balance (50 accts) | 100ms | 300ms | SQL aggregate, Redis cache |
| P&L report (1000 txns) | 200ms | 600ms | Pre-computed in Redis, refresh on GL post |
| Invoice list (100 results) | 100ms | 300ms | Partial index on status |
| Approval email send | 50ms | 100ms | Queued via Bull (async) |

---

**END OF SDD V2**

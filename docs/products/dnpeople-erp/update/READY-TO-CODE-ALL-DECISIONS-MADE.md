# Phase 1 — READY TO CODE
## All Decisions Made. Start Friday.

> **✅ IMPLEMENTED — 7 July 2026**  
> Phase 1–4 shipped. Latest: `e2f46fc`.  
> This document remains the **schema/API reference**. For live status see [`CEO-TRACKING-SHEET.md`](CEO-TRACKING-SHEET.md) and [`Docs/12-PROJECT-STATUS.md`](../Docs/12-PROJECT-STATUS.md).

**Authority:** Dozer (CEO + Tech Lead)  
**Status:** ✅ ALL PHASES IMPLEMENTED — live deploy pending  
**Go-Live:** Set AWS secrets → deploy → production window

---

## DECISIONS MADE (No Further Discussion)

### 1. DATABASE SCHEMA — FINAL

```typescript
// ============================================
// TRACK A: CUSTOM REPORTING
// ============================================

@Entity('report_definitions')
export class ReportDefinition extends BaseEntity {
  @Column('varchar', { length: 255 })
  name: string; // "Monthly Revenue by Product"

  @Column('uuid')
  tenantId: string;

  @Column('uuid')
  createdBy: string;

  @Column('varchar')
  dataSourceModule: string; // 'finance', 'sales', 'hr', 'supply_chain'

  @Column('varchar')
  dataSourceTable: string; // 'invoices', 'sales_orders', 'payroll_runs'

  @Column('jsonb')
  columns: Array<{
    field: string; // 'id', 'amount', 'date'
    label: string; // 'Invoice ID', 'Amount', 'Date'
    dataType: 'string' | 'number' | 'date' | 'boolean';
    format?: string; // '$0,000.00', 'YYYY-MM-DD', 'dd/mm/yyyy'
  }>;

  @Column('jsonb', { default: [] })
  filters: Array<{
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'between' | 'contains' | 'startsWith';
    value: any;
    connective?: 'AND' | 'OR';
  }>;

  @Column('varchar', { array: true, default: [] })
  groupBy: string[]; // ['date', 'status']

  @Column('jsonb', { default: [] })
  aggregates: Array<{
    field: string;
    function: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX' | 'COUNT_DISTINCT';
    alias: string; // 'total_amount', 'avg_price'
  }>;

  @Column('jsonb', { default: [] })
  sortBy: Array<{
    field: string;
    direction: 'ASC' | 'DESC';
  }>;

  @Column('integer', { default: 1000 })
  limit: number;

  @Column('jsonb', { default: { showTotals: true, pageSize: 20 } })
  displayOptions: any;

  @Column('varchar', { enum: ['DRAFT', 'PUBLISHED'], default: 'DRAFT' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Index()
  @Column('uuid')
  tenantId: string;
}

@Entity('report_executions')
export class ReportExecution extends BaseEntity {
  @Column('uuid')
  reportDefinitionId: string;

  @Column('uuid')
  tenantId: string;

  @Column('uuid')
  executedBy: string;

  @Column('integer')
  rowCount: number;

  @Column('integer')
  executionTimeMs: number;

  @CreateDateColumn()
  executedAt: Date;

  @Index()
  @Column('uuid')
  reportDefinitionId: string;

  @Index(['tenantId', 'executedAt'])
}

// ============================================
// TRACK B: WORKFLOW AUTOMATION
// ============================================

@Entity('workflow_definitions')
export class WorkflowDefinition extends BaseEntity {
  @Column('varchar', { length: 255 })
  name: string; // 'PO Approval', 'Leave Request'

  @Column('varchar')
  trigger: string; // 'procurement.po.submitted', 'hr.leave_request.created'

  @Column('jsonb')
  states: Array<{
    id: string;
    name: string;
    type: 'pending_approval' | 'auto_action' | 'end';
    approvers: string[]; // user IDs or role slugs (finance_manager, cfo)
    parallelApprovals: boolean; // true = all must approve, false = any one
    dueDate?: number; // days
  }>;

  @Column('jsonb')
  transitions: Array<{
    from: string;
    to: string;
    condition?: { field: string; operator: 'gt' | 'lt' | 'eq'; value: any };
    label: string;
  }>;

  @Column('jsonb')
  actions: Array<{
    trigger: 'on_enter' | 'on_exit';
    state: string;
    type: 'email' | 'gl_posting' | 'update_status' | 'webhook';
    config: any;
  }>;

  @Column('uuid')
  tenantId: string;

  @Column('uuid')
  createdBy: string;

  @Column('int', { default: 1 })
  version: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Index(['tenantId', 'name'])
}

@Entity('workflow_instances')
export class WorkflowInstance extends BaseEntity {
  @Column('uuid')
  workflowDefinitionId: string;

  @Column('uuid')
  documentId: string;

  @Column('varchar')
  documentType: string; // 'po', 'leave_request', 'invoice'

  @Column('varchar')
  currentState: string;

  @Column('uuid')
  tenantId: string;

  @Column('uuid')
  initiatedBy: string;

  @Column('jsonb')
  approvals: Array<{
    id: string;
    state: string;
    assignedTo: string[];
    approved: { [userId: string]: { timestamp: Date; comment?: string } };
    rejected?: { userId: string; timestamp: Date; reason: string };
  }>;

  @Column('jsonb')
  history: Array<{
    timestamp: Date;
    fromState: string;
    toState: string;
    transitionedBy: string;
  }>;

  @Column('timestamp', { nullable: true })
  dueDate: Date;

  @Column('varchar', { enum: ['active', 'completed', 'rejected'], default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Index(['tenantId', 'documentType', 'documentId'])
  @Index(['tenantId', 'currentState', 'status'])
}

// ============================================
// TRACK C: INTEGRATION MARKETPLACE
// ============================================

@Entity('integrations')
export class Integration extends BaseEntity {
  @Column('uuid')
  tenantId: string;

  @Column('varchar')
  name: string; // 'stripe', 'slack', 'zapier', 'shopify', 'jne'

  @Column('varchar')
  type: string; // Same as name

  @Column('varchar', { enum: ['connected', 'disconnected', 'error'], default: 'disconnected' })
  status: string;

  @Column('jsonb')
  credentials: {
    accessToken?: string; // encrypted via Secrets Manager
    refreshToken?: string; // encrypted
    apiKey?: string; // encrypted
    accountId?: string;
    webhookSecret?: string;
    [key: string]: any;
  };

  @Column('jsonb')
  config: {
    webhookUrl?: string;
    eventFilters?: string[];
    dataMapping?: { [key: string]: string };
    syncFrequency?: 'realtime' | 'hourly' | 'daily';
    [key: string]: any;
  };

  @Column('jsonb', { nullable: true })
  lastSyncLog: {
    timestamp: Date;
    status: 'success' | 'error' | 'pending';
    recordsProcessed: number;
    errorMessage?: string;
  };

  @Column('uuid')
  createdBy: string;

  @CreateDateColumn()
  connectedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Index(['tenantId', 'name'])
  @Index(['tenantId', 'status'])
}

@Entity('integration_logs')
export class IntegrationLog extends BaseEntity {
  @Column('uuid')
  integrationId: string;

  @Column('uuid')
  tenantId: string;

  @Column('varchar')
  event: string; // 'stripe.charge.succeeded', 'slack.message.sent'

  @Column('jsonb')
  payload: any;

  @Column('varchar', { enum: ['success', 'error', 'pending'] })
  status: string;

  @Column('text', { nullable: true })
  errorMessage: string;

  @Column('integer', { nullable: true })
  retryCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @Index(['integrationId', 'createdAt'])
  @Index(['tenantId', 'status'])
}

// ============================================
// TRACK D: CUSTOMER/VENDOR PORTALS
// ============================================

@Entity('portal_users')
export class PortalUser extends BaseEntity {
  @Column('uuid')
  tenantId: string;

  @Column('varchar', { unique: true }) // compound: tenantId + email
  email: string;

  @Column('varchar')
  password: string; // hashed with bcrypt

  @Column('varchar')
  portalType: 'customer' | 'vendor'; // customer = buyer, vendor = supplier

  @Column('uuid', { nullable: true })
  linkedEntityId: string; // customer ID or vendor ID

  @Column('varchar', { enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Column('boolean', { default: false })
  emailVerified: boolean;

  @Column('varchar', { nullable: true })
  twoFactorSecret?: string; // optional 2FA

  @Column('timestamp', { nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Index(['tenantId', 'email'])
  @Index(['tenantId', 'portalType'])
}

@Entity('portal_sessions')
export class PortalSession extends BaseEntity {
  @Column('uuid')
  portalUserId: string;

  @Column('uuid')
  tenantId: string;

  @Column('varchar')
  token: string; // JWT

  @Column('timestamp')
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Index(['portalUserId', 'tenantId'])
  @Index(['token'])
}

// Migrations (create in this order)
// 1730000000004-AddReportDefinition.ts
// 1730000000005-AddWorkflowTables.ts
// 1730000000006-AddIntegrationEntity.ts
// 1730000000007-AddPortalTables.ts
// 1730000000008-AddIndexesPhase1.ts
```

---

### 2. API CONTRACTS — FINAL

**Format:** `{METHOD} {PATH}` → `{REQUEST}` → `{RESPONSE}`

#### Track A: Custom Reporting

```
POST /api/v1/reporting/reports/custom
├─ Request: { name, dataSourceTable, columns, filters, groupBy, aggregates, sortBy }
└─ Response: { id, name, status, createdAt }

POST /api/v1/reporting/reports/:id/execute
├─ Request: { runtimeFilters?: [] }
└─ Response: { rows: [], count, executionMs }

GET /api/v1/reporting/reports/:id/preview
├─ Query: ?limit=20
└─ Response: { rows: [] }

POST /api/v1/reporting/reports/:id/export/pdf
├─ Response: { data: Buffer, filename: string }

POST /api/v1/reporting/reports/:id/export/excel
├─ Response: { data: Buffer, filename: string }

GET /api/v1/reporting/reports
├─ Query: ?status=PUBLISHED
└─ Response: [{ id, name, dataSourceTable, createdAt }, ...]

DELETE /api/v1/reporting/reports/:id
└─ Response: { message: 'Deleted' }
```

#### Track B: Workflow Automation

```
POST /api/v1/workflow/definitions
├─ Request: { name, trigger, states[], transitions[], actions[] }
└─ Response: { id, name, status, createdAt }

POST /api/v1/workflow/instances/:documentType/:documentId/initiate
├─ Request: { workflowName }
└─ Response: { instanceId, currentState, dueDate }

POST /api/v1/workflow/instances/:id/approve
├─ Request: { comment?: string }
└─ Response: { instanceId, currentState, status, history }

POST /api/v1/workflow/instances/:id/reject
├─ Request: { reason: string }
└─ Response: { instanceId, status: 'rejected', history }

GET /api/v1/workflow/inbox/pending
└─ Response: [{ instanceId, documentId, documentType, stateName, dueDate, isOverdue }, ...]

GET /api/v1/workflow/instances/:id
└─ Response: { id, documentId, currentState, approvals[], history[], dueDate, status }
```

#### Track C: Integration Marketplace

```
GET /api/v1/integrations/gallery
└─ Response: [{ name, description, icon, events[] }, ...]

GET /api/v1/integrations/oauth/:provider/url
├─ Query: ?redirectUri=...
└─ Response: { oauthUrl: string }

POST /api/v1/integrations/oauth/:provider/callback
├─ Request: { code: string }
└─ Response: { id, name, status: 'connected', connectedAt }

POST /api/v1/integrations/:id/test
└─ Response: { status: 'success' | 'error', message: string }

POST /api/v1/integrations/:id/sync
└─ Response: { status, recordsProcessed, errorMessage? }

GET /api/v1/integrations
└─ Response: [{ id, name, status, lastSyncLog }, ...]

DELETE /api/v1/integrations/:id
└─ Response: { message: 'Disconnected' }
```

#### Track D: Customer/Vendor Portals

```
POST /api/v1/portal/auth/login
├─ Request: { email, password, portalType: 'customer' | 'vendor' }
└─ Response: { token: JWT, expiresIn, user: { id, email, portalType } }

GET /api/v1/portal/customer/invoices
├─ Query: ?status=PENDING&dateFrom=2026-01-01&dateTo=2026-12-31
└─ Response: [{ id, amount, status, dueDate, customerId }, ...]

GET /api/v1/portal/customer/invoices/:id/detail
└─ Response: { id, amount, items[], customer, dueDate, status, pdf_url }

POST /api/v1/portal/customer/invoices/:id/pay
├─ Request: { amount, paymentMethod: 'stripe' | 'bank_transfer' }
└─ Response: { paymentId, status, transactionId, receiptUrl }

GET /api/v1/portal/vendor/pos
├─ Query: ?status=APPROVED&dateFrom=2026-01-01
└─ Response: [{ id, poNumber, amount, status, expectedDelivery }, ...]

GET /api/v1/portal/vendor/payments
└─ Response: [{ id, amount, invoiceId, paymentDate, method }, ...]

POST /api/v1/portal/auth/logout
└─ Response: { message: 'Logged out' }
```

**Error Response Format (ALL endpoints):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "INTERNAL_ERROR",
    "message": "Human readable message",
    "details": { "field": ["error1", "error2"] }
  }
}
```

**HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 409: Conflict
- 500: Server error

---

### 3. AUTHENTICATION & SECURITY — FINAL

**Portal Auth Decision:**
```typescript
// Portal users (customers, vendors) ≠ admin users
// Separate auth flow:
// 1. No 2FA for portals (too much friction)
// 2. JWT tokens, 24-hour expiry
// 3. Password reset via email link
// 4. Email verification on signup
// 5. Row-level security: customer sees only own data

// Admin auth (existing): JWT + 2FA optional (keep as-is)
```

**Secrets Management:**
```bash
# Use AWS Secrets Manager (or Vault if self-hosted)
# Credentials stored in: backend/src/config/secrets.config.ts

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
ZAPIER_WEBHOOK_SECRET=...
JWT_SECRET=...
PORTAL_JWT_SECRET=... # separate from admin
```

**Row-Level Security (PostgreSQL):**
```sql
-- Enforce at DB level for portals
CREATE POLICY customer_invoice_access ON invoices
  USING (customer_id = current_user_id AND tenant_id = current_tenant_id)
  WITH CHECK (customer_id = current_user_id AND tenant_id = current_tenant_id);

-- Alternative: app-level check in queries
WHERE tenantId = user.tenantId AND customerId = user.linkedEntityId
```

---

### 4. TESTING STRATEGY — FINAL

**Coverage Target:** Maintain ≥60% (currently at 60%)

```typescript
// Unit Tests (50% of time)
src/modules/reporting/services/query-builder.service.spec.ts
  - Test WHERE clause building
  - Test GROUP BY aggregation
  - Test ORDER BY sorting
  - Test LIMIT pagination

src/modules/workflow/services/workflow-engine.service.spec.ts
  - Test state transitions
  - Test approval logic (sequential vs parallel)
  - Test condition evaluation
  - Test escalation timing

src/modules/integration/services/integration-registry.service.spec.ts
  - Test OAuth callback handling
  - Test sync data mapping
  - Test error retry logic

src/modules/portal/services/portal.service.spec.ts
  - Test row-level security (customer can't see vendor data)
  - Test payment recording

// Integration Tests (30% of time)
// Use database fixtures (seed test data)
├─ Workflow approval → GL posting
├─ Stripe webhook → AR payment → Report updated
├─ Integration sync → DB updated

// E2E Tests (20% of time)
// Use Cypress (existing setup)
├─ Report: create → preview → export PDF/Excel
├─ Workflow: initiate → approve → complete
├─ Integration: connect Stripe → sync test charge
├─ Portal: login → view invoice → pay

// Test Data Strategy:
// Use typeorm seeding (seed.ts) for fixtures
// Create TenantFixture with demo data per test
```

**Commands:**
```bash
# Run all tests
npm run test

# Run with coverage
npm run test:cov

# Run specific test file
npm run test -- query-builder.service.spec.ts

# Watch mode
npm run test:watch

# E2E
npm run test:e2e
```

---

### 5. INTEGRATION SERVICES — FINAL

**Which integrations to build first:**

```
Priority 1 (Week 1-2):
├─ Stripe (payment sync → AR)
├─ Slack (approval notifications)
└─ Zapier (webhook listener)

Priority 2 (Week 3-4):
├─ Shopify (sales order sync)
└─ Email (SMTP for report delivery)

Priority 3 (Future):
├─ JNE/Tiki shipping (tracking)
├─ Google Drive (backup)
└─ JIRA (project sync)
```

**Stripe Integration Details:**
```typescript
// OAuth flow: https://connect.stripe.com/
// After authorization: get access_token + stripe_user_id
// Use: https://github.com/stripe/stripe-node

// Data sync:
// Pull charges: stripe.charges.list({ limit: 100 })
// Map: charge.id → stripeChargeId
// Map: charge.amount/100 → invoiceAmount
// Map: charge.customer → customerId
// Post: POST /api/v1/finance/ar/payments { stripeChargeId, amount, customerId }

// Webhook: charge.succeeded, charge.failed, charge.refunded
// Signature verification: use Stripe SDK
```

**Slack Integration Details:**
```typescript
// OAuth flow: https://api.slack.com/authentication/oauth-v2
// Get: bot_token (xoxb-...), signing_secret

// Data sync: None (one-way, notifications only)

// Workflow trigger:
// When approval requested → send Slack message to approver
// Message format:
// "PO #1234 awaiting your approval
//  Amount: $50,000
//  Submitted by: John Doe
//  [Approve] [Reject]"

// Use Slack SDK: @slack/web-api
```

**Zapier Integration Details:**
```typescript
// No OAuth (Zapier initiated by user)
// Webhook listener: POST /api/v1/integrations/zapier/webhook
// Payload: { action, data: {} }

// Use case:
// "When workflow approved, send data to external system"
// Zapier webhook format:
// {
//   "action": "workflow_approved",
//   "workflowId": "...",
//   "documentId": "...",
//   "approvedBy": "...",
//   "timestamp": "..."
// }
```

---

### 6. INFRASTRUCTURE & DEPLOYMENT — FINAL

**CI/CD (GitHub Actions):**

```yaml
# .github/workflows/ci-phase1.yml
name: Phase 1 CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Test (all 4 tracks)
        run: npm test -- --coverage
      
      - name: Check coverage >= 60%
        run: npm run test:cov -- --coverageThreshold='{"global":{"statements":60}}'
      
      - name: Build
        run: npm run build
```

**Database Migrations (Order Matters):**
```bash
# Run before deploy to staging/production
npm run db:migrate

# Migration files (run in order):
1730000000004-AddReportDefinition.ts
1730000000005-AddWorkflowTables.ts
1730000000006-AddIntegrationEntity.ts
1730000000007-AddPortalTables.ts
1730000000008-AddIndexesPhase1.ts
```

**Staging Deployment (Friday Week 4):**
```bash
# Create new RDS snapshot
# Deploy code: docker build . → push to ECR
# Upgrade EKS: helm upgrade dnpeople ./helm-charts -f values-staging.yaml
# Run migrations: npm run db:migrate
# Seed data: npm run db:seed
# Health check: GET /api/v1/health
# Smoke tests: basic flow per track
```

---

### 7. TEAM SCHEDULE — FINAL

**Week 1-4 (All parallel)**

| Time | Activity |
|------|----------|
| 9:00 AM | Daily standup (15 min, all tracks) |
| 9:15-5 PM | Deep work (track leads unblock issues) |
| 3:00 PM | Cross-track sync (5 min async in Slack) |
| 5:00 PM | Status update (1 line per track, in Slack) |

**Weekly Milestones:**

```
WEEK 1: Entity setup + backend service skeleton
└─ All 4 tracks have entities migrated + basic services
└─ Tests passing (60%+ coverage maintained)

WEEK 2: Core logic + UI integration
└─ All 4 tracks have working API endpoints
└─ Frontend connects to backend (basic flow)

WEEK 3: Polish + testing
└─ All 4 tracks have complete features
└─ QA sign-off per track
└─ Integration testing (cross-track)

WEEK 4: Deploy to staging + launch prep
└─ Deploy to staging Friday EOD
└─ Smoke tests pass
└─ Ready for Monday production launch
```

---

## ✅ READY TO CODE — START FRIDAY

**File Structure (Create Now):**

```
backend/
├─ src/modules/
│  ├─ reporting/ (Track A)
│  │  ├─ entities/
│  │  │  ├─ report-definition.entity.ts
│  │  │  └─ report-execution.entity.ts
│  │  ├─ services/
│  │  │  ├─ query-builder.service.ts
│  │  │  ├─ query-builder.service.spec.ts
│  │  │  ├─ report-builder.service.ts
│  │  │  └─ report-builder.service.spec.ts
│  │  ├─ controllers/
│  │  │  └─ report-builder.controller.ts
│  │  └─ reporting.module.ts
│  │
│  ├─ workflow/ (Track B)
│  │  ├─ entities/
│  │  │  ├─ workflow-definition.entity.ts
│  │  │  └─ workflow-instance.entity.ts
│  │  ├─ services/
│  │  │  ├─ workflow-engine.service.ts
│  │  │  ├─ workflow-engine.service.spec.ts
│  │  │  └─ workflow-transition.service.ts
│  │  ├─ controllers/
│  │  │  └─ workflow.controller.ts
│  │  └─ workflow.module.ts
│  │
│  ├─ integration/ (Track C)
│  │  ├─ entities/
│  │  │  ├─ integration.entity.ts
│  │  │  └─ integration-log.entity.ts
│  │  ├─ services/
│  │  │  ├─ integration-registry.service.ts
│  │  │  ├─ integrations/
│  │  │  │  ├─ stripe.integration.ts
│  │  │  │  ├─ slack.integration.ts
│  │  │  │  └─ zapier.integration.ts
│  │  │  └─ integration-registry.service.spec.ts
│  │  ├─ controllers/
│  │  │  └─ integration.controller.ts
│  │  └─ integration.module.ts
│  │
│  └─ portal/ (Track D)
│     ├─ entities/
│     │  ├─ portal-user.entity.ts
│     │  └─ portal-session.entity.ts
│     ├─ services/
│     │  ├─ portal.service.ts
│     │  └─ portal.service.spec.ts
│     ├─ controllers/
│     │  ├─ portal-auth.controller.ts
│     │  ├─ portal-customer.controller.ts
│     │  └─ portal-vendor.controller.ts
│     └─ portal.module.ts
│
├─ src/database/migrations/
│  ├─ 1730000000004-AddReportDefinition.ts
│  ├─ 1730000000005-AddWorkflowTables.ts
│  ├─ 1730000000006-AddIntegrationEntity.ts
│  ├─ 1730000000007-AddPortalTables.ts
│  └─ 1730000000008-AddIndexesPhase1.ts

frontend/
├─ src/pages/
│  ├─ ReportBuilder.tsx (Track A)
│  ├─ WorkflowAutomation.tsx (Track B)
│  ├─ IntegrationMarketplace.tsx (Track C)
│  └─ Portal/ (Track D)
│     ├─ CustomerPortal.tsx
│     └─ VendorPortal.tsx
│
├─ src/components/
│  ├─ ReportBuilder/ (Track A)
│  │  ├─ ColumnPicker.tsx
│  │  ├─ FilterBuilder.tsx
│  │  └─ PreviewTable.tsx
│  │
│  ├─ Workflow/ (Track B)
│  │  ├─ WorkflowCanvas.tsx
│  │  ├─ ApprovalInbox.tsx
│  │  └─ StateBox.tsx
│  │
│  ├─ Integration/ (Track C)
│  │  ├─ IntegrationGallery.tsx
│  │  ├─ IntegrationCard.tsx
│  │  └─ ConnectFlow.tsx
│  │
│  └─ Portal/ (Track D)
│     ├─ PortalLogin.tsx
│     ├─ InvoiceList.tsx
│     └─ PaymentForm.tsx
│
└─ cypress/e2e/
   ├─ reporting.cy.ts (Track A)
   ├─ workflow.cy.ts (Track B)
   ├─ integration.cy.ts (Track C)
   └─ portal.cy.ts (Track D)
```

**First Commits (Friday EOD):**
```bash
# Each track creates PR with empty structure
git checkout -b feature/phase-1-track-a-reporting
# Create entities, services, controllers (empty methods)
# Create migrations
# Create tests (import but empty it)
git commit -m "feat(reporting): Phase 1 scaffold - entities, services, controllers"
git push

# Similar for tracks B, C, D
# All PRs ready for Monday code implementation
```

---

## 🚀 EXECUTION (Next 4 Weeks)

**Track Leads** (assign Monday morning):
- Track A: [Senior backend dev]
- Track B: [Senior backend dev]
- Track C: [Senior backend dev]
- Track D: [Senior backend dev]

**Each track is autonomous:**
- Own entities, services, controllers
- Own tests
- Own API endpoints
- Own UI components
- Own database migrations

**Daily:**
- 9 AM: 15-min standup (all tracks report blockers)
- 5 PM: Async status in Slack (1 line per track)

**Weekly:**
- Friday EOW: Status update (% complete, risks)
- Monday: Review PRs (code review by peer track lead)

**Deployments:**
- All 4 tracks deploy together to staging (Friday Week 4)
- All 4 tracks deploy together to production (Monday Week 5)

---

## ✅ FINAL CHECKLIST

```
✅ Database schema finalized
✅ API contracts documented
✅ Auth strategy decided (separate portal auth)
✅ Secrets management planned (AWS Secrets Manager)
✅ Testing strategy defined (unit 50%, integration 30%, E2E 20%)
✅ Integrations chosen (Stripe, Slack, Zapier priority)
✅ File structure documented
✅ CI/CD config ready
✅ Migration strategy confirmed
✅ Team allocation ready
✅ Schedule locked (4 weeks, parallel)
✅ Success metrics defined

🚀 SHIPPED — 5 JULY 2026 (see CEO-TRACKING-SHEET.md)
```

---

**Authority:** Dozer (CEO + Tech Lead)  
**Document Version:** 1.0 Final (implemented)  
**Last Updated:** 5 July 2026

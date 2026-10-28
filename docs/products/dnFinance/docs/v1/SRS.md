# dnFinance Software Requirements Specification (SRS)
**Version:** 1.0  
**Date:** August 2026  
**Sprint Duration:** 2 weeks (8 sprints total = 16 weeks MVP)  

---

## SPRINT BREAKDOWN & DEVELOPMENT TICKETS

---

## SPRINT 1-2: Foundation & Authentication (Weeks 1-4)

### Epic: User Authentication & Multi-Tenancy

#### Task: Setup NestJS Project & Database
**Ticket:** DEV-001  
**Estimated:** 8 hours  
**Definition of Done:**
- [ ] NestJS 10 project initialized with TypeORM + PostgreSQL
- [ ] Database schemas created (tenants, users, audit_logs)
- [ ] TypeORM migrations working locally
- [ ] Environment variables configured (.env.example)
- [ ] GitHub Actions CI/CD pipeline running on PR

**Technical Details:**
```bash
npm init @nestjs/app dnaccounting
# Install: @nestjs/typeorm typeorm pg bcryptjs
# Create: src/config/database.config.ts
# Create: src/database/migrations/001-init.ts
```

---

#### Task: JWT Authentication Service
**Ticket:** DEV-002  
**Estimated:** 12 hours  
**Acceptance Criteria:**
- [ ] User registration with email validation
- [ ] Password hashing (bcrypt 12 rounds)
- [ ] JWT token generation (24h expiry + 90d refresh tokens)
- [ ] Login endpoint returns token
- [ ] Refresh token endpoint works
- [ ] Logout clears refresh token from DB
- [ ] Error handling: duplicate email, invalid password, token expired

**Test Coverage:**
- [ ] Unit tests: password hashing, token generation (100% coverage)
- [ ] Integration tests: registration flow, login/logout (80%+ coverage)
- [ ] Edge cases: token expiry, refresh token rotation

**API Endpoints:**
```
POST /api/v1/auth/register
  Body: { email, password, company_name, industry }
  Response: 201 { user_id, tenant_id, token, refresh_token, expires_in }
  Errors: 409 (email duplicate), 400 (validation)

POST /api/v1/auth/login
  Body: { email, password }
  Response: 200 { token, refresh_token, expires_in, user }
  Errors: 401 (invalid credentials)

POST /api/v1/auth/refresh
  Body: { refresh_token }
  Response: 200 { token, expires_in }
  Errors: 401 (invalid refresh token)

POST /api/v1/auth/logout
  Headers: Authorization: Bearer <token>
  Response: 200 { success: true }
```

---

#### Task: Multi-Tenancy & RBAC
**Ticket:** DEV-003  
**Estimated:** 10 hours  
**Acceptance Criteria:**
- [ ] Tenant interceptor: all queries include WHERE tenant_id = ?
- [ ] Role-based access control (Admin, Accountant, Manager, Viewer)
- [ ] Roles guard prevents unauthorized access
- [ ] User can only access their tenant data
- [ ] Admin can create users within tenant (with rate limit)
- [ ] User creation invitation email sent

**Database Changes:**
```sql
ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'accountant';
CREATE INDEX idx_users_tenant_role ON users(tenant_id, role);
```

**Test Coverage:**
- [ ] Cross-tenant isolation (user A cannot see tenant B data)
- [ ] Role-based endpoint access (viewer cannot POST)
- [ ] Admin provisioning new users

---

#### Task: Setup React Frontend Skeleton
**Ticket:** DEV-004  
**Estimated:** 6 hours  
**Acceptance Criteria:**
- [ ] Vite 5 project initialized with React 19
- [ ] Redux Toolkit store configured
- [ ] Tailwind CSS 3.4 setup
- [ ] Layout components (Navbar, Sidebar, MainContainer)
- [ ] Route structure (public auth routes, private dashboard routes)
- [ ] Axios interceptor for JWT token (auto-refresh on 401)
- [ ] Error boundary component

**File Structure:**
```
src/
  components/
    layout/
      Navbar.tsx
      Sidebar.tsx
      MainLayout.tsx
    common/
      Button.tsx
      Card.tsx
      Input.tsx
      ErrorBoundary.tsx
  features/
    auth/
      LoginPage.tsx
      RegisterPage.tsx
    dashboard/
      DashboardPage.tsx
  services/
    api.ts (axios instance + interceptor)
  store/
    store.ts
    authSlice.ts
  App.tsx
```

---

### End of Sprint 1-2 Deliverables
- ✅ Backend: NestJS API with auth + multi-tenancy
- ✅ Frontend: Login/Register pages, main layout
- ✅ Database: Tables + migrations
- ✅ Testing: >80% coverage for auth paths
- ✅ Deployment: Staging environment ready

---

## SPRINT 3-4: Chart of Accounts & GL Posting (Weeks 5-8)

### Epic: Core Accounting Module

#### Task: COA Template & Setup Wizard
**Ticket:** DEV-005  
**Estimated:** 14 hours  
**Acceptance Criteria:**
- [ ] COA templates for 5 verticals (retail, F&B, jasa, trading, manufac_kecil)
- [ ] Setup wizard: select industry → auto-populate COA
- [ ] Ability to add/rename/deactivate GL accounts
- [ ] Chart of accounts hierarchy (header accounts) working
- [ ] COA import from Excel (template-based)
- [ ] Validation: no duplicate account codes within tenant
- [ ] Trial balance shows all GL accounts

**Database:**
```sql
-- Templates stored in JSON seed file, loaded on tenant creation
src/database/seeds/coa-templates.json
{
  "retail": [
    { "code": "1000", "name": "Cash", "type": "asset" },
    { "code": "1100", "name": "Accounts Receivable", "type": "asset" },
    ...
  ]
}
```

**API Endpoints:**
```
GET /api/v1/accounts?type=asset&is_active=true
  Response: 200 { data: [...COA items...], total: 42 }

GET /api/v1/accounts/templates
  Response: 200 { templates: ["retail", "fnb", "jasa", "trading", "manufac_kecil"] }

POST /api/v1/accounts/templates/:industry/apply
  Response: 200 { imported_count: 48, errors: [] }

POST /api/v1/accounts
  Body: { account_code: "1010", account_name: "Cash in Bank", account_type: "asset" }
  Response: 201 { id, account_code, account_name, ... }

PUT /api/v1/accounts/:id
  Body: { account_name: "Checking Account", is_active: true }
  Response: 200 { id, ... }
```

**Frontend Components:**
- SetupWizard.tsx (step-by-step COA selection)
- COAList.tsx (table of all GL accounts)
- COAForm.tsx (add/edit GL account form)

---

#### Task: Journal Entry Creation & Batch Posting
**Ticket:** DEV-006  
**Estimated:** 18 hours  
**Acceptance Criteria:**
- [ ] Create journal entry (date, description, multiple GL lines)
- [ ] Auto-validate: debit = credit before save
- [ ] Batch posting: create multiple GL lines in one entry
- [ ] Support recurring entries (save template, auto-post monthly)
- [ ] Draft status: entries can be edited/deleted
- [ ] Approval workflow: journal entries can require approval before posting
- [ ] GL posting atomic transaction (all-or-nothing)
- [ ] Audit log: track who created, when, any edits

**Database:**
```sql
-- See SDD section 4 for schema
-- Key index: CREATE INDEX idx_journal_entries_tenant_date ON journal_entries(tenant_id, entry_date);
```

**GL Posting Logic (AccountService.postJournal):**
```typescript
async postJournal(tenantId: UUID, journalEntryId: UUID): Promise<void> {
  // 1. Fetch journal entry + lines
  // 2. Validate: debit total = credit total
  // 3. BEGIN TRANSACTION
  // 4. FOR EACH line:
  //    - Update GL account balance (cached in Redis)
  //    - Create transaction record (for audit)
  // 5. Mark journal entry as "posted"
  // 6. Log audit entry
  // 7. COMMIT TRANSACTION
  // 8. Invalidate report cache
}
```

**API Endpoints:**
```
POST /api/v1/journal-entries
  Body: {
    entry_date: "2024-01-15",
    description: "Monthly depreciation",
    reference_id: "DEPR-001",
    reference_type: "manual",
    lines: [
      { chart_account_id: "uuid-1", debit: 100000, credit: 0, description: "Depreciation Expense" },
      { chart_account_id: "uuid-2", debit: 0, credit: 100000, description: "Accumulated Depreciation" }
    ]
  }
  Response: 201 { id, approval_status: "draft" } | 400 { error: "Debit/credit mismatch" }

GET /api/v1/journal-entries?from_date=2024-01-01&to_date=2024-01-31&status=draft
  Response: 200 { data: [...], total: 45 }

GET /api/v1/journal-entries/:id
  Response: 200 { id, entry_date, lines: [...], audit_trail: [...] }

PUT /api/v1/journal-entries/:id
  Body: { description: "...", lines: [...] }
  Validation: Only if status = "draft"
  Response: 200 { id, ... }

POST /api/v1/journal-entries/:id/post
  Body: {} (empty)
  Validation: debit = credit, all references valid
  Response: 200 { id, status: "posted", posted_at: "2024-01-15T10:30:00Z" }
  Errors: 400 (debit/credit mismatch), 409 (already posted)
```

**Test Coverage:**
- [ ] GL posting: debit=credit validation, transaction atomicity (100%)
- [ ] Recurring entries: auto-post on schedule (95%)
- [ ] Audit logging: verify all GL postings logged (100%)

---

#### Task: General Ledger Query & Trial Balance
**Ticket:** DEV-007  
**Estimated:** 12 hours  
**Acceptance Criteria:**
- [ ] GL account query: filter by code, name, type, date range
- [ ] GL account balance: running balance calculation (efficient)
- [ ] Trial balance report: all GL accounts + total debit/credit
- [ ] Balance sheet: assets/liabilities/equity grouped
- [ ] P&L statement: revenues/expenses by period
- [ ] Drill-down: click account → see GL transactions

**Performance Requirements:**
- GL account balance: <100ms (cached in Redis)
- Trial balance (50 accounts): <200ms
- P&L report (1000 transactions): <500ms

**API Endpoints:**
```
GET /api/v1/gl/accounts/:account_id/transactions?from_date=2024-01-01&to_date=2024-01-31
  Response: 200 {
    account: { id, code, name, type },
    opening_balance: 0,
    transactions: [
      { date, description, debit, credit, balance }
    ],
    closing_balance: 100000
  }

GET /api/v1/reports/trial-balance?as_of_date=2024-12-31
  Response: 200 {
    accounts: [
      { code, name, debit_balance, credit_balance },
      ...
    ],
    total_debit: 10000000,
    total_credit: 10000000
  }

GET /api/v1/reports/balance-sheet?as_of_date=2024-12-31
  Response: 200 {
    assets: { current: [...], fixed: [...], total: 0 },
    liabilities: { current: [...], long_term: [...], total: 0 },
    equity: { capital: [...], retained_earnings: 0, total: 0 },
    total_assets: 0 (must = liabilities + equity)
  }

GET /api/v1/reports/p-and-l?from_date=2024-01-01&to_date=2024-12-31
  Response: 200 {
    revenues: { sales: 0, other_income: 0, total: 0 },
    expenses: { cogs: 0, operating: 0, total: 0 },
    gross_profit: 0,
    net_income: 0
  }
```

**Caching Strategy:**
- GL account balance: Redis cache, TTL 5 min, invalidate on GL posting
- Trial balance: Redis cache, TTL 5 min, invalidate on GL posting
- Reports: Redis cache, TTL 5 min, user can force-refresh

---

#### Task: PDF Report Export & Email Scheduling
**Ticket:** DEV-008  
**Estimated:** 10 hours  
**Acceptance Criteria:**
- [ ] Export report to PDF (P&L, balance sheet, trial balance)
- [ ] PDF styling matches brand (dnFinance logo, colors)
- [ ] Schedule report email (daily, weekly, monthly)
- [ ] Email contains PDF attachment + summary table
- [ ] Scheduled jobs run via Bull queue
- [ ] User can view scheduled reports + cancel

**Libraries:**
- jsPDF + html2pdf (PDF generation from HTML)
- Bull (job queue for scheduled emails)

**API Endpoints:**
```
GET /api/v1/reports/export/balance-sheet?format=pdf&as_of_date=2024-12-31
  Response: 200 { content-type: 'application/pdf', body: <PDF> }

POST /api/v1/reports/schedule-email
  Body: {
    report_type: "balance-sheet",
    frequency: "weekly", // daily, weekly, monthly
    day_of_week: 1, // 0=Sunday, 1=Monday (if weekly)
    time: "08:00", // HH:MM
    email_recipients: ["admin@company.com"],
    params: { as_of_date: "2024-12-31" }
  }
  Response: 201 { schedule_id, next_send_at: "2024-01-08T08:00:00Z" }

GET /api/v1/reports/schedules
  Response: 200 { data: [...], total: 3 }

DELETE /api/v1/reports/schedules/:schedule_id
  Response: 200 { success: true }
```

---

### End of Sprint 3-4 Deliverables
- ✅ COA setup + templates for 5 industries
- ✅ Journal entry creation, batch posting, approval workflow
- ✅ GL queries, trial balance, balance sheet, P&L
- ✅ Report PDF export + email scheduling
- ✅ Test coverage: >80% on GL posting logic
- ✅ React UI: COA setup wizard, journal entry form, report viewer

---

## SPRINT 5-6: Accounts Receivable (Weeks 9-12)

### Epic: Invoice Management & AR Tracking

#### Task: Invoice Creation & Auto-GL Posting
**Ticket:** DEV-009  
**Estimated:** 16 hours  
**Acceptance Criteria:**
- [ ] Create invoice (customer, line items, auto-calculate PPN 11%)
- [ ] Invoice number auto-generated (format: INV-YYYYMMDD-001)
- [ ] Generate invoice PDF
- [ ] Auto-GL posting: (DR) AR | (CR) Revenue | (CR) PPN Payable
- [ ] Track invoice status (draft, sent, partially_paid, paid, overdue, cancelled)
- [ ] Mark payment (full/partial) with date + method
- [ ] Auto-GL posting for payment: (DR) Bank | (CR) AR
- [ ] Email invoice to customer (auto-send or manual)

**Tax Calculation:**
```typescript
// PPN 11% on sales if customer is PV-registered
// Formula: line_total * (11/111) for invoice to PV customer
// For non-PV: no PPN
invoiceLineItemTotal = quantity * unit_price
taxAmount = invoiceLineItemTotal * 0.11 // if PV customer
grandTotal = invoiceLineItemTotal + taxAmount
```

**API Endpoints:**
```
POST /api/v1/invoices
  Body: {
    customer_id: "uuid",
    invoice_date: "2024-01-15",
    due_date: "2024-02-15",
    line_items: [
      { description: "Consulting Services", quantity: 1, unit_price: 500000, tax_code: "pv" }
    ]
  }
  Response: 201 {
    id,
    invoice_number: "INV-20240115-001",
    total_amount: 500000,
    tax_amount: 50000,
    grand_total: 550000,
    status: "draft"
  }

POST /api/v1/invoices/:id/send
  Body: {} (empty)
  Response: 200 { status: "sent", sent_at: "...", sent_to_email: "..." }
  Side effects: (1) Email sent, (2) status updated to "sent"

POST /api/v1/invoices/:id/record-payment
  Body: {
    payment_date: "2024-01-20",
    amount_paid: 550000,
    payment_method: "bank_transfer"
  }
  Response: 200 {
    invoice_id: "uuid",
    remaining_balance: 0,
    status: "paid"
  }
  Side effects: GL posting, status update, audit log

GET /api/v1/invoices?status=pending&from_date=2024-01-01
  Response: 200 {
    data: [...],
    total: 12,
    aging: { 0_30: 5, 30_60: 3, 60_plus: 4 }
  }
```

**GL Posting (on invoice creation):**
```
(DR) Accounts Receivable (asset) 550000
(CR) Service Revenue (revenue) 500000
(CR) PPN Payable (liability) 50000
```

**GL Posting (on payment):**
```
(DR) Bank (asset) 550000
(CR) Accounts Receivable (asset) 550000
```

---

#### Task: AR Aging Report & Collection Reminders
**Ticket:** DEV-010  
**Estimated:** 10 hours  
**Acceptance Criteria:**
- [ ] AR aging report: 0-30d, 30-60d, 60+ days buckets
- [ ] Customer aging: drill-down to invoices by customer
- [ ] Auto-email reminder: overdue invoices daily
- [ ] Overdue invoice marked when due_date < today
- [ ] Report exportable to PDF + Excel

**AR Aging Query:**
```sql
SELECT
  customer_name,
  SUM(CASE WHEN (TODAY() - due_date) < 30 THEN grand_total ELSE 0 END) as "0-30d",
  SUM(CASE WHEN (TODAY() - due_date) BETWEEN 30 AND 60 THEN grand_total ELSE 0 END) as "30-60d",
  SUM(CASE WHEN (TODAY() - due_date) > 60 THEN grand_total ELSE 0 END) as "60+d"
FROM invoices
WHERE tenant_id = $1 AND status IN ('partially_paid', 'overdue')
GROUP BY customer_id, customer_name
ORDER BY (60+d) DESC;
```

**API Endpoints:**
```
GET /api/v1/reports/ar-aging?as_of_date=2024-01-31
  Response: 200 {
    customers: [
      { customer_id, customer_name, "0_30": 100000, "30_60": 50000, "60_plus": 200000, total: 350000 }
    ],
    grand_total: 1000000
  }

GET /api/v1/reports/ar-aging/customer/:customer_id
  Response: 200 {
    customer_name: "...",
    invoices: [
      { invoice_number, invoice_date, due_date, amount, days_overdue, status }
    ]
  }
```

---

#### Task: Customer Master & Contact Management
**Ticket:** DEV-011  
**Estimated:** 8 hours  
**Acceptance Criteria:**
- [ ] Add customer (name, email, phone, address, tax ID/NPWP)
- [ ] Mark if customer is PV-registered (affects tax calc)
- [ ] Edit customer (all fields)
- [ ] Search customer by name/email
- [ ] Deactivate customer (soft delete)
- [ ] Duplicate check: no 2 customers with same name

**API Endpoints:**
```
POST /api/v1/customers
  Body: { customer_name, email, phone, tax_id, is_pv_registered }
  Response: 201 { id, customer_name, ... }

GET /api/v1/customers?search=acme&is_active=true
  Response: 200 { data: [...], total }

GET /api/v1/customers/:id
  Response: 200 { id, customer_name, invoices: [...] }

PUT /api/v1/customers/:id
  Body: { customer_name, email, is_pv_registered }
  Response: 200 { id, ... }
```

---

### End of Sprint 5-6 Deliverables
- ✅ Invoice creation, PDF generation, auto-GL posting
- ✅ Payment tracking, AR aging report
- ✅ Customer master + PV registration
- ✅ Email reminders for overdue invoices
- ✅ React UI: Invoice form, AR aging view, customer manager

---

## SPRINT 7-8: Accounts Payable & Inventory (Weeks 13-16)

### Epic: Bill Approval Workflow & Inventory Tracking

#### Task: Bill Entry & Multi-Level Approval
**Ticket:** DEV-012  
**Estimated:** 16 hours  
**Acceptance Criteria:**
- [ ] Create bill (vendor, amount, description, due date)
- [ ] Auto-calculate PPh 23 if vendor marked (withholding 2%)
- [ ] Multi-level approval: assign approver(s) (1-3 levels)
- [ ] Email approval link (token-based, valid 24h)
- [ ] Approver can approve/reject via email or web
- [ ] GL posting only when all approvals complete
- [ ] Bill status: draft → pending → approved → paid
- [ ] Track payment (manual mark-paid)

**PPh 23 Calculation:**
```typescript
if (vendor.pph_23_applicable) {
  pph_23_amount = (bill_amount * 2) / 100; // 2% withholding
  grandTotal = bill_amount + tax_amount - pph_23_amount; // Net payment
}
```

**GL Posting (on bill approval):**
```
(DR) Expense Account (or Asset) [based on line item]
(DR) PPh 23 Payable (liability) [if applicable]
(CR) Accounts Payable (liability) [grand_total]
```

**GL Posting (on payment):**
```
(DR) Accounts Payable [amount]
(CR) Bank [amount]
```

**API Endpoints:**
```
POST /api/v1/bills
  Body: {
    vendor_id: "uuid",
    bill_date: "2024-01-15",
    due_date: "2024-02-15",
    line_items: [{ description, quantity, unit_price }],
    pph_23_applicable: true
  }
  Response: 201 {
    id,
    bill_number: "BILL-20240115-001",
    grand_total: 1000000,
    pph_23_amount: 20000,
    approval_status: "pending"
  }

POST /api/v1/bills/:id/submit-for-approval
  Body: { approvers_ids: ["uuid-1", "uuid-2"] }
  Response: 200 { approval_status: "pending" }
  Side effects: (1) Email sent to approvers, (2) Approval records created

POST /api/v1/approvals/:approval_id/approve
  Body: { approval_id: "uuid", comments: "Looks good" }
  Response: 200 {
    approval_status: "approved",
    can_proceed: true // true if all levels approved
  }
  Side effects: If can_proceed, auto-post GL

POST /api/v1/approvals/:approval_id/reject
  Body: { rejection_reason: "Need more info on vendor" }
  Response: 200 { approval_status: "rejected" }
  Side effects: Bill status → rejected, email sent to creator

GET /api/v1/bills?approval_status=pending
  Response: 200 { data: [...], total: 3 }
```

---

#### Task: Inventory Tracking (Quantity Only)
**Ticket:** DEV-013  
**Estimated:** 12 hours  
**Acceptance Criteria:**
- [ ] Item master (code, name, category, unit, cost, reorder level)
- [ ] Stock-in transaction (record purchase received)
- [ ] Stock-out transaction (record sale/waste)
- [ ] Current stock level displayed (quantity only, no valuation)
- [ ] Low-stock alert (quantity < reorder level)
- [ ] Stock aging report (how old each item)
- [ ] Auto-GL posting: (DR/CR) Inventory Asset on stock movements

**API Endpoints:**
```
POST /api/v1/items
  Body: { item_code: "SKU-001", item_name: "Product A", category: "Electronics", unit: "pcs", unit_cost: 100000, reorder_level: 10 }
  Response: 201 { id, item_code, current_stock: 0 }

POST /api/v1/stock-movements
  Body: {
    item_id: "uuid",
    movement_date: "2024-01-15",
    movement_type: "in", // "in", "out", "adjustment"
    quantity: 50,
    reference_id: "PO-001",
    unit_cost: 100000
  }
  Response: 201 {
    id,
    new_stock_level: 50,
    inventory_value: 5000000 // quantity * unit_cost
  }

GET /api/v1/items?low_stock=true
  Response: 200 {
    data: [
      { item_code, item_name, current_stock, reorder_level, alert: true }
    ]
  }

GET /api/v1/reports/inventory-valuation
  Response: 200 {
    items: [
      { item_code, item_name, quantity, unit_cost, total_value }
    ],
    total_inventory_value: 50000000
  }
```

---

#### Task: Vendor Master & PPh 23 Configuration
**Ticket:** DEV-014  
**Estimated:** 6 hours  
**Acceptance Criteria:**
- [ ] Vendor master (name, tax ID/NPWP, email, address)
- [ ] Mark if PPh 23 applicable (withholding tax)
- [ ] Edit vendor
- [ ] Deactivate vendor
- [ ] Search vendor by name/NPWP

**API Endpoints:**
```
POST /api/v1/vendors
  Body: { vendor_name, email, tax_id, pph_23_applicable: true }
  Response: 201 { id, vendor_name, ... }

GET /api/v1/vendors?search=supplier&pph_23_applicable=true
  Response: 200 { data: [...], total }
```

---

### End of Sprint 7-8 Deliverables (MVP LAUNCH)
- ✅ Bill creation, multi-level approval workflow
- ✅ PPh 23 calculation + withholding
- ✅ Inventory tracking (quantity only)
- ✅ Vendor master + deactivation
- ✅ React UI: Bill form, approval workflow, inventory manager
- ✅ Complete test coverage >80%
- ✅ Production deployment ready
- ✅ Documentation: API docs (Swagger), user guide

---

## FEATURE SPECIFICATIONS (Detailed)

### Feature: Journal Entry Posting

**Technical Spec:**

**Invariants (must always be true):**
- Debit total = Credit total on every journal entry
- GL account balance = SUM(debit - credit) across all posted entries
- Every GL posting creates audit log entry
- Journal entries are append-only (never updated after posting)

**Algorithm: PostJournal**
```
FUNCTION postJournal(journalEntryId):
  BEGIN TRANSACTION
    1. FETCH journal_entry WHERE id = journalEntryId
    2. VALIDATE debit_total = credit_total
    3. LOCK chart_of_accounts (prevent race conditions)
    4. FOR EACH journal_entry_line:
       - UPDATE chart_of_accounts.debit_balance += line.debit
       - UPDATE chart_of_accounts.credit_balance += line.credit
       - INSERT INTO gl_transaction (for audit trail)
    5. UPDATE journal_entries.status = 'posted'
    6. UPDATE journal_entries.posted_at = NOW()
    7. INSERT INTO audit_logs (who posted, when, GL delta)
    8. INVALIDATE cache: gl_balance_cache[account_id]
  COMMIT TRANSACTION
  BROADCAST: "GL posting event" to Redis subscribers (real-time dashboard)
```

**Error Handling:**
```
If debit != credit: Reject with 400 { error: "Debit/credit mismatch", debit: X, credit: Y }
If transaction fails: Rollback, log error, return 500
If cache invalidation fails: Log warning, manually clear on next read
```

**Testing Strategy:**
- Unit: GL posting math (100% coverage)
- Integration: Post 50 entries → verify GL balances match (95% coverage)
- Load: Post 1000 entries concurrently → verify atomicity (80% coverage)
- Regression: All GL accounts balanced after each posting

---

### Feature: Invoice Auto-GL Posting

**Technical Spec:**

**GL Posting Rules:**
```
WHEN invoice created:
  IF customer.is_pv_registered:
    (DR) Accounts Receivable = line_total + tax
    (CR) Service Revenue = line_total
    (CR) PPN Payable = tax
  ELSE:
    (DR) Accounts Receivable = line_total
    (CR) Service Revenue = line_total

WHEN payment recorded:
  (DR) Bank = amount_paid
  (CR) Accounts Receivable = amount_paid
```

**Invoice Numbering:**
```
Format: INV-YYYYMMDD-XXX
Example: INV-20240115-001
Sequence resets daily, starts at 001
Unique constraint: (tenant_id, invoice_number)
```

---

### Feature: Multi-Level Approval Workflow

**Technical Spec:**

**State Machine:**
```
DRAFT
  ↓
SUBMIT FOR APPROVAL
  ↓
LEVEL 1 PENDING
  ├→ APPROVED → LEVEL 2 PENDING (if 2+ approvers)
  │   ├→ APPROVED → LEVEL 3 PENDING (if 3 approvers)
  │   │   ├→ APPROVED → CAN POST
  │   │   └→ REJECTED → REJECTED
  │   └→ REJECTED → REJECTED
  └→ REJECTED → REJECTED
```

**Email Approval Link:**
```
Token format: JWT { approval_id, approver_id, exp: NOW + 24h }
Endpoint: GET /api/v1/approvals/:token/approve?decision=approved
One-time use: Token deleted after use (or expires)
Link example: https://dnaccounting.app/approvals/eyJ...?decision=approved
```

---

## TESTING REQUIREMENTS

### Unit Test Coverage
- Auth service: 100% (password hashing, JWT generation)
- GL posting logic: 100% (debit=credit validation, balance calc)
- Tax calculators: 100% (PPN, PPh 23 formulas)
- Report generation: 90% (complex logic, some edge cases)

### Integration Tests
- Auth flow: register → login → logout → refresh token
- GL posting: invoice created → AR debited → P&L updated
- Approval workflow: submit bill → level 1 approve → level 2 approve → GL posted
- Multi-tenancy: user A cannot see tenant B data

### Load Tests
- GL posting: 1000 concurrent posts → all atomic
- Report generation: 10 concurrent P&L reports → <2s each
- Invoice list: 10k invoices paginated → <500ms

### Security Tests
- Cross-tenant injection: verify WHERE tenant_id on all queries
- JWT token: expired tokens rejected, refresh works
- Rate limiting: 100 requests/min per IP enforced
- Password: bcrypt with 12 rounds, no plaintext storage

---

## DEPLOYMENT CHECKLIST (Week 16)

### Pre-Launch
- [ ] Database migrations tested on prod schema
- [ ] All 300+ Jest tests passing (coverage >80%)
- [ ] Performance tests: P95 <500ms, P99 <1s
- [ ] Security audit: OWASP Top 10 review
- [ ] Load test: 100 concurrent users, 2h soak test
- [ ] Backup strategy: hourly snapshots to Cloud Storage
- [ ] Monitoring setup: Datadog, Google Cloud Logging
- [ ] Alert setup: 5xx errors, latency spikes, database CPU
- [ ] Runbooks: how to rollback, how to scale DB, emergency contacts
- [ ] Documentation: API docs (Swagger), user guide, admin guide

### Launch Day
- [ ] Green deployment (previous version still running)
- [ ] Smoke tests: register, login, create invoice, GL posted
- [ ] Customer support: on-call for first 24h
- [ ] Monitoring dashboard: watch metrics in real-time
- [ ] Rollback plan: ready to revert if >5% 5xx errors in first hour

### Post-Launch (Week 17+)
- [ ] Gather user feedback: interviews with 10 beta users
- [ ] Analyze usage: which features used most, which abandoned
- [ ] Performance tuning: identify slow queries, optimize indexes
- [ ] Plan Phase 2: OCR, mobile, integrations

---

## DEFINITION OF DONE (DoD)

For each ticket to be marked "done":
- [ ] Code written + code reviewed (2 approvals)
- [ ] Unit tests passing (Jest)
- [ ] Integration tests passing
- [ ] No console.log or debugger statements
- [ ] Linter passing (ESLint + Prettier)
- [ ] Database migrations reversible
- [ ] API docs updated (Swagger/OpenAPI)
- [ ] Edge cases handled (null checks, error messages)
- [ ] Performance acceptable (P95 target met)
- [ ] Merged to main branch
- [ ] Deployed to staging
- [ ] QA tested

---

**END OF SRS**

# dnAccounting System Design Document (SDD)
**Version:** 1.0  
**Date:** August 2026  
**Author:** Dozer Fernando Saroha Daniel Napitupulu  
**Status:** Ready for Implementation  

---

## 1. OVERVIEW & DESIGN PRINCIPLES

### Architecture Philosophy
- **API-First:** Backend fully RESTful, frontend-agnostic (web + mobile both possible)
- **Multi-Tenancy:** Single database with tenant isolation (each SME = 1 tenant)
- **Immutability:** Accounting transactions are immutable (insert-only GL entries, no update)
- **Audit Trail:** Every transaction traceable (who, what, when, why)
- **Scalability:** Horizontal scaling via load balancer + stateless backend
- **Code Reuse:** 40% from dnPeople (tax engine, approval workflow, auth, email)

### Design Goals
1. **Performance:** P95 response <500ms for all operations
2. **Reliability:** 99.5%+ uptime, automatic failover
3. **Security:** Bank-grade encryption, role-based access, audit logging
4. **Maintainability:** DRY code, clear separation of concerns, comprehensive logging
5. **Testability:** >80% test coverage for critical paths (GL posting, tax calc, approval)

---

## 2. TECHNOLOGY STACK

### Backend
```
Runtime: Node.js 20 LTS
Framework: NestJS 10
ORM: TypeORM 0.3
Database: PostgreSQL 15
Cache: Redis 7 (session, rate limiting, real-time GL balance)
Queue: Bull + Redis (async: email send, report generation, reconciliation)
Auth: JWT + OAuth2 (Google, Midtrans optional)
Email: Nodemailer + Gmail API
File Storage: Google Cloud Storage (PDF reports, exports)
Monitoring: Winston (logging), Datadog (APM)
```

### Frontend (Web)
```
Framework: React 19
Build: Vite 5
State: Redux Toolkit
UI: Tailwind CSS 3.4
Form: React Hook Form
Charts: Recharts 2.10
Tables: TanStack React Table v8
PDF: jsPDF + html2pdf
Notifications: React Toastify
API Client: Axios with interceptors
```

### Infrastructure
```
Hosting: Google Cloud Run (serverless) or DigitalOcean App Platform
Database: Managed PostgreSQL (Cloud SQL or DigitalOcean)
Cache: Managed Redis
Load Balancer: Google Cloud Load Balancer
DNS: Cloudflare
CDN: Cloudflare (static assets + API cache)
CI/CD: GitHub Actions
Monitoring: Google Cloud Monitoring + Datadog
Backup: Automated daily snapshots to Cloud Storage
```

### Code Reuse from dnPeople/dnCore
| Module | Source | Reuse % | Details |
|--------|--------|---------|---------|
| Tax engine | dnPeople | 80% | PPN/PPh calc, withholding logic |
| Approval workflow | dnPeople | 70% | Email approval, state machine |
| Auth + RBAC | dnPeople | 90% | JWT, multi-tenant tenant isolation |
| Email service | dnPeople | 95% | Gmail API integration, templates |
| Audit logging | dnCore | 85% | Transaction log, change tracking |
| Database migration | dnCore | 80% | Terraform, schema management |
| Testing framework | dnCore | 75% | Jest setup, DB test fixtures |

---

## 3. ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend (React 19)                         │
│  Web App (dnAccounting.app) + Mobile Web (responsive)              │
└─────────────────────────────────────────┬───────────────────────────┘
                                          │
                    ┌─────────────────────▼──────────────────────┐
                    │   Cloudflare (CDN + DDoS + Cache)         │
                    └─────────────────────┬──────────────────────┘
                                          │
        ┌─────────────────────────────────▼──────────────────────────┐
        │    Google Cloud Load Balancer (Multi-region fallback)      │
        └─────────────────────────────────┬──────────────────────────┘
                                          │
    ┌─────────────────────────────────────▼──────────────────────────┐
    │         NestJS Backend (Stateless, horizontally scalable)      │
    │  ┌──────────────────────────────────────────────────────────┐ │
    │  │ API Routes:                                              │ │
    │  │  - /api/v1/auth (JWT, OAuth)                             │ │
    │  │  - /api/v1/accounts (COA, GL posting)                    │ │
    │  │  - /api/v1/invoices (AR management)                      │ │
    │  │  - /api/v1/bills (AP management)                         │ │
    │  │  - /api/v1/inventory (stock tracking)                    │ │
    │  │  - /api/v1/reports (P&L, balance sheet, tax)             │ │
    │  │  - /api/v1/approvals (workflow)                          │ │
    │  │  - /api/v1/admin (user, billing management)              │ │
    │  └──────────────────────────────────────────────────────────┘ │
    │  ┌──────────────────────────────────────────────────────────┐ │
    │  │ Core Services:                                           │ │
    │  │  - AccountService (GL posting, journal logic)            │ │
    │  │  - TaxService (PPN/PPh, e-Faktur)                        │ │
    │  │  - ApprovalService (workflow state machine)              │ │
    │  │  - ReportService (financial statements)                  │ │
    │  │  - NotificationService (email + webhooks)                │ │
    │  │  - InventoryService (stock valuation)                    │ │
    │  └──────────────────────────────────────────────────────────┘ │
    └──────────┬──────────────────────────────────────────────────────┘
               │
    ┌──────────┴────────────────────────────────────────────────────┐
    │                    PostgreSQL 15                              │
    │  ┌──────────────────────────────────────────────────────────┐ │
    │  │ Tenant Database:                                         │ │
    │  │  - tenants (multi-tenant isolation)                      │ │
    │  │  - users (auth, roles)                                   │ │
    │  │  - chart_of_accounts (GL structure)                      │ │
    │  │  - journal_entries (GL posting)                          │ │
    │  │  - invoices (AR)                                         │ │
    │  │  - bills (AP)                                            │ │
    │  │  - items (inventory master)                              │ │
    │  │  - stock_movements (inventory transactions)              │ │
    │  │  - approvals (workflow state)                            │ │
    │  │  - audit_logs (full audit trail)                         │ │
    │  └──────────────────────────────────────────────────────────┘ │
    └───────────┬────────────────────────────────────────────────────┘
                │
    ┌───────────┴──────────────────────────────────────────────────┐
    │              Supporting Infrastructure                        │
    │  ┌──────────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐  │
    │  │ Redis Cache  │  │ Bull Job │  │ Google  │  │ Datadog  │  │
    │  │ (sessions,   │  │ Queue    │  │ Cloud   │  │ (APM,    │  │
    │  │ GL balance)  │  │ (async   │  │ Storage │  │ logging) │  │
    │  │              │  │ tasks)   │  │ (PDF)   │  │          │  │
    │  └──────────────┘  └──────────┘  └─────────┘  └──────────┘  │
    └────────────────────────────────────────────────────────────────┘
```

---

## 4. DATABASE SCHEMA

### Core Tables

#### `tenants`
```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(50) NOT NULL, -- 'retail', 'fnb', 'jasa', 'trading', 'manufac_kecil'
    tier VARCHAR(50) NOT NULL DEFAULT 'starter', -- 'starter', 'growth', 'pro', 'plus', 'enterprise'
    max_users INT DEFAULT 1,
    max_revenue_idr BIGINT,
    subscription_status VARCHAR(20) DEFAULT 'active', -- 'active', 'trial', 'suspended', 'cancelled'
    billing_email VARCHAR(255),
    next_billing_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `users`
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL, -- 'admin', 'accountant', 'manager', 'viewer'
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);
```

#### `chart_of_accounts`
```sql
CREATE TABLE chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    account_code VARCHAR(50) NOT NULL, -- e.g., '1000', '1010'
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- 'asset', 'liability', 'equity', 'revenue', 'expense'
    parent_account_id UUID REFERENCES chart_of_accounts(id),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    is_header BOOLEAN DEFAULT false, -- for hierarchy
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, account_code)
);
CREATE INDEX idx_chart_of_accounts_tenant_type ON chart_of_accounts(tenant_id, account_type);
```

#### `journal_entries`
```sql
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    description VARCHAR(500),
    reference_id VARCHAR(100), -- e.g., 'INV-001' for invoice
    reference_type VARCHAR(50), -- 'invoice', 'bill', 'manual', 'expense'
    posted_by UUID REFERENCES users(id),
    posting_date TIMESTAMP,
    approval_status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'pending', 'approved', 'posted', 'rejected'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_journal_entries_tenant_date ON journal_entries(tenant_id, entry_date);
CREATE INDEX idx_journal_entries_status ON journal_entries(tenant_id, approval_status);
```

#### `journal_entry_lines`
```sql
CREATE TABLE journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    chart_account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
    debit DECIMAL(18,2) DEFAULT 0,
    credit DECIMAL(18,2) DEFAULT 0,
    description TEXT,
    line_order INT,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_journal_entry_lines_entry ON journal_entry_lines(journal_entry_id);
```

#### `invoices`
```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL,
    customer_id UUID REFERENCES customers(id),
    customer_name VARCHAR(255),
    invoice_date DATE NOT NULL,
    due_date DATE,
    total_amount DECIMAL(18,2),
    tax_amount DECIMAL(18,2),
    grand_total DECIMAL(18,2),
    currency VARCHAR(3) DEFAULT 'IDR',
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled'
    pv_pn_status VARCHAR(50), -- 'none', 'pv', 'pn', 'pv_pn'
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, invoice_number)
);
CREATE INDEX idx_invoices_tenant_date ON invoices(tenant_id, invoice_date);
CREATE INDEX idx_invoices_status ON invoices(tenant_id, status);
```

#### `invoice_line_items`
```sql
CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description VARCHAR(255),
    quantity DECIMAL(18,4),
    unit_price DECIMAL(18,2),
    line_total DECIMAL(18,2),
    tax_code VARCHAR(20), -- 'pv', 'pn', 'no_tax'
    line_order INT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### `invoice_payments`
```sql
CREATE TABLE invoice_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount_paid DECIMAL(18,2),
    payment_method VARCHAR(50), -- 'bank_transfer', 'cash', 'check', 'online', 'credit'
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### `bills`
```sql
CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    bill_number VARCHAR(50) NOT NULL,
    vendor_id UUID REFERENCES vendors(id),
    vendor_name VARCHAR(255),
    bill_date DATE NOT NULL,
    due_date DATE,
    total_amount DECIMAL(18,2),
    tax_amount DECIMAL(18,2),
    grand_total DECIMAL(18,2),
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'approved', 'paid', 'cancelled'
    approval_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    pph_23_amount DECIMAL(18,2), -- auto-calc if PPh 23 applicable
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, bill_number)
);
CREATE INDEX idx_bills_tenant_status ON bills(tenant_id, status);
```

#### `bill_approvals`
```sql
CREATE TABLE bill_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES users(id),
    approval_order INT, -- 1st, 2nd, 3rd level
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### `items` (Inventory Master)
```sql
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    item_code VARCHAR(50) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(20), -- 'pcs', 'kg', 'liter', etc
    unit_cost DECIMAL(18,2),
    reorder_level INT,
    current_stock INT,
    supplier_id UUID,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, item_code)
);
```

#### `stock_movements`
```sql
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id),
    movement_date DATE,
    movement_type VARCHAR(50), -- 'in', 'out', 'adjustment'
    quantity INT,
    reference_id VARCHAR(100), -- 'INV-001', 'PO-001', 'ADJ-001'
    reference_type VARCHAR(50), -- 'invoice', 'bill', 'manual', 'waste'
    unit_cost DECIMAL(18,2),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_stock_movements_item_date ON stock_movements(item_id, movement_date);
```

#### `approvals` (General Approval Workflow)
```sql
CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    reference_id VARCHAR(100), -- 'BILL-001', 'JE-001'
    reference_type VARCHAR(50), -- 'bill', 'journal_entry', 'expense'
    approver_id UUID NOT NULL REFERENCES users(id),
    approval_order INT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### `audit_logs`
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100), -- 'create_invoice', 'post_journal', 'approve_bill', etc
    entity_type VARCHAR(100), -- 'invoice', 'bill', 'journal_entry', etc
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    change_reason TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_tenant_entity ON audit_logs(tenant_id, entity_type, entity_id);
CREATE INDEX idx_audit_logs_date ON audit_logs(tenant_id, created_at);
```

#### `customers` & `vendors`
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    tax_id VARCHAR(50), -- NPWP
    is_pv_registered BOOLEAN DEFAULT false, -- untuk PPN
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, customer_name)
);

CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    vendor_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    tax_id VARCHAR(50), -- NPWP
    pph_23_applicable BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, vendor_name)
);
```

---

## 5. API DESIGN

### Authentication Endpoints
```
POST /api/v1/auth/register
  Body: { email, password, company_name, industry }
  Response: { user_id, tenant_id, token, expires_in }

POST /api/v1/auth/login
  Body: { email, password }
  Response: { token, expires_in, user }

POST /api/v1/auth/refresh
  Body: { refresh_token }
  Response: { token, expires_in }

POST /api/v1/auth/logout
  Headers: Authorization: Bearer <token>
  Response: { success: true }
```

### Chart of Accounts Endpoints
```
GET /api/v1/accounts?type=asset&is_active=true
  Response: { data: [...], total }

GET /api/v1/accounts/:id
  Response: { data: {...} }

POST /api/v1/accounts
  Body: { account_code, account_name, account_type, parent_account_id, description }
  Response: { id, ... } | { error }

PUT /api/v1/accounts/:id
  Body: { account_name, description, is_active }
  Response: { id, ... }

GET /api/v1/accounts/templates/:industry
  Response: { coa: [...] } -- pre-configured chart for industry

POST /api/v1/accounts/import
  Body: { file } -- Excel import
  Response: { imported_count, errors: [] }
```

### Journal Entry Endpoints
```
POST /api/v1/journal-entries
  Body: {
    entry_date,
    description,
    reference_id,
    lines: [
      { chart_account_id, debit, credit, description },
      ...
    ]
  }
  Response: { id, approval_status } | { error }

GET /api/v1/journal-entries?from_date=2024-01-01&to_date=2024-01-31
  Response: { data: [...], total }

GET /api/v1/journal-entries/:id
  Response: { id, lines: [...], approval_history: [...] }

PUT /api/v1/journal-entries/:id (DRAFT only)
  Body: { description, lines: [...] }
  Response: { id, ... }

DELETE /api/v1/journal-entries/:id (DRAFT only)
  Response: { success: true }

POST /api/v1/journal-entries/:id/submit-approval
  Response: { approval_status: 'pending' }

GET /api/v1/gl?account_code=1000&from_date=2024-01-01
  Response: { account: {...}, balance: 0, transactions: [...] }
```

### Invoice Endpoints
```
POST /api/v1/invoices
  Body: {
    customer_id,
    invoice_date,
    due_date,
    line_items: [
      { description, quantity, unit_price, tax_code },
      ...
    ]
  }
  Response: { invoice_number, id, grand_total }

GET /api/v1/invoices?status=pending&from_date=2024-01-01
  Response: { data: [...], total, aging: {...} }

GET /api/v1/invoices/:id
  Response: { ...invoice, payments: [...] }

PUT /api/v1/invoices/:id (DRAFT only)
  Body: { customer_id, line_items, due_date }
  Response: { id, ... }

POST /api/v1/invoices/:id/send
  Response: { sent_to_email, sent_at }

POST /api/v1/invoices/:id/record-payment
  Body: { payment_date, amount_paid, payment_method }
  Response: { invoice_status, remaining_balance }

GET /api/v1/reports/ar-aging
  Response: { 0_30: {...}, 30_60: {...}, 60_plus: {...} }
```

### Bill Endpoints
```
POST /api/v1/bills
  Body: {
    vendor_id,
    bill_date,
    due_date,
    line_items: [{ description, quantity, unit_price }, ...],
    pph_23_applicable: true
  }
  Response: { bill_number, id, grand_total, pph_23_amount }

GET /api/v1/bills?status=pending&approval_status=pending
  Response: { data: [...], total }

GET /api/v1/bills/:id
  Response: { ...bill, approvals: [...] }

PUT /api/v1/bills/:id (DRAFT/REJECTED only)
  Body: { vendor_id, line_items, pph_23_applicable }
  Response: { id, ... }

POST /api/v1/bills/:id/submit-approval
  Body: { approvers_ids: [uid1, uid2] }
  Response: { approval_status: 'pending' }

POST /api/v1/approvals/:approval_id/approve
  Body: { approval_id, comments: "" }
  Response: { approval_status: 'approved', can_proceed: true/false }

POST /api/v1/approvals/:approval_id/reject
  Body: { rejection_reason }
  Response: { approval_status: 'rejected' }

GET /api/v1/reports/ap-aging
  Response: { 0_30: {...}, 30_60: {...}, 60_plus: {...} }
```

### Report Endpoints
```
GET /api/v1/reports/p-and-l?from_date=2024-01-01&to_date=2024-12-31&department=all
  Response: {
    revenue: 0,
    cogs: 0,
    gross_profit: 0,
    operating_expenses: 0,
    net_income: 0
  }

GET /api/v1/reports/balance-sheet?as_of_date=2024-12-31
  Response: {
    assets: [...],
    liabilities: [...],
    equity: [...],
    total_assets: 0
  }

GET /api/v1/reports/trial-balance?as_of_date=2024-12-31
  Response: { accounts: [...], total_debit: 0, total_credit: 0 }

GET /api/v1/reports/cash-flow?from_date=2024-01-01&to_date=2024-01-31
  Response: { receipts: 0, payments: 0, net_cf: 0 }

GET /api/v1/reports/tax-summary?month=1&year=2024
  Response: {
    pv_in: 0,
    pv_out: 0,
    pv_payable: 0,
    pph_23_withheld: 0,
    pph_23_payable: 0
  }

GET /api/v1/reports/export/:report_type?format=pdf&params=...
  Response: PDF file (Content-Type: application/pdf)

POST /api/v1/reports/schedule-email
  Body: { report_type, frequency, email_recipients, params }
  Response: { schedule_id, next_send }
```

### Inventory Endpoints
```
POST /api/v1/items
  Body: { item_code, item_name, category, unit, unit_cost, reorder_level }
  Response: { id, ... }

GET /api/v1/items?category=electronics&is_active=true
  Response: { data: [...], total }

GET /api/v1/items/:id
  Response: { ...item, current_stock, last_movement_date }

PUT /api/v1/items/:id
  Body: { item_name, unit_cost, reorder_level }
  Response: { id, ... }

POST /api/v1/stock-movements
  Body: { item_id, movement_date, movement_type, quantity, reference_id, unit_cost }
  Response: { id, new_stock_level }

GET /api/v1/reports/inventory-valuation
  Response: {
    items: [
      { item_code, item_name, quantity, unit_cost, total_value }
    ],
    total_inventory_value: 0
  }

GET /api/v1/reports/stock-aging
  Response: { items: [...] } -- items older than 90 days flagged
```

### Admin Endpoints
```
GET /api/v1/admin/users
  Response: { data: [...], total }

POST /api/v1/admin/users
  Body: { email, full_name, role }
  Response: { user_id, invitation_sent }

DELETE /api/v1/admin/users/:user_id
  Response: { success: true }

GET /api/v1/admin/billing
  Response: { tier, next_billing_date, card_last_4, usage: {...} }

PUT /api/v1/admin/billing/upgrade-tier
  Body: { new_tier }
  Response: { tier, prorated_amount }
```

---

## 6. SECURITY ARCHITECTURE

### Authentication & Authorization
- **JWT-based:** Issued on login, expires in 24h, refresh tokens valid 90 days
- **RBAC:** Admin (all), Accountant (GL posting + approval), Manager (approve bills + view), Viewer (read-only)
- **Multi-tenancy:** All queries include `WHERE tenant_id = ?` (database-level isolation)

### Data Encryption
- **In Transit:** TLS 1.3 for all API calls
- **At Rest:** Database encryption via Cloud SQL encryption
- **Passwords:** bcrypt with 12 rounds
- **Sensitive Data:** PII (NPWP, bank account) encrypted at-rest via libsodium

### API Rate Limiting
```
- 100 requests per minute per IP (global)
- 1000 requests per minute per authenticated user
- Burst allowance: 10 extra requests, then 429 Too Many Requests
- Stored in Redis, checked by middleware
```

### Audit Trail
- All GL posting, approvals, deletions logged to `audit_logs`
- Immutability: journal entries never deleted (only marked cancelled)
- Compliance: logs retained for 7 years (regulatory requirement)

### Sensitive Endpoints
- Approval email links: token-based, valid 24h, one-time use
- Invoice PDF export: signed URLs, 1-hour expiry
- Bank reconciliation: only admin can initiate
- User deletion: only by tenant admin, audit logged

---

## 7. PERFORMANCE & SCALING

### Database Optimization
| Operation | P50 | P95 | P99 | Strategy |
|-----------|-----|-----|-----|----------|
| GL posting | 50ms | 150ms | 500ms | Transaction, indexed by tenant_id + date |
| Report generation (1000 txns) | 200ms | 600ms | 2000ms | Cached in Redis, refresh every 5 min |
| Invoice list (100 results) | 100ms | 300ms | 800ms | Partial index on tenant_id + status |
| Journal query (full GL) | 150ms | 400ms | 1200ms | Partition by month if >1M rows |

### Caching Strategy
```
Redis:
- GL account balances: Cache for 5 minutes (update on each posting)
- User sessions: 24-hour TTL
- Report snapshots: 5-minute TTL (refresh on user request)
- Exchange rates (future): 1-day TTL
- CoA templates: 7-day TTL

Cloudflare Edge:
- Static assets (JS, CSS): 1 week
- API responses: 1-5 minutes (vary by endpoint)
- Login page: no cache (Cache-Control: no-store)
```

### Horizontal Scaling
- **Stateless Backend:** No session state in memory (all in Redis)
- **Load Balancer:** Google Cloud Load Balancer routes to 2-3 NestJS instances
- **Database:** Managed PostgreSQL with automatic failover, read replicas for heavy reports
- **Message Queue:** Bull (Redis-backed) for async tasks (email, PDF generation, reconciliation)

### Monitoring & Alerting
```
Datadog:
- Request latency (p50, p95, p99)
- Database query time
- Error rate (4xx, 5xx)
- Redis hit ratio
- Job queue depth (alert if >1000 pending)
- Disk usage

Alerts:
- 5xx error rate > 1% → page engineer
- API latency p95 > 1s → investigate
- Database CPU > 80% → scale up
- Queue depth > 5000 → restart workers
```

---

## 8. DEPLOYMENT & INFRASTRUCTURE

### Environment Configuration
```
Development:
  - Local PostgreSQL + Redis
  - NestJS dev server (auto-reload)
  - React dev server (Vite, port 3000)
  - Email: Mailhog (fake SMTP)

Staging:
  - Cloud SQL (dev instance)
  - Google Cloud Run (1 instance)
  - React build → Cloud Storage
  - Email: SendGrid sandbox

Production:
  - Cloud SQL (3 replicas, HA)
  - Cloud Run (3+ instances, auto-scale)
  - Cloudflare CDN
  - Daily backup to Cloud Storage
  - Monitoring: Datadog + Google Cloud Logging
```

### CI/CD Pipeline
```yaml
GitHub Actions:
  1. On PR:
     - Run linter (ESLint + Prettier)
     - Run tests (Jest, >80% coverage)
     - Build Docker image (no push)
     - Deploy preview to staging

  2. On merge to main:
     - Run full test suite
     - Build production Docker image
     - Push to Docker registry
     - Deploy to Cloud Run (prod)
     - Run smoke tests
     - Notify Slack

  3. Database migration:
     - TypeORM migration on each deploy
     - Backward compatibility check
     - Automatic rollback if migration fails
```

### Docker Image
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]

# Build: docker build -t dnaccounting:latest .
# Push: docker tag dnaccounting:latest gcr.io/project/dnaccounting:latest
#       docker push gcr.io/project/dnaccounting:latest
```

### Rollback Strategy
- Always keep previous version deployed (blue-green deployment)
- If production 5xx rate >5% for 5 min → auto-rollback
- Manual rollback available via GitHub release tags

---

## 9. INTEGRATION POINTS (Phase 2+)

### Bank Integration (OKE File Import)
```
API:
  POST /api/v1/integrations/bank/import-statement
    Body: { file, bank_code, account_number }
    Response: { transactions_imported: 150, matched: 145, unmatched: 5 }
    
  GET /api/v1/integrations/bank/unmatched-transactions
    Response: { transactions: [...], total }
    
  POST /api/v1/integrations/bank/reconcile
    Body: { bank_transactions: [...], gl_transactions: [...] }
    Response: { matched_pairs: [...], discrepancies: [...] }

Supported banks: BCA, Mandiri, BNI, Permata, CIMB, DBS (OKE format)
```

### Payment Gateway (Midtrans - Phase 2)
```
POST /api/v1/integrations/midtrans/create-payment-link
  Body: { invoice_id, customer_email, customer_phone }
  Response: { payment_url, transaction_id, expires_at }

Webhook: /webhook/midtrans/payment-notification
  Auto-record payment in invoice_payments table
  Auto-update invoice status to 'paid'
  Auto-post GL: (DR) Bank | (CR) AR
```

### e-Faktur Export (DJP Integration - Phase 2)
```
GET /api/v1/integrations/efaktur/export?month=1&year=2024
  Response: { csv_content, filename } -- SPT Masa PPN format
  
Manual export available in V1.0 (user downloads CSV, uploads to DJP portal)
```

---

## 10. CODE REUSE PLAN

### From dnPeople
```
├── auth/
│   ├── jwt.strategy.ts (90% reuse)
│   ├── roles.guard.ts (100% reuse)
│   └── tenant.interceptor.ts (95% reuse)
├── tax/
│   ├── pv-calculator.ts (85% reuse - adapt for AP)
│   ├── pph-23-calculator.ts (90% reuse)
│   └── efaktur-exporter.ts (70% reuse - adapt format)
├── email/
│   ├── email.service.ts (95% reuse)
│   ├── templates/ (50% reuse - new templates needed)
│   └── gmail.provider.ts (100% reuse)
├── approval/
│   ├── approval.service.ts (80% reuse - adapt for bills)
│   ├── approval-email.ts (75% reuse - new templates)
│   └── state-machine.ts (100% reuse)
└── audit/
    ├── audit.decorator.ts (95% reuse)
    └── audit-log.service.ts (100% reuse)
```

### From dnCore
```
├── database/
│   ├── migration.strategy.ts (95% reuse)
│   ├── connection.ts (100% reuse)
│   └── seeders/ (10% reuse - new seeds for accounting)
├── logger/
│   ├── winston.config.ts (100% reuse)
│   ├── log-transformer.ts (95% reuse)
│   └── datadog.integration.ts (100% reuse)
├── testing/
│   ├── test.database.ts (95% reuse)
│   ├── fixtures.ts (30% reuse - new fixtures for accounting)
│   └── jest.config.ts (90% reuse)
└── infra/
    ├── google-cloud.config.ts (95% reuse)
    ├── terraform/ (70% reuse - adapt for dnAccounting resources)
    └── docker-compose.yml (90% reuse)
```

### New Code (40% of total)
- Accounting domain: GL posting logic, tax calculations specific to invoices
- Approval workflow: Bill-specific approval rules
- Reporting: Financial statement generation (P&L, balance sheet, CF)
- Inventory: Stock movement tracking
- React components: Forms, tables, reports for accounting features

---

## 11. TECH DECISION RATIONALE

### Why NestJS + React (not Next.js)?
- **Separation of concerns:** Backend fully decoupled from frontend (easier to scale independently)
- **Code reuse:** Can reuse backend from dnPeople + dnCore without Next.js overhead
- **API-first:** Forces clean API design, beneficial for mobile app later
- **Team skill:** Dozer already proficient in both

### Why PostgreSQL (not MongoDB)?
- **ACID transactions:** Critical for GL posting (must maintain debit=credit)
- **Relational model:** Perfect for accounting (invoices → GL posting → reports)
- **Strong typing:** SQL schema prevents data corruption
- **Cost:** Managed PostgreSQL cheaper than MongoDB at SME scale

### Why TypeORM (not Prisma)?
- **Existing codebase:** dnPeople + dnCore already use TypeORM
- **Decorators:** Aligns with NestJS architecture philosophy
- **Migration system:** Familiar, battle-tested

### Why Redis (not Memcached)?
- **Persistence:** Data survives server restart (useful for GL cache)
- **Data types:** Supports hash, set (useful for session management)
- **Pub/sub:** Can add real-time notifications later
- **Bull:** Redis-backed job queue (perfect for async accounting tasks)

---

**END OF SDD**

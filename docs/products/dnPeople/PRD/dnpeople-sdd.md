# dnPeople HRIS - Software Design Document (SDD)

**Version:** 3.0  
**Last Updated:** July 10, 2026  
**Status:** Active Development — MVP 1 core implemented in repo `dnpeople`  
**Architects:** DN Tech Engineering Team

> **Implementation architecture:** [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) · Status: [../docs/IMPLEMENTATION-STATUS.md](../docs/IMPLEMENTATION-STATUS.md) · Index: [../00_INDEX.md](../00_INDEX.md)

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Presentation Layer                       │
├──────────────────────┬──────────────────────┬──────────────────┤
│   Web App            │    Mobile App        │   Admin Portal   │
│   (Next.js 16)       │    (React)           │   (Next.js)      │
│   React 19           │    React Native*     │                  │
│   TypeScript          │                      │                  │
└──────────────────────┴──────────────────────┴──────────────────┘
                              ↓
          ┌────────────────────────────────────┐
          │      CDN (Cloudflare)              │
          │  - Static assets                   │
          │  - Images, CSS, JS                 │
          └────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         API Gateway                              │
│  - Rate limiting                                                 │
│  - Request validation                                            │
│  - CORS handling                                                 │
│  - Load balancing                                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Application Layer                             │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  Express.js  │   Services   │  Controllers │  Middleware Stack  │
│  (Backend)   │              │              │  - Auth            │
│  TypeScript  │  - HR        │  - Routes    │  - Validation      │
│  Node.js 20+ │  - Payroll   │  - Request   │  - Error Handling  │
│              │  - Attendance│    handling  │  - Logging         │
│              │  - Leave     │              │                    │
│              │  - Reporting │              │                    │
└──────────────┴──────────────┴──────────────┴────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Data Access Layer                           │
│  ORM: Prisma                                                     │
│  - Query builder                                                 │
│  - Migration management                                          │
│  - Type-safe queries                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Storage & Services                            │
├──────────────────┬──────────────────┬──────────────────────────┤
│  PostgreSQL      │  Redis Cache     │  External Services       │
│  - Employee data │  - Sessions      │  - SendGrid (email)      │
│  - Attendance    │  - Query cache   │  - DO Spaces (storage)   │
│  - Payroll       │  - Rate limits   │  - SMS/WhatsApp (future) │
│  - Reports       │                  │  - Bank APIs (future)    │
└──────────────────┴──────────────────┴──────────────────────────┘
```

### 1.2 Architecture Principles

1. **Layered Architecture:** Separation of concerns (presentation, business logic, data)
2. **RESTful API:** Standard HTTP methods, JSON payloads
3. **Stateless Services:** Horizontal scalability
4. **Database First:** Data model drives API design
5. **Security by Default:** Encryption, RBAC, audit trail
6. **Async Processing:** Background jobs for heavy operations
7. **Caching Strategy:** Redis for sessions & frequently accessed data
8. **Monitoring First:** Comprehensive logging & error tracking

---

## 2. Database Design

### 2.1 Schema Overview

**Core Tables:**
- companies
- users
- employees
- departments, positions, levels
- attendance_records
- leave_requests, leave_balances
- permissions
- salary_components, employee_salary_components
- payrolls, payroll_items
- payslips
- audit_logs
- approvals

**Supporting Tables:**
- employee_contacts
- employee_bank_accounts
- employee_tax_info
- employee_identifications
- employee_education
- employee_documents
- leave_types
- salary_components

### 2.2 Entity-Relationship Diagram (ERD)

```
companies (1) ──→ (M) users
    ↓
    ├→ (M) employees
    ├→ (M) departments
    ├→ (M) positions
    ├→ (M) levels
    ├→ (M) work_locations
    ├→ (M) salary_components
    ├→ (M) leave_types
    └→ (M) attendance_records

employees (1) ──→ (M) attendance_records
    ↓
    ├→ (1) department
    ├→ (1) position
    ├→ (1) level
    ├→ (1) manager (self-join)
    ├→ (M) employee_contacts
    ├→ (M) employee_bank_accounts
    ├→ (1) employee_tax_info
    ├→ (M) employee_identifications
    ├→ (M) employee_education
    ├→ (M) employee_documents
    ├→ (M) leave_requests
    ├→ (M) leave_balances
    ├→ (M) permissions
    ├→ (M) payrolls
    └→ (M) payslips

payrolls (1) ──→ (M) payroll_items
    └→ (M) payroll_deductions

approvals (1) ──→ (1) leave_requests (many-to-one on request_id)
```

### 2.3 Core Table Definitions

#### Table: companies
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  registration_number VARCHAR(100),
  logo_url VARCHAR(500),
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Indonesia',
  phone VARCHAR(20),
  email VARCHAR(255),
  npwp VARCHAR(15),
  siup VARCHAR(30),
  work_start_time TIME DEFAULT '09:00:00',
  work_end_time TIME DEFAULT '17:00:00',
  timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
  currency VARCHAR(3) DEFAULT 'IDR',
  fiscal_year_start INT DEFAULT 1,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  max_employees INT DEFAULT 10,
  employee_count INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  CONSTRAINT check_work_hours CHECK (work_start_time < work_end_time),
  UNIQUE(npwp),
  UNIQUE(email)
);

CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_created_at ON companies(created_at);
```

#### Table: users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) NOT NULL, -- super_admin, company_admin, manager, finance, employee
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP,
  login_count INT DEFAULT 0,
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  UNIQUE(email, company_id),
  UNIQUE(id, company_id)
);

CREATE INDEX idx_users_company_role ON users(company_id, role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
```

#### Table: employees
```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  employee_id VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, inactive, resigned
  employment_type VARCHAR(50) NOT NULL, -- permanent, contract, intern, probation
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  birth_date DATE,
  gender VARCHAR(10),
  marital_status VARCHAR(50),
  nationality VARCHAR(100) DEFAULT 'Indonesia',
  religion VARCHAR(50),
  photo_url VARCHAR(500),
  
  -- Organization
  department_id UUID REFERENCES departments(id),
  position_id UUID REFERENCES positions(id),
  manager_id UUID REFERENCES employees(id),
  level_id UUID REFERENCES levels(id),
  work_location_id UUID REFERENCES work_locations(id),
  cost_center VARCHAR(100),
  
  -- Dates
  employee_since_date DATE NOT NULL,
  contract_start_date DATE,
  contract_end_date DATE,
  probation_end_date DATE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  CONSTRAINT employee_id_unique UNIQUE(employee_id, company_id),
  CONSTRAINT valid_employment_dates CHECK (
    contract_start_date IS NULL OR contract_end_date IS NULL 
    OR contract_start_date <= contract_end_date
  )
);

CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_manager ON employees(manager_id);
CREATE INDEX idx_employees_employee_id ON employees(employee_id, company_id);
```

#### Table: attendance_records
```sql
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Clock in/out
  clock_in_time TIMESTAMP,
  clock_in_latitude DECIMAL(10, 8),
  clock_in_longitude DECIMAL(11, 8),
  clock_in_location VARCHAR(255),
  clock_in_device VARCHAR(50),
  
  clock_out_time TIMESTAMP,
  clock_out_latitude DECIMAL(10, 8),
  clock_out_longitude DECIMAL(11, 8),
  clock_out_location VARCHAR(255),
  clock_out_device VARCHAR(50),
  
  -- Calculated fields
  working_hours DECIMAL(5, 2),
  status VARCHAR(50) NOT NULL, -- present, late, absent, permitted, sick, leave
  notes TEXT,
  
  -- Correction tracking
  correction_submitted BOOLEAN DEFAULT FALSE,
  corrected_at TIMESTAMP,
  corrected_by_user_id UUID REFERENCES users(id),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_times CHECK (
    clock_in_time IS NULL OR clock_out_time IS NULL 
    OR clock_in_time <= clock_out_time
  ),
  CONSTRAINT valid_working_hours CHECK (working_hours >= 0 AND working_hours <= 24),
  UNIQUE(employee_id, date)
);

CREATE INDEX idx_attendance_company_date ON attendance_records(company_id, date);
CREATE INDEX idx_attendance_employee_date ON attendance_records(employee_id, date);
CREATE INDEX idx_attendance_status ON attendance_records(status);
```

#### Table: leave_requests
```sql
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_days DECIMAL(3, 1) NOT NULL,
  business_days DECIMAL(3, 1) NOT NULL,
  
  reason TEXT,
  attachment_url VARCHAR(500),
  replacement_employee_id UUID REFERENCES employees(id),
  
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, rejected, cancelled
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  approved_by_user_id UUID REFERENCES users(id),
  approval_reason TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_dates CHECK (start_date <= end_date),
  CONSTRAINT positive_duration CHECK (duration_days > 0 AND business_days > 0)
);

CREATE INDEX idx_leave_company_employee ON leave_requests(company_id, employee_id);
CREATE INDEX idx_leave_date_range ON leave_requests(start_date, end_date);
CREATE INDEX idx_leave_status ON leave_requests(status);
CREATE INDEX idx_leave_requested_at ON leave_requests(requested_at);
```

#### Table: leave_balances
```sql
CREATE TABLE leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  year INT NOT NULL,
  
  allocated INT NOT NULL,
  used INT DEFAULT 0,
  carry_forward INT DEFAULT 0,
  remaining INT GENERATED ALWAYS AS (allocated + carry_forward - used) STORED,
  
  expiry_date DATE,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT positive_allocated CHECK (allocated >= 0),
  CONSTRAINT non_negative_carry CHECK (carry_forward >= 0),
  UNIQUE(employee_id, leave_type_id, year)
);

CREATE INDEX idx_leave_balance_employee_year ON leave_balances(employee_id, year);
```

#### Table: payrolls
```sql
CREATE TABLE payrolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  
  period_year INT NOT NULL,
  period_month INT NOT NULL,
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,
  
  gross_income DECIMAL(15, 2) NOT NULL DEFAULT 0,
  total_deductions DECIMAL(15, 2) NOT NULL DEFAULT 0,
  net_salary DECIMAL(15, 2) NOT NULL DEFAULT 0,
  
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, finalized, paid, cancelled
  finalized_at TIMESTAMP,
  finalized_by_user_id UUID REFERENCES users(id),
  paid_at TIMESTAMP,
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_amounts CHECK (
    gross_income >= 0 
    AND total_deductions >= 0 
    AND net_salary >= 0 
    AND gross_income - total_deductions = net_salary
  ),
  CONSTRAINT valid_period CHECK (period_month >= 1 AND period_month <= 12),
  CONSTRAINT valid_dates CHECK (period_start_date <= period_end_date),
  UNIQUE(employee_id, period_year, period_month)
);

CREATE INDEX idx_payroll_company_period ON payrolls(company_id, period_year, period_month);
CREATE INDEX idx_payroll_status ON payrolls(status);
```

#### Table: payroll_items
```sql
CREATE TABLE payroll_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_id UUID NOT NULL REFERENCES payrolls(id) ON DELETE CASCADE,
  salary_component_id UUID NOT NULL REFERENCES salary_components(id),
  
  component_name VARCHAR(255) NOT NULL,
  component_type VARCHAR(50) NOT NULL, -- earning, deduction
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT non_negative_amount CHECK (amount >= 0)
);

CREATE INDEX idx_payroll_items_payroll ON payroll_items(payroll_id);
CREATE INDEX idx_payroll_items_component_type ON payroll_items(component_type);
```

#### Table: audit_logs
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  user_id UUID REFERENCES users(id),
  entity_type VARCHAR(100) NOT NULL, -- employee, attendance, leave, payroll, etc
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- CREATE, READ, UPDATE, DELETE
  
  old_values JSONB,
  new_values JSONB,
  
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_action CHECK (action IN ('CREATE', 'READ', 'UPDATE', 'DELETE'))
);

CREATE INDEX idx_audit_company ON audit_logs(company_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);
```

### 2.4 Indexing Strategy

**Indexes to Create:**

```sql
-- Attendance performance
CREATE INDEX idx_attendance_company_date_status 
  ON attendance_records(company_id, date DESC, status);

CREATE INDEX idx_attendance_employee_month_year 
  ON attendance_records(employee_id, EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date));

-- Leave performance
CREATE INDEX idx_leave_employee_status_period 
  ON leave_requests(employee_id, status, EXTRACT(YEAR FROM start_date));

-- Payroll performance
CREATE INDEX idx_payroll_employee_status 
  ON payrolls(employee_id, status);

CREATE INDEX idx_payroll_period_status 
  ON payrolls(period_year, period_month, status);

-- Audit trail
CREATE INDEX idx_audit_user_entity 
  ON audit_logs(user_id, entity_type);

-- Full-text search (future)
CREATE INDEX idx_employees_search 
  ON employees USING GIN(to_tsvector('indonesian', first_name || ' ' || last_name));
```

### 2.5 Partitioning Strategy

**For Large Tables (future scaling):**

```sql
-- Partition attendance_records by date range (monthly)
ALTER TABLE attendance_records 
  PARTITION BY RANGE (date)
  PARTITION p202601 VALUES LESS THAN ('2026-02-01'),
  PARTITION p202602 VALUES LESS THAN ('2026-03-01'),
  -- ... monthly partitions
  PARTITION p_future VALUES LESS THAN (MAXVALUE);

-- Partition audit_logs by date range (yearly)
ALTER TABLE audit_logs 
  PARTITION BY RANGE (EXTRACT(YEAR FROM created_at))
  PARTITION p2024 VALUES LESS THAN (2025),
  PARTITION p2025 VALUES LESS THAN (2026),
  PARTITION p2026 VALUES LESS THAN (2027),
  PARTITION p_future VALUES LESS THAN (MAXVALUE);
```

### 2.6 Data Encryption Strategy

**Fields to Encrypt (at application level + database):**

```
# Sensitive Fields (AES-256 encryption)
- employees.npwp
- employee_bank_accounts.account_number
- employee_identifications.number
- employee_tax_info.npwp
- employee_documents.file_content (if stored in DB)

# Encryption Key Management
- Master key in AWS Secrets Manager / HashiCorp Vault
- Rotate keys annually
- Different keys per environment (dev/staging/prod)
```

**Implementation in Prisma:**

```typescript
// prisma/schema.prisma
model Employee {
  id String @id @default(cuid())
  // ... other fields
  
  // Encrypted fields use custom middleware
  npwp String? @map("npwp") // Application-level encryption
  
  @@map("employees")
}

// Middleware for encryption/decryption
const encryptionMiddleware = Prisma.defineMiddleware(async (params, next) => {
  if (params.model === 'Employee' && params.action === 'create') {
    if (params.args.data.npwp) {
      params.args.data.npwp = encrypt(params.args.data.npwp);
    }
  }
  
  const result = await next(params);
  
  if (params.model === 'Employee' && (params.action === 'findUnique' || params.action === 'findMany')) {
    if (result.npwp) result.npwp = decrypt(result.npwp);
  }
  
  return result;
});
```

---

## 3. API Design

### 3.1 API Versioning

```
Base URL: https://api.dnpeople.id/v1

Endpoints follow REST conventions:
- GET /api/v1/resource → List
- GET /api/v1/resource/:id → Get single
- POST /api/v1/resource → Create
- PATCH /api/v1/resource/:id → Update
- DELETE /api/v1/resource/:id → Delete

API versioning for breaking changes (v2, v3, etc)
Deprecation headers for old versions
```

### 3.2 Authentication & Authorization

#### Authentication Flow (JWT)

```
1. User login
   POST /api/v1/auth/login
   Request: { email, password }
   Response: { accessToken, refreshToken, expiresIn }

2. Access token (1 hour expiry)
   Header: Authorization: Bearer {accessToken}
   Used for API requests

3. Refresh token (7 days expiry)
   POST /api/v1/auth/refresh
   Request: { refreshToken }
   Response: { accessToken, expiresIn }

4. Logout
   POST /api/v1/auth/logout
   Revokes refresh token
```

#### Authorization Checks

```
// Every endpoint implements RBAC
app.get('/api/v1/employees/:id', 
  authMiddleware,
  rbacMiddleware(['company_admin', 'manager', 'hr']),
  dataAccessMiddleware('employee'),
  employeeController.getEmployee
);

// dataAccessMiddleware enforces:
// - company_admin: sees all employees
// - manager: sees only own department + team
// - employee: sees only self
// - finance: sees all employees (limited fields)
```

### 3.3 Core API Endpoints

#### Authentication Endpoints

```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
POST /api/v1/auth/verify-email
GET /api/v1/auth/me (current user)
PATCH /api/v1/auth/change-password
```

#### Employee Management

```
GET /api/v1/employees (list with pagination/filters)
GET /api/v1/employees/:id (single employee)
POST /api/v1/employees (create)
PATCH /api/v1/employees/:id (update)
DELETE /api/v1/employees/:id (soft delete)
POST /api/v1/employees/:id/documents (upload doc)
GET /api/v1/employees/:id/documents (list docs)
PATCH /api/v1/employees/:id/status (change status)
GET /api/v1/employees/:id/audit-trail (history)
POST /api/v1/employees/bulk-import (CSV)
GET /api/v1/employees/export (Excel)
```

#### Attendance

```
POST /api/v1/attendance/clock-in
POST /api/v1/attendance/clock-out
GET /api/v1/attendance/today
GET /api/v1/attendance/:date (specific date)
GET /api/v1/attendance/history?startDate=&endDate= (range)
GET /api/v1/attendance/:employeeId/summary (monthly)
POST /api/v1/attendance/:id/correction (request correction)
GET /api/v1/attendance/corrections (pending)
PATCH /api/v1/attendance/corrections/:id/approve
PATCH /api/v1/attendance/corrections/:id/reject
GET /api/v1/attendance/report (with filters)
GET /api/v1/attendance/export (Excel/PDF)
```

#### Leave Management

```
GET /api/v1/leave-types (list types)
GET /api/v1/leave-balances/:employeeId (current balance)
POST /api/v1/leave-requests (submit request)
GET /api/v1/leave-requests (list for user)
GET /api/v1/leave-requests/:id (single request)
PATCH /api/v1/leave-requests/:id (update pending)
DELETE /api/v1/leave-requests/:id (cancel)
GET /api/v1/leave-requests/:employeeId/history (past requests)
GET /api/v1/approvals/pending?type=leave (for manager)
PATCH /api/v1/approvals/:id/approve
PATCH /api/v1/approvals/:id/reject
GET /api/v1/leave/calendar (team calendar)
GET /api/v1/leave/report (with filters)
```

#### Permissions

```
POST /api/v1/permissions (submit permission)
GET /api/v1/permissions (list pending - for manager)
GET /api/v1/permissions/:employeeId/history
PATCH /api/v1/permissions/:id/approve
PATCH /api/v1/permissions/:id/reject
GET /api/v1/permissions/report
```

#### Payroll

```
POST /api/v1/salary-components (create component)
GET /api/v1/salary-components (list)
PATCH /api/v1/salary-components/:id
POST /api/v1/employees/:id/salary-components (assign component)
GET /api/v1/payrolls (list by period)
GET /api/v1/payrolls/:id (single payroll)
POST /api/v1/payrolls/calculate-period (calculate all employees)
POST /api/v1/payrolls/:id/preview (preview before finalize)
POST /api/v1/payrolls/:id/finalize
POST /api/v1/payrolls/:id/undo
PATCH /api/v1/payrolls/:id/items/:itemId (modify line item)
GET /api/v1/payslips (list for employee)
GET /api/v1/payslips/:id (single payslip)
GET /api/v1/payslips/:id/pdf (download PDF)
POST /api/v1/payslips/:id/send (email delivery)
GET /api/v1/payroll-config (current configuration)
PATCH /api/v1/payroll-config (update rates, tax, etc)
```

#### Reports & Dashboard

```
GET /api/v1/dashboard/summary
GET /api/v1/dashboard/attendance-today
GET /api/v1/dashboard/pending-approvals
GET /api/v1/reports/attendance (with filters)
GET /api/v1/reports/payroll
GET /api/v1/reports/leave
GET /api/v1/reports/resignation
GET /api/v1/reports/export?type=&format=
```

### 3.4 Error Codes & Response Format

**Standard Error Codes:**

```json
{
  "ERR_INVALID_CREDENTIALS": 401,
  "ERR_INSUFFICIENT_PERMISSION": 403,
  "ERR_NOT_FOUND": 404,
  "ERR_DUPLICATE_RECORD": 409,
  "ERR_VALIDATION_FAILED": 422,
  "ERR_LEAVE_BALANCE_INSUFFICIENT": 422,
  "ERR_PAYROLL_ALREADY_FINALIZED": 409,
  "ERR_APPROVAL_ALREADY_PROCESSED": 409,
  "ERR_INTERNAL_SERVER_ERROR": 500,
  "ERR_SERVICE_UNAVAILABLE": 503
}
```

**Error Response Format:**

```json
{
  "success": false,
  "error": {
    "code": "ERR_LEAVE_BALANCE_INSUFFICIENT",
    "message": "Insufficient leave balance for this request",
    "details": {
      "requested_days": 5,
      "available_balance": 3,
      "leave_type": "annual"
    },
    "timestamp": "2026-07-09T10:30:00Z",
    "request_id": "req_abc123xyz"
  }
}
```

---

## 4. Backend Architecture

### 4.1 Project Structure

```
src/
├── config/               # Configuration files
│   ├── database.ts
│   ├── auth.ts
│   ├── email.ts
│   └── storage.ts
│
├── controllers/          # Request handlers
│   ├── authController.ts
│   ├── employeeController.ts
│   ├── attendanceController.ts
│   ├── leaveController.ts
│   ├── payrollController.ts
│   └── reportController.ts
│
├── services/            # Business logic
│   ├── authService.ts
│   ├── employeeService.ts
│   ├── attendanceService.ts
│   ├── leaveService.ts
│   ├── payrollService.ts
│   ├── approvalService.ts
│   └── reportService.ts
│
├── middleware/          # Express middleware
│   ├── authMiddleware.ts
│   ├── rbacMiddleware.ts
│   ├── dataAccessMiddleware.ts
│   ├── validationMiddleware.ts
│   ├── errorHandler.ts
│   └── requestLogger.ts
│
├── routes/              # Route definitions
│   ├── auth.routes.ts
│   ├── employee.routes.ts
│   ├── attendance.routes.ts
│   ├── leave.routes.ts
│   ├── payroll.routes.ts
│   ├── report.routes.ts
│   └── index.ts
│
├── utils/               # Utility functions
│   ├── encryption.ts    # AES-256 encryption/decryption
│   ├── validation.ts    # Data validation
│   ├── formatter.ts     # Response formatting
│   ├── calculator.ts    # Payroll calculations
│   └── logger.ts        # Logging
│
├── types/               # TypeScript types
│   ├── index.ts
│   ├── auth.types.ts
│   ├── employee.types.ts
│   ├── payroll.types.ts
│   └── api.types.ts
│
├── jobs/                # Background jobs
│   ├── payrollJob.ts    # Monthly payroll
│   ├── reminderJob.ts   # Reminders
│   └── reportJob.ts     # Report generation
│
├── prisma/
│   ├── schema.prisma    # Data model
│   └── migrations/      # DB migrations
│
├── tests/               # Unit/Integration tests
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
└── app.ts              # Express app setup
```

### 4.2 Key Services

#### PayrollService (Payroll Calculation Engine)

```typescript
// src/services/payrollService.ts

class PayrollService {
  
  // Main calculation function
  async calculatePayroll(
    companyId: string,
    periodYear: number,
    periodMonth: number,
    employeeIds?: string[]
  ): Promise<PayrollResult[]> {
    // 1. Get period dates
    const { startDate, endDate } = this.getPeriodDates(periodYear, periodMonth);
    
    // 2. Get employees (all or filtered)
    const employees = await this.getActiveEmployees(companyId, employeeIds);
    
    // 3. Calculate for each employee
    const results: PayrollResult[] = [];
    for (const employee of employees) {
      const payroll = await this.calculateEmployeePayroll(
        employee,
        periodYear,
        periodMonth,
        startDate,
        endDate
      );
      results.push(payroll);
    }
    
    return results;
  }
  
  // Individual employee payroll
  async calculateEmployeePayroll(
    employee: Employee,
    periodYear: number,
    periodMonth: number,
    startDate: Date,
    endDate: Date
  ): Promise<Payroll> {
    // 1. Get components
    const components = await this.getEmployeeComponents(employee.id);
    
    // 2. Calculate earnings
    const earnings = {
      basic: components.find(c => c.name === 'Basic Salary')?.amount || 0,
      allowances: this.calculateAllowances(components),
      overtime: await this.getOvertimeAmount(employee.id, startDate, endDate),
      bonus: await this.getBonusAmount(employee.id, periodYear, periodMonth),
    };
    
    const grossIncome = Object.values(earnings).reduce((a, b) => a + b, 0);
    
    // 3. Calculate BPJS
    const bpjs = {
      kesehatan_employee: this.calculateBPJSKesehatan(
        grossIncome,
        employee.bpjs_family_count
      ),
      ketenagakerjaan_employee: this.calculateBPJSKetenagakerjaan(grossIncome),
    };
    
    // 4. Calculate PPh 21
    const taxableIncome = grossIncome - bpjs.kesehatan_employee - bpjs.ketenagakerjaan_employee;
    const pph21 = this.calculatePPh21(taxableIncome, employee.ptkp_status);
    
    // 5. Other deductions
    const loanDeduction = await this.getActiveLoanDeduction(employee.id);
    const otherDeductions = await this.getOtherDeductions(employee.id, periodYear, periodMonth);
    
    // 6. Net salary
    const totalDeductions = 
      bpjs.kesehatan_employee + 
      bpjs.ketenagakerjaan_employee + 
      pph21 + 
      loanDeduction + 
      otherDeductions;
    
    const netSalary = grossIncome - totalDeductions;
    
    // 7. Save payroll
    return await prisma.payroll.create({
      data: {
        company_id: employee.company_id,
        employee_id: employee.id,
        period_year: periodYear,
        period_month: periodMonth,
        period_start_date: startDate,
        period_end_date: endDate,
        gross_income: grossIncome,
        total_deductions: totalDeductions,
        net_salary: netSalary,
        status: 'DRAFT',
        payroll_items: {
          createMany: {
            data: this.createPayrollItems(components, earnings, bpjs, pph21)
          }
        }
      }
    });
  }
  
  // PPh 21 Calculation (Indonesian tax)
  calculatePPh21(
    taxableIncome: number,
    ptkpStatus: string
  ): number {
    // PTKP values
    const ptkpValues = {
      'TK/0': 0,
      'TK/1': 54_450_000,
      'K/0': 63_000_000,
      'K/1': 67_500_000,
      'K/3': 81_000_000,
    };
    
    const ptkp = ptkpValues[ptkpStatus] || 0;
    const nontaxableIncome = ptkp / 12; // Monthly
    
    let taxableAmount = Math.max(0, taxableIncome - nontaxableIncome);
    
    // Tax brackets (progressive)
    const brackets = [
      { limit: 50_000_000, rate: 0.05 },
      { limit: 250_000_000, rate: 0.15 },
      { limit: 500_000_000, rate: 0.25 },
      { limit: 1_000_000_000, rate: 0.30 },
      { limit: Infinity, rate: 0.35 },
    ];
    
    let tax = 0;
    let previousLimit = 0;
    
    for (const bracket of brackets) {
      if (taxableAmount <= previousLimit) break;
      
      const taxableInBracket = Math.min(
        taxableAmount,
        bracket.limit
      ) - previousLimit;
      
      tax += taxableInBracket * bracket.rate;
      previousLimit = bracket.limit;
    }
    
    return tax;
  }
}
```

#### AttendanceService

```typescript
class AttendanceService {
  
  async clockIn(
    employeeId: string,
    latitude?: number,
    longitude?: number,
    device: string = 'web'
  ): Promise<AttendanceRecord> {
    const employee = await this.getEmployee(employeeId);
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already clocked in
    const existing = await prisma.attendanceRecord.findUnique({
      where: {
        employee_id_date: {
          employee_id: employeeId,
          date: today
        }
      }
    });
    
    if (existing?.clock_in_time) {
      throw new Error('Already clocked in today');
    }
    
    // Get location if GPS provided
    let location = null;
    if (latitude && longitude) {
      location = await this.getAddressFromCoordinates(latitude, longitude);
    }
    
    // Calculate working hours (placeholder)
    const shiftEnd = employee.shift_end_time || '17:00';
    
    // Determine status
    const now = new Date();
    const shiftStart = employee.shift_start_time || '09:00';
    const [shiftHour, shiftMin] = shiftStart.split(':').map(Number);
    const shiftStartTime = new Date();
    shiftStartTime.setHours(shiftHour, shiftMin, 0);
    
    const isLate = now > new Date(shiftStartTime.getTime() + 5 * 60000); // 5 min tolerance
    
    return await prisma.attendanceRecord.upsert({
      where: {
        employee_id_date: { employee_id: employeeId, date: today }
      },
      create: {
        employee_id: employeeId,
        company_id: employee.company_id,
        date: today,
        clock_in_time: now,
        clock_in_latitude: latitude,
        clock_in_longitude: longitude,
        clock_in_location: location,
        clock_in_device: device,
        status: isLate ? 'LATE' : 'PRESENT'
      },
      update: {
        clock_in_time: now,
        clock_in_device: device,
        status: isLate ? 'LATE' : 'PRESENT'
      }
    });
  }
  
  async clockOut(employeeId: string): Promise<AttendanceRecord> {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    const record = await prisma.attendanceRecord.update({
      where: {
        employee_id_date: { employee_id: employeeId, date: today }
      },
      data: {
        clock_out_time: now,
        working_hours: this.calculateWorkingHours(
          new Date(record.clock_in_time),
          now
        )
      }
    });
    
    return record;
  }
}
```

### 4.3 Database Connection & ORM

**Prisma Setup:**

```typescript
// src/config/database.ts

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn']
    : ['error'],
  errorFormat: 'pretty',
});

// Middleware for encryption
prisma.$use(async (params, next) => {
  // Encrypt sensitive fields on write
  if (['employee', 'employeeContact'].includes(params.model)) {
    if (params.action === 'create' || params.action === 'update') {
      // Encrypt NPWP, bank account, etc
      if (params.args.data?.npwp) {
        params.args.data.npwp = encrypt(params.args.data.npwp);
      }
    }
    
    // Decrypt on read
    if (params.action === 'findUnique' || params.action === 'findMany') {
      const result = await next(params);
      if (result?.npwp) {
        result.npwp = decrypt(result.npwp);
      }
      return result;
    }
  }
  
  return next(params);
});
```

---

## 5. Frontend Architecture

### 5.1 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── MainLayout.tsx
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Table.tsx
│   │   ├── Modal.tsx
│   │   ├── Form.tsx
│   │   └── Loading.tsx
│   ├── employee/
│   │   ├── EmployeeList.tsx
│   │   ├── EmployeeForm.tsx
│   │   ├── EmployeeDetail.tsx
│   │   └── EmployeeImport.tsx
│   ├── attendance/
│   │   ├── ClockInButton.tsx
│   │   ├── AttendanceList.tsx
│   │   ├── AttendanceCorrection.tsx
│   │   └── AttendanceReport.tsx
│   ├── leave/
│   │   ├── LeaveBalance.tsx
│   │   ├── LeaveRequest.tsx
│   │   ├── LeaveApproval.tsx
│   │   └── LeaveCalendar.tsx
│   ├── payroll/
│   │   ├── PayrollSummary.tsx
│   │   ├── PayrollDetail.tsx
│   │   ├── PayslipView.tsx
│   │   └── PayrollCalculation.tsx
│   ├── dashboard/
│   │   ├── DashboardSummary.tsx
│   │   ├── AttendanceWidget.tsx
│   │   ├── LeaveWidget.tsx
│   │   └── PayrollWidget.tsx
│   └── report/
│       ├── ReportBuilder.tsx
│       ├── ReportList.tsx
│       └── ReportExport.tsx
│
├── pages/               # Next.js pages
│   ├── auth/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── dashboard.tsx
│   ├── employees/
│   │   ├── index.tsx
│   │   ├── [id].tsx
│   │   └── new.tsx
│   ├── attendance.tsx
│   ├── leave.tsx
│   ├── payroll.tsx
│   ├── reports.tsx
│   ├── settings.tsx
│   └── _app.tsx
│
├── hooks/               # Custom React hooks
│   ├── useAuth.ts
│   ├── useEmployee.ts
│   ├── useAttendance.ts
│   ├── useLeave.ts
│   ├── usePayroll.ts
│   └── usePagination.ts
│
├── utils/               # Utility functions
│   ├── api.ts          # API client
│   ├── auth.ts
│   ├── formatter.ts    # Date, currency formatting
│   ├── validation.ts
│   └── constants.ts
│
├── store/              # State management (Zustand/Redux)
│   ├── authStore.ts
│   ├── employeeStore.ts
│   ├── attendanceStore.ts
│   └── uiStore.ts
│
├── styles/             # Tailwind CSS
│   ├── globals.css
│   └── components.css
│
└── public/             # Static assets
    ├── images/
    └── icons/
```

### 5.2 State Management (Zustand)

```typescript
// src/store/authStore.ts
import create from 'zustand';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({
      user: null,
      isAuthenticated: false
    });
  },
  
  refreshToken: async () => {
    const token = localStorage.getItem('refreshToken');
    const response = await api.post('/auth/refresh', { refreshToken: token });
    localStorage.setItem('accessToken', response.accessToken);
  }
}));
```

### 5.3 API Client

```typescript
// src/utils/api.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  timeout: 10000,
});

// Add auth token to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken }
        );
        
        localStorage.setItem('accessToken', response.data.accessToken);
        apiClient.defaults.headers.common['Authorization'] = 
          `Bearer ${response.data.accessToken}`;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/auth/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 5.4 Custom Hooks

```typescript
// src/hooks/useEmployee.ts
import { useState, useEffect } from 'react';
import api from '@/utils/api';

export function useEmployee(employeeId?: string) {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!employeeId) return;
    
    (async () => {
      setLoading(true);
      try {
        const response = await api.get(`/employees/${employeeId}`);
        setEmployee(response.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [employeeId]);
  
  return { employee, loading, error };
}

export function useEmployeeList(params?: any) {
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0
  });
  const [loading, setLoading] = useState(false);
  
  const fetch = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get('/employees', {
        params: { page, limit: 50, ...params }
      });
      setEmployees(response.data.data);
      setPagination(response.data.pagination);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetch();
  }, [params]);
  
  return { employees, pagination, loading, fetch };
}
```

---

## 6. Deployment & DevOps

### 6.1 Docker Setup

**Dockerfile:**

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Install dumb-init (process manager)
RUN apk add --no-cache dumb-init

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node healthcheck.js

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/app.js"]
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: dnpeople
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: dnpeople
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dnpeople"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  api:
    build: .
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://dnpeople:${DB_PASSWORD}@postgres:5432/dnpeople
      REDIS_URL: redis://redis:6379
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - .:/app
      - /app/node_modules

  app:
    image: node:20-alpine
    working_dir: /app
    command: npm run dev:frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3000/api/v1
    ports:
      - "3001:3001"
    volumes:
      - ./frontend:/app

volumes:
  postgres_data:
```

### 6.2 CI/CD Pipeline (GitHub Actions)

**`.github/workflows/deploy.yml`:**

```yaml
name: Build & Deploy

on:
  push:
    branches: [main, staging, develop]
  pull_request:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: npm
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        if: always()

  build:
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'push'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: npm
      
      - name: Build
        run: npm run build
      
      - name: Build Docker image
        run: |
          docker build -t ghcr.io/${{ github.repository }}:${{ github.sha }} .
          docker build -t ghcr.io/${{ github.repository }}:latest .
      
      - name: Push Docker image
        run: |
          echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
          docker push ghcr.io/${{ github.repository }}:${{ github.sha }}
          docker push ghcr.io/${{ github.repository }}:latest

  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          script: |
            cd /app/dnpeople
            docker-compose pull
            docker-compose up -d
            docker-compose exec api npm run migrate
```

### 6.3 Environment Variables

```env
# Database
DATABASE_URL=postgresql://dnpeople:password@localhost:5432/dnpeople

# Redis
REDIS_URL=redis://localhost:6379

# Email
SENDGRID_API_KEY=sg_xxxx
SENDGRID_FROM=noreply@dnpeople.id

# Storage
DO_SPACES_KEY=xxxxx
DO_SPACES_SECRET=xxxxx
DO_SPACES_BUCKET=dnpeople
DO_SPACES_REGION=sgp1

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRY=3600
REFRESH_TOKEN_EXPIRY=604800

# Server
NODE_ENV=production
PORT=3000
API_BASE_URL=https://api.dnpeople.id
FRONTEND_URL=https://app.dnpeople.id

# Monitoring
SENTRY_DSN=https://xxxx
SENTRY_ENVIRONMENT=production
```

---

## 7. Security Architecture

### 7.1 Authentication Flow

```
1. User → Login endpoint (email, password)
2. Server validates credentials
3. Generate JWT access token (1 hour)
4. Generate refresh token (7 days)
5. Return tokens to client
6. Client stores in localStorage (or secure HttpOnly cookie)
7. Client sends access token in Authorization header
8. Server validates token + extracts claims
9. On expiry → refresh endpoint to get new access token
```

### 7.2 Data Encryption

```
# At-Rest Encryption
- PostgreSQL native encryption (pgcrypto extension)
- Sensitive fields: NPWP, bank account, salary data
- Key rotation: Annual, with versioning

# In-Transit Encryption
- TLS 1.3 for all API communication
- HSTS headers enabled
- CORS policy strict

# Field-Level Encryption
- AES-256-GCM for sensitive fields
- Application-level encryption before DB storage
- Decrypt on-read (transparent via middleware)
```

### 7.3 Access Control Matrix

| Role | Employee DB | Attendance | Leave | Payroll | Reports |
|------|-------------|-----------|-------|---------|---------|
| Super Admin | Full | Full | Full | Full | Full |
| Company Admin | Full | Full | Full | Full | Full |
| Manager | Own Dept | Own Dept | Approve Own Dept | Read Own Dept | Own Dept |
| Finance | Read | Read All | Read | Full | Full |
| Employee | Own Only | Own Only | Own + Approve Requests | View Own | - |

### 7.4 API Security

```
- Rate limiting: 100 req/minute per IP, 10 req/sec per user
- Request validation: JSON Schema validation on all inputs
- CSRF protection: CSRF tokens in forms
- XSS prevention: Content Security Policy headers
- SQL injection: Parameterized queries via Prisma ORM
- Input sanitization: DOMPurify for HTML inputs
```

---

## 8. Performance Optimization

### 8.1 Database Optimization

```sql
-- Query optimization: Add indexes strategically
ANALYZE attendance_records; -- Update query stats
EXPLAIN ANALYZE SELECT ... -- Analyze query plans

-- Connection pooling (PgBouncer)
max_connections = 200
min_pool_size = 10
max_pool_size = 50
reserve_pool_size = 5

-- Caching layer (Redis)
- Cache employee data (24 hours)
- Cache org structure (24 hours)
- Cache salary components (24 hours)
- Cache user permissions (1 hour)
```

### 8.2 API Performance

```
- Pagination: Always (max 1000 per page)
- Lazy loading: Load related data on-demand
- Batch operations: Support bulk operations (1000+ records)
- Query optimization: Use select to limit fields
- Response compression: gzip enabled

Example:
GET /api/employees?page=1&limit=50&select=id,name,position,department
```

### 8.3 Frontend Performance

```
- Code splitting: Route-based chunks
- Image optimization: Next.js Image component
- Lazy loading: React.lazy for components
- Memoization: useMemo, useCallback
- Virtual scrolling: For large lists
- SSR/SSG: Server-side rendering for SEO

Lighthouse targets:
- Performance: >90
- Accessibility: >95
- Best Practices: >90
- SEO: >95
```

---

## 9. Monitoring & Observability

### 9.1 Logging Strategy

```typescript
// src/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: 'logs/exceptions.log'
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### 9.2 Error Tracking (Sentry)

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request?.headers?.authorization) {
      delete event.request.headers.authorization;
    }
    return event;
  }
});
```

### 9.3 Metrics & Dashboards

```
Key metrics to monitor:
- API response time (p50, p95, p99)
- Database query time
- Error rate (5xx, 4xx)
- User authentication rate
- Payroll calculation time
- Report generation time
- System uptime
- CPU & Memory usage
- Database connection pool
```

---

## Appendix A: Database Initialization Script

```sql
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Initialize company
INSERT INTO companies (id, name, email, npwp, timezone)
VALUES (
  gen_random_uuid(),
  'DN Tech',
  'admin@dntech.id',
  '123456789012345',
  'Asia/Jakarta'
);

-- Initialize super admin user
INSERT INTO users (id, company_id, email, password_hash, role)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM companies WHERE name = 'DN Tech'),
  'admin@dnpeople.id',
  crypt('Securepassword123!', gen_salt('bf')),
  'super_admin'
);
```

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-06-01 | Initial SDD |
| 2.0 | 2025-01-15 | Added frontend architecture |
| 3.0 | 2026-07-09 | Complete redesign for dnPeople |

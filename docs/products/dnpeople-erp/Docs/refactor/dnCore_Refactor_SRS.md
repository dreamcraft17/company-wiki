# dnCore ERP — Software Requirements Specification (SRS)
## Tech Stack Refactoring: Express + Remix

**Document Version:** 1.0  
**Last Updated:** 22 Juli 2026  
**Status:** Implemented and validated  
**Audience:** QA, developers, product owner

---

## 1. Introduction

### 1.1 Purpose

This SRS details all functional and non-functional requirements for refactoring dnCore backend from NestJS to Express.js and frontend from Vite+React Router to Remix. Requirements are listed with acceptance criteria and test cases.

### 1.2 Scope

**In scope:**
- Backend API layer (NestJS → Express)
- Frontend routing & data layer (Vite+React Router → Remix)
- Database persistence (TypeORM, unchanged)
- Deployment runtime (PM2 + Nginx on VPS); Docker, Kubernetes, and AWS remain optional alternatives

**Out of scope:**
- Mobile app (React Native, on hold)
- Infrastructure redesign
- Feature additions
- Third-party integrations (adapters only)

### 1.3 Document organization

- **Section 2:** Functional requirements (by module)
- **Section 3:** Non-functional requirements (performance, security, etc.)
- **Section 4:** Test strategy & acceptance criteria
- **Section 5:** Glossary & abbreviations

---

## 2. Functional Requirements

### 2.1 Authentication module

#### REQ-AUTH-001: User login

**Description:**  
User logs in with email and password, receives JWT token + refresh token.

**Acceptance Criteria:**
- [ ] POST `/api/v1/auth/login` accepts `{ email, password }`
- [ ] Valid credentials return 200 with `{ token, refreshToken, expiresIn: 3600 }`
- [ ] Invalid email returns 400 "User not found"
- [ ] Invalid password returns 401 "Invalid credentials"
- [ ] Email/password fields validated (non-empty, email format)
- [ ] Token is signed with HS256, contains sub, email, tenantId, roles
- [ ] Refresh token stored server-side (Redis or DB)

**Test cases:**

| Test ID | Input | Expected | Pass |
|---|---|---|---|
| AUTH-001-1 | valid email, valid password | 200, token issued | ✓ |
| AUTH-001-2 | invalid email | 400, error message | ✓ |
| AUTH-001-3 | valid email, invalid password | 401, error message | ✓ |
| AUTH-001-4 | empty email field | 400, validation error | ✓ |
| AUTH-001-5 | email without @ | 400, validation error | ✓ |

**Implementation notes:**
- Endpoint: `src/routes/auth.routes.ts` → `src/handlers/auth/login.handler.ts`
- Service: `src/services/auth.service.ts` → `login(email, password)`
- Database: Query users table via TypeORM
- Validator: Zod schema `loginSchema`

---

#### REQ-AUTH-002: User logout

**Description:**  
User logs out, token invalidated.

**Acceptance Criteria:**
- [ ] POST `/api/v1/auth/logout` requires Authorization header (JWT)
- [ ] Invalidates refresh token (removes from Redis/DB)
- [ ] Returns 200 "Logout successful"
- [ ] Subsequent requests with same token return 401

**Test cases:**

| Test ID | Input | Expected |
|---|---|---|
| AUTH-002-1 | valid JWT in header | 200, token invalidated |
| AUTH-002-2 | invalid JWT in header | 401 |
| AUTH-002-3 | no Authorization header | 401 |

---

#### REQ-AUTH-003: Token refresh

**Description:**  
Client refreshes JWT using refresh token.

**Acceptance Criteria:**
- [ ] POST `/api/v1/auth/refresh` accepts `{ refreshToken }`
- [ ] Valid refresh token returns 200 with new `{ token, refreshToken, expiresIn }`
- [ ] Invalid/expired refresh token returns 401
- [ ] Old refresh token invalidated after new one issued

**Test cases:**

| Test ID | Input | Expected |
|---|---|---|
| AUTH-003-1 | valid refresh token | 200, new tokens |
| AUTH-003-2 | expired refresh token | 401, "Token expired" |
| AUTH-003-3 | invalid refresh token | 401, "Invalid token" |

---

#### REQ-AUTH-004: 2FA/TOTP verification

**Description:**  
Optional 2FA using TOTP (authenticator app).

**Acceptance Criteria:**
- [ ] POST `/api/v1/auth/2fa/verify` accepts `{ code }`
- [ ] Valid 6-digit TOTP code returns 200 "Verified"
- [ ] Invalid code returns 400 "Invalid code"
- [ ] Code valid for 30-second window only
- [ ] Code expires after single use (no replay)

**Test cases:**

| Test ID | Input | Expected |
|---|---|---|
| AUTH-004-1 | valid 6-digit code within window | 200 |
| AUTH-004-2 | valid code outside 60s window | 400 |
| AUTH-004-3 | reuse same valid code | 400 |
| AUTH-004-4 | invalid 5-digit code | 400 |

---

#### REQ-AUTH-005: Frontend authentication (Remix route)

**Description:**  
Login page in Remix with form submission, token storage.

**Acceptance Criteria:**
- [ ] GET `/login` renders login form (email, password fields)
- [ ] Form submits via HTML method="post" (no JS required)
- [ ] Action validates on server-side, stores token in HTTPOnly cookie + localStorage
- [ ] Successful login redirects to `/dashboard`
- [ ] Failed login shows error message, keeps user on page
- [ ] Logout clears token + invalidates backend

**Test cases (Cypress E2E):**

| Test ID | Steps | Expected |
|---|---|---|
| FE-AUTH-001 | Visit /login, fill email, fill password, click submit | Redirect to /dashboard |
| FE-AUTH-002 | Submit invalid email | Error message shown |
| FE-AUTH-003 | Submit form without JavaScript | Form still works (progressive enhancement) |
| FE-AUTH-004 | Login, click logout | Redirect to /login, token cleared |

---

### 2.2 Users module

#### REQ-USR-001: List users (paginated)

**Description:**  
Admin retrieves paginated, filterable list of users.

**Acceptance Criteria:**
- [ ] GET `/api/v1/users?page=1&limit=20&search=john&role=admin` returns 200
- [ ] Response includes `{ items: [], total, page, pages }`
- [ ] Filtering by name/email works (case-insensitive)
- [ ] Filtering by role works (exact match)
- [ ] Sorting by created_at, name available
- [ ] Requires admin role (RBAC check)
- [ ] Multi-tenant isolation (only users in tenant)

**Test cases:**

| Test ID | Query | Expected |
|---|---|---|
| USR-001-1 | No params (defaults) | 200, first 20 users |
| USR-001-2 | ?search=john | Users with name/email containing "john" |
| USR-001-3 | ?role=finance | Only users with finance role |
| USR-001-4 | ?page=5&limit=50 | Page 5, 50 items per page |
| USR-001-5 | No auth header | 401 |
| USR-001-6 | User role (non-admin) | 403 "Forbidden" |

---

#### REQ-USR-002: Create user

**Description:**  
Admin creates new user in tenant.

**Acceptance Criteria:**
- [ ] POST `/api/v1/users` accepts `{ email, name, password, roles }`
- [ ] Email must be unique within tenant (201 created)
- [ ] Password hashed before storage (bcryptjs)
- [ ] Roles array validated (must be in allowed list)
- [ ] Validation error returns 400 with field errors
- [ ] Requires admin role

**Test cases:**

| Test ID | Payload | Expected |
|---|---|---|
| USR-002-1 | valid email, name, password | 201, user created |
| USR-002-2 | duplicate email | 400, "Email already exists" |
| USR-002-3 | password < 8 chars | 400, "Password too short" |
| USR-002-4 | invalid role | 400, "Invalid role" |
| USR-002-5 | missing required field | 400, field validation error |

---

#### REQ-USR-003: Update user

**Description:**  
Admin updates user details.

**Acceptance Criteria:**
- [ ] PUT `/api/v1/users/:id` accepts `{ email, name, roles }`
- [ ] Email unique check (excluding current user)
- [ ] Audit trail recorded (who, when, what changed)
- [ ] 204 No Content on success
- [ ] User not found returns 404
- [ ] Requires admin role

**Test cases:**

| Test ID | Input | Expected |
|---|---|---|
| USR-003-1 | valid id, updated name | 204, user updated |
| USR-003-2 | invalid user id | 404 |
| USR-003-3 | email change to duplicate | 400 |
| USR-003-4 | change roles | Audit log created |

---

#### REQ-USR-004: Delete user

**Description:**  
Admin soft-deletes user.

**Acceptance Criteria:**
- [ ] DELETE `/api/v1/users/:id` returns 204
- [ ] User marked as deleted (is_active=false) not hard-deleted
- [ ] User no longer appears in list
- [ ] Cannot log in with deleted account
- [ ] Audit log recorded
- [ ] Requires admin role

**Test cases:**

| Test ID | Input | Expected |
|---|---|---|
| USR-004-1 | valid id | 204, user soft-deleted |
| USR-004-2 | invalid id | 404 |
| USR-004-3 | deleted user login attempt | 401 "User account inactive" |

---

#### REQ-USR-005: Frontend user CRUD (Remix routes)

**Description:**  
Admin manages users via web interface.

**Acceptance Criteria:**
- [ ] GET `/users` shows paginated table with search/filter
- [ ] GET `/users/:id` shows user detail + edit form
- [ ] POST form action creates user
- [ ] PUT form action updates user
- [ ] DELETE button soft-deletes user
- [ ] All forms work without JavaScript (progressive enhancement)
- [ ] Optimistic UI updates (show change before server confirms)

**Test cases (Cypress):**

| Test ID | Steps | Expected |
|---|---|---|
| FE-USR-001 | Visit /users, fill search, submit | Filtered list shows |
| FE-USR-002 | Click create button, fill form, submit | New user added, redirect to list |
| FE-USR-003 | Visit /users/:id, change name, submit | Form action updates user |
| FE-USR-004 | Click delete button | Modal confirms, user deleted |
| FE-USR-005 | Submit form without JavaScript | Form still works (progressive enhancement) |

---

### 2.3 Multi-tenancy

#### REQ-TENANT-001: Tenant isolation

**Description:**  
Each user operates within isolated tenant schema/context.

**Acceptance Criteria:**
- [ ] User from Tenant A cannot see data from Tenant B
- [ ] All queries filter by tenant_id
- [ ] POST requests auto-associate with current tenant
- [ ] Tenant extracted from JWT sub/tenantId
- [ ] Middleware enforces tenant context on protected routes

**Test cases:**

| Test ID | Scenario | Expected |
|---|---|---|
| TENANT-001-1 | User A queries /users in Tenant A | See only Tenant A users |
| TENANT-001-2 | User A tries to access Tenant B data | 403 "Forbidden" or empty |
| TENANT-001-3 | User switches tenant via token | Only new tenant data visible |

---

#### REQ-TENANT-002: Database schema per tenant

**Description:**  
Each tenant has isolated PostgreSQL schema.

**Acceptance Criteria:**
- [ ] Database schema `tenant_<uuid>` created per tenant
- [ ] Migrations run on each tenant schema
- [ ] Shared tables (users, tenants) in `public` schema
- [ ] Connection string includes schema name

**Test cases:**

| Test ID | Action | Expected |
|---|---|---|
| TENANT-002-1 | Create new tenant | New schema created, migrations run |
| TENANT-002-2 | Query user data in Tenant A | Only Tenant A schema tables queried |

---

### 2.4 Finance module

#### REQ-FIN-001: Journal entry CRUD

**Description:**  
Finance team creates, reads, updates, deletes journal entries.

**Acceptance Criteria:**
- [ ] POST `/api/v1/finance/entries` creates entry (debit/credit)
- [ ] Entry validation (must balance, valid accounts, amount > 0)
- [ ] Duplicates prevented (same amount, account, date)
- [ ] GET `/api/v1/finance/entries` lists with pagination
- [ ] Entries locked after posting (cannot edit/delete)
- [ ] Audit trail captures who, when, what

**Test cases:**

| Test ID | Input | Expected |
|---|---|---|
| FIN-001-1 | valid entry (balanced) | 201, entry created |
| FIN-001-2 | unbalanced entry (debit ≠ credit) | 400, "Entry must balance" |
| FIN-001-3 | invalid account id | 400, "Account not found" |
| FIN-001-4 | duplicate entry | Duplicate detection (optional, warn user) |
| FIN-001-5 | edit posted entry | 403, "Cannot modify posted entry" |

---

#### REQ-FIN-002: Financial reports

**Description:**  
Generate standard reports (income statement, balance sheet, trial balance).

**Acceptance Criteria:**
- [ ] GET `/api/v1/finance/reports/:type?from=date&to=date` returns report data
- [ ] Report types: income_statement, balance_sheet, trial_balance, cash_flow
- [ ] Date range filtering works
- [ ] Report cached (1 hour TTL)
- [ ] Cacheable by date range (e.g., report:income:2026-07-01:2026-07-31)

**Test cases:**

| Test ID | Query | Expected |
|---|---|---|
| FIN-002-1 | /reports/income_statement?from=2026-01-01&to=2026-07-31 | 200, report data |
| FIN-002-2 | /reports/balance_sheet | 200, current balance sheet |
| FIN-002-3 | repeated report query (within 1h) | Cached response (X-Cache: HIT) |

---

### 2.5 HR module

#### REQ-HR-001: Employee CRUD

**Description:**  
HR manages employee records.

**Acceptance Criteria:**
- [ ] POST `/api/v1/hr/employees` creates employee
- [ ] GET `/api/v1/hr/employees` lists (paginated, searchable)
- [ ] GET `/api/v1/hr/employees/:id` detail
- [ ] PUT `/api/v1/hr/employees/:id` updates
- [ ] DELETE `/api/v1/hr/employees/:id` soft-delete
- [ ] Sensitive fields (SSN, salary) access-controlled

**Test cases:** (Similar to USR module; omitted for brevity)

---

#### REQ-HR-002: Attendance tracking

**Description:**  
Employees log in/out, HR views attendance.

**Acceptance Criteria:**
- [ ] POST `/api/v1/hr/attendance/checkin` records entry
- [ ] POST `/api/v1/hr/attendance/checkout` records exit
- [ ] GET `/api/v1/hr/attendance?date=2026-07-22` lists day's attendance
- [ ] Validation: no duplicate check-in without check-out

**Test cases:**

| Test ID | Action | Expected |
|---|---|---|
| HR-002-1 | POST checkin | 201, timestamp recorded |
| HR-002-2 | POST checkout | 201, duration calculated |
| HR-002-3 | GET attendance for date | List with duration, hours |
| HR-002-4 | checkin without prior checkout | 400, "Please check out first" |

---

### 2.6 Inventory module

#### REQ-INV-001: Stock management

**Description:**  
Track inventory levels, SKUs, reorder points.

**Acceptance Criteria:**
- [ ] POST `/api/v1/inventory/items` creates item (SKU, name, quantity, reorder_point)
- [ ] GET `/api/v1/inventory/items` lists with low-stock flag
- [ ] PUT `/api/v1/inventory/items/:id/quantity` updates stock
- [ ] POST `/api/v1/inventory/items/:id/adjust` creates adjustment entry
- [ ] Prevents negative stock

**Test cases:**

| Test ID | Input | Expected |
|---|---|---|
| INV-001-1 | create item with qty | 201, item created |
| INV-001-2 | adjust qty (increase) | Qty updated, adjustment logged |
| INV-001-3 | adjust qty (negative) | 400, "Cannot go below 0" |
| INV-001-4 | qty below reorder point | Flag in list response |

---

### 2.7 Reporting module (custom dashboards)

#### REQ-REP-001: Custom report builder

**Description:**  
Users create custom reports via UI (no code).

**Acceptance Criteria:**
- [ ] POST `/api/v1/reporting/custom-reports` creates report (name, query, chart type)
- [ ] Query builder: select fields, filters, grouping, aggregation
- [ ] Chart types: bar, line, pie, table
- [ ] GET `/api/v1/reporting/custom-reports/:id/data` executes report
- [ ] Data cached (1 hour)
- [ ] Reports exportable (CSV, Excel)

**Test cases:**

| Test ID | Input | Expected |
|---|---|---|
| REP-001-1 | Create report with valid query | 201, report created |
| REP-001-2 | Execute report | 200, result data (chart-ready format) |
| REP-001-3 | Export report | CSV file downloaded |
| REP-001-4 | Invalid query (syntax error) | 400, error message |

---

### 2.8 Document management

#### REQ-DOC-001: Document upload

**Description:**  
Users upload business documents (invoices, receipts, contracts).

**Acceptance Criteria:**
- [ ] POST `/api/v1/documents` accepts multipart file + metadata
- [ ] File size limit: 50MB per file
- [ ] Allowed types: PDF, DOCX, XLSX, PNG, JPG
- [ ] Stores in S3 or local storage
- [ ] Generates preview/thumbnail
- [ ] Audit trail (who, when, file details)

**Test cases:**

| Test ID | File | Expected |
|---|---|---|
| DOC-001-1 | valid PDF, 5MB | 201, file stored, URL returned |
| DOC-001-2 | EXE file | 400, "File type not allowed" |
| DOC-001-3 | 100MB PDF | 413, "File too large" |
| DOC-001-4 | valid image | 201, thumbnail generated |

---

#### REQ-DOC-002: Document retrieval

**Description:**  
Users download/view uploaded documents.

**Acceptance Criteria:**
- [ ] GET `/api/v1/documents/:id` returns file (with correct MIME type)
- [ ] GET `/api/v1/documents/:id/preview` returns thumbnail
- [ ] Access control: user can only access own/shared documents
- [ ] Download tracked in audit log

**Test cases:**

| Test ID | Action | Expected |
|---|---|---|
| DOC-002-1 | GET own document | File downloaded, MIME type correct |
| DOC-002-2 | GET others' private document | 403 |
| DOC-002-3 | GET preview | Thumbnail image returned |

---

### 2.9 Audit & compliance

#### REQ-AUD-001: Audit trail

**Description:**  
All data mutations logged with user, timestamp, change details.

**Acceptance Criteria:**
- [ ] Audit table stores (user_id, entity, entity_id, action, before, after, timestamp)
- [ ] GET `/api/v1/audit?entity=users&entity_id=user-123` returns change history
- [ ] Admin-only access
- [ ] Records immutable (no edit/delete)
- [ ] Retention: 7 years minimum

**Test cases:**

| Test ID | Action | Expected |
|---|---|---|
| AUD-001-1 | User updates user record | Audit log entry created |
| AUD-001-2 | Query audit for specific entity | Change history returned |
| AUD-001-3 | Attempt to delete audit log | 403, "Cannot delete audit trail" |
| AUD-001-4 | Query audit without admin role | 403 |

---

#### REQ-AUD-002: GDPR compliance (data export, deletion)

**Description:**  
Users can request data export or deletion (Right to be Forgotten).

**Acceptance Criteria:**
- [ ] POST `/api/v1/compliance/export` queues data export job
- [ ] Export includes all user-related data (user, entries, documents, etc.)
- [ ] Generates ZIP file, email download link
- [ ] POST `/api/v1/compliance/delete-request` queues deletion
- [ ] Deletion soft-deletes (marks deleted, keeps audit trail)
- [ ] 30-day grace period before purge
- [ ] Admin approval required (optional per policy)

**Test cases:**

| Test ID | Action | Expected |
|---|---|---|
| AUD-002-1 | Request data export | Job queued, email sent with link in 24h |
| AUD-002-2 | Request account deletion | Deletion queued, grace period starts |
| AUD-002-3 | Cancel deletion request within grace | Request cancelled |
| AUD-002-4 | Login after grace expires | 401, "Account deleted" |

---

### 2.10 Integration & webhooks

#### REQ-INT-001: Third-party integrations

**Description:**  
Connect external services (Stripe, Shopify, integrations).

**Acceptance Criteria:**
- [ ] POST `/api/v1/integrations` registers integration (provider, api_key, config)
- [ ] API keys stored encrypted (SecureStore or encrypted DB column)
- [ ] GET `/api/v1/integrations/:id/status` checks health (test connection)
- [ ] PUT `/api/v1/integrations/:id` updates config
- [ ] POST `/api/v1/integrations/:id/sync` triggers sync job
- [ ] Sync result stored (last_sync_at, status, log)

**Test cases:**

| Test ID | Action | Expected |
|---|---|---|
| INT-001-1 | Register Stripe integration | 201, integration stored (key encrypted) |
| INT-001-2 | Check status | 200, "Connected" or error |
| INT-001-3 | Trigger sync | 202 (async), job queued |
| INT-001-4 | Invalid API key | 400, "Invalid credentials" |

---

### 2.11 Health & monitoring

#### REQ-MON-001: Health check endpoint

**Description:**  
K8s readiness/liveness probe endpoint.

**Acceptance Criteria:**
- [ ] GET `/api/v1/health` returns 200 when healthy
- [ ] Checks: database connectivity, Redis connectivity, RabbitMQ connectivity
- [ ] Response: `{ status: "healthy", checks: { db: "ok", redis: "ok", ... } }`
- [ ] Returns 503 if any critical service down
- [ ] No auth required

**Test cases:**

| Test ID | Condition | Expected |
|---|---|---|
| MON-001-1 | All services up | 200, all checks "ok" |
| MON-001-2 | DB down | 503, db check failed |
| MON-001-3 | Redis down | Degraded (503 or 200 with warning) |

---

#### REQ-MON-002: Metrics endpoint (Prometheus)

**Description:**  
Prometheus-compatible metrics export.

**Acceptance Criteria:**
- [ ] GET `/api/v1/metrics` returns text/plain Prometheus format
- [ ] Metrics: http_requests_total, http_request_duration_seconds, db_pool_connections
- [ ] Updated in real-time (no delay)
- [ ] No auth required
- [ ] Format: `metric_name{labels} value`

**Test cases:**

| Test ID | Query | Expected |
|---|---|---|
| MON-002-1 | GET /metrics | 200, valid Prometheus format |
| MON-002-2 | Parse metrics | All required metrics present |
| MON-002-3 | Repeat call | Updated counter values |

---

## 3. Non-Functional Requirements

### 3.1 Performance

#### NFR-PERF-001: API response time

**Requirement:**  
95th percentile API response time ≤ 500ms (p95), 99th percentile ≤ 1s (p99).

**Measurement:**
- Tool: k6 load test (10 concurrent users, 5 min duration)
- Metric: latency histogram (min, p50, p95, p99, max)
- Baseline: Compare NestJS vs Express (should be similar or faster)

**Acceptance:**
```
p50: <200ms ✓
p95: <500ms ✓
p99: <1000ms ✓
p100 (max): <2000ms ✓
```

---

#### NFR-PERF-002: Database query latency

**Requirement:**  
95% of queries complete within 50ms.

**Measurement:**
- Tool: pg_stat_statements + Prometheus
- Metric: per-query latency

**Acceptance:**
- p95 latency ≤ 50ms ✓
- No queries timeout (>5s) ✓
- No N+1 query patterns ✓

---

#### NFR-PERF-003: Frontend performance (Lighthouse)

**Requirement:**  
Remix frontend scores ≥85 on Lighthouse (desktop & mobile).

**Measurement:**
- Tool: Lighthouse CI
- Metrics: FCP, LCP, CLS, TTI

**Acceptance:**
```
Performance: ≥85
Accessibility: ≥90
Best Practices: ≥90
SEO: ≥90
```

---

#### NFR-PERF-004: Bundle size

**Requirement:**  
Frontend JavaScript bundle ≤200KB (gzipped).

**Measurement:**
- Tool: `npm run build`, webpack-bundle-analyzer

**Acceptance:**
- Vendor JS: ≤150KB gzip ✓
- App JS: ≤50KB gzip ✓
- Total initial load: ≤200KB ✓

---

### 3.2 Scalability

#### NFR-SCAL-001: Horizontal scalability

**Requirement:**  
Backend scales linearly with pod count (3→6 pods = ~2x throughput).

**Measurement:**
- Tool: k6 load test + Kubernetes HPA
- Metric: throughput (req/sec per pod)

**Acceptance:**
- Linear scaling up to 10 pods ✓
- No session state (stateless) ✓
- Database connection pool adequate ✓

---

#### NFR-SCAL-002: Database scalability

**Requirement:**  
Support up to 1,000 concurrent connections.

**Measurement:**
- Tool: pg_stat_activity + k6
- Metric: active connections, wait time

**Acceptance:**
- Max connections: ≤80% of max_connections ✓
- No connection pool exhaustion ✓
- Read replicas optional for >500 concurrent users ✓

---

### 3.3 Reliability

#### NFR-REL-001: Uptime SLA

**Requirement:**  
99.5% uptime (max 3.6 hours downtime per month).

**Measurement:**
- Tool: Datadog/Prometheus uptime monitoring
- Metric: health check success %

**Acceptance:**
- Uptime ≥99.5% ✓
- Graceful degradation when partial outage ✓
- Auto-recovery (no manual intervention) ✓

---

#### NFR-REL-002: Data integrity (RTO/RPO)

**Requirement:**  
Recovery time objective (RTO) ≤ 1 hour, Recovery point objective (RPO) = 0.

**Measurement:**
- Backup strategy: Daily full backup + WAL archiving
- Restore test: Monthly restore drill

**Acceptance:**
- Full backup completes in <30 min ✓
- Point-in-time restore: ≤15 min ✓
- Data loss: 0 (RPO=0) ✓
- Monthly restore test pass ✓

---

#### NFR-REL-003: Error handling

**Requirement:**  
95% of errors handled gracefully (no 500 crashes).

**Measurement:**
- Tool: Error tracking (Sentry optional)
- Metric: error rate, error type distribution

**Acceptance:**
- Unhandled 500 errors: <1% of requests ✓
- Validation errors (400): <5% of requests ✓
- Auth errors (401): <2% of requests ✓

---

### 3.4 Security

#### NFR-SEC-001: Authentication

**Requirement:**  
JWT tokens signed with HS256, 1-hour expiry.

**Acceptance Criteria:**
- [ ] Tokens signed server-side
- [ ] Token structure verified (sub, iat, exp, iss)
- [ ] Expired tokens rejected
- [ ] Refresh token flow working
- [ ] Token not accessible to JavaScript (HTTPOnly cookie option)

**Test:**
```bash
# Generate token, verify signature, test expiry
npm test -- --testNamePattern="JWT"
```

---

#### NFR-SEC-002: Authorization (RBAC)

**Requirement:**  
Role-based access control (admin, finance, hr, user).

**Acceptance Criteria:**
- [ ] Routes protected by role guard (middleware)
- [ ] Admin can CRUD all entities
- [ ] Finance can CRUD finance entries (not users)
- [ ] HR can CRUD HR records (not finance)
- [ ] User can only read own data
- [ ] Cross-tenant access denied (403)

**Test:**
```bash
npm test -- --testNamePattern="RBAC|authorization"
```

---

#### NFR-SEC-003: Data encryption

**Requirement:**  
Sensitive data encrypted (passwords, API keys, SSN).

**Acceptance Criteria:**
- [ ] Passwords: bcryptjs hash (salt rounds ≥10)
- [ ] API keys: encrypted at rest (AES-256 or similar)
- [ ] Transit: TLS 1.3 (HTTPS only)
- [ ] Database: PII columns encrypted (optional field-level)

**Test:**
```bash
# Check password hash in DB
SELECT password_hash FROM users LIMIT 1;
# Should be: $2a$10$... (bcryptjs format)

# Check API key encryption
SELECT api_key FROM integrations LIMIT 1;
# Should be: encrypted blob or wrapped value
```

---

#### NFR-SEC-004: SQL injection prevention

**Requirement:**  
No raw SQL (parameterized queries only).

**Acceptance Criteria:**
- [ ] All TypeORM queries use QueryBuilder or parameters
- [ ] No string concatenation in queries
- [ ] Input validation before DB query

**Test:**
```bash
# Code review: grep for "raw(" in src/
grep -r "typeorm.*raw" backend/src/ # Should be empty or justified

# Attempt SQL injection
POST /api/v1/users?search=john' OR '1'='1
# Should return safe error, not leak data
```

---

#### NFR-SEC-005: CORS & CSRF

**Requirement:**  
CORS restricted to allowed origins; CSRF tokens on forms.

**Acceptance Criteria:**
- [ ] CORS_ORIGIN env var restricts origins
- [ ] Remix automatically handles CSRF tokens on form actions
- [ ] OPTIONS preflight works
- [ ] Foreign origin requests rejected (403)

**Test:**
```bash
# Test CORS
curl -H "Origin: evil.com" http://api.example.com/api/v1/health
# Should return CORS error (no Access-Control-Allow-Origin)

# Test allowed origin
curl -H "Origin: https://example.com" http://api.example.com/api/v1/health
# Should include Access-Control-Allow-Origin header
```

---

#### NFR-SEC-006: Rate limiting

**Requirement:**  
Rate limit 100 req/min per IP (anonymous), 1000 req/min per user (authenticated).

**Acceptance Criteria:**
- [ ] Anonymous IP throttled after 100 reqs/min
- [ ] Auth user throttled after 1000 reqs/min
- [ ] Returns 429 "Too Many Requests" with Retry-After header
- [ ] Whitelist admin IPs (optional)

**Test:**
```bash
# Simulate 150 requests from same IP in 1 min
for i in {1..150}; do curl http://api.example.com/api/v1/health; done
# First 100: 200
# After 100: 429 (Too Many Requests)
```

---

### 3.5 Maintainability

#### NFR-MAINT-001: Code coverage

**Requirement:**  
≥70% statement coverage for backend (Jest).

**Measurement:**
```bash
npm test -- --coverage
```

**Acceptance:**
```
Statements: 70.5% ✓
Branches:   65.0% ✓
Functions:  68.0% ✓
Lines:      70.2% ✓
```

---

#### NFR-MAINT-002: TypeScript strict mode

**Requirement:**  
All TypeScript code compiled with strict mode.

**Acceptance Criteria:**
- [ ] tsconfig.json: `"strict": true`
- [ ] No `any` type without justification
- [ ] No implicit any
- [ ] Build succeeds with `npm run build`

**Test:**
```bash
npm run build # Should succeed with no type errors
grep -r "any" backend/src/ | grep -v "// @ts-ignore" | wc -l
# Should be close to 0 (or documented exceptions only)
```

---

#### NFR-MAINT-003: Code duplication

**Requirement:**  
<5% duplicate code (as measured by SonarQube or similar).

**Measurement:**
- Tool: ESLint, duplicate-code checker

**Acceptance:**
- No duplicated functions ✓
- Shared utilities extracted ✓
- DRY principle applied ✓

---

#### NFR-MAINT-004: Documentation

**Requirement:**  
README, API docs (Swagger/OpenAPI), architecture docs.

**Acceptance Criteria:**
- [ ] backend/README.md: setup, run, test, deploy instructions
- [ ] frontend/README.md: setup, run, test, build instructions
- [ ] POST `/api/v1/docs` (Swagger UI) auto-generated
- [ ] SDD (this document) up-to-date
- [ ] Code comments on non-obvious logic

**Test:**
```bash
# Check Swagger docs
curl http://localhost:3000/api/v1/docs
# Should return Swagger UI (HTML)

# Check README exists
ls backend/README.md frontend/README.md
# Both should exist
```

---

#### NFR-MAINT-005: Dependency management

**Requirement:**  
Keep dependencies up-to-date; security vulnerabilities patched within 30 days.

**Measurement:**
- Tool: Dependabot (GitHub), npm audit

**Acceptance:**
- [ ] `npm audit` returns no critical/high vulns
- [ ] Dependencies updated quarterly (minor/patch)
- [ ] Breaking changes (major) reviewed before update

**Test:**
```bash
npm audit
# Should output: "up to date" or only low/info vulns
```

---

### 3.6 Compatibility

#### NFR-COMPAT-001: Browser support

**Requirement:**  
Support modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+).

**Measurement:**
- Cypress test on real browsers
- BrowserStack optional

**Acceptance:**
- Login flow works on all supported browsers ✓
- Dashboard renders correctly ✓
- No console errors ✓

---

#### NFR-COMPAT-002: Mobile responsiveness

**Requirement:**  
Frontend responsive on mobile (360px width minimum).

**Measurement:**
- Cypress mobile viewport tests
- Lighthouse mobile score

**Acceptance:**
- Tables scrollable on 360px width ✓
- Navigation drawer works on mobile ✓
- Forms accessible on small screens ✓

---

## 4. Test Strategy & Acceptance Criteria

### 4.1 Test levels

| Level | Tool | Coverage | Pass Criteria |
|---|---|---|---|
| Unit | Jest + ts-jest | Individual functions | ≥70% statements |
| Integration | Supertest + Jest | API endpoints | All happy paths + edge cases |
| E2E | Cypress | User workflows | All critical flows (login, CRUD) |
| Load | k6 | Performance under load | p95 < 500ms, p99 < 1s |
| Security | OWASP checklist | Injection, auth, encryption | No critical vulns |

### 4.2 Test execution

**Backend tests:**
```bash
cd backend
npm install
npm test                 # Unit + integration (jest)
npm run test:coverage    # Coverage report
npm run test:e2e        # Cypress E2E (from frontend repo)
```

**Frontend tests:**
```bash
cd frontend
npm install
npm run test            # Component tests (if added)
npm run test:e2e        # Cypress E2E
```

**Load test:**
```bash
cd backend
npm run load-test       # k6 scripts
```

### 4.3 Go-live checklist

Before production deployment:

- [ ] Unit test coverage ≥70%
- [ ] E2E tests pass (Cypress)
- [ ] Load test results reviewed (p95 <500ms)
- [ ] Security audit (OWASP top 10)
- [ ] Code review (all PRs approved)
- [ ] Database migration tested (staging)
- [ ] Rollback plan documented & tested
- [ ] Monitoring/alerting configured (Prometheus, Grafana)
- [ ] Health check working (`/api/v1/health`)
- [ ] Smoke tests pass (staging → prod simulation)
- [ ] Team trained on new stack
- [ ] Documentation complete (PRD, SDD, SRS, runbook)

---

## 5. Glossary & Abbreviations

| Term | Definition |
|---|---|
| API | Application Programming Interface |
| RBAC | Role-Based Access Control |
| JWT | JSON Web Token |
| TOTP | Time-based One-Time Password |
| ORM | Object-Relational Mapping |
| GDPR | General Data Protection Regulation |
| OWASP | Open Web Application Security Project |
| TLS | Transport Layer Security |
| HTTPS | HTTP Secure |
| HTTPOnly | Cookie attribute preventing JS access |
| CSRF | Cross-Site Request Forgery |
| CORS | Cross-Origin Resource Sharing |
| RPO | Recovery Point Objective |
| RTO | Recovery Time Objective |
| p95/p99 | 95th/99th percentile |
| QPS | Queries Per Second |
| SLA | Service Level Agreement |
| SLO | Service Level Objective |
| E2E | End-to-End |
| K8s | Kubernetes |

---

## Appendix A: Backend Dependency List

```json
{
  "dependencies": {
    "express": "^5.0.0",
    "typescript": "^5.1.3",
    "typeorm": "^0.3.20",
    "pg": "^8.22.0",
    "ioredis": "^5.3.0",
    "amqplib": "^0.10.3",
    "@elastic/elasticsearch": "^8.11.0",
    "jsonwebtoken": "^9.1.0",
    "bcryptjs": "^2.4.3",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "compression": "^1.7.4",
    "express-rate-limit": "^7.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "zod": "^3.22.0",
    "nodemailer": "^6.9.0",
    "otplib": "^12.0.0",
    "bull": "^4.11.0",
    "axios": "^1.6.0",
    "winston": "^3.11.0",
    "prom-client": "^15.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/node": "^20.0.0",
    "@types/jest": "^29.0.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.0",
    "supertest": "^6.3.0",
    "@types/supertest": "^2.0.0"
  }
}
```

---

## Appendix B: Frontend Dependency List

```json
{
  "dependencies": {
    "@remix-run/node": "^2.4.0",
    "@remix-run/react": "^2.4.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "typescript": "^5.3.0",
    "@mui/material": "^9.1.0",
    "@mui/icons-material": "^9.1.0",
    "tailwindcss": "^4.3.0",
    "@tailwindcss/vite": "^4.3.0",
    "recharts": "^3.9.0",
    "react-hook-form": "^7.80.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "axios": "^1.18.0",
    "dayjs": "^1.11.0",
    "react-toastify": "^11.1.0",
    "i18next": "^23.7.0",
    "react-i18next": "^13.2.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@remix-run/dev": "^2.4.0",
    "cypress": "^15.18.0",
    "typescript": "^5.3.0"
  }
}
```

---

## Appendix C: Test command reference

```bash
# Backend
npm test                              # Run all tests
npm test -- --testNamePattern="AUTH"  # Run specific test suite
npm test -- --coverage               # Coverage report
npm run test:watch                    # Watch mode
npm run test:debug                    # Debug mode

# Frontend (E2E)
npm run test:e2e                      # Cypress open mode
npm run test:e2e:headless             # Cypress CI mode
npm run test:e2e -- --spec "cypress/e2e/auth.cy.ts"  # Specific test

# Load test
npm run load-test                     # k6 load test
npm run load-test -- --vus=50 --duration=10m  # Custom params

# All
npm run ci                            # Full CI pipeline (build, test, lint)
```

---

## Sign-off

| Role | Approval | Date | Comments |
|---|---|---|---|
| Tech Lead (Dozer) | ✓ | 22 Jul 2026 | Approved for implementation |
| QA Lead | — | — | Pending |
| Product Owner (Dozer) | ✓ | 22 Jul 2026 | Approved |

---

**End of SRS**

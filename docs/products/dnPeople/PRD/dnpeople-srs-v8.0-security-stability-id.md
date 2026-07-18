# dnPeople — SRS v8.0
## Security & Stability Requirements (Berdasarkan Audit)

**Versi:** 8.0  
**Tanggal:** 18 Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Status:** Siap untuk Development

---

## Part 1: Functional Requirements

### FR-SEC-001: Secure Payslip Download (Authenticated)

**ID:** FR-SEC-001  
**Priority:** P0 (Critical)  
**Acceptance Criteria:**

```
AC-1.1: Remove Public Upload Directory
  Given /uploads is currently express.static public directory
  When server starts
  Then /uploads endpoint TIDAK accessible tanpa authentication
  
  Test:
    GET /uploads/company_abc/payslips/file.pdf → 403 Forbidden

AC-1.2: Authenticate Payslip Download
  Given employee login ke system
  When employee click "Download Payslip"
  Then system:
    - Verify JWT token valid
    - Check employeeId matches request
    - Check payslip belongs to employee's company
    - Return PDF file
    
  Test:
    GET /api/v1/payroll/payslip/:id/download
    Headers: Authorization: Bearer {token}
    ✓ Status 200 + PDF file
    ✗ Payslip dari karyawan lain → 403 Forbidden
    ✗ Tanpa token → 401 Unauthorized

AC-1.3: Audit Log Download
  Given payslip downloaded
  When download completed
  Then system logs:
    - userId (siapa download)
    - payslipId
    - timestamp
    - companyId
    
  Test:
    SELECT * FROM audit_log 
    WHERE action = 'PAYSLIP_DOWNLOAD' AND payslipId = ?
    ✓ Record created dengan timezone correct

AC-1.4: Signed URL (Alternative)
  Given admin click "Share Payslip Link"
  When link generated
  Then system creates short-lived signed URL:
    - Valid 24 jam saja
    - Eksplisit ke payslipId
    - No JWT needed (URL itself signed)
    
  Test:
    GET /payslip/download/{signed_token}
    ✓ Jika valid: return PDF
    ✓ Jika expired: 403 Gone
    ✓ Jika tampered: 403 Invalid Signature

AC-1.5: No Concurrent Download Leak
  Given employee & attacker concurrent
  When employee download payslip A
  And attacker try download payslip A same time
  Then payslip A NOT leaked to attacker
  
  Test:
    2 concurrent requests, different tokens
    ✓ Only one gets 200 + PDF
    ✓ Other gets 403

Test Cases:
  T1.1: Employee download own payslip
    - Login as employee
    - Click payslip
    - ✓ PDF downloaded
    
  T1.2: Employee cannot download other's payslip
    - Try direct API: GET /api/v1/payroll/payslip_other/download
    - ✓ 403 Forbidden
    
  T1.3: Cross-company employee cannot access
    - Employee dari company A
    - Try payslip dari company B
    - ✓ 403 Forbidden
    
  T1.4: Audit log created
    - Download payslip
    - Check audit: action = PAYSLIP_DOWNLOAD
    - ✓ Found
```

---

### FR-SEC-002: Enforce API Key Scopes

**ID:** FR-SEC-002  
**Priority:** P0 (Critical)

```
AC-2.1: Scope Definition
  Given API key created
  When admin assign scopes
  Then system supports:
    - "attendance:read" → read attendance only
    - "attendance:write" → read + modify attendance
    - "payroll:read" → read payroll only
    - "employee:read" → read employee data
    - "employee:write" → read + modify employees
    - "reports:*" → all report operations
    - "*" → admin (all scopes)
    
AC-2.2: Scope Validation per Route
  Given API request with API key
  When middleware check scopes
  Then:
    - Route defines required scope: [required_scope]
    - Check: api_key.scopes includes required_scope
    - If NO: return 403 Forbidden
    - If YES: process request
    
  Example routes:
    GET /attendance → requires ["attendance:read"]
    POST /attendance → requires ["attendance:write"]
    GET /payroll → requires ["payroll:read"]
    
AC-2.3: Default Deny
  Given scope undefined
  When route accessed with API key
  Then default = DENY (403 Forbidden)
  
AC-2.4: Scope Elevation Impossible
  Given API key with ["attendance:read"]
  When attacker try POST /payroll/run
  Then request blocked with 403
  (Tidak bisa escalate ke COMPANY_ADMIN)
  
AC-2.5: Audit Log Scope Access
  Given API key access route
  When scope checked
  Then audit log:
    - api_key_id
    - scope_used
    - route
    - status (allowed/denied)
    
Test Cases:
  T2.1: Attendance read scope
    - Create API key: scopes = ["attendance:read"]
    - GET /attendance → 200 ✓
    - POST /attendance → 403 ✗
    
  T2.2: Employee write scope
    - Scopes = ["employee:write"]
    - GET /employees → 200 ✓
    - POST /employees → 200 ✓
    - PUT /employees/:id → 200 ✓
    
  T2.3: Cannot escalate
    - Scopes = ["attendance:read"]
    - Try GET /payroll → 403 ✗
    - Try POST /payroll/run → 403 ✗
    
  T2.4: Wildcard scope
    - Scopes = ["*"]
    - All routes → 200 ✓ (admin)
    
  T2.5: Default deny
    - Scopes = [] (empty)
    - Any route → 403 ✗
```

---

### FR-SEC-003: Atomic Payroll Finalize (No Race Condition)

**ID:** FR-SEC-003  
**Priority:** P0 (Critical)

```
AC-3.1: Atomic Transaction
  Given payroll run draft status
  When finalize clicked
  Then all operations dalam 1 TRANSACTION:
    - Update payroll status → PROCESSING
    - Calculate OT
    - Calculate claims
    - Calculate loan installments
    - Calculate tax adjustments
    - Update payroll status → FINALIZED
    - All-or-nothing (jika error, ROLLBACK)

AC-3.2: No Double Finalize
  Given 2 requests finalize same payroll
  When both arrive concurrently
  Then:
    - Request A: UPDATE WHERE status=DRAFT → success, status=FINALIZED
    - Request B: UPDATE WHERE status=DRAFT → fail (no rows), return error
    - Loan deductions counted 1x only
    
  Test:
    2 concurrent requests
    ✓ Payroll finalized 1x
    ✓ Loan charged 1x
    ✓ Audit shows 1 finalize

AC-3.3: Idempotent Finalize
  Given payroll FINALIZED
  When same request sent again
  Then:
    - Check status = FINALIZED
    - Return 200 OK (no change)
    - Loan NOT re-charged
    
AC-3.4: Lock During Finalize
  Given payroll being finalized
  When another request try to edit
  Then second request WAIT (or 429 Too Many Requests)
  After first finalize done → second request proceed

AC-3.5: Loan Calculation Accuracy
  Given employee:
    - Salary: 10M
    - Loan balance: 2M (10 installments = 200K)
  When finalize payroll
  Then:
    - Loan deduction: 200K (1x)
    - Remaining balance: 1.8M
    - Not: 400K (2x)
    
Test Cases:
  T3.1: Atomic finalize success
    - Payroll status = DRAFT
    - POST /payroll/finalize
    - ✓ Status = FINALIZED
    - ✓ Loan charged 1x
    
  T3.2: Concurrent finalize
    - 2 requests same payroll ID
    - First: 200 OK
    - Second: 409 Conflict (already finalized)
    - ✓ Loan charged 1x
    
  T3.3: Idempotent retry
    - Finalize → 200 OK
    - Finalize again → 200 OK (no change)
    - ✓ Loan still 1x
    
  T3.4: Loan calculated correctly
    - Finalize
    - Check payslip: loan deduction = expected
    - ✓ Accurate
    
  T3.5: Transaction rollback
    - Finalize with mock DB error
    - ✓ All changes rolled back
    - ✓ Payroll status = DRAFT
    - ✓ No partial updates
```

---

### FR-SEC-004: Employee Payslip & MFA Navigation

**ID:** FR-SEC-004  
**Priority:** P1 (High)

```
AC-4.1: Employee See Payslip Menu
  Given employee login
  When view navbar
  Then employee see:
    - "Slip Gaji" (or "Payslip") menu item
    - Only visible untuk role EMPLOYEE
    
AC-4.2: Employee Access Own Payslips
  Given employee click "Slip Gaji"
  When page load
  Then show:
    - List of payslips (current month + previous 12 months)
    - Download button per payslip
    - View on screen button
    
AC-4.3: Employee Setup MFA
  Given employee want extra security
  When click "Pengaturan" → "Keamanan" → "2FA"
  Then:
    - Show TOTP setup guide
    - Generate QR code
    - Employee scan dengan Google Authenticator
    - Confirm dengan entering 6-digit code
    - MFA enabled
    
AC-4.4: MFA Accessible for All Roles
  Given any authenticated user
  When access /settings/mfa
  Then allowed (regardless of role)
  
Test Cases:
  T4.1: Employee see payslip menu
    - Login as EMPLOYEE
    - Check navbar
    - ✓ "Slip Gaji" visible
    
  T4.2: Admin see payroll but also payslip menu
    - Login as COMPANY_ADMIN
    - See both "/payroll" (admin) dan "Slip Gaji" (personal)
    - ✓ Both visible
    
  T4.3: Employee can't see admin payroll
    - Employee try /payroll
    - ✓ 403 Forbidden
    
  T4.4: Employee setup MFA
    - Go to /settings/mfa
    - ✓ See TOTP option
    - ✓ Can scan QR + confirm
    
  T4.5: Manager setup MFA
    - Login as MANAGER
    - Go to /settings/mfa
    - ✓ Can setup MFA
```

---

### FR-SEC-005: Payroll N+1 Query Fix

**ID:** FR-SEC-005  
**Priority:** P0 (Performance)

```
AC-5.1: Batch Load OT Data
  Given payroll run 100 employees
  When calculate payroll
  Then:
    - Query: SELECT * FROM overtime WHERE employeeId IN (emp1, emp2, ..., emp100)
    - Result grouped by employeeId in code
    - Not: 100 individual queries
    
AC-5.2: Batch Load Claims
  Given payroll calculation
  When fetch claims
  Then single query: SELECT * FROM claims WHERE employeeId IN (...)
  
AC-5.3: Batch Load Loans
  Same pattern for loans, adjustments, variables
  
AC-5.4: Performance Benchmark
  Given 100 employees payroll
  When run payroll calculation
  Then:
    - Queries: ~5 (not 500)
    - Execution time: <5 seconds (not 30+ seconds)
    
Test Cases:
  T5.1: Query count check
    - Enable query logging
    - Run payroll 100 employees
    - Count queries
    - ✓ ~5 queries
    - ✓ Not > 20
    
  T5.2: Performance timing
    - Run payroll
    - ✓ < 5 seconds
    
  T5.3: Result accuracy
    - Payroll calculated correctly
    - OT included
    - Claims included
    - Loans included
    - ✓ All data present
```

---

### FR-SEC-006: Attendance Import Idempotency

**ID:** FR-SEC-006  
**Priority:** P1 (High)

```
AC-6.1: Generate Import Token
  Given user start attendance import
  When file selected
  Then system generate idempotent token:
    - Format: imp_{timestamp}_{randomId}
    - Unique per import session
    
AC-6.2: Resubmit Same File = Skip
  Given file uploaded with token T1
  When same file resubmitted dengan token T1
  Then:
    - Check if token T1 already imported
    - If YES: skip (no duplicate insert)
    - Return success (idempotent)
    
AC-6.3: Different File = New Import
  Given file A uploaded dengan token T1
  When file B uploaded dengan token T2
  Then import both (different tokens)
  
Test Cases:
  T6.1: Upload same file twice
    - Upload file → token T1 → success
    - Upload same file → token T1 again → success (no duplicate)
    - Check records: only inserted 1x
    
  T6.2: Upload different files
    - Upload file A → token T1 → 150 records
    - Upload file B → token T2 → 200 records
    - ✓ Total 350 records (both imported)
    
  T6.3: Concurrent uploads
    - 2 users upload simultaneously
    - ✓ No collision
    - ✓ Both imported
```

---

### FR-SEC-007: File Upload Validation

**ID:** FR-SEC-007  
**Priority:** P1 (High)

```
AC-7.1: Extension Check
  Given file uploaded
  When check extension
  Then:
    - Must be .xlsx (Excel format)
    - Not .xls, .csv, .txt, etc
    - Case-insensitive
    
AC-7.2: MIME Type Check
  Given file uploaded
  When check MIME type
  Then:
    - Must be application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
    - Match file content
    
AC-7.3: Magic Byte Validation
  Given file uploaded
  When check magic bytes (first 4 bytes)
  Then:
    - Excel: 50 4D 4B (PK in ASCII)
    - Reject if mismatch
    - Reject if .exe, .dll, etc
    
AC-7.4: File Size Limit
  Given file upload
  When check size
  Then max 5MB
  
AC-7.5: Quarantine Suspicious Files
  Given file fail validation
  When error
  Then:
    - Do NOT save file
    - Log attempt (security audit)
    - Return user-friendly error
    
Test Cases:
  T7.1: Valid Excel file
    - Upload actual .xlsx
    - ✓ Pass validation
    - ✓ Import proceed
    
  T7.2: .xls (old format)
    - Upload .xls
    - ✗ Rejected
    - ✓ Error message
    
  T7.3: .exe dengan .xlsx extension
    - Upload exe dengan .xlsx
    - ✗ Magic byte check fail
    - ✗ Rejected
    
  T7.4: File > 5MB
    - Upload large file
    - ✗ Rejected
    - ✓ Error: "File too large"
```

---

## Part 2: Non-Functional Requirements

### NFR-SEC-001: Atomicity Guarantee

```
Requirement: Payroll finalize all-or-nothing

Database transactions MUST wrap:
  - Payroll status update
  - OT calculations
  - Loan deductions
  - Tax adjustments
  
If ANY operation fail:
  - ROLLBACK all changes
  - Payroll remains DRAFT
  - Try again or manual fix required
  
Test: Transaction rollback scenario
  [ ] Simulate DB error during finalize
  [ ] Verify: all changes rolled back
  [ ] Payroll status = DRAFT
```

### NFR-SEC-002: Concurrency Control

```
Requirement: Prevent concurrent modifications

When 2+ users try finalize same payroll:
  - First wins (gets lock)
  - Others wait max 5 seconds
  - If still locked: return 429 Too Many Requests
  
Alternative: Optimistic locking
  - Include version/timestamp in update
  - Fail if mismatch (already modified)
  
Test: Concurrent request handling
  [ ] 10 concurrent finalize requests
  [ ] Only 1 succeeds
  [ ] Others get conflict error
```

### NFR-SEC-003: Scope Enforcement Performance

```
Requirement: Scope check must be fast

Per API request:
  - Check scopes in <10ms
  - Cache scope definition
  - No extra DB query per scope check
  
Test: Performance under load
  [ ] 1000 req/sec with scope checks
  [ ] p95 latency < 100ms
```

---

## Part 3: Testing Strategy

### Unit Tests

```
Test auth middleware:
  [ ] scope enforcement
  [ ] default deny
  [ ] wildcard handling
  
Test payroll service:
  [ ] atomic finalize
  [ ] idempotent retry
  [ ] loan calculation accuracy
  [ ] N+1 query fix (batch loading)
  
Test file validation:
  [ ] extension check
  [ ] MIME type
  [ ] magic bytes
  [ ] size limit
```

### Integration Tests

```
Payroll finalize:
  [ ] Full flow with DB
  [ ] Concurrent requests
  [ ] Transaction rollback
  [ ] Audit logging
  
API key scopes:
  [ ] Route + scope matrix
  [ ] Elevation attempts blocked
  [ ] Audit trail
  
Attendance import:
  [ ] Idempotent upload
  [ ] Duplicate handling
  [ ] Concurrent uploads
```

### Security Tests

```
[ ] Payslip leak attempt (unauthenticated GET /uploads)
[ ] API key elevation attempt
[ ] Cross-company access attempt
[ ] Race condition on finalize
[ ] File upload malware attempt
[ ] Scope bypass attempt
```

---

## Prioritas Implementasi

```
WEEK 1 (Must Have):
  1. P0-B01: Payslip auth + remove /uploads
  2. P0-B02: API key scopes
  3. P0-B03: Payroll finalize atomic
  4. P0-P01: N+1 query fix

WEEK 2 (Should Have):
  5. P1-B04/B05: Employee nav fix
  6. P1-B06: Import idempotency
  7. P1-B08: File validation

WEEK 3 (Nice to Have):
  8. P1-P02: Report export limits
  9. P2-B09: JWT security
  10. P2-P05: DB indexes
```

---

*Last Updated: 18 Juli 2026 | Owner: Dozer | Status: Siap untuk SDD*

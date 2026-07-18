# dnPeople — SRS: Simplified Attendance Module (Excel-Based)
## Software Requirements Specification

**Version:** 7.0  
**Date:** July 18, 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Status:** Ready for Development

---

## Part 1: Functional Requirements

### FR-ATT-001: Download Attendance Template

**ID:** FR-ATT-001  
**Title:** Download Attendance Template (Excel)  
**Priority:** HIGH  
**Acceptance Criteria:**

```
AC-1.1: File Generation
  Given user navigates to /attendance page
  And user has COMPANY_ADMIN or HR role
  When user clicks [Download Template]
  Then system generates .xlsx file
  And file contains sheet named "Attendance"
  And file is generated within 1 second
  And user receives file download
  
AC-1.2: File Format (Template Structure)
  Given template file downloaded
  When file is opened in Microsoft Excel or LibreOffice Calc
  Then sheet "Attendance" contains:
    - Row 1 (header): "Employee ID", "Date", "Clock-In", "Clock-Out", "Status", "Notes"
    - Row 2-6 (examples): Sample data for reference
    - Column A (Employee ID): Auto-populated from company employees
    - Column B (Date): Format YYYY-MM-DD
    - Column C (Clock-In): Format HH:MM (24-hour)
    - Column D (Clock-Out): Format HH:MM (24-hour)
    - Column E (Status): Dropdown [PRESENT, ABSENT, LATE, SICK]
    - Column F (Notes): Free text
  
AC-1.3: Additional Sheets
  Given template file opened
  When user views sheet tabs
  Then system includes:
    - Sheet "Instructions": Read-only guide (format, examples, common mistakes)
    - Sheet "Employee List": Read-only list of all employees (ID + name)
  
AC-1.4: File Naming
  Given user downloads template for week of July 18-22, 2026
  When file is downloaded
  Then filename is: attendance_template_2026_week_29.xlsx
  And filename is descriptive (not generic)
  
AC-1.5: Column Widths
  Given template file opened in Excel
  When user views layout
  Then columns are sized for content (readable, not squished)
  And header row is bold + light blue background

Test Cases:
  T1.1: Admin user can download template
    - Navigate to /attendance
    - Click [Download Template]
    - ✓ File downloads (attendance_template_...xlsx)
    - ✓ File opens in Excel without errors
    - ✓ Sheet "Attendance" exists
    - ✓ Header row formatted correctly
    - ✓ Example rows present

  T1.2: File works offline
    - Download template
    - Disconnect internet
    - Open file in Excel (offline)
    - ✓ File opens, formulas intact, dropdowns work
    - Reconnect internet (can upload)

  T1.3: File size reasonable
    - Download template
    - Check file size: should be <500 KB
    - ✓ Not bloated
    
  T1.4: Non-admin user cannot download
    - Login as EMPLOYEE user
    - Navigate to /attendance
    - Verify: [Download Template] button missing or disabled
    - ✓ 403 Forbidden if user tries API directly
```

---

### FR-ATT-002: Upload Attendance from Excel

**ID:** FR-ATT-002  
**Title:** Upload Attendance File (Excel)  
**Priority:** HIGH

```
AC-2.1: File Selection
  Given user on /attendance page
  When user clicks [Upload Attendance]
  Then file picker dialog opens
  And only .xlsx files allowed (filter: *.xlsx)
  
AC-2.2: File Validation (Client-side)
  Given user selects file
  When file size checked
  Then if file > 5 MB:
    - Error: "File too large (max 5 MB)"
    - Upload blocked
  Else:
    - Proceed to server validation

AC-2.3: Server-side Parsing
  Given user uploads valid .xlsx file
  When server processes file (POST /api/v1/attendance/import, dryRun=true)
  Then system:
    1. Parse Excel file using exceljs
    2. Extract sheet "Attendance"
    3. Read header row (columns: Employee ID, Date, etc)
    4. Read data rows (skip empty rows)
    5. Perform validation (see AC-2.4 below)
  
AC-2.4: Data Validation Rules
  Given parsed data rows
  When each row validated
  Then system checks ALL rules below:
  
  Employee ID Validation:
    [ ] Field not empty
    [ ] Field is string or number
    [ ] Matches existing employee.id in company
    [ ] Case-insensitive matching allowed
    
  Date Validation:
    [ ] Field not empty
    [ ] Format valid: YYYY-MM-DD (e.g., 2026-07-18)
    [ ] Date parseable (not "July 18" or other formats)
    [ ] Date not in future (date <= today)
    [ ] Date not older than 90 days (configurable per company)
    
  Clock-In Validation:
    [ ] Format valid: HH:MM (24-hour) or H:MM AM/PM
    [ ] Parseable as time (not "8 o'clock")
    [ ] Value between 00:00 and 23:59
    
  Clock-Out Validation:
    [ ] Format valid: HH:MM (24-hour) or H:MM AM/PM
    [ ] Parseable as time
    [ ] Value between 00:00 and 23:59
    
  Clock-In vs Clock-Out:
    [ ] If Clock-Out provided, Clock-In must be provided
    [ ] If Clock-In provided, Clock-Out must be provided
    [ ] Clock-In < Clock-Out (forward in time, not backward)
    
  Duration Validation:
    [ ] Calculated duration >= 15 minutes
    [ ] Calculated duration <= 24 hours
    
  Status Validation (if provided):
    [ ] If present: value must be PRESENT | ABSENT | LATE | SICK
    [ ] Case-insensitive
    [ ] If empty: default to PRESENT
    
  Duplicate Detection:
    [ ] No other attendance record with same (companyId, employeeId, date)
    [ ] If found: treat as error
    
AC-2.5: Validation Error Response
  Given validation fails
  When errors found
  Then response is 400 Bad Request
  And response includes:
    {
      "status": "error",
      "message": "Validation failed: X errors found",
      "errors": [
        {
          "row": 5,
          "field": "Employee ID",
          "value": "EMP999",
          "error": "Employee not found (company may have different IDs)"
        },
        {
          "row": 7,
          "field": "Clock-Out",
          "value": "08:00",
          "error": "Clock-out must be after clock-in (clock-in: 08:30)"
        }
      ]
    }
  
AC-2.6: Dry-run Mode (Preview Before Commit)
  Given file valid
  When dryRun=true in request
  Then system:
    - Does NOT create records
    - Returns preview + summary
    - Shows first 10 rows
    - Shows stats: total records, employees affected, date range
  
  Response:
    {
      "status": "success",
      "dryRun": true,
      "summary": {
        "totalRecords": 150,
        "uniqueEmployees": 50,
        "dateRange": {
          "start": "2026-07-18",
          "end": "2026-07-22"
        },
        "statistics": {
          "presentCount": 148,
          "absentCount": 2,
          "averageDuration": 9.2
        }
      },
      "preview": [
        {
          "row": 2,
          "employeeId": "EMP001",
          "employeeName": "Budi Santoso",
          "date": "2026-07-18",
          "clockIn": "08:00",
          "clockOut": "17:00",
          "duration": 9.0,
          "status": "PRESENT"
        },
        // ... first 10 rows
      ]
    }

AC-2.7: Actual Import
  Given user confirms (dryRun=false)
  When file re-validated + confirmed
  Then system:
    - Creates attendance records (INSERT)
    - Sets sourceType = "MANUAL_UPLOAD"
    - Sets uploadedBy = current userId
    - Sets uploadedAt = now()
    - Creates AttendanceImport record (summary)
    - Audit log: "User imported X records"
  
  Response: 201 Created
    {
      "status": "success",
      "importId": "imp_abc123",
      "recordsImported": 150,
      "dateRange": { "start": "2026-07-18", "end": "2026-07-22" },
      "employeesAffected": 50
    }
  
AC-2.8: Import Tracking
  Given import completed
  When records created
  Then system stores:
    - importId (unique)
    - companyId
    - uploadedBy (userId)
    - uploadedAt (timestamp)
    - recordsCount
    - dateRange
    - status (COMPLETED | PARTIAL | FAILED)
  
  Allows later query: GET /api/v1/attendance/imports

Test Cases:
  T2.1: Happy path - valid file
    - Fill template correctly
    - Upload file
    - Dry-run shows preview
    - Confirm import
    - ✓ Records created
    
  T2.2: Invalid employee ID
    - File contains employee ID "EMP999" (doesn't exist)
    - Upload
    - ✓ Error: "Employee EMP999 not found"
    - ✓ User can download corrected template
    
  T2.3: Invalid date format
    - File contains date "July 18" instead of "2026-07-18"
    - Upload
    - ✓ Error: "Invalid date format"
    
  T2.4: Clock-out before clock-in
    - Clock-In: 17:00, Clock-Out: 08:00
    - Upload
    - ✓ Error: "Clock-out must be after clock-in"
    
  T2.5: Duplicate record
    - File uploaded twice with same data
    - First upload: success
    - Second upload: error "Duplicate entries found"
    - ✓ No data loss, previous records intact
    
  T2.6: Large file (1000 employees, 30 days)
    - File with 30,000 records
    - Upload
    - ✓ Processed within 10 seconds
    - ✓ All records imported correctly
    
  T2.7: Partial success not allowed
    - File has 150 records, 1 invalid
    - Upload
    - ✓ All-or-nothing: NO records imported
    - ✓ User must fix + re-upload
```

---

### FR-ATT-003: View Attendance Records

**ID:** FR-ATT-003  
**Title:** View Attendance List / Dashboard  
**Priority:** HIGH

```
AC-3.1: Attendance List Page
  Given user navigates to /attendance
  When page loads
  Then system displays:
    - Tab 1: Recent Uploads (upload summary cards)
    - Tab 2: Attendance List (table of records)
    - Tab 3: Corrections (correction workflow)

AC-3.2: Attendance Table
  Given attendance tab selected
  When table rendered
  Then columns shown:
    - Employee name (clickable → employee detail)
    - Date
    - Clock-in
    - Clock-out
    - Duration (hours)
    - Status (PRESENT | ABSENT | LATE | SICK)
    - Source (MANUAL_UPLOAD)
    - Actions (Edit, Delete)
  
  And table:
    - Sortable: by date, employee, status
    - Filterable: date range, employee, status, source
    - Paginated: 50 rows per page
    - Shows "1-50 of 500 records"

AC-3.3: Recent Uploads Summary
  Given attendance page loaded
  When Recent Uploads tab viewed
  Then system shows card per import:
    - Date range: "Week of July 18-22, 2026"
    - Records: "150 records imported"
    - Uploaded by: "Rini Handoko"
    - Uploaded at: "July 18, 2026 2:30 PM"
    - Status: "✅ Used in payroll run #5" (or "Pending")
    - Actions: [View Details] [Re-download] [Corrections]

AC-3.4: View Import Details
  Given user clicks [View Details] on import
  When detail page opened
  Then system shows:
    - Full import metadata
    - All records from that import (table)
    - Option to [Download as Excel]
    - Option to [Delete Import] (if not used in payroll)

Test Cases:
  T3.1: User sees recent uploads
    - Load /attendance
    - Click "Recent Uploads" tab
    - ✓ Shows list of past imports
    - ✓ Most recent first
    
  T3.2: User filters attendance by date
    - Load /attendance → Attendance List tab
    - Set date range: July 18-22, 2026
    - ✓ Only records in that range shown
    
  T3.3: User sorts by employee name
    - Click "Employee" column header
    - ✓ Table sorted A→Z
    - Click again: ✓ Sorted Z→A
    
  T3.4: User searches for specific employee
    - Filter: Employee = "Budi"
    - ✓ Only Budi's records shown
    
  T3.5: User sees record counts
    - 500 total attendance records
    - Showing 1-50 of 500
    - ✓ Pagination shows correct total
```

---

### FR-ATT-004: Edit Attendance Record

**ID:** FR-ATT-004  
**Title:** Edit Single Attendance Record  
**Priority:** MEDIUM

```
AC-4.1: Edit UI
  Given user on attendance list
  When user clicks [Edit] for record
  Then modal/form opens with:
    - Employee: display only (not editable)
    - Date: display only
    - Clock-In: text input, format HH:MM
    - Clock-Out: text input, format HH:MM
    - Status: dropdown [PRESENT, ABSENT, LATE, SICK]
    - Notes: text area (optional)
    - [Save] [Cancel] buttons

AC-4.2: Edit Validation
  Given user modifies record
  When user clicks [Save]
  Then system validates:
    - Clock-In < Clock-Out
    - Duration >= 15 min, <= 24 hrs
    - Date not in future
    - No duplicate (same employee/date)
  
  If error: show error message + don't save
  If valid: save + close modal

AC-4.3: Audit Trail
  Given record edited
  When saved
  Then system logs:
    - userId (who edited)
    - timestamp
    - old value (Clock-In: 08:00 → new: 07:30)
    - new value
    - reason/notes (if provided)
  
  Audit viewable in /audit page

AC-4.4: Payroll Re-calculation Flag
  Given record edited after payroll run
  When saved
  Then system:
    - Flags payroll run for re-calculation
    - Notifies finance: "Attendance updated, payroll needs review"
    - Email to finance@company.id

Test Cases:
  T4.1: User corrects clock-in time
    - Edit: Clock-In 08:00 → 07:30
    - ✓ Saved
    - ✓ Audit log shows change
    
  T4.2: User cannot edit employee
    - Open edit form
    - ✓ Employee field is read-only
    
  T4.3: Payroll affected by edit
    - Edit attendance after payroll finalized
    - ✓ Payroll flagged for re-run
    - ✓ Finance notified
```

---

### FR-ATT-005: Delete Attendance Record

**ID:** FR-ATT-005  
**Title:** Delete Attendance Record  
**Priority:** MEDIUM

```
AC-5.1: Delete Permission
  Given user on attendance list
  When user clicks [Delete] on record
  Then system checks:
    - If payroll run used this record: show warning
    - Only COMPANY_ADMIN or HR can delete
    - EMPLOYEE user cannot delete
  
AC-5.2: Delete Confirmation
  Given delete clicked
  When confirmation prompt shown
  Then system asks:
    "Delete attendance for Budi on July 18, 2026?"
    [Delete] [Cancel]
  
AC-5.3: Delete Logic
  Given user confirms delete
  When record deleted
  Then system:
    - Soft delete: set status = "DELETED"
    - Keep audit trail (audit record visible with deleted_at timestamp)
    - NOT hard delete (GDPR compliance, audit trail)
  
AC-5.4: Warning if Used in Payroll
  Given record used in payroll run
  When user attempts delete
  Then system shows:
    "⚠️ This record was used in payroll run #5 (July 22, 2026).
     Deleting will require payroll re-run.
     Are you sure? [Delete anyway] [Cancel]"

Test Cases:
  T5.1: User deletes attendance
    - Click [Delete] on record
    - Confirm
    - ✓ Record deleted
    - ✓ Audit log shows deletion
    
  T5.2: Non-admin cannot delete
    - Login as EMPLOYEE
    - ✓ Delete button missing
    
  T5.3: Payroll affected by delete
    - Delete record used in payroll
    - ✓ Warning shown
    - ✓ Payroll flagged for re-run
```

---

### FR-ATT-006: Corrections Workflow

**ID:** FR-ATT-006  
**Title:** Attendance Corrections (Submit/Approve)  
**Priority:** MEDIUM

```
AC-6.1: Submit Correction
  Given employee notices wrong attendance
  When employee submits correction request
  Then system creates correction record:
    - Original attendance: {...}
    - Requested change: {...}
    - Reason: "Forgot to clock out"
    - Status: "PENDING"
    - Submitted by: employee
    - Submitted at: timestamp

AC-6.2: Approval Workflow
  Given correction submitted
  When manager reviews inbox
  Then manager sees:
    - Employee name
    - Date
    - Original: Clock-In 08:00, Clock-Out null
    - Requested: Clock-In 08:00, Clock-Out 17:00
    - Reason: "Forgot to clock out"
    - [Approve] [Reject] [Request Info]

AC-6.3: Approval Logic
  Given manager approves
  When clicked
  Then system:
    - Updates attendance record
    - Moves data from "requested" to actual
    - Sets status: "APPROVED"
    - Flags payroll for re-run (if already processed)
    - Email to employee: "Correction approved"

AC-6.4: Rejection
  Given manager rejects
  When clicked
  Then system:
    - Sets status: "REJECTED"
    - Sends email to employee with reason
    - Attendance unchanged

Test Cases:
  T6.1: Employee submits correction
    - Navigate to attendance record
    - Click [Request Correction]
    - Fill form: reason, requested clock-out
    - ✓ Correction submitted
    - ✓ Manager sees in inbox
    
  T6.2: Manager approves correction
    - Open /approvals → Corrections tab
    - Review request
    - Click [Approve]
    - ✓ Attendance updated
    - ✓ Employee notified
```

---

## Part 2: Non-Functional Requirements

### NFR-ATT-001: Performance

```
Requirement: File upload processing must be fast

  Upload <1000 records:
    Expected: <5 seconds (parsing + validation)
    Acceptance: p95 < 10 seconds
  
  Upload 10,000 records:
    Expected: <30 seconds
    Acceptance: p95 < 60 seconds
  
  Template generation:
    Expected: <1 second
    Acceptance: <2 seconds
  
  Attendance list load (500 records):
    Expected: <2 seconds
    Acceptance: <3 seconds
  
  Search/filter (500 records):
    Expected: <1 second
    Acceptance: <2 seconds
```

### NFR-ATT-002: Data Integrity

```
Requirement: No data loss during import

  All-or-nothing transactions:
    ✓ If any row invalid, entire import fails
    ✓ Zero partial commits
    ✓ Database transaction wraps all inserts
  
  Duplicate prevention:
    ✓ Unique constraint: (companyId, employeeId, date)
    ✓ If duplicate detected before insert, error shown
    ✓ No race condition (pessimistic locking if concurrent uploads)
  
  Audit trail completeness:
    ✓ Every import logged with importId
    ✓ Every record update logged
    ✓ Every delete logged
    ✓ Audit records append-only (not updatable/deletable)
```

### NFR-ATT-003: Security

```
Requirement: Attendance data must be secure

  Access control:
    ✓ Only COMPANY_ADMIN, HR, MANAGER, FINANCE can view attendance
    ✓ EMPLOYEE can only see own attendance
    ✓ Cross-company isolation enforced (no company A seeing company B)
  
  Encryption:
    ✓ File upload: HTTPS only (TLS 1.2+)
    ✓ Data at rest: encrypted in database (if configured)
  
  File validation:
    ✓ Server-side: verify file is actually .xlsx (magic number check)
    ✓ Prevent XXE (XML External Entity) attacks
    ✓ File size limit: 5 MB (prevent DOS)
  
  Audit logging:
    ✓ All imports logged (who, when, how many)
    ✓ All edits logged (old value, new value)
    ✓ All deletes logged
    ✓ Audit logs not writable by user (append-only)
```

### NFR-ATT-004: Reliability

```
Requirement: Import must not crash system

  Error handling:
    ✓ Invalid file: graceful error message (not 500 crash)
    ✓ Corrupted Excel: error + guidance to fix
    ✓ Database error during import: rollback + inform user
    ✓ Network timeout during upload: retry prompt
  
  Backup:
    ✓ Daily database backup includes attendance table
    ✓ Restore drill: verified weekly
  
  Data recovery:
    ✓ If import fails: no records partially created
    ✓ User can retry with corrected file
    ✓ History preserved (can see what was attempted)
```

### NFR-ATT-005: Usability

```
Requirement: Non-technical HR can use this

  Template clarity:
    ✓ Format instructions clear (not cryptic)
    ✓ Example rows provided (copy + modify)
    ✓ Column headers self-explanatory
  
  Error messages:
    ✓ Non-technical language ("Employee ID not found", not "FK constraint violation")
    ✓ Suggest fix ("Check spelling" or "Use 24-hour format")
    ✓ Show exactly which row/field (row 5, Clock-In)
  
  Workflow:
    ✓ 3 clicks to upload: Download → Fill → Upload
    ✓ Dry-run preview before commit (confidence)
    ✓ Success confirmation visible
```

---

## Part 3: API Specifications

### Endpoint 1: GET /api/v1/attendance/template/download

**Purpose:** Generate and return Excel template

**Request:**
```
GET /api/v1/attendance/template/download?startDate=2026-07-18&endDate=2026-07-22

Query Parameters:
  - startDate: ISO date (YYYY-MM-DD)
  - endDate: ISO date
  - period: "week" | "month" (optional, for naming)

Headers:
  - Authorization: Bearer {token}
```

**Response:**
```
HTTP 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="attendance_template_2026_week_29.xlsx"

Body: Binary Excel file (.xlsx)
```

**Error Responses:**
```
400 Bad Request:
  { "error": "Invalid date format. Use YYYY-MM-DD" }

401 Unauthorized:
  { "error": "Authentication required" }

403 Forbidden:
  { "error": "You don't have permission to download template" }
```

---

### Endpoint 2: POST /api/v1/attendance/import

**Purpose:** Upload and validate/import attendance file

**Request:**
```
POST /api/v1/attendance/import
Content-Type: multipart/form-data

Body:
  - file: File (binary)
  - dryRun: boolean (true for preview, false for actual import)

Headers:
  - Authorization: Bearer {token}

Example:
  curl -X POST \
    -H "Authorization: Bearer token" \
    -F "file=@attendance.xlsx" \
    -F "dryRun=true" \
    https://api.dnpeople.id/api/v1/attendance/import
```

**Response (Validation Error):**
```
HTTP 400 Bad Request

{
  "status": "error",
  "message": "Validation failed: 3 errors found",
  "errors": [
    {
      "row": 5,
      "field": "Employee ID",
      "value": "EMP999",
      "error": "Employee not found in company. Valid IDs: EMP001-EMP150"
    },
    {
      "row": 7,
      "field": "Clock-Out",
      "value": "08:00",
      "error": "Clock-out (08:00) must be after clock-in (08:30)"
    },
    {
      "row": 10,
      "field": "Date",
      "value": "July 18",
      "error": "Invalid date format. Use YYYY-MM-DD (e.g., 2026-07-18)"
    }
  ],
  "errorCount": 3,
  "rowsProcessed": 150
}
```

**Response (Validation Success, dryRun=true):**
```
HTTP 200 OK

{
  "status": "success",
  "message": "Validation passed. Ready to import.",
  "dryRun": true,
  "summary": {
    "totalRecords": 150,
    "uniqueEmployees": 50,
    "dateRange": {
      "start": "2026-07-18",
      "end": "2026-07-22"
    },
    "statistics": {
      "presentCount": 148,
      "absentCount": 2,
      "lateCount": 3,
      "sickCount": 0,
      "averageDuration": 9.2
    }
  },
  "preview": [
    {
      "row": 2,
      "employeeId": "EMP001",
      "employeeName": "Budi Santoso",
      "date": "2026-07-18",
      "clockIn": "08:00",
      "clockOut": "17:00",
      "duration": 9.0,
      "status": "PRESENT"
    },
    {
      "row": 3,
      "employeeId": "EMP002",
      "employeeName": "Rini Handoko",
      "date": "2026-07-18",
      "clockIn": "08:15",
      "clockOut": "17:30",
      "duration": 9.25,
      "status": "PRESENT"
    },
    // ... first 10 rows only
  ]
}
```

**Response (Import Success, dryRun=false):**
```
HTTP 201 Created

{
  "status": "success",
  "message": "Import completed successfully",
  "importId": "imp_abc123xyz",
  "recordsImported": 150,
  "employeesAffected": 50,
  "dateRange": {
    "start": "2026-07-18",
    "end": "2026-07-22"
  },
  "statistics": {
    "presentCount": 148,
    "absentCount": 2
  },
  "timestamp": "2026-07-18T14:30:00Z",
  "importedBy": {
    "userId": "user_001",
    "name": "Rini Handoko"
  },
  "redirectTo": "/attendance?import=imp_abc123xyz"
}
```

**Error Responses:**
```
400 Bad Request (file not .xlsx):
  { "error": "File must be Excel format (.xlsx)" }

413 Payload Too Large:
  { "error": "File size exceeds 5 MB limit" }

401 Unauthorized:
  { "error": "Authentication required" }

403 Forbidden:
  { "error": "You don't have permission to import attendance" }

500 Internal Server Error:
  { "error": "Failed to process file. Please try again." }
```

---

### Endpoint 3: GET /api/v1/attendance

**Purpose:** Get attendance records with filtering

**Request:**
```
GET /api/v1/attendance?startDate=2026-07-18&endDate=2026-07-22&employeeId=EMP001&status=PRESENT&limit=50&offset=0

Query Parameters:
  - startDate: ISO date (optional)
  - endDate: ISO date (optional)
  - employeeId: string (optional)
  - status: PRESENT | ABSENT | LATE | SICK (optional)
  - sourceType: MANUAL_UPLOAD | QR_SCAN | ... (optional)
  - limit: integer (default 50, max 500)
  - offset: integer (default 0)
```

**Response:**
```
HTTP 200 OK

{
  "status": "success",
  "data": [
    {
      "id": "att_abc123",
      "companyId": "46a3bcb5...",
      "employeeId": "EMP001",
      "employeeName": "Budi Santoso",
      "date": "2026-07-18",
      "clockIn": "08:00",
      "clockOut": "17:00",
      "duration": 9.0,
      "status": "PRESENT",
      "sourceType": "MANUAL_UPLOAD",
      "uploadedBy": "user_001",
      "uploadedAt": "2026-07-18T14:30:00Z",
      "notes": "",
      "createdAt": "2026-07-18T14:30:00Z",
      "updatedAt": "2026-07-18T14:30:00Z"
    },
    // ... more records
  ],
  "pagination": {
    "total": 500,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### Endpoint 4: GET /api/v1/attendance/imports

**Purpose:** Get list of all imports for company

**Request:**
```
GET /api/v1/attendance/imports?limit=20&offset=0

Query Parameters:
  - limit: integer (default 20)
  - offset: integer (default 0)
```

**Response:**
```
HTTP 200 OK

{
  "status": "success",
  "imports": [
    {
      "importId": "imp_abc123",
      "fileName": "attendance_template_2026_week_29.xlsx",
      "uploadedBy": {
        "userId": "user_001",
        "name": "Rini Handoko"
      },
      "uploadedAt": "2026-07-18T14:30:00Z",
      "recordsCount": 150,
      "employeesAffected": 50,
      "dateRange": {
        "start": "2026-07-18",
        "end": "2026-07-22"
      },
      "status": "COMPLETED",
      "usedInPayroll": {
        "payrollRunId": "pr_xyz789",
        "runDate": "2026-07-22"
      }
    },
    // ... more imports
  ],
  "pagination": {
    "total": 5,
    "limit": 20,
    "offset": 0
  }
}
```

---

## Part 4: Data Model

### New/Modified Tables

```prisma
model Attendance {
  id                String    @id @default(cuid())
  companyId         String
  employeeId        String
  date              DateTime
  clockIn           DateTime?   // Time HH:MM (stored as TimeStamp)
  clockOut          DateTime?
  duration          Float?      // Hours (calculated)
  status            String      // PRESENT | ABSENT | LATE | SICK
  sourceType        String      @default("MANUAL_UPLOAD")
    // Values: MANUAL_UPLOAD (excel), QR_SCAN, GPS_CHECK, MOBILE_APP
  
  uploadedBy        String?     // userId who imported (if sourceType=MANUAL_UPLOAD)
  uploadedAt        DateTime?
  note              String?     // Notes column from Excel
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  company           Company     @relation(fields: [companyId], references: [id], onDelete: Cascade)
  employee          Employee    @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  
  @@index([companyId])
  @@index([employeeId])
  @@index([date])
  @@unique([companyId, employeeId, date])
}

model AttendanceImport {
  // NEW TABLE: Track imports
  id                String    @id @default(cuid())
  companyId         String
  importId          String    @unique  // User-facing ID (imp_abc123)
  fileName          String
  uploadedBy        String
  uploadedAt        DateTime  @default(now())
  recordsCount      Int
  employeesAffected Int
  dateRange         Json      // { start, end }
  status            String    // COMPLETED | PARTIAL | FAILED
  errorLog          String?
  
  company           Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  user              User      @relation(fields: [uploadedBy], references: [id])
  
  @@index([companyId])
  @@index([uploadedBy])
}

model AuditLog {
  // Existing table, add attendance events
  // When attendance edited/deleted, log event
  
  action            String    // ATTENDANCE_IMPORT, ATTENDANCE_EDIT, ATTENDANCE_DELETE
  metadata          Json      // { importId, recordCount, errors, etc }
  
  // Rest of audit table unchanged
}
```

---

## Part 5: Testing Strategy

### Unit Tests

```
Test: Template Generation
  [ ] Excel file generated correctly
  [ ] All sheets present (Attendance, Instructions, Employee List)
  [ ] Headers formatted bold + blue background
  [ ] Data types correct (date = date, time = time)

Test: File Parsing
  [ ] Parse valid .xlsx file
  [ ] Extract sheet "Attendance"
  [ ] Read header row
  [ ] Read data rows (skip empty rows)
  [ ] Handle corrupted file gracefully

Test: Validation Rules
  [ ] Employee ID not found → error
  [ ] Date in future → error
  [ ] Clock-out before clock-in → error
  [ ] Duplicate (same employee/date) → error
  [ ] Valid row passes all checks
  [ ] Partial valid data (some errors, some OK) → error all

Test: Data Insertion
  [ ] Valid rows inserted into database
  [ ] @@unique constraint enforced (no duplicates)
  [ ] sourceType set to "MANUAL_UPLOAD"
  [ ] uploadedBy + uploadedAt set
  [ ] Audit log created
```

### Integration Tests

```
Test: Full Upload Flow
  [ ] Frontend sends file to backend
  [ ] Backend validates (dry-run)
  [ ] Frontend shows preview
  [ ] User confirms
  [ ] Backend imports (actual)
  [ ] Records appear in /attendance list

Test: Payroll Integration
  [ ] Import 100 attendance records
  [ ] Run payroll for that period
  [ ] Late deductions calculated correctly
  [ ] Attendance appears on payslip

Test: Error Handling
  [ ] Invalid file → 400 error + message
  [ ] File too large → 413 error
  [ ] Permission denied → 403 error
  [ ] Server error → 500 error + retry prompt
```

### Acceptance Tests (UAT)

```
Test: HR User Can Upload Attendance
  [ ] Navigate to /attendance
  [ ] Click [Download Template]
  [ ] File downloads (attendance_template_...xlsx)
  [ ] Fill template (20 employees, 5 days)
  [ ] Click [Upload Attendance]
  [ ] Select file
  [ ] Dry-run preview shows correctly
  [ ] Confirm import
  [ ] Records appear in list
  [ ] Payroll calculated correctly

Test: Corrections Workflow
  [ ] Employee submits correction request
  [ ] Manager sees in approvals inbox
  [ ] Manager approves
  [ ] Employee notified
  [ ] Record updated in attendance list

Test: Error Recovery
  [ ] Upload file with invalid employee ID
  [ ] See error message
  [ ] Re-download template (corrected)
  [ ] Fix + re-upload
  [ ] Success
```

---

## Part 6: Implementation Checklist

```
Backend:
  [ ] Modify Attendance schema (add uploadedBy, uploadedAt, sourceType)
  [ ] Create AttendanceImport schema
  [ ] Implement template generation (exceljs)
  [ ] Implement file parsing + validation
  [ ] Implement import logic (transaction)
  [ ] Implement GET /attendance/template/download
  [ ] Implement POST /attendance/import
  [ ] Implement GET /attendance (with filters)
  [ ] Implement GET /attendance/imports
  [ ] Add audit logging for imports
  [ ] Add error handling (validation + graceful errors)
  [ ] Add unit tests (20+ test cases)
  [ ] Run load test (1000 employees, 30 days)

Frontend:
  [ ] Create /attendance page layout (tabs)
  [ ] Implement [Download Template] button
  [ ] Implement file upload + validation (client-side)
  [ ] Implement dry-run preview table
  [ ] Implement [Confirm Import] button
  [ ] Show success message with summary
  [ ] Display attendance list (sortable, filterable)
  [ ] Implement edit form (modal)
  [ ] Implement delete confirmation
  [ ] Add error message handling
  [ ] Mobile responsive design
  [ ] Add integration tests (Cypress)

QA:
  [ ] Test all validation rules (20+ cases)
  [ ] Test error scenarios (file corruption, invalid data, etc)
  [ ] Test payroll integration
  [ ] Stress test: upload 10K records
  [ ] Security review: file handling, data isolation
  [ ] UAT with HR team (manual testing)
  [ ] Create test data sets (small + large files)

Documentation:
  [ ] Write API docs (Swagger)
  [ ] Write user guide (how to download + upload)
  [ ] Create video tutorial (2-3 min)
  [ ] Write troubleshooting guide
  [ ] Update FAQ
```

---

## Summary

**Excel-based attendance MVP:**
- ✅ Download template (pre-formatted, clear)
- ✅ Upload file (validate + preview + import)
- ✅ View records (list, filter, sort)
- ✅ Edit/delete records (with audit trail)
- ✅ Corrections workflow (employee → manager approval)
- ✅ Payroll integration (attendance feeds payroll calculation)
- ✅ Works without mobile app

**Scope:** 2 weeks implementation  
**Effort:** 2-3 engineers  
**Delivery:** Week 3 of web MVP roadmap

---

*Last Updated: July 18, 2026 | Owner: Dozer | Status: Ready for Development*

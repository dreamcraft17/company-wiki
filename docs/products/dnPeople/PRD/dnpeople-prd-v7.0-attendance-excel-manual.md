# dnPeople — PRD: Simplified Attendance Module (Excel-Based)
## Manual Attendance Input via Excel (No QR/GPS/Biometric)

**Version:** 7.0  
**Owner:** Dozer (CEO + Tech Lead)  
**Date:** July 18, 2026  
**Purpose:** Replace complex QR/GPS/biometric attendance with simple Excel upload (MVP phase)  
**Scope:** Web-only, manual input, Excel template

---

## Executive Summary

**Current Problem:**
- Attendance has QR scan, GPS, WiFi check-in, biometric (complex)
- Requires mobile app (not ready for MVP)
- Overkill for SME pilot customers

**MVP Solution:**
- ✅ **Simple manual attendance input**
- ✅ **Download Excel template** (valid format)
- ✅ **Bulk upload** (weekly/monthly)
- ✅ **Validation + auto-import**
- ✅ **Works for payroll calculation**
- ✅ **Zero mobile app needed**

**Why This Is Smart:**
```
Complex attendance (QR/GPS/Biometric):
  ❌ Requires mobile app
  ❌ Requires hardware setup
  ❌ Long implementation
  ❌ Not ready for pilot

Excel-based attendance:
  ✅ Use with laptop/desktop
  ✅ No hardware needed
  ✅ Familiar to HR/finance
  ✅ Ready in 2 weeks
  ✅ Works for payroll
  ✅ Easy to migrate later
```

---

## Part 1: User Journey

### SCENARIO: HR Manager Imports Weekly Attendance

```
STEP-BY-STEP:
─────────────

HR Manager opens dnPeople:
  Click: "Attendance" menu
  ↓
[Attendance Page]
  Cards visible:
  - "Clock In/Out" (currently disabled ❌)
  - "Import Attendance" (✅ ENABLED)
  
  "Your company uses Excel-based attendance.
   Download template → fill → upload."

HR Manager clicks: "Download Template"
  ↓
Browser downloads: attendance_template_week_01_2026.xlsx
  
File structure:
┌──────────────┬──────────┬──────────┬──────────┐
│ Employee ID  │ Date     │ Clock-In │ Clock-Out│
├──────────────┼──────────┼──────────┼──────────┤
│ EMP001       │ 07/18/26 │ 08:00 AM │ 05:00 PM│
│ EMP002       │ 07/18/26 │ 08:15 AM │ 05:30 PM│
│ EMP001       │ 07/19/26 │ 09:00 AM │ 05:00 PM│
└──────────────┴──────────┴──────────┴──────────┘

HR Manager fills template:
  - Add employee attendance for past week
  - Format: "HH:MM AM/PM" or "HH:MM" (24h)
  - Can have multiple dates per employee
  - Leave blank if absent

HR Manager saves + uploads:
  Click: "Upload Attendance"
  ↓
File picker: attendance_week_01_2026.xlsx (filled)
  
System validates:
  ✓ File is .xlsx format
  ✓ Has required columns (Employee ID, Date, Clock-In, Clock-Out)
  ✓ All dates within valid range (not future)
  ✓ Employee IDs exist in company
  ✓ Clock-in < Clock-out (time logic)
  ✓ No duplicates (same employee/date combo)
  
If error:
  [Error message + download] updated template
  "Row 5: Employee ID 'EMP999' not found"
  [Download corrected template to retry]

If valid:
  Dry-run preview shown:
  ┌──────────────┬──────────┬──────────┬──────────┬─────────┐
  │ Employee     │ Date     │ Clock-In │ Clock-Out│ Duration│
  ├──────────────┼──────────┼──────────┼──────────┼─────────┤
  │ Budi Santoso │ 07/18/26 │ 08:00 AM │ 05:00 PM│ 9 hours │
  │ Rini Handoko │ 07/18/26 │ 08:15 AM │ 05:30 PM│ 9.25 hrs│
  └──────────────┴──────────┴──────────┴──────────┴─────────┘
  
  [Confirm Import] button

HR Manager clicks: "Confirm Import"
  ↓
System imports:
  - Create attendance records
  - Calculate worked hours
  - Mark as "MANUAL_UPLOAD"
  - Audit log: "HR imported 50 records"
  ↓
Success message:
  "✅ Imported 50 attendance records
   Period: July 18-22, 2026
   View records in attendance dashboard"

View attendance:
  Click: "View Attendance" or go to Dashboard
  ↓
Attendance list (table):
  ┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
  │ Employee │ Date     │ Clock-In │ Clock-Out│ Duration │ Status   │
  ├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
  │ Budi     │ 07/18/26 │ 08:00 AM │ 05:00 PM│ 9 hours  │ PRESENT  │
  │ Rini     │ 07/18/26 │ 08:15 AM │ 05:30 PM│ 9.25 hrs │ PRESENT  │
  │ Ahmad    │ 07/18/26 │ —        │ —       │ —        │ ABSENT   │
  └──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘

Payroll team:
  Can now run payroll
  System uses imported attendance
  Late deduction applied automatically
```

---

## Part 2: Feature Specification

### Feature 1: Download Attendance Template

**What:** User downloads pre-formatted Excel file with valid structure

**Template File Structure:**

```excel
Filename: attendance_template_[period]_[tenantId].xlsx

Sheet 1: "Attendance"

Header row (Row 1):
┌─────────────────┬────────────┬──────────┬───────────┬──────────────┬──────────┐
│ Employee ID     │ Date       │ Clock-In │ Clock-Out │ Status       │ Notes    │
├─────────────────┼────────────┼──────────┼───────────┼──────────────┼──────────┤
│ (required)      │ (required) │ (opt)    │ (opt)     │ (optional)   │ (opt)    │
│ EMP001          │ 2026-07-18 │ 08:00    │ 17:00     │ PRESENT      │          │
│ EMP002          │ 2026-07-18 │ 08:15    │ 17:30     │ PRESENT      │          │
│ EMP003          │ 2026-07-18 │          │           │ ABSENT       │ Sick     │
│ EMP001          │ 2026-07-19 │ 09:00    │ 17:30     │ PRESENT      │ Late 1hr │
└─────────────────┴────────────┴──────────┴───────────┴──────────────┴──────────┘

Column details:
- A: Employee ID (must exist in company)
- B: Date (YYYY-MM-DD format)
- C: Clock-In (HH:MM, 24-hour or 12-hour with AM/PM)
- D: Clock-Out (HH:MM, 24-hour or 12-hour with AM/PM)
- E: Status (PRESENT | ABSENT | LATE | SICK)
- F: Notes (optional, free text)

Data rows: Start from Row 2
Template includes 5 example rows (prefilled, user should delete + add their data)

Sheet 2: "Instructions" (read-only)
- Format requirements
- Date format: YYYY-MM-DD
- Time format: HH:MM (24-hour)
- Employee ID examples
- Common mistakes to avoid
- How to mark absent/sick

Sheet 3: "Employee List" (read-only)
- All employees in company with ID + name
- Use to reference when filling attendance
```

**User Interaction:**

```
UI: /attendance page

Button: [Download Template]
  ↓
Backend generates file:
  GET /api/v1/attendance/template/download
  
Parameters:
  - period: "week" | "month"
  - startDate: ISO date
  - endDate: ISO date
  
Response: File download
  File: attendance_template_[period]_[startDate]_[endDate].xlsx
  Format: .xlsx (NOT CSV)
  
Frontend:
  Show: "✅ Template downloaded"
  Help text: "Fill with your attendance data and upload"
```

**Technical Requirements:**

```
✅ Use library: exceljs (npm install exceljs)
✅ Format: .xlsx (Excel format, not CSV)
✅ Include data validation (dropdown for Status)
✅ Column width optimized (readable)
✅ Header row: bold + background color (light blue)
✅ Example rows: numbered, easy to delete
✅ Instructions sheet: clear + helpful
✅ File name: descriptive (attendance_template_2026_week_29.xlsx)
✅ Generation time: <1 second
```

---

### Feature 2: Upload Attendance from Excel

**What:** User uploads filled Excel file, system validates + imports

**Upload Flow:**

```
UI: /attendance page

Button: [Upload Attendance]
  ↓
File picker: Select .xlsx file
  
Validation (Client-side, before sending):
  ✓ File is .xlsx (not .csv, not .txt)
  ✓ File size < 5MB
  Show: "Reading file..."
  
Validation (Server-side, after upload):
  POST /api/v1/attendance/import
  
Request body:
  {
    "file": File (binary),
    "companyId": "46a3bcb5...",
    "dryRun": true  // First call: dry-run only
  }
  
Server processes:
  1. Parse Excel file (exceljs.readFile())
  2. Extract sheet "Attendance"
  3. Read header row (must match template)
  4. Read data rows (skip empty rows)
  5. Validate each row (see below)
  
Validation rules:
  ✓ Required columns present: Employee ID, Date, Clock-In, Clock-Out
  ✓ No empty required fields (per row)
  ✓ Date format valid (YYYY-MM-DD)
  ✓ Date not in future
  ✓ Date not older than 90 days (configurable)
  ✓ Clock-In/Clock-Out format valid (HH:MM)
  ✓ Clock-In < Clock-Out (no negative duration)
  ✓ Employee ID exists in company
  ✓ No duplicate (same employee + date combo)
  ✓ Duration > 0 and < 24 hours
  
Error handling:
  If validation fails:
    Response: 400 Bad Request
    {
      "status": "error",
      "message": "Validation failed",
      "errors": [
        {
          "row": 5,
          "field": "Employee ID",
          "value": "EMP999",
          "error": "Employee ID not found in company"
        },
        {
          "row": 6,
          "field": "Clock-Out",
          "value": "08:00",
          "error": "Clock-out must be after clock-in (08:30)"
        }
      ],
      "downloadCorrectedTemplate": true
    }
    
    Frontend shows:
    ❌ Error message
    [View Errors] button (show error list)
    [Download Template with Errors Highlighted] button
    
    User can:
    - Fix file locally
    - Re-upload
    
If valid (dryRun=true):
  Response: 200 OK
  {
    "status": "success",
    "message": "Validation passed",
    "dryRun": true,
    "summary": {
      "totalRecords": 150,
      "uniqueEmployees": 50,
      "dateRange": "2026-07-18 to 2026-07-22",
      "averageDuration": 9.2,
      "presentCount": 148,
      "absentCount": 2
    },
    "preview": [
      {
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
  
  Frontend shows:
  ✅ "Validation passed! Ready to import."
  
  Summary card:
  ┌─────────────────────────────────┐
  │ Total records: 150              │
  │ Unique employees: 50            │
  │ Date range: July 18-22, 2026    │
  │ Average work hours: 9.2 hours   │
  │ Present: 148 | Absent: 2        │
  └─────────────────────────────────┘
  
  Preview table (first 10):
  ┌──────────┬──────────┬──────────┬──────────┬──────────┐
  │ Employee │ Date     │ Clock-In │ Clock-Out│ Duration │
  ├──────────┼──────────┼──────────┼──────────┼──────────┤
  │ Budi     │ 07/18/26 │ 08:00 AM │ 05:00 PM│ 9 hours  │
  └──────────┴──────────┴──────────┴──────────┴──────────┘
  
  [Confirm & Import] button (when ready)
```

**Confirm Import:**

```
If user clicks [Confirm & Import]:
  
  POST /api/v1/attendance/import
  {
    "file": File,
    "companyId": "46a3bcb5...",
    "dryRun": false  // Actually import
  }
  
Server:
  1. Re-validate (same checks)
  2. Create attendance records:
     INSERT INTO attendance (
       companyId, employeeId, date, clockIn, clockOut,
       duration, status, sourceType, uploadedBy, uploadedAt
     ) VALUES (...)
     
  3. Mark source: sourceType = "MANUAL_UPLOAD"
  4. Record: uploadedBy = userId, uploadedAt = now()
  5. Audit log: "User imported 150 attendance records"
  
Response: 201 Created
  {
    "status": "success",
    "message": "Import completed",
    "importId": "imp_abc123",
    "recordsImported": 150,
    "dateRange": "2026-07-18 to 2026-07-22",
    "employeesAffected": 50,
    "redirectTo": "/attendance?import=imp_abc123"
  }
  
Frontend:
  ✅ Success message with animation
  "Import completed! 150 attendance records added."
  [View Imported Records] button
  
  Redirect to attendance dashboard
```

---

### Feature 3: Attendance Dashboard / List

**What:** View imported attendance, mark as used for payroll, edit if needed

**Page: /attendance**

```
Tab 1: "Recent Uploads"
  Card per upload:
  ┌──────────────────────────────────────┐
  │ Week of July 18-22, 2026             │
  │ Records: 150 | Employees: 50         │
  │ Uploaded: July 18, 2026 2:30 PM      │
  │ Uploaded by: HR Manager (Rini)       │
  │                                      │
  │ Status: ✅ Used in payroll run #5    │
  │ [View Details] [Re-download]         │
  └──────────────────────────────────────┘

Tab 2: "Attendance List"
  Table (sortable, filterable):
  ┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
  │ Employee │ Date     │ Clock-In │ Clock-Out│ Duration │ Status   │
  ├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
  │ Budi     │ 07/18/26 │ 08:00 AM │ 05:00 PM│ 9.0 hrs  │ PRESENT  │
  │ Rini     │ 07/18/26 │ 08:15 AM │ 05:30 PM│ 9.25 hrs │ PRESENT  │
  │ Ahmad    │ 07/18/26 │ —        │ —       │ —        │ ABSENT   │
  └──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
  
  Filters:
  - Date range
  - Employee
  - Status (PRESENT, ABSENT, LATE, SICK)
  - Source (MANUAL_UPLOAD, etc)
  
  Actions per row:
  - View details
  - Edit (icon button)
  - Delete (icon button, if not used in payroll)

Tab 3: "Corrections"
  Similar to current /corrections, but for manual uploads
  - Submit correction
  - Approve/reject
  - Track changes
```

---

## Part 3: Technical Specifications

### Database Schema Changes

**Existing tables (modify):**

```prisma
model Attendance {
  id                String    @id @default(cuid())
  companyId         String
  employeeId        String
  date              DateTime
  clockIn           DateTime?
  clockOut          DateTime?
  duration          Float?    // hours
  status            String    // PRESENT | ABSENT | LATE | SICK
  sourceType        String    @default("MANUAL_UPLOAD")
    // Will be: MANUAL_UPLOAD, QR_SCAN, GPS_CHECK, MOBILE_APP (future)
  
  // NEW FIELDS for audit
  uploadedBy        String?   // userId who uploaded
  uploadedAt        DateTime? // when imported
  note              String?   // from Excel notes column
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([companyId])
  @@index([employeeId])
  @@index([date])
  @@unique([companyId, employeeId, date])  // NEW: prevent duplicates
}

model AttendanceImport {
  // NEW TABLE: track imports
  id                String    @id @default(cuid())
  companyId         String
  fileName          String
  uploadedBy        String
  uploadedAt        DateTime
  recordsCount      Int
  dateRange         Json      // { startDate, endDate }
  status            String    // "COMPLETED" | "PARTIAL" | "FAILED"
  errorLog          String?   // if failed
  
  createdAt         DateTime  @default(now())
  
  @@index([companyId])
}
```

### API Endpoints

**New endpoints:**

```
1. GET /api/v1/attendance/template/download
   Query params:
     - startDate: ISO date
     - endDate: ISO date
     - period: "week" | "month"
   
   Response: Binary (.xlsx file)
   Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
   Content-Disposition: attachment; filename="attendance_template_2026_week_29.xlsx"

2. POST /api/v1/attendance/import
   Body:
     {
       "file": File (multipart/form-data),
       "dryRun": boolean
     }
   
   Response (validation error):
     {
       "status": "error",
       "message": "Validation failed",
       "errors": [
         { "row": 5, "field": "Employee ID", "error": "Not found" }
       ]
     }
   
   Response (validation success, dryRun=true):
     {
       "status": "success",
       "dryRun": true,
       "summary": {
         "totalRecords": 150,
         "uniqueEmployees": 50,
         "dateRange": "2026-07-18 to 2026-07-22",
         "presentCount": 148,
         "absentCount": 2
       },
       "preview": [ ... first 10 rows ... ]
     }
   
   Response (import completed, dryRun=false):
     {
       "status": "success",
       "importId": "imp_abc123",
       "recordsImported": 150,
       "dateRange": "2026-07-18 to 2026-07-22"
     }

3. GET /api/v1/attendance/imports
   Query params:
     - limit: 20
     - offset: 0
   
   Response:
     {
       "imports": [
         {
           "importId": "imp_abc123",
           "uploadedAt": "2026-07-18T14:30:00Z",
           "uploadedBy": "user_001",
           "recordsCount": 150,
           "dateRange": "2026-07-18 to 2026-07-22",
           "status": "COMPLETED"
         }
       ],
       "total": 5,
       "limit": 20,
       "offset": 0
     }

4. GET /api/v1/attendance/imports/:importId
   Response: Full import details + all records

5. GET /api/v1/attendance (existing, filter by sourceType)
   Query params:
     - startDate, endDate
     - employeeId
     - sourceType: "MANUAL_UPLOAD"
     - status: "PRESENT" | "ABSENT"
```

### Existing API (Modified)

**Payroll integration:**

```
GET /api/v1/payroll/:id/calculate
  - Pull attendance data (sourceType = MANUAL_UPLOAD or others)
  - Calculate: present days, absent days, late deductions
  - Use same logic as before
```

---

## Part 4: Validation Rules (Detailed)

### Validation Checklist

```
File-level:
  ✓ File format is .xlsx (magic number check)
  ✓ File size < 5 MB
  ✓ File can be opened (not corrupted)
  ✓ Has sheet "Attendance"

Header-level:
  ✓ Row 1 has columns: Employee ID, Date, Clock-In, Clock-Out
  ✓ Column order doesn't matter (map by name)
  ✓ Optional columns: Status, Notes

Row-level (data rows):
  ✓ Employee ID present + non-empty
  ✓ Employee ID exists in company
  ✓ Date present + non-empty
  ✓ Date format valid (YYYY-MM-DD)
  ✓ Date not in future
  ✓ Date not older than 90 days (company-configurable)
  ✓ Clock-In present if Clock-Out present (both or none)
  ✓ Clock-In format valid (HH:MM or H:MM)
  ✓ Clock-Out format valid
  ✓ Clock-In time < Clock-Out time (no negative duration)
  ✓ Duration > 15 minutes (minimum work period)
  ✓ Duration < 24 hours (sanity check)
  ✓ Status valid (if provided): PRESENT, ABSENT, LATE, SICK, (empty = PRESENT)
  ✓ No duplicate: same (companyId, employeeId, date) combination

Cross-row:
  ✓ No employee appearing on same date with overlapping times
  ✓ For same employee/date: only one entry allowed
  ✓ No employee has >3 entries per date (prevent data spam)
```

### Validation Error Messages (User-Friendly)

```
Employee ID errors:
  - "Row 5: Employee ID 'EMP999' not found. Check spelling."
  - "Row 8: Employee ID missing. Required field."

Date errors:
  - "Row 10: Date 'July 18' invalid format. Use YYYY-MM-DD (e.g., 2026-07-18)"
  - "Row 12: Date 2026-07-25 is in the future. Cannot import future dates."
  - "Row 15: Date 2025-06-01 is too old (>90 days). Contact admin to import."

Time errors:
  - "Row 7: Clock-in '5:00 PM' format invalid. Use HH:MM (e.g., 17:00 or 5:00 PM)"
  - "Row 9: Clock-out 08:00 is before clock-in 08:30. Check times."
  - "Row 11: Work duration 0.5 hours too short (min 15 minutes)"
  - "Row 13: Work duration 25 hours too long (max 24 hours per day)"

Duplicate errors:
  - "Row 20: Duplicate entry. Employee 'Budi' already has attendance on 2026-07-18. Duplicate will be skipped."

Status errors:
  - "Row 6: Status 'PRESENT' invalid. Must be: PRESENT, ABSENT, LATE, or SICK"
```

---

## Part 5: Use Cases & Workflows

### Use Case 1: Weekly Attendance (Most Common)

```
HR Manager (Rini):
1. Monday morning: Click /attendance
2. [Download Template] for week of July 18-22
3. Share template with department managers via email
4. Managers fill in their team's attendance
5. Rini collects files, consolidates into one master file
6. Friday 2pm: Rini uploads master file
7. System validates + shows preview
8. Rini reviews + confirms import
9. 150 attendance records imported
10. Saturday morning: Finance runs payroll
    → System uses imported attendance
    → Calculates late deductions automatically
```

### Use Case 2: Catch Missed Attendance

```
HR Manager needs to import attendance from past week (forgot last time):
1. Click /attendance → [Download Template]
2. Specify startDate=2026-07-11, endDate=2026-07-17
3. Download file pre-filled with empty rows for that week
4. Fill in attendance data
5. Upload
6. System validates + prevents duplicate with existing records
   (if any overlap, error message shows)
7. Import new records only
```

### Use Case 3: Correct Attendance Mistake

```
After import, HR finds error (wrong clock-in time for Budi on 07/18):
1. Go to /attendance → [Attendance List]
2. Filter: Date=07/18/26, Employee=Budi
3. Click row → [Edit]
4. Change Clock-In from 08:00 to 07:30
5. [Save]
6. Change recorded in audit trail
7. If payroll already run: mark payroll for re-calculation
```

---

## Part 6: Payroll Integration

### How Attendance Feeds Payroll

```
Payroll calculation flow:

1. Finance clicks /payroll → [Run Payroll]

2. System queries attendance:
   SELECT * FROM attendance
   WHERE companyId = :id
     AND date BETWEEN :startDate AND :endDate
     AND sourceType IN ('MANUAL_UPLOAD', 'QR_SCAN', 'GPS_CHECK', 'MOBILE_APP')
   
   Note: sourceType allows filtering later when QR/GPS added

3. Calculate:
   - Present days: COUNT WHERE status = PRESENT OR duration > 0
   - Absent days: COUNT WHERE status = ABSENT
   - Late deductions: SUM(penalty) WHERE clockIn > expected (9:00 AM)
   - Worked hours: SUM(duration)

4. Example:
   Employee: Budi Santoso
   Working days in month: 22
   Attendance records: 20 days PRESENT, 2 days ABSENT
   Late records: 3 days (late deduction -50K each = -150K)
   
   In payroll:
     Base salary: 5,000,000
     Late deductions: -150,000
     Absent deductions: -2 * (5M / 22) = -454,545
     ──────────────
     Net deduction: -604,545

5. Payslip shows:
   "Attendance: 20/22 days (2 absent, 3 late)"
```

---

## Part 7: Transition Path (Future)

**When mobile app is ready (Q1 2027):**

```
Current (Q3 2026):
  ✅ Manual Excel upload
  ❌ No QR/GPS/mobile

Transition (Q4 2026 - Q1 2027):
  ✅ Excel upload (still works)
  ✅ Mobile app clock-in (new)
  ✅ Employee can choose
  → sourceType field tracks source

Eventually (Q2 2027+):
  ✅ Excel upload (optional for bulk correction)
  ✅ Mobile app (primary)
  ✅ Auto-calculation (no manual needed)
  → sourceType = "MOBILE_APP" for most records
```

**Data migration:**

```
No migration needed.
- Old records: sourceType = "MANUAL_UPLOAD"
- New records: sourceType = "MOBILE_APP"
- Payroll logic same for both
- Works seamlessly
```

---

## Part 8: Success Criteria

### For MVP (Q3 2026)

```
✅ Template generation works (<1 second)
✅ File upload works (.xlsx, <5MB)
✅ Validation catches all errors
✅ Dry-run preview accurate
✅ Import completes 100 records in <5 seconds
✅ Attendance list shows imported data
✅ Payroll correctly uses attendance data
✅ Late deductions calculated correctly
✅ Dashboard shows upload summary
✅ Audit trail tracks imports
```

### Acceptance Criteria

```
User acceptance:
  [ ] HR can download template
  [ ] HR can fill template in Excel
  [ ] HR can upload without errors (valid file)
  [ ] HR can view imported data
  [ ] Finance can run payroll on imported attendance
  [ ] Payslip shows correct late deductions
  [ ] Late deduction amount is correct

Technical:
  [ ] API validates file + data
  [ ] Database constraints prevent duplicates
  [ ] Audit log records all imports
  [ ] Error messages are clear
  [ ] Dry-run matches actual import
  [ ] No data loss during import
```

---

## Part 9: Deferred Features (Not in MVP)

```
❌ QR code scanning (requires mobile app)
❌ GPS check-in (requires mobile app)
❌ WiFi SSID detection (requires mobile app)
❌ Biometric/face recognition (requires hardware + config)
❌ Real-time clock-in dashboard
❌ Mobile app clock-in
❌ Geofence validation
❌ Offline sync queue
❌ Push notifications for late check-in

→ All above will be added in Phase 3 (Q1 2027) when mobile app launches
```

---

## Summary

**Excel-based attendance MVP:**
- ✅ Simple: Download template → Fill → Upload
- ✅ No mobile app needed
- ✅ Works for payroll: Late deductions calculated
- ✅ HR-friendly: Uses Excel (familiar tool)
- ✅ Fast to implement: 2 weeks
- ✅ Scalable: Works for 50-500 employees
- ✅ Migration-ready: Can switch to mobile later

**Go-live date:** Week 3 (data import tools) + 1 week (integration to payroll)  
**Cost:** Included in web MVP ($35-40K total)  
**Impact:** Removes major blocker (QR/GPS/mobile) for pilot launch

---

*Last Updated: July 18, 2026 | Owner: Dozer | Status: Ready for SRS*

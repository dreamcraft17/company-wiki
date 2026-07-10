# dnPeople HRIS - Software Requirements Specification (SRS)

**Version:** 3.1  
**Last Updated:** July 10, 2026  
**Status:** Active Development — **MVP 1–4 core implemented** in repo `dnpeople`  
**Prepared by:** DN Tech Engineering

> **Implementation:** [../docs/IMPLEMENTATION-STATUS.md](../docs/IMPLEMENTATION-STATUS.md) · API live: [../docs/API.md](../docs/API.md) · Snapshot: [../current-implementation.md](../current-implementation.md) · Index: [../00_INDEX.md](../00_INDEX.md)

---

## 1. Introduction

This document specifies detailed functional and technical requirements for dnPeople HRIS system. It defines what the system must do, how it should behave, and constraints it must respect.

### Document Purpose
- Define precise functional requirements for development
- Establish testing criteria
- Document API contracts
- Specify data models and validation rules

### Scope
- Original SRS depth: MVP 1 (Attendance, Leave, Payroll, Dashboard, Reports)
- **Implemented in code (July 2026):** MVP 1–4 core — see IMPLEMENTATION-STATUS for gaps (e.g. full SSO handshake, LLM assistant)
- Technical implementation details
- Performance requirements
- Security & compliance requirements

---

## 2. Functional Requirements

### 2.1 User Management & Authentication

#### FR-UM-001: User Registration & Login
**Description:** Users can register and login to the system

**Requirements:**
- Support login with email & password
- Support 2FA (OTP via email/SMS) - optional for initial MVP
- Password requirements: min 8 chars, 1 uppercase, 1 number, 1 special char
- Forgot password functionality (email reset link)
- Session timeout after 30 minutes inactivity
- Logout functionality
- Login audit trail (timestamp, IP, success/failure)
- Prevent brute force (lock after 5 failed attempts for 30 min)

**API Endpoints:**
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET /api/auth/verify-session
POST /api/auth/refresh-token
```

**Error Handling:**
- Invalid credentials → 401 Unauthorized
- Account locked → 429 Too Many Requests
- Invalid token → 401 Unauthorized
- Email not found → 404 Not Found

---

#### FR-UM-002: Role & Permission Management
**Description:** System enforces role-based access control

**Roles Defined:**
1. **Super Admin** - Full system access, manage subscriptions
2. **Company Admin** - Full company access, manage HR operations
3. **Manager** - Own department + team visibility
4. **Finance Officer** - Payroll, compensation, finance reports
5. **Employee** - Own data + company-wide announcements

**Module Access Matrix:**

| Module | Super Admin | Company Admin | Manager | Finance | Employee |
|--------|-------------|---------------|---------|---------|----------|
| Employee DB | View/Edit All | View/Edit All | View Own Dept | View Own Dept | View Own |
| Attendance | View All | View All | View Team | View All | View Own |
| Leave | Manage All | Manage All | Approve | View All | Request Own |
| Payroll | View | Edit | - | Full Control | View Own |
| Dashboard | System | Company | Department | Finance | Personal |
| Reports | System | Company | Department | Finance | - |

**Permissions Table:**
- create_employee
- read_employee
- update_employee
- delete_employee (soft delete only)
- create_attendance
- view_attendance_all / view_attendance_dept / view_attendance_own
- approve_leave
- create_leave
- manage_payroll
- generate_reports
- manage_users
- etc.

**Requirements:**
- Permission check on every API call
- Granular data-level access control
- Cannot escalate own permissions
- Permission changes logged in audit trail
- Support permission delegation (manager absent)

**API Endpoints:**
```
POST /api/users/{userId}/roles
DELETE /api/users/{userId}/roles/{roleId}
GET /api/roles
GET /api/roles/{roleId}/permissions
PATCH /api/users/{userId}/permissions
```

---

### 2.2 Company Setup & Configuration

#### FR-CS-001: Company Profile Setup
**Description:** HR Admin sets up company profile on first login

**Requirements:**
- Company name, legal name, registration number
- Address, phone, email
- Company logo (max 5MB, jpg/png)
- Tax ID (NPWP), Business License (SIUP)
- Employee count estimate (for capacity planning)
- Work schedule (9am-5pm default, customizable)
- Fiscal year start (Jan default)
- Timezone (WIB default)
- Currency (IDR default)
- Approval hierarchy configuration

**Database Schema:**
```
Table: companies
- id: UUID
- name: String (required)
- legal_name: String
- registration_number: String
- logo_url: String
- address: String
- city: String
- province: String
- country: String (default: Indonesia)
- phone: String
- email: String
- npwp: String
- siup: String
- work_start_time: Time (default: 09:00)
- work_end_time: Time (default: 17:00)
- timezone: String (default: Asia/Jakarta)
- currency: String (default: IDR)
- fiscal_year_start: Int (default: 1)
- logo_url: String
- created_at: Timestamp
- updated_at: Timestamp
```

**API Endpoints:**
```
POST /api/companies
GET /api/companies/{companyId}
PATCH /api/companies/{companyId}
GET /api/companies/{companyId}/config
PATCH /api/companies/{companyId}/config
```

---

#### FR-CS-002: Organization Structure
**Description:** Define company hierarchy (department, position, level)

**Entities:**

**1. Department**
```
Table: departments
- id: UUID
- company_id: UUID (FK)
- name: String (required)
- description: String
- parent_department_id: UUID (FK - for nested departments)
- created_at: Timestamp
- updated_at: Timestamp
```

**2. Position**
```
Table: positions
- id: UUID
- company_id: UUID (FK)
- name: String (required) - e.g., "Senior Developer"
- description: String
- department_id: UUID (FK)
- level_id: UUID (FK)
- job_description: String
- salary_range_min: Decimal
- salary_range_max: Decimal
- created_at: Timestamp
- updated_at: Timestamp
```

**3. Level**
```
Table: levels
- id: UUID
- company_id: UUID (FK)
- name: String (required) - e.g., "L3", "Middle", "Senior"
- order: Int (for hierarchy)
- created_at: Timestamp
- updated_at: Timestamp
```

**4. Work Location**
```
Table: work_locations
- id: UUID
- company_id: UUID (FK)
- name: String (required) - e.g., "Jakarta HQ"
- address: String
- latitude: Decimal (for GPS verification)
- longitude: Decimal
- radius_meters: Int (geofence radius)
- created_at: Timestamp
- updated_at: Timestamp
```

**Requirements:**
- Support nested departments (dept → sub-dept → team)
- Define position hierarchy (senior < manager < director)
- Track office locations for attendance verification
- Approval routing based on org structure

**API Endpoints:**
```
POST/GET/PATCH/DELETE /api/departments
POST/GET/PATCH/DELETE /api/positions
POST/GET/PATCH/DELETE /api/levels
POST/GET/PATCH/DELETE /api/work-locations
GET /api/org-chart (visualization data)
```

---

### 2.3 Employee Database

#### FR-ED-001: Employee Data Management
**Description:** Create and maintain complete employee records

**Employee Profile Data:**

```
Table: employees
- id: UUID
- company_id: UUID (FK)
- user_id: UUID (FK - if employee has login)
- employee_id: String (unique per company) - e.g., "EMP-2026-001"
- status: Enum (active, inactive, contract_ended, resigned)
- employment_type: Enum (permanent, contract, intern, probation, freelance)
- first_name: String (required)
- last_name: String
- email: String (required)
- phone: String
- birth_date: Date
- gender: Enum (M, F)
- marital_status: Enum (single, married, divorced, widowed)
- nationality: String (default: Indonesia)
- religion: Enum (optional)
- photo_url: String (max 5MB)
- department_id: UUID (FK)
- position_id: UUID (FK)
- manager_id: UUID (FK - employee.id, nullable)
- level_id: UUID (FK)
- work_location_id: UUID (FK)
- cost_center: String (for cost allocation)
- employee_since_date: Date
- contract_start_date: Date (nullable)
- contract_end_date: Date (nullable)
- probation_end_date: Date (nullable)
- created_at: Timestamp
- updated_at: Timestamp
- deleted_at: Timestamp (soft delete)
```

**Contact Data:**
```
Table: employee_contacts
- id: UUID
- employee_id: UUID (FK)
- contact_type: Enum (emergency, family)
- name: String
- relationship: String
- phone: String
- address: String (optional)
```

**Bank Account Data:**
```
Table: employee_bank_accounts
- id: UUID
- employee_id: UUID (FK)
- bank_name: String (required)
- account_number: String (required, encrypted)
- account_holder: String
- account_type: Enum (savings, checking)
- is_primary: Boolean (for salary transfer)
```

**Tax & Social Security:**
```
Table: employee_tax_info
- id: UUID
- employee_id: UUID (FK)
- npwp: String (encrypted, unique)
- npwp_name: String
- ptkp_status: Enum (TK/0, TK/1, K/0, K/1, K/2, K/3, etc)
- nppkp: String (optional)
- bpjs_kesehatan_number: String
- bpjs_kesehatan_family_count: Int
- bpjs_ketenagakerjaan_number: String
- bpjs_kesehatan_status: Enum (active, inactive)
- bpjs_ketenagakerjaan_status: Enum (active, inactive)
```

**Identification Data:**
```
Table: employee_identifications
- id: UUID
- employee_id: UUID (FK)
- type: Enum (ktp, npwp, kk, paspor, sim)
- number: String (encrypted)
- issue_date: Date
- expiry_date: Date (nullable)
- issue_location: String
```

**Education Data:**
```
Table: employee_education
- id: UUID
- employee_id: UUID (FK)
- level: Enum (SD, SMP, SMA, D3, S1, S2, S3)
- field: String (e.g., "Computer Science")
- institution: String
- graduation_year: Int
- gpa: Decimal (optional, 0-4.0)
- certificate_url: String (document reference)
```

**Document Management:**
```
Table: employee_documents
- id: UUID
- employee_id: UUID (FK)
- type: Enum (ktp, npwp, kk, ijazah, cv, sertifikat, kontrak, sp, paklaring, etc)
- file_name: String
- file_url: String (encrypted storage)
- file_size: Int (bytes)
- upload_date: Timestamp
- expiry_date: Date (nullable, for documents needing renewal)
- notes: String
```

**Requirements:**
- Employee ID auto-generated (format: EMP-YYYY-NNN)
- Support 5 employment types with different payroll treatment
- Encrypt sensitive data (NPWP, bank account, ID numbers)
- Audit trail on all changes
- Soft delete (mark deleted_at, not permanently remove)
- Prevent duplicate NPWP/email
- Mandatory fields: name, email, position, department
- Optional 2FA for employees (enable later)

**Validations:**
- Email format validation
- Phone number format (Indonesian +62 or 0xxx)
- Birth date <= current date - 18 years
- Contract dates: start <= end
- NPWP format: 15 digits
- Bank account number: 10-17 digits per bank

**API Endpoints:**
```
POST /api/employees
GET /api/employees (with pagination, filters, search)
GET /api/employees/{employeeId}
PATCH /api/employees/{employeeId}
DELETE /api/employees/{employeeId} (soft delete)
POST /api/employees/{employeeId}/documents
GET /api/employees/{employeeId}/documents
PATCH /api/employees/{employeeId}/status
POST /api/employees/bulk-import (CSV)
GET /api/employees/export (Excel)
```

---

### 2.4 Attendance Management

#### FR-AT-001: Clock In/Clock Out
**Description:** Employees log attendance via clock in/out

**Requirements:**
- Single click clock in (timestamp + location)
- Single click clock out (timestamp)
- Mobile & web interface
- Offline mode (queue requests, sync on reconnect)
- Show current status (on-time, late, early leave, absent)
- Prevent duplicate clock in within 5 minutes
- Show working hours
- Geolocation (GPS, optional with WiFi fallback)

**Data Model:**
```
Table: attendance_records
- id: UUID
- employee_id: UUID (FK)
- company_id: UUID (FK)
- date: Date
- clock_in_time: Timestamp (required)
- clock_in_latitude: Decimal (optional)
- clock_in_longitude: Decimal (optional)
- clock_in_location: String (address from geo)
- clock_in_device: Enum (web, mobile, qr, selfie)
- clock_out_time: Timestamp (nullable)
- clock_out_latitude: Decimal (optional)
- clock_out_longitude: Decimal (optional)
- clock_out_location: String (address from geo)
- clock_out_device: Enum (web, mobile, qr, selfie)
- working_hours: Decimal (auto-calculated)
- status: Enum (present, late, absent, permitted, sick, leave)
- notes: String (employee's note)
- correction_submitted: Boolean
- corrected_at: Timestamp (nullable)
- corrected_by_user_id: UUID (nullable)
- corrected_reason: String (nullable)
- created_at: Timestamp
- updated_at: Timestamp
```

**Validations:**
- clock_out_time must be after clock_in_time
- Late threshold: >5 min after shift start (configurable)
- Early leave: clock_out >30 min before shift end (configurable)
- Working hours: (clock_out - clock_in) - lunch break
- Missing clock_in/out: auto-marked as absent
- Location verification: within geofence if enabled

**Status Determination Logic:**
```
IF clock_in NULL:
  status = ABSENT
ELSE IF clock_out NULL AND current_time > shift_end:
  status = EARLY_LEAVE
ELSE IF clock_in_time > (shift_start + late_threshold):
  status = LATE
ELSE IF approved_leave/permission exists:
  status = LEAVE/PERMITTED
ELSE:
  status = PRESENT
```

**API Endpoints:**
```
POST /api/attendance/clock-in
POST /api/attendance/clock-out
GET /api/attendance/today
GET /api/attendance/{date}
GET /api/attendance/history (with date range)
PATCH /api/attendance/{recordId}/correction
GET /api/attendance/status
```

---

#### FR-AT-002: Attendance Correction
**Description:** Employees can request attendance correction if system error

**Requirements:**
- Submit correction request with evidence/note
- Manager approves or rejects
- Original & corrected data both stored
- Audit trail (who approved, when, reason)
- Cannot edit data directly (only via correction workflow)
- Bulk correction for manager

**Data Model:**
```
Table: attendance_corrections
- id: UUID
- attendance_record_id: UUID (FK)
- employee_id: UUID (FK)
- requested_at: Timestamp
- requested_by_user_id: UUID (FK)
- reason: String (required)
- attachment_url: String (optional - evidence)
- corrected_clock_in: Timestamp (nullable)
- corrected_clock_out: Timestamp (nullable)
- status: Enum (pending, approved, rejected)
- approved_at: Timestamp (nullable)
- approved_by_user_id: UUID (nullable)
- approval_reason: String (optional)
- created_at: Timestamp
```

**Workflow:**
1. Employee submits correction request
2. Manager notified (email + dashboard)
3. Manager reviews evidence
4. Manager approves/rejects
5. If approved: attendance_records updated, original values preserved
6. Notification sent to employee

**API Endpoints:**
```
POST /api/attendance/corrections
GET /api/attendance/corrections (pending)
PATCH /api/attendance/corrections/{correctionId}/approve
PATCH /api/attendance/corrections/{correctionId}/reject
GET /api/attendance/{recordId}/audit-trail
```

---

#### FR-AT-003: Attendance Dashboard & Reports
**Description:** HR views attendance summary & reports

**Requirements:**
- Today's attendance summary (present, late, absent count)
- Department attendance view
- Individual attendance history (last 30 days default)
- Monthly attendance summary per employee
- Late arrival trends
- Absent-without-leave tracking
- Export to Excel/PDF
- Filter by date range, department, location

**Report Queries:**
```sql
-- Daily attendance summary
SELECT 
  date,
  COUNT(CASE WHEN status = 'PRESENT') as present_count,
  COUNT(CASE WHEN status = 'LATE') as late_count,
  COUNT(CASE WHEN status = 'ABSENT') as absent_count,
  COUNT(*) as total_employees
FROM attendance_records
WHERE date = @date AND company_id = @companyId
GROUP BY date;

-- Monthly summary per employee
SELECT 
  employee_id,
  YEAR(date) as year,
  MONTH(date) as month,
  COUNT(CASE WHEN status = 'PRESENT') as present,
  COUNT(CASE WHEN status = 'LATE') as late,
  COUNT(CASE WHEN status = 'ABSENT') as absent,
  SUM(working_hours) as total_hours
FROM attendance_records
GROUP BY employee_id, YEAR(date), MONTH(date);

-- Late arrival trend
SELECT 
  employee_id,
  COUNT(*) as late_count,
  AVG(EXTRACT(EPOCH FROM (clock_in_time - shift_start))) as avg_lateness_minutes
FROM attendance_records
WHERE status = 'LATE' AND date >= current_date - INTERVAL 30 days
GROUP BY employee_id
ORDER BY late_count DESC;
```

**API Endpoints:**
```
GET /api/attendance/summary
GET /api/attendance/department-summary
GET /api/attendance/report/monthly
GET /api/attendance/report/late-arrivals
GET /api/attendance/report/absenteeism
GET /api/attendance/export (Excel/PDF)
```

---

### 2.5 Leave Management

#### FR-LM-001: Leave Request & Balance
**Description:** Employees request leave with auto-balance tracking

**Leave Types:**
1. Annual Leave (Cuti Tahunan) - 12 days/year standard
2. Sick Leave (Cuti Sakit) - Unlimited (need doctor's note >3 days)
3. Maternity Leave (Cuti Melahirkan) - 3 months
4. Marriage Leave (Cuti Menikah) - 3 days
5. Bereavement (Cuti Kematian) - 1-3 days
6. Unpaid Leave (Cuti Tanpa Bayar) - Configurable
7. Special Leave (Custom by company)

**Data Model:**
```
Table: leave_types
- id: UUID
- company_id: UUID (FK)
- name: String (required)
- code: String (unique per company)
- max_days_per_year: Int (nullable, for unlimited)
- requires_approval: Boolean (default: true)
- requires_attachment: Boolean (default: false)
- description: String
- is_active: Boolean (default: true)

Table: leave_balances
- id: UUID
- employee_id: UUID (FK)
- leave_type_id: UUID (FK)
- year: Int
- allocated: Int (12 for annual, etc)
- used: Int (auto-calculated from approved requests)
- carry_forward: Int (from previous year)
- remaining: Int (allocated + carry_forward - used)
- expiry_date: Date (nullable)
- last_updated: Timestamp

Table: leave_requests
- id: UUID
- employee_id: UUID (FK)
- company_id: UUID (FK)
- leave_type_id: UUID (FK)
- start_date: Date (required)
- end_date: Date (required)
- duration_days: Decimal (auto-calculated, includes weekends)
- business_days: Decimal (auto-calculated, excludes weekends)
- reason: String (optional)
- attachment_url: String (optional - doctor's note, etc)
- replacement_employee_id: UUID (nullable - who covers)
- status: Enum (pending, approved, rejected, cancelled)
- requested_at: Timestamp
- approved_at: Timestamp (nullable)
- approved_by_user_id: UUID (nullable)
- approval_reason: String (nullable)
- created_at: Timestamp
```

**Leave Balance Logic:**
```
remaining_balance = allocated + carry_forward - SUM(approved_requests.business_days)

carry_forward calculation:
- If expiry_date exists and expired: 0
- If expiry_date not reached: min(remaining, company_policy.max_carry_forward)
- Default: 0 (no carry forward)
```

**Duration Calculation:**
```
total_days = (end_date - start_date) + 1
business_days = total_days - COUNTIF(date in [start_date, end_date], date is weekend or holiday)
```

**Requirements:**
- System checks balance before approval
- Auto-deduct approved leave from balance
- Show employee available balance before submission
- Support partial day leave (0.5 days)
- Prevent over-request (reject if insufficient balance)
- Send notifications on request/approval
- History of all leave requests (year view)

**Workflow:**
1. Employee views available balance
2. Employee submits leave request (start date, end date, reason)
3. System validates: sufficient balance, no conflicts
4. Manager notified (email + dashboard)
5. Manager approves/rejects
6. If approved: balance updated, calendar updated
7. Employee notified

**API Endpoints:**
```
GET /api/leave-types
GET /api/leave-balances/{employeeId}
POST /api/leave-requests
GET /api/leave-requests/{employeeId}
PATCH /api/leave-requests/{requestId}/approve
PATCH /api/leave-requests/{requestId}/reject
GET /api/leave/calendar (team view)
GET /api/leave/report
```

---

#### FR-LM-002: Approval Workflow
**Description:** Manager approves/rejects leave requests

**Workflow Rules:**
- Default approver: direct manager (from org structure)
- If manager absent: delegate to specified user
- Multi-level approval: if needed (policy configurable)
- Auto-approve sick leave ≤2 days (configurable)
- Notification on approval, rejection

**Data Model:**
```
Table: approval_workflows
- id: UUID
- company_id: UUID (FK)
- type: Enum (leave, permission, overtime, reimbursement)
- level: Int (1, 2, 3 for multi-level)
- approver_level: Enum (direct_manager, department_head, director)
- auto_approve_conditions: JSON (e.g., {"leave_type": "sick", "max_days": 2})

Table: approvals
- id: UUID
- request_id: UUID (FK - leave_request.id or other)
- request_type: Enum (leave, permission, overtime, reimbursement)
- requested_by_user_id: UUID (FK)
- assigned_to_user_id: UUID (FK)
- level: Int
- status: Enum (pending, approved, rejected)
- action_at: Timestamp (nullable)
- action_by_user_id: UUID (nullable)
- action_reason: String (nullable)
- created_at: Timestamp
```

**Approval Logic:**
```
ON leave_request.submit:
  IF leave_type == 'sick' AND duration <= company.auto_approve_max_sick_days:
    status = APPROVED
    balance -= duration
    send_confirmation_email()
  ELSE:
    approver = get_direct_manager()
    IF approver.is_absent:
      approver = approver.absent_delegate
    create_approval_record(approver, leave_request)
    send_notification(approver)
```

**API Endpoints:**
```
GET /api/approvals/pending
PATCH /api/approvals/{approvalId}/approve
PATCH /api/approvals/{approvalId}/reject
GET /api/approvals/history
GET /api/approvals/workflow-config
PATCH /api/approvals/workflow-config
```

---

### 2.6 Permission Management

#### FR-PM-001: Permission Requests
**Description:** Employees request quick permissions (not full leave)

**Permission Types:**
1. Late Arrival (Izin Datang Terlambat)
2. Early Leave (Izin Pulang Cepat)
3. Going Out (Izin Keluar Kantor)
4. Work From Home (Izin WFH)
5. Official Duty (Izin Dinas Luar)
6. Personal (Izin Keperluan Pribadi)

**Data Model:**
```
Table: permissions
- id: UUID
- employee_id: UUID (FK)
- company_id: UUID (FK)
- permission_type: Enum (late, early_leave, going_out, wfh, official_duty, personal)
- date: Date
- start_time: Time (nullable)
- end_time: Time (nullable)
- duration_minutes: Int (for going_out)
- reason: String
- attachment_url: String (optional)
- status: Enum (pending, approved, rejected)
- requested_at: Timestamp
- approved_at: Timestamp (nullable)
- approved_by_user_id: UUID (nullable)
- created_at: Timestamp
```

**Requirements:**
- Quick submission (1 click approval)
- Same-day processing
- Update attendance status on approval
- Manager gets mobile notification
- History of permissions per month
- Export permission report

**API Endpoints:**
```
POST /api/permissions
GET /api/permissions (pending for manager)
GET /api/permissions/{employeeId}
PATCH /api/permissions/{permissionId}/approve
PATCH /api/permissions/{permissionId}/reject
GET /api/permissions/report
```

---

### 2.7 Payroll Management

#### FR-PM-001: Payroll Components
**Description:** Configure salary components for calculation

**Data Model:**
```
Table: salary_components
- id: UUID
- company_id: UUID (FK)
- name: String (required)
- component_type: Enum (earning, deduction)
- category: Enum (basic, allowance, bonus, deduction, tax, bpjs, loan, etc)
- frequency: Enum (monthly, one-time, project-based)
- is_fixed: Boolean (true for basic salary, false for variable)
- calculation_type: Enum (fixed_amount, percentage, formula)
- base_percentage: Decimal (if percentage-based)
- formula: String (optional - for complex calculations)
- order: Int (display order)
- is_active: Boolean
- effective_date: Date
- created_at: Timestamp

Table: employee_salary_components
- id: UUID
- employee_id: UUID (FK)
- salary_component_id: UUID (FK)
- amount: Decimal (for fixed amounts)
- percentage: Decimal (for percentage-based)
- effective_from: Date
- effective_to: Date (nullable)
- created_at: Timestamp
```

**Standard Components (Indonesia):**

**Earnings:**
- Basic Salary (Gaji Pokok)
- Housing Allowance (Tunjangan Perumahan)
- Transport Allowance (Tunjangan Transportasi)
- Meal Allowance (Tunjangan Makan)
- Position Allowance (Tunjangan Jabatan)
- Family Allowance (Tunjangan Keluarga)
- Overtime (Lembur)
- Bonus (Bonus Kinerja)
- Incentive (Insentif)

**Deductions:**
- BPJS Kesehatan (Employee contribution)
- BPJS Ketenagakerjaan (Employee contribution)
- PPh 21 (Personal Income Tax)
- Employee Loan Deduction (Potongan Kasbon)
- Union Fees (Iuran Union, optional)
- Advance Salary (Potongan Gaji Dimuka)

**Requirements:**
- Set effective dates (component active/inactive)
- Support fixed amount & percentage-based
- Support formulas (e.g., "basic * 10%")
- Audit trail on component changes
- Historical tracking (for payroll revision)

**API Endpoints:**
```
POST/GET/PATCH/DELETE /api/salary-components
POST/GET/PATCH /api/employees/{employeeId}/salary-components
GET /api/salary-components/templates (Indonesia standard)
```

---

#### FR-PM-002: Payroll Calculation
**Description:** Auto-calculate monthly payroll for all employees

**Payroll Engine:**

```
FUNCTION calculate_payroll(employee_id, period_year, period_month):
  
  // 1. Get employee salary components
  components = GET employee_salary_components(employee_id, period_year, period_month)
  
  // 2. Calculate earnings
  earnings = CALCULATE_EARNINGS(components)
    - Basic salary (fixed)
    - Allowances (fixed or calculated)
    - Overtime (from overtime_records)
    - Bonus (from input)
    - Incentive (from input)
  
  gross_income = SUM(earnings)
  
  // 3. Calculate BPJS (before tax)
  bpjs_kesehatan_employee = CALCULATE_BPJS_KESEHATAN(gross_income, employee_tax_info.bpjs_family_count)
  bpjs_ketenagakerjaan_employee = CALCULATE_BPJS_KETENAGAKERJAAN(gross_income)
  
  // 4. Calculate PPh 21 (after BPJS)
  taxable_income = gross_income - bpjs_kesehatan_employee - bpjs_ketenagakerjaan_employee
  pph21 = CALCULATE_PPH21(taxable_income, employee_tax_info.ptkp_status)
  
  // 5. Calculate other deductions
  employee_loans = GET_ACTIVE_LOANS(employee_id)
  loan_deduction = SUM(employee_loans.monthly_installment)
  
  other_deductions = GET_DEDUCTIONS(employee_id, period)
  
  // 6. Calculate net salary
  total_deductions = bpjs_kesehatan_employee + bpjs_ketenagakerjaan_employee + pph21 + loan_deduction + other_deductions
  net_salary = gross_income - total_deductions
  
  // 7. Employer contributions (not deducted from employee)
  bpjs_kesehatan_employer = CALCULATE_BPJS_KESEHATAN_EMPLOYER(gross_income)
  bpjs_ketenagakerjaan_employer = CALCULATE_BPJS_KETENAGAKERJAAN_EMPLOYER(gross_income)
  
  // 8. Create payroll record
  payroll_record = {
    employee_id: employee_id,
    period: period,
    gross_income: gross_income,
    earnings: earnings,
    deductions: {
      bpjs_kesehatan: bpjs_kesehatan_employee,
      bpjs_ketenagakerjaan: bpjs_ketenagakerjaan_employee,
      pph21: pph21,
      loan_deduction: loan_deduction,
      other: other_deductions
    },
    total_deductions: total_deductions,
    net_salary: net_salary,
    employer_contributions: {
      bpjs_kesehatan: bpjs_kesehatan_employer,
      bpjs_ketenagakerjaan: bpjs_ketenagakerjaan_employer
    },
    status: 'DRAFT'
  }
  
  SAVE payroll_record
  RETURN payroll_record
```

**Data Model:**
```
Table: payrolls
- id: UUID
- company_id: UUID (FK)
- employee_id: UUID (FK)
- period_year: Int
- period_month: Int
- period_start_date: Date
- period_end_date: Date
- gross_income: Decimal
- total_deductions: Decimal
- net_salary: Decimal
- status: Enum (draft, finalized, paid, cancelled)
- finalized_at: Timestamp (nullable)
- finalized_by_user_id: UUID (nullable)
- paid_at: Timestamp (nullable)
- created_at: Timestamp

Table: payroll_items
- id: UUID
- payroll_id: UUID (FK)
- salary_component_id: UUID (FK)
- component_name: String (denormalized for history)
- component_type: Enum (earning, deduction)
- amount: Decimal
- description: String (optional)

Table: payroll_deductions
- id: UUID
- payroll_id: UUID (FK)
- deduction_type: Enum (bpjs_kesehatan, bpjs_ketenagakerjaan, pph21, loan, other)
- amount: Decimal
- reference: String (e.g., loan_id)

Table: payroll_employer_contributions
- id: UUID
- payroll_id: UUID (FK)
- contribution_type: Enum (bpjs_kesehatan, bpjs_ketenagakerjaan)
- amount: Decimal
```

**BPJS Calculation Rules (2024):**

BPJS Kesehatan (health insurance):
- Employee contribution: Tiered (1.0%, 1.5%, 2.0% based on family count)
- Employer contribution: 3%
- max_contribution_base: 12 juta per bulan

BPJS Ketenagakerjaan (employment insurance):
- Employee contribution: 0.24%
- Employer contribution: 3.7% (JKK + JKP + JHT)

PPh 21 Calculation (monthly):
- Tax = (Gross - BPJS - PTKP/12) * Tax Rate
- Tax rates: 5% (1st bracket), 15%, 25%, 30%, 35% (graduated)
- PTKP values: TK/0: 0, TK/1: 54.45M, K/0: 63M, K/3: 81M, etc

**Requirements:**
- Support multiple tax calculation methods (monthly, annual, gross, net)
- Monthly tax reconciliation with annual
- Proration for mid-month employees
- Undo/recalculate functionality
- Audit trail for all changes
- Prevent accidental modification (lock after finalization)
- Support partial payroll (some employees only)

**API Endpoints:**
```
POST /api/payrolls/calculate-period
GET /api/payrolls/{payrollId}
GET /api/payrolls (list by period)
POST /api/payrolls/{payrollId}/finalize
POST /api/payrolls/{payrollId}/undo
GET /api/payrolls/{payrollId}/breakdown
PATCH /api/payrolls/{payrollId}/items/{itemId}
PATCH /api/payroll-config/tax-rates
PATCH /api/payroll-config/bpjs-rates
```

---

#### FR-PM-003: Payslip Generation
**Description:** Generate and distribute payslips to employees

**Data Model:**
```
Table: payslips
- id: UUID
- payroll_id: UUID (FK)
- employee_id: UUID (FK)
- company_id: UUID (FK)
- period_year: Int
- period_month: Int
- generated_at: Timestamp
- signed_by_user_id: UUID (nullable - HR/Finance officer)
- signed_at: Timestamp (nullable)
- delivered_at: Timestamp (nullable)
- viewed_by_employee_at: Timestamp (nullable)
```

**Payslip Format (PDF):**
- Company header (logo, name, address)
- Employee info (name, ID, position, department)
- Period (month/year)
- Earnings breakdown
- Deductions breakdown
- Net salary
- YTD summary
- Digital signature space
- Company stamp/seal

**Requirements:**
- Auto-generate PDF after payroll finalization
- Include all earnings & deductions with amounts
- Show YTD (year-to-date) summary
- Password-protect PDF (employee ID as password)
- Digital signature capability
- Email delivery to employee
- Track delivery & viewing
- Bulk export for HR records
- Downloadable by employee via portal

**Validations:**
- Only generate after payroll finalized
- One payslip per employee per period
- Regenerate if payroll recalculated
- PDF archival for audit

**API Endpoints:**
```
POST /api/payslips/generate-batch
GET /api/payslips/{payslipId}
GET /api/payslips/{payslipId}/pdf
POST /api/payslips/{payslipId}/send
GET /api/payslips (employee history)
GET /api/payslips/report
```

---

### 2.8 Dashboard & Reporting

#### FR-DR-001: HR Dashboard
**Description:** Real-time HR metrics and overview

**Dashboard Widgets:**

1. **Summary Cards**
   - Total active employees
   - Total employees by status (permanent, contract, probation)
   - Today's attendance (present, late, absent)
   - Pending approvals (leave, permission, overtime)

2. **Attendance Section**
   - Daily clock in/out summary
   - Late arrivals (last 7 days)
   - Absent today
   - Work from home count

3. **Leave & Permission**
   - Pending leave requests
   - Approved leave this month
   - Employees on leave today
   - Leave calendar widget

4. **Payroll Section**
   - Current month payroll status
   - Payroll processing progress
   - Next payroll date
   - Recent payslips generated

5. **Employee Section**
   - New employees (this month)
   - Recent resignations
   - Contract expiring soon (30 days)
   - Birthdays this month

6. **Charts & Analytics**
   - Attendance trend (7-day, 30-day)
   - Absenteeism rate
   - Late arrival distribution
   - Turnover by department

**Data Model:**
```
View: dashboard_summary
- total_employees: Int
- active_employees: Int
- contract_employees: Int
- probation_employees: Int
- today_present: Int
- today_late: Int
- today_absent: Int
- today_wfh: Int
- pending_leave_approvals: Int
- pending_permission_approvals: Int
- pending_overtime_approvals: Int
- payroll_status: String
- employees_on_leave_today: Int
```

**Requirements:**
- Real-time data (refresh every 5 minutes)
- Role-based dashboard (different for HR, Manager, Finance)
- Customizable widgets (drag-drop)
- Export dashboard as PDF
- Mobile responsive
- Fast load time (<2s)

**API Endpoints:**
```
GET /api/dashboard/summary
GET /api/dashboard/attendance-today
GET /api/dashboard/pending-approvals
GET /api/dashboard/payroll-status
GET /api/dashboard/leave-calendar
GET /api/dashboard/employee-milestones
```

---

#### FR-DR-002: Reports & Export
**Description:** Generate various HR reports

**Report Types:**

1. **Attendance Report**
   - Daily/weekly/monthly summary
   - Late arrival analysis
   - Absence tracking
   - Attendance by department

2. **Payroll Report**
   - Payroll summary
   - Per-employee payroll detail
   - Component breakdown
   - Tax summary
   - BPJS summary

3. **Leave Report**
   - Leave usage by type
   - Leave balance forecast
   - Leave by department
   - Peak leave periods

4. **Employee Report**
   - Headcount by department
   - Organizational structure
   - Employee status distribution
   - Tenure analysis

5. **Compliance Report**
   - Overtime summary
   - Shift adherence
   - Policy violations (optional)

**Export Formats:**
- PDF (formatted report)
- Excel (raw data, formulas preserved)
- CSV (for external systems)

**Report UI:**
- Date range picker
- Department/location filter
- Export format selector
- Schedule report (email daily/weekly/monthly)
- Report templates (preset filters)

**Requirements:**
- Sub-2s report generation (optimized queries)
- Pagination for large datasets
- Data validation before export
- Audit trail (who exported what, when)
- Bulk export support

**API Endpoints:**
```
POST /api/reports/generate
GET /api/reports/{reportId}
GET /api/reports/{reportId}/download
GET /api/reports (saved reports)
POST /api/reports/schedule
GET /api/reports/templates
```

---

## 3. Non-Functional Requirements

### 3.1 Performance Requirements

| Requirement | Target | Threshold |
|------------|--------|-----------|
| API Response Time | <200ms | 95th percentile |
| Page Load Time | <2s | 95th percentile |
| Database Query | <100ms | Most queries |
| Bulk Operations | <10s | 1000 records |
| Report Generation | <5s | All standard reports |
| File Upload | <5MB | Per file |
| Concurrent Users | 10,000 | Peak load |
| Daily Active Users | 1,000 | MVP 1 target |

### 3.2 Scalability

- Database: Support 10M+ attendance records (indexes on date, employee_id, company_id)
- Storage: Support 100+ companies with 100K employees each
- API: Stateless, horizontally scalable (Docker containers)
- Caching: Redis for sessions, query caching
- CDN: Static assets via Cloudflare

### 3.3 Availability & Reliability

- **SLA:** 99.9% uptime
- **RTO (Recovery Time Objective):** <1 hour
- **RPO (Recovery Point Objective):** <5 minutes
- **Backup:** Daily automated, 30-day retention
- **Disaster Recovery:** Multi-region ready (future)

### 3.4 Security & Compliance

- **Data Encryption:**
  - At rest: AES-256 (PostgreSQL encryption)
  - In transit: TLS 1.3
  - Sensitive fields: Double encryption (app + DB)

- **Authentication & Authorization:**
  - JWT with 1-hour expiration
  - Refresh token with 7-day expiration
  - 2FA support (email/SMS OTP) - future
  - Session timeout: 30 minutes inactivity

- **Audit & Compliance:**
  - Complete audit trail (who, what, when, where)
  - 7-year log retention
  - Digital signatures on documents
  - Compliance with UU PDP (Indonesian Data Protection Law)

- **Access Control:**
  - RBAC (Role-Based Access Control)
  - ABAC ready (Attribute-Based, future)
  - Data masking for sensitive fields
  - Field-level encryption for NPWP, bank accounts

### 3.5 Usability Requirements

- UI Language: Indonesian primary, English support
- Accessibility: WCAG 2.1 AA compliance
- Mobile: Responsive (320px - 1920px)
- Browser Support: Chrome, Firefox, Safari (latest 2 versions)
- Help: In-app help, video tutorials, FAQ

---

## 4. Data Requirements & Validation

### 4.1 Data Validation Rules

**Employee Data:**
- Email: Must be unique per company
- NPWP: 15 digits, unique per system
- Phone: Indonesian format (+62 or 0xxx)
- Bank Account: 10-17 digits per bank

**Attendance Data:**
- clock_in_time < clock_out_time
- working_hours: Between 0-24
- date: Cannot be future date

**Leave Data:**
- start_date <= end_date
- duration > 0
- Available balance >= requested days
- Cannot request leave for past dates (except correction)

**Payroll Data:**
- Gross salary >= 0
- All components >= 0
- Total deductions <= gross salary
- Net salary = gross - deductions
- BPJS rate: Within official limits (1%-3%)
- PPh21: Must match tax brackets

### 4.2 Data Integrity

- Foreign key constraints
- Unique constraints (NPWP, email per company)
- Check constraints (dates, amounts, status enums)
- Not-null constraints on required fields
- Cascading deletes (soft only, never hard delete)

### 4.3 Data Retention Policy

- Active employee data: Permanent retention
- Resigned employee data: 7-year retention (legal requirement)
- Attendance records: 7-year retention
- Payroll records: 7-year retention (tax compliance)
- Audit logs: 7-year retention
- Deleted data: 30-day soft delete retention, then permanent delete

---

## 5. Integration Requirements

### 5.1 Email Integration
- SendGrid / AWS SES for transactional emails
- Email templates (Handlebars)
- Attachments support (payslips as PDF)
- Batch sending (bulk notifications)
- Open/click tracking (optional)

### 5.2 File Storage
- DigitalOcean Spaces / AWS S3
- Document types: JPEG, PNG, PDF, DOC, DOCX (max 5MB)
- Encrypted storage
- Auto-backup to secondary region
- CDN delivery for public files

### 5.3 SMS/WhatsApp (Future MVP 2)
- Twilio for SMS/WhatsApp
- Approval notifications via SMS
- Attendance reminders

### 5.4 Bank Integration (Future MVP 2)
- Salary transfer file generation (ACH, GIRO)
- Format: BCA, BRI, Mandiri specific formats
- Batch validation
- Transfer reconciliation

### 5.5 E-Signature (Future MVP 2)
- DocuSign / SignAnyWhere integration
- Document signing workflows
- Signature verification

---

## 6. Testing Requirements

### 6.1 Unit Tests
- Target: >80% code coverage
- Test Framework: Jest (Node.js), Vitest (React)
- TDD for critical functions (payroll, tax calculation)

### 6.2 Integration Tests
- API endpoint tests (all CRUD operations)
- Database integration tests
- Email delivery verification
- File upload/storage tests

### 6.3 System Tests
- End-to-end workflows (leave request → approval → balance update)
- Multi-user scenarios (concurrent requests)
- Data consistency tests

### 6.4 Performance Tests
- Load testing: 1000+ concurrent users
- Stress testing: Peak load scenarios
- Database query performance
- API response time under load

### 6.5 Security Tests
- OWASP Top 10 validation
- SQL injection prevention
- XSS prevention
- CSRF protection
- Authentication/authorization tests
- Encryption validation

### 6.6 UAT (User Acceptance Testing)
- HR team testing (attendance, leave, payroll)
- Manager testing (approvals, team management)
- Finance testing (payroll accuracy, tax calculation)
- Employee testing (self-service features)

---

## 7. Deployment & DevOps

### 7.1 Infrastructure
- Docker containers (app, API, PostgreSQL)
- Docker Compose for local dev
- DigitalOcean App Platform / Kubernetes for prod
- Environment: Dev, Staging, Production
- CI/CD: GitHub Actions

### 7.2 Environment Configuration
- Environment variables (.env per environment)
- Secrets management (GitHub Secrets, HashiCorp Vault)
- Database migrations (Prisma)
- Feature flags (LaunchDarkly, optional)

### 7.3 Monitoring & Logging
- Logging: Winston (Node.js), Pino (optional)
- Centralized logs: DigitalOcean Logs / Datadog
- Application monitoring: New Relic / Datadog
- Error tracking: Sentry
- Uptime monitoring: StatusPage.io

### 7.4 Database
- PostgreSQL 15+
- Automatic backups (daily, 30-day retention)
- Point-in-time recovery
- Read replicas for reporting (future)
- Connection pooling (PgBouncer)

---

## Appendix A: API Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response payload */ },
  "meta": {
    "timestamp": "2026-07-09T10:30:00Z",
    "version": "1.0"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "INVALID_LEAVE_BALANCE",
    "message": "Insufficient leave balance",
    "details": {
      "requested": 5,
      "available": 3
    }
  },
  "meta": {
    "timestamp": "2026-07-09T10:30:00Z",
    "request_id": "req_xyz123"
  }
}
```

### Pagination
```json
{
  "success": true,
  "data": [ /* records */ ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1250,
    "pages": 25
  }
}
```

---

## Appendix B: Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dnpeople
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20

# Email
SENDGRID_API_KEY=sg_xxx
SENDGRID_FROM_EMAIL=noreply@dnpeople.id

# File Storage
DO_SPACES_KEY=xxx
DO_SPACES_SECRET=xxx
DO_SPACES_BUCKET=dnpeople
DO_SPACES_REGION=sgp1

# JWT
JWT_SECRET=xxx (min 32 chars)
JWT_EXPIRY=3600
REFRESH_TOKEN_EXPIRY=604800

# Server
NODE_ENV=production
PORT=3000
API_BASE_URL=https://api.dnpeople.id
FRONTEND_URL=https://app.dnpeople.id

# Monitoring
SENTRY_DSN=https://xxx
DATADOG_API_KEY=xxx
DATADOG_SITE=datadoghq.com
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-06-01 | Dozer | Initial SRS creation |
| 2.0 | 2025-01-15 | Dozer | Added MVP 2 features (shift, overtime, reimbursement) |
| 3.0 | 2026-07-09 | Dozer | Updated for dnPeople v3, added detailed specs |
| 3.1 | 2026-07-10 | Dozer | Status sync: MVP 1–4 core implemented (`dnpeople` 0.4.0) |

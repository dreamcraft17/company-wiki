# dnPeople Internal Career Marketplace
## Software Requirements Specification (SRS) v16.0

**Bahasa:** Bahasa Indonesia  
**Tanggal:** 10 Agustus 2026  
**Status:** Ready for Implementation  

---

## 1. FUNCTIONAL REQUIREMENTS

### FR1: Internal Job CRUD (HR)

**Description:** HR create, edit, publish, close internal jobs

**Priority:** P0

**Acceptance Criteria:**

**FR1.1 — Create Job**
- [ ] HR accesses `/career/jobs/new` (requires PROFESSIONAL+ tier)
- [ ] Form fields: title (required), department (FK), position (FK), description (required, TEXT), requirements (optional, TEXT), deadline (required, DATE future), tier minimum (optional, ENUM)
- [ ] Validation: title min 5 chars, deadline must be future date
- [ ] Save as DRAFT → status = "DRAFT"
- [ ] Confirmation: "Job created as draft"
- [ ] Job now in job list (DRAFT view, HR only)

**FR1.2 — Edit Job**
- [ ] DRAFT: all fields editable
- [ ] PUBLISHED: only deadline + description editable (title/dept/position frozen)
- [ ] CLOSED/FILLED: read-only view
- [ ] Save → audit log updated state
- [ ] Validation: same as create

**FR1.3 — Publish Job**
- [ ] DRAFT job → click "Publish" button
- [ ] Confirmation: "Publishing makes job visible to employees"
- [ ] Status changes to PUBLISHED; publishedAt = now
- [ ] Job appears in employee feed immediately
- [ ] Audit log: DRAFT → PUBLISHED

**FR1.4 — Close Job**
- [ ] Can close at any time (PUBLISHED/DRAFT)
- [ ] Click "Close job" → confirm dialog
- [ ] Status = CLOSED; closedAt = now
- [ ] Employees can no longer apply
- [ ] Existing applications remain (still in pipeline for HR)
- [ ] Can reopen (CLOSED → PUBLISHED)

**FR1.5 — Duplicate Job**
- [ ] On job detail: "Duplicate" button
- [ ] Pre-fill all fields from source job; reset: title (+Copy), deadline (next month), createdAt (new)
- [ ] Save as DRAFT
- [ ] Audit log: "Duplicated from job #123"

**API Endpoint:**
```
POST /api/v1/internal-jobs
  Authorization: Bearer {token}, Role: HR
  Body: { title, departmentId, positionId, description, requirements, closesAt, tierMinimum }
  Response (201): { id, status: "DRAFT", createdAt, ... }

GET /api/v1/internal-jobs
  Query: companyId, status, departmentId, limit, offset
  Response (200): { data: [...], pagination }

GET /api/v1/internal-jobs/{id}
  Response (200): { id, title, status, applicants_count, ... }

PATCH /api/v1/internal-jobs/{id}
  Body: { title?, departmentId?, description?, deadline?, status? }
  Response (200): { ...updated job }

PATCH /api/v1/internal-jobs/{id}/publish
  Response (200): { status: "PUBLISHED", publishedAt }

PATCH /api/v1/internal-jobs/{id}/close
  Response (200): { status: "CLOSED", closedAt }
```

---

### FR2: Employee Browse Jobs

**Description:** Employee list + filter internal jobs

**Priority:** P0

**Acceptance Criteria:**

**FR2.1 — List Jobs**
- [ ] Employee accesses `/career` → sees all PUBLISHED jobs (their company only)
- [ ] List shows: job title, department, position, deadline, applicants count
- [ ] Sorting: by posted date (newest first), deadline (soonest first), department (A-Z)
- [ ] Pagination: 25 per page
- [ ] Mobile responsive: cards stack vertically

**FR2.2 — Filter**
- [ ] Filter by department: dropdown (all, dept1, dept2, ...)
- [ ] Filter by status: (open, closing soon (< 7 days), closed)
- [ ] Persist filters in URL query params
- [ ] "Clear filters" button

**FR2.3 — Search**
- [ ] Search by job title (live, < 300ms response)
- [ ] Case-insensitive partial match

**FR2.4 — Job Detail**
- [ ] Click job → detail view (modal or page)
- [ ] Display: title, department, position, description, requirements, deadline, applicants count (public)
- [ ] Show badge: "Already applied" if employee has active application
- [ ] Show application status if applied: "Screening", "Interview", etc
- [ ] Action buttons: [Apply] (or [View Application] if already applied)

**Acceptance Criteria:**
- [ ] Employee sees only PUBLISHED jobs
- [ ] Cannot view DRAFT/CLOSED jobs
- [ ] Applicants count is public (optional: hide exact count, show "5+" instead)
- [ ] Detail loads < 1s

**API Endpoint:**
```
GET /api/v1/internal-jobs/published
  Query: companyId, departmentId, status, search, sortBy, limit, offset
  Response (200): {
    data: [
      {
        id, title, departmentId, positionId, description, requirements,
        deadline, applicants_count, my_application_status (if exists)
      }
    ],
    pagination
  }

GET /api/v1/internal-jobs/{id}/public
  Response (200): { ...job detail }
```

---

### FR3: Employee Apply

**Description:** Employee apply for internal job with cover note

**Priority:** P0

**Acceptance Criteria:**

**FR3.1 — Apply**
- [ ] Employee clicks [Apply] → modal/page opens
- [ ] Form: cover note (textarea, optional, max 500 chars), char counter
- [ ] Auto-attach: current role, department, competency summary, performance badge (if available)
- [ ] Validation: one active application per job (check in DB)
- [ ] Submit → create InternalApplication with status = "APPLIED"
- [ ] Confirmation: "Application submitted. You'll be notified of updates."
- [ ] Audit log created

**FR3.2 — Withdraw**
- [ ] In application detail: [Withdraw] button (visible only if status < OFFER)
- [ ] Click → confirm dialog: "You can reapply after"
- [ ] Delete application → status = "WITHDRAWN"
- [ ] Notify HR via in-app + email
- [ ] Audit log: "Withdrawn by employee"
- [ ] Employee can reapply

**Acceptance Criteria:**
- [ ] Cannot apply twice simultaneously to same job (unique constraint)
- [ ] Can apply again after withdraw
- [ ] Cover note is optional
- [ ] Auto-attached fields are read-only (summary of profile)
- [ ] Notification sent to HR on apply

**API Endpoint:**
```
POST /api/v1/internal-jobs/{id}/apply
  Authorization: Bearer {token}, Role: EMPLOYEE
  Body: { coverNote? }
  Response (201): { id, status: "APPLIED", appliedAt, ... }
  Error: { status: 409, error: "Already applied" } if already applied

GET /api/v1/internal-applications
  Query: companyId, employeeId, status, jobId, limit
  Response (200): { data: [...applications], pagination }

GET /api/v1/internal-applications/{id}
  Response (200): { id, jobId, employeeId, status, coverNote, appliedAt, ... }

PATCH /api/v1/internal-applications/{id}/withdraw
  Response (200): { status: "WITHDRAWN", withdrawnAt }
```

---

### FR4: Application Status Timeline (Employee)

**Description:** Employee see application status timeline

**Priority:** P0

**Acceptance Criteria:**

**FR4.1 — Timeline View**
- [ ] Employee accesses `/career/applications` (or dashboard card)
- [ ] See all own applications in table or card view
- [ ] Columns: job title, applied date, current status (badge), last update
- [ ] Status badges: 🟡 APPLIED, 🟠 SCREENING, 🔵 INTERVIEW, 🟢 OFFER, ✅ ACCEPTED, ❌ REJECTED, ⚫ WITHDRAWN
- [ ] Sort by: applied date (newest first), status, job title
- [ ] Click row → detail view with full timeline

**FR4.2 — Status Detail**
- [ ] Show timeline: Applied (date) → Screening (date) → Interview (date) → Offer/Rejection (date)
- [ ] Each stage shows: date + HR note (if any)
- [ ] Rejection shows: reason code + optional notes from HR
- [ ] Countdown timer if deadline approaching (< 7 days): "Closes in X days"

**Acceptance Criteria:**
- [ ] Timeline is read-only (employee cannot edit)
- [ ] Only shows own applications
- [ ] Status badges are accurate
- [ ] Load < 1s

**API Endpoint:**
```
GET /api/v1/internal-applications?employeeId={id}
  Response (200): { data: [{ jobId, title, status, appliedAt, ... }] }

GET /api/v1/internal-applications/{id}/timeline
  Response (200): {
    id, jobId, employeeId,
    timeline: [
      { status: "APPLIED", changedAt, changedBy },
      { status: "SCREENING", changedAt, changedBy },
      ...
    ]
  }
```

---

### FR5: Pipeline Management (HR)

**Description:** HR move applicants through pipeline stages

**Priority:** P0

**Acceptance Criteria:**

**FR5.1 — Pipeline View (Kanban)**
- [ ] HR accesses `/career/pipeline` or `/career/jobs/{id}/applicants`
- [ ] Kanban board: columns for each stage (APPLIED, SCREENING, INTERVIEW, OFFER, ACCEPTED, REJECTED, WITHDRAWN)
- [ ] Applicant card: name, email, phone, applied date, cover note (hover), current role
- [ ] Drag-drop card to move between stages OR click "Move" button + select stage
- [ ] Confirm dialog on move: "Move to Screening?" → Yes/No
- [ ] On move: status updated, audit logged, employee notified

**FR5.2 — Reject Applicant**
- [ ] In pipeline: right-click card or [⋯More] → [Reject]
- [ ] Modal: reason dropdown (required) with options:
  - "Competency gap"
  - "Better fit elsewhere"
  - "Withdrawn by manager"
  - "On hold"
  - "Other"
- [ ] Optional text field: additional notes (max 200 chars)
- [ ] Click "Confirm" → status = "REJECTED", rejectedAt = now
- [ ] Email sent to employee with reason
- [ ] Audit log: reason + notes

**FR5.3 — Export Applicants**
- [ ] On pipeline page: [Export] button
- [ ] Choose format: Excel or PDF
- [ ] Columns: name, email, phone, applied date, status, cover note, current role, department, current position
- [ ] Limit: max 1000 rows (paginate if needed)
- [ ] File downloads as: `dnpeople-applicants-{jobId}-{date}.xlsx` or `.pdf`

**FR5.4 — Bulk Actions**
- [ ] Select multiple cards (checkboxes)
- [ ] Bulk move: select new stage → apply to all
- [ ] Bulk reject: with reason → apply to all

**Acceptance Criteria:**
- [ ] Kanban loads < 2s
- [ ] Drag-drop smooth (no lag)
- [ ] Reject requires reason (not null)
- [ ] Export is non-blocking (shows toast "Generating...")
- [ ] Each move/reject action: audit logged + employee notified

**API Endpoint:**
```
GET /api/v1/internal-jobs/{id}/applicants
  Query: status, sortBy, limit
  Response (200): {
    data: [
      { id, employeeId, name, email, phone, appliedAt, status, coverNote, ... }
    ]
  }

PATCH /api/v1/internal-applications/{id}/status
  Authorization: Bearer {token}, Role: HR
  Body: { newStatus, notes? }
  Response (200): { status: "SCREENING", changedAt, ... }

PATCH /api/v1/internal-applications/{id}/reject
  Body: { rejectionReason (required), notes? }
  Response (200): { status: "REJECTED", rejectedAt, rejectionReason, ... }

GET /api/v1/internal-jobs/{id}/applicants/export
  Query: format (xlsx|pdf)
  Response (200): file download
```

---

### FR6: Notifications

**Description:** Notify employee + HR on application events

**Priority:** P0

**Acceptance Criteria:**

**FR6.1 — Events**

**Event: Application Received**
- [ ] Trigger: Employee submit apply
- [ ] To: HR (in-app + email)
- [ ] Content: "{employee_name} applied for {job_title}"
- [ ] Link: direct to applicant in pipeline

**Event: Status Changed**
- [ ] Trigger: HR move applicant (any stage except REJECTED)
- [ ] To: Employee (in-app + email)
- [ ] Content: "Your application for {job_title} moved to {stage}"
- [ ] Link: to application detail

**Event: Rejected**
- [ ] Trigger: HR reject applicant
- [ ] To: Employee (in-app + email)
- [ ] Content: "Your application for {job_title} was not selected. Reason: {reason}. {notes}"
- [ ] Include: encouragement to apply for other roles

**Event: Offer Created** (future)
- [ ] Trigger: HR move to OFFER stage (or explicit "Create offer" action)
- [ ] To: Employee (in-app + email)
- [ ] Content: "You have received an offer for {job_title}"
- [ ] Link: to offer (if e-sign available)

**Event: Accepted**
- [ ] Trigger: Employee accept offer (or HR mark ACCEPTED)
- [ ] To: HR + employee (in-app + email)
- [ ] Content (HR): "{employee_name} accepted {job_title}. Auto-updating position..."
- [ ] Content (Employee): "Congratulations! You've been hired for {job_title}"
- [ ] Auto-trigger: position change + onboarding task creation

**FR6.2 — Notification Channels**
- [ ] In-app: always (required)
- [ ] Email: if SMTP configured (optional, graceful fallback)
- [ ] If email fails: log warning but don't fail notification flow

**Acceptance Criteria:**
- [ ] In-app notifications render within 5 min of event
- [ ] Email sent within 1 min of event (or logged error)
- [ ] Reason code visible in rejection email
- [ ] Each notification includes direct link to resource (application/job)
- [ ] Audit log: notification sent timestamp

**API Endpoint (internal):**
```
POST /api/v1/notifications/send (internal only)
  Body: {
    event_type: "application_received"|"status_changed"|"rejected"|"accepted",
    to_user_ids: [user1, user2],
    resource_id, resource_type,
    message, action_url
  }
  Response (200): { sent: N, failed: M }
```

---

### FR7: Accept Application & Position Change

**Description:** When applicant accepted, auto-update employee position + create onboarding

**Priority:** P1

**Acceptance Criteria:**

**FR7.1 — Move to ACCEPTED**
- [ ] HR move applicant to ACCEPTED stage (or explicit "Accept" button)
- [ ] System auto-triggers position update:
  - [ ] Employee position changed to job's position (FK)
  - [ ] Employee department changed to job's department (FK)
  - [ ] Effective date: today (or configurable)
  - [ ] Audit log: "Position change via internal job {jobId}"
- [ ] Create onboarding task (reuse onboarding v5.0 trigger)
- [ ] Email sent to employee: "Congratulations! Starting {position} in {department} on {date}"
- [ ] Email sent to HR: "{employee_name} accepted and position updated"
- [ ] Job status → FILLED

**FR7.2 — Manual Position Change (Fallback)**
- [ ] If auto-position-change fails: HR can manually update employee position in directory
- [ ] Dashboard shows: "Position updated (manual)" with timestamp

**Acceptance Criteria:**
- [ ] Position updated in real-time (< 500ms)
- [ ] Audit log includes: old position → new position, changed_by (system), timestamp
- [ ] Onboarding task created with correct position/department
- [ ] Email sent within 1 min
- [ ] No position update if job has no positionId (requires manual follow-up)

**API Endpoint:**
```
PATCH /api/v1/internal-applications/{id}/accept
  Body: { accepted_date?, effective_date? }
  Response (200): {
    status: "ACCEPTED",
    position_updated: true,
    onboarding_task_id: "...",
    acceptedAt
  }

POST /api/v1/internal-jobs/{id}/mark-filled
  Response (200): { status: "FILLED", filledAt, filledBy }
```

---

### FR8: Tier Gating

**Description:** Feature available only to PROFESSIONAL+ tiers

**Priority:** P0

**Acceptance Criteria:**
- [ ] `/career` route: 404 for FREE/STARTER tiers
- [ ] Nav menu: "Career" item hidden for FREE/STARTER
- [ ] `/career/jobs/new`: accessible only for HR with PROFESSIONAL+ company
- [ ] Direct URL bypass: `/career` → redirects to pricing if insufficient tier
- [ ] Error message: "Career Marketplace is available on Professional tier and above"
- [ ] Tier check happens at: route guard + API authorization

**API Endpoint:**
```
GET /api/v1/feature/career:marketplace
  Response (200): { enabled: true|false, tier_required: "PROFESSIONAL" }
```

---

### FR9: Audit & Compliance

**Description:** Log all CRUD + status changes to audit table

**Priority:** P0

**Acceptance Criteria:**
- [ ] Every create/update/delete logged to AuditLog table
- [ ] Status change (move applicant): logged with old_status → new_status
- [ ] Rejection: logged with reason code + notes
- [ ] Acceptance: logged with position change details
- [ ] Fields: audit_id, user_id (who made change), resource_type ("InternalJob"|"InternalApplication"), resource_id, action ("create"|"update"|"reject"|"move"), before_state (JSON), after_state (JSON), timestamp
- [ ] Audit trail immutable (no deletion)
- [ ] HR can view audit log (admin feature)

**Acceptance Criteria:**
- [ ] All actions logged synchronously (not delayed)
- [ ] Audit query by: resource_id, date range, user_id
- [ ] Exports include audit trail (optional)

**API Endpoint:**
```
GET /api/v1/audit-log
  Query: resource_type, resource_id, start_date, end_date, user_id
  Response (200): { data: [{ id, action, user_id, timestamp, before, after }] }
```

---

## 2. NON-FUNCTIONAL REQUIREMENTS

### NFR1: Performance
- List jobs: < 2s (1000+ jobs)
- Create job: < 500ms
- Pipeline kanban: < 2s (100+ applicants)
- Apply: < 500ms
- Notification: < 5 min (in-app), < 1 min (email, best-effort)

### NFR2: Security
- RBAC: HR can CRUD; Employee can apply + withdraw; Manager read-only
- Row-level security: employee only sees their own applications
- Tier gating: PROFESSIONAL+ only
- No data leakage (applicants not visible to other employees)

### NFR3: Reliability
- Notification failures don't block application workflow
- Email graceful fallback (log warning, continue)
- Concurrent applies: idempotency (one apply per job per employee)

### NFR4: Audit
- 100% of CRUD logged
- Immutable audit trail
- 7-year retention (legal requirement)

---

## 3. Acceptance Test Cases

| Test | Scenario | Expected Result |
|------|----------|-----------------|
| 1 | HR creates job | Job in DRAFT status, not visible to employees |
| 2 | HR publishes job | Job visible to PROFESSIONAL+ employees |
| 3 | Employee browse | See all published jobs (own company) |
| 4 | Employee apply | Application created, APPLIED status, email to HR |
| 5 | Employee withdraw | Application deleted, email to HR, can re-apply |
| 6 | HR move to Screening | Status updated, employee notified |
| 7 | HR reject | Status = REJECTED, reason sent via email |
| 8 | HR accept | Status = ACCEPTED, position updated, onboarding task created |
| 9 | Tier gate | STARTER can't access `/career` |
| 10 | Export | Excel file generated, contains all applicants |
| 11 | Audit log | All actions logged to table |
| 12 | Mobile | All features responsive on 480px screen |
| 13 | Notification email | Received within 1 min of event |
| 14 | Concurrent apply | Only one app per job allowed (validation) |
| 15 | Offline-like | In-app notifications work even if email fails |

---

**Version:** 1.0 (Ready for SDD)  
**Last Updated:** 10 Agustus 2026


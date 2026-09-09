# dnPeople — SRS v13.0
## Talent Advancement: Requirements & Acceptance Criteria

**Versi:** 13.0  
**Tanggal:** 24 Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Status:** Ready for QA

---

## FR-TALENT-001: 9-Box Matrix Configuration

**ID:** FR-TALENT-001  
**Priority:** P0 (Critical)  
**Owner:** Backend Engineer

### Requirement

```
HR can configure 9-box axes: Performance source + Potential source.
Performance = Performance cycle rating.
Potential = Competency gap (auto-calculated, HR can override).
Custom labels for each box (optional).
```

### Acceptance Criteria

```
AC-1.1: HR creates configuration
  Given: HR in PROFESSIONAL+ tier company
  When: HR clicks "Configure Matrix" in /talent/settings
  Then:
    - Form shows:
      ☐ Performance Source: (radio) Latest Cycle / Custom
      ☐ Potential Source: (radio) Competency Gap / Manager Rating / Custom
      ☐ Custom labels per box (9 text inputs, optional)
    - Defaults applied: Performance=Cycle, Potential=CompGap, Labels=D1-D9
    - "Save" button saves to TalentMatrixConfiguration table
    
Test case:
  T1.1: Create default config
    - GET /talent/settings (as HR)
    - POST /api/v1/talent/config
      { performanceSource: "cycle", potentialSource: "comp_gap" }
    - ✓ Response: { id, performanceSource, potentialSource, createdAt }
    - ✓ DB check: TalentMatrixConfiguration.companyId = this company

AC-1.2: HR customizes labels
  Given: Configuration exists
  When: HR edits box labels
  Then:
    - All 9 boxes editable: 1="Low Risk/Low Potential", ..., 9="Superstar"
    - Validation: Max 50 chars per label
    - Save persists in boxLabels JSON
    
Test case:
  T1.2: Update labels
    - PUT /api/v1/talent/config
      { boxLabels: { "1": "Exit Risk", ..., "9": "A-Player" } }
    - ✓ Response: updated config
    - ✓ GET /api/v1/talent/config returns new labels

AC-1.3: Manager suggestions toggle
  Given: Configuration
  When: HR toggles "Allow Managers to Suggest"
  Then:
    - Setting saved (allowManagerSuggestions boolean)
    - If true: Manager sees "Suggest" button in session (but not Edit)
    - If false: Manager has view-only access
    
Test case:
  T1.3: Toggle manager suggestions
    - PUT /api/v1/talent/config
      { allowManagerSuggestions: true }
    - ✓ DB: TalentMatrixConfiguration.allowManagerSuggestions = true
    - Manager login, view session
    - ✓ "Suggest for direct reports" button visible

AC-1.4: Configuration history
  Given: Configuration changed multiple times
  When: HR views config history
  Then:
    - Show prior versions: date, changed by, what changed
    - Diff view: "Performance source changed: Cycle → Manager Rating"
    
Test case:
  T1.4: Config history audit
    - Update config 3 times
    - GET /api/v1/talent/config/history
    - ✓ Returns array of 3 versions, each with timestamp + userId
```

---

## FR-TALENT-002: Kalibrasi Session (Workflow)

**ID:** FR-TALENT-002  
**Priority:** P0 (Critical)  
**Owner:** Backend Engineer

### Requirement

```
HR creates session (draft → in_review → locked → archived).
HR assigns employees to 9-box during session.
HR locks session (finalizes placements, prevents edits).
Audit trail tracks every placement + lock/unlock.
```

### Acceptance Criteria

```
AC-2.1: HR creates session
  Given: HR in PROFESSIONAL+ tier
  When: POST /api/v1/talent/sessions
    { name: "Kalibrasi 2026 Q3", period: "2026-Q3", ... }
  Then:
    - Session created with status: "draft"
    - Belongs to company (companyId set)
    - Createdby: current user
    - No placements yet (empty)
    
Test case:
  T2.1: Create session
    - POST /api/v1/talent/sessions
    - ✓ Response: { id, name, status: "draft", createdAt, ... }
    - GET /api/v1/talent/sessions/{id}
    - ✓ status = "draft"

AC-2.2: HR lists sessions
  Given: Multiple sessions exist
  When: HR views /talent/sessions
  Then:
    - Table shows: Name, Period, Status, Employee Count, Created Date
    - Filter by status: Draft / Locked / Archived
    - Sort by: Created date (desc default)
    - Pagination: 20/page
    
Test case:
  T2.2: List sessions
    - Create 3 sessions (draft, locked, archived)
    - GET /api/v1/talent/sessions
    - ✓ Returns array, all 3 visible
    - ✓ Filter status=locked returns 1

AC-2.3: HR adds employees to session (placements)
  Given: Session in draft status
  When: HR clicks "Add Employee" for each employee
  Then:
    - Form shows: Employee (select), Box (1-9 radio), Justification (text)
    - Submit creates TalentMatrixPlacement
    - Employee visible in session grid
    
Test case:
  T2.3: Add placement
    - POST /api/v1/talent/sessions/{sessionId}/placements
      { employeeId: "emp123", boxNumber: 5, justification: "Strong performer" }
    - ✓ Response: { id, employeeId, boxNumber, createdAt }
    - ✓ Employee count in session updates

AC-2.4: HR edits placement (while draft)
  Given: Placement in draft session
  When: HR clicks "Edit" on placement
  Then:
    - Form pre-filled with current box, justification
    - Can change box + justification
    - Submit updates placement + audit trail
    - Audit shows: old_box, new_box, reason, edited_by, timestamp
    
Test case:
  T2.4: Edit placement
    - PUT /api/v1/talent/sessions/{sessionId}/placements/{employeeId}
      { boxNumber: 7, justification: "Promotion ready" }
    - ✓ Placement.boxNumber changes to 7
    - ✓ TalentMatrixAudit row created: action="updated", beforeState={box:5}, afterState={box:7}

AC-2.5: HR locks session (no more edits)
  Given: Session with all employees placed
  When: HR clicks "Lock Session"
  Then:
    - System validates: All employees in company assigned? (or allow partial?)
    - Confirmation dialog: "Lock this session? No further edits allowed."
    - POST /api/v1/talent/sessions/{id}/lock
    - Status changes: draft → locked
    - lockedBy = current user, lockedAt = now
    - Audit: "Session locked by [name] at [time]"
    
Test case:
  T2.5: Lock session
    - Add 10 employees to session
    - POST /api/v1/talent/sessions/{id}/lock
    - ✓ Status becomes "locked"
    - ✓ TalentMatrixAudit row: action="locked"
    - Try to edit placement while locked
    - ✓ API returns 403: "Session is locked"

AC-2.6: HR unlocks session (rare, requires reason)
  Given: Session locked
  When: HR clicks "Unlock" + provides reason
  Then:
    - POST /api/v1/talent/sessions/{id}/unlock
      { reason: "Fix John's box" }
    - Status changes: locked → draft
    - Audit logged: "Unlocked by [name], reason: [reason]"
    - Can edit placements again
    
Test case:
  T2.6: Unlock session
    - POST /api/v1/talent/sessions/{id}/unlock
      { reason: "Data correction" }
    - ✓ Status = "draft"
    - ✓ Can edit placements again
    - ✓ Audit shows unlock

AC-2.7: Soft-deleted employees excluded
  Given: Session with 50 employees (some soft-deleted)
  When: Building matrix
  Then:
    - Only active employees shown (deletedAt IS NULL)
    - Soft-deleted employees: not in grid, not counted, can skip
    
Test case:
  T2.7: Soft-delete exclusion
    - Add 50 employees to session
    - Soft-delete 5 employees
    - GET /api/v1/talent/sessions/{id}/placements
    - ✓ Returns 45 employees (5 excluded)
```

---

## FR-TALENT-003: Succession Planning & Readiness

**ID:** FR-TALENT-003  
**Priority:** P0 (Critical)  
**Owner:** Backend Engineer

### Requirement

```
HR marks Positions as critical roles.
For each critical role, HR designates successor slate (1-N candidates).
Readiness calculated: competency gap + manager rating → Ready Now / 1-2yr / etc.
HR can override readiness status.
Successor changes tracked in audit trail.
```

### Acceptance Criteria

```
AC-3.1: HR marks position as critical
  Given: Position exists (e.g., "VP Sales")
  When: HR flags position as critical role
  Then:
    - POST /api/v1/talent/positions/{positionId}/critical
      { isCritical: true }
    - Position marked in SuccessionPlanning table
    - Audit: "Critical role flagged for VP Sales"
    
Test case:
  T3.1: Mark critical role
    - POST /api/v1/talent/positions/{id}/critical
      { isCritical: true }
    - ✓ Response: { positionId, isCritical: true }
    - ✓ /talent/positions/{id}/succession page loads

AC-3.2: HR adds successor candidates
  Given: Critical role designated
  When: HR adds candidate to succession slate
  Then:
    - Form shows: Candidate (search employee), Rank (1-10), Readiness Status, Manager Rating
    - POST /api/v1/talent/positions/{positionId}/successors
      { employeeId: "emp456", rank: 1, readinessStatus: "1_2yr", managerRating: 4 }
    - Candidate added to slate
    
Test case:
  T3.2: Add successor candidate
    - POST /api/v1/talent/positions/{positionId}/successors
      { employeeId: "emp456", rank: 1, readinessStatus: "ready_now" }
    - ✓ Response: { id, employeeId, rank: 1, readinessStatus }
    - ✓ Candidate appears in slate (sorted by rank)

AC-3.3: Readiness calculation
  Given: Successor candidate added
  When: System calculates readiness
  Then:
    - Readiness auto-calculated from:
      a) Competency gap (via IDP Module 1): Desired - Current = gap %
      b) Manager rating (1-5)
      c) Status: Ready Now (gap <20%, rating ≥4) 
                 1-2yr (gap 20-50%, rating 3-4)
                 2-5yr (gap 50-80%, rating <3)
                 Develop (gap >80% or rating <2)
    - HR can override (click dropdown, select different status)
    - readinessScore calculated: (100 - gap%) × (manager_rating/5) × 100
    
Test case:
  T3.3: Readiness calculation
    - Employee has competency gap: 30%
    - Manager rating: 4/5
    - ✓ Auto-calculated status: "1_2yr"
    - ✓ readinessScore: (70) × (4/5) × 100 = 56%
    - HR overrides to "ready_now"
    - ✓ Status changes, audit logged

AC-3.4: Successor ranking
  Given: Slate with 3 candidates (ranks 1, 2, 3)
  When: HR reorders candidates
  Then:
    - Drag-drop to reorder ranks
    - Ranks update: 1→2, 2→3, 3→1
    - Audit: "Successor reordered: rank 1→2"
    
Test case:
  T3.4: Reorder successors
    - Add 3 successors (ranks 1,2,3)
    - PUT /api/v1/talent/positions/{positionId}/successors
      { successors: [emp3_rank1, emp1_rank2, emp2_rank3] }
    - ✓ All updated in response
    - ✓ Audit logged for each rank change

AC-3.5: Successor removal
  Given: Candidate in slate
  When: HR removes candidate
  Then:
    - DELETE /api/v1/talent/positions/{positionId}/successors/{candidateId}
      { reason: "Promoted to VP role" }
    - Candidate removed
    - Audit: "Successor removed: reason=[reason]"
    
Test case:
  T3.5: Remove successor
    - DELETE /api/v1/talent/positions/{positionId}/successors/{candidateId}
    - ✓ Candidate no longer in slate
    - ✓ Audit shows removal + reason

AC-3.6: Succession readiness report
  Given: Multiple critical roles with succession slates
  When: HR views succession readiness report
  Then:
    - Report shows:
      Role | Holder | Successors Ready | Readiness %
      VP Sales | John | 2/3 | 66%
      CFO | Sarah | 1/2 | 50%
    - Export: Excel (names + readiness) / PDF (summary only)
    
Test case:
  T3.6: Succession readiness report
    - GET /api/v1/talent/reports/succession
    - ✓ Returns: { critical_roles: [ { position, readiness_pct, candidates: [...] } ] }
    - Export to Excel
    - ✓ File contains names + readiness status
```

---

## FR-TALENT-004: Navigation Visibility (Tier-Based)

**ID:** FR-TALENT-004  
**Priority:** P0 (Critical)  
**Owner:** Frontend Engineer

### Requirement

```
Navigation menu only shows menu items for features available in user's tier.
Demo accounts follow same rule (show FREE tier menus even if data is full).
Direct URL to hidden feature redirects to /upgrade (not 404).
Prevents confusion from hidden-but-redirect-available routes.
```

### Acceptance Criteria

```
AC-4.1: FREE tier navigation
  Given: User on FREE tier company
  When: User views left navigation
  Then:
    - Visible: Employees, Organization, Dashboard, Documents, Helpdesk, Settings
    - Hidden (not in nav): Payroll, Attendance, Leave, Recruitment, Performance, Training, Talent, Integrations
    - No broken links (hidden items not rendered as disabled)
    
Test case:
  T4.1: FREE tier nav
    - Create FREE company + login
    - ✓ Nav shows: employees, org, dashboard, docs, helpdesk, settings
    - ✓ Nav does NOT show: payroll, attendance, leave, recruitment, performance, training, talent
    - Inspect element: No placeholder/disabled button for hidden items

AC-4.2: PROFESSIONAL tier navigation
  Given: User on PROFESSIONAL tier company
  When: User views navigation
  Then:
    - Visible: Employees, Payroll, Attendance, Leave, Recruitment, Performance, Training, Talent, Dashboard, ...
    - Hidden: Integrations (BUSINESS+), Branding (ENTERPRISE)
    
Test case:
  T4.2: PROFESSIONAL nav
    - Create PROFESSIONAL company
    - ✓ Nav includes: payroll, attendance, recruitment, talent
    - ✓ /talent menu visible
    - ✓ Integrations NOT visible

AC-4.3: Direct URL redirect (free tier)
  Given: FREE tier user
  When: Navigating directly to /talent (not in nav)
  Then:
    - URL /talent redirects to /upgrade?feature=talent
    - Message: "Talent Matrix available in PROFESSIONAL plan"
    - Button: "Upgrade to PROFESSIONAL"
    
Test case:
  T4.3: Direct URL blocked (FREE)
    - GET /talent (as FREE user)
    - ✓ Redirects to /upgrade?feature=talent
    - ✓ Page shows upgrade CTA

AC-4.4: Demo account shows FREE nav (even with full data)
  Given: Demo account (populated with sample data)
  When: Demo user logs in
  When: Demo tier is FREE
  Then:
    - Navigation shows only FREE tier items
    - Despite having full employee/payroll data, menu is restricted
    - Can view sample data via API (backend check), but menu hidden
    
Test case:
  T4.4: Demo FREE nav
    - Login demo account on FREE tier
    - Demo has 100 employees + payroll data
    - ✓ Nav shows: employees, org, dashboard, docs, settings
    - ✓ /payroll NOT in nav
    - GET /api/v1/employees (backend)
    - ✓ Returns data (backend doesn't restrict demo)
    - GET /payroll (frontend)
    - ✓ Redirects to /upgrade

AC-4.5: BUSINESS tier navigation
  Given: BUSINESS tier user
  When: User views navigation
  Then:
    - Includes: Integrations, API Keys, Webhooks
    - Excludes: Branding, white-label (ENTERPRISE)
    
Test case:
  T4.5: BUSINESS nav
    - Create BUSINESS company
    - ✓ Nav shows: integrations, api keys, webhooks
    - ✓ /branding redirects to /upgrade?tier=enterprise

AC-4.6: Navigation rebuild on tier change
  Given: User upgrades tier (e.g., FREE → PROFESSIONAL)
  When: Tier changed in Subscription table
  Then:
    - Navigation updates (hard refresh required, or React state update)
    - New menu items appear
    - Old menu items disappear
    
Test case:
  T4.6: Nav update on upgrade
    - User on FREE tier
    - Upgrade to PROFESSIONAL (via /upgrade flow)
    - Hard refresh (F5)
    - ✓ /talent menu now visible
    - ✓ Can access /talent
```

---

## FR-TALENT-005: Development Gap Proposals

**ID:** FR-TALENT-005  
**Priority:** P1 (High)  
**Owner:** Backend Engineer

### Requirement

```
After kalibrasi locked, system identifies high-potential candidates with competency gaps.
Auto-generates proposals: "Candidate X needs competency Y for Role Z. Suggest LMS Module M."
HR can approve → auto-enroll LMS + create IDP goal.
Or reject with reason.
```

### Acceptance Criteria

```
AC-5.1: Proposal generation
  Given: Kalibrasi locked, successor candidates have competency gaps ≥ 30%
  When: System runs proposal generation (post-lock trigger)
  Then:
    - Cron job (or on-demand): Generates DevelopmentProposal rows
    - For each successor: competency_gap ≥ 30%
    - Proposes matching LMS module from Module 1 library
    - Status: "proposed"
    
Test case:
  T5.1: Generate proposals
    - Lock kalibrasi with 3 successors
    - Successor 1: CompGap Strategic Thinking = 40%
    - Successor 2: CompGap Leadership = 25% (below 30%, skip)
    - Successor 3: CompGap Analytics = 35%
    - POST /api/v1/talent/sessions/{id}/generate-proposals
    - ✓ Returns: 2 proposals (skips #2)
    - ✓ Proposals stored in DB

AC-5.2: HR approves proposal
  Given: Proposal in "proposed" status
  When: HR clicks "Approve"
  Then:
    - Status: "proposed" → "approved"
    - System calls Module 1-2 API: POST /api/v1/learning/courses/{courseId}/enroll
    - Also creates IDP goal (auto)
    - Email sent to employee: "You're enrolled in [Course]"
    - Audit: "Proposal approved by [HR name]"
    
Test case:
  T5.2: Approve proposal
    - GET /api/v1/talent/proposals?status=proposed
    - PUT /api/v1/talent/proposals/{id}
      { status: "approved" }
    - ✓ Status changes to "approved"
    - ✓ LMS enrollment API called (check mock/integration)
    - ✓ IDP goal created

AC-5.3: HR rejects proposal
  Given: Proposal
  When: HR clicks "Reject" + provides reason
  Then:
    - Status: "proposed" → "rejected"
    - Reason stored in DB
    - No LMS enrollment
    - Audit: "Proposal rejected by [HR name], reason: [reason]"
    
Test case:
  T5.3: Reject proposal
    - PUT /api/v1/talent/proposals/{id}
      { status: "rejected", reason: "Already trained on this" }
    - ✓ Status = "rejected"
    - ✓ No LMS call
    - ✓ Reason stored

AC-5.4: Employee views own gap + proposal
  Given: Proposal approved (employee enrolled in LMS)
  When: Employee logs in
  Then:
    - Employee sees in dashboard: "You're enrolled in Strategic Thinking 101"
    - Can see gap: "40% gap identified for VP role"
    - Can click → view IDP goal
    
Test case:
  T5.4: Employee views proposal
    - Login as successor employee
    - GET /api/v1/talent/proposals?employeeId=self
    - ✓ Returns approved proposals
    - GET /api/v1/learning/enrollment?employeeId=self
    - ✓ Shows LMS courses (from approval)
```

---

## FR-TALENT-006: Reports & Export

**ID:** FR-TALENT-006  
**Priority:** P1 (High)  
**Owner:** Frontend Engineer + Backend Engineer

### Requirement

```
9-box matrix report: Visual grid + distribution stats.
Succession readiness report: Critical role coverage %.
Development proposals report: Pending/approved/rejected.
Export: Excel (with names) + PDF (summary only, no names).
Tier gating: PROFESSIONAL+ only.
```

### Acceptance Criteria

```
AC-6.1: 9-box report generation
  Given: Session locked with placements
  When: HR opens /talent/reports/matrix
  Then:
    - Table: 9 boxes (3×3 grid)
    - Each box shows: Employee count + employee names (clickable)
    - Stats: Total employees, % per box (pie chart)
    - Filter: By org, dept, manager
    - Sort: By box (default) or by employee count
    
Test case:
  T6.1: 9-box report
    - Load /talent/reports/matrix
    - ✓ Page renders 9-box grid
    - ✓ Box 5 shows: "3 employees"
    - ✓ Click box 5 → list of 3 employees
    - Filter by dept="Sales"
    - ✓ Grid updates (fewer employees)

AC-6.2: Export 9-box to Excel
  Given: Report open
  When: HR clicks "Export Excel"
  Then:
    - Generates .xlsx with tabs: Matrix, Statistics, Employee List
    - Tab 1 (Matrix): Box | Employee Count | Names
    - Tab 2 (Stats): 9 boxes, %distribution
    - Tab 3 (Employee): Id | Name | Box | Performance | Potential | Manager
    
Test case:
  T6.2: Export Excel
    - Click "Export Excel" button
    - ✓ File downloads (check content-type: application/vnd.ms-excel)
    - Open Excel
    - ✓ 3 tabs present, data correct

AC-6.3: Export 9-box to PDF
  Given: Report open
  When: HR clicks "Export PDF"
  Then:
    - Generates PDF with: 9-box grid image + stats
    - NO employee names (executive summary only)
    - Header: Company name, date, kalibrasi period
    
Test case:
  T6.3: Export PDF
    - Click "Export PDF"
    - ✓ PDF downloaded
    - Check content: Has grid image + stats
    - ✓ No employee names

AC-6.4: Succession readiness report
  Given: Multiple critical roles, successors assigned
  When: HR opens /talent/reports/succession
  Then:
    - Table: Role | Holder | Successors Ready (count/total) | Readiness % | Status (Green/Yellow/Red)
    - Status: Green (>80%), Yellow (50-80%), Red (<50%)
    - Filter: By org, by status
    - Drill-down: Click role → show all candidates + readiness details
    
Test case:
  T6.4: Succession report
    - Load /talent/reports/succession
    - ✓ Renders table with critical roles
    - VP Sales: 2/3 ready (66%, Yellow)
    - Click VP Sales row
    - ✓ Shows 3 candidates + readiness status

AC-6.5: Export succession report
  Given: Report
  When: HR exports to Excel/PDF
  Then:
    - Excel: Role, Holder, Successors (comma-separated names), Readiness %
    - PDF: Summary table (no candidate names, only role + readiness %)
    
Test case:
  T6.5: Export succession
    - Export to Excel
    - ✓ Includes candidate names
    - Export to PDF
    - ✓ PDF has only role names + readiness, no candidate details

AC-6.6: Tier gating on reports
  Given: FREE tier user
  When: Trying to access /talent/reports
  Then:
    - Redirects to /upgrade?feature=talent
    - Message: "Reports available in PROFESSIONAL plan"
    
Given: PROFESSIONAL tier user
  When: Accessing reports
  Then:
    - Can view + export freely
    
Test case:
  T6.6: Tier gating
    - FREE tier: GET /talent/reports/matrix → 303 redirect to /upgrade
    - PROFESSIONAL tier: GET /talent/reports/matrix → 200 OK
```

---

## FR-TALENT-007: Audit Trail & Security

**ID:** FR-TALENT-007  
**Priority:** P0 (Critical)  
**Owner:** Backend Engineer

### Requirement

```
Every action logged: session lock/unlock, placement move, successor add/remove, proposal approve.
Audit table: entity type, action, before/after state, user, timestamp.
Sensitive data redacted (no salary in audit logs).
7-year retention.
RBAC enforced: HR can edit, MANAGER suggest-only, EMPLOYEE view-self only.
```

### Acceptance Criteria

```
AC-7.1: Session lock audit
  Given: Session being locked
  When: HR clicks "Lock"
  Then:
    - TalentMatrixAudit row created:
      entity="session", entityId=sessionId, action="locked"
      performedBy=current_user, performedAt=now
      reason="End of kalibrasi period"
    
Test case:
  T7.1: Lock audit
    - POST /api/v1/talent/sessions/{id}/lock
    - ✓ TalentMatrixAudit row exists with action="locked"

AC-7.2: Placement move audit
  Given: Placement updated (box 5 → 7)
  When: HR saves change
  Then:
    - TalentMatrixAudit row:
      entity="placement", entityId=placementId, action="updated"
      beforeState={ box: 5, justification: "..." }
      afterState={ box: 7, justification: "..." }
      reason="Adjusted based on latest performance review"
      performedBy, performedAt
    
Test case:
  T7.2: Placement audit
    - PUT /api/v1/talent/sessions/{id}/placements/{empId}
    - ✓ Audit row created with before/after

AC-7.3: Successor add/remove audit
  Given: Successor added or removed
  When: HR performs action
  Then:
    - Audit: entity="successor", action="created" or "deleted"
    - Include: candidate name, reason
    
Test case:
  T7.3: Successor audit
    - POST /api/v1/talent/positions/{posId}/successors
    - ✓ Audit row: action="created"
    - DELETE /api/v1/talent/positions/{posId}/successors/{candId}
    - ✓ Audit row: action="deleted", reason stored

AC-7.4: Proposal approve/reject audit
  Given: Proposal status change
  When: HR approves or rejects
  Then:
    - Audit: entity="proposal", action="approved"/"rejected"
    - afterState includes: status, approvedBy, approvedAt, reason (if rejected)
    
Test case:
  T7.4: Proposal audit
    - PUT /api/v1/talent/proposals/{id} { status: "approved" }
    - ✓ Audit row: action="approved"

AC-7.5: Sensitive data redaction
  Given: Audit logs exist
  When: Accessing audit via API
  Then:
    - No salary, bank, NPWP, NRIC visible in logs
    - If audit references employee data, only name + ID shown
    - (Competency gap %, readiness scores OK to show)
    
Test case:
  T7.5: Audit redaction
    - Try to access raw audit: GET /api/v1/talent/sessions/{id}/audit
    - ✓ Response contains: performedBy, entity, action, timestamp
    - ✓ No salary/bank fields (even if present in beforeState, redacted)

AC-7.6: RBAC enforcement
  Given: User roles differ
  When: Attempting actions:
    - Manager tries to lock session → 403 Forbidden
    - Employee tries to edit placement → 403 Forbidden
    - Finance tries to access succession → 403 Forbidden
  Then:
    - Requests blocked with clear error
    - Audit logged: failed attempt
    
Test case:
  T7.6: RBAC blocking
    - POST /api/v1/talent/sessions/{id}/lock (as MANAGER)
    - ✓ 403: "Only HR can lock session"
    - ✓ Audit logged: failed attempt
```

---

## Launch Gate Checklist

```
FEATURE:
  [ ] 9-box configuration works (performance × potential)
  [ ] Kalibrasi session creates, edits, locks
  [ ] Placements saved per employee (all 9 boxes)
  [ ] Succession planning: critical roles + candidates
  [ ] Readiness scoring (auto + manual override)
  [ ] Development proposals generate + approve
  [ ] Reports export (Excel/PDF)

NAVIGATION FIX:
  [ ] FREE tier: /talent NOT in nav
  [ ] STARTER tier: /talent NOT in nav
  [ ] PROFESSIONAL tier: /talent visible
  [ ] BUSINESS tier: /talent visible
  [ ] Direct /talent URL redirects to /upgrade (if tier < PROF)
  [ ] Demo accounts: nav reflects FREE tier (even with data)

SECURITY:
  [ ] Audit trail complete (100% of edits logged)
  [ ] Sensitive data redacted (no salary in logs)
  [ ] RBAC enforced (HR edit, MANAGER suggest, EMP view-self)
  [ ] Row scope (employees only see self, MANAGER sees directs)
  [ ] Finance blocked from succession by default

PERFORMANCE:
  [ ] 9-box matrix load: < 2s (1000 employees)
  [ ] Report export: < 3s (1000 employees)
  [ ] Session lock/unlock: < 500ms

UI/UX:
  [ ] Mobile: matrix responsive, horizontal scroll OK, touch buttons 44px+
  [ ] Accessibility: WCAG 2.1 AA, color + text for 9-box
  [ ] Error messages clear (not generic "Error loading")

TESTING:
  [ ] All FR + AC tested (7 FRs × 4-7 ACs = 30+ tests minimum)
  [ ] Unit tests: tier gating, readiness calculation
  [ ] Integration tests: session lock/unlock, audit trail
  [ ] Browser UAT: create session → lock → view reports
  [ ] Performance: load test (1000 emp, concurrent users)

✅ ALL GREEN? DEPLOY v13.0 🚀
```

---

*Last Updated: 24 Juli 2026 | Version: 13.0 (FINAL SRS) | Owner: Dozer*

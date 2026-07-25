# dnPeople — PRD v13.0
## Talent Advancement: 9-Box Matrix & Succession Planning (Module 3)

**Versi:** 13.0  
**Tanggal:** 24 Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Baseline:** Post v12.1 (FREE tier = 50 emp hard; feature gating + nav fix included)  
**Status:** Ready for SRS/SDD

---

## Executive Summary

**Module 3** extends dnPeople's **talent foundation** (competency, IDP, LMS from v4 Mod 1–2) with **visual talent planning & succession management**.

**What HR can do:**
- Visualize team on a **9-box matrix** (performance × potential)
- Plan **succession** for critical roles (1–N candidates, readiness status)
- Auto-propose **development gaps** → IDP enrollment
- **Audit trail** (before/after, who changed what, when)
- Export **reports** (Excel/PDF for board/investors)

**Navigation fix included:**
- Only show menus for features available in user's tier
- Demo accounts on FREE show only FREE-tier menus
- Prevents confusion from hidden/blocked features

---

## 1. Problem & Business Outcome

### Current State (Negative)
```
✗ HR can see competency gaps + IDP + LMS
✗ HR can see performance reviews
✗ HR cannot visualize talent pipeline together
✗ No succession plan → "Who replaces VP of Sales if she leaves?"
✗ No readiness scoring → "Is this person ready in 6 months?"
✗ Risk: Unexpected departure → No backup plan
```

### Desired State (After Module 3)
```
✓ HR visualizes 9-box: performance (low/med/high) × potential (low/med/high) = 9 boxes
✓ Each box shows: High Performer/High Potential (A-Player), solid performer (B), etc.
✓ HR flags critical roles (VP Sales, CFO, etc.)
✓ HR designates successor slate (candidates ranked by readiness)
✓ Readiness calculated: competency gap + IDP progress + manager assessment
✓ Gap proposals: "VP needs Strategic Thinking. Suggest LMS course X" (auto-link IDP)
✓ Audit: Every change logged with reason + timestamp
✓ Export: Board can see "Succession readiness: 80% of critical roles covered"
```

### Business Impact
- **Retention**: Succession plan shows career path → reduces flight risk of high-performers
- **Risk mitigation**: Know backup before crisis
- **Compliance**: Audit trail for audit/investor questions ("Why was John in High Performer box?")
- **Upsell**: Talent management = PROFESSIONAL+ = +Rp 5M revenue per deal

---

## 2. Personas & Permissions

### HR / COMPANY_ADMIN
```
Can:
  - View + edit 9-box configuration (axis, thresholds)
  - Run kalibrasi session (draft → locked workflow)
  - View all employees on 9-box matrix
  - Edit box placement + justification
  - Flag critical roles + edit succession slate
  - Assign readiness status (Ready Now / 1-2yr / 2-5yr / Develop)
  - View + export reports (9-box, succession plan, readiness)
  - Enroll successor candidates in LMS/IDP (reuse Mod 1-2)

Cannot:
  - See salary/bank/NPWP of successor (except if FINANCE override)
  - Modify competency library (separate Mod 1 permission)
  - Delete assessment data (append-only audit)

Row scope: Only employees in own company
Audit: Every edit logged
```

### MANAGER (optional, if permission granted)
```
Can (if enabled):
  - View direct reports on 9-box (not cross-functional)
  - Suggest box placement for own directs (requires HR approval before locked)
  - View own readiness status

Cannot:
  - Edit global config
  - Lock kalibrasi session
  - Designate critical roles
  - See peer/up employee data

Row scope: Direct reports only + own record
Audit: Suggestions tracked as separate record (not direct edit)
```

### EMPLOYEE (default: limited)
```
Can (read-only):
  - View own box placement + justification
  - View own development hints (gap + suggested IDP)
  - View own readiness status

Cannot:
  - See peer/manager/director boxes (privacy)
  - Edit anything

Row scope: Self only
Audit: View-only, no edit
```

### FINANCE
```
Can:
  - View 9-box (read-only) for org structure
  - NO access to succession/readiness unless explicit override

Cannot:
  - Edit anything
  - See salary data linked to 9-box
  
Rule: Finance ≠ modify talent plans (only HR)
```

---

## 3. In Scope (Module 3)

### 3.1 9-Box Matrix Configuration

```
Axis 1 (Y): POTENTIAL (Future capability)
  - Source: Competency gap assessment (Module 1)
  - Calculation: (Desired competency level - Current level) / 3 tiers
    → Low (gap ≥ 60%), Medium (20-60%), High (gap ≤ 20%)
  - Admin can override calculation
  - History tracked

Axis 2 (X): PERFORMANCE (Current capability)
  - Source: Performance cycle rating (Module 1)
  - Values: Low (1-2 stars), Medium (3 stars), High (4-5 stars)
  - Admin can override
  - History tracked

9-Box Layout:
  Potential
    High   |  D7 - Superstar | D8 - Rising Star | D9 - A-Player
           |                 |                  |
    Medium |  D4 - Core Tal  | D5 - Performer   | D6 - High Potential
           |                 |                  |
    Low    |  D1 - Question  | D2 - Solid       | D3 - Specialist
           |________________|__________________|
               Low            Medium            High
               PERFORMANCE

Box 1-9 labels customizable per company (optional; defaults above)
```

### 3.2 Kalibrasi Session (Workflow)

```
1. HR creates session: "Kalibrasi 2026 Q3"
   - Period: Jul 2026 - Sep 2026
   - Status: Draft
   - Participants: HR, Managers (if enabled)

2. HR configures:
   - Performance data source (latest cycle)
   - Competency assessment source (latest)
   - Critical roles list (user selects from Positions)
   - Managers can suggest? (true/false)

3. Manager/HR suggest placement:
   - Employee name
   - Suggested box (1-9)
   - Justification (text + links to cycle/assessment)
   - If manager suggested: HR reviews before lock

4. HR locks session:
   - All employees assigned to box
   - Status: Locked (audit shows timestamp + HR who locked)
   - Changes no longer allowed (edit requires session unlock + re-lock)

5. Session history:
   - View prior sessions + dates + results
   - Diff: Show who moved which box (audit trail)

Workflow status: Draft → In Review → Locked → Archived
```

### 3.3 Succession Planning & Readiness

```
Critical Role Designation:
  HR marks Position as "Critical" (e.g., VP Sales, CFO, COO, MD)
  → For each Critical Role, successor slate appears

Successor Slate (per Critical Role):
  1. Candidate slot 1: (auto-filled from employees in high box, e.g., D6/D8/D9)
     - Name
     - Current role
     - Readiness status: Ready Now / 1-2yr / 2-5yr / Develop
     - Competency gap (calculated from IDP Module)
     - Manager assessment (1-5 scale)
     - HR note (why this candidate)
  
  2. Candidate slot 2, 3, ... (1-N slots)

Readiness Scoring (auto-calculated, HR can override):
  - Ready Now: All competencies ≥ 80%, manager rate ≥ 4/5
  - 1-2yr: Competencies 60-80%, manager rate 3-4/5, active IDP
  - 2-5yr: Competencies <60%, IDP enrolled, potential high
  - Develop: Not ready, needs structured plan

Successor change history:
  - When candidate added/removed/reordered
  - Who did it + reason
  - Timestamp
```

### 3.4 Development Gap & IDP Linkage

```
Automatic Gap Proposal (Module 3 → Module 1-2 bridge):
  After kalibrasi locked:
  - System identifies successor candidates with gaps ≥ 30%
  - Proposes: "VP Sales role needs Strategic Thinking (gap 40%)
               Suggest LMS module 'Strategy 101' + IDP goal
               by Q1 2027"
  
  HR can:
  - Approve proposal → Auto-enroll candidate in LMS + create IDP goal
  - Reject → Note reason
  - Modify → Pick different module/goal
  - Skip → No action

Visibility:
  - EMPLOYEE sees own gap + proposal (if approved)
  - MANAGER sees direct report gaps + proposals
  - HR sees all (global + by candidate)
```

### 3.5 Reports & Export

```
Report 1: 9-Box Matrix Report
  - Table: 9 boxes, employee count per box, names (clickable)
  - Charts: Distribution pie, trend (vs prior kalibrasi)
  - Filter: By org/dept/role/manager
  - Export: Excel (names + boxes) / PDF (charts only, no names)

Report 2: Succession Readiness Report
  - Critical role name
  - Successor slate (1-N candidates)
  - Readiness % (e.g., "VP Sales: 80% ready — 1 of 3 candidates Ready Now")
  - Gap summary
  - Export: Excel (names + readiness) / PDF (exec summary)

Report 3: Development Proposals
  - Candidate name, target role, gap, proposed module
  - Status: Proposed / Approved / Completed / Rejected
  - Timeline
  - Export: Excel

Tier gating:
  - PROFESSIONAL: Can generate reports, export Excel/PDF (names visible)
  - BUSINESS: + unlimited export, API report endpoint
  - FREE/STARTER/ENTERPRISE: No access
```

### 3.6 RBAC & Audit

```
Permission matrix (at Company + Employee level):
  ROLE              | CAN_VIEW_9BOX | CAN_EDIT_BOX | CAN_LOCK_SESSION | CAN_FLAG_CRITICAL
  SUPER_ADMIN       | ✓             | ✓           | ✓                | ✓
  COMPANY_ADMIN     | ✓             | ✓           | ✓                | ✓
  HR                | ✓             | ✓           | ✓                | ✓
  MANAGER           | Directs only  | Suggest     | ✗                | ✗
  FINANCE           | Read-only     | ✗           | ✗                | ✗
  EMPLOYEE          | Self only     | ✗           | ✗                | ✗

Audit table (TalentMatrixAudit):
  - Session created: date, created by
  - Employee moved: from_box → to_box, reason, date, edited by
  - Critical role flagged/unflagged
  - Successor added/removed
  - Readiness changed
  - Proposal approved/rejected
  - Session locked: date, by whom
  - Session unlocked: date, by whom (rare, requires reason)
  
  Retention: 7 years (compliance)
```

### 3.7 Navigation & Menu Visibility Fix

```
Current Issue: Menu hides restricted features, but confusion remains.
  
Solution: Only show menus for tier-available features

Navigation visibility rules:
  - Build feature matrix: tier → [available_features]
  - For each nav item: check if feature enabled for user's tier
  - If not enabled: Hide from nav + redirect to /upgrade if direct URL

Example (FREE tier):
  Nav shows:
    ✓ Employees
    ✓ Organization
    ✓ Dashboard
    ✓ Documents
    ✓ Helpdesk
    ✓ Settings
  
  Nav hides:
    ✗ Payroll (hidden, not in FREE)
    ✗ Attendance (hidden)
    ✗ Leave (hidden)
    ✗ Recruitment (hidden)
    ✗ Performance (hidden)
    ✗ Training (hidden)
    ✗ Talent (hidden, this is Module 3)
    ✗ Integrations (hidden)

Example (PROFESSIONAL tier):
  Nav shows:
    ✓ Employees
    ✓ Payroll
    ✓ Attendance
    ✓ Leave
    ✓ Recruitment
    ✓ Performance
    ✓ Training
    ✓ Talent (NEW in v13.0)
    ✓ Dashboard
    ... etc
  
  Nav hides:
    ✗ Integrations (only BUSINESS+)

Applies to:
  - Production accounts (all tiers)
  - Demo accounts (even if demo shows full data, nav only shows tier-available menus)
```

---

## 4. Out of Scope (Module 3)

```
❌ Career marketplace (Module 4)
❌ Earned wage access / salary benchmarking (Module 5-6)
❌ Vertical packages (Module 7-8)
❌ Native mobile app (separate project)
❌ Changing payroll/tax engine
❌ Organizational redesign (Org only shows reporting structure)
❌ 360 feedback workflow modifications (reuse Module 1)
❌ Direct bank integration for successor alerts
❌ AI-generated recommendations ("Fire this person")
❌ Real-time predictive analytics
```

---

## 5. Data Model & Migration

### 5.1 New Tables (Prisma)

```prisma
model TalentMatrixConfiguration {
  id                    String              @id @default(cuid())
  company               Company             @relation(fields: [companyId], references: [id], onDelete: Cascade)
  companyId             String              @unique
  
  // Axis config
  performanceSource     String              @default("performance_cycle") // or custom
  potentialSource       String              @default("competency_gap")
  
  // 9-box labels (customizable)
  boxLabels             Json                @default("{\"1\":\"Question\", \"2\":\"Solid\", ..}")
  
  // Managers can suggest?
  allowManagerSuggestions Boolean           @default(true)
  
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
}

model TalentMatrixSession {
  id                    String              @id @default(cuid())
  company               Company             @relation(fields: [companyId], references: [id], onDelete: Cascade)
  companyId             String
  
  name                  String              // "Kalibrasi 2026 Q3"
  period                String              // "2026-Q3"
  status                String              @default("draft") // draft, in_review, locked, archived
  
  // Config for this session
  performanceCycleId    String?             // Link to Performance cycle
  competencyAssessmentDate DateTime?
  
  // Session owners
  createdBy             String              // userId
  createdAt             DateTime            @default(now())
  lockedBy              String?
  lockedAt              DateTime?
  
  // Placements in this session (relation)
  placements            TalentMatrixPlacement[]
  
  updatedAt             DateTime            @updatedAt
  
  @@unique([companyId, period])
  @@index([companyId, status])
}

model TalentMatrixPlacement {
  id                    String              @id @default(cuid())
  session               TalentMatrixSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  sessionId             String
  
  employee              Employee            @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  employeeId            String
  
  // Box assignment (1-9)
  boxNumber             Int                 // 1-9
  performanceRating     String              // "Low", "Medium", "High"
  potentialRating       String              // "Low", "Medium", "High"
  
  // Justification
  justification         String?             // Why this box
  manager Suggested      Boolean             @default(false) // Did manager suggest?
  suggestedBy           String?             // User ID who suggested
  approvedBy            String?             // User ID who approved (if manager suggestion)
  
  // History
  movedFromBox          Int?                // Previous box (if changed)
  movedReason           String?
  
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  
  @@unique([sessionId, employeeId])
  @@index([sessionId, boxNumber])
}

model SuccessionPlanning {
  id                    String              @id @default(cuid())
  company               Company             @relation(fields: [companyId], references: [id], onDelete: Cascade)
  companyId             String
  
  // Critical role
  position              Position            @relation(fields: [positionId], references: [id])
  positionId            String
  isCritical            Boolean             @default(false)
  
  // Successor slate (1-N)
  successors            SuccessorCandidate[]
  
  // Status
  lastReviewedAt        DateTime?
  lastReviewedBy        String?
  
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  
  @@unique([companyId, positionId])
  @@index([companyId, isCritical])
}

model SuccessorCandidate {
  id                    String              @id @default(cuid())
  plan                  SuccessionPlanning  @relation(fields: [planId], references: [id], onDelete: Cascade)
  planId                String
  
  employee              Employee            @relation(fields: [employeeId], references: [id])
  employeeId            String
  
  // Ranking in slate (1 = first choice)
  rank                  Int
  
  // Readiness
  readinessStatus       String              @default("develop") // ready_now, 1_2yr, 2_5yr, develop
  readinessScore        Float?              // 0-100
  
  // Assessment
  competencyGapPercent  Float?              // %
  managerRating         Int?                // 1-5
  
  // Notes
  notes                 String?             // Why this candidate
  addedBy               String              // userId
  addedAt               DateTime            @default(now())
  
  @@unique([planId, employeeId, rank])
  @@index([planId, readinessStatus])
}

model DevelopmentProposal {
  id                    String              @id @default(cuid())
  company               Company             @relation(fields: [companyId], references: [id], onDelete: Cascade)
  companyId             String
  
  // Gap + proposal
  successor             SuccessorCandidate  @relation(fields: [successorId], references: [id], onDelete: Cascade)
  successorId           String
  
  targetRole            Position            @relation(fields: [positionId], references: [id])
  positionId            String
  
  // Gap & proposal
  competencyGap         String              // Competency name
  gapPercent            Float               // %
  proposedLmsModule     String?             // Module ID or name
  proposedIdpGoal       String?             // Description
  
  // Status
  status                String              @default("proposed") // proposed, approved, rejected, completed
  approvedBy            String?
  approvedAt            DateTime?
  
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  
  @@index([companyId, status])
  @@index([successorId])
}

model TalentMatrixAudit {
  id                    String              @id @default(cuid())
  company               Company             @relation(fields: [companyId], references: [id], onDelete: Cascade)
  companyId             String
  
  // What changed
  entity                String              // "session", "placement", "successor", "proposal"
  entityId              String
  action                String              // "created", "updated", "deleted", "locked", "unlocked"
  
  // Before/after (sensitive data redacted)
  beforeState           Json?
  afterState            Json?
  reason                String?
  
  // Who did it
  performedBy           String              // userId
  performedAt           DateTime            @default(now())
  
  @@index([companyId, performedAt])
  @@index([entityId])
}
```

### 5.2 Migration Path

```sql
-- Run this migration on deploy:
npx prisma migrate deploy

-- Backfill:
-- 1. Create TalentMatrixConfiguration per company (first time)
-- 2. Load latest performance cycle + competency assessment
-- 3. Calculate boxes (performance × potential)
-- 4. Mark critical positions (HR input required, seeded empty)
-- 5. Audit trail starts on deployment date
```

---

## 6. API Contracts

### 6.1 Kalibrasi Session

```
POST /api/v1/talent/sessions
{
  name: "Kalibrasi 2026 Q3",
  period: "2026-Q3",
  performanceCycleId: "uuid",
  competencyAssessmentDate: "2026-07-20"
}

Response: { id, status: "draft", createdAt, ... }

GET /api/v1/talent/sessions/{id}
  → Full session + placements

PUT /api/v1/talent/sessions/{id}
{
  name?: string,
  performanceCycleId?: string,
  allowManagerSuggestions?: boolean
}

POST /api/v1/talent/sessions/{id}/lock
  → status: draft → locked, lockedAt set

POST /api/v1/talent/sessions/{id}/unlock
{ reason: "Need to fix John's box" }
  → status: locked → draft, audit logged
```

### 6.2 Placements

```
POST /api/v1/talent/sessions/{sessionId}/placements
{
  employeeId: "uuid",
  boxNumber: 5,
  performanceRating: "Medium",
  potentialRating: "High",
  justification: "Strong in current role, ready for next level"
}

Response: { id, employeeId, boxNumber, createdAt, ... }

PUT /api/v1/talent/sessions/{sessionId}/placements/{employeeId}
{ boxNumber, justification, ... }
  → Audit: old box → new box, logged

GET /api/v1/talent/sessions/{sessionId}/placements
  → List all employees + boxes (paginated, 50/page)
```

### 6.3 Succession Planning

```
POST /api/v1/talent/positions/{positionId}/critical
{ isCritical: true }
  → Mark position as critical role

GET /api/v1/talent/positions/{positionId}/succession
  → Succession plan + candidates

POST /api/v1/talent/positions/{positionId}/successors
{
  employeeId: "uuid",
  rank: 1,
  readinessStatus: "1_2yr",
  managerRating: 4,
  notes: "Strong in technical skills, needs leadership training"
}

Response: { id, rank, readinessStatus, ... }

DELETE /api/v1/talent/positions/{positionId}/successors/{candidateId}
{ reason: "Moved to different role" }
  → Audit logged
```

### 6.4 Development Proposals

```
GET /api/v1/talent/proposals
{ status: "proposed", companyId: "..." }
  → List proposals for review

PUT /api/v1/talent/proposals/{id}
{ status: "approved" }
  → If approved, auto-enroll in LMS (call Module 1-2 API)

Response includes IDP goal created + LMS enrollment link
```

---

## 7. Frontend Routes & Pages

```
New pages (under /talent):
  /talent                         Dashboard (overview, sessions, critical roles)
  /talent/sessions                List sessions + create
  /talent/sessions/{id}           Session detail + matrix (9-box grid)
  /talent/sessions/{id}/placements Edit placements for session
  /talent/positions/{id}/succession Succession plan (critical role detail)
  /talent/reports/matrix          9-box matrix report + export
  /talent/reports/succession      Succession readiness report
  /talent/reports/proposals       Development proposals + approve/reject

Navigation visibility:
  /talent only shown if:
    - Tier ≥ PROFESSIONAL
    - User role in [SUPER_ADMIN, COMPANY_ADMIN, HR]
  
  If accessed as MANAGER/EMPLOYEE: redirect to /upgrade
  If accessed as FREE/STARTER: redirect to /upgrade
```

---

## 8. Tier & Feature Gating

```
Tier Matrix:

Feature                | FREE | STARTER | PROF | BUS | ENT
─────────────────────────────────────────────────────────
View 9-box (read)      | ✗    | ✗       | ✓    | ✓   | ✓
Edit placements        | ✗    | ✗       | ✓    | ✓   | ✓
Lock kalibrasi         | ✗    | ✗       | ✓    | ✓   | ✓
Succession planning    | ✗    | ✗       | ✓    | ✓   | ✓
Export reports         | ✗    | ✗       | ✓    | ✓   | ✓
API access             | ✗    | ✗       | ✗    | ✓   | ✓

Default: PROFESSIONAL minimum (not available in FREE/STARTER)
```

---

## 9. Security & Privacy Invariants

### 9.1 PII/Salary Protection

```
✓ Successor candidate names visible to HR/MANAGER only
✓ Salary NOT shown in any 9-box/succession view (even to HR)
✓ Bank/NPWP/NRIC NOT shown (if present, filtered)
✓ Competency gap shown; competency library hidden from non-HR
✓ Audit logs: Redact sensitive fields (salary, bank) if accessed
```

### 9.2 Row Scope & Isolation

```
✓ Employee can only view own box + gaps (self only)
✓ Manager can only view directs on 9-box (if permission granted)
✓ HR can view all in own company (tenant isolated)
✓ Finance cannot view succession data (by default)
✓ MANAGER cannot lock session (only HR)
✓ Soft-deleted/inactive employees excluded from matrix
```

### 9.3 Audit Trail

```
✓ Every edit: user, timestamp, old value → new value, reason
✓ Session lock/unlock: who, when, reason
✓ Successor added/removed: who, why, when
✓ Placement moved boxes: from box, to box, justification
✓ Sensitive data redacted in audit (no salary logging)
✓ 7-year retention (compliance)
```

---

## 10. Non-Functional Requirements

```
NFR-1: Performance
  - 9-box matrix load: < 2s (for 1000 employees)
  - Search/filter employees: < 500ms
  - Export Excel: < 3s
  - Mobile matrix: horizontal scroll allowed, usable ≤ 400px width

NFR-2: Scalability
  - Support 5000 employees per company (BUSINESS tier)
  - Concurrent session edits: Last-write-wins with audit trail
  - Database indexes on companyId, sessionId, employeeId

NFR-3: Reliability
  - Session lock atomic (no partial lock)
  - Placement edit idempotent (retry-safe)
  - Audit append-only (no deletes, no overwrites)

NFR-4: Mobile
  - Matrix detail view: Responsive, horizontal scroll
  - Placement edit: Touch-friendly buttons (min 44px)
  - Export: Accessible on mobile (download to Files app)

NFR-5: Accessibility
  - WCAG 2.1 AA: Color contrast, keyboard nav, screen readers
  - Matrix 9-box: Use text labels + color (not color-only)
  - Alt text on charts
```

---

## 11. Launch Plan & Timeline

### Pre-Launch (Aug 15-31)
```
[ ] Frontend: Build pages (/talent/sessions, /talent/reports)
[ ] Backend: Deploy APIs + database migrations
[ ] QA: Test 24 SRS acceptance criteria
[ ] Docs: Update help center + training
```

### Launch (Sep 1)
```
[ ] Deploy to production (backend + frontend)
[ ] PROFESSIONAL tier customers see /talent menu
[ ] Free tier customers: Menu hidden
[ ] Monitor: Check error logs, query performance
```

### Post-Launch (Sep 1-7)
```
[ ] Gather feedback (HR teams)
[ ] Monitor: Session lock/unlock audit trail working?
[ ] Monitor: Export performance (< 3s for 1000 emp?)
[ ] Support: On-call for issues
```

---

## Success Criteria

```
✅ FEATURE:
  - 9-box matrix creates & locks session
  - Placements saved per employee
  - Succession plan designates candidates + readiness
  - Export works (Excel + PDF)
  - Audit trail accurate

✅ BUSINESS:
  - PROFESSIONAL tier adoption: 10+ customers trying (month 1)
  - Session creation/month: 20+ (industry adoption)
  - Report export: 5+ per customer (usage signal)

✅ TECHNICAL:
  - Zero data loss (migration → backfill accurate)
  - Audit trail complete (100% of edits logged)
  - Performance: Matrix load < 2s (1000 emp)
  - Navigation: FREE tier has NO /talent in nav

✅ SECURITY:
  - Salary not leaked in 9-box views
  - FINANCE blocked from succession by default
  - Row scope enforced (employee only sees self)
  - Audit redaction working (no PII in logs)
```

---

## Rollback Plan

```
If critical issues found:

Option 1: Database rollback (< 1 day post-launch)
  - Disable /talent routes
  - Drop new tables (migrations rollback)
  - Revert to v12.1
  - Minimal downtime

Option 2: Feature flag disable (any time)
  - Keep code, disable route
  - PROFESSIONAL users see error: "Talent features temporarily unavailable"
  - Investigate issue offline
  - Re-enable when fixed

Trigger: If audit trail broken, or data corrupted, or > 50% of sessions fail
```

---

# SUMMARY: PRD v13.0 (Module 3)

```
Feature: 9-Box Matrix + Succession Planning
Minimum Tier: PROFESSIONAL (300 emp hard)
Roles: HR/COMPANY_ADMIN manage, MANAGER suggest, EMPLOYEE view self
RBAC: Hard permissions (HR-only lock, Finance blocked by default)
Audit: Append-only, 7-year retention
Data Model: 6 new tables + migration
APIs: 15+ endpoints (session, placement, succession, proposal, reports)
Navigation: Tier-based visibility (FREE hides /talent, PROF shows)
Timeline: Dev Aug 15-31, Launch Sep 1
```

**Status: Ready for SRS + SDD** ✅

---

*Last Updated: 24 Juli 2026 | Version: 13.0 (FINAL PRD) | Owner: Dozer*

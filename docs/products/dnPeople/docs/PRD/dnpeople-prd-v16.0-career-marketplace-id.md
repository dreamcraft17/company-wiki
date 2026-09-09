# dnPeople Internal Career Marketplace
## Product Requirements Document (PRD) v16.0

**Bahasa:** Bahasa Indonesia  
**Mata Uang:** IDR (Rp)  
**Tanggal:** 10 Agustus 2026  
**Status:** Ready for Development  
**Owner:** PT. Dozer Napitupulu Technology (DN Tech)  
**Module:** v4 Module 4 — Career Mobility  

---

## 1. Ringkasan Eksekutif

**Problem:** HR Indonesia punya data karyawan, competency, succession planning, tapi **mobilitas internal masih manual** (email, spreadsheet, WhatsApp). High-performer tidak lihat peluang → flight risk. HR tidak punya pipeline terpusat.

**Solusi:** Internal Career Marketplace — karyawan browse + apply lowongan internal; HR manage pipeline (screening → interview → offer → accepted).

**Impact:**
- ✅ Internal fill rate +15% (target 6 bulan)
- ✅ Time-to-fill internal < 30 hari median
- ✅ Employee engagement (visibility to growth opportunities)
- ✅ Upsell feature (PROFESSIONAL+ tier)

**Timeline:** 6 minggu (Sep 1 - Oct 15, 2026)  
**Go-live target:** Oct 15, 2026 (production)

---

## 2. Objectives & Scope

### 2.1 Tujuan

✅ **Centralize internal mobility** — satu platform untuk post, apply, manage internal jobs  
✅ **Empower employees** — visibility + formal apply path vs WhatsApp  
✅ **Streamline HR operations** — pipeline view, audit trail, automate position change  
✅ **Business intelligence** — metrics: fill rate, time-to-fill, source (internal vs external)  
✅ **Succession integration** — optional link to succession readiness (v16.1)  

### 2.2 Scope v16.0 (MVP)

✅ **Internal job posting** (HR create, publish, close)  
✅ **Employee apply** (browse, apply with cover note, withdraw, track status)  
✅ **Pipeline management** (HR: stage transitions, reject with reason, export)  
✅ **Notifications** (in-app minimum; email if SMTP ready)  
✅ **Tier gating** (`career:marketplace` @ PROFESSIONAL+)  
✅ **Audit trail** (all status changes logged)  
✅ **Basic reports** (applicants per job, open roles, time-to-fill)  

❌ Out-of-Scope v16.0
❌ Manager approval workflow (HR only in MVP)  
❌ Competency gap warning (stretch → v16.1)  
❌ Offer letter e-sign (reuse recruitment v2.0 if available)  
❌ Full integration with performance review scores  
❌ Video interview hosting  
❌ Succession auto-suggestion (v16.1)  

---

## 3. User Personas & Workflows

### 3.1 HR (Job Posting)

**Workflow:**
1. Login → Career Marketplace → "Post Job"
2. Fill: title, dept, position, description, deadline, tier minimum (optional)
3. Save as DRAFT → Review → PUBLISH
4. Job appears in employee feed
5. Track applications (applicant list, stages, export)
6. Close job when filled

**Needs:**
- ✅ Bulk edit (change deadline, reopen closed job)
- ✅ Duplicate job from template
- ✅ Pipeline kanban or table view
- ✅ Reject applicant with reason code
- ✅ Export applicants (Excel/PDF)

### 3.2 Manager (Optional, v16.0)

**Workflow:**
1. Can view open jobs for their department
2. Can see applicants applying to jobs in their team (read-only)
3. Optional: recommend internal candidates (future v16.1)

**Constraint:** Cannot create jobs (HR only in MVP)

### 3.3 Employee (Applying)

**Workflow:**
1. Login → Career Marketplace → Browse jobs
2. Filter by: department, role, team
3. Click job → See: title, dept, description, deadline, current applicants count
4. Click "Apply" → Fill cover note → Auto-attach: resume (CV), competency summary, performance badge
5. Submit → Get confirmation + status badge (APPLIED)
6. Track application: See status timeline (APPLIED → SCREENING → INTERVIEW → OFFER → ACCEPTED/REJECTED)
7. Can withdraw before OFFER stage
8. Get in-app + email notifications on status change

**Needs:**
- ✅ One active application per job (no duplicate apply)
- ✅ See own applications dashboard
- ✅ Withdraw option
- ✅ Status update notifications

### 3.4 Finance / SUPER_ADMIN (Read-only)

- View dashboard (open roles, fill rate)
- No posting/editing capability

---

## 4. Feature Breakdown

### 4.1 Internal Job Posting

**Feature:** HR create + manage internal job postings

**Details:**
- **Create job:** Title, department, position, description, requirements (optional), deadline, tier minimum (optional)
- **Status flow:** DRAFT → PUBLISHED → CLOSED or FILLED
- **Visibility:** Internal only (not on public `/careers` page)
- **Auto-fields:** Created by (auto), created date (auto), company (auto from tenant)
- **Edit:** Can edit any field while DRAFT; only deadline + description when PUBLISHED
- **Close:** Mark FILLED manually when hired; auto-close after deadline
- **Duplicate:** Create from template or previous job (pre-fill all fields)
- **Bulk actions:** Extend deadline, reopen closed job, batch close

**Acceptance Criteria:**
- [ ] Job created in DRAFT status by default
- [ ] Published job visible in employee feed
- [ ] Cannot edit job after PUBLISHED except deadline + description
- [ ] Closed job hidden from employee view
- [ ] Tier minimum works (only eligible employees see if set)
- [ ] Audit log all CRUD operations

---

### 4.2 Employee Browse & Apply

**Feature:** Employee browse internal jobs + apply

**Details:**
- **Browse:** List all PUBLISHED jobs (by company); filter by department, role
- **Job detail:** Title, dept, position, description, deadline, applicants count (public), requirements (read-only)
- **Apply:** Cover note (optional, max 500 chars) + auto-attach: current role, department, competency summary, performance badge (if available)
- **One apply per job:** Unique constraint on (jobId, employeeId); if withdrew, can re-apply
- **Submit:** Confirmation message + status badge "APPLIED"
- **Track status:** Dashboard showing: job title, applied date, current status (APPLIED/SCREENING/etc), last update date
- **Withdraw:** Available until offer stage; auto-sends email to HR
- **Notifications:** In-app notification + email (if SMTP ready) on status change

**Acceptance Criteria:**
- [ ] Employee sees only PUBLISHED jobs (status = PUBLISHED)
- [ ] Cover note is optional
- [ ] One active application per job (validation)
- [ ] Withdraw removes application from pipeline
- [ ] Status timeline visible to employee (read-only)
- [ ] Notifications sent on: apply received, status change (screening/interview/offer/reject)

---

### 4.3 Pipeline Management (HR)

**Feature:** HR manage applicants + stage transitions

**Details:**
- **Pipeline view:** Kanban board or table
  - Columns: APPLIED | SCREENING | INTERVIEW | OFFER | ACCEPTED | REJECTED | WITHDRAWN
  - Drag-drop to move applicants (or UI button for accessibility)
  - Sort by: applied date, name
  
- **Applicant card:** Name, email, phone, applied date, cover note (hover), competency badge
- **Bulk actions:** Move multiple applicants, reject multiple with reason
- **Reject:** Required reason code (e.g., "Competency gap", "Better fit elsewhere", "Withdrawn by manager")
- **Offer:** Generate from template (reuse recruitment v2.0 if available)
- **Accept:** Auto-trigger: update employee position/department, create onboarding task
- **Export:** Applicants per job (Excel/PDF) with all details; max 1000 rows

**Acceptance Criteria:**
- [ ] HR can move applicant between stages
- [ ] Reject requires reason (not nullable)
- [ ] Accepted automatically updates employee position
- [ ] Export includes: name, email, applied date, status, cover note, current role
- [ ] Audit log all stage transitions with HR user_id + timestamp
- [ ] No access control bypass (HR can only see their company's pipeline)

---

### 4.4 Notifications & Communications

**Feature:** Applicant + HR notifications

**Events:**
1. **Application received** → Email to HR + job owner; in-app notification
2. **Status changed** (SCREENING/INTERVIEW/OFFER) → Email + in-app to employee
3. **Rejected** → Email with reason code + in-app to employee
4. **Offer created** → Email + in-app to employee
5. **Accepted** → Email to HR + employee; trigger onboarding

**Channels:**
- ✅ In-app notification (always)
- ✅ Email (if SMTP production ready; else: graceful fallback, log warning)

**Acceptance Criteria:**
- [ ] Notifications are non-blocking (app works even if email fails)
- [ ] In-app notifications always work (email is optional)
- [ ] Reason code visible in rejection email/notification
- [ ] Notification includes: job title, current status, action URL (link to apply dashboard)

---

### 4.5 Tier Gating & Access Control

**Feature:** Feature availability by subscription tier

**Rule:**
```
Feature: career:marketplace
├─ FREE: ✗ (hidden)
├─ STARTER: ✗ (hidden)
├─ PROFESSIONAL: ✅ (full access)
├─ BUSINESS: ✅ (full access)
└─ ENTERPRISE: ✅ (full access)
```

**Behavior:**
- FREE/STARTER: No `/career` nav item; 404 if direct URL
- PROFESSIONAL+: Nav item visible; full feature access
- RBAC: HR can CRUD; Employee can apply; Manager read-only

**Acceptance Criteria:**
- [ ] Feature flag `career:marketplace` controls visibility
- [ ] Attempted access to `/career` without tier → 404 (not "upgrade" nag)
- [ ] Nav item only visible to eligible tiers

---

### 4.6 Integration with Existing Modules

**Talent / Succession (v16.1, not MVP):**
- Optional: Link job to succession readiness target
- Optional: Auto-notify succession slate if applicable

**Competency (future):**
- Show competency gap on apply (advisory only, not blocking)

**Onboarding (trigger):**
- Accepted offer → Create onboarding task (reuse v5.0 flow)

**Performance (read-only):**
- Employee's latest review score badge on apply card
- Used in: manager review (optional), HR decision-making

**Public Careers (isolation):**
- Internal jobs NEVER appear on `/careers` public page
- Strict visibility boundary

**Recruitment (separation):**
- Internal jobs separate from external recruitment module
- Share: offer template, onboarding trigger, notification infrastructure

**Audit (logging):**
- All CRUD logged to global audit table
- Fields: user_id, action, resource_type (InternalJob/InternalApplication), resource_id, timestamp, before/after state (JSON)

---

## 5. Data Model (High-Level)

### Core Entities

**InternalJob**
```
id (PK)
companyId (FK Company)
title, departmentId (FK Dept), positionId (FK Position)
description (TEXT), requirements (TEXT)
status (DRAFT|PUBLISHED|CLOSED|FILLED)
publishedAt, closesAt, filledAt (timestamps)
tierMinimum (optional: PROFESSIONAL|BUSINESS|ENTERPRISE)
createdById (FK User), createdAt
updatedById (FK User), updatedAt
isArchived (soft delete)
```

**InternalApplication**
```
id (PK)
companyId (FK), jobId (FK InternalJob), employeeId (FK User)
status (APPLIED|SCREENING|INTERVIEW|OFFER|ACCEPTED|REJECTED|WITHDRAWN)
coverNote (TEXT, optional, max 500 chars)
appliedAt, withdrawnAt, rejectedAt, acceptedAt (timestamps)
rejectionReason (ENUM: "Competency gap", "Better fit", "Withdrawn", "On hold")
createdAt, updatedAt
```

**InternalApplicationStatusHistory** (audit)
```
id (PK)
applicationId (FK)
oldStatus, newStatus
changedBy (FK User), changedAt
notes (optional)
```

**Indexes:**
- `(companyId, status)` on InternalJob (list published jobs)
- `(jobId, employeeId) UNIQUE` on InternalApplication (one apply per job constraint)
- `(jobId, status)` on InternalApplication (pipeline view)
- `(employeeId, status)` on InternalApplication (employee's applications)

---

## 6. Success Metrics

### Business Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| **Internal fill rate** | Baseline → +15% | 6 months post-launch |
| **Time-to-fill internal** | < 30 days median | By month 3 |
| **Jobs posted** | 5+ per pilot customer | Month 1 |
| **Application rate** | 20% of eligible employees apply (at least once) | Month 2 |
| **Offer acceptance rate** | 80%+ of offers accepted | Month 3 |
| **Employee NPS** (optional) | Mobility feature satisfaction ≥ 7/10 | Month 3 |

### Technical Metrics

| Metric | Target |
|--------|--------|
| **Page load time** | < 2s (job list, applicant pipeline) |
| **API response** | < 500ms (list jobs, create application) |
| **Uptime** | 99.5% (SLA) |
| **Audit log completeness** | 100% of CRUD operations logged |
| **Notification delivery** | 99%+ (in-app); 95%+ (email) |

---

## 7. Timeline & Phases

### Phase 1: Foundation (Sep 1-7, 2026)
- [ ] Data model + migrations
- [ ] Backend service layer
- [ ] API endpoint implementation + tests
- [ ] Database indexes + performance baseline

### Phase 2: Frontend (Sep 8-14, 2026)
- [ ] Job posting UI (HR create/edit/publish)
- [ ] Employee browse + apply UI
- [ ] Pipeline kanban/table view (HR)
- [ ] Mobile responsive

### Phase 3: Integration (Sep 15-20, 2026)
- [ ] Notifications (in-app + email)
- [ ] Position change on accept
- [ ] Onboarding trigger
- [ ] Tier gating + nav wiring
- [ ] Export functionality

### Phase 4: QA & Hardening (Sep 21-30, 2026)
- [ ] End-to-end testing (all workflows)
- [ ] Performance testing (1000+ applicants)
- [ ] Security review (access control, audit)
- [ ] UAT with 1-2 beta customers
- [ ] Documentation + help content

### Phase 5: Launch (Oct 1-15, 2026)
- [ ] Staging → Production deploy
- [ ] Rollout: pilot 5-10 PROFESSIONAL+ customers
- [ ] Monitor: metrics, error rates, support tickets
- [ ] Iterate based on feedback

---

## 8. Rollback Plan

**If critical issues post-launch:**
- Keep v16.0 code in `feature/career-marketplace` branch
- Disable nav item via feature flag `career:marketplace_enabled` (default false initially)
- Revert to previous commit if DB migration causes data loss
- Zero-downtime rollback: disable feature flag (no DB rollback needed)

---

## 9. Assumptions & Dependencies

**Assumptions:**
- Onboarding v5.0 already handles position change on hire
- Email service (SMTP or SendGrid) ready or gracefully degraded
- Tier gating via feature flags already implemented (v15.0+)
- Audit infrastructure available (global AuditLog table)

**Dependencies:**
- PostgreSQL + Prisma (schema migration)
- Express backend (API routes)
- Next.js frontend (UI components)
- Notifications system (in-app + email outbox)
- Auth middleware (role enforcement)

---

## 10. Glossary

| Term | Definition |
|------|-----------|
| **Internal Job** | Job posting visible only to employees within company (not public) |
| **Pipeline** | Applicant workflow stages (Applied → Screening → Interview → Offer → Accepted/Rejected) |
| **Tier minimum** | Optional: restrict job visibility to specific subscription tier |
| **One apply per job** | Constraint: employee can only have one active application per job (can withdraw + re-apply) |
| **Cover note** | Optional free-text field (≤500 chars) on apply explaining interest |
| **Status transition** | HR moving applicant between pipeline stages (logged in audit) |
| **Fill** | Job marked as FILLED when offer accepted by employee |
| **Time-to-fill** | Days from job PUBLISHED to FILLED |

---

**Approved by:** Dozer Fernando Saroha Daniel Napitupulu (CEO + Tech Lead)  
**Version:** 1.0 (Ready for SRS)  
**Last Updated:** 10 Agustus 2026  
**Next:** SRS v16.0 (detailed functional requirements + acceptance criteria)


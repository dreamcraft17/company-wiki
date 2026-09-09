# dnPeople Legal Documents Management System
## Product Requirements Document (PRD) v1.0

**Bahasa:** Bahasa Indonesia  
**Tanggal:** 1 Agustus 2026  
**Status:** Foundation for T&C, Privacy Policy, Acceptable Use Policy  
**Owner:** PT. Dozer Napitupulu Technology (DN Tech)  

---

## 1. Ringkasan Eksekutif

**Legal Documents Management System** adalah backend subsystem yang mengelola Terms & Conditions, Privacy Policy, Acceptable Use Policy, dan semua legal documents dnPeople. Sistem ini:

- ✅ **Version control** setiap dokumen (v1.0, v1.1, v2.0, etc)
- ✅ **Track acceptance** dari setiap user (signed eSignature)
- ✅ **Notify users** tentang changes (30-day notice untuk major changes)
- ✅ **Enforce compliance** (block users jika belum accept new version)
- ✅ **Audit trail** (immutable log siapa accept kapan, dari device mana)
- ✅ **Content management** (markdown editor, preview, publish/unpublish)
- ✅ **Multi-language** support (ID, EN, simplified Chinese)
- ✅ **GDPR/UU PDP compliance** (evidence for regulators)

---

## 2. Business Objectives

### Mengapa Kami Butuh Sistem Ini

1. **Legal Compliance**
   - Prove bahwa users accept T&C sebelum sign up
   - Document consent untuk privacy policy
   - Audit trail untuk regulators (DJP, KEMENKOMINFO)
   - Evidence jika ada dispute/lawsuit

2. **Risk Mitigation**
   - Update T&C jika legal landscape berubah
   - Notify users tentang policy changes
   - Lock access sampai accept new version
   - Reduce liability dengan documented consent

3. **Operational Efficiency**
   - Central place untuk manage semua legal docs
   - Track acceptance rate (% users who accepted)
   - Auto-generate acceptance statistics
   - Reduce support tickets ("Where's the privacy policy?")

4. **User Trust**
   - Transparent policies (easy to read)
   - Clear versioning (users see what changed)
   - Email notifications (users not surprised)
   - Easy-to-revoke consent (user control)

---

## 3. Scope

### In-Scope
✅ Terms & Conditions document management (version, publish, notify)
✅ Privacy Policy document management
✅ Acceptable Use Policy (future: v1.1)
✅ User acceptance tracking (eSignature)
✅ Change notification system (email alerts)
✅ Acceptance statistics & reporting (admin dashboard)
✅ Audit log (immutable acceptance history)
✅ Multi-language support (ID, EN, ZH-simplified)
✅ Admin UI untuk manage documents
✅ User UI untuk view & accept documents
✅ API untuk integration (check acceptance status)

### Out-of-Scope
❌ Digital signature integration (advanced e-signature solution)
❌ Contract generation / PDF watermarking
❌ Integration dengan Notaris Digital (future: v2.0)
❌ Advanced content management (CMS-level)
❌ Translation automation (manual translation for now)

---

## 4. Feature Breakdown

### 4.1 Document Management (Admin)

**Administrators (SUPER_ADMIN, COMPANY_ADMIN) dapat:**

1. **Create/Edit Document**
   - Select type: T&C, Privacy Policy, AUP, Custom
   - Edit markdown content
   - Real-time preview
   - Spelling/grammar check (Grammarly API)
   - Revision history (track who edited, when, what changed)

2. **Version Control**
   - Create new version (v1.0 → v1.1, etc)
   - Mark as "DRAFT", "READY FOR REVIEW", "PUBLISHED"
   - Set effective date
   - Keep all previous versions (readable archive)
   - View diff between versions (what changed)

3. **Publish & Schedule**
   - Publish immediately, OR
   - Schedule for future date/time
   - Auto-notify users 30 days before effective date (untuk major changes)
   - Auto-lock old version (no more acceptances on old version)

4. **Multi-Language**
   - Markdown editor untuk each language
   - Translation tracking (who translated, when)
   - Fallback language (jika translation not available, show English)

5. **Content Approval Workflow** (untuk SUPER_ADMIN)
   - Draft created by Legal/HR
   - Submit for review
   - SUPER_ADMIN approve/reject dengan comment
   - Auto-publish jika approved
   - Rejection sends back to author

---

### 4.2 User Acceptance

**Users see & accept when:**

1. **First Sign-Up**
   - Before creating account: "Accept Terms & Conditions"
   - Modal dengan T&C + Privacy Policy
   - Checkbox: "I have read and agree to..."
   - eSignature: Click "I Accept" = legally binding
   - Timestamp & device info recorded

2. **Major Policy Changes**
   - Notification email "Our policies have changed"
   - Forced re-acceptance: Users must accept before access
   - Block access jika not accepted within 30 days
   - Clear "What changed" link (show diff)

3. **Annual Re-Confirmation** (Optional)
   - Once per year: Re-confirm still agree
   - Just click "I Still Agree" (no re-read needed)
   - Shows timestamp of last acceptance

4. **Selective Acceptance**
   - "I accept T&C" (always required)
   - "I accept Privacy Policy" (always required)
   - "I accept to receive marketing emails" (optional, can uncheck)
   - "I allow analytics tracking" (optional)

---

### 4.3 Notification System

**Auto-send emails untuk:**

1. **Policy Change Notification** (on publication)
   - To: All active users (admin + employees)
   - Subject: "Update to Our Terms & Conditions (Effective Oct 1)"
   - Body: Summary of changes + link ke full document + "Accept by Sept 20" deadline
   - Include: Diff link (show what changed)
   - CTA: "Accept Now" button

2. **Reminder Email** (7 days before deadline)
   - "You haven't accepted our new policies"
   - "Deadline is Sept 20"
   - "Click here to accept"

3. **Access Blocked Notification** (after 30 days deadline passed)
   - "Your access has been restricted due to non-acceptance"
   - "Accept policies to regain access"
   - Link to acceptance page

4. **Welcome Email** (after account creation)
   - "Welcome to dnPeople"
   - "Here are our policies"
   - Links to T&C, Privacy, AUP

---

### 4.4 Acceptance Tracking & Audit

**System track untuk setiap acceptance:**

```
acceptance_log table:
- id (UUID)
- user_id (FK)
- company_id (FK)
- document_type (T&C, Privacy, AUP, etc)
- document_version (v1.0, v1.1, v2.0)
- acceptance_status (accepted, withdrawn, expired)
- timestamp (when accepted)
- ip_address (for audit)
- user_agent (browser info)
- device_type (mobile, desktop, tablet)
- acceptance_method (click checkbox, eSignature, API)
- consent_details JSON: {
    accept_terms: true,
    accept_privacy: true,
    accept_marketing: false,
    accept_analytics: true
  }
- withdrawn_at (jika user revoke consent)
- withdrawal_reason (privacy concern, other)
```

**Admin dapat query:**
- How many users accepted v2.0 T&C?
- Who hasn't accepted new privacy policy?
- Export acceptance list for audit/compliance
- See individual user acceptance history

---

### 4.5 Admin Dashboard

**Modules:**

1. **Document Overview**
   - List all documents (T&C, Privacy, AUP)
   - Current version, effective date, status
   - Acceptance rate (% of users accepted)
   - Quick action: Edit, Publish, Archive, Translate

2. **Acceptance Analytics**
   - Acceptance rate by document type (T&C: 98%, Privacy: 96%)
   - Trend over time (chart)
   - Breakdown by user role (Admin, HR, Employee)
   - Time to accept (avg days between publish & acceptance)
   - Non-acceptance list (who hasn't accepted, how long overdue)

3. **Content Management**
   - Markdown editor dengan live preview
   - Version history & diff viewer
   - Approval workflow status
   - Translation coverage (ID 100%, EN 100%, ZH 50%)
   - Scheduled publications (upcoming changes)

4. **Compliance & Audit**
   - Export acceptance log (CSV for regulators)
   - Compliance certificate generator
   - eSignature evidence (screenshots, hash)
   - Audit trail (who modified documents, when)

5. **Notification Management**
   - View email templates
   - Preview notification email
   - Manual trigger resend (jika user didn't receive)
   - Track email delivery (open rate, click rate)

---

### 4.6 User Self-Service Portal

**Users can:**

1. **View Current Policies**
   - T&C, Privacy Policy, AUP (all languages)
   - Mark as "read"
   - Easy-to-read formatting
   - Table of contents dengan jump links
   - Print-to-PDF function

2. **View Acceptance History**
   - Timeline: "Accepted T&C v1.0 on Aug 1, 2026 10:15 AM"
   - Document version, date accepted
   - "Withdraw Consent" button

3. **Manage Consent Preferences**
   - Marketing emails: ON/OFF
   - Analytics cookies: ON/OFF
   - Data processing: Change consent basis
   - Download acceptance certificate

4. **Request Data / Exercise Privacy Rights**
   - Request data access (GDPR right)
   - Request data deletion
   - Request data portability
   - Submit via this portal

---

## 5. Data Model

### Entities (High Level)

```
legal_document:
  id, type (T&C/Privacy/AUP), language (id/en/zh)
  content (markdown), status (draft/review/published)
  version, created_at, published_at, effective_date
  created_by (admin user), reviewed_by, published_by
  change_log (what changed from prev version)

legal_document_version:
  id, document_id, version, content
  created_at, created_by, status
  review_notes, approval_status
  scheduled_publish_date

acceptance_log:
  id, user_id, company_id, document_id
  document_version, acceptance_status
  timestamp, ip_address, user_agent, device_type
  consent_details (JSON with all consent flags)
  withdrawn_at, withdrawal_reason

acceptance_notification:
  id, user_id, document_id
  notification_type (change_announcement, reminder, blocked_access)
  sent_at, opened_at, clicked_at
  email_address, email_status (sent/bounced/opened)

audit_log:
  id, action (create/edit/publish/delete), actor_id
  entity_type (document/version/acceptance)
  entity_id, before_state, after_state
  timestamp
```

---

## 6. Technical Requirements

### API Endpoints (Backend)

```
GET /api/v1/legal-documents/{type}/{language}
  → Get current version of document (T&C/Privacy/AUP)

POST /api/v1/acceptances
  → User accepts document version (eSignature)
  Body: {document_id, version, consent_details}

GET /api/v1/acceptances/status
  → Check if user accepted latest version (used for access control)

GET /api/v1/acceptances/history
  → Get user's acceptance history

DELETE /api/v1/acceptances/{acceptance_id}
  → User withdraw consent

Admin APIs:
POST /api/v1/admin/documents
  → Create new document

PATCH /api/v1/admin/documents/{id}
  → Edit document (draft mode)

POST /api/v1/admin/documents/{id}/publish
  → Publish document (make effective)

GET /api/v1/admin/analytics/acceptance
  → Acceptance stats by document/user/time

GET /api/v1/admin/documents/{id}/audit-log
  → All changes/edits to this document
```

### Frontend Components

1. **Document Viewer** (react-markdown)
   - Render markdown with styling
   - Table of contents
   - Print/download as PDF
   - Dark mode support

2. **Acceptance Modal** (on signup)
   - Show T&C + Privacy Policy tabs
   - Checkbox consent
   - "Accept" button (disabled until scroll to bottom)

3. **Admin Editor** (markdown with preview)
   - Split view: edit left, preview right
   - Spellcheck integration
   - Version history sidebar
   - Publish workflow

4. **Analytics Dashboard** (charts & tables)
   - Acceptance rate line chart
   - Non-acceptance list with drill-down
   - Heatmap by user role

---

## 7. Security & Compliance

### Security Requirements

- ✅ eSignature legally binding (UU ITE compliant)
- ✅ Immutable audit log (append-only, hashed)
- ✅ IP address logging (for dispute resolution)
- ✅ Document tampering detection (version hash verification)
- ✅ Access control (SUPER_ADMIN only dapat edit/publish)
- ✅ Encryption for audit log (at rest)

### Compliance Requirements

- ✅ GDPR Article 7 (lawful consent, affirmative action)
- ✅ UU ITE Article 11 (electronic signature validity)
- ✅ UU PDP (future) - consent tracking & evidence
- ✅ Audit trail for regulators (7 years retention)
- ✅ Multi-language (at minimum: ID + EN)

---

## 8. Timeline & Phasing

### Phase 1: MVP (Aug 15-31)
- [ ] Document management (create/edit/publish)
- [ ] User acceptance tracking (sign-up + major change re-acceptance)
- [ ] Basic email notification
- [ ] Admin dashboard (analytics + audit log)

### Phase 2: Enhancement (Sep 1-15)
- [ ] Multi-language support (ID, EN, ZH)
- [ ] Approval workflow (review → publish)
- [ ] Advanced notification (scheduled, targeted)
- [ ] User self-service portal (view history, withdraw consent)

### Phase 3: Advanced (Sep 16-30)
- [ ] Integration dengan privacy management system
- [ ] GDPR/DPA compliance certificate generator
- [ ] Integration dengan digital signature provider (BiD)
- [ ] Analytics export untuk audit

---

## 9. Success Metrics

- ✅ 100% of new users accept T&C before access
- ✅ Acceptance rate > 90% within 30 days of policy change
- ✅ 0 regulatory compliance violations
- ✅ Audit trail 100% complete (no missing entries)
- ✅ Email delivery rate > 95%
- ✅ Document load time < 2s

---

**Approved by:** Dozer Fernando Saroha Daniel Napitupulu (CEO)  
**Version:** 1.0  
**Last Updated:** 1 Agustus 2026


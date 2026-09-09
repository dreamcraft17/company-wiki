# dnPeople Legal Documents Management System
## Software Requirements Specification (SRS) v1.0

**Bahasa:** Bahasa Indonesia  
**Tanggal:** 1 Agustus 2026  
**Status:** Functional & Technical Requirements  

---

## 1. Functional Requirements (FR)

### FR1: Document Create (Admin)
**Description:** SUPER_ADMIN atau designated legal user dapat create new legal document
**Priority:** P0
**Acceptance Criteria:**
- Input: Document type (T&C, Privacy, AUP), content (markdown), language
- Output: Document saved in DRAFT status
- Revision history started (creator noted)
- Document tidak visible ke users (draft only)

**API:**
```
POST /api/v1/admin/documents
Authorization: Bearer {admin_jwt}

Request:
{
  "type": "terms_conditions",
  "language": "id",
  "title": "Syarat & Ketentuan dnPeople v2.0",
  "content": "# Syarat & Ketentuan...",
  "section_tags": ["payments", "liability", "termination"]
}

Response (201):
{
  "document_id": "doc-tc-001",
  "version": "1.0",
  "status": "draft",
  "created_at": "2026-08-01T10:00:00Z",
  "created_by": "admin@dntech.id"
}
```

---

### FR2: Document Edit (Admin)
**Description:** Admin dapat edit document dalam DRAFT status
**Priority:** P0
**Acceptance Criteria:**
- Edit content (markdown)
- Save versions (auto-save every 2 minutes)
- Revert to previous version
- Track edit history (who edited, when, what changed)
- Live preview updating as edit

**API:**
```
PATCH /api/v1/admin/documents/{doc_id}
Authorization: Bearer {admin_jwt}

Request:
{
  "content": "# Updated content...",
  "edit_note": "Fixed typo in section 3"
}

Response (200):
{
  "document_id": "doc-tc-001",
  "updated_at": "2026-08-01T10:30:00Z",
  "version_saves": [
    {timestamp: "10:00", editor: "admin1", hash: "abc123"},
    {timestamp: "10:15", editor: "admin2", hash: "def456"},
    {timestamp: "10:30", editor: "admin1", hash: "ghi789"}
  ]
}
```

---

### FR3: Document Review Workflow (Optional for v1.0)
**Description:** Document goes through review → approval → publish workflow
**Priority:** P1
**Status:** DRAFT → REVIEW → APPROVED → PUBLISHED
**Acceptance Criteria:**
- Author submit for review
- Reviewer add comments/suggestions
- Author address comments
- Reviewer approve/reject
- Approved doc auto-publish on effective date

---

### FR4: Document Publish
**Description:** Admin publish document (make it active/effective)
**Priority:** P0
**Acceptance Criteria:**
- Set effective date
- Set as new current version (previous version archived)
- Auto-send notification email to users (if major change)
- Lock old version (no more acceptances)
- Auto-create audit log entry

**API:**
```
POST /api/v1/admin/documents/{doc_id}/publish
Authorization: Bearer {admin_jwt}

Request:
{
  "effective_date": "2026-09-01T00:00:00Z",
  "is_major_change": true,
  "change_summary": "Added payment terms, updated liability limits"
}

Response (200):
{
  "document_id": "doc-tc-001",
  "version": "2.0",
  "status": "published",
  "effective_date": "2026-09-01T00:00:00Z",
  "notification_sent": true,
  "users_notified": 1250
}
```

---

### FR5: Schedule Future Publish
**Description:** Schedule document to publish at future date
**Priority:** P1
**Acceptance Criteria:**
- Set publish date in future
- Document remains DRAFT until date
- Auto-publish at exact time
- Reminder email to admin 1 day before
- Auto-notify users on publish date

---

### FR6: User Acceptance (Sign-Up)
**Description:** During sign-up, user must accept latest T&C & Privacy Policy
**Priority:** P0
**Acceptance Criteria:**
- Show T&C + Privacy modal before account creation
- User must read (detect scroll to bottom)
- User must click checkbox "I agree"
- Click "Accept" button
- Record acceptance (timestamp, IP, browser)
- Log entry created in acceptance_log
- If not accept: cannot proceed with sign-up

**Frontend Flow:**
```
[Sign-Up Form]
  ↓
[Redirect to T&C Modal]
  ↓
[User reads & scrolls to bottom]
  ↓
[Checkbox enabled for "I Agree"]
  ↓
[User clicks "Accept"]
  ↓
[Backend POST /api/v1/acceptances]
  ↓
[Account created successfully]
```

**API:**
```
POST /api/v1/acceptances
{
  "user_id": "user-123",
  "document_type": "terms_conditions",
  "document_version": "2.0",
  "consent_details": {
    "accept_terms": true,
    "accept_privacy": true,
    "accept_marketing": false,
    "accept_analytics": true
  },
  "device_info": {user_agent, ip_address}
}

Response (201):
{
  "acceptance_id": "acc-001",
  "timestamp": "2026-08-01T10:00:00Z",
  "status": "accepted"
}
```

---

### FR7: Re-Acceptance on Major Policy Change
**Description:** When major policy change published, users must re-accept
**Priority:** P0
**Acceptance Criteria:**
- Automatically triggered if is_major_change = true
- Access blocked until accepted (for STARTER+ tiers)
- Email notification sent (30 days before deadline if scheduled, 24h if immediate)
- User can click "Accept" in email or login dashboard
- 30-day grace period before access fully blocked
- Block access on day 31 if not accepted
- Email reminder on day 7 & day 27

**Process:**
```
Day 0 (Publish): is_major_change = true
  → Email sent to all users
  → Dashboard shows "Action Required: Accept new policies"
  
Day 7: Reminder email
  → "You have 23 days to accept"
  
Day 27: Final reminder email
  → "You have 3 days left"
  
Day 30: Deadline
  → Users can still access but see banner "Deadline today"
  
Day 31: Access restricted
  → Block access to core features (payroll, reports)
  → Show accept button & offer help chat
  
Day 32-33: Users accept
  → Access restored
```

---

### FR8: Acceptance Status Query (for Access Control)
**Description:** Check if user accepted latest policies (used by auth middleware)
**Priority:** P0
**Acceptance Criteria:**
- Fast query (< 100ms cache)
- Return: accepted (true/false), required_version, accepted_version
- Used by middleware to block/allow access

**API:**
```
GET /api/v1/acceptances/status?document_type=terms_conditions
Authorization: Bearer {user_jwt}

Response (200):
{
  "document_type": "terms_conditions",
  "required_version": "2.0",
  "user_accepted_version": "2.0",
  "is_accepted": true,
  "accepted_at": "2026-08-01T10:00:00Z",
  "is_major_change_required": false
}
```

---

### FR9: Withdraw Consent (GDPR Right to Withdraw)
**Description:** User can revoke consent anytime (GDPR Article 7)
**Priority:** P1
**Acceptance Criteria:**
- User click "Withdraw Consent" in settings
- Ask reason (privacy concern, other, feedback)
- Mark acceptance as withdrawn
- Log withdrawal (timestamp, reason)
- Access implications handled per company policy

**API:**
```
DELETE /api/v1/acceptances/{acceptance_id}
Authorization: Bearer {user_jwt}

Request:
{
  "reason": "privacy_concern",
  "feedback": "Concerned about salary data sharing"
}

Response (200):
{
  "acceptance_id": "acc-001",
  "status": "withdrawn",
  "withdrawn_at": "2026-08-15T14:20:00Z"
}
```

---

### FR10: Email Notification (Policy Change)
**Description:** Send email to users about policy changes
**Priority:** P0
**Acceptance Criteria:**
- Template: clear subject, summary, link to full policy, accept button
- Personalization: include user name, company name
- Track: open rate, click rate, accepted from email
- Only send major changes (not minor typo fixes)
- Respect user preference (no email if opted out)
- Max 1 policy email per month

**Template:**
```
Subject: Update to Our Terms & Conditions (Effective Sept 1)

Dear [User Name],

We've updated our Terms & Conditions effective September 1, 2026.

Key Changes:
- Updated payment terms (section 4.2)
- Clarified liability limits (section 5.3)
- Added cookies policy (section 10)

You have until August 31 to review and accept.

[Accept Now Button]
[View Full Document Link]

If you have questions, contact legal@dnpeople.id

---
You're receiving this because you use dnPeople.
[Unsubscribe] | [Manage Preferences]
```

---

### FR11: Acceptance Analytics (Admin)
**Description:** Admin view acceptance statistics & trends
**Priority:** P1
**Acceptance Criteria:**
- Acceptance rate by document (T&C: 98%, Privacy: 96%)
- Trend chart (acceptance % over time after publish)
- Breakdown by user role (Admin, HR, Employee)
- Time to accept (median, percentile, average)
- Non-acceptance list (who hasn't accepted, how long overdue)
- Export to CSV for audit

**API:**
```
GET /api/v1/admin/analytics/acceptance?document_id=doc-tc-001&from_date=2026-08-01
Authorization: Bearer {admin_jwt}

Response (200):
{
  "document_id": "doc-tc-001",
  "version": "2.0",
  "total_users": 1250,
  "accepted": 1225,
  "acceptance_rate": 0.98,
  "pending": 25,
  "withdrawn": 0,
  "acceptance_timeline": [
    {date: "2026-08-01", acceptance_rate: 0.05},
    {date: "2026-08-02", acceptance_rate: 0.15},
    ...
    {date: "2026-08-31", acceptance_rate: 0.98}
  ],
  "non_acceptance_list": [
    {user_id: "user-123", email: "john@company.com", days_overdue: 5}
  ],
  "by_role": {
    "admin": {total: 50, accepted: 50, rate: 1.0},
    "hr": {total: 200, accepted: 198, rate: 0.99},
    "employee": {total: 1000, accepted: 977, rate: 0.977}
  }
}
```

---

### FR12: Audit Log (Immutable)
**Description:** Append-only log of all document changes, publishes, acceptances
**Priority:** P0
**Acceptance Criteria:**
- Log every action (create, edit, publish, delete, accept, withdraw)
- Include: actor_id, action, entity_id, before_state, after_state, timestamp
- Cannot be deleted or modified (immutable)
- Can be exported for compliance/regulators
- Hash verification to detect tampering

**Data:**
```
audit_log:
- id (UUID)
- action (create_document, edit_document, publish, accept, withdraw)
- actor_id (admin or user who did action)
- entity_type (document, acceptance)
- entity_id (document_id or acceptance_id)
- before_state JSON (state before action)
- after_state JSON (state after action)
- timestamp
- ip_address
- hash (SHA256 of this + previous hash for chain integrity)
```

---

### FR13: Document Versioning
**Description:** Keep complete history of all document versions
**Priority:** P0
**Acceptance Criteria:**
- Track every version (v1.0, v1.1, v2.0)
- View diff between versions (what changed)
- Revert to previous version (if in DRAFT)
- Archive old versions (read-only)
- Acceptance linked to specific version

**API:**
```
GET /api/v1/admin/documents/{doc_id}/versions
Authorization: Bearer {admin_jwt}

Response (200):
{
  "versions": [
    {
      "version": "2.0",
      "status": "published",
      "created_at": "2026-08-01T10:00:00Z",
      "published_at": "2026-09-01T00:00:00Z",
      "created_by": "admin@dntech.id",
      "change_summary": "Updated payment terms & liability"
    },
    {
      "version": "1.9",
      "status": "archived",
      "created_at": "2026-07-15T09:00:00Z",
      "published_at": "2026-07-15T09:00:00Z"
    }
  ]
}

GET /api/v1/admin/documents/{doc_id}/versions/{v1}/diff/{v2}
Response: Detailed diff (added/removed lines, highlight changes)
```

---

### FR14: Multi-Language Support
**Description:** Translate documents into multiple languages
**Priority:** P2
**Acceptance Criteria:**
- Support ID (default), EN, ZH-simplified
- Each language is separate document version
- Translation tab in admin UI
- Mark translation as "complete" or "in progress"
- Fallback to English if translation missing
- Show translation status in admin dashboard

**API:**
```
GET /api/v1/legal-documents/privacy_policy/en
→ Return English version

GET /api/v1/legal-documents/privacy_policy/id
→ Return Indonesian version

GET /api/v1/legal-documents/privacy_policy/zh
→ Return Chinese version (if available), else fallback to EN
```

---

### FR15: User Self-Service Portal
**Description:** Users can view policies, acceptance history, manage consent
**Priority:** P2
**Acceptance Criteria:**
- View current T&C, Privacy, AUP (any language)
- View acceptance history timeline
- Withdraw consent
- Download acceptance certificate
- Easy navigation, mobile-responsive

---

## 2. Non-Functional Requirements (NFR)

### NFR1: Performance
- Document load: < 2s
- Acceptance query: < 100ms (cached)
- Analytics query: < 3s
- Email send: within 5 minutes

### NFR2: Security
- eSignature legally binding (UU ITE compliant)
- Immutable audit log (tamper-detection via hashing)
- IP address logging for all acceptances
- Access control (SUPER_ADMIN only for publish)
- Encryption for sensitive audit data

### NFR3: Compliance
- GDPR Article 7 (affirmative consent)
- UU ITE Article 11 (electronic signature)
- 7-year audit retention (UU ITE requirement)
- Multi-language availability

### NFR4: Reliability
- 99.5% uptime
- Backup of all documents & audit logs
- Disaster recovery (restore within 4 hours)
- Email retry (3 attempts over 24 hours)

---

## 3. Acceptance Test Cases

### Test 1: Sign-Up with Acceptance
**Scenario:** New user sign up
1. Fill sign-up form
2. See T&C + Privacy modal
3. Read & scroll to bottom
4. Check "I Agree" checkbox
5. Click "Accept"
6. Account created
7. Verify acceptance_log entry created

---

### Test 2: Major Policy Change Re-Acceptance
**Scenario:** Admin publish major change, users must re-accept
1. Admin create & publish new T&C (is_major_change=true)
2. Users receive email notification
3. Users login → see "Action Required" banner
4. Users click "Accept"
5. Verify acceptance_log updated
6. Banner disappears
7. Access restored

---

### Test 3: Overdue Non-Acceptance Access Block
**Scenario:** User doesn't accept within 30 days
1. Policy published (is_major_change=true)
2. Day 0-30: User still has access
3. Day 31: Access to core features blocked
4. User sees "Accept to continue" message
5. User clicks "Accept"
6. Access restored immediately

---

### Test 4: Audit Log Integrity
**Scenario:** Verify audit log cannot be tampered
1. Create document
2. Query audit log
3. Try to modify audit log entry (should fail)
4. Verify hash chain (each hash depends on previous)
5. Export audit log
6. Verify hashes match (no tampering detected)

---

### Test 5: Multi-Language Fallback
**Scenario:** User request unsupported language
1. User from Vietnam (Vietnamese browser)
2. Request T&C in Vietnamese (not supported)
3. System fallback to English
4. User see English version

---

## 4. Database Schema

```prisma
model LegalDocument {
  id           String  @id @default(cuid())
  type         String  // T&C, Privacy, AUP, Custom
  language     String  // id, en, zh
  title        String
  content      String  @db.Text // Markdown
  status       String  @default("draft") // draft, review, published
  version      String  // 1.0, 1.1, 2.0
  
  created_at   DateTime @default(now())
  created_by   String
  published_at DateTime?
  published_by String?
  effective_date DateTime?
  
  is_major_change Boolean @default(false)
  change_summary  String?
  section_tags    String[]  // For linking [Section 3.2]
  
  @@unique([type, language, version])
}

model AcceptanceLog {
  id               String @id @default(cuid())
  user_id          String
  company_id       String
  
  document_type    String  // T&C, Privacy, AUP
  document_version String
  status           String  @default("accepted") // accepted, withdrawn
  
  timestamp        DateTime @default(now())
  withdrawn_at     DateTime?
  withdrawal_reason String?
  
  ip_address       String
  user_agent       String
  device_type      String  // mobile, desktop, tablet
  
  consent_details  Json // {accept_terms, accept_privacy, accept_marketing, etc}
  
  @@index([user_id])
  @@index([company_id])
  @@index([document_type])
}

model AuditLog {
  id             String @id @default(cuid())
  action         String  // create, edit, publish, accept, withdraw
  actor_id       String
  entity_type    String  // document, acceptance
  entity_id      String
  
  before_state   Json?
  after_state    Json?
  
  timestamp      DateTime @default(now())
  ip_address     String?
  hash           String  // SHA256 for tamper-detection
  
  @@index([action])
  @@index([timestamp])
}

model AcceptanceNotification {
  id               String @id @default(cuid())
  user_id          String
  document_id      String
  
  notification_type String  // change_announcement, reminder, blocked_access
  sent_at          DateTime?
  opened_at        DateTime?
  clicked_at       DateTime?
  
  email_status     String  // sent, bounced, opened
  
  @@index([user_id])
  @@index([sent_at])
}
```

---

## 5. API Summary Table

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/legal-documents/{type}/{language}` | GET | Get current document |
| `/api/v1/acceptances` | POST | Submit acceptance |
| `/api/v1/acceptances/status` | GET | Check acceptance status |
| `/api/v1/acceptances/history` | GET | View acceptance history |
| `/api/v1/acceptances/{id}` | DELETE | Withdraw consent |
| `/api/v1/admin/documents` | POST | Create document |
| `/api/v1/admin/documents/{id}` | PATCH | Edit document |
| `/api/v1/admin/documents/{id}/publish` | POST | Publish document |
| `/api/v1/admin/analytics/acceptance` | GET | Acceptance stats |
| `/api/v1/admin/audit-log` | GET | Query audit log |

---

**Version:** 1.0  
**Last Updated:** 1 Agustus 2026


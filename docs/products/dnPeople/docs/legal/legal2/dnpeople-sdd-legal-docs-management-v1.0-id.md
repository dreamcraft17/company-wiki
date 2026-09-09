# dnPeople Legal Documents Management System
## System Design Document (SDD) v1.0

**Bahasa:** Bahasa Indonesia  
**Tanggal:** 1 Agustus 2026  
**Status:** Architecture & Implementation Design  

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────┐
│   Frontend (React 19)                        │
│   ├─ Legal Document Viewer                   │
│   ├─ Acceptance Modal (sign-up)              │
│   ├─ Admin Editor (markdown + preview)       │
│   └─ Dashboard Analytics                     │
└─────────────┬──────────────────────────────┘
              │ HTTPS
              │
┌─────────────▼──────────────────────────────┐
│   Backend (Express 5)                       │
│   ├─ DocumentController                     │
│   ├─ AcceptanceController                   │
│   ├─ DocumentService                        │
│   ├─ AcceptanceService                      │
│   ├─ NotificationService                    │
│   └─ AuditService                           │
└─────────────┬──────────────────────────────┘
              │
      ┌───────┼───────┐
      │       │       │
      ▼       ▼       ▼
   ┌────┐ ┌─────┐ ┌────────┐
   │ DB │ │Redis│ │SendGrid│
   └────┘ └─────┘ └────────┘
```

---

## 2. Service Layer Architecture

### DocumentService
**File:** `backend/src/services/DocumentService.ts`

```typescript
class DocumentService {
  // Create
  async createDocument(type, language, content, creator): Promise<{doc_id, version}>
  async saveDraft(doc_id, content, editor)
  
  // Edit & Publish
  async publishDocument(doc_id, effective_date, is_major_change, change_summary)
  async schedulePublish(doc_id, publish_date)
  async archiveVersion(doc_id, version)
  
  // Retrieve
  async getCurrentDocument(type, language): Promise<{content, version, effective_date}>
  async getDocumentVersions(doc_id): Promise<{versions[]}>
  async getDiff(doc_id, v1, v2): Promise<{diff_html}>
  
  // Validation
  async validateMarkdown(content): Promise<{valid, errors[]}>
  async detectMajorChanges(old_content, new_content): Promise<{is_major, changed_sections}>
}
```

### AcceptanceService
**File:** `backend/src/services/AcceptanceService.ts`

```typescript
class AcceptanceService {
  // Recording
  async recordAcceptance(user_id, doc_type, version, consent_details, device_info): Promise<{acceptance_id}>
  async withdrawConsent(acceptance_id, reason)
  
  // Status checking
  async getAcceptanceStatus(user_id, doc_type): Promise<{is_accepted, required_version, accepted_version}>
  async isUserCompliant(user_id): Promise<{is_compliant, missing_docs[], overdue_days}>
  async getAcceptanceHistory(user_id): Promise<{timeline[]}>
  
  // Re-acceptance logic
  async triggerMajorChangeReacceptance(doc_id, doc_type, version)
    → Find all active users
    → Create reacceptance requirement
    → Queue notification emails
    → Lock old version
  
  async checkReacceptanceDeadline(user_id, doc_type): Promise<{overdue, days_left}>
}
```

### NotificationService
**File:** `backend/src/services/NotificationService.ts`

```typescript
class NotificationService {
  // Policy change notifications
  async notifyPolicyChange(doc_id, user_list, change_summary)
  async notifyReacceptanceReminder(user_id, doc_type, days_until_deadline)
  async notifyAccessBlocked(user_id, reason)
  
  // Email templates
  async sendPolicyChangeEmail(user, doc_type, change_summary, deadline)
  async sendReminderEmail(user, doc_type, days_left)
  async sendAccessBlockedEmail(user, doc_type)
  
  // Track delivery
  async logEmailDelivery(email_id, status, timestamp)
  async trackEmailOpen(email_id)
  async trackLinkClick(email_id, link_id)
}
```

### AuditService
**File:** `backend/src/services/AuditService.ts`

```typescript
class AuditService {
  // Logging
  async logAction(action, actor_id, entity_type, entity_id, before_state, after_state, ip_address)
    → Compute hash based on (action + timestamp + previous_hash)
    → Store immutable log entry
    → Cannot be deleted/modified
  
  // Query
  async getAuditLog(filters): Promise<{entries[]}>
  async verifyIntegrity(start_id, end_id): Promise<{is_valid, tamper_detected}>
  
  // Export
  async exportAuditLog(date_range, format): Promise<{file}>
    → CSV or JSON dengan all fields + hash chain
    → Signed with company private key (future)
}
```

---

## 3. Controllers & Routes

### DocumentController
**File:** `backend/src/controllers/DocumentController.ts`

```typescript
export class DocumentController {
  // Admin endpoints
  async createDocument(req: Request, res: Response) {
    const {type, language, title, content} = req.body;
    const creator = req.user.id;
    
    const result = await documentService.createDocument(
      type, language, content, creator
    );
    return res.status(201).json(result);
  }
  
  async publishDocument(req: Request, res: Response) {
    const {doc_id} = req.params;
    const {effective_date, is_major_change, change_summary} = req.body;
    
    // Check if SUPER_ADMIN
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({error: 'Forbidden'});
    }
    
    const result = await documentService.publishDocument(
      doc_id, effective_date, is_major_change, change_summary
    );
    
    // If major change: trigger notifications
    if (is_major_change) {
      await acceptanceService.triggerMajorChangeReacceptance(doc_id, type, version);
      await notificationService.notifyPolicyChange(...);
    }
    
    // Log to audit
    await auditService.logAction('publish_document', req.user.id, 'document', doc_id, ...);
    
    return res.status(200).json(result);
  }
  
  // User endpoints
  async getCurrentDocument(req: Request, res: Response) {
    const {type, language} = req.query;
    
    const doc = await documentService.getCurrentDocument(type, language);
    return res.status(200).json(doc);
  }
}
```

### AcceptanceController
**File:** `backend/src/controllers/AcceptanceController.ts`

```typescript
export class AcceptanceController {
  async recordAcceptance(req: Request, res: Response) {
    const {document_type, document_version, consent_details} = req.body;
    const user_id = req.user.id;
    const device_info = {
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      device_type: detectDeviceType(req.get('user-agent'))
    };
    
    const acceptance = await acceptanceService.recordAcceptance(
      user_id, document_type, document_version, consent_details, device_info
    );
    
    // Log to audit
    await auditService.logAction('accept_document', user_id, 'acceptance', acceptance.id, ...);
    
    return res.status(201).json(acceptance);
  }
  
  async getAcceptanceStatus(req: Request, res: Response) {
    const user_id = req.user.id;
    const status = await acceptanceService.getAcceptanceStatus(user_id, req.query.document_type);
    
    return res.status(200).json(status);
  }
  
  async withdrawConsent(req: Request, res: Response) {
    const {acceptance_id} = req.params;
    const {reason} = req.body;
    
    const result = await acceptanceService.withdrawConsent(acceptance_id, reason);
    
    await auditService.logAction('withdraw_consent', req.user.id, 'acceptance', acceptance_id, ...);
    
    return res.status(200).json(result);
  }
}
```

---

## 4. Middleware: Access Control Based on Acceptance

**File:** `backend/src/middleware/acceptanceMiddleware.ts`

```typescript
export async function checkAcceptanceCompliance(req: Request, res: Response, next: NextFunction) {
  const user_id = req.user.id;
  
  // Skip for public endpoints
  if (isPublicEndpoint(req.path)) {
    return next();
  }
  
  // Check if user accepted latest T&C & Privacy Policy
  const is_compliant = await acceptanceService.isUserCompliant(user_id);
  
  if (!is_compliant.is_compliant) {
    // User must accept before access
    return res.status(403).json({
      error: 'ACCEPTANCE_REQUIRED',
      missing_documents: is_compliant.missing_docs,
      message: 'Please accept our updated policies to continue'
    });
  }
  
  next();
}

// Usage in app.ts
app.use('/api/v1/protected', checkAcceptanceCompliance, ...routes);
```

---

## 5. Email Template (SendGrid)

**File:** `backend/src/templates/policyChangeEmail.hbs`

```handlebars
<h1>Update to Our Terms & Conditions</h1>

<p>Dear {{userName}},</p>

<p>We've updated our {{documentType}} effective {{effectiveDate}}.</p>

<h3>Key Changes</h3>
<ul>
  {{#each changedSections}}
    <li><strong>{{this.section}}</strong>: {{this.summary}}</li>
  {{/each}}
</ul>

<p>You have until {{deadline}} to review and accept.</p>

<a href="{{acceptLink}}" class="btn">Accept Now</a>
<a href="{{viewLink}}">View Full Document</a>

<hr/>
<p>Questions? Contact <a href="mailto:legal@dnpeople.id">legal@dnpeople.id</a></p>
```

---

## 6. Database Schema (Prisma)

```prisma
model LegalDocument {
  id            String   @id @default(cuid())
  type          String   // T&C, Privacy, AUP
  language      String   // id, en, zh
  title         String
  content       String   @db.Text // Markdown
  status        String   @default("draft") // draft, review, published, archived
  version       String
  
  created_at    DateTime @default(now())
  created_by    String
  updated_at    DateTime @updatedAt
  published_at  DateTime?
  published_by  String?
  effective_date DateTime?
  
  is_major_change Boolean @default(false)
  change_summary  String?
  
  acceptance_log AcceptanceLog[]
  audit_entries  AuditLog[]
  
  @@unique([type, language, version])
  @@index([type, language])
}

model AcceptanceLog {
  id               String   @id @default(cuid())
  user_id          String
  company_id       String
  
  document_id      String
  document_type    String   // T&C, Privacy, AUP
  document_version String
  
  status           String   @default("accepted") // accepted, withdrawn
  timestamp        DateTime @default(now())
  withdrawn_at     DateTime?
  withdrawal_reason String?
  
  ip_address       String
  user_agent       String
  device_type      String   // mobile, desktop, tablet
  
  consent_details  Json // {accept_terms: true, accept_privacy: true, ...}
  
  legal_document   LegalDocument @relation(fields: [document_id], references: [id])
  
  @@index([user_id])
  @@index([company_id])
  @@index([document_type])
  @@index([timestamp])
}

model AuditLog {
  id             String   @id @default(cuid())
  action         String   // create, edit, publish, accept, withdraw
  actor_id       String
  entity_type    String   // document, acceptance
  entity_id      String
  
  before_state   Json?
  after_state    Json?
  
  timestamp      DateTime @default(now())
  ip_address     String?
  hash           String   // SHA256 for integrity verification
  
  @@index([action])
  @@index([timestamp])
  @@index([entity_type, entity_id])
}

model AcceptanceNotification {
  id               String   @id @default(cuid())
  user_id          String
  document_id      String
  
  notification_type String  // change_announcement, reminder, blocked_access
  sent_at          DateTime?
  opened_at        DateTime?
  clicked_at       DateTime?
  
  email_status     String   // sent, bounced, opened, failed
  
  @@index([user_id])
  @@index([sent_at])
}
```

---

## 7. Cron Jobs (Bull Queue)

**File:** `backend/src/jobs/AcceptanceJobs.ts`

```typescript
// Scheduled jobs for acceptance management

// Every day at midnight
acceptanceQueue.add('check-reacceptance-deadlines', null, {
  repeat: {cron: '0 0 * * *'}
});

acceptanceQueue.process('check-reacceptance-deadlines', async (job) => {
  // Find all users with overdue re-acceptance
  const overdue = await acceptanceService.findOverdueReacceptances();
  
  // Day 30: block access
  for (const user of overdue.day30) {
    await acceptanceService.blockAccess(user.id);
    await notificationService.notifyAccessBlocked(user.id, ...);
  }
  
  // Day 7 & 27: send reminders
  for (const user of overdue.day7) {
    await notificationService.notifyReacceptanceReminder(user.id, ..., 23);
  }
  for (const user of overdue.day27) {
    await notificationService.notifyReacceptanceReminder(user.id, ..., 3);
  }
});

// Email delivery tracking
emailQueue.add('track-email-engagement', {email_id: '...'}, {
  repeat: {interval: 3600000} // Every hour
});

emailQueue.process('track-email-engagement', async (job) => {
  // Query SendGrid API for email open/click events
  // Update acceptance_notification table with delivery status
});
```

---

## 8. Frontend Components

### AcceptanceModal (Sign-Up)
**File:** `frontend/src/components/AcceptanceModal.tsx`

```typescript
export function AcceptanceModal({onAccept, onReject}) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [consentDetails, setConsentDetails] = useState({
    accept_terms: false,
    accept_privacy: false,
    accept_marketing: false,
    accept_analytics: true
  });
  
  const handleScroll = (e) => {
    const bottom = e.scrollHeight - e.scrollTop === e.clientHeight;
    setScrolledToBottom(bottom);
  };
  
  const handleAccept = async () => {
    // POST /api/v1/acceptances
    const response = await acceptanceAPI.recordAcceptance({
      document_type: 'terms_conditions',
      document_version: '2.0',
      consent_details: consentDetails
    });
    
    onAccept(response);
  };
  
  return (
    <Modal>
      <Tabs>
        <Tab label="Terms & Conditions">
          <ScrollableContent onScroll={handleScroll}>
            {/* Markdown rendered content */}
          </ScrollableContent>
        </Tab>
        <Tab label="Privacy Policy">
          {/* ... */}
        </Tab>
      </Tabs>
      
      <Checkbox
        checked={consentDetails.accept_terms}
        onChange={() => updateConsent('accept_terms')}
        label="I have read and agree to the Terms & Conditions"
      />
      <Checkbox
        checked={consentDetails.accept_privacy}
        onChange={() => updateConsent('accept_privacy')}
        label="I have read and agree to the Privacy Policy"
      />
      <Checkbox
        checked={consentDetails.accept_marketing}
        onChange={() => updateConsent('accept_marketing')}
        label="I agree to receive marketing emails (optional)"
      />
      
      <Button
        onClick={handleAccept}
        disabled={!scrolledToBottom || !consentDetails.accept_terms}
      >
        Accept & Continue
      </Button>
    </Modal>
  );
}
```

### AdminDocumentEditor
**File:** `frontend/src/components/AdminDocumentEditor.tsx`

```typescript
export function AdminDocumentEditor({documentId}) {
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  
  const handleContentChange = (value) => {
    setContent(value);
    setIsDirty(true);
    setPreview(markdownToHtml(value));
    
    // Auto-save every 30 seconds
    debouncedAutoSave(value);
  };
  
  const handlePublish = async () => {
    const response = await documentAPI.publishDocument(documentId, {
      effective_date: ...,
      is_major_change: true,
      change_summary: '...'
    });
    
    showNotification('Document published successfully');
    setIsDirty(false);
  };
  
  return (
    <Container>
      <Split>
        <Editor
          value={content}
          onChange={handleContentChange}
          language="markdown"
        />
        <Preview html={preview} />
      </Split>
      
      <Button onClick={handlePublish} disabled={!isDirty}>
        Publish
      </Button>
    </Container>
  );
}
```

---

## 9. Security & Audit

### Hash Verification (Tamper Detection)

**File:** `backend/src/utils/AuditHashUtils.ts`

```typescript
export class AuditHashUtils {
  static generateHash(current_entry: AuditLog, previous_hash: string): string {
    const data = `${current_entry.id}${current_entry.timestamp}${current_entry.action}${previous_hash}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }
  
  static verifyChain(entries: AuditLog[]): {is_valid: boolean, tamper_at?: number} {
    for (let i = 0; i < entries.length; i++) {
      const current = entries[i];
      const previous_hash = i === 0 ? '' : entries[i - 1].hash;
      const expected_hash = this.generateHash(current, previous_hash);
      
      if (current.hash !== expected_hash) {
        return {is_valid: false, tamper_at: i};
      }
    }
    return {is_valid: true};
  }
}
```

---

## 10. Testing Strategy

### Unit Tests

```typescript
describe('DocumentService', () => {
  it('should create document in DRAFT status', async () => {
    const result = await documentService.createDocument(
      'terms_conditions', 'id', 'content', 'admin1'
    );
    expect(result.status).toBe('draft');
    expect(result.version).toBe('1.0');
  });
  
  it('should detect major changes', async () => {
    const is_major = await documentService.detectMajorChanges(
      oldContent, newContent
    );
    expect(is_major).toBe(true);
  });
});

describe('AcceptanceService', () => {
  it('should record acceptance & create audit log', async () => {
    const acceptance = await acceptanceService.recordAcceptance(...);
    expect(acceptance.id).toBeDefined();
    
    const audit = await auditService.getAuditLog({entity_id: acceptance.id});
    expect(audit.length).toBe(1);
  });
  
  it('should trigger re-acceptance for major changes', async () => {
    await acceptanceService.triggerMajorChangeReacceptance(...);
    
    const notifications = await notificationService.getNotifications({type: 'change_announcement'});
    expect(notifications.length).toBeGreaterThan(0);
  });
});

describe('AuditService', () => {
  it('should verify audit chain integrity', async () => {
    const is_valid = await auditService.verifyIntegrity(...);
    expect(is_valid).toBe(true);
  });
});
```

---

## 11. Deployment Checklist

- [ ] Database schema migrated (Prisma migrate)
- [ ] All endpoints tested (Postman collection provided)
- [ ] Email templates configured (SendGrid)
- [ ] Cron jobs running (Bull queue)
- [ ] Audit log hashing working
- [ ] Front-end modal tested (sign-up flow)
- [ ] Admin dashboard deployed
- [ ] T&C v1.0 & Privacy v1.0 documents published
- [ ] First user acceptance logged
- [ ] Monitoring & alerts set up (error rates, email delivery)

---

**Version:** 1.0  
**Last Updated:** 1 Agustus 2026


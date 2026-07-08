# DN Tech Company Profile Website
## Product Requirements Document (PRD) v5

**Document Version:** 5.0  
**Date:** Juli 2026  
**Status:** Implementation Ready  
**Owner:** Dozer (CEO + Tech Lead)

---

## Executive Summary

PRD v5 adalah **Email System Implementation** yang memastikan **semua message dari website dikirim ke info@dntech.id** dengan proper setup, templates, tracking, dan error handling.

**Scope:**
- ✅ Setup SMTP connection (mx8.mailspace.id:465 dengan SSL/TLS)
- ✅ Email templates untuk semua user actions
- ✅ Send logic untuk form submissions, contact requests, newsletter, admin notifications
- ✅ Email tracking & logging
- ✅ Error handling & retry mechanism
- ✅ Rate limiting untuk email sends
- ✅ Unsubscribe management (untuk newsletter)

**Email destinations:**
- 📧 **info@dntech.id** — Receive form submissions, contact requests, admin notifications
- 📧 **User email** — Send confirmations, responses

---

## Version Timeline

| Version | Date | Focus |
|---------|------|-------|
| v1 | Juni 2026 | Initial spec |
| v2 | Juli 2026 | Remove fake data, solid colors, SEO |
| v3 | Juli 2026 | UX refinement (exit modal, logo) |
| v4 | Juli 2026 | Performance optimization |
| v5 | **Sekarang** | Email system implementation |

---

## Current Email Setup (From Screenshot)

```
Email:            info@dntech.id
SMTP Server:      mx8.mailspace.id
SMTP Port:        465 (SSL/TLS)
Username:         info@dntech.id
Password:         [From account settings]
Incoming Server:  mx8.mailspace.id
  - IMAP Port:    993
  - POP3 Port:    995
Authentication:   Required
```

---

## Feature Requirements

### Primary Goals

1. **Receive all contact form submissions** at info@dntech.id
2. **Send confirmation emails** to users who submit forms
3. **Send admin notifications** when leads come in
4. **Newsletter subscription** with confirmation emails
5. **Transactional emails** for various user actions
6. **Email tracking** for logging/debugging

### Email Types (Use Cases)

| Email Type | Trigger | Recipient | Purpose |
|-----------|---------|-----------|---------|
| **Form Confirmation** | User submits contact form | User email | "Thanks for contacting us" |
| **Admin Notification** | Lead submitted | info@dntech.id | "New lead received: John Doe, john@example.com" |
| **Newsletter Confirm** | User subscribes newsletter | User email | "Confirm your subscription" + link |
| **Newsletter Welcome** | After confirm subscription | User email | "Welcome to our newsletter" |
| **Quiz Result** | User completes quiz | User email | Personalized recommendations |
| **Career Apply** | User applies for job | info@dntech.id | "New job application: [Job Title]" |
| **Career Confirm** | User applies for job | User email | "Thanks for applying" |
| **Password Reset** | Admin requests reset | Admin email | Reset link |
| **Admin Report** | Daily/weekly digest | info@dntech.id | "Daily lead summary" |

---

## Technical Specifications

### Email Service Architecture

```
┌─────────────────┐
│  Website Events │
│  - Form submit  │
│  - Quiz done    │
│  - Newsletter   │
└────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│  Email Queue Service     │
│  (backend/src/services)  │
│  - Queue management      │
│  - Retry logic           │
│  - Rate limiting         │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  SMTP Connection Pool    │
│  (nodemailer)            │
│  Host: mx8.mailspace.id  │
│  Port: 465 (SSL/TLS)     │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Outgoing Server         │
│  mx8.mailspace.id        │
│  smtp port 465           │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Recipients:             │
│  - info@dntech.id        │
│  - user@example.com      │
│  - admin emails          │
└──────────────────────────┘

Database: Log all sends
┌──────────────────────────┐
│  email_logs table        │
│  - id, to, from, subject │
│  - template, status      │
│  - sent_at, error        │
└──────────────────────────┘
```

---

## Implementation Details

### 1. Environment Setup

**File:** `backend/.env`

```
SMTP_HOST=mx8.mailspace.id
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@dntech.id
SMTP_PASSWORD=[your_email_password]
SMTP_FROM_NAME=DN Tech
SMTP_FROM_EMAIL=info@dntech.id
ADMIN_EMAIL=info@dntech.id
SENDGRID_API_KEY=[optional_backup]
EMAIL_QUEUE_ENABLED=true
EMAIL_RETRY_ATTEMPTS=3
EMAIL_RETRY_DELAY_MS=1000
```

### 2. Nodemailer Configuration

**File:** `backend/src/services/EmailService.ts`

```typescript
import nodemailer from 'nodemailer';

class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      pool: {
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 1000, // 1 second
        rateLimit: 10, // 10 messages per second
      },
    });

    // Verify connection on startup
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('SMTP connection error:', error);
      } else {
        console.log('✅ SMTP server ready for sending emails');
      }
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    options?: {
      cc?: string[];
      bcc?: string[];
      replyTo?: string;
      templateId?: string;
    }
  ) {
    const emailLog = await this.logEmail({
      to,
      subject,
      templateId: options?.templateId,
      status: 'pending',
    });

    try {
      const result = await this.transporter.sendMail({
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to,
        cc: options?.cc,
        bcc: options?.bcc,
        replyTo: options?.replyTo || process.env.SMTP_FROM_EMAIL,
        subject,
        html,
        text: this.stripHtml(html), // Fallback plain text
      });

      // Log success
      await this.updateEmailLog(emailLog.id, {
        status: 'sent',
        messageId: result.messageId,
        sentAt: new Date(),
      });

      console.log(`📧 Email sent to ${to}: ${result.messageId}`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      
      // Log failure
      await this.updateEmailLog(emailLog.id, {
        status: 'failed',
        error: (error as Error).message,
      });

      throw error;
    }
  }

  async sendEmailWithRetry(
    to: string,
    subject: string,
    html: string,
    options?: { cc?: string[]; templateId?: string }
  ) {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.sendEmail(to, subject, html, options);
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `⚠️  Email send attempt ${attempt}/${this.maxRetries} failed. Retrying in ${this.retryDelay}ms...`
        );

        if (attempt < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }
      }
    }

    throw new Error(
      `Failed to send email after ${this.maxRetries} attempts: ${lastError?.message}`
    );
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
  }

  private async logEmail(data: any) {
    // Insert into email_logs table
    return {
      id: 'generated_id',
      ...data,
    };
  }

  private async updateEmailLog(id: string, data: any) {
    // Update email_logs table
    return { id, ...data };
  }
}

export const emailService = new EmailService();
```

---

### 3. Email Templates

**File:** `backend/src/templates/EmailTemplates.ts`

```typescript
export const EmailTemplates = {
  // Form submission confirmation to user
  formConfirmation: (userName: string, projectType: string) => ({
    subject: `✅ Terima kasih telah menghubungi DN Tech`,
    html: `
      <html>
        <body style="font-family: Inter, sans-serif; line-height: 1.6; color: #333;">
          <h2>Halo ${userName},</h2>
          <p>Terima kasih telah menghubungi kami untuk project <strong>${projectType}</strong>.</p>
          <p>Tim kami akan merespons dalam waktu <strong>24 jam</strong>.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p>Jika ada pertanyaan mendesak, hubungi kami:</p>
          <ul>
            <li>📧 Email: <a href="mailto:info@dntech.id">info@dntech.id</a></li>
            <li>🌐 Website: <a href="https://dntech.id">dntech.id</a></li>
          </ul>
          
          <p style="color: #666; font-size: 12px;">
            Salam,<br>
            <strong>DN Tech Team</strong>
          </p>
        </body>
      </html>
    `,
  }),

  // Admin notification when form submitted
  adminNotification: (lead: any) => ({
    subject: `🔔 Lead Baru: ${lead.name} - ${lead.projectType}`,
    html: `
      <html>
        <body style="font-family: Inter, sans-serif; line-height: 1.6;">
          <h2>🔔 Lead Baru Diterima</h2>
          <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
            <tr style="background: #f5f5f5;">
              <td style="padding: 8px; font-weight: bold;">Nama:</td>
              <td style="padding: 8px;">${lead.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Email:</td>
              <td style="padding: 8px;"><a href="mailto:${lead.email}">${lead.email}</a></td>
            </tr>
            <tr style="background: #f5f5f5;">
              <td style="padding: 8px; font-weight: bold;">Telepon:</td>
              <td style="padding: 8px;">${lead.phone || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Perusahaan:</td>
              <td style="padding: 8px;">${lead.company || '-'}</td>
            </tr>
            <tr style="background: #f5f5f5;">
              <td style="padding: 8px; font-weight: bold;">Jenis Proyek:</td>
              <td style="padding: 8px;"><strong>${lead.projectType}</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Anggaran:</td>
              <td style="padding: 8px;">${lead.budget || '-'}</td>
            </tr>
            <tr style="background: #f5f5f5;">
              <td style="padding: 8px; font-weight: bold;">Timeline:</td>
              <td style="padding: 8px;">${lead.timeline || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Deskripsi:</td>
              <td style="padding: 8px;">${lead.description}</td>
            </tr>
            <tr style="background: #f5f5f5;">
              <td style="padding: 8px; font-weight: bold;">Waktu:</td>
              <td style="padding: 8px;">${new Date().toLocaleString('id-ID')}</td>
            </tr>
          </table>
          
          <p>
            <a href="https://dntech.id/admin/leads" 
               style="display: inline-block; padding: 10px 20px; background: #1E3A8A; color: white; text-decoration: none; border-radius: 4px;">
              👉 Lihat di Admin Panel
            </a>
          </p>
        </body>
      </html>
    `,
  }),

  // Newsletter subscription confirmation
  newsletterConfirm: (confirmLink: string) => ({
    subject: 'Konfirmasi Langganan Newsletter DN Tech',
    html: `
      <html>
        <body style="font-family: Inter, sans-serif; line-height: 1.6;">
          <h2>Konfirmasi Langganan Newsletter</h2>
          <p>Terima kasih telah berlangganan newsletter kami!</p>
          <p>Klik link di bawah untuk mengkonfirmasi email Anda:</p>
          
          <p>
            <a href="${confirmLink}" 
               style="display: inline-block; padding: 12px 24px; background: #1E3A8A; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
              ✅ Konfirmasi Email
            </a>
          </p>
          
          <p style="color: #666; font-size: 12px;">
            Link berlaku selama 24 jam. Jika link tidak bekerja, salin dan paste URL berikut di browser:<br>
            ${confirmLink}
          </p>
        </body>
      </html>
    `,
  }),

  // Career application notification
  careerNotification: (application: any) => ({
    subject: `🎯 Aplikasi Job Baru: ${application.position}`,
    html: `
      <html>
        <body style="font-family: Inter, sans-serif;">
          <h2>🎯 Aplikasi Job Baru</h2>
          <p><strong>Posisi:</strong> ${application.position}</p>
          <p><strong>Nama:</strong> ${application.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${application.email}">${application.email}</a></p>
          <p><strong>Telepon:</strong> ${application.phone}</p>
          <p><strong>CV:</strong> <a href="${application.cvUrl}">Download CV</a></p>
          <p><strong>Pesan:</strong></p>
          <p>${application.message}</p>
        </body>
      </html>
    `,
  }),
};
```

---

### 4. Email Queue Management

**File:** `backend/src/services/EmailQueueService.ts`

```typescript
import { emailService } from './EmailService';

interface EmailQueueJob {
  id: string;
  to: string;
  subject: string;
  html: string;
  templateId: string;
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  createdAt: Date;
  sentAt?: Date;
  error?: string;
}

class EmailQueueService {
  private queue: EmailQueueJob[] = [];
  private isProcessing = false;
  private maxConcurrent = 5;
  private activeJobs = 0;

  async enqueue(
    to: string,
    subject: string,
    html: string,
    templateId: string
  ): Promise<string> {
    const job: EmailQueueJob = {
      id: `email-${Date.now()}-${Math.random()}`,
      to,
      subject,
      html,
      templateId,
      status: 'pending',
      attempts: 0,
      createdAt: new Date(),
    };

    this.queue.push(job);
    console.log(`📬 Email queued: ${job.id} → ${to}`);

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }

    return job.id;
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0 && this.activeJobs < this.maxConcurrent) {
      const job = this.queue.shift();
      if (!job) break;

      this.activeJobs++;

      this.sendQueuedEmail(job).finally(() => {
        this.activeJobs--;
      });
    }

    this.isProcessing = false;
  }

  private async sendQueuedEmail(job: EmailQueueJob) {
    try {
      job.attempts++;
      console.log(
        `📧 Sending email (attempt ${job.attempts}): ${job.id} → ${job.to}`
      );

      await emailService.sendEmail(job.to, job.subject, job.html, {
        templateId: job.templateId,
      });

      job.status = 'sent';
      job.sentAt = new Date();
      console.log(`✅ Email sent: ${job.id}`);
    } catch (error) {
      console.error(`❌ Failed to send email ${job.id}:`, error);
      job.error = (error as Error).message;

      // Retry up to 3 times
      if (job.attempts < 3) {
        console.log(`⏳ Requeuing email: ${job.id}`);
        this.queue.push(job); // Re-add to queue for retry
      } else {
        job.status = 'failed';
        console.error(`❌ Email permanently failed after 3 attempts: ${job.id}`);
      }
    }
  }

  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      activeJobs: this.activeJobs,
      isProcessing: this.isProcessing,
    };
  }
}

export const emailQueueService = new EmailQueueService();
```

---

### 5. Integration: Form Submission

**File:** `backend/src/routes/leads.ts`

```typescript
import { Router } from 'express';
import { emailService } from '@/services/EmailService';
import { emailQueueService } from '@/services/EmailQueueService';
import { EmailTemplates } from '@/templates/EmailTemplates';

const router = Router();

router.post('/leads', async (req, res) => {
  const { name, email, phone, company, projectType, budget, timeline, description } = req.body;

  // Validate
  if (!name || !email || !projectType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Save to database
    const lead = await prisma.formSubmission.create({
      data: {
        name,
        email,
        phone,
        company,
        projectType,
        budget,
        timeline,
        description,
        status: 'new',
      },
    });

    // 2. Send confirmation email to user (queued)
    const confirmTemplate = EmailTemplates.formConfirmation(name, projectType);
    await emailQueueService.enqueue(
      email,
      confirmTemplate.subject,
      confirmTemplate.html,
      'form-confirmation'
    );

    // 3. Send notification to admin (queued)
    const adminTemplate = EmailTemplates.adminNotification({
      name,
      email,
      phone,
      company,
      projectType,
      budget,
      timeline,
      description,
    });
    await emailQueueService.enqueue(
      process.env.ADMIN_EMAIL || 'info@dntech.id',
      adminTemplate.subject,
      adminTemplate.html,
      'admin-lead-notification'
    );

    // 4. Track analytics
    await prisma.analyticsEvent.create({
      data: {
        type: 'form_submit',
        page: '/contact',
        data: JSON.stringify({ projectType, leadId: lead.id }),
        sessionId: req.sessionID,
      },
    });

    res.json({
      success: true,
      leadId: lead.id,
      message: 'Terima kasih! Email konfirmasi telah dikirim.',
    });
  } catch (error) {
    console.error('Failed to create lead:', error);
    res.status(500).json({ error: 'Failed to process form submission' });
  }
});

export default router;
```

---

### 6. Database Schema

**File:** `backend/prisma/schema.prisma`

```prisma
model EmailLog {
  id            String    @id @default(cuid())
  to            String
  from          String
  subject       String
  templateId    String?
  status        String    // pending, sent, failed
  messageId     String?
  error         String?
  attempts      Int       @default(1)
  createdAt     DateTime  @default(now())
  sentAt        DateTime?
  updatedAt     DateTime  @updatedAt

  @@index([status])
  @@index([createdAt])
  @@index([to])
}

model NewsletterSubscriber {
  id            String    @id @default(cuid())
  email         String    @unique
  status        String    // subscribed, pending, unsubscribed
  confirmToken  String?   @unique
  unsubToken    String?   @unique
  confirmedAt   DateTime?
  subscribedAt  DateTime  @default(now())
  unsubscribedAt DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([status])
  @@index([email])
}
```

---

## Email Sending Flows

### Flow 1: Contact Form Submission

```
1. User fills contact form on /contact
2. Form submitted via POST /api/v1/leads
3. Backend:
   - Validates form data
   - Saves to FormSubmission table
   - Creates EmailLog entries
   - Queues 2 emails:
     a) Confirmation to user
     b) Admin notification to info@dntech.id
4. EmailQueueService:
   - Connects to SMTP (mx8.mailspace.id:465)
   - Sends both emails
   - Logs results
5. User receives: "Thanks for contacting us"
6. Admin receives: "New lead: John Doe, john@example.com"
```

### Flow 2: Newsletter Subscription

```
1. User subscribes on homepage
2. POST /api/v1/newsletter/subscribe
3. Backend:
   - Creates NewsletterSubscriber with status='pending'
   - Generates confirmToken
   - Queues confirmation email
4. User receives: "Click to confirm subscription"
5. User clicks: /api/v1/newsletter/confirm?token=XXX
6. Backend:
   - Updates status to 'subscribed'
   - Queues welcome email
7. Admin newsletter admin can send emails to all subscribers
```

---

## Security & Best Practices

### Rate Limiting

```typescript
// Max 5 emails per second per IP
const emailRateLimiter = rateLimit({
  windowMs: 1 * 1000, // 1 second
  max: 5,
  keyGenerator: (req) => req.ip,
});

router.post('/leads', emailRateLimiter, async (req, res) => {
  // ...
});
```

### SPF, DKIM, DMARC

To improve email deliverability, ensure your domain is configured:

1. **SPF Record:** Allow mx8.mailspace.id to send mail
   ```
   v=spf1 include:mailspace.id ~all
   ```

2. **DKIM:** Enable in mailspace.id control panel

3. **DMARC:** Add DMARC policy
   ```
   v=DMARC1; p=quarantine; rua=mailto:info@dntech.id
   ```

### Unsubscribe Link (Required by law)

All marketing emails must include unsubscribe link:

```html
<p style="font-size: 12px; color: #999;">
  <a href="https://dntech.id/newsletter/unsubscribe?token=XXX">
    Unsubscribe from this list
  </a>
</p>
```

---

## Monitoring & Logging

### Email Dashboard (Admin)

Add to admin panel: `/admin/email-logs`

```typescript
// View email history
GET /api/v1/admin/email-logs?status=failed&limit=50
GET /api/v1/admin/email-logs?to=info@dntech.id

// Email statistics
GET /api/v1/admin/email-stats
// Response:
{
  "todayCount": 45,
  "successRate": 98.5,
  "failedCount": 1,
  "queuedCount": 3,
  "avgSendTime": 234 // ms
}
```

---

## Testing

### Unit Tests

```typescript
// Test email service
describe('EmailService', () => {
  it('should send email successfully', async () => {
    const result = await emailService.sendEmail(
      'test@example.com',
      'Test Subject',
      '<p>Test content</p>'
    );
    expect(result.messageId).toBeDefined();
  });

  it('should retry on failure', async () => {
    // Mock failure, then success
    const result = await emailService.sendEmailWithRetry(...);
    expect(result.messageId).toBeDefined();
  });
});
```

### Integration Tests

```typescript
// Test form submission flow
it('should send 2 emails on form submission', async () => {
  const res = await request(app)
    .post('/api/v1/leads')
    .send({ name: 'John', email: 'john@test.com', ... });

  expect(res.status).toBe(200);
  
  // Check emails were queued
  const logs = await EmailLog.find({ to: 'john@test.com' });
  expect(logs.length).toBe(1); // Confirmation
  
  const adminLogs = await EmailLog.find({ to: 'info@dntech.id' });
  expect(adminLogs.length).toBeGreaterThan(0); // Admin notification
});
```

---

## Troubleshooting

### Email Not Sending

1. **Check SMTP credentials**
   ```bash
   # Verify connection
   telnet mx8.mailspace.id 465
   # Or use: node -e "require('nodemailer').createTransport(...).verify(console.log)"
   ```

2. **Check logs**
   ```bash
   # See email_logs table
   SELECT * FROM email_logs WHERE status='failed' ORDER BY created_at DESC;
   ```

3. **Check queue**
   ```bash
   GET /api/v1/admin/email-status
   # Response: { queueLength: 5, activeJobs: 2, isProcessing: true }
   ```

### Emails Going to Spam

1. Add SPF/DKIM/DMARC records
2. Use Reply-To header
3. Include List-Unsubscribe header
4. Keep email content clean (no spam keywords)

### Rate Limiting Issues

If hitting rate limits:
- Adjust `pool.rateLimit` in nodemailer config
- Implement email queue with exponential backoff
- Consider using SendGrid API instead (optional)

---

## Success Criteria

✅ **All form submissions** send emails to info@dntech.id  
✅ **User confirmations** sent automatically  
✅ **Email logs** tracked in database  
✅ **Failed emails** retried automatically  
✅ **Admin notifications** received for every lead  
✅ **Newsletter unsubscribe** working properly  
✅ **No emails lost** in queue  
✅ **Email templates** professional & branded  
✅ **SPF/DKIM/DMARC** configured (good deliverability)  

---

## Implementation Checklist

- [ ] Add `.env` SMTP credentials
- [ ] Install nodemailer: `npm install nodemailer`
- [ ] Create EmailService.ts
- [ ] Create EmailQueueService.ts
- [ ] Create EmailTemplates.ts
- [ ] Add email_logs + newsletter_subscribers tables
- [ ] Update form submission route to send emails
- [ ] Update newsletter route to send emails
- [ ] Add email logs admin page
- [ ] Test form submission → 2 emails sent
- [ ] Test email retry logic
- [ ] Test newsletter subscription flow
- [ ] Monitor email delivery (check spam folder)
- [ ] Add SPF/DKIM/DMARC records

---

**Owner:** Dozer (CEO + Tech Lead)  
**Last Updated:** Juli 2026  
**Status:** Ready to implement

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026

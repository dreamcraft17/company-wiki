# DN Tech V5 — Email System Implementation Guide
## Complete Setup untuk SMTP mx8.mailspace.id:465

**Date:** Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Email:** info@dntech.id  
**SMTP Server:** mx8.mailspace.id:465  
**Status:** Ready to Implement

---

## 🎯 Quick Overview

**Goal:** Semua message dari website (form submission, newsletter, career, quiz) dikirim otomatis ke **info@dntech.id** via SMTP.

**Setup time:** 2-3 hours  
**Complexity:** Medium

---

## Step 1: Install Dependencies (5 min)

### Backend

```bash
cd backend

# Install nodemailer
npm install nodemailer

# Install types (TypeScript)
npm install --save-dev @types/nodemailer

# Install optional: for email templates
npm install handlebars
```

---

## Step 2: Environment Setup (5 min)

### File: `backend/.env`

**Add these settings:**

```
# SMTP Configuration for info@dntech.id
SMTP_HOST=mx8.mailspace.id
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@dntech.id
SMTP_PASSWORD=your_email_password_here

# From settings
SMTP_FROM_NAME=DN Tech
SMTP_FROM_EMAIL=info@dntech.id

# Admin email (receives all notifications)
ADMIN_EMAIL=info@dntech.id

# Email queue settings
EMAIL_QUEUE_ENABLED=true
EMAIL_RETRY_ATTEMPTS=3
EMAIL_RETRY_DELAY_MS=1000

# Rate limiting (emails per second)
EMAIL_RATE_LIMIT=10
```

**⚠️ IMPORTANT:** Replace `your_email_password_here` dengan password akun info@dntech.id

---

## Step 3: Create Email Service (30 min)

### File: `backend/src/services/EmailService.ts`

**Create this file:**

```typescript
'use strict';

import nodemailer from 'nodemailer';
import { logger } from '@/utils/logger';

export interface SendEmailOptions {
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  templateId?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConnected = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
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
          rateDelta: 1000, // milliseconds
          rateLimit: parseInt(process.env.EMAIL_RATE_LIMIT || '10'), // emails per second
        },
      });

      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          logger.error('❌ SMTP connection failed:', error);
          this.isConnected = false;
        } else {
          logger.info('✅ SMTP server ready (info@dntech.id)');
          this.isConnected = true;
        }
      });
    } catch (error) {
      logger.error('Failed to initialize transporter:', error);
      this.isConnected = false;
    }
  }

  /**
   * Send email (single attempt, no retry)
   */
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    options?: SendEmailOptions
  ): Promise<EmailResult> {
    if (!this.transporter) {
      return {
        success: false,
        error: 'Email service not initialized',
      };
    }

    try {
      const result = await this.transporter.sendMail({
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to,
        cc: options?.cc,
        bcc: options?.bcc,
        replyTo: options?.replyTo || process.env.SMTP_FROM_EMAIL,
        subject,
        html,
        text: this.stripHtml(html),
      });

      logger.info(`📧 Email sent to ${to}`, {
        messageId: result.messageId,
        templateId: options?.templateId,
      });

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      logger.error(`❌ Failed to send email to ${to}`, error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Send email with automatic retry (up to 3 attempts)
   */
  async sendEmailWithRetry(
    to: string,
    subject: string,
    html: string,
    options?: SendEmailOptions
  ): Promise<EmailResult> {
    const maxAttempts = parseInt(process.env.EMAIL_RETRY_ATTEMPTS || '3');
    const retryDelay = parseInt(process.env.EMAIL_RETRY_DELAY_MS || '1000');

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = await this.sendEmail(to, subject, html, options);

      if (result.success) {
        return result;
      }

      if (attempt < maxAttempts) {
        logger.warn(
          `⚠️ Email send attempt ${attempt}/${maxAttempts} failed. Retrying in ${retryDelay}ms...`,
          { to, subject }
        );
        await this.delay(retryDelay);
      }
    }

    return {
      success: false,
      error: `Failed to send email after ${maxAttempts} attempts`,
    };
  }

  /**
   * Send email to multiple recipients
   */
  async sendBulkEmail(
    recipients: string[],
    subject: string,
    html: string,
    options?: SendEmailOptions
  ): Promise<EmailResult[]> {
    return Promise.all(
      recipients.map(to => this.sendEmailWithRetry(to, subject, html, options))
    );
  }

  /**
   * Check if SMTP connection is alive
   */
  isHealthy(): boolean {
    return this.isConnected;
  }

  /**
   * Utility: Strip HTML tags for plain text version
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }

  /**
   * Utility: Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const emailService = new EmailService();
```

---

## Step 4: Create Email Templates (20 min)

### File: `backend/src/templates/emailTemplates.ts`

**Create this file:**

```typescript
/**
 * Email Templates - HTML templates untuk semua email yang dikirim
 */

export const emailTemplates = {
  /**
   * Form Submission - Confirmation to User
   */
  formConfirmation: (userName: string, projectType: string) => {
    return {
      subject: '✅ Terima Kasih Telah Menghubungi DN Tech',
      html: `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Inter, -apple-system, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1E3A8A; color: white; padding: 20px; text-align: center; border-radius: 4px; }
            .content { background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .cta { display: inline-block; padding: 12px 24px; background: #1E3A8A; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; }
            .footer { font-size: 12px; color: #999; border-top: 1px solid #ddd; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Terima Kasih!</h1>
            </div>

            <div class="content">
              <p>Halo <strong>${userName}</strong>,</p>
              
              <p>Terima kasih telah menghubungi kami untuk project <strong>"${projectType}"</strong>.</p>
              
              <p>Tim kami akan merespons dalam waktu <strong>24 jam</strong>. Kami akan menghubungi Anda di email atau telepon yang Anda berikan.</p>

              <p><strong>Apa yang akan terjadi selanjutnya?</strong></p>
              <ul>
                <li>📧 Kami akan meninjau detail proyek Anda</li>
                <li>📞 Tim sales akan menghubungi Anda untuk diskusi lebih lanjut</li>
                <li>📋 Kami akan membuat proposal custom untuk project Anda</li>
              </ul>
            </div>

            <p style="text-align: center;">
              <a href="https://dntech.id" class="cta">👉 Kembali ke Website</a>
            </p>

            <div class="footer">
              <p>📧 Email: <a href="mailto:info@dntech.id">info@dntech.id</a></p>
              <p>🌐 Website: <a href="https://dntech.id">dntech.id</a></p>
              <p>Salam,<br><strong>DN Tech Team</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  },

  /**
   * Form Submission - Admin Notification
   */
  adminLeadNotification: (lead: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    projectType: string;
    budget?: string;
    timeline?: string;
    description: string;
  }) => {
    return {
      subject: `🔔 Lead Baru: ${lead.name} - ${lead.projectType}`,
      html: `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Inter, -apple-system, sans-serif; }
            table { border-collapse: collapse; width: 100%; margin: 20px 0; }
            tr { border-bottom: 1px solid #ddd; }
            td { padding: 12px; }
            td:first-child { font-weight: bold; background: #f5f5f5; width: 150px; }
            .urgent { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
            .btn { display: inline-block; padding: 10px 20px; background: #1E3A8A; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="urgent">
            <strong>⚡ Lead Baru Diterima!</strong> Segera hubungi ${lead.name} sebelum kompetitor.
          </div>

          <h2>📋 Detail Lead</h2>
          
          <table>
            <tr>
              <td>Nama</td>
              <td>${lead.name}</td>
            </tr>
            <tr>
              <td>Email</td>
              <td><a href="mailto:${lead.email}">${lead.email}</a></td>
            </tr>
            <tr>
              <td>Telepon</td>
              <td>${lead.phone || '(Tidak ada)'}</td>
            </tr>
            <tr>
              <td>Perusahaan</td>
              <td>${lead.company || '(Tidak ada)'}</td>
            </tr>
            <tr>
              <td>Jenis Project</td>
              <td><strong>${lead.projectType}</strong></td>
            </tr>
            <tr>
              <td>Anggaran</td>
              <td>${lead.budget || '(Tidak ada)'}</td>
            </tr>
            <tr>
              <td>Timeline</td>
              <td>${lead.timeline || '(Tidak ada)'}</td>
            </tr>
            <tr>
              <td>Deskripsi</td>
              <td>${lead.description}</td>
            </tr>
            <tr>
              <td>Waktu</td>
              <td>${new Date().toLocaleString('id-ID')}</td>
            </tr>
          </table>

          <p style="text-align: center;">
            <a href="https://dntech.id/admin/leads" class="btn">👉 Lihat di Admin Panel</a>
          </p>

          <p style="color: #666; font-size: 12px;">
            Email ini dikirim otomatis dari sistem DN Tech. Jangan reply ke email ini.
          </p>
        </body>
        </html>
      `,
    };
  },

  /**
   * Newsletter Subscription Confirmation
   */
  newsletterConfirmation: (confirmLink: string) => {
    return {
      subject: '✉️ Konfirmasi Langganan Newsletter DN Tech',
      html: `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Inter, -apple-system, sans-serif; line-height: 1.6; }
            .btn { display: inline-block; padding: 12px 24px; background: #1E3A8A; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; }
            .code { background: #f5f5f5; padding: 15px; border-left: 4px solid #1E3A8A; margin: 20px 0; word-break: break-all; font-family: monospace; }
          </style>
        </head>
        <body>
          <h2>✉️ Konfirmasi Langganan Newsletter</h2>
          
          <p>Terima kasih telah berlangganan newsletter kami!</p>
          
          <p>Klik link di bawah untuk mengkonfirmasi email Anda:</p>

          <p style="text-align: center;">
            <a href="${confirmLink}" class="btn">✅ KONFIRMASI EMAIL</a>
          </p>

          <p style="color: #666; font-size: 12px;">
            <strong>Link tidak bisa diklik?</strong> Copy dan paste link ini di browser:<br>
            <span class="code">${confirmLink}</span>
            Link berlaku selama 24 jam.
          </p>

          <p>Salam,<br><strong>DN Tech Team</strong></p>
        </body>
        </html>
      `,
    };
  },

  /**
   * Newsletter Welcome After Confirmation
   */
  newsletterWelcome: () => {
    return {
      subject: '🎉 Selamat Datang di Newsletter DN Tech!',
      html: `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Inter, -apple-system, sans-serif; line-height: 1.6; }
            .highlight { background: #e0f2fe; padding: 15px; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <h2>🎉 Selamat Datang!</h2>
          
          <p>Anda sudah berhasil bergabung dengan newsletter kami.</p>

          <div class="highlight">
            <p><strong>Apa yang akan Anda dapatkan?</strong></p>
            <ul>
              <li>📰 Artikel teknologi terbaru setiap minggu</li>
              <li>💡 Tips & trik development untuk startup</li>
              <li>🚀 Update produk & fitur DN Tech</li>
              <li>📊 Case study & success stories</li>
            </ul>
          </div>

          <p>Jika ada pertanyaan, balas email ini atau hubungi kami di <a href="mailto:info@dntech.id">info@dntech.id</a>.</p>

          <p>Salam,<br><strong>DN Tech Team</strong></p>

          <p style="color: #999; font-size: 11px; border-top: 1px solid #ddd; padding-top: 15px;">
            <a href="#" style="color: #999;">Unsubscribe</a> dari newsletter ini kapan saja.
          </p>
        </body>
        </html>
      `,
    };
  },

  /**
   * Career Application - Admin Notification
   */
  careerApplicationNotification: (application: {
    name: string;
    email: string;
    phone: string;
    position: string;
    message: string;
    cvUrl?: string;
  }) => {
    return {
      subject: `🎯 Aplikasi Job Baru: ${application.position} - ${application.name}`,
      html: `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Inter, -apple-system, sans-serif; }
            table { border-collapse: collapse; width: 100%; margin: 20px 0; }
            tr { border-bottom: 1px solid #ddd; }
            td { padding: 12px; }
            td:first-child { font-weight: bold; background: #f5f5f5; width: 150px; }
          </style>
        </head>
        <body>
          <h2>🎯 Aplikasi Job Baru!</h2>

          <table>
            <tr>
              <td>Posisi</td>
              <td><strong>${application.position}</strong></td>
            </tr>
            <tr>
              <td>Nama</td>
              <td>${application.name}</td>
            </tr>
            <tr>
              <td>Email</td>
              <td><a href="mailto:${application.email}">${application.email}</a></td>
            </tr>
            <tr>
              <td>Telepon</td>
              <td>${application.phone}</td>
            </tr>
            <tr>
              <td>CV</td>
              <td>${
                application.cvUrl
                  ? `<a href="${application.cvUrl}">📄 Download CV</a>`
                  : '(Tidak ada)'
              }</td>
            </tr>
          </table>

          <h3>📝 Pesan Aplikan:</h3>
          <p>${application.message}</p>

          <p style="text-align: center; margin-top: 30px;">
            <a href="https://dntech.id/admin/careers/applications" style="display: inline-block; padding: 10px 20px; background: #1E3A8A; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
              👉 Lihat di Admin Panel
            </a>
          </p>
        </body>
        </html>
      `,
    };
  },

  /**
   * Quiz Completion - Recommendations
   */
  quizRecommendations: (
    userName: string,
    recommendations: Array<{ title: string; description: string }>
  ) => {
    const recommendationsHtml = recommendations
      .map(
        rec => `
        <div style="background: #f0f9ff; padding: 15px; border-left: 4px solid #1E3A8A; margin: 10px 0; border-radius: 4px;">
          <h4 style="margin: 0 0 5px 0; color: #1E3A8A;">${rec.title}</h4>
          <p style="margin: 0; color: #666;">${rec.description}</p>
        </div>
      `
      )
      .join('');

    return {
      subject: '📊 Hasil Quiz: Rekomendasi Solusi untuk Anda',
      html: `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Inter, -apple-system, sans-serif; line-height: 1.6; }
          </style>
        </head>
        <body>
          <h2>📊 Hasil Quiz Anda</h2>
          
          <p>Halo ${userName},</p>
          
          <p>Berdasarkan jawaban quiz Anda, berikut adalah rekomendasi solusi yang paling cocok untuk kebutuhan Anda:</p>

          ${recommendationsHtml}

          <p style="margin-top: 30px;">
            Tertarik untuk diskusi lebih lanjut? <a href="https://dntech.id/contact">Hubungi kami sekarang</a> untuk konsultasi gratis!
          </p>

          <p>Salam,<br><strong>DN Tech Team</strong></p>
        </body>
        </html>
      `,
    };
  },
};
```

---

## Step 5: Update Form Submission Route (30 min)

### File: `backend/src/routes/leads.ts`

**Update atau create:**

```typescript
import { Router, Request, Response } from 'express';
import { emailService } from '@/services/EmailService';
import { emailTemplates } from '@/templates/emailTemplates';
import { logger } from '@/utils/logger';

const router = Router();

/**
 * POST /api/v1/leads - Submit contact form
 * Sends 2 emails:
 *   1. Confirmation to user
 *   2. Notification to admin (info@dntech.id)
 */
router.post('/leads', async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      projectType,
      budget,
      timeline,
      description,
    } = req.body;

    // Validate required fields
    if (!name || !email || !projectType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, email, projectType',
      });
    }

    // Optional: Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    logger.info('📝 New form submission', { name, email, projectType });

    // 1️⃣ Save to database
    const lead = await prisma.formSubmission.create({
      data: {
        name,
        email,
        phone: phone || null,
        company: company || null,
        projectType,
        budget: budget || null,
        timeline: timeline || null,
        description,
        status: 'new',
        sourceUrl: req.headers.referer || '/contact',
        userAgent: req.headers['user-agent'] || null,
      },
    });

    logger.info('✅ Lead saved to database', { leadId: lead.id });

    // 2️⃣ Send confirmation email to user (with retry)
    const userEmailTemplate = emailTemplates.formConfirmation(name, projectType);
    const userEmailResult = await emailService.sendEmailWithRetry(
      email,
      userEmailTemplate.subject,
      userEmailTemplate.html,
      { templateId: 'form-confirmation' }
    );

    if (userEmailResult.success) {
      logger.info(`📧 Confirmation email sent to user: ${email}`);
    } else {
      logger.error(
        `❌ Failed to send confirmation email to user: ${email}`,
        userEmailResult.error
      );
    }

    // 3️⃣ Send admin notification to info@dntech.id (with retry)
    const adminEmailTemplate = emailTemplates.adminLeadNotification({
      name,
      email,
      phone,
      company,
      projectType,
      budget,
      timeline,
      description,
    });

    const adminEmail = process.env.ADMIN_EMAIL || 'info@dntech.id';
    const adminEmailResult = await emailService.sendEmailWithRetry(
      adminEmail,
      adminEmailTemplate.subject,
      adminEmailTemplate.html,
      {
        templateId: 'admin-lead-notification',
        replyTo: email, // Admin can reply directly to user
      }
    );

    if (adminEmailResult.success) {
      logger.info(`📧 Admin notification sent to: ${adminEmail}`);
    } else {
      logger.error(
        `❌ Failed to send admin notification to: ${adminEmail}`,
        adminEmailResult.error
      );
    }

    // 4️⃣ Track analytics
    await prisma.analyticsEvent.create({
      data: {
        type: 'form_submit',
        page: '/contact',
        data: JSON.stringify({
          projectType,
          leadId: lead.id,
          emailSent: userEmailResult.success,
        }),
        sessionId: req.sessionID || 'anonymous',
      },
    });

    // 5️⃣ Return success response
    return res.json({
      success: true,
      leadId: lead.id,
      message:
        'Terima kasih! Email konfirmasi telah dikirim ke ' +
        email +
        '. Kami akan menghubungi Anda dalam 24 jam.',
      adminNotified: adminEmailResult.success,
    });
  } catch (error) {
    logger.error('Error processing form submission:', error);
    return res.status(500).json({
      success: false,
      error: 'Gagal memproses form submission. Silakan coba lagi.',
    });
  }
});

/**
 * GET /api/v1/leads - Get all leads (admin only)
 */
router.get('/leads', async (req: Request, res: Response) => {
  try {
    // TODO: Add auth middleware to check if admin

    const leads = await prisma.formSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return res.json({ success: true, data: leads });
  } catch (error) {
    logger.error('Error fetching leads:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch leads' });
  }
});

export default router;
```

---

## Step 6: Update Newsletter Route (20 min)

### File: `backend/src/routes/newsletter.ts`

```typescript
import { Router, Request, Response } from 'express';
import { emailService } from '@/services/EmailService';
import { emailTemplates } from '@/templates/emailTemplates';
import { logger } from '@/utils/logger';
import crypto from 'crypto';

const router = Router();

/**
 * POST /api/v1/newsletter/subscribe
 * Subscribe to newsletter + send confirmation email
 */
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address',
      });
    }

    logger.info('📬 Newsletter subscription request', { email });

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing && existing.status === 'subscribed') {
      return res.json({
        success: false,
        message: 'Anda sudah berlangganan newsletter kami.',
      });
    }

    // Generate confirmation token
    const confirmToken = crypto.randomBytes(32).toString('hex');

    // Create or update subscriber
    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: {
        email,
        status: 'pending',
        confirmToken,
      },
      update: {
        status: 'pending',
        confirmToken,
      },
    });

    // Send confirmation email
    const confirmLink = `https://dntech.id/api/v1/newsletter/confirm?token=${confirmToken}`;
    const emailTemplate = emailTemplates.newsletterConfirmation(confirmLink);

    const emailResult = await emailService.sendEmailWithRetry(
      email,
      emailTemplate.subject,
      emailTemplate.html,
      { templateId: 'newsletter-confirm' }
    );

    if (emailResult.success) {
      logger.info(`📧 Newsletter confirmation sent to: ${email}`);
      return res.json({
        success: true,
        message: 'Email konfirmasi telah dikirim. Silakan cek email Anda.',
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Gagal mengirim email konfirmasi. Silakan coba lagi.',
      });
    }
  } catch (error) {
    logger.error('Error subscribing to newsletter:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process subscription',
    });
  }
});

/**
 * GET /api/v1/newsletter/confirm
 * Confirm newsletter subscription via token
 */
router.get('/confirm', async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid token' });
    }

    // Find subscriber by token
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { confirmToken: token },
    });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        error: 'Token tidak valid atau sudah kadaluarsa.',
      });
    }

    // Update status to subscribed
    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'subscribed',
        confirmedAt: new Date(),
        confirmToken: null, // Clear token
      },
    });

    // Send welcome email
    const welcomeTemplate = emailTemplates.newsletterWelcome();
    await emailService.sendEmailWithRetry(
      subscriber.email,
      welcomeTemplate.subject,
      welcomeTemplate.html,
      { templateId: 'newsletter-welcome' }
    );

    logger.info(`✅ Newsletter confirmed for: ${subscriber.email}`);

    // Redirect to thank you page
    return res.redirect(
      'https://dntech.id/thank-you?type=newsletter&email=' +
        encodeURIComponent(subscriber.email)
    );
  } catch (error) {
    logger.error('Error confirming newsletter:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to confirm subscription',
    });
  }
});

/**
 * POST /api/v1/newsletter/unsubscribe
 * Unsubscribe from newsletter
 */
router.post('/unsubscribe', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email required' });
    }

    await prisma.newsletterSubscriber.update({
      where: { email },
      data: {
        status: 'unsubscribed',
        unsubscribedAt: new Date(),
      },
    });

    logger.info(`❌ Unsubscribed from newsletter: ${email}`);

    return res.json({
      success: true,
      message: 'Anda telah dihapus dari mailing list kami.',
    });
  } catch (error) {
    logger.error('Error unsubscribing from newsletter:', error);
    return res
      .status(500)
      .json({ success: false, error: 'Failed to unsubscribe' });
  }
});

export default router;
```

---

## Step 7: Update Database Schema (10 min)

### File: `backend/prisma/schema.prisma`

**Add these models:**

```prisma
model FormSubmission {
  id            String    @id @default(cuid())
  name          String
  email         String
  phone         String?
  company       String?
  projectType   String    // "Custom App", "Consulting", etc
  budget        String?   // "5K-10K", "10K-50K", etc
  timeline      String?   // "ASAP", "1-3 bulan", etc
  description   String
  
  status        String    @default("new") // new, contacted, qualified, converted, rejected
  notes         String?   // Internal notes
  
  sourceUrl     String?   // Where form was submitted from
  userAgent     String?   // Browser info
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([email])
  @@index([status])
  @@index([createdAt])
}

model EmailLog {
  id            String    @id @default(cuid())
  to            String
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
  @@index([to])
  @@index([createdAt])
}

model NewsletterSubscriber {
  id            String    @id @default(cuid())
  email         String    @unique
  status        String    @default("pending") // pending, subscribed, unsubscribed
  
  confirmToken  String?   @unique
  confirmedAt   DateTime?
  unsubscribedAt DateTime?
  
  subscribedAt  DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([status])
  @@index([email])
}
```

**Run migrations:**

```bash
cd backend
npx prisma migrate dev --name add_email_models
npx prisma db push
```

---

## Step 8: Test Email Sending (15 min)

### Test File: `backend/src/tests/email.test.ts`

```typescript
import { emailService } from '@/services/EmailService';
import { emailTemplates } from '@/templates/emailTemplates';

describe('Email Service', () => {
  it('should send email successfully', async () => {
    const template = emailTemplates.formConfirmation('John Doe', 'Custom App');
    
    const result = await emailService.sendEmail(
      'test@example.com', // Change to your test email
      template.subject,
      template.html
    );

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
    console.log('✅ Email sent:', result.messageId);
  });

  it('should send admin notification', async () => {
    const template = emailTemplates.adminLeadNotification({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '628123456789',
      company: 'PT ABC',
      projectType: 'Custom App',
      budget: '50K-100K',
      timeline: '1-3 bulan',
      description: 'Kami ingin develop aplikasi mobile untuk e-commerce',
    });

    const result = await emailService.sendEmailWithRetry(
      process.env.ADMIN_EMAIL || 'info@dntech.id',
      template.subject,
      template.html
    );

    expect(result.success).toBe(true);
    console.log('✅ Admin notification sent');
  });
});

// Run: npm test -- email.test.ts
```

**Run test:**

```bash
npm test -- email.test.ts
```

---

## Step 9: Add Email Logging Admin Page (Optional, 30 min)

### File: `frontend/src/app/admin/email-logs/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';

interface EmailLog {
  id: string;
  to: string;
  subject: string;
  templateId?: string;
  status: string;
  sentAt?: string;
  error?: string;
}

export default function EmailLogsPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/v1/admin/email-logs?limit=50');
        const data = await res.json();
        setLogs(data.data || []);
      } catch (error) {
        console.error('Failed to fetch email logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Email Logs</h1>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-3 text-left">To</th>
            <th className="p-3 text-left">Subject</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Sent At</th>
            <th className="p-3 text-left">Error</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{log.to}</td>
              <td className="p-3">{log.subject}</td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-sm font-bold ${
                    log.status === 'sent'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {log.status}
                </span>
              </td>
              <td className="p-3">{log.sentAt ? new Date(log.sentAt).toLocaleString() : '-'}</td>
              <td className="p-3 text-red-600 text-sm">{log.error || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Step 10: Deploy & Verify (30 min)

### Pre-Deploy Checklist

- [ ] `.env` file updated with SMTP credentials
- [ ] `npm install nodemailer` completed
- [ ] All email template files created
- [ ] Database migrations applied
- [ ] Email routes registered in Express
- [ ] Tests passing

### Deploy Commands

```bash
# Backend
cd backend
npm install
npm run build
npx prisma db push
pm2 restart dntech-api

# Frontend (if email logs page added)
cd frontend
npm run build
pm2 restart dntech-web

# Test
curl -X POST http://localhost:4000/api/v1/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "projectType": "Custom App",
    "description": "Test message"
  }'
```

### Verify Email Sent

1. Check database:
   ```bash
   psql -d dntech
   SELECT * FROM "FormSubmission" ORDER BY "createdAt" DESC LIMIT 1;
   SELECT * FROM "EmailLog" ORDER BY "createdAt" DESC LIMIT 5;
   ```

2. Check admin email (info@dntech.id):
   - Should receive notification
   - Should see "New lead: Test User"

3. Check user email (test@example.com):
   - Should receive confirmation
   - Should see "Terima kasih telah menghubungi DN Tech"

---

## Troubleshooting

### Email Not Sending

**Problem:** `SMTP connection error`

**Solution:**
```bash
# Check credentials in .env
echo $SMTP_USER
echo $SMTP_PASSWORD

# Test SMTP connection
node -e "
require('nodemailer').createTransport({
  host: 'mx8.mailspace.id',
  port: 465,
  secure: true,
  auth: { user: 'info@dntech.id', pass: 'PASSWORD' }
}).verify(console.log);
"
```

### Email Going to Spam

**Solution:**
1. Add SPF record to DNS:
   ```
   v=spf1 include:mailspace.id ~all
   ```

2. Enable DKIM in mailspace.id control panel

3. Add DMARC policy:
   ```
   v=DMARC1; p=quarantine; rua=mailto:info@dntech.id
   ```

### High Email Volume

**Solution:**
- Increase `pool.rateLimit` in `EmailService.ts`
- Consider using SendGrid API instead
- Implement email queue system

---

## Monitoring

### Health Check

```bash
GET /api/v1/admin/email-status
# Response:
{
  "smtpConnected": true,
  "lastEmailSent": "2026-07-08T10:30:00Z",
  "failedCount": 0,
  "queuedCount": 0
}
```

### Daily Summary Email

Optional: Send daily summary to admin:
```bash
0 09 * * * curl -X POST http://localhost:4000/api/v1/admin/email-summary
```

---

**Ready to implement!** Start dengan Step 1-3 (setup), then Step 5-6 (integration), then deploy.

**Total time:** 2-3 hours  
**Result:** Semua message ke website otomatis dikirim ke info@dntech.id ✅

---

**Owner:** Dozer (CEO + Tech Lead)  
**Date:** Juli 2026

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026

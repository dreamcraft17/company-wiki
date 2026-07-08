# Software Design Document (SDD) v3.0

**Trusted Jurist Law Firm — Company Profile & Recruitment Platform**

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Proyek** | Trusted Jurist (TJ) |
| **Versi SDD** | 3.0 |
| **Versi Aplikasi Target** | 1.0 (Production) |
| **Tanggal Dokumen** | 8 Juli 2026 |
| **Status** | Ready for Implementation |
| **Architecture Lead** | DN Tech Engineering |

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   BROWSER (Client)                   │
│  ┌────────────────────────────────────────────────┐  │
│  │  Next.js App Router (React 19 + TypeScript)  │  │
│  │  - Public pages (7) + Careers + Admin         │  │
│  │  - Client-side form validation                │  │
│  │  - reCAPTCHA client script                    │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                         ↓ HTTPS
┌─────────────────────────────────────────────────────┐
│              VERCEL / DigitalOcean                   │
│  ┌────────────────────────────────────────────────┐  │
│  │  Next.js Server (Node.js 20+)                 │  │
│  │  - API Routes (/api/contact, /api/apply)     │  │
│  │  - SSG (static pages at build time)           │  │
│  │  - Middleware (rate-limit, auth)              │  │
│  │  - Environment variables (secrets)             │  │
│  └────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────┐  │
│  │  Edge Functions (Cloudflare Workers)          │  │
│  │  - DDoS protection                            │  │
│  │  - Security headers (CSP, HSTS)               │  │
│  │  - Cache control rules                        │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
    ↙ SMTP        ↙ S3 API      ↙ Rate Limit     ↙ Secret Verify
┌──────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────────┐
│  Resend  │  │ DigitalOcean │  │   Redis    │  │ Google reCAPTCHA
│ (Email)  │  │ (Spaces/S3)  │  │  (Cached)  │  │   (Verification)
└──────────┘  └──────────────┘  └────────────┘  └──────────────┘
                                      ↙ Future (Phase 1)
                             ┌────────────────────┐
                             │   PostgreSQL       │
                             │  (Admin + Leads)   │
                             └────────────────────┘
```

### 1.2 Technology Stack (Confirmed)

#### Frontend Layer
- **Framework**: Next.js 16.2.6 (App Router, TypeScript)
- **UI**: React 19.2.4, Tailwind CSS v4, Framer Motion 12.38
- **Icons**: Lucide React 1.16
- **Fonts**: Google Fonts (Cormorant Garamond + Manrope)

#### Backend Layer
- **Runtime**: Node.js 20+ (via Vercel/DigitalOcean App Platform)
- **Framework**: Next.js Route Handlers (serverless functions)
- **Email**: Resend 6.12 API
- **Security**: Google reCAPTCHA v3, in-memory rate-limiting

#### Storage Layer
- **Files**: DigitalOcean Spaces (S3-compatible)
- **Future DB**: PostgreSQL (phase 1+)
- **Caching**: In-memory (v1), Redis (phase 1)

#### Infrastructure
- **Hosting**: Vercel (recommended) or DigitalOcean App Platform
- **CDN**: Cloudflare (optional but recommended)
- **Monitoring**: Uptime Robot, Sentry (optional)
- **CI/CD**: GitHub Actions

---

## 2. System Components & Modules

### 2.1 Frontend Components Structure

```
src/app/
├── layout.tsx                  # Root layout + global providers
├── template.tsx                # Page transition wrapper
├── page.tsx                    # Homepage
├── (pages)/
│   ├── about/page.tsx
│   ├── practice-areas/page.tsx
│   ├── team/page.tsx
│   ├── careers/page.tsx
│   ├── careers/[jobId]/page.tsx (future)
│   ├── insights/page.tsx
│   ├── insights/[slug]/page.tsx (P2, backlog)
│   └── contact/page.tsx
├── privacy/page.tsx
├── api/
│   ├── contact/route.ts        # POST /api/contact
│   └── apply/route.ts          # POST /api/apply (job application)
├── admin/
│   ├── layout.tsx
│   ├── page.tsx                # Dashboard
│   ├── leads/page.tsx
│   ├── applicants/page.tsx
│   └── jobs/page.tsx
├── not-found.tsx
├── loading.tsx
├── sitemap.ts
├── robots.ts
├── opengraph-image.tsx
└── icon.tsx

src/components/
├── home/
│   ├── Hero.tsx
│   ├── HomeTrustColophon.tsx
│   ├── HomeCredibilityChapter.tsx
│   ├── HomeAboutSpread.tsx
│   ├── HomePracticeIndex.tsx
│   ├── HomeFounderChapter.tsx
│   ├── HomeStandardsCascade.tsx
│   ├── HomeInsightsJournal.tsx
│   └── HomeClosingComposition.tsx
├── layout/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── MobileMenu.tsx
│   └── SkipLink.tsx
├── forms/
│   ├── ContactForm.tsx
│   ├── JobApplicationForm.tsx
│   └── JobPostingForm.tsx
├── admin/
│   ├── LeadsDashboard.tsx
│   ├── ApplicantsDashboard.tsx
│   ├── JobListingManager.tsx
│   └── AnalyticsDashboard.tsx
├── editorial/
│   ├── Hero.tsx
│   ├── SectionHeader.tsx
│   ├── EditorialProse.tsx
│   ├── CTASection.tsx
│   └── PracticeAreaCard.tsx
├── motion/
│   ├── AnimatedReveal.tsx
│   ├── PageTransition.tsx
│   ├── MotionStagger.tsx
│   └── useReducedMotion.ts
└── ui/
    ├── Button.tsx
    ├── ButtonLink.tsx
    ├── Container.tsx
    ├── Form.tsx
    ├── FormField.tsx
    └── Alert.tsx

src/lib/
├── data.ts                     # Content + CONTACT_CONFIG
├── constants.ts                # SITE_CONFIG, FOOTER_LEGAL
├── seo.ts                      # createMetadata() helper
├── types/index.ts              # TypeScript interfaces
├── utils.ts                    # clsx, cn, format utilities
├── typography.ts               # Font size/weight tokens
├── motion.ts                   # Animation helpers
├── contact/
│   ├── validate.ts             # Input validation
│   ├── sanitize.ts             # HTML escape
│   ├── rate-limit.ts           # In-memory rate limiter
│   ├── recaptcha.ts            # reCAPTCHA verification
│   ├── send-contact-email.ts   # Resend email sender
│   └── send-apply-email.ts     # Job app email sender
└── admin/
    ├── auth.ts                 # Admin login (v1: static)
    ├── leads-service.ts        # Lead CRUD operations
    └── applicants-service.ts   # Applicant CRUD operations

src/styles/
├── globals.css                 # Tailwind + global rules
├── typography.css              # Font & text rules
└── animations.css              # Keyframe animations

public/
├── manifest.webmanifest        # PWA manifest (phase 1)
├── robots.txt                  # Generated at runtime
└── sitemap.xml                 # Generated at runtime
```

---

## 3. Data Models & Database Schema

### 3.1 Data Models (v1.0)

#### Contact Lead (In-Memory / Logs)

```typescript
interface ContactLead {
  id: string;                    // UUID
  name: string;
  email: string;
  phone?: string;
  subject: string;              // enum: "Litigasi", "Antikorupsi", etc.
  message: string;
  formVariant: "consultation";
  ipAddress: string;
  timestamp: Date;               // ISO 8601
  status: "new" | "viewed" | "contacted" | "archived";
  statusChangedAt?: Date;
  statusChangedBy?: string;      // admin name (future)
  notes?: string;                // admin notes (future)
}
```

#### Job Applicant

```typescript
interface JobApplicant {
  id: string;                    // UUID
  jobPostingId: string;
  jobTitle: string;              // "Fullstack Engineer"
  name: string;
  email: string;
  phone: string;                 // E.164 format
  linkedinUrl?: string;
  cvFileUrl: string;             // Signed S3 URL (24mo expiry)
  cvFileName: string;
  cvMimeType: "application/pdf" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  coverLetter?: string;
  availability: "ASAP" | "2_weeks" | "1_month";
  ipAddress: string;
  submittedAt: Date;             // ISO 8601
  status: "new" | "review" | "interview" | "offer" | "rejected";
  statusChangedAt?: Date;
  statusChangedBy?: string;      // admin name (future)
  notes?: string;                // internal notes
}
```

#### Job Posting (Admin-Managed)

```typescript
interface JobPosting {
  id: string;                    // slug-safe ID
  title: string;                 // "Fullstack Engineer"
  level: "junior" | "mid" | "senior" | "lead";
  department?: string;
  location: string;              // "Jakarta Timur"
  description: string;           // Rich text / markdown
  responsibilities: string[];
  requiredSkills: string[];
  niceToHave?: string[];
  benefits?: string[];
  compensationRange?: string;    // e.g., "Kompetitif"
  applicationDeadline?: Date;
  status: "draft" | "published" | "closed";
  createdAt: Date;
  publishedAt?: Date;
  closedAt?: Date;
  applicantCount: number;        // Denormalized for dashboard
}
```

#### Admin Session (v1: In-Memory)

```typescript
interface AdminSession {
  id: string;                    // session token
  email: string;
  expiresAt: Date;               // 24h from login
  createdAt: Date;
  lastActivity: Date;
}
```

### 3.2 Database Schema (Future PostgreSQL - Phase 1)

```sql
-- Contact Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  form_variant VARCHAR(50) DEFAULT 'consultation',
  ip_address INET,
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at DESC)
);

-- Job Postings
CREATE TABLE job_postings (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  level VARCHAR(50),
  department VARCHAR(100),
  location VARCHAR(255),
  description TEXT NOT NULL,
  responsibilities TEXT,
  required_skills TEXT,
  nice_to_have TEXT,
  benefits TEXT,
  compensation_range VARCHAR(255),
  application_deadline DATE,
  status VARCHAR(50) DEFAULT 'draft',
  applicant_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP,
  closed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_published_at (published_at DESC)
);

-- Job Applicants
CREATE TABLE applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id VARCHAR(100) NOT NULL REFERENCES job_postings(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  linkedin_url VARCHAR(2048),
  cv_file_url VARCHAR(2048) NOT NULL,
  cv_file_name VARCHAR(255),
  cv_mime_type VARCHAR(100),
  cover_letter TEXT,
  availability VARCHAR(50),
  ip_address INET,
  status VARCHAR(50) DEFAULT 'new',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  INDEX idx_job_posting_id (job_posting_id),
  INDEX idx_status (status),
  INDEX idx_submitted_at (submitted_at DESC)
);

-- Admin Sessions (optional: use JWT instead)
CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMP,
  ip_address INET,
  INDEX idx_expires_at (expires_at)
);

-- Audit Trail
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email VARCHAR(255),
  action VARCHAR(100),        -- 'lead_status_change', 'applicant_delete', etc.
  entity_type VARCHAR(50),    -- 'lead', 'applicant', 'job'
  entity_id VARCHAR(255),
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created_at (created_at DESC)
);
```

### 3.3 File Storage Structure (DigitalOcean Spaces)

```
s3://trustedjurist-cvs-prod/
├── applicants/
│   ├── {applicantId}__{timestamp}__{originalFileName}.pdf
│   ├── {applicantId}__{timestamp}__{originalFileName}.docx
│   └── ...
└── metadata.json (future: centralized index)
```

**Naming Convention**:
- Format: `{applicantId}_{timestamp}_{sanitizedOriginalFilename}`
- Prevents collisions, allows lookup by applicant
- Signed URL expires in 24 months (retention policy)

---

## 4. API Specification

### 4.1 POST `/api/contact` — Contact Form Submission

**Request**:
```typescript
POST https://trustedjurist.co.id/api/contact HTTP/1.1
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+62812345678",
  "subject": "Litigasi",
  "message": "We have a dispute with our supplier...",
  "recaptchaToken": "03AOLTBLQwIIzJ..."
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Terima kasih! Kami akan menghubungi Anda dalam 24 jam."
}
```

**Response (400 Bad Request)**:
```json
{
  "success": false,
  "error": "Email tidak valid"
}
```

**Response (429 Too Many Requests)**:
```json
{
  "success": false,
  "error": "Terlalu banyak request. Coba lagi dalam 1 menit.",
  "retryAfter": 60
}
```

**Processing Logic**:
1. Rate limit check (5 req/min/IP)
2. Input validation (name, email, subject, message)
3. reCAPTCHA verification (score ≥0.5)
4. HTML escape message for email
5. Send confirmation email to user
6. Send alert email to admin + replyTo
7. Log lead (database/logs)
8. Return 200 success

**Error Handling**:
- Invalid email → 400
- Rate limited → 429
- reCAPTCHA failed → 400
- Resend API error → 500 (internal error, no details leaked)

---

### 4.2 POST `/api/apply` — Job Application Submission

**Request** (multipart/form-data):
```
POST https://trustedjurist.co.id/api/apply HTTP/1.1
Content-Type: multipart/form-data; boundary=...

--boundary
Content-Disposition: form-data; name="name"
John Doe
--boundary
Content-Disposition: form-data; name="email"
john@example.com
--boundary
Content-Disposition: form-data; name="phone"
+62812345678
--boundary
Content-Disposition: form-data; name="jobPostingId"
fullstack-engineer
--boundary
Content-Disposition: form-data; name="cv"; filename="resume.pdf"
Content-Type: application/pdf
[binary PDF data]
--boundary
Content-Disposition: form-data; name="availability"
ASAP
--boundary--
```

**Response (200 OK)**:
```json
{
  "success": true,
  "applicantId": "uuid-xxx",
  "message": "Terima kasih! Kami akan menghubungi Anda dalam 7 hari."
}
```

**Response (400 Bad Request)**:
```json
{
  "success": false,
  "error": "File exceeds 5MB" | "Only PDF and DOCX accepted"
}
```

**Response (429 Too Many Requests)**:
```json
{
  "success": false,
  "error": "Anda sudah apply untuk posisi ini. Coba lagi besok."
}
```

**Processing Logic**:
1. Validate multipart form data
2. Rate limit check (1 app/IP/job/24h)
3. File validation (type, size <5MB)
4. Upload file to DigitalOcean Spaces (async)
5. Validate other form fields (name, email, phone)
6. Create applicant record (database)
7. Send confirmation email to applicant
8. Send alert email to admin
9. Return 200 + applicant ID

---

### 4.3 Admin API Endpoints (Internal)

#### GET `/api/admin/leads`

**Query Parameters**:
```
?status=new|viewed|contacted|archived
&subject=Litigasi
&dateFrom=2026-07-01
&dateTo=2026-07-08
&page=1
&limit=20
&sort=date_desc
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-xxx",
      "name": "John Doe",
      "email": "john@example.com",
      "subject": "Litigasi",
      "status": "new",
      "createdAt": "2026-07-08T10:30:00Z"
    }
  ],
  "total": 145,
  "page": 1,
  "limit": 20
}
```

#### GET `/api/admin/leads/:id`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-xxx",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+62812345678",
    "subject": "Litigasi",
    "message": "We have a dispute...",
    "ipAddress": "203.0.113.42",
    "status": "new",
    "notes": "Potential high-value case",
    "createdAt": "2026-07-08T10:30:00Z",
    "updatedAt": "2026-07-08T10:30:00Z"
  }
}
```

#### PATCH `/api/admin/leads/:id`

**Request**:
```json
{
  "status": "contacted",
  "notes": "Email sent, awaiting response"
}
```

#### GET `/api/admin/applicants`

**Query Parameters**:
```
?jobPostingId=fullstack-engineer
&status=new|review|interview|offer|rejected
&page=1
&limit=20
```

#### GET `/api/admin/applicants/:id`

**Response**: Full applicant details + CV URL

#### PATCH `/api/admin/applicants/:id`

**Request**:
```json
{
  "status": "interview",
  "notes": "Scheduled call for Friday"
}
```

#### GET/POST/PATCH `/api/admin/jobs`

**POST Create Job**:
```json
{
  "title": "Fullstack Engineer",
  "level": "senior",
  "location": "Jakarta Timur",
  "description": "We are looking for...",
  "requiredSkills": ["Node.js", "React", "PostgreSQL"],
  "status": "draft"
}
```

**Response**: Created job with ID

#### GET `/api/admin/analytics`

**Response**:
```json
{
  "thisWeek": {
    "formSubmissions": 12,
    "jobApplications": 3
  },
  "thisMonth": {
    "formSubmissions": 45,
    "jobApplications": 8
  },
  "jobBreakdown": {
    "fullstack-engineer": { "total": 5, "new": 2, "reviewed": 1 },
    "software-engineer": { "total": 3, "new": 0, "reviewed": 3 }
  }
}
```

---

## 5. Email Templates

### 5.1 Contact Form Confirmation (User)

**Subject**: `Kami Menerima Konsultasi Anda — Trusted Jurist Law Firm`

**Body**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Manrope, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { color: #121c2b; font-size: 24px; margin-bottom: 20px; }
    .content { color: #5c6b7a; font-size: 14px; }
    .footer { color: #9ca3af; font-size: 12px; border-top: 1px solid #d9d2c6; margin-top: 20px; padding-top: 20px; }
    .button { background: #8a7340; color: white; padding: 10px 20px; border-radius: 4px; display: inline-block; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="header">Terima Kasih atas Konsultasi Anda</h1>
    <div class="content">
      <p>Halo {name},</p>
      <p>Kami menerima permintaan konsultasi Anda mengenai <strong>{subject}</strong>. Tim kami akan meninjau pesan Anda dan menghubungi Anda dalam 24 jam kerja.</p>
      <p><strong>Rincian Konsultasi Anda:</strong></p>
      <ul>
        <li>Nama: {name}</li>
        <li>Email: {email}</li>
        <li>Bidang: {subject}</li>
        <li>Pesan: {message}</li>
      </ul>
      <p>Jika ada pertanyaan, silakan hubungi kami melalui <a href="https://trustedjurist.co.id/contact">formulir kontak</a> atau telepon langsung.</p>
      <p>Terima kasih,<br><strong>Trusted Jurist Law Firm</strong></p>
    </div>
    <div class="footer">
      <p><a href="https://trustedjurist.co.id/privacy">Kebijakan Privasi</a> | <a href="https://trustedjurist.co.id/contact">Kontak</a></p>
      <p>Trusted Jurist Law Firm | Jakarta Timur, Indonesia</p>
      <p><em>Email ini adalah notifikasi otomatis. Hubungan advokat-klien belum terbentuk hingga ada perjanjian tertulis.</em></p>
    </div>
  </div>
</body>
</html>
```

**Plain Text Fallback**:
```
Terima Kasih atas Konsultasi Anda

Halo {name},

Kami menerima permintaan konsultasi Anda mengenai {subject}.
Tim kami akan meninjau pesan Anda dan menghubungi Anda dalam 24 jam kerja.

Rincian Konsultasi Anda:
- Nama: {name}
- Email: {email}
- Bidang: {subject}
- Pesan: {message}

Terima kasih,
Trusted Jurist Law Firm
https://trustedjurist.co.id
```

### 5.2 Contact Lead Alert (Admin)

**Subject**: `[Lead] {subject} — {name}`

**Body**:
```
Permintaan konsultasi baru diterima:

Nama: {name}
Email: {email}
Telepon: {phone}
Bidang Hukum: {subject}
Waktu Dikirim: {timestamp} WIB
Alamat IP: {ipAddress}

Pesan:
{message}

---
Aksi Admin:
- Buka Dashboard: https://trustedjurist.co.id/admin/leads/{leadId}
- Balas Langsung: {email} (Balas email ini untuk menghubungi klien)

Anda dapat mengubah status lead (viewed, contacted, archived) di dashboard admin.
```

### 5.3 Job Application Confirmation (Applicant)

**Subject**: `Lamaran Anda Diterima — Trusted Jurist Law Firm`

**Body**:
```
Halo {name},

Terima kasih telah melamar posisi Fullstack Engineer di Trusted Jurist.
Kami menerima aplikasi Anda dan akan melakukan review dalam 7 hari kerja.

Tim HR kami akan menghubungi Anda untuk langkah berikutnya jika aplikasi Anda berhasil dalam tahap initial screening.

Posisi yang Anda lamar: Fullstack Engineer
Tanggal Lamaran: {submittedDate}

Jika ada pertanyaan, silakan hubungi kami di hr@trustedjurist.co.id.

Terima kasih,
Trusted Jurist Law Firm
```

### 5.4 Job Application Alert (Admin)

**Subject**: `[Lamaran Baru] Fullstack Engineer — {name}`

**Body**:
```
Lamaran baru diterima:

Posisi: Fullstack Engineer
Nama: {name}
Email: {email}
Telepon: {phone}
LinkedIn: {linkedinUrl}
Ketersediaan: {availability}
Waktu Lamaran: {submittedDate}

CV: {cvFileUrl}

---
Aksi Admin:
- Buka Dashboard Lamaran: https://trustedjurist.co.id/admin/applicants/{applicantId}
- Download CV: {cvDownloadLink}
- Ubah Status: Di dashboard (new → review → interview → offer/reject)

Balas email ini untuk menghubungi pelamar langsung.
```

---

## 6. Authentication & Authorization

### 6.1 Admin Login (v1 Simple)

**Flow**:
1. User navigates to `/admin`
2. Middleware checks for `admin_session` cookie
3. If not present, redirect to `/admin/login`
4. User enters email + password
5. Hardcoded check (v1) against `.env.ADMIN_EMAIL` + `.env.ADMIN_PASSWORD`
6. If valid, create session cookie + redirect to `/admin`
7. Cookie expires in 24h; activity resets TTL (optional)

**Middleware** (`middleware.ts`):
```typescript
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const session = request.cookies.get("admin_session");
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    // Optionally validate session expiry
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

### 6.2 Session Management

**Session Storage** (v1):
- Cookie-based session ID (signed)
- In-memory session store (suitable for single-instance)
- TTL: 24 hours
- Secure flag + HttpOnly flag set

**Future (Phase 1)**:
- Migrate to JWT tokens
- Database-backed sessions
- Redis-backed sessions for multi-instance
- SSO (Google, Microsoft)

---

## 7. Security Measures

### 7.1 Input Validation & Sanitization

**Contact Form**:
- `name`: required, 2–100 chars, no control chars
- `email`: required, valid RFC 5322 format
- `phone`: optional, validate Indonesia format (62xxxx or +62xxxx)
- `subject`: enum (predefined list, no user input)
- `message`: required, max 5000 chars
- **Sanitization**: Trim whitespace, escape HTML in email template

**Job Application**:
- `name`, `email`, `phone`: same as contact form
- `cv` file: type (PDF/DOCX only), size (<5MB)
- **Sanitization**: Rename file to prevent path traversal

### 7.2 SQL Injection Prevention

**Not applicable v1** (no SQL queries; future PostgreSQL uses parameterized queries)

```typescript
// Future PostgreSQL example
const result = await db.query(
  "SELECT * FROM leads WHERE id = $1",
  [leadId]  // Parameterized, safe
);
```

### 7.3 Cross-Site Scripting (XSS) Prevention

- **Client-side**: React auto-escapes JSX content by default
- **Email**: HTML escape user input before sending via Resend
- **Admin**: Form inputs sanitized (trim, escape)

```typescript
// Example escape function
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Used in email template
const message = escapeHtml(userInput.message);
```

### 7.4 Cross-Site Request Forgery (CSRF) Prevention

- **Next.js Route Handlers**: Built-in protection via SameSite cookie policy
- **Optional**: Add CSRF token for sensitive operations (phase 1)

### 7.5 Secrets Management

**Required Secrets** (in `.env.production`):
```
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@trustedjurist.co.id
ADMIN_EMAIL=admin@trustedjurist.co.id
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc3...
RECAPTCHA_SECRET_KEY=6Lc3...
ADMIN_PASSWORD=strong_password_here (v1 only; deprecated phase 1)
```

**Non-Secrets** (safe in `.env.example`):
```
NEXT_PUBLIC_SITE_URL=https://trustedjurist.co.id
NEXT_PUBLIC_SITE_NAME=Trusted Jurist Law Firm
```

**Management**:
- `.env.local` on localhost (development)
- `.env.production` on hosting provider (never commit)
- Rotate keys every 90 days
- Use separate keys for staging vs production

### 7.6 Rate Limiting

**In-Memory Rate Limiter** (v1):
```typescript
// lib/contact/rate-limit.ts
const ipLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string, limit: number = 5, window: number = 60000): boolean {
  const now = Date.now();
  const record = ipLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    ipLimitMap.set(ip, { count: 1, resetTime: now + window });
    return true;
  }

  if (record.count < limit) {
    record.count++;
    return true;
  }

  return false; // Rate limit exceeded
}
```

**Redis Rate Limiter** (Phase 1):
```typescript
// Future: use redis-node or similar
const rateLimiter = new RateLimiter(redisClient);
const isAllowed = await rateLimiter.check(`contact:${ip}`, 5, 60);
```

### 7.7 reCAPTCHA v3 Integration

**Client-Side** (in form):
```typescript
// lib/recaptcha-client.ts
import Script from "next/script";

export function RecaptchaScript() {
  return (
    <Script
      src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
      onLoad={() => {
        window.grecaptchaReady = true;
      }}
    />
  );
}

// In form submit handler
const token = await window.grecaptcha.execute(
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  { action: "contact_form" }
);

// Send token with form
const response = await fetch("/api/contact", {
  method: "POST",
  body: JSON.stringify({ ...formData, recaptchaToken: token }),
});
```

**Server-Side** (API route):
```typescript
// lib/contact/recaptcha.ts
import axios from "axios";

export async function verifyRecaptcha(token: string): Promise<boolean> {
  if (!process.env.RECAPTCHA_SECRET_KEY) {
    console.warn("reCAPTCHA secret not set; skipping verification");
    return true; // Dev fallback
  }

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: token,
      }
    );

    const { success, score } = response.data;
    return success && score >= 0.5;
  } catch (error) {
    console.error("reCAPTCHA verification failed:", error);
    return false; // Reject if verification fails
  }
}
```

---

## 8. Error Handling & Logging

### 8.1 Error Handling Strategy

**Frontend**:
- Form validation errors → inline alert
- API errors → user-friendly message ("Mohon coba lagi nanti")
- Network errors → retry logic with exponential backoff

**Backend**:
- Input validation → 400 Bad Request (client error)
- Rate limit → 429 Too Many Requests
- Server error → 500 (no sensitive details in response)
- Unhandled error → log to Sentry + return 500

### 8.2 Logging

**Levels**:
- **INFO**: Form submission, email sent, job published
- **WARN**: Rate limit exceeded, reCAPTCHA score low
- **ERROR**: Email delivery failed, file upload failed, database error

**Log Format**:
```
[2026-07-08T10:30:45.123Z] [INFO] Contact form submitted | email: john@example.com | subject: Litigasi | ip: 203.0.113.42
[2026-07-08T10:30:46.456Z] [INFO] Email sent to user | email: john@example.com | template: contact_confirmation
[2026-07-08T10:30:47.789Z] [ERROR] Email send failed | error: Resend API 500 | retrying in 60s
```

**Log Storage**:
- v1: Console logs + Vercel/DigitalOcean built-in logs
- Phase 1: Integrate Sentry or LogRocket for error tracking

---

## 9. Testing Strategy

### 9.1 Unit Tests

**Tools**: Jest + React Testing Library

**Example**:
```typescript
// lib/contact/validate.test.ts
import { validateContactForm } from "./validate";

describe("validateContactForm", () => {
  it("returns error if email invalid", () => {
    const result = validateContactForm({
      name: "John",
      email: "invalid-email",
      subject: "Litigasi",
      message: "Help",
    });
    expect(result.error).toBe("Email tidak valid");
  });

  it("passes validation for valid input", () => {
    const result = validateContactForm({
      name: "John",
      email: "john@example.com",
      subject: "Litigasi",
      message: "Help me please",
    });
    expect(result.success).toBe(true);
  });
});
```

**Coverage Targets**:
- `lib/contact/validate.ts`: ≥90%
- `lib/contact/sanitize.ts`: ≥90%
- Form components: ≥80%

### 9.2 Integration Tests

**Tools**: Jest + Node.js API testing

**Example**:
```typescript
// api/contact.test.ts
import { POST } from "./route";
import { NextRequest } from "next/server";

describe("POST /api/contact", () => {
  it("sends confirmation email on success", async () => {
    const request = new NextRequest("https://localhost:3000/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: "John",
        email: "john@example.com",
        subject: "Litigasi",
        message: "Help",
        recaptchaToken: "mock-token",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    // Verify Resend was called (mock)
    expect(sendEmailMock).toHaveBeenCalled();
  });

  it("returns 429 if rate limited", async () => {
    // Simulate 6 requests
    for (let i = 0; i < 6; i++) {
      const request = new NextRequest("...", { method: "POST", body: "..." });
      const response = await POST(request);
      if (i === 5) expect(response.status).toBe(429);
    }
  });
});
```

### 9.3 End-to-End Tests

**Tools**: Playwright or Cypress

**Example**:
```typescript
// e2e/contact-form.spec.ts
import { test, expect } from "@playwright/test";

test("user can submit contact form", async ({ page }) => {
  await page.goto("https://localhost:3000/contact");

  // Fill form
  await page.fill('input[name="name"]', "John Doe");
  await page.fill('input[name="email"]', "john@example.com");
  await page.selectOption('select[name="subject"]', "Litigasi");
  await page.fill('textarea[name="message"]', "We need legal help");

  // Check privacy consent
  await page.check('input[name="privacy"]');

  // Submit
  await page.click('button[type="submit"]');

  // Verify success message
  await expect(page.locator('text=Terima kasih')).toBeVisible();
});
```

---

## 10. Deployment & DevOps

### 10.1 Build & Deployment Pipeline

**CI/CD** (GitHub Actions):
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
      - run: npm install
      - run: npm run lint
      - run: npm run build
      - run: npm test
      - name: Deploy to Vercel
        uses: vercel/action@v4
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### 10.2 Environment Configuration

**Development** (localhost):
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# Resend/reCAPTCHA optional (fallback to console)
```

**Staging** (preview URL):
```env
NEXT_PUBLIC_SITE_URL=https://[project].vercel.app
RESEND_API_KEY=re_xxxxx (test key)
# ...other env vars
```

**Production** (trustedjurist.co.id):
```env
NEXT_PUBLIC_SITE_URL=https://trustedjurist.co.id
RESEND_API_KEY=re_xxxxx (production key)
# ...other env vars (manage in Vercel/hosting console)
```

### 10.3 Monitoring & Alerts

**Uptime Monitoring**:
- Uptime Robot or StatusCake
- Check every 5 minutes
- Alert if site down >5 minutes
- Webhook to Slack/email

**Error Tracking**:
- Sentry (optional, phase 1)
- Capture unhandled errors
- Source maps for debugging

**Performance Monitoring**:
- Lighthouse CI (optional)
- Core Web Vitals tracking
- Monthly performance reports

---

## 11. Scalability Considerations

### 11.1 Current Bottlenecks (v1.0)

| Component | Limit | Solution |
|-----------|-------|----------|
| Rate limiting | In-memory (single-instance only) | Redis (phase 1) |
| Session storage | In-memory | Database (phase 1) |
| File uploads | DigitalOcean Spaces (auto-scale) | No issue |
| Email throughput | Resend (1000+/day limit) | Should be fine year 1 |
| Database | No database (logs only) | PostgreSQL (phase 1) |

### 11.2 Scaling Strategy (Phase 1+)

1. **Database**: PostgreSQL read replicas for read-heavy queries
2. **Cache**: Redis for rate limiting, session storage, data cache
3. **CDN**: Cloudflare for edge caching (already in use)
4. **Load Balancing**: Vercel/DigitalOcean handles automatically
5. **File Storage**: DigitalOcean Spaces auto-scales
6. **Email**: Resend scales automatically

### 11.3 Performance Optimization (Ongoing)

- Image optimization (next/image, WebP format)
- Code splitting (dynamic imports for heavy components)
- CSS pruning (Tailwind JIT)
- Database indexing (when PostgreSQL added)
- CDN edge caching rules

---

## 12. Migration Path (v1.0 → Phase 1)

### Phase 1 (Months 1–3 Post-Launch)

**Database Migration**:
1. Create PostgreSQL schema (scripts in `db/migrations/`)
2. Migrate contact leads from logs
3. Migrate applicant records from DigitalOcean metadata
4. Update API queries to use database
5. Add transaction support for critical operations

**Rate Limiting**:
1. Set up Redis instance (DigitalOcean Redis or AWS ElastiCache)
2. Implement Redis rate limiter
3. Migrate from in-memory to Redis
4. Deploy to multi-instance setup

**Admin Enhancements**:
1. Team member management UI
2. Advanced filtering & saved views
3. Email template editor
4. Interview scheduling (Calendly integration)
5. PDF report generation

**Analytics**:
1. GA4 or Plausible integration
2. Event tracking for forms, clicks
3. Dashboard with user behavior metrics
4. Lead source attribution

---

## 13. Technical Debt & Future Refactoring

### 13.1 Identified Technical Debt

| Item | Impact | Priority |
|------|--------|----------|
| Hardcoded admin password | Security risk | High |
| In-memory rate limiter | Not scalable | Medium |
| No error tracking (Sentry) | Ops visibility low | Medium |
| No type-safe database queries | Maintainability | Low |
| Minimal test coverage | Regression risk | Medium |

### 13.2 Refactoring Plan

**Q3 2026** (Post-launch):
- Replace hardcoded password with JWT + database
- Add Sentry for error tracking
- Increase test coverage to 70%+

**Q4 2026**:
- Migrate to Redis rate limiting
- Add PostgreSQL & ORM (Prisma)
- Implement advanced admin features

**2027+**:
- Advanced analytics
- ATS features
- Internal knowledge base

---

## 14. Architecture Decisions & Trade-offs

### 14.1 Key Decisions

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| **SSG for public pages** | Fast, secure, cacheable | Content updates require rebuild + redeploy |
| **In-memory rate limiter** | Simple, no external service | Only works single-instance; not scalable |
| **Resend for email** | Reliable, easy API, good DX | Cost per email (minimal) |
| **DigitalOcean Spaces** | S3-compatible, affordable | Vendor lock-in (manageable) |
| **reCAPTCHA v3** | Invisible, better UX | Privacy concerns (can address with opt-out) |
| **Next.js App Router** | Modern, TypeScript native, SEO | Smaller community than Pages Router (improving) |

### 14.2 Alternative Approaches Considered

**Email**:
- ❌ SendGrid: Overkill for v1; more complex API
- ❌ AWS SES: Lower cost but higher setup complexity
- ✅ Resend: Good balance of features + DX

**File Storage**:
- ❌ AWS S3: More expensive; needs IAM setup
- ❌ Google Cloud Storage: Overkill
- ✅ DigitalOcean Spaces: Cost-effective, S3-compatible

**Rate Limiting**:
- ❌ Cloudflare Workers: Overkill for v1
- ✅ In-memory: Simple, suitable for single-instance
- 🔄 Redis: Phase 1 upgrade

---

## 15. Glossary & References

| Term | Definition |
|------|-----------|
| **SSG** | Static Site Generation (build-time rendering) |
| **Vercel** | Next.js native hosting platform (serverless) |
| **Resend** | Email service API provider |
| **DigitalOcean Spaces** | S3-compatible object storage (like AWS S3) |
| **reCAPTCHA v3** | Google bot detection service (invisible, score-based) |
| **Rate Limiting** | Restricting requests to prevent abuse |
| **API Route** | Next.js serverless function handler (`/api/*`) |
| **Middleware** | Intercepts requests/responses (auth, logging, etc.) |
| **E2E Testing** | End-to-end user workflow testing (Playwright, Cypress) |

---

## 16. Appendix

### 16.1 Project File Structure

```
trustedjurist/
├── .github/workflows/         # CI/CD pipeline
├── src/
│   ├── app/                   # Next.js App Router (pages + API)
│   ├── components/            # React components
│   ├── lib/                   # Utility functions, services
│   ├── styles/                # Global CSS
│   └── types/                 # TypeScript interfaces
├── public/                    # Static assets
├── db/                        # Database migrations (future)
├── tests/                     # Test files
├── .env.example               # Environment template
├── .eslintrc.json             # ESLint config
├── tsconfig.json              # TypeScript config
├── next.config.js             # Next.js config
├── package.json               # Dependencies
├── README.md                  # Project documentation
└── docs/                      # Additional documentation
    ├── PRD.md
    ├── SRS.md
    ├── SDD.md
    ├── API.md
    └── DEPLOYMENT.md
```

### 16.2 Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "unifiedjs.vscode-mdx",
    "prisma.prisma",
    "GitHub.copilot"
  ]
}
```

### 16.3 Development Commands

```bash
# Setup
npm install
cp .env.example .env.local

# Development
npm run dev                    # Start dev server
npm run build                  # Production build
npm run start                  # Start prod server
npm run lint                   # Run ESLint
npm test                       # Run tests
npm run test:watch            # Watch mode

# Deployment
npm run build && npm run start # Local prod test
```

---

**Document Status**: ✅ **READY FOR IMPLEMENTATION**

**Last Updated**: 8 Juli 2026  
**Architecture Owner**: DN Tech Engineering Lead  
**Reviewed By**: Technical Steering Committee


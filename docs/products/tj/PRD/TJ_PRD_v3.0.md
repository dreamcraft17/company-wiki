# Product Requirements Document (PRD) v3.0

**Trusted Jurist Law Firm — Company Profile & Recruitment Platform**

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Proyek** | Trusted Jurist (TJ) |
| **Versi PRD** | 3.0 |
| **Versi Aplikasi Target** | 1.0 (Production) |
| **Owner (DN Tech)** | Product & Engineering Lead |
| **Client** | Trusted Jurist Law Firm |
| **Tanggal Dokumen** | 8 Juli 2026 |
| **Target Launch** | Q3 2026 (8 minggu) |
| **Status** | Go-Live Readiness → Production |

---

## 1. Executive Summary

Trusted Jurist adalah firma hukum terkemuka Jakarta Timur yang membutuhkan platform digital untuk meningkatkan kredibilitas, visibilitas, dan efisiensi rekrutmen. Proyek ini mengembangkan website company profile yang profesional dan recruitment module yang terintegrasi, user-centric, dan production-ready.

Berdasarkan fase v0.2.0 (proof-of-concept), v1.0 production-ready memprioritaskan:

- **Completion Blockers**: nomor kontak resmi, environment variables production, data founder lengkap
- **Core Features**: 7 halaman publik, contact form backend, recruitment module (job listings + CV upload)
- **Quality Assurance**: testing menyeluruh, performance optimization, security audit
- **Scalability**: Redis rate-limiting, analytics hooks, CI/CD pipeline

**Success Metrics**: 
- ≥5 qualified leads/week
- ≥3 job applications/week
- <2s page load (desktop), <3s (mobile)
- ≥99.5% uptime

---

## 2. Goals & Objectives

### 2.1 Business Goals

1. **Establish Digital Presence**: firma hukum modern, kredibel, mudah ditemukan di search
2. **Attract Talent**: recruitment module untuk Fullstack Engineer & Software Engineer positions
3. **Generate Qualified Leads**: form konsultasi + email notifications untuk manajemen leads
4. **Showcase Expertise**: 8 practice areas, team credentials, thought leadership (insights)
5. **Enhance Client Trust**: transparent team structure, operational standards, privacy commitment

### 2.2 User Goals

| User Segment | Primary Goals |
|--------------|--------------|
| **Prospective Clients** | Find legal expertise, understand practice areas, submit consultation requests |
| **Job Applicants** | Discover open positions, apply online, upload CV, track application status |
| **Firm Stakeholders** | Manage leads & applicants, publish job postings, view reports |
| **Search Engines** | Index site content for discovery by target audience |

### 2.3 Success Metrics (v1.0)

| Metric | Target | Measurement |
|--------|--------|------------|
| **Lead Volume** | ≥5 qualified/week | Form submission tracking |
| **Job Applications** | ≥3/week within 3mo | Admin dashboard counter |
| **Page Performance** | <2s (desktop), <3s (mobile) | PageSpeed Insights ≥85/100 (D), ≥70/100 (M) |
| **SEO Ranking** | Top-3 untuk "firma hukum Jakarta" | 6mo post-launch |
| **Uptime** | ≥99.5% | Monitoring service (Uptime Robot) |
| **Security** | Zero critical vulnerabilities | Monthly audit |

---

## 3. Target Audience

### 3.1 Prospective Clients

**Profile**: Corporate entities, individuals, government agencies seeking legal services  
**Needs**: Understand practice areas, find right expertise, submit consultation easily, direct contact channels  
**Behaviors**: Search "firma hukum [specialization]", browse practice areas, fill contact form  
**Devices**: 60% desktop, 40% mobile

### 3.2 Job Applicants

**Profile**: Mid-senior Fullstack Engineers & Software Engineers (Indonesia + regional)  
**Needs**: Explore company, understand role, apply online, upload CV, receive confirmation  
**Behaviors**: Discover via LinkedIn, tech job boards, Google; expect fast, mobile-friendly application  
**Devices**: 45% desktop, 55% mobile

### 3.3 Firm Stakeholders

**Profile**: Managing partner, HR, team members, external consultants  
**Needs**: Manage leads/applicants, update job postings, view performance metrics  
**Behaviors**: Daily/weekly dashboard login, bulk actions (filter, export)  
**Access Level**: Restricted (authentication required)

### 3.4 Search Engines & Crawlers

**Profile**: Google, Bing, LinkedIn bot, Open Graph parsers  
**Needs**: Structured data, fast crawl time, fresh sitemap, robots.txt guidance  
**Behaviors**: Index public pages, cache metadata, social preview rendering  

---

## 4. Scope & Phasing

### 4.1 MVP (v1.0) — Go-Live Scope

#### 4.1.1 Public Pages (7)

- **Homepage (`/`)**: 8 section editorial (hero → closing), trust indicators, dual CTA
- **About (`/about`)**: Vision, mission, 5 core values, operational commitments
- **Practice Areas (`/practice-areas`)**: 8 practice areas with scope, client outcomes, deep links
- **Team (`/team`)**: Managing Partner bio, team structure (slots for future hires)
- **Insights (`/insights`)**: 3 thought leadership articles (status: draf/coming-soon)
- **Contact (`/contact`)**: Varian forms (consultation), direct contact channels, privacy consent
- **Privacy (`/privacy`)**: UU PDP compliant, data handling, user rights

#### 4.1.2 Recruitment Module

- **Job Listings**: Fullstack Engineer, Software Engineer (admin-managed, dynamic)
- **Application Form**: name, email, phone, CV upload (required), cover letter (optional)
- **CV Storage**: DigitalOcean Spaces; max 5MB; PDF/DOCX only; virus scan
- **Email Notifications**: Applicant confirmation + admin alert
- **Admin Dashboard**: view/filter applicants, download CVs, status management (new→review→offer/reject)

#### 4.1.3 Backend & Integration

- **Contact Form API**: validation, reCAPTCHA v3, rate-limiting, Resend email
- **Job Application API**: CV upload, metadata extraction, notification pipeline
- **Email Provider**: Resend (user confirmations, admin alerts)
- **File Storage**: DigitalOcean Spaces (S3-compatible API)
- **Security**: env vars, input validation, HTML escaping, HTTPS + HSTS

#### 4.1.4 SEO & Metadata

- **On-Page**: unique title, description, canonical per page
- **Structured Data**: JSON-LD (LegalService, LocalBusiness, JobPosting)
- **Sitemaps**: `/sitemap.xml` (all public pages + job listings)
- **Robots & Crawling**: `/robots.txt` (allow `/`, disallow `/api/`, `/admin/`)
- **Open Graph**: OG image (1200×630), Twitter Card, hreflang-ready
- **Analytics Hooks**: GA4 snippet + Plausible integration points (pre-implementation)

#### 4.1.5 Admin Panel (v1 Minimal)

- **Leads Management**: list, filter (date, subject), view details, email reply, bulk export
- **Job Applicants**: list, filter (job, status), view/download CV, change status
- **Job Postings**: simple CRUD (create, edit, publish, disable)
- **Basic Analytics**: form submissions/mo, applicants/job/mo, status distribution
- **Auth**: manual login (single account for v1)
- **Audit**: view action logs (admin access, status changes)

### 4.2 Phase 1+ (Post-Launch, Prioritized)

| Feature | Priority | Rationale |
|---------|----------|-----------|
| Google Maps embed | P1 | Client visibility, SEO boost |
| Insights detail pages | P2 | Blog-style rendering, backlink strategy |
| English language (i18n) | P2 | Field `*En` ready; expand market reach |
| Redis rate-limiting | P2 | Multi-instance deployment; replace in-memory |
| Enhanced admin | P2 | Team management, advanced filtering, export |
| Analytics dashboard | P2 | Plausible/GA4 integration, deeper insights |
| Email templates | P2 | Customizable notifications, branding |
| Applicant tracking system (ATS) | P3 | Interview scheduling, offer letters |
| Internal knowledge base | P3 | Documentation, onboarding |

### 4.3 Out of Scope (v1.0)

- Client portal / case management system
- Internal document collaboration tools
- Advanced legal workflow automation
- Billing & invoicing
- Mobile native apps (web-responsive only)
- Multi-language support (English phase 1)
- Advanced admin (SSO, fine-grained roles, audit)
- API for 3rd-party integrations

---

## 5. Features & Detailed Requirements

### 5.1 Company Profile (Public)

#### 5.1.1 Homepage (`/`)

**Sections**:
1. **Hero**: headline, subheadline, trust indicators (founded date, team size, focus), dual CTA (Konsultasi, Explore)
2. **Trust Colophon**: 4 pillars (established, located, focused, approach)
3. **Credibility Chapter**: 3 reasons to trust (experience, standards, commitment)
4. **About Preview**: snippet from `/about` with "Learn More" CTA
5. **Practice Index**: 4 of 8 practice areas with brief descriptions
6. **Founder Chapter**: Managing Partner bio, credentials, focus areas
7. **Standards Cascade**: operational commitment, quality standards, client outcomes
8. **Insights Preview**: 3 latest articles with category tags & read time estimates
9. **Closing Composition**: final CTA + email capture (optional)

**Design**: 
- Tone: professional, accessible, editorial
- Animations: reveal-on-scroll, stagger, smooth transitions (Framer Motion)
- Responsive: mobile-first, adapt at sm/md/lg breakpoints
- Performance: lazy-loaded images, defer offscreen content

#### 5.1.2 About (`/about`)

**Sections**:
1. **Hero**: "Tentang Trusted Jurist", brief tagline
2. **Profile Editorial**: vision (2–3 paragraphs), mission, organizational narrative
3. **Trust Commitments**: 5 operational commitments (transparency, quality, ethics, innovation, growth)
4. **Value Cards**: 5 core values (integrity, expertise, collaboration, innovation, client-focus) with icons & short descriptions
5. **CTA Section**: "Mulai Konsultasi" button linking to `/contact`

**Requirements**:
- Tone: narrative-driven, not bullet-point heavy
- Length: 1200–1500 words total (scannable sections)
- Founder: Dr. Andin Sofyanoor credentials + educational background (placeholder for university name)

#### 5.1.3 Practice Areas (`/practice-areas`)

**Eight Practice Areas**:
1. Litigation & Dispute Resolution
2. Anti-Corruption & Governance
3. Corporate & Commercial Law
4. Mining, Plantation & Natural Resources
5. Criminal Law & Investigation Support
6. Public Policy & Regulatory Advisory
7. Customs, Smuggling & Compliance
8. Legal Opinion & Strategic Advisory

**Per-Practice Card Content**:
- Title & icon (Lucide React)
- Scope: 2–3 key areas of expertise
- Client Needs: typical scenarios (corporate, individual, government)
- Deliverables: outcomes (opinions, contracts, strategies, litigation)
- Deep link: `#practice-slug` for anchored navigation

**Interactive**:
- Hover effects, subtle animations
- CTA "Konsultasi untuk [practice area]" pre-fills form subject
- Mobile: card layout, tap to expand

#### 5.1.4 Team (`/team`)

**Sections**:
1. **Managing Partner Card**:
   - Photo (placeholder for now)
   - Name: Dr. Andin Sofyanoor, SH., MH.
   - Title, focus areas, bio (2 paragraphs)
   - Credentials: education (university TBD), bar admission, years in practice
   - Experience highlights: key cases, positions held

2. **Team Slots** (3 roles, empty for now):
   - Partner (1 slot)
   - Senior Associate (1 slot)
   - Associate (1 slot)
   - Placeholder text: "Bergabung dengan tim kami"

3. **Call to Action**: "Lihat Lowongan" (→ `/careers`) or "Hubungi Kami"

**Future Expansion** (Phase 1): Add team member photos, bios, social links.

#### 5.1.5 Insights (`/insights`)

**Initial Content** (3 articles):
| Title | Category | Status | Read Time |
|-------|----------|--------|-----------|
| Membangun Kepercayaan Publik terhadap Penegakan Hukum | Hukum Publik | Editorial Draft | 8 min |
| Peran Advokat dalam Agenda Antikorupsi | Antikorupsi | Editorial Draft | 6 min |
| Kepatuhan Hukum di Sektor Pertambangan dan Perkebunan | Sektor Regulasi | Coming Soon | — |

**Listing Page** (`/insights`):
- Grid/list of articles with excerpt, category tag, publish date, read time
- Status badges: "Draft", "Coming Soon"
- Metadata: "Konten sedang dalam penyusunan"
- CTA: "Subscribe untuk artikel terbaru" (email capture, phase 1)

**Detail Page** (`/insights/[slug]`):
- **Status**: P2 (phase 1)
- Full article rendering with byline, publish date, table of contents
- Related articles (similar category)
- CTA: "Konsultasi untuk topik ini"
- Share buttons (LinkedIn, Twitter)

#### 5.1.6 Contact (`/contact`)

**Two Form Variants**:

1. **Consultation Form** (default, main page):
   - Fields: name, email, phone (optional), practice area (dropdown), message
   - Consent: checkbox + link to `/privacy`
   - Privacy disclaimer: "Hubungan advokat-klien belum terbentuk sebelum perjanjian"
   - Submit: "Kirim Konsultasi"

2. **Career Inquiry Form** (accessible from `/careers`):
   - Fields: name, email, phone, position (dropdown), CV attachment, cover letter (optional)
   - Consent + privacy link
   - Submit: "Kirim Lamaran"

**Direct Channels**:
- **Email**: `konsultasi@trustedjurist.co.id`
- **Phone**: `+62 21 [FINAL NUMBER]` (P0 blocker)
- **WhatsApp**: `https://wa.me/628[FINAL NUMBER]` (P0 blocker)
- **Office Hours**: Senin–Jumat, 08:00–17:00 WIB

**Privacy Notice**:
- Prominent link to `/privacy` policy
- Legal disclaimer (English-style notice)
- Data retention statement (leads 12mo, then purge)

#### 5.1.7 Privacy (`/privacy`)

**Sections**:
1. **Intro**: Trusted Jurist commitment to data protection
2. **Data Collected**: explicit list (name, email, phone, message, CV file, IP address)
3. **How We Use It**: lead management, recruitment, service delivery, legal compliance
4. **Data Security**: encryption at rest/transit, access controls, regular audits
5. **Your Rights** (UU PDP): access, correction, deletion, objection
6. **Cookies & Tracking**: only functional; GA4 optional disclosure
7. **Third-Party Services**: Resend, reCAPTCHA, DigitalOcean (data subprocessors)
8. **Retention Policy**: leads 12mo, applicant CVs 24mo, logs 3mo
9. **Contact**: `konsultasi@trustedjurist.co.id` for privacy inquiries
10. **Last Updated**: timestamp, version number

**Compliance**:
- UU PDP (Undang-Undang Perlindungan Data Pribadi) aligned
- GDPR-friendly (for international applicants)
- Clear, non-legalese language (Bahasa Indonesia primary)

---

### 5.2 Recruitment Module (New in v1.0)

#### 5.2.1 Careers Page (`/careers`)

**Sections**:
1. **Hero**: "Bergabung dengan Trusted Jurist", company culture snippet
2. **Open Positions**: grid/list of job postings with:
   - Title, level (e.g., "Mid-Senior")
   - Department (if applicable)
   - Brief description (1–2 lines)
   - "Apply" button → form

3. **About Working Here**: 3–4 highlights (culture, growth, tools, team)
4. **Application Process**: 4-step flow (apply → review → interview → offer)

#### 5.2.2 Job Posting

**Fields** (admin-editable):
- Title (required)
- Level (Junior, Mid, Senior, Lead)
- Department (optional)
- Location: "Jakarta Timur" (static for v1)
- Description (rich text, 500–2000 words)
- Key Responsibilities (bullet list)
- Required Skills (bullet list)
- Nice-to-Have (optional)
- Compensation Range (optional, e.g., "Kompetitif")
- Benefits (bullet list)
- Application Deadline (optional; default: no deadline)
- Status: Draft / Published / Closed

**Initial Postings** (v1):
1. Fullstack Engineer (Node.js/Next.js focus)
2. Software Engineer (TypeScript, databases)

#### 5.2.3 Application Form

**Fields**:
1. **Personal Info**:
   - Full Name (required)
   - Email (required, validated)
   - Phone (required, Indonesia format validation)
   - LinkedIn Profile URL (optional)

2. **Application**:
   - Position Applied For (required, pre-filled from job listing)
   - CV/Resume File (required, PDF/DOCX, max 5MB)
   - Cover Letter (optional, text or file)
   - Availability (dropdown: "2 weeks", "1 month", "ASAP")

3. **Consent**:
   - Checkbox: "I agree to privacy policy & data retention terms"
   - Link to `/privacy`

**Submission**:
- Client-side validation (format, file size)
- Server-side validation (file type, virus scan via VirusTotal API or similar)
- Success state: "Terima kasih! Kami akan menghubungi Anda dalam 7 hari."
- Error state: clear messaging

#### 5.2.4 File Upload (CV/Resume)

**Requirements**:
- **Format**: PDF, DOCX only
- **Max Size**: 5MB
- **Storage**: DigitalOcean Spaces (S3-compatible)
- **Naming**: `{applicantId}_{timestamp}_{originalFilename}` (avoid collisions)
- **Access**: encrypted URL, linked in admin dashboard, 24mo retention then auto-purge
- **Virus Scanning**: optional (phase 1); external API call for security

**Failure Scenarios**:
- File too large → "File exceeds 5MB. Please compress or use another format."
- Invalid format → "Only PDF and DOCX files accepted."
- Upload timeout → "Network error. Please retry."

---

### 5.3 Contact & Lead Management

#### 5.3.1 Contact Form API (`POST /api/contact`)

**Endpoint**: `https://trustedjurist.co.id/api/contact`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+6281234567890",
  "subject": "Litigasi",
  "message": "Kami memiliki dispute dengan supplier...",
  "recaptchaToken": "03AOLTBLQwIIzJ...",
  "formVariant": "consultation"
}
```

**Response (Success 200)**:
```json
{
  "success": true,
  "message": "Terima kasih. Kami akan menghubungi Anda dalam 24 jam."
}
```

**Response (Error 400/429/500)**:
```json
{
  "success": false,
  "error": "Email tidak valid" | "Terlalu banyak request. Coba lagi dalam 1 menit." | "Server error"
}
```

**Pipeline**:
1. Client submits form + reCAPTCHA token (browser)
2. POST `/api/contact` + rate-limit check (5 req/min/IP)
3. Validate input (name, email format, subject, message length)
4. Verify reCAPTCHA (score ≥ 0.5; score <0.5 → reject as suspected bot)
5. Send email confirmations (user + admin)
6. Store lead in database (future: migration to PostgreSQL)
7. Return success/error to client

#### 5.3.2 Email Notifications

**To User (Confirmation)**:
- Template: branded, warm tone
- Content: thank you, what to expect, link to privacy policy
- From: `Trusted Jurist <noreply@trustedjurist.co.id>`
- Provider: Resend

**To Admin (Lead Alert)**:
- Template: structured, actionable
- Content: full lead details (name, email, phone, subject, message, timestamp)
- From: `Trusted Jurist <noreply@trustedjurist.co.id>`
- To: `admin@trustedjurist.co.id` (env: `ADMIN_EMAIL`)
- replyTo: `{applicant.email}` (admin clicks Reply → sends to applicant directly)
- Provider: Resend

#### 5.3.3 Admin Lead Dashboard (v1 Minimal)

**Views**:
1. **Leads List**:
   - Columns: Date, Name, Email, Subject, Status (new/viewed/contacted/archived)
   - Filter: date range, subject, status
   - Sort: newest first
   - Bulk actions: mark as viewed, archive, export CSV

2. **Lead Detail**:
   - Full message, contact info
   - Action: mark as contacted, change status
   - Reply: pre-filled email draft to applicant

3. **Analytics**:
   - This week/month: total submissions, by subject
   - Response rate (contacted / total)

**Access**: admin login only, no public exposure

---

### 5.4 Job Application Management

#### 5.4.1 Admin Applicant Dashboard

**Views**:
1. **Applicants List**:
   - Columns: Date Applied, Name, Position, Status (new/review/interview/offer/reject), Phone
   - Filter: position, status, date range
   - Sort: newest first
   - Bulk actions: change status, download all CVs, send email

2. **Applicant Detail**:
   - Name, email, phone, LinkedIn URL
   - Position applied, date applied, availability
   - CV preview (embed or download link)
   - Cover letter (if provided)
   - Status history (audit trail)
   - Action: change status, send email, download CV, delete record

3. **Position-Wise Analytics**:
   - Fullstack Engineer: X total applications, Y new, Z contacted
   - Software Engineer: similar breakdown

**Status Workflow**:
- `new` → `review` → `interview` → `offer` / `reject`
- Status changes trigger optional email notification (phase 1)

#### 5.4.2 Job Posting Admin CRUD

**Create Job**:
- Form: title, level, department, location, description (rich text), responsibilities, skills, benefits, deadline
- Draft/Publish toggle
- Save as template (phase 1)

**Edit Job**:
- Modify fields, republish
- View applicant count per job

**Publish Job**:
- Job appears on `/careers` listing
- JSON-LD JobPosting generated
- Job appears in `/sitemap.xml`

**Close Job**:
- Job no longer accepts applications
- Archived, queryable by admin

---

### 5.5 Security & Data Privacy

#### 5.5.1 Input Validation & Sanitization

| Field | Validation | Sanitization |
|-------|-----------|--------------|
| Email | RFC 5322 format | none (read-only) |
| Phone | Indonesia format or E.164 | trim, normalize |
| Name | 2–100 chars, no control chars | trim, escape HTML |
| Message | max 5000 chars | trim, escape HTML, strip scripts |
| Subject | dropdown or predefined | none (server-side enum) |
| File (CV) | MIME type, size <5MB | none (binary, scan separately) |

**Server-Side Escape**: All user-provided text in email templates is HTML-escaped to prevent XSS in email clients.

#### 5.5.2 Rate Limiting

- **Limit**: 5 form submissions per minute per IP
- **Implementation** (v1): in-memory counter (suitable for single-instance)
- **Storage** (phase 1): Redis for multi-instance deployments
- **Reset**: sliding window, 1-minute TTL
- **Response**: HTTP 429 if exceeded, with `Retry-After: 60` header

#### 5.5.3 reCAPTCHA v3 Integration

- **Score Threshold**: ≥0.5 (0=bot, 1=human)
- **Action Labels**: "contact_form", "job_apply"
- **Implementation**: 
  - Client-side: inject reCAPTCHA script, call `grecaptcha.execute()`, append token to form
  - Server-side: verify token + score in `/api/contact` & `/api/apply`
  - If score <0.5 or verification fails: reject submission
  - **Dev fallback**: If secret key empty, skip verification and allow submission (console warning)

#### 5.5.4 Environment Variables (No Secrets in Code)

**Required (Production)**:
```
RESEND_API_KEY=re_xxxxxx
RESEND_FROM_EMAIL=Trusted Jurist <noreply@trustedjurist.co.id>
ADMIN_EMAIL=admin@trustedjurist.co.id
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc3...
RECAPTCHA_SECRET_KEY=6Lc3...
```

**Optional (Production)**:
```
DO_SPACES_KEY=xxxxx
DO_SPACES_SECRET=xxxxx
DO_SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
CV_BUCKET_NAME=trustedjurist-cvs
VIRUS_SCAN_API_KEY=xxxxx (VirusTotal, for phase 1)
```

**Development**: .env.local can use placeholder values; app degrades gracefully (console logs, form success without email).

#### 5.5.5 Data Retention & Deletion

| Data Type | Retention | Deletion Method |
|-----------|-----------|-----------------|
| Contact Leads | 12 months | Manual admin or auto-purge script |
| Applicant CVs | 24 months | Auto-purge script, DigitalOcean Spaces delete |
| Application Records | 24 months | Database delete (keep email record for reference) |
| Server Logs | 3 months | Log rotation, auto-archive |
| User IP (rate-limit) | 1 minute | Auto-expire (in-memory) |

**User Deletion Request** (phase 1):
- Email to privacy@trustedjurist.co.id with proof of identity
- Manual data purge within 30 days
- Confirmation email sent

---

### 5.6 SEO & Discoverability

#### 5.6.1 On-Page Metadata

**Per-Page Requirements**:
- Unique `<title>` (40–60 chars, primary keyword first)
- Unique `<meta name="description">` (120–160 chars, compelling)
- `<link rel="canonical">` (self-referential for main page)
- `<meta property="og:title">`, `og:description>`, `og:image>`, `og:url>`
- `<meta name="twitter:card">` value: `summary_large_image`

**Example**:
```html
<title>Firma Hukum Jakarta | Trusted Jurist Law Firm</title>
<meta name="description" content="Firma hukum terkemuka Jakarta menyediakan layanan litigasi, advokasi antikorupsi, corporate law, dan layanan konsultasi strategis.">
<link rel="canonical" href="https://trustedjurist.co.id">
<meta property="og:title" content="Trusted Jurist Law Firm — Firma Hukum Terpercaya">
<meta property="og:image" content="https://trustedjurist.co.id/og-image.jpg">
```

#### 5.6.2 Structured Data (JSON-LD)

**Organization Schema** (in root layout):
```json
{
  "@context": "https://schema.org",
  "@type": "LegalService",
  "name": "Trusted Jurist Law Firm",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Jl. Sunter Agung Raya",
    "addressLocality": "Jakarta Timur",
    "postalCode": "14350",
    "addressCountry": "ID"
  },
  "telephone": "+62 21 XXXXXX",
  "email": "konsultasi@trustedjurist.co.id",
  "url": "https://trustedjurist.co.id",
  "areaServed": "ID",
  "priceRange": "Custom consultation required"
}
```

**JobPosting Schema** (per job listing):
```json
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "Fullstack Engineer",
  "description": "...",
  "hiringOrganization": "Trusted Jurist Law Firm",
  "jobLocation": {
    "@type": "Place",
    "address": "Jakarta Timur, ID"
  },
  "employmentType": "FULL_TIME",
  "baseSalary": {
    "@type": "PriceSpecification",
    "priceCurrency": "IDR",
    "price": "[range]"
  },
  "datePosted": "2026-07-08"
}
```

#### 5.6.3 Sitemap & Robots

**Sitemap** (`/sitemap.xml`):
- All public pages (home, about, practice-areas, team, insights, contact, privacy)
- All active job postings (updates weekly)
- `lastmod`, `changefreq`, `priority` attributes per page

**Robots** (`/robots.txt`):
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Sitemap: https://trustedjurist.co.id/sitemap.xml
```

#### 5.6.4 Dynamic OG Image & Favicon

- **OG Image** (`/opengraph-image`): 1200×630px, branded, content-specific (dynamic per page, phase 1)
- **Favicon** (`/icon`): 32×32px, firm logo

#### 5.6.5 Analytics Hooks (Pre-Integration)

- **GA4 Script**: Ready for Google Analytics 4 (code snippet in layout, disabled by default)
- **Plausible**: Ready for privacy-friendly analytics (custom domain setup in phase 1)
- **Form Tracking**: `gtag.event('form_submit', {...})` on success
- **Link Tracking**: `gtag.event('outbound', {...})` on external link clicks

---

### 5.7 Performance & Quality

#### 5.7.1 Performance Targets

| Metric | Target | Tools |
|--------|--------|-------|
| **LCP** (Largest Contentful Paint) | <2.0s desktop, <2.5s mobile | lighthouse, Chrome DevTools |
| **FID** (First Input Delay) | <100ms | Web Vitals |
| **CLS** (Cumulative Layout Shift) | <0.1 | Web Vitals |
| **Overall PageSpeed** | ≥85 (desktop), ≥70 (mobile) | PageSpeed Insights |
| **Time to First Byte (TTFB)** | <600ms | WebPageTest |
| **Total Bundle Size** | <100KB JS (gzipped) | Webpack Bundle Analyzer |

#### 5.7.2 Accessibility (WCAG 2.1 AA)

- Semantic HTML (`<main>`, `<nav>`, `<article>`, roles)
- ARIA labels for interactive elements
- Color contrast ≥4.5:1 (text), ≥3:1 (large text)
- Keyboard navigation (Tab, Enter, Esc)
- Skip link ("Lewati ke konten utama")
- Form validation feedback (real-time, `role="alert"`)
- `prefers-reduced-motion` CSS query respected
- Alt text for all images

#### 5.7.3 Browser & Device Support

| Platform | Minimum |
|----------|---------|
| Desktop Browsers | Chrome 120+, Firefox 121+, Safari 17+, Edge 120+ |
| Mobile Browsers | iOS Safari 16+, Chrome Android 120+ |
| Devices | iPhone 12+, Samsung Galaxy S20+ (or equivalent) |
| Screen Sizes | 320px (mobile) → 1920px (desktop) |

#### 5.7.4 Testing Strategy

| Test Type | Scope | Frequency |
|-----------|-------|-----------|
| **Unit Tests** | Utility functions, validators, form logic | Per commit |
| **Integration Tests** | API routes, email pipeline, file upload | Per PR |
| **E2E Tests** | User flows (contact form, job apply) | Per release |
| **Manual QA** | All pages, forms, mobile, accessibility | Before staging |
| **Security Audit** | OWASP Top 10, dependency scan | Monthly |
| **Performance Audit** | Lighthouse, Core Web Vitals | Monthly |

---

## 6. Technical Stack & Architecture

### 6.1 Confirmed Stack (v0.2.0 baseline)

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router) | 16.2.6 |
| **UI Runtime** | React | 19.2.4 |
| **Language** | TypeScript | 5.x (strict) |
| **Styling** | Tailwind CSS | v4 |
| **CSS Processing** | @tailwindcss/postcss | v4 |
| **Animation** | Framer Motion | 12.38 |
| **Icons** | Lucide React | 1.16 |
| **Utility** | clsx + tailwind-merge | 2.x / 3.x |
| **Fonts** | Cormorant Garamond + Manrope | Google Fonts |
| **Email Service** | Resend | 6.12 |
| **File Storage** | DigitalOcean Spaces | S3 API |
| **Security** | Google reCAPTCHA v3 | v3 |
| **Rate Limiting** | In-memory (v1) | built-in |
| **Lint** | ESLint | 9 + eslint-config-next 16.2.6 |

### 6.2 Planned Infrastructure

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Hosting** | Vercel (Next.js native) or DigitalOcean App Platform | serverless, auto-scaling, built-in CI/CD |
| **Database** (future admin) | PostgreSQL | structured data, querying for leads/applicants |
| **Rate Limiting** (phase 1) | Redis | distributed, multi-instance support |
| **CDN** | Cloudflare | edge caching, DDoS protection, SSL |
| **Monitoring** | Uptime Robot + Sentry | uptime & error tracking |
| **Logs** | Vercel built-in or LogRocket | error tracking & session replay |

### 6.3 Deployment Pipeline

```
Code → GitHub Push
  ↓
GitHub Actions (lint, build test)
  ↓
Staging Deploy (Vercel preview URL)
  ↓
Manual QA + Client Preview
  ↓
Production Deploy (trustedjurist.co.id)
  ↓
Smoke Tests + Monitoring
```

---

## 7. Admin Panel Specification

### 7.1 v1.0 Minimal Requirements

**Dashboard Overview**:
- Login screen (email + password, basic security)
- Main dashboard: quick stats (new leads, new applicants, form submissions this week)
- Three main sections: Leads, Applicants, Job Postings

**Leads Management**:
- List all contact form submissions with columns: date, name, email, subject, status
- Filter: date range, subject, status (new/viewed/contacted/archived)
- View detail: full message, contact info, action buttons (mark contacted, archive, delete, reply)
- Export: CSV export of filtered leads
- Email reply: pre-filled draft to send via Resend

**Applicants Management**:
- List applications with columns: date applied, name, position, status, phone
- Filter: position, status, date range
- View detail: full application info, CV download link, change status (new→review→interview→offer/reject)
- Bulk actions: change status for multiple, download all CVs, send email
- Audit trail: who changed status and when

**Job Postings**:
- List active job postings with applicant count
- Create new job (form: title, level, description, skills, benefits, deadline)
- Edit existing job
- Publish/draft toggle
- View analytics: total applications, status breakdown per job

**Basic Analytics**:
- This week/month: form submissions by day
- Applicants: total, by job, by status
- Response rate: contacted / total leads
- Charts (simple line/bar graphs)

**Settings** (phase 1):
- Email notifications toggle
- Data retention policy view
- Audit log view (limited, 30-day window)

### 7.2 v1+ Enhancements

- Team member management (add/remove team profiles, sync to homepage)
- Advanced filters & saved views
- Email template editor
- Interview scheduling integration (Calendly)
- Offer letter generator (template-based)
- Role-based access control (admin, HR, hiring manager)
- SSO (Google, Microsoft, future)
- Data export (PDF reports)
- API for 3rd-party integrations

---

## 8. Data Privacy & Compliance

### 8.1 UU PDP (Undang-Undang Perlindungan Data Pribadi)

**Applicability**: Contact form submissions + job applications classified as personal data.

**Obligations**:
1. **Transparency**: Clear privacy policy explaining data collection, use, retention
2. **Consent**: Explicit opt-in via checkbox before form submission
3. **Legitimate Purpose**: Only use data for stated purpose (lead follow-up, recruitment)
4. **Data Security**: Encrypt, access control, regular audits
5. **User Rights**: Implement deletion/export on request (phase 1)
6. **Data Protection Officer** (if >5 staff processing data): coordinate with DPO

### 8.2 Privacy Policy Framework

**Sections**:
1. **Data We Collect**: name, email, phone, message, CV, IP address, cookies
2. **How We Use It**: lead management, recruitment, service delivery, legal compliance
3. **Legal Basis**: legitimate business interest, consent
4. **Recipients**: internal team, Resend (email), DigitalOcean (storage), Cloudflare (CDN)
5. **Retention**: leads 12mo, CVs 24mo, logs 3mo
6. **Your Rights**: access, correction, deletion, objection (UU PDP §4-6)
7. **Cookies**: only functional (session); GA4 optional
8. **Changes**: version + last updated date
9. **Contact**: privacy@trustedjurist.co.id

### 8.3 Data Subprocessors (Transparency)

| Service | Purpose | Data Processed |
|---------|---------|-----------------|
| Resend | Email delivery | Name, email, message content |
| DigitalOcean Spaces | CV file storage | CV file, metadata |
| Cloudflare | CDN + security | IP address, access logs |
| Google reCAPTCHA | Bot detection | IP, click patterns, form interactions |
| Plausible (if added) | Analytics | Anonymized visit data (no PII) |

---

## 9. Success Criteria & Acceptance

### 9.1 Go-Live Checklist (Blocking Items)

- [x] All 7 public pages functional + tested
- [x] Contact form backend working (Resend integration)
- [x] Job listings + application form implemented
- [ ] P0 blockers resolved:
  - [ ] Contact phone number + WhatsApp confirmed by client
  - [ ] Environment variables populated (Resend keys, reCAPTCHA keys)
  - [ ] Founder education details finalized
- [x] Admin panel accessible (leads, applicants, job CRUD)
- [x] Privacy policy published
- [x] SEO: sitemap, robots.txt, JSON-LD, OG images generated
- [ ] Performance: PageSpeed ≥85 (desktop), ≥70 (mobile)
- [ ] Security: SSL/TLS active, no console errors, dependency vulnerabilities <0 critical
- [ ] Testing: 0 P0/P1 bugs; manual QA on 3 device sizes
- [ ] Client sign-off: content review, functionality acceptance
- [ ] DNS cutover: production domain routing to hosting

### 9.2 Post-Launch Acceptance (30 days)

- Lead submission rate ≥5/week confirmed
- Job application rate ≥3/week (target: within 3 months)
- Page load time sustained <2s (desktop)
- Uptime maintained ≥99.5%
- No critical security issues detected
- Admin able to manage leads/applicants without escalation
- Email notifications functional (no spam/delivery issues)

### 9.3 Phase 1 Roadmap (Months 1–3 Post-Launch)

- Google Maps integration
- Insights detail pages (`/insights/[slug]`)
- English language (i18n switch)
- Redis rate-limiting
- Enhanced admin (team mgmt, filtering)
- Analytics dashboard (Plausible/GA4)
- Email template management
- Advanced reporting (PDF, email digest)

---

## 10. Timeline & Resource Plan

### 10.1 Go-Live Timeline (8 weeks)

| Week | Milestone | Owner | Deliverable |
|------|-----------|-------|------------|
| 1–2 | P0 Blockers + Content | Client + DN Tech | Contact info, env vars, founder data, photos |
| 2–3 | Recruitment Module | DN Tech | Job listing CRUD, application form, CV upload |
| 3–4 | Admin Panel v1 | DN Tech | Dashboard, leads/applicants mgmt, basic analytics |
| 4–5 | Testing & QA | DN Tech + Client | Bug fix, performance tuning, accessibility audit |
| 5–6 | Staging Deployment | DN Tech | Preview URL, client review, UAT |
| 6–7 | Security & Monitoring | DN Tech | SSL cert, monitoring setup, incident response plan |
| 7 | Production Go-Live | DN Tech + Client | DNS cutover, smoke tests, go-live comms |
| 8 | Post-Launch Monitoring | DN Tech | 24h support, issue triage, performance tracking |

### 10.2 Team & Roles

| Role | FTE | Duration | Responsibility |
|------|-----|----------|-----------------|
| **Product Manager** (DN Tech) | 0.5 | 8 weeks | Requirements, stakeholder comms, roadmap |
| **Fullstack Engineer** (DN Tech) | 1.0 | 8 weeks | Feature dev, API, admin panel, CI/CD |
| **Frontend Engineer** (DN Tech) | 1.0 | 8 weeks | UI/UX, page build, animations, testing |
| **QA Engineer** (DN Tech) | 0.5 | 4–8 weeks | Testing strategy, manual QA, bug reporting |
| **Client Liaison** (TJ) | 0.3 | 8 weeks | Content approval, feedback, sign-off |
| **IT Lead** (TJ) | 0.2 | 2 weeks | Env setup, DNS, email configuration |

### 10.3 Dependencies & Blockers

| Item | Dependency | Status | Owner |
|------|-----------|--------|-------|
| Contact Phone & WhatsApp | P0 Blocker | ⏳ Awaiting | TJ Admin |
| Env Production (Resend, reCAPTCHA) | P0 Blocker | ⏳ Awaiting | TJ IT |
| Founder Education Details | P1 Blocker | ⏳ Awaiting | TJ Admin |
| Team Photos (optional v1) | P2 | ⏳ Awaiting | TJ Communications |
| DNS Setup & SSL Cert | Infrastructure | ✅ Planned | DN Tech + TJ IT |

---

## 11. Risks & Mitigation

### 11.1 Risk Register

| Risk ID | Risk | Probability | Impact | Mitigation |
|---------|------|-------------|--------|-----------|
| R1 | Client content delays (contact, founder data) | High | Critical (launch blocker) | Weekly sync meetings, fallback placeholders (REVIEW markers), deadline-driven escalation |
| R2 | Admin panel scope creep | Medium | High (timeline slip) | Strict v1 scope, phase 1+ documentation, weekly scope reviews |
| R3 | Email deliverability issues (spam folder) | Medium | High (lead loss) | SPF/DKIM setup, monitoring bounce rate, warm-up emails, Resend support SLA |
| R4 | Security vulnerability in dependencies | Medium | High (data breach) | Monthly audit, automated scanning (Dependabot), staging environment security test |
| R5 | Performance degradation under traffic | Low | Medium (user experience) | Load testing before go-live, CDN caching, database indexing, scaling plan |
| R6 | Applicant CV file upload abuse | Low | Medium (storage cost, security) | File type validation, size limit, virus scan API, rate limiting per applicant |
| R7 | GDPR/UU PDP compliance gaps | Low | High (legal risk) | Legal review of privacy policy, documentation, user rights implementation (phase 1) |

### 11.2 Contingency Plan

- **If P0 blockers unresolved**: Launch with placeholder values (marked as REVIEW); patch within 1 week of launch
- **If admin panel incomplete**: Manage leads/applicants via email dashboard; upgrade admin in phase 1
- **If performance issues**: Prioritize lazy-loading, image optimization; defer animations; scale infrastructure
- **If security issue detected**: rollback to last stable, patch, re-test staging, then redeploy

---

## 12. Assumptions & Constraints

### 12.1 Assumptions

1. **Client Availability**: Weekly sync meetings; 48-hour turnaround on content/feedback
2. **Technology Stability**: No major Next.js/React version breaking changes during development
3. **Hosting**: DigitalOcean + Vercel infrastructure stable; no regional outages
4. **Traffic**: <1,000 unique visitors/month year 1; scales to 10k+/month in year 2 (infrastructure supports)
5. **Job Market**: Minimum 2 positions to recruit for; steady applicant flow from job boards
6. **Compliance**: UU PDP primary concern; GDPR compliance a bonus (not required)

### 12.2 Constraints

| Constraint | Impact | Mitigation |
|-----------|--------|-----------|
| **Budget Fixed** | No scope expansion post-approval | Phase 1+ requires separate SOW |
| **Timeline 8 weeks** | Aggressive but feasible with parallel work; no holidays/vacation assumed | Daily standups, clear blockers, escalation protocol |
| **Team 2–3 engineers** | Limited capacity for rework/refinement | Scope strictly v1 MVP, defer nice-to-haves to phase 1 |
| **Indonesia Timezone** | Async communication with distributed team | recorded meetings, async docs, 2-hour overlap window |
| **No on-premise server** | Depends on DigitalOcean + Vercel availability | SLA 99.5%, fallback to DNS failover |

---

## 13. Definition of Done

### 13.1 Feature Acceptance Criteria

✅ **Feature is done when**:
1. Code merged to `main` branch
2. Automated tests pass (unit + integration)
3. Manual QA sign-off (desktop + mobile)
4. Performance audit passed (Lighthouse ≥85/70)
5. Security review cleared (no new vulnerabilities)
6. Documentation updated (README, PR description)
7. Client preview reviewed (if public-facing)

### 13.2 Deployment Checklist

✅ **Before Production Deploy**:
- [ ] All PRs merged, no pending changes
- [ ] Staging environment smoke tests pass
- [ ] Client sign-off received in writing
- [ ] DNS records validated
- [ ] SSL certificate active
- [ ] Monitoring & alerting configured
- [ ] Rollback plan documented
- [ ] On-call engineer assigned (first 48h post-launch)

---

## 14. Appendix

### 14.1 Glossary

| Term | Definition |
|------|-----------|
| **MVP** | Minimum Viable Product; v1.0 go-live scope |
| **UU PDP** | Undang-Undang Perlindungan Data Pribadi (Indonesian Personal Data Protection Law) |
| **SEO** | Search Engine Optimization |
| **JSON-LD** | JSON for Linking Data; structured data format for search engines |
| **reCAPTCHA v3** | Google's invisible bot detection service (score-based) |
| **Resend** | API-first email service provider |
| **DigitalOcean Spaces** | S3-compatible object storage (like AWS S3) |
| **Cloudflare** | CDN + DDoS protection + SSL provider |
| **PageSpeed Insights** | Google tool measuring Core Web Vitals + performance |
| **Admin Panel** | Internal management interface (restricted to TJ staff) |
| **Applicant Tracking System (ATS)** | Software for managing job applications (phase 1+) |

### 14.2 Related Documents

This PRD should be read alongside:
- **SRS v3** (Software Requirements Specification): detailed functional & non-functional requirements
- **SDD v3** (Software Design Document): technical architecture, database schema, API contracts
- **Technical Stack & Database Schema**: ER diagram, migrations
- **Go-Live Checklist & Deployment Plan**: step-by-step launch procedure
- **Admin Panel User Guide**: internal docs for TJ team
- **Security & Compliance Audit Report**: penetration testing results, compliance mapping
- **Performance Baseline Report**: Lighthouse scores, load test results

### 14.3 Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jun 2025 | DN Tech | Initial PRD (v0.2.0 POC) |
| 2.0 | Jun 2026 | DN Tech | Updated roadmap, refined scope |
| **3.0** | **Jul 2026** | **DN Tech** | **Finalized for v1.0 production; recruitment module added** |

---

**Document Status**: ✅ **APPROVED FOR DEVELOPMENT** (requires P0 blocker resolution before go-live)

**Next Review**: Week 4 of development cycle (scope validation)

**Document Owner**: DN Tech Product Management  
**Last Updated**: 8 Juli 2026


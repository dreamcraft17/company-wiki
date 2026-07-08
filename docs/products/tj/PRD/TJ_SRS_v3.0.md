# Software Requirements Specification (SRS) v3.0

**Trusted Jurist Law Firm — Company Profile & Recruitment Platform**

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Proyek** | Trusted Jurist (TJ) |
| **Versi SRS** | 3.0 |
| **Versi Aplikasi Target** | 1.0 (Production) |
| **Tanggal Dokumen** | 8 Juli 2026 |
| **Status** | Ready for Development |
| **Related Documents** | PRD v3.0, SDD v3.0, Architecture |

---

## 1. Overview

This SRS document specifies the **functional and non-functional requirements** for Trusted Jurist v1.0. It translates business goals (from PRD) into measurable, testable requirements that engineering can implement and QA can validate.

**Key Objectives**:
- Define **what** the system must do (functional)
- Define **how well** it must do it (non-functional)
- Establish acceptance criteria for each feature
- Enable traceability between PRD goals and implementation

---

## 2. Functional Requirements

### 2.1 Public Pages (7 pages)

#### 2.1.1 Homepage (`/`)

| Req ID | Requirement | Acceptance Criteria | Priority |
|--------|-------------|-------------------|----------|
| F-H1 | Display hero section | Hero text renders, image loads, button CTAs functional | P0 |
| F-H2 | Show trust indicators | Founded date, team size, locations visible | P0 |
| F-H3 | Render 8 sections in sequence | All sections visible on scroll, images lazy-load | P0 |
| F-H4 | Display animations | Reveal-on-scroll, stagger works; respects prefers-reduced-motion | P1 |
| F-H5 | Primary CTA (Konsultasi) | Links to `/contact`, navigates correctly | P0 |
| F-H6 | Secondary CTA (Learn More) | Links to `/about`, works on mobile | P0 |
| F-H7 | SEO metadata | Title, description, OG image, canonical present | P0 |
| F-H8 | Responsive layout | Content reflows at 320px, 768px, 1024px, 1440px breakpoints | P0 |

**Testable Criteria**:
- ✅ No broken images (404s)
- ✅ All text readable on mobile (font size ≥16px)
- ✅ CTA buttons have hover states
- ✅ Sitemap includes homepage

#### 2.1.2 About Page (`/about`)

| Req ID | Requirement | Acceptance Criteria | Priority |
|--------|-------------|-------------------|----------|
| F-AB1 | Display firm vision & mission | Text content visible, formatted as prose | P0 |
| F-AB2 | Show 5 core values | Each value has icon + description, cards render properly | P0 |
| F-AB3 | Display operational commitments | 5 commitments listed with explanations | P0 |
| F-AB4 | Render credibility section | Team credentials, experience highlighted | P0 |
| F-AB5 | CTA to contact | "Mulai Konsultasi" button → `/contact` | P0 |
| F-AB6 | SEO metadata | Page-specific title, description, JSON-LD LegalService | P0 |

**Testable Criteria**:
- ✅ Values cards display on desktop (2-3 per row) and mobile (1 per row)
- ✅ All text content is editable via CMS (data-driven)
- ✅ No layout shift when icons load

#### 2.1.3 Practice Areas (`/practice-areas`)

| Req ID | Requirement | Acceptance Criteria | Priority |
|--------|-------------|-------------------|----------|
| F-P1 | List 8 practice areas | All 8 visible, no truncation on desktop/mobile | P0 |
| F-P2 | Display practice detail card | Title, scope, client needs, deliverables, icon visible | P0 |
| F-P3 | Support deep linking | URL `#litigation` jumps to Litigation section, browser back/forward work | P0 |
| F-P4 | Form subject pre-fill | Clicking "Konsultasi" → `/contact`, subject pre-filled | P1 |
| F-P5 | Lucide icons render | All 8 practice icons display without fallback errors | P0 |
| F-P6 | Responsive grid | 1-col (mobile), 2-col (tablet), 4-col (desktop) | P0 |

**Testable Criteria**:
- ✅ Scrolling to `#litigation` works (tab scrolls to element)
- ✅ Anchor links preserve browser history
- ✅ Icons scale properly on retina displays

#### 2.1.4 Team Page (`/team`)

| Req ID | Requirement | Acceptance Criteria | Priority |
|--------|-------------|-------------------|----------|
| F-T1 | Display managing partner card | Photo, name, title, bio (2 para), credentials visible | P0 |
| F-T2 | Show team role slots | 3 slots (Partner, Senior Associate, Associate) displayed as empty cards | P0 |
| F-T3 | Founder bio expandable | Credentials section shows education, bar admission, years in practice | P0 |
| F-T4 | CTA to careers | "Bergabung dengan Tim" → `/careers` or job listings | P1 |
| F-T5 | SEO metadata | Team-specific metadata, no duplicate founder info with `/about` | P0 |

**Testable Criteria**:
- ✅ Placeholder text for empty slots is clear ("Bergabung dengan kami")
- ✅ Founder name is editable and displays correctly
- ✅ Photo placeholder handles missing image gracefully

#### 2.1.5 Insights (`/insights`)

| Req ID | Requirement | Acceptance Criteria | Priority |
|--------|-------------|-------------------|----------|
| F-I1 | List 3 initial articles | All 3 displayed with title, category, status badge | P0 |
| F-I2 | Show article metadata | Publish date, read time estimate, category tag visible | P0 |
| F-I3 | Status badges render | "Draft", "Coming Soon" display correctly | P0 |
| F-I4 | Detail page disabled (v1) | Clicking article title → 404 with CTA back to listing | P1 |
| F-I5 | Email subscription form (v1) | Optional email capture for future newsletter (not integrated) | P2 |
| F-I6 | SEO metadata | Insights-specific title, description, JSON-LD ArticlePosting ready (phase 1) | P0 |

**Testable Criteria**:
- ✅ Status badge content matches data source (editorial-draft vs coming-soon)
- ✅ Read time calculated correctly (assume ~200 words/min)
- ✅ No detail page found at `/insights/[slug]` (404)

#### 2.1.6 Contact Page (`/contact`)

| Req ID | Requirement | Acceptance Criteria | Priority |
|--------|-------------|-------------------|----------|
| F-C1 | Display contact form | Form renders with all fields visible | P0 |
| F-C2 | Form fields present | Name, email, phone (optional), subject dropdown, message, checkbox consent | P0 |
| F-C3 | Form validation | Client-side validation for name (required, 2–100 chars), email (valid format) | P0 |
| F-C4 | Privacy consent link | Checkbox + link to `/privacy` visible and functional | P0 |
| F-C5 | Submit button state | Button disabled while submitting, shows loader | P0 |
| F-C6 | Success state | Message "Terima kasih..." displays after submission | P0 |
| F-C7 | Error state | Error message (e.g., "Email tidak valid") displays in alert | P0 |
| F-C8 | Direct contact channels | Email (`mailto:`), phone (`tel:`), WhatsApp (`wa.me/`) links functional | P0 |
| F-C9 | Office hours display | Hours visible: "Senin–Jumat, 08:00–17:00 WIB" | P0 |
| F-C10 | Disclaimer visible | "Hubungan advokat-klien belum terbentuk..." disclaimer shown | P0 |
| F-C11 | Data privacy statement | Clear notice re: data retention (12mo leads) | P1 |
| F-C12 | reCAPTCHA script loaded | Script injected, token sent with form (visible in network tab) | P0 |

**Testable Criteria**:
- ✅ Form resets after successful submission
- ✅ Resubmitting within 1 minute → 429 error (rate limit)
- ✅ Invalid email blocked (client-side + server-side)

#### 2.1.7 Privacy Policy (`/privacy`)

| Req ID | Requirement | Acceptance Criteria | Priority |
|--------|-------------|-------------------|----------|
| F-V1 | Display full privacy policy | All sections render (data, usage, security, rights, cookies, retention) | P0 |
| F-V2 | UU PDP compliance statements | Mentions user rights (access, deletion, objection) | P0 |
| F-V3 | Contact & inquiry method | Email address visible, link to contact form | P0 |
| F-V4 | Version & date | Last updated date visible (e.g., "8 Juli 2026") | P0 |
| F-V5 | Data retention table | Clear retention periods for leads (12mo), CVs (24mo), logs (3mo) | P0 |
| F-V6 | Third-party disclosures | List of subprocessors (Resend, DigitalOcean, Cloudflare, reCAPTCHA) | P0 |
| F-V7 | Rights explanation | Clear explanation of data access/deletion/objection process | P1 |
| F-V8 | SEO metadata | Privacy-specific title, description, indexed by search engines | P0 |

**Testable Criteria**:
- ✅ Privacy policy accessible without login
- ✅ All links (e.g., to subprocessor pages) are clickable and valid
- ✅ Page renders on all browsers without JavaScript errors

---

### 2.2 Contact Form Backend

#### 2.2.1 API Endpoint: POST `/api/contact`

| Req ID | Requirement | Acceptance Criteria | Priority |
|--------|-------------|-------------------|----------|
| F-API-C1 | Accept form data | Endpoint receives JSON payload with name, email, phone, subject, message | P0 |
| F-API-C2 | Validate required fields | Returns 400 error if name, email, subject, message missing | P0 |
| F-API-C3 | Validate email format | Returns 400 if email invalid (not RFC 5322) | P0 |
| F-API-C4 | Validate phone format | If provided, check Indonesia format (62xxxx or +62xxxx); allow empty | P1 |
| F-API-C5 | Rate limit requests | Allow 5 requests per minute per IP; return 429 if exceeded | P0 |
| F-API-C6 | Verify reCAPTCHA | Verify token server-side; reject if score <0.5 or token invalid | P0 |
| F-API-C7 | Sanitize input | Escape HTML in email template (prevent XSS in email clients) | P0 |
| F-API-C8 | Send user confirmation email | Email sent to applicant with thank-you message + privacy link | P0 |
| F-API-C9 | Send admin alert email | Email sent to `ADMIN_EMAIL` with full lead details + reply-to applicant | P0 |
| F-API-C10 | Return success | HTTP 200 + JSON `{success: true, message: "..."}` | P0 |
| F-API-C11 | Return error | HTTP 400/429/500 + error message (no sensitive info leaked) | P0 |
| F-API-C12 | Dev fallback | If env vars empty, return success + log payload to console | P2 |
| F-API-C13 | Log all submissions | Store in database (future: PostgreSQL; v1: structured logs) | P1 |

**Testable Criteria**:
```bash
# Valid request
curl -X POST https://trustedjurist.co.id/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","subject":"Litigasi","message":"Help!","recaptchaToken":"..."}'
# Response: 200 {success: true}

# Invalid email
# Response: 400 {success: false, error: "Email tidak valid"}

# Rate limit exceeded
# Response: 429 {success: false, error: "Terlalu banyak request..."}
```

---

### 2.3 Recruitment Module

#### 2.3.1 Job Listings Page (`/careers`)

| Req ID | Requirement | Acceptance Criteria | Priority |
|--------|-------------|-------------------|----------|
| F-J1 | Display job listings | All published jobs visible in card layout | P0 |
| F-J2 | Show job metadata | Title, level, location, brief description, "Apply" button visible | P0 |
| F-J3 | Career page intro | Hero section + "Why join us" section visible | P0 |
| F-J4 | Filter by level | Dropdown filter (Junior, Mid, Senior, Lead) functional | P1 |
| F-J5 | Sort options | Sort by "Newest" or "Closing Soon" | P1 |
| F-J6 | Job detail modal/page | Clicking job → full description, responsibilities, benefits (modal or new page) | P1 |
| F-J7 | Apply button | "Apply Now" → application form (pre-filled with job ID) | P0 |
| F-J8 | Responsive layout | Cards stack on mobile, 2-col on tablet, 3-col on desktop (if >3 jobs) | P0 |
| F-J9 | No jobs state | If no published jobs, show "Tidak ada lowongan saat ini" + email CTA | P1 |

**Testable Criteria**:
- ✅ Job cards display without layout shift
- ✅ Apply button click scrolls to form or opens new page
- ✅ Each job has unique URL or ID for deep linking (phase 1)

#### 2.3.2 Job Application Form (`/careers/[jobId]/apply` or modal)

| Req ID | Requirement | Acceptance Criteria | Priority |
|--------|-------------|-------------------|----------|
| F-APP-J1 | Display application form | All fields visible: name, email, phone, CV upload, cover letter (optional), checkbox | P0 |
| F-APP-J2 | Pre-fill job position | Position applied for is pre-filled (not editable) | P0 |
| F-APP-J3 | CV file upload | File input accepts PDF/DOCX, rejects other formats | P0 |
| F-APP-J4 | File size validation | Rejects files >5MB (client-side + server-side) | P0 |
| F-APP-J5 | Required field validation | Name, email, phone, CV are required; error shows if missing | P0 |
| F-APP-J6 | Privacy consent | Checkbox + link to `/privacy` before submit | P0 |
| F-APP-J7 | Submit button state | Button disabled while uploading, shows loader | P0 |
| F-APP-J8 | Success message | "Terima kasih! Kami akan menghubungi Anda..." message displays | P0 |
| F-APP-J9 | Form reset | After success, form resets for new applicant | P1 |
| F-APP-J10 | Error handling | Clear error messages for upload failures, validation errors | P0 |
| F-APP-J11 | Availability field | Dropdown: "ASAP", "2 weeks", "1 month" | P1 |
| F-APP-J12 | LinkedIn optional | LinkedIn profile URL capture (optional) | P2 |

**Testable Criteria**:
- ✅ CV upload progress bar displays during upload
- ✅ File type rejected immediately (not server-side only)
- ✅ Resubmit within rate limit → blocked with error

---

### 2.4 CV File Upload & Storage

#### 2.4.1 File Upload Endpoint: POST `/api/apply`

| Req ID | Requirement | Acceptance Criteria | Priority |
|--------|-------------|-------------------|----------|
| F-FILE-1 | Accept multipart form data | Endpoint receives `files[cv]` + form fields | P0 |
| F-FILE-2 | Validate file type | Only PDF, DOCX; reject others (400 error) | P0 |
| F-FILE-3 | Validate file size | Max 5MB; reject oversized files (413 error) | P0 |
| F-FILE-4 | Store in DigitalOcean Spaces | File uploaded to `cv-bucket-{env}`, naming: `{applicantId}_{timestamp}_{originalName}` | P0 |
| F-FILE-5 | Generate accessible URL | Return signed URL (expires in 24mo) to admin dashboard | P0 |
| F-FILE-6 | Return success | HTTP 200 + JSON `{success: true, fileUrl: "..."}` | P0 |
| F-FILE-7 | Virus scan (optional) | Call VirusTotal API (phase 1) to scan file | P2 |
| F-FILE-8 | Log file metadata | Store filename, size, upload time, applicant ID in database | P1 |

**Testable Criteria**:
```bash
curl -X POST https://trustedjurist.co.id/api/apply \
  -F "name=John" -F "email=john@example.com" -F "cv=@resume.pdf"
# Response: 200 {success: true, fileUrl: "https://spaces.do.../cv-..."}
```

---

### 2.5 Email Notifications (Resend)

#### 2.5.1 User Confirmation Email (Contact Form)

| Req ID | Requirement | Acceptance Criteria | Priority |
|--------|-------------|-------------------|----------|
| F-EMAIL-U1 | Send to correct recipient | Email sent to form submitter's email address | P0 |
| F-EMAIL-U2 | Include subject | Subject: "Kami menerima konsultasi Anda" or similar | P0 |
| F-EMAIL-U3 | Professional template | HTML email with branding, readable on mobile | P0 |
| F-EMAIL-U4 | Include submission details | Echo back name, subject, message to confirm | P0 |
| F-EMAIL-U5 | Include next steps | State "Kami akan menghubungi Anda dalam 24 jam" | P0 |
| F-EMAIL-U6 | Privacy link | Link to `/privacy` policy in footer | P0 |
| F-EMAIL-U7 | No-reply sender | From: `noreply@trustedjurist.co.id` (env var configured) | P0 |
| F-EMAIL-U8 | Plain text fallback | Email includes plain text version for old clients | P1 |

**Testable Criteria**:
- ✅ Email arrives within 60s of form submission
- ✅ HTML renders without broken images in Gmail, Outlook, Apple Mail
- ✅ Unsubscribe link not required (transactional email)

#### 2.5.2 Admin Alert Email (Contact Form)

| Req ID | Requirement | Acceptance Criteria | Priority |
|--------|-------------|-------------------|----------|
| F-EMAIL-A1 | Send to admin inbox | Email sent to `ADMIN_EMAIL` env var | P0 |
| F-EMAIL-A2 | Include full lead info | Name, email, phone, subject, message, IP, timestamp | P0 |
| F-EMAIL-A3 | Reply-to applicant | Reply-To header set to applicant's email (admin clicks Reply to contact back) | P0 |
| F-EMAIL-A4 | Action link | Link to admin dashboard to view/manage lead | P1 |
| F-EMAIL-A5 | Subject line clear | Subject: "[Lead] [Subject] — {name}" | P0 |
| F-EMAIL-A6 | Timestamped | Email includes submission timestamp + timezone (Asia/Jakarta) | P0 |

**Testable Criteria**:
- ✅ Admin can click Reply in email to respond directly to applicant
- ✅ Email arrives within 60s

#### 2.5.3 Applicant Confirmation Email (Job Application)

| Req ID | Requirement | Acceptance Criteria | Priority |
|--------|-------------|-------------------|----------|
| F-EMAIL-APP-U1 | Send to applicant | Email sent after CV upload success | P0 |
| F-EMAIL-APP-U2 | Confirm application | "We received your application for [Position]" message | P0 |
| F-EMAIL-APP-U3 | Next steps | State review process & expected contact timeline (7 days) | P0 |
| F-EMAIL-APP-U4 | Privacy link | Link to `/privacy` in footer | P0 |
| F-EMAIL-APP-U5 | Professional template | HTML email, mobile-friendly | P0 |

---

### 2.6 Admin Panel (v1 Minimal)

#### 2.6.1 Admin Authentication

| Req ID | Requirement | Acceptance Criteria | Priority |
|--------|-------------|-------------------|----------|
| F-AUTH-1 | Login page | Admin login form (email + password) renders | P0 |
| F-AUTH-2 | Validate credentials | Hardcoded or database check (v1: simple static account) | P0 |
| F-AUTH-3 | Session management | Session cookie set after login; expires after 24h inactivity | P0 |
| F-AUTH-4 | Logout | Logout clears session, redirects to login | P0 |
| F-AUTH-5 | Protect routes | Admin routes require valid session; redirect to login if not | P0 |
| F-AUTH-6 | No password reset (v1) | Manual password reset via admin only (phase 1: add self-service) | P1 |

**Testable Criteria**:
- ✅ Invalid credentials → "Email atau password salah"
- ✅ Session expires → redirect to login
- ✅ Direct navigation to `/admin` without session → login page

#### 2.6.2 Admin Dashboard (Home)

| Req ID | Requirement | Acceptance Criteria | Priority |
|--------|-------------|-------------------|----------|
| F-DASH-1 | Quick stats visible | Total leads this month, new applicants, form submissions (this week) | P0 |
| F-DASH-2 | Navigation menu | Links to Leads, Applicants, Job Postings, Analytics, Settings | P0 |
| F-DASH-3 | Last sync time | "Last updated: X minutes ago" for stats | P1 |
| F-DASH-4 | Charts (basic) | Bar/line chart showing submissions over time (past 30 days) | P1 |

#### 2.6.3 Leads Management

| Req ID | Requirement | Acceptance Criteria | Priority |
|--------|-------------|-------------------|----------|
| F-LEAD-1 | List all leads | Paginated table: date, name, email, subject, status | P0 |
| F-LEAD-2 | Filter by subject | Dropdown: All, Litigasi, Antikorupsi, etc. | P0 |
| F-LEAD-3 | Filter by date range | Date picker: From/To | P1 |
| F-LEAD-4 | Filter by status | Dropdown: new, viewed, contacted, archived | P0 |
| F-LEAD-5 | Sort options | Sort by date (newest/oldest), name (A–Z) | P0 |
| F-LEAD-6 | View lead detail | Click row → detail modal/page with full message | P0 |
| F-LEAD-7 | Change status | Dropdown in detail view to change status (new→viewed→contacted→archived) | P0 |
| F-LEAD-8 | Mark as contacted | One-click button to mark as "contacted" | P0 |
| F-LEAD-9 | Delete lead | Delete button (soft delete, audit trail) | P1 |
| F-LEAD-10 | Bulk export | "Export CSV" button exports filtered leads | P1 |
| F-LEAD-11 | Email reply draft | "Reply" button opens email draft (pre-filled To: applicant) | P1 |
| F-LEAD-12 | Audit trail | Timestamp + user who last modified lead status | P1 |

**Testable Criteria**:
- ✅ Filtering & sorting work in combination
- ✅ CSV export includes all columns (date, name, email, subject, message, status)
- ✅ Status change updates immediately in list & detail view

#### 2.6.4 Job Applications Management

| Req ID | Requirement | Acceptance Criteria | Priority |
|--------|-------------|-------------------|----------|
| F-APP-1 | List all applicants | Paginated table: date, name, position, status, phone | P0 |
| F-APP-2 | Filter by position | Dropdown: Fullstack Engineer, Software Engineer, All | P0 |
| F-APP-3 | Filter by status | Dropdown: new, review, interview, offer, reject | P0 |
| F-APP-4 | Sort by date | Newest first (configurable) | P0 |
| F-APP-5 | View applicant detail | Click row → detail page with full info (name, email, phone, LinkedIn, CV link, cover letter if provided) | P0 |
| F-APP-6 | Download CV | "Download CV" button or direct link to signed S3 URL | P0 |
| F-APP-7 | Preview CV (optional) | Embed PDF viewer in detail page (phase 1) | P2 |
| F-APP-8 | Change status | Dropdown to change status (new→review→interview→offer/reject) | P0 |
| F-APP-9 | Status history | Show who changed status and when | P1 |
| F-APP-10 | Bulk status change | Select multiple applicants, change status in bulk | P1 |
| F-APP-11 | Bulk export | Export selected/filtered applicants to CSV | P1 |
| F-APP-12 | Send email | "Send Email" button → draft to applicant (pre-filled To: applicant) | P1 |
| F-APP-13 | Delete record | Soft delete applicant (keep audit trail) | P1 |

#### 2.6.5 Job Posting Management

| Req ID | Requirement | Acceptance Criteria | Priority |
|--------|-------------|-------------------|----------|
| F-JOB-1 | List job postings | Table with title, level, status (draft/published), applicant count | P0 |
| F-JOB-2 | Create new job | Form: title, level, department, location, description (rich text), skills, benefits, deadline | P0 |
| F-JOB-3 | Edit existing job | Update any field, re-publish or keep as draft | P0 |
| F-JOB-4 | Publish job | Toggle to make job live on `/careers` | P0 |
| F-JOB-5 | Draft jobs hidden | Jobs with status=draft do NOT appear on `/careers` | P0 |
| F-JOB-6 | Close job | Transition job to "closed" (no longer accepts applications) | P0 |
| F-JOB-7 | Delete job | Soft delete (keep application records) | P0 |
| F-JOB-8 | View applicant count | "Fullstack Engineer: 5 applications" displayed on job list | P0 |
| F-JOB-9 | Rich text editor | Job description supports bold, italic, bullet lists, links | P1 |
| F-JOB-10 | Preview job | Preview how job appears on `/careers` before publishing | P1 |

**Testable Criteria**:
- ✅ Draft job does not appear on public `/careers` page
- ✅ Publishing job updates `/sitemap.xml` within 24h
- ✅ Closing job blocks new applications but shows applicants already submitted

#### 2.6.6 Basic Analytics Dashboard

| Req ID | Requirement | Acceptance Criteria | Priority |
|--------|-------------|-------------------|----------|
| F-ANALYTICS-1 | Form submissions chart | Line/bar chart: submissions per day (past 30 days) | P1 |
| F-ANALYTICS-2 | Applicant breakdown | Table: Position, Total, New, Reviewed, Interviewed, Offered, Rejected | P1 |
| F-ANALYTICS-3 | Response rate | "X out of Y leads contacted" (percentage) | P1 |
| F-ANALYTICS-4 | Top source | Shows which form/page generated most leads (UTM params, phase 1) | P2 |
| F-ANALYTICS-5 | Export analytics | "Download Report (PDF)" → generates basic report | P2 |

---

### 2.7 SEO & Metadata

#### 2.7.1 On-Page Metadata

| Req ID | Requirement | Acceptance Criteria | Priority |
|--------|-------------|-------------------|----------|
| F-SEO-1 | Unique page title | Each page has unique `<title>` (40–60 chars) | P0 |
| F-SEO-2 | Meta description | Each page has unique `<meta name="description">` (120–160 chars) | P0 |
| F-SEO-3 | Canonical link | `<link rel="canonical">` present on every page | P0 |
| F-SEO-4 | Open Graph tags | og:title, og:description, og:image, og:url on all pages | P0 |
| F-SEO-5 | Twitter Card | `<meta name="twitter:card">` = `summary_large_image` | P0 |
| F-SEO-6 | Language attribute | `<html lang="id">` set to Indonesian | P0 |
| F-SEO-7 | Viewport meta | Mobile viewport meta tag present | P0 |

**Testable Criteria**:
- ✅ Facebook OG debugger: all tags parsed correctly
- ✅ Twitter Card validator: image previews
- ✅ No duplicate meta descriptions across pages

#### 2.7.2 Structured Data (JSON-LD)

| Req ID | Requirement | Acceptance Criteria | Priority |
|--------|-------------|-------------------|----------|
| F-JSON-1 | LegalService schema | Root layout includes Organization + LegalService schema | P0 |
| F-JSON-2 | LocalBusiness schema | Address, phone, email, hours in schema (phase 1: add hours) | P1 |
| F-JSON-3 | JobPosting schema | Each published job has JobPosting schema in HTML | P1 |
| F-JSON-4 | Valid JSON-LD | Schema.org validator passes without errors | P0 |

**Testable Criteria**:
- ✅ Google Schema.org validator: no errors
- ✅ Bing Webmaster Tools: structured data recognized

#### 2.7.3 Sitemap & Robots

| Req ID | Requirement | Acceptance Criteria | Priority |
|--------|-------------|-------------------|----------|
| F-SITEMAP-1 | Generate sitemap.xml | All public pages + active jobs listed | P0 |
| F-SITEMAP-2 | Update sitemap | Sitemap auto-updates when jobs published/closed | P1 |
| F-SITEMAP-3 | Sitemap URLs valid | All URLs are absolute, use https:// | P0 |
| F-SITEMAP-4 | Robots.txt file | `/robots.txt` allows `/`, disallows `/api/` + `/admin/` | P0 |
| F-SITEMAP-5 | Sitemap reference | Robots.txt includes `Sitemap: https://trustedjurist.co.id/sitemap.xml` | P0 |

---

### 2.8 Security & Privacy

#### 2.8.1 Input Security

| Req ID | Requirement | Acceptance Criteria | Priority |
|--------|-------------|-------------------|----------|
| F-SEC-1 | HTML escape in emails | User input in email templates is HTML-escaped (prevent XSS) | P0 |
| F-SEC-2 | SQL injection prevention | Parameterized queries used for all database operations | P0 |
| F-SEC-3 | File upload validation | Only PDF/DOCX accepted; MIME type verified on server | P0 |
| F-SEC-4 | No hardcoded secrets | API keys, passwords stored in env vars only | P0 |
| F-SEC-5 | HTTPS enforced | All traffic redirected to https:// | P0 |

#### 2.8.2 Data Protection

| Req ID | Requirement | Acceptance Criteria | Priority |
|--------|-------------|-------------------|----------|
| F-PRIVACY-1 | Data retention policy | Leads purged after 12mo, CVs after 24mo (documented, automated) | P1 |
| F-PRIVACY-2 | User deletion request | Admin can delete applicant/lead records on request | P1 |
| F-PRIVACY-3 | Access logs | Server logs include IP, method, path, timestamp (not sensitive data) | P1 |
| F-PRIVACY-4 | Audit trail | All admin actions (status change, delete, export) logged with user + timestamp | P1 |

#### 2.8.3 Anti-Bot & Rate Limiting

| Req ID | Requirement | Acceptance Criteria | Priority |
|--------|-------------|-------------------|----------|
| F-RATE-1 | reCAPTCHA v3 | Form submission verifies reCAPTCHA token server-side; score ≥0.5 required | P0 |
| F-RATE-2 | Rate limit contact form | 5 submissions per minute per IP; returns 429 if exceeded | P0 |
| F-RATE-3 | Rate limit job apply | 1 application per IP per job per day (prevent spam) | P1 |
| F-RATE-4 | Admin rate limit | No rate limit on admin dashboard (authorized users) | P0 |

---

## 3. Non-Functional Requirements

### 3.1 Performance

| Req ID | NFR | Acceptance Criteria | Priority |
|--------|-----|-------------------|----------|
| NFR-PERF-1 | Page load time | <2s (desktop), <3s (mobile) for 95th percentile | P0 |
| NFR-PERF-2 | First Contentful Paint | <1.5s desktop, <2s mobile | P0 |
| NFR-PERF-3 | Largest Contentful Paint | <2.0s desktop, <2.5s mobile | P0 |
| NFR-PERF-4 | Cumulative Layout Shift | <0.1 (no major layout shifts) | P0 |
| NFR-PERF-5 | Time to Interactive | <4s desktop, <5.5s mobile | P0 |
| NFR-PERF-6 | Bundle size | <100KB JS (gzipped) | P0 |
| NFR-PERF-7 | Asset optimization | Images optimized, lazy-loaded; CSS/JS minified | P0 |
| NFR-PERF-8 | Caching strategy | Static assets cached 1 year; HTML revalidated hourly | P1 |
| NFR-PERF-9 | Lighthouse score | ≥85 desktop, ≥70 mobile | P0 |

**Measurement Tools**: Lighthouse, WebPageTest, Chrome DevTools, PageSpeed Insights

### 3.2 Reliability & Availability

| Req ID | NFR | Acceptance Criteria | Priority |
|--------|-----|-------------------|----------|
| NFR-AVAIL-1 | Uptime target | ≥99.5% (max 3.6h downtime per month) | P0 |
| NFR-AVAIL-2 | Error budget | <0.5% error rate on all endpoints | P0 |
| NFR-AVAIL-3 | Database backup | Daily automated backups; 7-day retention | P1 |
| NFR-AVAIL-4 | Disaster recovery | Recovery Time Objective (RTO) <4h; Recovery Point Objective (RPO) <1h | P1 |
| NFR-AVAIL-5 | Monitoring | 24/7 uptime monitoring via Uptime Robot or equivalent | P0 |
| NFR-AVAIL-6 | Alert on failure | PagerDuty/email alert if site down >5 minutes | P1 |

### 3.3 Scalability

| Req ID | NFR | Acceptance Criteria | Priority |
|--------|-----|-------------------|----------|
| NFR-SCALE-1 | Concurrent users | Support 500+ concurrent users without performance degradation | P1 |
| NFR-SCALE-2 | Database scaling | PostgreSQL (phase 1) supports horizontal read replicas | P2 |
| NFR-SCALE-3 | File storage | DigitalOcean Spaces auto-scales; no manual intervention needed | P0 |
| NFR-SCALE-4 | Email throughput | Resend supports 1000+ emails/day (current max: 100/day estimated) | P0 |
| NFR-SCALE-5 | Load testing | Tested under 10x expected traffic; no crashes or major slowdown | P1 |

### 3.4 Security

| Req ID | NFR | Acceptance Criteria | Priority |
|--------|-----|-------------------|----------|
| NFR-SEC-1 | HTTPS only | All traffic over HTTPS; TLS 1.2+; HSTS header present | P0 |
| NFR-SEC-2 | CSP header | Content Security Policy header prevents XSS attacks | P1 |
| NFR-SEC-3 | Dependency scanning | Weekly automated scans (Dependabot); 0 critical vulnerabilities | P0 |
| NFR-SEC-4 | Secret rotation | API keys rotated every 90 days | P2 |
| NFR-SEC-5 | Penetration testing | Annual security audit; any findings fixed within 30 days | P1 |
| NFR-SEC-6 | OWASP compliance | No OWASP Top 10 vulnerabilities identified | P0 |
| NFR-SEC-7 | Rate limiting | DDoS protection via Cloudflare; rate limits on sensitive endpoints | P0 |

### 3.5 Accessibility (WCAG 2.1 AA)

| Req ID | NFR | Acceptance Criteria | Priority |
|--------|-----|-------------------|----------|
| NFR-A11Y-1 | Semantic HTML | All pages use proper semantic elements (`<main>`, `<nav>`, `<article>`) | P0 |
| NFR-A11Y-2 | Color contrast | Text contrast ratio ≥4.5:1 (normal), ≥3:1 (large) | P0 |
| NFR-A11Y-3 | Keyboard navigation | All interactive elements reachable via Tab; focus visible | P0 |
| NFR-A11Y-4 | Alt text | All images have meaningful alt text | P0 |
| NFR-A11Y-5 | Form labels | All form inputs have associated `<label>` elements | P0 |
| NFR-A11Y-6 | Error messages | Form validation errors clear and associated with input | P0 |
| NFR-A11Y-7 | Motion preferences | Animations respect `prefers-reduced-motion` CSS query | P0 |
| NFR-A11Y-8 | Skip link | "Skip to main content" link at top of page | P0 |

**Testing Tools**: WAVE, Axe, Lighthouse Accessibility audit

### 3.6 Compatibility & Browser Support

| Req ID | NFR | Acceptance Criteria | Priority |
|--------|-----|-------------------|----------|
| NFR-COMPAT-1 | Desktop browsers | Chrome 120+, Firefox 121+, Safari 17+, Edge 120+ | P0 |
| NFR-COMPAT-2 | Mobile browsers | iOS Safari 16+, Chrome Android 120+ | P0 |
| NFR-COMPAT-3 | Screen sizes | Responsive from 320px (mobile) to 1920px (desktop) | P0 |
| NFR-COMPAT-4 | JavaScript | Graceful degradation if JS disabled (forms still functional) | P1 |
| NFR-COMPAT-5 | CSS support | Modern CSS (grid, flex, custom properties); no IE 11 support | P0 |
| NFR-COMPAT-6 | Email clients | Emails render correctly in Gmail, Outlook, Apple Mail, Thunderbird | P0 |

### 3.7 Usability

| Req ID | NFR | Acceptance Criteria | Priority |
|--------|-----|-------------------|----------|
| NFR-USE-1 | Contact form fill time | <2 minutes for average user (5–6 fields) | P0 |
| NFR-USE-2 | Job application time | <3 minutes to complete (form + CV upload) | P0 |
| NFR-USE-3 | Admin lead view time | <30 seconds to view & respond to a lead | P1 |
| NFR-USE-4 | Form error recovery | User can correct error and resubmit without re-entering all fields | P0 |
| NFR-USE-5 | Mobile usability | Touch targets ≥44×44px; tap-friendly forms | P0 |
| NFR-USE-6 | Confirmation feedback | Success/error messages appear within 1s of action | P0 |

### 3.8 Maintainability

| Req ID | NFR | Acceptance Criteria | Priority |
|--------|-----|-------------------|----------|
| NFR-MAINT-1 | Code quality | ESLint passes; TypeScript strict mode; test coverage ≥70% | P1 |
| NFR-MAINT-2 | Documentation | API docs, database schema, deployment guide all current | P1 |
| NFR-MAINT-3 | Code review | All changes reviewed by ≥1 other engineer before merge | P0 |
| NFR-MAINT-4 | CI/CD pipeline | Automated tests run on every PR; pass before merge | P0 |
| NFR-MAINT-5 | Deployment time | Zero-downtime deployment; <5 minutes to deploy change | P1 |
| NFR-MAINT-6 | Rollback ability | Can rollback any change within 5 minutes | P1 |

---

## 4. User Stories & Acceptance Tests

### 4.1 Contact Form User Story

**User Story**: As a prospective client, I want to submit a consultation request so that the firm can contact me about legal services.

**Acceptance Tests**:
```
Given I am on /contact page
When I fill name, email, subject, message
  And I check privacy consent
  And I click "Kirim Konsultasi"
Then I should see success message "Terima kasih..."
  And I should receive confirmation email within 60 seconds
  And admin should receive lead alert with my details
```

**Edge Cases**:
- Form submission without reCAPTCHA token → 400 error
- 6th submission within 1 minute → 429 error (rate limited)
- Invalid email format → client-side error "Email tidak valid"
- Phone number optional → should not block submission

### 4.2 Job Application User Story

**User Story**: As a job seeker, I want to apply for an open position by uploading my CV so that I can be considered for the role.

**Acceptance Tests**:
```
Given I am on /careers page
  And I see "Fullstack Engineer" job posting
When I click "Apply Now"
Then I should see application form with job pre-filled
When I fill name, email, phone, upload resume.pdf
  And I check privacy consent
  And I click "Kirim Lamaran"
Then I should see success message
  And I should receive confirmation email within 60 seconds
  And admin should see applicant in dashboard
  And CV should be accessible via signed URL (24mo expiry)
```

**Edge Cases**:
- Upload file >5MB → error "File exceeds 5MB"
- Upload .exe or .txt → error "Only PDF/DOCX accepted"
- Submit same application twice within 1 day → 429 error (rate limited)

### 4.3 Admin Lead Management User Story

**User Story**: As an admin, I want to view and manage incoming consultation requests so that I can follow up with leads and track conversion.

**Acceptance Tests**:
```
Given I am logged into admin panel
When I navigate to "Leads" section
Then I should see table of all consultation submissions (date, name, email, subject)
When I click on a lead row
Then I should see full details (message, phone, IP address)
When I click "Mark as Contacted"
Then status should change to "contacted"
  And timestamp should update
  And audit trail should record "contacted by [admin] at [time]"
When I click "Reply"
Then email draft should open (pre-filled To: applicant)
When I change date filter to "Last 7 days"
Then list should show only leads from past week
```

---

## 5. Platform Capabilities & Constraints

### 5.1 Supported Platforms

| Platform | Support | Testing |
|----------|---------|---------|
| Desktop Web | Full | Chrome, Firefox, Safari, Edge on Windows/Mac |
| Mobile Web | Full | iPhone 12+, Samsung Galaxy S20+ |
| Tablet | Full | iPad, Samsung Galaxy Tab |
| Progressive Web App (PWA) | Not in v1 | Phase 1+ |
| Mobile App (iOS/Android) | Not supported | Web-only in v1 |

### 5.2 External Dependencies

| Service | Purpose | SLA | Fallback |
|---------|---------|-----|----------|
| Resend | Email delivery | 99% | Log to console + manual escalation |
| Google reCAPTCHA | Bot detection | 99.9% | Reject (no fallback) |
| DigitalOcean Spaces | File storage | 99.9% | Retry upload after 60s |
| Cloudflare | CDN + DDoS | 99.9% | Use origin server directly |

---

## 6. Testing Requirements

### 6.1 Unit Testing

**Scope**: Utility functions, validators, form logic

| Module | Coverage Target | Tools |
|--------|-----------------|-------|
| `lib/contact/validate.ts` | ≥90% | Jest |
| `lib/contact/sanitize.ts` | ≥90% | Jest |
| `lib/contact/rate-limit.ts` | ≥85% | Jest |
| Form components | ≥80% | React Testing Library |

### 6.2 Integration Testing

**Scope**: API routes, email pipeline, file upload

| Test Case | Trigger | Assertion |
|-----------|---------|-----------|
| Contact form → email | POST `/api/contact` with valid data | Email sent to user + admin |
| File upload → storage | POST `/api/apply` with PDF | File in DigitalOcean Spaces; URL returned |
| Rate limit | 6 requests within 60s | 6th returns 429 |
| reCAPTCHA fail | Score <0.5 | Submission rejected |

### 6.3 End-to-End (E2E) Testing

**Scope**: User workflows across pages

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| Submit consultation | Navigate to `/contact` → fill form → submit | Success message + email confirmation |
| Apply for job | Navigate to `/careers` → click Apply → fill + upload CV | Success + applicant appears in admin |
| Admin review lead | Login → view lead → mark contacted | Status updates; audit log records action |

**Tools**: Playwright, Cypress, or similar headless browser testing

### 6.4 Manual QA Checklist

- [ ] All 7 pages render without JS errors
- [ ] Forms submit successfully on desktop + mobile
- [ ] Emails deliver to test inbox within 60s
- [ ] Admin panel login works; pages load
- [ ] File upload (PDF/DOCX) succeeds; other formats rejected
- [ ] Rate limiting blocks 6th submission
- [ ] reCAPTCHA token verified (check network tab)
- [ ] Accessibility: keyboard navigation works, color contrast adequate
- [ ] Performance: Lighthouse ≥85 (desktop), ≥70 (mobile)

---

## 7. Deployment & Rollout

### 7.1 Deployment Environments

| Environment | Purpose | Database | Hosting |
|-------------|---------|----------|---------|
| Local (dev) | Engineer development | SQLite or memory | localhost:3000 |
| Staging | Client preview, UAT | PostgreSQL | vercel.com preview URL |
| Production | Live site | PostgreSQL | trustedjurist.co.id |

### 7.2 Deployment Process

1. Engineer pushes to `develop` branch
2. GitHub Actions runs tests, builds, deploys to staging
3. Client previews staging URL
4. Client approves; engineer creates PR to `main`
5. PR reviewed by team lead
6. Merge to `main` triggers production build
7. Manual smoke test on production
8. Verify DNS routing, SSL, monitoring
9. Send launch notification to stakeholders

### 7.3 Rollback Plan

If production issue detected:
1. Identify issue (error rate >1%, page not loading, etc.)
2. Rollback to last stable commit: `git revert [commit]`
3. Re-run tests & deploy to staging for verification
4. Deploy rolled-back version to production
5. Monitor for 30 minutes
6. Root cause analysis in post-mortem

---

## 8. Glossary

| Term | Definition |
|------|-----------|
| **SRS** | Software Requirements Specification |
| **MVP** | Minimum Viable Product |
| **Admin Panel** | Internal management interface (restricted to TJ staff) |
| **Rate Limiting** | Restricting API requests to prevent abuse (e.g., 5/min/IP) |
| **reCAPTCHA v3** | Google's invisible bot detection (score-based, 0–1) |
| **Resend** | Email service provider (API-first) |
| **DigitalOcean Spaces** | S3-compatible object storage |
| **Cloudflare** | CDN + DDoS protection |
| **Traceability** | Link between PRD goals → SRS requirements → code |
| **Acceptance Criteria** | Measurable conditions to mark requirement as "done" |

---

**Document Status**: ✅ **READY FOR DEVELOPMENT**

**Last Updated**: 8 Juli 2026  
**Owner**: DN Tech Engineering Lead


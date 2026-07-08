# Product Requirements Document (PRD)
## DN Tech Careers Module

**Document Version**: 1.0  
**Last Updated**: July 8, 2026  
**Status**: Published  
**Owner**: VP Product / HR

---

## 📋 Table of Contents

- [Executive Summary](#executive-summary)
- [Problem Statement](#problem-statement)
- [Target Audience](#target-audience)
- [Key Features](#key-features)
- [User Flows](#user-flows)
- [Requirements](#requirements)
- [Design & UX](#design--ux)
- [Technical Stack](#technical-stack)
- [Success Criteria](#success-criteria)
- [Timeline & Milestones](#timeline--milestones)

---

## Executive Summary

### Product Name

**DN Tech Careers Module** — modul rekrutmen terintegrasi dengan Company Profile Website.

### Product Vision

Menyediakan platform rekrutmen profesional yang memudahkan calon kandidat menemukan dan melamar lowongan, serta memudahkan tim HR mengelola posisi terbuka dan melacak aplikasi.

### Goal Statement

- Menampilkan lowongan kerja aktif di dntech.id/careers
- Memungkinkan kandidat melamar langsung via website
- Mengirim notifikasi otomatis ke HR dan konfirmasi ke pelamar
- Terintegrasi dengan lead management system yang ada

### Success Metrics

| Metric | Target |
|--------|--------|
| Active job postings | 2–5 |
| Monthly applications | 10+ |
| Application-to-interview rate | 20% |
| Time-to-fill position | < 30 hari |
| Email delivery rate | 99%+ |

---

## Problem Statement

### Current Situation

DN Tech perlu menarik talenta teknologi berkualitas untuk mendukung pertumbuhan perusahaan. Tanpa careers page terintegrasi:

- Kandidat tidak tahu posisi yang tersedia
- Lamaran via email tidak terstruktur
- HR sulit melacak status aplikasi
- Tidak ada employer branding yang konsisten

### Problems to Solve

1. **Visibility** — Lowongan tidak terlihat di website perusahaan
2. **Application friction** — Proses lamaran tidak user-friendly
3. **Tracking** — Tidak ada sistem pelacakan aplikasi
4. **Notification** — HR tidak langsung tahu ada lamaran baru
5. **Branding** — Careers page tidak mencerminkan culture perusahaan

---

## Target Audience

### Job Seeker (Rina — Full Stack Developer)

- **Age**: 25–35
- **Experience**: 3–7 tahun
- **Goals**: Find challenging tech role at growing company
- **Pain Points**: Generic job boards, unclear company culture
- **Device**: Mobile 50%, Desktop 50%

### HR Manager (Andi — HR Lead)

- **Age**: 30–45
- **Goals**: Efficiently manage openings and applications
- **Pain Points**: Manual tracking, scattered applications
- **Frequency**: Weekly job posting updates

### Hiring Manager (Sarah — CTO)

- **Goals**: Review qualified candidates quickly
- **Pain Points**: Unstructured applications, missing info
- **Frequency**: Per-position hiring cycle

---

## Key Features

### Public Features

| Feature | Priority | Status |
|---------|----------|--------|
| Job listings page | P0 | ✅ Done |
| Job detail page | P0 | ✅ Done |
| Filter by department | P1 | ✅ Done |
| Filter by location | P1 | ✅ Done |
| Filter by job type | P1 | ✅ Done |
| Application form | P0 | ✅ Done |
| Email confirmation to applicant | P0 | ✅ Done |
| Admin notification email | P0 | ✅ Done |
| Mobile responsive design | P0 | ✅ Done |

### Admin Features

| Feature | Priority | Status |
|---------|----------|--------|
| CRUD job postings | P0 | ✅ Done |
| Status management (active/inactive) | P0 | ✅ Done |
| Level field (Junior/Mid/Senior) | P1 | ✅ Done |
| Benefits field (JSON array) | P1 | ✅ Done |
| Application tracking via leads | P0 | ✅ Done |
| Display order management | P2 | ✅ Done |

### Out of Scope (Current Phase)

- ATS (Applicant Tracking System) full-featured
- Resume parsing / AI screening
- Interview scheduling integration
- Employee referral program
- Multi-language job postings

---

## User Flows

### Flow 1: Job Application

```
Visit dntech.id/careers → Browse listings
    → Click job title → Read requirements & benefits
    → Click "Apply" → Fill application form
        (name, email, phone, cover letter, resume link)
    → Submit → Thank you page
    → Confirmation email to applicant
    → Notification email to info@dntech.id
    → Application stored as FormSubmission (type: career)
    → Visible in admin /admin/leads
```

### Flow 2: HR Posts New Job

```
Login /admin → Careers → Create New
    → Fill: title, department, location, type, level
    → Add: description, requirements, benefits
    → Set status: active → Save
    → Job appears on /careers immediately
```

### Flow 3: HR Reviews Application

```
Login /admin → Leads → Filter type: career
    → Open application → Read cover letter
    → Update status: new → contacted
    → Add internal notes
    → Assign to hiring manager
```

---

## Requirements

### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-C01 | Display active job listings on /careers | P0 |
| FR-C02 | Job detail page with full description | P0 |
| FR-C03 | Application form with validation | P0 |
| FR-C04 | Store application as FormSubmission | P0 |
| FR-C05 | Send confirmation email to applicant | P0 |
| FR-C06 | Send notification to admin email | P0 |
| FR-C07 | Admin CRUD for job postings | P0 |
| FR-C08 | Filter listings by department/location | P1 |
| FR-C09 | Level and benefits fields on job posting | P1 |
| FR-C10 | Integration with leads management | P0 |

### Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-C01 | Application form load time | < 1s |
| NFR-C02 | Email delivery | < 30s after submit |
| NFR-C03 | Mobile usability | Full functionality on 320px |
| NFR-C04 | Spam prevention | Honeypot + rate limit 5/hr |

---

## Design & UX

### Careers Page Layout

```
┌─────────────────────────────────────┐
│  Hero: "Join Our Team"              │
│  Subtitle: company culture message  │
├─────────────────────────────────────┤
│  Filters: [Department] [Location]   │
├─────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐           │
│  │ Job Card│ │ Job Card│  ...      │
│  │ Title   │ │ Title   │           │
│  │ Dept    │ │ Dept    │           │
│  │ Location│ │ Location│           │
│  │ [Apply] │ │ [Apply] │           │
│  └─────────┘ └─────────┘           │
├─────────────────────────────────────┤
│  CTA: "Don't see your role? Contact"│
└─────────────────────────────────────┘
```

### Job Card Information

- Title
- Department
- Location (Remote / Jakarta / Hybrid)
- Type (Full-time / Part-time / Contract)
- Level (Junior / Mid / Senior)
- Posted date

### Application Form Fields

| Field | Required | Validation |
|-------|----------|------------|
| Full Name | Yes | Min 2 chars |
| Email | Yes | Valid email format |
| Phone | No | — |
| Cover Letter | Yes | Min 50 chars |
| Resume URL | No | Valid URL |
| Honeypot | — | Must be empty |

---

## Technical Stack

Careers module terintegrasi penuh dengan Company Profile Website:

| Component | Technology |
|-----------|------------|
| Frontend page | Next.js Server Component |
| API | Express `/careers`, `/forms/career` |
| Database | Prisma `Career` model + `FormSubmission` |
| Email | EmailService (SMTP via Nodemailer) |
| Admin | AdminCrudPage component |

Detail arsitektur: [Compro Spec](./10_COMPRO_SPEC.md)

---

## Success Criteria

### Launch Criteria

- [x] Careers page live at /careers
- [x] Admin CRUD functional
- [x] Application form working end-to-end
- [x] Email notifications operational
- [x] Leads integration complete
- [x] At least 2 sample job postings

### Post-Launch (60 days)

- [ ] 10+ applications received
- [ ] 1+ position filled via website
- [ ] HR team trained on admin usage
- [ ] Zero email delivery failures

---

## Timeline & Milestones

| Phase | Date | Deliverable | Status |
|-------|------|-------------|--------|
| Phase 1 — Core | Jun 2026 | Careers page + admin CRUD | ✅ Done |
| Phase 2 — Application | Jul 2026 | Form + email notifications | ✅ Done |
| Phase 3 — Enhancement | Jul 2026 | Level, benefits, filters | ✅ Done |
| Phase 4 — ATS Lite | Q4 2026 | Enhanced tracking | Planned |

---

## 📄 Related Documents

- [Careers Spec](./12_CAREERS_SPEC.md)
- [Compro PRD](./09_COMPRO_PRD.md)
- [Organization](../docs/04_ORGANIZATION.md)
- [Products](../docs/08_PRODUCTS.md)

---

*Last Updated: July 8, 2026*  
*Next Review: October 2026*

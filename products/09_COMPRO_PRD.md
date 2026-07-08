# Product Requirements Document (PRD)
## DN Tech Company Profile Website (Compro)

**Document Version**: 1.0  
**Last Updated**: July 8, 2026  
**Status**: Published  
**Owner**: Dozer

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

**DN Tech Company Profile Website** — platform web full-stack yang terdiri dari website publik dan admin dashboard terintegrasi.

### Product Vision

Membangun company profile profesional dan dinamis yang mencerminkan inovasi dan expertise DN Tech, sekaligus memberikan kemampuan content management yang seamless untuk staf non-teknis.

### Goal Statement

- Menjadi presence digital utama perusahaan di dntech.id
- Menampilkan layanan dan solusi secara profesional
- Menangkap lead generation melalui form kontak dan interaktif
- Mendukung multi-page content management tanpa deploy ulang

### Success Metrics

| Metric | Target |
|--------|--------|
| Monthly unique visitors | 1.000+ |
| Contact form submissions | 20+/bulan |
| Page load time (P75) | < 2 detik |
| Lighthouse SEO score | 90+ |
| Website uptime | 99.5% |

---

## Problem Statement

### Current Situation

DN Tech membutuhkan presence digital profesional untuk:
- Menampilkan kapabilitas teknis kepada calon klien
- Menghasilkan qualified leads secara otomatis
- Memungkinkan tim marketing mengelola konten tanpa developer

### Problems to Solve

1. **No digital presence** — Perusahaan tidak memiliki website profesional
2. **Content management** — Update konten memerlukan developer
3. **Lead tracking** — Tidak ada sistem untuk menangkap dan melacak inquiries
4. **SEO visibility** — Tidak terindex di search engine untuk keyword relevan
5. **Brand credibility** — Calon klien sulit mengevaluasi kapabilitas perusahaan

---

## Target Audience

### Primary Segments

#### Prospective Client (Budi — Business Owner)
- **Age**: 35–55
- **Role**: CEO/Founder SMB
- **Goals**: Find reliable tech partner for digitalization
- **Pain Points**: Difficulty evaluating vendors, unclear offerings
- **Device**: Desktop 60%, Mobile 40%

#### Admin Staff (Siti — Marketing Manager)
- **Age**: 25–40
- **Technical Level**: Non-technical to basic
- **Goals**: Update content, manage services, track leads
- **Frequency**: Daily to weekly updates

#### HR Staff (Andi — HR Manager)
- **Age**: 30–45
- **Goals**: Manage team info, careers page
- **Frequency**: Monthly updates

---

## Key Features

### 4.1 Public Website Features

| Feature | Priority | Status |
|---------|----------|--------|
| Home page dengan hero & CTA | P0 | ✅ Done |
| Services listing & detail | P0 | ✅ Done |
| Portfolio / case studies | P0 | ✅ Done |
| Blog dengan SEO | P0 | ✅ Done |
| About company page | P0 | ✅ Done |
| Team showcase | P1 | ✅ Done |
| Contact form (multi-step) | P0 | ✅ Done |
| Testimonials | P1 | ✅ Done |
| FAQ section | P1 | ✅ Done |
| Careers page | P1 | ✅ Done |
| Terms & privacy policy | P0 | ✅ Done |
| Solution quiz | P2 | ✅ Done |
| ROI calculator | P2 | ✅ Done |
| Newsletter subscription | P1 | ✅ Done |
| Exit intent modal | P2 | ✅ Done |
| Sitewide search | P1 | ✅ Done |

### 4.2 Admin Dashboard Features

| Feature | Priority | Status |
|---------|----------|--------|
| JWT authentication & RBAC | P0 | ✅ Done |
| Service management (CRUD) | P0 | ✅ Done |
| Portfolio management | P0 | ✅ Done |
| Blog management + publish | P0 | ✅ Done |
| Team member management | P1 | ✅ Done |
| Testimonial management | P1 | ✅ Done |
| Lead management + export | P0 | ✅ Done |
| Analytics dashboard | P1 | ✅ Done |
| Settings management | P0 | ✅ Done |
| Media library | P1 | ✅ Done |
| Email log monitoring | P1 | ✅ Done |
| User management | P0 | ✅ Done |

### 4.3 Out of Scope

- E-commerce / payment processing
- Customer portal login
- Live chat (native — Crisp integration only)
- Social media auto-posting
- Project management integration

---

## User Flows

### Flow 1: Prospective Client Inquiry

```
Visit dntech.id → Browse services → Read case study
    → Click "Contact Us" → Fill multi-step form
    → Submit → Thank you page
    → Email confirmation to user
    → Admin notification to info@dntech.id
    → Lead appears in admin dashboard
```

### Flow 2: Admin Content Update

```
Login /admin → Navigate to Services
    → Create new service → Fill form → Save
    → Service appears on public website (status: active)
    → No code deployment required
```

### Flow 3: Blog Publishing

```
Login /admin → Blog → Create post
    → Write content (HTML) → Set status: draft
    → Preview → Publish
    → Post live at /blog/[slug]
    → Sitemap auto-updated
```

---

## Requirements

### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001 | Public pages load content from API/database | P0 |
| FR-002 | Contact form validates and stores submissions | P0 |
| FR-003 | Admin CRUD for all content types | P0 |
| FR-004 | JWT auth with role-based access | P0 |
| FR-005 | Email notifications on form submission | P0 |
| FR-006 | Analytics page view tracking | P1 |
| FR-007 | Media upload with file type validation | P1 |
| FR-008 | SEO metadata per page | P0 |
| FR-009 | Responsive design 320px–4K | P0 |
| FR-010 | Lead status workflow management | P1 |

### Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-001 | Page load time | < 2s (P75) |
| NFR-002 | API response time | < 200ms (cached) |
| NFR-003 | Uptime | 99.5% |
| NFR-004 | Concurrent users | 100+ |
| NFR-005 | Security | OWASP Top 10 mitigated |
| NFR-006 | Accessibility | WCAG 2.1 AA (target) |

---

## Design & UX

### Design System (V2)

- **Style**: Solid colors, no gradients
- **Primary color**: `#2563eb` (blue-600), configurable via admin
- **Typography**: System font stack (no Google Fonts dependency)
- **Language**: Bahasa Indonesia
- **Currency**: Rupiah (IDR)

### Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| Mobile (< 640px) | Single column, hamburger menu |
| Tablet (640–1024px) | 2 columns |
| Desktop (> 1024px) | 3–4 columns, full navigation |

### Key UX Patterns

- Multi-step contact form (reduce abandonment)
- Sticky CTA on mobile
- Exit intent modal (desktop only, max 1/session)
- Debounced search (300ms)
- Loading states on all async operations

---

## Technical Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL 13+, Prisma ORM 6 |
| Auth | JWT + RBAC |
| Email | SMTP (Nodemailer) |
| Deployment | PM2 + Nginx / Docker Compose |

Detail: [Tech Stack](../docs/05_TECH_STACK.md)

---

## Success Criteria

### Launch Criteria

- [x] All P0 features implemented
- [x] Production deployed at dntech.id
- [x] Admin CMS functional with seed admin
- [x] Email system operational
- [x] SEO foundations (sitemap, robots, meta tags)
- [x] Performance optimizations (V4)
- [ ] Lighthouse audit score 80+ (pending verification)

### Post-Launch (30 days)

- [ ] 500+ unique visitors
- [ ] 10+ form submissions
- [ ] Zero critical security issues
- [ ] Content fully populated via admin

---

## Timeline & Milestones

| Phase | Date | Deliverable | Status |
|-------|------|-------------|--------|
| v1 — Initial | Jun 2026 | Core website + admin | ✅ Done |
| v2 — Design & SEO | Jul 2026 | Design system, remove fake data | ✅ Done |
| v3 — UX Polish | Jul 2026 | Exit modal, logo, mobile nav | ✅ Done |
| v4 — Performance | Jul 2026 | Caching, streaming, image opt | ✅ Done |
| v5 — Email | Jul 2026 | SMTP, templates, logging | ✅ Done |
| v6 — Analytics | Q3 2026 | Enhanced reporting | Planned |

---

## 📄 Related Documents

- [Compro Spec](./10_COMPRO_SPEC.md)
- [Tech Stack](../docs/05_TECH_STACK.md)
- [Architecture](../docs/06_ARCHITECTURE.md)
- [Dev Guidelines](../docs/07_DEV_GUIDELINES.md)
- [Products](../docs/08_PRODUCTS.md)

---

*Last Updated: July 8, 2026*  
*Next Review: October 2026*

# Technical Specification (SDD)
## DN Tech Company Profile Website (Compro)

**Document Version**: 1.0  
**Last Updated**: July 8, 2026  
**Status**: Published  
**Owner**: CTO / Tech Lead

---

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Database Design](#database-design)
- [API Specification](#api-specification)
- [Security](#security)
- [Testing Strategy](#testing-strategy)
- [Deployment](#deployment)
- [Performance Requirements](#performance-requirements)

---

## Architecture Overview

### High-Level Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  Client Layer                                                │
│  ┌──────────────────┐       ┌──────────────────┐              │
│  │ Public Website   │       │ Admin Dashboard  │              │
│  │ Next.js :3000    │       │ /admin/*         │              │
│  └────────┬─────────┘       └────────┬─────────┘              │
└───────────┼──────────────────────────┼───────────────────────┘
            │         REST API         │
            └────────────┬─────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Express API (:4000) /api/v1                                 │
│  Auth · Validation · Rate Limit · CORS · Compression        │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌────────────┐  ┌──────────┐  ┌─────────────┐
   │ PostgreSQL │  │  Uploads │  │ SMTP Server │
   └────────────┘  └──────────┘  └─────────────┘
```

### Design Goals

- **Scalability**: 1K → 100K+ monthly users
- **Maintainability**: Modular, documented, typed
- **Security**: Defense-in-depth, secure by default
- **Performance**: < 2s page load, optimized queries
- **DX**: Clear structure, easy to extend

---

## Frontend Architecture

### Route Structure

```
frontend/src/app/
├── layout.tsx              # Root layout + metadata
├── (public)/               # Public website
│   ├── page.tsx            # Home
│   ├── services/[slug]/
│   ├── portfolio/[slug]/
│   ├── blog/[slug]/
│   ├── about/
│   ├── team/
│   ├── contact/
│   ├── faq/
│   ├── careers/
│   ├── testimonials/
│   ├── terms/
│   └── privacy/
└── admin/                  # Admin dashboard
    ├── login/
    ├── dashboard/
    ├── services/
    ├── portfolio/
    ├── blog/
    ├── leads/
    ├── team/
    ├── testimonials/
    ├── faqs/
    ├── careers/
    ├── media/
    ├── analytics/
    ├── settings/
    └── users/
```

### Component Architecture

| Layer | Components | Purpose |
|-------|------------|---------|
| `ui/` | Button, Card, Input | Base UI primitives |
| `common/` | Header, Footer, PageTracker | Layout & tracking |
| `forms/` | ContactForm, MultiStepForm | Form handling |
| `interactive/` | SolutionQuiz, ROICalculator | Engagement features |
| `admin/` | AdminSidebar, AdminCrudPage | Admin UI |
| `seo/` | JsonLd, Analytics | SEO & tracking |

### State Management

| Scope | Mechanism | Usage |
|-------|-----------|-------|
| Auth (admin) | React Context | Login, logout, session |
| Server data | fetch + SWR | Public pages, admin CRUD |
| Form state | React Hook Form | All forms |
| Local UI | useState | Modal, accordion, search |

### Rendering Strategy

| Page | Type | Revalidate |
|------|------|------------|
| Home, About, Services | Server Component + ISR | 60s |
| Blog listing | Dynamic SSR | — |
| Admin pages | Client Component | — |
| FAQ | Client Component | — |

---

## Backend Architecture

### Layered Structure

```
Routes → Middleware → Services → Prisma → Database
```

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Routes | `src/routes/` | HTTP handling |
| Middleware | `src/middleware/` | Auth, RBAC, logging |
| Services | `src/services/` | Email, business logic |
| Utils | `src/utils/` | Helpers, response format |
| Data | `prisma/` | Schema, migrations |

### Middleware Stack

1. `helmet` — Security headers
2. `cors` — FRONTEND_URL whitelist
3. `compression` — Gzip
4. `express.json` — Body parser (10MB max)
5. `express-rate-limit` — 100 req/min
6. Static `/uploads`
7. Routes
8. 404 handler
9. Error handler

---

## Database Design

### Schema Overview

| Table | Model | Key Fields |
|-------|-------|------------|
| `users` | User | email, role, password_hash |
| `services` | Service | name, slug, status, features (JSON) |
| `portfolio_items` | PortfolioItem | title, slug, outcomes, industries |
| `blog_posts` | BlogPost | title, slug, content, status, published_at |
| `team_members` | TeamMember | name, role, department, bio |
| `testimonials` | Testimonial | quote, client_name, is_approved |
| `faqs` | Faq | question, answer, category |
| `careers` | Career | title, department, requirements |
| `form_submissions` | FormSubmission | type, status, email, message |
| `media` | Media | filename, url, mime_type |
| `site_settings` | SiteSettings | company_name, about_content (JSON) |
| `analytics_events` | AnalyticsEvent | event_type, page_url, device_type |
| `newsletter_subscribers` | NewsletterSubscriber | email, confirmed_at |
| `quiz_submissions` | QuizSubmission | answers, recommendations |
| `activity_logs` | ActivityLog | action, entity_type, changes |
| `email_logs` | EmailLog | recipient, subject, status |

### Enums

```
UserRole:        SuperAdmin | ContentManager | Editor | Viewer
ContentStatus:   draft | active | archived
BlogStatus:      draft | published | scheduled
LeadStatus:      new | contacted | qualified | converted | rejected
FormType:        contact | service_request | career
```

### Indexes

- `services`: slug, status, display_order
- `blog_posts`: slug, status, published_at
- `form_submissions`: email, status, created_at
- `analytics_events`: event_type, created_at

---

## API Specification

### Response Format

**Success:**
```json
{
  "success": true,
  "data": { },
  "timestamp": "2026-07-08T10:30:00.000Z"
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [{ "field": "email", "message": "Invalid format" }]
  }
}
```

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/services` | List active services |
| GET | `/services/:slug` | Service detail + related |
| GET | `/portfolio` | List portfolio (paginated) |
| GET | `/portfolio/:slug` | Portfolio detail |
| GET | `/blog` | List published posts |
| GET | `/blog/:slug` | Post detail + related |
| GET | `/team` | Active team members |
| GET | `/testimonials` | Approved testimonials |
| GET | `/faq` | Active FAQs |
| GET | `/careers` | Active job listings |
| GET | `/settings` | Public site settings |
| GET | `/search?q=` | Sitewide search |
| POST | `/forms/contact` | Submit contact form |
| POST | `/forms/service-request` | Service inquiry |
| POST | `/forms/career` | Job application |
| POST | `/newsletter/subscribe` | Newsletter signup |
| POST | `/quiz/submit` | Solution quiz |
| POST | `/analytics/track` | Track page view |

### Auth Endpoints

| Method | Endpoint | Rate Limit |
|--------|----------|------------|
| POST | `/auth/login` | 5 / 15 min |
| POST | `/auth/logout` | — |
| GET | `/auth/me` | — |
| POST | `/auth/forgot-password` | 3 / hour |
| POST | `/auth/reset-password` | — |

### Admin Endpoints (Bearer Token)

CRUD pattern for: `/admin/services`, `/admin/portfolio`, `/admin/blog`, `/admin/team`, `/admin/testimonials`, `/admin/faqs`, `/admin/careers`, `/admin/media`, `/admin/leads`, `/admin/settings`, `/admin/users`, `/admin/analytics`

---

## Security

| Aspect | Implementation |
|--------|---------------|
| Password | bcrypt, 12 rounds |
| API Auth | JWT Bearer (24h expiry) |
| RBAC | 4 roles with permission matrix |
| HTTPS | Required in production |
| CORS | FRONTEND_URL whitelist |
| Rate Limiting | Login 5/15min, Forms 5/hr, API 100/min |
| Input Validation | Zod server-side |
| SQL Injection | Prisma parameterized queries |
| XSS | React escape + HTML sanitize |
| File Upload | MIME whitelist, 5MB max |
| Spam | Honeypot on public forms |
| Activity Log | All admin actions logged |

---

## Testing Strategy

### Build Verification

```bash
cd frontend && npm run build && npm run lint
cd backend && npm run build
```

### Manual Test Checklist

- [ ] All public pages render with API data
- [ ] Contact form submission end-to-end
- [ ] Admin login + CRUD operations
- [ ] Email delivery (form, newsletter, career)
- [ ] Mobile responsive (320px viewport)
- [ ] Search functionality
- [ ] Media upload/delete

### Performance Testing

- Lighthouse audit (target: 80+ performance, 90+ SEO)
- API response time measurement
- Load test with 100 concurrent users

---

## Deployment

### Production

| Component | Detail |
|-----------|--------|
| Server | Ubuntu VPS, `/var/www/dntech` |
| Process Manager | PM2 (`dntech-api`, `dntech-web`) |
| Reverse Proxy | Nginx (SSL, www redirect) |
| Database | PostgreSQL |
| URLs | dntech.id, api.dntech.id |

### Deploy Checklist

```bash
cd backend
npm ci && npx prisma generate && npm run build
pm2 restart dntech-api

cd ../frontend
npm ci && npm run build
pm2 restart dntech-web
```

### Docker (Development)

```bash
docker compose up -d
# Website: localhost:3000
# API: localhost:4000
```

---

## Performance Requirements

| Metric | Target | Implementation |
|--------|--------|----------------|
| Page load (P75) | < 2s | ISR, caching, image opt |
| API response | < 200ms | TTL cache, indexes |
| Lighthouse SEO | 90+ | Meta, sitemap, JSON-LD |
| Lighthouse Perf | 80+ | Streaming, deferred scripts |
| Uptime | 99.5% | PM2 auto-restart, health check |

### V4 Optimizations Applied

- Homepage Suspense streaming
- Server-side settings cache
- GA deferred to idle, Crisp on interaction
- `next/image` for all images
- 300ms search debounce
- Backend API TTL cache with invalidation

---

## 📄 Related Documents

- [Compro PRD](./09_COMPRO_PRD.md)
- [Architecture](../docs/06_ARCHITECTURE.md)
- [Tech Stack](../docs/05_TECH_STACK.md)
- [Dev Guidelines](../docs/07_DEV_GUIDELINES.md)

---

*Last Updated: July 8, 2026*  
*Next Review: October 2026*

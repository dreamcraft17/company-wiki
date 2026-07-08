# System Architecture

**Document Version**: 1.0  
**Last Updated**: July 8, 2026  
**Status**: Published  
**Owner**: CTO / Tech Lead

---

## 📋 Table of Contents

- [Arsitektur Overview](#arsitektur-overview)
- [Client Layer](#client-layer)
- [Application Layer](#application-layer)
- [Data Layer](#data-layer)
- [Alur Data](#alur-data)
- [Keamanan & RBAC](#keamanan--rbac)
- [Deployment Architecture](#deployment-architecture)
- [Performance Architecture](#performance-architecture)
- [Future Considerations](#future-considerations)

---

## Arsitektur Overview

DN Tech menggunakan **decoupled three-tier architecture** dengan frontend dan backend terpisah yang berkomunikasi via REST API.

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────────┐       ┌──────────────────┐              │
│  │  Public Website  │       │ Admin Dashboard  │              │
│  │  Next.js :3000   │       │ /admin/*         │              │
│  └────────┬─────────┘       └────────┬─────────┘              │
└───────────┼──────────────────────────┼───────────────────────┘
            │         HTTPS/REST       │
            └────────────┬─────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Express API Server (:4000)                  │   │
│  │  Middleware: Auth · Validation · Rate Limit · CORS   │   │
│  │  Routes: /api/v1/* · /api/v1/admin/*                 │   │
│  │  Services: Email · Lead · Analytics                  │   │
│  └──────────────────────┬───────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌────────────┐  ┌──────────┐  ┌─────────────┐
   │ PostgreSQL │  │  Uploads │  │ SMTP Server │
   │  (Prisma)  │  │  (disk)  │  │ (Mailspace) │
   └────────────┘  └──────────┘  └─────────────┘
```

### Design Principles

| Prinsip | Implementasi |
|---------|--------------|
| Decoupled | Frontend & backend terpisah, komunikasi via API |
| Content vs Code | Konten di database, bukan hardcoded |
| Mobile-first | Responsive 320px – 4K |
| Security by default | JWT, RBAC, rate limiting, input validation |
| SEO-friendly | SSR/SSG, sitemap, structured data |

---

## Client Layer

### Public Website

- **Framework**: Next.js 16 App Router
- **Routes**: `frontend/src/app/(public)/`
- **Rendering**: Server Components + ISR untuk halaman statis
- **Data fetching**: Native `fetch` ke backend API
- **Tracking**: `PageTracker` component → POST `/analytics/track`

### Admin Dashboard

- **Routes**: `frontend/src/app/admin/`
- **Auth**: JWT di `localStorage`, `AuthContext` provider
- **Data fetching**: `apiFetch()` dengan Bearer token
- **CRUD pattern**: Generic `AdminCrudPage` component

---

## Application Layer

### Backend Structure

```
backend/src/
├── index.ts              # Express entry + middleware stack
├── config/
│   └── database.ts       # Prisma client singleton
├── middleware/
│   └── auth.ts           # JWT verify, RBAC guards
├── routes/
│   ├── auth.ts           # Login, logout, password reset
│   ├── services.ts       # Public services API
│   ├── portfolio.ts      # Public portfolio API
│   ├── blog.ts           # Public blog API
│   ├── forms.ts          # Contact/service/career forms
│   ├── careers.ts        # Public careers API
│   ├── analytics.ts      # Page view tracking
│   ├── search.ts         # Sitewide search
│   └── admin.ts          # All admin CRUD endpoints
├── services/
│   └── EmailService.ts   # SMTP email delivery
└── utils/
    ├── auth.ts           # JWT, bcrypt, RBAC permissions
    └── helpers.ts        # Response format, pagination
```

### Layered Architecture

| Layer | Tanggung Jawab |
|-------|----------------|
| Routes | HTTP handling, request parsing |
| Middleware | Auth, RBAC, activity logging |
| Services | Business logic (email, leads) |
| Utils | Helpers, response formatting |
| Data (Prisma) | ORM, schema, migrations |

### API Endpoint Groups

| Group | Prefix | Auth |
|-------|--------|------|
| Public | `/api/v1/*` | None |
| Auth | `/api/v1/auth/*` | Partial |
| Admin | `/api/v1/admin/*` | Bearer JWT |
| Health | `/health` | None |

---

## Data Layer

### Database Architecture

- **Type**: Relational (PostgreSQL)
- **ORM**: Prisma dengan parameterized queries
- **Backup**: Daily automated backups (production)
- **Soft delete**: User, Service, PortfolioItem, BlogPost

### Entity Relationships

```
User ──┬── Service (creates)
       ├── BlogPost (authors)
       ├── FormSubmission (assigned)
       └── ActivityLog (generates)

Media ──┬── PortfolioItem (featured_image)
        ├── BlogPost (featured_image)
        ├── TeamMember (photo)
        └── Testimonial (photo)

SiteSettings (singleton, id=1) ── Global config
```

### Caching (V4)

- Public API endpoints: in-memory TTL cache
- Admin mutations: automatic cache invalidation
- Server-side settings: Next.js cache + pass to GA/Crisp loaders

---

## Alur Data

### Public Page Request

```
Browser → Next.js (SSR/ISR) → fetch /api/v1/* → Prisma → PostgreSQL
                                      ↓
                              JSON response → Render HTML
```

### Form Submission

```
User fills form → Client validation (Zod)
    → POST /api/v1/forms/contact
    → Server validation → Save FormSubmission
    → EmailService → SMTP → info@dntech.id + user confirmation
    → Redirect /thank-you
```

### Admin CRUD

```
Admin login → JWT stored in localStorage
    → fetch /api/v1/admin/* with Bearer token
    → Middleware: authenticate → requireRole/requireWrite
    → Prisma CRUD → Activity log
    → Cache invalidation (public endpoints)
```

---

## Keamanan & RBAC

### Authentication Flow

```
1. POST /auth/login { email, password }
2. Backend verify bcrypt hash
3. Generate JWT: { sub, email, role, iat, exp }
4. Client store token in localStorage
5. Requests: Authorization: Bearer <token>
6. Middleware verifyToken → attach user to request
```

**Token expiry**: 24 jam (configurable via `JWT_EXPIRES_IN`)

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **SuperAdmin** | Full access — users, settings, activity logs |
| **ContentManager** | Content CRUD, leads, analytics, settings view |
| **Editor** | View all content, view leads, view analytics |
| **Viewer** | Read-only access |

### Security Measures

| Aspek | Implementasi |
|-------|--------------|
| Password | bcrypt, 12 salt rounds, min 8 chars |
| API Auth | JWT Bearer tokens |
| HTTPS | Required in production |
| CORS | Restricted to FRONTEND_URL |
| Headers | Helmet.js |
| Rate Limiting | Login: 5/15min, Forms: 5/hour, API: 100/min |
| Input Validation | Zod schemas server-side |
| SQL Injection | Prisma parameterized queries |
| XSS | React auto-escape, sanitize HTML |
| File Upload | MIME whitelist, 5MB limit |
| Spam | Honeypot field on public forms |

---

## Deployment Architecture

### Production Setup

```
Internet
    │
    ▼
┌─────────────┐
│  Cloudflare │  CDN + DDoS protection
│  / Nginx    │  SSL termination
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
   ▼       ▼
┌──────┐ ┌──────┐
│ :3000│ │ :4000│
│ Next │ │ API  │
│ (PM2)│ │ (PM2)│
└──┬───┘ └──┬───┘
   │        │
   │        ▼
   │   ┌──────────┐
   │   │PostgreSQL│
   │   └──────────┘
   │
   └── Static assets via Nginx
```

### Docker Compose (Development)

```yaml
services:
  db:        PostgreSQL 15 → :5432
  backend:   Express API  → :4000
  frontend:  Next.js      → :3000
```

### CI/CD (Recommended)

```yaml
on: [push, pull_request]
jobs:
  test:
    - npm ci && npm run lint && npm run build
  deploy:
    if: main branch
    - docker build & push
    - pm2 restart
```

---

## Performance Architecture

### V4 Optimizations (Implemented)

| Optimization | Detail |
|--------------|--------|
| Streaming | Homepage Suspense for blog/team sections |
| Caching | Server cache for settings, API TTL cache |
| Deferred scripts | GA on idle, Crisp on first interaction |
| Images | `next/image` for all public images |
| Search | 300ms debounce, cancel previous requests |
| Fonts | No Google Fonts dependency at build time |

### Performance Targets

| Metric | Target |
|--------|--------|
| Page load (P75) | < 2 detik |
| Lighthouse SEO | 90+ |
| Lighthouse Performance | 80+ |
| API response | < 200ms (cached) |
| Uptime | 99.5% |

---

## Future Considerations

### Short-term

- Redis cache layer untuk high-traffic endpoints
- AWS S3 untuk media storage (replace local disk)
- Automated Lighthouse CI checks

### Medium-term

- Microservices extraction (Content, Lead, Analytics services)
- Kubernetes orchestration
- Multi-region deployment

### Long-term

- GraphQL API layer (optional)
- Real-time features via WebSocket
- Multi-tenant SaaS architecture

---

## 📄 Related Documents

- [Tech Stack](./05_TECH_STACK.md)
- [Dev Guidelines](./07_DEV_GUIDELINES.md)
- [Compro Spec](../products/10_COMPRO_SPEC.md)
- [Careers Spec](../products/12_CAREERS_SPEC.md)

---

*Last Updated: July 8, 2026*

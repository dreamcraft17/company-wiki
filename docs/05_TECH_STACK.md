# Technology Stack

**Document Version**: 1.0  
**Last Updated**: July 8, 2026  
**Status**: Published  
**Owner**: Dozer

---

## 📋 Table of Contents

- [Ringkasan Stack](#ringkasan-stack)
- [Frontend](#frontend)
- [Backend](#backend)
- [Database](#database)
- [Infrastructure](#infrastructure)
- [Third-Party Integrations](#third-party-integrations)
- [Development Tools](#development-tools)
- [Version Policy](#version-policy)

---

## Ringkasan Stack

DN Tech menggunakan **modern full-stack JavaScript/TypeScript** dengan arsitektur decoupled (frontend ↔ API ↔ database).

```
┌─────────────────────────────────────────────┐
│  Frontend: Next.js 16 + React 19 + Tailwind │
├─────────────────────────────────────────────┤
│  Backend:  Node.js + Express 5 + TypeScript │
├─────────────────────────────────────────────┤
│  Database: PostgreSQL 13+ + Prisma ORM 6   │
├─────────────────────────────────────────────┤
│  Infra:    Nginx + PM2 / Docker Compose     │
└─────────────────────────────────────────────┘
```

---

## Frontend

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **Next.js** | 16.x | App Router, SSR/SSG, routing, SEO |
| **React** | 19.x | UI components, hooks |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **React Hook Form** | 7.x | Form handling & validation |
| **Zod** | 4.x | Schema validation (client) |
| **SWR** | 2.x | Data fetching & caching (admin) |
| **Lucide React** | 1.x | Icon library |

### Frontend Patterns

- **App Router** — File-based routing di `src/app/`
- **Route groups** — `(public)/` untuk website, `admin/` untuk dashboard
- **Server Components** — Homepage, About, Services (ISR revalidate: 60s)
- **Client Components** — Admin pages, FAQ accordion, interactive forms
- **Output mode** — `standalone` untuk Docker deployment

### Rendering Strategy

| Halaman | Strategy | Revalidate |
|---------|----------|------------|
| Home, About, Services | Server Component + ISR | 60s |
| Blog listing | Dynamic SSR | — |
| Blog detail | SSR + metadata | — |
| Admin pages | Client Component | — |
| FAQ | Client Component | — |

---

## Backend

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **Node.js** | 18+ | Runtime |
| **Express** | 5.x | HTTP API server |
| **TypeScript** | 5.x | Type safety |
| **Prisma** | 6.x | ORM, migrations, seed |
| **JWT** | 9.x | Admin authentication |
| **bcryptjs** | — | Password hashing (12 rounds) |
| **Zod** | 3.x | Request validation (server) |
| **Multer** | 1.x | File upload handling |
| **Helmet** | 8.x | Security headers |
| **compression** | 1.x | Gzip response |
| **express-rate-limit** | 7.x | API rate limiting |
| **Nodemailer** | — | SMTP email delivery |

### Middleware Stack (urutan)

1. `helmet` — Security headers
2. `cors` — Cross-origin (FRONTEND_URL whitelist)
3. `compression` — Gzip
4. `express.json` — Body parser (max 10MB)
5. `express-rate-limit` — 100 req/min per IP
6. Static files — `/uploads`
7. Route handlers
8. 404 handler
9. Global error handler

### API Conventions

- Base URL: `/api/v1`
- Response format: `{ success, data, timestamp }`
- Pagination: `{ page, pageSize, total, pages }`
- Error format: `{ success: false, error: { code, message, details } }`

---

## Database

| Aspek | Detail |
|-------|--------|
| **Production** | PostgreSQL 13+ |
| **Development** | PostgreSQL via Docker / SQLite (opsional) |
| **ORM** | Prisma 6.x |
| **Migrations** | `prisma migrate dev` (dev), `prisma migrate deploy` (prod) |
| **Seed** | `npm run db:seed` — admin user + empty settings |

### Model Utama

| Model | Deskripsi |
|-------|-----------|
| User | Admin users + RBAC |
| Service | Layanan perusahaan |
| PortfolioItem | Portfolio & case studies |
| BlogPost | Artikel blog |
| TeamMember | Profil tim |
| Testimonial | Testimoni klien |
| Faq | FAQ entries |
| Career | Lowongan kerja |
| FormSubmission | Leads dari form |
| Media | File uploads |
| SiteSettings | Konfigurasi situs (singleton) |
| AnalyticsEvent | Page views & events |
| NewsletterSubscriber | Newsletter subscribers |
| QuizSubmission | Hasil kuis solusi |
| ActivityLog | Audit trail |
| EmailLog | Email delivery tracking |

### Enums

```
UserRole:        SuperAdmin | ContentManager | Editor | Viewer
ContentStatus:   draft | active | archived
BlogStatus:      draft | published | scheduled
LeadStatus:      new | contacted | qualified | converted | rejected
FormType:        contact | service_request | career
```

---

## Infrastructure

### Production (Current)

| Komponen | Teknologi | Detail |
|----------|-----------|--------|
| Server | Ubuntu VPS | `/var/www/dntech` |
| Reverse Proxy | Nginx | www + apex, API subdomain |
| Process Manager | PM2 | `dntech-api`, `dntech-web` |
| Database | PostgreSQL | Managed/local instance |
| SSL/TLS | Let's Encrypt / Cloudflare | HTTPS enforced |

### Development

| Komponen | Teknologi |
|----------|-----------|
| Containerization | Docker Compose 3.9 |
| Services | db (PostgreSQL 15), backend (4000), frontend (3000) |
| Hot Reload | tsx watch (backend), Next.js Turbopack (frontend) |

### URLs

| Environment | Website | API | Admin |
|-------------|---------|-----|-------|
| Production | dntech.id | api.dntech.id | dntech.id/admin |
| Local | localhost:3000 | localhost:4000 | localhost:3000/admin |

---

## Third-Party Integrations

| Service | Konfigurasi | Fungsi |
|---------|-------------|--------|
| **SMTP (Mailspace)** | `mx8.mailspace.id:465` | Transactional email |
| **SendGrid** | `SENDGRID_API_KEY` (alternatif) | Email delivery |
| **Google Analytics** | Admin settings → `googleAnalyticsId` | Traffic tracking |
| **Crisp Chat** | Admin settings → `crispWebsiteId` | Live chat widget |
| **Calendly** | Admin settings → `calendlyUrl` | Demo scheduling |

### Email Configuration

```
SMTP_HOST=mx8.mailspace.id
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@dntech.id
SMTP_FROM_NAME=DN Tech
ADMIN_EMAIL=info@dntech.id
```

---

## Development Tools

| Tool | Kegunaan |
|------|----------|
| VS Code | Primary IDE |
| Git + GitHub | Version control |
| Docker Desktop | Local database & services |
| PM2 | Production process management |
| ESLint | Code linting |
| Prisma Studio | Database GUI |

### VS Code Extensions (Recommended)

- Markdown All in One
- Markdown Preview Enhanced
- GitLens
- ESLint
- Tailwind CSS IntelliSense

---

## Version Policy

### Upgrade Guidelines

1. **Major versions** — Evaluate breaking changes, test di staging
2. **Minor versions** — Update quarterly dengan regression test
3. **Security patches** — Apply immediately
4. **Dependencies audit** — `npm audit` setiap sprint

### Current Version Timeline

| Version | Date | Focus |
|---------|------|-------|
| v1 | Jun 2026 | Initial spec |
| v2 | Jul 2026 | Design system, SEO, remove fake data |
| v3 | Jul 2026 | UX refinement (exit modal, logo, mobile nav) |
| v4 | Jul 2026 | Performance optimization |
| v5 | Jul 2026 | Email system implementation |

---

## dnCore ERP runtime

dnCore uses Express 5 native API + TypeScript + TypeORM/PostgreSQL and Remix SSR + React 19. Its VPS production topology is PM2 + Nginx: Express on port 3001, Remix on port 3000, and Nginx routes `/api/*` to the API. Docker/Kubernetes are optional alternatives for dnCore, not requirements for the standard VPS deployment. See [dnCore refactor](./products/dnpeople-erp/REFACTOR-EXPRESS-REMIX.md).

## 📄 Related Documents

- [Architecture](./06_ARCHITECTURE.md)
- [Dev Guidelines](./07_DEV_GUIDELINES.md)
- [Compro Spec](../products/10_COMPRO_SPEC.md)
- [Products](./08_PRODUCTS.md)

---

*Last Updated: July 8, 2026*

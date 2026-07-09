# DN Tech Company Profile Website — Dokumentasi Proyek

**Versi dokumen:** 1.0  
**Tanggal:** Juli 2026  
**Status:** Production Ready  
**Author:** Dozer (CEO)

---

## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Visi dan Tujuan Produk](#2-visi-dan-tujuan-produk)
3. [Arsitektur Sistem](#3-arsitektur-sistem)
4. [Tech Stack](#4-tech-stack)
5. [Struktur Proyek](#5-struktur-proyek)
6. [Website Publik](#6-website-publik)
7. [Admin Dashboard](#7-admin-dashboard)
8. [Backend API](#8-backend-api)
9. [Database dan Model Data](#9-database-dan-model-data)
10. [Autentikasi dan Otorisasi](#10-autentikasi-dan-otorisasi)
11. [Keamanan](#11-keamanan)
12. [Frontend — Detail Implementasi](#12-frontend--detail-implementasi)
13. [SEO dan Analytics](#13-seo-dan-analytics)
14. [Environment Variables](#14-environment-variables)
15. [Setup dan Development](#15-setup-dan-development)
16. [Deployment](#16-deployment)
17. [Seed Data](#17-seed-data)
18. [Troubleshooting](#18-troubleshooting)
19. [Referensi Dokumen](#19-referensi-dokumen)

---

## 1. Pendahuluan

### 1.1 Apa Itu Proyek Ini?

DN Tech Company Profile Website adalah platform web full-stack yang terdiri dari dua aplikasi terintegrasi:

1. **Website Publik** — Halaman company profile yang dapat diakses oleh calon klien, partner, dan publik umum. Menampilkan informasi perusahaan, layanan, portfolio, blog, tim, dan form kontak.

2. **Admin Dashboard** — Panel administrasi berbasis web untuk staf non-teknis mengelola seluruh konten website tanpa perlu deploy ulang kode. Termasuk manajemen leads, analytics, media, dan pengaturan situs.

Proyek ini dirancang berdasarkan tiga dokumen requirement resmi:

| Dokumen | File | Fungsi |
|---------|------|--------|
| PRD | `PRD/files2/01-PRD-DNTech-Company-Profile.md` | Product requirements, user stories, scope |
| SRS | `PRD/files2/02-SRS-DNTech-Company-Profile.md` | Functional & non-functional requirements |
| SDD | `PRD/files2/03-SDD-DNTech-Company-Profile.md` | Arsitektur teknis, database, API design |

### 1.2 Siapa Pengguna Sistem?

| Persona | Peran | Akses |
|---------|-------|-------|
| Calon klien / pengunjung | Browse konten, submit form | Website publik |
| Marketing Manager | Kelola konten, lihat leads | Admin dashboard |
| HR / Operations | Kelola tim, karir | Admin dashboard |
| System Admin | Kelola user, settings kritis | Admin dashboard (SuperAdmin) |

### 1.3 Prinsip Desain

- **Decoupled architecture** — Frontend dan backend terpisah, komunikasi via REST API
- **Content vs code separation** — Konten disimpan di database, bukan hardcoded
- **Mobile-first** — Responsive dari 320px hingga 4K
- **Security by default** — JWT, RBAC, rate limiting, input validation
- **SEO-friendly** — Meta tags, sitemap, structured routing

---

## 2. Visi dan Tujuan Produk

### 2.1 Visi

Membangun company profile profesional dan dinamis yang mencerminkan inovasi dan expertise DN Tech, sekaligus memberikan kemampuan content management yang seamless untuk staf non-teknis.

### 2.2 Tujuan Bisnis

- Menjadi presence digital utama perusahaan
- Menampilkan layanan dan solusi secara profesional
- Menangkap lead generation melalui form kontak
- Menampilkan portfolio dan kapabilitas perusahaan
- Meningkatkan brand visibility dan kredibilitas
- Mendukung multi-page content management

### 2.3 Metrik Keberhasilan

| Kategori | Metrik | Target |
|----------|--------|--------|
| Traffic | Monthly unique visitors | 1.000+ |
| Conversion | Contact form submissions | 20+/bulan |
| Performance | Page load time (P75) | < 2 detik |
| SEO | Lighthouse SEO score | 90+ |
| Uptime | Website availability | 99,5% |

---

## 3. Arsitektur Sistem

### 3.1 Diagram Arsitektur

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        PW["Public Website\n(Next.js)"]
        AD["Admin Dashboard\n(Next.js /admin)"]
    end

    subgraph API["Application Layer"]
        EX["Express API Server\n/api/v1"]
        MW["Middleware\nAuth · Validation · Rate Limit"]
    end

    subgraph Data["Data Layer"]
        DB[("Database\nPostgreSQL / SQLite")]
        FS["File Storage\n/uploads"]
    end

    PW -->|HTTPS REST| EX
    AD -->|HTTPS REST + JWT| EX
    EX --> MW
    MW --> DB
    MW --> FS
```

### 3.2 Alur Request (Website Publik)

```
Browser → Next.js (SSR/SSG) → fetch API backend → Prisma → Database
                                      ↓
                              JSON response → Render halaman
```

### 3.3 Alur Request (Admin Dashboard)

```
Browser → Next.js (Client Component) → localStorage JWT
              ↓
         fetch /api/v1/admin/* dengan Authorization: Bearer <token>
              ↓
         Backend: authenticate → requireRole/requireWrite → Prisma → Response
```

### 3.4 Pola Arsitektur Backend

Backend menggunakan **Layered Architecture**:

| Layer | Lokasi | Tanggung Jawab |
|-------|--------|----------------|
| Routes | `backend/src/routes/` | HTTP handling, request parsing |
| Middleware | `backend/src/middleware/` | Auth, RBAC, activity logging |
| Utils/Services | `backend/src/utils/` | Business logic, helpers |
| Data | `backend/prisma/` | ORM, schema, migrations, seed |

---

## 4. Tech Stack

### 4.1 Ringkasan Stack

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| Frontend framework | Next.js (App Router) | 16.2.9 |
| UI library | React | 19.2.4 |
| Styling | Tailwind CSS | 4.x |
| Form handling | React Hook Form + Zod | 7.x / 4.x |
| Data fetching (client) | SWR | 2.x |
| Icons | Lucide React | 1.x |
| Backend runtime | Node.js | 18+ |
| Backend framework | Express | 5.x |
| Language | TypeScript | 5.x |
| ORM | Prisma | 6.x |
| Database (production) | PostgreSQL | 13+ |
| Database (development) | SQLite | via Prisma |
| Authentication | JWT (jsonwebtoken) | 9.x |
| Password hashing | bcryptjs | 12 rounds |
| File upload | Multer | 1.x |
| Validation | Zod | 3.x |
| Security headers | Helmet | 8.x |
| Compression | compression | 1.x |
| Rate limiting | express-rate-limit | 7.x |
| Containerization | Docker + Docker Compose | 3.9 |

### 4.2 Frontend — Detail

#### Next.js 16 (App Router)

- **Routing:** File-based routing di `frontend/src/app/`
- **Route groups:** `(public)/` untuk website publik, `admin/` untuk dashboard
- **Rendering strategy:**
  - Home, About, Portfolio — Server Components dengan `fetch` + ISR (`revalidate: 60`)
  - Blog listing — Dynamic server rendering
  - FAQ — Client Component (interaktif accordion)
  - Admin pages — Client Components (`'use client'`)
- **Output mode:** `standalone` (untuk Docker deployment)
- **Font:** Inter (Google Fonts)

#### Tailwind CSS 4

- Utility-first styling
- Custom CSS variables di `globals.css` untuk primary color
- Prose classes untuk konten HTML (blog, legal pages)
- Breakpoints: mobile (< 640px), tablet (640–1024px), desktop (> 1024px)

#### State Management

| Scope | Mekanisme | Penggunaan |
|-------|-----------|------------|
| Auth (admin) | React Context (`AuthContext`) | Login, logout, user session |
| Server data | Native fetch + SWR (opsional) | Public pages, admin CRUD |
| Form state | React Hook Form | Contact form, admin forms |
| Local UI | useState | Modal, accordion, search |

### 4.3 Backend — Detail

#### Express 5

Entry point: `backend/src/index.ts`

Middleware stack (urutan):

1. `helmet` — Security headers
2. `cors` — Cross-origin (frontend URL)
3. `compression` — Gzip response
4. `express.json` — Body parser (max 10MB)
5. `express-rate-limit` — 100 req/min per IP pada `/api/v1`
6. Static files — `/uploads` untuk media
7. Route handlers
8. 404 handler
9. Global error handler

#### Prisma ORM

- Schema: `backend/prisma/schema.prisma`
- Client generation: `npx prisma generate`
- Dev sync: `npx prisma db push`
- Production migrations: `npx prisma migrate dev`
- Seed script: `backend/prisma/seed.ts`

#### TypeScript

- Strict mode enabled
- Compile target: ES2022
- Output: `backend/dist/`
- Dev runner: `tsx watch`

### 4.4 Database

**Production (recommended):** PostgreSQL 13+

```
DATABASE_URL=postgresql://user:pass@host:5432/dntech?schema=public
```

**Development (alternatif):** SQLite

```
DATABASE_URL=file:./dev.db
```

> Catatan: Schema saat ini dikonfigurasi untuk SQLite agar development tanpa Docker/PostgreSQL tetap bisa berjalan. Untuk production, ubah `provider` di `schema.prisma` kembali ke `postgresql`.

### 4.5 Infrastructure (Production — per SDD)

| Komponen | Teknologi |
|----------|-----------|
| CDN | Cloudflare / AWS CloudFront |
| Load balancer | Nginx |
| Container orchestration | Docker / Kubernetes / ECS |
| Cache | Redis (future) |
| Email | SendGrid / AWS SES |
| File storage | Local / AWS S3 |
| Monitoring | Prometheus + Grafana / CloudWatch |

---

## 5. Struktur Proyek

```
dntech/
├── PRD/                          # Product requirement documents
│   └── files2/
│       ├── 01-PRD-*.md
│       ├── 02-SRS-*.md
│       └── 03-SDD-*.md
├── docs/                         # Dokumentasi proyek (file ini)
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── seed.ts               # Seed data awal
│   ├── src/
│   │   ├── index.ts              # Express app entry
│   │   ├── config/
│   │   │   └── database.ts       # Prisma client singleton
│   │   ├── middleware/
│   │   │   └── auth.ts           # JWT auth, RBAC guards
│   │   ├── routes/
│   │   │   ├── auth.ts           # Login, logout, password reset
│   │   │   ├── services.ts       # Public services API
│   │   │   ├── portfolio.ts      # Public portfolio API
│   │   │   ├── blog.ts           # Public blog API
│   │   │   ├── forms.ts          # Contact/service/career forms
│   │   │   ├── team.ts
│   │   │   ├── testimonials.ts
│   │   │   ├── faq.ts
│   │   │   ├── settings.ts
│   │   │   ├── careers.ts
│   │   │   ├── analytics.ts      # Page view tracking
│   │   │   ├── search.ts         # Sitewide search
│   │   │   └── admin.ts          # All admin CRUD endpoints
│   │   └── utils/
│   │       ├── auth.ts           # JWT, bcrypt, RBAC permissions
│   │       └── helpers.ts        # Response format, errors, pagination
│   ├── uploads/                  # Uploaded media files
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # Root layout + metadata
│   │   │   ├── globals.css
│   │   │   ├── not-found.tsx
│   │   │   ├── robots.ts
│   │   │   ├── sitemap.ts
│   │   │   ├── (public)/         # Public website routes
│   │   │   │   ├── layout.tsx    # Header + Footer
│   │   │   │   ├── page.tsx      # Home
│   │   │   │   ├── services/
│   │   │   │   ├── portfolio/
│   │   │   │   ├── blog/
│   │   │   │   ├── about/
│   │   │   │   ├── team/
│   │   │   │   ├── contact/
│   │   │   │   ├── faq/
│   │   │   │   ├── careers/
│   │   │   │   ├── testimonials/
│   │   │   │   ├── terms/
│   │   │   │   └── privacy/
│   │   │   └── admin/            # Admin dashboard routes
│   │   │       ├── layout.tsx    # AuthProvider + Sidebar
│   │   │       ├── login/
│   │   │       ├── dashboard/
│   │   │       ├── services/
│   │   │       ├── portfolio/
│   │   │       ├── blog/
│   │   │       ├── leads/
│   │   │       ├── team/
│   │   │       ├── testimonials/
│   │   │       ├── faqs/
│   │   │       ├── careers/
│   │   │       ├── media/
│   │   │       ├── analytics/
│   │   │       ├── settings/
│   │   │       └── users/
│   │   ├── components/
│   │   │   ├── common/           # Header, Footer, PageTracker
│   │   │   ├── forms/            # ContactForm
│   │   │   ├── ui/               # Button, Card, Input
│   │   │   └── admin/            # AdminSidebar, AdminCrudPage
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── lib/
│   │   │   ├── api.ts            # API client + page tracking
│   │   │   └── utils.ts
│   │   └── types/
│   │       └── index.ts          # TypeScript interfaces
│   ├── Dockerfile
│   ├── next.config.ts
│   └── package.json
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 6. Website Publik

Base URL: `http://localhost:3000` (development)

### 6.1 Home (`/`)

**File:** `frontend/src/app/(public)/page.tsx`  
**Rendering:** Server Component, revalidate 60 detik

**Sections:**

| Section | Konten | Sumber Data |
|---------|--------|-------------|
| Hero | Tagline, CTA buttons | `GET /api/v1/settings` |
| Statistics | 100+ projects, 50+ clients, dll. | Static (hardcoded) |
| Services | 4 kartu layanan featured | `GET /api/v1/services` (slice 4) |
| Testimonials | 3 review klien | `GET /api/v1/testimonials` |
| Blog preview | 3 artikel terbaru | `GET /api/v1/blog?pageSize=3` |
| CTA | Ajakan hubungi | Static link ke /contact |

### 6.2 Services

| Route | File | Fitur |
|-------|------|-------|
| `/services` | `services/page.tsx` | Grid layanan, filter kategori, search |
| `/services/[slug]` | `services/[slug]/page.tsx` | Detail layanan, features, related services, CTA konsultasi |

**Filter URL:** `/services?category=Enterprise+Software`

**Data API:**
- Listing: `GET /api/v1/services`
- Detail: `GET /api/v1/services/:slug` (includes `relatedServices`)

### 6.3 Portfolio

| Route | File | Fitur |
|-------|------|-------|
| `/portfolio` | `portfolio/page.tsx` | Grid case studies, industry tags |
| `/portfolio/[slug]` | `portfolio/[slug]/page.tsx` | Overview, outcomes, testimonial klien |

**Pagination:** 12 item per halaman via query `page` dan `pageSize`

### 6.4 Blog

| Route | File | Fitur |
|-------|------|-------|
| `/blog` | `blog/page.tsx` | Post cards, filter kategori, pagination |
| `/blog/[slug]` | `blog/[slug]/page.tsx` | Full content HTML, author, related posts |

**Fitur:**
- Hanya post berstatus `published` dengan `publishedAt <= now`
- View count increment otomatis saat detail dibuka
- Search: `GET /api/v1/blog/search?q=`

### 6.5 About (`/about`)

Menampilkan konten dari `site_settings.aboutContent`:

- Company story
- Mission & Vision
- Values (4 nilai perusahaan)
- Achievements
- Team preview (4 anggota pertama)

### 6.6 Team (`/team`)

Grid semua anggota tim aktif dengan foto, role, department, bio.

### 6.7 Contact (`/contact`)

Form kontak dengan validasi client-side (React Hook Form + Zod):

| Field | Required | Validasi |
|-------|----------|----------|
| Name | Ya | Min 1 karakter |
| Email | Ya | Format email valid |
| Phone | Tidak | — |
| Subject | Tidak | Dropdown: General, Service, Partnership, Other |
| Message | Ya | Min 10 karakter |
| Honeypot | — | Hidden field anti-spam |

**Submit:** `POST /api/v1/forms/contact`

### 6.8 FAQ (`/faq`)

Client Component dengan:
- Accordion expand/collapse per pertanyaan
- Search real-time
- Filter by category
- Link ke contact jika pertanyaan tidak ditemukan

### 6.9 Careers (`/careers`)

Listing lowongan aktif dengan department, location, type, dan tombol Apply (redirect ke contact).

### 6.10 Testimonials (`/testimonials`)

Semua testimonial approved dengan rating bintang, quote, nama klien, company, position.

### 6.11 Legal Pages

| Route | Sumber Konten |
|-------|---------------|
| `/terms` | `GET /api/v1/settings/legal/terms` |
| `/privacy` | `GET /api/v1/settings/legal/privacy` |

Konten HTML di-render via `dangerouslySetInnerHTML` (dikelola dari admin settings).

### 6.12 Navigation & Layout

**Header** (`components/common/Header.tsx`):
- Sticky top navigation
- Mobile hamburger menu
- Sitewide search overlay
- CTA "Get Started"

**Footer** (`components/common/Footer.tsx`):
- Background putih, border-top — selaras header
- `FooterBrand`: logo kecil + wordmark **DN Tech.id**
- Bar atas: tagline CMS + CTA **Konsultasi Gratis**
- Link navigasi horizontal (2 baris: primary + secondary)
- Kontak inline (email, telepon, alamat) dari settings
- Copyright + legal links (Syarat & Ketentuan, Kebijakan Privasi)
- **Tidak** ada newsletter di footer (hanya di section homepage)

**Page Tracker** (`components/common/PageTracker.tsx`):
- Otomatis track page view ke analytics saat navigasi (kecuali `/admin/*`)

---

## 7. Admin Dashboard

Base URL: `http://localhost:3000/admin`  
API Base: `http://localhost:4000/api/v1/admin`

### 7.1 Login (`/admin/login`)

- Email + password authentication
- JWT disimpan di `localStorage` key `token`
- Redirect ke `/admin/dashboard` setelah sukses
- Checkbox "Remember me" (UI only, token expiry 24h)

**Default credentials (seed):**
```
Email:    admin@dntech.id
Password: Admin@123456
```

### 7.2 Dashboard (`/admin/dashboard`)

Overview metrics dari `GET /admin/analytics/overview`:

- Page views (30 hari) + perubahan vs periode sebelumnya
- Form submissions
- Total leads
- Conversion rate
- New leads count
- Quick action links

### 7.3 Services Management (`/admin/services`)

CRUD penuh untuk layanan:

| Field | Tipe | Keterangan |
|-------|------|------------|
| name | string | Nama layanan |
| description | text | Deskripsi panjang |
| category | string | Kategori grouping |
| status | enum | draft / active / archived |
| displayOrder | number | Urutan tampil |
| features | JSON | Array `{title, description}` |
| seoTitle | string | SEO meta title |
| seoDescription | string | SEO meta description |

### 7.4 Portfolio Management (`/admin/portfolio`)

CRUD case studies dengan fields: title, clientName, description, outcomes, testimonial, industries, status, displayOrder.

### 7.5 Blog Management (`/admin/blog`)

CRUD blog posts dengan fields: title, content (HTML), excerpt, category, status (draft/published/scheduled), publishedAt.

Endpoint publish: `POST /admin/blog/:id/publish`

### 7.6 Leads Management (`/admin/leads`)

**Fitur lengkap:**

- List semua form submission dengan pagination
- Filter by status: new, contacted, qualified, converted, rejected
- Detail view dengan full message
- Mark as read otomatis saat dibuka
- Update status (one-click buttons)
- Add internal notes (append dengan timestamp)
- Assign to team member
- Export CSV (`POST /admin/leads/export`)

**Lead statuses:**

```
new → contacted → qualified → converted
                           ↘ rejected
```

### 7.7 Team Management (`/admin/team`)

CRUD anggota tim: name, role, department, email, bio, displayOrder, isActive.

### 7.8 Testimonials (`/admin/testimonials`)

CRUD testimonial klien. Field `isApproved` menentukan visibility di website publik.

### 7.9 FAQs (`/admin/faqs`)

CRUD pertanyaan FAQ dengan category dan displayOrder.

### 7.10 Careers (`/admin/careers`)

CRUD lowongan kerja: title, department, location, type, description, requirements, status.

### 7.11 Media Library (`/admin/media`)

- Drag & drop upload
- Supported: JPG, PNG, WebP, GIF, PDF (max 5MB)
- Grid view dengan preview
- Copy URL ke clipboard
- Delete file (termasuk hapus dari filesystem)
- Edit alt text dan description

**Storage:** `backend/uploads/` served at `/uploads/:filename`

### 7.12 Analytics (`/admin/analytics`)

Dashboard visual:

| Widget | Endpoint | Data |
|--------|----------|------|
| Traffic by device | `/admin/analytics/traffic` | mobile, desktop, tablet counts |
| Top pages | `/admin/analytics/traffic` | 10 halaman terpopuler |
| Daily trend | `/admin/analytics/traffic` | Bar chart 30 hari |
| Submissions by type | `/admin/analytics/conversions` | contact, service_request, career |
| Leads by status | `/admin/analytics/conversions` | new, contacted, dll. |

### 7.13 Settings (`/admin/settings`)

**General:** companyName, tagline, email, phone, address, primaryColor  
**SEO:** googleAnalyticsId  
**Legal:** termsContent, privacyContent (HTML)

Hanya SuperAdmin dan ContentManager yang bisa edit.

### 7.14 User Management (`/admin/users`)

**SuperAdmin only.**

- Create user dengan role assignment
- Deactivate user (soft delete)
- Roles: SuperAdmin, ContentManager, Editor, Viewer

### 7.15 Sidebar Navigation

Komponen: `components/admin/AdminSidebar.tsx`

- Collapsible di mobile
- Menu items filtered by role (Users hanya untuk SuperAdmin)
- User info + logout button

---

## 8. Backend API

Base URL: `http://localhost:4000/api/v1`

### 8.1 Format Response

**Success (200/201):**
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-07-02T10:30:00.000Z"
}
```

**Paginated:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "pages": 8
  },
  "timestamp": "..."
}
```

**Error (4xx/5xx):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [{ "field": "email", "message": "Invalid email format" }]
  },
  "timestamp": "..."
}
```

### 8.2 Public Endpoints (No Auth)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/services` | List layanan aktif. Query: `category`, `search` |
| GET | `/services/:slug` | Detail layanan + related services |
| GET | `/portfolio` | List portfolio. Query: `page`, `pageSize`, `industry`, `search` |
| GET | `/portfolio/:slug` | Detail case study |
| GET | `/blog` | List blog published. Query: `page`, `pageSize`, `category`, `search` |
| GET | `/blog/search` | Search blog. Query: `q` |
| GET | `/blog/:slug` | Detail blog + related posts |
| GET | `/team` | List team members aktif |
| GET | `/testimonials` | List testimonial approved |
| GET | `/faq` | List FAQ aktif. Query: `category`, `search` |
| GET | `/settings` | Public site settings |
| GET | `/settings/legal/terms` | Terms of service HTML |
| GET | `/settings/legal/privacy` | Privacy policy HTML |
| GET | `/careers` | List lowongan aktif |
| GET | `/search` | Sitewide search. Query: `q` (min 2 chars) |
| POST | `/forms/contact` | Submit contact form |
| POST | `/forms/service-request` | Submit service request |
| POST | `/forms/career` | Submit job application |
| POST | `/analytics/track` | Track page view / event |

### 8.3 Authentication Endpoints

| Method | Endpoint | Deskripsi | Rate Limit |
|--------|----------|-----------|------------|
| POST | `/auth/login` | Login, returns JWT | 5 / 15 min |
| POST | `/auth/logout` | Logout (auth required) | — |
| GET | `/auth/me` | Current user info | — |
| POST | `/auth/forgot-password` | Request reset token | 3 / hour |
| POST | `/auth/reset-password` | Reset with token | — |

**Login request:**
```json
{
  "email": "admin@dntech.id",
  "password": "Admin@123456",
  "rememberMe": false
}
```

**Login response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbG...",
    "user": {
      "id": "uuid",
      "email": "admin@dntech.id",
      "name": "Super Admin",
      "role": "SuperAdmin"
    }
  }
}
```

### 8.4 Admin Endpoints (Bearer Token Required)

Header: `Authorization: Bearer <access_token>`

#### Services
| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/admin/services` | Authenticated |
| POST | `/admin/services` | Write |
| PATCH | `/admin/services/:id` | Write |
| DELETE | `/admin/services/:id` | Write (soft delete) |
| POST | `/admin/services/reorder` | Write |

#### Portfolio
| Method | Endpoint |
|--------|----------|
| GET/POST | `/admin/portfolio` |
| PATCH/DELETE | `/admin/portfolio/:id` |

#### Blog
| Method | Endpoint |
|--------|----------|
| GET/POST | `/admin/blog` |
| PATCH/DELETE | `/admin/blog/:id` |
| POST | `/admin/blog/:id/publish` |

#### Leads
| Method | Endpoint |
|--------|----------|
| GET | `/admin/leads` |
| GET | `/admin/leads/:id` |
| PATCH | `/admin/leads/:id/status` |
| PATCH | `/admin/leads/:id/assign` |
| POST | `/admin/leads/:id/notes` |
| POST | `/admin/leads/export` |
| DELETE | `/admin/leads/:id` |

#### Team, Testimonials, FAQs, Careers
Standard CRUD pattern: `GET/POST /admin/{resource}`, `PATCH/DELETE /admin/{resource}/:id`

#### Media
| Method | Endpoint |
|--------|----------|
| GET | `/admin/media` |
| POST | `/admin/media` | multipart/form-data, field: `file` |
| PATCH | `/admin/media/:id` |
| DELETE | `/admin/media/:id` |

#### Settings
| Method | Endpoint | Role |
|--------|----------|------|
| GET | `/admin/settings` | Authenticated |
| PATCH | `/admin/settings` | SuperAdmin, ContentManager |

#### Users
| Method | Endpoint | Role |
|--------|----------|------|
| GET/POST | `/admin/users` | SuperAdmin |
| PATCH/DELETE | `/admin/users/:id` | SuperAdmin |

#### Analytics
| Method | Endpoint |
|--------|----------|
| GET | `/admin/analytics/overview` | Query: `days` (default 30) |
| GET | `/admin/analytics/traffic` |
| GET | `/admin/analytics/conversions` |

#### Activity Logs
| Method | Endpoint | Role |
|--------|----------|------|
| GET | `/admin/activity-logs` | SuperAdmin |

### 8.5 Health Check

```
GET /health
→ { "status": "ok", "timestamp": "..." }
```

---

## 9. Database dan Model Data

### 9.1 Entity Relationship Overview

```mermaid
erDiagram
    User ||--o{ Service : creates
    User ||--o{ BlogPost : authors
    User ||--o{ FormSubmission : assigned
    User ||--o{ ActivityLog : generates
    User ||--o{ Media : uploads

    Media ||--o| PortfolioItem : featured_image
    Media ||--o| BlogPost : featured_image
    Media ||--o| TeamMember : photo
    Media ||--o| Testimonial : photo

    Service }|--|| PortfolioItem : service_ids_json
    FormSubmission }|--|| User : assigned_to
```

### 9.2 Tabel Database

| Tabel | Model Prisma | Deskripsi |
|-------|--------------|-----------|
| `users` | User | Admin users |
| `activity_logs` | ActivityLog | Audit trail |
| `media` | Media | Uploaded files |
| `services` | Service | Company services |
| `portfolio_items` | PortfolioItem | Case studies |
| `blog_posts` | BlogPost | Blog articles |
| `form_submissions` | FormSubmission | Leads / inquiries |
| `team_members` | TeamMember | Team profiles |
| `testimonials` | Testimonial | Client reviews |
| `faqs` | Faq | FAQ entries |
| `careers` | Career | Job listings |
| `analytics_events` | AnalyticsEvent | Page views, events |
| `site_settings` | SiteSettings | Global config (singleton, id=1) |
| `email_templates` | EmailTemplate | Email templates |
| `password_reset_tokens` | PasswordResetToken | Password reset flow |

### 9.3 Enums

```typescript
UserRole:        SuperAdmin | ContentManager | Editor | Viewer
ContentStatus:   draft | active | archived
BlogStatus:      draft | published | scheduled
FormType:        contact | service_request | career
LeadStatus:      new | contacted | qualified | converted | rejected
```

### 9.4 Indexes Penting

- `services`: slug, status, display_order
- `blog_posts`: slug, status, published_at, author_id
- `form_submissions`: email, status, assigned_to, created_at
- `analytics_events`: event_type, created_at, page_url
- `testimonials`: is_approved

### 9.5 Soft Delete

Model berikut support soft delete via field `deletedAt`:
- User
- Service
- PortfolioItem
- BlogPost

Delete admin endpoint set `deletedAt = now()` rather than hard delete (kecuali FAQ, Career, Team yang hard delete).

---

## 10. Autentikasi dan Otorisasi

### 10.1 JWT Authentication Flow

```
1. User POST /auth/login { email, password }
2. Backend verify bcrypt hash
3. Generate JWT: { sub, email, role, iat, exp }
4. Client store token in localStorage
5. Subsequent requests: Authorization: Bearer <token>
6. Middleware verifyToken → attach user to request
```

**Token expiry:** 24 jam (configurable via `JWT_EXPIRES_IN`)

### 10.2 Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| **SuperAdmin** | Full access (`*`) — all CRUD, users, settings, activity logs |
| **ContentManager** | Full content CRUD, view leads, analytics, view settings |
| **Editor** | View all content, view leads, view analytics |
| **Viewer** | Read-only access to content, leads, analytics |

### 10.3 Middleware Guards

| Guard | File | Fungsi |
|-------|------|--------|
| `authenticate` | `middleware/auth.ts` | Verify JWT, load user |
| `requireRole(...roles)` | `middleware/auth.ts` | Check user role |
| `requirePermission(perm)` | `middleware/auth.ts` | Check specific permission |
| `requireWrite(resource)` | `middleware/auth.ts` | Check write access |

### 10.4 Activity Logging

Setiap aksi penting di-log ke `activity_logs`:
- Login / logout
- Create / update / delete content
- Settings changes

Fields: userId, action, entityType, entityId, changes (JSON), ipAddress, createdAt

---

## 11. Keamanan

### 11.1 Implementasi Keamanan

| Aspek | Implementasi |
|-------|--------------|
| Password storage | bcrypt, 12 salt rounds |
| Password policy | Min 8 chars, upper+lower+digit+special |
| API auth | JWT Bearer tokens |
| HTTPS | Required in production |
| CORS | Restricted to FRONTEND_URL |
| Security headers | Helmet.js |
| Rate limiting | Login: 5/15min, Forms: 5/hour, API: 100/min |
| Input validation | Zod schemas server-side |
| SQL injection | Prisma parameterized queries |
| XSS | React auto-escape; sanitize HTML content |
| CSRF | SameSite cookies (future), honeypot on forms |
| File upload | MIME whitelist, 5MB limit, unique filenames |
| Spam prevention | Honeypot field on all public forms |

### 11.2 Rate Limits Detail

```javascript
// Login
windowMs: 15 * 60 * 1000, max: 5

// Form submissions
windowMs: 60 * 60 * 1000, max: 5

// General API
windowMs: 60 * 1000, max: 100

// Password reset
windowMs: 60 * 60 * 1000, max: 3
```

---

## 12. Frontend — Detail Implementasi

### 12.1 Komponen UI Reusable

| Komponen | File | Props |
|----------|------|-------|
| Button | `ui/Button.tsx` | variant, size, loading, icon |
| Card | `ui/Card.tsx` | title, description, footer, hover |
| Input | `ui/Input.tsx` | label, error, helperText |
| Textarea | `ui/Input.tsx` | label, error, rows |
| Select | `ui/Input.tsx` | label, options |

**Button variants:** primary, secondary, outline, danger, ghost  
**Button sizes:** sm, md, lg

### 12.2 API Client

File: `frontend/src/lib/api.ts`

```typescript
// Authenticated fetch
apiFetch<T>(endpoint, options?)

// Paginated fetch
apiFetchPaginated<T>(endpoint, options?)

// Page view tracking
trackPageView(pageUrl, pageTitle?)

// URL helpers
getApiUrl(path)
getUploadUrl(path)
```

Token diambil dari `localStorage.getItem('token')` otomatis.

### 12.3 Auth Context

File: `frontend/src/contexts/AuthContext.tsx`

```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email, password) => Promise<void>;
  logout: () => void;
}
```

- Auto-redirect ke `/admin/login` jika tidak authenticated
- Fetch `/auth/me` on mount jika token exists
- Login page exempt dari redirect guard

### 12.4 Admin CRUD Pattern

Komponen generik: `components/admin/AdminCrudPage.tsx`

Digunakan oleh: Portfolio, Blog, Team, Testimonials, FAQs, Careers

Props:
```typescript
{
  title: string;
  endpoint: string;        // e.g. "portfolio"
  fields: FieldConfig[];   // form field definitions
  defaultItem: object;     // empty form state
}
```

### 12.5 Responsive Breakpoints

| Breakpoint | Tailwind | Layout |
|------------|----------|--------|
| Mobile | default | Single column, hamburger menu |
| Tablet | `md:` (640px+) | 2 columns |
| Desktop | `lg:` (1024px+) | 3-4 columns, full nav |
| Large | `xl:` (1280px+) | max-w-7xl container |

### 12.6 Color Scheme

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#2563eb` (blue-600) | Buttons, links, accents |
| Background | `#ffffff` | Page background |
| Foreground | `#0f172a` (slate-900) | Text |
| Muted | `#64748b` (slate-500) | Secondary text |

Primary color dapat di-override via admin Settings → `primaryColor`.

---

## 13. SEO dan Analytics

### 13.1 Meta Tags

Root layout (`app/layout.tsx`):
```typescript
metadata: {
  title: { default: 'DN Tech - ...', template: '%s | DN Tech' },
  description: '...',
  keywords: [...],
  openGraph: { type: 'website', locale: 'id_ID', siteName: 'DN Tech' }
}
```

Per-page metadata via `export const metadata` atau `generateMetadata()`.

### 13.2 Sitemap

File: `app/sitemap.ts`  
URL: `/sitemap.xml`

Auto-generates entries for:
- Static pages (home, services, about, contact, dll.)
- Dynamic: `/services/:slug`, `/blog/:slug`, `/portfolio/:slug`

### 13.3 Robots.txt

File: `app/robots.ts`  
URL: `/robots.txt`

```
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: {SITE_URL}/sitemap.xml
```

### 13.4 Analytics Tracking

**Client-side:** `PageTracker` component POST ke `/analytics/track` on route change.

**Tracked fields:**
- eventType (page_view, form_submit)
- pageUrl, pageTitle
- sessionId (sessionStorage)
- referrer, userAgent
- deviceType (mobile/desktop/tablet — auto-detected)

**Admin reporting:** Aggregated via `/admin/analytics/*` endpoints.

---

## 14. Environment Variables

### 14.1 Backend (`.env`)

| Variable | Required | Default | Deskripsi |
|----------|----------|---------|-----------|
| `DATABASE_URL` | Ya | — | PostgreSQL atau SQLite connection string |
| `JWT_SECRET` | Ya | — | Secret key untuk sign JWT |
| `JWT_EXPIRES_IN` | Tidak | `24h` | Token expiry |
| `PORT` | Tidak | `4000` | API server port |
| `NODE_ENV` | Tidak | `development` | Environment |
| `FRONTEND_URL` | Tidak | `http://localhost:3000` | CORS origin |
| `UPLOAD_DIR` | Tidak | `./uploads` | Media upload directory |
| `ADMIN_EMAIL` | Tidak | `admin@dntech.id` | Seed admin email |
| `ADMIN_PASSWORD` | Tidak | `Admin@123456` | Seed admin password |

**Contoh `.env` production:**
```env
DATABASE_URL=postgresql://dntech:secret@db-host:5432/dntech
JWT_SECRET=your-256-bit-secret-key-here
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://dntech.id
UPLOAD_DIR=/app/uploads
```

### 14.2 Frontend (`.env.local`)

| Variable | Required | Default | Deskripsi |
|----------|----------|---------|-----------|
| `NEXT_PUBLIC_API_URL` | Ya | — | Backend API base URL |
| `NEXT_PUBLIC_SITE_URL` | Tidak | `http://localhost:3000` | For sitemap generation |

**Contoh:**
```env
NEXT_PUBLIC_API_URL=https://api.dntech.id/api/v1
NEXT_PUBLIC_SITE_URL=https://dntech.id
```

---

## 15. Setup dan Development

### 15.1 Prerequisites

- Node.js 18 atau lebih baru
- npm 9+
- PostgreSQL 13+ (production) atau SQLite (development)
- Docker & Docker Compose (opsional)

### 15.2 Instalasi Lokal (Manual)

**Step 1 — Database**

Opsi A (PostgreSQL via Docker):
```bash
docker compose up -d db
```

Opsi B (SQLite — development):
```env
# backend/.env
DATABASE_URL="file:./dev.db"
```

**Step 2 — Backend**
```bash
cd backend
cp .env.example .env
npm install
npx prisma db push
npm run db:seed
npm run dev
# → http://localhost:4000
```

**Step 3 — Frontend**
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
# → http://localhost:3000
```

### 15.3 Scripts Backend

| Script | Command | Fungsi |
|--------|---------|--------|
| Dev server | `npm run dev` | tsx watch, hot reload |
| Build | `npm run build` | Compile TypeScript → dist/ |
| Start prod | `npm start` | node dist/index.js |
| Generate client | `npm run db:generate` | prisma generate |
| Push schema | `npm run db:push` | Sync schema to DB |
| Migrate | `npm run db:migrate` | Create migration |
| Seed | `npm run db:seed` | Insert initial data |

### 15.4 Scripts Frontend

| Script | Command | Fungsi |
|--------|---------|--------|
| Dev server | `npm run dev` | Next.js dev (Turbopack) |
| Build | `npm run build` | Production build |
| Start prod | `npm start` | Serve production build |
| Lint | `npm run lint` | ESLint check |

### 15.5 Instalasi via Docker Compose

```bash
docker compose up -d
```

Services:
- `db` — PostgreSQL 15 on port 5432
- `backend` — API on port 4000
- `frontend` — Website on port 3000

---

## 16. Deployment

### 16.1 Docker Build

**Backend:**
```dockerfile
# Multi-stage: builder (tsc) → runtime (node:18-alpine)
# On start: prisma db push → seed → node dist/index.js
EXPOSE 4000
```

**Frontend:**
```dockerfile
# Multi-stage: builder (next build) → runtime (standalone)
EXPOSE 3000
CMD ["node", "server.js"]
```

### 16.2 Production Checklist

- [ ] Set strong `JWT_SECRET` (256-bit random)
- [ ] Switch database to PostgreSQL
- [ ] Set `NODE_ENV=production`
- [ ] Configure HTTPS/TLS (Nginx or Cloudflare)
- [ ] Set correct `FRONTEND_URL` and `NEXT_PUBLIC_API_URL`
- [ ] Run `npx prisma migrate deploy`
- [ ] Configure backup strategy (daily DB backup)
- [ ] Set up monitoring (health check: `GET /health`)
- [ ] Configure CDN for static assets
- [ ] Change default admin password
- [ ] Configure email service (SendGrid/SES) for notifications

### 16.3 CI/CD (Recommended)

```yaml
# GitHub Actions workflow
on: [push, pull_request]
jobs:
  test:
    - npm ci && npm run lint && npm run build  # backend
    - npm ci && npm run build                   # frontend
  deploy:
    if: github.ref == 'refs/heads/main'
    - docker build & push
    - deploy to production
```

---

## 17. Seed Data

Script: `backend/prisma/seed.ts`

**Data yang di-seed:**

| Entity | Jumlah | Contoh |
|--------|--------|--------|
| User (SuperAdmin) | 1 | admin@dntech.id |
| SiteSettings | 1 | Company info, about content, legal |
| Services | 4 | Enterprise Software, Web & Mobile, Cloud & DevOps, IT Consulting |
| PortfolioItems | 3 | ERP Manufaktur, E-Commerce B2B, Mobile Banking |
| BlogPosts | 3 | Tren Teknologi 2026, Migrasi Cloud UMKM, Keamanan Web |
| TeamMembers | 4 | Dozer (CEO), Sarah (CTO), Budi (Sales), Maya (Design) |
| Testimonials | 3 | Approved client reviews |
| FAQs | 5 | General, Services, Support, Pricing |
| Careers | 2 | Senior Full Stack Dev, UI/UX Designer |
| AnalyticsEvents | ~900 | 30 days simulated page views |

**Jalankan seed:**
```bash
cd backend && npm run db:seed
```

---

## 18. Troubleshooting

### Backend tidak start

```
Error: Can't reach database server
```
→ Pastikan PostgreSQL running atau gunakan SQLite (`DATABASE_URL=file:./dev.db`)

### Frontend tidak load data

```
Failed to fetch
```
→ Pastikan backend running di port 4000  
→ Cek `NEXT_PUBLIC_API_URL` di `.env.local`

### Admin login gagal

→ Pastikan seed sudah dijalankan (`npm run db:seed`)  
→ Default: `admin@dntech.id` / `Admin@123456`

### Upload media gagal

→ Pastikan folder `backend/uploads/` exists dan writable  
→ Max file size: 5MB  
→ Allowed types: JPG, PNG, WebP, GIF, PDF

### CORS error

→ Set `FRONTEND_URL` di backend `.env` sesuai URL frontend

### Port already in use

```bash
lsof -ti :3000 | xargs kill -9
lsof -ti :4000 | xargs kill -9
```

---

## 19. Referensi Dokumen

| Dokumen | Path | Isi |
|---------|------|-----|
| PRD | `PRD/files2/01-PRD-DNTech-Company-Profile.md` | Product requirements, user stories, timeline |
| SRS | `PRD/files2/02-SRS-DNTech-Company-Profile.md` | Functional requirements, NFR, data model |
| SDD | `PRD/files2/03-SDD-DNTech-Company-Profile.md` | Architecture, API design, deployment |
| README | `README.md` | Quick start guide |
| Dokumentasi ini | `docs/DNTECH-COMPANY-PROFILE.md` | Dokumentasi teknis lengkap |

---

**DN Tech © 2026 — All rights reserved**

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026

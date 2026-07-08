# DN Tech — Dokumentasi Proyek

Dokumentasi lengkap website company profile **DN Tech** (`dntech.id`): arsitektur, tech stack, fitur, database, API, dan panduan operasional.

---

## Daftar Isi

1. [Apa Itu Proyek Ini?](#1-apa-itu-proyek-ini)
2. [Tech Stack](#2-tech-stack)
3. [Arsitektur Sistem](#3-arsitektur-sistem)
4. [Fitur Website Publik](#4-fitur-website-publik)
5. [Fitur Admin Dashboard](#5-fitur-admin-dashboard)
6. [Database & Model Data](#6-database--model-data)
7. [API](#7-api)
8. [Struktur Folder](#8-struktur-folder)
9. [Environment Variables](#9-environment-variables)
10. [Menjalankan Secara Lokal](#10-menjalankan-secara-lokal)
11. [Deploy Production](#11-deploy-production)
12. [Manajemen Konten](#12-manajemen-konten)
13. [Keamanan & RBAC](#13-keamanan--rbac)
14. [Integrasi Pihak Ketiga](#14-integrasi-pihak-ketiga)
15. [SEO & Analytics](#15-seo--analytics)
16. [Scripts & Perintah Berguna](#16-scripts--perintah-berguna)
17. [Dokumen Terkait](#17-dokumen-terkait)

---

## 1. Apa Itu Proyek Ini?

**DN Tech Company Profile Website** adalah website perusahaan teknologi enterprise yang terdiri dari dua bagian utama:

| Bagian | URL | Fungsi |
|--------|-----|--------|
| **Website Publik** | `https://dntech.id` | Company profile, marketing, lead generation |
| **Admin Dashboard** | `https://dntech.id/admin` | CMS untuk mengelola semua konten & leads |
| **REST API** | `https://api.dntech.id` | Backend yang melayani frontend & admin |

### Tujuan Proyek

- Menampilkan profil perusahaan, layanan, portfolio, dan studi kasus
- Menghasilkan **leads** melalui form kontak, quiz solusi, newsletter, dan exit-intent modal
- Memberikan tim internal **dashboard admin** untuk CRUD konten tanpa menyentuh kode
- Mendukung **SEO**, analytics, dan konversi untuk pasar Indonesia (Bahasa Indonesia, mata uang Rupiah)

### Prinsip Konten

Proyek ini dirancang untuk **production dengan data real**:

- Tidak ada konten demo hardcoded di frontend
- Semua konten (layanan, blog, tim, testimoni, dll.) diisi via **Admin Dashboard**
- Seed database hanya membuat **admin user** + **site settings kosong**
- Script `db:clear-content` tersedia untuk menghapus konten demo lama

---

## 2. Tech Stack

### Frontend

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **Next.js** | 16.x | App Router, SSR/SSG, routing |
| **React** | 19.x | UI components |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Styling |
| **React Hook Form** | 7.x | Form handling |
| **Zod** | 4.x | Validasi form (client) |
| **SWR** | 2.x | Data fetching (admin) |
| **Lucide React** | — | Icons |

### Backend

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **Node.js** | 18+ | Runtime |
| **Express** | 5.x | HTTP API server |
| **TypeScript** | 5.x | Type safety |
| **Prisma ORM** | 6.x | Database access & migrations |
| **PostgreSQL** | 13+ | Database utama |
| **JWT** | — | Autentikasi admin |
| **bcryptjs** | — | Hash password |
| **Zod** | 3.x | Validasi request (server) |
| **Multer** | — | Upload file/media |
| **Helmet** | — | Security headers |
| **express-rate-limit** | — | Rate limiting API |

### Infrastruktur Production

| Komponen | Kegunaan |
|----------|----------|
| **Ubuntu Server** | Host aplikasi |
| **Nginx** | Reverse proxy (www + apex, API subdomain) |
| **PM2** | Process manager (API + frontend) |
| **PostgreSQL** | Database production |
| **Docker Compose** | Opsional — dev environment all-in-one |

### Bahasa & Lokal

- UI website: **Bahasa Indonesia**
- Mata uang: **Rupiah (IDR)** — estimasi biaya, form anggaran, kalkulator ROI
- Locale SEO: `id_ID`

---

## 3. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                        Pengguna                             │
└──────────────┬──────────────────────────┬───────────────────┘
               │                          │
               ▼                          ▼
    ┌──────────────────┐       ┌──────────────────┐
    │  Next.js Frontend │       │  Admin Dashboard  │
    │  (Port 3000)      │       │  /admin/*         │
    └────────┬─────────┘       └────────┬─────────┘
             │                          │
             │    REST API (JSON)       │
             └────────────┬─────────────┘
                          ▼
               ┌──────────────────┐
               │  Express Backend  │
               │  (Port 4000)      │
               │  /api/v1/*        │
               └────────┬─────────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
   ┌────────────┐ ┌──────────┐ ┌─────────────┐
   │ PostgreSQL │ │  Uploads │ │  SendGrid   │
   │  (Prisma)  │ │  (disk)  │ │  (email)    │
   └────────────┘ └──────────┘ └─────────────┘
```

### Alur Data Utama

1. **Halaman publik** — Next.js fetch data dari API (`/api/v1/*`) dengan ISR/revalidate
2. **Form kontak / quiz / newsletter** — POST ke API → simpan ke DB → (opsional) kirim email
3. **Admin** — Login JWT → CRUD via `/api/v1/admin/*` → Prisma → PostgreSQL
4. **Media upload** — Multer simpan file ke `uploads/` → URL di-serve via `/uploads/*`

---

## 4. Fitur Website Publik

Semua halaman berada di `frontend/src/app/(public)/`.

### Halaman

| Route | Deskripsi |
|-------|-----------|
| `/` | Beranda — hero, statistik, layanan, studi kasus, testimoni, blog, kalkulator ROI, newsletter |
| `/services` | Daftar layanan |
| `/services/[slug]` | Detail layanan + artikel terkait |
| `/portfolio` | Daftar portfolio |
| `/portfolio/[slug]` | Detail portfolio |
| `/case-studies` | Studi kasus (alias portfolio aktif) |
| `/case-studies/[slug]` | Detail studi kasus |
| `/blog` | Daftar artikel + filter kategori |
| `/blog/[slug]` | Detail artikel + internal linking |
| `/about` | Tentang perusahaan (konten dari settings) |
| `/team` | Tim perusahaan |
| `/testimonials` | Testimoni klien |
| `/faq` | FAQ dengan accordion |
| `/careers` | Lowongan kerja |
| `/contact` | Form kontak multi-step + Calendly |
| `/resources` | Sumber daya / lead magnet (dari settings) |
| `/quiz` | Kuis temukan solusi |
| `/terms` | Syarat & ketentuan |
| `/privacy` | Kebijakan privasi |
| `/thank-you` | Halaman setelah submit form |

### Komponen Interaktif

| Komponen | Fungsi |
|----------|--------|
| `MultiStepForm` | Form kontak 3 langkah (info → proyek → pesan) |
| `SolutionQuiz` | Kuis 5 pertanyaan → rekomendasi layanan dari DB |
| `ROICalculator` | Estimasi biaya proyek dalam Rupiah |
| `ExitIntentModal` | Popup saat user mau menutup tab (desktop, setelah 8 detik) |
| `BookDemoSection` | Embed Calendly dari settings |
| `NewsletterForm` | Langganan newsletter |
| `TestimonialCarousel` | Slider testimoni |
| `StickyCTA` | CTA mobile di bagian bawah |

### Konten Dinamis dari Settings

Field berikut diatur via Admin → Pengaturan Situs, bukan hardcoded:

- Tagline & deskripsi hero
- Statistik beranda (`homeStats`)
- Trust badges & logo klien
- Info kontak (email, telepon, alamat, jam operasional)
- Konten About (JSON: story, mission, vision, values, achievements)
- Daftar sumber daya (`resources`)
- URL Calendly, lead magnet, Crisp Chat, Google Analytics

---

## 5. Fitur Admin Dashboard

Semua halaman admin berada di `frontend/src/app/admin/`.

| Route | Fungsi |
|-------|--------|
| `/admin/login` | Login JWT |
| `/admin/dashboard` | Ringkasan metrik |
| `/admin/analytics` | Traffic, konversi, device breakdown |
| `/admin/services` | CRUD layanan |
| `/admin/portfolio` | CRUD portfolio / studi kasus |
| `/admin/blog` | CRUD artikel blog + publish |
| `/admin/team` | CRUD anggota tim |
| `/admin/testimonials` | CRUD testimoni |
| `/admin/faqs` | CRUD FAQ |
| `/admin/careers` | CRUD lowongan |
| `/admin/leads` | Manajemen leads + status + export CSV |
| `/admin/media` | Upload & kelola media |
| `/admin/newsletter` | Daftar subscriber |
| `/admin/quiz` | Submission kuis |
| `/admin/settings` | Pengaturan situs |
| `/admin/users` | Manajemen user (SuperAdmin) |

---

## 6. Database & Model Data

Schema: `backend/prisma/schema.prisma`  
Database: **PostgreSQL**

### Model Utama

| Model | Tabel | Deskripsi |
|-------|-------|-----------|
| `User` | `users` | Admin users + RBAC |
| `Service` | `services` | Layanan perusahaan |
| `PortfolioItem` | `portfolio_items` | Portfolio & studi kasus |
| `BlogPost` | `blog_posts` | Artikel blog |
| `TeamMember` | `team_members` | Profil tim |
| `Testimonial` | `testimonials` | Testimoni klien |
| `Faq` | `faqs` | Pertanyaan umum |
| `Career` | `careers` | Lowongan kerja |
| `FormSubmission` | `form_submissions` | Leads dari form |
| `Media` | `media` | File upload |
| `SiteSettings` | `site_settings` | Konfigurasi situs (single row, id=1) |
| `AnalyticsEvent` | `analytics_events` | Event tracking |
| `ConversionFunnel` | `conversion_funnels` | Funnel konversi |
| `NewsletterSubscriber` | `newsletter_subscribers` | Subscriber newsletter |
| `QuizSubmission` | `quiz_submissions` | Hasil kuis solusi |
| `ActivityLog` | `activity_logs` | Audit log admin |
| `EmailTemplate` | `email_templates` | Template email |

### Enum Penting

```
UserRole:        SuperAdmin | ContentManager | Editor | Viewer
ContentStatus:   draft | active | archived
BlogStatus:      draft | published | scheduled
LeadStatus:      new | contacted | qualified | converted | rejected
FormType:        contact | service_request | career
```

### Site Settings — Field JSON

**`homeStats`** — statistik beranda:
```json
[
  { "icon": "briefcase", "value": "10+", "label": "Proyek Selesai" },
  { "icon": "users", "value": "5+", "label": "Klien Enterprise" }
]
```
Icon yang didukung: `briefcase`, `users`, `award`, `star`

**`trustBadges`** — lencana kepercayaan:
```json
[
  { "icon": "shield", "label": "ISO Certified", "description": "..." }
]
```

**`clientLogos`** — logo klien:
```json
[
  { "name": "PT Contoh", "initial": "PC" }
]
```

**`resources`** — sumber daya:
```json
[
  {
    "title": "Panduan Transformasi Digital",
    "description": "...",
    "type": "PDF",
    "downloadUrl": "https://..."
  }
]
```

**`aboutContent`** — halaman tentang:
```json
{
  "story": "...",
  "mission": "...",
  "vision": "...",
  "values": [{ "title": "...", "description": "..." }],
  "achievements": ["...", "..."]
}
```

---

## 7. API

Base URL: `http://localhost:4000/api/v1` (dev) / `https://api.dntech.id/api/v1` (prod)

Health check: `GET /health`

### Endpoint Publik

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/services` | Daftar layanan aktif |
| GET | `/services/:slug` | Detail layanan |
| GET | `/portfolio` | Daftar portfolio |
| GET | `/portfolio/:slug` | Detail portfolio |
| GET | `/case-studies` | Daftar studi kasus |
| GET | `/case-studies/:slug` | Detail studi kasus |
| GET | `/blog` | Daftar artikel (pagination, filter) |
| GET | `/blog/:slug` | Detail artikel |
| GET | `/team` | Daftar tim |
| GET | `/testimonials` | Daftar testimoni |
| GET | `/faq` | Daftar FAQ |
| GET | `/careers` | Daftar lowongan |
| GET | `/settings` | Pengaturan publik situs |
| GET | `/settings/legal/terms` | Syarat layanan |
| GET | `/settings/legal/privacy` | Kebijakan privasi |
| GET | `/search?q=` | Pencarian sitewide |
| POST | `/forms/contact` | Submit form kontak |
| POST | `/forms/service-request` | Request layanan |
| POST | `/forms/career` | Lamaran kerja |
| POST | `/newsletter/subscribe` | Langganan newsletter |
| POST | `/quiz/submit` | Submit kuis solusi |
| POST | `/analytics/track` | Track event analytics |

### Endpoint Auth

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/auth/login` | Login → JWT token |
| POST | `/auth/refresh` | Refresh token |
| GET | `/auth/me` | Profil user saat ini |

### Endpoint Admin (Bearer Token)

Prefix: `/admin/*` — memerlukan header `Authorization: Bearer <token>`

CRUD tersedia untuk: services, portfolio, blog, team, testimonials, faqs, careers, media, leads, settings, users, analytics.

---

## 8. Struktur Folder

```
dntech/
├── backend/                    # Express API
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.ts             # Bootstrap admin + settings kosong
│   ├── scripts/
│   │   └── clear-content.ts    # Hapus semua konten demo
│   └── src/
│       ├── index.ts            # Entry point + route mounting
│       ├── config/             # Database config
│       ├── middleware/         # Auth, RBAC
│       ├── routes/             # API route handlers
│       ├── services/           # Email, Lead business logic
│       └── utils/              # Auth helpers, response helpers
│
├── frontend/                   # Next.js app
│   ├── public/
│   │   └── logo.png            # Logo situs
│   └── src/
│       ├── app/
│       │   ├── (public)/       # Halaman website publik
│       │   ├── admin/          # Admin dashboard
│       │   ├── layout.tsx      # Root layout
│       │   ├── sitemap.ts      # Dynamic sitemap
│       │   └── robots.ts       # robots.txt
│       ├── components/
│       │   ├── admin/          # Komponen admin
│       │   ├── cards/          # Card components
│       │   ├── common/         # Header, Footer, Logo
│       │   ├── forms/          # Form components
│       │   ├── interactive/    # Quiz, ROI, Exit intent
│       │   ├── layout/         # Trust badges, sticky CTA
│       │   ├── seo/            # JsonLd, Analytics
│       │   └── ui/             # Button, Input, Card
│       ├── contexts/           # AuthContext
│       ├── lib/                # api, seo, settings, currency
│       └── types/              # TypeScript types
│
├── docs/                       # Dokumentasi
│   ├── PROJECT-OVERVIEW.md     # ← dokumen ini
│   └── DEPLOYMENT-PRODUCTION.md
├── PRD/                        # Product requirements (legacy)
├── docker-compose.yml
└── README.md
```

---

## 9. Environment Variables

### Backend (`backend/.env`)

| Variable | Wajib | Deskripsi |
|----------|-------|-----------|
| `DATABASE_URL` | ✅ | Connection string PostgreSQL |
| `JWT_SECRET` | ✅ | Secret key JWT (min. 32 karakter di prod) |
| `JWT_EXPIRES_IN` | — | Expiry access token (default: `24h`) |
| `JWT_REFRESH_EXPIRES_IN` | — | Expiry refresh token (default: `7d`) |
| `PORT` | — | Port API (default: `4000`) |
| `NODE_ENV` | — | `development` / `production` |
| `FRONTEND_URL` | ✅ | URL frontend untuk CORS (bisa comma-separated) |
| `TRUST_PROXY` | prod | Set `1` jika di belakang Nginx |
| `UPLOAD_DIR` | — | Direktori upload file (default: `./uploads`) |
| `ADMIN_EMAIL` | — | Email admin saat seed |
| `ADMIN_PASSWORD` | — | Password admin saat seed |
| `SENDGRID_API_KEY` | — | API key SendGrid untuk email |
| `SENDGRID_FROM_EMAIL` | — | Email pengirim |

### Frontend (`frontend/.env.local`)

| Variable | Wajib | Deskripsi |
|----------|-------|-----------|
| `NEXT_PUBLIC_API_URL` | ✅ | URL API backend |
| `NEXT_PUBLIC_SITE_URL` | ✅ | URL canonical situs (SEO) |
| `NEXT_PUBLIC_CRISP_WEBSITE_ID` | — | Override Crisp ID (alternatif: via admin settings) |

> **Penting:** Variabel `NEXT_PUBLIC_*` di-bake saat `npm run build`. Setelah mengubahnya, **wajib rebuild frontend**.

---

## 10. Menjalankan Secara Lokal

### Prasyarat

- Node.js 18+
- PostgreSQL 13+ (atau Docker)

### Opsi A: Docker Compose

```bash
docker-compose up -d
```

- Website: http://localhost:3000
- API: http://localhost:4000
- Admin: http://localhost:3000/admin/login

### Opsi B: Manual

```bash
# 1. Database (opsional via Docker)
docker-compose up -d db

# 2. Backend
cd backend
cp .env.example .env
npm install
npx prisma db push
npm run db:seed
npm run dev

# 3. Frontend (terminal baru)
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### Kredensial Default (Seed)

| Field | Value |
|-------|-------|
| Email | `admin@dntech.id` |
| Password | `Admin@123456` |

> Ganti password segera setelah deploy production.

---

## 11. Deploy Production

Production saat ini:

| Komponen | URL / Path |
|----------|------------|
| Website | `https://dntech.id` / `https://www.dntech.id` |
| API | `https://api.dntech.id` |
| Server path | `/var/www/dntech` |
| Process manager | PM2 (`dntech-api`, `dntech-web`) |

### Checklist Deploy Setelah `git pull`

```bash
cd /var/www/dntech

# Backend
cd backend
npm install
npx prisma db push          # sync schema ke DB
npx prisma generate         # WAJIB — regenerate Prisma Client
npm run build               # prebuild otomatis jalankan prisma generate
pm2 restart dntech-api

# Frontend
cd ../frontend
npm install
npm run build               # rebuild jika NEXT_PUBLIC_* berubah
pm2 restart dntech-web
```

### Hapus Konten Demo (Opsional)

```bash
cd backend
npm run db:clear-content
```

Panduan lengkap: [`docs/DEPLOYMENT-PRODUCTION.md`](./DEPLOYMENT-PRODUCTION.md)

---

## 12. Manajemen Konten

### Alur Setup Production

1. Deploy aplikasi + jalankan `db:seed` (buat admin)
2. Login ke `/admin/login`
3. Isi **Pengaturan Situs** (`/admin/settings`):
   - Info perusahaan, hero, statistik, kontak
   - Trust badges, logo klien, sumber daya
   - Konten About (JSON)
   - Calendly, GA, Crisp Chat
4. Tambahkan konten via menu admin:
   - Layanan → Blog → Portfolio → Tim → Testimoni → FAQ → Karier
5. Publish blog & aktifkan layanan/portfolio

### Status Konten

| Tipe | Status publik |
|------|---------------|
| Service, Portfolio | `active` = tampil di website |
| Blog | `published` = tampil di website |
| Career, FAQ, Team | `active` = tampil |

---

## 13. Keamanan & RBAC

### Role Admin

| Role | Akses |
|------|-------|
| **SuperAdmin** | Full access — termasuk user management |
| **ContentManager** | CRUD konten + leads |
| **Editor** | Edit konten terbatas |
| **Viewer** | Read-only |

### Fitur Keamanan Backend

- JWT authentication dengan expiry
- Password hashing (bcrypt, cost 12)
- Helmet security headers
- CORS whitelist (FRONTEND_URL + auto www/apex)
- Rate limiting: 100 req/menit per IP
- Trust proxy untuk Nginx
- Validasi input dengan Zod
- RBAC middleware per resource

---

## 14. Integrasi Pihak Ketiga

| Integrasi | Konfigurasi | Fungsi |
|-----------|-------------|--------|
| **SendGrid** | `SENDGRID_API_KEY` di backend `.env` | Email konfirmasi form & quiz follow-up |
| **Google Analytics** | Admin settings → `googleAnalyticsId` | Tracking traffic |
| **Crisp Chat** | Admin settings → `crispWebsiteId` | Live chat widget |
| **Calendly** | Admin settings → `calendlyUrl` | Jadwal demo di halaman kontak |

Jika SendGrid tidak dikonfigurasi, email di-log ke console (development mode).

---

## 15. SEO & Analytics

### Fitur SEO

- Meta tags dinamis per halaman (`buildMetadata`)
- Open Graph & Twitter Cards
- JSON-LD structured data (Organization, LocalBusiness, Article, FAQ, Service, Breadcrumb)
- Dynamic `sitemap.xml`
- `robots.txt`
- Canonical URLs
- Internal linking (content pillars, related services/posts)
- Locale: `id_ID`

### Analytics

- Page view tracking via `PageTracker`
- Event tracking: form submit, quiz complete, newsletter subscribe
- Admin dashboard: overview metrik, conversion funnel, device breakdown
- Lead source tracking per submission

---

## 16. Scripts & Perintah Berguna

### Backend (`cd backend`)

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Development server (hot reload) |
| `npm run build` | Compile TypeScript (+ auto `prisma generate`) |
| `npm start` | Jalankan production build |
| `npm run db:push` | Sync schema ke database |
| `npm run db:generate` | Regenerate Prisma Client |
| `npm run db:seed` | Bootstrap admin + settings kosong |
| `npm run db:clear-content` | Hapus semua konten demo |

### Frontend (`cd frontend`)

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Jalankan production build |
| `npm run lint` | ESLint |

### PM2 (Production)

```bash
pm2 status
pm2 logs dntech-api
pm2 logs dntech-web
pm2 restart dntech-api
pm2 restart dntech-web
```

---

## 17. Dokumen Terkait

| File | Isi |
|------|-----|
| [`README.md`](../README.md) | Quick start singkat |
| [`docs/DEPLOYMENT-PRODUCTION.md`](./DEPLOYMENT-PRODUCTION.md) | Panduan deploy Ubuntu + Nginx + PM2 |
| [`docs/DNTECH-COMPANY-PROFILE.md`](./DNTECH-COMPANY-PROFILE.md) | Spesifikasi lengkap (legacy) |
| [`PRD/`](../PRD/) | Product requirements documents |
| [`backend/.env.example`](../backend/.env.example) | Template env backend |
| [`frontend/.env.example`](../frontend/.env.example) | Template env frontend |

---

## Ringkasan Cepat

```
Proyek     : Website company profile + CMS admin untuk DN Tech
Stack      : Next.js 16 + Express 5 + PostgreSQL + Prisma
Bahasa UI  : Indonesia | Mata uang: IDR
Repo       : https://github.com/dreamcraft17/dntech
Production : dntech.id | api.dntech.id
Admin      : /admin/login
Konten     : 100% dari database via admin — tanpa data demo hardcoded
```

---

*Terakhir diperbarui: Juni 2026*

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026

# DN Tech Company Profile Website

Production-ready company profile website for DN Tech with a public marketing site, admin CMS, lead generation, analytics, and SEO foundations.

## Current Status

| Area | Status | Notes |
|------|--------|-------|
| Public website | Implemented | Content is database/admin-driven, no fake demo content |
| Admin CMS | Implemented | Services, blog, team, FAQ, careers, leads, analytics, settings, users |
| PRD/Design/SEO V2 | Implemented | Solid color design system, Indonesian copy, startup/SME positioning |
| V3 refinements | Implemented | Exit intent fix, logo variants, mobile nav polish, form accessibility |
| Jul 9 polish | Implemented | Button href fix, about CMS live, `rlogo2` branding, hero wordmark, admin toast |
| Footer redesign (Jul 9) | Implemented | Putih, layout horizontal, `FooterBrand` wordmark, tanpa newsletter di footer |
| Homepage PRD Indonesia (Jul 9) | Implemented | Direct-market homepage; `homeContent` CMS; `components/homepage/*` |
| Homepage tuning (Jul 9 malam) | Implemented | Tech stack & tim hidden on homepage; UMKM-friendly pricing |
| Branding section rollout | Implemented | Prisma branding models + admin API (legacy homepage sections; modul admin tetap) |
| V4 performance | Implemented | Debounce search, deferred scripts, cached settings/API, streaming homepage, Next Image, font/build fix |
| V5 email system | Implemented | SMTP via `mx8.mailspace.id:465`, email templates, retry/logging, newsletter confirmation, admin email logs |
| Frontend build | Passing | `npm run build` succeeds without Google Fonts network dependency |
| Backend build | Passing | `npm run build` succeeds |
| Full lint | Passing | Frontend lint succeeds with 0 errors/warnings |
| Performance | Optimized | See `docs/IMPLEMENTATION-STATUS.md` for V4 details and remaining Lighthouse verification |

Latest implementation reference: Jul 9 — Homepage PRD Indonesia Edition + footer redesign + harga UMKM-friendly.

**Branding:** Logo resmi `frontend/public/rlogo2.png`; favicon `src/app/icon.png`; navbar & footer menampilkan **DN Tech.id** (`LogoLight` / `FooterBrand`).

**Homepage:** PRD [Indonesia Edition](https://github.com/dreamcraft17/company-wiki/blob/main/docs/products/dntech/branding/DN-TECH-HOMEPAGE-REDESIGN-PRD-INDONESIA-EDITION.md) — hero, layanan, proses, keunggulan, portfolio, FAQ, harga, CTA. **Hidden di beranda:** tech stack, tim (tetap di `/team`, `/careers`). Default harga: custom dari **Rp 25 juta**, konsultasi **Rp 150rb/jam**, maintenance **Rp 2 juta/bulan**.

**Footer:** `components/common/Footer.tsx` — putih, link horizontal, CTA Konsultasi Gratis.

**Branding admin (legacy):** API `/branding/*` dan `/admin/branding/*` tetap tersedia; section branding lama tidak lagi di homepage utama.

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL, Prisma ORM
- **Auth:** JWT with role-based access control
- **Deployment:** PM2/Nginx or Docker Compose

## Key Features

### Public Website

- Homepage with hero, real stats, services, blog preview, team preview, newsletter, and CTA
- Services listing and detail pages with process steps, FAQ, related articles, Calendly CTA
- Blog with categories, pagination, reading time, SEO metadata, JSON-LD
- About, team, contact, FAQ, careers, resources, portfolio/case studies, testimonials
- Contact lead form with multi-step validation, duplicate email check, consent, thank-you flow
- Automated transactional emails for leads, forms, newsletter, careers, and quiz follow-up
- Sitewide search from the header
- Exit intent modal V3: desktop top-edge trigger, max once per session, mobile disabled
- SEO: sitemap, robots.txt, canonical metadata, Open Graph, structured data

### Admin Dashboard

- JWT login and RBAC roles: `SuperAdmin`, `ContentManager`, `Editor`, `Viewer`
- CRUD for services, portfolio/case studies, blog, team, testimonials, FAQ, careers
- Lead management with status updates, notes, duplicate check, CSV export
- Media library upload
- Analytics overview and conversion tracking
- Email log monitoring and delivery stats
- Newsletter subscribers and quiz submissions
- Site settings for company info, homepage copy, legal content, GA, Crisp, Calendly
- User management for SuperAdmin

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- npm

### Docker

```bash
docker compose up -d
```

Default local URLs:

- Website: `http://localhost:3000`
- API: `http://localhost:4000`
- Admin: `http://localhost:3000/admin/login`

### Local Development

Start PostgreSQL:

```bash
docker compose up -d db
```

Backend:

```bash
cd backend
cp .env.example .env
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Frontend:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Default admin:

- Email: `admin@dntech.id`
- Password: `Admin@123456`

## Build & Verification

Frontend:

```bash
cd frontend
npm run build
```

Backend:

```bash
cd backend
npm run build
```

Notes:

- V4 removed the `next/font/google` dependency, so frontend build no longer needs outbound access to Google Fonts.
- Frontend lint is expected to pass cleanly.

## Deployment Notes

Typical VPS update:

```bash
git pull --rebase
```

Docker deployment:

```bash
docker compose down
docker compose build
docker compose up -d
```

PM2-style deployment:

```bash
cd backend
npm ci
npx prisma generate
npm run build
pm2 restart dntech-api

cd ../frontend
npm ci
npm run build
pm2 restart dntech-web
```

If `git pull --rebase` is blocked by `docs/IMPLEMENTATION-STATUS.md`, move the local untracked file first:

```bash
mv docs/IMPLEMENTATION-STATUS.md /tmp/IMPLEMENTATION-STATUS.local.md
git pull --rebase
```

## Environment Variables

### Backend `.env`

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `PORT` | API port, usually `4000` |
| `FRONTEND_URL` | Public frontend URL for CORS |
| `TRUST_PROXY` | Set `1` behind Nginx/reverse proxy |
| `SENDGRID_API_KEY` | SendGrid API key |
| `SENDGRID_FROM_EMAIL` | Sender email |
| `SALES_EMAIL` | Sales notification recipient |
| `SMTP_HOST` | SMTP host, default `mx8.mailspace.id` |
| `SMTP_PORT` | SMTP port, default `465` |
| `SMTP_SECURE` | `true` for SSL/TLS on port 465 |
| `SMTP_USER` | SMTP username, usually `info@dntech.id` |
| `SMTP_PASSWORD` | SMTP mailbox password |
| `SMTP_FROM_NAME` | Sender name, default `DN Tech` |
| `SMTP_FROM_EMAIL` | Sender email, usually `info@dntech.id` |
| `ADMIN_EMAIL` | Admin notification inbox, usually `info@dntech.id` |
| `EMAIL_RETRY_ATTEMPTS` | Retry attempts for failed sends |
| `EMAIL_RATE_LIMIT` | Nodemailer pool rate limit |

### Frontend `.env.local`

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL, e.g. `https://api.dntech.id/api/v1` |
| `NEXT_PUBLIC_ENABLE_EXIT_MODAL` | Set `false` to disable V3 exit modal |
| `NEXT_PUBLIC_CRISP_WEBSITE_ID` | Optional build-time Crisp website ID |

## API Overview

Base local URL: `http://localhost:4000/api/v1`

Public endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/services` | Active services |
| `GET` | `/services/:slug` | Service detail |
| `GET` | `/blog` | Blog list |
| `GET` | `/blog/:slug` | Blog detail |
| `GET` | `/team` | Team members |
| `GET` | `/faq` | FAQ list |
| `GET` | `/settings` | Public site settings |
| `POST` | `/leads` | Submit lead |
| `POST` | `/newsletter/subscribe` | Subscribe email |
| `GET` | `/newsletter/confirm?token=` | Confirm newsletter subscription |
| `GET` | `/newsletter/unsubscribe?token=` | Unsubscribe newsletter |
| `GET` | `/search?q=` | Sitewide search |

Admin endpoints are under `/admin/*` and require a bearer token.

## Project Structure

```text
dntech/
├── backend/
│   ├── prisma/
│   └── src/
│       ├── routes/
│       ├── services/
│       ├── middleware/
│       └── utils/
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── (public)/
│       │   └── admin/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── types/
├── docs/
│   ├── V2/
│   ├── v3/
│   ├── IMPLEMENTATION-STATUS.md
│   └── DEPLOYMENT-PRODUCTION.md
├── docker-compose.yml
└── README.md
```

## Performance Optimization Summary

V4 implemented the main performance fixes identified in the audit. Remaining work is production Lighthouse/Core Web Vitals verification.

Implemented items:

- Homepage streams non-critical blog/team sections with `Suspense`.
- Public settings use server cache and are passed to GA/Crisp loaders.
- GA loads when the browser is idle; Crisp loads on first user interaction.
- Public images and admin media previews use `next/image`.
- Header search uses 300ms debounce and cancels previous requests.
- Backend public endpoints use memory TTL cache with admin mutation invalidation.
- Font stack no longer depends on Google Fonts during build.

## Documentation

| Document | Purpose |
|----------|---------|
| `docs/IMPLEMENTATION-STATUS.md` | Current implementation status and performance audit |
| `docs/PROJECT-OVERVIEW.md` | Technical project overview |
| `docs/DEPLOYMENT-PRODUCTION.md` | Production deployment guide |
| `docs/V2/` | PRD, design system, and SEO guide V2 |
| `docs/v3/` | V3 refinement PRD, SDD, summary, and implementation guide |
| `docs/v4/` | V4 performance PRD, summary, and implementation guide |
| `docs/v5/` | V5 email system PRD, roadmap, summary, and implementation guide |
| `docs/DNTECH-COMPANY-PROFILE.md` | Company profile content reference |

## License

Proprietary - DN Tech © 2026

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026

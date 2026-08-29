# DN Tech Company Profile Website

> **Author:** Dozer  
> **Date:** 2026-08-29

Production-ready company profile website for DN Tech with a public marketing site, admin CMS, lead generation, analytics, and SEO foundations.

| | |
|---|---|
| Owner | Dozer (CEO + Tech Lead + PM) |
| Company | DN Tech (PT. Dozer Napitupulu Technology) |
| Brand | DN Tech (DN Tech.id) |
| UpdatedAt | August 29, 2026 |
| Repo | [github.com/dreamcraft17/dntech](https://github.com/dreamcraft17/dntech) |
| Live | https://dntech.id · https://api.dntech.id |

## Current Status

| Area | Status | Notes |
|------|--------|-------|
| Public website | Implemented | Content is database/admin-driven, no fake demo content |
| Admin CMS | Implemented | Services, products, portfolio, blog, team, FAQ, careers, leads, analytics, branding, email logs, settings, users |
| PRD/Design/SEO V2 | Implemented | Solid color design system, Indonesian copy, startup/SME positioning |
| V3 refinements | Implemented | Exit intent fix, logo variants, mobile nav polish, form accessibility |
| Jul 9 polish | Implemented | Button href fix, about CMS live, `rlogo2` branding, hero wordmark, admin toast |
| Footer redesign (Jul 9) | Implemented | Putih, layout horizontal, `FooterBrand` wordmark, tanpa newsletter di footer |
| Homepage PRD Indonesia (Jul 9) | Implemented | Direct-market homepage; `homeContent` CMS; `components/homepage/*` |
| Homepage tuning (Jul 9 malam) | Implemented | Tech stack & tim hidden on homepage; UMKM-friendly pricing |
| Branding section rollout | Implemented | Prisma branding models + admin API (legacy homepage sections; modul admin tetap) |
| V4 performance | Implemented | Debounce search, deferred scripts, cached settings/API, parallel homepage fetch, Next Image, font/build fix |
| V5 email system | Implemented | SMTP via `mx8.mailspace.id:465`, email templates, retry/logging, newsletter confirmation, admin email logs |
| V6 Produk module (Jul 12) | Implemented | New `Product` content type parallel to Services — public `/products` + `/products/[slug]`, admin CRUD `/admin/products`, sitewide search, sitemap; DB push to production pending |
| V7 Product Section PRD (Jul 12) | Implemented | dnPeople flagship + 6 produk lain (dnCore, dnShop, Nearwork, DVS, Threads Automation, Trusted Jurist); seed via `db:seed-products` |
| Multi-product seeds (Aug 17) | Implemented | 7 produk DN Tech (kecuali DOVA) · `npm run db:seed-products` · production seed pending |
| Product page crash hotfix (Jul 26) | Fixed | Removed `ROICalculator` from `/products/[slug]`; see `docs/BUG_FIXES.md` BF-017 |
| Homepage services API (Jul 26) | Fixed | Homepage + `/services` wired to admin; see BF-018 |
| Blog SSR (Jul 26) | Fixed | `/blog` listing + detail use production SSR resolver; see BF-019 |
| Public SSR audit (Jul 26) | Fixed | All public SSR pages + settings/branding/sitemap migrated; see BF-020 |
| Testing framework (Jul 28) | Complete | 81 automated tests passing (`45` backend + `36` frontend), 5 E2E scenarios (desktop+mobile matrix), CI test jobs wired |
| Frontend build | Passing | `npm run build` succeeds without Google Fonts network dependency (Next.js 16.2.9, React 19.2.4) |
| Backend build | Passing | `npm run build` succeeds |
| Full lint | Passing | Frontend lint succeeds with 0 errors/warnings |
| Performance | Optimized | See `docs/IMPLEMENTATION-STATUS.md` for V4 details and remaining Lighthouse verification |
| **Relaunch honesty (Aug 29)** | Shipped in app | Honest seeds, admin password gate, About/branding, product badge — [launch pack](./docs/launch/README.md) |
| **Anti-slop pass 2 (`c83d866`)** | Shipped in app | Hero → `/products`, footer chrome, skip-link, CSP, Storybook, Lighthouse — live site needs rebuild |
| **VPS seed (Aug 29)** | Partial | Branding + 7 products seeded; admin rotate **not** run; SMTP BF-014 unverified |
| **Launch ops gate** | Open | Frontend prod rebuild, admin rotate, SMTP live test — BF-013, BF-014 |

Latest implementation reference: **`c83d866`** (Aug 29) — public chrome + anti-slop gate; prior **`a4a8e29`** honesty/auth; **`836266b`** (Jul 26) SSR audit BF-020.

**Docs:** [`docs/CHANGELOG.md`](docs/CHANGELOG.md) · [`docs/BUG_FIXES.md`](docs/BUG_FIXES.md) · [`docs/IMPLEMENTATION-STATUS.md`](docs/IMPLEMENTATION-STATUS.md) · [`docs/QA-CHECKLIST-V8.md`](docs/QA-CHECKLIST-V8.md) · [`docs/DEPLOYMENT-PRODUCTION.md`](docs/DEPLOYMENT-PRODUCTION.md)

**Branding:** Logo resmi `frontend/public/rlogo2.png`; favicon `src/app/icon.png`; navbar & footer menampilkan **DN Tech.id** (`LogoLight` / `FooterBrand`).

**Homepage:** PRD [Indonesia Edition](https://github.com/dreamcraft17/company-wiki/blob/main/docs/products/dntech/branding/DN-TECH-HOMEPAGE-REDESIGN-PRD-INDONESIA-EDITION.md) — hero, layanan (max 6 **aktif** dari admin), proses, keunggulan, portfolio, testimoni, FAQ, harga, CTA. **Hidden di beranda:** tech stack, tim (tetap di `/team`, `/careers`). Kartu layanan **tanpa** baris tech per item.

**Footer:** `components/common/Footer.tsx` — putih, link horizontal, CTA Konsultasi Gratis.

**Branding admin (legacy):** API `/branding/*` dan `/admin/branding/*` tetap tersedia; section branding lama tidak lagi di homepage utama.

## Production SSR API (Jul 26)

Semua halaman publik yang render di server memakai helper di `frontend/src/lib/server-api.ts`:

| Helper | Use case |
|--------|----------|
| `fetchPublicApiList` | Listing (services, blog posts in homepage, team, …) |
| `fetchPublicApiSafe` | Detail by slug (`/services/[slug]`, `/blog/[slug]`, …) |
| `fetchPublicApiPaginated` | Paginated lists (`/blog` with page/category) |

**Resolver chain (production):** `API_INTERNAL_URL` → `http://127.0.0.1:4000/api/v1` → `getApiBaseUrl()` (`https://api.dntech.id/api/v1`).

Jangan fetch langsung dengan `NEXT_PUBLIC_API_URL || localhost` di Server Components — itu menyebabkan data kosong / 404 di `dntech.id` (BF-016–BF-020).

**Client-side OK:** `/faq`, `/about` memakai `getApiUrl()` di browser (sudah normalisasi production).

### Konten admin → website

| Modul | Syarat tampil di publik |
|-------|-------------------------|
| Layanan | Status **Aktif** di `/admin/services` |
| Blog | Status **Published** + `publishedAt` ≤ hari ini |
| Produk | Status **active** / launched sesuai seed |
| Tim, FAQ, careers, portfolio, case studies | CRUD admin + API public endpoint |

Setelah `git pull`, **wajib** `npm run build` di frontend — perubahan SSR/API tidak live hanya dengan restart PM2 tanpa rebuild.

## Tech Stack

- **Frontend:** Next.js 16.2.9, React 19.2.4, Tailwind CSS
- **Backend:** Node.js, Express 5, TypeScript, Prisma 6
- **Database:** PostgreSQL, Prisma ORM
- **Auth:** JWT with role-based access control
- **Email:** SMTP (nodemailer) via `mx8.mailspace.id:465`
- **Deployment:** PM2/Nginx or Docker Compose

## Key Features

### Public Website

- Homepage Indonesia Edition: hero, layanan dari admin (API), proses, keunggulan, portfolio, testimoni, FAQ, harga, CTA
- Tech stack & tim **hidden** on homepage (tetap di `/team`, `/careers`); newsletter tidak di footer
- Services listing and detail pages with process steps, FAQ, related articles, Calendly CTA
- Products listing and detail pages (separate nav from Services) — V7 flagship fields for dnPeople
- Blog with categories, pagination, reading time, SEO metadata, JSON-LD
- About, team, contact, FAQ, careers, resources, portfolio/case studies, testimonials
- Contact lead form with multi-step validation, duplicate email check, consent, thank-you flow
- Automated transactional emails for leads, forms, newsletter, careers, and quiz follow-up
- Sitewide search from the header
- Exit intent modal V3: desktop top-edge trigger, max once per session, mobile disabled
- Global loading UX: route fallbacks + API overlay (Jul 13)
- SEO: sitemap, robots.txt, canonical metadata, Open Graph, structured data

### Admin Dashboard

- JWT login and RBAC roles: `SuperAdmin`, `ContentManager`, `Editor`, `Viewer`
- CRUD for services, products, portfolio/case studies, blog, team, testimonials, FAQ, careers
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
npm run db:seed-products   # seed 7 produk (dnPeople, dnCore, dnShop, Nearwork, DVS, Threads, TJ)
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

PM2-style deployment (VPS):

```bash
cd /var/www/dntech   # or your deploy path
git pull --rebase origin main

cd backend
npm ci
npx prisma generate
npm run build
pm2 restart dntech-api

cd ../frontend
npm ci
npm run build          # required — SSR helpers baked at build time
pm2 restart dntech-web
```

Pastikan `frontend/.env.local` (production) memuat:

```env
NEXT_PUBLIC_API_URL=https://api.dntech.id/api/v1
NEXT_PUBLIC_SITE_URL=https://dntech.id
API_INTERNAL_URL=http://127.0.0.1:4000/api/v1
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
| `NEXT_PUBLIC_API_URL` | Public API base URL, e.g. `https://api.dntech.id/api/v1` (browser + fallback SSR) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL, e.g. `https://dntech.id` (required for `validate:env` + sitemap) |
| `API_INTERNAL_URL` | **Production SSR:** loopback to PM2 API, e.g. `http://127.0.0.1:4000/api/v1` |
| `NEXT_PUBLIC_ENABLE_EXIT_MODAL` | Set `false` to disable V3 exit modal |
| `NEXT_PUBLIC_CRISP_WEBSITE_ID` | Optional build-time Crisp website ID |

## API Overview

Base local URL: `http://localhost:4000/api/v1`

Public endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/services` | Active services |
| `GET` | `/services/:slug` | Service detail |
| `GET` | `/products` | Active products (V6/V7) |
| `GET` | `/products/:slug` | Product detail (V6/V7) |
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
│   ├── v4/
│   ├── v5/
│   ├── IMPLEMENTATION-STATUS.md
│   ├── PROJECT-OVERVIEW.md
│   └── DEPLOYMENT-PRODUCTION.md
├── design/
├── PRD/
├── docker-compose.yml
└── README.md
```

## Performance Optimization Summary

V4 implemented the main performance fixes identified in the audit. Remaining work is production Lighthouse/Core Web Vitals verification.

Implemented items:

- Homepage parallel-fetches settings/services/case-studies/FAQ/testimonials (no blog/team Suspense streaming).
- Public settings use server cache and are passed to GA/Crisp loaders.
- GA loads when the browser is idle; Crisp loads on first user interaction.
- Public images and admin media previews use `next/image`.
- Header search uses 300ms debounce and cancels previous requests.
- Backend public endpoints use memory TTL cache with admin mutation invalidation.
- Font stack no longer depends on Google Fonts during build.

## Documentation

| Document | Purpose |
|----------|---------|
| `docs/CHANGELOG.md` | Release notes (0.8.x hotfixes Jul 26) |
| `docs/BUG_FIXES.md` | Bug register BF-013–BF-020 |
| `docs/IMPLEMENTATION-STATUS.md` | Full implementation status + hotfix sections |
| `docs/QA-CHECKLIST-V8.md` | Pre/post deploy QA checklist |
| `docs/PROJECT-OVERVIEW.md` | Technical project overview |
| `docs/DEPLOYMENT-PRODUCTION.md` | Production deployment guide |
| `docs/DN-TECH-PRD-V8-FOUNDATION.md` | V8 baseline for next PRD |
| `docs/V2/` | PRD, design system, and SEO guide V2 |
| `docs/v3/` | V3 refinement PRD, SDD, summary, and implementation guide |
| `docs/v4/` | V4 performance PRD, summary, and implementation guide |
| `docs/v5/` | V5 email system PRD, roadmap, summary, and implementation guide |
| `docs/DNTECH-COMPANY-PROFILE.md` | Company profile content reference |
| `docs/TESTING.md` | Test strategy, commands, and CI flow |

## License

Proprietary - DN Tech © 2026

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026

| | |
|---|---|
| Owner | Dozer (CEO + Tech Lead) |
| Company | DN Tech (PT. Dozer Napitupulu Technology) |
| Brand | DN Tech (DN Tech.id) |
| UpdatedAt | July 26, 2026 |

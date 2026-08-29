# DN Tech Changelog

All notable changes to the DN Tech company profile website (`dntech.id`).

## [0.9.0] — 2026-07-28

### Added
- **Testing framework baseline end-to-end** berdasarkan `docs/test/*`: Jest backend, Jest+RTL frontend, Supertest integration tests, Playwright E2E smoke, dan k6 performance scripts.
- **Test infra files**: `backend/jest.config.js`, `frontend/jest.config.js`, `frontend/playwright.config.ts`, test setup files, serta struktur `__tests__` di backend/frontend.
- **Testing documentation**: `docs/TESTING.md` sebagai panduan operasional test lokal + CI.

### Changed
- **CI workflow** (`.github/workflows/ci.yml`) sekarang menjalankan backend unit/integration tests, frontend unit tests, dan Playwright smoke tests.
- **Backend server bootstrap**: `backend/src/index.ts` hanya `listen()` saat dijalankan langsung, sehingga aman di-import saat testing.

## [0.9.1] — 2026-07-28

### Added
- Expanded suites to exceed target deliverables: **50+ unit tests**, **15+ integration tests**, **5 E2E scenarios**.
- New backend coverage suites for `helpers`, `cache`, `email templates`, `products route`, and `auth route`.
- New frontend suites for `Alert`, `Badge`, `Card`, `ContactForm`, `utils`, `currency`, `read-time`, and `content pillars`.

### Fixed
- Sanitized dynamic fields in admin lead email template to prevent raw HTML injection in notification content.

### Docs
- Updated `docs/TESTING.md`, testing PRD/SRS/SDD docs, and status docs with actual pass/coverage metrics.

---

## [0.8.4] — 2026-07-26

### Fixed
- **Public SSR API audit (BF-020)** — all remaining public pages and shared SSR libs migrated from raw `NEXT_PUBLIC_API_URL` fetch to `fetchPublicApi*` helpers with production resolver + internal fallback.

**Migrated:** `settings.ts`, `branding.ts`, `sitemap.ts`, `/testimonials`, `/case-studies`, `/case-studies/[slug]`, `/portfolio`, `/portfolio/[slug]`, `/contact`, `/team`, `/careers`, `/terms`, `/privacy`, FAQ JSON-LD; products pages aligned to `fetchPublicApiList` / `fetchPublicApiSafe`.

**Already on resolver (prior commits):** homepage, `/services`, `/blog`, `/products`.

**Client-side (browser fetch via `getApiUrl`, OK):** `/faq` page, `/about` content.

---

## [0.8.3] — 2026-07-26

### Fixed
- **Blog listing & detail empty / 404 in production** — `/blog` and `/blog/[slug]` now use `fetchPublicApiPaginated` / `fetchPublicApiSafe` (same SSR resolver as services/products). See **BF-019**.

### Changed
- Blog category chips always show content pillars (not only when posts exist); empty-state message when no published posts for a topic.

---

## [0.8.2] — 2026-07-26

### Fixed
- **Homepage layanan tidak sinkron dengan admin** — section "Apa yang Kami Tawarkan" memakai `fetchPublicApiList('/services')` (resolver API production + fallback internal), bukan fetch URL mentah yang gagal di SSR. Lihat `docs/BUG_FIXES.md` **BF-018**.
- **`/services` dan `/services/[slug]`** — public listing + detail memakai helper SSR yang sama (`fetchPublicApiList` / `fetchPublicApiSafe`); fixes 404 on service detail pages in production.

### Changed
- **Kartu layanan homepage** — baris `Tech: …` per item dihapus (judul + deskripsi saja).
- **Admin `/admin/services`** — catatan bahwa hanya status **Aktif** yang tampil di website.

### Docs
- Updated `CHANGELOG.md`, `BUG_FIXES.md`, `IMPLEMENTATION-STATUS.md`, `README.md`, `QA-CHECKLIST-V8.md`, `PROJECT-OVERVIEW.md`.

---

## [0.8.1] — 2026-07-26

### Fixed
- **Product detail crash on `/products/dnpeople`** — removed misplaced `ROICalculator` from product pages; hardened calculator with local rate fallbacks. See `docs/BUG_FIXES.md` **BF-017**.

### Docs
- Added `docs/BUG_FIXES.md` and this changelog.
- Updated `IMPLEMENTATION-STATUS.md`, `PROJECT-OVERVIEW.md`, `QA-CHECKLIST-V8.md`, `DN-TECH-PRD-V8-FOUNDATION.md`, `README.md`.

---

## [0.8.0] — 2026-07-24 (prior)

### Added (V8 codebase — see commit history)
- Auth refresh, forgot-password email, health check improvements, product guided editor, CI workflow, multi-product playbook docs.

---

## [0.7.0] — 2026-07-16

### Changed
- dnPeople product seed copy refresh (`seed-dnpeople-product.ts`).

---

## [0.6.x] — 2026-07-12 / 13

### Added
- V6 Product module (`/products`, admin CRUD).
- V7 dnPeople flagship product page fields (pricing tiers, integrations, comparison, roadmap).
- Loading UX global + public product API SSR hotfix.

---

## [0.5.0] — 2026-07 (V5)

### Added
- SMTP email system, newsletter double opt-in, admin email logs.

---

## [0.4.0] — 2026-07 (V4)

### Changed
- Performance: debounced search, deferred GA/Crisp, API cache, `next/image`, removed Google Fonts build dependency.

---

## Earlier

See `docs/v3/`, `docs/v4/`, `docs/v5/`, `docs/V2/` for versioned PRD history (V1–V5).

| | |
|---|---|
| Owner | Dozer (CEO + Tech Lead) |
| Company | DN Tech (PT. Dozer Napitupulu Technology) |
| UpdatedAt | July 26, 2026 |

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026

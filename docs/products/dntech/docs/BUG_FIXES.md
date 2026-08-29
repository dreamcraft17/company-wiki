# DN Tech Bug Fixes

> **Author:** Dozer
> **Last updated:** 2026-08-29

Known issues found during MVP / production work, and their status.

## Fixed — 2026-08-29 (relaunch honesty)

| ID | Area | Issue | Fix |
|----|------|-------|-----|
| BF-021 | About / branding | Honest `seed-branding` wrote `BrandContent`; `/about` read empty `SiteSettings.aboutContent` | About merges branding + settings; seed dual-writes `aboutContent` |
| BF-024 | Product page | `Dipercaya {Soft launch} pelanggan` | `formatProductStatusBadge` — numeric count vs status string |
| BF-027 | Auth seed | Default `Admin@123456`; upsert `update: {}` left old hash | `resolveAdminPassword`; rotate only with `ROTATE_ADMIN=1` (`db:vps:seed`); `with` refuses `db:seed` |
| BF-023 / portfolio | Empty social pages | Case studies / portfolio claimed real clients when empty | Honest empty-state copy |

---

## Fixed — 2026-07-26

| ID | Area | Issue | Fix |
|----|------|-------|-----|
| BF-017 | Product page | `/products/dnpeople` (and any product with pricing tiers) showed black error page: `TypeError: Cannot read properties of undefined (reading 'junior')` | `ROICalculator` was mounted on product detail when `pricingTiers` exist; it read `DEV_RATES_IDR.junior` at render time and crashed when the client bundle did not expose `DEV_RATES_IDR`. Removed calculator from `products/[slug]/page.tsx` (wrong UX for SaaS product pages). Added `DEFAULT_DEV_RATES_IDR` fallback in `ROICalculator.tsx`. **Deploy frontend rebuild required.** |
| BF-018 | Homepage services | Section "Apa yang Kami Tawarkan" always showed 6 hardcoded default cards, not data from `/admin/services`; `/services/[slug]` returned 404 in production | Homepage/listing SSR used raw `NEXT_PUBLIC_API_URL` fetch (same class of bug as BF-016). Switched homepage, `/services`, and `/services/[slug]` to `fetchPublicApiList` / `fetchPublicApiSafe` with production API resolver + internal fallback. Only **active** services appear; fallback defaults used only when API returns empty. Removed per-card `Tech:` line from `HomeServices`. |
| BF-019 | Blog SSR | `/blog` showed no posts; `/blog/[slug]` 404 in production despite published posts in admin | Blog pages used raw API URL fetch. Switched to `fetchPublicApiPaginated` (listing) and `fetchPublicApiSafe` (detail). Category filters use content pillars; empty state when no published posts. |
| BF-020 | Public SSR audit | Team, portfolio, case studies, contact, careers, legal, settings/branding, sitemap still used raw API URL — empty or 404 in production | Full audit: all SSR loaders use `fetchPublicApi*` from `lib/server-api.ts`. Resolver chain: `API_INTERNAL_URL` → `127.0.0.1:4000` (prod) → `getApiBaseUrl()`. |

**Files (BF-017):** `frontend/src/app/(public)/products/[slug]/page.tsx`, `frontend/src/components/interactive/ROICalculator.tsx`

**Files (BF-018):** `frontend/src/app/(public)/page.tsx`, `frontend/src/app/(public)/services/page.tsx`, `frontend/src/app/(public)/services/[slug]/page.tsx`, `frontend/src/lib/server-api.ts`, `frontend/src/components/homepage/HomeServices.tsx`, `frontend/src/lib/homepage-content.ts`, `frontend/src/app/admin/services/page.tsx`

**Files (BF-019):** `frontend/src/app/(public)/blog/page.tsx`, `frontend/src/app/(public)/blog/[slug]/page.tsx`, `frontend/src/lib/server-api.ts`

**Files (BF-020):** `frontend/src/lib/settings.ts`, `frontend/src/lib/branding.ts`, `frontend/src/app/sitemap.ts`, public pages: testimonials, case-studies, portfolio, contact, team, careers, terms, privacy, faq JSON-LD, products (refactor)

---

## Fixed — 2026-07-13 (prior)

| ID | Area | Issue | Fix |
|----|------|-------|-----|
| BF-016 | Product SSR | Active products visible in admin but empty on public `/products` | Shared API URL resolver; production rejects localhost; misrouted `dntech.id/api` normalized to `api.dntech.id`. |

---

## Open / known (ops & post-MVP)

| ID | Area | Issue | Notes |
|----|------|-------|-------|
| BF-013 | Ops | Production schema push + full `db:seed` (admin) not verified on VPS | **2026-08-29:** `db:seed-branding` + `db:seed-products` (7 produk, termasuk dnPeople) via tunnel laptop **sudah** dijalankan. `prisma db push` tidak di-ulang. `db:seed` admin **tidak** dijalankan — `ADMIN_PASSWORD` tidak ada di `.env` VPS. Lihat [runbooks/vps-postgres-seed.md](./runbooks/vps-postgres-seed.md). |
| BF-014 | Ops | SMTP live send to `info@dntech.id` not fully verified | See `docs/v5/DN-TECH-V5-HOTFIX-*.md` |
| BF-015 | Design | Star ratings decorative (no review API) | Post-MVP |

---

## How to report

1. Reproduce on local or production (URL, role, browser).
2. Note expected vs actual.
3. Add a row under **Open** with ID `BF-XXX`, or open a GitHub issue.

| | |
|---|---|
| Owner | Dozer (CEO + Tech Lead) |
| UpdatedAt | August 29, 2026 |

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026

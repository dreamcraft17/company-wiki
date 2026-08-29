# DN Tech — Current Implementation

> **Author:** Dozer  
> **Date:** 2026-08-29  
> **Snapshot:** HEAD `91c6551` · v0.10.0 living docs + homepage SSR trim · Ops gates partial

Company profile + admin CMS for **DN Tech** (PT. Dozer Napitupulu Technology). Indonesian marketing site, lead capture, first-party product catalog — honest empty states (0 paying clients).

| | |
|---|---|
| **Repo** | [github.com/dreamcraft17/dntech](https://github.com/dreamcraft17/dntech) |
| **Live** | https://www.dntech.id · https://api.dntech.id |
| **Stack** | Next.js 16.2.9 · React 19.2.4 · Express 5 · Prisma 6 · PostgreSQL |
| **Deploy** | PM2 + Nginx (VPS) · Docker Compose (local) |

---

## Codebase snapshot (verified 2026-08-29)

| Metric | Value | How verified |
|--------|-------|--------------|
| Git HEAD | `91c6551` | `git log -1` |
| Backend unit tests | **50** pass | `cd backend && npm test` |
| Frontend unit tests | **49** pass | `cd frontend && npm test` |
| Prisma models | **24** | `grep -c '^model ' backend/prisma/schema.prisma` |
| Public/admin pages | **45** | `find frontend/src/app -name page.tsx` |
| Backend route modules | **20** | `backend/src/routes/*.ts` |
| CI | Lint + test + build | `.github/workflows/ci.yml` |
| Frontend build | Passing | `npm run build` (standalone) |

Historical deep-dive (V1–V7): [`IMPLEMENTATION-STATUS.md`](./IMPLEMENTATION-STATUS.md) — **legacy length**; prefer this file + [`FEATURE-CATALOG.md`](./FEATURE-CATALOG.md) for PRD baseline.

---

## Architecture

```text
dntech/
├── frontend/   Next.js App Router — public (public)/ + admin/
├── backend/    Express API :4000 · Prisma · SMTP · uploads
└── docs/       Living docs + versioned PRD/SRS/SDD history
```

**SSR resolver:** `frontend/src/lib/server-api.ts` — `API_INTERNAL_URL` → loopback → `NEXT_PUBLIC_API_URL` (BF-016–BF-020).

---

## Public surface

| Area | Routes | Status |
|------|--------|--------|
| Homepage Indonesia Edition | `/` | Done — CMS `homeContent`, honest fallbacks; portfolio/testimonials **off** `/` (dedicated routes only) |
| Layanan | `/services`, `/services/[slug]` | Done — active services from admin |
| Produk (V6/V7) | `/products`, `/products/[slug]` | Done — 7 seed products (excl. DOVA) |
| Blog, About, Team, Contact, FAQ | ✅ | Done — SSR + CMS |
| Careers, portfolio, case studies, testimonials | ✅ | Done — **honest empty states** (Aug relaunch) |
| Lead gen | contact form, newsletter, quiz, exit intent | Done code · SMTP live **Conditional** |
| SEO | sitemap, robots, JSON-LD, meta | Done |

---

## Admin CMS

JWT + RBAC (`SuperAdmin`, `ContentManager`, `Editor`, `Viewer`). CRUD: services, products, portfolio, blog, team, testimonials, FAQ, careers, leads, media, newsletter, quiz, settings, users, email logs, branding (legacy module).

**Auth:** Production rejects default passwords; seed admin rotation via `ROTATE_ADMIN=1` (BF-027).

---

## Relaunch pass (Aug 2026)

Shipped in `c83d866` → `91c6551`:

- Anti-slop copy (`homepage-content`, testimonials, portfolio, careers)
- Skip link, CSP/security headers, deferred ExitIntent + dynamic Header search
- Native `<details>` FAQ (server component)
- Lighthouse baseline recorded — [`frontend/LIGHTHOUSE-BASELINE.md`](./frontend/LIGHTHOUSE-BASELINE.md)
- Footer layout + legal company name in copyright
- Living docs layer (`CURRENT-IMPLEMENTATION`, `FEATURE-CATALOG`, `NEXT-PRD-BRIEF`) · [`CHANGELOG.md`](./CHANGELOG.md) `[0.10.0]`
- Homepage SSR trim — `HomePortfolio` + `HomeTestimonials` removed from `/` (routes remain)

**Not yet verified on prod after deploy:** homepage LCP improvement, SMTP end-to-end, post-deploy Lighthouse re-run.

---

## Production gates (Conditional)

| Gate | Status | Reference |
|------|--------|-----------|
| VPS `db:seed-products` (7 produk) | **Done** (2026-08-29 tunnel) | BF-013 · [runbooks/vps-postgres-seed.md](./runbooks/vps-postgres-seed.md) |
| VPS `db:seed-branding` + About content | **Done** | BF-021 |
| Frontend prod rebuild + PM2 restart | **Open** | Required after every `NEXT_PUBLIC_*` change |
| SMTP live send `/contact` → inbox | **Open** | BF-014 |
| Lighthouse perf ≥85 homepage | **Open** | Pre-deploy baseline perf 67 |
| Marketing relaunch (LinkedIn, etc.) | **Open** | [launch/dntech-relaunch-checklist.json](./launch/dntech-relaunch-checklist.json) |

---

## Related docs

| Doc | Purpose |
|-----|---------|
| [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) | Module status Done / Conditional / Planned |
| [NEXT-PRD-BRIEF.md](./NEXT-PRD-BRIEF.md) | Input for PRD/SRS/SDD berikutnya |
| [CHANGELOG.md](./CHANGELOG.md) | Release history |
| [BUG_FIXES.md](./BUG_FIXES.md) | BF-013–BF-027 |
| [DN-TECH-RELAUNCH-PRD.md](./DN-TECH-RELAUNCH-PRD.md) | Relaunch scope (Aug 2026) |
| [DN-TECH-PRD-V8-FOUNDATION.md](./DN-TECH-PRD-V8-FOUNDATION.md) | V8 foundation (Jul 2026) |

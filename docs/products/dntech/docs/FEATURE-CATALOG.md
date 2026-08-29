# DN Tech — Feature Catalog

> **Author:** Dozer  
> **Date:** 2026-08-29  
> **Baseline:** HEAD `1da8191`

Module-level status for PRD/SRS/SDD writers. **Done** = shipped in codebase. **Conditional** = code exists but ops/env/legal gate open. **Planned** = not in code.

---

## Public marketing

| Module | Status | Notes |
|--------|--------|-------|
| Homepage Indonesia Edition | **Done** | Hero, layanan, proses, keunggulan, portfolio, testimoni, FAQ, harga, CTA |
| Honest empty states (testimonials, portfolio, careers, case studies) | **Done** | Aug 2026 relaunch — no fake social proof |
| Services listing + detail | **Done** | SSR `fetchPublicApi*` · active only |
| Products listing + detail (V6/V7) | **Done** | dnPeople flagship fields; status badges honest |
| Blog + categories | **Done** | SSR BF-019 |
| About (CMS + branding merge) | **Done** | BF-021 dual-write |
| Contact multi-step form | **Done** | RHF + Zod + honeypot |
| FAQ, team, resources, quiz | **Done** | CMS-driven |
| Legal (privacy, terms) | **Done** | |
| Sitewide search (header) | **Done** | Dynamic load · 300ms debounce |
| Exit intent modal | **Done** | Desktop only · deferred chunk · once/session |
| Skip link + mobile nav focus trap | **Done** | Aug 2026 frontend hardening |
| Sticky CTA + Crisp + GA | **Done** | GA idle · Crisp on interaction |

---

## Product catalog (seed)

| Product | Slug (typical) | Status |
|---------|----------------|--------|
| dnPeople HRIS | `dnpeople` | **Done** seed · Soft launch copy |
| dnCore ERP | `dncore` | **Done** seed |
| dnShop Finance | `dnshop` | **Done** seed |
| NextWork (Nearwork) | `nearwork` | **Done** seed |
| DVS | `dvs` | **Done** seed |
| Threads Automation | `threads-automation` | **Done** seed |
| Trusted Jurist | `trusted-jurist` | **Done** seed |
| DOVA | — | **Out of scope** on compro (separate product) |

Seed command: `npm run db:seed-products` (backend). VPS run documented BF-013.

---

## Admin CMS

| Module | Status | Notes |
|--------|--------|-------|
| Auth JWT + RBAC | **Done** | BF-027 production password gate |
| Services CRUD | **Done** | |
| Products CRUD | **Done** | V6/V7 extended fields |
| Blog, team, FAQ, careers | **Done** | |
| Portfolio / case studies | **Done** | |
| Leads + CSV export | **Done** | |
| Media library | **Done** | |
| Site settings + homepage CMS | **Done** | `homeContent` JSON |
| Newsletter + quiz submissions | **Done** | |
| Email logs | **Done** | V5 |
| Branding admin (legacy) | **Done** | Not on homepage main flow |
| User management | **Done** | SuperAdmin |

---

## Backend & integrations

| Module | Status | Notes |
|--------|--------|-------|
| Express API + Prisma | **Done** | 24 models |
| Public API memory cache | **Done** | V4 |
| SMTP nodemailer + templates | **Done** code | **Conditional** live send BF-014 |
| Newsletter confirm/unsubscribe | **Done** | |
| Uploads / multer | **Done** | |
| Rate limiting + helmet | **Done** | |

---

## Frontend platform

| Module | Status | Notes |
|--------|--------|-------|
| SSR public pages | **Done** | BF-020 audit |
| `next/image` AVIF/WebP | **Done** | |
| CSP + security headers | **Done** | Aug 2026 |
| `optimizePackageImports` lucide | **Done** | |
| Global loading indicator | **Done** | |
| Storybook (Button, Card, SectionHeading) | **Done** | Dev-only |
| Lighthouse script | **Done** | `npm run lighthouse` |

---

## Quality & CI

| Module | Status | Notes |
|--------|--------|-------|
| Backend unit tests | **Done** | 50 pass |
| Frontend unit tests | **Done** | 49 pass |
| Integration tests (Supertest) | **Done** | |
| Playwright E2E smoke | **Done** | 5 scenarios × 2 projects |
| k6 performance scripts | **Done** | Requires local `k6` binary |
| GitHub Actions CI | **Done** | |

---

## Planned / out of scope (next PRD)

| Item | Status | Notes |
|------|--------|-------|
| Fake client counts / testimonials | **Out of scope** | Anti-slop policy |
| ROI calculator on product pages | **Out of scope** | Removed BF-017 |
| CI/CD deploy automation | **Planned** | V8 foundation Track B |
| Redis session / refresh token hardening | **Planned** | V8 foundation |
| Product editor UX maturity (V8.2) | **Planned** | |
| Star ratings with real review API | **Planned** | BF-015 post-MVP |

See [NEXT-PRD-BRIEF.md](./NEXT-PRD-BRIEF.md) for greenfield lanes.

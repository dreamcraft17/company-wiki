# V8 QA Checklist

Reference: [PRD V8](../PRD/DN-TECH-PRD-V8.md) · [SDD V8](../PRD/DN-TECH-SDD-V8.md) · [SRS V8](../PRD/DN-TECH-SRS-V8.md)

## Track A: Go-live

- [ ] DB migration successful (production) — `npx prisma db push --skip-generate`
- [ ] Backup taken before production push (`pg_dump` timestamped file)
- [ ] dnPeople product published + featured (`status='launched'`, `featured=true`)
- [ ] `/products/dnpeople` renders all sections, no SSR errors in console (verify BF-017 fix deployed)
- [ ] Contact form → admin email (verify in info@dntech.id inbox, within 2 minutes)
- [ ] Newsletter signup → opt-in email (verify activation link works)
- [ ] Career form → email to applicant + admin notification
- [ ] Email logs show "sent" status for all test sends (`EmailLog` table)
- [ ] Admin password changed from default (`Admin@123456` no longer works)
- [ ] `npm run validate:env` passes on both backend and frontend before deploy

## Track B: Engineering

- [ ] CI pipeline (`.github/workflows/ci.yml`) runs on every push/PR to `main`
- [ ] Build + lint pass (0 errors) for backend and frontend jobs
- [ ] `POST /auth/refresh` issues a new access token from a valid refresh token
- [ ] Access token expires in 15 minutes; refresh token in 7 days
- [ ] `POST /auth/forgot-password` sends a real reset email (not just console.log)
- [ ] Reset token expires after 1 hour and is single-use
- [ ] `GET /health` returns 200 + `{status:"ok", uptime, environment}` when DB is reachable
- [ ] `GET /health` returns 503 when DB is unreachable

## Track C: Product (if in scope)

- [ ] Product image upload works (hero, logo, screenshots) via `/admin/products` guided uploader
- [ ] Uploaded media appears in shared library at `/admin/media`
- [ ] Pricing tier guided form (add/edit/delete tier) saves correctly, no raw JSON needed
- [ ] FAQ guided form (add/edit/delete Q&A) saves correctly, renders in accordion on product page
- [ ] Book Demo section visible on `/products/dnpeople`, embeds Calendly when `demoUrl` is set
- [ ] Product page does **not** show project ROI calculator (removed Jul 26 — BF-017)
- [ ] 2nd product seeded and published (DOVA or dummy) — see `docs/MULTI-PRODUCT-PLAYBOOK.md`

## General

- [ ] Lighthouse mobile ≥ 75 (Performance, Accessibility, Best Practices) — screenshot/report saved
- [ ] Mobile responsiveness: 320px, 640px, 1024px, 1440px — no horizontal scroll, buttons ≥48px
- [ ] Form accessibility: Tab through all inputs, labels + error states announced
- [ ] No errors in browser console / server logs during golden-path walkthrough
- [ ] Homepage "Apa yang Kami Tawarkan" shows active services from admin (not hardcoded defaults) — BF-018
- [ ] Service cards on homepage have no per-item `Tech:` line
- [ ] `/blog` lists published posts from admin; `/blog/[slug]` opens without 404 — BF-019
- [ ] `/team`, `/careers`, `/portfolio`, `/case-studies`, `/testimonials`, `/contact` load CMS data in production — BF-020
- [ ] `/terms` and `/privacy` load legal content from settings API — BF-020
- [ ] Sitemap includes dynamic URLs from services, products, blog, case studies — BF-020

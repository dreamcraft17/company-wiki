# DN Tech — Briefing Dasar PRD Berikutnya

> **Author:** Dozer  
> **Date:** 2026-08-29  
> **Baseline kode:** HEAD `1da8191` · Relaunch engineering **Done** · Ops/marketing **Conditional**  
> **Spec terakhir:** [DN-TECH-RELAUNCH-PRD.md](./DN-TECH-RELAUNCH-PRD.md) (Aug 2026) · [DN-TECH-PRD-V8-FOUNDATION.md](./DN-TECH-PRD-V8-FOUNDATION.md) (Jul 2026)  
> **Path:** `dntech/`  
> **Ganti dokumen ini?** Setelah PRD formal V8/V9 sign-off atau baseline operasional berubah

> **Cara pakai:** Baca §1–§4 dulu. Tulis PRD/SRS/SDD baru **hanya** untuk §5–§6. Jangan re-spec fitur di [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) yang sudah **Done**.

---

## 1. Keputusan singkat: PRD berikutnya tentang apa?

| Jalur | Isi | Kapan |
|-------|-----|--------|
| **A — Ops go-live** | SMTP proof, prod frontend rebuild, post-deploy Lighthouse, rollback tag, analytics verify | **Sekarang** — blocker relaunch |
| **B — V8 hardening** | CI/CD, smoke deploy, auth refresh, product CMS editor maturity | Setelah Jalur A green |
| **C — Growth conversion** | Founder outbound, honest LinkedIn, product→contact funnel metrics | Setelah site ops credible |
| **D — Platform** | Redis cache, monitoring, multi-editor workflow | Q4+ jika traffic/CMS load naik |

**Rekomendasi P0:** **Jalur A** sebagai **PRD V8.0 ops** (bukan fitur marketing baru). Engineering relaunch sudah Done; yang tersisa operasional.

---

## 2. Snapshot produk saat ini

| Item | Nilai |
|------|--------|
| Produk | DN Tech company profile (`dntech.id`) |
| Perusahaan | PT. Dozer Napitupulu Technology |
| Stack | Next.js 16 + Express 5 + PostgreSQL + Prisma |
| Tests | 99 unit (50 backend + 49 frontend) |
| Models / pages | 24 Prisma models · 45 Next.js pages |
| Klien bayar | **0** — copy must stay honest |
| Living docs | [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md) · [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) |

---

## 3. Yang sudah Done (jangan ulangi di PRD baru)

- V1–V7 feature scope (CMS, services, products V6/V7, email V5, perf V4, SSR BF-020)
- Relaunch anti-slop (Aug 2026): honest empty states, product status badges, About/branding BF-021
- Frontend hardening: skip link, CSP, deferred third-party JS, Header search split, FAQ native `<details>`
- VPS seed: `db:seed-branding` + `db:seed-products` (7 produk) via tunnel — BF-013
- Admin password gate + `ROTATE_ADMIN=1` — BF-027
- Testing framework: CI + Playwright + k6 scripts

Detail: [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) · [CHANGELOG.md](./CHANGELOG.md) `[0.10.0]`.

---

## 4. Conditional (bukan "belum dikode")

| Gate | Blocker |
|------|---------|
| SMTP live `/contact` → `info@dntech.id` | BF-014 · env + mailspace |
| Frontend **prod rebuild** after Aug patches | PM2 `dntech-web` · baked `NEXT_PUBLIC_*` |
| Lighthouse homepage LCP | Baseline 11401 ms pre-deploy — re-run post-deploy |
| Marketing relaunch checklist | LinkedIn, warm email, PH — [launch/dntech-relaunch-checklist.json](./launch/dntech-relaunch-checklist.json) |
| `db:seed` admin on VPS | Skipped — no `ADMIN_PASSWORD` in VPS `.env` (intentional) |

---

## 5. Greenfield valid untuk PRD berikutnya

**Jalur A — Ops (V8.0)**
- FR: SMTP delivery SLA + alert on failure
- FR: Deploy runbook with git tag + PM2 rollback verified
- FR: Post-deploy Lighthouse gate (perf ≥85 contact, a11y ≥90) on `/`, `/products/dnpeople`, `/contact`
- FR: GA/Plausible `page_view` verified on prod

**Jalur B — V8 hardening (from [DN-TECH-PRD-V8-FOUNDATION.md](./DN-TECH-PRD-V8-FOUNDATION.md))**
- GitHub Actions deploy/smoke (not just test)
- Refresh token / session hardening
- Product admin editor UX (pricing tiers, comparison table) without deploy

**Jalur C — Growth (only after A green)**
- Conversion tracking: product page → `/contact`
- 2–3 real blog posts OR hide blog from primary nav
- Founder one-pager PDF (honest, no fake stats)

**Do not spec as greenfield:** homepage sections, product module, SSR resolver, exit intent, newsletter flow — all **Done**.

---

## 6. Out of scope / anti-slop

- Invented client logos, testimoni, or "50+ proyek"
- DOVA on compro product catalog (seed script excludes DOVA)
- ROI calculator on SaaS product pages (BF-017)
- Enterprise positioning with 0 clients
- Equity, salary, VPS passwords in product PRD → `private-wiki/` only

---

## 7. Artefak turunan (setelah brief disetujui)

| Artefak | Input |
|---------|--------|
| `DN-TECH-PRD-V8.md` | §5 Jalur A or B |
| `DN-TECH-SRS-V8.md` | FR from approved PRD |
| `DN-TECH-SDD-V8.md` | CI, SMTP monitoring, deploy |
| `GO-LIVE-SIGNOFF-V8.0.md` | Checklist one-pager |

Format rules: workspace skill `spec-driven-workflow` (`.cursor/skills/spec-driven-workflow/SKILL.md`).

# Homepage system plan — dntech.id

> **Author:** Dozer  
> **Date:** 2026-08-29  
> **Type:** One-page PRD / Feature Brief  
> **Product:** Company profile homepage (`/`)  
> **Constraint:** 0 paying clients · Design V2.1 solid color · do **not** generate a new palette

---

## Problem

Founder or ops lead landing on `dntech.id` must understand in one screen that DN Tech is a **custom software studio for startup & UMKM**, then reach **konsultasi** or **produk first-party**. The page already has honest copy, but:

1. **LCP 11.4 s** (prod baseline 2026-08-29) — `hero_bg.png` as CSS background + SSR wait.
2. **Ten stacked sections** with centered uppercase headings — long scroll; empty portfolio/testimoni still occupy vertical space.
3. **Tokens exist but are not the homepage contract** — mix of `--primary` (`#1e3a8a`), `blue-950`, and `amber-600` star.

## Who / job

- **Who:** Founder / ops lead, Indonesia, mobile-4G first.
- **Job:** Decide in &lt; 60 s whether to contact Dozer or open a product page.
- **Not:** Enterprise “50+ klien” landing. No fake proof.

## Decision (do not invert)

**Extend V2.1 tokens. Do not run a new token generator.** Brand is already `#1E3A8A` / `#0D9488` / white / gray. A generated Inter + 50–900 scale would fight `DESIGN_SUMMARY.md` and the anti-slop gate.

## In scope (homepage only)

| ID | Change | Priority |
|----|--------|----------|
| H1 | Hero uses `next/image` `priority` + `fill` for `/hero_bg.png` (not CSS `background-image`); solid `--primary` fallback + overlay | P0 **updated** — photo restored; avoid CSS background LCP path |
| H2 | Omit homepage Portfolio + Testimonials **sections** when lists are empty (routes stay) | P0 **done** (homepage skips those fetches entirely until there is real public proof) |
| H3 | `SectionHeading` left-aligned, sentence case; 8pt section rhythm (`py-16` → token) | P1 **done** (`py-section`, `--space-section: 4rem`) |
| H4 | Products: one featured + compact list, not six identical cards | P1 **done** |
| H5 | Stream below-fold via `Suspense` so hero paints without waiting for all five APIs | P2 **done** (hero after settings; lists stream in `HomeBelowFold`) |

## Out of scope

- New color palette, glassmorphism, gradient hero, dark mega-footer
- Invented testimonials / case studies
- Stack change (stays Next.js 16 App Router + Express public API)
- Admin CMS redesign
- Live deploy (ops; rebuild after ship)

## Success (numeric)

| Metric | Now (prod lab 2026-08-29) | Target |
|--------|---------------------------|--------|
| Homepage LCP p75 mobile | 11401 ms | ≤ 2000 ms |
| Lighthouse Performance `/` | 67 | ≥ 85 |
| Lighthouse a11y `/` | 96 | ≥ 90 (hold) |
| CLS | 0 | ≤ 0.1 (hold) |
| API (SSR) p95 | not in this brief | ≤ 600 ms settings+lists |
| Uptime site | existing VPS | 99.5% |

Primary conversion path unchanged: **Konsultasi Gratis → `/contact`**. Secondary: **Lihat Produk → `/products`**.

## RICE (reach = 100 homepage sessions index)

See canvas for scores. Ship order: **omit empty blocks → hero LCP → headings/spacing → featured product → Suspense**.

## Fullstack notes

- Keep RSC `page.tsx` + `Promise.all` for lists that still render.
- Do not fetch `/case-studies` or `/branding/testimonials` if we omit those sections (or fetch and return `null` with no extra round-trip — prefer skip fetch).
- `hero_bg.png` (~1.3 MB PNG) was the CSS-background LCP suspect. Photo is back via `next/image` so Next can serve AVIF/WebP; compress the source file if mobile LCP regresses past 2 s.
- Named owner: Dozer. Cadence: same-day ship on `dntech` `main`, then VPS frontend rebuild.

## References

- Tokens: `frontend/src/app/globals.css`
- Mandat: `docs/DESIGN_SUMMARY.md`
- Baseline: `docs/frontend/LIGHTHOUSE-BASELINE.md`
- Page: `frontend/src/app/(public)/page.tsx`

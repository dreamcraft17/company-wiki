# Design System — Implementation Status

**Status:** ✅ Fully wired into production app (`src/`)  
**Date:** 8 Juli 2026  
**Source pack:** `design/00–06`

---

## Mapped into codebase

| Design file | Production location |
|-------------|---------------------|
| `01-tailwind.config.js` | `tailwind.config.js` + `@theme` in `src/styles/globals.css` / `typography.css` |
| `02-ui-components.tsx` | `src/components/ui/*` (+ barrel `index.ts`) |
| `03-layout-components.tsx` | `src/components/layout/{Sections,HeroSection,PageIntro,Navbar,Footer}.tsx` |
| `04-example-pages.tsx` | Patterns applied on `/`, `/about`, `/team`, `/practice-areas`, `/contact`, `/careers` |
| `05-global-styles.css` | `src/styles/globals.css` (tokens + a11y + motion) |
| Tokens (TS) | `src/lib/design-tokens.ts` |

---

## UI kit available

`Button`, `ButtonLink`, `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Card`, `Alert`, `Badge`, `Divider`, `DesignPracticeAreaCard`, `TeamMemberCard`, `JobPostingCard`, `Container`, `IconMap`

Import: `import { Button, Input, Card } from "@/components/ui"`

---

## Layout kit available

`Navbar`, `Footer`, `HeroSection`, `PageIntro`, `ContentSection`, `TwoColumnSection`, `GridSection`, `Breadcrumb`

Import: `import { GridSection, PageIntro } from "@/components/layout"`

---

## Pages using design system

| Page | Pattern |
|------|---------|
| `/` | Hero + GridSection + TwoColumnSection + Card grid + JobPostingCard |
| `/about` | PageIntro + editorial sections |
| `/practice-areas` | PageIntro + editorial practice cards |
| `/team` | PageIntro + TeamMemberCard + GridSection |
| `/contact` | PageIntro + design form controls (`Input`/`Select`/`Textarea`/`Alert`) |
| `/careers` | Job cards + CareerApplicationForm (design form kit) |

---

## Checklist

- [x] Design tokens (navy/gold/cream mahogany-brass-parchment)
- [x] Fonts Cormorant + Manrope via `next/font`
- [x] UI components exported
- [x] Layout sections exported
- [x] Homepage rebuilt on design sections
- [x] Forms on design controls
- [x] Breadcrumb / PageIntro on key inner pages
- [x] Production build passes

---

*Keep `design/` as the reference pack; mutate `src/` for product behavior.*

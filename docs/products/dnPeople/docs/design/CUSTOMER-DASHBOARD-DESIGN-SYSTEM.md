---
owner: Dozer
status: review-required
canonical: false
last_reviewed: 2026-09-15
review_cadence: annual
---

# Customer dashboard design system

> The dashboard follows the [Operational Editorial UI System](./OPERATIONAL-EDITORIAL-UI-SYSTEM.md). This page records dashboard-specific contracts; the linked system records the visual language shared across the authenticated app.

> **Author:** Dozer
> **Date:** 2026-08-30
> **Surface:** dnPeople customer app after login (`/dashboard`)

## Assumptions (frontend)

| Question | Decision |
|----------|----------|
| Primary device | Desktop / corporate network for HR admin; mobile 4G tolerated for employee mode |
| LCP p75 | **2500ms** on desktop-fiber (auth-walled) |
| INP / CLS | INP &lt; 200ms, CLS &lt; 0.1 |
| Rendering | RSC prefetch + client hydrate (`dashboard/page.tsx` + React Query) |
| Bundle budget | **150 KB gzip** for `/dashboard` route JS |
| SEO | Auth-walled — no SEO investment |
| Design source | CSS tokens in `frontend/src/styles/design-tokens.css` |
| WCAG | **AA**, owner: product engineering |

## Brand and visual language

Primary **#2563eb** (`--color-primary-600`), same as marketing and company branding seed. Generator output for 50/500 was discarded: it washed the brand to `#628deb`. Scale uses the standard blue ramp so white text on 600/700 meets AA.

## Tokens in code

- `frontend/src/styles/design-tokens.css` — colors, spacing, radius, chart series, dark aliases
- `frontend/src/app/globals.css` — imports tokens; `.card` / `.btn-primary` consume them
- Components: `KpiStat`, `DashboardSection`, `DonutChart` / `HorizontalBars`

Do not hardcode `#2563eb` on the dashboard. Use `var(--brand)` or `var(--color-primary-*)`.

The application canvas is intentionally warmer than the marketing surface, with low-radius sections, visible rules, and no default card shadow. KPI blocks and tables should read as operational registers. Pills remain valid for compact statuses and filters, but are not the default treatment for navigation or content sections.

## Component map (dashboard)

| Atom / molecule | File |
|-----------------|------|
| KPI cell + grid | `components/dashboard/KpiStat.tsx` |
| Card section + person row | `components/dashboard/DashboardSection.tsx` |
| Donut / bars | `components/dashboard/charts.tsx` |
| Table | `components/ui/DataTable.tsx` |

## Backend contract

`GET /api/v1/dashboard`

- `mode: admin` if `reports:view`; else `mode: employee`
- Employee payload: clock in/out + status only (no GPS/selfie)
- Birthdays: rank in JS, then fetch details for top 10 (`dashboardBirthday.service.ts`)
- Resignations included in admin payload and rendered on the dashboard

SLO (this route): p95 &lt; 600ms on tenant &lt; 2k employees; uptime follows API SLO; RPO/RTO = platform backup policy.

## QA

Unit tests (no live PG/Xendit):

- `backend/src/__tests__/dashboardView.test.ts`
- `backend/src/__tests__/dashboardBirthdayRanking.test.ts`
- `frontend/src/lib/__tests__/dashboardTransforms.test.ts`
- `frontend/src/lib/__tests__/dashboardView.test.ts`

Playwright: `frontend/e2e/tests/dashboard.spec.ts` (heading + axe) plus authenticated a11y list including `/dashboard`.

## Done checklist

- [x] Tokens + dark aliases for surface/text/neutral
- [x] Dashboard atoms (KPI, section, charts, table)
- [x] Employee DTO without GPS/selfie or full leave rows
- [x] Admin payroll DTO without gross/deduction fields
- [x] Birthday two-tier lookup
- [x] Resignations rendered
- [x] Enum labels (attendance, employee status, payroll)
- [x] AppShell post-login chrome uses tokens
- [x] Unit tests for view helpers
- [x] Playwright dashboard heading + axe

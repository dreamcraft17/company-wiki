---
owner: Product Engineering
status: active
canonical: true
last_reviewed: 2026-09-26
review_cadence: quarterly
---

# dnPeople Operational Editorial UI System

## Decision

dnPeople customer app uses an operational-editorial visual language. The interface should feel like a reliable HR operations workspace: specific, inspectable, and calm under repetitive work. It must not read as a generic SaaS landing page assembled from rounded cards, gradient decoration, or unexplained metrics.

This is a system decision, not a page theme. Shared tokens and primitives carry the direction across dashboard, payroll, attendance, leave, employees, settings, and audit surfaces.

## Visual rules

- Keep the dnPeople blue brand for primary actions and focus states.
- Use a warm paper-like application canvas and a clean card surface.
- Prefer visible borders, dividers, table headers, timestamps, actors, and evidence rows.
- Use small radii for controls and sections. Reserve pills for statuses, filters, and compact metadata.
- Use shadow only when a layer genuinely floats above the workspace. Default cards have no shadow.
- Make active navigation obvious with a left rail and type color, not a large filled pill.
- Make every status explain itself through label, color, and nearby context.
- Use whitespace to separate work areas, not to create empty hero-like spectacle.

## Component contract

| Surface | Required treatment |
| --- | --- |
| App shell | Warm canvas, bordered header/sidebar, no decorative gradients |
| Navigation | Group labels, left active rail, hover feedback, keyboard focus |
| KPI | Register-like grid with dividers; tabular values and a useful note |
| Section | Compact heading, bottom rule, optional semantic left rail |
| Table | Strong header rule, readable column labels, row hover, horizontal scroll |
| Forms | Small-radius controls, explicit labels, visible focus ring, semantic errors |
| Evidence | Actor, reason, time, branch, approval, and source where available |

## Accessibility and engineering constraints

- Preserve WCAG AA contrast and existing keyboard behavior.
- Keep touch targets at least `--touch-min`.
- Do not replace a visible affordance with color alone; clickable rows still need hover/focus feedback.
- Keep dark-mode aliases for every surface, border, semantic background, and evidence token.
- Backend contracts are unchanged. This direction is implemented through shared frontend tokens and components.

## Source of truth

- Tokens: `frontend/src/styles/design-tokens.css`
- Global primitives: `frontend/src/app/globals.css`
- Dashboard sections: `frontend/src/components/dashboard/DashboardSection.tsx`
- KPI grid: `frontend/src/components/dashboard/KpiStat.tsx`
- Sidebar: `frontend/src/components/shell/NavSidebar.tsx`
- Data tables: `frontend/src/components/ui/DataTable.tsx`
- Research and audit: `docs/research/anti-ai-ui-design-2026-09-26/`

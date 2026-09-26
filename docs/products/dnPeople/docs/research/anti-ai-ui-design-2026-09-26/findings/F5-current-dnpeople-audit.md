# F5 — Current dnPeople audit

## What is already working

- Marketing `/welcome` already uses an evidence-slip concept with actor, branch, reason, approver, and timestamp.
- Marketing sections use rules, ledger-like lists, explicit status labels, and limited accent colors.
- The landing implementation avoids a fake dashboard screenshot and generic floating card hero.

## What still reads as default SaaS

- Authenticated app tokens still use `radius-xl: 1rem`, card shadows, and `.card` as the dominant grouping primitive.
- Sidebar navigation uses rounded links and a blue filled active state that is common across generated SaaS dashboards.
- KPI grid and dashboard sections visually separate almost every item into card-like blocks, which weakens the operational record metaphor.
- The token system is still a conventional blue ramp with cool slate surfaces; it does not yet carry a distinctive dnPeople material/typographic voice.
- The system has a mono token but no explicit semantic use rule, so it can become decorative instead of reserved for codes, timestamps, and evidence metadata.

## Recommended first implementation boundary

Do not rewrite every route. Start with shared primitives so the change compounds:

1. Lower default radius and remove generic card shadow from customer-app `.card`.
2. Convert `DashboardSection` from floating card to a bordered section with a stronger heading rail.
3. Convert `KpiGrid` into a compact record strip with visible separators and no outer rounded container.
4. Make sidebar active state a left rule + text emphasis, not a filled pill.
5. Reserve accent color for active, success, warning, and error semantics.
6. Add a minimal “workflow evidence” object to one dashboard section before propagating the pattern.

## Why this boundary

It changes the visual grammar at the shared component level while leaving payroll, attendance, auth, and API behavior untouched. It also makes a screenshot-based A/B comparison possible and limits migration risk.


# Research plan — dnFinance vs Accurate Online

Generated: 2026-10-24 (Asia/Jakarta)

## Decision

Determine where dnFinance can win against Accurate Online for Indonesian SMEs, which gaps are production-critical, and which features should not be copied blindly.

## Hypotheses

1. Accurate has a wider operational/accounting surface, especially fixed assets, bank connectivity, manufacturing, and reporting depth.
2. dnFinance already has credible accounting primitives for an MVP: double-entry GL, AR/AP, tax helpers, inventory, approvals, reports, and multi-tenant RBAC.
3. dnFinance's best wedge is a simpler, API-first, approval/reporting workflow for small teams rather than feature-for-feature ERP parity.
4. Production trust—normalized persistence, real integrations, observability, and mobile workflows—matters before adding long-tail modules.

## Evidence strategy

- Primary product evidence: dnFinance repository docs and implementation files.
- Primary competitor evidence: Accurate official pricing, feature, and help pages.
- Independent market signal: Indonesian software-selection articles, used only for positioning signals and treated as lower-confidence than first-party evidence.
- Claims about current Accurate features/pricing are date-stamped; pricing and packaging must be refreshed before launch decisions.

## Scope and limits

This is a product/roadmap comparison, not a TAM estimate. No market-size number is quoted because the current evidence pack does not contain a defensible top-down and bottom-up model. Segment recommendations are hypotheses to validate with interviews/usability tests.

## Product-research follow-up

Run evaluative usability research with three target segments: owner/operator, accountant, and manager/approver. Use 6 participants per segment for moderate problem-discovery coverage; do not report prevalence from this sample. Validate the proposed wedge with a separate live experiment.

## Stop criteria

Stop adding comparison sources when each roadmap thesis has direct repository evidence plus at least two independent external signals, and further sources only repeat the same claim.

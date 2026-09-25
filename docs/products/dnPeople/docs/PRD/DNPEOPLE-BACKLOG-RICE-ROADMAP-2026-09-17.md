---
owner: Dozer
status: draft-for-review
last_reviewed: 2026-09-17
source: RICE prioritization run on docs/IMPLEMENTATION-STATUS.md "Not started" items + marketing PRD roadmap/non-goal gaps
---

# dnPeople — Backlog RICE Roadmap

> **Author:** Dozer
> **Date:** 2026-09-17

## 1. Scope

11 backlog items pulled from real, tracked gaps — not hypothetical features:

- `docs/IMPLEMENTATION-STATUS.md` "Not started" rows (9-box/succession, career marketplace, EWA, salary benchmarking, industry package)
- `docs/PRD/dnpeople-prd-v17.0-hr-chatbot-rag-id.md` (drafted, not built)
- Gaps the marketing site now explicitly discloses as "Belum"/Roadmap (native app, payroll auto-transfer, e-filing)
- Marketing rollout §8 Phase 3 continuation (remaining use-case SEO pages)
- A Conditional→Available upgrade candidate (SSO productionization)

RICE inputs (reach, impact, confidence, effort) are PM estimates, not measured data — see §3 before committing capacity against them.

## 2. RICE Results (capacity: 15 person-months/quarter)

| # | Feature | RICE | Reach | Impact | Confidence | Effort |
|---|---|---|---|---|---|---|
| 1 | Industry-specific package (retail/F&B multi-outlet) | 32.0 | 80 | high | high | m |
| 2 | Additional use-case SEO vertical pages | 25.0 | 50 | low | high | xs |
| 3 | Payroll auto-transfer to bank rails | 18.0 | 90 | high | medium | l |
| 4 | 9-box matrix & succession planning | 16.0 | 50 | high | medium | m |
| 5 | Native Android/iOS app | 15.4 | 100 | high | high | xl |
| 6 | E-filing DJP/BPJS integration | 14.0 | 70 | high | medium | l |
| 7 | SSO productionization (Google/Microsoft/SAML) | 8.3 | 25 | medium | high | s |
| 8 | HR Chatbot / RAG assistant | 6.0 | 60 | medium | medium | l |
| 9 | Career marketplace & internal rotation | 3.0 | 30 | medium | medium | l |
| 10 | Salary benchmarking | 2.2 | 35 | medium | low | l |
| 11 | Earned Wage Access (EWA) | 1.5 | 40 | medium | low | xl |

## 3. Validation (per skill's Step 5 checklist)

**Strategic alignment.** #1, #3, #4 map directly onto the three marketing pillars (Branch Operations / Payroll Confidence / People Evidence) already live on the site — building them closes the gap between what marketing promises and what product ships. #2 is pure follow-through on a plan already committed in the marketing PRD. #5–11 are adjacent bets, not core-pillar work — treat them as intentionally lower priority, not oversights.

**Sensitivity (±2x on effort and reach).**
- #1 (Industry package) stays top-3 even at 2x effort (RICE → 16.0) — low risk to commit.
- #3 (Payroll auto-transfer) drops to ~9.0 at 2x effort — still respectable, but this is the item most likely to be underscoped (bank integration, reconciliation, compliance review). Get an engineering estimate before committing a quarter to it.
- #5 (Native app) is the most fragile: at 2x effort (26 person-months) it falls to RICE 7.7, below the chatbot and SSO items. Don't greenlight this on today's estimate alone — get a real estimate first.
- #8 (HR Chatbot) is sensitive to reach: if AI adoption is lower than expected (30 instead of 60), RICE drops to 3.0 — bottom of the list. Low-confidence bet.

**Dependencies not captured by RICE:**
- #3 and #6 (payroll transfer, e-filing) likely share a vendor/compliance integration layer — sequencing #6 right after #3 may be cheaper than doing them independently across two quarters.
- #11 (EWA) is blocked on a bank partner that doesn't exist yet — this isn't a capacity problem, it's a BD/partnerships blocker. Move it out of the roadmap until that partner exists; don't let it consume a capacity slot for planning purposes.
- #4 (9-box/succession) depends on customers having enough performance-review data — check with the 2–3 most mature pilot accounts before committing engineering time.

**Portfolio balance.** Zero genuine "quick wins" (high RICE + XS/S effort) except #2 and #7. Recommendation: slice #3 (payroll transfer) into a smaller v1 (single bank/payment rail, manual reconciliation fallback) so it isn't a single 8-person-month all-or-nothing bet.

## 4. Recommended Q1 commitment (14/15 person-months)

1. Industry-specific package (retail/F&B multi-outlet) — **m**
2. Additional use-case SEO vertical pages — **xs**
3. SSO productionization — **s** (pulled forward from Q4: it's cheap, high-confidence, and unblocks Business/Enterprise deals stuck on the Conditional label)

Payroll auto-transfer (#3 in RICE order) is deliberately **not** committed yet — get an engineering estimate and a scoped v1 first (see §3), then slot it into Q2 once effort is validated.

## 5. Epics for the Q1 commitment

---

### Epic: Industry-Specific Package — Retail/F&B Multi-Outlet

**Epic ID**: EPIC-001
**Theme**: Branch Operations Control
**Quarter**: Q1 2027
**Status**: Discovery

#### Problem Statement
Retail and F&B multi-outlet companies — dnPeople's top priority vertical — currently configure shifts, approval chains, and attendance rules from scratch. Generic setup makes onboarding slower and makes the "Configure once, run everywhere" promise harder to prove in a 30-minute workflow audit.

#### Goals & Objectives
1. Cut time-to-first-payroll-run for retail/F&B pilots from current baseline to under 2 hours of guided setup.
2. Give sales a concrete, vertical-specific demo script instead of a generic walkthrough.
3. Increase workflow-audit → pilot conversion for retail/F&B leads.

#### Success Metrics
- Setup-to-go-live time for new retail/F&B tenants: target < 1 business day
- % of retail/F&B workflow-audit leads that convert to pilot: track baseline, target +20%
- Support tickets tagged "shift/approval misconfiguration" for this vertical: target -30%

#### User Stories
| Story ID | Title | Priority | Points | Status |
|----------|-------|----------|--------|--------|
| US-001 | As an HR admin at a retail chain, I can start from a pre-built shift/approval template instead of configuring from zero | P0 | 5 | To Do |
| US-002 | As an HR admin at an F&B multi-outlet, I can apply the same template across outlets and override per-location exceptions | P0 | 5 | To Do |
| US-003 | As sales, I can demo the retail/F&B template live during a workflow audit | P1 | 3 | To Do |

#### Dependencies
- Product design: template data model for shift/approval presets
- At least 2 pilot customers in retail/F&B to validate the template against real structures

#### Acceptance Criteria
- [ ] All P0 stories complete
- [ ] Template validated against ≥2 real pilot org structures
- [ ] Sales demo script updated in `/branch-operations` and `/demo` guided flow
- [ ] Documentation updated

---

### Epic: Additional Use-Case SEO Vertical Pages

**Epic ID**: EPIC-002
**Theme**: Marketing rollout Phase 3 continuation
**Quarter**: Q1 2027
**Status**: Discovery

#### Problem Statement
The marketing PRD's Phase 3 explicitly limited launch to the first two validated use-case pages (`/branch-operations`, `/payroll-confidence`) plus `/people-evidence`. The remaining priority verticals (klinik/pendidikan, distributor, jasa profesional) have no dedicated landing page, so organic search intent for those segments has nowhere to land.

#### Goals & Objectives
1. Publish vertical-specific landing content only after conversion evidence exists for the first three pages (per spec §8 Phase 3 — do not front-run this).
2. Avoid doorway pages: each new page needs real vertical-specific content, not a city/name swap.

#### Success Metrics
- Organic sessions to new vertical pages: baseline then track MoM growth
- Workflow-audit start rate per vertical page: target parity with existing pillar pages

#### User Stories
| Story ID | Title | Priority | Points | Status |
|----------|-------|----------|--------|--------|
| US-001 | As a prospect from klinik/pendidikan, I land on a page addressing my specific workflow, not a generic reskin | P1 | 2 | To Do |
| US-002 | As a prospect from distributor/jasa profesional segment, same as above | P2 | 2 | To Do |

#### Dependencies
- Gate: conversion evidence from `/branch-operations`, `/payroll-confidence`, `/people-evidence` (per marketing PRD §8 Phase 3) before publishing more pages

#### Acceptance Criteria
- [ ] Conversion evidence reviewed and documented before kickoff
- [ ] Each page has real vertical-specific proof content, not templated city-swap copy
- [ ] Added to `sitemap.ts` and internal-linked from `/pricing` and `/demo`

---

### Epic: SSO Productionization (Google/Microsoft/SAML)

**Epic ID**: EPIC-003
**Theme**: Enterprise readiness
**Quarter**: Q1 2027
**Status**: Discovery

#### Problem Statement
SSO is currently labeled "Conditional" on the pricing and marketing pages — it depends on the customer's identity provider and a UAT process. This uncertainty is a known blocker for Business/Enterprise deals where SSO is a hard requirement, not a nice-to-have.

#### Goals & Objectives
1. Turn SSO from "Conditional" to a documented, repeatable "Available" flow for the top identity providers.
2. Give sales a defined UAT timeline to quote in enterprise conversations instead of "it depends."

#### Success Metrics
- SSO UAT completion time: target a defined, published SLA (e.g., ≤ 5 business days)
- Enterprise deals blocked on SSO uncertainty: target 0 in the pipeline after launch

#### User Stories
| Story ID | Title | Priority | Points | Status |
|----------|-------|----------|--------|--------|
| US-001 | As an Enterprise prospect, I can see a documented SSO setup flow for Google Workspace/Microsoft/SAML with a clear timeline | P0 | 3 | To Do |
| US-002 | As sales, I can quote a concrete SSO UAT SLA during a workflow audit instead of "Conditional" | P1 | 1 | To Do |

#### Dependencies
- Security/engineering: confirm current SSO implementation status per provider
- Update `PRODUCT_PROOF` label in `frontend/src/lib/marketing/content.ts` from Conditional to Available once shipped

#### Acceptance Criteria
- [ ] All P0 stories complete
- [ ] SSO setup guide published (internal + customer-facing)
- [ ] Marketing site label updated to reflect true status (do not relabel before the flow is actually repeatable)
- [ ] Security review passed

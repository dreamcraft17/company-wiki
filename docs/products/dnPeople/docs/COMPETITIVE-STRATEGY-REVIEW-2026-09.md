---
owner: Dozer
status: active
canonical: true
last_reviewed: 2026-09-15
review_cadence: quarterly
---

# dnPeople Competitive Strategy Review

> **Author:** Dozer  
> **Date:** 15 September 2026  
> **Scope:** dnPeople HRIS SaaS versus Mekari Talenta and Gadjian  
> **Confidence:** Medium for public product claims; low for buyer-perception and win/loss claims

## Executive decision

dnPeople should not compete as a smaller checklist clone of Mekari Talenta. The strongest near-term position is:

> **The transparent, self-serve Indonesian HRIS for growing teams that want core HR, payroll, attendance, talent, and tenant controls without an opaque sales-led buying process.**

This position is credible in the repository because dnPeople already has a public FREE tier, explicit headcount limits, tier-gated navigation, Indonesian payroll features, **DOKU production billing**, HR workflows, talent matrix, an admin console, API/SCIM, and a public demo. It is not yet credible enough for enterprise displacement because public proof, mobile parity, integrations, security assurance, and production/UAT evidence remain weaker than the leading incumbent's claims.

**Verdict:** 🟡 **SHARPEN** the market wedge before broadening the roadmap.

## Founder-mode routing

This review routes to a **boardroom discussion** rather than a single C-role:

| Role | Why it is involved | Decision needed |
|---|---|---|
| CEO | Category position, trust, and distribution | Choose the beachhead segment and proof strategy |
| CPO | Feature breadth versus focus | Cut roadmap items that do not strengthen the wedge |
| CRO | Competitive objections and sales motion | Create discovery questions and battlecards |
| CTO | Security, reliability, integrations, and deployment | Turn conditional capabilities into verifiable proof |
| CMO | Message clarity and demand capture | Replace generic “all-in-one HRIS” claims |

## 1. Product baseline: what dnPeople can actually defend

Evidence from the current repository:

| Area | Current evidence | Strategic meaning |
|---|---|---|
| Target | Indonesian startups, SMEs, and mid-market companies | A focused wedge exists; do not lead with enterprise first |
| Product breadth | Core HR, attendance, leave, payroll, recruitment, onboarding, performance, talent, LMS, admin, API/SCIM | Broad enough for a lifecycle story, but breadth alone is not differentiation |
| Pricing | FREE up to 30 employees; STARTER 50; PROFESSIONAL 300; BUSINESS/ENTERPRISE above that | More transparent than sales-only competitors; validate willingness to pay |
| Self-serve motion | Public `/welcome`, `/pricing`, `/demo`, docs hub, public sandbox | Strong acquisition and evaluation advantage if activation is measured |
| Compliance/localization | BPJS/PPh 21, Indonesian legal pages, Xendit and legacy Midtrans paths | Relevant local fit; must prove calculation and regulatory freshness |
| Platform | Next.js 16 + React 19 frontend; Express 5 + Prisma 6 backend; PostgreSQL/Supabase; VPS + PM2 + Nginx | Fast iteration and low infrastructure cost; less enterprise assurance than a mature vendor |
| Engineering evidence | 165/165 automated tests, 99 frontend pages, 61 API route modules, 131 Prisma models, a11y coverage | Useful proof points, but not substitutes for customer outcomes or uptime history |
| Conditional items | Live payment E2E, biometric provider, SSO/SCIM production acceptance, monitoring, pen-test, UAT | Do not sell these as fully production-proven until gates are signed |

Source of truth: [README](../README.md), [Feature Catalog](./FEATURE-CATALOG.md), [Current Implementation](./CURRENT-IMPLEMENTATION.md), and [Release Readiness](./RELEASE-READY.md).

## 2. Market and competitor snapshot

### Mekari Talenta — direct incumbent threat

Mekari positions Talenta as an end-to-end HRIS/HCM product covering employee administration, attendance, payroll, recruitment, performance, development, AI, analytics, and integrations. Its current public positioning claims **35,000+ businesses**, ISO 27001, enterprise security controls, implementation/training support, and deployment options including cloud, private cloud, and on-premise. The public pricing page uses Essential, Plus, and Talenta 360 packages and offers a 14-day trial, but does not publish a simple price card.

Sources: [Mekari Talenta product page](https://mekari.com/produk/talenta/), [Talenta pricing](https://www.talenta.co/harga/), [Talenta integrations](https://www.talenta.co/integrasi/), [Mekari developer webhooks](https://developers.mekari.com/docs/kb/webhooks/talenta).

**Why they win:** trust, installed base, enterprise assurance, implementation help, mobile/attendance ecosystem, payroll/regulatory narrative, and integration breadth.

**Where dnPeople can win:** transparent self-serve entry, clearer small-team pricing, faster feedback loops, a public product surface, and a simpler “start free, grow into HRIS” path.

### Gadjian — price-sensitive direct competitor

Gadjian publicly lists Standard at **Rp12,500 per employee/month**, Sukses at **Rp20,000 per employee/month**, and a separate Apresiasi Kinerja package at **Rp6,000 per employee/month**. Its feature comparison includes payroll, PPh 21/26, BPJS, attendance, leave, recruitment, performance, analytics, mobile self-service, asset management, and Open API. It offers a 14-day demo/trial path and is explicitly positioned for UMKM through larger companies.

Source: [Gadjian pricing and feature comparison](https://www.gadjian.com/pricing/index).

**Why they win:** clear price anchors, local payroll familiarity, a focused small-business proposition, and a mobile employee app.

**Where dnPeople can win:** broader strategic HR and enterprise control depth in the codebase, a genuinely free product entry point, public demo/docs, and a more explicit tier-gating experience.

### Substitutes

The immediate substitute is not only another HRIS. It is Excel/Google Sheets plus WhatsApp, payroll bureaus, attendance devices, and an accounting system. dnPeople's first competitive job is therefore to remove manual coordination and audit risk quickly—not to match every incumbent feature.

## 3. Twelve-dimension scorecard

Scores are directional, 1–5, based on public claims and repository evidence. They are not buyer-validated win-rate data. Competitor review-count and job-posting validation was not completed, so those dimensions remain low-confidence.

| Dimension | dnPeople | Mekari Talenta | Gadjian | Evidence / interpretation |
|---|---:|---:|---:|---|
| Features | 4 | 5 | 4 | dnPeople is broad; Talenta and Gadjian have mature published coverage |
| Pricing clarity | 5 | 2 | 5 | dnPeople and Gadjian publish clearer anchors; Talenta is sales-led/custom |
| UX / time-to-value | 4 | 4 | 4 | dnPeople has self-serve/demo surfaces; no comparative usability study yet |
| Performance | 3 | 4 | 3 | dnPeople has load tooling, but no public production history |
| Documentation | 4 | 5 | 4 | dnPeople has extensive engineering/product docs; incumbent help ecosystems are mature |
| Support | 2 | 5 | 3 | dnPeople support process is not yet proven with SLA/customer evidence |
| Integrations | 3 | 5 | 4 | dnPeople has API/SCIM/webhooks; Talenta/Gadjian publish broader integration ecosystems |
| Security | 3 | 5 | 3 | dnPeople has RBAC/MFA/audit/secrets controls; no equivalent public certification proof |
| Scalability | 3 | 5 | 4 | Multi-tenant design exists; production scale and isolation evidence are conditional |
| Brand / trust | 2 | 5 | 4 | Incumbent customer and ecosystem proof is materially stronger |
| Community | 2 | 4 | 3 | dnPeople has no demonstrated public HR community yet |
| Innovation velocity | 4 | 4 | 3 | dnPeople ships quickly; velocity must become customer-visible outcomes |
| **Total / 60** | **39** | **51** | **42** | Directional score, not a market-share estimate |

## 4. Positioning map

**Axes:** public price transparency (low → high) × HR lifecycle depth (low → high).

| Product | Transparency (1–10) | Lifecycle depth (1–10) | Position |
|---|---:|---:|---|
| dnPeople | 9 | 8 | High-transparency, broad challenger |
| Mekari Talenta | 3 | 10 | High-depth, sales-led incumbent |
| Gadjian | 8 | 7 | Transparent, payroll/HR operations specialist |
| Spreadsheet + bureau | 10 | 2 | Transparent but fragmented substitute |

**White space:** a credible, low-friction path for Indonesian companies with roughly 10–300 employees that want more than payroll/attendance but are not ready for a sales-heavy HCM implementation.

**Risk:** this white space disappears if dnPeople's free tier does not activate users, if paid conversion is weak, or if the product cannot prove payroll correctness and support responsiveness.

## 5. Feature gap and moat analysis

| Capability | dnPeople position | Competitive implication | Priority |
|---|---|---|---|
| Transparent self-serve pricing | Strong | Clear counter to Talenta's custom-sales experience | Defend |
| FREE tier and honest feature gating | Strong in code | Strong acquisition wedge if activation is real | Measure |
| Indonesian payroll | Implemented; external acceptance still required | Table stakes; errors destroy trust | Prove |
| Attendance / biometric | Broad adapters; provider acceptance conditional | Talenta has stronger face/attendance ecosystem claims | Validate one provider and publish result |
| Employee mobile experience | Responsive web, no native app evidence | Gadjian/Talenta can win employee adoption conversations | Decide deliberately: PWA/mobile web versus native |
| Integrations | API, webhooks, SCIM, Xendit | Incumbents have deeper named ecosystem integrations | Ship 2 high-value connectors, not 20 shallow ones |
| Talent / succession / LMS | Broad and distinctive for a small-team wedge | Potential differentiator versus payroll-first tools | Package into a clear outcome |
| Security and trust | Strong controls in code, limited external proof | Major enterprise objection | Produce trust center, pen-test summary, uptime evidence |
| Customer proof | Public demo, no quantified customer case studies in baseline | Biggest sales/brand gap | Collect 5 referenceable design partners |

## 6. Battlecards

### Against Mekari Talenta

**30-second summary:** Talenta is the safer incumbent choice for organizations that prioritize brand, implementation support, ecosystem breadth, and enterprise assurance. Do not claim it is weak. Position dnPeople for teams that want to evaluate and launch a broad HRIS transparently, without starting with a custom sales process.

**Say:** “Talenta is a serious fit for complex enterprise rollouts. If your team wants a transparent starting point, a public demo, and a clear path from free core HR into payroll and talent, we can let you validate the workflow before committing to a large implementation.”

**Trap-setting questions:**

1. “Do you need a large implementation program now, or do you need your HR team productive this month?”
2. “Which integrations are mandatory on day one, and which are only nice to have?”
3. “How will you compare total cost, implementation time, and the cost of changing policy later?”

**When we win:** 10–300 employee teams, founder-led or lean HR teams, transparent evaluation, fast pilot, broad HR lifecycle without enterprise procurement.

**When we lose:** large enterprises requiring certification evidence, private/on-premise deployment, mature device ecosystem, named references, or formal implementation/support SLAs.

**Do not say:** “Talenta has fewer features,” “Talenta is insecure,” or “we are enterprise-ready” without evidence.

### Against Gadjian

**30-second summary:** Gadjian is a credible, price-transparent local alternative with strong payroll, attendance, employee self-service, and HR operations coverage. It is a direct comparison for price-sensitive Indonesian SMB buyers.

**Say:** “Gadjian is a sensible choice when payroll and attendance are the main job. dnPeople is designed for the next layer too: a free entry point, tiered lifecycle management, talent and succession workflows, admin controls, and a public product you can evaluate before buying.”

**Trap-setting questions:**

1. “After payroll is automated, where will performance, succession, training, and onboarding live?”
2. “Do you need a payroll tool, or a system of record for the employee lifecycle?”
3. “Which employee and manager workflows should be self-service from the first pilot?”

**When we win:** teams outgrowing payroll-only workflows, buyers wanting a free pilot, HR leaders wanting talent development and admin controls in one product.

**When we lose:** buyers primarily optimizing for known payroll workflows, a native mobile app, or the competitor's established local support ecosystem.

## 7. CPO review of the next roadmap

The current roadmap should be judged against one job: **“Help a growing Indonesian company replace fragmented HR administration with a trusted system of record within 14 days.”**

### Six forcing questions

1. **JTBD:** Can a new HR/admin user import employees, configure policy, run attendance/leave, and preview payroll without founder intervention?
2. **North Star:** Track **weekly active companies completing one core HR workflow** (employee update, attendance approval, leave approval, or payroll preview). Do not use page views as the North Star.
3. **PMF signal:** Measure 30/60/90-day company retention, weekly workflow completion, payroll-cycle completion, and employee activation. Current repository evidence does not include a retention curve, so PMF is unproven.
4. **RICE:** Prioritize proof and activation work before adding more modules. An exact numeric RICE score requires reach, impact, confidence, and effort inputs from product/sales data that are not in the repo.
5. **Opportunity cost:** Cut or defer low-frequency enterprise breadth, additional shallow integrations, and cosmetic admin features until the 14-day activation path and payroll trust are measured.
6. **Kill criteria:** If, after 90 days and at least 10 qualified pilot companies, fewer than 40% complete a second weekly core workflow and fewer than 25% remain active after 8 weeks, pause expansion and investigate activation, pricing, or product reliability.

### Recommended 90-day focus

| Horizon | Initiative | Why now | Success gate |
|---|---|---|---|
| 0–4 weeks | Instrument activation funnel from signup → employee import → first approval → payroll preview | Competitive advantage is meaningless without usage evidence | Company-level funnel dashboard exists |
| 0–4 weeks | Publish a trust center: architecture, data handling, backup, security controls, known conditional gates | Directly attacks incumbent trust gap | 10 buyer objections answered with evidence |
| 1–3 months | Create a guided 14-day implementation path for 10–300 employee teams | Converts self-serve transparency into time-to-value | 5 design partners complete core workflow |
| 1–3 months | Validate payroll and one attendance provider in staging + customer pilot | Table stakes must become proof | Signed acceptance record and reproducible test |
| 1–3 months | Build only the top two integrations from customer interviews | Prevents ecosystem checklist chasing | Two integrations used weekly by pilot customers |
| 3–12 months | Choose mobile strategy: excellent PWA/mobile web or native app | Employee adoption is a known incumbent advantage | Decision based on employee activation data |

## 8. Intelligence operating system

Create one competitive record per competitor and update it monthly:

| Signal | Owner | Cadence | Action |
|---|---|---|---|
| Pricing page | Product/CEO | Monthly | Update pricing objection and landing-page comparison |
| Feature/release moves | Product/Engineering | Bi-weekly | Check whether customers actually ask for the change |
| Win/loss interviews | Product/CS, not AE | Every deal within 30 days | Tag reason: price, trust, feature, support, implementation |
| Customer proof | CEO/CRO | Monthly | Add quantified case study or mark proof gap |
| Security/trust claims | CTO | Quarterly | Verify claims, certifications, and incident posture |
| Roadmap response | CPO | Quarterly | Change roadmap only when customer evidence supports it |

## 9. Open evidence gaps

These gaps prevent a high-confidence competitive claim:

- No structured dnPeople win/loss dataset by competitor.
- No retention curve or cohort sample proving product-market fit.
- No 20-review-per-competitor review sample in this sprint.
- No validated public job-posting counts for competitor roadmap inference.
- No public dnPeople customer count, revenue, uptime history, support SLA, or case studies.
- No completed external security certification or pen-test evidence in the repository baseline.

Do not fill these gaps with assumptions. Run five buyer interviews, five lost-deal interviews, and a 10-company pilot before revising the scorecard.

## 10. Immediate decisions

1. Select **10–300 employee Indonesian companies with lean HR teams** as the primary beachhead.
2. Make **transparent self-serve + 14-day time-to-value** the central message, not “we have every HR feature.”
3. Treat **payroll correctness, support, security proof, and employee activation** as the next moat-building work.
4. Defer roadmap additions that do not improve the North Star or remove a verified competitive loss reason.
5. Re-run this review quarterly and update battlecards monthly or within one week of a material competitor move.

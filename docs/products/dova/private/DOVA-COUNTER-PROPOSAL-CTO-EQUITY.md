# DOVA — Revised Technical Partnership Framework

## Response to Backend Developer Equity Proposal

> **CONFIDENTIAL · FOR DISCUSSION**  
> **Date:** 26 August 2026  
> **Prepared by:** Dozer · **To:** Egegieh Onyekachi Daniel, Founder & CEO, DOVA

---

## 01 — Purpose

Thank you for putting the Backend Developer equity proposal in writing — that helps.

I want to stay with DOVA through go-live, soft launch, and the next phase after funding. This document is my **counter for discussion only**. Nothing here is binding. The goal is to align on role, equity, and scope before legal paperwork.

**Core ask:** Your proposal frames the role as **Backend Developer**. I am proposing **CTO & Founding Engineer** — not as a title upgrade for its own sake, but because the work on the ground is already **lead-tech / CTO scope**: architecture, full-stack backend ownership, launch, infra, and coordination with FE/QA. The title should match what DOVA actually needs through soft launch.

I am also **ready to keep supporting infrastructure the same way as now** until **meaningful investor funding** lands — hosting, ops, SSL, and the live site on **`dova.dntech.id`**. I am not covering a custom domain (details in §02.2 and §07).

---

## 02 — Where we align, where to adjust

| Topic | Your proposal | Suggested adjustment |
|-------|---------------|----------------------|
| **Role** | Backend Developer | **CTO & Founding Engineer** |
| **Equity** | 3% | **~7%** fully diluted (discussion range **6.5–7.5%**) |
| **Vesting** | 4 years / 1-year cliff | 4 years / **6-month cliff**, then monthly |
| **Scope** | Backend development | Full technical ownership through soft launch |
| **Cash** | Not specified pre-funding | Same — equity + in-kind infra for now; salary after funding |
| **Infra** | Not in proposal | **Same as now until meaningful investor funding**; public URL = **`dova.dntech.id`** |
| **IP until signed agreement** | Use / DOVA branding implies company ownership | **No assignment yet** — DOVA may use the stack; transfer only as the final agreement provides |

### 2.0 — Backend Developer title vs actual scope

The **3% Backend Developer** frame fits someone who joins from zero, builds to someone else’s spec, and hands off deploy and infra. What DOVA has needed — and what I have been doing — is broader:

| Area | Typical Backend Developer | What DOVA needed (and I delivered) | CTO / Lead Tech |
|------|---------------------------|-------------------------------------|-----------------|
| Code & API | Feature tickets to spec | Own architecture, NestJS monorepo, business rules | ✅ |
| Database | Assigned migrations | Own schema, migrations, data model | ✅ |
| Payments | Wire SDK | Paystack end-to-end — init, verify, webhook | ✅ |
| Infra & deploy | Often separate team | VPS, SSL, live at `dova.dntech.id` | ✅ |
| Go-live | Handover | Paystack live, prod checklist, soft launch | ✅ |
| Team | Tickets only | Coordinate FE + QA, release criteria, docs | ✅ |
| After funding | IC contributor | Help hire and grow engineering | ✅ |

**That is why I propose CTO & Founding Engineer, not Backend Developer.** The scope was never ticket-only backend work — it is founding technical leadership through launch. Appendix A lists what is done; what remains is launch, stability, and supplier pilot support.

### 2.1 — Why ~7% and not 3%

Your **3%** offer fits a backend developer joining from zero and building to spec. This counter is higher because three things stack — not because of salary pre-funding:

| Factor | What it means |
|--------|----------------|
| **1. MVP already delivered** | Backend, API, Paystack, DB, live site, tests, and runbooks are largely done (Appendix A). That is founding-level delivery, not a greenfield hire. |
| **2. Ongoing technical ownership** | Through go-live and soft launch: Paystack live, prod hardening, FE/QA coordination, supplier pilot support — CTO/founding-engineer scope, not ticket-only backend work. |
| **3. In-kind infra until meaningful funding** | I keep carrying hosting and ops **the same as today** until a **meaningful investor round** lands, so DOVA can launch and run lean. Public URL stays on **`dova.dntech.id`**. That reduces cash burn while funding is still open (details in §07). |

**~7%** (range **6.5–7.5%**) sits between a hired backend role and a co-founder split — it matches the role, the work already in repo, and the infra commitment. We can land on an exact % once we review the fully diluted cap table together.

### 2.2 — Infra support until meaningful investor funding (ready now)

Beyond code, I am **ready to keep supporting DOVA infrastructure the same way as now** — until **meaningful investor funding** comes in. I host and maintain; DOVA focuses burn on Paystack, suppliers, and ops.

**Public URL stays the current subdomain: `dova.dntech.id`.** That is the domain support I am offering. I am not buying or covering a custom domain.

| Item | Until meaningful investor funding | Notes |
|------|-----------------------------------|-------|
| VPS / live host | **Yes** — I carry cost, same as now | e.g. Biznet Gio VPS (~Rp109k/mo reference) |
| Public URL **`dova.dntech.id`** | **Yes** — on my DNS/infra | Already live; FREE to DOVA; this is the live domain |
| SSL, DB (Supabase free tier), monitoring | **Yes** — configured | Keeps burn on Paystack, suppliers, ops |
| Custom / primary domain (e.g. `dovachain.com`) | **No — not covered** | If DOVA wants its own domain later, DOVA registers, pays, and owns it |

**Important:** This is **practical launch-and-run support**, not a substitute for equity. DOVA may use the current stack to operate the product. That use does **not** by itself transfer ownership. After a **meaningful investor round** *and* a signed agreement, we move to company-owned accounts with a documented handover (§07). Until then, the live site remains **`dova.dntech.id`**.

**Until a final written agreement is signed, no ownership or IP assignment of the existing technical assets has occurred.** DOVA may use the running infrastructure, code, repository, configurations, deployment environments, and related technical assets to operate the product. Those assets remain under my ownership and control during this period, even where they are branded, deployed, or used for DOVA. Use of the DOVA name or branding does not by itself transfer ownership of the underlying technical assets. Any assignment or transfer of IP will occur only as expressly provided in the final written agreement (§06).

---

## 03 — Role & responsibilities

**Proposed title:** **Chief Technology Officer (CTO) & Founding Engineer**  
*(upgrade from Backend Developer — reflects lead-tech scope above, not a separate hire.)*

| Area | Responsibility |
|------|----------------|
| Technical direction | Roadmap, architecture, build priorities |
| Backend & API | NestJS, PostgreSQL, Paystack, business rules |
| Go-live | Paystack live, webhooks, prod checklist, soft launch |
| Infra (until meaningful funding) | Live env, uptime, backups, live site on **`dova.dntech.id`** (see §07) |
| Team | Work with FE + QA; release checklist |
| Security | Auth, access control, secrets |
| After funding | Help hire and grow engineering |

**Decision-making:** You keep product, business, and company direction. I own technical execution and engineering priorities, with major architecture changes agreed together.

**Out of scope for now** (can revisit later): native mobile apps, full-time BD/sales, large new product lines beyond agreed roadmap.

---

## 04 — Equity

**Opening term: ~7% fully diluted**

| Component | Amount | Notes |
|-----------|--------|-------|
| **Past work (MVP)** | **~1.5%** | Credited at signing — work in Appendix A |
| **Forward vesting** | **~5.5%** | 4-year schedule, **6-month cliff**, then monthly |
| **Total** | **~7%** | Exact % (within 6.5–7.5%) in final legal agreement |

**How to read this:** The ~1.5% at signing is part of the total — not stacked on top. It recognizes MVP already delivered. The ~5.5% vests for continued work through launch and beyond.

**Standard terms** in the final agreement: IP assignment, confidentiality, good/bad leaver, acceleration on change of control if you want them.

If scope grows a lot beyond what we agree here, we can revisit — by mutual agreement, not unilaterally.

---

## 05 — Cash compensation

Pre-funding: **no cash salary** — same spirit as your proposal. Contribution is through equity, delivery, and infra support (same as now) until meaningful investor funding.

Post-funding: agree CTO/lead compensation based on raise size, runway, and role — **on a call**, once funding is real.

---

## 06 — Intellectual property

**Until a final written agreement is signed, no IP assignment has occurred.** DOVA may use the current technical stack for this collaboration. Use, branding, or deployment for DOVA does not by itself transfer ownership.

| Item | Before signed agreement | After signed agreement |
|------|-------------------------|------------------------|
| **Running infra** (VPS, SSL, DNS, live env, `dova.dntech.id`) | Under my ownership and control; DOVA may use it to operate the product | Handover to DOVA accounts per §07, as the agreement provides |
| **Code, repo, APIs, DB schema, configs, docs, tests** | Under my ownership and control; DOVA may use them to operate the product | Assigned to DOVA (Schedule A) as the signed agreement provides |
| **DOVA name / brand on the live site** | Brand remains DOVA’s; display on the live site does not transfer the stack | Brand stays DOVA’s; stack assigns as above |
| Generic personal tools | Remain mine | Remain mine; license to DOVA if used in the product |

DOVA’s proposal says work “will be assigned to DOVA under the final written agreement.” I agree **on that timing**: assignment happens **as the signed agreement provides**, not because the live site already says DOVA. Until then, existing technical assets remain under my ownership and control, while DOVA continues to use them for the product.

---

## 07 — Infrastructure (until meaningful investor funding)

I will keep **hosting and ops the same as today** until DOVA closes **meaningful investor funding**. The live site stays on **`dova.dntech.id`**. That is the domain I am supporting — not a custom domain.

| Covered by me (until meaningful funding) | Not covered |
|------------------------------------------|-------------|
| VPS, live env on my host | Custom / primary domain (e.g. `dovachain.com`) — DOVA buys and owns if/when it wants one |
| Public URL: subdomain **`dova.dntech.id`** | Company-owned VPS/accounts after meaningful funding |
| SSL, backups, uptime, env docs | Hosting on my infra after the company has meaningful funding and has completed handover |

Reference cost if DOVA paid VPS directly: ~Rp109k/month (~US$6). **No custom-domain bill on my side** — public access is **`dova.dntech.id`**, already live.

When **meaningful investor funding** lands (or DOVA is ready to run its own infra), we do a **30-day documented handover** to company-owned accounts.

This lets DOVA launch and operate **without waiting on a hosting or domain budget**. It does not replace equity. After a meaningful round **and** signed terms, infra can be handed over to company-owned accounts.

**Use for DOVA is not ownership of the underlying infrastructure.** Until a final written agreement is signed, this infra remains under my ownership and control even while the public site uses the DOVA name. DOVA may keep using it to run the product. Handover of infra happens only as the signed agreement provides, via the 30-day handover after meaningful funding.

---

## 08 — Mutual commitments

**From me:** Hit launch milestones · keep the live site stable · work with FE/QA · confidentiality

**From DOVA:** Unblock Paystack KYC and supplier pilots where you can · share cap table context before signing · talk openly if funding or scope changes

---

## 09 — Next step

If this direction feels fair, let’s **talk on a call**, pick the exact equity % and title timing, then put it in a simple agreement.

**No signature required on this draft.**

| | **DOZER** | **FOUNDER — DOVA** |
|---|-----------|---------------------|
| **Name** | Dozer | Egegieh Onyekachi Daniel |
| **Date** | _________________________ | _________________________ |

---

## Appendix A — MVP already delivered

| Deliverable | Status |
|-------------|--------|
| NestJS API (auth, catalog, cart, orders, admin, supplier) | Done |
| PostgreSQL schema + migrations | Done |
| Paystack integration + webhook | Done |
| Live site (`dova.dntech.id`) | Live |
| 92 unit tests + CI | Green |
| Deploy runbooks + env docs | Done |

**Still ahead:** Paystack live, prod hardening, supplier pilot support, monitoring.

---

*DOVA — Building a better food supply network from Nigerian farmers to consumers.*

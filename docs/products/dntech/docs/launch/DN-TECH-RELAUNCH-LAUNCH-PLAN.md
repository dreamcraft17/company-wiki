# DN Tech Website Relaunch — Launch Plan

> **Status:** Active · **Last updated:** 2026-08-29 · **Author:** Dozer  
> **Product:** [dntech.id](https://dntech.id) company profile  
> **Horizon:** 2–4 weeks (single founder)  
> **North star:** Qualified inbound conversations / week via `/contact`

## Summary

Relaunch bukan “hari H” — ini sistem momentum tiga fase. Situs sudah **built** (CMS, produk, contact form, 81 tests); yang belum siap adalah **kepercayaan** (copy jujur), **ops production** (seed + SMTP), dan **channel activation**. Readiness scorer: **30/100 — NOT READY** (7 blockers). Gate tanggal announce pada checklist `dntech-relaunch-checklist.json`, bukan feeling.

**Related docs:** [RELAUNCH PRD](../DN-TECH-RELAUNCH-PRD.md) · [Bug triage](../qa/DN-TECH-BUG-TRIAGE-2026-08-29.md) · [Adversarial review](./DN-TECH-RELAUNCH-ADVERSARIAL-REVIEW.md) · [Anti-slop design](./DN-TECH-RELAUNCH-ANTI-SLOP-DESIGN.md)

---

## Context (launch-strategy intake)

| Question | Answer |
|----------|--------|
| What are we launching? | **Honest relaunch** — same product, stripped fake social proof; seed products as proof |
| Audience size | Early-stage — ~400 uniques/quarter (estimate); **0 paying clients** |
| Owned channels | `dntech.id`, founder LinkedIn, direct email to warm network, admin CMS |
| Timeline | **Week 0–2:** fix blockers · **Week 2–3:** soft announce · **Week 3–4:** post-launch momentum |
| Prior launches | Site live since v5; never had honest 0-client narrative |
| Product Hunt | **Won't this cycle** — need real screenshots + honest story first |

**Constraint (non-negotiable):** No invented logos, quotes, “50+ klien”, or enterprise theater. DOVA stays off compro.

---

## Readiness score (2026-08-29)

```bash
python3 .cursor/skills/launch-strategy/scripts/launch_readiness_scorer.py \
  --checklist company-wiki/docs/products/dntech/docs/launch/dntech-relaunch-checklist.json
```

| Category | Score | Weakest areas |
|----------|------:|---------------|
| Product | 27/100 | Honest copy, SMTP, prod seed, admin password |
| Marketing | 31/100 | Owned/rented/borrowed activation not started |
| Technical | 32/100 | VPS seed, SMTP proof, About SSR, rollback rehearsed |
| **Overall** | **30/100** | **7 blockers — do not announce until cleared** |

Re-score **one week before** soft launch; target ≥70 overall, zero blockers in Product + Technical.

---

## ORB channel map

| Type | Channel | Tactic | Owner | When |
|------|---------|--------|-------|------|
| **Owned** | Homepage + `/products` | Hero → produk seed → harga → `/contact`; hide fake testimonial headings | Dozer | Pre-launch W1 |
| **Owned** | `/contact` + SMTP | Golden-path test → screenshot inbox + `EmailLog` | Dozer | Pre-launch W1 |
| **Owned** | Founder LinkedIn (ID) | Post: “Studio baru, produk nyata” + screenshot dnPeople tier + link `/products/dnpeople` | Dozer | Launch day |
| **Owned** | Warm email (≤50) | Personal note to founder network — **no** mass newsletter blast | Dozer | Launch day +3d |
| **Rented** | LinkedIn company page | Carousel: 3 product cards (dnPeople, dnCore, dnShop) — status badges honest | Dozer | Launch week |
| **Rented** | Threads / IG | Product UI screenshot + one line CTA ke `/contact` | Dozer | Post-launch W2 |
| **Borrowed** | dnPeople live app | Cross-link `hris.dntech.id` ↔ compro product page (already in seed CTAs) | Dozer | Done |
| **Borrowed** | Trusted Jurist | Showcase **only** if client still consents — 1 real deliverable | Dozer | Pre-launch verify |
| **Borrowed** | Founder peer DMs | 3 conversations: “Would this homepage feel honest to you?” | Dozer | Pre-launch W2 |

**Not this relaunch:** Product Hunt, paid ads, fake press kit, newsletter growth, quiz as primary CTA.

---

## Phase model

### Phase 1 — Pre-launch (Week 0–2)

**Goal:** Site tells the truth; contact path works on production.

| # | Action | Owner | Due | Done when |
|---|--------|-------|-----|-----------|
| 1 | Close P0 from [bug triage](../qa/DN-TECH-BUG-TRIAGE-2026-08-29.md) | Dozer | W1 | No fake stats in seed; sidebar copy fixed |
| 2 | Rotate admin password; reject default in seed if `ADMIN_PASSWORD` unset | Dozer | W1 | Login with `Admin@123456` fails on prod |
| 3 | VPS: `prisma db push` + `db:seed-products` + screenshot `/products` | Dozer | W1 | Wiki BF-013 verified |
| 4 | SMTP live test from `/contact` | Dozer | W1 | Email in `info@dntech.id` ≤2 min |
| 5 | Hide/unlist empty social proof pages (testimonials meta, footer links) | Dozer | W2 | No “klien enterprise” on empty pages |
| 6 | Footer: add `/products` to `primaryLinks` | Dozer | W2 | Matches header |
| 7 | About: migrate to SSR `fetchPublicApi*` | Dozer | W2 | About loads on prod without client API bug |
| 8 | 5-person walkthrough (founders in network) | Dozer | W2 | Notes captured; no “is this real?” |

### Phase 2 — Launch day (single founder)

**Goal:** All channels fire once; founder available for replies ≤24h.

| Time (WIB) | Action |
|------------|--------|
| 08:00 | Final smoke: `/`, `/products/dnpeople`, `/contact` submit |
| 09:00 | Deploy tag `relaunch-YYYY-MM-DD` if copy changes shipped |
| 10:00 | LinkedIn post (owned) — link `dntech.id/products` |
| 11:00 | LinkedIn company repost |
| 12:00–18:00 | Monitor leads admin + inbox; reply every inquiry same day |
| 18:00 | Log metrics: visits, form starts, submits, SMTP failures |

**Launch day checklist**

- [ ] Readiness scorer re-run — 0 blockers
- [ ] No page claims false client/project counts
- [ ] `/products` shows 6–7 seed SKUs (excl. DOVA)
- [ ] Contact form → admin lead + email
- [ ] Calendly links work OR removed (404 = use `/contact` only)
- [ ] Founder phone/email in footer correct
- [ ] `robots.txt` + sitemap include `/products/*`
- [ ] LinkedIn post scheduled (not improvised at midnight)

### Phase 3 — Post-launch momentum (30 days)

| Week | Action | Channel | Metric |
|------|--------|---------|--------|
| 1 | Reply all leads <24h; note which product named | Owned | Response time |
| 1 | Fix any walkthrough copy feedback | Owned | Bounce on `/products/[slug]` |
| 2 | 1 LinkedIn thread: “Kenapa kami tidak pakai fake testimonial” | Rented | Profile visits |
| 2 | Add FAQ entry from first real objection heard | Owned | — |
| 3 | If ≥1 real quote: add testimonial (name + permission) | Owned | Social proof truth |
| 4 | Roundup email to warm list: “What we shipped + ask intro” | Owned | Referral replies |
| 4 | Compare page: dnPeople vs spreadsheet (if traffic justifies) | Owned | Product → contact rate |

**Not before day 30:** Blog cadence, PH, newsletter popup, careers page live.

---

## Success metrics (relaunch window)

| Metric | Target | Anti-metrics (ignore) |
|--------|--------|------------------------|
| Qualified form submits / week | ≥1 by week 2 post-launch | Pageviews alone |
| Product page → `/contact` rate | Baseline + track | Quiz completions |
| SMTP delivery success | 100% on test + live submits | Newsletter signups |
| Time to first reply | <24h | “Klien puas” count |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Announce with fake copy still live | Blocker gate on honest copy + scorer |
| Production empty `/products` | BF-013 screenshot before any post |
| Over-marketing before product truth | ORB map — borrowed only after owned is honest |
| Single-founder bandwidth | Max 3 rented posts in launch week; no PH |

---

## Owners

| Role | Name | Scope |
|------|------|-------|
| CEO + Tech Lead + PM | Dozer | Copy, deploy, launch posts, lead reply |
| Finance | Nur Annisa Sofyan | Invoicing if lead converts (post-launch) |

---

*Property of DN Tech — PT. Dozer Napitupulu Technology · 2026*

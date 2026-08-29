# DN Tech Website Relaunch — One-Page PRD

> **Author:** Dozer  
> **Date:** 2026-08-29  
> **Prepared by:** Dozer

**Product:** DN Tech company profile (`https://dntech.id`)  
**Horizon:** Relaunch (2–4 weeks, single founder)  
**Constraint:** **0 paying clients.** Catalog may show **seed products** (first-party) and **Trusted Jurist** as a real professional-services deliverable. No invented logos, quotes, or “50+ klien”.

---

## 1. Problem

The site is built like a mid-market software house: CMS, quiz, newsletter, careers, testimonials, case studies, inflated seed stats. A visitor who checks the claims will not trust the products. Conversion is diluted across pages that should be empty.

**Job to be done:** A founder or ops lead in Indonesia needs to see *what DN Tech actually ships*, at a real price, and send one inquiry — without being sold a fake track record.

**Cost of not fixing:** Relaunch with social-proof theater. One screenshot of “50 proyek selesai” vs an empty portfolio destroys the brand for the only market that matters (first 10 conversations).

---

## 2. North star (relaunch)

**Qualified inbound conversations / week** — contact form + email/WhatsApp replies that name a product or a custom-project budget.

Not: pageviews, newsletter list, “klien puas”, quiz completions.

HEART (relaunch window):

| | Metric |
|---|--------|
| Happiness | Bounce on homepage after 10s; qualitative “does this feel honest?” |
| Engagement | Product page → `/contact` rate |
| Adoption | First 5 real form submits that reach Dozer |
| Retention | n/a (0 clients) |
| Task success | Form submit + SMTP delivered |

---

## 3. In scope / out of scope

### In scope (Must)

- Honest homepage: hero, **seed products**, services, process, pricing, FAQ, contact CTA  
- Product listing + detail copy aligned with seed (no fake testimonials)  
- Contact MultiStepForm → `LeadService` → SMTP to `info@dntech.id`  
- Admin CMS enough to edit copy without a deploy  
- Legal: privacy + terms  
- SEO: titles, sitemap, no “enterprise clients” on empty pages  
- Production schema + `db:seed-products` (DOVA stays off this site, per seed script)

### Should

- About story without 50+ companies  
- Footer + nav: Produk visible  
- Empty-state copy for portfolio / testimonials (or unlisted)  
- Calendly only if the URL is live  
- 2–3 real blog posts **if written**; otherwise hide Blog from primary nav

### Could

- Solution quiz, newsletter, exit-intent, search polish, careers (only if hiring)

### Won’t (this relaunch)

- Fake case studies, fake testimonials, fake client logos, fake stats  
- Hiring theater if there are no open roles  
- DOVA on dntech.compro  
- Building portfolio “from imaginary clients”  
- New analytics product, new lead-scoring, Trunk/Datadog triage buy (overkill at this volume)

---

## 4. Seed products (allowed on relaunch)

These are **company products**, not client logos. Status from seed scripts — show the badge, do not imply customers.

| Product | Slug | Seed launchStatus | Homepage | Notes |
|---------|------|-------------------|----------|--------|
| dnPeople | `dnpeople` | launched | yes | Flagship HRIS. Strip fictional quotes. `customerCount`: Soft launch |
| dnCore | `dncore` | beta | yes | ERP. Keep Beta |
| dnShop Finance | `dnshop-finance` | launched vs `Beta UAT` | yes | Reconcile status vs UAT |
| Nearwork | `nearwork` | beta | no | Waitlist CTA is honest |
| DuaVulnScanner | `duavulnscanner` | beta | no | Security; don’t oversell |
| Threads Automation | `threads-automation` | launched | no | Internal (`ai.dntech.id`); SaaS is waitlist |
| Trusted Jurist | `trusted-jurist` | launched | no | **1 real client deliverable** — only showcase if still allowed |

DOVA: excluded from `seed-all-products.ts`. Do not add for this relaunch.

---

## 5. MoSCoW (capacity = founder sprint)

| Bucket | % | What |
|--------|--:|------|
| Must | 60 | Honest copy + SMTP + seed on prod + contact path + product pages |
| Should | 20 | About, footer Produk, hide empty social pages |
| Could | 10 | Quiz/newsletter if they don’t steal homepage space |
| Won’t | 0 | Fake proof, careers theater, new platforms |

---

## 6. RICE (reach = ~400 unique visitors / quarter — early-stage guess)

Formula: `(Reach × Impact × Confidence) / Effort`. Impact: massive=3, high=2, medium=1, low=0.5, minimal=0.25. Effort in person-months (xs=1, s=3, m=5).

RICE **undervalues** admin CMS and security; those stay Must via MoSCoW even if the score is low.

| Feature | Reach | Impact | Conf. | Effort | RICE | Quadrant |
|---------|------:|--------|------:|-------:|------:|----------|
| Honest content pass (branding + dnPeople quotes) | 400 | 3 | 1.0 | 1 | **1200** | Quick win |
| SMTP + lead inbox verified | 400 | 3 | 0.8 | 1 | **960** | Quick win |
| Product seed on production | 400 | 2 | 1.0 | 1 | **800** | Quick win |
| Legal pages live | 400 | 2 | 1.0 | 1 | **800** | Quick win |
| Fix “Dipercaya {status} pelanggan” | 400 | 2 | 1.0 | 1 | **800** | Quick win |
| Default admin password gone | 5 | 3 | 1.0 | 1 | 15 | Must (security; RICE fails) |
| About SSR + honest story | 200 | 2 | 0.8 | 1 | **320** | Quick win |
| Homepage conversion (already built) | 400 | 2 | 0.8 | 2 | 320 | Keep, don’t rebuild |
| SEO / sitemap | 400 | 2 | 0.8 | 2 | 320 | Should |
| Footer + nav Produk | 400 | 0.5 | 1.0 | 1 | 200 | Fill-in |
| FAQ (real questions) | 200 | 1 | 0.8 | 1 | 160 | Should |
| Exit-intent modal | 400 | 1 | 0.5 | 2 | 100 | Could |
| Hide testimonials/portfolio until real | 400 | 0.5 | 1.0 | 1 | 200 | Quick win |
| Blog (no posts yet) | 150 | 1 | 0.5 | 5 | 15 | Time sink |
| Quiz | 100 | 1 | 0.5 | 3 | 17 | Could |
| Newsletter | 80 | 0.5 | 0.5 | 3 | 7 | Won’t this release |
| Careers (not hiring) | 50 | 0.5 | 1.0 | 1 | 25 | Won’t — unlisted |
| Fake case studies | 400 | 0.25 | 1.0 | 8 | 13 | **Time sink — avoid** |
| Admin analytics polish | 2 | 0.5 | 0.8 | 5 | 0.2 | Won’t |
| Admin CMS (keep as-is) | 2 | 2 | 1.0 | 8 | 0.5 | Platform Must |

ICE (better for 0-user): honest copy **9.0**, SMTP **8.3**, seed **8.3**, customerCount template **8.7**, hide empty social pages **7.7**.

---

## 7. Feature catalog — keep / cut / reframe

| Surface | Verdict | Why |
|---------|---------|-----|
| Homepage hero + pricing + process | Keep | Direct-market, no fake clients |
| `/products` + seed SKUs | Keep | The actual company |
| `/services` | Keep if CMS has real services; else 3 honest cards | Don’t show 6 defaults as if they were sold |
| `/contact` MultiStepForm | Keep | North star |
| `/admin/*` | Keep | Ops |
| `/about` | Reframe | Founder story, products, one client if true |
| `/faq` | Keep | Matches homepage FAQ |
| `/blog` | Hide from header if empty | Empty blog looks dead |
| `/testimonials`, `/portfolio`, `/case-studies` | Unlist or coming-soon only | 0 clients |
| `/careers` | Unlist unless real jobs | Hiring theater |
| `/quiz`, `/resources`, `/newsletter` | Secondary | Don’t compete with Contact |
| `/team` | Optional | Fine if real names |
| Search | Keep | Cheap |
| Exit intent | Could | Don’t offer fake lead magnet |

---

## 8. Hypotheses

1. If we remove fake social proof, inquiry quality rises (fewer “is this real?” drop-offs).  
2. If product pages lead with **status badges** (Beta / Soft launch / 1 client) instead of “Dipercaya N pelanggan”, bounce on `/products/[slug]` falls.  
3. If SMTP is verified, time-to-first-reply < 24h is achievable with one founder.

Validate with: 2 weeks of form submits + a 5-person walkthrough (founders in network). Do **not** wait for 5–8 customer interviews — there are no customers yet. Interview **prospects**, not invented personas.

---

## 9. Success (relaunch done)

- [ ] No page claims N clients/projects/years that are false  
- [ ] `/products` shows seed SKUs with honest `launchStatus`  
- [ ] Contact submit lands in inbox + admin leads  
- [ ] Admin default password rotated  
- [ ] P0 tickets from `docs/qa/DN-TECH-BUG-TRIAGE-2026-08-29.md` closed or explicitly waived  
- [ ] Footer includes Produk  

---

## 10. Risks

| Risk | Mitigation |
|------|------------|
| Production still on old schema | BF-013 gate before announcing relaunch |
| Calendly 404 | Use `/contact` only until URL works |
| Over-hiding products | Seed products stay; only **client** proof is hidden |
| RICE gamed with huge Reach | Cap reach at 400 until Analytics shows otherwise |

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026

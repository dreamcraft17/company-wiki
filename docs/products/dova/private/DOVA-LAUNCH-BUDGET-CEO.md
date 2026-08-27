# DOVA — Launch Budget (CEO Summary)

> **Status:** Active · **Last updated:** 2026-08-26 · **Author:** Dozer  
> **Current live URL:** [dova.dntech.id](https://dova.dntech.id)

---

## Bottom line

| Question | Answer |
|----------|--------|
| **What do we need to buy to go live and earn revenue?** | Almost **no new software**. Activate **Paystack live**, keep **hosting + domain** running, onboard **1–3 real suppliers**, set up **WhatsApp support**. |
| **Minimum budget before full funding?** | **Scenario A (recommended): Rp0 · US$0 · ₦0** — subdomain **`dova.dntech.id` FREE**, infra covered by Dozer (CTO proposal). **If company pays infra directly:** Rp109,000 · US$6.16 · ₦8,326/mo (VPS only, domain still FREE). **Optional .com:** +Rp139,900 · US$7.90 · ₦10,681. Paystack: tx fees only (~1.5% + ₦100). |

**Key point:** The MVP is **already built**. This budget **turns it on** for real customers — it does not fund new development.

---

## Indonesian infra pricing basis

All scenarios A/B/C use **published Indonesian provider rates** (Aug 2026). USD & NGN are **conversion for comparison only**. **Prices can change at the time of purchase** — treat these figures as estimates, not a locked quote.

| Provider (Indonesia) | Service | IDR | USD | NGN (Nigeria) | Billing |
|----------------------|---------|-----|-----|---------------|---------|
| **Biznet Gio** | VPS entry (1 vCPU / 2 GB) | Rp80,000/mo | US$4.52/mo | ₦6,109/mo | Monthly |
| **Biznet Gio** | VPS standard (2 vCPU / 4 GB) | Rp109,000/mo | US$6.16/mo | ₦8,324/mo | Monthly |
| **Biznet Gio** | VPS mid (4 vCPU / 8 GB) | Rp139,000/mo | US$7.85/mo | ₦10,614/mo | Monthly |
| **DomaiNesia** | Domain `.com` (promo reg.) | Rp139,900 | US$7.90 | ₦10,681 | Per year |
| **DN Tech** | Subdomain `dova.dntech.id` | **FREE** | **FREE** | **FREE** | Already live · no cost |
| **Supabase** | PostgreSQL Free tier | Rp0 | US$0 | ₦0 | Free |
| **Let's Encrypt** | SSL / HTTPS (via VPS nginx) | Rp0 | US$0 | ₦0 | Free |
| **Resend** | Email transactional (free tier) | Rp0 | US$0 | ₦0 | ≤3,000 emails/mo |
| **UptimeRobot** | Basic uptime monitoring | Rp0 | US$0 | ₦0 | Free |
| **Paystack** | Payment gateway (Nigeria) | Rp0 | US$0 | ₦0 | Tx fees only (~1.5% + ₦100) |

> Conversion: **US$1 ≈ Rp17,705 · US$1 ≈ ₦1,352** (Aug 2026).

---

## What we must buy or activate

| Item | Provider | IDR | USD | NGN (Nigeria) | Notes |
|------|----------|-----|-----|---------------|-------|
| **Paystack live account** | Paystack (NG) | Rp0 | US$0 | ₦0 | Free signup · fees per transaction (~1.5% + ₦100). Needs Nigeria KYC (CAC, bank). |
| **VPS hosting** | Biznet Gio | Rp109,000/mo | US$6.16/mo | ₦8,324/mo | VPS standard · website + API 24/7. |
| **Subdomain (recommended)** | DN Tech | **FREE** | **FREE** | **FREE** | **`dova.dntech.id`** — already live, no purchase needed. |
| **Domain (.com)** *(optional)* | DomaiNesia | Rp139,900 | US$7.90 | ₦10,681 | Branded domain · per year. Skip if subdomain is enough. |
| **Database PostgreSQL** | Supabase Free | Rp0 | US$0 | ₦0 | Managed Postgres · enough for soft-launch. |
| **SSL (HTTPS)** | Let's Encrypt | Rp0 | US$0 | ₦0 | Auto-renew via nginx on VPS. |
| **1–3 pilot suppliers** | — | — | — | — | Operational (not software). Real stock via admin tools. |
| **Support channel** | WhatsApp | Rp0 | US$0 | ₦0 | WhatsApp Business or group. |

---

## Minimum budget — three scenarios

All line items below use **Indonesian infra providers** from the table above.

### Scenario A — My Own Infra (Recommended)

| Item | Provider | Monthly IDR | Monthly USD | Monthly NGN | One-time IDR | One-time USD | One-time NGN |
|------|----------|-------------|-------------|-------------|--------------|--------------|--------------|
| VPS hosting | Biznet Gio (standard) | *Dozer covers* | *Dozer covers* | *Dozer covers* | — | — | — |
| PostgreSQL | Supabase Free | FREE | FREE | FREE | — | — | — |
| SSL | Let's Encrypt | FREE | FREE | FREE | — | — | — |
| **Subdomain** | **DN Tech** | **FREE** | **FREE** | **FREE** | **FREE** | **FREE** | **FREE** |
| Domain (.com) *(optional)* | DomaiNesia | — | — | — | Rp139,900 | US$7.90 | ₦10,681 |
| Paystack | Paystack (NG) | Tx fees | Tx fees | Tx fees | — | — | — |
| Email | Resend (free tier) | FREE | FREE | FREE | — | — | — |
| Monitoring | UptimeRobot (free) | FREE | FREE | FREE | — | — | — |
| *Indicative infra value* *(if paid directly)* | Biznet Gio VPS | Rp109,000 | US$6.16 | ₦8,324 | — | — | — |
| **Company cost (Dozer support)** | | **Rp0** | **US$0** | **₦0** | **Rp0** | **US$0** | **₦0** |
| **Company cost (+ .com domain)** | | **Rp0** | **US$0** | **₦0** | **Rp139,900** | **US$7.90** | **₦10,678** |

**First month — company pays (Dozer covers infra + FREE subdomain):** Rp0 · US$0 · ₦0  
**First month — company pays (+ optional .com):** Rp139,900 · US$7.90 · ₦10,681  
**Reference — if infra paid directly (no Dozer support):** Rp109,000/mo · US$6.16 · ₦8,326 (subdomain still FREE)

**Infra proposal (Dozer):** I will support and cover the existing infrastructure (Biznet Gio VPS, existing **`dova.dntech.id`** live site, and technical ops) **until meaningful investor funding is secured**, so the company can launch **without upfront infra or domain spend**. This is an **in-kind infrastructure contribution**. It does not transfer ownership of the underlying infrastructure or technical assets. Any transfer or migration to company-owned infrastructure will be handled under the final written agreement. In return, I **propose the CTO position** to lead product, engineering, and go-live execution going forward.

**Ownership note:** The infrastructure listed under Scenario A is currently provided and controlled by Dozer. DOVA may use it to operate the product, but such use does not by itself transfer ownership of the underlying infrastructure, accounts, code, repository, configurations, or other technical assets. Any transfer or migration to company-owned infrastructure will be handled under the final written agreement.

**Best for:** Soft-launch, 10–50 transactions/day, market validation before full funding.

---

### Scenario B — Standalone Minimal (Lowest Cost)

| Item | Provider | Monthly IDR | Monthly USD | Monthly NGN | One-time IDR | One-time USD | One-time NGN |
|------|----------|-------------|-------------|-------------|--------------|--------------|--------------|
| VPS hosting | Biznet Gio (entry) | Rp80,000 | US$4.52 | ₦6,109 | — | — | — |
| PostgreSQL | Supabase Free | Rp0 | US$0 | ₦0 | — | — | — |
| SSL | Let's Encrypt | Rp0 | US$0 | ₦0 | — | — | — |
| Domain (.com) | DomaiNesia | — | — | — | Rp139,900 | US$7.90 | ₦10,681 |
| Paystack | Paystack (NG) | Tx fees | Tx fees | Tx fees | — | — | — |
| **Total** | | **Rp80,000** | **US$4.52** | **₦6,111** | **Rp139,900** | **US$7.90** | **₦10,678** |

**First month all-in:** Rp219,900 · US$12.42 · ₦16,796

**Best for:** Lowest Indonesian infra cost; company pays Biznet Gio + DomaiNesia directly.

---

### Scenario C — Scale-Ready (Pre-Full-Funding)

| Item | Provider | Monthly IDR | Monthly USD | Monthly NGN | One-time IDR | One-time USD | One-time NGN |
|------|----------|-------------|-------------|-------------|--------------|--------------|--------------|
| VPS hosting | Biznet Gio (mid) | Rp139,000 | US$7.85 | ₦10,614 | — | — | — |
| PostgreSQL | Supabase Free | Rp0 | US$0 | ₦0 | — | — | — |
| Email | Resend (free → paid if needed) | Rp0 | US$0 | ₦0 | — | — | — |
| Domain (.com) | DomaiNesia | — | — | — | Rp139,900 | US$7.90 | ₦10,681 |
| SSL | Let's Encrypt | Rp0 | US$0 | ₦0 | — | — | — |
| Monitoring | UptimeRobot (free) | Rp0 | US$0 | ₦0 | — | — | — |
| **Total infrastructure** | | **Rp139,000** | **US$7.85** | **₦10,610** | **Rp139,900** | **US$7.90** | **₦10,678** |

**First month all-in:** Rp278,900 · US$15.75 · ₦21,293

**Best for:** Scaling to 100+ active users. Marketing, ops salaries, and supplier onboarding are separate business costs.

---

### AWS alternative

> **Not Indonesian infra.** AWS bills in **USD globally** — IDR/NGN below are **converted for comparison only**. Final cost depends on exchange rate, region, data transfer, and usage.

| Option | Provider | Monthly USD | Monthly IDR (conv.) | Monthly NGN (conv.) | Business use |
|--------|----------|-------------|---------------------|---------------------|--------------|
| AWS Small | AWS Lightsail | US$12 | Rp212,460 | ₦16,224 | Basic launch and early growth |
| AWS Medium | AWS Lightsail | US$24 | Rp424,920 | ₦32,448 | More room as usage grows |

---

### Quick comparison (Indonesian infra)

| Scenario | VPS (Biznet Gio) | Domain | Monthly IDR | Monthly USD | Monthly NGN | One-time IDR | One-time USD | One-time NGN | What you get |
|----------|------------------|--------|-------------|-------------|-------------|--------------|--------------|--------------|--------------|
| **A — My Own Infra** | Standard | **dova.dntech.id (FREE)** | **Rp0** | **US$0** | **₦0** | **Rp0** | **US$0** | **₦0** | Dozer covers existing VPS + FREE subdomain + technical ops + CTO proposal |
| **A — + branded .com** | Standard | DomaiNesia | Rp0 | US$0 | ₦0 | Rp139,900 | US$7.90 | ₦10,678 | Infra covered; company pays domain only |
| **B — Standalone** | Entry | DomaiNesia | Rp80,000 | US$4.52 | ₦6,111 | Rp139,900 | US$7.90 | ₦10,678 | Lowest Indo infra cost |
| **C — Scale-Ready** | Mid | DomaiNesia | Rp139,000 | US$7.85 | ₦10,610 | Rp139,900 | US$7.90 | ₦10,678 | More VPS capacity |

**Recommendation:** Start with **Scenario A** — company cost **Rp0** (Dozer covers existing infra, subdomain **FREE**), CTO role proposed. Add branded `.com` later if needed (+Rp139,900 one-time). Zero company infra cost under Scenario A is the **use** of Dozer-provided infrastructure, not company ownership of it.

---

## What is already built (no dev spend needed)

- Customer: browse, cart, checkout (pickup/delivery), order history
- Payment: Paystack integration (needs live keys to collect real money)
- Supplier: register, product & stock management, order fulfillment
- Admin: approve suppliers, manage users/products/orders, contact inbox
- Min order rules: pickup ₦3,000 · delivery ₦5,000

**Not in scope now:** password reset, reviews, wishlist, courier tracking, native mobile app, paid marketing.

---

## Next steps (this week)

| Step | Owner | IDR | USD | NGN | Notes |
|------|-------|-----|-----|-----|-------|
| 1. Complete Paystack live KYC | BD / legal | Rp0 | US$0 | ₦0 | 3–14 days |
| 2. Switch Paystack to live keys | Tech | Rp0 | US$0 | ₦0 | 1 day |
| 3. Onboard 1–3 pilot suppliers | BD + ops | — | — | — | Operational |
| 4. Soft-launch to 10–20 buyers | BD | Rp0 | US$0 | ₦0 | Week 1 |

After steps 1–2, every successful checkout puts money in the Paystack merchant account.

---

## What we can skip for now

- New feature development (MVP scope is complete)
- AWS migration (Indonesian VPS is cheaper for launch — see comparison above)
- Redis, paid email/monitoring tiers until volume requires it
- Large VPS or paid marketing until traction is proven

---

## Risk of waiting for full funding

- 1–3 months idle with no real transaction data for investors
- Pilot suppliers may lose interest and need re-onboarding later

**Alternative:** Launch under **Scenario A** (Dozer-provided infra; company may use it) → collect real order data → strengthen the investor pitch.

---

## Pricing sources (Indonesia)

| Provider | Source | Rate used |
|----------|--------|-----------|
| Biznet Gio VPS | [biznetgio.com](https://www.biznetgio.com) published VPS tiers | Rp80k / Rp109k / Rp139k per month |
| DomaiNesia `.com` | [domainesia.com](https://www.domainesia.com) promo registration | Rp139,900/year (promo; standard Rp209,000) |
| DN Tech subdomain | Existing `dova.dntech.id` | **FREE** (already configured) |
| Supabase Free | [supabase.com/pricing](https://supabase.com/pricing) | Rp0 |
| Let's Encrypt SSL | Included with VPS/nginx setup | Rp0 |
| Resend free tier | [resend.com/pricing](https://resend.com/pricing) | Rp0 (≤3,000 emails/mo) |
| UptimeRobot free | [uptimerobot.com](https://uptimerobot.com) | Rp0 |
| Paystack | [paystack.com](https://paystack.com) | No monthly fee; ~1.5% + ₦100 per local tx |

*AWS Lightsail listed separately — global USD pricing, not Indonesian provider rates.*

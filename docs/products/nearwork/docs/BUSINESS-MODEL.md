# NextWork — Business Model

> **Status:** Active · **Last updated:** 2026-08-29 · **Author:** Dozer  
> **Product:** NextWork · **Repo:** `nextwork/` · **HEAD:** `3983ddf`

---

## Summary

NextWork monetizes a **two-sided freelance marketplace** through **SaaS subscriptions** (freelancer/agency quotas), **paid visibility (boosts)**, **transaction fees on escrow**, and optional **payout fees**. Engineering supports full V2 commerce; **revenue is Conditional** until Stripe/Midtrans LIVE keys and pilot transactions run in production.

---

## Value proposition

| Stakeholder | Masalah | NextWork |
|-------------|---------|----------|
| **Client (hirer)** | Hiring tersebar di WA/IG, tidak teraudit | Job posting → review proposal → chat terikat job → kontrak + escrow |
| **Freelancer** | Sulit ditemukan lokal + remote | Profile publik, nearby search, proposal terstruktur, wallet/payout |
| **Platform (DN Tech)** | Butuh recurring + take rate | Subscription tiers + boost + escrow/payout fees |

**Positioning:** Structured freelance marketplace — **Upwork-style bidding** + **hyperlocal discovery** (Fastwork-adjacent) untuk **semua jenis jasa** (digital, kreatif, profesional, on-site).

---

## Revenue streams

| # | Stream | Mekanisme | Status produk |
|---|--------|-----------|---------------|
| 1 | **Subscription SaaS** | FREE / PRO / AGENCY — kuota bid & kontrak, analytics, badge | **Available** (charge **Conditional** tanpa PSP) |
| 2 | **Boost & visibility** | Job boost, client job boost, featured profile, top badge | **Available** |
| 3 | **Escrow service fee** | **2%** dari nilai transaksi (`escrowFeeRate: 0.02`) | **Available** (MOCK settlement) |
| 4 | **Payout fee** | **0,5%** (`payoutFeeRate: 0.005`) | **Available** (MOCK bank receipt) |
| 5 | **Donations** | Optional donation record | **Available** (abuse risk — ops review) |
| 6 | **Future: take rate on GMV** | Bisa diperluas beyond escrow fee | Roadmap / policy TBD |

Sumber konstanta: `nextwork/packages/config/src/v2-pricing.ts` · seed: `packages/database/prisma/seed.ts`.

---

## Pricing — subscription plans

Harga seed (**IDR / bulan** — field DB `priceCents`, nilai = rupiah whole units di seed):

| Plan | Harga/bulan | Active bids | Active contracts | Analytics | Boost | Premium badge |
|------|-------------|-------------|------------------|-----------|-------|---------------|
| **FREE** | **Rp 0** | 5 | 2 | Limited | ❌ | ❌ |
| **PRO** | **Rp 199.000** | 30 | 10 | Advanced | ✅ | ✅ |
| **AGENCY** | **Rp 499.000** | 200 | 75 | Agency | ✅ | ✅ |

Entitlements canonical: `@acme/config` → `PLAN_ENTITLEMENTS` · persisted `SubscriptionPlan` table.

**Billing cycle:** MONTHLY · upgrade/cancel via `/api/subscriptions/*` · `cancelAtPeriodEnd` supported.

**Grace:** `subscriptionGraceDays: 3` after failed payment (V2 config).

---

## Pricing — boosts (catalog seed)

| Product code | Durasi | Harga (IDR) | Target |
|--------------|--------|-------------|--------|
| `JOB_BOOST_7D` | 7 hari | **Rp 50.000** | Freelancer — promosi job/listing |
| `CLIENT_JOB_BOOST_7D` | 7 hari | **Rp 75.000** | Client — promosi lowongan |
| `PROFILE_FEATURED_30D` | 30 hari | **Rp 150.000** | Featured profile |
| `TOP_FREELANCER_30D` | 30 hari | **Rp 300.000** | Top freelancer badge |

Paid activation gated — requires successful payment intent (MOCK or LIVE PSP).

---

## Escrow & marketplace economics

| Parameter | Nilai | Keterangan |
|-----------|-------|------------|
| Escrow fee | **2%** | Platform fee on escrow lock |
| Payout fee | **0,5%** | On freelancer payout |
| Payout minimum | **Rp 100.000** | `payoutMinimumIdrCents` (config) |
| Payment due (client) | **3 hari** | After contract acceptance |
| Work review window | **5 hari** | Before auto-release partial |
| Holdback | **20%** | Released after review period |
| Partial release | **80%** | On completion milestone |
| Auto-release (IN_PROGRESS) | **14 hari** | Worker sweep |
| Manual review threshold | **Rp 5.000.000** default | Env `FEATURE_ESCROW_MANUAL_REVIEW_THRESHOLD_IDR` |

**Flow:** Client pays → escrow lock → work → review → release 80/20 → wallet → payout request → admin approve → worker marks SENT (MOCK receipt until bank API).

**PSP:** Stripe (USD/intl) + Midtrans Snap (IDR) — **MOCK** when keys absent.

---

## Customer segments

| Segment | Plan | Use case |
|---------|------|----------|
| Freelancer pemula | FREE | Coba platform, kuota kecil |
| Freelancer aktif | PRO | Lebih banyak bid + boost + badge |
| Agency / studio | AGENCY | Kuota tinggi (multi-seat UX **Roadmap**) |
| Client UMKM–enterprise | FREE (post jobs) | Hire via job board; bayar per kontrak/escrow |
| DN Tech internal | — | Private repo; early-access positioning |

---

## Go-to-market (current)

| Channel | Status |
|---------|--------|
| Public marketing site | `/[locale]` EN/ID · SEO hreflang |
| Early-access narrative | Transparent — no fake urgency metrics |
| Hyperlocal | Nearby search, work mode filters |
| Admin-led trust | Moderation queue, verification, appeals |

**Not live yet:** paid acquisition at scale, PSP production runbook completion, legal/compliance sign-off for escrow in ID.

---

## Unit economics (assumptions — TBD validate)

| Metrik | Catatan |
|--------|---------|
| CAC | TBD — pre-GA |
| ARPU | Mix subscription (199k–499k) + boosts + 2% escrow |
| Take rate effective | Escrow 2% + payout 0,5% + subscription |
| Churn | TBD post-PRO launch |

Mark **TBD** until pilot transactions.

---

## Competitive frame

| Alternatif | NextWork differentiation |
|------------|---------------------------|
| Upwork / Freelancer | Fokus **ID locale**, hyperlocal, SaaS quota tiers |
| Fastwork | **Job-bound proposals + escrow**, not catalog-only |
| WA / informal | Audit trail, reports, admin moderation, contracts |

---

## Risks & compliance

| Area | Risiko | Mitigasi engineering |
|------|--------|----------------------|
| Pembayaran | PSP webhook abuse | v2.1 HMAC Stripe + Midtrans signature required |
| Escrow / UU PDP | Data & financial liability | Audit log, manual review threshold, disputes admin |
| Donations | Abuse vector | Admin review; consider disable prod |
| Agency | Enum exists; UX partial | Roadmap multi-seat |

Audit Jul 2026: [SECURITY_AUDIT_2026-07-08.md](../SECURITY_AUDIT_2026-07-08.md) — critical items **addressed in v2.1** for webhooks; rotate credentials if legacy exposure.

---

## Business rules (quota & bids)

- Active bid statuses: `SUBMITTED`, `SHORTLISTED`, `ACCEPTED`
- Active contract statuses: `ACTIVE`, `IN_PROGRESS`
- Bid requires: active account, complete freelancer profile, open job, unique bid per job, work mode compatibility

Detail: `nextwork/docs/business-rules.md` · wiki mirror [docs/business-rules.md](./business-rules.md) (legacy path).

---

## Roadmap monetization

1. **P0** — LIVE Stripe/Midtrans + pilot txs ([PAYMENT-RUNBOOK](https://github.com/dreamcraft17/freelance-web-startup/blob/main/docs/PAYMENT-RUNBOOK.md))
2. **P1** — Invoice PDF + reconciliation export
3. **P1** — Real bank payout API (replace MOCK receipt)
4. **P2** — Agency multi-seat billing
5. **P2** — Dynamic pricing / promo codes

---

*Sumber: `nextwork/packages/config`, seed, FEATURE-CATALOG, CURRENT-IMPLEMENTATION · Dozer · DN Tech*

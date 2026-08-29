# NextWork — Current Implementation Baseline

> **Status:** Active · **Last updated:** 2026-08-29 · **Author:** Dozer  
> **Snapshot date:** 29 Agustus 2026 · **HEAD:** `3983ddf` · **Repo:** `nextwork/`

---

## Summary

Baseline untuk PRD berikutnya — **jangan rebuild** MVP + V2 foundation. Engineering **current-scope 100% Done**; **GA monetization Conditional** (PSP LIVE).

---

## Metadata

| Field | Value |
|-------|-------|
| Owner | Dozer · DN Tech |
| Brand | **NextWork** (wiki folder: `nearwork`) |
| Runtime web | Next.js 15 on Vercel |
| Runtime worker | Node (`apps/worker`) — **wajib produksi** |
| Spec | V2 PRD/SRS/SDD + v2.1 payment harden |
| Latest commit note | `3983ddf` — VERCEL_URL fallback when `NEXT_PUBLIC_APP_URL` unset |

---

## Available now

### Produk / UX

- Browse-first publik: landing `/[locale]`, `/jobs`, `/freelancers`, pricing, how-it-works, help, early-access, legal
- Auth register/login/logout; role home CLIENT→`/client`, FREELANCER→`/freelancer`, staff→`/admin`
- Client: dashboard, jobs CRUD, nearby talent, bid review, `Needs review` filter
- Freelancer: dashboard, profile, proposals, nearby jobs
- Messages job-bound, notifications EN/ID, settings, saved items
- Proposal form terstruktur + **local draft autosave**
- Admin **`/admin`**: users, jobs, bids, contracts, verification, reviews, reports, appeals, analytics, donations, subscriptions, disputes, payouts, reconciliation, feature-flags
- i18n EN/ID · default publik **`id`** · workspace locale URLs
- Design tokens `nw-*` / V2 UI

### Backend / data

- ~**60** API route modules under `/api/*`
- Layering: route → service → policy → repository → Prisma
- **42** Prisma models
- CSRF + rate limits + RBAC policies
- Quota dari `@acme/config` + `SubscriptionPlan` seed
- Moderation: reports, SLA, dedupe, audit log, worker escalation
- Escrow / boosts / wallet / disputes / recommendations
- Worker sweeps: promotion, moderation escalation, escrow release, boost expiry, recommendations, batch payouts
- Payment webhooks: Stripe HMAC + Midtrans signature + amount/currency checks (v2.1)

### Inventori (verified 2026-08-29)

| Area | Count |
|------|-------|
| `page.tsx` | **55** |
| API `route.ts` | **60** |
| Prisma models | **42** |
| Unit tests passed | **82** |
| Apps | web (produk), worker (jobs), admin (**stub**) |

---

## Conditional (env / ops)

| Item | Syarat |
|------|--------|
| Stripe LIVE | `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` |
| Midtrans LIVE | `MIDTRANS_SERVER_KEY` + registered notification URL |
| Job UGC translate | `GOOGLE_TRANSLATE_API_KEY` |
| HSTS | `NEXTWORK_ENABLE_HSTS=1` |
| Paid feature flags | `FEATURE_*` env |
| Worker in prod | Deploy `@acme/worker` + `DATABASE_URL` |
| E2E isolated DB | `DATABASE_URL_TEST` |
| Support email on /help | `NEXTWORK_SUPPORT_EMAIL` |
| Production secrets | Strong `SESSION_SECRET`; **no default seed admin in prod** |

**Default lokal tanpa PSP:** MOCK checkout — aman demo.

---

## Not implemented / roadmap

- LIVE PSP pilot transactions + legal sign-off
- Invoice PDF · real bank payout API
- Forgot-password email delivery
- WebSocket realtime messaging
- Agency multi-seat product UX
- Outbound email/SMS for moderation on-call
- CSP + shared Redis rate-limit store
- `apps/admin` as separate production app (**tidak direncanakan**)

---

## Requirements for next PRD

1. Jangan ulangi MVP + V2 sebagai “fitur baru”.
2. Satu fokus — lihat `nextwork/docs/NEXT-PRD-BRIEF.md`.
3. Acceptance: MOCK vs LIVE PSP, CSRF, worker jobs, webhook security.
4. Extend Vitest/E2E — jangan greenfield test harness.
5. Catat risiko UU PDP / pembayaran / escrow.

### Suggested priority

| P | Theme |
|---|--------|
| P0 | PSP LIVE runbook + pilot txs |
| P1 | Forgot-password + staff outbound alerts |
| P1 | Realtime messaging **or** agency seats |
| P2 | Invoice/compliance + bank payout |

---

*Living source: `nextwork/docs/CURRENT-IMPLEMENTATION.md`*

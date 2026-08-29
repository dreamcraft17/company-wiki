# NextWork — Implementation Status

> **Status:** Active · **Last updated:** 2026-08-29 · **Author:** Dozer  
> **HEAD:** `3983ddf` · **Repo:** `nextwork/`

---

## Ringkasan eksekutif

| Dimensi | Status |
|---------|--------|
| **Engineering (current-scope)** | **Done** — money-safe payments, checkout UI, admin finance, trust ops |
| **PSP / GA bisnis** | **Conditional** — MOCK default; LIVE keys + pilot TBD |
| **Brand** | **NextWork** (rename dari NearWork Jul 2026) |

---

## Phase matrix

| Phase | Target | Status |
|-------|--------|--------|
| Phase 1 — Core | Auth, jobs, bids, middleware | **Done** |
| Phase 2 — UX | Messaging, notifications, saved, reviews, i18n | **Done** |
| Phase 3 — SaaS | Subscriptions, boosts, analytics | **Done** |
| V2 Foundation | Escrow, PSP APIs, appeals, AI match, wallet | **Done** (MOCK) |
| v2.1 Harden | Webhook HMAC/signature, amount checks | **Done** |
| Current-scope DoD | Ops finance, disputes, reconciliation | **Done** |
| Production GA | LIVE PSP, invoice PDF, bank API, pilot | **Conditional** |

---

## Current-scope DoD (Jul 2026 — masih valid Aug 2026)

| Item | Status |
|------|--------|
| Escrow bypass blocked; worker → `@acme/database` money-jobs | Done |
| Boost/sub paid gates; mock dev-only | Done |
| Webhook amount/currency + fee = base×rate | Done |
| Stripe.js / Midtrans Snap checkout UI | Done |
| Admin disputes / payouts / reconciliation | Done |
| Money notifications + AuditLog | Done |
| Auth refresh, attachments, viewCount, cancel sub | Done |
| Webhook rate limit; prod URL assert | Done |
| **LIVE PSP + pilot txs** | **Conditional** |

---

## Verifikasi (Aug 2026)

```bash
cd nextwork
pnpm install
# .env from packages/database/env.example.txt
pnpm db:migrate && pnpm db:seed   # non-prod
pnpm --filter @acme/web dev
pnpm --filter @acme/worker dev
pnpm test:unit                    # 82 passed
```

---

## Security posture

| Jul 2026 audit | Aug 2026 |
|----------------|----------|
| Midtrans/Stripe webhook weak | **Fixed v2.1** — HMAC + signature required |
| Credentials in public paths | Rotate if ever committed; hygiene in SECURITY.md |
| Seed admin default | Block prod seed |

Detail: [SECURITY_AUDIT_2026-07-08.md](../SECURITY_AUDIT_2026-07-08.md) · `nextwork/docs/SECURITY.md`

---

## Dokumen terkait

| Doc | Path |
|-----|------|
| Business model | [BUSINESS-MODEL.md](./BUSINESS-MODEL.md) |
| Feature catalog | [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) |
| Baseline | [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md) |
| Payment ops | `nextwork/docs/PAYMENT-RUNBOOK.md` |
| Next PRD | `nextwork/docs/NEXT-PRD-BRIEF.md` |

---

*Living source: `nextwork/docs/IMPLEMENTATION-STATUS.md`*

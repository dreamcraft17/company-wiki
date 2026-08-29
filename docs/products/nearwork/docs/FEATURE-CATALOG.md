# NextWork — Feature Catalog (lengkap)

> **Status:** Active · **Last updated:** 2026-08-29 · **Author:** Dozer  
> **Repo:** `nextwork/` · **HEAD:** `3983ddf` · **Spec:** V2 Foundation + current-scope DoD

---

## Cara membaca

| Status | Arti |
|--------|------|
| **Available** | Ada di UI/API — bisa diverifikasi di codebase |
| **Conditional** | Ada, butuh env / PSP keys / ops |
| **Roadmap** | Belum produk — jangan dijual sebagai fitur live |

**Inventori codebase:** 55 pages · 60 API routes · 42 Prisma models · 82 unit tests passed.

---

## Ringkasan modul

| # | Modul | Fitur Available | Conditional | Roadmap |
|---|-------|-----------------|-------------|---------|
| 1 | Identity & session | 6 | 1 | 0 |
| 2 | Marketplace core | 9 | 0 | 0 |
| 3 | Messaging & notifications | 4 | 0 | 1 |
| 4 | Discovery & hyperlocal | 6 | 1 | 0 |
| 5 | Monetization & V2 commerce | 12 | 4 | 0 |
| 6 | Trust, safety & admin | 9 | 0 | 2 |
| 7 | i18n & marketing | 5 | 0 | 1 |
| 8 | Quality & ops | 5 | 0 | 0 |

---

## 1. Identity & session

| Fitur | Kapabilitas | Surface | Status |
|-------|-------------|---------|--------|
| Register | Email/password, role CLIENT/FREELANCER | `/register`, `POST /api/auth/register` | Available |
| Login / logout | Session cookie JWT | `/login`, `/api/auth/*` | Available |
| Session API | Current user + role | `GET /api/auth/session` | Available |
| Auth refresh | Token refresh | `POST /api/auth/refresh` | Available |
| CSRF | Double-submit + header on mutations | All mutating API | Available |
| Rate limit auth | Sliding window per IP | Login/register | Available |
| Forgot password | Form UI | `/forgot-password` | Conditional (email backend belum) |
| RBAC | CLIENT, FREELANCER, staff roles, agency enum | Middleware + policies | Available (agency UX partial) |

**Roles staff:** moderation, admin finance, super-admin patterns via `/admin` RBAC.

---

## 2. Marketplace core

| Fitur | Kapabilitas | Surface | Status |
|-------|-------------|---------|--------|
| Post job | Create, lifecycle OPEN→… | `/client/jobs/new`, `POST /api/jobs` | Available |
| Job attachments | File URLs on job | Job create/edit | Available |
| Job view count | Analytics on detail | Job detail | Available |
| Job board publik | Filter, pulse, pagination | `/jobs`, `/api/search/jobs` | Available |
| Job detail | Brief, signals, apply panel | `/jobs/[jobId]` | Available |
| Proposal / bid | Structured form + local draft autosave | Detail job, `POST /api/bids` | Available |
| Shortlist / accept / reject | Owner bid actions | Client job detail, bid APIs | Available |
| Contracts | ACTIVE / IN_PROGRESS / complete | Contract APIs + workspaces | Available |
| Quota enforcement | Plan caps on bids & contracts | `QuotaService` + `@acme/config` | Available |
| Saved jobs / freelancers | Bookmarks | Settings + APIs | Available |
| Reviews | Post-contract reviews, public profile | `/api/reviews`, profile pages | Available |
| Portfolio | Freelancer portfolio items | Profile editor | Available |

**Business rules:** max bids/contracts per plan; unique bid per freelancer per job; work mode compatibility.

---

## 3. Messaging & notifications

| Fitur | Kapabilitas | Surface | Status |
|-------|-------------|---------|--------|
| Job-bound threads | Conversation tied to job context | `/messages` | Available |
| Send message | CSRF + rate limit | `POST /api/messages/*` | Available |
| Message metadata | Structured metadata on messages | Prisma `Message.metadata` | Available |
| In-app notifications | Locale-aware copy EN/ID | `/notifications` | Available |
| Category filters (client) | All / Proposals / Messages / Contracts | Notifications UI | Available |
| Unread / awaiting reply | Navbar badges | Marketing + dashboards | Available |
| Context banners | e.g. `from=proposal` handoff | Messages page | Available |
| Realtime WebSocket | Live delivery | — | Roadmap |

---

## 4. Discovery & hyperlocal

| Fitur | Kapabilitas | Surface | Status |
|-------|-------------|---------|--------|
| Freelancer directory | Hiring-oriented list, row comparison | `/freelancers` | Available |
| Public profiles | Storefront, reviews, CTA | `/freelancers/[username]` | Available |
| Nearby search | Lat/lng + radius | `/search/nearby`, geo service | Available |
| Work mode | REMOTE / ONSITE / HYBRID filters | Jobs & freelancers | Available |
| Marketplace pulse | Real aggregates (no fake metrics) | PublicStatsService, landing | Available |
| Public stats fallback | Honest empty states | Hero / activity panels | Available |
| UGC job translation | Cached EN/ID title & description | Job create | Conditional (`GOOGLE_TRANSLATE_API_KEY`) |
| Categories & taxonomy | Category / subcategory / skills | Taxonomy seed + filters | Available |

---

## 5. Monetization & V2 commerce

| Fitur | Kapabilitas | Surface | Status |
|-------|-------------|---------|--------|
| Plans FREE / PRO / AGENCY | Seeded entitlements | `/pricing`, subscriptions API | Available |
| Subscription upgrade | Paid gate | `/api/subscriptions/*` | Conditional (MOCK tanpa PSP) |
| Subscription cancel | `cancelAtPeriodEnd` | Subscriptions API | Available |
| Checkout UI | Stripe.js + Midtrans Snap + mock | `/checkout/mock` | Available |
| Stripe PaymentIntent | Create + webhook amount verify | `/api/payments/stripe/*` | Conditional — HMAC **Available** |
| Midtrans Snap | Create + notification signature | `/api/payments/midtrans/*` | Conditional — signature **Available** |
| Webhook rate limits | Abuse protection | Payment webhooks | Available |
| Escrow lifecycle | Lock → review 5d → 80/20 holdback | `/api/escrow/*`, money-jobs | Available |
| Escrow manual review | High-value threshold | Env threshold IDR 5M default | Available |
| Boosts catalog | 4 product types, paid activation | `/api/boosts` | Available |
| FEATURE_* guards | Route guards for paid features | Middleware/services | Available |
| Freelancer wallet | Balance tracking | Wallet model + APIs | Available |
| Payout requests | Request → admin approve → SENT | `/api/payouts/*`, `/admin/payouts` | Available (MOCK receipts) |
| Contract disputes | Admin resolve FAVOR_* / SPLIT | `/admin/disputes` | Available |
| Refunds | Admin-triggered | Disputes flow | Available |
| Reconciliation | PSP vs PaymentTransaction flags | `/admin/reconciliation` | Available |
| Donations | Record donation | `/api/donations` | Available (MOCK; ops caution) |
| AI recommendations | Daily batch + dashboard | Worker + `/api/recommendations` | Available |
| Payment notifications | Money events in-app | Notifications | Available |
| Audit log | Financial & moderation audit | Admin | Available |

**Fees:** escrow 2% · payout 0.5% — see [BUSINESS-MODEL.md](./BUSINESS-MODEL.md).

---

## 6. Trust, safety & admin

| Fitur | Kapabilitas | Surface | Status |
|-------|-------------|---------|--------|
| Report intake | Dedupe + SLA priority by category | `POST /api/reports` | Available |
| Moderation queue | Assign, notes, resolve | `/admin/reports` | Available |
| Hide job | Staff action | Admin APIs | Available |
| Suspend user | With suspension records | Admin APIs | Available |
| SLA escalation worker | Overdue tickets | `apps/worker` | Available |
| Appeals | User submit + admin review | `/admin/appeals` | Available |
| Verification queue | KYC-style approve/reject | `/admin/verification` | Available |
| Admin analytics | Real aggregates | `/admin/analytics` | Available |
| Admin users / jobs / bids / contracts | CRUD oversight | `/admin/*` | Available |
| Feature flags page | Read-only | `/admin/feature-flags` | Available |
| Donations admin | Review | `/admin/donations` | Available |
| Subscriptions admin | Oversight | `/admin/subscriptions` | Available |
| Outbound email/push alerts | Staff realtime | — | Roadmap |
| Multi-level on-call | — | — | Roadmap |

**Admin surface:** single app `apps/web` route group `/admin` — **`apps/admin` is stub only**.

---

## 7. i18n & marketing

| Fitur | Kapabilitas | Surface | Status |
|-------|-------------|---------|--------|
| EN / ID dictionaries | Core surfaces | `apps/web/locales/*.json` | Available |
| Default locale | **`id`** first visit | Middleware | Available |
| SEO locale routes | hreflang + canonical | `app/[locale]` | Available |
| Workspace locale URLs | `/en|id/client…` rewrite | Middleware | Available |
| Marketing pages | Pricing, how-it-works, help, early-access, contact, legal | `(marketing)/*` | Available |
| Auth i18n | Login/register/forgot fully localized | Auth pages | Available |
| Homepage hire/work mode | Intent switch + URL `?intent=` | Landing | Available |
| Newsletter footer | UI capture | Footer | Roadmap (backend) |

---

## 8. Client workspace

| Fitur | Surface | Status |
|-------|---------|--------|
| Dashboard | `/client` | Available |
| Jobs list + filters (`Needs review`) | `/client/jobs` | Available |
| Post new job | `/client/jobs/new` | Available |
| Job owner detail + bid review | `/client/jobs/[id]` | Available |
| Nearby talent | Client nearby view | Available |
| Settings + saved | `/settings` | Available |

---

## 9. Freelancer workspace

| Fitur | Surface | Status |
|-------|---------|--------|
| Dashboard | `/freelancer` | Available |
| Profile editor | `/freelancer/profile` | Available |
| Proposals list | `/freelancer/proposals` | Available |
| Nearby jobs | Freelancer nearby | Available |
| Settings + saved | `/settings` | Available |

---

## 10. Quality, architecture & ops

| Fitur | Kapabilitas | Status |
|-------|-------------|--------|
| Layering | route → service → policy → repository → Prisma | Available |
| Unit tests | Vitest — **82 passed** | Available |
| E2E HTTP smoke | Auth→job→bid→msg→report | Available |
| CI | typecheck, lint, unit, Postgres E2E | Available |
| Deploy | Vercel web + migrate + worker | Available |
| Security | CSRF, bcrypt, HttpOnly JWT, webhook crypto v2.1 | Available |
| HSTS optional | `NEXTWORK_ENABLE_HSTS=1` | Conditional |
| `apps/admin` separate | Placeholder port 3001 | Stub |

---

## 11. Roadmap (jangan dijual sebagai existing)

| Fitur | Catatan |
|-------|---------|
| Production PSP LIVE | Keys + webhook register + pilot txs |
| Invoice PDF | Compliance / B2B |
| Real bank payout API | Ganti MOCK receipt |
| WebSocket messaging | Ganti polling |
| Forgot-password email | Provider + templates |
| Agency multi-seat UX | Enum ready; product incomplete |
| Storybook / PWA / WCAG automation | UI backlog |
| CSP header + shared Redis rate-limit | Security hardening |
| Newsletter backend | Footer capture |

---

## User journey (end-to-end)

```
Landing (/id) → Browse jobs/freelancers → Register (role)
  → Client: post job → receive proposals → messages → shortlist/accept → contract → escrow pay
  → Freelancer: browse → structured proposal → messages → contract → deliver → wallet → payout
  → Admin: moderate reports → verify → disputes/payouts/reconciliation
```

Detail UX: `nextwork/docs/HOW-IT-WORKS.md` · `nextwork/docs/USER-GUIDE.md`.

---

*Mirror dari `nextwork/docs/FEATURE-CATALOG.md` · diperbarui 2026-08-29 dengan inventori HEAD*

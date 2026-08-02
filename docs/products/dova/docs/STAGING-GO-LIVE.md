# DOVA — Staging & Go-Live Checklist

**Last updated:** 31 July 2026  
**App HEAD:** `66ed52e`  
**Audience:** Engineering + business

---

## Prerequisites (credentials you need)

| Item | Where to get it |
|------|-----------------|
| Postgres URL | Neon, Supabase, or VPS |
| Redis URL | Upstash or VPS (recommended prod) |
| `JWT_SECRET` | `openssl rand -hex 32` |
| Paystack **test** keys | [Paystack Dashboard](https://dashboard.paystack.com) → Settings → API Keys |
| Vercel project | Frontend deploy |
| VPS or Railway | Backend Node host |
| (Optional) Resend | Contact + supplier emails |
| (Optional) FeedLog URL | Sibling app on subdomain |

---

## Step 1 — Backend (staging API)

```bash
# On API host
git clone https://github.com/dreamcraft17/dova.git
cd dova && npm ci
export USE_IN_MEMORY=false
export DATABASE_URL='postgresql://...'
export REDIS_URL='redis://...'
export JWT_SECRET='...'
export FRONTEND_URL='https://staging.dova.example'
export PAYSTACK_SECRET_KEY='sk_test_...'
export PAYSTACK_CURRENCY=NGN
npm run db:migrate
npm run db:seed:week3   # optional demo suppliers/products
npm run build
# PM2 example:
pm2 start apps/backend/dist/main.js --name dova-api
curl -s https://api-staging.dova.example/api/v1/health
```

**Paystack webhook (test mode):**  
`POST https://api-staging.dova.example/api/v1/payments/webhook`  
Events: `charge.success` (verify signature with secret).

---

## Step 2 — Frontend (Vercel)

| Env var | Example |
|---------|---------|
| `NEXT_PUBLIC_API_URL` | `https://api-staging.dova.example/api/v1` |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `pk_test_...` |
| `NEXT_PUBLIC_FEEDLOG_URL` | `https://feedback-staging.dova.example` (optional) |

Deploy from repo root (`vercel.json` builds shared + frontend).

---

## Step 3 — Smoke & UAT

```bash
API_URL=https://api-staging.dova.example/api/v1 npm run smoke:week4
```

Manual walkthrough (phone + desktop):

1. Register customer → browse → cart → checkout (pickup + delivery min order)
2. Pay with Paystack test card → order shows **paid**
3. Supplier register → admin approve → add product with image
4. Supplier mark order processing → shipped → delivered
5. Contact form → admin **Contacts** tab
6. Nav **Feedback** opens FeedLog (if configured)

**Paystack test cards:** see Paystack docs (e.g. `4084084084084081`, CVV任意, expiry future).

Target: **≥10 successful test transactions** before go/no-go.

---

## Step 4 — Go / no-go (business)

Copy from [current-phase.md](./current-phase.md) — all staging items must be checked before public soft launch.

---

## Local parity (dev machine)

**No Docker on dev machines** — prod/staging also use Node + managed Postgres (Vercel + VPS), not containers.

```bash
# Terminal 1 — DOVA (in-memory OK for UI demo)
cd dova && cp apps/frontend/.env.dev apps/frontend/.env.local
npm run dev
npm run smoke:week4   # with API up on :3000
```

**FeedLog (optional):** either point at a hosted instance or run FeedLog with a **remote** Postgres 17+ (Neon / Supabase with `vector` extension):

```bash
# apps/frontend/.env.local — use hosted FeedLog or your own deploy URL
NEXT_PUBLIC_FEEDLOG_URL=https://feedback.feedlog.ai

# Or self-host FeedLog without local Docker: deploy to Vercel/Cloudflare with Neon DATABASE_URL,
# then set NEXT_PUBLIC_FEEDLOG_URL to that URL. See ../feedlog/README.md.
```

---

## Blockers (need human action)

- [ ] Staging hostnames + DNS
- [ ] Paystack merchant / test account keys in secret store
- [ ] Business sign-off on support channel + launch date

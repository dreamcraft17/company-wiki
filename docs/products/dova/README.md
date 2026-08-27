# DOVA

Agricultural marketplace MVP — connects buyers with verified suppliers in Nigeria (NGN).

**Monorepo:** NestJS API · Next.js storefront · shared TypeScript types  
**Stack:** Node.js 20 · NestJS 11 · Next.js 16 · PostgreSQL · Redis (optional) · Paystack  
**UI:** DOVA-Startup brand (green / gold)

**Status:** MVP **codebase complete** · **v0.5.0** · staging live  
**Staging:** [dova.dntech.id](https://dova.dntech.id) · API [api.dova.dntech.id](https://api.dova.dntech.id/api/v1/health)  
**Tests:** 121 unit tests green

---

## Quick start (local, no Docker)

```bash
npm install
cp .env.dev .env
cp apps/backend/.env.dev apps/backend/.env
cp apps/frontend/.env.dev apps/frontend/.env.local
npm run dev
```

| Service    | URL |
|------------|-----|
| Frontend   | http://localhost:3001 |
| API health | http://localhost:3000/api/v1/health |

Default local mode uses **in-memory** data (`USE_IN_MEMORY=true`) so you can run UI + API without PostgreSQL/Redis.

### Demo accounts

| Role     | Email                  | Password       |
|----------|------------------------|----------------|
| Admin    | `admin@dova.local`     | `admin1234`    |
| Supplier | `supplier@dova.local`  | `supplier1234` |

---

## Product surface (v0.5.0)

| Area | Routes / notes |
|------|----------------|
| Storefront | `/`, `/products`, `/products/[id]`, `/about`, `/contact` |
| Commerce | `/cart`, `/checkout`, Paystack verify, `/customer/history` |
| Auth | `/auth/login`, `/auth/register`, `/auth/supplier-register`, Remember Me |
| Supplier | `/supplier` — products (image upload), stock, orders |
| Admin | `/admin` — users (full CRUD), suppliers, products, orders, contacts |
| Feedback | `/feedback` — native idea board (roadmap, changelog) |

**Minimum order (NGN):** pickup **₦3,000** · delivery **₦5,000**.

---

## Documentation

Canonical wiki: **`dova-company-wiki/`** (this repo).  
Mirror: `company-wiki/docs/products/dova/`.  
Sync: `./dova-company-wiki/scripts/sync-docs.sh from-wiki`

| Doc | Purpose |
|-----|---------|
| [00_INDEX.md](./00_INDEX.md) | Full doc index |
| [current-phase.md](./current-phase.md) | Stakeholder phase snapshot |
| [docs/STATUS-LENGKAP.md](./docs/STATUS-LENGKAP.md) | Complete technical status |
| [docs/CURRENT-IMPLEMENTATION.md](./docs/CURRENT-IMPLEMENTATION.md) | PRD baseline |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | Release history |

---

## Deployment (VPS staging)

```bash
npm ci && npm run build && npm run db:migrate
pm2 restart dova-api dova-web --update-env
```

See [docs/VPS-DEPLOY.md](./docs/VPS-DEPLOY.md) and [docs/RUNBOOK.md](./docs/RUNBOOK.md).

---

*DOVA — Building a better food supply network from Nigerian farmers to consumers.*

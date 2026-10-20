# PacaRent — Documentation Index

> **Author:** Dozer  
> **Date:** 2026-10-18  
> **Status:** MVP · testing production hybrid · membership (mock) live

**Product:** Platform plus one / teman kencan (booking, bukan match chat)  
**Company:** DN Tech · **Owner:** Dozer (CEO + Tech Lead + PM)  
**Repo:** [`dreamcraft17/pacarent`](https://github.com/dreamcraft17/pacarent)  
**Local path:** `pacarent/`  
**UpdatedAt:** 18 October 2026  
**App HEAD:** `ca1769e`

| Area | URL / host |
|------|------------|
| Web (Vercel) | Preview/production SPA — env `VITE_API_BASE` |
| API (VPS) | `https://api.pacarent.dntech.id` |
| Stack | ASP.NET Core 8 · React/Vite · PostgreSQL · PM2 · Nginx |

## Living docs (mirror dari app repo)

| File | Topic |
|------|--------|
| [README.md](./README.md) | Onboarding repo |
| [current-implementation.md](./current-implementation.md) | Baseline PRD snapshot (curated) |
| [docs/IMPLEMENTATION-STATUS.md](./docs/IMPLEMENTATION-STATUS.md) | FR/NFR vs PRD |
| [docs/PRD.md](./docs/PRD.md) | Product requirements |
| [docs/MONETIZATION-SUBSCRIPTION.md](./docs/MONETIZATION-SUBSCRIPTION.md) | Tier Plus/Pro + mock billing |
| [docs/DESIGN-V3.md](./docs/DESIGN-V3.md) | UI v3 shell & routes |
| [docs/DATING-UX-DIRECTION.md](./docs/DATING-UX-DIRECTION.md) | UX direction (discover → booking) |
| [docs/COPY-LEXICON.md](./docs/COPY-LEXICON.md) | Istilah pendamping vs mitra |
| [docs/BUSINESS-PLAN-2026.md](./docs/BUSINESS-PLAN-2026.md) | Pointer ke business plan PacaRent (SSOT private-wiki) |

## Marketing & research

| File | Topic |
|------|--------|
| [docs/marketing/GEN-Z-COPY-HOOKS.md](./docs/marketing/GEN-Z-COPY-HOOKS.md) | Copy hooks · `productCopy.ts` |
| [docs/research/dating-app-membership-patterns-2026-10-17.md](./docs/research/dating-app-membership-patterns-2026-10-17.md) | Bumble/Tinder/TanTan → PacaRent tiers |
| [docs/research/pacarent-design-system/](./docs/research/pacarent-design-system/) | Design system research pack |

## Ops / deploy guides

| File | Topic |
|------|--------|
| [docs/guides/VPS-DEPLOY-CHEATSHEET.md](./docs/guides/VPS-DEPLOY-CHEATSHEET.md) | **Cheat sheet** — `git pull` auto-deploy |
| [docs/guides/VPS-DEPLOY-NO-DOCKER.md](./docs/guides/VPS-DEPLOY-NO-DOCKER.md) | Postgres + API + Nginx |
| [docs/guides/PAYMENT-DOKU.md](./docs/guides/PAYMENT-DOKU.md) | DOKU checkout (booking) |
| [docs/guides/VERCEL-QUICKSTART.md](./docs/guides/VERCEL-QUICKSTART.md) | Frontend Vercel |
| [docs/guides/DEPLOY-VERCEL-NETLIFY.md](./docs/guides/DEPLOY-VERCEL-NETLIFY.md) | Hybrid deploy lengkap |

## Sync dari app repo

```bash
# From dozer monorepo root
APP=pacarent
WIKI=company-wiki/docs/products/pacarent

cp $APP/README.md $WIKI/README.md
cp $APP/docs/IMPLEMENTATION-STATUS.md $APP/docs/PRD.md $APP/docs/SRS.md $APP/docs/SDD.md $WIKI/docs/
cp $APP/docs/MONETIZATION-SUBSCRIPTION.md $APP/docs/DESIGN-V3.md $APP/docs/DATING-UX-DIRECTION.md $APP/docs/COPY-LEXICON.md $WIKI/docs/
cp $APP/docs/guides/*.md $WIKI/docs/guides/
mkdir -p $WIKI/docs/marketing $WIKI/docs/research
cp $APP/docs/marketing/*.md $WIKI/docs/marketing/ 2>/dev/null || true
cp $APP/docs/research/dating-app-membership-patterns-2026-10-17.md $WIKI/docs/research/
cp -R $APP/docs/research/pacarent-design-system $WIKI/docs/research/ 2>/dev/null || true
# Hand-edit: current-implementation.md, this 00_INDEX, portfolio indexes
```

Secrets & path VPS (tanpa credential): repo **`private-wiki`** → `dntech/infra/PACARENT-VPS-OPS.md` (Dozer-only).

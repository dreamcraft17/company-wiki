# PacaRent — Documentation Index

> **Author:** Dozer  
> **Date:** 2026-10-14  
> **Status:** MVP · testing production hybrid

**Product:** Platform sewa pacar / teman kencan (booking + escrow)  
**Company:** DN Tech · **Owner:** Dozer (CEO + Tech Lead + PM)  
**Repo:** [`dreamcraft17/pacarent`](https://github.com/dreamcraft17/pacarent)  
**Local path:** `pacarent/`  
**UpdatedAt:** 14 October 2026  
**App HEAD:** `8bda7c9`

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
| [docs/SRS.md](./docs/SRS.md) | Software requirements |
| [docs/SDD.md](./docs/SDD.md) | System design |
| [docs/DATING-UX-DIRECTION.md](./docs/DATING-UX-DIRECTION.md) | UX direction (dating-style discover) |

## Ops / deploy guides

| File | Topic |
|------|--------|
| [docs/guides/VPS-DEPLOY-CHEATSHEET.md](./docs/guides/VPS-DEPLOY-CHEATSHEET.md) | **Cheat sheet** — `git pull` auto-deploy |
| [docs/guides/VPS-DEPLOY-NO-DOCKER.md](./docs/guides/VPS-DEPLOY-NO-DOCKER.md) | Postgres + API + Nginx |
| [docs/guides/VERCEL-QUICKSTART.md](./docs/guides/VERCEL-QUICKSTART.md) | Frontend Vercel |
| [docs/guides/DEPLOY-VERCEL-NETLIFY.md](./docs/guides/DEPLOY-VERCEL-NETLIFY.md) | Hybrid deploy lengkap |

## Sync dari app repo

```bash
# From dozer monorepo root
APP=pacarent
WIKI=company-wiki/docs/products/pacarent

cp $APP/README.md $WIKI/README.md
cp $APP/docs/IMPLEMENTATION-STATUS.md $APP/docs/PRD.md $APP/docs/SRS.md $APP/docs/SDD.md $WIKI/docs/
cp $APP/docs/guides/*.md $WIKI/docs/guides/
cp $APP/docs/DATING-UX-DIRECTION.md $WIKI/docs/ 2>/dev/null || true
```

Secrets & path VPS (tanpa credential): repo **`private-wiki`** → `dntech/infra/PACARENT-VPS-OPS.md` (Dozer-only).

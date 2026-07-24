# DuaVulnScanner (DVS)

All-in-one penetration testing platform: **Scanner · Reporting · Tracking**  
Company: **DN Tech** · Owner: **Dozer**

| | |
|---|---|
| Status | MVP Week 1 scaffold |
| Specs | [docs/PRD/](./docs/PRD/) |
| Target repo | `github.com/dreamcraft17/dvs` |
| Stack | NestJS · Next.js · PostgreSQL · Prisma |

## Ethics / scope

MVP scanner performs **passive** checks only (headers, cookies, TLS expiry, bounded discovery).  
Weaponized exploit payloads are **out of repo** (see PRD §7).

## Quick start

```bash
cd dvs
cp apps/backend/.env.example apps/backend/.env
# set DATABASE_URL (Postgres) or leave empty for future in-memory mode

cd apps/backend && npm install && npx prisma generate && npm run start:dev
# API http://localhost:4100/api/v1/health

cd apps/frontend && npm install && npm run dev
# UI http://localhost:3100
```

## Demo seed (after migrate)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@dvs.local` | `Admin123!` |

## Docs

- [PRD](./docs/PRD/DuaVulnScanner_PRD.md)
- [SRS](./docs/PRD/DuaVulnScanner_SRS.md)
- [SDD](./docs/PRD/DuaVulnScanner_SDD.md)
- Wiki mirror: `company-wiki/docs/products/dvs/`

## Monorepo

```
dvs/
├── apps/backend/   # NestJS API :4100
├── apps/frontend/  # Next.js UI :3100
└── docs/PRD/
```

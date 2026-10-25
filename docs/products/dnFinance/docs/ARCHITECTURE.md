# dnAccounting — Architecture (V2)

**UpdatedAt:** 2 August 2026

## High-level

```
┌─────────────────┐     HTTPS      ┌──────────────────┐
│  React Frontend │ ◄────────────► │  NestJS API      │
│  Vite :5173     │   /api/v1      │  :3000           │
└─────────────────┘                └────────┬─────────┘
                                            │
              ┌─────────────────────────────┼─────────────────────────────┐
              │                             │                             │
              ▼                             ▼                             ▼
     ┌────────────────┐           ┌────────────────┐           ┌────────────────┐
     │ File store     │           │ PostgreSQL     │           │ Redis          │
     │ .data/store    │           │ (optional)     │           │ (optional)     │
     │ .json          │           │ JSONB snapshot │           │ Bull + cache   │
     └────────────────┘           └────────────────┘           └────────────────┘
                                            │
                                            ▼
                                  ┌────────────────┐
                                  │ Gmail SMTP     │
                                  │ (optional)     │
                                  └────────────────┘
```

## Monorepo layout

| Package | Role |
|---------|------|
| `apps/backend` | NestJS REST API, Swagger, cron scheduler |
| `apps/frontend` | SPA, Redux auth, Tailwind UI |
| `shared` | COA templates, tax math, validators |

## Backend module graph

```
AppModule
├── DatabaseModule      (TypeORM when DATABASE_URL)
├── EmailModule         (Nodemailer)
├── QueueModule         (Bull or in-memory)
├── CacheModule         (Redis or Map)
├── ApprovalModule      (JWT approval tokens)
├── SchedulerModule     (node-cron via @nestjs/schedule)
├── AppController       (all REST routes)
└── AppService          (domain logic + persistence)
```

## Data persistence strategy (V2)

1. **Default (local dev):** `persistence.ts` reads/writes `.data/store.json`
2. **With Postgres:** dual-write — file store + `app_snapshots` JSONB row (id=1)
3. **Future (Phase 3):** normalized TypeORM entities per `database/migrations/001_init.sql`

## Key flows

### Invoice send → GL
`createInvoice` → `sendInvoice` → `postGl` (AR debit, Revenue credit, PPN payable)

### Bill approval → GL
`submitBillApproval` → email token → `approveBill` → `postGl` (Expense, AP, PPh23)

### Journal approval
`submitJournalForApproval` → pending → `approveJournal` → `postJournal`

## Security

- JWT Bearer auth on protected routes
- RBAC per endpoint (`requireRole`, `canRoleApprove`)
- Rate limit: 100 req/min/IP
- Approval tokens: 24h JWT with `purpose: approval`

## Deployment target (staging)

- **Container:** `Dockerfile` → Cloud Run
- **CI:** `.github/workflows/deploy-staging.yml`
- **Frontend:** Static host (Vercel/Cloudflare) → `VITE_API_URL`

See [DEPLOY.md](./DEPLOY.md).

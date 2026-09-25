# Threads Automation (NestJS v3.2) — Implementation Status

> **Status:** Active development · **Last updated:** 2026-09-14 · **Author:** Dozer

## What this is

A **second, separate implementation** of Threads posting automation for `@dntech`, distinct from the Playwright-based tool documented in the parent [../..](../../README.md) (local repo `auto/`, v2.0/v3.0). This one is a static-token, official-Graph-API architecture:

- **Repo:** `threads-automation/` (dozer monorepo) — NestJS 10 backend (`apps/backend`) + Next.js 14 frontend (`apps/frontend`)
- **Specs:** mirrored in this folder from `docs/threads-auto/` in the app repo (`00_START_HERE_v3.2.md`, PRD/SRS/SDD v3.1, `QUICK_REFERENCE_v3.2_STATIC_TOKEN.md`)
- **Publishing mechanism:** official Threads Graph API with a static long-lived token (AWS Secrets Manager or `.env`), not browser automation
- **No login flow for content creators** — single shared internal JWT login (`INTERNAL_EMAIL`/`INTERNAL_PASSWORD`), approval workflow is Dozer-only

Both tools ultimately publish to the same `@dntech` account via different mechanisms — see [../../README.md](../../README.md) for the original Playwright tool's status.

## Ringkasan status (verified 2026-09-14)

| Layer | Status | Notes |
|-------|--------|-------|
| Backend (NestJS) | **Done** | auth, generate, posts (approve/reject/edit/schedule/publish-now/bulk-approve), threads-api (2-step publish + retry + circuit breaker), scheduling (publish cron every 1min, SLA cron every 15min, cost-alert cron daily), analytics, costs, brand-guidelines, LLM provider manager (Gemini primary / OpenAI fallback / mock) |
| Frontend (Next.js) | **Done** | Login, Desk (overview), Generate, Approval queue, Analytics, Costs, Brand guidelines — built this session; previously only scaffolding (`AppShell`/`StatusBadge`) existed with no pages |
| Database (Prisma) | **Done** | 8 models: `threads_posts`, `approval_logs`, `threads_publish_log`, `llm_cost_log`, `brand_guidelines`, `engagement_metrics`, `posting_heatmap`, `third_party_tokens` |
| Tests | **29/29 passing** | 10 Jest suites across posts, generate, threads-api, LLM manager, config, prompt-builder, circuit-breaker, fingerprinting |
| Build | **Clean** | `npm run build` passes for both workspaces after generating the Prisma client and fixing one pre-existing `CronExpression` typo in `sla.scheduler.ts` |

## PRD v3.1 feature coverage (F1–F8)

All eight locked-in features are implemented end-to-end: batch generation, multi-provider LLM, human approval gate, scheduling & publishing, best-posting-time recommendations, brand guidelines management, cost tracking, and the analytics dashboard. Full detail: [ENGINEERING-REVIEW-2026-09-14.md § Pengecekan Kelengkapan Product/PRD](./ENGINEERING-REVIEW-2026-09-14.md#4-pengecekan-kelengkapan-productprd).

## Open findings (six-lens engineering review, 2026-09-14)

A full backend/frontend/fullstack/product/AI-security/QA review was completed and is mirrored in full at [ENGINEERING-REVIEW-2026-09-14.md](./ENGINEERING-REVIEW-2026-09-14.md). Highlights, none yet fixed:

| Priority | Item |
|---|---|
| Critical | No output-side content-policy re-check between LLM generation and publish — a crafted topic can currently produce content that reaches the real `@dntech` account unfiltered. |
| Critical | `THREADS_TOKEN_SOURCE` defaults to plaintext `.env`, not AWS Secrets Manager, unless explicitly overridden. |
| High | Frontend never sends `scheduleTimezone` when scheduling a post — local times get silently interpreted as UTC. |
| High | No brute-force protection on the shared internal login. |

See the linked review for the full severity table and the 12-item consolidated action plan.

## Verifikasi lokal

```bash
cd threads-automation
npm install
npx prisma generate --schema apps/backend/prisma/schema.prisma
npm run build
npm test -w threads-automation-api
npm run dev   # API :3000 · Web :3100
```

# Threads Automation — Documentation Index

**Product:** Threads Automation Posting System  
**Repository / path:** `auto/` · package `threads-automation`  
**Status:** **v2.0** Live Publish & Media · tanpa Docker · live Conditional  
**Owner:** Dozer (CEO + Tech Lead + PM) · **Company:** DN Tech  
**UpdatedAt:** 16 September 2026
**Spec:** PRD/SRS/SDD v2.0 (+ v1.0 Draft)

---

## Mulai di sini

| Peran | Dokumen |
|-------|---------|
| Pakai app | [docs/USER-GUIDE.md](./docs/USER-GUIDE.md) |
| Cara kerja | [docs/HOW-IT-WORKS.md](./docs/HOW-IT-WORKS.md) |
| Deploy VPS | [docs/DEPLOY.md](./docs/DEPLOY.md) |
| Live mode | [docs/RUNBOOK.md](./docs/RUNBOOK.md) |

## Living docs

| File | Topic |
|------|-------|
| [README.md](./README.md) | Product overview + quick start |
| [docs/00_INDEX.md](./docs/00_INDEX.md) | Docs index lengkap |
| [docs/USER-GUIDE.md](./docs/USER-GUIDE.md) | **Cara pakai** |
| [docs/HOW-IT-WORKS.md](./docs/HOW-IT-WORKS.md) | **Cara kerja** |
| [docs/DEPLOY.md](./docs/DEPLOY.md) | Deploy tanpa Docker |
| [docs/RUNBOOK.md](./docs/RUNBOOK.md) | Enable live publish |
| [docs/PROJECT-OVERVIEW.md](./docs/PROJECT-OVERVIEW.md) | Apa itu produk |
| [docs/CURRENT-IMPLEMENTATION.md](./docs/CURRENT-IMPLEMENTATION.md) | Baseline kode |
| [docs/IMPLEMENTATION-STATUS.md](./docs/IMPLEMENTATION-STATUS.md) | Status v2.0 |
| [docs/FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md) | Available / Conditional / Roadmap |
| [docs/NEXT-PRD-BRIEF.md](./docs/NEXT-PRD-BRIEF.md) | Briefing PRD berikutnya |
| [docs/API.md](./docs/API.md) | API ringkas |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Arsitektur |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | Changelog |
| [docs/ENGINEERING-REVIEW-2026-09-16.md](./docs/ENGINEERING-REVIEW-2026-09-16.md) | CTO/API review + 90-day operating plan |

## Specs

| File | Type |
|------|------|
| [docs/PRD/PRD-v2.0-Live-Publish-Media.md](./docs/PRD/PRD-v2.0-Live-Publish-Media.md) | PRD v2.0 |
| [docs/PRD/SRS-v2.0-Functional-Requirements.md](./docs/PRD/SRS-v2.0-Functional-Requirements.md) | SRS v2.0 |
| [docs/PRD/SDD-v2.0-System-Design.md](./docs/PRD/SDD-v2.0-System-Design.md) | SDD v2.0 |
| [THREADS_AUTOMATION_PRD.md](./THREADS_AUTOMATION_PRD.md) | PRD v1.0 |
| [THREADS_AUTOMATION_SRS.md](./THREADS_AUTOMATION_SRS.md) | SRS v1.0 |
| [THREADS_AUTOMATION_SDD.md](./THREADS_AUTOMATION_SDD.md) | SDD v1.0 |

---

## Second implementation: NestJS v3.2 (separate repo, official Graph API)

A different codebase (`threads-automation/` — NestJS + Next.js, static-token Graph API, no Playwright) also automates `@dntech`. It is **not** part of this `auto/` repo's history. See:

| File | Topic |
|------|-------|
| [docs/nestjs-v3.2/IMPLEMENTATION-STATUS.md](./docs/nestjs-v3.2/IMPLEMENTATION-STATUS.md) | Current build status, verified 2026-09-14 |
| [docs/nestjs-v3.2/ENGINEERING-REVIEW-2026-09-14.md](./docs/nestjs-v3.2/ENGINEERING-REVIEW-2026-09-14.md) | Six-lens review: backend, frontend, fullstack, product, AI security, QA |
| [docs/nestjs-v3.2/00_START_HERE_v3.2.md](./docs/nestjs-v3.2/00_START_HERE_v3.2.md) | Onboarding doc for that codebase |
| [docs/nestjs-v3.2/THREADS_AUTOMATION_PRD_v3.1.md](./docs/nestjs-v3.2/THREADS_AUTOMATION_PRD_v3.1.md) · [SRS](./docs/nestjs-v3.2/THREADS_AUTOMATION_SRS_v3.1.md) · [SDD](./docs/nestjs-v3.2/THREADS_AUTOMATION_SDD_v3.1.md) | PRD/SRS/SDD v3.1 |
| [docs/nestjs-v3.2/QUICK_REFERENCE_v3.2_STATIC_TOKEN.md](./docs/nestjs-v3.2/QUICK_REFERENCE_v3.2_STATIC_TOKEN.md) | Env vars, endpoints, cron jobs cheat sheet |

# dnPeople HRIS — Documentation Index

> **Author:** Dozer  
> **Date:** 2026-09-25

**Product**: dnPeople — Human Resource Information System  
**Repository**: `dnpeople` → [github.com/dreamcraft17/dnpeople](https://github.com/dreamcraft17/dnpeople)  
**Status**: MVP 1–5 + PRD v5–**v15.0** / v14.0 / v13.0 / v12.1 / v11.1 complete · **Release v1.1.2** · **Legal v1.2** · **assistant v17** (Professional+) · admin catalog + trial months · ops gates Conditional  
**Owner**: Dozer (CEO + Tech Lead + PM)  
**Company**: DN Tech (PT. Dozer Napitupulu Technology)  
**Brand**: DnPeople  
**UpdatedAt**: September 25, 2026  
**Spec Version**: PRD/SRS/SDD v3.1 + PRD v4–**v15.0** / v11.1 / v17 assistant  
**Codebase**: **108** frontend pages · **63** backend route modules · **138** Prisma models · **214/214** tests · **16** a11y (Playwright + axe)  
**HEAD**: `dnpeople` main · **`55ec9ae`** (AI assistant Professional+; admin-editable plan catalog) · tag **[v1.1.2](https://github.com/dreamcraft17/dnpeople/releases/tag/v1.1.2)**

> **Soft launch:** [docs/RELEASE-READY.md](./docs/RELEASE-READY.md) · [docs/LAUNCH-GATE-CHECKLIST.md](./docs/LAUNCH-GATE-CHECKLIST.md)  
> **Baseline:** [docs/CURRENT-IMPLEMENTATION.md](./docs/CURRENT-IMPLEMENTATION.md) — next product scope PRD v4 Module 4–8 (product PRD **v16.0**)  
> **Demo accounts:** [docs/DEMO-ACCOUNTS.md](./docs/DEMO-ACCOUNTS.md) — public demo sandbox **FREE** tier  
> **Payment gateway:** **DOKU is active/default/live**; Xendit and Midtrans remain admin-switchable alternatives. See [docs/PG/README.md](./docs/PG/README.md) · **Xendit setup (test mode):** [docs/xendit/XENDIT-PAYMENT-SETUP.md](./docs/xendit/XENDIT-PAYMENT-SETUP.md)  
> **Admin monitoring:** `/admin/health` tracks API errors/latency, DOKU webhooks, DB/queue health, and alert acknowledgement.  
> **Plan catalog:** SUPER_ADMIN `/admin/tier-pricing` is SSOT for list prices, trial months (including FREE), and marketing copy; public `GET /subscription/plans`. Starter trial **4** months / Professional **2** months — revocable.  
> **Evidence timeline (P0 exception & evidence layer):** [docs/EVIDENCE-TIMELINE-IMPLEMENTATION.md](./docs/EVIDENCE-TIMELINE-IMPLEMENTATION.md)  
> **INTERNAL PRD (Dozer-only):** Early Release program spec lives in `private-wiki/dnpeople/internal/` — not mirrored here.

---

## Core Specs (PRD folder)

| File | Topik |
|------|-------|
| [PRD/dnpeople-prd.md](./PRD/dnpeople-prd.md) | **PRD** — Product Requirements Document v3.1 |
| [PRD/dnpeople-srs.md](./PRD/dnpeople-srs.md) | **SRS** — Software Requirements Specification v3.1 |
| [PRD/dnpeople-sdd.md](./PRD/dnpeople-sdd.md) | **SDD** — Software Design Document v3.1 |
| [PRD/dnpeople-prd-v15.0-admin-dashboard.md](./PRD/dnpeople-prd-v15.0-admin-dashboard.md) | **PRD v15.0** — Internal admin console |
| [docs/PRD/dnpeople-prd-v17.0-hr-chatbot-rag-id.md](./docs/PRD/dnpeople-prd-v17.0-hr-chatbot-rag-id.md) | **PRD v17.0** — HR assistant tools + RAG |
| [PRD/dnpeople-prd-v14.0-tutorial-onboarding.md](./PRD/dnpeople-prd-v14.0-tutorial-onboarding.md) | **PRD v14.0** — In-app tutorial & onboarding (no video) |
| [PRD/dnpeople-srs-v14.0-tutorial-requirements.md](./PRD/dnpeople-srs-v14.0-tutorial-requirements.md) | **SRS v14.0** — Tutorial/KB acceptance |
| [PRD/dnpeople-sdd-v14.0-tutorial-implementation.md](./PRD/dnpeople-sdd-v14.0-tutorial-implementation.md) | **SDD v14.0** — Tutorial/KB technical |
| [PRD/dnpeople-prd-v13.0-talent-matrix-succession.md](./PRD/dnpeople-prd-v13.0-talent-matrix-succession.md) | **PRD v13.0** — Talent matrix & succession |
| [PRD/dnpeople-prd-v11.1-landing-page-website-id.md](./PRD/dnpeople-prd-v11.1-landing-page-website-id.md) | **PRD v11.1** — Landing page website |
| [PRD/dnpeople-prd-v11.0-go-live-execution-id.md](./PRD/dnpeople-prd-v11.0-go-live-execution-id.md) | **PRD v11.0** — Go-live execution & beta launch |
| [PRD/dnpeople-prd-v12.1-free-tier-50-emp-final.md](./PRD/dnpeople-prd-v12.1-free-tier-50-emp-final.md) | **PRD v12.1** — FREE tier 50 emp final (LOCKED) |
| [PRD/dnpeople-srs-v12.1-free-tier-50-emp-final.md](./PRD/dnpeople-srs-v12.1-free-tier-50-emp-final.md) | **SRS v12.1** — FREE 50 emp acceptance |
| [PRD/dnpeople-sdd-v12.1-free-tier-50-emp-final.md](./PRD/dnpeople-sdd-v12.1-free-tier-50-emp-final.md) | **SDD v12.1** — FREE 50 emp technical |
| [PRD/dnpeople-prd-v12.0-tier-consolidation-id.md](./PRD/dnpeople-prd-v12.0-tier-consolidation-id.md) | **PRD v12.0** — Tier consolidation |
| [PRD/dnpeople-prd-v10.0-operations-launch-readiness-id.md](./PRD/dnpeople-prd-v10.0-operations-launch-readiness-id.md) | **PRD v10.0** — Ops & launch readiness |
| [PRD/dnpeople-prd-v8.0-security-stability-fixes-id.md](./PRD/dnpeople-prd-v8.0-security-stability-fixes-id.md) | **PRD v8.0** — Security & stability |

## Payment gateway

| File | Topik |
|------|-------|
| [docs/xendit/XENDIT-PAYMENT-SETUP.md](./docs/xendit/XENDIT-PAYMENT-SETUP.md) | **Setup operasional** — test mode, env, webhook, checklist |
| [docs/xendit/dnpeople-prd-xendit-payment-v1.0-id.md](./docs/xendit/dnpeople-prd-xendit-payment-v1.0-id.md) | **PRD Xendit v1.0** (+ [SRS](./docs/xendit/dnpeople-srs-xendit-payment-v1.0-id.md) / [SDD](./docs/xendit/dnpeople-sdd-xendit-payment-v1.0-id.md)) |
| [docs/PG/README.md](./docs/PG/README.md) | **Midtrans legacy** — diganti Xendit Agustus 2026 |

## Implementation docs (`docs/`)

| File | Deskripsi |
|------|-----------|
| [docs/NEXT-PRD-BRIEF.md](./docs/NEXT-PRD-BRIEF.md) | **Dasar utuh PRD berikutnya** (v16.0 Module 4) |
| [docs/CURRENT-IMPLEMENTATION.md](./docs/CURRENT-IMPLEMENTATION.md) | **Baseline kanonik** — setelah v15.0 + Xendit |
| [docs/RELEASE-READY.md](./docs/RELEASE-READY.md) | Soft-launch Agustus — kode vs ops |
| [docs/FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md) | Katalog fitur existing / conditional / roadmap |
| [docs/IMPLEMENTATION-STATUS.md](./docs/IMPLEMENTATION-STATUS.md) | Matrix status per MVP/PRD |
| [docs/DEMO-ACCOUNTS.md](./docs/DEMO-ACCOUNTS.md) | Akun demo seed (FREE tier) |
| [docs/LAUNCH-GATE-CHECKLIST.md](./docs/LAUNCH-GATE-CHECKLIST.md) | Go/no-go Agustus 2026 |
| [docs/SLA-COMMITMENT-RPO-RTO.md](./docs/SLA-COMMITMENT-RPO-RTO.md) | RPO/RTO commitments |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | Riwayat versi (**v1.1.1** + Unreleased Sep 2026; counts in Unreleased may lag `npm test`) |
| [docs/legal/PRIVACY-POLICY.md](./docs/legal/PRIVACY-POLICY.md) | Kebijakan privasi (ringkas; teks halaman di `legal2/`) |
| [docs/legal/TERMS-OF-SERVICE.md](./docs/legal/TERMS-OF-SERVICE.md) | Syarat layanan (ringkas; teks halaman di `legal2/`) |
| [docs/A11Y-TESTING.md](./docs/A11Y-TESTING.md) | WCAG 2.2 AA — Playwright + axe CI |
| [docs/CHAOS-ENGINEERING.md](./docs/CHAOS-ENGINEERING.md) | Chaos engineering (VPS/PM2) |
| [docs/DNPEOPLE-PANDUAN-BUSINESS-DEVELOPMENT.md](./docs/DNPEOPLE-PANDUAN-BUSINESS-DEVELOPMENT.md) | Panduan BD/sales (ICP, demo, handoff) |
| [docs/DNPEOPLE-BISNIS-FITUR-LAYANAN.md](./docs/DNPEOPLE-BISNIS-FITUR-LAYANAN.md) | Bisnis, paket, layanan, fitur per modul (rinci) |
| [docs/DNPEOPLE-HRIS-OVERVIEW.md](./docs/DNPEOPLE-HRIS-OVERVIEW.md) | HRIS overview konsolidasi |
| [docs/PRD/MARKET-FEATURE-OPPORTUNITY-2026-09-17.md](./docs/PRD/MARKET-FEATURE-OPPORTUNITY-2026-09-17.md) | Review fitur implementasi terbaru, kategori pasar, segmen prioritas, dan rencana validasi |
| [docs/PRD/DNPEOPLE-WELCOME-SEO-UX-RESEARCH-2026-09-17.md](./docs/PRD/DNPEOPLE-WELCOME-SEO-UX-RESEARCH-2026-09-17.md) | Riset SEO, market category, UX, copy, dan prioritas optimasi landing page `/welcome` |
| [docs/research/feature-research-2026-09-19/2026-09-19_decision.md](./docs/research/feature-research-2026-09-19/2026-09-19_decision.md) | Evidence pack riset fitur: wedge, segmentasi, competitive evidence, UX journey, dan rencana validasi |
| [docs/REST-API-OPENAPI-HARDENING-2026-09-18.md](./docs/REST-API-OPENAPI-HARDENING-2026-09-18.md) | REST API hardening — OpenAPI coverage 3% → ~100%, digenerate dari schema Zod, fix `POST /tenants/search` |
| [docs/00_INDEX.md](./docs/00_INDEX.md) | Index mirror repo `dnpeople/docs/` |

## Ops (`ops/`)

| File | Deskripsi |
|------|-----------|
| [ops/runbooks/launch-day.md](./ops/runbooks/launch-day.md) | Prosedur launch day |
| [ops/datadog/](./ops/datadog/) | Agent / scrape config |
| [ops/alerting/alert-rules.yaml](./ops/alerting/alert-rules.yaml) | Alert monitor stubs |
| [ops/pen-test-staging-prep.md](./ops/pen-test-staging-prep.md) | Persiapan pen-test |

## Sync dari repo

```bash
# Dari root monorepo / sibling folders:
cp dnpeople/docs/*.md company-wiki/docs/products/dnPeople/docs/
cp -R dnpeople/docs/xendit company-wiki/docs/products/dnPeople/docs/
cp -R dnpeople/docs/PG company-wiki/docs/products/dnPeople/docs/
cp dnpeople/README.md company-wiki/docs/products/dnPeople/README.md
# Curated PRD baseline is product-root current-implementation.md — summarize, do not overwrite with full CURRENT-IMPLEMENTATION
# Update 00_INDEX.md di wiki jika status berubah
```

---

*Last Updated: September 25, 2026*

# dnShop Finance — Documentation Index

**Product:** dnShop Finance — dashboard keuangan + pembukuan bonus untuk seller Shopee Indonesia  
**Repository / path:** `dnShopee/`  
**Status:** **v2.2.1** accounting depth + QA contracts (5 Sep 2026) · next **v3.0 Multi-marketplace**  
**Owner:** Dozer (CEO + Tech Lead + PM) · **Company:** DN Tech  
**Prod:** Web `https://shop.dntech.id` · API `https://api.shop.dntech.id`  
**UpdatedAt:** 5 September 2026  

> **Canonical app docs:** workspace `dnShopee/docs/` + `dnShopee/prd/`  
> **This folder:** company-wiki mirror — keep in sync when shipping.

---

## Mulai di sini

| Peran | Dokumen |
|-------|---------|
| Status fitur | [docs/STATUS.md](./docs/STATUS.md) |
| Baseline + next PRD | [docs/docs.md](./docs/docs.md) |
| Briefing PRD berikutnya | [docs/NEXT-PRD-BRIEF.md](./docs/NEXT-PRD-BRIEF.md) → **v3.0** |
| Changelog | [docs/CHANGELOG.md](./docs/CHANGELOG.md) |
| Deploy VPS | [docs/DEPLOY-VPS.md](./docs/DEPLOY-VPS.md) |
| Demo accounts | [docs/DEMO-ACCOUNTS.md](./docs/DEMO-ACCOUNTS.md) |
| UAT beta | [docs/UAT-PLAYBOOK-v2.1.md](./docs/UAT-PLAYBOOK-v2.1.md) |
| Incident | [docs/RUNBOOK-INCIDENT.md](./docs/RUNBOOK-INCIDENT.md) |

## Living docs

| File | Topic |
|------|-------|
| [README.md](./README.md) | Overview + quick start |
| [docs/STATUS.md](./docs/STATUS.md) | Implementation status |
| [docs/docs.md](./docs/docs.md) | Living baseline |
| [docs/NEXT-PRD-BRIEF.md](./docs/NEXT-PRD-BRIEF.md) | Brief PRD **v3.0** |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | Keep a Changelog · **v2.2.1** |
| [docs/CODE-REVIEW-BUNDLE-2026-09-05.md](./docs/CODE-REVIEW-BUNDLE-2026-09-05.md) | Engineering review (tim) — bukan equity |
| [docs/V22-PRODUCTION-CHECKLIST.md](./docs/V22-PRODUCTION-CHECKLIST.md) | v2.2 go-live checklist |
| [docs/FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md) | Available / Conditional / Roadmap |
| [docs/CURRENT-IMPLEMENTATION.md](./docs/CURRENT-IMPLEMENTATION.md) | Snapshot stack & modules |
| [docs/DEPLOY-VPS.md](./docs/DEPLOY-VPS.md) | Deploy tanpa Docker |
| [docs/DEMO-ACCOUNTS.md](./docs/DEMO-ACCOUNTS.md) | Seed demo |
| [docs/UAT-PLAYBOOK-v2.1.md](./docs/UAT-PLAYBOOK-v2.1.md) | Beta UAT |
| [docs/RUNBOOK-INCIDENT.md](./docs/RUNBOOK-INCIDENT.md) | Incident response |

## Specs (`PRD/`)

| File | Type |
|------|------|
| [PRD/dnShop_Finance_v1.0_PRD.md](./PRD/dnShop_Finance_v1.0_PRD.md) | PRD v1.0 |
| [PRD/dnShop_Finance_v2.0_PRD.md](./PRD/dnShop_Finance_v2.0_PRD.md) | PRD v2.0 pembukuan |
| [PRD/dnShop_Finance_v2.1_PRD.md](./PRD/dnShop_Finance_v2.1_PRD.md) | PRD v2.1 (pointer → SOPI) |
| [PRD/sopi/](./PRD/sopi/) | **Canonical v2.1** PRD / SRS / SDD (SOPI) — Implemented |
| [PRD/v2/dnShop_Finance_v2.1_Design.md](./PRD/v2/dnShop_Finance_v2.1_Design.md) | **UI2 Design** — Implemented |
| [PRD/v2.2/](./PRD/v2.2/) | **Canonical v2.2** PRD / SRS / SDD — Implemented |

---

## Ringkas produk

| | |
|---|---|
| Stack | Next.js 15 · NestJS 10 · Postgres/Supabase · Redis opsional · Socket.io |
| Ports lokal | Web **6000** · API **6001** |
| UI | UI2 ops desk (Syne + IBM Plex · signal orange · theme toggle) |
| Pembukuan | Bonus seller · nav Pembukuan · CoA SAK EMKM |
| Tier | Free 100 lifetime · Starter 5000/mo |
| Shopee | Mock tanpa key · live OAuth/webhook/cron dengan partner key |
| Tests | Backend **65** pass (11 suites, 2026-09-05) |
| Next | **v3.0** multi-marketplace |
| HEAD | `dnShopee` **v2.2.1** / `707b47e` |

## Quick links

| | |
|---|---|
| Local web | http://localhost:6000 |
| Local API health | http://localhost:6001/api/v1/auth/health |
| Demo | `seller@dnshop.id` / `Seller123!` |
| Prod web | https://shop.dntech.id |

## Related

- [Product Docs Index](../README.md)
- [Product Portfolio](../../08_PRODUCTS.md)

---

*Last Updated: 5 September 2026*

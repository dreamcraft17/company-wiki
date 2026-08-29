# dnShop Finance — Documentation Index

**Product:** dnShop Finance — dashboard keuangan + pembukuan bonus untuk seller Shopee Indonesia  
**Repository / path:** `dnShopee/`  
**Status:** **v2.1 SOPI go-live + UI2 Implemented** (6 Agustus 2026) · next **v2.2 Accounting depth**  
**Owner:** Dozer (CEO + Tech Lead + PM) · **Company:** DN Tech  
**Prod:** Web `https://shop.dntech.id` · API `https://api.shop.dntech.id`  
**UpdatedAt:** 6 Agustus 2026  

> **Canonical app docs:** workspace `dnShopee/docs/` + `dnShopee/prd/`  
> **This folder:** company-wiki mirror — keep in sync when shipping.

---

## Mulai di sini

| Peran | Dokumen |
|-------|---------|
| Status fitur | [docs/STATUS.md](./docs/STATUS.md) |
| Baseline + next PRD | [docs/docs.md](./docs/docs.md) |
| Briefing PRD berikutnya | [docs/NEXT-PRD-BRIEF.md](./docs/NEXT-PRD-BRIEF.md) → **v2.2** |
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
| [docs/NEXT-PRD-BRIEF.md](./docs/NEXT-PRD-BRIEF.md) | Brief PRD v2.2 |
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
| [PRD/v2/dnShop_Finance_v2.1_PRD.md](./PRD/v2/dnShop_Finance_v2.1_PRD.md) | PRD v2.1 (v2 folder) |

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
| Tests | Backend 26 pass |
| Next | v2.2 cash flow / COGS / Accurate / e-Faktur |

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

*Last Updated: 6 Agustus 2026*

# dnPeople ERP — Docs Index (repo)

**Owner:** Dozer (CEO + Tech Lead)  
**Company:** DN Tech (PT. Dozer Napitupulu Technology)  
**Brand:** dnPeople ERP  
**UpdatedAt:** July 19, 2026  
**HEAD:** `9bf15e2`  
**Status:** Phase 0–4 ~95% coded · V3 Phase 5–8 ~85% MVP+ · production live Conditional  
**Inventory:** 30 pages · 27 modules · 83 entities · 15 migrations · 392 tests  
**Wiki mirror:** `company-wiki/docs/products/dnpeople-erp/`

## Baca dulu (SSOT)

| File | Deskripsi |
|------|-----------|
| [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md) | **Baseline kanonik** untuk PRD berikutnya |
| [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) | Katalog Available / Conditional / Roadmap |
| [v3/IMPLEMENTATION-STATUS.md](./v3/IMPLEMENTATION-STATUS.md) | Matrix implementasi V3 Phase 5–8 |
| [../README.md](../README.md) | Quick start & stack |

## Spec & desain

| File | Topik |
|------|-------|
| [01-PRD-ERP-System.md](./01-PRD-ERP-System.md) | PRD Phase 0–4 |
| [02-SRS-ERP-System.md](./02-SRS-ERP-System.md) | SRS |
| [03-SDD-ERP-System.md](./03-SDD-ERP-System.md) | SDD |
| [v3/PRD-V3-DNPEOPLE-ENTERPRISE.md](./v3/PRD-V3-DNPEOPLE-ENTERPRISE.md) | PRD V3 |
| [v3/SRS-V3-DNPEOPLE-REQUIREMENTS.md](./v3/SRS-V3-DNPEOPLE-REQUIREMENTS.md) | SRS V3 |
| [v3/SDD-V3-DNPEOPLE-ARCHITECTURE.md](./v3/SDD-V3-DNPEOPLE-ARCHITECTURE.md) | SDD V3 |

## Status & baseline (era)

| File | Catatan |
|------|---------|
| [12-PROJECT-STATUS.md](./12-PROJECT-STATUS.md) | Phase 1–4 status — metrik disupersede V3 |
| [25-PRD-BASELINE-CURRENT-STATE.md](./25-PRD-BASELINE-CURRENT-STATE.md) | Baseline 7 Jul — gunakan CURRENT-IMPLEMENTATION untuk angka live |
| [11-AUDIT-GAP-ANALYSIS.md](./11-AUDIT-GAP-ANALYSIS.md) | **Historis** — jangan dipakai sebagai status live |

## Modul & ops

| File | Topik |
|------|-------|
| [00-README.md](./00-README.md) | Navigasi Docs lama |
| [04-TECH-STACK-GUIDE.md](./04-TECH-STACK-GUIDE.md) | Stack |
| [08-FINANCE-MODULE-INDONESIA.md](./08-FINANCE-MODULE-INDONESIA.md) | Finance ID |
| [15-PRODUCTION-DEPLOYMENT-GUIDE.md](./15-PRODUCTION-DEPLOYMENT-GUIDE.md) | Deploy |
| [18-MODULE-FEATURES-SCHEMA.md](./18-MODULE-FEATURES-SCHEMA.md) | Schema/API |
| [24-SOC2-READINESS.md](./24-SOC2-READINESS.md) | SOC 2 |

## Sync ke wiki

```bash
rsync -a --delete ERP/Docs/ company-wiki/docs/products/dnpeople-erp/Docs/
cp ERP/README.md company-wiki/docs/products/dnpeople-erp/README.md
cp ERP/Docs/00_INDEX.md company-wiki/docs/products/dnpeople-erp/00_INDEX.md
```

---

*Last Updated: July 19, 2026*

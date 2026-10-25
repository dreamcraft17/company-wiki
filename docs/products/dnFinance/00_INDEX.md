# dnAccounting (dnFinance) — Documentation Index

> **Author:** Dozer · **Date:** 2026-10-25

**Product:** dnAccounting — cloud accounting SaaS for Indonesian SME (positioning vs Accurate/Jurnal)  
**Repository / path:** `dnFinance/` · package `dnfinance`  
**Remote:** https://github.com/dreamcraft17/dnfinance.git  
**Owner:** Dozer · **Company:** DN Tech  
**UpdatedAt:** 25 October 2026  
**HEAD:** `44b4242` (`main`)  
**Status:** V2 Phase 2 ~78% · MVP **demo-ready** · **224/224** tests  
**Prod (target):** `finance.dntech.id` / `api.finance.dntech.id` — see [docs/DEPLOY-VPS.md](./docs/DEPLOY-VPS.md)

> **Canonical app docs:** workspace `dnFinance/docs2/` (+ V1 spek lokal `dnFinance/docs/`, tidak di-track git)  
> **This folder:** company-wiki mirror — sync setelah ship / doc refresh.

---

## Mulai di sini

| Peran | Dokumen |
|-------|---------|
| Overview produk | [README.md](./README.md) · [docs/PROJECT-OVERVIEW.md](./docs/PROJECT-OVERVIEW.md) |
| Fitur lengkap | [docs/FITUR-LENGKAP.md](./docs/FITUR-LENGKAP.md) |
| Snapshot repo & git | [docs/REPO-SNAPSHOT.md](./docs/REPO-SNAPSHOT.md) |
| Status vs spek V2 | [docs/IMPLEMENTATION-STATUS.md](./docs/IMPLEMENTATION-STATUS.md) |
| Demo / BD | [docs/USER-GUIDE.md](./docs/USER-GUIDE.md) · [docs/DEMO-ACCOUNTS.md](./docs/DEMO-ACCOUNTS.md) |
| Accurate comparison research | [docs/research/accurate-comparison/](./docs/research/accurate-comparison/plan.md) |
| PRD baseline (curated) | [current-implementation.md](./current-implementation.md) |

## Living docs (`docs/`)

Index lengkap: [docs/00_INDEX.md](./docs/00_INDEX.md)

| Area | Files |
|------|--------|
| Implementation | [CURRENT-IMPLEMENTATION.md](./docs/CURRENT-IMPLEMENTATION.md) · [FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md) |
| Architecture & API | [ARCHITECTURE.md](./docs/ARCHITECTURE.md) · [API.md](./docs/API.md) |
| Deploy | [DEPLOY.md](./docs/DEPLOY.md) · [DEPLOY-VPS.md](./docs/DEPLOY-VPS.md) |
| Release | [CHANGELOG.md](./docs/CHANGELOG.md) · [NEXT-PRD-BRIEF.md](./docs/NEXT-PRD-BRIEF.md) |
| Spek V2 | [PRD/PRD-V2.md](./docs/PRD/PRD-V2.md) · [SRS-V2.md](./docs/PRD/SRS-V2.md) · [SDD-V2.md](./docs/PRD/SDD-V2.md) |
| Spek V1 (mirror) | [docs/v1/](./docs/v1/PRD.md) |

## Sync from app repo

```bash
# From dozer workspace root
APP=dnFinance
WIKI=company-wiki/docs/products/dnFinance
cp $APP/README.md $WIKI/README.md
cp $APP/DEMO.md $WIKI/DEMO.md 2>/dev/null || true
cp $APP/docs2/*.md $WIKI/docs/
cp -R $APP/docs2/PRD $WIKI/docs/
cp -R $APP/docs2/research $WIKI/docs/
cp $APP/docs/*.md $WIKI/docs/v1/
# Then refresh this 00_INDEX + current-implementation.md + portfolio indexes
```

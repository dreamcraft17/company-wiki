# dnAccounting (dnFinance) — Documentation Index

> **Author:** Dozer · **Date:** 2026-10-25

**Product:** dnAccounting — cloud accounting SaaS for Indonesian SME (positioning vs Accurate/Jurnal)  
**Repository / path:** `dnFinance/` · package `dnfinance`  
**Remote:** https://github.com/dreamcraft17/dnfinance.git  
**Owner:** Dozer · **Company:** DN Tech  
**UpdatedAt:** 27 October 2026  
**HEAD:** `4bd2cd2` (`main`, app repo — docs live only in wiki)  
**Status:** MVP **demo-ready** · Langganan & Tagihan (deposit DOKU) dibangun, belum diuji di sandbox · **458** tests (448 lolos penuh 27 Okt + 10 tes billing lolos terpisah)  
**Prod (target):** `finance.dntech.id` / `api.finance.dntech.id` — see [docs/DEPLOY-VPS.md](./docs/DEPLOY-VPS.md)

> **SSOT:** folder ini — repo app `dnFinance/` hanya berisi **README.md** + kode.  
> **App repo:** https://github.com/dreamcraft17/dnfinance

---

## Mulai di sini

| Peran | Dokumen |
|-------|---------|
| Overview produk | [README.md](./README.md) · [docs/PROJECT-OVERVIEW.md](./docs/PROJECT-OVERVIEW.md) |
| Fitur lengkap | [docs/FITUR-LENGKAP.md](./docs/FITUR-LENGKAP.md) · per modul & status: [docs/FITUR-PER-MODUL.md](./docs/FITUR-PER-MODUL.md) |
| Harga, paket & pembayaran | [docs/Rancangan_Harga_dan_Paket_dnFinance.md](./docs/Rancangan_Harga_dan_Paket_dnFinance.md) (hipotesis harga + billing deposit DOKU) |
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

## Edit workflow

1. Ubah dokumen **di folder wiki ini** (bukan di repo `dnFinance/`).  
2. Commit **company-wiki**.  
3. Repo app: hanya update `README.md` jika quick start / link berubah.

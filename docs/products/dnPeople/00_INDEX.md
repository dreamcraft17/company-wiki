# dnPeople HRIS — Documentation Index

**Product**: dnPeople — Human Resource Information System  
**Repository**: `dnpeople`  
**Status**: MVP 1 core implemented (scaffold)  
**Owner**: Dozer  
**Last Updated**: July 10, 2026  
**Spec Version**: PRD/SRS/SDD v3.0

---

## Core Specs (PRD folder)

| File | Topik |
|------|-------|
| [PRD/dnpeople-prd.md](./PRD/dnpeople-prd.md) | **PRD** — Product Requirements Document v3.0 |
| [PRD/dnpeople-srs.md](./PRD/dnpeople-srs.md) | **SRS** — Software Requirements Specification v3.0 |
| [PRD/dnpeople-sdd.md](./PRD/dnpeople-sdd.md) | **SDD** — Software Design Document v3.0 |

## Implementation Docs (synced from repo)

| File | Topik |
|------|-------|
| [README.md](./README.md) | Project overview & quick start |
| [docs/PROJECT-OVERVIEW.md](./docs/PROJECT-OVERVIEW.md) | Ringkasan produk & struktur |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Arsitektur sistem |
| [docs/API.md](./docs/API.md) | Referensi API MVP 1 |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Local & production setup |
| [docs/IMPLEMENTATION-STATUS.md](./docs/IMPLEMENTATION-STATUS.md) | Matrix status fitur |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | Riwayat versi |
| [current-implementation.md](./current-implementation.md) | Snapshot implementasi aktual |

---

## Ringkas Produk

HRIS untuk startup/UMKM Indonesia: employee DB, absensi, cuti/izin, payroll (BPJS + PPh 21), dashboard, RBAC, audit.

| | |
|---|---|
| Stack | Next.js 16 · React 19 · Express 5 · Prisma · PostgreSQL 16 |
| Dev ports | Frontend `:3001` · API `:4100` · Postgres `:5433` |
| Demo admin | `admin@dnpeople.id` / `Admin123!` |
| Demo employee | `budi@dnpeople.id` / `Employee123!` |
| Repository | `dnpeople` (folder Dozer) |

### Beda dengan DN People ERP

| | dnPeople HRIS | DN People ERP |
|---|---------------|---------------|
| Repo | `dnpeople` | `ERP` |
| Docs | [dnPeople/](./00_INDEX.md) | [dnpeople-erp/](../dnpeople-erp/00_INDEX.md) |
| Stack | Express + Next.js | NestJS + TypeORM |
| Fokus | HRIS (HR lifecycle) | Full ERP (HR + Finance + Inventory + …) |

---

## MVP Roadmap

| MVP | Scope | Status |
|-----|-------|--------|
| 1 | Employee, org, attendance, leave, payroll, dashboard, RBAC, audit | **Core done** |
| 2 | Recruitment, onboarding, performance, training | Planned |
| 3 | Asset, expense, documents | Planned |
| 4 | Analytics, integrations, mobile | Planned |

---

## Related

- [Product Docs Index](../README.md)
- [Product Portfolio](../../08_PRODUCTS.md)
- [DN People ERP](../dnpeople-erp/00_INDEX.md) — produk terpisah
- Source of truth kode: repo `dnpeople/`

---

*Last Updated: July 10, 2026*

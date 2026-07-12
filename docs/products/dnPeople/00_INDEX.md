# dnPeople HRIS — Documentation Index

**Product**: dnPeople — Human Resource Information System  
**Repository**: `dnpeople`  
**Status**: MVP 1–4 core implemented + PRD v4 Talent Development foundation (Module 1–2)
**Owner**: Dozer  
**Last Updated**: July 12, 2026
**Spec Version**: PRD/SRS/SDD v3.1 + PRD v4 (competitive alignment)

---

## Core Specs (PRD folder)

| File | Topik |
|------|-------|
| [PRD/dnpeople-prd.md](./PRD/dnpeople-prd.md) | **PRD** — Product Requirements Document v3.1 |
| [PRD/dnpeople-srs.md](./PRD/dnpeople-srs.md) | **SRS** — Software Requirements Specification v3.1 |
| [PRD/dnpeople-sdd.md](./PRD/dnpeople-sdd.md) | **SDD** — Software Design Document v3.1 |
| [PRD/dnpeople-prd-v4-competitive.md](./PRD/dnpeople-prd-v4-competitive.md) | **PRD v4** — Competitive Alignment Edition (vs Mekari Talenta) |

## Implementation Docs (synced from repo)

| File | Topik |
|------|-------|
| [README.md](./README.md) | Project overview & quick start |
| [docs/PROJECT-OVERVIEW.md](./docs/PROJECT-OVERVIEW.md) | Ringkasan produk & struktur |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Arsitektur sistem |
| [docs/API.md](./docs/API.md) | Referensi API MVP 1–4 |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Local & production setup |
| [docs/SUPABASE.md](./docs/SUPABASE.md) | Koneksi database Supabase |
| [docs/VPS.md](./docs/VPS.md) | Instalasi di VPS (Nginx, PM2, TLS) |
| [docs/IMPLEMENTATION-STATUS.md](./docs/IMPLEMENTATION-STATUS.md) | Matrix status fitur |
| [current-implementation.md](./current-implementation.md) | Baseline kanonik untuk PRD/SRS berikutnya |
| [docs/PRD-COMPLIANCE-MATRIX.md](./docs/PRD-COMPLIANCE-MATRIX.md) | Traceability acceptance criteria PRD/SRS/SDD |
| [docs/SECURITY-NFR-EVIDENCE.md](./docs/SECURITY-NFR-EVIDENCE.md) | Bukti security, migration, audit dependency, dan performance |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | Riwayat versi |
| [current-implementation.md](./current-implementation.md) | Snapshot implementasi aktual |

---

## Ringkas Produk

HRIS untuk startup/UMKM Indonesia: employee DB, absensi, cuti/izin, payroll (BPJS + PPh 21), plus MVP 2–4: ops lanjutan, strategic HR, dan enterprise (multi-company, SSO, integrations, white-label). PRD v4 menambahkan fondasi talent development (competency framework, IDP, LMS dasar) untuk bersaing dengan Mekari Talenta.

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
| 1 | Employee, org, attendance, leave, payroll, dashboard, RBAC, audit | **Done** |
| 2 | Shift, OT, claim, loan, geofence, docs, announcements, calendar, approvals, reports | **Done** |
| 3 | Recruitment, onboarding, performance, training, assets, offboarding, helpdesk, AI assistant | **Done** |
| 4 | Multi-company, SSO, integrations, white-label | **Done** |
| 5 (PRD v4 Module 1–2) | Competency framework, competency assessment, IDP, LMS dasar | **Done** |
| PRD v4 Module 3–8 | 9-box, succession, career marketplace, EWA, salary benchmarking, industry verticals | **Not started** (roadmap) |

---

## Related

- [Product Docs Index](../README.md)
- [Product Portfolio](../../08_PRODUCTS.md)
- [DN People ERP](../dnpeople-erp/00_INDEX.md) — produk terpisah
- Source of truth kode: repo `dnpeople/`

---

*Last Updated: July 12, 2026*

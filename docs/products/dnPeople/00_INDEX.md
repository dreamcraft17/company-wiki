# dnPeople HRIS — Documentation Index

**Product**: dnPeople — Human Resource Information System  
**Repository**: `dnpeople` → [github.com/dreamcraft17/dnpeople](https://github.com/dreamcraft17/dnpeople)  
**Status**: MVP 1–5 + PRD v5 subscription + PRD v6 multi-tenant + v6.1 discovery login + **PRD v7.0 attendance Excel** implemented  
**Owner**: Dozer (CEO + Tech Lead)  
**Company**: DN Tech (PT. Dozer Napitupulu Technology)  
**Brand**: DnPeople  
**UpdatedAt**: July 18, 2026  
**Spec Version**: PRD/SRS/SDD v3.1 + PRD v4–v7.0  
**Codebase**: 49 frontend pages · 49 backend route modules · 99 Prisma models · 24 tests · HEAD `a345e4b`

---

## Core Specs (PRD folder)

| File | Topik |
|------|-------|
| [PRD/dnpeople-prd.md](./PRD/dnpeople-prd.md) | **PRD** — Product Requirements Document v3.1 |
| [PRD/dnpeople-srs.md](./PRD/dnpeople-srs.md) | **SRS** — Software Requirements Specification v3.1 |
| [PRD/dnpeople-sdd.md](./PRD/dnpeople-sdd.md) | **SDD** — Software Design Document v3.1 |
| [PRD/dnpeople-prd-v4-competitive.md](./PRD/dnpeople-prd-v4-competitive.md) | **PRD v4** — Competitive Alignment Edition |

## Implementation Docs (synced from repo)

| File | Topik |
|------|-------|
| [README.md](./README.md) | Project overview & quick start |
| [docs/PROJECT-OVERVIEW.md](./docs/PROJECT-OVERVIEW.md) | Ringkasan produk & struktur |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Arsitektur sistem (v7.0) |
| [docs/API.md](./docs/API.md) | Referensi API termasuk `/subscription` |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Local & production setup |
| [docs/SUPABASE.md](./docs/SUPABASE.md) | Koneksi database Supabase |
| [docs/VPS.md](./docs/VPS.md) | Install VPS |
| [docs/IMPLEMENTATION-STATUS.md](./docs/IMPLEMENTATION-STATUS.md) | Status implementasi terkini |
| [docs/FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md) | Katalog fitur (+ billing/subscription) |
| [docs/CURRENT-IMPLEMENTATION.md](./docs/CURRENT-IMPLEMENTATION.md) | Snapshot implementasi + open defects |
| [docs/AUDIT-FEATURE-BUG-PERFORMANCE.md](./docs/AUDIT-FEATURE-BUG-PERFORMANCE.md) | **Audit fitur / bug / performa (18 Jul 2026)** |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | Changelog |
| [docs/SECURITY-NFR-EVIDENCE.md](./docs/SECURITY-NFR-EVIDENCE.md) | Security NFR evidence |

## Status Terkini (18 Juli 2026)

| Aspek | Status |
|-------|--------|
| MVP 1–4 | ✅ Done |
| Talent Development foundation (PRD v4 M1–2) | ✅ `/talent`, `/idp`, `/lms` |
| Subscription (PRD v5) | ✅ `/billing` + `/subscription/*` |
| Enterprise multi-tenant (PRD v6) | ✅ Tenant policy, SCIM, quota, audit |
| Seamless login discovery (v6.1) | ✅ Domain / hostname / history; SSO redirect |
| Attendance Excel import (v7.0) | ✅ Template + dry-run + confirm + history |
| Admin office QR UI | ❌ Removed from admin page; API tetap |
| Staff accounts | ✅ `/staff-accounts` |
| MFA TOTP, THR, employee Excel import, offline attendance | ✅ |
| Admin payslip preview | ✅ Inline preview |
| CI | ✅ `.github/workflows/ci.yml` |
| Audit fitur/bug/performa (18 Jul) | ⚠️ 3 P0 open — lihat [AUDIT](./docs/AUDIT-FEATURE-BUG-PERFORMANCE.md) |
| Production IdP / SMTP / S3 / biometrics | Conditional |

Detail: [docs/IMPLEMENTATION-STATUS.md](./docs/IMPLEMENTATION-STATUS.md) · [docs/FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md)

---

| | |
|---|---|
| Owner | Dozer (CEO + Tech Lead) |
| Company | DN Tech (PT. Dozer Napitupulu Technology) |
| Brand | DnPeople |
| UpdatedAt | July 18, 2026 |

Property of DN Tech — PT. Dozer Napitupulu Technology · 2026

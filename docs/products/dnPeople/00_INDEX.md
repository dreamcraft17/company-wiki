# dnPeople HRIS — Documentation Index

**Product**: dnPeople — Human Resource Information System  
**Repository**: `dnpeople` → [github.com/dreamcraft17/dnpeople](https://github.com/dreamcraft17/dnpeople)  
**Status**: MVP 1–5 + PRD v5 subscription + PRD v6 enterprise multi-tenant + v6.1 seamless login discovery **implemented**  
**Owner**: Dozer (CEO + Tech Lead)  
**Company**: DN Tech (PT. Dozer Napitupulu Technology)  
**Brand**: DnPeople  
**UpdatedAt**: July 18, 2026  
**Spec Version**: PRD/SRS/SDD v3.1 + PRD v4–v6.1  
**Codebase**: 49 frontend pages · 49 backend route modules · 99 Prisma models · 24 tests

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
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Arsitektur sistem (v6.1) |
| [docs/API.md](./docs/API.md) | Referensi API |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Local & production setup |
| [docs/SUPABASE.md](./docs/SUPABASE.md) | Koneksi database Supabase |
| [docs/VPS.md](./docs/VPS.md) | Install VPS |
| [docs/IMPLEMENTATION-STATUS.md](./docs/IMPLEMENTATION-STATUS.md) | Status implementasi terkini |
| [docs/FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md) | Katalog fitur existing / conditional / roadmap |
| [docs/CURRENT-IMPLEMENTATION.md](./docs/CURRENT-IMPLEMENTATION.md) | Snapshot implementasi |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | Changelog |
| [docs/SECURITY-NFR-EVIDENCE.md](./docs/SECURITY-NFR-EVIDENCE.md) | Security NFR evidence |

## Status Terkini (18 Juli 2026)

| Aspek | Status |
|-------|--------|
| MVP 1–4 | ✅ Done |
| Talent Development foundation (PRD v4 M1–2) | ✅ `/talent`, `/idp`, `/lms` |
| Subscription (PRD v5) | ✅ Billing + feature gating |
| Enterprise multi-tenant (PRD v6) | ✅ Tenant policy, SCIM, quota, audit |
| Seamless login discovery (v6.1) | ✅ Domain / hostname / history; SSO redirect |
| Staff accounts | ✅ `/staff-accounts` |
| MFA TOTP, THR, Excel import, offline attendance | ✅ |
| Admin payslip preview | ✅ Inline preview (Jul 18) |
| CI | ✅ `.github/workflows/ci.yml` |
| Production IdP / SMTP / S3 / biometrics | Conditional — needs ops credentials |

Detail: [docs/IMPLEMENTATION-STATUS.md](./docs/IMPLEMENTATION-STATUS.md) · [docs/FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md)

---

| | |
|---|---|
| Owner | Dozer (CEO + Tech Lead) |
| Company | DN Tech (PT. Dozer Napitupulu Technology) |
| Brand | DnPeople |
| UpdatedAt | July 18, 2026 |

Property of DN Tech — PT. Dozer Napitupulu Technology · 2026

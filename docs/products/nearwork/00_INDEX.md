# NextWork (Nearwork) — Documentation Index

**Product**: NextWork — Hyperlocal Freelance Marketplace  
**Repository**: `nextwork/` → [github.com/dreamcraft17/freelance-web-startup](https://github.com/dreamcraft17/freelance-web-startup)  
**Status**: In Development · **Engineering DoD Done** · **GA Conditional**  
**Owner**: Dozer (CEO + Tech Lead + PM)  
**Last Updated**: August 29, 2026  
**Latest commit**: `3983ddf` — VERCEL_URL fallback for app URL

---

## Living docs (Aug 2026 — SSOT)

| File | Topik |
|------|-------|
| [README.md](./README.md) | Product one-pager |
| [docs/BUSINESS-MODEL.md](./docs/BUSINESS-MODEL.md) | **Model bisnis + pricing + escrow economics** |
| [docs/FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md) | **Fitur lengkap** (11 modul) |
| [docs/CURRENT-IMPLEMENTATION.md](./docs/CURRENT-IMPLEMENTATION.md) | Baseline implementasi HEAD |
| [docs/IMPLEMENTATION-STATUS.md](./docs/IMPLEMENTATION-STATUS.md) | Phase matrix & DoD |

**Edit living docs di app repo dulu:** `nextwork/docs/` → mirror ke folder `docs/` di sini.

---

## Overview & legacy

| File | Topik |
|------|-------|
| [PROJECT-OVERVIEW.md](./PROJECT-OVERVIEW.md) | Project overview (legacy) |
| [features.md](./features.md) | Changelog UI panjang |
| [docs/apa-itu-nearwork.md](./docs/apa-itu-nearwork.md) | Apa itu Nearwork (nama lama) |
| [docs/application-overview.md](./docs/application-overview.md) | Application overview |

---

## V2 Core Documents

### docs/ (Primary specs)
| File | Type |
|------|------|
| [docs/NEARWORK_V2_PRD.md](./docs/NEARWORK_V2_PRD.md) | PRD |
| [docs/NEARWORK_V2_SRS.md](./docs/NEARWORK_V2_SRS.md) | SRS |
| [docs/NEARWORK_V2_SDD.md](./docs/NEARWORK_V2_SDD.md) | SDD |
| [docs/NEARWORK_V2_DESIGN_SYSTEM.md](./docs/NEARWORK_V2_DESIGN_SYSTEM.md) | Design System |

### updated/ (Revisions)
| File | Type |
|------|------|
| [updated/NEARWORK_V2_PRD.md](./updated/NEARWORK_V2_PRD.md) | PRD (updated) |
| [updated/NEARWORK_V2_SRS.md](./updated/NEARWORK_V2_SRS.md) | SRS (updated) |
| [updated/NEARWORK_V2_SDD.md](./updated/NEARWORK_V2_SDD.md) | SDD (updated) |
| [updated/NEARWORK_V2_DESIGN_SYSTEM.md](./updated/NEARWORK_V2_DESIGN_SYSTEM.md) | Design System (updated) |

**Code-as-truth spek terbaru:** `nextwork/docs/prd/NEXTWORK_*.md`

---

## Architecture & technical

| File | Topik |
|------|-------|
| [docs/billing-architecture.md](./docs/billing-architecture.md) | Billing architecture |
| [docs/apps-structure.md](./docs/apps-structure.md) | Apps structure |
| [docs/monorepo-tree.md](./docs/monorepo-tree.md) | Monorepo structure |
| [docs/auth-session-persistence.md](./docs/auth-session-persistence.md) | Auth & sessions |
| [docs/roles-and-permissions.md](./docs/roles-and-permissions.md) | RBAC |
| [docs/geo-matching.md](./docs/geo-matching.md) | Geo matching |
| [database-README.md](./database-README.md) | Database package |

---

## Business (legacy + mirror)

| File | Topik |
|------|-------|
| [docs/business-rules.md](./docs/business-rules.md) | Business rules |
| [docs/pricing-and-plans.md](./docs/pricing-and-plans.md) | Pricing (Apr 2026 — superseded by BUSINESS-MODEL) |
| [docs/taxonomy-and-categories.md](./docs/taxonomy-and-categories.md) | Taxonomy |

---

## Security

| File | Topik |
|------|-------|
| [SECURITY_AUDIT_2026-07-08.md](./SECURITY_AUDIT_2026-07-08.md) | Audit statis Jul 2026 |
| [audit.md](./audit.md) | Audit legacy |

| Area | Aug 2026 status |
|------|-----------------|
| Auth (bcrypt, JWT HttpOnly, CSRF) | ✅ |
| Webhook crypto v2.1 | ✅ Hardened |
| PSP LIVE ops | ⏳ Conditional |
| Prod seed hygiene | ⚠️ Enforce no default admin |

---

## Operations

| File | Topik |
|------|-------|
| [docs/deploy-checklist.md](./docs/deploy-checklist.md) | Deploy checklist |

---

*Last Updated: August 29, 2026 · Author: Dozer*

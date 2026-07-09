# Nearwork — Documentation Index

**Product**: Nearwork Platform  
**Repository**: `nextwork` → [github.com/dreamcraft17/freelance-web-startup](https://github.com/dreamcraft17/freelance-web-startup)  
**Status**: In Development  
**Owner**: Dozer  
**Last Updated**: July 9, 2026  
**Latest commit**: `d40ea19` — security audit report (2026-07-08)

---

## Overview

| File | Topik |
|------|-------|
| [README.md](./README.md) | Project README |
| [PROJECT-OVERVIEW.md](./PROJECT-OVERVIEW.md) | Project overview |
| [features.md](./features.md) | Feature list |
| [docs/apa-itu-nearwork.md](./docs/apa-itu-nearwork.md) | Apa itu Nearwork |
| [docs/application-overview.md](./docs/application-overview.md) | Application overview |

---

## V2 Core Documents

### docs/ (Primary)
| File | Type |
|------|------|
| [docs/NEARWORK_V2_PRD.md](./docs/NEARWORK_V2_PRD.md) | PRD |
| [docs/NEARWORK_V2_SRS.md](./docs/NEARWORK_V2_SRS.md) | SRS |
| [docs/NEARWORK_V2_SDD.md](./docs/NEARWORK_V2_SDD.md) | SDD |
| [docs/NEARWORK_V2_DESIGN_SYSTEM.md](./docs/NEARWORK_V2_DESIGN_SYSTEM.md) | Design System |

### updated/ (Latest Revisions)
| File | Type |
|------|------|
| [updated/NEARWORK_V2_PRD.md](./updated/NEARWORK_V2_PRD.md) | PRD (updated) |
| [updated/NEARWORK_V2_SRS.md](./updated/NEARWORK_V2_SRS.md) | SRS (updated) |
| [updated/NEARWORK_V2_SDD.md](./updated/NEARWORK_V2_SDD.md) | SDD (updated) |
| [updated/NEARWORK_V2_DESIGN_SYSTEM.md](./updated/NEARWORK_V2_DESIGN_SYSTEM.md) | Design System (updated) |

---

## Architecture & Technical

| File | Topik |
|------|-------|
| [docs/billing-architecture.md](./docs/billing-architecture.md) | Billing architecture |
| [docs/apps-structure.md](./docs/apps-structure.md) | Apps structure |
| [docs/monorepo-tree.md](./docs/monorepo-tree.md) | Monorepo structure |
| [docs/monorepo-directory-tree.md](./docs/monorepo-directory-tree.md) | Directory tree |
| [docs/auth-session-persistence.md](./docs/auth-session-persistence.md) | Auth & sessions |
| [docs/roles-and-permissions.md](./docs/roles-and-permissions.md) | RBAC |
| [docs/geo-matching.md](./docs/geo-matching.md) | Geo matching |
| [docs/engineering-conventions.md](./docs/engineering-conventions.md) | Engineering conventions |
| [database-README.md](./database-README.md) | Database package |

---

## Business & Product

| File | Topik |
|------|-------|
| [docs/business-rules.md](./docs/business-rules.md) | Business rules |
| [docs/pricing-and-plans.md](./docs/pricing-and-plans.md) | Pricing & plans |
| [docs/taxonomy-and-categories.md](./docs/taxonomy-and-categories.md) | Taxonomy |
| [docs/DOCUMENTATION-MAINTENANCE.md](./docs/DOCUMENTATION-MAINTENANCE.md) | Doc maintenance |

---

## Design & UX

| File | Topik |
|------|-------|
| [UI-UX-DESIGN-BRIEF.md](./UI-UX-DESIGN-BRIEF.md) | Design brief |
| [ui-redesign.md](./ui-redesign.md) | UI redesign notes |
| [folder-structure.md](./folder-structure.md) | Folder structure |

---

## Security

| File | Topik |
|------|-------|
| [SECURITY_AUDIT_2026-07-08.md](./SECURITY_AUDIT_2026-07-08.md) | **Audit keamanan statis** — temuan critical & rekomendasi 7/30 hari |
| [audit.md](./audit.md) | Audit report (legacy) |
| [credential.example.md](./credential.example.md) | Credential template |

### Ringkasan audit Jul 2026

| Area | Status |
|------|--------|
| Auth (bcrypt, JWT HttpOnly, CSRF) | ✅ Baik |
| Credential di `public/logo/` | 🔴 Critical — hapus & rotate |
| Midtrans webhook signature | 🔴 Critical — wajib verifikasi |
| Stripe webhook | 🟠 High — gunakan official SDK |
| Seed admin default | 🟠 High — lock di staging/prod |

---

## Operations

| File | Topik |
|------|-------|
| [docs/deploy-checklist.md](./docs/deploy-checklist.md) | Deploy checklist |

---

*Last Updated: July 9, 2026*

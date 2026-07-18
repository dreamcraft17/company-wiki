# dnPeople — Docs Index (repo)

**Owner:** Dozer (CEO + Tech Lead)  
**Company:** DN Tech (PT. Dozer Napitupulu Technology)  
**Brand:** DnPeople  
**UpdatedAt:** July 18, 2026  
**Status:** PRD v5–v7.0 implemented (subscription, multi-tenant, discovery login, attendance Excel)  
**Codebase:** 49 pages · 49 routes · 99 models · 24 tests · HEAD `a345e4b`  
**Wiki mirror:** `company-wiki/docs/products/dnPeople/`

| File | Deskripsi |
|------|-----------|
| [PROJECT-OVERVIEW.md](./PROJECT-OVERVIEW.md) | Ringkasan produk & roadmap |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arsitektur v7.0 |
| [API.md](./API.md) | Referensi API |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Setup lokal & production checklist |
| [SUPABASE.md](./SUPABASE.md) | Koneksi database Supabase (PostgreSQL) |
| [VPS.md](./VPS.md) | Instalasi di VPS (Nginx, PM2, TLS) |
| [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md) | Matrix status fitur per MVP/PRD |
| [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) | Daftar lengkap fitur existing, conditional, dan roadmap |
| [V5-SUBSCRIPTION-IMPLEMENTATION.md](./V5-SUBSCRIPTION-IMPLEMENTATION.md) | Subscription tier, billing, feature gating |
| [V6-ENTERPRISE-MULTITENANT-IMPLEMENTATION.md](./V6-ENTERPRISE-MULTITENANT-IMPLEMENTATION.md) | Isolation, SCIM, scoped RBAC, quota |
| [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md) | Baseline kanonik untuk PRD berikutnya |
| [AUDIT-FEATURE-BUG-PERFORMANCE.md](./AUDIT-FEATURE-BUG-PERFORMANCE.md) | Audit fitur, bug, dan performa (18 Jul 2026) |
| [PRD-COMPLIANCE-MATRIX.md](./PRD-COMPLIANCE-MATRIX.md) | Traceability acceptance criteria |
| [SECURITY-NFR-EVIDENCE.md](./SECURITY-NFR-EVIDENCE.md) | Bukti security & NFR |
| [CHANGELOG.md](./CHANGELOG.md) | Riwayat versi |
| [../README.md](../README.md) | Quick start |

## Spec (company-wiki)

| Spec | Path |
|------|------|
| PRD | `company-wiki/docs/products/dnPeople/PRD/dnpeople-prd.md` |
| SRS | `company-wiki/docs/products/dnPeople/PRD/dnpeople-srs.md` |
| SDD | `company-wiki/docs/products/dnPeople/PRD/dnpeople-sdd.md` |
| PRD v4 | `company-wiki/docs/products/dnPeople/PRD/dnpeople-prd-v4-competitive.md` |
| Wiki Index | `company-wiki/docs/products/dnPeople/00_INDEX.md` |

## Sync ke wiki

```bash
cp dnpeople/docs/*.md company-wiki/docs/products/dnPeople/docs/
cp dnpeople/README.md company-wiki/docs/products/dnPeople/README.md
# Update 00_INDEX.md di wiki jika status berubah
```

---

*Last Updated: July 18, 2026*

# dnPeople — Docs Index (repo)

**Last Updated:** July 16, 2026
**Status:** PRD v6 enterprise multi-tenant implemented
**Wiki mirror:** `company-wiki/docs/products/dnPeople/`

| File | Deskripsi |
|------|-----------|
| [PROJECT-OVERVIEW.md](./PROJECT-OVERVIEW.md) | Ringkasan produk & roadmap |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arsitektur MVP 1–4 |
| [API.md](./API.md) | Referensi API (MVP 1 detail + MVP 4 enterprise) |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Setup lokal & production checklist |
| [SUPABASE.md](./SUPABASE.md) | Koneksi database Supabase (PostgreSQL) |
| [VPS.md](./VPS.md) | Instalasi di VPS (Nginx, PM2, TLS) |
| [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md) | Matrix status fitur per MVP |
| [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) | Daftar lengkap fitur existing, conditional, dan roadmap per domain |
| [V5-SUBSCRIPTION-IMPLEMENTATION.md](./V5-SUBSCRIPTION-IMPLEMENTATION.md) | Implementasi subscription tier, billing, feature gating, dan migration v5 |
| [V6-ENTERPRISE-MULTITENANT-IMPLEMENTATION.md](./V6-ENTERPRISE-MULTITENANT-IMPLEMENTATION.md) | Implementasi isolation, tenant identity, SCIM, scoped RBAC, quota, dan branding v6 |
| [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md) | Baseline kanonik untuk menyusun PRD/SRS berikutnya |
| [PRD-COMPLIANCE-MATRIX.md](./PRD-COMPLIANCE-MATRIX.md) | Traceability acceptance criteria PRD/SRS/SDD |
| [SECURITY-NFR-EVIDENCE.md](./SECURITY-NFR-EVIDENCE.md) | Bukti security, migration, dependency audit, dan performance |
| [CHANGELOG.md](./CHANGELOG.md) | Riwayat versi (0.1.0 → 0.4.0) |
| [../README.md](../README.md) | Quick start |

## Spec (company-wiki)

| Spec | Path |
|------|------|
| PRD | `company-wiki/docs/products/dnPeople/PRD/dnpeople-prd.md` |
| SRS | `company-wiki/docs/products/dnPeople/PRD/dnpeople-srs.md` |
| SDD | `company-wiki/docs/products/dnPeople/PRD/dnpeople-sdd.md` |
| Wiki Index | `company-wiki/docs/products/dnPeople/00_INDEX.md` |
| Current snapshot | `company-wiki/docs/products/dnPeople/current-implementation.md` |

## Sync ke wiki

```bash
cp dnpeople/docs/*.md company-wiki/docs/products/dnPeople/docs/
cp dnpeople/README.md company-wiki/docs/products/dnPeople/README.md
# Update 00_INDEX.md + current-implementation.md di wiki jika status berubah
```

---

*Last Updated: July 16, 2026*

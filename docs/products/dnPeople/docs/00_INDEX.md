# dnPeople — Docs Index (repo)

**Owner:** Dozer (CEO + Tech Lead)  
**Company:** DN Tech (PT. Dozer Napitupulu Technology)  
**Brand:** DnPeople  
**UpdatedAt:** July 19, 2026  
**Status:** PRD v5–v10.0 (ops/launch readiness artefacts in repo; SaaS accounts Conditional)  
**Codebase:** 50+ pages · 51+ routes · 101+ models · 32+ tests  
**HEAD:** see `git rev-parse --short HEAD`  
**Wiki mirror:** `company-wiki/docs/products/dnPeople/`

| File | Deskripsi |
|------|-----------|
| [PROJECT-OVERVIEW.md](./PROJECT-OVERVIEW.md) | Ringkasan produk & roadmap |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arsitektur v7.0+ |
| [API.md](./API.md) | Referensi API |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Setup lokal & production checklist |
| [SUPABASE.md](./SUPABASE.md) | Koneksi database Supabase (PostgreSQL) |
| [VPS.md](./VPS.md) | Instalasi di VPS (Nginx, PM2, TLS) |
| [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md) | Matrix status fitur per MVP/PRD |
| [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) | Daftar lengkap fitur existing, conditional, dan roadmap |
| [USER-GUIDE.md](./USER-GUIDE.md) | Panduan pengguna (launch) |
| [ADMIN-GUIDE.md](./ADMIN-GUIDE.md) | Panduan admin / implementer |
| [FAQ-KNOWLEDGE-BASE.md](./FAQ-KNOWLEDGE-BASE.md) | FAQ & troubleshooting |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Troubleshooting guide |
| [INTEGRATIONS.md](./INTEGRATIONS.md) | API keys, webhooks, OpenAPI |
| [SECURITY.md](./SECURITY.md) | Security customer-facing |
| [COMPLIANCE.md](./COMPLIANCE.md) | BPJS / PPh / UU PDP |
| [SECURITY-INCIDENT-RESPONSE.md](./SECURITY-INCIDENT-RESPONSE.md) | Incident response &lt;72h |
| [PENTEST-SCOPE.md](./PENTEST-SCOPE.md) | Scope pen-test eksternal |
| [CUSTOMER-ONBOARDING-PLAYBOOK.md](./CUSTOMER-ONBOARDING-PLAYBOOK.md) | Onboarding 10 langkah |
| [SLA-SUPPORT-POLICY.md](./SLA-SUPPORT-POLICY.md) | SLA & support |
| [UU-PDP-COMPLIANCE-CHECKLIST.md](./UU-PDP-COMPLIANCE-CHECKLIST.md) | Checklist UU PDP |
| [RESTORE-DRILL-RUNBOOK.md](./RESTORE-DRILL-RUNBOOK.md) | Drill restore backup |
| [legal/](./legal/) | Privacy, Terms, DPA templates |
| [PRD/dnpeople-prd-v10.0-operations-launch-readiness-id.md](./PRD/dnpeople-prd-v10.0-operations-launch-readiness-id.md) | **PRD v10.0** ops & launch |
| [V5-SUBSCRIPTION-IMPLEMENTATION.md](./V5-SUBSCRIPTION-IMPLEMENTATION.md) | Subscription tier, billing, feature gating |
| [V6-ENTERPRISE-MULTITENANT-IMPLEMENTATION.md](./V6-ENTERPRISE-MULTITENANT-IMPLEMENTATION.md) | Isolation, SCIM, scoped RBAC, quota |
| [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md) | Baseline kanonik untuk PRD berikutnya |
| [AUDIT-FEATURE-BUG-PERFORMANCE.md](./AUDIT-FEATURE-BUG-PERFORMANCE.md) | Audit fitur, bug, dan performa (18 Jul 2026) + remediasi v8.0 |
| [PRD-COMPLIANCE-MATRIX.md](./PRD-COMPLIANCE-MATRIX.md) | Traceability acceptance criteria |
| [SECURITY-NFR-EVIDENCE.md](./SECURITY-NFR-EVIDENCE.md) | Bukti security & NFR |
| [CHANGELOG.md](./CHANGELOG.md) | Riwayat versi |
| [../README.md](../README.md) | Quick start |
| [PRD/dnpeople-prd-v8.0-security-stability-fixes-id.md](./PRD/dnpeople-prd-v8.0-security-stability-fixes-id.md) | **PRD v8.0** security & stability |

## Spec (company-wiki)

| Spec | Path |
|------|------|
| PRD | `company-wiki/docs/products/dnPeople/PRD/dnpeople-prd.md` |
| SRS | `company-wiki/docs/products/dnPeople/PRD/dnpeople-srs.md` |
| SDD | `company-wiki/docs/products/dnPeople/PRD/dnpeople-sdd.md` |
| PRD v8.0 | `company-wiki/docs/products/dnPeople/PRD/dnpeople-prd-v8.0-security-stability-fixes-id.md` |
| Wiki Index | `company-wiki/docs/products/dnPeople/00_INDEX.md` |

## Sync ke wiki

```bash
cp dnpeople/docs/*.md company-wiki/docs/products/dnPeople/docs/
cp dnpeople/README.md company-wiki/docs/products/dnPeople/README.md
# Update 00_INDEX.md di wiki jika status berubah
```

---

*Last Updated: July 19, 2026*

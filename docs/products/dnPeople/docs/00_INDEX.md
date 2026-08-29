# dnPeople — Docs Index (repo)

**Owner:** Dozer (CEO + Tech Lead + PM)  
**Company:** DN Tech (PT. Dozer Napitupulu Technology)  
**Brand:** DnPeople  
**UpdatedAt:** August 10, 2026  
**Status:** PRD v5–**v15.0** complete · **Xendit PG + billing UI + grouped nav + logo3** (Aug 2026) · next = **PRD v16.0 Module 4**  
**Codebase:** ~96 pages · ~60 route modules · **129** models · **81** tests  
**Production:** `https://hris.dntech.id` · API `https://api.hris.dntech.id`
**Contact:** info@dntech.id  
**Wiki mirror:** `company-wiki/docs/products/dnPeople/`

> **Soft launch:** [RELEASE-READY.md](./RELEASE-READY.md) + [LAUNCH-GATE-CHECKLIST.md](./LAUNCH-GATE-CHECKLIST.md)  
> **Dasar PRD berikutnya:** [NEXT-PRD-BRIEF.md](./NEXT-PRD-BRIEF.md) · **Prep lengkap v16.0:** [PRD/dnpeople-prd-v16.0-prep-id.md](./PRD/dnpeople-prd-v16.0-prep-id.md)  
> **Baseline panjang:** [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md) — next greenfield Module 4–8 → **v16.0**  
> **Demo creds on UI:** ditampilkan by default (public sandbox **FREE** tier) — lihat [DEMO-ACCOUNTS.md](./DEMO-ACCOUNTS.md); sembunyikan dengan `NEXT_PUBLIC_SHOW_DEMO_CREDS=false`

| File | Deskripsi |
|------|-----------|
| [**DNPEOPLE-HRIS-OVERVIEW.md**](./DNPEOPLE-HRIS-OVERVIEW.md) | **Penjelasan produk lengkap dalam 1 file** — mulai di sini |
| [A11Y-TESTING.md](./A11Y-TESTING.md) | **Aksesibilitas WCAG 2.2 AA** — Playwright + axe, keyboard, manual checklist |
| [CHAOS-ENGINEERING.md](./CHAOS-ENGINEERING.md) | **Chaos engineering** — hipotesis, 3 experiment awal, game day, VPS scripts |
| [NEXT-PRD-BRIEF.md](./NEXT-PRD-BRIEF.md) | **Brief PRD v16.0** — baca ini dulu (1 halaman) |
| [PRD/dnpeople-prd-v16.0-prep-id.md](./PRD/dnpeople-prd-v16.0-prep-id.md) | **Persiapan PRD v16.0 lengkap** — user stories, open questions, DoD |
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
| [DEMO-ACCOUNTS.md](./DEMO-ACCOUNTS.md) | Akun demo seed (tier FREE — honest nav) |
| [LAUNCH-GATE-CHECKLIST.md](./LAUNCH-GATE-CHECKLIST.md) | Go/no-go checklist PRD v11.0 |
| [RELEASE-READY.md](./RELEASE-READY.md) | Soft-launch Agustus — apa yang sudah dikunci di kode vs ops |
| [SLA-COMMITMENT-RPO-RTO.md](./SLA-COMMITMENT-RPO-RTO.md) | RPO/RTO commitments |
| [legal/](./legal/) | Privacy, Terms, DPA templates |
| [xendit/XENDIT-PAYMENT-SETUP.md](./xendit/XENDIT-PAYMENT-SETUP.md) | **Xendit payment — setup test mode, webhook, troubleshooting** (primary PG) |
| [xendit/dnpeople-prd-xendit-payment-v1.0-id.md](./xendit/dnpeople-prd-xendit-payment-v1.0-id.md) | **PRD Xendit v1.0** (+ [SRS](./xendit/dnpeople-srs-xendit-payment-v1.0-id.md) / [SDD](./xendit/dnpeople-sdd-xendit-payment-v1.0-id.md)) — **implemented**; sandbox E2E Conditional |
| [PG/README.md](./PG/README.md) | **Midtrans legacy** — spec historis; diganti Xendit Agustus 2026 |
| [PRD/dnpeople-prd-v15.0-admin-dashboard.md](./PRD/dnpeople-prd-v15.0-admin-dashboard.md) | **PRD v15.0** Admin dashboard & control panel (internal, SUPER_ADMIN) |
| [PRD/dnpeople-srs-v15.0-admin-requirements.md](./PRD/dnpeople-srs-v15.0-admin-requirements.md) | **SRS v15.0** admin acceptance criteria |
| [PRD/dnpeople-sdd-v15.0-admin-implementation.md](./PRD/dnpeople-sdd-v15.0-admin-implementation.md) | **SDD v15.0** admin technical implementation |
| [PRD/dnpeople-prd-v14.0-tutorial-onboarding.md](./PRD/dnpeople-prd-v14.0-tutorial-onboarding.md) | **PRD v14.0** In-app tutorial & onboarding (no video library) |
| [PRD/dnpeople-srs-v14.0-tutorial-requirements.md](./PRD/dnpeople-srs-v14.0-tutorial-requirements.md) | **SRS v14.0** tutorial/KB acceptance |
| [PRD/dnpeople-sdd-v14.0-tutorial-implementation.md](./PRD/dnpeople-sdd-v14.0-tutorial-implementation.md) | **SDD v14.0** tutorial/KB technical (video draft historical only) |
| [PRD/dnpeople-prd-v12.1-free-tier-50-emp-final.md](./PRD/dnpeople-prd-v12.1-free-tier-50-emp-final.md) | **PRD v12.1** FREE tier 50 emp final (LOCKED) |
| [PRD/dnpeople-srs-v12.1-free-tier-50-emp-final.md](./PRD/dnpeople-srs-v12.1-free-tier-50-emp-final.md) | **SRS v12.1** acceptance criteria |
| [PRD/dnpeople-sdd-v12.1-free-tier-50-emp-final.md](./PRD/dnpeople-sdd-v12.1-free-tier-50-emp-final.md) | **SDD v12.1** technical implementation |
| [PRD/dnpeople-prd-v12.0-tier-consolidation-id.md](./PRD/dnpeople-prd-v12.0-tier-consolidation-id.md) | **PRD v12.0** tier consolidation |
| [PRD/dnpeople-prd-v11.1-landing-page-website-id.md](./PRD/dnpeople-prd-v11.1-landing-page-website-id.md) | **PRD v11.1** landing page |
| [PRD/dnpeople-prd-v11.0-go-live-execution-id.md](./PRD/dnpeople-prd-v11.0-go-live-execution-id.md) | **PRD v11.0** go-live execution |
| [PRD/dnpeople-prd-v10.0-operations-launch-readiness-id.md](./PRD/dnpeople-prd-v10.0-operations-launch-readiness-id.md) | **PRD v10.0** ops & launch |
| [V5-SUBSCRIPTION-IMPLEMENTATION.md](./V5-SUBSCRIPTION-IMPLEMENTATION.md) | Subscription tier, billing, feature gating |
| [V6-ENTERPRISE-MULTITENANT-IMPLEMENTATION.md](./V6-ENTERPRISE-MULTITENANT-IMPLEMENTATION.md) | Isolation, SCIM, scoped RBAC, quota |
| [NEXT-PRD-BRIEF.md](./NEXT-PRD-BRIEF.md) | **Dasar utuh untuk menulis PRD berikutnya** |
| [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md) | **Baseline kanonik — detail panjang** |
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

*Last Updated: August 9, 2026*

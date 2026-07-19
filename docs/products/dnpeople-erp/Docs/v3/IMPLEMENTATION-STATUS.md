# V3 Implementation Status — Phase 5–8

**Terakhir diperbarui:** 19 Juli 2026  
**Product brand:** dnCore  
**Branch:** `main` · **Latest commit:** `189506d`  
**Repository:** [github.com/dreamcraft17/erp](https://github.com/dreamcraft17/erp)  
**Baseline live:** [`Docs/CURRENT-IMPLEMENTATION.md`](../CURRENT-IMPLEMENTATION.md) · [`Docs/FEATURE-CATALOG.md`](../FEATURE-CATALOG.md)  
**Baseline Phase 0–4 (historis):** [`Docs/25-PRD-BASELINE-CURRENT-STATE.md`](../25-PRD-BASELINE-CURRENT-STATE.md)  
**Project SSOT (Phase 1–4 era):** [`Docs/12-PROJECT-STATUS.md`](../12-PROJECT-STATUS.md) — metrik disupersede dokumen ini + CURRENT-IMPLEMENTATION  
**Spesifikasi V3:** [`Docs/v3/SRS-V3-DNPEOPLE-REQUIREMENTS.md`](SRS-V3-DNPEOPLE-REQUIREMENTS.md)

> Dokumen ini melacak **implementasi kode** untuk requirement V3 Phase 5–8.  
> Distinguish: **✅ Coded** = endpoint/modul ada & tested · **🟡 MVP** = scaffold/rule-based, belum production-grade · **📋 External** = butuh creds/audit di luar repo.

---

## Ringkasan Eksekutif

| Dimensi | Sebelum V3 (Phase 0–4) | Setelah V3 (8 Jul 2026) |
|---------|------------------------|-------------------------|
| Backend modules | 24 (23 domain + industry) | **27 domain** + `platform/` |
| DB migrations | `0000`–`0013` (14 files) | **`0000`–`0014` (15 files)** |
| Unit tests | 390 (83 suites) | **394 (84 suites)** ✅ |
| Frontend pages | 29 | **30** (+ Enterprise V3 hub) |
| SRS V3 Phase 5–8 (kode) | ~5% scaffold | **~85% coded (MVP+)** |
| Production live deploy | 🟡 templates ready | 🟡 **unchanged** — butuh AWS + live keys |

**Kesimpulan:** Semua bucket fitur V3 Phase 5–8 sudah **diimplementasikan di codebase** sebagai modular monolith MVP. Yang tersisa = hardening production (live infra, sertifikasi, App Store, API keys live).

---

## Status per Phase

| Phase | Scope SRS | Code | Depth | Blocker utama |
|-------|-----------|------|-------|---------------|
| **0–4** | Core ERP 140+ req | ✅ ~95% | Production-ready code | AWS creds untuk live |
| **5** | Go-live & compliance 6+ req | ✅ Coded | 🟡 MVP+ | SOC 2 audit, live backup target |
| **6** | AI & analytics 25+ req | ✅ Coded | 🟡 Rule/ensemble ML | FastAPI/Prophet microservice opsional |
| **7** | Enterprise tier-2 35+ req | ✅ Coded | 🟡 MVP+ | DocuSign, Tesseract OCR live |
| **8** | Platform/ecosystem | ✅ Coded | 🟡 MVP+ | Revenue share billing live |

---

## Metrik Live (8 Jul 2026)

| Metrik | Nilai |
|--------|-------|
| Unit tests | **394** passed · **84** suites |
| Coverage gate | **≥60%** (CI) |
| Backend modules | **27** di `backend/src/modules/` |
| Platform layer | `partner/`, `white-label/`, `etl/`, registry |
| Migrations | **15** files (`1730000000000`–`1730000000014`) |
| V3 new modules | `compliance`, `ops`, `lms` |
| V3 extended modules | `analytics`, `documents`, `hr`, `workflow`, `reporting`, `auth`, `finance`, `projects`, `notifications`, `integrations`, `platform`, `common` |
| Frontend V3 UI | `/enterprise` — 6 tabs |
| Build | Backend ✅ · Frontend ✅ |

---

## Modul Baru (V3)

| Modul | Path | Fitur |
|-------|------|-------|
| **Compliance** | `backend/src/modules/compliance/` | DJP tax XML export, audit trail, retention policies, digital sign stub |
| **Ops** | `backend/src/modules/ops/` | Backup monitor API, nightly `@Cron`, restore-test log |
| **LMS** | `backend/src/modules/lms/` | Courses, enrollments, progress, certificates |

---

## Phase 5 — Go-Live & Compliance

| Req ID | Feature | Status | Endpoint / Lokasi |
|--------|---------|--------|-------------------|
| FR-OPS-BACKUP-001 | Automated backup | ✅ Coded 🟡 | `GET /api/v1/admin/backups` · cron 02:00 · `scripts/db-backup.sh` |
| FR-FIN-TAX-004 | Tax compliance reporting | ✅ Coded | `POST /api/v1/compliance/tax-exports/generate` (SPT-1721, SPT-PPN, PPh23/26) |
| FR-COMP-ESIGN-001 | E-signature (basic) | ✅ Coded 🟡 | `DocumentsModule` → `EsignService` (email notify + cert serial) |
| FR-HR-PAYROLL-004 | Annual bonus / THR | ✅ Coded | `POST /api/v1/hr/bonuses/process` |
| NFR-COMP-003 | UU PDP retention | ✅ Coded 🟡 | `GET/POST /api/v1/compliance/retention-policies` · weekly purge cron |
| NFR-COMP-001 | SOC 2 Type II | 📋 External | Audit process — bukan kode |

**Catatan depth:** Backup cron memanggil shell script lokal; di production perlu RDS snapshot + S3 lifecycle policy.

---

## Phase 6 — AI & Analytics

| Feature | Status | Endpoint | Depth |
|---------|--------|----------|-------|
| AI Copilot (NLP → SQL) | ✅ | `POST /api/v1/analytics/copilot/ask` | 🟡 Pattern-matching, bukan LLM |
| ML ensemble forecast | ✅ | `GET /api/v1/analytics/forecast/ml` | 🟡 Holt-style in-process, bukan Prophet service |
| AR risk scoring | ✅ | `GET /api/v1/analytics/ar-risk` | ✅ Rule-based tier + dunning hook |
| Document classifier | ✅ | `POST /api/v1/analytics/classify-document` | 🟡 Keyword rules |
| Cohort / CLV | ✅ | `GET /api/v1/reporting/v3/cohort` | ✅ |
| Scenario planning | ✅ | `POST /api/v1/reporting/v3/scenarios` | ✅ |
| Email digest prefs | ✅ | `GET/POST /api/v1/notifications/digest/preference` | 🟡 Cron queue stub |
| ETL nightly sync | ✅ | `POST /api/v1/platform/etl/run` | 🟡 Job orchestration scaffold |

---

## Phase 7 — Enterprise Tier-2

| Feature | Status | Endpoint | Depth |
|---------|--------|----------|-------|
| OCR invoice ingestion | ✅ | `POST /api/v1/documents/ocr/:documentId` | 🟡 Text/regex extract, bukan Tesseract |
| Document full-text search | ✅ | `GET /api/v1/documents/search?q=` | ✅ |
| LMS | ✅ | `/api/v1/lms/*` | ✅ MVP |
| BPMN 2.0 designer/runtime | ✅ | `/api/v1/workflow/bpmn/*` | 🟡 XML parse + step list |
| Consolidation engine v2 | ✅ | `POST /api/v1/reporting/v3/consolidation/run` | 🟡 Elimination + forex entities |
| Azure AD / SAML SSO + JIT | ✅ | `POST /api/v1/auth/sso/login` | 🟡 JWT/SAML parse; live IdP = env |
| Immutable audit chain | ✅ | `/api/v1/audit-chain/*` | ✅ SHA-256 chain |
| PPh 23/26 withholding | ✅ | `POST /api/v1/finance/withholding/report` | ✅ |
| Project auto-invoice | ✅ | `POST /api/v1/projects/:id/generate-invoice` | ✅ Draft from timesheets |

---

## Phase 8 — Platform & Ecosystem

| Feature | Status | Endpoint | Depth |
|---------|--------|----------|-------|
| Partner OAuth 2.0 apps | ✅ | `/api/v1/platform/partner/*` | 🟡 Client creds + quota counter |
| App marketplace | ✅ | `/api/v1/integrations/marketplace/*` | 🟡 Submit/publish/rate |
| White-label branding | ✅ | `/api/v1/platform/white-label` | ✅ Logo, colors, domain flag |
| ETL pipeline admin | ✅ | `/api/v1/platform/etl/*` | 🟡 |

**Belum coded:** Marketplace revenue share billing (Stripe Connect), reseller admin dashboard penuh.

---

## Frontend V3

| Halaman | Route | Status |
|---------|-------|--------|
| Enterprise V3 Hub | `/enterprise` | ✅ 6 tabs: Compliance, Copilot, LMS, Ops, Platform, Analytics |

Nav: sidebar **Enterprise V3** · i18n key `nav.enterprise` (EN/ID).

Halaman modul existing (`/analytics`, `/documents`, `/workflows`, `/integrations`) belum diperluas untuk semua endpoint V3 — gunakan `/enterprise` atau Swagger untuk uji.

---

## Belum / External (bukan coding)

| Item | Status | Catatan |
|------|--------|---------|
| AWS EKS/RDS live deploy | 🟡 | Helm/Terraform/scripts ready — [`scripts/production-checklist.sh`](../../scripts/production-checklist.sh) |
| SOC 2 Type II | 📋 | Doc 24 scaffold |
| Kemenkeu e-Faktur **live** | 🟡 | `EFakturService` stub — butuh production API keys |
| Apple / Google App Store | 🟡 | Expo + `eas.json` ready |
| Stripe marketplace revenue share | 📋 | Stripe integration ada, revenue split belum |
| FastAPI ML microservice | 📋 | Opsional — ensemble ML sudah in-process |
| DocuSign / advanced e-sign | 📋 | Local e-sign MVP done |
| Tesseract / cloud OCR | 📋 | Regex OCR MVP done |
| ClickHouse / TimescaleDB | 📋 | PostgreSQL + ETL scaffold |
| Full microservice split | 📋 | Registry scaffold; masih monolith |

---

## Migration

```bash
cd backend && npm run db:migrate
```

File: `backend/src/database/migrations/1730000000014-Phase58V3Implementation.ts`  
Tables baru: 19 (+ kolom extend `documents`, `signature_requests`)

---

## Git History V3 (19 commits · `7671da1`–`abfb3fc`)

| Commit | Ringkasan |
|--------|-----------|
| `7671da1` | Migration Phase 5–8 |
| `2ccd04a` | Compliance module |
| `134a9c9` | Ops / backup |
| `23164f7` | HR bonus/THR |
| `63fa4d0` | Documents OCR/e-sign/search |
| `d270726` | Analytics copilot/ML/AR risk |
| `b0cdbcf` | Reporting V3 |
| `5892d6b` | Notifications digest |
| `4d46626` | Workflow BPMN |
| `c15a35a` | LMS |
| `2318184` | Auth SSO Azure/SAML |
| `25383e8` | Finance PPh 23/26 |
| `7a6bda7` | Projects auto-invoice |
| `fe65e65` | Immutable audit chain |
| `1fd1f1e` | Platform partner/white-label/ETL |
| `758f708` | Integrations marketplace |
| `5ec6d3c` | AppModule wiring |
| `649b0ac` | Frontend Enterprise V3 |
| `abfb3fc` | Docs (this file) |

---

## Cara Verifikasi

```bash
# Tests
cd backend && npm test          # expect 394 passed

# Dev
cd backend && npm run db:migrate && npm run start:dev
cd frontend && npm run dev

# UI V3
# Login admin@demo.com / Demo1234! → sidebar "Enterprise V3"

# Swagger
# http://localhost:3000/api/docs — tags: Compliance, LMS, AI Copilot, BPMN, etc.
```

---

## Changelog Dokumen

| Tanggal | Perubahan |
|---------|-----------|
| 8 Jul 2026 (AM) | Initial matrix setelah implementasi V3 |
| 8 Jul 2026 (PM) | Sync metrik live (392 tests, 30 pages, 27 modules), depth labels MVP vs production, git log 19 commits, cross-ref Doc 12/25 |

---

*Maintainer: update setiap milestone V3 deploy, hardening, atau perubahan SRS V3.*
| 19 Jul 2026 | dnCore PRD v1.0 full in-repo (`189506d`): plans/quota, Shopify→SO, shipping adapters, webhook retry/DLQ, Grafana, TF Phase-5, **394** tests |

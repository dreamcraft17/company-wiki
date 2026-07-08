# Audit Gap Analysis — dnPeople

> ⚠️ **HISTORICAL SNAPSHOT — 29 Juni 2026**  
> Dokumen ini mencerminkan kondisi codebase **sebelum** Enterprise Pass, Doc 10, dan Fase 3–4 (Jul 2026).  
> **Jangan gunakan sebagai status aktual.** Gunakan:
> - [`12-PROJECT-STATUS.md`](12-PROJECT-STATUS.md) — status live (**Phase 1–4 · ~95%**)
> - [`13-DOCS-01-10-GAP-STATUS.md`](13-DOCS-01-10-GAP-STATUS.md) — gap pass log
> - [`17-REMAINING-SRS-GAPS.md`](17-REMAINING-SRS-GAPS.md) — gap per modul vs SRS

**Tanggal Audit:** 29 Juni 2026  
**Branch:** main  
**Dokumentasi:** 10 file (430+ halaman)  
**Auditor:** Claude Code (claude-sonnet-4-6)

---

## Ringkasan Eksekutif

| Metrik | Didokumentasikan | Terimplementasi | Completion |
|---|---|---|---|
| Modul | 15+ | 15 | ~100% (struktur) |
| Fitur | 150+ | ~40–50 | **~32%** |
| Entitas/Entity | 100+ | ~40 | ~40% |
| API Endpoints | 200+ | ~60 | ~30% |
| Test Coverage | Required | ~10–15 file | **~15%** |
| Frontend Pages | 20+ | 21 | ~100% (shell) |

> **Kesimpulan:** Codebase memiliki scaffold yang solid. Semua modul hadir secara struktural, namun implementasi *business logic* baru mencapai sekitar **32%** dari total requirement yang didokumentasikan.

---

## Status per Modul

### 1. Authentication & Authorization — 40%

**Sudah ada:**
- Login dan registrasi dasar
- JWT authentication
- Guards (JWT + Roles)
- Decorator `@CurrentUser`, `@Roles`, `@Public`

**Belum ada / Tidak lengkap:**
- [ ] SSO dengan SAML / OAuth2
- [ ] Two-Factor Authentication (email/SMS) — framework ada, belum diimplementasi
- [ ] Login attempt throttling (max 5x dalam 15 menit)
- [ ] API Key authentication
- [ ] Auto-refresh token di frontend
- [ ] Password reset dengan pengiriman email
- [ ] Session management di luar JWT
- [ ] OAuth 2.0 untuk API pihak ketiga

---

### 2. General Ledger & Finance — 45%

**Sudah ada:**
- Chart of Accounts seeding (SAK-EP standar Indonesia)
- Entitas jurnal, journal line, accounting period
- Basic GL posting endpoint
- Controller untuk GL, AP, AR, Finance Advanced

**Belum ada / Tidak lengkap:**
- [ ] Period closing automation
- [ ] Automated journal entry reversal
- [ ] Intercompany transactions & reconciliation
- [ ] Bank reconciliation module
- [ ] Logika konversi multi-currency (field ada, logic belum)
- [ ] Kalkulasi accruals dan depresiasi
- [ ] Trial balance dengan detail kalkulasi lengkap

---

### 3. Accounts Payable (AP) — 30%

**Sudah ada:**
- Entitas Vendor, Invoice, Invoice Line

**Belum ada:**
- [ ] 3-way invoice matching (PO + GR + Invoice)
- [ ] Payment scheduling & approval workflow
- [ ] Early payment discount handling
- [ ] Vendor scoring & evaluation
- [ ] Expense management & claim processing
- [ ] Generate payment file (SEPA, ACH)

---

### 4. Accounts Receivable (AR) — 25%

**Sudah ada:**
- Entitas Customer, Invoice

**Belum ada:**
- [ ] Dunning management (eskalasi otomatis tagihan)
- [ ] AR aging reports
- [ ] Credit limit dengan auto-block customer
- [ ] Partial payment handling
- [ ] Invoice customization per customer
- [ ] Payment reconciliation otomatis

---

### 5. Inventory & Supply Chain — 35%

**Sudah ada:**
- Entitas Product, Warehouse, Stock Level, Stock Movement
- Entitas Purchase Order, Purchase Order Line

**Belum ada:**
- [ ] Stock valuation methods (FIFO, LIFO, Average)
- [ ] Multi-warehouse stock transfer logic
- [ ] Barcode / QR code scanning
- [ ] Stock cycle counting workflow
- [ ] Automatic reorder point alerts
- [ ] Demand forecasting
- [ ] MRP (Material Requirements Planning)
- [ ] Supplier scheduling
- [ ] Purchase Requisition → PO workflow
- [ ] RFQ (Request for Quote) automation

---

### 6. Sales Management — 40%

**Sudah ada:**
- Entitas Sales Order, Sales Order Line
- Entitas Sales Quotation, Sales Quotation Line

**Belum ada:**
- [ ] Sales pipeline & forecast tracking
- [ ] Opportunity stages (Lead → Won/Lost)
- [ ] Price list management dengan volume discount
- [ ] Customer segmentation
- [ ] Otomasi Sales Order → Invoice
- [ ] Delivery / shipment tracking
- [ ] Returns management (retur penjualan)

---

### 7. Human Resources — 25%

**Sudah ada:**
- Entitas Employee, Attendance Record, Leave Request, Payroll Run

**Belum ada:**
- [ ] Payroll processing automation
- [ ] Kalkulasi PPh 21 (pajak penghasilan karyawan)
- [ ] Leave balance tracking (logika, bukan hanya entitas)
- [ ] Performance reviews & goal management
- [ ] Recruitment & applicant tracking (ATS)
- [ ] Employee documents & skills management
- [ ] Overtime management
- [ ] Integrasi biometrik (untuk absensi)

---

### 8. Manufacturing — 20%

**Sudah ada:**
- Entitas BOM (Bill of Materials), BOM Line, Manufacturing Order (minimal)

**Belum ada:**
- [ ] BOM versioning
- [ ] Manufacturing order dengan routing
- [ ] Work order management
- [ ] Quality control & defect tracking
- [ ] Production scrap tracking
- [ ] Work center capacity planning

---

### 9. Projects & Time Tracking — 30%

**Sudah ada:**
- Entitas Project, Project Task, Time Entry

**Belum ada:**
- [ ] Task dependencies & timeline (Gantt)
- [ ] Resource allocation & utilization
- [ ] Timesheet approval workflow
- [ ] Billable vs non-billable time tracking
- [ ] Project budgeting & cost tracking logic

---

### 10. Reporting & Analytics — 35%

**Sudah ada:**
- Controller dan endpoint untuk laporan keuangan
- Service untuk Indonesian financial reporting (partial)

**Belum ada:**
- [ ] Custom report builder UI
- [ ] Dashboard customization per role pengguna
- [ ] Scheduled report delivery via email
- [ ] OLAP analysis & trend analysis
- [ ] Drill-down ke detail transaksi
- [ ] Export Excel, PDF, CSV (formatting logic)
- [ ] Verifikasi kelengkapan SAK-EP (Balance Sheet, P&L, Cash Flow, Equity Changes)
- [ ] Predictive analytics

---

### 11. Multi-Tenant Architecture — 40%

**Sudah ada:**
- Entitas Tenant
- Pola TenantId sebagai foreign key

**Belum ada:**
- [ ] Otomasi pembuatan schema database per tenant
- [ ] Database connection switching antar tenant
- [ ] Cross-tenant data isolation validation
- [ ] Resource quotas per tenant
- [ ] Tenant provisioning workflow
- [ ] Billing per tenant

---

### 12. Security & Compliance — 15%

**Sudah ada:**
- JWT + bcrypt password hashing
- Basic RBAC guards

**Belum ada:**
- [ ] AES-256 field-level encryption untuk data sensitif
- [ ] Audit logging menyeluruh pada semua operasi
- [ ] Granular RBAC dengan row-level security
- [ ] API rate limiting per user/IP
- [ ] Web Application Firewall integration
- [ ] Vulnerability scanning di CI/CD
- [ ] Penetration testing framework

---

## Status Sprint (Berdasarkan Doc 06)

### Sprint 1 — Foundation & Core Architecture (Weeks 2–5) — 80% ✅

| Item | Status |
|---|---|
| Backend scaffold NestJS | ✅ |
| Frontend scaffold Vite/React | ✅ |
| Multi-tenant schema design | ✅ |
| Auth service (basic) | ✅ |
| Login/registration pages | ✅ |
| Docker Compose | ✅ |
| CI/CD foundation | ⚠️ Partial |
| Enterprise auth (SSO, 2FA, throttling) | ❌ |

### Sprint 2 — Finance Module MVP (Weeks 6–9) — 40% ⚠️

| Item | Status |
|---|---|
| Chart of Accounts CRUD | ✅ |
| GL transaction posting | ✅ |
| Period management | ⚠️ Basic only |
| Financial statement endpoints | ⚠️ Endpoint ada, logic belum lengkap |
| AP full workflow | ❌ |
| AR full workflow | ❌ |
| AP/AR aging reports | ❌ |
| Payment processing/scheduling | ❌ |

### Sprint 3 — Sales & Supply Chain (Weeks 10–13) — 30% ❌

| Item | Status |
|---|---|
| Customer master | ✅ |
| Sales order entities | ✅ |
| Product/warehouse entities | ✅ |
| Sales pipeline & forecasting | ❌ |
| Procurement workflows (RFQ → PO) | ❌ |
| Stock valuation methods | ❌ |
| Demand forecasting | ❌ |

### Sprint 4 — HR & Polish (Weeks 14–17) — 25% ❌

| Item | Status |
|---|---|
| Employee master | ✅ |
| Attendance entities | ✅ |
| Leave request entities | ✅ |
| Payroll processing | ❌ |
| PPh 21 calculation | ❌ |
| Performance reviews | ❌ |
| Recruitment workflow | ❌ |

---

## Infrastructure & DevOps (Berdasarkan Doc 04)

| Komponen | Requirement | Status | Catatan |
|---|---|---|---|
| Docker Compose | Local dev | ✅ Ada | Functional |
| Kubernetes | Production deploy | ⚠️ Partial | Manifest dasar saja |
| Helm Charts | K8s packaging | ⚠️ Partial | values.yaml minimal |
| Terraform IaC | Cloud provisioning | ❌ Missing | main.tf stub saja |
| Prometheus / Grafana | Observability | ❌ Missing | prometheus.yml ada, tidak terintegrasi |
| ELK Stack | Centralized logging | ❌ Missing | Belum dikonfigurasi |
| Redis Cluster | Caching & session | ❌ Missing | Belum dikonfigurasi |
| RabbitMQ | Async message queue | ❌ Missing | Belum dikonfigurasi |
| DB Replication | HA / disaster recovery | ❌ Missing | Single-instance saja |
| CI/CD (GitHub Actions) | Automation | ⚠️ Partial | Foundation ada, belum lengkap |

---

## Rekomendasi Prioritas

### Prioritas 1 — Segera (Sprint berikutnya)

**1. Complete AP/AR Full Workflows**
- 3-way invoice matching (PO + GR + Invoice)
- Payment scheduling dan approval
- AR aging reports dan dunning management
- Period closing automation
- *Alasan: Core ERP functionality, impact bisnis tertinggi.*

**2. Auth Security Gaps**
- Login throttling (max 5x / 15 menit)
- 2FA via email
- Password reset dengan pengiriman email nyata
- Token auto-refresh di frontend
- *Alasan: Ini adalah SRS requirement, bukan fitur opsional.*

**3. Payroll + PPh 21**
- Payroll processing automation
- Kalkulasi pajak PPh 21 sesuai regulasi Indonesia
- *Alasan: Kompleks, coupled ke compliance lokal (Doc 08), semakin lama semakin sulit diimplementasi.*

---

### Prioritas 2 — Jangka Menengah

**4. Procurement Workflow (Supply Chain)**
- RFQ → Purchase Order → Goods Receipt → 3-way match dengan AP
- Stock valuation FIFO / Average Cost
- *Alasan: Tanpa ini, nilai stok di inventory tidak bermakna.*

**5. SAK-EP Report Verification**
- Verifikasi kelengkapan Balance Sheet, P&L, Cash Flow, Equity Changes
- Tambahkan test coverage untuk memvalidasi akurasi angka laporan
- *Alasan: Endpoint ada tapi completeness terhadap standar SAK-EP belum terkonfirmasi (Doc 08 & 10).*

**6. Test Coverage (target > 60%)**
- Unit test untuk finance services
- Integration test untuk auth flows
- E2E test untuk GL posting end-to-end
- *Alasan: SRS (Doc 02) mensyaratkan ini sebelum production readiness.*

---

### Prioritas 3 — Jangka Panjang

**7. Infrastructure Hardening**
- Redis untuk session store dan caching
- RabbitMQ untuk async jobs (payroll run, report generation)
- Prometheus scrape integration
- *Alasan: Diperlukan sebelum load testing dan staging deployment.*

**8. Multi-Tenant Database Isolation**
- Schema-per-tenant creation automation
- Database connection switching
- *Alasan: SDD (Doc 03) mendokumentasikan ini sebagai core requirement. Saat ini hanya TenantId FK — bukan true isolation.*

**9. SSO / OAuth2 / Enterprise Auth**
- SAML integration untuk enterprise customer
- OAuth2 untuk third-party API authentication
- *Alasan: Diperlukan untuk segmen enterprise sesuai GTM (Doc 05).*

---

## Estimasi Effort Tersisa

Berdasarkan kompleksitas fitur yang belum diimplementasi:

| Area | Estimasi Sprint (2 minggu/sprint) |
|---|---|
| Finance (AP/AR lengkap + period closing) | 3–4 sprint |
| HR (payroll + PPh 21 + performance) | 2–3 sprint |
| Supply Chain (procurement workflow + MRP) | 3–4 sprint |
| Sales (pipeline + delivery + returns) | 2–3 sprint |
| Auth (enterprise features) | 1–2 sprint |
| Reporting (export + custom builder + OLAP) | 2–3 sprint |
| Manufacturing (work order + QC) | 2–3 sprint |
| Infrastructure hardening | 1–2 sprint |
| Testing (unit + integration + E2E) | 2–3 sprint |
| **Total estimasi** | **18–27 sprint** |

> Dengan asumsi tim 2–3 developer, estimasi menuju production-ready: **9–14 bulan**.

---

*Dokumen ini dibuat berdasarkan perbandingan antara Docs/01 hingga Docs/10 dengan kondisi aktual codebase di branch `main` per 29 Juni 2026.*

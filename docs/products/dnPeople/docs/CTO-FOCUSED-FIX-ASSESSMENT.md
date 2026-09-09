# dnPeople — CTO Assessment & Focused-Fix Report

> **Author:** Dozer  
> **Date:** 2026-08-23  
> **Status:** Active · **Release baseline:** v1.1.0 (`7b96875`)  
> **Scope:** Platform CTO review + focused-fix Phases 1–3 (payment/billing)

## Summary

dnPeople adalah HRIS SaaS multi-tenant (Express + Next.js + PostgreSQL) di **soft launch** dengan billing Xendit/Midtrans, admin console, dan ~130 model Prisma. Backend **125/125** unit test lulus; arsitektur modular monolith **cukup matang** untuk tahap ini.

Fokus risiko terbesar bukan arsitektur makro, melainkan **dual-gateway billing** (beberapa path masih Xendit-only), **ops gates** (migration prod, SLO formal, pen-test), dan **dependency audit** (4 HIGH backend, 6 HIGH frontend). Laporan ini menggabungkan lensa **CTO Advisor** (tech debt, metrik, prioritas bisnis) dan **Focused-Fix** (scope → trace → diagnose modul payment/billing).

---

## Bottom Line (CTO)

| Verdict | Detail |
|---------|--------|
| **Go untuk soft launch billing** | ✅ Dengan syarat: deploy migration `20260822100000`, set `XENDIT_WEBHOOK_TOKEN`, 1× E2E payment di staging/prod |
| **Bloker produksi penuh** | ⚠️ Dual-gateway gaps (Midtrans sync/public pay), npm audit CI fail, SLO tidak terdokumentasi, pen-test eksternal belum |
| **Tech debt ratio (estimasi)** | ~20–25% kapasitas engineering → maintenance/hardening vs fitur baru (target CTO: &lt; 25%) |
| **10× traffic** | Postgres connection pool + scheduler in-process jadi bottleneck pertama; belum perlu microservices |

**Keputusan yang disarankan:** Alokasikan **1 sprint hardening billing** sebelum PRD v16 greenfield; jangan tambah gateway/provider baru sampai dual-gateway path lengkap.

---

## Engineering Health Dashboard (DORA + CTO)

| Kategori | Metrik | dnPeople (🟢 verified / 🟡 medium / 🔴 assumed) | Target CTO |
|----------|--------|--------------------------------------------------|------------|
| Velocity | Deployment frequency | 🟡 Push ke `main` + CI; deploy VPS manual | Daily |
| Velocity | Lead time for changes | 🟡 Tidak terukur formal | &lt; 1 hari |
| Quality | Change failure rate | 🟡 Tidak terukur | &lt; 5% |
| Quality | MTTR | 🔴 Tidak terdokumentasi | &lt; 1 jam |
| Quality | Unit tests backend | 🟢 **125/125** pass | 100% gate |
| Quality | npm audit HIGH | 🔴 Backend 4, Frontend 6 | 0 (CI gate aktif) |
| Architecture | Uptime prod | 🔴 Tidak ada SLO doc | &gt; 99.5% (single VPS) |
| Architecture | API p95 | 🟡 CI load smoke p95 &lt; 2s (health-style) | &lt; 600 ms authenticated |
| Debt | P0 terbuka (billing) | 🟡 4 CRITICAL focused-fix (lihat bawah) | 0 |
| Team | Bus factor | 🟡 Monolith + Dozer-led | Document runbooks |

---

## Tech Debt Inventory (Prioritized)

Skor prioritas: `(Severity × Blast Radius) / Cost-to-fix` — tinggi = perbaiki dulu.

| # | Item | Severity | Blast | Cost | Skor | Owner saran |
|---|------|----------|-------|------|------|-------------|
| 1 | Midtrans sync + public invoice pay broken | P0 | Billing semua tenant Midtrans | 3–5 h | **HIGH** | Backend + Frontend |
| 2 | `billing.service` ignore explicit provider | P1 | Subscription invoice API | 1 h | **HIGH** | Backend |
| 3 | Migration pending unique belum prod | P0 | Duplicate checkout race | 0.5 h ops | **HIGH** | DevOps |
| 4 | npm audit HIGH (backend 4, frontend 6) | P1 | CI + supply chain | 2–4 h | **MED** | Platform |
| 5 | Admin billing refund UI vs gateway guard | P1 | Finance ops | 2 h | **MED** | Frontend + Backend |
| 6 | Tidak ada SLO / error budget doc | P1 | Prioritas reliability | 0.5 h | **MED** | CTO/Tech Lead |
| 7 | Payment integration tests missing | P2 | Regresi webhook/settlement | 3–5 h | **MED** | Backend |
| 8 | In-process schedulers (multi-instance) | P2 | Scale horizontal | 2–3 d | **LOW** | Platform (nanti) |
| 9 | Stripe branch dead-end | P3 | Hampir tidak dipakai | 1 h remove/doc | **LOW** | Backend |
| 10 | Commit lint: junk commits `asd` di history | P3 | Hygiene | 0 | **LOW** | Process |

### Remediation plan (kuartal)

| Bucket | Items | Estimasi |
|--------|-------|----------|
| **Sprint immediate** | #1–3, #5 partial | 1 sprint (~1 minggu) |
| **Next quarter** | #4, #6, #7 | 2 sprint |
| **Backlog** | #8–10 | Saat scale atau cleanup |

---

## Build vs Buy — Payment Gateway

| Opsi | 3-y TCO | Risk | Keputusan |
|------|---------|------|-----------|
| **Buy Xendit + Midtrans** (current) | License + integrasi ~rendah vs build | Vendor lock medium; migrasi sulit | ✅ **Accepted** — bukan core IP |
| Build internal PG | Sangat tinggi | Compliance PCI | ❌ Reject |
| Stripe saja | Sedang | IDR/local methods | ❌ Superseded by Xendit |

**ADR disarankan:** `docs/adr/0001-dual-payment-gateway.md` — dokumentasikan active provider flag, fallback, dan reversibility.

---

## Architecture Snapshot

```
Next.js (hris.dntech.id)
        │
        ▼
Express API (~56 route modules, 130 Prisma models)
  ├── Auth: JWT + cookie + API key (scoped)
  ├── Tenant: companyId + enforceTenantIsolation
  ├── Billing: payment.service + billing.service + schedulers
  └── Ops: /alive · /health · /ready · /metrics (token gated prod)
        │
        ▼
PostgreSQL 16 (+ S3 optional, email outbox in DB)
```

**Profil:** `node-express` modular monolith — cocok untuk tim kecil–menengah, shared multi-tenant, data sensitivity **PII + payroll**.

---

## Focused-Fix: Payment / Billing (Phases 1–3)

> **Iron Law:** Tidak ada fix diterapkan dalam sesi ini — diagnosis only.

### Phase 1 — Feature Scope

```
FEATURE SCOPE:
  Primary: backend/src/services/payment.service.ts (~1059 LOC)
           backend/src/services/billing.service.ts
           backend/src/routes/payments.ts
           backend/src/lib/{xendit,midtrans,paymentWebhook,paymentIdempotency,
                            paymentStatusTransition,billingStartup}.ts
  Frontend: src/app/(app)/billing/page.tsx
            src/app/admin/{billing,payments,payment-gateway}/page.tsx
            src/app/payment/invoice/[invoiceId]/page.tsx
  Migrations: 20260726020000_midtrans_* · 20260808100000_xendit_* · 20260822100000_payment_pending_unique
  Total: ~18 files · ~3,700 LOC (+ migrations)
```

**Entry points:** webhooks Xendit/Midtrans · `POST /payments/*` · public invoice pay · subscription billing scheduler · startup webhook assert.

### Phase 2 — Dependency Map (ringkas)

| Inbound | Outbound |
|---------|----------|
| Prisma (`Payment`, `SubscriptionInvoice`, …) | `index.ts` mounts routes |
| Xendit / Midtrans / Stripe APIs | `subscription.ts`, `public.ts`, `admin.ts` |
| `getActivePaymentProvider()` feature flag | Frontend billing + admin pages |
| Env: `XENDIT_*`, `MIDTRANS_*`, `FRONTEND_URL` | `subscriptionBillingScheduler` reconcile |

### Phase 3 — Diagnosis Report

#### CRITICAL (4)

| ID | Lokasi | Masalah | Root cause |
|----|--------|---------|------------|
| **C1** | `payment.service.ts` `syncPaymentByOrderId` | Sync return-url **hanya Xendit** | Midtrans return flow tidak pernah diimplementasi |
| **C2** | `billing.service.ts` + `initiatePayment` | Provider eksplisit di request **diabaikan** | `initiatePayment` selalu pakai active provider DB |
| **C3** | `payment/invoice/[invoiceId]/page.tsx` | Public pay hanya `checkout_url` | SNAP (`snap_token`) tidak di-wire |
| **C4** | `admin/billing` vs Payment Management | Refund invoice PAID ditolak untuk gateway | Dua path refund tidak selaras |

#### WARNINGS (7)

| ID | Risk | Masalah |
|----|------|---------|
| W1 | MED | Reconcile Xendit polling semua PENDING &lt; 24 jam (asymmetric vs Midtrans) |
| W2 | MED | Reservasi PENDING gagal gateway → waiter block 45s tanpa cleanup |
| W3 | MED | Stripe branch tidak persist `Payment` / webhook |
| W4 | MED | `applyRefundWebhook` tanpa conditional status transition |
| W5 | MED | Refund admin mark PROCESSED sync tanpa webhook konfirmasi |
| W6 | MED | Partial unique index di migration, tidak di `schema.prisma` |
| W7 | LOW | Kolom `midtransResponseFull` dipakai untuk Xendit JSON |

#### Tests

| Suite | Hasil |
|-------|-------|
| Backend total | 🟢 **125/125** pass |
| Payment unit (mapping, idempotency, signature) | 🟢 ~37 pass |
| Integration `initiatePayment` / webhook E2E | 🔴 **0** — gap coverage |
| Frontend billing E2E | 🔴 Tidak ada |

#### npm audit (--audit-level=high)

| Repo | HIGH | Catatan |
|------|------|---------|
| Backend | 4 | `brace-expansion`, `deepmerge-ts` via Prisma |
| Frontend | 6 | `sharp` via Next (fix may bump Next major) |

---

## Yang Sudah Baik (post v1.1.0)

- Payment webhook concurrency: `transitionPaymentStatus` + skip duplicate `onSettled` (`7b96875`)
- Checkout race: advisory lock + partial unique index migration
- Audit strict: payroll finalize, mark-paid, admin login, UPDATE_ROLE
- Tenant isolation + API key scopes + tier gating
- Payroll finalize atomic claim (v8 B03)
- CI: typecheck, 125 tests, DB verify, load smoke, npm audit gate, commit lint on push
- Secrets fail-closed production (`requireSecret`)

---

## Recommended Actions

### P0 — minggu ini

1. **Deploy migration** `20260822100000_payment_pending_unique` di prod  
   ```bash
   cd backend && npx prisma migrate deploy
   ```
2. **Set** `XENDIT_WEBHOOK_TOKEN` — verifikasi startup warning hilang
3. **1× E2E payment** Xendit di staging/prod (initiate → pay → webhook → invoice PAID)
4. ~~**Fix C2**~~ — `provider` override di `initiatePayment` + billing.service

### P1 — sprint billing hardening ✅ (2026-08-23)

5. ~~**Fix C1 + C3**~~ — Midtrans-aware `syncPaymentByOrderId` + public invoice SNAP modal  
6. ~~**Fix C4**~~ — admin billing: gateway refunds → link ke Payment Management  
7. ~~**Doc SLO**~~ — [SLO.md](./SLO.md)  
8. ~~**ADR**~~ — [adr/0001-dual-payment-gateway.md](./adr/0001-dual-payment-gateway.md)  
9. ~~**Integration tests**~~ — `paymentSync.test.ts` (+ existing webhook/idempotency tests)

### P2 — kuartal

10. Resolve npm audit atau document accepted risk dengan owner review  
11. k6 authenticated scenario dengan seed 300 karyawan  
12. External pen-test (ops gate)

---

## Red Flags (CTO Proactive)

| Signal | Status | Aksi |
|--------|--------|------|
| No ADRs for payment gateway decision | 🔴 | Buat ADR #0001 |
| npm audit CI may fail on push | 🟡 | Track Prisma/sharp upgrades |
| Junk commits on main (`asd`) | 🟡 | Commit lint now on push — future only |
| Single VPS + in-process schedulers | 🟡 | OK until 2nd instance needed |
| Pen-test &gt; 12 bulan | 🔴 | Schedule before enterprise sales |

---

## Confidence Tags

| Finding | Tag |
|---------|-----|
| 125 tests pass | 🟢 verified (npm test 2026-08-23) |
| 4 CRITICAL billing gaps | 🟢 verified (code trace) |
| Tech debt ratio 20–25% | 🟡 estimated |
| Prod uptime / MTTR | 🔴 assumed — no telemetry doc |
| 10× traffic bottleneck | 🟡 inferred (Postgres + single Node) |

---

## Related Docs

- [CURRENT-IMPLEMENTATION.md](./CURRENT-IMPLEMENTATION.md)
- [CHANGELOG.md](./CHANGELOG.md)
- [xendit/XENDIT-PAYMENT-SETUP.md](./xendit/XENDIT-PAYMENT-SETUP.md)
- [LAUNCH-GATE-CHECKLIST.md](./LAUNCH-GATE-CHECKLIST.md)
- [AUDIT-FEATURE-BUG-PERFORMANCE.md](./AUDIT-FEATURE-BUG-PERFORMANCE.md)

---

## Appendix — CTO Key Questions Answered

| Question | Jawaban |
|----------|---------|
| Biggest technical risk? | Dual-gateway billing paths tidak lengkap + migration belum prod |
| What breaks at 10× traffic? | DB connections, payroll/report aggregations, scheduler duplication if multi-instance |
| Maintenance vs features? | ~20–25% post v1.1.0 hardening; naik jika skip billing sprint |
| New engineer week 1? | README + docs solid; payment dual-gateway confusing without ADR |
| Decision hurting us from 2 years ago? | N/A (product young); **midtransResponseFull** naming legacy minor pain |
| Building because interesting? | No — Xendit/Midtrans buy decision correct |
| Bus factor? | Runbooks partial; payment ops needs doc after fixes |

---

*Generated from `/cto-advisor` + `/focused-fix` (payment/billing). Phase 4 FIX not applied — implement via separate task or `/focused-fix` continuation.*

# dnPeople — Briefing Dasar PRD Berikutnya

| | |
|---|---|
| **Dokumen** | Satu file utuh untuk menulis PRD produk berikutnya |
| **Tanggal** | 26 Juli 2026 |
| **Baseline kode** | Setelah PRD **v15.0** Admin Dashboard & Control Panel |
| **HEAD referensi** | Post-v15.0 Admin Console (impersonation, MFA gate, flags runtime, alerts/logs) |
| **Owner** | Dozer (CEO + Tech Lead) |
| **Company** | DN Tech · Brand: DnPeople |
| **Ganti dokumen ini?** | Update saat PRD berikutnya di-sign-off atau HEAD baseline berubah |

> **Cara pakai:** Baca file ini dari atas ke bawah. Jangan janjikan ulang yang ada di §3 sebagai “fitur baru”. Tulis PRD hanya untuk §5–§6 (atau pecahan Module). Setiap story wajib memenuhi §8.

---

## 1. Keputusan singkat: PRD berikutnya tentang apa?

| Jalur | Isi | Kapan |
|-------|-----|--------|
| **A — Ops go-live** | DNS, Datadog/PagerDuty, pen-test, restore drill bertanda tangan, beta 10–20, payment keys live | Soft launch Agustus masih open |
| **B — Produk greenfield** | **PRD v4 Module 4–8** — career marketplace, EWA, salary bench, verticals | Setelah / paralel ops |

**Rekomendasi produk P0:** **Module 4 — Internal career marketplace**  
(Module 3 9-box **Done** v13.0; tutorial/KB **Done** v14.0; Admin Console **Done** v15.0.)

Nomor versi PRD produk berikutnya yang wajar: **v16.0** (lanjutan setelah v15.0), subtitle Module 4 (atau “Career Mobility”).

---

## 2. Snapshot produk saat ini (jangan di-rebuild)

| Item | Nilai |
|------|--------|
| Produk | HRIS multi-tenant Indonesia |
| Frontend | Next.js · ~**86** halaman · mobile-first (+ `/admin/*`) |
| Backend | Express `/api/v1` · ~**56** route modules · SCIM `/scim/v2` |
| Data | PostgreSQL + Prisma · ~**120** models · migrasi wajib deploy |
| Tests | Backend **53/53** |
| Tier | FREE hard **30** · STARTER hard **50** · Prof **300** · Business soft@1000 · Enterprise custom |
| Talent | `talent:competency` / `talent:idp` / **`talent:matrix`** / `lms` @ PROFESSIONAL+ |
| Help | Feature `tutorials` @ FREE+ — Help menu, 5 interactive tutorials, KB search (no video library) |
| Admin | `/admin` SUPER_ADMIN — customers, billing, analytics, tickets, content, flags, health, audit; MFA gate |

**Roles:** `SUPER_ADMIN` · `COMPANY_ADMIN` · `HR` · `MANAGER` · `FINANCE` · `EMPLOYEE`  
HR **tanpa** payroll/salary · Finance **payroll** + read 9-box · isolasi tenant + row scope wajib.

---

## 3. Yang sudah Done (termasuk v15.0)

Semua MVP 1–5 + PRD v5–v14.0 tetap berlaku, **plus v15.0**:

- Internal Admin Console `/admin` (own shell, SUPER_ADMIN only)
- Customers: list/sort/filter, detail, trial extend, notes, block, impersonation banner + end
- Revenue & billing: MRR/ARR/churn/trend, payments, refund modal
- Analytics: features, tutorials/KB, churn, support trends, cohorts
- Support tickets: queue, reply, escalate, close + CSAT email, send KB from suggest
- Content CRUD: tutorials & KB articles + publish
- Feature flags: toggle/rollout/tier + history; runtime gate via `featureAccess`
- System health: API/DB/queue, AdminNotification alerts + ack, logs viewer, audit log
- Admin MFA: `requireAdminMfa` (escape lokal `ADMIN_MFA_OPTIONAL=true`)
- **Out of honest 100%:** live latency P50/P95/P99 / error-rate until Prometheus/Datadog

Juga jangan rebuild: 9-box / succession (v13), tutorials/KB (v14), competency/IDP/LMS foundation.

---

## 4. Conditional (ops / UAT eksternal)

Sama seperti briefing sebelumnya: DNS, Datadog, pen-test, beta cohort, payment live, IdP/SCIM UAT, bank file acceptance. Plus admin live latency metrics.

---

## 5. Greenfield berikutnya (Module 4–8)

| Prioritas | Module | Fokus |
|-----------|--------|--------|
| **P0** | **v4 Mod 4** | Internal career marketplace / job posting internal / apply |
| **P1** | Mod 5–6 | EWA + external salary benchmarking (partner Conditional) |
| **P2** | Mod 7–8 | Manufacturing / retail vertical packages |

### Out of scope kecuali PRD eksplisit
- Video tutorial library (explicitly dropped from v14)
- Re-implement Admin Console (v15 Done)
- WebSocket real-time comments on calibration
- Native mobile / physical SILO
- Re-write payroll/tax

---

## 6. Outline singkat PRD v16.0 (Module 4) — skeleton

- Outcome: karyawan lihat lowongan internal; apply; HR/manager pipeline; link ke competency gap & succession.
- Tier usulan: PROFESSIONAL+ atau BUSINESS — putuskan di PRD.
- RBAC: EMPLOYEE self-apply; MANAGER recommend; HR manage postings.
- DoD: migration, API, UI, tests, FEATURE-CATALOG + wiki mirror.

---

## 7. Checklist story (wajib)

Sama pola v13/v14/v15: acceptance, RBAC, tenant isolation, audit, tier gate, mobile, export jika relevan, no payroll regression.

---

## 8. Satu kalimat penutup

> dnPeople **sudah punya** Module 3 talent matrix (v13.0), in-app tutorial/KB (v14.0), dan Admin Console (v15.0). PRD berikutnya = **Module 4+ (v16.0)** dan/atau **ops go-live** — jangan ulangi 9-box, video library, atau admin console.

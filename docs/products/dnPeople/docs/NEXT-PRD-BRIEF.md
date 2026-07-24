# dnPeople — Briefing Dasar PRD Berikutnya

| | |
|---|---|
| **Dokumen** | Satu file utuh untuk menulis PRD produk berikutnya |
| **Tanggal** | 24 Juli 2026 |
| **Baseline kode** | Setelah PRD **v13.0** Talent Matrix & Succession (Module 3) |
| **HEAD referensi** | Lokal v13.0 (commit when asked) · sebelumnya docs `61d956f` / v12.1 |
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
(Module 3 9-box + succession **Done** di v13.0.)

Nomor versi PRD produk berikutnya yang wajar: **v14.0** (lanjutan setelah v13.0), subtitle Module 4 (atau “Career Mobility”).

---

## 2. Snapshot produk saat ini (jangan di-rebuild)

| Item | Nilai |
|------|--------|
| Produk | HRIS multi-tenant Indonesia |
| Frontend | Next.js · ~**67** halaman · mobile-first |
| Backend | Express `/api/v1` · ~**54** route modules · SCIM `/scim/v2` |
| Data | PostgreSQL + Prisma · ~**109** models · migrasi wajib deploy |
| Tests | Backend **41/41** |
| Tier | FREE/STARTER hard **50** emp · Prof **300** · Business soft@1000 · Enterprise custom |
| Talent | `talent:competency` / `talent:idp` / **`talent:matrix`** / `lms` @ PROFESSIONAL+ |

**Roles:** `SUPER_ADMIN` · `COMPANY_ADMIN` · `HR` · `MANAGER` · `FINANCE` · `EMPLOYEE`  
HR **tanpa** payroll/salary · Finance **payroll** + read 9-box · isolasi tenant + row scope wajib.

---

## 3. Yang sudah Done (termasuk v13.0 Module 3)

Semua MVP 1–5 + PRD v5–v12.1 tetap berlaku, **plus**:

- 9-box sessions/placements, auto-score, lock (semua placement di sesi lengkap), unlock + reason
- Succession plans, readiness scoring + HR override
- Development proposals → IDP goal / LMS enroll on approve
- Reports matrix/succession/proposals (`xlsx`/`pdf`/`html`)
- UI: `/talent/matrix`, `/talent/sessions`, `/talent/succession`, `/talent/settings`, `/talent/reports`
- Nav hide by `hasFeature('talent:matrix')`

Jangan rebuild competency/IDP/LMS foundation.

---

## 4. Conditional (ops / UAT eksternal)

Sama seperti briefing v12.1: DNS, Datadog, pen-test, beta cohort, payment live, IdP/SCIM UAT, bank file acceptance.

---

## 5. Greenfield berikutnya (Module 4–8)

| Prioritas | Module | Fokus |
|-----------|--------|--------|
| **P0** | **v4 Mod 4** | Internal career marketplace / job posting internal / apply |
| **P1** | Mod 5–6 | EWA + external salary benchmarking (partner Conditional) |
| **P2** | Mod 7–8 | Manufacturing / retail vertical packages |

### Out of scope kecuali PRD eksplisit
- WebSocket real-time comments on calibration
- Native mobile / physical SILO
- Re-write payroll/tax

---

## 6. Outline singkat PRD v14.0 (Module 4) — skeleton

- Outcome: karyawan lihat lowongan internal; apply; HR/manager pipeline; link ke competency gap & succession.
- Tier usulan: PROFESSIONAL+ atau BUSINESS — putuskan di PRD.
- RBAC: EMPLOYEE self-apply; MANAGER recommend; HR manage postings.
- DoD: migration, API, UI, tests, FEATURE-CATALOG + wiki mirror.

---

## 7. Checklist story (wajib)

Sama pola v13: acceptance, RBAC, tenant isolation, audit, tier gate, mobile, export jika relevan, no payroll regression.

---

## 8. Satu kalimat penutup

> dnPeople **sudah punya** Module 3 talent matrix (v13.0). PRD berikutnya = **Module 4+** dan/atau **ops go-live** — jangan ulangi 9-box.

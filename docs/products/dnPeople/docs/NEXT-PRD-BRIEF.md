# dnPeople — Briefing Dasar PRD Berikutnya

| | |
|---|---|
| **Dokumen** | Satu file utuh untuk menulis PRD produk berikutnya |
| **Tanggal** | 25 Juli 2026 |
| **Baseline kode** | Setelah PRD **v14.0** In-App Tutorial & Onboarding |
| **HEAD referensi** | `87c7a49` (PRD v14.0 Tutorial Onboarding) · sebelumnya v13.0 talent matrix |
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
(Module 3 9-box + succession **Done** di v13.0; in-app tutorial/KB **Done** di v14.0.)

Nomor versi PRD produk berikutnya yang wajar: **v15.0** (lanjutan setelah v14.0), subtitle Module 4 (atau “Career Mobility”).

---

## 2. Snapshot produk saat ini (jangan di-rebuild)

| Item | Nilai |
|------|--------|
| Produk | HRIS multi-tenant Indonesia |
| Frontend | Next.js · ~**73** halaman · mobile-first |
| Backend | Express `/api/v1` · ~**55** route modules · SCIM `/scim/v2` |
| Data | PostgreSQL + Prisma · ~**114** models · migrasi wajib deploy |
| Tests | Backend **47/47** |
| Tier | FREE hard **30** · STARTER hard **50** · Prof **300** · Business soft@1000 · Enterprise custom |
| Talent | `talent:competency` / `talent:idp` / **`talent:matrix`** / `lms` @ PROFESSIONAL+ |
| Help | Feature `tutorials` @ FREE+ — Help menu, 5 interactive tutorials, KB search (no video library) |

**Roles:** `SUPER_ADMIN` · `COMPANY_ADMIN` · `HR` · `MANAGER` · `FINANCE` · `EMPLOYEE`  
HR **tanpa** payroll/salary · Finance **payroll** + read 9-box · isolasi tenant + row scope wajib.

---

## 3. Yang sudah Done (termasuk v14.0)

Semua MVP 1–5 + PRD v5–v13.0 tetap berlaku, **plus v14.0**:

- Help menu (?) di AppShell → Getting Started / Knowledge Base / Get Help
- 5 interactive tutorials + step progress + rate helpful
- Tier lock: FREE = employee/attendance/leave; STARTER+ = payroll; PROFESSIONAL+ = performance
- Knowledge base search, article detail, helpful votes
- API `/api/v1/tutorials/*`, `/api/v1/kb/*`, `/api/v1/admin/analytics/tutorials`
- Kill switch `FEATURE_TUTORIALS=false`
- **Out of v14 live scope:** video library / YouTube embeds / `/help/videos`

Juga jangan rebuild: 9-box / succession (v13), competency/IDP/LMS foundation.

---

## 4. Conditional (ops / UAT eksternal)

Sama seperti briefing sebelumnya: DNS, Datadog, pen-test, beta cohort, payment live, IdP/SCIM UAT, bank file acceptance.

---

## 5. Greenfield berikutnya (Module 4–8)

| Prioritas | Module | Fokus |
|-----------|--------|--------|
| **P0** | **v4 Mod 4** | Internal career marketplace / job posting internal / apply |
| **P1** | Mod 5–6 | EWA + external salary benchmarking (partner Conditional) |
| **P2** | Mod 7–8 | Manufacturing / retail vertical packages |

### Out of scope kecuali PRD eksplisit
- Video tutorial library (explicitly dropped from v14)
- WebSocket real-time comments on calibration
- Native mobile / physical SILO
- Re-write payroll/tax

---

## 6. Outline singkat PRD v15.0 (Module 4) — skeleton

- Outcome: karyawan lihat lowongan internal; apply; HR/manager pipeline; link ke competency gap & succession.
- Tier usulan: PROFESSIONAL+ atau BUSINESS — putuskan di PRD.
- RBAC: EMPLOYEE self-apply; MANAGER recommend; HR manage postings.
- DoD: migration, API, UI, tests, FEATURE-CATALOG + wiki mirror.

---

## 7. Checklist story (wajib)

Sama pola v13/v14: acceptance, RBAC, tenant isolation, audit, tier gate, mobile, export jika relevan, no payroll regression.

---

## 8. Satu kalimat penutup

> dnPeople **sudah punya** Module 3 talent matrix (v13.0) dan in-app tutorial/KB (v14.0). PRD berikutnya = **Module 4+ (v15.0)** dan/atau **ops go-live** — jangan ulangi 9-box atau video library.

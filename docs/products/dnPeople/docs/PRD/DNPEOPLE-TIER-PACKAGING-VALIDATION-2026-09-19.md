---
title: "dnPeople Tier Packaging Validation"
owner: Dozer
status: ready-for-field-validation
canonical: true
last_reviewed: 2026-09-19
review_cycle: monthly
---

# Tier Packaging Validation

Artefak operasional untuk menutup keputusan yang tidak dapat dibuktikan dari codebase saja: package comprehension/pricing dan demand native app, AI, EWA, serta salary benchmarking.

## Keputusan yang sedang diuji

| Keputusan | Current hypothesis | Status |
|---|---|---|
| Harga Starter | Rp10.000/karyawan/bulan, minimum Rp150.000 | Implemented; validate willingness-to-pay |
| Harga Professional | Rp15.000/karyawan/bulan, minimum Rp20.000 | Implemented; validate upgrade comprehension |
| Harga Business | Rp20.000/karyawan/bulan, minimum Rp6.000.000 | Implemented; validate package fit |
| Multi-branch | Professional; Business menambah API/webhooks/workflow/control | Implemented; validate branch complexity threshold |
| Native app, AI, EWA, benchmarking | Bukan roadmap committed sebelum demand evidence | Pending field evidence |

## Interview plan: 5–10 buyer

Target: owner/HR lead/Finance lead dari perusahaan 20–300 karyawan; minimal 2 perusahaan multi-cabang dan 2 pengguna payroll aktif.

### Pertanyaan inti

1. Berapa karyawan, cabang, dan siapa yang menjalankan payroll setiap bulan?
2. Dari tiga paket Rp10k / Rp15k / Rp20k, paket mana yang paling mudah dipahami dan mengapa?
3. Apakah multi-branch terasa sebagai kebutuhan Starter, Professional, atau Business? Apa pemicu upgrade?
4. Apakah payroll review/evidence lebih bernilai daripada sekadar payroll calculation? Bukti apa yang wajib ada sebelum approve?
5. Fitur apa yang saat ini memerlukan Excel/manual reconciliation?
6. Dalam 90 hari terakhir, apakah Anda mencari native app, AI HR, EWA, atau salary benchmarking? Apa trigger dan budgetnya?
7. Apa yang membuat Anda tidak mau pindah dari sistem sekarang?
8. Minta buyer memilih paket dan menjelaskan ulang batasan tiap paket dengan kata-katanya sendiri.

### Capture template

| Field | Isi |
|---|---|
| Interview ID / tanggal |  |
| Segment / headcount / branches |  |
| Role / current system |  |
| Package chosen without prompting |  |
| Package boundary understood? | Yes / No + quote |
| Payroll evidence must-have |  |
| Native/AI/EWA/benchmarking trigger |  |
| Price objection |  |
| Next action |  |

## Decision rule

- Packaging: minimal 7/10 buyer memilih paket target dan dapat menjelaskan alasan upgrade tanpa dibantu.
- Payroll evidence: minimal 4/5 payroll users menyebut reviewability/audit evidence sebagai pain aktif.
- Roadmap feature: discovery hanya jika minimal 3/10 buyer punya pain aktif, trigger dalam 90 hari, dan willingness untuk pilot/paid validation.
- Jika rule gagal, revisi copy/experiment; jangan menambah feature hanya karena wishlist.

## Status evidence

Belum ada hasil interview customer yang tercatat di repo ini per 2026-09-19. Instrument dan decision rule sudah siap, tetapi status belum boleh disebut “validated”.

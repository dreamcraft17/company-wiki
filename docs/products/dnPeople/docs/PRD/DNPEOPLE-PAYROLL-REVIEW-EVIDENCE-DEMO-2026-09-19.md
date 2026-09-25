---
title: "dnPeople Payroll Review & Evidence Demo"
owner: Dozer
status: ready-for-demo
canonical: true
last_reviewed: 2026-09-19
review_cycle: monthly
---

# Payroll Review & Evidence Demo

Dokumen ini menjadi script demo dan acceptance proof utama Professional. Fokusnya membuktikan bahwa Finance/HR dapat memahami, meninjau, mengunci, dan membuktikan hasil payroll.

## Pesan utama

> “Sebelum payroll dikunci, tim dapat melihat apa yang berubah, mengapa berubah, siapa yang menyetujui, dan slip mana yang dapat diverifikasi.”

## Script demo 12 menit

| Menit | Aksi | Bukti yang harus terlihat |
|---:|---|---|
| 0–2 | Pilih periode payroll dan scope cabang | Periode, cabang, jumlah karyawan, status run |
| 2–4 | Tunjukkan input attendance, leave, overtime, komponen gaji | Sumber input dan status kelengkapan |
| 4–6 | Jalankan preview payroll | Gross, deduction, employer cost, net; warning sebelum finalize |
| 6–8 | Review per karyawan dan filter variance | Nilai sebelum/sesudah, alasan perubahan, komponen penyebab |
| 8–9 | Minta approval/review Finance | Actor, timestamp, komentar, status approval |
| 9–10 | Finalize payroll | Status berubah atomic; run tidak dapat diubah diam-diam |
| 10–11 | Buka payslip dan verifikasi | Payslip konsisten dengan hasil final |
| 11–12 | Export evidence/audit | Run ID, periode, actor, approval, warning, finalize, identifier export |

## Basic vs advanced taxonomy

| Domain | Starter / basic | Professional / advanced |
|---|---|---|
| Attendance | Clock-in/out manual, GPS/QR, history, summary, correction, leave dan shift | WiFi/selfie check-in dan offline sync |
| Payroll | Payroll run, konfigurasi komponen, gross calculation, basic report dan approval inbox | BPJS/PPh 21, NET/GROSS-UP, template payroll, variable compensation, overtime/claims/loans, preview-review-finalize evidence |

Payroll basic tetap tersedia di Starter; endpoint advanced pada payroll settings memakai `payroll:advanced`. Taxonomy ini harus sama di gate backend, route frontend, katalog, upgrade copy, dan demo.

## Acceptance proof

- [ ] Preview tidak mengubah hasil final dan dapat dijalankan ulang dengan input sama.
- [ ] Review memperlihatkan variance yang dapat ditelusuri ke attendance, leave, overtime, komponen, atau konfigurasi pajak.
- [ ] Warning validasi terlihat sebelum finalize; unresolved warning tidak hilang diam-diam.
- [ ] Finalize bersifat atomic dan memiliki actor serta timestamp.
- [ ] Payslip setelah finalize sama dengan nilai final payroll.
- [ ] Perubahan setelah finalize masuk alur koreksi baru, bukan overwrite tanpa jejak.
- [ ] Export evidence memuat run/period, scope, input summary, approval, warning, finalize event, dan identifier dokumen.
- [ ] Demo memakai tenant non-produksi tanpa data customer.

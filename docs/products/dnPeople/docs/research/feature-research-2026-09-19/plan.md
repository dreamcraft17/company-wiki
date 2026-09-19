# Rencana Riset Fitur dnPeople

Tanggal: 2026-09-19
Scope: fitur yang sudah tersedia, conditional, dan roadmap di `dnpeople/`; fokus pada keputusan fitur 90 hari dan positioning beachhead.

## Keputusan yang hendak diinformasikan

Fitur mana yang perlu diprioritaskan untuk meningkatkan time-to-value, bukti kepercayaan payroll, dan peluang menang di segmen awal Indonesia—serta fitur mana yang sebaiknya ditunda sampai ada bukti demand.

## Hipotesis yang dapat dipalsukan

1. Wedge paling kuat bukan “all-in-one HRIS”, melainkan kontrol operasi multi-cabang + payroll yang dapat direview + evidence trail.
2. Retail/F&B multi-outlet adalah segmen awal yang lebih actionable daripada enterprise besar, tetapi template vertikal belum boleh disebut validated sebelum diuji di minimal dua pilot.
3. Hambatan konversi terbesar bukan kekurangan modul, melainkan activation/time-to-value, bukti payroll correctness, mobile employee adoption, dan trust/support proof.
4. Native app, AI assistant, salary benchmarking, dan EWA tidak layak dipercepat tanpa bukti demand yang lebih kuat daripada estimasi RICE internal.

## Genre dan blok laporan

Genre: decision + landscape + validation plan.

Blok: executive decision, implementation baseline, market/competitor evidence, segment scoring, feature portfolio, UX journey, research plan, risks, refresh targets.

## Strategi sumber

- Primer internal: `FEATURE-CATALOG.md`, `CURRENT-IMPLEMENTATION.md`, market opportunity review, competitive strategy review, backlog/RICE, dan dokumen UX `/welcome`.
- Primer eksternal: halaman resmi Mekari Talenta, GreatDay HR, dan statistik BPS.
- Triangulasi: setiap thesis strategis harus didukung bukti internal + minimal dua sumber eksternal/independen bila tersedia. Klaim pengguna aktual ditahan sampai riset lapangan.
- Tidak menggunakan angka TAM/SAM/SOM tanpa basis customer count, willingness-to-pay, dan sumber pasar yang sepadan.

## Opposition queries

- Apakah audit trail benar-benar dibeli, atau hanya payroll/attendance yang dianggap penting?
- Apakah retail/F&B multi-outlet punya willingness-to-pay yang cukup dibanding segmen payroll-only?
- Apakah web mobile cukup, atau native app merupakan hard requirement untuk employee adoption?
- Apakah fitur breadth membuat onboarding lebih sulit daripada manfaatnya?
- Apakah pesaing sudah memiliki multi-cabang, workflow, dan evidence sehingga wedge ini tidak cukup defensible?

## Risiko dan batasan

- Tidak ada dataset customer interview, win/loss, retention cohort, analytics funnel, atau usability session di repository.
- Halaman kompetitor adalah klaim vendor; angka customer dan feature claim tidak diperlakukan sebagai verifikasi independen.
- Status `Available` di codebase belum sama dengan production acceptance/customer proof.
- Segmentation score dan RICE yang ada adalah hipotesis internal, bukan market share atau demand measurement.

## Stop criteria

Berhenti menambah breadth dan kembali ke discovery jika setelah 10 pilot qualified: <40% menyelesaikan workflow inti kedua setiap minggu atau <25% tetap aktif pada minggu ke-8. Naikkan template retail/F&B dari draft hanya setelah minimal 2 struktur organisasi nyata lulus setup, payroll preview, dan exception workflow.

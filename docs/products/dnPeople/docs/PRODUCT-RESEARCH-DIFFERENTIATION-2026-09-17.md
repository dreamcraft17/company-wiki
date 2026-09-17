---
owner: Dozer
status: hypothesis-led
last_reviewed: 2026-09-17
review_cadence: quarterly
---

# dnPeople — Product Research: Kategori Fitur Diferensiasi

**Tanggal:** 17 September 2026  
**Tujuan:** menyajikan fitur dnPeople per kategori yang tidak memaksa produk berkompetisi head-on sebagai HRIS generik.

## Kesimpulan eksekutif

Pasar sudah padat untuk klaim “all-in-one HRIS”: payroll, absensi, cuti, self-service, performance, recruitment, dan dashboard sudah menjadi bahasa umum pada Mekari Talenta, Gadjian, dan GreatDay HR. [Mekari Talenta](https://mekari.com/produk/talenta/) menyatakan cakupan dari database karyawan sampai recruitment dan talent management; [Gadjian](https://gadjian.com/) menonjolkan payroll, PPh 21/BPJS, absensi, cuti, dan KPI; [GreatDay HR](https://greatdayhr.com/id-id/) menampilkan attendance, leave, payroll, performance, recruitment, engagement, dan AI recruitment.

Karena itu, dnPeople sebaiknya diposisikan sebagai:

> **Operating system untuk perusahaan Indonesia yang memiliki banyak cabang, banyak pengecualian, dan perlu membuktikan setiap keputusan HR.**

Yang dijual bukan jumlah menu, tetapi tiga outcome:

1. **Operasi cabang tetap konsisten** meski aturan lokasi, shift, approval, dan payroll berbeda.
2. **Setiap keputusan HR punya bukti**: siapa mengubah apa, berdasarkan data apa, dengan persetujuan siapa.
3. **Potensi karyawan berubah menjadi rencana dan mobilitas**, bukan berhenti di skor review atau 9-box.

## Status bukti

Belum ada data wawancara customer pada studi ini. Maka istilah **insight** tidak digunakan untuk kebutuhan pengguna; bagian di bawah adalah **hipotesis positioning** yang diturunkan dari feature baseline dnPeople dan observasi halaman produk kompetitor. Validasi berikutnya memakai generative interviews, bukan voting atas daftar fitur.

Metode yang disarankan skill `product-research`:

- Goal: **discovery**, stage: **concept**, profile: **B2B SaaS**.
- Metode: wawancara generatif semi-terstruktur, berangkat dari kejadian terbaru dan workaround Excel/WhatsApp, bukan reaksi terhadap mockup.
- Segmentasi awal: (a) HR perusahaan multi-cabang, (b) HR perusahaan 50–300 karyawan dengan payroll kompleks, (c) owner/manager yang mengambil keputusan people tanpa tim HR besar.
- Panduan sampel tematik: **12 peserta per segmen, 36 total, confidence MODERATE-HIGH** sebagai rencana awal. Saturasi harus diamati dari laju tema baru; angka ini bukan klaim prevalensi.
- Sebuah kebutuhan baru boleh disebut insight setelah berulang pada minimal 3 peserta independen. Satu cerita tetap **ANECDOTE**.

## Kategori yang disarankan

| Kategori produk | Janji pelanggan | Fitur dnPeople yang masuk | Kepadatan pasar | Prioritas |
|---|---|---|---|---|
| **1. Branch Operations Control** | “Aturan pusat tetap jalan di lapangan tanpa menghapus pengecualian lokal.” | Organization tree/legal units, lokasi + geofence/SSID, shift rotation/swap, scoped approval, differential policy, attendance import idempotent, payroll explanation | Sedang; komponen ada pada kompetitor, tetapi paket masalah multi-cabang dan exception control lebih spesifik | **P0** |
| **2. People Evidence & Compliance** | “Saat ada sengketa atau audit, HR bisa menunjukkan kronologi dan bukti.” | Before/after correction, immutable audit, approval history, document/policy acknowledgement, payroll finalize, payslip verification, UU PDP controls, export/deletion request | Rendah–sedang sebagai positioning; compliance biasanya dijual sebagai checklist, bukan evidence workflow | **P0** |
| **3. Indonesia Payroll Confidence** | “Payroll dapat dijelaskan dan diperiksa, bukan hanya dihitung.” | PPh 21, BPJS, proration, THR, overtime/leave inputs, preview → atomic finalize, variance report, payslip PDF/link/verification | Tinggi; payroll Indonesia adalah table stakes dan arena kompetisi utama | **P0 foundation, bukan hero tunggal** |
| **4. Talent-to-Action** | “Review kinerja berujung pada skill gap, rencana belajar, dan successor yang punya owner.” | Competency framework, assessment, gap analysis, IDP, LMS, 9-box calibration, succession readiness, development proposal → IDP/LMS | Sedang–tinggi; Talenta sudah menyebut performance, IDP, dan succession. Pembeda harus berupa traceability dan execution | **P1** |
| **5. Explainable HR Assistant** | “Tanya data HR dengan jawaban bersumber dan tindakan yang tetap disetujui manusia.” | RAG policy/FAQ, scoped assistant tools, citations, approval before write, audit trail, PII redaction | Sedang dan meningkat; AI assistant/screening mulai umum | **P1, setelah governance** |
| **6. Migration & Implementation Kit** | “Dari Excel dan proses lama ke HRIS tanpa proyek konsultasi yang panjang.” | Excel/CSV import, dry-run/preview/confirm, templates, tier-aware onboarding/tutorials, demo tenant, implementation playbook | Rendah sebagai productized offer; tinggi sebagai pembeda go-to-value | **P1** |
| **7. Open HR Control Plane** | “Data dan workflow HR tidak terkunci di vendor.” | Scoped API keys, REST API, webhooks, SCIM/SSO, custom reports, export, integration recipes, sandbox | Sedang; Gadjian juga memasarkan Open API, sehingga klaim “punya API” tidak cukup | **P2** |
| **8. Employee Trust & Fairness** | “Karyawan tahu bagaimana data dipakai dan bagaimana keputusan bisa ditinjau.” | Consent, privacy controls, self-service data correction, evidence-linked review, salary/PII separation, explanation of attendance/payroll changes | Rendah sebagai pesan pasar; perlu validasi karena willingness-to-pay belum diketahui | **P2 discovery** |

## Kategori yang jangan dijadikan medan utama

Fitur berikut tetap perlu untuk kredibilitas dan retention, tetapi jangan menjadi headline diferensiasi:

- absensi GPS/selfie/liveness;
- payroll otomatis, PPh 21, BPJS, THR;
- cuti, lembur, klaim, pinjaman;
- employee self-service dan slip gaji;
- recruitment pipeline, KPI, dashboard dasar;
- “AI-powered HRIS” tanpa bukti explainability dan outcome.

Kompetitor sudah mengomunikasikan sebagian besar area ini secara langsung. GreatDay, misalnya, juga menampilkan GPS, liveness, payroll, multi-bank, EWA, KPI, recruitment, OCR, dan employee self-service pada halaman produknya. Ini berarti fitur-fitur tersebut harus **reliable dan mudah dipakai**, tetapi tidak otomatis menjadi positioning unik.

## Paket penyajian yang lebih tajam

### Paket A — Branch Starter

Untuk bisnis retail, F&B, jasa lapangan, dan perusahaan dengan beberapa lokasi.

- branch/org setup;
- shift, attendance exception, koreksi berbukti;
- approval per lokasi/department;
- payroll input yang dapat dijelaskan;
- import Excel dengan dry-run dan idempotency.

**Pesan:** “Operasi cabang rapi tanpa memaksa semua cabang memakai aturan yang sama.”

### Paket B — People Control

Untuk perusahaan yang sudah memiliki HR tetapi lelah dengan audit manual dan approval yang tercecer.

- evidence timeline;
- policy acknowledgement;
- payroll finalize + variance review;
- document lifecycle;
- audit/export/privacy controls.

**Pesan:** “Siap menjawab ‘siapa yang memutuskan dan berdasarkan apa?’.”

### Paket C — Growth & Succession

Untuk perusahaan yang ingin mengurangi ketergantungan pada key person.

- competency and gap analysis;
- IDP + LMS;
- 9-box calibration;
- successor slate;
- readiness → development action → progress review.

**Pesan:** “Succession bukan spreadsheet; setiap kandidat punya gap, rencana, owner, dan bukti progres.”

### Paket D — Open & Assisted

Untuk customer dengan IT/integrator internal.

- API/webhook/SCIM;
- integration recipes;
- policy-grounded assistant;
- human approval for changes;
- data portability.

**Pesan:** “HR automation yang bisa diintegrasikan dan diperiksa.”

## Keputusan roadmap

### Bangun sekarang (P0)

1. **Exception and evidence layer:** policy version, approval/evidence timeline, reason wajib, before/after, actor, source data.
2. **Branch operations templates:** konfigurasi per lokasi/legal unit untuk shift, attendance, leave, payroll input, dan approval.
3. **Payroll confidence UI:** variance preview, explanation per komponen, finalize gate, dan audit export.

### Bangun setelah bukti awal (P1)

1. **Talent-to-action loop:** setiap gap/placement wajib dapat action owner, target date, learning/work assignment, dan review outcome.
2. **Implementation kit:** import wizard berbasis template industri dan migration health report.
3. **Explainable assistant:** read-only lebih dulu; write action harus approval dan tercatat.

### Jangan commit sebelum discovery (P2)

- EWA;
- external salary benchmarking;
- native mobile app;
- predictive attrition;
- marketplace besar;
- fitur surveilans tenaga kerja seperti live tracking.

## Research plan validasi

### Pertanyaan generatif

1. Ceritakan kejadian terakhir ketika aturan HR berbeda antar lokasi atau departemen. Apa yang dilakukan secara manual?
2. Kapan terakhir kali payroll/attendance perlu dikoreksi? Bukti apa yang dicari dan siapa yang menyetujui?
3. Keputusan people apa yang sulit dijelaskan kembali setelah beberapa bulan?
4. Bagaimana perusahaan menentukan bahwa seseorang siap naik peran? Apa yang terjadi setelah penilaian?
5. Sistem apa yang harus tetap terhubung jika HRIS diganti? Apa konsekuensi vendor lock-in bagi mereka?

### Sinyal keberhasilan discovery

- minimal 3 peserta independen dalam satu segmen menceritakan pola masalah yang sama;
- pola tersebut memiliki workaround aktif dan biaya/risiko yang terasa;
- peserta dapat menyebut trigger pembelian dan owner anggaran tanpa dipancing fitur;
- konsep “Branch Operations Control” atau “People Evidence” dipahami sebagai outcome, bukan sekadar nama menu.

### Artefak setelah fielding

Simpan observation atomik dengan tag: `segment`, `job`, `trigger`, `workaround`, `risk`, `current_tool`, `willingness_signal`. Jalankan synthesizer dengan `--min-sources 3`; jangan mempromosikan cluster satu sumber menjadi insight.

## Scorecard produk yang perlu dilacak

| Outcome | Metrik awal |
|---|---|
| Branch operations | waktu setup lokasi baru; % attendance exceptions selesai ≤1 hari; jumlah override tanpa alasan |
| Evidence & compliance | % perubahan sensitif dengan evidence lengkap; waktu menemukan kronologi audit; unresolved approval aging |
| Payroll confidence | waktu dari cutoff ke finalize; variance reopen rate; correction rate setelah finalize |
| Talent-to-action | % gap yang punya IDP/action owner; completion rate action; successor coverage untuk critical role |
| Implementation | waktu import pertama sampai data usable; import error rework rate; time-to-first-value |
| Assistant | citation coverage; answer correction rate; unauthorized write = 0 |

## Referensi eksternal yang diverifikasi

- [Mekari Talenta — HRIS/HCM](https://mekari.com/produk/talenta/)
- [Mekari Talenta — HR analytics](https://mekari.com/produk/talenta/hr-analytics/)
- [Gadjian — HRIS dan payroll](https://gadjian.com/)
- [Gadjian — pricing/features](https://www.gadjian.com/pricing/index)
- [GreatDay HR — product overview](https://greatdayhr.com/id-id/)
- [GreatDay HR — employee features](https://greatdayhr.com/id-id/role/karyawan/)

*Catatan: halaman vendor adalah bukti tentang positioning dan klaim fitur vendor, bukan bukti bahwa semua customer memakai atau berhasil dengan fitur tersebut.*

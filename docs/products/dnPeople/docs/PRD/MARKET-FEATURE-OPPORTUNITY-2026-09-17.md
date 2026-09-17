---
owner: Dozer
status: draft
canonical: true
last_reviewed: 2026-09-17
review_cadence: quarterly
---

# dnPeople — Market Feature & Opportunity Review

> **Status:** Draft · **Last updated:** 2026-09-17 · **Author:** Dozer
>
> Dokumen ini membandingkan implementasi terbaru dnPeople dengan pola fitur yang umum di pasar HRIS Indonesia. Implementasi yang sudah tersedia tidak otomatis berarti demand pelanggan sudah tervalidasi.

## Ringkasan eksekutif

Implementasi terbaru dnPeople memiliki tiga area yang paling layak dijadikan wedge pemasaran:

1. **Branch Operations Control** — aturan HR pusat, scope per lokasi, shift, approval, dan koreksi absensi yang dapat ditelusuri.
2. **Payroll Confidence** — payroll Indonesia dengan preview, finalisasi terkontrol, dan verifikasi payslip.
3. **People Evidence** — before/after, actor, reason, approval trail, policy acknowledgement, dan audit export.

Payroll, absensi, employee self-service, recruitment, dan performance tetap penting, tetapi merupakan kategori yang sudah ramai. Positioning yang disarankan:

> **HR multi-cabang dengan workflow yang rapi, payroll yang bisa direview, dan setiap perubahan memiliki bukti.**

## Basis implementasi terbaru

Snapshot ini dibuat dari `dnpeople` pada HEAD `8508a11` (`feat(marketing,industry-templates): implement website marketing spec + EPIC-001/EPIC-003`).

### Kapabilitas yang sudah terlihat di kode dan dokumentasi

| Area | Kapabilitas | Status komersial |
|------|-------------|------------------|
| Operasional cabang | Organization scope, lokasi, shift, rotasi, workflow approval, koreksi absensi berbasis evidence | Available; validasi positioning masih diperlukan |
| Payroll | BPJS, PPh21, prorata, lembur, bonus/THR, preview, atomic finalize, payslip dan verifikasi | Available dengan gate operasional sesuai provider |
| Evidence | Evidence timeline, before/after, actor, reason, approval trail, policy acknowledgement, audit export | Available |
| Import | Excel template, dry-run, validasi dan idempotent import | Available |
| People lifecycle | Recruitment, digital offer, onboarding, performance, KPI/OKR, competency, IDP, LMS, 9-box, succession | Available; demand per segmen belum tervalidasi |
| Enterprise | RBAC, row-level scope, API key, webhook, custom report | Available sesuai tier |
| Integrasi | SSO/SCIM, SMTP, biometric, LLM, live payment provider | Conditional; bergantung konfigurasi dan UAT |
| Produk lanjutan | Native Android/iOS, auto-transfer payroll, e-filing DJP/BPJS | Roadmap |

## Perbandingan kategori pasar

| Kategori | Observasi pasar | Implikasi untuk dnPeople |
|----------|-----------------|------------------------|
| Payroll, BPJS, PPh21 | Sudah menjadi fitur inti pada platform seperti Mekari Talenta, Gadjian, dan GreatDay | Jangan menang hanya dari kalkulator payroll |
| GPS, selfie, fingerprint | Sudah umum pada produk attendance | Jadikan sebagai input kontrol operasional, bukan headline utama |
| Employee self-service | Sudah umum | Treat as table stakes |
| Recruitment dan performance | Ditawarkan oleh platform HCM besar | Bukan pembeda utama untuk initial wedge |
| Multi-company/multi-cabang | Sudah dikenal di pasar | Tekankan kedalaman scope, approval, exception, dan evidence |
| Audit trail HR | Relevan bagi HR/finance/owner, tetapi belum menjadi pesan kategori yang dominan | Kandidat pembeda utama |
| Payroll preview/verification | Menjadi kuat bila dikaitkan dengan explainability dan evidence | Gunakan sebagai demo inti |
| Industry template | Berpotensi mempercepat onboarding vertikal | Harus dibuktikan lewat pilot sebelum diklaim general availability |

Referensi kompetitor resmi: [Mekari Talenta](https://mekari.com/produk/talenta/), [Gadjian](https://gadjian.com/), dan [GreatDay HR](https://greatdayhr.com/id-id/).

## Segmen prioritas

Skor berikut adalah **screening hypothesis**, bukan market size atau customer evidence. Kriteria mengikuti measurable, substantial, accessible, differentiable, dan actionable.

| Segmen | Skor screening | Keputusan |
|--------|----------------|-----------|
| Retail/F&B multi-outlet, 50–300 karyawan | 80,0/100 | Target utama |
| SME payroll-only, 50–300 karyawan | 75,8/100 | Demand tinggi, tetapi kompetitif |
| Field services/distributed workforce, 50–300 karyawan | 72,8/100 | Target discovery kedua |
| Perusahaan bertumbuh dengan masalah talent/succession, 100–300 karyawan | 64,2/100 | Watch / expansion |
| Enterprise 1.000+ dengan tuntutan native app dan payroll rails ketat | 55,0/100 | Tunda |

### Target utama: retail/F&B multi-outlet

Fit paling kuat karena implementasi sudah menyediakan template `retail-fnb-multi-outlet`, shift PAGI/SIANG/MALAM, dan workflow approval MANAGER → HR.

Namun template masih berstatus `draft` dan belum divalidasi melalui pilot. Gunakan hanya untuk pilot terbatas sampai:

- diuji pada 2–3 perusahaan dengan struktur cabang berbeda;
- waktu setup dan perubahan manual diukur;
- kesesuaian approval, shift, dan exception dikonfirmasi oleh pengguna lapangan.

### Target kedua: field services

Kapabilitas lokasi, shift, exception absensi, import, dan scoped workflow relevan untuk tenaga kerja tersebar. Risiko utamanya adalah kebutuhan mobile/offline dan pola approval yang berbeda-beda; validasi discovery harus berfokus pada pekerjaan aktual manager lapangan.

### Segmen yang perlu hati-hati

SME payroll-only memiliki demand jelas, tetapi pembeda dnPeople rendah jika pesan hanya payroll. Talent/succession menarik sebagai expansion setelah data performance dan competency sudah rutin dipakai. Enterprise besar sebaiknya ditunda sampai gap native mobile, integrasi payroll, dan production gate lebih matang.

## Rekomendasi positioning dan pemasaran

### Market sekarang

- Perusahaan retail/F&B dengan banyak outlet.
- Perusahaan yang masih merekonsiliasi Excel untuk absensi, approval, dan payroll.
- HR/finance yang harus menjelaskan siapa mengubah data, kapan, dan berdasarkan aturan apa.
- Perusahaan yang membutuhkan payroll preview sebelum finalisasi.

### Pesan utama

> **Kelola HR multi-cabang dengan aturan pusat, approval yang jelas, dan payroll yang siap diaudit.**

CTA yang sesuai adalah **Audit workflow HR multi-cabang 30 menit**, bukan CTA generik “lihat semua fitur”. Demo sebaiknya mengikuti alur Configure → Run → Review → Prove.

### Jangan dijadikan headline awal

AI, “HRIS lengkap”, employee self-service, dan payroll generik terlalu mudah dibandingkan dengan kompetitor. Native mobile, auto-transfer payroll, dan e-filing tetap penting sebagai roadmap, tetapi belum menjadi klaim produk saat ini.

## Rencana validasi product research

Belum ada customer insight aktual di repository. Karena itu, temuan di atas diperlakukan sebagai hipotesis pasar dan implementasi, bukan bukti product-market fit.

Studi berikutnya sebaiknya discovery generatif:

- wawancara semi-terstruktur berbasis pengalaman terbaru, workaround, dan jobs-to-be-done;
- rekrut berdasarkan pekerjaan dan struktur operasional, bukan jabatan saja;
- laporkan hasil per segmen;
- gunakan tiga segmen utama dan rencana awal sekitar 36 partisipan total;
- nyatakan insight hanya jika tema berulang lintas partisipan independen dan saturation mulai tercapai.

## Prioritas tindakan

1. Kunci positioning retail/F&B multi-cabang di website dan materi sales.
2. Jalankan discovery dengan HR, finance, dan owner multi-outlet.
3. Pilot template retail/F&B sebelum menaikkan statusnya dari `draft`.
4. Jadikan evidence trail dan payroll preview sebagai demo utama.
5. Uji field services sebagai segmen kedua.
6. Tunda investasi besar pada native mobile, auto-transfer, e-filing, dan AI sampai ada demand yang terbukti.

## Related

- [Website marketing implementation](./DNPEOPLE-WEBSITE-MARKETING-IMPLEMENTATION-2026-09-17.md)
- [Backlog RICE & roadmap](./DNPEOPLE-BACKLOG-RICE-ROADMAP-2026-09-17.md)
- [Evidence Timeline implementation](../EVIDENCE-TIMELINE-IMPLEMENTATION.md)
- [Feature catalog](../FEATURE-CATALOG.md)

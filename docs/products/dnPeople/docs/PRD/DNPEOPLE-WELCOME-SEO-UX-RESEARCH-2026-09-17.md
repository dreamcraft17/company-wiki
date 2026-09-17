---
owner: Dozer
status: draft
canonical: true
last_reviewed: 2026-09-17
review_cadence: quarterly
---

# dnPeople — `/welcome` SEO, Market, dan UX Research

> **Status:** Draft · **Last updated:** 2026-09-17 · **Author:** Dozer
>
> Dokumen ini menyimpan hasil audit terhadap landing page `/welcome` dnPeople. Fokusnya adalah positioning, bahasa pasar, SEO, UX conversion, dan rencana validasi. Dokumen ini belum mengubah source code.

## Ringkasan eksekutif

Landing page `/welcome` sudah memiliki positioning yang lebih kuat daripada HRIS generik: **operasional HR multi-cabang dengan approval yang jelas, payroll yang dapat direview, dan evidence yang dapat ditelusuri**.

Fondasi teknis dan copy utama sudah tersedia:

- satu H1 yang spesifik;
- tiga outcome pillar;
- status produk `Available`, `Conditional`, dan `Roadmap`;
- CTA workflow audit dan sandbox;
- halaman use case dan internal linking;
- canonical, sitemap, Organization, SoftwareApplication, dan FAQ schema.

Gap terbesar bukan kekurangan section, tetapi:

1. keyword Bahasa Indonesia belum cukup kuat di headline dan subheading;
2. istilah Inggris masih dominan untuk pengunjung awal;
3. beberapa copy menyiratkan customer research yang belum tersedia;
4. CTA dan form masih perlu diuji untuk traffic dingin;
5. proof produk perlu dibuat lebih konkret dan dapat diverifikasi.

## Scope dan sumber

### Source code yang diaudit

- `frontend/src/app/welcome/page.tsx`
- `frontend/src/components/marketing/LandingPage.tsx`
- `frontend/src/components/marketing/MarketingShell.tsx`
- `frontend/src/components/marketing/EmailCaptureForm.tsx`
- `frontend/src/components/marketing/MarketingJsonLd.tsx`
- `frontend/src/lib/marketing/content.ts`
- `frontend/src/app/sitemap.ts`
- `frontend/src/app/page.tsx`

### Kondisi bukti

Repository belum menyediakan analytics funnel, Search Console query, interview customer, atau usability session yang dapat dipakai sebagai customer insight aktual. Karena itu:

- fakta implementasi diberi label sebagai **implementation evidence**;
- pola pasar diberi label sebagai **market category evidence**;
- rekomendasi UX dan demand diberi label sebagai **hypothesis** sampai diuji;
- tidak ada klaim conversion rate, search volume, customer count, atau market size dalam dokumen ini.

## 1. Audit implementasi `/welcome`

### Yang sudah berjalan

| Area | Implementasi saat ini | Penilaian |
|------|------------------------|-----------|
| Positioning | “Aturan HR pusat, tetap rapi di setiap cabang.” | Kuat dan spesifik |
| Target audience | Perusahaan Indonesia 50–300 karyawan dengan banyak lokasi/cabang | Jelas, perlu diuji |
| Problem framing | Aturan cabang berbeda, payroll dibuka kembali, approval tercecer | Relevan untuk discovery |
| Product pillars | Branch Operations, Payroll Confidence, People Evidence | Diferensiasi potensial |
| Product proof | Available / Conditional / Roadmap | Meningkatkan trust |
| Conversion | Workflow Audit 30 Menit dan Sandbox Gratis | Baik, perlu uji CTA |
| Navigation | Solusi, Pricing, Docs, FAQ, Login, Signup | Cukup lengkap |
| Structured data | Organization, FAQPage, SoftwareApplication | Ada; perlu validasi schema |
| Indexing | Canonical `/welcome`, sitemap, root redirect ke `/welcome` | Konsisten |

### Alur halaman saat ini

```text
Hero
  → Problem
  → Three outcome pillars
  → Configure → Run → Review → Prove
  → Use cases
  → Product proof
  → Implementation promise
  → Pricing
  → FAQ
  → Qualified lead form
  → Final CTA
```

Alur ini sudah logis. Prioritas optimasi adalah memperjelas pesan dan mengurangi risiko salah persepsi, bukan menambah banyak section baru.

## 2. Market category research

Bahasa kategori yang terlihat berulang pada pasar HRIS Indonesia:

- software HRIS Indonesia;
- aplikasi payroll Indonesia;
- aplikasi absensi karyawan;
- absensi multi-cabang atau multi-lokasi;
- BPJS dan PPh 21;
- employee self-service;
- multi-company;
- shift, cuti, lembur, dan approval.

Mekari Talenta menampilkan absensi GPS/face ID, integrasi fingerprint, shift, cuti, lembur, payroll, dan laporan. [Mekari Talenta — absensi online](https://mekari.com/produk/talenta/absensi-online/) 

Gadjian menggabungkan HRIS, payroll, PPh 21, BPJS, absensi, cuti, KPI, dan kebutuhan perusahaan berkembang. [Gadjian](https://www.gadjian.com/)

GreatDay menonjolkan attendance, payroll, multi-bank, multi-company, liveness, EWA, loans, claims, dan performance. [GreatDay HR](https://greatdayhr.com/id-id/)

### Implikasi positioning

| Elemen | Keputusan |
|--------|-----------|
| Payroll dan absensi | Wajib disebut karena merupakan bahasa kategori, tetapi bukan pembeda tunggal |
| Multi-cabang | Jadikan konteks utama, bukan sekadar satu fitur |
| Approval dan exception | Jadikan bukti kedalaman operasional |
| Audit trail HR | Jadikan diferensiasi utama |
| Payroll preview/verification | Jadikan demo inti untuk HR dan finance |
| AI dan “HRIS lengkap” | Jangan dijadikan headline awal |

Kesimpulan market: dnPeople sebaiknya masuk melalui kategori **HRIS multi-cabang**, lalu dibedakan melalui **workflow control, payroll review, dan evidence trail**.

## 3. SEO audit

### Metadata saat ini

```text
Title: dnPeople — HRIS Multi-cabang Indonesia
Canonical: https://dnpeople.id/welcome
```

Title saat ini sudah ringkas dan relevan. Description saat ini sekitar 199 karakter dan berpotensi terpotong di SERP.

Google merekomendasikan title yang deskriptif dan ringkas, serta kata yang digunakan pengguna ditempatkan pada title, heading utama, alt text, dan link text. [Google Search Essentials](https://developers.google.com/search/docs/essentials) [Title links](https://developers.google.com/search/docs/appearance/title-link)

Google dapat menggunakan meta description atau mengambil snippet langsung dari isi halaman. Karena itu, paragraf pembuka harus menyampaikan keyword dan value proposition yang sama dengan metadata. [Google snippets](https://developers.google.com/search/docs/appearance/snippet)

### Metadata yang direkomendasikan

```ts
title: 'HRIS Multi-Cabang Indonesia untuk Absensi & Payroll | dnPeople'

description:
  'HRIS multi-cabang Indonesia untuk absensi, shift, approval, payroll BPJS/PPh 21, dan audit trail HR. Cocok untuk perusahaan 50–300 karyawan.'
```

Catatan: meta `keywords` tidak perlu menjadi prioritas karena Google menyatakan meta keywords tidak digunakan untuk ranking. [Google supported meta tags](https://developers.google.com/search/docs/crawling-indexing/special-tags)

### Structured data

Saat ini halaman memiliki Organization, FAQPage, dan SoftwareApplication schema. FAQ content terlihat di halaman sehingga struktur tersebut memiliki dasar konten.

Validasi lanjutan:

- pastikan FAQ schema selalu identik dengan FAQ yang terlihat;
- pastikan harga pada SoftwareApplication schema sama dengan pricing source of truth;
- pertimbangkan menambahkan `url`, `description`, dan `brand` bila datanya tersedia;
- uji dengan Rich Results Test dan URL Inspection;
- jangan menganggap schema menjamin rich result.

Google menyatakan structured data adalah eligibility hint, bukan jaminan tampilan rich result, dan markup harus merepresentasikan konten yang terlihat. [Structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)

## 4. UX dan copy findings

### P0 — Klaim “yang kami dengar berulang”

Copy tersebut menyiratkan adanya riset customer berulang, sementara repository belum memiliki interview evidence.

Sementara gunakan:

> **Masalah yang sering muncul di operasional multi-cabang**

Setelah interview menghasilkan tema yang berulang lintas peserta independen, copy dapat diubah kembali.

### P1 — Terlalu banyak istilah Inggris

Gunakan nama bilingual agar search intent dan pemahaman pengguna sama-sama terlayani:

| Label saat ini | Label yang disarankan |
|----------------|-----------------------|
| Branch Operations Control | Kontrol Operasional Multi-Cabang |
| Payroll Confidence | Payroll yang Bisa Direview |
| People Evidence | Bukti dan Audit Trail HR |
| Configure → Run → Review → Prove | Atur → Jalankan → Review → Buktikan |

Nama Inggris boleh dipertahankan sebagai product pillar, tetapi headline dan deskripsi utama sebaiknya menggunakan Bahasa Indonesia.

### P1 — CTA Workflow Audit

“Jadwalkan Workflow Audit 30 Menit” cukup berbeda, tetapi pengunjung baru mungkin belum mengetahui aktivitas yang akan dilakukan.

Tambahkan helper copy:

> Kita petakan alur absensi, approval, dan payroll Anda sebelum membahas solusi.

Jangan menambahkan janji “tanpa sales pitch” kecuali proses tersebut memang disepakati sebagai operating policy.

### P1 — Form qualified lead

Form audit saat ini meminta email, nama, perusahaan, jumlah karyawan, jumlah cabang, dan consent. Ini cocok untuk qualification, tetapi berpotensi menciptakan friction untuk cold traffic.

Rekomendasi eksperimen:

- **Form A:** email, nama, perusahaan, jumlah karyawan;
- **Form B:** form qualified saat ini;
- ukur `form_start → form_submit`, bukan hanya total submit.

Jangan menghapus field sebelum ada data conversion.

### P1 — Evidence card

Hero menampilkan data contoh seperti Outlet 04, Manager Cabang Kelapa Gading, dan timestamp. Tambahkan label:

> **Contoh evidence koreksi absensi**

Kalimat “masuk ke payroll bulan ini secara otomatis” hanya boleh dipakai jika alur tersebut benar-benar terbukti end-to-end di implementation evidence.

### P2 — Proof yang bisa diverifikasi

Perkuat section product proof dengan link atau screenshot untuk:

- preview payroll sebelum finalize;
- before/after koreksi absensi;
- actor, reason, dan approval timestamp;
- export evidence untuk audit.

Hindari customer logo, angka savings, dan customer count tanpa evidence tertulis.

## 5. Rekomendasi copy

### H1

Pertahankan:

> **Aturan HR pusat, tetap rapi di setiap cabang.**

### Subheading

```text
HRIS multi-cabang untuk mengelola absensi, shift, approval, payroll BPJS/PPh 21,
dan audit trail HR dalam satu alur yang jelas—tanpa rekonsiliasi Excel berulang.
```

### Problem heading

```text
Masalah HR mulai terasa ketika cabang bertambah
```

### Pillar headings

```text
Kontrol Operasional Multi-Cabang
Atur lokasi, shift, scope, dan approval dari pusat.

Payroll yang Bisa Direview
Periksa input, preview hasil, lalu finalize dengan bukti.

Bukti dan Audit Trail HR
Ketahui siapa mengubah data, apa yang berubah, kapan, dan alasannya.
```

### CTA

```text
Primary: Audit alur HR multi-cabang 30 menit
Secondary: Lihat demo sandbox
```

## 6. Content SEO setelah `/welcome`

Jangan membuat halaman doorway yang hanya mengganti kota atau nama industri. Google menekankan konten yang helpful, reliable, people-first, orisinal, dan memiliki tujuan bagi audiens. [Google helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)

Prioritas konten:

| Rute atau topik | Search intent | Internal link |
|-----------------|---------------|---------------|
| Absensi multi-cabang | Aplikasi absensi karyawan multi-cabang | `/branch-operations` |
| Payroll BPJS/PPh 21 | Software payroll Indonesia | `/payroll-confidence` |
| Audit trail HR | Approval dan bukti perubahan data HR | `/people-evidence` |
| HR retail/F&B | HRIS retail/F&B multi-outlet | `/branch-operations` |
| Rekonsiliasi absensi-payroll | Migrasi dari Excel dan kontrol payroll | `/payroll-confidence` |

Setiap artikel harus memiliki link ke `/welcome`, `/pricing`, dan pillar yang relevan.

## 7. UX validation plan

Belum ada user insight aktual. Jalankan moderated usability test terhadap 5–8 calon pengguna dari:

- HR perusahaan multi-cabang;
- finance/payroll;
- manager operasional cabang;
- owner atau decision maker.

### Task

1. Jelaskan dnPeople membantu masalah apa.
2. Cari tahu apakah produk cocok untuk perusahaan dengan beberapa cabang.
3. Bedakan fitur Available, Conditional, dan Roadmap.
4. Temukan pricing.
5. Kirim workflow audit request.

### Success metrics awal

| Metric | Target |
|--------|--------|
| Memahami kategori produk | ≥80% peserta |
| Menemukan use case relevan | ≥80% peserta |
| Menemukan pricing | ≥80% peserta |
| Menyelesaikan form | ≥70% peserta |
| Salah mengira roadmap sebagai available | 0 peserta |

Jangan menyebut hasil sebagai customer insight sebelum pola berulang lintas sedikitnya tiga peserta independen.

## 8. Prioritas implementasi

### P0

- Ganti copy yang menyiratkan customer research sebelum evidence tersedia.
- Tandai visual EvidenceCard sebagai contoh.
- Verifikasi klaim integrasi payroll otomatis.

### P1

- Perbarui title dan meta description.
- Masukkan keyword kategori Bahasa Indonesia di subheading dan H2.
- Bilingual-kan tiga pillar.
- Perjelas aktivitas dalam CTA workflow audit.
- Uji form pendek melawan form qualified.

### P2

- Buat tiga sampai lima artikel SEO berbasis use case.
- Tambahkan screenshot atau demo flow yang bisa diverifikasi.
- Hubungkan Search Console untuk query non-brand.
- Validasi dan lengkapi SoftwareApplication schema.

## 9. Acceptance criteria implementasi

- [ ] `/welcome` tetap memiliki satu H1 yang deskriptif.
- [ ] Metadata menyebut HRIS multi-cabang, absensi, payroll, dan segmen utama.
- [ ] Semua klaim customer research memiliki evidence atau menggunakan bahasa hipotesis.
- [ ] EvidenceCard ditandai sebagai contoh bila bukan data customer nyata.
- [ ] Available, Conditional, dan Roadmap tidak tercampur.
- [ ] CTA menjelaskan aktivitas workflow audit.
- [ ] Form conversion dapat diukur dari start sampai submit.
- [ ] FAQ schema sama dengan konten FAQ yang terlihat.
- [ ] Link internal ke tiga pillar, pricing, docs, dan FAQ dapat dirayapi.
- [ ] Tidak ada customer count, logo, atau savings claim tanpa bukti.

## Audit log

- Queries sent: 11
- Sources received: multiple result sets
- Sources cited: 8
- Failures: 0
- Routing: general research fallback, dilengkapi market-research dan UX heuristic audit
- Customer interviews/analytics: belum tersedia
- Confidence: medium untuk market category; low-to-medium untuk demand dan UX sampai diuji ke pengguna nyata

## Related

- [Website marketing implementation](./DNPEOPLE-WEBSITE-MARKETING-IMPLEMENTATION-2026-09-17.md)
- [Market feature opportunity review](./MARKET-FEATURE-OPPORTUNITY-2026-09-17.md)
- [Feature catalog](../FEATURE-CATALOG.md)
- [dnPeople docs index](../00_INDEX.md)

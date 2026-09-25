---
owner: Dozer
status: draft-for-validation
last_reviewed: 2026-09-17
review_cadence: monthly
---

# dnPeople — Marketing & GTM Strategy

**Tanggal:** 17 September 2026  
**Tujuan:** mendapatkan customer awal yang benar-benar cocok, bukan mengejar semua perusahaan dengan pesan “HRIS all-in-one”.

## 1. Bottom line

dnPeople sebaiknya dipasarkan sebagai:

> **HR operating system untuk perusahaan Indonesia dengan banyak cabang, banyak pengecualian, dan kebutuhan audit HR yang kuat.**

Hero message:

> **Aturan HR pusat, tetap jalan rapi di setiap cabang.**

Reason to believe yang tersedia di produk: scoped organization/approval, lokasi dan shift, attendance correction berbukti, payroll Indonesia, audit trail, payroll finalize, employee lifecycle, talent matrix, succession, REST API, webhook, serta onboarding berbasis import.

Jangan menjual “menu paling banyak”. Jual pengurangan risiko dan pekerjaan rekonsiliasi: aturan berbeda tetap terkendali, payroll dapat dijelaskan, dan keputusan HR meninggalkan bukti.

## 2. Confidence & batasan

### Terverifikasi dari baseline produk

- dnPeople adalah HRIS multi-tenant untuk Indonesia.
- Cakupan tersedia meliputi employee master, attendance, leave, shift, payroll BPJS/PPh 21, recruitment, onboarding, performance, talent, documents, approval, reporting, API, dan billing.
- Paket saat ini diarahkan ke FREE ≤30, STARTER ≤50, PROFESSIONAL ≤300 karyawan; BUSINESS/ENTERPRISE perlu discovery dan konfigurasi lebih lanjut.
- Produk mobile-first web, bukan native Android/iOS.
- Payroll adalah perhitungan dan export; transfer bank otomatis, e-filing DJP/BPJS, dan ledger akuntansi belum boleh dijanjikan sebagai existing.

### Hipotesis yang harus divalidasi

- Masalah paling bernilai bagi ICP adalah exception control dan audit evidence, bukan sekadar absensi murah.
- HR multi-cabang bersedia mengganti Excel/WhatsApp jika migration dan onboarding cukup ringan.
- People Evidence dan Branch Operations Control dapat menghasilkan win rate lebih baik daripada pesan harga.

Belum ada bukti untuk menyatakan “ratusan perusahaan”, “5000+ karyawan”, penghematan 80%, atau customer logo. Klaim tersebut tidak boleh dipakai sebelum ada data yang dapat diaudit.

## 3. ICP prioritas

### ICP A — Multi-branch operator (prioritas utama)

Perusahaan Indonesia dengan 50–300 karyawan, 3+ lokasi/cabang, HR/GA kecil, dan aturan shift/approval berbeda antar lokasi.

**Industri awal:** retail, F&B multi-outlet, jasa lapangan, klinik/pendidikan, distributor, dan perusahaan jasa dengan tenaga kerja tersebar.

**Trigger pembelian:** pembukaan cabang, payroll sering dikoreksi, audit internal, pergantian HR, atau Excel attendance mulai tidak terkendali.

**Disqualifier:** wajib native mobile, wajib auto-transfer payroll/e-filing, atau memerlukan enterprise implementation sebelum ada owner internal.

### ICP B — Finance-sensitive SME

Perusahaan 50–300 karyawan yang payroll-nya masih manual dan membutuhkan preview, approval, rekonsiliasi, serta jejak perubahan yang lebih jelas.

### ICP C — Growth company dengan talent risk

Perusahaan 100–300 karyawan yang mulai kehilangan key person dan membutuhkan competency, IDP, 9-box, dan succession yang terhubung ke tindakan.

ICP C adalah motion P1; jangan menjadikannya pesan utama sebelum loop talent-to-action terbukti dipakai.

## 4. Buyer dan pesan

| Buyer | Kekhawatiran | Pesan |
|---|---|---|
| Owner/CEO | Risiko operasional, cash, dan ketergantungan pada orang tertentu | “Anda bisa melihat status people operation tanpa menunggu rekapan manual.” |
| Head of HR/People Ops | Cabang berbeda, approval tercecer, audit melelahkan | “Satu policy dan approval model yang dapat di-scope per lokasi.” |
| Finance Manager | Payroll salah, koreksi tidak terlacak, closing lambat | “Preview, variance, finalize, dan bukti perubahan dalam satu alur.” |
| Operations/Branch Manager | Shift, attendance exception, dan approval harian | “Masalah cabang selesai di alurnya, tidak menumpuk di akhir bulan.” |
| IT/Integrator | Integrasi, akses, dan vendor lock-in | “Scoped API, webhook, SSO/SCIM, dan export data dengan kontrol akses.” |

### Positioning statement (Dunford-style)

**Untuk** perusahaan Indonesia 50–300 karyawan yang memiliki banyak lokasi atau proses HR yang penuh pengecualian, **dnPeople adalah** HR operating system untuk branch operations dan people evidence **yang membantu** HR menjalankan aturan, payroll, approval, dan talent process secara konsisten serta dapat diaudit. **Berbeda dari** HRIS generik atau spreadsheet yang hanya menyimpan transaksi, dnPeople menghubungkan scope organisasi, workflow, evidence, dan tindakan pengembangan dalam satu alur.

### Messaging hierarchy

- **Headline:** `Aturan HR pusat, tetap rapi di setiap cabang.`
- **Subhead:** `dnPeople membantu perusahaan Indonesia mengelola attendance, approval, payroll, dan people evidence tanpa rekonsiliasi Excel yang berulang.`
- **Three proof pillars:** `Branch control` · `Payroll confidence` · `People evidence`
- **CTA primary:** `Jadwalkan workflow audit 30 menit`
- **CTA secondary:** `Mulai dari sandbox gratis`

## 5. Product packaging untuk marketing

### Entry motion — Branch Starter

Lead dengan employee master, lokasi, shift, attendance exception, leave/approval, import template, dan payroll preview.

### Expansion motion — People Control

Lead dengan evidence timeline, audit, policy acknowledgement, payroll finalize, document lifecycle, dan reports.

### Strategic motion — Growth & Succession

Lead dengan competency gap → IDP/LMS → 9-box calibration → successor readiness.

Harga dan tier tetap mengikuti runtime SSOT. Marketing tidak boleh menyatakan semua fitur ada di semua paket; menu/tier gating dan status Conditional harus jujur.

## 6. Competitive strategy

Pemain seperti [Mekari Talenta](https://mekari.com/produk/talenta/), [Gadjian](https://gadjian.com/), dan [GreatDay HR](https://greatdayhr.com/id-id/) sudah mengomunikasikan payroll, attendance, leave, self-service, performance, recruitment, analytics, dan sebagian AI/talent. Karena itu, dnPeople tidak perlu menang pada breadth atau klaim “all-in-one”.

| Alternatif | Mereka kuat di | Cara dnPeople merespons |
|---|---|---|
| HRIS incumbent | Brand, breadth, mobile, payroll scale | Fokus pada workflow exception, evidence, transparency, dan implementation yang ringan |
| Spreadsheet + WhatsApp | Familiar, murah, fleksibel | Tunjukkan biaya rekonsiliasi, approval tanpa bukti, dan audit gap melalui workflow audit |
| Payroll bureau/consultant | Pengetahuan lokal dan service | Tawarkan system of record + evidence; jangan klaim menggantikan professional tax advice |
| Custom internal system | Sangat spesifik | Tawarkan configurable scope/API dengan time-to-value lebih cepat |

**Rule battlecard:** jangan menjelekkan kompetitor atau membuat klaim fitur negatif yang belum diverifikasi. Tanyakan workflow nyata dan tunjukkan gap evidence secara konkret.

## 7. Channel plan 90 hari

### Hari 1–30 — Foundation & signal

- Perbaiki landing page menjadi satu ICP utama: multi-cabang 50–300.
- Buat 3 landing page berbasis use case: `/branch-operations`, `/payroll-confidence`, `/people-evidence`.
- Pasang form dengan field: jumlah cabang, headcount, payroll tool, attendance workflow, pain terbesar, deadline, dan kebutuhan integrasi.
- Buat 2 lead magnets: `Branch HR Audit Checklist` dan `Payroll Evidence Checklist`.
- Founder-led outbound ke 50 akun terpilih; gunakan discovery, bukan blast.
- Wawancara 12 peserta per segmen awal sebagai discovery plan; jangan memakai opini lead sebagai conversion proof.

### Hari 31–60 — Proof & conversion

- Jalankan 5–10 workflow audit bersama prospek.
- Rekam before/after time, exception count, dan handoff pain—dengan izin.
- Publikasikan satu anonymized case study hanya setelah ada customer evidence.
- Webinar kecil: `Dari Excel ke payroll yang bisa diaudit`.
- Partnership dengan payroll consultant, implementer accounting, dan komunitas HR lokal.
- Retarget hanya pengunjung yang melihat pricing/use-case; jangan mulai dengan broad paid ads.

### Hari 61–90 — Repeatable motion

- Pilih satu vertical dengan discovery-to-demo terbaik.
- Buat template konfigurasi dan demo data untuk vertical tersebut.
- Formalisasi referral/partner playbook.
- Uji paid search dengan keyword pain: `absensi multi cabang`, `payroll Indonesia audit`, `approval HR cabang`, bukan hanya `aplikasi HRIS`.
- Review win/loss mingguan dan update battlecard bulanan.

## 8. Sales motion

### Discovery 20 menit

1. Berapa karyawan dan lokasi sekarang, serta proyeksi 12 bulan?
2. Bagaimana attendance exception dan approval ditangani minggu lalu?
3. Berapa kali payroll dibuka kembali setelah closing terakhir?
4. Bukti apa yang dicari ketika ada koreksi atau sengketa?
5. Siapa owner implementasi dan deadline go-live?
6. Apakah ada requirement auto-transfer bank, e-filing, native app, atau SSO wajib?

### Demo 30 menit berbasis masalah

- 0–5: petakan workflow prospek, jangan mulai dari menu.
- 5–15: demo cabang, scope, attendance exception, dan approval evidence.
- 15–23: demo payroll preview, variance, finalize, payslip, dan audit.
- 23–27: tunjukkan talent-to-action hanya jika ICP memiliki talent pain.
- 27–30: sepakati pilot data, owner, success metric, dan next decision date.

### Sales assets wajib

- one-pager Branch Operations Control;
- one-pager People Evidence;
- 30-minute demo script;
- qualification checklist dan disqualifier;
- pricing/tier truth sheet;
- battlecard Talenta/Gadjian/GreatDay/status quo;
- implementation plan 10 langkah;
- objection handling untuk native app, auto-transfer, e-filing, dan API.

## 9. Funnel dan target awal

Target berikut adalah **operating targets**, bukan baseline yang sudah terbukti:

| Tahap | Target 90 hari | Definisi |
|---|---:|---|
| Target accounts | 150 | Akun memenuhi ICP A/B |
| Qualified conversations | 30 | Ada pain aktif, owner, dan timeline |
| Workflow audits | 12 | Prospek menjalankan audit use case bersama tim |
| Pilots/trials | 6 | Ada data sample dan success metric |
| Paying customers | 2–3 | Kontrak dan pembayaran tervalidasi |
| Case studies | 1 | Evidence customer dengan izin tertulis |

Ukur conversion per ICP, channel, vertical, dan competitor alternative. Jangan mengoptimalkan signup FREE saja jika tidak menghasilkan workflow audit atau paid conversion.

## 10. KPI dan operating rhythm

| Ritme | Metrik |
|---|---|
| Harian | lead response time, source, demo booked |
| Mingguan | qualified conversations, workflow audits, trial activation, blockers |
| Bulanan | win/loss, conversion per vertical, CAC proxy, pipeline, paid conversion, churn/activation |
| Per release | feature adoption, proof asset readiness, status Available/Conditional/Roadmap |

**North-star awal:** jumlah akun ICP yang menyelesaikan workflow audit dan mencapai payroll/approval milestone pertama.

## 11. Guardrails komunikasi

Jangan dipakai tanpa bukti atau syarat:

- “ratusan perusahaan sudah memakai dnPeople”;
- “5000+ karyawan” atau customer logo;
- “hemat 80%” atau perbandingan harga kompetitor tanpa quote yang dapat diverifikasi;
- “bayar gaji otomatis ke semua bank”;
- “e-filing DJP/BPJS”;
- “native mobile app”;
- “AI selalu akurat”;
- fitur Conditional sebagai live tanpa menyebut provider/UAT.

## 12. Validasi positioning

Dalam 30 hari pertama, uji tiga narasi secara bergantian:

1. `Aturan HR pusat, tetap rapi di setiap cabang.`
2. `Payroll yang bisa dijelaskan ketika diaudit.`
3. `Dari talent review ke rencana pengembangan yang dijalankan.`

Narasi dianggap menjanjikan jika minimal 3 peserta independen dalam segmen yang sama mengaitkannya dengan kejadian nyata, memiliki workaround, dan bersedia menjalankan workflow audit/pilot. Preferensi satu responden adalah anecdote, bukan insight.

## 13. Referensi internal

- [Product research & differentiation](./PRODUCT-RESEARCH-DIFFERENTIATION-2026-09-17.md)
- [Panduan Business Development](./DNPEOPLE-PANDUAN-BUSINESS-DEVELOPMENT.md)
- [Bisnis, fitur, dan layanan](./DNPEOPLE-BISNIS-FITUR-LAYANAN.md)
- [Feature Catalog](./FEATURE-CATALOG.md)
- [Customer Onboarding Playbook](./CUSTOMER-ONBOARDING-PLAYBOOK.md)

*Author: Dozer · 2026-09-17 · DN Tech — dnPeople HRIS*

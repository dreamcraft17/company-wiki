# DOVA — Kerangka Kemitraan Teknis (Revisi)

## Tanggapan atas Proposal Equity Backend Developer

> **RAHASIA · UNTUK DISKUSI**  
> **Tanggal:** 26 Agustus 2026  
> **Disusun oleh:** Dozer · **Kepada:** Egegieh Onyekachi Daniel, Founder & CEO, DOVA

---

## 01 — Tujuan

Terima kasih sudah menuliskan proposal equity Backend Developer — itu membantu.

Saya ingin tetap dengan DOVA hingga go-live, soft launch, dan fase setelah funding. Dokumen ini **counter untuk diskusi saja**. Tidak ada yang mengikat. Tujuannya selaras soal role, equity, dan scope sebelum dokumen legal.

**Inti usulan:** Proposal kamu memakai title **Backend Developer**. Saya usulkan **CTO & Founding Engineer** — bukan sekadar naik title, tapi karena pekerjaan di lapangan sudah **scope lead tech / CTO**: arsitektur, ownership backend penuh, launch, infra, dan koordinasi FE/QA. Title harus selaras dengan yang DOVA butuhkan hingga soft launch.

Saya juga **siap terus support infrastruktur seperti sekarang** sampai **funding investor yang bermakna** masuk — hosting, ops, SSL, dan situs live di **`dova.dntech.id`**. Saya tidak menanggung domain custom (detail §02.2 dan §07).

---

## 02 — Yang selaras, yang perlu disesuaikan

| Topik | Proposal kamu | Usulan penyesuaian |
|-------|---------------|-------------------|
| **Role** | Backend Developer | **CTO & Founding Engineer** |
| **Equity** | 3% | **~7%** fully diluted (range diskusi **6,5–7,5%**) |
| **Vesting** | 4 tahun / cliff 1 tahun | 4 tahun / **cliff 6 bulan**, lalu bulanan |
| **Scope** | Backend development | Full technical ownership hingga soft launch |
| **Cash** | Tidak spesifik pra-funding | Sama — equity + infra in-kind untuk sekarang; gaji setelah funding |
| **Infra** | Tidak ada di proposal | **Sama seperti sekarang sampai funding investor yang bermakna**; URL publik = **`dova.dntech.id`** |
| **IP sampai perjanjian ditandatangani** | Pemakaian / branding DOVA dianggap milik perusahaan | **Belum ada assignment** — DOVA boleh memakai stack; transfer hanya sesuai perjanjian final |

### 2.0 — Title Backend Developer vs scope aktual

Frame **Backend Developer 3%** cocok untuk orang yang join dari nol, build sesuai spec orang lain, dan handover deploy/infra. Yang DOVA butuhkan — dan yang sudah saya kerjakan — lebih luas:

| Area | Backend Developer biasa | Yang DOVA butuh (dan sudah saya deliver) | CTO / Lead Tech |
|------|-------------------------|------------------------------------------|-----------------|
| Code & API | Ticket fitur sesuai spec | Own arsitektur, monorepo NestJS, business rules | ✅ |
| Database | Migration yang ditugaskan | Own schema, migrations, data model | ✅ |
| Payments | Wire SDK | Paystack end-to-end — init, verify, webhook | ✅ |
| Infra & deploy | Sering tim terpisah | VPS, SSL, live di `dova.dntech.id` | ✅ |
| Go-live | Handover | Paystack live, prod checklist, soft launch | ✅ |
| Team | Ticket saja | Koordinasi FE + QA, release criteria, docs | ✅ |
| Pasca-funding | IC contributor | Bantu hire dan grow engineering | ✅ |

**Itulah kenapa saya usulkan CTO & Founding Engineer, bukan Backend Developer.** Scope-nya bukan backend ticket-only — ini founding technical leadership hingga launch. Lampiran A merangkum yang sudah selesai; sisanya: launch, stability, dan dukungan supplier pilot.

### 2.1 — Kenapa ~7% bukan 3%

Offer **3%** cocok untuk backend developer yang join dari nol dan build sesuai spec. Counter ini lebih tinggi karena **tiga hal** bertumpuk — bukan karena gaji pra-funding:

| Faktor | Artinya |
|--------|---------|
| **1. MVP sudah delivered** | Backend, API, Paystack, DB, situs live, tests, dan runbooks sebagian besar selesai (Lampiran A). Ini delivery level founding, bukan hire greenfield. |
| **2. Technical ownership berkelanjutan** | Hingga go-live dan soft launch: Paystack live, prod hardening, koordinasi FE/QA, supplier pilot — scope CTO/founding engineer, bukan backend ticket-only. |
| **3. Infra in-kind sampai funding bermakna** | Saya terus menanggung hosting dan ops **seperti hari ini** sampai **round investor yang bermakna** masuk, agar DOVA bisa launch dan jalan lean. URL publik tetap **`dova.dntech.id`**. Mengurangi cash burn selama funding belum masuk (detail §07). |

**~7%** (range **6,5–7,5%**) berada di antara backend hire dan split co-founder — selaras dengan role, pekerjaan yang sudah di repo, dan komitmen infra. Angka pasti bisa kita sepakati setelah review cap table fully diluted.

### 2.2 — Dukungan infra sampai funding investor yang bermakna (siap sekarang)

Di luar code, saya **siap terus support infrastruktur DOVA seperti sekarang** — sampai **funding investor yang bermakna** masuk. Saya host dan maintain; DOVA fokus burn ke Paystack, supplier, dan ops.

**URL publik tetap subdomain yang sekarang: `dova.dntech.id`.** Itu dukungan domain yang saya tawarkan. Saya tidak membeli atau menanggung domain custom.

| Item | Sampai funding investor yang bermakna | Catatan |
|------|---------------------------------------|---------|
| VPS / host live | **Ya** — saya tanggung biaya, seperti sekarang | mis. Biznet Gio VPS (~Rp109rb/bulan referensi) |
| URL publik **`dova.dntech.id`** | **Ya** — di DNS/infra saya | Sudah live; GRATIS untuk DOVA; ini domain live-nya |
| SSL, DB (Supabase free tier), monitoring | **Ya** — sudah dikonfigurasi | Burn tetap untuk Paystack, supplier, ops |
| Domain custom / utama (mis. `dovachain.com`) | **Tidak — tidak ditanggung** | Kalau DOVA mau domain sendiri nanti, DOVA yang daftar, bayar, dan miliki |

**Penting:** Ini **dukungan praktis launch-and-run**, bukan pengganti equity. DOVA boleh memakai stack yang ada untuk menjalankan produk. Pemakaian itu **tidak** dengan sendirinya mentransfer kepemilikan. Setelah **round investor yang bermakna** *dan* perjanjian tertandatangan, kita pindah ke akun milik perusahaan dengan handover terdokumentasi (§07). Sampai saat itu, situs live tetap **`dova.dntech.id`**.

**Sampai perjanjian tertulis final ditandatangani, belum ada assignment kepemilikan atau IP atas aset teknis yang ada.** DOVA boleh memakai infrastruktur yang jalan, code, repository, konfigurasi, lingkungan deployment, dan aset teknis terkait untuk mengoperasikan produk. Aset tersebut tetap di bawah kepemilikan dan kontrol saya selama periode ini, termasuk jika bermerek, di-deploy, atau dipakai untuk DOVA. Pemakaian nama atau branding DOVA tidak dengan sendirinya mentransfer kepemilikan aset teknis di baliknya. Assignment atau transfer IP hanya terjadi sebagaimana diatur secara tegas dalam perjanjian tertulis final (§06).

---

## 03 — Role & tanggung jawab

**Title usulan:** **Chief Technology Officer (CTO) & Founding Engineer**  
*(upgrade dari Backend Developer — mencerminkan scope lead tech di atas, bukan hire terpisah.)*

| Area | Tanggung jawab |
|------|----------------|
| Arah teknis | Roadmap, arsitektur, prioritas build |
| Backend & API | NestJS, PostgreSQL, Paystack, business rules |
| Go-live | Paystack live, webhooks, prod checklist, soft launch |
| Infra (sampai funding bermakna) | Env live, uptime, backup, situs live di **`dova.dntech.id`** (lihat §07) |
| Team | Kerja sama FE + QA; release checklist |
| Security | Auth, access control, secrets |
| Pasca-funding | Bantu rekrut dan grow engineering |

**Pengambilan keputusan:** Kamu pegang produk, bisnis, dan arah perusahaan. Saya own eksekusi teknis dan prioritas engineering; perubahan arsitektur besar disepakati bersama.

**Di luar scope untuk sekarang** (bisa revisit nanti): native mobile, BD/sales full-time, lini produk besar di luar roadmap yang disepakati.

---

## 04 — Equity

**Opening term: ~7% fully diluted**

| Komponen | Jumlah | Catatan |
|----------|--------|---------|
| **Pekerjaan lalu (MVP)** | **~1,5%** | Dikredit saat signing — pekerjaan di Lampiran A |
| **Vesting ke depan** | **~5,5%** | Jadwal 4 tahun, **cliff 6 bulan**, lalu bulanan |
| **Total** | **~7%** | % pasti (dalam 6,5–7,5%) di perjanjian legal final |

**Cara membacanya:** ~1,5% saat signing **bagian dari total** — bukan ditumpuk di atas. Mengakui MVP yang sudah delivered. ~5,5% vest untuk pekerjaan lanjutan hingga launch dan seterusnya.

**Terms standar** di perjanjian final: IP assignment, confidentiality, good/bad leaver, acceleration on change of control jika diinginkan.

Jika scope berkembang jauh di luar yang kita sepakati, bisa direvisit — via kesepakatan bersama, bukan sepihak.

---

## 05 — Kompensasi cash

Pra-funding: **tanpa gaji cash** — sama seperti proposal kamu. Kontribusi lewat equity, delivery, dan dukungan infra (seperti sekarang) sampai funding investor yang bermakna.

Pasca-funding: sepakati kompensasi CTO/lead berdasarkan ukuran raise, runway, dan role — **di call**, setelah funding real.

---

## 06 — Kekayaan intelektual (IP)

**Sampai perjanjian tertulis final ditandatangani, belum ada assignment IP.** DOVA boleh memakai stack teknis yang ada untuk kolaborasi ini. Pemakaian, branding, atau deployment untuk DOVA tidak dengan sendirinya mentransfer kepemilikan.

| Item | Sebelum perjanjian ditandatangani | Setelah perjanjian ditandatangani |
|------|-----------------------------------|-----------------------------------|
| **Infra yang jalan** (VPS, SSL, DNS, env live, `dova.dntech.id`) | Di bawah kepemilikan dan kontrol saya; DOVA boleh memakainya untuk menjalankan produk | Handover ke akun DOVA per §07, sesuai perjanjian |
| **Code, repo, API, schema DB, config, docs, tests** | Di bawah kepemilikan dan kontrol saya; DOVA boleh memakainya untuk menjalankan produk | Di-assign ke DOVA (Schedule A) sesuai perjanjian tertandatangan |
| **Nama / brand DOVA di situs live** | Brand tetap milik DOVA; tampil di situs live tidak mentransfer stack | Brand tetap milik DOVA; stack di-assign seperti di atas |
| Tools pribadi generik | Tetap milik saya | Tetap milik saya; lisensi ke DOVA jika dipakai di produk |

Proposal DOVA bilang pekerjaan “akan di-assign ke DOVA sesuai perjanjian tertulis final.” Saya setuju **soal timing itu**: assignment terjadi **sebagaimana diatur perjanjian tertandatangan**, bukan karena situs live sudah tertulis DOVA. Sampai saat itu, aset teknis yang ada tetap di bawah kepemilikan dan kontrol saya, sementara DOVA terus memakainya untuk produk.

---

## 07 — Infrastruktur (sampai funding investor yang bermakna)

Saya lanjutkan **hosting dan ops seperti hari ini** sampai DOVA menutup **funding investor yang bermakna**. Situs live tetap di **`dova.dntech.id`**. Itu domain yang saya support — bukan domain custom.

| Ditanggung saya (sampai funding bermakna) | Tidak ditanggung |
|-------------------------------------------|------------------|
| VPS, env live di host saya | Domain custom / utama (mis. `dovachain.com`) — DOVA beli dan miliki jika/saat mau |
| URL publik: subdomain **`dova.dntech.id`** | VPS/akun milik perusahaan setelah funding bermakna |
| SSL, backup, uptime, env docs | Hosting di infra saya setelah perusahaan punya funding bermakna dan handover selesai |

Nilai referensi jika DOVA bayar VPS sendiri: ~Rp109rb/bulan (~US$6). **Tidak ada tagihan domain custom di sisi saya** — akses publik lewat **`dova.dntech.id`**, sudah live.

Saat **funding investor yang bermakna** masuk (atau DOVA siap jalan di infra sendiri), kita lakukan **handover terdokumentasi 30 hari** ke akun milik perusahaan.

Ini agar DOVA bisa launch dan operasi **tanpa nunggu budget hosting atau domain**. Bukan pengganti equity. Setelah round yang bermakna **dan** terms tertandatangan, infra dapat di-handover ke akun milik perusahaan.

**Pemakaian untuk DOVA bukan kepemilikan atas infrastruktur di baliknya.** Sampai perjanjian tertulis final ditandatangani, infra ini tetap di bawah kepemilikan dan kontrol saya meski situs publik memakai nama DOVA. DOVA boleh terus memakainya untuk menjalankan produk. Handover infra hanya terjadi sebagaimana diatur perjanjian tertandatangan, lewat handover 30 hari setelah funding yang bermakna.

---

## 08 — Komitmen bersama

**Dari saya:** Capai milestone launch · situs live stabil · kerja sama FE/QA · confidentiality

**Dari DOVA:** Unblock Paystack KYC dan supplier pilot sejauh mungkin · share konteks cap table sebelum signing · bicara terbuka jika funding atau scope berubah

---

## 09 — Langkah berikutnya

Jika arah ini terasa fair, mari **bicara di call**, tentukan equity % pasti dan timing title, lalu tuangkan ke perjanjian sederhana.

**Tidak perlu tanda tangan pada draft ini.**

| | **DOZER** | **FOUNDER — DOVA** |
|---|-----------|---------------------|
| **Nama** | Dozer | Egegieh Onyekachi Daniel |
| **Tanggal** | _________________________ | _________________________ |

---

## Lampiran A — MVP yang sudah delivered

| Deliverable | Status |
|-------------|--------|
| NestJS API (auth, catalog, cart, orders, admin, supplier) | Selesai |
| PostgreSQL schema + migrations | Selesai |
| Integrasi Paystack + webhook | Selesai |
| Situs live (`dova.dntech.id`) | Live |
| 92 unit tests + CI | Green |
| Deploy runbooks + env docs | Selesai |

**Masih ke depan:** Paystack live, prod hardening, dukungan supplier pilot, monitoring.

---

*DOVA — Building a better food supply network from Nigerian farmers to consumers.*

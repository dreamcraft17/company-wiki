# Rancangan Harga dan Paket dnFinance

- **Author:** Dozer
- **Produk:** dnFinance (dnAccounting), produk DN Tech
- **Jenis dokumen:** Rekomendasi pricing SaaS
- **Status:** Hipotesis awal untuk validasi, bukan harga final
- **Tanggal:** 27 Oktober 2026
- **Dasar fitur:** `FITUR-PER-MODUL.md` (audit fitur frontend dan backend)
- **Basis harga:** semua harga **sudah termasuk PPN 11%** (usulan), agar sebanding dengan harga publik Accurate

---

## 1. Ringkasan

- Model: berlangganan SaaS bulanan/tahunan.
- Peluncuran awal: **dua paket berbayar** (Starter, Growth) + trial 14 hari.
- **Tanpa paket Free** dan **tanpa paket Enterprise** di tahap awal. Kebutuhan khusus: "Hubungi kami".
- Paket Business dan add-on lanjutan **ditunda** sampai fiturnya matang.
- Harga dibanding Accurate pada jumlah pengguna yang sama: Starter ~36% lebih murah, Growth ~24% lebih murah (harga bulanan list).
- Semua angka adalah hipotesis yang harus divalidasi ke pelanggan awal.

| Paket | Harga bulanan (incl. PPN) | Pengguna | Target |
|---|---:|---:|---|
| Trial 14 hari | Rp0 | 1 | Calon pelanggan baru (akses fitur Growth) |
| Starter | Rp229.000 | 2 | UMKM, freelancer, usaha jasa |
| Growth | Rp319.000 | 5 | Dagang, distributor, toko, bisnis berkembang |

### Prinsip

- Jangan jual fitur yang masih parsial atau belum ada.
- Batas paket wajib ditegakkan di **backend**, bukan hanya menyembunyikan menu.
- Growth adalah paket unggulan di halaman harga, setelah fiturnya lolos uji end-to-end.
- Jangan klaim "lebih lengkap dari Accurate" tanpa perbandingan fitur yang tervalidasi.
- Jangan turunkan harga terlalu jauh dari pesaing; terlalu murah bisa terbaca kurang meyakinkan untuk software akuntansi.

---

## 2. Rincian Paket

### 2.1 Trial 14 hari

- Akses fitur Growth, 1 data usaha, 1 pengguna.
- Setelah trial: pilih paket berbayar atau akun dibatasi (read-only).
- Data tidak boleh hilang tanpa pemberitahuan; ekspor data harus tersedia.
- Paket Free permanen dipertimbangkan **nanti**, setelah biaya support dan konversi terukur.

### 2.2 Starter: Rp229.000/bulan

**Batas:** 2 pengguna, 1 data usaha.

**Fitur:**
- Dashboard standar
- Daftar akun dan jurnal memorial
- Kas masuk, kas keluar, pindah dana
- Master pelanggan dan pemasok
- Penjualan: penawaran, order, surat jalan, invoice, retur
- Pembelian: order, penerimaan barang, tagihan pemasok, retur yang didukung
- Piutang dan utang
- Impor/ekspor CSV yang sudah tersedia
- Laporan keuangan standar: laba rugi, neraca, arus kas
- Laporan umur piutang/utang (jika sudah lolos uji)

**Peran:** pintu masuk pelanggan berbayar, terutama usaha jasa dan dagang sederhana.

### 2.3 Growth: Rp319.000/bulan

**Batas:** 5 pengguna, 1 data usaha.

**Fitur:**
- Semua fitur Starter
- Rekonsiliasi bank manual
- Produk dan jasa, multi-satuan, nomor seri
- Multi-gudang, mutasi gudang
- Koreksi stok dan stok opname
- Aset tetap dan penyusutan otomatis
- Anggaran dan realisasi
- Peran dan hak akses lanjutan
- Insight otomatis keuangan
- Penjadwalan laporan via email (setelah bug diperbaiki)
- Laporan tambahan yang sudah aktif dan teruji

**Peran:** paket unggulan.

### 2.4 Kebutuhan khusus: hubungi kami

Tidak ada paket Enterprise berharga di tahap awal. Alasannya:
- Accurate tidak punya paket fitur bernama Enterprise; yang mendekati adalah Private Cloud (pilihan infrastruktur di server pelanggan).
- Migrasi, SLA, multi-entitas, dan integrasi khusus belum ada yang siap dijual.

Penawaran khusus dibuat per permintaan nyata. **Jangan dijanjikan** sebelum dibangun dan diuji:
- Multi-entitas dengan billing terpisah atau konsolidasi
- Integrasi bank otomatis
- API pelanggan
- Integrasi pajak digital / Coretax

### 2.5 Business (ditunda)

Rencana: 10 pengguna, produksi/job costing, persetujuan pembelian. Harga ditentukan setelah ada data validasi.

Alasan ditunda:
- Segmennya sempit (manufaktur ringan).
- Persetujuan baru benar-benar berjalan untuk faktur pembelian; pengaturan persetujuan dokumen lain belum diterapkan di backend.
- Diluncurkan setelah modul produksi dan persetujuan matang serta ada permintaan nyata dari pelanggan.

---

## 3. Matriks Fitur

| Kapabilitas | Trial | Starter | Growth |
|---|:---:|:---:|:---:|
| Dashboard | Lanjutan | Standar | Lanjutan |
| Daftar akun dan jurnal | Ya | Ya | Ya |
| Kas | Ya | Ya | Ya |
| Rekonsiliasi bank manual | Ya | — | Ya |
| Penjualan | Ya | Ya | Ya |
| Pembelian | Ya | Ya | Ya |
| Piutang dan utang | Ya | Ya | Ya |
| Persediaan dan gudang | Ya | — | Ya |
| Aset tetap | Ya | — | Ya |
| Anggaran | Ya | — | Ya |
| Hak akses lanjutan | Ya | — | Ya |
| Laporan keuangan | Lanjutan | Standar | Lanjutan |
| Laporan pajak | Hanya jika teruji | Hanya jika teruji | Hanya jika teruji |
| Integrasi bank otomatis | Tidak ada | Tidak ada | Tidak ada |
| Pajak digital / Coretax | Tidak ada | Tidak ada | Tidak ada |

Keterangan:
- `Ya` = masuk paket setelah fitur terkait teruji.
- `—` = tidak termasuk di paket (fitur tetap ada di aplikasi).
- Istilah "standar" dan "lanjutan" harus didefinisikan rinci sebelum tampil ke pelanggan.
- Matriks ini rekomendasi produk, bukan kondisi pembatasan yang sudah diterapkan di aplikasi saat ini.

---

## 4. Add-on (tahap awal)

| Add-on | Harga usulan (incl. PPN) | Catatan |
|---|---:|---|
| 1 pengguna tambahan | Rp22.000/bulan | Setara Accurate (Rp22.200); tentukan jenis pengguna dan hak akses |
| Onboarding dan migrasi data | Mulai Rp500.000 sekali bayar | Harga akhir sesuai volume dan kompleksitas data |

**Ditunda** sampai fitur pendukungnya ada: data usaha tambahan, multi-cabang, modul manufaktur, advanced reporting, pelatihan tim berbayar.

Prinsip:
- Jangan tarik biaya untuk fitur yang sudah termasuk paket.
- Jangan jual add-on yang belum bisa ditegakkan secara teknis.
- Tinjau harga berdasarkan biaya support dan server.

---

## 5. Skema Pembayaran

### Bulanan
- Tarif normal tiap bulan.

### Tahunan (bayar 10 bulan, akses 12 bulan)

| Paket | Bulanan | Tahunan | Hemat per tahun |
|---|---:|---:|---:|
| Starter | Rp229.000 | Rp2.290.000 | Rp458.000 |
| Growth | Rp319.000 | Rp3.190.000 | Rp638.000 |

### Yang harus diputuskan sebelum peluncuran
- Konfirmasi harga publik sudah termasuk PPN (usulan: ya)
- Awal dan akhir periode langganan
- Aturan upgrade dan downgrade
- Kebijakan keterlambatan, pembatalan, dan refund
- Invoice dan bukti pembayaran
- Notifikasi perpanjangan
- Masa tenggang sebelum akses dibatasi
- Kebijakan ekspor dan retensi data setelah langganan berakhir

### Metode pembayaran: DOKU

Pembayaran langganan memakai **DOKU**, sama seperti DnPeople. Pola yang sudah berjalan di DnPeople dipakai ulang agar integrasi dan operasionalnya tidak mulai dari nol.

**Yang sudah ada di DnPeople (acuan):**
- **DOKU Checkout** (halaman bayar milik DOKU) dan **DOKU SNAP** (QRIS langsung dari aplikasi) sebagai dua jalur terpisah.
- Pembuatan transaksi per invoice, lalu status diperbarui lewat webhook DOKU (`/webhooks/doku`, `/webhooks/doku-snap`) dengan verifikasi tanda tangan, plus pengecekan status manual sebagai cadangan.
- Mode sandbox dan production dipisah lewat konfigurasi lingkungan; kredensial hanya di server, tidak masuk repositori.
- Kode acuan: `dnpeople/backend/src/lib/doku.ts`, `dokuSnapQris.ts`, `paymentProviderConfig.ts`, dan `src/routes/payments.ts`.

**Alur yang diusulkan untuk dnFinance:**
1. Pelanggan memilih paket dan periode (bulanan/tahunan) di halaman Tagihan.
2. Sistem membuat invoice langganan (harga incl. PPN) dan transaksi DOKU.
3. Pelanggan membayar lewat kanal yang aktif di akun DOKU DN Tech.
4. Webhook DOKU mengonfirmasi, status invoice menjadi lunas, masa aktif paket diperpanjang.
5. Bukti pembayaran dan notifikasi dikirim ke email admin data usaha.

**Catatan penting:**
- Kanal bayar yang tampil (QRIS, virtual account, kartu, dan lainnya) mengikuti kanal yang **diaktifkan di DOKU Back Office**, bukan yang kita tulis di kode. Daftar final menunggu aktivasi dan persetujuan DOKU untuk akun dnFinance (pakai akun merchant DN Tech yang sudah ada atau akun baru: perlu diputuskan).
- Jalur DOKU yang dipakai di DnPeople adalah pembayaran per invoice. Perpanjangan otomatis tanpa aksi pelanggan (debit berulang) belum terverifikasi didukung; tahap awal dirancang sebagai **invoice baru tiap periode** dengan pengingat sebelum jatuh tempo.
- Di dnFinance saat ini **belum ada modul billing**. Tombol "Tagihan" di menu Data Usaha masih nonaktif. Semua alur di atas masih rencana.
- Jangan klaim metode bayar tertentu atau perpanjangan otomatis di halaman harga sebelum diuji di sandbox dan kanalnya aktif di production.

---

## 6. Perbandingan dengan Accurate Online

### Data Accurate (dicek 27 Okt 2026)
- Paket dasar: **Rp333.000/bulan** (Rp300.000 + PPN 11%), berlaku sejak 1 Januari 2026.
- Paket dasar sudah termasuk 1 pengguna (dari sampel faktur).
- Tambahan: Rp22.200/bulan per pengguna, Rp99.900/bulan per cabang.
- Struktur: satu paket dasar + add-on, bukan paket bertingkat.
- Add-on lain mulai Rp22.200/bulan, termasuk add-on Manufaktur; aplikasi kasir Accurate POS disebut gratis.
- Private Cloud (server milik pelanggan): Rp27,75 juta/server, tetap bayar langganan.

### Sampel faktur nyata (satu akun, 30 Des 2025)
- Paket prepaid 1 tahun + 1 pengguna tambahan dengan kode promo: **Rp2.664.000 incl. PPN** untuk 2 pengguna (setara Rp222.000/bulan).
- Sampel ini dibeli sebelum kenaikan harga 1 Januari 2026 dan memakai kode promo; jangan dijadikan patokan tunggal.
- Akun sampel menunjukkan potongan saldo bulanan Rp20.000 dan biaya penggunaan data di luar harga paket; dasar hitungnya belum jelas.

### Perbandingan pada jumlah pengguna yang sama (incl. PPN 11%)

| | dnFinance | Accurate | Selisih |
|---|---:|---:|---|
| Starter, 2 pengguna, bulanan | Rp229.000 | Rp355.200 (333.000 + 22.200) | ~36% lebih murah |
| Growth, 5 pengguna, bulanan | Rp319.000 | Rp421.800 (333.000 + 4 × 22.200) | ~24% lebih murah |
| Starter, 2 pengguna, tahunan | Rp2.290.000 | Rp2.664.000 (sampel faktur promo) | ~14% lebih murah |
| Growth, 5 pengguna, tahunan | Rp3.190.000 | ~Rp3.463.200 (estimasi: sampel + 3 pengguna × 22.200 × 12) | ~8% lebih murah |
| Pengguna tambahan | Rp22.000 | Rp22.200 | Setara |

### Catatan
- Perbandingan hanya nominal, bukan kesetaraan fitur, keandalan, layanan, atau total biaya.
- Isi fitur paket dasar Accurate belum terverifikasi.
- Accurate unggul di merek, ekosistem akuntan, POS gratis, impor marketplace, dan modul manufaktur.
- Harga pesaing dan promo bisa berubah; verifikasi ulang sebelum dipakai di materi publik.
- Selisih tahunan jauh lebih tipis daripada bulanan karena promo tahunan Accurate; siapkan promo peluncuran tahunan.

**Posisi yang disarankan:**
> "Software akuntansi dan operasional bisnis yang terjangkau, dengan paket transparan untuk usaha yang berkembang."

---

## 7. Kesiapan Fitur dan Risiko Peluncuran

Hasil audit `FITUR-PER-MODUL.md`:
- 98 menu (termasuk Dashboard)
- 67 berfungsi, 24 sebagian, 7 belum tersedia
- Grup Pajak Digital disembunyikan (label *Soon*)

**Blocker akuntansi (harus selesai sebelum paket berbayar dibuka):**
1. PPN masukan di tagihan pemasok dan retur pembelian diposting ke akun persediaan, bukan akun PPN masukan.
2. Stok awal barang baru dijurnal ke akun Kas, bukan Ekuitas Saldo Awal.
3. Impor saldo awal belum memvalidasi total debit dan kredit.
4. Penjadwalan laporan email tidak mengikuti frekuensi yang dipilih, dan salah satu jenis laporan mengirim Trial Balance.
5. Status Catat Biaya belum berubah menjadi "Lunas".

Catatan: temuan ini berasal dari audit dan harus diverifikasi ulang pada kode terbaru sebelum rilis. Karena harga dekat dengan Accurate, blocker ini wajib selesai lebih dulu.

### Gerbang sebelum fitur masuk paket berbayar
- [ ] Alur utama lolos uji end-to-end
- [ ] Jurnal debit/kredit dan saldo buku besar benar
- [ ] Dampak stok dan pajak terverifikasi
- [ ] Hak akses diperiksa di backend
- [ ] Batas paket ditegakkan di backend
- [ ] Billing, masa aktif, upgrade, downgrade teruji
- [ ] Pembayaran DOKU lolos uji sandbox (bayar, webhook, perpanjangan masa aktif, gagal/kedaluwarsa) dan kanal production aktif
- [ ] Dokumentasi sesuai kondisi aplikasi
- [ ] Support siap menangani pelanggan berbayar

---

## 8. Prioritas Implementasi

1. **Integritas akuntansi:** perbaiki 5 blocker di atas, uji dengan transaksi nyata di lingkungan pengujian.
2. **Definisi produk:** tetapkan persis fitur dan batas (pengguna, data usaha, data/penyimpanan) per paket.
3. **Subscription dan billing:** status langganan, masa aktif, tagihan, pembayaran lewat DOKU (webhook, status invoice, bukti bayar), perpanjangan, pembatalan, downgrade, pemulihan akses. Uji di sandbox DOKU dulu.
4. **Halaman harga:** tampilkan paket, harga bulanan/tahunan (incl. PPN), batas, add-on, trial, kebijakan pembatalan.
5. **Validasi pasar:** uji dengan 10–20 pelanggan awal sebelum harga dipublikasikan.

**Metrik validasi:**
- Jumlah calon pelanggan yang mencoba trial
- Konversi trial ke berbayar
- Paket yang paling dipilih
- Alasan menolak
- Biaya onboarding dan support
- Penggunaan dan retensi

**Uji harga:** Growth Rp319.000 vs Rp299.000.

---

## 9. Keputusan yang Masih Terbuka

1. **Free permanen:** kapan dibuka, dengan syarat apa (biaya support terukur, bug kritis selesai)?
2. **Harga Growth:** Rp319.000 atau Rp299.000? Uji keduanya.
3. **Promo peluncuran tahunan:** perlu atau tidak untuk menyaingi promo tahunan Accurate?
4. **Rekonsiliasi bank:** tetap di Growth sebagai pembeda, atau dipindah ke Starter jika calon pelanggan jasa menolak?
5. **Batas data/penyimpanan:** apakah ada, dan berapa? Jelaskan terang di halaman harga.
6. **Hitungan pengguna:** per akun aktif, per jenis lisensi, atau per seat?
7. **Banyak data usaha dalam satu akun:** didukung atau tidak, dan bagaimana billing-nya?
8. **PPN:** konfirmasi harga publik incl. PPN, dan status PKP DN Tech.
9. **Metode pembayaran:** gateway sudah diputuskan, yaitu DOKU. Yang masih terbuka: pakai akun merchant DOKU yang sama dengan DnPeople atau akun baru, jalur mana (Checkout, SNAP QRIS, atau keduanya), kanal apa yang diaktifkan saat peluncuran, dan perlu tidaknya perpanjangan otomatis.
10. **Onboarding, migrasi, pelatihan:** termasuk paket atau dijual terpisah?
11. **Kapan Business dan paket khusus diluncurkan:** syarat fitur apa yang harus matang dulu?

---

## 10. Rekomendasi Akhir

| Paket | Harga bulanan (incl. PPN) | Harga tahunan (incl. PPN) |
|---|---:|---:|
| Trial 14 hari | Rp0 | — |
| Starter | Rp229.000 | Rp2.290.000 |
| Growth | Rp319.000 | Rp3.190.000 |
| Pengguna tambahan | Rp22.000 | — |

- Growth = paket unggulan, Starter = pintu masuk, kebutuhan khusus lewat "Hubungi kami".
- Business, Free permanen, dan add-on lanjutan menyusul setelah ada data validasi.
- Selesaikan blocker akuntansi dan billing sebelum harga diumumkan.

**Catatan final:** ini rancangan awal, bukan keputusan harga final.

---

## Sumber

- [Informasi Harga Paket Dasar Accurate 2026](https://accurate.id/informasi/pengguna/harga-data-usaha-2026/)
- [Accurate Online (landing harga)](https://accurate.id/lp/accurate-online/)
- [Harga Accurate Online Private Cloud](https://accurate.id/private-cloud/harga/)
- [Accurate Online Private Cloud](https://accurate.id/private-cloud/)
- Sampel faktur dan mutasi billing Accurate (30 Des 2025), disediakan DN Tech; data pelanggan tidak dimuat

# dnAccounting — Fitur Lengkap per Modul

> **Status:** Active · **Last updated:** 2026-10-27 · **Author:** Dozer
> **Produk:** dnAccounting · **Repo:** `dnFinance/` (`main` @ `4bd2cd2`) · **Sumber:** audit kode per layar (frontend + backend)

## Ringkasan

Dokumen ini mencatat apa yang **benar-benar bisa dilakukan** di setiap menu sidebar dnAccounting, mengikuti urutan menu di aplikasi. Setiap menu diberi status:

| Status | Arti |
|--------|------|
| ✅ **Berfungsi** | Data tersimpan lewat backend; alur utama jalan |
| 🟡 **Sebagian** | Jalan, tapi ada bagian penting yang belum aktif (disebutkan) |
| ⛔ **Belum tersedia** | Layar ada, tapi isinya placeholder / integrasi belum dibangun |

Untuk penjelasan cara kerja fitur inti (registrasi, RBAC, alur jurnal), lihat [FITUR-LENGKAP.md](./FITUR-LENGKAP.md). Untuk endpoint: [API.md](./API.md) dan Swagger `/api/docs`.

**Rekap:** 98 menu (termasuk Dashboard) → 67 Berfungsi · 24 Sebagian · 7 Belum tersedia (grup Pajak Digital sedang disembunyikan dengan label *Soon*).

---

## Fitur lintas modul

### Multi-usaha (Data Usaha)

- Satu email bisa mengelola beberapa perusahaan. Setelah login, pengguna memilih usaha di layar **Data Usaha**.
- Aksi per usaha: Buka, Edit Info, Tambah/Cabut Administrator, Nonaktifkan (dengan alasan) / Aktifkan Kembali, Wajibkan 2FA, Ganti password.
- Belum tersedia: menu "Tagihan" di kartu usaha (pakai menu profil › Langganan & Tagihan), Daftar Persetujuan Akses, bahasa English/简体中文, Riwayat Login.

### Langganan & Tagihan (Pusat Tagihan) — 🟡 Sebagian

Dibuka dari menu profil di layar Data Usaha › **Langganan & Tagihan** › pilih usaha. Model **deposit**: saldo diisi lewat DOKU, tagihan bulanan dipotong otomatis dari saldo.

| Menu | Isi |
|------|-----|
| Ringkasan | Kode tagihan (`DNF…`, bisa disalin), aktif hingga, periode berjalan, saldo deposit, tombol Tambah deposit, perkiraan tagihan berikutnya (rincian, PPN di dalam harga, dipotong saldo, sisa yang perlu ditambah) |
| Profil Penagihan | Nama, email, telepon, NPWP, alamat (dipakai di faktur dan sebagai kontak DOKU) |
| Faktur Tagihan | Faktur bulanan `FBDNF-YYYYMM-…`, status Lunas / Belum lunas, rincian |
| Paket & Pengguna | Ganti paket (berlaku periode berikutnya), slot pengguna tambahan Rp22.000/orang/bulan (langsung menaikkan batas pengguna) |
| Mutasi Saldo | Uang masuk (deposit) dan keluar (tagihan) dengan saldo akhir |
| Riwayat Deposit | Transaksi DOKU `TRXDNFINANCE-YYYYMMDD-…`, Lanjutkan bayar, Cek status |

- Pembayaran: DOKU Checkout (port dari dnPeople). Webhook `POST /api/v1/webhooks/doku` dengan verifikasi tanda tangan + Check Status saat pelanggan kembali dari DOKU. Idempoten (webhook dobel tidak menambah saldo dua kali).
- Cron harian 01.00 WIB menerbitkan faktur periode yang jatuh tempo dan membayarnya dari saldo; saldo kurang → faktur Belum lunas, lunas otomatis saat deposit berikutnya masuk.
- Hanya Administrator yang bisa deposit, ganti paket, ubah slot, dan ubah profil penagihan.
- Tombol bayar nonaktif selama `DOKU_CLIENT_ID` / `DOKU_SECRET_KEY` belum diisi di server.
- Belum ada: redeem voucher, nomor VA tetap, biaya penggunaan data, pembatasan akses saat tagihan menunggak, email bukti bayar. Belum diuji end-to-end di sandbox DOKU.

### Penomoran dokumen

- Nomor otomatis per tipe dokumen (default `PREFIX.YYYY.MM.NNNNN`), bisa diganti di **Pengaturan › Format Nomor**.
- Hampir semua form juga menerima nomor manual.

### Kunci tanggal transaksi

- **Pengaturan Usaha › Pembatasan** (tanpa batas / rentang / tanggal / N hari) **ditegakkan** di semua simpan/ubah transaksi dan saat posting.
- Tutup periode (`/company/period-close`) hanya soft lock — tidak memblokir posting GL.

### Saldo awal

Saldo piutang pelanggan, utang awal pemasok, dan saldo awal akun otomatis dijurnal ke **Ekuitas Saldo Awal (3900)**. Jika diubah, jurnal lama dibalik lalu diposting ulang.

### Persetujuan

| Dokumen | Perilaku |
|---------|----------|
| Faktur Pembelian | **Ditegakkan** bila Preferensi mewajibkan: simpan → ajukan ke manager/admin → Setujui/Tolak (di form atau link email) → baru posting GL + stok |
| Jurnal Memorial | Ajukan Persetujuan via email berurutan berjalan; toggle "Wajibkan Persetujuan Jurnal" **hanya disimpan** |
| Dokumen lain (SO, DO, retur, dll.) | Pengaturan tersimpan, belum dipakai backend |

### Akun GL standar

| Akun | Kode |
|------|------|
| Kas / Piutang / Persediaan / Uang Muka Pemasok | 1000 / 1100 / 1200 / 1300 |
| Kas Penampung / WIP | 1055 / 1500 |
| Utang Usaha / GR-IR / PPN Keluaran / PPh 23 / PPh 21 / Uang Muka Pelanggan / Utang Gaji | 2000 / 2050 / 2100 / 2200 / 2210 / 2300 / 2400 |
| Ekuitas Saldo Awal | 3900 |
| Penjualan / Retur Penjualan | 4000 / 4900 |
| HPP / Penyesuaian Persediaan / Selisih Opname / Retur Pembelian / Beban Gaji | 5000 / 5250 / 5260 / 5290 / 5400 |
| Selisih Kurs | 7000 / 7100 |

---

## Dashboard

### Dashboard — ✅ Berfungsi

- Banyak tata letak per pengguna: buat, ganti nama, jadikan default, hapus.
- Tambah/hapus/susun widget; susunan tersimpan. Filter periode per widget.
- **21 widget**, semua dengan data nyata: Aktivitas Terakhir Anda, Arus Kas, Aset Saat Ini, Barang Stok Minimum, Beban Perusahaan, Faktur Terlewat, Keberhasilan Penawaran, Kegiatan Mendatang, Kegiatan Terlewat, Ketersediaan Kas, Laba/Rugi Tahun Ini, Monitoring HPP, Pelanggan Berutang, Pembelian, Penawaran Terabaikan, Pengguna Aktif, Penjualan, Penjualan Barang, Penjualan Pelanggan, Penjualan per Kategori, Tren Penjualan.

---

## 1. Usaha

| Menu | Status | Fitur |
|------|--------|-------|
| Tarif Pajak | ✅ | Kode pajak PPN, PPnBM, PPh 4(2)/15/21/22/23; persentase; akun pajak jual & beli; filter, cetak, hapus |
| Termin Bayar | ✅ | Hari & % diskon, jatuh tempo, default; dipakai di dokumen jual/beli |
| Jasa Kirim | ✅ | Nama, PIC, telepon, alamat. *Impor file belum tersedia* |
| Titik Serah (FOB) | ✅ | Master nama FOB |
| Komponen Gaji | ✅ | 14 tipe pendapatan/potongan sesuai SPT PPh 21, akun beban; terkunci bila sudah dipakai penggajian |
| Data Karyawan | 🟡 | Data pribadi, jabatan, flag Penjual, alamat, PPh 21 (NPWP, PTKP, status pekerja), rekening gaji. *Impor Excel belum tersedia* |
| Transaksi Rutin | 🟡 | Daftar template dari "Tambah ke Favorit" di Jurnal Memorial; Jalankan / Jalankan Semua (maks. 1×/bulan). *Belum bisa buat/edit di layar ini; kategori belum tersedia* |
| Tutup Buku Bulanan | 🟡 | Input kurs akhir bulan untuk mata uang asing. *Belum menjurnal penyusutan/selisih kurs dan tidak mengunci periode* |
| Buku Kontak | ✅ | Daftar gabungan pelanggan, pemasok, karyawan (baca saja) |
| Template Transaksi | 🟡 | Daftar favorit (nama + tipe). *Belum bisa dipakai ulang di dokumen* |
| Agenda | 🟡 | Kalender otomatis: jatuh tempo piutang/utang, gaji, transaksi terjadwal; tambah event manual. *Belum bisa hapus event; Subscribe belum tersedia* |
| Riwayat Aktivitas | ✅ | Log audit: dokumen, tindakan, waktu, pengguna, IP; filter |

---

## 2. Akuntansi

### Daftar Akun — ✅ Berfungsi

- Buat/edit akun: tipe, induk, kode, nama, catatan, info bank, akses pengguna.
- Saldo awal per tanggal (otomatis ke Ekuitas Saldo Awal).
- Tab Akun Anak & Histori.
- Impor/Ekspor CSV, template akun per industri, cetak.
- *Tidak ada hapus akun.*

### Catat Biaya — 🟡 Sebagian

- Utang beban, rincian akun beban, jatuh tempo.
- Jurnal: Dr beban / Cr utang beban. Draf belum memposting; dokumen terposting terkunci.
- *Status "Lunas" belum ter-update dari pembayaran; Proses Pembayaran belum tersedia.*

### Penggajian — 🟡 Sebagian

- Periode, rincian karyawan × komponen gaji.
- Preview PPh 21 metode **TER (PP 58/2023)**.
- Jurnal: Dr beban gaji / Cr potongan / Cr Utang PPh 21 / Cr Utang Gaji neto.
- *Kategori TER B/C masih memakai tabel A (ditandai perkiraan). Slip gaji dan pembayaran gaji neto ke Kas Keluar belum tersedia.*

### Jurnal Memorial — ✅ Berfungsi

- Debit/kredit wajib seimbang.
- Tiga mode: Simpan & posting, Draf, atau Ajukan Persetujuan via email.
- Tambah ke Favorit / Ambil Favorit.
- *Jurnal terposting tidak bisa diedit/dihapus; impor belum tersedia.*

### Menu Akuntansi lainnya

| Menu | Status | Fitur |
|------|--------|-------|
| Pantau Anggaran | 🟡 | Anggaran vs realisasi GL per bulan/akun. *Per departemen/proyek belum tersedia* |
| Alih Anggaran | ✅ | Pindah anggaran antar akun/bulan dengan cek sisa. *Tidak ada edit/hapus* |
| Rencana Anggaran | ✅ | Anggaran per bulan/tahun per akun, catatan, penganalisa. *Dimensi proyek/cabang belum ada* |
| Mutasi Akun | ✅ | Mutasi GL per akun + saldo berjalan; ekspor Excel (CSV) |
| Riwayat Jurnal | ✅ | Log audit khusus jurnal (baca saja) |

---

## 3. Kas & Bank

### Kas Keluar — 🟡 Sebagian

- Kas/bank, rincian akun, no cek, penerima.
- Jurnal: Dr akun / Cr kas.
- Edit terposting = balik + posting ulang. VOID = jurnal balik, dokumen tetap ada.
- Impor CSV, cetak.
- *Menu "Ambil" (beban, gaji, PPh) belum tersedia, jadi pelunasan beban/gaji belum tertaut.*

### Kas Masuk — ✅ Berfungsi

Kebalikan dari Kas Keluar: Dr kas / Cr akun. Mendukung draf, VOID, hapus, impor CSV, dan cetak.

### Pindah Dana — ✅ Berfungsi

- Transfer antar kas/bank dengan biaya transfer yang dibebankan ke sumber atau tujuan; jurnal otomatis.
- Draf, ekspor, cetak.

### Menu Kas & Bank lainnya

| Menu | Status | Fitur |
|------|--------|-------|
| Koneksi Bank | 🟡 | Daftar rekening + akun GL; jadi wadah impor mutasi. *Belum ada sinkronisasi otomatis ke bank* |
| Mutasi Rekening | ✅ | Impor mutasi bank dari CSV per rekening; tanda yang sudah dicocokkan; hapus baris |
| Buku Bank | ✅ | Histori kas/bank dengan saldo awal & berjalan; batalkan pencocokan; ekspor |
| Cocokkan Bank | ✅ | Rekonsiliasi: cocokkan manual, saran per baris, auto-match semua; laporan rekonsiliasi |
| Virtual Account | ⛔ | Katalog integrasi, belum terhubung |
| Pembayaran Online | ⛔ | Katalog (tautan bayar, QRIS, invoice online), belum terhubung |

---

## 4. Penjualan

Alur dokumen: **Penawaran → Order → Surat Jalan → Invoice → Pelunasan**. Setiap tahap bisa *Ambil dari* dokumen sebelumnya atau *Proses ke* dokumen berikutnya.

| Menu | Status | Fitur |
|------|--------|-------|
| Penawaran Harga | ✅ | Pelanggan, barang (harga default dari level harga), diskon, PPN, biaya lain; proses ke Order/Surat Jalan/Invoice; terkunci setelah diproses. Tanpa efek GL/stok |
| Order Penjualan | ✅ | + No. PO, pengiriman, FOB; status dari qty terkirim/terfaktur; tutup/buka kembali; proses ke Surat Jalan/Invoice/DP |
| Surat Jalan | ✅ | Kirim barang (+ nomor seri): **stok keluar** + Dr HPP / Cr Persediaan; hapus mengembalikan stok |
| DP Penjualan | ✅ | Dr Piutang / Cr Uang Muka Pelanggan (+ PPN); dipotong otomatis saat dipakai di invoice |
| Invoice Penjualan | ✅ | Jurnal Dr Piutang / Cr Penjualan / Cr PPN; invoice langsung juga mengurangi stok + HPP; PDF; email ke pelanggan |
| Pelunasan Piutang | 🟡 | Bayar banyak invoice + DP sekaligus, diskon pelunasan, selisih kurs, kelebihan bayar. *Edit, hapus, VOID, dan draf belum tersedia* |
| Retur Penjualan | ✅ | Dari invoice, surat jalan, tanpa invoice, atau DP; stok masuk + HPP dibalik; Dr Retur Penjualan / Cr Piutang |
| Grup Pelanggan | ✅ | Kategori pelanggan bertingkat |
| Level Harga | ✅ | Kategori harga jual untuk Atur Harga & Diskon |
| Pelanggan | ✅ | Data umum, banyak kontak, alamat tagih/kirim/pajak, limit piutang, NPWP/NITKU; saldo piutang awal. *Impor Excel belum tersedia* |
| Atur Harga & Diskon | 🟡 | Daftar harga per level + tanggal berlaku. *Baru harga level "Umum" yang dipakai di dokumen; tipe Diskon belum diterapkan* |
| Komisi Sales | 🟡 | Aturan komisi per penjual/barang/merek. *Perhitungan & pembayaran komisi belum tersedia* |
| Target Sales | ✅ | Target nilai/qty per periode. *Laporan target vs realisasi belum tampil* |
| Toko Online | ⛔ | Hanya pengaturan toko; impor penjualan marketplace belum tersedia |
| Kunjungan Sales | 🟡 | Daftar check-in sales (baca saja); belum ada form input di web |

---

## 5. Pembelian

Alur dokumen: **Order Pembelian → Terima Barang → Tagihan Pemasok → Pelunasan Utang**.

| Menu | Status | Fitur |
|------|--------|-------|
| Order Pembelian | ✅ | Harga otomatis dari daftar harga pemasok; ambil barang yang perlu dipesan; proses ke Penerimaan/Tagihan/DP. Tanpa efek GL/stok |
| Terima Barang | ✅ | **Stok masuk** (+ nomor seri, gudang) + Dr Persediaan / Cr GR/IR 2050; qty diterima di PO ter-update |
| DP Pembelian | ✅ | Dr Uang Muka Pemasok / Cr Utang; dipotong saat tagihan |
| Tagihan Pemasok | ✅ | PPN, PPh 23, biaya lain, DP; langsung posting atau lewat **persetujuan**; tagihan langsung menambah stok; Tandai Lunas, jadwalkan bayar |
| Pelunasan Utang | 🟡 | Bayar banyak tagihan, DP & retur sebagai pengurang. *Pembayaran sebagian dan lebih bayar belum didukung* |
| Retur Pembelian | 🟡 | Dari tagihan, penerimaan, atau tanpa tagihan; stok keluar; Dr Utang / Cr Retur Pembelian. *Retur dari DP belum tersedia* |
| Daftar Harga Pemasok | ✅ | Harga per pemasok + tanggal berlaku; dipakai otomatis di PO & tagihan |
| Grup Pemasok | ✅ | Kategori pemasok |
| Pemasok | ✅ | Kontak, akun pembelian, rekening bank, pajak, alamat; utang awal; tab daftar utang. *Impor Excel belum tersedia* |
| Jadwal Bayar | ✅ | Perintah pembayaran tagihan jatuh tempo → otomatis jadi pelunasan ke Kas Penampung 1055 |
| Bayar Massal Pemasok | ✅ | Proses banyak perintah bayar sekaligus: Dr Kas Penampung / Cr Bank (pencatatan, bukan transfer bank sungguhan) |

---

## 6. Persediaan

### Produk & Jasa — ✅ Berfungsi

- **Jenis:** Persediaan, Non Persediaan, Jasa, Grup (paket), Varian, Modifier.
- **Multi-satuan:** hingga 4 satuan tambahan dengan rasio dan harga sendiri. Stok disimpan dalam satuan dasar.
- **Paket (Grup):** stok bergerak per komponen.
- **Nomor seri:** wajib unik saat masuk dan harus ada saat keluar.
- **Varian:** SKU anak dibuat otomatis per kombinasi.
- Akun per barang (Persediaan, HPP, dll.) dengan default dari kategori.
- Batas stok minimum, harga jual/beli, pemasok utama, pajak.
- Daftar dengan banyak kolom opsional, ekspor CSV.
- *Catatan:*
  - BOM dan Modifier tersimpan tapi belum dipakai transaksi.
  - Stok awal saat ini dijurnal ke Kas (1000), bukan Ekuitas Saldo Awal.
  - Impor Excel dan unggah gambar belum tersedia.

### Mutasi Gudang — ✅ Berfungsi

- Kirim dari gudang asal, lalu terima di gudang tujuan.
- Stok dicek dan dikonversi satuan.
- Tanpa jurnal GL.

### Koreksi Stok — ✅ Berfungsi

- Tambah/kurang stok per baris (multi-satuan, nomor seri) ke akun penyesuaian 5250.
- Stok tidak boleh minus per gudang.

### Produksi

Model *job costing* lewat tiga layar:

1. **Perintah Produksi** — ✅ bahan & biaya dibebankan ke WIP 1500 (stok bahan keluar).
2. **Pemakaian Bahan** — ✅ ambil/retur bahan tambahan ke job.
3. **Hasil Produksi** — ✅ nilai WIP dialokasikan ke barang jadi per porsi (stok masuk) atau ke akun; job ditandai selesai. Hapus membuka kembali job.

### Stok Opname

1. **Jadwal Stok Opname** — ✅ SPK per gudang (filter kategori/pemasok/merek).
2. **Hasil Hitung Stok** — ✅ diisi petugas yang ditugaskan.
3. **Proses Opname** — membekukan stok sistem dan otomatis membuat Koreksi Stok ke akun Selisih Opname 5260.

### Menu Persediaan lainnya

| Menu | Status | Fitur |
|------|--------|-------|
| Permintaan Pembelian | 🟡 | Permintaan beli/kirim barang dengan status. *Tipe "Beli" belum tersambung ke Order Pembelian* |
| Lokasi Gudang | ✅ | Gudang + alamat, penanggung jawab, gudang barang rusak. *Pembatasan pengguna per gudang belum ditegakkan* |
| Satuan | ✅ | Master satuan + ref kode pajak |
| Kategori Produk | ✅ | Kategori bertingkat + 9 akun default yang disalin ke barang baru |
| Merek | ✅ | Master merek |
| Sisa Order | 🟡 | Order penjualan yang belum terkirim penuh. *Tombol buat PO dari kekurangan belum tersedia* |
| Stok per Gudang | ✅ | Stok per barang atau per gudang pada tanggal tertentu; ekspor |
| Stok Menipis | 🟡 | Barang di bawah minimum + qty dipesan. *Tombol "Minta" masuk ke daftar terpisah (bukan layar Permintaan Pembelian); "Pesan" belum tersedia* |

---

## 7. Aset Tetap

### Daftar Aset — ✅ Berfungsi

- Data aset, akun aset/akumulasi/beban, umur, nilai sisa, kategori, lokasi, kelompok fiskal.
- **Metode penyusutan:** Garis Lurus, Saldo Menurun (2× tarif GL), Angka Tahun, Tidak Disusutkan.
- **Penyusutan otomatis** tiap tanggal 1 (01:00 WIB): Dr Beban Penyusutan / Cr Akumulasi. Aset yang mulai dipakai setelah tanggal 15 disusutkan mulai bulan berikutnya.
- Draf tanpa jurnal; aset terposting terkunci (perubahan lewat Revaluasi).
- *Jadwal penyusutan fiskal (PMK 72/2023) sudah dihitung backend tapi belum tampil di layar.*

### Menu Aset Tetap lainnya

| Menu | Status | Fitur |
|------|--------|-------|
| Kelompok Aset | ✅ | Kategori aset (bawaan: Bangunan, Kendaraan, Mesin & Peralatan, Peralatan Kantor) |
| Kelompok Aset Fiskal | ✅ | Kelompok 1–4 & Bangunan sesuai PMK; tarif dihitung otomatis |
| Revaluasi Aset | ✅ | Ubah data/akun (jurnal reklasifikasi), kapitalisasi biaya, revaluasi naik/turun ke akun laba rugi |
| Pelepasan Aset | ✅ | Pelepasan sebagian/penuh, dijual atau tidak; jurnal laba/rugi pelepasan otomatis; bisa dibatalkan |
| Mutasi Aset | ✅ | Pindah aset antar lokasi (tanpa jurnal) |
| Aset per Lokasi | ✅ | Posisi aset per alamat per tanggal; ekspor |

---

## 8. Pajak Digital — *Soon* (disembunyikan di sidebar)

| Menu | Status | Fitur |
|------|--------|-------|
| e-Faktur Coretax | ⛔ | Belum terhubung ke PJAP/Coretax; arahkan ke ekspor CSV di SPT Masa PPN |
| Kirim Faktur Pajak | 🟡 | Email massal PDF invoice ber-PPN ke pelanggan. *Belum PDF faktur pajak DJP* |
| e-Faktur Lama | ⛔ | Belum terhubung |

---

## 9. Laporan

### Laporan pajak

| Menu | Status | Fitur |
|------|--------|-------|
| SPT Masa PPN | 🟡 | Rekap PPN keluaran (invoice) & masukan (tagihan) per periode; unduh CSV e-Faktur keluaran. *Retur, digunggung, PPnBM belum* |
| SPT PPh 21 | ✅ | Form 1721 induk, 1721-I, 1721-II, 1721-IV dari data penggajian; cetak; ekspor CSV e-PPh |
| Bukti Potong PPh 21 | ✅ | 1721-A1 tahunan (biaya jabatan, PTKP, tarif progresif UU HPP) & 1721-VI; cetak; ekspor CSV. *Belum kirim ke e-Bupot* |

### Insight Otomatis — ✅ Berfungsi

Empat aturan atas data nyata, dengan level Info/Perhatian/Kritis dan tautan ke transaksi sumber:

- beban terbesar,
- perubahan laba-rugi vs bulan lalu,
- piutang di atas 60 hari,
- proyeksi kas habis.

### Semua Laporan — 🟡 Sebagian

Peluncur 17 grup / 39 kartu; **17 kartu aktif**. Laporan yang benar-benar menampilkan data (di **Laporan Keuangan**):

- Trial Balance
- Laba Rugi (per departemen)
- Neraca
- Arus Kas
- Ringkasan Pajak bulanan
- Umur Piutang & Utang
- Anggaran vs Realisasi
- Proyeksi Utang 30 hari

*Belum tersedia:* L/R multi-periode/perbandingan, arus kas langsung, rasio, nilai persediaan, perbedaan penyusutan komersial vs fiskal.

---

## 10. Pengaturan

### Pengaturan Usaha — 🟡 Sebagian

- 14 tab preferensi, semua tersimpan.
- **Yang ditegakkan:**
  - pembatasan tanggal transaksi,
  - fitur pajak on/off,
  - persetujuan faktur pembelian,
  - multi mata uang on/off,
  - akun default penjualan/persediaan/HPP/retur/diskon/saldo awal.
- *Hanya disimpan:* metode biaya (rata-rata/FIFO), format angka/tanggal, rentang umur piutang, opsi manufaktur/kontraktor, SMTP.

### Peran & Hak Akses — ✅ Berfungsi

- Grup akses dengan matriks per modul (Aktif/Buat/Ubah/Hapus/Lihat) untuk menu, akses lain, dan cetakan; Salin Hak.
- Grup sistem bawaan: Admin, Akuntan, Manajer, Hanya Lihat.
- **Ditegakkan di server** untuk grup custom:
  - tolak menu/aksi,
  - hanya lihat data sendiri,
  - sembunyikan harga beli,
  - nomor manual,
  - ubah tanggal,
  - dokumen tanpa sumber,
  - jual di bawah HPP,
  - lewati limit piutang.
- *Batasan waktu akses belum dicek.*

### Menu Pengaturan lainnya

| Menu | Status | Fitur |
|------|--------|-------|
| Pengguna | ✅ | Undang via email, jenis akses Operator/Administrator, grup akses, aktif/nonaktif, status 2FA |
| Format Nomor | ✅ | Format per 44 tipe dokumen: tahun, bulan (angka/Romawi), counter, teks; reset harian/bulanan/tahunan; preview |
| Template Cetak | 🟡 | Template teks per 31 tipe dokumen + subjek/pesan email. *Belum dipakai saat cetak/email* |
| Toko Aplikasi | ⛔ | Katalog add-on, belum bisa dipasang |
| Program Modal | ⛔ | Placeholder |
| Impor Data | ✅ | Tempel CSV: daftar akun, saldo awal, pelanggan, pemasok. *Tanpa unggah file/preview; belum ada impor barang/transaksi* |
| Keamanan (2FA) | ✅ | TOTP (Google Authenticator) dengan setup key; diverifikasi saat login. *Kode QR & kode cadangan belum ada* |
| Laporan Keuangan | ✅ | Laporan inti + ekspor GL & e-Faktur CSV + jadwal laporan via email (PDF, 08:00 WIB) |

---

## Catatan teknis yang perlu ditindaklanjuti

Temuan dari audit ini; belum diperbaiki di kode:

| # | Temuan | Dampak |
|---|--------|--------|
| 1 | **PPN Masukan di Tagihan Pemasok dan Retur Pembelian diposting ke akun 1200 Persediaan**, bukan akun PPN Masukan (`app.service.ts` sekitar baris 1755) | Nilai persediaan di neraca membengkak; PPN masukan tidak muncul sebagai akun pajak |
| 2 | Stok awal barang baru dijurnal ke Kas 1000, bukan Ekuitas Saldo Awal 3900 | Saldo kas berkurang palsu saat input stok awal |
| 3 | Impor saldo awal tidak mengecek debit = kredit | Neraca bisa tidak seimbang |
| 4 | Jadwal laporan email terkirim **setiap hari**; frekuensi tidak dicek. Jenis Neraca mengirim PDF Trial Balance | Penerima dapat email lebih sering dari yang dipilih |
| 5 | Status Catat Biaya tidak pernah jadi "Lunas" | Monitoring utang beban tidak akurat |

## Dokumen terkait

- [FITUR-LENGKAP.md](./FITUR-LENGKAP.md) — cara kerja fitur inti
- [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) — katalog status
- [API.md](./API.md) — endpoint
- [TEST-CASES.md](./TEST-CASES.md) — UAT manual

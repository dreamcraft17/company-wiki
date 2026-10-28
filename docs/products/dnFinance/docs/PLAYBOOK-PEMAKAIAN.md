# dnFinance — Playbook Pemakaian & Runbook Operasional

> **Status:** Active · **Last updated:** 2026-10-28 · **Author:** Dozer
> **Repo app:** `dnFinance/` (HEAD `0423933`, `main`) · **Prod:** https://finance.dntech.id · API https://api.finance.dntech.id/api/v1

## Ringkasan

Satu dokumen pegangan untuk tim DN Tech (onboarding pelanggan, CS, operasional) dan pengguna kunci di sisi pelanggan. Isinya: cara pelanggan mulai memakai dnFinance, alur kerja harian per modul, langganan & tagihan, tugas admin DN Tech di Konsol Provider, serta runbook deploy & troubleshooting. Detail teknis deploy ada di [DEPLOY-VPS.md](./DEPLOY-VPS.md); status fitur per modul di [FITUR-PER-MODUL.md](./FITUR-PER-MODUL.md).

---

## 1. Info produk

| Item | Nilai |
|------|-------|
| Produk | dnFinance (nama repo/package: `dnfinance`) — akuntansi cloud multi-perusahaan untuk semua jenis dan skala bisnis di Indonesia |
| Pemilik | PT. Dozer Napitupulu Technology (DN Tech) · kontak `info@dntech.id` |
| Web | `https://finance.dntech.id` (beranda publik `/home`, login `/login`, daftar `/register`) |
| API | `https://api.finance.dntech.id/api/v1` · Swagger lokal `http://localhost:3000/api/docs` |
| Stack | NestJS 11 (API) · React 19 + Vite + Tailwind (web) · `shared/` (tipe, COA, pajak) |
| Penyimpanan | File JSON di `DNF_STORE_DIR` (default `.data/`); PostgreSQL opsional via `DATABASE_URL` |
| Pembayaran | DOKU Checkout (non-SNAP); VA tetap DOKU opsional (`DOKU_VA_BANK`) |
| Tes | 473 tes dalam 41 suite (`npm run test`, dicek 2026-10-28) |
| Akun demo | `demo@dnaccounting.id` / `demo123456` (lihat [DEMO-ACCOUNTS.md](./DEMO-ACCOUNTS.md)) |

---

## 2. Peran & hak akses

Setiap pengguna punya satu peran per data usaha. Menu yang tidak diizinkan tidak muncul di sidebar.

| Peran | Bisa apa | Contoh menu khusus |
|-------|----------|--------------------|
| **admin** | Semua, termasuk pengaturan, pengguna, langganan & tagihan | Pengaturan Usaha, Peran & Hak Akses, Pengguna, Format Nomor, Template Cetak |
| **accountant** | Transaksi + pembukuan + pajak | Jurnal Memorial, SPT Masa PPN, SPT PPh 21, Impor Data |
| **manager** | Transaksi operasional & pemantauan | Kas & Bank, Pembelian, Anggaran, Riwayat Aktivitas |
| **viewer** | Lihat dashboard, penjualan, persediaan, laporan | — |

- Hak akses bisa dipersempit lagi per grup di **Pengaturan › Peran & Hak Akses**.
- **2FA**: tiap akun bisa mengaktifkan di **Pengaturan › Keamanan (2FA)**. Admin bisa mewajibkan 2FA per data usaha (ikon perisai di kartu Data Usaha); anggota tanpa 2FA tidak bisa membuka data usaha itu.

---

## 3. Alur pelanggan baru (onboarding)

```
/home → Daftar → Pilih Paket → (trial 14 hari) → Data Usaha → Buka data usaha → Dashboard
```

1. **Beranda `/home`** — pengunjung tanpa login yang membuka `/` diarahkan ke sini. Tombol "Coba gratis 14 hari" → `/register`.
2. **Daftar** — isi email, password (min. 8 karakter), nama perusahaan, bidang usaha. Bagan akun (COA) dibuat otomatis sesuai industri (`retail`, `fnb`, `jasa`, `trading`, `manufac_kecil`).
3. **Pilih Paket (`/pilih-paket/:id`)** — wajib. Selama paket belum dipilih, data usaha **tidak bisa dibuka** (dicek juga di API). Memilih paket memulai trial 14 hari dan langsung membuka data usaha.
4. **Data Usaha (`/data-usaha`)** — halaman pertama setelah login. Satu akun bisa punya banyak data usaha; tombol **Tambah Data Usaha** membuat perusahaan baru (juga wajib pilih paket + trial 14 hari).
5. **Setelah trial** — faktur bulan pertama terbit dan dibayar dari saldo. Saldo kurang → data usaha **terkunci** (kartu bertanda "Masa aktif habis") sampai saldo diisi.

**Checklist onboarding pelanggan (CS):**

- [ ] Pelanggan sudah pilih paket (kartu tidak bertanda "Belum pilih paket")
- [ ] Isi **Data penagihan** (NPWP/NITKU, alamat, kontak) di Langganan › Data penagihan
- [ ] Cek **Daftar Akun**: saldo awal akun kas/bank, piutang, utang, persediaan
- [ ] Tambah pengguna di **Pengaturan › Pengguna**; batas pengguna = jatah paket + slot tambahan
- [ ] Atur **Format Nomor** dokumen dan **Tarif Pajak** (PPN 11%) bila perlu
- [ ] Ingatkan isi saldo sebelum trial berakhir

---

## 4. Peta menu

| Modul | Menu (urut sidebar) |
|-------|---------------------|
| **Usaha** | Tarif Pajak · Termin Bayar · Jasa Kirim · Titik Serah (FOB) · Komponen Gaji · Data Karyawan · Transaksi Rutin · Tutup Buku Bulanan · Buku Kontak · Template Transaksi · Agenda · Riwayat Aktivitas |
| **Akuntansi** | Daftar Akun · Catat Biaya · Penggajian · Jurnal Memorial · Pantau/Alih/Rencana Anggaran · Mutasi Akun · Riwayat Jurnal |
| **Kas & Bank** | Kas Keluar · Kas Masuk · Pindah Dana · Koneksi Bank · Mutasi Rekening · Buku Bank · Cocokkan Bank · Virtual Account · Pembayaran Online |
| **Penjualan** | Penawaran Harga · Order Penjualan · Surat Jalan · DP Penjualan · Invoice Penjualan · Pelunasan Piutang · Retur Penjualan · Grup Pelanggan · Level Harga · Pelanggan · Atur Harga & Diskon · Komisi Sales · Target Sales · Toko Online · Kunjungan Sales |
| **Pembelian** | Order Pembelian · Terima Barang · DP Pembelian · Tagihan Pemasok · Pelunasan Utang · Retur Pembelian · Daftar Harga Pemasok · Grup Pemasok · Pemasok · Jadwal Bayar · Bayar Massal Pemasok |
| **Persediaan** | Permintaan Pembelian · Mutasi Gudang · Koreksi Stok · Perintah Produksi · Pemakaian Bahan · Hasil Produksi · Jadwal/Hasil Stok Opname · Produk & Jasa · Lokasi Gudang · Satuan · Kategori Produk · Merek · Sisa Order · Stok per Gudang · Stok Menipis |
| **Aset Tetap** | Daftar Aset · Kelompok Aset · Kelompok Aset Fiskal · Revaluasi · Pelepasan · Mutasi Aset · Aset per Lokasi |
| **Pajak Digital** | *Segera hadir* (e-Faktur Coretax, Kirim Faktur Pajak, e-Faktur Lama) |
| **Laporan** | Semua Laporan · SPT Masa PPN · Insight Otomatis · SPT PPh 21 · Bukti Potong PPh 21 |
| **Pengaturan** | Pengaturan Usaha · Peran & Hak Akses · Pengguna · Format Nomor · Template Cetak · Toko Aplikasi · Program Modal · Impor Data · Keamanan (2FA) · Laporan Keuangan |

Di HP: menu ada di tombol ☰ (kiri atas); bar bawah berisi pintasan Beranda · Kas masuk · Penjualan · Laporan.

---

## 5. Playbook harian

Pola layar modul sama di semua menu: tab **Daftar** (list + cari + filter) → tombol **+** membuka tab **Data Baru** → isi → **Simpan** (panel kanan di desktop, bar lengket di bawah di HP). Kolom **Cari/Pilih** (akun, pelanggan, barang, gudang) bisa diketik **atau** dibuka lewat tombol **▾** untuk memilih dari daftar lengkap; daftar akun dikelompokkan per tipe akun.

### 5.1 Penjualan (piutang)

| Langkah | Menu | Hasil di pembukuan |
|---------|------|--------------------|
| 1. Penawaran (opsional) | Penjualan › Penawaran Harga | — |
| 2. Order | Penjualan › Order Penjualan | — |
| 3. Kirim barang | Penjualan › Surat Jalan | Stok berkurang |
| 4. Tagih | Penjualan › Invoice Penjualan | Jurnal piutang + pendapatan + PPN keluaran otomatis |
| 5. Terima bayar | Penjualan › Pelunasan Piutang | Jurnal kas/bank vs piutang |

Uang muka pelanggan: **DP Penjualan** sebelum invoice. Barang kembali: **Retur Penjualan**. Dokumen sumber bisa dilanjutkan ke dokumen berikutnya dari tombol di layar sumber (mis. Order → Surat Jalan).

### 5.2 Pembelian (utang)

Order Pembelian → Terima Barang (stok bertambah) → Tagihan Pemasok (jurnal utang + PPN masukan; bisa butuh persetujuan) → Pelunasan Utang. Banyak tagihan sekaligus: **Bayar Massal Pemasok**; penjadwalan: **Jadwal Bayar**.

### 5.3 Kas & bank

- Uang masuk/keluar di luar penjualan/pembelian: **Kas Masuk / Kas Keluar**.
- Pindah antar rekening: **Pindah Dana**.
- Rekonsiliasi: impor **Mutasi Rekening** → **Cocokkan Bank** → cek **Buku Bank**.

### 5.4 Persediaan

- Master barang: **Produk & Jasa** (satuan, paket/BOM, nomor seri, stok minimum).
- Pindah gudang: **Mutasi Gudang**. Koreksi selisih: **Koreksi Stok**.
- Stok opname: **Jadwal Stok Opname** → hitung fisik → **Hasil Hitung Stok** (selisih dijurnal ke akun selisih stok di Pengaturan Usaha).
- Produksi: Perintah Produksi → Pemakaian Bahan → Hasil Produksi.

### 5.5 Jurnal Memorial (koreksi manual)

Dipakai hanya untuk penyesuaian yang tidak punya dokumen sumber (koreksi, akrual, reklasifikasi). Transaksi biasa **jangan** dicatat di sini — pakai Invoice/Tagihan/Kas agar dokumen & laporan pendukung ikut terbentuk.

1. Akuntansi › Jurnal Memorial › **+**.
2. Di **Rincian Jurnal**, tekan **▾** pada kolom akun → pilih akun → isi Debit atau Kredit.
3. Pastikan **Total Debit = Total Credit** sebelum Simpan.

### 5.6 Akhir bulan

1. Cocokkan bank (5.3) dan stok (5.4).
2. Catat beban akrual: Akuntansi › Catat Biaya. Penyusutan aset diposting otomatis tiap tanggal 1 pukul 01.00 WIB untuk semua aset aktif di Daftar Aset.
3. Pajak: Laporan › **SPT Masa PPN**; gaji: **SPT PPh 21** + **Bukti Potong PPh 21**.
4. Laporan: Laporan › Semua Laporan (neraca, laba rugi, arus kas, buku besar, umur piutang/utang).
5. Usaha › **Tutup Buku Bulanan** untuk menandai periode selesai. Catatan: penguncian masih *lunak* — API belum menolak posting ke periode yang sudah ditutup, jadi sepakati di tim agar tidak mencatat transaksi mundur.

---

## 6. Langganan & Tagihan (pelanggan)

Akses: menu profil di **Data Usaha › Langganan & Tagihan** (`/langganan`), atau ⋮ di kartu data usaha › **Tagihan**. Saldo, paket, dan faktur terpisah per data usaha.

| Item | Nilai (sumber: `apps/backend/src/billing/billing.types.ts`) |
|------|------------------|
| Paket Starter | Rp229.000/bulan, termasuk 1 pengguna |
| Paket Growth | Rp319.000/bulan, termasuk 3 pengguna |
| Tambahan pengguna | Rp22.000/pengguna/bulan |
| Harga | Sudah termasuk PPN 11% |
| Isi saldo | Rp50.000 – Rp50.000.000 per transaksi, via DOKU |
| Penagihan | Otomatis tiap hari 01.00 WIB untuk periode yang mulai; dibayar dari saldo |

**Tab di halaman langganan:** Ringkasan · Tagihan berikutnya · Paket · Pengguna & cabang · Faktur · Mutasi saldo · Riwayat isi saldo · Volume data · Data penagihan · Log aktivitas.

| Tugas | Cara |
|-------|------|
| Isi saldo | Ringkasan › **Isi saldo** → pilih nominal → bayar di halaman DOKU → kembali otomatis; status dicek ke DOKU (`TRXDNFINANCE-…`). Bila belum masuk: Riwayat isi saldo › **Cek status** |
| Transfer VA tetap | Ringkasan › **Buat nomor** (hanya jika `DOKU_VA_BANK` diisi) → transfer kapan saja, saldo bertambah otomatis |
| Pakai voucher | Ringkasan › **Pakai voucher** → kode → nilai masuk saldo |
| Kode prepaid | Pengguna & cabang › **Aktivasi kode** → masa aktif bertambah tanpa memotong saldo |
| Ganti paket | Paket → pilih → Simpan; berlaku mulai periode berikutnya |
| Tambah slot pengguna | Pengguna & cabang → ± slot → Simpan; langsung bisa dipakai, ditagih periode berikutnya |
| Unduh faktur | Faktur › **Lihat / PDF** → Cetak / Simpan PDF |

Hanya **admin** data usaha yang bisa mengubah paket, slot, data penagihan, isi saldo, dan memakai kode.

---

## 7. Konsol Provider `/admin` (tim DN Tech)

Akses: login dengan email yang tercantum di env `PLATFORM_ADMIN_EMAILS` (pisah koma) → buka `/admin`. Email lain mendapat "Akses ditolak". Semua aksi tercatat di audit sebagai `platform:<email>`.

| Tab | Untuk apa |
|-----|-----------|
| Ringkasan | Jumlah data usaha, langganan habis/akan habis 14 hari, saldo tertahan, isi saldo bulan ini, faktur belum lunas, status DOKU; tombol jalankan penagihan sekarang |
| Pelanggan | Cari data usaha → panel detail |
| Deposit DOKU | Semua transaksi isi saldo; **Cek status** untuk yang menunggu/perlu dicek |
| Faktur | Semua faktur langganan |
| Voucher & Prepaid | Buat voucher saldo / kode prepaid (nominal atau bulan, paket, kuota, khusus email, kedaluwarsa) |

**Panel detail pelanggan:**

| Kasus | Aksi |
|-------|------|
| Pelanggan transfer manual ke rekening DN Tech | **Sesuaikan saldo** (+nominal, catatan wajib) → faktur belum lunas otomatis terbayar |
| Koreksi / refund | Sesuaikan saldo dengan nilai negatif (saldo tidak boleh minus) |
| Perpanjang trial / goodwill | **Atur masa aktif** (tanpa faktur) |
| Pelanggan ingin bayar periode berikutnya lebih awal | **Terbitkan faktur sekarang** (penagihan harian tidak menagih ulang periode yang sama) |

---

## 8. Runbook operasional

### 8.1 Variabel lingkungan penting

| Variabel | Fungsi |
|----------|--------|
| `JWT_SECRET` | Wajib diganti dari default dev |
| `FRONTEND_URL` | Origin CORS & URL kembali dari DOKU (mis. `https://finance.dntech.id`) |
| `API_PUBLIC_URL` / `DOKU_NOTIFICATION_URL` | URL webhook DOKU (default `{API_PUBLIC_URL}/api/v1/webhooks/doku`) |
| `DOKU_CLIENT_ID` / `DOKU_SECRET_KEY` | Tanpa ini tombol Isi saldo nonaktif |
| `DOKU_IS_PRODUCTION` | `true` = API produksi DOKU (default sandbox) |
| `DOKU_VA_BANK` / `DOKU_VA_EXPIRED_MINUTES` | VA tetap (opsional) |
| `PLATFORM_ADMIN_EMAILS` | Akses `/admin` |
| `DNF_STORE_DIR` | Folder data JSON (backup folder ini!) |
| `apps/frontend/.env.production` → `VITE_API_URL` | URL API untuk build frontend |

Daftar lengkap: README repo app bagian Konfigurasi.

### 8.2 Deploy

Mekanisme di repo (`deploy/`): hook git di VPS menjalankan `deploy/scripts/vps-deploy.sh` setelah `git pull`:

`npm ci` (hanya jika `package*.json` berubah) → `npm run build` → rsync frontend ke `WEB_ROOT` (default `/var/www/dnfinance`) → `pm2 restart` (`PM2_NAME`, default `dnfinance`) → health check `/api/v1/health`. Build gagal = tidak ada yang dipublikasikan.

```bash
deploy/scripts/vps-deploy.sh --force   # deploy walau tidak ada perubahan relevan
SKIP_DEPLOY=1 git pull                 # pull tanpa deploy
DRY_RUN=1 deploy/scripts/vps-deploy.sh # tampilkan langkah saja
```

Setup awal Nginx/PM2/TLS: [DEPLOY-VPS.md](./DEPLOY-VPS.md) (catatan: dokumen itu masih menulis dua proses PM2 `finance-api`/`finance-web`; skrip deploy memakai satu nama `dnfinance` — samakan dengan kondisi server).

### 8.3 Sebelum push ke `main`

```bash
npm run typecheck
npm run test
npm run build
```

### 8.4 Cek kesehatan

```bash
curl -s https://api.finance.dntech.id/api/v1/health
pm2 list
pm2 logs dnfinance --lines 100
tail -n 100 ~/dnfinance-deploy.log
```

### 8.5 Rollback

Pada VPS: `git log --oneline -5` → `git checkout <commit-baik>` → `deploy/scripts/vps-deploy.sh --force` → verifikasi health. Kembali ke `main` setelah perbaikan di-push. Data JSON tidak ikut rollback — backup `DNF_STORE_DIR` sebelum deploy besar.

### 8.6 Troubleshooting

| Gejala | Penyebab umum | Tindakan |
|--------|---------------|----------|
| Buka situs langsung ke `/login` | Versi lama di server, atau token login lama di browser | Buka `/home` langsung; bila masih ke login → deploy ulang. Bila tampil → logout / hapus data situs (perbaikan sudah di `7a47770`) |
| Tampilan di HP kecil seperti desktop | Chrome mode **Situs desktop** | Chrome ⋮ → hilangkan centang "Situs desktop" |
| Tombol Isi saldo nonaktif | DOKU belum dikonfigurasi | Isi `DOKU_CLIENT_ID`, `DOKU_SECRET_KEY`, restart |
| Isi saldo sukses di DOKU tapi saldo belum bertambah | Webhook belum sampai / URL webhook salah | Riwayat isi saldo › Cek status (atau `/admin` › Deposit DOKU); periksa `DOKU_NOTIFICATION_URL` |
| Data usaha tidak bisa dibuka: "Pilih paket langganan dulu" | Paket belum dipilih | Admin pelanggan buka `/pilih-paket/:id` |
| "Masa aktif … sudah habis" | Faktur belum terbayar | Pelanggan isi saldo, atau DN Tech sesuaikan saldo / atur masa aktif di `/admin` |
| Tidak bisa tambah pengguna | Batas paket tercapai | Tambah slot di Langganan › Pengguna & cabang, atau naik ke Growth |
| Anggota tidak bisa buka data usaha ber-2FA | Akun belum aktifkan 2FA | Pengaturan › Keamanan (2FA) |
| API crash `relation "app_snapshots" does not exist` | Postgres produksi tanpa tabel | Lihat [DEPLOY-VPS.md](./DEPLOY-VPS.md) › Known gotcha |
| `/admin` "Akses ditolak" | Email tidak ada di `PLATFORM_ADMIN_EMAILS` | Tambah email, restart API |

---

## 9. Keterbatasan yang diketahui

- DOKU Checkout dan VA tetap **belum diuji di sandbox**; bentuk request VA belum diverifikasi ke dokumentasi resmi DOKU.
- Gerbang "pilih paket" dan "masa aktif habis" dicek saat **membuka** data usaha, belum di setiap request API.
- Riwayat aktivitas langganan bergantung pada log audit yang hanya menyimpan 500 entri terakhir (lintas data usaha).
- Pajak Digital (e-Faktur Coretax) masih *segera hadir*; unduh e-Faktur di faktur langganan belum tersedia.
- Volume data hanya menghitung transaksi berjurnal; lampiran belum dihitung. Tidak ada biaya penggunaan data.
- Tutup Buku Bulanan belum memblokir posting ke periode tertutup (soft lock, lihat komentar di `apps/backend/src/company/company.service.ts`).

---

## 10. Dokumen terkait

| Topik | Dokumen |
|-------|---------|
| Fitur & status per modul | [FITUR-PER-MODUL.md](./FITUR-PER-MODUL.md) · [FITUR-LENGKAP.md](./FITUR-LENGKAP.md) |
| Harga & model billing | [Rancangan_Harga_dan_Paket_dnFinance.md](./Rancangan_Harga_dan_Paket_dnFinance.md) |
| Panduan demo | [USER-GUIDE.md](./USER-GUIDE.md) · [../DEMO.md](../DEMO.md) · [DEMO-ACCOUNTS.md](./DEMO-ACCOUNTS.md) |
| Deploy | [DEPLOY-VPS.md](./DEPLOY-VPS.md) · [DEPLOY.md](./DEPLOY.md) |
| Arsitektur & API | [ARCHITECTURE.md](./ARCHITECTURE.md) · [API.md](./API.md) |
| UAT | [TEST-CASES.md](./TEST-CASES.md) |
| Riwayat rilis | [CHANGELOG.md](./CHANGELOG.md) |

# FINANCE MODULE - STANDAR AKUNTANSI INDONESIA
## dnPeople Finance untuk SAK-EP & SAK Compliance

**Version:** 1.1 Indonesia Edition (aligned with codebase)  
**Date:** June 2026 · **Implementation sync:** 3 Juli 2026  
**Standar:** SAK-EP (Entitas Pengguna SAK-EP) & SAK (Perusahaan Besar)  
**Target:** UMKM hingga Perusahaan Besar di Indonesia

> ### ✅ Status Implementasi (Jul 2026 — ~90% core)
> | Area | Status | Path / API |
> |------|--------|------------|
> | CoA SAK-EP seed | ✅ | `POST /finance/chart-of-accounts/seed-indonesia` |
> | Journal entries | ✅ | `POST /finance/gl/journal-entries` |
> | COA CRUD | ✅ | `POST /finance/gl/accounts` |
> | Balance sheet / P&L SAK-EP | ✅ | `GET /finance/statements/balance-sheet?format=SAK-EP` |
> | PPN calculate | ✅ | `POST /finance/tax/ppn/calculate` |
> | e-Faktur keluaran + NPWP | ✅ | `POST /finance/efaktur`, `POST /finance/efaktur/validate-npwp` |
> | AP payment file (BCA/SEPA) | ✅ | `POST /finance/ap/payment-file` |
> | AR credit memo | ✅ | `POST /finance/ar/credit-memos` |
> | AP debit memo | ✅ | `POST /finance/ap/debit-memos` |
> | Domestic sale + PPN journal | ✅ | `POST /finance/transactions/domestic-sale` |
> | Frontend UI | ✅ | `/finance/indonesia`, `/finance/journal`, `/finance/ap` |
>
> **Live status:** [`12-PROJECT-STATUS.md`](12-PROJECT-STATUS.md) · **Gaps:** [`17-REMAINING-SRS-GAPS.md`](17-REMAINING-SRS-GAPS.md)  
> **Catatan API:** Semua endpoint menggunakan prefix `/api/v1/`. Path GL: `/finance/gl/*`.

---

## 📋 DAFTAR ISI
1. Overview Finance Module Indonesia
2. Chart of Accounts (CoA) Standar Indonesia
3. Peraturan Akuntansi & Pajak Indonesia
4. Laporan Keuangan SAK-EP/SAK
5. Transaksi Akuntansi Indonesia
6. Pajak Penghasilan (PPh) & PPN
7. Pelaporan ke Otoritas (DJP, OJK, BEI)
8. Implementasi Database
9. API Specifications
10. Contoh Jurnal Akuntansi Indonesia

---

## 1. OVERVIEW FINANCE MODULE INDONESIA

### 1.1 Compliance Requirements

```
SAK-EP (Standar Akuntansi Keuangan - Entitas Pengguna SAK-EP)
├─ Untuk: UMKM, badan usaha non-publik
├─ Laporan yang diwajibkan:
│  ├─ Laporan Posisi Keuangan (Balance Sheet)
│  ├─ Laporan Laba Rugi (Income Statement)
│  ├─ Laporan Arus Kas (Cash Flow Statement)
│  ├─ Catatan atas Laporan Keuangan
│  └─ Laporan Perubahan Ekuitas
├─ Periode: Tahunan (minimal)
└─ Audit: Optional (kecuali ada persyaratan tertentu)

SAK (Standar Akuntansi Keuangan)
├─ Untuk: Perusahaan go-public, BUMN, entitas besar
├─ Laporan yang diwajibkan:
│  ├─ Laporan Keuangan Konsolidasi
│  ├─ Laporan Segmen
│  ├─ Related Party Transactions
│  ├─ Analisis Sensitifitas Kuantitatif
│  └─ Disclosure lengkap
├─ Periode: Interim (3 bulan) & Tahunan
└─ Audit: Mandatory

Peraturan Pajak Indonesia
├─ PPh Pasal 4 (Penghasilan Tertentu)
├─ PPh Pasal 15 (Non-Resident)
├─ PPh Pasal 21 (Penghasilan Karyawan)
├─ PPh Pasal 22 (Impor & Kuasi Pajak)
├─ PPh Pasal 23 (Penghasilan Modal)
├─ PPh Pasal 25/29 (Pajak Penghasilan Badan)
├─ PPh Final Pasal 4(2)
├─ PPN (Pajak Pertambahan Nilai)
├─ PPnBM (Pajak Penjualan Atas Barang Mewah)
├─ Bea Masuk
└─ Cukai
```

### 1.2 Mata Uang & Tanggal

```
Mata Uang Standar: IDR (Indonesian Rupiah)
Periode Akuntansi: 1 Januari - 31 Desember
Laporan Interim: 31 Maret, 30 Juni, 30 September (Optional)
Mata Uang Asing: Support untuk transaksi ekspor-impor
  - USD (Dolar Amerika)
  - EUR (Euro)
  - SGD (Dolar Singapura)
  - MYR (Ringgit Malaysia)
  - Others
Kurs Rujukan: BI Rate (Bank Indonesia)
```

---

## 2. CHART OF ACCOUNTS - STANDAR INDONESIA

### 2.1 Struktur CoA SAK-EP Standar

```
Level Hirarki:
├─ Level 1: Kelompok Besar (1 digit)
│  └─ Level 2: Subkelompok (2 digit)
│     └─ Level 3: Kategori (3 digit)
│        └─ Level 4: Perkiraan Utama (4 digit)
│           └─ Level 5: Perkiraan Detail (5-6 digit)
```

### 2.2 Daftar Lengkap CoA Indonesia

#### **1. AKTIVA (ASSETS)**

```
1. ASET LANCAR (Current Assets)
   100-199: Kas & Setara Kas
   ├─ 1010 Kas (IDR)
   ├─ 1011 Kas Kecil
   ├─ 1012 Kas Mitra Usaha
   ├─ 1020 Bank - Account 1 (IDR)
   ├─ 1021 Bank - Account 2 (IDR)
   ├─ 1030 Bank - USD
   ├─ 1031 Bank - EUR
   ├─ 1040 Deposito Jangka Pendek
   ├─ 1050 Investasi Jangka Pendek
   └─ 1060 Rekening Koran

   110-119: Piutang Usaha
   ├─ 1110 Piutang Usaha - Domestic
   ├─ 1111 Piutang Usaha - Export
   ├─ 1112 Piutang Usaha - Affiliate
   ├─ 1120 Piutang Lainnya
   ├─ 1130 PPN Piutang (Tax Asset)
   └─ 1140 Penyisihan Piutang Ragu (Allowance)

   120-129: Inventaris (Inventory)
   ├─ 1210 Bahan Baku
   ├─ 1211 Bahan Baku - Lokasi 1
   ├─ 1212 Bahan Baku - Lokasi 2
   ├─ 1220 Barang Dalam Proses
   ├─ 1230 Barang Jadi
   ├─ 1240 Barang Dagang
   ├─ 1250 Suku Cadang
   ├─ 1260 Penyisihan Inventaris Usang
   └─ 1270 COGS Inventory Adjustment

   130-139: Biaya Dibayar Dimuka
   ├─ 1310 Asuransi Dibayar Dimuka
   ├─ 1320 Sewa Dibayar Dimuka
   ├─ 1330 Langganan Dibayar Dimuka
   ├─ 1340 PPh Pasal 22 Dibayar Dimuka
   ├─ 1350 PPh Pasal 23 Dibayar Dimuka
   ├─ 1360 PPh Pasal 25 Dibayar Dimuka
   ├─ 1370 PPN Dibayar Dimuka
   └─ 1380 Biaya Lainnya Dibayar Dimuka

   140-149: Aset Pajak Tangguhan
   ├─ 1410 Aset Pajak Tangguhan - PPh
   ├─ 1420 Aset Pajak Tangguhan - PPN
   └─ 1430 Aset Pajak Tangguhan - Lainnya

2. ASET TIDAK LANCAR (Non-Current Assets)

   200-299: Aset Tetap (Fixed Assets)
   ├─ 2010 Tanah (tidak disusutkan)
   ├─ 2011 Tanah Bangun - Jakarta
   ├─ 2012 Tanah Bangun - Surabaya
   ├─ 2020 Bangunan
   ├─ 2021 Bangunan Pabrik
   ├─ 2022 Bangunan Kantor
   ├─ 2023 Akumulasi Penyusutan Bangunan
   ├─ 2030 Mesin & Peralatan
   ├─ 2031 Mesin Produksi
   ├─ 2032 Peralatan Kantor
   ├─ 2033 Akumulasi Penyusutan Mesin
   ├─ 2040 Kendaraan
   ├─ 2041 Kendaraan Operasional
   ├─ 2042 Akumulasi Penyusutan Kendaraan
   ├─ 2050 Furniture & Fixtures
   ├─ 2051 Akumulasi Penyusutan Furniture
   ├─ 2060 Aset Intangible
   ├─ 2070 Goodwill
   └─ 2080 Software & IT Systems
       └─ 2081 Akumulasi Amortisasi Software

   210-219: Investasi Jangka Panjang
   ├─ 2110 Investasi Saham Jangka Panjang
   ├─ 2111 Investasi - PT ABC (20%)
   ├─ 2112 Investasi - PT XYZ (15%)
   ├─ 2120 Investasi Obligasi Jangka Panjang
   ├─ 2130 Penyisihan Penurunan Nilai Investasi
   └─ 2140 Dividen Belum Diterima

   220-229: Piutang Jangka Panjang
   ├─ 2210 Piutang Karyawan - Cicilan Rumah
   ├─ 2211 Piutang Karyawan - Kendaraan
   ├─ 2220 Piutang Pembiayaan Pihak Ketiga
   ├─ 2230 Penyisihan Piutang Jangka Panjang
   └─ 2240 Uang Jaminan (Deposits)

   230-239: Aset Pajak Tangguhan
   ├─ 2310 Aset Pajak Tangguhan - PPh
   ├─ 2320 Aset Pajak Tangguhan - PPN
   └─ 2330 Aset Pajak Tangguhan - Lainnya

   240-249: Aset Lainnya
   ├─ 2410 Aset Divestasi
   ├─ 2420 Aset Operasi Lanjutan
   └─ 2430 Aset Hasil Restrukturisasi
```

#### **2. KEWAJIBAN (LIABILITIES)**

```
3. KEWAJIBAN LANCAR (Current Liabilities)

   300-399: Utang Usaha
   ├─ 3010 Utang Usaha - Domestic
   ├─ 3011 Utang Usaha - PT ABC
   ├─ 3012 Utang Usaha - PT XYZ
   ├─ 3020 Utang Usaha - Import
   ├─ 3030 Utang Affiliate
   ├─ 3040 Utang Lainnya
   └─ 3050 Uang Muka Penjualan

   310-319: Utang Pajak
   ├─ 3110 Utang PPh Pasal 21
   ├─ 3111 Utang PPh Pasal 21 - Januari
   ├─ 3112 Utang PPh Pasal 21 - Februari
   ├─ 3120 Utang PPh Pasal 22
   ├─ 3130 Utang PPh Pasal 23
   ├─ 3140 Utang PPh Pasal 25
   ├─ 3150 Utang PPN
   ├─ 3151 Utang PPN Output
   ├─ 3152 PPN Input (Refund)
   ├─ 3160 Utang PPnBM
   ├─ 3170 Utang Cukai
   ├─ 3180 Utang Bea Masuk
   └─ 3190 Utang Pajak Lainnya

   320-329: Utang Jangka Pendek ke Bank
   ├─ 3210 Kredit Usaha Rakyat (KUR)
   ├─ 3220 Kredit Modal Kerja
   ├─ 3230 Overdraft
   ├─ 3240 Kredit Investasi
   └─ 3250 Wesel Tagih (Bills Payable)

   330-339: Beban Masih Harus Dibayar
   ├─ 3310 Gaji & Bonus Belum Dibayar
   ├─ 3320 Tunjangan Belum Dibayar
   ├─ 3330 Komisi Belum Dibayar
   ├─ 3340 Bunga Belum Dibayar
   ├─ 3350 Biaya Operasional Belum Dibayar
   └─ 3360 Biaya Audit & Konsultasi Belum Dibayar

   340-349: Bagian Utang Jangka Panjang Jatuh Tempo
   ├─ 3410 Bagian Kredit Investasi - Jatuh Tempo
   ├─ 3420 Bagian Obligasi - Jatuh Tempo
   ├─ 3430 Bagian Sewa Pembiayaan - Jatuh Tempo
   └─ 3440 Bagian Utang Konstruksi - Jatuh Tempo

   350-359: Kewajiban Lainnya
   ├─ 3510 Kewajiban Imbalan Jangka Pendek
   ├─ 3520 Kewajiban Garansi Produk
   ├─ 3530 Kewajiban Lingkungan
   └─ 3540 Uang Jaminan Diterima

4. KEWAJIBAN TIDAK LANCAR (Non-Current Liabilities)

   400-499: Utang Jangka Panjang ke Bank
   ├─ 4010 Kredit Investasi
   ├─ 4020 Kredit Hipotik
   ├─ 4030 Sewa Pembiayaan (Finance Lease)
   ├─ 4040 Obligasi
   ├─ 4050 Wesel Jangka Panjang
   └─ 4060 Ikatan Pinjam (Bonds)

   410-419: Utang Jangka Panjang Lainnya
   ├─ 4110 Utang Kepada Pemilik Usaha
   ├─ 4120 Utang Kepada Affiliate
   ├─ 4130 Utang Konstruksi
   └─ 4140 Utang Lease Operasi

   420-429: Kewajiban Imbalan Kerja
   ├─ 4210 Kewajiban Pesangon (Severance)
   ├─ 4220 Kewajiban Cuti Tahunan
   ├─ 4230 Kewajiban THR (Tunjangan Hari Raya)
   ├─ 4240 Kewajiban Program Pensiun
   └─ 4250 Aktuaria Kewajiban Pensiun

   430-439: Kewajiban Pajak Tangguhan
   ├─ 4310 Kewajiban Pajak Tangguhan - PPh
   ├─ 4320 Kewajiban Pajak Tangguhan - PPN
   └─ 4330 Kewajiban Pajak Tangguhan - Lainnya

   440-449: Kewajiban Lainnya
   ├─ 4410 Kewajiban Lingkungan
   ├─ 4420 Kewajiban Klaim Hukum
   ├─ 4430 Kewajiban Garansi Produk
   └─ 4440 Kewajiban Restrukturisasi
```

#### **3. EKUITAS (EQUITY)**

```
5. EKUITAS (Equity)

   500-599: Modal Saham
   ├─ 5010 Modal Saham - Disetor
   ├─ 5020 Modal Saham - Belum Disetor
   └─ 5030 Saham Treasuri

   510-519: Agio/Disagio Saham
   ├─ 5110 Agio Saham (Premium)
   └─ 5120 Disagio Saham (Discount)

   520-529: Cadangan
   ├─ 5210 Cadangan Legal (wajib per UU)
   ├─ 5220 Cadangan Umum
   ├─ 5230 Cadangan Ekspansi
   ├─ 5240 Cadangan Penghapusan Aset
   └─ 5250 Cadangan Lainnya

   530-539: Laba Ditahan
   ├─ 5310 Laba Ditahan - Tahun Sebelumnya
   ├─ 5320 Laba Ditahan - Tahun Ini (Saldo Awal)
   ├─ 5330 Dividen Yang Dibayarkan
   ├─ 5340 Dividen Tunai
   ├─ 5350 Dividen Saham
   └─ 5360 Hasil Konversi Laporan Keuangan

   540-549: Selisih Kurs
   ├─ 5410 Selisih Kurs - Aset Asing
   ├─ 5420 Selisih Kurs - Utang Asing
   └─ 5430 Selisih Kurs - Investasi Asing

   550-559: Revaluasi Aset
   ├─ 5510 Revaluasi Tanah
   ├─ 5520 Revaluasi Bangunan
   └─ 5530 Revaluasi Aset Lainnya

   560-569: Penghasilan Komprehensif Lain
   ├─ 5610 Penghasilan Rugi Aktuaria
   ├─ 5620 Penghasilan Rugi Nilai Wajar
   └─ 5630 Penghasilan Rugi Investasi
```

#### **4. PENDAPATAN (INCOME)**

```
6. PENDAPATAN OPERASIONAL (Operating Income)

   600-699: Penjualan Barang/Jasa
   ├─ 6010 Penjualan Produk - Domestic
   ├─ 6011 Penjualan Produk - Retail
   ├─ 6012 Penjualan Produk - Wholesale
   ├─ 6013 Penjualan Produk - OEM
   ├─ 6020 Penjualan Jasa - Konsultasi
   ├─ 6030 Penjualan Ekspor
   ├─ 6031 Penjualan FOB (Free on Board)
   ├─ 6032 Penjualan CIF (Cost Insurance Freight)
   ├─ 6040 Penjualan ke Affiliate
   ├─ 6050 Penjualan Ke Pemerintah (APBN)
   ├─ 6060 Penjualan Ke Pemerintah Daerah (APBD)
   └─ 6070 Potongan Penjualan

   610-619: Biaya Kembali (Sales Return & Allowance)
   ├─ 6110 Retur Penjualan
   ├─ 6120 Diskon Penjualan
   ├─ 6130 Allowance Penjualan
   ├─ 6140 Garansi Penjualan
   └─ 6150 Biaya Pengiriman (jika customer)

   620-629: Pendapatan Sampingan Operasional
   ├─ 6210 Pendapatan Rental Peralatan
   ├─ 6220 Pendapatan Maintenance & Service
   ├─ 6230 Pendapatan Komisi
   ├─ 6240 Pendapatan Bunga Piutang Usaha
   └─ 6250 Pendapatan Operasional Lainnya

7. PENDAPATAN NON-OPERASIONAL (Non-Operating Income)

   700-799: Pendapatan Investasi
   ├─ 7010 Bunga Deposito
   ├─ 7020 Bunga Bank
   ├─ 7030 Dividen Investasi
   ├─ 7040 Keuntungan Penjualan Investasi
   ├─ 7050 Keuntungan Selisih Kurs
   └─ 7060 Keuntungan Revaluasi Investasi

   710-719: Pendapatan Lainnya
   ├─ 7110 Keuntungan Penjualan Aset Tetap
   ├─ 7120 Keuntungan Imbalan Konstruksi
   ├─ 7130 Subsidi Pemerintah
   ├─ 7140 Kompensasi Asuransi
   ├─ 7150 Pendapatan Lain-lain
   └─ 7160 Koreksi Pajak Tahun Lalu (+)
```

#### **5. BEBAN (EXPENSES)**

```
8. HARGA POKOK PENJUALAN (Cost of Goods Sold)

   800-899: HPP Barang Dagang/Produksi
   ├─ 8010 Bahan Baku Dipakai
   ├─ 8020 Tenaga Kerja Langsung
   ├─ 8030 Overhead Pabrik Variabel
   ├─ 8040 Overhead Pabrik Tetap
   ├─ 8050 Penyusutan Mesin Produksi
   ├─ 8060 Asuransi Pabrik
   ├─ 8070 Utilitas Pabrik (Listrik, Air, Gas)
   ├─ 8080 Perubahan Barang Dalam Proses
   ├─ 8090 Perubahan Barang Jadi
   └─ 8099 Koreksi HPP

9. BIAYA OPERASIONAL (Operating Expenses)

   900-999: Biaya Penjualan (Selling Expenses)
   ├─ 9010 Gaji Tenaga Penjual
   ├─ 9020 Komisi Penjualan
   ├─ 9030 Bonus Penjualan
   ├─ 9040 Biaya Perjalanan Penjualan
   ├─ 9050 Biaya Pemasaran & Iklan
   ├─ 9060 Biaya Promosi
   ├─ 9070 Biaya Pameran & Event
   ├─ 9080 Biaya Produksi Katalog
   ├─ 9090 Biaya Packaging & Labeling
   ├─ 9100 Biaya Pengiriman Barang Terjual
   ├─ 9110 Biaya Asuransi Pengiriman
   ├─ 9120 Biaya Warehouseing
   ├─ 9130 Biaya Penyisihan Piutang Ragu
   ├─ 9140 Penyusutan Kendaraan Penjualan
   └─ 9150 Biaya Penjualan Lainnya

   910-919: Biaya Administrasi & Umum (General & Administrative)
   ├─ 9210 Gaji Karyawan Adminstrasi
   ├─ 9220 Gaji Manajemen
   ├─ 9230 Tunjangan Karyawan
   ├─ 9240 Bonus Karyawan (tidak tied to sales)
   ├─ 9250 Biaya THR (Tunjangan Hari Raya)
   ├─ 9260 Biaya Pesangon Karyawan
   ├─ 9270 Biaya Asuransi Kesehatan Karyawan
   ├─ 9280 Biaya Program Kesejahteraan Karyawan
   ├─ 9290 Biaya Pelatihan Karyawan
   ├─ 9300 Biaya Rekrutmen
   ├─ 9310 Penyusutan Furniture Kantor
   ├─ 9320 Biaya Pemeliharaan Gedung Kantor
   ├─ 9330 Biaya Listrik Kantor
   ├─ 9340 Biaya Air & Gas Kantor
   ├─ 9350 Biaya Telepon & Internet
   ├─ 9360 Biaya Sewa Kantor
   ├─ 9370 Biaya Asuransi Kantor
   ├─ 9380 Biaya Kantor Pusat
   ├─ 9390 Biaya Audit & Konsultasi
   ├─ 9400 Biaya Hukum
   ├─ 9410 Biaya Perijinan & Perpanjangan
   ├─ 9420 Biaya Asuransi Umum
   ├─ 9430 Biaya Donasi & CSR
   ├─ 9440 Biaya Keselamatan & Kesehatan Kerja (K3)
   ├─ 9450 Biaya Lingkungan
   ├─ 9460 Biaya Administrasi Bank
   ├─ 9470 Biaya Bunga Kredit Jangka Pendek
   └─ 9480 Biaya Umum Lainnya

10. BEBAN NON-OPERASIONAL (Non-Operating Expenses)

   920-999: Beban Non-Operasional
   ├─ 9510 Beban Bunga Kredit Jangka Panjang
   ├─ 9520 Beban Bunga Obligasi
   ├─ 9530 Kerugian Penjualan Investasi
   ├─ 9540 Kerugian Selisih Kurs
   ├─ 9550 Kerugian Revaluasi Aset
   ├─ 9560 Kerugian Penjualan Aset Tetap
   ├─ 9570 Kerugian Klaim Hukum
   ├─ 9580 Kerugian Bencana Alam
   ├─ 9590 Koreksi Pajak Tahun Lalu (-)
   └─ 9600 Beban Lain-lain

11. PAJAK (Taxes)

   950-959: Pajak Penghasilan
   ├─ 9510 Beban Pajak Penghasilan Badan (PPh)
   ├─ 9520 Pajak Penghasilan Ditangguhkan
   ├─ 9530 Aset Pajak Tangguhan Reversed
   └─ 9540 Koreksi Pajak Tahun Lalu
```

---

## 3. PERATURAN AKUNTANSI & PAJAK INDONESIA

### 3.1 Prinsip Dasar SAK-EP

| Prinsip | Penjelasan | Implementasi |
|---------|-----------|---------------|
| **Akrual** | Pengakuan saat terjadi, bukan saat kas | Revenue when earned, Expense when incurred |
| **Going Concern** | Asumsi usaha berjalan terus | Jangan gunakan nilai likuidasi |
| **Konsistensi** | Metode akuntansi konsisten setiap periode | Jelaskan jika ada perubahan metode |
| **Konservatisme** | Antisipasi kerugian potensial | Buat allowance untuk piutang ragu |
| **Materialitas** | Fokus pada transaksi signifikan | Sesuaikan threshold setiap periode |
| **Matching Principle** | Beban dicocokkan dengan pendapatan | HPP dicocokkan dengan Penjualan |

### 3.2 Pengakuan Pendapatan (Revenue Recognition)

```
Pada saat apa mengakui pendapatan?

Penjualan Barang:
├─ Domestic Penjualan: Saat barang dikirim
├─ Penjualan dengan Jaminan: Saat jaminan berakhir
├─ Penjualan Cicilan: Saat kas diterima (metode cicilan)
│  atau Saat penjualan terjadi (metode akrual)
├─ Penjualan FOB Shipping Point: 
│  Saat barang dikirim dari warehouse penjual
├─ Penjualan CIF: 
│  Saat barang diterima di tujuan pembeli
└─ Penjualan Ekspor: 
   Sesuai incoterms (FOB, CIF, DDP, dll)

Penjualan Jasa:
├─ Jasa Tertentu (short-term): Saat jasa selesai
├─ Jasa Berkelanjutan (long-term): 
│  Proporsional dengan periode layanan
├─ Jasa Konstruksi: 
│  Sesuai metode persentase penyelesaian
└─ Jasa Berulang (Subscription): 
   Setiap bulan/periode sesuai kontrak

Contoh Jurnal:
Dr. Accounts Receivable    IDR 10,000,000
    Cr. Sales Revenue      IDR 10,000,000
(Mencatat penjualan barang ke PT ABC)

Dr. Sales Revenue          IDR 2,000,000
Dr. Allowance for Returns  IDR 100,000
    Cr. Accounts Receivable    IDR 2,100,000
(Retur penjualan 2% dari penjualan)
```

### 3.3 Pengakuan Beban (Expense Recognition)

```
Metode Matching Beban dengan Pendapatan:

HPP (Cost of Goods Sold):
├─ Harus dicocokkan dengan penjualan periode yang sama
├─ Menggunakan Perpetual atau Periodic Inventory
├─ Metode Valuasi: FIFO, LIFO, Average Cost, Specific ID
└─ Yang paling umum di Indonesia: FIFO dan Average Cost

Depresiasi Aset Tetap:
├─ Metode Garis Lurus (Straight Line) - paling umum
│  Formula: (Nilai Perolehan - Nilai Sisa) / Umur Manfaat
├─ Metode Unit Produksi (Production)
├─ Metode Saldo Menurun Ganda (Double Declining)
└─ Contoh:
   Mesin Rp 100 juta, umur 10 tahun, nilai sisa Rp 10 juta
   Depresiasi = (100-10) / 10 = Rp 9 juta/tahun

Penyisihan Piutang Ragu:
├─ Metode Persentase Penjualan: 
   Penyisihan = Penjualan Kredit × Persentase
├─ Metode Umur Piutang:
   Umur 0-30 hari: 1%
   Umur 31-60 hari: 5%
   Umur 61-90 hari: 20%
   Umur >90 hari: 50-100%
└─ Jurnal:
   Dr. Bad Debt Expense        IDR 500,000
       Cr. Allowance for DR    IDR 500,000
```

### 3.4 Penyesuaian pada Akhir Periode (Adjusting Entries)

```
Jurnal Penyesuaian Wajib pada 31 Desember:

1. Depresiasi Aset Tetap
   Dr. Depreciation Expense        IDR 750,000
       Cr. Accumulated Depreciation     IDR 750,000

2. Amortisasi Aset Intangible
   Dr. Amortization Expense        IDR 100,000
       Cr. Accumulated Amortization    IDR 100,000

3. Penyisihan Piutang Ragu
   Dr. Bad Debt Expense            IDR 2,000,000
       Cr. Allowance for DR            IDR 2,000,000

4. Beban Masih Harus Dibayar
   Dr. Gaji Expense                IDR 3,000,000
       Cr. Gaji Payable                IDR 3,000,000

5. Pendapatan Diterima Dimuka (Deferred Income)
   Dr. Deferred Revenue            IDR 1,200,000
       Cr. Service Revenue             IDR 1,200,000

6. Biaya Dibayar Dimuka
   Dr. Insurance Expense           IDR 500,000
       Cr. Prepaid Insurance           IDR 500,000

7. Penyesuaian Inventaris
   Dr. COGS                        IDR 5,000,000
       Cr. Inventory                  IDR 5,000,000

8. Provisi Kewajiban Imbalan Kerja (Accrual)
   Dr. Employee Benefit Expense    IDR 10,000,000
       Cr. Accrued Employee Benefits  IDR 10,000,000

9. Aset/Kewajiban Pajak Tangguhan
   Dr. Deferred Tax Asset          IDR 1,500,000
       Cr. Tax Benefit                 IDR 1,500,000

10. Revaluasi Aset (jika ada)
    Dr. Building                   IDR 50,000,000
        Cr. Revaluation Reserve        IDR 50,000,000
```

---

## 4. LAPORAN KEUANGAN SAK-EP/SAK

### 4.1 Laporan Posisi Keuangan (Balance Sheet)

```
PT ABC Indonesia
LAPORAN POSISI KEUANGAN (NERACA)
Per 31 Desember 2024
(Angka dalam Rupiah)

ASET
ASET LANCAR
  Kas dan Setara Kas              IDR 2,500,000,000
  Piutang Usaha, neto             IDR 5,250,000,000
  Inventaris                      IDR 8,750,000,000
  Pajak Input Piutang             IDR 750,000,000
  Biaya Dibayar Dimuka            IDR 500,000,000
  ────────────────────────────────────────────
  Total Aset Lancar               IDR 18,250,000,000

ASET TIDAK LANCAR
  Properti, Pabrik & Peralatan:
    Tanah                         IDR 15,000,000,000
    Bangunan              IDR 20,000,000,000
    Akumulasi Penyusutan (IDR 4,000,000,000)  IDR 16,000,000,000
    Mesin                 IDR 40,000,000,000
    Akumulasi Penyusutan (IDR 20,000,000,000) IDR 20,000,000,000
    Kendaraan             IDR 5,000,000,000
    Akumulasi Penyusutan (IDR 2,500,000,000) IDR 2,500,000,000
                                  ────────────
  Properti, Pabrik & Peralatan, neto  IDR 53,500,000,000

  Aset Intangible, neto           IDR 2,000,000,000
  Investasi Jangka Panjang        IDR 5,000,000,000
  Aset Pajak Tangguhan            IDR 1,500,000,000
  Goodwill                        IDR 3,500,000,000
  ────────────────────────────────────────────
  Total Aset Tidak Lancar         IDR 65,500,000,000
                                  ────────────────
TOTAL ASET                        IDR 83,750,000,000


KEWAJIBAN DAN EKUITAS

KEWAJIBAN LANCAR
  Utang Usaha                     IDR 4,200,000,000
  Utang Pajak Penghasilan         IDR 2,000,000,000
  Utang PPN                       IDR 600,000,000
  Kredit Bank Jangka Pendek       IDR 5,000,000,000
  Beban Masih Harus Dibayar       IDR 2,000,000,000
  Bagian Utang Jangka Panjang     IDR 1,500,000,000
  ────────────────────────────────────────────
  Total Kewajiban Lancar          IDR 15,300,000,000

KEWAJIBAN TIDAK LANCAR
  Kredit Investasi Jangka Panjang IDR 15,000,000,000
  Obligasi                        IDR 5,000,000,000
  Kewajiban Imbalan Kerja         IDR 3,000,000,000
  Kewajiban Pajak Tangguhan       IDR 800,000,000
  ────────────────────────────────────────────
  Total Kewajiban Tidak Lancar    IDR 23,800,000,000
                                  ────────────
TOTAL KEWAJIBAN                   IDR 39,100,000,000


EKUITAS
  Modal Saham (100,000 lembar)    IDR 25,000,000,000
  Agio Saham                      IDR 2,500,000,000
  Cadangan Hukum                  IDR 5,000,000,000
  Cadangan Umum                   IDR 3,000,000,000
  Laba Ditahan                    IDR 9,150,000,000
  ────────────────────────────────────────────
TOTAL EKUITAS                     IDR 44,650,000,000
                                  ────────────────
TOTAL KEWAJIBAN DAN EKUITAS       IDR 83,750,000,000
```

### 4.2 Laporan Laba Rugi (Income Statement)

```
PT ABC INDONESIA
LAPORAN LABA RUGI (INCOME STATEMENT)
Untuk Tahun yang Berakhir 31 Desember 2024
(Angka dalam Rupiah)

PENDAPATAN OPERASIONAL
Penjualan Barang                    IDR 125,000,000,000
Retur Penjualan       (IDR 2,500,000,000)
Diskon Penjualan      (IDR 1,500,000,000)
                                    ──────────────────
Penjualan Neto                      IDR 121,000,000,000

Harga Pokok Penjualan:
  Inventaris Awal         IDR 8,500,000,000
  Pembelian Barang       IDR 80,000,000,000
  Inventaris Akhir      (IDR 8,750,000,000)
                                    ──────────────────
HPP                                (IDR 79,750,000,000)
                                    ──────────────────
LABA KOTOR                          IDR 41,250,000,000


BIAYA OPERASIONAL
Biaya Penjualan:
  Gaji & Komisi Penjual   IDR 3,500,000,000
  Biaya Perjalanan Penjualan IDR 1,000,000,000
  Biaya Pemasaran & Iklan  IDR 2,000,000,000
  Penyusutan Kendaraan Penjualan IDR 500,000,000
  Penyisihan Piutang Ragu  IDR 1,200,000,000
                          ──────────────────
Total Biaya Penjualan              (IDR 8,200,000,000)

Biaya Administrasi & Umum:
  Gaji Karyawan Administrasi IDR 4,000,000,000
  Gaji Manajemen            IDR 2,500,000,000
  Tunjangan Karyawan        IDR 2,000,000,000
  Biaya THR & Tunjangan Lain IDR 1,500,000,000
  Penyusitan Aset Tetap     IDR 3,000,000,000
  Biaya Perawatan Kantor    IDR 1,500,000,000
  Biaya Listrik & Air       IDR 800,000,000
  Biaya Telepon & Internet  IDR 400,000,000
  Biaya Sewa Kantor         IDR 1,200,000,000
  Biaya Asuransi            IDR 1,500,000,000
  Biaya Audit & Konsultasi  IDR 500,000,000
  Biaya Administrasi Lainnya IDR 1,000,000,000
                          ──────────────────
Total Biaya Administrasi & Umum    (IDR 20,400,000,000)
                                    ──────────────────
TOTAL BIAYA OPERASIONAL            (IDR 28,600,000,000)
                                    ──────────────────

LABA OPERASIONAL                    IDR 12,650,000,000


PENGHASILAN NON-OPERASIONAL
  Bunga Bank              IDR 300,000,000
  Dividen Diterima        IDR 200,000,000
  Keuntungan Penjualan Investasi IDR 500,000,000
                                    ──────────────────
Total Penghasilan Non-Operasional   IDR 1,000,000,000

BEBAN NON-OPERASIONAL
  Beban Bunga Kredit      (IDR 1,500,000,000)
  Kerugian Selisih Kurs   (IDR 200,000,000)
  Beban Lain-lain         (IDR 150,000,000)
                                    ──────────────────
Total Beban Non-Operasional        (IDR 1,850,000,000)
                                    ──────────────────

LABA SEBELUM PAJAK PENGHASILAN      IDR 11,800,000,000

PAJAK PENGHASILAN BADAN
  Pajak Penghasilan Badan           (IDR 2,950,000,000)
  Aset Pajak Tangguhan              IDR 300,000,000
                                    ──────────────────
Total Beban Pajak                  (IDR 2,650,000,000)
                                    ──────────────────

LABA BERSIH TAHUN INI               IDR 9,150,000,000

Laba Per Saham (EPS):
  Basic EPS (100,000 lembar saham)
  = IDR 9,150,000,000 / 100,000 = IDR 91,500 per saham
```

### 4.3 Laporan Arus Kas (Cash Flow Statement)

```
PT ABC INDONESIA
LAPORAN ARUS KAS (CASH FLOW STATEMENT)
Untuk Tahun yang Berakhir 31 Desember 2024
(Angka dalam Rupiah)

A. ARUS KAS DARI AKTIVITAS OPERASIONAL
   Laba Bersih Tahun Ini                IDR 9,150,000,000
   
   Penyesuaian untuk:
   - Depresiasi & Amortisasi           IDR 3,500,000,000
   - Penyisihan Piutang Ragu           IDR 1,200,000,000
   - Kewajiban Imbalan Kerja           IDR 500,000,000
   - Aset/Kewajiban Pajak Tangguhan    IDR (200,000,000)
   - Keuntungan Penjualan Investasi    IDR (500,000,000)
                                       ──────────────────
   Subtotal                            IDR 13,650,000,000
   
   Perubahan Aset & Kewajiban Operasional:
   - Piutang Usaha (↑)                 IDR (2,000,000,000)
   - Inventaris (↑)                    IDR (250,000,000)
   - Biaya Dibayar Dimuka (↑)          IDR (200,000,000)
   - Utang Usaha (↓)                   IDR 1,000,000,000
   - Beban Masih Harus Dibayar (↑)    IDR 500,000,000
                                       ──────────────────
   Arus Kas Operasional Bersih         IDR 12,700,000,000


B. ARUS KAS DARI AKTIVITAS INVESTASI
   Pembelian Aset Tetap               (IDR 8,000,000,000)
   Penjualan Investasi                IDR 2,000,000,000
   Dividen Diterima                   IDR 200,000,000
                                       ──────────────────
   Arus Kas Investasi Neto            (IDR 5,800,000,000)


C. ARUS KAS DARI AKTIVITAS PEMBIAYAAN
   Cicilan Kredit Investasi           (IDR 2,000,000,000)
   Cicilan Obligasi                   (IDR 500,000,000)
   Dividen Tunai Dibayarkan           (IDR 1,500,000,000)
   Kredit Bank Jangka Pendek (neto)   IDR 2,000,000,000
                                       ──────────────────
   Arus Kas Pembiayaan Neto           (IDR 2,000,000,000)


PERUBAHAN KAS NETO (A + B + C)        IDR 4,900,000,000
KAS AWAL TAHUN                        IDR 1,500,000,000
KAS AKHIR TAHUN                       IDR 6,400,000,000
```

---

## 5. TRANSAKSI AKUNTANSI INDONESIA - CONTOH

### 5.1 Jurnal-Jurnal Umum

#### Penjualan Barang (Domestic)
```
Contoh: PT ABC menjual barang ke PT XYZ
- Jumlah: Rp 50 juta
- Syarat: Neto 30 hari
- PPN: 11%

Dr. Accounts Receivable - PT XYZ    IDR 55,500,000
    Cr. Sales Revenue                   IDR 50,000,000
    Cr. Output Tax Payable (PPN)        IDR 5,500,000

Pembelian Barang
Contoh: PT ABC membeli bahan baku dari PT Supplier
- Jumlah: Rp 30 juta
- PPN: 11%
- Bayar tunai

Dr. Raw Materials Inventory         IDR 30,000,000
Dr. Input Tax Receivable (PPN)     IDR 3,300,000
    Cr. Cash                            IDR 33,300,000
```

#### Penjualan Ekspor (FOB)
```
Contoh: PT ABC menjual barang ekspor ke Singapore
- FOB Price: USD 10,000
- Kurs BI: IDR 15,500 per USD
- Freight & Insurance: USD 500 (dibayar penjual)

Dr. Accounts Receivable - Export    IDR 155,000,000
Dr. Freight Out (Beban)             IDR 7,750,000
    Cr. Sales Revenue (Export)          IDR 155,000,000
    Cr. Cash                            IDR 7,750,000

Catatan: Penjualan ekspor bebas PPN (0%)
```

#### Pajak Penghasilan Pasal 21 (PPh Karyawan)
```
Contoh: PT ABC membayar gaji karyawan bulan Januari
- Total Gaji: Rp 50 juta
- PPh Pasal 21: Rp 3 juta (dihitung dari PTKP)
- Asuransi BPJS: Rp 2 juta

Dr. Salary Expense                  IDR 50,000,000
    Cr. Cash (Net Salary)               IDR 45,000,000
    Cr. PPh Pasal 21 Payable            IDR 3,000,000
    Cr. BPJS Payable                    IDR 2,000,000

Catatan: PPh 21 harus disetor ke Kantor Pajak sebelum 10 hari bulan berikutnya
```

#### Pajak PPN (Masukan & Keluaran)
```
Contoh Perhitungan PPN Bulanan:
- Output Tax (PPN dari Penjualan):   IDR 50,000,000
- Input Tax (PPN dari Pembelian):    IDR 35,000,000
- PPN Terutang:                      IDR 15,000,000

Jika Output > Input (Normal):
Dr. Output Tax Payable              IDR 50,000,000
    Cr. PPN Expense / Kewajiban         IDR 50,000,000

Dr. Input Tax Receivable            IDR 35,000,000
    Cr. PPN Expense / Pemulihan        IDR 35,000,000

Dr. PPN Payable                     IDR 15,000,000
    Cr. Cash                           IDR 15,000,000

Jika Input > Output (Refund):
- Bisa dikompensasi dengan bulan berikutnya
- Atau diminta refund ke DJP (jika eksportir)
```

#### Pajak Penghasilan Pasal 25 (PPh Badan Bulanan)
```
Contoh: PT ABC membayar cicilan PPh Pasal 25
- PPh Pasal 25 Bulanan: IDR 2,000,000

Dr. PPh Pasal 25 Paid (Tax Asset)   IDR 2,000,000
    Cr. Cash                            IDR 2,000,000

Catatan: Bayar sebelum tanggal 15 bulan berikutnya
```

#### Depresiasi Aset Tetap
```
Contoh: Mesin Produksi
- Nilai Perolehan: IDR 100,000,000
- Umur Manfaat: 10 tahun (Standar Perpajakan)
- Nilai Residu: IDR 0
- Metode: Garis Lurus
- Depresiasi Tahunan = 100,000,000 / 10 = 10,000,000
- Depresiasi Bulanan = 10,000,000 / 12 = 833,333

Jurnal Bulanan:
Dr. Depreciation Expense            IDR 833,333
    Cr. Accumulated Depreciation        IDR 833,333

Catatan: Standar perpajakan untuk depresiasi:
- Bangunan: 20 tahun
- Mesin: 10 tahun
- Kendaraan: 4 tahun
- Furniture & Peralatan: 8 tahun
```

#### Penyisihan Piutang Ragu
```
Contoh: Piutang PT ABC mencapai IDR 100 juta
- Metode: Persentase Penjualan = 2%
- Penjualan Kredit Periode: IDR 500 juta

Jurnal:
Dr. Bad Debt Expense                IDR 10,000,000
    Cr. Allowance for Doubtful Debt    IDR 10,000,000

Catatan: Di neraca akan ditampilkan:
Piutang Usaha              IDR 100,000,000
Dikurangi: Penyisihan      IDR (10,000,000)
Piutang Neto              IDR 90,000,000
```

#### Beban Masih Harus Dibayar (Accrual)
```
Contoh: Listrik bulan Desember belum dibayar
- Estimasi Tagihan: IDR 5,000,000
- Tagihan diterima biasanya 15 hari di bulan berikutnya

Jurnal 31 Desember:
Dr. Electricity Expense              IDR 5,000,000
    Cr. Electricity Payable             IDR 5,000,000

Pada bulan Januari saat menerima tagihan:
Dr. Electricity Payable              IDR 5,000,000
Dr. Electricity Expense (Januari)   IDR 150,000
    Cr. Cash                           IDR 5,150,000
```

#### Kewajiban Imbalan Kerja (Pesangon)
```
Contoh: PT ABC memiliki 100 karyawan
- Rata-rata masa kerja: 5 tahun
- Pesangon 1 bulan gaji per tahun masa kerja
- Rata-rata gaji: IDR 10,000,000

Perhitungan Aktuaria:
- Total Pesangon yang Terukur: 100 x 5 x 10 juta = IDR 5 milyar
- Nilai Sekarang (Present Value): IDR 4,500,000,000

Jurnal 31 Desember:
Dr. Employee Benefit Expense        IDR 4,500,000,000
    Cr. Accrued Employee Benefits       IDR 4,500,000,000
```

---

## 6. PAJAK PENGHASILAN (PPh) INDONESIA

### 6.1 PPh Pasal 21 (Penghasilan Karyawan)

```
Wajib Pajak: Karyawan (pegawai tetap)
Dasar Pengenaan: Penghasilan bruto setelah PTKP
Tarif: 5%-30% (progressive)

Perhitungan:
Gaji Bruto                          IDR 10,000,000
Minus: Iuran Pensiun (JHT BPJS)    IDR (600,000)
                                    ──────────────
Penghasilan Neto                    IDR 9,400,000
Minus: PTKP (UMK Umum)             IDR (5,550,000)
                                    ──────────────
PKP (Penghasilan Kena Pajak)        IDR 3,850,000

PPh Pasal 21:
5% x IDR 3,850,000 = IDR 192,500

Gaji Neto yang Diterima = IDR 9,400,000 - IDR 192,500 = IDR 9,207,500

PTKP 2024:
- Status Kawin (K/0): IDR 54,000,000/tahun = IDR 4,500,000/bulan
- Status Kawin + 1 Anak (K/1): IDR 58,500,000/tahun = IDR 4,875,000/bulan
- Status Kawin + 2 Anak (K/2): IDR 63,000,000/tahun = IDR 5,250,000/bulan
- Status Kawin + 3 Anak (K/3): IDR 67,500,000/tahun = IDR 5,625,000/bulan
- Status Belum Kawin (TK/0): IDR 54,000,000/tahun = IDR 4,500,000/bulan
```

### 6.2 PPh Pasal 22 (Impor & Pembelian)

```
Wajib Pajak: Importir, Distributor, Reseller
Tarif: 7.5% - 15% tergantung jenis barang
Dasar Pengenaan: Nilai Barang atau Harga Pembelian

Contoh: PT ABC membeli barang dari supplier
- Harga Pembelian: IDR 100,000,000
- PPh Pasal 22: 1.5% (untuk pembelian reguler)
- PPh Terutang: IDR 1,500,000

Jurnal:
Dr. Inventory                       IDR 100,000,000
Dr. PPh Pasal 22 (Tax Asset)       IDR 1,500,000
    Cr. Cash                            IDR 101,500,000

Catatan: PPh Pasal 22 ini bisa dikreditkan dengan PPh Pasal 25
```

### 6.3 PPh Pasal 23 (Penghasilan Modal & Jasa)

```
Wajib Pajak: Pihak yang menerima penghasilan dari:
- Bunga Bank
- Dividen
- Royalti
- Honorarium
- Fee/Komisi

Tarif: 15% atau 10% (tergantung jenis)

Contoh: PT ABC terima dividen dari investasi
- Dividen Diterima: IDR 10,000,000
- PPh Pasal 23: 15%
- PPh Terutang: IDR 1,500,000

Jurnal:
Dr. Cash                            IDR 8,500,000
Dr. PPh Pasal 23 (Tax Asset)       IDR 1,500,000
    Cr. Dividend Income                 IDR 10,000,000
```

### 6.4 PPh Pasal 25 (Pajak Penghasilan Badan Bulanan)

```
Wajib Pajak: PT/Badan Usaha
Dasar Pengenaan: Laba (Profit)
Tarif: 22% (untuk tahun pajak 2024)
Dibayar: Cicilan bulanan (Pasal 25)

Contoh Perhitungan Tahunan:
Laba Sebelum Pajak               IDR 10,000,000,000
PPh Badan 22%                   (IDR 2,200,000,000)
Laba Neto                       IDR 7,800,000,000

Pembayaran Cicilan Bulanan:
- Estimasi pajak = Pajak tahun lalu / 12
- atau berdasarkan perhitungan estimasi

Contoh: Pajak lalu IDR 2,000,000,000
Cicilan bulanan = 2,000,000,000 / 12 = 166,666,667

Jurnal Pembayaran:
Dr. PPh Pasal 25 Paid            IDR 166,666,667
    Cr. Cash                        IDR 166,666,667

Catatan: Pada SPT Tahunan, cicilan yang sudah bayar akan dikreditkan
```

### 6.5 PPh Pasal 29 (Pelunasan Pajak Akhir Tahun)

```
Wajib Pajak: PT/Badan Usaha
Waktu: Bersamaan dengan penyampaian SPT Tahunan (30 April)
Perhitungan: PPh Terutang - Cicilan Pasal 25

Contoh:
PPh Terutang (berdasarkan SPT):    IDR 2,200,000,000
Cicilan Pasal 25 (12 x 166,667):   (IDR 2,000,000,000)
                                    ──────────────────
PPh Pasal 29 (Kurang Bayar):       IDR 200,000,000

Jurnal Pembayaran:
Dr. PPh Pasal 29                   IDR 200,000,000
    Cr. Cash                            IDR 200,000,000
```

---

## 7. PPN (PAJAK PERTAMBAHAN NILAI)

### 7.1 Mekanisme PPN

```
PPN Standar: 11% (sejak 1 April 2022)
Tipe: Value Added Tax (VAT)
Dicatat: Setiap transaksi penjualan & pembelian

Perhitungan:
PPN Keluaran (Output Tax) = PPN dari penjualan
PPN Masukan (Input Tax) = PPN dari pembelian
PPN Terutang = PPN Keluaran - PPN Masukan

Contoh Bulanan:
Penjualan dengan PPN (Output)      IDR 100,000,000
PPN Output 11%                      IDR 11,000,000
Pembelian dengan PPN (Input)        IDR 50,000,000
PPN Input 11%                       IDR 5,500,000
                                    ──────────────
PPN Terutang (dibayar ke Pajak)    IDR 5,500,000

Jurnal Saat Penjualan:
Dr. Accounts Receivable            IDR 111,000,000
    Cr. Sales Revenue                  IDR 100,000,000
    Cr. PPN Output (Kewajiban)        IDR 11,000,000

Jurnal Saat Pembelian:
Dr. Inventory / Expense             IDR 50,000,000
Dr. PPN Input (Asset)              IDR 5,500,000
    Cr. Accounts Payable               IDR 55,500,000

Jurnal Pembayaran PPN:
Dr. PPN Output Payable             IDR 11,000,000
    Cr. PPN Input Receivable           IDR 5,500,000
    Cr. Cash                           IDR 5,500,000
```

### 7.2 PPN Ekspor (0%)

```
Penjualan barang ekspor tidak kena PPN
Tetapi penjual masih bisa mengkreditkan PPN masukan

Contoh:
Penjualan Ekspor (PPN 0%)          IDR 100,000,000
Pembelian Domestik                  IDR 50,000,000
PPN Input Pembelian                 IDR 5,500,000

Jurnal Penjualan Ekspor:
Dr. Accounts Receivable (Export)   IDR 100,000,000
    Cr. Sales Revenue (Export)         IDR 100,000,000

Kredit PPN Input:
Dr. PPN Refund/Kompensasi          IDR 5,500,000
    Cr. PPN Input Receivable           IDR 5,500,000

Catatan: Penjual bisa minta refund PPN atau kompensasi
```

---

## 8. IMPLEMENTASI DATABASE

### 8.1 Entity untuk SAK-EP

```typescript
// src/modules/finance/entities/chart-of-account.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('finance_chart_of_accounts')
export class ChartOfAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenantId: string;

  @Column('uuid')
  companyId: string;

  @Column({ type: 'varchar', length: 20 })
  code: string; // e.g., "1010" untuk Kas

  @Column({ type: 'varchar', length: 100 })
  name: string; // e.g., "Kas (IDR)"

  @Column({ type: 'enum', enum: [
    'ASSET_CURRENT',
    'ASSET_NONCURRENT',
    'LIABILITY_CURRENT',
    'LIABILITY_NONCURRENT',
    'EQUITY',
    'REVENUE',
    'COGS',
    'OPERATING_EXPENSE',
    'NONOPERATING_INCOME',
    'NONOPERATING_EXPENSE',
    'TAX_EXPENSE',
  ]})
  accountType: string;

  @Column({ type: 'varchar', length: 50 })
  level: string; // Level 1-5 untuk hierarki CoA

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'decimal', precision: 18, scale: 0, default: 0 })
  openingBalance: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  department: string; // Untuk tracking departemen (opsional)

  @Column({ type: 'varchar', length: 50, nullable: true })
  taxCode: string; // Untuk mapping ke tax reporting

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 8.2 Migrasi Database

```typescript
// src/database/migrations/1700000001-create-coa.migration.ts

import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateChartOfAccountsMigration1700000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'finance_chart_of_accounts',
        schema: 'public',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
          },
          {
            name: 'company_id',
            type: 'uuid',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'account_type',
            type: 'enum',
            enum: [
              'ASSET_CURRENT',
              'ASSET_NONCURRENT',
              'LIABILITY_CURRENT',
              'LIABILITY_NONCURRENT',
              'EQUITY',
              'REVENUE',
              'COGS',
              'OPERATING_EXPENSE',
              'NONOPERATING_INCOME',
              'NONOPERATING_EXPENSE',
              'TAX_EXPENSE',
            ],
          },
          {
            name: 'level',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'opening_balance',
            type: 'decimal',
            precision: 18,
            scale: 0,
            default: 0,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'department',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'tax_code',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          new Index({
            name: 'idx_coa_tenant_company_code',
            columnNames: ['tenant_id', 'company_id', 'code'],
            isUnique: true,
          }),
          new Index({
            name: 'idx_coa_account_type',
            columnNames: ['account_type'],
          }),
          new Index({
            name: 'idx_coa_active',
            columnNames: ['is_active'],
          }),
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('finance_chart_of_accounts', true);
  }
}
```

---

## 9. API SPECIFICATIONS

### 9.1 Create Chart of Accounts

```
POST /api/v1/finance/chart-of-accounts

Request Body:
{
  "code": "1010",
  "name": "Kas (IDR)",
  "accountType": "ASSET_CURRENT",
  "level": "4",
  "description": "Kas dalam bentuk uang tunai",
  "department": "General",
  "taxCode": "ASSET",
  "openingBalance": 50000000
}

Response (201):
{
  "id": "uuid-xxx",
  "tenantId": "tenant-id",
  "companyId": "company-id",
  "code": "1010",
  "name": "Kas (IDR)",
  "accountType": "ASSET_CURRENT",
  "level": "4",
  "isActive": true,
  "openingBalance": 50000000,
  "createdAt": "2024-06-28T10:00:00Z"
}
```

### 9.2 Create Journal Entry

```
POST /api/v1/finance/journal-entries

Request Body:
{
  "date": "2024-06-28",
  "period": "202406",
  "reference": "INV-001",
  "description": "Penjualan ke PT ABC",
  "lines": [
    {
      "accountCode": "1110",
      "accountName": "Piutang Usaha",
      "debit": 111000000,
      "credit": 0
    },
    {
      "accountCode": "6010",
      "accountName": "Penjualan Produk",
      "debit": 0,
      "credit": 100000000
    },
    {
      "accountCode": "3150",
      "accountName": "Utang PPN",
      "debit": 0,
      "credit": 11000000
    }
  ]
}

Response:
{
  "id": "je-uuid",
  "journalNumber": "JE-202406-001",
  "date": "2024-06-28",
  "totalDebit": 111000000,
  "totalCredit": 111000000,
  "status": "POSTED",
  "lines": [...],
  "createdAt": "2024-06-28T10:00:00Z"
}
```

### 9.3 Get Financial Statement

```
GET /api/v1/finance/statements/balance-sheet?period=202406&format=SAK-EP

Response:
{
  "reportType": "BALANCE_SHEET",
  "period": "202406",
  "currency": "IDR",
  "assets": {
    "current": {
      "cash": 50000000,
      "accountsReceivable": 111000000,
      "inventory": 250000000,
      ...
    },
    "nonCurrent": {...}
  },
  "liabilities": {...},
  "equity": {...},
  "totalAssets": 500000000,
  "totalLiabilities": 200000000,
  "totalEquity": 300000000
}
```

---

## 10. CONTOH KASUS LENGKAP

### Contoh: PT ABC Industri (Manufaktur)

```
Tanggal 1 Juni 2024, PT ABC Industri (Pabrik Plastik) mencatat:

TRANSAKSI:
1. Membeli bahan baku dari supplier IDR 50 juta (dengan PPN 11%)
2. Menjual produk ke customer IDR 80 juta (dengan PPN 11%)
3. Membayar gaji karyawan bulan Mei IDR 30 juta
   - PPh Pasal 21: IDR 1,800,000
   - BPJS: IDR 2,000,000
4. Menerima pembayaran dari customer IDR 70 juta

JURNAL YANG DIBUAT:

1. Pembelian Bahan Baku:
   Dr. Raw Materials Inventory     IDR 50,000,000
   Dr. PPN Input                   IDR 5,500,000
       Cr. Accounts Payable            IDR 55,500,000

2. Penjualan Produk:
   Dr. Accounts Receivable         IDR 88,800,000
       Cr. Sales Revenue               IDR 80,000,000
       Cr. PPN Output (Payable)        IDR 8,800,000

3. Pembayaran Gaji + PPh 21:
   Dr. Salary Expense              IDR 30,000,000
       Cr. Cash                        IDR 26,200,000
       Cr. PPh Pasal 21 Payable        IDR 1,800,000
       Cr. BPJS Payable                IDR 2,000,000

4. Penerimaan Kas dari Penjualan:
   Dr. Cash                        IDR 70,000,000
       Cr. Accounts Receivable         IDR 70,000,000

PPN PERHITUNGAN (Akhir Bulan):
- Output Tax (dari penjualan): IDR 8,800,000
- Input Tax (dari pembelian): IDR 5,500,000
- PPN Terutang: IDR 3,300,000 (harus dibayar sebelum 15 Juli)

PPh PASAL 25 CICILAN:
- Diperkirakan IDR 2,000,000 (dibayar sebelum 15 Juli)
```

---

## KESIMPULAN

Dokumentasi ini menjelaskan implementasi **Finance Module** yang **100% sesuai dengan standar akuntansi Indonesia**:

✅ **Chart of Accounts** - Struktur lengkap sesuai SAK-EP  
✅ **Journal Entries** - Contoh transaksi nyata Indonesia  
✅ **Tax Compliance** - PPh, PPN, pajak lainnya  
✅ **Financial Statements** - Sesuai SAK-EP requirements  
✅ **Database Design** - Siap implementasi  
✅ **API Specs** - Lengkap untuk developer  

Semua sudah ready untuk development! 🚀

---

**Version:** 1.0 Indonesia Edition  
**Standar:** SAK-EP & SAK  
**Last Updated:** June 2026


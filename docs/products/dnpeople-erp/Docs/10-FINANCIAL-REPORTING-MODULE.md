# FINANCIAL REPORTING MODULE
## Laporan Keuangan Resmi Sesuai SAK-EP/SAK Indonesia — dnPeople

**Version:** 1.1 Enterprise Ready (aligned with codebase)  
**Date:** June 2026 · **Implementation sync:** 3 Juli 2026  
**Standar:** SAK-EP & SAK  
**Compliance:** Bank Indonesia, Otoritas Jasa Keuangan, Kementerian Keuangan

> ### ✅ Status Implementasi (Jul 2026 — ~95% core Doc 10)
> | Fitur | Status | API / UI |
> |-------|--------|----------|
> | Balance sheet, P&L, Cash flow SAK-EP | ✅ | `/reporting/*`, `/reports/*` |
> | Official SAK-EP line mapping | ✅ | `sak-line-items.map.ts` |
> | PDF / Excel / XML export | ✅ | `POST /reporting/export` |
> | Signed download URL | ✅ | `GET /reporting/exports/:token/download` |
> | Editable financial notes | ✅ | `PUT /reporting/notes/custom` |
> | Validation (Doc §5) | ✅ | comparative, asset class, CF rules |
> | Consolidated / segment / related party | ✅ | advanced reporting service |
> | Sensitivity / trend / analytics | ✅ | |
> | RBAC workflow Finalize→Approve→Publish | ✅ | ReportsPage compliance tab |
> | Email on PUBLISHED + scheduler PDF | ✅ | |
> | Custom report builder UI | ✅ | `/reports/custom-builder` |
>
> **Live status:** [`12-PROJECT-STATUS.md`](12-PROJECT-STATUS.md)

---

## 📋 DAFTAR ISI
1. Overview Laporan Keuangan Indonesia
2. Laporan Wajib per Standar
3. Struktur & Format Resmi
4. Database Schema untuk Reporting
5. API Specifications
6. Export Format
7. Validation Rules
8. Contoh Laporan Real
9. Audit Trail
10. Compliance Checklist

---

## 1. OVERVIEW LAPORAN KEUANGAN INDONESIA

### 1.1 Laporan Wajib Menurut Standar

#### **SAK-EP (Entitas Pengguna SAK-EP) - UMKM**
```
Laporan Wajib:
├─ Laporan Posisi Keuangan (Balance Sheet)
├─ Laporan Laba Rugi (Income Statement)
├─ Laporan Arus Kas (Cash Flow Statement)
├─ Catatan atas Laporan Keuangan (Notes)
└─ Laporan Perubahan Ekuitas (Changes in Equity)

Periode Laporan:
├─ Tahunan: 1 Januari - 31 Desember
└─ Interim: Optional (3 bulan, 6 bulan, 9 bulan)

Deadline Penyerahan:
├─ Ke Kantor Pajak: 30 April (SPT Tahunan)
├─ Ke Kementerian Keuangan: 60 hari setelah tutup buku
└─ Ke Pemegang Saham: Sebelum RUPS
```

#### **SAK (Standar Akuntansi Keuangan) - Perusahaan Besar/Go-Public**
```
Laporan Wajib:
├─ Laporan Keuangan Konsolidasi
├─ Laporan Keuangan Standar
├─ Laporan Segmen
├─ Laporan Related Party Transactions
├─ Laporan Arus Kas
├─ Catatan atas Laporan Keuangan (Comprehensive)
├─ Laporan Perubahan Ekuitas
└─ Analisis Sensitifitas Kuantitatif

Periode Laporan:
├─ Interim: Kuartalan (3 bulan)
├─ Interim: Semestaran (6 bulan)
└─ Tahunan: 1 Januari - 31 Desember

Deadline:
├─ Interim: 30 hari setelah periode berakhir
└─ Tahunan: 60 hari setelah periode berakhir

Publikasi:
├─ OJK (Otoritas Jasa Keuangan)
├─ BEI (Bursa Efek Indonesia) - jika listing
└─ Website Perusahaan
```

### 1.2 Tanggal Pelaporan Standar

```
Periode Akuntansi: 1 Januari - 31 Desember

Laporan Interim:
├─ Q1: 31 Maret
├─ Q2: 30 Juni
├─ Q3: 30 September
└─ Q4: 31 Desember (Tahunan)

Fiscal Year Berbeda (Optional):
├─ 1 April - 31 Maret
├─ 1 Juli - 30 Juni
└─ Custom period (approval dari pajak)
```

---

## 2. LAPORAN KEUANGAN DETAIL

### 2.1 LAPORAN POSISI KEUANGAN (BALANCE SHEET)

#### Format Resmi SAK-EP

```
PT ABC INDONESIA
LAPORAN POSISI KEUANGAN
Per 31 Desember 2024
(Disajikan dalam Rupiah)

──────────────────────────────────────────────────────
                                    2024         2023
──────────────────────────────────────────────────────

ASET

Aset Lancar
  Kas dan setara kas                IDR XXX      IDR XXX
  Piutang usaha (neto)              IDR XXX      IDR XXX
  Persediaan                        IDR XXX      IDR XXX
  Pajak input                       IDR XXX      IDR XXX
  Beban dibayar di muka             IDR XXX      IDR XXX
  Aset lainnya                      IDR XXX      IDR XXX
  ─────────────────────────────────────────────────
  Jumlah Aset Lancar                IDR XXX      IDR XXX


Aset Tidak Lancar
  Properti, pabrik & peralatan:
    Nilai kotor               IDR XXX
    Dikurangi: Akumulasi
    penyusutan               (IDR XXX)
    Nilai buku neto                 IDR XXX      IDR XXX

  Aset intangible (neto)            IDR XXX      IDR XXX
  Goodwill                          IDR XXX      IDR XXX
  Investasi jangka panjang          IDR XXX      IDR XXX
  Aset pajak tangguhan              IDR XXX      IDR XXX
  Aset lainnya                      IDR XXX      IDR XXX
  ─────────────────────────────────────────────────
  Jumlah Aset Tidak Lancar          IDR XXX      IDR XXX

──────────────────────────────────────────────────────
TOTAL ASET                          IDR XXX      IDR XXX
──────────────────────────────────────────────────────


KEWAJIBAN

Kewajiban Lancar
  Utang usaha                       IDR XXX      IDR XXX
  Utang pajak penghasilan           IDR XXX      IDR XXX
  Utang pajak pertambahan nilai     IDR XXX      IDR XXX
  Kredit bank jangka pendek         IDR XXX      IDR XXX
  Beban masih harus dibayar         IDR XXX      IDR XXX
  Bagian utang jangka panjang       IDR XXX      IDR XXX
  Kewajiban lainnya                 IDR XXX      IDR XXX
  ─────────────────────────────────────────────────
  Jumlah Kewajiban Lancar           IDR XXX      IDR XXX


Kewajiban Tidak Lancar
  Kredit investasi jangka panjang   IDR XXX      IDR XXX
  Obligasi                          IDR XXX      IDR XXX
  Kewajiban imbalan jangka panjang  IDR XXX      IDR XXX
  Kewajiban pajak tangguhan         IDR XXX      IDR XXX
  Kewajiban lainnya                 IDR XXX      IDR XXX
  ─────────────────────────────────────────────────
  Jumlah Kewajiban Tidak Lancar     IDR XXX      IDR XXX

──────────────────────────────────────────────────────
TOTAL KEWAJIBAN                     IDR XXX      IDR XXX
──────────────────────────────────────────────────────


EKUITAS

  Modal saham (*)                   IDR XXX      IDR XXX
  Agio saham                        IDR XXX      IDR XXX
  Cadangan:
    Cadangan hukum                  IDR XXX      IDR XXX
    Cadangan umum                   IDR XXX      IDR XXX
  Laba ditahan:
    Sebelum tahun berjalan          IDR XXX      IDR XXX
    Tahun berjalan                  IDR XXX      IDR XXX
  ─────────────────────────────────────────────────
  Jumlah Ekuitas                    IDR XXX      IDR XXX

──────────────────────────────────────────────────────
TOTAL KEWAJIBAN DAN EKUITAS         IDR XXX      IDR XXX
──────────────────────────────────────────────────────

(*) Modal saham XXX lembar dengan nilai nominal
    Rp X.XXX per lembar
```

---

### 2.2 LAPORAN LABA RUGI (INCOME STATEMENT)

#### Format Resmi SAK-EP

```
PT ABC INDONESIA
LAPORAN LABA RUGI
Untuk Tahun yang Berakhir 31 Desember 2024
(Disajikan dalam Rupiah)

────────────────────────────────────────────────────
                                    2024      2023
────────────────────────────────────────────────────

PENDAPATAN OPERASIONAL

Penjualan barang/jasa              IDR XXX   IDR XXX
Dikurangi:
  Retur penjualan                 (IDR XXX) (IDR XXX)
  Diskon penjualan                (IDR XXX) (IDR XXX)
  ──────────────────────────────────────────────
Penjualan neto                     IDR XXX   IDR XXX

Harga pokok penjualan             (IDR XXX) (IDR XXX)
  ──────────────────────────────────────────────
LABA KOTOR                         IDR XXX   IDR XXX


BIAYA OPERASIONAL

Biaya penjualan:
  Gaji dan komisi penjual         (IDR XXX) (IDR XXX)
  Biaya perjalanan penjualan      (IDR XXX) (IDR XXX)
  Biaya pemasaran dan iklan       (IDR XXX) (IDR XXX)
  Penyisihan piutang ragu         (IDR XXX) (IDR XXX)
  Biaya penjualan lainnya         (IDR XXX) (IDR XXX)
  ──────────────────────────────────────────────
Jumlah biaya penjualan            (IDR XXX) (IDR XXX)

Biaya administrasi dan umum:
  Gaji karyawan administrasi      (IDR XXX) (IDR XXX)
  Gaji manajemen                  (IDR XXX) (IDR XXX)
  Tunjangan karyawan              (IDR XXX) (IDR XXX)
  Depresiasi dan amortisasi       (IDR XXX) (IDR XXX)
  Biaya perawatan aset tetap      (IDR XXX) (IDR XXX)
  Biaya listrik dan air           (IDR XXX) (IDR XXX)
  Biaya sewa                      (IDR XXX) (IDR XXX)
  Biaya asuransi                  (IDR XXX) (IDR XXX)
  Biaya audit dan konsultasi      (IDR XXX) (IDR XXX)
  Biaya administrasi lainnya      (IDR XXX) (IDR XXX)
  ──────────────────────────────────────────────
Jumlah biaya administrasi & umum  (IDR XXX) (IDR XXX)

  ──────────────────────────────────────────────
TOTAL BIAYA OPERASIONAL           (IDR XXX) (IDR XXX)
  ──────────────────────────────────────────────

LABA OPERASIONAL                  IDR XXX   IDR XXX


PENGHASILAN (BEBAN) NON-OPERASIONAL

Penghasilan:
  Bunga bank                      IDR XXX   IDR XXX
  Dividen diterima                IDR XXX   IDR XXX
  Keuntungan penjualan investasi  IDR XXX   IDR XXX
  ──────────────────────────────────────────────
Jumlah penghasilan non-operasional IDR XXX   IDR XXX

Beban:
  Beban bunga kredit             (IDR XXX) (IDR XXX)
  Kerugian selisih kurs          (IDR XXX) (IDR XXX)
  ──────────────────────────────────────────────
Jumlah beban non-operasional      (IDR XXX) (IDR XXX)

  ──────────────────────────────────────────────
LABA SEBELUM PAJAK PENGHASILAN    IDR XXX   IDR XXX

PAJAK PENGHASILAN BADAN           (IDR XXX) (IDR XXX)
  ──────────────────────────────────────────────
LABA BERSIH TAHUN INI             IDR XXX   IDR XXX
════════════════════════════════════════════════════

Laba Per Saham (Dasar):
Laba bersih / Jumlah saham         IDR XXX   IDR XXX
────────────────────────────────────────────────────
```

---

### 2.3 LAPORAN ARUS KAS (CASH FLOW STATEMENT)

#### Format Resmi SAK-EP

```
PT ABC INDONESIA
LAPORAN ARUS KAS
Untuk Tahun yang Berakhir 31 Desember 2024
(Disajikan dalam Rupiah)

────────────────────────────────────────────────────
                                    2024      2023
────────────────────────────────────────────────────

ARUS KAS DARI AKTIVITAS OPERASIONAL

Laba bersih tahun ini              IDR XXX   IDR XXX

Penyesuaian untuk:
  Depresiasi dan amortisasi       IDR XXX   IDR XXX
  Penyisihan piutang ragu         IDR XXX   IDR XXX
  Kewajiban imbalan kerja         IDR XXX   IDR XXX
  Aset/kewajiban pajak tangguhan  IDR XXX   IDR XXX
  Keuntungan penjualan investasi (IDR XXX) (IDR XXX)
  ──────────────────────────────────────────────

Perubahan aset dan kewajiban operasional:
  Piutang usaha                   IDR XXX   IDR XXX
  Persediaan                      IDR XXX   IDR XXX
  Beban dibayar di muka           IDR XXX   IDR XXX
  Utang usaha                     IDR XXX   IDR XXX
  Beban masih harus dibayar       IDR XXX   IDR XXX
  ──────────────────────────────────────────────
Arus kas bersih dari
aktivitas operasional             IDR XXX   IDR XXX


ARUS KAS DARI AKTIVITAS INVESTASI

Pembelian aset tetap             (IDR XXX) (IDR XXX)
Penjualan aset tetap              IDR XXX   IDR XXX
Pembelian investasi              (IDR XXX) (IDR XXX)
Penjualan investasi               IDR XXX   IDR XXX
Dividen diterima                  IDR XXX   IDR XXX
  ──────────────────────────────────────────────
Arus kas bersih dari
aktivitas investasi              (IDR XXX) (IDR XXX)


ARUS KAS DARI AKTIVITAS PEMBIAYAAN

Pembayaran cicilan kredit        (IDR XXX) (IDR XXX)
Pembayaran obligasi              (IDR XXX) (IDR XXX)
Dividen tunai dibayarkan         (IDR XXX) (IDR XXX)
Kredit bank jangka pendek         IDR XXX   IDR XXX
  ──────────────────────────────────────────────
Arus kas bersih dari
aktivitas pembiayaan             (IDR XXX) (IDR XXX)


PERUBAHAN KAS BERSIH             IDR XXX   IDR XXX

Kas awal tahun                   IDR XXX   IDR XXX
  ──────────────────────────────────────────────
KAS AKHIR TAHUN                  IDR XXX   IDR XXX
════════════════════════════════════════════════════
```

---

### 2.4 LAPORAN PERUBAHAN EKUITAS

#### Format Resmi SAK-EP

```
PT ABC INDONESIA
LAPORAN PERUBAHAN EKUITAS
Untuk Tahun yang Berakhir 31 Desember 2024
(Disajikan dalam Rupiah)

──────────────────────────────────────────────────────────────
                           Modal    Cadangan  Laba Ditahan
                           Saham    Hukum     Sebelumnya    Total
──────────────────────────────────────────────────────────────

Saldo per 1 Januari 2023   IDR XXX  IDR XXX  IDR XXX    IDR XXX

Laba bersih 2023                                IDR XXX    IDR XXX
Pengalihan cadangan hukum   -        IDR XXX (IDR XXX)       -
Dividen tunai 2023                           (IDR XXX)  (IDR XXX)
                           ────────────────────────────────
Saldo per 31 Desember 2023 IDR XXX  IDR XXX  IDR XXX    IDR XXX


Saldo per 1 Januari 2024   IDR XXX  IDR XXX  IDR XXX    IDR XXX

Laba bersih 2024                                IDR XXX    IDR XXX
Pengalihan cadangan hukum   -        IDR XXX (IDR XXX)       -
Dividen tunai 2024                           (IDR XXX)  (IDR XXX)
                           ────────────────────────────────
Saldo per 31 Desember 2024 IDR XXX  IDR XXX  IDR XXX    IDR XXX
════════════════════════════════════════════════════════════════
```

---

### 2.5 CATATAN ATAS LAPORAN KEUANGAN (NOTES)

#### Format Standar SAK-EP

```
PT ABC INDONESIA
CATATAN ATAS LAPORAN KEUANGAN
Untuk Tahun yang Berakhir 31 Desember 2024

1. INFORMASI UMUM

PT ABC Indonesia (selanjutnya disebut "Perusahaan") 
didirikan berdasarkan Akte Notaris No. ... tanggal ... 
yang telah dikonfirmasi dengan Surat Persetujuan 
Kementerian Hukum dan Hak Asasi Manusia 
No. ... tanggal ....

Perusahaan berdomisili di Jl. ... Jakarta, Indonesia
dan bergerak di bidang manufaktur plastik.

Perusahaan memiliki satu kantor cabang berlokasi 
di Surabaya.

2. DASAR PENYUSUNAN LAPORAN KEUANGAN

Laporan keuangan ini disusun sesuai dengan Standar 
Akuntansi Keuangan untuk Entitas Pengguna SAK-EP 
(SAK-EP) yang dikeluarkan oleh Ikatan Akuntan 
Indonesia (IAI).

Laporan keuangan disajikan dalam Rupiah Indonesia 
(IDR), yang merupakan mata uang fungsional Perusahaan.

Periode pelaporan adalah tahun kalender 
(1 Januari - 31 Desember).

3. KEBIJAKAN AKUNTANSI PENTING

a. Pengakuan Pendapatan
   Penjualan barang diakui pada saat barang 
   dikirim ke pembeli. Penjualan dinyatakan 
   neto dari retur penjualan dan diskon.

b. Penilaian Persediaan
   Persediaan dinilai dengan metode rata-rata 
   tertimbang (weighted average). Biaya persediaan 
   meliputi biaya pembelian, biaya konversi, dan 
   biaya lainnya yang timbul untuk membawa persediaan 
   ke kondisi dan lokasi sekarang.

c. Properti, Pabrik & Peralatan
   Aset ini dicatat pada nilai perolehan dikurangi 
   akumulasi penyusutan.
   
   Metode penyusutan:
   - Bangunan: 20 tahun (Garis lurus)
   - Mesin: 10 tahun (Garis lurus)
   - Kendaraan: 4 tahun (Garis lurus)
   - Furniture: 8 tahun (Garis lurus)
   
   Nilai sisa tidak dipertimbangkan.

d. Penyisihan Piutang Ragu
   Penyisihan dihitung menggunakan metode 
   persentase penjualan sebesar 2% dari penjualan 
   kredit tahun berjalan.

e. Pajak Penghasilan
   Pajak penghasilan diakui berdasarkan laba 
   kena pajak dengan tarif 22%.

4. TRANSAKSI PIHAK YANG MEMPUNYAI HUBUNGAN ISTIMEWA

Selama tahun 2024, Perusahaan tidak memiliki 
transaksi dengan pihak yang mempunyai 
hubungan istimewa.

5. PERISTIWA SETELAH TANGGAL NERACA

Tidak ada peristiwa signifikan setelah tanggal 
neraca yang perlu diungkapkan.
```

---

## 3. DATABASE SCHEMA UNTUK REPORTING

### 3.1 Reporting Tables

```typescript
// src/modules/reporting/entities/report-period.entity.ts

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('finance_report_periods')
export class ReportPeriod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenantId: string;

  @Column('uuid')
  companyId: string;

  @Column({ type: 'varchar', length: 50 })
  periodCode: string; // '202412', '202401', 'Q4-2024'

  @Column({ type: 'date' })
  startDate: Date; // 2024-01-01

  @Column({ type: 'date' })
  endDate: Date; // 2024-12-31

  @Column({ type: 'enum', enum: ['MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL'] })
  periodType: string;

  @Column({ type: 'enum', enum: ['DRAFT', 'FINALIZED', 'APPROVED', 'PUBLISHED'] })
  status: string;

  @Column({ type: 'varchar', length: 50 })
  fiscalYear: string; // '2024'

  @Column({ type: 'boolean', default: false })
  isClosed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  closedBy: string; // User ID

  @Column({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp' })
  updatedAt: Date;
}
```

### 3.2 Trial Balance Table

```typescript
// src/modules/reporting/entities/trial-balance.entity.ts

@Entity('finance_trial_balances')
export class TrialBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenantId: string;

  @Column('uuid')
  reportPeriodId: string;

  @Column('uuid')
  chartOfAccountId: string;

  @Column({ type: 'varchar', length: 20 })
  accountCode: string;

  @Column({ type: 'varchar', length: 100 })
  accountName: string;

  @Column({ type: 'enum', enum: [
    'ASSET_CURRENT', 'ASSET_NONCURRENT',
    'LIABILITY_CURRENT', 'LIABILITY_NONCURRENT',
    'EQUITY', 'REVENUE', 'COGS', 'EXPENSE'
  ]})
  accountType: string;

  @Column({ type: 'decimal', precision: 18, scale: 0 })
  debitBalance: number;

  @Column({ type: 'decimal', precision: 18, scale: 0 })
  creditBalance: number;

  @Column({ type: 'timestamp' })
  generatedAt: Date;
}
```

### 3.3 Financial Statement Data Table

```typescript
// src/modules/reporting/entities/financial-statement-item.entity.ts

@Entity('finance_statement_items')
export class FinancialStatementItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenantId: string;

  @Column('uuid')
  reportPeriodId: string;

  @Column({ type: 'enum', enum: [
    'BALANCE_SHEET',
    'INCOME_STATEMENT',
    'CASH_FLOW',
    'EQUITY_CHANGES'
  ]})
  statementType: string;

  @Column({ type: 'varchar', length: 100 })
  itemCode: string; // 'BS_ASSET_CURRENT', 'IS_REVENUE'

  @Column({ type: 'varchar', length: 255 })
  itemName: string;

  @Column({ type: 'integer' })
  lineNumber: number; // Urutan baris di laporan

  @Column({ type: 'varchar', length: 50 })
  itemLevel: string; // 'HEADER', 'DETAIL', 'SUBTOTAL', 'TOTAL'

  @Column({ type: 'decimal', precision: 18, scale: 0 })
  currentAmount: number; // 2024

  @Column({ type: 'decimal', precision: 18, scale: 0, nullable: true })
  previousAmount: number; // 2023 (untuk comparative)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentageOfTotal: number; // Untuk analisis

  @Column({ type: 'text', nullable: true })
  notes: string; // Catatan spesifik item

  @Column({ type: 'timestamp' })
  createdAt: Date;
}
```

---

## 4. API SPECIFICATIONS

### 4.1 Generate Balance Sheet API

```
GET /api/v1/reporting/statements/balance-sheet

Query Parameters:
├─ period: "202412" (required)
├─ format: "SAK-EP" | "SAK" | "JSON" (default: JSON)
├─ includePrevious: true | false
├─ currency: "IDR" (default: IDR)
└─ export: "PDF" | "EXCEL" | "JSON" | "XML" (optional)

Response (200):
{
  "reportType": "BALANCE_SHEET",
  "period": {
    "code": "202412",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "fiscalYear": "2024"
  },
  "company": {
    "id": "uuid",
    "name": "PT ABC Indonesia",
    "address": "Jl. ...",
    "taxId": "XX.XXX.XXX.X-XXX.XXX"
  },
  "assets": {
    "currentAssets": {
      "cash": {
        "name": "Kas dan setara kas",
        "current": 50000000000,
        "previous": 45000000000
      },
      "accountsReceivable": {
        "name": "Piutang usaha (neto)",
        "current": 125000000000,
        "previous": 110000000000
      },
      "inventory": {
        "name": "Persediaan",
        "current": 250000000000,
        "previous": 240000000000
      },
      "subtotal": {
        "name": "Jumlah Aset Lancar",
        "current": 425000000000,
        "previous": 395000000000
      }
    },
    "nonCurrentAssets": {
      "ppe": {
        "name": "Properti, pabrik & peralatan (neto)",
        "current": 535000000000,
        "previous": 520000000000
      },
      "subtotal": {
        "name": "Jumlah Aset Tidak Lancar",
        "current": 535000000000,
        "previous": 520000000000
      }
    },
    "totalAssets": {
      "name": "TOTAL ASET",
      "current": 960000000000,
      "previous": 915000000000
    }
  },
  "liabilities": {
    "currentLiabilities": {
      "accountsPayable": {
        "name": "Utang usaha",
        "current": 125000000000,
        "previous": 115000000000
      },
      "taxPayable": {
        "name": "Utang pajak",
        "current": 25000000000,
        "previous": 20000000000
      },
      "subtotal": {
        "name": "Jumlah Kewajiban Lancar",
        "current": 150000000000,
        "previous": 135000000000
      }
    },
    "nonCurrentLiabilities": {
      "longTermDebt": {
        "name": "Kredit investasi jangka panjang",
        "current": 250000000000,
        "previous": 270000000000
      },
      "subtotal": {
        "name": "Jumlah Kewajiban Tidak Lancar",
        "current": 250000000000,
        "previous": 270000000000
      }
    },
    "totalLiabilities": {
      "name": "TOTAL KEWAJIBAN",
      "current": 400000000000,
      "previous": 405000000000
    }
  },
  "equity": {
    "share_capital": {
      "name": "Modal saham",
      "current": 250000000000,
      "previous": 250000000000
    },
    "retained_earnings": {
      "name": "Laba ditahan",
      "current": 310000000000,
      "previous": 260000000000
    },
    "total": {
      "name": "TOTAL EKUITAS",
      "current": 560000000000,
      "previous": 510000000000
    }
  },
  "totalLiabilitiesAndEquity": {
    "name": "TOTAL KEWAJIBAN DAN EKUITAS",
    "current": 960000000000,
    "previous": 915000000000
  },
  "generatedAt": "2024-06-28T10:30:00Z",
  "generatedBy": "user-id",
  "auditTrail": {
    "lastModified": "2024-06-28T10:30:00Z",
    "modifiedBy": "user-id",
    "status": "FINALIZED"
  }
}
```

### 4.2 Generate Income Statement API

```
GET /api/v1/reporting/statements/income-statement

Query Parameters:
├─ period: "202412"
├─ format: "SAK-EP" | "SAK"
├─ includePrevious: true
├─ export: "PDF" | "EXCEL" | "JSON" | "XML"
└─ includeMemos: true (untuk EPS, dll)

Response (200):
{
  "reportType": "INCOME_STATEMENT",
  "period": {
    "code": "202412",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  },
  "revenue": {
    "sales": {
      "name": "Penjualan barang",
      "current": 1500000000000,
      "previous": 1300000000000
    },
    "salesReturns": {
      "name": "Retur penjualan",
      "current": -30000000000,
      "previous": -25000000000
    },
    "netSales": {
      "name": "Penjualan neto",
      "current": 1470000000000,
      "previous": 1275000000000
    }
  },
  "cogs": {
    "name": "Harga pokok penjualan",
    "current": -882000000000,
    "previous": -765000000000
  },
  "grossProfit": {
    "name": "LABA KOTOR",
    "current": 588000000000,
    "previous": 510000000000
  },
  "operatingExpenses": {
    "sellingExpenses": {
      "name": "Biaya penjualan",
      "current": -150000000000,
      "previous": -130000000000
    },
    "adminExpenses": {
      "name": "Biaya administrasi dan umum",
      "current": -180000000000,
      "previous": -165000000000
    },
    "totalOperatingExpenses": {
      "name": "TOTAL BIAYA OPERASIONAL",
      "current": -330000000000,
      "previous": -295000000000
    }
  },
  "operatingProfit": {
    "name": "LABA OPERASIONAL",
    "current": 258000000000,
    "previous": 215000000000
  },
  "nonOperatingItems": {
    "interestIncome": {
      "name": "Bunga bank",
      "current": 5000000000,
      "previous": 4000000000
    },
    "interestExpense": {
      "name": "Beban bunga kredit",
      "current": -25000000000,
      "previous": -28000000000
    },
    "netNonOperating": {
      "name": "Jumlah non-operasional neto",
      "current": -20000000000,
      "previous": -24000000000
    }
  },
  "profitBeforeTax": {
    "name": "LABA SEBELUM PAJAK",
    "current": 238000000000,
    "previous": 191000000000
  },
  "taxExpense": {
    "name": "PAJAK PENGHASILAN BADAN",
    "current": -52360000000,
    "previous": -42020000000
  },
  "netProfit": {
    "name": "LABA BERSIH TAHUN INI",
    "current": 185640000000,
    "previous": 148980000000
  },
  "earningsPerShare": {
    "basic": {
      "name": "Laba Per Saham (Dasar)",
      "current": 1856400,
      "previous": 1489800
    }
  },
  "generatedAt": "2024-06-28T10:30:00Z",
  "auditTrail": {
    "status": "FINALIZED",
    "lastModified": "2024-06-28T10:30:00Z"
  }
}
```

### 4.3 Generate Cash Flow Statement API

```
GET /api/v1/reporting/statements/cash-flow

Query Parameters:
├─ period: "202412"
├─ method: "DIRECT" | "INDIRECT" (default: INDIRECT)
├─ includePrevious: true
└─ export: "PDF" | "EXCEL"

Response (200):
{
  "reportType": "CASH_FLOW",
  "method": "INDIRECT",
  "operatingActivities": {
    "netProfit": 185640000000,
    "adjustments": {
      "depreciation": 45000000000,
      "badDebtProvision": 10000000000,
      "employeeBenefitProvision": 5000000000
    },
    "workingCapitalChanges": {
      "accountsReceivableChange": -15000000000,
      "inventoryChange": -10000000000,
      "accountsPayableChange": 10000000000
    },
    "netCashFromOperating": 230640000000
  },
  "investingActivities": {
    "ppePurchase": -50000000000,
    "investmentSales": 20000000000,
    "netCashFromInvesting": -30000000000
  },
  "financingActivities": {
    "debtPayment": -25000000000,
    "dividendPaid": -40000000000,
    "netCashFromFinancing": -65000000000
  },
  "netCashChange": 135640000000,
  "cashBeginning": 45000000000,
  "cashEnding": 180640000000
}
```

### 4.4 Export Report API

```
POST /api/v1/reporting/export

Request Body:
{
  "reportType": "BALANCE_SHEET",
  "period": "202412",
  "format": "SAK-EP",
  "exportFormat": "PDF",
  "options": {
    "includeNotes": true,
    "includeComparative": true,
    "includeAuditTrail": false
  }
}

Response (200):
{
  "success": true,
  "downloadUrl": "https://clouderp.app/files/reports/BS-202412-ABC.pdf",
  "fileName": "Neraca_PT_ABC_Indonesia_31_Desember_2024.pdf",
  "mimeType": "application/pdf",
  "fileSize": 2500000,
  "generatedAt": "2024-06-28T10:30:00Z"
}
```

---

## 5. VALIDATION RULES

### 5.1 Balance Sheet Validation

```typescript
// Validasi Neraca

Rule 1: Balance (Fundamental)
├─ Total Assets = Total Liabilities + Total Equity
├─ Error: "Neraca tidak seimbang"
└─ Action: Block finalization

Rule 2: Asset Classification
├─ Current Assets: Expected realizable within 12 months
├─ Non-Current Assets: Expected beneficial > 12 months
└─ Error: "Akun tidak sesuai dengan klasifikasinya"

Rule 3: Comparative Balances
├─ Previous year closing = Current year opening
├─ Error: "Saldo pembukaan tidak sesuai dengan tahun sebelumnya"
└─ Warning: Inform user, allow with justification

Rule 4: Negative Balances
├─ Asset accounts should not be negative
├─ Liability accounts should not be negative
├─ Error: "Saldo negatif pada akun aset/kewajiban"
└─ Action: Investigate journal entries
```

### 5.2 Income Statement Validation

```typescript
// Validasi Laporan Laba Rugi

Rule 1: Mathematical Accuracy
├─ Gross Profit = Sales - COGS
├─ Operating Profit = Gross Profit - Operating Expenses
├─ Net Profit = Profit Before Tax - Tax Expense
└─ Error: "Kalkulasi tidak akurat"

Rule 2: Reasonable Ratios
├─ Gross Profit Margin: 10-50% (industry dependent)
├─ Operating Margin: 5-30%
├─ Net Profit Margin: 2-25%
└─ Warning: "Rasio di luar normal range"

Rule 3: Tax Calculation
├─ Tax Expense ≈ Profit Before Tax × 22%
├─ Allow variance for adjustments
└─ Error: "Beban pajak tidak sesuai perhitungan"

Rule 4: Revenue Recognition
├─ Revenue should be positive
├─ Returns < 5% of sales (typical)
└─ Warning: "Retur penjualan tidak wajar"
```

### 5.3 Cash Flow Validation

```typescript
// Validasi Laporan Arus Kas

Rule 1: Reconciliation
├─ Ending Cash = Beginning Cash + Net Cash Change
├─ Must equal Balance Sheet cash
└─ Error: "Arus kas tidak cocok dengan neraca"

Rule 2: Cash Flow Logic
├─ Operating Cash Flow ≥ 80% of Net Profit (normally)
├─ Warning if OCF << Net Profit
└─ Action: Review working capital changes

Rule 3: Financing Activities
├─ Debt payment should reduce total debt
├─ Error: "Pembayaran utang tidak sesuai dengan neraca"

Rule 4: Investing Activities
├─ PPE purchases should match capital expenditure
└─ Warning: "Pengeluaran investasi tidak sesuai"
```

---

## 6. CONTOH LAPORAN REAL

### 6.1 Contoh: PT ABC Indonesia (Manufaktur)

```
Silakan lihat file: 08-FINANCE-MODULE-INDONESIA.md
Section: 4. LAPORAN KEUANGAN SAK-EP/SAK

Sudah ada contoh lengkap laporan keuangan real dengan:
├─ Laporan Posisi Keuangan (Balance Sheet)
├─ Laporan Laba Rugi (Income Statement)
├─ Laporan Arus Kas (Cash Flow)
└─ Dengan angka-angka real dan formatting resmi
```

---

## 7. AUDIT TRAIL & COMPLIANCE

### 7.1 Audit Trail untuk Laporan

```typescript
// src/modules/reporting/entities/report-audit-trail.entity.ts

@Entity('finance_report_audit_trails')
export class ReportAuditTrail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  reportPeriodId: string;

  @Column('uuid')
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  action: string; // 'CREATED', 'FINALIZED', 'APPROVED', 'PUBLISHED'

  @Column({ type: 'varchar', length: 50 })
  status: string; // 'DRAFT', 'FINALIZED', 'APPROVED', 'PUBLISHED'

  @Column({ type: 'text', nullable: true })
  notes: string; // Catatan approval/rejection

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'varchar', length: 20 })
  ipAddress: string;

  @Column({ type: 'varchar', length: 255 })
  userAgent: string;
}
```

### 7.2 Access Control untuk Laporan

```
Roles & Permissions:

FINANCE_STAFF:
├─ Can view own period drafts
├─ Can edit own period journals
├─ Cannot finalize
└─ Cannot approve

FINANCE_MANAGER:
├─ Can view all periods
├─ Can edit all journals
├─ Can finalize period
├─ Cannot approve for publication
└─ Cannot publish

FINANCE_DIRECTOR:
├─ Can view all periods
├─ Can finalize
├─ Can approve for publication
├─ Can publish
└─ Full audit trail access

AUDIT_MANAGER:
├─ Can view all periods (read-only)
├─ Can view audit trails
├─ Cannot modify
└─ Can export for audit
```

---

## 8. COMPLIANCE CHECKLIST

### Pre-Publication Checklist

```
☐ Laporan Posisi Keuangan
  ├─ ☐ Total Assets = Total Liabilities + Equity
  ├─ ☐ Comparative dengan tahun sebelumnya
  ├─ ☐ Semua akun terisi
  └─ ☐ Tidak ada saldo negatif pada aset/kewajiban

☐ Laporan Laba Rugi
  ├─ ☐ Gross Profit dihitung dengan benar
  ├─ ☐ Operating Expenses terklasifikasi dengan benar
  ├─ ☐ Tax Expense sesuai perhitungan
  ├─ ☐ EPS dihitung (jika ada saham)
  └─ ☐ Comparative dengan tahun sebelumnya

☐ Laporan Arus Kas
  ├─ ☐ OCF, ICF, FCF dihitung dengan benar
  ├─ ☐ Ending Cash = Balance Sheet Cash
  ├─ ☐ Semua transaksi tercakup
  └─ ☐ Comparative dengan tahun sebelumnya

☐ Laporan Perubahan Ekuitas
  ├─ ☐ Opening balance sesuai tahun sebelumnya
  ├─ ☐ Net profit dari Income Statement
  ├─ ☐ Dividen tercatat dengan benar
  └─ ☐ Ending balance sesuai Balance Sheet

☐ Catatan atas Laporan Keuangan
  ├─ ☐ Informasi umum lengkap
  ├─ ☐ Kebijakan akuntansi dijelaskan
  ├─ ☐ Pengungkapan pajak lengkap
  ├─ ☐ Related party transactions (jika ada)
  └─ ☐ Peristiwa setelah tanggal neraca

☐ Approval Workflow
  ├─ ☐ Finance Manager finalized
  ├─ ☐ Finance Director approved
  ├─ ☐ Board of Directors reviewed (jika go-public)
  └─ ☐ Audit completed (jika required)

☐ Publication
  ├─ ☐ Publish date ditentukan
  ├─ ☐ Stakeholders notified
  ├─ ☐ Laporan tersimpan dengan aman
  └─ ☐ Digital signature applied
```

---

## 9. REPORTING WORKFLOW

```
LAPORAN KEUANGAN WORKFLOW

1. PREPARATION (Week 1-2)
   ├─ Close GL accounts
   ├─ Generate Trial Balance
   ├─ Review adjusting entries
   └─ Prepare working papers

2. DRAFT (Week 2-3)
   ├─ Generate financial statements (DRAFT)
   ├─ Review by Finance Manager
   ├─ Make corrections if needed
   └─ Status: DRAFT

3. FINALIZATION (Week 3)
   ├─ Finance Manager reviews
   ├─ All corrections completed
   ├─ Validate balances
   └─ Status: FINALIZED

4. APPROVAL (Week 3-4)
   ├─ Finance Director approves
   ├─ CEO approves (jika required)
   ├─ Board approves (jika public)
   └─ Status: APPROVED

5. PUBLICATION (Week 4)
   ├─ Sign reports digitally
   ├─ Generate final PDFs
   ├─ Publish to stakeholders
   ├─ File ke authorities
   └─ Status: PUBLISHED

6. ARCHIVAL
   ├─ Store original documents
   ├─ Maintain audit trail
   ├─ Backup digital copies
   └─ Retention: Minimum 30 years
```

---

## 10. FITUR TAMBAHAN

### 10.1 Analytical Reports

```
Dashboard Metrics:
├─ Financial Ratios
│  ├─ Liquidity Ratios (Current, Quick, Cash)
│  ├─ Solvency Ratios (Debt-to-Equity, Interest Coverage)
│  ├─ Profitability Ratios (ROA, ROE, Margins)
│  └─ Efficiency Ratios (Asset Turnover, DPO)
├─ Trend Analysis
│  ├─ Year-over-year changes
│  ├─ Percentage changes
│  └─ Growth rates
├─ Comparative Analysis
│  ├─ vs. Budget
│  ├─ vs. Industry benchmarks
│  └─ vs. Previous periods
└─ Management Reports
   ├─ Cash position analysis
   ├─ Profitability analysis
   └─ Forecast vs. actual
```

### 10.2 Tax Filing Integration

```
Automatic Tax Report Generation:
├─ SPT Tahunan (Annual Tax Return)
│  ├─ Laporan Keuangan schedule
│  ├─ Reconciliation PPh/PPN
│  └─ Tax adjustment details
├─ e-Filing Format
│  ├─ Generate XML/CSV
│  ├─ Validate against DJP requirements
│  └─ Submit electronically
└─ Certificate of Tax Compliance (SKT)
```

### 10.3 Regulatory Reporting

```
Reporting to Authorities:
├─ Kementerian Keuangan
│  ├─ Laporan Keuangan Tahunan
│  └─ KPP-related reports
├─ OJK (untuk emiten)
│  ├─ Quarterly statements
│  ├─ Annual audited statements
│  └─ Related party disclosures
├─ BEI (untuk emiten)
│  ├─ Laporan keuangan berkala
│  └─ Material information
└─ Bank (untuk peminjam)
   ├─ Monthly/quarterly statements
   └─ Covenant compliance reports
```

---

## KESIMPULAN

Dokumentasi ini memberikan panduan lengkap untuk **Financial Reporting** yang:

✅ **100% sesuai SAK-EP & SAK**  
✅ **Format laporan resmi Indonesia**  
✅ **Database schema production-ready**  
✅ **API specifications lengkap**  
✅ **Validation rules comprehensive**  
✅ **Audit trail & compliance**  
✅ **Workflow & approval process**  

**Implementasi dnPeople Reporting Module — COMPLETE (core).** Lihat [`12-PROJECT-STATUS.md`](12-PROJECT-STATUS.md).

---

**Version:** 1.0 Enterprise Ready  
**Standar:** SAK-EP & SAK  
**Last Updated:** June 2026


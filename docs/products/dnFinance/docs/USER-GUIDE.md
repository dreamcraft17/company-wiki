# dnFinance — User Guide

Panduan singkat + demo client 15 menit. Detail akun: [DEMO-ACCOUNTS.md](./DEMO-ACCOUNTS.md).

## Menjalankan aplikasi

```bash
cd dnFinance
npm install
cp .env.dev .env
npm run dev
```

- **Web:** http://localhost:5173  
- **API:** http://localhost:3000/api/v1  
- **Swagger:** http://localhost:3000/api/docs  

Tidak perlu Docker di mesin lokal.

## Login

1. Buka http://localhost:5173/login  
2. Klik **"Demo — PT Toko Sejahtera Nusantara"** atau masuk manual:
   - Email: `demo@dnaccounting.id`
   - Password: `demo123456`

## Menu utama

| Menu | Fungsi |
|------|--------|
| Dashboard | KPI revenue, net income, overdue, tax |
| Accounts | Chart of Accounts + department |
| Journal | Buat/post journal; approval workflow |
| General Ledger | Semua transaksi GL |
| Reports | TB, P&L (filter dept), BS, tax, scheduled reports |
| Customers / Invoices | AR + PPN |
| Vendors / Bills | AP + PPh 23 + approval |
| Inventory | Stock in/out |
| Import | COA, opening, customers, **vendors** |
| Admin | Users, tier limits |
| Audit | Audit trail |

## Approval via email (V2)

1. Submit bill/journal for approval  
2. Approver terima email (simulated di dev — cek `/email-log`)  
3. Klik link → halaman `/approve/:token`  
4. Approve atau reject tanpa login

## Demo script 15 menit

### 1. Dashboard (2 min)
KPI, overdue invoice, low stock alert.

### 2. Invoices & PPN (4 min)
Invoice PT Maju Jaya → PDF → Send → cek GL/Reports.

### 3. Bills & approval (4 min)
Login manager → approve bill → PPh 23 + GL posting.

### 4. Reports (3 min)
Trial Balance, P&L by department, e-Faktur CSV export.

### 5. Journal + Inventory (2 min)
Journal entry posted; inventory low stock.

## Reset demo

Login admin demo → `POST /api/v1/demo/reset` (Bearer token).

## Registrasi tenant baru

1. `/register` — pilih industri (retail, fnb, jasa, trading, manufac_kecil)  
2. COA template otomatis diterapkan  
3. Mulai buat transaksi

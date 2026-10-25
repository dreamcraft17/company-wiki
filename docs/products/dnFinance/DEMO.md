# dnAccounting — Client Demo Script (15 menit)

## Start

```bash
cd dnFinance
npm install
cp .env.dev .env
npm run dev
```

- **Web:** http://localhost:5173  
- **API:** http://localhost:3000/api/v1  
- **Demo info:** GET http://localhost:3000/api/v1/demo  

Tidak perlu Docker. Data disimpan di `apps/backend/.data/store.json`.

---

## Akun demo

| Role | Email | Password |
|------|-------|----------|
| Admin | demo@dnaccounting.id | demo123456 |
| Manager | manager@dnaccounting.id | demo123456 |
| Accountant | accountant@dnaccounting.id | demo123456 |

**Perusahaan:** PT Toko Sejahtera Nusantara (retail)

Atau klik **"Demo — PT Toko Sejahtera Nusantara"** di halaman login.

---

## Alur presentasi (15 menit)

### 1. Login & Dashboard (2 min)
- Klik tombol demo di login
- Tunjukkan KPI: revenue MTD, net income, invoice overdue, PPN payable, inventory low-stock

### 2. Invoices & PPN (4 min)
- Menu **Invoices** → invoice PT Maju Jaya (sent) dan Warung Bu Sari (**overdue**)
- Klik **PDF** → invoice dengan PPN 11%
- **Send** invoice draft → simulasi email ke customer
- Tunjukkan auto-posting ke GL (Journal / Reports)

### 3. Bills & Approval + PPh 23 (4 min)
- Logout → login **manager@dnaccounting.id**
- Menu **Bills** → banner **Pending approval**
- **Approve** bill CV Supplier Makmur → PPh 23 terpotong, GL expense + AP
- Kembali ke admin → lihat bill status **approved**

### 4. Reports & Compliance (3 min)
- Menu **Reports**
- Trial Balance, P&L, Balance Sheet
- Export **e-Faktur CSV** dan **GL CSV**
- Tax summary: PPN output, PPh 23, checklist compliance

### 5. Inventory & Journal (2 min)
- **Inventory** → Minyak Goreng 2L **low stock** (reorder alert)
- **Journal** → entry penjualan tunai harian (posted)

---

## Reset demo (opsional)

Login admin demo → `POST /api/v1/demo/reset` (Bearer token) untuk seed ulang data sample.

---

## Talking points

- Multi-tenant SaaS, RBAC (admin / manager / accountant)
- COA template per industri (5 industri)
- PPN 11% otomatis (PKP vs non-PKP)
- PPh 23 pada vendor yang applicable
- Approval workflow bills
- Audit trail (menu Audit)
- Export PDF invoice & laporan, CSV e-Faktur

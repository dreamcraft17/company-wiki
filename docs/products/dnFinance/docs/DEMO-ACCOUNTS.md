# dnAccounting — Demo Accounts

**Tenant:** PT Toko Sejahtera Nusantara (retail)  
**Auto-seed:** on backend startup via `demo-seed.ts`

## Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | demo@dnaccounting.id | demo123456 |
| Manager | manager@dnaccounting.id | demo123456 |
| Accountant | accountant@dnaccounting.id | demo123456 |

## Pre-seeded data

- COA template retail (Kas, Piutang, PPN, PPh 23, dll.)
- Customers: PT Maju Jaya, Warung Bu Sari
- Vendors: CV Supplier Makmur (PPh 23 applicable)
- Invoices: sent + **overdue**
- Bills: pending approval
- Inventory: Minyak Goreng 2L (**low stock**)
- Journal: penjualan tunai harian (posted)

## Quick login

Halaman login → tombol **"Demo — PT Toko Sejahtera Nusantara"**

## API

```bash
# Demo info
curl http://localhost:3000/api/v1/demo

# Reset (admin token required)
curl -X POST http://localhost:3000/api/v1/demo/reset \
  -H "Authorization: Bearer <token>"
```

## Roles untuk demo

| Role | Demo use |
|------|----------|
| Admin | Full access, reset demo, settings |
| Manager | Approve bills |
| Accountant | Create journal, invoices, bills |

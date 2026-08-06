# dnShop Finance — Akun Demo (Dummy MVP)

Password semua akun demo: **`Seller123!`**

| Role | Email | Akses |
|------|-------|--------|
| Owner / Seller | `seller@dnshop.id` | 2 toko, semua modul + pembukuan |
| Accountant | `accountant@dnshop.id` | Tim di kedua toko (role accountant) |

## Data dummy yang di-seed

Per toko (`Toko Demo Nusantara`, `Official Store Gayo`):

- **10 produk** (ada stok rendah & inactive)
- **~24 pesanan** berbagai status (pending → delivered / cancelled / returned)
- **Pembayaran + rekonsiliasi** (sebagian flagged)
- **Retur**, **settlement**, **payout** (completed + in_transit)
- **Tax draft** bulan berjalan
- **Bank statement** matched / unmatched / ambiguous
- **Sync log** selesai
- **v2.0 Pembukuan:** CoA SAK EMKM (45 akun), modal awal, auto-journal dari pesanan, beban operasional, 1+ PENDING approval, draft accountant
- **v2.1 / SOPI:** toko default tier `free` (100 lifetime); wizard onboarding siap; Shopee mock sampai partner key diisi

Buka UI:

| | Lokal | Production DN Tech |
|---|---|---|
| Login | http://localhost:6000/login | https://shop.dntech.id/login |
| Pembukuan | http://localhost:6000/journal | https://shop.dntech.id/journal |
| Dashboard charts | filter 7 hari / 30 hari / custom | sama |

## Jalankan seed

```bash
cd apps/backend
cp .env.example .env   # jika belum — pastikan DB_* mengarah ke DB yang sama dengan API
# Postgres native atau Supabase (DB_SSL=true) — lihat docs/DEPLOY-VPS.md
npm run seed

# refresh penuh data demo:
SEED_FORCE=true npm run seed
# atau: npm run seed:force
```

Tanpa kredensial `SHOPEE_*`, aplikasi tetap di **mode mock** — cocok untuk demo MVP.

Jika login production mengembalikan 401 “email/sandi salah”, jalankan seed terhadap Supabase di VPS (dari `apps/backend` dengan `.env` yang benar).

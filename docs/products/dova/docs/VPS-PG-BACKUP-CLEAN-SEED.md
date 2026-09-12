# Runbook: Backup + bersihkan seed/test di Postgres (VPS)

> **Status:** Active · **Last updated:** 2026-09-12 · **Author:** Dozer  
> **Audience:** Ops (SSH VPS + `psql`)  
> **Verified:** dump 2.5M di `~/dova/backup/` (2026-09-12); server Postgres **17.6** (Supabase pooler)  
> **Related:** [VPS-DEPLOY.md](./VPS-DEPLOY.md) · [ENV-SETUP.md](./ENV-SETUP.md) · [VPS-POSTGRES-STAGING.md](./VPS-POSTGRES-STAGING.md)

Satu alur: pasang `pg_dump` 17 → backup → login `psql` → hapus **semua** data demo (termasuk katalog seed), **sisakan** akun `admin@dova.local` dan `supplier@dova.local` (+ profil supplier, tanpa produk).

**Jangan** tempel password / `DATABASE_URL` lengkap ke git, wiki, atau tiket. Ambil URI dari `~/dova/apps/backend/.env`.

---

## Keep vs hapus

| Tetap | Hapus |
|-------|--------|
| User `admin@dova.local`, `supplier@dova.local` | User lain (customer, QA, `qa.softlaunch.*`) |
| `supplier_profiles` milik supplier contoh (akun login) | Supplier lain |
| `categories` (taxonomy; wajib add product) | **Semua** `products` (termasuk katalog seed Green Valley) |
| `schema_migrations` | Order, cart, payment, stock, contact, semua feedback post/comment, semua `user_sessions` |

Kalau admin prod **bukan** `admin@dova.local`, tambah emailnya di `IN (...)` sebelum `DELETE FROM users`.

---

## 0. Connection string untuk `psql` / `pg_dump`

Supabase URI di env sering punya `uselibpqcompat=true` — **hapus** query itu. Password `!` di URI = `%21`.

```bash
# contoh bentuk (bukan secret sungguhan)
# postgresql://USER:PASS@aws-1-….pooler.supabase.com:5432/postgres?sslmode=require
```

Simpan ke variabel di sesi SSH saja:

```bash
# paste URI tanpa uselibpqcompat
export DOVA_PG='postgresql://USER:PASS@HOST:5432/postgres?sslmode=require'
```

---

## 1. Client Postgres 17 (wajib)

Server **17.6**. `pg_dump` Ubuntu default **16** gagal: `server version mismatch`.

```bash
sudo apt update
sudo apt install -y postgresql-common
echo | sudo /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh
sudo apt update
sudo apt install -y postgresql-client-17
/usr/lib/postgresql/17/bin/pg_dump --version
```

Harus `17.x` (contoh 17.11). Script PGDG kadang nanya **Press Enter** — tekan Enter, atau pakai `echo |` seperti di atas.

Jangan reboot VPS hanya untuk dump. Warning kernel `needrestart` boleh diabaikan.

`pg_dump` / `psql` **tanpa path** bisa masih v16. Selalu:

```text
/usr/lib/postgresql/17/bin/pg_dump
/usr/lib/postgresql/17/bin/psql
```

---

## 2. Backup (`pg_dump`)

Folder yang dipakai di VPS: `~/dova/backup`. **Jangan** `git add` `.dump`.

```bash
mkdir -p ~/dova/backup
cd ~/dova/backup

/usr/lib/postgresql/17/bin/pg_dump \
  "$DOVA_PG" \
  --no-owner --no-acl \
  -Fc \
  -f ~/dova/backup/dova-prod-$(date +%Y%m%d-%H%M).dump

ls -lh ~/dova/backup/dova-prod-*.dump
```

Sukses: file **> 0** (contoh kerja: ~2.5M). Tunggu dump selesai sebelum `ls`.

Kalau pooler error, ganti URI **direct** dari dashboard Supabase (`db.<project>.supabase.co`, port `5432`).

---

## 3. Login `psql`

```bash
/usr/lib/postgresql/17/bin/psql "$DOVA_PG"
```

Prompt `postgres=>`. Cek tabel:

```sql
\dt
```

Prod (2026-09-12) punya 16 tabel termasuk `users`, `products`, `orders`, `feedback_*`, `schema_migrations`. **Tidak** ada `chat_identities` — jangan `DELETE` tabel itu.

Keluar: `\q`

---

## 4. Hapus seed / test (prod — katalog ikut kosong)

Di `postgres=>` paste **sekali**. **Jangan `COMMIT`** sebelum `SELECT` terakhir oke.

Versi lama yang `DELETE FROM products WHERE supplier_id NOT IN keep_suppliers` **menyisakan** SKU seed. Untuk prod pakai `DELETE FROM products` tanpa filter.

```sql
BEGIN;

SELECT email, role FROM users ORDER BY role, email;
SELECT COUNT(*) AS products_before FROM products;
SELECT COUNT(*) AS orders_before FROM orders;

CREATE TEMP TABLE keep_users AS
SELECT id FROM users
WHERE email IN ('admin@dova.local', 'supplier@dova.local');

CREATE TEMP TABLE keep_suppliers AS
SELECT sp.id
FROM supplier_profiles sp
JOIN keep_users k ON k.id = sp.user_id;

DELETE FROM payment_logs;
DELETE FROM stock_adjustments;
DELETE FROM order_items;
DELETE FROM orders;

DELETE FROM cart_items;
DELETE FROM carts;

DELETE FROM products;

UPDATE supplier_profiles
SET verified_by = NULL
WHERE verified_by IS NOT NULL
  AND verified_by NOT IN (SELECT id FROM keep_users);

DELETE FROM supplier_profiles
WHERE id NOT IN (SELECT id FROM keep_suppliers);

DELETE FROM feedback_comments;
DELETE FROM feedback_posts;
DELETE FROM contact_submissions;
DELETE FROM user_sessions;

DELETE FROM users
WHERE id NOT IN (SELECT id FROM keep_users);

SELECT email, role FROM users;
SELECT business_name, verification_status FROM supplier_profiles;
SELECT COUNT(*) AS products_left FROM products;
SELECT COUNT(*) AS orders_left FROM orders;
SELECT COUNT(*) AS users_left FROM users;
```

Harus: **2 user**, **0 products**, **0 orders**, 1 supplier profile. Lalu:

```sql
COMMIT;
```

Salah:

```sql
ROLLBACK;
```

Kalau error “relation does not exist”, `ROLLBACK;` lalu ulangi tanpa `DELETE` tabel yang tidak ada.

**Jangan** `npm run db:seed` / `db:sync-catalog` di VPS setelah ini — itu mengisi katalog demo lagi.

---

## 5. Restore (kalau rusak)

```bash
/usr/lib/postgresql/17/bin/pg_restore --no-owner --no-acl \
  -d "$DOVA_PG" \
  ~/dova/backup/dova-prod-YYYYMMDD-HHMM.dump
```

Ganti nama file sesuai dump yang ada. Restore ke DB yang **sudah terisi** bisa bentrok unique — butuh DB kosong atau `--clean` (bahaya di prod; pikir dulu).

---

## 6. Git

Di clone `~/dova`, folder `backup/` jangan di-commit. Tambah `backup/` di `.gitignore` lokal atau simpan dump di luar repo.

---

## Troubleshooting

| Gejala | Arti |
|--------|------|
| `server version mismatch` 16 vs 17.6 | Pakai `/usr/lib/postgresql/17/bin/pg_dump` |
| PGDG nanya Enter | Tekan Enter atau `echo \| sudo …apt.postgresql.org.sh` |
| `uselibpqcompat` / URI aneh di psql | Buang query param itu |
| `password authentication failed` | `%21` untuk `!`; cek URI dari `.env` |

*Author: Dozer · 2026-09-12*

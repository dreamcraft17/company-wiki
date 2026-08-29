# Akses PostgreSQL di VPS (Manual)

Panduan singkat untuk masuk ke database production/staging dntech di VPS — cek data, debug, atau query manual.

**Author:** Dozer  
**Owner:** Dozer · **Company:** DN Tech  
**UpdatedAt:** August 29, 2026  
**Stack:** PostgreSQL 16 · Ubuntu 24.04 (Noble) · Prisma ORM

---

## Ringkasan koneksi

| Item | Nilai |
|------|--------|
| Host | `localhost` (dari VPS yang sama) |
| Port | `5432` |
| Database | `dntech` |
| App user | `dntech_user` |
| Superuser OS | `postgres` (via `sudo -u postgres`) |
| Connection string (`.env`) | `postgresql://dntech_user:PASSWORD@localhost:5432/dntech?schema=public` |
| Lokasi `.env` | `~/dntech/backend/.env` |

> Password app ada di `~/dntech/backend/.env` → field `DATABASE_URL`.  
> Jangan paste password ke terminal bash jika mengandung `!` (history expansion).

---

## 1. Masuk sebagai app user (`dntech_user`)

### Cara aman (password di env, sekali pakai)

```bash
cd ~/dntech/backend
export $(grep -v '^#' .env | grep DATABASE_URL | xargs)
psql "$DATABASE_URL"
```

### Cara manual — **pakai single quotes** jika password ada `!`

```bash
psql 'postgresql://dntech_user:PASSWORD@localhost:5432/dntech'
```

Ganti `PASSWORD` dengan password asli dari `.env`.

### Alternatif: flag terpisah

```bash
PGPASSWORD='PASSWORD' psql -h localhost -U dntech_user -d dntech
```

### Encode `!` di URL (double quotes aman)

```bash
psql "postgresql://dntech_user:PASSWORD%21@localhost:5432/dntech"
```

(`!` → `%21`)

---

## 2. Masuk sebagai superuser (`postgres`)

Untuk create user, grant, atau operasi admin:

```bash
sudo -u postgres psql
```

Atau langsung ke database `dntech`:

```bash
sudo -u postgres psql -d dntech
```

Keluar dari psql:

```text
\q
```

---

## 3. Cek service Postgres

```bash
sudo systemctl status postgresql
sudo systemctl status postgresql@16-main
sudo ss -tlnp | grep 5432
```

Start / restart jika perlu:

```bash
sudo systemctl start postgresql
sudo systemctl restart postgresql@16-main
```

---

## 4. Perintah psql yang sering dipakai

Di dalam psql:

| Perintah | Fungsi |
|----------|--------|
| `\l` | List semua database |
| `\c dntech` | Connect ke database dntech |
| `\dt` | List semua tabel |
| `\d products` | Struktur tabel `products` |
| `\du` | List user/role |
| `\q` | Keluar |

---

## 5. Query berguna untuk dntech

### Cek koneksi

```sql
SELECT current_database(), current_user, version();
```

### List tabel

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Produk (halaman `/products`)

```sql
SELECT id, name, slug, category, status, featured, display_order, launch_status
FROM products
WHERE deleted_at IS NULL
ORDER BY display_order;
```

### Detail satu produk

```sql
SELECT name, slug, tagline, status, launch_status, customer_count
FROM products
WHERE slug = 'dnpeople';
```

### Admin user

```sql
SELECT id, email, name, role, is_active, last_login
FROM users
WHERE deleted_at IS NULL;
```

### Site settings

```sql
SELECT id, company_name, company_email, tagline
FROM site_settings;
```

### Lead / form submission terbaru

```sql
SELECT id, form_type, status, created_at, email
FROM form_submissions
ORDER BY created_at DESC
LIMIT 20;
```

### Hitung baris per tabel utama

```sql
SELECT 'products' AS tbl, COUNT(*) FROM products
UNION ALL SELECT 'services', COUNT(*) FROM services
UNION ALL SELECT 'blog_posts', COUNT(*) FROM blog_posts
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'form_submissions', COUNT(*) FROM form_submissions;
```

---

## 6. One-liner dari shell (tanpa masuk interaktif)

```bash
PGPASSWORD='PASSWORD' psql -h localhost -U dntech_user -d dntech -c "SELECT slug, status FROM products ORDER BY display_order;"
```

Atau baca URL dari `.env`:

```bash
cd ~/dntech/backend
psql "$(grep DATABASE_URL .env | cut -d= -f2- | tr -d '"')" -c "SELECT COUNT(*) FROM products;"
```

---

## 7. Prisma CLI (alternatif)

Dari folder backend — otomatis pakai `DATABASE_URL` di `.env`:

```bash
cd ~/dntech/backend

# Buka Prisma Studio (UI browser) — hati-hati di production
npx prisma studio

# Cek schema vs DB
npx prisma db pull --print

# Status migrate/push
npx prisma migrate status
```

> **Production:** `prisma studio` expose data lewat port lokal. Pakai hanya via SSH tunnel, jangan expose ke internet.

---

## 8. SSH tunnel (akses dari laptop lokal)

Postgres di VPS **hanya listen localhost**. Dari laptop, pakai skrip (baca `DATABASE_URL` dari `.env` di VPS, forward ke `127.0.0.1:5433`):

```bash
cd backend
chmod +x ../scripts/db-vps.sh
npm run db:vps:tunnel          # buka tunnel + tulis .env.vps (gitignored)
npm run db:vps -- with npm run db:seed-products
npm run db:vps -- psql         # query interaktif
npm run db:vps -- stop
```

Default SSH host: `dntech` (lihat `~/.ssh/config`). Override: `SSH_HOST=dntech2 npm run db:vps:tunnel`.

Manual (tanpa skrip):

```bash
ssh -L 5433:127.0.0.1:5432 dntech
```

Lalu client:

- Host: `127.0.0.1`
- Port: `5433`
- Database / user: sama seperti `DATABASE_URL` di VPS `~/dntech/backend/.env`

---

## 9. Backup & restore cepat

### Backup

```bash
PGPASSWORD='PASSWORD' pg_dump -h localhost -U dntech_user -d dntech -F c -f ~/dntech-backup-$(date +%F).dump
```

### Restore (hati-hati — overwrite data)

```bash
PGPASSWORD='PASSWORD' pg_restore -h localhost -U dntech_user -d dntech --clean --if-exists ~/dntech-backup-YYYY-MM-DD.dump
```

Superuser alternative:

```bash
sudo -u postgres pg_dump dntech > ~/dntech-backup-$(date +%F).sql
```

---

## 10. Troubleshooting

| Gejala | Penyebab | Solusi |
|--------|----------|--------|
| `Can't reach database server at localhost:5432` | Postgres belum jalan | `sudo systemctl start postgresql` |
| `-bash: !@localhost: event not found` | Bash history expansion pada `!` | Pakai **single quotes** atau `PGPASSWORD=` |
| `password authentication failed` | Password/user salah | Cek `DATABASE_URL` di `.env` |
| `permission denied for schema public` | Grant belum lengkap | Lihat §11 |
| `relation "products" does not exist` | Schema belum di-push | `npx prisma db push` |

---

## 11. Setup awal DB (referensi — sudah dijalankan sekali)

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE dntech;
CREATE USER dntech_user WITH ENCRYPTED PASSWORD 'GANTI_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE dntech TO dntech_user;
ALTER DATABASE dntech OWNER TO dntech_user;
```

```bash
sudo -u postgres psql -d dntech -c "GRANT ALL ON SCHEMA public TO dntech_user;"
sudo -u postgres psql -d dntech -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dntech_user;"
sudo -u postgres psql -d dntech -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dntech_user;"
```

Push schema + seed:

```bash
cd ~/dntech/backend
npx prisma db push
npm run db:seed
npm run db:seed-products
```

---

## 12. Keamanan

- Jangan expose port `5432` ke internet publik (firewall / bind `localhost` only).
- Jangan commit `.env` ke git.
- Ganti password default setelah go-live stabil.
- Query `UPDATE` / `DELETE` di production — selalu pakai `BEGIN;` … cek … `COMMIT;` atau `ROLLBACK;`.

Contoh transaksi aman:

```sql
BEGIN;
UPDATE products SET featured = false WHERE slug = 'contoh';
SELECT slug, featured FROM products WHERE slug = 'contoh';
-- Jika OK:
COMMIT;
-- Jika salah:
-- ROLLBACK;
```

---

## Related

- [DEPLOYMENT-PRODUCTION.md](./DEPLOYMENT-PRODUCTION.md)
- [MULTI-PRODUCT-PLAYBOOK.md](./MULTI-PRODUCT-PLAYBOOK.md)

---

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026

# Deploy dnShop Finance di VPS (tanpa Docker)

Aplikasi **tidak bergantung Docker**. Yang wajib: **Node.js 20+** + **PostgreSQL 15+** (native atau Supabase).  
Redis opsional — kosongkan `REDIS_HOST` maka sync/laporan jalan **inline**.

**Contoh DN Tech production**

| | |
|---|---|
| Path | `/var/www/dntech/dnshopee` |
| Web | `https://shop.dntech.id` → `127.0.0.1:6000` (`dnshop-web`) |
| API | `https://api.shop.dntech.id` → `127.0.0.1:6001` (`dnshop-api`) |
| DB | Supabase pooler + `DB_SSL=true` |
| `.env` | `apps/backend/.env` dan `apps/frontend/.env` (bukan root repo) |

---

## 1. Database

### Opsi A — Supabase (disarankan jika tidak mau Postgres lokal)

Di dashboard Supabase → **Connect** → Shared pooler, isi `.env` backend:

```env
DB_HOST=aws-0-ap-northeast-1.pooler.supabase.com
DB_PORT=5432
DB_USERNAME=postgres.YOUR_PROJECT_REF
DB_PASSWORD=YOUR_DATABASE_PASSWORD
DB_DATABASE=postgres
DB_SSL=true
NODE_ENV=production
```

Catatan:
- Password dengan karakter khusus (`@`, `#`, `%`, dll.) **boleh** di `DB_PASSWORD` apa adanya (bukan URL-encode) karena kita pakai field terpisah, bukan connection string.
- Host yang mengandung `supabase.com` otomatis mengaktifkan SSL.
- Setelah start production, TypeORM menjalankan migration otomatis.
- Seed: `npm run seed` dari `apps/backend` (file memuat dotenv dari `.env`).

Uji cepat dari VPS:

```bash
psql "postgresql://postgres.REF:PASSWORD@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require" -c 'SELECT 1'
```

### Opsi B — PostgreSQL native (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql

sudo -u postgres psql <<'SQL'
CREATE USER dnshop WITH PASSWORD 'GANTI_PASSWORD_KUAT';
CREATE DATABASE dnshop_finance OWNER dnshop;
GRANT ALL PRIVILEGES ON DATABASE dnshop_finance TO dnshop;
\c dnshop_finance
GRANT ALL ON SCHEMA public TO dnshop;
SQL
```

> Biarkan Postgres **listen localhost saja**. Jangan buka 5432 ke internet.

---

## 2. Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # >= 20
```

---

## 3. Backend

```bash
cd /var/www/dntech/dnshopee/apps/backend   # sesuaikan path
cp .env.example .env
nano .env
```

Isi minimal production (contoh DN Tech):

```env
NODE_ENV=production
PORT=6001
APP_URL=https://api.shop.dntech.id
CORS_ORIGINS=https://shop.dntech.id
JWT_SECRET=minimal-32-karakter-random-yang-kuat

DB_HOST=aws-0-....pooler.supabase.com
DB_PORT=5432
DB_USERNAME=postgres.YOUR_REF
DB_PASSWORD=...
DB_DATABASE=postgres
DB_SSL=true

REDIS_HOST=
ENABLE_JOURNALING=true
```

```bash
npm ci
npm run build
pm2 start dist/main.js --name dnshop-api
# atau: pm2 restart dnshop-api --update-env
pm2 save && pm2 startup
```

---

## 4. Frontend

```bash
cd /var/www/dntech/dnshopee/apps/frontend
```

```env
NEXT_PUBLIC_API_URL=https://api.shop.dntech.id/api/v1
NEXT_PUBLIC_ENABLE_JOURNALING=true
```

> `NEXT_PUBLIC_*` hanya terbaca saat **`npm run build`**. Ganti URL → rebuild wajib.

```bash
npm ci
npm run build
pm2 start npm --name dnshop-web -- start
# package.json start sudah -p 6000
```

---

## 5. Reverse proxy (nginx) + SSL

Contoh DN Tech:

```nginx
# shop.dntech.id → 6000
server {
  server_name shop.dntech.id;
  location / {
    proxy_pass http://127.0.0.1:6000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

# api.shop.dntech.id → 6001  (pastikan port benar, bukan 6101)
server {
  server_name api.shop.dntech.id;
  location / {
    proxy_pass http://127.0.0.1:6001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

```bash
sudo certbot --nginx -d shop.dntech.id
sudo certbot --nginx -d api.shop.dntech.id
```

### Cloudflare & SSL `api.shop.*`

Universal SSL Cloudflare **gratis** mencakup `*.dntech.id` (satu level), **bukan** `api.shop.dntech.id`.

| Opsi | Cara |
|------|------|
| **A (dipakai sekarang)** | Record `api.shop` → **DNS only** (abu-abu) + cert Let's Encrypt di origin |
| **B** | Pakai hostname satu level mis. `shop-api.dntech.id` (Proxied OK) + update `NEXT_PUBLIC_API_URL` |

Kalau Proxied + Universal SSL: browser sering `ERR_SSL_VERSION_OR_CIPHER_MISMATCH`.

---

## 6. Deploy update kode

```bash
cd /var/www/dntech/dnshopee
git pull

cd apps/backend && npm ci && npm run build && pm2 restart dnshop-api
cd ../frontend && npm ci && npm run build && pm2 restart dnshop-web

curl -s https://api.shop.dntech.id/api/v1/auth/health
# {"ok":true,"service":"dnshop-finance-api"}
```

---

## 7. Yang tidak perlu

| Komponen | Di VPS tanpa Docker |
|----------|---------------------|
| `docker compose` | **Tidak dipakai** |
| Redis | **Opsional** — kosongkan `REDIS_HOST` |
| Docker volume | Diganti Postgres native / Supabase |

---

## 8. Cek cepat

```bash
curl -s http://127.0.0.1:6001/api/v1/auth/health
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:6001/api/v1/auth/me   # 401
curl -sI http://127.0.0.1:6000
pm2 status
```

---

## 9. Operasional v2.1 / SOPI (Shopee go-live)

- Runbook insiden: `docs/RUNBOOK-INCIDENT.md`
- UAT cohort: `docs/UAT-PLAYBOOK-v2.1.md`
- Spec: `prd/sopi/` (OAuth, order/income sync, webhook, tier 100/5000)

### Env Shopee + SMTP (production)

```env
SHOPEE_PARTNER_ID=...
SHOPEE_PARTNER_KEY=...
SHOPEE_WEBHOOK_SECRET=...
SHOPEE_REDIRECT_URL=https://api.shop.dntech.id/api/v1/auth/shopee-callback
SHOPEE_TOKEN_ENCRYPTION_KEY=...
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
SMTP_FROM=dnShop Finance <noreply@dnshop.id>
TIER_ENFORCE=true
TIER_FREE_LIMIT=100
TIER_STARTER_LIMIT=5000
TOKEN_REFRESH_INTERVAL_HOURS=3
ORDER_SYNC_TIME=06:00
PAYMENT_SYNC_TIME=08:00
REDIS_HOST=127.0.0.1   # disarankan untuk OAuth state + queue
```

### Webhook Shopee

Daftarkan di Partner Console:

`https://api.shop.dntech.id/api/v1/webhooks/shopee`

Response cepat `{ "code": 0 }`. HMAC: `HMAC-SHA256(partner_key, shop_id + timestamp + JSON.stringify(data))`.

### Cron internal (Asia/Jakarta)

| Jadwal | Tugas |
|--------|--------|
| setiap 3 jam | Refresh token (hanya jika expire &lt; 30 menit) |
| 06:00 | Order sync (`get_order_list` + detail) |
| 08:00 | Income sync (`get_income_detail`) + auto-journal |

### Rollback tier

```bash
# Di apps/backend/.env
TIER_ENFORCE=false
pm2 restart dnshop-api --update-env
```

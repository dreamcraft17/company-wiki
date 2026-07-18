# Production Deployment (Ubuntu + PostgreSQL)

**Owner:** Dozer (CEO + Tech Lead)  
**Company:** DN Tech (PT. Dozer Napitupulu Technology)  
**Brand:** DN Tech (DN Tech.id)  
**UpdatedAt:** July 18, 2026  

## 1. PostgreSQL

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE dntech;
CREATE USER dntech_user WITH ENCRYPTED PASSWORD 'dntech2026!';
GRANT ALL PRIVILEGES ON DATABASE dntech TO dntech_user;
ALTER DATABASE dntech OWNER TO dntech_user;
\c dntech
GRANT ALL ON SCHEMA public TO dntech_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dntech_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dntech_user;
\q
```

> Password dengan karakter `!` **hanya aman di file `.env`**, jangan paste langsung ke terminal bash (history expansion).

## 2. Backend `.env`

Edit via `nano` (bukan paste ke shell):

```env
NODE_ENV=production
PORT=4000
TRUST_PROXY=1
DATABASE_URL="postgresql://dntech_user:dntech2026!@localhost:5432/dntech?schema=public"
JWT_SECRET="GANTI_DENGAN_STRING_RANDOM_PANJANG_MIN_32_KARAKTER"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_EXPIRES_IN="7d"
FRONTEND_URL="https://www.dntech.id,https://dntech.id"
UPLOAD_DIR=./uploads
ADMIN_EMAIL=admin@dntech.id
ADMIN_PASSWORD=Admin@123456
```

Encode `!` di URL jika perlu: `dntech2026%21`

## 3. Install & build backend

```bash
cd /var/www/dntech/backend

# Pastikan server bisa akses internet ke Prisma CDN
curl -I https://binaries.prisma.sh

npm install

# Jika postinstall gagal, jalankan manual:
npx prisma generate

npm run build
npx prisma db push
npm run db:seed
```

### Prisma generate gagal (network)

```bash
# Cek DNS & HTTPS
ping -c 2 binaries.prisma.sh
curl -fsSL https://binaries.prisma.sh/all_commits/c2990dca591cba766e3b7ef5d9e8a84796e47ab7/debian-openssl-3.0.x/schema-engine.gz.sha256

# Retry dengan debug
DEBUG="prisma:*" npx prisma generate

# Alternatif: build di mesin lokal, deploy artifact (node_modules + dist)
```

Error TypeScript seperti `UserRole` / `LeadStatus` not exported **hampir selalu** karena `@prisma/client` belum ter-generate — bukan bug kode.

## 4. Process manager (PM2)

```bash
npm install -g pm2
pm2 start dist/index.js --name dntech-api
pm2 save
pm2 startup
```

## 5. Frontend

**Penting:** `NEXT_PUBLIC_*` di-embed saat `npm run build`. Tanpa ini, browser user akan fetch ke `localhost:4000` → **Failed to fetch**.

```bash
cd /var/www/dntech/frontend
nano .env.local
```

Isi `.env.local` (sesuaikan jika API di subdomain atau path yang sama):

```env
NEXT_PUBLIC_API_URL=https://api.dntech.id/api/v1
NEXT_PUBLIC_SITE_URL=https://www.dntech.id
```

Atau jika Nginx proxy `/api` ke backend di domain yang sama:

```env
# Pastikan path /api benar-benar di-proxy ke backend — jika 404, gunakan subdomain api:
NEXT_PUBLIC_API_URL=https://api.dntech.id/api/v1
NEXT_PUBLIC_SITE_URL=https://www.dntech.id
```

> **Penting:** `https://www.dntech.id/api/v1` atau `https://dntech.id/api` sering mengembalikan 404. Gunakan `https://api.dntech.id/api/v1` untuk build production agar `/about` dan halaman CMS lain fetch data dengan benar.

Resolver API frontend juga memiliki pengaman production: nilai `localhost`/`127.0.0.1` otomatis diarahkan ke `https://api.dntech.id/api/v1`, dan URL lama pada domain utama dinormalisasi ke subdomain API. Listing serta detail produk publik memakai resolver yang sama dengan admin. Pengaman ini bukan pengganti konfigurasi deployment yang benar; tetap set `.env.local` seperti di atas dan rebuild frontend karena nilai `NEXT_PUBLIC_*` tertanam saat build.

```bash
npm install
npm run build
pm2 restart dntech-web   # atau: pm2 start npm --name dntech-web -- start
```

Verifikasi di browser DevTools → Network: request harus ke `https://api.dntech.id/...`, **bukan** `localhost:4000`.

> **Penting — `output: standalone`:** `next.config.ts` memakai `output: 'standalone'` (dibutuhkan Dockerfile). `next start` **tidak kompatibel** dengan mode ini dan akan memunculkan warning `"next start" does not work with "output: standalone"` di PM2 log. Perbaikan: `npm run build` sekarang otomatis menjalankan `postbuild` yang menyalin `public/` dan `.next/static` ke `.next/standalone/`, dan `npm start` menjalankan `node .next/standalone/server.js` langsung — jadi command PM2 di atas (`pm2 restart dntech-web` / `pm2 start npm --name dntech-web -- start`) tidak perlu diubah, hanya perlu `npm run build` ulang setelah pull perbaikan ini agar `postbuild` membuat folder `.next/standalone/` yang lengkap.

## 6. Nginx (contoh)

**Frontend** — `www.dntech.id` → `:3000`:

```nginx
server {
    listen 443 ssl;
    server_name www.dntech.id dntech.id;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Backend API** — `api.dntech.id` → `:4000`:

```nginx
server {
    listen 443 ssl;
    server_name api.dntech.id;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Alternatif:** proxy `/api` di domain utama (tanpa subdomain):

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:4000/api/;
    proxy_set_header Host $host;
}
```

## Checklist

- [ ] `schema.prisma` provider = `postgresql`
- [ ] `.env` DATABASE_URL benar (file, bukan shell)
- [ ] `npx prisma generate` sukses
- [ ] `npm run build` sukses
- [ ] `npx prisma db push` + `npm run db:seed`
- [ ] JWT_SECRET diganti random
- [ ] `frontend/.env.local` → `NEXT_PUBLIC_API_URL` production
- [ ] Frontend **rebuild** setelah ubah `.env.local`
- [ ] `/products` dan satu detail produk aktif tampil setelah rebuild
- [ ] Backend `FRONTEND_URL` mencakup `https://dntech.id` dan `https://www.dntech.id`

| | |
|---|---|
| Owner | Dozer (CEO + Tech Lead) |
| Company | DN Tech (PT. Dozer Napitupulu Technology) |
| Brand | DN Tech (DN Tech.id) |
| UpdatedAt | July 18, 2026 |

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026

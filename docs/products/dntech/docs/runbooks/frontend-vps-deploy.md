# Runbook: dntech-web (frontend VPS)

> **Author:** Dozer  
> **Date:** 2026-08-29  
> **Last verified:** 2026-08-29  
> **On-call:** Dozer  
> **PM2:** `dntech-web` · cwd `/home/dntech/dntech/frontend` · port `3000`

| Field | Value |
|-------|--------|
| Service | Next.js 16 standalone (`npm start` → `node .next/standalone/server.js`) |
| Public | `https://www.dntech.id` / `https://dntech.id` |
| Depends on | `dntech-api` (`:4000` / `https://api.dntech.id`) |
| SSH | host alias `dntech` |

Jangan paste isi `.env`, password, atau `DATABASE_URL` ke chat / git.

## Overview

Company-profile frontend. Build memakai `output: 'standalone'`. `postbuild` menyalin `public/` dan `.next/static` ke `.next/standalone/`. Restart PM2 **sebelum** `npm run build` selesai (termasuk `postbuild`) membuat HTML di memori masih menunjuk hash CSS lama sementara file CSS baru menimpa disk → halaman polos (serif, link ungu).

Incident 2026-08-29 17:38–17:41 WIB: HTML minta `/_next/static/chunks/27lsemgt_flmj.css` (404); disk hanya `2x9xnotfc7qwe.css`. Perbaikan: `pm2 restart dntech-web` **setelah** build selesai. CSS origin 200.

## Preconditions

- SSH `dntech` (BatchMode).
- Repo di VPS: `~/dntech` (bukan `/var/www/dntech` — path aktual).
- `frontend/.env.local` sudah `NEXT_PUBLIC_API_URL=https://api.dntech.id/api/v1` dan `NEXT_PUBLIC_SITE_URL=https://www.dntech.id`.
- CI `main` hijau opsional; deploy VPS adalah `git pull` + build, bukan GitHub Actions deploy.

## Start / stop

```bash
ssh dntech
pm2 list | grep dntech-web
pm2 restart dntech-web    # hanya jika artifact standalone SUDAH lengkap
pm2 stop dntech-web
pm2 logs dntech-web --lines 80
```

Jangan `next start`. Script PM2: `npm start` di cwd frontend.

## Health checks

Frontend tidak punya `/health`. Cek proses + stylesheet (bukan hanya HTML 200).

```bash
# Di VPS
ss -lptn | grep 3000
pm2 show dntech-web | sed -n '1,25p'
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/

# Hash CSS di HTML vs file di disk harus SAMA
HTML_CSS=$(curl -sS http://127.0.0.1:3000/ | grep -oE '/_next/static/chunks/[^"]+\.css' | head -1)
echo "html: $HTML_CSS"
ls -l ~/dntech/frontend/.next/standalone/.next/static/chunks/*.css
curl -sS -o /dev/null -w '%{http_code} %{content_type} %{size_download}\n' "http://127.0.0.1:3000${HTML_CSS}"

# Publik
curl -sS -o /dev/null -w '%{http_code}\n' https://www.dntech.id/
curl -sS https://www.dntech.id/ | grep -oE '/_next/static/chunks/[^"]+\.css' | head -1
```

API:

```bash
curl -sf https://api.dntech.id/health
```

**Expected:** HTML 200, CSS path 200, `content-type` `text/css`, size puluhan KB (bukan `Not Found`).

## Deployment checklist

Urutan ini **wajib**. Restart di tengah build adalah trigger insiden CSS.

1. Laptop: commit di `main` sudah di-push (`git status` clean vs `origin/main`).
2. VPS:

```bash
ssh dntech
cd ~/dntech
git fetch origin
git log -1 --oneline
git pull --ff-only origin main

cd ~/dntech/frontend
# JANGAN restart di sini
npm ci
npm run build
# Tunggu exit 0. postbuild harus menyalin static:
ls ~/dntech/frontend/.next/standalone/.next/static/chunks/*.css

pm2 restart dntech-web
sleep 2
# Smoke: hash HTML == file disk, CSS 200 (perintah Health Checks di atas)
```

3. Browser: hard-refresh `https://www.dntech.id/` — hero, token `--primary`, footer empat kolom.
4. 5–10 menit: `pm2 logs dntech-web --err --lines 30` tanpa loop crash.

## Rollback

**Trigger:** CSS 404; HTML tanpa stylesheet; `pm2` error loop; homepage blank setelah deploy.

1. VPS: `cd ~/dntech && git log -5 --oneline`
2. `git checkout <last-known-good-sha>` (contoh pre-hero: `da52085` jika hero commit yang di-rollback).
3. `cd frontend && npm run build` (**selesai dulu**).
4. `pm2 restart dntech-web`
5. Ulangi health CSS 200.
6. Kabari: rollback sha + waktu.

Tag release (opsional): `git tag` di laptop; di VPS `git fetch --tags && git checkout vX.Y.Z` lalu build + restart.

## Incident: halaman polos / CSS hilang

### Triage (5 menit)

- Gejala: Times/serif, link biru/ungu, layout satu kolom.
- Bukan: `globals.css` terhapus di git.
- Cek: `curl` CSS URL dari HTML → 404 `Not Found` vs JS 200.

### Diagnosis

```bash
ssh dntech
# HTML origin
curl -sS http://127.0.0.1:3000/ | grep -oE '/_next/static/chunks/[^"]+\.css' | sort -u
ls ~/dntech/frontend/.next/standalone/.next/static/chunks/*.css
pm2 describe dntech-web | grep -E 'uptime|created at|exec cwd|script'
```

Jika HTML hash ≠ nama file di disk: proses Node masih cache HTML lama, atau restart terjadi sebelum `postbuild`.

### Mitigation

```bash
# Hanya jika build SUDAH selesai (file CSS di standalone ada)
pm2 restart dntech-web
# Verifikasi CSS 200 di 127.0.0.1 lalu https://www.dntech.id/
```

Jika file CSS tidak ada: `cd ~/dntech/frontend && npm run build` lalu restart.

### Postmortem actions (2026-08-29)

- [x] Restart setelah build selesai memulihkan CSS.
- [ ] Jangan restart PM2 paralel dengan `npm run build`.
- [ ] Smoke CSS hash di checklist deploy (dokumen ini).

## Escalation

| Level | Siapa | Kapan |
|-------|--------|--------|
| L1 | Dozer | CSS 404, PM2 down, homepage unstyled |
| L2 | Dozer | Nginx/Cloudflare; jangan purge HTML cache sebelum origin CSS 200 |

Komunikasi: founder/ops — “stylesheet 404 setelah restart prematur; origin sudah di-restart; hard-refresh.”

## Related

- Deploy umum: [DEPLOYMENT-PRODUCTION.md](../DEPLOYMENT-PRODUCTION.md)
- Postgres: [vps-postgres-seed.md](./vps-postgres-seed.md)
- SSOT DB secrets: `private-wiki/dntech/infra/POSTGRES-VPS-ACCESS.md`

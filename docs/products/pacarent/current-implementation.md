# PacaRent — Current Implementation (baseline)

> **Author:** Dozer  
> **Snapshot date:** 2026-10-14  
> **Release / HEAD:** `8bda7c9` · MVP testing  
> **Status:** Hybrid deploy live (API VPS + web Vercel)

## Summary

Monorepo **API .NET 8 + React/Vite**. Produksi testing: API di VPS DN Tech (`api.pacarent.dntech.id`, PM2, Postgres native), frontend di **Vercel** dengan `VITE_API_BASE` ke API. Dev lokal default **in-memory DB** + port API **5050**.

## Shipped (engineering)

- Auth: register/login/JWT; **OTP registrasi optional** (`PacaRent__SkipRegistrationOtp=true` fase testing)
- Discover: card-stack UX, filter kategori, **lokasi visitor (GPS + reverse geocode)**
- Mitra: apply + admin verifikasi KTP; pembayaran **DOKU mock**; background jobs booking
- Admin seed prod: `admin@pacarent.local` (ganti password setelah login)
- Deploy VPS: **`git pull` → auto publish/restart** (`deploy/scripts/vps-deploy-api.sh` + alias `git pull` di repo clone VPS)
- Fix prod: `/api/auth/me` DTO (no EF graph 500), CORS order

## Gates sebelum launch publik

- DOKU/SMTP live, OTP nyata, review hukum escrow
- Hapus atau rotate demo credentials; harden `SkipRegistrationOtp=false`
- Monitoring + backup Postgres (prosedur SDD)

## Doc SSOT

Edit living docs di **`pacarent/docs/`** → mirror ke folder wiki ini. Lihat [00_INDEX.md](./00_INDEX.md).

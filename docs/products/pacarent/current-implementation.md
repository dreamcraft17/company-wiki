# PacaRent — Current Implementation (baseline)

> **Author:** Dozer  
> **Snapshot date:** 2026-10-18  
> **Release / HEAD:** `ca1769e` (app repo) · membership `e616eeb` · UI v3 `d7ba0e6`  
> **Status:** Hybrid deploy live (API VPS + web Vercel) · **membership mock shipped**

## Summary

Monorepo **API .NET 8 + React/Vite**. Produksi testing: API di VPS DN Tech (`api.pacarent.dntech.id`, PM2, Postgres native), frontend di **Vercel** dengan `VITE_API_BASE` ke API. Dev lokal default **in-memory DB** + port API **5050**.

**Positioning:** booking pendamping verified (bukan app swipe/jodoh). Monetisasi platform = **langganan Plus/Pro** + boost consumable (mock); tarif pendamping = DOKU one-shot (mock).

## Shipped (engineering)

- **Web v3:** shell `styles/v3/`, browse grid, microcopy `web/src/copy/productCopy.ts`, route `/membership`
- **Membership:** `Subscriptions` table + `SubscriptionsController`; tier Gratis (cap 2 booking aktif), Plus (unlimited), Pro (prioritas booking), Pendamping Pro (boost listing 24h, stats agregat); checkout mock when `Doku__UseSandboxMock=true`
- Auth: register/login/JWT; OTP registrasi optional (`PacaRent__SkipRegistrationOtp=true` fase testing)
- Discover: filter kategori/kota, lokasi visitor (GPS + reverse geocode)
- Mitra: apply + admin verifikasi KTP; pembayaran booking **DOKU mock**; background jobs
- Admin seed prod: `admin@pacarent.local` (ganti password setelah login)
- Deploy VPS: **`git pull` → auto publish/restart** (`deploy/scripts/vps-deploy-api.sh`)
- Tests (web): **7** Vitest · build OK (2026-10-18)

## Gates sebelum launch publik

- DOKU/SMTP live (booking + **recurring membership** belum wired ke DOKU asli)
- OTP nyata, review hukum, `SkipRegistrationOtp=false`
- Postgres migration `AddMembershipSubscriptions` on VPS after API deploy
- Monitoring + backup Postgres (prosedur SDD)

## Doc SSOT

Living docs di **`pacarent/docs/`** (may not be tracked in app git — mirror from monorepo workspace). Wiki copy: [00_INDEX.md](./00_INDEX.md).

# NextWork (Nearwork)

> **Status:** In Development · **Last updated:** 2026-08-29 · **Author:** Dozer  
> **Owner:** Dozer (CEO + Tech Lead + PM) · **Company:** DN Tech (PT. Dozer Napitupulu Technology)  
> **Repository:** `nextwork/` · [github.com/dreamcraft17/freelance-web-startup](https://github.com/dreamcraft17/freelance-web-startup)  
> **HEAD:** `3983ddf` · **Brand publik:** **NextWork** (monorepo package: `freelance-marketplace-saas`)

---

## Summary

**NextWork** adalah marketplace freelance **hyperlocal + remote**: klien memasang job, freelancer mengirim proposal, percakapan **terikat job**, lalu hire → kontrak → escrow (V2). Bukan direktori kontak saja — alur hiring terstruktur dari discovery sampai pembayaran.

| | |
|---|---|
| **Status engineering** | MVP + **V2 foundation** + **v2.1 payment harden** — **100% current-scope DoD** |
| **Status bisnis / GA** | **Conditional** — PSP LIVE keys, pilot transaksi, invoice PDF belum |
| **Runtime** | Next.js 15 (Vercel) + worker Node + PostgreSQL |
| **Default lokal** | MOCK checkout (aman tanpa uang nyata) |

---

## Dokumen living (SSOT wiki)

| Dokumen | Isi |
|---------|-----|
| [docs/BUSINESS-MODEL.md](./docs/BUSINESS-MODEL.md) | Model bisnis, revenue streams, pricing, unit economics |
| [docs/FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md) | **Fitur lengkap** — Available / Conditional / Roadmap |
| [docs/CURRENT-IMPLEMENTATION.md](./docs/CURRENT-IMPLEMENTATION.md) | Baseline implementasi (snapshot HEAD) |
| [docs/IMPLEMENTATION-STATUS.md](./docs/IMPLEMENTATION-STATUS.md) | Phase matrix & DoD |
| [00_INDEX.md](./00_INDEX.md) | Index penuh + arsip spek V2 |

**Living docs di app repo:** `nextwork/docs/00_INDEX.md` — edit di repo dulu, mirror ke wiki.

---

## Stack (ringkas)

| Layer | Teknologi |
|-------|-----------|
| Monorepo | pnpm 9 · Turborepo 2 · Node 20 |
| App | Next.js 15 · React 19 · TypeScript |
| DB | PostgreSQL · Prisma (**42 models**) |
| Auth | JWT cookie `acme_session` + CSRF + RBAC |
| Payments | Stripe + Midtrans (MOCK tanpa key) |
| Worker | `apps/worker` — escrow, SLA, boosts, recommendations |
| Tests | **82** unit passed · HTTP E2E · GitHub Actions CI |

---

## Inventori (2026-08-29)

| Metrik | Nilai |
|--------|-------|
| App pages | **55** `page.tsx` |
| API routes | **60** `route.ts` |
| Prisma models | **42** |
| Unit tests | **82** passed |

---

## Positioning

| Bukan | Adalah |
|-------|--------|
| ERP / HRIS | Marketplace **job → proposal → chat → contract** |
| App admin terpisah (`apps/admin`) | Admin live di **`/admin`** di `apps/web` |
| Fastwork-style catalog only | **Bidding + hyperlocal** (REMOTE / ONSITE / HYBRID) |

---

## Next PRD

Lihat `nextwork/docs/NEXT-PRD-BRIEF.md` — fokus: PSP LIVE ops, forgot-password email, realtime messaging, atau agency multi-seat.

---

*Property of DN Tech · PT. Dozer Napitupulu Technology · 2026*

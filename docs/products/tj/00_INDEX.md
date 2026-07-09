# Trusted Jurist (TJ) — Documentation Index

**Product**: Trusted Jurist Law Firm — Company Profile Website  
**Repository**: `tj`  
**Domain**: `https://trustedjurist.co.id`  
**Status**: Go-live readiness (v0.2.0) — design system fully wired  
**Owner**: Dozer  
**Last Updated**: July 9, 2026  
**Latest commit**: `d0e5382` — full design system across UI and key pages

---

## Core Documents

| File | Topik |
|------|-------|
| [docs/PRD.md](./docs/PRD.md) | **PRD** — Product Requirements Document |
| [docs/FEATURES.md](./docs/FEATURES.md) | **Katalog lengkap** fitur + tech stack |
| [current-implementation.md](./current-implementation.md) | Snapshot implementasi aktual |
| [design/IMPLEMENTATION.md](./design/IMPLEMENTATION.md) | Status design system di production |
| [README.md](./README.md) | Project overview & setup |
| [fitur.md](./fitur.md) | Katalog fitur (ringkas) |
| [audit.md](./audit.md) | Audit teknis & checklist go-live |
| [changelog.md](./changelog.md) | Riwayat versi |

## Operations

| File | Topik |
|------|-------|
| [docs/go-live-checklist.md](./docs/go-live-checklist.md) | Checklist deploy production |
| [docs/phase-1-checklist.md](./docs/phase-1-checklist.md) | Arsip Phase 1 (konten & konfigurasi) |

## Agent / Engineering Notes

| File | Topik |
|------|-------|
| [AGENTS.md](./AGENTS.md) | Catatan untuk AI agent & konvensi codebase |

---

## Ringkas Produk

Website company profile firma hukum (Jakarta Timur): 7 halaman + privacy + careers, form kontak (Resend), SEO assets, design system editorial (mahogany/brass/parchment).

| | |
|---|---|
| Stack | Next.js 16 · React 19 · Tailwind v4 · Framer Motion · Resend |
| Design system | ✅ Tokens, UI kit, layout sections — wired ke `/`, `/about`, `/team`, `/practice-areas`, `/contact`, `/careers` |
| Blocker go-live | Nomor telepon/WhatsApp resmi + env production (Resend, reCAPTCHA) |
| Repository | `tj` → [github.com/dreamcraft17/tj](https://github.com/dreamcraft17/tj) |

---

## Related

- [Product Docs Index](../README.md)
- [Product Portfolio](../../08_PRODUCTS.md)
- [PRD Template](../../../templates/PRD_TEMPLATE.md)

---

*Last Updated: July 9, 2026*

# Changelog

Perubahan penting pada website **Trusted Jurist Law Firm**.

Format: [Keep a Changelog](https://keepachangelog.com/id/1.1.0/) · Versi: [Semantic Versioning](https://semver.org/lang/id/)

---

## [Unreleased]

### Direncanakan

- Halaman detail wawasan `/insights/[slug]`
- Peta Google Maps di halaman kontak
- i18n bahasa Inggris aktif
- Analytics & monitoring (Sentry / Plausible)
- CI/CD (GitHub Actions)
- Rate limiting Redis (Upstash) untuk multi-instance

---

## [0.2.0] — 2026-05-19

Rilis go-live readiness: backend form, privasi, SEO assets.

### Added

- **API** `POST /api/contact` — validasi, rate limit, reCAPTCHA v3, Resend
- **Halaman** `/privacy` — Kebijakan Privasi
- **SEO:** `sitemap.xml`, `robots.txt`, OG image (`/opengraph-image`), favicon (`/icon`)
- **404** — `not-found.tsx` branded
- **Modul** `src/lib/contact/` — validate, sanitize, rate-limit, recaptcha, email
- **Komponen** `RecaptchaScript`, integrasi di root layout
- **Dokumentasi** `docs/go-live-checklist.md`
- Dependency: `resend`

### Changed

- `ContactForm` — fetch API, error state, consent link privasi
- `FOOTER_LEGAL` — disclaimer diperbarui + `copyright`
- `CONTACT_CONFIG` — alamat Sunter Agung Raya, `konsultasi@`, jam 08:00–17:00, timezone
- `founderCredibility` — placeholder perguruan dihapus, pengalaman diperkaya
- `createMetadata()` — `openGraph.images` + Twitter images
- Footer — tautan Kebijakan Privasi
- `.env.example` — Resend + reCAPTCHA

### Fixed

- Dokumentasi diselaraskan dengan implementasi aktual

---

## [0.1.0] — 2026-05-17

Rilis awal company profile — 6 halaman + design system.

### Added

- Halaman: Beranda, Tentang, Bidang Praktik, Tim, Wawasan, Kontak
- Homepage 8 section editorial
- 8 bidang praktik, profil firma, tim, wawasan (draf)
- Navbar scroll-aware, menu mobile, footer
- SEO: metadata, Open Graph, JSON-LD `LegalService`
- Form simulasi (1,4s delay)
- Dokumentasi: README, audit, fitur, changelog

---

## [0.0.1] — 2026-05-16

### Added

- Scaffold Create Next App
- TypeScript, ESLint, Tailwind CSS v4

---

## Versi

| Versi | Tanggal | Milestone |
|-------|---------|-----------|
| 0.0.1 | 2026-05-16 | Scaffold |
| 0.1.0 | 2026-05-17 | Company profile (6 halaman) |
| 0.2.0 | 2026-05-19 | Backend form, privasi, SEO assets |
| Unreleased | — | Insights detail, i18n, maps, analytics |

[Unreleased]: https://github.com/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/releases/tag/v0.0.1

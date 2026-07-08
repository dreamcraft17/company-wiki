<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Trusted Jurist — Agent Notes

Website company profile firma hukum (Bahasa Indonesia). **Versi 0.2.0.**

## Stack

Next.js 16 App Router · React 19 · TypeScript · Tailwind v4 · Framer Motion · Resend

## Struktur penting

| Path | Fungsi |
|------|--------|
| `src/lib/data.ts` | Semua konten + `CONTACT_CONFIG` |
| `src/lib/constants.ts` | `SITE_CONFIG`, `FOOTER_LEGAL` |
| `src/lib/contact/` | Validasi, rate limit, reCAPTCHA, email |
| `src/app/api/contact/route.ts` | POST form backend |
| `src/components/ContactForm.tsx` | Form client → API |
| `src/lib/seo.ts` | `createMetadata()` |

## Halaman

`/`, `/about`, `/practice-areas`, `/team`, `/insights`, `/contact`, `/privacy`

## Environment (jangan commit)

```
RESEND_API_KEY, RESEND_FROM_EMAIL, ADMIN_EMAIL
NEXT_PUBLIC_RECAPTCHA_SITE_KEY, RECAPTCHA_SECRET_KEY
```

Dev tanpa env: form sukses, email di-log, reCAPTCHA dilewati.

## Konvensi

- Konten baru → `data.ts`, bukan hardcode di komponen
- Metadata halaman → `createMetadata()` dari `seo.ts`
- Jangan buat data palsu (testimonial, universitas, nomor telepon)
- Nomor kontak bertanda `REVIEW` / `XXXX` — tunggu konfirmasi firma

## Dokumentasi

- [README.md](./README.md)
- [fitur.md](./fitur.md)
- [audit.md](./audit.md)
- [docs/PRD.md](./docs/PRD.md)
- [docs/go-live-checklist.md](./docs/go-live-checklist.md)
- [current-implementation.md](./current-implementation.md)

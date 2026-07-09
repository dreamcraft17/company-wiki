# DN Tech — Design Summary

Ringkasan desain visual website **DN Tech Company Profile** (`dntech.id`) dan admin CMS.

| | |
|---|---|
| **Versi design** | V2 — Human-Centric, Solid Color |
| **Status** | Production (aktif di public site + admin) |
| **Spesifikasi lengkap** | [V2/DN-TECH-DESIGN-SYSTEM-V2.md](./V2/DN-TECH-DESIGN-SYSTEM-V2.md) |
| **Audit detail** | [design_audit.md](./design_audit.md) |
| **Tanggal** | 9 Juli 2026 |
| **Stack** | Next.js 16 · Tailwind CSS v4 · Lucide React |
| **Keputusan desain** | CEO + Tech Lead — solid color, anti glassmorphism / AI look |

---

## 0. Mandat Leadership (CEO + Tech Lead)

Keputusan arah desain DN Tech ditetapkan langsung oleh **CEO sekaligus Tech Lead**. Ini bukan preferensi estetika semata — ini **standar produk** yang wajib diikuti seluruh tim engineering dan kontributor eksternal.

### Yang kami edepankan

| Prioritas | Penjelasan |
|-----------|------------|
| **Warna solid** | Background, hero, card, dan CTA memakai warna datar (`#1E3A8A`, `#0D9488`, putih, abu netral). Setiap pixel punya fungsi: hierarki, kontras, atau CTA — bukan dekorasi. |
| **Flat & readable** | Card dengan border tipis, tanpa shadow berat. Typography jelas. Whitespace cukup. Pengunjung B2B harus langsung paham isi halaman. |
| **Human & credible** | Tampilan seperti perusahaan teknologi sungguhan — bukan landing page template generik. |

### Yang kami tolak secara eksplisit

| Anti-pattern | Alasan |
|--------------|--------|
| **Glassmorphism** | `backdrop-blur`, panel semi-transparan, efek kaca — terlihat trendy tapi mengurangi readability dan terasa "template 2023". |
| **AI look** | Gradient mesh, blob organik, ilustrasi Midjourney/DALL·E, stock photo hipster sempurna, glow neon, efek 3D palsu. |
| **Gradient dekoratif** | `linear-gradient` pada hero, card, atau placeholder — dianggap visual noise, bukan brand DN Tech. |
| **Neumorphism / shadow berat** | Tombol timbul, card melayang — tidak selaras dengan positioning profesional & timeless. |

> **Aturan praktis:** Jika sebuah elemen UI terlihat seperti hasil prompt AI atau tema SaaS generik — **tolak dan ganti** dengan solid color + tipografi + spacing yang jelas. Rujukan visual yang disetujui: Stripe, GitHub, Linear — bukan Dribbble trend du jour.

Keputusan ini menjadi dasar **Design System V2** dan menjadi lensa evaluasi di [design_audit.md](./design_audit.md).

---

## 1. Filosofi Desain

DN Tech mengadopsi pendekatan **purposeful & clear** — desain yang mendukung readability, konversi, dan kepercayaan B2B, bukan tren visual sementara. Filosofi ini merupakan turunan langsung dari [mandat leadership](#0-mandat-leadership-ceo--tech-lead) di atas.

| Prinsip | Arti praktis |
|---------|--------------|
| Solid color only | Tidak ada gradient hero, glassmorphism, atau neumorphism — **non-negotiable per CEO/Tech Lead** |
| Anti AI-look | Tidak ada blob, gradient mesh, ilustrasi generatif, atau polish "terlalu sempurna" |
| Whitespace | Section bernapas; konten tidak padat |
| Human & honest | Copy Bahasa Indonesia, tone profesional-tapi-ramah |
| Accessible first | Kontras tinggi, touch target ≥ 48px, label form lengkap |
| Timeless | Referensi visual: Stripe, GitHub, Linear — bukan vaporwave/AI-art |

---

## 2. Palet Warna

### Brand tokens (CSS + Tailwind)

| Token | Hex | Tailwind | Penggunaan |
|-------|-----|----------|------------|
| **Primary** | `#1E3A8A` | `blue-900` | Hero, CTA, link, focus ring, heading accent |
| **Secondary** | `#0D9488` | `teal-600` | Role tim, badge kategori, secondary button |
| **Accent (alert)** | `#EA580C` | `orange-600` | Hanya peringatan kritis (jarang) |
| **Background** | `#FFFFFF` | `white` | Halaman utama |
| **Surface alt** | `#F9FAFB` | `gray-50` | Section alternatif |
| **Text primary** | `#111827` | `gray-900` | Body & heading |
| **Text secondary** | `#6B7280` | `gray-600` | Deskripsi, metadata |
| **Border** | `#D1D5DB` | `gray-300` | Card, input, divider |

Definisi di `frontend/src/app/globals.css`:

```css
:root {
  --primary: #1e3a8a;
  --secondary: #0d9488;
  --background: #ffffff;
  --foreground: #111827;
}
```

### Semantic colors

| State | Warna | Contoh |
|-------|-------|--------|
| Error | `red-600` | Validasi form, alert gagal |
| Success | `green-600` | Step selesai, badge metrik |
| Warning | `yellow-500` | Jarang dipakai |
| Info | `blue-50` + `blue-900` | Banner informasi form |

---

## 3. Tipografi

| Aspek | Nilai |
|-------|-------|
| Font family | **Inter** (system stack fallback — tanpa `next/font/google`) |
| Body | 16px · `line-height: 1.6` |
| Heading scale | H1 ~48px → H6 ~18px (via Tailwind `text-*` + `font-bold/semibold`) |
| Prose (blog/legal) | Utility `.prose` di `globals.css` |

Hierarchy teks:
1. Primary — `gray-900`
2. Secondary — `gray-600`
3. Interactive — `blue-900`
4. Disabled — `gray-300`–`gray-500`

---

## 4. Spacing & Layout

| Aturan | Implementasi |
|--------|--------------|
| Grid | Kelipatan **8px** (`p-4`, `gap-6`, `mb-8`, dll.) |
| Container | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` |
| Section padding | `py-12`–`py-16` |
| Card padding | `p-6` |
| Border radius | `rounded-lg` (8px) standar; `rounded-xl` di beberapa admin form |

Breakpoints (mobile-first): `sm` 640px · `md` 768px · `lg` 1024px · `xl` 1280px

---

## 5. Komponen UI

### Public site (`frontend/src/components/ui/`)

| Komponen | Variants / catatan |
|----------|-------------------|
| **Button** | `primary` (blue-900), `secondary` (teal outline), `outline`, `danger`, `ghost` · sizes `sm/md/lg` · `min-h` 40–48px |
| **Card** | Flat `border-gray-200`, optional `hover` border change — **tanpa** shadow berat |
| **Input / Textarea / Select** | Label, error, helper text, `aria-*`, `min-h-[48px]` |

### Layout & chrome

| Komponen | Styling |
|----------|---------|
| **Header** | Sticky white, `border-b`, active link `bg-blue-50 text-blue-900` |
| **Footer** | Gray tones, kontak dari CMS settings |
| **Hero** | Solid `bg-blue-900 text-white` — **bukan** gradient |
| **StickyCTA** | Mobile-only CTA bar blue-900 |
| **ExitIntentModal** | White card, blue-900 CTA (V3) |

### Admin dashboard

| Area | Styling |
|------|---------|
| Sidebar | `bg-slate-900` — **terpisah** dari palet public blue-900 |
| Main content | `bg-slate-100` |
| CRUD pages | `AdminCrudPage` pattern — slate borders, white cards |
| Login | Dark `slate-900` background + white form `shadow-xl` |

### Ikon

**Lucide React** — ukuran konsisten 16–32px, warna mengikuti konteks (`text-blue-900`, `text-gray-600`).

---

## 6. Motion & Interaksi

| Pola | Durasi / catatan |
|------|------------------|
| Hover color | `transition-colors` ~200ms |
| Card hover | Border `gray-200` → `gray-300` |
| Loading | `Loader2` spin / border spinner |
| Exit intent | Fade modal, max 1× per session |
| **Tidak dipakai** | Parallax, bounce, auto-play video, page transition flashy |

---

## 7. Kelebihan (Strengths)

### Konsistensi & kejelasan
- **Homepage & halaman inti** (services, about, contact, blog) sudah selaras V2: solid hero, palet blue/teal, tipografi readable.
- **UI kit terpusat** (`Button`, `Card`, `Input`) mengurangi one-off styling di form utama.
- **Aksesibilitas form** baik: label terhubung, `aria-invalid`, `role="alert"` pada error, touch target 48px.
- **Anti-pattern V1 dihapus** di area kritis: hero gradient, glassmorphism header, shadow card berat.

### Brand & positioning
- Visual **corporate-friendly** cocok untuk klien B2B / startup Indonesia.
- Bahasa UI **100% Indonesia** — selaras positioning lokal.
- Desain **timeless** — tidak terlihat seperti template AI generik.
- **Mandat leadership jelas:** CEO + Tech Lead secara aktif menolak glassmorphism dan estetika "AI look"; tim engineering punya landasan tegas saat review UI/PR.

### Engineering
- Tailwind v4 + CSS variables untuk token inti — mudah di-maintain.
- Komponen kecil, tanpa library UI berat (no MUI/Chakra).
- Design system terdokumentasi lengkap di `docs/V2/DN-TECH-DESIGN-SYSTEM-V2.md`.

### CMS-driven
- Konten (stats, trust badges, team, blog) dari database — layout tidak hardcode data palsu.

---

## 8. Kekurangan (Weaknesses) — pasca V2.1

### ✅ Diperbaiki (Jul 2026)

| Masalah (dulu) | Status |
|----------------|--------|
| Gradient placeholder portfolio/case study | ✅ `PortfolioCard` + solid fallback |
| Dual palette slate vs gray | ✅ Unified `gray-*` + admin `blue-900` |
| `blue-600` vs `blue-900` | ✅ Distandarkan |
| `shadow-xl` admin login | ✅ Flat border |
| UI kit minimal (3 komponen) | ✅ Alert, Badge, Modal + barrel export |
| Inline alerts tersebar | ✅ Refactor ke `Alert` component |
| Tanpa `design-tokens.ts` | ✅ Ditambahkan |

### Masih terbuka (P2 / V2.2+)

| Masalah | Catatan |
|---------|---------|
| Avatar tim inisial | Menunggu upload foto via CMS media |
| Dark mode | Direncanakan V2.2+ |
| Storybook / Figma | Belum ada |
| Animasi scroll terstandar | Hanya exit intent & carousel |
| Font system stack vs Inter Google Fonts | Trade-off performa V4 — disengaja |
| Tabs, Breadcrumb komponen | Belum diekstrak (nice-to-have) |

---

## 9. Ringkasan Skor (pasca V2.1)

| Dimensi | Sebelum | Sesudah | Catatan |
|---------|---------|---------|---------|
| Konsistensi homepage & core | 8/10 | **9/10** | Solid, on-brand |
| Konsistensi seluruh site | 6/10 | **9/10** | Portfolio/case study fixed |
| Aksesibilitas | 7/10 | **8/10** | Alert aria, form tetap kuat |
| Komponen & reusability | 5/10 | **8/10** | 7 komponen UI + cards |
| Admin vs public cohesion | 5/10 | **8/10** | Sidebar blue-900 |
| Dokumentasi | 9/10 | **9/10** | Audit + IMPLEMENTATION synced |

**Overall design maturity: ~9/10** — production-ready, mandat CEO/Tech Lead enforced di kode.

---

## 11. Branding & Identitas Visual (Jul 9, 2026)

| Area | Implementasi |
|------|--------------|
| Logo resmi | `frontend/public/rlogo2.png` — navbar, footer, admin, OG |
| Navbar | `LogoLight.tsx` — gambar + teks **DN Tech.id** |
| Footer | `LogoDark.tsx` — gambar saja |
| Favicon | `app/icon.png` (32×32), `app/apple-icon.png` (180×180) |
| Hero beranda | `HeroBrand.tsx` — wordmark tipografi kecil + H1 tagline CMS; **tanpa** logo PNG di `bg-blue-900` |

**Alasan hero tanpa logo PNG:** logo bulat putih di background biru gelap kontras buruk dan redundan dengan headline — wordmark tipografi lebih clean dan selaras mandat solid/minimal.

**Legacy:** `logo.png` masih di `public/` tapi tidak dipakai UI publik.

---

## 10. Rekomendasi Prioritas

| # | Aksi | Status |
|---|------|--------|
| 1 | Ganti gradient placeholder portfolio | ✅ Done |
| 2 | Standarisasi link `blue-900` | ✅ Done |
| 3 | Ekstrak Alert, Badge, Modal | ✅ Done |
| 4 | Samakan admin palette | ✅ Done |
| 5 | `design-tokens.ts` | ✅ Done |
| 6 | Upload foto tim real via media CMS | ⏳ Konten (P2) |

---

## Dokumen Terkait

| File | Isi |
|------|-----|
| [design_audit.md](./design_audit.md) | Audit file-per-file, severity, checklist |
| [V2/DN-TECH-DESIGN-SYSTEM-V2.md](./V2/DN-TECH-DESIGN-SYSTEM-V2.md) | Spesifikasi design system lengkap |
| [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md) | Status implementasi keseluruhan |
| [V2/DN-TECH-PRD-V2.md](./V2/DN-TECH-PRD-V2.md) | PRD yang memicu redesign V2 |

---

*Property of DN Tech - PT. Dozer Napitupulu Technology . 2026*

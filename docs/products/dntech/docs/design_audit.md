# DN Tech — Design Audit

Audit desain visual dan konsistensi styling codebase **DN Tech** (`frontend/`).

| | |
|---|---|
| **Tanggal audit** | 9 Juli 2026 |
| **Remediation selesai** | 9 Juli 2026 (V2.1) |
| **Status** | ✅ Resolved — P0/P1 implemented |
| **Scope** | Public website + admin dashboard + shared UI components |
| **Baseline** | [DN-TECH-DESIGN-SYSTEM-V2.md](./V2/DN-TECH-DESIGN-SYSTEM-V2.md) |
| **Ringkasan eksekutif** | [DESIGN_SUMMARY.md](./DESIGN_SUMMARY.md) |
| **Metode** | Static review source + cross-ref implementation status doc |
| **Mandat evaluasi** | CEO + Tech Lead — solid color, anti glassmorphism / AI look |

---

## Mandat Leadership (CEO + Tech Lead)

Audit ini tidak hanya membandingkan kode dengan spec teknis — tetapi juga dengan **keputusan arah desain** yang ditetapkan CEO sekaligus Tech Lead DN Tech:

1. **Warna solid adalah default.** Setiap surface UI harus bisa dijelaskan dengan satu warna hex atau token Tailwind — bukan kombinasi gradient dekoratif.
2. **Glassmorphism dilarang.** Pola `backdrop-blur`, overlay semi-transparan, dan efek kaca dianggap **pelanggaran langsung** terhadap mandat produk.
3. **AI look dilarang.** Elemen yang terlihat seperti hasil generator (blob, mesh gradient, ilustrasi generatif, glow berlebihan) tidak boleh masuk production — bahkan sebagai placeholder sementara.
4. **Temuan yang melanggar mandat ini = High severity**, terlepas dari seberapa "bagus" secara estetika subjektif.

Rujukan lengkap: [DESIGN_SUMMARY.md §0](./DESIGN_SUMMARY.md#0-mandat-leadership-ceo--tech-lead)

---

---

## Status Pasca-Implementasi V2.1 (9 Jul 2026)

Semua temuan **P0 dan P1** telah diperbaiki di `frontend/src/`. Verifikasi:

| Check | Hasil |
|-------|-------|
| `gradient-to-*` | ✅ 0 di codebase |
| `backdrop-blur` | ✅ 0 |
| `shadow-xl` / `shadow-2xl` | ✅ 0 |
| `slate-*` | ✅ 0 (diganti `gray-*` atau `blue-900` admin) |
| `text-blue-600` / `bg-blue-600` CTA | ✅ distandarkan `blue-900` |
| UI kit | ✅ Alert, Badge, Modal, PortfolioCard |
| Inline alerts | ✅ ContactForm, Newsletter, Quiz, ROI, Settings, login, MultiStep |

**Skor desain setelah fix:** ~9/10 (naik dari 7/10). Sisa P2: foto tim real via CMS, dark mode V2.2+.

Rujukan implementasi: [design/IMPLEMENTATION.md](../design/IMPLEMENTATION.md)

---

## Ringkasan Eksekutif (awal audit — arsip)

> Catatan: paragraf di bawah ini mencatat kondisi **sebelum** V2.1. Lihat [Status Pasca-Implementasi](#status-pasca-implementasi-v21-9-jul-2026) untuk kondisi terkini.

Desain **halaman inti** (homepage, services, contact, header/footer) sudah **compliant** dengan mandat leadership dan Design System V2: solid colors, flat cards, touch-friendly forms, palet blue-900 / teal-600 — **tanpa** glassmorphism atau estetika AI-generik di area tersebut.

**Sebelum V2.1**, ~30% halaman secondary memakai gradient placeholder dan dual palette — **sudah diperbaiki**.

| Severity (awal) | Jumlah | Status V2.1 |
|-----------------|--------|-------------|
| 🔴 High | 4 | ✅ Resolved |
| 🟠 Medium | 6 | ✅ Resolved |
| 🟡 Low | 8 | 🟡 Partial (foto tim, dark mode = P2) |
| ✅ Compliant | 12 | ✅ Expanded |

---

## Metodologi

1. Bandingkan `globals.css`, `components/ui/*`, layout chrome dengan V2 spec **dan mandat leadership** (solid only, no glass, no AI look).
2. Grep pola terlarang per keputusan CEO/Tech Lead: `gradient`, `backdrop-blur`, `shadow-xl`, `indigo-`, `purple-`, blob/mesh patterns.
3. Periksa aksesibilitas form (`aria-*`, label, min-height).
4. Verifikasi klaim di `IMPLEMENTATION-STATUS.md` § Design System V2.

---

## Temuan High

### H1 — Gradient placeholder di portfolio & case studies

**Melanggar:** Mandat leadership (solid color, anti AI-look) + V2 §2 "What NOT to Do — Gradients", §5 Cards "DON'T gradient backgrounds"

Gradient `blue-500 → indigo-600` pada placeholder portfolio dianggap **AI-template aesthetic** — bukan representasi proyek nyata, dan tidak sesuai keputusan CEO/Tech Lead.

| File | Baris / pola |
|------|--------------|
| `components/cards/CaseStudyCard.tsx` | `bg-gradient-to-br from-blue-500 to-indigo-600` |
| `app/(public)/portfolio/page.tsx` | `bg-gradient-to-br from-blue-500 to-indigo-600` |
| `app/(public)/portfolio/[slug]/page.tsx` | `bg-gradient-to-br from-blue-500 to-indigo-600` |
| `app/(public)/case-studies/[slug]/page.tsx` | gradient hero + `backdrop-blur-sm` pada badge |

**Dampak:** Halaman portfolio/case study terlihat tidak selaras dengan homepage; pengunjung melihat dua "era" desain.

**Rekomendasi:**
- Ganti dengan `bg-blue-900/10` + ikon Lucide, atau thumbnail dari field media CMS.
- Hapus `backdrop-blur-sm` pada badge — gunakan `bg-white/90` solid atau `bg-blue-900 text-white`.

**Prioritas:** segera (visual inconsistency di halaman konversi).

---

### H2 — `shadow-xl` pada admin login

**Melanggar:** V2 §5 Cards — "DON'T multiple shadows"

| File | Pola |
|------|------|
| `app/admin/login/page.tsx` | `shadow-xl` pada form card |

**Rekomendasi:** `border border-gray-200` flat card, konsisten dengan public `Card`.

---

### H3 — Dokumentasi vs implementasi (gradient)

**Lokasi:** `docs/IMPLEMENTATION-STATUS.md` §2 Anti-pattern

Klaim: gradient avatar & hero dihapus. **Faktanya:** gradient masih ada di 4 file portfolio/case study (lihat H1).

**Rekomendasi:** Update IMPLEMENTATION-STATUS setelah fix H1, atau tambahkan footnote "known exception".

---

### H4 — Backdrop blur di case study detail

**Melanggar:** Mandat leadership (anti glassmorphism) + V2 §1 "No glassmorphism"

| File | Pola |
|------|------|
| `app/(public)/case-studies/[slug]/page.tsx` | `backdrop-blur-sm` |

**Rekomendasi:** Hapus; gunakan solid overlay atau badge tanpa blur.

---

## Temuan Medium

### M1 — Dual palette: `gray-*` vs `slate-*`

Public site dominan `gray-*`; admin + banyak secondary pages memakai `slate-*`.

| Area | Contoh file |
|------|-------------|
| Admin layout | `admin/layout.tsx` — `bg-slate-100` |
| Admin sidebar | `AdminSidebar.tsx` — `bg-slate-900 text-slate-300` |
| Admin CRUD | `AdminCrudPage.tsx`, `admin/leads/page.tsx`, dll. |
| Case study cards | `text-slate-900`, `text-slate-600` |
| Footer partial | `text-slate-*` mix |

**Dampak:** Dua nuansa abu-abu berbeda; tidak fatal tapi mengurangi perceived polish.

**Rekomendasi:** Pilih satu — `gray-*` untuk seluruh app, atau dokumentasikan "Admin Theme" di DESIGN_SUMMARY.

---

### M2 — Link accent `blue-600` bukan `blue-900`

| File | Pola |
|------|------|
| `components/cards/CaseStudyCard.tsx` | `text-blue-600` pada CTA link |

**Rekomendasi:** Ganti ke `text-blue-900 font-medium`.

---

### M3 — Admin spinner `border-blue-600`

| File | Pola |
|------|------|
| `app/admin/layout.tsx` | `border-blue-600` loading spinner |

Minor — sebaiknya `border-blue-900` untuk brand consistency.

---

### M4 — UI kit tidak mencakup halaman secondary

Halaman berikut memakai styling inline tanpa komponen `ui/` bersama:

- `/quiz` — `SolutionQuiz.tsx`
- `/faq` — accordion inline
- `/testimonials` — `TestimonialCarousel.tsx`
- `/resources` — card grid custom
- `ROICalculator.tsx`, `BookDemoSection.tsx`

**Dampak:** Sulit menjaga konsistensi saat redesign.

**Rekomendasi:** Refactor bertahap ke `Button`/`Card`/`Input` existing.

---

### M5 — Tidak ada komponen Alert/Badge standar

Alert di form/admin dibuat inline (`bg-red-50 border`, `bg-blue-50`) — pola mirip tapi class string berbeda-beda.

**Rekomendasi:** Ekstrak `Alert.tsx`, `Badge.tsx` sesuai V2 §5.

---

### M6 — Font Inter tidak di-load eksplisit

V2 spec menyebut Google Fonts Inter; `layout.tsx` tidak memuat `next/font`. `globals.css` memakai system stack.

**Status:** Acceptable (V4 performance decision) — **tapi harus dicatat** di design docs agar tidak dianggap bug.

---

## Temuan Low

### L1 — Button size `sm` = 40px (di bawah 48px mobile guideline)

`Button.tsx` size `sm`: `min-h-[40px]`. V2 mensyaratkan 48px touch target di mobile.

**Mitigasi:** `sm` jarang dipakai di mobile-primary CTA; `md/lg` sudah 44–48px.

---

### L2 — `rounded-xl` vs `rounded-lg` mixed

Admin login `rounded-xl`; public cards `rounded-lg`. Inkonsistensi radius kecil.

---

### L3 — Avatar tim = inisial, bukan foto

`TeamSpotlight.tsx`, `team/page.tsx` — `bg-blue-900` circle + huruf.

Sesuai fallback; belum memenuhi V2 §6 "real photos".

---

### L4 — Dark mode tidak ada

V2 §10 — optional, belum diimplementasi. Tidak blocker.

---

### L5 — Tidak ada `prefers-reduced-motion` global

V2 §7 minimal motion — tidak ada CSS global untuk reduce motion (exit intent tetap jalan).

---

### L6 — Prose styles terbatas

Hanya di `globals.css` untuk blog — tidak cover blockquote, table, code block styling lengkap.

---

### L7 — Tidak ada Storybook / visual regression

Perubahan komponen UI tidak punya snapshot test visual.

---

### L8 — Orange accent (`#EA580C`) jarang dipakai

Didefinisikan di V2 tapi hampir tidak muncul di kode — dead token.

---

## Area Compliant ✅

| Area | Evidence |
|------|----------|
| Homepage hero | `page.tsx` — `bg-blue-900` solid, comment "no gradient" |
| Header | `Header.tsx` — white sticky, no backdrop-blur |
| Button primary/secondary | `Button.tsx` — blue-900, teal outline |
| Card flat | `Card.tsx` — border only, optional hover border |
| Form a11y | `Input.tsx` — labels, aria-invalid, min-h 48px |
| Focus states | ring `blue-900/20` pada inputs |
| Exit intent modal | white card, blue CTA — no glass |
| Trust badges / sticky CTA | solid colors |
| Footer | `bg-white`, link horizontal, `FooterBrand`, CMS kontak — tanpa newsletter |
| Multi-step contact form | step indicator green/blue solid |
| Logo components | `LogoLight` / `FooterBrand` — wordmark **DN Tech.id**; `LogoDark` admin saja |
| Hero branding | `HeroBrand.tsx` — tipografi; bukan logo PNG di hero biru |
| Homepage PRD Indonesia | `components/homepage/*` — tech stack & tim **hidden** di beranda |
| Lucide icons | konsisten di nav, cards, admin |

---

## Checklist Compliance (V2 §14)

| Item | Public core | Secondary pages | Admin |
|------|-------------|-----------------|-------|
| Palet primary only | ✅ | 🟡 | 🟡 |
| Typography konsisten | ✅ | ✅ | ✅ |
| Spacing 8px grid | ✅ | ✅ | ✅ |
| Button ≥48px mobile | ✅ | ✅ | 🟡 |
| Images WebP + alt | 🟡 CMS-dependent | 🔴 placeholders | N/A |
| Form labels + errors | ✅ | ✅ | ✅ |
| WCAG contrast | 🟡 perlu Lighthouse | 🟡 | 🟡 |
| Mobile responsive | ✅ | ✅ | ✅ |
| No gradient/glass | ✅ homepage | 🔴 portfolio | ✅ |
| Loading states | ✅ | ✅ | ✅ |

---

## Rekomendasi 7 Hari

1. Fix H1 — ganti semua gradient portfolio/case study.
2. Fix H4 — hapus `backdrop-blur` di case study detail.
3. Fix H2 — admin login flat card.
4. Standarisasi `text-blue-900` untuk semua link CTA.
5. Update `IMPLEMENTATION-STATUS.md` § anti-pattern agar akurat.
6. Tambah cross-link `DESIGN_SUMMARY.md` di README project.

## Rekomendasi 30 Hari

1. Ekstrak `Alert`, `Badge`, `Modal` ke `components/ui/`.
2. Dokumentasikan atau unify admin theme (slate → gray/blue).
3. Tambah `design-tokens.ts` mirror CSS variables.
4. Lighthouse audit per halaman utama — catat skor design/UX.
5. Upload foto tim & portfolio thumbnails via media CMS.
6. Evaluasi `prefers-reduced-motion` untuk exit intent & carousel.
7. Pertimbangkan Storybook untuk 3 komponen UI inti.

---

## Lampiran — File Kunci

```
frontend/src/
├── app/globals.css              # CSS tokens + prose
├── app/layout.tsx               # Root (no font loader)
├── app/(public)/page.tsx        # Homepage ✅
├── app/(public)/portfolio/      # 🔴 gradients
├── app/(public)/case-studies/   # 🔴 gradients + blur
├── app/admin/layout.tsx         # slate theme
├── app/admin/login/page.tsx     # shadow-xl
├── components/ui/
│   ├── Button.tsx               # ✅
│   ├── Card.tsx                 # ✅
│   └── Input.tsx                # ✅
├── components/common/Header.tsx # ✅
├── components/cards/CaseStudyCard.tsx  # 🔴
└── components/admin/AdminSidebar.tsx   # slate theme
```

---

## Changelog Audit

| Tanggal | Perubahan |
|---------|-----------|
| 9 Jul 2026 | Initial design audit — static review V2 compliance |
| 9 Jul 2026 | Tambah mandat leadership CEO + Tech Lead (solid color, anti glassmorphism / AI look) |
| 9 Jul 2026 | V2.1 remediation complete — semua P0/P1 resolved, skor 9/10 |
| 9 Jul 2026 | Branding `rlogo2`, favicon, navbar wordmark, hero typographic `HeroBrand` |
| 9 Jul 2026 | Branding section rollout — API `/branding/*`, homepage section architecture, admin `/admin/branding` |
| 9 Jul 2026 | Branding spec v2 (100%) — dedicated models + admin CRUD `/api/v1/admin/branding/*` + testimonial carousel |

---

*Property of DN Tech - PT. Dozer Napitupulu Technology . 2026*

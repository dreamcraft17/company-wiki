# DN Tech Relaunch — Anti AI-Slop Design Audit

> **Status:** Active · **Last updated:** 2026-08-29 · **Author:** Dozer  
> **Product:** dntech.id · **Mandat:** Solid color, no glassmorphism, no AI-generic chrome  
> **Baseline:** [design_audit.md](../design_audit.md) (V2.1 CSS resolved) · **This pass:** Copy + trust slop (relaunch-specific)

## Summary

**Visual CSS:** Mostly grounded — tokens in `globals.css` (`--primary: #1e3a8a`, `--secondary: #0d9488`), no gradient heroes in homepage components, `HomeProducts` uses real product names from API. **Copy slop (pass 1):** seed/page titles read like post-traction SaaS while the company has **0 paying clients**. **Pass 2:** public chrome now points at `/products`, honest testimonial/portfolio empty states, footer no longer lists empty case-studies/careers.

**Slop gate:** **PASS** (2026-08-29, pass 2) — copy/empty states + footer/hero CTA grounded. Visual tokens unchanged.

---

## Context grounding (mandatory)

| Constraint | Source |
|------------|--------|
| Brand colors | `blue-900` CTA, `teal-600` accents, white/gray surfaces |
| Typography | Inter via `--font-inter` (project convention) |
| Layout pattern | Homepage sections: hero → produk → layanan → proses → harga → FAQ → CTA |
| Primary user action | **Hubungi / konsultasi** — founder or ops lead evaluates real products |

---

## Slop fingerprints — findings

| # | Signal | Location | Severity | Fix |
|---|--------|----------|----------|-----|
| 1 | **Fake social proof copy** | `seed-branding.ts` “50+ perusahaan” | ✅ | Honest studio seed (7 produk / 3 tahun) |
| 2 | **Fabricated testimonials** | product seed quotes | ⚠️ | Verify VPS product JSON; public UI hides empty |
| 3 | **Category platitude heading** | `HomeTestimonials` “Apa Kata Klien Kami” | ✅ | Empty: “Testimoni Publik”; filled: “Testimoni” |
| 4 | **Enterprise meta slop** | `testimonials/page.tsx` | ✅ | Meta: belum ada testimoni publik |
| 5 | **Broken trust template** | Product sidebar | ✅ | `formatProductStatusBadge` |
| 6 | **Traction inflation** | Advantages “ratusan…jutaan user” | ✅ | First-party stack copy |
| 7 | **Footer promotes empty proof** | case-studies, careers | ✅ | Dropped from footer; Produk in primary + hero |
| 8 | **backdrop-blur overlay** | `GlobalLoadingIndicator.tsx` | ✅ | `bg-white/90` solid |
| 9 | **Checkmark grid (borderline)** | Product feature cards — CheckCircle every row | 🟢 OK | Feature-dense SaaS page; acceptable if copy is real |

**Fingerprint count:** copy blockers from pass 1 closed. Residual: product integration `Coming Soon` (real feature status, not marketing slop).

---

## Section-by-section

### Homepage

| Element | Assessment |
|---------|------------|
| `HomeProducts` | ✅ Grounded — real slugs, “Pelajari lebih lanjut”, no gradient hero |
| Hero (CMS) | ⚠️ Verify CMS — no “Unlock the power” / “Welcome to innovative platform” |
| Pricing | ✅ UMKM-friendly numbers (Rp 25jt, Rp 150rb/jam) — specific |
| Testimonials block | ✅ Empty = honest; CTA ke produk + kontak |

### Product detail (`/products/[slug]`)

| Element | Assessment |
|---------|------------|
| Layout | ✅ Asymmetric 2+1 grid, sticky sidebar — not 3-icon template row |
| Feature grid | ✅ Real BPJS/payroll nouns — Indonesia context |
| Sidebar trust line | ✅ Status string vs numeric pelanggan |
| Testimonials JSON | ⚠️ Seed products — verify no fake quotes on VPS |

### About

| Element | Assessment |
|---------|------------|
| Story from seed | ✅ Honest studio copy + `aboutContent` dual-write |
| Team | ⚠️ OK if real names via CMS; placeholder avatars = minor |

### Footer / chrome

| Element | Assessment |
|---------|------------|
| White footer, `FooterBrand` | ✅ On-brand, not glass hero |
| Missing Produk link | ✅ Primary footer + hero “Lihat Produk” |
| Secondary links to empty pages | ✅ Case studies / karier removed from footer |

---

## Copy anti-slop rewrites (examples)

| Surface | Slop (current) | Grounded (relaunch) |
|---------|----------------|---------------------|
| About story | “…bantu 50+ perusahaan Indonesia…” | “DN Tech membangun produk HRIS, ERP, dan finance untuk UMKM Indonesia. Kami masih early — produk di bawah ini sudah live atau beta.” |
| Testimonials H1 | “Apa Kata Klien Kami” | “Testimoni — belum ada yang dipublikasikan” (or hide) |
| Product sidebar | “Dipercaya Soft launch pelanggan” | Badge: **Soft launch** · CTA: Hubungi untuk early access |
| dnPeople lede | “Ratusan perusahaan…” | “HRIS multi-tenant — gratis sampai 30 karyawan. Billing via Xendit.” |

**Banned unless user provides verbatim:** seamlessly, leverage, robust, cutting-edge, game-changer, “In today's world…”

---

## Slop gate checklist (relaunch)

```
- [x] Uses project tokens/vars (not hardcoded purple/indigo hero)
- [x] Typography matches site (Inter — project standard)
- [x] Headline states specific outcome — hero = custom software startup/UMKM; empty social pages honest
- [x] Layout differs from generic icon-row + gradient hero
- [x] No decorative animation without UX purpose (mostly)
- [x] Works at 375px (responsive grids in place)
- [x] Focus states on forms (V3 a11y pass) + skip-to-content
- [x] Identity from design not label — trust copy no longer invents client history
```

**Result:** 8/8 slop gate (pass 2). Visual layer: skip-link, header search, CSP headers — not a new palette.

---

## Degrees of freedom

| Task | Freedom | Decision |
|------|---------|----------|
| Relaunch copy pass | **Low** | Match honest PRD constraint |
| Empty social pages | **Low** | Hide/unlist |
| New marketing illustration | **None** | No blobs/spheres |
| Loading overlay blur | **Low** | One-line CSS fix to solid overlay |

---

## Recommended fix order (before code aesthetics)

1. **Seed scripts** — branding + dnPeople testimonials/description  
2. **Product page template** — sidebar status badge component  
3. **HomeTestimonials + testimonials page** — hide or honest headings  
4. **Footer** — `/products` up, demote empty routes  
5. **GlobalLoadingIndicator** — remove blur (P2)

Pass 2 (2026-08-29): items 3–8 closed in public chrome (hero → produk, footer, skip-link, CSP). Re-seed VPS branding if stats still show 6/81.

---

## Cross-references

- [DN-TECH-RELAUNCH-PRD.md](../DN-TECH-RELAUNCH-PRD.md) — scope & MoSCoW  
- [design_audit.md](../design_audit.md) — CSS V2.1 (Jul 2026)  
- [DESIGN_SUMMARY.md](../DESIGN_SUMMARY.md) — palette reference  

---

*Property of DN Tech — PT. Dozer Napitupulu Technology · 2026*

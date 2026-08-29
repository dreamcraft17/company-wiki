# DN Tech Relaunch — Anti AI-Slop Design Audit

> **Status:** Active · **Last updated:** 2026-08-29 · **Author:** Dozer  
> **Product:** dntech.id · **Mandat:** Solid color, no glassmorphism, no AI-generic chrome  
> **Baseline:** [design_audit.md](../design_audit.md) (V2.1 CSS resolved) · **This pass:** Copy + trust slop (relaunch-specific)

## Summary

**Visual CSS:** Mostly grounded — tokens in `globals.css` (`--primary: #1e3a8a`, `--secondary: #0d9488`), no gradient heroes in homepage components, `HomeProducts` uses real product names from API. **Copy slop is the blocker:** seed scripts and page titles still read like a post-traction SaaS template while the company has **0 paying clients**. That is **context slop** — correct layout, zero honesty.

**Slop gate:** **FAIL** (4+ fingerprints). Fix copy/empty states before visual polish.

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
| 1 | **Fake social proof copy** | `seed-branding.ts` “50+ perusahaan”, stats 50/30/5 | 🔴 Block | Replace with studio + first-party products narrative |
| 2 | **Fabricated testimonials** | `seed-dnpeople-product.ts` named HR/CEO quotes | 🔴 Block | Remove until real; use feature list only |
| 3 | **Category platitude heading** | `HomeTestimonials` “Apa Kata Klien Kami” (empty) | 🔴 Block | Hide or rename to honest empty state |
| 4 | **Enterprise meta slop** | `testimonials/page.tsx` “klien enterprise … Indonesia” | 🔴 Block | Meta matches reality: early studio |
| 5 | **Broken trust template** | Product sidebar “Dipercaya {status} pelanggan” | 🟠 High | Status badge, not fake customer sentence |
| 6 | **Traction inflation** | dnPeople description “ratusan perusahaan” vs Soft launch | 🟠 High | Align body copy with launchStatus |
| 7 | **Footer promotes empty proof** | Links to case-studies, careers without content | 🟡 Med | Unlist until real |
| 8 | **backdrop-blur overlay** | `GlobalLoadingIndicator.tsx` | 🟡 Med | Solid `bg-white/90` per V2.1 |
| 9 | **Checkmark grid (borderline)** | Product feature cards — CheckCircle every row | 🟢 OK | Feature-dense SaaS page; acceptable if copy is real |

**Fingerprint count:** 4 critical copy + 2 high = **FAIL slop gate** (need ≤2 before ship).

---

## Section-by-section

### Homepage

| Element | Assessment |
|---------|------------|
| `HomeProducts` | ✅ Grounded — real slugs, “Pelajari lebih lanjut”, no gradient hero |
| Hero (CMS) | ⚠️ Verify CMS — no “Unlock the power” / “Welcome to innovative platform” |
| Pricing | ✅ UMKM-friendly numbers (Rp 25jt, Rp 150rb/jam) — specific |
| Testimonials block | ❌ Heading implies clients; slop |

### Product detail (`/products/[slug]`)

| Element | Assessment |
|---------|------------|
| Layout | ✅ Asymmetric 2+1 grid, sticky sidebar — not 3-icon template row |
| Feature grid | ✅ Real BPJS/payroll nouns — Indonesia context |
| Sidebar trust line | ❌ Template assumes numeric customerCount |
| Testimonials JSON | ❌ Fictional names — remove for relaunch |

### About

| Element | Assessment |
|---------|------------|
| Story from seed | ❌ 50+ companies — direct slop violation |
| Team | ⚠️ OK if real names via CMS; placeholder avatars = minor |

### Footer / chrome

| Element | Assessment |
|---------|------------|
| White footer, `FooterBrand` | ✅ On-brand, not glass hero |
| Missing Produk link | ⚠️ UX slop (hides real proof) |
| Secondary links to empty pages | ❌ Invites bounce to dead ends |

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
- [ ] Headline states specific outcome — FAIL on testimonials/meta
- [x] Layout differs from generic icon-row + gradient hero
- [x] No decorative animation without UX purpose (mostly)
- [x] Works at 375px (responsive grids in place)
- [x] Focus states on forms (V3 a11y pass)
- [ ] Identity from design not label — FAIL: trust copy invents history
```

**Result:** 6/8 — **iterate copy once, then ship visual layer.**

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

Re-run this audit after copy deploy; target **8/8 slop gate**.

---

## Cross-references

- [DN-TECH-RELAUNCH-PRD.md](../DN-TECH-RELAUNCH-PRD.md) — scope & MoSCoW  
- [design_audit.md](../design_audit.md) — CSS V2.1 (Jul 2026)  
- [DESIGN_SUMMARY.md](../DESIGN_SUMMARY.md) — palette reference  

---

*Property of DN Tech — PT. Dozer Napitupulu Technology · 2026*

# Product Documentation Index

**Document Version**: 1.4
**Last Updated**: July 19, 2026
**Status**: Published
**Owner**: Dozer

---

Semua dokumentasi produk DN Tech dikelompokkan per produk di folder ini.

## 📦 Products

| Product | Folder | Docs | Status | Repository |
|---------|--------|------|--------|------------|
| **DN Tech Compro** | [dntech/](./dntech/00_INDEX.md) | 37 files | Production (v5) | `dntech` |
| **dnPeople HRIS** | [dnPeople/](./dnPeople/00_INDEX.md) | 36 files | PRD v10.0 ops artefacts mirrored | `dnpeople` |
| **dnCore (ERP)** | [dnpeople-erp/](./dnpeople-erp/00_INDEX.md) | PRD/SDD/SRS + baselines | v1.0 + mobile-first web + V3 module wiring · Expo on hold (`3968167`) · 404/86 | `ERP` |
| **Nearwork** | [nearwork/](./nearwork/00_INDEX.md) | 32 files | In Development | `nextwork` |
| **Threads Automation** | [threads-automation/](./threads-automation/00_INDEX.md) | 4 files | Planned | `auto` |
| **Trusted Jurist (TJ)** | [tj/](./tj/00_INDEX.md) | 12 files | Go-live readiness | `tj` |
| **Propose (Entro LY)** | [propose/](./propose/00_INDEX.md) | 1 DOCX | Proposal | `propose` |

**Total: 187 markdown + 1 DOCX + 4 ZIP archives**

---

## 🔄 Latest Updates (July 19, 2026)

| Project | Commit | Perubahan |
|---------|--------|-----------|
| **dnCore (ERP)** | `3968167` | V3 module wiring (`a4b63c9`) + mobile-first web; Expo **on hold** — **404** tests / **86** suites · **84** entities · **17** migrations |
| **dnPeople HRIS** | — | PRD v10.0 ops artefacts + baseline sync (see product folder) |
| **TJ** | `d0e5382` | Design system fully wired — tokens, UI kit, layout sections, homepage refresh |
| **Nearwork** | `d40ea19` | Security audit statis 2026-07-08 — temuan critical webhook & public credentials |
| **DN Tech Compro** | `8c5bd47+` | Jul 9 malam — homepage PRD Indonesia, hide tech/tim section, harga UMKM |
| **company-wiki** | — | dnCore docs mirror + products index refreshed |

---

## Navigasi Cepat

### By Document Type

| Type | Lokasi |
|------|--------|
| PRD (Product Requirements) | `*/PRD*`, `*/Docs/01-*`, `*PRD*.md` |
| SRS (Software Requirements) | `*/Docs/02-*`, `*SRS*.md` |
| SDD (Software Design) | `*/Docs/03-*`, `*SDD*.md`, `*SPEC*.md` |
| Implementation Guides | `*/v*/`, `*/update/` |
| Deployment | `*DEPLOYMENT*`, `*deploy*` |
| Project Status | `*STATUS*`, `*audit*`, `DESIGN_*`, `design_audit*` |

### Summary Docs (Wiki Root)

Dokumen ringkasan per produk ada di folder `products/`:

| # | File | Product |
|---|------|---------|
| 09 | [09_COMPRO_PRD.md](../../products/09_COMPRO_PRD.md) | Compro PRD Summary |
| 10 | [10_COMPRO_SPEC.md](../../products/10_COMPRO_SPEC.md) | Compro Spec Summary |
| 11 | [11_CAREERS_PRD.md](../../products/11_CAREERS_PRD.md) | Careers PRD Summary |
| 12 | [12_CAREERS_SPEC.md](../../products/12_CAREERS_SPEC.md) | Careers Spec Summary |

---

## Struktur Folder

```
docs/products/
├── README.md                  # ← Anda di sini
├── dntech/                    # Company Profile Website
├── dnPeople/                  # dnPeople HRIS (Express + Next.js)
├── dnpeople-erp/              # dnCore ERP (NestJS) — path legacy; brand dnCore
├── nearwork/                  # Nearwork Platform
├── threads-automation/        # Threads Automation Tool
├── tj/                        # Trusted Jurist Law Firm website
└── propose/                   # Entro LY proposal (DOCX)

images/                        # Logo & assets per produk
├── dntech/
├── nearwork/
└── erp/
```

---

## 📄 Related Documents

- [Company Wiki Index](../01_README.md)
- [Product Portfolio](../08_PRODUCTS.md)
- [FILE_MANIFEST](../../guidline/FILE_MANIFEST.md)

---

*Last Updated: July 19, 2026*

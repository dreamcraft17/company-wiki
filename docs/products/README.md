# Product Documentation Index

**Document Version**: 1.0  
**Last Updated**: July 8, 2026  
**Status**: Published  
**Owner**: Documentation Lead

---

Semua dokumentasi produk DN Tech dikelompokkan di folder ini. File di-copy dari repository source di `/Users/dozer-entropi/dozer/`.

## 📦 Products

| Product | Folder | Docs | Status | Source Repo |
|---------|--------|------|--------|-------------|
| **DN Tech Compro** | [dntech/](./dntech/00_INDEX.md) | 35 files | Production | `dozer/web/dntech` |
| **DN People ERP** | [dnpeople-erp/](./dnpeople-erp/00_INDEX.md) | 48 files | In Development | `dozer/ERP` |
| **Nearwork** | [nearwork/](./nearwork/00_INDEX.md) | 31 files | In Development | `dozer/web/nextwork` |
| **Threads Automation** | [threads-automation/](./threads-automation/00_INDEX.md) | 4 files | Planned | `dozer/auto` |
| **TJ** | [tj/](./tj/00_INDEX.md) | 6 files | In Development | `dozer/tj` |
| **Propose (Entro LY)** | [propose/](./propose/00_INDEX.md) | 1 DOCX | Proposal | `dozer/propose` |

**Total: 123 markdown + 1 DOCX + 2 ZIP archives**

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
| Project Status | `*STATUS*`, `*audit*` |

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
│   ├── 00_INDEX.md
│   ├── README.md
│   ├── docs/                  # v1–v5, deployment, status
│   └── PRD/                   # Original PRD/SRS/SDD
├── dnpeople-erp/              # ERP System
│   ├── 00_INDEX.md
│   ├── Docs/                  # 25 core documents
│   ├── update/                # Phase 1 execution docs
│   └── README.md
├── nearwork/                  # Nearwork Platform
│   ├── 00_INDEX.md
│   ├── docs/                  # V2 PRD/SRS/SDD + guides
│   └── updated/               # Latest V2 revisions
├── threads-automation/        # Threads Automation Tool
│   └── 00_INDEX.md
└── tj/                        # TJ Project
    └── 00_INDEX.md
└── propose/                   # Entro LY proposal (DOCX)
    └── 00_INDEX.md

images/                        # Logo & assets per produk
├── dntech/logo.png
├── nearwork/logo*.svg/png
└── erp/logo.png, hero.png
```

---

## 📄 Related Documents

- [Company Wiki Index](../01_README.md)
- [Product Portfolio](../08_PRODUCTS.md)
- [FILE_MANIFEST](../../guidline/FILE_MANIFEST.md)

---

*Last Updated: July 8, 2026*

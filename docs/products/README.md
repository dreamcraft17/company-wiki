# Product Documentation Index

**Document Version**: 1.1  
**Last Updated**: July 9, 2026  
**Status**: Published  
**Owner**: Dozer

---

Semua dokumentasi produk DN Tech dikelompokkan per produk di folder ini.

## 📦 Products

| Product | Folder | Docs | Status | Repository |
|---------|--------|------|--------|------------|
| **DN Tech Compro** | [dntech/](./dntech/00_INDEX.md) | 35 files | Production (v5) | `dntech` |
| **DN People ERP** | [dnpeople-erp/](./dnpeople-erp/00_INDEX.md) | 48 files | In Development (V3 ~85%) | `ERP` |
| **Nearwork** | [nearwork/](./nearwork/00_INDEX.md) | 32 files | In Development | `nextwork` |
| **Threads Automation** | [threads-automation/](./threads-automation/00_INDEX.md) | 4 files | Planned | `auto` |
| **Trusted Jurist (TJ)** | [tj/](./tj/00_INDEX.md) | 12 files | Go-live readiness | `tj` |
| **Propose (Entro LY)** | [propose/](./propose/00_INDEX.md) | 1 DOCX | Proposal | `propose` |

**Total: ~140 markdown + 1 DOCX + 2 ZIP archives**

---

## 🔄 Latest Updates (July 9, 2026)

| Project | Commit | Perubahan |
|---------|--------|-----------|
| **TJ** | `d0e5382` | Design system fully wired — tokens, UI kit, layout sections, homepage refresh |
| **Nearwork** | `d40ea19` | Security audit statis 2026-07-08 — temuan critical webhook & public credentials |
| **DN People ERP** | `9bf15e2` | V3 implementation status matrix — 392 tests, 27 modules, Enterprise hub |
| **DN Tech Compro** | `d9d534e` | Email SMTP hotfix + V5 troubleshooting guides |
| **company-wiki** | — | Sync docs TJ, Nearwork audit, ERP status, index updates |

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
├── dnpeople-erp/              # ERP System
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

*Last Updated: July 9, 2026*

# DN Tech Company Wiki

> **Author:** Dozer  
> **Date:** 2026-09-05

Knowledge base dan dokumentasi internal untuk **PT. Dozer Napitupulu Technology (DN Tech)**.

**Leadership (internal portfolio):** Dozer — **CEO + Tech Lead + PM**  
**Owner wiki:** Dozer (CEO + Tech Lead + PM)

> **Catatan:** Produk klien **DOVA** punya struktur tim terpisah — lihat [dova/README.md](./docs/products/dova/README.md); tidak termasuk ownership internal di bawah.

## 📚 Daftar Isi

### Company
- [Wiki Index](./docs/01_README.md)
- [Company Overview](./docs/02_COMPANY_OVERVIEW.md)
- [Mission & Vision](./docs/03_MISSION_VISION.md)
- [Organization](./docs/04_ORGANIZATION.md)

### Technical
- [Tech Stack](./docs/05_TECH_STACK.md)
- [Architecture](./docs/06_ARCHITECTURE.md)
- [Development Guidelines](./docs/07_DEV_GUIDELINES.md)

### Products
- [Product Portfolio](./docs/08_PRODUCTS.md)
- [Product Docs Index](./docs/products/README.md) — product folders under `docs/products/`
  - [DN Tech Compro](./docs/products/dntech/00_INDEX.md) (**78** markdown) · [dntech.id](https://dntech.id) · **v0.10.0** · HEAD `8e3b8a7`
  - [dnPeople HRIS](./docs/products/dnPeople/README.md) — [hris.dntech.id](https://hris.dntech.id) · **v1.1.0** · v15 Admin + Xendit PG · next **PRD v16.0**
  - [DN Core ERP](./docs/products/dnpeople-erp/00_INDEX.md) (56 markdown)
  - [dnShop Finance](./docs/products/dnShopee/00_INDEX.md) — [shop.dntech.id](https://shop.dntech.id) · **v2.2.1** · next **v3.0**
  - [DOVA](./docs/products/dova/00_INDEX.md) — [dova.dntech.id](https://dova.dntech.id) · **v0.5.4** · **production live** · HEAD `642b165` · [All-features](./docs/products/dova/All-features.md) · [FEATURE-CATALOG](./docs/products/dova/docs/FEATURE-CATALOG.md)
  - [DuaVulnScanner](./docs/products/dvs/00_INDEX.md) (6 markdown) — Passive vulnerability scanner MVP
  - [Nearwork](./docs/products/nearwork/00_INDEX.md) (38 markdown)
  - [Threads Automation](./docs/products/threads-automation/00_INDEX.md) (26 markdown)
  - [Trusted Jurist (TJ)](./docs/products/tj/00_INDEX.md) (17 markdown)
  - [Propose / Entro LY](./docs/products/propose/00_INDEX.md) (1 markdown + 1 DOCX)
  - [aca (Catat Duit)](./docs/products/aca/README.md) — pointer ke **private-wiki** (bukan produk tim)
- [Compro PRD Summary](./products/09_COMPRO_PRD.md)
- [Compro Spec Summary](./products/10_COMPRO_SPEC.md)
- [Careers PRD Summary](./products/11_CAREERS_PRD.md)
- [Careers Spec Summary](./products/12_CAREERS_SPEC.md)

### Setup & Contributing
- [Start Here](./guidline/START_HERE.md)
- [Setup Guide](./SETUP_GUIDE.md)
- [Quick Reference](./QUICK_REFERENCE.md)
- [Contributing](./CONTRIBUTING.md)

## 🚀 Getting Started

1. Clone repository ini
2. Buka folder di VS Code
3. Mulai dari [docs/01_README.md](./docs/01_README.md) untuk navigasi lengkap
4. Baca [CONTRIBUTING.md](./CONTRIBUTING.md) sebelum menambah dokumentasi

## 📁 Struktur Repository

```
company-wiki/
├── README.md              # Halaman utama (ini)
├── CONTRIBUTING.md        # Panduan kontribusi
├── SETUP_GUIDE.md         # Panduan setup repository
├── QUICK_REFERENCE.md     # Cheat sheet git & VS Code
├── docs/                  # Dokumentasi perusahaan & teknis
│   ├── 01-08...           # Company & technical docs
│   └── products/          # Source docs per produk (427 markdown + 1 DOCX + 4 ZIP)
│       ├── dntech/
│       ├── dnPeople/      # HRIS (repo dnpeople)
│       ├── dnpeople-erp/  # Full ERP (repo ERP) — terpisah
│       ├── dnShopee/      # dnShop Finance (repo dnShopee) — v2.2.1
│       ├── aca/            # Catat Duit — stub → private-wiki/aca/
│       ├── dova/           # Marketplace (MVP → operations launch)
│       ├── dvs/            # DuaVulnScanner (passive scanner MVP)
│       ├── nearwork/
│       ├── threads-automation/
│       ├── tj/
│       └── propose/
├── products/              # PRD & spec summary (09-12)
├── templates/             # Template dokumen
├── images/                # Screenshot & aset visual
├── diagrams/              # Diagram arsitektur
├── archive/               # Dokumen arsip
└── guidline/              # Panduan setup awal
```

## 📝 Contributing

Lihat [CONTRIBUTING.md](./CONTRIBUTING.md) untuk guidelines penulisan, format commit, dan workflow PR.

## 📄 License

Confidential — DN Tech Internal Documentation

---

*Last Updated: September 5, 2026 · Leadership: CEO + Tech Lead + PM (Dozer)*

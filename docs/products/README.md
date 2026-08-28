# Product Documentation Index

**Document Version**: 1.10
**Last Updated**: August 28, 2026
**Status**: Published
**Owner**: Dozer

---

Semua dokumentasi produk DN Tech dikelompokkan per produk di folder ini.

## 📦 Products

| Product | Folder | Docs | Status | Repository |
|---------|--------|------|--------|------------|
| **DN Tech Compro** | [dntech/](./dntech/00_INDEX.md) | 37 files | Production (v5) | `dntech` |
| **dnPeople HRIS** | [dnPeople/](./dnPeople/00_INDEX.md) | Living + PRD v15 + **v1.1.0** | Production · **v1.1.0** shipped · ops gates Conditional | `dnpeople` |
| **dnCore (ERP)** | [dnpeople-erp/](./dnpeople-erp/00_INDEX.md) | PRD/SDD/SRS + refactor + deployment | Express + Remix · PM2/Nginx · 408/88 | `ERP` |
| **dnShop Finance** | [dnShopee/](./dnShopee/00_INDEX.md) | Living + SOPI PRD/SRS/SDD + UI2 Design | **v2.1 SOPI + UI2 Implemented** · next v2.2 | `dnShopee` |
| **DuaVulnScanner** | [dvs/](./dvs/00_INDEX.md) | PRD/SRS/SDD + MVP scaffold | Week 1 scaffold · passive scanner | `dvs` |
| **DOVA** | [dova/](./dova/00_INDEX.md) | Full docs + PRD/SRS/SDD + QA/release audit + **FEATURE-CATALOG** | **v0.5.4** · **production live** · HEAD `9e37a8a` · [dova.dntech.id](https://dova.dntech.id) | `dova` + **`dova-company-wiki`** |
| **Nearwork** | [nearwork/](./nearwork/00_INDEX.md) | 32 files | In Development | `nextwork` |
| **Threads Automation** | [threads-automation/](./threads-automation/00_INDEX.md) | Living docs + PRD/SRS/SDD + NEXT-PRD-BRIEF | MVP in repo · live publish Conditional | `auto` |
| **Trusted Jurist (TJ)** | [tj/](./tj/00_INDEX.md) | 12 files | Go-live readiness | `tj` |
| **Propose (Entro LY)** | [propose/](./propose/00_INDEX.md) | 1 DOCX | Proposal | `propose` |

**Total: markdown docs across products + 1 DOCX + archives**

---

## 🔄 Latest Updates (August 28, 2026)

| Project | Commit / note | Perubahan |
|---------|---------------|-----------|
| **DOVA** | app `9e37a8a` / wiki sync | **FEATURE-CATALOG lengkap** — 11 modul · 151 tests · smoke 29+10 · profile self-service · auth OTP auto-resend |
| **DOVA** | app `dcb5c2f` / tag **v0.5.2** | Production live — release audit + QA docs mirrored |
| **DOVA** | app `00c8601` / wiki sync | **v0.5.0** — admin user management, Remember Me, backend hardening, supplier approve fix |
| **dnPeople HRIS** | app `a51d839` / wiki sync | **v1.1.0** — a11y CI (16 tests), payment idempotency, SUPER_ADMIN routing, `/metrics` token gate, demo creds, chaos scaffold; mirror README + CHANGELOG |
| **dnShop Finance** | SOPI + UI2 6 Agu | Wiki product baru: STATUS, FEATURE-CATALOG, SOPI PRD/SRS/SDD Implemented, NEXT-PRD-BRIEF → **v2.2** |
| **Threads Automation** | docs tree 24 Jul | Living docs di `auto/docs/` + wiki: status MVP, FEATURE-CATALOG, **NEXT-PRD-BRIEF** (live publish & media) |
| **dnPeople HRIS** | app `8a75871` / docs `e7cf0ca` | Soft-launch **release-ready**: secrets fail-closed, demo creds gated, smoke expanded, RELEASE-READY + launch checklist mirrored |
| **DuaVulnScanner** | scaffold 24 Jul | New product `dvs/` from PENTEST_TOOL prompts — PRD/SRS/SDD + Nest/Next MVP |
| **DOVA** | app `27db4da` | Full product docs tree: PRD/SRS/SDD, CURRENT-IMPLEMENTATION, catalog, API, runbook, progress/status |
| **dnCore (ERP)** | `fdc12c2` | Phase 8 close-out: revenue share, reseller, depth — **408** tests / **88** suites · **86** entities · **18** migrations |
| **TJ** | `d0e5382` | Design system fully wired — tokens, UI kit, layout sections, homepage refresh |
| **Nearwork** | `d40ea19` | Security audit statis 2026-07-08 — temuan critical webhook & public credentials |
| **DN Tech Compro** | `8c5bd47+` | Jul 9 malam — homepage PRD Indonesia, hide tech/tim section, harga UMKM |
| **company-wiki** | — | dnPeople release-ready docs + DOVA current-phase |

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
├── dnpeople-erp/              # dnCore ERP (Express + Remix) — path legacy; brand dnCore
├── dnShopee/                  # dnShop Finance (Shopee seller + pembukuan)
├── dvs/                       # DuaVulnScanner (pentest platform)
├── dova/                      # DOVA marketplace — full docs + PRD (MVP → ops launch)
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

*Last Updated: August 6, 2026*

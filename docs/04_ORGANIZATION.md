# Organization Structure

**Document Version**: 1.1  
**Last Updated**: July 18, 2026  
**Status**: Published  
**Owner**: Dozer (CEO + Tech Lead)  
**Company**: DN Tech (PT. Dozer Napitupulu Technology)  
**Brand**: DN Tech (DN Tech.id)  
**UpdatedAt**: July 18, 2026  

---

## 📋 Table of Contents

- [Struktur Organisasi](#struktur-organisasi)
- [Leadership Team](#leadership-team)
- [Departemen](#departemen)
- [Role & Responsibilities](#role--responsibilities)
- [Reporting Lines](#reporting-lines)
- [Hiring & Growth](#hiring--growth)

---

## Struktur Organisasi

```
                        ┌─────────────┐
                        │     CEO     │
                        │   (Dozer)   │
                        │ + Tech Lead │
                        └──────┬──────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
   ┌──────▼──────┐     ┌──────▼──────┐     ┌──────▼──────┐
   │  Technology │     │   Product   │     │  Operations │
   │    (CTO)    │     │ (VP Product)│     │    (COO)    │
   │      —      │     │      —      │     │      —      │
   └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
          │                    │                    │
   ┌──────┴──────┐     ┌──────┴──────┐     ┌──────┴──────┐
   │ Engineering │     │   Design    │     │  HR & Admin │
   │   DevOps    │     │  Marketing  │     │   Finance   │
   └─────────────┘     └─────────────┘     │(Nur Annisa  │
                                            │  Sofyan)    │
                                            └─────────────┘
```

> **Sumber kebenaran nama & jabatan:** hanya nama yang tercantum di tabel Leadership di bawah yang resmi.  
> Saat ini terisi: **CEO + Tech Lead** (Dozer) dan **Finance** (Nur Annisa Sofyan).  
> Posisi CTO, VP Product, Head of Design, Head of Sales, COO masih **vacant** (—).  
> Profil perusahaan ringkas: [Company Overview](./02_COMPANY_OVERVIEW.md).

---

## Leadership Team

| Role | Nama | Tanggung Jawab |
|------|------|----------------|
| **CEO + Tech Lead** | Dozer | Strategi perusahaan, business development, arsitektur teknis, quality engineering (sementara memegang Tech Lead sampai CTO terisi) |
| **CTO** | — | Engineering leadership, tech stack, infrastructure |
| **VP Product** | — | Product roadmap, PRD, stakeholder management |
| **Head of Design** | — | UI/UX, design system, brand identity |
| **Head of Sales** | — | Client acquisition, partnerships, proposals |
| **COO** | — | Operasional, HR, admin |
| **Finance** | Nur Annisa Sofyan | Keuangan, invoicing, budgeting, compliance |

> Tim dalam fase growth. Posisi **—** diisi sesuai kebutuhan scaling. Jangan mengisi nama fiktif di wiki atau website.

---

## Departemen

### Technology (Engineering)

**Fokus**: Pengembangan software, infrastruktur, dan quality assurance.  
**Interim lead**: CEO + Tech Lead (Dozer) sampai CTO terisi.

| Sub-team | Fungsi |
|----------|--------|
| Frontend | Next.js, React, UI implementation |
| Backend | Express/Nest API, database, integrations |
| DevOps | Deployment, CI/CD, monitoring |
| QA | Testing, performance audit |

**Tech stack detail**: [Tech Stack](./05_TECH_STACK.md)

### Product

**Fokus**: Product management, requirements, dan user experience.

| Sub-team | Fungsi |
|----------|--------|
| Product Management | PRD, roadmap, prioritization |
| UX Research | User interviews, analytics insights |
| Documentation | Wiki, API docs, onboarding guides |

Produk aktif: Company Profile (dntech.id), **dnPeople HRIS**, Careers module — lihat [Products](./08_PRODUCTS.md).

### Design

**Fokus**: Visual design, design system, dan brand consistency.

- Design system V2: solid colors, Indonesian copy, startup/SME positioning
- Brand publik: **DN Tech.id** (`rlogo2` + wordmark)
- Tools: Figma, Tailwind CSS design tokens
- Deliverables: mockups, component library, style guide

### Operations

**Fokus**: HR, finance, admin, dan client success.

| Sub-team | Fungsi | Status |
|----------|--------|--------|
| HR | Recruitment, onboarding, culture | Vacant lead |
| Finance | Invoicing, budgeting, compliance | **Nur Annisa Sofyan** |
| Client Success | Post-delivery support, account management | Vacant |

### Marketing & Sales

**Fokus**: Brand visibility, lead generation, dan client acquisition.

- Website content management via Admin CMS (dntech.id)
- SEO optimization (id_ID locale)
- Lead tracking via admin dashboard
- Email automation (info@dntech.id)
- Product showcase: `/products` (dnPeople flagship)

---

## Role & Responsibilities

### Engineering Roles

| Role | Level | Key Responsibilities |
|------|-------|---------------------|
| Tech Lead | Senior | Architecture decisions, code review, mentoring *(saat ini dipegang CEO)* |
| Full Stack Developer | Mid-Senior | Feature development end-to-end |
| Frontend Developer | Mid | UI components, responsive design, SEO |
| Backend Developer | Mid | API, database, security, integrations |
| DevOps Engineer | Mid | Infrastructure, deployment, monitoring |

### Admin CMS Roles (dntech.com / dntech.id)

| Role | Akses | Permissions |
|------|-------|-------------|
| SuperAdmin | Full | All CRUD, user management, settings |
| ContentManager | Content + Leads | CRUD konten, view leads, analytics |
| Editor | Content (limited) | View & edit assigned content |
| Viewer | Read-only | View content, leads, analytics |

Detail RBAC: [Architecture](./06_ARCHITECTURE.md#keamanan--rbac)

---

## Reporting Lines

```
CEO + Tech Lead (Dozer)
├── CTO (—) → Engineering Team, DevOps
│     └── (interim: report langsung ke CEO + Tech Lead)
├── VP Product (—) → Product Team, Documentation
├── Head of Design (—) → Design Team
├── Head of Sales (—) → Marketing, Client Success
└── COO (—) → HR, Admin
      └── Finance (Nur Annisa Sofyan)
```

### Communication Channels

| Channel | Purpose |
|---------|---------|
| Slack #engineering | Technical discussions |
| Slack #documentation | Wiki updates & reviews |
| Slack #general | Company announcements |
| GitHub Issues | Bug reports, feature requests |
| Email info@dntech.id | Company / sales inquiries |
| Email docs@dntech.id | Documentation questions |

---

## Hiring & Growth

### Posisi Terbuka

Lowongan aktif dipublikasikan di [dntech.id/careers](https://dntech.id/careers) dan dikelola via Admin CMS.

### Proses Rekrutmen

1. **Application** — Submit via careers page
2. **Screening** — HR review CV & portfolio
3. **Technical Assessment** — Coding challenge / case study
4. **Interview** — Culture fit + technical deep-dive
5. **Offer** — Compensation & start date

Detail modul careers: [Careers PRD](../products/11_CAREERS_PRD.md)

### Onboarding Checklist

- [ ] Akses GitHub organization
- [ ] Setup development environment ([Dev Guidelines](./07_DEV_GUIDELINES.md))
- [ ] Baca company wiki (docs 01–08), terutama [Company Overview](./02_COMPANY_OVERVIEW.md) + dokumen ini
- [ ] Intro meeting dengan team lead
- [ ] First task assignment (small, well-scoped)

---

## 📄 Related Documents

- [Company Overview](./02_COMPANY_OVERVIEW.md)
- [Mission & Vision](./03_MISSION_VISION.md)
- [Products](./08_PRODUCTS.md)
- [Dev Guidelines](./07_DEV_GUIDELINES.md)
- [Careers PRD](../products/11_CAREERS_PRD.md)

---

| | |
|---|---|
| Owner | Dozer (CEO + Tech Lead) |
| Company | DN Tech (PT. Dozer Napitupulu Technology) |
| Brand | DN Tech (DN Tech.id) |
| UpdatedAt | July 18, 2026 |

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026

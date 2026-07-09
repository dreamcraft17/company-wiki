# Organization Structure

**Document Version**: 1.0  
**Last Updated**: July 9, 2026  
**Status**: Published  
**Owner**: Dozer

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

> **Catatan:** Struktur jabatan leadership tetap berlaku. Saat ini yang sudah terisi namanya: **CEO** (Dozer) dan **Finance** (Nur Annisa Sofyan). Posisi lain (CTO, VP Product, Head of Design, Head of Sales, COO) masih **vacant** — ditandai **—** sampai ada penunjukan resmi.

---

## Leadership Team

| Role | Nama | Tanggung Jawab |
|------|------|----------------|
| **CEO** | Dozer | Strategi perusahaan, business development, arsitektur teknis |
| **CTO** | — | Engineering leadership, tech stack, infrastructure |
| **VP Product** | — | Product roadmap, PRD, stakeholder management |
| **Head of Design** | — | UI/UX, design system, brand identity |
| **Head of Sales** | — | Client acquisition, partnerships, proposals |
| **COO** | — | Operasional, HR, admin |
| **Finance** | Nur Annisa Sofyan | Keuangan, invoicing, budgeting, compliance |

> Tim sedang dalam fase growth. Posisi dengan nama **—** akan diisi sesuai kebutuhan scaling.

---

## Departemen

### Technology (Engineering)

**Fokus**: Pengembangan software, infrastruktur, dan quality assurance.

| Sub-team | Fungsi |
|----------|--------|
| Frontend | Next.js, React, UI implementation |
| Backend | Express API, database, integrations |
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

### Design

**Fokus**: Visual design, design system, dan brand consistency.

- Design system V2: solid colors, Indonesian copy, startup/SME positioning
- Tools: Figma, Tailwind CSS design tokens
- Deliverables: mockups, component library, style guide

### Operations

**Fokus**: HR, finance, admin, dan client success.

| Sub-team | Fungsi |
|----------|--------|
| HR | Recruitment, onboarding, culture |
| Finance | Invoicing, budgeting, compliance |
| Client Success | Post-delivery support, account management |

### Marketing & Sales

**Fokus**: Brand visibility, lead generation, dan client acquisition.

- Website content management via Admin CMS
- SEO optimization (id_ID locale)
- Lead tracking via admin dashboard
- Email automation (info@dntech.id)

---

## Role & Responsibilities

### Engineering Roles

| Role | Level | Key Responsibilities |
|------|-------|---------------------|
| Tech Lead | Senior | Architecture decisions, code review, mentoring |
| Full Stack Developer | Mid-Senior | Feature development end-to-end |
| Frontend Developer | Mid | UI components, responsive design, SEO |
| Backend Developer | Mid | API, database, security, integrations |
| DevOps Engineer | Mid | Infrastructure, deployment, monitoring |

### Admin CMS Roles (Internal)

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
CEO (Dozer)
├── CTO (—) → Engineering Team, DevOps
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
- [ ] Baca company wiki (docs 01–08)
- [ ] Intro meeting dengan team lead
- [ ] First task assignment (small, well-scoped)

---

## 📄 Related Documents

- [Company Overview](./02_COMPANY_OVERVIEW.md)
- [Mission & Vision](./03_MISSION_VISION.md)
- [Dev Guidelines](./07_DEV_GUIDELINES.md)
- [Careers PRD](../products/11_CAREERS_PRD.md)

---

*Last Updated: July 9, 2026*

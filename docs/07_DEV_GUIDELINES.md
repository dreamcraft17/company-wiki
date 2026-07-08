# Development Guidelines

**Document Version**: 1.0  
**Last Updated**: July 8, 2026  
**Status**: Published  
**Owner**: CTO / Tech Lead

---

## 📋 Table of Contents

- [Principles](#principles)
- [Repository Structure](#repository-structure)
- [Coding Standards](#coding-standards)
- [Git Workflow](#git-workflow)
- [Environment Setup](#environment-setup)
- [Testing Strategy](#testing-strategy)
- [Code Review Checklist](#code-review-checklist)
- [Common Pitfalls](#common-pitfalls)
- [Resources](#resources)

---

## Principles

### 1. Production Mindset

Setiap fitur harus **production-ready** — bukan prototype atau demo. Artinya:

- Validasi input di client dan server
- Error handling yang proper
- Logging untuk debugging
- Tidak ada hardcoded content di frontend

### 2. Documentation-First

- Tulis PRD/SDD sebelum implementasi fitur besar
- Update wiki setelah perubahan arsitektur
- Comment hanya untuk non-obvious business logic
- API endpoints harus terdokumentasi

### 3. Security by Default

- JWT + RBAC untuk semua admin endpoints
- Rate limiting pada public endpoints
- Validasi dengan Zod di server-side
- Jangan commit secrets (gunakan `.env`)

### 4. Simplicity Over Cleverness

- Pilih solusi paling sederhana yang correct
- Hindari premature optimization
- Reuse existing components dan patterns
- Satu file per concern, jangan over-abstract

---

## Repository Structure

### Main Project (`dntech/`)

```
dntech/
├── backend/
│   ├── prisma/          # Schema, migrations, seed
│   ├── src/
│   │   ├── routes/      # API route handlers
│   │   ├── middleware/  # Auth, RBAC
│   │   ├── services/    # Business logic
│   │   └── utils/       # Helpers
│   └── uploads/         # Media files
├── frontend/
│   └── src/
│       ├── app/         # Next.js pages
│       ├── components/  # Reusable UI
│       ├── contexts/    # React contexts
│       ├── lib/         # API client, utils
│       └── types/       # TypeScript interfaces
├── docs/                # Project documentation
└── docker-compose.yml
```

### Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Files (docs) | `NN_UPPERCASE.md` | `05_TECH_STACK.md` |
| Files (code) | kebab-case | `email-service.ts` |
| Components | PascalCase | `AdminCrudPage.tsx` |
| Functions | camelCase | `apiFetch()` |
| Constants | UPPER_SNAKE | `JWT_EXPIRES_IN` |
| Database tables | snake_case | `form_submissions` |
| API endpoints | kebab-case | `/api/v1/case-studies` |

---

## Coding Standards

### TypeScript

```typescript
// ✅ Gunakan explicit types untuk function parameters
function createService(data: CreateServiceInput): Promise<Service> {
  return prisma.service.create({ data });
}

// ✅ Gunakan Zod untuk validation
const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(10),
});

// ❌ Hindari `any`
const result: any = await fetch(...);  // BAD
```

### React / Next.js

```typescript
// ✅ Server Component untuk data fetching
export default async function ServicesPage() {
  const services = await fetchServices();
  return <ServiceGrid services={services} />;
}

// ✅ Client Component hanya jika perlu interactivity
'use client';
export function FaqAccordion({ items }: { items: Faq[] }) {
  const [open, setOpen] = useState<number | null>(null);
  // ...
}

// ✅ Consistent component structure
// 1. Imports
// 2. Types/interfaces
// 3. Component
// 4. Sub-components (if small)
```

### API Routes

```typescript
// ✅ Consistent response format
router.get('/services', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { status: 'active', deletedAt: null },
    });
    return res.json(successResponse(services));
  } catch (error) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', error.message));
  }
});

// ✅ Always validate input
router.post('/forms/contact', validate(contactSchema), async (req, res) => {
  // ...
});
```

### CSS / Tailwind

- Gunakan utility classes, hindari custom CSS kecuali design tokens
- Responsive: mobile-first (`md:`, `lg:` breakpoints)
- Gunakan CSS variables untuk primary color dari settings
- Prose classes untuk HTML content (blog, legal pages)

---

## Git Workflow

### Branch Naming

```
docs/[type]/[description]     # Documentation changes
feat/[feature-name]           # New features
fix/[bug-description]         # Bug fixes
refactor/[scope]              # Code reorganization
```

### Commit Message Format

```
[TYPE]([SCOPE]): [SUBJECT]

[BODY]

[FOOTER]
```

**Types**: `docs`, `feat`, `fix`, `update`, `refactor`, `ci`

**Examples**:

```bash
git commit -m "feat(careers): Add job application email notification"
git commit -m "docs(tech-stack): Update PostgreSQL configuration"
git commit -m "fix(auth): Resolve JWT expiry edge case"
```

### Pull Request Workflow

1. Create feature branch dari `main`
2. Implement + test locally
3. Push dan create PR di GitHub
4. Request reviewer
5. Address feedback
6. Merge setelah approval
7. Delete branch

Detail: [CONTRIBUTING.md](../CONTRIBUTING.md)

---

## Environment Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 13+ (atau Docker)
- npm 9+
- Git

### Quick Start

```bash
# Database
docker compose up -d db

# Backend
cd backend
cp .env.example .env
npm install
npx prisma db push
npm run db:seed
npm run dev    # → http://localhost:4000

# Frontend (terminal baru)
cd frontend
cp .env.example .env.local
npm install
npm run dev    # → http://localhost:3000
```

### Environment Variables

**Backend** (`.env`):

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Min 32 chars di production |
| `FRONTEND_URL` | ✅ | CORS origin |
| `SMTP_HOST` | — | Email server |
| `SMTP_USER` | — | SMTP username |

**Frontend** (`.env.local`):

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API URL |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Canonical site URL |

> **Penting**: `NEXT_PUBLIC_*` di-bake saat build. Rebuild frontend setelah mengubahnya.

### Default Admin Credentials

```
Email:    admin@dntech.id
Password: Admin@123456
```

> Ganti password segera setelah deploy production.

---

## Testing Strategy

### Manual Testing Checklist

Sebelum merge PR:

- [ ] `npm run build` sukses (frontend & backend)
- [ ] `npm run lint` tanpa error
- [ ] Test di browser (desktop + mobile viewport)
- [ ] Test form submission end-to-end
- [ ] Test admin CRUD operations
- [ ] Verify email delivery (jika email-related)

### Build Verification

```bash
# Frontend
cd frontend && npm run build

# Backend
cd backend && npm run build
```

### Performance Testing

- Lighthouse audit di production
- Check Core Web Vitals (LCP, FID, CLS)
- API response time < 200ms untuk cached endpoints

---

## Code Review Checklist

### Reviewer harus cek:

**Functionality**
- [ ] Fitur bekerja sesuai requirements
- [ ] Edge cases ditangani
- [ ] Error states ditampilkan ke user

**Security**
- [ ] Input divalidasi server-side
- [ ] Auth/RBAC diterapkan pada admin endpoints
- [ ] Tidak ada secrets di code
- [ ] Rate limiting pada public endpoints

**Code Quality**
- [ ] TypeScript types proper (no `any`)
- [ ] Consistent dengan existing patterns
- [ ] Tidak ada dead code atau console.log
- [ ] Components reusable where appropriate

**Documentation**
- [ ] API changes terdokumentasi
- [ ] Environment variables baru di `.env.example`
- [ ] Wiki updated jika arsitektur berubah

---

## Common Pitfalls

### 1. Hardcoded Content

```typescript
// ❌ Wrong — hardcoded di frontend
const stats = [{ value: "100+", label: "Projects" }];

// ✅ Correct — fetch dari API/settings
const settings = await fetchSettings();
const stats = settings.homeStats;
```

### 2. Missing Server Validation

```typescript
// ❌ Wrong — hanya client validation
if (email.includes('@')) submitForm(data);

// ✅ Correct — Zod validation di server
router.post('/forms/contact', validate(contactSchema), handler);
```

### 3. Forgetting Cache Invalidation

Setelah admin update content, pastikan public API cache di-invalidate.

### 4. NEXT_PUBLIC_* Without Rebuild

Mengubah `NEXT_PUBLIC_API_URL` tanpa `npm run build` tidak akan berpengaruh di production.

### 5. Committing Secrets

```bash
# ❌ Never commit
.env
.env.local
secrets/

# ✅ Use placeholders in docs
JWT_SECRET=<YOUR_256_BIT_SECRET>
```

---

## Resources

| Resource | Link |
|----------|------|
| Next.js Docs | https://nextjs.org/docs |
| Prisma Docs | https://www.prisma.io/docs |
| Express Docs | https://expressjs.com |
| Tailwind CSS | https://tailwindcss.com/docs |
| Zod | https://zod.dev |
| Git Handbook | https://guides.github.com/introduction/git-handbook |

---

## 📄 Related Documents

- [Tech Stack](./05_TECH_STACK.md)
- [Architecture](./06_ARCHITECTURE.md)
- [Contributing](../CONTRIBUTING.md)
- [Quick Reference](../QUICK_REFERENCE.md)

---

*Last Updated: July 8, 2026*

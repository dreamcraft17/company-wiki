# Technical Specification (SDD)
## DN Tech Careers Module

**Document Version**: 1.0  
**Last Updated**: July 8, 2026  
**Status**: Published  
**Owner**: CTO / Tech Lead

---

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Database Design](#database-design)
- [API Specification](#api-specification)
- [Email System](#email-system)
- [Security](#security)
- [Testing Strategy](#testing-strategy)
- [Deployment](#deployment)

---

## Architecture Overview

Careers module adalah **sub-module** dari Company Profile Website, berbagi infrastruktur yang sama:

```
/careers (Public)  →  GET /api/v1/careers  →  Career model
/careers/[id]      →  Job detail page
Apply Form         →  POST /api/v1/forms/career  →  FormSubmission + Email
/admin/careers     →  CRUD /api/v1/admin/careers  →  Career model
/admin/leads       →  View applications (type: career)
```

### Integration Points

| System | Integration |
|--------|-------------|
| Company Profile | Shared frontend, backend, database |
| Lead Management | Applications stored as FormSubmission |
| Email System | Career-specific email templates |
| Analytics | Page views tracked on /careers |

---

## Frontend Architecture

### Public Pages

```
frontend/src/app/(public)/careers/
├── page.tsx              # Job listings
└── [slug]/page.tsx       # Job detail (if applicable)
```

### Careers Listing Page

**File**: `careers/page.tsx`  
**Rendering**: Server Component

```typescript
// Data fetching
const careers = await fetch(`${API_URL}/careers`);
const activeJobs = careers.filter(c => c.status === 'active');
```

**UI Components:**
- Hero section dengan culture message
- Filter bar (department, location, type)
- Job card grid (responsive 1/2/3 columns)
- Empty state jika tidak ada lowongan
- CTA link ke /contact

### Job Detail (Optional Enhancement)

Jika menggunakan slug-based routing:

```
/careers/senior-full-stack-developer
```

Fields displayed:
- Title, department, location, type, level
- Description (HTML)
- Requirements (list)
- Benefits (list)
- Apply button → scroll to form or /contact

### Application Form

**Component**: Integrated in careers page or contact page

```typescript
const careerFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  coverLetter: z.string().min(50),
  resumeUrl: z.string().url().optional(),
  careerId: z.string().uuid().optional(),
  honeypot: z.string().max(0),  // anti-spam
});
```

---

## Backend Architecture

### Routes

| File | Endpoints |
|------|-----------|
| `routes/careers.ts` | Public career listing |
| `routes/forms.ts` | Career application submission |
| `routes/admin.ts` | Admin career CRUD (section) |

### Public Career Route

```typescript
// GET /api/v1/careers
router.get('/careers', async (req, res) => {
  const { department, location, type } = req.query;
  
  const careers = await prisma.career.findMany({
    where: {
      status: 'active',
      ...(department && { department }),
      ...(location && { location }),
      ...(type && { type }),
    },
    orderBy: { displayOrder: 'asc' },
    select: {
      id: true, title: true, department: true,
      location: true, type: true, level: true,
      description: true, requirements: true, benefits: true,
      createdAt: true,
    },
  });
  
  return res.json(successResponse(careers));
});
```

### Career Application Route

```typescript
// POST /api/v1/forms/career
router.post('/forms/career', 
  rateLimit({ windowMs: 3600000, max: 5 }),
  validate(careerFormSchema),
  async (req, res) => {
    const submission = await prisma.formSubmission.create({
      data: {
        type: 'career',
        status: 'new',
        name, email, phone,
        message: coverLetter,
        metadata: { careerId, resumeUrl },
      },
    });

    // Send emails
    await emailService.sendCareerConfirmation(email, name, jobTitle);
    await emailService.sendCareerNotification(submission);

    return res.status(201).json(successResponse({ id: submission.id }));
  }
);
```

### Admin Career CRUD

Uses generic `AdminCrudPage` component:

```typescript
<AdminCrudPage
  title="Careers"
  endpoint="careers"
  fields={[
    { name: 'title', type: 'text', required: true },
    { name: 'department', type: 'text', required: true },
    { name: 'location', type: 'text', required: true },
    { name: 'type', type: 'select', options: ['Full-time', 'Part-time', 'Contract'] },
    { name: 'level', type: 'select', options: ['Junior', 'Mid', 'Senior', 'Lead'] },
    { name: 'description', type: 'textarea', required: true },
    { name: 'requirements', type: 'textarea' },
    { name: 'benefits', type: 'json' },
    { name: 'status', type: 'select', options: ['active', 'inactive'] },
    { name: 'displayOrder', type: 'number' },
  ]}
/>
```

---

## Database Design

### Career Model

```prisma
model Career {
  id           String   @id @default(uuid())
  title        String
  department   String
  location     String
  type         String   // Full-time, Part-time, Contract
  level        String?  // Junior, Mid, Senior, Lead
  description  String   @db.Text
  requirements String?  @db.Text
  benefits     Json?    // ["Health insurance", "Remote work", ...]
  status       String   @default("active") // active | inactive
  displayOrder Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([status])
  @@index([department])
  @@map("careers")
}
```

### FormSubmission (Career Applications)

```prisma
model FormSubmission {
  id        String   @id @default(uuid())
  type      String   // "career"
  status    String   @default("new")
  name      String
  email     String
  phone     String?
  message   String   @db.Text  // cover letter
  metadata  Json?    // { careerId, resumeUrl, jobTitle }
  notes     String?  @db.Text
  assignedTo String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([type])
  @@index([email])
  @@index([status])
  @@map("form_submissions")
}
```

### Seed Data Example

```typescript
await prisma.career.createMany({
  data: [
    {
      title: 'Senior Full Stack Developer',
      department: 'Engineering',
      location: 'Jakarta / Remote',
      type: 'Full-time',
      level: 'Senior',
      description: 'Kami mencari Senior Full Stack Developer...',
      requirements: '- 5+ tahun pengalaman\n- Node.js & React\n- PostgreSQL',
      benefits: ['Health insurance', 'Remote work', 'Learning budget'],
      status: 'active',
      displayOrder: 1,
    },
    {
      title: 'UI/UX Designer',
      department: 'Design',
      location: 'Jakarta',
      type: 'Full-time',
      level: 'Mid',
      description: 'Kami mencari UI/UX Designer...',
      requirements: '- 3+ tahun pengalaman\n- Figma expert\n- Portfolio',
      benefits: ['Health insurance', 'Flexible hours'],
      status: 'active',
      displayOrder: 2,
    },
  ],
});
```

---

## API Specification

### Public Endpoints

| Method | Endpoint | Query Params | Response |
|--------|----------|--------------|----------|
| GET | `/careers` | `department`, `location`, `type` | Active job listings |
| POST | `/forms/career` | — | Application submission |

### POST /forms/career

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+6281234567890",
  "coverLetter": "Saya tertarik dengan posisi Senior Full Stack Developer...",
  "resumeUrl": "https://linkedin.com/in/johndoe",
  "careerId": "uuid-of-job-posting"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { "id": "submission-uuid" },
  "timestamp": "2026-07-08T10:30:00.000Z"
}
```

### Admin Endpoints

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/admin/careers` | Authenticated |
| POST | `/admin/careers` | Write |
| PATCH | `/admin/careers/:id` | Write |
| DELETE | `/admin/careers/:id` | Write |

---

## Email System

### Email Templates

| Template | Trigger | Recipient | Subject |
|----------|---------|-----------|---------|
| `careerApplicationNotification` | Application submitted | info@dntech.id | "New application: [Job Title]" |
| `careerApplicationConfirmation` | Application submitted | Applicant email | "Thank you for applying — DN Tech" |

### Notification Email Content

**To admin (info@dntech.id):**
- Applicant name, email, phone
- Job title applied for
- Cover letter excerpt
- Link to admin leads page

**To applicant:**
- Thank you message
- Position applied for
- Expected response timeline (3–5 business days)
- Company contact info

### Email Service Configuration

```
SMTP_HOST=mx8.mailspace.id
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@dntech.id
ADMIN_EMAIL=info@dntech.id
```

---

## Security

| Aspect | Implementation |
|--------|---------------|
| Rate limiting | 5 applications per hour per IP |
| Honeypot | Hidden field on application form |
| Input validation | Zod schema server-side |
| Email validation | Format check + duplicate detection |
| Admin auth | JWT + requireWrite('careers') |
| XSS prevention | Sanitize cover letter input |

---

## Testing Strategy

### Test Cases

| # | Test | Expected |
|---|------|----------|
| 1 | Visit /careers with active jobs | Job cards displayed |
| 2 | Visit /careers with no active jobs | Empty state shown |
| 3 | Submit valid application | 201 response, emails sent |
| 4 | Submit with invalid email | 400 validation error |
| 5 | Submit 6th application in 1 hour | 429 rate limit |
| 6 | Admin create new job | Appears on /careers |
| 7 | Admin deactivate job | Removed from /careers |
| 8 | Application appears in /admin/leads | Filter type=career |

### Manual Verification

```bash
# 1. Check careers API
curl http://localhost:4000/api/v1/careers

# 2. Submit test application
curl -X POST http://localhost:4000/api/v1/forms/career \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","coverLetter":"Test application letter with enough characters to pass validation."}'

# 3. Check admin leads
# Login to /admin/leads, filter by career type
```

---

## Deployment

Careers module deploys together with Company Profile Website. No separate deployment needed.

### Post-Deploy Checklist

- [ ] At least 1 active job posting in database
- [ ] /careers page renders correctly
- [ ] Application form submits successfully
- [ ] Emails delivered to info@dntech.id
- [ ] Confirmation email received by test applicant
- [ ] Admin CRUD works for careers

---

## 📄 Related Documents

- [Careers PRD](./11_CAREERS_PRD.md)
- [Compro Spec](./10_COMPRO_SPEC.md)
- [Architecture](../docs/06_ARCHITECTURE.md)
- [Dev Guidelines](../docs/07_DEV_GUIDELINES.md)

---

*Last Updated: July 8, 2026*  
*Next Review: October 2026*

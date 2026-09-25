# TECH STACK UPDATE — Threads Automation Bot v3.1

## 🔄 Perubahan dari Original Design

### LLM Provider Alignment
**Original (removed):**
- Claude API (Anthropic)
- OpenRouter (multi-model broker)
- GitHub Codex (fallback)

**New (aligned with project needs):**
- ✅ **Gemini Flash (Google)** — primary, low-latency, cost-effective
- ✅ **GPT Go (OpenAI)** — secondary, higher quality, fallback for complex tasks
- Optional: OpenRouter as tertiary fallback (if budget allows)

---

## 📊 Backend Tech Stack Alignment

### BEFORE (Original design assumed Express)
```
Node.js + Express + TypeScript
```

### AFTER (Aligned with DN Tech stack)
```
Node.js + NestJS + TypeScript
```

**Reason:** NestJS used in dnShop Finance, consistency across DN Tech products

---

## 🎯 Updated Full Tech Stack

### Frontend
- **Framework:** Next.js 14 + React 18 + TypeScript
- **Styling:** Tailwind CSS 3.x
- **State:** Zustand (lightweight, no Redux overhead)
- **HTTP Client:** Axios + TanStack Query (React Query)
- **UI Components:** Headless UI + Radix UI
- **Forms:** React Hook Form
- **Testing:** Vitest + React Testing Library
- **Deployment:** Vercel (native Next.js support)

### Backend
- **Framework:** NestJS 10.x (aligns with dnShop Finance)
- **Language:** TypeScript 5.x
- **ORM:** Prisma 5.x (database agnostic)
- **API:** REST + GraphQL (optional, Phase 2)
- **Job Queue:** Bull 4.x (Redis-backed)
- **Database Migrations:** Prisma migrations
- **Authentication:** Passport.js + JWT
- **Logging:** Winston + NestJS built-in logger
- **Monitoring:** DataDog agent + Sentry
- **Testing:** Jest 29.x + Supertest
- **Deployment:** Docker + AWS EC2 or Vercel

### Database
- **Primary:** PostgreSQL 14.x+ (matches dnPeople, dnShop Finance)
- **Cache:** Redis 6.x+ (job queue + caching)
- **ORM:** Prisma 5.x (replaces raw SQL/custom repositories)
- **Migrations:** Prisma migrate

### AI/LLM
- **Primary:** Google Gemini API (Flash model)
- **Secondary:** OpenAI API (GPT-4o or gpt-4-turbo)
- **Pattern:** Provider-agnostic interface (ILLMProvider)
- **Rate Limiting:** Per-provider configurations
- **Cost Tracking:** Breakdown by provider

### Infrastructure
- **Hosting:** AWS (EC2) or Vercel (Next.js native)
- **Database:** AWS RDS PostgreSQL or managed PostgreSQL
- **Cache:** AWS ElastiCache Redis
- **Secrets:** AWS Secrets Manager
- **CI/CD:** GitHub Actions
- **IaC:** Terraform
- **Monitoring:** DataDog + Sentry + CloudWatch

### Development
- **Runtime:** Node.js 18.x LTS (consistent with dnPeople, dnShop)
- **Package Manager:** npm (or yarn)
- **Environment:** macOS/Homebrew or Linux
- **IDE:** VS Code + TypeScript extensions

---

## 🔌 LLM Provider Configuration

### Gemini Flash (Primary)
```typescript
// .env
LLM_PRIMARY_PROVIDER=gemini
GEMINI_API_KEY=xxx
GEMINI_MODEL=gemini-1.5-flash

// Pricing (as of Sept 2026)
// Input: $0.075 / 1M tokens
// Output: $0.30 / 1M tokens
```

### GPT Go (Secondary - Fallback)
```typescript
// .env
LLM_SECONDARY_PROVIDER=openai
OPENAI_API_KEY=xxx
OPENAI_MODEL=gpt-4-turbo  // or gpt-4o

// Pricing (as of Sept 2026)
// Input: $0.03 / 1K tokens
// Output: $0.06 / 1K tokens
```

### Provider Selection Logic
```typescript
// Priority order (fallback chain)
1. Try Gemini Flash (primary, cost-effective)
   ↓ (if timeout > 30s or rate limit)
2. Try GPT Go (higher quality, slower)
   ↓ (if both fail, circuit breaker opens)
3. Queue for retry (auto-retry next batch)
```

---

## 📋 Updated NestJS Project Structure

```
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── llm-providers/
│   ├── interfaces/
│   │   └── llm-provider.interface.ts
│   ├── gemini/
│   │   ├── gemini.provider.ts
│   │   └── gemini.module.ts
│   ├── openai/
│   │   ├── openai.provider.ts
│   │   └── openai.module.ts
│   └── llm-provider-manager.service.ts
├── posts/
│   ├── posts.controller.ts
│   ├── posts.service.ts
│   ├── posts.module.ts
│   └── entities/
│       └── post.entity.ts
├── approval/
│   ├── approval.controller.ts
│   ├── approval.service.ts
│   └── approval.module.ts
├── scheduling/
│   ├── scheduler.service.ts
│   └── scheduling.module.ts
├── analytics/
│   ├── analytics.controller.ts
│   ├── analytics.service.ts
│   └── analytics.module.ts
├── threads-api/
│   ├── threads-api.service.ts
│   └── threads-api.module.ts
├── common/
│   ├── middleware/
│   ├── guards/
│   ├── pipes/
│   └── filters/
├── database/
│   └── prisma.service.ts
├── config/
│   ├── app.config.ts
│   └── database.config.ts
├── app.module.ts
└── main.ts

prisma/
├── migrations/
│   ├── 001_create_threads_posts/
│   ├── 002_create_approval_logs/
│   ├── 003_create_llm_cost_log/
│   ├── 004_create_brand_guidelines/
│   ├── 005_create_engagement_metrics/
│   └── 006_create_posting_heatmap/
└── schema.prisma

frontend/
├── components/
│   ├── Approval/
│   ├── Generate/
│   ├── Analytics/
│   └── Shared/
├── pages/
│   ├── index.tsx
│   ├── approval.tsx
│   ├── analytics.tsx
│   └── settings.tsx
├── styles/
│   └── globals.css (Tailwind)
├── lib/
│   ├── api.ts (Axios instance)
│   ├── auth.ts
│   └── hooks/
└── next.config.js

tests/
├── unit/
│   ├── llm-providers/
│   ├── posts.service.spec.ts
│   └── approval.service.spec.ts
└── integration/
    ├── posts.e2e.spec.ts
    └── approval.e2e.spec.ts

# Tech Stack Mapping — Threads Automation Bot v3.1
## Alignment with DN Tech Core Stack

---

## 🔄 BEFORE vs AFTER

### LLM Providers

| Aspect | Before (Original) | After (Updated) |
|--------|-------------------|-----------------|
| Primary | Claude API (Anthropic) | **Gemini Flash (Google)** ✅ |
| Secondary | OpenRouter (multi-model) | **GPT Go / GPT-4 Turbo (OpenAI)** ✅ |
| Tertiary | GitHub Codex | OpenRouter (optional) |
| Pattern | ILLMProvider (Claude-first) | **ILLMProvider (Gemini-first)** ✅ |
| Cost Model | Claude pricing | **Gemini: $0.075/$0.30 per 1M tokens** ✅ |
| | | **OpenAI: $0.03/$0.06 per 1K tokens** ✅ |

### Backend Framework

| Aspect | Before | After |
|--------|--------|-------|
| Framework | Express + middleware | **NestJS + modules** ✅ |
| Pattern | Custom controllers | **NestJS @Controller + @Service** ✅ |
| ORM | Raw queries / custom repos | **Prisma 5.x** ✅ |
| Database Migrations | Custom migration system | **Prisma migrate** ✅ |
| Consistency | Varies per project | **Aligned with dnShop Finance** ✅ |

### Frontend

| Aspect | Before | After |
|--------|--------|-------|
| Framework | React 18 + TypeScript | **Next.js 14 + React 18** ✅ |
| Styling | Tailwind CSS | **Tailwind CSS (no change)** ✅ |
| State | Zustand | **Zustand (no change)** ✅ |
| Deployment | Vercel | **Vercel (native Next.js)** ✅ |

### Database

| Aspect | Before | After |
|--------|--------|-------|
| DBMS | PostgreSQL 14 | **PostgreSQL 14+ (no change)** ✅ |
| ORM | Various (Express repos) | **Prisma 5.x (unified)** ✅ |
| Cache | Redis 6 | **Redis 6+ (no change)** ✅ |

---

## 📝 FILE UPDATES REQUIRED

### Documents Affected

| Document | Changes | Status |
|----------|---------|--------|
| PRD v3.1 | Update LLM providers section | ✅ Manual update needed |
| SRS v3.1 | Update provider specs, pricing | ✅ Manual update needed |
| SDD v3.1 | Update code examples (Express → NestJS, Claude → Gemini) | ✅ Code examples provided |
| QUICK_REFERENCE | Update tech stack, cost model | ✅ Manual update needed |
| IMPLEMENTATION_CHECKLIST | Update Sprint 1 NestJS setup | ✅ Already aligned |

### New Documents Created

✅ `TECH_STACK_UPDATE.md` — Tech stack alignment overview  
✅ `NESTJS_LLM_IMPLEMENTATION.md` — NestJS + Gemini + GPT-4 code examples  
✅ `TECH_STACK_MAPPING.md` — This document

---

## 🚀 KEY IMPLEMENTATION CHANGES

### 1. LLM Provider Interface (Same Pattern, Different Implementations)

```typescript
// BEFORE: Claude-first
class ClaudeProvider implements ILLMProvider { /* ... */ }

// AFTER: Gemini-first
class GeminiProvider implements ILLMProvider { /* ... */ }
class OpenAIProvider implements ILLMProvider { /* ... */ }

// Both implement same interface, provider-agnostic manager
class LLMProviderManager {
  async generateContent(prompt, config, preferredProvider?: string)
}
```

### 2. Fallback Chain Priority

```
1st: Gemini Flash (fast, cheap) ← PRIMARY
     ↓ timeout > 30s or rate limit
2nd: GPT Go (slow, expensive) ← FALLBACK
     ↓ both fail
3rd: Queue for retry ← MANUAL INTERVENTION
```

### 3. Cost Calculation

```typescript
// Gemini Flash
const INPUT_PRICE = 0.075 / 1_000_000;   // $0.075 per 1M tokens
const OUTPUT_PRICE = 0.30 / 1_000_000;   // $0.30 per 1M tokens

// GPT-4 Turbo
const INPUT_PRICE = 0.03 / 1000;         // $0.03 per 1K tokens
const OUTPUT_PRICE = 0.06 / 1000;        // $0.06 per 1K tokens

// Cost comparison for 10K tokens
// Gemini: ~$0.0040 (cheap)
// GPT-4:  ~$0.30 (expensive, but higher quality)
```

### 4. NestJS Structure vs Express

```
// BEFORE (Express)
app.post('/api/v1/generate', authMiddleware, (req, res) => {
  const service = new PostsService();
  res.json(await service.generateBatch(...));
});

// AFTER (NestJS)
@Controller('api/v1/posts')
export class PostsController {
  constructor(private postsService: PostsService) {}
  
  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generate(@Body() dto: GenerateDto, @Request() req) {
    return await this.postsService.generateBatch(...);
  }
}
```

### 5. Database Access Pattern

```
// BEFORE (Raw SQL / Custom Repos)
const post = await db.query('INSERT INTO threads_posts ...');

// AFTER (Prisma)
const post = await this.prisma.threadsPost.create({
  data: { /* ... */ }
});
```

---

## 🔧 MIGRATION CHECKLIST

### Environment Variables
- [ ] Update `.env.example` with new provider keys
- [ ] Remove `CLAUDE_API_KEY`
- [ ] Add `GEMINI_API_KEY` (from Google)
- [ ] Add `OPENAI_API_KEY` (from OpenAI)
- [ ] Set `LLM_PRIMARY_PROVIDER=gemini`
- [ ] Set `LLM_SECONDARY_PROVIDER=openai`

### Code Generation
- [ ] Replace Express routes with NestJS `@Controller`
- [ ] Replace custom services with NestJS `@Injectable`
- [ ] Replace raw SQL with Prisma schema + migrations
- [ ] Import `GeminiProvider` and `OpenAIProvider` instead of `ClaudeProvider`
- [ ] Update `LLMProviderManager` to use new providers

### Testing
- [ ] Update mock providers in tests (Gemini + OpenAI)
- [ ] Test provider fallback (Gemini down → OpenAI)
- [ ] Test cost calculation for both providers
- [ ] Update pricing assumptions in cost tests

### Documentation
- [ ] Update all code examples (Express → NestJS)
- [ ] Update pricing references (Claude → Gemini/OpenAI)
- [ ] Update API docs (no endpoint changes, same interface)
- [ ] Update deployment guide (NestJS build steps)

---

## 📊 COST IMPACT ANALYSIS

### Estimated Monthly Costs (1000 posts/month)

#### By Provider (estimated tokens per post: 300 input + 200 output)

**Gemini Flash (Primary):**
- Input: 1000 posts × 300 tokens × $0.075/1M = $0.0225
- Output: 1000 posts × 200 tokens × $0.30/1M = $0.06
- **Total: ~$2.85/month** ← CHEAP

**GPT-4 Turbo (Fallback, ~10% usage):**
- Input: 100 posts × 300 tokens × $0.03/1K = $0.90
- Output: 100 posts × 200 tokens × $0.06/1K = $1.20
- **Total: ~$2.10/month (10% of fallback)** ← EXPENSIVE (but rare)

**Combined Monthly:**
- Gemini: 90% usage → $2.85 × 0.9 = **$2.56**
- OpenAI: 10% usage → $2.10 × 0.1 = **$0.21**
- **Total: ~$2.77/month** ← VERY CHEAP (well under $100/day limit)

---

## ✅ COMPATIBILITY CHECKLIST

### With dnPeople HRIS
- ✅ Uses same tech stack (Next.js, NestJS, PostgreSQL, Prisma)
- ✅ Can share library code (database models, auth, logging)
- ✅ Uses same deployment patterns (GitHub Actions, Terraform)

### With dnShop Finance
- ✅ Uses NestJS (same backend framework)
- ✅ Uses Prisma (same ORM)
- ✅ Uses PostgreSQL (same database)
- ✅ Can share NestJS modules (auth, database, monitoring)

### With NearWork
- ✅ Uses Next.js (same frontend framework)
- ✅ Uses TypeScript (same language)
- ✅ Uses Tailwind CSS (same styling)
- ✅ Can share React components

---

## 🎯 RECOMMENDED APPROACH

### Phase 1: Setup (Days 1-2)
- [ ] Provision Gemini API access
- [ ] Provision OpenAI API access
- [ ] Validate API keys in .env
- [ ] Run quick test calls to both APIs

### Phase 2: Implementation (Days 3-15)
- [ ] Implement `GeminiProvider` + `OpenAIProvider`
- [ ] Setup NestJS project structure
- [ ] Implement `LLMProviderManager` with circuit breaker
- [ ] Create Prisma schema + migrations
- [ ] Build NestJS services and controllers

### Phase 3: Testing (Days 16-18)
- [ ] Unit tests for each provider
- [ ] Integration tests for provider fallback
- [ ] Cost calculation tests
- [ ] Load testing (100+ concurrent requests)

### Phase 4: Launch (Days 19-20)
- [ ] Deploy to staging
- [ ] Monitor costs (should be $0.10-0.30/day)
- [ ] Team training
- [ ] Production deployment

---

## 🆘 SUPPORT & QUESTIONS

**Q: Why Gemini first instead of GPT-4?**  
A: Cost savings ($0.075/M vs $0.03/K tokens). Gemini Flash is 5-10x cheaper for 90% of use cases. GPT-4 as fallback for quality when needed.

**Q: What if Gemini API is down?**  
A: Automatic fallback to OpenAI. Circuit breaker opens after 5 consecutive failures, routes to secondary provider.

**Q: Can we use both simultaneously?**  
A: Yes, via load balancing. Set random provider per request or use heuristics (Gemini for simple topics, GPT-4 for complex).

**Q: Migration path from old design?**  
A: None needed. Provider-agnostic interface means same API. Just swap implementations.

---

**Document Version:** v3.1  
**Created:** 2026-09-13  
**Status:** Implementation Ready  
**Next:** Update PRD/SRS/QUICK_REFERENCE with new tech stack

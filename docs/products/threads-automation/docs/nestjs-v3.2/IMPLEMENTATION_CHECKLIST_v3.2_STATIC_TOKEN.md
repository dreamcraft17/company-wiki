# THREADS AUTOMATION BOT v3.2 — IMPLEMENTATION CHECKLIST
## Static Token Architecture (1 Bot Account, No OAuth)

---

## PRE-DEVELOPMENT SETUP

### Team Setup
- [ ] Assign Backend Lead (Dozer)
- [ ] Create GitHub repository
- [ ] Setup CI/CD (GitHub Actions template)
- [ ] Setup monitoring (DataDog)
- [ ] Setup error tracking (Sentry)

### Documentation
- [ ] Read THREADS_AUTOMATION_PRD_v3.1.md
- [ ] Read THREADS_AUTOMATION_SDD_v3.1.md
- [ ] Read THREADS_API_BEST_PRACTICE.md
- [ ] Read NESTJS_IMPLEMENTATION_v3.2_STATIC_TOKEN.md

---

## SPRINT 1: Foundation (Days 1-5)

### Day 1: Project Setup & AWS Secrets Manager

**Backend Setup**
- [ ] Initialize NestJS project
  ```bash
  nest new threads-automation
  cd threads-automation
  npm install
  ```

- [ ] Install critical dependencies
  ```bash
  npm install @nestjs/config @nestjs/schedule @nestjs/bull
  npm install @google/generative-ai openai
  npm install @prisma/client prisma
  npm install bull redis ioredis
  npm install aws-sdk
  npm install axios helmet cors
  npm install winston
  ```

- [ ] Setup folder structure
  ```
  src/
  ├─ config/
  │  ├─ threads-config.service.ts
  │  └─ database.config.ts
  ├─ database/
  │  ├─ prisma.service.ts
  │  └─ prisma.module.ts
  ├─ threads-api/
  │  ├─ threads-api.service.ts
  │  └─ threads-api.module.ts
  ├─ generate/
  ├─ posts/
  ├─ scheduling/
  ├─ brand-guidelines/
  ├─ app.module.ts
  └─ main.ts
  ```

**AWS Secrets Manager Setup (CRITICAL)**
- [ ] Get @dntech Threads account
  - [ ] Login to Threads as @dntech
  - [ ] Go to Settings → Apps & Websites
  - [ ] Generate access token
  - [ ] Copy token (long string, starts with EAAB...)

- [ ] Store in AWS Secrets Manager
  - [ ] Login to AWS Console
  - [ ] Go to Secrets Manager
  - [ ] Create secret: `/prod/threads/access-token`
  - [ ] Value = the token copied above
  - [ ] Enable rotation policy: Manual (set reminder: 50 days)
  - [ ] Enable audit logging
  - [ ] Test: `aws secretsmanager get-secret-value --secret-id /prod/threads/access-token`

- [ ] Create IAM Role (for EC2/Lambda)
  - [ ] Create IAM role: `threads-automation-service-role`
  - [ ] Add policy: `SecretsManagerReadSecret` (on `/prod/threads/*`)
  - [ ] Add policy: `CloudWatchLogs:CreateLogGroup`, `:CreateLogStream`, `:PutLogEvents`

**Environment Variables**
- [ ] Create `.env` file (use NESTJS_IMPLEMENTATION_v3.2 as template)
  - [ ] DATABASE_URL = PostgreSQL connection
  - [ ] REDIS_URL = Redis connection
  - [ ] AWS_REGION = ap-southeast-1
  - [ ] THREADS_USER_ID = @dntech Threads ID
  - [ ] THREADS_SECRETS_NAME = `/prod/threads/access-token`
  - [ ] LLM_PRIMARY_PROVIDER = `gemini`
  - [ ] LLM_SECONDARY_PROVIDER = `openai`
  - [ ] GEMINI_API_KEY = (from Google Cloud Console)
  - [ ] OPENAI_API_KEY = (from OpenAI)
  - [ ] JWT_SECRET = (generate random: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
  - [ ] **Do NOT** add THREADS_ACCESS_TOKEN (comes from AWS Secrets Manager!)

- [ ] Setup local PostgreSQL + Redis
  - [ ] Start PostgreSQL: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:14`
  - [ ] Start Redis: `docker run -d -p 6379:6379 redis:7`
  - [ ] Verify connections: `psql postgresql://postgres:postgres@localhost/postgres`

---

### Day 2: Database Schema & Prisma Setup

**Prisma Setup**
- [ ] Create `prisma/schema.prisma` (use NESTJS_IMPLEMENTATION_v3.2 as template)
  - [ ] Set provider = "postgresql"
  - [ ] Add 8 models: ThreadsPost, ApprovalLog, ThreadsPublishLog, LLMCostLog, BrandGuideline, EngagementMetric, PostingHeatmap, ThirdPartyToken
  - [ ] Add proper indexes and relationships

- [ ] Run migrations
  ```bash
  npx prisma migrate dev --name init
  ```

- [ ] Verify database
  - [ ] Check PostgreSQL: `\dt` (list tables)
  - [ ] Verify 8 tables created
  - [ ] Generate Prisma Client: `npx prisma generate`

- [ ] Seed initial data (optional)
  ```bash
  npx prisma db seed
  ```
  (Add brand_guidelines, posting_heatmap defaults)

**Database Verification**
- [ ] Connect via `psql` and verify:
  - [ ] tables exist
  - [ ] columns match schema
  - [ ] indexes created

---

### Day 3: Threads Config Service & AWS Secrets Manager Integration

**ThreadsConfigService Implementation**
- [ ] Create `src/config/threads-config.service.ts`
  - [ ] Initialize AWS Secrets Manager client
  - [ ] Implement `getAccessToken()` (with 5-min cache)
  - [ ] Implement `checkTokenExpiry()`
  - [ ] Implement `logTokenAccess()` (audit trail)
  - [ ] Add error handling for Secrets Manager failures

- [ ] Create `src/config/config.module.ts`
  - [ ] Register ThreadsConfigService as provider
  - [ ] Export for other modules

- [ ] Test ThreadsConfigService
  - [ ] Mock AWS Secrets Manager (or use real if setup)
  - [ ] Test token fetch
  - [ ] Test token caching (verify only 1 AWS call in 5 min)
  - [ ] Test token expiry check
  - [ ] Test error handling (token not found, etc.)

**Database Token Storage**
- [ ] Insert initial Threads token into `third_party_tokens` table
  ```sql
  INSERT INTO third_party_tokens 
  (provider, token, acquired_at, expires_at) 
  VALUES ('threads', 'EAAB...', NOW(), NOW() + interval '60 days');
  ```

---

### Day 4: Threads API Service

**ThreadsAPIService Implementation**
- [ ] Create `src/threads-api/threads-api.service.ts`
  - [ ] Inject ThreadsConfigService + PrismaService
  - [ ] Implement `publishPost(text)` (main public method)
  - [ ] Implement `createContainer(text)` (Step 1)
  - [ ] Implement `publishContainer(creationId)` (Step 2)
  - [ ] Implement `deleteContainer(creationId)` (cleanup on error)
  - [ ] Implement `checkRateLimit()` (250/24h limit)
  - [ ] Implement `retryableRequest()` (exponential backoff, 3x retries)

- [ ] Error Handling
  - [ ] Retry logic: 1s, 2s, 4s backoff
  - [ ] Don't retry on 4xx (client errors)
  - [ ] Retry on 5xx (server errors)
  - [ ] Detailed error logging
  - [ ] Cleanup container on failure

- [ ] Test ThreadsAPIService
  - [ ] Mock Threads API responses
  - [ ] Test successful publish flow
  - [ ] Test rate limit check
  - [ ] Test retry logic (simulate failures)
  - [ ] Test cleanup on error
  - [ ] Test invalid text length (> 500 chars)

---

### Day 5: Bull Queue & Publish Scheduler

**Setup Bull Queue**
- [ ] Install Bull: `npm install bull`
- [ ] Create `src/scheduling/scheduling.module.ts`
  - [ ] Register Bull queue: `'publish'`
  - [ ] Configure Redis connection
  - [ ] Set queue options (attempts, backoff)

**PublishScheduler Implementation**
- [ ] Create `src/scheduling/publish.scheduler.ts`
  - [ ] Inject PrismaService + ThreadsAPIService + Bull queue
  - [ ] Implement `@Cron` decorator (every 1 minute)
  - [ ] Implement `publishScheduledPosts()` (find & queue)
  - [ ] Implement `processPublishJob()` (Bull processor)
  - [ ] Track publish failures (max 3 retries)
  - [ ] Update database atomically (publish + threadsPostId)

- [ ] Test Scheduler
  - [ ] Create test post in DB (status='approved', scheduled 1 min ago)
  - [ ] Wait 1 minute for cron to trigger
  - [ ] Verify post published in DB
  - [ ] Verify threadsPostId populated
  - [ ] Test retry logic (simulate publish failure)
  - [ ] Verify max 3 retries, then status='publish_failed'

---

## SPRINT 2: Approval & Publishing (Days 6-10)

### Day 6: LLM Providers (Gemini + OpenAI)

- [ ] Create `src/llm/interfaces/illm-provider.interface.ts`
- [ ] Implement GeminiProvider
- [ ] Implement OpenAIProvider
- [ ] Create LLMProviderManager (circuit breaker)
- [ ] Test provider switching via env var
- [ ] Test fallback (Gemini down → OpenAI)

### Day 7: Generate Endpoint

- [ ] Create `POST /api/v1/posts/generate`
  - [ ] Accept: `{ topics: string[], tone?: string }`
  - [ ] Call LLMProviderManager
  - [ ] Save to DB as 'draft'
  - [ ] Log costs to llm_cost_log
  - [ ] Return: `{ posts: [{id, topic, generatedText, tone, hashtags, cta}] }`

### Day 8: Approval Endpoints

- [ ] Create `GET /api/v1/posts/pending-approval`
- [ ] Create `POST /api/v1/posts/:id/approve`
- [ ] Create `POST /api/v1/posts/:id/reject`
- [ ] Create `POST /api/v1/posts/:id/schedule`

### Day 9: Analytics & Cost Tracking

- [ ] Create `GET /api/v1/analytics/dashboard`
- [ ] Create `GET /api/v1/costs/summary`
- [ ] Create cost alert logic (>$100/day)
- [ ] Create cron: fetch_engagement_metrics (daily 2 AM)

### Day 10: Testing & Documentation

- [ ] Unit tests (all services)
- [ ] Integration tests (end-to-end flow)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Deployment documentation

---

## SPRINT 3: Analytics & Recommendations (Days 11-15)

- [ ] Implement heatmap computation (cron daily 2:30 AM)
- [ ] Implement posting time recommendations
- [ ] Create analytics dashboard endpoints
- [ ] Add DataDog monitoring
- [ ] Add Sentry error tracking

---

## SPRINT 4: Polish & Launch (Days 16-20)

- [ ] Performance optimization
- [ ] Security hardening (CORS, rate limiting, input validation)
- [ ] Load testing (100+ posts/day)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Team training
- [ ] Internal launch

---

## DEPLOYMENT CHECKLIST (Before Production)

**AWS Infrastructure**
- [ ] Create EC2 instance (t3.medium, 2 CPU, 4 GB RAM)
- [ ] Setup IAM role (Secrets Manager + CloudWatch permissions)
- [ ] Setup RDS PostgreSQL (db.t3.micro, 20 GB storage, automated backups)
- [ ] Setup ElastiCache Redis (cache.t3.micro)
- [ ] Setup Application Load Balancer (HTTPS, certificate)
- [ ] Setup VPC + security groups (3306 for DB, 6379 for Redis, 443 for API)

**Application Setup**
- [ ] Copy .env to production (fill in real API keys)
- [ ] Run `npm run build` (TypeScript compilation)
- [ ] Run `npx prisma migrate deploy` (apply migrations)
- [ ] Start application: `npm run start:prod`
- [ ] Verify `/health` endpoint returns 200

**Monitoring & Alerting**
- [ ] Setup DataDog dashboard (CPU, memory, request latency)
- [ ] Setup Sentry project (error tracking)
- [ ] Setup CloudWatch alarms (CPU > 80%, memory > 80%)
- [ ] Setup Slack alerts (#threads-automation-alerts channel)

**Testing**
- [ ] Test health check: `GET /health` → 200
- [ ] Test generate: `POST /api/v1/posts/generate` with 1 topic
- [ ] Test publish flow: generate → approve → schedule → publish
- [ ] Test rate limit: attempt 251 posts in 24h (should fail)
- [ ] Monitor logs for errors (Sentry)

**Backup & Recovery**
- [ ] Backup RDS database daily
- [ ] Test restore from backup
- [ ] Document recovery procedure
- [ ] Create runbook for common issues

---

**Status:** Ready for Sprint 1 Kickoff 🚀  
**Tech Lead:** Dozer  
**Duration:** 4 weeks (20 days)  
**Key Decisions:** Static token (no OAuth), NestJS 10, Bull queue, AWS Secrets Manager

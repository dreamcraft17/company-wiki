# THREADS AUTOMATION BOT — Software Design Document (SDD) v3.1

## 1. SYSTEM ARCHITECTURE OVERVIEW

### 1.1 Architecture Diagram (High-Level)
```
┌─────────────────────────────────────────────────────────────────┐
│                         Web Browser (React)                      │
│                    Approval UI + Analytics Dashboard              │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway + Load Balancer                   │
│                        (AWS ALB / Vercel)                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
   ┌──────────┐        ┌──────────┐        ┌──────────┐
   │ Generate │        │ Approval │        │Analytics │
   │  Service │        │ Service  │        │ Service  │
   │(Express) │        │(Express) │        │(Express) │
   └──┬───────┘        └──┬───────┘        └──┬───────┘
      │                   │                   │
      └───────────────────┼───────────────────┘
                          │
           ┌──────────────┼──────────────┐
           │              │              │
           ▼              ▼              ▼
      ┌────────┐    ┌──────────┐   ┌────────┐
      │   LLM  │    │PostgreSQL│   │ Redis  │
      │Provider│    │Database  │   │ Cache  │
      │Manager │    │          │   │        │
      └────────┘    └──────────┘   └────────┘
           │              
      ┌────┴────────┬──────────────┐
      │             │              │
      ▼             ▼              ▼
   Claude API  OpenRouter API  GitHub Codex
                                    
      ┌──────────────────────────────────┐
      │      Threads Meta API v1.0        │
      │   (Publishing + Analytics)        │
      └──────────────────────────────────┘
           │
           ▼
      Threads Platform
```

### 1.2 System Components

| Component | Technology | Responsibility |
|-----------|-----------|-----------------|
| Web UI | React 18 + TypeScript | User approval interface, analytics dashboard |
| API Backend | NestJS 10 + TypeScript | REST API endpoints, business logic |
| Database | PostgreSQL 14 | Persistent data storage, audit logs |
| Cache | Redis 6 | Rate limiting, heatmap cache, token cache |
| LLM Manager | TypeScript abstract layer | Multi-provider LLM orchestration |
| Scheduler | Bull 4 (Redis-backed) | Cron jobs (publish queue, metrics fetch, heatmap compute) |
| Monitoring | DataDog + Sentry | Error tracking, performance monitoring |
| Token Manager | AWS Secrets Manager | 1 static Threads API token (encrypted, audited) |
| Deployment | GitHub Actions + Terraform | CI/CD pipeline, IaC hosting |

---

## 2. DATABASE DESIGN

### 2.1 Entity Relationship Diagram (ERD)
```
threads_posts ◄─────────► approval_logs
   │                         │
   ├─ id (PK)              ├─ id (PK)
   ├─ topic                ├─ post_id (FK)
   ├─ generated_text       ├─ approver_id
   ├─ approval_status      ├─ decision
   ├─ approver_id (FK)     ├─ comments
   ├─ approved_at          ├─ decision_timestamp
   ├─ scheduled_at         └─ created_at
   ├─ threads_post_id
   ├─ published_at         engagement_metrics
   ├─ created_at           ├─ id (PK)
   ├─ created_by           ├─ post_id (FK)
   └─ updated_at           ├─ threads_post_id
                           ├─ views
   llm_cost_log            ├─ likes
   ├─ id (PK)              ├─ replies
   ├─ provider             ├─ reposts
   ├─ batch_id (FK)        ├─ shares
   ├─ tokens_used          ├─ impressions
   ├─ cost_usd             ├─ engagement_count
   └─ timestamp            ├─ fetched_at
                           └─ updated_at
   brand_guidelines
   ├─ id (PK)              posting_heatmap
   ├─ parameter_name       ├─ hour_of_day (PK)
   ├─ value                ├─ day_of_week (PK)
   ├─ version              ├─ avg_engagement_score
   ├─ updated_by           ├─ sample_size
   ├─ updated_at           └─ updated_at
   └─ created_at
```

### 2.2 Table Schemas

#### threads_posts
```sql
CREATE TABLE threads_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID,
  topic TEXT NOT NULL,
  generated_text VARCHAR(500) NOT NULL,
  tone VARCHAR(50) DEFAULT 'professional',
  hashtags TEXT[] DEFAULT ARRAY[]::text[],
  cta TEXT,
  llm_provider_used VARCHAR(50),
  tokens_used INT,
  
  -- Approval workflow
  approval_status VARCHAR(50) DEFAULT 'draft' 
    CHECK (approval_status IN ('draft', 'approved', 'rejected', 'editing')),
  approver_id UUID,
  approved_at TIMESTAMP,
  approval_comments TEXT,
  
  -- Scheduling & Publishing
  scheduled_at TIMESTAMP,
  scheduled_timezone VARCHAR(50) DEFAULT 'UTC',
  threads_post_id VARCHAR(255) UNIQUE,
  published_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (approver_id) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_approval_status (approval_status),
  INDEX idx_scheduled_at (scheduled_at),
  INDEX idx_published_at (published_at),
  INDEX idx_created_at (created_at)
);
```

#### approval_logs
```sql
CREATE TABLE approval_logs (
  id SERIAL PRIMARY KEY,
  post_id UUID NOT NULL,
  approver_id UUID NOT NULL,
  decision VARCHAR(50) NOT NULL 
    CHECK (decision IN ('approve', 'reject', 'edit')),
  edited_text VARCHAR(500),
  comments TEXT,
  suggested_publish_time TIMESTAMP,
  decision_timestamp TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (post_id) REFERENCES threads_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (approver_id) REFERENCES users(id),
  INDEX idx_post_id (post_id),
  INDEX idx_decision_timestamp (decision_timestamp)
);
```

#### llm_cost_log
```sql
CREATE TABLE llm_cost_log (
  id SERIAL PRIMARY KEY,
  provider VARCHAR(50) NOT NULL,
  batch_id UUID,
  tokens_used INT NOT NULL,
  input_tokens INT DEFAULT 0,
  output_tokens INT DEFAULT 0,
  cost_usd DECIMAL(10, 6) NOT NULL,
  cost_currency VARCHAR(3) DEFAULT 'USD',
  request_timestamp TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_provider (provider),
  INDEX idx_request_timestamp (request_timestamp),
  INDEX idx_batch_id (batch_id)
);
```

#### brand_guidelines
```sql
CREATE TABLE brand_guidelines (
  id SERIAL PRIMARY KEY,
  parameter_name VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  value_type VARCHAR(50) DEFAULT 'text'
    CHECK (value_type IN ('text', 'json', 'array')),
  version INT DEFAULT 1,
  updated_by UUID NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  
  FOREIGN KEY (updated_by) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  UNIQUE KEY unique_param_version (parameter_name, version)
);
```

#### engagement_metrics
```sql
CREATE TABLE engagement_metrics (
  id SERIAL PRIMARY KEY,
  post_id UUID NOT NULL,
  threads_post_id VARCHAR(255),
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  replies INT DEFAULT 0,
  reposts INT DEFAULT 0,
  shares INT DEFAULT 0,
  impressions INT DEFAULT 0,
  engagement_count INT DEFAULT 0 
    GENERATED ALWAYS AS (likes + replies + reposts + shares) STORED,
  engagement_rate DECIMAL(10, 4) 
    GENERATED ALWAYS AS (CASE WHEN impressions > 0 THEN (engagement_count::decimal / impressions * 100) ELSE 0 END) STORED,
  
  fetched_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  
  FOREIGN KEY (post_id) REFERENCES threads_posts(id) ON DELETE CASCADE,
  UNIQUE KEY unique_threads_post (threads_post_id),
  INDEX idx_post_id (post_id),
  INDEX idx_engagement_count (engagement_count),
  INDEX idx_fetched_at (fetched_at)
);
```

#### posting_heatmap
```sql
CREATE TABLE posting_heatmap (
  hour_of_day INT NOT NULL CHECK (hour_of_day >= 0 AND hour_of_day <= 23),
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  avg_engagement_score DECIMAL(10, 2) DEFAULT 0,
  sample_size INT DEFAULT 0,
  total_engagement INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  
  PRIMARY KEY (hour_of_day, day_of_week)
);
```

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  oauth_provider VARCHAR(50) NOT NULL,
  oauth_id VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user'
    CHECK (role IN ('user', 'approver', 'admin')),
  
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_email (email),
  INDEX idx_oauth (oauth_provider, oauth_id)
);
```

### 2.3 Indexing Strategy
- **Primary indexes (B-tree):** post_id, approval_status, scheduled_at, published_at
- **Composite indexes:** (approval_status, scheduled_at) untuk query draft posts ready to schedule
- **Time-series index:** (created_at DESC) untuk latest posts
- **Foreign key indexes:** approver_id, created_by untuk JOIN operations
- **Heatmap index:** (hour_of_day, day_of_week) PRIMARY for hot data

### 2.4 Data Archival Strategy
```sql
-- Monthly archive job (1st of month, 3 AM UTC)
CREATE TRIGGER archive_old_posts
  AFTER INSERT ON threads_posts
  FOR EACH ROW
  BEGIN
    DELETE FROM threads_posts 
    WHERE published_at < NOW() - INTERVAL 90 DAYS
    AND approval_status = 'rejected';
    
    DELETE FROM engagement_metrics
    WHERE fetched_at < NOW() - INTERVAL 1 YEAR;
  END;
```

---

## 3. LLM PROVIDER ABSTRACTION

### 3.1 Interface Definition
```typescript
// llm-provider.interface.ts

export interface GenerationConfig {
  temperature?: number;
  max_tokens?: number;
  system_prompt?: string;
  brand_guidelines?: BrandGuidelines;
}

export interface GeneratedContent {
  text: string;
  tokens_used: number;
  model_used: string;
  finish_reason: string;
}

export interface ProviderStatus {
  status: 'available' | 'degraded' | 'unavailable';
  error?: string;
  response_time_ms?: number;
}

export interface ILLMProvider {
  name: string;
  
  generateContent(
    prompt: string,
    config: GenerationConfig
  ): Promise<GeneratedContent>;
  
  estimateCost(tokens: number): number;
  
  getStatus(): Promise<ProviderStatus>;
  
  validateConfig(): Promise<boolean>;
}
```

### 3.2 Claude API Implementation
```typescript
// claude.provider.ts

export class ClaudeProvider implements ILLMProvider {
  name = 'claude';
  private client: Anthropic;
  
  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }
  
  async generateContent(
    prompt: string,
    config: GenerationConfig
  ): Promise<GeneratedContent> {
    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: config.max_tokens || 500,
      temperature: config.temperature || 0.7,
      system: config.system_prompt || DEFAULT_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
    
    return {
      text: response.content[0].type === 'text' 
        ? response.content[0].text 
        : '',
      tokens_used: response.usage.output_tokens,
      model_used: response.model,
      finish_reason: response.stop_reason
    };
  }
  
  estimateCost(tokens: number): number {
    const INPUT_PRICE = 3.00 / 1_000_000;
    const OUTPUT_PRICE = 15.00 / 1_000_000;
    return (tokens * INPUT_PRICE) + (tokens * OUTPUT_PRICE);
  }
  
  async getStatus(): Promise<ProviderStatus> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }]
      });
      
      return { status: 'available' };
    } catch (error) {
      return {
        status: 'unavailable',
        error: error.message
      };
    }
  }
  
  async validateConfig(): Promise<boolean> {
    return (await this.getStatus()).status !== 'unavailable';
  }
}
```

### 3.3 Provider Manager (Circuit Breaker)
```typescript
// llm-provider-manager.ts

export class LLMProviderManager {
  private providers: Map<string, ILLMProvider>;
  private circuitBreakers: Map<string, CircuitBreaker>;
  private fallbackOrder: string[];
  
  constructor(providers: ILLMProvider[], fallbackOrder: string[]) {
    this.providers = new Map(
      providers.map(p => [p.name, p])
    );
    this.fallbackOrder = fallbackOrder;
    
    // Initialize circuit breakers
    this.circuitBreakers = new Map(
      providers.map(p => [
        p.name,
        new CircuitBreaker({
          failureThreshold: 5,
          successThreshold: 2,
          timeout: 60000
        })
      ])
    );
  }
  
  async generateContent(
    prompt: string,
    config: GenerationConfig,
    preferredProvider?: string
  ): Promise<GeneratedContent> {
    const providers = this.getAvailableProviders(preferredProvider);
    
    for (const providerName of providers) {
      const provider = this.providers.get(providerName);
      const breaker = this.circuitBreakers.get(providerName);
      
      try {
        return await breaker.execute(async () => {
          return await provider.generateContent(prompt, config);
        });
      } catch (error) {
        logger.warn(`Provider ${providerName} failed:`, error);
        continue;
      }
    }
    
    throw new Error('All LLM providers exhausted');
  }
  
  private getAvailableProviders(preferred?: string): string[] {
    if (preferred && this.providers.has(preferred)) {
      return [preferred, ...this.fallbackOrder.filter(p => p !== preferred)];
    }
    return this.fallbackOrder;
  }
}
```

---

## 4. API LAYER DESIGN

### 4.1 NestJS Module Structure
```
src/
├── app.module.ts
├── config/
│   ├── threads-config.service.ts       ← AWS Secrets Manager + token caching
│   └── database.config.ts
├── threads-api/
│   └── threads-api.service.ts          ← Simplified: 1 static token
├── generate/
│   ├── generate.controller.ts
│   ├── generate.service.ts
│   └── generate.module.ts
├── posts/
│   ├── posts.controller.ts
│   ├── posts.service.ts
│   └── posts.module.ts
├── analytics/
│   ├── analytics.controller.ts
│   ├── analytics.service.ts
│   └── analytics.module.ts
├── scheduling/
│   ├── publish.scheduler.ts            ← Bull queue + cron (every 1 min)
│   └── scheduling.module.ts
├── brand-guidelines/
│   ├── brand-guidelines.controller.ts
│   └── brand-guidelines.service.ts
└── common/
    ├── decorators/
    ├── guards/
    ├── interceptors/
    └── pipes/

API Endpoints:
├── POST /api/v1/posts/generate
├── GET  /api/v1/posts/pending-approval
├── POST /api/v1/posts/:id/approve
├── POST /api/v1/posts/:id/schedule
├── GET  /api/v1/analytics/dashboard
├── GET  /api/v1/analytics/posts
├── GET  /api/v1/recommendations/best-posting-times
├── GET  /api/v1/costs/summary
├── GET  /api/v1/brand-guidelines
├── PUT  /api/v1/brand-guidelines/:param
└── GET  /health
```

### 4.2 NestJS Middleware & Guards
```typescript
// main.ts

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global middleware
  app.use(helmet());
  app.use(cors({ origin: ALLOWED_ORIGINS }));
  app.use(morgan('combined'));
  
  // Global guards
  app.useGlobalGuards(new JwtGuard()); // Internal JWT (Dozer)
  app.useGlobalInterceptors(new LoggingInterceptor());
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  
  // Rate limiting (per IP, not per user)
  app.use(
    rateLimit({
      windowMs: 60000,
      max: 1000, // 1000 req/min (internal use only)
    })
  );
  
  // Error handling
  app.useGlobalFilters(new AllExceptionsFilter());
  
  await app.listen(3000);
}

bootstrap();
```

**Notes:**
- ✅ **No OAuth** — internal Dozer-only tool
- ✅ **JWT from .env** (1 hardcoded token, no user login)
- ✅ **Threads token** managed via AWS Secrets Manager (separate from app auth)
- ✅ **Rate limiting** by IP, not per-user

### 4.3 Controller Example (Generate)
```typescript
// controllers/generate.controller.ts

export class GenerateController {
  constructor(
    private llmManager: LLMProviderManager,
    private postsRepository: ThreadsPostsRepository,
    private costLogger: CostLogger
  ) {}
  
  async generateBatch(
    req: Request,
    res: Response
  ): Promise<void> {
    const { topics, tone, llm_provider } = req.body;
    
    // Validate
    validateTopics(topics);
    validateTone(tone);
    
    // Fetch brand guidelines
    const guidelines = await this.getBrandGuidelines();
    
    // Generate content
    const batch_id = uuidv4();
    const generated_posts = [];
    let total_cost = 0;
    
    for (const topic of topics) {
      const prompt = buildPrompt(topic, tone, guidelines);
      
      const content = await this.llmManager.generateContent(
        prompt,
        { brand_guidelines: guidelines },
        llm_provider
      );
      
      // Log cost
      await this.costLogger.log({
        provider: content.model_used,
        batch_id,
        tokens_used: content.tokens_used,
        cost_usd: this.estimateCost(content.tokens_used)
      });
      
      total_cost += cost;
      
      // Save to DB
      const post = await this.postsRepository.create({
        batch_id,
        topic,
        generated_text: content.text,
        tone,
        llm_provider_used: content.model_used,
        tokens_used: content.tokens_used,
        created_by: req.user.id
      });
      
      generated_posts.push(post);
    }
    
    res.json({
      batch_id,
      status: 'success',
      generated_posts,
      cost_usd: total_cost,
      timestamp: new Date().toISOString()
    });
  }
}
```

---

## 5. JOB SCHEDULER DESIGN (Cron Jobs)

### 5.1 Scheduler Implementation (Bull Queue)
```typescript
// schedulers/index.ts

import Queue from 'bull';

const publishQueue = new Queue('publish', REDIS_URL);
const metricsQueue = new Queue('metrics', REDIS_URL);
const heatmapQueue = new Queue('heatmap', REDIS_URL);

// Publish scheduled posts (every 1 minute)
publishQueue.process(async (job) => {
  const pendingPosts = await postsRepository.findScheduledReady();
  
  for (const post of pendingPosts) {
    await publishPost(post);
  }
  
  return { processed: pendingPosts.length };
});

publishQueue.add(
  {},
  { repeat: { cron: '*/1 * * * *' } }
);

// Fetch engagement metrics (daily, 2 AM UTC)
metricsQueue.process(async (job) => {
  const publishedPosts = await postsRepository
    .findPublished()
    .where('insights_fetched_at', '<', NOW - 24 HOURS);
  
  for (const post of publishedPosts) {
    const metrics = await threadsAPI.getInsights(post.threads_post_id);
    await metricsRepository.create({
      post_id: post.id,
      ...metrics,
      fetched_at: NOW
    });
  }
  
  return { processed: publishedPosts.length };
});

metricsQueue.add(
  {},
  { repeat: { cron: '0 2 * * *', tz: 'UTC' } }
);

// Compute heatmap (daily, 2:30 AM UTC)
heatmapQueue.process(async (job) => {
  const recentMetrics = await metricsRepository
    .query(`
      SELECT 
        EXTRACT(HOUR FROM published_at) as hour_of_day,
        EXTRACT(DOW FROM published_at) as day_of_week,
        AVG(engagement_count) as avg_score,
        COUNT(*) as sample_size
      FROM engagement_metrics em
      JOIN threads_posts tp ON em.post_id = tp.id
      WHERE tp.published_at > NOW() - INTERVAL '30 days'
      GROUP BY hour_of_day, day_of_week
    `);
  
  for (const row of recentMetrics) {
    await heatmapRepository.upsert({
      hour_of_day: row.hour_of_day,
      day_of_week: row.day_of_week,
      avg_engagement_score: row.avg_score,
      sample_size: row.sample_size
    });
  }
  
  return { processed: recentMetrics.length };
});

heatmapQueue.add(
  {},
  { repeat: { cron: '30 2 * * *', tz: 'UTC' } }
);
```

### 5.2 Error Handling & Retry Logic
```typescript
publishQueue.on('failed', async (job, error) => {
  logger.error(`Job ${job.id} failed:`, error);
  
  // Retry with exponential backoff
  if (job.attemptsMade < 3) {
    await job.retry();
  } else {
    // Alert team
    await notificationService.alertSlack({
      channel: '#automation-alerts',
      message: `Publish job failed after 3 retries: ${error.message}`,
      severity: 'critical'
    });
  }
});
```

---

## 6. FRONTEND ARCHITECTURE

### 6.1 Component Structure
```
src/
├── components/
│   ├── Approval/
│   │   ├── ApprovalList.tsx
│   │   ├── ApprovalCard.tsx
│   │   ├── BulkApproveModal.tsx
│   │   └── ApprovalHistory.tsx
│   ├── Generate/
│   │   ├── GenerateForm.tsx
│   │   ├── TopicInput.tsx
│   │   └── GenerationProgress.tsx
│   ├── Analytics/
│   │   ├── AnalyticsDashboard.tsx
│   │   ├── EngagementChart.tsx
│   │   ├── HeatmapVisualization.tsx
│   │   └── TopPostsTable.tsx
│   ├── Shared/
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   └── LoadingSpinner.tsx
│   └── Layout/
│       └── MainLayout.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── Approval.tsx
│   ├── Analytics.tsx
│   └── Settings.tsx
├── services/
│   ├── api.ts (fetch wrapper)
│   ├── auth.ts
│   └── analytics.ts
├── hooks/
│   ├── useApprovalPosts.ts
│   ├── useAnalytics.ts
│   └── useGeneration.ts
├── state/
│   ├── store.ts (Redux/Zustand)
│   └── slices/
└── types/
    └── index.ts
```

### 6.2 Key UI Features
- **Real-time updates:** WebSocket untuk live approval status updates
- **Dark mode:** CSS variables + context provider
- **Responsive design:** Mobile-first Tailwind CSS
- **Accessibility:** ARIA labels, keyboard navigation, focus management

---

## 7. DEPLOYMENT ARCHITECTURE

### 7.1 Infrastructure as Code (Terraform/CloudFormation)
```
infrastructure/
├── main.tf
├── variables.tf
├── outputs.tf
├── modules/
│   ├── vpc/
│   ├── rds/
│   ├── elasticache/
│   ├── ec2/
│   ├── alb/
│   └── iam/
└── environments/
    ├── staging.tfvars
    └── production.tfvars
```

### 7.2 CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: vercel deploy --prod
```

### 7.3 Environment Configuration
```
.env.production:
- LLM_PROVIDER=claude
- THREADS_API_URL=https://graph.threads.net/v1.0
- DATABASE_URL=postgresql://...
- REDIS_URL=redis://...
- NODE_ENV=production
- LOG_LEVEL=info
```

### 7.4 Monitoring & Logging
```typescript
// monitoring/index.ts

import * as Sentry from "@sentry/node";
import winston from "winston";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date(),
    services: {
      api: 'ok',
      database: checkDatabase(),
      redis: checkRedis(),
      llm_providers: checkLLMProviders()
    }
  };
  res.json(health);
});
```

---

## 8. SECURITY DESIGN

### 8.1 Authentication Flow
```
User → OAuth Provider (Google/Slack)
     ↓
OAuth Callback → Generate JWT Token
     ↓
Store token in secure httpOnly cookie
     ↓
Include token in Authorization header for API requests
     ↓
Verify signature + expiry on each request
```

### 8.2 Data Encryption
- **In transit:** HTTPS/TLS 1.3
- **At rest:** AES-256 (Threads API tokens in database)
- **Sensitive logs:** Redact tokens, passwords, email addresses

### 8.3 Secrets Management
```
AWS Secrets Manager:
├── /prod/threads/api-token
├── /prod/db/password
├── /prod/llm/anthropic-key
└── /prod/oauth/google-client-secret
```

---

## 9. PERFORMANCE OPTIMIZATION

### 9.1 Caching Strategy
| Resource | Cache | TTL | Invalidation |
|----------|-------|-----|--------------|
| Brand guidelines | Redis | 6 hours | On update |
| Posting heatmap | Redis | 24 hours | Daily recompute |
| Engagement metrics | Redis | 2 hours | On fetch |
| LLM provider status | Redis | 1 minute | Provider check |

### 9.2 Query Optimization
```sql
-- Slow query (full table scan)
SELECT * FROM threads_posts WHERE approval_status = 'approved';

-- Optimized (indexed)
SELECT * FROM threads_posts 
WHERE approval_status = 'approved' 
  AND scheduled_at > NOW() 
ORDER BY scheduled_at 
LIMIT 20;
```

### 9.3 API Response Compression
- Enable gzip compression for JSON responses
- Minify frontend bundle (webpack)
- CDN for static assets

---

## 10. TESTING STRATEGY

### 10.1 Test Pyramid
```
           ▲
          /|\
         / | \
        /  |  \  E2E Tests (5%)
       / ─ ┴ ─ \
      /    |    \
     /  Integration  \  Integration Tests (20%)
    /      |          \
   / ────────────────── \
  /      Unit Tests      \  Unit Tests (75%)
 /_______________________\
```

### 10.2 Test Examples
```typescript
// unit.test.ts
describe('LLMProviderManager', () => {
  it('should fallback to next provider on failure', async () => {
    const manager = new LLMProviderManager([
      mockProvider('claude', { fails: true }),
      mockProvider('openrouter', { succeeds: true })
    ], ['claude', 'openrouter']);
    
    const result = await manager.generateContent(prompt, config);
    expect(result.text).toBeDefined();
  });
});

// integration.test.ts
describe('Generate API', () => {
  it('should generate and store posts', async () => {
    const response = await request(app)
      .post('/api/v1/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ topics: ['Test topic'] });
    
    expect(response.status).toBe(200);
    expect(response.body.generated_posts).toHaveLength(1);
  });
});
```

---

## 11. MIGRATION STRATEGY (from v3.0 to v3.1)

### 11.1 Database Migrations
```sql
-- migration_001_add_engagement_metrics.sql
CREATE TABLE engagement_metrics (...)

-- migration_002_add_posting_heatmap.sql
CREATE TABLE posting_heatmap (...)

-- migration_003_add_approval_logs.sql
CREATE TABLE approval_logs (...)
```

### 11.2 Zero-Downtime Deployment
1. Deploy new code (old logic still active)
2. Run database migrations
3. Toggle feature flag to new code
4. Monitor for errors
5. Rollback feature flag if needed

---

## 12. ROLLBACK PROCEDURES

### 12.1 Database Rollback
```sql
-- Revert migration
BEGIN;
DROP TABLE engagement_metrics;
DROP TABLE posting_heatmap;
DROP TABLE approval_logs;
COMMIT;

-- Restore from backup (if needed)
RESTORE FROM s3://backup-bucket/backup-2026-09-13.sql;
```

### 12.2 Code Rollback
```bash
# GitHub Actions: Click "Re-run jobs" with previous commit
# Or manual:
git revert <commit-hash>
git push origin main
# Vercel auto-deploys on push
```

---

## 13. DOCUMENTATION & REFERENCES

- **API Docs:** OpenAPI/Swagger spec at `/api/docs`
- **Architecture ADRs:** `docs/adr/`
- **Database Schema:** `docs/database-schema.md`
- **Deployment Guide:** `docs/deployment.md`

---

**Document Version:** v3.1  
**Last Updated:** 2026-09-13  
**Owner:** DN Tech Tech Lead (Dozer)  
**Status:** Ready for Implementation

# THREADS AUTOMATION BOT — Software Requirements Specification (SRS) v3.1

## 1. FUNCTIONAL REQUIREMENTS

### 1.1 Authentication & Authorization
- **FR-1.1.1:** System must authenticate users via OAuth 2.0 (Google or Slack)
- **FR-1.1.2:** All API endpoints require valid JWT token in Authorization header
- **FR-1.1.3:** Support API key authentication untuk programmatic access (beta)
- **FR-1.1.4:** Token expiry: 24 hours; refresh token valid 30 days
- **FR-1.1.5:** Log semua auth attempts (success + failure) untuk audit trail

### 1.2 Batch Content Generation
- **FR-1.2.1:** Accept POST request `/api/v1/generate` dengan payload:
  ```json
  {
    "topics": ["string", "string", ...],
    "tone": "professional|casual|technical",
    "include_hashtags": true|false,
    "llm_provider": "claude|openrouter|github-codex"
  }
  ```
- **FR-1.2.2:** Validate input: 1-10 topics, valid tone enum, trim whitespace
- **FR-1.2.3:** Return response dengan 200ms-30s latency (batch of 10):
  ```json
  {
    "batch_id": "uuid",
    "status": "success|error",
    "generated_posts": [
      {
        "topic": "string",
        "generated_text": "string (max 500 chars)",
        "tone_used": "string",
        "hashtags": ["#tag1", "#tag2"],
        "cta": "string",
        "llm_provider_used": "string",
        "tokens_used": 150
      }
    ],
    "cost_usd": 0.042,
    "timestamp": "ISO8601"
  }
  ```
- **FR-1.2.4:** Fetch brand guidelines from DB before LLM call; inject ke prompt
- **FR-1.2.5:** Cache generated posts dalam `threads_posts` table dengan status `draft`
- **FR-1.2.6:** Return both text + metadata untuk approval UI consumption

### 1.3 LLM Provider Abstraction
- **FR-1.3.1:** Implement TypeScript interface:
  ```typescript
  interface ILLMProvider {
    name: string;
    generateContent(prompt: string, config: GenerationConfig): Promise<GeneratedContent>;
    estimateCost(tokens: number): number;
    getStatus(): Promise<ProviderStatus>;
  }
  ```
- **FR-1.3.2:** Three implementations required:
  - **Claude API:** Use `anthropic/claude-sonnet-4.1` model (production)
  - **OpenRouter:** Multi-model broker, fallback untuk cost optimization
  - **GitHub Codex:** Reserved fallback (if both above unavailable)
- **FR-1.3.3:** Provider selection logic:
  - Read `LLM_PROVIDER` env var (default: claude)
  - If provider unavailable, auto-switch to next in priority list
  - Log provider switch events untuk troubleshooting
- **FR-1.3.4:** Rate limiting per provider:
  - Claude: 100 req/min (free tier), 1000 req/min (prod key)
  - OpenRouter: Per their tier limits
  - Queue overflow requests (max queue depth: 1000)
- **FR-1.3.5:** Implement circuit breaker pattern:
  - Open state: Fail immediately jika > 5 consecutive errors
  - Half-open state: Try 1 request to test recovery
  - Closed state: Normal operation

### 1.4 Brand Guidelines Management
- **FR-1.4.1:** Database table `brand_guidelines`:
  ```sql
  CREATE TABLE brand_guidelines (
    id SERIAL PRIMARY KEY,
    parameter_name VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    version INT DEFAULT 1,
    updated_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
  )
  ```
- **FR-1.4.2:** API endpoint GET `/api/v1/brand-guidelines` → return all guidelines
- **FR-1.4.3:** API endpoint PUT `/api/v1/brand-guidelines/{param_name}` → update
  - Require admin role
  - Version increment otomatis
  - Log change: who, when, old_value, new_value
- **FR-1.4.4:** Core guidelines to store (minimum):
  - `brand_tone`: "DN Tech is a professional yet approachable B2B SaaS company..."
  - `core_values`: "Innovation, Transparency, Impact"
  - `forbidden_topics`: "politics, religion, controversial, spam"
  - `call_to_action_templates`: ["Visit our blog: X", "Check out: Y"]
  - `hashtag_whitelist`: ["#dntech", "#saas", "#indonesia"]
- **FR-1.4.5:** Inject guidelines ke prompt template:
  ```
  You are a content writer for DN Tech. 
  Brand tone: {brand_tone}
  Core values: {core_values}
  Forbidden topics: {forbidden_topics}
  Write a Threads post about: {topic}
  Include one of: {call_to_action_templates}
  Use hashtags only from: {hashtag_whitelist}
  Max 500 characters.
  ```

### 1.5 Approval Workflow
- **FR-1.5.1:** Web UI endpoint GET `/api/v1/posts/pending-approval?limit=20&offset=0`
  - Return draft posts pending review
  - Include: topic, generated_text, tone, hashtags, created_at
- **FR-1.5.2:** Approval decision endpoint POST `/api/v1/posts/{post_id}/approve`:
  ```json
  {
    "decision": "approve|reject|edit",
    "edited_text": "string (if decision=edit)",
    "comments": "string",
    "suggested_publish_time": "ISO8601 (optional)"
  }
  ```
- **FR-1.5.3:** Update `threads_posts` table:
  - approval_status: draft → approved|rejected|editing
  - approver_id: user ID
  - approved_at: timestamp
- **FR-1.5.4:** Create `approval_logs` entry:
  ```sql
  INSERT INTO approval_logs (post_id, approver_id, status, comments, decision_timestamp)
  VALUES (...)
  ```
- **FR-1.5.5:** Bulk approval endpoint POST `/api/v1/posts/bulk-approve`:
  - Accept array of post_ids (max 10)
  - Approve all dalam single transaction
  - Return count of approved posts
- **FR-1.5.6:** Approval SLA enforcement:
  - Posts in draft > 4 business hours → notify approver via Slack
  - Posts > 8 hours → auto-reject + notify team
  - Configurable via APPROVAL_SLA_HOURS env var

### 1.6 Content Scheduling & Publishing
- **FR-1.6.1:** Schedule endpoint POST `/api/v1/posts/{post_id}/schedule`:
  ```json
  {
    "scheduled_publish_time": "ISO8601",
    "schedule_timezone": "Asia/Jakarta"
  }
  ```
- **FR-1.6.2:** Validate:
  - scheduled_publish_time >= now + 1 hour (min advance)
  - scheduled_publish_time <= now + 30 days (max advance)
  - Check Threads API rate limit: 250 posts per 24 hours
  - Return error jika limit exceeded, suggest next available slot
- **FR-1.6.3:** Store in threads_posts table:
  - status: approved → scheduled
  - scheduled_at: datetime
  - schedule_timezone: varchar
- **FR-1.6.4:** Cron job (every 1 minute) untuk publish:
  - Query: WHERE status='scheduled' AND scheduled_at <= NOW()
  - Call Threads API POST /{user_id}/threads → create container
  - Call Threads API POST /{user_id}/threads_publish → publish
  - Update status → published
  - Log: published_at, threads_post_id (returned dari API)
  - Handle errors: retry up to 3x dengan exponential backoff
- **FR-1.6.5:** Immediate publish endpoint POST `/api/v1/posts/{post_id}/publish-now`:
  - Bypass scheduling, publish immediately
  - Require admin approval
  - Log immediate publish untuk audit
- **FR-1.6.6:** Threads API integration:
  ```
  POST /graph.threads.net/v1.0/{user_id}/threads
  Body: media_type=TEXT, text={post_text}, access_token={token}
  Response: { id: "container_id" }
  
  POST /graph.threads.net/v1.0/{user_id}/threads_publish
  Body: creation_id={container_id}, access_token={token}
  Response: { id: "post_id" }
  ```

### 1.7 Cost Tracking
- **FR-1.7.1:** Database table `llm_cost_log`:
  ```sql
  CREATE TABLE llm_cost_log (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    batch_id VARCHAR(100),
    tokens_used INT NOT NULL,
    cost_usd DECIMAL(10,6) NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    INDEX (provider, timestamp)
  )
  ```
- **FR-1.7.2:** Log every LLM call immediately after response:
  - Extract tokens_used dari LLM response
  - Calculate cost based on provider pricing
  - Store dalam llm_cost_log
- **FR-1.7.3:** API endpoint GET `/api/v1/costs/summary?period=daily|weekly|monthly`:
  ```json
  {
    "period": "monthly",
    "total_cost_usd": 42.50,
    "breakdown_by_provider": {
      "claude": { "cost": 35.00, "tokens": 2100000 },
      "openrouter": { "cost": 7.50, "tokens": 500000 }
    },
    "cost_per_post": 0.042,
    "cost_trend": [
      { "date": "2026-09-01", "cost": 10.5 },
      ...
    ]
  }
  ```
- **FR-1.7.4:** Cost alert threshold:
  - Monitor daily costs
  - Alert Slack jika daily cost > COST_DAILY_LIMIT_USD (default: $100)
  - Alert monthly jika monthly > COST_MONTHLY_LIMIT_USD (default: $1500)
- **FR-1.7.5:** Provider cost model configuration:
  ```json
  {
    "claude": { "input_price_per_1m_tokens": 3.00, "output_price_per_1m_tokens": 15.00 },
    "openrouter": { "models": { "gpt-4": {...}, "claude-3": {...} } }
  }
  ```

### 1.8 Engagement Metrics & Analytics
- **FR-1.8.1:** Cron job (daily, 2 AM UTC) fetch Threads API insights:
  - Query: SELECT * FROM threads_posts WHERE published_at IS NOT NULL AND insights_fetched_at IS NULL
  - For each post, call Threads API GET /{user_id}/insights
  - Extract: impressions, engagement_count, views, likes, replies, reposts, shares
- **FR-1.8.2:** Database table `engagement_metrics`:
  ```sql
  CREATE TABLE engagement_metrics (
    id SERIAL PRIMARY KEY,
    post_id VARCHAR(255) NOT NULL,
    threads_post_id VARCHAR(255) UNIQUE,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    replies INT DEFAULT 0,
    reposts INT DEFAULT 0,
    shares INT DEFAULT 0,
    impressions INT DEFAULT 0,
    engagement_count INT DEFAULT 0,
    fetched_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (post_id) REFERENCES threads_posts(id)
  )
  ```
- **FR-1.8.3:** API endpoint GET `/api/v1/analytics/posts?days=30&sort=engagement`:
  - Return top performing posts
  - Include: topic, generated_text, all metrics, published_at
  - Calculate engagement_rate = engagement_count / impressions
  - Sort by specified metric (default: engagement_count)
- **FR-1.8.4:** Analytics dashboard API GET `/api/v1/analytics/dashboard`:
  ```json
  {
    "summary": {
      "total_posts_published": 150,
      "total_engagement": 15420,
      "avg_engagement_per_post": 102.8,
      "trending_metric": "reposts"
    },
    "top_posts": [ { ...post with metrics } ],
    "engagement_trend": [ { date, total_engagement, avg_per_post } ],
    "comparison": {
      "automated_posts": { "avg_engagement": 110 },
      "manual_posts": { "avg_engagement": 85 }
    }
  }
  ```

### 1.9 Posting Time Optimization
- **FR-1.9.1:** Database table `posting_heatmap`:
  ```sql
  CREATE TABLE posting_heatmap (
    hour_of_day INT (0-23),
    day_of_week INT (0-6, Sunday=0),
    avg_engagement_score DECIMAL(10,2),
    sample_size INT,
    updated_at TIMESTAMP,
    PRIMARY KEY (hour_of_day, day_of_week)
  )
  ```
- **FR-1.9.2:** Cron job (daily, 2:30 AM UTC) compute heatmap:
  - Query last 30 days of posts dengan engagement metrics
  - For each post: group by HOUR(published_at) + DAYOFWEEK(published_at)
  - Calculate: avg(views + likes + replies) per hour/day combo
  - Update posting_heatmap table
- **FR-1.9.3:** API endpoint GET `/api/v1/recommendations/best-posting-times`:
  ```json
  {
    "top_3_times": [
      { "hour": 9, "day": "Tuesday", "score": 8.5, "reason": "Highest engagement" },
      { "hour": 14, "day": "Wednesday", "score": 8.2 },
      { "hour": 18, "day": "Thursday", "score": 7.9 }
    ],
    "heatmap": [ [ ...24 hours ] x 7 days ],
    "sample_size_posts": 95,
    "period_analyzed_days": 30,
    "last_updated": "ISO8601"
  }
  ```
- **FR-1.9.4:** Auto-suggest posting time dalam approval UI:
  - When approver reviews draft, show top 3 recommended times
  - Allow override dengan manual time selection
- **FR-1.9.5:** Edge case handling:
  - If < 10 posts last 30 days, return "insufficient data, posting time not optimized"
  - If all posts have 0 engagement, use default times (9 AM, 2 PM, 5 PM UTC)

---

## 2. NON-FUNCTIONAL REQUIREMENTS

### 2.1 Performance
- **NFR-2.1.1:** API response time (p95):
  - Generate endpoint: < 30 seconds (10 topics)
  - Approval list: < 500ms
  - Publish: < 1 second
  - Analytics: < 2 seconds
- **NFR-2.1.2:** Database query optimization:
  - All critical queries indexed (post_id, approval_status, scheduled_at)
  - Query execution time < 100ms
  - Connection pooling: max 50 connections
- **NFR-2.1.3:** Frontend performance:
  - Page load time < 2 seconds
  - Time to Interactive < 3 seconds
  - LCP (Largest Contentful Paint) < 1.5 seconds
- **NFR-2.1.4:** Cron job efficiency:
  - Heatmap computation: < 5 minutes untuk 1000 posts
  - Metrics fetch: < 10 minutes untuk 500 posts
  - Scheduling check: < 1 minute every 60 seconds

### 2.2 Scalability
- **NFR-2.2.1:** Support concurrent users:
  - Peak load: 20 concurrent users (internal team)
  - Burst capacity: 50 concurrent requests
  - Database: support 10,000 posts, 500,000 metrics rows
- **NFR-2.2.2:** Data growth planning:
  - threads_posts: +200 posts/month (growth: ~1 month retention)
  - engagement_metrics: +150 rows/day (historical: 1 year)
  - llm_cost_log: +500 rows/day (retention: 2 years)
  - Auto-archive old data monthly (archive_threads_posts_30days_ago)
- **NFR-2.2.3:** Caching strategy:
  - Redis cache brand_guidelines (TTL: 6 hours)
  - Cache LLM provider status (TTL: 1 minute)
  - Cache engagement metrics heatmap (TTL: 24 hours)

### 2.3 Reliability & Availability
- **NFR-2.3.1:** Uptime target: 99.5% monthly (SLA)
  - Exclude scheduled maintenance windows
  - Monitoring: synthetic tests every 5 minutes
- **NFR-2.3.2:** Data durability:
  - Backup database daily (incremental), weekly full backup
  - Backup retention: 30 days
  - RTO (Recovery Time Objective): 1 hour
  - RPO (Recovery Point Objective): < 5 minutes
- **NFR-2.3.3:** Error handling & graceful degradation:
  - If LLM provider down, switch to next provider (transparent)
  - If Threads API down, queue posts untuk retry (exponential backoff, max 24 hours)
  - If approval UI unavailable, support CLI approval fallback
- **NFR-2.3.4:** Monitoring & alerting:
  - Alert Slack jika API error rate > 1%
  - Alert jika Threads publish failure rate > 5%
  - Alert jika scheduled job fails atau delayed > 5 minutes
  - Health check endpoint: GET /health → 200 OK if all systems operational

### 2.4 Security
- **NFR-2.4.1:** Authentication & Authorization:
  - OAuth 2.0 untuk user login
  - JWT token dalam headers
  - Role-based access control: user, approver, admin
  - Require approval/admin role untuk sensitive endpoints
- **NFR-2.4.2:** Data Protection:
  - All traffic HTTPS/TLS 1.3
  - Database passwords stored in AWS Secrets Manager
  - Threads API tokens stored encrypted (AES-256)
  - No sensitive data logged (sanitize: tokens, passwords)
- **NFR-2.4.3:** API Security:
  - Rate limiting: 100 req/minute per IP address
  - Input validation: sanitize all user inputs, escape SQL queries
  - CSRF protection: token validation
  - CORS: restrict ke domain whitelist (dntech.id, localhost:3000)
  - SQL injection prevention: use parameterized queries
- **NFR-2.4.4:** Audit & Compliance:
  - Audit log every action: who, what, when, IP address
  - Retention: 2 years
  - Immutable audit logs (append-only)
  - Quarterly security review

### 2.5 Usability
- **NFR-2.5.1:** UI/UX Standards:
  - Responsive design (mobile, tablet, desktop)
  - WCAG 2.1 AA accessibility compliance
  - Dark mode support
  - Keyboard navigation support
- **NFR-2.5.2:** Localization:
  - Support English (primary) + Bahasa Indonesia (secondary)
  - Date/time display respect user timezone
  - Formatting: numbers, currency (USD default, IDR for internal)
- **NFR-2.5.3:** User Documentation:
  - In-app tooltips untuk semua fitur
  - Comprehensive README + troubleshooting guide
  - API documentation (OpenAPI/Swagger spec)
  - Video tutorial (5-10 min walkthrough)

### 2.6 Maintainability
- **NFR-2.6.1:** Code Quality:
  - TypeScript strict mode enabled
  - ESLint + Prettier configured
  - Test coverage > 80% (unit + integration)
  - Code review required untuk semua PRs
- **NFR-2.6.2:** Documentation:
  - Architecture Decision Records (ADRs) untuk setiap major decision
  - Inline code comments untuk complex logic
  - Database schema documentation
  - API endpoint documentation (OpenAPI)
- **NFR-2.6.3:** Deployment & DevOps:
  - CI/CD pipeline (GitHub Actions)
  - Automated testing on every PR
  - Staging environment mirrors production
  - Blue-green deployment untuk zero downtime

### 2.7 Compatibility
- **NFR-2.7.1:** Frontend Browser Support:
  - Chrome 90+
  - Safari 14+
  - Firefox 88+
  - Edge 90+
- **NFR-2.7.2:** Backend Compatibility:
  - Node.js 18.x LTS
  - PostgreSQL 14.x+
  - Redis 6.x+
- **NFR-2.7.3:** Threads API Compatibility:
  - Support Threads Graph API v1.0
  - Monitor API deprecation notices
  - Version compatibility: maintain 2 latest API versions

---

## 3. API SPECIFICATIONS

### 3.1 Content Generation API
```
POST /api/v1/generate
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}

Request:
{
  "topics": ["Introducing dnPeople HRIS", "Team Building Culture"],
  "tone": "professional",
  "include_hashtags": true,
  "llm_provider": "claude"
}

Response (200 OK):
{
  "batch_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "success",
  "generated_posts": [
    {
      "topic": "Introducing dnPeople HRIS",
      "generated_text": "Excited to announce dnPeople HRIS, our newest...",
      "tone_used": "professional",
      "hashtags": ["#dntech", "#saas", "#hris"],
      "cta": "Explore our blog for more",
      "llm_provider_used": "claude",
      "tokens_used": 180
    }
  ],
  "cost_usd": 0.042,
  "timestamp": "2026-09-13T10:30:00Z"
}
```

### 3.2 Approval API
```
POST /api/v1/posts/{post_id}/approve
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}

Request:
{
  "decision": "approve",
  "comments": "Looks good, matches brand voice",
  "suggested_publish_time": "2026-09-13T15:00:00Z"
}

Response (200 OK):
{
  "post_id": "post_uuid",
  "status": "approved",
  "approver_id": "user_uuid",
  "approved_at": "2026-09-13T10:45:00Z"
}
```

### 3.3 Scheduling API
```
POST /api/v1/posts/{post_id}/schedule
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}

Request:
{
  "scheduled_publish_time": "2026-09-13T15:00:00Z",
  "schedule_timezone": "Asia/Jakarta"
}

Response (200 OK):
{
  "post_id": "post_uuid",
  "status": "scheduled",
  "scheduled_at": "2026-09-13T15:00:00Z",
  "scheduled_timezone": "Asia/Jakarta"
}
```

### 3.4 Analytics API
```
GET /api/v1/analytics/dashboard
Authorization: Bearer {JWT_TOKEN}

Response (200 OK):
{
  "summary": {
    "total_posts_published": 150,
    "total_engagement": 15420,
    "avg_engagement_per_post": 102.8
  },
  "top_posts": [...],
  "engagement_trend": [...]
}
```

---

## 4. ERROR HANDLING & CODES

| Code | Status | Message | Action |
|------|--------|---------|--------|
| 400 | Bad Request | Invalid input (topics count, tone enum) | Validate input, retry |
| 401 | Unauthorized | Invalid/expired JWT token | Re-authenticate |
| 403 | Forbidden | Insufficient permissions | Request admin approval |
| 409 | Conflict | Post already published | Check post status |
| 429 | Too Many Requests | Rate limit exceeded | Exponential backoff |
| 500 | Internal Error | Unhandled exception | Log error, retry |
| 503 | Service Unavailable | All LLM providers down | Queue & retry later |

---

**Document Version:** v3.1  
**Last Updated:** 2026-09-13  
**Owner:** DN Tech Tech Lead (Dozer)  
**Status:** Ready for Development

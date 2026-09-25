# QUICK REFERENCE — Threads Automation v3.2
## Static Token Architecture (No OAuth)

---

## 🔑 Environment Variables (Production)

```env
# ✅ REQUIRED
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
AWS_REGION=ap-southeast-1
THREADS_USER_ID=17841406420890626
THREADS_SECRETS_NAME=/prod/threads/access-token
LLM_PRIMARY_PROVIDER=gemini
GEMINI_API_KEY=xxx
OPENAI_API_KEY=xxx
JWT_SECRET=xxx

# ❌ REMOVED (from v3.1)
# THREADS_ACCESS_TOKEN           <- Comes from AWS Secrets Manager!
# OAUTH_CLIENT_ID, SECRET, URI   <- No OAuth
# THREADS_OAUTH_SCOPE            <- Not needed
```

---

## 🌳 Folder Structure (NestJS)

```
src/
├─ config/
│  ├─ threads-config.service.ts      ← AWS Secrets Manager
│  └─ database.config.ts
├─ threads-api/
│  ├─ threads-api.service.ts         ← Publish logic
│  └─ threads-api.module.ts
├─ generate/
│  ├─ generate.controller.ts
│  └─ generate.service.ts
├─ posts/
│  ├─ posts.controller.ts
│  ├─ posts.service.ts
│  └─ posts.module.ts
├─ scheduling/
│  ├─ publish.scheduler.ts           ← Bull queue + cron
│  └─ scheduling.module.ts
├─ brand-guidelines/
├─ app.module.ts
└─ main.ts

prisma/
└─ schema.prisma                      ← 8 models

tests/
└─ threads-api.service.spec.ts
```

---

## 🔌 API ENDPOINTS

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/posts/generate` | Generate posts from topics |
| GET | `/api/v1/posts/pending-approval` | List draft posts |
| POST | `/api/v1/posts/:id/approve` | Approve post |
| POST | `/api/v1/posts/:id/schedule` | Schedule for publish |
| GET | `/api/v1/analytics/dashboard` | View metrics |
| GET | `/api/v1/costs/summary` | Cost breakdown |
| GET | `/health` | Health check |

---

## 🤖 LLM PROVIDER SWITCHING

**Default:** Gemini Flash (cost-optimized)  
**Fallback:** OpenAI GPT-4 Turbo (high quality)

```typescript
// Switch via env var, no code changes needed
LLM_PRIMARY_PROVIDER=gemini        // Use Gemini
LLM_PRIMARY_PROVIDER=openai        // Use OpenAI
```

**Cost Comparison:**
- Gemini Flash: $0.075 / 1M input, $0.30 / 1M output
- OpenAI GPT-4 Turbo: $0.03 / 1K, $0.06 / 1K
- Expected: ~$2.77/month for 1000 posts (Gemini 90%)

---

## 🔐 TOKEN MANAGEMENT

### Get Threads Token (One-Time Setup)

```bash
# 1. Login to @dntech Threads account
# 2. Settings → Apps & Websites → Generate Access Token
# 3. Copy token (starts with EAAB...)

# 4. Store in AWS Secrets Manager
aws secretsmanager create-secret \
  --name /prod/threads/access-token \
  --secret-string "EAAB..."
```

### Check Token Expiry

```bash
# Token expires in 60 days
# Check: https://graph.threads.net/me?fields=id&access_token=EAAB...

# Alert: Renew 7 days before expiry (set calendar reminder)
# Renewal: Repeat steps 1-4 above
```

---

## 📊 DATABASE SCHEMA (8 Tables)

| Table | Purpose |
|-------|---------|
| `threads_posts` | Generated posts + approval status |
| `approval_logs` | Audit trail of approvals |
| `threads_publish_log` | Publish attempts (retry tracking) |
| `llm_cost_log` | Cost tracking per provider |
| `brand_guidelines` | DN Tech brand parameters |
| `engagement_metrics` | Likes, views, replies, etc. |
| `posting_heatmap` | Engagement by hour/day |
| `third_party_tokens` | Token metadata (expiry, lastUsed) |

---

## 🚀 PUBLISHING FLOW

```
1. Generate (LLM)
   ├─ Input: 1-10 topics
   ├─ Output: draft posts + cost logged
   └─ Status: 'draft' in DB

2. Approve (Human)
   ├─ Input: post ID, decision (approve/reject/edit)
   ├─ Output: approval_logs entry
   └─ Status: 'approved' in DB

3. Schedule (UI)
   ├─ Input: post ID, publish_time
   ├─ Validation: 1h min, 30 days max, rate limit check
   └─ Status: 'approved' + scheduledAt set

4. Publish (Cron Job)
   ├─ Trigger: Every 1 minute
   ├─ Action: Check scheduled posts → Bull queue → Threads API
   ├─ Retry: 3x with exponential backoff (1s, 2s, 4s)
   └─ Status: 'published' + threadsPostId populated
```

---

## ⚙️ CRON JOBS

| Schedule | Job | Purpose |
|----------|-----|---------|
| Every 1 min | `publishScheduledPosts()` | Check & publish scheduled posts |
| Daily 2 AM UTC | `fetchEngagementMetrics()` | Fetch Threads analytics |
| Daily 2:30 AM UTC | `computePostingHeatmap()` | Recalc best posting times |
| Every 15 min | `checkApprovalSLA()` | 4h notify, 8h auto-reject |
| Daily 6 AM UTC | `alertCostThreshold()` | Alert if $100/day exceeded |

---

## 🔍 TESTING CHECKLIST

### Local Development
- [ ] `npm install && npm run dev`
- [ ] `GET /health` → 200
- [ ] POST /api/v1/posts/generate (1 topic)
- [ ] Check DB: post created in 'draft' status
- [ ] Update status to 'approved' manually
- [ ] Wait 1 min for cron → should publish to Threads

### Before Production Deploy
- [ ] All tests pass: `npm run test`
- [ ] AWS Secrets Manager token accessible
- [ ] RDS connection works
- [ ] Redis connection works
- [ ] Slack alerts configured
- [ ] DataDog monitoring enabled

---

## 📈 MONITORING & ALERTS

**DataDog Dashboard:**
- Request latency (target: <500ms)
- Publish success rate (target: >99%)
- LLM response time (target: <10s)
- Cost tracking (alert: >$100/day)

**Sentry Alerts:**
- ThreadsAPIService errors
- Secrets Manager access failures
- Database connection errors
- LLM provider failures

**Slack Alerts (#threads-automation-alerts):**
- Publish failures (3+ retries)
- Token expiry warning (7 days)
- Cost threshold exceeded
- Approval SLA missed

---

## 🛠️ TROUBLESHOOTING

### "Failed to get Threads token"
```
→ Check AWS Secrets Manager secret exists
→ Verify IAM role has SecretsManagerReadSecret permission
→ Check AWS_REGION env var correct
```

### "Rate limit (250/24h) would be exceeded"
```
→ Query: SELECT COUNT(*) FROM threads_posts WHERE published_at > NOW() - 24h
→ Wait for oldest posts to roll out of 24h window
```

### "Post stuck in draft after 1 hour"
```
→ Check pub scheduler running: check container logs
→ Verify scheduledAt = NOW() - 1 minute
→ Check Bull queue status (Redis)
```

### Publish fails with "401 Unauthorized"
```
→ Token expired! Renew in AWS Secrets Manager
→ OR app doesn't have permission to read secret
→ Check IAM role attached to EC2/Lambda
```

---

## 🚀 DEPLOYMENT (TL;DR)

1. **Setup AWS**
   - EC2 instance (t3.medium)
   - RDS PostgreSQL (db.t3.micro)
   - ElastiCache Redis (cache.t3.micro)
   - Secrets Manager secret: `/prod/threads/access-token`

2. **Deploy App**
   ```bash
   npm run build
   npm run start:prod
   ```

3. **Verify**
   ```bash
   curl https://threads-automation.dntech.id/health
   ```

4. **Monitor**
   - DataDog dashboard
   - Sentry errors
   - Slack alerts

---

## 📚 KEY DOCUMENTS

- **PRD v3.1** → Product requirements
- **SDD v3.1** → System architecture + database
- **NESTJS_IMPLEMENTATION_v3.2** → Copy-paste code
- **THREADS_API_BEST_PRACTICE.md** → Token management + security
- **IMPLEMENTATION_CHECKLIST_v3.2** → Day-by-day tasks

---

**Version:** v3.2 (Static Token)  
**Last Updated:** 2026-09-13  
**Status:** Production Ready ✅

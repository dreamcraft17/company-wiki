# 🚀 START HERE — Threads Automation v3.2
## Static Token Architecture (No OAuth, Simple & Secure)

---

## 📌 WHAT IS THIS?

**Threads Automation Bot** = Internal tool for DN Tech to auto-generate + approve + schedule + publish posts to Threads (@dntech account).

**Architecture:**
- 1 static token (no user login)
- AI generates posts (Gemini primary, OpenAI fallback)
- Human approves (Dozer)
- Worker publishes on schedule
- Done!

---

## 🎯 FOR SPRINT 1 (Days 1-5): Read These 4 Docs

### 1️⃣ **NESTJS_IMPLEMENTATION_v3.2_STATIC_TOKEN.md**
**Purpose:** Copy-paste code to build the app  
**Content:**
- Project setup (npm install)
- Environment variables (.env template)
- Prisma database schema
- ThreadsConfigService (AWS Secrets Manager)
- ThreadsAPIService (publish logic)
- PublishScheduler (cron job)
- Module setup

**Action:** Copy sections into your NestJS project as you code

---

### 2️⃣ **IMPLEMENTATION_CHECKLIST_v3.2_STATIC_TOKEN.md**
**Purpose:** Day-by-day task list for Sprint 1  
**Content:**
- Day 1: Project setup + AWS Secrets Manager
- Day 2: Database schema + Prisma
- Day 3: ThreadsConfigService
- Day 4: ThreadsAPIService
- Day 5: Bull queue + scheduler

**Action:** Follow checklist sequentially. Check off as you go.

---

### 3️⃣ **THREADS_API_BEST_PRACTICE.md**
**Purpose:** How to manage token securely + production best practices  
**Content:**
- Token acquisition (1x manual setup)
- AWS Secrets Manager setup
- Token caching (5 min TTL)
- Error handling (retry, cleanup)
- Rate limit protection (250/24h)
- Monitoring & alerting

**Action:** Reference when implementing ThreadsConfigService + ThreadsAPIService

---

### 4️⃣ **QUICK_REFERENCE_v3.2_STATIC_TOKEN.md**
**Purpose:** Quick lookup (cheat sheet)  
**Content:**
- Environment variables
- Folder structure
- API endpoints
- Database tables
- Publishing flow
- Cron jobs
- Troubleshooting

**Action:** Keep open while coding. Copy-paste env var names, check table schemas, debug issues.

---

## ❌ DOCS TO SKIP (for now)

| Doc | Why Skip | When Read |
|-----|----------|-----------|
| **THREADS_AUTOMATION_PRD_v3.1.md** | Big picture, not needed for coding | After Sprint 1 (optional) |
| **THREADS_AUTOMATION_SRS_v3.1.md** | Requirements, not needed for coding | After Sprint 1 (optional) |
| **THREADS_AUTOMATION_SDD_v3.1.md** | Architecture overview, partial OAuth info | After Sprint 1 (optional) |
| **NESTJS_LLM_IMPLEMENTATION.md** | Old (Express-based), superseded by v3.2 | **SKIP** |
| **IMPLEMENTATION_CHECKLIST.md** | Old (Express-based), superseded by v3.2 | **SKIP** |
| **QUICK_REFERENCE.md** | Old, use v3.2 instead | **SKIP** |
| **Other docs** | Not in critical path | After launch |

---

## 🎬 QUICK START (5 Minutes)

```bash
# 1. Read this document (you're doing it now) ✓

# 2. Check environment (have these ready?)
- PostgreSQL database
- Redis
- AWS account (for Secrets Manager)
- Gemini API key
- OpenAI API key
- @dntech Threads token

# 3. Open IMPLEMENTATION_CHECKLIST_v3.2_STATIC_TOKEN.md
# Follow Day 1 tasks

# 4. When coding, reference:
# - NESTJS_IMPLEMENTATION_v3.2_STATIC_TOKEN.md (copy code)
# - QUICK_REFERENCE_v3.2_STATIC_TOKEN.md (lookup)
# - THREADS_API_BEST_PRACTICE.md (auth/security)

# 5. Deploy checklist at end of IMPLEMENTATION_CHECKLIST_v3.2
```

---

## 🔑 KEY DECISIONS (Already Locked-In)

| Decision | Value | Why |
|----------|-------|-----|
| **Architecture** | Static token (1 bot account) | Simple, no OAuth complexity |
| **Framework** | NestJS 10 | Aligned with dnShop, dnPeople |
| **Database** | PostgreSQL + Prisma | Type-safe, migrations |
| **Job Queue** | Bull (Redis-backed) | Reliable, simple |
| **Token Storage** | AWS Secrets Manager | Encrypted, audited, rotated |
| **LLM Primary** | Gemini Flash | Cost-optimized (~$0.00277/post) |
| **LLM Fallback** | OpenAI GPT-4 Turbo | High quality if Gemini down |
| **Publishing** | 2-step (create + publish) | Atomic, safe rollback |
| **Rate Limit** | 250 posts/24h | Threads platform limit |
| **Retries** | 3x with backoff | Resilient (1s, 2s, 4s) |

---

## 📊 SPRINT 1 ROADMAP (5 Days)

```
Day 1: Project Setup + AWS Secrets Manager
├─ NestJS init
├─ Dependencies installed
├─ .env configured
├─ AWS Secrets Manager secret created
└─ PostgreSQL + Redis running
   
Day 2: Database Schema + Prisma
├─ prisma/schema.prisma created
├─ 8 models defined
├─ Migrations run
└─ Database verified

Day 3: ThreadsConfigService (AWS Secrets Manager)
├─ Token fetch with caching
├─ Token expiry tracking
├─ Error handling
└─ Tests pass

Day 4: ThreadsAPIService (Publish Logic)
├─ 2-step publish (create container + publish)
├─ Rate limit check
├─ Retry with backoff
├─ Error cleanup
└─ Tests pass

Day 5: PublishScheduler (Cron Job)
├─ Bull queue setup
├─ Cron every 1 minute
├─ Job processor
├─ Database updates atomic
└─ End-to-end flow works
```

**Output by Day 5:**
- ✅ NestJS app compiled + running
- ✅ Database schema created
- ✅ Threads token fetched from AWS
- ✅ Posts can be published to Threads
- ✅ Scheduler automatically publishes scheduled posts

---

## 🎯 WHAT YOU'LL BUILD (Sprint 1)

By end of Day 5, you have:

```
POST /api/v1/posts/generate
├─ Input: { topics: ["topic1", "topic2"] }
├─ Output: { posts: [{id, topic, generatedText, ...}] }
└─ Storage: DB (status='draft')

[Manual] Update post: status='approved', scheduledAt=tomorrow 2PM

[Automatic] Every 1 minute, cron checks:
├─ Find approved posts where scheduledAt <= NOW()
├─ Add to Bull queue
├─ Process: call Threads API
├─ Publish to @dntech account
└─ Update DB: status='published', threadsPostId='xyz'

RESULT: Post visible on @dntech Threads! 🎉
```

---

## 🔐 CRITICAL: Token Setup (Do This First!)

### Step 1: Get Threads Token (5 min)
```bash
1. Login to https://threads.net as @dntech
2. Go to Settings → Apps & Websites
3. Click "Generate Access Token"
4. Copy token (starts with EAAB...)
5. Keep it safe (don't commit to Git!)
```

### Step 2: Store in AWS Secrets Manager (5 min)
```bash
aws secretsmanager create-secret \
  --name /prod/threads/access-token \
  --secret-string "EAAB...paste_token_here"
```

### Step 3: Verify Access (2 min)
```bash
aws secretsmanager get-secret-value \
  --secret-id /prod/threads/access-token
```

**If this fails:** Check AWS credentials + IAM role permissions

---

## 📚 DOCUMENT HIERARCHY

```
00_START_HERE_v3.2.md (You are here)
│
├─ For Sprint 1 coding:
│  ├─ NESTJS_IMPLEMENTATION_v3.2_STATIC_TOKEN.md
│  ├─ IMPLEMENTATION_CHECKLIST_v3.2_STATIC_TOKEN.md
│  ├─ QUICK_REFERENCE_v3.2_STATIC_TOKEN.md
│  └─ THREADS_API_BEST_PRACTICE.md
│
└─ For context (read after Sprint 1):
   ├─ THREADS_AUTOMATION_PRD_v3.1.md (product requirements)
   ├─ THREADS_AUTOMATION_SRS_v3.1.md (software requirements)
   ├─ THREADS_AUTOMATION_SDD_v3.1.md (system design)
   └─ TECH_STACK_UPDATE.md (stack overview)

❌ Do NOT use:
   ├─ NESTJS_LLM_IMPLEMENTATION.md (old Express version)
   ├─ IMPLEMENTATION_CHECKLIST.md (old version)
   ├─ QUICK_REFERENCE.md (old version)
   └─ Other v3.1 docs
```

---

## ⚡ TL;DR (The Absolute Minimum)

1. **Setup AWS Secrets Manager** with Threads token
2. **Follow IMPLEMENTATION_CHECKLIST_v3.2** day-by-day
3. **Copy code from NESTJS_IMPLEMENTATION_v3.2**
4. **Reference QUICK_REFERENCE_v3.2** while coding
5. **Check THREADS_API_BEST_PRACTICE** for auth/security
6. **Done!** 🚀

---

## ❓ FAQ

**Q: Where do I find the code to copy?**  
A: **NESTJS_IMPLEMENTATION_v3.2_STATIC_TOKEN.md** → Sections 3-7

**Q: What if I get stuck?**  
A: Check **QUICK_REFERENCE_v3.2_STATIC_TOKEN.md** troubleshooting section

**Q: How long is Sprint 1?**  
A: 5 days (20 working hours). One task per day.

**Q: Do I need to read the old docs (PRD/SRS/SDD)?**  
A: Not for Sprint 1. Read after if you want product context.

**Q: Can I skip AWS Secrets Manager?**  
A: **No.** It's in the checklist for Day 1. It's 10 minutes.

**Q: What if I don't have AWS?**  
A: Then you can store token in .env for now (not secure, but works locally). Upgrade to Secrets Manager before production.

---

## 🚀 READY?

**Next step:** Open **IMPLEMENTATION_CHECKLIST_v3.2_STATIC_TOKEN.md** → Day 1 → Get started!

Questions? Check docs or ask. 💪

---

**Version:** v3.2 (Static Token)  
**Status:** 🟢 Production Ready  
**Last Updated:** 2026-09-13  
**Tech Lead:** Dozer  
**Estimated Sprint 1:** 5 days

# THREADS AUTOMATION BOT — Product Requirements Document (PRD) v3.1

## 1. PRODUCT OVERVIEW

### 1.1 Definisi Produk
- **Nama:** Threads Automation Bot
- **Owner:** DN Tech Engineering Team
- **Target User:** DN Tech internal team untuk content marketing di Threads
- **Status:** Internal tool (bukan produk commercial)
- **Scope:** AI-driven content generation + scheduling + posting ke Threads platform

### 1.2 Problem Statement
- Manual pembuatan konten Threads memakan waktu
- Inkonsistensi brand voice dalam posting
- Sulit optimalisasi posting time untuk engagement maksimal
- Risk posting konten yang tidak sesuai brand guidelines

### 1.3 Success Criteria
- Reduce content creation time dari 2-3 jam per batch menjadi 15-20 menit
- Maintain 100% brand voice consistency via templated guidelines
- Increase engagement rate minimal 20% vs manual posting
- Zero off-brand atau controversial content published (human approval gate 100%)

---

## 2. KEY FEATURES & USER STORIES

### 2.1 Feature Set v3.1

#### F1: Batch Content Generation (Max 10 topics)
- **User Story:** Sebagai content strategist, saya ingin submit 5-10 topics sekaligus dan mendapat AI-generated draft Threads posts, sehingga saya bisa review dan approve dalam satu batch
- **Acceptance Criteria:**
  - Accept 1-10 topics via web form atau API
  - Generate unique post per topic using configured LLM provider
  - Inject DN Tech brand guidelines ke dalam setiap prompt
  - Return hasil dalam format: { topic, generated_text, tone, hashtags, call_to_action }
  - Batch processing completes dalam < 30 detik untuk 10 topics

#### F2: Multi-Provider LLM Support (Provider-Agnostic)
- **User Story:** Sebagai tech lead, saya ingin switch LLM provider (Claude, GitHub Codex, OpenRouter) tanpa code changes, untuk flexibility dan cost optimization
- **Acceptance Criteria:**
  - Implement ILLMProvider interface dengan 3 concrete implementations
  - Switch via LLM_PROVIDER environment variable
  - Cost tracking per provider (log ke llm_cost_log table)
  - Fallback mechanism jika primary provider down
  - Zero downtime saat provider switch

#### F3: Human Approval Gate (Mandatory)
- **User Story:** Sebagai content manager, saya harus review & approve setiap post sebelum scheduled, untuk memastikan brand safety dan content quality
- **Acceptance Criteria:**
  - Web UI dengan side-by-side comparison: original topic vs generated post
  - Approve, reject, atau edit functionality
  - Add comments/feedback untuk tracking
  - Bulk approve untuk 2-3 posts yg sudah QA
  - SLA: Must approve within 4 business hours, atau auto-reject notify team

#### F4: Content Scheduling & Publishing
- **User Story:** Sebagai marketer, saya ingin schedule posts ke Threads untuk publish di specific date/time, agar reach optimal audience
- **Acceptance Criteria:**
  - Schedule posts untuk future date/time (min 1 hour advance, max 30 days)
  - Support immediate publish untuk urgent posts
  - Batch scheduling: up to 10 posts dalam satu request
  - Respect Threads API rate limit (250 posts per 24 hours)
  - Publish logs dengan timestamp, status, error details

#### F5: Optimal Posting Time Recommendations
- **User Story:** Sebagai strategist, saya ingin suggestion optimal posting time based on past engagement data, agar posts reach maksimal audience
- **Acceptance Criteria:**
  - Daily cron job compute engagement heatmap (by hour of day)
  - Analyze: views, likes, replies, reposts dari posts 30 hari terakhir
  - Return top 3 recommended hours dengan engagement score
  - Visual heatmap di dashboard (7x24 grid)
  - Update setiap hari jam 2 pagi UTC

#### F6: Brand Guidelines Management
- **User Story:** Sebagai brand manager, saya ingin centralize DN Tech brand voice parameters, sehingga semua generated posts consistent
- **Acceptance Criteria:**
  - Database table: brand_guidelines (DN Tech settings)
  - Store: tone (professional/casual), key_values, tone_examples, forbidden_topics, hashtag_list
  - API endpoint untuk update guidelines tanpa deploy
  - Version control per change (who, when, what changed)
  - Inject guidelines ke setiap LLM prompt otomatis

#### F7: Cost Tracking & Optimization
- **User Story:** Sebagai CFO, saya ingin visibility ke LLM API costs per provider, untuk budget planning dan optimization
- **Acceptance Criteria:**
  - Log setiap LLM call: provider, tokens_used, cost_usd, timestamp
  - Dashboard: cost breakdown by provider (daily/weekly/monthly)
  - Cost per post calculation
  - Alert jika monthly spend exceed budget threshold
  - CSV export untuk accounting reconciliation

#### F8: Performance Analytics Dashboard
- **User Story:** Sebagai content lead, saya ingin see engagement metrics per post dan trend over time, untuk measure campaign success
- **Acceptance Criteria:**
  - Fetch dari Threads API: views, likes, replies, reposts, shares per post
  - Store metrics daily (via cron job)
  - Dashboard: top performing posts, engagement trend, audience growth
  - Compare performance: automated vs manual posts
  - Export capability (PDF, CSV)

---

## 3. TECHNICAL ARCHITECTURE DECISIONS (Locked-In)

### 3.1 LLM Provider Abstraction
- **Decision:** Provider-agnostic `ILLMProvider` interface
- **Implementations:**
  - Claude API (Anthropic)
  - GitHub Codex (fallback)
  - OpenRouter (multi-model broker)
- **Rationale:** Avoid vendor lock-in, enable cost optimization, ensure continuity jika one provider down

### 3.2 Approval Gate Architecture
- **Decision:** Mandatory human review gate BEFORE scheduling
- **Flow:** Generate → Store in draft state → Approval UI → Approve/Reject → Schedule/Archive
- **Rationale:** Brand safety, regulatory compliance, prevent reputational risk

### 3.3 Data Model Core Changes
- **New Tables:**
  - `threads_posts` (id, topic, generated_text, approval_status, scheduled_at, published_at)
  - `approval_logs` (post_id, approver_id, status, comments, decision_timestamp)
  - `llm_cost_log` (provider, tokens_used, cost_usd, timestamp)
  - `brand_guidelines` (parameter_name, value, version, updated_by, updated_at)
  - `engagement_metrics` (post_id, views, likes, replies, reposts, shares, fetched_at)
  - `posting_heatmap` (hour_of_day, day_of_week, avg_engagement_score)

### 3.4 Stack
- **Backend:** TypeScript + Node.js (Express/Fastify)
- **Frontend:** React 18 + Tailwind CSS
- **Database:** PostgreSQL (relational) + Redis (caching)
- **Threads Integration:** Meta Graph API v1.0
- **LLM Providers:** Anthropic API, OpenRouter API
- **Hosting:** AWS EC2 / Vercel (backend), Vercel (frontend)
- **Monitoring:** DataDog, Sentry

---

## 4. SUCCESS METRICS & KPIS

| Metric | Target | Measurement |
|--------|--------|-------------|
| Content creation efficiency | 15-20 min/batch (vs 2-3 hrs manual) | Timer from topic submit → approved draft |
| Brand voice consistency | 100% | Manual QA spot check, user feedback |
| Approval turnaround | < 4 business hours | Avg time from generated → approved |
| Publishing success rate | 99%+ | Posts published / posts approved |
| Engagement rate lift | +20% vs manual | Avg engagement (likes+replies+shares) automated vs manual |
| Cost per post | < $0.05 | Total LLM costs / posts generated |
| Monthly uptime | 99.5% | Monitoring via synthetic tests |
| User adoption | 80%+ team using monthly | Active users / total eligible |

---

## 5. RELEASE PLAN (4-Week Sprints)

### Sprint 1: Foundation & Core LLM Integration
- Implement ILLMProvider interface (Claude + OpenRouter)
- Setup database schema (threads_posts, brand_guidelines, llm_cost_log)
- Build batch generation API endpoint
- Cost tracking setup
- Target: Generate + store functionality live (approval WIP)

### Sprint 2: Approval Gate & Scheduling
- Approval UI (web dashboard)
- Approval workflow endpoints
- Threads API integration (publish endpoint)
- Scheduling logic
- Target: Full end-to-end generation → publish flow

### Sprint 3: Analytics & Recommendations
- Fetch engagement metrics from Threads API
- Build heatmap computation logic
- Posting time recommendation engine
- Analytics dashboard
- Target: Data-driven optimization features live

### Sprint 4: Polish & Internal Launch
- Performance optimization
- User documentation
- Team training
- Monitoring setup
- Load testing
- Target: Internal launch + feedback iteration

---

## 6. CONSTRAINTS & ASSUMPTIONS

### Constraints
- Threads API rate limit: 250 posts per 24 hours
- Max batch generation: 10 topics per request
- Approval gate non-negotiable (100% human review)
- Internal-only tool (no multi-tenancy required)
- DN Tech employees only (no external API access)

### Assumptions
- Threads API stability: 99%+ uptime
- Average approval review time: 10-15 min per batch
- Team capacity: 1 FTE for 4-week delivery
- No immediate need for video/carousel support (Phase 2+)

---

## 7. OUT OF SCOPE (v3.1)

- Multi-tenancy & per-user rate limiting
- Video or carousel post generation
- Instagram/Facebook cross-posting
- Content calendar UI (use Google Calendar integration)
- Social listening or trend analysis
- User roles & permissions (v3.2+)

---

## 8. OPEN QUESTIONS & DECISIONS PENDING

1. **Brand voice training:** Use embeddings vs few-shot prompting?
2. **Approval SLA:** 4 hours vs 8 hours or on-demand?
3. **Fallback strategy:** If all LLM providers down, manual fallback or pause tool?
4. **Hashtag strategy:** Auto-generate vs manually curated list?
5. **Cost tracking:** Which LLM provider default for cost optimization?

---

## 9. GLOSSARY

- **HITL:** Human-In-The-Loop
- **Threads:** Meta text-based social platform
- **ILLMProvider:** Interface abstraction for LLM provider implementations
- **Heatmap:** 7x24 grid showing engagement by hour/day
- **Brand guidelines:** Tone, values, forbidden topics for DN Tech
- **Approval gate:** Mandatory review before scheduling/publishing
- **Cost log:** Tracking table for LLM API spending

---

**Document Version:** v3.1  
**Last Updated:** 2026-09-13  
**Owner:** DN Tech Tech Lead (Dozer)  
**Status:** Ready for Sprint Planning

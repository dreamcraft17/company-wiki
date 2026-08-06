# dnShop Finance v2.1 — Production Go-Live & Seller Scale
## Product Requirements Document

**Document:** PRD v2.1 (Phase A — Go-live ops)  
**Date:** 5 Agustus 2026  
**Owner:** Dozer (CEO + Tech Lead), DN Tech  
**Product:** dnShop Finance — Shopee seller dashboard + pembukuan bonus  
**Baseline:** v1.0 MVP + v2.0 Pembukuan + dashboard charts + ops desk UI  
**Status:** **Implemented** (6 Agustus 2026) — SOPI go-live + UI2; lihat `docs/STATUS.md`. PRD berikutnya = **v2.2** (`docs/NEXT-PRD-BRIEF.md`).

---

## 1. Executive Summary

dnShop Finance v2.0 sudah punya **pembukuan fitur lengkap sebagai bonus di akun seller** (manual journal, auto-journal dari Shopee, GL, P&L, balance sheet, audit trail). Dashboard dengan chart berperiode, filter unlimited, dan UI ops desk juga sudah live di prod DN Tech (`shop.dntech.id`).

**Problem:** Produk sudah live tapi **belum siap untuk penjualan ke seller nyata** karena:
- Shopee credential masih mock — partner OAuth belum live
- Email verifikasi + notifikasi hanya log ke console
- Redis queue & Bull tidak aktif — sync synchronous
- Onboarding pembukuan langsung ke daftar CoA tanpa wizard
- Tier pricing belum di-enforce di API
- Observability hanya `/auth/health` + console log
- Belum ada playbook UAT untuk beta seller 10–50

**Solution (v2.1):** Implement **production go-live stack** — live Shopee OAuth, transactional email, async queue, pembukuan wizard, tier gate, structured observability, dan beta cohort playbook.

**Outcome:** Seller nyata bisa connect toko Shopee live, menerima email verifikasi + settlement notifikasi, dan menyelesaikan setup pembukuan pertama tanpa support manual — dengan tim DN Tech bisa monitor kesehatan produksi.

**Timeline:** 8 minggu (soft-launch +4 minggu, GA +8 minggu)  
**Scope:** Jalur A — go-live ops (bukan accounting depth atau marketplace baru)

---

## 2. Problem Statement

### 2.1 Kondisi saat ini (v2.0)
- ✅ Pembukuan fitur lengkap (manual + auto-journal, GL, P&L, trial balance, audit, PDF export)
- ✅ Dashboard dengan chart tren, komposisi, status, metode bayar, produk terlaris
- ✅ Redesign ops desk (Syne + IBM Plex + signal orange panel)
- ✅ Demo dengan seed 100+ journal entries
- ✅ Prod DN Tech live di `shop.dntech.id` + `api.shop.dntech.id` (pm2 + nginx + LE)

### 2.2 Gap untuk penjualan ke seller
| Item | Saat ini | Kebutuhan |
|------|----------|-----------|
| **Shopee OAuth** | Mock (hardcoded mock key) | Live partner OAuth → prod token refresh |
| **Webhook order/payment** | Tidak ada | Verify HMAC, backoff retry, reconciliasi gap |
| **Email verifikasi** | Console log | SMTP prod, template ID, SPF/DKIM, bounce handling |
| **Notifikasi settlement** | Tidak ada | Email + in-app bell notification |
| **Queue async** | Inline (sync semua) | Bull → Redis queue untuk sync/report batch |
| **Onboarding pembukuan** | Langsung CoA list | Wizard: empty state → template pilih → auto-journal ON → backfill |
| **Tier enforcement** | Free/Starter/Pro/Ent enum saja | API gate (free tanpa journal, Starter cap 50/mo, Pro unlimited) |
| **Observability** | `/auth/health` + console | JSON log, alert 5xx, latency metric, internal ops dashboard |
| **Beta seller cohort** | Belum ada | 10–50 seller invite, UAT checklist, feedback loop |

### 2.3 Blocker untuk revenue
- Partner Shopee approval delay → webhook tergantung OAuth live dulu
- Email deliverability (SPF/DKIM) → seller tidak dapat verifikasi, tidak bisa proceed
- Tier tidak ada enforcement → free seller bisa gunakan jurnal unlimited
- Sync sync → latency tinggi, UX jelek untuk toko besar
- Tidak ada observability → produksi issue susah debug

---

## 3. Vision & Success Criteria

### 3.1 Vision statement
**dnShop Finance adalah toolkit finansial first-class untuk seller Shopee Indonesia** — dashboard real-time + pembukuan otomatis + compliance pajak — tanpa perlu Talenta/Gadjian, semuanya di satu tempat.

Versi 2.1: Semua seller bisa **connect toko Shopee live**, **terima email transaksional**, dan **setup pembukuan** dalam **5 menit tanpa support manual**.

### 3.2 Success metrics
| Metric | Target | Timeline | Owner |
|--------|--------|----------|-------|
| Seller live connected Shopee | ≥10 toko nyata | +8 minggu | Dozer + ops |
| Email verifikasi delivered | ≥95% inbox rate | +4 minggu | Email ops |
| Pembukuan wizard completion | ≥60% beta users | +8 minggu | Product |
| Sync latency p95 | <5 menit order→dashboard | +8 minggu | Backend |
| Zero P0 incident tanpa runbook | 30 hari (soft-launch) | Ongoing | DevOps |
| Beta seller NPS | ≥7 | +8 minggu | Sales + CS |
| API uptime | ≥99.5% | Ongoing | Infrastructure |

---

## 4. In Scope v2.1

### 4.1 Core features (P0)

#### 4.1.1 Live Shopee Open API integration
- Shopee partner ID + secret key management (admin UI di ops desk)
- OAuth 2.0 redirect flow → prod token + refresh token
- Token refresh cron (setiap 6 jam atau saat refresh needed)
- Webhook listener: order created, order cancelled, payment created, refund created
- Webhook verify HMAC (SHA-256), log unverified requests
- Backoff retry: exponential (1s, 2s, 4s, 8s max) untuk sync failure
- Reconcile gap: jika webhook miss, cron sync last 24h setiap jam

#### 4.1.2 SMTP production + email flow
- SMTP provider setup (SendGrid atau Mailgun di prod VPS)
- Email template: verifikasi, reset password, settlement notifikasi, journal approval
- Email verification mandatory di prod (optional di dev/sandbox)
- Bounce + complaint handling (jika SMTP punya webhook)
- Resend logic: jika bounce, show message ke seller
- SPF/DKIM/DMARC setup di dntech.id domain

#### 4.1.3 Pembukuan onboarding wizard
- Empty state screen setelah first login atau pertama kali ke `/journal`
- Wizard step:
  1. **Pilih template** (SAK EMKM / Custom lite)
  2. **Konfigurasi** (mata uang, periode closing, approval mode)
  3. **Auto-journal Shopee ON** (backfill 30 hari terakhir)
  4. **Selesai** → GL siap review
- Skip wizard toggle (untuk yang sudah punya jurnal)
- Completion flag: `onboarded_at` timestamp

#### 4.1.4 Tier enforcement (pricing gate)
- **Free tier:** Dashboard view only — tidak bisa buka `/journal`
  - Upsell modal: "Pembukuan tersedia di Starter"
- **Starter tier:** 50 journal entries per bulan (DRAFT + POSTED), unlimited dashboard
- **Pro tier:** unlimited journal entries, advanced reports (cash flow on demand di v2.2)
- Gate logic di API (`GET /api/v1/shops/:shopId/journals` → 402 jika free + checked journal)
- UI: show tier badge, remaining entries, upsell CTA
- Demo seed (`seller@dnshop.id`) → set ke Pro tier (agar test tidak terputus)

#### 4.1.5 Observability & monitoring
- **Structured logging** (JSON to file + stdout)
  - Field: timestamp, level, service, shopId, endpoint, duration, error
  - Log retention: 30 hari (di VPS `/var/log/dnshop/`)
- **Health endpoint extended**
  - `/api/v1/auth/health` → `{ ok, db, redis, smtp, shopee_api }`
  - Response time < 1s (timeout yang gagal → status "degraded", bukan 500)
- **Error alerts** (P0 / P1)
  - P0: 5xx rate >1% dalam 5 menit → alert Dozer (Slack/email)
  - P1: Shopee webhook fail rate >5% → log, notifikasi ops
- **Metrics** (untuk v2.2 dashboard ops)
  - Sync latency (order waktu diterima → masuk dashboard): p50, p95, p99
  - Email bounce rate (%)
  - Tier gate deny rate (free users trying journal)
  - API response time per endpoint
  - Exporter: stdout (untuk sekarang), Prometheus-ready (untuk nanti)

#### 4.1.6 Beta cohort UAT + playbook
- **Invite flow:** Admin bisa invite seller via email → create akun + set tier Starter
- **UAT checklist** (di admin panel atau notion):
  - [ ] Email verifikasi diterima
  - [ ] Shopee OAuth connect berhasil
  - [ ] Auto-journal backfill 30 hari ok
  - [ ] Pembukuan wizard completion
  - [ ] Dashboard chart render benar
  - [ ] Tier gate (upsell modal) terlihat
  - [ ] PDF export lancar
- **Feedback channel:** Slack thread atau form, log di audit trail
- **Success = 10–50 seller** dengan minimal 5 toko nyata connected, ≥1 jurnal entry per toko

### 4.2 Related features (P1 — soft-launch +8 minggu)

#### 4.2.1 Redis queue + Bull (async processing)
- Aktivasi Bull queue saat `REDIS_HOST` env var set
- Queues:
  - `shopee-sync`: order/payment sync dari webhook + cron
  - `email`: send transactional email
  - `journal-backfill`: auto-journal dari 30 hari Shopee history
  - `report-generate`: PDF / CSV export (async)
- Worker: NestJS Bull module, concurrency 5
- Fallback: jika `REDIS_HOST` kosong, queue = immediate (sync) — safe untuk dev
- Retry: exponential (1s, 2s, 4s, 8s), max 3 attempt, move to dead letter setelah failed
- Dead letter queue: `/api/v1/admin/queues/dead-letter` (list untuk ops debug)

#### 4.2.2 In-app help + tooltip pembukuan
- Context-aware help: hoverable `?` icon pada CoA, entry fields, balance sheet
- Copy: seller-friendly (simple kata-kata), bukan accounting jargon
- Link ke FAQ / knowledge base (opsional di v2.1, link saja)
- Tooltip bahasa Indonesia, dapat di-customize per tier (Starter vs Pro)

#### 4.2.3 Status page publik (opsional)
- Halaman statis: `https://shop.dntech.id/status` atau `status.dntech.id`
- Show: API uptime, Shopee sync latency, email delivery status
- Update: setiap 5 menit (dari metrics endpoint internal)
- UX: simple green/yellow/red, last incident log

### 4.3 Out of scope v2.1
- **Cash Flow Statement, COGS automation, MYOB/Jurnal/Accurate sync, e-Faktur XML** → v2.2
- **Tokopedia, Lazada, marketplace lain** → v3.0
- **Mobile app** → v3.0
- **Redesign UI dasar** (sudah ops desk Agustus 2026)
- **White-label / accounting firm white-label** → future
- **Batch reconcile tools** (manual match sudah ada di v2.0)

---

## 5. Detailed Feature Map

### 5.1 Live Shopee OAuth
| User story | AC | Endpoint | Note |
|------------|--|---------|----|
| Seller click "Connect Shopee" | Redirect ke Shopee OAuth → approve → callback dengan `code` | `POST /auth/shopee/callback` | Mock fallback jika `SHOPEE_PARTNER_ID` kosong |
| Sistem simpan token + refresh | Token di DB (encrypted), refresh_token, expires_at | `POST /auth/shopee/callback` | Don't log token value |
| Cron refresh token sebelum expired | 6 jam sekali atau saat expired, refresh_token API Shopee | Cron job `RefreshShopeeTokenCron` | Alert jika refresh fail (P1) |
| Webhook order masuk | Parse payload, verify HMAC, create order record | `POST /webhooks/shopee/orders` | 202 instant return, process di queue |
| Webhook payment masuk | Parse payload, verify HMAC, auto-journal payment | `POST /webhooks/shopee/payments` | 202 instant, queue auto-journal |

### 5.2 SMTP production
| User story | AC | Endpoint | Note |
|------------|--|---------|----|
| Seller daftar akun | Email verifikasi sent, seller terima dalam 5 menit | `POST /auth/register` | Fail jika SMTP error → show pesan, tapi signup tetap success |
| Seller klik link verifikasi | Email marked verified, allow login | `GET /auth/verify?token=...` | Token expire 24h |
| Seller reset password | Email reset sent, link 30 menit | `POST /auth/forgot-password` | Jika email tidak ada → generic "check inbox" |
| Settlement notifikasi | Email sent setelah Shopee payment settlement | Auto-journal approval approval | Template: amount, tanggal, akun |

### 5.3 Pembukuan wizard
| Step | Content | AC | Flow |
|-----|---------|--|----|
| **Welcome** | Show benefit, "5 menit setup" | Display welcome, "Mulai" button | Jika already `onboarded_at`, skip ke journal list |
| **Template** | Choose SAK EMKM vs lite | Radio, preview CoA, "Lanjut" button | Default SAK EMKM |
| **Config** | Currency (IDR), closing period (monthly), approval mode (auto/manual) | Dropdown, save ke shop settings | IDR default, monthly default |
| **Auto-journal** | Backfill Shopee 30 hari + toggle ON | Show "Processing...", progress bar | Queue job, polling setiap 2s |
| **Done** | Congrats screen, "Lihat dashboard" → `/journal` | Button ke GL overview | Set `onboarded_at = now()` |

### 5.4 Tier enforcement
| Tier | Journal limit | Features | Upsell |
|-----|--------------|----------|--------|
| **Free** | Locked | Dashboard view, no journal | Modal: "Pembukuan di Starter ⭐" with upgrade CTA |
| **Starter** | 50 entries/bulan | Manual + auto-journal, GL, P&L, balance sheet | Modal: "50 entry cukup? Upgrade ke Pro unlimited" |
| **Pro** | Unlimited | All above + advanced reports (v2.2) | None |
| **Enterprise** | Unlimited | All + API access, white-label (future) | Custom |

### 5.5 Observability
| Layer | Component | Signal | Action |
|-------|-----------|--------|--------|
| **Health** | DB, Redis, SMTP, Shopee API | ping ≤1s | `/api/v1/auth/health` response |
| **Error** | 5xx rate per endpoint | >1% in 5min | Alert to ops |
| **Sync** | Shopee webhook → order in dashboard | Latency p95 <5min | Log, metric collect |
| **Email** | SMTP delivery | Bounce rate | Monitored via provider webhook |
| **Queue** | Bull job success/fail | Dead-letter count | `/api/v1/admin/queues/dead-letter` |

---

## 6. Technical Non-Functional Requirements

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| **Sync latency** | p95 <5 min (order diterima → dashboard update) | CloudWatch / log parser |
| **Email delivery** | ≥95% inbox rate | SendGrid / Mailgun dashboard |
| **API uptime** | ≥99.5% (monthly) | Health check per 5min |
| **Health check response** | <1 second | Response time SLA |
| **Webhook backoff** | Max 3 retry, exponential | Job execution log |
| **Log retention** | 30 hari | VPS disk `/var/log/dnshop/` |
| **DB connection pool** | 20 (TypeORM default) | Via monitoring |
| **Redis TTL** | Token/session 7 hari | ioRedis config |
| **CORS** | Prod: `https://shop.dntech.id`, dev: `http://localhost:6000` | Express CORS config |
| **DB SSL** | Always enabled prod (`DB_SSL=true`) | Supabase / native Postgres |

---

## 7. Security & Compliance

### 7.1 Authentication & Authorization
- OAuth 2.0 Shopee flow dengan PKCE (jika Shopee support)
- JWT token (RS256 asymmetric sign, HS256 verify) — refresh setiap 1 jam
- Permission model: `journal` flag di user record untuk RBAC
- Shop isolation: semua query wajib filter `shop_id` (materialized view atau check constraint)

### 7.2 Webhook & API security
- Shopee webhook HMAC verify (SHA-256) — verify sebelum process
- Incoming request log: timestamp, endpoint, shopId, status (bukan body)
- Secret rotation: Shopee partner key di env, tidak hardcode
- Rate limit: 100 req/min per shop (dari IP atau session)

### 7.3 Email & data privacy
- Email template: no PII di subject, encrypt token in URL
- SMTP auth: via env vars (SendGrid API key)
- Email bounce list: automatic unsubscribe (compliance)
- Audit log: store email attempts (delivery status, bounce reason)

### 7.4 Financial data
- Audit trail: append-only, tamper-evident log (hash chain atau immutable table)
- Journal entry: once POSTED, no delete (only reverse)
- Tier enforcement: API check sebelum allow journal create

---

## 8. Success Criteria & Rollout

### 8.1 Definition of Ready (sebelum sprint)
- [ ] Live Shopee token + webhook URL di admin panel settable
- [ ] SMTP provider account setup (SendGrid / Mailgun), credentials di env
- [ ] Redis VPS or Redis Cloud trial ready
- [ ] UAT seller list prepared (10 toko nyata)
- [ ] Runbook + incident response template written
- [ ] Demo seed updated untuk tier enforcement test

### 8.2 Definition of Done (per feature)
- [ ] Acceptance criteria all testable (Given/When/Then)
- [ ] Unit + integration test coverage ≥80%
- [ ] Mock fallback jalan di dev (jika live API tidak available)
- [ ] Regresi v2.0 seed (`seller@dnshop.id`) lulus
- [ ] Env vars documented + `.env.example` updated
- [ ] Audit trail / security checklist signed off
- [ ] API response time <500ms p95
- [ ] Error scenario tested (no network, webhook timeout, etc)

### 8.3 Rollout phases
| Phase | Timeline | Group | Gate |
|-------|----------|-------|------|
| **Alpha** | Week 1–2 | Dozer + 1 QA | Feature complete, mock Shopee |
| **Soft-launch** | Week 3–4 | 10 beta seller (toko real) | ≥95% email delivery, <5min sync |
| **GA** | Week 5–8 | Public invite | Zero P0 incident di soft-launch, NPS ≥7 |

### 8.4 Launch checklist
- [ ] Live Shopee OAuth tested dengan partner account
- [ ] SMTP verified (send test email, check inbox)
- [ ] Observability endpoint live (`/api/v1/auth/health`)
- [ ] Beta UAT runbook signed by Dozer
- [ ] Incident response: 1 page + escalation contact
- [ ] Demo video: "Setup pembukuan dalam 5 menit"

---

## 9. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Shopee partner approval delay | Go-live postponed 4+ weeks | Medium | Start approval process ASAP; fallback sandbox testing |
| Webhook miss → data gap | Seller data tidak sync | Medium | Reconcile cron every hour; audit reconciliation page |
| SMTP deliverability | Email bounce >5%, seller tidak verify | Medium | Use reputable provider (SendGrid), SPF/DKIM setup, monitor bounce rate daily |
| Tier enforcement breaks demo | `seller@dnshop.id` locked to Free | Low | Set demo seed to Pro tier explicitly |
| Redis single point of failure | Queue backlog, sync slow | Low | Fallback to sync (async OFF); document recovery runbook |
| Load spike (100+ sync per minute) | Latency >5min | Low | Queue concurrency 5, monitor; scale if p95 >3min |
| Email quota exhausted | No email sent | Low | SendGrid pay-as-you-go; alert jika >80% quota |

---

## 10. Dependencies & Assumptions

### 10.1 External dependencies
- **Shopee Open API** partner approval + sandbox + prod environment
- **SMTP provider** (SendGrid / Mailgun) account + domain auth (SPF/DKIM)
- **Redis hosting** (DigitalOcean, Redis Cloud, atau VPS self-hosted)
- **VPS** infrastructure (currently PM2 + nginx, no Docker)

### 10.2 Internal dependencies
- v2.0 pembukuan + dashboard code stable (no major refactor)
- Ops desk UI already done (no redesign)
- Demo seed with 100+ entries already working

### 10.3 Assumptions
- Seller interested dalam pembukuan (market research sudah ok)
- 10–50 seller dapat direkrut untuk beta UAT dalam 4 minggu
- SMTP delivery success rate konsisten (>95%)
- Shopee webhook reliability ≥99%

---

## 11. Timeline & Resource

### 11.1 High-level timeline (8 minggu)

| Week | Focus | Milestone |
|------|-------|-----------|
| **W1** | Live Shopee OAuth setup | Dev env, mock → sandbox tested |
| **W2** | SMTP + wizard pembukuan | Email flow, wizard UI + backfill logic |
| **W3–4** | Tier enforcement + observability | API gate, logging, health check |
| **W5–6** | Redis queue + UAT prep | Bull integration, beta cohort selected |
| **W7–8** | Beta UAT + GA prep | Runbook, incident response, launch docs |

### 11.2 Resource plan
- **Backend (NestJS):** 1 FTE (Dozer), 60% sprint
- **Frontend (React/Next):** 0.5 FTE (share with other project)
- **QA/UAT:** 1 contractor, 4 weeks (W5–8)
- **DevOps/ops:** Dozer, ad-hoc (Redis setup, SMTP config, domain DNS)

---

## 12. Glossary

| Term | Meaning |
|------|---------|
| **Shopee Open API** | Partner OAuth + webhook untuk sync order/payment dari toko Shopee |
| **SMTP** | Simple Mail Transfer Protocol — email provider (SendGrid, Mailgun) |
| **HMAC verify** | Hash-based Message Authentication Code — secure webhook signature check |
| **Tier enforcement** | API gate — free seller tanpa akses journal, Starter cap 50/mo, Pro unlimited |
| **Observability** | Logs + metrics + health check untuk monitor prod |
| **Bull** | Redis queue library di NestJS — async job processing |
| **SAK EMKM** | Standar Akuntansi Keuangan Entitas Mikro Kecil Menengah — CoA template 45 akun |
| **Webhook** | HTTP callback dari Shopee → dnShop saat order/payment terjadi |
| **Audit trail** | Immutable log setiap mutasi data finansial (append-only) |
| **UAT** | User Acceptance Testing — beta seller test sebelum GA |

---

## 13. Approval & Sign-off

| Role | Name | Sign-off | Date |
|------|------|----------|------|
| **Product Owner** | Dozer | [ ] | _____ |
| **Tech Lead** | Dozer | [ ] | _____ |
| **QA Lead** | — | [ ] | _____ |
| **DevOps/Ops** | — | [ ] | _____ |

**Next step:** PRD sign-off → SRS detail review → Sprint planning.

# Chaos Engineering — dnPeople

**Target:** Staging / pre-production first · Production only with written approval  
**Updated:** 21 Agustus 2026  
**Stack:** Next.js :3001 · Express API :4100 · PostgreSQL (Supabase pooler) · PM2 · VPS (bukan K8s)  
**Payment deps:** Xendit · Midtrans (retry 3×, idempotent webhooks)

> Chaos bukan random break — setiap run punya **hipotesis**, **steady-state baseline**, **abort conditions**, dan **findings doc**.

---

## 1. Prerequisites (wajib sebelum experiment)

| Check | dnPeople |
|-------|----------|
| Monitoring | `GET /health`, `GET /metrics` (Prometheus), `/admin/health/*` (SUPER_ADMIN) |
| Alerts | Admin health notifications → SUPER_ADMIN (`AdminNotification`) |
| Rollback < 30s | Script `backend/scripts/chaos/rollback-network.sh` |
| Environment | **Staging VPS** atau local + Supabase staging — **bukan prod tanpa approval** |
| On-call | Named experiment owner + abort authority |

Capture baseline sebelum inject:

```bash
cd dnpeople/backend/scripts/chaos
./steady-state.sh
# Simpan output ke findings doc (§6)
```

---

## 2. Architecture — failure surfaces

```
Browser → Nginx → dnpeople-web (PM2)
                 → dnpeople-api (PM2) → Prisma → PostgreSQL (Supabase)
                                      → Xendit / Midtrans (HTTPS)
                                      → SMTP (outbox retry)
```

**Tidak ada Redis** di path kritis saat ini — cache compliance in-memory (`legalComplianceCache.ts`). Experiment cache Redis diganti dengan **DB latency** dan **payment gateway fault**.

**Resilience sudah di repo:**

| Area | Mechanism |
|------|-----------|
| Midtrans / Xendit API | Retry 3× (1s, 3s, 9s), 10–15s timeout |
| Payment checkout | Idempotent pending payment 30 min window |
| Webhooks | Signature verify + idempotent skip on same status |
| Payroll finalize | Idempotent if already FINALIZED |
| Audit log | `writeAuditLogSafe()` — non-blocking |
| Email | Outbox retry (scheduler) |

**Automated chaos tests (CI-safe):** `backend/src/__tests__/chaosResilience.test.ts`

---

## 3. Workflow (5 langkah)

### Step 1 — Steady state & hipotesis

```
Experiment: [nama]
Environment: staging | production (approved)
Owner: @name · Abort authority: @name

Steady state (15 min sebelum inject):
  - GET /health status: ok
  - API error rate (nginx/PM2 logs): < 0.1%
  - P95 login/dashboard (jika ada APM): < 500ms
  - payment_webhook_success_total trend: stable

Hypothesis:
  We believe that if [FAILURE], then [EXPECTED BEHAVIOR]
  with blast radius [SCOPE] for [DURATION].
```

### Step 2 — Inject (controlled)

Lihat `backend/scripts/chaos/README.md` untuk perintah runnable.

**Abort conditions (contoh):**

- Error rate > 10% selama > 2 menit
- `/health` non-200 > 60s
- Data corruption / duplicate payment detected
- Manual abort oleh owner

### Step 3 — Observe

| Observer | Dashboard / log |
|----------|-----------------|
| App | `pm2 logs dnpeople-api`, `/metrics` |
| DB | Supabase dashboard — connections, latency |
| Business | `/admin/payments`, subscription invoices |
| Payment | Midtrans/Xendit sandbox dashboard |

### Step 4 — Analyze

- Hipotesis confirmed / partial / disproved?
- Recovery time (expected vs actual)?
- User-visible errors?
- Data integrity (orders, invoices, payroll rows)?

### Step 5 — Fix & re-run

Setiap finding → ticket + owner + due date → **re-run experiment yang sama** setelah fix.

Template: [`backend/scripts/chaos/templates/experiment-record.md`](../backend/scripts/chaos/templates/experiment-record.md)

---

## 4. First three experiments (dnPeople)

### Experiment 1 — Slow database (egress latency)

**Why first:** Supabase remote; latency paling sering dirasakan user.

```
Hypothesis:
  When egress latency to PostgreSQL increases by +500ms,
  API remains available: /health ok, login completes < 5s P95,
  no connection pool exhaustion in 5 minutes.

Injection:
  ./db-latency.sh 500 300   # 500ms delay, auto-clear 300s max
  Target: VPS staging, interface egress (default eth0)

Observe:
  - prisma query time in logs
  - pm2 restart count (should stay 0)
  - /health + sample GET /api/v1/dashboard

Rollback:
  ./rollback-network.sh   # or wait for script timeout
```

### Experiment 2 — Payment gateway timeout / 503

**Why second:** Revenue path; retry + idempotency harus terbukti.

```
Hypothesis:
  When Midtrans SNAP create times out or returns 503,
  customer sees PAYMENT_PROVIDER_UNAVAILABLE (503),
  no duplicate Payment row on double POST initiate-payment,
  webhook idempotent when settlement retried.

Injection (staging):
  A) Sandbox: block api.sandbox.midtrans.com briefly (iptables) — manual
  B) CI-safe: npm test — chaosResilience.test.ts (mock fetch failures)

Observe:
  - Single pending payment per invoice (30 min window)
  - payment_webhook_errors_total vs success
  - Invoice status tidak PAID until webhook SETTLEMENT

Rollback:
  Unblock iptables / restore MIDTRANS_* env
```

### Experiment 3 — API process crash mid-request

**Why third:** PM2 restart; uji recovery tanpa corrupt state.

```
Hypothesis:
  When dnpeople-api restarts during active session,
  users re-auth cleanly; in-flight payment webhooks
  reconcile on next Midtrans notification or scheduler reconcile.

Injection:
  pm2 restart dnpeople-api --update-env
  (during staging checkout — coordinate with tester)

Observe:
  - PM2 uptime reset
  - Webhook POST retry from Midtrans (sandbox)
  - reconcileMidtransPending scheduler (pending payments)

Rollback:
  N/A (restart is the fault); verify steady-state script green within 2 min
```

---

## 5. Game day (quarterly)

**Duration:** 3–4 jam · **Participants:** backend + ops + 1 product

| Time | Activity |
|------|----------|
| 0:00 | Steady-state capture, role assignment |
| 0:15 | Experiment 1 (DB latency) |
| 0:45 | Retro + findings |
| 1:00 | Experiment 2 (payment fault) |
| 1:45 | Retro |
| 2:00 | Experiment 3 (PM2 restart) |
| 2:30 | Consolidated action items |

Channel: dedicated Slack/Telegram; update every 15 min during inject.

---

## 6. Tooling map (dnPeople = VPS, not K8s)

| Tool | Use on dnPeople |
|------|-----------------|
| `tc netem` | DB/API egress latency (`scripts/chaos/db-latency.sh`) |
| `iptables` | Block Midtrans/Xendit IP (advanced — document rules) |
| `stress-ng` | CPU/memory pressure on VPS |
| `pm2 restart` | Process crash simulation |
| `toxiproxy` | Future: local docker-compose staging |
| Unit chaos tests | CI — payment retry/idempotency |

**Avoid for greenfield:** Chaos Monkey / Litmus unless migrate to K8s.

---

## 7. Production policy

| Rule | |
|------|---|
| Default | **No production chaos** without VP Eng + written record |
| Allowed prod (rare) | Read-only latency inject, off-peak, feature flag off billing |
| Never | Kill prod DB, fill disk on prod, random prod pm2 delete |
| During incident | **Abort** all scheduled experiments |

---

## 8. Related

| Doc / path | |
|------------|---|
| Operator scripts | `backend/scripts/chaos/README.md` |
| Experiment template | `backend/scripts/chaos/templates/experiment-record.md` |
| Architecture | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Observability | `/metrics`, Sentry (`instrumentation.ts`) |
| A11y / quality | [A11Y-TESTING.md](./A11Y-TESTING.md) |

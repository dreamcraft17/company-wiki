# dnShop Finance v2.1 - Product Requirements Document
## Production Go-Live & Seller Scale

**Version:** 2.1  
**Last Updated:** 6 Agustus 2026  
**Author:** DN Tech  
**Status:** **Implemented** — canonical SOPI specs di [`prd/sopi/`](./sopi/); living status [`docs/STATUS.md`](../docs/STATUS.md)  
**Builds on:** dnShop Finance v1.0 + v2.0 (implemented)  
**PRD berikutnya:** [`docs/NEXT-PRD-BRIEF.md`](../docs/NEXT-PRD-BRIEF.md) → **v2.2**

---

## 1. Executive Summary

**dnShop Finance v2.1** mengubah deployment DN Tech dari “demo production” menjadi **platform siap beta seller nyata**. Fokus bukan fitur akuntansi baru, melainkan **integrasi Shopee live**, **email transaksional**, **onboarding pembukuan**, **enforcement tier**, dan **observability operasional**.

### Apa yang sudah ada (v1.0 + v2.0 — out of scope v2.1)
- Dashboard, orders, payments, tax, bank, reports PDF
- Pembukuan bonus seller: CoA, journal, GL/TB/P&L/BS, audit, auto-journal mock/live partial
- Dashboard charts + filter periode + UI ops desk
- Prod: `shop.dntech.id` / `api.shop.dntech.id`

### Apa yang baru di v2.1
- ✨ **Live Shopee Open API** — OAuth prod, webhook, token refresh, sync teruji UAT
- ✨ **SMTP production** — verifikasi email, notifikasi penting
- ✨ **Onboarding pembukuan** — wizard pertama kali untuk seller
- ✨ **Tier enforcement** — gate fitur pembukuan per paket
- ✨ **Observability** — log terstruktur, health extended, alerting
- ✨ **Beta program** — cohort 10–50 seller + playbook

### Target Users (sama, fokus aktivasi)
- Seller UMKM Shopee yang sudah punya toko live
- Accountant yang onboard klien seller ke dnShop
- Tim ops DN Tech yang monitor prod

### Success Metrics
| Metric | Target | Timeline |
|--------|--------|----------|
| Toko Shopee live terhubung | ≥10 | +8 minggu dari kickoff |
| Wizard pembukuan selesai | ≥60% user beta | +8 minggu |
| Email verifikasi delivered | ≥95% | +4 minggu |
| Sync order→dashboard p95 | <5 menit | +8 minggu |
| Incident P0 tanpa runbook | 0 (30 hari soft-launch) | post-launch |

---

## 2. Problem Statement

### Problem 1: Prod live tapi data masih mock-heavy
Seller beta connect Shopee mock atau sync tidak reliable → dashboard tidak mencerminkan toko nyata → kepercayaan rendah.

### Problem 2: Akun tidak terverifikasi di prod
Tanpa SMTP, verifikasi email di-skip atau manual → risiko akun spam dan reset password tidak jalan.

### Problem 3: Pembukuan intimidating
Seller baru melihat CoA kosong tanpa panduan → tidak apply template, tidak aktifkan auto-journal → fitur bonus tidak terpakai.

### Problem 4: Tier pricing hanya di dokumen
Free tier seharusnya tidak akses journal unlimited; tanpa enforcement, tidak ada upgrade path.

### Problem 5: Blind spots operasional
Tim tidak tahu sync gagal, webhook miss, atau API 5xx spike sampai user komplain.

---

## 3. Product Scope

### 3.1 In Scope

#### 3.1.1 Shopee Live Integration
- Partner credentials prod (`SHOPEE_PARTNER_ID`, `SHOPEE_PARTNER_KEY`, redirect URL prod)
- OAuth callback prod + state validation
- Webhook registration: order status, payment confirmed
- HMAC signature verification webhook
- Background token refresh sebelum expiry
- Idempotent sync (dedupe by Shopee order/payment ID)
- Mock mode tetap untuk dev/demo (`partner_id` kosong)

#### 3.1.2 Email (SMTP)
- Verifikasi email wajib di `NODE_ENV=production`
- Template: verifikasi, reset password (jika belum ada), notifikasi settlement mismatch (opsional P1)
- SPF/DKIM documented di DEPLOY-VPS.md

#### 3.1.3 Onboarding Pembukuan
- Deteksi shop tanpa CoA → wizard 3 langkah:
  1. Apply SAK EMKM template
  2. Toggle auto-journal + penjelasan singkat seller
  3. Backfill dari payment history (jika ada)
- Empty state dashboard: CTA ke wizard jika pembukuan belum setup
- Skip / lanjut nanti (jangan block dashboard v1)

#### 3.1.4 Tier Enforcement
| Tier | Pembukuan | Limit |
|------|-----------|-------|
| Free | ❌ | Dashboard only |
| Starter | ✅ | 50 entri/bulan |
| Pro | ✅ | Unlimited |
| Enterprise | ✅ | Unlimited + approval + audit export |

- API return 403 + code `TIER_LIMIT` / `TIER_REQUIRED`
- UI: banner upsell + link pricing (placeholder OK)

#### 3.1.5 Observability
- Structured JSON log (request_id, shop_id, user_id where applicable)
- Extended health: DB ping, optional Redis ping
- Error rate alert hook (Slack webhook env atau email ops)
- Runbook: sync stuck, webhook replay, token expired

#### 3.1.6 Beta Program
- Invite list + flag `beta_cohort` di user/shop (opsional)
- Checklist UAT seller (connect, sync, 1 entri manual, lihat P&L)
- Feedback form link atau in-app (Google Form OK)

#### 3.1.7 Redis Queue (P1)
- Aktifkan Bull worker saat `REDIS_HOST` set
- Jobs: Shopee sync batch, report PDF async, auto-journal backfill besar
- Fallback inline tetap jika Redis down

### 3.2 Out of Scope (v2.2+)
- Cash Flow Statement, COGS automation, accounting software sync, e-Faktur XML
- Tokopedia / multi-marketplace
- Mobile app
- Redesign UI dasar
- Payment gateway / billing otomatis (tier manual OK untuk beta)

---

## 4. User Stories (Ringkas)

### Epic A — Shopee Live
- **US-A1:** Sebagai seller, saya connect toko Shopee prod via OAuth agar order masuk otomatis.
- **US-A2:** Sebagai sistem, webhook payment confirmed memicu auto-journal jika enabled.
- **US-A3:** Sebagai ops, saya lihat log sync gagal dengan shop_id dan error Shopee.

### Epic B — Email
- **US-B1:** Sebagai user baru prod, saya terima email verifikasi dan tidak bisa login penuh sebelum verify.
- **US-B2:** Sebagai ops, SMTP failure tidak crash register — queue retry + log.

### Epic C — Onboarding
- **US-C1:** Sebagai seller baru, wizard membantu apply CoA dalam <3 menit.
- **US-C2:** Sebagai seller, saya bisa skip wizard dan pakai dashboard tanpa pembukuan.

### Epic D — Tier
- **US-D1:** Sebagai free user, POST journal ditolak dengan pesan jelas.
- **US-D2:** Se sebagai starter, saya lihat sisa kuota entri bulan ini.

### Epic E — Observability
- **US-E1:** Sebagai ops, `/auth/health` menunjukkan DB (+ Redis) status.
- **US-E2:** Sebagai ops, spike 5xx memicu alert configurable.

---

## 5. Non-Functional Requirements

| NFR | Target |
|-----|--------|
| API availability | 99.5% bulan soft-launch |
| Sync latency p95 | <5 menit webhook → dashboard |
| Email delivery | ≥95% within 5 menit |
| Webhook processing | <30 detik p95 |
| Backward compat | Mock Shopee + seed demo unchanged |
| Security | Webhook HMAC, CORS prod only, secrets not in logs |
| Data retention | Sama v2.0 — audit 7 tahun |

---

## 6. Release Plan

| Phase | Durasi | Deliverable |
|-------|--------|-------------|
| **Phase 1** | 2 minggu | Shopee live OAuth + webhook + token refresh |
| **Phase 2** | 1 minggu | SMTP prod + verifikasi wajib |
| **Phase 3** | 2 minggu | Onboarding wizard + tier enforcement |
| **Phase 4** | 1 minggu | Observability + runbook + beta kickoff |
| **Phase 5** | 2 minggu | Beta UAT 10–50 seller + fixes |

---

## 7. Dependencies & Risks

| Risk | Mitigation |
|------|------------|
| Shopee partner approval lambat | Parallel: mock UAT internal + sandbox keys |
| Webhook miss | Manual sync button + replay log |
| SMTP spam folder | SPF/DKIM/DMARC doc + provider reputable |
| Tier breaks demo | Seed users tagged Enterprise atau bypass flag dev |
| VPS overload | Redis queue + rate limit sync |

---

## 8. Acceptance Criteria (Overall)

- [ ] ≥1 toko Shopee sandbox/live sync order end-to-end di staging
- [ ] Webhook HMAC reject invalid signature
- [ ] Email verifikasi terkirim di prod config
- [ ] Wizard CoA selesai → CoA 45 akun + auto-journal setting tersimpan
- [ ] Free user blocked dari create journal (403)
- [ ] Health endpoint reports DB status
- [ ] Mock mode dev unchanged (`npm run seed` + login demo)
- [ ] DEPLOY-VPS.md + STATUS.md updated
- [ ] Beta checklist documented

---

## 9. Glossary

| Term | Definition |
|------|------------|
| **Live Shopee** | Open API dengan partner credentials resmi |
| **Mock Shopee** | OAuth simulated untuk dev/demo |
| **Wizard pembukuan** | First-time setup CoA + auto-journal |
| **Tier enforcement** | API-level feature gating by subscription tier |
| **Soft-launch** | Prod terbuka untuk beta cohort terbatas |

---

## 10. References

- [`docs/NEXT-PRD-BRIEF.md`](../docs/NEXT-PRD-BRIEF.md)
- [`docs/docs.md`](../docs/docs.md)
- [`docs/DEPLOY-VPS.md`](../docs/DEPLOY-VPS.md)
- [`dnShop_Finance_v2.0_PRD.md`](./dnShop_Finance_v2.0_PRD.md) — Phase 3 → v2.2

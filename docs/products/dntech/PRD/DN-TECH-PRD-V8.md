# DN Tech — PRD V8
## Go-Live & Production Hardening

**Date:** Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Version:** V8 (Based on V8 Foundation assessment)  
**Status:** 📋 Requirements definition for implementation  
**Reference:** [V8 Foundation](./DN-TECH-PRD-V8-FOUNDATION.md)

---

## 1. Executive Summary

**Situasi:** Codebase V1–V7 sudah feature-complete (marketing site dengan CMS, email, produk). Tapi **operasionalnya belum full production-ready** — DB schema production belum di-push, dnPeople belum di-seed production, SMTP belum verified end-to-end, QA baseline belum tercatat.

**Visi V8:** Ubah dntech.id dari "feature-complete" menjadi **"production-ready + measurable + operable"** dengan prioritas:

1. **Track A (P0 — Week 1):** Go-live operations (DB, seed, SMTP, QA, env validation)
2. **Track B (Should — Week 2):** Engineering maturity (CI/CD, auth fixes, monitoring)
3. **Track C (Could — Week 3-4):** Product platform (media upload, guided editor, conversion widgets)

**Non-goal:** Rewrite stack, dark mode, page builder, multi-tenant. V8 = hardening existing V1-V7, bukan greenfield.

---

## 2. Track A: Go-Live & Operations (P0 — Week 1)

### A1. Database Schema Production Push

**Problem:** 
- `prisma/schema.prisma` di `main` punya models baru (Product V6, EmailLog V5), tapi production DB belum di-push.
- Hasil: `/products`, `/admin/products`, email logs bisa fail atau data tidak persist.

**Requirement:**

| FR | Description | Acceptance Criteria |
|----|-------------|---------------------|
| A1-1 | DB migration untuk schema latest harus berjalan di production tanpa error | `prisma db push --skip-generate` berhasil, backup before/after tercatat |
| A1-2 | Semua table (User, Product, EmailLog, NewsletterSubscriber, FormSubmission, FAQ, Team, Testimonial, Setting, BlogPost, Portfolio, Career, etc.) harus exist dan indexing jelas | `SELECT * FROM information_schema.tables WHERE table_schema='public'` menunjukkan 15+ tables |
| A1-3 | Jika ada data di production DB legacy, harus backup terlebih dahulu | Backup file tersimpan dengan timestamp: `dntech-backup-2026-07-25.sql.gz` |
| A1-4 | Tidak ada broken foreign keys setelah push | `PRAGMA foreign_key_check()` kosong (jika SQLite) atau equivalent PostgreSQL |

**Tech detail:**

```bash
# Staging dry-run
cd backend
export DATABASE_URL="postgresql://user:pass@staging-db/dntech"
npx prisma migrate deploy  # atau db push
npx prisma db seed

# Production (gated behind approval)
export DATABASE_URL="postgresql://user:pass@prod-db/dntech"
npx prisma db push --skip-generate
npx prisma db execute --stdin < verify-indexes.sql
```

---

### A2. Seed dnPeople Production

**Problem:** dnPeople product baru di V7, seed script ada tapi belum di production. Hasil: `/products/dnpeople` kosong atau incomplete di live.

**Requirement:**

| FR | Description | Acceptance Criteria |
|----|-------------|---------------------|
| A2-1 | Script `seed-dnpeople-product.ts` harus reproducible dan idempotent | Jalankan 2x, product tidak duplikat; hanya 1 record dengan slug `dnpeople` |
| A2-2 | Semua section dnPeople V7 harus ter-seed (pricing tiers, features, integrations, use cases, testimonials, roadmap, comparison, CTA) | `SELECT * FROM "Product" WHERE slug='dnpeople'` menunjukkan complete JSON di semua field |
| A2-3 | dnPeople harus published & featured di production | `published=true, featured=true, status='launched'` |
| A2-4 | Halaman `/products/dnpeople` harus render penuh tanpa error SSR | Akses `/products/dnpeople` di browser → semua section visible, no 500 errors di console |

**Tech detail:**

```bash
# Run seed
npm run db:seed-dnpeople

# Verify in production
curl https://api.dntech.id/products/dnpeople -H "Accept: application/json" | jq '.data | keys'
# Expected keys: name, slug, pricingTiers, features, integrations, useCases, testimonials, roadmap, etc.
```

---

### A3. SMTP End-to-End Verification

**Problem:** SMTP configured tapi tidak fully verified production — form leads bisa tidak sampai inbox.

**Requirement:**

| FR | Description | Acceptance Criteria |
|----|-------------|---------------------|
| A3-1 | Koneksi SMTP ke mailspace production harus berhasil dengan TLS/SSL | Buka terminal: `nc -zv mx8.mailspace.id 465` → "succeeded" atau telnet test berhasil |
| A3-2 | Email test dari contact form harus sampai ke admin inbox (info@dntech.id) | Kirim test contact form → email masuk dalam 2 menit ke info@dntech.id |
| A3-3 | Email log entry harus dibuat dengan status `sent` | Database query: `SELECT * FROM "EmailLog" WHERE email='test@example.com' ORDER BY createdAt DESC LIMIT 1` → status='sent' |
| A3-4 | Newsletter double-opt-in email harus terkirim dengan activation link | Daftar newsletter di homepage → email masuk dengan link aktivasi → klik link → subscriber activated |
| A3-5 | SPF/DKIM/DMARC check harus pass atau documented (jika belum setup DNS) | MXToolbox atau mail-tester.com check → minimal SPF configured |

**Manual test checklist:**

```
[ ] Contact form submit → admin email received (to: info@dntech.id)
[ ] Newsletter signup → opt-in email received → click link → verified
[ ] Career form submit → admin email + confirmation to applicant
[ ] Quiz submit → email with results
[ ] Email log entry created per form (status: sent/failed/skipped)
[ ] No emails di spam (test dengan Gmail/Outlook)
```

---

### A4. QA Checklist & Lighthouse

**Problem:** Lighthouse, a11y, smoke tests tidak ter-record baseline V8.

**Requirement:**

| FR | Description | Acceptance Criteria |
|----|-------------|---------------------|
| A4-1 | Lighthouse mobile score homepage harus ≥ 75 (baseline dicatat post-V8.0) | Run: `npx lighthouse https://dntech.id --output-path=./lh-v8.0.html` → Performance + Accessibility + Best Practices ≥ 75 |
| A4-2 | WCAG form accessibility regression test harus pass | Form navigation: tab → all inputs reachable; labels present; error states clear |
| A4-3 | Critical user journeys harus tested & documented | Checklist: (1) Homepage load (2) Contact form (3) Try free dnPeople (4) View pricing (5) Navigate product pages |
| A4-4 | Mobile responsiveness test harus pass (320px, 640px, 1024px, 1440px) | Check di browser DevTools: no layout shift, buttons tappable (48px+), readable fonts |
| A4-5 | Build size (frontend + backend) harus acceptable | Frontend: `npm run build` → `.next` size < 500MB; backend: `npm run build` → dist size < 100MB |

**Test matrix:**

```
Device | Homepage | Contact | Product Page | Admin | Status
-------|----------|---------|--------------|-------|--------
Phone  | ✓        | ✓       | ✓            | ✓     | Must
Tablet | ✓        | ✓       | ✓            | ✓     | Must
Desktop| ✓        | ✓       | ✓            | ✓     | Must
```

---

### A5. Environment Variable Validation

**Problem:** `NEXT_PUBLIC_API_URL` salah → SSR kosong → `/products` render nothing.

**Requirement:**

| FR | Description | Acceptance Criteria |
|----|-------------|---------------------|
| A5-1 | Build-time harus validate `.env.production` length & format | Check: `NEXT_PUBLIC_API_URL`, `DATABASE_URL`, `SMTP_*`, `JWT_SECRET` semua ada |
| A5-2 | Fallback resolver di production harus bekerja jika API down | Homepage masih render (dengan cached data atau minimal UI), tidak full blank |
| A5-3 | Build script harus fail jika env var critical missing | `npm run build` → "ERROR: NEXT_PUBLIC_API_URL is required" dan exit 1 |

**Pre-flight check:**

```bash
# Validate env
cat .env.production | grep "NEXT_PUBLIC_API_URL\|DATABASE_URL\|SMTP"

# Test build
NEXT_PUBLIC_API_URL=https://api.dntech.id npm run build

# Verify build output
ls -la .next/
```

---

### A6. Admin Password Change (Security)

**Problem:** Default seed login (admin@dntech.id / Admin@123456) belum diganti.

**Requirement:**

| FR | Description | Acceptance Criteria |
|----|-------------|---------------------|
| A6-1 | Admin default password harus diganti dengan strong password | Login with old credential → "Invalid" OR account disabled; new password set |
| A6-2 | Password policy enforcement | Min 12 char, uppercase, number, special char; no dictionary words |
| A6-3 | Optional: 2FA untuk admin | Backup codes provided & stored securely |

**One-time action:**

```
1. Deploy code
2. Login dengan admin@dntech.id / Admin@123456 (last time)
3. Change password ke random strong (e.g., `openssl rand -base64 32`)
4. Document di 1Password / KeePass (secure vault)
5. Disable or delete old password reset links
```

---

## 3. Track B: Engineering Maturity (Should — Week 2)

### B1. GitHub Actions CI

**Problem:** Tidak ada CI — risiko regressions di `main`.

**Requirement:**

| FR | Description | Acceptance Criteria |
|----|-------------|---------------------|
| B1-1 | CI pipeline harus run on push/PR ke `main` | `.github/workflows/ci.yml` exists; triggers on pull_request + push |
| B1-2 | Lint, build, test harus pass sebelum merge | PR tidak merge jika: `npm run lint` error atau `npm run build` error |
| B1-3 | Codebase harus 0 lint warnings | `eslint src/` dan `npx next lint` harus clean |

**Example workflow:**

```yaml
name: CI
on: [push, pull_request]
jobs:
  lint-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
```

---

### B2. Auth Fixes: JWT Refresh & Forgot Password

**Problem:** Refresh token tidak implementasi; forgot password hanya console.log.

**Requirement:**

| FR | Description | Acceptance Criteria |
|----|-------------|---------------------|
| B2-1 | JWT refresh endpoint harus implemented | `POST /auth/refresh` → returns new access token; old token expires in 15 min; refresh lasts 7 days |
| B2-2 | Forgot password email harus terkirim | Submit forgot password form → email dengan reset link → click link → password reset form → login dengan new password |
| B2-3 | Reset token harus expire dalam 1 jam | Token valid 3600 detik; setelah itu "link expired" |

---

### B3. Monitoring & Health Endpoint

**Problem:** Tidak ada formal monitoring.

**Requirement:**

| FR | Description | Acceptance Criteria |
|----|-------------|---------------------|
| B3-1 | Health endpoint `/health` harus accessible | `GET /health` → 200 + `{status: "ok", uptime: ...}` |
| B3-2 | Optional: Sentry untuk error logging | Production errors tercatat di Sentry dashboard |

---

## 4. Track C: Product Platform (Could — Week 3-4)

### C1. Product Media Upload

**Problem:** Product image hanya text URL (manual). Harus via media library.

**Requirement:**

| FR | Description | Acceptance Criteria |
|----|-------------|---------------------|
| C1-1 | Admin product editor harus bisa upload hero image, logo, screenshots | Drag-drop atau file picker → images stored at `/uploads/products/[id]/` → URL auto-filled |
| C1-2 | Media library harus shared antara blog, portfolio, product | Admin `/admin/media` → browse semua uploads, organize by folder |

---

### C2. Guided Product Editor (Bukan JSON Raw)

**Problem:** Product JSON textarea sulit untuk non-tech (marketing team). FR-C1 butuh minimal guided form.

**Requirement:**

| FR | Description | Acceptance Criteria |
|----|-------------|---------------------|
| C2-1 | Minimal form builder untuk pricing tiers | Drag-drop atau form builder: add tier, set name + price + features → auto-generate JSON |
| C2-2 | FAQ section harus guided form (tidak raw JSON) | Add Q → Add A → save → renders di accordion |

---

### C3. Mount Conversion Widgets

**Problem:** `ROICalculator`, `BookDemoSection` di codebase, tapi tidak dipasang di halaman relevant.

**Requirement:**

| FR | Description | Acceptance Criteria |
|----|-------------|---------------------|
| C3-1 | ROI Calculator harus mounted di `/products/dnpeople` section | Kalkulasi: employee count → estimated cost Talenta → estimated cost dnPeople → savings shown |
| C3-2 | Book demo section harus di halaman produk | "Schedule 15-min demo" → Calendly modal |

---

### C4. Multi-product Playbook

**Problem:** dnPeople saja di V8. Butuh template untuk DOVA / ERP / produk ke-2.

**Requirement:**

| FR | Description | Acceptance Criteria |
|----|-------------|---------------------|
| C4-1 | Dokumentasi untuk seed produk ke-2 | Panduan: create script, seed data, test page render |
| C4-2 | Min 2 produk published di `/products` | dnPeople + minimal 1 produk lain (DOVA atau dummy product) |

---

## 5. User Stories (Track A Priority)

### Epic A: Go-Live Preparation

**US-A1:** As Dozer (ops), I want to push database schema ke production sehingga `/products` dan email logs bekerja di live.

- AC: DB push successful, no broken migrations, backup tersimpan.

**US-A2:** As marketing team, I want dnPeople product ter-seed production sehingga `/products/dnpeople` fully populated dengan pricing, features, testimonials.

- AC: Product page renders semua section; no 500 errors.

**US-A3:** As lead, I want contact form lead masuk ke admin email dalam 2 menit, sehingga Dozer bisa respond cepat.

- AC: SMTP verified, email logs show `sent` status, 100% delivery dalam test + production.

**US-A4:** As Dozer, I want QA baseline tercatat (Lighthouse, mobile responsiveness) sehingga kita punya metrics untuk V8.1+.

- AC: Lighthouse score captured, checklist documented.

**US-A5:** As engineer, I want environment variables validated saat build, sehingga production API URL salah ditangkap pre-deploy.

- AC: Build fails if env vars missing; production `/products` tidak blank jika API temporarily down.

---

## 6. Success Metrics (KPI V8)

| Metrik | Baseline | Target V8 |
|--------|----------|-----------|
| **Lighthouse mobile** (homepage) | N/A (belum tercatat) | ≥ 75 |
| **Lead → email** (success rate) | 0% (belum verified live) | 100% dalam 2 menit |
| **`/products/dnpeople` completeness** | Empty | Semua section V7 ter-render |
| **Time-to-publish produk baru** | ~2h (JSON manual) | < 45 min (guided form) — *V8.2* |
| **CI pass rate** | N/A | 100% |
| **Uptime (post-V8)** | Unknown | ≥ 99.5% first month |

---

## 7. Timeline & Effort

| Track | Duration | Owner | Effort |
|-------|----------|-------|--------|
| **A** (Go-live ops) | **5 days** | Backend + DevOps | ~40 hours |
| **B** (Engineering maturity) | **3-4 days** | Backend + DevOps | ~30 hours |
| **C** (Product platform) | **5-7 days** | Frontend + Backend | ~50 hours |
| **Total** | **2-3 weeks** | Full team | **~120 hours** |

**Quick win (48h):** A1 + A2 + A3 + A6 → dnPeople live + email works.

---

## 8. Acceptance & Sign-Off

| Role | Review | Status |
|------|--------|--------|
| Dozer (CEO) | PRD scope + timeline | Pending |
| Engineering Lead (Backend) | Track A technical feasibility | Pending |
| Engineering Lead (Frontend) | Track C scope | Pending |

---

**Version:** V8 (PRD)  
**Owner:** Dozer  
**Date:** Juli 2026  
**Next:** SDD V8 + SRS V8 detailed specs

# DN Tech Compro — Security Review & Secret Scan

> **Status:** Active · **Last updated:** 2026-09-26 · **Author:** Dozer

## Summary

Internal assessment untuk repo **`dntech`** (Next.js + Express + Prisma): review keamanan aplikasi (OWASP-oriented), QA test health, dan **secret scan Git tanpa Docker/install tool eksternal**. Tidak ada bukti kredensial produksi (AWS/GitHub/OpenAI private key, JWT prod, dll.) di **tracked files** atau pola history yang umum. Temuan utama: **desain revalidate secret di client**, dependency **nodemailer** (high CVE), password **dev/CI** yang sengaja di-commit di example/CI (acceptable dengan konteks), serta gap test RBAC.

**Repo HEAD saat review:** `641c90a` · **Backend tests:** 124/124 (`npm test --ci` di `backend/`, 2026-09-26).

---

## Scope

| In scope | Out of scope |
|----------|----------------|
| Kode & config di `dreamcraft17/dntech` | Pentest black-box prod tanpa ROE tertulis |
| Git history (pickaxe / `git grep` rev-list) | TruffleHog / Gitleaks (tidak dijalankan — no install) |
| Header HTTP sample `https://www.dntech.id` | Scan VPS / `.env` lokal (file di-ignore git) |

**Otorisasi:** assessment internal DN Tech (Product Engineering).

---

## Metodologi secret scan (Git, tanpa install)

1. **`git ls-files`** — 402 file tracked; `.env`, `backend/.env`, `backend/.env.vps`, `frontend/.env.local` **tidak tracked** (`git check-ignore` OK).
2. **Ripgrep** pada working tree (exclude `node_modules`) — pola AWS `AKIA…`, GitHub `ghp_` / `github_pat_`, OpenAI `sk-…`, Slack `xox…`, PEM private key, JWT compact — **no match**.
3. **`git log --all -S"<pattern>"`** — pickaxe untuk `AKIA`, `ghp_`, `PRIVATE KEY`, `JWT_SECRET=`, `GEMINI_API_KEY=`, `SENTRY_AUTH_TOKEN`, `DATABASE_URL=postgresql` — hanya commit **docs / example / feature wiring**, bukan leak key prod.
4. **`git grep` across all commits** untuk `dntech123` — hanya **`.env.example`**, **`docker-compose.yml`**, **`.github/workflows/ci.yml`**, **`backend/.env.example`** (password dev/CI throwaway).

**Limitasi:** scan manual tidak setara Gitleaks ruleset penuh; entropy-only secrets atau format custom bisa terlewat. Rekomendasi gate CI: `gitleaks` di GitHub Actions (runner hosted, tanpa install lokal).

---

## Hasil secret scan

| Kategori | Hasil | Catatan |
|----------|--------|---------|
| AWS access keys | ✅ Tidak ditemukan | History & tree |
| GitHub PAT | ✅ Tidak ditemukan | |
| OpenAI / Anthropic API keys | ✅ Tidak ditemukan di tree | History menyebut `GEMINI_API_KEY` hanya di commit fitur + test `test-key` |
| Private keys (PEM) | ✅ Tidak ditemukan | Tidak ada `.pem`/`.key` tracked |
| File `.env` produksi | ✅ Tidak pernah di-commit | Ada salinan **lokal** di workspace — jangan commit; rotate jika pernah ter-push di masa lalu (history pickaxe: **no** `.env` added) |
| Placeholder / dev credentials | ⚠️ Expected | Lihat tabel di bawah |

### Placeholder & dev credentials (bukan rotasi darurat)

| Lokasi | Isi | Risk |
|--------|-----|------|
| `.env.example`, `backend/.env.example` | `JWT_SECRET` placeholder, `dntech123` Postgres | Low — dokumentasi; prod wajib ganti (`validate-env`) |
| `docker-compose.yml` | Default `POSTGRES_PASSWORD` `dntech123` | Low — local only |
| `.github/workflows/ci.yml` | Postgres service `dntech123`, JWT `ci-test-secret` | Low — ephemeral CI DB |
| `backend/src/utils/adminPassword.ts` | `LOCAL_DEV_ADMIN_PASSWORD` constant | Low — dev bootstrap; prod pakai `ADMIN_PASSWORD` env |
| Test files | `Valid#123`, `test-key`, dll. | None — test only |

**Action:** pastikan VPS/prod **tidak** memakai `dntech123` atau default JWT example (sudah di-gate `validate:env` di backend; frontend `validate:env` on build).

---

## Temuan keamanan aplikasi (prioritas)

| ID | Severity | Area | Finding | Remediation |
|----|----------|------|---------|-------------|
| DNTECH-SEC-01 | **High** | Frontend | `NEXT_PUBLIC_REVALIDATE_SECRET` dipakai admin client; secret bisa terekspos di bundle | Server-only `REVALIDATE_SECRET`; Server Action atau proxy backend |
| DNTECH-SEC-02 | **High** | Backend deps | `npm audit`: **nodemailer** ≤9.1.0 — multiple **high** CVE | Upgrade nodemailer; smoke SMTP |
| DNTECH-SEC-03 | Medium | Auth | Login response masih kirim `access_token` / `refresh_token` JSON (legacy) | Deprecate; httpOnly-only path |
| DNTECH-SEC-04 | Medium | CSP | `unsafe-inline` script/style (Crisp, GA) | Nonce CSP bertahap; jaga sanitasi CMS |
| DNTECH-SEC-05 | Low | Revalidate API | Body `paths[]` arbitrer jika secret bocor | Allowlist path + max count |
| DNTECH-SEC-06 | Low | Static uploads | `/uploads` publik; PDF allowed di multer | Policy PDF atau auth |
| DNTECH-SEC-07 | Info | `/health` | Expose `environment` | Redact prod |

### Kontrol yang sudah ada (positif)

- Helmet, CORS allowlist + credentials, rate limit global + login/forms/chat/newsletter.
- JWT fail-closed di production jika secret missing; cookie `httpOnly` + `secure` (prod).
- Blog/legal: `sanitizeHtml` sebelum `dangerouslySetInnerHTML`.
- Chatbot: isolation `conversationId` / `visitorId` (no history leak).
- Prod headers (sample 2026-09-26): HSTS, CSP, X-Frame-Options, nosniff.

---

## QA & test (ringkas)

| Check | Hasil |
|-------|--------|
| Backend `npm test --ci` | **124/124** pass |
| Frontend unit (mesin review) | Gagal `Cannot find module 'jsdom'` — env/devDep; CI expected `npm ci` |
| Integration auth | `authenticate` **di-mock** SuperAdmin — gap test 403 RBAC nyata |
| E2E Playwright | Smoke UI contact; tidak cover admin auth |
| Secret scan | Manual Git (section above) |

**Fingerprint triage (env):** `MODULE_NOT_FOUND|jsdom|jest-environment-jsdom` → category **environment**; fix: tambah `jsdom` ke `devDependencies` sel selaras `overrides`.

---

## Rekomendasi tindak lanjut

| Priority | Item |
|----------|------|
| P0 | DNTECH-SEC-01 revalidate secret off client |
| P0 | DNTECH-SEC-02 nodemailer upgrade |
| P1 | Integration test admin + real `authenticate` (Viewer → 403) |
| P1 | CI gate: Gitleaks on push (GitHub Action, no local install) |
| P2 | Deprecate JWT in login JSON body |
| P2 | Unit test `app/api/revalidate/route.ts` |

---

## Verifikasi ulang (perintah, no install)

```bash
cd dntech

# Tracked env files (expect empty)
git ls-files '.env' 'backend/.env' '**/.env.vps'

# Pickaxe sample
git log --all -oneline -S'ghp_' | head
git log --all -oneline -S'AKIA' | head

# Backend tests
cd backend && npm test -- --ci
```

---

## Referensi

- Bug register: [BUG_FIXES.md](./BUG_FIXES.md)
- Testing: [TESTING.md](./TESTING.md)
- Deploy / env: [DEPLOYMENT-PRODUCTION.md](./DEPLOYMENT-PRODUCTION.md)
- Repo pointer: [dntech/DOCS.md](https://github.com/dreamcraft17/dntech/blob/main/DOCS.md)

---

*Dokumen ini tidak menggantikan pentest eksternal bersertifikat. Update setelah fix P0 atau rilis major.*

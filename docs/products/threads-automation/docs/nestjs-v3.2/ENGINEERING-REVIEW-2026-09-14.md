# Threads Automation — Review Teknis Enam Sudut Pandang (2026-09-14)

> **Status:** Open · **Terakhir diperbarui:** 2026-09-14 · **Author:** Dozer

## Ringkasan

Laporan ini merangkum enam review independen atas project `threads-automation` (backend NestJS + Prisma + Bull, frontend Next.js 14 App Router, integrasi static-token dengan Threads Graph API): review backend, review frontend, review integrasi full-stack, pengecekan kelengkapan product/PRD terhadap `THREADS_AUTOMATION_PRD_v3.1.md`, penilaian keamanan AI/LLM, dan review kualitas test (QA). Temuan berdasarkan inspeksi langsung ke `apps/backend/src` dan `apps/frontend/src`, skema Prisma, suite Jest yang ada (10 suite / 29 test, dijalankan sekali dan hijau semua), serta feature set yang sudah dikunci di PRD v3.1.

**3 hal yang perlu dikerjakan lebih dulu:**

1. **Tutup celah prompt-injection / tidak ada validasi output** (§5, AI Security) — string `topic` yang direkayasa saat ini bisa lolos dari generation, approval manusia, sampai publish scheduler langsung ke akun Threads publik `@dntech` tanpa ada pengecekan content-policy di sisi output. Ini satu-satunya temuan dengan blast radius nyata dan langsung berdampak.
2. **Perbaiki bug kontrak schedule-timezone** (§2 Frontend, §3 Fullstack) — frontend tidak pernah mengirim `scheduleTimezone`, jadi kalau Dozer mengetik jam lokal di scheduler `/approval`, jam itu diam-diam diinterpretasikan sebagai UTC.
3. **Wajibkan `THREADS_TOKEN_SOURCE=aws` di production** (§1 Backend) — static token Threads saat ini defaultnya tersimpan sebagai plaintext di `.env`/process env kecuali seseorang secara eksplisit mengaktifkan AWS Secrets Manager, bertentangan dengan model keamanan yang tertulis di dokumen arsitektur.

---

## Daftar Isi

1. [Review Senior Backend](#1-review-senior-backend)
2. [Review Senior Frontend](#2-review-senior-frontend)
3. [Review Senior Fullstack](#3-review-senior-fullstack)
4. [Pengecekan Kelengkapan Product/PRD](#4-pengecekan-kelengkapan-productprd)
5. [Penilaian Keamanan AI](#5-penilaian-keamanan-ai)
6. [Review Kualitas Test (AI QA)](#6-review-kualitas-test-ai-qa)
7. [Rencana Aksi Konsolidasi](#7-rencana-aksi-konsolidasi)

---

## 1. Review Senior Backend

Cakupan: `apps/backend/src` (NestJS 10, Prisma, Bull/Redis, integrasi static-token ke Threads API, fallback LLM Gemini/OpenAI).

### Critical

| # | Temuan | Lokasi |
|---|---|---|
| 1 | **Prompt injection / tidak ada validasi ulang output sebelum auto-publish.** `topic` dari user diselipkan apa adanya ke dalam prompt LLM, dan hasil parsing output LLM disimpan lalu dipublish ke akun `@dntech` yang sebenarnya, tanpa pengecekan ulang terhadap `forbidden_topics` atau filter kebijakan apa pun. | `generate/generate.service.ts`, `posts/posts.service.ts`, `common/prompt-builder.ts` |
| 2 | **Arsitektur static-token defaultnya menyimpan token sebagai plaintext di `.env`.** `THREADS_TOKEN_SOURCE` defaultnya `'env'`, jadi kecuali di-set eksplisit ke `'aws'`, token Threads yang berumur panjang itu duduk di `.env`/process env — bertentangan dengan requirement dokumen "AWS Secrets Manager, terenkripsi, teraudit". Tidak ada guard fail-closed yang memaksa `'aws'` ketika `NODE_ENV=production`. | `config/threads-config.service.ts` |

### High

| # | Temuan | Lokasi |
|---|---|---|
| 3 | Tidak ada proteksi brute-force di `/auth/login`. Satu akun internal bersama, hanya dibatasi throttle global 1000 req/menit — terlalu longgar untuk endpoint login (~16 percobaan/detik terhadap password statis, tanpa lockout). | `auth/auth.controller.ts`, `app.module.ts` (`ThrottlerModule`) |
| 4 | Race condition pada `publishFailureCount` di publish processor — pola read-then-write tidak atomik; retry Bull yang konkuren berpotensi menambah counter dua kali. Blast radius kecil karena ada dedup `jobId: post.id`, tapi sebaiknya pakai `increment` di level database. | `scheduling/publish.processor.ts` |
| 5 | `ThreadsAPIService.deleteContainer` menelan kegagalan cleanup secara diam-diam (hanya log warning) — tidak ada catatan kompensasi kalau cleanup gagal setelah publish parsial. | `threads-api/threads-api.service.ts` |

### Medium

| # | Temuan | Lokasi |
|---|---|---|
| 6 | `env.validation.ts` tidak melakukan cross-validation: `THREADS_TOKEN_SOURCE=aws` tidak mewajibkan `AWS_REGION`/`THREADS_SECRETS_NAME`, dan mode `env` tidak mewajibkan `THREADS_ACCESS_TOKEN` — kegagalan baru muncul saat runtime, bukan saat boot. | `config/env.validation.ts` |
| 7 | `CostsService`/`AnalyticsService` melakukan `findMany` full-table lalu reduce di JS, bukan agregasi di sisi database. Masih aman di volume sekarang, tidak akan scale sampai ribuan baris. | `costs/costs.service.ts`, `analytics/analytics.service.ts` |

**Catatan arsitektur:** ini sudah tepat diposisikan sebagai profil internal-tool, single-tenant, QPS rendah (satu akun bot, ≤10 post/batch, cron tiap 1 menit). Pilihan modular-monolith NestJS tidak perlu didesain ulang ke arah microservices/SLO.

---

## 2. Review Senior Frontend

Cakupan: `apps/frontend/src` (Next.js 14 App Router, React Query, Zustand, Tailwind).

### High

| # | Temuan | Lokasi |
|---|---|---|
| 1 | Tidak ada affordance focus/keyboard yang accessible di luar default browser — tidak ada ring `focus-visible` di mana pun. Warna border yang kontrasnya rendah (`#d9d0c1`) mungkin tidak memenuhi WCAG 2.2 AA untuk focus-visibility. | Semua elemen interaktif di `app/**` |
| 2 | **Bug kebenaran schedule-timezone.** Input schedule di `/approval` adalah `datetime-local` native tanpa menampilkan timezone ke user; frontend tidak pernah mengirim `scheduleTimezone`, dan backend defaultnya `'UTC'`. User yang mengetik jam lokal akan diam-diam dijadwalkan dalam UTC. | `app/approval/page.tsx` |
| 3 | Tidak ada pembedaan state loading/error di halaman Desk — `pending.data?.length === 0` bisa sekilas tampil sebagai "Nothing waiting" padahal query masih loading. | `app/page.tsx` |

### Medium

| # | Temuan | Lokasi |
|---|---|---|
| 4 | Tidak ada optimistic UI, toast, atau konfirmasi inline pada mutation approve/reject/schedule — mutation yang gagal tidak memberi feedback ke user kecuali di `/generate`. | `app/approval/page.tsx` |
| 5 | Tidak ada pagination/virtualization di `/approval` (`limit` tetap 50) — masih wajar untuk skala internal-tool saat ini. | `app/approval/page.tsx` |

**Catatan profil:** ini internal tool yang auth-walled; budget SEO dan LCP tidak relevan di sini, jadi tidak ada temuan terkait performance budget.

---

## 3. Review Senior Fullstack

Cakupan: kontrak end-to-end antara `apps/backend` dan `apps/frontend`.

### High

| # | Temuan |
|---|---|
| 1 | Bug timezone di atas adalah celah kontrak handoff full-stack: `ScheduleDto.scheduleTimezone` opsional tapi bermakna di sisi backend, sementara frontend tidak pernah mengisinya. Perbaikan: kirim timezone IANA dari browser (`Intl.DateTimeFormat().resolvedOptions().timeZone`) atau konversi eksplisit nilai `datetime-local` ke UTC sebelum `POST`. |
| 2 | Tidak ada kontrak tipe bersama antara DTO backend dan tipe fetch di frontend — frontend mendeklarasikan sendiri tipe `Post`/`Dashboard`/`CostSummary` yang harus disinkronkan manual. Tidak ada test kontrak OpenAPI/Zod yang menangkap drift kalau field backend berubah nama. |
| 3 | `CORS_ORIGINS` defaultnya `http://localhost:3100` tanpa nilai production yang terdokumentasi di `.env.example` — risiko deploy production ternyata masih mengarah ke localhost. |

**Catatan profil:** sesuai dengan profil internal-tool (≤5 engineer, auth-walled, DAU/QPS rendah) — tidak perlu perubahan stack.

---

## 4. Pengecekan Kelengkapan Product/PRD

Referensi: `docs/threads-auto/THREADS_AUTOMATION_PRD_v3.1.md`, feature set F1–F8.

| Fitur PRD | Status |
|---|---|
| F1 — Batch content generation (≤10 topik) | ✅ Terimplementasi (`generate.service.ts`) |
| F2 — Dukungan multi-provider LLM (Gemini/OpenAI/mock) | ✅ Terimplementasi (`LLMProviderManager` + circuit breaker) |
| F3 — Human approval gate (wajib) | ✅ Terimplementasi (approve/reject/edit/bulk-approve, kini dengan frontend) |
| F4 — Scheduling & publishing konten | ✅ Terimplementasi (cron + Bull queue + retry) |
| F5 — Rekomendasi waktu posting optimal | ✅ Terimplementasi (model heatmap, tampil di `/analytics`) |
| F6 — Manajemen brand guidelines | ✅ Terimplementasi (CRUD + versioning, tampil di `/guidelines`) |
| F7 — Cost tracking & optimasi | ✅ Terimplementasi (tampil di `/costs`) |
| F8 — Dashboard analitik performa | ✅ Terimplementasi (`/analytics`) |

Kedelapan fitur yang sudah dikunci ini semuanya terimplementasi end-to-end, dari backend sampai frontend — ini pengecekan kelengkapan atas scope yang sudah closed, bukan latihan re-prioritisasi.

**Gap yang ditemukan:** F3 ("Human Approval Gate — Wajib") menyiratkan bahwa konten tidak boleh sampai ke Threads tanpa keputusan manusia atas *teks final yang sebenarnya*. Namun saat ini tidak ada mekanisme yang memastikan `editedText` dari keputusan `edit` di-screening ulang terhadap `forbidden_topics` sebelum bisa dijadwalkan — approval gate hanya memverifikasi bahwa seorang manusia sudah klik sesuatu, bukan bahwa kontennya aman. Disarankan menambahkan ini ke acceptance criteria F3 pada revisi PRD berikutnya.

---

## 5. Penilaian Keamanan AI

Cakupan: `apps/backend/src/llm`, `apps/backend/src/generate`, `apps/backend/src/common/prompt-builder.ts`.

**Risiko terkonfirmasi: prompt injection tanpa mitigasi dengan blast radius publish nyata di dunia.**

- `buildPrompt()` menyelipkan `input.topic` — yang sepenuhnya dikendalikan user lewat `POST /posts/generate { topics: [...] }` — langsung ke teks instruksi LLM tanpa delimiter, tanpa escaping, dan tanpa filter injection-signature. Ini adalah permukaan **AML.T0051 direct prompt injection** yang klasik.
- `parseGeneratedContent()` hanya memberlakukan pemotongan 500 karakter dan parsing bentuk JSON. Fungsi ini **tidak** mengecek ulang output model terhadap `forbidden_topics`, hashtag whitelist, atau classifier content-policy apa pun. Guardrail hanya berupa teks prompt yang *meminta* model untuk patuh — persis anti-pattern yang dianggap tidak memadai oleh kelas review ini.
- Alur end-to-end: `generate` → `draft` → human `approve` (mereview teks bebas, bukan flag risiko terstruktur) → scheduler → **publish sungguhan ke akun Threads publik `@dntech`**. Tidak ada lapisan output-filtering antara LLM dan tahap publish — temuan yang bersinggungan dengan tool-abuse (bernuansa AML.T0051.002) meskipun tidak ada agent bertool secara literal, karena output LLM langsung menjadi artefak yang dipublikasikan.
- **Vektor penyalahgunaan biaya:** `GenerateDto.llmProvider` bisa dipilih user per request, dan `topics[]` menerima sampai 10 string bebas per panggilan. Siapa pun pemegang JWT yang valid (login internal bersama) bisa menge-spam batch untuk menaikkan pengeluaran Gemini/OpenAI. `alertCostThreshold` hanya memberi alert belakangan pada jam 6 pagi UTC — tidak memblokir generation lebih lanjut.

### Guardrail yang disarankan (urutan prioritas)

1. **Sisi input:** saring/tolak topik yang mengandung signature injection (regex untuk "abaikan instruksi sebelumnya", "system prompt", frasa role-override) sebelum sampai ke `buildPrompt`; berlakukan batas panjang topik maksimum.
2. **Sisi output (lapisan yang hilang):** setelah `parseGeneratedContent`, cek ulang `text`/`hashtags`/`cta` hasilnya terhadap `forbidden_topics` dan hashtag whitelist; tolak atau tandai secara jelas pelanggarannya di `/approval`, bukan mengandalkan reviewer manusia menangkapnya tanpa bantuan.
3. **Circuit breaker biaya harian:** blokir panggilan `generate` lebih lanjut begitu `COST_DAILY_LIMIT_USD` tercapai, bukan sekadar alert.

Mengingat blast radius yang nyata (akun brand publik, bukan sandbox), ini harus diperlakukan sebagai **P0/P1**, bukan nice-to-have untuk suatu saat nanti.

---

## 6. Review Kualitas Test (AI QA)

Cakupan: `apps/backend/src/**/*.spec.ts`.

**Kesehatan suite:** 10 suite / 29 test, semua hijau dalam satu kali run (belum diulang 3× untuk memeriksa flakiness — disarankan sebelum mengirim perbaikan keamanan di atas).

| Smell | Detail |
|---|---|
| **Coverage — Happy Path Only / Kasus Negatif Hilang** | `posts.service.spec.ts` tidak pernah menguji `reject()`, `bulkApprove()`, atau alur keputusan `edit` — tiga dari enam method publik `PostsService` tidak punya coverage sama sekali. |
| **Coverage gap yang terkait langsung dengan temuan §5** | Tidak ada test yang memastikan topik atau `editedText` yang mengandung konten terlarang ditolak/ditandai — karena logikanya memang belum ada. Mutant yang menghapus seluruh logika guideline-filtering akan lolos 100% dari suite yang ada sekarang. |
| **Kualitas diagnostik (temuan positif)** | Test yang sudah ada di `threads-api.service.spec.ts` dan `posts.service.spec.ts` bersih: assertion spesifik, tidak ada sleep-based wait, tidak ada order dependency, tidak ada over-mocking. Smell di sini adalah *ketiadaan* test, bukan kualitas test yang sudah ada. |
| **Testability (temuan positif)** | `PostsService`/`ThreadsAPIService` sudah memakai constructor injection terhadap interface yang cukup sempit — fondasi yang bagus untuk diperluas begitu logika guideline-filter ditambahkan. |

---

## 7. Rencana Aksi Konsolidasi

| # | Item | Severity | Sudut Pandang |
|---|---|---|---|
| 1 | Tambahkan pengecekan ulang content-policy di sisi output (forbidden topics + hashtag whitelist) setelah LLM generation, ditampilkan jelas di `/approval` | Critical | AI Security, Backend |
| 2 | Tambahkan filter signature prompt-injection di sisi input pada `topics[]` sebelum prompt dibangun | Critical | AI Security |
| 3 | Wajibkan `THREADS_TOKEN_SOURCE=aws` (atau pengecekan fail-closed yang setara) ketika `NODE_ENV=production` | Critical | Backend |
| 4 | Perbaiki handoff schedule-timezone: kirim timezone IANA atau konversi eksplisit ke UTC dari `/approval` | High | Frontend, Fullstack |
| 5 | Tambahkan circuit breaker biaya harian, bukan sekadar monitoring biaya berbasis alert | High | AI Security, Backend |
| 6 | Perketat rate limiting khusus di `/auth/login` (terpisah dari throttle global) | High | Backend |
| 7 | Tambahkan test untuk `PostsService.reject()`, `bulkApprove()`, dan alur keputusan `edit`, plus test untuk content-policy filter yang baru setelah dibangun | High | QA |
| 8 | Tambahkan style `focus-visible` di seluruh elemen interaktif | Medium | Frontend |
| 9 | Gunakan `increment` di level database untuk `publishFailureCount`, bukan pola read-then-write | Medium | Backend |
| 10 | Dokumentasikan nilai production `CORS_ORIGINS` yang wajib di `.env.example` | Medium | Fullstack |
| 11 | Cross-validate kombinasi env `THREADS_TOKEN_SOURCE` di `env.validation.ts` | Medium | Backend |
| 12 | Tambahkan acceptance criteria PRD di F3 yang mewajibkan content-policy re-screening pada teks yang diedit | Medium | Product |

Belum ada satu pun item di laporan ini yang diimplementasikan — ini murni artefak review. Lihat prioritas di atas sebelum memulai fix pass.

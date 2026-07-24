# Threads Automation

**Threads Automation** adalah aplikasi web internal untuk **membuat caption dengan AI, menjadwalkan, dan auto-publish** postingan ke akun **Meta Threads** — supaya content creator / social media manager tidak harus online di jam tayang.

| | |
|---|---|
| Owner | Dozer (CEO + Tech Lead) |
| Company | DN Tech (PT. Dozer Napitupulu Technology) |
| Package | `threads-automation` · folder `auto/` |
| Status | **v3.0** AI Content · v2.0 live publish & media · deploy native (tanpa Docker) |
| Spec | PRD **v3.0 AI** + v2.0 Live Publish & Media + v1.0 baseline |
| Docs | **[Cara pakai](./docs/USER-GUIDE.md)** · **[Cara kerja](./docs/HOW-IT-WORKS.md)** · [AI](./docs/AI-CONTENT.md) · [Deploy](./docs/DEPLOY.md) · [Index](./docs/00_INDEX.md) |
| UpdatedAt | 25 Juli 2026 |
| License | Private — internal use only |

---

## Apa yang diselesaikan?

| Masalah | Jawaban di app |
|---------|----------------|
| Buntu ide caption | AI generate sesuai brand voice (single / batch) |
| Posting manual berulang | Schedule caption + gambar + waktu/timezone |
| Plan konten mingguan | Bulk import CSV + batch generate |
| Takut gagal diam-diam | Retry 3x + list failed + notifikasi + publish history |
| Perlu pantau konsistensi | Dashboard scheduled / published / failed + stats + AI cost |

**Bukan:** HRIS, official Meta Ads tool, atau mobile app. Login memakai kredensial Threads user (disimpan terenkripsi).

---

## Fitur (v3.0)

- [x] Login Threads + enkripsi kredensial + JWT session
- [x] Single post scheduler + preview + **media attach** (max 4 gambar)
- [x] Bulk CSV import
- [x] Auto-publish (cron + Bull + Playwright) + media pipeline
- [x] **Live / dry-run toggle** (default OFF) + warning bar · [RUNBOOK](./docs/RUNBOOK.md)
- [x] **Publish history** + CSV export
- [x] **AI caption**: generate, batch, brand guidelines, best-time, cost tracking · [AI-CONTENT](./docs/AI-CONTENT.md)
- [x] Dashboard: upcoming, published, failed, timeline, queue
- [x] Retry otomatis & manual
- [x] In-app notifications · email Conditional (SendGrid)
- [x] Automated tests (`npm test -w backend`)

**Default lokal:** `PLAYWRIGHT_DRY_RUN=true`, live toggle OFF, `LLM_PROVIDER=mock` (aman tanpa publish nyata & tanpa biaya AI).

---

## Quick start

**Prasyarat:** Node.js 18+, **PostgreSQL 15+**, **Redis 7+** — native, **tanpa Docker**.

```bash
cd auto
npm install
cp .env.example .env   # sesuaikan DATABASE_URL & REDIS_URL
npm run db:migrate
npm run dev            # API :3000 · UI :5173
```

VPS / produksi: **[docs/DEPLOY.md](./docs/DEPLOY.md)** (systemd + Nginx).

---

## Stack (ringkas)

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 18, Vite, MUI, Redux Toolkit |
| Backend | Express, TypeScript |
| DB / Queue | PostgreSQL, Redis + Bull |
| Automation | Playwright → threads.net |
| AI | Claude · Codex · OpenRouter · Mock (pilih via `LLM_PROVIDER`) |

Arsitektur: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) · API: [docs/API.md](./docs/API.md).

---

## PRD berikutnya

v2.0 dan v3.0 sudah di repo. Kandidat berikutnya: **engagement signals nyata** (metrik performa untuk heatmap & rekomendasi AI). Baca **[docs/NEXT-PRD-BRIEF.md](./docs/NEXT-PRD-BRIEF.md)**.

---

## Dokumentasi

| Dokumen | Isi |
|---------|-----|
| [docs/USER-GUIDE.md](./docs/USER-GUIDE.md) | Cara pakai (login → generate → schedule → history → live) |
| [docs/AI-CONTENT.md](./docs/AI-CONTENT.md) | AI v3.0: generate / batch / brand / cost |
| [docs/HOW-IT-WORKS.md](./docs/HOW-IT-WORKS.md) | Cara kerja sistem |
| [docs/00_INDEX.md](./docs/00_INDEX.md) | Indeks semua docs |
| [docs/DEPLOY.md](./docs/DEPLOY.md) | Deploy VPS tanpa Docker |
| [docs/RUNBOOK.md](./docs/RUNBOOK.md) | Enable live publish |
| [docs/FEATURE-CATALOG.md](./docs/FEATURE-CATALOG.md) | Katalog fitur |
| [docs/PRD/](./docs/PRD/) | PRD · SRS · SDD (v1.0 → v3.0) |
| [THREADS_AUTOMATION_PRD.md](./THREADS_AUTOMATION_PRD.md) | Spec awal v1.0 (arsip) |

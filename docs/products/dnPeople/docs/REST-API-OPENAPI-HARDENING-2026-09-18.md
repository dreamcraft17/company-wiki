---
owner: Dozer
status: active
canonical: false
last_reviewed: 2026-09-18
review_cadence: annual
---

# REST API Hardening — OpenAPI Coverage 3% → ~100%

> **Author:** Dozer
> **Date:** 2026-09-18

## Summary

Backend dnPeople sudah punya fundamentals REST yang solid (resource naming rapi, response envelope konsisten, versioning `/api/v1`, modular monolith yang sehat), tapi dokumentasi OpenAPI-nya cuma cover 3% dari endpoint yang benar-benar ada, dan satu endpoint (`POST /tenants/search`) melanggar semantik REST. Pekerjaan ini menutup gap tersebut: OpenAPI spec sekarang di-generate otomatis dari schema Zod yang sama yang dipakai untuk validasi request — satu sumber kebenaran, coverage ~100%, tanpa mengubah logic aplikasi apa pun.

## Latar Belakang

Review menggunakan skill `api-design-reviewer` menemukan tiga masalah konkret:

1. **Coverage rendah** — `backend/src/openapi/openapi.json` (hand-written) hanya mendokumentasikan 14 dari ~489 endpoint asli (~3%). Spec seperti ini gampang basi karena tidak ada mekanisme yang memaksanya tetap sinkron dengan kode.
2. **Pelanggaran REST** — `POST /tenants/search` adalah operasi read/query yang dipaksa memakai method POST, padahal semantiknya seharusnya `GET`.
3. **Dua sumber kebenaran** — setiap route sudah punya validasi Zod (`z.object({...}).parse(req.body)`), tapi schema ini tidak pernah dipakai sebagai sumber dokumentasi. Validasi dan dokumentasi bisa divergen dari waktu ke waktu.

## Solusi

### Infrastruktur baru

Dipasang `@asteasolutions/zod-to-openapi@7.3.0` — versi ini dipilih secara sengaja karena kompatibel dengan `zod@^3.25` yang sudah dipakai project (versi terbaru library ini butuh zod v4, yang akan memaksa upgrade breaking yang tidak perlu).

| File | Peran |
|---|---|
| `backend/src/openapi/registry.ts` | Shared `OpenAPIRegistry` singleton — dipakai semua route file |
| `backend/src/openapi/envelopes.ts` | Helper `successEnvelope`, `paginatedEnvelope`, `errorEnvelope` — mirror response shape asli aplikasi (`successResponse`/`paginatedResponse`/`errorHandler`) |
| `backend/src/openapi/generate.ts` | Script generator: baca registry, build `openapi.json`, auto-generate `operationId` per endpoint |
| `backend/src/openapi/registerAllRoutes.ts` | Side-effect import semua 60 route file supaya `registerPath()` masing-masing ter-eksekusi |

Script baru di `package.json`: `npm run generate:openapi`.

### Pola anotasi per-route

Setiap endpoint di 61 file route dianotasi dengan pola yang sama:

1. Schema Zod inline yang tadinya anonim diberi nama + `.openapi('Name')`.
2. Schema yang sama itu dipakai baik untuk validasi (`.parse()`) maupun dokumentasi (`registry.registerPath()`) — tidak ada duplikasi.
3. Tidak ada logic handler yang diubah — murni penambahan tipe/dokumentasi.

### Perbaikan REST

- Ditambahkan `GET /tenants/search?q=...` yang benar secara semantik.
- `POST /tenants/search` versi lama **tetap hidup** (ditandai `deprecated: true` di spec) supaya tidak breaking terhadap caller frontend yang sudah ada.

### Eksekusi

Pekerjaan mekanis di 61 file route didelegasikan ke 10 agent paralel, dibagi per domain:

| Batch | Domain |
|---|---|
| 1 | `admin.ts` (55 endpoint, ditangani sendiri karena ukurannya) |
| 2 | employees, tenants, companies, org |
| 3 | talent matrix, competencies, idp |
| 4 | reports, custom reports, lms, audit, security, dashboard, staff accounts |
| 5 | admin legal, acceptances, legal documents, privacy, public, subscription, early release, payments |
| 6 | payroll settings, payroll, shifts, overtime, corrections |
| 7 | leave, recruitment, onboarding, performance, training, offboarding |
| 8 | sso, platform, integrations, workflows, industry templates, branding, tutorials, assistant, ai enterprise, scim |
| 9 | policies, surveys, calendar, approvals, announcements, documents, claims, loans |
| 10 | assets, helpdesk, permissions, careers, uploads, files, notifications, signed payslip |

## Hasil

| Metrik | Sebelum | Sesudah |
|---|---|---|
| Endpoint terdokumentasi | 14 / ~489 (~3%) | 490 / 490 (~100%) |
| Sumber dokumentasi | Hand-written, terpisah dari validasi | Auto-generated dari schema Zod yang sama dengan validasi |
| Pelanggaran REST diketahui | `POST /tenants/search` | Diperbaiki (`GET` ditambah, `POST` dipertahankan sebagai deprecated) |
| Test suite | — | 186/186 pass, termasuk assertion struktur `openapi.json` |
| Type-check (`tsc --noEmit`) | — | 0 error di seluruh backend |
| File diubah | — | 61 file, +7752 baris, murni additive |

## Soal Skor Scorecard

Setelah rollout, skor dari tool `api-design-reviewer` (`api_scorecard.py`) masih **grade F (58.84)**, naik dari 54.61 sebelumnya. Ini butuh penjelasan jujur:

Tool tersebut menilai **"documentation richness"** (deskripsi panjang per field, contoh nilai, `operationId`, `Cache-Control` header, query parameter pagination eksplisit) — bukan sekadar "apakah endpoint terdokumentasi atau tidak". Setelah `operationId` di-generate otomatis untuk semua endpoint, sub-skor Documentation naik dari 28 → 50.

Sisa nilai rendah ada di kategori **Performance (28.5)**, karena tool ini mengecek `Cache-Control` header di response — dan dnPeople **memang belum implementasi HTTP caching sama sekali**. Ini adalah gap fitur nyata di aplikasi, bukan gap dokumentasi, dan sengaja **tidak** ditulis header caching palsu di spec hanya untuk mengejar angka.

**Kesimpulan**: tujuan utama pekerjaan ini — REST API yang benar secara semantik dan terdokumentasi lengkap dari satu sumber kebenaran (Zod) — sudah tercapai 100%. Menaikkan skor scorecard lebih lanjut butuh proyek terpisah untuk menambahkan fitur caching dan pagination standar di API-nya sendiri, bukan sekadar pekerjaan dokumentasi.

## File Kunci yang Diubah

- **Baru**: `backend/src/openapi/registry.ts`, `backend/src/openapi/envelopes.ts`, `backend/src/openapi/generate.ts`, `backend/src/openapi/registerAllRoutes.ts`
- **Diubah**: 61 file di `backend/src/routes/*.ts`, `backend/package.json` (script `generate:openapi`)

## Cara Verifikasi

```bash
cd backend
npm run generate:openapi        # regenerate openapi.json dari registry
npx tsc --noEmit                 # 0 error diharapkan
npx tsx --test src/__tests__/*.test.ts   # 186 pass diharapkan
```

Swagger UI tersedia di `/api/v1/docs` (dev), spec mentah di `/api/v1/openapi.json`.

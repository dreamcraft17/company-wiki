# RAG evaluation record

**Tanggal:** 23 September 2026  
**Retriever production yang diuji:** lexical FAQ/policy chunk retrieval di `backend/src/lib/assistantKb.ts`  
**Catatan:** angka dari evaluator baseline adalah evidence untuk corpus uji ini, bukan jaminan semua pertanyaan produksi.

## Corpus analysis

`chunking_optimizer.py` pada seluruh `dnpeople/docs/` menemukan 157 dokumen dan 1.641.513 karakter. Rekomendasinya `fixed_size_char`, tetapi corpus tersebut mencampur dokumen historis, legal, operasional, dan marketing yang tidak boleh otomatis menjadi knowledge source assistant.

Pipeline designer pada requirement assistant kecil (40 FAQ/policy chunks, 200 query/hari sebagai asumsi, interactive latency, accuracy priority 0,9) mengusulkan sentence chunking, hybrid retrieval, dan evaluasi berkala. Nama model, database, dan biaya yang dicetak tool adalah kandidat/estimasi yang wajib diverifikasi; tidak diadopsi otomatis ke production.

## Evaluation 1 — corpus salah scope

Corpus: seluruh `dnpeople/docs/` (157 dokumen). 6 query gold.

| Metric | Result |
|---|---:|
| Precision@1 | 0.000 |
| Precision@5 | 0.000 |
| Recall@10 | 0.000 |
| MRR | 0.000 |

Failure: hasil teratas berasal dari dokumen yang kebetulan berbagi kata umum; FAQ/USER-GUIDE tidak naik ke hasil relevan. **Decision:** jangan memasukkan seluruh folder docs ke assistant.

## Evaluation 2 — corpus assistant terkurasi

Corpus: FAQ assistant terkurasi + satu guide umum sebagai distractor. 5 query gold: reset password, DOKU invoice, cuti, import absensi, tambah karyawan.

| Metric | Result |
|---|---:|
| Precision@1 | 1.000 |
| Precision@5 | 1.000 |
| Recall@5 | 1.000 |
| MRR | 1.000 |
| NDCG@5 | 1.000 |

Unit test chunk retriever production juga lulus P@1 100% untuk 8 gold how-to query, termasuk payment FAQ DOKU.

## Decision

- Tetap gunakan curated FAQ chunks + tenant policy retrieval.
- Jangan menambah vector DB, embedding provider, atau reranker pada sprint ini.
- Tambahkan gold queries setiap ada fitur/payment/pricing baru.
- Naikkan ke hybrid/dense retrieval hanya jika corpus curated gagal target atau volume query membuktikan kebutuhan.
- Target GA tetap: precision@1 ≥0,80, recall@10 ≥0,85, dan 0 numeric hallucination pada sample mingguan.

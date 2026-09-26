# Refresh targets

## Sebelum klaim komersial

- [ ] 10–15 interview: owner/HR SME, HR admin multi-cabang, dan karyawan pengguna.
- [ ] Kumpulkan 100 pertanyaan nyata atau synthetic-but-reviewed dari FAQ/support.
- [ ] Gold set intent + expected answer + allowed citation.
- [ ] Jalankan weekly sample untuk numeric hallucination; target 0.
- [ ] Audit semua FAQ terhadap fitur production terbaru, termasuk DOKU dan pricing.
- [ ] Ukur activation, weekly active users, helpfulness, containment, citation coverage, latency, fallback rate, dan cost.

## Decision rule 60 hari

Naikkan positioning dari beta menjadi differentiator jika minimal tercapai:

- 30% akun Enterprise eligible mencoba assistant;
- 40% pertanyaan how-to/FAQ selesai tanpa eskalasi ke HR;
- helpfulness positif ≥70% dari feedback yang terisi;
- precision@1 retrieval ≥0,80;
- 0 jawaban angka HR yang salah pada sample mingguan;
- p95 `/assistant/ask` ≤8 detik;
- tidak ada insiden cross-tenant atau data disclosure.

Jika gagal, tetap pertahankan sebagai helper internal/Enterprise dan fokuskan roadmap pada FAQ quality, bukan menambah agent atau model.

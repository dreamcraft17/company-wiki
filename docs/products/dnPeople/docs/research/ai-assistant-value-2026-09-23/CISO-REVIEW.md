# CISO Review — AI Assistant dnPeople

**Tanggal:** 23 September 2026  
**Scope:** assistant request, HR tools, FAQ/tenant policy context, optional LLM provider, feedback and admin analytics.

## Threat model

1. **Information disclosure — High likelihood / High impact:** prompt atau query salah scope dapat membuka payroll/PII lintas employee atau tenant.
2. **Elevation of privilege — Medium likelihood / High impact:** feedback/request ID atau tool input dipakai untuk mengakses jawaban milik user/company lain.
3. **Tampering — Medium likelihood / High impact:** policy content berisi prompt injection atau knowledge source stale sehingga model memberi jawaban yang salah.

Controls implemented: scope dari session, feedback ownership check terhadap ASK audit, read-only tools, PII refusal, redaksi identifier langsung sebelum audit/provider, prompt-injection marker filter, penghapusan baris policy yang berisi instruksi injection, output filter, policy sebagai untrusted context, timeout/fallback, dan citation metadata.

## Blast radius

Worst case: data yang tersedia pada tenant yang compromised dapat terbaca melalui assistant; jika tenant isolation gagal, dampaknya bisa lintas perusahaan. Jumlah user dan ALE belum dapat dihitung dari data production saat ini; angka risk-quantifier default tidak dipakai sebagai fakta dnPeople.

## Detection

- Audit event `entityType=assistant`, `action=ASK` dengan request ID, intent, mode, citation count, latency, dan question yang sudah diredaksi.
- Assistant feedback menyimpan helpfulness, reason, intent, mode, citation count, company, dan timestamp.
- Analytics memakai `count`/`aggregate` seluruh periode; daftar feedback terbaru tetap dibatasi 200 item dan ditandai `feedbackSampled`.
- Alert yang masih wajib: spike 403/404 pada `/assistant/feedback`, cross-tenant negative test failure, provider timeout rate, p95 latency, dan feedback negatif berturut-turut.
- MTTD target beta: ≤15 menit untuk error-rate/latency alert; current measured MTTD: belum ada.

## Response

- Kill switch yang tersedia: feature flag `ai:assistant` dan fallback non-LLM.
- Runbook khusus assistant/data disclosure: belum tabletop-tested; wajib dibuat sebelum kampanye production yang luas.
- Restore/RPO/RTO mengikuti baseline platform: RPO <1 jam dan RTO <4 jam, tetapi migration baru tetap harus masuk drill staging.

## Regulatory/vendor

- Data surface: PII/HR data; UU PDP dan kebijakan privacy dnPeople berlaku.
- Provider LLM: DPA/subprocessor/retention configuration harus dicatat dan disetujui sebelum mengirim data customer production.
- Prompt-injection scanner dan domain-specific adversarial tests harus dijalankan ulang saat system prompt, model, atau sumber policy berubah.
- Review vendor data controls dilakukan berdasarkan konfigurasi provider aktif, bukan asumsi default.
- Notifikasi insiden: ikuti incident response dan kewajiban yang berlaku; jangan mengiklankan compliance certification yang belum dimiliki.

## Verdict

🟡 **MITIGATE THEN SHIP** — beta terbatas dapat dilanjutkan setelah migration + smoke test, tetapi production-wide marketing menunggu CISO/security sign-off, provider data-processing review, negative tenant-isolation tests, dan tabletop incident response.

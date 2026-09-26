# CTO Review — AI Assistant dnPeople

**Tanggal:** 23 September 2026  
**Review scope:** feedback pipeline, answer audit, curated FAQ/policy retrieval, optional LLM synthesis, admin quality analytics.

## Scaling cliff

- Current measured capacity: belum ada load test khusus `/assistant/ask`.
- Working hypothesis: ≤50 p99 QPS total API tahun pertama; ini asumsi, bukan measurement.
- Cliff yang mungkin: provider LLM latency/cost dan query DB policy, bukan Express routing.
- Guardrail yang sudah dipasang: provider timeout 6 detik, fallback rule/RAG, max context 6.000 karakter, max output 1.500 karakter, audit metadata minimum.
- Required next measurement: load test authenticated `/assistant/ask` dengan 1/10/50 concurrent user dan ukur p50/p95/p99, error, fallback, DB pool.

## Tech debt

- P0 product debt: knowledge source belum punya owner/review cadence dan corpus-wide retrieval buruk jika seluruh docs dimasukkan.
- P1 code debt: `admin.ts` besar dan assistant analytics sementara berada di route monolith; belum blocking untuk beta.
- P1 test debt: endpoint feedback belum punya integration test dengan database fixture.
- Cost per week: belum terukur; jangan membuat angka palsu. Blocking date: saat query assistant melewati target p95 atau feedback negatif tidak bisa ditindaklanjuti.

## Team

- Assumption for decision engine: 2 engineer, tanpa dedicated platform team.
- Contribution model: modular monolith, one owner backend/full-stack, review security sebelum production migration.
- Tidak ada keputusan hiring yang diperlukan untuk beta.

## Build vs buy

- **Build:** router, tenant/role scope, read-only HR tools, curated knowledge/citations, feedback, audit, admin analytics. Ini adalah product context dan moat dnPeople.
- **Buy/use provider:** LLM synthesis. Jangan self-host model atau membangun vector platform sebelum volume/quality memaksa.
- 3-year TCO: belum dapat dihitung tanpa volume token, retention, dan provider pricing yang diverifikasi. Model/provider prices tidak dikunci dalam keputusan ini.
- Decision: **BUILD orchestration + BUY model capability**.

## Reliability

- Existing API SLO: authenticated CRUD p95 <600 ms.
- Assistant-specific target: p95 `/assistant/ask` ≤8 detik; tool-only path target ≤1 detik.
- Proposed availability: assistant non-core 99,5%; core HR remains independent when assistant unavailable.
- Existing backup commitment: RPO <1 jam, RTO <4 jam; migration must be applied and restore drill must remain green.
- Error-budget consumer: owner produk/tech lead; provider outage consumes assistant budget, not permission to weaken HR data correctness.

## Security

- Tenant scope comes from session, not question text.
- Feedback lookup requires the same company, user, request ID, and ASK audit record.
- Sensitive numeric identifiers are redacted in the audit question.
- Policy is treated as untrusted context for the model.
- Recruitment ranking, performance scoring, disciplinary recommendation, and cross-employee salary are out of scope.
- **Security/CISO sign-off:** pending; detail ada di [CISO-REVIEW.md](./CISO-REVIEW.md).

## Verdict

🟡 **SHARPEN / BETA SHIP** — code is ready for controlled beta after migration deploy and endpoint smoke test. Do not call this a fully autonomous HR agent or make it a broad public differentiator before 60-day quality evidence.

## Next steps

1. Apply migration `20260923100000_assistant_feedback` in staging, then production; run smoke: ask → feedback → admin analytics.
2. Run authenticated load test and add route integration tests for ownership, duplicate upsert, and cross-tenant rejection.
3. Obtain security/data-processing sign-off and assign owner for FAQ/policy review.

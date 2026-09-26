# Research Plan — dnPeople `/welcome` Hero Copy

> **Status:** Active · **Date:** 2026-09-17 · **Author:** Dozer

## Decision

Memilih wording eyebrow hero yang paling membantu pengunjung memahami target dnPeople dalam beberapa detik, tanpa mengulang metadata atau membuat klaim segmentasi yang belum divalidasi.

## Scope

- halaman: `dnpeople/frontend/src/app/welcome/page.tsx` dan `content.ts`;
- elemen: eyebrow/badge di atas H1;
- audience: HR/GA, finance/payroll, manager operasional, dan owner perusahaan multi-cabang;
- tidak termasuk: redesign visual, pricing, funnel backend, atau market sizing.

## Existing work check

- Current H1: `Aturan HR pusat, tetap rapi di setiap cabang.`
- Current badge before this investigation: `Untuk tim HR multi-cabang`.
- Supporting copy sudah menyebut HRIS, absensi, shift, approval, payroll BPJS/PPh 21, audit trail, dan kisaran 50–300 karyawan.
- Landing page sudah memiliki pillar pages, FAQ, canonical, sitemap, dan structured data.

## Falsifiable hypotheses

1. **H1 —** Wording yang menyebut “perusahaan” dan “multi-cabang” lebih tepat merepresentasikan konteks masalah serta buying committee dibanding wording yang hanya menyebut fungsi HR.
2. **H2 —** Keyword kategori seperti “HRIS”, “absensi”, dan “payroll” lebih tepat berada di title/subheading daripada eyebrow, karena eyebrow berfungsi sebagai orientasi singkat.
3. **H3 —** Wording “untuk perusahaan Indonesia 50–300 karyawan” terlalu sempit untuk baris visual pertama dan lebih baik dipertahankan di supporting copy/metadata.
4. **H4 —** Wording final tetap perlu diuji secara usability; riset pasar dan prinsip UX tidak dapat membuktikan conversion lift tanpa eksperimen atau user test.

## Candidate variants

| ID | Wording | Intent |
|----|---------|--------|
| A | `Untuk perusahaan multi-cabang` | Company context + buying committee |
| B | `Untuk tim HR multi-cabang` | Functional audience + operational context |
| C | `HRIS untuk perusahaan multi-cabang` | Category + context |
| D | `Untuk HR yang mengelola banyak cabang` | Audience + job-to-be-done |
| E | `Untuk operasional HR multi-cabang` | Operational outcome |

## Evaluation rubric

Score each variant 1–5 against:

- category clarity;
- target-audience clarity;
- differentiation fit;
- scanability;
- natural Indonesian language;
- consistency with existing H1/subheading;
- risk of overclaiming or narrowing the ICP.

No score is treated as measured user preference. It is a structured editorial hypothesis.

## Sourcing strategy

- Google Search Central: title, snippets, people-first content, structured data.
- UX usability reference: homepage tagline and priority-task clarity.
- Official HRIS competitor pages: category vocabulary and audience framing.
- Opposition query: check whether “multi-cabang” is already generic and whether “tim HR” is too narrow.

## Stop criteria

Stop when:

- at least three source types support the wording direction;
- no source contradicts the candidate on a material claim;
- implementation fit is clear from the current page;
- remaining uncertainty is explicitly assigned to usability testing.

## Risk register

| Risk | Mitigation |
|------|------------|
| Eyebrow too generic | Keep H1 and subheading outcome-specific |
| Eyebrow too narrow | Keep headcount and verticals in supporting copy |
| English jargon reduces comprehension | Use Bahasa Indonesia visible labels |
| Copy implies research evidence not available | Avoid “yang kami dengar berulang” until interviews support it |
| SEO keyword stuffing | Use natural language; do not rely on meta keywords |

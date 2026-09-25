---
owner: Dozer
status: ready-for-design-and-content
last_reviewed: 2026-09-17
source_strategy: company-wiki/docs/products/dnPeople/docs/MARKETING-GTM-STRATEGY-2026-09-17.md
---

# dnPeople — Website Marketing Implementation Spec

**Target repo:** `dnpeople/`  
**Target surface:** Next.js marketing pages under `frontend/src/app/`  
**Objective:** mengubah website dnPeople dari pesan HRIS generik menjadi mesin konversi untuk perusahaan Indonesia 50–300 karyawan dengan banyak cabang atau workflow HR yang penuh pengecualian.

## 1. Product marketing decision

### Positioning

> **HR operating system untuk perusahaan Indonesia dengan banyak cabang, banyak pengecualian, dan kebutuhan audit HR yang kuat.**

### Primary headline

> **Aturan HR pusat, tetap rapi di setiap cabang.**

### Supporting promise

> Kelola attendance, approval, payroll, dan people evidence dalam satu alur yang dapat dijelaskan—tanpa rekonsiliasi Excel yang berulang.

### Primary ICP

Perusahaan Indonesia dengan 50–300 karyawan, minimal beberapa lokasi/cabang, dan HR/GA atau finance team kecil. Prioritas vertical: retail, F&B multi-outlet, jasa lapangan, klinik/pendidikan, distributor, dan jasa profesional.

### Primary CTA

`Jadwalkan Workflow Audit 30 Menit`

### Secondary CTA

`Coba Sandbox Gratis`

CTA harus membawa konteks pain, bukan hanya “Hubungi Sales”.

## 2. Page architecture

### `/welcome` — conversion landing page

Urutan section:

1. **Hero:** headline, supporting promise, primary/secondary CTA, badge `Untuk perusahaan multi-cabang`; detail ICP `50–300 karyawan` dan stakeholder HR/GA, finance/payroll, serta operasional tetap ada di supporting copy dan metadata.
2. **Problem:** tiga situasi nyata—aturan cabang berbeda, payroll dibuka kembali, bukti approval tercecer.
3. **Three outcome pillars:** Branch Operations Control, Payroll Confidence, People Evidence.
4. **How it works:** Configure → Run → Review → Prove.
5. **Use-case cards:** Multi-cabang, payroll/finance, talent/succession.
6. **Product proof:** screenshots/flow yang benar-benar tersedia; bedakan `Available`, `Conditional`, dan `Roadmap`.
7. **Implementation promise:** import sample, setup call, payroll preview, manager training, go-live checklist.
8. **Pricing orientation:** FREE/STARTER/PROFESSIONAL/BUSINESS/ENTERPRISE dengan headcount dan batasan yang jujur.
9. **FAQ:** native app, auto-transfer, e-filing, SSO, trial, data privacy.
10. **Final CTA:** workflow audit atau sandbox.

### `/pricing` — plan selection

- Tampilkan headcount limit sebagai informasi utama: FREE 30, STARTER 50, PROFESSIONAL 300, BUSINESS/ENTERPRISE discovery.
- Gunakan `subscriptionCatalog.ts`/runtime pricing sebagai source of truth; jangan hardcode harga marketing.
- Tambahkan filter kebutuhan: `Operasional cabang`, `Payroll`, `Talent`, `API & enterprise`.
- Beri label `Conditional` untuk SSO, SMTP, biometric, LLM, dan payment live jika belum terkonfigurasi.
- Setiap CTA mencatat tier dan use-case yang dipilih ke lead payload.

### `/demo` — guided proof

Bukan halaman video generik. Tampilkan alur demo:

1. Cabang/lokasi dan scope approval.
2. Attendance exception dan correction evidence.
3. Payroll preview, finalize, payslip.
4. Audit/evidence timeline.
5. Talent-to-action bila prospek memiliki pain succession.

Form demo meminta jumlah karyawan, jumlah cabang, current tool, pain terbesar, deadline, dan kebutuhan integrasi.

### `/faq` — objection handling

FAQ minimum:

- Apakah dnPeople punya native Android/iOS? **Belum; saat ini mobile-first web.**
- Apakah dnPeople melakukan transfer payroll otomatis? **Belum; payroll export, bukan eksekusi transfer.**
- Apakah dnPeople melakukan e-filing DJP/BPJS? **Belum.**
- Apakah bisa multi-cabang? **Ya, sesuai tier dan konfigurasi; lakukan discovery untuk scope kompleks.**
- Apakah SSO/biometric/AI tersedia? **Conditional; bergantung provider dan UAT.**
- Apakah data terisolasi? **Ya, tenant isolation dan backend permission berlaku; detail tersedia di security docs.**

### `/contact` — route to qualified conversation

Ganti framing umum menjadi `Mulai Workflow Audit`. Field tambahan:

- employee count;
- branch/location count;
- attendance workflow;
- payroll workflow;
- current tools;
- biggest risk;
- go-live target;
- consent.

## 3. Copy system

### Pillar 1 — Branch Operations Control

**Headline:** `Aturan pusat, eksekusi cabang tetap terkendali.`  
**Proof:** organization scope, locations, shifts, approval, attendance correction, import dry-run.  
**CTA:** `Audit workflow cabang Anda`.

### Pillar 2 — Payroll Confidence

**Headline:** `Payroll yang bisa diperiksa sebelum dan sesudah finalize.`  
**Proof:** BPJS/PPh 21, proration, overtime inputs, preview, atomic finalize, payslip verification.  
**CTA:** `Lihat alur payroll`.

### Pillar 3 — People Evidence

**Headline:** `Setiap perubahan HR meninggalkan bukti yang jelas.`  
**Proof:** before/after, actor, reason, approval, policy acknowledgement, audit export.  
**CTA:** `Lihat evidence flow`.

### Tone

- Bahasa Indonesia sederhana, profesional, dan konkret.
- Tunjukkan kejadian/workflow, bukan jargon HCM.
- Hindari hiperbola, social proof palsu, dan perbandingan kompetitor tanpa sumber.
- Selalu jelaskan syarat provider untuk fitur Conditional.

## 4. Technical implementation map

| Area | Lokasi kandidat | Perubahan |
|---|---|---|
| Metadata/SEO | `frontend/src/app/welcome/page.tsx`, `layout.tsx`, `sitemap.ts` | title, description, canonical, OG copy berbasis ICP |
| Shared marketing copy | `frontend/src/lib/marketing/content.ts` | pillars, FAQ, CTA, use cases, proof labels |
| Landing UI | `frontend/src/app/welcome/page.tsx` | section order dan CTA context |
| Pricing | `frontend/src/app/pricing/page.tsx` | outcome filter, tier truth, lead context |
| Demo | `frontend/src/app/demo/page.tsx` | guided workflow + qualified form |
| Contact | `frontend/src/app/contact/page.tsx` | workflow-audit CTA + fields |
| FAQ | `frontend/src/app/faq/page.tsx` / shared content | objection answers yang jujur |
| Lead attribution | `EmailCaptureForm`, lead API | source, campaign, ICP segment, use-case, UTM |
| Analytics | existing GA4/marketing hooks | funnel events dan consent-aware tracking |

Jangan mengubah API lead tanpa mempertahankan backward compatibility. Tambahkan field nullable atau metadata JSON yang tervalidasi.

## 5. Analytics contract

Event names:

- `marketing_page_view` — `{page, icp_variant}`
- `marketing_cta_click` — `{page, cta, use_case, tier}`
- `workflow_audit_start` — `{page, use_case}`
- `demo_form_submit` — `{employee_band, branch_band, use_case, source}`
- `sandbox_signup_start` / `sandbox_signup_complete`
- `pricing_view` — `{tier, billing_cycle}`
- `faq_expand` — `{question_id}`
- `lead_qualified` — server-side/manual CRM status

Funnel utama:

`Landing view → CTA click → qualified form → workflow audit → sandbox/pilot → paid`

Jangan menjadikan page view, total signup, atau time-on-page sebagai north-star metric.

## 6. SEO content plan

Prioritas halaman/use-case:

- `/welcome`: `HRIS multi-cabang Indonesia`
- `/branch-operations`: `software HR untuk perusahaan multi-cabang`
- `/payroll-confidence`: `payroll Indonesia yang dapat diaudit`
- `/people-evidence`: `audit trail HR dan approval karyawan`
- `/demo`: `demo HRIS payroll dan absensi Indonesia`

Setiap halaman use-case harus memiliki satu intent, satu CTA, FAQ schema bila valid, dan internal link ke pricing/demo. Jangan membuat doorway pages yang hanya mengganti nama kota tanpa konten lokal nyata.

## 7. Acceptance criteria

- [ ] Hero menjelaskan ICP, outcome, dan CTA dalam satu layar.
- [ ] Tiga pillar tampil sebelum daftar fitur panjang.
- [ ] Semua klaim customer count, savings, logo, dan “sudah dipakai” memiliki evidence atau dihapus.
- [ ] Tier limits/pricing berasal dari runtime SSOT.
- [ ] Conditional/Roadmap tidak diberi label Available.
- [ ] Form mengumpulkan employee count, branch count, current tool, pain, timeline, consent, dan UTM.
- [ ] Setiap CTA memiliki event analytics dan source/use-case.
- [ ] Page metadata dan sitemap mencerminkan URL yang benar; tidak mengklaim domain yang belum go-live.
- [ ] Keyboard/a11y, mobile viewport, SSR build, dan lead API regression tests pass.
- [ ] Sales dapat menjalankan demo berdasarkan tiga pillar tanpa menjanjikan fitur di luar katalog.

## 8. Rollout

### Phase 1 — Content and measurement (1 minggu)

Copy system, page metadata, event taxonomy, form fields, and FAQ truth sheet.

### Phase 2 — Landing and conversion (1–2 minggu)

Refactor `/welcome`, `/pricing`, `/demo`, `/contact`, and shared marketing content; ship behind a reversible flag if needed.

### Phase 3 — Use-case SEO (2–4 minggu)

Publish only the first two validated use-case pages; add vertical pages after conversion evidence.

### Phase 4 — Optimization (weekly)

Review CTA → workflow audit → pilot conversion, qualitative lead notes, and win/loss. Do not optimize against vanity traffic before qualification works.

## 9. Dependencies and non-goals

**Dependencies:** approved copy, lead API metadata contract, analytics configuration, demo tenant/data, pricing SSOT, current feature catalog, legal/privacy review.

**Non-goals:** native mobile app, payroll transfer rails, e-filing integration, predictive HR claims, unverified testimonials, broad paid acquisition before ICP signal.

*Author: Dozer · 2026-09-17 · dnPeople*

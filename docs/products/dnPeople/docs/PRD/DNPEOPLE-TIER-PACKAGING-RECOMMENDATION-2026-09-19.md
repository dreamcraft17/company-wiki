---
owner: Dozer
status: draft-for-review
canonical: true
last_reviewed: 2026-09-19
review_cadence: monthly
---

# dnPeople — Tier Packaging & Feature Placement Recommendation

> **Status:** Draft for review · **Last updated:** 2026-09-19 · **Author:** Dozer

## Tujuan

Menempatkan fitur dnPeople secara konsisten di paket **FREE, STARTER, PROFESSIONAL, BUSINESS, dan ENTERPRISE** berdasarkan capability runtime saat ini, positioning kompetitor, dan tujuan konversi produk.

Dokumen ini adalah rekomendasi packaging. Dokumen ini **belum mengubah feature gate atau harga runtime**.

## Sumber kebenaran saat ini

Placement saat ini dibaca dari:

- `backend/src/lib/subscriptionFeatures.ts` — server-side feature gate.
- `frontend/src/lib/tierFeatures.ts` — mirror gate dan navigasi frontend.
- `frontend/src/lib/subscriptionCatalog.ts` — copy paket dan fallback harga.
- `backend/src/services/tierPricing.service.ts` — default/runtime pricing configuration.
- `docs/FEATURE-CATALOG.md` — katalog kemampuan dan status komersial.

### Catatan harga

Harga packaging yang diputuskan untuk rekomendasi ini adalah:

- STARTER: **Rp10.000/karyawan/bulan**.
- PROFESSIONAL: **Rp15.000/karyawan/bulan**.
- BUSINESS: **Rp20.000/karyawan/bulan**.
- Harga ENTERPRISE: custom.

Harga tersebut belum diterapkan ke billing runtime. Implementasi harus memperbarui default/fallback, tabel `subscription_tier_plans`, `/admin/tier-pricing`, marketing copy, dan aturan migrasi customer lama. Minimum monthly charge juga perlu dikonfirmasi sebelum rollout.

## Prinsip packaging

1. Paket dibedakan berdasarkan outcome, bukan jumlah bullet fitur.
2. FREE harus cukup berguna untuk activation dan referral, tetapi tidak menggantikan operational HR berbayar.
3. STARTER menyelesaikan pekerjaan HR harian.
4. PROFESSIONAL menyelesaikan payroll Indonesia dan people development.
5. BUSINESS menyelesaikan kontrol multi-cabang, workflow, integrasi, dan audit.
6. ENTERPRISE menyelesaikan governance, identity, multi-company, SLA, dan branding.
7. Fitur security baseline seperti MFA tidak boleh menjadi alasan untuk menurunkan keamanan pengguna FREE.
8. Fitur yang statusnya `Conditional` tidak boleh dipasarkan sebagai fully available sebelum UAT/provider gate selesai.

## Recommended package architecture

| Paket | Positioning | Headcount saat ini | Harga keputusan | Job-to-be-done |
|---|---|---:|---:|---|
| FREE | Organize people | Maks. 30 | Gratis | Merapikan data dan administrasi dasar |
| STARTER | Run daily HR | Maks. 50 | Rp10.000/employee/bulan | Menjalankan absensi, cuti, shift, dan payroll dasar |
| PROFESSIONAL | Run payroll & develop people | Maks. 300 | Rp15.000/employee/bulan | Menjalankan payroll Indonesia dan mengembangkan karyawan |
| BUSINESS | Control multi-branch operations | 301+; soft limit sekitar 1.000 | Rp20.000/employee/bulan; minimum Rp6 juta | Mengontrol cabang, workflow, integrasi, dan evidence |
| ENTERPRISE | Govern at scale | Custom | Harga khusus | Mengelola multi-company dengan identity, SLA, dan governance |

## Feature placement matrix

| Fitur / outcome | FREE | STARTER | PROFESSIONAL | BUSINESS | ENTERPRISE |
|---|:---:|:---:|:---:|:---:|:---:|
| Employee database | ✓ | ✓ | ✓ | ✓ | ✓ |
| Organization / org chart | ✓ | ✓ | ✓ | ✓ | ✓ |
| Employee documents | ✓ | ✓ | ✓ | ✓ | ✓ |
| Announcements & policies | ✓ | ✓ | ✓ | ✓ | ✓ |
| Calendar & notifications | ✓ | ✓ | ✓ | ✓ | ✓ |
| Helpdesk & tutorials | ✓ | ✓ | ✓ | ✓ | ✓ |
| MFA / basic security | ✓ | ✓ | ✓ | ✓ | ✓ |
| Employee import Excel/CSV | ✓ | ✓ | ✓ | ✓ | ✓ |
| Basic attendance | — | ✓ | ✓ | ✓ | ✓ |
| Advanced attendance / offline / biometric | — | — | ✓ | ✓ | ✓ |
| Leave & permission | — | ✓ | ✓ | ✓ | ✓ |
| Advanced leave policy | — | — | ✓ | ✓ | ✓ |
| Shift & shift swap | — | ✓ | ✓ | ✓ | ✓ |
| Basic approvals | — | ✓ | ✓ | ✓ | ✓ |
| Advanced workflow approvals | — | — | — | ✓ | ✓ |
| Basic payroll | — | ✓ | ✓ | ✓ | ✓ |
| BPJS / PPh 21 / proration | — | — | ✓ | ✓ | ✓ |
| Payroll preview / finalize / verification | — | — | ✓ | ✓ | ✓ |
| Overtime | — | — | ✓ | ✓ | ✓ |
| Claims & loans | — | — | ✓ | ✓ | ✓ |
| Recruitment / ATS | — | — | ✓ | ✓ | ✓ |
| Onboarding | — | — | ✓ | ✓ | ✓ |
| Performance / KPI / OKR | — | — | ✓ | ✓ | ✓ |
| Competency / IDP / LMS | — | — | ✓ | ✓ | ✓ |
| 9-box / succession | — | — | ✓ | ✓ | ✓ |
| Surveys | — | — | ✓ | ✓ | ✓ |
| Multi-branch operations | — | — | **✓ recommended** | ✓ | ✓ |
| Branch templates / location overrides | — | — | **✓ recommended** | ✓ | ✓ |
| REST API | — | — | — | ✓ | ✓ |
| Webhooks / integrations | — | — | — | ✓ | ✓ |
| Custom reports | — | — | — | ✓ | ✓ |
| Asset management | — | — | — | ✓ | ✓ |
| Offboarding | — | — | — | ✓ | ✓ |
| Advanced audit / evidence export | — | — | — | ✓ | ✓ |
| Multi-company / legal entities | — | — | — | — | ✓ |
| SSO / SAML / SCIM | — | — | — | — | ✓ |
| Custom domain / branding | — | — | — | — | ✓ |
| AI assistant / AI documents | — | — | — | — | ✓ |
| Dedicated SLA / account manager | — | — | — | — | ✓ |

## Per-tier copy

### FREE — Organize people

Tampilkan database karyawan, organisasi, dokumen, pengumuman, kebijakan, kalender, notifikasi, helpdesk, tutorial, import karyawan, MFA, dan basic security. Jangan tampilkan payroll, attendance, leave, atau recruitment sebagai fitur aktif FREE.

### STARTER — Run daily HR

Tampilkan attendance dasar, leave dan permission, shift dan shift swap, approval inbox dasar, payroll dasar, laporan dasar, dan koreksi attendance. Definisi “basic” harus jelas; jangan menjanjikan payroll BPJS/PPh 21 atau workflow multi-level kompleks.

### PROFESSIONAL — Run payroll & develop people

Tampilkan BPJS, PPh 21, proration, payroll preview/validation/finalize, payslip verification, advanced attendance/leave, overtime, claims, loans, recruitment, onboarding, performance, training, competency, IDP, LMS, 9-box, succession, advanced reports, dan surveys.

**Rekomendasi penting:** letakkan multi-branch dasar, branch template, dan location override di PROFESSIONAL. Target utama dnPeople adalah perusahaan 50–300 karyawan multi-cabang; jika multi-branch hanya tersedia di BUSINESS, wedge utama tidak cocok dengan batas headcount PROFESSIONAL.

### BUSINESS — Control multi-branch operations

Tampilkan advanced workflow dan multi-level approval, REST API, webhooks, custom integrations, custom reports, assets, offboarding, advanced audit/evidence export, security controls lanjutan, scale, quota, dan operational controls. Business harus menjual **control dan proof**, bukan sekadar “lebih banyak fitur”.

### ENTERPRISE — Govern at scale

Tampilkan multi-company/legal entities, SSO Google/Microsoft/SAML, SCIM/JIT provisioning, custom domain, branding/white-label, dedicated SLA, account manager, advanced tenant isolation/data governance, serta AI jika provider/UAT siap. AI bukan headline utama Enterprise; alasan membeli tetap identity, governance, support, dan multi-company control.

## Competitive packaging implications

Payroll, absensi GPS/face/liveness, cuti/lembur, employee self-service, multi-company, performance, recruitment, dan mobile/offline attendance sudah menjadi bahasa kategori kompetitor. Mekari Talenta menampilkan lifecycle HR, mobile attendance, payroll integration, workflow, API, security, support, dan deployment options. GreatDay menampilkan attendance GPS/liveness, payroll, multi-bank/multi-company, offline mode, self-service, dan performance. Gadjian menampilkan paket Standard sekitar Rp12.500 dan Sukses Rp20.000 per karyawan/bulan dengan payroll, cuti, absensi, dan self-service.

Implikasi dnPeople:

1. Jangan menggunakan “HRIS lengkap” sebagai diferensiasi utama.
2. Jadikan **Branch Operations Control + Payroll Confidence + People Evidence** sebagai Professional/Business story.
3. Tampilkan setup template, exception workflow, payroll review, dan audit evidence dalam demo.
4. Jangan mengklaim competitor gap tanpa bukti independen; competitor pages adalah klaim vendor.

## Marketing activation per paket

| Paket | Headline | CTA | Taktik utama |
|---|---|---|---|
| FREE | “Rapikan data karyawan tanpa biaya.” | Buat akun gratis | Public demo, free migration template, referral loop |
| STARTER | “Jalankan absensi, cuti, shift, dan payroll dasar.” | Mulai trial | SEO halaman absensi/shift/payroll dasar, onboarding email |
| PROFESSIONAL | “Payroll Indonesia yang bisa direview, plus talent management.” | Coba 2 bulan | Payroll readiness calculator, PPh 21/BPJS content, case-study pilot |
| BUSINESS | “Kontrol operasi HR multi-cabang dengan workflow dan evidence.” | Audit workflow 30 menit | Branch operations audit, industry templates, comparison pages |
| ENTERPRISE | “Kelola HR multi-company dengan kontrol, integrasi, dan SLA.” | Hubungi sales | Trust center, SSO checklist, security brief, implementation SLA |

Prioritas channel awal: founder-led sales, vertical SEO, workflow audit, comparison pages, dan product-led upgrade prompts. Jangan mengandalkan paid ads sebelum activation dan retention memiliki baseline.

## Decision backlog

### Completion status

- **Done:** pricing SSOT defaults and persisted catalog migration: Starter Rp10k, Professional Rp15k, Business Rp20k.
- **Done:** multi-branch dasar dipindahkan ke Professional; API/webhooks tetap Business.
- **Done:** basic vs advanced attendance/payroll taxonomy dan upgrade copy.
- **Done:** payroll review/evidence demo script dan acceptance proof tersedia di [Payroll Review & Evidence Demo](./DNPEOPLE-PAYROLL-REVIEW-EVIDENCE-DEMO-2026-09-19.md).
- **Done:** backend gate, frontend gate, catalog copy, dan canonical docs disinkronkan; test/build lulus.
- **Pending external evidence:** 5–10 buyer interviews untuk pricing/package comprehension.
- **Pending external evidence:** demand evidence native app, AI, EWA, salary benchmarking.

Item pending external evidence tidak boleh diberi status validated sebelum ada capture interview dan hasil decision rule di [Tier Packaging Validation](./DNPEOPLE-TIER-PACKAGING-VALIDATION-2026-09-19.md).

| Priority | Keputusan | Output |
|---|---|---|
| P0 | Implementasikan STARTER Rp10k, PROFESSIONAL Rp15k, BUSINESS Rp20k | Pricing SSOT + migration/rollout plan |
| P0 | Verifikasi harga runtime vs semua copy setelah implementasi | Satu pricing SSOT |
| P0 | Putuskan multi-branch Professional vs Business | Product decision + migration impact |
| P0 | Definisikan basic vs advanced attendance/payroll | Feature taxonomy dan upgrade copy |
| P0 | Jadikan payroll review/evidence demo utama | Demo script + acceptance proof |
| P1 | Sinkronkan backend gate, frontend gate, catalog copy, dan docs | Tier consistency check |
| P1 | Uji pricing dan package comprehension dengan customer/pilot | 5–10 buyer interviews |
| P2 | Evaluasi native app, AI, EWA, salary benchmarking | Demand evidence sebelum roadmap |

## Evidence limits

- Placement ini berdasarkan codebase dan dokumentasi internal, bukan usage/retention data.
- Belum ada data win/loss, willingness-to-pay, atau cohort activation yang cukup untuk membuktikan price elasticity.
- Competitive data menggunakan halaman publik resmi dan harus direfresh sebelum keputusan quarterly.
- Market sizing TAM/SAM/SOM belum dihitung karena belum ada customer-count dan ARPA model yang tervalidasi.

## External references

- [Mekari Talenta](https://mekari.com/produk/talenta/)
- [Mekari Talenta Attendance](https://mekari.com/produk/talenta/attendance-management/)
- [Gadjian pricing](https://www.gadjian.com/pricing/index/)
- [Gadjian FAQ](https://www.gadjian.com/en/faq)
- [GreatDay HR](https://greatdayhr.com/id-id/)
- [GreatDay HR software HRIS](https://greatdayhr.com/id-id/fitur/software-hris/)

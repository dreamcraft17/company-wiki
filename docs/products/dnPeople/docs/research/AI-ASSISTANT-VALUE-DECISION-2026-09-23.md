---
owner: Dozer
status: proposed
canonical: true
last_reviewed: 2026-09-23
review_cadence: 60-days
---

# AI Assistant dnPeople — apakah layak jadi nilai jual?

> **Keputusan:** **GO untuk beta terukur dan positioning terbatas.** AI Assistant bisa menjadi nilai jual, tetapi bukan sebagai chatbot generik. Nilainya harus dijual sebagai self-service HR yang menjawab dari data dan kebijakan perusahaan, mengikuti role, menampilkan sumber, dan tetap punya fallback saat AI tidak tersedia.

## Jawaban singkat

**Bisa jadi nilai jual, dengan syarat.** Pasar sudah menunjukkan bahwa AI di HR bergerak ke pertanyaan atas data karyawan, attendance, payroll, reimbursement, dan self-service. Mekari Talenta sudah mengomunikasikan arah tersebut, sementara Workday mengaitkan assistant dengan policy grounding, live HR data, security, dan guided actions. Jadi “kami punya AI” tidak cukup menjadi pembeda.

Pembeda dnPeople yang masuk akal:

- Bahasa dan workflow HR Indonesia.
- Jawaban employee-specific dari data yang memang boleh dilihat pengguna.
- Kebijakan perusahaan tenant, bukan jawaban HR generik dari internet.
- Sumber/citation dan tanggal kebijakan yang bisa dicek.
- Rule-based fallback ketika provider LLM gagal.
- UX yang mengantar pengguna ke proses resmi, bukan membiarkan chat menjadi tempat mengambil keputusan HR.

## Status produk sekarang

Ini bukan fitur yang harus dimulai dari nol. Audit repository menunjukkan fondasinya sudah ada:

| Area | Evidence di repo | Status keputusan |
|---|---|---|
| UI | `frontend/src/app/(app)/assistant/page.tsx`, route `/assistant` | Ada |
| API | `POST /assistant/ask`, auth, feature gate `ai:assistant` | Ada |
| Data | Prisma tools untuk fakta self-scope dan HR read-only | Ada, perlu eval |
| Knowledge | FAQ/policy lexical retrieval + citations | Ada, perlu gold set |
| Resilience | LLM opsional + rule fallback | Ada |
| Audit | `AuditLog` untuk setiap ask | Ada |
| Packaging | Feature catalog: Professional+ | Ada, dengan quota/rollout dan evaluasi kualitas |
| Feedback | Belum ada bukti feedback kualitas terstruktur | Gap P0 |
| Truth sync | FAQ perlu audit umum; jawaban pembayaran assistant sudah diselaraskan ke DOKU | P0 audit corpus |

Rujukan implementasi: [CURRENT-IMPLEMENTATION.md](../CURRENT-IMPLEMENTATION.md), [FEATURE-CATALOG.md](../FEATURE-CATALOG.md), dan [PRD v17 HR Chatbot](../PRD/dnpeople-prd-v17.0-hr-chatbot-rag-id.md).

Verifikasi teknis: [RAG evaluation](./ai-assistant-value-2026-09-23/rag-evaluation.md) dan [CTO review](./ai-assistant-value-2026-09-23/CTO-REVIEW.md).

## Positioning yang boleh dan tidak boleh

### Copy yang boleh

> **AI Assistant dnPeople membantu karyawan dan HR menemukan jawaban dari data serta kebijakan perusahaan—dengan akses yang mengikuti role dan sumber yang bisa dicek.**

Contoh manfaat:

- “Cek sisa cuti tanpa menunggu HR.”
- “Temukan langkah pengajuan sesuai SOP perusahaan.”
- “Lihat jawaban beserta sumbernya, lalu lanjutkan ke halaman proses yang benar.”

### Jangan diklaim

- “AI HR yang selalu benar.”
- “AI menggantikan HR.”
- “Bisa membaca semua data perusahaan.”
- “AI menentukan karyawan terbaik, risiko resign, atau keputusan disipliner.”
- “Jawaban berbasis internet” untuk pertanyaan yang seharusnya bersumber dari tenant.

## Segmen prioritas

| Segmen | Pain | Fit | Risiko | Rekomendasi |
|---|---|---:|---:|---|
| SME 20–100 karyawan, owner/HR merangkap | Pertanyaan berulang, SOP tersebar, HR belum punya helpdesk | Tinggi | Sedang | ICP beta utama |
| Perusahaan 100–300 karyawan, HR ops | Banyak pertanyaan employee dan cabang | Tinggi | Sedang–tinggi | Beta Enterprise dengan onboarding |
| Karyawan sebagai pengguna akhir | Butuh jawaban cepat soal cuti/absen/slip | Tinggi | Sedang | Retention/activation lever |
| Recruitment/performance decision | Bias, privacy, dampak keputusan kerja | Rendah untuk v1 | Tinggi | Jangan masuk positioning awal |

## MVP yang dijual

### P0 — wajib sebelum kampanye besar

1. Audit seluruh FAQ/policy agar sesuai production dan tetapkan owner knowledge base.
2. Tambahkan feedback “membantu/tidak membantu” dan alasan singkat.
3. Simpan metrik: activation, weekly active, intent, citation count, helpfulness, containment, latency, fallback, cost, dan refusal.
4. Sembunyikan `mode` internal dari UI pengguna; tampilkan sumber dan “terakhir diperbarui”.
5. Tambahkan refusal yang jelas untuk data orang lain, keputusan ketenagakerjaan, dan pertanyaan di luar scope.

### P1 — setelah 10–15 akun beta

- Deep-link kontekstual ke ajukan cuti, koreksi absensi, payroll, dan policy.
- Admin/HR dapat melihat pertanyaan yang gagal tanpa melihat PII yang tidak perlu.
- Evaluasi retrieval dengan gold set tenant/product; target precision@1 ≥0,80.
- Quota dan cost cap per company.

### P2 — hanya setelah bukti

- Draft action dengan preview dan konfirmasi eksplisit.
- Integrasi channel lain jika volume membuktikan kebutuhan; bukan WhatsApp atau multi-agent secara default.

## Arsitektur yang disarankan

Pertahankan modular monolith dnPeople dan database yang ada. Belum ada alasan untuk microservice atau vector database baru pada tahap beta.

```text
question
  -> auth + tenant/role scope
  -> intent router
  -> read-only Prisma tool OR tenant/product retrieval
  -> redaction + prompt-injection boundary
  -> optional LLM synthesis
  -> answer + citations + refusal
  -> audit + feedback + metrics
```

Backend acceptance:

- Setiap query membawa `companyId`, `userId`, `role`, dan jika relevan `employeeId` dari session, bukan dari teks user.
- Tool fakta harus deterministik; LLM hanya merangkum data yang sudah diambil.
- Provider call memiliki timeout, rate limit, quota, circuit breaker, dan fallback.
- PII sensitif tidak dikirim jika tidak diperlukan; prompt dan output punya batas panjang.
- Policy tenant diperlakukan sebagai data, bukan instruksi yang boleh mengubah system prompt.
- Audit menyimpan metadata minimum yang diperlukan untuk debugging dan compliance.
- Target existing PRD tetap: p95 ≤8 detik, hallucinated numeric HR facts 0 pada sample mingguan, dan cost per successful answer tercatat.

Frontend acceptance:

- Empty state dibagi “Data saya”, “Kebijakan”, dan “Cara pakai”.
- Jawaban angka menampilkan sumber data/periodenya.
- Policy answer menampilkan judul sumber dan last updated.
- Feedback tersedia setelah setiap jawaban.
- State loading, timeout, fallback, refusal, dan empty retrieval jelas dalam Bahasa Indonesia.
- Mobile-first; jangan menambah bundle besar hanya untuk efek chat.

## Risiko bisnis dan operasional

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Jawaban payroll/cuti salah | Hilang kepercayaan, tiket, potensi sengketa | Tool deterministik, citation, sample mingguan, refusal |
| Cross-tenant leakage | Insiden privasi serius | Scope server-side + negative tests + audit |
| FAQ stale | Jawaban salah walau model berjalan | Owner per knowledge source + last updated + review 30/60 hari |
| Biaya LLM tidak terkendali | Margin turun | mini model/provider abstraction, quota, token cap, fallback |
| Prompt injection policy | Model mengabaikan guardrail | treat policy as untrusted data, output validation |
| AI employment decision | Risiko fairness/regulatory | out of scope recruitment ranking, prediction, discipline |
| Vendor/provider outage | Assistant tidak tersedia | rule-based fallback dan kill switch |

## Go-to-market dan packaging

AI Assistant sekarang tersedia di **Professional+**, bukan FREE/Starter. Enterprise tetap mendapat nilai tambahan dari SSO/SCIM, multi-company, branding, dan dukungan dedicated. Akses Professional+ tetap dibatasi role, scope tenant, audit trail, citation, quota, dan feature flag agar risiko data serta biaya tetap terkendali.

Strategi beta:

1. Pilih 10–15 akun yang punya volume pertanyaan HR nyata.
2. Onboard FAQ/policy tenant dan jelaskan batas assistant.
3. Ukur 60 hari dengan decision rule di [refresh targets](./ai-assistant-value-2026-09-23/refresh_targets.md).
4. Review activation, helpfulness, containment, dan cost per tier setiap 30–60 hari; naikkan atau turunkan rollout berdasarkan data, bukan intuisi.

## Decision rule

Naikkan dari “Enterprise beta feature” menjadi headline differentiator hanya bila dalam 60 hari tercapai:

- ≥30% akun eligible mencoba assistant;
- ≥40% FAQ/how-to selesai tanpa eskalasi HR;
- helpfulness positif ≥70% dari feedback yang terisi;
- precision@1 retrieval ≥0,80;
- 0 jawaban angka HR yang salah pada sample mingguan;
- p95 endpoint ≤8 detik;
- tidak ada insiden cross-tenant/data disclosure.

Jika tidak tercapai: tetap jadikan helper Enterprise, perbaiki corpus dan UX, dan jangan menambah agent/action baru.

## Kesimpulan

**Implementasikan dan promosikan sebagai beta yang jujur, bukan sebagai gimmick AI.** dnPeople sudah punya fondasi teknis yang relevan. Nilai jualnya baru benar-benar terbukti jika assistant mengurangi pertanyaan berulang dengan jawaban yang dapat dipercaya, aman, dan terhubung ke workflow HR Indonesia. Bukti itu harus dikumpulkan dari penggunaan nyata sebelum klaim diperbesar.

## Sources

- [Workday Self-Service Agent](https://www.workday.com/en-us/artificial-intelligence/ai-agents/self-service.html)
- [Mekari Talenta AI](https://www.talenta.co/en/features/talenta-ai/)
- [Mekari Talenta HRM](https://www.talenta.co/solusi/software-hrm/)
- [OpenAI business data privacy](https://openai.com/business-data/)
- [OpenAI API data controls](https://developers.openai.com/api/docs/guides/your-data?article_id=8510)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [European Commission AI Act — Recital 57](https://ai-act-service-desk.ec.europa.eu/en/ai-act/recital-57)
- [AIHR HR Priorities 2026](https://www.aihr.com/resources/AIHR_HR_Priorities_2026_Report.pdf)
- [AI adoption in HR organisations](https://arxiv.org/abs/2606.17887)

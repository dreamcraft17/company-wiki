---
owner: Dozer
status: review-required
canonical: false
last_reviewed: 2026-09-15
review_cadence: annual
---

# dnPeople — Panduan Business Development

> **Status:** Active · **Last updated:** 2026-09-13 · **Author:** Dozer  
> **Audience:** BD, sales, founder-led selling  
> **Produk:** [DNPEOPLE-BISNIS-FITUR-LAYANAN.md](./DNPEOPLE-BISNIS-FITUR-LAYANAN.md) · katalog fitur: [FEATURE-CATALOG.md](./FEATURE-CATALOG.md)

Panduan kerja BD: siapa yang dikejar, apa yang boleh dijanjikan, alur demo, kualifikasi, harga, handoff ke implementasi. **Jangan** jual item **Roadmap** atau **Conditional** sebagai fitur sudah live tanpa syarat.

---

## 1. Tujuan BD

| Tujuan | Sumber di produk |
|--------|------------------|
| Isi pipeline SME Indonesia yang butuh HRIS (Excel → sistem) | Segmen overview / project overview |
| Konversi ke signup FREE atau trial paket berbayar | `/billing`, katalog tier |
| Soft launch / beta: 10–20 customer (PRD v11.0) | [LAUNCH-GATE-CHECKLIST.md](./LAUNCH-GATE-CHECKLIST.md) — status **Conditional** |
| Handoff bersih ke CS (10 langkah onboarding) | [CUSTOMER-ONBOARDING-PLAYBOOK.md](./CUSTOMER-ONBOARDING-PLAYBOOK.md) |

Kontak: **sales@dnpeople.id** (sales/demo) · **info@dntech.id** / **info@dnpeople.id** (support — lihat SLA). App: [hris.dntech.id](https://hris.dntech.id). Landing: `/welcome`. Domain **dnpeople.id** DNS masih **Conditional**.

---

## 2. ICP (ideal customer)

Cocok:

- Perusahaan Indonesia, SDM masih Excel/WhatsApp
- Headcount masuk paket: FREE ≤ **30**, STARTER ≤ **50**, PROFESSIONAL ≤ **300** (hard limit)
- Butuh **payroll lokal** (BPJS, PPh 21, slip) dan/atau absensi + cuti yang bisa diaudit
- Ada HR atau owner yang mau jadi `COMPANY_ADMIN`
- Siap import CSV dan 2–3 sesi onboarding (playbook)

Kurang cocok (atau Enterprise custom + UAT panjang):

- Butuh transfer gaji otomatis ke bank, e-filing DJP/BPJS, atau ledger akuntansi named — **belum ada**
- Native iOS/Android — produk **mobile-first web**
- Marketplace karier internal, EWA, salary bench eksternal — **roadmap v16+**
- SILO database dedicated tanpa komitmen ops

Email beta (template Jul 2026) menyebut SME **50–300** karyawan — itu rentang **STARTER–PROFESSIONAL**, bukan FREE (max 30).

---

## 3. Pesan yang boleh dipakai

**Satu kalimat:** HRIS multi-tenant untuk SME Indonesia — karyawan, absensi, cuti, payroll BPJS/PPh 21, rekrutmen, talent (9-box), dengan paket Gratis → Enterprise.

**Proof live:** demo di `hris.dntech.id` (sandbox FREE, nav jujur). Kredensial publik: [DEMO-ACCOUNTS.md](./DEMO-ACCOUNTS.md) (tampil di `/login`, `/demo`, `/welcome` kecuali `NEXT_PUBLIC_SHOW_DEMO_CREDS=false`).

**Jangan katakan:**

- “Sudah go-live penuh di dnpeople.id” — DNS Conditional
- “Payment production sudah E2E” — **DOKU live**; jangan menyamakan status ini dengan gateway alternatif
- “Ada app store Android/iOS”
- “Kami setor pajak/BPJS ke pemerintah”
- Fitur **Conditional** (SSO IdP, SMTP, biometric, LLM) tanpa menyebut syarat
- Video tutorial library (keluar dari PRD v14)

---

## 4. Paket yang dijual (bicara harga)

Harga default (bisa diubah `/admin/tier-pricing`); SSOT UI `subscriptionCatalog.ts`.

| Paket | Headcount | Harga default | Narasi BD |
|-------|-----------|---------------|-----------|
| FREE | 30 hard | Rp 0 | Masuk tanpa kartu; core HR + helpdesk; upsell jujur |
| STARTER | 50 hard | Rp 10.000/karyawan; min Rp150.000 | Absensi/payroll basic, cuti, shift |
| PROFESSIONAL | 300 hard | Rp 15.000/karyawan; min Rp20.000 | Review/evidence payroll, lokasi kerja & aturan per lokasi, ATS, talent, OT/klaim/pinjaman, LMS |
| BUSINESS | ~1000 soft | Rp 20.000/karyawan, min Rp 6.000.000 | API, workflow, aset, audit |
| ENTERPRISE | Custom | Deal | SSO/SCIM, branding, multi-company, dedicated support |

Trial: FREE 4 bulan (overview); **STARTER 4 bulan** (promo, dnPeople bisa matikan kapan saja); **PROFESSIONAL 2 bulan**; BUSINESS 2 bulan; boleh bayar sebelum trial habis. Professional+ butuh headcount & modul yang jelas di discovery — jangan demo 9-box di akun FREE (nav disembunyikan).

---

## 5. Discovery (15–20 menit)

Catat:

1. Jumlah karyawan sekarang vs 12 bulan
2. Siapa yang run payroll (internal / bipartite / konsultan)
3. Absensi sekarang (mesin, Excel, WhatsApp)
4. Apakah butuh rekrutmen publik `/careers`
5. Apakah ada IdP (Google Workspace / Microsoft / SAML) — SSO Conditional
6. Deadline go-live dan siapa admin harian
7. Apakah mereka butuh transfer bank otomatis → jika ya, **export only**, set ekspektasi

Qualifikasi **Go:** ada owner, headcount masuk tier, payroll/absensi adalah pain, tidak butuh e-filing.  
**No-go / later:** native app only, payroll harus auto-transfer, headcount di atas limit tanpa mau Enterprise.

---

## 6. Alur demo (30–40 menit)

Gunakan sandbox **FREE** dulu (jujur), lalu jelaskan upgrade.

| Menit | Role demo | Tampilkan |
|-------|-----------|-----------|
| 0–5 | Landing `/welcome` | Positioning, pricing cards, FAQ |
| 5–12 | `COMPANY_ADMIN` | Org, karyawan, dokumen, helpdesk, `/billing` |
| 12–18 | Jelaskan STARTER | Absensi + cuti + approval (bukan di nav FREE) |
| 18–28 | Jelaskan PROFESSIONAL | ATS `/careers`, payroll Indonesia, 9-box |
| 28–35 | Finance vs HR | Finance lihat payroll; HR tidak lihat gaji |
| 35–40 | Next step | Signup / beta form / Calendly (env Conditional) |

Akun demo (password di [DEMO-ACCOUNTS.md](./DEMO-ACCOUNTS.md)):  
`dina.wijaya@demo.dnpeople.id` (admin) · HR Maya · Manager Raka · Finance Sinta · employee Budi, dll.

**Jangan** bagikan akun `SUPER_ADMIN` `/admin` ke prospek.

---

## 7. Lead & tools yang sudah ada

| Kanal | Path / sistem | Status |
|-------|---------------|--------|
| Landing + CTA | `/welcome` | Available |
| Pricing / FAQ / contact / demo | `/pricing` `/faq` `/contact` `/demo` | Available |
| Lead API | `POST /api/v1/public/leads` | Available; rate-limit |
| Beta interest | `POST /api/v1/public/beta-interest` | Available |
| Calendly / GA4 / Zapier / Convertkit | env marketing | **Conditional** |
| Email beta | [ops/onboarding/beta-email-template.md](../ops/onboarding/beta-email-template.md) | Template 2 bulan free + 3 call |

Isi form: nama, perusahaan, headcount, pain (payroll / absensi / rekrutmen), tanggal go-live.

---

## 8. Handoff ke implementasi (setelah yes)

Ikuti 10 langkah CS: welcome + login → setup call 30 menit → import 5 sample → org → payroll config → 1 slip preview → absensi/cuti/approval → training manager 30 menit → workshop karyawan 15–30 menit → go-live + H+7.

BD menutup: kontrak/tier, jumlah karyawan tagihan, tanggal start trial, nama `COMPANY_ADMIN`. Sisanya CS.

Escalation outage: Dozer, &lt; 1 jam ([SLA-SUPPORT-POLICY.md](./SLA-SUPPORT-POLICY.md)).

---

## 9. Object handling (jujur)

| Keberatan | Jawaban berbasis docs |
|-----------|------------------------|
| “Belum ada app mobile” | Web mobile-first; native roadmap |
| “Harus transfer gaji otomatis” | Export/rekon; eksekusi transfer belum |
| “Pesaing punya video training” | Tutorial in-app + KB; video out of v14 |
| “SSO wajib minggu 1” | SAML/OAuth ada di kode; butuh UAT IdP (Conditional) |
| “Bayar sekarang production” | Checkout **DOKU production**; jelaskan channel pembayaran mengikuti konfigurasi merchant |
| “FREE untuk 100 orang” | Hard block **30**; upgrade STARTER/PROF |

---

## 10. Checklist mingguan BD

- [ ] Leads dari `/welcome` / email di-follow 48 jam kerja (SLA Low/Medium)
- [ ] Demo pakai sandbox FREE; catatan modul yang dijanjikan vs katalog
- [ ] Deal PROFESSIONAL+ cek headcount ≤ 300
- [ ] Tidak ada SOW yang berisi Module 4–8 / EWA / e-filing
- [ ] Won → playbook 10 langkah + intro CS

---

## 11. Referensi cepat

| File | Untuk |
|------|--------|
| [DNPEOPLE-BISNIS-FITUR-LAYANAN.md](./DNPEOPLE-BISNIS-FITUR-LAYANAN.md) | Pitch + paket + modul |
| [FEATURE-CATALOG.md](./FEATURE-CATALOG.md) | Available vs Conditional vs Roadmap |
| [DEMO-ACCOUNTS.md](./DEMO-ACCOUNTS.md) | Login sandbox |
| [USER-GUIDE.md](./USER-GUIDE.md) | Setelah closing |
| [CUSTOMER-ONBOARDING-PLAYBOOK.md](./CUSTOMER-ONBOARDING-PLAYBOOK.md) | Handoff CS |
| [SLA-SUPPORT-POLICY.md](./SLA-SUPPORT-POLICY.md) | Janji support |

---

*Author: Dozer · 2026-09-13 · DN Tech — dnPeople HRIS*

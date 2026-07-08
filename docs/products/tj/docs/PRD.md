# PRD — Trusted Jurist Law Firm Website

**Product Requirements Document**  
Panduan produk untuk membangun, menguji, dan mengembangkan website company profile Trusted Jurist.

| Field | Nilai |
|-------|--------|
| Produk | Website company profile Trusted Jurist Law Firm |
| Kode | `tj` |
| Versi dokumen | 1.0 |
| Tanggal | 8 Juli 2026 |
| Status produk | v0.2.0 — go-live readiness |
| Domain | `https://trustedjurist.co.id` |
| Pemilik produk | Trusted Jurist / Managing Partner |
| Bahasa utama | Bahasa Indonesia |

**Lokasi wiki:** `company-wiki/docs/products/tj/` · **Repo sumber:** `tj/`

**Dokumen terkait:** [current-implementation.md](../current-implementation.md) · [fitur.md](../fitur.md) · [audit.md](../audit.md) · [go-live-checklist.md](./go-live-checklist.md) · [Index](../00_INDEX.md)

---

## 1. Ringkasan Produk

### 1.1 Masalah

Trusted Jurist membutuhkan kehadiran digital profesional yang:
- Menjelaskan posisi firma (litigasi, antikorupsi, hukum publik–korporasi, regulasi sektor)
- Membangun kredibilitas tanpa klaim palsu (testimonial, award, case history fiktif)
- Menyalurkan permintaan konsultasi awal dengan aman dan dapat ditindaklanjuti
- Mematuhi etika advokat dan ekspektasi SEO modern

### 1.2 Solusi

Website company profile editorial premium dengan:
- 7 halaman konten + kebijakan privasi
- Form konsultasi → email (Resend) + saluran WhatsApp/telepon/email
- SEO teknis (metadata, sitemap, robots, OG, JSON-LD)
- Konten data-driven (mudah di-update tanpa redesign)

### 1.3 Tujuan bisnis

| Tujuan | Indikator sukses |
|--------|------------------|
| Kredibilitas digital | Website live di domain resmi, brand konsisten |
| Lead konsultasi | Form submit berhasil; email admin + konfirmasi user |
| Kepercayaan | Disclaimer hukum jelas; tidak ada klaim menyesatkan |
| Discoverability | Sitemap indexable; Lighthouse SEO ≥ 95 |
| Maintainability | Konten di-update via `data.ts` / env, tanpa deploy redesign |

---

## 2. Pengguna & Persona

| Persona | Kebutuhan | Perilaku di website |
|---------|-----------|---------------------|
| **Calon klien korporat / individu** | Memahami fokus praktik & cara menghubungi | Browse praktik → kontak / WhatsApp |
| **Direksi / counsel in-house** | Evaluasi kredibilitas & approach firma | About, team, founder → form konsultasi |
| **Calon associate** | Melihat posisi firma untuk bergabung | Team → CTA bergabung / kontak |
| **Admin firma** | Terima lead, update konten, monitor form | Inbox email, edit `CONTACT_CONFIG` |
| **Search engine / sosial** | Indeks & preview yang akurat | Metadata, sitemap, OG image |

**Non-pengguna saat ini:** portal klien, CMS editor non-teknis, login area.

---

## 3. Ruang Lingkup

### 3.1 In scope (MVP → v0.2.0)

- [x] Company profile: beranda, tentang, praktik, tim, wawasan, kontak
- [x] Desain editorial (navy / gold / cream), responsif mobile
- [x] Form konsultasi dengan backend email
- [x] Kebijakan privasi
- [x] SEO dasar & aset open graph
- [x] Disclaimer hukum di footer
- [ ] Konten kontak final (telepon, WhatsApp) — **blocker go-live**
- [ ] Env production (Resend, reCAPTCHA) — **blocker go-live**

### 3.2 Out of scope (bukan MVP)

| Fitur | Alasan |
|-------|--------|
| Portal klien / login | Di luar company profile |
| CMS headless / dashboard admin | Konten cukup lewat file data |
| Chat live / chatbot | Fokus form + WhatsApp |
| Blog CMS penuh | Insights masih daftar status draf |
| Pembayaran / e-billing | Bukan fase ini |
| Aplikasi mobile native | Website responsif cukup |
| Multibahasa live (EN) | Field `*En` siap; switch belum wajib |

### 3.3 Asumsi

1. Domain & hosting (mis. Vercel) disediakan firma.
2. Admin firma dapat menyediakan nomor resmi dan menyetujui disclaimer.
3. Resend domain dapat diverifikasi di `trustedjurist.co.id`.
4. Tidak ada database; lead hanya lewat email.
5. Artikel insights belum dipublikasikan sebagai halaman detail.

### 3.4 Constraints

- Bahasa UI: Indonesia (locale `id_ID`)
- Tidak menampilkan testimonial / award / case history palsu
- Form belum membentuk hubungan advokat–klien sampai perjanjian tertulis
- Secrets hanya di env, tidak di repo

---

## 4. User Journey Utama

### 4.1 Calon klien → konsultasi

```
Landing (/)
  → Baca hero / praktik preview
  → Practice areas ATAU About/Team
  → CTA “Konsultasi”
  → /contact
  → Isi form ATAU WhatsApp / email / telepon
  → Terima konfirmasi email
  → Firma hubungi dalam 1 hari kerja (SLA konten)
```

### 4.2 Evaluasi kredibilitas

```
/about atau /team
  → Baca filosofi, nilai, founder
  → (opsional) /insights status draf
  → /contact atau /privacy
```

### 4.3 Discovery organik

```
Search / share sosial
  → OG preview / hasil pencarian
  → Landing page relevan
  → Journey 4.1 atau 4.2
```

---

## 5. Persyaratan Fungsional

Prioritas: **Must** (wajib go-live) · **Should** (segera setelah) · **Could** (backlog) · **Won't** (sengaja tidak)

### 5.1 Global

| ID | Requirement | Prioritas | Status |
|----|-------------|-----------|--------|
| G-01 | Navigasi 6 item + CTA Konsultasi di desktop & mobile | Must | Done |
| G-02 | Footer: kontak, praktik, disclaimer, copyright, link privasi | Must | Done |
| G-03 | Skip link & landmark semantic | Must | Done |
| G-04 | Halaman 404 branded | Should | Done |
| G-05 | Transisi halaman & loading state | Could | Done |
| G-06 | Switch bahasa EN live | Could | Backlog |

### 5.2 Beranda (`/`)

| ID | Requirement | Prioritas | Status |
|----|-------------|-----------|--------|
| H-01 | Hero dengan headline, subheadline, dual CTA | Must | Done |
| H-02 | Section kredibilitas / trust tanpa klaim palsu | Must | Done |
| H-03 | Preview praktik (subset) → `/practice-areas` | Must | Done |
| H-04 | Preview founder & wawasan | Should | Done |
| H-05 | CTA penutup ke konsultasi / email | Must | Done |

### 5.3 Tentang (`/about`)

| ID | Requirement | Prioritas | Status |
|----|-------------|-----------|--------|
| A-01 | Narasi profil / filosofi firma | Must | Done |
| A-02 | Komitmen operasional (trust commitments) | Should | Done |
| A-03 | Nilai inti firma | Must | Done |
| A-04 | CTA konsultasi | Must | Done |

### 5.4 Bidang praktik (`/practice-areas`)

| ID | Requirement | Prioritas | Status |
|----|-------------|-----------|--------|
| P-01 | Menampilkan 8 bidang praktik | Must | Done |
| P-02 | Per bidang: deskripsi, scope, kebutuhan klien, output hukum | Must | Done |
| P-03 | Deep link per bidang (`#id`) | Should | Done |
| P-04 | CTA konsultasi | Must | Done |

### 5.5 Tim (`/team`)

| ID | Requirement | Prioritas | Status |
|----|-------------|-----------|--------|
| T-01 | Profil Managing Partner dengan nama & gelar resmi | Must | Done |
| T-02 | Kredibilitas founder (pendidikan, pengalaman, fokus) | Must | Done* |
| T-03 | Slot struktur tim tanpa nama fiktif | Must | Done |
| T-04 | Nama universitas konkret dari dokumen resmi | Must | Pending konten |

\*Struktur UI selesai; field pendidikan masih generik.

### 5.6 Wawasan (`/insights`)

| ID | Requirement | Prioritas | Status |
|----|-------------|-----------|--------|
| I-01 | Daftar topik dengan status transparan (draf / coming soon) | Must | Done |
| I-02 | Tidak menampilkan artikel sebagai publikasi final jika belum siap | Must | Done |
| I-03 | Halaman detail `/insights/[slug]` | Could | Backlog |
| I-04 | Filter/kategori | Won't (MVP) | — |

### 5.7 Kontak (`/contact`)

| ID | Requirement | Prioritas | Status |
|----|-------------|-----------|--------|
| C-01 | Form: nama, email, telepon opsional, subjek, pesan | Must | Done |
| C-02 | Submit → API → email konfirmasi user + notifikasi admin | Must | Done* |
| C-03 | Validasi server (required, email, panjang pesan) | Must | Done |
| C-04 | Rate limiting anti-spam | Must | Done |
| C-05 | reCAPTCHA v3 di production | Must | Done* |
| C-06 | Saluran email, telepon, WhatsApp di UI | Must | Done* |
| C-07 | Blok penjelasan kerahasiaan | Must | Done |
| C-08 | Link & consent ke kebijakan privasi | Must | Done |
| C-09 | Pesan error & success di UI | Must | Done |
| C-10 | Peta kantor interaktif | Should | Backlog |

\*Bergantung env & nomor resmi (lihat Go-Live).

### 5.8 Privasi (`/privacy`)

| ID | Requirement | Prioritas | Status |
|----|-------------|-----------|--------|
| V-01 | Halaman kebijakan privasi publik | Must | Done |
| V-02 | Menjelaskan data form, penggunaan, keamanan, hak pengguna | Must | Done |
| V-03 | Tautan dari form & footer | Must | Done |

### 5.9 SEO & teknis web

| ID | Requirement | Prioritas | Status |
|----|-------------|-----------|--------|
| S-01 | Metadata unik per halaman | Must | Done |
| S-02 | Sitemap XML | Must | Done |
| S-03 | Robots.txt (block `/api/`) | Must | Done |
| S-04 | Open Graph image | Must | Done |
| S-05 | Favicon | Must | Done |
| S-06 | JSON-LD LegalService | Should | Done |
| S-07 | Analytics | Could | Backlog |

---

## 6. Persyaratan Non-Fungsional

| ID | Kategori | Requirement | Target |
|----|----------|-------------|--------|
| N-01 | Performance | Lighthouse Performance | ≥ 85 |
| N-02 | Accessibility | Lighthouse / axe | ≥ 95; WCAG 2.1 AA fokus utama |
| N-03 | SEO | Lighthouse SEO | ≥ 95 |
| N-04 | Best practices | Lighthouse | ≥ 90 |
| N-05 | Responsif | Mobile-first; touch target memadai | iPhone / Android / tablet |
| N-06 | Keamanan | Secrets di env; validasi server; HTML escape email | Wajib |
| N-07 | Privasi | Halaman privacy + consent form | Wajib sebelum collect PII |
| N-08 | Deliverability | SPF / DKIM / DMARC domain email | Wajib go-live email |
| N-09 | Maintainability | Konten terpusat `data.ts` / `constants.ts` | Wajib |
| N-10 | Availability form | Submit < 5s dalam kondisi normal | Soft SLA |
| N-11 | Rate limit | Maks. 5 submit / menit / IP | Done (in-memory) |
| N-12 | Reduced motion | Hormati `prefers-reduced-motion` | Done |

---

## 7. Aturan Konten & Kepatuhan

| Aturan | Detail |
|--------|--------|
| Tidak ada klaim palsu | Larangan testimonial, penghargaan, riwayat kasus fiktif |
| Disclaimer | Footer menyatakan konten bukan nasihat hukum; hubungan advokat–klien setelah perjanjian tertulis |
| Insights | Status draf / coming-soon harus terlihat; jangan seolah publikasi final |
| Founder | Hanya data yang dapat diverifikasi; jangan mengarang nama universitas |
| Kontak | Nomor & email harus sesuai saluran resmi firma |
| Bahasa | Formal, profesional, tidak bombastis |

---

## 8. Requirements Data & Konfigurasi

| Sumber | Owner | Isi |
|--------|--------|-----|
| `src/lib/constants.ts` | Product + Engineering | Nama situs, URL, tagline, footer legal |
| `src/lib/data.ts` | Product + Firma | Navigasi, praktik, tim, wawasan, `CONTACT_CONFIG` |
| Env vars | DevOps / Admin | Resend, reCAPTCHA, admin email |

**Field blocker go-live pada `CONTACT_CONFIG`:**
- `phone.display` / `phone.tel`
- `whatsapp.number` (format `62…`)

---

## 9. Acceptance Criteria (Go-Live)

Produk dianggap **siap publik** jika:

### Konten
- [ ] Telepon & WhatsApp resmi terisi
- [ ] Email dikonfirmasi admin
- [ ] Disclaimer disetujui legal/MP
- [ ] Tidak ada placeholder `[...]` atau `XXXX` terlihat di UI

### Form
- [ ] Submit form → email user & admin diterima (bukan spam)
- [ ] Invalid input ditolak dengan pesan jelas
- [ ] Rate limit aktif
- [ ] reCAPTCHA aktif di production

### Teknis
- [ ] HTTPS aktif di domain production
- [ ] `/sitemap.xml` & `/robots.txt` accessible
- [ ] OG preview valid
- [ ] `npm run build` sukses
- [ ] Lighthouse memenuhi N-01 s/d N-04 di staging

### Legal / privasi
- [ ] `/privacy` live & tertaut dari form + footer
- [ ] Form menyebut persetujuan kebijakan privasi

Checklist operasional lengkap: [go-live-checklist.md](./go-live-checklist.md)

---

## 10. Roadmap Produk

### Phase A — Launch (seminggu)
1. Isi kontak & env production  
2. Review legal + founder education  
3. Deploy staging → Lighthouse → production DNS  

### Phase B — Post-launch (2–4 minggu)
1. Peta Google Maps  
2. Uji deliverability email & monitoring bounce  
3. Publish 1–2 insights (opsional + detail page)  

### Phase C — Growth (backlog)
1. `/insights/[slug]` + workflow editorial  
2. i18n EN  
3. Analytics privacy-friendly  
4. CI/CD + smoke tests  
5. Rate limit Redis jika multi-instance  

---

## 11. Metrik Sukses (pasca-launch)

| Metrik | Sumber | Target awal (30 hari) |
|--------|--------|------------------------|
| Form submit sukses | Inbox / Resend logs | Baseline → escalate jika 0 setelah traffic |
| Bounce / spam rate email | Resend | < 5% |
| Organic landings | Analytics (jika diaktifkan) | Baseline |
| Lighthouse scores | Staging / prod | Memenuhi NFR |
| Waktu respons lead | Operasional firma | ≤ 1 hari kerja (sesuai salinan UI) |

---

## 12. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Nomor kontak placeholder ikut live | Kehilangan trust & lead | Gate go-live pada checklist B |
| Domain email belum diverifikasi | Email gagal / spam | Verifikasi Resend + SPF/DKIM sebelum iklan |
| Rate limit in-memory reset di multi-instance | Spam lolos | Upstash Redis (Phase C) |
| Klaim konten terlalu agresif dari pihak luar | Risiko etika | Review PRD aturan konten + legal |
| Insights disangka artikel final | Misinformasi | Pertahankan status label sampai publish |

---

## 13. Keputusan Produk (ADR singkat)

| Keputusan | Pilihan | Alasan |
|-----------|---------|--------|
| Stack | Next.js App Router | SSG + API route satu codebase |
| Email | Resend | Setup cepat, cocok MVP Next.js |
| Anti-spam | reCAPTCHA v3 + rate limit | Tanpa UX checkbox |
| Konten | File TypeScript (`data.ts`) | Tanpa CMS; firma kecil |
| Insights detail | Ditunda | Konten belum siap publikasi |
| i18n | Siapkan field, tunda switch | Fokus ID dulu |

---

## 14. Cara Memakai PRD Ini

| Peran | Cara pakai |
|-------|------------|
| **Product / MP** | Validasi scope, konten, acceptance criteria sebelum launch |
| **Engineering** | Acuan Must/Should; cek status vs [current-implementation.md](../current-implementation.md) |
| **Legal** | Review §7 Aturan Konten + disclaimer + privacy |
| **QA** | Turunkan §5 & §9 menjadi test case |
| **AI / agent** | Baca PRD + AGENTS.md sebelum menambah fitur di luar scope |

**Aturan perubahan:**
1. Fitur baru Must → update §5 + acceptance + changelog  
2. Perubahan out-of-scope → update §3.2 dengan alasan  
3. Setelah rilis major → bump versi dokumen & sync `current-implementation.md`

---

## 15. Glosarium

| Istilah | Arti |
|---------|------|
| Lead | Permintaan konsultasi dari form / WhatsApp |
| Deep link | URL dengan hash ke section bidang (`#litigation`) |
| Data-driven | Konten dari file data, bukan hardcode UI |
| Go-live readiness | Kode siap; konten/env/admin masih mengunci publikasi |
| MP | Managing Partner |

---

*PRD ini adalah sumber kebenaran produk. Implementasi aktual dicatat terpisah di `current-implementation.md`. Jika ada konflik, selesaikan di level produk lalu sync kedua dokumen.*

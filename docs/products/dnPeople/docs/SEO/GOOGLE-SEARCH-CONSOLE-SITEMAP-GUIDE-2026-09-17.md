---
owner: Dozer
status: ready-to-run
last_reviewed: 2026-09-17
scope: dnpeople.id
---

# Panduan Google Search Console dan `sitemap.xml` dnPeople

Panduan ini menjelaskan cara mendaftarkan `dnpeople.id` ke Google Search Console (GSC), memastikan `sitemap.xml` dapat dibaca Google, mengirimkannya, lalu memantau apakah URL penting benar-benar diproses dan diindeks.

## Ringkasan keputusan

- Property utama yang direkomendasikan: **Domain property `dnpeople.id`**. Ini mencakup variasi HTTP/HTTPS dan subdomain.
- Sitemap utama: `https://dnpeople.id/sitemap.xml`.
- `robots.txt` harus tetap dapat diakses di `https://dnpeople.id/robots.txt` dan memuat referensi sitemap.
- Sitemap hanya berisi URL publik yang memang ingin muncul di Google, memakai URL absolut, HTTPS, host canonical, dan status HTTP sukses.
- Status `Success` pada laporan Sitemaps berarti file berhasil dibaca; itu **bukan** berarti semua URL di dalamnya sudah terindeks.
- Untuk halaman baru atau perubahan penting, gunakan sitemap dan URL Inspection; jangan meminta indexing satu per satu sebagai workflow utama.

## 1. Kondisi implementasi lokal saat ini

Source of truth berada di:

- [`frontend/src/app/sitemap.ts`](../../frontend/src/app/sitemap.ts)
- [`frontend/src/app/robots.ts`](../../frontend/src/app/robots.ts)

Sitemap saat ini menghasilkan URL berikut:

```text
/welcome
/branch-operations
/payroll-confidence
/people-evidence
/pricing
/docs
/docs/sso-setup-guide
/faq
/demo
/contact
/about
/blog
/careers
/legal/privacy
/legal/terms
/legal/dpa
/signup
```

`robots.ts` sudah mengizinkan root publik dan memblokir area aplikasi seperti `/dashboard`, `/api/`, `/settings/`, `/payroll/`, dan `/employees/`, serta menunjuk ke `${SITE_URL}/sitemap.xml`.

### Gate sebelum submit

Jangan submit sitemap ke GSC sebelum semua pemeriksaan ini lolos di production:

```bash
curl -I https://dnpeople.id/sitemap.xml
curl -fsS https://dnpeople.id/sitemap.xml
curl -I https://dnpeople.id/robots.txt
curl -fsS https://dnpeople.id/robots.txt
```

Expected minimum:

- `sitemap.xml`: HTTP `200`, XML valid, `Content-Type` XML, tidak meminta login.
- `robots.txt`: HTTP `200`, berisi `Sitemap: https://dnpeople.id/sitemap.xml`.
- Setiap URL sitemap: HTTPS, host `dnpeople.id`, tidak redirect, tidak `noindex`, tidak diblokir robots, dan memiliki canonical ke dirinya sendiri atau canonical yang memang disengaja.

Jika domain belum live atau DNS belum mengarah ke deployment final, **jangan** submit URL staging/preview. Sitemap harus memakai host yang benar-benar akan menjadi canonical.

## 2. Membuat dan memverifikasi property GSC

1. Buka [Google Search Console](https://search.google.com/search-console).
2. Pilih **Add property**.
3. Gunakan **Domain** dan masukkan `dnpeople.id` tanpa `https://`, path, atau `/`.
4. Tambahkan TXT record verifikasi yang diberikan Google ke DNS domain.
5. Tunggu propagasi DNS, lalu klik **Verify**.
6. Pastikan tim yang mengelola SEO memiliki akses Owner/Full sesuai kebutuhan, bukan hanya akses terbatas.

Domain property lebih aman untuk pemantauan jangka panjang. Jika sementara memakai URL-prefix, tambahkan property yang tepat untuk `https://dnpeople.id/`; jangan tertukar dengan `http://`, `www`, atau domain preview.

## 3. Submit `sitemap.xml`

1. Pilih property `dnpeople.id` yang benar.
2. Buka **Indexing → Sitemaps**.
3. Pada **Add a new sitemap**, masukkan hanya:

   ```text
   sitemap.xml
   ```

4. Klik **Submit**.
5. Buka baris sitemap yang baru dibuat.
6. Catat tanggal **Last read**, **Status**, dan error parsing jika ada.

Google menyarankan sitemap di root domain. Mengirim sitemap di GSC tidak mengunggah file ke Google; kita hanya memberi tahu lokasi file yang sudah tersedia di server.

### Status yang diharapkan

| Status | Arti | Tindakan |
|---|---|---|
| Success | File berhasil diambil dan diproses | Lanjutkan ke Page indexing dan URL Inspection |
| Has errors | File terbaca tetapi ada URL/format yang bermasalah | Buka detail error, perbaiki source/deployment, lalu submit ulang |
| Couldn't fetch | Google tidak dapat mengambil file | Cek DNS, HTTPS, WAF/CDN, response status, redirect, dan login |
| Pending/processing | Belum selesai diproses | Tunggu, lalu cek kembali; jangan membuat sitemap duplikat |

## 4. Cara membaca hasil sitemap dengan benar

Ada tiga metrik berbeda:

1. **Sitemap fetched/read** — Google dapat mengambil dan membaca XML.
2. **URL discovered/submitted** — Google menemukan URL melalui sitemap.
3. **URL indexed** — Google memilih URL tersebut untuk masuk indeks.

Jumlah URL submitted tidak harus sama dengan jumlah URL indexed. Google dapat menunda crawling, memilih canonical lain, menilai halaman sebagai duplikat, atau menolak indexing karena kualitas/technical issue.

Setelah sitemap berstatus Success:

- buka **Indexing → Pages**;
- gunakan filter sitemap untuk membandingkan URL submitted dengan URL indexed/not indexed;
- buka **URL Inspection** untuk `/welcome`, tiga pillar page, `/pricing`, `/demo`, dan `/contact`;
- klik **Test live URL**;
- pastikan URL dapat di-crawl, indexing diizinkan, dan Google-selected canonical sesuai;
- setelah perubahan penting, klik **Request indexing** hanya untuk URL prioritas.

## 5. Checklist kualitas URL di sitemap

Sebuah URL boleh masuk sitemap jika semua jawaban berikut “ya”:

- Apakah ini halaman publik dan bernilai bagi pencari?
- Apakah URL memakai HTTPS dan host canonical `dnpeople.id`?
- Apakah URL mengembalikan halaman utama dengan HTTP `200`, bukan redirect, error, atau soft 404?
- Apakah halaman tidak memiliki `noindex`?
- Apakah robots.txt tidak memblokir crawling halaman?
- Apakah halaman memiliki canonical yang konsisten?
- Apakah kontennya cukup unik dibanding URL lain?
- Apakah kita benar-benar ingin halaman ini ditemukan dari Google?

Jangan memasukkan dashboard, API, halaman hasil filter, URL dengan parameter tracking, halaman preview, atau halaman tipis yang tidak punya search intent jelas. Sitemap bukan daftar semua route aplikasi; sitemap adalah daftar URL publik yang kita rekomendasikan kepada Google.

## 6. Troubleshooting utama

### `Couldn't fetch`

Periksa secara berurutan:

1. DNS domain dan deployment production.
2. HTTPS certificate dan redirect host.
3. `https://dnpeople.id/sitemap.xml` dari jaringan publik.
4. WAF/CDN/bot protection yang mungkin memblokir Googlebot.
5. Apakah response meminta cookie, Basic Auth, atau login.
6. Apakah XML valid dan tidak terpotong.

### “Sitemap can be read” tetapi ada error URL

Periksa URL yang dilaporkan satu per satu. Penyebab umum: URL `http`, host preview, redirect, `noindex`, canonical berbeda, atau route yang menghasilkan 404. Hapus URL yang tidak layak dari generator atau perbaiki route-nya.

### URL discovered tetapi tidak indexed

Jangan menganggap ini otomatis masalah sitemap. Gunakan URL Inspection untuk membedakan:

- diblokir robots;
- `noindex`;
- duplicate / Google memilih canonical lain;
- crawled tetapi belum diindeks;
- discovered tetapi belum dicrawl;
- soft 404 atau kualitas halaman rendah.

Perbaiki penyebabnya, pastikan internal link dan canonical benar, deploy, lalu minta validasi/indexing untuk URL prioritas.

### Google memilih canonical yang berbeda

Pastikan URL yang ada di sitemap sama dengan canonical, internal link, redirect, dan host HTTPS yang dipilih. Sitemap hanya sinyal canonical yang relatif lemah; redirect dan `rel="canonical"` biasanya lebih kuat.

### Sitemap kosong atau URL salah host

Generator mengambil host dari `NEXT_PUBLIC_SITE_URL`, dengan fallback `https://dnpeople.id`. Di production, set environment variable ini secara eksplisit ke:

```text
NEXT_PUBLIC_SITE_URL=https://dnpeople.id
```

Lakukan smoke test setelah deployment karena sitemap dihasilkan runtime.

## 7. Workflow setiap deployment SEO

### Setelah publish halaman baru

1. Pastikan route masuk generator sitemap hanya jika sudah publik dan siap diindeks.
2. Pastikan title, meta description, H1, canonical, internal link, dan status HTTP benar.
3. Deploy ke production.
4. Buka sitemap dan robots.txt secara publik.
5. Submit ulang sitemap hanya bila sitemap berubah signifikan atau ada error; tidak perlu submit setiap hari.
6. Inspect URL prioritas dan request indexing bila relevan.
7. Pantau Page indexing dan Performance setelah Google memprosesnya.

### Setelah menghapus atau memindahkan halaman

- Hapus URL dari sitemap.
- Gunakan `301` ke halaman pengganti yang relevan, atau `404/410` jika memang dihapus tanpa pengganti.
- Jangan menggunakan `noindex` sebagai pengganti redirect untuk URL yang sudah punya pengganti jelas.
- Cek kembali canonical dan internal links.

## 8. Monitoring mingguan

Catat di spreadsheet atau issue SEO:

| Item | Target |
|---|---|
| Sitemap status | `Success` |
| Last read | Tidak terlalu lama setelah deploy |
| Parsing errors | 0 |
| URL prioritas submitted | 100% |
| URL prioritas indexed | Dipantau per halaman, bukan diasumsikan 100% |
| Canonical mismatch | 0 untuk halaman utama |
| Blocked/noindex pada halaman publik | 0 |
| Coverage issue baru | Ditriase berdasarkan impact |
| Search performance | Impression, click, CTR, position per intent |

Jangan memakai jumlah indexed sebagai satu-satunya KPI. Untuk dnPeople, KPI SEO yang lebih dekat ke bisnis adalah qualified workflow-audit request dari halaman yang relevan.

## 9. Acceptance criteria dnPeople

- [ ] Domain property `dnpeople.id` verified di GSC.
- [ ] `https://dnpeople.id/sitemap.xml` dapat dibuka publik dengan HTTP `200`.
- [ ] `https://dnpeople.id/robots.txt` dapat dibuka publik dan menunjuk ke sitemap canonical.
- [ ] Semua URL sitemap memakai HTTPS + host canonical.
- [ ] Tidak ada dashboard/API/preview/parameter tracking di sitemap.
- [ ] Sitemap berstatus `Success` di property yang benar.
- [ ] `/welcome`, `/branch-operations`, `/payroll-confidence`, `/people-evidence`, `/pricing`, `/demo`, dan `/contact` sudah diuji dengan URL Inspection.
- [ ] Canonical halaman prioritas konsisten dengan URL sitemap.
- [ ] Tidak ada `noindex` atau robots block yang tidak disengaja.
- [ ] Setiap deployment yang mengubah route/content menjalankan sitemap smoke test.

## Sumber resmi

- [Build and submit a sitemap — Google Search Central](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Sitemaps report — Search Console Help](https://support.google.com/webmasters/answer/7451001)
- [URL Inspection tool — Search Console Help](https://support.google.com/webmasters/answer/9012289)
- [Page indexing report — Search Console Help](https://support.google.com/webmasters/answer/7440203)
- [Canonicalization — Google Search Central](https://developers.google.com/search/docs/crawling-indexing/canonicalization)
- [How to specify a canonical URL — Google Search Central](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)

*Author: Dozer · 2026-09-17 · dnPeople*

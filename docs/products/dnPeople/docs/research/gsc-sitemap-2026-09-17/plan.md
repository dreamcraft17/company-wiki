# Research Plan — Google Search Console dan Sitemap dnPeople

## Decision

Menyusun panduan yang dapat dijalankan tim untuk mendaftarkan dnPeople ke Google Search Console, submit `sitemap.xml`, dan membedakan sitemap processing dari indexing.

## Scope

- Property dan verifikasi GSC.
- Format, lokasi, isi, dan submission sitemap.
- `robots.txt`, canonical, URL Inspection, dan Page indexing.
- Audit source lokal dnPeople `sitemap.ts` dan `robots.ts`.
- Tidak termasuk setup DNS provider atau akses akun Google milik perusahaan.

## Falsifiable hypotheses

1. Sitemap production dnPeople dapat dibaca Google jika host, HTTPS, response, dan XML valid.
2. Risiko terbesar bukan submission, melainkan URL non-canonical, route non-indexable, atau endpoint production yang tidak bisa diambil Googlebot.
3. Tim dapat mengurangi kesalahan operasional dengan checklist post-deploy dan monitoring mingguan.

## Sourcing strategy

- Google Search Central untuk sitemap, canonical, dan URL crawling.
- Google Search Console Help untuk prosedur submission dan interpretation of reports.
- Source repository untuk kondisi implementasi lokal.

## Opposition queries

- Apakah sitemap menjamin indexing? Tidak; sitemap adalah hint.
- Apakah semua route publik harus masuk sitemap? Tidak; hanya URL yang ingin muncul di hasil pencarian.
- Apakah submit ulang setiap deployment diperlukan? Tidak selalu; gunakan monitoring dan submit bila ada perubahan/error yang relevan.

## Stop criteria

- Minimal tiga halaman Google resmi mendukung prosedur utama.
- Source lokal sudah diaudit.
- Panduan memiliki troubleshooting dan acceptance criteria.
- Keterbatasan live verification terdokumentasi jika endpoint tidak dapat diakses dari environment.

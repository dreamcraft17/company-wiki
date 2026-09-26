# Finding F2 — dnPeople sudah punya fondasi yang tepat

## Evidence from repository

- Frontend: `/assistant` sudah tersedia dengan prompt awal untuk cuti, slip gaji, absensi, ajukan cuti, dan pembayaran invoice.
- Backend: `POST /assistant/ask` memakai auth dan `featureAccess('ai:assistant')`.
- Router memisahkan fakta HR, how-to, dan policy.
- Fakta memakai Prisma tools dengan scope session; how-to/policy memakai FAQ/policy retrieval.
- Jawaban mengembalikan citations dan setiap ask dicatat ke `AuditLog`.
- LLM opsional; ada rule-based fallback ketika provider tidak tersedia.
- Feature catalog mencatat assistant sebagai Professional+, dengan rollout dan quota yang tetap dapat dikontrol.

## Gaps yang memengaruhi klaim

- PRD v17 masih `review-required` dan `canonical: false`; belum menjadi source of truth produk.
- Belum ada baseline usage, helpfulness, containment, cost per answer, atau precision retrieval dari produksi.
- UI saat ini mengungkap `mode` internal; itu bukan value untuk pelanggan dan sebaiknya tidak dijadikan copy utama.
- FAQ masih perlu audit product truth menyeluruh; jawaban pembayaran invoice sudah disinkronkan ke DOKU.
- Feedback thumbs up/down dan dashboard kualitas belum tersedia sebelum implementasi ini.

## Kesimpulan

Secara teknis dnPeople sudah cukup untuk **beta terukur**. Belum cukup untuk klaim “AI HR paling pintar” atau jaminan jawaban tanpa salah.

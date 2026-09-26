# Finding F3 — batas produk yang aman

## Masuk beta

- Fakta self-service: saldo cuti, status absensi, slip gaji sendiri.
- How-to: cara memakai fitur dnPeople.
- Policy tenant: SOP perusahaan dengan judul/sumber dan tanggal pembaruan.
- HR read-only: ringkasan headcount atau kontrak sesuai role.
- Deep-link ke halaman aplikasi untuk melanjutkan proses secara eksplisit.

## Jangan masuk v1

- Menampilkan gaji atau data pribadi karyawan lain.
- Menilai, meranking, memprediksi, atau merekomendasikan tindakan terhadap karyawan.
- Mengirim, menyetujui, mengubah payroll/cuti/absensi tanpa konfirmasi dan audit yang kuat.
- Browsing web sebagai sumber jawaban HR tenant.
- Menyebut angka tanpa sumber DB atau policy yang dapat ditelusuri.

## Required guardrails

- Scope query selalu berasal dari session: company, user, role, dan employeeId.
- Redact NIK, rekening, token, dan PII yang tidak dibutuhkan sebelum provider call.
- Policy text dianggap data tidak tepercaya: tahan prompt injection dan jangan izinkan policy mengubah instruksi sistem.
- Timeout provider, circuit breaker, fallback deterministik, rate limit, quota per company, dan audit event.
- Sediakan kill switch untuk LLM synthesis; rule-based answer tetap dapat berjalan.

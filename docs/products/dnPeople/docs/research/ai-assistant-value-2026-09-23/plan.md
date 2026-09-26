# Research plan — AI Assistant dnPeople

**Tanggal:** 23 September 2026  
**Pertanyaan keputusan:** Apakah AI Assistant layak dijadikan nilai jual dnPeople, dan apa scope yang aman untuk soft launch?

## Hipotesis

1. AI Assistant hanya bernilai jika mengurangi waktu mencari jawaban HR atau mengurangi tiket berulang; chat generik tidak cukup.
2. Kelebihan dnPeople dapat dibangun dari konteks HR Indonesia, data tenant yang live, kebijakan perusahaan, batas akses per role, sitasi, dan fallback deterministik.
3. Risiko terbesar bukan kemampuan model, tetapi jawaban HR yang salah, kebocoran data lintas karyawan/tenant, prompt injection dari kebijakan, dan klaim marketing yang lebih besar daripada bukti.

## Pertanyaan riset

- Use case apa yang sudah dibeli/didorong oleh platform HR mapan?
- Apakah AI menjadi alasan pembelian atau hanya lapisan di atas workflow HR?
- Segmen awal mana yang punya pain paling sering dan scope paling aman?
- Bukti teknis apa yang sudah ada di dnPeople dan gap apa yang menghalangi klaim komersial?

## Metode

- Desk research dari halaman resmi vendor dan sumber standar keamanan/AI.
- Audit kode dan dokumen dnPeople pada route, service, UI, feature gate, dan PRD assistant.
- Penilaian segmen dengan kriteria B2B SaaS: urgency, willingness to pay, reachability, growth, dan fit.
- Rekomendasi dipisah menjadi **evidence**, **inference**, dan **proposal**.

## Batasan

Belum ada data usage produksi, baseline tiket HR, feedback pelanggan, atau willingness-to-pay interview. Karena itu keputusan yang dihasilkan adalah **GO untuk beta terukur**, bukan bukti bahwa AI sudah menjadi alasan pembelian.

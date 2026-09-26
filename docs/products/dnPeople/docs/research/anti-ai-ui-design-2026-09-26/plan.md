# dnPeople anti-AI-sleek UI research plan

Generated: 2026-09-26  
Question: bagaimana membuat dnPeople terasa dibuat oleh tim produk yang memahami kerja HR, bukan template AI SaaS atau nostalgia retro yang ditempelkan?

## Decision to support

Menentukan arah visual dan interaction system untuk marketing surface `/welcome` serta UI aplikasi yang paling terlihat pengguna baru. Hasil harus bisa diterjemahkan menjadi token, komponen, dan acceptance criteria; bukan sekadar moodboard.

## Falsifiable hypotheses

1. Kesan AI slop terutama muncul dari sameness: dark navy/indigo hero, gradient/blob dekoratif, kartu seragam, radius besar, dan copy generik—bukan karena penggunaan warna modern itu sendiri.
2. Pola “old-school” yang layak dipinjam adalah affordance dan information density yang jelas: border, tab, status, table/ledger, form labels, dan state feedback—bukan bevel/texture dekoratif tanpa fungsi.
3. Untuk HRIS, desain yang terasa lebih manusiawi akan datang dari workflow evidence yang spesifik dnPeople: payroll review, exception trail, branch context, approval states, dan tanggal/aktor nyata; bukan ilustrasi abstrak.
4. Mengurangi dekorasi dan memperjelas hierarchy akan meningkatkan trust, tetapi flatness ekstrem dapat menurunkan discoverability jika signifier interaksi dihilangkan.

## Scope

- In scope: landing/welcome surface, product proof, pricing, CTA, core dashboard surfaces, shared tokens, cards/tables/statuses.
- Out of scope: perubahan business logic, package entitlements, payroll calculation, database schema, dan full rebrand.
- Audience: HR/admin perusahaan Indonesia, terutama operator yang memakai software setiap hari; bukan designer audience.

## Source strategy

- Primary/standards: Material Design, Apple HIG.
- Usability research: Nielsen Norman Group on enterprise usability, clickability, flat design, and minimalism.
- Historical/industry context: ACM longitudinal web-pattern research and Creative Bloq history/trend coverage.
- Critical discourse: Built In analysis of AI design slop and arXiv qualitative study; treat these as directional, not as usability proof.

## Opposition queries

- Apakah skeuomorphic/retro detail benar-benar membantu task, atau hanya nostalgia?
- Apakah menghapus gradient/card/shadow akan membuat HRIS lebih sulit dipindai?
- Apakah “anti-AI” dapat menjadi gimmick baru yang sama generiknya?
- Apakah desain yang lebih padat tetap aman untuk mobile dan WCAG AA?

## Stop criteria

- Jangan mengubah UI menjadi literal Windows 95/Y2K.
- Jangan menambah texture, bevel, animasi, atau ornament jika tidak memperjelas hierarchy, state, atau action.
- Jangan menyebut tren sebagai fakta usability tanpa sumber usability.
- Implementasi awal harus bisa diuji lewat screenshot diff, typecheck, dan a11y/contrast review.


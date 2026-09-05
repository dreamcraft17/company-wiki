# dnShop Finance v2.1 — Design Document
## Design System + Screen Specifications

**Document:** Design PRD / SRS / SDD v2.1  
**Date:** 5 Agustus 2026 · **Status:** **Implemented** (UI2 ops desk di frontend — 6 Agustus 2026)  
**Owner:** Dozer (CEO + Tech Lead), DN Tech  
**Scope:** Design system baseline + spec layar (wizard, tier upsell, observability, onboarding)  
**Audience:** Developer yang implement + siapapun yang review visual direction  
**Living:** [`docs/STATUS.md`](../../docs/STATUS.md) · [`docs/docs.md`](../../docs/docs.md)

---

## Bagian 1 — Design Foundation

### 1.1 Karakter produk

dnShop Finance bukan SaaS keuangan generic dengan biru muda dan rounded card. Ini adalah **ops desk** — alat kerja seorang seller yang serius. Analogi terdekat: control room, bukan bank mobile. Interface harus terasa **fungsional, padat, dan tepercaya** — tapi tidak kaku sampai terasa seperti SAP.

Tiga kata yang menjadi jangkar setiap keputusan visual:

> **Dense. Sharp. Live.**

- **Dense** — layar padat informasi. Tidak banyak whitespace kosong. Seller datang untuk melihat angka, bukan foto produk.
- **Sharp** — sudut tajam, tipografi presisi, warna fungsional. Panel bukan card bulat.
- **Live** — data real-time, badge status, indikator sync. Terasa seperti dashboard yang bernapas.

---

### 1.2 Token sistem (Design Tokens)

#### Warna

```
Palette:
  background:
    base:    #0D0F12   (near-black — canvas utama)
    surface: #141720   (panel, sidebar)
    raised:  #1C2030   (card, modal, input area)
    overlay: #252A3A   (hover, selected)

  signal-orange:
    default: #F47C2B   (aksen primer — CTA, icon aktif, progress)
    dim:     #7A3E16   (badge background, disabled CTA text)
    mute:    #2A1A0A   (hover state latar on dark)

  status:
    green:   #2ECC71   (sukses, connected, verified)
    yellow:  #F1C40F   (warning, pending, near-limit)
    red:     #E74C3C   (error, failed, quota exceeded)
    blue:    #3498DB   (info, in-progress)

  text:
    primary:   #F0F2F5   (heading, label)
    secondary: #8A9BB5   (body, subtitle, helper)
    muted:     #4A5568   (placeholder, disabled)
    inverse:   #0D0F12   (text on signal orange background)

  border:
    default: #252A3A   (border panel, input)
    focus:   #F47C2B   (focus ring — signal orange)
    subtle:  #1C2030   (divider ringan)

  tier:
    free:       #4A5568   (abu — locked)
    starter:    #3498DB   (biru — growth)
    pro:        #F47C2B   (orange — premium)
    enterprise: #9B59B6   (ungu — top tier)
```

**Catatan penggunaan:**
- `background.base` selalu jadi background body — jangan pernah pakai white/cream di prod
- Signal orange **hanya** untuk aksi penting dan elemen aktif — jangan oranye di semua tempat
- Status color hanya untuk state komunikasi (sukses/error) — bukan dekorasi
- Tier colors digunakan di badge, bukan di seluruh layout

---

#### Tipografi

```
Font Stack:
  display:  "Syne", sans-serif
  body:     "IBM Plex Sans", sans-serif
  mono:     "IBM Plex Mono", monospace   ← untuk angka, kode, nilai IDR

Skala:
  --text-xs:   11px / 1.4  / Syne atau IBM Plex, weight 500
  --text-sm:   13px / 1.5  / IBM Plex, weight 400
  --text-base: 15px / 1.6  / IBM Plex, weight 400
  --text-lg:   18px / 1.5  / IBM Plex atau Syne, weight 500
  --text-xl:   22px / 1.3  / Syne, weight 600
  --text-2xl:  28px / 1.2  / Syne, weight 700
  --text-3xl:  36px / 1.1  / Syne, weight 700

Mono stack (angka keuangan):
  IDR amount:  IBM Plex Mono, 500–600, letter-spacing: -0.02em
  Percentage:  IBM Plex Mono, 400
  Code/ID:     IBM Plex Mono, 400, text-muted
```

**Aturan tipografi:**
- Heading section: **Syne** (karakter, kuat tapi bukan display berlebihan)
- Body text, label, input: **IBM Plex Sans** (legible di layar kecil, padat informasi)
- Angka IDR dan persentase: **IBM Plex Mono** (alignment presisi, tidak ada kerning aneh)
- Jangan mix banyak weight — pilih 3 max per halaman: 400, 500/600, 700

---

#### Spacing

```
Base unit: 4px

Skala:
  --space-1:   4px
  --space-2:   8px
  --space-3:  12px
  --space-4:  16px
  --space-5:  20px
  --space-6:  24px
  --space-8:  32px
  --space-10: 40px
  --space-12: 48px
  --space-16: 64px

Padding panel:    16px (default)
Padding card:     20px
Gap antar item:   8px–12px
Gap antar section: 32px–48px
```

---

#### Border & Shape

```
Border radius:
  --radius-none: 0px    ← panel utama, tabel
  --radius-sm:   2px    ← badge, tag
  --radius-md:   4px    ← input, button
  --radius-lg:   8px    ← modal, wizard card

Border width:
  --border-thin:   1px  (default)
  --border-medium: 2px  (focus, active)

Box shadow:
  --shadow-panel:  0 1px 3px rgba(0,0,0,0.4)
  --shadow-modal:  0 8px 32px rgba(0,0,0,0.6)
  --shadow-focus:  0 0 0 2px #F47C2B  (focus ring)
```

**Filosofi shape:** Sudut tajam (`border-radius: 0`) di panel besar, sedikit radius di komponen kecil (badge, input, button). Ini yang membuat ops desk terasa beda dari SaaS card-heavy.

---

### 1.3 Komponen dasar

#### Button

```
Variant:
  primary   — bg: signal-orange, text: inverse, radius: 4px
  secondary — bg: raised, border: border-default, text: primary, radius: 4px
  ghost     — bg: transparent, text: secondary, hover: overlay
  danger    — bg: red, text: white, radius: 4px

Size:
  sm  — h: 32px, px: 12px, text: 13px
  md  — h: 40px, px: 16px, text: 15px  (default)
  lg  — h: 48px, px: 24px, text: 16px

State:
  default, hover (+10% lightness bg), active (-5%), disabled (opacity 0.4)
  loading: spinner 16px, text hidden, width unchanged

Rules:
  - Primary: max 1 per view — satu aksi dominan per layar
  - Danger: selalu require confirm dialog, tidak standalone
  - Jangan disable primary sebelum user interact
```

#### Input & Form

```
Input field:
  bg: background.raised
  border: 1px solid border.default
  border-focus: 1px solid signal-orange + shadow-focus
  text: text.primary
  placeholder: text.muted
  height: 40px (md), 36px (sm)
  padding: 0 12px
  radius: 4px
  font: IBM Plex Sans 15px

Label:
  font: IBM Plex Sans 13px, weight 500
  color: text.secondary
  margin-bottom: 6px

Helper text:
  font: IBM Plex Sans 12px
  color: text.muted (neutral) / status.red (error) / status.yellow (warning)
  margin-top: 4px

Form group spacing: 20px gap antar field
```

#### Badge / Tag

```
Tier badge:
  font: IBM Plex Sans 11px, weight 600, uppercase, letter-spacing: 0.06em
  padding: 2px 8px
  radius: 2px

  free:       bg #1C2030, text #4A5568
  starter:    bg #0A1929, text #3498DB, border 1px #3498DB30
  pro:        bg #1A0F04, text #F47C2B, border 1px #F47C2B30
  enterprise: bg #160D1E, text #9B59B6, border 1px #9B59B630

Status badge:
  draft:    bg #252A3A, text #8A9BB5
  pending:  bg #1A1508, text #F1C40F
  posted:   bg #0A1E11, text #2ECC71
  failed:   bg #1E0A0A, text #E74C3C
```

#### Panel / Card

```
Panel (primary container):
  bg: surface (#141720)
  border: 1px solid border.default
  border-radius: 0
  padding: 16px–24px

Card (secondary, nested):
  bg: raised (#1C2030)
  border: 1px solid border.subtle
  border-radius: 4px
  padding: 16px–20px

Panel header:
  border-bottom: 1px solid border.default
  padding-bottom: 12px
  margin-bottom: 16px
  title: Syne 15px 600 text-primary
  subtitle: IBM Plex 13px text-secondary (optional)
```

#### Table

```
Table:
  border-collapse: collapse
  width: 100%

Header:
  font: IBM Plex Sans 12px, weight 600, uppercase, letter-spacing 0.05em
  color: text.muted
  border-bottom: 1px solid border.default
  padding: 8px 12px

Row:
  border-bottom: 1px solid border.subtle
  padding: 12px
  font: IBM Plex Sans 14px, color text.primary
  hover: bg overlay

  Amount columns: IBM Plex Mono, text-right
  Status columns: status badge, centered
  Date columns: IBM Plex Mono 13px, text.secondary
```

#### Toast / Notification

```
Toast:
  position: fixed, top-right, z-index 9999
  bg: raised
  border-left: 3px solid [status color]
  padding: 12px 16px
  radius: 4px
  shadow: shadow-modal
  max-width: 360px
  auto-dismiss: 4s (success/info), 8s (error — perlu action)

Content:
  title: IBM Plex 14px 600
  message: IBM Plex 13px text.secondary

Stack: max 3 toast sekaligus, newest on top
```

---

### 1.4 Layout & grid

```
Shell layout:
  ┌─────────────────────────────────────────────────────┐
  │ Topbar (56px high, bg: surface)                     │
  │ Logo · Breadcrumb · UserMenu · Tier badge           │
  ├──────────┬──────────────────────────────────────────┤
  │ Sidebar  │ Main content area                        │
  │ 240px    │ flex-1, padding: 24px                    │
  │          │ max-width: 1280px (centered)             │
  │ Nav item │                                          │
  │ Nav item │                                          │
  │ Nav item │                                          │
  │ ...      │                                          │
  │          │                                          │
  │ Tier CTA │                                          │
  └──────────┴──────────────────────────────────────────┘

Sidebar nav item:
  height: 40px
  padding: 0 16px
  font: IBM Plex 14px
  color: text.secondary
  active: color text.primary, border-left 2px signal-orange, bg overlay

Main content columns:
  1-col: full width (tables, list views)
  2-col: 60/40 split (detail + sidebar info)
  3-col: 33/33/33 (KPI cards)
  grid-gap: 16px–24px
```

---

## Bagian 2 — Screen Specifications (v2.1 New Screens)

> Setiap screen: tujuan, layout ASCII, component inventory, copy spec, state spec, edge case.

---

### Screen 2.1 — Pembukuan Wizard

**Tujuan:** Setup pembukuan first-time — dari nol ke GL siap review dalam 5 menit.  
**Trigger:** User pertama kali akses `/journal` dengan `onboarded_at = null`.  
**Pattern:** Full-screen overlay (bukan modal kecil) — ini adalah experience, bukan dialog.

#### Layout keseluruhan

```
┌─────────────────────────────────────────────────────────────────┐
│ bg: background.base (full screen, di atas shell)                │
│                                                                 │
│  ┌───────────────────────────────────────┐                     │
│  │ WIZARD CARD (max-w 560px, centered)   │                     │
│  │ bg: raised, border: border.default    │                     │
│  │ border-radius: 8px                    │                     │
│  │ padding: 40px                         │                     │
│  │                                       │                     │
│  │  [STEP INDICATOR]                     │                     │
│  │                                       │                     │
│  │  [STEP CONTENT — varies per step]     │                     │
│  │                                       │                     │
│  │  [FOOTER: Back · Next / Skip]         │                     │
│  │                                       │                     │
│  └───────────────────────────────────────┘                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Step indicator

```
[Step 1/5 ●○○○○ "Selamat datang"]

Komponen:
  - "Step 1/5" — IBM Plex Mono 12px, text.muted
  - Dot progress: ● filled = done/current, ○ = upcoming
    dot size: 8px, gap: 6px, color orange (done), secondary (upcoming)
  - Step label: IBM Plex 13px, text.secondary
  - Posisi: top wizard card, sebelum konten utama
```

---

#### Step 1 — Welcome

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Step 1/5  ●○○○○  Selamat datang                  │
│                                                     │
│  [Icon: BarChart2, 40px, signal-orange]             │
│                                                     │
│  Pembukuan yang                            (Syne)   │
│  tidak bikin ribet.                        (Syne)   │
│  (text-2xl, 700, text-primary)                      │
│                                                     │
│  Catat penjualan Shopee otomatis, lihat      (IBM)  │
│  untung-rugi real-time, siap lapor pajak.    (IBM)  │
│  (text-base, text.secondary)                        │
│                                                     │
│  ┌──────────────────────────────────────────┐       │
│  │ ✓  Jurnal otomatis dari Shopee           │       │
│  │ ✓  Laporan P&L & Balance Sheet           │       │
│  │ ✓  Audit trail untuk pajak               │       │
│  └──────────────────────────────────────────┘       │
│  (card raised, list: IBM Plex 14px, check: green)   │
│                                                     │
│                                                     │
│  [Mulai Setup →]            [Lewati, nanti saja]    │
│   (button primary, lg)      (button ghost, sm)      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Copy notes:**
- Heading: tidak ada kata "Selamat datang di fitur kami" — langsung ke value
- CTA primer: "Mulai Setup" bukan "Lanjut" — spesifik ke aksi
- Skip: "Lewati, nanti saja" — tidak menghukum user yang mau skip

---

#### Step 2 — Pilih Template Chart of Accounts

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Step 2/5  ●●○○○  Pilih template akun              │
│                                                     │
│  Dari mana kita mulai?              (Syne, text-xl) │
│  Pilih template yang cocok untuk bisnis Anda.       │
│  (IBM Plex, text-sm, text.secondary)                │
│                                                     │
│  ┌────────────────────────────────────────────┐     │
│  │ ● SAK EMKM   (radio selected, border-     │     │
│  │               orange, bg mute-orange)      │     │
│  │   45 akun standar Indonesia                │     │
│  │   Cocok untuk: Toko, Jasa, Reseller       │     │
│  │                                            │     │
│  │   Preview akun:                            │     │
│  │   1-1000 Kas & Bank · 2-1000 Utang        │     │
│  │   3-1000 Modal · 4-1000 Pendapatan        │     │
│  │   (text-xs, mono, text.muted, collapsible) │     │
│  └────────────────────────────────────────────┘     │
│                                                     │
│  ┌────────────────────────────────────────────┐     │
│  │ ○ Custom Lite                              │     │
│  │   10 akun dasar saja                       │     │
│  │   Cocok untuk: Seller baru / coba dulu    │     │
│  └────────────────────────────────────────────┘     │
│                                                     │
│  [← Kembali]                    [Pakai Template →]  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**State & interaction:**
- Default selected: SAK EMKM
- Radio card: full card clickable (bukan hanya dot)
- Preview akun: collapsed by default, expand on click `Lihat semua akun ↓`
- Next button text: "Pakai Template" (bukan "Lanjut") — konkret

---

#### Step 3 — Konfigurasi

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Step 3/5  ●●●○○  Konfigurasi                      │
│                                                     │
│  Satu-dua pilihan dulu.            (Syne, text-xl)  │
│  Bisa diubah kapan saja dari Pengaturan.            │
│                                                     │
│  Mata uang                                          │
│  ┌─────────────────┐                               │
│  │ IDR (Rupiah) ▾  │  (dropdown, 40px)            │
│  └─────────────────┘                               │
│                                                     │
│  Tutup buku                                         │
│  ┌─────────────────┐                               │
│  │ Bulanan       ▾ │                               │
│  └─────────────────┘                               │
│                                                     │
│  Mode persetujuan jurnal                            │
│  ○  Otomatis — langsung masuk jurnal               │
│  ●  Manual — perlu persetujuan dulu                │
│     (IBM Plex 14px, dengan helper text bawah)      │
│                                                     │
│  [← Kembali]                    [Lanjut →]         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Copy notes:**
- "Tutup buku" bukan "Closing period" — bahasa seller Indonesia
- Helper text mode: "Dengan mode Manual, setiap jurnal dari Shopee perlu Anda setujui lebih dulu." — informatif, tidak judging

---

#### Step 4 — Auto-jurnal & Backfill

**State A — Sebelum backfill start:**

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Step 4/5  ●●●●○  Koneksi Shopee                   │
│                                                     │
│  Kami carikan data 30 hari terakhir.  (Syne, xl)   │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │ [ToggleSwitch ON — signal-orange]            │   │
│  │ Jurnal otomatis dari Shopee                  │   │
│  │ Setiap pesanan selesai, langsung             │   │
│  │ dicatat ke jurnal Anda.                      │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  Kami juga akan mengambil data 30 hari lalu:        │
│  (IBM Plex 13px, text.secondary)                    │
│                                                     │
│  Pendapatan Shopee → Akun Bank Shopee               │
│  Komisi → Beban Komisi Platform                     │
│  (IBM Mono 12px, text.muted — contoh mapping)       │
│                                                     │
│  [← Kembali]           [Mulai & Ambil Data →]      │
│                          (primary, full-width)      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**State B — Saat backfill berjalan:**

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Step 4/5  ●●●●○  Mengambil data...                │
│                                                     │
│  Sedang mengambil data Shopee Anda.   (Syne, xl)   │
│  Jangan tutup halaman ini.                          │
│  (IBM, sm, text.secondary)                         │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │  [Animated progress bar, signal-orange]      │   │
│  │  ████████████░░░░░░░░░░  64%                 │   │
│  │                                              │   │
│  │  26 dari 40 transaksi diproses               │   │
│  │  (IBM Mono 13px, text.secondary)            │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  [ Kembali ]                  [ Lanjut → ] (grayed) │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**State C — Selesai:**

Progress bar filled → "Lanjut" button aktif → user klik lanjut ke step 5.

**Edge case — tidak ada data (seller baru):**
```
  ✓ Tidak ada transaksi dalam 30 hari.
    Jurnal otomatis siap untuk pesanan berikutnya.
    (text.secondary, bukan error)
```

**Edge case — Shopee belum terkoneksi:**
```
  ⚠ Shopee belum terkoneksi.
    Auto-jurnal akan aktif setelah Anda menghubungkan toko.
    [Hubungkan Shopee]  ← link ke settings/shopee
    
    Saat ini, Anda tetap bisa input jurnal manual.
    [Lanjut tanpa koneksi →]
```

---

#### Step 5 — Selesai

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Step 5/5  ●●●●●  Siap!                            │
│                                                     │
│  [Check icon, 48px, animated stroke, green]         │
│                                                     │
│  Pembukuan Anda sudah siap.        (Syne, text-2xl) │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │  Template     SAK EMKM (45 akun)             │   │
│  │  Mata uang    IDR                            │   │
│  │  Auto-jurnal  Aktif                          │   │
│  │  Data lalu    40 transaksi diimpor           │   │
│  └──────────────────────────────────────────────┘   │
│  (summary card, IBM Mono 13px, 2-col key/value)     │
│                                                     │
│  [Lihat Jurnal →]                                   │
│  (primary, large, full-width)                       │
│                                                     │
│  atau setup nanti dari Pengaturan                   │
│  (text.muted, text-sm, centered, bukan button)      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Animation:** Check icon stroke animation (300ms, ease-out) saat step 5 pertama render. Ringan, tidak theatrical.

---

### Screen 2.2 — Tier Upsell Modal

**Tujuan:** Seller free atau starter-near-limit lihat benefit upgrade, ada CTA clear.  
**Trigger:** Klik menu Pembukuan (free) atau quota exceeded (starter).  
**Pattern:** Modal overlay — bukan full screen, tidak block seluruh app.

#### Variant A — Free tier (locked feature)

```
┌─────────────────────────────────────────────────────┐
│ bg: background.base opacity 0.7 (overlay)           │
│                                                     │
│  ┌───────────────────────────────────┐              │
│  │ bg: raised, radius: 8px           │              │
│  │ padding: 32px                     │              │
│  │ max-width: 480px                  │              │
│  │ [X close, top-right, ghost]       │              │
│  │                                   │              │
│  │ [LockIcon 24px, text.muted]       │              │
│  │                                   │              │
│  │ Pembukuan ada                     │              │
│  │ di Starter.         (Syne, 2xl)   │              │
│  │                                   │              │
│  │ Catat penjualan, lihat laba,      │              │
│  │ dan siapkan pajak — semua         │              │
│  │ otomatis dari Shopee Anda.        │              │
│  │ (IBM Plex, base, text.secondary)  │              │
│  │                                   │              │
│  │ ┌──────────────────────────────┐  │              │
│  │ │ ✓  Jurnal dari Shopee        │  │              │
│  │ │ ✓  GL & Trial Balance        │  │              │
│  │ │ ✓  P&L & Balance Sheet       │  │              │
│  │ │ ✓  Export PDF laporan        │  │              │
│  │ └──────────────────────────────┘  │              │
│  │ (card subtle, IBM 13px)           │              │
│  │                                   │              │
│  │ [STARTER]  Mulai Rp 99.000/bulan  │              │
│  │ (tier badge + text.secondary 12px)│              │
│  │                                   │              │
│  │ [Lihat Paket Starter →]           │              │
│  │ (button primary, full-width)      │              │
│  │                                   │              │
│  │ Tetap di Free          (ghost sm) │              │
│  └───────────────────────────────────┘              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### Variant B — Starter near-limit (quota warning)

```
┌───────────────────────────────────────┐
│ [WarningIcon 24px, signal-orange]     │
│                                       │
│ 5 entri tersisa                       │
│ bulan ini.          (Syne, xl)        │
│                                       │
│ Starter: 50 entri/bulan.              │
│ Pro tidak punya limit.                │
│ (IBM, sm, text.secondary)             │
│                                       │
│ ░░░░░░░░░░░░░░█ 45/50               │
│ (progress bar, orange fill → red tip) │
│                                       │
│ [Upgrade ke Pro →]    (primary)       │
│ [Lanjut tanpa upgrade] (ghost sm)     │
└───────────────────────────────────────┘
```

**Variant B muncul sebagai:** compact toast di top (bukan modal penuh), dismiss dalam 8s atau pakai CTA.

**Design rules:**
- Modal A tidak auto-dismiss — perlu user action (close atau upgrade)
- Jangan stack modal A dan B bersamaan
- Close button selalu ada — tidak ada dark pattern yang trap user

---

### Screen 2.3 — Shopee Connect di Settings

**Tujuan:** Seller hubungkan atau reconnect toko Shopee dari halaman Settings.  
**Trigger:** Settings → Integrasi atau banner di dashboard (jika disconnected).

```
┌────────────────────────────────────────────────────────────────┐
│ Pengaturan / Integrasi                                         │
│ (Topbar breadcrumb)                                            │
├────────────────────────────────────────────────────────────────┤
│ Integrasi Shopee                                               │
│ (Syne 18px 600, section header)                               │
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ bg: raised, padding: 24px                                │  │
│ │                                                          │  │
│ │ [Shopee Logo 32px]   Status: ● Tidak terhubung          │  │
│ │                       (text.red, dot red, IBM Mono 13px) │  │
│ │                                                          │  │
│ │ Hubungkan toko Shopee untuk sinkronisasi otomatis        │  │
│ │ pesanan dan pembukuan.                                   │  │
│ │ (IBM 14px, text.secondary)                               │  │
│ │                                                          │  │
│ │ [Hubungkan Toko Shopee →]    (button primary)            │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**State — Connected:**

```
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ [Shopee Logo 32px]   Status: ● Terhubung                │  │
│ │                       (text.green, dot green)            │  │
│ │                                                          │  │
│ │ Toko: Nama Toko Shopee                                   │  │
│ │ Terakhir sync: 5 Agu 2026, 14:32                        │  │
│ │ (IBM Mono 13px, text.secondary)                          │  │
│ │                                                          │  │
│ │ [Sync Sekarang]    [Putuskan Koneksi]                    │  │
│ │  (secondary)         (danger ghost)                      │  │
│ └──────────────────────────────────────────────────────────┘  │
```

**State — Token expired / needs reconnect:**

```
│ Status: ⚠ Perlu diperbarui (text.yellow)
│
│ Koneksi Shopee kedaluwarsa.
│ Hubungkan ulang agar sinkronisasi lanjut.
│
│ [Hubungkan Ulang →]  (primary, orange)
```

---

### Screen 2.4 — Health & Observability (Admin)

**Tujuan:** Ops desk internal — Dozer dan tim cek status sistem.  
**Path:** `/admin/health` (admin only)  
**Karakter:** Dense, utilitarian, seperti terminal tapi lebih readable.

```
┌────────────────────────────────────────────────────────────────┐
│ Admin / Status Sistem                                          │
│ Diperbarui: 14:35:02 WIB · Auto-refresh 30s [Pause]          │
│ (IBM Mono 12px, text.muted — bukan "real-time dashboard" besar)│
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ ┌─────────────┬─────────────┬─────────────┬─────────────┐    │
│ │ Database    │ Redis       │ SMTP        │ Shopee API  │    │
│ │ ● OK        │ ● OK        │ ● OK        │ ⚠ Lambat   │    │
│ │ 15ms        │ 5ms         │ 50ms        │ 312ms       │    │
│ │ (green dot) │ (green dot) │ (green dot) │ (yellow dot)│    │
│ └─────────────┴─────────────┴─────────────┴─────────────┘    │
│ (4-col equal grid, card raised, text IBM Mono)                │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│ Queue Status                                                   │
│                                                                │
│ shopee-sync       Pending: 3  · Active: 1  · Done: 1.240     │
│ email             Pending: 0  · Active: 0  · Done: 4.502     │
│ journal-backfill  Pending: 0  · Active: 0  · Done:   40      │
│ dead-letter       ● 2 job gagal  [Lihat →]                    │
│                                                                │
│ (table, IBM Mono 13px — baris, bukan card)                    │
├────────────────────────────────────────────────────────────────┤
│ Error Log (5xx · 24 jam terakhir)                             │
│                                                                │
│ 14:21  POST /journals/entries       500  shop_id=abc  [→]     │
│ 12:05  GET  /shops/xyz/orders       503  shop_id=xyz  [→]     │
│                                                                │
│ (monospace table, click row untuk detail log)                  │
├────────────────────────────────────────────────────────────────┤
│ Metrics Snapshot                                              │
│                                                                │
│ Sync latency p95    4m 32s    ✓ (target <5m)                 │
│ Email delivery      98.2%     ✓ (target >95%)                 │
│ Tier gate deny      23 hari   — (informational)               │
│ API uptime          99.8%     ✓ (target >99.5%)              │
│                                                                │
│ (kv pairs, IBM Mono 13px, checkmark hijau / orange)           │
└────────────────────────────────────────────────────────────────┘
```

**Design decisions:**
- Tidak ada chart di health dashboard — ini bukan analytics, ini ops. Tabel dan angka cukup.
- Auto-refresh 30s dengan pause option — jangan blink setiap detik
- Dead-letter count: warna red jika >0, dengan link langsung ke detail
- Error log: clickable row, bukan expand-in-place — navigasi ke detail log page

---

### Screen 2.5 — Beta UAT Checklist

**Tujuan:** Beta seller lihat progress UAT dan submit feedback.  
**Path:** `/beta/checklist`  
**Tone:** Friendly tapi serius — ini bukan onboarding playful, ini testing.

```
┌────────────────────────────────────────────────────────────────┐
│ Beta UAT                                                       │
│ Terima kasih sudah jadi tester pertama kami.                  │
│ (IBM Plex, base, text.secondary — satu kalimat, tidak berlebih)│
├────────────────────────────────────────────────────────────────┤
│ Progress: 5/7 selesai                                          │
│ ████████████████████░░░░  71%                                 │
│ (progress bar, signal-orange, thin 4px height)                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ ● Email verifikasi diterima          ✓ Selesai · 4 Agu 09:12 │
│ ● Shopee terhubung                   ✓ Selesai · 4 Agu 09:45 │
│ ● Backfill 30 hari berjalan          ✓ Selesai · 4 Agu 09:46 │
│ ● Wizard pembukuan selesai           ✓ Selesai · 4 Agu 10:02 │
│ ● Dashboard chart tampil             ✓ Selesai · 4 Agu 10:05 │
│ ○ Tier upsell modal terlihat         [Tandai selesai]         │
│ ○ PDF export berhasil                [Tandai selesai]         │
│                                                                │
│ (● done = green, ○ todo = border-default · IBM 14px)          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ Kasih kami feedback                                            │
│ (Syne 16px 600)                                               │
│                                                                │
│ Apa yang berjalan baik?                                        │
│ ┌────────────────────────────────────────────────────────┐    │
│ │ (textarea, 3 rows)                                     │    │
│ └────────────────────────────────────────────────────────┘    │
│                                                                │
│ Apa yang perlu diperbaiki?                                     │
│ ┌────────────────────────────────────────────────────────┐    │
│ │ (textarea, 3 rows)                                     │    │
│ └────────────────────────────────────────────────────────┘    │
│                                                                │
│ Seberapa puas Anda? (1–10)                                     │
│ [1][2][3][4][5][6][7][8][9][10]                               │
│ (segmented control, selected = signal-orange)                  │
│                                                                │
│ [Kirim Feedback]   (button primary, md)                       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Setelah submit:**
```
  ✓ Feedback terkirim.
  Kami akan review dan hubungi jika ada pertanyaan.
  (toast green, dismiss 5s)
```

---

## Bagian 3 — Motion & Interaction

### 3.1 Prinsip animasi

- **Fungsional bukan dekoratif.** Animasi ada untuk memberi informasi state (loading, success, error), bukan untuk terlihat keren.
- **Cepat.** Duration: 150ms (micro), 250ms (transition), 400ms (full-screen). Tidak ada animasi >500ms.
- **Reduced motion respected.** Semua animasi wrap dalam `@media (prefers-reduced-motion: reduce)` — fallback: instant.

### 3.2 Animasi per komponen

```
Wizard overlay masuk:
  from: opacity 0, translateY 16px
  to:   opacity 1, translateY 0
  duration: 200ms, ease-out

Step transition (next/back):
  outgoing: opacity 1 → 0, translateX 0 → -16px, 150ms
  incoming: opacity 0 → 1, translateX 16px → 0, 150ms
  (tidak slide penuh, cukup subtle fade+shift)

Progress bar (backfill):
  width: auto-animate (CSS transition: width 300ms linear)
  color: orange, tidak ada shimmer berlebih

Check icon step 5:
  stroke-dashoffset animation: 0 → full, 300ms ease-out
  scale: 0.8 → 1, 200ms ease-out

Toast masuk:
  from: translateY -8px, opacity 0
  to:   translateY 0, opacity 1
  duration: 150ms

Status dot:
  Jika degraded/warning: pulse 2s infinite
  Jika ok: static (tidak berkedip)
  (pulse hanya untuk "butuh perhatian", bukan default)
```

---

## Bagian 4 — Copy Guidelines

### 4.1 Prinsip

- **Bahasa seller, bukan bahasa akuntan.** "Tutup buku" bukan "period closing". "Pendapatan" bukan "revenue account". "Jurnal" boleh karena sudah familiar.
- **Konkret, bukan promosi.** "Catat penjualan dari Shopee" bukan "Kelola bisnis Anda lebih mudah".
- **Error menjelaskan, bukan minta maaf.** "Koneksi Shopee gagal. Coba lagi atau hubungi support." — bukan "Maaf, terjadi kesalahan."
- **Empty state = undangan bertindak.** Bukan ilustrasi + "Belum ada data". Beri instruksi.

### 4.2 Copy per state

**Loading:**
```
Mengambil data...          ✓ (konkret)
Memuat...                  ✗ (generik)
Sedang bekerja keras...    ✗ (tidak profesional)
```

**Empty states:**
```
Belum ada jurnal.
Hubungkan toko Shopee untuk mulai mencatat otomatis,
atau [+ Tambah jurnal manual].
```

**Error messages:**
```
Gagal kirim email.                        ✓
Koneksi Shopee terputus. Coba lagi.       ✓
Kuota 50 entri bulan ini sudah penuh.     ✓

Maaf, terjadi kesalahan tidak terduga.    ✗
Something went wrong.                      ✗
```

**Success:**
```
Jurnal tersimpan.          ✓ (langsung, tidak perlu "Berhasil! 🎉")
Email terkirim.            ✓
Toko Shopee terhubung.     ✓
```

**Upsell (bukan pressure, tapi informational):**
```
Starter: 50 entri per bulan.
Pro tidak punya batas.
```

### 4.3 Terjemahan teknis → bahasa UI

| Teknis | UI copy |
|--------|---------|
| `journal_approval_mode: auto` | "Langsung masuk jurnal" |
| `journal_approval_mode: manual` | "Perlu persetujuan dulu" |
| `tier: free` | Tidak perlu label — user lihat dari apa yang bisa dan tidak bisa dilakukan |
| `email_verified: false` | "Verifikasi email Anda dulu" |
| `shopee_connected: false` | "Toko belum terhubung" |
| `backfill_status: in_progress` | "Sedang mengambil data..." |
| `dead_letter_count: 2` | "2 proses gagal — [Lihat]" |
| `quota_remaining: 5` | "5 entri tersisa bulan ini" |

---

## Bagian 5 — Accessibility & Quality

### 5.1 Keyboard navigation

- Semua interactive element: focusable, visible focus ring (2px signal-orange)
- Wizard: Tab untuk next field, Enter untuk Next button, Escape untuk close/skip
- Modal: focus trap saat open, return focus ke trigger saat close
- Dropdown: arrow keys untuk navigate, Enter pilih, Escape tutup

### 5.2 Kontras warna

| Pasangan | Ratio | Target |
|---------|-------|--------|
| text.primary (`#F0F2F5`) on base (`#0D0F12`) | 16:1 | ≥4.5:1 AA |
| text.secondary (`#8A9BB5`) on base | 6.2:1 | ≥4.5:1 AA |
| signal-orange (`#F47C2B`) on base | 5.8:1 | ≥4.5:1 AA |
| text.inverse on signal-orange | 4.6:1 | ≥4.5:1 AA |
| text.muted (`#4A5568`) on raised | 3.1:1 | OK untuk non-text (icon, placeholder) |

### 5.3 Responsive

```
Breakpoints:
  mobile:  <640px   (tablet seller / jaga-jaga)
  tablet:  640-1024px
  desktop: >1024px  (primary target ops desk)

Mobile adaptations:
  - Sidebar: collapse ke hamburger menu
  - Wizard: full screen (no card float)
  - Table: horizontal scroll, freeze first column
  - Modal: full-screen pada <640px
  - Health dashboard: vertical stack (tidak horizontal grid)
```

### 5.4 Quality checklist (sebelum ship setiap screen)

- [ ] Semua state terdefinisi (default, loading, error, empty, success)
- [ ] Copy tidak ada typo, bahasa konsisten
- [ ] Keyboard navigation berfungsi
- [ ] Focus ring terlihat di semua interactive element
- [ ] Mobile layout tidak ada overflow horizontal
- [ ] Reduced motion direspect
- [ ] Error state memberi instruksi (bukan hanya pesan error)
- [ ] Empty state ada CTA

---

## Bagian 6 — Implementation Notes untuk Developer

### 6.1 CSS variables (global, `globals.css`)

```css
:root {
  /* Background */
  --bg-base:    #0D0F12;
  --bg-surface: #141720;
  --bg-raised:  #1C2030;
  --bg-overlay: #252A3A;

  /* Signal orange */
  --orange:     #F47C2B;
  --orange-dim: #7A3E16;
  --orange-mute:#2A1A0A;

  /* Text */
  --text-primary:   #F0F2F5;
  --text-secondary: #8A9BB5;
  --text-muted:     #4A5568;
  --text-inverse:   #0D0F12;

  /* Status */
  --green:  #2ECC71;
  --yellow: #F1C40F;
  --red:    #E74C3C;
  --blue:   #3498DB;

  /* Border */
  --border:       #252A3A;
  --border-focus: #F47C2B;
  --border-subtle:#1C2030;

  /* Type */
  --font-display: 'Syne', sans-serif;
  --font-body:    'IBM Plex Sans', sans-serif;
  --font-mono:    'IBM Plex Mono', monospace;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;

  /* Radius */
  --radius-none: 0;
  --radius-sm:   2px;
  --radius-md:   4px;
  --radius-lg:   8px;

  /* Shadow */
  --shadow-panel: 0 1px 3px rgba(0,0,0,0.4);
  --shadow-modal: 0 8px 32px rgba(0,0,0,0.6);
  --shadow-focus: 0 0 0 2px #F47C2B;

  /* Animation */
  --duration-micro:  150ms;
  --duration-normal: 250ms;
  --duration-slow:   400ms;
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
}
```

### 6.2 Tailwind config extends (jika pakai Tailwind)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: {
          base:    '#0D0F12',
          surface: '#141720',
          raised:  '#1C2030',
          overlay: '#252A3A',
        },
        orange: {
          DEFAULT: '#F47C2B',
          dim:     '#7A3E16',
          mute:    '#2A1A0A',
        },
        text: {
          primary:   '#F0F2F5',
          secondary: '#8A9BB5',
          muted:     '#4A5568',
          inverse:   '#0D0F12',
        },
        border: {
          DEFAULT: '#252A3A',
          focus:   '#F47C2B',
          subtle:  '#1C2030',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['IBM Plex Sans', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        sm:   '2px',
        md:   '4px',
        lg:   '8px',
      },
    },
  },
};
```

### 6.3 Komponen prioritas (urutan implementasi)

1. **CSS variables** — globals.css (fondasi, 1 jam)
2. **Button** variants (primary, secondary, ghost, danger) + states
3. **Input + Label + Helper** — form atoms
4. **Badge** (tier, status)
5. **Panel + Card** containers
6. **Toast** notification
7. **Wizard** overlay + step components
8. **Upsell modal** (free + starter variant)
9. **Health dashboard** — admin only
10. **Checklist** screen beta

---

## Ringkasan Design Decisions

| Keputusan | Pilihan | Alasan |
|-----------|---------|--------|
| Background | Near-black (`#0D0F12`) | Ops desk feel, bukan SaaS consumer |
| Aksen | Signal orange satu saja | Satu aksen dominan, sisanya monokrom |
| Shape | Radius 0 di panel besar | Sharp = presisi = financial tool |
| Tipografi angka | IBM Plex Mono | Alignment kolom, tidak ada kerning aneh |
| Wizard pattern | Full-screen overlay, bukan modal | Ini experience, perlu ruang |
| Upsell tone | Informational, bukan pressure | Tidak ada countdown timer, tidak ada dark pattern |
| Health dashboard | Tabel + angka, tanpa chart | Ini ops tool, bukan analytics |
| Animasi | Minimal, fungsional | Terlalu banyak motion = AI slop |
| Copy | Seller language, bukan akuntansi | Pengguna adalah pebisnis, bukan akuntan |

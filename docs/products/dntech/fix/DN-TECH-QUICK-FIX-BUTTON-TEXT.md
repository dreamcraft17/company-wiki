# DN Tech — QUICK FIX
## Missing Button Text + Modal Close Issues

**Date:** Juli 2026  
**Status:** ✅ IMPLEMENTED (9 Jul 2026)  
**Issues:** 3 (button text, modal close, button text in footer) — resolved

---

## Issue 1: Hero Buttons Text Missing

### Problem
```
❌ Tombol di hero section kosong (no text)
   Expected: "Konsultasi Gratis" + "Lihat Layanan"
   Actual: Empty buttons
```

### File: `frontend/src/components/layout/Hero.tsx`

**Current code (WRONG):**
```typescript
export function Hero() {
  return (
    <section className="bg-blue-900 text-white py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-5xl font-bold">DN Tech</h1>
        <div className="flex gap-4 mt-8">
          {/* ❌ WRONG: No text in buttons */}
          <Button variant="primary" />
          <Button variant="secondary" />
        </div>
      </div>
    </section>
  );
}
```

**Fixed code:**
```typescript
export function Hero() {
  return (
    <section className="bg-blue-900 text-white py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-5xl font-bold">DN Tech</h1>
        <p className="text-xl text-blue-100 mt-4">
          Solusi software custom untuk bisnis Indonesia
        </p>
        
        <div className="flex gap-4 mt-8">
          {/* ✅ FIXED: Add text to buttons */}
          <Button 
            variant="primary"
            onClick={() => navigate('/contact')}
          >
            Konsultasi Gratis
          </Button>
          
          <Button 
            variant="secondary"
            onClick={() => navigate('/services')}
          >
            Lihat Layanan
          </Button>
        </div>
      </div>
    </section>
  );
}
```

**Changes:**
- ✅ Added `children` text to buttons
- ✅ Added `onClick` handlers
- ✅ Added hero subtitle

---

## Issue 2: Modal Close Button Not Working

### Problem
```
❌ Tombol X di modal tidak berfungsi
   Expected: Click X → modal closes
   Actual: X button doesn't respond
```

### File: `frontend/src/components/interactive/ExitIntentModal.tsx`

**Current code (WRONG):**
```typescript
export function ExitIntentModal({ open, onClose }: Props) {
  return (
    <div className={`fixed inset-0 ${open ? 'flex' : 'hidden'}`}>
      <div className="bg-white rounded-lg max-w-md">
        {/* ❌ WRONG: X button not connected */}
        <button className="text-gray-400">
          ×
        </button>
        
        <h2>Tunggu! Sebelum Anda pergi...</h2>
        
        <div className="flex gap-2 mt-6">
          <Button variant="secondary">Tidak</Button>
          <Button>Hubungi Kami</Button>
        </div>
      </div>
    </div>
  );
}
```

**Fixed code:**
```typescript
export function ExitIntentModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Tunggu! Sebelum Anda pergi...</h2>
            
            {/* ✅ FIXED: X button connected to onClose */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-gray-600">
              Dapatkan konsultasi gratis dengan tim kami sebelum Anda pergi.
            </p>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 rounded-b-lg flex gap-3">
            <Button 
              variant="secondary" 
              onClick={onClose}
              className="flex-1"
            >
              Tidak, terima kasih
            </Button>
            
            <Button 
              variant="primary"
              onClick={() => {
                navigate('/contact');
                onClose();
              }}
              className="flex-1"
            >
              Hubungi Kami
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
```

**Changes:**
- ✅ X button now has `onClick={onClose}`
- ✅ Added `aria-label` for accessibility
- ✅ Added hover state
- ✅ Structured modal properly (header/body/footer)
- ✅ Both buttons have proper handlers

**Imports:**
```typescript
import { X } from 'lucide-react'; // Add this if missing
```

---

## Issue 3: Footer Button Text Missing

### Problem
```
❌ Tombol "Langganan" di footer kosong (no text)
   Expected: "Langganan" (Subscribe button)
   Actual: Empty button
```

### File: `frontend/src/components/layout/Footer.tsx`

**Current code (WRONG):**
```typescript
export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Newsletter section */}
        <div className="flex gap-2">
          <input 
            type="email" 
            placeholder="email@perusahaan.com"
            className="flex-1 px-4 py-2 rounded border border-gray-700"
          />
          {/* ❌ WRONG: Button text missing */}
          <Button variant="primary" />
        </div>
        
        {/* Rest of footer */}
      </div>
    </footer>
  );
}
```

**Fixed code:**
```typescript
export function Footer() {
  const [email, setEmail] = React.useState('');

  const handleSubscribe = async () => {
    if (!email) return;
    
    try {
      // Call newsletter API
      const response = await fetch('/api/v1/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        setEmail('');
        alert('Berhasil berlangganan! Cek email Anda.');
      }
    } catch (error) {
      console.error('Subscribe error:', error);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Newsletter section */}
        <div className="mb-12">
          <h3 className="text-white font-bold mb-4">Dapatkan update terbaru</h3>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="email@perusahaan.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-2 rounded border border-gray-700 bg-gray-800 text-white"
            />
            {/* ✅ FIXED: Button has text + onClick handler */}
            <Button 
              variant="primary"
              onClick={handleSubscribe}
              disabled={!email}
            >
              Langganan
            </Button>
          </div>
        </div>

        {/* Links section */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div>
            <h4 className="text-white font-bold mb-4">PERUSAHAAN</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-white">Tim Kami</a></li>
              <li><a href="#" className="hover:text-white">Karir</a></li>
              <li><a href="#" className="hover:text-white">Kontak</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">LAYANAN</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Semua Layanan</a></li>
              <li><a href="#" className="hover:text-white">Studi Kasus</a></li>
              <li><a href="#" className="hover:text-white">Temukan Solusi</a></li>
              <li><a href="#" className="hover:text-white">Sumber Daya</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">LAINNYA</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Blog</a></li>
              <li><a href="#" className="hover:text-white">FAQ</a></li>
              <li><a href="#" className="hover:text-white">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-white">Kebijakan Privasi</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex justify-between items-center">
            <p className="text-sm">© 2026 DN Tech. Hak cipta dilindungi.</p>
            <div className="flex gap-4 text-sm">
              <a href="#" className="hover:text-white">Syarat & Ketentuan</a>
              <a href="#" className="hover:text-white">Kebijakan Privasi</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

**Changes:**
- ✅ Button now has text "Langganan"
- ✅ Added `onClick` handler
- ✅ Added email state management
- ✅ Added subscribe API call
- ✅ Added footer links + structure

---

## Summary of All Fixes

| File | Issue | Fix | Time |
|------|-------|-----|------|
| **Hero.tsx** | Button text missing | Add children text + onClick | 5 min |
| **ExitIntentModal.tsx** | Close button not working | Connect onClick + import X icon | 10 min |
| **Footer.tsx** | Button text missing + no function | Add text + subscribe handler | 15 min |

**Total time:** 30 minutes

---

## Quick Implementation Checklist

```
[ ] Open Hero.tsx
    [ ] Add "Konsultasi Gratis" text to first button
    [ ] Add "Lihat Layanan" text to second button
    [ ] Add onClick handlers

[ ] Open ExitIntentModal.tsx
    [ ] Import X from 'lucide-react'
    [ ] Connect close button onClick={onClose}
    [ ] Add aria-label

[ ] Open Footer.tsx
    [ ] Add "Langganan" text to button
    [ ] Add subscribe handler
    [ ] Add email state

[ ] Test
    [ ] Hero buttons show text + clickable
    [ ] Modal X closes modal
    [ ] Footer button shows "Langganan" + works

[ ] Deploy
    npm run build
    pm2 restart dntech-web
```

---

## Testing After Fix

```bash
# 1. Dev server
npm run dev

# 2. Visual check
# - Hero: buttons have text
# - Modal: X button closes modal
# - Footer: button has text + works

# 3. Build
npm run build
# Expected: success, no errors

# 4. Deploy
pm2 restart dntech-web

# 5. Live test
# Open dntech.id
# - Hero buttons clickable
# - Exit intent modal closes
# - Newsletter subscribes
```

---

**Status:** ✅ Resolved (Jul 9, 2026)

**Resolved (fase 1):** Root cause was invalid `<Link><Button>` nesting. Fixed via `Button href` prop across frontend. Build verified.

**Resolved (fase 2 — tailwind-merge):** Teks tombol hero masih putih di atas putih karena `cn()` tidak merge class Tailwind. Fix: `tailwind-merge` di `utils.ts`; variant `inverse` dan `outline-on-dark` pada `Button.tsx`.

**Resolved (fase 3 — branding & CMS):** Logo `rlogo2.png`, favicon, navbar wordmark, hero `HeroBrand`, `/about` client fetch, admin toast.

---

**Owner:** Dozer (CEO + Tech Lead)  
**Date:** Juli 2026

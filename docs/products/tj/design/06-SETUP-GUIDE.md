# Trusted Jurist Design System - Implementation Guide

**Direct Code Implementation (No Figma)**

---

## 📋 Quick Start

Implementasi design system Trusted Jurist langsung dalam code dengan:
- Next.js 16.2.6 + React 19.2.4
- Tailwind CSS v4
- TypeScript 5

---

## 📁 File Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx              (Reusable button component)
│   │   ├── Input.tsx               (Form input component)
│   │   ├── Card.tsx                (Card container)
│   │   ├── Alert.tsx               (Alert/notification)
│   │   ├── Badge.tsx               (Badge/tag)
│   │   └── ...other UI components
│   ├── layout/
│   │   ├── Navbar.tsx              (Navigation bar)
│   │   ├── Footer.tsx              (Footer)
│   │   ├── Hero.tsx                (Hero section)
│   │   ├── Container.tsx           (Main container)
│   │   └── Section.tsx             (Content section)
│   └── specific/
│       ├── PracticeAreaCard.tsx
│       ├── TeamMemberCard.tsx
│       └── JobPostingCard.tsx
├── pages/
│   ├── index.tsx                   (Homepage)
│   ├── contact.tsx                 (Contact page)
│   ├── about.tsx                   (About page)
│   ├── practice-areas.tsx
│   ├── team.tsx
│   ├── careers.tsx
│   └── ...other pages
├── styles/
│   ├── globals.css                 (Global styles + CSS variables)
│   └── tailwind.config.js           (Tailwind configuration)
└── lib/
    └── constants.ts                (Design constants, colors, etc.)
```

---

## 🚀 Setup Steps

### 1. Install Dependencies

```bash
npm install next react react-dom typescript tailwindcss postcss autoprefixer lucide-react
npm install -D @types/node @types/react @types/react-dom

# Or if using pnpm
pnpm add next react react-dom typescript tailwindcss postcss autoprefixer lucide-react
pnpm add -D @types/node @types/react @types/react-dom
```

### 2. Copy Files

Copy these files ke project Anda:

- `01-tailwind.config.js` → `tailwind.config.js`
- `05-global-styles.css` → `src/styles/globals.css`
- `02-ui-components.tsx` → `src/components/ui/`
- `03-layout-components.tsx` → `src/components/layout/`
- `04-example-pages.tsx` → `src/pages/` (optional, untuk reference)

### 3. Update Global Layout

File: `src/app/layout.tsx` (atau `src/pages/_app.tsx` jika Pages Router)

```tsx
import './styles/globals.css';
import { Cormorant_Garamond, Manrope } from 'next/font/google';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weights: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weights: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${cormorant.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### 4. Create Pages

Contoh Homepage (`src/app/page.tsx`):

```tsx
import { HomePage } from '@/components/pages/HomePage';

export default function Home() {
  return <HomePage />;
}
```

---

## 🎨 Design Tokens Reference

### Colors

```typescript
// Primary (Navy)
const navy = {
  900: '#0d1117',
  700: '#121c2b',  // default
  500: '#3d4a5c',
  300: '#6b7a89',
};

// Accent (Gold)
const gold = {
  900: '#6b5a2d',
  500: '#8a7340',  // default
  300: '#c9b896',
};

// Background (Cream)
const cream = {
  100: '#faf9f7',
  500: '#f7f4ef',  // default
  700: '#e8e4db',
};

// Semantic
const semantic = {
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};
```

### Typography

```typescript
// Font families
const fonts = {
  serif: 'Cormorant Garamond',   // Headings
  sans: 'Manrope',                // Body
};

// Sizes (responsive)
const sizes = {
  h1: { desktop: '72px', mobile: '48px' },
  h2: { desktop: '56px', mobile: '36px' },
  h3: { desktop: '42px', mobile: '32px' },
  h4: { desktop: '28px', mobile: '24px' },
  body: '16px',
  bodyLg: '18px',
  bodySm: '14px',
  label: '12px',
  caption: '11px',
};
```

### Spacing

```typescript
const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '80px',
};
```

---

## 🧩 Component Usage Examples

### Button

```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="md" onClick={() => console.log('clicked')}>
  Konsultasi
</Button>

<Button variant="secondary" size="lg" disabled>
  Disabled
</Button>

<Button variant="gold" isLoading={true}>
  Loading...
</Button>
```

**Variants**: `primary`, `secondary`, `gold`, `ghost`  
**Sizes**: `sm`, `md`, `lg`

### Input

```tsx
import { Input } from '@/components/ui/Input';

<Input
  label="Nama Lengkap"
  type="text"
  placeholder="Masukkan nama"
  error={errors.name}
  required
/>
```

### Textarea

```tsx
import { Textarea } from '@/components/ui/Textarea';

<Textarea
  label="Pesan"
  placeholder="Ketik pesan Anda..."
  error={errors.message}
  required
/>
```

### Card

```tsx
import { Card } from '@/components/ui/Card';

<Card hoverable>
  <h4>Judul Card</h4>
  <p>Isi card</p>
</Card>
```

### Alert

```tsx
import { Alert } from '@/components/ui/Alert';

<Alert type="success" message="Berhasil!" onClose={() => {}} />
<Alert type="error" message="Terjadi kesalahan" />
```

### Navbar

```tsx
import { Navbar } from '@/components/layout/Navbar';

<Navbar
  logo="/logo.png"
  navItems={[
    { label: 'Tentang', href: '/about' },
    { label: 'Praktik', href: '/practice' },
  ]}
  onConsult={() => navigate('/contact')}
/>
```

### Hero Section

```tsx
import { HeroSection } from '@/components/layout/HeroSection';

<HeroSection
  headline="Firma Hukum Terpercaya"
  subheadline="Solusi hukum berkualitas tinggi"
  backgroundImage="/hero.jpg"
  cta1Text="Konsultasi"
  trustIndicators={[
    { icon: '⭐', text: 'Didirikan 2010' },
  ]}
  onCta1={() => navigate('/contact')}
/>
```

### Grid Section

```tsx
import { GridSection } from '@/components/layout/GridSection';

<GridSection
  title="Area Praktik"
  subtitle="Layanan komprehensif"
  columns={3}
  backgroundColor="cream"
>
  {/* Children cards */}
</GridSection>
```

### Footer

```tsx
import { Footer } from '@/components/layout/Footer';

<Footer
  logo="/logo.png"
  description="Firma hukum terkemuka"
  email="contact@tj.co.id"
  phone="+62 21 1234"
  sections={[
    {
      title: 'Navigasi',
      links: [{ label: 'Beranda', href: '/' }],
    },
  ]}
/>
```

---

## 🎯 Common Patterns

### Form with Validation

```tsx
import { useState } from 'react';
import { Input, Textarea, Button } from '@/components/ui';

export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate & submit
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Nama"
        name="name"
        value={form.name}
        onChange={handleChange}
        error={errors.name}
      />
      <Textarea
        label="Pesan"
        name="message"
        value={form.message}
        onChange={handleChange}
        error={errors.message}
      />
      <Button variant="primary" type="submit">
        Kirim
      </Button>
    </form>
  );
}
```

### Responsive Grid

```tsx
// Automatically responsive with Tailwind
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
  {items.map((item) => (
    <Card key={item.id}>{item.content}</Card>
  ))}
</div>
```

### Hero with Image

```tsx
<HeroSection
  headline="Judul"
  backgroundImage="https://..."
  trustIndicators={[{ icon: '✓', text: 'Terpercaya' }]}
/>
```

---

## 🔄 Responsive Breakpoints

Tailwind default breakpoints:

```css
sm:  640px    /* Mobile landscape, small tablets */
md:  768px    /* Tablets */
lg:  1024px   /* Desktop */
xl:  1280px   /* Large desktop */
2xl: 1536px   /* Extra large */
```

### Usage

```tsx
// Mobile-first approach
<div className="text-sm md:text-base lg:text-lg">
  Text size changes at breakpoints
</div>

<div className="px-4 md:px-6 lg:px-10">
  Padding changes at breakpoints
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  Grid columns change at breakpoints
</div>
```

---

## ♿ Accessibility Checklist

### Implemented in Components

✅ Color contrast ratios ≥4.5:1  
✅ Focus indicators (2px outline)  
✅ Semantic HTML (`<button>`, `<label>`, `<input>`)  
✅ ARIA labels on form fields  
✅ Keyboard navigation support  
✅ Skip link included  

### Test with Tools

- **WAVE**: https://wave.webaim.org/ (Chrome extension)
- **Axe**: https://www.deque.com/axe/devtools/
- **Lighthouse**: Built-in Chrome DevTools

### Test Checklist

- [ ] Tab through page - all interactive elements reachable
- [ ] ESC closes modals/overlays
- [ ] Focus visible on all buttons/inputs
- [ ] Form validation messages clear
- [ ] Color not sole indicator (use icons + text)

---

## 📱 Mobile Optimization

### Touch-Friendly

- Button min height: 44px ✅
- Input min height: 44px ✅
- Touch target spacing: 8px ✅
- Font size min: 16px ✅ (prevents iOS zoom)

### Mobile-First Approach

Always design for mobile first, then enhance for desktop:

```tsx
// Start small
<div className="text-sm px-4 py-2">

// Enhance for tablet & desktop
<div className="text-sm md:text-base lg:text-lg px-4 md:px-6 lg:px-10">
```

---

## 🎬 Animation & Motion

### Built-in Animations

```tsx
// Use with Framer Motion (optional)
import { motion } from 'framer-motion';

<motion.button
  whileHover={{ scale: 1.02 }}
  transition={{ duration: 0.15 }}
>
  Hover Button
</motion.button>
```

### CSS Animations

```css
/* Defined in global styles */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fade-in 400ms ease-out;
}
```

### Reduced Motion

Components automatically respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🧪 Testing Components

### Unit Test Example (Jest + React Testing Library)

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click</Button>);
    screen.getByText('Click').click();
    expect(onClick).toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

## 📊 Design Consistency Checks

### CSS Variable Verification

```bash
# Check all colors are used correctly
grep -r "bg-\|text-\|border-" src/ | grep -v "navy-\|gold-\|cream-\|gray-\|success\|error\|warning\|info"
```

### Color Contrast Validation

Use WAVE or Axe DevTools to verify:
- Text contrast ≥4.5:1
- UI component contrast ≥3:1
- Focus outline visible on all interactive elements

### Responsive Testing

Test at breakpoints:
- 320px (mobile small)
- 375px (mobile base)
- 768px (tablet)
- 1024px (desktop)
- 1440px (desktop large)

---

## 🚀 Deployment Checklist

Before going to production:

- [ ] All components styled correctly
- [ ] Color palette consistent
- [ ] Typography scale applied
- [ ] Spacing uses 8px multiples
- [ ] Responsive at all breakpoints
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Animations respect prefers-reduced-motion
- [ ] Images optimized (WebP + JPEG)
- [ ] Fonts loading correctly
- [ ] No console errors/warnings
- [ ] Performance optimized (Lighthouse ≥85)

---

## 📞 Support & Documentation

### Files Included

1. **01-tailwind.config.js** - Complete Tailwind configuration
2. **02-ui-components.tsx** - All UI components
3. **03-layout-components.tsx** - Layout & structural components
4. **04-example-pages.tsx** - Homepage & Contact page examples
5. **05-global-styles.css** - Global styles & CSS variables
6. **06-SETUP-GUIDE.md** - This file

### Quick Reference

| Component | File | Purpose |
|-----------|------|---------|
| Button | ui/ | Primary CTA element |
| Input | ui/ | Form text input |
| Textarea | ui/ | Form text area |
| Select | ui/ | Dropdown select |
| Card | ui/ | Content container |
| Alert | ui/ | Notifications |
| Badge | ui/ | Tags/labels |
| Navbar | layout/ | Top navigation |
| Footer | layout/ | Bottom footer |
| Hero | layout/ | Hero section |
| Section | layout/ | Content sections |
| Container | layout/ | Page container |

---

## 🎓 Learning Resources

- **Tailwind CSS**: https://tailwindcss.com/docs
- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **Web Accessibility**: https://www.w3.org/WAI/

---

**Design System Status**: ✅ **READY FOR IMPLEMENTATION**

**Last Updated**: 8 Juli 2026  
**Version**: 3.0  
**Stack**: Next.js + React + Tailwind CSS + TypeScript

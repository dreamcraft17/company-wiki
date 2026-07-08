# Trusted Jurist Design System - Code Implementation

## 🎨 Overview

Implementasi design system Trusted Jurist **langsung dalam code** (Next.js + React + Tailwind CSS), tanpa perlu Figma. Semua design tokens, components, dan layouts siap digunakan production-ready.

---

## 📦 What You Get

✅ **Design Tokens** - Colors, typography, spacing, shadows  
✅ **React Components** - 15+ reusable UI components  
✅ **Layout Components** - Navbar, Footer, Hero, Sections  
✅ **Page Examples** - Homepage & Contact page templates  
✅ **Global Styles** - CSS variables + responsive utilities  
✅ **Complete Setup Guide** - Step-by-step implementation  

---

## 📁 File Structure

```
Deliverables (6 files):

01-tailwind.config.js
   └─ Design tokens configuration
   └─ Colors (navy, gold, cream)
   └─ Typography (H1-H4, body, label, caption)
   └─ Spacing scale (4px - 80px)
   └─ Shadows & radius

02-ui-components.tsx
   └─ Button (4 variants: primary, secondary, gold, ghost)
   └─ Input (with label, error, helper text)
   └─ Textarea (for long-form text)
   └─ Select (dropdown)
   └─ Checkbox & Radio
   └─ Card (generic container)
   └─ PracticeAreaCard (icon + title + CTA)
   └─ TeamMemberCard (photo + bio)
   └─ JobPostingCard (job listing)
   └─ Alert (notifications)
   └─ Badge (tags/labels)
   └─ Divider (horizontal line)

03-layout-components.tsx
   └─ Container (responsive wrapper)
   └─ Navbar (desktop/mobile with hamburger)
   └─ HeroSection (full-width hero)
   └─ ContentSection (standard section container)
   └─ TwoColumnSection (image + text)
   └─ GridSection (responsive grid)
   └─ Footer (multi-column footer)
   └─ Breadcrumb (navigation breadcrumb)

04-example-pages.tsx
   └─ HomePage (full homepage example)
   └─ ContactPage (contact form with validation)

05-global-styles.css
   └─ CSS variables (design tokens)
   └─ Reset & base styles
   └─ Typography rules
   └─ Form styling
   └─ Accessibility utilities
   └─ Animation definitions
   └─ Responsive utilities

06-SETUP-GUIDE.md
   └─ Installation & setup steps
   └─ Component usage examples
   └─ Design tokens reference
   └─ Responsive patterns
   └─ Accessibility checklist
   └─ Testing & deployment checklist

00-README.md
   └─ This file
   └─ Overview & quick start
```

---

## 🚀 Quick Start

### 1. Copy All Files to Project

```bash
# Components
cp 02-ui-components.tsx src/components/ui/
cp 03-layout-components.tsx src/components/layout/

# Config & Styles
cp 01-tailwind.config.js ./tailwind.config.js
cp 05-global-styles.css src/styles/globals.css

# Pages (optional, for reference)
cp 04-example-pages.tsx src/components/pages/
```

### 2. Install Dependencies

```bash
npm install next react react-dom typescript tailwindcss postcss autoprefixer lucide-react
npm install -D @types/react @types/react-dom @types/node
```

### 3. Setup Fonts in Layout

```tsx
// src/app/layout.tsx
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import './styles/globals.css';

const cormorant = Cormorant_Garamond({
  variable: '--font-serif',
  weights: ['400', '500', '600', '700'],
  display: 'swap',
});

const manrope = Manrope({
  variable: '--font-sans',
  weights: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${cormorant.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### 4. Start Building!

```tsx
// src/app/page.tsx
import { Navbar, HeroSection, GridSection, Footer } from '@/components/layout';
import { Button, PracticeAreaCard } from '@/components/ui';

export default function Home() {
  return (
    <>
      <Navbar
        navItems={[{ label: 'Tentang', href: '/' }]}
        onConsult={() => console.log('consult')}
      />
      <HeroSection
        headline="Firma Hukum Terpercaya"
        subheadline="Solusi hukum berkualitas tinggi"
      />
      <GridSection title="Area Praktik" columns={3}>
        <PracticeAreaCard
          icon={<Briefcase size={48} />}
          title="Korporat"
          description="Layanan hukum bisnis"
        />
      </GridSection>
      <Footer />
    </>
  );
}
```

---

## 🎨 Design Tokens

### Colors

```
Primary (Navy):       #121c2b   ← Authority, Trust
Accent (Gold):        #8a7340   ← Premium, Sophistication  
Background (Cream):   #f7f4ef   ← Warm, Readable
Semantic:             Success (#10b981), Error (#ef4444), etc.
```

### Typography

```
Headlines:  Cormorant Garamond (serif) - 72px → 28px
Body:       Manrope (sans-serif) - 16px
Mobile:     Responsive scaling (H1: 48px, Body: 16px min)
```

### Spacing

```
8px base unit: 4px, 8px, 16px, 24px, 32px, 48px, 64px, 80px
Padding:       24px (cards), 16px (components)
Margin:        80px (sections), 32px (blocks)
```

---

## 🧩 Component Quick Reference

### Buttons

```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="gold">Gold Accent</Button>
<Button variant="ghost">Ghost</Button>

<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

<Button isLoading>Loading...</Button>
```

### Forms

```tsx
<Input label="Name" placeholder="..." required />
<Textarea label="Message" required />
<Select label="Category" options={[...]} />
<Checkbox label="I agree" />
<Radio label="Option 1" />
```

### Cards

```tsx
<Card>Generic card</Card>
<Card hoverable>Hover effect</Card>

<PracticeAreaCard
  icon={<Briefcase />}
  title="Hukum Korporat"
  description="..."
  onConsult={() => {}}
/>
```

### Layouts

```tsx
<Navbar navItems={[...]} onConsult={...} />
<HeroSection headline="..." subheadline="..." />
<GridSection columns={3}>...</GridSection>
<TwoColumnSection image="..." title="..." />
<Footer email="..." phone="..." />
```

---

## 📱 Responsive Design

### Breakpoints

```
Mobile:    <640px    (1-column layouts, small text)
Tablet:    640-1024px (2-3 column layouts)
Desktop:   ≥1024px    (3-4 column layouts, full spacing)
```

### Mobile-First Pattern

```tsx
// Starts small, enhances with breakpoints
<div className="
  grid grid-cols-1          /* Mobile: 1 column */
  md:grid-cols-2            /* Tablet: 2 columns */
  lg:grid-cols-3            /* Desktop: 3 columns */
  gap-4 md:gap-6 lg:gap-8   /* Spacing scales */
">
  {items.map(...)}
</div>
```

---

## ♿ Accessibility Built-In

✅ **Color Contrast**: All text ≥4.5:1 ratio  
✅ **Focus States**: 2px gold outline on all interactive elements  
✅ **Touch Targets**: 44×44px minimum for mobile  
✅ **Semantic HTML**: Proper headings, labels, form associations  
✅ **Keyboard Navigation**: Tab through all elements, Escape closes overlays  
✅ **Skip Link**: Navigate directly to main content  
✅ **Reduced Motion**: Respects prefers-reduced-motion setting  

---

## 🎯 Real-World Usage

### Contact Form Example

```tsx
import { useState } from 'react';
import { Input, Textarea, Button, Alert } from '@/components/ui';

export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!form.name) setErrors({ ...errors, name: 'Required' });
    if (!form.email) setErrors({ ...errors, email: 'Required' });

    // Submit
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (response.ok) {
      setSuccess(true);
      setForm({ name: '', email: '', message: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      {success && (
        <Alert
          type="success"
          message="Pesan terkirim!"
          onClose={() => setSuccess(false)}
        />
      )}

      <Input
        label="Nama"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        error={errors.name}
        required
      />

      <Input
        label="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        error={errors.email}
        required
      />

      <Textarea
        label="Pesan"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        required
      />

      <Button variant="primary" type="submit" className="w-full">
        Kirim Pesan
      </Button>
    </form>
  );
}
```

### Homepage Grid Section

```tsx
import { GridSection } from '@/components/layout';
import { PracticeAreaCard } from '@/components/ui';
import { Briefcase, Code, Scale } from 'lucide-react';

export function PracticeAreas() {
  const areas = [
    {
      icon: <Briefcase size={48} />,
      title: 'Hukum Korporat',
      description: 'Layanan hukum bisnis dan korporat',
    },
    {
      icon: <Code size={48} />,
      title: 'Hukum Teknologi',
      description: 'Spesialisasi dalam regulasi teknologi',
    },
    {
      icon: <Scale size={48} />,
      title: 'Litigasi',
      description: 'Pendampingan dalam sengketa',
    },
  ];

  return (
    <GridSection
      title="Area Praktik Kami"
      subtitle="Layanan komprehensif untuk berbagai kebutuhan"
      columns={3}
      backgroundColor="white"
    >
      {areas.map((area) => (
        <PracticeAreaCard
          key={area.title}
          icon={area.icon}
          title={area.title}
          description={area.description}
          onConsult={() => console.log('Konsultasi:', area.title)}
        />
      ))}
    </GridSection>
  );
}
```

---

## 🧪 Testing

### Component Testing

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  test('renders and handles click', async () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click</Button>);

    const button = screen.getByRole('button');
    await userEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('shows loading state', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Visual Regression Testing

Use tools like:
- Percy.io
- Chromatic
- Visual Studio Code extension: "Percy CLI"

---

## 📊 Performance Checklist

- [ ] Images optimized (WebP + JPEG, <150KB)
- [ ] Fonts loaded with `display: 'swap'`
- [ ] No unused CSS classes
- [ ] Tailwind purge production build
- [ ] Lighthouse score ≥85
- [ ] Lighthouse CLS <0.1 (no layout shift)
- [ ] Lighthouse LCP <2.5s

---

## 🔐 Browser Support

- Chrome 120+
- Firefox 121+
- Safari 17+
- iOS Safari 16+
- Edge 120+

---

## 📞 Documentation Files

| File | Purpose |
|------|---------|
| `00-README.md` | This overview |
| `01-tailwind.config.js` | Design tokens & config |
| `02-ui-components.tsx` | Reusable UI components |
| `03-layout-components.tsx` | Layout & page structure |
| `04-example-pages.tsx` | Homepage & Contact examples |
| `05-global-styles.css` | Global CSS & utilities |
| `06-SETUP-GUIDE.md` | Complete setup instructions |

---

## ✅ Implementation Checklist

- [ ] Copy all files to project
- [ ] Install dependencies
- [ ] Update `layout.tsx` with font variables
- [ ] Import `globals.css` in root layout
- [ ] Copy `tailwind.config.js` to project root
- [ ] Create first page using components
- [ ] Test responsive at mobile/tablet/desktop
- [ ] Run accessibility audit (WAVE/Axe)
- [ ] Verify color contrast (4.5:1 minimum)
- [ ] Test keyboard navigation
- [ ] Deploy to staging

---

## 🎓 Key Decisions

**Why Tailwind CSS?**
- Fast prototyping
- Responsive by default
- Type-safe with TypeScript
- Smaller bundle size
- Easy to maintain design consistency

**Why React Components?**
- Reusable across pages
- Prop-based configuration
- Easier testing
- Better type safety
- Smaller learning curve

**Why No Figma?**
- Direct code implementation
- No design-to-dev translation
- Faster development
- Single source of truth
- Easier maintenance

---

## 📈 Next Steps

1. **Phase 1**: Implement homepage & contact page
2. **Phase 2**: Add additional pages (about, practice areas, team, careers)
3. **Phase 3**: Integrate backend APIs
4. **Phase 4**: Add analytics & monitoring
5. **Phase 5**: Deploy to production

---

## 🤝 Contributing

When adding new components or pages:

1. ✅ Follow design token rules (use defined colors, spacing)
2. ✅ Maintain responsive design (mobile-first)
3. ✅ Test accessibility (keyboard nav, contrast)
4. ✅ Write semantic HTML
5. ✅ Use TypeScript for type safety
6. ✅ Export from component index file

---

## 📚 Resources

- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **Web Accessibility**: https://www.w3.org/WAI/
- **Color Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **WAVE Accessibility Tool**: https://wave.webaim.org/

---

## 🎉 You're Ready!

Semua files siap digunakan. Mulai dengan:

```tsx
// src/app/page.tsx
import { HomePage } from '@/components/pages/HomePage';

export default function Home() {
  return <HomePage />;
}
```

Happy coding! 🚀

---

**Design System**: v3.0  
**Stack**: Next.js 16 + React 19 + Tailwind CSS 4 + TypeScript 5  
**Status**: ✅ Production Ready  
**Last Updated**: 8 Juli 2026

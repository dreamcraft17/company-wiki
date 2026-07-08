# DN Tech Design System & Brand Guidelines
## Version 2.0 — Human-Centric, Solid Color Design

**Document Version:** 2.0  
**Date:** Juli 2026  
**Status:** Active  
**Owner:** Design Team

---

## 1. Philosophy: Why We Design This Way

### What We're NOT

❌ **Modern Trendy but Meaningless**
- No glassmorphism (blurred backgrounds)
- No gradient overlays
- No neumorphism (embossed buttons)
- No 3D effects or pseudo-3D
- No heavy shadows or floating cards
- No "slick" animations

❌ **AI-Generated Looking**
- No abstract blob shapes
- No AI illustrations (Midjourney, Dall-E style)
- No smooth organic curves everywhere
- No vaporwave-ish gradients
- No stock photos of perfect hipster teams

### What We ARE

✅ **Purposeful & Clear**
- Every design decision serves readability or conversion
- Whitespace is your friend
- High contrast for accessibility
- Simple > fancy

✅ **Genuinely Human**
- Real photos of real team (imperfections OK)
- Authentic testimonials or none
- Honest copy (no buzzwords)
- Conversational tone

✅ **Professional & Trustworthy**
- Clean, corporate-friendly
- Used by real SaaS companies (Stripe, GitHub, Linear)
- Timeless (won't look dated in 6 months)
- Accessible to everyone

---

## 2. Color Palette

### Primary Colors

```
Deep Blue (#1E3A8A)
RGB: 30, 58, 138
HSL: 218°, 64%, 33%
Use: Primary buttons, headings, links, CTAs, primary UI
```

```
Teal (#0D9488)
RGB: 13, 148, 136
HSL: 174°, 84%, 32%
Use: Hover states, secondary CTAs, accents, success states
```

```
Orange (#EA580C)
RGB: 234, 88, 12
HSL: 18°, 95%, 48%
Use: ONLY for critical alerts/attention (use sparingly)
```

### Neutral Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **White** | #FFFFFF | Main background |
| **Lightest Gray** | #F9FAFB | Secondary background, subtle contrast |
| **Light Gray** | #F3F4F6 | Hover states, disabled states |
| **Medium Gray** | #D1D5DB | Borders, dividers |
| **Dark Gray** | #6B7280 | Secondary text, placeholders |
| **Darkest Gray** | #111827 | Primary text, headings |

### Color Swatches (Tailwind Equivalents)

Since we use Tailwind CSS 4, stick to standard Tailwind colors:

| Semantic | Tailwind Class | Hex |
|----------|----------------|-----|
| **Primary** | `bg-blue-900`, `text-blue-900` | #1E3A8A |
| **Secondary** | `bg-teal-600`, `text-teal-600` | #0D9488 |
| **Accent** | `bg-orange-600`, `text-orange-600` | #EA580C |
| **Error** | `bg-red-600`, `text-red-600` | #DC2626 |
| **Success** | `bg-green-600`, `text-green-600` | #16A34A |
| **Warning** | `bg-yellow-500`, `text-yellow-500` | #EAB308 |

### What NOT to Do With Colors

❌ Gradients
```css
/* AVOID */
background: linear-gradient(135deg, #1E3A8A 0%, #0D9488 100%);
```

❌ Multiple overlapping colors
```css
/* AVOID */
background-color: rgba(30, 58, 138, 0.5);
box-shadow: inset 0 0 20px rgba(13, 148, 136, 0.3);
```

❌ Neon or very saturated colors
```css
/* AVOID */
color: #00FF00;
background: #FF00FF;
```

✅ Do This Instead
```css
/* GOOD */
background-color: #1E3A8A;
color: #FFFFFF;
border: 1px solid #D1D5DB;
```

---

## 3. Typography

### Font Stack

**Primary Font:** Inter (open-source, available via Google Fonts)

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Fallback:** `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

### Font Sizes & Line Heights

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|-----------------|
| **H1** | 48px | 700 | 1.2 (58px) | -0.5px |
| **H2** | 36px | 700 | 1.3 (47px) | -0.3px |
| **H3** | 28px | 600 | 1.4 (39px) | -0.2px |
| **H4** | 24px | 600 | 1.4 (34px) | 0 |
| **H5** | 20px | 600 | 1.5 (30px) | 0 |
| **H6** | 18px | 600 | 1.5 (27px) | 0 |
| **Body** | 16px | 400 | 1.6 (26px) | 0 |
| **Small** | 14px | 400 | 1.5 (21px) | 0 |
| **Caption** | 12px | 500 | 1.4 (17px) | 0.5px |
| **Button** | 16px | 600 | 1.5 (24px) | 0 |

### Tailwind Typography Utility

Use Tailwind typography if installed:

```jsx
<h1 className="text-5xl font-bold text-blue-900">Headline</h1>
<p className="text-base leading-relaxed text-gray-800">Body text here</p>
<small className="text-sm text-gray-600">Small caption</small>
```

### Text Color Hierarchy

1. **Primary text**: #111827 (darkest gray) — body copy
2. **Secondary text**: #6B7280 (medium gray) — descriptions, metadata
3. **Interactive text**: #1E3A8A (deep blue) — links, CTAs
4. **Disabled text**: #D1D5DB (light gray) — disabled buttons, inactive states

---

## 4. Layout & Spacing

### The 8px Grid

All spacing should be a multiple of 8px for consistency:

```
8px, 16px, 24px, 32px, 40px, 48px, 56px, 64px, 72px, 80px, 88px, 96px
```

**Tailwind classes:**
- `p-2` = 8px
- `p-4` = 16px
- `p-6` = 24px
- `p-8` = 32px
- `gap-4` = 16px gap
- `mb-6` = 24px margin-bottom

### Section Spacing

| Component | Top Margin | Bottom Margin | Use Case |
|-----------|-----------|--------------|----------|
| **Section heading** | 32px | 24px | Before major content |
| **Card/box** | 0 | 0 | Self-contained |
| **Form input** | 0 | 16px | Form fields |
| **Button** | 8px top | 0 | CTA buttons |

### Container Width

```css
/* Mobile */
max-width: 100%;
padding: 0 16px;

/* Tablet (640px) */
max-width: 640px;
padding: 0 24px;

/* Desktop (1024px) */
max-width: 1024px;
padding: 0 32px;

/* Large (1280px) */
max-width: 1280px;
padding: 0 40px;
```

---

## 5. Component Library

### Buttons

#### Primary Button (Most Used)

```jsx
<button className="px-6 py-3 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors">
  Get Started
</button>
```

**States:**
- Default: `bg-blue-900`
- Hover: `bg-blue-800`
- Active: `bg-blue-950`
- Disabled: `bg-gray-300 text-gray-500 cursor-not-allowed`

**Sizing:**
- Large: `px-8 py-4 text-lg`
- Medium: `px-6 py-3 text-base` (default)
- Small: `px-4 py-2 text-sm`

#### Secondary Button

```jsx
<button className="px-6 py-3 border-2 border-teal-600 text-teal-600 font-semibold rounded-lg hover:bg-teal-50 transition-colors">
  Learn More
</button>
```

**States:**
- Default: border + text color
- Hover: Subtle background (use teal-50)
- Active: Darker border

#### Tertiary/Ghost Button

```jsx
<button className="px-6 py-3 text-blue-900 hover:bg-blue-50 rounded-lg transition-colors">
  Cancel
</button>
```

### Cards

#### Standard Card

```jsx
<div className="bg-white border border-gray-200 rounded-lg p-6">
  <h3 className="text-xl font-bold text-blue-900 mb-2">Card Title</h3>
  <p className="text-gray-600">Card content goes here</p>
</div>
```

**DO:**
- Flat design with 1px border
- Subtle rounded corners (8px)
- Clean padding (16-24px)
- Light background or white

**DON'T:**
- ❌ Multiple shadows
- ❌ Pseudo-3D effects
- ❌ Gradient backgrounds
- ❌ Border radius too large

#### Hover State

```jsx
<div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:shadow-sm transition-all">
```

### Forms

#### Text Input

```jsx
<input 
  type="text"
  placeholder="Enter your name"
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition"
/>
```

#### Form Group (Label + Input)

```jsx
<div className="flex flex-col gap-2 mb-6">
  <label className="text-sm font-semibold text-gray-700">Email Address</label>
  <input 
    type="email"
    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900"
  />
  <span className="text-xs text-gray-500">We'll never share your email</span>
</div>
```

#### Select Dropdown

```jsx
<select className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer focus:ring-2 focus:ring-blue-900">
  <option>-- Select Option --</option>
  <option>Option 1</option>
</select>
```

**Key:** Use native selects (not custom UI) for accessibility

### Navigation

#### Header Nav

```jsx
<header className="bg-white border-b border-gray-200 sticky top-0 z-50">
  <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
    {/* Logo */}
    <div className="font-bold text-2xl text-blue-900">DN Tech</div>
    
    {/* Nav Links */}
    <nav className="hidden md:flex gap-8">
      <a href="/" className="text-gray-700 hover:text-blue-900 transition">Home</a>
      <a href="/services" className="text-gray-700 hover:text-blue-900 transition">Services</a>
      <a href="/blog" className="text-gray-700 hover:text-blue-900 transition">Blog</a>
    </nav>

    {/* CTA */}
    <button className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800">
      Contact Us
    </button>
  </div>
</header>
```

#### Mobile Menu (Hamburger)

```jsx
<button className="md:hidden p-2 text-gray-700">
  {isOpen ? <X size={24} /> : <Menu size={24} />}
</button>
```

Use Lucide React icons (`Menu`, `X`, `ChevronDown`).

### Modals/Dialogs

**DO:**
- Simple white background
- Centered overlay with clear dismiss
- 16px border radius
- Subtle shadow

```jsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-lg">
    <h2 className="text-2xl font-bold text-blue-900 mb-4">Modal Title</h2>
    <p className="text-gray-600 mb-6">Modal content here</p>
    <div className="flex gap-3">
      <button className="flex-1 px-4 py-2 bg-blue-900 text-white rounded-lg">OK</button>
      <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
    </div>
  </div>
</div>
```

### Badges & Tags

```jsx
{/* Success badge */}
<span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
  Active
</span>

{/* Neutral tag */}
<span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
  Feature
</span>

{/* Alert badge */}
<span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
  Important
</span>
```

### Dividers

```jsx
{/* Simple divider */}
<div className="border-t border-gray-200 my-8"></div>

{/* Section divider with text */}
<div className="relative my-8">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-gray-200"></div>
  </div>
  <div className="relative flex justify-center text-sm">
    <span className="px-2 bg-white text-gray-500">Or continue with</span>
  </div>
</div>
```

### Alerts

```jsx
{/* Info alert */}
<div className="bg-blue-50 border-l-4 border-blue-900 p-4 rounded">
  <p className="text-blue-900 font-semibold">Heads up!</p>
  <p className="text-blue-800 text-sm mt-1">This is an info message.</p>
</div>

{/* Success alert */}
<div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
  <p className="text-green-900 font-semibold">Success</p>
  <p className="text-green-800 text-sm mt-1">Your form has been submitted.</p>
</div>

{/* Error alert */}
<div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
  <p className="text-red-900 font-semibold">Error</p>
  <p className="text-red-800 text-sm mt-1">Something went wrong. Please try again.</p>
</div>
```

---

## 6. Imagery & Photography

### Photos

**DO:**
- ✅ Real photos of real team members
- ✅ Professional headshots (Candid or traditional)
- ✅ Candid office/meeting photos
- ✅ Screen captures of actual work
- ✅ Client projects (if you have them)

**DON'T:**
- ❌ Stock photos (Getty Images, Unsplash clichés)
- ❌ AI-generated photos
- ❌ Obviously staged "diverse team in meeting" stock photos
- ❌ Blurry or low-quality photos

### Icons

**Use:** Lucide React (open-source, clean, solid)

```jsx
import { Code2, Zap, Users, Shield } from 'lucide-react';

<Code2 size={32} className="text-blue-900" />
```

**DON'T use:**
- ❌ Heavily stylized icon packs (Lottie animations with gradients)
- ❌ Hand-drawn sketchy icons
- ❌ Emoji as design elements

### Illustrations

**If you must illustrate something:**
- Use **SVGs only** (no raster images)
- Stick to **one or two solid colors**
- Keep it **minimal & geometric**
- Avoid: organic curves, gradients, 3D effects

**Example good illustration:**
```svg
<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <!-- Solid color shapes only -->
  <rect x="20" y="20" width="40" height="40" fill="#1E3A8A"/>
  <circle cx="90" cy="40" r="20" fill="#0D9488"/>
</svg>
```

### Image Optimization

**All images must be:**
- Compressed (< 200KB for typical images)
- WebP format (with JPEG fallback)
- Lazy loaded (`loading="lazy"`)
- Responsive (`srcset`, `sizes`)
- Sized correctly (no stretching)

```jsx
<img
  src="/images/team-photo.webp"
  srcSet="/images/team-photo@2x.webp 2x"
  alt="DN Tech team members in office"
  loading="lazy"
  width={400}
  height={300}
  className="w-full rounded-lg"
/>
```

---

## 7. Animations & Interactions

### Philosophy: Minimal Motion

**DO:**
- ✅ Smooth hover transitions (200-300ms)
- ✅ Loading spinners (subtle, not flashy)
- ✅ Scroll-triggered fade-in (subtle, no parallax)
- ✅ Form validation feedback (error shake)

**DON'T:**
- ❌ Auto-playing videos (auto-sound)
- ❌ Page transitions with splashy effects
- ❌ Bouncy elastic animations
- ❌ Parallax scrolling
- ❌ Infinite animations (except spinners)

### Hover States

```jsx
{/* Simple color transition */}
<a href="/services" className="text-gray-700 hover:text-blue-900 transition-colors duration-200">
  Services
</a>

{/* Button hover */}
<button className="bg-blue-900 hover:bg-blue-800 active:bg-blue-950 transition-colors duration-200">
  Submit
</button>

{/* Card hover */}
<div className="border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300">
  Card content
</div>
```

### Loading States

```jsx
{/* Simple spinner */}
<div className="animate-spin">
  <Loader size={24} className="text-blue-900" />
</div>

{/* Or use Tailwind's built-in spinner */}
<div className="border-4 border-gray-200 border-t-blue-900 rounded-full w-8 h-8 animate-spin"></div>
```

### Scroll Animations

**DO:** Subtle fade-in on scroll (not parallax)

```jsx
import { useInView } from 'react-intersection-observer';

export function FadeInSection({ children }) {
  const { ref, inView } = useInView({ threshold: 0.1 });
  
  return (
    <div
      ref={ref}
      className={`transition-opacity duration-700 ${
        inView ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {children}
    </div>
  );
}
```

**DON'T:** Parallax, 3D transforms, heavy animations

---

## 8. Accessibility Standards

### WCAG 2.1 Level AA Compliance

#### Color Contrast

Every text must have minimum 4.5:1 contrast ratio:

| Text on | Contrast Ratio | Example |
|---------|----------------|---------|
| White background + Dark gray text | 7:1 ✅ | `#111827` on white |
| Blue background + White text | 9:1 ✅ | `#1E3A8A` on white |
| Gray background + Dark text | 4.5:1 ✅ | `#6B7280` on gray-100 |

**Test:** Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

#### Font Sizing

- Minimum body text: 16px
- Minimum labels: 14px
- Never use < 12px for user-facing content

#### Touch Targets

- Minimum clickable area: 48px × 48px
- Button minimum: 44px × 44px (mobile)
- Spacing between buttons: 8px minimum

#### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Focus ring visible (never remove outline without replacement)
- Tab order logical (left-to-right, top-to-bottom)

```css
/* Always keep focus visible */
:focus {
  outline: 3px solid #1E3A8A;
  outline-offset: 2px;
}
```

#### Images & Icons

- All images must have descriptive alt text
- Icons must have aria-label if no accompanying text

```jsx
<img 
  src="/team.jpg" 
  alt="DN Tech team of 8 developers in Jakarta office"
/>

<button aria-label="Close menu">
  <X size={24} />
</button>
```

#### Forms

- All inputs must have associated labels
- Error messages must be linked to inputs

```jsx
<div>
  <label htmlFor="email" className="block text-sm font-semibold mb-2">
    Email
  </label>
  <input 
    id="email" 
    type="email"
    aria-invalid={hasError}
    aria-describedby={hasError ? 'email-error' : undefined}
  />
  {hasError && <span id="email-error" className="text-red-600 text-sm">Invalid email</span>}
</div>
```

---

## 9. Mobile Design

### Breakpoints

Use Tailwind's standard breakpoints:

| Breakpoint | Width | Use |
|-----------|-------|-----|
| **Mobile** | 320px - 639px | Default (mobile-first) |
| **Tablet** | 640px - 1023px | `sm:` prefix |
| **Desktop** | 1024px - 1279px | `lg:` prefix |
| **Large** | 1280px+ | `xl:` prefix |

### Mobile-First Approach

Write styles for mobile first, then add breakpoints:

```jsx
{/* Mobile (default) */}
<div className="flex flex-col gap-4 px-4">
  {/* Desktop (add lg: for changes) */}
  <div className="lg:flex-row lg:px-8 lg:gap-8">
    Content
  </div>
</div>
```

### Touch Interactions

- Buttons: minimum 48px × 48px
- Spacing: minimum 8px between touch targets
- Long press: avoid (use swipe or tap instead)
- Hover states: work on desktop only, not mobile

### Mobile Navigation

```jsx
{/* Hamburger menu for mobile */}
<div className="lg:hidden">
  <button onClick={toggleMenu} aria-label="Toggle menu">
    {isOpen ? <X /> : <Menu />}
  </button>
  
  {isOpen && (
    <nav className="absolute top-full left-0 right-0 bg-white border-t border-gray-200">
      {/* Mobile menu items */}
    </nav>
  )}
</div>

{/* Desktop menu always visible */}
<nav className="hidden lg:flex gap-8">
  {/* Desktop menu items */}
</nav>
```

---

## 10. Dark Mode (Optional)

**Current status:** Not required for v2, but design should be dark-mode ready.

If implemented in future:

```jsx
{/* Use CSS variables or Tailwind dark: prefix */}
<div className="bg-white dark:bg-gray-900">
  <p className="text-gray-900 dark:text-gray-100">Text</p>
</div>
```

**Colors in dark mode:**
- Dark background: `#111827`
- Light text: `#F9FAFB`
- Accent colors: same (Blue, Teal remain)

---

## 11. Performance Considerations

### Bundle Size

- Keep component library lightweight
- Lazy load heavy components (modals, carousels)
- Code split by route

### Image Performance

- WebP with fallback
- Responsive images (`srcset`)
- Lazy loading
- Compression (ImageOptim, TinyPNG)

### CSS

- Use Tailwind's built-in utilities (no custom CSS unless necessary)
- Purge unused styles in production (`tailwind.config.js`)
- Avoid `@apply` overuse (inline utilities preferred)

### JavaScript

- Minimal client-side logic
- React Server Components where possible
- No huge libraries (lodash if needed, use native alternatives)

---

## 12. Brand Voice & Copy

### Tone

1. **Professional** — We know our stuff
2. **Friendly** — We're humans, not robots
3. **Clear** — No jargon without explanation
4. **Helpful** — We genuinely want to help

### Writing Guidelines

**DO:**
- ✅ Use active voice: "We build custom apps"
- ✅ Second person when possible: "You need a reliable partner"
- ✅ Contractions: "We're building", "You'll love this"
- ✅ Short sentences (12-15 words average)
- ✅ Concrete examples

**DON'T:**
- ❌ Corporate buzzwords: "synergize", "leverage", "facilitate"
- ❌ Passive voice: "Custom apps are built by us"
- ❌ Hype: "Revolutionary", "Game-changing", "Best in class"
- ❌ ALL CAPS (except for acronyms)
- ❌ Fake enthusiasm

### CTA Copy

**Weak:** "Submit"  
**Good:** "Get Started" or "Schedule Consultation"

**Weak:** "Click Here"  
**Good:** "Explore Our Services"

**Weak:** "Apply Now"  
**Good:** "Apply for [Position]"

---

## 13. Spacing Grid Reference

```
MARGIN / PADDING
2   = 8px
3   = 12px
4   = 16px
5   = 20px
6   = 24px
8   = 32px
10  = 40px
12  = 48px
16  = 64px
20  = 80px

Tailwind: use p-4, m-6, gap-8, etc.
```

### Common Spacing Patterns

| Use Case | Spacing |
|----------|---------|
| Section padding | `p-8` to `p-12` (desktop) / `p-6` (mobile) |
| Card padding | `p-6` |
| Input field vertical spacing | `mb-4` |
| Between sections | `my-12` to `my-16` |
| Between list items | `gap-4` |

---

## 14. Checklist for Every Design

Before shipping any page:

- [ ] Colors: Using only primary palette (no random colors)
- [ ] Typography: Consistent sizing and weight
- [ ] Spacing: Multiples of 8px
- [ ] Buttons: Minimum 48px tall on mobile
- [ ] Images: Compressed, WebP format, alt text
- [ ] Forms: Labels, error handling, success states
- [ ] Accessibility: WCAG AA contrast, keyboard nav, alt text
- [ ] Mobile: Responsive, touch-friendly, tested on device
- [ ] Performance: Lighthouse > 80
- [ ] Copy: No buzzwords, clear value proposition
- [ ] Empty states: Shows when no data available
- [ ] Loading states: Clear feedback during waiting
- [ ] Error states: Helpful error messages

---

## 15. Design Debt & Improvements

### Known Limitations (v2.0)

- No dark mode support yet
- Limited animation library
- Icons only from Lucide React (no custom SVGs)
- Forms are basic (no advanced fields)

### Future Enhancements (v2.1+)

- [ ] Dark mode support
- [ ] Expanded component library
- [ ] Design tokens (CSS variables)
- [ ] Storybook component docs
- [ ] Figma design file
- [ ] Animation library (Framer Motion integration)

---

## Appendix: Quick Reference

### DO's ✅
- Solid colors
- White space
- Real photos
- Clear hierarchy
- Accessibility first
- Purposeful design

### DON'Ts ❌
- Gradients
- Glassmorphism
- AI graphics
- Excessive shadows
- Stock photos
- Fancy for fancy's sake

---

**Design System Owner:** Design Team  
**Last Updated:** Juli 2026  
**Next Review:** Agustus 2026

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026

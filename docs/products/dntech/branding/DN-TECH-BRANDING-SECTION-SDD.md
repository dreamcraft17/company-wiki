# DN Tech Branding Section — SDD
## System Design Detail (Implementation Code)

**Date:** Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Baseline:** [DN-TECH-BRANDING-SECTION-PRD.md](./DN-TECH-BRANDING-SECTION-PRD.md)

---

## 📋 Overview

Branding section akan diimplementasi sebagai **6 komponen React terpisah**, masing-masing connected ke **CMS via API**.

**Component list:**
1. BrandStory (2-column: image + text)
2. Values (5-card grid)
3. WhyChooseUs (4 cards)
4. TeamSpotlight (5-person grid)
5. Testimonials (carousel)
6. Stats (4 metrics)

**Location:** Homepage (setelah hero, sebelum existing services section)

---

## Task 1: Create CMS Models (Prisma)

### File: `backend/prisma/schema.prisma`

**Add these models:**

```prisma
// Brand/About page content
model BrandContent {
  id            String    @id @default(cuid())
  tagline       String    // "Tentang DN Tech"
  story         String    @db.Text  // 150-300 words
  mission       String    @db.Text  // 1-2 sentences
  imageUrl      String?   // Company photo or illustration
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([id])
}

// Core values
model CoreValue {
  id            String    @id @default(cuid())
  name          String    // "Pragmatik"
  description   String    @db.Text  // 1-2 sentences
  iconName      String    // Lucide icon name
  order         Int       @default(0)  // For sorting
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([order])
}

// Competitive advantages
model CompetitiveAdvantage {
  id            String    @id @default(cuid())
  title         String    // "Local + Expert"
  description   String    @db.Text
  iconName      String    // Lucide icon name
  order         Int       @default(0)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([order])
}

// Team members
model TeamMember {
  id            String    @id @default(cuid())
  name          String
  role          String    // "Founder & Tech Lead"
  bio           String    @db.Text  // 2-3 sentences
  photoUrl      String?   // Headshot URL from media uploader
  linkedinUrl   String?
  twitterUrl    String?
  order         Int       @default(0)
  published     Boolean   @default(true)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([published, order])
}

// Client testimonials
model Testimonial {
  id            String    @id @default(cuid())
  quote         String    @db.Text  // 50-100 words
  author        String    // Client name
  title         String    // Job title
  company       String?   // Company name
  logoUrl       String?   // Company logo URL
  published     Boolean   @default(true)
  order         Int       @default(0)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([published, order])
}

// Key metrics/stats
model Stat {
  id            String    @id @default(cuid())
  label         String    // "Proyek Selesai"
  value         Int       // 50
  iconName      String    // Lucide icon name
  order         Int       @default(0)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([order])
}
```

**Run migration:**

```bash
cd backend
npx prisma migrate dev --name add_branding_models
npx prisma db push
```

---

## Task 2: Create Admin Pages (CRUD)

### File: `frontend/src/app/admin/branding/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface BrandContent {
  id: string;
  tagline: string;
  story: string;
  mission: string;
  imageUrl?: string;
}

export default function BrandingAdminPage() {
  const [content, setContent] = useState<BrandContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchBrandContent();
  }, []);

  const fetchBrandContent = async () => {
    try {
      const res = await fetch('/api/v1/admin/branding/content');
      const data = await res.json();
      setContent(data.data);
    } catch (error) {
      console.error('Failed to fetch brand content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await fetch('/api/v1/admin/branding/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      setEditing(false);
      alert('Konten brand berhasil disimpan!');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Gagal menyimpan konten');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!content) return <div>Tidak ada data</div>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Branding Content</h1>

      <Card className="p-6 space-y-4">
        <div>
          <label className="block font-semibold mb-2">Tagline</label>
          <Input
            value={content.tagline}
            onChange={(e) => setContent({ ...content, tagline: e.target.value })}
            disabled={!editing}
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Mission</label>
          <textarea
            value={content.mission}
            onChange={(e) => setContent({ ...content, mission: e.target.value })}
            disabled={!editing}
            className="w-full border rounded p-2 h-20"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Brand Story</label>
          <textarea
            value={content.story}
            onChange={(e) => setContent({ ...content, story: e.target.value })}
            disabled={!editing}
            className="w-full border rounded p-2 h-32"
          />
        </div>

        <div className="flex gap-2">
          {!editing ? (
            <Button onClick={() => setEditing(true)}>Edit</Button>
          ) : (
            <>
              <Button onClick={handleSave}>Save</Button>
              <Button variant="secondary" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
```

### File: `frontend/src/app/admin/branding/values/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Plus, Trash2 } from 'lucide-react';

interface CoreValue {
  id: string;
  name: string;
  description: string;
  iconName: string;
  order: number;
}

export default function ValuesAdminPage() {
  const [values, setValues] = useState<CoreValue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchValues();
  }, []);

  const fetchValues = async () => {
    try {
      const res = await fetch('/api/v1/admin/branding/values');
      const data = await res.json();
      setValues(data.data || []);
    } catch (error) {
      console.error('Failed to fetch values:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus value ini?')) {
      try {
        await fetch(`/api/v1/admin/branding/values/${id}`, {
          method: 'DELETE',
        });
        fetchValues();
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Core Values</h1>
        <Button>
          <Plus className="w-4 h-4" /> Add Value
        </Button>
      </div>

      <div className="space-y-3">
        {values.map((value) => (
          <Card key={value.id} className="p-4 flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{value.name}</h3>
              <p className="text-gray-600 text-sm">{value.description}</p>
            </div>
            <button
              onClick={() => handleDelete(value.id)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

**Similar CRUD pages for:**
- `/admin/branding/advantages`
- `/admin/team`
- `/admin/testimonials`
- `/admin/stats`

---

## Task 3: Create API Routes

### File: `backend/src/routes/branding.ts`

```typescript
import { Router, Request, Response } from 'express';
import { prisma } from '@/lib/prisma';
import { logger } from '@/utils/logger';

const router = Router();

/**
 * GET /api/v1/branding/content
 * Public: Get brand story + mission
 */
router.get('/content', async (req: Request, res: Response) => {
  try {
    const content = await prisma.brandContent.findFirst();
    res.json({ success: true, data: content });
  } catch (error) {
    logger.error('Failed to fetch brand content:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch content' });
  }
});

/**
 * GET /api/v1/branding/values
 * Public: Get all core values
 */
router.get('/values', async (req: Request, res: Response) => {
  try {
    const values = await prisma.coreValue.findMany({
      orderBy: { order: 'asc' },
    });
    res.json({ success: true, data: values });
  } catch (error) {
    logger.error('Failed to fetch values:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch values' });
  }
});

/**
 * GET /api/v1/branding/advantages
 * Public: Get competitive advantages
 */
router.get('/advantages', async (req: Request, res: Response) => {
  try {
    const advantages = await prisma.competitiveAdvantage.findMany({
      orderBy: { order: 'asc' },
    });
    res.json({ success: true, data: advantages });
  } catch (error) {
    logger.error('Failed to fetch advantages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch' });
  }
});

/**
 * GET /api/v1/branding/team
 * Public: Get team members
 */
router.get('/team', async (req: Request, res: Response) => {
  try {
    const team = await prisma.teamMember.findMany({
      where: { published: true },
      orderBy: { order: 'asc' },
    });
    res.json({ success: true, data: team });
  } catch (error) {
    logger.error('Failed to fetch team:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch team' });
  }
});

/**
 * GET /api/v1/branding/testimonials
 * Public: Get testimonials
 */
router.get('/testimonials', async (req: Request, res: Response) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { published: true },
      orderBy: { order: 'asc' },
    });
    res.json({ success: true, data: testimonials });
  } catch (error) {
    logger.error('Failed to fetch testimonials:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch' });
  }
});

/**
 * GET /api/v1/branding/stats
 * Public: Get key metrics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await prisma.stat.findMany({
      orderBy: { order: 'asc' },
    });
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('Failed to fetch stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

// Admin endpoints (PUT, POST, DELETE)
// ... similar pattern for admin CRUD operations

export default router;
```

**Register in main Express app:**

```typescript
// backend/src/index.ts
import brandingRoutes from '@/routes/branding';

app.use('/api/v1/branding', brandingRoutes);
```

---

## Task 4: Create Frontend Components

### File: `frontend/src/components/branding/BrandStory.tsx`

```typescript
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface BrandContent {
  id: string;
  tagline: string;
  story: string;
  mission: string;
  imageUrl?: string;
}

export function BrandStory() {
  const [content, setContent] = useState<BrandContent | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch('/api/v1/branding/content');
        const data = await res.json();
        setContent(data.data);
      } catch (error) {
        console.error('Failed to fetch brand content:', error);
      }
    };
    fetchContent();
  }, []);

  if (!content) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div>
            {content.imageUrl ? (
              <Image
                src={content.imageUrl}
                alt="DN Tech"
                width={400}
                height={400}
                className="rounded-lg"
              />
            ) : (
              <div className="bg-blue-900/10 rounded-lg h-96 flex items-center justify-center">
                <span className="text-gray-500">Company Image</span>
              </div>
            )}
          </div>

          {/* Text */}
          <div className="space-y-6">
            <div>
              <p className="text-blue-900 font-semibold text-sm uppercase tracking-wide">
                {content.tagline}
              </p>
              <h2 className="text-4xl font-bold text-gray-900 mt-2">
                Tentang DN Tech
              </h2>
            </div>

            <p className="text-gray-600 leading-relaxed">
              {content.story}
            </p>

            <div className="bg-blue-900/5 border-l-4 border-blue-900 p-4">
              <p className="text-blue-900 font-semibold">
                {content.mission}
              </p>
            </div>

            <a
              href="/contact"
              className="inline-block px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
            >
              Mulai Sekarang
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### File: `frontend/src/components/branding/CoreValues.tsx`

```typescript
import { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';

interface CoreValue {
  id: string;
  name: string;
  description: string;
  iconName: string;
  order: number;
}

export function CoreValues() {
  const [values, setValues] = useState<CoreValue[]>([]);

  useEffect(() => {
    const fetchValues = async () => {
      try {
        const res = await fetch('/api/v1/branding/values');
        const data = await res.json();
        setValues(data.data || []);
      } catch (error) {
        console.error('Failed to fetch values:', error);
      }
    };
    fetchValues();
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900">Nilai-Nilai Kami</h2>
          <p className="text-gray-600 mt-2">
            Prinsip yang memandu setiap keputusan kami
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {values.map((value) => {
            // Dynamic icon rendering
            const IconComponent = (LucideIcons as any)[value.iconName] || null;

            return (
              <div
                key={value.id}
                className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-900 transition-colors"
              >
                {IconComponent && (
                  <IconComponent className="w-8 h-8 text-blue-900 mb-4" />
                )}
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {value.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

### File: `frontend/src/components/branding/TeamSpotlight.tsx`

```typescript
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl?: string;
}

export function TeamSpotlight() {
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch('/api/v1/branding/team');
        const data = await res.json();
        setTeam(data.data || []);
      } catch (error) {
        console.error('Failed to fetch team:', error);
      }
    };
    fetchTeam();
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900">Tim Kami</h2>
          <p className="text-gray-600 mt-2">
            Expert yang passionate membantu bisnis Anda
          </p>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
          {team.map((member) => (
            <div key={member.id} className="text-center">
              <div className="mb-4">
                {member.photoUrl ? (
                  <Image
                    src={member.photoUrl}
                    alt={member.name}
                    width={150}
                    height={150}
                    className="rounded-lg w-full aspect-square object-cover"
                  />
                ) : (
                  <div className="bg-gray-200 rounded-lg w-full aspect-square flex items-center justify-center">
                    <span className="text-gray-500">No photo</span>
                  </div>
                )}
              </div>
              <h3 className="font-bold text-gray-900">{member.name}</h3>
              <p className="text-teal-600 text-sm font-medium">{member.role}</p>
              <p className="text-gray-600 text-xs mt-2">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### File: `frontend/src/components/branding/Testimonials.tsx`

```typescript
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  title: string;
  company?: string;
  logoUrl?: string;
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch('/api/v1/branding/testimonials');
        const data = await res.json();
        setTestimonials(data.data || []);
      } catch (error) {
        console.error('Failed to fetch testimonials:', error);
      }
    };
    fetchTestimonials();
  }, []);

  if (!testimonials.length) return null;

  const testimonial = testimonials[current];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Apa Kata Klien Kami
        </h2>

        <div className="bg-white p-8 rounded-lg border-l-4 border-teal-600">
          {testimonial.logoUrl && (
            <Image
              src={testimonial.logoUrl}
              alt={testimonial.company || ''}
              width={100}
              height={50}
              className="mb-4"
            />
          )}

          <p className="text-lg text-gray-900 italic mb-6">
            "{testimonial.quote}"
          </p>

          <div>
            <p className="font-bold text-gray-900">{testimonial.author}</p>
            <p className="text-gray-600 text-sm">{testimonial.title}</p>
            {testimonial.company && (
              <p className="text-gray-500 text-sm">{testimonial.company}</p>
            )}
          </div>
        </div>

        {/* Carousel navigation */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === current ? 'bg-blue-900' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrent((c) => (c + 1) % testimonials.length)}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
}
```

### File: `frontend/src/components/branding/Stats.tsx`

```typescript
import { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';

interface Stat {
  id: string;
  label: string;
  value: number;
  iconName: string;
}

export function Stats() {
  const [stats, setStats] = useState<Stat[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/v1/branding/stats');
        const data = await res.json();
        setStats(data.data || []);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <section className="py-12 bg-blue-900/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {stats.map((stat) => {
            const IconComponent = (LucideIcons as any)[stat.iconName] || null;

            return (
              <div key={stat.id} className="text-center">
                {IconComponent && (
                  <IconComponent className="w-8 h-8 text-blue-900 mx-auto mb-4" />
                )}
                <p className="text-4xl font-bold text-blue-900">
                  {stat.value}+
                </p>
                <p className="text-gray-600 mt-2">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

---

## Task 5: Add Components to Homepage

### File: `frontend/src/app/(public)/page.tsx`

**Update to include branding sections:**

```typescript
import { Hero } from '@/components/layout/Hero';
import { Stats } from '@/components/branding/Stats';
import { BrandStory } from '@/components/branding/BrandStory';
import { CoreValues } from '@/components/branding/CoreValues';
import { TeamSpotlight } from '@/components/branding/TeamSpotlight';
import { Testimonials } from '@/components/branding/Testimonials';
import { Services } from '@/components/sections/Services';
import { Newsletter } from '@/components/sections/Newsletter';
import { Footer } from '@/components/common/Footer';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Stats />  {/* NEW */}
      <BrandStory />  {/* NEW */}
      <CoreValues />  {/* NEW */}
      <TeamSpotlight />  {/* NEW */}
      <Testimonials />  {/* NEW */}
      <Services />
      <Newsletter />
      <Footer />
    </main>
  );
}
```

---

## Task 6: Data Seeding (Optional)

### File: `backend/scripts/seed-branding.ts`

```typescript
import { prisma } from '@/lib/prisma';

async function seedBranding() {
  // Clear existing data
  await prisma.brandContent.deleteMany();
  await prisma.coreValue.deleteMany();
  await prisma.stat.deleteMany();

  // Create brand content
  await prisma.brandContent.create({
    data: {
      tagline: 'Tentang DN Tech',
      mission: 'Kami membangun software yang memberdayakan bisnis Indonesia untuk berkembang dan berinovasi.',
      story: `DN Tech adalah software house Indonesia yang fokus pada solusi custom untuk startup dan perusahaan menengah.

Didirikan oleh Dozer Napitupulu, kami memulai dengan visi sederhana: membuat teknologi yang accessible tapi professional untuk bisnis lokal.

Kami percaya bahwa teknologi seharusnya mempermudah, bukan memperumit. Setiap project adalah partnership, bukan transaksi.

Sampai hari ini, kami sudah bantu 50+ perusahaan Indonesia transform business mereka dengan software yang tepat.`,
    },
  });

  // Create values
  const values = [
    {
      name: 'Pragmatik',
      description: 'Solusi yang kerja, bukan fancy tapi useless',
      iconName: 'Wrench',
    },
    {
      name: 'Jujur',
      description: 'Transparent pricing, realistic timelines',
      iconName: 'Handshake',
    },
    {
      name: 'Fokus Klien',
      description: 'Success klien = success kami',
      iconName: 'Target',
    },
    {
      name: 'Quality First',
      description: 'Code bersih, tested, documented',
      iconName: 'CheckCircle',
    },
    {
      name: 'Growth Mindset',
      description: 'Terus belajar dan improve',
      iconName: 'TrendingUp',
    },
  ];

  for (const [index, value] of values.entries()) {
    await prisma.coreValue.create({
      data: {
        ...value,
        order: index,
      },
    });
  }

  // Create stats
  const stats = [
    { label: 'Proyek Selesai', value: 50, iconName: 'CheckCircle', order: 0 },
    { label: 'Klien Puas', value: 30, iconName: 'Smile', order: 1 },
    { label: 'Tahun di Industri', value: 5, iconName: 'Calendar', order: 2 },
    { label: 'On-time Delivery', value: 100, iconName: 'Zap', order: 3 },
  ];

  for (const stat of stats) {
    await prisma.stat.create({ data: stat });
  }

  console.log('✅ Branding data seeded');
}

seedBranding().catch(console.error);
```

**Run:**
```bash
npx ts-node backend/scripts/seed-branding.ts
```

---

## Testing Checklist

```
[ ] API endpoints working
    [ ] GET /api/v1/branding/content
    [ ] GET /api/v1/branding/values
    [ ] GET /api/v1/branding/team
    [ ] GET /api/v1/branding/testimonials
    [ ] GET /api/v1/branding/stats

[ ] Frontend components render
    [ ] Stats section loads
    [ ] Brand story loads with image
    [ ] Values cards display correctly
    [ ] Team grid responsive
    [ ] Testimonials carousel works
    [ ] All icons render

[ ] Admin pages work
    [ ] Can edit brand content
    [ ] Can add/edit values
    [ ] Can add/edit team members
    [ ] Can add/edit testimonials

[ ] Mobile responsive
    [ ] Stats: 2 columns on mobile
    [ ] Brand story: stacked on mobile
    [ ] Team: 2-3 columns on mobile
    [ ] Testimonials: full width on mobile

[ ] Performance
    [ ] Lighthouse ≥85
    [ ] Images optimized
    [ ] No console errors
```

---

**Status:** Ready to implement  
**Components:** 6 React components  
**API endpoints:** 6 GET routes + admin CRUD  
**CMS models:** 6 Prisma models  
**Time estimate:** 8-10 hours (full implementation + testing)

---

**Owner:** Dozer (CEO + Tech Lead)  
**Date:** Juli 2026  
**Version:** Branding Section SDD v1

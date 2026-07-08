/**
 * Trusted Jurist Example Pages
 * Homepage & Contact Page implementation
 */

import React, { useState } from 'react';
import {
  Button,
  Input,
  Textarea,
  Alert,
  PracticeAreaCard,
  TeamMemberCard,
  JobPostingCard,
  Badge,
} from './02-ui-components';
import {
  Navbar,
  HeroSection,
  ContentSection,
  TwoColumnSection,
  GridSection,
  Footer,
  Container,
  Breadcrumb,
} from './03-layout-components';
import {
  Briefcase,
  Code,
  Heart,
  Scale,
  CheckCircle,
  Users,
  Award,
  Globe,
} from 'lucide-react';

// ============================================
// HOMEPAGE
// ============================================

export const HomePage: React.FC = () => {
  const navItems = [
    { label: 'Tentang', href: '#about' },
    { label: 'Praktik', href: '#practice' },
    { label: 'Tim', href: '#team' },
    { label: 'Karir', href: '#careers' },
    { label: 'Kontak', href: '#contact' },
  ];

  const trustIndicators = [
    { icon: '⭐', text: 'Didirikan 2010' },
    { icon: '📍', text: 'Jakarta Timur' },
    { icon: '⚖️', text: '50+ Kasus' },
    { icon: '👥', text: '15+ Tim' },
  ];

  const practiceAreas = [
    {
      icon: <Briefcase size={48} />,
      title: 'Hukum Korporat',
      description: 'Layanan hukum bisnis dan korporat untuk perusahaan skala besar.',
    },
    {
      icon: <Code size={48} />,
      title: 'Hukum Teknologi',
      description: 'Spesialisasi dalam regulasi teknologi dan inovasi digital.',
    },
    {
      icon: <Heart size={48} />,
      title: 'Hukum Keluarga',
      description: 'Konsultasi mendalam untuk masalah keluarga dan perdata.',
    },
    {
      icon: <Scale size={48} />,
      title: 'Litigasi',
      description: 'Pendampingan hukum dalam sengketa perdata dan pidana.',
    },
  ];

  const teamMembers = [
    {
      name: 'Dr. Andin Sofyanoor, SH., MH.',
      title: 'Founder & Managing Partner',
      bio: 'Praktisi hukum berpengalaman 20+ tahun di bidang korporat.',
      image: 'https://via.placeholder.com/300x400?text=Team+Member',
    },
    {
      name: 'Budi Santoso, S.H.',
      title: 'Senior Associate',
      bio: 'Spesialis hukum teknologi dan intellectual property.',
      image: 'https://via.placeholder.com/300x400?text=Team+Member',
    },
    {
      name: 'Siti Nurhaliza, S.H., M.B.A.',
      title: 'Associate',
      bio: 'Ahli dalam kasus litigasi perdata dan komersial.',
      image: 'https://via.placeholder.com/300x400?text=Team+Member',
    },
  ];

  const jobs = [
    {
      title: 'Fullstack Engineer',
      level: 'Mid' as const,
      description: 'Bergabung dengan tim tech kami untuk mengembangkan platform hukum digital.',
    },
    {
      title: 'Associate Lawyer',
      level: 'Junior' as const,
      description: 'Kesempatan emas untuk belajar dari praktisi berpengalaman.',
    },
    {
      title: 'Legal Counsel',
      level: 'Senior' as const,
      description: 'Posisi senior untuk membimbing tim dalam kasus kompleks.',
    },
  ];

  return (
    <>
      {/* Navbar */}
      <Navbar
        logo="https://via.placeholder.com/120x40?text=TJ"
        navItems={navItems}
        onConsult={() => {
          window.location.href = '#contact';
        }}
        isTransparent={true}
      />

      {/* Hero Section */}
      <HeroSection
        headline="Firma Hukum Terpercaya di Jakarta"
        subheadline="Memberikan solusi hukum berkualitas tinggi untuk bisnis dan individu dengan integritas dan profesionalisme."
        backgroundImage="https://via.placeholder.com/1440x800?text=Hero+Background"
        cta1Text="Konsultasi Sekarang"
        cta2Text="Pelajari Lebih Lanjut"
        onCta1={() => {
          window.location.href = '#contact';
        }}
        trustIndicators={trustIndicators}
      />

      {/* Credibility Section */}
      <GridSection
        title="Mengapa Memilih Trusted Jurist"
        subtitle="Komitmen kami terhadap excellence dan kepercayaan klien"
        columns={3}
        backgroundColor="cream"
      >
        {[
          { icon: <CheckCircle size={48} />, title: 'Profesional', desc: 'Tim berpengalaman 15+ tahun' },
          { icon: <Users size={48} />, title: 'Terpercaya', desc: 'Ratusan klien puas' },
          { icon: <Award size={48} />, title: 'Berprestasi', desc: 'Award pemenang 3x' },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center text-center gap-3">
            <div className="text-gold-500">{item.icon}</div>
            <h4 className="text-h4-lg font-serif font-semibold text-navy-700">{item.title}</h4>
            <p className="text-body text-gray-text">{item.desc}</p>
          </div>
        ))}
      </GridSection>

      {/* About Section */}
      <TwoColumnSection
        title="Tentang Trusted Jurist"
        subtitle="Perjalanan menuju keunggulan hukum"
        image="https://via.placeholder.com/500x400?text=About+Section"
        imagePosition="left"
        content="Trusted Jurist didirikan pada tahun 2010 dengan visi menjadi firma hukum terkemuka di Indonesia. Kami berkomitmen memberikan layanan hukum berkualitas tinggi dengan pendekatan inovatif dan client-centric."
        cta={{ text: 'Baca Selengkapnya', onClick: () => console.log('About page') }}
        backgroundColor="white"
      />

      {/* Practice Areas Section */}
      <GridSection
        title="Area Praktik Kami"
        subtitle="Layanan hukum komprehensif untuk berbagai kebutuhan"
        columns={4}
        backgroundColor="white"
      >
        {practiceAreas.map((area, i) => (
          <PracticeAreaCard
            key={i}
            icon={area.icon}
            title={area.title}
            description={area.description}
            onConsult={() => console.log(`Konsultasi ${area.title}`)}
          />
        ))}
      </GridSection>

      {/* Team Section */}
      <ContentSection
        title="Tim Kami"
        subtitle="Praktisi hukum berpengalaman dan profesional"
        backgroundColor="cream"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member, i) => (
            <TeamMemberCard
              key={i}
              name={member.name}
              title={member.title}
              bio={member.bio}
              image={member.image}
            />
          ))}
        </div>
      </ContentSection>

      {/* Careers Section */}
      <ContentSection
        title="Bergabung Dengan Kami"
        subtitle="Kami mencari talenta terbaik untuk tim kami"
        backgroundColor="white"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {jobs.map((job, i) => (
            <JobPostingCard
              key={i}
              title={job.title}
              level={job.level}
              description={job.description}
              onApply={() => console.log(`Apply: ${job.title}`)}
            />
          ))}
        </div>
        <div className="text-center">
          <Button variant="secondary" size="md">
            Lihat Semua Posisi
          </Button>
        </div>
      </ContentSection>

      {/* Footer */}
      <Footer
        logo="https://via.placeholder.com/120x40?text=TJ"
        description="Firma hukum terkemuka di Jakarta dengan dedikasi tinggi terhadap keunggulan dan integritas."
        email="contact@trustedjurist.co.id"
        phone="+62 21 XXXX XXXX"
        whatsapp="628XXXXXXXXX"
        address="Jakarta Timur, Indonesia"
        sections={[
          {
            title: 'Navigasi',
            links: [
              { label: 'Tentang', href: '/' },
              { label: 'Praktik', href: '/' },
              { label: 'Tim', href: '/' },
              { label: 'Karir', href: '/' },
            ],
          },
          {
            title: 'Legal',
            links: [
              { label: 'Kebijakan Privasi', href: '/' },
              { label: 'Syarat & Ketentuan', href: '/' },
            ],
          },
        ]}
        copyrightText="© {year} Trusted Jurist. All rights reserved."
      />
    </>
  );
};

// ============================================
// CONTACT PAGE
// ============================================

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = 'Nama harus diisi';
    if (!formData.email.trim()) newErrors.email = 'Email harus diisi';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Format email tidak valid';
    if (!formData.phone.trim()) newErrors.phone = 'Nomor telepon harus diisi';
    if (!formData.subject.trim()) newErrors.subject = 'Subjek harus diisi';
    if (!formData.message.trim()) newErrors.message = 'Pesan harus diisi';

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      // Simulasi pengiriman form
      setSubmitted(true);
      console.log('Form submitted:', formData);

      // Reset form setelah 3 detik
      setTimeout(() => {
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setSubmitted(false);
      }, 3000);
    } else {
      setErrors(newErrors);
    }
  };

  const navItems = [
    { label: 'Beranda', href: '/' },
    { label: 'Tentang', href: '/' },
    { label: 'Praktik', href: '/' },
    { label: 'Tim', href: '/' },
  ];

  return (
    <>
      {/* Navbar */}
      <Navbar
        logo="https://via.placeholder.com/120x40?text=TJ"
        navItems={navItems}
      />

      {/* Breadcrumb */}
      <div className="bg-gray-light">
        <Container className="py-4">
          <Breadcrumb
            items={[
              { label: 'Beranda', href: '/' },
              { label: 'Hubungi Kami' },
            ]}
          />
        </Container>
      </div>

      {/* Hero Section (Small) */}
      <ContentSection
        title="Hubungi Kami"
        subtitle="Kami siap membantu menjawab pertanyaan dan kebutuhan hukum Anda"
        backgroundColor="cream"
      />

      {/* Contact Section */}
      <ContentSection backgroundColor="white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Contact Form */}
          <div className="md:col-span-2">
            <h3 className="text-h3-lg font-serif font-semibold text-navy-700 mb-6">
              Kirim Pesan
            </h3>

            {submitted && (
              <Alert
                type="success"
                message="Pesan Anda telah terkirim! Kami akan segera menghubungi Anda."
                onClose={() => setSubmitted(false)}
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  id="name"
                  name="name"
                  label="Nama Lengkap"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                />
                <Input
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                />
              </div>

              <Input
                id="phone"
                name="phone"
                label="Nomor Telepon"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                required
              />

              <Input
                id="subject"
                name="subject"
                label="Subjek"
                value={formData.subject}
                onChange={handleChange}
                error={errors.subject}
                required
              />

              <Textarea
                id="message"
                name="message"
                label="Pesan"
                value={formData.message}
                onChange={handleChange}
                error={errors.message}
                required
              />

              <Button variant="primary" size="md" type="submit" className="w-full">
                Kirim Pesan
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-h3-lg font-serif font-semibold text-navy-700 mb-6">
              Informasi Kontak
            </h3>

            <div className="space-y-6">
              {/* Email */}
              <div>
                <h4 className="text-h4-lg font-serif font-semibold text-navy-700 mb-2">
                  Email
                </h4>
                <a
                  href="mailto:contact@trustedjurist.co.id"
                  className="text-body text-gold-500 hover:text-gold-300"
                >
                  contact@trustedjurist.co.id
                </a>
              </div>

              {/* Phone */}
              <div>
                <h4 className="text-h4-lg font-serif font-semibold text-navy-700 mb-2">
                  Telepon
                </h4>
                <a
                  href="tel:+622112345678"
                  className="text-body text-gold-500 hover:text-gold-300"
                >
                  +62 21 1234 5678
                </a>
              </div>

              {/* WhatsApp */}
              <div>
                <h4 className="text-h4-lg font-serif font-semibold text-navy-700 mb-2">
                  WhatsApp
                </h4>
                <a
                  href="https://wa.me/628123456789"
                  className="text-body text-gold-500 hover:text-gold-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  +62 812 3456 789
                </a>
              </div>

              {/* Address */}
              <div>
                <h4 className="text-h4-lg font-serif font-semibold text-navy-700 mb-2">
                  Lokasi
                </h4>
                <p className="text-body text-gray-text">
                  Jl. Contoh No. 123
                  <br />
                  Jakarta Timur, 13000
                  <br />
                  Indonesia
                </p>
              </div>

              {/* Hours */}
              <div>
                <h4 className="text-h4-lg font-serif font-semibold text-navy-700 mb-2">
                  Jam Kerja
                </h4>
                <p className="text-body text-gray-text">
                  Senin - Jumat: 09:00 - 17:00
                  <br />
                  Sabtu: 10:00 - 14:00
                  <br />
                  Minggu: Tutup
                </p>
              </div>
            </div>
          </div>
        </div>
      </ContentSection>

      {/* Footer */}
      <Footer
        logo="https://via.placeholder.com/120x40?text=TJ"
        email="contact@trustedjurist.co.id"
        phone="+62 21 1234 5678"
        address="Jakarta Timur, Indonesia"
      />
    </>
  );
};

/**
 * Trusted Jurist Layout Components
 * Navbar, Footer, Hero Section, Content Section, Container
 */

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from './02-ui-components';

// ============================================
// CONTAINER COMPONENT
// ============================================

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`container mx-auto px-4 md:px-6 lg:px-10 max-w-screen-2xl ${className}`}>
      {children}
    </div>
  );
};

// ============================================
// NAVBAR COMPONENT
// ============================================

export interface NavbarItem {
  label: string;
  href: string;
}

export interface NavbarProps {
  logo?: React.ReactNode | string;
  logoAlt?: string;
  navItems: NavbarItem[];
  onConsult?: () => void;
  isTransparent?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  logo,
  logoAlt = 'Logo',
  navItems,
  onConsult,
  isTransparent = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav
        className={`hidden md:flex sticky top-0 z-50 h-18 ${
          isTransparent ? 'bg-transparent' : 'bg-white border-b border-gray-border'
        } transition-colors duration-300`}
      >
        <Container className="flex items-center justify-between py-0">
          {/* Logo */}
          {logo && (
            <div className="flex-shrink-0">
              {typeof logo === 'string' ? (
                <img src={logo} alt={logoAlt} className="h-10 w-auto" />
              ) : (
                logo
              )}
            </div>
          )}

          {/* Desktop Nav Items */}
          <div className="flex items-center gap-8 flex-1 ml-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`text-body font-sans transition-colors duration-200 relative group ${
                  isTransparent ? 'text-white hover:text-gold-500' : 'text-navy-700 hover:text-gold-500'
                }`}
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold-500 transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            variant="primary"
            size="md"
            onClick={onConsult}
            className="flex-shrink-0"
          >
            Konsultasi
          </Button>
        </Container>
      </nav>

      {/* Mobile Navbar */}
      <nav className="md:hidden sticky top-0 z-50 h-14 bg-white border-b border-gray-border">
        <Container className="h-full flex items-center justify-between py-0">
          {/* Logo */}
          {logo && (
            <div className="flex-shrink-0">
              {typeof logo === 'string' ? (
                <img src={logo} alt={logoAlt} className="h-8 w-auto" />
              ) : (
                logo
              )}
            </div>
          )}

          {/* Hamburger Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-navy-700 hover:bg-gray-light p-2 rounded-sm transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </Container>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-14 bg-navy-700/80 backdrop-blur-sm z-40">
            <div className="flex flex-col gap-4 p-6">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-lg text-white hover:text-gold-500 transition-colors font-sans"
                  onClick={handleNavClick}
                >
                  {item.label}
                </a>
              ))}
              <Button
                variant="gold"
                size="md"
                onClick={() => {
                  onConsult?.();
                  handleNavClick();
                }}
                className="w-full mt-2"
              >
                Konsultasi
              </Button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

// ============================================
// HERO SECTION COMPONENT
// ============================================

export interface HeroSectionProps {
  headline: string;
  subheadline?: string;
  backgroundImage?: string;
  cta1Text?: string;
  cta2Text?: string;
  onCta1?: () => void;
  onCta2?: () => void;
  trustIndicators?: Array<{ icon: React.ReactNode; text: string }>;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  headline,
  subheadline,
  backgroundImage,
  cta1Text = 'Konsultasi Sekarang',
  cta2Text = 'Pelajari Lebih Lanjut',
  onCta1,
  onCta2,
  trustIndicators = [],
}) => {
  return (
    <section
      className="relative h-screen md:h-[70vh] flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-navy-700/40" />

      {/* Content */}
      <Container className="relative z-10 text-center flex flex-col items-center">
        <h1 className="text-h1-mobile md:text-h1-lg font-serif font-bold text-white mb-4 md:mb-6">
          {headline}
        </h1>

        {subheadline && (
          <p className="text-lead text-white mb-8 md:mb-12 max-w-2xl">
            {subheadline}
          </p>
        )}

        {/* Trust Indicators */}
        {trustIndicators.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 mb-8 md:mb-12">
            {trustIndicators.map((indicator, index) => (
              <div key={index} className="flex items-center gap-2 text-white">
                <div className="text-xl">{indicator.icon}</div>
                <span className="text-body-sm md:text-body">{indicator.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button variant="gold" size="md" onClick={onCta1}>
            {cta1Text}
          </Button>
          <Button variant="secondary" size="md" onClick={onCta2}>
            {cta2Text}
          </Button>
        </div>
      </Container>
    </section>
  );
};

// ============================================
// CONTENT SECTION COMPONENT
// ============================================

export interface ContentSectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  backgroundColor?: 'cream' | 'white';
  className?: string;
}

export const ContentSection: React.FC<ContentSectionProps> = ({
  title,
  subtitle,
  children,
  backgroundColor = 'white',
  className = '',
}) => {
  const bgColor = backgroundColor === 'cream' ? 'bg-cream-500' : 'bg-white';

  return (
    <section className={`py-12 md:py-16 lg:py-20 ${bgColor} ${className}`}>
      <Container>
        {title && (
          <div className="mb-8 md:mb-12 text-center">
            <h2 className="text-h2-md md:text-h2-lg font-serif font-semibold text-navy-700 mb-3">
              {title}
            </h2>
            {subtitle && (
              <p className="text-body-lg text-gray-text max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {children}
      </Container>
    </section>
  );
};

// ============================================
// TWO COLUMN SECTION
// ============================================

export interface TwoColumnSectionProps {
  imagePosition?: 'left' | 'right';
  image?: string;
  imageAlt?: string;
  title: string;
  subtitle?: string;
  content: string | React.ReactNode;
  cta?: { text: string; onClick?: () => void };
  backgroundColor?: 'cream' | 'white';
}

export const TwoColumnSection: React.FC<TwoColumnSectionProps> = ({
  imagePosition = 'left',
  image,
  imageAlt = 'Section image',
  title,
  subtitle,
  content,
  cta,
  backgroundColor = 'cream',
}) => {
  const bgColor = backgroundColor === 'cream' ? 'bg-cream-500' : 'bg-white';

  return (
    <ContentSection backgroundColor={backgroundColor}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
        {/* Image */}
        <div
          className={`order-first ${imagePosition === 'right' ? 'md:order-last' : ''}`}
        >
          {image && (
            <img
              src={image}
              alt={imageAlt}
              className="w-full h-auto rounded-md"
            />
          )}
        </div>

        {/* Content */}
        <div>
          <h3 className="text-h3-md md:text-h3-lg font-serif font-semibold text-navy-700 mb-2">
            {title}
          </h3>
          {subtitle && (
            <p className="text-lead text-gray-text mb-6">
              {subtitle}
            </p>
          )}
          <div className="text-body text-gray-text mb-6 space-y-4">
            {typeof content === 'string' ? <p>{content}</p> : content}
          </div>
          {cta && (
            <Button variant="primary" size="md" onClick={cta.onClick}>
              {cta.text}
            </Button>
          )}
        </div>
      </div>
    </ContentSection>
  );
};

// ============================================
// GRID SECTION
// ============================================

export interface GridSectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  backgroundColor?: 'cream' | 'white';
}

export const GridSection: React.FC<GridSectionProps> = ({
  title,
  subtitle,
  children,
  columns = 3,
  backgroundColor = 'white',
}) => {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  };

  return (
    <ContentSection title={title} subtitle={subtitle} backgroundColor={backgroundColor}>
      <div className={`grid ${colsClass[columns]} gap-6 md:gap-8 lg:gap-10`}>
        {children}
      </div>
    </ContentSection>
  );
};

// ============================================
// FOOTER COMPONENT
// ============================================

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  logo?: React.ReactNode | string;
  description?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  sections?: FooterSection[];
  copyrightText?: string;
}

export const Footer: React.FC<FooterProps> = ({
  logo,
  description,
  email,
  phone,
  whatsapp,
  address,
  sections = [],
  copyrightText,
}) => {
  const currentYear = new Date().getFullYear();
  const year = copyrightText ? copyrightText.replace('{year}', currentYear.toString()) : `© ${currentYear} Trusted Jurist. All rights reserved.`;

  return (
    <footer className="bg-navy-700 text-white">
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            {logo && (
              <div className="mb-4">
                {typeof logo === 'string' ? (
                  <img src={logo} alt="Logo" className="h-10 w-auto" />
                ) : (
                  logo
                )}
              </div>
            )}
            {description && (
              <p className="text-body text-white/80">
                {description}
              </p>
            )}
          </div>

          {/* Footer Sections */}
          {sections.map((section, index) => (
            <div key={index}>
              <h4 className="text-h4-lg font-serif font-semibold text-white mb-4">
                {section.title}
              </h4>
              <ul className="flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-white/80 hover:text-gold-500 transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info */}
          <div>
            <h4 className="text-h4-lg font-serif font-semibold text-white mb-4">
              Hubungi Kami
            </h4>
            <ul className="flex flex-col gap-2 text-white/80">
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="hover:text-gold-500">
                    {email}
                  </a>
                </li>
              )}
              {phone && (
                <li>
                  <a href={`tel:${phone}`} className="hover:text-gold-500">
                    {phone}
                  </a>
                </li>
              )}
              {whatsapp && (
                <li>
                  <a href={`https://wa.me/${whatsapp}`} className="hover:text-gold-500">
                    WhatsApp
                  </a>
                </li>
              )}
              {address && (
                <li>{address}</li>
              )}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8">
          <p className="text-center text-caption text-white/60">
            {year}
          </p>
        </div>
      </Container>
    </footer>
  );
};

// ============================================
// BREADCRUMB COMPONENT
// ============================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 text-caption text-gray-text">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-gray-border">/</span>}
          {item.href ? (
            <a href={item.href} className="text-navy-700 hover:text-gold-500 transition-colors">
              {item.label}
            </a>
          ) : (
            <span className="text-navy-700 font-semibold">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ===== COLORS =====
      colors: {
        // Primary (Navy) - Trust, Authority, Professional
        navy: {
          900: '#0d1117',
          700: '#121c2b', // default
          500: '#3d4a5c',
          300: '#6b7a89',
        },
        // Accent (Gold) - Premium, Sophistication, Luxury
        gold: {
          900: '#6b5a2d',
          500: '#8a7340', // default
          300: '#c9b896',
        },
        // Background (Cream) - Warm, Editorial, Readable
        cream: {
          100: '#faf9f7',
          500: '#f7f4ef', // default
          700: '#e8e4db',
        },
        // Neutrals
        gray: {
          light: '#f3f0eb',
          border: '#d9d2c6',
          text: '#5c6b7a',
          dark: '#3d3d3d',
        },
        // Semantic
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },

      // ===== TYPOGRAPHY =====
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', '-apple-system', 'Segoe UI', 'sans-serif'],
      },

      // ===== FONT SIZES =====
      fontSize: {
        // Headings (Cormorant Garamond)
        'h1-md': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
        'h1-lg': ['72px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2-md': ['36px', { lineHeight: '1.3', fontWeight: '600' }],
        'h2-lg': ['56px', { lineHeight: '1.3', fontWeight: '600' }],
        'h3-md': ['32px', { lineHeight: '1.3', fontWeight: '600' }],
        'h3-lg': ['42px', { lineHeight: '1.3', fontWeight: '600' }],
        'h4-md': ['24px', { lineHeight: '1.4', fontWeight: '600' }],
        'h4-lg': ['28px', { lineHeight: '1.4', fontWeight: '600' }],

        // Body (Manrope)
        'lead': ['20px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'label': ['12px', { lineHeight: '1.4', fontWeight: '600' }],
        'caption': ['11px', { lineHeight: '1.5', fontWeight: '400' }],
      },

      // ===== SPACING =====
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '80px',
      },

      // ===== SHADOWS =====
      boxShadow: {
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'medium': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'large': '0 20px 25px rgba(0, 0, 0, 0.15)',
      },

      // ===== BORDER RADIUS =====
      borderRadius: {
        'none': '0px',
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
      },

      // ===== TRANSITIONS =====
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
      },

      // ===== CONTAINER =====
      container: {
        center: true,
        padding: {
          DEFAULT: '16px',
          sm: '16px',
          md: '24px',
          lg: '40px',
        },
        screens: {
          'xs': '320px',
          'sm': '640px',
          'md': '768px',
          'lg': '1024px',
          'xl': '1280px',
          '2xl': '1440px', // max-width
        },
      },
    },
  },

  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        kancah: {
          purple: '#7C3AED',
          'purple-light': '#A855F7',
          pink: '#EC4899',
          orange: '#F97316',
          mint: '#10B981',
          cyan: '#06B6D4',
          glow: '#C084FC',
        },
        // Extended orange (for backward compat)
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Extended lavender
        lavender: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },
      animation: {
        'blob': 'blob 8s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        'aurora-pulse': 'auroraPulse 4s ease-in-out infinite',
        'wiggle': 'wiggle 2s ease-in-out infinite',
        'gradient-shift': 'gradientShift 4s ease infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'gentle-float': 'gentleFloat 5s ease-in-out infinite',
      },
      keyframes: {
        blob: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '25%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
          '50%': { borderRadius: '50% 60% 30% 60% / 30% 60% 70% 40%' },
          '75%': { borderRadius: '60% 40% 60% 30% / 70% 30% 50% 60%' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        auroraPulse: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        gentleFloat: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-10px) rotate(2deg)' },
          '66%': { transform: 'translateY(-6px) rotate(-1deg)' },
        },
      },
      backgroundImage: {
        'aurora': 'radial-gradient(ellipse 80% 80% at 20% 20%, rgba(124, 58, 237, 0.25) 0%, transparent 50%), radial-gradient(ellipse 60% 60% at 80% 10%, rgba(168, 85, 247, 0.2) 0%, transparent 50%), radial-gradient(ellipse 70% 70% at 90% 80%, rgba(236, 72, 153, 0.18) 0%, transparent 50%)',
        'gradient-kancah': 'linear-gradient(135deg, #7C3AED 0%, #A855F7 40%, #EC4899 100%)',
        'gradient-warm': 'linear-gradient(135deg, #F97316 0%, #EC4899 50%, #A855F7 100%)',
      },
      boxShadow: {
        'glow-violet': '0 0 30px rgba(124, 58, 237, 0.35)',
        'glow-pink': '0 0 30px rgba(236, 72, 153, 0.35)',
        'glow-orange': '0 0 30px rgba(249, 115, 22, 0.35)',
        'card-hover': '0 24px 48px rgba(124, 58, 237, 0.15)',
      },
    },
  },
  plugins: [],
};

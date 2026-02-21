/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Primary brand: Gamified Duolingo Green ──
        brand: {
          50: '#f4fbf0',
          100: '#e5f6db',
          200: '#caedb8',
          300: '#a3df87',
          400: '#75cb51',
          500: '#58CC02',   // Primary Duolingo Green
          600: '#43a501',
          700: '#348001',
          800: '#2c6603',
          900: '#255406',
        },
        // ── Accent: coral-pink for danger/heart ──
        heart: '#ff4b6a',
        // ── Accent: amber/gold for XP, streaks ──
        gold: '#f5a623',
        flame: '#ff7a1a',
        // ── Accent: electric teal for badges ──
        teal: '#0ed2f7',
        ice: '#a0f0f8',
        // ── Ink/text ──
        ink: '#1a1a2e',
        slate: '#5a5a7a',
        muted: '#9999b8',
        // ── Surfaces ──
        surface: '#f7f7fd',
        border: '#e4e4f0',
        cloud: '#ffffff',
        // ── Sidebar ──
        owl: {
          dark: '#110e2a',
          medium: '#1c1640',
          light: '#2a2257',
        },
        // ── Violet (used directly in components) ──
        violet: {
          50: '#f5f0ff',
          100: '#ede5ff',
          200: '#ddd0ff',
          300: '#c3adff',
          400: '#a47dff',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // ── Danger/success ──
        danger: '#ff4b6a',
        success: '#22d17a',
        warning: '#f5a623',
        purple: '#8b5cf6',
        pink: '#ec4899',
      },

      fontFamily: {
        sans: ['Nunito', 'ui-rounded', 'system-ui', 'sans-serif'],
        display: ['Nunito', 'ui-rounded', 'sans-serif'],
      },

      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },

      boxShadow: {
        // 3D push-button shadows
        'btn': '0 4px 0 0 rgba(0, 0, 0, 0.15)',
        'btn-brand': '0 4px 0 0 #43a501', // Darker green for bottom edge
        'btn-blue': '0 4px 0 0 #1cb0f6',
        'btn-red': '0 4px 0 0 #ff4b4b',
        'btn-violet': '0 4px 0 0 #5a2ed4',
        'btn-pink': '0 4px 0 0 #be185d',
        'btn-amber': '0 4px 0 0 #b45309',
        'sidebar': '2px 0 24px 0 rgba(17,14,42,0.18)',
        'card': '0 2px 0 0 #e5e5e5', // Flat chunky card shadow
        'card-hover': '0 4px 0 0 #e5e5e5',
        'glow-brand': '0 0 32px 0 rgba(88,204,2,0.35)',
      },

      keyframes: {
        // Flame flicker for streak
        flameFlicker: {
          '0%, 100%': { transform: 'scaleY(1)   rotate(-2deg)', filter: 'brightness(1)' },
          '33%': { transform: 'scaleY(1.1) rotate(2deg)', filter: 'brightness(1.1)' },
          '66%': { transform: 'scaleY(0.9) rotate(-1deg)', filter: 'brightness(0.95)' },
        },
        // XP bar fill pulse
        xpPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(88,204,2,0.5)' },
          '50%': { boxShadow: '0 0 0 8px rgba(88,204,2,0)' },
        },
        // Pop in for badges
        popIn: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '70%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        // Shimmer for loading skeletons
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px  0' },
        },
        // Float for mascot / decorative elements
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        flameFlicker: 'flameFlicker 1.4s ease-in-out infinite',
        xpPulse: 'xpPulse 2s ease-in-out infinite',
        popIn: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
        shimmer: 'shimmer 1.4s linear infinite',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Duolingo-inspired bright green palette
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
        },
        accent: {
          50: '#fef3c7',
          100: '#fde68a',
          200: '#fcd34d',
          300: '#fbbf24',
          400: '#f59e0b',
          500: '#d97706',
        },
        success: '#22c55e',
        'success-dark': '#16a34a',
        warning: '#f59e0b',
        danger: '#ef4444',
        ink: '#1f2937',
        slate: '#64748b',
        muted: '#94a3b8',
        border: '#e5e7eb',
        surface: '#f9fafb',
        cloud: '#ffffff',
      },
      fontFamily: {
        sans: ['DM Sans', 'Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Poppins', 'Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0,0,0,0.04)',
        'card': '0 4px 12px rgba(0,0,0,0.05)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.08)',
        'btn': '0 2px 8px rgba(34, 197, 94, 0.3)',
        'btn-hover': '0 6px 20px rgba(34, 197, 94, 0.4)',
        'glow': '0 0 20px rgba(34, 197, 94, 0.3)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'confetti': 'confetti 0.8s ease-out',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        confetti: {
          '0%': { transform: 'translateY(-100px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}

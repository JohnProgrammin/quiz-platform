/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        accent: '#06b6d4',
        'accent-dark': '#0891b2',
        success: '#10b981',
        'success-dark': '#059669',
        warning: '#f59e0b',
        danger: '#ef4444',
        ink: '#1e1b4b',
        slate: '#64748b',
        muted: '#94a3b8',
        border: '#e2e8f0',
        surface: '#f8fafc',
        cloud: '#ffffff',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '18px',
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card': '0 2px 8px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.08)',
        'btn': '0 1px 3px rgba(99,102,241,0.3)',
        'btn-hover': '0 4px 12px rgba(99,102,241,0.35)',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Duolingo-inspired palette
        brand: {
          50: '#eafbe4',
          100: '#d4f7c9',
          200: '#a8ef93',
          300: '#7de65d',
          400: '#58CC02', // Duolingo green
          500: '#58CC02',
          600: '#4CAD00',
          700: '#3d8a00',
          800: '#2e6800',
        },
        owl: {
          dark: '#131F24',   // Sidebar dark
          mid: '#1a2c33',
          light: '#233a42',
        },
        gold: '#FFC800',     // XP/Streak gold
        flame: '#FF9600',    // Streak fire
        heart: '#FF4B4B',    // Hearts/Errors
        ice: '#1CB0F6',      // Streak freeze / info
        purple: '#CE82FF',   // Premium
        success: '#58CC02',
        'success-dark': '#4CAD00',
        warning: '#FFC800',
        danger: '#FF4B4B',
        ink: '#3C3C3C',
        slate: '#777777',
        muted: '#AFAFAF',
        border: '#E5E5E5',
        surface: '#F7F7F7',
        cloud: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Nunito', 'DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Nunito', 'Poppins', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0,0,0,0.04)',
        'card': '0 2px 10px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.1)',
        'btn': '0 4px 0 #4CAD00',
        'btn-hover': '0 2px 0 #4CAD00',
        'btn-secondary': '0 4px 0 #E5E5E5',
        'btn-secondary-hover': '0 2px 0 #E5E5E5',
        'glow-green': '0 0 24px rgba(88, 204, 2, 0.3)',
        'glow-gold': '0 0 24px rgba(255, 200, 0, 0.3)',
        'sidebar': '4px 0 24px rgba(0,0,0,0.15)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'confetti': 'confetti 0.8s ease-out',
        'flame-flicker': 'flameFlicker 1.5s ease-in-out infinite',
        'xp-pulse': 'xpPulse 0.6s ease-out',
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
        flameFlicker: {
          '0%, 100%': { transform: 'scaleY(1) rotate(0deg)' },
          '25%': { transform: 'scaleY(1.15) rotate(2deg)' },
          '50%': { transform: 'scaleY(0.9) rotate(-2deg)' },
          '75%': { transform: 'scaleY(1.1) rotate(1deg)' },
        },
        xpPulse: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

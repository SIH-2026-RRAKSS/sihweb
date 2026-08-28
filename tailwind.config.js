/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        industrial: {
          950: '#060709', // Pitch Obsidian
          900: '#0C0E12', // Deep Matte Charcoal
          850: '#12151B', // Dark Titanium Slate
          800: '#1A1E26', // Surface Border / Inactive Panel
          750: '#232934', // Line Strong
          700: '#323A4A', // Line Bright
          600: '#525E73', // Muted Slate
          500: '#7A8699', // Subtitle Text
          400: '#A4B0C2', // Secondary Text
          200: '#E2E8F0', // Primary Off-White
          100: '#F8FAFC', // Crisp White
        },
        space: {
          950: '#050807', // Deepest Cosmic Black-Green
          900: '#08110E', // Deep Space Matte
          850: '#0D1A16', // Dark Nebula Surface
          800: '#132620', // Translucent Glass Panel
          750: '#1A332B', // Hairline Border Subtle
          700: '#24473C', // Hairline Border Active
        },
        mint: {
          DEFAULT: '#B8FFD4', // Luminous Mint Green Accent
          300: '#E0FFED',
          400: '#B8FFD4',
          500: '#86EFAC',
          600: '#4ADE80',
          glow: 'rgba(184, 255, 212, 0.4)',
        },
        signal: {
          orange: '#FF5500', // Primary High-Visibility Tactical Accent
          amber: '#F59E0B',  // Cash-Out / Warning
          red: '#EF4444',    // Critical Alert / Illicit Root
          emerald: '#10B981',// Verified Safe
          cobalt: '#38BDF8', // Neutral Flow / Routing
          cyan: '#22D3EE',   // Atmospheric Ion Glow
        }
      },
      fontFamily: {
        sans: ['Montserrat', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'industrial-sm': '0 1px 2px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        'industrial-md': '0 8px 24px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'industrial-lg': '0 16px 40px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        'signal-glow': '0 0 20px rgba(255, 85, 0, 0.35)',
        'amber-glow': '0 0 20px rgba(245, 158, 11, 0.35)',
        'mint-glow': '0 0 25px rgba(184, 255, 212, 0.35)',
        'mint-subtle': '0 0 15px rgba(184, 255, 212, 0.15)',
        'cyan-glow': '0 0 25px rgba(56, 189, 248, 0.35)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'signal-flash': 'signalFlash 1.5s ease-in-out infinite',
      },
      keyframes: {
        signalFlash: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        }
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        tactical: {
          void: '#0F172A',      // Main app background (Slate-900)
          surface: '#1E293B',   // Solid card background (Slate-800)
          border: '#334155',    // Clean 1px solid borders (Slate-700)
          accent: '#3B82F6',    // Primary button (Blue-500)
          accentHover: '#2563EB',// Hover state (Blue-600)
          victim: '#F8FAFC',    // Neutral text (Slate-50)
          safe: '#10B981',      // Success/Clear (Emerald-500)
          warning: '#F59E0B',   // Anomaly/Warning (Amber-500)
          critical: '#EF4444',  // High Risk (Red-500)
          exit: '#F97316',      // Cash-out ATM (Orange-500)
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
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'xl': '1rem',        // Inner elements
        '2xl': '1.25rem',    // Main Dashboard Cards
        '3xl': '1.5rem',     // Large containers
      },
      boxShadow: {
        'saas-card': '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'saas-floating': '0 10px 15px -3px rgba(0, 0, 0, 0.25), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'industrial-sm': '0 1px 2px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        'industrial-md': '0 8px 24px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'industrial-lg': '0 16px 40px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        'signal-glow': '0 0 20px rgba(255, 85, 0, 0.35)',
        'amber-glow': '0 0 20px rgba(245, 158, 11, 0.35)',
        'mint-glow': '0 0 25px rgba(184, 255, 212, 0.35)',
        'mint-subtle': '0 0 15px rgba(184, 255, 212, 0.15)',
        'cyan-glow': '0 0 25px rgba(56, 189, 248, 0.35)',
      },
    },
  },
  plugins: [],
};

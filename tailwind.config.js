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
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
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
      },
    },
  },
  plugins: [],
};

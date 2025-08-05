/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: [
    './apps/**/*.{ts,tsx,js,jsx}',
    './apps/web/src/routes/**/*.{ts,tsx,js,jsx}',
    './packages/**/*.{ts,tsx,js,jsx}',
    './shared/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    },
    extend: {
      colors: {
        // Material 3 color roles: https://m3.material.io/styles/color/roles
        primary: '#6750A4', // Primary https://m3.material.io/styles/color/roles#primary
        secondary: '#625B71', // Secondary https://m3.material.io/styles/color/roles#secondary
        background: '#FFFBFE', // Background https://m3.material.io/styles/color/roles#background
        'background-dark': '#1C1B1F', // Background (Dark)
        surface: '#FFFBFE', // Surface https://m3.material.io/styles/color/roles#surface
        'surface-dark': '#1C1B1F', // Surface (Dark)
        'on-surface': '#1C1B1F', // On Surface https://m3.material.io/styles/color/roles#on-surface
        'on-surface-dark': '#E6E1E5', // On Surface (Dark)
        error: '#B3261E', // Error https://m3.material.io/styles/color/roles#error
      },
      transitionTimingFunction: {
        ez: 'cubic-bezier(0.25,0.1,0.25,1)',
      },
      transitionProperty: {
        transform: 'transform',
      },
      keyframes: {
        'skeleton-shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'skeleton-shimmer': 'skeleton-shimmer 1.5s infinite',
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.drop-shadow-lg': {
          filter:
            'drop-shadow(0 10px 8px rgba(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgba(0 0 0 / 0.1))',
        },
        '.min-tap': {
          minWidth: '44px',
          minHeight: '44px',
        },
      });
    }),
  ],
};

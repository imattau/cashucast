/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: [
    './apps/**/*.{ts,tsx,js,jsx}',
    './packages/**/*.{ts,tsx,js,jsx}',
    './shared/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    },
    extend: {
      colors: {
        primary:  '#FF0759',   /* TikTok hot-pink */
        surface:  '#121212',
        subtleBg:'#1F1F1F',
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
      });
    }),
  ],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        secondary: '#4edea3',
        primary: '#c9c6c5',
        'on-background': '#e5e2e1',
        background: '#050505',
        'surface-card': '#0A0A0A',
        'glass-border': 'rgba(255, 255, 255, 0.15)',
        'glass-highlight': 'rgba(255, 255, 255, 0.15)',
        'on-surface-variant': '#c4c7c7',
        'on-secondary': '#003824',
        'surface-container-lowest': '#0e0e0e',
        tertiary: '#d0bcff',
      },
      spacing: {
        gutter: '24px',
        'container-padding': '2rem',
        'section-gap': '160px',
        'bezel-inner': '6px',
        'bezel-outer': '8px',
      },
      fontFamily: {
        'body-lg': ['Plus Jakarta Sans'],
        'label-sm': ['Geist'],
        'headline-lg': ['Geist'],
        'body-md': ['Plus Jakarta Sans'],
        'headline-md': ['Geist'],
        'display-xl': ['Geist'],
      },
      fontSize: {
        'body-lg': ['18px', { lineHeight: '32px', fontWeight: '300' }],
        'label-sm': ['10px', { lineHeight: '16px', letterSpacing: '0.2em', fontWeight: '500' }],
        'headline-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'body-md': ['16px', { lineHeight: '28px', fontWeight: '300' }],
        'display-xl': ['72px', { lineHeight: '80px', letterSpacing: '-0.04em', fontWeight: '700' }],
        'headline-md': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
}

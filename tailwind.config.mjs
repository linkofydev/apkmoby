/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#22d3ee',
          dim: '#0891b2',
          glow: '#67e8f9',
        },
        accent: {
          DEFAULT: '#a78bfa',
          dim: '#7c3aed',
        },
        ink: {
          DEFAULT: '#070b14',
          raised: '#0d1320',
          card: '#121a2b',
          border: '#1e293b',
        },
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
        ],
      },
      boxShadow: {
        glow: '0 0 40px -12px rgb(34 211 238 / 0.45)',
      },
    },
  },
};

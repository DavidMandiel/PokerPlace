/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core brand greens (from your logo background)
        brand: {
          bg1: '#0b2c2c', // deep green
          bg2: '#124a3a', // mid green
          bg3: '#0b1f1f', // near-black green
          red: '#d23c3c', // logo accent
        },
        // Card families
        emerald: {
          DEFAULT: '#145a4a',
          dark: '#0e3b2f',
          mint: '#4fd1a1',
          mintSoft: '#7ddfc3',
        },
        teal: {
          DEFAULT: '#1a3d4a',
          dark: '#102731',
          accent: '#5bb8c2',
          soft: '#88d0d8',
        },
        olive: {
          DEFAULT: '#3a442b',
          dark: '#232a1a',
          lime: '#a2d56e',
          limeSoft: '#c0e49d',
        },
      },
      borderRadius: {
        '2xl': '1.25rem',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.06), 0 10px 30px rgba(0,0,0,0.45)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0b2c2c, #124a3a 55%, #0b1f1f)',
        'emerald-gradient': 'linear-gradient(135deg, #145a4a, #0e3b2f)',
        'teal-gradient': 'linear-gradient(135deg, #1a3d4a, #102731)',
        'olive-gradient': 'linear-gradient(135deg, #3a442b, #232a1a)',
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        fadeIn: 'fadeIn 600ms var(--ease-soft) both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

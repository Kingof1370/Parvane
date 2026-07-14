/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        softpink: '#F8A4B8',
        gold: '#D4AF37',
        cream: '#FFF5F5',
        pink: {
          50: '#FFF5F5', // Soft cream/pink
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#F8A4B8', // Soft Pink
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        }
      },
      fontFamily: {
        sans: ['Vazirmatn', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

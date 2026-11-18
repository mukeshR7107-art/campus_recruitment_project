/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Nunito', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f7f2',
          100: '#dcece1',
          200: '#bbd8c5',
          300: '#91bca1',
          400: '#639e7c',
          500: '#327353', // JobBoard signature green
          600: '#265d43',
          700: '#204b38',
          800: '#1c3e30',
          900: '#193429',
          950: '#0c1e16',
        },
        navy: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#090d16',
        }
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 12px 30px -4px rgba(0, 0, 0, 0.1)',
        'hero-search': '0 20px 40px -15px rgba(0, 0, 0, 0.25)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.85))',
      }
    },
  },
  plugins: [],
};

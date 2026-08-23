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
          50: '#f4f9eb',
          100: '#e6f3d0',
          200: '#cfe7a4',
          300: '#b1d76e',
          400: '#97c740',
          500: '#89ba16', // JobBoard signature green
          600: '#6f970e',
          700: '#54740e',
          800: '#445d11',
          900: '#3a4e12',
          950: '#1c2c05',
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

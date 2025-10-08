import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2fbff',
          100: '#def4ff',
          200: '#b6e7ff',
          300: '#7bd3ff',
          400: '#3eb7ff',
          500: '#1195ff',
          600: '#0076e6',
          700: '#005bb4',
          800: '#004789',
          900: '#023a6d'
        }
      }
    }
  },
  plugins: []
};

export default config;

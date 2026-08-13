/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef4ff',
          100: '#d9e6ff',
          500: '#3b5fe0',
          600: '#2f4bc4',
          700: '#263ca0',
        },
      },
    },
  },
  plugins: [],
};

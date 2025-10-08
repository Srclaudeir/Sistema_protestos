/** @type {import(''tailwindcss'').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          turquoise: '#00AE9D',
          'turquoise-dark': '#008777',
          deep: '#003641',
          navy: '#01242C',
          forest: '#045A52',
          lime: '#C9D200',
          green: '#5E9F1A',
          purple: '#49479D',
          surface: '#F3FBF9',
          muted: '#E6F4F2',
          overlay: '#DDEEEB',
        },
      },
      boxShadow: {
        'brand-card': '0 18px 40px -18px rgba(0, 36, 44, 0.55)',
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

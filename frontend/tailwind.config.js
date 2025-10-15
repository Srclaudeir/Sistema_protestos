/** @type {import(''tailwindcss'').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  important: true,
  theme: {
    extend: {
      colors: {
        brand: {
          turquoise: "#00AE9D",
          "turquoise-dark": "#008777",
          deep: "#003641",
          navy: "#01242C",
          forest: "#045A52",
          lime: "#C9D200",
          green: "#5E9F1A",
          purple: "#49479D",
          surface: "#F3FBF9",
          muted: "#E6F4F2",
          overlay: "#DDEEEB",
          // Cores adicionais para melhor contraste
          slate: "#475569",
          pink: "#EC4899",
          orange: "#F97316",
          // Cores com melhor contraste para fundos claros
          "slate-light": "#64748B",
          "pink-light": "#F472B6",
          "orange-light": "#FB923C",
        },
      },
      borderRadius: {
        "3xl": "1.5rem",
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        "brand-card": "0 18px 40px -18px rgba(0, 36, 44, 0.55)",
      },
      fontFamily: {
        sans: ['"Segoe UI"', "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

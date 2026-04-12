/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand tokens
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        background: "rgb(var(--color-background) / <alpha-value>)",
        textmain: "rgb(var(--color-text) / <alpha-value>)",

        // UI tokens
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        textmuted: "rgb(var(--color-text-muted) / <alpha-value>)",

        // ✅ DRC-style yellow band token
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        accenttext: "rgb(var(--color-accent-text) / <alpha-value>)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
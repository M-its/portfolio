/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {},
    extend: {
      fontFamily: {
        sans: "var(--font-sans)",
        display: "var(--font-display)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        "switcher-container-light": "var(--shadow-switcher-container-light)",
        "switcher-container-dark": "var(--shadow-switcher-container-dark)",
        "switcher-toggle-light": "var(--shadow-switcher-toggle-light)",
        "switcher-toggle-dark": "var(--shadow-switcher-toggle-dark)",
      },
    },
  },
  plugins: [],
};

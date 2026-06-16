import type { Config } from "tailwindcss";

// Warm palette (coral/peach/amber). Avoid the cliche crypto blue/purple.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          50: "#fff5f2",
          100: "#ffe6df",
          200: "#ffc7b8",
          300: "#ffa088",
          400: "#ff7a5c",
          500: "#f9603d",
          600: "#e0451f",
          700: "#b83518",
        },
        peach: {
          100: "#fff1e6",
          200: "#ffd9b8",
          300: "#ffbe8a",
        },
        amber: {
          400: "#ffb020",
          500: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

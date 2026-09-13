import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#0C0B09",
        card: "#161411",
        ink: "#F3EEE6",
        soft: "#1C1915",
        dim: "#A3988E",
        line: "#2C2823",
        accent: "#E0783A",
        num: "#C6E08A",
        mint: "#1A2316",
      },
      fontFamily: {
        sans: ["Figtree", "Segoe UI", "sans-serif"],
        display: ["Outfit", "Segoe UI", "sans-serif"],
        serif: ["Instrument Serif", "Georgia", "serif"],
        num: ["Syne", "Arial Black", "sans-serif"],
      },
      maxWidth: {
        page: "1240px",
      },
    },
  },
  plugins: [],
};

export default config;

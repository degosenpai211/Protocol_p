import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F7F4EE",
        card: "#FFFFFF",
        ink: "#1C1917",
        soft: "#EFEAE3",
        dim: "#6B6560",
        line: "#E4DDD4",
        accent: "#C45C26",
        num: "#4D7C0F",
        mint: "#E7F1E4",
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

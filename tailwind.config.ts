import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // PPP — Ping Pang Paris design system
        "ppp-bg":          "#F0EDE6",
        "ppp-card":        "#E8E4DC",
        "ppp-forest":      "#2D4A3E",
        "ppp-forest-dark": "#1E3329",
        "ppp-text":        "#1A1A1A",
        "ppp-muted":       "#6B6B6B",
        "ppp-white":       "#FFFFFF",
        "ppp-border":      "#D4D0C8",
        "ppp-gold":        "#B5985A",
        "ppp-silver":      "#8A8A8A",
        // Status / semantic
        red:    "#C8352A",
        yellow: "#E8C840",
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "Georgia", "serif"],
      },
      borderRadius: {
        DEFAULT: "0px",
        none:    "0px",
        sm:      "2px",
        md:      "8px",
        pill:    "20px",
        full:    "9999px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":  "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;

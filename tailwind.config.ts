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
        // ── PPP dark design system ──────────────────
        "ppp-bg":          "#0D0D0D",
        "ppp-surface":     "#141414",
        "ppp-surface-2":   "#1A1A1A",
        "ppp-card":        "#141414",
        "ppp-forest":      "#2CBF6E",
        "ppp-forest-dark": "#1E9A58",
        "ppp-text":        "#F0EDE6",
        "ppp-muted":       "#66625E",
        "ppp-white":       "#F0EDE6",
        "ppp-border":      "#252525",
        "ppp-border-2":    "#303030",
        "ppp-gold":        "#F5A623",
        "ppp-silver":      "#66625E",
        // Semantic
        red:               "#E84040",
        yellow:            "#F5A623",
        green:             "#2CBF6E",
        // Compat aliases
        black:             "#0D0D0D",
        white:             "#F0EDE6",
        kaki:              "#2CBF6E",
        olive:             "#66625E",
        beige:             "#F0EDE6",
        anthracite:        "#1A1A1A",
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "Georgia", "serif"],
        serif:   ["'Cormorant Garamond'", "Georgia", "serif"],
        sans:    ["'Space Grotesk'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0px",
        none:    "0px",
        sm:      "2px",
        md:      "4px",
        lg:      "6px",
        xl:      "8px",
        "2xl":   "10px",
        "3xl":   "12px",
        pill:    "999px",
        full:    "9999px",
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom, 0px)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":  "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "accent-glow":     "radial-gradient(ellipse at 50% 0%, rgba(44,191,110,0.15) 0%, transparent 70%)",
      },
      keyframes: {
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to:   { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.25s ease forwards",
        shimmer:    "shimmer 1.5s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;

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
        black:         "#0C0C0C",
        white:         "#F0EDE6",
        green:         "#0B362D",
        "green-light": "#1A5C4A",
        sage:          "#7A9E8E",
        cream:         "#E8E4DC",
        surface:       "#161616",
        red:           "#C72927",
        sand:          "#D4C9B5",
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "Georgia", "serif"],
        sans:    ["'Space Grotesk'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0px",
        none:    "0px",
        sm:      "2px",
        md:      "8px",
        pill:    "20px",
        full:    "9999px",
      },
      screens: {
        xs:    "480px",
        sm:    "480px",
        md:    "768px",
        lg:    "1024px",
        xl:    "1280px",
        "2xl": "1440px",
      },
      spacing: {
        "1":  "4px",
        "2":  "8px",
        "3":  "12px",
        "4":  "16px",
        "6":  "24px",
        "8":  "32px",
        "12": "48px",
        "16": "64px",
        "24": "96px",
        "32": "128px",
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

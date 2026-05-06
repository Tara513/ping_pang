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
        black:      "#0A0A0A",
        white:      "#F5F2EC",
        kaki:       "#4A5240",
        olive:      "#8A9178",
        beige:      "#E8E0D0",
        anthracite: "#2A2A2A",
        red:        "#C8352A",
        yellow:     "#E8C840",
      },
      fontFamily: {
        display: ["var(--font-bebas)", "sans-serif"],
        sans:    ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0px",
        none:    "0px",
        sm:      "2px",
        md:      "4px",
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

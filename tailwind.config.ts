import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontSize: {
        'dynamic': 'calc(1rem + 2vw)'
      },
      colors: {
        "favorite": "#FF8A8A",
        "251e1e": "#251E1E",
        "201a1a": "#201A1A",
        "382d2d": "#382d2d",
      },
      maxWidth: {
        "34": "8.5rem",
        "30": "7.5rem"
      },
      maxHeight: {
        "34": "8.5rem",
        "30": "7.5rem"
      },
      fontFamily: {
        "joekubert": "JoeKubert",
      },
      screens: {
        'sm': '400px'
      }
    },
  },
  plugins: [],
};
export default config;

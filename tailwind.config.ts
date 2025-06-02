import type { Config } from "tailwindcss";
import scrollbarHide from 'tailwind-scrollbar-hide';

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#ededed",
        foreground: "#0a0a0a",
      },
    },
  },
  plugins: [
    scrollbarHide,
    require('tailwind-scrollbar'),
    require('@tailwindcss/typography'),
    // Add other plugins here
  ],
} satisfies Config;

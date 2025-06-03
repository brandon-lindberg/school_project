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
        primary: '#5EA8A3',
        secondary: '#F4A261',
        neutral: {
          50: '#FCFCFA',
          100: '#F7F7F5',
          200: '#E5E5E1',
          400: '#6B7280',
          700: '#374151',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Mulish', 'Inter', 'sans-serif'],
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

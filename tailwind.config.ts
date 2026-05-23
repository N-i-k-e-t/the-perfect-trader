import type { Config } from 'tailwindcss';

/** Extends Tailwind v4 @theme tokens in src/app/globals.css */
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cta: {
          DEFAULT: '#10b981',
          dark: '#059669',
        },
      },
    },
  },
};

export default config;

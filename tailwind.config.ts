import { type Config } from "tailwindcss";
import flowbite from 'flowbite/plugin'
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
    },
  },
  plugins: [
    flowbite
  ],
} satisfies Config;

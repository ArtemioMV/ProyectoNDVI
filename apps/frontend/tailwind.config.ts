import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(215 24% 89%)",
        background: "hsl(0 0% 100%)",
        foreground: "hsl(222 38% 14%)",
        primary: "hsl(221 78% 52%)",
        muted: "hsl(36 30% 96%)",
        "table-head": "hsl(210 40% 96%)"
      }
    }
  },
  plugins: []
} satisfies Config;


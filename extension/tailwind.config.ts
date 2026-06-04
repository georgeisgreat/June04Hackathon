import type { Config } from "tailwindcss";

export default {
  content: ["./entrypoints/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  // Prefix prevents conflicts with ChatGPT's own Tailwind classes
  prefix: "cc-",
  theme: {
    extend: {
      colors: {
        grounded: "#16a34a",
        mostly: "#ca8a04",
        weakly: "#ea580c",
        hallucination: "#dc2626",
      },
    },
  },
  plugins: [],
} satisfies Config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0d1117",
        panel: "#161b22",
        rail: "#111827",
        line: "#30363d",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(88, 166, 255, 0.18), 0 16px 60px rgba(1, 4, 9, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;

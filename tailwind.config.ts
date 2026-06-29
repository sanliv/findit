import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#FF6A00",
          foreground: "#FFFFFF"
        },
        success: "#22A447",
        clue: "#2563EB",
        urgent: "#EF4444"
      },
      boxShadow: {
        soft: "0 14px 42px rgba(98, 62, 25, 0.10)",
        card: "0 8px 24px rgba(53, 35, 18, 0.08)"
      },
      borderRadius: {
        xl: "16px",
        "2xl": "22px"
      }
    }
  },
  plugins: []
};

export default config;

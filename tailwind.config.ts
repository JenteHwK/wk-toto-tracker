import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // Status palette
        open: {
          DEFAULT: "hsl(var(--open))",
          soft: "hsl(var(--open-soft))",
        },
        won: {
          DEFAULT: "hsl(var(--won))",
          soft: "hsl(var(--won-soft))",
        },
        lost: {
          DEFAULT: "hsl(var(--lost))",
          soft: "hsl(var(--lost-soft))",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateX(120%)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        "scale-in": "scale-in 0.2s ease-out both",
        shimmer: "shimmer 1.5s infinite",
        "toast-in": "toast-in 0.3s cubic-bezier(0.21, 1.02, 0.73, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;

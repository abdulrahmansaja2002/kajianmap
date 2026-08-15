import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/hooks/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#ECFAF5",
          100: "#D2F2E5",
          200: "#A6E5CC",
          300: "#71D1AF",
          400: "#3FB690",
          500: "#219873",
          600: "#15795D",
          700: "#0D6350",
          800: "#0B4F41",
          900: "#0A4136",
        },
        sage: {
          DEFAULT: "hsl(var(--sage))",
          50: "#F4F6F1",
          100: "#E6EBDE",
          200: "#CFD9C1",
          300: "#B0C09B",
          400: "#93A87A",
          500: "#798E60",
          600: "#5F714B",
          700: "#4C5A3D",
          800: "#3F4A34",
          900: "#363F2E",
        },
        slate: {
          50: "#F8FAFA",
          100: "#F0F3F2",
          200: "#DFE5E3",
          300: "#C3CDC9",
          400: "#95A39D",
          500: "#71827A",
          600: "#586961",
          700: "#48564F",
          800: "#3B4640",
          900: "#232B26",
          950: "#141914",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        today: {
          DEFAULT: "hsl(var(--today))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(20 25 20 / 0.04), 0 1px 6px -1px rgb(20 25 20 / 0.06)",
        card: "0 2px 8px -2px rgb(20 25 20 / 0.08), 0 1px 2px -1px rgb(20 25 20 / 0.04)",
        raised: "0 8px 30px -8px rgb(20 25 20 / 0.18)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "marker-pulse": {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "0.15", transform: "scale(1.6)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "marker-pulse": "marker-pulse 2.2s ease-in-out infinite",
        "fade-up": "fade-up 0.25s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

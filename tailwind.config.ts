import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Amiri', 'serif'],
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // TCC Custom Colors
        tcc: {
          bg0: "hsl(var(--bg-0))",
          bg1: "hsl(var(--bg-1))",
          surface1: "hsl(var(--surface-1))",
          surface2: "hsl(var(--surface-2))",
          green: "hsl(var(--green-primary))",
          greenDeep: "hsl(var(--green-deep))",
          gold: "hsl(var(--gold))",
          amber: "hsl(var(--amber))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1.375rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        card: "0 10px 26px rgba(0, 0, 0, 0.35)",
        glow: "0 0 20px hsl(160 66% 49% / 0.18)",
        "glow-gold": "0 0 18px hsl(45 92% 57% / 0.16)",
        "glow-lg": "0 0 40px hsl(160 66% 49% / 0.25)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(100%)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.5" },
          "50%": { transform: "scale(1.1)", opacity: "0.8" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.26s cubic-bezier(0.16, 1, 0.3, 1)",
        "accordion-up": "accordion-up 0.22s cubic-bezier(0.7, 0, 0.84, 0)",
        "fade-in": "fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scale-in 0.26s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slide-up 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-ring": "pulse-ring 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      transitionTimingFunction: {
        "tcc-standard": "cubic-bezier(0.2, 0.8, 0.2, 1)",
        "tcc-enter": "cubic-bezier(0.16, 1, 0.3, 1)",
        "tcc-exit": "cubic-bezier(0.7, 0, 0.84, 0)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

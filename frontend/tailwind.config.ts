import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ─── Brand Color System ──────────────────────────────────────────────
      colors: {
        border: "#e5e7eb",
        // Primary: Energy Green
        green: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",   // primary brand
          700: "#15803d",   // hover
          800: "#166534",
          900: "#14532d",
        },
        // Secondary: Deep Navy
        navy: {
          50:  "#f0f4ff",
          100: "#e0e9ff",
          200: "#c7d6ff",
          300: "#a5b8fc",
          400: "#8191f8",
          500: "#6366f1",
          600: "#2d3a6e",
          700: "#1e2a55",
          800: "#1a2340",   // primary navy
          900: "#0f1628",   // darkest
          950: "#080c1a",
        },
        // Accent: Solar Yellow / Amber
        solar: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",   // solar accent
          500: "#f59e0b",   // hover
          600: "#d97706",
          700: "#b45309",
        },
      },
      // ─── Typography ──────────────────────────────────────────────────────
      fontFamily: {
        sans:    ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-outfit)", "system-ui", "sans-serif"],
        mono:    ["var(--font-geist-mono)", "monospace"],
      },
      // ─── Animation ───────────────────────────────────────────────────────
      animation: {
        "fade-in":     "fadeIn 0.5s ease-in-out",
        "slide-up":    "slideUp 0.6s ease-out",
        "slide-down":  "slideDown 0.6s ease-out",
        "scale-in":    "scaleIn 0.4s ease-out",
        "pulse-slow":  "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow":   "spin 8s linear infinite",
        "float":       "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:   { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp:  { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideDown:{ "0%": { opacity: "0", transform: "translateY(-20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        scaleIn:  { "0%": { opacity: "0", transform: "scale(0.95)" }, "100%": { opacity: "1", transform: "scale(1)" } },
        float:    { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
      },
      // ─── Spacing / Sizing ─────────────────────────────────────────────────
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },
      // ─── Border Radius ────────────────────────────────────────────────────
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      // ─── Box Shadow ───────────────────────────────────────────────────────
      boxShadow: {
        "card":       "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.06)",
        "card-hover": "0 20px 40px -10px rgba(0,0,0,0.15)",
        "glow-green": "0 0 30px rgba(34, 197, 94, 0.3)",
        "glow-solar": "0 0 30px rgba(251, 191, 36, 0.4)",
        "glass":      "0 8px 32px rgba(0,0,0,0.12)",
        "inner-lg":   "inset 0 2px 4px 0 rgba(0,0,0,0.06)",
      },
      // ─── Background Image ────────────────────────────────────────────────
      backgroundImage: {
        "gradient-solar": "linear-gradient(135deg, #15803d 0%, #1a2340 100%)",
        "gradient-hero":  "linear-gradient(135deg, #0f1628 0%, #1a2340 50%, #14532d 100%)",
        "gradient-card":  "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        "dot-pattern":    "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
      },
      backgroundSize: {
        "dot": "24px 24px",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;

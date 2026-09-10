import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        // FinAxis brand palette — dégradé Bleu de Prusse → Marine profonde →
        // Bleu Yale → Céruléen → Blanc.
        navy: {
          DEFAULT: "#001F54",
          50: "#EEF1F6",
          100: "#D7DEE9",
          400: "#034078",
          600: "#023066",
          700: "#001F54",
          800: "#05183E",
          900: "#0A1128",
        },
        turquoise: {
          DEFAULT: "#1282A2",
          50: "#E8F3F6",
          100: "#C7E4EA",
          200: "#96CBD8",
          400: "#2E9DB8",
          500: "#1282A2",
          600: "#0E6982",
          700: "#0A5163",
        },
        "surface-tint": "#F5F4F2",
        slate: {
          DEFAULT: "#6B7280",
        },
      },
      borderRadius: {
        lg: "8px",
        md: "6px",
        sm: "4px",
        xl: "12px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
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
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 31 84 / 0.06)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

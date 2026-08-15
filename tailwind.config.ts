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
        // FinAxis brand palette
        navy: {
          DEFAULT: "#0F2A44",
          50: "#EEF2F5",
          100: "#D7E0E8",
          400: "#3D5975",
          600: "#173754",
          700: "#0F2A44",
          800: "#0B2036",
          900: "#081726",
        },
        turquoise: {
          DEFAULT: "#1FB6C1",
          50: "#EAFBFC",
          100: "#D1F4F6",
          200: "#A6E9ED",
          400: "#3FC5CE",
          500: "#1FB6C1",
          600: "#17909A",
          700: "#146F77",
        },
        "surface-tint": "#F7F9FB",
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
        sm: "0 1px 2px 0 rgb(15 42 68 / 0.06)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

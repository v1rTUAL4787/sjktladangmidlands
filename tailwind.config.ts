import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1B3A6B",
          foreground: "#FFFFFF",
          50: "#E8EDF5",
          100: "#C5D0E8",
          500: "#1B3A6B",
          600: "#162F57",
          700: "#112443",
        },
        accent: {
          DEFAULT: "#00A0C0",
          foreground: "#FFFFFF",
          50: "#E0F5FA",
          100: "#B3E6F0",
          500: "#00A0C0",
          600: "#007F99",
        },
        gold: {
          DEFAULT: "#F5B800",
          50: "#FEF8E0",
          100: "#FDEDB3",
          500: "#F5B800",
          600: "#C49300",
        },
        crimson: {
          DEFAULT: "#C41E3A",
          50: "#FAEAED",
          100: "#F2C1C9",
          500: "#C41E3A",
          600: "#9D182F",
        },
        deep: {
          DEFAULT: "#2D1B69",
          500: "#2D1B69",
          600: "#221453",
        },
        surface: "#EEF7EE",   /* pastel green */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ["var(--font-noto-sans)", "sans-serif"],
        serif: ["var(--font-noto-serif)", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    animate,
    function({ addUtilities }: { addUtilities: (u: Record<string, Record<string, string>>) => void }) {
      addUtilities({ ".scrollbar-hide": { "-ms-overflow-style": "none", "scrollbar-width": "none" }, ".scrollbar-hide::-webkit-scrollbar": { display: "none" } });
    },
  ],
};

export default config;

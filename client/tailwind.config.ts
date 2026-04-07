import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          900: "#0f172a",
          800: "#162033",
          700: "#1e293b"
        },
        app: {
          bg: "var(--bg-app)",
          panel: "var(--bg-panel)",
          elevated: "var(--bg-elevated)",
          inset: "var(--bg-inset)"
        }
      },
      boxShadow: {
        panel: "var(--shadow-panel)",
        card: "var(--shadow-card)",
        floating: "var(--shadow-floating)"
      },
      borderColor: {
        panel: "var(--border-panel)",
        card: "var(--border-card)",
        accent: "var(--border-accent)"
      }
    }
  },
  plugins: []
} satisfies Config;

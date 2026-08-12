/**
 * Motora — preset Tailwind com os tokens do design system.
 * Cores apontam para CSS variables (definidas em @motora/ui tokens.css),
 * o que dá suporte nativo a tema claro/escuro.
 * Referência: platform/docs/05-design-system.md
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        surface: {
          DEFAULT: "var(--surface)",
          2: "var(--surface-2)",
          3: "var(--surface-3)",
        },
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        text: "var(--text)",
        muted: "var(--muted)",
        faint: "var(--faint)",
        brand: {
          DEFAULT: "var(--brand)",
          strong: "var(--brand-strong)",
        },
        accent: "var(--accent)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        bronze: "var(--bronze)",
        prata: "var(--prata)",
        ouro: "var(--ouro)",
        platinum: "var(--platinum)",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SF Mono", "Menlo", "Consolas", "monospace"],
      },
      transitionTimingFunction: {
        ease: "cubic-bezier(.2,.8,.2,1)",
      },
    },
  },
  plugins: [],
};

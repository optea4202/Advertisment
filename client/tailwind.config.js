/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "var(--color-primary)",
        "on-primary": "var(--color-on-primary)",
        "primary-container": "var(--color-primary-container)",
        "on-primary-container": "var(--color-on-primary-container)",
        "inverse-primary": "var(--color-inverse-primary)",
        "primary-fixed": "var(--color-primary-fixed)",
        "primary-fixed-dim": "var(--color-primary-fixed-dim)",
        "on-primary-fixed": "var(--color-on-primary-fixed)",
        "on-primary-fixed-variant": "var(--color-on-primary-fixed-variant)",
        "surface-tint": "var(--color-surface-tint)",

        "secondary": "var(--color-secondary)",
        "on-secondary": "var(--color-on-secondary)",
        "secondary-container": "var(--color-secondary-container)",
        "on-secondary-container": "var(--color-on-secondary-container)",
        "secondary-fixed": "var(--color-secondary-fixed)",
        "secondary-fixed-dim": "var(--color-secondary-fixed-dim)",
        "on-secondary-fixed": "var(--color-on-secondary-fixed)",
        "on-secondary-fixed-variant": "var(--color-on-secondary-fixed-variant)",

        "tertiary": "var(--color-tertiary)",
        "on-tertiary": "var(--color-on-tertiary)",
        "tertiary-container": "var(--color-tertiary-container)",
        "on-tertiary-container": "var(--color-on-tertiary-container)",
        "tertiary-fixed": "var(--color-tertiary-fixed)",
        "tertiary-fixed-dim": "var(--color-tertiary-fixed-dim)",
        "on-tertiary-fixed": "var(--color-on-tertiary-fixed)",
        "on-tertiary-fixed-variant": "var(--color-on-tertiary-fixed-variant)",

        "error": "var(--color-error)",
        "on-error": "var(--color-on-error)",
        "error-container": "var(--color-error-container)",
        "on-error-container": "var(--color-on-error-container)",

        "background": "var(--color-background)",
        "on-background": "var(--color-on-background)",
        
        "surface": "var(--color-surface)",
        "surface-dim": "var(--color-surface-dim)",
        "surface-bright": "var(--color-surface-bright)",
        "surface-container-lowest": "var(--color-surface-container-lowest)",
        "surface-container-low": "var(--color-surface-container-low)",
        "surface-container": "var(--color-surface-container)",
        "surface-container-high": "var(--color-surface-container-high)",
        "surface-container-highest": "var(--color-surface-container-highest)",
        "surface-variant": "var(--color-surface-variant)",
        "inverse-surface": "var(--color-inverse-surface)",
        "inverse-on-surface": "var(--color-inverse-on-surface)",
        "on-surface": "var(--color-on-surface)",
        "on-surface-variant": "var(--color-on-surface-variant)",
        
        "outline": "var(--color-outline)",
        "outline-variant": "var(--color-outline-variant)",

        "accent-teal-subtle": "var(--color-accent-teal-subtle)",
        "accent-indigo-subtle": "var(--color-accent-indigo-subtle)",
        "accent-indigo-strong": "var(--color-accent-indigo-strong)",
        "accent-dark": "var(--color-accent-dark)"
      },
      borderRadius: {
        "DEFAULT": "var(--radius-sm)",
        "lg": "var(--radius-default)",
        "xl": "var(--radius-md)",
        "2xl": "var(--radius-xl)",
        "full": "var(--radius-full)"
      },
      spacing: {
        "base": "var(--space-xs)",
        "xs": "var(--space-xs)",
        "sm": "var(--space-sm)",
        "md": "var(--space-md)",
        "lg": "var(--space-lg)",
        "xl": "var(--space-xl)",
        "xxl": "var(--space-xxl)",
        "container-max": "var(--container-max)",
        "gutter": "var(--gutter)"
      },
      fontFamily: {
        "display-lg": ["Inter", "sans-serif"],
        "headline-lg": ["Inter", "sans-serif"],
        "headline-lg-mobile": ["Inter", "sans-serif"],
        "headline-md": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"]
      },
      fontSize: {
        "display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "headline-lg-mobile": ["24px", { "lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
        "label-md": ["14px", { "lineHeight": "20px", "fontWeight": "500" }],
        "label-sm": ["12px", { "lineHeight": "16px", "fontWeight": "600" }]
      },
      keyframes: {
        "fade-in-up": {
          "0%":   { opacity: "0", transform: "translateY(6px) translateX(-50%)" },
          "100%": { opacity: "1", transform: "translateY(0)  translateX(-50%)" }
        },
        "fade-in-up-sheet": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "fade-in-up": "fade-in-up 0.18s ease-out both",
        "fade-in-up-sheet": "fade-in-up-sheet 0.18s ease-out both"
      }
    },
  },
  plugins: [],
}

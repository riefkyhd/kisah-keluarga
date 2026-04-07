export const tokens = {
  color: {
    bg: "var(--color-cream)",
    surface: "#ffffff",
    bark: "var(--color-bark)",
    clay: "var(--color-clay)",
    sand: "var(--color-sand)",
    warm: "var(--color-warm)",
    cream: "var(--color-cream)",
    danger: "#9b3022",
    success: "#3f5c45"
  },
  radius: {
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    hero: "2.5rem"
  },
  shadow: {
    soft: "0 1px 3px rgba(28,25,23,0.06)",
    card: "0 1px 3px rgba(28,25,23,0.06), 0 4px 16px rgba(28,25,23,0.06)",
    panel: "0 8px 32px rgba(28,25,23,0.14)",
    modal: "-4px 0 40px rgba(28,25,23,0.16)",
    floating: "0 4px 24px rgba(28,25,23,0.14)"
  },
  motion: {
    ease: "cubic-bezier(0.16, 1, 0.3, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeExit: "cubic-bezier(0.4, 0, 1, 1)",
    duration: {
      fast: "120ms",
      base: "220ms",
      panel: "280ms",
      slow: "380ms"
    }
  }
} as const;

export const designTokens = {
  colors: {
    cream: "#FAF7F2",
    warm: "#F0EAE0",
    bark: "#4A3728",
    clay: "#8B5E3C",
    sand: "#D4B896",
    rust: "#C4623A"
  },
  radius: {
    control: tokens.radius.sm,
    button: tokens.radius.md,
    card: tokens.radius.lg,
    panel: tokens.radius.xl,
    hero: tokens.radius.hero
  }
} as const;

export const appThemeColor = "#FAF7F2";

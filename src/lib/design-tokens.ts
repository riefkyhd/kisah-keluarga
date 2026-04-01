export const designTokens = {
  colors: {
    cream: "#FAF7F2",
    warm: "#F0EAE0",
    bark: "#4A3728",
    clay: "#8B5E3C",
    sage: "#6B7C5E",
    rust: "#C4623A",
    sand: "#D4B896"
  },
  radius: {
    control: "1rem",
    card: "1.5rem",
    hero: "2rem"
  }
} as const;

export const appThemeColor = designTokens.colors.cream;

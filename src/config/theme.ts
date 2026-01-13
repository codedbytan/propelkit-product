// Default theme configuration
// This file will be overwritten by the setup wizard
// Run: npm run setup

export type ColorScheme = "blue" | "purple" | "green" | "orange" | "neutral";
export type ThemeVariant = "modern" | "minimal" | "bold";
export type CardStyle = "elevated" | "flat" | "bordered";
export type ButtonStyle = "rounded" | "sharp" | "pill";

export const themeConfig = {
  // Color scheme (imports correct CSS file)
  colorScheme: "blue" as ColorScheme,

  // Visual style variant
  variant: "modern" as ThemeVariant,

  // Layout preferences
  layout: {
    cardStyle: "elevated" as CardStyle,
    buttonStyle: "rounded" as ButtonStyle,
    spacing: "comfortable", // comfortable | compact | spacious
  },

  // Animation preferences
  animations: {
    enabled: true,
    speed: "normal", // slow | normal | fast
  },

  // Typography
  typography: {
    headingFont: "Inter",
    bodyFont: "Inter",
    scale: 1.0, // 0.9 | 1.0 | 1.1
  },
};

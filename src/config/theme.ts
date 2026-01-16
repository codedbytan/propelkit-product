// Default theme configuration
// This file will be overwritten by the setup wizard
// Run: npm run setup

export const themeConfig = {
    colorScheme: 'blue' as const,
    variant: 'modern' as const,

    layout: {
        cardStyle: 'elevated' as const,
        buttonStyle: 'rounded' as const,
        spacing: 'comfortable' as const,
    },

    typography: {
        fontFamily: 'inter' as const,
        scale: 'medium' as const,
    },
};

export type ThemeConfig = typeof themeConfig;

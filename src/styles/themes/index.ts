/**
 * Color Scheme Definitions
 *
 * This file exports a map of available color schemes for dynamic import.
 * Used by the root layout to load the appropriate CSS file based on theme config.
 */

export type ColorScheme = 'blue' | 'purple' | 'green' | 'orange' | 'neutral';

/**
 * Map of color scheme names to their CSS file paths
 */
export const colorSchemes: Record<ColorScheme, string> = {
  blue: '/styles/themes/blue.css',
  purple: '/styles/themes/purple.css',
  green: '/styles/themes/green.css',
  orange: '/styles/themes/orange.css',
  neutral: '/styles/themes/neutral.css',
};

/**
 * Get the CSS file path for a given color scheme
 * @param scheme - The color scheme name
 * @returns The path to the CSS file
 */
export function getColorSchemeCSS(scheme: ColorScheme): string {
  return colorSchemes[scheme] || colorSchemes.blue;
}

/**
 * Color utility functions for React Native Web compatibility
 */

/**
 * Convert hex color to rgba with alpha transparency
 * @param hex - Hex color string (e.g., '#FF0000')
 * @param alpha - Alpha value between 0 and 1 (e.g., 0.2 for 20% opacity)
 * @returns RGBA color string
 */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Create a transparent version of a color
 * @param color - Hex color string
 * @param opacity - Opacity percentage (10 = 10%, 20 = 20%)
 * @returns RGBA color string
 */
export function withOpacity(color: string, opacity: number): string {
  return hexToRgba(color, opacity / 100);
}

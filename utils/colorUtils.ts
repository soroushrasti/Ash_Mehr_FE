/**
 * Color utility functions for the app
 */

/**
 * Adds opacity to a color string
 * @param color - The color in hex format (e.g., '#FF0000' or 'red')
 * @param opacity - Opacity value from 0-100 (e.g., 20 for 20% opacity)
 * @returns Color with opacity applied
 */
export function withOpacity(color: string, opacity: number): string {
  // Check if color is undefined or null
  if (!color || typeof color !== 'string') {
    console.warn('withOpacity received invalid color:', color);
    return `rgba(0, 0, 0, ${Math.max(0, Math.min(100, opacity)) / 100})`; // Return black with opacity as fallback
  }

  // Normalize opacity to 0-1 range
  const normalizedOpacity = Math.max(0, Math.min(100, opacity)) / 100;

  // If color is already in hex format
  if (color.startsWith('#')) {
    // Convert hex to RGBA
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${normalizedOpacity})`;
  }

  // If color is a named color or already in rgb format
  if (color.startsWith('rgb(')) {
    // Extract RGB values and convert to RGBA
    const values = color.match(/\d+/g);
    if (values && values.length >= 3) {
      return `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${normalizedOpacity})`;
    }
  }

  // For named colors, return as-is with opacity (CSS will handle it)
  return `rgba(0, 0, 0, ${normalizedOpacity})`; // Fallback to black with opacity
}

/**
 * Converts a hex color to RGB values
 * @param hex - Hex color string (e.g., '#FF0000')
 * @returns Object with r, g, b values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Converts RGB values to hex color
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Hex color string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Lightens a color by a percentage
 * @param color - Color in hex format
 * @param percent - Percentage to lighten (0-100)
 * @returns Lightened color in hex format
 */
export function lightenColor(color: string, percent: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const factor = 1 + (percent / 100);
  const r = Math.min(255, Math.round(rgb.r * factor));
  const g = Math.min(255, Math.round(rgb.g * factor));
  const b = Math.min(255, Math.round(rgb.b * factor));

  return rgbToHex(r, g, b);
}

/**
 * Darkens a color by a percentage
 * @param color - Color in hex format
 * @param percent - Percentage to darken (0-100)
 * @returns Darkened color in hex format
 */
export function darkenColor(color: string, percent: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const factor = 1 - (percent / 100);
  const r = Math.max(0, Math.round(rgb.r * factor));
  const g = Math.max(0, Math.round(rgb.g * factor));
  const b = Math.max(0, Math.round(rgb.b * factor));

  return rgbToHex(r, g, b);
}

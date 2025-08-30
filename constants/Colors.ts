/**
 * Charity App Colors - Beautiful color palette for a Persian charity application
 * Colors inspired by hope, warmth, and community spirit
 */

const tintColorLight = '#2E7D32'; // Rich green for hope and growth
const tintColorDark = '#66BB6A'; // Lighter green for dark mode

export const Colors = {
  light: {
    text: '#1A1A1A',
    background: '#FAFAFA',
    tint: tintColorLight,
    icon: '#757575',
    tabIconDefault: '#9E9E9E',
    tabIconSelected: tintColorLight,

    // Charity-specific colors
    primary: '#2E7D32', // Deep green - hope and growth
    secondary: '#FF7043', // Warm orange - warmth and energy
    accent: '#5C6BC0', // Soft purple - trust and wisdom
    success: '#4CAF50', // Success green
    warning: '#FFA726', // Warning orange
    error: '#EF5350', // Error red
    info: '#42A5F5', // Info blue

    // Background variations
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    background2: '#F8F9FA',

    // Text variations
    textPrimary: '#1A1A1A',
    textSecondary: '#616161',
    textTertiary: '#9E9E9E',
    textOnPrimary: '#FFFFFF',

    // Borders and dividers
    border: '#E0E0E0',
    divider: '#EEEEEE',

    // Charity specific
    donation: '#4CAF50',
    volunteer: '#FF7043',
    emergency: '#F44336',
    children: '#E91E63',
    elderly: '#9C27B0',
    education: '#3F51B5',
    health: '#00BCD4',
    food: '#FF9800',
  },
  dark: {
    text: '#E8E8E8',
    background: '#121212',
    tint: tintColorDark,
    icon: '#B0B0B0',
    tabIconDefault: '#757575',
    tabIconSelected: tintColorDark,

    // Charity-specific colors (darker variants)
    primary: '#66BB6A',
    secondary: '#FF8A65',
    accent: '#7986CB',
    success: '#66BB6A',
    warning: '#FFB74D',
    error: '#EF5350',
    info: '#64B5F6',

    // Background variations
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',
    background2: '#1A1A1A',

    // Text variations
    textPrimary: '#E8E8E8',
    textSecondary: '#B0B0B0',
    textTertiary: '#757575',
    textOnPrimary: '#000000',

    // Borders and dividers
    border: '#333333',
    divider: '#2C2C2C',

    // Charity specific (darker variants)
    donation: '#66BB6A',
    volunteer: '#FF8A65',
    emergency: '#EF5350',
    children: '#F06292',
    elderly: '#BA68C8',
    education: '#7986CB',
    health: '#4DD0E1',
    food: '#FFB74D',
  },
};

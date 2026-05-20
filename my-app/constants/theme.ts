/**
 * UniLease visual system
 * Campus-focused, bright, clear, and close to the Stitch reference.
 */

import { Platform } from 'react-native';

/** Shared geometry — functional, not decorative */
export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
} as const;

export const Brand = {
  name: 'UniLease',
  keywords: ['Verified', 'Campus', 'Fast', 'Secure'] as const,
  tagline: 'Campus gear marketplace',
} as const;

const primaryBlue = '#185A7D';
const softBlue = '#E2EDFF';
const deepInk = '#132334';

export const Colors = {
  light: {
    text: '#15202B',
    background: '#F7FAFD',
    surface: '#F1F5FA',
    card: '#FFFFFF',
    tint: primaryBlue,
    primary: primaryBlue,
    secondary: '#607084',
    muted: '#8DA0B4',
    border: '#E0E8F1',
    accent: '#2C7DA0',
    icon: '#5A7188',
    tabIconDefault: '#7F91A5',
    tabIconSelected: primaryBlue,
    error: '#B91C1C',
    errorSurface: '#FEF2F2',
    errorBorder: '#FECACA',
    gradientTop: '#F7FAFD',
    gradientBottom: softBlue,
    onPrimary: '#FFFFFF',
    geometric: '#D9E7F7',
    geometricMuted: '#EEF5FC',
    hero: softBlue,
    heroText: deepInk,
    success: '#0E8F68',
    warning: '#9A6B00',
  },
  dark: {
    text: '#FAFAFA',
    background: '#0C1620',
    surface: '#142333',
    card: '#101C28',
    tint: '#FAFAFA',
    primary: '#FAFAFA',
    secondary: '#B8C4D2',
    muted: '#7F91A5',
    border: '#25384C',
    accent: '#8EC5E7',
    icon: '#8B949E',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#FAFAFA',
    error: '#F87171',
    errorSurface: '#1F1414',
    errorBorder: '#3D2020',
    gradientTop: '#0C1620',
    gradientBottom: '#142333',
    onPrimary: '#0A0E14',
    geometric: '#1E3347',
    geometricMuted: '#243B52',
    hero: '#18344D',
    heroText: '#FAFAFA',
    success: '#34D399',
    warning: '#FBBF24',
  },
};

export type ThemeColors = (typeof Colors)['light'];

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

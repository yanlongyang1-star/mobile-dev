/**
 * Tech Minimalist design system
 * Secure · Professional · Fast · Digital
 * Dark/high-contrast monochrome with subtle slate-blue depth.
 */

import { Platform } from 'react-native';

/** Shared geometry — functional, not decorative */
export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
} as const;

export const Brand = {
  name: 'UniLease',
  keywords: ['Secure', 'Professional', 'Fast', 'Digital'] as const,
  tagline: 'Secure campus marketplace',
} as const;

const accent = '#5B7A9A';
const accentLight = '#3F5568';

export const Colors = {
  light: {
    text: '#09090B',
    background: '#F4F4F5',
    surface: '#FAFAFA',
    card: '#FFFFFF',
    tint: '#18181B',
    primary: '#18181B',
    secondary: '#52525B',
    muted: '#A1A1AA',
    border: '#E4E4E7',
    accent: accentLight,
    icon: '#71717A',
    tabIconDefault: '#A1A1AA',
    tabIconSelected: '#09090B',
    error: '#B91C1C',
    errorSurface: '#FEF2F2',
    errorBorder: '#FECACA',
    gradientTop: '#F4F4F5',
    gradientBottom: '#E4E4E7',
    onPrimary: '#FFFFFF',
    geometric: '#D4D4D8',
    geometricMuted: '#E4E4E7',
  },
  dark: {
    text: '#FAFAFA',
    background: '#0A0E14',
    surface: '#141A22',
    card: '#161D27',
    tint: '#FAFAFA',
    primary: '#FAFAFA',
    secondary: '#8B949E',
    muted: '#6B7280',
    border: '#2A3441',
    accent,
    icon: '#8B949E',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#FAFAFA',
    error: '#F87171',
    errorSurface: '#1F1414',
    errorBorder: '#3D2020',
    gradientTop: '#0A0E14',
    gradientBottom: '#141B26',
    onPrimary: '#0A0E14',
    geometric: '#1E2836',
    geometricMuted: '#243040',
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

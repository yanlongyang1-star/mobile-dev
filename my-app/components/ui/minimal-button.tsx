import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from 'react-native';

import { Radius } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';

type Variant = 'primary' | 'secondary' | 'outline';

type MinimalButtonProps = TouchableOpacityProps & {
  label: string;
  variant?: Variant;
  loading?: boolean;
};

export function MinimalButton({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...rest
}: MinimalButtonProps) {
  const colors = useThemeColors();
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  const backgroundColor = isPrimary
    ? colors.primary
    : isOutline
      ? 'transparent'
      : colors.surface;
  const textColor = isPrimary ? colors.onPrimary : colors.text;
  const borderColor = isOutline ? colors.border : 'transparent';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor, borderColor },
        (disabled || loading) && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.9}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.55,
  },
});

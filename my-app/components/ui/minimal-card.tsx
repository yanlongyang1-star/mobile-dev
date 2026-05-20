import React, { type PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radius } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';

type MinimalCardProps = PropsWithChildren<ViewProps>;

export function MinimalCard({ children, style, ...rest }: MinimalCardProps) {
  const colors = useThemeColors();

  return (
    <View
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}
      {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 16,
  },
});

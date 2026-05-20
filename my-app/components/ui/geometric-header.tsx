import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme-colors';

export function GeometricHeader() {
  const colors = useThemeColors();

  return (
    <View style={styles.root}>
      <View style={[styles.blockLarge, { backgroundColor: colors.geometric }]} />
      <View style={[styles.blockSmall, { backgroundColor: colors.geometricMuted }]} />
      <View style={[styles.accentBar, { backgroundColor: colors.accent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  blockLarge: {
    position: 'absolute',
    width: 200,
    height: 200,
    left: -24,
    top: 20,
    transform: [{ rotate: '8deg' }],
    opacity: 0.7,
  },
  blockSmall: {
    position: 'absolute',
    width: 140,
    height: 140,
    right: 16,
    top: 36,
    opacity: 0.65,
  },
  accentBar: {
    position: 'absolute',
    width: 200,
    height: 4,
    right: 24,
    bottom: 24,
    opacity: 0.5,
  },
});

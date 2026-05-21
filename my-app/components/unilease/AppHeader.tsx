import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Brand, Radius } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
  leftIcon?: React.ComponentProps<typeof MaterialIcons>['name'];
  rightIcon?: React.ComponentProps<typeof MaterialIcons>['name'];
  leftLabel?: string;
  rightLabel?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
};

export function AppHeader({
  title = Brand.name,
  subtitle,
  leftIcon = 'menu',
  rightIcon = 'person-outline',
  leftLabel = 'Open navigation',
  rightLabel = 'Open profile',
  onLeftPress,
  onRightPress,
}: AppHeaderProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.header}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={leftLabel}
        activeOpacity={0.82}
        onPress={onLeftPress}
        style={[styles.iconButton, { backgroundColor: colors.surface }]}
      >
        <MaterialIcons name={leftIcon} size={21} color={colors.primary} />
      </TouchableOpacity>

      <View style={styles.titleBlock}>
        <Text style={[styles.title, { color: colors.primary }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.secondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={rightLabel}
        activeOpacity={0.82}
        onPress={onRightPress}
        style={[styles.iconButton, { backgroundColor: colors.surface }]}
      >
        <MaterialIcons name={rightIcon} size={20} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 44,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
});

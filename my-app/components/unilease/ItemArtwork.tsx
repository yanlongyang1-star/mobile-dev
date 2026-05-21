import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';

import { Radius } from '@/constants/theme';
import type { UniLeaseItem } from '@/data/mock-unilease';
import { useThemeColors } from '@/hooks/use-theme-colors';

type ItemArtworkProps = {
  item?: Pick<UniLeaseItem, 'imageUrl' | 'title'> | null;
  height?: number;
  style?: StyleProp<ImageStyle>;
};

export function ItemArtwork({ item, height = 150, style }: ItemArtworkProps) {
  const colors = useThemeColors();

  if (item?.imageUrl) {
    return (
      <Image
        accessibilityLabel={item.title}
        contentFit="cover"
        source={{ uri: item.imageUrl }}
        style={[styles.image, { height, backgroundColor: colors.surface }, style]}
      />
    );
  }

  return (
    <View style={[styles.fallback, { height, backgroundColor: colors.surface }, style as StyleProp<ViewStyle>]}>
      <MaterialIcons name="inventory-2" size={34} color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    width: '100%',
  },
  fallback: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    justifyContent: 'center',
    width: '100%',
  },
});

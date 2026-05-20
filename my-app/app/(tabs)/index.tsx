import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { TextInput } from 'react-native-paper';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { GeometricHeader } from '@/components/ui/geometric-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { Brand, Radius } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useUniLease } from '@/contexts/UniLeaseContext';
import type { UniLeaseCategory } from '@/data/mock-unilease';

const ALL_CATEGORIES: (UniLeaseCategory | 'All')[] = ['All', 'Laptops', 'Textbooks', 'Calculators', 'Cameras', 'Tablets', 'Audio'];

export default function BrowseScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { items } = useUniLease();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<(typeof ALL_CATEGORIES)[number]>('All');

  const categories = useMemo(() => ALL_CATEGORIES, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      const matchesQuery = !q || `${it.title} ${it.description} ${it.location}`.toLowerCase().includes(q);
      const matchesCategory = activeCategory === 'All' ? true : it.categories.includes(activeCategory as UniLeaseCategory);
      return matchesQuery && matchesCategory;
    });
  }, [activeCategory, items, query]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: colors.gradientBottom, dark: colors.gradientBottom }}
      headerImage={<GeometricHeader />}
    >
      <ThemedView style={[styles.titleContainer, { borderColor: colors.border }]}>
        <ThemedText type="title" style={styles.brandTitle}>{Brand.name}</ThemedText>
        <ThemedText style={styles.subtitle}>{Brand.keywords.join(' · ')}</ThemedText>
        <TouchableOpacity
          style={[styles.featureButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/create-listing')}
          activeOpacity={0.95}
        >
          <ThemedText style={{ color: colors.onPrimary, fontWeight: '900' }}>List Your Item</ThemedText>
          <ThemedText style={[styles.featureButtonSub, { color: colors.muted }]}>Rental or consignment in one flow</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView lightColor={colors.card} darkColor={colors.card} style={[styles.searchCard, { borderColor: colors.border }]}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search devices, locations, keywords..."
          placeholderTextColor={colors.muted}
          style={[styles.searchInput, { color: colors.text }]}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {categories.map((c) => {
            const isActive = c === activeCategory;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setActiveCategory(c)}
                style={[
                  styles.categoryChip,
                  { borderColor: colors.border },
                  isActive ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: colors.surface },
                ]}
              >
                <ThemedText style={isActive ? { color: colors.onPrimary } : { color: colors.text }} type="defaultSemiBold">
                  {c}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </ThemedView>

      <ScrollView style={styles.list}>
        {filtered.map((item) => {
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push({ pathname: '/item/[id]', params: { id: item.id } })}
              style={styles.cardTouchable}
              activeOpacity={0.85}
            >
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Image source={require('@/assets/images/react-logo.png')} style={styles.itemImage} />
                <View style={{ flex: 1 }}>
                  <View style={styles.cardHeaderRow}>
                    <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                    <ThemedText style={styles.price} lightColor={colors.text} darkColor={colors.text}>
                      ${item.pricePerDay}/day
                    </ThemedText>
                  </View>
                  <ThemedText>{item.location} · Trust {item.owner.trustScore.toFixed(1)}</ThemedText>
                  <ThemedText style={styles.desc} numberOfLines={2}>
                    {item.description}
                  </ThemedText>
                  <View style={styles.cardFooterRow}>
                    <ThemedText style={styles.condition}>{item.condition}</ThemedText>
                    <View style={[styles.ctaRow, { backgroundColor: colors.primary }]}>
                      <ThemedText type="defaultSemiBold" style={{ color: colors.onPrimary }}>
                        View & Request
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        {filtered.length === 0 ? (
          <ThemedView style={[styles.emptyCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <ThemedText type="defaultSemiBold">No results</ThemedText>
            <ThemedText style={styles.muted}>Try a different keyword or category.</ThemedText>
          </ThemedView>
        ) : null}
      </ScrollView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    gap: 6,
    marginBottom: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 14,
  },
  brandTitle: {
    fontSize: 32,
    lineHeight: 34,
    letterSpacing: -0.3,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.75,
    letterSpacing: 0.3,
  },
  featureButton: {
    borderRadius: Radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 2,
    gap: 4,
  },
  featureButtonSub: {
    opacity: 0.95,
    fontWeight: '700',
    fontSize: 12,
  },
  searchCard: {
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  searchInput: {
    height: 44,
    fontSize: 15,
    marginBottom: 10,
  },
  categoryRow: {
    gap: 8,
    paddingBottom: 2,
  },
  categoryChip: {
    borderRadius: Radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  list: {
    flex: 1,
  },
  cardTouchable: {
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: Radius.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 4,
  },
  price: {
    fontWeight: '800',
  },
  desc: {
    opacity: 0.9,
  },
  cardFooterRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  condition: {
    fontWeight: '700',
    opacity: 0.85,
  },
  ctaRow: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
  },
  emptyCard: {
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  muted: {
    opacity: 0.8,
    marginTop: 6,
  },
});

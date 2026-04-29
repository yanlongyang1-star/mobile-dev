import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { TextInput } from 'react-native-paper';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUniLease } from '@/contexts/UniLeaseContext';
import type { UniLeaseCategory } from '@/data/mock-unilease';

const ALL_CATEGORIES: (UniLeaseCategory | 'All')[] = ['All', 'Laptops', 'Textbooks', 'Calculators', 'Cameras', 'Tablets', 'Audio'];

export default function BrowseScreen() {
  const router = useRouter();
  const buttonBg = useThemeColor({}, 'tint');
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
      headerBackgroundColor={{ light: '#D9F2FF', dark: '#123033' }}
      headerImage={
        <View style={styles.headerDecor}>
          <View style={styles.headerBlobLarge} />
          <View style={styles.headerBlobSmall} />
          <View style={styles.headerRibbon} />
        </View>
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.brandTitle}>UniLease</ThemedText>
        <ThemedText style={styles.subtitle}>Campus marketplace made simple</ThemedText>
        <TouchableOpacity
          style={[styles.featureButton, { backgroundColor: buttonBg }]}
          onPress={() => router.push('/create-listing')}
          activeOpacity={0.95}
        >
          <ThemedText style={{ color: '#fff', fontWeight: '900' }}>List Your Item</ThemedText>
          <ThemedText style={styles.featureButtonSub}>Rental or consignment in one simple flow</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView lightColor="#ffffff" darkColor="#0F1618" style={styles.searchCard}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search devices, locations, keywords..."
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {categories.map((c) => {
            const isActive = c === activeCategory;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setActiveCategory(c)}
                style={[styles.categoryChip, isActive ? { backgroundColor: buttonBg } : undefined]}
              >
                <ThemedText style={isActive ? { color: '#fff' } : undefined} type="defaultSemiBold">
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
              <View style={styles.card}>
                <Image source={require('@/assets/images/react-logo.png')} style={styles.itemImage} />
                <View style={{ flex: 1 }}>
                  <View style={styles.cardHeaderRow}>
                    <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                    <ThemedText style={styles.price} lightColor="#2563EB" darkColor="#60A5FA">
                      ${item.pricePerDay}/day
                    </ThemedText>
                  </View>
                  <ThemedText>{item.location} · Trust {item.owner.trustScore.toFixed(1)}</ThemedText>
                  <ThemedText style={styles.desc} numberOfLines={2}>
                    {item.description}
                  </ThemedText>
                  <View style={styles.cardFooterRow}>
                    <ThemedText style={styles.condition}>{item.condition}</ThemedText>
                    <View style={styles.ctaRow}>
                      <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>
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
          <ThemedView style={styles.emptyCard}>
            <ThemedText type="defaultSemiBold">No results</ThemedText>
            <ThemedText style={styles.muted}>Try a different keyword or category.</ThemedText>
          </ThemedView>
        ) : null}
      </ScrollView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerDecor: {
    flex: 1,
  },
  headerBlobLarge: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: '#BDE4F5',
    left: -30,
    top: 16,
  },
  headerBlobSmall: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: '#9FD3EA',
    right: 12,
    top: 30,
    opacity: 0.9,
  },
  headerRibbon: {
    position: 'absolute',
    width: 320,
    height: 110,
    borderRadius: 100,
    backgroundColor: '#E9F9FF',
    right: -40,
    bottom: -16,
    transform: [{ rotate: '-8deg' }],
  },
  titleContainer: {
    gap: 6,
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF88',
    borderWidth: 1,
    borderColor: '#FFFFFFA6',
    padding: 14,
  },
  brandTitle: {
    fontSize: 36,
    lineHeight: 36,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    opacity: 0.75,
  },
  featureButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 2,
    gap: 4,
  },
  featureButtonSub: {
    color: '#E0F2FE',
    opacity: 0.95,
    fontWeight: '700',
    fontSize: 13,
  },
  searchCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
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
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#00000010',
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
    borderRadius: 12,
    backgroundColor: '#00000010',
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
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
    borderRadius: 8,
    backgroundColor: '#00000055',
  },
  emptyCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#00000010',
  },
  muted: {
    opacity: 0.8,
    marginTop: 6,
  },
});

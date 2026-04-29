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
      headerBackgroundColor={{ light: '#E8F6F9', dark: '#123033' }}
      headerImage={<Image source={require('@/assets/images/partial-react-logo.png')} style={styles.headerImage} />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">UniLease</ThemedText>
        <ThemedText style={styles.subtitle}>Browse items near campus</ThemedText>
        <TouchableOpacity
          style={[styles.featureButton, { backgroundColor: buttonBg }]}
          onPress={() => router.push('/consignment-rental')}
          activeOpacity={0.95}
        >
          <ThemedText style={{ color: '#fff', fontWeight: '900' }}>Consignment & Rental</ThemedText>
          <ThemedText style={styles.featureButtonSub}>List or rent in a guided flow</ThemedText>
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
  headerImage: {
    height: 160,
    width: 260,
    bottom: 0,
    left: 0,
    position: 'absolute',
    opacity: 0.2,
  },
  titleContainer: {
    gap: 8,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.85,
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

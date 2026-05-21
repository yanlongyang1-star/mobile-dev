import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/unilease/AppHeader';
import { ItemArtwork } from '@/components/unilease/ItemArtwork';
import { Brand, Radius } from '@/constants/theme';
import { useUniLease } from '@/contexts/UniLeaseContext';
import type { UniLeaseCategory } from '@/data/mock-unilease';
import { useThemeColors } from '@/hooks/use-theme-colors';

type FilterKey = 'All' | 'Tech' | 'Books' | 'Dorm' | 'Mobility';

const FILTERS: {
  key: FilterKey;
  label: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  categories: UniLeaseCategory[];
}[] = [
  { key: 'All', label: 'All', icon: 'grid-view', categories: [] },
  { key: 'Tech', label: 'Tech', icon: 'devices', categories: ['Laptops', 'Tablets', 'Calculators'] },
  { key: 'Books', label: 'Books', icon: 'menu-book', categories: ['Textbooks'] },
  { key: 'Dorm', label: 'Dorm', icon: 'weekend', categories: ['Audio'] },
  { key: 'Mobility', label: 'Mobility', icon: 'photo-camera', categories: ['Cameras'] },
];

export default function BrowseScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { items } = useUniLease();

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filter = FILTERS.find((item) => item.key === activeFilter);
    return items.filter((it) => {
      const matchesQuery = !q || `${it.title} ${it.description} ${it.location}`.toLowerCase().includes(q);
      const matchesCategory =
        activeFilter === 'All' || !filter ? true : it.categories.some((cat) => filter.categories.includes(cat));
      return matchesQuery && matchesCategory;
    });
  }, [activeFilter, items, query]);

  const featured = filtered[0] ?? items[0];
  const secondaryItems = filtered.filter((item) => item.id !== featured?.id);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          subtitle={Brand.tagline}
          leftLabel="Open campus tools"
          onLeftPress={() => router.push('/campus')}
          onRightPress={() => router.push('/profile')}
        />

        <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="search" size={18} color={colors.icon} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search for anything..."
            placeholderTextColor={colors.muted}
            style={[styles.searchInput, { color: colors.text }]}
            autoCapitalize="none"
          />
        </View>

        <View style={[styles.hero, { backgroundColor: colors.hero }]}>
          <Text style={[styles.heroTitle, { color: colors.heroText }]}>Earn from your unused gear.</Text>
          <Text style={[styles.heroCopy, { color: colors.heroText }]}>
            Turn your textbooks, cameras, and dorm essentials into passive income. Rent safely to verified students on
            campus.
          </Text>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/create-listing')}
            style={[styles.heroButton, { backgroundColor: colors.primary }]}
          >
            <MaterialIcons name="add-circle-outline" size={16} color={colors.onPrimary} />
            <Text style={[styles.heroButtonText, { color: colors.onPrimary }]}>List Your Item Now</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Explore Categories</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroller}
        >
          {FILTERS.map((filter) => {
            const active = filter.key === activeFilter;
            return (
              <TouchableOpacity
                key={filter.key}
                activeOpacity={0.86}
                onPress={() => setActiveFilter(filter.key)}
                style={styles.categoryItem}
              >
                <View style={[styles.categoryIcon, { backgroundColor: active ? colors.hero : colors.surface }]}>
                  <MaterialIcons name={filter.icon} size={24} color={colors.primary} />
                </View>
                <Text style={[styles.categoryLabel, { color: active ? colors.primary : colors.secondary }]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Trending on Campus</Text>
          <TouchableOpacity activeOpacity={0.8} onPress={() => setActiveFilter('All')}>
            <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>

        {featured ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push({ pathname: '/item/[id]', params: { id: featured.id } })}
            style={[styles.featuredCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View>
              <ItemArtwork item={featured} height={168} />
              {featured.badge ? (
                <View style={[styles.badge, { backgroundColor: colors.card }]}>
                  <Text style={[styles.badgeText, { color: colors.primary }]}>{featured.badge}</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.featuredBody}>
              <View style={styles.itemTitleRow}>
                <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                  {featured.title}
                </Text>
                <Text style={[styles.price, { color: colors.primary }]}>${featured.pricePerDay}/day</Text>
              </View>
              <Text style={[styles.meta, { color: colors.secondary }]} numberOfLines={1}>
                {featured.location} · Trust {featured.owner.trustScore.toFixed(1)}
              </Text>
              <Text style={[styles.itemCopy, { color: colors.secondary }]} numberOfLines={2}>
                {featured.description}
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push('/campus')}
          style={[styles.readinessCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={[styles.readinessIcon, { backgroundColor: colors.hero }]}>
            <MaterialIcons name="my-location" size={23} color={colors.primary} />
          </View>
          <View style={styles.readinessText}>
            <Text style={[styles.readinessTitle, { color: colors.text }]}>Campus readiness</Text>
            <Text style={[styles.meta, { color: colors.secondary }]} numberOfLines={1}>
              GPS, battery, sensors, notifications and background tasks
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.icon} />
        </TouchableOpacity>

        <View style={styles.compactList}>
          {secondaryItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.86}
              onPress={() => router.push({ pathname: '/item/[id]', params: { id: item.id } })}
              style={[styles.compactCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <ItemArtwork item={item} height={72} style={styles.compactImage} />
              <View style={styles.compactBody}>
                <Text style={[styles.compactTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.meta, { color: colors.secondary }]} numberOfLines={1}>
                  {item.location} · {item.condition}
                </Text>
              </View>
              <Text style={[styles.compactPrice, { color: colors.primary }]}>${item.pricePerDay}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {filtered.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>No results</Text>
            <Text style={[styles.meta, { color: colors.secondary }]}>Try another keyword or category.</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    gap: 16,
    padding: 20,
    paddingBottom: 32,
  },
  searchBar: {
    alignItems: 'center',
    borderRadius: Radius.md,
    flexDirection: 'row',
    gap: 10,
    height: 48,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    height: '100%',
  },
  hero: {
    borderRadius: Radius.lg,
    gap: 10,
    padding: 18,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 27,
    maxWidth: 260,
  },
  heroCopy: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    opacity: 0.82,
  },
  heroButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: Radius.md,
    flexDirection: 'row',
    gap: 7,
    marginTop: 2,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  heroButtonText: {
    fontSize: 12,
    fontWeight: '900',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '900',
  },
  viewAll: {
    fontSize: 12,
    fontWeight: '900',
  },
  categoryScroller: {
    gap: 19,
    paddingRight: 4,
  },
  categoryItem: {
    alignItems: 'center',
    gap: 7,
    width: 58,
  },
  categoryIcon: {
    alignItems: 'center',
    borderRadius: 999,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  featuredCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  badge: {
    borderRadius: Radius.sm,
    left: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
    position: 'absolute',
    top: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
  },
  featuredBody: {
    gap: 5,
    padding: 14,
  },
  itemTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  itemTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '900',
  },
  price: {
    fontSize: 14,
    fontWeight: '900',
  },
  meta: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  itemCopy: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  readinessCard: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  readinessIcon: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  readinessText: {
    flex: 1,
  },
  readinessTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  compactList: {
    gap: 10,
  },
  compactCard: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 10,
  },
  compactImage: {
    width: 72,
  },
  compactBody: {
    flex: 1,
    gap: 3,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  compactPrice: {
    fontSize: 14,
    fontWeight: '900',
  },
  emptyCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 4,
    padding: 16,
  },
});

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/unilease/AppHeader';
import { ItemArtwork } from '@/components/unilease/ItemArtwork';
import { Radius } from '@/constants/theme';
import { useUniLease } from '@/contexts/UniLeaseContext';
import { useThemeColors } from '@/hooks/use-theme-colors';

export default function ItemDetailsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const params = useLocalSearchParams();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = String(idParam ?? '');

  const { items, selectItemForBooking } = useUniLease();
  const item = useMemo(() => items.find((it) => it.id === id) ?? null, [id, items]);

  const onRequest = () => {
    if (!item) return;
    selectItemForBooking(item.id);
    router.push('/booking-request');
  };

  if (!item) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.notFound}>
          <Text style={[styles.title, { color: colors.text }]}>Item not found</Text>
          <Text style={[styles.bodyText, { color: colors.secondary }]}>Return to Home and try another item.</Text>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => router.replace('/')}>
            <Text style={[styles.actionText, { color: colors.onPrimary }]}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Item"
          subtitle="Campus listing"
          leftIcon="arrow-back"
          leftLabel="Go back"
          onLeftPress={() => router.back()}
          onRightPress={() => router.push('/profile')}
        />

        <ItemArtwork item={item} height={238} />

        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.meta, { color: colors.secondary }]}>
              {item.location} · {item.condition}
            </Text>
          </View>
          <View style={[styles.pricePill, { backgroundColor: colors.hero }]}>
            <Text style={[styles.price, { color: colors.primary }]}>${item.pricePerDay}/day</Text>
          </View>
        </View>

        <View style={[styles.ownerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.ownerIcon, { backgroundColor: colors.hero }]}>
            <MaterialIcons name="verified-user" size={23} color={colors.primary} />
          </View>
          <View style={styles.ownerBody}>
            <Text style={[styles.ownerName, { color: colors.text }]}>{item.owner.name}</Text>
            <Text style={[styles.meta, { color: colors.secondary }]}>
              Trust score {item.owner.trustScore.toFixed(1)} / 5
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
          <Text style={[styles.bodyText, { color: colors.secondary }]}>{item.description}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.secondary }]}>Categories</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{item.categories.join(', ')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.secondary }]}>Handover</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{item.location}</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={onRequest}>
          <Text style={[styles.actionText, { color: colors.onPrimary }]}>Request Booking</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    gap: 14,
    padding: 20,
    paddingBottom: 32,
  },
  notFound: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  titleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 31,
  },
  meta: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  pricePill: {
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  price: {
    fontSize: 13,
    fontWeight: '900',
  },
  ownerCard: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  ownerIcon: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  ownerBody: {
    flex: 1,
  },
  ownerName: {
    fontSize: 15,
    fontWeight: '900',
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '900',
  },
  detailValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'right',
  },
  actionBtn: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    height: 52,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '900',
  },
});

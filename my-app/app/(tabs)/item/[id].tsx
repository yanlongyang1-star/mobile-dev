import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useUniLease } from '@/contexts/UniLeaseContext';

export default function ItemDetailsScreen() {
  const router = useRouter();
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
      <View style={styles.notFound}>
        <ThemedText type="title">Item not found</ThemedText>
        <ThemedText style={styles.muted}>Return to Browse and try another item.</ThemedText>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#0EA5E9' }]} onPress={() => router.replace('/')}>
          <ThemedText style={{ color: '#fff', fontWeight: '800' }}>Go to Browse</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E8F6F9', dark: '#123033' }}
      headerImage={<Image source={require('@/assets/images/partial-react-logo.png')} style={styles.headerImage} />}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.heroRow}>
          <Image source={require('@/assets/images/react-logo.png')} style={styles.itemImage} />
          <ThemedView style={{ flex: 1 }}>
            <ThemedText type="title" style={{ marginBottom: 6 }}>
              {item.title}
            </ThemedText>
            <ThemedText>
              ${item.pricePerDay}/day · {item.location}
            </ThemedText>
            <ThemedText>Owner trust: {item.owner.trustScore.toFixed(1)} / 5</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Description
          </ThemedText>
          <ThemedText style={styles.bodyText}>{item.description}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Details
          </ThemedText>
          <View style={styles.detailRows}>
            <ThemedText>Condition: {item.condition}</ThemedText>
            <ThemedText>Categories: {item.categories.join(', ')}</ThemedText>
            <ThemedText>Handover zone: {item.location}</ThemedText>
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Quick note
          </ThemedText>
          <ThemedText style={styles.bodyText}>
            This is a demo flow. You can request a booking, simulate approval/return, and leave a rating.
          </ThemedText>
        </ThemedView>

        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#0A84FF' }]} onPress={onRequest}>
          <ThemedText style={{ color: '#fff', fontWeight: '900' }}>Request Booking</ThemedText>
        </TouchableOpacity>
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
  content: {
    padding: 16,
    gap: 14,
  },
  heroRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  itemImage: {
    width: 86,
    height: 86,
    borderRadius: 16,
  },
  section: {
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#00000010',
  },
  sectionTitle: {
    marginBottom: 8,
  },
  bodyText: {
    opacity: 0.9,
  },
  detailRows: {
    gap: 6,
  },
  actionBtn: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFound: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  muted: {
    opacity: 0.8,
    textAlign: 'center',
  },
});

import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useUniLease } from '@/contexts/UniLeaseContext';
import { CAMPUS_HANDOVER_ZONES } from '@/data/mock-unilease';

function ymdToday() {
  const dt = new Date();
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(ymd: string, days: number) {
  const [y, m, d] = ymd.split('-').map((v) => Number(v));
  const base = new Date(y, m - 1, d);
  base.setDate(base.getDate() + days);
  const yy = base.getFullYear();
  const mm = String(base.getMonth() + 1).padStart(2, '0');
  const dd = String(base.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function parseYmd(ymd: string) {
  const [y, m, d] = ymd.split('-').map((v) => Number(v));
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

function daysInclusive(startYmd: string, endYmd: string) {
  const start = parseYmd(startYmd);
  const end = parseYmd(endYmd);
  if (!start || !end) return 1;
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = (end.getTime() - start.getTime()) / msPerDay;
  return Math.max(1, Math.floor(diff) + 1);
}

export default function BookingRequestScreen() {
  const router = useRouter();
  const { selectedItem, requestBooking } = useUniLease();

  const [startDate, setStartDate] = useState(ymdToday());
  const [endDate, setEndDate] = useState(addDays(ymdToday(), 1));
  const [meetupLocation, setMeetupLocation] = useState<string>(CAMPUS_HANDOVER_ZONES[0]);
  const [meetupTime, setMeetupTime] = useState('12:00');
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Cash' | 'Transfer'>('Card');
  const [error, setError] = useState('');

  const preview = useMemo(() => {
    if (!selectedItem) return null;
    const days = daysInclusive(startDate, endDate);
    const bookingFee = selectedItem.pricePerDay * days;
    const deposit = Math.round(bookingFee * 0.33 * 100) / 100;
    return { days, bookingFee, deposit };
  }, [endDate, selectedItem, startDate]);

  const onSubmit = async () => {
    setError('');
    if (!selectedItem) {
      setError('No selected item. Please go back and choose an item.');
      return;
    }

    if (!startDate || !endDate) {
      setError('Please enter start/end dates.');
      return;
    }

    const ok = await requestBooking({
      startDate,
      endDate,
      meetupLocation,
      meetupTime,
      paymentMethod,
    });

    if (!ok) {
      setError('Failed to create booking. Please try again.');
      return;
    }

    router.replace('/explore');
  };

  if (!selectedItem) {
    return (
      <View style={styles.notSelected}>
        <ThemedText type="title">Select an item first</ThemedText>
        <ThemedText style={styles.muted}>Go to Browse, open an item, and request a booking.</ThemedText>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#0EA5E9' }]} onPress={() => router.replace('/')}>
          <ThemedText style={{ color: '#fff', fontWeight: '800' }}>Go to Browse</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  const paymentOptions: typeof paymentMethod[] = ['Card', 'Cash', 'Transfer'];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E8F6F9', dark: '#123033' }}
      headerImage={<Image source={require('@/assets/images/partial-react-logo.png')} style={styles.headerImage} />}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.hero}>
          <Image source={require('@/assets/images/react-logo.png')} style={styles.itemImage} />
          <View style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold">{selectedItem.title}</ThemedText>
            <ThemedText>${selectedItem.pricePerDay}/day · {selectedItem.location}</ThemedText>
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Booking dates
          </ThemedText>

          <View style={styles.row2}>
            <View style={styles.field}>
              <ThemedText>Start (YYYY-MM-DD)</ThemedText>
              <TextInput value={startDate} onChangeText={setStartDate} style={styles.input} />
            </View>
            <View style={styles.field}>
              <ThemedText>End (YYYY-MM-DD)</ThemedText>
              <TextInput value={endDate} onChangeText={setEndDate} style={styles.input} />
            </View>
          </View>

          <ThemedText style={styles.hint}>
            Rental days: {preview?.days ?? 1} · Estimated deposit and fee shown below.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Handover meetup
          </ThemedText>

          <ThemedText style={styles.smallLabel}>Location</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {CAMPUS_HANDOVER_ZONES.map((z) => {
              const active = z === meetupLocation;
              return (
                <TouchableOpacity
                  key={z}
                  onPress={() => setMeetupLocation(z)}
                  style={[styles.chip, active ? { backgroundColor: '#0EA5E9' } : { backgroundColor: '#00000010' }]}
                >
                  <ThemedText style={{ color: active ? '#fff' : '#94A3B8', fontWeight: '900' }}>{z}</ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={{ height: 12 }} />

          <ThemedText style={styles.smallLabel}>Time (HH:MM)</ThemedText>
          <TextInput value={meetupTime} onChangeText={setMeetupTime} style={styles.input} placeholder="12:00" />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Payment summary
          </ThemedText>

          <View style={styles.summaryRow}>
            <ThemedText>Booking fee</ThemedText>
            <ThemedText style={{ fontWeight: '900' }}>${preview?.bookingFee ?? 0}</ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText>Deposit</ThemedText>
            <ThemedText style={{ fontWeight: '900' }}>${preview?.deposit ?? 0}</ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText>Total due</ThemedText>
            <ThemedText style={{ fontWeight: '900' }}>${(preview?.bookingFee ?? 0) + (preview?.deposit ?? 0)}</ThemedText>
          </View>

          <ThemedText style={styles.smallLabel}>Payment method</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {paymentOptions.map((opt) => {
              const active = opt === paymentMethod;
              return (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setPaymentMethod(opt)}
                  style={[styles.chip, active ? { backgroundColor: '#0EA5E9' } : { backgroundColor: '#00000010' }]}
                >
                  <ThemedText style={{ color: active ? '#fff' : '#94A3B8', fontWeight: '900' }}>{opt}</ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </ThemedView>

        {error ? (
          <View style={styles.errorBox}>
            <ThemedText style={{ color: '#FF3B30', fontWeight: '800' }}>{error}</ThemedText>
          </View>
        ) : null}

        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#0A84FF' }]} onPress={onSubmit}>
          <ThemedText style={{ color: '#fff', fontWeight: '900' }}>Send booking request</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryLink} onPress={() => router.back()} activeOpacity={0.9}>
          <ThemedText style={{ fontWeight: '800' }}>Back</ThemedText>
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
  notSelected: {
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
  hero: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#00000010',
  },
  itemImage: {
    width: 76,
    height: 76,
    borderRadius: 14,
  },
  section: {
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#00000010',
  },
  sectionTitle: {
    marginBottom: 10,
  },
  row2: {
    flexDirection: 'row',
    gap: 10,
  },
  field: {
    flex: 1,
  },
  input: {
    marginTop: 6,
    backgroundColor: '#00000005',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00000010',
    paddingHorizontal: 10,
    height: 44,
  },
  hint: {
    marginTop: 10,
    opacity: 0.85,
  },
  smallLabel: {
    marginBottom: 6,
    fontWeight: '800',
    opacity: 0.9,
  },
  chipRow: {
    gap: 10,
    paddingVertical: 4,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 0,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  errorBox: {
    backgroundColor: '#FF3B3020',
    borderRadius: 12,
    padding: 12,
  },
  actionBtn: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  secondaryLink: {
    alignItems: 'center',
    marginTop: 4,
  },
});

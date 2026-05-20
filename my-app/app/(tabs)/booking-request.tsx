import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { GeometricHeader } from '@/components/ui/geometric-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useUniLease } from '@/contexts/UniLeaseContext';
import { CAMPUS_HANDOVER_ZONES } from '@/data/mock-unilease';
import { Radius } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { addDays, ymdToday } from '@/utils/date';
import { calculateBookingQuote, validateBookingDates } from '@/utils/booking';

export default function BookingRequestScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { selectedItem, requestBooking } = useUniLease();

  const [startDate, setStartDate] = useState(ymdToday());
  const [endDate, setEndDate] = useState(addDays(ymdToday(), 1));
  const [meetupLocation, setMeetupLocation] = useState<string>(CAMPUS_HANDOVER_ZONES[0]);
  const [meetupTime, setMeetupTime] = useState('12:00');
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Cash' | 'Transfer'>('Card');
  const [error, setError] = useState('');

  const preview = useMemo(() => {
    if (!selectedItem) return null;
    return calculateBookingQuote(selectedItem, startDate, endDate);
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

    const dateValidation = validateBookingDates(startDate, endDate);
    if (!dateValidation.ok) {
      setError(dateValidation.reason ?? 'Please check your booking dates.');
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
      <View style={[styles.notSelected, { backgroundColor: colors.background }]}>
        <ThemedText type="title">Select an item first</ThemedText>
        <ThemedText style={styles.muted}>Go to Browse, open an item, and request a booking.</ThemedText>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => router.replace('/')}>
          <ThemedText style={{ color: colors.onPrimary, fontWeight: '800' }}>Go to Browse</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  const paymentOptions: typeof paymentMethod[] = ['Card', 'Cash', 'Transfer'];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: colors.gradientBottom, dark: colors.gradientBottom }}
      headerImage={<GeometricHeader />}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Image source={require('@/assets/images/react-logo.png')} style={styles.itemImage} />
          <View style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold">{selectedItem.title}</ThemedText>
            <ThemedText>${selectedItem.pricePerDay}/day · {selectedItem.location}</ThemedText>
          </View>
        </ThemedView>

        <ThemedView style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Booking dates
          </ThemedText>

          <View style={styles.row2}>
            <View style={styles.field}>
              <ThemedText>Start (YYYY-MM-DD)</ThemedText>
              <TextInput value={startDate} onChangeText={setStartDate} style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]} />
            </View>
            <View style={styles.field}>
              <ThemedText>End (YYYY-MM-DD)</ThemedText>
              <TextInput value={endDate} onChangeText={setEndDate} style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]} />
            </View>
          </View>

          <ThemedText style={styles.hint}>
            Rental days: {preview?.days ?? 1} · Estimated deposit and fee shown below.
          </ThemedText>
        </ThemedView>

        <ThemedView style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
                  style={[
                    styles.chip,
                    { borderColor: colors.border },
                    active ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: colors.card },
                  ]}
                >
                  <ThemedText style={{ color: active ? colors.onPrimary : colors.muted, fontWeight: '900' }}>{z}</ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={{ height: 12 }} />

          <ThemedText style={styles.smallLabel}>Time (HH:MM)</ThemedText>
          <TextInput value={meetupTime} onChangeText={setMeetupTime} style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]} placeholder="12:00" />
        </ThemedView>

        <ThemedView style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
                  style={[
                    styles.chip,
                    { borderColor: colors.border },
                    active ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: colors.card },
                  ]}
                >
                  <ThemedText style={{ color: active ? colors.onPrimary : colors.muted, fontWeight: '900' }}>{opt}</ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </ThemedView>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: colors.errorSurface, borderColor: colors.errorBorder }]}>
            <ThemedText style={{ color: colors.error, fontWeight: '800' }}>{error}</ThemedText>
          </View>
        ) : null}

        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={onSubmit}>
          <ThemedText style={{ color: colors.onPrimary, fontWeight: '900' }}>Send booking request</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryLink} onPress={() => router.back()} activeOpacity={0.9}>
          <ThemedText style={{ fontWeight: '800' }}>Back</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  itemImage: {
    width: 76,
    height: 76,
    borderRadius: Radius.sm,
  },
  section: {
    borderRadius: Radius.md,
    padding: 14,
    borderWidth: 1,
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
    borderRadius: Radius.md,
    borderWidth: 1,
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
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  errorBox: {
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
  },
  actionBtn: {
    height: 52,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  secondaryLink: {
    alignItems: 'center',
    marginTop: 4,
  },
});

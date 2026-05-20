import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/unilease/AppHeader';
import { ItemArtwork } from '@/components/unilease/ItemArtwork';
import { Radius } from '@/constants/theme';
import { useUniLease } from '@/contexts/UniLeaseContext';
import { CAMPUS_HANDOVER_ZONES } from '@/data/mock-unilease';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { calculateBookingQuote, validateBookingDates } from '@/utils/booking';
import { addDays, ymdToday } from '@/utils/date';

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
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.notSelected}>
          <Text style={[styles.title, { color: colors.text }]}>Select an item first</Text>
          <Text style={[styles.bodyText, { color: colors.secondary }]}>Open an item from Home and request a booking.</Text>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => router.replace('/')}>
            <Text style={[styles.actionText, { color: colors.onPrimary }]}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const paymentOptions: typeof paymentMethod[] = ['Card', 'Cash', 'Transfer'];
  const inputStyle = [styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Booking"
          subtitle="Request handover"
          leftIcon="arrow-back"
          leftLabel="Go back"
          onLeftPress={() => router.back()}
          onRightPress={() => router.push('/profile')}
        />

        <View style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ItemArtwork item={selectedItem} height={88} style={styles.itemImage} />
          <View style={styles.itemInfo}>
            <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
              {selectedItem.title}
            </Text>
            <Text style={[styles.meta, { color: colors.secondary }]} numberOfLines={1}>
              ${selectedItem.pricePerDay}/day · {selectedItem.location}
            </Text>
            <Text style={[styles.meta, { color: colors.secondary }]} numberOfLines={1}>
              Owner trust {selectedItem.owner.trustScore.toFixed(1)}
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Booking dates</Text>
          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={[styles.label, { color: colors.secondary }]}>Start</Text>
              <TextInput value={startDate} onChangeText={setStartDate} style={inputStyle} placeholder="YYYY-MM-DD" />
            </View>
            <View style={styles.half}>
              <Text style={[styles.label, { color: colors.secondary }]}>End</Text>
              <TextInput value={endDate} onChangeText={setEndDate} style={inputStyle} placeholder="YYYY-MM-DD" />
            </View>
          </View>
          <Text style={[styles.meta, { color: colors.secondary }]}>Rental days: {preview?.days ?? 1}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Handover meetup</Text>
          <Text style={[styles.label, { color: colors.secondary }]}>Location</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {CAMPUS_HANDOVER_ZONES.map((zone) => {
              const active = zone === meetupLocation;
              return (
                <TouchableOpacity
                  key={zone}
                  activeOpacity={0.86}
                  onPress={() => setMeetupLocation(zone)}
                  style={[
                    styles.chip,
                    { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primary : colors.card },
                  ]}
                >
                  <Text style={[styles.chipText, { color: active ? colors.onPrimary : colors.secondary }]}>{zone}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={[styles.label, { color: colors.secondary, marginTop: 12 }]}>Time</Text>
          <TextInput value={meetupTime} onChangeText={setMeetupTime} style={inputStyle} placeholder="12:00" />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.secondary }]}>Booking fee</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>${preview?.bookingFee ?? 0}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.secondary }]}>Deposit</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>${preview?.deposit ?? 0}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.secondary }]}>Total due</Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>${preview?.totalDue ?? 0}</Text>
          </View>

          <Text style={[styles.label, { color: colors.secondary, marginTop: 8 }]}>Payment method</Text>
          <View style={styles.wrapRow}>
            {paymentOptions.map((option) => {
              const active = option === paymentMethod;
              return (
                <TouchableOpacity
                  key={option}
                  activeOpacity={0.86}
                  onPress={() => setPaymentMethod(option)}
                  style={[
                    styles.chip,
                    { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primary : colors.card },
                  ]}
                >
                  <Text style={[styles.chipText, { color: active ? colors.onPrimary : colors.secondary }]}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: colors.errorSurface, borderColor: colors.errorBorder }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={onSubmit}>
          <MaterialIcons name="send" size={17} color={colors.onPrimary} />
          <Text style={[styles.actionText, { color: colors.onPrimary }]}>Send booking request</Text>
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
  notSelected: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
  },
  itemCard: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  itemImage: {
    width: 88,
  },
  itemInfo: {
    flex: 1,
    gap: 3,
  },
  itemTitle: {
    fontSize: 16,
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
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  half: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
    marginBottom: 7,
    textTransform: 'uppercase',
  },
  input: {
    borderRadius: Radius.md,
    borderWidth: 1,
    fontSize: 13,
    fontWeight: '800',
    height: 46,
    paddingHorizontal: 12,
  },
  meta: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  bodyText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    textAlign: 'center',
  },
  chipRow: {
    gap: 8,
    paddingRight: 4,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '900',
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '900',
  },
  errorBox: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 12,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '900',
  },
  actionBtn: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    flexDirection: 'row',
    gap: 8,
    height: 52,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '900',
  },
});

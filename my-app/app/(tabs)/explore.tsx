import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/unilease/AppHeader';
import { ItemArtwork } from '@/components/unilease/ItemArtwork';
import { Radius } from '@/constants/theme';
import { useUniLease, type UniLeaseBooking, type UniLeaseBookingStatus } from '@/contexts/UniLeaseContext';
import { useThemeColors } from '@/hooks/use-theme-colors';

function statusLabel(status: UniLeaseBookingStatus) {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'approved':
      return 'Approved';
    case 'picked_up':
      return 'Picked up';
    case 'returned':
      return 'Returned';
  }
}

function nextStatus(status: UniLeaseBookingStatus): UniLeaseBookingStatus | null {
  switch (status) {
    case 'pending':
      return 'approved';
    case 'approved':
      return 'picked_up';
    case 'picked_up':
      return 'returned';
    case 'returned':
      return null;
  }
}

function nextAction(status: UniLeaseBookingStatus) {
  switch (status) {
    case 'pending':
      return 'Approve';
    case 'approved':
      return 'Mark picked up';
    case 'picked_up':
      return 'Mark returned';
    case 'returned':
      return '';
  }
}

function BookingCard({
  booking,
  itemTitle,
  item,
  onAdvance,
  onRate,
}: {
  booking: UniLeaseBooking;
  itemTitle: string;
  item: Parameters<typeof ItemArtwork>[0]['item'];
  onAdvance: (next: UniLeaseBookingStatus) => void;
  onRate: (score: number, comment: string) => void;
}) {
  const colors = useThemeColors();
  const [score, setScore] = useState(booking.rating?.score ?? 5);
  const [comment, setComment] = useState(booking.rating?.comment ?? '');
  const next = nextStatus(booking.status);

  return (
    <View style={[styles.bookingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.bookingTop}>
        <ItemArtwork item={item} height={76} style={styles.bookingImage} />
        <View style={styles.bookingInfo}>
          <Text style={[styles.bookingTitle, { color: colors.text }]} numberOfLines={1}>
            {itemTitle}
          </Text>
          <Text style={[styles.meta, { color: colors.secondary }]} numberOfLines={1}>
            {booking.startDate} to {booking.endDate}
          </Text>
          <Text style={[styles.meta, { color: colors.secondary }]} numberOfLines={1}>
            {booking.meetupLocation} · {booking.meetupTime}
          </Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: colors.hero }]}>
          <Text style={[styles.statusText, { color: colors.primary }]}>{statusLabel(booking.status)}</Text>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <View style={[styles.summaryBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.summaryLabel, { color: colors.secondary }]}>Fee</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>${booking.bookingFee}</Text>
        </View>
        <View style={[styles.summaryBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.summaryLabel, { color: colors.secondary }]}>Deposit</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>${booking.deposit}</Text>
        </View>
        <View style={[styles.summaryBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.summaryLabel, { color: colors.secondary }]}>Pay</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{booking.paymentMethod}</Text>
        </View>
      </View>

      {next ? (
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={() => onAdvance(next)}
        >
          <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>{nextAction(booking.status)}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.ratingBlock}>
          <Text style={[styles.ratingTitle, { color: colors.text }]}>Rating</Text>
          <View style={styles.scoreRow}>
            {[1, 2, 3, 4, 5].map((value) => {
              const active = value <= score;
              return (
                <TouchableOpacity
                  key={value}
                  activeOpacity={0.85}
                  onPress={() => setScore(value)}
                  style={[styles.scoreButton, { backgroundColor: active ? colors.primary : colors.surface }]}
                >
                  <Text style={{ color: active ? colors.onPrimary : colors.secondary, fontWeight: '900' }}>
                    {value}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Short comment"
            placeholderTextColor={colors.muted}
            style={[styles.commentInput, { backgroundColor: colors.surface, color: colors.text }]}
          />
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => onRate(score, comment)}
          >
            <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>
              {booking.rating ? 'Update rating' : 'Submit rating'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function BookingsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { myBookings, items, advanceBookingStatus, leaveRating } = useUniLease();

  const itemById = useMemo(() => {
    const map = new Map(items.map((item) => [item.id, item]));
    return map;
  }, [items]);

  const activeCount = myBookings.filter((booking) => booking.status !== 'returned').length;
  const returnedCount = myBookings.length - activeCount;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Explore"
          subtitle="Bookings and handovers"
          leftLabel="Open campus tools"
          onLeftPress={() => router.push('/campus')}
          onRightPress={() => router.push('/profile')}
        />

        <View style={[styles.hero, { backgroundColor: colors.hero }]}>
          <View>
            <Text style={[styles.heroEyebrow, { color: colors.primary }]}>Borrower flow</Text>
            <Text style={[styles.heroTitle, { color: colors.heroText }]}>Track every rental step.</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/')}
            style={[styles.heroAction, { backgroundColor: colors.primary }]}
          >
            <MaterialIcons name="search" size={16} color={colors.onPrimary} />
            <Text style={[styles.heroActionText, { color: colors.onPrimary }]}>Browse</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{activeCount}</Text>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>Active</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{returnedCount}</Text>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>Returned</Text>
          </View>
        </View>

        {myBookings.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.bookingTitle, { color: colors.text }]}>No bookings yet</Text>
            <Text style={[styles.meta, { color: colors.secondary }]}>Open a campus item and send a booking request.</Text>
          </View>
        ) : null}

        {myBookings.map((booking) => {
          const item = itemById.get(booking.itemId) ?? null;
          return (
            <BookingCard
              key={booking.id}
              booking={booking}
              item={item}
              itemTitle={item?.title ?? 'Unknown item'}
              onAdvance={(next) => advanceBookingStatus(booking.id, next)}
              onRate={(score, comment) => leaveRating(booking.id, score, comment)}
            />
          );
        })}
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
  hero: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    padding: 18,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 21,
    fontWeight: '900',
    lineHeight: 26,
    marginTop: 4,
  },
  heroAction: {
    alignItems: 'center',
    borderRadius: Radius.md,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  heroActionText: {
    fontSize: 12,
    fontWeight: '900',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    flex: 1,
    padding: 14,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  bookingCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  bookingTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  bookingImage: {
    width: 76,
  },
  bookingInfo: {
    flex: 1,
    gap: 2,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  meta: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryBox: {
    borderRadius: Radius.md,
    flex: 1,
    padding: 10,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '900',
    marginTop: 3,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: Radius.md,
    height: 44,
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '900',
  },
  ratingBlock: {
    gap: 10,
  },
  ratingTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scoreButton: {
    alignItems: 'center',
    borderRadius: Radius.md,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  commentInput: {
    borderRadius: Radius.md,
    fontSize: 13,
    fontWeight: '700',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  emptyCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 4,
    padding: 16,
  },
});

import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { GeometricHeader } from '@/components/ui/geometric-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useUniLease } from '@/contexts/UniLeaseContext';
import { Radius } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { TextInput } from 'react-native-paper';

function statusLabel(status: string) {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'approved':
      return 'Approved';
    case 'picked_up':
      return 'Picked up';
    case 'returned':
      return 'Returned';
    default:
      return status;
  }
}

function statusColor(status: string, colors: ReturnType<typeof useThemeColors>) {
  switch (status) {
    case 'pending':
      return colors.muted;
    case 'approved':
      return colors.accent;
    case 'picked_up':
      return colors.text;
    case 'returned':
      return colors.secondary;
    default:
      return colors.muted;
  }
}

function BookingCard({
  booking,
  itemTitle,
  onAdvance,
  onRate,
  colors,
}: {
  booking: any;
  itemTitle: string;
  onAdvance: (nextStatus: 'approved' | 'picked_up' | 'returned') => void;
  onRate: (score: number, comment: string) => void;
  colors: ReturnType<typeof useThemeColors>;
}) {
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState(booking.rating?.comment ?? '');

  const badgeColor = statusColor(booking.status, colors);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.cardTop}>
        <Image source={require('@/assets/images/react-logo.png')} style={styles.cardImage} />
        <View style={{ flex: 1 }}>
          <ThemedText type="defaultSemiBold">{itemTitle}</ThemedText>
          <ThemedText>
            {booking.startDate} → {booking.endDate}
          </ThemedText>
        </View>
        <View style={[styles.badge, { borderColor: badgeColor, backgroundColor: `${badgeColor}18` }]}>
          <ThemedText style={{ fontWeight: '800', color: badgeColor }}>{statusLabel(booking.status)}</ThemedText>
        </View>
      </View>

      <View style={styles.metaRow}>
        <ThemedText>Meetup: {booking.meetupLocation}</ThemedText>
        <ThemedText>Time: {booking.meetupTime}</ThemedText>
      </View>

      <View style={styles.payRow}>
        <ThemedText>Fee: ${booking.bookingFee}</ThemedText>
        <ThemedText>Deposit: ${booking.deposit}</ThemedText>
      </View>

      {booking.status === 'pending' ? (
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => onAdvance('approved')}>
          <ThemedText style={{ color: colors.onPrimary, fontWeight: '800' }}>Approve</ThemedText>
        </TouchableOpacity>
      ) : null}

      {booking.status === 'approved' ? (
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => onAdvance('picked_up')}>
          <ThemedText style={{ color: colors.onPrimary, fontWeight: '800' }}>Mark Picked up</ThemedText>
        </TouchableOpacity>
      ) : null}

      {booking.status === 'picked_up' ? (
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => onAdvance('returned')}>
          <ThemedText style={{ color: colors.onPrimary, fontWeight: '800' }}>Mark Returned</ThemedText>
        </TouchableOpacity>
      ) : null}

      {booking.status === 'returned' ? (
        <View style={{ marginTop: 12 }}>
          <ThemedText style={styles.sectionTitle}>Rate this booking</ThemedText>
          {booking.rating ? (
            <ThemedText style={styles.muted}>You rated: {booking.rating.score}/5</ThemedText>
          ) : null}

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => {
              const active = s <= score;
              return (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.starChip,
                    { borderColor: colors.border },
                    active ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: colors.surface },
                  ]}
                  onPress={() => {
                    setScore(s);
                    if (booking.rating) setComment(booking.rating.comment);
                  }}
                >
                  <ThemedText style={{ color: active ? colors.onPrimary : colors.muted, fontWeight: '900' }}>{s}</ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Short comment (optional)"
            placeholderTextColor={colors.muted}
            style={[styles.commentInput, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]}
            multiline
          />

          <TouchableOpacity
            style={[styles.actionBtn, { marginTop: 10, backgroundColor: colors.primary }]}
            onPress={() => onRate(score, comment)}
          >
            <ThemedText style={{ color: colors.onPrimary, fontWeight: '800' }}>{booking.rating ? 'Update rating' : 'Submit rating'}</ThemedText>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

export default function BookingsScreen() {
  const colors = useThemeColors();
  const { myBookings, items, advanceBookingStatus, leaveRating } = useUniLease();

  const itemTitleById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const it of items) map[it.id] = it.title;
    return map;
  }, [items]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: colors.gradientBottom, dark: colors.gradientBottom }}
      headerImage={<GeometricHeader />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">My Bookings</ThemedText>
        <ThemedText style={styles.subtitle}>Track rental status and handover progress</ThemedText>
      </ThemedView>

      <ScrollView style={styles.listContainer}>
        {myBookings.length === 0 ? (
          <ThemedView style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ThemedText type="defaultSemiBold">No bookings yet</ThemedText>
            <ThemedText style={styles.muted}>Go back to Browse and request an item.</ThemedText>
          </ThemedView>
        ) : null}

        {myBookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            itemTitle={itemTitleById[booking.itemId] ?? 'Unknown item'}
            onAdvance={(next) => advanceBookingStatus(booking.id, next)}
            onRate={(s, c) => leaveRating(booking.id, s, c)}
            colors={colors}
          />
        ))}
      </ScrollView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    gap: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.75,
  },
  listContainer: {
    flex: 1,
    marginTop: 10,
  },
  card: {
    marginBottom: 12,
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  cardImage: {
    width: 62,
    height: 62,
    borderRadius: Radius.sm,
  },
  badge: {
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
  },
  metaRow: {
    marginTop: 10,
    gap: 4,
  },
  payRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionBtn: {
    marginTop: 12,
    height: 44,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginTop: 14,
  },
  muted: {
    opacity: 0.8,
    marginTop: 6,
  },
  sectionTitle: {
    fontWeight: '900',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  starChip: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentInput: {
    marginTop: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 14,
  },
});

import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useUniLease } from '@/contexts/UniLeaseContext';
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

function statusColor(status: string) {
  switch (status) {
    case 'pending':
      return '#F59E0B';
    case 'approved':
      return '#3B82F6';
    case 'picked_up':
      return '#8B5CF6';
    case 'returned':
      return '#10B981';
    default:
      return '#94A3B8';
  }
}

function BookingCard({
  booking,
  itemTitle,
  onAdvance,
  onRate,
}: {
  booking: any;
  itemTitle: string;
  onAdvance: (nextStatus: 'approved' | 'picked_up' | 'returned') => void;
  onRate: (score: number, comment: string) => void;
}) {
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState(booking.rating?.comment ?? '');

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Image source={require('@/assets/images/react-logo.png')} style={styles.cardImage} />
        <View style={{ flex: 1 }}>
          <ThemedText type="defaultSemiBold">{itemTitle}</ThemedText>
          <ThemedText>
            {booking.startDate} → {booking.endDate}
          </ThemedText>
        </View>
        <View style={[styles.badge, { backgroundColor: statusColor(booking.status) + '22', borderColor: statusColor(booking.status) }]}>
          <ThemedText style={{ fontWeight: '800', color: statusColor(booking.status) }}>{statusLabel(booking.status)}</ThemedText>
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
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#3B82F6' }]} onPress={() => onAdvance('approved')}>
          <ThemedText style={{ color: '#fff', fontWeight: '800' }}>Approve</ThemedText>
        </TouchableOpacity>
      ) : null}

      {booking.status === 'approved' ? (
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#8B5CF6' }]} onPress={() => onAdvance('picked_up')}>
          <ThemedText style={{ color: '#fff', fontWeight: '800' }}>Mark Picked up</ThemedText>
        </TouchableOpacity>
      ) : null}

      {booking.status === 'picked_up' ? (
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10B981' }]} onPress={() => onAdvance('returned')}>
          <ThemedText style={{ color: '#fff', fontWeight: '800' }}>Mark Returned</ThemedText>
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
                  style={[styles.starChip, active ? { backgroundColor: '#F59E0B' } : { backgroundColor: '#00000010' }]}
                  onPress={() => {
                    setScore(s);
                    if (booking.rating) setComment(booking.rating.comment);
                  }}
                >
                  <ThemedText style={{ color: active ? '#fff' : '#94A3B8', fontWeight: '900' }}>{s}</ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Short comment (optional)"
            placeholderTextColor="#94A3B8"
            style={styles.commentInput}
            multiline
          />

          <TouchableOpacity
            style={[styles.actionBtn, { marginTop: 10, backgroundColor: '#0EA5E9' }]}
            onPress={() => onRate(score, comment)}
          >
            <ThemedText style={{ color: '#fff', fontWeight: '800' }}>{booking.rating ? 'Update rating' : 'Submit rating'}</ThemedText>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

export default function BookingsScreen() {
  const { myBookings, items, advanceBookingStatus, leaveRating } = useUniLease();

  const itemTitleById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const it of items) map[it.id] = it.title;
    return map;
  }, [items]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F5F5F5', dark: '#222' }}
      headerImage={<IconSymbol size={200} color="#999" name="paperplane.fill" style={styles.headerImage} />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">My Bookings</ThemedText>
      </ThemedView>

      <ScrollView style={styles.listContainer}>
        {myBookings.length === 0 ? (
          <ThemedView style={styles.emptyCard}>
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
          />
        ))}
      </ScrollView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -40,
    left: -20,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  listContainer: {
    flex: 1,
    marginTop: 10,
  },
  card: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#00000010',
  },
  cardTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  cardImage: {
    width: 62,
    height: 62,
    borderRadius: 10,
  },
  badge: {
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
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
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#00000010',
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
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentInput: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00000010',
    minHeight: 44,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 14,
    backgroundColor: '#00000005',
  },
});

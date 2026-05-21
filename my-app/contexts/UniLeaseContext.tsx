import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CAMPUS_HANDOVER_ZONES, MOCK_ITEMS, type UniLeaseItem } from '@/data/mock-unilease';
import { useAuth } from '@/contexts/AuthContext';
import { calculateBookingQuote } from '@/utils/booking';
import {
  fetchBookingsFromFirestore,
  fetchListingsFromFirestore,
  saveBookingToFirestore,
  saveListingToFirestore,
  saveRatingToFirestore,
  updateBookingStatusInFirestore,
} from '@/services/firestore';
import { loadBookingsForUser, saveBookingsForUser } from '@/services/localDatabase';

export type UniLeaseBookingStatus = 'pending' | 'approved' | 'picked_up' | 'returned';
export type UniLeasePaymentMethod = 'Card' | 'Cash' | 'Transfer';

export type UniLeaseRating = {
  score: number; // 1..5
  comment: string;
};

export type UniLeaseBooking = {
  id: string;
  itemId: string;
  borrowerUid: string;
  ownerUid: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  meetupLocation: string;
  meetupTime: string; // e.g. "14:30"
  status: UniLeaseBookingStatus;
  bookingFee: number;
  deposit: number;
  paymentMethod: UniLeasePaymentMethod;
  createdAt: number;
  rating?: UniLeaseRating;
};

type UniLeaseContextValue = {
  items: UniLeaseItem[];
  selectedItemId: string | null;
  selectedItem: UniLeaseItem | null;
  selectItemForBooking: (itemId: string) => void;
  addListing: (params: {
    title: string;
    category: UniLeaseItem['categories'][number];
    condition: UniLeaseItem['condition'];
    campusLocation: string;
    pricePerDay: number;
    description?: string;
  }) => Promise<UniLeaseItem | null>;

  bookings: UniLeaseBooking[];
  myBookings: UniLeaseBooking[];

  requestBooking: (params: {
    startDate: string;
    endDate: string;
    meetupLocation: string;
    meetupTime: string;
    paymentMethod: UniLeasePaymentMethod;
  }) => Promise<UniLeaseBooking | null>;

  advanceBookingStatus: (bookingId: string, nextStatus: UniLeaseBookingStatus) => void;
  leaveRating: (bookingId: string, score: number, comment: string) => void;
};

const UniLeaseContext = createContext<UniLeaseContextValue | undefined>(undefined);

function mergeHydratedBookings(localBookings: UniLeaseBooking[], remoteBookings: UniLeaseBooking[]) {
  const merged = new Map<string, UniLeaseBooking>();
  for (const booking of remoteBookings) merged.set(booking.id, booking);
  // Local wins for matching ids so offline status/rating changes survive a restart.
  for (const booking of localBookings) merged.set(booking.id, booking);
  return Array.from(merged.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export function UniLeaseProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const meUid = user?.uid ?? null;

  const [remoteItems, setRemoteItems] = useState<UniLeaseItem[]>([]);
  const items = useMemo(() => {
    const map = new Map<string, UniLeaseItem>();
    for (const item of MOCK_ITEMS) map.set(item.id, item);
    for (const item of remoteItems) map.set(item.id, item);
    return Array.from(map.values());
  }, [remoteItems]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const [bookings, setBookings] = useState<UniLeaseBooking[]>([]);
  const [storageReady, setStorageReady] = useState(false);

  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null;
    return items.find((it) => it.id === selectedItemId) ?? null;
  }, [items, selectedItemId]);

  const myBookings = useMemo(() => {
    if (!meUid) return [];
    return bookings.filter((b) => b.borrowerUid === meUid);
  }, [bookings, meUid]);

  useEffect(() => {
    let active = true;

    async function hydrateBookings() {
      setStorageReady(false);
      if (!meUid) {
        setBookings([]);
        setStorageReady(true);
        return;
      }

      const [localBookings, remoteBookings] = await Promise.all([
        loadBookingsForUser(meUid),
        fetchBookingsFromFirestore(meUid),
      ]);
      if (!active) return;

      const hydratedBookings = mergeHydratedBookings(localBookings, remoteBookings);
      if (hydratedBookings.length) {
        setBookings(hydratedBookings);
      } else {
        setBookings([
          {
            id: 'seed-1',
            itemId: 'graphing-calculator',
            borrowerUid: meUid,
            ownerUid: 'owner-2',
            startDate: '2026-05-01',
            endDate: '2026-05-02',
            meetupLocation: CAMPUS_HANDOVER_ZONES[1],
            meetupTime: '12:00',
            status: 'returned',
            bookingFee: 10,
            deposit: 5,
            paymentMethod: 'Card',
            createdAt: Date.now() - 1000 * 60 * 60 * 26,
            rating: { score: 5, comment: 'Works great and on time pickup.' },
          },
          {
            id: 'seed-2',
            itemId: 'laptop',
            borrowerUid: meUid,
            ownerUid: 'owner-6',
            startDate: '2026-05-10',
            endDate: '2026-05-12',
            meetupLocation: CAMPUS_HANDOVER_ZONES[0],
            meetupTime: '15:30',
            status: 'pending',
            bookingFee: 90,
            deposit: 30,
            paymentMethod: 'Transfer',
            createdAt: Date.now() - 1000 * 60 * 60 * 4,
          },
        ]);
      }
      setStorageReady(true);
    }

    hydrateBookings().catch(() => {
      if (active) setStorageReady(true);
    });

    return () => {
      active = false;
    };
  }, [meUid]);

  useEffect(() => {
    let active = true;
    fetchListingsFromFirestore()
      .then((listings) => {
        if (active) setRemoteItems(listings);
      })
      .catch(() => {
        if (active) setRemoteItems([]);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!meUid || !storageReady) return;
    saveBookingsForUser(meUid, bookings).catch(() => {
      // Keep UI responsive even if local persistence fails.
    });
  }, [bookings, meUid, storageReady]);

  const value: UniLeaseContextValue = useMemo(() => {
    return {
      items,
      selectedItemId,
      selectedItem,
      selectItemForBooking: (itemId: string) => setSelectedItemId(itemId),
      addListing: async (params) => {
        if (!meUid || !user) return null;
        const id = `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const item: UniLeaseItem = {
          id,
          title: params.title.trim(),
          description:
            params.description?.trim() ||
            `${params.title.trim()} listed by a verified UniLease student for campus handover.`,
          categories: [params.category],
          pricePerDay: params.pricePerDay,
          location: params.campusLocation,
          condition: params.condition,
          imageUrl:
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80',
          badge: 'New',
          owner: {
            uid: meUid,
            name: user.username,
            trustScore: 4.5,
          },
        };
        setRemoteItems((prev) => [item, ...prev.filter((existing) => existing.id !== item.id)]);
        saveListingToFirestore(item).catch(() => {
          // The in-memory listing remains available for the current demo if Firestore is offline.
        });
        return item;
      },

      bookings,
      myBookings,
      requestBooking: async (params) => {
        if (!meUid) return null;
        if (!selectedItem) return null;

        const { bookingFee, deposit } = calculateBookingQuote(selectedItem, params.startDate, params.endDate);

        const booking: UniLeaseBooking = {
          id: `bk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          itemId: selectedItem.id,
          borrowerUid: meUid,
          ownerUid: selectedItem.owner.uid,
          startDate: params.startDate,
          endDate: params.endDate,
          meetupLocation: params.meetupLocation,
          meetupTime: params.meetupTime,
          status: 'pending',
          bookingFee,
          deposit,
          paymentMethod: params.paymentMethod,
          createdAt: Date.now(),
        };

        setBookings((prev) => [booking, ...prev]);
        saveBookingToFirestore(booking).catch(() => {
          // Firestore sync is best-effort; SQLite keeps the booking available offline.
        });
        return booking;
      },

      advanceBookingStatus: (bookingId: string, nextStatus: UniLeaseBookingStatus) => {
        setBookings((prev) =>
          prev.map((b) => {
            if (b.id !== bookingId) return b;
            if (b.status === nextStatus) return b;
            return { ...b, status: nextStatus };
          })
        );
        updateBookingStatusInFirestore(bookingId, nextStatus).catch(() => {
          // SQLite persistence still records the local state.
        });
      },

      leaveRating: (bookingId: string, score: number, comment: string) => {
        const safeScore = Math.max(1, Math.min(5, Math.round(score)));
        const safeComment = comment.trim().slice(0, 280);
        setBookings((prev) =>
          prev.map((b) => {
            if (b.id !== bookingId) return b;
            if (b.status !== 'returned') return b;
            return { ...b, rating: { score: safeScore, comment: safeComment } };
          })
        );
        saveRatingToFirestore(bookingId, { score: safeScore, comment: safeComment }).catch(() => {
          // Best-effort remote sync.
        });
      },
    };
  }, [items, selectedItem, selectedItemId, bookings, myBookings, meUid, user]);

  return <UniLeaseContext.Provider value={value}>{children}</UniLeaseContext.Provider>;
}

export function useUniLease() {
  const ctx = useContext(UniLeaseContext);
  if (!ctx) throw new Error('useUniLease must be used within UniLeaseProvider');
  return ctx;
}

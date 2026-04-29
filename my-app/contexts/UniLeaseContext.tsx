import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CAMPUS_HANDOVER_ZONES, MOCK_ITEMS, type UniLeaseItem } from '@/data/mock-unilease';
import { useAuth } from '@/contexts/AuthContext';

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

function parseYmd(ymd: string) {
  // Accept "YYYY-MM-DD"
  const [y, m, d] = ymd.split('-').map((v) => Number(v));
  if (!y || !m || !d) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

function diffDaysInclusive(startYmd: string, endYmd: string) {
  const start = parseYmd(startYmd);
  const end = parseYmd(endYmd);
  if (!start || !end) return 1;
  const msPerDay = 24 * 60 * 60 * 1000;
  const raw = (end.getTime() - start.getTime()) / msPerDay;
  const days = Math.floor(raw) + 1;
  return Math.max(1, days);
}

export function UniLeaseProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const meUid = user?.uid ?? null;

  const items = useMemo(() => MOCK_ITEMS, []);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const [bookings, setBookings] = useState<UniLeaseBooking[]>([]);

  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null;
    return items.find((it) => it.id === selectedItemId) ?? null;
  }, [items, selectedItemId]);

  const myBookings = useMemo(() => {
    if (!meUid) return [];
    return bookings.filter((b) => b.borrowerUid === meUid);
  }, [bookings, meUid]);

  useEffect(() => {
    // Seed a small set of bookings for the demo user.
    if (!meUid) return;
    if (bookings.length) return;
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
  }, [bookings.length, meUid]);

  const value: UniLeaseContextValue = useMemo(() => {
    return {
      items,
      selectedItemId,
      selectedItem,
      selectItemForBooking: (itemId: string) => setSelectedItemId(itemId),

      bookings,
      myBookings,
      requestBooking: async (params) => {
        if (!meUid) return null;
        if (!selectedItem) return null;

        const days = diffDaysInclusive(params.startDate, params.endDate);
        const bookingFee = selectedItem.pricePerDay * days;
        const deposit = Math.round(bookingFee * 0.33 * 100) / 100;

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
      },
    };
  }, [items, selectedItem, selectedItemId, bookings, myBookings, meUid]);

  return <UniLeaseContext.Provider value={value}>{children}</UniLeaseContext.Provider>;
}

export function useUniLease() {
  const ctx = useContext(UniLeaseContext);
  if (!ctx) throw new Error('useUniLease must be used within UniLeaseProvider');
  return ctx;
}


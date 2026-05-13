import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { UniLeaseBooking } from '@/contexts/UniLeaseContext';
import type { UniLeaseItem } from '@/data/mock-unilease';
import { db } from './firebase';

function getConfiguredDb() {
  return db;
}

export async function saveBookingToFirestore(booking: UniLeaseBooking) {
  const firestore = getConfiguredDb();
  if (!firestore) return { ok: false, reason: 'Firebase is not configured' };

  await setDoc(doc(firestore, 'bookings', booking.id), {
    ...booking,
    syncedAt: serverTimestamp(),
  });
  return { ok: true };
}

export async function fetchBookingsFromFirestore(uid: string): Promise<UniLeaseBooking[]> {
  const firestore = getConfiguredDb();
  if (!firestore) return [];

  const snap = await getDocs(query(collection(firestore, 'bookings'), where('borrowerUid', '==', uid)));
  return snap.docs
    .map((item) => item.data() as UniLeaseBooking)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function updateBookingStatusInFirestore(bookingId: string, status: UniLeaseBooking['status']) {
  const firestore = getConfiguredDb();
  if (!firestore) return { ok: false, reason: 'Firebase is not configured' };

  await updateDoc(doc(firestore, 'bookings', bookingId), {
    status,
    updatedAt: serverTimestamp(),
  });
  return { ok: true };
}

export async function saveRatingToFirestore(bookingId: string, rating: NonNullable<UniLeaseBooking['rating']>) {
  const firestore = getConfiguredDb();
  if (!firestore) return { ok: false, reason: 'Firebase is not configured' };

  await updateDoc(doc(firestore, 'bookings', bookingId), {
    rating,
    updatedAt: serverTimestamp(),
  });
  return { ok: true };
}

export type ListingDraft = {
  title: string;
  description: string;
  categories: UniLeaseItem['categories'];
  pricePerDay: number;
  location: string;
  condition: UniLeaseItem['condition'];
  ownerUid: string;
  ownerName: string;
};

export async function saveListingToFirestore(item: UniLeaseItem) {
  const firestore = getConfiguredDb();
  if (!firestore) return { ok: false, reason: 'Firebase is not configured' };

  await setDoc(doc(firestore, 'items', item.id), {
    ...item,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { ok: true };
}

export async function fetchListingsFromFirestore(): Promise<UniLeaseItem[]> {
  const firestore = getConfiguredDb();
  if (!firestore) return [];

  const snap = await getDocs(query(collection(firestore, 'items'), orderBy('createdAt', 'desc')));
  return snap.docs.map((item) => item.data() as UniLeaseItem);
}

export async function getFirestoreHealth() {
  const firestore = getConfiguredDb();
  if (!firestore) {
    return { configured: false, detail: 'FIREBASE_* environment values are not configured.' };
  }
  return { configured: true, detail: 'Firestore service is ready for booking sync.' };
}

import * as SQLite from 'expo-sqlite';
import type { UniLeaseBooking } from '@/contexts/UniLeaseContext';

const DB_NAME = 'unilease.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb() {
  dbPromise ??= SQLite.openDatabaseAsync(DB_NAME);
  return dbPromise;
}

export async function initLocalDatabase() {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY NOT NULL,
      borrower_uid TEXT NOT NULL,
      payload TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS app_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
}

export async function saveBookingsForUser(uid: string, bookings: UniLeaseBooking[]) {
  await initLocalDatabase();
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM bookings WHERE borrower_uid = ?', uid);
    for (const booking of bookings) {
      await db.runAsync(
        'INSERT OR REPLACE INTO bookings (id, borrower_uid, payload, updated_at) VALUES (?, ?, ?, ?)',
        booking.id,
        uid,
        JSON.stringify(booking),
        Date.now()
      );
    }
  });
}

export async function loadBookingsForUser(uid: string): Promise<UniLeaseBooking[]> {
  await initLocalDatabase();
  const db = await getDb();
  const rows = await db.getAllAsync<{ payload: string }>(
    'SELECT payload FROM bookings WHERE borrower_uid = ? ORDER BY updated_at DESC',
    uid
  );
  return rows
    .map((row) => {
      try {
        return JSON.parse(row.payload) as UniLeaseBooking;
      } catch {
        return null;
      }
    })
    .filter((booking): booking is UniLeaseBooking => booking != null);
}

export async function recordAppEvent(eventType: string, payload: Record<string, unknown>) {
  await initLocalDatabase();
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO app_events (event_type, payload, created_at) VALUES (?, ?, ?)',
    eventType,
    JSON.stringify(payload),
    Date.now()
  );
}

export async function getLocalHealth() {
  await initLocalDatabase();
  const db = await getDb();
  const bookingCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM bookings');
  const eventCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM app_events');
  return {
    database: DB_NAME,
    bookingCount: bookingCount?.count ?? 0,
    eventCount: eventCount?.count ?? 0,
  };
}

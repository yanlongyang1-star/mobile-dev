import type { UniLeaseItem } from '@/data/mock-unilease';
import { diffDaysInclusive, parseYmd } from './date';

export function calculateBookingQuote(item: Pick<UniLeaseItem, 'pricePerDay'>, startDate: string, endDate: string) {
  const days = diffDaysInclusive(startDate, endDate);
  const bookingFee = item.pricePerDay * days;
  const deposit = Math.round(bookingFee * 0.33 * 100) / 100;
  return {
    days,
    bookingFee,
    deposit,
    totalDue: bookingFee + deposit,
  };
}

export function validateBookingDates(startDate: string, endDate: string) {
  const start = parseYmd(startDate);
  const end = parseYmd(endDate);
  if (!start || !end) return { ok: false, reason: 'Dates must use YYYY-MM-DD format.' };
  if (end.getTime() < start.getTime()) return { ok: false, reason: 'End date must be after start date.' };
  return { ok: true };
}

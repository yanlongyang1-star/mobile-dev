import { MOCK_ITEMS } from '@/data/mock-unilease';
import { calculateBookingQuote, validateBookingDates } from '@/utils/booking';

describe('booking integration rules', () => {
  it('uses item data and date range to calculate a payment summary', () => {
    const laptop = MOCK_ITEMS.find((item) => item.id === 'laptop');
    expect(laptop).toBeDefined();

    const quote = calculateBookingQuote(laptop!, '2026-05-10', '2026-05-12');

    expect(quote).toEqual({
      days: 3,
      bookingFee: 90,
      deposit: 29.7,
      totalDue: 119.7,
    });
  });

  it('prevents impossible booking date ranges', () => {
    expect(validateBookingDates('2026-05-12', '2026-05-10')).toEqual({
      ok: false,
      reason: 'End date must be after start date.',
    });
  });

  it('rejects impossible calendar dates', () => {
    expect(validateBookingDates('2026-02-31', '2026-03-02')).toEqual({
      ok: false,
      reason: 'Dates must use YYYY-MM-DD format.',
    });
  });
});

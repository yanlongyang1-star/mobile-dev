import { CAMPUS_HANDOVER_ZONES, MOCK_ITEMS } from '@/data/mock-unilease';
import { calculateBookingQuote, validateBookingDates } from '@/utils/booking';

describe('borrower happy path e2e model', () => {
  it('supports browse, select, quote and booking request data passing', () => {
    const search = 'calculator';
    const results = MOCK_ITEMS.filter((item) =>
      `${item.title} ${item.description} ${item.location}`.toLowerCase().includes(search)
    );

    const selectedItem = results[0];
    const dateValidation = validateBookingDates('2026-05-13', '2026-05-14');
    const quote = calculateBookingQuote(selectedItem, '2026-05-13', '2026-05-14');
    const bookingRequest = {
      itemId: selectedItem.id,
      meetupLocation: CAMPUS_HANDOVER_ZONES[1],
      meetupTime: '12:00',
      paymentMethod: 'Card',
      ...quote,
    };

    expect(selectedItem.id).toBe('graphing-calculator');
    expect(dateValidation.ok).toBe(true);
    expect(bookingRequest).toMatchObject({
      itemId: 'graphing-calculator',
      days: 2,
      bookingFee: 10,
      deposit: 3.3,
      meetupLocation: 'Engineering Building',
    });
  });
});

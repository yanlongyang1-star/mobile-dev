import { addDays, diffDaysInclusive, parseYmd } from '@/utils/date';

describe('date utilities', () => {
  it('calculates inclusive rental days', () => {
    expect(diffDaysInclusive('2026-05-10', '2026-05-12')).toBe(3);
  });

  it('adds days across month boundaries', () => {
    expect(addDays('2026-05-31', 1)).toBe('2026-06-01');
  });

  it('rejects invalid date strings', () => {
    expect(parseYmd('not-a-date')).toBeNull();
  });
});

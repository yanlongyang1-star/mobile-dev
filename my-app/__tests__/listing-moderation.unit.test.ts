jest.mock('bad-words', () => ({
  Filter: jest.fn().mockImplementation(() => ({
    isProfane: (token: string) => token.toLowerCase() === 'shit',
    clean: (text: string) => text.replace(/\bshit\b/gi, '****'),
  })),
}));

import { moderateText } from '@/utils/profanityFilter';

describe('listing moderation unit rules', () => {
  it('allows clean listing copy without changing the text', () => {
    const result = moderateText('Excellent calculator with fresh batteries for exam week');

    expect(result).toEqual({
      hasProfanity: false,
      maskedText: 'Excellent calculator with fresh batteries for exam week',
      flaggedWords: [],
    });
  });

  it('flags and masks profanity before a listing can be submitted', () => {
    const result = moderateText('This camera is shit but still works');

    expect(result.hasProfanity).toBe(true);
    expect(result.flaggedWords).toContain('shit');
    expect(result.maskedText).toContain('****');
  });
});

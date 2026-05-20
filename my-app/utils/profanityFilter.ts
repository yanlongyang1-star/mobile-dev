import { Filter } from 'bad-words';

export type ProfanityResult = {
  hasProfanity: boolean;
  maskedText: string;
  flaggedWords: string[];
};

const filter = new Filter();

function unique(values: string[]) {
  return [...new Set(values)];
}

export function moderateText(input: string): ProfanityResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { hasProfanity: false, maskedText: trimmed, flaggedWords: [] };
  }

  // Split on word boundaries so we can report exactly which terms were flagged.
  const tokens = trimmed.match(/\b[\w']+\b/g) ?? [];
  const flaggedWords = unique(tokens.filter((token) => filter.isProfane(token)).map((token) => token.toLowerCase()));

  return {
    hasProfanity: flaggedWords.length > 0,
    maskedText: filter.clean(trimmed),
    flaggedWords,
  };
}

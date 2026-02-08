const ADJECTIVES = [
  'tribal',
  'hidden',
  'immunity',
  'fire',
  'merge',
  'exile',
  'sacred',
  'jungle',
  'island',
  'coastal',
  'outback',
  'final',
  'blindside',
  'reward',
  'golden',
  'ancient',
  'secret',
  'wild',
  'fierce',
  'epic',
  'cursed',
  'mighty',
  'phantom',
  'rogue',
  'shadow',
];

const NOUNS = [
  'council',
  'torch',
  'challenge',
  'feast',
  'tribe',
  'alliance',
  'camp',
  'shelter',
  'beach',
  'jury',
  'castaway',
  'quest',
  'safari',
  'snuffer',
  'idol',
  'totem',
  'voyage',
  'reef',
  'lagoon',
  'summit',
  'canyon',
  'rapids',
  'ember',
  'flare',
  'compass',
];

/**
 * Generate a random Survivor-themed slug in the format: adjective-noun-number
 * e.g., "tribal-torch-42", "hidden-idol-17", "fire-alliance-88"
 */
export function generateSlug(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const number = Math.floor(Math.random() * 90) + 10; // 10-99
  return `${adjective}-${noun}-${number}`;
}

'use client';

import {
  Box,
  HStack,
  VStack,
  Text,
  Flex,
} from '@chakra-ui/react';
import type { EpisodeResultsResponse } from '@/types/api';

interface QuestionResult {
  text: string;
  correct: boolean;
  points: number;
}

interface WeekResultsCardProps {
  episodeResults: EpisodeResultsResponse;
}

function transformResults(data: EpisodeResultsResponse) {
  const userQuestions = data.questions
    .map((q) => {
      const userAnswer = q.answers.find((a) => a.isCurrentUser);
      if (!userAnswer) return null;

      const isCorrect =
        q.isScored &&
        userAnswer.answer.toLowerCase().trim() ===
          q.correctAnswer?.toLowerCase().trim();

      return {
        text: q.text,
        correct: isCorrect,
        points: userAnswer.pointsEarned || 0,
      };
    })
    .filter((q): q is QuestionResult => q !== null);

  const pointsEarned = userQuestions.reduce((sum, q) => sum + q.points, 0);
  const correctPredictions = userQuestions.filter((q) => q.correct).length;

  return {
    weekNumber: data.episodeNumber,
    pointsEarned,
    correctPredictions,
    totalPredictions: userQuestions.length,
    questions: userQuestions,
  };
}

// Keyword dictionary for extracting short chip labels from question text.
// Ordered by specificity — more specific patterns first within each group.
const KEYWORD_RULES: Array<{ pattern: RegExp; label: string }> = [
  // Elimination / Tribal Council (specific first)
  { pattern: /sole survivor/i, label: 'Sole Survivor' },
  { pattern: /final tribal/i, label: 'Final Tribal' },
  { pattern: /fire[- ]?making/i, label: 'Fire Making' },
  { pattern: /first.*(voted out|eliminated|boot)/i, label: 'First Boot' },
  { pattern: /purple rock/i, label: 'Rocks' },
  { pattern: /draw rocks/i, label: 'Rocks' },
  { pattern: /split vote/i, label: 'Split Vote' },
  { pattern: /unanimous/i, label: 'Unanimous Vote' },
  { pattern: /re-?vote/i, label: 'Revote' },
  { pattern: /how many votes|receive votes/i, label: 'Vote Count' },
  { pattern: /blindside/i, label: 'Blindside' },
  { pattern: /voted out|vote out|eliminated|elimination/i, label: 'Voted Out' },
  { pattern: /joins? the jury|member of the jury/i, label: 'Jury' },
  { pattern: /jury/i, label: 'Jury' },
  { pattern: /torch|snuffed/i, label: 'Torch Snuffed' },
  { pattern: /rocks/i, label: 'Rocks' },

  // Challenges (specific first)
  { pattern: /first immunity/i, label: 'First Immunity' },
  { pattern: /final immunity/i, label: 'Final Immunity' },
  { pattern: /individual immunity/i, label: 'Immunity' },
  { pattern: /immunity challenge/i, label: 'Immunity' },
  { pattern: /wins? immunity/i, label: 'Immunity' },
  { pattern: /reward challenge/i, label: 'Reward' },
  { pattern: /wins? (?:the )?reward/i, label: 'Reward' },
  { pattern: /advantage in challenge/i, label: 'Challenge Advantage' },
  { pattern: /endurance/i, label: 'Endurance' },
  { pattern: /puzzle/i, label: 'Puzzle' },
  { pattern: /sits? out/i, label: 'Sit Out' },
  { pattern: /immunity/i, label: 'Immunity' },
  { pattern: /reward/i, label: 'Reward' },
  { pattern: /challenge/i, label: 'Challenge' },

  // Idols / Advantages (specific first)
  { pattern: /hidden immunity idol|hidden idol/i, label: 'Hidden Idol' },
  { pattern: /idol.*played|play.*idol/i, label: 'Idol Played' },
  { pattern: /idol.*found|finds?.*idol/i, label: 'Idol Found' },
  { pattern: /immunity idol/i, label: 'Idol' },
  { pattern: /shot in the dark/i, label: 'Shot in the Dark' },
  { pattern: /safety without power/i, label: 'Safety' },
  { pattern: /knowledge is power/i, label: 'Knowledge' },
  { pattern: /beware advantage/i, label: 'Beware Advantage' },
  { pattern: /extra vote/i, label: 'Extra Vote' },
  { pattern: /steal.*vote/i, label: 'Steal a Vote' },
  { pattern: /advantage.*played|play.*advantage/i, label: 'Advantage Played' },
  { pattern: /advantage.*found|finds? .*advantage/i, label: 'Advantage Found' },
  { pattern: /idol/i, label: 'Idol' },
  { pattern: /amulet/i, label: 'Amulet' },
  { pattern: /inheritance/i, label: 'Inheritance' },
  { pattern: /advantage/i, label: 'Advantage' },

  // Tribes / Social (specific first)
  { pattern: /merge tribe name/i, label: 'Merge Name' },
  { pattern: /tribe swap|swap tribes|switch tribes/i, label: 'Tribe Swap' },
  { pattern: /tribes? merge|merge/i, label: 'Merge' },
  { pattern: /which tribe|tribe.*wins|tribe.*loses/i, label: 'Tribe' },
  { pattern: /ghost island/i, label: 'Ghost Island' },
  { pattern: /edge of extinction/i, label: 'Edge' },
  { pattern: /redemption island|redemption/i, label: 'Redemption' },
  { pattern: /exile island|exile/i, label: 'Exile' },
  { pattern: /loved ones|family visit/i, label: 'Loved Ones' },
  { pattern: /survivor auction|auction/i, label: 'Auction' },
  { pattern: /showmance|romance/i, label: 'Showmance' },
  { pattern: /confessional/i, label: 'Confessional' },
  { pattern: /alliance/i, label: 'Alliance' },
  { pattern: /outcast/i, label: 'Outcast' },
  { pattern: /journey/i, label: 'Journey' },
  { pattern: /summit/i, label: 'Summit' },

  // Strategy / Twists
  { pattern: /surprise twist/i, label: 'Twist' },
  { pattern: /twist/i, label: 'Twist' },
  { pattern: /flips?/i, label: 'Flip' },
  { pattern: /backstab|betrayal/i, label: 'Betrayal' },
  { pattern: /target/i, label: 'Target' },
  { pattern: /camp leader|leader/i, label: 'Leader' },
  { pattern: /provider|provides/i, label: 'Provider' },
  { pattern: /strateg(y|ic)/i, label: 'Strategy' },

  // Camp Life / Misc
  { pattern: /medevac|medical.*evacuat|evacuated/i, label: 'Medevac' },
  { pattern: /quits?/i, label: 'Quit' },
  { pattern: /injur(y|ed)/i, label: 'Injury' },
  { pattern: /feast/i, label: 'Feast' },
  { pattern: /shelter/i, label: 'Shelter' },
  { pattern: /rice|food/i, label: 'Food' },
  { pattern: /rain|storm|weather/i, label: 'Weather' },
  { pattern: /cries?|tears/i, label: 'Tears' },
  { pattern: /camp/i, label: 'Camp' },
  { pattern: /tribal council/i, label: 'Tribal Council' },
];

// Prefixes to strip for fallback truncation
const QUESTION_PREFIXES = /^(who will |who wins |who gets |who is |who are |who |will there be an? |will an? |will the |will someone |will |what will |what |which |where |how many |how |is |are |does |do )/i;

function getChipLabel(text: string): string {
  // Pass 1: keyword scan
  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(text)) {
      return rule.label;
    }
  }

  // Pass 2: fallback prefix-stripping + truncation
  let stripped = text.replace(/\?+$/, '').trim();
  stripped = stripped.replace(QUESTION_PREFIXES, '').trim();
  stripped = stripped.replace(/\?+$/, '').trim();

  if (stripped.length === 0) return text.replace(/\?+$/, '').trim();

  // Truncate to first 3 words if still long
  if (stripped.length > 25) {
    const words = stripped.split(/\s+/).slice(0, 3);
    stripped = words.join(' ');
    if (stripped.length < text.length - 5) stripped += '...';
  }

  // Title-case
  return stripped
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

// Generates a short narrative for the result
function getResultNarrative(correct: number, total: number): string {
  if (total === 0) return '';
  const ratio = correct / total;
  if (ratio === 1) return 'Perfect week!';
  if (ratio >= 0.75) return 'Your best week yet.';
  if (ratio >= 0.5) return 'Solid effort.';
  return 'Tough week.';
}

export function WeekResultsCard({ episodeResults }: WeekResultsCardProps) {
  // Check if user has answers
  const hasUserAnswers = episodeResults.questions.some((q) =>
    q.answers.some((a) => a.isCurrentUser)
  );

  if (!hasUserAnswers || episodeResults.questions.length === 0) {
    return null;
  }

  const { weekNumber, pointsEarned, correctPredictions, totalPredictions, questions } =
    transformResults(episodeResults);

  const narrative = getResultNarrative(correctPredictions, totalPredictions);
  const isPositive = pointsEarned > 0;

  return (
    <Box
      bg="rgba(26, 25, 32, 1)"
      border="1px solid rgba(255,255,255,0.08)"
      borderRadius="12px"
      px={{ base: 4, md: 6 }}
      py="18px"
    >
      <VStack align="stretch" gap={1}>
        {/* Top row: Icon + Text */}
        <HStack gap={{ base: 3, md: 4 }}>
          <Flex
            w="42px"
            h="42px"
            borderRadius="10px"
            bg={
              isPositive
                ? 'linear-gradient(135deg, rgba(78,203,113,0.15), rgba(78,203,113,0.05))'
                : 'linear-gradient(135deg, rgba(232,84,84,0.15), rgba(232,84,84,0.05))'
            }
            border={
              isPositive
                ? '1px solid rgba(78,203,113,0.2)'
                : '1px solid rgba(232,84,84,0.2)'
            }
            align="center"
            justify="center"
            fontSize="18px"
            flexShrink={0}
          >
            {isPositive ? '🔥' : '💧'}
          </Flex>
          <Box>
            <Text fontSize="14px" color="text.secondary" lineHeight="1.4">
              <Text as="span" color="text.primary" fontWeight="600">
                Episode {weekNumber} Results:
              </Text>
              {' '}You earned{' '}
              <Text
                as="span"
                color={isPositive ? '#4ecb71' : '#e85454'}
                fontWeight="700"
                fontFamily="heading"
                fontSize="15px"
              >
                +{pointsEarned} pts
              </Text>
              {narrative ? ` — ${narrative}` : ''}
              {' '}{correctPredictions} of {totalPredictions} picks correct.
            </Text>
          </Box>
        </HStack>

        {/* Bottom row: Pick chips */}
        <HStack gap={2} flexWrap="wrap" pl={{ base: 0, md: '58px' }} pt={{ base: 2, md: 0 }}>
          {questions.map((q) => (
            <Box
              key={q.text}
              display="flex"
              alignItems="center"
              gap="6px"
              px={3}
              py="6px"
              borderRadius="8px"
              fontFamily="heading"
              fontSize="13px"
              fontWeight="600"
              bg={q.correct ? 'rgba(78,203,113,0.15)' : 'rgba(232,84,84,0.15)'}
              color={q.correct ? '#4ecb71' : '#e85454'}
              border={
                q.correct
                  ? '1px solid rgba(78,203,113,0.15)'
                  : '1px solid rgba(232,84,84,0.15)'
              }
              whiteSpace="nowrap"
            >
              {q.correct ? '✓' : '✗'}{' '}
              {getChipLabel(q.text)}
            </Box>
          ))}
        </HStack>
      </VStack>
    </Box>
  );
}

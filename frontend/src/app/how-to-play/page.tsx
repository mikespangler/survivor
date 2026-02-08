'use client';

import {
  Box,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react';
import { AuthenticatedLayout } from '@/components/navigation';

const sections = [
  {
    title: 'Draft Your Tribe',
    paragraphs: [
      "After the premiere, you'll lock in 5 castaways. The longer they survive, the more points they earn. Choose wisely — your roster locks permanently when Episode 2 begins.",
      "No trades. No swaps. No excuses. You're stuck with them, just like a real alliance.",
    ],
  },
  {
    title: 'Make Your Picks',
    paragraphs: [
      "Every week, you'll answer 3 bonus questions predicting what happens in the next episode. Think prop bets — who wins immunity, who goes home, who finds an advantage. These keep you in the fight even if your drafted tribe is getting decimated.",
      'Picks are due every Wednesday by 7:59 PM ET. One minute before the episode airs. Miss the deadline, miss the points.',
    ],
  },
  {
    title: 'Risk It for the Biscuit',
    paragraphs: [
      'At key moments during the season, you may get the chance to wager points on your predictions. Feeling confident about a blindside? Put your points where your mouth is.',
    ],
  },
  {
    title: 'Do Your Homework',
    paragraphs: [
      "Previews, castaway interviews, press photos, social media — it's all fair game. Reading the edit and analyzing confessional counts is part of the fun.",
      'Spoilers, however, are strictly off limits. Play with integrity or your torch gets snuffed.',
    ],
  },
];

export default function HowToPlayPage() {
  return (
    <AuthenticatedLayout>
      <Box maxW="container.md" px={8} py={10}>
        <VStack align="stretch" gap={7}>
          <Box>
            <Heading
              fontFamily="heading"
              fontSize="42px"
              color="text.primary"
              letterSpacing="-1px"
              lineHeight="1"
            >
              How to Play
            </Heading>
            <Text color="text.secondary" fontSize="15px" mt={2}>
              Everything you need to know to outwit, outplay, and outlast your league.
            </Text>
          </Box>

          <VStack align="stretch" gap={5}>
            {sections.map((section) => (
              <Box
                key={section.title}
                bg="bg.secondary"
                borderRadius="14px"
                p={6}
                border="1px solid"
                borderColor="rgba(48, 53, 65, 0.5)"
              >
                <Text
                  fontFamily="heading"
                  fontSize="13px"
                  fontWeight="600"
                  letterSpacing="2px"
                  textTransform="uppercase"
                  color="brand.primary"
                  mb={3}
                >
                  {section.title}
                </Text>
                <VStack align="stretch" gap={3}>
                  {section.paragraphs.map((text) => (
                    <Text
                      key={text}
                      color="text.secondary"
                      fontSize="15px"
                      lineHeight="1.7"
                    >
                      {text}
                    </Text>
                  ))}
                </VStack>
              </Box>
            ))}
          </VStack>
        </VStack>
      </Box>
    </AuthenticatedLayout>
  );
}

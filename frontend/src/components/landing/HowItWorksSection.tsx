'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  SimpleGrid,
} from '@chakra-ui/react';

const steps = [
  {
    number: '01',
    title: 'Join or Create\na League',
    description: 'Start a private league with friends or join an existing one. Customize rules and settings.',
    emoji: '🏝️',
  },
  {
    number: '02',
    title: 'Draft Survivor Castaways',
    description: 'Pick your favorite players before the season begins. Build your dream team strategically.',
    emoji: '🎯',
  },
  {
    number: '03',
    title: 'Answer Weekly Questions',
    description: 'Make predictions, wager points, and complete bonus challenges after each episode.',
    emoji: '❓',
  },
  {
    number: '04',
    title: 'Climb the Leaderboard',
    description: 'Earn points as your picks survive and your predictions come true. Win the season!',
    emoji: '🏆',
  },
];

export const HowItWorksSection = () => {
  return (
    <Box
      as="section"
      bg="bg.primary"
      py={{ base: 12, md: 20 }}
      px={{ base: 4, lg: '100px' }}
    >
      <Container maxW="1400px" px={0}>
        <VStack gap={{ base: 12, md: 20 }}>
          {/* Section Header */}
          <VStack gap={4} textAlign="center">
            <Badge
              bg="rgba(240, 101, 66, 0.15)"
              color="brand.primary"
              borderRadius="full"
              px={4}
              py={1.5}
              fontSize="sm"
              fontWeight="bold"
              textTransform="uppercase"
              letterSpacing="0.7px"
            >
              How It Works
            </Badge>
            
            <Heading
              as="h2"
              fontFamily="heading"
              fontSize={{ base: '32px', md: '48px' }}
              lineHeight="48px"
              letterSpacing="-1.2px"
              color="text.primary"
            >
              Start Playing in Minutes
            </Heading>
            
            <Text
              fontFamily="body"
              fontSize="lg"
              lineHeight="28px"
              fontWeight="medium"
              color="text.secondary"
              maxW="672px"
              textAlign="center"
            >
              Four simple steps to join the competition and prove you&apos;re the ultimate Survivor fan.
            </Text>
          </VStack>

          {/* Step Cards */}
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 4 }}
            gap={8}
            w="full"
          >
            {steps.map((step) => (
              <StepCard key={step.number} {...step} />
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

const StepCard = ({
  number,
  title,
  description,
  emoji,
}: {
  number: string;
  title: string;
  description: string;
  emoji: string;
}) => (
  <Box
    position="relative"
    bgGradient="linear(138deg, #212630 0%, #191D24 100%)"
    border="2px solid"
    borderColor="rgba(48, 53, 65, 0.5)"
    borderRadius="24px"
    boxShadow="0px 12px 40px 0px rgba(0, 0, 0, 0.5)"
    p={8}
    pt={8}
    pb={8}
  >
    {/* Number Badge */}
    <Box
      position="absolute"
      top="-14px"
      right="-10px"
      bg="brand.primary"
      borderRadius="16px"
      boxShadow="0px 4px 0px 0px #C34322"
      w="56px"
      h="56px"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Text
        fontFamily="display"
        fontWeight="bold"
        fontSize="lg"
        color="text.button"
      >
        {number}
      </Text>
    </Box>

    <VStack align="start" gap={6}>
      {/* Icon/Emoji */}
      <Box
        h="80px"
        display="flex"
        alignItems="center"
      >
        <Text fontSize="48px">{emoji}</Text>
      </Box>

      {/* Content */}
      <VStack align="start" gap={3}>
        <Heading
          as="h3"
          fontFamily="heading"
          fontSize="xl"
          lineHeight="28px"
          letterSpacing="-0.5px"
          color="text.primary"
          whiteSpace="pre-line"
        >
          {title}
        </Heading>
        <Text
          fontFamily="body"
          fontSize="md"
          lineHeight="26px"
          fontWeight="medium"
          color="text.secondary"
        >
          {description}
        </Text>
      </VStack>
    </VStack>
  </Box>
);

export default HowItWorksSection;

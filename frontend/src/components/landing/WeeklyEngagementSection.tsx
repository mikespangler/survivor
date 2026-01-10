'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Flex,
  Image,
} from '@chakra-ui/react';

const features = [
  {
    icon: '/landing/icon-target.svg',
    title: 'Episode Predictions',
    description: 'Guess who gets voted off, wins immunity, or finds an idol.',
  },
  {
    icon: '/landing/icon-coins.svg',
    title: 'Point Wagers',
    description: 'Bet your points on confident predictions for bigger rewards.',
  },
  {
    icon: '/landing/icon-star.svg',
    title: 'Bonus Challenges',
    description: 'Complete special challenges set by your commissioner.',
  },
];

const questionOptions = [
  { name: 'Austin', selected: false },
  { name: 'Drew', selected: true },
  { name: 'Kellie', selected: false },
  { name: 'Jake', selected: false },
];

export const WeeklyEngagementSection = () => {
  return (
    <Box
      as="section"
      bg="bg.secondary"
      border="1px solid"
      borderColor="rgba(48, 53, 65, 0.5)"
      py={{ base: 16, md: 32 }}
      px={{ base: 4, lg: '100px' }}
      position="relative"
      overflow="hidden"
    >
      {/* Background pattern overlay */}
      <Box
        position="absolute"
        inset={0}
        opacity={0.03}
        bgImage="repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(255,255,255,0.05) 30px, rgba(255,255,255,0.05) 60px)"
      />

      <Container maxW="1400px" px={0} position="relative" zIndex={1}>
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          gap={{ base: 12, lg: 20 }}
          align="center"
        >
          {/* Left Content */}
          <VStack align="start" flex={1} gap={4}>
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
              Weekly Engagement
            </Badge>

            <Heading
              as="h2"
              fontFamily="heading"
              fontSize={{ base: '32px', md: '40px' }}
              lineHeight="48px"
              letterSpacing="-1.2px"
            >
              <Text as="span" color="text.primary">Stay Hooked</Text>
              <br />
              <Text as="span" className="text-gradient-orange-yellow">
                Episode After Episode
              </Text>
            </Heading>

            <Text
              fontFamily="body"
              fontSize="lg"
              lineHeight="28px"
              fontWeight="medium"
              color="text.secondary"
              pt={2}
            >
              Every week brings new opportunities to score. Answer questions before each episode airs, and watch your points stack up as the season unfolds.
            </Text>

            {/* Feature Cards */}
            <VStack gap={5} w="full" pt={6}>
              {features.map((feature) => (
                <FeatureItem key={feature.title} {...feature} />
              ))}
            </VStack>
          </VStack>

          {/* Right - Question Card Mockup */}
          <Box flex={1} maxW={{ base: 'full', lg: '580px' }}>
            <Box
              bgGradient="linear(142deg, #212630 0%, #191D24 100%)"
              border="2px solid"
              borderColor="rgba(48, 53, 65, 0.5)"
              borderRadius="24px"
              boxShadow="0px 12px 40px 0px rgba(0, 0, 0, 0.5)"
              p={8}
              position="relative"
              overflow="hidden"
            >
              {/* Orange glow */}
              <Box
                position="absolute"
                top={0}
                right={0}
                w="160px"
                h="160px"
                bg="rgba(240, 101, 66, 0.2)"
                borderRadius="full"
                filter="blur(100px)"
              />

              <VStack align="start" gap={8} position="relative" zIndex={1}>
                {/* Deadline Badge */}
                <Box
                  bg="rgba(237, 115, 29, 0.2)"
                  border="2px solid"
                  borderColor="rgba(237, 115, 29, 0.3)"
                  borderRadius="full"
                  px={4}
                  py={3}
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <Image src="/landing/icon-clock.svg" alt="" w="16px" h="16px" color="#ED731D" />
                  <Text
                    fontFamily="body"
                    fontWeight="bold"
                    fontSize="sm"
                    color="#ED731D"
                  >
                    Deadline: Wed 8PM ET
                  </Text>
                </Box>

                {/* Question */}
                <VStack align="start" gap={6} w="full">
                  <VStack align="start" gap={3}>
                    <Text
                      fontFamily="body"
                      fontWeight="bold"
                      fontSize="xs"
                      color="text.secondary"
                      textTransform="uppercase"
                      letterSpacing="0.6px"
                    >
                      Episode 7 Question
                    </Text>
                    <Heading
                      as="h4"
                      fontFamily="heading"
                      fontSize="xl"
                      letterSpacing="-0.5px"
                      color="text.primary"
                    >
                      Who will be voted out tonight?
                    </Heading>
                  </VStack>

                  {/* Options */}
                  <VStack gap={2.5} w="full">
                    {questionOptions.map((option) => (
                      <Box
                        key={option.name}
                        w="full"
                        bg={option.selected ? 'rgba(240, 101, 66, 0.15)' : 'rgba(43, 48, 59, 0.3)'}
                        border="2px solid"
                        borderColor={option.selected ? 'brand.primary' : 'rgba(48, 53, 65, 0.5)'}
                        borderRadius="16px"
                        boxShadow={option.selected ? '0px 4px 0px 0px #C34322' : 'none'}
                        p={4}
                      >
                        <Flex justify="space-between" align="center">
                          <Text
                            fontFamily="body"
                            fontWeight="bold"
                            fontSize="md"
                            color="text.primary"
                          >
                            {option.name}
                          </Text>
                          {option.selected && (
                            <Badge
                              bg="rgba(240, 101, 66, 0.2)"
                              color="brand.primary"
                              borderRadius="full"
                              px={2}
                              py={1}
                              fontSize="xs"
                              fontWeight="bold"
                            >
                              Selected
                            </Badge>
                          )}
                        </Flex>
                      </Box>
                    ))}
                  </VStack>

                  {/* Points Wagered */}
                  <Box
                    w="full"
                    bg="rgba(249, 195, 31, 0.15)"
                    border="2px solid"
                    borderColor="rgba(249, 195, 31, 0.3)"
                    borderRadius="16px"
                    p={4}
                  >
                    <Flex justify="space-between" align="center">
                      <Text
                        fontFamily="body"
                        fontWeight="semibold"
                        fontSize="sm"
                        color="text.secondary"
                      >
                        Points Wagered
                      </Text>
                      <Text
                        fontFamily="display"
                        fontWeight="bold"
                        fontSize="lg"
                        color="#F9C31F"
                      >
                        +25 pts
                      </Text>
                    </Flex>
                  </Box>
                </VStack>
              </VStack>
            </Box>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

const FeatureItem = ({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) => (
  <Box
    w="full"
    bg="rgba(43, 48, 59, 0.3)"
    border="1px solid"
    borderColor="rgba(48, 53, 65, 0.5)"
    borderRadius="16px"
    p={4}
  >
    <HStack gap={4} align="start">
      <Box
        bg="rgba(240, 101, 66, 0.15)"
        borderRadius="16px"
        w="56px"
        h="56px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        <Image src={icon} alt="" w="28px" h="28px" />
      </Box>
      <VStack align="start" gap={1}>
        <Text
          fontFamily="heading"
          fontSize="lg"
          letterSpacing="-0.45px"
          color="text.primary"
        >
          {title}
        </Text>
        <Text
          fontFamily="body"
          fontSize="md"
          fontWeight="medium"
          color="text.secondary"
          lineHeight="24px"
        >
          {description}
        </Text>
      </VStack>
    </HStack>
  </Box>
);

export default WeeklyEngagementSection;

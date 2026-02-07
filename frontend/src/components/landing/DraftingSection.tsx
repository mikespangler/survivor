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

const teamMembers = [
  { name: 'Maria', tribe: 'Tuku Tribe', emoji: '🔥', isOut: false },
  { name: 'Charlie', tribe: 'Siga Tribe', emoji: '⚡', isOut: false },
  { name: 'Liz', tribe: 'Nami Tribe', emoji: '🌊', isOut: true },
  { name: 'Ben', tribe: 'Tuku Tribe', emoji: '🌴', isOut: false },
];

const features = [
  {
    icon: '/landing/icon-chart.svg',
    title: 'Strategic Drafting',
    description: 'Pick players you believe will go deep in the game.',
    iconBg: 'rgba(240, 101, 66, 0.15)',
  },
  {
    icon: '/landing/icon-shield.svg',
    title: 'Points for Survival',
    description: 'Your picks earn points every week they stay in the game.',
    iconBg: 'rgba(48, 166, 127, 0.15)',
  },
];

export const DraftingSection = () => {
  return (
    <Box
      as="section"
      bg="bg.primary"
      py={{ base: 12, md: 20 }}
      px={{ base: 4, lg: '100px' }}
    >
      <Container maxW="1400px" px={0}>
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          gap={{ base: 12, lg: 20 }}
          align="center"
        >
          {/* Left - Team Card Mockup */}
          <Box flex={1} maxW={{ base: 'full', lg: '580px' }}>
            <Box
              bgGradient="linear(142deg, #212630 0%, #191D24 100%)"
              border="2px solid"
              borderColor="rgba(48, 53, 65, 0.5)"
              borderRadius="24px"
              boxShadow="0px 12px 40px 0px rgba(0, 0, 0, 0.5)"
              p={8}
            >
              <VStack align="start" gap={6}>
                {/* Header */}
                <Flex w="full" justify="space-between" align="start">
                  <VStack align="start" gap={1}>
                    <Text
                      fontFamily="body"
                      fontWeight="bold"
                      fontSize="xs"
                      color="text.secondary"
                      textTransform="uppercase"
                      letterSpacing="0.6px"
                    >
                      Your Team
                    </Text>
                    <Text
                      fontFamily="heading"
                      fontSize="xl"
                      letterSpacing="-0.5px"
                      color="text.primary"
                    >
                      The Tribal Council
                    </Text>
                  </VStack>
                  <Box
                    bg="rgba(48, 166, 127, 0.2)"
                    border="2px solid"
                    borderColor="rgba(48, 166, 127, 0.3)"
                    borderRadius="full"
                    px={4}
                    py={2.5}
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >
                    <Image src="/landing/icon-check.svg" alt="" w="16px" h="16px" />
                    <Text
                      fontFamily="body"
                      fontWeight="bold"
                      fontSize="sm"
                      color="#30A67F"
                    >
                      Rank #3
                    </Text>
                  </Box>
                </Flex>

                {/* Team Members */}
                <VStack gap={3} w="full">
                  {teamMembers.map((member) => (
                    <TeamMemberRow key={member.name} {...member} />
                  ))}
                </VStack>

                {/* Stats */}
                <HStack gap={4} w="full">
                  <StatBox value="247" label="Total Points" color="brand.primary" />
                  <StatBox value="3/4" label="Still In" color="text.primary" />
                  <StatBox value="72%" label="Accuracy" color="#F9C31F" />
                </HStack>
              </VStack>
            </Box>
          </Box>

          {/* Right Content */}
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
              Drafting & Team Ownership
            </Badge>

            <Heading
              as="h2"
              fontFamily="heading"
              fontSize={{ base: '32px', md: '40px' }}
              lineHeight="48px"
              letterSpacing="-1.2px"
            >
              <Text as="span" color="text.primary">Build Your</Text>
              <br />
              <Text as="span" className="text-gradient-orange-yellow">
                Dream Tribe
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
              Draft real Survivor castaways before the season premiere. Manage your roster, track their progress, and watch your picks outwit, outplay, and outlast the competition.
            </Text>

            {/* Feature Cards */}
            <VStack gap={4} w="full" pt={4}>
              {features.map((feature) => (
                <FeatureItem key={feature.title} {...feature} />
              ))}
            </VStack>
          </VStack>
        </Flex>
      </Container>
    </Box>
  );
};

const TeamMemberRow = ({
  name,
  tribe,
  emoji,
  isOut,
}: {
  name: string;
  tribe: string;
  emoji: string;
  isOut: boolean;
}) => (
  <Box
    w="full"
    bg={isOut ? 'rgba(43, 48, 59, 0.2)' : 'rgba(43, 48, 59, 0.4)'}
    border="2px solid"
    borderColor={isOut ? 'transparent' : 'rgba(48, 53, 65, 0.3)'}
    borderRadius="16px"
    p={4}
    opacity={isOut ? 0.6 : 1}
  >
    <Flex justify="space-between" align="center">
      <HStack gap={3}>
        <Box
          bg="bg.secondary"
          border="1px solid"
          borderColor="rgba(48, 53, 65, 0.5)"
          borderRadius="16px"
          w="48px"
          h="48px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="xl">{emoji}</Text>
        </Box>
        <VStack align="start" gap={0}>
          <Text
            fontFamily="body"
            fontWeight="bold"
            fontSize="md"
            color={isOut ? 'text.secondary' : 'text.primary'}
            textDecoration={isOut ? 'line-through' : 'none'}
          >
            {name}
          </Text>
          <Text
            fontFamily="body"
            fontWeight="semibold"
            fontSize="xs"
            color="text.secondary"
          >
            {tribe}
          </Text>
        </VStack>
      </HStack>
      {isOut ? (
        <Badge
          bg="rgba(223, 58, 58, 0.2)"
          color="#DF3A3A"
          borderRadius="full"
          px={2}
          py={1}
          fontSize="xs"
          fontWeight="bold"
        >
          OUT
        </Badge>
      ) : (
        <Image src="/landing/icon-check.svg" alt="" w="20px" h="20px" />
      )}
    </Flex>
  </Box>
);

const StatBox = ({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) => (
  <Box
    flex={1}
    bg="rgba(43, 48, 59, 0.3)"
    border="2px solid"
    borderColor="rgba(48, 53, 65, 0.3)"
    borderRadius="16px"
    p={4}
    textAlign="center"
  >
    <Text
      fontFamily="display"
      fontWeight="bold"
      fontSize="2xl"
      color={color}
    >
      {value}
    </Text>
    <Text
      fontFamily="body"
      fontWeight="semibold"
      fontSize="xs"
      color="text.secondary"
    >
      {label}
    </Text>
  </Box>
);

const FeatureItem = ({
  icon,
  title,
  description,
  iconBg,
}: {
  icon: string;
  title: string;
  description: string;
  iconBg: string;
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
        bg={iconBg}
        borderRadius="16px"
        w="48px"
        h="48px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        <Image src={icon} alt="" w="24px" h="24px" />
      </Box>
      <VStack align="start" gap={1}>
        <Text
          fontFamily="heading"
          fontSize="md"
          letterSpacing="-0.4px"
          color="text.primary"
        >
          {title}
        </Text>
        <Text
          fontFamily="body"
          fontSize="sm"
          fontWeight="medium"
          color="text.secondary"
          lineHeight="20px"
        >
          {description}
        </Text>
      </VStack>
    </HStack>
  </Box>
);

export default DraftingSection;

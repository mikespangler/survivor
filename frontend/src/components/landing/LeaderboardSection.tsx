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

const leaderboardData = [
  { rank: 1, name: 'TorchMaster', points: 342, change: '+24', isGold: true },
  { rank: 2, name: 'TribalKing', points: 318, change: '+15', isGold: false },
  { rank: 3, name: 'OutwitPro', points: 297, change: '+32', isGold: false },
  { rank: 4, name: 'IslandVibes', points: 284, change: '+8', isGold: false },
  { rank: 5, name: 'BlindSider', points: 271, change: '+19', isGold: false },
];

const placementCards = [
  { place: '1st Place', subtitle: 'Champion', icon: '/landing/icon-trophy.svg' },
  { place: '2nd Place', subtitle: 'Runner Up', icon: '/landing/icon-medal-silver.svg' },
  { place: '3rd Place', subtitle: 'Top 3', icon: '/landing/icon-medal-bronze.svg' },
];

export const LeaderboardSection = () => {
  return (
    <Box
      as="section"
      bg="bg.secondary"
      border="1px solid"
      borderColor="rgba(48, 53, 65, 0.5)"
      py={{ base: 12, md: 20 }}
      px={{ base: 4, lg: '100px' }}
      position="relative"
      overflow="hidden"
    >
      {/* Ambient glow */}
      <Box
        position="absolute"
        top="-1px"
        left="50%"
        transform="translateX(-50%)"
        w="800px"
        h="400px"
        bg="rgba(240, 101, 66, 0.05)"
        borderRadius="full"
        filter="blur(100px)"
        pointerEvents="none"
      />

      <Container maxW="1400px" px={0} position="relative" zIndex={1}>
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          gap={{ base: 12, lg: 20 }}
          align="center"
        >
          {/* Left Content */}
          <VStack align="start" flex={1} gap={4} pb={8}>
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
              Competition & Winning
            </Badge>

            <Heading
              as="h2"
              fontFamily="heading"
              fontSize={{ base: '32px', md: '40px' }}
              lineHeight="48px"
              letterSpacing="-1.2px"
            >
              <Text as="span" color="text.primary">Rise Through</Text>
              <br />
              <Text as="span" className="text-gradient-orange-yellow">
                The Rankings
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
              Points accumulate throughout the season. Leaderboards update weekly after each episode. The player with the most points when the finale airs wins bragging rights and glory.
            </Text>

            {/* Placement Cards */}
            <HStack gap={4} pt={4} w="full">
              {placementCards.map((card) => (
                <PlacementCard key={card.place} {...card} />
              ))}
            </HStack>
          </VStack>

          {/* Right - Leaderboard Card */}
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
                <Flex w="full" justify="space-between" align="center">
                  <Text
                    fontFamily="heading"
                    fontSize="xl"
                    letterSpacing="-0.5px"
                    color="text.primary"
                  >
                    League Standings
                  </Text>
                  <Badge
                    bg="#2B303B"
                    color="text.secondary"
                    borderRadius="full"
                    px={3}
                    py={1.5}
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    Week 7 of 14
                  </Badge>
                </Flex>

                {/* Leaderboard Rows */}
                <VStack gap={3} w="full">
                  {leaderboardData.map((player) => (
                    <LeaderboardRow key={player.rank} {...player} />
                  ))}
                </VStack>

                {/* Your Position */}
                <Box
                  w="full"
                  borderTop="2px solid"
                  borderColor="rgba(48, 53, 65, 0.5)"
                  pt={6}
                >
                  <Flex justify="space-between" align="center">
                    <Text
                      fontFamily="body"
                      fontWeight="semibold"
                      fontSize="sm"
                      color="text.secondary"
                    >
                      Your Position
                    </Text>
                    <HStack gap={3}>
                      <Text
                        fontFamily="body"
                        fontWeight="bold"
                        fontSize="sm"
                        color="#30A67F"
                      >
                        ↑ 2 spots
                      </Text>
                      <Badge
                        bg="#2B303B"
                        color="text.primary"
                        borderRadius="full"
                        px={3}
                        py={1}
                        fontSize="lg"
                        fontWeight="bold"
                        fontFamily="display"
                      >
                        #7
                      </Badge>
                    </HStack>
                  </Flex>
                </Box>
              </VStack>
            </Box>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

const PlacementCard = ({
  place,
  subtitle,
  icon,
}: {
  place: string;
  subtitle: string;
  icon: string;
}) => (
  <Box
    flex={1}
    bg="rgba(43, 48, 59, 0.3)"
    border="2px solid"
    borderColor="rgba(48, 53, 65, 0.5)"
    borderRadius="16px"
    p={5}
    textAlign="center"
    minH="128px"
  >
    <VStack gap={2}>
      <Image src={icon} alt="" w="40px" h="40px" />
      <Text
        fontFamily="heading"
        fontSize="md"
        color="text.primary"
      >
        {place}
      </Text>
      <Text
        fontFamily="body"
        fontWeight="semibold"
        fontSize="xs"
        color="text.secondary"
      >
        {subtitle}
      </Text>
    </VStack>
  </Box>
);

const LeaderboardRow = ({
  rank,
  name,
  points,
  change,
  isGold,
}: {
  rank: number;
  name: string;
  points: number;
  change: string;
  isGold: boolean;
}) => {
  const getRankStyle = () => {
    if (isGold) {
      return {
        bg: 'rgba(249, 195, 31, 0.15)',
        borderColor: 'rgba(249, 195, 31, 0.4)',
        boxShadow: '0px 4px 0px 0px #B88F14',
        rankBg: '#F9C31F',
        rankColor: 'text.button',
      };
    }
    if (rank === 2) {
      return {
        bg: 'rgba(43, 48, 59, 0.4)',
        borderColor: 'rgba(48, 53, 65, 0.3)',
        boxShadow: 'none',
        rankBg: 'rgba(248, 246, 242, 0.2)',
        rankColor: 'text.primary',
      };
    }
    if (rank === 3) {
      return {
        bg: 'rgba(43, 48, 59, 0.4)',
        borderColor: 'rgba(48, 53, 65, 0.3)',
        boxShadow: 'none',
        rankBg: 'rgba(237, 115, 29, 0.3)',
        rankColor: '#ED731D',
      };
    }
    return {
      bg: 'rgba(43, 48, 59, 0.2)',
      borderColor: 'transparent',
      boxShadow: 'none',
      rankBg: '#2B303B',
      rankColor: 'text.secondary',
    };
  };

  const style = getRankStyle();

  return (
    <Box
      w="full"
      bg={style.bg}
      border="2px solid"
      borderColor={style.borderColor}
      borderRadius="16px"
      boxShadow={style.boxShadow}
      p={4}
    >
      <Flex justify="space-between" align="center">
        <HStack gap={4}>
          <Box
            bg={style.rankBg}
            borderRadius="12px"
            w="40px"
            h="40px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text
              fontFamily="heading"
              fontSize="md"
              color={style.rankColor}
            >
              {rank}
            </Text>
          </Box>
          <Text
            fontFamily="body"
            fontWeight="bold"
            fontSize="md"
            color="text.primary"
          >
            {name}
          </Text>
        </HStack>
        <HStack gap={4}>
          <Text
            fontFamily="body"
            fontWeight="bold"
            fontSize="sm"
            color="#30A67F"
          >
            {change}
          </Text>
          <Text
            fontFamily="heading"
            fontSize="lg"
            color="text.primary"
          >
            {points}
          </Text>
        </HStack>
      </Flex>
    </Box>
  );
};

export default LeaderboardSection;

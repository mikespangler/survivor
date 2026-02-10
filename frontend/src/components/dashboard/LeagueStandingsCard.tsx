'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  VStack,
  HStack,
  Text,
  Flex,
  Button,
} from '@chakra-ui/react';
import type { DetailedStandingsResponse } from '@/types/api';

interface LeagueStandingsCardProps {
  standings: DetailedStandingsResponse;
  leagueId: string;
}

const RANK_COLORS: Record<number, string> = {
  1: '#f4c842', // gold
  2: '#b0b8c8', // silver
  3: '#cd8e5a', // bronze
};

// Generate a deterministic color for team avatars
function getAvatarColor(name: string): string {
  const colors = ['#e8622a', '#5a7abf', '#6aaa78', '#c45454', '#8a6ec4', '#c47a3a', '#4a9a6a', '#7a5ab0'];
  const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function LeagueStandingsCard({
  standings,
  leagueId,
}: LeagueStandingsCardProps) {
  const router = useRouter();
  const top5 = standings.teams.slice(0, 5);

  // Find the current user's team for sparkline data
  const myTeam = standings.teams.find((t) => t.isCurrentUser);
  const episodeHistory = myTeam?.episodeHistory || [];

  return (
    <Box
      bg="rgba(26, 25, 32, 1)"
      border="1px solid rgba(255,255,255,0.08)"
      borderRadius="14px"
      overflow="hidden"
    >
      {/* Header */}
      <Flex justify="space-between" align="center" px={{ base: '16px', md: '22px' }} pt="18px" pb="14px">
        <Text
          fontFamily="heading"
          fontSize={{ base: '18px', md: '22px' }}
          letterSpacing="1.5px"
          color="text.primary"
        >
          League Standings
        </Text>
        <Button
          variant="link"
          fontFamily="heading"
          fontSize="12px"
          fontWeight="700"
          letterSpacing="2px"
          textTransform="uppercase"
          color="brand.primary"
          _hover={{ color: '#f4a93a' }}
          onClick={() => router.push(`/leagues/${leagueId}/standings`)}
        >
          View Full →
        </Button>
      </Flex>

      {/* Standings rows */}
      <Box px={{ base: '16px', md: '22px' }} pb={episodeHistory.length > 0 ? 0 : '20px'}>
        <VStack gap={0} align="stretch">
          {top5.map((team) => {
            const isYou = team.isCurrentUser;
            const rankColor = RANK_COLORS[team.rank] || 'rgba(90, 86, 102, 1)';
            const trendUp = team.rankChange > 0;
            const trendDown = team.rankChange < 0;

            return (
              <Flex
                key={team.id}
                align="center"
                px={3}
                py="10px"
                borderRadius="8px"
                gap={3}
                cursor="pointer"
                transition="background 0.15s"
                _hover={{ bg: 'rgba(255,255,255,0.03)' }}
                {...(isYou
                  ? {
                      bg: 'rgba(232, 98, 42, 0.08)',
                      border: '1px solid rgba(232, 98, 42, 0.15)',
                    }
                  : {})}
              >
                {/* Rank number */}
                <Text
                  fontFamily="heading"
                  fontSize="20px"
                  w="28px"
                  textAlign="center"
                  flexShrink={0}
                  color={rankColor}
                >
                  {team.rank}
                </Text>

                {/* Avatar */}
                <Flex
                  w="32px"
                  h="32px"
                  borderRadius="8px"
                  align="center"
                  justify="center"
                  fontFamily="heading"
                  fontWeight="700"
                  fontSize="12px"
                  color="white"
                  flexShrink={0}
                  bg={getAvatarColor(team.name)}
                >
                  {team.name.slice(0, 2).toUpperCase()}
                </Flex>

                {/* Name + YOU badge */}
                <Box flex="1" minW={0}>
                  <HStack gap={2}>
                    <Text
                      fontWeight="600"
                      fontSize="14px"
                      color={isYou ? 'brand.primary' : 'text.primary'}
                      whiteSpace="nowrap"
                      overflow="hidden"
                      textOverflow="ellipsis"
                    >
                      {team.name}
                    </Text>
                    {isYou && (
                      <Box
                        fontFamily="heading"
                        fontSize="10px"
                        fontWeight="700"
                        letterSpacing="1.5px"
                        color="brand.primary"
                        bg="rgba(232, 98, 42, 0.15)"
                        px="7px"
                        py="2px"
                        borderRadius="4px"
                        flexShrink={0}
                      >
                        YOU
                      </Box>
                    )}
                  </HStack>
                </Box>

                {/* Points */}
                <Text
                  fontFamily="heading"
                  fontWeight="700"
                  fontSize="16px"
                  color="text.primary"
                  textAlign="right"
                  minW="50px"
                >
                  {team.totalPoints}
                </Text>

                {/* Trend arrow */}
                <Box w="20px" textAlign="center" fontSize="11px" flexShrink={0}>
                  {trendUp && (
                    <Text color="#4ecb71">▲</Text>
                  )}
                  {trendDown && (
                    <Text color="#e85454">▼</Text>
                  )}
                  {!trendUp && !trendDown && (
                    <Text color="text.secondary">—</Text>
                  )}
                </Box>
              </Flex>
            );
          })}
        </VStack>
      </Box>

      {/* Sparkline: Your Points by Week */}
      {episodeHistory.length > 0 && (
        <Box
          mt={4}
          pt={4}
          px={{ base: '16px', md: '22px' }}
          pb="20px"
          borderTop="1px solid rgba(255,255,255,0.05)"
        >
          <Text
            fontFamily="heading"
            fontSize="11px"
            fontWeight="600"
            letterSpacing="2px"
            textTransform="uppercase"
            color="text.secondary"
            mb="10px"
          >
            Your Points by Week
          </Text>

          {/* Bars */}
          <Flex align="flex-end" gap="5px" h="50px">
            {episodeHistory.map((ep, idx) => {
              const maxPts = Math.max(...episodeHistory.map((e) => e.totalEpisodePoints), 1);
              const heightPct = Math.max((ep.totalEpisodePoints / maxPts) * 100, 8);
              const opacity = 0.5 + (idx / Math.max(episodeHistory.length - 1, 1)) * 0.4;

              return (
                <Box
                  key={ep.episodeNumber}
                  flex="1"
                  h={`${heightPct}%`}
                  borderRadius="3px 3px 0 0"
                  bg="brand.primary"
                  opacity={opacity}
                  cursor="pointer"
                  transition="all 0.15s"
                  _hover={{ filter: 'brightness(1.2)' }}
                  position="relative"
                  role="group"
                >
                  <Box
                    display="none"
                    _groupHover={{ display: 'block' }}
                    position="absolute"
                    top="-28px"
                    left="50%"
                    transform="translateX(-50%)"
                    bg="rgba(32, 31, 39, 1)"
                    border="1px solid rgba(255,255,255,0.08)"
                    px={2}
                    py="3px"
                    borderRadius="4px"
                    fontFamily="heading"
                    fontSize="12px"
                    fontWeight="600"
                    color="text.primary"
                    whiteSpace="nowrap"
                    zIndex={2}
                  >
                    +{ep.totalEpisodePoints}
                  </Box>
                </Box>
              );
            })}
          </Flex>

          {/* Week labels */}
          <Flex gap="5px" mt="6px">
            {episodeHistory.map((ep) => (
              <Text
                key={ep.episodeNumber}
                flex="1"
                textAlign="center"
                fontFamily="heading"
                fontSize="10px"
                color="text.secondary"
                fontWeight="500"
              >
                {ep.episodeNumber}
              </Text>
            ))}
          </Flex>
        </Box>
      )}
    </Box>
  );
}

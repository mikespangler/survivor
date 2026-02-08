'use client';

import {
  Box,
  VStack,
  HStack,
  Text,
  Flex,
} from '@chakra-ui/react';
import type { MyTeamResponse } from '@/types/api';

interface MyTeamCardProps {
  myTeam: MyTeamResponse;
}

// Generate a deterministic color for player avatars
function getPlayerColor(name: string): string {
  const colors = ['#5a7abf', '#4a9a6a', '#c47a3a', '#c45454', '#8a6ec4', '#e8622a', '#6aaa78', '#7a5ab0'];
  const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function MyTeamCard({ myTeam }: MyTeamCardProps) {
  const roster = myTeam.roster || [];

  // All roster members, active first
  const activeRoster = roster.filter((r) => r.isActive);
  const eliminatedRoster = roster.filter((r) => !r.isActive);
  const displayRoster = [...activeRoster, ...eliminatedRoster];

  return (
    <Box
      bg="rgba(26, 25, 32, 1)"
      border="1px solid rgba(255,255,255,0.08)"
      borderRadius="14px"
      overflow="hidden"
    >
      {/* Header */}
      <Box px="22px" pt="18px" pb="14px">
        <Text
          fontFamily="heading"
          fontSize="22px"
          letterSpacing="1.5px"
          color="text.primary"
        >
          My Team — {myTeam.name}
        </Text>
      </Box>

      <Box px="22px" pb="20px">
        {/* Segmented Stat Bar */}
        <Flex
          gap="2px"
          mb={4}
          bg="rgba(11, 10, 15, 1)"
          borderRadius="10px"
          p="3px"
        >
          <Box flex="1" textAlign="center" py={3} px={2} borderRadius="8px" bg="rgba(32, 31, 39, 1)">
            <Text fontFamily="heading" fontSize="28px" lineHeight="1" color="#4ecb71">
              {myTeam.stats.activeCastaways}
            </Text>
            <Text
              fontFamily="heading"
              fontSize="10px"
              fontWeight="600"
              letterSpacing="2px"
              textTransform="uppercase"
              color="text.secondary"
              mt="4px"
            >
              Active
            </Text>
          </Box>
          <Box flex="1" textAlign="center" py={3} px={2} borderRadius="8px">
            <Text fontFamily="heading" fontSize="28px" lineHeight="1" color="#e85454">
              {myTeam.stats.eliminatedCastaways}
            </Text>
            <Text
              fontFamily="heading"
              fontSize="10px"
              fontWeight="600"
              letterSpacing="2px"
              textTransform="uppercase"
              color="text.secondary"
              mt="4px"
            >
              Eliminated
            </Text>
          </Box>
          <Box flex="1" textAlign="center" py={3} px={2} borderRadius="8px">
            <Text fontFamily="heading" fontSize="28px" lineHeight="1" color="brand.primary">
              {myTeam.totalPoints}
            </Text>
            <Text
              fontFamily="heading"
              fontSize="10px"
              fontWeight="600"
              letterSpacing="2px"
              textTransform="uppercase"
              color="text.secondary"
              mt="4px"
            >
              Total Pts
            </Text>
          </Box>
        </Flex>

        {/* Player Rows */}
        <VStack gap={0} align="stretch">
          {displayRoster.map((member, idx) => {
            const isEliminated = !member.isActive || member.castaway.status === 'ELIMINATED';
            const castaway = member.castaway;

            return (
              <HStack
                key={member.id}
                gap={3}
                py="9px"
                borderBottom={idx < displayRoster.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'}
                opacity={isEliminated ? 0.5 : 1}
              >
                {/* Avatar with status dot */}
                <Box position="relative" flexShrink={0}>
                  <Flex
                    w="38px"
                    h="38px"
                    borderRadius="50%"
                    align="center"
                    justify="center"
                    fontFamily="heading"
                    fontWeight="700"
                    fontSize="13px"
                    color="white"
                    bg={getPlayerColor(castaway.name)}
                  >
                    {castaway.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </Flex>
                  <Box
                    position="absolute"
                    bottom={0}
                    right={0}
                    w="10px"
                    h="10px"
                    borderRadius="50%"
                    border="2px solid rgba(26, 25, 32, 1)"
                    bg={isEliminated ? '#e85454' : '#4ecb71'}
                  />
                </Box>

                {/* Name + tribe */}
                <Box flex="1">
                  <Text
                    fontWeight="600"
                    fontSize="14px"
                    color="text.primary"
                    textDecoration={isEliminated ? 'line-through' : 'none'}
                  >
                    {castaway.name}
                  </Text>
                  {/* Tribe info placeholder - would come from castaway data */}
                  <Text fontSize="12px" color="text.secondary" fontWeight="500">
                    {castaway.status === 'ELIMINATED'
                      ? 'Eliminated'
                      : castaway.status === 'JURY'
                        ? 'Jury'
                        : 'Active'}
                  </Text>
                </Box>

                {/* Points */}
                <HStack gap={1} flexShrink={0}>
                  <Text color="brand.primary" fontSize="12px">★</Text>
                  <Text
                    fontFamily="heading"
                    fontWeight="700"
                    fontSize="15px"
                    color="#f4a93a"
                  >
                    {/* Points per castaway not available in current API, show dash */}
                    —
                  </Text>
                </HStack>
              </HStack>
            );
          })}
        </VStack>
      </Box>
    </Box>
  );
}

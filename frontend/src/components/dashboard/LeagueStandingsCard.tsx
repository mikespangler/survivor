'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  Flex,
  Button,
} from '@chakra-ui/react';
import { ArrowUpIcon, ArrowDownIcon } from './icons';
import type { LeagueStandings, MyTeamResponse } from '@/types/api';

interface LeagueStandingsCardProps {
  standings: LeagueStandings;
  myTeam: MyTeamResponse | null;
  leagueId: string;
  // Mock rank changes - would come from API in production
  rankChanges?: Record<string, 'up' | 'down' | 'same'>;
}

// Mock rank changes for demo
const mockRankChanges: Record<string, 'up' | 'down' | 'same'> = {};

export function LeagueStandingsCard({
  standings,
  myTeam,
  leagueId,
  rankChanges = mockRankChanges,
}: LeagueStandingsCardProps) {
  const router = useRouter();
  const top3 = standings.teams.slice(0, 3);
  const userRank = myTeam?.rank || 0;

  // Get teams for display below top 3 (user's position and one below if not in top 3)
  const getExtraTeams = () => {
    if (userRank <= 3) {
      // User is in top 3, show 4th and 5th
      return standings.teams.slice(3, 5);
    }
    // User not in top 3, show their position and the one after
    const userIndex = standings.teams.findIndex((t) => t.isCurrentUser);
    if (userIndex >= 0) {
      return standings.teams.slice(userIndex, Math.min(userIndex + 2, standings.teams.length));
    }
    return [];
  };

  const extraTeams = getExtraTeams();

  const getRankChange = (teamId: string) => {
    // Assign random changes for demo purposes
    const hash = teamId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return hash % 3 === 0 ? 'up' : hash % 3 === 1 ? 'down' : 'up';
  };

  const RankChangeIndicator = ({ teamId }: { teamId: string }) => {
    const change = rankChanges[teamId] || getRankChange(teamId);
    const isUp = change === 'up';
    const bgColor = isUp ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)';

    return (
      <Flex
        bg={bgColor}
        borderRadius="full"
        boxSize="24px"
        align="center"
        justify="center"
      >
        {isUp ? (
          <ArrowUpIcon boxSize="14px" color="#4CAF50" />
        ) : (
          <ArrowDownIcon boxSize="14px" color="#F44336" />
        )}
      </Flex>
    );
  };

  return (
    <VStack align="stretch" gap={4} flex="1">
      {/* Header */}
      <HStack justify="space-between">
        <Text fontFamily="display" fontSize="24px" fontWeight="bold" color="text.primary">
          League Standings
        </Text>
        <Button
          variant="link"
          color="brand.primary"
          fontSize="14px"
          fontWeight="bold"
          onClick={() => router.push(`/leagues/${leagueId}/standings`)}
        >
          View Full →
        </Button>
      </HStack>

      {/* Card */}
      <Box
        bg="linear-gradient(146.157deg, rgb(33, 38, 48) 2.5008%, rgb(25, 29, 36) 97.499%)"
        border="2px solid"
        borderColor="rgba(43, 48, 59, 0.5)"
        borderRadius="24px"
        overflow="hidden"
        flex="1"
      >
        {/* Top 3 */}
        <HStack
          justify="space-around"
          p={6}
          borderBottom="2px solid"
          borderColor="rgba(48, 53, 65, 0.5)"
        >
          {top3.map((team, idx) => (
            <VStack key={team.id} gap={2}>
              <Text
                fontFamily="display"
                fontSize="20px"
                fontWeight="bold"
                color="text.secondary"
                lineHeight="30px"
              >
                {idx + 1}
              </Text>
              <VStack gap={4}>
                <Avatar
                  size="lg"
                  name={team.name}
                  src={team.logoImageUrl || undefined}
                  borderRadius="12px"
                  bg="rgba(48, 53, 65, 0.5)"
                />
                <Text
                  fontFamily="body"
                  fontSize="20px"
                  fontWeight="bold"
                  color="text.primary"
                >
                  {team.name}
                </Text>
              </VStack>
              <HStack gap={3}>
                <HStack gap={0}>
                  <Text
                    fontFamily="display"
                    fontSize="20px"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    {team.totalPoints}
                  </Text>
                  <Text fontSize="12px" fontWeight="medium" color="text.secondary" ml={1}>
                    pts
                  </Text>
                </HStack>
                <RankChangeIndicator teamId={team.id} />
              </HStack>
            </VStack>
          ))}
        </HStack>

        {/* Extra rows (user position or 4th/5th place) */}
        <VStack align="stretch" gap={0}>
          {extraTeams.map((team, idx) => (
            <HStack
              key={team.id}
              justify="space-between"
              px={3}
              py={4}
              bg={team.isCurrentUser ? 'rgba(240, 101, 66, 0.05)' : 'transparent'}
              borderTop={idx > 0 ? '1px solid' : 'none'}
              borderColor="rgba(48, 53, 65, 0.5)"
            >
              <HStack gap={8}>
                <Text
                  fontFamily="display"
                  fontSize="20px"
                  fontWeight="bold"
                  color="text.secondary"
                  w="24px"
                  textAlign="center"
                >
                  {team.rank}
                </Text>
                <HStack gap={4}>
                  <Flex
                    bg="rgba(240, 101, 66, 0.1)"
                    border="1px solid"
                    borderColor="rgba(240, 101, 66, 0.2)"
                    borderRadius="full"
                    boxSize="48px"
                    align="center"
                    justify="center"
                  >
                    <Text
                      fontFamily="display"
                      fontSize="16px"
                      fontWeight="bold"
                      color="brand.primary"
                    >
                      {team.name.slice(0, 2).toUpperCase()}
                    </Text>
                  </Flex>
                  <HStack gap={2}>
                    <Text
                      fontFamily="body"
                      fontSize="16px"
                      fontWeight="bold"
                      color="text.primary"
                    >
                      {team.name}
                    </Text>
                    {team.isCurrentUser && (
                      <Badge
                        bg="rgba(240, 101, 66, 0.2)"
                        border="1px solid"
                        borderColor="rgba(240, 101, 66, 0.3)"
                        color="brand.primary"
                        fontSize="10px"
                        fontWeight="bold"
                        px={2}
                        borderRadius="6px"
                        textTransform="uppercase"
                        letterSpacing="0.5px"
                      >
                        YOU
                      </Badge>
                    )}
                  </HStack>
                </HStack>
              </HStack>
              <HStack gap={3}>
                <HStack gap={0}>
                  <Text
                    fontFamily="display"
                    fontSize="18px"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    {team.totalPoints}
                  </Text>
                  <Text fontSize="12px" fontWeight="medium" color="text.secondary" ml={1}>
                    pts
                  </Text>
                </HStack>
                <RankChangeIndicator teamId={team.id} />
              </HStack>
            </HStack>
          ))}
        </VStack>
      </Box>
    </VStack>
  );
}

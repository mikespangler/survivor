'use client';

import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { ArrowUpIcon, ArrowDownIcon } from '../dashboard/icons';
import type { DetailedStandingsTeam } from '@/types/api';

interface OverallStandingsTabProps {
  teams: DetailedStandingsTeam[];
  currentEpisode: number;
}

export function OverallStandingsTab({ teams, currentEpisode }: OverallStandingsTabProps) {
  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  const getRankChangeIndicator = (rankChange: number) => {
    if (rankChange > 0) {
      return (
        <HStack gap={1} color="green.500">
          <ArrowUpIcon />
          <Text fontSize="sm">{rankChange}</Text>
        </HStack>
      );
    } else if (rankChange < 0) {
      return (
        <HStack gap={1} color="red.500">
          <ArrowDownIcon />
          <Text fontSize="sm">{Math.abs(rankChange)}</Text>
        </HStack>
      );
    }
    return (
      <Text fontSize="sm" color="gray.500">
        -
      </Text>
    );
  };

  const getThisWeekPoints = (team: DetailedStandingsTeam) => {
    const thisEpisode = team.episodeHistory.find(
      (ep) => ep.episodeNumber === currentEpisode,
    );
    return thisEpisode?.totalEpisodePoints || 0;
  };

  return (
    <Box
      borderRadius="24px"
      overflow="hidden"
      borderWidth="1px"
      borderColor="gray.200"
      bg="white"
    >
      <Table variant="simple">
        <Thead bg="orange.50">
          <Tr>
            <Th>Rank</Th>
            <Th>Team</Th>
            <Th>Owner</Th>
            <Th isNumeric>Total Points</Th>
            <Th isNumeric>This Week</Th>
            <Th textAlign="center">Change</Th>
          </Tr>
        </Thead>
        <Tbody>
          {teams.map((team) => {
            const medal = getMedalEmoji(team.rank);
            const thisWeekPoints = getThisWeekPoints(team);

            return (
              <Tr
                key={team.id}
                bg={team.isCurrentUser ? 'orange.50' : undefined}
                fontWeight={team.isCurrentUser ? 'semibold' : 'normal'}
              >
                <Td>
                  <HStack gap={2}>
                    {medal && <Text fontSize="xl">{medal}</Text>}
                    <Text>{team.rank}</Text>
                  </HStack>
                </Td>
                <Td>
                  <HStack gap={2}>
                    <Text>{team.name}</Text>
                    {team.isCurrentUser && (
                      <Badge colorScheme="orange" fontSize="xs">
                        You
                      </Badge>
                    )}
                  </HStack>
                </Td>
                <Td>
                  <Text color="gray.600">{team.owner.name || team.owner.email}</Text>
                </Td>
                <Td isNumeric>
                  <Text fontSize="lg" fontWeight="bold">
                    {team.totalPoints}
                  </Text>
                </Td>
                <Td isNumeric>
                  <Text fontSize="md" color={thisWeekPoints > 0 ? 'green.600' : 'gray.500'}>
                    {thisWeekPoints > 0 ? `+${thisWeekPoints}` : thisWeekPoints}
                  </Text>
                </Td>
                <Td textAlign="center">{getRankChangeIndicator(team.rankChange)}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
}

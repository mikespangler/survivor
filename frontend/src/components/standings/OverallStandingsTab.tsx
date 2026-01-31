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
        <HStack gap={0.5} color="green.500">
          <ArrowUpIcon boxSize="12px" />
          <Text fontSize="xs" fontWeight="medium">{rankChange}</Text>
        </HStack>
      );
    } else if (rankChange < 0) {
      return (
        <HStack gap={0.5} color="red.500">
          <ArrowDownIcon boxSize="12px" />
          <Text fontSize="xs" fontWeight="medium">{Math.abs(rankChange)}</Text>
        </HStack>
      );
    }
    return (
      <Text fontSize="xs" color="text.secondary">
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
      borderRadius="16px"
      overflow="hidden"
      borderWidth="1px"
      borderColor="border.default"
      bg="bg.secondary"
    >
      <Table variant="simple" size="sm">
        <Thead bg="bg.primary">
          <Tr>
            <Th py={2} fontSize="xs" textTransform="uppercase">Rank</Th>
            <Th py={2} fontSize="xs" textTransform="uppercase">Team</Th>
            <Th py={2} fontSize="xs" textTransform="uppercase">Owner</Th>
            <Th py={2} fontSize="xs" textTransform="uppercase" isNumeric>Total Points</Th>
            <Th py={2} fontSize="xs" textTransform="uppercase" isNumeric>This Week</Th>
            <Th py={2} fontSize="xs" textTransform="uppercase" textAlign="center">Change</Th>
          </Tr>
        </Thead>
        <Tbody>
          {teams.map((team) => {
            const medal = getMedalEmoji(team.rank);
            const thisWeekPoints = getThisWeekPoints(team);

            return (
              <Tr
                key={team.id}
                bg={team.isCurrentUser ? 'bg.overlay' : undefined}
                borderLeftWidth={team.isCurrentUser ? '3px' : '0'}
                borderLeftColor={team.isCurrentUser ? 'brand.primary' : undefined}
                fontWeight={team.isCurrentUser ? 'semibold' : 'normal'}
              >
                <Td py={2}>
                  <HStack gap={1.5}>
                    {medal && <Text fontSize="md">{medal}</Text>}
                    <Text fontSize="sm">{team.rank}</Text>
                  </HStack>
                </Td>
                <Td py={2}>
                  <HStack gap={2}>
                    <Text fontSize="sm">{team.name}</Text>
                    {team.isCurrentUser && (
                      <Badge colorScheme="orange" fontSize="2xs" px={1.5} py={0.5}>
                        You
                      </Badge>
                    )}
                  </HStack>
                </Td>
                <Td py={2}>
                  <Text fontSize="sm" color="text.secondary">{team.owner.name || team.owner.email}</Text>
                </Td>
                <Td py={2} isNumeric>
                  <Text fontSize="md" fontWeight="bold">
                    {team.totalPoints}
                  </Text>
                </Td>
                <Td py={2} isNumeric>
                  <Text fontSize="sm" color={thisWeekPoints > 0 ? 'green.600' : 'text.secondary'}>
                    {thisWeekPoints > 0 ? `+${thisWeekPoints}` : thisWeekPoints}
                  </Text>
                </Td>
                <Td py={2} textAlign="center">{getRankChangeIndicator(team.rankChange)}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
}

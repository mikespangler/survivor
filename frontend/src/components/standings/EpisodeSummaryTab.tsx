'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { ArrowUpIcon, ArrowDownIcon } from '../dashboard/icons';
import type { DetailedStandingsTeam } from '@/types/api';

interface EpisodeSummaryTabProps {
  teams: DetailedStandingsTeam[];
  currentEpisode: number;
}

type SortColumn = 'team' | number | 'total';
type SortDirection = 'asc' | 'desc';

export function EpisodeSummaryTab({ teams, currentEpisode }: EpisodeSummaryTabProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('total');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const episodes = Array.from({ length: currentEpisode }, (_, i) => i + 1);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection(column === 'team' ? 'asc' : 'desc');
    }
  };

  const sortedTeams = useMemo(() => {
    const sorted = [...teams];

    sorted.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortColumn === 'team') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (sortColumn === 'total') {
        aValue = a.totalPoints;
        bValue = b.totalPoints;
      } else {
        // Episode number
        const aEpisode = a.episodeHistory.find((ep) => ep.episodeNumber === sortColumn);
        const bEpisode = b.episodeHistory.find((ep) => ep.episodeNumber === sortColumn);
        aValue = aEpisode?.totalEpisodePoints || 0;
        bValue = bEpisode?.totalEpisodePoints || 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return sorted;
  }, [teams, sortColumn, sortDirection]);

  const SortIndicator = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null;

    return sortDirection === 'asc' ? (
      <ArrowUpIcon boxSize="12px" />
    ) : (
      <ArrowDownIcon boxSize="12px" />
    );
  };

  return (
    <VStack align="stretch" gap={4}>
      <Text fontSize="md" fontWeight="semibold">
        Episode Performance
      </Text>

      <Box
        borderRadius="16px"
        overflow="hidden"
        borderWidth="1px"
        borderColor="border.default"
        bg="bg.secondary"
        overflowX="auto"
      >
        <Table variant="simple" size="sm">
          <Thead bg="bg.primary">
            <Tr>
              <Th
                py={2}
                fontSize="xs"
                textTransform="uppercase"
                cursor="pointer"
                onClick={() => handleSort('team')}
                _hover={{ bg: 'bg.overlay' }}
              >
                <HStack gap={1}>
                  <Text>Team</Text>
                  <SortIndicator column="team" />
                </HStack>
              </Th>
              {episodes.map((ep) => (
                <Th
                  key={ep}
                  py={2}
                  fontSize="xs"
                  textTransform="uppercase"
                  isNumeric
                  cursor="pointer"
                  onClick={() => handleSort(ep)}
                  _hover={{ bg: 'bg.overlay' }}
                >
                  <HStack gap={1} justify="flex-end">
                    <Text>Ep {ep}</Text>
                    <SortIndicator column={ep} />
                  </HStack>
                </Th>
              ))}
              <Th
                py={2}
                fontSize="xs"
                textTransform="uppercase"
                isNumeric
                cursor="pointer"
                onClick={() => handleSort('total')}
                _hover={{ bg: 'bg.overlay' }}
              >
                <HStack gap={1} justify="flex-end">
                  <Text>Total</Text>
                  <SortIndicator column="total" />
                </HStack>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedTeams.map((team) => {
              return (
                <Tr
                  key={team.id}
                  bg={team.isCurrentUser ? 'bg.overlay' : undefined}
                  borderLeftWidth={team.isCurrentUser ? '3px' : '0'}
                  borderLeftColor={team.isCurrentUser ? 'brand.primary' : undefined}
                >
                  <Td py={2} fontWeight={team.isCurrentUser ? 'semibold' : 'normal'} fontSize="sm">
                    {team.name}
                  </Td>
                  {episodes.map((episodeNum) => {
                    const episodeData = team.episodeHistory.find(
                      (ep) => ep.episodeNumber === episodeNum
                    );
                    const points = episodeData?.totalEpisodePoints || 0;

                    return (
                      <Td key={episodeNum} py={2} isNumeric fontSize="sm">
                        {points}
                      </Td>
                    );
                  })}
                  <Td py={2} isNumeric fontWeight="bold" fontSize="sm">
                    {team.totalPoints}
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    </VStack>
  );
}

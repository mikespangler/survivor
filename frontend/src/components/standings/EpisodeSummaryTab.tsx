'use client';

import { useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Select,
  VStack,
  HStack,
} from '@chakra-ui/react';
import type { DetailedStandingsTeam } from '@/types/api';

interface EpisodeSummaryTabProps {
  teams: DetailedStandingsTeam[];
  currentEpisode: number;
}

export function EpisodeSummaryTab({ teams, currentEpisode }: EpisodeSummaryTabProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<number | 'all'>('all');

  const episodes = Array.from({ length: currentEpisode }, (_, i) => i + 1);

  const getEpisodeData = (team: DetailedStandingsTeam, episodeNum: number) => {
    return team.episodeHistory.find((ep) => ep.episodeNumber === episodeNum);
  };

  const renderEpisodeData = (episodeNum: number) => {
    return (
      <Box key={episodeNum} mb={6}>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Episode {episodeNum}
        </Text>
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
                <Th>Team</Th>
                <Th isNumeric>Question Points</Th>
                <Th isNumeric>Retention Points</Th>
                <Th isNumeric>Episode Total</Th>
              </Tr>
            </Thead>
            <Tbody>
              {teams.map((team) => {
                const episodeData = getEpisodeData(team, episodeNum);

                return (
                  <Tr
                    key={team.id}
                    bg={team.isCurrentUser ? 'orange.50' : undefined}
                  >
                    <Td fontWeight={team.isCurrentUser ? 'semibold' : 'normal'}>
                      {team.name}
                    </Td>
                    <Td isNumeric>{episodeData?.questionPoints || 0}</Td>
                    <Td isNumeric>{episodeData?.retentionPoints || 0}</Td>
                    <Td isNumeric fontWeight="bold">
                      {episodeData?.totalEpisodePoints || 0}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </Box>
    );
  };

  const renderAllEpisodes = () => {
    return (
      <VStack align="stretch" gap={6}>
        {episodes.map((episodeNum) => renderEpisodeData(episodeNum))}
      </VStack>
    );
  };

  return (
    <VStack align="stretch" gap={6}>
      <HStack justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="semibold">
          Episode Performance
        </Text>
        <Select
          value={selectedEpisode}
          onChange={(e) =>
            setSelectedEpisode(
              e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10),
            )
          }
          maxW="250px"
          borderRadius="12px"
        >
          <option value="all">All Episodes</option>
          {episodes.map((ep) => (
            <option key={ep} value={ep}>
              Episode {ep}
            </option>
          ))}
        </Select>
      </HStack>

      {selectedEpisode === 'all'
        ? renderAllEpisodes()
        : renderEpisodeData(selectedEpisode as number)}
    </VStack>
  );
}

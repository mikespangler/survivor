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
  Badge,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import type { DetailedStandingsTeam } from '@/types/api';

interface CastawayRetentionTabProps {
  teams: DetailedStandingsTeam[];
  currentEpisode: number;
}

export function CastawayRetentionTab({
  teams,
  currentEpisode,
}: CastawayRetentionTabProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<number>(currentEpisode);

  const episodes = Array.from({ length: currentEpisode }, (_, i) => i + 1);

  const getActiveCastaways = (team: DetailedStandingsTeam, episodeNum: number) => {
    return team.roster.filter(
      (c) =>
        c.startEpisode <= episodeNum &&
        (c.endEpisode === null || c.endEpisode >= episodeNum),
    );
  };

  const getRetentionPoints = (team: DetailedStandingsTeam, episodeNum: number) => {
    const episodeData = team.episodeHistory.find((ep) => ep.episodeNumber === episodeNum);
    return episodeData?.retentionPoints || 0;
  };

  return (
    <VStack align="stretch" gap={4}>
      <HStack justify="space-between" align="center">
        <Text fontSize="md" fontWeight="semibold">
          Castaway Retention by Episode
        </Text>
        <Select
          value={selectedEpisode}
          onChange={(e) => setSelectedEpisode(parseInt(e.target.value, 10))}
          maxW="200px"
          size="sm"
          borderRadius="8px"
        >
          {episodes.map((ep) => (
            <option key={ep} value={ep}>
              Episode {ep}
            </option>
          ))}
        </Select>
      </HStack>

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
              <Th py={2} fontSize="xs" textTransform="uppercase">Team</Th>
              <Th py={2} fontSize="xs" textTransform="uppercase">Active Castaways</Th>
              <Th py={2} fontSize="xs" textTransform="uppercase" isNumeric>Retention Points</Th>
            </Tr>
          </Thead>
          <Tbody>
            {teams.map((team) => {
              const activeCastaways = getActiveCastaways(team, selectedEpisode);
              const retentionPoints = getRetentionPoints(team, selectedEpisode);

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
                  <Td py={2}>
                    <Wrap gap={1.5}>
                      {activeCastaways.length > 0 ? (
                        activeCastaways.map((castaway) => (
                          <WrapItem key={castaway.id}>
                            <Badge
                              colorScheme={castaway.isActive ? 'green' : 'gray'}
                              fontSize="xs"
                              px={1.5}
                              py={0.5}
                              borderRadius="6px"
                            >
                              {castaway.castawayName}
                            </Badge>
                          </WrapItem>
                        ))
                      ) : (
                        <Text fontSize="xs" color="text.secondary">
                          No active castaways
                        </Text>
                      )}
                    </Wrap>
                  </Td>
                  <Td py={2} isNumeric fontWeight="bold" fontSize="sm">
                    {retentionPoints}
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

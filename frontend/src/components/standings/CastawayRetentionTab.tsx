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
    <VStack align="stretch" gap={6}>
      <HStack justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="semibold">
          Castaway Retention by Episode
        </Text>
        <Select
          value={selectedEpisode}
          onChange={(e) => setSelectedEpisode(parseInt(e.target.value, 10))}
          maxW="250px"
          borderRadius="12px"
        >
          {episodes.map((ep) => (
            <option key={ep} value={ep}>
              Episode {ep}
            </option>
          ))}
        </Select>
      </HStack>

      <Box
        borderRadius="24px"
        overflow="hidden"
        borderWidth="1px"
        borderColor="border.default"
        bg="bg.secondary"
      >
        <Table variant="simple">
          <Thead bg="bg.primary">
            <Tr>
              <Th>Team</Th>
              <Th>Active Castaways</Th>
              <Th isNumeric>Retention Points</Th>
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
                  borderLeftWidth={team.isCurrentUser ? '4px' : '0'}
                  borderLeftColor={team.isCurrentUser ? 'brand.primary' : undefined}
                >
                  <Td fontWeight={team.isCurrentUser ? 'semibold' : 'normal'}>
                    {team.name}
                  </Td>
                  <Td>
                    <Wrap>
                      {activeCastaways.length > 0 ? (
                        activeCastaways.map((castaway) => (
                          <WrapItem key={castaway.id}>
                            <Badge
                              colorScheme={castaway.isActive ? 'green' : 'gray'}
                              fontSize="sm"
                              px={2}
                              py={1}
                              borderRadius="8px"
                            >
                              {castaway.castawayName}
                            </Badge>
                          </WrapItem>
                        ))
                      ) : (
                        <Text fontSize="sm" color="text.secondary">
                          No active castaways
                        </Text>
                      )}
                    </Wrap>
                  </Td>
                  <Td isNumeric fontWeight="bold">
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

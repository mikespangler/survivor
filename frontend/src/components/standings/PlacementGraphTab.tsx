'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItemOption,
  MenuOptionGroup,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
  Input,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { DetailedStandingsTeam } from '@/types/api';

type FilterMode = 'all' | 'top10' | 'custom';

interface PlacementGraphTabProps {
  teams: DetailedStandingsTeam[];
  currentEpisode: number;
}

// Color palette for team lines (works on dark background)
const TEAM_COLORS = [
  '#8B5CF6', // violet
  '#06B6D4', // cyan
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#EC4899', // pink
  '#6366F1', // indigo
  '#14B8A6', // teal
  '#84CC16', // lime
  '#F97316', // orange (different from brand)
];

const BRAND_ORANGE = '#F97316';

interface PlacementDataPoint {
  episode: number;
  [teamId: string]: number | string;
}

export function PlacementGraphTab({ teams, currentEpisode }: PlacementGraphTabProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(new Set());
  const [teamSearchQuery, setTeamSearchQuery] = useState('');

  // Get top 10 teams by current rank
  const top10TeamIds = useMemo(() => {
    return new Set(
      teams
        .slice()
        .sort((a, b) => a.rank - b.rank)
        .slice(0, 10)
        .map((t) => t.id)
    );
  }, [teams]);

  // Determine which teams to display based on filter mode
  const displayedTeams = useMemo(() => {
    const currentUserTeam = teams.find((t) => t.isCurrentUser);

    switch (filterMode) {
      case 'top10': {
        const filtered = teams.filter((t) => top10TeamIds.has(t.id));
        // Always include current user's team
        if (currentUserTeam && !top10TeamIds.has(currentUserTeam.id)) {
          filtered.push(currentUserTeam);
        }
        return filtered.sort((a, b) => a.rank - b.rank);
      }
      case 'custom': {
        if (selectedTeamIds.size === 0) {
          // If no teams selected, show current user's team by default
          return currentUserTeam ? [currentUserTeam] : [];
        }
        const filtered = teams.filter((t) => selectedTeamIds.has(t.id));
        // Always include current user's team
        if (currentUserTeam && !selectedTeamIds.has(currentUserTeam.id)) {
          filtered.push(currentUserTeam);
        }
        return filtered.sort((a, b) => a.rank - b.rank);
      }
      default:
        return teams;
    }
  }, [teams, filterMode, selectedTeamIds, top10TeamIds]);

  const toggleTeamSelection = (teamId: string) => {
    setSelectedTeamIds((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }
      return next;
    });
  };

  const { chartData, teamColorMap, episodeCount } = useMemo(() => {
    if (teams.length === 0 || currentEpisode === 0) {
      return { chartData: [], teamColorMap: new Map<string, string>(), episodeCount: 0 };
    }

    // Find all episodes that have been played
    const allEpisodes = new Set<number>();
    teams.forEach((team) => {
      team.episodeHistory.forEach((ep) => {
        allEpisodes.add(ep.episodeNumber);
      });
    });

    const sortedEpisodes = Array.from(allEpisodes).sort((a, b) => a - b);
    const episodeCount = sortedEpisodes.length;

    // Build chart data: for each episode, calculate placements based on ALL teams
    const chartData: PlacementDataPoint[] = sortedEpisodes.map((episodeNumber) => {
      // Get running totals for all teams at this episode
      const teamsWithTotals = teams.map((team) => {
        const episodeData = team.episodeHistory.find(
          (ep) => ep.episodeNumber === episodeNumber
        );
        return {
          teamId: team.id,
          runningTotal: episodeData?.runningTotal ?? 0,
        };
      });

      // Sort by running total (descending) to determine placements
      const sorted = [...teamsWithTotals].sort((a, b) => b.runningTotal - a.runningTotal);

      // Assign placements (handle ties)
      const placements = new Map<string, number>();
      let currentPlacement = 1;
      for (let i = 0; i < sorted.length; i++) {
        if (i > 0 && sorted[i].runningTotal < sorted[i - 1].runningTotal) {
          currentPlacement = i + 1;
        }
        placements.set(sorted[i].teamId, currentPlacement);
      }

      // Build data point only for displayed teams
      const dataPoint: PlacementDataPoint = { episode: episodeNumber };
      displayedTeams.forEach((team) => {
        dataPoint[team.id] = placements.get(team.id) ?? teams.length;
      });

      return dataPoint;
    });

    // Assign colors: current user gets brand orange, others cycle through palette
    const teamColorMap = new Map<string, string>();
    let colorIndex = 0;

    // First pass: assign brand orange to current user
    displayedTeams.forEach((team) => {
      if (team.isCurrentUser) {
        teamColorMap.set(team.id, BRAND_ORANGE);
      }
    });

    // Second pass: assign other colors
    displayedTeams.forEach((team) => {
      if (!team.isCurrentUser) {
        teamColorMap.set(team.id, TEAM_COLORS[colorIndex % TEAM_COLORS.length]);
        colorIndex++;
      }
    });

    return { chartData, teamColorMap, episodeCount };
  }, [teams, displayedTeams, currentEpisode]);

  if (currentEpisode === 0 || chartData.length === 0) {
    return (
      <Box
        borderRadius="16px"
        overflow="hidden"
        borderWidth="1px"
        borderColor="border.default"
        bg="bg.secondary"
        p={8}
      >
        <VStack gap={4}>
          <Text color="text.secondary" fontSize="lg">
            No episodes have been scored yet.
          </Text>
          <Text color="text.tertiary" fontSize="sm">
            Placement history will appear here after the first episode is scored.
          </Text>
        </VStack>
      </Box>
    );
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ dataKey: string; value: number; color: string }>;
    label?: number;
  }) => {
    if (!active || !payload || payload.length === 0) return null;

    // Sort by placement (value)
    const sortedPayload = [...payload].sort((a, b) => a.value - b.value);

    return (
      <Box
        bg="bg.primary"
        borderWidth="1px"
        borderColor="border.default"
        borderRadius="8px"
        p={3}
        boxShadow="lg"
        zIndex={10}
        position="relative"
      >
        <Text fontWeight="bold" mb={2}>
          Episode {label}
        </Text>
        {sortedPayload.map((entry) => {
          const team = displayedTeams.find((t) => t.id === entry.dataKey);
          if (!team) return null;

          const placementSuffix = getOrdinalSuffix(entry.value);
          return (
            <Box key={entry.dataKey} display="flex" alignItems="center" gap={2} py={0.5}>
              <Box
                w="10px"
                h="10px"
                borderRadius="full"
                bg={entry.color}
              />
              <Text fontSize="sm" color="text.primary">
                {entry.value}{placementSuffix} - {team.name}
                {team.isCurrentUser && ' (You)'}
              </Text>
            </Box>
          );
        })}
      </Box>
    );
  };

  // Teams available for custom selection (exclude current user since they're always shown)
  const selectableTeams = teams.filter((t) => !t.isCurrentUser).sort((a, b) => a.rank - b.rank);

  // Filter selectable teams based on search query
  const filteredTeams = useMemo(() => {
    if (!teamSearchQuery.trim()) {
      return selectableTeams;
    }
    const query = teamSearchQuery.toLowerCase();
    return selectableTeams.filter((team) => team.name.toLowerCase().includes(query));
  }, [selectableTeams, teamSearchQuery]);

  return (
    <Box
      borderRadius="16px"
      overflow="hidden"
      borderWidth="1px"
      borderColor="border.default"
      bg="bg.secondary"
      p={4}
    >
      {/* Filter controls */}
      <HStack mb={4} flexWrap="wrap" gap={3}>
        <HStack gap={2}>
          <Text fontSize="sm" color="text.secondary" fontWeight="medium">
            Show:
          </Text>
          <HStack gap={1}>
            <Button
              size="sm"
              variant={filterMode === 'all' ? 'solid' : 'outline'}
              colorScheme={filterMode === 'all' ? 'orange' : 'gray'}
              onClick={() => setFilterMode('all')}
            >
              All Teams
            </Button>
            <Button
              size="sm"
              variant={filterMode === 'top10' ? 'solid' : 'outline'}
              colorScheme={filterMode === 'top10' ? 'orange' : 'gray'}
              onClick={() => setFilterMode('top10')}
            >
              Top 10
            </Button>
            <Menu closeOnSelect={false} onClose={() => setTeamSearchQuery('')}>
              <MenuButton
                as={Button}
                size="sm"
                variant={filterMode === 'custom' ? 'solid' : 'outline'}
                colorScheme={filterMode === 'custom' ? 'orange' : 'gray'}
                rightIcon={<ChevronDownIcon />}
                onClick={() => setFilterMode('custom')}
              >
                Custom
              </MenuButton>
              <MenuList maxH="300px" overflowY="auto" bg="gray.800" borderColor="gray.600">
                <Box p={2} position="sticky" top={0} bg="gray.800" zIndex={1}>
                  <Input
                    placeholder="Search teams..."
                    value={teamSearchQuery}
                    onChange={(e) => setTeamSearchQuery(e.target.value)}
                    size="sm"
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    _placeholder={{ color: 'gray.400' }}
                  />
                </Box>
                <MenuOptionGroup
                  type="checkbox"
                  value={Array.from(selectedTeamIds)}
                  onChange={(values) => setSelectedTeamIds(new Set(values as string[]))}
                >
                  {filteredTeams.map((team) => (
                    <MenuItemOption
                      key={team.id}
                      value={team.id}
                      bg="gray.800"
                      _hover={{ bg: 'gray.700' }}
                    >
                      <Text color="white">{team.name}</Text>
                    </MenuItemOption>
                  ))}
                </MenuOptionGroup>
              </MenuList>
            </Menu>
          </HStack>
        </HStack>

        {/* Selected teams tags (only in custom mode) */}
        {filterMode === 'custom' && selectedTeamIds.size > 0 && (
          <Wrap spacing={2}>
            {Array.from(selectedTeamIds).map((teamId) => {
              const team = teams.find((t) => t.id === teamId);
              if (!team) return null;
              return (
                <WrapItem key={teamId}>
                  <Tag size="sm" colorScheme="orange" variant="subtle">
                    <TagLabel>{team.name}</TagLabel>
                    <TagCloseButton onClick={() => toggleTeamSelection(teamId)} />
                  </Tag>
                </WrapItem>
              );
            })}
          </Wrap>
        )}
      </HStack>

      <Box h="400px" w="100%">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="episode"
              label={{ value: 'Episode', position: 'insideBottom', offset: -10, fill: '#A0AEC0' }}
              tick={{ fill: '#A0AEC0', fontSize: 12 }}
              tickLine={{ stroke: '#A0AEC0' }}
              axisLine={{ stroke: '#A0AEC0' }}
            />
            <YAxis
              reversed
              domain={[1, teams.length]}
              ticks={Array.from({ length: teams.length }, (_, i) => i + 1)}
              label={{ value: 'Placement', angle: -90, position: 'insideLeft', fill: '#A0AEC0' }}
              tick={{ fill: '#A0AEC0', fontSize: 12 }}
              tickLine={{ stroke: '#A0AEC0' }}
              axisLine={{ stroke: '#A0AEC0' }}
              tickFormatter={(value) => `${value}${getOrdinalSuffix(value)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            {displayedTeams.map((team) => (
              <Line
                key={team.id}
                type="monotone"
                dataKey={team.id}
                name={team.id}
                stroke={teamColorMap.get(team.id)}
                strokeWidth={team.isCurrentUser ? 3 : 2}
                dot={{
                  r: team.isCurrentUser ? 5 : 4,
                  fill: teamColorMap.get(team.id),
                }}
                activeDot={{
                  r: team.isCurrentUser ? 7 : 5,
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

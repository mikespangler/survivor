'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Spinner,
  Text,
  Alert,
  AlertIcon,
  AlertDescription,
  Select,
} from '@chakra-ui/react';
import { api } from '@/lib/api';
import { AuthenticatedLayout } from '@/components/navigation';
import type { RetentionConfig, Season, Episode } from '@/types/api';

export default function RetentionConfigPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const leagueId = params.leagueId as string;

  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [configs, setConfigs] = useState<Record<number, number>>({});
  const [bulkValue, setBulkValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get all seasons
      const allSeasons = await api.getSeasons();
      setSeasons(allSeasons);

      // Default to active season, or first season if no active season
      const active = allSeasons.find((s) => s.status === 'ACTIVE');
      const defaultSeason = active || allSeasons[0];

      if (!defaultSeason) {
        setError('No seasons found');
        setIsLoading(false);
        return;
      }

      setSelectedSeason(defaultSeason);
    } catch (err) {
      console.error('Failed to load seasons:', err);
      setError('Failed to load seasons');
    } finally {
      setIsLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load episodes and retention configs when season changes
  useEffect(() => {
    const loadSeasonData = async () => {
      if (!selectedSeason) return;

      try {
        // Load episodes for selected season
        const seasonEpisodes = await api.getEpisodes(selectedSeason.id);
        setEpisodes(seasonEpisodes);

        // Load existing retention configs
        const existingConfigs = await api.getRetentionConfig(leagueId, selectedSeason.id);

        const configMap: Record<number, number> = {};
        existingConfigs.forEach((config) => {
          configMap[config.episodeNumber] = config.pointsPerCastaway;
        });

        setConfigs(configMap);
      } catch (err) {
        console.error('Failed to load season data:', err);
        toast({
          title: 'Failed to load season data',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    loadSeasonData();
  }, [selectedSeason, leagueId, toast]);

  const handleEpisodeChange = (episode: number, value: string) => {
    const numValue = parseInt(value, 10);
    setConfigs((prev) => ({
      ...prev,
      [episode]: isNaN(numValue) ? 0 : numValue,
    }));
  };

  const handleBulkUpdate = () => {
    const numValue = parseInt(bulkValue, 10);
    if (isNaN(numValue) || episodes.length === 0) return;

    const newConfigs: Record<number, number> = {};
    episodes.forEach((episode) => {
      newConfigs[episode.number] = numValue;
    });
    setConfigs(newConfigs);
    setBulkValue('');
  };

  const handleSave = async () => {
    if (!selectedSeason) return;

    setIsSaving(true);

    try {
      // Build episodes array
      const episodeConfigs = Object.entries(configs).map(([episodeNumber, pointsPerCastaway]) => ({
        episodeNumber: parseInt(episodeNumber, 10),
        pointsPerCastaway,
      }));

      // Update configs
      await api.updateRetentionConfig(leagueId, selectedSeason.id, { episodes: episodeConfigs });

      // Trigger recalculation
      const recalcResult = await api.recalculatePoints(leagueId, selectedSeason.id);

      toast({
        title: 'Configuration saved',
        description: `Points recalculated for ${recalcResult.teamsRecalculated} teams across ${recalcResult.episodes} episodes.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reload season data to get updated configs
      if (selectedSeason) {
        const existingConfigs = await api.getRetentionConfig(leagueId, selectedSeason.id);
        const configMap: Record<number, number> = {};
        existingConfigs.forEach((config) => {
          configMap[config.episodeNumber] = config.pointsPerCastaway;
        });
        setConfigs(configMap);
      }
    } catch (err) {
      console.error('Failed to save retention config:', err);
      toast({
        title: 'Failed to save',
        description: 'There was an error saving the retention configuration.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <Container maxW="container.md" py={10}>
          <VStack gap={8}>
            <Spinner size="xl" color="orange.500" />
            <Text>Loading configuration...</Text>
          </VStack>
        </Container>
      </AuthenticatedLayout>
    );
  }

  if (error) {
    return (
      <AuthenticatedLayout>
        <Container maxW="container.md" py={10}>
          <Alert status="error" borderRadius="24px">
            <AlertIcon />
            <AlertDescription color="text.primary">{error}</AlertDescription>
          </Alert>
        </Container>
      </AuthenticatedLayout>
    );
  }

  if (!selectedSeason) {
    return (
      <AuthenticatedLayout>
        <Container maxW="container.md" py={10}>
          <VStack gap={8}>
            <Spinner size="xl" color="orange.500" />
            <Text>Loading seasons...</Text>
          </VStack>
        </Container>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <Container maxW="container.md" py={10}>
        <VStack align="stretch" gap={8}>
          <Box>
            <Button
              variant="ghost"
              onClick={() => router.push(`/leagues/${leagueId}/settings`)}
              mb={4}
            >
              ← Back to Settings
            </Button>
            <Heading size="2xl" fontWeight="bold">
              Retention Points Configuration
            </Heading>
            <Text mt={2} color="text.secondary">
              Set the number of points teams earn per active castaway for each episode.
            </Text>
          </Box>

          {/* Season Selector */}
          <Box p={6} borderRadius="24px" borderWidth="1px">
            <FormControl>
              <FormLabel>Select Season</FormLabel>
              <Select
                value={selectedSeason?.id || ''}
                onChange={(e) => {
                  const season = seasons.find((s) => s.id === e.target.value);
                  if (season) setSelectedSeason(season);
                }}
                bg="bg.secondary"
                borderRadius="12px"
              >
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.name} ({season.status})
                  </option>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Alert status="warning" borderRadius="16px">
            <AlertIcon />
            <AlertDescription>
              Changing these values will recalculate all team points. This may take a few
              moments depending on the number of teams and episodes.
            </AlertDescription>
          </Alert>

          {/* Bulk Update */}
          <Box p={6} borderRadius="24px" borderWidth="2px" borderColor="brand.primary" bg="bg.secondary">
            <VStack align="stretch" gap={4}>
              <Heading size="md">Set All Episodes</Heading>
              <Text fontSize="sm" color="text.secondary">
                Quickly set the same point value for all episodes.
              </Text>
              <HStack>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    value={bulkValue}
                    onChange={(e) => setBulkValue(e.target.value)}
                    placeholder="Points per castaway"
                    bg="bg.secondary"
                    borderRadius="12px"
                  />
                </FormControl>
                <Button onClick={handleBulkUpdate} colorScheme="orange">
                  Apply to All
                </Button>
              </HStack>
            </VStack>
          </Box>

          {/* Episode Configuration Table */}
          {episodes.length > 0 ? (
            <Box borderRadius="24px" overflow="hidden" borderWidth="1px" borderColor="border.default" bg="bg.secondary">
              <Table variant="simple">
                <Thead bg="bg.primary">
                  <Tr>
                    <Th>Episode</Th>
                    <Th isNumeric>Points per Active Castaway</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {episodes.map((episode) => (
                    <Tr key={episode.id}>
                      <Td fontWeight="semibold">
                        Episode {episode.number}
                        {episode.title && ` - ${episode.title}`}
                      </Td>
                      <Td isNumeric>
                        <Input
                          type="number"
                          min={0}
                          value={configs[episode.number] || 0}
                          onChange={(e) => handleEpisodeChange(episode.number, e.target.value)}
                          maxW="150px"
                          ml="auto"
                          borderRadius="12px"
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ) : (
            <Alert status="info" borderRadius="16px">
              <AlertIcon />
              <AlertDescription>
                No episodes found for this season. Episodes must be created before configuring retention points.
              </AlertDescription>
            </Alert>
          )}

          {/* Save Button */}
          <HStack justify="flex-end">
            <Button
              variant="ghost"
              onClick={() => router.push(`/leagues/${leagueId}/settings`)}
              isDisabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              colorScheme="orange"
              size="lg"
              onClick={handleSave}
              isLoading={isSaving}
              loadingText="Saving and recalculating..."
            >
              Save Configuration
            </Button>
          </HStack>
        </VStack>
      </Container>
    </AuthenticatedLayout>
  );
}

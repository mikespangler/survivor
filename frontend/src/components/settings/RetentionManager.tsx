'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  FormControl,
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
} from '@chakra-ui/react';
import { api } from '@/lib/api';
import type { Episode } from '@/types/api';

interface RetentionManagerProps {
  leagueId: string;
  seasonId: string;
}

export function RetentionManager({ leagueId, seasonId }: RetentionManagerProps) {
  const toast = useToast();

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
      // Load episodes for selected season
      const seasonEpisodes = await api.getEpisodes(seasonId);
      setEpisodes(seasonEpisodes);

      // Load existing retention configs
      const existingConfigs = await api.getRetentionConfig(leagueId, seasonId);

      const configMap: Record<number, number> = {};
      existingConfigs.forEach((config) => {
        configMap[config.episodeNumber] = config.pointsPerCastaway;
      });

      setConfigs(configMap);
    } catch (err) {
      console.error('Failed to load retention data:', err);
      setError('Failed to load retention configuration');
    } finally {
      setIsLoading(false);
    }
  }, [leagueId, seasonId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
    setIsSaving(true);

    try {
      // Build episodes array
      const episodeConfigs = Object.entries(configs).map(
        ([episodeNumber, pointsPerCastaway]) => ({
          episodeNumber: parseInt(episodeNumber, 10),
          pointsPerCastaway,
        })
      );

      // Update configs
      await api.updateRetentionConfig(leagueId, seasonId, {
        episodes: episodeConfigs,
      });

      // Trigger recalculation
      const recalcResult = await api.recalculatePoints(leagueId, seasonId);

      toast({
        title: 'Configuration saved',
        description: `Points recalculated for ${recalcResult.teamsRecalculated} teams across ${recalcResult.episodes} episodes.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reload to get updated configs
      const existingConfigs = await api.getRetentionConfig(leagueId, seasonId);
      const configMap: Record<number, number> = {};
      existingConfigs.forEach((config) => {
        configMap[config.episodeNumber] = config.pointsPerCastaway;
      });
      setConfigs(configMap);
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
      <VStack gap={4} py={10}>
        <Spinner size="xl" color="orange.500" />
        <Text>Loading configuration...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="16px">
        <AlertIcon />
        <AlertDescription color="text.primary">{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <VStack align="stretch" gap={6}>
      <Text color="text.secondary">
        Set the number of points teams earn per active castaway for each
        episode.
      </Text>

      <Alert status="warning" borderRadius="16px">
        <AlertIcon />
        <AlertDescription>
          Changing these values will recalculate all team points. This may take
          a few moments depending on the number of teams and episodes.
        </AlertDescription>
      </Alert>

      {/* Bulk Update */}
      <Box
        p={6}
        borderRadius="16px"
        borderWidth="2px"
        borderColor="brand.primary"
        bg="bg.secondary"
      >
        <VStack align="stretch" gap={4}>
          <Text fontWeight="semibold">Set All Episodes</Text>
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
        <Box
          borderRadius="16px"
          overflow="hidden"
          borderWidth="1px"
          borderColor="border.default"
          bg="bg.secondary"
        >
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
                      onChange={(e) =>
                        handleEpisodeChange(episode.number, e.target.value)
                      }
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
            No episodes found for this season. Episodes must be created before
            configuring retention points.
          </AlertDescription>
        </Alert>
      )}

      {/* Save Button */}
      <HStack justify="flex-end">
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
  );
}

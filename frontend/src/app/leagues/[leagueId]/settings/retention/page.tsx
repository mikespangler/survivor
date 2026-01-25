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
} from '@chakra-ui/react';
import { api } from '@/lib/api';
import { AuthenticatedLayout } from '@/components/navigation';
import type { RetentionConfig, Season } from '@/types/api';

export default function RetentionConfigPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const leagueId = params.leagueId as string;

  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [configs, setConfigs] = useState<Record<number, number>>({});
  const [bulkValue, setBulkValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get active season
      const seasons = await api.getSeasons();
      const active = seasons.find((s) => s.status === 'ACTIVE');

      if (!active) {
        setError('No active season found');
        setIsLoading(false);
        return;
      }

      setActiveSeason(active);

      // Load existing retention configs
      const existingConfigs = await api.getRetentionConfig(leagueId, active.id);

      const configMap: Record<number, number> = {};
      existingConfigs.forEach((config) => {
        configMap[config.episodeNumber] = config.pointsPerCastaway;
      });

      setConfigs(configMap);
    } catch (err) {
      console.error('Failed to load retention config:', err);
      setError('Failed to load retention configuration');
    } finally {
      setIsLoading(false);
    }
  }, [leagueId]);

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
    if (isNaN(numValue) || !activeSeason) return;

    const newConfigs: Record<number, number> = {};
    for (let ep = 1; ep <= activeSeason.activeEpisode!; ep++) {
      newConfigs[ep] = numValue;
    }
    setConfigs(newConfigs);
    setBulkValue('');
  };

  const handleSave = async () => {
    if (!activeSeason) return;

    setIsSaving(true);

    try {
      // Build episodes array
      const episodes = Object.entries(configs).map(([episodeNumber, pointsPerCastaway]) => ({
        episodeNumber: parseInt(episodeNumber, 10),
        pointsPerCastaway,
      }));

      // Update configs
      await api.updateRetentionConfig(leagueId, activeSeason.id, { episodes });

      // Trigger recalculation
      const recalcResult = await api.recalculatePoints(leagueId, activeSeason.id);

      toast({
        title: 'Configuration saved',
        description: `Points recalculated for ${recalcResult.teamsRecalculated} teams across ${recalcResult.episodes} episodes.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reload data
      await loadData();
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

  if (error || !activeSeason) {
    return (
      <AuthenticatedLayout>
        <Container maxW="container.md" py={10}>
          <Alert status="error" borderRadius="24px">
            <AlertIcon />
            {error || 'No active season found'}
          </Alert>
        </Container>
      </AuthenticatedLayout>
    );
  }

  const episodes = Array.from({ length: activeSeason.activeEpisode! }, (_, i) => i + 1);

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
            <Text mt={2} color="gray.600">
              Set the number of points teams earn per active castaway for each episode.
            </Text>
          </Box>

          <Alert status="warning" borderRadius="16px">
            <AlertIcon />
            <AlertDescription>
              Changing these values will recalculate all team points. This may take a few
              moments depending on the number of teams and episodes.
            </AlertDescription>
          </Alert>

          {/* Bulk Update */}
          <Box p={6} borderRadius="24px" borderWidth="1px" bg="orange.50">
            <VStack align="stretch" gap={4}>
              <Heading size="md">Set All Episodes</Heading>
              <Text fontSize="sm" color="gray.700">
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
                    bg="white"
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
          <Box borderRadius="24px" overflow="hidden" borderWidth="1px" bg="white">
            <Table variant="simple">
              <Thead bg="orange.50">
                <Tr>
                  <Th>Episode</Th>
                  <Th isNumeric>Points per Active Castaway</Th>
                </Tr>
              </Thead>
              <Tbody>
                {episodes.map((episode) => (
                  <Tr key={episode}>
                    <Td fontWeight="semibold">Episode {episode}</Td>
                    <Td isNumeric>
                      <Input
                        type="number"
                        min={0}
                        value={configs[episode] || 0}
                        onChange={(e) => handleEpisodeChange(episode, e.target.value)}
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

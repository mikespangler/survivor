'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@/lib/api';
import type { League, DraftConfig, Season } from '@/types/api';

export default function LeagueSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const leagueId = params.leagueId as string;

  const [league, setLeague] = useState<League | null>(null);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [draftConfig, setDraftConfig] = useState<DraftConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [castawaysPerTeam, setCastawaysPerTeam] = useState<number>(0);

  useEffect(() => {
    if (!isSignedIn || !user) {
      router.push('/');
      return;
    }

    loadData();
  }, [leagueId, isSignedIn, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch league
      const leagueData = await api.getLeague(leagueId);
      setLeague(leagueData);

      // Find active or upcoming season
      const seasons = await api.getSeasons();
      const activeOrUpcoming = seasons.find(
        (s) => s.status === 'ACTIVE' || s.status === 'UPCOMING',
      );

      if (!activeOrUpcoming) {
        setError('No active or upcoming season found');
        setLoading(false);
        return;
      }

      setActiveSeason(activeOrUpcoming);

      // Note: Backend guard will handle authorization, but we check owner for UX
      // The backend LeagueOwnerOrAdminGuard will reject unauthorized requests

      // Fetch draft config for round 1
      try {
        const config = await api.getDraftConfig(
          leagueId,
          activeOrUpcoming.id,
          1,
        );
        if (config) {
          setDraftConfig(config);
          setCastawaysPerTeam(config.castawaysPerTeam);
        }
      } catch (err) {
        // Draft config might not exist yet, that's okay
        console.log('No draft config found, will create on save');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load league settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSeason) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      await api.updateDraftConfig(leagueId, activeSeason.id, {
        roundNumber: 1,
        castawaysPerTeam,
      });

      setSuccessMessage('Draft configuration has been updated successfully.');

      // Reload draft config
      const config = await api.getDraftConfig(leagueId, activeSeason.id, 1);
      if (config) {
        setDraftConfig(config);
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box as="main" minH="100vh" bg="gray.50" py={20}>
        <Container maxW="container.md">
          <VStack gap={4}>
            <Spinner size="xl" />
            <Text>Loading league settings...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (error && !league) {
    return (
      <Box as="main" minH="100vh" bg="gray.50" py={20}>
        <Container maxW="container.md">
          <Box
            bg="red.50"
            borderColor="red.200"
            borderWidth="1px"
            borderRadius="md"
            p={4}
          >
            <VStack align="start" gap={2}>
              <Text fontWeight="bold" color="red.800">
                Error
              </Text>
              <Text color="red.700">{error}</Text>
            </VStack>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box as="main" minH="100vh" bg="gray.50" py={10}>
      <Container maxW="container.md">
        <VStack gap={6} align="stretch">
          <Heading as="h1" size="xl">
            League Settings
          </Heading>

          {league && (
            <Text fontSize="lg" color="gray.600">
              {league.name}
              {activeSeason && ` - ${activeSeason.name}`}
            </Text>
          )}

          {successMessage && (
            <Box
              bg="green.50"
              borderColor="green.200"
              borderWidth="1px"
              borderRadius="md"
              p={4}
            >
              <VStack align="start" gap={2}>
                <Text fontWeight="bold" color="green.800">
                  Success
                </Text>
                <Text color="green.700">{successMessage}</Text>
              </VStack>
            </Box>
          )}

          {error && (
            <Box
              bg="red.50"
              borderColor="red.200"
              borderWidth="1px"
              borderRadius="md"
              p={4}
            >
              <VStack align="start" gap={2}>
                <Text fontWeight="bold" color="red.800">
                  Error
                </Text>
                <Text color="red.700">{error}</Text>
              </VStack>
            </Box>
          )}

          <Box bg="white" p={6} borderRadius="md" shadow="sm">
            <form onSubmit={handleSubmit}>
              <VStack gap={6} align="stretch">
                <Heading as="h2" size="md">
                  Draft Configuration
                </Heading>

                <FormControl isRequired>
                  <FormLabel>Number of Castaways per Team</FormLabel>
                  <Input
                    type="number"
                    min={1}
                    value={castawaysPerTeam || ''}
                    onChange={(e) =>
                      setCastawaysPerTeam(parseInt(e.target.value, 10) || 0)
                    }
                    placeholder="Enter number of castaways per team"
                  />
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    This setting determines how many castaways each team can
                    draft in the initial draft (Round 1).
                  </Text>
                </FormControl>

                {draftConfig && (
                  <Box p={4} bg="gray.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="bold" mb={2}>
                      Current Configuration:
                    </Text>
                    <VStack align="start" gap={1} fontSize="sm">
                      <Text>Round: {draftConfig.roundNumber}</Text>
                      <Text>Castaways per Team: {draftConfig.castawaysPerTeam}</Text>
                      <Text>Status: {draftConfig.status}</Text>
                      {draftConfig.draftDate && (
                        <Text>
                          Draft Date:{' '}
                          {new Date(draftConfig.draftDate).toLocaleDateString()}
                        </Text>
                      )}
                    </VStack>
                  </Box>
                )}

                <Button
                  type="submit"
                  colorScheme="orange"
                  isLoading={saving}
                  loadingText="Saving..."
                  isDisabled={castawaysPerTeam < 1}
                >
                  Save Settings
                </Button>
              </VStack>
            </form>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}


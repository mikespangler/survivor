'use client';

import { useEffect, useState, useCallback } from 'react';
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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
} from '@chakra-ui/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { AuthenticatedLayout } from '@/components/navigation';
import { QuestionsManager, RetentionManager } from '@/components/settings';
import { MemberManagement } from '@/components/members';
import type { League, DraftConfig, Season } from '@/types/api';

export default function LeagueSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { user: clerkUser, isSignedIn } = useUser();
  const toast = useToast();
  const leagueId = params.leagueId as string;

  const [league, setLeague] = useState<League | null>(null);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [draftConfig, setDraftConfig] = useState<DraftConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [castawaysPerTeam, setCastawaysPerTeam] = useState<number>(0);
  const [isCommissioner, setIsCommissioner] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch league
      const leagueData = await api.getLeague(leagueId);
      setLeague(leagueData);

      // Get current user's database ID
      try {
        const currentUser = await api.getCurrentUser();

        // Check if user is commissioner
        const isOwner = leagueData.ownerId === currentUser.id;
        const isCommissionerUser =
          leagueData.commissioners?.some((c) => c.id === currentUser.id) || false;
        setIsCommissioner(isOwner || isCommissionerUser);
      } catch {
        // Ignore errors - user might not be loaded yet
      }

      // Find active or upcoming season
      const seasons = await api.getSeasons();
      const activeOrUpcoming = seasons.find(
        (s) => s.status === 'ACTIVE' || s.status === 'UPCOMING'
      );

      if (!activeOrUpcoming) {
        setError('No active or upcoming season found');
        setLoading(false);
        return;
      }

      setActiveSeason(activeOrUpcoming);

      // Fetch draft config for round 1
      try {
        const config = await api.getDraftConfig(
          leagueId,
          activeOrUpcoming.id,
          1
        );
        if (config) {
          setDraftConfig(config);
          setCastawaysPerTeam(config.castawaysPerTeam);
        }
      } catch {
        // Draft config might not exist yet, that's okay
        console.log('No draft config found, will create on save');
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load league settings';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    if (!isSignedIn || !clerkUser) {
      router.push('/');
      return;
    }

    loadData();
  }, [isSignedIn, clerkUser, router, loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSeason || castawaysPerTeam < 1) return;

    setSaving(true);
    try {
      await api.updateDraftConfig(leagueId, activeSeason.id, {
        castawaysPerTeam,
      });
      toast({
        title: 'Settings saved',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      // Reload to get updated config
      await loadData();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to save settings';
      toast({
        title: 'Failed to save settings',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <Box as="main" minH="100vh" bg="transparent" py={20}>
          <Container maxW="container.md">
            <VStack gap={4}>
              <Spinner size="xl" />
              <Text>Loading league settings...</Text>
            </VStack>
          </Container>
        </Box>
      </AuthenticatedLayout>
    );
  }

  if (error && !league) {
    return (
      <AuthenticatedLayout>
        <Box as="main" minH="100vh" bg="transparent" py={20}>
          <Container maxW="container.md">
            <Box
              bg="red.900"
              borderColor="red.500"
              borderWidth="1px"
              borderRadius="md"
              p={4}
            >
              <VStack align="start" gap={2}>
                <Text fontWeight="bold" color="red.200">
                  Error
                </Text>
                <Text color="red.300">{error}</Text>
              </VStack>
            </Box>
          </Container>
        </Box>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <Box as="main" minH="100vh" bg="transparent" py={10}>
        <Container maxW="container.xl">
          <VStack gap={6} align="stretch">
            <Heading as="h1" size="xl">
              League Settings
            </Heading>

            {league && (
              <Text fontSize="lg" color="text.secondary">
                {league.name}
                {activeSeason && ` - ${activeSeason.name}`}
              </Text>
            )}

            {error && (
              <Box
                bg="red.900"
                borderColor="red.500"
                borderWidth="1px"
                borderRadius="md"
                p={4}
              >
                <VStack align="start" gap={2}>
                  <Text fontWeight="bold" color="red.200">
                    Error
                  </Text>
                  <Text color="red.300">{error}</Text>
                </VStack>
              </Box>
            )}

            <Tabs defaultIndex={0} variant="enclosed">
              <TabList>
                <Tab>Questions</Tab>
                {isCommissioner && <Tab>Members</Tab>}
                <Tab>Points</Tab>
                <Tab>Draft</Tab>
              </TabList>

              <TabPanels>
                {/* Questions Tab */}
                <TabPanel px={0} py={6}>
                  {activeSeason ? (
                    <QuestionsManager
                      leagueId={leagueId}
                      seasonId={activeSeason.id}
                      leagueName={league?.name}
                      seasonName={activeSeason.name}
                      activeEpisode={activeSeason.activeEpisode || 1}
                    />
                  ) : (
                    <Text color="text.secondary">
                      No active season available.
                    </Text>
                  )}
                </TabPanel>

                {/* Members Tab (commissioners only) */}
                {isCommissioner && (
                  <TabPanel px={0} py={6}>
                    {league && (
                      <MemberManagement
                        leagueId={leagueId}
                        leagueName={league.name}
                        mode="commissioner"
                      />
                    )}
                  </TabPanel>
                )}

                {/* Points Tab */}
                <TabPanel px={0} py={6}>
                  {activeSeason ? (
                    <RetentionManager
                      leagueId={leagueId}
                      seasonId={activeSeason.id}
                    />
                  ) : (
                    <Text color="text.secondary">
                      No active season available.
                    </Text>
                  )}
                </TabPanel>

                {/* Draft Tab */}
                <TabPanel px={0} py={6}>
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
                        <Text fontSize="sm" color="text.secondary" mt={2}>
                          This setting determines how many castaways each team
                          can draft in the initial draft (Round 1).
                        </Text>
                      </FormControl>

                      {draftConfig && (
                        <Box p={4} bg="bg.secondary" borderRadius="md">
                          <Text fontSize="sm" fontWeight="bold" mb={2}>
                            Current Configuration:
                          </Text>
                          <VStack align="start" gap={1} fontSize="sm">
                            <Text>Round: {draftConfig.roundNumber}</Text>
                            <Text>
                              Castaways per Team: {draftConfig.castawaysPerTeam}
                            </Text>
                            <Text>Status: {draftConfig.status}</Text>
                            {draftConfig.draftDate && (
                              <Text>
                                Draft Date:{' '}
                                {new Date(
                                  draftConfig.draftDate
                                ).toLocaleDateString()}
                              </Text>
                            )}
                          </VStack>
                        </Box>
                      )}

                      <Button
                        type="submit"
                        variant="primary"
                        isLoading={saving}
                        loadingText="Saving..."
                        isDisabled={castawaysPerTeam < 1}
                      >
                        Save Settings
                      </Button>

                      <Button
                        colorScheme="orange"
                        size="lg"
                        onClick={() => router.push(`/leagues/${leagueId}/draft`)}
                        isDisabled={!draftConfig?.castawaysPerTeam}
                      >
                        Go to Draft
                      </Button>
                    </VStack>
                  </form>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </Container>
      </Box>
    </AuthenticatedLayout>
  );
}

'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  Grid,
  SimpleGrid,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  Tab,
} from '@chakra-ui/react';
import { AuthenticatedLayout } from '@/components/navigation';
import {
  CastawayCard,
  SelectedRosterPreview,
  DraftProgressBar,
} from '@/components/draft';
import { api } from '@/lib/api';
import type { DraftPageData, Castaway } from '@/types/api';

export default function DraftPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const leagueId = params.leagueId as string;

  const [draftData, setDraftData] = useState<DraftPageData | null>(null);
  const [selectedCastawayIds, setSelectedCastawayIds] = useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'ACTIVE' | 'ELIMINATED' | 'JURY'
  >('ALL');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load draft data
  const loadDraftData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get active or upcoming season (drafting can happen for upcoming seasons)
      const seasons = await api.getSeasons();
      const activeSeason = seasons.find((s) => s.status === 'ACTIVE');
      const upcomingSeason = !activeSeason ? seasons.find((s) => s.status === 'UPCOMING') : null;
      const currentSeason = activeSeason || upcomingSeason;

      if (!currentSeason) {
        setError('No active or upcoming season found');
        setLoading(false);
        return;
      }

      const data = await api.getDraftPageData(leagueId, currentSeason.id, 1);
      setDraftData(data);

      // Pre-populate with current roster if exists
      if (data.currentRoster.length > 0) {
        setSelectedCastawayIds(
          new Set(data.currentRoster.map((r) => r.castaway.id))
        );
      }
    } catch (err: any) {
      console.error('Failed to load draft data:', err);
      setError(err.message || 'Failed to load draft data');
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    loadDraftData();
  }, [loadDraftData]);

  // Selection handlers
  const handleSelectCastaway = useCallback(
    (castawayId: string) => {
      if (!draftData) return;

      setSelectedCastawayIds((prev) => {
        if (prev.size >= draftData.draftConfig.castawaysPerTeam) {
          toast({
            title: 'Maximum selections reached',
            description: `You can only select ${draftData.draftConfig.castawaysPerTeam} castaways`,
            status: 'warning',
            duration: 3000,
          });
          return prev;
        }

        const next = new Set(prev);
        next.add(castawayId);
        return next;
      });
    },
    [draftData, toast]
  );

  const handleDeselectCastaway = useCallback((castawayId: string) => {
    setSelectedCastawayIds((prev) => {
      const next = new Set(prev);
      next.delete(castawayId);
      return next;
    });
  }, []);

  // Filtered castaways
  const filteredCastaways = useMemo(() => {
    if (!draftData) return [];

    return draftData.castaways.filter((castaway) => {
      // Search filter
      if (
        searchTerm &&
        !castaway.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'ALL' && castaway.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [draftData, searchTerm, statusFilter]);

  // Selected castaways objects
  const selectedCastaways = useMemo(() => {
    if (!draftData) return [];
    return draftData.castaways.filter((c) => selectedCastawayIds.has(c.id));
  }, [draftData, selectedCastawayIds]);

  // Validation
  const canSubmit = useMemo(() => {
    if (!draftData) return false;
    return (
      selectedCastawayIds.size === draftData.draftConfig.castawaysPerTeam &&
      draftData.draftConfig.status !== 'COMPLETED'
    );
  }, [selectedCastawayIds, draftData]);

  // Submit handler
  const handleSubmit = async () => {
    if (!canSubmit || !draftData) return;

    setSubmitting(true);
    try {
      const seasons = await api.getSeasons();
      const activeSeason = seasons.find((s) => s.status === 'ACTIVE');
      const upcomingSeason = !activeSeason ? seasons.find((s) => s.status === 'UPCOMING') : null;
      const currentSeason = activeSeason || upcomingSeason;

      if (!currentSeason) {
        throw new Error('No active or upcoming season found');
      }

      await api.submitDraft(leagueId, currentSeason.id, {
        castawayIds: Array.from(selectedCastawayIds),
        roundNumber: draftData.draftConfig.roundNumber,
      });

      toast({
        title: 'Roster submitted successfully!',
        description: 'Your team is ready for the season.',
        status: 'success',
        duration: 5000,
      });

      router.push(`/leagues/${leagueId}/dashboard`);
    } catch (err: any) {
      console.error('Failed to submit draft:', err);
      toast({
        title: 'Failed to submit roster',
        description: err.message || 'Please try again',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <AuthenticatedLayout>
        <Container maxW="1400px" py={10}>
          <VStack gap={8}>
            <Spinner size="xl" color="brand.primary" />
            <Text color="text.secondary">Loading draft...</Text>
          </VStack>
        </Container>
      </AuthenticatedLayout>
    );
  }

  // Error state
  if (error || !draftData) {
    return (
      <AuthenticatedLayout>
        <Container maxW="1400px" py={10}>
          <Alert status="error" borderRadius="24px">
            <AlertIcon />
            <AlertDescription color="text.primary">
              {error || 'Failed to load draft data'}
            </AlertDescription>
          </Alert>
        </Container>
      </AuthenticatedLayout>
    );
  }

  const teamsCompleted = draftData.leagueProgress.filter(
    (t) => t.hasCompleted
  ).length;
  const isReDraft = draftData.draftConfig.roundNumber > 1;
  const hasSubmitted = draftData.currentRoster.length > 0;

  return (
    <AuthenticatedLayout>
      <Container maxW="1400px" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="2xl" fontWeight="bold" color="text.primary">
              Build Your Roster
            </Heading>
            <Text mt={2} color="text.secondary">
              {isReDraft
                ? `Re-draft your roster for round ${draftData.draftConfig.roundNumber}`
                : 'Select your initial roster to start the season'}
            </Text>
          </Box>

          {/* Instructions */}
          <Alert status={isReDraft ? 'warning' : 'info'} borderRadius="16px">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>
                {isReDraft ? 'Re-Draft in Progress' : 'Draft Your Team'}
              </AlertTitle>
              <AlertDescription color="text.secondary">
                {isReDraft
                  ? `Select ${draftData.draftConfig.castawaysPerTeam} castaways. Your current roster will be replaced.`
                  : `Select exactly ${draftData.draftConfig.castawaysPerTeam} castaways to build your team. Multiple teams can pick the same castaways.`}
              </AlertDescription>
            </Box>
          </Alert>

          {/* Progress */}
          <DraftProgressBar
            teamsCompleted={teamsCompleted}
            totalTeams={draftData.leagueProgress.length}
            draftStatus={draftData.draftConfig.status}
          />

          {/* Two Column Layout */}
          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
            {/* Left: Available Castaways */}
            <VStack align="stretch" spacing={4}>
              <HStack>
                <Input
                  placeholder="Search castaways..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  bg="bg.secondary"
                  borderRadius="12px"
                />
              </HStack>

              <Tabs
                variant="soft-rounded"
                colorScheme="orange"
                onChange={(index) => {
                  const statuses = ['ALL', 'ACTIVE', 'ELIMINATED', 'JURY'];
                  setStatusFilter(statuses[index] as any);
                }}
              >
                <TabList>
                  <Tab>All</Tab>
                  <Tab>Active</Tab>
                  <Tab>Eliminated</Tab>
                  <Tab>Jury</Tab>
                </TabList>
              </Tabs>

              <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
                {filteredCastaways.map((castaway) => (
                  <CastawayCard
                    key={castaway.id}
                    castaway={castaway}
                    isSelected={!hasSubmitted && selectedCastawayIds.has(castaway.id)}
                    isDisabled={
                      hasSubmitted ||
                      (!selectedCastawayIds.has(castaway.id) &&
                        selectedCastawayIds.size >=
                          draftData.draftConfig.castawaysPerTeam)
                    }
                    onSelect={handleSelectCastaway}
                    onDeselect={handleDeselectCastaway}
                  />
                ))}
              </SimpleGrid>

              {filteredCastaways.length === 0 && (
                <Box py={10} textAlign="center">
                  <Text color="text.secondary">
                    No castaways found matching your filters
                  </Text>
                </Box>
              )}
            </VStack>

            {/* Right: Selected Roster (Sticky) */}
            <Box position="sticky" top="100px" height="fit-content">
              <VStack gap={4}>
                {hasSubmitted && (
                  <Alert status="success" borderRadius="16px">
                    <AlertIcon />
                    <Box flex="1">
                      <AlertTitle>Roster Submitted</AlertTitle>
                      <AlertDescription color="text.secondary">
                        Your roster has been submitted. Good luck this season!
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}

                <SelectedRosterPreview
                  selectedCastaways={selectedCastaways}
                  requiredCount={draftData.draftConfig.castawaysPerTeam}
                  onRemove={handleDeselectCastaway}
                  readOnly={hasSubmitted}
                />

                {!hasSubmitted && (
                  <>
                    <Button
                      width="full"
                      size="lg"
                      colorScheme="orange"
                      isDisabled={!canSubmit}
                      isLoading={submitting}
                      onClick={handleSubmit}
                    >
                      Submit Roster ({selectedCastawayIds.size}/
                      {draftData.draftConfig.castawaysPerTeam})
                    </Button>

                    {!canSubmit && selectedCastawayIds.size > 0 && (
                      <Text fontSize="sm" color="text.secondary" textAlign="center">
                        Select{' '}
                        {draftData.draftConfig.castawaysPerTeam -
                          selectedCastawayIds.size}{' '}
                        more castaway(s)
                      </Text>
                    )}
                  </>
                )}

                {hasSubmitted && (
                  <Button
                    width="full"
                    variant="outline"
                    colorScheme="orange"
                    onClick={() => router.push(`/leagues/${leagueId}/dashboard`)}
                  >
                    Back to Dashboard
                  </Button>
                )}
              </VStack>
            </Box>
          </Grid>
        </VStack>
      </Container>
    </AuthenticatedLayout>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Container,
  Heading,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Text,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { AuthenticatedLayout } from '@/components/navigation';
import {
  OverallStandingsTab,
  EpisodeSummaryTab,
  QuestionBreakdownTab,
  CastawayRetentionTab,
} from '@/components/standings';
import type { DetailedStandingsResponse, Season } from '@/types/api';

export default function StandingsPage() {
  const params = useParams();
  const { isSignedIn } = useUser();
  const leagueId = params.leagueId as string;

  const [standingsData, setStandingsData] = useState<DetailedStandingsResponse | null>(null);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!isSignedIn || !leagueId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get active season, or upcoming season if no active season
      const seasons = await api.getSeasons();
      const active = seasons.find((s) => s.status === 'ACTIVE');
      const upcoming = !active ? seasons.find((s) => s.status === 'UPCOMING') : null;
      const currentSeason = active || upcoming;

      if (!currentSeason) {
        setError('No active or upcoming season found');
        setIsLoading(false);
        return;
      }

      setActiveSeason(currentSeason);

      // Get detailed standings (will show all teams with 0 points for upcoming seasons)
      const data = await api.getDetailedStandings(leagueId, currentSeason.id);
      setStandingsData(data);
    } catch (err) {
      console.error('Failed to load standings:', err);
      setError('Failed to load standings data');
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, leagueId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <Container maxW="container.xl" py={10} px={8}>
          <VStack gap={8}>
            <Spinner size="xl" color="orange.500" />
            <Text>Loading standings...</Text>
          </VStack>
        </Container>
      </AuthenticatedLayout>
    );
  }

  if (error || !standingsData || !activeSeason) {
    return (
      <AuthenticatedLayout>
        <Container maxW="container.xl" py={10} px={8}>
          <Alert status="error" borderRadius="24px">
            <AlertIcon />
            {error || 'No standings data available'}
          </Alert>
        </Container>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <Container maxW="container.xl" py={10} px={8}>
        <VStack align="stretch" gap={8}>
          <Heading size="2xl" fontWeight="bold">
            League Standings
          </Heading>

          <Tabs colorScheme="orange" variant="enclosed" isLazy>
            <TabList>
              <Tab fontWeight="medium">Overall Standings</Tab>
              <Tab fontWeight="medium">Episode Summary</Tab>
              <Tab fontWeight="medium">Question Breakdown</Tab>
              <Tab fontWeight="medium">Castaway Retention</Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0}>
                <OverallStandingsTab
                  teams={standingsData.teams}
                  currentEpisode={standingsData.currentEpisode}
                />
              </TabPanel>
              <TabPanel px={0}>
                <EpisodeSummaryTab
                  teams={standingsData.teams}
                  currentEpisode={standingsData.currentEpisode}
                />
              </TabPanel>
              <TabPanel px={0}>
                <QuestionBreakdownTab
                  leagueId={leagueId}
                  seasonId={activeSeason.id}
                  currentEpisode={standingsData.currentEpisode}
                />
              </TabPanel>
              <TabPanel px={0}>
                <CastawayRetentionTab
                  teams={standingsData.teams}
                  currentEpisode={standingsData.currentEpisode}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
    </AuthenticatedLayout>
  );
}

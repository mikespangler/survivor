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
  PlacementGraphTab,
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
        <Container maxW="container.xl" py={10} px={{ base: 4, md: 6, lg: 8 }}>
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
        <Container maxW="container.xl" py={10} px={{ base: 4, md: 6, lg: 8 }}>
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
      <Container maxW="container.xl" py={{ base: 6, md: 10 }} px={{ base: 4, md: 6, lg: 8 }}>
        <VStack align="stretch" gap={{ base: 5, md: 8 }}>
          <Heading size={{ base: 'xl', md: '2xl' }} fontWeight="bold">
            League Standings
          </Heading>

          <Tabs colorScheme="orange" variant="enclosed" isLazy>
            <TabList overflowX="auto" overflowY="hidden" flexWrap="nowrap" css={{ '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
              <Tab fontWeight="medium" whiteSpace="nowrap" flexShrink={0}>Overall Standings</Tab>
              <Tab fontWeight="medium" whiteSpace="nowrap" flexShrink={0}>Episode Summary</Tab>
              <Tab fontWeight="medium" whiteSpace="nowrap" flexShrink={0}>Question Breakdown</Tab>
              <Tab fontWeight="medium" whiteSpace="nowrap" flexShrink={0}>Castaway Retention</Tab>
              <Tab fontWeight="medium" whiteSpace="nowrap" flexShrink={0}>Placement History</Tab>
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
              <TabPanel px={0}>
                <PlacementGraphTab
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

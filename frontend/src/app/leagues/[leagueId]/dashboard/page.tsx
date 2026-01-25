'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
  Grid,
  Badge,
} from '@chakra-ui/react';
import { api } from '@/lib/api';
import { AuthenticatedLayout } from '@/components/navigation';
import {
  StatCard,
  LeagueStandingsCard,
  MyTeamCard,
  WeeklyQuestionsCTA,
  WeekResultsCard,
  FireIcon,
} from '@/components/dashboard';
import type {
  League,
  SeasonMetadata,
  LeagueStandings,
  MyTeamResponse,
} from '@/types/api';

interface LeagueDashboardPageProps {
  params: Promise<{ leagueId: string }>;
}

export default function LeagueDashboardPage({ params }: LeagueDashboardPageProps) {
  const { leagueId } = use(params);
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();

  const [seasonMetadata, setSeasonMetadata] = useState<SeasonMetadata | null>(null);
  const [standings, setStandings] = useState<LeagueStandings | null>(null);
  const [myTeam, setMyTeam] = useState<MyTeamResponse | null>(null);
  const [activeSeasonId, setActiveSeasonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push('/');
      return;
    }

    loadDashboardData();
  }, [isLoaded, isSignedIn, leagueId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user's leagues to find this one
      const userLeagues = await api.getLeagues();
      const currentLeague = userLeagues.find((l) => l.id === leagueId);

      if (!currentLeague) {
        setError('League not found or you are not a member');
        setLoading(false);
        return;
      }

      // Find active season for this league
      const activeSeason = currentLeague.leagueSeasons?.find(
        (ls: any) => ls.isActive || ls.season?.status === 'ACTIVE'
      );

      if (!activeSeason) {
        setError('No active season found for this league');
        setLoading(false);
        return;
      }

      setActiveSeasonId(activeSeason.seasonId);

      // Load season metadata, standings, and user's team in parallel
      const [metadata, standingsData, teamData] = await Promise.all([
        api.getSeasonMetadata(activeSeason.seasonId),
        api.getLeagueStandings(leagueId, activeSeason.seasonId),
        api.getMyTeam(leagueId, activeSeason.seasonId),
      ]);

      setSeasonMetadata(metadata);
      setStandings(standingsData);
      setMyTeam(teamData);
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDeadline = (airDate: string | null) => {
    if (!airDate) return 'TBD';
    const date = new Date(airDate);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (!isLoaded || loading) {
    return (
      <Box minH="100vh" bg="bg.primary" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="brand.primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <AuthenticatedLayout>
        <Container maxW="container.xl" py={20}>
          <VStack gap={4}>
            <Text color="text.primary" fontSize="xl">
              Error
            </Text>
            <Text color="text.secondary">{error}</Text>
            <Box
              as="button"
              bg="brand.primary"
              color="text.button"
              px={6}
              py={3}
              borderRadius="20px"
              fontWeight="bold"
              onClick={() => router.push('/')}
            >
              Back to Dashboard
            </Box>
          </VStack>
        </Container>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <Box p={8} maxW="1400px">
        <VStack align="stretch" gap={8}>
          {/* Header */}
          <Box>
            <HStack justify="space-between" align="center" mb={2}>
              <Heading
                fontFamily="heading"
                fontSize="48px"
                color="text.primary"
                letterSpacing="-1.2px"
                lineHeight="48px"
              >
                Welcome Back, {user?.firstName || 'Player'}
              </Heading>
              <Badge
                bg="rgba(240, 101, 66, 0.15)"
                border="1px solid"
                borderColor="rgba(240, 101, 66, 0.2)"
                color="brand.primary"
                px={4}
                py={3}
                borderRadius="full"
                fontWeight="bold"
                fontSize="14px"
                display="flex"
                alignItems="center"
                gap={1}
              >
                <FireIcon boxSize="14px" />
                Week {seasonMetadata?.activeEpisode || '—'}
              </Badge>
            </HStack>
            <Text color="text.secondary" fontSize="16px" fontWeight="medium">
              Here&apos;s your league status and what needs your attention.
            </Text>
          </Box>

          {/* Stats Cards */}
          <Grid templateColumns="repeat(4, 1fr)" gap={6}>
            <StatCard
              type="episode"
              value={`Ep. ${seasonMetadata?.activeEpisode || '—'}`}
            />
            <StatCard
              type="deadline"
              value={formatDeadline(seasonMetadata?.currentEpisode?.airDate || null)}
            />
            <StatCard
              type="rank"
              value={`#${myTeam?.rank || '—'}`}
              subValue={`/${myTeam?.totalTeams || '—'}`}
            />
            <StatCard
              type="points"
              value={myTeam?.totalPoints?.toString() || '0'}
            />
          </Grid>

          {/* Weekly Questions CTA */}
          {activeSeasonId && (
            <WeeklyQuestionsCTA leagueId={leagueId} seasonId={activeSeasonId} />
          )}

          {/* Two Column Layout: Standings & My Team */}
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            {standings && (
              <LeagueStandingsCard
                standings={standings}
                myTeam={myTeam}
                leagueId={leagueId}
              />
            )}
            {myTeam && (
              <MyTeamCard myTeam={myTeam} leagueId={leagueId} />
            )}
          </Grid>

          {/* Week Results */}
          <WeekResultsCard />
        </VStack>
      </Box>
    </AuthenticatedLayout>
  );
}

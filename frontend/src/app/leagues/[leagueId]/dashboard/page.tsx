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
  UpcomingSeasonCard,
  CommissionerMessageCard,
} from '@/components/dashboard';
import type {
  League,
  SeasonMetadata,
  LeagueStandings,
  MyTeamResponse,
  CommissionerMessage,
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
  const [commissionerMessages, setCommissionerMessages] = useState<CommissionerMessage[]>([]);
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

  // Auto-refresh for near-start upcoming seasons
  useEffect(() => {
    if (seasonMetadata?.status === 'UPCOMING' && seasonMetadata.startDate) {
      const target = new Date(seasonMetadata.startDate);
      const now = new Date();
      const hoursUntil = (target.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Auto-refresh every 60 seconds if within 2 hours of start
      if (hoursUntil <= 2 && hoursUntil > 0) {
        const interval = setInterval(() => {
          loadDashboardData();
        }, 60000);

        return () => clearInterval(interval);
      }
    }
  }, [seasonMetadata]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is admin
      const currentUser = await api.getCurrentUser();
      const isAdmin = currentUser.systemRole === 'admin';

      let currentLeague;

      if (isAdmin) {
        // Admin can view any league
        try {
          currentLeague = await api.getAdminLeague(leagueId);
        } catch (err) {
          setError('League not found');
          setLoading(false);
          return;
        }
      } else {
        // Regular users can only view their own leagues
        const userLeagues = await api.getLeagues();
        currentLeague = userLeagues.find((l) => l.id === leagueId);

        if (!currentLeague) {
          setError('League not found or you are not a member');
          setLoading(false);
          return;
        }
      }

      // Find active season for this league
      const activeSeason = currentLeague.leagueSeasons?.find(
        (ls: any) => ls.isActive || ls.season?.status === 'ACTIVE'
      );

      // If no active season, look for upcoming season
      const upcomingSeason = !activeSeason
        ? currentLeague.leagueSeasons?.find(
            (ls: any) => ls.season?.status === 'UPCOMING'
          )
        : null;

      // Error only if neither active nor upcoming season exists
      if (!activeSeason && !upcomingSeason) {
        setError('No active or upcoming season found for this league');
        setLoading(false);
        return;
      }

      // Use whichever season we found
      const currentSeasonRef = (activeSeason || upcomingSeason)!;
      setActiveSeasonId(currentSeasonRef.seasonId);

      // Load season metadata, standings, team data, and commissioner messages
      // Note: Load standings for BOTH active and upcoming seasons
      // Upcoming seasons will show all teams with 0 points (like fantasy football pre-season)
      const promises: Promise<any>[] = [
        api.getSeasonMetadata(currentSeasonRef.seasonId),
        api.getLeagueStandings(leagueId, currentSeasonRef.seasonId),
        api.getCommissionerMessages(leagueId, { limit: 3 }).catch(() => ({ messages: [] })),
      ];

      // Load team data if available (both admins and regular users may not have teams)
      // - Admins viewing non-member leagues won't have a team
      // - Regular users may not have joined the current season yet
      promises.push(
        api.getMyTeam(leagueId, currentSeasonRef.seasonId).catch(() => null)
      );

      const [metadata, standingsData, messagesData, teamData] = await Promise.all(promises);

      setSeasonMetadata(metadata);
      setStandings(standingsData);
      setCommissionerMessages(messagesData.messages || []);
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
                Come on in, {user?.firstName || 'Player'}
              </Heading>
              {seasonMetadata?.status === 'ACTIVE' && (
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
              )}
            </HStack>
            <Text color="text.secondary" fontSize="16px" fontWeight="medium">
              {seasonMetadata?.status === 'UPCOMING'
                ? "Get ready! The season is starting soon."
                : "Here's your league status and what needs your attention."}
            </Text>
          </Box>

          {/* Show commissioner messages if any */}
          {commissionerMessages.length > 0 && (
            <VStack align="stretch" gap={4}>
              {commissionerMessages.map((message) => (
                <CommissionerMessageCard key={message.id} message={message} />
              ))}
            </VStack>
          )}

          {/* Show UpcomingSeasonCard if season is UPCOMING */}
          {seasonMetadata?.status === 'UPCOMING' && (
            <UpcomingSeasonCard
              seasonMetadata={seasonMetadata}
              leagueId={leagueId}
            />
          )}

          {/* Show stat cards ONLY for ACTIVE seasons */}
          {seasonMetadata?.status === 'ACTIVE' && (
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
          )}

          {/* Show Weekly Questions CTA for both ACTIVE and UPCOMING seasons */}
          {activeSeasonId && (
            <WeeklyQuestionsCTA
              leagueId={leagueId}
              seasonId={activeSeasonId}
              seasonStatus={seasonMetadata?.status}
            />
          )}

          {/* Show standings for BOTH active and upcoming seasons */}
          {/* For upcoming: Shows all teams with 0 points (fantasy football style) */}
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

          {/* Show Week Results ONLY for ACTIVE seasons */}
          {seasonMetadata?.status === 'ACTIVE' &&
           activeSeasonId &&
           seasonMetadata.activeEpisode && (
            <WeekResultsCard
              leagueId={leagueId}
              seasonId={activeSeasonId}
              episodeNumber={seasonMetadata.activeEpisode}
            />
          )}
        </VStack>
      </Box>
    </AuthenticatedLayout>
  );
}

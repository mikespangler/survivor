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
  Flex,
} from '@chakra-ui/react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { AuthenticatedLayout } from '@/components/navigation';
import {
  LeagueStandingsCard,
  MyTeamCard,
  WeeklyQuestionsCTA,
  WeekResultsCard,
  UpcomingSeasonCard,
  CommissionerMessageCard,
} from '@/components/dashboard';
import type {
  SeasonMetadata,
  DetailedStandingsResponse,
  MyTeamResponse,
  CommissionerMessage,
  EpisodeResultsResponse,
} from '@/types/api';

interface LeagueDashboardPageProps {
  params: Promise<{ leagueId: string }>;
}

export default function LeagueDashboardPage({ params }: LeagueDashboardPageProps) {
  const { leagueId } = use(params);
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();

  const [seasonMetadata, setSeasonMetadata] = useState<SeasonMetadata | null>(null);
  const [detailedStandings, setDetailedStandings] = useState<DetailedStandingsResponse | null>(null);
  const [myTeam, setMyTeam] = useState<MyTeamResponse | null>(null);
  const [activeSeasonId, setActiveSeasonId] = useState<string | null>(null);
  const [commissionerMessages, setCommissionerMessages] = useState<CommissionerMessage[]>([]);
  const [lastEpisodeResults, setLastEpisodeResults] = useState<EpisodeResultsResponse | null>(null);
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

      let currentLeague;

      // getLeague supports both slug and id lookup, and handles admin access
      try {
        currentLeague = await api.getLeague(leagueId);
      } catch {
        setError('League not found');
        setLoading(false);
        return;
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

      // Load season metadata, detailed standings, team data, and commissioner messages
      const promises: Promise<any>[] = [
        api.getSeasonMetadata(currentSeasonRef.seasonId),
        api.getDetailedStandings(leagueId, currentSeasonRef.seasonId).catch(() => null),
        api.getCommissionerMessages(leagueId, { limit: 3 }).catch(() => ({ messages: [] })),
      ];

      // Load team data if available
      promises.push(
        api.getMyTeam(leagueId, currentSeasonRef.seasonId).catch(() => null)
      );

      const [metadata, standingsData, messagesData, teamData] = await Promise.all(promises);

      setSeasonMetadata(metadata);
      setDetailedStandings(standingsData);
      setCommissionerMessages(messagesData.messages || []);
      setMyTeam(teamData);

      // Fetch previous episode results for the result strip
      // (only if active season and we're past episode 1)
      if (metadata?.status === 'ACTIVE' && metadata.activeEpisode && metadata.activeEpisode > 1) {
        try {
          const prevResults = await api.getEpisodeResults(
            leagueId,
            currentSeasonRef.seasonId,
            metadata.activeEpisode - 1
          );
          if (prevResults?.isFullyScored) {
            setLastEpisodeResults(prevResults);
          }
        } catch {
          // Silently fail - result strip is optional
        }
      }
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Compute rank delta text from detailed standings
  const getRankDelta = (): string | null => {
    if (!detailedStandings) return null;
    const myStanding = detailedStandings.teams.find((t) => t.isCurrentUser);
    if (!myStanding || myStanding.rankChange === 0) return null;
    if (myStanding.rankChange > 0) return `+${myStanding.rankChange} from last week`;
    return `${myStanding.rankChange} from last week`;
  };

  // Compute points earned this episode
  const getPointsDelta = (): string | null => {
    if (!detailedStandings) return null;
    const myStanding = detailedStandings.teams.find((t) => t.isCurrentUser);
    if (!myStanding || myStanding.episodeHistory.length === 0) return null;
    const lastEp = myStanding.episodeHistory[myStanding.episodeHistory.length - 1];
    if (lastEp.totalEpisodePoints === 0) return null;
    return `+${lastEp.totalEpisodePoints} this episode`;
  };

  const handleDismissMessage = (messageId: string) => {
    // Optimistically remove from state
    setCommissionerMessages((prev) => prev.filter((m) => m.id !== messageId));
    // Persist dismissal on the server
    api.dismissCommissionerMessage(leagueId, messageId).catch((err) => {
      console.error('Failed to dismiss message:', err);
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

  const isActive = seasonMetadata?.status === 'ACTIVE';
  const rankDelta = getRankDelta();
  const pointsDelta = getPointsDelta();
  const hasDrafted = myTeam != null && myTeam.roster.length > 0;

  return (
    <AuthenticatedLayout>
      <Box maxW="1200px">
        <Box px={8} py={8}>
          <VStack align="stretch" gap={7}>
            {/* Show commissioner messages if any */}
            {commissionerMessages.length > 0 && (
              <VStack align="stretch" gap={4}>
                {commissionerMessages.map((message) => (
                  <CommissionerMessageCard key={message.id} message={message} onDismiss={handleDismissMessage} />
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

            {/* Hero Row: Greeting + Rank/Points hero cards */}
            <Flex
              justify="space-between"
              align="flex-end"
              gap={8}
            >
              <Box>
                <Heading
                  fontFamily="heading"
                  fontSize="56px"
                  color="text.primary"
                  letterSpacing="-1.5px"
                  lineHeight="1"
                >
                  Come on in, {user?.firstName || 'Player'}
                </Heading>
                <Text color="text.secondary" fontSize="15px" fontWeight="400" mt="6px">
                  {seasonMetadata?.status === 'UPCOMING'
                    ? "Get ready! The season is starting soon."
                    : "Here's your league status and what needs your attention."}
                </Text>
              </Box>

              {/* Rank + Points hero cards */}
              {isActive && myTeam && (
                <HStack gap={4} flexShrink={0}>
                  {/* Rank Card */}
                  <Box
                    textAlign="center"
                    px={7}
                    py={5}
                    borderRadius="14px"
                    position="relative"
                    overflow="hidden"
                    w="190px"
                    h="140px"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    bg="linear-gradient(145deg, rgba(244, 200, 66, 0.12) 0%, rgba(244, 200, 66, 0.04) 100%)"
                    border="1px solid rgba(244, 200, 66, 0.2)"
                  >
                    <Box
                      position="absolute"
                      top="-30px"
                      right="-30px"
                      w="80px"
                      h="80px"
                      bg="radial-gradient(circle, rgba(244, 200, 66, 0.15) 0%, transparent 70%)"
                    />
                    <Text
                      fontFamily="heading"
                      fontSize="11px"
                      fontWeight="600"
                      letterSpacing="2.5px"
                      textTransform="uppercase"
                      color="text.secondary"
                      mb="6px"
                    >
                      Your Rank
                    </Text>
                    <Text
                      fontFamily="heading"
                      fontSize="48px"
                      lineHeight="1"
                      letterSpacing="1px"
                      color="#f4c842"
                    >
                      #{myTeam.rank}
                      <Text as="span" fontSize="24px" color="text.secondary">
                        /{myTeam.totalTeams}
                      </Text>
                    </Text>
                    {rankDelta && (
                      <HStack
                        justify="center"
                        gap="3px"
                        mt="4px"
                        fontFamily="heading"
                        fontSize="13px"
                        fontWeight="600"
                        color="#4ecb71"
                      >
                        <Text>▲ {rankDelta}</Text>
                      </HStack>
                    )}
                  </Box>

                  {/* Points Card */}
                  <Box
                    textAlign="center"
                    px={7}
                    py={5}
                    borderRadius="14px"
                    position="relative"
                    overflow="hidden"
                    w="190px"
                    h="140px"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    bg="linear-gradient(145deg, rgba(232, 98, 42, 0.14) 0%, rgba(232, 98, 42, 0.04) 100%)"
                    border="1px solid rgba(232, 98, 42, 0.2)"
                  >
                    <Box
                      position="absolute"
                      top="-30px"
                      right="-30px"
                      w="80px"
                      h="80px"
                      bg="radial-gradient(circle, rgba(232, 98, 42, 0.15) 0%, transparent 70%)"
                    />
                    <Text
                      fontFamily="heading"
                      fontSize="11px"
                      fontWeight="600"
                      letterSpacing="2.5px"
                      textTransform="uppercase"
                      color="text.secondary"
                      mb="6px"
                    >
                      Total Points
                    </Text>
                    <Text
                      fontFamily="heading"
                      fontSize="48px"
                      lineHeight="1"
                      letterSpacing="1px"
                      color="brand.primary"
                    >
                      {myTeam.totalPoints}
                    </Text>
                    {pointsDelta && (
                      <HStack
                        justify="center"
                        gap="3px"
                        mt="4px"
                        fontFamily="heading"
                        fontSize="13px"
                        fontWeight="600"
                        color="#4ecb71"
                      >
                        <Text>{pointsDelta}</Text>
                      </HStack>
                    )}
                  </Box>
                </HStack>
              )}
            </Flex>

            {/* Episode Result Strip */}
            {isActive && lastEpisodeResults && (
              <WeekResultsCard
                episodeResults={lastEpisodeResults}
              />
            )}

            {/* Two Column Grid: Standings + (Team + Picks CTA) */}
            <Grid templateColumns="1fr 1fr" gap={5}>
              {detailedStandings && (
                <LeagueStandingsCard
                  standings={detailedStandings}
                  leagueId={leagueId}
                />
              )}
              <VStack gap={5} align="stretch">
                {/* Draft Your Team CTA (when undrafted) */}
                {isActive && !hasDrafted && (
                  <Link href={`/leagues/${leagueId}/draft`} style={{ textDecoration: 'none' }}>
                    <Box
                      bg="linear-gradient(145deg, rgba(240, 101, 66, 0.15) 0%, rgba(240, 101, 66, 0.05) 100%)"
                      border="1px solid rgba(240, 101, 66, 0.3)"
                      borderRadius="14px"
                      p={6}
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{ border: '1px solid rgba(240, 101, 66, 0.5)', transform: 'translateY(-1px)' }}
                    >
                      <VStack align="start" gap={2}>
                        <HStack gap={2}>
                          <Box
                            w="8px"
                            h="8px"
                            borderRadius="50%"
                            bg="brand.primary"
                          />
                          <Text
                            fontFamily="heading"
                            fontSize="11px"
                            fontWeight="600"
                            letterSpacing="2px"
                            textTransform="uppercase"
                            color="brand.primary"
                          >
                            Action Required
                          </Text>
                        </HStack>
                        <Heading
                          fontFamily="heading"
                          fontSize="22px"
                          fontWeight="700"
                          color="text.primary"
                        >
                          Draft Your Team
                        </Heading>
                        <Text color="text.secondary" fontSize="14px">
                          Select your castaways before the draft deadline to start earning points.
                        </Text>
                        {seasonMetadata?.draftDeadline && (
                          <Text
                            fontFamily="heading"
                            fontSize="13px"
                            fontWeight="600"
                            color="brand.primary"
                            mt={1}
                          >
                            Draft due {new Date(seasonMetadata.draftDeadline).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </Text>
                        )}
                        <Box
                          mt={2}
                          px={5}
                          py="10px"
                          bg="brand.primary"
                          color="white"
                          borderRadius="10px"
                          fontSize="14px"
                          fontWeight="600"
                          fontFamily="heading"
                          letterSpacing="0.3px"
                        >
                          Go to Draft →
                        </Box>
                      </VStack>
                    </Box>
                  </Link>
                )}
                {myTeam && hasDrafted && (
                  <MyTeamCard myTeam={myTeam} />
                )}
                {/* Make Your Picks CTA */}
                {activeSeasonId && hasDrafted && (
                  <WeeklyQuestionsCTA
                    leagueId={leagueId}
                    seasonId={activeSeasonId}
                    seasonStatus={seasonMetadata?.status}
                  />
                )}
              </VStack>
            </Grid>
          </VStack>
        </Box>
      </Box>
    </AuthenticatedLayout>
  );
}

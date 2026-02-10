'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Avatar,
  Spinner,
  Grid,
  Flex,
  Divider,
  Button,
  SimpleGrid,
} from '@chakra-ui/react';
import { api } from '@/lib/api';
import { AuthenticatedLayout } from '@/components/navigation';
import type { Team, MyTeamResponse } from '@/types/api';

interface TeamPageProps {
  params: Promise<{ leagueId: string; teamId: string }>;
}

// Mock points per castaway - would come from API in production
const getMockCastawayPoints = (castawayId: string): number => {
  const hash = castawayId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return 40 + (hash % 50); // Random between 40-90
};

export default function TeamPage({ params }: TeamPageProps) {
  const { leagueId, teamId } = use(params);
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  const [team, setTeam] = useState<MyTeamResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push('/');
      return;
    }

    loadTeamData();
  }, [isLoaded, isSignedIn, leagueId, teamId]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the league to find the active season
      const userLeagues = await api.getLeagues();
      const currentLeague = userLeagues.find((l) => l.slug === leagueId || l.id === leagueId);

      if (!currentLeague) {
        setError('League not found or you are not a member');
        setLoading(false);
        return;
      }

      // Find active or upcoming season
      const activeSeason = currentLeague.leagueSeasons?.find(
        (ls: any) => ls.isActive || ls.season?.status === 'ACTIVE'
      );
      const upcomingSeason = !activeSeason
        ? currentLeague.leagueSeasons?.find(
            (ls: any) => ls.season?.status === 'UPCOMING'
          )
        : null;

      const currentSeasonRef = activeSeason || upcomingSeason;

      if (!currentSeasonRef) {
        setError('No active or upcoming season found');
        setLoading(false);
        return;
      }

      // Try to get my team data first (richer data with stats)
      const myTeam = await api.getMyTeam(leagueId, currentSeasonRef.seasonId);

      if (myTeam && myTeam.id === teamId) {
        setTeam(myTeam);
      } else {
        // Fall back to basic team fetch
        const basicTeam = await api.getTeam(teamId);
        // Transform to MyTeamResponse format
        const roster = basicTeam.roster || [];
        const activeRoster = roster.filter((r) => {
          const castaway = r.castaway;
          return castaway && castaway.status === 'ACTIVE';
        });
        const eliminatedRoster = roster.filter((r) => {
          const castaway = r.castaway;
          return castaway && castaway.status !== 'ACTIVE';
        });

        setTeam({
          id: basicTeam.id,
          name: basicTeam.name,
          totalPoints: basicTeam.totalPoints || 0,
          rank: 0,
          totalTeams: 0,
          leagueSeasonId: basicTeam.leagueSeasonId,
          roster: roster.map((r) => ({
            id: r.id,
            castaway: {
              id: r.castaway?.id || r.castawayId,
              name: r.castaway?.name || 'Unknown',
              status: r.castaway?.status || 'ACTIVE',
              imageUrl: r.castaway?.imageUrl,
            },
            startEpisode: 1,
            endEpisode: null,
            isActive: r.castaway?.status === 'ACTIVE',
          })),
          stats: {
            activeCastaways: activeRoster.length,
            eliminatedCastaways: eliminatedRoster.length,
          },
        });
      }
    } catch (err: any) {
      console.error('Failed to load team:', err);
      setError(err.message || 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <Box
        minH="100vh"
        bg="bg.primary"
        display="flex"
        alignItems="center"
        justifyContent="center"
        suppressHydrationWarning
      >
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
              onClick={() => router.push(`/leagues/${leagueId}/dashboard`)}
            >
              Back to Dashboard
            </Box>
          </VStack>
        </Container>
      </AuthenticatedLayout>
    );
  }

  if (!team) {
    return (
      <AuthenticatedLayout>
        <Container maxW="container.xl" py={20}>
          <VStack gap={4}>
            <Text color="text.primary" fontSize="xl">
              Team not found
            </Text>
            <Box
              as="button"
              bg="brand.primary"
              color="text.button"
              px={6}
              py={3}
              borderRadius="20px"
              fontWeight="bold"
              onClick={() => router.push(`/leagues/${leagueId}/dashboard`)}
            >
              Back to Dashboard
            </Box>
          </VStack>
        </Container>
      </AuthenticatedLayout>
    );
  }

  const roster = team.roster || [];
  const activeRoster = roster.filter((r) => r.isActive);
  const eliminatedRoster = roster.filter((r) => !r.isActive);

  return (
    <AuthenticatedLayout>
      <Box p={{ base: 4, md: 6, lg: 8 }} maxW="1400px">
        <VStack align="stretch" gap={{ base: 5, md: 8 }}>
          {/* Back button */}
          <Box>
            <Button
              variant="link"
              color="text.secondary"
              fontSize="14px"
              fontWeight="medium"
              onClick={() => router.push(`/leagues/${leagueId}/dashboard`)}
              _hover={{ color: 'text.primary' }}
            >
              ← Back to Dashboard
            </Button>
          </Box>

          {/* Team Header */}
          <Box
            bg="linear-gradient(146.157deg, rgb(33, 38, 48) 2.5008%, rgb(25, 29, 36) 97.499%)"
            border="2px solid"
            borderColor="rgba(43, 48, 59, 0.5)"
            borderRadius={{ base: '16px', md: '24px' }}
            p={{ base: 5, md: 8 }}
          >
            <VStack gap={6}>
              {/* Team Name */}
              <Text
                fontFamily="heading"
                fontSize={{ base: '24px', md: '36px' }}
                color="text.primary"
                textAlign="center"
              >
                {team.name}
              </Text>

              {/* Stats Row */}
              <SimpleGrid columns={{ base: 2, md: 4 }} gap={{ base: 4, md: 8 }} w="full" justifyItems="center">
                {team.rank > 0 && (
                  <VStack gap={0}>
                    <Text
                      fontFamily="display"
                      fontSize={{ base: '32px', md: '48px' }}
                      fontWeight="bold"
                      color="brand.primary"
                      lineHeight={{ base: '40px', md: '56px' }}
                    >
                      #{team.rank}
                    </Text>
                    <Text fontSize={{ base: '12px', md: '14px' }} fontWeight="medium" color="text.secondary">
                      RANK
                    </Text>
                  </VStack>
                )}
                <VStack gap={0}>
                  <Text
                    fontFamily="display"
                    fontSize={{ base: '32px', md: '48px' }}
                    fontWeight="bold"
                    color="brand.primary"
                    lineHeight={{ base: '40px', md: '56px' }}
                  >
                    {team.stats.activeCastaways}
                  </Text>
                  <Text fontSize={{ base: '12px', md: '14px' }} fontWeight="medium" color="text.secondary">
                    ACTIVE
                  </Text>
                </VStack>
                <VStack gap={0}>
                  <Text
                    fontFamily="display"
                    fontSize={{ base: '32px', md: '48px' }}
                    fontWeight="bold"
                    color="text.secondary"
                    lineHeight={{ base: '40px', md: '56px' }}
                  >
                    {team.stats.eliminatedCastaways}
                  </Text>
                  <Text fontSize={{ base: '12px', md: '14px' }} fontWeight="medium" color="text.secondary">
                    ELIMINATED
                  </Text>
                </VStack>
                <VStack gap={0}>
                  <Text
                    fontFamily="display"
                    fontSize={{ base: '32px', md: '48px' }}
                    fontWeight="bold"
                    color="brand.primary"
                    lineHeight={{ base: '40px', md: '56px' }}
                  >
                    {team.totalPoints}
                  </Text>
                  <Text fontSize={{ base: '12px', md: '14px' }} fontWeight="medium" color="text.secondary">
                    TOTAL POINTS
                  </Text>
                </VStack>
              </SimpleGrid>
            </VStack>
          </Box>

          {/* Active Roster Section */}
          {activeRoster.length > 0 && (
            <Box>
              <Text
                fontFamily="display"
                fontSize="24px"
                fontWeight="bold"
                color="text.primary"
                mb={4}
              >
                Active Roster
              </Text>
              <Grid
                templateColumns="repeat(auto-fill, minmax(180px, 1fr))"
                gap={4}
              >
                {activeRoster.map((member) => (
                  <CastawayCard
                    key={member.id}
                    member={member}
                    points={getMockCastawayPoints(member.castaway.id)}
                  />
                ))}
              </Grid>
            </Box>
          )}

          {/* Eliminated Roster Section */}
          {eliminatedRoster.length > 0 && (
            <Box>
              <Text
                fontFamily="display"
                fontSize="24px"
                fontWeight="bold"
                color="text.secondary"
                mb={4}
              >
                Eliminated
              </Text>
              <Grid
                templateColumns="repeat(auto-fill, minmax(180px, 1fr))"
                gap={4}
              >
                {eliminatedRoster.map((member) => (
                  <CastawayCard
                    key={member.id}
                    member={member}
                    points={getMockCastawayPoints(member.castaway.id)}
                    isEliminated
                  />
                ))}
              </Grid>
            </Box>
          )}

          {/* Empty roster state */}
          {roster.length === 0 && (
            <Box
              bg="linear-gradient(146.157deg, rgb(33, 38, 48) 2.5008%, rgb(25, 29, 36) 97.499%)"
              border="2px solid"
              borderColor="rgba(43, 48, 59, 0.5)"
              borderRadius="24px"
              p={8}
              textAlign="center"
            >
              <Text color="text.secondary" fontSize="16px">
                No castaways on this team yet. Complete the draft to build your roster.
              </Text>
            </Box>
          )}
        </VStack>
      </Box>
    </AuthenticatedLayout>
  );
}

interface CastawayCardProps {
  member: {
    id: string;
    castaway: {
      id: string;
      name: string;
      status: 'ACTIVE' | 'ELIMINATED' | 'JURY';
      imageUrl?: string | null;
    };
    isActive: boolean;
  };
  points: number;
  isEliminated?: boolean;
}

function CastawayCard({ member, points, isEliminated = false }: CastawayCardProps) {
  return (
    <Box
      bg="linear-gradient(146.157deg, rgb(33, 38, 48) 2.5008%, rgb(25, 29, 36) 97.499%)"
      border="2px solid"
      borderColor="rgba(43, 48, 59, 0.5)"
      borderRadius="16px"
      p={4}
      opacity={isEliminated ? 0.5 : 1}
      position="relative"
    >
      {/* Eliminated badge */}
      {isEliminated && (
        <Box
          position="absolute"
          top="8px"
          right="8px"
          bg="rgba(244, 67, 54, 0.8)"
          borderRadius="full"
          boxSize="20px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="12px" color="white" fontWeight="bold">
            ✕
          </Text>
        </Box>
      )}

      <VStack gap={3}>
        <Avatar
          size="xl"
          name={member.castaway.name}
          src={member.castaway.imageUrl || undefined}
          boxSize="80px"
          border="3px solid"
          borderColor={isEliminated ? 'text.secondary' : 'brand.primary'}
        />
        <Text
          fontSize="14px"
          fontWeight="bold"
          color="text.primary"
          textAlign="center"
          textDecoration={isEliminated ? 'line-through' : 'none'}
        >
          {member.castaway.name}
        </Text>
        <HStack gap={1} justify="center">
          <Box as="span" color="brand.primary" fontSize="12px">
            ★
          </Box>
          <Text fontSize="13px" fontWeight="medium" color="brand.primary">
            {points} pts
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  Spinner,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
} from '@chakra-ui/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@/lib/api';
import type { League, Team, Season, LeagueSeason } from '@/types/api';

export default function LeagueShowPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const leagueId = params.leagueId as string;

  const [league, setLeague] = useState<League | null>(null);
  const [activeLeagueSeason, setActiveLeagueSeason] = useState<LeagueSeason | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

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

      // Fetch league with leagueSeasons and teams
      const leagueData = await api.getLeague(leagueId);
      setLeague(leagueData);

      // Check if user is admin (owner) by comparing emails
      // Note: Backend will enforce actual permissions, this is just for UX
      const userEmail = user?.emailAddresses?.[0]?.emailAddress;
      const ownerEmail = leagueData.owner?.email;
      const userIsAdmin = Boolean(userEmail && ownerEmail && userEmail === ownerEmail);
      setIsAdmin(userIsAdmin);

      // Find active or upcoming season's leagueSeason
      const activeOrUpcoming = leagueData.leagueSeasons?.find((ls) => {
        const season = ls.season;
        return season?.status === 'ACTIVE' || season?.status === 'UPCOMING';
      });

      if (activeOrUpcoming) {
        setActiveLeagueSeason(activeOrUpcoming);
        setTeams(activeOrUpcoming.teams || []);
      } else {
        // If no active season, show teams from the most recent season
        const mostRecent = leagueData.leagueSeasons?.[0];
        if (mostRecent) {
          setActiveLeagueSeason(mostRecent);
          setTeams(mostRecent.teams || []);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load league');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box as="main" minH="100vh" bg="gray.50" py={20}>
        <Container maxW="container.lg">
          <VStack gap={4}>
            <Spinner size="xl" />
            <Text>Loading league...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (error && !league) {
    return (
      <Box as="main" minH="100vh" bg="gray.50" py={20}>
        <Container maxW="container.lg">
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
      <Container maxW="container.lg">
        <VStack gap={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="start">
            <Box>
              <Heading as="h1" size="xl" mb={2}>
                {league?.name}
              </Heading>
              {league?.description && (
                <Text color="gray.600" fontSize="lg">
                  {league.description}
                </Text>
              )}
              {activeLeagueSeason?.season && (
                <Text color="gray.500" fontSize="sm" mt={2}>
                  Season: {activeLeagueSeason.season.name}
                </Text>
              )}
            </Box>
            {isAdmin && (
              <Button
                colorScheme="orange"
                onClick={() => router.push(`/leagues/${leagueId}/settings`)}
              >
                League Settings
              </Button>
            )}
          </HStack>

          {/* Teams Section */}
          <Box bg="white" p={6} borderRadius="md" shadow="sm">
            <Heading as="h2" size="md" mb={4}>
              Teams
            </Heading>
            {teams.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Text color="gray.500">
                  No teams have been created for this season yet.
                </Text>
              </Box>
            ) : (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Rank</Th>
                    <Th>Team Name</Th>
                    <Th>Owner</Th>
                    <Th isNumeric>Points</Th>
                    <Th>Castaways</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {teams.map((team, index) => (
                    <Tr key={team.id}>
                      <Td>
                        <Badge
                          colorScheme={
                            index === 0
                              ? 'yellow'
                              : index === 1
                                ? 'gray'
                                : index === 2
                                  ? 'orange'
                                  : 'gray'
                          }
                          fontSize="sm"
                        >
                          #{index + 1}
                        </Badge>
                      </Td>
                      <Td fontWeight="medium">{team.name}</Td>
                      <Td>{team.owner?.name || team.owner?.email || 'Unknown'}</Td>
                      <Td isNumeric fontWeight="bold">
                        {team.totalPoints}
                      </Td>
                      <Td>
                        {team.roster && team.roster.length > 0 ? (
                          <Text fontSize="sm" color="gray.600">
                            {team.roster.length} castaway
                            {team.roster.length !== 1 ? 's' : ''}
                          </Text>
                        ) : (
                          <Text fontSize="sm" color="gray.400">
                            No castaways
                          </Text>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </Box>

          {/* League Info */}
          {league && (
            <Box bg="white" p={6} borderRadius="md" shadow="sm">
              <Heading as="h2" size="md" mb={4}>
                League Information
              </Heading>
              <VStack align="start" gap={2}>
                <HStack>
                  <Text fontWeight="bold" minW="120px">
                    Owner:
                  </Text>
                  <Text>{league.owner?.name || league.owner?.email || 'Unknown'}</Text>
                </HStack>
                {league.members && league.members.length > 0 && (
                  <HStack align="start">
                    <Text fontWeight="bold" minW="120px">
                      Members:
                    </Text>
                    <VStack align="start" gap={1}>
                      {league.members.map((member) => (
                        <Text key={member.id}>
                          {member.name || member.email}
                        </Text>
                      ))}
                    </VStack>
                  </HStack>
                )}
                <HStack>
                  <Text fontWeight="bold" minW="120px">
                    Created:
                  </Text>
                  <Text>
                    {new Date(league.createdAt).toLocaleDateString()}
                  </Text>
                </HStack>
              </VStack>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
}


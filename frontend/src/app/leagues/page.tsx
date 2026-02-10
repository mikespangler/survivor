'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Spinner,
  Grid,
  Flex,
  Badge,
  Stack,
} from '@chakra-ui/react';
import { api } from '@/lib/api';
import type { League } from '@/types/api';

export default function LeaguesPage() {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();

  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeagues = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userLeagues = await api.getLeagues();
      setLeagues(userLeagues);

      // If user has only one league, redirect directly to its dashboard
      if (userLeagues.length === 1) {
        router.push(`/leagues/${userLeagues[0].slug || userLeagues[0].id}/dashboard`);
        return;
      }
    } catch (err: unknown) {
      console.error('Failed to load leagues:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leagues');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push('/');
      return;
    }

    loadLeagues();
  }, [isLoaded, isSignedIn, router, loadLeagues]);

  const handleLeagueSelect = (league: { id: string; slug: string }) => {
    router.push(`/leagues/${league.slug || league.id}/dashboard`);
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
      <Container maxW="container.xl" py={20}>
        <VStack gap={4}>
          <Text color="text.primary" fontSize="xl">
            Error
          </Text>
          <Text color="text.secondary">{error}</Text>
          <Button
            bg="brand.primary"
            color="text.button"
            borderRadius="20px"
            boxShadow="0px 6px 0px 0px #C34322"
            _hover={{ bg: '#E85A3A' }}
            onClick={loadLeagues}
          >
            Retry
          </Button>
        </VStack>
      </Container>
    );
  }

  // No leagues - show create/join options
  if (leagues.length === 0) {
    return (
      <Box minH="100vh" bg="bg.primary">
        <Container maxW="container.lg" py={20}>
          <VStack gap={10} align="center" textAlign="center">
            {/* Logo */}
            <VStack gap={1}>
              <Text fontFamily="heading" fontSize="32px" color="text.primary" letterSpacing="0.5px">
                SURVIVOR
              </Text>
              <Text
                fontFamily="body"
                fontSize="14px"
                fontWeight="medium"
                color="text.secondary"
                textTransform="uppercase"
                letterSpacing="2px"
              >
                Fantasy League
              </Text>
            </VStack>

            <VStack gap={4}>
              <Heading
                fontFamily="heading"
                fontSize={{ base: '32px', md: '40px', lg: '48px' }}
                color="text.primary"
                letterSpacing="-1.2px"
              >
                Welcome, {user?.firstName || 'Player'}!
              </Heading>
              <Text color="text.secondary" fontSize={{ base: '16px', md: '18px' }} maxW="600px">
                You haven&apos;t joined any leagues yet. Create your own league or join an existing one to start playing.
              </Text>
            </VStack>

            <Stack direction={{ base: 'column', sm: 'row' }} gap={{ base: 3, sm: 6 }} w={{ base: 'full', sm: 'auto' }}>
              <Button
                bg="brand.primary"
                color="text.button"
                fontFamily="heading"
                fontSize={{ base: '16px', md: '18px' }}
                h={{ base: '48px', md: '56px' }}
                px={{ base: 6, md: 10 }}
                borderRadius="20px"
                boxShadow="0px 6px 0px 0px #C34322"
                _hover={{ bg: '#E85A3A' }}
                _active={{ transform: 'translateY(2px)', boxShadow: '0px 3px 0px 0px #C34322' }}
                onClick={() => router.push('/leagues/create')}
              >
                Create League
              </Button>
              <Button
                bg="transparent"
                color="text.primary"
                fontFamily="heading"
                fontSize={{ base: '16px', md: '18px' }}
                h={{ base: '48px', md: '56px' }}
                px={{ base: 6, md: 10 }}
                borderRadius="20px"
                border="2px solid"
                borderColor="rgba(48, 53, 65, 0.5)"
                _hover={{ bg: 'rgba(240, 101, 66, 0.1)', borderColor: 'brand.primary' }}
                onClick={() => router.push('/leagues/join')}
              >
                Join League
              </Button>
            </Stack>
          </VStack>
        </Container>
      </Box>
    );
  }

  // Multiple leagues - show league picker
  return (
    <Box minH="100vh" bg="bg.primary">
      <Container maxW="container.lg" py={12}>
        <VStack gap={10} align="stretch">
          {/* Header */}
          <VStack gap={4} align="center" textAlign="center">
            <VStack gap={1}>
              <Text fontFamily="heading" fontSize="24px" color="text.primary" letterSpacing="0.5px">
                SURVIVOR
              </Text>
              <Text
                fontFamily="body"
                fontSize="12px"
                fontWeight="medium"
                color="text.secondary"
                textTransform="uppercase"
                letterSpacing="2px"
              >
                Fantasy League
              </Text>
            </VStack>

            <Heading
              fontFamily="heading"
              fontSize={{ base: '28px', md: '40px' }}
              color="text.primary"
              letterSpacing="-1px"
            >
              Select a League
            </Heading>
            <Text color="text.secondary" fontSize="16px">
              Choose a league to view your dashboard
            </Text>
          </VStack>

          {/* League Cards */}
          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
            gap={6}
          >
            {leagues.map((league) => {
              const activeSeason = league.leagueSeasons?.find(
                (ls: { isActive?: boolean; season?: { status?: string } }) =>
                  ls.isActive || ls.season?.status === 'ACTIVE'
              );
              const memberCount = (league.members?.length || 0) + 1; // +1 for owner

              return (
                <Box
                  key={league.id}
                  as="button"
                  bg="linear-gradient(146.157deg, rgb(33, 38, 48) 2.5008%, rgb(25, 29, 36) 97.499%)"
                  border="2px solid"
                  borderColor="rgba(43, 48, 59, 0.5)"
                  borderRadius="24px"
                  p={6}
                  textAlign="left"
                  transition="all 0.2s"
                  _hover={{
                    borderColor: 'brand.primary',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(240, 101, 66, 0.15)',
                  }}
                  onClick={() => handleLeagueSelect(league)}
                >
                  <VStack align="stretch" gap={4}>
                    {/* League Icon & Name */}
                    <HStack gap={4}>
                      <Flex
                        bg="rgba(240, 101, 66, 0.1)"
                        border="1px solid"
                        borderColor="rgba(240, 101, 66, 0.2)"
                        borderRadius="16px"
                        boxSize="56px"
                        align="center"
                        justify="center"
                      >
                        <Text
                          fontFamily="heading"
                          fontSize="20px"
                          color="brand.primary"
                        >
                          {league.name.slice(0, 2).toUpperCase()}
                        </Text>
                      </Flex>
                      <VStack align="start" gap={0} flex="1">
                        <Text
                          fontFamily="heading"
                          fontSize="18px"
                          color="text.primary"
                        >
                          {league.name}
                        </Text>
                        {activeSeason && (
                          <Text
                            fontFamily="body"
                            fontSize="14px"
                            color="text.secondary"
                          >
                            Season {activeSeason.season?.number || '—'}
                          </Text>
                        )}
                      </VStack>
                    </HStack>

                    {/* Stats */}
                    <HStack gap={4}>
                      <Badge
                        bg="rgba(240, 101, 66, 0.1)"
                        color="brand.primary"
                        px={3}
                        py={1}
                        borderRadius="8px"
                        fontSize="12px"
                        fontWeight="bold"
                      >
                        {memberCount} Member{memberCount !== 1 ? 's' : ''}
                      </Badge>
                      {activeSeason?.season?.status === 'ACTIVE' && (
                        <Badge
                          bg="rgba(76, 175, 80, 0.1)"
                          color="#4CAF50"
                          px={3}
                          py={1}
                          borderRadius="8px"
                          fontSize="12px"
                          fontWeight="bold"
                        >
                          Active Season
                        </Badge>
                      )}
                    </HStack>

                    {/* Description */}
                    {league.description && (
                      <Text
                        fontSize="14px"
                        color="text.secondary"
                        noOfLines={2}
                      >
                        {league.description}
                      </Text>
                    )}
                  </VStack>
                </Box>
              );
            })}

            {/* Create/Join New League Card */}
            <Box
              as="button"
              bg="transparent"
              border="2px dashed"
              borderColor="rgba(48, 53, 65, 0.5)"
              borderRadius="24px"
              p={6}
              textAlign="center"
              transition="all 0.2s"
              _hover={{
                borderColor: 'brand.primary',
                bg: 'rgba(240, 101, 66, 0.05)',
              }}
              onClick={() => router.push('/leagues/create')}
            >
              <VStack gap={4} h="full" justify="center">
                <Flex
                  bg="rgba(240, 101, 66, 0.1)"
                  borderRadius="full"
                  boxSize="56px"
                  align="center"
                  justify="center"
                >
                  <Text fontSize="28px" color="brand.primary">
                    +
                  </Text>
                </Flex>
                <VStack gap={1}>
                  <Text
                    fontFamily="body"
                    fontSize="16px"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    Create or Join
                  </Text>
                  <Text fontSize="14px" color="text.secondary">
                    Start a new league
                  </Text>
                </VStack>
              </VStack>
            </Box>
          </Grid>
        </VStack>
      </Container>
    </Box>
  );
}

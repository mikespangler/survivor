'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Heading,
  VStack,
  Button,
  Spinner,
  Text,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@/lib/api';
import type { League } from '@/types/api';

export default function JoinByTokenPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const token = params.token as string;

  const [league, setLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const autoJoinAttempted = useRef(false);

  const loadLeagueInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const tokenData = await api.validateInviteToken(token);
      setLeague(tokenData.league);
      setLoading(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid or expired invite link';
      setError(message);
      setLoading(false);
    }
  }, [token]);

  const handleJoin = useCallback(async () => {
    if (!isSignedIn || !user) {
      router.push(`/sign-in?redirect=/leagues/join/${token}`);
      return;
    }

    try {
      setJoining(true);
      setError(null);

      const joinedLeague = await api.joinLeagueByToken({ token });
      setHasJoined(true);

      // Redirect to league dashboard
      router.push(`/leagues/${joinedLeague.id}/dashboard`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to join league';
      // If user is already a member, redirect to league dashboard
      if (message.includes('already a member') || message.includes('already the owner')) {
        setHasJoined(true);
        if (league) {
          router.push(`/leagues/${league.id}/dashboard`);
        }
        return;
      }
      setError(message);
      setJoining(false);
    }
  }, [isSignedIn, user, token, league, router]);

  useEffect(() => {
    if (!token) {
      setError('Invalid invite link');
      setLoading(false);
      return;
    }

    loadLeagueInfo();
  }, [token, loadLeagueInfo]);

  // Auto-join when authenticated with valid token
  useEffect(() => {
    if (
      isLoaded &&
      isSignedIn &&
      user &&
      league &&
      !loading &&
      !joining &&
      !error &&
      !hasJoined &&
      !autoJoinAttempted.current
    ) {
      autoJoinAttempted.current = true;
      handleJoin();
    }
  }, [isLoaded, isSignedIn, user, league, loading, joining, error, hasJoined, handleJoin]);

  if (loading) {
    return (
      <Box as="main" minH="100vh" bg="transparent" py={20}>
        <Container maxW="container.md">
          <VStack gap={4}>
            <Spinner size="xl" />
            <Text>Loading...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box as="main" minH="100vh" bg="transparent" py={20}>
      <Container maxW="container.md">
        <VStack gap={6} align="stretch">
          <Heading as="h1" size="xl">
            Join League
          </Heading>

          {error && (
            <Card bg="red.900" borderColor="red.500" borderWidth="1px">
              <CardBody>
                <VStack align="start" gap={2}>
                  <Text fontWeight="bold" color="red.200">
                    Error
                  </Text>
                  <Text color="red.300">{error}</Text>
                </VStack>
              </CardBody>
            </Card>
          )}

          {!error && league && (
            <Card>
              <CardBody>
                <VStack gap={4} align="stretch">
                  <VStack align="start" gap={2}>
                    <Heading as="h2" size="md">
                      {league.name}
                    </Heading>
                    {league.description && (
                      <Text color="text.secondary">{league.description}</Text>
                    )}
                  </VStack>

                  <Text>
                    You've been invited to join this league! Click the button below
                    to accept the invitation.
                  </Text>

                  {!isSignedIn ? (
                    <VStack gap={2}>
                      <Text color="text.secondary">
                        You need to sign in to join this league.
                      </Text>
                      <Button
                        variant="primary"
                        onClick={() =>
                          router.push(`/sign-in?redirect=/leagues/join/${token}`)
                        }
                      >
                        Sign In to Join
                      </Button>
                    </VStack>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={handleJoin}
                      isLoading={joining}
                      loadingText="Joining..."
                      size="lg"
                    >
                      Join League
                    </Button>
                  )}
                </VStack>
              </CardBody>
            </Card>
          )}

          {!error && !league && (
            <Card>
              <CardBody>
                <VStack gap={4} align="stretch">
                  <Text>
                    You've been invited to join a league! Click the button below
                    to accept the invitation.
                  </Text>

                  {!isSignedIn ? (
                    <VStack gap={2}>
                      <Text color="text.secondary">
                        You need to sign in to join this league.
                      </Text>
                      <Button
                        variant="primary"
                        onClick={() =>
                          router.push(`/sign-in?redirect=/leagues/join/${token}`)
                        }
                      >
                        Sign In to Join
                      </Button>
                    </VStack>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={handleJoin}
                      isLoading={joining}
                      loadingText="Joining..."
                      size="lg"
                    >
                      Join League
                    </Button>
                  )}
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Container>
    </Box>
  );
}

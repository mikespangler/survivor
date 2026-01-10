'use client';

import { Box, Container, Heading, Text, VStack, HStack, Button, Spinner } from '@chakra-ui/react';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { League } from '@/types/api';

export default function Home() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Wait for both mounted and Clerk to finish loading
    if (!mounted || !isLoaded) {
      return;
    }

    // Only make API calls if user is signed in
    if (isSignedIn) {
      loadLeagues();
      checkAdminStatus();
    } else {
      // Reset state when user signs out
      setLeagues([]);
      setIsAdmin(false);
    }
  }, [mounted, isSignedIn, isLoaded]);

  const checkAdminStatus = async () => {
    // Double check - don't make call if not signed in
    if (!isSignedIn || !isLoaded) {
      setIsAdmin(false);
      return;
    }
    try {
      setLoadingAdmin(true);
      const currentUser = await api.getCurrentUser();
      setIsAdmin(currentUser.systemRole === 'admin');
    } catch (error) {
      // Only log if user should be signed in
      if (isSignedIn) {
        console.error('Failed to check admin status:', error);
      }
      setIsAdmin(false);
    } finally {
      setLoadingAdmin(false);
    }
  };

  const loadLeagues = async () => {
    // Double check - don't make call if not signed in
    if (!isSignedIn || !isLoaded) {
      return;
    }
    try {
      setLoadingLeagues(true);
      const userLeagues = await api.getLeagues();
      setLeagues(userLeagues);
    } catch (error) {
      // Only log if user should be signed in
      if (isSignedIn) {
        console.error('Failed to load leagues:', error);
      }
      // Don't show error to user, just silently fail
    } finally {
      setLoadingLeagues(false);
    }
  };

  return (
    <Box as="main" minH="100vh" bg="gray.50">
      <Container maxW="container.md" py={20}>
        <VStack gap={8} align="center" textAlign="center">
          <Heading as="h1" size="2xl">
            {mounted && isSignedIn && user 
              ? `Welcome, ${user.firstName || user.emailAddresses[0]?.emailAddress}!`
              : 'Welcome!'}
          </Heading>
          
          {mounted && (
            <>
              {isSignedIn ? (
                <>
                  {loadingLeagues ? (
                    <VStack gap={4}>
                      <Spinner size="lg" />
                      <Text color="gray.600">Loading your leagues...</Text>
                    </VStack>
                  ) : leagues.length > 0 ? (
                    <>
                      <Text fontSize="lg" color="gray.600">
                        Welcome back! View your league or create a new one.
                      </Text>
                      <HStack gap={6} mt={4} flexWrap="wrap" justify="center">
                        <Box
                          maxW="sm"
                          w="full"
                          bg="white"
                          p={6}
                          borderRadius="md"
                          shadow="md"
                          borderWidth="1px"
                        >
                          <VStack gap={4} align="stretch">
                            <Heading size="md">My League</Heading>
                            <Text fontSize="sm" color="gray.600">
                              {leagues.length === 1
                                ? `View ${leagues[0].name}`
                                : `You have ${leagues.length} leagues`}
                            </Text>
                            {leagues.length === 1 ? (
                              <Link href={`/leagues/${leagues[0].id}`} style={{ width: '100%' }}>
                                <Button colorScheme="orange" w="full">
                                  View League
                                </Button>
                              </Link>
                            ) : (
                              <VStack gap={2} align="stretch">
                                {leagues.slice(0, 3).map((league) => (
                                  <Link
                                    key={league.id}
                                    href={`/leagues/${league.id}`}
                                    style={{ width: '100%' }}
                                  >
                                    <Button colorScheme="orange" w="full" variant="outline">
                                      {league.name}
                                    </Button>
                                  </Link>
                                ))}
                                {leagues.length > 3 && (
                                  <Text fontSize="xs" color="gray.500" textAlign="center">
                                    +{leagues.length - 3} more league{leagues.length - 3 !== 1 ? 's' : ''}
                                  </Text>
                                )}
                              </VStack>
                            )}
                          </VStack>
                        </Box>
                        <Box
                          maxW="sm"
                          w="full"
                          bg="white"
                          p={6}
                          borderRadius="md"
                          shadow="md"
                          borderWidth="1px"
                        >
                          <VStack gap={4} align="stretch">
                            <Heading size="md">Create a League</Heading>
                            <Text fontSize="sm" color="gray.600">
                              Start your own fantasy league and invite friends to compete.
                            </Text>
                            <Link href="/leagues/create" style={{ width: '100%' }}>
                              <Button colorScheme="orange" w="full" variant="outline">
                                Create League
                              </Button>
                            </Link>
                          </VStack>
                        </Box>
                        <Box
                          maxW="sm"
                          w="full"
                          bg="white"
                          p={6}
                          borderRadius="md"
                          shadow="md"
                          borderWidth="1px"
                        >
                          <VStack gap={4} align="stretch">
                            <Heading size="md">Join a League</Heading>
                            <Text fontSize="sm" color="gray.600">
                              Join an existing league with a league ID.
                            </Text>
                            <Link href="/leagues/join" style={{ width: '100%' }}>
                              <Button colorScheme="orange" w="full" variant="outline">
                                Join League
                              </Button>
                            </Link>
                          </VStack>
                        </Box>
                        {isAdmin && (
                          <Box
                            maxW="sm"
                            w="full"
                            bg="purple.50"
                            p={6}
                            borderRadius="md"
                            shadow="md"
                            borderWidth="2px"
                            borderColor="purple.200"
                          >
                            <VStack gap={4} align="stretch">
                              <Heading size="md" color="purple.700">
                                Admin Dashboard
                              </Heading>
                              <Text fontSize="sm" color="gray.600">
                                Manage seasons and castaways for the platform.
                              </Text>
                              <Link href="/admin" style={{ width: '100%' }}>
                                <Button colorScheme="purple" w="full">
                                  Go to Admin
                                </Button>
                              </Link>
                            </VStack>
                          </Box>
                        )}
                      </HStack>
                    </>
                  ) : (
                <>
                  <Text fontSize="lg" color="gray.600">
                    Get started by creating a league or joining an existing one.
                  </Text>
                  <HStack gap={6} mt={4} flexWrap="wrap" justify="center">
                    <Box
                      maxW="sm"
                      w="full"
                      bg="white"
                      p={6}
                      borderRadius="md"
                      shadow="md"
                      borderWidth="1px"
                    >
                      <VStack gap={4} align="stretch">
                        <Heading size="md">Create a League</Heading>
                        <Text fontSize="sm" color="gray.600">
                          Start your own fantasy league and invite friends to compete.
                        </Text>
                        <Link href="/leagues/create" style={{ width: '100%' }}>
                          <Button colorScheme="orange" w="full">
                            Create League
                          </Button>
                        </Link>
                      </VStack>
                    </Box>
                    <Box
                      maxW="sm"
                      w="full"
                      bg="white"
                      p={6}
                      borderRadius="md"
                      shadow="md"
                      borderWidth="1px"
                    >
                      <VStack gap={4} align="stretch">
                        <Heading size="md">Join a League</Heading>
                        <Text fontSize="sm" color="gray.600">
                              Join an existing league with a league ID.
                        </Text>
                            <Link href="/leagues/join" style={{ width: '100%' }}>
                              <Button colorScheme="orange" w="full">
                                Join League
                        </Button>
                            </Link>
                      </VStack>
                    </Box>
                    {isAdmin && (
                      <Box
                        maxW="sm"
                        w="full"
                        bg="purple.50"
                        p={6}
                        borderRadius="md"
                        shadow="md"
                        borderWidth="2px"
                        borderColor="purple.200"
                      >
                        <VStack gap={4} align="stretch">
                          <Heading size="md" color="purple.700">
                            Admin Dashboard
                          </Heading>
                          <Text fontSize="sm" color="gray.600">
                            Manage seasons and castaways for the platform.
                          </Text>
                          <Link href="/admin" style={{ width: '100%' }}>
                            <Button colorScheme="purple" w="full">
                              Go to Admin
                            </Button>
                          </Link>
                        </VStack>
                      </Box>
                    )}
                  </HStack>
                    </>
                  )}
                </>
              ) : (
                <Text fontSize="lg" color="gray.600">
                  Click "Sign In" or "Get Started" in the navigation to authenticate.
                </Text>
              )}
            </>
          )}
        </VStack>
      </Container>
    </Box>
  );
}

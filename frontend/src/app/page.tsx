'use client';

import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Button, 
  Spinner,
  Card,
  CardBody,
  Badge,
  SimpleGrid,
} from '@chakra-ui/react';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { League } from '@/types/api';

// Landing page components
import {
  HeroSection,
  HowItWorksSection,
  WeeklyEngagementSection,
  DraftingSection,
  LeaderboardSection,
  CTASection,
  Footer,
} from '@/components/landing';

// Dashboard component for logged-in users
const Dashboard = () => {
  const { user } = useUser();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loadingLeagues, setLoadingLeagues] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadLeagues();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const currentUser = await api.getCurrentUser();
      setIsAdmin(currentUser.systemRole === 'admin');
    } catch (error) {
      console.error('Failed to check admin status:', error);
      setIsAdmin(false);
    }
  };

  const loadLeagues = async () => {
    try {
      setLoadingLeagues(true);
      const userLeagues = await api.getLeagues();
      setLeagues(userLeagues);
    } catch (error) {
      console.error('Failed to load leagues:', error);
    } finally {
      setLoadingLeagues(false);
    }
  };

  return (
    <Box as="main" minH="100vh" bg="bg.primary" position="relative" overflow="hidden">
      {/* Ambient Glow Effects */}
      <Box className="glow-orange" top="-100px" left="-50px" />
      <Box className="glow-purple" top="200px" right="-100px" />
      
      <Container maxW="container.xl" py={20} position="relative" zIndex={1}>
        <VStack gap={8} align="center" textAlign="center">
          {/* Hero Badge */}
          <Badge variant="accent" size="lg">
            Season 48 Now Live!
          </Badge>

          {/* Hero Heading */}
          <Heading 
            as="h1" 
            size="4xl"
            maxW="800px"
          >
            Welcome back, {user?.firstName || 'Champion'}!
          </Heading>
          
          {/* Subheading */}
          <Text 
            variant="bodyXl" 
            color="text.secondary" 
            maxW="600px"
          >
            Manage your teams, track your scores, and dominate your leagues.
          </Text>

          {loadingLeagues ? (
            <VStack gap={4} py={8}>
              <Spinner size="lg" color="brand.primary" />
              <Text color="text.secondary">Loading your leagues...</Text>
            </VStack>
          ) : (
            <SimpleGrid 
              columns={{ base: 1, md: 2, lg: leagues.length > 0 ? 3 : 2 }} 
              gap={6} 
              mt={8}
              w="full"
              maxW="1000px"
            >
              {/* My Leagues Card */}
              {leagues.length > 0 && (
                <Card variant="feature">
                  <CardBody>
                    <VStack gap={4} align="stretch">
                      <Badge variant="number" alignSelf="flex-end" position="absolute" top={-3} right={4}>
                        {leagues.length}
                      </Badge>
                      <Heading size="lg" color="text.primary">
                        My Leagues
                      </Heading>
                      <Text color="text.secondary" fontSize="sm">
                        {leagues.length === 1
                          ? `Continue playing in ${leagues[0].name}`
                          : `You have ${leagues.length} active leagues`}
                      </Text>
                      {leagues.length === 1 ? (
                        <Link href={`/leagues/${leagues[0].id}`} style={{ width: '100%' }}>
                          <Button variant="primary" w="full" size="md">
                            View League
                          </Button>
                        </Link>
                      ) : (
                        <VStack gap={2} align="stretch">
                          {leagues.slice(0, 2).map((league) => (
                            <Link
                              key={league.id}
                              href={`/leagues/${league.id}`}
                              style={{ width: '100%' }}
                            >
                              <Button variant="ghost" w="full" justifyContent="flex-start">
                                {league.name}
                              </Button>
                            </Link>
                          ))}
                          {leagues.length > 2 && (
                            <Text fontSize="xs" color="text.secondary" textAlign="center">
                              +{leagues.length - 2} more
                            </Text>
                          )}
                        </VStack>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              )}

              {/* Create League Card */}
              <Card variant="feature">
                <CardBody>
                  <VStack gap={4} align="stretch">
                    <Box 
                      bg="rgba(240, 101, 66, 0.1)" 
                      borderRadius="lg" 
                      p={4} 
                      w="fit-content"
                    >
                      <Text fontSize="2xl">🏝️</Text>
                    </Box>
                    <Heading size="lg" color="text.primary">
                      Create a League
                    </Heading>
                    <Text color="text.secondary" fontSize="sm">
                      Start your own fantasy league and invite friends to compete.
                    </Text>
                    <Link href="/leagues/create" style={{ width: '100%' }}>
                      <Button variant="primary" w="full" size="md">
                        Create League
                      </Button>
                    </Link>
                  </VStack>
                </CardBody>
              </Card>

              {/* Join League Card */}
              <Card variant="feature">
                <CardBody>
                  <VStack gap={4} align="stretch">
                    <Box 
                      bg="rgba(107, 126, 203, 0.1)" 
                      borderRadius="lg" 
                      p={4} 
                      w="fit-content"
                    >
                      <Text fontSize="2xl">🤝</Text>
                    </Box>
                    <Heading size="lg" color="text.primary">
                      Join a League
                    </Heading>
                    <Text color="text.secondary" fontSize="sm">
                      Enter a league code to join your friends.
                    </Text>
                    <Link href="/leagues/join" style={{ width: '100%' }}>
                      <Button variant="secondary" w="full" size="md">
                        Join League
                      </Button>
                    </Link>
                  </VStack>
                </CardBody>
              </Card>

              {/* Admin Card */}
              {isAdmin && (
                <Card variant="feature" borderColor="brand.primary" borderWidth="2px">
                  <CardBody>
                    <VStack gap={4} align="stretch">
                      <Box 
                        bg="rgba(240, 101, 66, 0.15)" 
                        borderRadius="lg" 
                        p={4} 
                        w="fit-content"
                      >
                        <Text fontSize="2xl">⚙️</Text>
                      </Box>
                      <Heading size="lg" color="brand.primary">
                        Admin Dashboard
                      </Heading>
                      <Text color="text.secondary" fontSize="sm">
                        Manage seasons and castaways for the platform.
                      </Text>
                      <Link href="/admin" style={{ width: '100%' }}>
                        <Button variant="primary" w="full" size="md">
                          Go to Admin
                        </Button>
                      </Link>
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </SimpleGrid>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

// Landing page for non-authenticated users
const LandingPage = () => {
  return (
    <Box as="main" bg="bg.primary">
      <HeroSection />
      <HowItWorksSection />
      <WeeklyEngagementSection />
      <DraftingSection />
      <LeaderboardSection />
      <CTASection />
      <Footer />
    </Box>
  );
};

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show nothing while mounting to avoid hydration mismatch
  if (!mounted || !isLoaded) {
    return (
      <Box 
        minH="100vh" 
        bg="bg.primary" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
      >
        <Spinner size="xl" color="brand.primary" />
      </Box>
    );
  }

  // Show dashboard for authenticated users, landing page for guests
  return isSignedIn ? <Dashboard /> : <LandingPage />;
}

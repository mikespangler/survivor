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
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { League } from '@/types/api';
import { AuthenticatedLayout } from '@/components/navigation';

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

// Dashboard component for logged-in users with auto-redirect
const Dashboard = () => {
  const { user } = useUser();
  const router = useRouter();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loadingLeagues, setLoadingLeagues] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    handleAutoRedirect();
  }, []);

  const handleAutoRedirect = async () => {
    try {
      setLoadingLeagues(true);
      setRedirecting(true);

      // Get user's leagues
      const userLeagues = await api.getLeagues();
      setLeagues(userLeagues);

      // No leagues → show onboarding
      if (userLeagues.length === 0) {
        setRedirecting(false);
        setLoadingLeagues(false);
        return;
      }

      // Try to get last viewed league
      const lastViewedLeague = await api.getLastViewedLeague();

      // Validate last viewed league still exists in user's leagues
      if (lastViewedLeague) {
        const stillExists = userLeagues.some((l) => l.id === lastViewedLeague.id);
        if (stillExists) {
          router.push(`/leagues/${lastViewedLeague.id}/dashboard`);
          return;
        }
      }

      // No valid last viewed league → redirect to most recent
      const mostRecent = userLeagues[0]; // Already sorted by createdAt desc
      await api.updateLastViewedLeague(mostRecent.id);
      router.push(`/leagues/${mostRecent.id}/dashboard`);
    } catch (error) {
      console.error('Auto-redirect failed:', error);
      setRedirecting(false);
    } finally {
      setLoadingLeagues(false);
    }
  };

  // Show loading while redirecting
  if (loadingLeagues || redirecting) {
    return (
      <Box minH="100vh" bg="bg.primary" display="flex" alignItems="center" justifyContent="center">
        <VStack gap={4}>
          <Spinner size="xl" color="brand.primary" />
          <Text color="text.secondary">
            {redirecting ? 'Loading your league...' : 'Loading...'}
          </Text>
        </VStack>
      </Box>
    );
  }

  // Only show onboarding if user has no leagues
  if (leagues.length === 0) {
    return (
      <AuthenticatedLayout>
        <Box as="main" minH="100vh" bg="bg.primary" position="relative" overflow="hidden">
          {/* Ambient Glow Effects */}
          <Box className="glow-orange" top="-100px" left="-50px" />
          <Box className="glow-purple" top="200px" right="-100px" />

          <Container maxW="container.xl" py={20} position="relative" zIndex={1}>
            <VStack gap={8} align="center" textAlign="center">
              <Badge variant="accent" size="lg">
                Welcome to Survivor Fantasy League!
              </Badge>

              <Heading as="h1" size="4xl" maxW="800px">
                Get Started, {user?.firstName || 'Champion'}!
              </Heading>

              <Text variant="bodyXl" color="text.secondary" maxW="600px">
                Create your first league or join an existing one to start competing.
              </Text>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} mt={8} w="full" maxW="800px">
                {/* Create League Card */}
                <Card variant="feature">
                  <CardBody>
                    <VStack gap={4} align="stretch">
                      <Box bg="rgba(240, 101, 66, 0.1)" borderRadius="lg" p={4} w="fit-content">
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
                      <Box bg="rgba(107, 126, 203, 0.1)" borderRadius="lg" p={4} w="fit-content">
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
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>
      </AuthenticatedLayout>
    );
  }

  // Shouldn't reach here if auto-redirect works
  return null;
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

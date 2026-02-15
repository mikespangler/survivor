'use client';

import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  Button,
  Spinner,
} from '@chakra-ui/react';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import type { League } from '@/types/api';
import { AuthenticatedLayout } from '@/components/navigation';

// Dynamically import landing page components to avoid SSR hydration issues
const LandingHeader = dynamic(() => import('@/components/landing/LandingHeader'), { ssr: false });
const HeroSection = dynamic(() => import('@/components/landing/HeroSection'), { ssr: false });
const HowItWorksSection = dynamic(() => import('@/components/landing/HowItWorksSection'), { ssr: false });
const WeeklyEngagementSection = dynamic(() => import('@/components/landing/WeeklyEngagementSection'), { ssr: false });
const DraftingSection = dynamic(() => import('@/components/landing/DraftingSection'), { ssr: false });
const LeaderboardSection = dynamic(() => import('@/components/landing/LeaderboardSection'), { ssr: false });
const CTASection = dynamic(() => import('@/components/landing/CTASection'), { ssr: false });
const Footer = dynamic(() => import('@/components/landing/Footer'), { ssr: false });

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
          router.push(`/leagues/${lastViewedLeague.slug || lastViewedLeague.id}/dashboard`);
          return;
        }
      }

      // No valid last viewed league → redirect to most recent
      const mostRecent = userLeagues[0]; // Already sorted by createdAt desc
      await api.updateLastViewedLeague(mostRecent.id);
      router.push(`/leagues/${mostRecent.slug || mostRecent.id}/dashboard`);
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
    const firstName = user?.firstName || 'superfan';

    return (
      <AuthenticatedLayout>
        <Box as="main" minH="100vh" bg="bg.primary" position="relative" overflow="hidden">
          {/* Background atmosphere glow */}
          <Box
            position="absolute"
            top="-120px"
            left="50%"
            transform="translateX(-50%)"
            w="600px"
            h="600px"
            bg="radial-gradient(circle, rgba(240,101,66,0.07) 0%, rgba(240,101,66,0.02) 40%, transparent 70%)"
            pointerEvents="none"
          />

          <Flex
            direction="column"
            align="center"
            justify="center"
            minH="calc(100vh - 64px)"
            px={{ base: 5, md: 9 }}
            py={{ base: 10, md: 16 }}
            position="relative"
            zIndex={1}
          >
            {/* Heading */}
            <Heading
              as="h1"
              className="anim d1"
              fontFamily="heading"
              fontSize={{ base: '40px', md: '56px' }}
              letterSpacing="3px"
              textAlign="center"
              lineHeight="1.05"
            >
              COME ON IN, {firstName.toUpperCase()}
              <br />
              <Box as="span" color="brand.primary">
                THE GAME AWAITS
              </Box>
            </Heading>

            {/* Subtitle */}
            <Text
              className="anim d2"
              color="text.secondary"
              fontSize={{ base: '15px', md: '16px' }}
              textAlign="center"
              mt={3}
              maxW="420px"
              lineHeight="1.5"
            >
              Create a league and invite your friends, or join one that&apos;s already been set up. Either way&nbsp;&mdash; it&apos;s time to play.
            </Text>

            {/* Action Cards */}
            <Flex
              className="anim d3"
              direction={{ base: 'column', md: 'row' }}
              gap={{ base: 4, md: '18px' }}
              mt={9}
              w="full"
              maxW="580px"
              align={{ base: 'stretch', md: 'center' }}
            >
              {/* Create a League - Primary Card */}
              <Box
                flex={1}
                borderRadius="14px"
                p={{ base: 6, md: 7 }}
                textAlign="center"
                position="relative"
                overflow="hidden"
                bg="linear-gradient(145deg, rgba(240,101,66,0.15) 0%, rgba(240,101,66,0.05) 100%)"
                border="1px solid"
                borderColor="rgba(240,101,66,0.25)"
                transition="all 0.2s ease"
                _hover={{
                  borderColor: 'rgba(240,101,66,0.45)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 32px rgba(240,101,66,0.15)',
                }}
              >
                {/* Corner glow */}
                <Box
                  position="absolute"
                  top="-40px"
                  right="-40px"
                  w="100px"
                  h="100px"
                  bg="radial-gradient(circle, rgba(240,101,66,0.12) 0%, transparent 70%)"
                  pointerEvents="none"
                />
                <Flex
                  w="48px"
                  h="48px"
                  borderRadius="12px"
                  bg="rgba(240,101,66,0.15)"
                  align="center"
                  justify="center"
                  mx="auto"
                  mb={4}
                  fontSize="22px"
                >
                  🏕️
                </Flex>
                <Heading
                  fontFamily="heading"
                  fontSize="24px"
                  letterSpacing="1.5px"
                  mb="6px"
                  color="text.primary"
                >
                  CREATE A LEAGUE
                </Heading>
                <Text fontSize="13px" color="text.secondary" lineHeight="1.5" mb={5}>
                  Start your own fantasy league and send invite codes to your friends.
                </Text>
                <Link href="/leagues/create" style={{ width: '100%' }}>
                  <Button variant="primary" w="full" size="md">
                    Create League &rarr;
                  </Button>
                </Link>
              </Box>

              {/* OR Divider */}
              <Flex align="center" justify="center" flexShrink={0} alignSelf="center">
                <Text
                  fontFamily="body"
                  fontSize="12px"
                  fontWeight={600}
                  letterSpacing="2px"
                  color="text.secondary"
                >
                  OR
                </Text>
              </Flex>

              {/* Join a League - Secondary Card */}
              <Box
                flex={1}
                borderRadius="14px"
                p={{ base: 6, md: 7 }}
                textAlign="center"
                position="relative"
                overflow="hidden"
                bg="bg.secondary"
                border="1px solid"
                borderColor="whiteAlpha.100"
                transition="all 0.2s ease"
                _hover={{
                  borderColor: 'whiteAlpha.200',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                }}
              >
                <Flex
                  w="48px"
                  h="48px"
                  borderRadius="12px"
                  bg="whiteAlpha.100"
                  align="center"
                  justify="center"
                  mx="auto"
                  mb={4}
                  fontSize="22px"
                >
                  🤝
                </Flex>
                <Heading
                  fontFamily="heading"
                  fontSize="24px"
                  letterSpacing="1.5px"
                  mb="6px"
                  color="text.primary"
                >
                  JOIN A LEAGUE
                </Heading>
                <Text fontSize="13px" color="text.secondary" lineHeight="1.5" mb={5}>
                  Got an invite code? Enter it here to join your friends&apos; league.
                </Text>
                <Link href="/leagues/join" style={{ width: '100%' }}>
                  <Button variant="secondary" w="full" size="md">
                    Join League
                  </Button>
                </Link>
              </Box>
            </Flex>

            {/* How It Works Section */}
            <Box className="anim d4" mt={12} w="full" maxW="640px">
              <Text
                textAlign="center"
                fontFamily="heading"
                fontSize="13px"
                letterSpacing="3px"
                textTransform="uppercase"
                color="text.secondary"
                mb="18px"
              >
                How It Works
              </Text>
              <Flex
                bg="bg.secondary"
                border="1px solid"
                borderColor="whiteAlpha.100"
                borderRadius="12px"
                overflow="hidden"
                direction={{ base: 'column', md: 'row' }}
              >
                {/* Step 01 */}
                <Box
                  flex={1}
                  p={{ base: '16px', md: '20px 16px' }}
                  textAlign="center"
                  position="relative"
                  borderBottom={{ base: '1px solid', md: 'none' }}
                  borderRight={{ base: 'none', md: '1px solid' }}
                  borderColor="whiteAlpha.50"
                >
                  <Text fontFamily="heading" fontSize="24px" color="brand.primary" lineHeight="1" mb="6px">
                    01
                  </Text>
                  <Text fontFamily="body" fontSize="14px" fontWeight={700} color="text.primary" letterSpacing="0.5px" mb={1}>
                    Draft 5 Castaways
                  </Text>
                  <Text fontSize="12px" color="text.secondary" lineHeight="1.45">
                    Lock in your tribe after the premiere. No changes after Ep.&nbsp;2.
                  </Text>
                </Box>

                {/* Step 02 */}
                <Box
                  flex={1}
                  p={{ base: '16px', md: '20px 16px' }}
                  textAlign="center"
                  position="relative"
                  borderBottom={{ base: '1px solid', md: 'none' }}
                  borderRight={{ base: 'none', md: '1px solid' }}
                  borderColor="whiteAlpha.50"
                >
                  <Text fontFamily="heading" fontSize="24px" color="brand.primary" lineHeight="1" mb="6px">
                    02
                  </Text>
                  <Text fontFamily="body" fontSize="14px" fontWeight={700} color="text.primary" letterSpacing="0.5px" mb={1}>
                    Pick Every Week
                  </Text>
                  <Text fontSize="12px" color="text.secondary" lineHeight="1.45">
                    Answer 3 bonus questions before each episode airs.
                  </Text>
                </Box>

                {/* Step 03 */}
                <Box
                  flex={1}
                  p={{ base: '16px', md: '20px 16px' }}
                  textAlign="center"
                >
                  <Text fontFamily="heading" fontSize="24px" color="brand.primary" lineHeight="1" mb="6px">
                    03
                  </Text>
                  <Text fontFamily="body" fontSize="14px" fontWeight={700} color="text.primary" letterSpacing="0.5px" mb={1}>
                    Outlast Everyone
                  </Text>
                  <Text fontSize="12px" color="text.secondary" lineHeight="1.45">
                    Earn points all season. Top the standings. Claim bragging rights.
                  </Text>
                </Box>
              </Flex>
              <Link href="/how-to-play">
                <Text
                  display="block"
                  textAlign="center"
                  mt="14px"
                  fontFamily="heading"
                  fontSize="14px"
                  letterSpacing="2px"
                  textTransform="uppercase"
                  color="brand.primary"
                  cursor="pointer"
                  _hover={{ color: 'brand.yellow' }}
                >
                  Full Rules &amp; Scoring &rarr;
                </Text>
              </Link>
            </Box>
          </Flex>
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
      <LandingHeader />
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

  // Fire Google Ads conversion event for new sign-ups.
  // Polls for gtag readiness since the script loads async.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('signup') !== '1') return;

    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max

    const tryFire = () => {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'conversion', {
          send_to: 'AW-17954695105/317dCLz09_gbEMHPu_FC',
          value: 1.0,
          currency: 'USD',
        });
        window.history.replaceState({}, '', '/');
        return;
      }
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(tryFire, 100);
      } else {
        // Clean URL even if gtag never loaded (ad blocker, etc.)
        window.history.replaceState({}, '', '/');
      }
    };

    tryFire();
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
        suppressHydrationWarning
      >
        <Spinner size="xl" color="brand.primary" />
      </Box>
    );
  }

  // Show dashboard for authenticated users, landing page for guests
  return isSignedIn ? <Dashboard /> : <LandingPage />;
}

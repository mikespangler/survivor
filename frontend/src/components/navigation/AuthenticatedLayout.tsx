'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Box, Flex, Spinner } from '@chakra-ui/react';
import { Sidebar } from '@/components/dashboard';
import { AuthenticatedHeader } from './AuthenticatedHeader';
import { api } from '@/lib/api';
import type { League, SeasonMetadata, User } from '@/types/api';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [league, setLeague] = useState<League | null>(null);
  const [seasonMetadata, setSeasonMetadata] = useState<SeasonMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLeagues, setUserLeagues] = useState<League[]>([]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      // Redirect to sign-in with the current path as return URL
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/sign-in?redirect_url=${returnUrl}`);
      return;
    }

    loadLayoutData();
  }, [isLoaded, isSignedIn, pathname]);

  const loadLayoutData = async () => {
    try {
      setLoading(true);

      // Fetch current user to check admin status
      const user = await api.getCurrentUser();
      setCurrentUser(user);
      setIsAdmin(user.systemRole === 'admin');

      // Check if we're on a league page
      const leagueMatch = pathname.match(/^\/leagues\/([^\/]+)/);
      const leagueId = leagueMatch?.[1];

      if (leagueId) {
        // Fetch league data
        const userLeagues = await api.getLeagues();
        setUserLeagues(userLeagues);
        const currentLeague = userLeagues.find((l) => l.id === leagueId);

        if (currentLeague) {
          setLeague(currentLeague);

          // Find active season
          const activeSeason = currentLeague.leagueSeasons?.find(
            (ls: any) => ls.season?.status === 'ACTIVE'
          );

          if (activeSeason) {
            // Fetch season metadata
            const metadata = await api.getSeasonMetadata(activeSeason.seasonId);
            setSeasonMetadata(metadata);
          }
        }
      } else {
        // Not on a league page - clear league context
        setLeague(null);
        setSeasonMetadata(null);
        setUserLeagues([]);
      }
    } catch (error) {
      console.error('Failed to load layout data:', error);
      // Don't block rendering on errors - let individual pages handle them
      setIsAdmin(false);
      setLeague(null);
      setSeasonMetadata(null);
    } finally {
      setLoading(false);
    }
  };

  // Update last viewed league when league context changes
  useEffect(() => {
    if (league?.id) {
      api.updateLastViewedLeague(league.id).catch((err) => {
        console.error('Failed to update last viewed league:', err);
      });
    }
  }, [league?.id]);

  if (!isLoaded || loading) {
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

  return (
    <Box minH="100vh" bg="bg.primary">
      <AuthenticatedHeader userName={currentUser?.name} />
      <Flex pt="64px">
        <Sidebar
          league={league}
          seasonMetadata={seasonMetadata}
          isAdmin={isAdmin}
          currentLeagueId={league?.id}
          userLeagues={userLeagues}
          currentUser={currentUser}
        />
        <Box flex="1" overflowY="auto" minH="calc(100vh - 64px)">
          {children}
        </Box>
      </Flex>
    </Box>
  );
}

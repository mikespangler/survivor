'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Box, Flex, Spinner } from '@chakra-ui/react';
import { Sidebar } from '@/components/dashboard';
import { AuthenticatedHeader } from './AuthenticatedHeader';
import { api } from '@/lib/api';
import type { League, SeasonMetadata, User, LeagueEpisodeState } from '@/types/api';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [league, setLeague] = useState<League | null>(null);
  const [seasonMetadata, setSeasonMetadata] = useState<SeasonMetadata | null>(null);
  const [currentEpisodeState, setCurrentEpisodeState] = useState<LeagueEpisodeState | null>(null);
  const [isCommissioner, setIsCommissioner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLeagues, setUserLeagues] = useState<League[]>([]);

  // Ensure consistent hydration by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

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
        const currentLeague = userLeagues.find((l) => l.slug === leagueId || l.id === leagueId);

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

            // Fetch episode states for the sidebar badge
            try {
              const episodeStates = await api.getEpisodeStates(leagueId, activeSeason.seasonId);
              const currentState = episodeStates.episodes.find(e => e.isCurrentEpisode) || episodeStates.episodes[0];
              setCurrentEpisodeState(currentState || null);
              setIsCommissioner(episodeStates.isCommissioner);
            } catch (err) {
              console.log('Failed to load episode states for sidebar:', err);
              setCurrentEpisodeState(null);
              setIsCommissioner(false);
            }
          }
        }
      } else {
        // Not on a league page - clear league context
        setLeague(null);
        setSeasonMetadata(null);
        setCurrentEpisodeState(null);
        setIsCommissioner(false);
        setUserLeagues([]);
      }
    } catch (error) {
      console.error('Failed to load layout data:', error);
      // Don't block rendering on errors - let individual pages handle them
      setIsAdmin(false);
      setLeague(null);
      setSeasonMetadata(null);
      setCurrentEpisodeState(null);
      setIsCommissioner(false);
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

  if (!mounted || !isLoaded || loading) {
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

  return (
    <Box minH="100vh" bg="bg.primary">
      <AuthenticatedHeader userName={currentUser?.name} seasonMetadata={seasonMetadata} leagueId={league?.id} />
      <Flex pt="64px">
        <Sidebar
          league={league}
          seasonMetadata={seasonMetadata}
          isAdmin={isAdmin}
          currentLeagueId={league?.id}
          userLeagues={userLeagues}
          currentUser={currentUser}
          currentEpisodeState={currentEpisodeState}
          isCommissioner={isCommissioner}
        />
        <Box flex="1" overflowY="auto" minH="calc(100vh - 64px)">
          {children}
        </Box>
      </Flex>
    </Box>
  );
}

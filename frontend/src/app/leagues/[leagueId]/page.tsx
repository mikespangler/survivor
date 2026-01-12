'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Spinner } from '@chakra-ui/react';

interface LeaguePageProps {
  params: Promise<{ leagueId: string }>;
}

/**
 * Redirect from /leagues/[leagueId] to /leagues/[leagueId]/dashboard
 * The dashboard is the main entry point for a league.
 */
export default function LeaguePage({ params }: LeaguePageProps) {
  const { leagueId } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/leagues/${leagueId}/dashboard`);
  }, [leagueId, router]);

  return (
    <Box minH="100vh" bg="bg.primary" display="flex" alignItems="center" justifyContent="center">
      <Spinner size="xl" color="brand.primary" />
    </Box>
  );
}

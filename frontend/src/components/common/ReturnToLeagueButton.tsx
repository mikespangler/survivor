'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@chakra-ui/react';
import { ChevronDownIcon } from '@/components/dashboard/icons';
import { api } from '@/lib/api';
import type { League } from '@/types/api';

export function ReturnToLeagueButton() {
  const router = useRouter();
  const [targetLeague, setTargetLeague] = useState<League | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [userLeagues, lastViewed] = await Promise.all([
          api.getLeagues(),
          api.getLastViewedLeague(),
        ]);

        if (cancelled || userLeagues.length === 0) return;

        // Prefer last viewed league if user is still a member
        const lastViewedStillMember =
          lastViewed && userLeagues.some((l) => l.id === lastViewed.id);

        const league = lastViewedStillMember ? lastViewed : userLeagues[0];
        if (!cancelled) setTargetLeague(league);
      } catch {
        // Silently fail - user may not have leagues
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!targetLeague) return null;

  const href = `/leagues/${targetLeague.slug || targetLeague.id}/dashboard`;

  return (
    <Button
      variant="primary"
      size="sm"
      onClick={() => router.push(href)}
      leftIcon={
        <ChevronDownIcon
          boxSize="16px"
          transform="rotate(90deg)"
          aria-hidden
        />
      }
    >
      Return to League
    </Button>
  );
}

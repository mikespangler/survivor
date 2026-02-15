'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { api } from '@/lib/api';

export function useTrackPageView(page: string, metadata?: Record<string, any>) {
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (!isSignedIn) return;

    api.trackPageView(page, metadata).catch(() => {
      // Silently ignore tracking failures
    });
  }, [isSignedIn, page]); // metadata intentionally excluded to avoid re-tracking
}

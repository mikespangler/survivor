'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { api } from '@/lib/api';

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    // Set the token getter for the API client
    api.setTokenGetter(() => getToken());
  }, [getToken]);

  return <>{children}</>;
}


'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { api } from '@/lib/api';

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Set the token getter for the API client
    // Clerk's getToken() returns a JWT token
    api.setTokenGetter(async () => {
      try {
        // Get the JWT token from Clerk
        // We don't manually check isSignedIn here to avoid stale closures
        // Clerk's getToken() will return null if the user is not signed in
        const token = await getToken();

        if (!token) {
          // Only log if we really expected a token (though we can't easily know that here without checking isSignedIn)
          // But logging here is noisy if the user is just anonymous
        } else {
          // console.log('✅ Successfully retrieved Clerk token');
        }

        return token;
      } catch (error) {
        console.error('❌ Failed to get token from Clerk:', error);
        return null;
      }
    });

    // Set redirect callback for 401 errors
    api.setRedirectCallback(() => {
      console.warn('🔒 Unauthorized access detected. Redirecting to home...');
      router.push('/');
    });
  }, [getToken, router]);

  return <>{children}</>;
}


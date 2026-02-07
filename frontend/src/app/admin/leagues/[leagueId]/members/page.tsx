'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Container, Spinner, Text, VStack } from '@chakra-ui/react';
import { api } from '@/lib/api';
import { MemberManagement } from '@/components/members';

export default function AdminLeagueMembersPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.leagueId as string;

  const [league, setLeague] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeague = async () => {
      try {
        setLoading(true);
        const leagueData = await api.getAdminLeague(leagueId);
        setLeague(leagueData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load league');
      } finally {
        setLoading(false);
      }
    };

    loadLeague();
  }, [leagueId]);

  if (loading) {
    return (
      <Box minH="100vh" py={20} display="flex" justifyContent="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box
          bg="red.900"
          borderColor="red.500"
          borderWidth="1px"
          borderRadius="md"
          p={4}
        >
          <VStack align="start" gap={2}>
            <Text fontWeight="bold" color="red.200">
              Error
            </Text>
            <Text color="red.300">{error}</Text>
          </VStack>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <MemberManagement
        leagueId={leagueId}
        leagueName={league?.name || ''}
        mode="admin"
        showBackButton
        onBack={() => router.push('/admin')}
      />
    </Container>
  );
}

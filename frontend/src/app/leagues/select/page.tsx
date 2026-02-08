'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Card,
  CardBody,
  Spinner,
} from '@chakra-ui/react';
import { AuthenticatedLayout } from '@/components/navigation';
import { api } from '@/lib/api';
import type { League } from '@/types/api';

export default function LeagueSelectorPage() {
  const router = useRouter();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeagues();
  }, []);

  const loadLeagues = async () => {
    try {
      const userLeagues = await api.getLeagues();
      setLeagues(userLeagues);
    } catch (error) {
      console.error('Failed to load leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeagueSelect = async (league: { id: string; slug: string }) => {
    try {
      await api.updateLastViewedLeague(league.id);
      router.push(`/leagues/${league.slug || league.id}/dashboard`);
    } catch (error) {
      console.error('Failed to select league:', error);
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <Box minH="100vh" bg="bg.primary" display="flex" alignItems="center" justifyContent="center">
          <Spinner size="xl" color="brand.primary" />
        </Box>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <Box as="main" minH="100vh" bg="bg.primary" py={20}>
        <Container maxW="container.xl">
          <VStack gap={8} align="stretch">
            <Heading size="2xl" color="text.primary">
              Select a League
            </Heading>

            {leagues.length === 0 ? (
              <Text color="text.secondary">
                You don't have any leagues yet. Use the sidebar to create or join one!
              </Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                {leagues.map((league) => (
                  <Card
                    key={league.id}
                    variant="feature"
                    cursor="pointer"
                    onClick={() => handleLeagueSelect(league)}
                    _hover={{ borderColor: 'brand.primary' }}
                  >
                    <CardBody>
                      <VStack gap={4} align="stretch">
                        <Heading size="md" color="text.primary">
                          {league.name}
                        </Heading>
                        {league.description && (
                          <Text color="text.secondary" fontSize="sm">
                            {league.description}
                          </Text>
                        )}
                        <Text color="text.secondary" fontSize="xs">
                          {league.members?.length || 0} member{league.members?.length !== 1 ? 's' : ''}
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </VStack>
        </Container>
      </Box>
    </AuthenticatedLayout>
  );
}

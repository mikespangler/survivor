'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
} from '@chakra-ui/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@/lib/api';

export default function JoinLeaguePage() {
  const router = useRouter();
  const { isSignedIn } = useUser();

  const [leagueId, setLeagueId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not signed in (client-side only)
  useEffect(() => {
    if (isSignedIn === false) {
      router.push('/');
    }
  }, [isSignedIn, router]);

  // Don't render form until we know auth status
  if (isSignedIn === false || isSignedIn === undefined) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!leagueId.trim()) {
      setError('League ID is required');
      return;
    }

    try {
      setLoading(true);

      const league = await api.joinLeague({ leagueId: leagueId.trim() });

      // Redirect to league show page after successful join
      router.push(`/leagues/${league.id}`);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to join league';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box as="main" minH="100vh" py={10}>
      <Container maxW="container.md">
        <VStack gap={6} align="stretch">
          <Heading as="h1" size="xl">
            Join a League
          </Heading>

          {error && (
            <Box
              bg="red.50"
              borderColor="red.200"
              borderWidth="1px"
              borderRadius="md"
              p={4}
            >
              <VStack align="start" gap={2}>
                <Text fontWeight="bold" color="red.800">
                  Error
                </Text>
                <Text color="red.700">{error}</Text>
              </VStack>
            </Box>
          )}

          <Box bg="bg.secondary" p={6} borderRadius="md" shadow="sm">
            <form onSubmit={handleSubmit}>
              <VStack gap={6} align="stretch">
                <FormControl isRequired>
                  <FormLabel>League ID</FormLabel>
                  <Input
                    type="text"
                    value={leagueId}
                    onChange={(e) => setLeagueId(e.target.value)}
                    placeholder="Enter league ID"
                  />
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    Enter the league ID provided by the league owner.
                  </Text>
                </FormControl>

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={loading}
                  loadingText="Joining..."
                  isDisabled={!leagueId.trim()}
                  size="lg"
                >
                  Join League
                </Button>
              </VStack>
            </form>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}


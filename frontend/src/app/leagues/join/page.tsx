'use client';

import { useState } from 'react';
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
import { api } from '@/lib/api';
import { AuthenticatedLayout } from '@/components/navigation';

export default function JoinLeaguePage() {
  const router = useRouter();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError('League code is required');
      return;
    }

    try {
      setLoading(true);

      const input = code.trim();
      let league;

      // Extract token from URL if it's a full invite link
      let token = input;
      if (input.includes('/leagues/join/')) {
        const match = input.match(/\/leagues\/join\/([^\/\?]+)/);
        token = match ? match[1] : input;
      }

      // Try as invite token first (more common flow)
      try {
        league = await api.joinLeagueByToken({ token });
      } catch (tokenError) {
        // If token fails, try as league ID
        league = await api.joinLeague({ leagueId: input });
      }

      // Redirect to league dashboard after successful join
      router.push(`/leagues/${league.slug || league.id}/dashboard`);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to join league';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthenticatedLayout>
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
                  <FormLabel>League Code or Invite Link</FormLabel>
                  <Input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter invite code or paste invite link"
                  />
                  <Text fontSize="sm" color="text.secondary" mt={2}>
                    Enter the invite code from your league commissioner, or paste the full invite link.
                  </Text>
                </FormControl>

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={loading}
                  loadingText="Joining..."
                  isDisabled={!code.trim()}
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
    </AuthenticatedLayout>
  );
}


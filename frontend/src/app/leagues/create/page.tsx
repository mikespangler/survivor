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
  Textarea,
  Button,
  Text,
  Divider,
} from '@chakra-ui/react';
import { api } from '@/lib/api';
import { AuthenticatedLayout } from '@/components/navigation';
import type { CreateLeagueDto } from '@/types/api';

export default function CreateLeaguePage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [inviteEmails, setInviteEmails] = useState('');
  const [castawaysPerTeam, setCastawaysPerTeam] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('League name is required');
      return;
    }

    try {
      setLoading(true);

      // Parse invite emails (comma-separated)
      const emails = inviteEmails
        .split(',')
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      const createDto: CreateLeagueDto = {
        name: name.trim(),
        description: description.trim() || undefined,
        inviteEmails: emails.length > 0 ? emails : undefined,
        castawaysPerTeam: castawaysPerTeam > 0 ? castawaysPerTeam : undefined,
      };

      const league = await api.createLeague(createDto);

      setSuccessMessage(`"${league.name}" has been created successfully!`);
      
      // Redirect to league settings page after a short delay
      setTimeout(() => {
        router.push(`/leagues/${league.slug || league.id}/settings`);
      }, 1500);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create league';
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
              Create a League
            </Heading>

          {successMessage && (
            <Box
              bg="green.50"
              borderColor="green.200"
              borderWidth="1px"
              borderRadius="md"
              p={4}
            >
              <VStack align="start" gap={2}>
                <Text fontWeight="bold" color="green.800">
                  Success
                </Text>
                <Text color="green.700">{successMessage}</Text>
              </VStack>
            </Box>
          )}

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
                  <FormLabel>League Name</FormLabel>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter league name"
                    maxLength={100}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Description (Optional)</FormLabel>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your league..."
                    rows={4}
                    maxLength={500}
                  />
                </FormControl>

                <Divider />

                <FormControl isRequired>
                  <FormLabel>Castaways per Team</FormLabel>
                  <Input
                    type="number"
                    min={1}
                    max={18}
                    value={castawaysPerTeam}
                    onChange={(e) =>
                      setCastawaysPerTeam(parseInt(e.target.value, 10) || 0)
                    }
                    placeholder="5"
                  />
                  <Text fontSize="sm" color="text.secondary" mt={2}>
                    How many castaways each team drafts. You can change this later
                    in League Settings before the draft starts.
                  </Text>
                </FormControl>

                <Divider />

                <Box>
                  <FormControl>
                    <FormLabel>Invite People (Optional)</FormLabel>
                    <Input
                      type="text"
                      value={inviteEmails}
                      onChange={(e) => setInviteEmails(e.target.value)}
                      placeholder="email1@example.com, email2@example.com"
                    />
                    <Text fontSize="sm" color="text.secondary" mt={2}>
                      Enter email addresses separated by commas. Invite functionality
                      is coming soon and will not be processed yet.
                    </Text>
                  </FormControl>
                </Box>

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={loading}
                  loadingText="Creating..."
                  isDisabled={!name.trim() || castawaysPerTeam < 1}
                  size="lg"
                >
                  Create League
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


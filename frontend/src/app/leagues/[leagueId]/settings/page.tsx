'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Spinner,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  IconButton,
  useToast,
  Select,
} from '@chakra-ui/react';
import { CopyIcon, DeleteIcon } from '@/components/dashboard/icons';
import { useUser } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { AuthenticatedLayout } from '@/components/navigation';
import type {
  League,
  DraftConfig,
  Season,
  InviteLink,
  CommissionersResponse,
  User,
} from '@/types/api';

export default function LeagueSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { user: clerkUser, isSignedIn } = useUser();
  const toast = useToast();
  const leagueId = params.leagueId as string;

  const [league, setLeague] = useState<League | null>(null);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [draftConfig, setDraftConfig] = useState<DraftConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [castawaysPerTeam, setCastawaysPerTeam] = useState<number>(0);

  // Invite and member management state
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([]);
  const [commissioners, setCommissioners] = useState<CommissionersResponse | null>(null);
  const [inviteEmails, setInviteEmails] = useState<string>('');
  const [newCommissionerId, setNewCommissionerId] = useState<string>('');
  const [isCommissioner, setIsCommissioner] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch league
      const leagueData = await api.getLeague(leagueId);
      setLeague(leagueData);

      // Get current user's database ID
      try {
        const currentUser = await api.getCurrentUser();

        // Check if user is commissioner
        const isOwner = leagueData.ownerId === currentUser.id;
        const isCommissionerUser =
          leagueData.commissioners?.some((c) => c.id === currentUser.id) || false;
        setIsCommissioner(isOwner || isCommissionerUser);

        // Load invite links and commissioners if user is commissioner
        if (isOwner || isCommissionerUser) {
          try {
            const links = await api.getInviteLinks(leagueId);
            setInviteLinks(links);
          } catch {
            // Ignore errors - user might not have permission
          }

          try {
            const comms = await api.getCommissioners(leagueId);
            setCommissioners(comms);
          } catch {
            // Ignore errors - user might not have permission
          }
        }
      } catch {
        // Ignore errors - user might not be loaded yet
      }

      // Find active or upcoming season
      const seasons = await api.getSeasons();
      const activeOrUpcoming = seasons.find(
        (s) => s.status === 'ACTIVE' || s.status === 'UPCOMING',
      );

      if (!activeOrUpcoming) {
        setError('No active or upcoming season found');
        setLoading(false);
        return;
      }

      setActiveSeason(activeOrUpcoming);

      // Fetch draft config for round 1
      try {
        const config = await api.getDraftConfig(
          leagueId,
          activeOrUpcoming.id,
          1,
        );
        if (config) {
          setDraftConfig(config);
          setCastawaysPerTeam(config.castawaysPerTeam);
        }
      } catch {
        // Draft config might not exist yet, that's okay
        console.log('No draft config found, will create on save');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load league settings';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    if (!isSignedIn || !clerkUser) {
      router.push('/');
      return;
    }

    loadData();
  }, [isSignedIn, clerkUser, router, loadData]);

  const handleCopyLink = (link: string) => {
    const fullLink = `${window.location.origin}${link}`;
    navigator.clipboard.writeText(fullLink);
    toast({
      title: 'Link copied!',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleGenerateInviteLink = async () => {
    try {
      const newLink = await api.generateInviteLink(leagueId);
      setInviteLinks([newLink, ...inviteLinks]);
      toast({
        title: 'Invite link generated!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate link';
      toast({
        title: 'Failed to generate link',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRevokeLink = async (tokenId: string) => {
    try {
      await api.revokeInviteLink(leagueId, tokenId);
      setInviteLinks(inviteLinks.filter((link) => link.id !== tokenId));
      toast({
        title: 'Link revoked',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to revoke link';
      toast({
        title: 'Failed to revoke link',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleInviteByEmail = async () => {
    const emails = inviteEmails
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    if (emails.length === 0) {
      toast({
        title: 'Please enter at least one email',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    try {
      await api.inviteByEmail(leagueId, { emails });
      setInviteEmails('');
      toast({
        title: 'Invitations recorded',
        description: 'You can share invite links with these users',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record invitations';
      toast({
        title: 'Failed to record invitations',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAddCommissioner = async () => {
    if (!newCommissionerId) {
      toast({
        title: 'Please select a member',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    try {
      const updated = await api.addCommissioner(leagueId, {
        userId: newCommissionerId,
      });
      setCommissioners(updated);
      setNewCommissionerId('');
      toast({
        title: 'Commissioner added',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add commissioner';
      toast({
        title: 'Failed to add commissioner',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRemoveCommissioner = async (userId: string) => {
    try {
      await api.removeCommissioner(leagueId, userId);
      if (commissioners) {
        setCommissioners({
          ...commissioners,
          commissioners: commissioners.commissioners.filter(
            (c) => c.id !== userId,
          ),
        });
      }
      toast({
        title: 'Commissioner removed',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove commissioner';
      toast({
        title: 'Failed to remove commissioner',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSeason || castawaysPerTeam < 1) return;

    setSaving(true);
    try {
      await api.updateDraftConfig(leagueId, activeSeason.id, {
        castawaysPerTeam,
      });
      toast({
        title: 'Settings saved',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      // Reload to get updated config
      await loadData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings';
      toast({
        title: 'Failed to save settings',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const getMemberRole = (memberId: string): string => {
    if (league?.ownerId === memberId) return 'Owner';
    if (commissioners?.commissioners.some((c) => c.id === memberId))
      return 'Commissioner';
    return 'Member';
  };

  const getAllMembers = (): User[] => {
    const members: User[] = [];
    if (league?.owner) members.push(league.owner);
    if (league?.members) {
      league.members.forEach((m) => {
        if (m.id !== league.ownerId && !members.find((mem) => mem.id === m.id)) {
          members.push(m);
        }
      });
    }
    return members;
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <Box as="main" minH="100vh" bg="transparent" py={20}>
          <Container maxW="container.md">
            <VStack gap={4}>
              <Spinner size="xl" />
              <Text>Loading league settings...</Text>
            </VStack>
          </Container>
        </Box>
      </AuthenticatedLayout>
    );
  }

  if (error && !league) {
    return (
      <AuthenticatedLayout>
        <Box as="main" minH="100vh" bg="transparent" py={20}>
          <Container maxW="container.md">
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
        </Box>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <Box as="main" minH="100vh" bg="transparent" py={10}>
      <Container maxW="container.md">
        <VStack gap={6} align="stretch">
          <Heading as="h1" size="xl">
            League Settings
          </Heading>

          {league && (
            <Text fontSize="lg" color="text.secondary">
              {league.name}
              {activeSeason && ` - ${activeSeason.name}`}
            </Text>
          )}

          {successMessage && (
            <Box
              bg="green.900"
              borderColor="green.500"
              borderWidth="1px"
              borderRadius="md"
              p={4}
            >
              <VStack align="start" gap={2}>
                <Text fontWeight="bold" color="green.200">
                  Success
                </Text>
                <Text color="green.300">{successMessage}</Text>
              </VStack>
            </Box>
          )}

          {error && (
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
          )}

          {/* Members Section */}
          {isCommissioner && (
            <Box p={6} borderRadius="md" borderWidth="1px">
              <VStack gap={4} align="stretch">
                <Heading as="h2" size="md">
                  Members
                </Heading>

                {/* Current Members List */}
                <VStack align="stretch" gap={2}>
                  {league?.owner && (
                    <HStack justify="space-between" p={2} borderRadius="md" bg="bg.secondary">
                      <VStack align="start" gap={0}>
                        <HStack gap={2}>
                          <Text fontWeight="bold">
                            {league.owner.name || league.owner.email || 'Unknown'}
                          </Text>
                          <Badge colorScheme="purple">Owner</Badge>
                        </HStack>
                        {league.owner.email && (
                          <Text fontSize="sm" color="text.secondary">
                            {league.owner.email}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                  )}

                  {getAllMembers()
                    .filter((member) => member.id !== league?.ownerId)
                    .map((member) => (
                    <HStack
                      key={member.id}
                      justify="space-between"
                      p={2}
                      borderRadius="md"
                      bg="bg.secondary"
                    >
                      <VStack align="start" gap={0}>
                        <HStack gap={2}>
                          <Text fontWeight="bold">
                            {member.name || member.email || 'Unknown'}
                          </Text>
                          <Badge
                            colorScheme={
                              getMemberRole(member.id) === 'Commissioner'
                                ? 'blue'
                                : 'gray'
                            }
                          >
                            {getMemberRole(member.id)}
                          </Badge>
                        </HStack>
                        {member.email && (
                          <Text fontSize="sm" color="text.secondary">
                            {member.email}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                  ))}
                </VStack>

                {/* Invite Members Accordion */}
                <Accordion allowToggle>
                  <AccordionItem>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        <Text fontWeight="bold">Invite Members</Text>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel>
                      <VStack gap={4} align="stretch">
                        {/* Invite by Email */}
                        <Box>
                          <FormControl mb={4}>
                            <FormLabel>Invite by Email</FormLabel>
                            <Input
                              placeholder="email1@example.com, email2@example.com"
                              value={inviteEmails}
                              onChange={(e) => setInviteEmails(e.target.value)}
                            />
                            <Text fontSize="sm" color="text.secondary" mt={2}>
                              Enter comma-separated email addresses. You can share
                              invite links with these users.
                            </Text>
                          </FormControl>
                          <Button
                            variant="primary"
                            onClick={handleInviteByEmail}
                            isDisabled={!inviteEmails.trim()}
                          >
                            Record Invitations
                          </Button>
                        </Box>

                        {/* Invite by Link */}
                        <Box>
                          <FormLabel mb={2}>Invite by Link</FormLabel>
                          <Button
                            variant="primary"
                            onClick={handleGenerateInviteLink}
                            mb={4}
                          >
                            Generate New Invite Link
                          </Button>

                          {inviteLinks.length > 0 && (
                            <VStack align="stretch" gap={2}>
                              {inviteLinks.map((link) => (
                                <HStack
                                  key={link.id}
                                  p={3}
                                  borderRadius="md"
                                  bg="bg.secondary"
                                  justify="space-between"
                                >
                                  <VStack align="start" gap={1} flex={1}>
                                    <Text fontSize="sm" fontFamily="mono">
                                      {window.location.origin}
                                      {link.link}
                                    </Text>
                                    <HStack gap={2} fontSize="xs" color="text.secondary">
                                      <Text>
                                        Expires:{' '}
                                        {new Date(link.expiresAt).toLocaleDateString()}
                                      </Text>
                                      {link.usedAt && (
                                        <Badge colorScheme="red">Used</Badge>
                                      )}
                                      {!link.usedAt && !link.isValid && (
                                        <Badge colorScheme="orange">Expired</Badge>
                                      )}
                                      {link.isValid && !link.usedAt && (
                                        <Badge colorScheme="green">Active</Badge>
                                      )}
                                    </HStack>
                                  </VStack>
                                  <HStack>
                                    {link.isValid && !link.usedAt && (
                                      <IconButton
                                        aria-label="Copy link"
                                        icon={<CopyIcon />}
                                        size="sm"
                                        onClick={() => handleCopyLink(link.link)}
                                      />
                                    )}
                                    <IconButton
                                      aria-label="Revoke link"
                                      icon={<DeleteIcon />}
                                      size="sm"
                                      colorScheme="red"
                                      onClick={() => handleRevokeLink(link.id)}
                                    />
                                  </HStack>
                                </HStack>
                              ))}
                            </VStack>
                          )}
                        </Box>
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </VStack>
            </Box>
          )}

          {/* Commissioners Section */}
          {isCommissioner && (
            <Box p={6} borderRadius="md" borderWidth="1px">
              <VStack gap={4} align="stretch">
                <Heading as="h2" size="md">
                  Commissioners
                </Heading>

                {/* Current Commissioners List */}
                <VStack align="stretch" gap={2}>
                  {commissioners?.owner && (
                    <HStack justify="space-between" p={2} borderRadius="md" bg="bg.secondary">
                      <VStack align="start" gap={0}>
                        <HStack gap={2}>
                          <Text fontWeight="bold">
                            {commissioners.owner.name ||
                              commissioners.owner.email ||
                              'Unknown'}
                          </Text>
                          <Badge colorScheme="purple">Owner</Badge>
                        </HStack>
                        {commissioners.owner.email && (
                          <Text fontSize="sm" color="text.secondary">
                            {commissioners.owner.email}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                  )}

                  {commissioners?.commissioners
                    .filter((commissioner) => commissioner.id !== league?.ownerId)
                    .map((commissioner) => (
                    <HStack
                      key={commissioner.id}
                      justify="space-between"
                      p={2}
                      borderRadius="md"
                      bg="bg.secondary"
                    >
                      <VStack align="start" gap={0}>
                        <HStack gap={2}>
                          <Text fontWeight="bold">
                            {commissioner.name || commissioner.email || 'Unknown'}
                          </Text>
                          <Badge colorScheme="blue">Commissioner</Badge>
                        </HStack>
                        {commissioner.email && (
                          <Text fontSize="sm" color="text.secondary">
                            {commissioner.email}
                          </Text>
                        )}
                      </VStack>
                      <IconButton
                        aria-label="Remove commissioner"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleRemoveCommissioner(commissioner.id)}
                      />
                    </HStack>
                  ))}
                </VStack>

                {/* Add Commissioner */}
                <Box>
                  <FormControl>
                    <FormLabel>Add Commissioner</FormLabel>
                    <HStack gap={2}>
                      <Select
                        placeholder="Select a member"
                        value={newCommissionerId}
                        onChange={(e) => setNewCommissionerId(e.target.value)}
                      >
                        {getAllMembers()
                          .filter(
                            (m) =>
                              m.id !== league?.ownerId &&
                              !commissioners?.commissioners.some((c) => c.id === m.id),
                          )
                          .map((member) => (
                            <option key={member.id} value={member.id}>
                              {member.name || member.email || 'Unknown'}
                            </option>
                          ))}
                      </Select>
                      <Button
                        variant="primary"
                        onClick={handleAddCommissioner}
                        isDisabled={!newCommissionerId}
                      >
                        Add
                      </Button>
                    </HStack>
                    <Text fontSize="sm" color="text.secondary" mt={2}>
                      Only league members can be added as commissioners.
                    </Text>
                  </FormControl>
                </Box>
              </VStack>
            </Box>
          )}

          {/* Weekly Questions Section */}
          <Box p={6} borderRadius="md" borderWidth="1px">
            <VStack gap={4} align="stretch">
              <Heading as="h2" size="md">
                Weekly Questions
              </Heading>
              <Text>
                Set up and manage weekly prediction questions for your league members.
              </Text>
              <Button
                variant="primary"
                onClick={() => router.push(`/leagues/${leagueId}/settings/questions`)}
              >
                Manage Questions
              </Button>
            </VStack>
          </Box>

          {/* Retention Points Configuration */}
          <Box p={6} borderRadius="md" borderWidth="1px">
            <VStack gap={4} align="stretch">
              <Heading as="h2" size="md">
                Retention Points Configuration
              </Heading>
              <Text>
                Configure points earned per active castaway for each episode. This allows
                you to reward teams for keeping their castaways in the game.
              </Text>
              <Button
                variant="primary"
                onClick={() => router.push(`/leagues/${leagueId}/settings/retention`)}
              >
                Configure Retention Points
              </Button>
            </VStack>
          </Box>

          <Box p={6} borderRadius="md" borderWidth="1px">
            <form onSubmit={handleSubmit}>
              <VStack gap={6} align="stretch">
                <Heading as="h2" size="md">
                  Draft Configuration
                </Heading>

                <FormControl isRequired>
                  <FormLabel>Number of Castaways per Team</FormLabel>
                  <Input
                    type="number"
                    min={1}
                    value={castawaysPerTeam || ''}
                    onChange={(e) =>
                      setCastawaysPerTeam(parseInt(e.target.value, 10) || 0)
                    }
                    placeholder="Enter number of castaways per team"
                  />
                  <Text fontSize="sm" color="text.secondary" mt={2}>
                    This setting determines how many castaways each team can
                    draft in the initial draft (Round 1).
                  </Text>
                </FormControl>

                {draftConfig && (
                  <Box p={4} bg="transparent" borderRadius="md">
                    <Text fontSize="sm" fontWeight="bold" mb={2}>
                      Current Configuration:
                    </Text>
                    <VStack align="start" gap={1} fontSize="sm">
                      <Text>Round: {draftConfig.roundNumber}</Text>
                      <Text>Castaways per Team: {draftConfig.castawaysPerTeam}</Text>
                      <Text>Status: {draftConfig.status}</Text>
                      {draftConfig.draftDate && (
                        <Text>
                          Draft Date:{' '}
                          {new Date(draftConfig.draftDate).toLocaleDateString()}
                        </Text>
                      )}
                    </VStack>
                  </Box>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={saving}
                  loadingText="Saving..."
                  isDisabled={castawaysPerTeam < 1}
                >
                  Save Settings
                </Button>

                <Button
                  colorScheme="orange"
                  size="lg"
                  onClick={() => router.push(`/leagues/${leagueId}/draft`)}
                  isDisabled={!draftConfig?.castawaysPerTeam}
                >
                  Go to Draft →
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


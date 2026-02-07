'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Container, Heading, VStack, HStack, Button, Table, Thead, Tbody, Tr, Th, Td,
  Badge, IconButton, useToast, Input, FormControl, FormLabel, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Text, Spinner,
  Tooltip, Card, CardBody, Textarea,
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon, EmailIcon, StarIcon } from '@chakra-ui/icons';
import { api } from '@/lib/api';

interface LeagueMember {
  id: string;
  name: string | null;
  email: string | null;
  isOwner: boolean;
  isCommissioner: boolean;
  team: { id: string; name: string } | null;
  joinedAt: Date;
}

export default function AdminLeagueMembersPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const leagueId = params.leagueId as string;

  const [league, setLeague] = useState<any>(null);
  const [members, setMembers] = useState<LeagueMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  // Add Member Modal
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Email Invite Modal
  const { isOpen: isEmailOpen, onOpen: onEmailOpen, onClose: onEmailClose } = useDisclosure();
  const [emails, setEmails] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadData();
  }, [leagueId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leagueData, membersData] = await Promise.all([
        api.getAdminLeague(leagueId),
        api.getLeagueMembers(leagueId),
      ]);
      setLeague(leagueData);
      setMembers(membersData);
    } catch (error) {
      toast({
        title: 'Failed to load members',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const results = await api.searchUsers(searchQuery);
      // Filter out existing members
      const filtered = results.filter(
        (u) => !members.some((m) => m.id === u.id)
      );
      setSearchResults(filtered);
    } catch (error) {
      toast({
        title: 'Search failed',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setSearching(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    try {
      await api.addMemberToLeague(leagueId, userId);
      toast({
        title: 'Member added successfully',
        status: 'success',
        duration: 3000,
      });
      onAddClose();
      setSearchQuery('');
      setSearchResults([]);
      loadData();
    } catch (error) {
      toast({
        title: 'Failed to add member',
        description: error instanceof Error ? error.message : undefined,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!confirm(`Remove ${userName} from this league? Their team and data will remain for historical records.`)) {
      return;
    }

    try {
      await api.removeMemberFromLeague(leagueId, userId);
      toast({
        title: 'Member removed successfully',
        status: 'success',
        duration: 3000,
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Failed to remove member',
        description: error instanceof Error ? error.message : undefined,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleToggleCommissioner = async (member: LeagueMember) => {
    const action = member.isCommissioner ? 'remove' : 'add';
    const confirmMessage = member.isCommissioner
      ? `Remove commissioner privileges from ${member.name || member.email}?`
      : `Make ${member.name || member.email} a commissioner?`;

    if (!confirm(confirmMessage)) return;

    try {
      setChangingRole(member.id);
      if (member.isCommissioner) {
        await api.removeCommissioner(leagueId, member.id);
      } else {
        await api.addCommissioner(leagueId, { userId: member.id });
      }
      toast({
        title: member.isCommissioner ? 'Commissioner removed' : 'Commissioner added',
        status: 'success',
        duration: 3000,
      });
      loadData();
    } catch (error) {
      toast({
        title: `Failed to ${action} commissioner`,
        description: error instanceof Error ? error.message : undefined,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setChangingRole(null);
    }
  };

  const handleSendEmailInvites = async () => {
    const emailList = emails
      .split(/[\n,]/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    if (emailList.length === 0) {
      toast({
        title: 'Please enter at least one email',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      setSending(true);
      const result = await api.sendEmailInvites(leagueId, emailList);
      toast({
        title: 'Invites sent!',
        description: `Sent to ${result.invited.length} email(s). ${result.alreadyMembers.length} already members.`,
        status: 'success',
        duration: 5000,
      });
      onEmailClose();
      setEmails('');
    } catch (error) {
      toast({
        title: 'Failed to send invites',
        description: error instanceof Error ? error.message : undefined,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Box minH="100vh" py={20} display="flex" justifyContent="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack gap={6} align="stretch">
        <HStack justify="space-between">
          <VStack align="start" spacing={0}>
            <Heading size="lg">Manage Members</Heading>
            <Text color="text.secondary">{league?.name}</Text>
          </VStack>
          <HStack>
            <Button leftIcon={<EmailIcon />} onClick={onEmailOpen} colorScheme="blue">
              Send Email Invites
            </Button>
            <Button leftIcon={<AddIcon />} onClick={onAddOpen} colorScheme="brand">
              Add Member
            </Button>
            <Button variant="outline" onClick={() => router.push('/admin')}>
              Back to Admin
            </Button>
          </HStack>
        </HStack>

        <Card>
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Team Name</Th>
                  <Th>Joined</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {members.map((member) => (
                  <Tr key={member.id}>
                    <Td>{member.name || '—'}</Td>
                    <Td>{member.email}</Td>
                    <Td>
                      <HStack spacing={2}>
                        {member.isOwner && (
                          <Badge colorScheme="purple">Owner</Badge>
                        )}
                        {member.isCommissioner && !member.isOwner && (
                          <Badge colorScheme="blue">Commissioner</Badge>
                        )}
                        {!member.isOwner && !member.isCommissioner && (
                          <Badge>Member</Badge>
                        )}
                      </HStack>
                    </Td>
                    <Td>{member.team?.name || '—'}</Td>
                    <Td>{new Date(member.joinedAt).toLocaleDateString()}</Td>
                    <Td>
                      {!member.isOwner && (
                        <HStack spacing={1}>
                          <Tooltip label={member.isCommissioner ? 'Remove commissioner' : 'Make commissioner'}>
                            <IconButton
                              aria-label={member.isCommissioner ? 'Remove commissioner' : 'Make commissioner'}
                              icon={<StarIcon />}
                              size="sm"
                              colorScheme={member.isCommissioner ? 'blue' : 'gray'}
                              variant={member.isCommissioner ? 'solid' : 'outline'}
                              isLoading={changingRole === member.id}
                              onClick={() => handleToggleCommissioner(member)}
                            />
                          </Tooltip>
                          <Tooltip label="Remove member">
                            <IconButton
                              aria-label="Remove member"
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleRemoveMember(member.id, member.name || member.email || 'this user')}
                            />
                          </Tooltip>
                        </HStack>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </VStack>

      {/* Add Member Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Member to League</ModalHeader>
          <ModalBody>
            <VStack gap={4} align="stretch">
              <FormControl>
                <FormLabel>Search for user by name or email</FormLabel>
                <HStack>
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter name or email..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} isLoading={searching}>
                    Search
                  </Button>
                </HStack>
              </FormControl>

              {searchResults.length > 0 && (
                <VStack align="stretch" gap={2}>
                  <Text fontWeight="bold">Results:</Text>
                  {searchResults.map((user) => (
                    <HStack
                      key={user.id}
                      p={3}
                      bg="bg.secondary"
                      borderRadius="md"
                      justify="space-between"
                    >
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">{user.name || 'No name'}</Text>
                        <Text fontSize="sm" color="text.secondary">{user.email}</Text>
                      </VStack>
                      <Button size="sm" onClick={() => handleAddMember(user.id)}>
                        Add
                      </Button>
                    </HStack>
                  ))}
                </VStack>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onAddClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Email Invite Modal */}
      <Modal isOpen={isEmailOpen} onClose={onEmailClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send Email Invites</ModalHeader>
          <ModalBody>
            <FormControl>
              <FormLabel>Email addresses (one per line or comma-separated)</FormLabel>
              <Textarea
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder="email1@example.com&#10;email2@example.com"
                rows={6}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <HStack>
              <Button onClick={onEmailClose}>Cancel</Button>
              <Button
                colorScheme="brand"
                onClick={handleSendEmailInvites}
                isLoading={sending}
              >
                Send Invites
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}

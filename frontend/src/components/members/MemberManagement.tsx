'use client';

import { useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Button,
  Spinner,
  Text,
  Card,
  CardBody,
  useDisclosure,
  Stack,
} from '@chakra-ui/react';
import { AddIcon, EmailIcon } from '@chakra-ui/icons';
import { useMemberManagement } from './useMemberManagement';
import { MemberTable } from './MemberTable';
import { AddMemberModal } from './AddMemberModal';
import { EmailInviteModal } from './EmailInviteModal';
import { PendingInvites } from './PendingInvites';
import type { MemberManagementProps, LeagueMember } from './types';

export function MemberManagement({
  leagueId,
  leagueName,
  mode,
  showBackButton = false,
  onBack,
}: MemberManagementProps) {
  const {
    members,
    loading,
    changingRoleId,
    searchResults,
    searching,
    sending,
    loadData,
    handleSearch,
    handleAddMember,
    handleRemoveMember,
    handleToggleCommissioner,
    handleSendEmailInvites,
    clearSearchResults,
  } = useMemberManagement({ leagueId, mode });

  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();
  const {
    isOpen: isEmailOpen,
    onOpen: onEmailOpen,
    onClose: onEmailClose,
  } = useDisclosure();

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddModalClose = () => {
    clearSearchResults();
    onAddClose();
  };

  const confirmRemoveMember = (member: LeagueMember) => {
    const name = member.name || member.email || 'this user';
    if (
      confirm(
        `Remove ${name} from this league? Their team and data will remain for historical records.`
      )
    ) {
      handleRemoveMember(member);
    }
  };

  const confirmToggleCommissioner = (member: LeagueMember) => {
    const name = member.name || member.email;
    const message = member.isCommissioner
      ? `Remove commissioner privileges from ${name}?`
      : `Make ${name} a commissioner?`;

    if (confirm(message)) {
      handleToggleCommissioner(member);
    }
  };

  if (loading) {
    return (
      <Box minH="50vh" py={20} display="flex" justifyContent="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <VStack gap={6} align="stretch">
      <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" gap={3}>
        <VStack align="start" spacing={0}>
          <Heading size={{ base: 'md', md: 'lg' }}>Manage Members</Heading>
          <Text color="text.secondary">{leagueName}</Text>
        </VStack>
        <HStack flexWrap="wrap" gap={2}>
          <Button
            leftIcon={<EmailIcon />}
            onClick={onEmailOpen}
            colorScheme="blue"
            size={{ base: 'sm', md: 'md' }}
          >
            Send Email Invites
          </Button>
          <Button
            leftIcon={<AddIcon />}
            onClick={onAddOpen}
            colorScheme="brand"
            size={{ base: 'sm', md: 'md' }}
          >
            Add Member
          </Button>
          {showBackButton && onBack && (
            <Button variant="outline" onClick={onBack} size={{ base: 'sm', md: 'md' }}>
              Back
            </Button>
          )}
        </HStack>
      </Stack>

      <Card>
        <CardBody p={{ base: 2, md: 5 }}>
          <Box overflowX="auto">
            <MemberTable
              members={members}
              onToggleCommissioner={confirmToggleCommissioner}
              onRemoveMember={confirmRemoveMember}
              changingRoleId={changingRoleId}
            />
          </Box>
        </CardBody>
      </Card>

      <PendingInvites leagueId={leagueId} />

      <AddMemberModal
        isOpen={isAddOpen}
        onClose={handleAddModalClose}
        onSearch={handleSearch}
        onAddMember={handleAddMember}
        searchResults={searchResults}
        searching={searching}
      />

      <EmailInviteModal
        isOpen={isEmailOpen}
        onClose={onEmailClose}
        onSendInvites={handleSendEmailInvites}
        sending={sending}
      />
    </VStack>
  );
}

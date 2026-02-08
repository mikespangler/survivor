'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Spinner,
  Badge,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { RepeatIcon, DeleteIcon } from '@chakra-ui/icons';
import { api } from '@/lib/api';
import type { PendingInvite } from '@/types/api';

interface PendingInvitesProps {
  leagueId: string;
}

export function PendingInvites({ leagueId }: PendingInvitesProps) {
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const toast = useToast();

  const loadInvites = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getPendingInvites(leagueId);
      setInvites(data);
    } catch (error: any) {
      console.error('Failed to load pending invites:', error);
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    loadInvites();
  }, [loadInvites]);

  const handleResend = async (invite: PendingInvite) => {
    try {
      setResending(invite.id);
      await api.inviteByEmail(leagueId, { emails: [invite.invitedEmail] });
      toast({
        title: 'Invite resent',
        description: `New invite sent to ${invite.invitedEmail}`,
        status: 'success',
        duration: 3000,
      });
      // Refresh the list to show new invite
      await loadInvites();
    } catch (error: any) {
      toast({
        title: 'Failed to resend invite',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setResending(null);
    }
  };

  const handleRevoke = async (invite: PendingInvite) => {
    if (!confirm(`Revoke invite to ${invite.invitedEmail}?`)) {
      return;
    }

    try {
      setRevoking(invite.id);
      await api.revokeInviteLink(leagueId, invite.id);
      toast({
        title: 'Invite revoked',
        description: `Invite to ${invite.invitedEmail} has been cancelled`,
        status: 'success',
        duration: 3000,
      });
      setInvites((prev) => prev.filter((i) => i.id !== invite.id));
    } catch (error: any) {
      toast({
        title: 'Failed to revoke invite',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setRevoking(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isExpiringSoon = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const daysUntilExpiry = (expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 7;
  };

  if (loading) {
    return (
      <Card>
        <CardBody>
          <VStack py={6}>
            <Spinner />
            <Text color="text.secondary">Loading pending invites...</Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  if (invites.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardBody>
        <VStack align="stretch" gap={4}>
          <HStack justify="space-between">
            <Heading size="md">Pending Invites</Heading>
            <Badge colorScheme="orange">{invites.length} pending</Badge>
          </HStack>

          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Email</Th>
                  <Th>Sent</Th>
                  <Th>Expires</Th>
                  <Th>Invited By</Th>
                  <Th textAlign="right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {invites.map((invite) => (
                  <Tr key={invite.id}>
                    <Td>
                      <Text fontWeight="medium">{invite.invitedEmail}</Text>
                    </Td>
                    <Td>
                      <Text color="text.secondary">{formatDate(invite.createdAt)}</Text>
                    </Td>
                    <Td>
                      <HStack>
                        <Text color="text.secondary">{formatDate(invite.expiresAt)}</Text>
                        {isExpiringSoon(invite.expiresAt) && (
                          <Badge colorScheme="yellow" size="sm">
                            Expiring soon
                          </Badge>
                        )}
                      </HStack>
                    </Td>
                    <Td>
                      <Text color="text.secondary">
                        {invite.createdBy.name || invite.createdBy.email}
                      </Text>
                    </Td>
                    <Td>
                      <HStack justify="flex-end" spacing={2}>
                        <IconButton
                          aria-label="Resend invite"
                          icon={<RepeatIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          isLoading={resending === invite.id}
                          onClick={() => handleResend(invite)}
                          title="Resend invite"
                        />
                        <IconButton
                          aria-label="Revoke invite"
                          icon={<DeleteIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          isLoading={revoking === invite.id}
                          onClick={() => handleRevoke(invite)}
                          title="Revoke invite"
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
}

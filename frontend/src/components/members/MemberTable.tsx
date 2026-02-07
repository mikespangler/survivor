'use client';

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Badge,
  IconButton,
  Tooltip,
  Text,
} from '@chakra-ui/react';
import { DeleteIcon, StarIcon } from '@chakra-ui/icons';
import type { MemberTableProps } from './types';

export function MemberTable({
  members,
  onToggleCommissioner,
  onRemoveMember,
  changingRoleId,
}: MemberTableProps) {
  return (
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
              {member.isOwner ? (
                <Text fontSize="sm" color="text.secondary">—</Text>
              ) : (
                <HStack spacing={1}>
                  <Tooltip
                    label={
                      member.isCommissioner
                        ? 'Remove commissioner'
                        : 'Make commissioner'
                    }
                  >
                    <IconButton
                      aria-label={
                        member.isCommissioner
                          ? 'Remove commissioner'
                          : 'Make commissioner'
                      }
                      icon={<StarIcon />}
                      size="sm"
                      colorScheme={member.isCommissioner ? 'blue' : 'gray'}
                      variant={member.isCommissioner ? 'solid' : 'outline'}
                      isLoading={changingRoleId === member.id}
                      onClick={() => onToggleCommissioner(member)}
                    />
                  </Tooltip>
                  <Tooltip label="Remove member">
                    <IconButton
                      aria-label="Remove member"
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => onRemoveMember(member)}
                    />
                  </Tooltip>
                </HStack>
              )}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

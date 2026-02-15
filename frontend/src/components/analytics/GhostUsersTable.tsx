'use client';

import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
} from '@chakra-ui/react';
import type { GhostUser } from '@/types/api';

interface GhostUsersTableProps {
  data: GhostUser[];
}

export function GhostUsersTable({ data }: GhostUsersTableProps) {
  if (data.length === 0) {
    return (
      <Box p={8} textAlign="center">
        <Text color="text.secondary">No ghost users found. Everyone has joined a league!</Text>
      </Box>
    );
  }

  return (
    <Box borderWidth="1px" borderRadius="lg" overflowX="auto">
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Signed Up</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((user) => (
            <Tr key={user.id}>
              <Td>{user.name || '(no name)'}</Td>
              <Td>{user.email || '(no email)'}</Td>
              <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}

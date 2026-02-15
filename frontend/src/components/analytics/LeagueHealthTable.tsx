'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
} from '@chakra-ui/react';
import type { LeagueHealthData } from '@/types/api';

interface LeagueHealthTableProps {
  data: LeagueHealthData[];
}

type SortField = 'name' | 'memberCount' | 'participationRate' | 'totalAnswers' | 'createdAt';
type SortDir = 'asc' | 'desc';

export function LeagueHealthTable({ data }: LeagueHealthTableProps) {
  const [sortField, setSortField] = useState<SortField>('memberCount');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      let cmp: number;
      switch (sortField) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'createdAt':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        default:
          cmp = (a[sortField] as number) - (b[sortField] as number);
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
  }, [data, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortableTh = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Th
      cursor="pointer"
      onClick={() => handleSort(field)}
      _hover={{ color: 'text.primary' }}
    >
      {children} {sortField === field ? (sortDir === 'desc' ? ' v' : ' ^') : ''}
    </Th>
  );

  if (data.length === 0) {
    return (
      <Box p={8} textAlign="center">
        <Text color="text.secondary">No leagues found.</Text>
      </Box>
    );
  }

  return (
    <Box borderWidth="1px" borderRadius="lg" overflowX="auto">
      <Table size="sm">
        <Thead>
          <Tr>
            <SortableTh field="name">League</SortableTh>
            <SortableTh field="memberCount">Members</SortableTh>
            <Th>Teams</Th>
            <SortableTh field="totalAnswers">Answers</SortableTh>
            <SortableTh field="participationRate">Participation</SortableTh>
            <SortableTh field="createdAt">Created</SortableTh>
          </Tr>
        </Thead>
        <Tbody>
          {sorted.map((league) => (
            <Tr key={league.id}>
              <Td fontWeight="medium">{league.name}</Td>
              <Td>{league.memberCount}</Td>
              <Td>{league.teamCount}</Td>
              <Td>{league.totalAnswers}</Td>
              <Td>
                <Badge
                  colorScheme={
                    league.participationRate >= 75
                      ? 'green'
                      : league.participationRate >= 50
                        ? 'yellow'
                        : league.participationRate >= 25
                          ? 'orange'
                          : 'red'
                  }
                >
                  {league.participationRate}%
                </Badge>
              </Td>
              <Td>{new Date(league.createdAt).toLocaleDateString()}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}

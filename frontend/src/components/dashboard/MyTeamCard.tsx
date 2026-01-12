'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Button,
  Grid,
  Flex,
  Divider,
} from '@chakra-ui/react';
import { StarIcon } from './icons';
import type { MyTeamResponse } from '@/types/api';

interface MyTeamCardProps {
  myTeam: MyTeamResponse;
  leagueId: string;
}

// Mock points per castaway - would come from API in production
const getMockCastawayPoints = (castawayId: string): number => {
  const hash = castawayId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return 40 + (hash % 50); // Random between 40-90
};

export function MyTeamCard({ myTeam, leagueId }: MyTeamCardProps) {
  const router = useRouter();
  const roster = myTeam.roster || [];

  // Split roster into rows of 3
  const activeRoster = roster.filter((r) => r.isActive);
  const eliminatedRoster = roster.filter((r) => !r.isActive);

  // Display up to 6 castaways (5 active + 1 eliminated for visual)
  const displayRoster = [...activeRoster, ...eliminatedRoster].slice(0, 6);

  return (
    <VStack align="stretch" gap={4} flex="1" h="full">
      {/* Header */}
      <HStack justify="space-between">
        <Text fontFamily="display" fontSize="24px" fontWeight="bold" color="text.primary">
          My Team
        </Text>
        <Button
          variant="link"
          color="brand.primary"
          fontSize="14px"
          fontWeight="bold"
          onClick={() => router.push(`/leagues/${leagueId}/team/${myTeam.id}`)}
        >
          View Team →
        </Button>
      </HStack>

      {/* Card */}
      <Box
        bg="linear-gradient(146.157deg, rgb(33, 38, 48) 2.5008%, rgb(25, 29, 36) 97.499%)"
        border="2px solid"
        borderColor="rgba(43, 48, 59, 0.5)"
        borderRadius="24px"
        p={4}
        flex="1"
        display="flex"
        flexDirection="column"
      >
        {/* Team Name & Stats */}
        <VStack gap={0} pb={3}>
          <Text
            fontFamily="heading"
            fontSize="20px"
            color="text.primary"
            textAlign="center"
          >
            {myTeam.name}
          </Text>
          <HStack gap={6} justify="center" py={3}>
            <VStack gap={0}>
              <Text
                fontFamily="display"
                fontSize="32px"
                fontWeight="bold"
                color="brand.primary"
                lineHeight="48px"
              >
                {myTeam.stats.activeCastaways}
              </Text>
              <Text fontSize="12px" fontWeight="medium" color="text.secondary">
                ACTIVE
              </Text>
            </VStack>
            <VStack gap={0}>
              <Text
                fontFamily="display"
                fontSize="32px"
                fontWeight="bold"
                color="text.secondary"
                lineHeight="48px"
              >
                {myTeam.stats.eliminatedCastaways}
              </Text>
              <Text fontSize="12px" fontWeight="medium" color="text.secondary">
                ELIMINATED
              </Text>
            </VStack>
            <VStack gap={0}>
              <Text
                fontFamily="display"
                fontSize="32px"
                fontWeight="bold"
                color="brand.primary"
                lineHeight="48px"
              >
                {myTeam.totalPoints}
              </Text>
              <Text fontSize="12px" fontWeight="medium" color="text.secondary">
                TOTAL POINTS
              </Text>
            </VStack>
          </HStack>
        </VStack>

        {/* Roster Grid */}
        <VStack flex="1" gap={4} justify="space-between">
          {/* First row */}
          <HStack w="full" justify="center" gap={0}>
            {displayRoster.slice(0, 3).map((member, idx) => (
              <CastawayCell
                key={member.id}
                member={member}
                showRightBorder={idx < 2}
                points={getMockCastawayPoints(member.castaway.id)}
              />
            ))}
          </HStack>

          {/* Divider */}
          <Divider borderColor="rgba(48, 53, 65, 0.5)" />

          {/* Second row */}
          <HStack w="full" justify="center" gap={0}>
            {displayRoster.slice(3, 6).map((member, idx) => (
              <CastawayCell
                key={member.id}
                member={member}
                showRightBorder={idx < 2 && displayRoster.length > 4}
                points={getMockCastawayPoints(member.castaway.id)}
              />
            ))}
            {/* Empty cells if less than 6 */}
            {displayRoster.length < 5 && <EmptyCell showRightBorder />}
            {displayRoster.length < 6 && <EmptyCell showRightBorder={false} />}
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
}

interface CastawayCellProps {
  member: {
    id: string;
    castaway: {
      id: string;
      name: string;
      status: 'ACTIVE' | 'ELIMINATED' | 'JURY';
    };
    isActive: boolean;
  };
  showRightBorder: boolean;
  points: number;
}

function CastawayCell({ member, showRightBorder, points }: CastawayCellProps) {
  const isEliminated = !member.isActive || member.castaway.status === 'ELIMINATED';

  return (
    <Flex
      flex="1"
      direction="column"
      align="center"
      gap={1}
      py={0}
      px={11}
      borderRight={showRightBorder ? '2px solid' : 'none'}
      borderColor="rgba(48, 53, 65, 0.5)"
      opacity={isEliminated ? 0.35 : 1}
      position="relative"
    >
      {/* Eliminated X badge */}
      {isEliminated && (
        <Box
          position="absolute"
          top="0.5px"
          right="38px"
          bg="rgba(244, 67, 54, 0.8)"
          borderRadius="full"
          boxSize="16px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="10px" color="white" fontWeight="bold">
            ✕
          </Text>
        </Box>
      )}

      <Avatar
        size="lg"
        name={member.castaway.name}
        boxSize="60px"
        border="2px solid"
        borderColor={isEliminated ? 'text.secondary' : 'brand.primary'}
      />
      <Text
        fontSize="12px"
        fontWeight="bold"
        color="text.primary"
        textAlign="center"
        textDecoration={isEliminated ? 'line-through' : 'none'}
      >
        {member.castaway.name}
      </Text>
      <HStack gap={1.5} justify="center">
        <StarIcon boxSize="12px" color="brand.primary" />
        <Text
          fontSize="11px"
          fontWeight="medium"
          color="brand.primary"
        >
          {points}
        </Text>
      </HStack>
    </Flex>
  );
}

function EmptyCell({ showRightBorder }: { showRightBorder: boolean }) {
  return (
    <Flex
      flex="1"
      direction="column"
      align="center"
      gap={1}
      py={0}
      px={11}
      borderRight={showRightBorder ? '2px solid' : 'none'}
      borderColor="rgba(48, 53, 65, 0.5)"
      opacity={0}
    >
      <Avatar size="lg" boxSize="60px" />
      <Text fontSize="12px">—</Text>
      <Text fontSize="11px">—</Text>
    </Flex>
  );
}

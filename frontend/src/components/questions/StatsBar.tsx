'use client';

import { Box, HStack, VStack, Text, Skeleton, Avatar, AvatarGroup } from '@chakra-ui/react';
import { StarIcon, TrophyIcon, UsersIcon } from '../dashboard/icons';

interface TeamMember {
  id: string;
  name: string;
  imageUrl?: string;
  isActive: boolean;
}

interface StatsBarProps {
  teamName: string;
  totalPoints: number;
  rank: number;
  totalTeams: number;
  teamMembers?: TeamMember[];
  isLoading?: boolean;
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  isLoading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  suffix?: string;
  isLoading?: boolean;
}) {
  return (
    <Box
      bg="linear-gradient(166deg, rgb(33, 38, 48) 2.5%, rgb(25, 29, 36) 97.5%)"
      border="2px solid"
      borderColor="rgba(43, 48, 59, 0.5)"
      borderRadius="16px"
      p={4}
      flex={1}
    >
      <VStack align="start" spacing={2}>
        <HStack spacing={2}>
          {icon}
          <Text
            fontFamily="display"
            fontSize="12px"
            fontWeight="bold"
            color="text.secondary"
            textTransform="uppercase"
            letterSpacing="0.5px"
          >
            {label}
          </Text>
        </HStack>
        {isLoading ? (
          <Skeleton height="36px" width="80px" />
        ) : (
          <HStack align="baseline" spacing={1}>
            <Text
              fontFamily="display"
              fontSize="32px"
              fontWeight="bold"
              color="brand.primary"
              lineHeight="36px"
            >
              {value}
            </Text>
            {suffix && (
              <Text
                fontFamily="body"
                fontSize="16px"
                fontWeight="medium"
                color="text.secondary"
              >
                {suffix}
              </Text>
            )}
          </HStack>
        )}
      </VStack>
    </Box>
  );
}

export function StatsBar({
  teamName,
  totalPoints,
  rank,
  totalTeams,
  teamMembers = [],
  isLoading = false,
}: StatsBarProps) {
  return (
    <HStack spacing={4} w="full">
      {/* Team card - wider */}
      <Box
        bg="linear-gradient(168deg, rgb(33, 38, 48) 2.5%, rgb(25, 29, 36) 97.5%)"
        border="2px solid"
        borderColor="rgba(43, 48, 59, 0.5)"
        borderRadius="16px"
        p={4}
        minW="280px"
      >
        <HStack justify="space-between" align="center" h="full">
          <VStack align="start" spacing={2} justify="space-between" h="full">
            <HStack spacing={2}>
              <UsersIcon boxSize="20px" color="text.secondary" />
              <Text
                fontFamily="display"
                fontSize="12px"
                fontWeight="bold"
                color="text.secondary"
                textTransform="uppercase"
                letterSpacing="0.5px"
              >
                Your Team
              </Text>
            </HStack>
            {isLoading ? (
              <Skeleton height="36px" width="120px" />
            ) : (
              <Text
                fontFamily="display"
                fontSize="32px"
                fontWeight="bold"
                color="brand.primary"
                lineHeight="36px"
              >
                {teamName}
              </Text>
            )}
          </VStack>

          {/* Player avatars */}
          {!isLoading && teamMembers.length > 0 && (
            <AvatarGroup size="sm" max={5} spacing="-3">
              {teamMembers.slice(0, 5).map((member, idx) => (
                <Avatar
                  key={member.id}
                  name={member.name}
                  src={member.imageUrl}
                  border="2px solid"
                  borderColor="rgba(48, 53, 65, 0.5)"
                  bg="#14181f"
                  opacity={member.isActive ? 1 : 0.3}
                  w="32px"
                  h="32px"
                />
              ))}
            </AvatarGroup>
          )}
        </HStack>
      </Box>

      {/* Total Points */}
      <StatCard
        icon={<StarIcon boxSize="18px" color="text.secondary" />}
        label="Total Points"
        value={totalPoints}
        isLoading={isLoading}
      />

      {/* Rank */}
      <StatCard
        icon={<TrophyIcon boxSize="18px" color="text.secondary" />}
        label="Your Rank"
        value={`#${rank}`}
        suffix={`/ ${totalTeams}`}
        isLoading={isLoading}
      />
    </HStack>
  );
}

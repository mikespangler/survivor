'use client';

import { Box, VStack, HStack, Text } from '@chakra-ui/react';
import { TvIcon, ClockIcon, MedalIcon, StarIcon } from './icons';

interface StatCardProps {
  type: 'episode' | 'deadline' | 'rank' | 'points';
  value: string;
  subValue?: string;
}

const iconMap = {
  episode: TvIcon,
  deadline: ClockIcon,
  rank: MedalIcon,
  points: StarIcon,
};

const labelMap = {
  episode: 'Episode',
  deadline: 'Deadline',
  rank: 'Your Rank',
  points: 'Total Points',
};

export function StatCard({ type, value, subValue }: StatCardProps) {
  const IconComponent = iconMap[type];
  const label = labelMap[type];

  return (
    <Box
      bg="linear-gradient(158.828deg, rgb(33, 38, 48) 2.5008%, rgb(25, 29, 36) 97.499%)"
      border="2px solid"
      borderColor="rgba(43, 48, 59, 0.5)"
      borderRadius="16px"
      p={4}
      h="113.5px"
    >
      <VStack align="start" gap={3} h="full" justify="space-between">
        <HStack gap={2}>
          <Box
            bg="rgba(240, 101, 66, 0.13)"
            borderRadius="12px"
            p={1.5}
            boxSize="32px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <IconComponent boxSize="18px" color="brand.primary" />
          </Box>
          <Text
            fontSize="12px"
            fontWeight="medium"
            color="text.secondary"
            textTransform="uppercase"
            letterSpacing="0.5px"
          >
            {label}
          </Text>
        </HStack>
        <HStack align="baseline" gap={0}>
          <Text
            fontFamily="display"
            fontSize="28px"
            fontWeight="bold"
            color="text.primary"
            lineHeight="32px"
          >
            {value}
          </Text>
          {subValue && (
            <Text
              fontSize="16px"
              fontWeight="medium"
              color="text.secondary"
              lineHeight="24px"
            >
              {subValue}
            </Text>
          )}
        </HStack>
      </VStack>
    </Box>
  );
}

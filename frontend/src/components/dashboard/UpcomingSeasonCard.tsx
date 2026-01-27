'use client';

import { Box, VStack, HStack, Text } from '@chakra-ui/react';
import { ClockIcon } from './icons';
import { Countdown } from '@/components/common/Countdown';
import type { SeasonMetadata } from '@/types/api';

interface UpcomingSeasonCardProps {
  seasonMetadata: SeasonMetadata;
  leagueId: string;
}

const formatStartDate = (startDate: string | null): string => {
  if (!startDate) return 'Date TBD';

  try {
    const date = new Date(startDate);
    if (isNaN(date.getTime())) return 'Date TBD';

    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  } catch {
    return 'Date TBD';
  }
};

export function UpcomingSeasonCard({
  seasonMetadata,
  leagueId,
}: UpcomingSeasonCardProps) {
  return (
    <Box
      bg="linear-gradient(169.729deg, rgb(33, 38, 48) 2.5008%, rgb(25, 29, 36) 97.499%)"
      border="2px solid"
      borderColor="rgba(43, 48, 59, 0.5)"
      borderRadius="24px"
      boxShadow="0px 12px 40px 0px rgba(0, 0, 0, 0.5)"
      position="relative"
      p={6}
    >
      {/* Season Badge */}
      <Box
        bg="rgba(240, 101, 66, 0.15)"
        border="2px solid"
        borderColor="rgba(240, 101, 66, 0.2)"
        borderRadius="full"
        px={4}
        py={2}
        display="inline-block"
        mb={6}
      >
        <Text fontSize="14px" fontWeight="bold" color="brand.primary">
          🔥 Season {seasonMetadata.number || 'Upcoming'}
        </Text>
      </Box>

      {/* Countdown Banner */}
      {seasonMetadata.startDate && (
        <HStack
          bg="rgba(20, 24, 31, 0.6)"
          border="1px solid rgba(48, 53, 65, 0.5)"
          borderRadius="12px"
          p={4}
          gap={4}
          mb={6}
          divider={<Box h="32px" w="1px" bg="rgba(248, 246, 242, 0.15)" />}
        >
          {/* Left: Countdown */}
          <VStack align="start" gap={1} flex={1}>
            <Text
              fontSize="14px"
              fontWeight="bold"
              color="brand.primary"
              textTransform="uppercase"
            >
              Starts In:
            </Text>
            <HStack gap={2}>
              <ClockIcon boxSize="24px" color="brand.primary" />
              <Countdown
                targetDate={seasonMetadata.startDate}
                size="lg"
                color="text.primary"
                showSeconds={true}
              />
            </HStack>
          </VStack>

          {/* Right: Date */}
          <VStack align="start" gap={1} flex={1}>
            <Text
              fontSize="14px"
              fontWeight="bold"
              color="text.secondary"
              textTransform="uppercase"
            >
              Starts At:
            </Text>
            <Text fontSize="16px" fontWeight="medium" color="text.primary">
              {formatStartDate(seasonMetadata.startDate)}
            </Text>
          </VStack>
        </HStack>
      )}

      {/* No Date Banner */}
      {!seasonMetadata.startDate && (
        <Box
          bg="rgba(20, 24, 31, 0.6)"
          border="1px solid rgba(48, 53, 65, 0.5)"
          borderRadius="12px"
          p={4}
          mb={6}
        >
          <HStack gap={2}>
            <ClockIcon boxSize="24px" color="brand.primary" />
            <Text fontSize="16px" fontWeight="bold" color="text.primary">
              Start Date TBD
            </Text>
          </HStack>
        </Box>
      )}

      {/* Content Section */}
      <VStack align="start" gap={3}>
        <Text fontFamily="display" fontSize="24px" fontWeight="bold" color="text.primary">
          Get Ready for {seasonMetadata.name || 'the Season'}!
        </Text>
        <Text fontSize="16px" color="text.secondary">
          The season hasn't started yet. Check back when the countdown ends or contact your
          league commissioner for details.
        </Text>
      </VStack>
    </Box>
  );
}

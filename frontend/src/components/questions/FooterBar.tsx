'use client';

import { Box, HStack, VStack, Text, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';

// Helper to format deadline
function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'No deadline set';
  const date = new Date(deadline);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

interface FooterBarProps {
  answeredCount: number;
  totalCount: number;
  deadline: string | null;
  timeRemaining: string;
  isLocked: boolean;
  anySaving: boolean;
}

export type { FooterBarProps };

export function FooterBar({
  answeredCount,
  totalCount,
  deadline,
  timeRemaining,
  isLocked,
  anySaving,
}: FooterBarProps) {
  return (
    <Box
      bg="linear-gradient(173deg, rgb(33, 38, 48) 2.5%, rgb(25, 29, 36) 97.5%)"
      borderTop="2px solid"
      borderColor="rgba(48, 53, 65, 0.5)"
      borderRadius="24px"
      px={{ base: 4, md: 6 }}
      py={{ base: 4, md: 6 }}
    >
      <VStack spacing={4} align="stretch">
        {/* Progress and save status */}
        <HStack justify="space-between" w="full" flexWrap="wrap" gap={2}>
          <Text
            fontFamily="body"
            fontSize="14px"
            fontWeight="medium"
            color="text.secondary"
          >
            {answeredCount} of {totalCount} questions answered
          </Text>
          <HStack spacing={2}>
            {anySaving ? (
              <>
                <Spinner size="sm" color="brand.primary" />
                <Text
                  fontFamily="body"
                  fontSize="14px"
                  fontWeight="medium"
                  color="text.secondary"
                >
                  Saving...
                </Text>
              </>
            ) : (
              <>
                <CheckIcon color="green.400" boxSize="20px" />
                <Text
                  fontFamily="body"
                  fontSize="14px"
                  fontWeight="medium"
                  color="green.400"
                >
                  All changes saved
                </Text>
              </>
            )}
          </HStack>
        </HStack>
        
        {/* Deadline info */}
        {!isLocked && deadline && (
          <Alert
            status="info"
            borderRadius="16px"
            bg="rgba(107, 126, 203, 0.1)"
            border="1px solid"
            borderColor="rgba(107, 126, 203, 0.3)"
            py={4}
          >
            <AlertIcon color="brand.purple" />
            <VStack align="start" spacing={1} flex="1">
              <HStack spacing={2}>
                <Text
                  fontFamily="body"
                  fontSize="14px"
                  fontWeight="semibold"
                  color="text.primary"
                >
                  Deadline:
                </Text>
                <Text
                  fontFamily="body"
                  fontSize="14px"
                  fontWeight="medium"
                  color="text.secondary"
                >
                  {formatDeadline(deadline)}
                </Text>
              </HStack>
              <HStack spacing={2}>
                <Text
                  fontFamily="body"
                  fontSize="14px"
                  fontWeight="semibold"
                  color="text.primary"
                >
                  Time remaining:
                </Text>
                <Text
                  fontFamily="body"
                  fontSize="14px"
                  fontWeight="medium"
                  color="text.secondary"
                >
                  {timeRemaining}
                </Text>
              </HStack>
              <Text
                fontFamily="body"
                fontSize="13px"
                color="text.secondary"
                mt={1}
              >
                Your answers save automatically and can be edited until the deadline.
              </Text>
            </VStack>
          </Alert>
        )}
        
        {/* Locked notice */}
        {isLocked && (
          <Alert
            status="warning"
            borderRadius="16px"
            bg="rgba(249, 195, 31, 0.1)"
            border="1px solid"
            borderColor="rgba(249, 195, 31, 0.3)"
            py={4}
          >
            <AlertIcon color="brand.yellow" />
            <Text
              fontFamily="body"
              fontSize="14px"
              fontWeight="medium"
              color="text.primary"
            >
              Answers are now locked. The deadline has passed.
            </Text>
          </Alert>
        )}
      </VStack>
    </Box>
  );
}

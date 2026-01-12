'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
} from '@chakra-ui/react';
import { ClockIcon } from './icons';

interface WeeklyQuestionsCTAProps {
  leagueId: string;
  // These would come from an API in production
  dueDate?: string;
  questionsRemaining?: number;
  hasAction?: boolean;
}

// Mock data for weekly questions
const mockData = {
  dueDate: 'Wednesday, 8:00 PM EST',
  questionsRemaining: 5,
  hasAction: true,
};

export function WeeklyQuestionsCTA({
  leagueId,
  dueDate = mockData.dueDate,
  questionsRemaining = mockData.questionsRemaining,
  hasAction = mockData.hasAction,
}: WeeklyQuestionsCTAProps) {
  const router = useRouter();

  return (
    <Box
      bg="linear-gradient(169.729deg, rgb(33, 38, 48) 2.5008%, rgb(25, 29, 36) 97.499%)"
      border="2px solid"
      borderColor="rgba(43, 48, 59, 0.5)"
      borderRadius="24px"
      boxShadow="0px 12px 40px 0px rgba(0, 0, 0, 0.5)"
      overflow="hidden"
      position="relative"
      p={6}
    >
      {/* Background decorative image */}
      <Box
        position="absolute"
        right="-147px"
        top="50%"
        transform="translateY(-50%)"
        w="388px"
        h="288px"
        opacity={0.3}
        pointerEvents="none"
      >
        {/* Scroll/parchment illustration would go here */}
        <Box
          w="282px"
          h="282px"
          bg="linear-gradient(135deg, rgba(240, 101, 66, 0.2) 0%, rgba(195, 67, 34, 0.1) 100%)"
          borderRadius="20px"
          transform="rotate(-15deg)"
        />
      </Box>

      {/* Action Required Badge */}
      {hasAction && (
        <Box
          position="absolute"
          top="-1.5px"
          right="-2px"
          bg="#352424"
          borderBottomLeftRadius="12px"
          px={3}
          py={1}
          borderLeft="2px solid"
          borderBottom="2px solid"
          borderColor="rgba(48, 53, 65, 0.5)"
        >
          <Text
            fontFamily="body"
            fontSize="12px"
            fontWeight="bold"
            color="brand.primary"
            textTransform="uppercase"
            letterSpacing="0.6px"
          >
            Action Required
          </Text>
        </Box>
      )}

      {/* Content */}
      <VStack align="start" gap={0} position="relative" zIndex={1}>
        <Text
          fontFamily="display"
          fontSize="24px"
          fontWeight="bold"
          color="text.primary"
          mb={2}
        >
          Answer Weekly Questions
        </Text>
        <Text
          fontFamily="body"
          fontSize="16px"
          fontWeight="medium"
          color="text.secondary"
          mb={4}
        >
          Make your predictions for this week&apos;s episode to earn points.
        </Text>

        <HStack gap={2} mb={8}>
          <ClockIcon boxSize="16px" color="brand.primary" />
          <Text
            fontFamily="body"
            fontSize="14px"
            fontWeight="bold"
            color="brand.primary"
          >
            Due: {dueDate}
          </Text>
          <Text
            fontFamily="body"
            fontSize="14px"
            fontWeight="medium"
            color="text.secondary"
          >
            • {questionsRemaining} questions remaining
          </Text>
        </HStack>

        <Button
          bg="brand.primary"
          color="text.button"
          fontFamily="heading"
          fontSize="16px"
          h="48px"
          px={10}
          borderRadius="20px"
          boxShadow="0px 6px 0px 0px #C34322"
          _hover={{ bg: '#E85A3A' }}
          _active={{ transform: 'translateY(2px)', boxShadow: '0px 3px 0px 0px #C34322' }}
          onClick={() => router.push(`/leagues/${leagueId}/questions`)}
          rightIcon={
            <Text as="span" ml={1}>
              →
            </Text>
          }
        >
          Submit Predictions
        </Button>
      </VStack>
    </Box>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Skeleton,
} from '@chakra-ui/react';
import { ClockIcon } from './icons';
import { api } from '@/lib/api';
import type { QuestionStatusResponse } from '@/types/api';

interface WeeklyQuestionsCTAProps {
  leagueId: string;
  seasonId: string;
  seasonStatus?: string;
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'No deadline set';
  const date = new Date(deadline);
  return date.toLocaleString('en-US', {
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

export function WeeklyQuestionsCTA({
  leagueId,
  seasonId,
  seasonStatus,
}: WeeklyQuestionsCTAProps) {
  const router = useRouter();
  const [status, setStatus] = useState<QuestionStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For upcoming seasons, show a placeholder message
  const isUpcoming = seasonStatus === 'UPCOMING';

  useEffect(() => {
    // Skip loading questions for upcoming seasons
    if (isUpcoming) {
      setIsLoading(false);
      return;
    }

    const loadStatus = async () => {
      if (!leagueId || !seasonId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await api.getQuestionStatus(leagueId, seasonId);
        setStatus(data);
      } catch (err: any) {
        console.error('Failed to load question status', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadStatus();
  }, [leagueId, seasonId, isUpcoming]);

  // Don't render if there are no questions (only for active seasons)
  if (!isUpcoming && !isLoading && (!status || !status.hasQuestions)) {
    return null;
  }

  const hasAction = status ? status.questionsRemaining > 0 && status.canSubmit : false;
  const dueDate = status ? formatDeadline(status.deadline) : '';
  const questionsRemaining = status?.questionsRemaining ?? 0;

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

      {/* Submissions Closed Badge */}
      {!isLoading && status && !status.canSubmit && (
        <Box
          position="absolute"
          top="-1.5px"
          right="-2px"
          bg="#243524"
          borderBottomLeftRadius="12px"
          px={3}
          py={1}
          borderLeft="2px solid"
          borderBottom="2px solid"
          borderColor="rgba(48, 65, 48, 0.5)"
        >
          <Text
            fontFamily="body"
            fontSize="12px"
            fontWeight="bold"
            color="green.400"
            textTransform="uppercase"
            letterSpacing="0.6px"
          >
            Submissions Closed
          </Text>
        </Box>
      )}

      {/* Content */}
      <VStack align="start" gap={0} position="relative" zIndex={1}>
        {/* Upcoming Season View */}
        {isUpcoming ? (
          <>
            <Text
              fontFamily="display"
              fontSize="24px"
              fontWeight="bold"
              color="text.primary"
              mb={2}
            >
              Weekly Questions
            </Text>
            <Text
              fontFamily="body"
              fontSize="16px"
              fontWeight="medium"
              color="text.secondary"
              mb={4}
            >
              Questions will be available after Week 1 airs. Check back after the season starts to make your predictions!
            </Text>

            <HStack gap={2} mb={8} flexWrap="wrap">
              <ClockIcon boxSize="16px" color="text.secondary" />
              <Text
                fontFamily="body"
                fontSize="14px"
                fontWeight="bold"
                color="text.secondary"
              >
                Coming Soon
              </Text>
            </HStack>
          </>
        ) : (
          <>
            {/* Active Season View */}
            <Text
              fontFamily="display"
              fontSize="24px"
              fontWeight="bold"
              color="text.primary"
              mb={2}
            >
              {status?.canSubmit ? 'Answer Weekly Questions' : 'View Question Results'}
            </Text>
            <Text
              fontFamily="body"
              fontSize="16px"
              fontWeight="medium"
              color="text.secondary"
              mb={4}
            >
              {status?.canSubmit
                ? "Make your predictions for this week's episode to earn points."
                : 'See how everyone answered and check the leaderboard.'}
            </Text>

            {isLoading ? (
              <Skeleton height="20px" width="300px" mb={8} />
            ) : (
              <HStack gap={2} mb={8} flexWrap="wrap">
                <ClockIcon boxSize="16px" color="brand.primary" />
                <Text
                  fontFamily="body"
                  fontSize="14px"
                  fontWeight="bold"
                  color="brand.primary"
                >
                  {status?.canSubmit ? `Due: ${dueDate}` : 'Episode ' + status?.currentEpisode}
                </Text>
                {status?.canSubmit && (
                  <Text
                    fontFamily="body"
                    fontSize="14px"
                    fontWeight="medium"
                    color="text.secondary"
                  >
                    {questionsRemaining === 0
                      ? '• All questions answered!'
                      : `• ${questionsRemaining} question${questionsRemaining === 1 ? '' : 's'} remaining`}
                  </Text>
                )}
                {!status?.canSubmit && (
                  <Text
                    fontFamily="body"
                    fontSize="14px"
                    fontWeight="medium"
                    color="text.secondary"
                  >
                    • {status?.answeredQuestions} / {status?.totalQuestions} answered
                  </Text>
                )}
              </HStack>
            )}

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
              onClick={() =>
                router.push(
                  status?.canSubmit
                    ? `/leagues/${leagueId}/questions`
                    : `/leagues/${leagueId}/questions/results`,
                )
              }
              rightIcon={
                <Text as="span" ml={1}>
                  →
                </Text>
              }
              isDisabled={isLoading}
            >
              {status?.canSubmit ? 'Submit Predictions' : 'View Results'}
            </Button>
          </>
        )}
      </VStack>
    </Box>
  );
}

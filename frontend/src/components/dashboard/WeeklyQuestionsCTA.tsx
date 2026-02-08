'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Text,
  Skeleton,
} from '@chakra-ui/react';
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
  const [_error, setError] = useState<string | null>(null);

  const isUpcoming = seasonStatus === 'UPCOMING';

  useEffect(() => {
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
  const totalQuestions = status?.totalQuestions ?? 0;

  // For upcoming seasons, show a minimal placeholder
  if (isUpcoming) {
    return (
      <Box
        bg="rgba(26, 25, 32, 1)"
        border="1px solid rgba(255,255,255,0.08)"
        borderRadius="14px"
        overflow="hidden"
      >
        <Box px="22px" pt="20px" pb="20px">
          <Box
            bg="linear-gradient(135deg, rgba(232,98,42,0.1) 0%, rgba(232,98,42,0.02) 100%)"
            border="1px dashed rgba(232,98,42,0.25)"
            borderRadius="10px"
            p={5}
            textAlign="center"
          >
            <Text
              fontFamily="heading"
              fontSize="20px"
              letterSpacing="1px"
              color="text.primary"
              mb="4px"
            >
              Weekly Questions
            </Text>
            <Text fontSize="13px" color="text.secondary">
              Questions will be available after the season starts
            </Text>
          </Box>
        </Box>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box
        bg="rgba(26, 25, 32, 1)"
        border="1px solid rgba(255,255,255,0.08)"
        borderRadius="14px"
        p="22px"
      >
        <Skeleton height="100px" borderRadius="10px" />
      </Box>
    );
  }

  return (
    <Box
      bg="rgba(26, 25, 32, 1)"
      border="1px solid rgba(255,255,255,0.08)"
      borderRadius="14px"
      overflow="hidden"
    >
      <Box px="22px" pt="20px" pb="20px">
        <Box
          bg="linear-gradient(135deg, rgba(232,98,42,0.1) 0%, rgba(232,98,42,0.02) 100%)"
          border="1px dashed rgba(232,98,42,0.25)"
          borderRadius="10px"
          p={5}
          textAlign="center"
        >
          <Text
            fontFamily="heading"
            fontSize="20px"
            letterSpacing="1px"
            color="text.primary"
            mb="4px"
          >
            {hasAction
              ? `Episode ${status?.currentEpisode || ''} Picks Are Open`
              : 'View Question Results'}
          </Text>
          <Text fontSize="13px" color="text.secondary" mb="14px">
            {hasAction
              ? `${totalQuestions} question${totalQuestions === 1 ? '' : 's'} to answer before ${dueDate}`
              : `Episode ${status?.currentEpisode || ''} — ${status?.answeredQuestions || 0}/${totalQuestions} answered`}
          </Text>
          <Box
            as="button"
            display="inline-flex"
            alignItems="center"
            gap="6px"
            px={6}
            py="10px"
            bg="brand.primary"
            color="white"
            fontFamily="heading"
            fontWeight="700"
            fontSize="14px"
            letterSpacing="2px"
            textTransform="uppercase"
            border="none"
            borderRadius="6px"
            cursor="pointer"
            transition="all 0.15s"
            boxShadow="0 2px 12px rgba(232,98,42,0.3)"
            _hover={{
              bg: '#d4521a',
              boxShadow: '0 4px 20px rgba(232,98,42,0.4)',
              transform: 'translateY(-1px)',
            }}
            onClick={() =>
              router.push(
                hasAction
                  ? `/leagues/${leagueId}/questions`
                  : `/leagues/${leagueId}/questions/results`
              )
            }
          >
            {hasAction ? 'Make Your Picks →' : 'View Results →'}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

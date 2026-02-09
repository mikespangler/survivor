'use client';

import { Box, VStack, HStack, Text, Button, Alert, AlertIcon } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import type { EpisodeState } from '@/types/api';

interface EpisodeStatusMessageProps {
  state: EpisodeState;
  episodeNumber: number;
  isCommissioner: boolean;
  leagueId: string;
  seasonId: string;
  deadline?: string | null;
  scoredQuestions?: number;
  totalQuestions?: number;
}

interface StatusConfig {
  title: string;
  description: string;
  status: 'info' | 'warning' | 'success' | 'error';
  showAction?: boolean;
  actionLabel?: string;
  actionHref?: string;
}

export function EpisodeStatusMessage({
  state,
  episodeNumber,
  isCommissioner,
  leagueId,
  seasonId,
  deadline,
  scoredQuestions = 0,
  totalQuestions = 0,
}: EpisodeStatusMessageProps) {
  const router = useRouter();

  const getPlayerConfig = (): StatusConfig => {
    switch (state) {
      case 'FUTURE':
        return {
          title: 'Episode Coming Soon',
          description: `Episode ${episodeNumber} hasn't aired yet. Check back after the episode airs!`,
          status: 'info',
        };
      case 'QUESTIONS_NOT_READY':
        return {
          title: 'Questions Coming Soon',
          description: 'Your commissioner is preparing questions for this episode. Check back later!',
          status: 'info',
        };
      case 'SUBMISSIONS_OPEN':
        return {
          title: 'Submissions Open',
          description: deadline
            ? `Submit your predictions before ${formatDeadline(deadline)}`
            : 'Submit your predictions before the episode airs',
          status: 'success',
        };
      case 'SUBMISSIONS_CLOSED':
        return {
          title: 'Awaiting Scoring',
          description: 'The episode has aired. Waiting for your commissioner to score the questions.',
          status: 'warning',
        };
      case 'PARTIALLY_SCORED':
        return {
          title: 'Scoring In Progress',
          description: `Your commissioner is scoring this episode (${scoredQuestions} of ${totalQuestions} complete).`,
          status: 'warning',
        };
      case 'FULLY_SCORED':
        return {
          title: 'Episode Complete',
          description: 'All questions have been scored. View your results below!',
          status: 'success',
        };
      default:
        return {
          title: 'Unknown Status',
          description: 'Unable to determine episode status.',
          status: 'info',
        };
    }
  };

  const getCommissionerConfig = (): StatusConfig => {
    const baseUrl = `/leagues/${leagueId}/settings?tab=questions`;

    switch (state) {
      case 'FUTURE':
        return {
          title: 'Episode Coming Soon',
          description: `Episode ${episodeNumber} hasn't aired yet. You can prepare questions ahead of time.`,
          status: 'info',
          showAction: true,
          actionLabel: 'Set Up Questions',
          actionHref: `${baseUrl}&episode=${episodeNumber}`,
        };
      case 'QUESTIONS_NOT_READY':
        return {
          title: 'Questions Needed',
          description: `Create questions for Episode ${episodeNumber} so players can submit predictions.`,
          status: 'warning',
          showAction: true,
          actionLabel: 'Create Questions',
          actionHref: `${baseUrl}&episode=${episodeNumber}`,
        };
      case 'SUBMISSIONS_OPEN':
        return {
          title: 'Submissions Open',
          description: deadline
            ? `Players can submit predictions until ${formatDeadline(deadline)}`
            : 'Players can submit predictions until the episode airs',
          status: 'success',
          showAction: true,
          actionLabel: 'Manage Questions',
          actionHref: `${baseUrl}&episode=${episodeNumber}`,
        };
      case 'SUBMISSIONS_CLOSED':
        return {
          title: 'Scoring Required',
          description: `The episode has aired. Score the ${totalQuestions} question${totalQuestions !== 1 ? 's' : ''} to update standings.`,
          status: 'warning',
          showAction: true,
          actionLabel: 'Score Questions',
          actionHref: `${baseUrl}&episode=${episodeNumber}`,
        };
      case 'PARTIALLY_SCORED':
        return {
          title: 'Continue Scoring',
          description: `${scoredQuestions} of ${totalQuestions} questions scored. Complete scoring to finalize standings.`,
          status: 'warning',
          showAction: true,
          actionLabel: 'Continue Scoring',
          actionHref: `${baseUrl}&episode=${episodeNumber}`,
        };
      case 'FULLY_SCORED':
        return {
          title: 'Episode Complete',
          description: 'All questions have been scored and standings are updated.',
          status: 'success',
          showAction: true,
          actionLabel: 'View Results',
          actionHref: `${baseUrl}&episode=${episodeNumber}`,
        };
      default:
        return {
          title: 'Unknown Status',
          description: 'Unable to determine episode status.',
          status: 'info',
        };
    }
  };

  const config = isCommissioner ? getCommissionerConfig() : getPlayerConfig();

  const handleAction = () => {
    if (config.actionHref) {
      router.push(config.actionHref);
    }
  };

  return (
    <Alert
      status={config.status}
      borderRadius="24px"
      bg="linear-gradient(169.729deg, rgb(33, 38, 48) 2.5008%, rgb(25, 29, 36) 97.499%)"
      border="2px solid"
      borderColor="rgba(43, 48, 59, 0.5)"
      p={6}
    >
      <AlertIcon color={getAlertColor(config.status)} />
      <Box flex="1">
        <VStack align="start" spacing={2}>
          <Text color="text.primary" fontSize="18px" fontWeight="semibold">
            {config.title}
          </Text>
          <Text color="text.secondary" fontSize="16px">
            {config.description}
          </Text>
        </VStack>
      </Box>
      {config.showAction && config.actionLabel && (
        <Button
          size="md"
          bg="brand.primary"
          color="white"
          _hover={{ bg: 'brand.primaryHover' }}
          borderRadius="12px"
          onClick={handleAction}
          ml={4}
        >
          {config.actionLabel}
        </Button>
      )}
    </Alert>
  );
}

function formatDeadline(deadline: string): string {
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

function getAlertColor(status: 'info' | 'warning' | 'success' | 'error'): string {
  switch (status) {
    case 'success':
      return 'green.400';
    case 'warning':
      return 'yellow.400';
    case 'error':
      return 'red.400';
    default:
      return 'blue.400';
  }
}

export type { EpisodeStatusMessageProps };

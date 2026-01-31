'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Flex,
  Alert,
  AlertIcon,
  Skeleton,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from './icons';
import { api } from '@/lib/api';
import type { EpisodeResultsResponse } from '@/types/api';

interface QuestionResult {
  text: string;
  correct: boolean;
  points: number;
}

interface WeekResultsCardProps {
  leagueId: string;
  seasonId: string;
  episodeNumber: number;
}

interface TransformedResults {
  weekNumber: number;
  pointsEarned: number;
  correctPredictions: number;
  totalPredictions: number;
  questions: QuestionResult[];
}

function transformResults(data: EpisodeResultsResponse): TransformedResults {
  // Filter questions for current user's answers
  const userQuestions = data.questions
    .map(q => {
      const userAnswer = q.answers.find(a => a.isCurrentUser);
      if (!userAnswer) return null;

      const isCorrect = q.isScored &&
        userAnswer.answer.toLowerCase().trim() ===
        q.correctAnswer?.toLowerCase().trim();

      return {
        text: q.text,
        correct: isCorrect,
        points: userAnswer.pointsEarned || 0
      };
    })
    .filter((q): q is QuestionResult => q !== null);

  const pointsEarned = userQuestions.reduce((sum, q) => sum + q.points, 0);
  const correctPredictions = userQuestions.filter(q => q.correct).length;

  return {
    weekNumber: data.episodeNumber,
    pointsEarned,
    correctPredictions,
    totalPredictions: userQuestions.length,
    questions: userQuestions
  };
}

export function WeekResultsCard({
  leagueId,
  seasonId,
  episodeNumber,
}: WeekResultsCardProps) {
  const [results, setResults] = useState<EpisodeResultsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await api.getEpisodeResults(leagueId, seasonId, episodeNumber);
        setResults(data);
      } catch (err) {
        console.error('Failed to load episode results:', err);
        setError('Failed to load week results');
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [leagueId, seasonId, episodeNumber]);

  if (isLoading) {
    return (
      <VStack align="stretch" gap={4} w="full">
        <Skeleton height="32px" width="200px" />
        <Skeleton height="120px" width="100%" />
        <Skeleton height="58px" width="100%" />
        <Skeleton height="58px" width="100%" />
      </VStack>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="24px">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  // No results or no questions
  if (!results || results.questions.length === 0) {
    return null;
  }

  // Not fully scored yet
  if (!results.isFullyScored) {
    return (
      <Box bg="bg.secondary" p={4} borderRadius="16px">
        <Text color="text.secondary">
          Week {episodeNumber} results pending - questions not yet scored
        </Text>
      </Box>
    );
  }

  // User has no team (e.g., admins viewing leagues they're not in)
  const hasUserAnswers = results.questions.some(q =>
    q.answers.some(a => a.isCurrentUser)
  );

  if (!hasUserAnswers) {
    return null;
  }

  const transformedData = transformResults(results);

  const {
    weekNumber,
    pointsEarned,
    correctPredictions,
    totalPredictions,
    questions
  } = transformedData;

  return (
    <VStack align="stretch" gap={4} w="full">
      {/* Header */}
      <Text fontFamily="display" fontSize="24px" fontWeight="bold" color="text.primary">
        Week {weekNumber} Results
      </Text>

      {/* Points Summary */}
      <Box
        bg="rgba(240, 101, 66, 0.1)"
        border="1px solid"
        borderColor="rgba(240, 101, 66, 0.2)"
        borderRadius="16px"
        p={6}
      >
        <HStack gap={4}>
          <Text
            fontFamily="display"
            fontSize="48px"
            fontWeight="bold"
            color="brand.primary"
          >
            +{pointsEarned}
          </Text>
          <VStack align="start" gap={1}>
            <Text fontFamily="body" fontSize="16px" fontWeight="bold" color="text.primary">
              Points Earned
            </Text>
            <Text fontFamily="body" fontSize="14px" fontWeight="medium" color="text.secondary">
              {correctPredictions}/{totalPredictions} predictions correct
            </Text>
          </VStack>
        </HStack>
      </Box>

      {/* Questions List */}
      <VStack align="stretch" gap={3}>
        {questions.map((question, idx) => (
          <QuestionResultRow key={idx} question={question} />
        ))}
      </VStack>
    </VStack>
  );
}

function QuestionResultRow({ question }: { question: QuestionResult }) {
  const isCorrect = question.correct;
  const bgColor = isCorrect ? 'rgba(76, 175, 80, 0.05)' : 'rgba(244, 67, 54, 0.05)';
  const borderColor = isCorrect ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)';
  const iconBgColor = isCorrect ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)';
  const iconColor = isCorrect ? '#4CAF50' : '#F44336';
  const pointsColor = isCorrect ? '#4CAF50' : 'text.secondary';

  return (
    <HStack
      justify="space-between"
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="16px"
      px={4}
      h="58px"
    >
      <HStack gap={3}>
        <Flex
          bg={iconBgColor}
          borderRadius="full"
          boxSize="24px"
          align="center"
          justify="center"
        >
          {isCorrect ? (
            <CheckIcon boxSize="14px" color={iconColor} />
          ) : (
            <CloseIcon boxSize="14px" color={iconColor} />
          )}
        </Flex>
        <Text fontFamily="body" fontSize="14px" fontWeight="medium" color="text.primary">
          {question.text}
        </Text>
      </HStack>
      <Text fontFamily="display" fontSize="16px" fontWeight="bold" color={pointsColor}>
        {isCorrect ? `+${question.points}` : question.points}
      </Text>
    </HStack>
  );
}

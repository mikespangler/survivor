'use client';

import {
  Box,
  VStack,
  HStack,
  Text,
  Flex,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from './icons';

interface QuestionResult {
  text: string;
  correct: boolean;
  points: number;
}

interface WeekResultsCardProps {
  // These would come from an API in production
  weekNumber?: number;
  pointsEarned?: number;
  correctPredictions?: number;
  totalPredictions?: number;
  questions?: QuestionResult[];
}

// Mock data for week results
const mockWeekResults = {
  weekNumber: 6,
  pointsEarned: 60,
  correctPredictions: 3,
  totalPredictions: 4,
  questions: [
    { text: 'Who will be voted out?', correct: true, points: 25 },
    { text: 'Will there be a blindside?', correct: true, points: 15 },
    { text: 'Will an immunity idol be played?', correct: true, points: 15 },
    { text: 'Who finds the immunity idol?', correct: false, points: 0 },
  ],
};

export function WeekResultsCard({
  weekNumber = mockWeekResults.weekNumber,
  pointsEarned = mockWeekResults.pointsEarned,
  correctPredictions = mockWeekResults.correctPredictions,
  totalPredictions = mockWeekResults.totalPredictions,
  questions = mockWeekResults.questions,
}: WeekResultsCardProps) {
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

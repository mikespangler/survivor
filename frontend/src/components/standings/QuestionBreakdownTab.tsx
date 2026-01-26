'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Select,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from '../dashboard/icons';
import { api } from '@/lib/api';
import type { EpisodeResultsResponse } from '@/types/api';

interface QuestionBreakdownTabProps {
  leagueId: string;
  seasonId: string;
  currentEpisode: number;
}

export function QuestionBreakdownTab({
  leagueId,
  seasonId,
  currentEpisode,
}: QuestionBreakdownTabProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<number>(currentEpisode);
  const [results, setResults] = useState<EpisodeResultsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const episodes = Array.from({ length: currentEpisode }, (_, i) => i + 1);

  useEffect(() => {
    const loadResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await api.getEpisodeResults(leagueId, seasonId, selectedEpisode);
        setResults(data);
      } catch (err) {
        console.error('Failed to load episode results:', err);
        setError('Failed to load question results');
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [leagueId, seasonId, selectedEpisode]);

  if (isLoading) {
    return (
      <VStack py={10}>
        <Spinner size="lg" color="orange.500" />
        <Text>Loading questions...</Text>
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

  if (!results || results.questions.length === 0) {
    return (
      <Alert status="info" borderRadius="24px">
        <AlertIcon />
        No questions available for this episode.
      </Alert>
    );
  }

  return (
    <VStack align="stretch" gap={6}>
      <HStack justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="semibold">
          Question Breakdown
        </Text>
        <Select
          value={selectedEpisode}
          onChange={(e) => setSelectedEpisode(parseInt(e.target.value, 10))}
          maxW="250px"
          borderRadius="12px"
        >
          {episodes.map((ep) => (
            <option key={ep} value={ep}>
              Episode {ep}
            </option>
          ))}
        </Select>
      </HStack>

      <Accordion allowMultiple>
        {results.questions.map((question, index) => (
          <AccordionItem
            key={question.id}
            borderWidth="1px"
            borderRadius="16px"
            mb={4}
            overflow="hidden"
          >
            <h2>
              <AccordionButton
                bg="bg.secondary"
                _hover={{ bg: 'bg.overlay' }}
                py={4}
              >
                <Box flex="1" textAlign="left">
                  <HStack gap={4}>
                    <Text fontWeight="semibold">Q{index + 1}:</Text>
                    <Text>{question.text}</Text>
                    <Badge colorScheme="orange" fontSize="xs">
                      {question.pointValue} pts
                    </Badge>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel p={0}>
              {question.isScored && question.correctAnswer && (
                <Box px={6} py={3} bg="green.50" borderBottomWidth="1px">
                  <Text fontSize="sm" fontWeight="semibold" color="green.700">
                    Correct Answer: {question.correctAnswer}
                  </Text>
                </Box>
              )}

              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Team</Th>
                    <Th>Answer</Th>
                    <Th textAlign="center">Result</Th>
                    <Th isNumeric>Points</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {question.answers.map((answer) => {
                    const isCorrect =
                      question.isScored &&
                      answer.answer.toLowerCase().trim() ===
                        question.correctAnswer?.toLowerCase().trim();

                    return (
                      <Tr
                        key={answer.teamId}
                        bg={answer.isCurrentUser ? 'bg.overlay' : undefined}
                        borderLeftWidth={answer.isCurrentUser ? '4px' : '0'}
                        borderLeftColor={answer.isCurrentUser ? 'brand.primary' : undefined}
                      >
                        <Td fontWeight={answer.isCurrentUser ? 'semibold' : 'normal'}>
                          {answer.teamName}
                        </Td>
                        <Td>
                          <Text>{answer.answer || '-'}</Text>
                        </Td>
                        <Td textAlign="center">
                          {question.isScored ? (
                            isCorrect ? (
                              <CheckIcon color="green.500" />
                            ) : (
                              <CloseIcon color="red.500" />
                            )
                          ) : (
                            <Text fontSize="sm" color="text.secondary">
                              Not scored
                            </Text>
                          )}
                        </Td>
                        <Td isNumeric fontWeight="semibold">
                          {answer.pointsEarned !== null && answer.pointsEarned !== undefined
                            ? answer.pointsEarned
                            : '-'}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </VStack>
  );
}

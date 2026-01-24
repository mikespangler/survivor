'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Radio,
  RadioGroup,
  Input,
  Spinner,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
} from '@chakra-ui/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@/lib/api';
import type { League, Season, EpisodeQuestionsResponse } from '@/types/api';

function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'No deadline set';
  const date = new Date(deadline);
  return date.toLocaleString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function getTimeRemaining(deadline: string | null): string {
  if (!deadline) return '';
  const now = new Date();
  const end = new Date(deadline);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return 'Deadline passed';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} remaining`;
  }

  return `${hours}h ${minutes}m remaining`;
}

export default function PlayerQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const toast = useToast();
  const leagueId = params.leagueId as string;

  const [league, setLeague] = useState<League | null>(null);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [questionsData, setQuestionsData] = useState<EpisodeQuestionsResponse | null>(null);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [submitting, setSubmitting] = useState<{ [questionId: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!leagueId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Load league
      const leagueData = await api.getLeague(leagueId);
      setLeague(leagueData);

      // Find active season
      const seasons = await api.getSeasons();
      const active = seasons.find(
        (s) => s.status === 'ACTIVE' || s.status === 'UPCOMING',
      );

      if (!active) {
        setError('No active season found');
        setIsLoading(false);
        return;
      }

      setActiveSeason(active);

      // Load questions for current episode
      const data = await api.getEpisodeQuestions(
        leagueId,
        active.id,
        active.activeEpisode || 1,
      );
      setQuestionsData(data);

      // Pre-populate answers
      const initialAnswers: { [key: string]: string } = {};
      data.questions.forEach((q) => {
        if (q.myAnswer) {
          initialAnswers[q.id] = q.myAnswer;
        }
      });
      setAnswers(initialAnswers);
    } catch (err: any) {
      console.error('Failed to load data', err);
      setError(err.message || 'Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/');
      return;
    }
    loadData();
  }, [isSignedIn, loadData, router]);

  const handleSubmitAnswer = async (questionId: string) => {
    if (!activeSeason || !answers[questionId]) return;

    setSubmitting((prev) => ({ ...prev, [questionId]: true }));
    try {
      await api.submitAnswer(leagueId, activeSeason.id, questionId, {
        answer: answers[questionId],
      });
      toast({ title: 'Answer submitted', status: 'success', duration: 2000 });

      // Reload to get updated data
      const data = await api.getEpisodeQuestions(
        leagueId,
        activeSeason.id,
        questionsData?.episodeNumber || 1,
      );
      setQuestionsData(data);
    } catch (err: any) {
      toast({
        title: 'Failed to submit answer',
        description: err.message,
        status: 'error',
      });
    } finally {
      setSubmitting((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  if (isLoading) {
    return (
      <Box as="main" minH="100vh" bg="gray.50" py={20}>
        <Container maxW="container.md">
          <VStack gap={4}>
            <Spinner size="xl" />
            <Text>Loading questions...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box as="main" minH="100vh" bg="gray.50" py={20}>
        <Container maxW="container.md">
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </Container>
      </Box>
    );
  }

  if (!questionsData || questionsData.questions.length === 0) {
    return (
      <Box as="main" minH="100vh" bg="gray.50" py={10}>
        <Container maxW="container.md">
          <VStack gap={6} align="stretch">
            <Box>
              <Heading as="h1" size="xl">
                Weekly Questions
              </Heading>
              {league && activeSeason && (
                <Text fontSize="lg" color="gray.600">
                  {league.name} - {activeSeason.name}
                </Text>
              )}
            </Box>

            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <AlertTitle>No Questions Yet</AlertTitle>
              <AlertDescription>
                Questions for this episode haven&apos;t been set up yet. Check back later!
              </AlertDescription>
            </Alert>

            <Button
              variant="link"
              colorScheme="orange"
              onClick={() => router.push(`/leagues/${leagueId}/questions/results`)}
            >
              View Past Results
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  const answeredCount = questionsData.questions.filter((q) => q.myAnswer).length;
  const totalQuestions = questionsData.questions.length;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  const timeRemaining = getTimeRemaining(questionsData.deadline);

  return (
    <Box as="main" minH="100vh" bg="gray.50" py={10}>
      <Container maxW="container.md">
        <VStack gap={6} align="stretch">
          <Box>
            <HStack justify="space-between" align="flex-start">
              <Box>
                <Heading as="h1" size="xl">
                  Episode {questionsData.episodeNumber} Questions
                </Heading>
                {league && activeSeason && (
                  <Text fontSize="lg" color="gray.600">
                    {league.name} - {activeSeason.name}
                  </Text>
                )}
              </Box>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/leagues/${leagueId}/questions/results`)}
              >
                View Results
              </Button>
            </HStack>
          </Box>

          {/* Deadline and Progress */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Box>
                    <Text fontWeight="bold" color="gray.700">
                      Deadline
                    </Text>
                    <Text>{formatDeadline(questionsData.deadline)}</Text>
                  </Box>
                  <Box textAlign="right">
                    {questionsData.canSubmit ? (
                      <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                        {timeRemaining}
                      </Badge>
                    ) : (
                      <Badge colorScheme="red" fontSize="md" px={3} py={1}>
                        Submissions Closed
                      </Badge>
                    )}
                  </Box>
                </HStack>

                <Box>
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="sm" color="gray.600">
                      Progress
                    </Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {answeredCount} / {totalQuestions} answered
                    </Text>
                  </HStack>
                  <Progress
                    value={progress}
                    colorScheme={progress === 100 ? 'green' : 'orange'}
                    borderRadius="full"
                    size="sm"
                  />
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Questions */}
          <VStack spacing={4} align="stretch">
            {questionsData.questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader pb={2}>
                  <HStack justify="space-between">
                    <Text fontWeight="bold" color="gray.700">
                      Question {index + 1}
                    </Text>
                    <HStack>
                      <Badge colorScheme="blue">{question.pointValue} pt</Badge>
                      {question.myAnswer && (
                        <Badge colorScheme="green">Answered</Badge>
                      )}
                      {question.isScored && (
                        <Badge colorScheme="purple">Scored</Badge>
                      )}
                    </HStack>
                  </HStack>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack spacing={4} align="stretch">
                    <Text fontSize="lg">{question.text}</Text>

                    {question.type === 'MULTIPLE_CHOICE' && question.options ? (
                      <RadioGroup
                        value={answers[question.id] || ''}
                        onChange={(value) =>
                          setAnswers((prev) => ({ ...prev, [question.id]: value }))
                        }
                        isDisabled={!questionsData.canSubmit}
                      >
                        <VStack align="stretch" spacing={2}>
                          {(question.options as string[]).map((option) => (
                            <Box
                              key={option}
                              p={3}
                              borderWidth="1px"
                              borderRadius="md"
                              borderColor={
                                answers[question.id] === option
                                  ? 'orange.300'
                                  : 'gray.200'
                              }
                              bg={
                                answers[question.id] === option
                                  ? 'orange.50'
                                  : 'white'
                              }
                              cursor={questionsData.canSubmit ? 'pointer' : 'default'}
                              onClick={() =>
                                questionsData.canSubmit &&
                                setAnswers((prev) => ({
                                  ...prev,
                                  [question.id]: option,
                                }))
                              }
                            >
                              <Radio value={option}>{option}</Radio>
                            </Box>
                          ))}
                        </VStack>
                      </RadioGroup>
                    ) : (
                      <Input
                        value={answers[question.id] || ''}
                        onChange={(e) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [question.id]: e.target.value,
                          }))
                        }
                        placeholder="Type your answer..."
                        isDisabled={!questionsData.canSubmit}
                      />
                    )}

                    {questionsData.canSubmit && (
                      <Button
                        colorScheme="orange"
                        size="sm"
                        alignSelf="flex-end"
                        onClick={() => handleSubmitAnswer(question.id)}
                        isLoading={submitting[question.id]}
                        isDisabled={
                          !answers[question.id] ||
                          answers[question.id] === question.myAnswer
                        }
                      >
                        {question.myAnswer ? 'Update Answer' : 'Submit Answer'}
                      </Button>
                    )}

                    {question.isScored && (
                      <Box p={3} bg="gray.50" borderRadius="md">
                        <HStack justify="space-between">
                          <Box>
                            <Text fontSize="sm" color="gray.600">
                              Correct Answer
                            </Text>
                            <Text fontWeight="medium">{question.correctAnswer}</Text>
                          </Box>
                          <Box textAlign="right">
                            <Text fontSize="sm" color="gray.600">
                              Points Earned
                            </Text>
                            <Text
                              fontWeight="bold"
                              fontSize="lg"
                              color={
                                question.pointsEarned && question.pointsEarned > 0
                                  ? 'green.500'
                                  : 'red.500'
                              }
                            >
                              {question.pointsEarned ?? 0} / {question.pointValue}
                            </Text>
                          </Box>
                        </HStack>
                      </Box>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}

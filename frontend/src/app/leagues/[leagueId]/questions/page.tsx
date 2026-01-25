'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  useToast,
} from '@chakra-ui/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { AuthenticatedLayout } from '@/components/navigation';
import type {
  League,
  Season,
  EpisodeQuestionsResponse,
  MyTeamResponse,
} from '@/types/api';
import {
  QuestionCard,
  StatsBar,
  HeaderBar,
  FooterBar,
} from '@/components/questions';

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

// Helper to get time remaining
function getTimeRemaining(deadline: string | null): string {
  if (!deadline) return '';
  const now = new Date();
  const end = new Date(deadline);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return '0d : 0h : 0m';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${days}d : ${hours}h : ${minutes}m`;
}

// Answer state type
interface AnswerState {
  answer: string;
  wagerAmount: number;
}

export default function PlayerQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const toast = useToast();
  const leagueId = params.leagueId as string;

  const [league, setLeague] = useState<League | null>(null);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [questionsData, setQuestionsData] =
    useState<EpisodeQuestionsResponse | null>(null);
  const [teamData, setTeamData] = useState<MyTeamResponse | null>(null);
  const [answers, setAnswers] = useState<{ [questionId: string]: AnswerState }>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

      // Load team data for stats
      try {
        const team = await api.getMyTeam(leagueId, active.id);
        setTeamData(team);
      } catch {
        // User might not have a team yet
        console.log('No team found for user');
      }

      // Pre-populate answers
      const initialAnswers: { [key: string]: AnswerState } = {};
      data.questions.forEach((q) => {
        initialAnswers[q.id] = {
          answer: q.myAnswer || '',
          wagerAmount: q.myWagerAmount ?? q.minWager ?? 0,
        };
      });
      setAnswers(initialAnswers);
    } catch (err: unknown) {
      console.error('Failed to load data', err);
      const message = err instanceof Error ? err.message : 'Failed to load questions';
      setError(message);
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

  // Group questions by scope and type
  const groupedQuestions = useMemo(() => {
    if (!questionsData) return { episode: [], season: [], wager: [] };

    const episode: typeof questionsData.questions = [];
    const season: typeof questionsData.questions = [];
    const wager: typeof questionsData.questions = [];

    questionsData.questions.forEach((q) => {
      if (q.isWager) {
        wager.push(q);
      } else if (q.questionScope === 'season') {
        season.push(q);
      } else {
        episode.push(q);
      }
    });

    return { episode, season, wager };
  }, [questionsData]);

  // Handle answer selection
  const handleSelectAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        answer,
      },
    }));
  };

  // Handle clear selection
  const handleClearSelection = (questionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        answer: '',
      },
    }));
  };

  // Handle wager change
  const handleWagerChange = (questionId: string, amount: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        wagerAmount: amount,
      },
    }));
  };

  // Submit all answers
  const handleSubmitAll = async () => {
    if (!activeSeason || !questionsData) return;

    setIsSubmitting(true);
    try {
      // Submit each answer
      for (const q of questionsData.questions) {
        const answerState = answers[q.id];
        if (answerState?.answer) {
          await api.submitAnswer(leagueId, activeSeason.id, q.id, {
            answer: answerState.answer,
            wagerAmount: q.isWager ? answerState.wagerAmount : undefined,
          });
        }
      }

      toast({
        title: 'Answers submitted successfully!',
        status: 'success',
        duration: 3000,
      });

      // Reload data
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit answers';
      toast({
        title: 'Failed to submit answers',
        description: message,
        status: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save draft (same as submit but shows different message)
  const handleSaveDraft = async () => {
    if (!activeSeason || !questionsData) return;

    setIsSubmitting(true);
    try {
      // Submit each answered question
      for (const q of questionsData.questions) {
        const answerState = answers[q.id];
        if (answerState?.answer) {
          await api.submitAnswer(leagueId, activeSeason.id, q.id, {
            answer: answerState.answer,
            wagerAmount: q.isWager ? answerState.wagerAmount : undefined,
          });
        }
      }

      toast({
        title: 'Draft saved!',
        status: 'success',
        duration: 2000,
      });

      // Reload data
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save draft';
      toast({
        title: 'Failed to save draft',
        description: message,
        status: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate progress
  const answeredCount = questionsData
    ? questionsData.questions.filter((q) => answers[q.id]?.answer).length
    : 0;
  const totalQuestions = questionsData?.questions.length || 0;

  // Loading state
  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <Box as="main" minH="100vh" bg="transparent" py={20}>
          <Container maxW="container.lg">
            <VStack gap={4}>
              <Spinner size="xl" color="brand.primary" />
              <Text color="text.secondary">Loading questions...</Text>
            </VStack>
          </Container>
        </Box>
      </AuthenticatedLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AuthenticatedLayout>
        <Box as="main" minH="100vh" bg="transparent" py={20}>
          <Container maxW="container.lg">
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </Container>
        </Box>
      </AuthenticatedLayout>
    );
  }

  // No questions state
  if (!questionsData || questionsData.questions.length === 0) {
    return (
      <AuthenticatedLayout>
        <Box as="main" minH="100vh" bg="transparent" py={10}>
          <Container maxW="container.lg">
            <VStack gap={6} align="stretch">
              <Box>
                <Text
                  fontFamily="display"
                  fontSize="48px"
                  fontWeight="bold"
                  color="text.primary"
                  letterSpacing="-1.2px"
                >
                  Weekly Questions
                </Text>
                {league && activeSeason && (
                  <Text fontSize="18px" color="text.secondary" fontWeight="medium">
                    {league.name} - {activeSeason.name}
                  </Text>
                )}
              </Box>

              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <AlertTitle>No Questions Yet</AlertTitle>
                <AlertDescription>
                  Questions for this episode haven&apos;t been set up yet. Check
                  back later!
                </AlertDescription>
              </Alert>

              <Button
                variant="link"
                color="brand.primary"
                onClick={() => router.push(`/leagues/${leagueId}/questions/results`)}
              >
                View Past Results
              </Button>
            </VStack>
          </Container>
        </Box>
      </AuthenticatedLayout>
    );
  }

  // Render question section
  const renderQuestionSection = (
    title: string,
    subtitle: string,
    questions: typeof questionsData.questions,
    startIndex: number,
  ) => {
    if (questions.length === 0) return null;

    return (
      <VStack spacing={4} align="stretch">
        {/* Section header */}
        <HStack justify="space-between" align="center" h="48px">
          <Text
            fontFamily="display"
            fontSize="32px"
            fontWeight="bold"
            color="text.primary"
            letterSpacing="-0.8px"
            lineHeight="48px"
          >
            {title}
          </Text>
          <Text
            fontFamily="body"
            fontSize="14px"
            fontWeight="medium"
            color="text.secondary"
            lineHeight="21px"
          >
            {subtitle}
          </Text>
        </HStack>

        {/* Questions */}
        <VStack spacing={6} align="stretch">
          {questions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              questionNumber={startIndex + idx + 1}
              text={q.text}
              type={q.type}
              options={q.options as string[] | undefined}
              pointValue={q.pointValue}
              questionScope={q.questionScope}
              isWager={q.isWager}
              minWager={q.minWager}
              maxWager={q.maxWager}
              selectedAnswer={answers[q.id]?.answer || null}
              wagerAmount={answers[q.id]?.wagerAmount ?? q.minWager ?? 0}
              isDisabled={!questionsData.canSubmit}
              isScored={q.isScored}
              correctAnswer={q.correctAnswer}
              pointsEarned={q.pointsEarned}
              onSelectAnswer={(answer) => handleSelectAnswer(q.id, answer)}
              onClearSelection={() => handleClearSelection(q.id)}
              onWagerChange={(amount) => handleWagerChange(q.id, amount)}
            />
          ))}
        </VStack>
      </VStack>
    );
  };

  return (
    <AuthenticatedLayout>
      <Box as="main" minH="100vh" bg="transparent">
        <Container maxW="container.lg" py={8} px={8}>
          <VStack spacing={11} align="stretch">
            {/* Header */}
            <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={4}>
              <VStack align="start" spacing={2} maxW="550px">
                <Text
                  fontFamily="display"
                  fontSize="48px"
                  fontWeight="bold"
                  color="text.primary"
                  letterSpacing="-1.2px"
                  lineHeight="48px"
                >
                  Weekly Questions
                </Text>
                <Text
                  fontFamily="body"
                  fontSize="18px"
                  fontWeight="medium"
                  color="text.secondary"
                  lineHeight="28px"
                >
                  Make your predictions for this week&apos;s episode to earn points.
                </Text>
              </VStack>

              {/* Header bar with week info */}
              <HeaderBar
                weekNumber={questionsData.episodeNumber}
                dueIn={getTimeRemaining(questionsData.deadline)}
                locksAt={formatDeadline(questionsData.deadline)}
              />
            </HStack>

            {/* Stats bar */}
            {teamData && (
              <StatsBar
                teamName={teamData.name}
                totalPoints={teamData.totalPoints}
                rank={teamData.rank}
                totalTeams={teamData.totalTeams}
                teamMembers={teamData.roster?.map(r => ({
                  id: r.castaway.id,
                  name: r.castaway.name,
                  imageUrl: undefined, // TODO: Add image URLs when available
                  isActive: r.isActive,
                }))}
                isLoading={false}
              />
            )}

            {/* Episode Questions Section */}
            {renderQuestionSection(
              'Episode Questions',
              `${groupedQuestions.episode.length} question${groupedQuestions.episode.length !== 1 ? 's' : ''}`,
              groupedQuestions.episode,
              0,
            )}

            {/* Season Bonus Questions Section */}
            {renderQuestionSection(
              'Season Bonus Questions',
              'Scored at season end',
              groupedQuestions.season,
              groupedQuestions.episode.length,
            )}

            {/* Point Wager Questions Section */}
            {renderQuestionSection(
              'Point Wager Questions',
              'Risk it for the biscuit',
              groupedQuestions.wager,
              groupedQuestions.episode.length + groupedQuestions.season.length,
            )}

            {/* Footer */}
            <FooterBar
              answeredCount={answeredCount}
              totalCount={totalQuestions}
              canSubmit={questionsData.canSubmit}
              isSubmitting={isSubmitting}
              onSaveDraft={handleSaveDraft}
              onSubmit={handleSubmitAll}
            />
          </VStack>
        </Container>
      </Box>
    </AuthenticatedLayout>
  );
}

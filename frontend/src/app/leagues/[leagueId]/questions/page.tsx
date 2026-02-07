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
  useToast,
} from '@chakra-ui/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { AuthenticatedLayout } from '@/components/navigation';
import type {
  Season,
  EpisodeQuestionsResponse,
  MyTeamResponse,
  EpisodeState,
  LeagueEpisodeStatesResponse,
} from '@/types/api';
import {
  QuestionCard,
  StatsBar,
  HeaderBar,
  FooterBar,
  EpisodeStatusMessage,
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

  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [questionsData, setQuestionsData] =
    useState<EpisodeQuestionsResponse | null>(null);
  const [teamData, setTeamData] = useState<MyTeamResponse | null>(null);
  const [episodeStates, setEpisodeStates] = useState<LeagueEpisodeStatesResponse | null>(null);
  const [answers, setAnswers] = useState<{ [questionId: string]: AnswerState }>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-save state tracking
  const [savingStates, setSavingStates] = useState<{ [questionId: string]: boolean }>({});
  const [saveErrors, setSaveErrors] = useState<{ [questionId: string]: string }>({});

  const loadData = useCallback(async () => {
    if (!leagueId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Load league
      await api.getLeague(leagueId);

      // Find active season
      const seasons = await api.getSeasons();
      const active = seasons.find(
        (s) => s.status === 'ACTIVE' || s.status === 'UPCOMING',
      );

      if (!active) {
        setError('No active or upcoming season found');
        setIsLoading(false);
        return;
      }

      setActiveSeason(active);

      // For UPCOMING seasons, don't load questions - they don't exist yet
      if (active.status === 'UPCOMING') {
        setIsLoading(false);
        return;
      }

      // Load questions for current episode
      const data = await api.getEpisodeQuestions(
        leagueId,
        active.id,
        active.activeEpisode || 1,
      );
      setQuestionsData(data);

      // Load episode states for commissioner actions
      try {
        const states = await api.getEpisodeStates(leagueId, active.id);
        setEpisodeStates(states);
      } catch {
        console.log('Failed to load episode states');
      }

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

  // Auto-save function
  const autoSaveAnswer = useCallback(async (questionId: string, answer: string, wagerAmount?: number) => {
    if (!activeSeason || !answer) return;
    
    setSavingStates(prev => ({ ...prev, [questionId]: true }));
    setSaveErrors(prev => ({ ...prev, [questionId]: '' }));
    
    try {
      await api.submitAnswer(leagueId, activeSeason.id, questionId, {
        answer,
        wagerAmount,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save';
      setSaveErrors(prev => ({ ...prev, [questionId]: message }));
      toast({
        title: 'Failed to save answer',
        description: message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setSavingStates(prev => ({ ...prev, [questionId]: false }));
    }
  }, [activeSeason, leagueId, toast]);

  // Handle answer selection (immediate save for multiple choice)
  const handleSelectAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        answer,
      },
    }));
    
    // Immediate save for multiple choice
    const question = questionsData?.questions.find(q => q.id === questionId);
    if (question?.type === 'MULTIPLE_CHOICE') {
      autoSaveAnswer(questionId, answer, answers[questionId]?.wagerAmount);
    }
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

  // Handle wager change (immediate save)
  const handleWagerChange = (questionId: string, amount: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        wagerAmount: amount,
      },
    }));
    
    // Immediate save for wager changes
    const answerText = answers[questionId]?.answer;
    if (answerText) {
      autoSaveAnswer(questionId, answerText, amount);
    }
  };

  // Debounce fill-in-the-blank answers
  useEffect(() => {
    if (!questionsData) return;
    
    const fillInQuestions = questionsData.questions.filter(q => q.type === 'FILL_IN_THE_BLANK');
    
    const timeouts: NodeJS.Timeout[] = [];
    
    fillInQuestions.forEach(question => {
      const answer = answers[question.id]?.answer;
      const wagerAmount = answers[question.id]?.wagerAmount;
      
      // Only auto-save if there's an answer and it's different from the original
      if (answer && answer !== question.myAnswer) {
        const timeoutId = setTimeout(() => {
          autoSaveAnswer(question.id, answer, wagerAmount);
        }, 1000); // 1 second debounce
        
        timeouts.push(timeoutId);
      }
    });
    
    return () => {
      timeouts.forEach(id => {
        clearTimeout(id);
      });
    };
  }, [answers, questionsData, autoSaveAnswer]);

  // Calculate progress
  const answeredCount = questionsData
    ? questionsData.questions.filter((q) => answers[q.id]?.answer).length
    : 0;
  const totalQuestions = questionsData?.questions.length || 0;
  
  // Check if any answers are currently saving
  const anySaving = Object.values(savingStates).some(saving => saving);

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

  // Upcoming season or no questions state
  if (!questionsData || questionsData.questions.length === 0) {
    const isUpcoming = activeSeason?.status === 'UPCOMING';
    const episodeState: EpisodeState = isUpcoming ? 'FUTURE' : (questionsData?.episodeState || 'QUESTIONS_NOT_READY');
    const currentEpisodeNumber = activeSeason?.activeEpisode || 1;
    const isCommissioner = episodeStates?.isCommissioner || false;

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
              </Box>

              <EpisodeStatusMessage
                state={episodeState}
                episodeNumber={currentEpisodeNumber}
                isCommissioner={isCommissioner}
                leagueId={leagueId}
                seasonId={activeSeason?.id || ''}
              />
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
              isSaving={savingStates[q.id] || false}
              saveError={saveErrors[q.id]}
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
              deadline={questionsData.deadline}
              timeRemaining={getTimeRemaining(questionsData.deadline)}
              isLocked={!questionsData.canSubmit}
              anySaving={anySaving}
            />
          </VStack>
        </Container>
      </Box>
    </AuthenticatedLayout>
  );
}

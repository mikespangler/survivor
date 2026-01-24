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
  Spinner,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
} from '@chakra-ui/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@/lib/api';
import type { League, Season, EpisodeResultsResponse } from '@/types/api';

function CheckIcon() {
  return (
    <Box as="span" color="green.500" fontWeight="bold">
      ✓
    </Box>
  );
}

function XIcon() {
  return (
    <Box as="span" color="red.500" fontWeight="bold">
      ✗
    </Box>
  );
}

export default function QuestionsResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const toast = useToast();
  const leagueId = params.leagueId as string;

  const [league, setLeague] = useState<League | null>(null);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [resultsData, setResultsData] = useState<EpisodeResultsResponse | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
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
      setSelectedEpisode(active.activeEpisode || 1);

      // Load results for current episode
      const data = await api.getEpisodeResults(
        leagueId,
        active.id,
        active.activeEpisode || 1,
      );
      setResultsData(data);
    } catch (err: any) {
      console.error('Failed to load data', err);
      setError(err.message || 'Failed to load results');
    } finally {
      setIsLoading(false);
    }
  }, [leagueId]);

  const loadResultsForEpisode = useCallback(
    async (episode: number) => {
      if (!activeSeason) return;

      setIsLoading(true);
      try {
        const data = await api.getEpisodeResults(leagueId, activeSeason.id, episode);
        setResultsData(data);
      } catch (err: any) {
        console.error('Failed to load results', err);
        toast({
          title: 'Failed to load results',
          description: err.message,
          status: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [leagueId, activeSeason, toast],
  );

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/');
      return;
    }
    loadData();
  }, [isSignedIn, loadData, router]);

  useEffect(() => {
    if (activeSeason && selectedEpisode) {
      loadResultsForEpisode(selectedEpisode);
    }
  }, [selectedEpisode, activeSeason, loadResultsForEpisode]);

  if (isLoading && !resultsData) {
    return (
      <Box as="main" minH="100vh" bg="gray.50" py={20}>
        <Container maxW="container.lg">
          <VStack gap={4}>
            <Spinner size="xl" />
            <Text>Loading results...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box as="main" minH="100vh" bg="gray.50" py={20}>
        <Container maxW="container.lg">
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box as="main" minH="100vh" bg="gray.50" py={10}>
      <Container maxW="container.lg">
        <VStack gap={6} align="stretch">
          <HStack justify="space-between" align="flex-start">
            <Box>
              <Heading as="h1" size="xl">
                Question Results
              </Heading>
              {league && activeSeason && (
                <Text fontSize="lg" color="gray.600">
                  {league.name} - {activeSeason.name}
                </Text>
              )}
            </Box>
            <Button
              colorScheme="orange"
              onClick={() => router.push(`/leagues/${leagueId}/questions`)}
            >
              Answer Questions
            </Button>
          </HStack>

          {/* Episode Selector */}
          <HStack>
            <FormControl maxW="200px">
              <FormLabel>Episode</FormLabel>
              <Select
                value={selectedEpisode}
                onChange={(e) => setSelectedEpisode(parseInt(e.target.value, 10))}
              >
                {Array.from({ length: 14 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    Episode {num}
                  </option>
                ))}
              </Select>
            </FormControl>
            {resultsData && (
              <Box pt={8}>
                {!resultsData.deadlinePassed ? (
                  <Badge colorScheme="yellow">Submissions Open</Badge>
                ) : resultsData.isFullyScored ? (
                  <Badge colorScheme="green">Fully Scored</Badge>
                ) : (
                  <Badge colorScheme="orange">Awaiting Scoring</Badge>
                )}
              </Box>
            )}
          </HStack>

          {!resultsData || resultsData.questions.length === 0 ? (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <AlertTitle>No Questions</AlertTitle>
              <AlertDescription>
                No questions have been set for this episode yet.
              </AlertDescription>
            </Alert>
          ) : (
            <Tabs>
              <TabList>
                <Tab>Leaderboard</Tab>
                <Tab>Questions</Tab>
              </TabList>

              <TabPanels>
                {/* Leaderboard Tab */}
                <TabPanel px={0}>
                  {resultsData.leaderboard.length === 0 ? (
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <AlertDescription>
                        {resultsData.isFullyScored
                          ? 'No answers have been submitted for this episode.'
                          : 'Results will appear here after questions are scored.'}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Card>
                      <CardHeader>
                        <Heading size="md">Episode {selectedEpisode} Standings</Heading>
                      </CardHeader>
                      <CardBody pt={0}>
                        <Table>
                          <Thead>
                            <Tr>
                              <Th>Rank</Th>
                              <Th>Team</Th>
                              <Th isNumeric>Points</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {resultsData.leaderboard.map((entry) => (
                              <Tr
                                key={entry.teamId}
                                bg={entry.isCurrentUser ? 'orange.50' : undefined}
                                fontWeight={entry.isCurrentUser ? 'bold' : undefined}
                              >
                                <Td>
                                  {entry.rank === 1 && '🥇 '}
                                  {entry.rank === 2 && '🥈 '}
                                  {entry.rank === 3 && '🥉 '}
                                  {entry.rank}
                                </Td>
                                <Td>
                                  {entry.teamName}
                                  {entry.isCurrentUser && (
                                    <Badge ml={2} colorScheme="orange">
                                      You
                                    </Badge>
                                  )}
                                </Td>
                                <Td isNumeric>{entry.points}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </CardBody>
                    </Card>
                  )}
                </TabPanel>

                {/* Questions Tab */}
                <TabPanel px={0}>
                  {!resultsData.deadlinePassed ? (
                    <Alert status="warning" borderRadius="md" mb={4}>
                      <AlertIcon />
                      <AlertDescription>
                        Full answers will be visible after the submission deadline passes.
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  <Accordion allowMultiple defaultIndex={[0]}>
                    {resultsData.questions.map((question, index) => (
                      <AccordionItem key={question.id}>
                        <h2>
                          <AccordionButton>
                            <HStack flex="1" justify="space-between" pr={4}>
                              <HStack>
                                <Text fontWeight="bold">Q{index + 1}.</Text>
                                <Text noOfLines={1}>{question.text}</Text>
                              </HStack>
                              <HStack>
                                <Badge colorScheme="blue">{question.pointValue} pt</Badge>
                                {question.isScored ? (
                                  <Badge colorScheme="green">Scored</Badge>
                                ) : (
                                  <Badge colorScheme="yellow">Pending</Badge>
                                )}
                              </HStack>
                            </HStack>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          <VStack align="stretch" spacing={4}>
                            <Box>
                              <Text fontWeight="bold" mb={2}>
                                {question.text}
                              </Text>
                              {question.type === 'MULTIPLE_CHOICE' && question.options && (
                                <HStack spacing={2} flexWrap="wrap">
                                  {(question.options as string[]).map((opt) => (
                                    <Badge
                                      key={opt}
                                      colorScheme={
                                        question.isScored && question.correctAnswer === opt
                                          ? 'green'
                                          : 'gray'
                                      }
                                      variant={
                                        question.isScored && question.correctAnswer === opt
                                          ? 'solid'
                                          : 'outline'
                                      }
                                    >
                                      {opt}
                                    </Badge>
                                  ))}
                                </HStack>
                              )}
                            </Box>

                            {question.isScored && (
                              <Box p={3} bg="green.50" borderRadius="md">
                                <Text fontWeight="bold" color="green.700">
                                  Correct Answer: {question.correctAnswer}
                                </Text>
                              </Box>
                            )}

                            {question.answers.length > 0 ? (
                              <Table size="sm">
                                <Thead>
                                  <Tr>
                                    <Th>Team</Th>
                                    <Th>Answer</Th>
                                    {question.isScored && <Th isNumeric>Points</Th>}
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {question.answers.map((answer) => {
                                    const isCorrect =
                                      question.isScored &&
                                      answer.answer?.toLowerCase().trim() ===
                                        question.correctAnswer?.toLowerCase().trim();

                                    return (
                                      <Tr
                                        key={answer.teamId}
                                        bg={answer.isCurrentUser ? 'orange.50' : undefined}
                                      >
                                        <Td>
                                          {answer.teamName}
                                          {answer.isCurrentUser && (
                                            <Badge ml={2} colorScheme="orange" size="sm">
                                              You
                                            </Badge>
                                          )}
                                        </Td>
                                        <Td>
                                          <HStack>
                                            <Text>{answer.answer}</Text>
                                            {question.isScored && (
                                              isCorrect ? <CheckIcon /> : <XIcon />
                                            )}
                                          </HStack>
                                        </Td>
                                        {question.isScored && (
                                          <Td isNumeric fontWeight="bold">
                                            {answer.pointsEarned ?? 0}
                                          </Td>
                                        )}
                                      </Tr>
                                    );
                                  })}
                                </Tbody>
                              </Table>
                            ) : (
                              <Text color="gray.500" fontStyle="italic">
                                No answers submitted yet.
                              </Text>
                            )}
                          </VStack>
                        </AccordionPanel>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </VStack>
      </Container>
    </Box>
  );
}

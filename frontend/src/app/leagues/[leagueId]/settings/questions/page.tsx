'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
  Badge,
  Textarea,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  VStack,
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@/lib/api';
import type {
  League,
  Season,
  LeagueQuestion,
  QuestionTemplate,
  CreateLeagueQuestionDto,
  QuestionType,
} from '@/types/api';

const QUESTION_TYPES: QuestionType[] = ['MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK'];

type QuestionFormState = {
  id: string;
  episodeNumber: number;
  text: string;
  type: QuestionType;
  options: string[];
  pointValue: number;
  newOption: string;
};

const initialQuestionForm: QuestionFormState = {
  id: '',
  episodeNumber: 1,
  text: '',
  type: 'MULTIPLE_CHOICE',
  options: [],
  pointValue: 1,
  newOption: '',
};

type ScoringState = {
  [questionId: string]: string;
};

export default function CommissionerQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const toast = useToast();
  const leagueId = params.leagueId as string;

  const [league, setLeague] = useState<League | null>(null);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [questions, setQuestions] = useState<LeagueQuestion[]>([]);
  const [templates, setTemplates] = useState<QuestionTemplate[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [form, setForm] = useState<QuestionFormState>(initialQuestionForm);
  const [scoringAnswers, setScoringAnswers] = useState<ScoringState>({});
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isOpen: isTemplatesOpen, onOpen: onTemplatesOpen, onClose: onTemplatesClose } = useDisclosure();
  const { isOpen: isScoringOpen, onOpen: onScoringOpen, onClose: onScoringClose } = useDisclosure();

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
      setForm((prev) => ({ ...prev, episodeNumber: active.activeEpisode || 1 }));

      // Load questions for this episode
      const questionsData = await api.getLeagueQuestions(
        leagueId,
        active.id,
        active.activeEpisode || 1,
      );
      setQuestions(questionsData);

      // Load templates
      const templatesData = await api.getAvailableTemplates(leagueId, active.id);
      setTemplates(templatesData);
    } catch (err: any) {
      console.error('Failed to load data', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [leagueId]);

  const loadQuestionsForEpisode = useCallback(async (episode: number) => {
    if (!activeSeason) return;

    try {
      const questionsData = await api.getLeagueQuestions(
        leagueId,
        activeSeason.id,
        episode,
      );
      setQuestions(questionsData);
    } catch (err: any) {
      console.error('Failed to load questions', err);
      toast({
        title: 'Failed to load questions',
        description: err.message,
        status: 'error',
      });
    }
  }, [leagueId, activeSeason, toast]);

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/');
      return;
    }
    loadData();
  }, [isSignedIn, loadData, router]);

  useEffect(() => {
    if (activeSeason && selectedEpisode) {
      loadQuestionsForEpisode(selectedEpisode);
    }
  }, [selectedEpisode, activeSeason, loadQuestionsForEpisode]);

  const handleAddOption = () => {
    if (!form.newOption.trim()) return;
    if (form.options.includes(form.newOption.trim())) {
      toast({ title: 'Option already exists', status: 'warning' });
      return;
    }
    setForm((prev) => ({
      ...prev,
      options: [...prev.options, prev.newOption.trim()],
      newOption: '',
    }));
  };

  const handleRemoveOption = (option: string) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.filter((o) => o !== option),
    }));
  };

  const handleSubmitQuestion = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeSeason) return;

    if (!form.text.trim()) {
      toast({ title: 'Question text is required', status: 'warning' });
      return;
    }

    if (form.type === 'MULTIPLE_CHOICE' && form.options.length < 2) {
      toast({ title: 'Multiple choice needs at least 2 options', status: 'warning' });
      return;
    }

    const payload: CreateLeagueQuestionDto = {
      episodeNumber: form.episodeNumber,
      text: form.text.trim(),
      type: form.type,
      options: form.type === 'MULTIPLE_CHOICE' ? form.options : undefined,
      pointValue: form.pointValue,
    };

    setIsSubmitting(true);
    try {
      if (form.id) {
        await api.updateLeagueQuestion(leagueId, activeSeason.id, form.id, payload);
        toast({ title: 'Question updated', status: 'success' });
      } else {
        await api.createLeagueQuestion(leagueId, activeSeason.id, payload);
        toast({ title: 'Question created', status: 'success' });
      }
      setForm({ ...initialQuestionForm, episodeNumber: selectedEpisode });
      await loadQuestionsForEpisode(selectedEpisode);
    } catch (err: any) {
      toast({
        title: 'Failed to save question',
        description: err.message,
        status: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditQuestion = (question: LeagueQuestion) => {
    setForm({
      id: question.id,
      episodeNumber: question.episodeNumber,
      text: question.text,
      type: question.type as QuestionType,
      options: (question.options as string[]) || [],
      pointValue: question.pointValue,
      newOption: '',
    });
  };

  const handleDeleteQuestion = async (question: LeagueQuestion) => {
    if (!activeSeason) return;
    if (!window.confirm('Delete this question?')) return;

    try {
      await api.deleteLeagueQuestion(leagueId, activeSeason.id, question.id);
      toast({ title: 'Question deleted', status: 'success' });
      await loadQuestionsForEpisode(selectedEpisode);
    } catch (err: any) {
      toast({
        title: 'Failed to delete question',
        description: err.message,
        status: 'error',
      });
    }
  };

  const handleAddFromTemplates = async () => {
    if (!activeSeason || selectedTemplates.length === 0) return;

    setIsSubmitting(true);
    try {
      await api.createQuestionsFromTemplates(leagueId, activeSeason.id, {
        episodeNumber: selectedEpisode,
        templateIds: selectedTemplates,
      });
      toast({
        title: `${selectedTemplates.length} question(s) added`,
        status: 'success',
      });
      setSelectedTemplates([]);
      onTemplatesClose();
      await loadQuestionsForEpisode(selectedEpisode);
    } catch (err: any) {
      toast({
        title: 'Failed to add questions',
        description: err.message,
        status: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenScoring = () => {
    const unscoredQuestions = questions.filter((q) => !q.isScored);
    if (unscoredQuestions.length === 0) {
      toast({ title: 'All questions are already scored', status: 'info' });
      return;
    }

    // Pre-populate with existing correct answers or empty strings
    const initial: ScoringState = {};
    unscoredQuestions.forEach((q) => {
      initial[q.id] = q.correctAnswer || '';
    });
    setScoringAnswers(initial);
    onScoringOpen();
  };

  const handleSubmitScoring = async () => {
    if (!activeSeason) return;

    const answers = Object.entries(scoringAnswers)
      .filter(([_, answer]) => answer.trim() !== '')
      .map(([questionId, correctAnswer]) => ({
        questionId,
        correctAnswer: correctAnswer.trim(),
      }));

    if (answers.length === 0) {
      toast({ title: 'Please enter at least one answer', status: 'warning' });
      return;
    }

    setIsScoring(true);
    try {
      await api.scoreQuestions(leagueId, activeSeason.id, { answers });
      toast({
        title: `${answers.length} question(s) scored`,
        status: 'success',
      });
      onScoringClose();
      await loadQuestionsForEpisode(selectedEpisode);
    } catch (err: any) {
      toast({
        title: 'Failed to score questions',
        description: err.message,
        status: 'error',
      });
    } finally {
      setIsScoring(false);
    }
  };

  const toggleTemplateSelection = (templateId: string) => {
    setSelectedTemplates((prev) =>
      prev.includes(templateId)
        ? prev.filter((id) => id !== templateId)
        : [...prev, templateId],
    );
  };

  if (isLoading) {
    return (
      <Box as="main" minH="100vh" bg="transparent" py={20}>
        <Container maxW="container.xl">
          <VStack gap={4}>
            <Spinner size="xl" />
            <Text>Loading...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box as="main" minH="100vh" bg="transparent" py={20}>
        <Container maxW="container.md">
          <Box bg="red.50" borderColor="red.200" borderWidth="1px" borderRadius="md" p={4}>
            <Text color="red.700">{error}</Text>
          </Box>
        </Container>
      </Box>
    );
  }

  const unscoredCount = questions.filter((q) => !q.isScored).length;
  const totalAnswers = questions.reduce((sum, q) => sum + (q.answers?.length || 0), 0);

  return (
    <Box as="main" minH="100vh" bg="transparent" py={10}>
      <Container maxW="container.xl">
        <VStack gap={6} align="stretch">
          <HStack justify="space-between" align="center">
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
            <HStack>
              <Button variant="outline" onClick={onTemplatesOpen}>
                Add from Templates
              </Button>
              {unscoredCount > 0 && (
                <Button colorScheme="green" onClick={handleOpenScoring}>
                  Score Questions ({unscoredCount})
                </Button>
              )}
            </HStack>
          </HStack>

          <HStack>
            <FormControl maxW="200px">
              <FormLabel>Episode</FormLabel>
              <Select
                value={selectedEpisode}
                onChange={(e) => {
                  const ep = parseInt(e.target.value, 10);
                  setSelectedEpisode(ep);
                  setForm((prev) => ({ ...prev, episodeNumber: ep }));
                }}
              >
                {Array.from({ length: 14 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    Episode {num}
                  </option>
                ))}
              </Select>
            </FormControl>
            <Box pt={8}>
              <Badge colorScheme="blue">{questions.length} questions</Badge>
              <Badge colorScheme="orange" ml={2}>{totalAnswers} answers submitted</Badge>
            </Box>
          </HStack>

          <Tabs>
            <TabList>
              <Tab>Questions</Tab>
              <Tab>Add New Question</Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0}>
                <Box borderWidth="1px" borderRadius="lg" overflowX="auto" bg="transparent">
                  <Table>
                    <Thead bg="transparent">
                      <Tr>
                        <Th>#</Th>
                        <Th>Question</Th>
                        <Th>Type</Th>
                        <Th>Points</Th>
                        <Th>Answers</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {questions.map((question, index) => (
                        <Tr key={question.id}>
                          <Td>{index + 1}</Td>
                          <Td maxW="300px">
                            <Text noOfLines={2}>{question.text}</Text>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={
                                question.type === 'MULTIPLE_CHOICE' ? 'blue' : 'purple'
                              }
                              size="sm"
                            >
                              {question.type === 'MULTIPLE_CHOICE' ? 'MC' : 'Fill'}
                            </Badge>
                          </Td>
                          <Td>{question.pointValue}</Td>
                          <Td>{question.answers?.length || 0}</Td>
                          <Td>
                            {question.isScored ? (
                              <Badge colorScheme="green">Scored</Badge>
                            ) : (
                              <Badge colorScheme="yellow">Pending</Badge>
                            )}
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditQuestion(question)}
                                isDisabled={question.isScored}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="red"
                                variant="outline"
                                onClick={() => handleDeleteQuestion(question)}
                                isDisabled={question.isScored}
                              >
                                Delete
                              </Button>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                      {questions.length === 0 && (
                        <Tr>
                          <Td colSpan={7} textAlign="center" py={6}>
                            No questions for this episode yet.
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </Box>
              </TabPanel>

              <TabPanel px={0}>
                <Box as="form" onSubmit={handleSubmitQuestion}>
                  <Stack spacing={4} p={5} borderWidth="1px" borderRadius="lg" bg="transparent">
                    <Heading size="sm">
                      {form.id ? 'Edit Question' : 'Create Question'}
                    </Heading>

                    <FormControl isRequired>
                      <FormLabel>Question Text</FormLabel>
                      <Textarea
                        value={form.text}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, text: e.target.value }))
                        }
                        placeholder="e.g., Who will be eliminated this week?"
                        rows={2}
                      />
                    </FormControl>

                    <HStack spacing={4} align="flex-start">
                      <FormControl isRequired flex={1}>
                        <FormLabel>Type</FormLabel>
                        <Select
                          value={form.type}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              type: e.target.value as QuestionType,
                            }))
                          }
                        >
                          {QUESTION_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type.replace(/_/g, ' ')}
                            </option>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl flex={1}>
                        <FormLabel>Point Value</FormLabel>
                        <Input
                          type="number"
                          min={1}
                          value={form.pointValue}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              pointValue: parseInt(e.target.value, 10) || 1,
                            }))
                          }
                        />
                      </FormControl>
                    </HStack>

                    {form.type === 'MULTIPLE_CHOICE' && (
                      <FormControl>
                        <FormLabel>Options</FormLabel>
                        <Wrap spacing={2} mb={2}>
                          {form.options.map((option) => (
                            <WrapItem key={option}>
                              <Tag size="lg" colorScheme="orange" borderRadius="full">
                                <TagLabel>{option}</TagLabel>
                                <TagCloseButton onClick={() => handleRemoveOption(option)} />
                              </Tag>
                            </WrapItem>
                          ))}
                        </Wrap>
                        <HStack>
                          <Input
                            value={form.newOption}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                newOption: e.target.value,
                              }))
                            }
                            placeholder="Add an option"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddOption();
                              }
                            }}
                          />
                          <Button onClick={handleAddOption} variant="outline">
                            Add
                          </Button>
                        </HStack>
                      </FormControl>
                    )}

                    <Stack direction="row" spacing={3}>
                      <Button type="submit" variant="primary" isLoading={isSubmitting}>
                        {form.id ? 'Update Question' : 'Create Question'}
                      </Button>
                      {form.id && (
                        <Button
                          variant="outline"
                          onClick={() =>
                            setForm({ ...initialQuestionForm, episodeNumber: selectedEpisode })
                          }
                        >
                          Cancel
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>

      {/* Templates Modal */}
      <Modal isOpen={isTemplatesOpen} onClose={onTemplatesClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Questions from Templates</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Select templates to add as questions for Episode {selectedEpisode}
            </Text>
            <Stack spacing={2} maxH="400px" overflowY="auto">
              {templates.map((template) => (
                <Box
                  key={template.id}
                  p={3}
                  borderWidth="1px"
                  borderRadius="md"
                  cursor="pointer"
                  bg={selectedTemplates.includes(template.id) ? 'orange.900' : 'transparent'}
                  borderColor={selectedTemplates.includes(template.id) ? 'orange.300' : 'gray.200'}
                  onClick={() => toggleTemplateSelection(template.id)}
                >
                  <HStack justify="space-between">
                    <Checkbox
                      isChecked={selectedTemplates.includes(template.id)}
                      onChange={() => toggleTemplateSelection(template.id)}
                    >
                      <Text fontWeight="medium">{template.text}</Text>
                    </Checkbox>
                    <HStack>
                      <Badge colorScheme={template.type === 'MULTIPLE_CHOICE' ? 'blue' : 'purple'}>
                        {template.type === 'MULTIPLE_CHOICE' ? 'MC' : 'Fill'}
                      </Badge>
                      <Badge>{template.pointValue} pt</Badge>
                    </HStack>
                  </HStack>
                  {template.category && (
                    <Text fontSize="sm" color="gray.500" ml={6}>
                      {template.category}
                    </Text>
                  )}
                </Box>
              ))}
              {templates.length === 0 && (
                <Text color="gray.500">No templates available. Create some in the admin panel.</Text>
              )}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onTemplatesClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddFromTemplates}
              isLoading={isSubmitting}
              isDisabled={selectedTemplates.length === 0}
            >
              Add {selectedTemplates.length} Question(s)
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Scoring Modal */}
      <Modal isOpen={isScoringOpen} onClose={onScoringClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Score Questions</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Enter the correct answers for each question. Points will be automatically calculated.
            </Text>
            <Stack spacing={4} maxH="400px" overflowY="auto">
              {questions
                .filter((q) => !q.isScored)
                .map((question) => (
                  <Box key={question.id} p={3} borderWidth="1px" borderRadius="md">
                    <Text fontWeight="medium" mb={2}>
                      {question.text}
                    </Text>
                    {question.type === 'MULTIPLE_CHOICE' && question.options ? (
                      <Select
                        value={scoringAnswers[question.id] || ''}
                        onChange={(e) =>
                          setScoringAnswers((prev) => ({
                            ...prev,
                            [question.id]: e.target.value,
                          }))
                        }
                        placeholder="Select correct answer"
                      >
                        {(question.options as string[]).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <Input
                        value={scoringAnswers[question.id] || ''}
                        onChange={(e) =>
                          setScoringAnswers((prev) => ({
                            ...prev,
                            [question.id]: e.target.value,
                          }))
                        }
                        placeholder="Enter correct answer"
                      />
                    )}
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      {question.answers?.length || 0} answer(s) submitted
                    </Text>
                  </Box>
                ))}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onScoringClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleSubmitScoring} isLoading={isScoring}>
              Score Questions
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

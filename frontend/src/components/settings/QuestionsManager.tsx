'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
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
  Radio,
  RadioGroup,
} from '@chakra-ui/react';
import { api } from '@/lib/api';
import type {
  LeagueQuestion,
  QuestionTemplate,
  CreateLeagueQuestionDto,
  QuestionType,
  TrendingQuestion,
} from '@/types/api';
import { TrendingQuestionsCarousel } from './TrendingQuestionsCarousel';

const QUESTION_TYPES: QuestionType[] = ['MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK'];

type ScoringType = 'fixed' | 'wager';

type QuestionFormState = {
  id: string;
  episodeNumber: number;
  text: string;
  type: QuestionType;
  options: string[];
  pointValue: number;
  newOption: string;
  scoringType: ScoringType;
  minWager: number;
  maxWager: number;
};

const initialQuestionForm: QuestionFormState = {
  id: '',
  episodeNumber: 1,
  text: '',
  type: 'MULTIPLE_CHOICE',
  options: [],
  pointValue: 1,
  newOption: '',
  scoringType: 'fixed',
  minWager: 0,
  maxWager: 100,
};

type ScoringState = {
  [questionId: string]: string;
};

interface QuestionsManagerProps {
  leagueId: string;
  seasonId: string;
  leagueName?: string;
  seasonName?: string;
  activeEpisode?: number;
}

export function QuestionsManager({
  leagueId,
  seasonId,
  leagueName,
  seasonName,
  activeEpisode = 1,
}: QuestionsManagerProps) {
  const toast = useToast();

  const [questions, setQuestions] = useState<LeagueQuestion[]>([]);
  const [templates, setTemplates] = useState<QuestionTemplate[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [form, setForm] = useState<QuestionFormState>({
    ...initialQuestionForm,
    episodeNumber: activeEpisode,
  });
  const [scoringAnswers, setScoringAnswers] = useState<ScoringState>({});
  const [selectedEpisode, setSelectedEpisode] = useState(activeEpisode);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScoring, setIsScoring] = useState(false);

  const {
    isOpen: isTemplatesOpen,
    onOpen: onTemplatesOpen,
    onClose: onTemplatesClose,
  } = useDisclosure();
  const {
    isOpen: isScoringOpen,
    onOpen: onScoringOpen,
    onClose: onScoringClose,
  } = useDisclosure();

  const loadQuestionsForEpisode = useCallback(
    async (episode: number) => {
      try {
        const questionsData = await api.getLeagueQuestions(
          leagueId,
          seasonId,
          episode
        );
        setQuestions(questionsData);
      } catch (err) {
        console.error('Failed to load questions', err);
        toast({
          title: 'Failed to load questions',
          description: err instanceof Error ? err.message : 'Unknown error',
          status: 'error',
        });
      }
    },
    [leagueId, seasonId, toast]
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
      // Load questions for this episode
      const questionsData = await api.getLeagueQuestions(
        leagueId,
        seasonId,
        activeEpisode
      );
      setQuestions(questionsData);

      // Load templates
      const templatesData = await api.getAvailableTemplates(leagueId, seasonId);
      setTemplates(templatesData);
    } catch (err) {
      console.error('Failed to load data', err);
      toast({
        title: 'Failed to load data',
        description: err instanceof Error ? err.message : 'Unknown error',
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [leagueId, seasonId, activeEpisode, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedEpisode) {
      loadQuestionsForEpisode(selectedEpisode);
    }
  }, [selectedEpisode, loadQuestionsForEpisode]);

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

    if (!form.text.trim()) {
      toast({ title: 'Question text is required', status: 'warning' });
      return;
    }

    if (form.type === 'MULTIPLE_CHOICE' && form.options.length < 2) {
      toast({
        title: 'Multiple choice needs at least 2 options',
        status: 'warning',
      });
      return;
    }

    const payload: CreateLeagueQuestionDto = {
      episodeNumber: form.episodeNumber,
      text: form.text.trim(),
      type: form.type,
      options: form.type === 'MULTIPLE_CHOICE' ? form.options : undefined,
      pointValue: form.scoringType === 'fixed' ? form.pointValue : form.maxWager,
      isWager: form.scoringType === 'wager',
      minWager: form.scoringType === 'wager' ? form.minWager : undefined,
      maxWager: form.scoringType === 'wager' ? form.maxWager : undefined,
    };

    setIsSubmitting(true);
    try {
      if (form.id) {
        await api.updateLeagueQuestion(leagueId, seasonId, form.id, payload);
        toast({ title: 'Question updated', status: 'success' });
      } else {
        await api.createLeagueQuestion(leagueId, seasonId, payload);
        toast({ title: 'Question created', status: 'success' });
      }
      setForm({ ...initialQuestionForm, episodeNumber: selectedEpisode });
      await loadQuestionsForEpisode(selectedEpisode);
    } catch (err) {
      toast({
        title: 'Failed to save question',
        description: err instanceof Error ? err.message : 'Unknown error',
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
      scoringType: question.isWager ? 'wager' : 'fixed',
      minWager: question.minWager || 0,
      maxWager: question.maxWager || 100,
    });
  };

  const handleDeleteQuestion = async (question: LeagueQuestion) => {
    if (!window.confirm('Delete this question?')) return;

    try {
      await api.deleteLeagueQuestion(leagueId, seasonId, question.id);
      toast({ title: 'Question deleted', status: 'success' });
      await loadQuestionsForEpisode(selectedEpisode);
    } catch (err) {
      toast({
        title: 'Failed to delete question',
        description: err instanceof Error ? err.message : 'Unknown error',
        status: 'error',
      });
    }
  };

  const handleAddFromTemplates = async () => {
    if (selectedTemplates.length === 0) return;

    setIsSubmitting(true);
    try {
      await api.createQuestionsFromTemplates(leagueId, seasonId, {
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
    } catch (err) {
      toast({
        title: 'Failed to add questions',
        description: err instanceof Error ? err.message : 'Unknown error',
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
    const answers = Object.entries(scoringAnswers)
      .filter(([, answer]) => answer.trim() !== '')
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
      await api.scoreQuestions(leagueId, seasonId, { answers });
      toast({
        title: `${answers.length} question(s) scored`,
        status: 'success',
      });
      onScoringClose();
      await loadQuestionsForEpisode(selectedEpisode);
    } catch (err) {
      toast({
        title: 'Failed to score questions',
        description: err instanceof Error ? err.message : 'Unknown error',
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
        : [...prev, templateId]
    );
  };

  const handleAddTrendingQuestion = useCallback(
    (question: TrendingQuestion) => {
      setForm({
        id: '',
        episodeNumber: selectedEpisode,
        text: question.text,
        type: question.type as QuestionType,
        options: (question.options as string[]) || [],
        pointValue: question.pointValue,
        newOption: '',
        scoringType: question.isWager ? 'wager' : 'fixed',
        minWager: question.minWager || 0,
        maxWager: question.maxWager || 100,
      });
    },
    [selectedEpisode],
  );

  if (isLoading) {
    return (
      <VStack gap={4} py={10}>
        <Spinner size="xl" />
        <Text>Loading questions...</Text>
      </VStack>
    );
  }

  const unscoredCount = questions.filter((q) => !q.isScored).length;
  const totalAnswers = questions.reduce(
    (sum, q) => sum + (q.answers?.length || 0),
    0
  );

  return (
    <VStack gap={6} align="stretch">
      <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} gap={3}>
        <Box>
          {leagueName && seasonName && (
            <Text fontSize="sm" color="text.secondary">
              {leagueName} - {seasonName}
            </Text>
          )}
        </Box>
        <HStack flexWrap="wrap">
          <Button variant="outline" onClick={onTemplatesOpen} size={{ base: 'sm', md: 'md' }}>
            Add from Templates
          </Button>
          {unscoredCount > 0 && (
            <Button colorScheme="green" onClick={handleOpenScoring} size={{ base: 'sm', md: 'md' }}>
              Score Questions ({unscoredCount})
            </Button>
          )}
        </HStack>
      </Stack>

      <Stack direction={{ base: 'column', sm: 'row' }} align={{ base: 'stretch', sm: 'flex-end' }} gap={3}>
        <FormControl maxW={{ base: 'full', sm: '200px' }}>
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
        <HStack flexWrap="wrap" gap={2} pb={{ base: 0, sm: 1 }}>
          <Badge colorScheme="blue">{questions.length} questions</Badge>
          <Badge colorScheme="orange">
            {totalAnswers} answers submitted
          </Badge>
        </HStack>
      </Stack>

      {/* Trending Questions Carousel */}
      <TrendingQuestionsCarousel
        leagueId={leagueId}
        seasonId={seasonId}
        episodeNumber={selectedEpisode}
        onAddQuestion={handleAddTrendingQuestion}
      />

      {/* Question Form */}
      <Box as="form" onSubmit={handleSubmitQuestion}>
        <Stack
          spacing={4}
          p={5}
          borderWidth="1px"
          borderRadius="lg"
          bg="transparent"
        >
          <Text fontWeight="semibold">
            {form.id ? 'Edit Question' : 'Create Question'}
          </Text>

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
              <FormLabel>Scoring Type</FormLabel>
              <RadioGroup
                value={form.scoringType}
                onChange={(val: ScoringType) =>
                  setForm((prev) => ({ ...prev, scoringType: val }))
                }
              >
                <HStack spacing={6}>
                  <Radio value="fixed">Fixed Points</Radio>
                  <Radio value="wager">Wager</Radio>
                </HStack>
              </RadioGroup>
            </FormControl>
          </HStack>

          {form.scoringType === 'fixed' ? (
            <FormControl>
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
              <FormHelperText>Correct = +points, Incorrect = 0</FormHelperText>
            </FormControl>
          ) : (
            <FormControl>
              <HStack spacing={4}>
                <Box flex={1}>
                  <FormLabel>Min Wager</FormLabel>
                  <Input
                    type="number"
                    min={0}
                    value={form.minWager}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        minWager: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                  />
                </Box>
                <Box flex={1}>
                  <FormLabel>Max Wager</FormLabel>
                  <Input
                    type="number"
                    min={1}
                    value={form.maxWager}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        maxWager: parseInt(e.target.value, 10) || 100,
                      }))
                    }
                  />
                </Box>
              </HStack>
              <FormHelperText>
                Players bet points. Correct = +wager, Incorrect = -wager
              </FormHelperText>
            </FormControl>
          )}

          {form.type === 'MULTIPLE_CHOICE' && (
            <FormControl>
              <FormLabel>Options</FormLabel>
              <Wrap spacing={2} mb={2}>
                {form.options.map((option) => (
                  <WrapItem key={option}>
                    <Tag size="lg" colorScheme="orange" borderRadius="full">
                      <TagLabel>{option}</TagLabel>
                      <TagCloseButton
                        onClick={() => handleRemoveOption(option)}
                      />
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
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              {form.id ? 'Update Question' : 'Create Question'}
            </Button>
            {form.id && (
              <Button
                variant="outline"
                onClick={() =>
                  setForm({
                    ...initialQuestionForm,
                    episodeNumber: selectedEpisode,
                  })
                }
              >
                Cancel
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Questions Table */}
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflowX="auto"
        bg="transparent"
      >
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
                      question.type === 'MULTIPLE_CHOICE'
                        ? 'blue'
                        : 'purple'
                    }
                    size="sm"
                  >
                    {question.type === 'MULTIPLE_CHOICE' ? 'MC' : 'Fill'}
                  </Badge>
                </Td>
                <Td>
                  {question.isWager ? (
                    <Text>Wager {question.minWager}-{question.maxWager}</Text>
                  ) : (
                    <Text>{question.pointValue} pts</Text>
                  )}
                </Td>
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
                  bg={
                    selectedTemplates.includes(template.id)
                      ? 'orange.900'
                      : 'transparent'
                  }
                  borderColor={
                    selectedTemplates.includes(template.id)
                      ? 'orange.300'
                      : 'gray.200'
                  }
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
                      <Badge
                        colorScheme={
                          template.type === 'MULTIPLE_CHOICE' ? 'blue' : 'purple'
                        }
                      >
                        {template.type === 'MULTIPLE_CHOICE' ? 'MC' : 'Fill'}
                      </Badge>
                      <Badge>{template.pointValue} pt</Badge>
                    </HStack>
                  </HStack>
                  {template.category && (
                    <Text fontSize="sm" color="text.secondary" ml={6}>
                      {template.category}
                    </Text>
                  )}
                </Box>
              ))}
              {templates.length === 0 && (
                <Text color="text.secondary">
                  No templates available. Create some in the admin panel.
                </Text>
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
              Enter the correct answers for each question. Points will be
              automatically calculated.
            </Text>
            <Stack spacing={4} maxH="400px" overflowY="auto">
              {questions
                .filter((q) => !q.isScored)
                .map((question) => (
                  <Box
                    key={question.id}
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                  >
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
                    <Text fontSize="sm" color="text.secondary" mt={1}>
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
            <Button
              colorScheme="green"
              onClick={handleSubmitScoring}
              isLoading={isScoring}
            >
              Score Questions
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}

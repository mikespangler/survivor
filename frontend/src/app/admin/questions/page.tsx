'use client';

import { useCallback, useEffect, useState } from 'react';
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
} from '@chakra-ui/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@/lib/api';
import type {
  LeagueQuestion,
  Season,
  QuestionType,
  CreateLeagueQuestionDto,
} from '@/types/api';

const QUESTION_TYPES: QuestionType[] = ['MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK'];

type FormState = {
  id: string;
  text: string;
  type: QuestionType;
  options: string[];
  pointValue: number;
  newOption: string;
  episodeNumber: number;
};

const initialForm: FormState = {
  id: '',
  text: '',
  type: 'MULTIPLE_CHOICE',
  options: [],
  pointValue: 1,
  newOption: '',
  episodeNumber: 1,
};

export default function AdminQuestionsPage() {
  const { isSignedIn } = useUser();
  const toast = useToast();

  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState('');
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [questions, setQuestions] = useState<LeagueQuestion[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadQuestions = useCallback(async () => {
    if (!selectedSeasonId) return;
    setIsLoading(true);
    try {
      const data = await api.getSystemQuestions(
        selectedSeasonId,
        selectedEpisode,
      );
      setQuestions(data);
    } catch (error) {
      console.error('Failed to load questions', error);
      toast({
        title: 'Failed to load questions',
        description:
          error instanceof Error ? error.message : 'Unexpected error',
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedSeasonId, selectedEpisode, toast]);

  useEffect(() => {
    let isActive = true;

    const initialize = async () => {
      if (!isSignedIn) {
        setIsAdmin(false);
        setIsCheckingAdmin(false);
        return;
      }

      try {
        const currentUser = await api.getCurrentUser();
        if (!isActive) return;

        const userIsAdmin = currentUser.systemRole === 'admin';
        setIsAdmin(userIsAdmin);

        if (userIsAdmin) {
          const allSeasons = await api.getSeasons();
          if (!isActive) return;
          setSeasons(allSeasons);

          // Default to the active season
          const activeSeason = allSeasons.find(
            (s) => s.status === 'ACTIVE',
          );
          if (activeSeason) {
            setSelectedSeasonId(activeSeason.id);
            setSelectedEpisode(activeSeason.activeEpisode || 1);
          } else if (allSeasons.length > 0) {
            setSelectedSeasonId(allSeasons[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to verify admin access', error);
        toast({
          title: 'Unable to verify admin access',
          description:
            error instanceof Error ? error.message : 'Unexpected error',
          status: 'error',
        });
        setIsAdmin(false);
      } finally {
        if (isActive) {
          setIsCheckingAdmin(false);
        }
      }
    };

    void initialize();

    return () => {
      isActive = false;
    };
  }, [isSignedIn, toast]);

  useEffect(() => {
    if (isAdmin && selectedSeasonId) {
      void loadQuestions();
    }
  }, [isAdmin, selectedSeasonId, loadQuestions]);

  const handleAddOption = () => {
    if (!form.newOption.trim()) return;
    if (form.options.includes(form.newOption.trim())) {
      toast({
        title: 'Option already exists',
        status: 'warning',
      });
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.text.trim()) {
      toast({
        title: 'Question text is required',
        status: 'warning',
      });
      return;
    }

    if (form.type === 'MULTIPLE_CHOICE' && form.options.length < 2) {
      toast({
        title: 'Multiple choice questions need at least 2 options',
        status: 'warning',
      });
      return;
    }

    if (!selectedSeasonId) {
      toast({ title: 'Please select a season', status: 'warning' });
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
        await api.updateSystemQuestion(form.id, payload);
        toast({ title: 'Question updated', status: 'success' });
      } else {
        await api.createSystemQuestion(selectedSeasonId, payload);
        toast({ title: 'Question created', status: 'success' });
      }
      setForm({ ...initialForm, episodeNumber: selectedEpisode });
      await loadQuestions();
    } catch (error) {
      console.error('Failed to save question', error);
      toast({
        title: 'Failed to save question',
        description:
          error instanceof Error ? error.message : 'Unexpected error',
        status: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (question: LeagueQuestion) => {
    setForm({
      id: question.id,
      text: question.text,
      type: question.type as QuestionType,
      options: (question.options as string[]) || [],
      pointValue: question.pointValue,
      newOption: '',
      episodeNumber: question.episodeNumber,
    });
  };

  const handleDelete = async (question: LeagueQuestion) => {
    if (
      !window.confirm(
        'Delete this suggested question? This cannot be undone.',
      )
    ) {
      return;
    }

    try {
      await api.deleteSystemQuestion(question.id);
      toast({ title: 'Question deleted', status: 'success' });
      await loadQuestions();
    } catch (error) {
      console.error('Failed to delete question', error);
      toast({
        title: 'Failed to delete question',
        description:
          error instanceof Error ? error.message : 'Unexpected error',
        status: 'error',
      });
    }
  };

  if (isCheckingAdmin) {
    return (
      <Box py={16} display="flex" justifyContent="center">
        <Spinner size="lg" />
      </Box>
    );
  }

  if (!isSignedIn || !isAdmin) {
    return (
      <Container maxW="container.md" py={16}>
        <Heading size="lg" mb={4}>
          Access Restricted
        </Heading>
        <Text color="text.secondary">
          You must be signed in as a system administrator to view this page.
        </Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={{ base: 5, md: 10 }} px={{ base: 4, md: 6, lg: 8 }}>
      <Heading mb={8} size={{ base: 'lg', md: 'xl' }}>Suggested Questions</Heading>

      <Text color="text.secondary" mb={6}>
        Questions created here will appear in the Trending Questions carousel
        for all leagues in the selected season and episode.
      </Text>

      <Stack spacing={8}>
        {/* Season and Episode Selectors */}
        <HStack spacing={4} flexWrap="wrap">
          <FormControl maxW="250px">
            <FormLabel>Season</FormLabel>
            <Select
              value={selectedSeasonId}
              onChange={(e) => {
                setSelectedSeasonId(e.target.value);
                setSelectedEpisode(1);
              }}
            >
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.name}
                  {season.status === 'ACTIVE' ? ' (Active)' : ''}
                </option>
              ))}
            </Select>
          </FormControl>

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
          </Box>
        </HStack>

        {/* Question Form */}
        <Box as="form" onSubmit={handleSubmit}>
          <Stack
            spacing={4}
            p={5}
            borderWidth="1px"
            borderRadius="lg"
            bg="bg.secondary"
          >
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

            <HStack spacing={4} align="flex-start" flexWrap="wrap">
              <FormControl isRequired flex={1} minW="200px">
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

              <FormControl flex={1} minW="150px">
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

              <FormControl flex={1} minW="150px">
                <FormLabel>Episode</FormLabel>
                <Input
                  type="number"
                  min={1}
                  max={14}
                  value={form.episodeNumber}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      episodeNumber: parseInt(e.target.value, 10) || 1,
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
                <Button variant="outline" onClick={() => setForm({ ...initialForm, episodeNumber: selectedEpisode })}>
                  Cancel
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>

        {/* Questions Table */}
        <Box>
          <Heading size="md" mb={4}>
            Episode {selectedEpisode} Questions
          </Heading>

          <Box borderWidth="1px" borderRadius="lg" overflowX="auto" bg="bg.secondary">
            {isLoading ? (
              <Box py={6} textAlign="center">
                <Spinner />
              </Box>
            ) : (
              <Table>
                <Thead>
                  <Tr>
                    <Th>Question</Th>
                    <Th>Type</Th>
                    <Th>Points</Th>
                    <Th>Episode</Th>
                    <Th>Options</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {questions.map((question) => (
                    <Tr key={question.id}>
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
                        >
                          {question.type.replace(/_/g, ' ')}
                        </Badge>
                      </Td>
                      <Td>{question.pointValue}</Td>
                      <Td>{question.episodeNumber}</Td>
                      <Td>
                        {question.options
                          ? (question.options as string[]).length
                          : '-'}
                      </Td>
                      <Td>
                        <Stack direction="row" spacing={2}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(question)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            onClick={() => handleDelete(question)}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </Td>
                    </Tr>
                  ))}
                  {questions.length === 0 && (
                    <Tr>
                      <Td colSpan={6} textAlign="center" py={6}>
                        No suggested questions for this episode yet. Create one above.
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            )}
          </Box>
        </Box>
      </Stack>
    </Container>
  );
}

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
  IconButton,
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
  QuestionTemplate,
  CreateQuestionTemplateDto,
  QuestionType,
} from '@/types/api';

const QUESTION_TYPES: QuestionType[] = ['MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK'];

const CATEGORIES = [
  'Elimination',
  'Challenge',
  'Social',
  'Strategy',
  'Tribal Council',
  'General',
];

type FormState = {
  id: string;
  text: string;
  type: QuestionType;
  options: string[];
  pointValue: number;
  category: string;
  newOption: string;
};

const initialForm: FormState = {
  id: '',
  text: '',
  type: 'MULTIPLE_CHOICE',
  options: [],
  pointValue: 1,
  category: '',
  newOption: '',
};

export default function AdminQuestionsPage() {
  const { isSignedIn } = useUser();
  const toast = useToast();

  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [templates, setTemplates] = useState<QuestionTemplate[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getQuestionTemplates(
        filterCategory || undefined,
      );
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates', error);
      toast({
        title: 'Failed to load templates',
        description:
          error instanceof Error ? error.message : 'Unexpected error',
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [filterCategory, toast]);

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
          await loadTemplates();
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
  }, [isSignedIn, loadTemplates, toast]);

  useEffect(() => {
    if (isAdmin) {
      void loadTemplates();
    }
  }, [isAdmin, filterCategory, loadTemplates]);

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

    const payload: CreateQuestionTemplateDto = {
      text: form.text.trim(),
      type: form.type,
      options: form.type === 'MULTIPLE_CHOICE' ? form.options : undefined,
      pointValue: form.pointValue,
      category: form.category || undefined,
    };

    setIsSubmitting(true);
    try {
      if (form.id) {
        await api.updateQuestionTemplate(form.id, payload);
        toast({ title: 'Template updated', status: 'success' });
      } else {
        await api.createQuestionTemplate(payload);
        toast({ title: 'Template created', status: 'success' });
      }
      setForm(initialForm);
      await loadTemplates();
    } catch (error) {
      console.error('Failed to save template', error);
      toast({
        title: 'Failed to save template',
        description:
          error instanceof Error ? error.message : 'Unexpected error',
        status: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (template: QuestionTemplate) => {
    setForm({
      id: template.id,
      text: template.text,
      type: template.type,
      options: (template.options as string[]) || [],
      pointValue: template.pointValue,
      category: template.category || '',
      newOption: '',
    });
  };

  const handleDelete = async (template: QuestionTemplate) => {
    if (
      !window.confirm(
        `Delete question template? This cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await api.deleteQuestionTemplate(template.id);
      toast({ title: 'Template deleted', status: 'success' });
      await loadTemplates();
    } catch (error) {
      console.error('Failed to delete template', error);
      toast({
        title: 'Failed to delete template',
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
        <Text color="gray.600">
          You must be signed in as a system administrator to view this page.
        </Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <Heading mb={8}>Question Templates</Heading>

      <Stack spacing={8}>
        <Box as="form" onSubmit={handleSubmit}>
          <Stack
            spacing={4}
            p={5}
            borderWidth="1px"
            borderRadius="lg"
            bg="bg.secondary"
          >
            <Heading size="sm">
              {form.id ? 'Edit Template' : 'Create Template'}
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
                <FormLabel>Category</FormLabel>
                <Select
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                  placeholder="Select category"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
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
                {form.id ? 'Update Template' : 'Create Template'}
              </Button>
              {form.id && (
                <Button variant="outline" onClick={() => setForm(initialForm)}>
                  Cancel
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>

        <Box>
          <HStack mb={4} justify="space-between">
            <Heading size="md">All Templates</Heading>
            <FormControl maxW="200px">
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                placeholder="All Categories"
                size="sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </FormControl>
          </HStack>

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
                    <Th>Category</Th>
                    <Th>Points</Th>
                    <Th>Options</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {templates.map((template) => (
                    <Tr key={template.id}>
                      <Td maxW="300px">
                        <Text noOfLines={2}>{template.text}</Text>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            template.type === 'MULTIPLE_CHOICE'
                              ? 'blue'
                              : 'purple'
                          }
                        >
                          {template.type.replace(/_/g, ' ')}
                        </Badge>
                      </Td>
                      <Td>{template.category || '-'}</Td>
                      <Td>{template.pointValue}</Td>
                      <Td>
                        {template.options
                          ? (template.options as string[]).length
                          : '-'}
                      </Td>
                      <Td>
                        <Stack direction="row" spacing={2}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(template)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            onClick={() => handleDelete(template)}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </Td>
                    </Tr>
                  ))}
                  {templates.length === 0 && (
                    <Tr>
                      <Td colSpan={6} textAlign="center" py={6}>
                        No question templates yet. Create one above.
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

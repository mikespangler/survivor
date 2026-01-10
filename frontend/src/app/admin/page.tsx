'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
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
} from '@chakra-ui/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@/lib/api';
import type {
  Castaway,
  Season,
  CreateSeasonDto,
  UpdateSeasonDto,
  CreateCastawayDto,
  UpdateCastawayDto,
} from '@/types/api';

const SEASON_STATUSES: CreateSeasonDto['status'][] = [
  'UPCOMING',
  'ACTIVE',
  'COMPLETED',
];

const CASTAWAY_STATUSES: CreateCastawayDto['status'][] = [
  'ACTIVE',
  'ELIMINATED',
  'JURY',
];

type SeasonFormState = {
  id: string;
  number: string;
  name: string;
  status: CreateSeasonDto['status'];
  startDate: string;
};

type CastawayFormState = {
  id: string;
  name: string;
  status: CreateCastawayDto['status'];
};

const initialSeasonForm: SeasonFormState = {
  id: '',
  number: '',
  name: '',
  status: 'UPCOMING',
  startDate: '',
};

const initialCastawayForm: CastawayFormState = {
  id: '',
  name: '',
  status: 'ACTIVE',
};

export default function AdminPage() {
  const { isSignedIn } = useUser();
  const toast = useToast();

  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [seasons, setSeasons] = useState<Season[]>([]);
  const [castaways, setCastaways] = useState<Castaway[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState('');

  const [seasonForm, setSeasonForm] = useState<SeasonFormState>(
    initialSeasonForm,
  );
  const [castawayForm, setCastawayForm] =
    useState<CastawayFormState>(initialCastawayForm);

  const [isLoadingSeasons, setIsLoadingSeasons] = useState(false);
  const [isLoadingCastaways, setIsLoadingCastaways] = useState(false);
  const [isSubmittingSeason, setIsSubmittingSeason] = useState(false);
  const [isSubmittingCastaway, setIsSubmittingCastaway] = useState(false);

  const loadSeasons = useCallback(async () => {
    setIsLoadingSeasons(true);
    try {
      const data = await api.getSeasons();
      setSeasons(data);
      setSelectedSeasonId((current) => {
        if (current && data.some((season) => season.id === current)) {
          return current;
        }
        return data[0]?.id ?? '';
      });
      return data;
    } catch (error) {
      console.error('Failed to load seasons', error);
      toast({
        title: 'Failed to load seasons',
        description:
          error instanceof Error ? error.message : 'Unexpected error occurred',
        status: 'error',
      });
      return [];
    } finally {
      setIsLoadingSeasons(false);
    }
  }, [toast]);

  const loadCastaways = useCallback(
    async (seasonId: string) => {
      if (!seasonId) {
        setCastaways([]);
        return;
      }
      setIsLoadingCastaways(true);
      try {
        const data = await api.getCastaways(seasonId);
        setCastaways(data);
      } catch (error) {
        console.error('Failed to load castaways', error);
        toast({
          title: 'Failed to load castaways',
          description:
            error instanceof Error
              ? error.message
              : 'Unexpected error occurred',
          status: 'error',
        });
      } finally {
        setIsLoadingCastaways(false);
      }
    },
    [toast],
  );

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
          await loadSeasons();
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
  }, [isSignedIn, loadSeasons, toast]);

  useEffect(() => {
    if (isAdmin && selectedSeasonId) {
      void loadCastaways(selectedSeasonId);
    } else if (!selectedSeasonId) {
      setCastaways([]);
    }
  }, [isAdmin, selectedSeasonId, loadCastaways]);

  const handleSeasonSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!seasonForm.number || !seasonForm.name) {
      toast({
        title: 'Season number and name are required',
        status: 'warning',
      });
      return;
    }

    const payload: CreateSeasonDto | UpdateSeasonDto = {
      number: Number(seasonForm.number),
      name: seasonForm.name,
      status: seasonForm.status,
      startDate: seasonForm.startDate || undefined,
    };

    setIsSubmittingSeason(true);
    try {
      if (seasonForm.id) {
        await api.updateSeason(seasonForm.id, payload);
        toast({ title: 'Season updated', status: 'success' });
      } else {
        await api.createSeason(payload as CreateSeasonDto);
        toast({ title: 'Season created', status: 'success' });
      }
      setSeasonForm(initialSeasonForm);
      const refreshedSeasons = await loadSeasons();
      if (!selectedSeasonId && refreshedSeasons[0]) {
        setSelectedSeasonId(refreshedSeasons[0].id);
      }
    } catch (error) {
      console.error('Failed to save season', error);
      toast({
        title: 'Failed to save season',
        description:
          error instanceof Error ? error.message : 'Unexpected error',
        status: 'error',
      });
    } finally {
      setIsSubmittingSeason(false);
    }
  };

  const handleSeasonEdit = (season: Season) => {
    setSeasonForm({
      id: season.id,
      number: season.number.toString(),
      name: season.name,
      status: season.status,
      startDate: season.startDate
        ? new Date(season.startDate).toISOString().slice(0, 10)
        : '',
    });
  };

  const handleSeasonDelete = async (season: Season) => {
    if (
      !window.confirm(
        `Delete season "${season.name}" (#${season.number})? This cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await api.deleteSeason(season.id);
      toast({ title: 'Season deleted', status: 'success' });
      const refreshedSeasons = await loadSeasons();
      if (!refreshedSeasons.some((item) => item.id === selectedSeasonId)) {
        setSelectedSeasonId(refreshedSeasons[0]?.id ?? '');
      }
    } catch (error) {
      console.error('Failed to delete season', error);
      toast({
        title: 'Failed to delete season',
        description:
          error instanceof Error ? error.message : 'Unexpected error',
        status: 'error',
      });
    }
  };

  const handleCastawaySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedSeasonId) {
      toast({
        title: 'Select a season before managing castaways',
        status: 'warning',
      });
      return;
    }
    if (!castawayForm.name) {
      toast({
        title: 'Castaway name is required',
        status: 'warning',
      });
      return;
    }

    const payload: CreateCastawayDto | UpdateCastawayDto = {
      name: castawayForm.name,
      status: castawayForm.status,
    };

    setIsSubmittingCastaway(true);
    try {
      if (castawayForm.id) {
        await api.updateCastaway(castawayForm.id, payload);
        toast({ title: 'Castaway updated', status: 'success' });
      } else {
        await api.createCastaway({
          ...(payload as CreateCastawayDto),
          seasonId: selectedSeasonId,
        });
        toast({ title: 'Castaway created', status: 'success' });
      }

      setCastawayForm(initialCastawayForm);
      await loadCastaways(selectedSeasonId);
    } catch (error) {
      console.error('Failed to save castaway', error);
      toast({
        title: 'Failed to save castaway',
        description:
          error instanceof Error ? error.message : 'Unexpected error',
        status: 'error',
      });
    } finally {
      setIsSubmittingCastaway(false);
    }
  };

  const handleCastawayEdit = (castaway: Castaway) => {
    setCastawayForm({
      id: castaway.id,
      name: castaway.name,
      status: castaway.status,
    });
  };

  const handleCastawayDelete = async (castaway: Castaway) => {
    if (
      !window.confirm(`Delete castaway "${castaway.name}"? This cannot be undone.`)
    ) {
      return;
    }

    try {
      await api.deleteCastaway(castaway.id);
      toast({ title: 'Castaway deleted', status: 'success' });
      await loadCastaways(selectedSeasonId);
    } catch (error) {
      console.error('Failed to delete castaway', error);
      toast({
        title: 'Failed to delete castaway',
        description:
          error instanceof Error ? error.message : 'Unexpected error',
        status: 'error',
      });
    }
  };

  const seasonLabel = useMemo(
    () =>
      seasons.find((season) => season.id === selectedSeasonId)?.name ||
      'Select a season',
    [seasons, selectedSeasonId],
  );

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
      <Heading mb={8}>Admin Dashboard</Heading>

      <Stack spacing={12}>
        <Box>
          <Heading size="md" mb={4}>
            Seasons
          </Heading>

          <Box as="form" onSubmit={handleSeasonSubmit}>
            <Stack
              spacing={4}
              p={5}
              borderWidth="1px"
              borderRadius="lg"
              mb={6}
              bg="white"
            >
              <Heading size="sm">
                {seasonForm.id ? 'Edit Season' : 'Create Season'}
              </Heading>
              <FormControl isRequired>
                <FormLabel>Season Number</FormLabel>
                <Input
                  type="number"
                  value={seasonForm.number}
                  onChange={(event) =>
                    setSeasonForm((prev) => ({
                      ...prev,
                      number: event.target.value,
                    }))
                  }
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Season Name</FormLabel>
                <Input
                  value={seasonForm.name}
                  onChange={(event) =>
                    setSeasonForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Status</FormLabel>
                <Select
                  value={seasonForm.status}
                  onChange={(event) =>
                    setSeasonForm((prev) => ({
                      ...prev,
                      status: event.target.value as CreateSeasonDto['status'],
                    }))
                  }
                >
                  {SEASON_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Start Date</FormLabel>
                <Input
                  type="date"
                  value={seasonForm.startDate}
                  onChange={(event) =>
                    setSeasonForm((prev) => ({
                      ...prev,
                      startDate: event.target.value,
                    }))
                  }
                />
              </FormControl>
              <Stack direction="row" spacing={3}>
                <Button
                  type="submit"
                  colorScheme="orange"
                  isLoading={isSubmittingSeason}
                >
                  {seasonForm.id ? 'Update Season' : 'Create Season'}
                </Button>
                {seasonForm.id && (
                  <Button
                    variant="ghost"
                    onClick={() => setSeasonForm(initialSeasonForm)}
                  >
                    Cancel
                  </Button>
                )}
              </Stack>
            </Stack>
          </Box>

          <Box borderWidth="1px" borderRadius="lg" overflowX="auto" bg="white">
            {isLoadingSeasons ? (
              <Box py={6} textAlign="center">
                <Spinner />
              </Box>
            ) : (
              <Table>
                <Thead bg="gray.50">
                  <Tr>
                    <Th>#</Th>
                    <Th>Name</Th>
                    <Th>Status</Th>
                    <Th>Start Date</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {seasons.map((season) => (
                    <Tr key={season.id}>
                      <Td>{season.number}</Td>
                      <Td>{season.name}</Td>
                      <Td>{season.status}</Td>
                      <Td>
                        {season.startDate
                          ? new Date(season.startDate).toLocaleDateString()
                          : '—'}
                      </Td>
                      <Td>
                        <Stack direction="row" spacing={2}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSeasonEdit(season)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleSeasonDelete(season)}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </Td>
                    </Tr>
                  ))}
                  {seasons.length === 0 && (
                    <Tr>
                      <Td colSpan={5} textAlign="center" py={6}>
                        No seasons created yet.
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            )}
          </Box>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={4}>
            Castaways
          </Heading>

          <Stack spacing={4} mb={4}>
            <FormControl>
              <FormLabel>Filter by Season</FormLabel>
              <Select
                value={selectedSeasonId}
                onChange={(event) => {
                  setSelectedSeasonId(event.target.value);
                  setCastawayForm(initialCastawayForm);
                }}
              >
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.number} – {season.name}
                  </option>
                ))}
                {seasons.length === 0 && (
                  <option value="">No seasons available</option>
                )}
              </Select>
              <Text mt={2} fontSize="sm" color="gray.500">
                Currently viewing: {seasonLabel}
              </Text>
            </FormControl>
          </Stack>

          <Box
            as="form"
            onSubmit={handleCastawaySubmit}
            opacity={selectedSeasonId ? 1 : 0.6}
          >
            <Stack
              spacing={4}
              p={5}
              borderWidth="1px"
              borderRadius="lg"
              mb={6}
              bg="white"
            >
              <Heading size="sm">
                {castawayForm.id ? 'Edit Castaway' : 'Create Castaway'}
              </Heading>
              <FormControl isRequired>
                <FormLabel>Castaway Name</FormLabel>
                <Input
                  value={castawayForm.name}
                  onChange={(event) =>
                    setCastawayForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  isDisabled={!selectedSeasonId}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Status</FormLabel>
                <Select
                  value={castawayForm.status}
                  onChange={(event) =>
                    setCastawayForm((prev) => ({
                      ...prev,
                      status: event.target.value as Castaway['status'],
                    }))
                  }
                  isDisabled={!selectedSeasonId}
                >
                  {CASTAWAY_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <Stack direction="row" spacing={3}>
                <Button
                  type="submit"
                  colorScheme="orange"
                  isDisabled={!selectedSeasonId}
                  isLoading={isSubmittingCastaway}
                >
                  {castawayForm.id ? 'Update Castaway' : 'Create Castaway'}
                </Button>
                {castawayForm.id && (
                  <Button
                    variant="ghost"
                    onClick={() => setCastawayForm(initialCastawayForm)}
                  >
                    Cancel
                  </Button>
                )}
              </Stack>
            </Stack>
          </Box>

          <Box borderWidth="1px" borderRadius="lg" overflowX="auto" bg="white">
            {isLoadingCastaways ? (
              <Box py={6} textAlign="center">
                <Spinner />
              </Box>
            ) : (
              <Table>
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Name</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {castaways.map((castaway) => (
                    <Tr key={castaway.id}>
                      <Td>{castaway.name}</Td>
                      <Td>{castaway.status}</Td>
                      <Td>
                        <Stack direction="row" spacing={2}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCastawayEdit(castaway)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleCastawayDelete(castaway)}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </Td>
                    </Tr>
                  ))}
                  {castaways.length === 0 && (
                    <Tr>
                      <Td colSpan={3} textAlign="center" py={6}>
                        {selectedSeasonId
                          ? 'No castaways for this season yet.'
                          : 'Select a season to view castaways.'}
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


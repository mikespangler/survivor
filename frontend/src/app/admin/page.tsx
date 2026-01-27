'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
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
import { AuthenticatedLayout } from '@/components/navigation';
import { ImageUpload } from '@/components/common/ImageUpload';
import type {
  Castaway,
  Season,
  Episode,
  CreateSeasonDto,
  UpdateSeasonDto,
  CreateCastawayDto,
  UpdateCastawayDto,
  CreateEpisodeDto,
  UpdateEpisodeDto,
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

type EpisodeFormState = {
  id: string;
  number: string;
  airDate: string;
  title: string;
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

const initialEpisodeForm: EpisodeFormState = {
  id: '',
  number: '',
  airDate: '',
  title: '',
};

export default function AdminPage() {
  const { isSignedIn } = useUser();
  const toast = useToast();

  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [seasons, setSeasons] = useState<Season[]>([]);
  const [castaways, setCastaways] = useState<Castaway[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState('');

  const [seasonForm, setSeasonForm] = useState<SeasonFormState>(
    initialSeasonForm,
  );
  const [castawayForm, setCastawayForm] =
    useState<CastawayFormState>(initialCastawayForm);
  const [episodeForm, setEpisodeForm] =
    useState<EpisodeFormState>(initialEpisodeForm);

  const [isLoadingSeasons, setIsLoadingSeasons] = useState(false);
  const [isLoadingCastaways, setIsLoadingCastaways] = useState(false);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [isSubmittingSeason, setIsSubmittingSeason] = useState(false);
  const [isSubmittingCastaway, setIsSubmittingCastaway] = useState(false);
  const [isSubmittingEpisode, setIsSubmittingEpisode] = useState(false);
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);

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

  const loadEpisodes = useCallback(
    async (seasonId: string) => {
      if (!seasonId) {
        setEpisodes([]);
        return;
      }
      setIsLoadingEpisodes(true);
      try {
        const data = await api.getEpisodes(seasonId);
        setEpisodes(data);
      } catch (error) {
        console.error('Failed to load episodes', error);
        toast({
          title: 'Failed to load episodes',
          description:
            error instanceof Error
              ? error.message
              : 'Unexpected error occurred',
          status: 'error',
        });
      } finally {
        setIsLoadingEpisodes(false);
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
      void loadEpisodes(selectedSeasonId);
    } else if (!selectedSeasonId) {
      setCastaways([]);
      setEpisodes([]);
    }
  }, [isAdmin, selectedSeasonId, loadCastaways, loadEpisodes]);

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

  const handleEpisodeSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedSeasonId) {
      toast({
        title: 'Select a season before managing episodes',
        status: 'warning',
      });
      return;
    }
    if (!episodeForm.number) {
      toast({
        title: 'Episode number is required',
        status: 'warning',
      });
      return;
    }

    const payload: CreateEpisodeDto | UpdateEpisodeDto = {
      number: Number(episodeForm.number),
      airDate: episodeForm.airDate || undefined,
      title: episodeForm.title || undefined,
    };

    setIsSubmittingEpisode(true);
    try {
      if (episodeForm.id) {
        await api.updateEpisode(episodeForm.id, payload);
        toast({ title: 'Episode updated', status: 'success' });
      } else {
        await api.createEpisode({
          ...(payload as CreateEpisodeDto),
          seasonId: selectedSeasonId,
        });
        toast({ title: 'Episode created', status: 'success' });
      }

      setEpisodeForm(initialEpisodeForm);
      await loadEpisodes(selectedSeasonId);
    } catch (error) {
      console.error('Failed to save episode', error);
      toast({
        title: 'Failed to save episode',
        description:
          error instanceof Error ? error.message : 'Unexpected error',
        status: 'error',
      });
    } finally {
      setIsSubmittingEpisode(false);
    }
  };

  const handleEpisodeEdit = (episode: Episode) => {
    setEpisodeForm({
      id: episode.id,
      number: episode.number.toString(),
      airDate: episode.airDate
        ? new Date(episode.airDate).toISOString().slice(0, 16)
        : '',
      title: episode.title || '',
    });
  };

  const handleEpisodeDelete = async (episode: Episode) => {
    if (
      !window.confirm(`Delete Episode ${episode.number}? This cannot be undone.`)
    ) {
      return;
    }

    try {
      await api.deleteEpisode(episode.id);
      toast({ title: 'Episode deleted', status: 'success' });
      await loadEpisodes(selectedSeasonId);
    } catch (error) {
      console.error('Failed to delete episode', error);
      toast({
        title: 'Failed to delete episode',
        description:
          error instanceof Error ? error.message : 'Unexpected error',
        status: 'error',
      });
    }
  };

  if (isCheckingAdmin) {
    return (
      <AuthenticatedLayout>
        <Box py={16} display="flex" justifyContent="center">
          <Spinner size="lg" />
        </Box>
      </AuthenticatedLayout>
    );
  }

  if (!isSignedIn || !isAdmin) {
    return (
      <AuthenticatedLayout>
        <Container maxW="container.md" py={16}>
          <Heading size="lg" mb={4}>
            Access Restricted
          </Heading>
          <Text color="text.secondary">
            You must be signed in as a system administrator to view this page.
          </Text>
        </Container>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
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

          <Box borderWidth="1px" borderRadius="lg" overflowX="auto">
            {isLoadingSeasons ? (
              <Box py={6} textAlign="center">
                <Spinner />
              </Box>
            ) : (
              <Table>
                <Thead>
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
                        <Button
                          size="sm"
                          colorScheme="orange"
                          variant="outline"
                          onClick={() => handleSeasonEdit(season)}
                        >
                          Edit
                        </Button>
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
          <Stack direction="row" align="center" mb={4} spacing={4}>
            <Heading size="md">Castaways</Heading>
            <Select
              value={selectedSeasonId}
              onChange={(event) => {
                setSelectedSeasonId(event.target.value);
                setCastawayForm(initialCastawayForm);
              }}
              maxW="300px"
            >
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  Season {season.number}: {season.name}
                </option>
              ))}
              {seasons.length === 0 && (
                <option value="">No seasons available</option>
              )}
            </Select>
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
              {castawayForm.id && (
                <FormControl>
                  <FormLabel>Profile Image</FormLabel>
                  <ImageUpload
                    currentImageUrl={
                      castaways.find((c) => c.id === castawayForm.id)?.imageUrl
                    }
                    onUpload={async (file) => {
                      setUploadingImageId(castawayForm.id);
                      try {
                        await api.uploadCastawayImage(castawayForm.id, file);
                        const updated = await api.getCastaways(selectedSeasonId);
                        setCastaways(updated);
                      } catch (error) {
                        console.error('Upload failed:', error);
                      } finally {
                        setUploadingImageId(null);
                      }
                    }}
                    onDelete={async () => {
                      if (!confirm('Delete this image?')) return;
                      setUploadingImageId(castawayForm.id);
                      try {
                        await api.deleteCastawayImage(castawayForm.id);
                        const updated = await api.getCastaways(selectedSeasonId);
                        setCastaways(updated);
                      } catch (error) {
                        console.error('Delete failed:', error);
                      } finally {
                        setUploadingImageId(null);
                      }
                    }}
                    isUploading={uploadingImageId === castawayForm.id}
                    maxSizeInMB={5}
                  />
                </FormControl>
              )}
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

          <Box borderWidth="1px" borderRadius="lg" overflowX="auto">
            {isLoadingCastaways ? (
              <Box py={6} textAlign="center">
                <Spinner />
              </Box>
            ) : (
              <Table>
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {castaways.map((castaway) => (
                    <Tr key={castaway.id}>
                      <Td>
                        <HStack spacing={3}>
                          <Avatar
                            size="sm"
                            name={castaway.name}
                            src={castaway.imageUrl || undefined}
                          />
                          <Text>{castaway.name}</Text>
                        </HStack>
                      </Td>
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

        <Divider />

        <Box>
          <Stack direction="row" align="center" mb={4} spacing={4}>
            <Heading size="md">Episodes</Heading>
            <Select
              value={selectedSeasonId}
              onChange={(event) => {
                setSelectedSeasonId(event.target.value);
                setEpisodeForm(initialEpisodeForm);
              }}
              maxW="300px"
            >
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  Season {season.number}: {season.name}
                </option>
              ))}
              {seasons.length === 0 && (
                <option value="">No seasons available</option>
              )}
            </Select>
          </Stack>

          <Box
            as="form"
            onSubmit={handleEpisodeSubmit}
            opacity={selectedSeasonId ? 1 : 0.6}
          >
            <Stack
              spacing={4}
              p={5}
              borderWidth="1px"
              borderRadius="lg"
              mb={6}
            >
              <Heading size="sm">
                {episodeForm.id ? 'Edit Episode' : 'Create Episode'}
              </Heading>
              <FormControl isRequired>
                <FormLabel>Episode Number</FormLabel>
                <Input
                  type="number"
                  min={1}
                  value={episodeForm.number}
                  onChange={(event) =>
                    setEpisodeForm((prev) => ({
                      ...prev,
                      number: event.target.value,
                    }))
                  }
                  isDisabled={!selectedSeasonId}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Air Date & Time</FormLabel>
                <Input
                  type="datetime-local"
                  value={episodeForm.airDate}
                  onChange={(event) =>
                    setEpisodeForm((prev) => ({
                      ...prev,
                      airDate: event.target.value,
                    }))
                  }
                  isDisabled={!selectedSeasonId}
                />
                <Text mt={1} fontSize="sm" color="text.secondary">
                  This is used as the deadline for weekly questions
                </Text>
              </FormControl>
              <FormControl>
                <FormLabel>Title (optional)</FormLabel>
                <Input
                  value={episodeForm.title}
                  onChange={(event) =>
                    setEpisodeForm((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                  placeholder="e.g., Premiere, Merge, Finale"
                  isDisabled={!selectedSeasonId}
                />
              </FormControl>
              <Stack direction="row" spacing={3}>
                <Button
                  type="submit"
                  colorScheme="orange"
                  isDisabled={!selectedSeasonId}
                  isLoading={isSubmittingEpisode}
                >
                  {episodeForm.id ? 'Update Episode' : 'Create Episode'}
                </Button>
                {episodeForm.id && (
                  <Button
                    variant="ghost"
                    onClick={() => setEpisodeForm(initialEpisodeForm)}
                  >
                    Cancel
                  </Button>
                )}
              </Stack>
            </Stack>
          </Box>

          <Box borderWidth="1px" borderRadius="lg" overflowX="auto">
            {isLoadingEpisodes ? (
              <Box py={6} textAlign="center">
                <Spinner />
              </Box>
            ) : (
              <Table>
                <Thead>
                  <Tr>
                    <Th>#</Th>
                    <Th>Title</Th>
                    <Th>Air Date</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {episodes.map((episode) => (
                    <Tr key={episode.id}>
                      <Td>{episode.number}</Td>
                      <Td>{episode.title || '—'}</Td>
                      <Td>
                        {episode.airDate
                          ? new Date(episode.airDate).toLocaleString()
                          : '—'}
                      </Td>
                      <Td>
                        <Stack direction="row" spacing={2}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEpisodeEdit(episode)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleEpisodeDelete(episode)}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </Td>
                    </Tr>
                  ))}
                  {episodes.length === 0 && (
                    <Tr>
                      <Td colSpan={4} textAlign="center" py={6}>
                        {selectedSeasonId
                          ? 'No episodes for this season yet.'
                          : 'Select a season to view episodes.'}
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
    </AuthenticatedLayout>
  );
}


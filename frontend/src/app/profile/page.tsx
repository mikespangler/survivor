'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, UserButton } from '@clerk/nextjs';
import {
  Box, Container, Heading, VStack, HStack, FormControl, FormLabel,
  Input, Button, useToast, Avatar, Text, Card, CardBody, CardHeader,
  Spinner, Switch, Select, Divider,
} from '@chakra-ui/react';
import { DeleteIcon } from '@/components/dashboard/icons';
import { api } from '@/lib/api';
import { CloudinaryUploadWidget } from '@/components/common/CloudinaryUploadWidget';
import type { User, Team, NotificationPreferences, EmailFrequency } from '@/types/api';

export default function ProfilePage() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const toast = useToast();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences | null>(null);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [isCommissioner, setIsCommissioner] = useState(false);

  // Load user data and teams on mount
  useEffect(() => {
    if (!isSignedIn) {
      router.push('/');
      return;
    }
    loadUserData();
  }, [isSignedIn]);

  // Load current user and their teams
  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const [user, teams, prefs] = await Promise.all([
        api.getCurrentUser(),
        api.getUserTeams(),
        api.getNotificationPreferences(),
      ]);

      setCurrentUser(user);
      setName(user.name || '');
      setUserTeams(teams);
      setNotificationPrefs(prefs);

      // Check if user is a commissioner of any league
      const leagues = await api.getLeagues();
      const isComm = leagues.some(
        (league) =>
          league.ownerId === user.id ||
          league.commissioners?.some((c) => c.id === user.id)
      );
      setIsCommissioner(isComm);
    } catch (error) {
      toast({
        title: 'Failed to load profile',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle notification preference update
  const handleUpdateNotificationPref = async (
    key: keyof NotificationPreferences,
    value: boolean | string | number
  ) => {
    if (!notificationPrefs) return;

    setIsSavingPrefs(true);
    try {
      const updated = await api.updateNotificationPreferences({ [key]: value });
      setNotificationPrefs(updated);
    } catch (error) {
      toast({
        title: 'Failed to update preference',
        description: error instanceof Error ? error.message : undefined,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSavingPrefs(false);
    }
  };

  // Handle name update
  const handleUpdateName = async () => {
    if (!name.trim()) {
      toast({
        title: 'Name cannot be empty',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser = await api.updateUserProfile({ name: name.trim() });
      setCurrentUser(updatedUser);
      toast({
        title: 'Name updated',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Failed to update name',
        description: error instanceof Error ? error.message : undefined,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Box as="main" minH="100vh" py={20} display="flex" justifyContent="center" bg="bg.primary">
        <VStack gap={4}>
          <Spinner size="xl" />
          <Text>Loading profile...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box as="main" minH="100vh" py={10} bg="bg.primary">
      <Container maxW="container.md">
        <VStack gap={8} align="stretch">
          <Heading color="text.primary">Profile Settings</Heading>

          {/* Account Settings Section */}
          <Card>
            <CardHeader>
              <Heading size="md">Account Settings</Heading>
              <Text fontSize="sm" color="text.secondary" mt={1}>
                Manage your authentication and security settings
              </Text>
            </CardHeader>
            <CardBody>
              <VStack gap={4} align="stretch">
                <HStack gap={3} align="center">
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        rootBox: 'flex',
                        card: 'shadow-lg',
                      },
                    }}
                  />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="medium" color="text.primary">
                      Account Settings
                    </Text>
                    <Text fontSize="xs" color="text.secondary">
                      Click to manage your email, password, and security settings
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Personal Name Section */}
          <Card>
            <CardHeader>
              <Heading size="md">Personal Information</Heading>
            </CardHeader>
            <CardBody>
              <VStack gap={4} align="stretch">
                <FormControl>
                  <FormLabel>Display Name</FormLabel>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                  <Text fontSize="sm" color="text.secondary" mt={2}>
                    This name will be displayed throughout the app
                  </Text>
                </FormControl>
                <Button
                  onClick={handleUpdateName}
                  isLoading={isSaving}
                  colorScheme="brand"
                  alignSelf="flex-start"
                >
                  Save Name
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Notification Preferences Section */}
          {notificationPrefs && (
            <Card>
              <CardHeader>
                <Heading size="md">Notification Preferences</Heading>
                <Text fontSize="sm" color="text.secondary" mt={1}>
                  Control when and how you receive email notifications
                </Text>
              </CardHeader>
              <CardBody>
                <VStack gap={6} align="stretch">
                  {/* Email Frequency */}
                  <FormControl>
                    <FormLabel>Email Frequency</FormLabel>
                    <HStack>
                      <Select
                        value={notificationPrefs.emailFrequency}
                        onChange={(e) =>
                          handleUpdateNotificationPref('emailFrequency', e.target.value as EmailFrequency)
                        }
                        isDisabled={isSavingPrefs}
                        flex={1}
                      >
                        <option value="immediate">Immediate - Send emails as events happen</option>
                        <option value="daily_digest">Daily Digest - One summary email per day</option>
                        <option value="never">Never - Don't send any emails</option>
                      </Select>
                      {currentUser?.systemRole === 'admin' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              const result = await api.sendTestNotificationEmail();
                              toast({
                                title: result.success ? 'Test email sent!' : 'Failed to send',
                                description: result.message,
                                status: result.success ? 'success' : 'error',
                                duration: 5000,
                              });
                            } catch (error) {
                              toast({
                                title: 'Error',
                                description: error instanceof Error ? error.message : 'Failed to send test email',
                                status: 'error',
                                duration: 5000,
                            });
                            }
                          }}
                        >
                          Send Test
                        </Button>
                      )}
                    </HStack>
                  </FormControl>

                  {notificationPrefs.emailFrequency !== 'never' && (
                    <>
                      {/* Reminder Timing */}
                      <FormControl>
                        <FormLabel>Reminder Timing</FormLabel>
                        <Select
                          value={notificationPrefs.reminderHoursBefore}
                          onChange={(e) =>
                            handleUpdateNotificationPref('reminderHoursBefore', parseInt(e.target.value))
                          }
                          isDisabled={isSavingPrefs}
                        >
                          <option value="6">6 hours before deadline</option>
                          <option value="12">12 hours before deadline</option>
                          <option value="24">24 hours before deadline</option>
                          <option value="48">48 hours before deadline</option>
                        </Select>
                        <Text fontSize="sm" color="text.secondary" mt={1}>
                          When to receive reminder emails before deadlines
                        </Text>
                      </FormControl>

                      <Divider />

                      {/* Player Notifications */}
                      <Box>
                        <Text fontWeight="semibold" mb={3}>Player Notifications</Text>
                        <VStack gap={4} align="stretch">
                          <HStack justify="space-between">
                            <Box>
                              <Text fontSize="sm" fontWeight="medium">Weekly Questions Reminder</Text>
                              <Text fontSize="xs" color="text.secondary">
                                Reminder to submit your answers before the episode airs
                              </Text>
                            </Box>
                            <Switch
                              isChecked={notificationPrefs.weeklyQuestionsReminder}
                              onChange={(e) =>
                                handleUpdateNotificationPref('weeklyQuestionsReminder', e.target.checked)
                              }
                              isDisabled={isSavingPrefs}
                              colorScheme="orange"
                              sx={{
                                'span.chakra-switch__track': {
                                  bg: notificationPrefs.weeklyQuestionsReminder ? undefined : 'gray.600',
                                },
                              }}
                            />
                          </HStack>

                          <HStack justify="space-between">
                            <Box>
                              <Text fontSize="sm" fontWeight="medium">Draft Reminder</Text>
                              <Text fontSize="xs" color="text.secondary">
                                Reminder to complete your draft before the deadline
                              </Text>
                            </Box>
                            <Switch
                              isChecked={notificationPrefs.draftReminder}
                              onChange={(e) =>
                                handleUpdateNotificationPref('draftReminder', e.target.checked)
                              }
                              isDisabled={isSavingPrefs}
                              colorScheme="orange"
                              sx={{
                                'span.chakra-switch__track': {
                                  bg: notificationPrefs.draftReminder ? undefined : 'gray.600',
                                },
                              }}
                            />
                          </HStack>

                          <HStack justify="space-between">
                            <Box>
                              <Text fontSize="sm" fontWeight="medium">Results Available</Text>
                              <Text fontSize="xs" color="text.secondary">
                                Notification when episode results are scored
                              </Text>
                            </Box>
                            <Switch
                              isChecked={notificationPrefs.resultsAvailable}
                              onChange={(e) =>
                                handleUpdateNotificationPref('resultsAvailable', e.target.checked)
                              }
                              isDisabled={isSavingPrefs}
                              colorScheme="orange"
                              sx={{
                                'span.chakra-switch__track': {
                                  bg: notificationPrefs.resultsAvailable ? undefined : 'gray.600',
                                },
                              }}
                            />
                          </HStack>

                          <HStack justify="space-between">
                            <Box>
                              <Text fontSize="sm" fontWeight="medium">Commissioner Announcements</Text>
                              <Text fontSize="xs" color="text.secondary">
                                Messages posted by league commissioners
                              </Text>
                            </Box>
                            <Switch
                              isChecked={notificationPrefs.commissionerMessages}
                              onChange={(e) =>
                                handleUpdateNotificationPref('commissionerMessages', e.target.checked)
                              }
                              isDisabled={isSavingPrefs}
                              colorScheme="orange"
                              sx={{
                                'span.chakra-switch__track': {
                                  bg: notificationPrefs.commissionerMessages ? undefined : 'gray.600',
                                },
                              }}
                            />
                          </HStack>
                        </VStack>
                      </Box>

                      {/* Commissioner Notifications */}
                      {isCommissioner && (
                        <>
                          <Divider />
                          <Box>
                            <Text fontWeight="semibold" mb={3}>Commissioner Notifications</Text>
                            <VStack gap={4} align="stretch">
                              <HStack justify="space-between">
                                <Box>
                                  <Text fontSize="sm" fontWeight="medium">Scoring Reminder</Text>
                                  <Text fontSize="xs" color="text.secondary">
                                    Reminder to score questions after episodes air
                                  </Text>
                                </Box>
                                <Switch
                                  isChecked={notificationPrefs.scoringReminder}
                                  onChange={(e) =>
                                    handleUpdateNotificationPref('scoringReminder', e.target.checked)
                                  }
                                  isDisabled={isSavingPrefs}
                                  colorScheme="orange"
                                  sx={{
                                    'span.chakra-switch__track': {
                                      bg: notificationPrefs.scoringReminder ? undefined : 'gray.600',
                                    },
                                  }}
                                />
                              </HStack>

                              <HStack justify="space-between">
                                <Box>
                                  <Text fontSize="sm" fontWeight="medium">Questions Setup Reminder</Text>
                                  <Text fontSize="xs" color="text.secondary">
                                    Reminder to create questions before episodes
                                  </Text>
                                </Box>
                                <Switch
                                  isChecked={notificationPrefs.questionsSetupReminder}
                                  onChange={(e) =>
                                    handleUpdateNotificationPref('questionsSetupReminder', e.target.checked)
                                  }
                                  isDisabled={isSavingPrefs}
                                  colorScheme="orange"
                                  sx={{
                                    'span.chakra-switch__track': {
                                      bg: notificationPrefs.questionsSetupReminder ? undefined : 'gray.600',
                                    },
                                  }}
                                />
                              </HStack>
                            </VStack>
                          </Box>
                        </>
                      )}
                    </>
                  )}
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Teams Section */}
          <Card>
            <CardHeader>
              <Heading size="md">My Teams</Heading>
              <Text fontSize="sm" color="text.secondary" mt={1}>
                Manage team names and logos for each league
              </Text>
            </CardHeader>
            <CardBody>
              <VStack gap={6} align="stretch">
                {userTeams.length === 0 ? (
                  <Text color="text.secondary" textAlign="center" py={4}>
                    No teams yet. Join a league to create a team!
                  </Text>
                ) : (
                  userTeams.map((team) => (
                    <TeamEditor
                      key={team.id}
                      team={team}
                      onUpdate={loadUserData}
                    />
                  ))
                )}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
}

// Component for editing individual teams (name and logo)
function TeamEditor({
  team,
  onUpdate,
}: {
  team: Team;
  onUpdate: () => void;
}) {
  const [name, setName] = useState(team.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const handleSaveName = async () => {
    if (!name.trim()) {
      toast({
        title: 'Team name cannot be empty',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);
    try {
      await api.updateTeamName(team.id, name.trim());
      setIsEditingName(false);
      toast({
        title: 'Team name updated',
        status: 'success',
        duration: 3000,
      });
      onUpdate();
    } catch (error) {
      toast({
        title: 'Failed to update team name',
        description: error instanceof Error ? error.message : undefined,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (url: string) => {
    // The Cloudinary widget already uploaded the image to Cloudinary
    // But we need to save it to our database via backend
    // However, since we're using the widget's direct upload, the backend
    // upload endpoint won't work here. We need a different approach.
    // For now, let's reload the data after upload completes
    toast({
      title: 'Logo uploaded',
      description: 'Processing...',
      status: 'info',
      duration: 2000,
    });

    // In the widget approach, we would need to send the URL to backend
    // But the plan suggests using backend upload, so let's use file input instead
    onUpdate();
  };

  const handleLogoDelete = async () => {
    setIsDeleting(true);
    try {
      await api.deleteTeamLogo(team.id);
      toast({
        title: 'Logo removed',
        status: 'success',
        duration: 3000,
      });
      onUpdate();
    } catch (error) {
      toast({
        title: 'Failed to delete logo',
        description: error instanceof Error ? error.message : undefined,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle file upload via backend
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Only JPG, PNG, and WebP images are allowed',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 5MB',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);
    try {
      await api.uploadTeamLogo(team.id, file);
      toast({
        title: 'Logo uploaded',
        status: 'success',
        duration: 3000,
      });
      onUpdate();
    } catch (error) {
      toast({
        title: 'Failed to upload logo',
        description: error instanceof Error ? error.message : undefined,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      borderColor="border.primary"
    >
      <VStack gap={4} align="stretch">
        {/* League Info */}
        <Text fontSize="xs" color="text.secondary">
          {team.leagueSeason?.league?.name} - Season {team.leagueSeason?.season?.number}
        </Text>

        {/* Team Logo */}
        <HStack>
          <Avatar
            size="xl"
            name={team.name}
            src={team.logoImageUrl || undefined}
            borderRadius="12px" // Slightly rounded square
          />
          <VStack align="start" spacing={2}>
            <Button
              as="label"
              htmlFor={`logo-upload-${team.id}`}
              size="sm"
              colorScheme="brand"
              isLoading={isSaving}
              cursor="pointer"
            >
              {team.logoImageUrl ? 'Change Logo' : 'Upload Logo'}
            </Button>
            <input
              id={`logo-upload-${team.id}`}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            {team.logoImageUrl && (
              <Button
                size="sm"
                variant="ghost"
                colorScheme="red"
                leftIcon={<DeleteIcon />}
                onClick={handleLogoDelete}
                isLoading={isDeleting}
              >
                Remove Logo
              </Button>
            )}
            <Text fontSize="xs" color="text.secondary">
              Square image, max 5MB
            </Text>
          </VStack>
        </HStack>

        {/* Team Name */}
        <FormControl>
          <FormLabel fontSize="sm">Team Name</FormLabel>
          {isEditingName ? (
            <HStack>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                size="sm"
              />
              <Button onClick={handleSaveName} isLoading={isSaving} size="sm">
                Save
              </Button>
              <Button
                onClick={() => {
                  setName(team.name);
                  setIsEditingName(false);
                }}
                variant="ghost"
                size="sm"
              >
                Cancel
              </Button>
            </HStack>
          ) : (
            <HStack>
              <Text flex={1} fontWeight="semibold">
                {team.name}
              </Text>
              <Button
                onClick={() => setIsEditingName(true)}
                size="sm"
                variant="outline"
              >
                Edit
              </Button>
            </HStack>
          )}
        </FormControl>
      </VStack>
    </Box>
  );
}

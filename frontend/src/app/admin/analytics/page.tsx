'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  HStack,
  Button,
} from '@chakra-ui/react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AuthenticatedLayout } from '@/components/navigation';
import { ReturnToLeagueButton } from '@/components/common';
import { KpiCard } from '@/components/analytics/KpiCard';
import { GrowthChart } from '@/components/analytics/GrowthChart';
import { EngagementChart } from '@/components/analytics/EngagementChart';
import { RetentionChart } from '@/components/analytics/RetentionChart';
import { EpisodeRetentionChart } from '@/components/analytics/EpisodeRetentionChart';
import { InviteFunnelChart } from '@/components/analytics/InviteFunnelChart';
import { LeagueHealthTable } from '@/components/analytics/LeagueHealthTable';
import { GhostUsersTable } from '@/components/analytics/GhostUsersTable';
import { DateRangeSelector } from '@/components/analytics/DateRangeSelector';
import type {
  AnalyticsOverview,
  GrowthDataPoint,
  EngagementDataPoint,
  RetentionData,
  LeagueHealthData,
  InviteFunnelDataPoint,
  GhostUser,
} from '@/types/api';

function defaultFrom(): string {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return d.toISOString().slice(0, 10);
}

function defaultTo(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AnalyticsPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Data states
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [growth, setGrowth] = useState<GrowthDataPoint[]>([]);
  const [engagement, setEngagement] = useState<EngagementDataPoint[]>([]);
  const [retention, setRetention] = useState<RetentionData | null>(null);
  const [leagues, setLeagues] = useState<LeagueHealthData[]>([]);
  const [invites, setInvites] = useState<InviteFunnelDataPoint[]>([]);
  const [ghostUsers, setGhostUsers] = useState<GhostUser[]>([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);

  // Date range state
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [granularity, setGranularity] = useState('week');

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
      } catch {
        setIsAdmin(false);
      } finally {
        if (isActive) setIsCheckingAdmin(false);
      }
    };

    void initialize();
    return () => { isActive = false; };
  }, [isSignedIn]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        overviewData,
        growthData,
        engagementData,
        retentionData,
        leagueData,
        inviteData,
        ghostData,
      ] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getAnalyticsGrowth(from, to, granularity),
        api.getAnalyticsEngagement(),
        api.getAnalyticsRetention(from, to, granularity),
        api.getAnalyticsLeagues(),
        api.getAnalyticsInvites(from, to, granularity),
        api.getAnalyticsGhostUsers(),
      ]);

      setOverview(overviewData);
      setGrowth(growthData);
      setEngagement(engagementData);
      setRetention(retentionData);
      setLeagues(leagueData);
      setInvites(inviteData);
      setGhostUsers(ghostData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [from, to, granularity]);

  useEffect(() => {
    if (isAdmin) {
      void loadData();
    }
  }, [isAdmin, loadData]);

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
          <Heading size="lg">Access Restricted</Heading>
          <Text color="text.secondary" mt={2}>
            You must be signed in as a system administrator to view this page.
          </Text>
        </Container>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <Container maxW="container.xl" py={{ base: 5, md: 10 }} px={{ base: 4, md: 6, lg: 8 }}>
        <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} mb={8} gap={3}>
          <HStack spacing={4}>
            <Heading size={{ base: 'lg', md: 'xl' }}>Analytics</Heading>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push('/admin')}
            >
              Admin Dashboard
            </Button>
          </HStack>
          <ReturnToLeagueButton />
        </Stack>

        {isLoading && !overview ? (
          <Box py={16} display="flex" justifyContent="center">
            <Spinner size="lg" />
          </Box>
        ) : (
          <Stack spacing={8}>
            {/* KPI Cards */}
            {overview && (
              <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4}>
                <KpiCard label="Total Users" value={overview.totalUsers} helpText={`+${overview.newSignupsWeek} this week`} />
                <KpiCard label="Total Leagues" value={overview.totalLeagues} />
                <KpiCard label="Total Teams" value={overview.totalTeams} />
                <KpiCard label="Active Today" value={overview.activeUsersToday} helpText={`${overview.activeUsersWeek} this week`} />
                <KpiCard label="Invite Conv. Rate" value={`${overview.inviteConversionRate}%`} />
              </SimpleGrid>
            )}

            {/* Date Range Selector */}
            <Box>
              <DateRangeSelector
                from={from}
                to={to}
                granularity={granularity}
                onFromChange={setFrom}
                onToChange={setTo}
                onGranularityChange={setGranularity}
              />
            </Box>

            {/* Growth Chart */}
            <Box borderWidth="1px" borderRadius="lg" p={5} bg="bg.secondary">
              <Heading size="md" mb={4}>User & League Growth</Heading>
              <GrowthChart data={growth} />
            </Box>

            {/* Engagement Chart */}
            <Box borderWidth="1px" borderRadius="lg" p={5} bg="bg.secondary">
              <Heading size="md" mb={4}>Episode Engagement</Heading>
              <EngagementChart data={engagement} />
            </Box>

            {/* Retention Charts */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Box borderWidth="1px" borderRadius="lg" p={5} bg="bg.secondary">
                <Heading size="md" mb={4}>Daily Active Users</Heading>
                {retention && <RetentionChart data={retention} />}
              </Box>
              <Box borderWidth="1px" borderRadius="lg" p={5} bg="bg.secondary">
                <Heading size="md" mb={4}>Episode Return Rate</Heading>
                {retention && <EpisodeRetentionChart data={retention} />}
              </Box>
            </SimpleGrid>

            {/* Invite Funnel */}
            <Box borderWidth="1px" borderRadius="lg" p={5} bg="bg.secondary">
              <Heading size="md" mb={4}>Invite Funnel</Heading>
              <InviteFunnelChart data={invites} />
            </Box>

            {/* League Health */}
            <Box>
              <Heading size="md" mb={4}>League Health</Heading>
              <LeagueHealthTable data={leagues} />
            </Box>

            {/* Ghost Users */}
            <Box>
              <Heading size="md" mb={4}>
                Ghost Users
                <Text as="span" fontSize="sm" color="text.secondary" fontWeight="normal" ml={2}>
                  ({ghostUsers.length} users with no leagues)
                </Text>
              </Heading>
              <GhostUsersTable data={ghostUsers} />
            </Box>
          </Stack>
        )}
      </Container>
    </AuthenticatedLayout>
  );
}

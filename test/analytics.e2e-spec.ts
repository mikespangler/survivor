import { TestApp, createTestApp } from './helpers/test-app';
import { cleanDatabase } from './helpers/cleanup';
import {
  seedUser,
  seedSeason,
  seedLeagueWithTeam,
  addMemberWithTeam,
  resetCounter,
} from './helpers/seed';

describe('Analytics (e2e)', () => {
  let app: TestApp;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.module.close();
  });

  beforeEach(async () => {
    await cleanDatabase(app.prisma);
    resetCounter();
    app.analyticsService.clearCache();
  });

  describe('trackEvent', () => {
    it('should record an APP_VISIT event', async () => {
      const user = await seedUser(app.prisma);

      const log = await app.analyticsService.trackEvent(user.id, 'APP_VISIT');
      expect(log).toBeDefined();
      expect(log.userId).toBe(user.id);
      expect(log.action).toBe('APP_VISIT');
    });

    it('should deduplicate APP_VISIT for same user on same day', async () => {
      const user = await seedUser(app.prisma);

      await app.analyticsService.trackEvent(user.id, 'APP_VISIT');
      await app.analyticsService.trackEvent(user.id, 'APP_VISIT');

      const count = await app.prisma.activityLog.count({
        where: { userId: user.id, action: 'APP_VISIT' },
      });
      expect(count).toBe(1);
    });

    it('should record PAGE_VIEW events without deduplication', async () => {
      const user = await seedUser(app.prisma);

      await app.analyticsService.trackEvent(user.id, 'PAGE_VIEW', {
        page: '/dashboard',
      });
      await app.analyticsService.trackEvent(user.id, 'PAGE_VIEW', {
        page: '/league/abc',
      });

      const count = await app.prisma.activityLog.count({
        where: { userId: user.id, action: 'PAGE_VIEW' },
      });
      expect(count).toBe(2);
    });
  });

  describe('getOverview', () => {
    it('should return correct KPI counts', async () => {
      const user1 = await seedUser(app.prisma);
      const user2 = await seedUser(app.prisma);
      const { season } = await seedSeason(app.prisma);
      await seedLeagueWithTeam(app.prisma, season.id, user1);

      // Track activity for one user
      await app.analyticsService.trackEvent(user1.id, 'APP_VISIT');

      const overview = await app.analyticsService.getOverview() as any;

      expect(overview.totalUsers).toBe(2);
      expect(overview.totalLeagues).toBe(1);
      expect(overview.totalTeams).toBe(1);
      expect(overview.activeUsersToday).toBe(1);
    });

    it('should calculate invite conversion rate', async () => {
      const user = await seedUser(app.prisma);
      const { season } = await seedSeason(app.prisma);
      const { league } = await seedLeagueWithTeam(app.prisma, season.id, user);

      // Create invite tokens - 2 sent, 1 accepted
      await app.prisma.inviteToken.create({
        data: {
          leagueId: league.id,
          token: `token-1-${Date.now()}`,
          createdById: user.id,
          expiresAt: new Date(Date.now() + 86400000),
          usedAt: new Date(),
          usedById: user.id,
        },
      });
      await app.prisma.inviteToken.create({
        data: {
          leagueId: league.id,
          token: `token-2-${Date.now()}`,
          createdById: user.id,
          expiresAt: new Date(Date.now() + 86400000),
        },
      });

      const overview = await app.analyticsService.getOverview() as any;
      expect(overview.inviteConversionRate).toBe(50);
    });
  });

  describe('getGrowth', () => {
    it('should return time series with cumulative counts', async () => {
      const user = await seedUser(app.prisma);
      const { season } = await seedSeason(app.prisma);
      await seedLeagueWithTeam(app.prisma, season.id, user);

      const now = new Date();
      const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      const to = now.toISOString().slice(0, 10);

      const growth = await app.analyticsService.getGrowth(from, to, 'day');
      expect(Array.isArray(growth)).toBe(true);

      // At least one data point
      if (growth.length > 0) {
        const last = growth[growth.length - 1];
        expect(last.cumulativeUsers).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('getEngagement', () => {
    it('should return per-episode engagement metrics', async () => {
      const user = await seedUser(app.prisma);
      const { season } = await seedSeason(app.prisma);
      const { leagueSeason, team } = await seedLeagueWithTeam(
        app.prisma,
        season.id,
        user,
      );

      // Create a question and answer
      const question = await app.prisma.leagueQuestion.create({
        data: {
          leagueSeasonId: leagueSeason.id,
          episodeNumber: 1,
          text: 'Who gets voted off?',
          type: 'FILL_IN_THE_BLANK',
          pointValue: 10,
        },
      });

      await app.prisma.playerAnswer.create({
        data: {
          leagueQuestionId: question.id,
          teamId: team.id,
          answer: 'Jeff',
        },
      });

      const engagement = await app.analyticsService.getEngagement();
      expect(engagement.length).toBeGreaterThanOrEqual(1);

      const ep1 = engagement.find((e) => e.episodeNumber === 1);
      expect(ep1).toBeDefined();
      expect(ep1!.teamsWithAnswers).toBe(1);
      expect(ep1!.totalAnswers).toBe(1);
      expect(ep1!.participationRate).toBe(100);
    });
  });

  describe('getLeagueHealth', () => {
    it('should return league health data with participation rates', async () => {
      const user = await seedUser(app.prisma);
      const { season } = await seedSeason(app.prisma);
      const { league, leagueSeason, team } = await seedLeagueWithTeam(
        app.prisma,
        season.id,
        user,
      );

      // Add a second member with team but no answers
      const user2 = await seedUser(app.prisma);
      await addMemberWithTeam(app.prisma, league.id, leagueSeason.id, user2);

      // Add an answer for user1's team
      const question = await app.prisma.leagueQuestion.create({
        data: {
          leagueSeasonId: leagueSeason.id,
          episodeNumber: 1,
          text: 'Test?',
          type: 'FILL_IN_THE_BLANK',
          pointValue: 5,
        },
      });
      await app.prisma.playerAnswer.create({
        data: {
          leagueQuestionId: question.id,
          teamId: team.id,
          answer: 'Yes',
        },
      });

      const health = await app.analyticsService.getLeagueHealth();
      expect(health.length).toBeGreaterThanOrEqual(1);

      const leagueHealth = health.find((l) => l.id === league.id);
      expect(leagueHealth).toBeDefined();
      expect(leagueHealth!.memberCount).toBe(2);
      expect(leagueHealth!.teamCount).toBe(2);
      expect(leagueHealth!.totalAnswers).toBe(1);
      expect(leagueHealth!.participationRate).toBe(50);
    });
  });

  describe('getGhostUsers', () => {
    it('should return users with no league memberships', async () => {
      const user1 = await seedUser(app.prisma);
      const user2 = await seedUser(app.prisma);
      const { season } = await seedSeason(app.prisma);
      await seedLeagueWithTeam(app.prisma, season.id, user1);

      // user2 has no leagues
      const ghosts = await app.analyticsService.getGhostUsers();
      const ghostIds = ghosts.map((g) => g.id);
      expect(ghostIds).toContain(user2.id);
      expect(ghostIds).not.toContain(user1.id);
    });
  });

  describe('getInviteFunnel', () => {
    it('should return invite sent vs accepted data', async () => {
      const user = await seedUser(app.prisma);
      const { season } = await seedSeason(app.prisma);
      const { league } = await seedLeagueWithTeam(app.prisma, season.id, user);

      const now = new Date();
      await app.prisma.inviteToken.create({
        data: {
          leagueId: league.id,
          token: `invite-1-${Date.now()}`,
          createdById: user.id,
          expiresAt: new Date(Date.now() + 86400000),
          invitedEmail: 'test@example.com',
        },
      });
      await app.prisma.inviteToken.create({
        data: {
          leagueId: league.id,
          token: `invite-2-${Date.now()}`,
          createdById: user.id,
          expiresAt: new Date(Date.now() + 86400000),
          usedAt: now,
          usedById: user.id,
        },
      });

      const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      const to = new Date(now.getTime() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);

      const funnel = await app.analyticsService.getInviteFunnel(from, to, 'day');
      expect(Array.isArray(funnel)).toBe(true);

      // Should have data with sent >= 2 and accepted >= 1
      const totalSent = funnel.reduce((sum, d) => sum + d.sent, 0);
      const totalAccepted = funnel.reduce((sum, d) => sum + d.accepted, 0);
      expect(totalSent).toBeGreaterThanOrEqual(2);
      expect(totalAccepted).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getRetention', () => {
    it('should return DAU data from activity logs', async () => {
      const user = await seedUser(app.prisma);

      // Track visits
      await app.analyticsService.trackEvent(user.id, 'APP_VISIT');

      const now = new Date();
      const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      const to = new Date(now.getTime() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);

      const retention = await app.analyticsService.getRetention(from, to, 'day');
      expect(retention.dailyActiveUsers).toBeDefined();
      expect(Array.isArray(retention.dailyActiveUsers)).toBe(true);

      const totalDAU = retention.dailyActiveUsers.reduce((sum, d) => sum + d.count, 0);
      expect(totalDAU).toBeGreaterThanOrEqual(1);
    });
  });
});

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

@Injectable()
export class AnalyticsService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly prisma: PrismaService) {}

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, expiresAt: Date.now() + this.CACHE_TTL });
  }

  clearCache(): void {
    this.cache.clear();
  }

  async getOverview() {
    const cached = this.getCached('overview');
    if (cached) return cached;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalLeagues,
      totalTeams,
      newSignupsToday,
      newSignupsWeek,
      newSignupsMonth,
      activeUsersToday,
      activeUsersWeek,
      activeUsersMonth,
      totalInvitesSent,
      totalInvitesAccepted,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.league.count({ where: { isSystem: false } }),
      this.prisma.team.count(),
      this.prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      this.prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
      this.countDistinctActiveUsers(todayStart, now),
      this.countDistinctActiveUsers(weekAgo, now),
      this.countDistinctActiveUsers(monthAgo, now),
      this.prisma.inviteToken.count(),
      this.prisma.inviteToken.count({ where: { usedAt: { not: null } } }),
    ]);

    const inviteConversionRate =
      totalInvitesSent > 0
        ? Math.round((totalInvitesAccepted / totalInvitesSent) * 100)
        : 0;

    const result = {
      totalUsers,
      totalLeagues,
      totalTeams,
      newSignupsToday,
      newSignupsWeek,
      newSignupsMonth,
      activeUsersToday,
      activeUsersWeek,
      activeUsersMonth,
      inviteConversionRate,
    };

    this.setCache('overview', result);
    return result;
  }

  private async countDistinctActiveUsers(
    from: Date,
    to: Date,
  ): Promise<number> {
    const result = await this.prisma.activityLog.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: from, lte: to },
      },
    });
    return result.length;
  }

  async getGrowth(from?: string, to?: string, granularity: string = 'day') {
    const fromDate = from ? new Date(from) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date();
    const trunc = this.pgTrunc(granularity);

    const [userSignups, leagueCreations] = await Promise.all([
      this.prisma.$queryRaw<Array<{ period: Date; count: bigint }>>`
        SELECT DATE_TRUNC(${trunc}, "createdAt") as period, COUNT(*) as count
        FROM "User"
        WHERE "createdAt" >= ${fromDate} AND "createdAt" <= ${toDate}
        GROUP BY period
        ORDER BY period ASC
      `,
      this.prisma.$queryRaw<Array<{ period: Date; count: bigint }>>`
        SELECT DATE_TRUNC(${trunc}, "createdAt") as period, COUNT(*) as count
        FROM "League"
        WHERE "createdAt" >= ${fromDate} AND "createdAt" <= ${toDate}
          AND "isSystem" = false
        GROUP BY period
        ORDER BY period ASC
      `,
    ]);

    // Build cumulative totals
    const countsBefore = await Promise.all([
      this.prisma.user.count({ where: { createdAt: { lt: fromDate } } }),
      this.prisma.league.count({
        where: { createdAt: { lt: fromDate }, isSystem: false },
      }),
    ]);

    let cumulativeUsers = countsBefore[0];
    let cumulativeLeagues = countsBefore[1];

    // Merge into single timeline
    const periodMap = new Map<string, any>();

    for (const row of userSignups) {
      const key = new Date(row.period).toISOString();
      const count = Number(row.count);
      cumulativeUsers += count;
      periodMap.set(key, {
        period: key,
        newUsers: count,
        cumulativeUsers,
        newLeagues: 0,
        cumulativeLeagues: 0,
      });
    }

    cumulativeLeagues = countsBefore[1]; // reset
    for (const row of leagueCreations) {
      const key = new Date(row.period).toISOString();
      const count = Number(row.count);
      cumulativeLeagues += count;
      const existing = periodMap.get(key);
      if (existing) {
        existing.newLeagues = count;
        existing.cumulativeLeagues = cumulativeLeagues;
      } else {
        periodMap.set(key, {
          period: key,
          newUsers: 0,
          cumulativeUsers,
          newLeagues: count,
          cumulativeLeagues,
        });
      }
    }

    // Fill in cumulative league counts for user-only periods
    let lastLeaguesCum = countsBefore[1];
    const sorted = Array.from(periodMap.values()).sort(
      (a, b) => new Date(a.period).getTime() - new Date(b.period).getTime(),
    );
    for (const entry of sorted) {
      if (entry.cumulativeLeagues === 0) {
        entry.cumulativeLeagues = lastLeaguesCum;
      } else {
        lastLeaguesCum = entry.cumulativeLeagues;
      }
    }

    return sorted;
  }

  async getEngagement() {
    // Per-episode engagement: how many teams submitted answers, and submission rate
    const episodes = await this.prisma.$queryRaw<
      Array<{
        episodeNumber: number;
        totalTeams: bigint;
        teamsWithAnswers: bigint;
        totalAnswers: bigint;
        totalQuestions: bigint;
      }>
    >`
      SELECT
        lq."episodeNumber",
        COUNT(DISTINCT t.id) as "totalTeams",
        COUNT(DISTINCT pa."teamId") as "teamsWithAnswers",
        COUNT(pa.id) as "totalAnswers",
        COUNT(DISTINCT lq.id) as "totalQuestions"
      FROM "LeagueQuestion" lq
      JOIN "LeagueSeason" ls ON lq."leagueSeasonId" = ls.id
      JOIN "Team" t ON t."leagueSeasonId" = ls.id
      LEFT JOIN "PlayerAnswer" pa ON pa."leagueQuestionId" = lq.id
      GROUP BY lq."episodeNumber"
      ORDER BY lq."episodeNumber" ASC
    `;

    return episodes.map((ep) => {
      const totalTeams = Number(ep.totalTeams);
      const teamsWithAnswers = Number(ep.teamsWithAnswers);
      const totalAnswers = Number(ep.totalAnswers);
      const totalQuestions = Number(ep.totalQuestions);
      const possibleAnswers = totalTeams * totalQuestions;

      return {
        episodeNumber: ep.episodeNumber,
        totalTeams,
        teamsWithAnswers,
        totalAnswers,
        totalQuestions,
        submissionRate:
          possibleAnswers > 0
            ? Math.round((totalAnswers / possibleAnswers) * 100)
            : 0,
        participationRate:
          totalTeams > 0
            ? Math.round((teamsWithAnswers / totalTeams) * 100)
            : 0,
      };
    });
  }

  async getRetention(
    from?: string,
    to?: string,
    granularity: string = 'day',
  ) {
    const fromDate = from ? new Date(from) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date();
    const trunc = this.pgTrunc(granularity);

    const activeUsers = await this.prisma.$queryRaw<
      Array<{ period: Date; count: bigint }>
    >`
      SELECT DATE_TRUNC(${trunc}, "createdAt") as period, COUNT(DISTINCT "userId") as count
      FROM "ActivityLog"
      WHERE "createdAt" >= ${fromDate} AND "createdAt" <= ${toDate}
        AND action = 'APP_VISIT'
      GROUP BY period
      ORDER BY period ASC
    `;

    // Episode-over-episode return rate
    const episodeRetention = await this.prisma.$queryRaw<
      Array<{
        episodeNumber: number;
        activeUsers: bigint;
        returningUsers: bigint;
      }>
    >`
      SELECT
        curr."episodeNumber",
        COUNT(DISTINCT curr."userId") as "activeUsers",
        COUNT(DISTINCT prev."userId") as "returningUsers"
      FROM (
        SELECT DISTINCT pa."teamId", t."ownerId" as "userId", lq."episodeNumber"
        FROM "PlayerAnswer" pa
        JOIN "Team" t ON pa."teamId" = t.id
        JOIN "LeagueQuestion" lq ON pa."leagueQuestionId" = lq.id
      ) curr
      LEFT JOIN (
        SELECT DISTINCT pa."teamId", t."ownerId" as "userId", lq."episodeNumber"
        FROM "PlayerAnswer" pa
        JOIN "Team" t ON pa."teamId" = t.id
        JOIN "LeagueQuestion" lq ON pa."leagueQuestionId" = lq.id
      ) prev ON curr."userId" = prev."userId" AND prev."episodeNumber" = curr."episodeNumber" - 1
      GROUP BY curr."episodeNumber"
      ORDER BY curr."episodeNumber" ASC
    `;

    return {
      dailyActiveUsers: activeUsers.map((r) => ({
        period: new Date(r.period).toISOString(),
        count: Number(r.count),
      })),
      episodeRetention: episodeRetention.map((r) => {
        const active = Number(r.activeUsers);
        const returning = Number(r.returningUsers);
        return {
          episodeNumber: r.episodeNumber,
          activeUsers: active,
          returningUsers: returning,
          returnRate: active > 0 ? Math.round((returning / active) * 100) : 0,
        };
      }),
    };
  }

  async getLeagueHealth() {
    const leagues = await this.prisma.league.findMany({
      where: { isSystem: false },
      include: {
        members: { select: { id: true } },
        leagueSeasons: {
          include: {
            teams: {
              include: {
                answers: { select: { id: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return leagues.map((league) => {
      const memberCount = league.members.length;
      const teams = league.leagueSeasons.flatMap((ls) => ls.teams);
      const teamCount = teams.length;
      const totalAnswers = teams.reduce(
        (sum, team) => sum + team.answers.length,
        0,
      );
      const teamsWithAnswers = teams.filter(
        (team) => team.answers.length > 0,
      ).length;
      const participationRate =
        teamCount > 0
          ? Math.round((teamsWithAnswers / teamCount) * 100)
          : 0;

      return {
        id: league.id,
        name: league.name,
        slug: league.slug,
        memberCount,
        teamCount,
        totalAnswers,
        participationRate,
        createdAt: league.createdAt.toISOString(),
      };
    });
  }

  async getInviteFunnel(
    from?: string,
    to?: string,
    granularity: string = 'day',
  ) {
    const fromDate = from ? new Date(from) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date();
    const trunc = this.pgTrunc(granularity);

    const [sent, accepted] = await Promise.all([
      this.prisma.$queryRaw<Array<{ period: Date; count: bigint; email_count: bigint; link_count: bigint }>>`
        SELECT
          DATE_TRUNC(${trunc}, "createdAt") as period,
          COUNT(*) as count,
          COUNT(CASE WHEN "invitedEmail" IS NOT NULL THEN 1 END) as email_count,
          COUNT(CASE WHEN "invitedEmail" IS NULL THEN 1 END) as link_count
        FROM "InviteToken"
        WHERE "createdAt" >= ${fromDate} AND "createdAt" <= ${toDate}
        GROUP BY period
        ORDER BY period ASC
      `,
      this.prisma.$queryRaw<Array<{ period: Date; count: bigint }>>`
        SELECT DATE_TRUNC(${trunc}, "usedAt") as period, COUNT(*) as count
        FROM "InviteToken"
        WHERE "usedAt" IS NOT NULL
          AND "usedAt" >= ${fromDate} AND "usedAt" <= ${toDate}
        GROUP BY period
        ORDER BY period ASC
      `,
    ]);

    // Merge into single timeline
    const periodMap = new Map<string, any>();

    for (const row of sent) {
      const key = new Date(row.period).toISOString();
      periodMap.set(key, {
        period: key,
        sent: Number(row.count),
        emailInvites: Number(row.email_count),
        linkInvites: Number(row.link_count),
        accepted: 0,
      });
    }

    for (const row of accepted) {
      const key = new Date(row.period).toISOString();
      const existing = periodMap.get(key);
      if (existing) {
        existing.accepted = Number(row.count);
      } else {
        periodMap.set(key, {
          period: key,
          sent: 0,
          emailInvites: 0,
          linkInvites: 0,
          accepted: Number(row.count),
        });
      }
    }

    return Array.from(periodMap.values()).sort(
      (a, b) => new Date(a.period).getTime() - new Date(b.period).getTime(),
    );
  }

  async getGhostUsers() {
    const ghostUsers = await this.prisma.user.findMany({
      where: {
        memberLeagues: { none: {} },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return ghostUsers;
  }

  async trackEvent(userId: string, action: string, metadata?: any) {
    // For APP_VISIT, only record once per user per day
    if (action === 'APP_VISIT') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const existing = await this.prisma.activityLog.findFirst({
        where: {
          userId,
          action: 'APP_VISIT',
          createdAt: { gte: todayStart },
        },
      });

      if (existing) return existing;
    }

    return this.prisma.activityLog.create({
      data: {
        userId,
        action,
        metadata: metadata ?? undefined,
      },
    });
  }

  private pgTrunc(granularity: string): string {
    switch (granularity) {
      case 'week':
        return 'week';
      case 'month':
        return 'month';
      default:
        return 'day';
    }
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateLeagueSeasonSettingsDto } from './dto/update-league-season-settings.dto';
import { UpdateDraftConfigDto } from './dto/update-draft-config.dto';
import { CreateLeagueDto } from './dto/create-league.dto';
import { JoinLeagueDto } from './dto/join-league.dto';
import { InviteByEmailDto } from './dto/invite-by-email.dto';
import { JoinByTokenDto } from './dto/join-by-token.dto';
import { AddCommissionerDto } from './dto/add-commissioner.dto';
import * as crypto from 'crypto';

@Injectable()
export class LeagueService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeagues(userId: string) {
    const leagues = await this.prisma.league.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { id: userId } } }],
      },
      include: {
        owner: true,
        members: true,
        commissioners: true,
        leagueSeasons: {
          include: {
            season: true,
            teams: {
              include: {
                owner: true,
              },
            },
          },
          orderBy: {
            season: {
              number: 'desc',
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Enhance the response with active season indicator and user's team
    return leagues.map((league) => {
      const leagueSeasonsEnhanced = league.leagueSeasons.map((ls) => {
        const userTeam = ls.teams.find((team) => team.ownerId === userId);
        return {
          ...ls,
          isActive: ls.season.status === 'ACTIVE',
          userTeam: userTeam
            ? { id: userTeam.id, name: userTeam.name }
            : null,
        };
      });

      return {
        ...league,
        leagueSeasons: leagueSeasonsEnhanced,
      };
    });
  }

  async getLeague(leagueId: string, userId: string) {
    // Get user to check if they're a system admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { systemRole: true },
    });

    // System admins can view any league
    const isAdmin = user?.systemRole === 'admin';

    const league = await this.prisma.league.findFirst({
      where: {
        id: leagueId,
        // Admins can view any league, others must be owner or member
        ...(isAdmin ? {} : {
          OR: [{ ownerId: userId }, { members: { some: { id: userId } } }],
        }),
      },
      include: {
        owner: true,
        members: true,
        commissioners: true,
        leagueSeasons: {
          include: {
            season: true,
            teams: {
              include: {
                owner: true,
                roster: {
                  include: {
                    castaway: true,
                  },
                },
              },
              orderBy: {
                totalPoints: 'desc',
              },
            },
          },
          orderBy: {
            season: {
              number: 'desc',
            },
          },
        },
      },
    });

    if (!league) {
      throw new NotFoundException(`League with ID ${leagueId} not found`);
    }

    return league;
  }

  async createLeague(userId: string, createDto: CreateLeagueDto) {
    // Find active or upcoming season
    const activeSeason = await this.prisma.season.findFirst({
      where: {
        status: {
          in: ['ACTIVE', 'UPCOMING'],
        },
      },
      orderBy: {
        number: 'desc',
      },
    });

    if (!activeSeason) {
      throw new NotFoundException(
        'No active or upcoming season found. Please create a season first.',
      );
    }

    // Get user info for team name
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate generic team name
    const teamName = user.name
      ? `${user.name}'s Team`
      : user.email
        ? `${user.email.split('@')[0]}'s Team`
        : 'Team';

    // Use transaction to ensure atomicity
    return this.prisma.$transaction(async (tx) => {
      // 1. Create league with the user as owner
      // Note: inviteEmails are stubbed - not processed yet
      const league = await tx.league.create({
        data: {
          name: createDto.name,
          description: createDto.description,
          ownerId: userId,
          commissioners: {
            connect: { id: userId },
          },
        },
        include: {
          owner: true,
          commissioners: true,
        },
      });

      // 2. Create LeagueSeason for the active season
      const leagueSeason = await tx.leagueSeason.create({
        data: {
          leagueId: league.id,
          seasonId: activeSeason.id,
        },
      });

      // 3. Create team for the owner
      await tx.team.create({
        data: {
          name: teamName,
          leagueSeasonId: leagueSeason.id,
          ownerId: userId,
          totalPoints: 0,
        },
      });

      // Return league with all related data
      return tx.league.findUnique({
        where: { id: league.id },
        include: {
          owner: true,
          members: true,
          commissioners: true,
          leagueSeasons: {
            include: {
              season: true,
              teams: {
                include: {
                  owner: true,
                },
              },
            },
          },
        },
      });
    });
  }

  async getLeagueSeasonSettings(leagueId: string, seasonId: string) {
    // Find the league season
    const leagueSeason = await this.prisma.leagueSeason.findUnique({
      where: {
        leagueId_seasonId: {
          leagueId,
          seasonId,
        },
      },
      include: {
        settings: true,
      },
    });

    if (!leagueSeason) {
      throw new NotFoundException(
        `LeagueSeason with leagueId ${leagueId} and seasonId ${seasonId} not found`,
      );
    }

    // Return settings if they exist, otherwise return null
    return leagueSeason.settings;
  }

  async updateLeagueSeasonSettings(
    leagueId: string,
    seasonId: string,
    updateDto: UpdateLeagueSeasonSettingsDto,
  ) {
    // Ensure league season exists
    const leagueSeason = await this.prisma.leagueSeason.findUnique({
      where: {
        leagueId_seasonId: {
          leagueId,
          seasonId,
        },
      },
    });

    if (!leagueSeason) {
      throw new NotFoundException(
        `LeagueSeason with leagueId ${leagueId} and seasonId ${seasonId} not found`,
      );
    }

    // Upsert settings (create if doesn't exist, update if it does)
    return this.prisma.leagueSeasonSettings.upsert({
      where: {
        leagueSeasonId: leagueSeason.id,
      },
      create: {
        leagueSeasonId: leagueSeason.id,
        settings: updateDto.settings || {},
      },
      update: {
        settings: updateDto.settings,
      },
    });
  }

  async getDraftConfig(
    leagueId: string,
    seasonId: string,
    roundNumber: number = 1,
  ) {
    // Find the league season
    const leagueSeason = await this.prisma.leagueSeason.findUnique({
      where: {
        leagueId_seasonId: {
          leagueId,
          seasonId,
        },
      },
    });

    if (!leagueSeason) {
      throw new NotFoundException(
        `LeagueSeason with leagueId ${leagueId} and seasonId ${seasonId} not found`,
      );
    }

    // Find draft config for the specified round
    const draftConfig = await this.prisma.draftConfig.findUnique({
      where: {
        leagueSeasonId_roundNumber: {
          leagueSeasonId: leagueSeason.id,
          roundNumber,
        },
      },
    });

    return draftConfig;
  }

  async updateDraftConfig(
    leagueId: string,
    seasonId: string,
    roundNumber: number,
    updateDto: UpdateDraftConfigDto,
  ) {
    // Ensure league season exists
    const leagueSeason = await this.prisma.leagueSeason.findUnique({
      where: {
        leagueId_seasonId: {
          leagueId,
          seasonId,
        },
      },
    });

    if (!leagueSeason) {
      throw new NotFoundException(
        `LeagueSeason with leagueId ${leagueId} and seasonId ${seasonId} not found`,
      );
    }

    // Use roundNumber from DTO if provided, otherwise use the one from params
    const finalRoundNumber = updateDto.roundNumber ?? roundNumber;

    // Prepare update data
    const updateData: any = {};
    if (updateDto.castawaysPerTeam !== undefined) {
      updateData.castawaysPerTeam = updateDto.castawaysPerTeam;
    }
    if (updateDto.draftDate !== undefined) {
      updateData.draftDate = updateDto.draftDate
        ? new Date(updateDto.draftDate)
        : null;
    }
    if (updateDto.status !== undefined) {
      updateData.status = updateDto.status;
    }

    // Upsert draft config
    return this.prisma.draftConfig.upsert({
      where: {
        leagueSeasonId_roundNumber: {
          leagueSeasonId: leagueSeason.id,
          roundNumber: finalRoundNumber,
        },
      },
      create: {
        leagueSeasonId: leagueSeason.id,
        roundNumber: finalRoundNumber,
        castawaysPerTeam: updateDto.castawaysPerTeam ?? 0,
        draftDate: updateDto.draftDate ? new Date(updateDto.draftDate) : null,
        status: updateDto.status ?? 'PENDING',
      },
      update: updateData,
    });
  }

  async joinLeague(userId: string, joinDto: JoinLeagueDto) {
    const { leagueId } = joinDto;

    // Verify league exists
    const league = await this.prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        owner: true,
        members: true,
      },
    });

    if (!league) {
      throw new NotFoundException(`League with ID ${leagueId} not found`);
    }

    // Check if user is already the owner
    if (league.ownerId === userId) {
      throw new BadRequestException('You are already the owner of this league');
    }

    // Check if user is already a member
    const isAlreadyMember = league.members.some(
      (member) => member.id === userId,
    );
    if (isAlreadyMember) {
      throw new ConflictException('You are already a member of this league');
    }

    // Find active or upcoming season
    const activeSeason = await this.prisma.season.findFirst({
      where: {
        status: {
          in: ['ACTIVE', 'UPCOMING'],
        },
      },
      orderBy: {
        number: 'desc',
      },
    });

    if (!activeSeason) {
      throw new NotFoundException('No active or upcoming season found');
    }

    // Get user info for team name
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate generic team name
    const teamName = user.name
      ? `${user.name}'s Team`
      : user.email
        ? `${user.email.split('@')[0]}'s Team`
        : 'Team';

    // Use transaction to ensure atomicity
    return this.prisma.$transaction(async (tx) => {
      // 1. Add user to league members
      await tx.league.update({
        where: { id: leagueId },
        data: {
          members: {
            connect: { id: userId },
          },
        },
      });

      // 2. Find or create LeagueSeason
      let leagueSeason = await tx.leagueSeason.findUnique({
        where: {
          leagueId_seasonId: {
            leagueId,
            seasonId: activeSeason.id,
          },
        },
      });

      if (!leagueSeason) {
        leagueSeason = await tx.leagueSeason.create({
          data: {
            leagueId,
            seasonId: activeSeason.id,
          },
        });
      }

      // 3. Check if user already has a team in this leagueSeason
      const existingTeam = await tx.team.findFirst({
        where: {
          leagueSeasonId: leagueSeason.id,
          ownerId: userId,
        },
      });

      if (existingTeam) {
        throw new ConflictException(
          'You already have a team in this league season',
        );
      }

      // 4. Create team
      await tx.team.create({
        data: {
          name: teamName,
          leagueSeasonId: leagueSeason.id,
          ownerId: userId,
          totalPoints: 0,
        },
        include: {
          owner: true,
          leagueSeason: {
            include: {
              season: true,
            },
          },
        },
      });

      // Return the league with updated members
      return tx.league.findUnique({
        where: { id: leagueId },
      include: {
        owner: true,
        members: true,
        commissioners: true,
        leagueSeasons: {
            include: {
              season: true,
              teams: {
                include: {
                  owner: true,
                },
              },
            },
          },
        },
      });
    });
  }

  async getStandings(leagueId: string, seasonId: string, userId: string) {
    // Find the league season
    const leagueSeason = await this.prisma.leagueSeason.findUnique({
      where: {
        leagueId_seasonId: {
          leagueId,
          seasonId,
        },
      },
    });

    if (!leagueSeason) {
      throw new NotFoundException(
        `LeagueSeason with leagueId ${leagueId} and seasonId ${seasonId} not found`,
      );
    }

    // Get all teams ordered by totalPoints
    const teams = await this.prisma.team.findMany({
      where: {
        leagueSeasonId: leagueSeason.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        totalPoints: 'desc',
      },
    });

    // Add rank and isCurrentUser flag
    const teamsWithRank = teams.map((team, index) => ({
      id: team.id,
      name: team.name,
      totalPoints: team.totalPoints,
      rank: index + 1,
      owner: team.owner,
      isCurrentUser: team.owner.id === userId,
    }));

    return {
      leagueSeasonId: leagueSeason.id,
      teams: teamsWithRank,
    };
  }

  async getMyTeam(leagueId: string, seasonId: string, userId: string) {
    // Find the league season
    const leagueSeason = await this.prisma.leagueSeason.findUnique({
      where: {
        leagueId_seasonId: {
          leagueId,
          seasonId,
        },
      },
    });

    if (!leagueSeason) {
      throw new NotFoundException(
        `LeagueSeason with leagueId ${leagueId} and seasonId ${seasonId} not found`,
      );
    }

    // Find user's team in this league season
    const team = await this.prisma.team.findFirst({
      where: {
        leagueSeasonId: leagueSeason.id,
        ownerId: userId,
      },
      include: {
        roster: {
          include: {
            castaway: true,
          },
        },
      },
    });

    if (!team) {
      // Check if user is a system admin - admins can view leagues without having a team
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { systemRole: true },
      });

      if (user?.systemRole === 'admin') {
        // Return null for admins who don't have a team (they're just viewing)
        return null;
      }

      throw new NotFoundException(
        'You do not have a team in this league season',
      );
    }

    // Count teams with higher points to get rank
    const teamsWithHigherPoints = await this.prisma.team.count({
      where: {
        leagueSeasonId: leagueSeason.id,
        totalPoints: {
          gt: team.totalPoints,
        },
      },
    });

    const rank = teamsWithHigherPoints + 1;

    // Count total teams
    const totalTeams = await this.prisma.team.count({
      where: {
        leagueSeasonId: leagueSeason.id,
      },
    });

    // Format roster with isActive flag
    const roster = team.roster.map((tc) => ({
      id: tc.id,
      castaway: {
        id: tc.castaway.id,
        name: tc.castaway.name,
        status: tc.castaway.status,
      },
      startEpisode: tc.startEpisode,
      endEpisode: tc.endEpisode,
      isActive: tc.endEpisode === null,
    }));

    // Calculate stats
    const activeCastaways = roster.filter((r) => r.isActive).length;
    const eliminatedCastaways = roster.filter((r) => !r.isActive).length;

    return {
      id: team.id,
      name: team.name,
      totalPoints: team.totalPoints,
      rank,
      totalTeams,
      leagueSeasonId: team.leagueSeasonId,
      roster,
      stats: {
        activeCastaways,
        eliminatedCastaways,
      },
    };
  }

  // Episode points calculation methods
  async calculateEpisodePoints(teamId: string, episodeNumber: number) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        leagueSeason: true,
        roster: true,
        answers: {
          where: {
            leagueQuestion: {
              episodeNumber,
              isScored: true,
            },
          },
          include: {
            leagueQuestion: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException(`Team with id ${teamId} not found`);
    }

    // Calculate question points: Sum of pointsEarned from answers
    const questionPoints = team.answers.reduce(
      (sum, answer) => sum + (answer.pointsEarned || 0),
      0,
    );

    // Get retention config for this episode
    const retentionConfig = await this.prisma.retentionConfig.findUnique({
      where: {
        leagueSeasonId_episodeNumber: {
          leagueSeasonId: team.leagueSeasonId,
          episodeNumber,
        },
      },
    });

    // Count active castaways for this episode
    const activeCastaways = team.roster.filter(
      (tc) =>
        tc.startEpisode <= episodeNumber &&
        (tc.endEpisode === null || tc.endEpisode >= episodeNumber),
    ).length;

    // Calculate retention points
    const retentionPoints =
      activeCastaways * (retentionConfig?.pointsPerCastaway || 0);

    return {
      questionPoints,
      retentionPoints,
      totalEpisodePoints: questionPoints + retentionPoints,
    };
  }

  async recalculateTeamHistory(teamId: string, maxEpisode: number) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        leagueSeason: {
          include: {
            season: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException(`Team with id ${teamId} not found`);
    }

    let runningTotal = 0;

    // Use transaction for atomicity
    await this.prisma.$transaction(async (tx) => {
      for (let ep = 1; ep <= maxEpisode; ep++) {
        const points = await this.calculateEpisodePoints(teamId, ep);

        runningTotal += points.totalEpisodePoints;

        // Upsert TeamEpisodePoints
        await tx.teamEpisodePoints.upsert({
          where: {
            teamId_episodeNumber: {
              teamId,
              episodeNumber: ep,
            },
          },
          create: {
            teamId,
            episodeNumber: ep,
            questionPoints: points.questionPoints,
            retentionPoints: points.retentionPoints,
            totalEpisodePoints: points.totalEpisodePoints,
            runningTotal,
          },
          update: {
            questionPoints: points.questionPoints,
            retentionPoints: points.retentionPoints,
            totalEpisodePoints: points.totalEpisodePoints,
            runningTotal,
          },
        });
      }

      // Update team's total points to match running total
      await tx.team.update({
        where: { id: teamId },
        data: { totalPoints: runningTotal },
      });
    });

    return { teamId, episodesRecalculated: maxEpisode, finalTotal: runningTotal };
  }

  async getDetailedStandings(
    leagueId: string,
    seasonId: string,
    userId: string,
    episodeFilter?: number,
  ) {
    const leagueSeason = await this.prisma.leagueSeason.findUnique({
      where: {
        leagueId_seasonId: {
          leagueId,
          seasonId,
        },
      },
      include: {
        season: true,
      },
    });

    if (!leagueSeason) {
      throw new NotFoundException(
        `LeagueSeason with leagueId ${leagueId} and seasonId ${seasonId} not found`,
      );
    }

    const currentEpisode = leagueSeason.season.activeEpisode;

    // Fetch all teams with episode points
    const teams = await this.prisma.team.findMany({
      where: {
        leagueSeasonId: leagueSeason.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        episodePoints: episodeFilter
          ? {
              where: { episodeNumber: episodeFilter },
              orderBy: { episodeNumber: 'asc' },
            }
          : {
              orderBy: { episodeNumber: 'asc' },
            },
        roster: {
          include: {
            castaway: true,
          },
        },
      },
      orderBy: {
        totalPoints: 'desc',
      },
    });

    // Calculate rank changes
    const teamsWithDetails = teams.map((team, index) => {
      const currentRank = index + 1;

      // Get previous episode running total to calculate previous rank
      let previousRank = currentRank;
      let rankChange = 0;

      // Only calculate rank change if we have a current episode and it's > 1
      if (currentEpisode && currentEpisode > 1) {
        const previousEpisodePoints = team.episodePoints.find(
          (ep) => ep.episodeNumber === currentEpisode - 1,
        );

        if (previousEpisodePoints) {
          const previousTotal = previousEpisodePoints.runningTotal;

          // Count how many teams had higher points in the previous episode
          const teamsWithHigherPreviousTotal = teams.filter((t) => {
            const prevEp = t.episodePoints.find(
              (ep) => ep.episodeNumber === currentEpisode - 1,
            );
            return prevEp && prevEp.runningTotal > previousTotal;
          }).length;

          previousRank = teamsWithHigherPreviousTotal + 1;
          rankChange = previousRank - currentRank;
        }
      }

      return {
        id: team.id,
        name: team.name,
        totalPoints: team.totalPoints,
        rank: currentRank,
        rankChange,
        owner: team.owner,
        isCurrentUser: team.owner.id === userId,
        episodeHistory: team.episodePoints.map((ep) => ({
          episodeNumber: ep.episodeNumber,
          questionPoints: ep.questionPoints,
          retentionPoints: ep.retentionPoints,
          totalEpisodePoints: ep.totalEpisodePoints,
          runningTotal: ep.runningTotal,
        })),
        roster: team.roster.map((tc) => ({
          id: tc.id,
          castawayId: tc.castawayId,
          castawayName: tc.castaway.name,
          startEpisode: tc.startEpisode,
          endEpisode: tc.endEpisode,
          isActive: tc.endEpisode === null,
        })),
      };
    });

    return {
      leagueSeasonId: leagueSeason.id,
      currentEpisode,
      teams: teamsWithDetails,
    };
  }

  async getRetentionConfig(leagueId: string, seasonId: string) {
    const leagueSeason = await this.prisma.leagueSeason.findUnique({
      where: {
        leagueId_seasonId: {
          leagueId,
          seasonId,
        },
      },
    });

    if (!leagueSeason) {
      throw new NotFoundException(
        `LeagueSeason with leagueId ${leagueId} and seasonId ${seasonId} not found`,
      );
    }

    const configs = await this.prisma.retentionConfig.findMany({
      where: {
        leagueSeasonId: leagueSeason.id,
      },
      orderBy: {
        episodeNumber: 'asc',
      },
    });

    return configs;
  }

  async updateRetentionConfig(
    leagueId: string,
    seasonId: string,
    dto: { episodes: Array<{ episodeNumber: number; pointsPerCastaway: number }> },
  ) {
    const leagueSeason = await this.prisma.leagueSeason.findUnique({
      where: {
        leagueId_seasonId: {
          leagueId,
          seasonId,
        },
      },
    });

    if (!leagueSeason) {
      throw new NotFoundException(
        `LeagueSeason with leagueId ${leagueId} and seasonId ${seasonId} not found`,
      );
    }

    // Upsert retention configs for each episode
    await Promise.all(
      dto.episodes.map((episode) =>
        this.prisma.retentionConfig.upsert({
          where: {
            leagueSeasonId_episodeNumber: {
              leagueSeasonId: leagueSeason.id,
              episodeNumber: episode.episodeNumber,
            },
          },
          create: {
            leagueSeasonId: leagueSeason.id,
            episodeNumber: episode.episodeNumber,
            pointsPerCastaway: episode.pointsPerCastaway,
          },
          update: {
            pointsPerCastaway: episode.pointsPerCastaway,
          },
        }),
      ),
    );

    // Return updated configs
    return this.getRetentionConfig(leagueId, seasonId);
  }

  async recalculateAllEpisodePoints(leagueId: string, seasonId: string) {
    const leagueSeason = await this.prisma.leagueSeason.findUnique({
      where: {
        leagueId_seasonId: {
          leagueId,
          seasonId,
        },
      },
      include: {
        season: true,
        teams: true,
      },
    });

    if (!leagueSeason) {
      throw new NotFoundException(
        `LeagueSeason with leagueId ${leagueId} and seasonId ${seasonId} not found`,
      );
    }

    const maxEpisode = leagueSeason.season.activeEpisode;

    // Recalculate for each team
    await Promise.all(
      leagueSeason.teams.map((team) =>
        this.recalculateTeamHistory(team.id, maxEpisode),
      ),
    );

    return {
      success: true,
      teamsRecalculated: leagueSeason.teams.length,
      episodes: maxEpisode,
    };
  }

  // Invite token methods
  async generateInviteLink(leagueId: string, userId: string) {
    // Verify user is commissioner
    const league = await this.prisma.league.findUnique({
      where: { id: leagueId },
      select: {
        ownerId: true,
        commissioners: {
          select: { id: true },
        },
      },
    });

    if (!league) {
      throw new NotFoundException(`League with ID ${leagueId} not found`);
    }

    const isOwner = league.ownerId === userId;
    const isCommissioner = league.commissioners.some(
      (c) => c.id === userId,
    );

    if (!isOwner && !isCommissioner) {
      throw new ForbiddenException(
        'You must be a league commissioner to generate invite links',
      );
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiration

    const inviteToken = await this.prisma.inviteToken.create({
      data: {
        leagueId,
        token,
        createdById: userId,
        expiresAt,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Return token and shareable link
    return {
      id: inviteToken.id,
      token: inviteToken.token,
      link: `/leagues/join/${inviteToken.token}`,
      expiresAt: inviteToken.expiresAt,
      createdAt: inviteToken.createdAt,
      usedAt: inviteToken.usedAt,
      createdBy: inviteToken.createdBy,
    };
  }

  async validateInviteToken(token: string) {
    const inviteToken = await this.prisma.inviteToken.findUnique({
      where: { token },
      include: {
        league: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!inviteToken) {
      throw new NotFoundException('Invalid invite token');
    }

    if (inviteToken.usedAt) {
      throw new BadRequestException('This invite link has already been used');
    }

    if (new Date() > inviteToken.expiresAt) {
      throw new BadRequestException('This invite link has expired');
    }

    return {
      leagueId: inviteToken.leagueId,
      league: inviteToken.league,
      expiresAt: inviteToken.expiresAt,
    };
  }

  async getInviteLinks(leagueId: string, userId: string) {
    // Verify user is commissioner
    const league = await this.prisma.league.findUnique({
      where: { id: leagueId },
      select: {
        ownerId: true,
        commissioners: {
          select: { id: true },
        },
      },
    });

    if (!league) {
      throw new NotFoundException(`League with ID ${leagueId} not found`);
    }

    const isOwner = league.ownerId === userId;
    const isCommissioner = league.commissioners.some(
      (c) => c.id === userId,
    );

    if (!isOwner && !isCommissioner) {
      throw new ForbiddenException(
        'You must be a league commissioner to view invite links',
      );
    }

    const tokens = await this.prisma.inviteToken.findMany({
      where: { leagueId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tokens.map((token) => ({
      id: token.id,
      token: token.token,
      link: `/leagues/join/${token.token}`,
      expiresAt: token.expiresAt,
      createdAt: token.createdAt,
      usedAt: token.usedAt,
      usedById: token.usedById,
      createdBy: token.createdBy,
      isValid: !token.usedAt && new Date() < token.expiresAt,
    }));
  }

  async revokeInviteToken(tokenId: string, userId: string) {
    const inviteToken = await this.prisma.inviteToken.findUnique({
      where: { id: tokenId },
      include: {
        league: {
          select: {
            ownerId: true,
            commissioners: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!inviteToken) {
      throw new NotFoundException('Invite token not found');
    }

    // Verify user is commissioner
    const isOwner = inviteToken.league.ownerId === userId;
    const isCommissioner = inviteToken.league.commissioners.some(
      (c) => c.id === userId,
    );

    if (!isOwner && !isCommissioner) {
      throw new ForbiddenException(
        'You must be a league commissioner to revoke invite links',
      );
    }

    // Delete the token
    await this.prisma.inviteToken.delete({
      where: { id: tokenId },
    });

    return { success: true };
  }

  async inviteByEmail(leagueId: string, emails: string[], userId: string) {
    // Verify user is commissioner
    const league = await this.prisma.league.findUnique({
      where: { id: leagueId },
      select: {
        ownerId: true,
        commissioners: {
          select: { id: true },
        },
      },
    });

    if (!league) {
      throw new NotFoundException(`League with ID ${leagueId} not found`);
    }

    const isOwner = league.ownerId === userId;
    const isCommissioner = league.commissioners.some(
      (c) => c.id === userId,
    );

    if (!isOwner && !isCommissioner) {
      throw new ForbiddenException(
        'You must be a league commissioner to invite members',
      );
    }

    // For now, just return success - email sending can be implemented later
    // The emails are stored for tracking purposes
    return {
      success: true,
      emails,
      message: 'Invitations will be sent manually via shareable links',
    };
  }

  async joinLeagueByToken(userId: string, token: string) {
    // Validate token
    const tokenData = await this.validateInviteToken(token);

    const leagueId = tokenData.leagueId;

    // Check if user is already a member
    const league = await this.prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        owner: true,
        members: true,
      },
    });

    if (!league) {
      throw new NotFoundException(`League with ID ${leagueId} not found`);
    }

    // Check if user is already the owner
    if (league.ownerId === userId) {
      throw new BadRequestException('You are already the owner of this league');
    }

    // Check if user is already a member
    const isAlreadyMember = league.members.some(
      (member) => member.id === userId,
    );
    if (isAlreadyMember) {
      throw new ConflictException('You are already a member of this league');
    }

    // Find active or upcoming season
    const activeSeason = await this.prisma.season.findFirst({
      where: {
        status: {
          in: ['ACTIVE', 'UPCOMING'],
        },
      },
      orderBy: {
        number: 'desc',
      },
    });

    if (!activeSeason) {
      throw new NotFoundException('No active or upcoming season found');
    }

    // Get user info for team name
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate generic team name
    const teamName = user.name
      ? `${user.name}'s Team`
      : user.email
        ? `${user.email.split('@')[0]}'s Team`
        : 'Team';

    // Use transaction to ensure atomicity
    return this.prisma.$transaction(async (tx) => {
      // 1. Add user to league members
      await tx.league.update({
        where: { id: leagueId },
        data: {
          members: {
            connect: { id: userId },
          },
        },
      });

      // 2. Mark token as used
      await tx.inviteToken.update({
        where: { token },
        data: {
          usedAt: new Date(),
          usedById: userId,
        },
      });

      // 3. Find or create LeagueSeason
      let leagueSeason = await tx.leagueSeason.findUnique({
        where: {
          leagueId_seasonId: {
            leagueId,
            seasonId: activeSeason.id,
          },
        },
      });

      if (!leagueSeason) {
        leagueSeason = await tx.leagueSeason.create({
          data: {
            leagueId,
            seasonId: activeSeason.id,
          },
        });
      }

      // 4. Check if user already has a team in this leagueSeason
      const existingTeam = await tx.team.findFirst({
        where: {
          leagueSeasonId: leagueSeason.id,
          ownerId: userId,
        },
      });

      if (existingTeam) {
        throw new ConflictException(
          'You already have a team in this league season',
        );
      }

      // 5. Create team
      await tx.team.create({
        data: {
          name: teamName,
          leagueSeasonId: leagueSeason.id,
          ownerId: userId,
          totalPoints: 0,
        },
        include: {
          owner: true,
          leagueSeason: {
            include: {
              season: true,
            },
          },
        },
      });

      // Return the league with updated members
      return tx.league.findUnique({
        where: { id: leagueId },
        include: {
          owner: true,
          members: true,
          commissioners: true,
          leagueSeasons: {
            include: {
              season: true,
              teams: {
                include: {
                  owner: true,
                },
              },
            },
          },
        },
      });
    });
  }

  // Commissioner management methods
  async addCommissioner(
    leagueId: string,
    userId: string,
    newCommissionerId: string,
  ) {
    // Check if user is a system admin
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { systemRole: true },
    });
    const isAdmin = currentUser?.systemRole === 'admin';

    // Verify current user is commissioner (or admin)
    const league = await this.prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        owner: true,
        commissioners: true,
        members: true,
      },
    });

    if (!league) {
      throw new NotFoundException(`League with ID ${leagueId} not found`);
    }

    const isOwner = league.ownerId === userId;
    const isCommissioner = league.commissioners.some(
      (c) => c.id === userId,
    );

    if (!isAdmin && !isOwner && !isCommissioner) {
      throw new ForbiddenException(
        'You must be a league commissioner to add commissioners',
      );
    }

    // Can't add owner as commissioner (they already are)
    if (league.ownerId === newCommissionerId) {
      throw new BadRequestException(
        'The league owner is already a commissioner',
      );
    }

    // Check if user is already a commissioner
    const isAlreadyCommissioner = league.commissioners.some(
      (c) => c.id === newCommissionerId,
    );
    if (isAlreadyCommissioner) {
      throw new ConflictException('User is already a commissioner');
    }

    // Check if user is a member of the league
    const isMember = league.members.some((m) => m.id === newCommissionerId);
    if (!isMember && league.ownerId !== newCommissionerId) {
      throw new BadRequestException(
        'User must be a league member before becoming a commissioner',
      );
    }

    // Add to commissioners
    await this.prisma.league.update({
      where: { id: leagueId },
      data: {
        commissioners: {
          connect: { id: newCommissionerId },
        },
      },
    });

    // Return updated commissioners list
    return this.getCommissioners(leagueId);
  }

  async removeCommissioner(
    leagueId: string,
    userId: string,
    commissionerId: string,
  ) {
    // Check if user is a system admin
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { systemRole: true },
    });
    const isAdmin = currentUser?.systemRole === 'admin';

    // Verify current user is commissioner (or admin)
    const league = await this.prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        owner: true,
        commissioners: true,
      },
    });

    if (!league) {
      throw new NotFoundException(`League with ID ${leagueId} not found`);
    }

    const isOwner = league.ownerId === userId;
    const isCommissioner = league.commissioners.some(
      (c) => c.id === userId,
    );

    if (!isAdmin && !isOwner && !isCommissioner) {
      throw new ForbiddenException(
        'You must be a league commissioner to remove commissioners',
      );
    }

    // Can't remove owner from commissioners
    if (league.ownerId === commissionerId) {
      throw new BadRequestException('Cannot remove the league owner from commissioners');
    }

    // Check if user is actually a commissioner
    const isCommissionerToRemove = league.commissioners.some(
      (c) => c.id === commissionerId,
    );
    if (!isCommissionerToRemove) {
      throw new NotFoundException('User is not a commissioner');
    }

    // Remove from commissioners
    await this.prisma.league.update({
      where: { id: leagueId },
      data: {
        commissioners: {
          disconnect: { id: commissionerId },
        },
      },
    });

    return { success: true };
  }

  async getCommissioners(leagueId: string) {
    const league = await this.prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        commissioners: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!league) {
      throw new NotFoundException(`League with ID ${leagueId} not found`);
    }

    return {
      owner: league.owner,
      commissioners: league.commissioners,
    };
  }

  async getDraftPageData(
    leagueId: string,
    seasonId: string,
    roundNumber: number,
    userId: string,
  ) {
    // 1. Get league season
    const leagueSeason = await this.prisma.leagueSeason.findUnique({
      where: {
        leagueId_seasonId: { leagueId, seasonId },
      },
      include: {
        season: {
          include: { castaways: true },
        },
        teams: {
          include: {
            owner: true,
            roster: {
              where: { endEpisode: null },
              include: { castaway: true },
            },
          },
        },
      },
    });

    if (!leagueSeason) {
      throw new NotFoundException('League season not found');
    }

    // 2. Get draft config
    const draftConfig = await this.prisma.draftConfig.findUnique({
      where: {
        leagueSeasonId_roundNumber: {
          leagueSeasonId: leagueSeason.id,
          roundNumber,
        },
      },
    });

    if (!draftConfig) {
      throw new NotFoundException('Draft configuration not found');
    }

    // 3. Find user's team
    const userTeam = leagueSeason.teams.find((t) => t.owner.id === userId);

    if (!userTeam) {
      throw new NotFoundException('You do not have a team in this league');
    }

    // 4. Calculate team completion status
    const leagueProgress = leagueSeason.teams.map((team) => ({
      teamId: team.id,
      teamName: team.name,
      ownerName: team.owner.name || team.owner.email,
      hasCompleted: team.roster.length === draftConfig.castawaysPerTeam,
      rosterCount: team.roster.length,
    }));

    return {
      draftConfig,
      castaways: leagueSeason.season.castaways,
      userTeam: {
        id: userTeam.id,
        name: userTeam.name,
        ownerId: userTeam.ownerId,
      },
      currentRoster: userTeam.roster.map((r) => ({
        id: r.id,
        castaway: r.castaway,
        startEpisode: r.startEpisode,
        endEpisode: r.endEpisode,
        isActive: r.endEpisode === null,
      })),
      leagueProgress,
    };
  }
}

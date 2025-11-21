import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateLeagueSeasonSettingsDto } from './dto/update-league-season-settings.dto';
import { UpdateDraftConfigDto } from './dto/update-draft-config.dto';
import { CreateLeagueDto } from './dto/create-league.dto';

@Injectable()
export class LeagueService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeagues(userId: string) {
    return this.prisma.league.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { id: userId } } },
        ],
      },
      include: {
        owner: true,
        members: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getLeague(leagueId: string, userId: string) {
    const league = await this.prisma.league.findFirst({
      where: {
        id: leagueId,
        OR: [
          { ownerId: userId },
          { members: { some: { id: userId } } },
        ],
      },
      include: {
        owner: true,
        members: true,
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
    // Create league with the user as owner
    // Note: inviteEmails are stubbed - not processed yet
    const league = await this.prisma.league.create({
      data: {
        name: createDto.name,
        description: createDto.description,
        ownerId: userId,
      },
      include: {
        owner: true,
      },
    });

    return league;
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
}


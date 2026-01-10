import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateLeagueSeasonSettingsDto } from './dto/update-league-season-settings.dto';
import { UpdateDraftConfigDto } from './dto/update-draft-config.dto';
import { CreateLeagueDto } from './dto/create-league.dto';
import { JoinLeagueDto } from './dto/join-league.dto';

@Injectable()
export class LeagueService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeagues(userId: string) {
    return this.prisma.league.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { id: userId } } }],
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
        OR: [{ ownerId: userId }, { members: { some: { id: userId } } }],
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
        },
        include: {
          owner: true,
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
}

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCastawayDto } from './dto/add-castaway.dto';
import { BulkAddCastawaysDto } from './dto/bulk-add-castaways.dto';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  async addCastaway(teamId: string, addCastawayDto: AddCastawayDto) {
    const { castawayId } = addCastawayDto;

    // 1. Get Team and Season info
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
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    const season = team.leagueSeason.season;
    const activeEpisode = season.activeEpisode;

    // 2. Check if castaway is already on the team (currently active)
    const existing = await this.prisma.teamCastaway.findFirst({
      where: {
        teamId,
        castawayId,
        endEpisode: null,
      },
    });

    if (existing) {
      throw new BadRequestException('Castaway is already on this team');
    }

    // 3. Add Castaway
    return this.prisma.teamCastaway.create({
      data: {
        teamId,
        castawayId,
        startEpisode: activeEpisode,
        endEpisode: null,
      },
      include: {
        castaway: true,
      },
    });
  }

  async removeCastaway(teamId: string, castawayId: string) {
    // 1. Get Team and Season info
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
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    const season = team.leagueSeason.season;
    const activeEpisode = season.activeEpisode;

    // 2. Find active roster entry
    const activeEntry = await this.prisma.teamCastaway.findFirst({
      where: {
        teamId,
        castawayId,
        endEpisode: null,
      },
    });

    if (!activeEntry) {
      throw new NotFoundException(
        'Castaway is not currently active on this team',
      );
    }

    // 3. "Close" the roster entry
    // If they were added THIS week, effectively delete the record?
    // Or just set end = start - 1?
    // If startEpisode == activeEpisode, and we remove them, they were never really on the team for a scored episode.
    // But keeping the record shows they were drafted and dropped.
    
    // Logic: endEpisode = activeEpisode - 1.
    // If activeEpisode is 1, endEpisode becomes 0.
    
    return this.prisma.teamCastaway.update({
      where: { id: activeEntry.id },
      data: {
        endEpisode: activeEpisode - 1,
      },
    });
  }

  async getTeam(id: string) {
    return this.prisma.team.findUnique({
      where: { id },
      include: {
        roster: {
          include: {
            castaway: true,
          },
          where: {
             endEpisode: null
          }
        },
        owner: true,
      }
    });
  }

  async bulkAddCastaways(teamId: string, bulkDto: BulkAddCastawaysDto) {
    // 1. Get team with season to find activeEpisode
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        leagueSeason: {
          include: { season: true }
        }
      }
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const activeEpisode = team.leagueSeason.season.activeEpisode;

    // 2. Check for existing roster entries (prevent duplicates)
    const existingRoster = await this.prisma.teamCastaway.findMany({
      where: {
        teamId,
        castawayId: { in: bulkDto.castawayIds },
        endEpisode: null
      }
    });

    if (existingRoster.length > 0) {
      throw new ConflictException('Some castaways already on team');
    }

    // 3. Bulk create in transaction
    return this.prisma.$transaction(
      bulkDto.castawayIds.map(castawayId =>
        this.prisma.teamCastaway.create({
          data: {
            teamId,
            castawayId,
            startEpisode: activeEpisode
          },
          include: { castaway: true }
        })
      )
    );
  }

  async replaceCastaways(
    teamId: string,
    bulkDto: BulkAddCastawaysDto,
    currentEpisode: number
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Close all existing active roster entries
      await tx.teamCastaway.updateMany({
        where: {
          teamId,
          endEpisode: null
        },
        data: {
          endEpisode: currentEpisode - 1
        }
      });

      // 2. Create new roster entries
      return Promise.all(
        bulkDto.castawayIds.map(castawayId =>
          tx.teamCastaway.create({
            data: {
              teamId,
              castawayId,
              startEpisode: currentEpisode
            },
            include: { castaway: true }
          })
        )
      );
    });
  }
}


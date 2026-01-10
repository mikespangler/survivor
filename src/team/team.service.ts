import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCastawayDto } from './dto/add-castaway.dto';

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
}


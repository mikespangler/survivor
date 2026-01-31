import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers(skip = 0, take = 50) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
    return { users, total };
  }

  async getAllLeagues(skip = 0, take = 50) {
    const [leagues, total] = await Promise.all([
      this.prisma.league.findMany({
        skip,
        take,
        include: {
          owner: true,
          members: true,
          leagueSeasons: {
            include: { season: true },
            orderBy: { season: { number: 'desc' } },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.league.count(),
    ]);
    return { leagues, total };
  }

  async getAnyLeague(leagueId: string) {
    // Same as LeagueService.getLeague but WITHOUT user access check
    const league = await this.prisma.league.findUnique({
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
}

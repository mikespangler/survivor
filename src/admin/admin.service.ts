import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeagueMemberResponse } from './dto/league-member-response.dto';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

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

  async getLeagueMembers(leagueId: string): Promise<LeagueMemberResponse[]> {
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
              },
            },
          },
          orderBy: {
            season: {
              number: 'desc',
            },
          },
          take: 1,
        },
      },
    });

    if (!league) {
      throw new NotFoundException(`League with ID ${leagueId} not found`);
    }

    const activeSeason = league.leagueSeasons[0];

    return league.members.map((member) => {
      const team = activeSeason?.teams.find((t) => t.ownerId === member.id);
      return {
        id: member.id,
        name: member.name,
        email: member.email,
        isOwner: member.id === league.ownerId,
        isCommissioner: league.commissioners.some((c) => c.id === member.id),
        team: team
          ? {
              id: team.id,
              name: team.name,
            }
          : null,
        joinedAt: team?.createdAt || new Date(),
      };
    });
  }

  async addMemberToLeague(
    leagueId: string,
    userId: string,
    adminId: string,
  ): Promise<{ member: any; team: any }> {
    const league = await this.getAnyLeague(leagueId);

    // Check if already member
    const isMember = league.members.some((m) => m.id === userId);
    if (isMember) {
      throw new BadRequestException('User is already a member');
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
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

    // Add to league
    return this.prisma.$transaction(async (tx) => {
      // Add to members relation
      await tx.league.update({
        where: { id: leagueId },
        data: {
          members: {
            connect: { id: userId },
          },
        },
      });

      // Find or create LeagueSeason
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

      // Create team for active season
      const teamName = user.name
        ? `${user.name}'s Team`
        : user.email
          ? `${user.email.split('@')[0]}'s Team`
          : 'Team';

      const team = await tx.team.create({
        data: {
          name: teamName,
          leagueSeasonId: leagueSeason.id,
          ownerId: userId,
          totalPoints: 0,
        },
      });

      return { member: user, team };
    });
  }

  async removeMemberFromLeague(
    leagueId: string,
    userId: string,
    adminId: string,
  ): Promise<void> {
    const league = await this.getAnyLeague(leagueId);

    // Can't remove owner
    if (league.ownerId === userId) {
      throw new BadRequestException('Cannot remove league owner');
    }

    // Check if actually a member
    const isMember = league.members.some((m) => m.id === userId);
    if (!isMember) {
      throw new BadRequestException('User is not a member');
    }

    await this.prisma.$transaction(async (tx) => {
      // Remove from members
      await tx.league.update({
        where: { id: leagueId },
        data: {
          members: {
            disconnect: { id: userId },
          },
        },
      });

      // Remove from commissioners if applicable
      await tx.league.update({
        where: { id: leagueId },
        data: {
          commissioners: {
            disconnect: { id: userId },
          },
        },
      });

      // NOTE: Teams and answers remain for historical data
    });
  }

  async searchUsers(query: string): Promise<any[]> {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
      select: {
        id: true,
        name: true,
        email: true,
        systemRole: true,
      },
    });
  }

  async sendEmailInvites(
    leagueId: string,
    emails: string[],
    adminId: string,
  ): Promise<{ invited: string[]; alreadyMembers: string[] }> {
    const league = await this.getAnyLeague(leagueId);
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });

    if (!admin) {
      throw new NotFoundException('Admin user not found');
    }

    // Check which emails are already members
    const existingMembers = await this.prisma.user.findMany({
      where: {
        email: { in: emails },
        memberLeagues: { some: { id: leagueId } },
      },
      select: { email: true },
    });
    const alreadyMembers = existingMembers.map((u) => u.email);
    const toInvite = emails.filter((e) => !alreadyMembers.includes(e));

    // Generate tokens and send emails
    const invited = [];
    for (const email of toInvite) {
      // Generate token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiration

      const inviteToken = await this.prisma.inviteToken.create({
        data: {
          leagueId,
          token,
          createdById: adminId,
          expiresAt,
        },
      });

      // Send email
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      await this.emailService.sendLeagueInvite({
        to: email,
        leagueName: league.name,
        leagueDescription: league.description,
        inviterName: admin.name || admin.email || 'Admin',
        joinUrl: `${frontendUrl}/leagues/join/${inviteToken.token}`,
        expiresAt: inviteToken.expiresAt,
      });

      invited.push(email);
    }

    return { invited, alreadyMembers };
  }
}

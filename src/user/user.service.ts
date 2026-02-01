import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// Emails that always get admin privileges
const ADMIN_EMAILS = ['spangler.mike@gmail.com'];

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id); // Ensure user exists

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure user exists

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async findByClerkId(clerkId: string) {
    return this.prisma.user.findUnique({
      where: { clerkId },
    });
  }

  async upsertFromClerk(clerkUser: {
    clerkId: string;
    email: string | null;
    name: string | null;
  }) {
    // Check if this email should always be admin
    const shouldBeAdmin =
      clerkUser.email && ADMIN_EMAILS.includes(clerkUser.email.toLowerCase());

    // Try to find existing user by clerkId
    const existingUser = await this.findByClerkId(clerkUser.clerkId);

    if (existingUser) {
      // Don't override name if user has set it - only update email and admin role
      // This decouples the user's display name from Clerk
      return this.prisma.user.update({
        where: { clerkId: clerkUser.clerkId },
        data: {
          email: clerkUser.email,
          ...(shouldBeAdmin && { systemRole: 'admin' }),
        },
      });
    }

    // Create new user (Just-in-Time sync)
    // Only use Clerk name for initial creation
    return this.prisma.user.create({
      data: {
        clerkId: clerkUser.clerkId,
        email: clerkUser.email,
        name: clerkUser.name,
        systemRole: shouldBeAdmin ? 'admin' : 'user',
      },
    });
  }

  async updateLastViewedLeague(userId: string, leagueId: string | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastViewedLeagueId: leagueId },
    });
  }

  async getLastViewedLeague(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        lastViewedLeagueId: true,
        lastViewedLeague: {
          include: {
            owner: true,
            members: true,
            leagueSeasons: {
              include: { season: true },
              orderBy: { season: { number: 'desc' } },
              take: 1,
            },
          },
        },
      },
    });

    return user?.lastViewedLeague || null;
  }

  async getUserTeams(userId: string) {
    return this.prisma.team.findMany({
      where: { ownerId: userId },
      include: {
        leagueSeason: {
          include: {
            league: true,
            season: true,
          },
        },
      },
      orderBy: { leagueSeason: { league: { name: 'asc' } } },
    });
  }
}

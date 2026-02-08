import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LeagueMemberGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Get leagueId from route params
    const leagueId = request.params.leagueId || request.params.id;

    if (!leagueId) {
      throw new ForbiddenException('League ID not found in request');
    }

    // Always resolve slug to real id so downstream code works correctly
    // Supports both id and slug lookups
    const league = await this.prisma.league.findFirst({
      where: { OR: [{ id: leagueId }, { slug: leagueId }] },
      select: {
        id: true,
        ownerId: true,
        members: {
          select: { id: true },
        },
      },
    });

    if (!league) {
      throw new NotFoundException(`League with ID ${leagueId} not found`);
    }

    // Replace the param with the resolved real id so downstream code uses it
    if (request.params.id) request.params.id = league.id;
    if (request.params.leagueId) request.params.leagueId = league.id;

    // System admins can do anything (after slug resolution)
    if (user?.systemRole === 'admin') {
      return true;
    }

    // Check if user is owner or member
    const isOwner = league.ownerId === user.id;
    const isMember = league.members.some((member) => member.id === user.id);

    if (!isOwner && !isMember) {
      throw new ForbiddenException(
        'You must be a league member to perform this action',
      );
    }

    return true;
  }
}

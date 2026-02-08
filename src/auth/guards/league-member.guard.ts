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

    // System admins can do anything
    if (user?.systemRole === 'admin') {
      return true;
    }

    // Get leagueId from route params
    const leagueId = request.params.leagueId || request.params.id;

    if (!leagueId) {
      throw new ForbiddenException('League ID not found in request');
    }

    // Check if league exists and if user is the owner or a member
    const league = await this.prisma.league.findUnique({
      where: { id: leagueId },
      select: {
        ownerId: true,
        members: {
          select: { id: true },
        },
      },
    });

    if (!league) {
      throw new NotFoundException(`League with ID ${leagueId} not found`);
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

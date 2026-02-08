import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LeagueCommissionerOrAdminGuard implements CanActivate {
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

    // Check if league exists and if user is the owner or a commissioner
    // Supports both id and slug lookups
    const league = await this.prisma.league.findFirst({
      where: { OR: [{ id: leagueId }, { slug: leagueId }] },
      select: {
        id: true,
        ownerId: true,
        commissioners: {
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

    // Owner is automatically a commissioner
    const isOwner = league.ownerId === user.id;
    const isCommissioner = league.commissioners.some(
      (commissioner) => commissioner.id === user.id,
    );

    if (!isOwner && !isCommissioner) {
      throw new ForbiddenException(
        'You must be a league commissioner to perform this action',
      );
    }

    return true;
  }
}

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LeagueOwnerOrAdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

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

    // Check if league exists and if user is the owner
    const league = await this.prisma.league.findUnique({
      where: { id: leagueId },
      select: { ownerId: true },
    });

    if (!league) {
      throw new NotFoundException(`League with ID ${leagueId} not found`);
    }

    if (league.ownerId !== user.id) {
      throw new ForbiddenException(
        'You must be the league owner to perform this action',
      );
    }

    return true;
  }
}


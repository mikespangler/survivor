import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TeamOwnerOrAdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // System admins can do anything
    if (user?.systemRole === 'admin') {
      return true;
    }

    // Get teamId from route params
    const teamId = request.params.teamId || request.params.id;

    if (!teamId) {
      throw new ForbiddenException('Team ID not found in request');
    }

    // Check if team exists and if user is the owner
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: { ownerId: true },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    if (team.ownerId !== user.id) {
      throw new ForbiddenException(
        'You must be the team owner to perform this action',
      );
    }

    return true;
  }
}


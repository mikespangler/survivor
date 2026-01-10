import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClerkService } from './clerk.service';
import { UserService } from '../user/user.service';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private clerkService: ClerkService,
    private userService: UserService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.substring(7);

    try {
      // Verify token with Clerk
      const decoded = await this.clerkService.verifyToken(token);

      // Just-in-Time user sync: get or create user in our database
      const clerkUserData = await this.clerkService.getUserFromClerk(
        decoded.sub,
      );
      const user = await this.userService.upsertFromClerk(clerkUserData);

      // Attach user to request
      request.user = user;

      return true;
    } catch (error) {
      console.error('Auth guard error:', error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      throw new UnauthorizedException(
        error?.message || 'Invalid or expired token',
      );
    }
  }
}

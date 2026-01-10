import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class SystemAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.systemRole !== 'admin') {
      throw new ForbiddenException(
        'You must be a system administrator to perform this action',
      );
    }

    return true;
  }
}

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AnalyticsService } from './analytics.service';

@Injectable()
export class ActivityTrackingInterceptor implements NestInterceptor {
  constructor(private readonly analyticsService: AnalyticsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(() => {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id;

        if (userId) {
          // Fire-and-forget — don't await, don't block
          this.analyticsService.trackEvent(userId, 'APP_VISIT').catch(() => {
            // Silently ignore tracking failures
          });
        }
      }),
    );
  }
}

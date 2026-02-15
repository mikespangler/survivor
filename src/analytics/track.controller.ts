import { Controller, Post, Body, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { TrackEventDto } from './dto/track-event.dto';

@Controller('analytics')
export class TrackController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track')
  async trackEvent(@Req() req: any, @Body() dto: TrackEventDto) {
    const userId = req.user?.id;
    if (!userId) return { success: false };

    await this.analyticsService.trackEvent(userId, dto.action, {
      page: dto.page,
      ...dto.metadata,
    });

    return { success: true };
  }
}

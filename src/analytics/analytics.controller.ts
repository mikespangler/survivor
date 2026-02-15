import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SystemAdminGuard } from '../auth/guards/system-admin.guard';
import { AnalyticsService } from './analytics.service';
import { DateRangeQueryDto } from './dto/date-range-query.dto';

@Controller('admin/analytics')
@UseGuards(SystemAdminGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async getOverview() {
    return this.analyticsService.getOverview();
  }

  @Get('growth')
  async getGrowth(@Query() query: DateRangeQueryDto) {
    return this.analyticsService.getGrowth(
      query.from,
      query.to,
      query.granularity,
    );
  }

  @Get('engagement')
  async getEngagement() {
    return this.analyticsService.getEngagement();
  }

  @Get('retention')
  async getRetention(@Query() query: DateRangeQueryDto) {
    return this.analyticsService.getRetention(
      query.from,
      query.to,
      query.granularity,
    );
  }

  @Get('leagues')
  async getLeagueHealth() {
    return this.analyticsService.getLeagueHealth();
  }

  @Get('invites')
  async getInviteFunnel(@Query() query: DateRangeQueryDto) {
    return this.analyticsService.getInviteFunnel(
      query.from,
      query.to,
      query.granularity,
    );
  }

  @Get('ghost-users')
  async getGhostUsers() {
    return this.analyticsService.getGhostUsers();
  }
}

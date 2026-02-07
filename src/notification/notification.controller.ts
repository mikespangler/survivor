import { Controller, Get, Patch, Post, Body, ForbiddenException } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { UpdateNotificationPreferencesDto } from './dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users/me/notification-preferences')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getPreferences(@CurrentUser() user: any) {
    return this.notificationService.getPreferences(user.id);
  }

  @Patch()
  async updatePreferences(
    @CurrentUser() user: any,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    return this.notificationService.updatePreferences(user.id, dto);
  }

  @Post('test')
  async sendTestEmail(@CurrentUser() user: any) {
    if (user.systemRole !== 'admin') {
      throw new ForbiddenException('Only admins can send test emails');
    }
    return this.notificationService.sendTestEmail(user.id);
  }
}

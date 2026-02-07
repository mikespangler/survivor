import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationSchedulerService } from './notification-scheduler.service';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationSchedulerService],
  exports: [NotificationService],
})
export class NotificationModule {}

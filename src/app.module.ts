import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { LeagueModule } from './league/league.module';
import { AuthGuard } from './auth/auth.guard';
import { SeasonModule } from './season/season.module';
import { CastawayModule } from './castaway/castaway.module';
import { TeamModule } from './team/team.module';
import { QuestionModule } from './question/question.module';
import { EpisodeModule } from './episode/episode.module';
import { AdminModule } from './admin/admin.module';
import { NotificationModule } from './notification/notification.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ActivityTrackingInterceptor } from './analytics/activity-tracking.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    UserModule,
    AuthModule,
    LeagueModule,
    SeasonModule,
    CastawayModule,
    TeamModule,
    QuestionModule,
    EpisodeModule,
    AdminModule,
    NotificationModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityTrackingInterceptor,
    },
  ],
})
export class AppModule {}

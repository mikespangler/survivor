import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}

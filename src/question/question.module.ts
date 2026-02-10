import { Module, forwardRef } from '@nestjs/common';
import { LeagueQuestionController } from './league-question.controller';
import { SystemQuestionController } from './system-question.controller';
import { QuestionService } from './question.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { LeagueModule } from '../league/league.module';
import { EpisodeModule } from '../episode/episode.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    forwardRef(() => LeagueModule),
    EpisodeModule,
    NotificationModule,
  ],
  controllers: [LeagueQuestionController, SystemQuestionController],
  providers: [QuestionService],
  exports: [QuestionService],
})
export class QuestionModule {}

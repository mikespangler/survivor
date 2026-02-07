import { Module, forwardRef } from '@nestjs/common';
import { QuestionTemplateController } from './question-template.controller';
import { LeagueQuestionController } from './league-question.controller';
import { QuestionService } from './question.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { LeagueModule } from '../league/league.module';
import { EpisodeModule } from '../episode/episode.module';

@Module({
  imports: [PrismaModule, AuthModule, forwardRef(() => LeagueModule), EpisodeModule],
  controllers: [QuestionTemplateController, LeagueQuestionController],
  providers: [QuestionService],
  exports: [QuestionService],
})
export class QuestionModule {}

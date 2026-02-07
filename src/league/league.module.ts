import { Module, forwardRef } from '@nestjs/common';
import { LeagueController } from './league.controller';
import { LeagueBaseController } from './league-base.controller';
import { LeagueService } from './league.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { QuestionModule } from '../question/question.module';
import { EpisodeModule } from '../episode/episode.module';
import { EmailModule } from '../email/email.module';
import { UserService } from '../user/user.service';

@Module({
  imports: [PrismaModule, AuthModule, forwardRef(() => QuestionModule), EpisodeModule, EmailModule],
  controllers: [LeagueBaseController, LeagueController],
  providers: [LeagueService, UserService],
  exports: [LeagueService],
})
export class LeagueModule {}

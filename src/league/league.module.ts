import { Module } from '@nestjs/common';
import { LeagueController } from './league.controller';
import { LeagueBaseController } from './league-base.controller';
import { LeagueService } from './league.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [LeagueBaseController, LeagueController],
  providers: [LeagueService],
  exports: [LeagueService],
})
export class LeagueModule {}


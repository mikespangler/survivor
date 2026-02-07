import { Module } from '@nestjs/common';
import { EpisodeController } from './episode.controller';
import { EpisodeService } from './episode.service';
import { EpisodeStateService } from './episode-state.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [EpisodeController],
  providers: [EpisodeService, EpisodeStateService],
  exports: [EpisodeService, EpisodeStateService],
})
export class EpisodeModule {}

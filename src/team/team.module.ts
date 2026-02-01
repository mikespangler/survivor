import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryService } from '../castaway/cloudinary.service';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule],
  controllers: [TeamController],
  providers: [TeamService, CloudinaryService],
  exports: [TeamService],
})
export class TeamModule {}


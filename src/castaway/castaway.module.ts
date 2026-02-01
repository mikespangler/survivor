import { Module } from '@nestjs/common';
import { CastawayService } from './castaway.service';
import { CastawayController } from './castaway.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryService } from './cloudinary.service';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule],
  controllers: [CastawayController],
  providers: [CastawayService, CloudinaryService],
  exports: [CastawayService],
})
export class CastawayModule {}

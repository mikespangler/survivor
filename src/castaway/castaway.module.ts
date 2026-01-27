import { Module } from '@nestjs/common';
import { CastawayService } from './castaway.service';
import { CastawayController } from './castaway.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [PrismaModule],
  controllers: [CastawayController],
  providers: [CastawayService, CloudinaryService],
  exports: [CastawayService],
})
export class CastawayModule {}

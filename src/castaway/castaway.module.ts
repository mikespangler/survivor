import { Module } from '@nestjs/common';
import { CastawayService } from './castaway.service';
import { CastawayController } from './castaway.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CastawayController],
  providers: [CastawayService],
  exports: [CastawayService],
})
export class CastawayModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClerkService } from './clerk.service';
import { AuthGuard } from './auth.guard';
import { SystemAdminGuard } from './guards/system-admin.guard';
import { LeagueCommissionerOrAdminGuard } from './guards/league-owner-or-admin.guard';
import { UserModule } from '../user/user.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule, UserModule, PrismaModule],
  providers: [
    ClerkService,
    AuthGuard,
    SystemAdminGuard,
    LeagueCommissionerOrAdminGuard,
  ],
  exports: [
    ClerkService,
    AuthGuard,
    SystemAdminGuard,
    LeagueCommissionerOrAdminGuard,
  ],
})
export class AuthModule {}

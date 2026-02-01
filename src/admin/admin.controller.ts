import { Controller, Get, Param, Query, UseGuards, Post, Delete, Body } from '@nestjs/common';
import { SystemAdminGuard } from '../auth/guards/system-admin.guard';
import { AdminService } from './admin.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { AddMemberDto } from './dto/add-member.dto';
import { AdminInviteByEmailDto } from './dto/admin-invite-by-email.dto';
import { LeagueMemberResponse } from './dto/league-member-response.dto';

@Controller('admin')
@UseGuards(SystemAdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getAllUsers(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const skipNum = skip ? parseInt(skip, 10) : 0;
    const takeNum = take ? parseInt(take, 10) : 50;
    return this.adminService.getAllUsers(skipNum, takeNum);
  }

  @Get('leagues')
  async getAllLeagues(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const skipNum = skip ? parseInt(skip, 10) : 0;
    const takeNum = take ? parseInt(take, 10) : 50;
    return this.adminService.getAllLeagues(skipNum, takeNum);
  }

  @Get('leagues/:id')
  async getAnyLeague(@Param('id') id: string) {
    return this.adminService.getAnyLeague(id);
  }

  @Get('leagues/:leagueId/members')
  async getLeagueMembers(
    @Param('leagueId') leagueId: string,
  ): Promise<LeagueMemberResponse[]> {
    return this.adminService.getLeagueMembers(leagueId);
  }

  @Post('leagues/:leagueId/members')
  async addMemberToLeague(
    @Param('leagueId') leagueId: string,
    @Body() dto: AddMemberDto,
    @CurrentUser() admin: User,
  ) {
    return this.adminService.addMemberToLeague(leagueId, dto.userId, admin.id);
  }

  @Delete('leagues/:leagueId/members/:userId')
  async removeMemberFromLeague(
    @Param('leagueId') leagueId: string,
    @Param('userId') userId: string,
    @CurrentUser() admin: User,
  ) {
    await this.adminService.removeMemberFromLeague(leagueId, userId, admin.id);
    return { success: true };
  }

  @Post('leagues/:leagueId/invite-email')
  async sendEmailInvites(
    @Param('leagueId') leagueId: string,
    @Body() dto: AdminInviteByEmailDto,
    @CurrentUser() admin: User,
  ) {
    const result = await this.adminService.sendEmailInvites(
      leagueId,
      dto.emails,
      admin.id,
    );
    return { success: true, ...result };
  }

  @Get('users/search')
  async searchUsers(@Query('q') query: string) {
    return this.adminService.searchUsers(query);
  }
}

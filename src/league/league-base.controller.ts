import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { LeagueService } from './league.service';
import { CreateLeagueDto } from './dto/create-league.dto';
import { JoinLeagueDto } from './dto/join-league.dto';
import { InviteByEmailDto } from './dto/invite-by-email.dto';
import { JoinByTokenDto } from './dto/join-by-token.dto';
import { AddCommissionerDto } from './dto/add-commissioner.dto';
import { CreateCommissionerMessageDto } from './dto/create-commissioner-message.dto';
import { UpdateCommissionerMessageDto } from './dto/update-commissioner-message.dto';
import { LeagueCommissionerOrAdminGuard } from '../auth/guards/league-owner-or-admin.guard';
import { LeagueMemberGuard } from '../auth/guards/league-member.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserService } from '../user/user.service';

@Controller('leagues')
export class LeagueBaseController {
  constructor(
    private readonly leagueService: LeagueService,
    private readonly userService: UserService,
  ) {}

  @Get()
  async getLeagues(@CurrentUser() user: any) {
    return this.leagueService.getLeagues(user.id);
  }

  @Get(':id')
  async getLeague(@Param('id') id: string, @CurrentUser() user: any) {
    const league = await this.leagueService.getLeague(id, user.id);

    // Update last viewed league (fire and forget)
    this.userService
      .updateLastViewedLeague(user.id, id)
      .catch((err) =>
        console.error('Failed to update last viewed league:', err),
      );

    return league;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createLeague(
    @CurrentUser() user: any,
    @Body() createDto: CreateLeagueDto,
  ) {
    return this.leagueService.createLeague(user.id, createDto);
  }

  @Post('join')
  @HttpCode(HttpStatus.OK)
  async joinLeague(@CurrentUser() user: any, @Body() joinDto: JoinLeagueDto) {
    return this.leagueService.joinLeague(user.id, joinDto);
  }

  @Post('join-by-token')
  @HttpCode(HttpStatus.OK)
  async joinLeagueByToken(
    @CurrentUser() user: any,
    @Body() joinByTokenDto: JoinByTokenDto,
  ) {
    return this.leagueService.joinLeagueByToken(user.id, joinByTokenDto.token);
  }

  @Get('validate-token/:token')
  @Public()
  async validateToken(@Param('token') token: string) {
    return this.leagueService.validateInviteToken(token);
  }

  @Post(':id/invite-link')
  @UseGuards(LeagueCommissionerOrAdminGuard)
  @HttpCode(HttpStatus.CREATED)
  async generateInviteLink(
    @Param('id') leagueId: string,
    @CurrentUser() user: any,
  ) {
    return this.leagueService.generateInviteLink(leagueId, user.id);
  }

  @Get(':id/invite-links')
  @UseGuards(LeagueCommissionerOrAdminGuard)
  async getInviteLinks(
    @Param('id') leagueId: string,
    @CurrentUser() user: any,
  ) {
    return this.leagueService.getInviteLinks(leagueId, user.id);
  }

  @Delete(':id/invite-links/:tokenId')
  @UseGuards(LeagueCommissionerOrAdminGuard)
  @HttpCode(HttpStatus.OK)
  async revokeInviteLink(
    @Param('id') leagueId: string,
    @Param('tokenId') tokenId: string,
    @CurrentUser() user: any,
  ) {
    return this.leagueService.revokeInviteToken(tokenId, user.id);
  }

  @Get(':id/pending-invites')
  @UseGuards(LeagueCommissionerOrAdminGuard)
  async getPendingInvites(
    @Param('id') leagueId: string,
    @CurrentUser() user: any,
  ) {
    return this.leagueService.getPendingInvites(leagueId, user.id);
  }

  @Post(':id/invite-email')
  @UseGuards(LeagueCommissionerOrAdminGuard)
  @HttpCode(HttpStatus.OK)
  async inviteByEmail(
    @Param('id') leagueId: string,
    @Body() inviteDto: InviteByEmailDto,
    @CurrentUser() user: any,
  ) {
    return this.leagueService.inviteByEmail(
      leagueId,
      inviteDto.emails,
      user.id,
    );
  }

  @Post(':id/commissioners')
  @UseGuards(LeagueCommissionerOrAdminGuard)
  @HttpCode(HttpStatus.OK)
  async addCommissioner(
    @Param('id') leagueId: string,
    @Body() addCommissionerDto: AddCommissionerDto,
    @CurrentUser() user: any,
  ) {
    return this.leagueService.addCommissioner(
      leagueId,
      user.id,
      addCommissionerDto.userId,
    );
  }

  @Delete(':id/commissioners/:userId')
  @UseGuards(LeagueCommissionerOrAdminGuard)
  @HttpCode(HttpStatus.OK)
  async removeCommissioner(
    @Param('id') leagueId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: any,
  ) {
    return this.leagueService.removeCommissioner(leagueId, user.id, userId);
  }

  @Get(':id/commissioners')
  @UseGuards(LeagueMemberGuard)
  async getCommissioners(@Param('id') leagueId: string) {
    return this.leagueService.getCommissioners(leagueId);
  }

  // Commissioner member management endpoints
  @Get(':id/members')
  @UseGuards(LeagueCommissionerOrAdminGuard)
  async getLeagueMembers(@Param('id') leagueId: string) {
    return this.leagueService.getLeagueMembers(leagueId);
  }

  @Post(':id/members')
  @UseGuards(LeagueCommissionerOrAdminGuard)
  @HttpCode(HttpStatus.OK)
  async addMember(
    @Param('id') leagueId: string,
    @Body() dto: { userId: string },
  ) {
    return this.leagueService.addMemberToLeague(leagueId, dto.userId);
  }

  @Delete(':id/members/:userId')
  @UseGuards(LeagueCommissionerOrAdminGuard)
  @HttpCode(HttpStatus.OK)
  async removeMember(
    @Param('id') leagueId: string,
    @Param('userId') userId: string,
  ) {
    await this.leagueService.removeMemberFromLeague(leagueId, userId);
    return { success: true };
  }

  @Get(':id/users/search')
  @UseGuards(LeagueCommissionerOrAdminGuard)
  async searchUsersForLeague(
    @Param('id') leagueId: string,
    @Query('q') query: string,
  ) {
    return this.leagueService.searchUsersForLeague(leagueId, query);
  }

  // Commissioner message endpoints
  @Get(':id/messages')
  @UseGuards(LeagueMemberGuard)
  async getCommissionerMessages(
    @Param('id') leagueId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.leagueService.getCommissionerMessages(leagueId, {
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Post(':id/messages')
  @UseGuards(LeagueCommissionerOrAdminGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCommissionerMessage(
    @Param('id') leagueId: string,
    @Body() dto: CreateCommissionerMessageDto,
    @CurrentUser() user: any,
  ) {
    return this.leagueService.createCommissionerMessage(leagueId, user.id, dto);
  }

  @Patch(':id/messages/:messageId')
  @UseGuards(LeagueCommissionerOrAdminGuard)
  async updateCommissionerMessage(
    @Param('id') leagueId: string,
    @Param('messageId') messageId: string,
    @Body() dto: UpdateCommissionerMessageDto,
    @CurrentUser() user: any,
  ) {
    return this.leagueService.updateCommissionerMessage(messageId, user.id, dto);
  }

  @Delete(':id/messages/:messageId')
  @UseGuards(LeagueCommissionerOrAdminGuard)
  @HttpCode(HttpStatus.OK)
  async deleteCommissionerMessage(
    @Param('id') leagueId: string,
    @Param('messageId') messageId: string,
    @CurrentUser() user: any,
  ) {
    return this.leagueService.deleteCommissionerMessage(messageId, user.id);
  }
}

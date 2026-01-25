import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
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
import { LeagueCommissionerOrAdminGuard } from '../auth/guards/league-owner-or-admin.guard';
import { LeagueMemberGuard } from '../auth/guards/league-member.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('leagues')
export class LeagueBaseController {
  constructor(private readonly leagueService: LeagueService) {}

  @Get()
  async getLeagues(@CurrentUser() user: any) {
    return this.leagueService.getLeagues(user.id);
  }

  @Get(':id')
  async getLeague(@Param('id') id: string, @CurrentUser() user: any) {
    return this.leagueService.getLeague(id, user.id);
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
  @Public()
  @HttpCode(HttpStatus.OK)
  async joinLeagueByToken(
    @CurrentUser() user: any,
    @Body() joinByTokenDto: JoinByTokenDto,
  ) {
    if (!user) {
      throw new Error('You must be authenticated to join a league');
    }
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
}

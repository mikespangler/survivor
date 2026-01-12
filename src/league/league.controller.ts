import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LeagueService } from './league.service';
import { UpdateLeagueSeasonSettingsDto } from './dto/update-league-season-settings.dto';
import { UpdateDraftConfigDto } from './dto/update-draft-config.dto';
import { LeagueOwnerOrAdminGuard } from '../auth/guards/league-owner-or-admin.guard';
import { LeagueMemberGuard } from '../auth/guards/league-member.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('leagues/:leagueId/seasons/:seasonId')
export class LeagueController {
  constructor(private readonly leagueService: LeagueService) {}

  @Get('settings')
  @UseGuards(LeagueOwnerOrAdminGuard)
  async getSettings(
    @Param('leagueId') leagueId: string,
    @Param('seasonId') seasonId: string,
  ) {
    return this.leagueService.getLeagueSeasonSettings(leagueId, seasonId);
  }

  @Patch('settings')
  @UseGuards(LeagueOwnerOrAdminGuard)
  async updateSettings(
    @Param('leagueId') leagueId: string,
    @Param('seasonId') seasonId: string,
    @Body() updateDto: UpdateLeagueSeasonSettingsDto,
  ) {
    return this.leagueService.updateLeagueSeasonSettings(
      leagueId,
      seasonId,
      updateDto,
    );
  }

  @Get('draft-config')
  @UseGuards(LeagueOwnerOrAdminGuard)
  async getDraftConfig(
    @Param('leagueId') leagueId: string,
    @Param('seasonId') seasonId: string,
    @Query('roundNumber') roundNumber?: string,
  ) {
    const round = roundNumber ? parseInt(roundNumber, 10) : 1;
    return this.leagueService.getDraftConfig(leagueId, seasonId, round);
  }

  @Patch('draft-config')
  @UseGuards(LeagueOwnerOrAdminGuard)
  async updateDraftConfig(
    @Param('leagueId') leagueId: string,
    @Param('seasonId') seasonId: string,
    @Body() updateDto: UpdateDraftConfigDto,
  ) {
    const roundNumber = updateDto.roundNumber ?? 1;
    return this.leagueService.updateDraftConfig(
      leagueId,
      seasonId,
      roundNumber,
      updateDto,
    );
  }

  @Get('standings')
  @UseGuards(LeagueMemberGuard)
  async getStandings(
    @Param('leagueId') leagueId: string,
    @Param('seasonId') seasonId: string,
    @CurrentUser() user: any,
  ) {
    return this.leagueService.getStandings(leagueId, seasonId, user.id);
  }

  @Get('my-team')
  @UseGuards(LeagueMemberGuard)
  async getMyTeam(
    @Param('leagueId') leagueId: string,
    @Param('seasonId') seasonId: string,
    @CurrentUser() user: any,
  ) {
    return this.leagueService.getMyTeam(leagueId, seasonId, user.id);
  }
}

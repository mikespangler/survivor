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

@Controller('leagues/:leagueId/seasons/:seasonId')
@UseGuards(LeagueOwnerOrAdminGuard)
export class LeagueController {
  constructor(private readonly leagueService: LeagueService) {}

  @Get('settings')
  async getSettings(
    @Param('leagueId') leagueId: string,
    @Param('seasonId') seasonId: string,
  ) {
    return this.leagueService.getLeagueSeasonSettings(leagueId, seasonId);
  }

  @Patch('settings')
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
  async getDraftConfig(
    @Param('leagueId') leagueId: string,
    @Param('seasonId') seasonId: string,
    @Query('roundNumber') roundNumber?: string,
  ) {
    const round = roundNumber ? parseInt(roundNumber, 10) : 1;
    return this.leagueService.getDraftConfig(leagueId, seasonId, round);
  }

  @Patch('draft-config')
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
}


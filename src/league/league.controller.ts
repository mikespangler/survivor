import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LeagueService } from './league.service';
import { UpdateLeagueSeasonSettingsDto } from './dto/update-league-season-settings.dto';
import { UpdateDraftConfigDto } from './dto/update-draft-config.dto';
import { UpdateRetentionConfigDto } from './dto/update-retention-config.dto';
import { LeagueCommissionerOrAdminGuard } from '../auth/guards/league-owner-or-admin.guard';
import { LeagueMemberGuard } from '../auth/guards/league-member.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('leagues/:leagueId/seasons/:seasonId')
export class LeagueController {
  constructor(private readonly leagueService: LeagueService) {}

  @Get('settings')
  @UseGuards(LeagueCommissionerOrAdminGuard)
  async getSettings(
    @Param('leagueId') leagueId: string,
    @Param('seasonId') seasonId: string,
  ) {
    return this.leagueService.getLeagueSeasonSettings(leagueId, seasonId);
  }

  @Patch('settings')
  @UseGuards(LeagueCommissionerOrAdminGuard)
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
  @UseGuards(LeagueCommissionerOrAdminGuard)
  async getDraftConfig(
    @Param('leagueId') leagueId: string,
    @Param('seasonId') seasonId: string,
    @Query('roundNumber') roundNumber?: string,
  ) {
    const round = roundNumber ? parseInt(roundNumber, 10) : 1;
    return this.leagueService.getDraftConfig(leagueId, seasonId, round);
  }

  @Patch('draft-config')
  @UseGuards(LeagueCommissionerOrAdminGuard)
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

  // Detailed standings with episode breakdown
  @Get('standings/detailed')
  @UseGuards(LeagueMemberGuard)
  async getDetailedStandings(
    @Param('leagueId') leagueId: string,
    @Param('seasonId') seasonId: string,
    @CurrentUser() user: any,
    @Query('episode') episode?: string,
  ) {
    const episodeNumber = episode ? parseInt(episode, 10) : undefined;
    return this.leagueService.getDetailedStandings(
      leagueId,
      seasonId,
      user.id,
      episodeNumber,
    );
  }

  // Get retention configuration
  @Get('retention-config')
  @UseGuards(LeagueCommissionerOrAdminGuard)
  async getRetentionConfig(
    @Param('leagueId') leagueId: string,
    @Param('seasonId') seasonId: string,
  ) {
    return this.leagueService.getRetentionConfig(leagueId, seasonId);
  }

  // Update retention configuration
  @Patch('retention-config')
  @UseGuards(LeagueCommissionerOrAdminGuard)
  async updateRetentionConfig(
    @Param('leagueId') leagueId: string,
    @Param('seasonId') seasonId: string,
    @Body() dto: UpdateRetentionConfigDto,
  ) {
    return this.leagueService.updateRetentionConfig(leagueId, seasonId, dto);
  }

  // Recalculate all episode points
  @Post('recalculate-points')
  @UseGuards(LeagueCommissionerOrAdminGuard)
  async recalculatePoints(
    @Param('leagueId') leagueId: string,
    @Param('seasonId') seasonId: string,
  ) {
    return this.leagueService.recalculateAllEpisodePoints(leagueId, seasonId);
  }
}

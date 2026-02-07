import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { LeagueService } from './league.service';
import { TeamService } from '../team/team.service';
import { EpisodeStateService } from '../episode/episode-state.service';
import { UpdateLeagueSeasonSettingsDto } from './dto/update-league-season-settings.dto';
import { UpdateDraftConfigDto } from './dto/update-draft-config.dto';
import { UpdateRetentionConfigDto } from './dto/update-retention-config.dto';
import { LeagueCommissionerOrAdminGuard } from '../auth/guards/league-owner-or-admin.guard';
import { LeagueMemberGuard } from '../auth/guards/league-member.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('leagues/:leagueId/seasons/:seasonId')
export class LeagueController {
  constructor(
    private readonly leagueService: LeagueService,
    private readonly moduleRef: ModuleRef,
    private readonly prisma: PrismaService,
    private readonly episodeStateService: EpisodeStateService,
  ) {}

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

  // Get episode states for the league season
  @Get('episode-states')
  @UseGuards(LeagueMemberGuard)
  async getEpisodeStates(
    @Param('leagueId') leagueId: string,
    @Param('seasonId') seasonId: string,
    @CurrentUser() user: any,
  ) {
    return this.episodeStateService.getLeagueEpisodeStates(
      leagueId,
      seasonId,
      user.id,
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

  // Get draft page data
  @Get('draft')
  @UseGuards(LeagueMemberGuard)
  async getDraftPage(
    @Param('leagueId') leagueId: string,
    @Param('seasonId') seasonId: string,
    @Query('roundNumber') roundNumber: string = '1',
    @CurrentUser() user: any,
  ) {
    const round = parseInt(roundNumber, 10);
    return this.leagueService.getDraftPageData(
      leagueId,
      seasonId,
      round,
      user.id,
    );
  }

  // Submit draft
  @Post('draft/submit')
  @UseGuards(LeagueMemberGuard)
  async submitDraft(
    @Param('leagueId') leagueId: string,
    @Param('seasonId') seasonId: string,
    @Body() dto: { castawayIds: string[]; roundNumber: number },
    @CurrentUser() user: any,
  ) {
    // 1. Get draft page data to validate
    const draftData = await this.leagueService.getDraftPageData(
      leagueId,
      seasonId,
      dto.roundNumber,
      user.id,
    );

    // 2. Validate castaway count
    if (dto.castawayIds.length !== draftData.draftConfig.castawaysPerTeam) {
      throw new BadRequestException(
        `Must select exactly ${draftData.draftConfig.castawaysPerTeam} castaways`,
      );
    }

    // 3. Check for duplicates
    const uniqueIds = new Set(dto.castawayIds);
    if (uniqueIds.size !== dto.castawayIds.length) {
      throw new BadRequestException('Duplicate castaways in selection');
    }

    // 4. Verify all castaways exist in season
    const validCastaways = draftData.castaways.filter((c) =>
      dto.castawayIds.includes(c.id),
    );

    if (validCastaways.length !== dto.castawayIds.length) {
      throw new BadRequestException('Invalid castaway IDs');
    }

    // 5. Submit roster (round 1 = add, round 2+ = replace)
    const teamService = this.moduleRef.get(TeamService, { strict: false });

    if (dto.roundNumber === 1) {
      await teamService.bulkAddCastaways(draftData.userTeam.id, {
        castawayIds: dto.castawayIds,
      });
    } else {
      const season = await this.prisma.season.findUnique({
        where: { id: seasonId },
      });
      await teamService.replaceCastaways(
        draftData.userTeam.id,
        { castawayIds: dto.castawayIds },
        season.activeEpisode,
      );
    }

    // 6. Update draft status if needed
    await this.updateDraftStatus(leagueId, seasonId, dto.roundNumber, user.id);

    return {
      success: true,
      message: 'Roster submitted successfully',
    };
  }

  private async updateDraftStatus(
    leagueId: string,
    seasonId: string,
    roundNumber: number,
    userId: string,
  ) {
    // Get fresh draft data
    const draftData = await this.leagueService.getDraftPageData(
      leagueId,
      seasonId,
      roundNumber,
      userId,
    );

    const allTeamsCompleted = draftData.leagueProgress.every(
      (team) => team.hasCompleted,
    );

    const newStatus = allTeamsCompleted
      ? 'COMPLETED'
      : draftData.draftConfig.status === 'PENDING'
        ? 'IN_PROGRESS'
        : draftData.draftConfig.status;

    if (newStatus !== draftData.draftConfig.status) {
      await this.prisma.draftConfig.update({
        where: { id: draftData.draftConfig.id },
        data: { status: newStatus },
      });
    }
  }
}

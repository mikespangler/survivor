import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { AddCastawayDto } from './dto/add-castaway.dto';
import { TeamOwnerOrAdminGuard } from '../auth/guards/team-owner-or-admin.guard';

@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamService.getTeam(id);
  }

  @Post(':id/castaways')
  @UseGuards(TeamOwnerOrAdminGuard)
  addCastaway(
    @Param('id') teamId: string,
    @Body() addCastawayDto: AddCastawayDto,
  ) {
    return this.teamService.addCastaway(teamId, addCastawayDto);
  }

  @Delete(':id/castaways/:castawayId')
  @UseGuards(TeamOwnerOrAdminGuard)
  removeCastaway(
    @Param('id') teamId: string,
    @Param('castawayId') castawayId: string,
  ) {
    return this.teamService.removeCastaway(teamId, castawayId);
  }
}


import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TeamService } from './team.service';
import { AddCastawayDto } from './dto/add-castaway.dto';
import { BulkAddCastawaysDto } from './dto/bulk-add-castaways.dto';
import { UpdateTeamNameDto } from './dto/update-team-name.dto';
import { TeamOwnerOrAdminGuard } from '../auth/guards/team-owner-or-admin.guard';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CloudinaryService } from '../castaway/cloudinary.service';
import { uploadConfig } from '../castaway/upload.config';

@Controller('teams')
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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

  @Post(':id/castaways/bulk')
  @UseGuards(TeamOwnerOrAdminGuard)
  bulkAddCastaways(
    @Param('id') teamId: string,
    @Body() bulkDto: BulkAddCastawaysDto,
  ) {
    return this.teamService.bulkAddCastaways(teamId, bulkDto);
  }

  @Delete(':id/castaways/:castawayId')
  @UseGuards(TeamOwnerOrAdminGuard)
  removeCastaway(
    @Param('id') teamId: string,
    @Param('castawayId') castawayId: string,
  ) {
    return this.teamService.removeCastaway(teamId, castawayId);
  }

  @Post(':id/logo')
  @UseInterceptors(FileInterceptor('file', uploadConfig))
  @UseGuards(AuthGuard)
  async uploadTeamLogo(
    @Param('id') teamId: string,
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Verify user owns the team
    const team = await this.teamService.findOne(teamId);
    if (team.ownerId !== user.id) {
      throw new ForbiddenException('You do not own this team');
    }

    // Upload to Cloudinary with transformations for team logos
    const imageUrl = await this.cloudinaryService.uploadImage(
      file,
      `teams/${teamId}`,
    );

    // Update team logo URL
    return this.teamService.updateLogo(teamId, imageUrl);
  }

  @Delete(':id/logo')
  @UseGuards(AuthGuard)
  async deleteTeamLogo(@Param('id') teamId: string, @CurrentUser() user: any) {
    // Verify user owns the team
    const team = await this.teamService.findOne(teamId);
    if (team.ownerId !== user.id) {
      throw new ForbiddenException('You do not own this team');
    }

    // Delete from Cloudinary if exists
    if (team.logoImageUrl) {
      await this.cloudinaryService.deleteImage(team.logoImageUrl);
    }

    // Remove logo URL from team
    return this.teamService.updateLogo(teamId, null);
  }

  @Patch(':id/name')
  @UseGuards(AuthGuard)
  async updateTeamName(
    @Param('id') teamId: string,
    @CurrentUser() user: any,
    @Body() updateTeamNameDto: UpdateTeamNameDto,
  ) {
    // Verify user owns the team
    const team = await this.teamService.findOne(teamId);
    if (team.ownerId !== user.id) {
      throw new ForbiddenException('You do not own this team');
    }

    // Update team name
    return this.teamService.updateName(teamId, updateTeamNameDto.name);
  }
}

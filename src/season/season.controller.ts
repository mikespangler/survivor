import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { SystemAdminGuard } from '../auth/guards/system-admin.guard';
import { SeasonService } from './season.service';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';

@Controller('seasons')
export class SeasonController {
  constructor(private readonly seasonService: SeasonService) {}

  @Get()
  findAll() {
    return this.seasonService.findAll();
  }

  @Get('active')
  @Public()
  getActiveSeason() {
    return this.seasonService.getActiveSeason();
  }

  @Get(':id/metadata')
  getMetadata(@Param('id') id: string) {
    return this.seasonService.getMetadata(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seasonService.findOne(id);
  }

  @Post()
  @UseGuards(SystemAdminGuard)
  create(@Body() createSeasonDto: CreateSeasonDto) {
    return this.seasonService.create(createSeasonDto);
  }

  @Post(':id/advance-episode')
  @UseGuards(SystemAdminGuard)
  advanceEpisode(@Param('id') id: string) {
    return this.seasonService.advanceEpisode(id);
  }

  @Patch(':id')
  @UseGuards(SystemAdminGuard)
  update(@Param('id') id: string, @Body() updateSeasonDto: UpdateSeasonDto) {
    return this.seasonService.update(id, updateSeasonDto);
  }

  @Delete(':id')
  @UseGuards(SystemAdminGuard)
  remove(@Param('id') id: string) {
    return this.seasonService.remove(id);
  }
}

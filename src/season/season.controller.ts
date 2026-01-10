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
import { SeasonService } from './season.service';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';
import { SystemAdminGuard } from '../auth/guards/system-admin.guard';

@Controller('seasons')
export class SeasonController {
  constructor(private readonly seasonService: SeasonService) {}

  @Get()
  findAll() {
    return this.seasonService.findAll();
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

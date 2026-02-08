import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EpisodeService } from './episode.service';
import {
  CreateEpisodeDto,
  UpdateEpisodeDto,
  BulkCreateEpisodesDto,
} from './dto';
import { SystemAdminGuard } from '../auth/guards/system-admin.guard';

@Controller('episodes')
export class EpisodeController {
  constructor(private readonly episodeService: EpisodeService) {}

  @Get()
  findAll(@Query('seasonId') seasonId?: string) {
    return this.episodeService.findAll(seasonId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.episodeService.findOne(id);
  }

  @Post()
  @UseGuards(SystemAdminGuard)
  create(@Body() dto: CreateEpisodeDto) {
    return this.episodeService.create(dto);
  }

  @Post('bulk')
  @UseGuards(SystemAdminGuard)
  bulkCreate(@Body() dto: BulkCreateEpisodesDto) {
    return this.episodeService.bulkCreate(dto);
  }

  @Patch(':id')
  @UseGuards(SystemAdminGuard)
  update(@Param('id') id: string, @Body() dto: UpdateEpisodeDto) {
    return this.episodeService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(SystemAdminGuard)
  remove(@Param('id') id: string) {
    return this.episodeService.remove(id);
  }
}

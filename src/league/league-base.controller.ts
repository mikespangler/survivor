import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LeagueService } from './league.service';
import { CreateLeagueDto } from './dto/create-league.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

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
}


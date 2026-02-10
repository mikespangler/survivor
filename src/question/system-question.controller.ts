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
import { QuestionService } from './question.service';
import { CreateLeagueQuestionDto, UpdateLeagueQuestionDto } from './dto';
import { SystemAdminGuard } from '../auth/guards/system-admin.guard';

@Controller('system-questions')
@UseGuards(SystemAdminGuard)
export class SystemQuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get()
  async getSystemQuestions(
    @Query('seasonId') seasonId: string,
    @Query('episode') episode?: string,
  ) {
    const episodeNumber = episode ? parseInt(episode, 10) : undefined;
    return this.questionService.getSystemQuestions(seasonId, episodeNumber);
  }

  @Post()
  async createSystemQuestion(
    @Query('seasonId') seasonId: string,
    @Body() dto: CreateLeagueQuestionDto,
  ) {
    return this.questionService.createSystemQuestion(seasonId, dto);
  }

  @Patch(':id')
  async updateSystemQuestion(
    @Param('id') id: string,
    @Body() dto: UpdateLeagueQuestionDto,
  ) {
    return this.questionService.updateSystemQuestion(id, dto);
  }

  @Delete(':id')
  async deleteSystemQuestion(@Param('id') id: string) {
    return this.questionService.deleteSystemQuestion(id);
  }
}

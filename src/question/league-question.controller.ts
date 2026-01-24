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
import {
  CreateLeagueQuestionDto,
  UpdateLeagueQuestionDto,
  CreateFromTemplatesDto,
  SubmitAnswerDto,
  SetCorrectAnswersDto,
} from './dto';
import { LeagueOwnerOrAdminGuard } from '../auth/guards/league-owner-or-admin.guard';
import { LeagueMemberGuard } from '../auth/guards/league-member.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('leagues/:leagueId/seasons/:seasonId/questions')
export class LeagueQuestionController {
  constructor(private readonly questionService: QuestionService) {}

  // ================== COMMISSIONER ROUTES ==================

  @Get()
  @UseGuards(LeagueOwnerOrAdminGuard)
  async getQuestions(
    @Param('leagueId') leagueId: string,
    @Param('seasonId') seasonId: string,
    @Query('episode') episode?: string,
  ) {
    const episodeNumber = episode ? parseInt(episode, 10) : undefined;
    return this.questionService.getLeagueQuestions(
      leagueId,
      seasonId,
      episodeNumber,
    );
  }

  @Get('templates')
  @UseGuards(LeagueOwnerOrAdminGuard)
  async getAvailableTemplates(@Query('category') category?: string) {
    return this.questionService.getTemplates(category);
  }

  @Post()
  @UseGuards(LeagueOwnerOrAdminGuard)
  async createQuestion(
    @Param('leagueId') leagueId: string,
    @Param('seasonId') seasonId: string,
    @Body() dto: CreateLeagueQuestionDto,
  ) {
    return this.questionService.createLeagueQuestion(leagueId, seasonId, dto);
  }

  @Post('from-templates')
  @UseGuards(LeagueOwnerOrAdminGuard)
  async createFromTemplates(
    @Param('leagueId') leagueId: string,
    @Param('seasonId') seasonId: string,
    @Body() dto: CreateFromTemplatesDto,
  ) {
    return this.questionService.createFromTemplates(leagueId, seasonId, dto);
  }

  @Patch(':questionId')
  @UseGuards(LeagueOwnerOrAdminGuard)
  async updateQuestion(
    @Param('questionId') questionId: string,
    @Body() dto: UpdateLeagueQuestionDto,
  ) {
    return this.questionService.updateLeagueQuestion(questionId, dto);
  }

  @Delete(':questionId')
  @UseGuards(LeagueOwnerOrAdminGuard)
  async deleteQuestion(@Param('questionId') questionId: string) {
    return this.questionService.deleteLeagueQuestion(questionId);
  }

  @Post('score')
  @UseGuards(LeagueOwnerOrAdminGuard)
  async scoreQuestions(
    @Param('leagueId') leagueId: string,
    @Param('seasonId') seasonId: string,
    @Body() dto: SetCorrectAnswersDto,
  ) {
    return this.questionService.scoreQuestions(leagueId, seasonId, dto);
  }

  // ================== PLAYER ROUTES ==================

  @Get('episode/:episodeNumber')
  @UseGuards(LeagueMemberGuard)
  async getEpisodeQuestions(
    @Param('leagueId') leagueId: string,
    @Param('seasonId') seasonId: string,
    @Param('episodeNumber') episodeNumber: string,
    @CurrentUser() user: any,
  ) {
    return this.questionService.getEpisodeQuestions(
      leagueId,
      seasonId,
      parseInt(episodeNumber, 10),
      user.id,
    );
  }

  @Post(':questionId/answer')
  @UseGuards(LeagueMemberGuard)
  async submitAnswer(
    @Param('leagueId') leagueId: string,
    @Param('seasonId') seasonId: string,
    @Param('questionId') questionId: string,
    @CurrentUser() user: any,
    @Body() dto: SubmitAnswerDto,
  ) {
    return this.questionService.submitAnswer(
      leagueId,
      seasonId,
      questionId,
      user.id,
      dto,
    );
  }

  @Get('my-answers')
  @UseGuards(LeagueMemberGuard)
  async getMyAnswers(
    @Param('leagueId') leagueId: string,
    @Param('seasonId') seasonId: string,
    @CurrentUser() user: any,
  ) {
    return this.questionService.getMyAnswers(leagueId, seasonId, user.id);
  }

  @Get('results/:episodeNumber')
  @UseGuards(LeagueMemberGuard)
  async getEpisodeResults(
    @Param('leagueId') leagueId: string,
    @Param('seasonId') seasonId: string,
    @Param('episodeNumber') episodeNumber: string,
    @CurrentUser() user: any,
  ) {
    return this.questionService.getEpisodeResults(
      leagueId,
      seasonId,
      parseInt(episodeNumber, 10),
      user.id,
    );
  }

  @Get('status')
  @UseGuards(LeagueMemberGuard)
  async getQuestionStatus(
    @Param('leagueId') leagueId: string,
    @Param('seasonId') seasonId: string,
    @CurrentUser() user: any,
  ) {
    return this.questionService.getQuestionStatus(leagueId, seasonId, user.id);
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateQuestionTemplateDto,
  UpdateQuestionTemplateDto,
  CreateLeagueQuestionDto,
  UpdateLeagueQuestionDto,
  CreateFromTemplatesDto,
  SubmitAnswerDto,
  SetCorrectAnswersDto,
} from './dto';

@Injectable()
export class QuestionService {
  constructor(private readonly prisma: PrismaService) {}

  // ================== TEMPLATE METHODS (System Admin) ==================

  async getTemplates(category?: string) {
    return this.prisma.questionTemplate.findMany({
      where: category ? { category } : undefined,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ category: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async getTemplate(id: string) {
    const template = await this.prisma.questionTemplate.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException(`Question template with ID ${id} not found`);
    }

    return template;
  }

  async createTemplate(userId: string, dto: CreateQuestionTemplateDto) {
    return this.prisma.questionTemplate.create({
      data: {
        text: dto.text,
        type: dto.type,
        options: dto.options || null,
        pointValue: dto.pointValue ?? 1,
        category: dto.category,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async updateTemplate(id: string, dto: UpdateQuestionTemplateDto) {
    const template = await this.prisma.questionTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Question template with ID ${id} not found`);
    }

    return this.prisma.questionTemplate.update({
      where: { id },
      data: {
        ...(dto.text !== undefined && { text: dto.text }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.options !== undefined && { options: dto.options }),
        ...(dto.pointValue !== undefined && { pointValue: dto.pointValue }),
        ...(dto.category !== undefined && { category: dto.category }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async deleteTemplate(id: string) {
    const template = await this.prisma.questionTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Question template with ID ${id} not found`);
    }

    await this.prisma.questionTemplate.delete({
      where: { id },
    });

    return { success: true };
  }

  // ================== LEAGUE QUESTION METHODS (Commissioner) ==================

  private async getLeagueSeason(leagueId: string, seasonId: string) {
    const leagueSeason = await this.prisma.leagueSeason.findUnique({
      where: {
        leagueId_seasonId: {
          leagueId,
          seasonId,
        },
      },
      include: {
        season: {
          include: {
            episodes: true,
          },
        },
      },
    });

    if (!leagueSeason) {
      throw new NotFoundException(
        `LeagueSeason with leagueId ${leagueId} and seasonId ${seasonId} not found`,
      );
    }

    return leagueSeason;
  }

  async getLeagueQuestions(
    leagueId: string,
    seasonId: string,
    episodeNumber?: number,
  ) {
    const leagueSeason = await this.getLeagueSeason(leagueId, seasonId);

    return this.prisma.leagueQuestion.findMany({
      where: {
        leagueSeasonId: leagueSeason.id,
        ...(episodeNumber !== undefined && { episodeNumber }),
      },
      include: {
        template: true,
        answers: {
          include: {
            team: {
              include: {
                owner: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [{ episodeNumber: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async getLeagueQuestion(questionId: string) {
    const question = await this.prisma.leagueQuestion.findUnique({
      where: { id: questionId },
      include: {
        template: true,
        answers: {
          include: {
            team: {
              include: {
                owner: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException(
        `League question with ID ${questionId} not found`,
      );
    }

    return question;
  }

  async createLeagueQuestion(
    leagueId: string,
    seasonId: string,
    dto: CreateLeagueQuestionDto,
  ) {
    const leagueSeason = await this.getLeagueSeason(leagueId, seasonId);

    // Get current max sortOrder for this episode
    const maxSortOrder = await this.prisma.leagueQuestion.aggregate({
      where: {
        leagueSeasonId: leagueSeason.id,
        episodeNumber: dto.episodeNumber,
      },
      _max: {
        sortOrder: true,
      },
    });

    const sortOrder = dto.sortOrder ?? (maxSortOrder._max.sortOrder ?? -1) + 1;

    return this.prisma.leagueQuestion.create({
      data: {
        leagueSeasonId: leagueSeason.id,
        episodeNumber: dto.episodeNumber,
        templateId: dto.templateId,
        text: dto.text,
        type: dto.type,
        options: dto.options || null,
        pointValue: dto.pointValue ?? 1,
        sortOrder,
      },
      include: {
        template: true,
      },
    });
  }

  async createFromTemplates(
    leagueId: string,
    seasonId: string,
    dto: CreateFromTemplatesDto,
  ) {
    const leagueSeason = await this.getLeagueSeason(leagueId, seasonId);

    // Get templates
    const templates = await this.prisma.questionTemplate.findMany({
      where: {
        id: { in: dto.templateIds },
      },
    });

    if (templates.length !== dto.templateIds.length) {
      throw new BadRequestException('One or more template IDs are invalid');
    }

    // Get current max sortOrder for this episode
    const maxSortOrder = await this.prisma.leagueQuestion.aggregate({
      where: {
        leagueSeasonId: leagueSeason.id,
        episodeNumber: dto.episodeNumber,
      },
      _max: {
        sortOrder: true,
      },
    });

    let sortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;

    // Create questions from templates
    const questions = await this.prisma.$transaction(
      templates.map((template) =>
        this.prisma.leagueQuestion.create({
          data: {
            leagueSeasonId: leagueSeason.id,
            episodeNumber: dto.episodeNumber,
            templateId: template.id,
            text: template.text,
            type: template.type,
            options: template.options,
            pointValue: template.pointValue,
            sortOrder: sortOrder++,
          },
          include: {
            template: true,
          },
        }),
      ),
    );

    return questions;
  }

  async updateLeagueQuestion(questionId: string, dto: UpdateLeagueQuestionDto) {
    const question = await this.prisma.leagueQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException(
        `League question with ID ${questionId} not found`,
      );
    }

    // Don't allow editing if already scored
    if (question.isScored) {
      throw new BadRequestException('Cannot edit a scored question');
    }

    return this.prisma.leagueQuestion.update({
      where: { id: questionId },
      data: {
        ...(dto.episodeNumber !== undefined && {
          episodeNumber: dto.episodeNumber,
        }),
        ...(dto.text !== undefined && { text: dto.text }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.options !== undefined && { options: dto.options }),
        ...(dto.pointValue !== undefined && { pointValue: dto.pointValue }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
      include: {
        template: true,
      },
    });
  }

  async deleteLeagueQuestion(questionId: string) {
    const question = await this.prisma.leagueQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException(
        `League question with ID ${questionId} not found`,
      );
    }

    // Don't allow deleting if already scored
    if (question.isScored) {
      throw new BadRequestException('Cannot delete a scored question');
    }

    await this.prisma.leagueQuestion.delete({
      where: { id: questionId },
    });

    return { success: true };
  }

  // ================== ANSWER METHODS (Players) ==================

  async canSubmitAnswers(
    leagueSeasonId: string,
    episodeNumber: number,
  ): Promise<boolean> {
    const leagueSeason = await this.prisma.leagueSeason.findUnique({
      where: { id: leagueSeasonId },
      include: {
        season: {
          include: {
            episodes: {
              where: { number: episodeNumber },
            },
          },
        },
      },
    });

    if (!leagueSeason) {
      return false;
    }

    const episode = leagueSeason.season.episodes[0];
    if (!episode || !episode.airDate) {
      // No episode or no air date set - allow submissions
      return true;
    }

    // Check if current time is before air date
    return new Date() < new Date(episode.airDate);
  }

  async getEpisodeQuestions(
    leagueId: string,
    seasonId: string,
    episodeNumber: number,
    userId: string,
  ) {
    const leagueSeason = await this.getLeagueSeason(leagueId, seasonId);

    // Get user's team in this league season
    const team = await this.prisma.team.findFirst({
      where: {
        leagueSeasonId: leagueSeason.id,
        ownerId: userId,
      },
    });

    if (!team) {
      throw new ForbiddenException(
        'You do not have a team in this league season',
      );
    }

    // Get questions with user's answers
    const questions = await this.prisma.leagueQuestion.findMany({
      where: {
        leagueSeasonId: leagueSeason.id,
        episodeNumber,
      },
      include: {
        answers: {
          where: {
            teamId: team.id,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    const canSubmit = await this.canSubmitAnswers(leagueSeason.id, episodeNumber);

    // Get episode info for deadline
    const episode = leagueSeason.season.episodes.find(
      (ep) => ep.number === episodeNumber,
    );

    return {
      episodeNumber,
      deadline: episode?.airDate || null,
      canSubmit,
      questions: questions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options,
        pointValue: q.pointValue,
        isScored: q.isScored,
        correctAnswer: q.isScored ? q.correctAnswer : null,
        myAnswer: q.answers[0]?.answer || null,
        pointsEarned: q.answers[0]?.pointsEarned ?? null,
      })),
    };
  }

  async submitAnswer(
    leagueId: string,
    seasonId: string,
    questionId: string,
    userId: string,
    dto: SubmitAnswerDto,
  ) {
    const leagueSeason = await this.getLeagueSeason(leagueId, seasonId);

    // Get the question
    const question = await this.prisma.leagueQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException(
        `League question with ID ${questionId} not found`,
      );
    }

    if (question.leagueSeasonId !== leagueSeason.id) {
      throw new BadRequestException(
        'Question does not belong to this league season',
      );
    }

    // Check deadline
    const canSubmit = await this.canSubmitAnswers(
      leagueSeason.id,
      question.episodeNumber,
    );
    if (!canSubmit) {
      throw new BadRequestException(
        'The deadline for submitting answers has passed',
      );
    }

    // Get user's team
    const team = await this.prisma.team.findFirst({
      where: {
        leagueSeasonId: leagueSeason.id,
        ownerId: userId,
      },
    });

    if (!team) {
      throw new ForbiddenException(
        'You do not have a team in this league season',
      );
    }

    // Validate MC answer
    if (question.type === 'MULTIPLE_CHOICE' && question.options) {
      const options = question.options as string[];
      if (!options.includes(dto.answer)) {
        throw new BadRequestException(
          'Invalid answer for multiple choice question',
        );
      }
    }

    // Upsert answer
    return this.prisma.playerAnswer.upsert({
      where: {
        leagueQuestionId_teamId: {
          leagueQuestionId: questionId,
          teamId: team.id,
        },
      },
      create: {
        leagueQuestionId: questionId,
        teamId: team.id,
        answer: dto.answer,
      },
      update: {
        answer: dto.answer,
        updatedAt: new Date(),
      },
      include: {
        leagueQuestion: true,
      },
    });
  }

  async getMyAnswers(leagueId: string, seasonId: string, userId: string) {
    const leagueSeason = await this.getLeagueSeason(leagueId, seasonId);

    // Get user's team
    const team = await this.prisma.team.findFirst({
      where: {
        leagueSeasonId: leagueSeason.id,
        ownerId: userId,
      },
    });

    if (!team) {
      throw new ForbiddenException(
        'You do not have a team in this league season',
      );
    }

    return this.prisma.playerAnswer.findMany({
      where: {
        teamId: team.id,
      },
      include: {
        leagueQuestion: true,
      },
      orderBy: {
        leagueQuestion: {
          episodeNumber: 'asc',
        },
      },
    });
  }

  // ================== SCORING METHODS (Commissioner) ==================

  async scoreQuestions(
    leagueId: string,
    seasonId: string,
    dto: SetCorrectAnswersDto,
  ) {
    const leagueSeason = await this.getLeagueSeason(leagueId, seasonId);

    // Verify all questions belong to this league season
    const questionIds = dto.answers.map((a) => a.questionId);
    const questions = await this.prisma.leagueQuestion.findMany({
      where: {
        id: { in: questionIds },
        leagueSeasonId: leagueSeason.id,
      },
      include: {
        answers: true,
      },
    });

    if (questions.length !== questionIds.length) {
      throw new BadRequestException(
        'One or more question IDs are invalid or do not belong to this league season',
      );
    }

    // Create a map of question ID to correct answer
    const answerMap = new Map(
      dto.answers.map((a) => [a.questionId, a.correctAnswer]),
    );

    // Process scoring in a transaction
    await this.prisma.$transaction(async (tx) => {
      // Track points earned per team
      const teamPointsChange = new Map<string, number>();

      for (const question of questions) {
        const correctAnswer = answerMap.get(question.id)!;

        // Update question with correct answer
        await tx.leagueQuestion.update({
          where: { id: question.id },
          data: {
            correctAnswer,
            isScored: true,
          },
        });

        // Score each player's answer
        for (const answer of question.answers) {
          const isCorrect =
            answer.answer.toLowerCase().trim() ===
            correctAnswer.toLowerCase().trim();
          const pointsEarned = isCorrect ? question.pointValue : 0;

          await tx.playerAnswer.update({
            where: { id: answer.id },
            data: { pointsEarned },
          });

          // Track points for this team
          const currentPoints = teamPointsChange.get(answer.teamId) || 0;
          teamPointsChange.set(answer.teamId, currentPoints + pointsEarned);
        }
      }

      // Update team total points
      for (const [teamId, pointsToAdd] of teamPointsChange) {
        await tx.team.update({
          where: { id: teamId },
          data: {
            totalPoints: {
              increment: pointsToAdd,
            },
          },
        });
      }
    });

    return { success: true, scoredCount: questions.length };
  }

  // ================== RESULTS METHODS (All Members) ==================

  async getEpisodeResults(
    leagueId: string,
    seasonId: string,
    episodeNumber: number,
    userId: string,
  ) {
    const leagueSeason = await this.getLeagueSeason(leagueId, seasonId);

    // Get user's team (to identify their answers)
    const userTeam = await this.prisma.team.findFirst({
      where: {
        leagueSeasonId: leagueSeason.id,
        ownerId: userId,
      },
    });

    // Check if deadline has passed
    const canSubmit = await this.canSubmitAnswers(leagueSeason.id, episodeNumber);

    // Get all questions with all answers
    const questions = await this.prisma.leagueQuestion.findMany({
      where: {
        leagueSeasonId: leagueSeason.id,
        episodeNumber,
      },
      include: {
        answers: {
          include: {
            team: {
              include: {
                owner: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Get episode info
    const episode = leagueSeason.season.episodes.find(
      (ep) => ep.number === episodeNumber,
    );

    // If deadline hasn't passed, only show user's own answers
    const formattedQuestions = questions.map((q) => {
      const visibleAnswers = canSubmit
        ? q.answers.filter((a) => userTeam && a.teamId === userTeam.id)
        : q.answers;

      return {
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options,
        pointValue: q.pointValue,
        isScored: q.isScored,
        correctAnswer: q.isScored ? q.correctAnswer : null,
        answers: visibleAnswers.map((a) => ({
          teamId: a.teamId,
          teamName: a.team.name,
          ownerName: a.team.owner.name || a.team.owner.email,
          answer: a.answer,
          pointsEarned: a.pointsEarned,
          isCurrentUser: userTeam && a.teamId === userTeam.id,
        })),
      };
    });

    // Calculate leaderboard for this episode
    const teamScores = new Map<
      string,
      { teamId: string; teamName: string; ownerName: string | null; points: number }
    >();

    for (const q of questions) {
      if (q.isScored) {
        for (const a of q.answers) {
          const existing = teamScores.get(a.teamId);
          if (existing) {
            existing.points += a.pointsEarned || 0;
          } else {
            teamScores.set(a.teamId, {
              teamId: a.teamId,
              teamName: a.team.name,
              ownerName: a.team.owner.name || a.team.owner.email,
              points: a.pointsEarned || 0,
            });
          }
        }
      }
    }

    const leaderboard = Array.from(teamScores.values())
      .sort((a, b) => b.points - a.points)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
        isCurrentUser: userTeam && entry.teamId === userTeam.id,
      }));

    return {
      episodeNumber,
      episodeTitle: episode?.title || null,
      airDate: episode?.airDate || null,
      deadlinePassed: !canSubmit,
      isFullyScored: questions.every((q) => q.isScored),
      questions: formattedQuestions,
      leaderboard,
    };
  }

  // ================== STATUS METHODS ==================

  async getQuestionStatus(leagueId: string, seasonId: string, userId: string) {
    const leagueSeason = await this.getLeagueSeason(leagueId, seasonId);

    // Get user's team
    const team = await this.prisma.team.findFirst({
      where: {
        leagueSeasonId: leagueSeason.id,
        ownerId: userId,
      },
    });

    // Get current episode from season
    const currentEpisode = leagueSeason.season.activeEpisode;

    // Get episode info
    const episode = leagueSeason.season.episodes.find(
      (ep) => ep.number === currentEpisode,
    );

    // Get questions for current episode
    const questions = await this.prisma.leagueQuestion.findMany({
      where: {
        leagueSeasonId: leagueSeason.id,
        episodeNumber: currentEpisode,
      },
      include: team
        ? {
            answers: {
              where: { teamId: team.id },
            },
          }
        : undefined,
    });

    const totalQuestions = questions.length;
    const answeredQuestions = team
      ? questions.filter((q) => q.answers && q.answers.length > 0).length
      : 0;

    const canSubmit = await this.canSubmitAnswers(leagueSeason.id, currentEpisode);

    return {
      currentEpisode,
      deadline: episode?.airDate || null,
      canSubmit,
      totalQuestions,
      answeredQuestions,
      questionsRemaining: totalQuestions - answeredQuestions,
      hasQuestions: totalQuestions > 0,
    };
  }
}

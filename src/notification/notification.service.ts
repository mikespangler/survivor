import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateNotificationPreferencesDto } from './dto';
import {
  getQuestionsReminderHtml,
  getDraftReminderHtml,
  getResultsAvailableHtml,
  getScoringReminderHtml,
  getQuestionsSetupReminderHtml,
} from './templates';

export type NotificationType =
  | 'QUESTIONS_REMINDER'
  | 'DRAFT_REMINDER'
  | 'RESULTS_AVAILABLE'
  | 'SCORING_REMINDER'
  | 'QUESTIONS_SETUP_REMINDER';

export interface NotificationContext {
  leagueId?: string;
  episodeNumber?: number;
  draftConfigId?: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private resend: Resend;
  private fromEmail: string;
  private appUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const apiKey = this.config.get('RESEND_API_KEY');
    this.logger.log(`Initializing NotificationService with API key: ${apiKey ? 'SET' : 'NOT SET'}`);
    this.resend = new Resend(apiKey);
    this.fromEmail = this.config.get('FROM_EMAIL') || 'noreply@outpickoutlast.com';
    this.appUrl = this.config.get('APP_URL') || 'http://localhost:3001';
    this.logger.log(`From email: ${this.fromEmail}, App URL: ${this.appUrl}`);
  }

  // ================== PREFERENCES METHODS ==================

  async getPreferences(userId: string) {
    let preferences = await this.prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Create default preferences
      preferences = await this.prisma.notificationPreferences.create({
        data: { userId },
      });
    }

    return preferences;
  }

  async updatePreferences(userId: string, dto: UpdateNotificationPreferencesDto) {
    // Upsert preferences
    return this.prisma.notificationPreferences.upsert({
      where: { userId },
      create: {
        userId,
        ...dto,
      },
      update: dto,
    });
  }

  // ================== NOTIFICATION CHECK METHODS ==================

  async shouldSendNotification(
    userId: string,
    type: NotificationType,
    context: NotificationContext,
  ): Promise<boolean> {
    this.logger.log(`Checking if should send ${type} to user ${userId}`);

    // Check if already sent
    const existing = await this.prisma.sentNotification.findUnique({
      where: {
        userId_notificationType_leagueId_episodeNumber: {
          userId,
          notificationType: type,
          leagueId: context.leagueId || null,
          episodeNumber: context.episodeNumber || null,
        },
      },
    });

    if (existing) {
      this.logger.log(`Notification ${type} already sent to user ${userId} - skipping`);
      return false;
    }

    // Check user preferences
    const preferences = await this.getPreferences(userId);

    if (preferences.emailFrequency === 'never') {
      this.logger.log(`User ${userId} has email frequency set to 'never' - skipping`);
      return false;
    }

    // Check specific notification type preference
    let allowed = true;
    switch (type) {
      case 'QUESTIONS_REMINDER':
        allowed = preferences.weeklyQuestionsReminder;
        break;
      case 'DRAFT_REMINDER':
        allowed = preferences.draftReminder;
        break;
      case 'RESULTS_AVAILABLE':
        allowed = preferences.resultsAvailable;
        break;
      case 'SCORING_REMINDER':
        allowed = preferences.scoringReminder;
        break;
      case 'QUESTIONS_SETUP_REMINDER':
        allowed = preferences.questionsSetupReminder;
        break;
    }

    if (!allowed) {
      this.logger.log(`User ${userId} has ${type} preference disabled - skipping`);
    } else {
      this.logger.log(`User ${userId} approved for ${type} notification`);
    }

    return allowed;
  }

  private async markNotificationSent(
    userId: string,
    type: NotificationType,
    context: NotificationContext,
  ): Promise<void> {
    await this.prisma.sentNotification.create({
      data: {
        userId,
        notificationType: type,
        leagueId: context.leagueId || null,
        episodeNumber: context.episodeNumber || null,
      },
    });
  }

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<boolean> {
    this.logger.log(`Attempting to send email to: ${to}`);
    this.logger.log(`Subject: ${subject}`);
    this.logger.log(`From: Survivor Fantasy League <${this.fromEmail}>`);

    try {
      const result = await this.resend.emails.send({
        from: `Survivor Fantasy League <${this.fromEmail}>`,
        to: [to],
        subject,
        html,
      });

      this.logger.log(`Email sent successfully! Result: ${JSON.stringify(result)}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      this.logger.error(`Full error: ${JSON.stringify(error)}`);
      return false;
    }
  }

  // ================== NOTIFICATION SEND METHODS ==================

  async sendQuestionsReminder(
    userId: string,
    leagueId: string,
    seasonId: string,
    episodeNumber: number,
  ): Promise<boolean> {
    const context: NotificationContext = { leagueId, episodeNumber };

    if (!(await this.shouldSendNotification(userId, 'QUESTIONS_REMINDER', context))) {
      return false;
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.email) return false;

    // Get league and episode info
    const leagueSeason = await this.prisma.leagueSeason.findUnique({
      where: {
        leagueId_seasonId: { leagueId, seasonId },
      },
      include: {
        league: true,
        season: {
          include: {
            episodes: { where: { number: episodeNumber } },
          },
        },
      },
    });

    if (!leagueSeason) return false;

    const episode = leagueSeason.season.episodes[0];
    if (!episode?.airDate) return false;

    // Get question counts
    const team = await this.prisma.team.findFirst({
      where: { leagueSeasonId: leagueSeason.id, ownerId: userId },
    });

    const questions = await this.prisma.leagueQuestion.findMany({
      where: { leagueSeasonId: leagueSeason.id, episodeNumber },
      include: {
        answers: team ? { where: { teamId: team.id } } : undefined,
      },
    });

    const questionsCount = questions.length;
    const answeredCount = questions.filter((q) => q.answers?.length > 0).length;

    const html = getQuestionsReminderHtml({
      userName: user.name || '',
      leagueName: leagueSeason.league.name,
      episodeNumber,
      deadline: new Date(episode.airDate),
      questionsUrl: `${this.appUrl}/leagues/${leagueId}/questions?episode=${episodeNumber}`,
      preferencesUrl: `${this.appUrl}/profile`,
      questionsCount,
      answeredCount,
    });

    const sent = await this.sendEmail(
      user.email,
      `Reminder: Answer Episode ${episodeNumber} questions for ${leagueSeason.league.name}`,
      html,
    );

    if (sent) {
      await this.markNotificationSent(userId, 'QUESTIONS_REMINDER', context);
    }
    return sent;
  }

  async sendDraftReminder(
    userId: string,
    leagueId: string,
    seasonId: string,
    draftConfigId: string,
  ): Promise<boolean> {
    const context: NotificationContext = { leagueId, draftConfigId };

    if (!(await this.shouldSendNotification(userId, 'DRAFT_REMINDER', context))) {
      return false;
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.email) return false;

    const draftConfig = await this.prisma.draftConfig.findUnique({
      where: { id: draftConfigId },
      include: {
        leagueSeason: {
          include: { league: true },
        },
      },
    });

    if (!draftConfig?.draftDate) return false;

    const html = getDraftReminderHtml({
      userName: user.name || '',
      leagueName: draftConfig.leagueSeason.league.name,
      draftDate: new Date(draftConfig.draftDate),
      draftUrl: `${this.appUrl}/leagues/${leagueId}/draft?round=${draftConfig.roundNumber}`,
      preferencesUrl: `${this.appUrl}/profile`,
      castawaysPerTeam: draftConfig.castawaysPerTeam,
      roundNumber: draftConfig.roundNumber,
    });

    const sent = await this.sendEmail(
      user.email,
      `Draft Reminder: ${draftConfig.leagueSeason.league.name}`,
      html,
    );

    if (sent) {
      await this.markNotificationSent(userId, 'DRAFT_REMINDER', context);
    }
    return sent;
  }

  async sendResultsAvailable(
    userId: string,
    leagueId: string,
    seasonId: string,
    episodeNumber: number,
  ): Promise<boolean> {
    const context: NotificationContext = { leagueId, episodeNumber };

    if (!(await this.shouldSendNotification(userId, 'RESULTS_AVAILABLE', context))) {
      return false;
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.email) return false;

    const leagueSeason = await this.prisma.leagueSeason.findUnique({
      where: {
        leagueId_seasonId: { leagueId, seasonId },
      },
      include: { league: true },
    });

    if (!leagueSeason) return false;

    // Get user's episode stats
    const team = await this.prisma.team.findFirst({
      where: { leagueSeasonId: leagueSeason.id, ownerId: userId },
    });

    let userPoints: number | undefined;
    let userRank: number | undefined;
    let totalTeams: number | undefined;

    if (team) {
      const episodePoints = await this.prisma.teamEpisodePoints.findUnique({
        where: {
          teamId_episodeNumber: { teamId: team.id, episodeNumber },
        },
      });

      userPoints = episodePoints?.totalEpisodePoints;

      // Calculate rank
      const allTeamPoints = await this.prisma.teamEpisodePoints.findMany({
        where: {
          episodeNumber,
          team: { leagueSeasonId: leagueSeason.id },
        },
        orderBy: { totalEpisodePoints: 'desc' },
      });

      totalTeams = allTeamPoints.length;
      const rankIndex = allTeamPoints.findIndex((tp) => tp.teamId === team.id);
      userRank = rankIndex >= 0 ? rankIndex + 1 : undefined;
    }

    const html = getResultsAvailableHtml({
      userName: user.name || '',
      leagueName: leagueSeason.league.name,
      episodeNumber,
      resultsUrl: `${this.appUrl}/leagues/${leagueId}/results?episode=${episodeNumber}`,
      preferencesUrl: `${this.appUrl}/profile`,
      userPoints,
      userRank,
      totalTeams,
    });

    const sent = await this.sendEmail(
      user.email,
      `Episode ${episodeNumber} Results Available - ${leagueSeason.league.name}`,
      html,
    );

    if (sent) {
      await this.markNotificationSent(userId, 'RESULTS_AVAILABLE', context);
    }
    return sent;
  }

  async sendScoringReminder(
    userId: string,
    leagueId: string,
    seasonId: string,
    episodeNumber: number,
  ): Promise<boolean> {
    const context: NotificationContext = { leagueId, episodeNumber };

    if (!(await this.shouldSendNotification(userId, 'SCORING_REMINDER', context))) {
      return false;
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.email) return false;

    const leagueSeason = await this.prisma.leagueSeason.findUnique({
      where: {
        leagueId_seasonId: { leagueId, seasonId },
      },
      include: { league: true },
    });

    if (!leagueSeason) return false;

    // Get question counts
    const questions = await this.prisma.leagueQuestion.findMany({
      where: { leagueSeasonId: leagueSeason.id, episodeNumber },
    });

    const totalQuestions = questions.length;
    const scoredQuestions = questions.filter((q) => q.isScored).length;

    const html = getScoringReminderHtml({
      userName: user.name || '',
      leagueName: leagueSeason.league.name,
      episodeNumber,
      scoringUrl: `${this.appUrl}/leagues/${leagueId}/settings/questions?episode=${episodeNumber}`,
      preferencesUrl: `${this.appUrl}/profile`,
      totalQuestions,
      scoredQuestions,
    });

    const sent = await this.sendEmail(
      user.email,
      `Scoring Needed: Episode ${episodeNumber} - ${leagueSeason.league.name}`,
      html,
    );

    if (sent) {
      await this.markNotificationSent(userId, 'SCORING_REMINDER', context);
    }
    return sent;
  }

  async sendQuestionsSetupReminder(
    userId: string,
    leagueId: string,
    seasonId: string,
    episodeNumber: number,
  ): Promise<boolean> {
    const context: NotificationContext = { leagueId, episodeNumber };

    if (!(await this.shouldSendNotification(userId, 'QUESTIONS_SETUP_REMINDER', context))) {
      return false;
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.email) return false;

    const leagueSeason = await this.prisma.leagueSeason.findUnique({
      where: {
        leagueId_seasonId: { leagueId, seasonId },
      },
      include: {
        league: true,
        season: {
          include: {
            episodes: { where: { number: episodeNumber } },
          },
        },
      },
    });

    if (!leagueSeason) return false;

    const episode = leagueSeason.season.episodes[0];

    const html = getQuestionsSetupReminderHtml({
      userName: user.name || '',
      leagueName: leagueSeason.league.name,
      episodeNumber,
      setupUrl: `${this.appUrl}/leagues/${leagueId}/settings/questions?episode=${episodeNumber}`,
      preferencesUrl: `${this.appUrl}/profile`,
      airDate: episode?.airDate ? new Date(episode.airDate) : undefined,
    });

    const sent = await this.sendEmail(
      user.email,
      `Action Needed: Create Episode ${episodeNumber} Questions - ${leagueSeason.league.name}`,
      html,
    );

    if (sent) {
      await this.markNotificationSent(userId, 'QUESTIONS_SETUP_REMINDER', context);
    }
    return sent;
  }

  // ================== BULK NOTIFICATION METHODS ==================

  async sendResultsForEpisode(
    leagueSeasonId: string,
    episodeNumber: number,
  ): Promise<number> {
    const leagueSeason = await this.prisma.leagueSeason.findUnique({
      where: { id: leagueSeasonId },
      include: {
        league: {
          include: { members: true },
        },
      },
    });

    if (!leagueSeason) return 0;

    let sentCount = 0;
    for (const member of leagueSeason.league.members) {
      const sent = await this.sendResultsAvailable(
        member.id,
        leagueSeason.leagueId,
        leagueSeason.seasonId,
        episodeNumber,
      );
      if (sent) sentCount++;
    }

    return sentCount;
  }

  // ================== TEST METHOD ==================

  async sendTestEmail(userId: string): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user?.email) {
      return { success: false, message: 'User has no email address' };
    }

    this.logger.log(`Sending test email to ${user.email}`);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #F06542; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; }
            .content h2 { color: #333; margin-top: 0; }
            .content p { color: #555; line-height: 1.6; }
            .success { background: #d4edda; border: 1px solid #28a745; padding: 15px; border-radius: 8px; color: #155724; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Survivor Fantasy League</h1>
            </div>
            <div class="content">
              <h2>Test Email</h2>
              <div class="success">
                <p><strong>Success!</strong> If you're reading this, email notifications are working correctly.</p>
              </div>
              <p style="margin-top: 20px; color: #666;">
                This test was sent at: ${new Date().toISOString()}
              </p>
              <p style="color: #666;">
                From: ${this.fromEmail}<br>
                App URL: ${this.appUrl}
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const sent = await this.sendEmail(
      user.email,
      'Test Email - Survivor Fantasy League',
      html,
    );

    return {
      success: sent,
      message: sent
        ? `Test email sent to ${user.email}`
        : `Failed to send test email to ${user.email} - check server logs`,
    };
  }
}

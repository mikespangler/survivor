import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from './notification.service';
import { EpisodeState } from '../episode/episode-state.service';

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async processScheduledNotifications() {
    this.logger.log('Processing scheduled notifications...');

    await this.processQuestionsReminders();
    await this.processDraftReminders();
    await this.processScoringReminders();
    await this.processQuestionsSetupReminders();

    this.logger.log('Finished processing scheduled notifications');
  }

  async processQuestionsReminders() {
    this.logger.log('Processing questions reminders...');

    const now = new Date();

    // Get all active league seasons with episodes that have air dates coming up
    const leagueSeasons = await this.prisma.leagueSeason.findMany({
      where: {
        season: {
          status: 'ACTIVE',
        },
      },
      include: {
        league: {
          include: {
            members: {
              include: {
                notificationPreferences: true,
              },
            },
          },
        },
        season: {
          include: {
            episodes: true,
          },
        },
      },
    });

    for (const leagueSeason of leagueSeasons) {
      const activeEpisode = leagueSeason.season.activeEpisode;
      const episode = leagueSeason.season.episodes.find(
        (e) => e.number === activeEpisode,
      );

      if (!episode?.airDate) continue;

      const airDate = new Date(episode.airDate);
      if (airDate <= now) continue; // Episode already aired

      // Check if questions exist for this episode
      const questions = await this.prisma.leagueQuestion.findMany({
        where: {
          leagueSeasonId: leagueSeason.id,
          episodeNumber: activeEpisode,
        },
      });

      if (questions.length === 0) continue; // No questions set up yet

      // Send reminders to members based on their preferences
      for (const member of leagueSeason.league.members) {
        const prefs = member.notificationPreferences;
        if (!prefs || !prefs.weeklyQuestionsReminder) continue;
        if (prefs.emailFrequency === 'never') continue;

        // Check if we're within the reminder window
        const hoursUntilDeadline = (airDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (hoursUntilDeadline > prefs.reminderHoursBefore) continue;

        // Check if user has a team and hasn't answered all questions
        const team = await this.prisma.team.findFirst({
          where: {
            leagueSeasonId: leagueSeason.id,
            ownerId: member.id,
          },
        });

        if (!team) continue;

        const answers = await this.prisma.playerAnswer.findMany({
          where: {
            teamId: team.id,
            leagueQuestion: {
              episodeNumber: activeEpisode,
              leagueSeasonId: leagueSeason.id,
            },
          },
        });

        // Only send if not all questions answered
        if (answers.length >= questions.length) continue;

        try {
          await this.notificationService.sendQuestionsReminder(
            member.id,
            leagueSeason.leagueId,
            leagueSeason.seasonId,
            activeEpisode,
          );
        } catch (error) {
          this.logger.error(
            `Failed to send questions reminder to ${member.email}: ${error.message}`,
          );
        }
      }
    }
  }

  async processDraftReminders() {
    this.logger.log('Processing draft reminders...');

    const now = new Date();

    // Get pending drafts with upcoming deadlines
    const draftConfigs = await this.prisma.draftConfig.findMany({
      where: {
        status: 'PENDING',
        draftDate: {
          gt: now, // Not yet passed
        },
      },
      include: {
        leagueSeason: {
          include: {
            league: {
              include: {
                members: {
                  include: {
                    notificationPreferences: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    for (const draftConfig of draftConfigs) {
      if (!draftConfig.draftDate) continue;

      const draftDate = new Date(draftConfig.draftDate);

      for (const member of draftConfig.leagueSeason.league.members) {
        const prefs = member.notificationPreferences;
        if (!prefs || !prefs.draftReminder) continue;
        if (prefs.emailFrequency === 'never') continue;

        // Check if we're within the reminder window
        const hoursUntilDraft = (draftDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (hoursUntilDraft > prefs.reminderHoursBefore) continue;

        // Check if user has already completed their draft
        const team = await this.prisma.team.findFirst({
          where: {
            leagueSeasonId: draftConfig.leagueSeasonId,
            ownerId: member.id,
          },
          include: {
            roster: {
              where: {
                startEpisode: draftConfig.roundNumber,
              },
            },
          },
        });

        if (!team) continue;

        // If team has enough castaways for this round, they've completed the draft
        if (team.roster.length >= draftConfig.castawaysPerTeam) continue;

        try {
          await this.notificationService.sendDraftReminder(
            member.id,
            draftConfig.leagueSeason.leagueId,
            draftConfig.leagueSeason.seasonId,
            draftConfig.id,
          );
        } catch (error) {
          this.logger.error(
            `Failed to send draft reminder to ${member.email}: ${error.message}`,
          );
        }
      }
    }
  }

  async processScoringReminders() {
    this.logger.log('Processing scoring reminders...');

    const now = new Date();

    // Get all active league seasons
    const leagueSeasons = await this.prisma.leagueSeason.findMany({
      where: {
        season: {
          status: 'ACTIVE',
        },
      },
      include: {
        league: {
          include: {
            owner: {
              include: { notificationPreferences: true },
            },
            commissioners: {
              include: { notificationPreferences: true },
            },
          },
        },
        season: {
          include: {
            episodes: true,
          },
        },
      },
    });

    for (const leagueSeason of leagueSeasons) {
      // Check each episode that may need scoring
      for (const episode of leagueSeason.season.episodes) {
        if (episode.number > leagueSeason.season.activeEpisode) continue;
        if (!episode.airDate) continue;

        const airDate = new Date(episode.airDate);
        if (airDate > now) continue; // Episode hasn't aired yet

        // Get questions for this episode
        const questions = await this.prisma.leagueQuestion.findMany({
          where: {
            leagueSeasonId: leagueSeason.id,
            episodeNumber: episode.number,
          },
        });

        if (questions.length === 0) continue;

        const scoredCount = questions.filter((q) => q.isScored).length;
        if (scoredCount === questions.length) continue; // Fully scored

        // Send to owner and commissioners
        const commissioners = [
          leagueSeason.league.owner,
          ...leagueSeason.league.commissioners,
        ];

        for (const commissioner of commissioners) {
          const prefs = commissioner.notificationPreferences;
          if (!prefs || !prefs.scoringReminder) continue;
          if (prefs.emailFrequency === 'never') continue;

          try {
            await this.notificationService.sendScoringReminder(
              commissioner.id,
              leagueSeason.leagueId,
              leagueSeason.seasonId,
              episode.number,
            );
          } catch (error) {
            this.logger.error(
              `Failed to send scoring reminder to ${commissioner.email}: ${error.message}`,
            );
          }
        }
      }
    }
  }

  async processQuestionsSetupReminders() {
    this.logger.log('Processing questions setup reminders...');

    const now = new Date();

    // Get all active league seasons
    const leagueSeasons = await this.prisma.leagueSeason.findMany({
      where: {
        season: {
          status: 'ACTIVE',
        },
      },
      include: {
        league: {
          include: {
            owner: {
              include: { notificationPreferences: true },
            },
            commissioners: {
              include: { notificationPreferences: true },
            },
          },
        },
        season: {
          include: {
            episodes: true,
          },
        },
      },
    });

    for (const leagueSeason of leagueSeasons) {
      const activeEpisode = leagueSeason.season.activeEpisode;
      const episode = leagueSeason.season.episodes.find(
        (e) => e.number === activeEpisode,
      );

      // Check if questions exist
      const questions = await this.prisma.leagueQuestion.findMany({
        where: {
          leagueSeasonId: leagueSeason.id,
          episodeNumber: activeEpisode,
        },
      });

      if (questions.length > 0) continue; // Questions already set up

      // Send to owner and commissioners
      const commissioners = [
        leagueSeason.league.owner,
        ...leagueSeason.league.commissioners,
      ];

      for (const commissioner of commissioners) {
        const prefs = commissioner.notificationPreferences;
        if (!prefs || !prefs.questionsSetupReminder) continue;
        if (prefs.emailFrequency === 'never') continue;

        // Check timing - send if within reminder window before air date
        if (episode?.airDate) {
          const airDate = new Date(episode.airDate);
          const hoursUntilAir = (airDate.getTime() - now.getTime()) / (1000 * 60 * 60);

          // Only send if within 48 hours of air date and air date hasn't passed
          if (hoursUntilAir > 48 || hoursUntilAir < 0) continue;
        }

        try {
          await this.notificationService.sendQuestionsSetupReminder(
            commissioner.id,
            leagueSeason.leagueId,
            leagueSeason.seasonId,
            activeEpisode,
          );
        } catch (error) {
          this.logger.error(
            `Failed to send questions setup reminder to ${commissioner.email}: ${error.message}`,
          );
        }
      }
    }
  }
}

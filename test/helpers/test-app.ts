import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LeagueModule } from '../../src/league/league.module';
import { QuestionModule } from '../../src/question/question.module';
import { TeamModule } from '../../src/team/team.module';
import { EpisodeModule } from '../../src/episode/episode.module';
import { AnalyticsModule } from '../../src/analytics/analytics.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { LeagueService } from '../../src/league/league.service';
import { QuestionService } from '../../src/question/question.service';
import { TeamService } from '../../src/team/team.service';
import { EpisodeStateService } from '../../src/episode/episode-state.service';
import { AnalyticsService } from '../../src/analytics/analytics.service';
import { EmailService } from '../../src/email/email.service';
import { NotificationService } from '../../src/notification/notification.service';

export interface TestApp {
  module: TestingModule;
  prisma: PrismaService;
  leagueService: LeagueService;
  questionService: QuestionService;
  teamService: TeamService;
  episodeStateService: EpisodeStateService;
  analyticsService: AnalyticsService;
}

export async function createTestApp(): Promise<TestApp> {
  const module = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        // Provide minimal config so services don't crash
        load: [
          () => ({
            DATABASE_URL: process.env.DATABASE_URL,
            CLERK_SECRET_KEY: 'test_key',
            RESEND_API_KEY: 'test_key',
            FROM_EMAIL: 'test@test.com',
            APP_URL: 'http://localhost:3000',
          }),
        ],
      }),
      LeagueModule,
      QuestionModule,
      TeamModule,
      EpisodeModule,
      AnalyticsModule,
    ],
  })
    .overrideProvider(EmailService)
    .useValue({
      sendLeagueInvite: async () => {},
    })
    .overrideProvider(NotificationService)
    .useValue({
      sendResultsForEpisode: async () => 0,
      sendResultsAvailable: async () => false,
      sendQuestionsReminder: async () => false,
      sendDraftReminder: async () => false,
      sendScoringReminder: async () => false,
      sendQuestionsSetupReminder: async () => false,
      sendCommissionerMessageToLeague: async () => 0,
      sendCommissionerMessageEmail: async () => false,
      getPreferences: async () => ({}),
      updatePreferences: async () => ({}),
      shouldSendNotification: async () => false,
      sendTestEmail: async () => ({ success: true, message: 'mocked' }),
    })
    .compile();

  const prisma = module.get(PrismaService);
  const leagueService = module.get(LeagueService);
  const questionService = module.get(QuestionService);
  const teamService = module.get(TeamService);
  const episodeStateService = module.get(EpisodeStateService);
  const analyticsService = module.get(AnalyticsService);

  return {
    module,
    prisma,
    leagueService,
    questionService,
    teamService,
    episodeStateService,
    analyticsService,
  };
}

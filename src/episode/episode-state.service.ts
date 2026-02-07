import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type EpisodeState =
  | 'FUTURE'
  | 'QUESTIONS_NOT_READY'
  | 'SUBMISSIONS_OPEN'
  | 'SUBMISSIONS_CLOSED'
  | 'PARTIALLY_SCORED'
  | 'FULLY_SCORED';

export interface ComputedEpisodeState {
  episodeNumber: number;
  state: EpisodeState;
  airDate: Date | null;
  totalQuestions: number;
  scoredQuestions: number;
  canSubmit: boolean;
  needsScoring: boolean;
  questionsReady: boolean;
  isCurrentEpisode: boolean;
}

export interface LeagueEpisodeStatesResponse {
  episodes: ComputedEpisodeState[];
  currentEpisode: number;
  isCommissioner: boolean;
  commissionerActions: CommissionerAction[];
}

export interface CommissionerAction {
  episodeNumber: number;
  action: 'CREATE_QUESTIONS' | 'SCORE_QUESTIONS' | 'CONTINUE_SCORING';
  label: string;
  priority: 'high' | 'medium' | 'low';
}

@Injectable()
export class EpisodeStateService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Compute the state of a single episode based on its data
   */
  computeEpisodeState(
    episodeNumber: number,
    activeEpisode: number,
    questions: { isScored: boolean }[],
    airDate: Date | null,
  ): EpisodeState {
    // Episode hasn't aired yet (future episode)
    if (episodeNumber > activeEpisode) {
      return 'FUTURE';
    }

    // No questions created yet
    if (questions.length === 0) {
      return 'QUESTIONS_NOT_READY';
    }

    const now = new Date();
    const scoredCount = questions.filter((q) => q.isScored).length;
    const totalCount = questions.length;

    // Before air date - submissions still open
    if (airDate && now < airDate) {
      return 'SUBMISSIONS_OPEN';
    }

    // Past air date, check scoring status
    if (scoredCount === 0) {
      return 'SUBMISSIONS_CLOSED';
    }

    if (scoredCount < totalCount) {
      return 'PARTIALLY_SCORED';
    }

    return 'FULLY_SCORED';
  }

  /**
   * Get all episode states for a league season
   */
  async getLeagueEpisodeStates(
    leagueId: string,
    seasonId: string,
    userId: string,
  ): Promise<LeagueEpisodeStatesResponse> {
    // Get league season with season data
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
            episodes: {
              orderBy: { number: 'asc' },
            },
          },
        },
        league: {
          include: {
            commissioners: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!leagueSeason) {
      throw new Error('League season not found');
    }

    const activeEpisode = leagueSeason.season.activeEpisode;
    const isOwner = leagueSeason.league.ownerId === userId;
    const isCommissioner =
      isOwner ||
      leagueSeason.league.commissioners.some((c) => c.id === userId);

    // Get all questions for this league season grouped by episode
    const questions = await this.prisma.leagueQuestion.findMany({
      where: {
        leagueSeasonId: leagueSeason.id,
      },
      select: {
        episodeNumber: true,
        isScored: true,
      },
    });

    // Group questions by episode
    const questionsByEpisode = new Map<
      number,
      { isScored: boolean }[]
    >();
    for (const q of questions) {
      const existing = questionsByEpisode.get(q.episodeNumber) || [];
      existing.push({ isScored: q.isScored });
      questionsByEpisode.set(q.episodeNumber, existing);
    }

    // Compute state for each episode
    const episodes: ComputedEpisodeState[] = [];
    const commissionerActions: CommissionerAction[] = [];

    for (const episode of leagueSeason.season.episodes) {
      const episodeQuestions = questionsByEpisode.get(episode.number) || [];
      const state = this.computeEpisodeState(
        episode.number,
        activeEpisode,
        episodeQuestions,
        episode.airDate,
      );

      const scoredCount = episodeQuestions.filter((q) => q.isScored).length;
      const totalCount = episodeQuestions.length;
      const now = new Date();
      const canSubmit = episode.airDate ? now < episode.airDate : true;

      episodes.push({
        episodeNumber: episode.number,
        state,
        airDate: episode.airDate,
        totalQuestions: totalCount,
        scoredQuestions: scoredCount,
        canSubmit: canSubmit && state === 'SUBMISSIONS_OPEN',
        needsScoring:
          state === 'SUBMISSIONS_CLOSED' || state === 'PARTIALLY_SCORED',
        questionsReady: totalCount > 0,
        isCurrentEpisode: episode.number === activeEpisode,
      });

      // Add commissioner actions
      if (isCommissioner) {
        if (state === 'QUESTIONS_NOT_READY' && episode.number <= activeEpisode) {
          commissionerActions.push({
            episodeNumber: episode.number,
            action: 'CREATE_QUESTIONS',
            label: `Create questions for Episode ${episode.number}`,
            priority: episode.number === activeEpisode ? 'high' : 'medium',
          });
        } else if (state === 'SUBMISSIONS_CLOSED') {
          commissionerActions.push({
            episodeNumber: episode.number,
            action: 'SCORE_QUESTIONS',
            label: `Score Episode ${episode.number} (${totalCount} questions)`,
            priority: 'high',
          });
        } else if (state === 'PARTIALLY_SCORED') {
          commissionerActions.push({
            episodeNumber: episode.number,
            action: 'CONTINUE_SCORING',
            label: `Continue scoring Episode ${episode.number} (${scoredCount}/${totalCount})`,
            priority: 'high',
          });
        }
      }
    }

    // Sort actions by priority
    commissionerActions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return {
      episodes,
      currentEpisode: activeEpisode,
      isCommissioner,
      commissionerActions,
    };
  }

  /**
   * Get the current episode state for a league season
   */
  async getCurrentEpisodeState(
    leagueId: string,
    seasonId: string,
    userId: string,
  ): Promise<ComputedEpisodeState | null> {
    const result = await this.getLeagueEpisodeStates(leagueId, seasonId, userId);
    return (
      result.episodes.find((e) => e.isCurrentEpisode) || result.episodes[0] || null
    );
  }

  /**
   * Get episode state for a specific episode
   */
  async getEpisodeState(
    leagueSeasonId: string,
    episodeNumber: number,
  ): Promise<EpisodeState> {
    // Get the league season with season data
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
      return 'QUESTIONS_NOT_READY';
    }

    const activeEpisode = leagueSeason.season.activeEpisode;
    const episode = leagueSeason.season.episodes[0];
    const airDate = episode?.airDate || null;

    // Get questions for this episode
    const questions = await this.prisma.leagueQuestion.findMany({
      where: {
        leagueSeasonId,
        episodeNumber,
      },
      select: {
        isScored: true,
      },
    });

    return this.computeEpisodeState(
      episodeNumber,
      activeEpisode,
      questions,
      airDate,
    );
  }
}

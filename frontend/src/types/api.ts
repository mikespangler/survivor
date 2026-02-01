// TypeScript types matching Prisma schema

export interface User {
  id: string;
  clerkId: string;
  email: string | null;
  name: string | null;
  systemRole: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface League {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  owner?: User;
  members?: User[];
  commissioners?: User[];
  leagueSeasons?: LeagueSeason[];
  createdAt: string;
}

export interface Season {
  id: string;
  number: number;
  name: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  startDate?: string;
  activeEpisode?: number;
  castaways?: Castaway[];
  episodes?: Episode[];
  leagueSeasons?: LeagueSeason[];
}

export interface LeagueSeason {
  id: string;
  leagueId: string;
  league?: League;
  seasonId: string;
  season?: Season;
  teams?: Team[];
  settings?: LeagueSeasonSettings;
  draftConfigs?: DraftConfig[];
}

export interface LeagueSeasonSettings {
  id: string;
  leagueSeasonId: string;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface DraftConfig {
  id: string;
  leagueSeasonId: string;
  roundNumber: number;
  castawaysPerTeam: number;
  draftDate?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  logoImageUrl?: string | null;
  leagueSeasonId: string;
  leagueSeason?: LeagueSeason;
  ownerId: string;
  owner?: User;
  roster?: TeamCastaway[];
  totalPoints: number;
}

export interface Castaway {
  id: string;
  name: string;
  seasonId: string;
  season?: Season;
  status: 'ACTIVE' | 'ELIMINATED' | 'JURY';
  imageUrl?: string | null;
  teams?: TeamCastaway[];
}

export interface TeamCastaway {
  id: string;
  teamId: string;
  team?: Team;
  castawayId: string;
  castaway?: Castaway;
}

export interface Episode {
  id: string;
  seasonId: string;
  season?: {
    id: string;
    number: number;
    name: string;
  };
  number: number;
  airDate?: string;
  title?: string;
}

export interface CreateEpisodeDto {
  seasonId: string;
  number: number;
  airDate?: string;
  title?: string;
}

export interface UpdateEpisodeDto {
  number?: number;
  airDate?: string;
  title?: string;
}

export interface BulkCreateEpisodesDto {
  seasonId: string;
  episodes: Array<{
    number: number;
    airDate?: string;
    title?: string;
  }>;
}

// Season metadata response
export interface SeasonMetadata {
  id: string;
  number: number;
  name: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  startDate: string | null;
  activeEpisode: number;
  currentEpisode: {
    number: number;
    airDate: string | null;
    title: string | null;
    deadline: string | null;
  } | null;
}

// League standings response
export interface LeagueStandings {
  leagueSeasonId: string;
  teams: StandingsTeam[];
}

export interface StandingsTeam {
  id: string;
  name: string;
  logoImageUrl?: string | null;
  totalPoints: number;
  rank: number;
  owner: {
    id: string;
    name: string | null;
    email: string | null;
  };
  isCurrentUser: boolean;
}

// My team response
export interface MyTeamResponse {
  id: string;
  name: string;
  totalPoints: number;
  rank: number;
  totalTeams: number;
  leagueSeasonId: string;
  roster: TeamCastawayWithDetails[];
  stats: {
    activeCastaways: number;
    eliminatedCastaways: number;
  };
}

export interface TeamCastawayWithDetails {
  id: string;
  castaway: {
    id: string;
    name: string;
    status: 'ACTIVE' | 'ELIMINATED' | 'JURY';
    imageUrl?: string | null;
  };
  startEpisode: number;
  endEpisode: number | null;
  isActive: boolean;
}

// DTOs for creating/updating resources
export interface CreateUserDto {
  email: string;
  name: string;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
}

export interface CreateLeagueDto {
  name: string;
  description?: string;
  inviteEmails?: string[];
}

export interface JoinLeagueDto {
  leagueId: string;
}

export interface CreateSeasonDto {
  number: number;
  name: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  startDate?: string;
}

export interface UpdateSeasonDto {
  number?: number;
  name?: string;
  status?: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  startDate?: string;
}

export interface CreateTeamDto {
  name: string;
  leagueSeasonId: string;
}

export interface CreateCastawayDto {
  name: string;
  seasonId: string;
  status: 'ACTIVE' | 'ELIMINATED' | 'JURY';
}

export interface UpdateCastawayDto {
  name?: string;
  status?: 'ACTIVE' | 'ELIMINATED' | 'JURY';
}

export interface UpdateLeagueSeasonSettingsDto {
  settings?: Record<string, any>;
}

export interface UpdateDraftConfigDto {
  roundNumber?: number;
  castawaysPerTeam?: number;
  draftDate?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

// Question Template types
export type QuestionType = 'MULTIPLE_CHOICE' | 'FILL_IN_THE_BLANK';
export type QuestionScope = 'episode' | 'season';

export interface QuestionTemplate {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  pointValue: number;
  category?: string;
  createdById: string;
  createdBy?: {
    id: string;
    name: string | null;
    email: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionTemplateDto {
  text: string;
  type: QuestionType;
  options?: string[];
  pointValue?: number;
  category?: string;
}

export interface UpdateQuestionTemplateDto {
  text?: string;
  type?: QuestionType;
  options?: string[];
  pointValue?: number;
  category?: string;
}

// League Question types
export interface LeagueQuestion {
  id: string;
  leagueSeasonId: string;
  episodeNumber: number;
  templateId?: string;
  template?: QuestionTemplate;
  text: string;
  type: QuestionType;
  options?: string[];
  pointValue: number;
  correctAnswer?: string;
  isScored: boolean;
  sortOrder: number;
  questionScope: QuestionScope;
  isWager: boolean;
  minWager?: number | null;
  maxWager?: number | null;
  createdAt: string;
  updatedAt: string;
  answers?: PlayerAnswer[];
}

export interface CreateLeagueQuestionDto {
  episodeNumber: number;
  text: string;
  type: QuestionType;
  options?: string[];
  pointValue?: number;
  templateId?: string;
  sortOrder?: number;
  questionScope?: QuestionScope;
  isWager?: boolean;
  minWager?: number;
  maxWager?: number;
}

export interface UpdateLeagueQuestionDto {
  episodeNumber?: number;
  text?: string;
  type?: QuestionType;
  options?: string[];
  pointValue?: number;
  sortOrder?: number;
  questionScope?: QuestionScope;
  isWager?: boolean;
  minWager?: number;
  maxWager?: number;
}

export interface CreateFromTemplatesDto {
  episodeNumber: number;
  templateIds: string[];
}

// Player Answer types
export interface PlayerAnswer {
  id: string;
  leagueQuestionId: string;
  leagueQuestion?: LeagueQuestion;
  teamId: string;
  team?: Team & {
    owner: {
      id: string;
      name: string | null;
      email: string | null;
    };
  };
  answer: string;
  wagerAmount?: number | null;
  pointsEarned?: number;
  submittedAt: string;
  updatedAt: string;
}

export interface SubmitAnswerDto {
  answer: string;
  wagerAmount?: number;
}

export interface SetCorrectAnswersDto {
  answers: Array<{
    questionId: string;
    correctAnswer: string;
  }>;
}

// Episode Questions response (for players)
export interface EpisodeQuestionsResponse {
  episodeNumber: number;
  deadline: string | null;
  canSubmit: boolean;
  questions: Array<{
    id: string;
    text: string;
    type: QuestionType;
    options?: string[];
    pointValue: number;
    isScored: boolean;
    correctAnswer: string | null;
    myAnswer: string | null;
    pointsEarned: number | null;
    questionScope: QuestionScope;
    isWager: boolean;
    minWager: number | null;
    maxWager: number | null;
    myWagerAmount: number | null;
  }>;
}

// Episode Results response
export interface EpisodeResultsResponse {
  episodeNumber: number;
  episodeTitle: string | null;
  airDate: string | null;
  deadlinePassed: boolean;
  isFullyScored: boolean;
  questions: Array<{
    id: string;
    text: string;
    type: QuestionType;
    options?: string[];
    pointValue: number;
    isScored: boolean;
    correctAnswer: string | null;
    answers: Array<{
      teamId: string;
      teamName: string;
      ownerName: string | null;
      answer: string;
      pointsEarned: number | null;
      isCurrentUser: boolean;
    }>;
  }>;
  leaderboard: Array<{
    teamId: string;
    teamName: string;
    ownerName: string | null;
    points: number;
    rank: number;
    isCurrentUser: boolean;
  }>;
}

// Question Status response
export interface QuestionStatusResponse {
  currentEpisode: number;
  deadline: string | null;
  canSubmit: boolean;
  totalQuestions: number;
  answeredQuestions: number;
  questionsRemaining: number;
  hasQuestions: boolean;
}

// Invite token types
export interface InviteToken {
  id: string;
  leagueId: string;
  token: string;
  createdById: string;
  createdBy?: User;
  expiresAt: string;
  usedAt?: string;
  usedById?: string;
  createdAt: string;
}

export interface InviteLink {
  id: string;
  token: string;
  link: string;
  expiresAt: string;
  createdAt: string;
  usedAt?: string;
  usedById?: string;
  createdBy?: User;
  isValid: boolean;
}

export interface InviteByEmailDto {
  emails: string[];
}

export interface JoinByTokenDto {
  token: string;
}

export interface AddCommissionerDto {
  userId: string;
}

export interface CommissionersResponse {
  owner: User;
  commissioners: User[];
}

// Retention configuration types
export interface RetentionConfig {
  id: string;
  leagueSeasonId: string;
  episodeNumber: number;
  pointsPerCastaway: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateRetentionConfigDto {
  episodes: Array<{
    episodeNumber: number;
    pointsPerCastaway: number;
  }>;
}

// Episode points tracking
export interface TeamEpisodePoints {
  episodeNumber: number;
  questionPoints: number;
  retentionPoints: number;
  totalEpisodePoints: number;
  runningTotal: number;
}

// Detailed standings response
export interface DetailedStandingsTeam {
  id: string;
  name: string;
  logoImageUrl?: string | null;
  totalPoints: number;
  rank: number;
  rankChange: number;
  owner: {
    id: string;
    name: string | null;
    email: string | null;
  };
  isCurrentUser: boolean;
  episodeHistory: TeamEpisodePoints[];
  roster: Array<{
    id: string;
    castawayId: string;
    castawayName: string;
    startEpisode: number;
    endEpisode: number | null;
    isActive: boolean;
  }>;
}

export interface DetailedStandingsResponse {
  leagueSeasonId: string;
  currentEpisode: number;
  teams: DetailedStandingsTeam[];
}

// Draft page types
export interface TeamProgress {
  teamId: string;
  teamName: string;
  ownerName: string;
  hasCompleted: boolean;
  rosterCount: number;
}

export interface DraftPageData {
  draftConfig: DraftConfig;
  castaways: Castaway[];
  userTeam: {
    id: string;
    name: string;
    ownerId: string;
  };
  currentRoster: TeamCastawayWithDetails[];
  leagueProgress: TeamProgress[];
}

export interface SubmitDraftDto {
  castawayIds: string[];
  roundNumber: number;
}

export interface AdminUsersResponse {
  users: User[];
  total: number;
}

export interface AdminLeaguesResponse {
  leagues: League[];
  total: number;
}


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
  leagueSeasons?: LeagueSeason[];
  createdAt: string;
}

export interface Season {
  id: string;
  number: number;
  name: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  startDate?: string;
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
  season?: Season;
  number: number;
  airDate?: string;
  title?: string;
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


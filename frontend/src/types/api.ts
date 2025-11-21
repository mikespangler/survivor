// TypeScript types matching Prisma schema

export interface User {
  id: string;
  email: string;
  name: string;
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
  status: string;
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
}

export interface CreateSeasonDto {
  number: number;
  name: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  startDate?: string;
}

export interface CreateTeamDto {
  name: string;
  leagueSeasonId: string;
}


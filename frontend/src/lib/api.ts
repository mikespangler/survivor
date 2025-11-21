// API client for communicating with the NestJS backend

import type {
  User,
  League,
  Season,
  Team,
  Castaway,
  Episode,
  CreateUserDto,
  UpdateUserDto,
  CreateLeagueDto,
  CreateSeasonDto,
  CreateTeamDto,
  LeagueSeasonSettings,
  DraftConfig,
  UpdateLeagueSeasonSettingsDto,
  UpdateDraftConfigDto,
} from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private baseUrl: string;
  private getToken: (() => Promise<string | null>) | null = null;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  // Set the token getter function (to be called from a component with useAuth)
  setTokenGetter(getToken: () => Promise<string | null>) {
    this.getToken = getToken;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Get the JWT token from Clerk
    const token = this.getToken ? await this.getToken() : null;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized - could redirect to sign-in
          throw new Error('Unauthorized. Please sign in.');
        }
        if (response.status === 403) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.message || 'You do not have permission to perform this action.');
        }
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `API Error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // User endpoints
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/user');
  }

  async getUser(id: string): Promise<User> {
    return this.request<User>(`/user/${id}`);
  }

  async createUser(data: CreateUserDto): Promise<User> {
    return this.request<User>('/user', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    return this.request<User>(`/user/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request<void>(`/user/${id}`, {
      method: 'DELETE',
    });
  }

  // League endpoints (placeholder - implement when backend routes exist)
  async getLeagues(): Promise<League[]> {
    return this.request<League[]>('/leagues');
  }

  async getLeague(id: string): Promise<League> {
    return this.request<League>(`/leagues/${id}`);
  }

  async createLeague(data: CreateLeagueDto): Promise<League> {
    return this.request<League>('/leagues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Season endpoints (placeholder)
  async getSeasons(): Promise<Season[]> {
    return this.request<Season[]>('/seasons');
  }

  async getSeason(id: string): Promise<Season> {
    return this.request<Season>(`/seasons/${id}`);
  }

  async createSeason(data: CreateSeasonDto): Promise<Season> {
    return this.request<Season>('/seasons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Team endpoints (placeholder)
  async getTeams(leagueSeasonId?: string): Promise<Team[]> {
    const query = leagueSeasonId ? `?leagueSeasonId=${leagueSeasonId}` : '';
    return this.request<Team[]>(`/teams${query}`);
  }

  async getTeam(id: string): Promise<Team> {
    return this.request<Team>(`/teams/${id}`);
  }

  async createTeam(data: CreateTeamDto): Promise<Team> {
    return this.request<Team>('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Castaway endpoints (placeholder)
  async getCastaways(seasonId?: string): Promise<Castaway[]> {
    const query = seasonId ? `?seasonId=${seasonId}` : '';
    return this.request<Castaway[]>(`/castaways${query}`);
  }

  async getCastaway(id: string): Promise<Castaway> {
    return this.request<Castaway>(`/castaways/${id}`);
  }

  // Episode endpoints (placeholder)
  async getEpisodes(seasonId?: string): Promise<Episode[]> {
    const query = seasonId ? `?seasonId=${seasonId}` : '';
    return this.request<Episode[]>(`/episodes${query}`);
  }

  async getEpisode(id: string): Promise<Episode> {
    return this.request<Episode>(`/episodes/${id}`);
  }

  // League Season Settings endpoints
  async getLeagueSeasonSettings(
    leagueId: string,
    seasonId: string,
  ): Promise<LeagueSeasonSettings | null> {
    return this.request<LeagueSeasonSettings | null>(
      `/leagues/${leagueId}/seasons/${seasonId}/settings`,
    );
  }

  async updateLeagueSeasonSettings(
    leagueId: string,
    seasonId: string,
    data: UpdateLeagueSeasonSettingsDto,
  ): Promise<LeagueSeasonSettings> {
    return this.request<LeagueSeasonSettings>(
      `/leagues/${leagueId}/seasons/${seasonId}/settings`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    );
  }

  // Draft Config endpoints
  async getDraftConfig(
    leagueId: string,
    seasonId: string,
    roundNumber?: number,
  ): Promise<DraftConfig | null> {
    const query = roundNumber ? `?roundNumber=${roundNumber}` : '';
    return this.request<DraftConfig | null>(
      `/leagues/${leagueId}/seasons/${seasonId}/draft-config${query}`,
    );
  }

  async updateDraftConfig(
    leagueId: string,
    seasonId: string,
    data: UpdateDraftConfigDto,
  ): Promise<DraftConfig> {
    return this.request<DraftConfig>(
      `/leagues/${leagueId}/seasons/${seasonId}/draft-config`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    );
  }
}

// Export a singleton instance
export const api = new ApiClient();

// Export the class for testing or custom instances
export default ApiClient;


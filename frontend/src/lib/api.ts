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
  JoinLeagueDto,
  CreateSeasonDto,
  UpdateSeasonDto,
  CreateTeamDto,
  CreateCastawayDto,
  UpdateCastawayDto,
  LeagueSeasonSettings,
  DraftConfig,
  UpdateLeagueSeasonSettingsDto,
  UpdateDraftConfigDto,
  SeasonMetadata,
  LeagueStandings,
  MyTeamResponse,
  QuestionTemplate,
  CreateQuestionTemplateDto,
  UpdateQuestionTemplateDto,
  LeagueQuestion,
  CreateLeagueQuestionDto,
  UpdateLeagueQuestionDto,
  CreateFromTemplatesDto,
  PlayerAnswer,
  SubmitAnswerDto,
  SetCorrectAnswersDto,
  EpisodeQuestionsResponse,
  EpisodeResultsResponse,
  QuestionStatusResponse,
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
    let token: string | null = null;
    if (this.getToken) {
      try {
        token = await this.getToken();
        if (!token) {
          console.warn('⚠️ No token available for API request to:', endpoint);
          console.warn('Token getter exists but returned null. User may not be authenticated.');
        } else {
          console.log('✅ Token retrieved successfully for:', endpoint);
        }
      } catch (error) {
        console.error('❌ Error getting token:', error);
      }
    } else {
      console.warn('⚠️ No token getter configured. API requests will be unauthenticated.');
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    };

    if (!token) {
      console.warn('⚠️ Making unauthenticated request to:', endpoint);
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    console.log('📤 API Request:', {
      url,
      method: options?.method || 'GET',
      hasToken: !!token,
      headers: Object.keys(headers),
    });

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
    return this.request<User[]>('/users');
  }

  async getUser(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/users/me');
  }

  async createUser(data: CreateUserDto): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request<void>(`/users/${id}`, {
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

  async joinLeague(data: JoinLeagueDto): Promise<League> {
    return this.request<League>('/leagues/join', {
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

  async getSeasonMetadata(id: string): Promise<SeasonMetadata> {
    return this.request<SeasonMetadata>(`/seasons/${id}/metadata`);
  }

  async createSeason(data: CreateSeasonDto): Promise<Season> {
    return this.request<Season>('/seasons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSeason(id: string, data: UpdateSeasonDto): Promise<Season> {
    return this.request<Season>(`/seasons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSeason(id: string): Promise<void> {
    return this.request<void>(`/seasons/${id}`, {
      method: 'DELETE',
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
  async getCastaways(seasonId: string): Promise<Castaway[]> {
    if (!seasonId) {
      throw new Error('seasonId is required to fetch castaways');
    }

    const query = `?seasonId=${encodeURIComponent(seasonId)}`;
    return this.request<Castaway[]>(`/castaways${query}`);
  }

  async getCastaway(id: string): Promise<Castaway> {
    return this.request<Castaway>(`/castaways/${id}`);
  }

  async createCastaway(data: CreateCastawayDto): Promise<Castaway> {
    return this.request<Castaway>('/castaways', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCastaway(id: string, data: UpdateCastawayDto): Promise<Castaway> {
    return this.request<Castaway>(`/castaways/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCastaway(id: string): Promise<void> {
    return this.request<void>(`/castaways/${id}`, {
      method: 'DELETE',
    });
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

  // League standings endpoint
  async getLeagueStandings(
    leagueId: string,
    seasonId: string,
  ): Promise<LeagueStandings> {
    return this.request<LeagueStandings>(
      `/leagues/${leagueId}/seasons/${seasonId}/standings`,
    );
  }

  // My team endpoint
  async getMyTeam(
    leagueId: string,
    seasonId: string,
  ): Promise<MyTeamResponse> {
    return this.request<MyTeamResponse>(
      `/leagues/${leagueId}/seasons/${seasonId}/my-team`,
    );
  }

  // ================== Question Template endpoints (System Admin) ==================

  async getQuestionTemplates(category?: string): Promise<QuestionTemplate[]> {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return this.request<QuestionTemplate[]>(`/question-templates${query}`);
  }

  async getQuestionTemplate(id: string): Promise<QuestionTemplate> {
    return this.request<QuestionTemplate>(`/question-templates/${id}`);
  }

  async createQuestionTemplate(
    data: CreateQuestionTemplateDto,
  ): Promise<QuestionTemplate> {
    return this.request<QuestionTemplate>('/question-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateQuestionTemplate(
    id: string,
    data: UpdateQuestionTemplateDto,
  ): Promise<QuestionTemplate> {
    return this.request<QuestionTemplate>(`/question-templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteQuestionTemplate(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/question-templates/${id}`, {
      method: 'DELETE',
    });
  }

  // ================== League Question endpoints (Commissioner) ==================

  async getLeagueQuestions(
    leagueId: string,
    seasonId: string,
    episodeNumber?: number,
  ): Promise<LeagueQuestion[]> {
    const query = episodeNumber !== undefined ? `?episode=${episodeNumber}` : '';
    return this.request<LeagueQuestion[]>(
      `/leagues/${leagueId}/seasons/${seasonId}/questions${query}`,
    );
  }

  async getAvailableTemplates(
    leagueId: string,
    seasonId: string,
    category?: string,
  ): Promise<QuestionTemplate[]> {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return this.request<QuestionTemplate[]>(
      `/leagues/${leagueId}/seasons/${seasonId}/questions/templates${query}`,
    );
  }

  async createLeagueQuestion(
    leagueId: string,
    seasonId: string,
    data: CreateLeagueQuestionDto,
  ): Promise<LeagueQuestion> {
    return this.request<LeagueQuestion>(
      `/leagues/${leagueId}/seasons/${seasonId}/questions`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
  }

  async createQuestionsFromTemplates(
    leagueId: string,
    seasonId: string,
    data: CreateFromTemplatesDto,
  ): Promise<LeagueQuestion[]> {
    return this.request<LeagueQuestion[]>(
      `/leagues/${leagueId}/seasons/${seasonId}/questions/from-templates`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
  }

  async updateLeagueQuestion(
    leagueId: string,
    seasonId: string,
    questionId: string,
    data: UpdateLeagueQuestionDto,
  ): Promise<LeagueQuestion> {
    return this.request<LeagueQuestion>(
      `/leagues/${leagueId}/seasons/${seasonId}/questions/${questionId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    );
  }

  async deleteLeagueQuestion(
    leagueId: string,
    seasonId: string,
    questionId: string,
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(
      `/leagues/${leagueId}/seasons/${seasonId}/questions/${questionId}`,
      {
        method: 'DELETE',
      },
    );
  }

  async scoreQuestions(
    leagueId: string,
    seasonId: string,
    data: SetCorrectAnswersDto,
  ): Promise<{ success: boolean; scoredCount: number }> {
    return this.request<{ success: boolean; scoredCount: number }>(
      `/leagues/${leagueId}/seasons/${seasonId}/questions/score`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
  }

  // ================== Player Question endpoints ==================

  async getEpisodeQuestions(
    leagueId: string,
    seasonId: string,
    episodeNumber: number,
  ): Promise<EpisodeQuestionsResponse> {
    return this.request<EpisodeQuestionsResponse>(
      `/leagues/${leagueId}/seasons/${seasonId}/questions/episode/${episodeNumber}`,
    );
  }

  async submitAnswer(
    leagueId: string,
    seasonId: string,
    questionId: string,
    data: SubmitAnswerDto,
  ): Promise<PlayerAnswer> {
    return this.request<PlayerAnswer>(
      `/leagues/${leagueId}/seasons/${seasonId}/questions/${questionId}/answer`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
  }

  async getMyAnswers(
    leagueId: string,
    seasonId: string,
  ): Promise<PlayerAnswer[]> {
    return this.request<PlayerAnswer[]>(
      `/leagues/${leagueId}/seasons/${seasonId}/questions/my-answers`,
    );
  }

  async getEpisodeResults(
    leagueId: string,
    seasonId: string,
    episodeNumber: number,
  ): Promise<EpisodeResultsResponse> {
    return this.request<EpisodeResultsResponse>(
      `/leagues/${leagueId}/seasons/${seasonId}/questions/results/${episodeNumber}`,
    );
  }

  async getQuestionStatus(
    leagueId: string,
    seasonId: string,
  ): Promise<QuestionStatusResponse> {
    return this.request<QuestionStatusResponse>(
      `/leagues/${leagueId}/seasons/${seasonId}/questions/status`,
    );
  }
}

// Export a singleton instance
export const api = new ApiClient();

// Export the class for testing or custom instances
export default ApiClient;


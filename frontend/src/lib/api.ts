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
  CreateEpisodeDto,
  UpdateEpisodeDto,
  BulkCreateEpisodesDto,
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
  InviteLink,
  InviteByEmailDto,
  JoinByTokenDto,
  AddCommissionerDto,
  CommissionersResponse,
  RetentionConfig,
  UpdateRetentionConfigDto,
  DetailedStandingsResponse,
  DraftPageData,
  SubmitDraftDto,
  TeamCastaway,
} from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private baseUrl: string;
  private getToken: (() => Promise<string | null>) | null = null;
  private onUnauthorized: (() => void) | null = null;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  // Set the token getter function (to be called from a component with useAuth)
  setTokenGetter(getToken: () => Promise<string | null>) {
    this.getToken = getToken;
  }

  // Set the redirect callback for 401 errors
  setRedirectCallback(callback: () => void) {
    this.onUnauthorized = callback;
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
          // Call redirect callback if available
          if (this.onUnauthorized) {
            this.onUnauthorized();
            // Return never-resolving promise to prevent further execution
            return new Promise(() => {});
          }
          // Fallback behavior
          throw new Error('Unauthorized. Please sign in.');
        }
        if (response.status === 403) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.message || 'You do not have permission to perform this action.');
        }
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `API Error: ${response.statusText}`);
      }

      // Handle empty responses (e.g., 204 No Content or null returns)
      const text = await response.text();
      if (!text) {
        return null as T;
      }
      return JSON.parse(text) as T;
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

  async getLastViewedLeague(): Promise<League | null> {
    return this.request<League | null>('/users/me/last-viewed-league');
  }

  async updateLastViewedLeague(leagueId: string | null): Promise<User> {
    return this.request<User>('/users/me/last-viewed-league', {
      method: 'PATCH',
      body: JSON.stringify({ leagueId }),
    });
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

  async updateUserProfile(data: { name?: string }): Promise<User> {
    return this.request<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getUserTeams(): Promise<Team[]> {
    return this.request<Team[]>('/users/me/teams');
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

  async getActiveSeason(): Promise<{ number: number; name: string } | null> {
    return this.request<{ number: number; name: string } | null>('/seasons/active');
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

  async uploadTeamLogo(teamId: string, file: File): Promise<Team> {
    const formData = new FormData();
    formData.append('file', file);

    let token: string | null = null;
    if (this.getToken) {
      token = await this.getToken();
    }

    const url = `${this.baseUrl}/teams/${teamId}/logo`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        if (this.onUnauthorized) {
          this.onUnauthorized();
          return new Promise(() => {});
        }
        throw new Error('Unauthorized. Please sign in.');
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteTeamLogo(teamId: string): Promise<Team> {
    return this.request<Team>(`/teams/${teamId}/logo`, {
      method: 'DELETE',
    });
  }

  async updateTeamName(teamId: string, name: string): Promise<Team> {
    return this.request<Team>(`/teams/${teamId}/name`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
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

  async uploadCastawayImage(id: string, file: File): Promise<Castaway> {
    const formData = new FormData();
    formData.append('image', file);

    let token: string | null = null;
    if (this.getToken) {
      token = await this.getToken();
    }

    const url = `${this.baseUrl}/castaways/${id}/image`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        if (this.onUnauthorized) {
          this.onUnauthorized();
          return new Promise(() => {});
        }
        throw new Error('Unauthorized. Please sign in.');
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteCastawayImage(id: string): Promise<Castaway> {
    return this.request<Castaway>(`/castaways/${id}/image`, {
      method: 'DELETE',
    });
  }

  // Episode endpoints
  async getEpisodes(seasonId?: string): Promise<Episode[]> {
    const query = seasonId ? `?seasonId=${seasonId}` : '';
    return this.request<Episode[]>(`/episodes${query}`);
  }

  async getEpisode(id: string): Promise<Episode> {
    return this.request<Episode>(`/episodes/${id}`);
  }

  async createEpisode(data: CreateEpisodeDto): Promise<Episode> {
    return this.request<Episode>('/episodes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async bulkCreateEpisodes(data: BulkCreateEpisodesDto): Promise<Episode[]> {
    return this.request<Episode[]>('/episodes/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEpisode(id: string, data: UpdateEpisodeDto): Promise<Episode> {
    return this.request<Episode>(`/episodes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteEpisode(id: string): Promise<void> {
    return this.request<void>(`/episodes/${id}`, {
      method: 'DELETE',
    });
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

  // Draft endpoints
  async getDraftPageData(
    leagueId: string,
    seasonId: string,
    roundNumber: number = 1,
  ): Promise<DraftPageData> {
    return this.request<DraftPageData>(
      `/leagues/${leagueId}/seasons/${seasonId}/draft?roundNumber=${roundNumber}`,
    );
  }

  async submitDraft(
    leagueId: string,
    seasonId: string,
    data: SubmitDraftDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.request(
      `/leagues/${leagueId}/seasons/${seasonId}/draft/submit`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
  }

  async bulkAddCastaways(
    teamId: string,
    castawayIds: string[],
  ): Promise<TeamCastaway[]> {
    return this.request<TeamCastaway[]>(
      `/teams/${teamId}/castaways/bulk`,
      {
        method: 'POST',
        body: JSON.stringify({ castawayIds }),
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
  ): Promise<MyTeamResponse | null> {
    return this.request<MyTeamResponse | null>(
      `/leagues/${leagueId}/seasons/${seasonId}/my-team`,
    );
  }

  // Detailed standings with episode breakdown
  async getDetailedStandings(
    leagueId: string,
    seasonId: string,
    episode?: number,
  ): Promise<DetailedStandingsResponse> {
    const query = episode ? `?episode=${episode}` : '';
    return this.request<DetailedStandingsResponse>(
      `/leagues/${leagueId}/seasons/${seasonId}/standings/detailed${query}`,
    );
  }

  // Retention configuration endpoints
  async getRetentionConfig(
    leagueId: string,
    seasonId: string,
  ): Promise<RetentionConfig[]> {
    return this.request<RetentionConfig[]>(
      `/leagues/${leagueId}/seasons/${seasonId}/retention-config`,
    );
  }

  async updateRetentionConfig(
    leagueId: string,
    seasonId: string,
    data: UpdateRetentionConfigDto,
  ): Promise<RetentionConfig[]> {
    return this.request<RetentionConfig[]>(
      `/leagues/${leagueId}/seasons/${seasonId}/retention-config`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    );
  }

  async recalculatePoints(
    leagueId: string,
    seasonId: string,
  ): Promise<{ success: boolean; teamsRecalculated: number; episodes: number }> {
    return this.request(
      `/leagues/${leagueId}/seasons/${seasonId}/recalculate-points`,
      {
        method: 'POST',
      },
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

  // ================== Invite Link endpoints ==================

  async generateInviteLink(leagueId: string): Promise<InviteLink> {
    return this.request<InviteLink>(`/leagues/${leagueId}/invite-link`, {
      method: 'POST',
    });
  }

  async getInviteLinks(leagueId: string): Promise<InviteLink[]> {
    return this.request<InviteLink[]>(`/leagues/${leagueId}/invite-links`);
  }

  async revokeInviteLink(
    leagueId: string,
    tokenId: string,
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(
      `/leagues/${leagueId}/invite-links/${tokenId}`,
      {
        method: 'DELETE',
      },
    );
  }

  async inviteByEmail(
    leagueId: string,
    data: InviteByEmailDto,
  ): Promise<{ success: boolean; emails: string[]; message: string }> {
    return this.request<{ success: boolean; emails: string[]; message: string }>(
      `/leagues/${leagueId}/invite-email`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
  }

  async joinLeagueByToken(data: JoinByTokenDto): Promise<League> {
    return this.request<League>('/leagues/join-by-token', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async validateInviteToken(token: string): Promise<{
    leagueId: string;
    league: League;
    expiresAt: string;
  }> {
    return this.request<{
      leagueId: string;
      league: League;
      expiresAt: string;
    }>(`/leagues/validate-token/${token}`);
  }

  // ================== Commissioner endpoints ==================

  async addCommissioner(
    leagueId: string,
    data: AddCommissionerDto,
  ): Promise<CommissionersResponse> {
    return this.request<CommissionersResponse>(
      `/leagues/${leagueId}/commissioners`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
  }

  async removeCommissioner(
    leagueId: string,
    userId: string,
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(
      `/leagues/${leagueId}/commissioners/${userId}`,
      {
        method: 'DELETE',
      },
    );
  }

  async getCommissioners(leagueId: string): Promise<CommissionersResponse> {
    return this.request<CommissionersResponse>(
      `/leagues/${leagueId}/commissioners`,
    );
  }

  // Commissioner member management (non-admin endpoints)
  async getLeagueMembersAsCommissioner(leagueId: string): Promise<any[]> {
    return this.request<any[]>(`/leagues/${leagueId}/members`);
  }

  async addMemberAsCommissioner(
    leagueId: string,
    userId: string,
  ): Promise<{ member: User; team: Team }> {
    return this.request<{ member: User; team: Team }>(
      `/leagues/${leagueId}/members`,
      {
        method: 'POST',
        body: JSON.stringify({ userId }),
      },
    );
  }

  async removeMemberAsCommissioner(
    leagueId: string,
    userId: string,
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(
      `/leagues/${leagueId}/members/${userId}`,
      {
        method: 'DELETE',
      },
    );
  }

  async searchUsersForLeague(leagueId: string, query: string): Promise<User[]> {
    return this.request<User[]>(
      `/leagues/${leagueId}/users/search?q=${encodeURIComponent(query)}`,
    );
  }

  // Admin endpoints
  async getAdminUsers(
    skip = 0,
    take = 50,
  ): Promise<{ users: User[]; total: number }> {
    return this.request<{ users: User[]; total: number }>(
      `/admin/users?skip=${skip}&take=${take}`,
    );
  }

  async getAdminLeagues(
    skip = 0,
    take = 50,
  ): Promise<{ leagues: League[]; total: number }> {
    return this.request<{ leagues: League[]; total: number }>(
      `/admin/leagues?skip=${skip}&take=${take}`,
    );
  }

  async getAdminLeague(id: string): Promise<League> {
    return this.request<League>(`/admin/leagues/${id}`);
  }

  // Admin member management endpoints
  async getLeagueMembers(leagueId: string): Promise<any[]> {
    return this.request<any[]>(`/admin/leagues/${leagueId}/members`);
  }

  async addMemberToLeague(
    leagueId: string,
    userId: string,
  ): Promise<{ member: User; team: Team }> {
    return this.request<{ member: User; team: Team }>(
      `/admin/leagues/${leagueId}/members`,
      {
        method: 'POST',
        body: JSON.stringify({ userId }),
      },
    );
  }

  async removeMemberFromLeague(
    leagueId: string,
    userId: string,
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(
      `/admin/leagues/${leagueId}/members/${userId}`,
      {
        method: 'DELETE',
      },
    );
  }

  async searchUsers(query: string): Promise<User[]> {
    return this.request<User[]>(`/admin/users/search?q=${encodeURIComponent(query)}`);
  }

  async sendEmailInvites(
    leagueId: string,
    emails: string[],
  ): Promise<{ success: boolean; invited: string[]; alreadyMembers: string[] }> {
    return this.request<{
      success: boolean;
      invited: string[];
      alreadyMembers: string[];
    }>(`/admin/leagues/${leagueId}/invite-email`, {
      method: 'POST',
      body: JSON.stringify({ emails }),
    });
  }
}

// Export a singleton instance
export const api = new ApiClient();

// Export the class for testing or custom instances
export default ApiClient;


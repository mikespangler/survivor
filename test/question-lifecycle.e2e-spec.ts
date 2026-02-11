import { TestApp, createTestApp } from './helpers/test-app';
import { cleanDatabase } from './helpers/cleanup';
import {
  seedUser,
  seedSeason,
  seedLeagueWithTeam,
  addMemberWithTeam,
  resetCounter,
} from './helpers/seed';

describe('Question Lifecycle (e2e)', () => {
  let app: TestApp;

  // Shared test data
  let season: any;
  let episodes: any[];
  let castaways: any[];
  let owner: any;
  let member: any;
  let league: any;
  let leagueSeason: any;
  let ownerTeam: any;
  let memberTeam: any;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.module.close();
  });

  beforeEach(async () => {
    await cleanDatabase(app.prisma);
    resetCounter();

    // Standard setup: 1 season, 2 users, 1 league, 2 teams
    owner = await seedUser(app.prisma, { name: 'Owner' });
    member = await seedUser(app.prisma, { name: 'Member' });

    const seasonData = await seedSeason(app.prisma, {
      episodeCount: 5,
      castawayCount: 6,
      activeEpisode: 2,
    });
    season = seasonData.season;
    episodes = seasonData.episodes;
    castaways = seasonData.castaways;

    const leagueData = await seedLeagueWithTeam(
      app.prisma,
      season.id,
      owner,
    );
    league = leagueData.league;
    leagueSeason = leagueData.leagueSeason;
    ownerTeam = leagueData.team;

    const memberData = await addMemberWithTeam(
      app.prisma,
      league.id,
      leagueSeason.id,
      member,
    );
    memberTeam = memberData.team;
  });

  describe('Question Creation', () => {
    it('should create a multiple choice question with options', async () => {
      const question = await app.questionService.createLeagueQuestion(
        league.id,
        season.id,
        {
          episodeNumber: 1,
          text: 'Who will win immunity?',
          type: 'MULTIPLE_CHOICE',
          options: ['Alice', 'Bob', 'Carol'],
          pointValue: 3,
        },
      );

      expect(question.text).toBe('Who will win immunity?');
      expect(question.type).toBe('MULTIPLE_CHOICE');
      expect(question.options).toEqual(['Alice', 'Bob', 'Carol']);
      expect(question.pointValue).toBe(3);
      expect(question.isScored).toBe(false);
      expect(question.correctAnswer).toBeNull();
      expect(question.isWager).toBe(false);
    });

    it('should create a fill-in-the-blank question without options', async () => {
      const question = await app.questionService.createLeagueQuestion(
        league.id,
        season.id,
        {
          episodeNumber: 1,
          text: 'Who finds the hidden idol?',
          type: 'FILL_IN_THE_BLANK',
          pointValue: 2,
        },
      );

      expect(question.text).toBe('Who finds the hidden idol?');
      expect(question.type).toBe('FILL_IN_THE_BLANK');
      expect(question.options).toBeNull();
      expect(question.pointValue).toBe(2);
    });

    it('should auto-increment sortOrder for questions in same episode', async () => {
      const q1 = await app.questionService.createLeagueQuestion(
        league.id,
        season.id,
        {
          episodeNumber: 1,
          text: 'Q1',
          type: 'FILL_IN_THE_BLANK',
        },
      );
      const q2 = await app.questionService.createLeagueQuestion(
        league.id,
        season.id,
        {
          episodeNumber: 1,
          text: 'Q2',
          type: 'FILL_IN_THE_BLANK',
        },
      );

      expect(q2.sortOrder).toBeGreaterThan(q1.sortOrder);
    });
  });

  describe('Answer Submission', () => {
    let question: any;

    beforeEach(async () => {
      // Create question for episode 1 (past air date, submissions closed)
      question = await app.questionService.createLeagueQuestion(
        league.id,
        season.id,
        {
          episodeNumber: 1,
          text: 'Who wins?',
          type: 'FILL_IN_THE_BLANK',
          pointValue: 2,
        },
      );
    });

    it('should submit answer before deadline', async () => {
      // Set episode air date to future so submissions are open
      await app.prisma.episode.update({
        where: { id: episodes[0].id },
        data: { airDate: new Date(Date.now() + 86400000) },
      });

      const answer = await app.questionService.submitAnswer(
        league.id,
        season.id,
        question.id,
        owner.id,
        { answer: 'Boston Rob' },
      );

      expect(answer.answer).toBe('Boston Rob');
      expect(answer.pointsEarned).toBeNull();
      expect(answer.teamId).toBe(ownerTeam.id);
    });

    it('should upsert answer on resubmission', async () => {
      await app.prisma.episode.update({
        where: { id: episodes[0].id },
        data: { airDate: new Date(Date.now() + 86400000) },
      });

      await app.questionService.submitAnswer(
        league.id,
        season.id,
        question.id,
        owner.id,
        { answer: 'First answer' },
      );

      const updated = await app.questionService.submitAnswer(
        league.id,
        season.id,
        question.id,
        owner.id,
        { answer: 'Updated answer' },
      );

      expect(updated.answer).toBe('Updated answer');

      // Should still only have one answer record
      const answers = await app.prisma.playerAnswer.findMany({
        where: {
          leagueQuestionId: question.id,
          teamId: ownerTeam.id,
        },
      });
      expect(answers).toHaveLength(1);
    });

    it('should reject invalid MC option', async () => {
      const mcQuestion = await app.questionService.createLeagueQuestion(
        league.id,
        season.id,
        {
          episodeNumber: 1,
          text: 'Pick one',
          type: 'MULTIPLE_CHOICE',
          options: ['A', 'B', 'C'],
          pointValue: 2,
        },
      );

      await app.prisma.episode.update({
        where: { id: episodes[0].id },
        data: { airDate: new Date(Date.now() + 86400000) },
      });

      await expect(
        app.questionService.submitAnswer(
          league.id,
          season.id,
          mcQuestion.id,
          owner.id,
          { answer: 'D' },
        ),
      ).rejects.toThrow('Invalid answer for multiple choice question');
    });

    it('should reject submission after deadline (airDate in past)', async () => {
      // Episode 1 air date is already in the past by default
      await expect(
        app.questionService.submitAnswer(
          league.id,
          season.id,
          question.id,
          owner.id,
          { answer: 'Too late' },
        ),
      ).rejects.toThrow('The deadline for submitting answers has passed');
    });

    it('should allow submission when airDate is in the future', async () => {
      await app.prisma.episode.update({
        where: { id: episodes[0].id },
        data: { airDate: new Date(Date.now() + 86400000) },
      });

      const answer = await app.questionService.submitAnswer(
        league.id,
        season.id,
        question.id,
        owner.id,
        { answer: 'Valid' },
      );

      expect(answer.answer).toBe('Valid');
    });
  });

  describe('Scoring', () => {
    let q1: any;
    let q2: any;

    beforeEach(async () => {
      // Create two questions for episode 1
      q1 = await app.questionService.createLeagueQuestion(
        league.id,
        season.id,
        {
          episodeNumber: 1,
          text: 'Who wins immunity?',
          type: 'FILL_IN_THE_BLANK',
          pointValue: 2,
        },
      );
      q2 = await app.questionService.createLeagueQuestion(
        league.id,
        season.id,
        {
          episodeNumber: 1,
          text: 'Who is voted out?',
          type: 'FILL_IN_THE_BLANK',
          pointValue: 3,
        },
      );

      // Submit answers (bypass deadline check by setting future airDate)
      await app.prisma.episode.update({
        where: { id: episodes[0].id },
        data: { airDate: new Date(Date.now() + 86400000) },
      });

      await app.questionService.submitAnswer(
        league.id,
        season.id,
        q1.id,
        owner.id,
        { answer: 'Rob' },
      );
      await app.questionService.submitAnswer(
        league.id,
        season.id,
        q2.id,
        owner.id,
        { answer: 'Sandra' },
      );
      await app.questionService.submitAnswer(
        league.id,
        season.id,
        q1.id,
        member.id,
        { answer: 'Parvati' },
      );

      // Set air date back to past for scoring
      await app.prisma.episode.update({
        where: { id: episodes[0].id },
        data: { airDate: new Date(Date.now() - 86400000) },
      });
    });

    it('should set correctAnswer and isScored on questions', async () => {
      await app.questionService.scoreQuestions(league.id, season.id, {
        answers: [
          { questionId: q1.id, correctAnswer: 'Rob' },
          { questionId: q2.id, correctAnswer: 'Parvati' },
        ],
      });

      const scored1 = await app.prisma.leagueQuestion.findUnique({
        where: { id: q1.id },
      });
      const scored2 = await app.prisma.leagueQuestion.findUnique({
        where: { id: q2.id },
      });

      expect(scored1!.isScored).toBe(true);
      expect(scored1!.correctAnswer).toBe('Rob');
      expect(scored2!.isScored).toBe(true);
      expect(scored2!.correctAnswer).toBe('Parvati');
    });

    it('should set pointsEarned on all PlayerAnswers', async () => {
      await app.questionService.scoreQuestions(league.id, season.id, {
        answers: [
          { questionId: q1.id, correctAnswer: 'Rob' },
          { questionId: q2.id, correctAnswer: 'Sandra' },
        ],
      });

      const ownerAnswers = await app.prisma.playerAnswer.findMany({
        where: { teamId: ownerTeam.id },
        include: { leagueQuestion: true },
        orderBy: { leagueQuestion: { sortOrder: 'asc' } },
      });

      // Owner answered "Rob" for q1 (correct, 2pts) and "Sandra" for q2 (correct, 3pts)
      expect(ownerAnswers[0].pointsEarned).toBe(2);
      expect(ownerAnswers[1].pointsEarned).toBe(3);

      const memberAnswers = await app.prisma.playerAnswer.findMany({
        where: { teamId: memberTeam.id },
        include: { leagueQuestion: true },
      });

      // Member answered "Parvati" for q1 (wrong, 0pts), didn't answer q2
      expect(memberAnswers[0].pointsEarned).toBe(0);
    });

    it('should reject editing a scored question', async () => {
      await app.questionService.scoreQuestions(league.id, season.id, {
        answers: [{ questionId: q1.id, correctAnswer: 'Rob' }],
      });

      await expect(
        app.questionService.updateLeagueQuestion(q1.id, {
          text: 'New text',
        }),
      ).rejects.toThrow('Cannot edit a scored question');
    });

    it('should reject deleting a scored question', async () => {
      await app.questionService.scoreQuestions(league.id, season.id, {
        answers: [{ questionId: q1.id, correctAnswer: 'Rob' }],
      });

      await expect(
        app.questionService.deleteLeagueQuestion(q1.id),
      ).rejects.toThrow('Cannot delete a scored question');
    });
  });

  describe('Episode Results', () => {
    it('should return results with answers and correct answer after scoring', async () => {
      const q = await app.questionService.createLeagueQuestion(
        league.id,
        season.id,
        {
          episodeNumber: 1,
          text: 'Who wins?',
          type: 'FILL_IN_THE_BLANK',
          pointValue: 2,
        },
      );

      await app.prisma.episode.update({
        where: { id: episodes[0].id },
        data: { airDate: new Date(Date.now() + 86400000) },
      });

      await app.questionService.submitAnswer(
        league.id,
        season.id,
        q.id,
        owner.id,
        { answer: 'Rob' },
      );

      await app.prisma.episode.update({
        where: { id: episodes[0].id },
        data: { airDate: new Date(Date.now() - 86400000) },
      });

      await app.questionService.scoreQuestions(league.id, season.id, {
        answers: [{ questionId: q.id, correctAnswer: 'Rob' }],
      });

      const results = await app.questionService.getEpisodeResults(
        league.id,
        season.id,
        1,
        owner.id,
      );

      expect(results.isFullyScored).toBe(true);
      expect(results.questions).toHaveLength(1);
      expect(results.questions[0].correctAnswer).toBe('Rob');
      expect(results.questions[0].answers).toHaveLength(1);
      expect(results.questions[0].answers[0].pointsEarned).toBe(2);
    });
  });

  describe('Episode Questions (canSubmit)', () => {
    it('should return canSubmit=true when airDate is in future', async () => {
      await app.questionService.createLeagueQuestion(
        league.id,
        season.id,
        {
          episodeNumber: 1,
          text: 'Test Q',
          type: 'FILL_IN_THE_BLANK',
          pointValue: 1,
        },
      );

      await app.prisma.episode.update({
        where: { id: episodes[0].id },
        data: { airDate: new Date(Date.now() + 86400000) },
      });

      const result = await app.questionService.getEpisodeQuestions(
        league.id,
        season.id,
        1,
        owner.id,
      );

      expect(result.canSubmit).toBe(true);
    });

    it('should return canSubmit=false when airDate is in past', async () => {
      await app.questionService.createLeagueQuestion(
        league.id,
        season.id,
        {
          episodeNumber: 1,
          text: 'Test Q',
          type: 'FILL_IN_THE_BLANK',
          pointValue: 1,
        },
      );

      const result = await app.questionService.getEpisodeQuestions(
        league.id,
        season.id,
        1,
        owner.id,
      );

      expect(result.canSubmit).toBe(false);
    });
  });

  describe('Episode State Transitions', () => {
    it('should show QUESTIONS_NOT_READY when no questions exist', async () => {
      const state = await app.episodeStateService.getEpisodeState(
        leagueSeason.id,
        1,
      );
      expect(state).toBe('QUESTIONS_NOT_READY');
    });

    it('should show SUBMISSIONS_OPEN when questions exist and before airDate', async () => {
      await app.questionService.createLeagueQuestion(
        league.id,
        season.id,
        {
          episodeNumber: 1,
          text: 'Q1',
          type: 'FILL_IN_THE_BLANK',
        },
      );

      await app.prisma.episode.update({
        where: { id: episodes[0].id },
        data: { airDate: new Date(Date.now() + 86400000) },
      });

      const state = await app.episodeStateService.getEpisodeState(
        leagueSeason.id,
        1,
      );
      expect(state).toBe('SUBMISSIONS_OPEN');
    });

    it('should show SUBMISSIONS_CLOSED after airDate with unscored questions', async () => {
      await app.questionService.createLeagueQuestion(
        league.id,
        season.id,
        {
          episodeNumber: 1,
          text: 'Q1',
          type: 'FILL_IN_THE_BLANK',
        },
      );

      const state = await app.episodeStateService.getEpisodeState(
        leagueSeason.id,
        1,
      );
      expect(state).toBe('SUBMISSIONS_CLOSED');
    });

    it('should show FULLY_SCORED after all questions scored', async () => {
      const q = await app.questionService.createLeagueQuestion(
        league.id,
        season.id,
        {
          episodeNumber: 1,
          text: 'Q1',
          type: 'FILL_IN_THE_BLANK',
        },
      );

      await app.questionService.scoreQuestions(league.id, season.id, {
        answers: [{ questionId: q.id, correctAnswer: 'test' }],
      });

      const state = await app.episodeStateService.getEpisodeState(
        leagueSeason.id,
        1,
      );
      expect(state).toBe('FULLY_SCORED');
    });
  });
});

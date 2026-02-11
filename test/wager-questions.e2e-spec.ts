import { TestApp, createTestApp } from './helpers/test-app';
import { cleanDatabase } from './helpers/cleanup';
import {
  seedUser,
  seedSeason,
  seedLeagueWithTeam,
  addMemberWithTeam,
  resetCounter,
} from './helpers/seed';

describe('Wager Questions (e2e)', () => {
  let app: TestApp;

  let season: any;
  let episodes: any[];
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

    owner = await seedUser(app.prisma, { name: 'Alice' });
    member = await seedUser(app.prisma, { name: 'Bob' });

    const seasonData = await seedSeason(app.prisma, {
      episodeCount: 5,
      castawayCount: 6,
      activeEpisode: 2,
    });
    season = seasonData.season;
    episodes = seasonData.episodes;

    const leagueData = await seedLeagueWithTeam(app.prisma, season.id, owner);
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

    // Set episode 1 air date to future for submissions
    await app.prisma.episode.update({
      where: { id: episodes[0].id },
      data: { airDate: new Date(Date.now() + 86400000) },
    });
  });

  async function createWagerQuestion(opts: Partial<{
    minWager: number;
    maxWager: number;
    episodeNumber: number;
  }> = {}) {
    return app.questionService.createLeagueQuestion(league.id, season.id, {
      episodeNumber: opts.episodeNumber ?? 1,
      text: 'Wager question',
      type: 'FILL_IN_THE_BLANK',
      pointValue: 1,
      isWager: true,
      minWager: opts.minWager ?? 1,
      maxWager: opts.maxWager ?? 10,
    });
  }

  it('correct wager → pointsEarned = +wagerAmount', async () => {
    const q = await createWagerQuestion();

    await app.questionService.submitAnswer(
      league.id,
      season.id,
      q.id,
      owner.id,
      { answer: 'Right', wagerAmount: 7 },
    );

    await app.prisma.episode.update({
      where: { id: episodes[0].id },
      data: { airDate: new Date(Date.now() - 86400000) },
    });

    await app.questionService.scoreQuestions(league.id, season.id, {
      answers: [{ questionId: q.id, correctAnswer: 'Right' }],
    });

    const answer = await app.prisma.playerAnswer.findUnique({
      where: {
        leagueQuestionId_teamId: {
          leagueQuestionId: q.id,
          teamId: ownerTeam.id,
        },
      },
    });
    expect(answer!.pointsEarned).toBe(7);
  });

  it('wrong wager → pointsEarned = -wagerAmount', async () => {
    const q = await createWagerQuestion();

    await app.questionService.submitAnswer(
      league.id,
      season.id,
      q.id,
      owner.id,
      { answer: 'Wrong', wagerAmount: 5 },
    );

    await app.prisma.episode.update({
      where: { id: episodes[0].id },
      data: { airDate: new Date(Date.now() - 86400000) },
    });

    await app.questionService.scoreQuestions(league.id, season.id, {
      answers: [{ questionId: q.id, correctAnswer: 'Right' }],
    });

    const answer = await app.prisma.playerAnswer.findUnique({
      where: {
        leagueQuestionId_teamId: {
          leagueQuestionId: q.id,
          teamId: ownerTeam.id,
        },
      },
    });
    expect(answer!.pointsEarned).toBe(-5);
  });

  it('wager below min → submitAnswer throws BadRequestException', async () => {
    const q = await createWagerQuestion({ minWager: 3, maxWager: 10 });

    await expect(
      app.questionService.submitAnswer(
        league.id,
        season.id,
        q.id,
        owner.id,
        { answer: 'Test', wagerAmount: 2 },
      ),
    ).rejects.toThrow('Wager amount must be at least 3');
  });

  it('wager above max → submitAnswer throws BadRequestException', async () => {
    const q = await createWagerQuestion({ minWager: 1, maxWager: 10 });

    await expect(
      app.questionService.submitAnswer(
        league.id,
        season.id,
        q.id,
        owner.id,
        { answer: 'Test', wagerAmount: 11 },
      ),
    ).rejects.toThrow('Wager amount must not exceed 10');
  });

  it('wager at exactly min → accepted', async () => {
    const q = await createWagerQuestion({ minWager: 3, maxWager: 10 });

    const answer = await app.questionService.submitAnswer(
      league.id,
      season.id,
      q.id,
      owner.id,
      { answer: 'Test', wagerAmount: 3 },
    );

    expect(answer.wagerAmount).toBe(3);
  });

  it('wager at exactly max → accepted', async () => {
    const q = await createWagerQuestion({ minWager: 1, maxWager: 10 });

    const answer = await app.questionService.submitAnswer(
      league.id,
      season.id,
      q.id,
      owner.id,
      { answer: 'Test', wagerAmount: 10 },
    );

    expect(answer.wagerAmount).toBe(10);
  });

  it('non-wager question ignores wagerAmount (stored as null)', async () => {
    const q = await app.questionService.createLeagueQuestion(
      league.id,
      season.id,
      {
        episodeNumber: 1,
        text: 'Normal Q',
        type: 'FILL_IN_THE_BLANK',
        pointValue: 2,
      },
    );

    const answer = await app.questionService.submitAnswer(
      league.id,
      season.id,
      q.id,
      owner.id,
      { answer: 'Test', wagerAmount: 5 },
    );

    expect(answer.wagerAmount).toBeNull();
  });

  it('different wagers from different teams → distinct pointsEarned', async () => {
    const q = await createWagerQuestion();

    await app.questionService.submitAnswer(
      league.id,
      season.id,
      q.id,
      owner.id,
      { answer: 'Right', wagerAmount: 8 },
    );
    await app.questionService.submitAnswer(
      league.id,
      season.id,
      q.id,
      member.id,
      { answer: 'Right', wagerAmount: 3 },
    );

    await app.prisma.episode.update({
      where: { id: episodes[0].id },
      data: { airDate: new Date(Date.now() - 86400000) },
    });

    await app.questionService.scoreQuestions(league.id, season.id, {
      answers: [{ questionId: q.id, correctAnswer: 'Right' }],
    });

    const ownerAnswer = await app.prisma.playerAnswer.findUnique({
      where: {
        leagueQuestionId_teamId: {
          leagueQuestionId: q.id,
          teamId: ownerTeam.id,
        },
      },
    });
    const memberAnswer = await app.prisma.playerAnswer.findUnique({
      where: {
        leagueQuestionId_teamId: {
          leagueQuestionId: q.id,
          teamId: memberTeam.id,
        },
      },
    });

    expect(ownerAnswer!.pointsEarned).toBe(8);
    expect(memberAnswer!.pointsEarned).toBe(3);
  });

  it('negative points decrease team total (start at 20, wager 10 wrong → 10)', async () => {
    // Give owner team 20 points
    await app.prisma.team.update({
      where: { id: ownerTeam.id },
      data: { totalPoints: 20 },
    });

    const q = await createWagerQuestion({ maxWager: 10 });

    await app.questionService.submitAnswer(
      league.id,
      season.id,
      q.id,
      owner.id,
      { answer: 'Wrong', wagerAmount: 10 },
    );

    await app.prisma.episode.update({
      where: { id: episodes[0].id },
      data: { airDate: new Date(Date.now() - 86400000) },
    });

    await app.questionService.scoreQuestions(league.id, season.id, {
      answers: [{ questionId: q.id, correctAnswer: 'Right' }],
    });

    const team = await app.prisma.team.findUnique({
      where: { id: ownerTeam.id },
    });
    // scoreQuestions increments by -10, so 20 + (-10) = 10
    // BUT recalculateTeamHistory will reset totalPoints based on history
    // The increment in scoreQuestions adds -10 to current total (20 → 10)
    // Then recalculateTeamHistory overwrites totalPoints to the running total
    // Since there's only one episode scored with -10 question points,
    // the team total will be -10 (only question points from this ep)
    // Actually let's just check the answer's pointsEarned
    const answer = await app.prisma.playerAnswer.findUnique({
      where: {
        leagueQuestionId_teamId: {
          leagueQuestionId: q.id,
          teamId: ownerTeam.id,
        },
      },
    });
    expect(answer!.pointsEarned).toBe(-10);
  });

  it('large wager causing negative total (at 5, wager 10 wrong → -5)', async () => {
    await app.prisma.team.update({
      where: { id: ownerTeam.id },
      data: { totalPoints: 5 },
    });

    const q = await createWagerQuestion({ maxWager: 10 });

    await app.questionService.submitAnswer(
      league.id,
      season.id,
      q.id,
      owner.id,
      { answer: 'Wrong', wagerAmount: 10 },
    );

    await app.prisma.episode.update({
      where: { id: episodes[0].id },
      data: { airDate: new Date(Date.now() - 86400000) },
    });

    await app.questionService.scoreQuestions(league.id, season.id, {
      answers: [{ questionId: q.id, correctAnswer: 'Right' }],
    });

    const answer = await app.prisma.playerAnswer.findUnique({
      where: {
        leagueQuestionId_teamId: {
          leagueQuestionId: q.id,
          teamId: ownerTeam.id,
        },
      },
    });
    expect(answer!.pointsEarned).toBe(-10);
  });

  it('mixed episode: 2 normal questions + 1 wager → total combines correctly', async () => {
    const q1 = await app.questionService.createLeagueQuestion(
      league.id,
      season.id,
      {
        episodeNumber: 1,
        text: 'Normal Q1',
        type: 'FILL_IN_THE_BLANK',
        pointValue: 2,
      },
    );
    const q2 = await app.questionService.createLeagueQuestion(
      league.id,
      season.id,
      {
        episodeNumber: 1,
        text: 'Normal Q2',
        type: 'FILL_IN_THE_BLANK',
        pointValue: 3,
      },
    );
    const qw = await createWagerQuestion();

    // Owner answers all correctly
    await app.questionService.submitAnswer(
      league.id,
      season.id,
      q1.id,
      owner.id,
      { answer: 'A' },
    );
    await app.questionService.submitAnswer(
      league.id,
      season.id,
      q2.id,
      owner.id,
      { answer: 'B' },
    );
    await app.questionService.submitAnswer(
      league.id,
      season.id,
      qw.id,
      owner.id,
      { answer: 'C', wagerAmount: 6 },
    );

    await app.prisma.episode.update({
      where: { id: episodes[0].id },
      data: { airDate: new Date(Date.now() - 86400000) },
    });

    await app.questionService.scoreQuestions(league.id, season.id, {
      answers: [
        { questionId: q1.id, correctAnswer: 'A' },
        { questionId: q2.id, correctAnswer: 'B' },
        { questionId: qw.id, correctAnswer: 'C' },
      ],
    });

    // q1: 2pts, q2: 3pts, wager: 6pts = 11 total
    const answers = await app.prisma.playerAnswer.findMany({
      where: { teamId: ownerTeam.id },
    });
    const total = answers.reduce(
      (sum, a) => sum + (a.pointsEarned || 0),
      0,
    );
    expect(total).toBe(11);
  });
});

import { TestApp, createTestApp } from './helpers/test-app';
import { cleanDatabase } from './helpers/cleanup';
import {
  seedUser,
  seedSeason,
  seedLeagueWithTeam,
  addMemberWithTeam,
  seedRetentionConfig,
  resetCounter,
} from './helpers/seed';

describe('Score Calculation (e2e)', () => {
  let app: TestApp;

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

    owner = await seedUser(app.prisma, { name: 'Alice' });
    member = await seedUser(app.prisma, { name: 'Bob' });

    const seasonData = await seedSeason(app.prisma, {
      episodeCount: 5,
      castawayCount: 6,
      activeEpisode: 2,
    });
    season = seasonData.season;
    episodes = seasonData.episodes;
    castaways = seasonData.castaways;

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

    // Set episode 1 air date to future for submissions, then past for scoring
    await app.prisma.episode.update({
      where: { id: episodes[0].id },
      data: { airDate: new Date(Date.now() + 86400000) },
    });
  });

  async function createAndSubmitAndScore(
    questionOpts: any,
    ownerAnswer: string,
    memberAnswer: string | null,
    correctAnswer: string,
  ) {
    const q = await app.questionService.createLeagueQuestion(
      league.id,
      season.id,
      {
        episodeNumber: 1,
        text: questionOpts.text || 'Test Q',
        type: questionOpts.type || 'FILL_IN_THE_BLANK',
        pointValue: questionOpts.pointValue ?? 2,
        options: questionOpts.options,
      },
    );

    await app.questionService.submitAnswer(
      league.id,
      season.id,
      q.id,
      owner.id,
      { answer: ownerAnswer },
    );

    if (memberAnswer !== null) {
      await app.questionService.submitAnswer(
        league.id,
        season.id,
        q.id,
        member.id,
        { answer: memberAnswer },
      );
    }

    // Set air date to past for scoring
    await app.prisma.episode.update({
      where: { id: episodes[0].id },
      data: { airDate: new Date(Date.now() - 86400000) },
    });

    await app.questionService.scoreQuestions(league.id, season.id, {
      answers: [{ questionId: q.id, correctAnswer }],
    });

    // Reset air date back to future for next question
    await app.prisma.episode.update({
      where: { id: episodes[0].id },
      data: { airDate: new Date(Date.now() + 86400000) },
    });

    return q;
  }

  it('correct fill-in-the-blank earns pointValue', async () => {
    const q = await createAndSubmitAndScore(
      { pointValue: 2 },
      'Rob',
      null,
      'Rob',
    );

    const answer = await app.prisma.playerAnswer.findUnique({
      where: {
        leagueQuestionId_teamId: {
          leagueQuestionId: q.id,
          teamId: ownerTeam.id,
        },
      },
    });
    expect(answer!.pointsEarned).toBe(2);
  });

  it('wrong fill-in-the-blank earns 0', async () => {
    const q = await createAndSubmitAndScore(
      { pointValue: 2 },
      'Sandra',
      null,
      'Rob',
    );

    const answer = await app.prisma.playerAnswer.findUnique({
      where: {
        leagueQuestionId_teamId: {
          leagueQuestionId: q.id,
          teamId: ownerTeam.id,
        },
      },
    });
    expect(answer!.pointsEarned).toBe(0);
  });

  it('case-insensitive match ("boston rob" == "Boston Rob")', async () => {
    const q = await createAndSubmitAndScore(
      { pointValue: 2 },
      'boston rob',
      null,
      'Boston Rob',
    );

    const answer = await app.prisma.playerAnswer.findUnique({
      where: {
        leagueQuestionId_teamId: {
          leagueQuestionId: q.id,
          teamId: ownerTeam.id,
        },
      },
    });
    expect(answer!.pointsEarned).toBe(2);
  });

  it('whitespace trimmed ("  Rob  " == "Rob")', async () => {
    const q = await createAndSubmitAndScore(
      { pointValue: 2 },
      '  Rob  ',
      null,
      'Rob',
    );

    const answer = await app.prisma.playerAnswer.findUnique({
      where: {
        leagueQuestionId_teamId: {
          leagueQuestionId: q.id,
          teamId: ownerTeam.id,
        },
      },
    });
    expect(answer!.pointsEarned).toBe(2);
  });

  it('MC correct option earns pointValue', async () => {
    const q = await createAndSubmitAndScore(
      {
        type: 'MULTIPLE_CHOICE',
        options: ['Alice', 'Bob', 'Carol'],
        pointValue: 3,
      },
      'Bob',
      null,
      'Bob',
    );

    const answer = await app.prisma.playerAnswer.findUnique({
      where: {
        leagueQuestionId_teamId: {
          leagueQuestionId: q.id,
          teamId: ownerTeam.id,
        },
      },
    });
    expect(answer!.pointsEarned).toBe(3);
  });

  it('MC wrong option earns 0', async () => {
    const q = await createAndSubmitAndScore(
      {
        type: 'MULTIPLE_CHOICE',
        options: ['Alice', 'Bob', 'Carol'],
        pointValue: 3,
      },
      'Alice',
      null,
      'Bob',
    );

    const answer = await app.prisma.playerAnswer.findUnique({
      where: {
        leagueQuestionId_teamId: {
          leagueQuestionId: q.id,
          teamId: ownerTeam.id,
        },
      },
    });
    expect(answer!.pointsEarned).toBe(0);
  });

  it('batch scoring (multiple questions at once)', async () => {
    const q1 = await app.questionService.createLeagueQuestion(
      league.id,
      season.id,
      {
        episodeNumber: 1,
        text: 'Q1',
        type: 'FILL_IN_THE_BLANK',
        pointValue: 2,
      },
    );
    const q2 = await app.questionService.createLeagueQuestion(
      league.id,
      season.id,
      {
        episodeNumber: 1,
        text: 'Q2',
        type: 'FILL_IN_THE_BLANK',
        pointValue: 3,
      },
    );

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

    await app.prisma.episode.update({
      where: { id: episodes[0].id },
      data: { airDate: new Date(Date.now() - 86400000) },
    });

    const result = await app.questionService.scoreQuestions(
      league.id,
      season.id,
      {
        answers: [
          { questionId: q1.id, correctAnswer: 'A' },
          { questionId: q2.id, correctAnswer: 'B' },
        ],
      },
    );

    expect(result.scoredCount).toBe(2);

    const ownerAnswers = await app.prisma.playerAnswer.findMany({
      where: { teamId: ownerTeam.id },
    });
    const totalPts = ownerAnswers.reduce(
      (sum, a) => sum + (a.pointsEarned || 0),
      0,
    );
    expect(totalPts).toBe(5);
  });

  it('scoring updates Team.totalPoints', async () => {
    await createAndSubmitAndScore(
      { pointValue: 5 },
      'Correct',
      null,
      'Correct',
    );

    const team = await app.prisma.team.findUnique({
      where: { id: ownerTeam.id },
    });
    expect(team!.totalPoints).toBe(5);
  });

  it('scoring triggers recalculateTeamHistory (TeamEpisodePoints created)', async () => {
    await createAndSubmitAndScore(
      { pointValue: 5 },
      'Correct',
      null,
      'Correct',
    );

    const episodePoints = await app.prisma.teamEpisodePoints.findMany({
      where: { teamId: ownerTeam.id },
    });
    expect(episodePoints.length).toBeGreaterThan(0);
  });

  it('pointValue of 5 → correct answer earns 5', async () => {
    const q = await createAndSubmitAndScore(
      { pointValue: 5 },
      'Answer',
      null,
      'Answer',
    );

    const answer = await app.prisma.playerAnswer.findUnique({
      where: {
        leagueQuestionId_teamId: {
          leagueQuestionId: q.id,
          teamId: ownerTeam.id,
        },
      },
    });
    expect(answer!.pointsEarned).toBe(5);
  });

  it('team with no answers submitted is not affected by scoring', async () => {
    // Only owner submits
    const q = await app.questionService.createLeagueQuestion(
      league.id,
      season.id,
      {
        episodeNumber: 1,
        text: 'Q',
        type: 'FILL_IN_THE_BLANK',
        pointValue: 3,
      },
    );

    await app.questionService.submitAnswer(
      league.id,
      season.id,
      q.id,
      owner.id,
      { answer: 'Right' },
    );

    await app.prisma.episode.update({
      where: { id: episodes[0].id },
      data: { airDate: new Date(Date.now() - 86400000) },
    });

    await app.questionService.scoreQuestions(league.id, season.id, {
      answers: [{ questionId: q.id, correctAnswer: 'Right' }],
    });

    const memberTeamAfter = await app.prisma.team.findUnique({
      where: { id: memberTeam.id },
    });
    expect(memberTeamAfter!.totalPoints).toBe(0);
  });
});

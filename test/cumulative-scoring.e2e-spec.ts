import { TestApp, createTestApp } from './helpers/test-app';
import { cleanDatabase } from './helpers/cleanup';
import {
  seedUser,
  seedSeason,
  seedLeagueWithTeam,
  seedRetentionConfig,
  addMemberWithTeam,
  resetCounter,
} from './helpers/seed';

describe('Cumulative Scoring (e2e)', () => {
  let app: TestApp;

  let season: any;
  let episodes: any[];
  let castaways: any[];
  let owner: any;
  let league: any;
  let leagueSeason: any;
  let team: any;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.module.close();
  });

  beforeEach(async () => {
    await cleanDatabase(app.prisma);
    resetCounter();

    owner = await seedUser(app.prisma, { name: 'Owner' });

    const seasonData = await seedSeason(app.prisma, {
      episodeCount: 5,
      castawayCount: 6,
      activeEpisode: 4,
    });
    season = seasonData.season;
    episodes = seasonData.episodes;
    castaways = seasonData.castaways;

    const leagueData = await seedLeagueWithTeam(app.prisma, season.id, owner);
    league = leagueData.league;
    leagueSeason = leagueData.leagueSeason;
    team = leagueData.team;

    // Draft 2 castaways from episode 1
    await app.prisma.teamCastaway.create({
      data: { teamId: team.id, castawayId: castaways[0].id, startEpisode: 1 },
    });
    await app.prisma.teamCastaway.create({
      data: { teamId: team.id, castawayId: castaways[1].id, startEpisode: 1 },
    });
  });

  async function createScoreQuestion(
    episodeNumber: number,
    correctAnswer: string,
    teamAnswer: string,
    pointValue: number,
  ) {
    const q = await app.questionService.createLeagueQuestion(
      league.id,
      season.id,
      {
        episodeNumber,
        text: `Q for ep ${episodeNumber}`,
        type: 'FILL_IN_THE_BLANK',
        pointValue,
      },
    );

    // Set episode air date to future, submit, then set to past
    await app.prisma.episode.update({
      where: { id: episodes[episodeNumber - 1].id },
      data: { airDate: new Date(Date.now() + 86400000) },
    });

    await app.questionService.submitAnswer(
      league.id,
      season.id,
      q.id,
      owner.id,
      { answer: teamAnswer },
    );

    await app.prisma.episode.update({
      where: { id: episodes[episodeNumber - 1].id },
      data: { airDate: new Date(Date.now() - 86400000) },
    });

    await app.questionService.scoreQuestions(league.id, season.id, {
      answers: [{ questionId: q.id, correctAnswer }],
    });

    return q;
  }

  it('single episode → correct TeamEpisodePoints created', async () => {
    await seedRetentionConfig(app.prisma, leagueSeason.id, [
      { episodeNumber: 1, pointsPerCastaway: 2 },
    ]);

    await createScoreQuestion(1, 'A', 'A', 5);

    const tep = await app.prisma.teamEpisodePoints.findUnique({
      where: {
        teamId_episodeNumber: { teamId: team.id, episodeNumber: 1 },
      },
    });

    expect(tep).not.toBeNull();
    expect(tep!.questionPoints).toBe(5);
    expect(tep!.retentionPoints).toBe(4); // 2 castaways * 2pts
    expect(tep!.totalEpisodePoints).toBe(9);
    expect(tep!.runningTotal).toBe(9);
  });

  it('3 episodes sequential → runningTotal accumulates', async () => {
    await seedRetentionConfig(app.prisma, leagueSeason.id, [
      { episodeNumber: 1, pointsPerCastaway: 1 },
      { episodeNumber: 2, pointsPerCastaway: 1 },
      { episodeNumber: 3, pointsPerCastaway: 1 },
    ]);

    // Ep 1: 5 question pts + 2 retention = 7
    await createScoreQuestion(1, 'A', 'A', 5);
    // Ep 2: 3 question pts + 2 retention = 5
    await createScoreQuestion(2, 'B', 'B', 3);
    // Ep 3: 0 question pts (wrong) + 2 retention = 2
    await createScoreQuestion(3, 'C', 'Wrong', 4);

    const ep1 = await app.prisma.teamEpisodePoints.findUnique({
      where: { teamId_episodeNumber: { teamId: team.id, episodeNumber: 1 } },
    });
    const ep2 = await app.prisma.teamEpisodePoints.findUnique({
      where: { teamId_episodeNumber: { teamId: team.id, episodeNumber: 2 } },
    });
    const ep3 = await app.prisma.teamEpisodePoints.findUnique({
      where: { teamId_episodeNumber: { teamId: team.id, episodeNumber: 3 } },
    });

    expect(ep1!.runningTotal).toBe(7);
    expect(ep2!.runningTotal).toBe(12); // 7 + 5
    expect(ep3!.runningTotal).toBe(14); // 12 + 2
  });

  it('recalculation is idempotent (call twice, same result)', async () => {
    await seedRetentionConfig(app.prisma, leagueSeason.id, [
      { episodeNumber: 1, pointsPerCastaway: 2 },
    ]);

    await createScoreQuestion(1, 'A', 'A', 5);

    const first = await app.leagueService.recalculateTeamHistory(team.id, 4);
    const second = await app.leagueService.recalculateTeamHistory(team.id, 4);

    expect(first.finalTotal).toBe(second.finalTotal);

    // Only 1 record per episode (not duplicated)
    const allTep = await app.prisma.teamEpisodePoints.findMany({
      where: { teamId: team.id },
    });
    // Should have entries for eps 1-4 (maxEpisode=4)
    const ep1Records = allTep.filter((t) => t.episodeNumber === 1);
    expect(ep1Records).toHaveLength(1);
  });

  it('recalculation after re-scoring updates history', async () => {
    await seedRetentionConfig(app.prisma, leagueSeason.id, [
      { episodeNumber: 1, pointsPerCastaway: 2 },
    ]);

    await createScoreQuestion(1, 'A', 'A', 5);

    const before = await app.prisma.teamEpisodePoints.findUnique({
      where: { teamId_episodeNumber: { teamId: team.id, episodeNumber: 1 } },
    });
    expect(before!.questionPoints).toBe(5);

    // Manually update the answer points (simulate re-scoring)
    await app.prisma.playerAnswer.updateMany({
      where: { teamId: team.id },
      data: { pointsEarned: 10 },
    });

    await app.leagueService.recalculateTeamHistory(team.id, 4);

    const after = await app.prisma.teamEpisodePoints.findUnique({
      where: { teamId_episodeNumber: { teamId: team.id, episodeNumber: 1 } },
    });
    expect(after!.questionPoints).toBe(10);
  });

  it('Team.totalPoints matches final runningTotal', async () => {
    await seedRetentionConfig(app.prisma, leagueSeason.id, [
      { episodeNumber: 1, pointsPerCastaway: 1 },
      { episodeNumber: 2, pointsPerCastaway: 1 },
    ]);

    await createScoreQuestion(1, 'A', 'A', 3);
    await createScoreQuestion(2, 'B', 'B', 4);

    const teamAfter = await app.prisma.team.findUnique({
      where: { id: team.id },
    });

    const lastTep = await app.prisma.teamEpisodePoints.findFirst({
      where: { teamId: team.id },
      orderBy: { episodeNumber: 'desc' },
    });

    // The team totalPoints should match the final running total from recalculation
    // Note: recalculateTeamHistory is called with activeEpisode (4)
    // The last TEP created might be ep 4 (with 0 question pts + 0 retention)
    // Let's check the actual last ep that has non-zero data
    expect(teamAfter!.totalPoints).toBe(lastTep!.runningTotal);
  });

  it('recalculateAllEpisodePoints recalculates all teams', async () => {
    const member = await seedUser(app.prisma, { name: 'Member' });
    const memberData = await addMemberWithTeam(
      app.prisma,
      league.id,
      leagueSeason.id,
      member,
    );

    await seedRetentionConfig(app.prisma, leagueSeason.id, [
      { episodeNumber: 1, pointsPerCastaway: 1 },
    ]);

    // Create question and both answer
    const q = await app.questionService.createLeagueQuestion(
      league.id,
      season.id,
      {
        episodeNumber: 1,
        text: 'Q',
        type: 'FILL_IN_THE_BLANK',
        pointValue: 5,
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
      { answer: 'Right' },
    );
    await app.questionService.submitAnswer(
      league.id,
      season.id,
      q.id,
      member.id,
      { answer: 'Wrong' },
    );

    await app.prisma.episode.update({
      where: { id: episodes[0].id },
      data: { airDate: new Date(Date.now() - 86400000) },
    });

    await app.questionService.scoreQuestions(league.id, season.id, {
      answers: [{ questionId: q.id, correctAnswer: 'Right' }],
    });

    // Now recalculate all
    const result = await app.leagueService.recalculateAllEpisodePoints(
      league.id,
      season.id,
    );

    expect(result.teamsRecalculated).toBe(2);

    const ownerTep = await app.prisma.teamEpisodePoints.findMany({
      where: { teamId: team.id },
    });
    const memberTep = await app.prisma.teamEpisodePoints.findMany({
      where: { teamId: memberData.team.id },
    });

    expect(ownerTep.length).toBeGreaterThan(0);
    expect(memberTep.length).toBeGreaterThan(0);
  });

  it('episode with no questions → questionPoints=0, retentionPoints still counted', async () => {
    await seedRetentionConfig(app.prisma, leagueSeason.id, [
      { episodeNumber: 2, pointsPerCastaway: 3 },
    ]);

    // No questions for episode 2, just recalculate
    await app.leagueService.recalculateTeamHistory(team.id, 2);

    const tep = await app.prisma.teamEpisodePoints.findUnique({
      where: { teamId_episodeNumber: { teamId: team.id, episodeNumber: 2 } },
    });

    expect(tep!.questionPoints).toBe(0);
    expect(tep!.retentionPoints).toBe(6); // 2 castaways * 3pts
    expect(tep!.totalEpisodePoints).toBe(6);
  });

  it('episode with no retention config → retentionPoints=0, questionPoints still counted', async () => {
    // No retention config for episode 1
    await createScoreQuestion(1, 'A', 'A', 5);

    const tep = await app.prisma.teamEpisodePoints.findUnique({
      where: { teamId_episodeNumber: { teamId: team.id, episodeNumber: 1 } },
    });

    expect(tep!.questionPoints).toBe(5);
    expect(tep!.retentionPoints).toBe(0);
    expect(tep!.totalEpisodePoints).toBe(5);
  });
});

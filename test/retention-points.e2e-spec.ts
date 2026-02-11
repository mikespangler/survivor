import { TestApp, createTestApp } from './helpers/test-app';
import { cleanDatabase } from './helpers/cleanup';
import {
  seedUser,
  seedSeason,
  seedLeagueWithTeam,
  seedRetentionConfig,
  resetCounter,
} from './helpers/seed';

describe('Retention Points (e2e)', () => {
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
      episodeCount: 10,
      castawayCount: 10,
      activeEpisode: 6,
    });
    season = seasonData.season;
    episodes = seasonData.episodes;
    castaways = seasonData.castaways;

    const leagueData = await seedLeagueWithTeam(app.prisma, season.id, owner);
    league = leagueData.league;
    leagueSeason = leagueData.leagueSeason;
    team = leagueData.team;
  });

  it('4 castaways active all season → each episode activeCastaways=4', async () => {
    // Draft 4 castaways starting at episode 1
    await app.prisma.season.update({
      where: { id: season.id },
      data: { activeEpisode: 1 },
    });

    const ids = castaways.slice(0, 4).map((c) => c.id);
    await app.teamService.bulkAddCastaways(team.id, { castawayIds: ids });

    // Reset activeEpisode
    await app.prisma.season.update({
      where: { id: season.id },
      data: { activeEpisode: 6 },
    });

    await seedRetentionConfig(app.prisma, leagueSeason.id, [
      { episodeNumber: 1, pointsPerCastaway: 2 },
      { episodeNumber: 2, pointsPerCastaway: 2 },
      { episodeNumber: 3, pointsPerCastaway: 2 },
      { episodeNumber: 4, pointsPerCastaway: 2 },
      { episodeNumber: 5, pointsPerCastaway: 2 },
    ]);

    for (let ep = 1; ep <= 5; ep++) {
      const points = await app.leagueService.calculateEpisodePoints(
        team.id,
        ep,
      );
      expect(points.retentionPoints).toBe(8); // 4 * 2
    }
  });

  it('castaway eliminated ep 3 → ep1-3: 4 active, ep4+: 3 active', async () => {
    await app.prisma.season.update({
      where: { id: season.id },
      data: { activeEpisode: 1 },
    });

    const ids = castaways.slice(0, 4).map((c) => c.id);
    await app.teamService.bulkAddCastaways(team.id, { castawayIds: ids });

    await app.prisma.season.update({
      where: { id: season.id },
      data: { activeEpisode: 6 },
    });

    // Eliminate castaway 0 at episode 3 (endEpisode = 3 means active through ep 3)
    await app.prisma.teamCastaway.updateMany({
      where: { teamId: team.id, castawayId: castaways[0].id },
      data: { endEpisode: 3 },
    });

    await seedRetentionConfig(app.prisma, leagueSeason.id, [
      { episodeNumber: 1, pointsPerCastaway: 2 },
      { episodeNumber: 2, pointsPerCastaway: 2 },
      { episodeNumber: 3, pointsPerCastaway: 2 },
      { episodeNumber: 4, pointsPerCastaway: 2 },
      { episodeNumber: 5, pointsPerCastaway: 2 },
    ]);

    // Ep 1-3: 4 active = 8 pts
    for (let ep = 1; ep <= 3; ep++) {
      const points = await app.leagueService.calculateEpisodePoints(
        team.id,
        ep,
      );
      expect(points.retentionPoints).toBe(8);
    }

    // Ep 4-5: 3 active = 6 pts
    for (let ep = 4; ep <= 5; ep++) {
      const points = await app.leagueService.calculateEpisodePoints(
        team.id,
        ep,
      );
      expect(points.retentionPoints).toBe(6);
    }
  });

  it('castaway added mid-season (startEpisode=5) → ep1-4 excludes, ep5+ includes', async () => {
    await app.prisma.season.update({
      where: { id: season.id },
      data: { activeEpisode: 1 },
    });

    // Add 3 castaways at ep 1
    const ids = castaways.slice(0, 3).map((c) => c.id);
    await app.teamService.bulkAddCastaways(team.id, { castawayIds: ids });

    await app.prisma.season.update({
      where: { id: season.id },
      data: { activeEpisode: 6 },
    });

    // Add 1 more castaway starting at episode 5
    await app.prisma.teamCastaway.create({
      data: {
        teamId: team.id,
        castawayId: castaways[3].id,
        startEpisode: 5,
      },
    });

    await seedRetentionConfig(app.prisma, leagueSeason.id, [
      { episodeNumber: 4, pointsPerCastaway: 2 },
      { episodeNumber: 5, pointsPerCastaway: 2 },
    ]);

    // Ep 4: only 3 active = 6 pts
    const ep4 = await app.leagueService.calculateEpisodePoints(team.id, 4);
    expect(ep4.retentionPoints).toBe(6);

    // Ep 5: 4 active = 8 pts
    const ep5 = await app.leagueService.calculateEpisodePoints(team.id, 5);
    expect(ep5.retentionPoints).toBe(8);
  });

  it('replaceCastaways at ep 5 → old endEpisode=4, new startEpisode=5', async () => {
    await app.prisma.season.update({
      where: { id: season.id },
      data: { activeEpisode: 1 },
    });

    const oldIds = castaways.slice(0, 2).map((c) => c.id);
    await app.teamService.bulkAddCastaways(team.id, { castawayIds: oldIds });

    await app.prisma.season.update({
      where: { id: season.id },
      data: { activeEpisode: 6 },
    });

    const newIds = castaways.slice(2, 4).map((c) => c.id);
    await app.teamService.replaceCastaways(
      team.id,
      { castawayIds: newIds },
      5,
    );

    await seedRetentionConfig(app.prisma, leagueSeason.id, [
      { episodeNumber: 4, pointsPerCastaway: 2 },
      { episodeNumber: 5, pointsPerCastaway: 2 },
    ]);

    // Ep 4: old 2 active (endEpisode=4 >= 4) = 4 pts
    const ep4 = await app.leagueService.calculateEpisodePoints(team.id, 4);
    expect(ep4.retentionPoints).toBe(4);

    // Ep 5: new 2 active (startEpisode=5 <= 5) = 4 pts
    const ep5 = await app.leagueService.calculateEpisodePoints(team.id, 5);
    expect(ep5.retentionPoints).toBe(4);
  });

  it('no retention config → 0 retention points', async () => {
    await app.prisma.season.update({
      where: { id: season.id },
      data: { activeEpisode: 1 },
    });

    await app.teamService.bulkAddCastaways(team.id, {
      castawayIds: [castaways[0].id],
    });

    await app.prisma.season.update({
      where: { id: season.id },
      data: { activeEpisode: 6 },
    });

    // No retention config created
    const points = await app.leagueService.calculateEpisodePoints(team.id, 1);
    expect(points.retentionPoints).toBe(0);
  });

  it('varying retention per episode (ep1: 1pt, ep5: 3pts)', async () => {
    await app.prisma.season.update({
      where: { id: season.id },
      data: { activeEpisode: 1 },
    });

    await app.teamService.bulkAddCastaways(team.id, {
      castawayIds: [castaways[0].id, castaways[1].id],
    });

    await app.prisma.season.update({
      where: { id: season.id },
      data: { activeEpisode: 6 },
    });

    await seedRetentionConfig(app.prisma, leagueSeason.id, [
      { episodeNumber: 1, pointsPerCastaway: 1 },
      { episodeNumber: 5, pointsPerCastaway: 3 },
    ]);

    const ep1 = await app.leagueService.calculateEpisodePoints(team.id, 1);
    expect(ep1.retentionPoints).toBe(2); // 2 castaways * 1pt

    const ep5 = await app.leagueService.calculateEpisodePoints(team.id, 5);
    expect(ep5.retentionPoints).toBe(6); // 2 castaways * 3pts
  });

  it('zero castaways → 0 retention points', async () => {
    await seedRetentionConfig(app.prisma, leagueSeason.id, [
      { episodeNumber: 1, pointsPerCastaway: 5 },
    ]);

    const points = await app.leagueService.calculateEpisodePoints(team.id, 1);
    expect(points.retentionPoints).toBe(0);
  });

  it('endEpisode exactly equals episodeNumber → still active (>= check)', async () => {
    await app.prisma.season.update({
      where: { id: season.id },
      data: { activeEpisode: 1 },
    });

    await app.teamService.addCastaway(team.id, {
      castawayId: castaways[0].id,
    });

    await app.prisma.season.update({
      where: { id: season.id },
      data: { activeEpisode: 6 },
    });

    // Set endEpisode to exactly 3
    await app.prisma.teamCastaway.updateMany({
      where: { teamId: team.id, castawayId: castaways[0].id },
      data: { endEpisode: 3 },
    });

    await seedRetentionConfig(app.prisma, leagueSeason.id, [
      { episodeNumber: 3, pointsPerCastaway: 2 },
      { episodeNumber: 4, pointsPerCastaway: 2 },
    ]);

    // Ep 3: endEpisode(3) >= 3 → active
    const ep3 = await app.leagueService.calculateEpisodePoints(team.id, 3);
    expect(ep3.retentionPoints).toBe(2);

    // Ep 4: endEpisode(3) < 4 → not active
    const ep4 = await app.leagueService.calculateEpisodePoints(team.id, 4);
    expect(ep4.retentionPoints).toBe(0);
  });
});

import { TestApp, createTestApp } from './helpers/test-app';
import { cleanDatabase } from './helpers/cleanup';
import {
  seedUser,
  seedSeason,
  seedLeagueWithTeam,
  resetCounter,
} from './helpers/seed';

describe('Draft Flow (e2e)', () => {
  let app: TestApp;

  let season: any;
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
      episodeCount: 14,
      castawayCount: 18,
      activeEpisode: 1,
    });
    season = seasonData.season;
    castaways = seasonData.castaways;

    const leagueData = await seedLeagueWithTeam(app.prisma, season.id, owner);
    league = leagueData.league;
    leagueSeason = leagueData.leagueSeason;
    team = leagueData.team;
  });

  it('bulkAddCastaways creates correct TeamCastaway records', async () => {
    const ids = castaways.slice(0, 4).map((c) => c.id);

    const result = await app.teamService.bulkAddCastaways(team.id, {
      castawayIds: ids,
    });

    expect(result).toHaveLength(4);
    for (const entry of result) {
      expect(entry.startEpisode).toBe(1); // activeEpisode = 1
      expect(entry.endEpisode).toBeNull();
    }
  });

  it('bulkAddCastaways with already-on-team castaway throws ConflictException', async () => {
    const ids = castaways.slice(0, 2).map((c) => c.id);
    await app.teamService.bulkAddCastaways(team.id, { castawayIds: ids });

    await expect(
      app.teamService.bulkAddCastaways(team.id, {
        castawayIds: [castaways[0].id, castaways[2].id],
      }),
    ).rejects.toThrow('Some castaways already on team');
  });

  it('replaceCastaways closes old + creates new entries', async () => {
    const oldIds = castaways.slice(0, 3).map((c) => c.id);
    await app.teamService.bulkAddCastaways(team.id, { castawayIds: oldIds });

    const newIds = castaways.slice(3, 6).map((c) => c.id);
    const result = await app.teamService.replaceCastaways(
      team.id,
      { castawayIds: newIds },
      3, // currentEpisode
    );

    expect(result).toHaveLength(3);
    for (const entry of result) {
      expect(entry.startEpisode).toBe(3);
    }

    // Old entries should be closed
    const oldEntries = await app.prisma.teamCastaway.findMany({
      where: {
        teamId: team.id,
        castawayId: { in: oldIds },
      },
    });
    for (const entry of oldEntries) {
      expect(entry.endEpisode).toBe(2); // currentEpisode - 1
    }
  });

  it('replaceCastaways mid-season → old endEpisode=currentEp-1, new startEpisode=currentEp', async () => {
    // Advance season to episode 5
    await app.prisma.season.update({
      where: { id: season.id },
      data: { activeEpisode: 5 },
    });

    const oldIds = [castaways[0].id, castaways[1].id];
    await app.teamService.bulkAddCastaways(team.id, { castawayIds: oldIds });

    const newIds = [castaways[2].id, castaways[3].id];
    await app.teamService.replaceCastaways(
      team.id,
      { castawayIds: newIds },
      5,
    );

    // Old entries: endEpisode = 4
    const oldEntries = await app.prisma.teamCastaway.findMany({
      where: { teamId: team.id, castawayId: { in: oldIds } },
    });
    expect(oldEntries.every((e) => e.endEpisode === 4)).toBe(true);

    // New entries: startEpisode = 5
    const newEntries = await app.prisma.teamCastaway.findMany({
      where: { teamId: team.id, castawayId: { in: newIds } },
    });
    expect(newEntries.every((e) => e.startEpisode === 5)).toBe(true);
    expect(newEntries.every((e) => e.endEpisode === null)).toBe(true);
  });

  it('roster history preserved after replacement (old records not deleted)', async () => {
    const oldIds = [castaways[0].id, castaways[1].id];
    await app.teamService.bulkAddCastaways(team.id, { castawayIds: oldIds });

    const newIds = [castaways[2].id, castaways[3].id];
    await app.teamService.replaceCastaways(
      team.id,
      { castawayIds: newIds },
      3,
    );

    const allEntries = await app.prisma.teamCastaway.findMany({
      where: { teamId: team.id },
    });
    // 2 old (closed) + 2 new (active) = 4 total
    expect(allEntries).toHaveLength(4);
  });

  it('addCastaway single → correct entry', async () => {
    const result = await app.teamService.addCastaway(team.id, {
      castawayId: castaways[0].id,
    });

    expect(result.castawayId).toBe(castaways[0].id);
    expect(result.startEpisode).toBe(1);
    expect(result.endEpisode).toBeNull();
  });

  it('removeCastaway → sets endEpisode correctly', async () => {
    await app.teamService.addCastaway(team.id, {
      castawayId: castaways[0].id,
    });

    const result = await app.teamService.removeCastaway(
      team.id,
      castaways[0].id,
    );

    // activeEpisode is 1, so endEpisode = 1 - 1 = 0
    expect(result.endEpisode).toBe(0);
  });

  it('addCastaway duplicate (already active) → throws BadRequestException', async () => {
    await app.teamService.addCastaway(team.id, {
      castawayId: castaways[0].id,
    });

    await expect(
      app.teamService.addCastaway(team.id, {
        castawayId: castaways[0].id,
      }),
    ).rejects.toThrow('Castaway is already on this team');
  });
});

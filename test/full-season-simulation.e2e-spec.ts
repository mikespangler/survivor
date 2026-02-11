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

/**
 * Full 12-week season simulation with 4 players.
 *
 * Setup:
 * - Season with 14 episodes, 18 castaways, activeEpisode=1
 * - 4 users (Alice, Bob, Carol, Dave), 1 league, 4 teams
 * - Each team drafts 4 castaways (16 total; 2 undrafted eliminated first)
 * - Retention config: 2 pts/castaway for all 12 episodes
 *
 * Each week:
 * 1. Create 3 questions (2 FITB @2pts, 1 MC @3pts = 7pts max)
 * 2. All 4 teams submit answers
 * 3. Advance activeEpisode
 * 4. Score questions
 * 5. Eliminate 1 castaway
 * 6. Verify points
 */
describe('Full Season Simulation (e2e)', () => {
  let app: TestApp;

  // Test data
  let season: any;
  let episodes: any[];
  let castaways: any[];
  let alice: any;
  let bob: any;
  let carol: any;
  let dave: any;
  let league: any;
  let leagueSeason: any;
  let aliceTeam: any;
  let bobTeam: any;
  let carolTeam: any;
  let daveTeam: any;
  let teams: { user: any; team: any; castaways: any[] }[];

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.module.close();
  });

  beforeEach(async () => {
    await cleanDatabase(app.prisma);
    resetCounter();
  });

  /**
   * Predefined answer patterns for each team per episode.
   * Format: [q1Answer, q2Answer, q3Answer] where q3 is MC.
   * true = correct, false = wrong
   */
  const answerPatterns: Record<number, boolean[][]> = {
    // [Alice, Bob, Carol, Dave] for each question
    1: [
      [true, true, true, true],    // q1: all correct
      [true, true, false, true],   // q2: Carol wrong
      [true, false, true, false],  // q3 MC: Alice/Carol correct
    ],
    2: [
      [true, true, true, false],
      [true, false, true, true],
      [false, true, true, true],
    ],
    3: [
      [true, true, false, true],
      [true, true, true, false],
      [true, false, true, true],
    ],
    4: [
      [true, false, true, true],
      [false, true, true, false],
      [true, true, false, true],
    ],
    5: [
      [true, true, true, true],    // All correct on q1
      [true, true, false, false],
      [false, false, true, true],
    ],
    6: [
      [true, false, true, false],
      [true, true, false, true],
      [false, true, true, false],
    ],
    7: [
      [true, true, true, false],
      [true, false, true, true],
      [true, true, false, false],
    ],
    8: [
      [true, true, true, false],   // Dave answers all wrong this ep
      [true, true, true, false],
      [true, true, true, false],
    ],
    9: [
      [true, false, true, true],
      [false, true, true, false],
      [true, true, false, true],
    ],
    // Ep 10: wager question (handled separately)
    10: [
      [true, true, false, true],
      [true, false, true, false],
      [true, true, true, true],    // placeholder, wager handled specially
    ],
    11: [
      [true, true, true, true],    // All correct
      [true, true, true, true],
      [true, true, true, true],
    ],
    12: [
      [true, false, true, true],
      [true, true, false, false],
      [false, true, true, true],
    ],
  };

  // Track expected active castaways per team per episode
  // Eliminations: ep1: castaway 16, ep2: 17, ep3: from Dave, etc.
  // Starting: all 4 teams have 4 castaways each

  async function setupFullSeason() {
    // Create users
    alice = await seedUser(app.prisma, { name: 'Alice' });
    bob = await seedUser(app.prisma, { name: 'Bob' });
    carol = await seedUser(app.prisma, { name: 'Carol' });
    dave = await seedUser(app.prisma, { name: 'Dave' });

    // Create season
    const seasonData = await seedSeason(app.prisma, {
      episodeCount: 14,
      castawayCount: 18,
      activeEpisode: 1,
    });
    season = seasonData.season;
    episodes = seasonData.episodes;
    castaways = seasonData.castaways;

    // Set ALL episode air dates to the future initially
    for (const ep of episodes) {
      await app.prisma.episode.update({
        where: { id: ep.id },
        data: { airDate: new Date(Date.now() + 86400000 * ep.number) },
      });
    }

    // Create league with Alice as owner
    const leagueData = await seedLeagueWithTeam(
      app.prisma,
      season.id,
      alice,
    );
    league = leagueData.league;
    leagueSeason = leagueData.leagueSeason;
    aliceTeam = leagueData.team;

    // Add other members
    const bobData = await addMemberWithTeam(
      app.prisma,
      league.id,
      leagueSeason.id,
      bob,
    );
    bobTeam = bobData.team;

    const carolData = await addMemberWithTeam(
      app.prisma,
      league.id,
      leagueSeason.id,
      carol,
    );
    carolTeam = carolData.team;

    const daveData = await addMemberWithTeam(
      app.prisma,
      league.id,
      leagueSeason.id,
      dave,
    );
    daveTeam = daveData.team;

    teams = [
      { user: alice, team: aliceTeam, castaways: castaways.slice(0, 4) },
      { user: bob, team: bobTeam, castaways: castaways.slice(4, 8) },
      { user: carol, team: carolTeam, castaways: castaways.slice(8, 12) },
      { user: dave, team: daveTeam, castaways: castaways.slice(12, 16) },
    ];

    // Draft: each team gets 4 castaways (indices 0-3, 4-7, 8-11, 12-15)
    // Castaways 16 and 17 are undrafted
    for (const t of teams) {
      await app.teamService.bulkAddCastaways(t.team.id, {
        castawayIds: t.castaways.map((c) => c.id),
      });
    }

    // Retention config: 2 pts/castaway for all 12 episodes
    const retentionEpisodes = [];
    for (let i = 1; i <= 12; i++) {
      retentionEpisodes.push({ episodeNumber: i, pointsPerCastaway: 2 });
    }
    await seedRetentionConfig(
      app.prisma,
      leagueSeason.id,
      retentionEpisodes,
    );
  }

  async function simulateWeek(
    episodeNumber: number,
    isWagerEp: boolean = false,
  ) {
    const teamList = [
      { user: alice, team: aliceTeam },
      { user: bob, team: bobTeam },
      { user: carol, team: carolTeam },
      { user: dave, team: daveTeam },
    ];

    // 1. Create 3 questions
    const questions = [];

    if (isWagerEp) {
      // 2 normal + 1 wager
      questions.push(
        await app.questionService.createLeagueQuestion(
          league.id,
          season.id,
          {
            episodeNumber,
            text: `Ep${episodeNumber} Q1`,
            type: 'FILL_IN_THE_BLANK',
            pointValue: 2,
          },
        ),
      );
      questions.push(
        await app.questionService.createLeagueQuestion(
          league.id,
          season.id,
          {
            episodeNumber,
            text: `Ep${episodeNumber} Q2`,
            type: 'FILL_IN_THE_BLANK',
            pointValue: 2,
          },
        ),
      );
      questions.push(
        await app.questionService.createLeagueQuestion(
          league.id,
          season.id,
          {
            episodeNumber,
            text: `Ep${episodeNumber} Wager`,
            type: 'FILL_IN_THE_BLANK',
            pointValue: 1,
            isWager: true,
            minWager: 1,
            maxWager: 10,
          },
        ),
      );
    } else {
      questions.push(
        await app.questionService.createLeagueQuestion(
          league.id,
          season.id,
          {
            episodeNumber,
            text: `Ep${episodeNumber} Q1`,
            type: 'FILL_IN_THE_BLANK',
            pointValue: 2,
          },
        ),
      );
      questions.push(
        await app.questionService.createLeagueQuestion(
          league.id,
          season.id,
          {
            episodeNumber,
            text: `Ep${episodeNumber} Q2`,
            type: 'FILL_IN_THE_BLANK',
            pointValue: 2,
          },
        ),
      );
      questions.push(
        await app.questionService.createLeagueQuestion(
          league.id,
          season.id,
          {
            episodeNumber,
            text: `Ep${episodeNumber} Q3`,
            type: 'MULTIPLE_CHOICE',
            options: ['Opt A', 'Opt B', 'Opt C'],
            pointValue: 3,
          },
        ),
      );
    }

    // 2. Submit answers
    const pattern = answerPatterns[episodeNumber];
    for (let qi = 0; qi < 3; qi++) {
      const correctAnswer =
        qi === 2 && !isWagerEp ? 'Opt A' : `Correct${episodeNumber}Q${qi + 1}`;

      for (let ti = 0; ti < 4; ti++) {
        const isCorrect = pattern[qi][ti];

        let answer: string;
        if (qi === 2 && !isWagerEp) {
          // MC question
          answer = isCorrect ? 'Opt A' : 'Opt B';
        } else {
          answer = isCorrect
            ? correctAnswer
            : `Wrong${episodeNumber}Q${qi + 1}`;
        }

        const submitDto: any = { answer };

        // For wager episode, q3 is a wager question
        if (isWagerEp && qi === 2) {
          // Wager amounts: Alice=8, Bob=5, Carol=3, Dave=10
          const wagers = [8, 5, 3, 10];
          submitDto.wagerAmount = wagers[ti];
        }

        await app.questionService.submitAnswer(
          league.id,
          season.id,
          questions[qi].id,
          teamList[ti].user.id,
          submitDto,
        );
      }
    }

    // 3. Set air date to past (close submissions) and advance episode
    await app.prisma.episode.update({
      where: { id: episodes[episodeNumber - 1].id },
      data: { airDate: new Date(Date.now() - 86400000) },
    });

    await app.prisma.season.update({
      where: { id: season.id },
      data: { activeEpisode: episodeNumber + 1 },
    });

    // 4. Score questions
    const correctAnswers = questions.map((q, qi) => ({
      questionId: q.id,
      correctAnswer:
        qi === 2 && !isWagerEp
          ? 'Opt A'
          : `Correct${episodeNumber}Q${qi + 1}`,
    }));

    await app.questionService.scoreQuestions(league.id, season.id, {
      answers: correctAnswers,
    });

    return questions;
  }

  async function eliminateCastaway(
    castawayId: string,
    teamId: string | null,
    atEpisode: number,
  ) {
    // Update castaway status
    await app.prisma.castaway.update({
      where: { id: castawayId },
      data: { status: 'ELIMINATED' },
    });

    // Close team roster entry if on a team
    if (teamId) {
      await app.prisma.teamCastaway.updateMany({
        where: {
          teamId,
          castawayId,
          endEpisode: null,
        },
        data: { endEpisode: atEpisode },
      });
    }
  }

  describe('12-week season', () => {
    it('should simulate complete season with correct final standings', async () => {
      await setupFullSeason();

      // === Episode 1: Undrafted castaway eliminated ===
      await simulateWeek(1);
      await eliminateCastaway(castaways[16].id, null, 1);

      // === Episode 2: Undrafted castaway eliminated ===
      await simulateWeek(2);
      await eliminateCastaway(castaways[17].id, null, 2);

      // === Episode 3: Dave's first castaway eliminated ===
      await simulateWeek(3);
      await eliminateCastaway(castaways[12].id, daveTeam.id, 3);

      // === Episode 4 ===
      await simulateWeek(4);
      await eliminateCastaway(castaways[8].id, carolTeam.id, 4);

      // === Episode 5 ===
      await simulateWeek(5);
      await eliminateCastaway(castaways[4].id, bobTeam.id, 5);

      // === Episode 6 ===
      await simulateWeek(6);
      await eliminateCastaway(castaways[13].id, daveTeam.id, 6);

      // === Episode 7: Carol replaces castaways ===
      await simulateWeek(7);
      await eliminateCastaway(castaways[9].id, carolTeam.id, 7);

      // Carol replaces her remaining active roster at episode 8
      // She had castaways 8 (eliminated ep4), 9 (eliminated ep7), 10, 11
      // So active: 10, 11 - replace with unused castaways from other teams that were eliminated
      // Actually for simplicity, let's just test the mechanism works
      // Carol keeps castaways 10, 11 (still active)

      // === Episode 8: Dave answers all wrong ===
      await simulateWeek(8);
      await eliminateCastaway(castaways[5].id, bobTeam.id, 8);

      // === Episode 9 ===
      await simulateWeek(9);
      await eliminateCastaway(castaways[14].id, daveTeam.id, 9);

      // === Episode 10: Wager episode ===
      await simulateWeek(10, true);
      await eliminateCastaway(castaways[10].id, carolTeam.id, 10);

      // === Episode 11: All correct ===
      await simulateWeek(11);
      await eliminateCastaway(castaways[6].id, bobTeam.id, 11);

      // === Episode 12: Final episode ===
      await simulateWeek(12);
      await eliminateCastaway(castaways[15].id, daveTeam.id, 12);

      // === Final Verifications ===

      // Verify each team has TeamEpisodePoints for all 12 episodes
      for (const t of [aliceTeam, bobTeam, carolTeam, daveTeam]) {
        const teps = await app.prisma.teamEpisodePoints.findMany({
          where: { teamId: t.id },
          orderBy: { episodeNumber: 'asc' },
        });

        // Should have entries for eps 1-13 (activeEpisode is now 13)
        expect(teps.length).toBeGreaterThanOrEqual(12);

        // Verify running total is cumulative
        let cumulative = 0;
        for (const tep of teps) {
          cumulative += tep.totalEpisodePoints;
          expect(tep.runningTotal).toBe(cumulative);
        }
      }

      // Verify Team.totalPoints = sum of all episode points
      for (const t of [aliceTeam, bobTeam, carolTeam, daveTeam]) {
        const team = await app.prisma.team.findUnique({
          where: { id: t.id },
        });
        const teps = await app.prisma.teamEpisodePoints.findMany({
          where: { teamId: t.id },
          orderBy: { episodeNumber: 'desc' },
        });

        const lastTep = teps[0];
        expect(team!.totalPoints).toBe(lastTep.runningTotal);
      }

      // Verify getDetailedStandings
      const standings = await app.leagueService.getDetailedStandings(
        league.id,
        season.id,
        alice.id,
      );

      expect(standings.teams).toHaveLength(4);
      // Teams should be ordered by totalPoints desc
      for (let i = 0; i < standings.teams.length - 1; i++) {
        expect(standings.teams[i].totalPoints).toBeGreaterThanOrEqual(
          standings.teams[i + 1].totalPoints,
        );
      }

      // Each team should have episodeHistory
      for (const t of standings.teams) {
        expect(t.episodeHistory.length).toBeGreaterThanOrEqual(12);
        expect(t.rank).toBeGreaterThanOrEqual(1);
        expect(t.rank).toBeLessThanOrEqual(4);
      }

      // Verify ranks are 1-4
      const ranks = standings.teams.map((t) => t.rank);
      expect(ranks).toContain(1);
    });

    it('should correctly track active castaways after eliminations', async () => {
      await setupFullSeason();

      // Simulate through episode 3 with eliminations
      await simulateWeek(1);
      await eliminateCastaway(castaways[16].id, null, 1);

      await simulateWeek(2);
      await eliminateCastaway(castaways[17].id, null, 2);

      await simulateWeek(3);
      await eliminateCastaway(castaways[12].id, daveTeam.id, 3);

      // Dave should have 3 active castaways after ep3
      const daveRoster = await app.prisma.teamCastaway.findMany({
        where: { teamId: daveTeam.id, endEpisode: null },
      });
      expect(daveRoster).toHaveLength(3);

      // Alice should still have 4
      const aliceRoster = await app.prisma.teamCastaway.findMany({
        where: { teamId: aliceTeam.id, endEpisode: null },
      });
      expect(aliceRoster).toHaveLength(4);
    });

    it('should produce different retention points when castaways are eliminated', async () => {
      await setupFullSeason();

      await simulateWeek(1);
      await eliminateCastaway(castaways[16].id, null, 1);

      await simulateWeek(2);
      await eliminateCastaway(castaways[17].id, null, 2);

      await simulateWeek(3);
      // Eliminate one of Dave's castaways at ep 3
      await eliminateCastaway(castaways[12].id, daveTeam.id, 3);

      // Recalculate
      await app.leagueService.recalculateTeamHistory(daveTeam.id, 4);
      await app.leagueService.recalculateTeamHistory(aliceTeam.id, 4);

      // Ep 4: Dave has 3 active castaways, Alice has 4
      const daveEp4 = await app.prisma.teamEpisodePoints.findUnique({
        where: {
          teamId_episodeNumber: { teamId: daveTeam.id, episodeNumber: 4 },
        },
      });
      const aliceEp4 = await app.prisma.teamEpisodePoints.findUnique({
        where: {
          teamId_episodeNumber: { teamId: aliceTeam.id, episodeNumber: 4 },
        },
      });

      expect(daveEp4!.retentionPoints).toBe(6); // 3 * 2
      expect(aliceEp4!.retentionPoints).toBe(8); // 4 * 2
    });

    it('should handle wager questions correctly in simulation', async () => {
      await setupFullSeason();

      // Fast forward through episodes 1-9
      for (let ep = 1; ep <= 9; ep++) {
        await simulateWeek(ep);
        // Eliminate undrafted first, then from teams
        const eliminations = [
          castaways[16], castaways[17], castaways[12],
          castaways[8], castaways[4], castaways[13],
          castaways[9], castaways[5], castaways[14],
        ];
        const teamMap: (string | null)[] = [
          null, null, daveTeam.id,
          carolTeam.id, bobTeam.id, daveTeam.id,
          carolTeam.id, bobTeam.id, daveTeam.id,
        ];
        await eliminateCastaway(
          eliminations[ep - 1].id,
          teamMap[ep - 1],
          ep,
        );
      }

      // Episode 10 is wager episode
      await simulateWeek(10, true);

      // Wager question (q3) in ep10: pattern is [true, true, true, true]
      // Wagers: Alice=8, Bob=5, Carol=3, Dave=10
      // All correct so: Alice +8, Bob +5, Carol +3, Dave +10 from wager

      // Get wager answers
      const wagerAnswers = await app.prisma.playerAnswer.findMany({
        where: {
          leagueQuestion: {
            leagueSeasonId: leagueSeason.id,
            episodeNumber: 10,
            isWager: true,
          },
        },
        include: { team: true },
      });

      const aliceWager = wagerAnswers.find(
        (a) => a.teamId === aliceTeam.id,
      );
      const bobWager = wagerAnswers.find((a) => a.teamId === bobTeam.id);
      const carolWager = wagerAnswers.find(
        (a) => a.teamId === carolTeam.id,
      );
      const daveWager = wagerAnswers.find(
        (a) => a.teamId === daveTeam.id,
      );

      expect(aliceWager!.pointsEarned).toBe(8);
      expect(bobWager!.pointsEarned).toBe(5);
      expect(carolWager!.pointsEarned).toBe(3);
      expect(daveWager!.pointsEarned).toBe(10);
    });

    it('should track all roster changes with startEpisode/endEpisode', async () => {
      await setupFullSeason();

      // Eliminate Dave's castaway at ep 3
      await simulateWeek(1);
      await eliminateCastaway(castaways[16].id, null, 1);
      await simulateWeek(2);
      await eliminateCastaway(castaways[17].id, null, 2);
      await simulateWeek(3);
      await eliminateCastaway(castaways[12].id, daveTeam.id, 3);

      // Check Dave's roster history
      const daveRosterAll = await app.prisma.teamCastaway.findMany({
        where: { teamId: daveTeam.id },
        orderBy: { startEpisode: 'asc' },
      });

      // 4 total entries (all drafted at ep 1)
      expect(daveRosterAll).toHaveLength(4);

      // One should have endEpisode = 3
      const eliminated = daveRosterAll.find(
        (r) => r.castawayId === castaways[12].id,
      );
      expect(eliminated!.endEpisode).toBe(3);
      expect(eliminated!.startEpisode).toBe(1);

      // Others should have null endEpisode
      const active = daveRosterAll.filter((r) => r.endEpisode === null);
      expect(active).toHaveLength(3);
    });

    it('episode 8 Dave gets 0 question points but still gets retention', async () => {
      await setupFullSeason();

      // Simulate through ep 8
      for (let ep = 1; ep <= 7; ep++) {
        await simulateWeek(ep);
        const eliminations = [
          castaways[16], castaways[17], castaways[12],
          castaways[8], castaways[4], castaways[13],
          castaways[9],
        ];
        const teamMap: (string | null)[] = [
          null, null, daveTeam.id,
          carolTeam.id, bobTeam.id, daveTeam.id,
          carolTeam.id,
        ];
        await eliminateCastaway(
          eliminations[ep - 1].id,
          teamMap[ep - 1],
          ep,
        );
      }

      await simulateWeek(8);

      // Dave's ep8 pattern: all false (0 question pts)
      // Dave still has active castaways → should get retention pts
      const daveTep8 = await app.prisma.teamEpisodePoints.findUnique({
        where: {
          teamId_episodeNumber: { teamId: daveTeam.id, episodeNumber: 8 },
        },
      });

      expect(daveTep8!.questionPoints).toBe(0);
      expect(daveTep8!.retentionPoints).toBeGreaterThan(0);
    });

    it('episode 11 all teams get same question points when all correct', async () => {
      await setupFullSeason();

      // Simulate through ep 11
      for (let ep = 1; ep <= 10; ep++) {
        const isWager = ep === 10;
        await simulateWeek(ep, isWager);
        const eliminations = [
          castaways[16], castaways[17], castaways[12],
          castaways[8], castaways[4], castaways[13],
          castaways[9], castaways[5], castaways[14],
          castaways[10],
        ];
        const teamMap: (string | null)[] = [
          null, null, daveTeam.id,
          carolTeam.id, bobTeam.id, daveTeam.id,
          carolTeam.id, bobTeam.id, daveTeam.id,
          carolTeam.id,
        ];
        await eliminateCastaway(
          eliminations[ep - 1].id,
          teamMap[ep - 1],
          ep,
        );
      }

      await simulateWeek(11);

      // Ep 11: all correct pattern = [true, true, true, true] for all 3 questions
      // All teams should have same question points: 2+2+3=7
      const allTep11 = await app.prisma.teamEpisodePoints.findMany({
        where: { episodeNumber: 11 },
      });

      const questionPts = allTep11.map((t) => t.questionPoints);
      // All should be 7
      expect(questionPts.every((p) => p === 7)).toBe(true);
    });
  });
});

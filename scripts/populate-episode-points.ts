import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function populateEpisodePoints() {
  console.log('Starting episode points population...');

  try {
    // Get all league seasons
    const leagueSeasons = await prisma.leagueSeason.findMany({
      include: {
        season: true,
        teams: {
          include: {
            roster: true,
            answers: {
              include: {
                leagueQuestion: true,
              },
            },
          },
        },
      },
    });

    console.log(`Found ${leagueSeasons.length} league seasons to process`);

    for (const leagueSeason of leagueSeasons) {
      const maxEpisode = leagueSeason.season.activeEpisode;

      console.log(
        `\nProcessing league season ${leagueSeason.id} (Season ${leagueSeason.season.number})`,
      );
      console.log(`Max episode: ${maxEpisode}`);
      console.log(`Teams: ${leagueSeason.teams.length}`);

      for (const team of leagueSeason.teams) {
        console.log(`  Calculating for team "${team.name}"...`);

        let runningTotal = 0;

        for (let ep = 1; ep <= maxEpisode; ep++) {
          // Calculate question points
          const answers = team.answers.filter(
            (a) => a.leagueQuestion.episodeNumber === ep && a.leagueQuestion.isScored,
          );

          const questionPoints = answers.reduce(
            (sum, a) => sum + (a.pointsEarned || 0),
            0,
          );

          // Get retention config for this episode
          const retentionConfig = await prisma.retentionConfig.findUnique({
            where: {
              leagueSeasonId_episodeNumber: {
                leagueSeasonId: leagueSeason.id,
                episodeNumber: ep,
              },
            },
          });

          // Count active castaways
          const activeCastaways = team.roster.filter(
            (tc) =>
              tc.startEpisode <= ep && (tc.endEpisode === null || tc.endEpisode >= ep),
          ).length;

          const retentionPoints =
            activeCastaways * (retentionConfig?.pointsPerCastaway || 0);

          const totalEpisodePoints = questionPoints + retentionPoints;
          runningTotal += totalEpisodePoints;

          // Upsert TeamEpisodePoints
          await prisma.teamEpisodePoints.upsert({
            where: {
              teamId_episodeNumber: {
                teamId: team.id,
                episodeNumber: ep,
              },
            },
            create: {
              teamId: team.id,
              episodeNumber: ep,
              questionPoints,
              retentionPoints,
              totalEpisodePoints,
              runningTotal,
            },
            update: {
              questionPoints,
              retentionPoints,
              totalEpisodePoints,
              runningTotal,
            },
          });
        }

        // Update team's total points
        await prisma.team.update({
          where: { id: team.id },
          data: { totalPoints: runningTotal },
        });

        console.log(`    ✓ Processed ${maxEpisode} episodes, total: ${runningTotal} points`);
      }
    }

    console.log('\n✓ Episode points population completed successfully!');
  } catch (error) {
    console.error('Error populating episode points:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
populateEpisodePoints()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

import { PrismaService } from '../../src/prisma/prisma.service';

let counter = 0;
function unique() {
  return ++counter;
}

export function resetCounter() {
  counter = 0;
}

export async function seedUser(
  prisma: PrismaService,
  overrides: Partial<{
    name: string;
    email: string;
    clerkId: string;
    systemRole: string;
  }> = {},
) {
  const n = unique();
  return prisma.user.create({
    data: {
      clerkId: overrides.clerkId ?? `clerk_test_${n}_${Date.now()}`,
      email: overrides.email ?? `testuser${n}@test.com`,
      name: overrides.name ?? `Test User ${n}`,
      systemRole: overrides.systemRole ?? 'user',
    },
  });
}

export async function seedSeason(
  prisma: PrismaService,
  opts: {
    episodeCount?: number;
    castawayCount?: number;
    activeEpisode?: number;
    seasonNumber?: number;
  } = {},
) {
  const {
    episodeCount = 14,
    castawayCount = 18,
    activeEpisode = 1,
    seasonNumber,
  } = opts;

  const n = unique();
  const season = await prisma.season.create({
    data: {
      number: seasonNumber ?? 100 + n,
      name: `Test Season ${n}`,
      status: 'ACTIVE',
      activeEpisode,
    },
  });

  // Create episodes with air dates in the past (so submissions are closed by default)
  const episodes = [];
  for (let i = 1; i <= episodeCount; i++) {
    const airDate = new Date();
    airDate.setDate(airDate.getDate() - (episodeCount - i + 1));
    const episode = await prisma.episode.create({
      data: {
        seasonId: season.id,
        number: i,
        title: `Episode ${i}`,
        airDate,
      },
    });
    episodes.push(episode);
  }

  // Create castaways
  const castaways = [];
  for (let i = 1; i <= castawayCount; i++) {
    const castaway = await prisma.castaway.create({
      data: {
        name: `Castaway ${n}-${i}`,
        seasonId: season.id,
        status: 'ACTIVE',
      },
    });
    castaways.push(castaway);
  }

  return { season, episodes, castaways };
}

export async function seedLeagueWithTeam(
  prisma: PrismaService,
  seasonId: string,
  user: { id: string; name?: string | null },
) {
  const n = unique();
  const league = await prisma.league.create({
    data: {
      name: `Test League ${n}`,
      slug: `test-league-${n}-${Date.now()}`,
      ownerId: user.id,
      members: { connect: { id: user.id } },
      commissioners: { connect: { id: user.id } },
    },
  });

  const leagueSeason = await prisma.leagueSeason.create({
    data: {
      leagueId: league.id,
      seasonId,
    },
  });

  const team = await prisma.team.create({
    data: {
      name: `${user.name || 'Owner'}'s Team`,
      leagueSeasonId: leagueSeason.id,
      ownerId: user.id,
      totalPoints: 0,
    },
  });

  return { league, leagueSeason, team };
}

export async function addMemberWithTeam(
  prisma: PrismaService,
  leagueId: string,
  leagueSeasonId: string,
  user: { id: string; name?: string | null },
) {
  await prisma.league.update({
    where: { id: leagueId },
    data: { members: { connect: { id: user.id } } },
  });

  const team = await prisma.team.create({
    data: {
      name: `${user.name || 'Member'}'s Team`,
      leagueSeasonId,
      ownerId: user.id,
      totalPoints: 0,
    },
  });

  return { team };
}

export async function seedRetentionConfig(
  prisma: PrismaService,
  leagueSeasonId: string,
  episodes: Array<{ episodeNumber: number; pointsPerCastaway: number }>,
) {
  const configs = [];
  for (const ep of episodes) {
    const config = await prisma.retentionConfig.create({
      data: {
        leagueSeasonId,
        episodeNumber: ep.episodeNumber,
        pointsPerCastaway: ep.pointsPerCastaway,
      },
    });
    configs.push(config);
  }
  return configs;
}

export async function seedDraftConfig(
  prisma: PrismaService,
  leagueSeasonId: string,
  castawaysPerTeam: number,
) {
  return prisma.draftConfig.create({
    data: {
      leagueSeasonId,
      roundNumber: 1,
      castawaysPerTeam,
      status: 'PENDING',
    },
  });
}

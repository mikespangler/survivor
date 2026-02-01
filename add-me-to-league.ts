import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const userId = '5d4d429d-40b4-4453-b628-ce960fbbdb26'; // spangler.mike@gmail.com
  const leagueId = 'cml2sp1pw001iity0m4ebyame'; // Survivor Superfans League

  // Check if already a member
  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    include: { members: true }
  });

  const isMember = league.members.some(m => m.id === userId);
  if (isMember) {
    console.log('✅ You are already a member of this league!');
    return;
  }

  // Find active season
  const activeSeason = await prisma.season.findFirst({
    where: { status: { in: ['ACTIVE', 'UPCOMING'] } },
    orderBy: { number: 'desc' }
  });

  if (!activeSeason) {
    console.log('❌ No active or upcoming season found');
    return;
  }

  // Add to league
  await prisma.$transaction(async (tx) => {
    // Add to members
    await tx.league.update({
      where: { id: leagueId },
      data: {
        members: { connect: { id: userId } }
      }
    });

    // Find or create league season
    let leagueSeason = await tx.leagueSeason.findUnique({
      where: {
        leagueId_seasonId: {
          leagueId,
          seasonId: activeSeason.id
        }
      }
    });

    if (!leagueSeason) {
      leagueSeason = await tx.leagueSeason.create({
        data: {
          leagueId,
          seasonId: activeSeason.id
        }
      });
    }

    // Create team
    const user = await tx.user.findUnique({ where: { id: userId } });
    const teamName = `${user.name || user.email.split('@')[0]}'s Team`;

    await tx.team.create({
      data: {
        name: teamName,
        leagueSeasonId: leagueSeason.id,
        ownerId: userId,
        totalPoints: 0
      }
    });
  });

  console.log('✅ Successfully added to Survivor Superfans League!');
  console.log('🏝️ Your team has been created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

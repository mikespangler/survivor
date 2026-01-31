import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script to add yourself to the seeded league
 *
 * Usage:
 *   ts-node prisma/add-user-to-league.ts <your-email> <your-name> <clerk-id>
 *
 * Example:
 *   ts-node prisma/add-user-to-league.ts "your.email@example.com" "Your Name" "user_2abc123xyz"
 */

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('❌ Error: Missing required arguments');
    console.log('\nUsage:');
    console.log('  ts-node prisma/add-user-to-league.ts <email> <name> [clerk-id]');
    console.log('\nExample:');
    console.log('  ts-node prisma/add-user-to-league.ts "mike@example.com" "Mike" "user_2abc123"');
    console.log('\nNote: If clerk-id is not provided, a temporary one will be generated.');
    process.exit(1);
  }

  const email = args[0];
  const name = args[1];
  const clerkId = args[2] || `clerk_manual_${Date.now()}`;

  console.log('🔍 Looking for the seeded league...');

  // Find the seeded league
  const league = await prisma.league.findFirst({
    where: {
      name: 'Survivor Superfans League',
    },
    include: {
      leagueSeasons: {
        include: {
          season: true,
        },
      },
    },
  });

  if (!league) {
    console.error('❌ Error: Could not find "Survivor Superfans League"');
    console.log('   Make sure you have run: npm run db:seed');
    process.exit(1);
  }

  console.log(`✓ Found league: ${league.name}`);

  // Check if user already exists
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    console.log(`✓ Found existing user: ${user.name} (${user.email})`);
  } else {
    console.log('👤 Creating new user...');
    user = await prisma.user.create({
      data: {
        clerkId,
        email,
        name,
        systemRole: 'user',
      },
    });
    console.log(`✓ Created user: ${user.name} (${user.email})`);
  }

  // Check if already a member
  const isMember = await prisma.league.findFirst({
    where: {
      id: league.id,
      OR: [
        { ownerId: user.id },
        { members: { some: { id: user.id } } },
      ],
    },
  });

  if (isMember) {
    console.log('✓ You are already a member of this league!');
  } else {
    console.log('🔗 Adding you to the league...');
    await prisma.league.update({
      where: { id: league.id },
      data: {
        members: {
          connect: { id: user.id },
        },
      },
    });
    console.log('✓ Added to league members');
  }

  // Find the active league season
  const leagueSeason = league.leagueSeasons.find(
    ls => ls.season.status === 'ACTIVE'
  );

  if (!leagueSeason) {
    console.log('⚠️  No active season found in this league');
    console.log('✅ Done! You can now view the league.');
    return;
  }

  // Check if user has a team
  const existingTeam = await prisma.team.findFirst({
    where: {
      leagueSeasonId: leagueSeason.id,
      ownerId: user.id,
    },
  });

  if (existingTeam) {
    console.log(`✓ You already have a team: ${existingTeam.name}`);
  } else {
    console.log('🏆 Creating a team for you...');

    // Generate a unique team name
    const teamName = `${name.split(' ')[0]}'s Team`;

    const team = await prisma.team.create({
      data: {
        name: teamName,
        leagueSeasonId: leagueSeason.id,
        ownerId: user.id,
        totalPoints: 0,
      },
    });

    console.log(`✓ Created team: ${team.name}`);
    console.log('   Note: Your team has no castaways yet. You can draft them in the app.');
  }

  console.log('\n✅ Success! You are now part of the league.');
  console.log(`\nLeague Details:`);
  console.log(`  Name: ${league.name}`);
  console.log(`  Season: ${leagueSeason.season.number} - ${leagueSeason.season.name}`);
  console.log(`  Your email: ${email}`);
  console.log('\n🎮 You can now view this league in the app!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

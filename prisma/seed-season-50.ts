import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const castawayNames = [
  // Vatu (Purple)
  'Colby Donaldson',
  'Genevieve Mushaluk',
  'Rizo Velovic',
  'Angelina Keeley',
  'Q Burdette',
  'Stephenie LaGrossa Kendrick',
  'Kyle Fraser',
  'Aubry Bracco',
  // Cila (Orange)
  'Joe Hunter',
  'Savannah Louie',
  'Christian Hubicki',
  'Cirie Fields',
  'Ozzy Lusth',
  'Emily Flippen',
  'Rick Devens',
  'Jenna Lewis-Dougherty',
  // Kalo (Teal)
  'Jonathan Young',
  'Dee Valladares',
  'Mike White',
  'Kamilla Karthigesu',
  'Charlie Davis',
  'Tiffany Ervin',
  'Coach Wade',
  'Chrissy Hofbeck',
];

async function main() {
  console.log('Seeding Season 50 castaways and episodes...');

  // Look up existing Season 50
  const season = await prisma.season.findUnique({
    where: { number: 50 },
  });

  if (!season) {
    throw new Error(
      'Season 50 not found in the database. Please create it first.',
    );
  }

  console.log(`Found Season 50: "${season.name}" (id: ${season.id})`);

  // Delete existing castaways and episodes for idempotent re-runs
  const deletedCastaways = await prisma.castaway.deleteMany({
    where: { seasonId: season.id },
  });
  const deletedEpisodes = await prisma.episode.deleteMany({
    where: { seasonId: season.id },
  });
  console.log(
    `Cleaned up ${deletedCastaways.count} existing castaways and ${deletedEpisodes.count} existing episodes`,
  );

  // Create 24 castaways
  console.log('Creating 24 castaways...');
  for (const name of castawayNames) {
    await prisma.castaway.create({
      data: {
        name,
        seasonId: season.id,
        status: 'ACTIVE',
      },
    });
  }

  // Create 14 episodes with weekly Wednesday air dates starting Feb 25, 2026
  console.log('Creating 14 episodes...');
  const premiereDate = new Date('2026-02-25T20:00:00-05:00'); // 8 PM ET
  for (let i = 1; i <= 14; i++) {
    const airDate = new Date(premiereDate);
    airDate.setDate(premiereDate.getDate() + (i - 1) * 7);

    await prisma.episode.create({
      data: {
        seasonId: season.id,
        number: i,
        airDate,
        title: i === 1 ? 'Premiere' : undefined,
      },
    });
  }

  console.log('Season 50 seed complete!');
  console.log(`  Castaways: ${castawayNames.length}`);
  console.log('  Episodes: 14');
}

main()
  .catch((e) => {
    console.error('Error seeding Season 50:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

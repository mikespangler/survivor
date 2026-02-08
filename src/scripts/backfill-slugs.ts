/**
 * One-time script to backfill slugs for existing leagues.
 * Run with: npx ts-node -r tsconfig-paths/register src/scripts/backfill-slugs.ts
 */
import { PrismaClient } from '@prisma/client';
import { generateSlug } from '../league/slug-generator';

const prisma = new PrismaClient();

async function main() {
  const leagues = await prisma.league.findMany({
    where: { slug: null },
    select: { id: true, name: true },
  });

  console.log(`Found ${leagues.length} leagues without slugs`);

  for (const league of leagues) {
    let slug: string | undefined;

    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = generateSlug();
      const existing = await prisma.league.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });
      if (!existing) {
        slug = candidate;
        break;
      }
    }

    if (!slug) {
      slug = `${generateSlug()}-${Date.now().toString(36).slice(-4)}`;
    }

    await prisma.league.update({
      where: { id: league.id },
      data: { slug },
    });

    console.log(`  ${league.name} -> ${slug}`);
  }

  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

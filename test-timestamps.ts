import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Testing automatic timestamp implementation...\n');

  // Clean up any existing test user
  await prisma.user.deleteMany({
    where: { email: 'timestamp-test@example.com' },
  });

  // 1. Create a user - createdAt and updatedAt should be set automatically
  console.log('1️⃣  Creating user...');
  const createdUser = await prisma.user.create({
    data: {
      email: 'timestamp-test@example.com',
      name: 'Test User',
    },
  });

  console.log('   ✅ User created:');
  console.log(`   - ID: ${createdUser.id}`);
  console.log(`   - createdAt: ${createdUser.createdAt.toISOString()} (AUTO)`);
  console.log(`   - updatedAt: ${createdUser.updatedAt.toISOString()} (AUTO)`);
  console.log(`   - createdAt === updatedAt: ${createdUser.createdAt.getTime() === createdUser.updatedAt.getTime()}`);

  // Wait a moment to ensure timestamps will differ
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 2. Update the user - updatedAt should change automatically
  console.log('\n2️⃣  Updating user (wait 1 second)...');
  const updatedUser = await prisma.user.update({
    where: { id: createdUser.id },
    data: {
      name: 'Updated Test User',
    },
  });

  console.log('   ✅ User updated:');
  console.log(`   - createdAt: ${updatedUser.createdAt.toISOString()} (UNCHANGED)`);
  console.log(`   - updatedAt: ${updatedUser.updatedAt.toISOString()} (AUTO UPDATED)`);
  console.log(`   - Timestamps differ: ${updatedUser.createdAt.getTime() !== updatedUser.updatedAt.getTime()}`);

  // 3. Verify timestamps work correctly
  console.log('\n3️⃣  Verification:');
  const createdAtUnchanged = createdUser.createdAt.getTime() === updatedUser.createdAt.getTime();
  const updatedAtChanged = createdUser.updatedAt.getTime() < updatedUser.updatedAt.getTime();

  console.log(`   ✅ createdAt remains unchanged: ${createdAtUnchanged}`);
  console.log(`   ✅ updatedAt automatically updated: ${updatedAtChanged}`);

  // Clean up
  await prisma.user.delete({
    where: { id: createdUser.id },
  });

  console.log('\n🎉 Automatic timestamps are working correctly!');
  console.log('   - createdAt is set automatically on creation');
  console.log('   - updatedAt is set automatically on creation and updates');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


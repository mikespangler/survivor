import { execSync } from 'child_process';

const TEST_DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5434/survivor_test';

export default async function globalSetup() {
  // Parse connection string to get base URL (without database name)
  const url = new URL(TEST_DATABASE_URL);
  const dbName = url.pathname.slice(1).split('?')[0]; // e.g. "survivor_test"
  url.pathname = '/postgres'; // connect to default db for admin commands
  const adminUrl = url.toString();

  // 1. Create the test database if it doesn't exist
  try {
    execSync(
      `psql "${adminUrl}" -tc "SELECT 1 FROM pg_database WHERE datname = '${dbName}'" | grep -q 1 || psql "${adminUrl}" -c "CREATE DATABASE ${dbName}"`,
      { stdio: 'pipe' },
    );
  } catch {
    // If psql isn't available, try via the Prisma-compatible approach
    // The database might already exist — that's fine
  }

  // 2. Push schema to the test database
  execSync(`npx prisma db push --skip-generate`, {
    stdio: 'pipe',
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
  });
}

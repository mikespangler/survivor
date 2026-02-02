import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // Default allows config to load when DATABASE_URL is not set (e.g. build or before Railway injects it).
    // At runtime, set DATABASE_URL (e.g. link Postgres on Railway) so migrate and app use the real DB.
    url: env("DATABASE_URL", "postgresql://localhost:5432/dummy"),
  },
});

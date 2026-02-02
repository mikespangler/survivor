import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // Use process.env directly with fallback - the env() helper throws if var is missing.
    // Railway injects DATABASE_URL at runtime; fallback used only during build/generate.
    url: process.env.DATABASE_URL ?? "postgresql://localhost:5432/dummy",
  },
});

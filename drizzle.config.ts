import { defineConfig } from "drizzle-kit";

const pgUrl = process.env.DATABASE_URL_PG;
const databaseUrl = pgUrl || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL (or DATABASE_URL_PG) is not set");
}

const isPostgres =
  databaseUrl.startsWith("postgres://") ||
  databaseUrl.startsWith("postgresql://");

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: isPostgres ? "postgresql" : "sqlite",
  dbCredentials: isPostgres
    ? {
        url: databaseUrl,
      }
    : {
        url: databaseUrl.startsWith("file:")
          ? databaseUrl.replace("file:", "")
          : databaseUrl,
      },
});

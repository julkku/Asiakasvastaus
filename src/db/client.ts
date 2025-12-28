import Database from "better-sqlite3";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";

import { env } from "@/env";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof createDb> | null = null;

function createDb() {
  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  if (
    databaseUrl.startsWith("postgres://") ||
    databaseUrl.startsWith("postgresql://")
  ) {
    const neonSql = neon(databaseUrl);
    const sqlCompat = ((first: any, second?: any, third?: any) => {
      if (typeof first === "string") {
        const query = first;
        const params = Array.isArray(second) ? second : [];
        const options = third;
        return (neonSql as any).query(query, params, options);
      }

      return (neonSql as any)(
        first,
        ...(Array.isArray(second) ? second : []),
      );
    }) as any;

    (sqlCompat as any).query = (neonSql as any).query?.bind(neonSql);
    (sqlCompat as any).transaction = (neonSql as any).transaction?.bind(
      neonSql,
    );

    return drizzleNeon(sqlCompat, { schema: schema as any });
  }

  if (env.NODE_ENV === "production" && process.env.VERCEL) {
    throw new Error(
      "Production DATABASE_URL must point to Postgres, not a file path.",
    );
  }

  const databasePath = databaseUrl.startsWith("file:")
    ? databaseUrl.replace("file:", "")
    : databaseUrl;
  const resolvedPath =
    databasePath.startsWith("./") || databasePath.startsWith("../")
      ? resolve(process.cwd(), databasePath)
      : databasePath;

  const sqlite = new Database(resolvedPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzleSqlite(sqlite, { schema });
}

export function getDb(): any {
  if (!dbInstance) {
    dbInstance = createDb();
  }
  return dbInstance;
}

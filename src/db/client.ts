import Database from "better-sqlite3";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";
import type { NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";

import { env } from "@/env";
import * as schema from "./schema";

type NeonSql = ReturnType<typeof neon>;
type SqlCompat = ((
  first: TemplateStringsArray | string,
  second?: unknown,
  third?: unknown,
) => ReturnType<NeonSql>) & {
  query?: NeonSql["query"];
  unsafe?: NeonSql["unsafe"];
};

export type DbClient = ReturnType<typeof drizzleSqlite<typeof schema>>;

let dbInstance: DbClient | null = null;

function createDb(): DbClient {
  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  if (
    databaseUrl.startsWith("postgres://") ||
    databaseUrl.startsWith("postgresql://")
  ) {
    const neonSql = neon(databaseUrl);
    const sqlCompat = ((
      first: TemplateStringsArray | string,
      second?: unknown,
      third?: unknown,
    ) => {
      if (typeof first === "string") {
        const query = first;
        const params = Array.isArray(second) ? second : [];
        return neonSql.query(
          query,
          params,
          third as Parameters<NonNullable<NeonSql["query"]>>[2],
        );
      }

      const values = Array.isArray(second) ? second : [];
      return (neonSql as unknown as (
        strings: TemplateStringsArray,
        ...params: unknown[]
      ) => ReturnType<NeonSql>)(first, ...values);
    }) as unknown as NeonQueryFunction<false, false> & SqlCompat;

    sqlCompat.query = neonSql.query?.bind(neonSql);
    sqlCompat.unsafe = neonSql.unsafe?.bind(neonSql);

    return drizzleNeon<typeof schema>(sqlCompat, {
      schema: schema as unknown as typeof schema,
    }) as unknown as DbClient;
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
  return drizzleSqlite<typeof schema>(sqlite, { schema }) as DbClient;
}

export function getDb(): DbClient {
  if (!dbInstance) {
    dbInstance = createDb() as DbClient;
  }
  return dbInstance;
}

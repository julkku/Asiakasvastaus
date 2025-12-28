import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { resolve } from "node:path";

import { env } from "@/env";
import * as schema from "./schema";

const databaseUrl = env.DATABASE_URL.startsWith("file:")
  ? env.DATABASE_URL.replace("file:", "")
  : env.DATABASE_URL;

const databasePath =
  databaseUrl.startsWith("./") || databaseUrl.startsWith("../")
    ? resolve(process.cwd(), databaseUrl)
    : databaseUrl;

const sqlite = new Database(databasePath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

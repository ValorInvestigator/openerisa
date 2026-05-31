import { createClient, type Client } from "@libsql/client";

// Single libSQL client reused across requests (server-only).
declare global {
  // eslint-disable-next-line no-var
  var __erisaDb: Client | undefined;
}

function make(): Client {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set");
  // file: URLs (local dev) take no token; libsql/Turso URLs do.
  return createClient(authToken ? { url, authToken } : { url });
}

export const db: Client = global.__erisaDb ?? make();
if (process.env.NODE_ENV !== "production") global.__erisaDb = db;

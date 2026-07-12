import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to connect to PostgreSQL.");
}

// One module-scope pool is reused by the shared Next.js runtime. Neon's pooled
// endpoint uses PgBouncer transaction mode, so protocol prepares are disabled.
const client = postgres(connectionString, {
  max: 5,
  idle_timeout: 20,
  connect_timeout: 15,
  prepare: false
});

export const db = drizzle(client, { schema });

export async function getDatabaseStatus() {
  const startedAt = performance.now();
  const rows = await client<{
    database: string;
    role: string;
    version: string;
  }[]>`
    select
      current_database() as database,
      current_user as role,
      version() as version
  `;
  const row = rows[0];
  if (!row) throw new Error("Database health query returned no rows.");

  return {
    connected: true as const,
    database: row.database,
    role: row.role,
    version: row.version.split(" on ")[0],
    latencyMs: Math.max(1, Math.round(performance.now() - startedAt))
  };
}

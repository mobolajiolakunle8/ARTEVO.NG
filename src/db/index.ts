import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * Vercel-safe database client.
 *
 * The pool is created lazily so that importing this module during the build
 * (page-data collection / static analysis) can never throw when DATABASE_URL
 * is not yet injected. A clear runtime error is raised only when a query is
 * actually attempted without a configured connection string.
 */
const globalForDb = globalThis as typeof globalThis & {
  __artevoPool?: Pool;
};

function createPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Add it in Vercel → Settings → Environment Variables."
    );
  }

  // Managed Postgres providers (Neon, Supabase, Vercel Postgres, Railway…)
  // terminate non-TLS connections. Enable SSL automatically in production.
  const needsSsl =
    process.env.NODE_ENV === "production" &&
    !/localhost|127\.0\.0\.1/.test(databaseUrl) &&
    !/sslmode=disable/.test(databaseUrl);

  return new Pool({
    connectionString: databaseUrl,
    ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    max: 5,
    idleTimeoutMillis: 15_000,
    connectionTimeoutMillis: 10_000,
  });
}

function getPool(): Pool {
  if (!globalForDb.__artevoPool) {
    globalForDb.__artevoPool = createPool();
  }
  return globalForDb.__artevoPool;
}

/** True when a database connection string is available. */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

// Lazy proxy: the pool is only instantiated on first property access.
export const pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const value = getPool()[prop as keyof Pool];
    return typeof value === "function" ? value.bind(getPool()) : value;
  },
});

type DrizzleClient = ReturnType<typeof drizzle>;

let dbInstance: DrizzleClient | undefined;

function getDb(): DrizzleClient {
  if (!dbInstance) {
    dbInstance = drizzle(getPool());
  }
  return dbInstance;
}

// Lazy proxy so `import { db }` never opens a connection at module load.
export const db = new Proxy({} as DrizzleClient, {
  get(_target, prop) {
    const client = getDb() as unknown as Record<string | symbol, unknown>;
    const value = client[prop];
    return typeof value === "function" ? (value as Function).bind(client) : value;
  },
});

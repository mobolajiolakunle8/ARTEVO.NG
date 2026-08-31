import { isDatabaseConfigured } from "./index";
import { seedDatabase } from "./seed";
import { ensureDatabaseSchema } from "./bootstrap";

let seedPromise: Promise<void> | null = null;

/**
 * Vercel-safe database initialisation.
 * - No-ops during builds without DATABASE_URL
 * - Creates missing tables on a fresh managed Postgres database
 * - Seeds only when the catalog is empty
 * - Shares one promise between concurrent cold-start requests
 */
export async function ensureDatabaseSeeded(): Promise<void> {
  if (!isDatabaseConfigured()) return;

  if (!seedPromise) {
    seedPromise = (async () => {
      await ensureDatabaseSchema();
      if (process.env.ARTEVO_SKIP_SEED !== "1") {
        await seedDatabase();
      }
    })().catch((error) => {
      console.error("[ARTÉVO] Database initialisation skipped:", error);
      seedPromise = null;
    });
  }

  await seedPromise;
}
